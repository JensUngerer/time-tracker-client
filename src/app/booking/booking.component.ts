import { Component, OnInit } from '@angular/core';
import { isEqual } from 'underscore';
import { DurationCalculator } from '../../../../common/typescript/helpers/durationCalculator';
import { IStatistic } from '../../../../common/typescript/iStatistic';
import { ITimeInterval } from '../../../../common/typescript/iTimeInterval';
import { ITimeRecordsDocumentData } from '../../../../common/typescript/mongoDB/iTimeRecordsDocument';
import { ISummarizedTasks } from '../../../../common/typescript/summarizedData';
import { DaySelectService } from '../day-select/day-select.service';
import { StatsService } from '../stats.service';

@Component({
  selector: 'mtt-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {

  private currentDayInterval: ITimeInterval;

  days: ITimeInterval[];

  isInvalid = false;

  bookingLines: IStatistic[];

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
    this.currentDayInterval = currentDayAsTimeInterval;
    const utcStartTime = this.currentDayInterval.utcStartTime;
    const utcEndTime = this.currentDayInterval.utcEndTime;

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

  async onBookButtonClicked($event: Event) {
    if (!this.bookingLines || !this.bookingLines.length) {
      return;
    }
    for (const oneBookingLine of this.bookingLines) {
      const bookingPostResult = await this.statsService.submitBookingBased(oneBookingLine, this.currentDayInterval);
      // DEBUGGING:
      console.log(bookingPostResult);
    }
  }

  onInvalid(isInvalid: boolean) {
    this.isInvalid = isInvalid;
  }
}
