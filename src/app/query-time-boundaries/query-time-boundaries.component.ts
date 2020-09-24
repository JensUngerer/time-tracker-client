import { formatDate } from '@angular/common';
import { Component, EventEmitter, Inject, LOCALE_ID, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

export interface ITimeBoundaries {
  utcStartTime: Date;
  utcEndTime: Date;
}

@Component({
  selector: 'mtt-query-time-boundaries',
  templateUrl: './query-time-boundaries.component.html',
  styleUrls: ['./query-time-boundaries.component.scss']
})
export class QueryTimeBoundariesComponent implements OnInit {
  queryTimeStartFormControlName = 'theQueryStartTime';
  queryTimeEndFormControlName = 'theQueryEndTime';

  queryTimeFormGroup: FormGroup;
  
  @Output()
  queryTimeBoundaries: EventEmitter<ITimeBoundaries> = new EventEmitter();

  constructor(@Inject(LOCALE_ID) private currentLocale) { }

  private initializeTimeBoundariesQuery() {
    const configObj: { [key: string]: AbstractControl } = {};
    const currentTime = Date.now();
    // https://stackoverflow.com/questions/35144821/angular-use-pipes-in-services-and-components
    // https://stackoverflow.com/questions/46715543/how-to-bind-date-time-form-control
    // https://stackoverflow.com/questions/50362854/how-to-change-time-from-24-to-12-hour-format-in-angular-5
    const requiredDateTimeFormat = "yyyy-MM-ddTHH:mm"
    // const cestOffset = "UTC";
    const formattedCurrentTime = formatDate(currentTime, requiredDateTimeFormat, this.currentLocale); // , cestOffset);

    configObj[this.queryTimeStartFormControlName] = new FormControl(formattedCurrentTime);
    configObj[this.queryTimeEndFormControlName] = new FormControl(formattedCurrentTime);
    this.queryTimeFormGroup = new FormGroup(configObj);
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
    this.queryTimeBoundaries.emit({
      utcStartTime,
      utcEndTime
    })
  }

}
