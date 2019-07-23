import { CommitService } from './commit.service';
import { Injectable, OnDestroy } from '@angular/core';
import { IStorageData } from './../../../common/typescript/iStorageData';
import { IProject } from '../../../common/typescript/iProject';
import { ITask } from '../../../common/typescript/iTask';
import { ITimeEntry } from '../../../common/typescript/iTimeEntry';
import { SessionStorageSerializationService } from './session-storage-serialization.service';
import { IProjectsDocument } from './../../../common/typescript/mongoDB/iProjectsDocument';
import { ITasksDocument } from './../../../common/typescript/mongoDB/iTasksDocument';
import { BehaviorSubject } from 'rxjs';

// https://stackoverflow.com/questions/45898948/angular-4-ngondestroy-in-service-destroy-observable
@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements OnDestroy {

  private readonly sessionStorageKey = 'meanTimeTrackerInMemoryDataStorage';

  private readonly beforeUnloadEventName = 'beforeunload';

  private storage: IStorageData;

  private isReady$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private saveStorageListener() {
    const serializedStorage: string = this.sessionStorageSerializationService.serialize<IStorageData>(this.storage);
    window.sessionStorage.setItem(this.sessionStorageKey, serializedStorage);
  }

  constructor(private sessionStorageSerializationService: SessionStorageSerializationService,
    private commitService: CommitService) {
    const containedDataStr: string = window.sessionStorage.getItem(this.sessionStorageKey);
    if (containedDataStr) {
      this.storage = this.sessionStorageSerializationService.deSerialize<IStorageData>(containedDataStr);
      this.isReady$.next(true);
    } else {
      const tasksPromise: Promise<string> = this.commitService.getTasks();
      this.storage = {
        // users: null,
        projects: null,
        tasks: null,
        timeEntries: null
      };

      // retrieve projects (again!) from DB - but only if they are not marked as isDeletedInClient
      const projectsPromise: Promise<string> = this.commitService.getProjects();
      projectsPromise.then((projectDocs: string) => {
        this.storage.projects = this.sessionStorageSerializationService.deSerialize<IProjectsDocument[]>(projectDocs);
        // this.isReady$.next(true);

        // retrieve from DB (again)
        tasksPromise.then((taskDocs: string) => {
          this.storage.tasks = this.sessionStorageSerializationService.deSerialize<ITasksDocument[]>(taskDocs)
          this.isReady$.next(true);
        });
        tasksPromise.catch(() => {
          console.error('tasksPromise.catch');
        });
      });
      projectsPromise.catch(() => {
        console.error('projectsPromise.catch');
        this.isReady$.next(true);
      });



    }

    window.addEventListener(this.beforeUnloadEventName, (event: any) => {
      this.saveStorageListener();
    });
  }

  public ngOnDestroy(): void {
    window.removeEventListener(this.beforeUnloadEventName, this.saveStorageListener);
  }

  public areTimeEntriesAvailableForProjectId(projectId: string) {
    let isAvailable = true;
    const tasks = this.getTasksByProjectId(projectId);
    if (!tasks || tasks.length === 0) {
      isAvailable = false;
    } else {
      tasks.forEach((oneTask: ITask) => {
        const timeEntries = this.getTimeEntriesByTaskId(oneTask.taskId);
        if (!timeEntries || timeEntries.length === 0) {
          isAvailable = false;
        }
      });
    }

    return isAvailable;
  }

  public clearTimeEntries(entryIdsToClear: string[]) {
    for (let currentIndex = entryIdsToClear.length - 1; currentIndex >= 0; currentIndex--) {
      const currentIndexToClear = this.storage.timeEntries.findIndex((iteratedTimeEntry: ITimeEntry) => {
        return iteratedTimeEntry.timeEntryId === entryIdsToClear[currentIndex];
      });
      if (currentIndexToClear !== -1) {
        this.storage.timeEntries.splice(currentIndexToClear, 1);
      } else {
        console.error('unable to clear the timeEntryId:' + JSON.stringify(entryIdsToClear[currentIndex]));
      }
    }
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
    const tasksStorage = this.storage['tasks'];
    if (!tasksStorage) {
      console.error('no tasks for projectId:' + projectId);
      return [];
    }

    const tasks: ITask[] = tasksStorage.filter((oneTask: ITask) => {
      return oneTask._projectId === projectId;
    });
    if (!tasks || tasks.length === 0) {
      console.error('!tasks || tasks.length === 0');
      return null;
    }
    return tasks;
  }

  public getTimeEntriesByTaskId(taksId: string) {
    const storageEntries: ITimeEntry[] = this.storage['timeEntries'];
    if (!storageEntries) {
      return null;
    }
    const timeEntries: ITimeEntry[] = storageEntries.filter((oneTimeEntry: ITimeEntry) => {
      return oneTimeEntry._taskId === taksId;
    });
    if (!timeEntries || timeEntries.length === 0) {
      console.error('!timeEntries || timeEntries.length === 0');
      return null;
    }
    return timeEntries;
  }

  public getIsReady(): BehaviorSubject<boolean> {
    return this.isReady$;
  }
}
