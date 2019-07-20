import { CommitService } from './commit.service';
import { Injectable, OnDestroy } from '@angular/core';
import { IStorageData } from './../../../common/typescript/iStorageData';
import { IProject } from '../../../common/typescript/iProject';
import { ITask } from '../../../common/typescript/iTask';
import { ITimeEntry } from '../../../common/typescript/iTimeEntry';
import { SessionStorageSerializationService } from './session-storage-serialization.service';
import { IProjectsDocument } from './../../../common/typescript/mongoDB/iProjectsDocument';
import { ITasksDocument } from './../../../common/typescript/mongoDB/iTasksDocument';

// https://stackoverflow.com/questions/45898948/angular-4-ngondestroy-in-service-destroy-observable
@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements OnDestroy {

  private readonly sessionStorageKey = 'meanTimeTrackerInMemoryDataStorage';

  private readonly beforeUnloadEventName = 'beforeunload';

  private storage: IStorageData;

  private saveStorageListener() {
    const serializedStorage: string = this.sessionStorageSerializationService.serialize(this.storage);
    window.sessionStorage.setItem(this.sessionStorageKey, serializedStorage);
  }

  constructor(private sessionStorageSerializationService: SessionStorageSerializationService,
              private commitService: CommitService) {
    const containedDataStr: string = window.sessionStorage.getItem(this.sessionStorageKey);
    if (containedDataStr) {
      this.storage = this.sessionStorageSerializationService.deSerialize(containedDataStr);
    } else {
      const projectsPromise: Promise<IProjectsDocument[]> = this.commitService.getProjects();
      const tasksPromise: Promise<ITasksDocument[]> = this.commitService.getTasks();
      this.storage = {
        users: null,
        projects: null,
        tasks: null,
        timeEntries: null
      };

      projectsPromise.then((docs: IProjectsDocument[]) => {
        this.storage.projects = docs;
      });
      projectsPromise.catch(() => {
        console.error('projectsPromise.catch');
      });

      tasksPromise.then((docs: ITasksDocument[]) => {
        this.storage.tasks = docs;
      });
      tasksPromise.catch(() => {
        console.error('tasksPromise.catch');
      })
    }

    window.addEventListener(this.beforeUnloadEventName, (event: any) => {
      this.saveStorageListener();
    });
  }

  public ngOnDestroy(): void {
    // window.removeEventListener(this.beforeUnloadEventName, this.saveStorageListener);
  }

  public getProjectById(projectId: string): IProject {
    if (!this.storage || !this.storage['projects']) {
      console.error('no storage to retrieve data from');
      return null;
    }
    const foundProject = this.storage['projects'].find((singleProject: IProject) => {
      return singleProject.projectId === projectId;
    });
    if (!foundProject) {
      return null;
    }
    return foundProject;
  }

  public set(key: keyof IStorageData, value: any) {
    this.storage[key] = value;
  }

  public push(key: keyof IStorageData, value: any) {
    if (!this.storage[key]) {
      this.storage[key] = [];
    }
    this.storage[key].push(value);
  }

  public get(key: keyof IStorageData): any[] {
    if (this.storage.hasOwnProperty(key)) {
      return this.storage[key];
    }
    return null;
  }

  public getTimeEntryById(timeEntryId: string): ITimeEntry {
    const timeEntries = this.get('timeEntries');
    if (!timeEntries) {
      return null;
    }
    const foundTimeEntry = timeEntries.find((oneTimeEntry: ITimeEntry) => {
      return oneTimeEntry.timeEntryId === timeEntryId;
    });
    if (!foundTimeEntry) {
      return null;
    }
    return foundTimeEntry;
  }

  public getTasksByProjectId(projectId: string) {
    const tasks: ITask[] = this.storage['tasks'].filter((oneTask: ITask) => {
      return oneTask._projectId === projectId;
    });
    if (!tasks || tasks.length === 0) {
      console.error('!tasks || tasks.length === 0');
      return null;
    }
    return tasks;
  }

  public getTimeEntriesByTaskId(taksId: string) {
    const timeEntries: ITimeEntry[] = this.storage['timeEntries'].filter((oneTimeEntry: ITimeEntry) => {
      return oneTimeEntry._taskId === taksId;
    });
    if (!timeEntries || timeEntries.length === 0) {
      console.error('!timeEntries || timeEntries.length === 0');
      return null;
    }
    return timeEntries;
  }
}
