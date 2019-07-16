import { WindowService } from './window.service';
import { Injectable } from '@angular/core';
import { IStorageData } from './../../../common/typescript/iStorageData';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService {

  private readonly sessionStorageKey = 'meanTimeTrackerInMemoryDataStorage';

  private storage: IStorageData;

  constructor(private windowService: WindowService) {
    const containedDataStr: string = windowService.nativeWindow().sessionStorage.getItem(this.sessionStorageKey);
    if (containedDataStr) {
      this.storage = JSON.parse(containedDataStr);
    } else {
      this.storage = {
        users: null
      };
    }

    windowService.nativeWindow().addEventListener('beforeunload', () => {
      window.sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(this.storage));
    });
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

  public get(key: keyof IStorageData): any {
    if (this.storage.hasOwnProperty(key)) {
      return this.storage[key];
    }
    return null;
  }
}
