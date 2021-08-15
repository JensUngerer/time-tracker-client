import { AfterViewInit, Component, ElementRef, Inject, LOCALE_ID, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DateTime, Duration, DurationObject } from 'luxon';
import { Constants } from './../../../../common/typescript/constants';
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ISessionTimeEntry } from './../../../../common/typescript/iSessionTimeEntry';
import { DurationCalculator } from '../../../../common/typescript/helpers/durationCalculator';
import { IDateBoundaries, QueryDateComponent } from '../query-date/query-date.component';
import { DateHelper } from '../../../../common/typescript/helpers/dateHelper';
import { QueryTimeBoundariesComponent } from '../query-time-boundaries/query-time-boundaries.component';
import { AbstractControl, FormControl, FormGroup, NgForm, ValidationErrors, ValidatorFn } from '@angular/forms';
import { formatDate } from '@angular/common';

// TEMPORARY !!!
export interface IWorkingHoursLine extends ISessionTimeEntry {
  // sessionTimeEntryId: string;
  // day: Date;
  // startTime: Date;
  // duration: DurationObject;
  // endTime: Date,
  applyButton: string;
  deleteButton: string;
}

// function startTimeSmallerEndTimeValidatorFn(startTimeSmallerEndTimeValidatorFn: any) {
//   throw new Error('Function not implemented.');
// }

@Component({
  selector: 'mtt-working-hours',
  templateUrl: './working-hours.component.html',
  styleUrls: ['./working-hours.component.scss']
})
export class WorkingHoursComponent implements OnInit /*, AfterViewInit*/ {
  readonly START_TIME_CONTROL_PREFIX = 'cellStartTime';
  readonly END_TIME_CONTROL_PREFIX = 'cellEndTime';

  // @ViewChildren('workingTimeLine') workingTimeLines: QueryList<NgForm>;

  // static requiredTimeFormat = 'HH:mm';
  // requiredTimeFormat = WorkingHoursComponent.requiredTimeFormat;
  workingTimeTableFormGroup: FormGroup;

  requiredDateFormat = QueryDateComponent.requiredDateFormat;
  requiredDateTimeFormat = QueryTimeBoundariesComponent.requiredDateTimeFormat;

  // WorkingHoursComponent = WorkingHoursComponent;
  // QueryDateComponent = QueryDateComponent;
  // https://stackoverflow.com/questions/47908179/how-to-load-observable-array-property-as-angular-material-table-data-source
  // https://material.angular.io/components/table/overview
  // Duration = Duration;
  // DateTime = DateTime;
  // Constants = Constants;
  faTrash = faTrash;
  faCheck = faCheck;
  currentDay: Date;

  isWorkingTimeTableVisible = false;

  debuggingLines: IWorkingHoursLine[] = [
    {
      timeEntryId: '',
      day: DurationCalculator.getDayFrom(new Date()),
      startTime: new Date(),
      durationInMilliseconds: {},
      endTime: new Date(),
      applyButton: '',
      deleteButton: ''
    }
  ];
  displayedColumns = ['startTime', 'durationInMilliseconds', 'endTime', 'applyButton', 'deleteButton'];
  workingHoursDataSource: MatTableDataSource<IWorkingHoursLine> = new MatTableDataSource(this.debuggingLines);
  constructor(@Inject(LOCALE_ID) public currentLocale) { }

  // ngAfterViewInit(): void {
  //   this.initializeValidators();
  // }

  // initializeValidators() {
  //   let rowIndex = 0;
  //   for (const oneLineForm of this.workingTimeLines.toArray()) {
  //     // const startTimeCell = oneLineForm.controls['cellStartTime' + rowIndex];
  //     // const endTimeCell = oneLineForm.controls['cellEndTime' + rowIndex];

  //     // startTimeCell.setValidators(QueryTimeBoundariesComponent.createStartTimeValidatorFn(endTimeCell));
  //     // endTimeCell.setValidators(QueryTimeBoundariesComponent.createStartTimeValidatorFn(startTimeCell));
  //     // rowIndex++;

