import { formatDate } from '@angular/common';
import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Duration } from 'luxon';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { Constants } from '../../../../common/typescript/constants';
import { ITimeEntryBase } from '../../../../common/typescript/iTimeEntry';
import { DurationVisualizationService } from '../duration-visualization.service';
import { QueryDateComponent } from '../query-date/query-date.component';
import { QueryTimeBoundariesComponent } from '../query-time-boundaries/query-time-boundaries.component';

@Component({
  selector: 'mtt-dynamic-time-entries-table',
  templateUrl: './dynamic-time-entries-table.component.html',
  styleUrls: ['./dynamic-time-entries-table.component.scss']
})
export class DynamicTimeEntriesTableComponent implements OnInit, OnDestroy {
  @Output()
  timeEntryChanged: EventEmitter<ITimeEntryBase> = new EventEmitter();

  isVisible = false;
  dataSource: MatTableDataSource<ITimeEntryBase>;
  displayedColumns = ['startTime', 'durationInMilliseconds', 'endTime', 'applyButton', 'deleteButton'];
  readonly START_TIME_CONTROL_PREFIX = 'cellStartTime';
  readonly END_TIME_CONTROL_PREFIX = 'cellEndTime';

  // https://stackoverflow.com/questions/47908179/how-to-load-observable-array-property-as-angular-material-table-data-source
  // https://material.angular.io/components/table/overview
  faTrash = faTrash;
  faCheck = faCheck;
  tableFormGroup: FormGroup;
  workingHoursDataSource: MatTableDataSource<ITimeEntryBase>;// = new MatTableDataSource(this.debuggingLines);

  requiredDateFormat = QueryDateComponent.requiredDateFormat;
  requiredDateTimeFormat = QueryTimeBoundariesComponent.requiredDateTimeFormat;
  rowToApplyButtonDisabled: boolean[] = [];

  private internalTimeEntries: ITimeEntryBase[] = [];

  @Input()
  get timeEntries(): ITimeEntryBase[] {
    return this.internalTimeEntries;
  }
  set timeEntries(newValue: ITimeEntryBase[]) {
    this.isVisible = false;
    this.dataSource = new MatTableDataSource(newValue);

    this.initializeFormGroup();
    this.initializeFormGroupChangeSubscriptions();
    this.getDurationSumStr = this.durationVisualizationService.createDurationSumStringFn(this.internalTimeEntries);
    this.isVisible = true;
  }
  private onDestroy$: Subject<boolean> = new Subject<boolean>();

  constructor(@Inject(LOCALE_ID) public currentLocale,
    private durationVisualizationService: DurationVisualizationService) { }

  private initializeFormGroup() {
    const configObj: { [key: string]: AbstractControl } = {};

    this.internalTimeEntries.forEach((oneLine, rowIndex) => {
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

    this.tableFormGroup = new FormGroup(configObj);
  }

  getDurationSumStr: () => string = () => { return ''; };
  getDurationStr = this.durationVisualizationService.getDurationStr;

  // https://stackoverflow.com/questions/53396839/angular-form-change-event-with-material-components

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
    const numberOfLines = this.internalTimeEntries.length;
    for (let rowIndex = 0; rowIndex < numberOfLines; rowIndex++) {
      const controlUniqueIdentifier = this.START_TIME_CONTROL_PREFIX + rowIndex;
      const startControl = this.tableFormGroup.controls[controlUniqueIdentifier];
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
      const endControl = this.tableFormGroup.controls[controlUniqueIdentifier];
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
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
  }

  isRowDisabled(rowIndex: number) {
    if (!this.tableFormGroup ||
      !this.tableFormGroup.controls) {
      console.error('no form group');
      return;
    }
    const startControl = this.tableFormGroup.controls[this.START_TIME_CONTROL_PREFIX + rowIndex];
    const isStartControlInValid = startControl.invalid;

    const endControl = this.tableFormGroup.controls[this.END_TIME_CONTROL_PREFIX + rowIndex];
    const isEndControlInValid = endControl.invalid;

    return isStartControlInValid || isEndControlInValid || this.rowToApplyButtonDisabled[rowIndex];
  }

  onApplyButtonClicked(rowIndex: number) {
    this.rowToApplyButtonDisabled[rowIndex] = true;

    // DEBUGGING:
    const line = this.internalTimeEntries[rowIndex];
    console.log(JSON.stringify(line, null, 4));

    this.timeEntryChanged.emit(line);
  }

  onStartTimeChange($event: string, rowIndex: number) {
    const line: ITimeEntryBase = this.internalTimeEntries[rowIndex];
    const startTimeControl = this.tableFormGroup.controls[this.START_TIME_CONTROL_PREFIX + rowIndex];
    if (!startTimeControl || startTimeControl.invalid) {
      console.error('cannot change start time');
      return;
    }
    if (!startTimeControl.dirty) {
      console.error('start time is not dirty');
      return;
    }

    const startTime = new Date($event);

    if (line.endTime < startTime) {
      console.error('endTime < startTime');
      return;
    }
    line.startTime = startTime;

    this.setDurationObjectIn(line, rowIndex);
  }

  private setDurationObjectIn(line: ITimeEntryBase, rowIndex: number) {
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
    const line: ITimeEntryBase = this.internalTimeEntries[rowIndex];
    const endTimeControl = this.tableFormGroup.controls[this.END_TIME_CONTROL_PREFIX + rowIndex];
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
    if (endTime < line.startTime) {
      console.error('endTime < startTime');
      return;
    }

    line.endTime = endTime;
    this.setDurationObjectIn(line, rowIndex);
  }
}
