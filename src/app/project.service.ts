import { ICommitLine } from './typescript/iCommitLine';
import { InMemoryDataService } from './in-memory-data.service';
import { Injectable } from '@angular/core';
import uuid from 'uuid';
import { IProject } from '../../../common/typescript/iProject';
import { ITask } from '../../../common/typescript/iTask';
import { ITimeEntry } from '../../../common/typescript/iTimeEntry';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private readonly projectsKey = 'projects';

  constructor(private inMemoryDataService: InMemoryDataService) { }

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

  public summarizeDurationFor(projectId: string): ICommitLine[] {
    const tasksByProjectId: ITask[] = this.inMemoryDataService.getTasksByProjectId(projectId);
    if (!tasksByProjectId || tasksByProjectId.length === 0) {
      console.error('!tasksByProjectId');
      return;
    }
    let durationOverallSum = 0;
    const commitLines: ICommitLine[] = [];
    tasksByProjectId.forEach((singleTask: ITask) => {
      let tasksSum = 0;

      let tasksEarliestStartDate: Date = null;
      let tasksEarliestStartNumber = new Date().getTime();

      let tasksLatestEndDate: Date = null;
      let tasksLatestEndNumber = 0;


      const taskId = singleTask.taskId;
      const oneCommitLine: ICommitLine = {
        description: singleTask.name,
        startTime: null,
        endTime: null,
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

        if (typeof(oneTimeEntry.startTime) === 'string') {
          oneTimeEntry.startTime = new Date(oneTimeEntry.startTime);
        }
        if (typeof(oneTimeEntry.endTime) === 'string') {
          oneTimeEntry.endTime = new Date(oneTimeEntry.endTime);
        }

        if (oneTimeEntry.startTime.getTime() < tasksEarliestStartNumber) {
          tasksEarliestStartNumber = oneTimeEntry.startTime.getTime();
          tasksEarliestStartDate = oneTimeEntry.startTime;
        }
        if (oneTimeEntry.endTime.getTime() > tasksLatestEndNumber) {
          tasksLatestEndNumber = oneTimeEntry.endTime.getTime();
          tasksLatestEndDate = oneTimeEntry.endTime;
        }
      });

      oneCommitLine.durationStr = this.ensureTwoDigits(Math.floor(tasksSum / 60)) + ':' + this.ensureTwoDigits(tasksSum % 60);
      oneCommitLine.startTime = tasksEarliestStartDate;
      oneCommitLine.endTime = tasksLatestEndDate;

      commitLines.push(oneCommitLine);
    });

    const minutes = durationOverallSum % 60;
    const hours = Math.floor(durationOverallSum / 60);

    const sumLine: ICommitLine = {
      description: 'sum',
      endTime: null,
      startTime: null,
      durationStr: this.ensureTwoDigits(hours) + ':' + this.ensureTwoDigits(minutes)
    };
    commitLines.push(sumLine);

    return commitLines;
  }

  private ensureTwoDigits(aNumber: number): string {
    if (aNumber <= 9) {
      return '0' + aNumber;
    }
    return aNumber.toString();
  }
}
