import { formatDate } from '@angular/common';
import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { Constants } from '../../../../common/typescript/constants';
import { ITimeInterval } from '../../../../common/typescript/iTimeInterval';

import { SessionStorageService } from '../session-storage.service';
import { TimeEntryHelperService } from '../time-entry-helper.service';

import { DateHelper } from './../../../../common/typescript/helpers/dateHelper';

@Component({
  selector: 'mtt-query-time-boundaries',
  templateUrl: './query-time-boundaries.component.html',
  styleUrls: ['./query-time-boundaries.component.scss']
})
export class QueryTimeBoundariesComponent implements OnInit {
  static requiredDateTimeFormat = "yyyy-MM-ddTHH:mm";

  queryTimeStartFormControlName = 'theQueryStartTime';
  queryTimeEndFormControlName = 'theQueryEndTime';

  queryTimeFormGroup: FormGroup;

  @Input()
  showTableIcon = false;

  @Input()
  showChartIcon = false;

  @Input()
  showContextIcon = false;

  @Output()
  queryTimeBoundaries: EventEmitter<ITimeInterval> = new EventEmitter();

  constructor(@Inject(LOCALE_ID) private currentLocale,
    private sessionsStorageService: SessionStorageService,
    private timeEntryHelperService: TimeEntryHelperService) {
  }

  private getStoredDataFromStorage() {
    // get stored data from storage
    let statisticsTimeBoundaries: ITimeInterval = null;
    const storedData = this.sessionsStorageService.get();
    if (storedData && storedData.statisticsTimeBoundaries) {
      statisticsTimeBoundaries = storedData.statisticsTimeBoundaries;
    }
    return statisticsTimeBoundaries;
  }

  private initializeTimeBoundariesQuery() {
    const statisticsTimeBoundaries = this.getStoredDataFromStorage();

    const configObj: { [key: string]: AbstractControl } = {};
    // https://stackoverflow.com/questions/35144821/angular-use-pipes-in-services-and-components
    // https://stackoverflow.com/questions/46715543/how-to-bind-date-time-form-control
    // https://stackoverflow.com/questions/50362854/how-to-change-time-from-24-to-12-hour-format-in-angular-5
    // const cestOffset = "UTC+2";
    let startTime: string = null;
    let endTime: string = null;
    if (!statisticsTimeBoundaries) {
      const formattedCurrentTime = this.timeEntryHelperService.getCurrentTime();
      startTime = formattedCurrentTime;
      endTime = formattedCurrentTime;
    } else {
      startTime = this.timeEntryHelperService.formatDate(statisticsTimeBoundaries.utcStartTime);
      endTime = this.timeEntryHelperService.formatDate(statisticsTimeBoundaries.utcEndTime);
    }

    const startTimeControl = new FormControl(startTime);
    const endTimeControl = new FormControl(endTime);

    startTimeControl.setValidators(QueryTimeBoundariesComponent.createStartTimeValidatorFn(endTimeControl));

    endTimeControl.setValidators(QueryTimeBoundariesComponent.createEndTimeValidatorFn(startTimeControl))

    configObj[this.queryTimeEndFormControlName] = endTimeControl;

    configObj[this.queryTimeStartFormControlName] = startTimeControl;

    this.queryTimeFormGroup = new FormGroup(configObj);
  }

  public static createEndTimeValidatorFn(startTimeControl: AbstractControl) {
    return (endTimeControl: AbstractControl): ValidationErrors => {
      endTimeControl.setErrors(null);

      const endTimeValue = new Date(endTimeControl.value);
      const startTimeValue = new Date(startTimeControl.value);
      if (endTimeValue < startTimeValue) {
        startTimeControl.setErrors({ startTimeIsLaterThanEnd: true });
      } else {
        startTimeControl.setErrors(null);
      }
      return endTimeControl.errors;
    };
  }

  public static createStartTimeValidatorFn(endTimeControl: AbstractControl) {
    return (startTimeControl: AbstractControl): ValidationErrors => {
      startTimeControl.setErrors(null);

      const startTimeValue = new Date(startTimeControl.value);
      const endTimeValue = new Date(endTimeControl.value);
      if (endTimeValue < startTimeValue) {
        endTimeControl.setErrors({ endTimeIsEarlierThanStart: true });
      } else {
        endTimeControl.setErrors(null);
      }
      return startTimeControl.errors;
    };
  }

  ngOnInit(): void {
    this.initializeTimeBoundariesQuery();
  }

  onQueryTime($event: any) {
    const startTime = new Date($event[this.queryTimeStartFormControlName]);
    const utcStartTime = DateHelper.convertToUtc(startTime);
    const endTime = new Date($event[this.queryTimeEndFormControlName]);
    const utcEndTime = DateHelper.convertToUtc(endTime);

    const outputEventData: ITimeInterval = {
      utcStartTime,
      utcEndTime
    };
    this.sessionsStorageService.set({
      statisticsTimeBoundaries: outputEventData
    });
    this.queryTimeBoundaries.emit(outputEventData);
  }

  setToCurrentTime(formName: string) {
    const formattedCurrentTime = this.timeEntryHelperService.getCurrentTime();
    this.queryTimeFormGroup.controls[formName].setValue(formattedCurrentTime);
  }

  overwriteOtherValue(sourceFormName: string, targetFormName: string) {
    const sourceControl = this.queryTimeFormGroup.controls[sourceFormName];
    const sourceValue = sourceControl.value;
    const targetControl = this.queryTimeFormGroup.controls[targetFormName];
    targetControl.setValue(sourceValue);
  }
}
