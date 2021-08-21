import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';

import { ITimeEntryBase } from '../../../../common/typescript/iTimeEntry';
import { CommitService } from '../commit.service';
import { IDateBoundaries } from '../query-date/query-date.component';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';

@Component({
  selector: 'mtt-working-hours',
  templateUrl: './working-hours.component.html',
  styleUrls: ['./working-hours.component.scss']
})
export class WorkingHoursComponent implements OnInit, OnDestroy {
  currentDay: Date;

  parsedWorkingTimeDocs: ITimeEntryBase[] = [];
  pauses: ITimeEntryBase[];

  constructor(@Inject(LOCALE_ID) public currentLocale,
    private commitService: CommitService,
    private sessionStorageSerializationService: SessionStorageSerializationService) { }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
  }

  onQueryDateBoundaries($event: IDateBoundaries) {
    this.currentDay = $event.day;

    this.initializeTableViaHttpGetResponse(this.currentDay);
    this.initPauses(this.currentDay);
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

  initPauses(currentDay: Date) {
    const pausesPromise = this.commitService.getWorkingPausesTimeEntries(currentDay);
    if (!pausesPromise) {
      console.error('no pauses Promise');
      return;
    }
    pausesPromise.then((rawPauses: string) => {
      var pauses: ITimeEntryBase[] = this.sessionStorageSerializationService.deSerialize(rawPauses);
      if (!pauses ||
        !pauses.length) {
        console.error('no pauses received');
        return;
      }
      this.pauses = pauses;
    });
    pausesPromise.catch((err: any) => {
      console.error(err);
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

  onTimeEntry(line: ITimeEntryBase) {
    const postPromise = this.commitService.postWorkingTimeEntry(line);
    postPromise.then((postResult: string) => {
      // DEBUGGING:
      console.log(postResult);
    });
    postPromise.catch((postErr: any) => {
      // DEBUGGING:
      console.log(postErr);
    });
  }
}
