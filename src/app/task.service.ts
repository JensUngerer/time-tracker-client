import { Injectable } from '@angular/core';
import { ITask } from '../../../common/typescript/iTask';
import { v4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  public createTask(taskName: string, projectId: string, bookingDeclarationId: string, taskNumber: string, taskCategory: string, groupCategory: string): ITask {
    const newTask: ITask = {
      number: taskNumber,
      name: taskName,
      taskId: v4(),
      _projectId: projectId,
      durationSumInMillisecondsMap: null,
      _bookingDeclarationId: bookingDeclarationId,
      taskCategory: taskCategory,
      groupCategory: groupCategory
    };
    return newTask;
  }
}
