import { Injectable } from '@angular/core';
import * as _ from 'underscore';
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
  constructor(private commitService: CommitService,
    private sessionStorageSerializationService: SessionStorageSerializationService,
    private configurationService: ConfigurationService) { }

  getNonCommittedDays() {
    return this.commitService.getNonCommittedDays();
  }

  getStatsData(utcStartTime: Date, utcEndTime: Date, groupCategory: string) {
    return new Promise<ISummarizedTasks[]>((resolve: (value: ISummarizedTasks[]) => void) => {
      const statisticsPromise = this.commitService.getStatistics(utcStartTime, utcEndTime, groupCategory);
      statisticsPromise.then((stats: string) => {
        if (!stats) {
          console.error('cannot display stats as stats=' + stats);
          resolve(null);
          return;
        }
        const parsedStats: ISummarizedTasks[] = this.sessionStorageSerializationService.deSerialize(stats);
        if (!parsedStats) {
          console.error('no stats received');
          resolve(null);
          return;
        }

        const summarizedTasksByCategory = parsedStats;
        resolve(summarizedTasksByCategory);
      });
      statisticsPromise.catch((err: any) => {
        console.error(err);
      });
    });
  }

  enrichStats(rawStats: ISummarizedTasks[]): ISummarizedTasks[][] {
    const enrichedStats: ISummarizedTasks[][] = [];
    if (!rawStats || !rawStats.length) {
      return enrichedStats;
    }
    enrichedStats.push(_.clone(rawStats));
    rawStats.forEach((oneRawStatistics: ISummarizedTasks, rawStatsIndex: number) => {
      const linesToEnrich = enrichedStats[0][rawStatsIndex].lines;
      const lines = oneRawStatistics.lines;
      if (!lines || !lines.length) {
        return; // continue ...
      }
      lines.forEach((oneLine, oneLineIndex: number) => {
        if (this.configurationService &&
          this.configurationService.configuration &&
          this.configurationService.configuration.taskBasedIdentifierBaseUrl) {
          linesToEnrich[oneLineIndex].taskNumberUrl = this.configurationService.configuration.taskBasedIdentifierBaseUrl + '/' + oneLine.taskNumber;
        }
      });
    });
    return enrichedStats;
  }
}
