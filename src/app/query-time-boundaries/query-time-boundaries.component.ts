import { formatDate } from '@angular/common';
import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { ITimeInterval } from '../../../../common/typescript/iTimeInterval';

import { SessionStorageService } from '../session-storage.service';

@Component({
  selector: 'mtt-query-time-boundaries',
  templateUrl: './query-time-boundaries.component.html',
  styleUrls: ['./query-time-boundaries.component.scss']
})
export class QueryTimeBoundariesComponent implements OnInit {
  private readonly requiredDateTimeFormat = "yyyy-MM-ddTHH:mm";

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
    private sessionsStorageService: SessionStorageService) {
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

  private getCurrentTime(): string {
    const currentTime = Date.now();
    const formattedCurrentTime = formatDate(currentTime, this.requiredDateTimeFormat, this.currentLocale);
    return formattedCurrentTime;
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
      const formattedCurrentTime = this.getCurrentTime();
      startTime = formattedCurrentTime;
      endTime = formattedCurrentTime;
    } else {
      startTime = formatDate(statisticsTimeBoundaries.utcStartTime, this.requiredDateTimeFormat, this.currentLocale);
      endTime = formatDate(statisticsTimeBoundaries.utcEndTime, this.requiredDateTimeFormat, this.currentLocale);
    }

    const startTimeControl = new FormControl(startTime);
    configObj[this.queryTimeStartFormControlName] = startTimeControl;
    startTimeControl.setValidators(this.createStartTimeValidatorFn());
    const endTimeControl = new FormControl(endTime);
    configObj[this.queryTimeEndFormControlName] = endTimeControl;
    endTimeControl.setValidators(this.createEndTimeValidatorFn())
    this.queryTimeFormGroup = new FormGroup(configObj);
  }

  private createEndTimeValidatorFn() {
    return (endTimeControl: AbstractControl): ValidationErrors => {
      endTimeControl.setErrors(null);

      const endTimeValue = new Date(endTimeControl.value);
      const startTimeControl = this.queryTimeFormGroup.controls[this.queryTimeStartFormControlName];
      const startTimeValue = new Date(startTimeControl.value);
      if (endTimeValue < startTimeValue) {
        startTimeControl.setErrors({ startTimeIsLaterThanEnd: true });
      } else {
        startTimeControl.setErrors(null);
      }
      return endTimeControl.errors;
    };
  }

  private createStartTimeValidatorFn() {
    return (startTimeControl: AbstractControl): ValidationErrors => {
      startTimeControl.setErrors(null);

      const startTimeValue = new Date(startTimeControl.value);
      const endTimeControl = this.queryTimeFormGroup.controls[this.queryTimeEndFormControlName];
      const endTimeValue = new Date(endTimeControl.value);
      if (endTimeValue < startTimeValue) {
        endTimeControl.setErrors({ endTimeIsEarlierThanStart: true });
      } else {
        endTimeControl.setErrors(null);
      }
      return startTimeControl.errors;
    };
  }

  // TODO: move to common
  static convertToUtc(date: Date) {
    // https://stackoverflow.com/questions/948532/how-do-you-convert-a-javascript-date-to-utc
    const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
      date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    return new Date(utc);
  }

  ngOnInit(): void {
    this.initializeTimeBoundariesQuery();
  }

  onQueryTime($event: any) {
    const startTime = new Date($event[this.queryTimeStartFormControlName]);
    const utcStartTime = QueryTimeBoundariesComponent.convertToUtc(startTime);
    const endTime = new Date($event[this.queryTimeEndFormControlName]);
    const utcEndTime = QueryTimeBoundariesComponent.convertToUtc(endTime);
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
    const formattedCurrentTime = this.getCurrentTime();
    this.queryTimeFormGroup.controls[formName].setValue(formattedCurrentTime);
  }

  overwriteOtherValue(sourceFormName: string, targetFormName: string) {
    const sourceControl = this.queryTimeFormGroup.controls[sourceFormName];
    const sourceValue = sourceControl.value;
    const targetControl = this.queryTimeFormGroup.controls[targetFormName];
    targetControl.setValue(sourceValue);
  }
}
