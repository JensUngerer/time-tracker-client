import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import { formatDate } from '@angular/common';
import { CommitService } from '../commit.service';

@Component({
  selector: 'mtt-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  queryTimeStartFormControlName = 'theQueryStartTime';
  queryTimeEndFormControlName = 'theQueryEndTime';
  // buttonFormControlName = "theQueryButton";

  queryTimeFormGroup: FormGroup;

  constructor(@Inject(LOCALE_ID) private currentLocale,
  private commitService: CommitService) { }

  ngOnInit(): void {
    const configObj: { [key: string]: AbstractControl } = {};
    const currentTime = Date.now();
    // https://stackoverflow.com/questions/35144821/angular-use-pipes-in-services-and-components
    // https://stackoverflow.com/questions/46715543/how-to-bind-date-time-form-control
    // https://stackoverflow.com/questions/50362854/how-to-change-time-from-24-to-12-hour-format-in-angular-5
    const requiredDateTimeFormat = "yyyy-MM-ddTHH:mm"
    const cestOffset = "UTC +2";
    const formattedCurrentTime = formatDate(currentTime, requiredDateTimeFormat, this.currentLocale, cestOffset);

    configObj[this.queryTimeStartFormControlName] = new FormControl(formattedCurrentTime);
    configObj[this.queryTimeEndFormControlName] = new FormControl(formattedCurrentTime);
    // configObj[this.buttonFormControlName] = new FormControl();
    this.queryTimeFormGroup = new FormGroup(configObj);
  }

  // TODO: move to common
  convertToUtc(date: Date) {
    // https://stackoverflow.com/questions/948532/how-do-you-convert-a-javascript-date-to-utc
    const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
      date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    return new Date(utc);
  }


  onQueryTime($event: any) {
    // DEBUGGING
    // console.log($event[this.queryTimeStartFormControlName]);
    // console.log($event[this.queryTimeEndFormControlName]);

    // console.log(this.convertToUtc(new Date($event[this.queryTimeStartFormControlName])).toUTCString());
    // console.log(this.convertToUtc(new Date($event[this.queryTimeEndFormControlName])).toUTCString());
    const startTime = new Date($event[this.queryTimeStartFormControlName]);
    const utcStartTime = this.convertToUtc(startTime);
    const endTime = new Date($event[this.queryTimeEndFormControlName]);
    const utcEndTime = this.convertToUtc(endTime);

    const statisticsPromise = this.commitService.getStatistics(utcStartTime, utcEndTime);
    statisticsPromise.then((stats: any) => {
      console.log(stats);
    })
    statisticsPromise.catch((err: any) => {
      console.error(err);
    });
  }

}
