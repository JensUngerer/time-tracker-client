import { Component, Inject, Input, LOCALE_ID, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ITimeEntryBase } from '../../../../common/typescript/iTimeEntry';
import { ITimeInterval } from '../../../../common/typescript/iTimeInterval';
import { CommitService } from '../commit.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';

@Component({
  selector: 'mtt-manipulate-ticket-hours',
  templateUrl: './../manipulate-working-hours/manipulate-working-hours.component.html',
  styleUrls: ['./../manipulate-working-hours/manipulate-working-hours.component.scss']
})
export class ManipulateTicketHoursComponent implements OnInit, OnChanges {
  @Input()
  interval: ITimeInterval;

  timeEntries: ITimeEntryBase[] = [];

  constructor(@Inject(LOCALE_ID) public currentLocale,
    protected commitService: CommitService,
    protected sessionStorageSerializationService: SessionStorageSerializationService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes &&
      changes.interval &&
      changes.interval.currentValue) {
      const currentInterval = changes.interval.currentValue;
      this.initData(currentInterval);
    }
  }

  protected initData(currentInterval: ITimeInterval) {
    const timeEntriesIntervalPromise = this.commitService.getRawTimeEntriesInInterval(currentInterval);
    if (!timeEntriesIntervalPromise) {
      console.error('no timeEntriesIntervalPromise');
      return;
    }
    timeEntriesIntervalPromise.then((rawTimeEntries: string) => {
      if (!rawTimeEntries) {
        console.error('no raw time entries');
        return;
      }
      const parsedTimeEntries: ITimeEntryBase[] = this.sessionStorageSerializationService.deSerialize(rawTimeEntries);
      if (!parsedTimeEntries ||
        !parsedTimeEntries.length) {
        console.error('no parsed time entries');
        return;
      }
      this.timeEntries = parsedTimeEntries;
    });
    timeEntriesIntervalPromise.catch((err) => {
      console.error(err);
    });
  }

  onTimeEntryChanged(timeEntry: ITimeEntryBase) {
    if (timeEntry['_id']) {
      delete timeEntry['_id'];
    }
    console.error('TODO implement sending of:' + JSON.stringify(timeEntry, null, 4));
  }

  ngOnInit(): void {
  }
}
