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
import { AbstractControl, NgForm, ValidationErrors, ValidatorFn } from '@angular/forms';

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
export class WorkingHoursComponent implements OnInit, AfterViewInit {
  @ViewChildren('workingTimeLineForm') lineForm: QueryList<NgForm>;

  // static requiredTimeFormat = 'HH:mm';
  // requiredTimeFormat = WorkingHoursComponent.requiredTimeFormat;

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

  ngAfterViewInit(): void {
    this.initializeValidators();
  }

  initializeValidators() {
    let rowIndex = 0;
    for (const oneLineForm of this.lineForm.toArray()) {
      const startTimeCell = oneLineForm.controls['cellStartTime' + rowIndex];
      const endTimeCell = oneLineForm.controls['cellEndTime' + rowIndex];

      startTimeCell.setValidators(QueryTimeBoundariesComponent.createStartTimeValidatorFn(endTimeCell));
      endTimeCell.setValidators(QueryTimeBoundariesComponent.createStartTimeValidatorFn(startTimeCell));
      rowIndex++;
    }
  }

  ngOnInit(): void {
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
    dateTime = dateTime.plus({hours, minutes});

    // // dateTime = dateTime.toUTC();

    return dateTime.toJSDate();
    // return newDate;
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


