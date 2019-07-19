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

  public summarizeDurationFor(projectId: string): string {
    // const foundProject: IProject = this.inMemoryDataService.getProjectById(projectId);;
    // if (!foundProject) {
    //   console.error('no project found in order to summarize duration for:' + projectId);
    //   return;
    // }

    const tasksByProjectId: ITask[] = this.inMemoryDataService.getTasksByProjectId(projectId);
    if (!tasksByProjectId || tasksByProjectId.length === 0) {
      console.error('!tasksByProjectId');
      return;
    }
    let durationSum = 0;
    const timeEntryStrings: string[] = [];
    tasksByProjectId.forEach((singleTask: ITask) => {
      const taskId = singleTask.taskId;
      const timeEntries: ITimeEntry[] = this.inMemoryDataService.getTimeEntriesByTaskId(taskId);
      if (!timeEntries || timeEntries.length === 0) {
        console.error('!timeEntries || timeEntries.length === 0');
        return;
      }
      timeEntries.forEach((oneTimeEntry: ITimeEntry) => {
        durationSum += oneTimeEntry.duration;
        timeEntryStrings.push(oneTimeEntry.timeEntryId + ': ' + oneTimeEntry.duration);
      });
    });

    const minutes = durationSum % 60;
    const hours = Math.floor(durationSum / 60);

    let returnString = '';
    timeEntryStrings.forEach((oneTimeEntryString: string) => {
      returnString += oneTimeEntryString + '\r \n';
    });
    returnString += '===========' + '\r \n';
    returnString += this.ensureTwoDigits(hours) + ':' + this.ensureTwoDigits(minutes);

    return returnString;
  }

  private ensureTwoDigits(aNumber: number): string {
    if (aNumber <= 9) {
      return '0' + aNumber;
    }
    return aNumber.toString();
  }
}
