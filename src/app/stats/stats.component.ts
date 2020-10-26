import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { ITimeBoundaries } from '../query-time-boundaries/query-time-boundaries.component';
import { StatsService } from '../stats.service';
import { ISummarizedTasks } from './../../../../common/typescript/summarizedData';


@Component({
  selector: 'mtt-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  summarizedTasksByCategory: ISummarizedTasks[] = [];

  isQuerySelectionVisible = true;
  isQueryDataVisible = false;

  currentGroupCategory = 'Team1';

  constructor(
    private statsService: StatsService) { }

  ngOnInit(): void {

  }

  onQueryTimeBoundaries($event: ITimeBoundaries) {
    const statsPromise = this.statsService.getStatsData($event.utcStartTime, $event.utcEndTime, this.currentGroupCategory);
    statsPromise.then((stats: ISummarizedTasks[]) => {
      this.isQuerySelectionVisible = false;
      this.isQueryDataVisible = true;

      this.summarizedTasksByCategory = stats;
    });
    statsPromise.catch((err: any) => {
      console.error(err);
      console.error(JSON.stringify(err, null, 4));
    });
  }
}
