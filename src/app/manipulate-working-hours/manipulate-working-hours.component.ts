import { Component, Inject, Input, LOCALE_ID, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { ITimeEntryBase } from '../../../../common/typescript/iTimeEntry';
import { CommitService } from '../commit.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';

@Component({
  selector: 'mtt-manipulate-working-hours',
  templateUrl: './manipulate-working-hours.component.html',
  styleUrls: ['./manipulate-working-hours.component.scss']
})
export class ManipulateWorkingHoursComponent implements OnInit, OnChanges {

  @Input()
  currentDay = new Date();

  parsedWorkingTimeDocs: ITimeEntryBase[] = [];

  constructor(@Inject(LOCALE_ID) public currentLocale,
    private commitService: CommitService,
    private sessionStorageSerializationService: SessionStorageSerializationService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes &&
      changes.currentDay &&
      changes.currentDay.currentValue) {
      this.initializeTableViaHttpGetResponse(changes.currentDay.currentValue);
    }
  }

  ngOnInit(): void {
  }


  private initializeTableViaHttpGetResponse(selectedDay: Date) {
    const docsPromise = this.commitService.getWorkingTimeEntries(selectedDay);
    docsPromise.then((rawWorkingTimeEntries: string) => {
      if (!rawWorkingTimeEntries) {
        console.error('no raw working-time-entries received');
        return;
      }
      const parsedWorkingTimeDocs: ITimeEntryBase[] = this.sessionStorageSerializationService.deSerialize(rawWorkingTimeEntries);
      if (!parsedWorkingTimeDocs ||
        !parsedWorkingTimeDocs.length) {
        console.error('no parsed working-time-entries received');
        return;
      }
      this.parsedWorkingTimeDocs = parsedWorkingTimeDocs;
    });
    docsPromise.catch((httpGetErr: any) => {
      console.error(httpGetErr);
    });
  }

  onTimeEntryChanged(line: ITimeEntryBase) {
    const patchPromise = this.commitService.patchWorkingTimeEntry(line);
    patchPromise.then((patchResult: any) => {
      // DEBUGGING:
      console.log(JSON.stringify(patchResult, null, 4));
    });
    patchPromise.catch((patchErr: any) => {
      console.error(JSON.stringify(patchErr, null, 4));
    });
  }

}
