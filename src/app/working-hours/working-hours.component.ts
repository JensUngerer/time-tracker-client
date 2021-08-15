import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Duration } from 'luxon';

import { DateHelper } from '../../../../common/typescript/helpers/dateHelper';
import { CommitService } from '../commit.service';
import { IDateBoundaries, QueryDateComponent } from '../query-date/query-date.component';
import { QueryTimeBoundariesComponent } from '../query-time-boundaries/query-time-boundaries.component';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { Constants } from './../../../../common/typescript/constants';
import { ISessionTimeEntry } from './../../../../common/typescript/iSessionTimeEntry';

@Component({
  selector: 'mtt-working-hours',
  templateUrl: './working-hours.component.html',
  styleUrls: ['./working-hours.component.scss']
})
export class WorkingHoursComponent implements OnInit /*, AfterViewInit*/ {
  readonly START_TIME_CONTROL_PREFIX = 'cellStartTime';
  readonly END_TIME_CONTROL_PREFIX = 'cellEndTime';

  workingTimeTableFormGroup: FormGroup;

  requiredDateFormat = QueryDateComponent.requiredDateFormat;
  requiredDateTimeFormat = QueryTimeBoundariesComponent.requiredDateTimeFormat;

  // https://stackoverflow.com/questions/47908179/how-to-load-observable-array-property-as-angular-material-table-data-source
  // https://material.angular.io/components/table/overview
  faTrash = faTrash;
  faCheck = faCheck;
  currentDay: Date;

  isWorkingTimeTableVisible = false;

  rowToApplyButtonDisabled: boolean[] = [];

  parsedWorkingTimeDocs: ISessionTimeEntry[] = [];
  displayedColumns = ['startTime', 'durationInMilliseconds', 'endTime', 'applyButton', 'deleteButton'];
  workingHoursDataSource: MatTableDataSource<ISessionTimeEntry>;// = new MatTableDataSource(this.debuggingLines);
  constructor(@Inject(LOCALE_ID) public currentLocale,
    private commitService: CommitService,
    private sessionStorageSerializationService: SessionStorageSerializationService) { }

  isRowDisabled(rowIndex: number) {
    if (!this.workingTimeTableFormGroup ||
      !this.workingTimeTableFormGroup.controls) {
      console.error('no form group');
      return;
    }
    const startControl = this.workingTimeTableFormGroup.controls[this.START_TIME_CONTROL_PREFIX + rowIndex];
    const isStartControlInValid = startControl.invalid;

    const endControl = this.workingTimeTableFormGroup.controls[this.END_TIME_CONTROL_PREFIX + rowIndex];
    const isEndControlInValid = endControl.invalid;

    return isStartControlInValid || isEndControlInValid || this.rowToApplyButtonDisabled[rowIndex];
  }

  private initializeFormGroup() {
    const configObj: { [key: string]: AbstractControl } = {};

    this.parsedWorkingTimeDocs.forEach((oneLine, rowIndex) => {
      let startTime: string = formatDate(oneLine.startTime, QueryTimeBoundariesComponent.requiredDateTimeFormat, this.currentLocale);;
      const startTimeControl = new FormControl(startTime);
      configObj[this.START_TIME_CONTROL_PREFIX + rowIndex] = startTimeControl;

      let endTime: string = formatDate(oneLine.endTime, QueryTimeBoundariesComponent.requiredDateTimeFormat, this.currentLocale);;
      const endTimeControl = new FormControl(endTime);
      configObj[this.END_TIME_CONTROL_PREFIX + rowIndex] = endTimeControl;

      startTimeControl.setValidators(QueryTimeBoundariesComponent.createStartTimeValidatorFn(endTimeControl));
      endTimeControl.setValidators(QueryTimeBoundariesComponent.createEndTimeValidatorFn(startTimeControl));

      this.rowToApplyButtonDisabled.push(true);
    });

    this.workingTimeTableFormGroup = new FormGroup(configObj);
  }

  ngOnInit(): void {

  }

  getDurationStr(element: ISessionTimeEntry) {
    return Duration.fromObject(element.durationInMilliseconds).toFormat(Constants.contextDurationFormat);
  }

  private initializeTableViaHttpGetResponse(selectedDay: Date) {
    const docsPromise = this.commitService.getWorkingTimeEntries(selectedDay);
    docsPromise.then((rawWorkingTimeEntries: string) => {
      if (!rawWorkingTimeEntries) {
        console.error('no raw working-time-entries received');
        return;
      }
      const parsedWorkingTimeDocs: ISessionTimeEntry[] = this.sessionStorageSerializationService.deSerialize(rawWorkingTimeEntries);
      if (!parsedWorkingTimeDocs ||
        !parsedWorkingTimeDocs.length) {
        console.error('no parsed working-time-entries received');
        return;
      }
      this.parsedWorkingTimeDocs = parsedWorkingTimeDocs;
      this.workingHoursDataSource = new MatTableDataSource(this.parsedWorkingTimeDocs);

      this.initializeFormGroup();

      // draw table (via adding its DOM node) !!!
      this.isWorkingTimeTableVisible = true;
    });
    docsPromise.catch((httpGetErr: any) => {
      console.error(httpGetErr);

      this.isWorkingTimeTableVisible = false;
    });
  }

  onQueryDateBoundaries($event: IDateBoundaries) {
    this.currentDay = $event.day;

    this.initializeTableViaHttpGetResponse(this.currentDay);
  }

  onApplyButtonClicked(rowIndex: number, line: ISessionTimeEntry) {
    this.rowToApplyButtonDisabled[rowIndex] = true;

    // TODO: implement
  }

  onStartTimeChange($event: string, line: ISessionTimeEntry, rowIndex: number) {
    const startTimeControl = this.workingTimeTableFormGroup.controls[this.START_TIME_CONTROL_PREFIX + rowIndex];
    if (!startTimeControl || startTimeControl.invalid) {
      console.error('cannot change start time');
      return;
    }

    const startTime = new Date($event);
    // const utcStartTime = DateHelper.convertToUtc(startTime);

    line.startTime = startTime;
    this.setDurationObjectIn(line, rowIndex);
  }

  private setDurationObjectIn(line: ISessionTimeEntry, rowIndex: number) {
    if (!line ||
      !line.endTime ||
      !line.startTime) {
      console.error('cannot set duration');
      return;
    }
    const rawDuration = line.endTime.getTime() - line.startTime.getTime();
    let duration = Duration.fromMillis(rawDuration);
    duration = duration.shiftTo(...Constants.shiftToParameter);

    line.durationInMilliseconds = duration.toObject();

    // enable apply button (in order to send UPDATE to mongodb (via server))
    this.rowToApplyButtonDisabled[rowIndex] = false;
  }

  onEndTimeChange($event: string, line: ISessionTimeEntry, rowIndex: number) {
    const endTimeControl = this.workingTimeTableFormGroup.controls[this.END_TIME_CONTROL_PREFIX + rowIndex];
    if (!endTimeControl ||
      endTimeControl.invalid) {
      console.error('cannot change end time');
      return;
    }

    const endTime = new Date($event);
    // const utcEndTime = DateHelper.convertToUtc(endTime);

    line.endTime = endTime;
    this.setDurationObjectIn(line, rowIndex);
  }
}


