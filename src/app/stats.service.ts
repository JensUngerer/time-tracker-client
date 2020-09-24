import { Injectable } from '@angular/core';
import { ISummarizedTimeEntries } from '../../../common/typescript/iSummarizedTimeEntries';
import { ITasksDocument } from '../../../common/typescript/mongoDB/iTasksDocument';
import { ISummarizedTasks, ITaskLine } from '../../../common/typescript/summarizedData';
import { CommitService } from './commit.service';
import { SessionStorageSerializationService } from './session-storage-serialization.service';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  summarizedTasksByCategory: ISummarizedTasks[] = [];

  constructor(private commitService: CommitService,
    private sessionStorageSerializationService: SessionStorageSerializationService) { }

  getStatsData(utcStartTime: Date, utcEndTime: Date) {
    return new Promise<ISummarizedTasks[]>((resolve: (value: ISummarizedTasks[]) => void) => {
      const statisticsPromise = this.commitService.getStatistics(utcStartTime, utcEndTime);
      statisticsPromise.then((stats: string) => {
        const parsedStats: ISummarizedTimeEntries[] = this.sessionStorageSerializationService.deSerialize(stats);
        if (!parsedStats || !parsedStats.length) {
          console.log('no stats received');
          return;
        }
        this.summarizedTasksByCategory = [];
        let outerLoopCtr = 0;
        const outerLoop = () => {
          if (outerLoopCtr >= parsedStats.length) {
            // console.log('done');

            // this.isQuerySelectionVisible = false;
            // this.isQueryDataVisible = true;
            // this.isPieChartButtonVisible = true;
            resolve(this.summarizedTasksByCategory);
            return;
          }
          const oneParsedStatistics = parsedStats[outerLoopCtr];

          // parsedStats.forEach(oneParsedStatistics => {
          // console.log(JSON.stringify(oneParsedStatistics, null, 4));

          const taskIds = Object.keys(oneParsedStatistics.durationSumByTaskId);
          // console.log(JSON.stringify(taskIds, null, 4));

          if (!taskIds || !taskIds.length) {
            console.error('not taskIds');
            return;
          }

          const tasks = [];
          let taskIdIndex = 0;
          const loop = () => {
            if (taskIdIndex >= taskIds.length) {
              // TODO:
              console.log(JSON.stringify(tasks, null, 4));

              const category = oneParsedStatistics.taskCategory;
              const lines: ITaskLine[] = [];
              tasks.forEach((oneTaskToMerge: ITasksDocument) => {
                const oneTaskToMergeId = oneTaskToMerge.taskId;
                // taskNumber
                const oneLine: ITaskLine = {
                  taskNumberUrl: '',
                  taskNumber: oneTaskToMerge.number,
                  taskDescription: oneTaskToMerge.name,
                  durationInHours: oneParsedStatistics.durationSumByTaskId[oneTaskToMergeId],
                  durationFraction: oneParsedStatistics.durationSumFractionByTaskId[oneTaskToMergeId]
                };
                // oneLine ['taskNumberUrl'] = '';
                // oneLine['taskNumber'] = ;
                // oneLine['taskDescription'] = ;
                // oneLine['durationInHours'] = ;
                // oneLine['durationFraction'] = ;
                lines.push(oneLine);
              });
              const durationSum = oneParsedStatistics.overallDurationSum;
              const durationFraction = oneParsedStatistics.overallDurationSumFraction;

              this.summarizedTasksByCategory.push({
                category,
                lines,
                durationSum,
                durationFraction
              });

              outerLoopCtr++;
              outerLoop();
              return;
            }
            const oneTaskId = taskIds[taskIdIndex];
            const oneTaskPromise = this.commitService.getTaskByTaskId(oneTaskId);
            oneTaskPromise.then((oneRawTask: string) => {
              // DEBUGGING
              console.log(oneRawTask);

              const oneParsedTask: ITasksDocument[] = this.sessionStorageSerializationService.deSerialize(oneRawTask);
              if (oneParsedTask && oneParsedTask.length === 1) {
                tasks.push(oneParsedTask[0]);
              } else {
                console.error('No task received');
              }

              taskIdIndex++;
              loop();
            });
            oneTaskPromise.catch((error: any) => {
              console.error(JSON.stringify(error, null, 4));
              taskIdIndex++;
              loop();
            });
          };
          // initial call
          loop();

          // });
        };
        // initial call
        outerLoop();
      })
      statisticsPromise.catch((err: any) => {
        console.error(err);
      });
    });
  }
}