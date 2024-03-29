import { AfterContentInit, AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Duration } from 'luxon';
import { v4 } from 'uuid';

import { Constants } from '../../../../common/typescript/constants';
import { DurationCalculator } from '../../../../common/typescript/helpers/durationCalculator';
import { ITimeEntryBase } from '../../../../common/typescript/iTimeEntry';
import { ITimeInterval } from '../../../../common/typescript/iTimeInterval';
import { QueryTimeBoundariesComponent } from '../query-time-boundaries/query-time-boundaries.component';
import { TimeEntryHelperService } from '../time-entry-helper.service';

@Component({
  selector: 'mtt-add-time-entry',
  templateUrl: './add-time-entry.component.html',
  styleUrls: ['./add-time-entry.component.scss']
})
export class AddTimeEntryComponent implements AfterViewInit, OnChanges {
  readonly startTimeFormControlName = 'startTimeFormControl';
  readonly endTimeFormControlName = 'endTimeFormControl';
  addTimeFormGroup: FormGroup = new FormGroup({});
  isVisible = false;

  @Input()
  timeInterval: ITimeInterval;

  @Output()
  timeEntry: EventEmitter<ITimeEntryBase> = new EventEmitter();

  constructor(private timeEntryHelperService: TimeEntryHelperService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes &&
      changes.timeInterval &&
      changes.timeInterval.currentValue) {
      // ?
      // this.isVisible = false;

      const currentTimeInterval = changes.timeInterval.currentValue;
      this.initFormGroup(currentTimeInterval.utcStartTime, currentTimeInterval.utcEndTime);
    }
  }

  ngAfterViewInit(): void {
    this.initFormGroup(null, null);
  }

  ngOnInit(): void {
  }

  initFormGroup(preSelectionStartTime: Date, preSelectionEndTime: Date) {
    const configObj: { [key: string]: AbstractControl } = {};

    let startTime: string;
    let startTimeControl: AbstractControl;
    if (!preSelectionStartTime) {
      startTime = this.timeEntryHelperService.getCurrentTime();
    } else {
      startTime = this.timeEntryHelperService.getStartTimeFormatted(preSelectionStartTime);
    }
    startTimeControl = new FormControl(startTime);

    let endTime: string;
    let endTimeControl: AbstractControl;
    if (!preSelectionEndTime) {
      endTime = this.timeEntryHelperService.getCurrentTime();
    } else {
      endTime = this.timeEntryHelperService.getEndTimeFormatted(preSelectionEndTime);
    }
    endTimeControl = new FormControl(endTime);

    startTimeControl.setValidators(QueryTimeBoundariesComponent.createStartTimeValidatorFn(endTimeControl));
    endTimeControl.setValidators(QueryTimeBoundariesComponent.createEndTimeValidatorFn(startTimeControl))

    configObj[this.startTimeFormControlName] = startTimeControl;
    configObj[this.endTimeFormControlName] = endTimeControl;

    this.addTimeFormGroup = new FormGroup(configObj);

    if (startTimeControl.invalid ||
      endTimeControl.invalid) {
      console.error('invalid start or end time');
      return;
    }
    // ?
    this.isVisible = true;
  }

  onAddTimeEntry(formData: any) {
    console.log(JSON.stringify(formData, null, 4));
    const startTimeStr = formData[this.startTimeFormControlName];
    const endTimeStr = formData[this.endTimeFormControlName];
    if (!startTimeStr ||
      !endTimeStr) {
      console.error(startTimeStr);
      console.error(endTimeStr);
      return;
    }
    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);
    const duration = DurationCalculator.getDurationFrom(endTime, startTime);

    const timeEntry = {
      timeEntryId: v4(),
      startTime,
      endTime,
      durationInMilliseconds: duration.toObject(),
      day: DurationCalculator.getDayFrom(startTime)
    };

    // DEBUGGING:
    console.log(JSON.stringify(timeEntry, null, 4));

    this.timeEntry.emit(timeEntry);
  }

  getDurationStr() {
    if (!this.addTimeFormGroup ||
      !this.addTimeFormGroup.controls) {
      console.error('no form group');
      return;
    }
    const startControl = this.addTimeFormGroup.controls[this.startTimeFormControlName];
    const endControl = this.addTimeFormGroup.controls[this.endTimeFormControlName];
    if (!startControl ||
      !endControl) {
      console.error('no controls yet');
      return;
    }
    const startTimeStr = startControl.value;
    const endTimeStr = endControl.value;
    if (!startTimeStr ||
      !endTimeStr) {
      console.error(startTimeStr);
      console.error(endTimeStr);
      return;
    }
    const duration = DurationCalculator.getDurationFrom(new Date(endTimeStr), new Date(startTimeStr));
    return duration.toFormat(Constants.contextDurationFormat);
  }
}
