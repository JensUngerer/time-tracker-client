import { Injectable } from '@angular/core';
import * as _ from 'underscore';
import { DurationCalculator } from '../../../common/typescript/helpers/durationCalculator';
import { ISummarizedTimeEntries } from '../../../common/typescript/iSummarizedTimeEntries';
import { ITimeSummary } from '../../../common/typescript/iTimeSummary';
import { ITasksDocument } from '../../../common/typescript/mongoDB/iTasksDocument';
import { ITimeRecordsDocumentData } from '../../../common/typescript/mongoDB/iTimeRecordsDocument';
import { ISummarizedTasks, ITaskLine } from '../../../common/typescript/summarizedData';
import { CommitService } from './commit.service';
import { ConfigurationService } from './configuration.service';
import { SessionStorageSerializationService } from './session-storage-serialization.service';
import routes from './../../../common/typescript/routes.js';
import { IStatistic } from '../../../common/typescript/iStatistic';
import { ITimeInterval } from '../../../common/typescript/iTimeInterval';

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

  getStatsData(utcStartTime: Date, utcEndTime: Date, groupCategory: string, isBookingBased: boolean, isTakenCareIsDisabled: boolean) {
    return new Promise<ISummarizedTasks[]>((resolve: (value: ISummarizedTasks[]) => void) => {
      const statisticsPromise = this.commitService.getStatistics(utcStartTime, utcEndTime, groupCategory, isBookingBased, isTakenCareIsDisabled);
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

  enrichStats(oneRawStatistics: ISummarizedTasks): ISummarizedTasks {
    // const enrichedStats: ISummarizedTasks = [];
    // if (!oneRawStatistics || !oneRawStatistics.lines.length) {
    //   return enrichedStats;
    // }
    // rawStats.forEach((oneRawStatistics: ISummarizedTasks, rawStatsIndex: number) => {
    const enrichedLines: ITaskLine[] = [];
    oneRawStatistics.lines.forEach((oneRawLine) => {
      if (this.configurationService &&
        this.configurationService.configuration &&
        this.configurationService.configuration.taskBasedIdentifierBaseUrl) {
        enrichedLines.push({
          _taskId: oneRawLine._taskId,
          durationFraction: oneRawLine.durationFraction,
          _timeEntryIds: oneRawLine._timeEntryIds,
          durationInHours: oneRawLine.durationInHours,
          taskDescription: oneRawLine.taskDescription,
          taskNumber: oneRawLine.taskNumber,
          taskNumberUrl: this.configurationService.configuration.taskBasedIdentifierBaseUrl + '/' + oneRawLine.taskNumber
        });
      }
      // });

    });
    // return enrichedStats;
    const enrichedValue = {
      _timeEntryIds: oneRawStatistics._timeEntryIds,
      category: oneRawStatistics.category,
      durationFraction: oneRawStatistics.durationFraction,
      durationSum: oneRawStatistics.durationSum,
      lines: enrichedLines
    };
    return enrichedValue;
  }

  submitTaskedBased(/*currentDayOption: IDurationSumBase, durations: ICommitBase[]*/summarizedTasksByCategoryBuffer: ISummarizedTasks[], day: Date) {
    return new Promise((resolve: (value?: any) => void) => {
      // 1) TODO: mark all the time-entries of the summarized tasks as disabled (for the commit view)
      if (!summarizedTasksByCategoryBuffer || !summarizedTasksByCategoryBuffer.length) {
        console.error('impossible to submit:' + JSON.stringify(summarizedTasksByCategoryBuffer, null, 4));
        resolve(false);
        return;
      }
      // const timeEntryIdsBuffers: string[][] = [];
      // let allTimeEntryIds: string[] = [];
      summarizedTasksByCategoryBuffer.forEach((oneTaskBlock) => {
        const currentTaskLines = oneTaskBlock.lines;

        // const currentTimeEntryIds = oneTaskBlock._timeEntryIds;
        // const currentDurationInHours = oneTaskBlock.durationFraction;
        // const currentDurationInMilliseconds = oneTaskBlock.durationSum;
        // let oneTimeEntryIdsBuffer = [];

        // // if (!taskLines || !taskLines.length) {
        // //   return; // continue!
        // // }
        // // let oneTimeEntryIdsBuffer = [];
        // // taskLines.forEach((oneTaskSummaryLine) => {
        // //   // 1)
        // //   // const timeRecordData: ITimeRecordsDocumentData = {
        // //   //   _bookingDeclarationId: null,
        // //   //   _timeEntryIds: commitBase._timeEntryIds,
        // //   //   dateStructure: DurationCalculator.getCurrentDateStructure(new Date(currentDayOption.day)),
        // //   //   durationInHours: commitBase.durationInHours,
        // //   //   durationInMilliseconds: commitBase.durationSumInMilliseconds,
        // //   //   durationStructure: DurationCalculator.getSumDataStructureFromMilliseconds(commitBase.durationSumInMilliseconds),
        // //   //   _taskId: (commitBase.basis as ITask).taskId,
        // //   // };

        // //   // 2)
        //   oneTimeEntryIdsBuffer = oneTimeEntryIdsBuffer.concat(oneTaskSummaryLine._timeEntryIds);
        // // });
        // allTimeEntryIds = allTimeEntryIds.concat(currentTimeEntryIds);

        // 1) TODO: send all task - based entries to server (as routes.commitTimeRecordsCollectionName entries)
        if (currentTaskLines && currentTaskLines.length) {
          let taskBasedIndex = 0;
          const loop = () => {
            if (taskBasedIndex >= currentTaskLines.length) {
              resolve(true);
              return;
            }
            const oneTaskBasedLine = currentTaskLines[taskBasedIndex];
            const currentTimeRecordDataForTask: ITimeRecordsDocumentData = {
              _bookingDeclarationId: null,
              _timeEntryIds: oneTaskBasedLine._timeEntryIds,
              dateStructure: DurationCalculator.getCurrentDateStructure(day),
              durationInHours: oneTaskBasedLine.durationInHours,
              // durationInMilliseconds: null,
              // durationStructure: DurationCalculator.getSumDataStructureFromMilliseconds(currentDurationInMilliseconds), // TODO: implement
              _taskId: oneTaskBasedLine._taskId,
            };

            const postCommitPromise = this.commitService.postCommit(routes.commitTimeRecordsCollectionName, currentTimeRecordDataForTask);
            postCommitPromise.then((postCommitResult: string) => {
              // DEBUGGING:
              console.log(postCommitResult);

              // lastPostCommitResult = postCommitResult;
              // indexInLoop++;
              // loop();
              taskBasedIndex++;
              loop();
            });
          };

          // initial call
          loop();

          // currentTaskLines.forEach((oneTaskBasedLine) => {

          // });
        }



        // return timeRecordData;


        // timeEntryIdsBuffers.push(currentTimeEntryIds);
      });

      // DEBUGGING:
      // console.log(JSON.stringify(timeEntryIdsBuffers, null, 4));



      // return this.postTimeEntryService.post(routes.commitTimeRecordsCollectionName, durations, currentDayOption as ITasksDurationSum,
      //   (currentDayOption: ITasksDurationSum) => {
      //     this.deleteAndSwitchToNext(currentDayOption);
      //   },
      //   (commitBase: ICommitBase) => {
      //     const timeRecordData: ITimeRecordsDocumentData = {
      //       _bookingDeclarationId: null,
      //       _timeEntryIds: commitBase._timeEntryIds,
      //       dateStructure: DurationCalculator.getCurrentDateStructure(new Date(currentDayOption.day)),
      //       durationInHours: commitBase.durationInHours,
      //       durationInMilliseconds: commitBase.durationSumInMilliseconds,
      //       durationStructure: DurationCalculator.getSumDataStructureFromMilliseconds(commitBase.durationSumInMilliseconds),
      //       _taskId: (commitBase.basis as ITask).taskId,
      //     };

      //     return timeRecordData;
      //   });
    });
  }

  public async submitBookingBased(oneBookingLine: IStatistic, currentDayInterval: ITimeInterval) {
    const timeRecordData: ITimeRecordsDocumentData = {
      _bookingDeclarationId: oneBookingLine.uniqueId,
      _timeEntryIds: oneBookingLine._timeEntryIds,
      dateStructure: DurationCalculator.getCurrentDateStructure(currentDayInterval.utcStartTime),
      durationInHours: oneBookingLine.durationInHours,
      // durationInMilliseconds: commitBase.durationSumInMilliseconds,
      // durationStructure: DurationCalculator.getSumDataStructureFromMilliseconds(commitBase.durationSumInMilliseconds),
      _taskId: null,
    };
    const postCommitPromise = this.commitService.postCommit(routes.timeRecordsCollectionName, timeRecordData);
    const postCommitServerData = await postCommitPromise;
    return postCommitServerData;
  }

}
