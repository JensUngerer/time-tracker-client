import { Injectable } from '@angular/core';
import { IStorageData } from './../../../common/typescript/iStorageData';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService {

  private storage: IStorageData;

  constructor() {
    this.storage = {
      users: null
    };
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
