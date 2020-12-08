import { ChangeDetectorRef, Component, EventEmitter, OnInit } from '@angular/core';

import { IStatistic } from '../../../../common/typescript/iStatistic';
import { ITimeInterval } from '../../../../common/typescript/iTimeInterval';
import { CommitService } from '../commit.service';
import { DaySelectService } from '../day-select/day-select.service';
import { IQueryBooleans } from '../is-csv-file-written/iQueryBooleans';
import { StatsService } from '../stats.service';

@Component({
  selector: 'mtt-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  private currentDayInterval: ITimeInterval;
  private isCsvFileWritten = false;

  days: ITimeInterval[];

  isInvalid = false;

  bookingLines: IStatistic[];

  isVisible = false;

  isBookingButtonDisabled = false;

  deleteCurrentAndSwitchToNext = new EventEmitter<ITimeInterval>();
  deleteCurrentBooleans = new EventEmitter<any>();

  constructor(private daySelectService: DaySelectService,
    private statsService: StatsService,
    private changeDetectorRef: ChangeDetectorRef,
    private commitService: CommitService) { }

  ngOnInit(): void {
    const daysPromise = this.daySelectService.getNonCommittedDays(true);
    daysPromise.then((days: ITimeInterval[]) => {
      if (!days || !days.length) {
        this.isBookingButtonDisabled = true;
        return;
      }
      this.days = days;
      this.isBookingButtonDisabled = false;
    });
    daysPromise.catch(() => {
      console.error('days promise rejected in booking component!');
    });

  }

  onDaySelectionChange(currentDayAsTimeInterval: ITimeInterval) {
    this.currentDayInterval = currentDayAsTimeInterval;
    if (!this.currentDayInterval) {
      this.bookingLines = [];
      this.isVisible = false;
      this.changeDetectorRef.detectChanges();
      return;
    }
    const utcStartTime = this.currentDayInterval.utcStartTime;
    const utcEndTime = this.currentDayInterval.utcEndTime;

    const statsPromise = this.statsService.getStatsData(utcStartTime, utcEndTime, null, true, true);
    statsPromise.then((rawStats: any[]) => {
      if (!rawStats || !rawStats.length) {
        this.isBookingButtonDisabled = true;
        return;
      }
      // DEBUGGING
      // console.log(rawStats);
      this.bookingLines = rawStats;
      this.isVisible = true;
      this.isBookingButtonDisabled = false;
    });
  }

  async onBookButtonClicked($event: Event) {
    this.isBookingButtonDisabled = true;
    if (!this.bookingLines || !this.bookingLines.length) {
      return;
    }
    if (!this.currentDayInterval) {
      return;
    }
    for (const oneBookingLine of this.bookingLines) {
      await this.statsService.submitBookingBased(oneBookingLine, this.currentDayInterval);
      // DEBUGGING:
      // console.log(bookingPostResult);
      // bookingPostResultPromise.then(() => {
      // });
    }
    if (this.isCsvFileWritten) {
      this.commitService.postCsvFileTrigger(this.isCsvFileWritten, this.currentDayInterval.utcStartTime, this.currentDayInterval.utcEndTime);
      this.deleteCurrentBooleans.next();
    }

    this.deleteCurrentAndSwitchToNext.next(this.currentDayInterval);
  }

  onInvalid(isInvalid: boolean) {
    this.isInvalid = isInvalid;
  }

  onQueryBooleans($event: IQueryBooleans) {
    this.isCsvFileWritten = $event.isCsvFileWritten;
  }
}
