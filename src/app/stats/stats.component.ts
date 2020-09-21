import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import { formatDate } from '@angular/common';
import { CommitService } from '../commit.service';
import { ISummarizedTimeEntries } from './../../../../common/typescript/iSummarizedTimeEntries';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { ITasksDocument } from './../../../../common/typescript/mongoDB/iTasksDocument';
import { ISummarizedTasks, ITaskLine } from './../../../../common/typescript/summarizedData';

@Component({
  selector: 'mtt-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  queryTimeStartFormControlName = 'theQueryStartTime';
  queryTimeEndFormControlName = 'theQueryEndTime';
  // buttonFormControlName = "theQueryButton";

  queryTimeFormGroup: FormGroup;

  summarizedTasksByCategory: ISummarizedTasks[] = [];

  isQuerySelectionVisible = true;

  constructor(@Inject(LOCALE_ID) private currentLocale,
    private commitService: CommitService,
    private sessionStorageSerializationService: SessionStorageSerializationService) { }

  ngOnInit(): void {
    const configObj: { [key: string]: AbstractControl } = {};
    const currentTime = Date.now();
    // https://stackoverflow.com/questions/35144821/angular-use-pipes-in-services-and-components
    // https://stackoverflow.com/questions/46715543/how-to-bind-date-time-form-control
    // https://stackoverflow.com/questions/50362854/how-to-change-time-from-24-to-12-hour-format-in-angular-5
    const requiredDateTimeFormat = "yyyy-MM-ddTHH:mm"
    const cestOffset = "UTC";
    const formattedCurrentTime = formatDate(currentTime, requiredDateTimeFormat, this.currentLocale, cestOffset);

    configObj[this.queryTimeStartFormControlName] = new FormControl(formattedCurrentTime);
    configObj[this.queryTimeEndFormControlName] = new FormControl(formattedCurrentTime);
    // configObj[this.buttonFormControlName] = new FormControl();
    this.queryTimeFormGroup = new FormGroup(configObj);
  }

  // TODO: move to common
  convertToUtc(date: Date) {
    // https://stackoverflow.com/questions/948532/how-do-you-convert-a-javascript-date-to-utc
    const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
      date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    return new Date(utc);
  }


  onQueryTime($event: any) {
    this.isQuerySelectionVisible = false;
    // DEBUGGING
    // console.log($event[this.queryTimeStartFormControlName]);
    // console.log($event[this.queryTimeEndFormControlName]);

    // console.log(this.convertToUtc(new Date($event[this.queryTimeStartFormControlName])).toUTCString());
    // console.log(this.convertToUtc(new Date($event[this.queryTimeEndFormControlName])).toUTCString());
    const startTime = new Date($event[this.queryTimeStartFormControlName]);
    const utcStartTime = this.convertToUtc(startTime);
    const endTime = new Date($event[this.queryTimeEndFormControlName]);
    const utcEndTime = this.convertToUtc(endTime);

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
          console.log('done');
          return;
        }
        const oneParsedStatistics = parsedStats[outerLoopCtr];

        // parsedStats.forEach(oneParsedStatistics => {
        console.log(JSON.stringify(oneParsedStatistics, null, 4));

        const taskIds = Object.keys(oneParsedStatistics.durationSumByTaskId);
        console.log(JSON.stringify(taskIds, null, 4));

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
  }

}
