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

  groupCategories: string[] = [];

  // summarizedTasksByCategory: ISummarizedTasks[] = [];

  summarizedTasksByCategoryBuffer: ISummarizedTasks[][] = [];

  isQuerySelectionVisible = true;
  isQueryDataVisible = false;

  private utcStartTime: Date;
  private utcEndTime: Date;
  constructor(
    private statsService: StatsService) { }

  ngOnInit(): void {

  }

  async loadStatsForGroupCategories() {
    for (let index = 0; index < this.groupCategories.length; index++) {
      try {
        const statsPromise = this.statsService.getStatsData(this.utcStartTime, this.utcEndTime, this.groupCategories[index]);
        const stats = await statsPromise;
        this.summarizedTasksByCategoryBuffer.push(stats);
      } catch (e) {
        console.error(e);
      }
    }
  }

  onQueryTimeBoundaries($event: ITimeBoundaries) {
    this.utcStartTime = $event.utcStartTime;
    this.utcEndTime = $event.utcEndTime;

    const loadPromise = this.loadStatsForGroupCategories();
    loadPromise.then(()=>{
      this.isQuerySelectionVisible = false;
      this.isQueryDataVisible = true;
    });
  }

  onQueryGroupCategory(groupCategories: string[]) {
    // DEBUGGING:
    console.log(groupCategories);

    this.groupCategories = groupCategories;
  }
}
