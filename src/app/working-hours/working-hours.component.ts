import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Duration } from 'luxon';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

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
export class WorkingHoursComponent implements OnInit, OnDestroy {
  readonly START_TIME_CONTROL_PREFIX = 'cellStartTime';
  readonly END_TIME_CONTROL_PREFIX = 'cellEndTime';

  private onDestroy$: Subject<boolean> = new Subject<boolean>();

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

  ngOnDestroy(): void {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

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
    if (!element ||
      !element.durationInMilliseconds) {
      return '';
    }
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
      this.initializeFormGroupChangeSubscriptions();

      // draw table (via adding its DOM node) !!!
      this.isWorkingTimeTableVisible = true;
    });
    docsPromise.catch((httpGetErr: any) => {
      console.error(httpGetErr);

      this.isWorkingTimeTableVisible = false;
    });
  }

  // https://stackoverflow.com/questions/53396839/angular-form-change-event-with-material-components
  // private onTableValueChanges(newDateValue: string) {

  // }
  private wrapOnStartTimeChanged(rowIndex: number) {
    return (newStartTimeDate: string) => {
      this.onStartTimeChange(newStartTimeDate, rowIndex);
    };
  }

  private wrapOnEndTimeChanged(rowIndex: number) {
    return (newEndTimeDate: string) => {
      this.onEndTimeChange(newEndTimeDate, rowIndex);
    };
  }

  initializeFormGroupChangeSubscriptions() {
    const numberOfLines = this.parsedWorkingTimeDocs.length;
    for (let rowIndex = 0; rowIndex < numberOfLines; rowIndex++) {
      const controlUniqueIdentifier = this.START_TIME_CONTROL_PREFIX + rowIndex;
      const startControl = this.workingTimeTableFormGroup.controls[controlUniqueIdentifier];
      if (!startControl) {
        console.error('no: ' + controlUniqueIdentifier);
        continue;
      }
      const startControlChange$ = startControl.valueChanges;
      if (!startControlChange$) {
        console.error('no: ' + controlUniqueIdentifier + ' valueChanges');
        continue;
      }
      startControlChange$
        .pipe(tap(this.wrapOnStartTimeChanged(rowIndex).bind(this)))
        .pipe(takeUntil(this.onDestroy$))
        .subscribe();
    }
    for (let rowIndex = 0; rowIndex < numberOfLines; rowIndex++) {
      const controlUniqueIdentifier = this.END_TIME_CONTROL_PREFIX + rowIndex;
      const endControl = this.workingTimeTableFormGroup.controls[controlUniqueIdentifier];
      if (!endControl) {
        console.error('no: ' + controlUniqueIdentifier);
        continue;
      }
      const endControlChange$ = endControl.valueChanges;
      if (!endControlChange$) {
        console.error('no: ' + controlUniqueIdentifier + ' valueChanges');
        continue;
      }
      endControlChange$
        .pipe(tap(this.wrapOnEndTimeChanged(rowIndex).bind(this)))
        .pipe(takeUntil(this.onDestroy$))
        .subscribe();
    }
    // https://stackoverflow.com/questions/53396839/angular-form-change-event-with-material-components
    // const valueChanges$ = this.workingTimeTableFormGroup.valueChanges;
    // valueChanges$
    // .pipe(tap(this.onTableValueChanges.bind(this)))
    // .pipe(takeUntil(this.onDestroy$))
    // .subscribe();
  }

  onQueryDateBoundaries($event: IDateBoundaries) {
    this.currentDay = $event.day;

    this.initializeTableViaHttpGetResponse(this.currentDay);
  }

  onApplyButtonClicked(rowIndex: number) {
    this.rowToApplyButtonDisabled[rowIndex] = true;

    // DEBUGGING:
    const line = this.parsedWorkingTimeDocs[rowIndex];
    console.log(JSON.stringify(line, null, 4));

    const patchPromise = this.commitService.patchWorkingTimeEntry(line);
    patchPromise.then((patchResult: any) => {
      // DEBUGGING:
      console.log(JSON.stringify(patchResult, null, 4));
    });
    patchPromise.catch((patchErr: any) => {
      console.error(JSON.stringify(patchErr, null, 4));
    });
  }

  onStartTimeChange($event: string, rowIndex: number) {
    const line: ISessionTimeEntry = this.parsedWorkingTimeDocs[rowIndex];
    const startTimeControl = this.workingTimeTableFormGroup.controls[this.START_TIME_CONTROL_PREFIX + rowIndex];
    if (!startTimeControl || startTimeControl.invalid) {
      console.error('cannot change start time');
      return;
    }
    if (!startTimeControl.dirty) {
      console.error('start time is not dirty');
      return;
    }

    const startTime = new Date($event);
    // const utcStartTime = DateHelper.convertToUtc(startTime);

    if (line.endTime < startTime) {
      console.error('endTime < startTime');
      return;
    }
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

    // refresh table ? TODO?
    // this.workingHoursDataSource.data = this.parsedWorkingTimeDocs;

    // enable apply button (in order to send UPDATE to mongodb (via server))
    this.rowToApplyButtonDisabled[rowIndex] = false;
  }

  onEndTimeChange($event: string, rowIndex: number) {
    const line: ISessionTimeEntry = this.parsedWorkingTimeDocs[rowIndex];
    const endTimeControl = this.workingTimeTableFormGroup.controls[this.END_TIME_CONTROL_PREFIX + rowIndex];
    if (!endTimeControl ||
      endTimeControl.invalid) {
      console.error('cannot change end time');
      return;
    }
    if (!endTimeControl.dirty) {
      console.error('end time is not dirty');
      return;
    }

    const endTime = new Date($event);
    // const utcEndTime = DateHelper.convertToUtc(endTime);
    if (endTime < line.startTime) {
      console.error('endTime < startTime');
      return;
    }

    line.endTime = endTime;
    this.setDurationObjectIn(line, rowIndex);
  }
}


