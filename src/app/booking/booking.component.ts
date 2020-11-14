import { Component, EventEmitter, OnInit } from '@angular/core';

import { IStatistic } from '../../../../common/typescript/iStatistic';
import { ITimeInterval } from '../../../../common/typescript/iTimeInterval';
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

  deleteCurrentAndSwitchToNext = new EventEmitter<ITimeInterval>();

  constructor(private daySelectService: DaySelectService,
    private statsService: StatsService) { }

  ngOnInit(): void {
    const daysPromise = this.daySelectService.getNonCommittedDays(true);
    daysPromise.then((days: ITimeInterval[]) => {
      this.days = days;
    });
    daysPromise.catch(() => {
      console.error('days promise rejected in booking component!');
    });

  }

  onDaySelectionChange(currentDayAsTimeInterval: ITimeInterval) {
    this.currentDayInterval = currentDayAsTimeInterval;
    const utcStartTime = this.currentDayInterval.utcStartTime;
    const utcEndTime = this.currentDayInterval.utcEndTime;

    const statsPromise = this.statsService.getStatsData(utcStartTime, utcEndTime, null, true, true);
    statsPromise.then((rawStats: any[]) => {
      // DEBUGGING
      // console.log(rawStats);
      this.bookingLines = rawStats;
    });
  }

  onBookButtonClicked($event: Event) {
    if (!this.bookingLines || !this.bookingLines.length) {
      return;
    }
    for (const oneBookingLine of this.bookingLines) {
      const bookingPostResultPromise = this.statsService.submitBookingBased(oneBookingLine, this.currentDayInterval);
      // DEBUGGING:
      // console.log(bookingPostResult);
      bookingPostResultPromise.then(() => {
        this.deleteCurrentAndSwitchToNext.next(this.currentDayInterval);
        this.bookingLines = [];
      });
    }
  }

  onInvalid(isInvalid: boolean) {
    this.isInvalid = isInvalid;
  }
}
