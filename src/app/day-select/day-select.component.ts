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
export class DaySelectComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  days: ITimeInterval[] = [];

  @Output()
  daySelectionChange: EventEmitter<ITimeInterval> = new EventEmitter();

  @Output()
  invalid: EventEmitter<boolean> = new EventEmitter();

  private isInvalid: boolean;
  private statusChangesSubscription: Subscription;

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

  ngOnInit(): void {
    this.createDayFormGroup();
    this.statusChangesSubscription = this.dayFormGroup.statusChanges.pipe(tap(() => {
      if(this.dayFormGroup.invalid !== this.isInvalid) {
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
  }
}
