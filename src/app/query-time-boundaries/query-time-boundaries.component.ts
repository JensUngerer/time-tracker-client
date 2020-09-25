import { formatDate } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { SessionStorageService } from '../session-storage.service';

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

  constructor(@Inject(LOCALE_ID) private currentLocale,
    private sessionsStorageService: SessionStorageService) {
  }

  private getStoredDataFromStorage() {
      // get stored data from storage
      let statisticsTimeBoundaries: ITimeBoundaries = null;
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
    const requiredDateTimeFormat = "yyyy-MM-ddTHH:mm";
    // const cestOffset = "UTC+2";
    let startTime: string = null;
    let endTime: string = null;
    if (!statisticsTimeBoundaries) {
      const currentTime = Date.now();
      const formattedCurrentTime = formatDate(currentTime, requiredDateTimeFormat, this.currentLocale);
      startTime = formattedCurrentTime;
      endTime = formattedCurrentTime;
    } else {
      startTime = formatDate(statisticsTimeBoundaries.utcStartTime, requiredDateTimeFormat, this.currentLocale);
      endTime = formatDate(statisticsTimeBoundaries.utcEndTime, requiredDateTimeFormat, this.currentLocale);
    }

    configObj[this.queryTimeStartFormControlName] = new FormControl(startTime);
    configObj[this.queryTimeEndFormControlName] = new FormControl(endTime);
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
    const outputEventData: ITimeBoundaries = {
      utcStartTime,
      utcEndTime
    };
    this.sessionsStorageService.set({
      statisticsTimeBoundaries: outputEventData
    });
    this.queryTimeBoundaries.emit(outputEventData);
  }

}
