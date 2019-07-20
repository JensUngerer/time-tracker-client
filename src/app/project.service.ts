import { ICommitLine } from './typescript/iCommitLine';
import { InMemoryDataService } from './in-memory-data.service';
import { Injectable } from '@angular/core';
import uuid from 'uuid';
import { IProject } from '../../../common/typescript/iProject';
import { ITask } from '../../../common/typescript/iTask';
import { ITimeEntry } from '../../../common/typescript/iTimeEntry';
import { HelpersService } from './helpers.service';
import { IGridCommitLine } from './../../../common/typescript/iGridCommitLine';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private readonly projectsKey = 'projects';

  constructor(private inMemoryDataService: InMemoryDataService,
              private helpersService: HelpersService) { }

  public addProject(projectName: string): string {
    const newProject: IProject = {
      name: projectName,
      projectId: uuid.v4()
    };

    this.inMemoryDataService.push(this.projectsKey, newProject);
    return newProject.projectId;
  }

  public getProjects(): IProject[] {
    return this.inMemoryDataService.get(this.projectsKey);
  }

  public getProjectByProjectId(projectId: string) {
  }

  public summarizeDurationFor(projectId: string): IGridCommitLine[] {
    const tasksByProjectId: ITask[] = this.inMemoryDataService.getTasksByProjectId(projectId);
    if (!tasksByProjectId || tasksByProjectId.length === 0) {
      console.error('!tasksByProjectId');
      return;
    }
    // let concatenatedDescriptions = '';
    let durationOverallSum = 0;
    const commitLines: IGridCommitLine[] = [];
    tasksByProjectId.forEach((singleTask: ITask) => {
      let tasksSum = 0;

      let tasksEarliestStartDate: Date = null;
      let tasksEarliestStartNumber = new Date().getTime();

      let tasksLatestEndDate: Date = null;
      let tasksLatestEndNumber = 0;

      // concatenatedDescriptions += singleTask.name + '\n';

      const taskId = singleTask.taskId;
      const oneCommitLine: IGridCommitLine = {
        description: singleTask.name,
        startTime: null,
        endTime: null,
        dateStructure: null,
        durationStructure: null,
        durationStr: null
      };
      const timeEntries: ITimeEntry[] = this.inMemoryDataService.getTimeEntriesByTaskId(taskId);
      if (!timeEntries || timeEntries.length === 0) {
        console.error('!timeEntries || timeEntries.length === 0');
        return;
      }
      timeEntries.forEach((oneTimeEntry: ITimeEntry) => {
        durationOverallSum += oneTimeEntry.duration;
        tasksSum += oneTimeEntry.duration;

        if (oneTimeEntry.startTime.getTime() < tasksEarliestStartNumber) {
          tasksEarliestStartNumber = oneTimeEntry.startTime.getTime();
          tasksEarliestStartDate = oneTimeEntry.startTime;
        }
        if (oneTimeEntry.endTime.getTime() > tasksLatestEndNumber) {
          tasksLatestEndNumber = oneTimeEntry.endTime.getTime();
          tasksLatestEndDate = oneTimeEntry.endTime;
        }
      });

      const taskSumInMinutes = tasksSum % 60;
      const taskSumInHours = Math.floor(tasksSum / 60);

      oneCommitLine.durationStructure = this.helpersService.getDurationStructure(taskSumInHours, taskSumInMinutes);
      oneCommitLine.startTime = tasksEarliestStartDate;
      oneCommitLine.endTime = tasksLatestEndDate;
      oneCommitLine.durationStr = this.helpersService.getDurationStr(oneCommitLine.durationStructure.hours,
        oneCommitLine.durationStructure.minutes);

      oneCommitLine.dateStructure = this.helpersService.getDateStructure(tasksLatestEndDate);

      commitLines.push(oneCommitLine);
    });

    const minutes = durationOverallSum % 60;
    const hours = Math.floor(durationOverallSum / 60);

    const theStartDate = this.getMinValueOfDates(commitLines);
    const theEndDate = this.getMaxValueOfDates(commitLines);
    const sumLine: IGridCommitLine = {
      description: 'sum',
      endTime: theEndDate,
      startTime: theStartDate,
      durationStructure: this.helpersService.getDurationStructure(hours, minutes),
      dateStructure: this.helpersService.getDateStructure(theEndDate),
      durationStr: this.helpersService.getDurationStr(hours, minutes)
    };
    commitLines.push(sumLine);

    return commitLines;
  }

  private getMaxValueOfDates(lines: ICommitLine[]): Date {
    let theGetTime = 0;
    let theDate = null;

    lines.forEach((oneLine: ICommitLine) => {
      if (oneLine.endTime.getTime() > theGetTime) {
        theGetTime = oneLine.endTime.getTime();
        theDate = oneLine.endTime;
      }
    });

    return theDate;
  }

  private getMinValueOfDates(line: ICommitLine[]): Date {
    let theGetTime = new Date().getTime();
    let theDate = null;

    line.forEach((oneLine: ICommitLine) => {
      if (oneLine.startTime.getTime() < theGetTime) {
        theGetTime = oneLine.startTime.getTime();
        theDate = oneLine.startTime;
      }
    });

    return theDate;
  }
}