  //     // DEBUGGING:
  //     var controlKeys = Object.keys(oneLineForm.controls);
  //     console.log(JSON.stringify(controlKeys, null, 4));
  //   }
  // }

  isRowDisabled(rowIndex: number) {
    // TODO: implement

    if (!this.workingTimeTableFormGroup ||
      !this.workingTimeTableFormGroup.controls) {
      console.error('no form group');
      return;
    }
    // var controlKeys = Object.keys(this.workingTimeTableFormGroup.controls);
    // console.log(JSON.stringify(controlKeys, null, 4));
    const startControl = this.workingTimeTableFormGroup.controls[this.START_TIME_CONTROL_PREFIX + rowIndex];
    var isStartControlInValid = startControl.invalid;

    const endControl = this.workingTimeTableFormGroup.controls[this.END_TIME_CONTROL_PREFIX + rowIndex];
    var isEndControlInValid = endControl.invalid;

    return isStartControlInValid || isEndControlInValid;
  }

  ngOnInit(): void {
    const configObj: { [key: string]: AbstractControl } = {};

    this.debuggingLines.forEach((oneLine, rowIndex) => {
      let startTime: string = formatDate(oneLine.startTime, QueryTimeBoundariesComponent.requiredDateTimeFormat, this.currentLocale);;
      const startTimeControl = new FormControl(startTime);
      configObj[this.START_TIME_CONTROL_PREFIX + rowIndex] = startTimeControl;

      let endTime: string = formatDate(oneLine.endTime, QueryTimeBoundariesComponent.requiredDateTimeFormat, this.currentLocale);;
      const endTimeControl = new FormControl(endTime);
      configObj[this.END_TIME_CONTROL_PREFIX + rowIndex] = endTimeControl;

      startTimeControl.setValidators(QueryTimeBoundariesComponent.createStartTimeValidatorFn(endTimeControl));
      endTimeControl.setValidators(QueryTimeBoundariesComponent.createStartTimeValidatorFn(startTimeControl));
    });

    this.workingTimeTableFormGroup = new FormGroup(configObj);

    this.isWorkingTimeTableVisible = true;
  }

  getDurationStr(element: IWorkingHoursLine) {
    return Duration.fromObject(element.durationInMilliseconds).toFormat(Constants.contextDurationFormat);
  }

  onQueryDateBoundaries($event: IDateBoundaries) {
    this.currentDay = $event.day;
  }

  private timeToDateObject(day: Date, time: string): Date {
    let dateTime = DateTime.fromJSDate(day);
    console.log(this.currentLocale);
    dateTime = dateTime.setLocale(this.currentLocale).toLocal();
    // dateTime = dateTime.toLocal();
    // const newDate = new Date();
    // newDate.setMinutes(day.getMinutes() - day.getTimezoneOffset())
    const split = time.split(':');
    if (split.length < 2) {
      return new Date();
    }
    const hoursStr = split[0];
    const minutesStr = split[1];
    const hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);
    // newDate.setHours(newDate.getHours() + hours);
    // newDate.setMinutes(newDate.getMinutes() + minutes);
    dateTime = dateTime.plus({ hours, minutes });

    // // dateTime = dateTime.toUTC();

    return dateTime.toJSDate();
    // return newDate;
  }

  onApplyButtonClicked(rowIndex: number, line: IWorkingHoursLine) {
    console.log(rowIndex);
    console.log(line);
  }

  onStartTimeChange($event: string, line: IWorkingHoursLine, rowIndex: number) {
    console.log($event);
    const startTime = new Date($event);
    console.log(startTime);
    const utcStartTime = DateHelper.convertToUtc(startTime);
    console.log(utcStartTime);
  }
  onEndTimeChange($event: string, line: IWorkingHoursLine, rowIndex: number) {
    console.log($event);
    const endTime = new Date($event);
    console.log(endTime);
    const utcEndTime = DateHelper.convertToUtc(endTime);
    console.log(utcEndTime);
  }
}


