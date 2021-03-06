import { Injectable } from '@angular/core';
import { ITimeInterval } from '../../../common/typescript/iTimeInterval';
import { SessionStorageSerializationService } from './session-storage-serialization.service';

export interface ITimeTrackerSessionStorageData {
  statisticsTimeBoundaries: ITimeInterval;
}

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  private static timeTrackerSessionStorageKey = 'timeTracker';

  constructor(private serialAndDerserializeService: SessionStorageSerializationService) { }

  set(dataToStore: ITimeTrackerSessionStorageData) {
    if (!dataToStore) {
      return false;
    }
    const serializedValue = this.serialAndDerserializeService.serialize(dataToStore);
    localStorage.setItem(SessionStorageService.timeTrackerSessionStorageKey, serializedValue);
    return true;
  }

  get() {
    const storedValue = localStorage.getItem(SessionStorageService.timeTrackerSessionStorageKey);
    if (!storedValue) {
      return null;
    }
    const parsedValue = this.serialAndDerserializeService.deSerialize<ITimeTrackerSessionStorageData>(storedValue);
    return parsedValue;
  }
}
