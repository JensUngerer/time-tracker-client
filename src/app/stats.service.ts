import { Injectable } from '@angular/core';
import { ISummarizedTimeEntries } from '../../../common/typescript/iSummarizedTimeEntries';
import { ITimeSummary } from '../../../common/typescript/iTimeSummary';
import { ITasksDocument } from '../../../common/typescript/mongoDB/iTasksDocument';
import { ISummarizedTasks, ITaskLine } from '../../../common/typescript/summarizedData';
import { CommitService } from './commit.service';
import { ConfigurationService } from './configuration.service';
import { SessionStorageSerializationService } from './session-storage-serialization.service';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  summarizedTasksByCategory: ISummarizedTasks[] = [];

  constructor(private commitService: CommitService,
    private sessionStorageSerializationService: SessionStorageSerializationService) { }

  getStatsData(utcStartTime: Date, utcEndTime: Date, groupCategory: string) {
    return new Promise<ISummarizedTasks[]>((resolve: (value: ISummarizedTasks[]) => void) => {
      const statisticsPromise = this.commitService.getStatistics(utcStartTime, utcEndTime, groupCategory);
      statisticsPromise.then((stats: string) => {
        if (!stats) {
          console.error('cannot display stats as stats=' + stats);
          return;
        }
        const parsedStats: ISummarizedTasks[] = this.sessionStorageSerializationService.deSerialize(stats);
        if (!parsedStats) {
          console.error('no stats received');
          return;
        }

        this.summarizedTasksByCategory = parsedStats;
        resolve(this.summarizedTasksByCategory);
      });
      statisticsPromise.catch((err: any) => {
        console.error(err);
      });
    });
  }
}
