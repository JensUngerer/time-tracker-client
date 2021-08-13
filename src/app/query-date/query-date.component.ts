import { formatDate } from '@angular/common';
import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { QueryTimeBoundariesComponent } from '../query-time-boundaries/query-time-boundaries.component';
import { DurationCalculator } from './../../../../common/typescript/helpers/durationCalculator';

export interface IDateBoundaries {
  day: Date;
  nextDay: Date;
}

@Component({
  selector: 'mtt-query-date',
  templateUrl: './query-date.component.html',
  styleUrls: ['./query-date.component.scss']
})
export class QueryDateComponent implements OnInit {
  static requiredDateFormat = "yyyy-MM-ddT";

  queryDateStartFormControlName = 'startDayFormControl';
  queryDateFormGroup: FormGroup;

  // @Input()
  // day: Date

  @Output()
  queryDateBoundaries: EventEmitter<IDateBoundaries> = new EventEmitter();

  constructor(@Inject(LOCALE_ID) private currentLocale) { }

  ngOnInit(): void {
    this.initialize();
  }

  initialize() {
    const now = new Date();
    const dayUtc = DurationCalculator.getDayFrom(now);
    // const formattedDayUtc = formatDate(dayUtc, QueryTimeBoundariesComponent.requiredDateTimeFormat, this.currentLocale);;
    const formattedDayUtc = formatDate(dayUtc, QueryDateComponent.requiredDateFormat, this.currentLocale);
    const startDateControl = new FormControl(formattedDayUtc);
    const configObj: { [key: string]: AbstractControl } = {};
    configObj[this.queryDateStartFormControlName] = startDateControl;

    this.queryDateFormGroup = new FormGroup(configObj);
  }

  onQueryDate(values: any) {
    const chosenDate = values[this.queryDateStartFormControlName];
    const day = new Date(chosenDate);
    const dayUtc = DurationCalculator.getDayFrom(day);
    const nextDayUtc = DurationCalculator.getNextDayFrom(dayUtc);

    // DEBUGGING:
    console.log(dayUtc);
    console.log(nextDayUtc);

    this.queryDateBoundaries.emit({
      day: dayUtc,
      nextDay: nextDayUtc
    });
  }
}
