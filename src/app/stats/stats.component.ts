import { coerceStringArray } from '@angular/cdk/coercion';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { isEqual } from 'underscore';
import { ITimeInterval } from '../../../../common/typescript/iTimeInterval';

import { StatsService } from '../stats.service';
import { ISummarizedTasks } from './../../../../common/typescript/summarizedData';


@Component({
  selector: 'mtt-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent {

  groupCategories: string[] = [];

  categoryBufferMap: { [key: string]: ISummarizedTasks[] } = {};

  categoryKeys: string[] = [];

  isQuerySelectionVisible = true;
  isQueryDataVisible = false;

  private utcStartTime: Date;
  private utcEndTime: Date;
  constructor(private statsService: StatsService) { }

  loadStatsForGroupCategories() {
    return new Promise((resolveStats: (value?: any) => void) => {
      this.categoryBufferMap = {};
      let index = 0;
      const loop = () => {
        if (index >= this.groupCategories.length) {
          resolveStats(true);
          return;
        }
        const currentGroupCategory = this.groupCategories[index];
        const statsPromise = this.statsService.getStatsData(this.utcStartTime, this.utcEndTime, currentGroupCategory, false, false);
        statsPromise.then((stats: ISummarizedTasks[]) => {
          if (!stats) {
            console.error('no stats for:' + this.groupCategories[index]);
            // not matter what happened -> continue
            index++;
            loop();

            return;
          }
          if (isEqual(stats, {})) {
            this.categoryBufferMap[currentGroupCategory] = [];
          } else {
            const innerBuffer: ISummarizedTasks[] = [];
            stats.forEach((oneStats) => {
              const enrichedStats = this.statsService.enrichStats(oneStats);
              innerBuffer.push(enrichedStats);
            });
            this.categoryBufferMap[currentGroupCategory] = innerBuffer;
          }
          index++;
          loop();
        });

      };
      // initial call
      loop();
    });
  }

  onQueryTimeBoundaries($event: ITimeInterval) {
    this.utcStartTime = $event.utcStartTime;
    this.utcEndTime = $event.utcEndTime;

    const loadPromise = this.loadStatsForGroupCategories();
    loadPromise.then((isSuccessful) => {
      // set externally:

      if (isSuccessful) {
        this.categoryKeys = Object.keys(this.categoryBufferMap);

        // DEBUGGING
        // console.log(JSON.stringify(this.categoryKeys));
        // this.categoryKeys.forEach((oneCat)=>{
        //   console.log(JSON.stringify(this.categoryBufferMap[oneCat], null, 4));
        // });

        this.isQuerySelectionVisible = false;
        this.isQueryDataVisible = true;
      } else {
        console.error('an exception occurred -> do now show stats tables');
      }
    });
  }

  onQueryGroupCategory(groupCategories: string[]) {
    // DEBUGGING:
    // console.log(groupCategories);

    this.groupCategories = groupCategories;
  }
}
