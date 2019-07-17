import { Injectable, OnDestroy } from '@angular/core';
import { IStorageData } from './../../../common/typescript/iStorageData';
import { IProject } from '../../../common/typescript/iProject';
import { IUser } from '../../../common/typescript/iUser';
import { ITask } from '../../../common/typescript/iTask';
import { ITimeEntry } from '../../../common/typescript/iTimeEntry';

// https://stackoverflow.com/questions/45898948/angular-4-ngondestroy-in-service-destroy-observable
@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements OnDestroy {

  private readonly sessionStorageKey = 'meanTimeTrackerInMemoryDataStorage';

  private readonly beforeUnloadEventName = 'beforeunload';

  private storage: IStorageData;

  private saveStorageListener() {
    window.sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(this.storage));
  }

  constructor() {
    const containedDataStr: string = window.sessionStorage.getItem(this.sessionStorageKey);
    if (containedDataStr) {
      this.storage = JSON.parse(containedDataStr);
    }
    else {
      this.storage = {
        users: null,
        projects: null,
        tasks: null,
        timeEntries: null
      };
    }

    window.addEventListener(this.beforeUnloadEventName, this.saveStorageListener);
  }

  public ngOnDestroy(): void {
    window.removeEventListener(this.beforeUnloadEventName, this.saveStorageListener);
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
    const foundTimeEntry = timeEntries.find((oneTimeEntry: ITimeEntry)=>{
      return oneTimeEntry.timeEntryId === timeEntryId;
    });
    if (!foundTimeEntry) {
      return null;
    }
    return foundTimeEntry;
  }

  public setTimeEntryById(timeEntryId: string, timeEntry: ITimeEntry) {
    // TODO: not necessary as reference in Array still exists -> so the entry is already updated?
    console.log('updated entry?');
    console.log(JSON.stringify(this.getTimeEntryById(timeEntryId)));
    console.log(timeEntry === this.getTimeEntryById(timeEntryId));
  }
}
