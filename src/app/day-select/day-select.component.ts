import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { uniqueId } from 'underscore';
import { ITimeInterval } from '../../../../common/typescript/iTimeInterval';
import { ICommitDayOption } from './i-commit-day-option';

@Component({
  selector: 'mtt-day-select',
  templateUrl: './day-select.component.html',
  styleUrls: ['./day-select.component.scss']
})
export class DaySelectComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input()
  days: ITimeInterval[] = [];

  @Input()
  deleteCurrentAndSwitchToNext: EventEmitter<ITimeInterval>;

  @Output()
  daySelectionChange: EventEmitter<ITimeInterval> = new EventEmitter();

  @Output()
  invalid: EventEmitter<boolean> = new EventEmitter();

  private isInvalid: boolean;
  private statusChangesSubscription: Subscription;
  private deleteCurrentAndSwitchToNextSubscription: Subscription;

  dayDropDownFormControlName = 'theDayDropDown';
  dayFormGroup: FormGroup;
  commitDayOptions: ICommitDayOption[] = [];

  constructor() { }

  private createDayFormGroup() {
    const dayFormGroupConfig = {};
    dayFormGroupConfig[this.dayDropDownFormControlName] = new FormControl();
    this.dayFormGroup = new FormGroup(dayFormGroupConfig);
  }

  private initDayDropDown() {
    if (!this.commitDayOptions || !this.commitDayOptions.length) {
      return;
    }
    const displayedObj = this.commitDayOptions[0];
    const displayedValue = displayedObj.value;
    this.dayFormGroup.controls[this.dayDropDownFormControlName].setValue(displayedValue);
    this.onDaySelectionChange({
      value: displayedValue,
      source: null
    })
  }

  private createDaysDataStructure() {
    // DEBUGGING
    // console.log(days);
    if (!this.days || !this.days.length) {
      console.error('no days:' + JSON.stringify(this.days, null, 4));
      return;
    }

    this.days.forEach((oneDay: ITimeInterval) => {
      this.commitDayOptions.push({
        value: oneDay,
        viewValue: oneDay.utcStartTime,
        id: uniqueId()
      });
    });
  }

  private deleteCurrentAndSwitchToNextCallback(entryToDelete: ITimeInterval) {
    if (!entryToDelete) {
      return;
    }
    // delete current entry (visually only)
    const indexToDelete = this.commitDayOptions.findIndex((oneDayOption) => {
      return oneDayOption.value.utcStartTime === entryToDelete.utcStartTime &&
        oneDayOption.value.utcEndTime === entryToDelete.utcEndTime;
    });
    if (indexToDelete === -1) {
      console.error('cannot delete visually');
      return;
    }
    if (!this.commitDayOptions) {
      return;
    }
    this.commitDayOptions.splice(indexToDelete, 1);

    // switch to next entry
    let newValue: ITimeInterval;
    if (this.commitDayOptions.length > 0) {
      newValue = this.commitDayOptions[0].value;
    } else {
      newValue = null;
    }
    this.dayFormGroup.controls[this.dayDropDownFormControlName].setValue(newValue);
    this.onDaySelectionChange({ value: newValue } as MatSelectChange);
  }

  ngOnInit(): void {
    this.createDayFormGroup();
    this.statusChangesSubscription = this.dayFormGroup.statusChanges.pipe(tap(() => {
      if (this.dayFormGroup.invalid !== this.isInvalid) {
        this.isInvalid = this.dayFormGroup.invalid;
        this.invalid.emit(this.isInvalid);
      }
    })).subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes &&
      changes.days &&
      changes.days.currentValue &&
      changes.days.currentValue.length) {
      this.createDaysDataStructure();
      this.initDayDropDown();
    }
  }

  onDaySelectionChange($event: MatSelectChange) {
    const dayTimeInterval: ITimeInterval = $event.value;
    this.daySelectionChange.emit(dayTimeInterval);
  }

  ngOnDestroy(): void {
    if (this.statusChangesSubscription) {
      this.statusChangesSubscription.unsubscribe();
    }
    if (this.deleteCurrentAndSwitchToNextSubscription) {
      this.deleteCurrentAndSwitchToNextSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.deleteCurrentAndSwitchToNextSubscription = this.deleteCurrentAndSwitchToNext.pipe(tap(this.deleteCurrentAndSwitchToNextCallback.bind(this))).subscribe();
  }
}
