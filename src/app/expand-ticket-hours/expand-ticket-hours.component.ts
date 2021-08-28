import { Component, Inject, Input, LOCALE_ID, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ITimeEntryBase } from '../../../../common/typescript/iTimeEntry';
import { ITimeInterval } from '../../../../common/typescript/iTimeInterval';
import { CommitService } from '../commit.service';
import { ManipulateTicketHoursComponent } from '../manipulate-ticket-hours/manipulate-ticket-hours.component';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';

@Component({
  selector: 'mtt-expand-ticket-hours',
  templateUrl: './../expand-working-hours/expand-working-hours.component.html',
  styleUrls: ['./../expand-working-hours/expand-working-hours.component.scss']
})
export class ExpandTicketHoursComponent extends ManipulateTicketHoursComponent /*implements OnInit, OnChanges*/ {
  get timeInterval(): ITimeInterval {
    if (!this.selectedLine) {
      return null;
    }
    return {
      utcStartTime: this.selectedLine.startTime,
      utcEndTime: this.selectedLine.endTime,
    }
  }

  selectedLine: ITimeEntryBase;

  /// @Input()
  // interval: ITimeInterval;

  constructor(@Inject(LOCALE_ID) currentLocale,
    commitService: CommitService,
    sessionStorageSerializationService: SessionStorageSerializationService) {
    super(currentLocale, commitService, sessionStorageSerializationService);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes &&
      changes.interval &&
      changes.interval.currentValue) {
      const currentInterval = changes.interval.currentValue;
      this.initData(currentInterval);
    }
  }

  protected initData(currentInterval: ITimeInterval) {
    const pausesPromise = this.commitService.getEmptyTimeEntries(currentInterval);
    if (!pausesPromise) {
      console.error('no promise for empty time entries');
      return;
    }
    pausesPromise.then((rawEmptyTimeEntries: string) => {
      if (!rawEmptyTimeEntries) {
        console.error('no raw empty time entries');
        return;
      }
      const parsedEmptyTimeEntries: ITimeEntryBase[] = this.sessionStorageSerializationService.deSerialize(rawEmptyTimeEntries);
      if (!parsedEmptyTimeEntries ||
        !parsedEmptyTimeEntries.length) {
        console.error('no parsed empty time entries');
        return;
      }
      this.timeEntries = parsedEmptyTimeEntries;
    });
    pausesPromise.catch((err: any) => {
      console.error(err);
    });
  }

  onLineClicked(line: ITimeEntryBase) {
    this.selectedLine = line;
  }

  onTimeEntryAdded(line: ITimeEntryBase) {
    // TODO: _taskId and _bookingDeclarationId are missing!!!

    // if (line['_id']) {
    //   delete line['_id'];
    // }
    // const postPromise = this.commitService.postTimeEntries(line);
    // postPromise.then((postResult: string) => {
    //   // DEBUGGING:
    //   console.log(postResult);
    // });
    // postPromise.catch((postErr: any) => {
    //   // DEBUGGING:
    //   console.log(postErr);
    // });
  }
}
