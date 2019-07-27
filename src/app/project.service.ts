import { TaskService } from './task.service';
import { InMemoryDataService } from './in-memory-data.service';
import { Injectable } from '@angular/core';
import uuid from 'uuid';
import { IProject } from '../../../common/typescript/iProject';
import { ITask } from '../../../common/typescript/iTask';
import { ITimeEntry } from '../../../common/typescript/iTimeEntry';
import { HelpersService } from './helpers.service';
import { IDuration } from '../../../common/typescript/iDuration';
import { ITimeRecordsDocumentData, IExtendedTimeRecordsDocumentData } from '../../../common/typescript/mongoDB/iTimeRecordsDocument';
import { IDate } from '../../../common/typescript/iDate';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private readonly projectsKey = 'projects';

  constructor(private inMemoryDataService: InMemoryDataService,
    private helpersService: HelpersService,
    private taskService: TaskService) { }

  public addProject(projectName: string): IProject {
    const newProject: IProject = {
      name: projectName,
      projectId: uuid.v4()
    };

    this.inMemoryDataService.push(this.projectsKey, newProject);
    return newProject;
  }

  public deleteProject(projectId: string) {
    const allProjects: IProject[] = this.inMemoryDataService.get('projects');
    if (!allProjects || allProjects.length === 0) {
      console.error('no projects found!');
      return;
    }
    const projectIndex = allProjects.findIndex((oneProject: IProject) => {
      return oneProject.projectId === projectId;
    });
    if (projectIndex !== -1) {
      const taskIdsToDelete = this.getTaskIdsToProjectId(projectId);
      const allTasksInMem = this.inMemoryDataService.get('tasks');
      taskIdsToDelete.forEach((currentTaskIdToDelete: string) => {
        const taskIndex = allTasksInMem.findIndex((theTask: ITask) => {
          return theTask.taskId === currentTaskIdToDelete;
        });
        if (taskIndex !== -1) {
          allTasksInMem.splice(taskIndex, 1);
        } else {
          console.error('cannot delete taskId:' + currentTaskIdToDelete);
        }
      });

      allProjects.splice(projectIndex, 1);
    } else {
      console.error('cannot delete projectId:' + projectId);
    }
  }

  public getProjects(): IProject[] {
    return this.inMemoryDataService.get(this.projectsKey);
  }

  public summarizeDurationFor(projectId: string): IExtendedTimeRecordsDocumentData {
    const tasksByProjectId: ITask[] = this.inMemoryDataService.getTasksByProjectId(projectId);
    if (!tasksByProjectId || tasksByProjectId.length === 0) {
      console.error('!tasksByProjectId');
      return;
    }
    // const isDataAvailable = this.inMemoryDataService.areTimeEntriesAvailableForProjectId(projectId);
    // if (!isDataAvailable) {
    //   return null;
    // }

    const sumValue: ITimeRecordsDocumentData = {
      durationStructure: this.getDurationStructureOfOneProject(tasksByProjectId),
      dateStructure: this.getDateStructureOfOneProject(tasksByProjectId),
      _taskIds: this.getTaskIdsOfOneProject(tasksByProjectId),
      _projectId: projectId
    };

    // return {
    //   data: sumValue,
    //   timeEntryIds: this.getTimeEntryIdsFor(tasksByProjectId)
    // };
    return {
      data: null,
      timeEntryIds: null
    };
  }

  private getTimeEntryIdsFor(tasksByProjectId: ITask[]) {
    // let buffer: string[] = [];
    // tasksByProjectId.forEach((oneTask: ITask) => {
    //   const timeEntries = this.inMemoryDataService.getTimeEntriesByTaskId(oneTask.taskId);
    //   if (!timeEntries) {
    //     return;
    //   }
    //   const theIds = timeEntries.map((oneTimeEntry: ITimeEntry) => {
    //     return oneTimeEntry.timeEntryId;
    //   });
    //   buffer = buffer.concat(theIds);
    // });
    // return buffer;
    console.error('implement: getTimeEntryIdsFor');
  }

  private getTaskIdsOfOneProject(tasksByProjectId: ITask[]): string[] {
    const taskIds: string[] = [];

    tasksByProjectId.forEach((oneTask: ITask) => {
      taskIds.push(oneTask.taskId);
    });

    return taskIds;
  }

  private summarizeDurationsOfOneTask(singleTask: ITask): number {
    let tasksDurationSum = 0;
    // const timeEntries: ITimeEntry[] = this.inMemoryDataService.getTimeEntriesByTaskId(singleTask.taskId);
    // if (!timeEntries || timeEntries.length === 0) {
    //   console.error('!timeEntries || timeEntries.length === 0');
    //   return;
    // }
    // timeEntries.forEach((oneTimeEntry: ITimeEntry) => {
    //   tasksDurationSum += oneTimeEntry.duration;
    // });
    return tasksDurationSum;
  }

  private getMinDateValuesOfOneTask(singleTask: ITask): Date {
    let storedTime = new Date().getTime();
    let storedDate = null;
    // const timeEntries: ITimeEntry[] = this.inMemoryDataService.getTimeEntriesByTaskId(singleTask.taskId);
    // if (!timeEntries || timeEntries.length === 0) {
    //   console.error('!timeEntries || timeEntries.length === 0');
    //   return;
    // }
    // timeEntries.forEach((oneTimeEntry: ITimeEntry) => {
    //   const currentStartTime = oneTimeEntry.startTime.getTime();
    //   if (currentStartTime < storedTime) {
    //     storedTime = currentStartTime;
    //     storedDate = oneTimeEntry.startTime;
    //   }
    // });
    return storedDate;
  }

  private getMaxDateValueOfOneTask(singleTask: ITask): Date {
    let storedTime = 0;
    let storedDate = null;

    // const timeEntries: ITimeEntry[] = this.inMemoryDataService.getTimeEntriesByTaskId(singleTask.taskId);
    // if (!timeEntries || timeEntries.length === 0) {
    //   console.error('!timeEntries || timeEntries.length === 0');
    //   return;
    // }

    // timeEntries.forEach((oneTimeEntry: ITimeEntry) => {
    //   const currentEndTime = oneTimeEntry.endTime.getTime();
    //   if (currentEndTime > storedTime) {
    //     storedTime = currentEndTime;
    //     storedDate = oneTimeEntry.endTime;
    //   }
    // });

    return storedDate;
  }

  // TODO: necessary ?
  // private getEarliestStartOfEntireProject(earliestStartTimesOfTasks: Date[]) {
  //   let storedTime = new Date().getTime();
  //   let storedDate = null;

  //   earliestStartTimesOfTasks.forEach((oneStartTime: Date) => {
  //     const currentStartTime = oneStartTime.getTime();
  //     if (currentStartTime < storedTime) {
  //       storedTime = currentStartTime;
  //       storedDate = oneStartTime;
  //     }
  //   });

  //   return storedDate;
  // }

  private getLatestEndOfEntireProject(latestEndTimesOfTasks: Date[]) {
    let storedTime = 0;
    let storedDate = null;

    latestEndTimesOfTasks.forEach((oneEndTime: Date) => {
      const currentTime = oneEndTime.getTime();
      if (currentTime > storedTime) {
        storedTime = currentTime;
        storedDate = oneEndTime;
      }
    });

    return storedDate;
  }

  private getDateStructureOfOneProject(tasksByProjectId: ITask[]): IDate {
    const earliestStartTimesOfTasks: Date[] = [];
    const latestEndTimesOfTasks: Date[] = [];
    tasksByProjectId.forEach((singleTask: ITask) => {
      const earliestStart: Date = this.getMinDateValuesOfOneTask(singleTask);
      if (earliestStart) {
        earliestStartTimesOfTasks.push(earliestStart);
      }
      const latestEnd: Date = this.getMaxDateValueOfOneTask(singleTask);
      if (latestEnd) {
        latestEndTimesOfTasks.push(latestEnd);
      }
    });

    // TODO: necessary ?
    // const earliestStartOfEntireProject = this.getEarliestStartOfEntireProject(earliestStartTimesOfTasks);

    const latestEndOfEntireProject = this.getLatestEndOfEntireProject(latestEndTimesOfTasks);
    if (!latestEndOfEntireProject) {
      return null;
    }
    return this.helpersService.getDateStructure(latestEndOfEntireProject);
  }

  private summarizeDurationsOfOneProject(tasksByProjectId: ITask[]): number {
    let durationOverallSum = 0;
    tasksByProjectId.forEach((singleTask: ITask) => {
      const durationOfOneTask: any = this.summarizeDurationsOfOneTask(singleTask);
      durationOverallSum += durationOfOneTask;
    });
    return durationOverallSum;
  }

  private getDurationStructureOfOneProject(tasksByProjectId: ITask[]): IDuration {
    const durationOverallSum = this.summarizeDurationsOfOneProject(tasksByProjectId);

    const minutes = durationOverallSum % 60;
    const hours = Math.floor(durationOverallSum / 60);

    return this.helpersService.getDurationStructure(hours, minutes);
  }

  private getTaskIdsToProjectId(projectId: string): string[] {
    const allTasksInMemory: ITask[] = this.inMemoryDataService.get('tasks');
    if (!allTasksInMemory || allTasksInMemory.length === 0) {
      return [];
    }
    const correspondingTasks: ITask[] = allTasksInMemory.filter((oneTask: ITask) => {
      return oneTask._projectId === projectId;
    });
    if (!correspondingTasks || correspondingTasks.length === 0) {
      return [];
    }
    const theTaskIds: string[] = correspondingTasks.map((oneCorrespondingTask: ITask) => {
      return oneCorrespondingTask.taskId;
    });
    if (!theTaskIds || theTaskIds.length === 0) {
      return [];
    }
    return theTaskIds;
  }
}
