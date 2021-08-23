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
  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes &&
  //     changes.interval &&
  //     changes.interval.currentValue) {
  //     const currentInterval = changes.interval.currentValue;
  //     this.initData(currentInterval);
  //   }
  // }

  // private initData(currentInterval: ITimeInterval) {
  // }

  // ngOnInit(): void {
  // }
  onLineClicked(line: ITimeEntryBase) {
    this.selectedLine = line;
  }

  onTimeEntryAdded(line: ITimeEntryBase) {
    console.error('TODO: implement sending of:' + JSON.stringify(line, null, 4));
  }
}
