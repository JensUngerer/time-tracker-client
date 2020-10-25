// import { InMemoryDataService } from './in-memory-data.service';
import { Injectable } from '@angular/core';
import { ITask } from '../../../common/typescript/iTask';
import { v4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly tasksKey = 'tasks';

  // constructor(private inMemoryDataService: InMemoryDataService) { }

  public createTask(taskName: string, projectId: string, bookingDeclarationId: string, taskNumber: string, taskCategory: string, groupCategory: string): ITask {
    const newTask: ITask = {
      number: taskNumber,
      name: taskName,
      taskId: v4(),
      _projectId: projectId,
      _bookingDeclarationId: bookingDeclarationId,
      taskCategory: taskCategory,
      groupCategory: groupCategory
    };
    // this.inMemoryDataService.push(this.tasksKey, newTask);

    return newTask;
  }

  // public getTasks(): ITask[] {
  //   // return this.inMemoryDataService.get(this.tasksKey);
  // }

}
