import { InMemoryDataService } from './in-memory-data.service';
import { Injectable } from '@angular/core';
import { ITask } from '../../../common/typescript/iTask';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly tasksKey = 'tasks';

  constructor(private inMemoryDataService: InMemoryDataService) { }

  public addTask(taskName: string) {
    this.inMemoryDataService.push(this.tasksKey, taskName);
  }

  public getTasks(): ITask[] {
    return this.inMemoryDataService.get(this.tasksKey);
  }

}
