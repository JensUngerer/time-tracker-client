import { Component, OnInit } from '@angular/core';
import { isEqual } from 'underscore';
import { ITimeInterval } from '../../../../common/typescript/iTimeInterval';
import { ISummarizedTasks } from '../../../../common/typescript/summarizedData';
import { DaySelectService } from '../day-select/day-select.service';
import { StatsService } from '../stats.service';

@Component({
  selector: 'mtt-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {

  days: ITimeInterval[];

  isInvalid = false;

  bookingLines: any[];

  constructor(private daySelectService: DaySelectService,
              private statsService: StatsService) { }

  ngOnInit(): void {
    const daysPromise = this.daySelectService.getNonCommittedDays();
    daysPromise.then((days: ITimeInterval[]) => {
      this.days = days;

      // // get the summary by day(s)
      // this.days.forEach((oneDay) => {

      // });
    });
    daysPromise.catch(() => {
      console.error('days promise rejected in booking component!');
    });

  }

  onDaySelectionChange(currentDayAsTimeInterval: ITimeInterval) {
    const utcStartTime = currentDayAsTimeInterval.utcStartTime;
    const utcEndTime = currentDayAsTimeInterval.utcEndTime;

    const statsPromise = this.statsService.getStatsData(utcStartTime, utcEndTime, null, true);
    statsPromise.then((rawStats: any[]) => {
      // DEBUGGING
      console.log(rawStats);
      this.bookingLines = rawStats;
    });
    // for (let index = 0; index < this.groupCategories.length; index++) {
    //   // try {
    //     const stats = await statsPromise;
    // }
  }

  onBookButtonClicked($event: Event) {

  }

  onInvalid(isInvalid: boolean) {
    this.isInvalid = isInvalid;
  }
}
