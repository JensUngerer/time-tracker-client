import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import { formatDate, formatNumber } from '@angular/common';
import { CommitService } from '../commit.service';
import { ISummarizedTimeEntries } from './../../../../common/typescript/iSummarizedTimeEntries';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { ITasksDocument } from './../../../../common/typescript/mongoDB/iTasksDocument';
import { ISummarizedTasks, ITaskLine } from './../../../../common/typescript/summarizedData';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { Chart } from 'chart.js';
import { ITimeBoundaries } from '../query-time-boundaries/query-time-boundaries.component';
import { StatsService } from '../stats.service';


@Component({
  selector: 'mtt-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  summarizedTasksByCategory: ISummarizedTasks[] = [];

  isQuerySelectionVisible = true;
  isQueryDataVisible = false;

  constructor(
    private statsService: StatsService,
    private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    
  }

  onQueryTimeBoundaries($event: ITimeBoundaries) {
    const statsPromise = this.statsService.getStatsData($event.utcStartTime, $event.utcEndTime);
    statsPromise.then((stats: ISummarizedTasks[]) => {
      this.isQuerySelectionVisible = false;
      this.isQueryDataVisible = true;


      this.summarizedTasksByCategory = stats;
      // this.changeDetectorRef.detectChanges();
    });
    statsPromise.catch((err: any) => {
      console.error(err);
      console.error(JSON.stringify(err, null, 4));
    });
  }
}
