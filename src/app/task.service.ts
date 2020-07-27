// import { InMemoryDataService } from './in-memory-data.service';
import { Injectable } from '@angular/core';
import { ITask } from '../../../common/typescript/iTask';
import uuid from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly tasksKey = 'tasks';

  // constructor(private inMemoryDataService: InMemoryDataService) { }

  public createTask(taskName: string, projectId: string, bookingDeclarationId: string, taskNumber: string): ITask {
    const newTask: ITask = {
      number: taskNumber,
      name: taskName,
      taskId: uuid.v4(),
      _projectId: projectId,
      _bookingDeclarationId: bookingDeclarationId
    };
    // this.inMemoryDataService.push(this.tasksKey, newTask);

    return newTask;
  }

  // public getTasks(): ITask[] {
  //   // return this.inMemoryDataService.get(this.tasksKey);
  // }

}
