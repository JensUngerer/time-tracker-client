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
import { ITimeEntryDocument } from './../../../common/typescript/mongoDB/iTimeEntryDocument';

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
      this.storage = {
        projects: null,
        tasks: null,
        // timeEntries: null
      };

      this.loadDataFromDb();
    }

    window.addEventListener(this.beforeUnloadEventName, (event: any) => {
      this.saveStorageListener();
    });
  }

  public loadDataFromDb() {
    this.isReady$.next(false);
    // retrieve projects (again!) from DB - but only if they are not marked as isDeletedInClient
    const projectsPromise: Promise<string> = this.commitService.getProjects();
    const tasksPromise: Promise<string> = this.commitService.getTasks();
    // const timeEntriesPromise: Promise<string> = this.commitService.getTimeEntries();

    projectsPromise.then((projectDocs: string) => {
      this.storage.projects = this.sessionStorageSerializationService.deSerialize<IProjectsDocument[]>(projectDocs);

      // retrieve from DB (again)
      tasksPromise.then((taskDocs: string) => {
        this.storage.tasks = this.sessionStorageSerializationService.deSerialize<ITasksDocument[]>(taskDocs);

        this.isReady$.next(true);

        // comment out of loading the timeEntries -> new approach: all operations on this data-structure is no longer done in the client
        // retrieve timeEntries
        // timeEntriesPromise.then((timeEntryDocs: string) => {
        //   this.storage.timeEntries = this.sessionStorageSerializationService.deSerialize<ITimeEntryDocument[]>(timeEntryDocs);

        //   this.isReady$.next(true);
        // });
        // timeEntriesPromise.catch(() => {
        //   console.error('timeEntriesPromises catch');
        //   this.isReady$.next(false);
        // });
      });
      tasksPromise.catch(() => {
        console.error('tasksPromise.catch');
        this.isReady$.next(false);
      });
    });
    projectsPromise.catch(() => {
      console.error('projectsPromise.catch');
      this.isReady$.next(false);
    });
  }

  public ngOnDestroy(): void {
    window.removeEventListener(this.beforeUnloadEventName, this.saveStorageListener);
  }

  public areTimeEntriesAvailableForProjectId(projectId: string) {
    // let isAvailable = true;
    // const tasks = this.getTasksByProjectId(projectId);
    // if (!tasks || tasks.length === 0) {
    //   isAvailable = false;
    // } else {
    //   tasks.forEach((oneTask: ITask) => {
    //     const timeEntries = this.getTimeEntriesByTaskId(oneTask.taskId);
    //     if (!timeEntries || timeEntries.length === 0) {
    //       isAvailable = false;
    //     }
    //   });
    // }

    // return isAvailable;
    console.error('implement: areTimeEntriesAvailableForProjectId');
  }

  public clearTimeEntries(entryIdsToClear: string[]) {
    // for (let currentIndex = entryIdsToClear.length - 1; currentIndex >= 0; currentIndex--) {
    //   const currentIndexToClear = this.storage.timeEntries.findIndex((iteratedTimeEntry: ITimeEntry) => {
    //     return iteratedTimeEntry.timeEntryId === entryIdsToClear[currentIndex];
    //   });
    //   if (currentIndexToClear !== -1) {
    //     this.storage.timeEntries.splice(currentIndexToClear, 1);
    //   } else {
    //     console.error('unable to clear the timeEntryId:' + JSON.stringify(entryIdsToClear[currentIndex]));
    //   }
    // }
    console.error('implement: clearTimeEntries');
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
    // const timeEntries = this.get('timeEntries');
    // if (!timeEntries) {
    //   return null;
    // }
    // const foundTimeEntry = timeEntries.find((oneTimeEntry: ITimeEntry) => {
    //   return oneTimeEntry.timeEntryId === timeEntryId;
    // });
    // if (!foundTimeEntry) {
    //   return null;
    // }
    // return foundTimeEntry;
    console.error('implement: getTimeEntryById');
    return null;
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

  public getTimeEntriesByTaskId(taskId: string) {
    // const storageEntries: ITimeEntry[] = this.storage['timeEntries'];
    // if (!storageEntries) {
    //   return null;
    // }
    // const timeEntries: ITimeEntry[] = storageEntries.filter((oneTimeEntry: ITimeEntry) => {
    //   return oneTimeEntry._taskId === taskId;
    // });
    // if (!timeEntries || timeEntries.length === 0) {
    //   console.error('!timeEntries || timeEntries.length === 0');
    //   return null;
    // }
    // return timeEntries;
    console.error('implement: getTimeEntriesByTaskId');
  }

  public deleteTimeEntriesByTaskId(taskId: string) {
    // const storageEntries: ITimeEntry[] = this.storage['timeEntries'];
    // if (!storageEntries) {
    //   console.error('no time entries at all');
    //   return null;
    // }

    // const correspondingTask = this.getTimeEntriesByTaskId(taskId);
    // if (!correspondingTask || correspondingTask.length === 0) {
    //   console.error('cannot delete timeEntries as no are found!');
    //   return;
    // }
    // const timeEntryIdsToDelete: string[] = [];
    // correspondingTask.forEach((timeEntryToDelete: ITimeEntry) => {
    //   timeEntryIdsToDelete.push(timeEntryToDelete.timeEntryId);
    // });

    // timeEntryIdsToDelete.forEach((timeEntryIdToDelete: string) => {
    //   const foundIndex = storageEntries.findIndex((theStoredTimeEntry: ITimeEntry) => {
    //     return theStoredTimeEntry.timeEntryId === timeEntryIdToDelete;
    //   });
    //   if (foundIndex !== -1) {
    //     storageEntries.splice(foundIndex, 1);
    //   } else {
    //     console.error('cannot delete timeEntryId:' + timeEntryIdToDelete);
    //   }
    // });
    console.error('implement: deleteTimeEntriesByTaskId');
  }

  public getIsReady(): BehaviorSubject<boolean> {
    return this.isReady$;
  }
}
