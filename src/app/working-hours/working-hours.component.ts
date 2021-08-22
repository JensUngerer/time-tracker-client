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

  constructor() { }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
  }

  onQueryDateBoundaries($event: IDateBoundaries) {
    this.currentDay = $event.day;
  }
}
