import { Injectable } from '@angular/core';
import { ITimeEntry } from '../../../common/typescript/iTimeEntry';
import uuid from 'uuid';
import { InMemoryDataService } from './in-memory-data.service';
import { IPause } from '../../../common/typescript/iPause';

@Injectable({
  providedIn: 'root'
})
export class TimeTrackingService {

  private readonly timeEntriesKey = 'timeEntries';

  constructor(private inMemoryDataService: InMemoryDataService) { }

  public startTimeTracking(taskId: string, projectId?: string, userId?: string): ITimeEntry {
    const timeEntry: ITimeEntry = {
      startTime: new Date(),
      endTime: null,
      timeEntryId: uuid.v4(),
      _taskId: taskId,
      duration: null,
      pauses: []
    };
    this.inMemoryDataService.push(this.timeEntriesKey, timeEntry);

    return timeEntry;
    // if (!projectId || !userId) {
    //   console.error('ids of project and user not propagated');
    //   return;
    // }
  }

  public stopTimeTracking(timeEntryId: string): ITimeEntry {
    const timeEntry = this.inMemoryDataService.getTimeEntryById(timeEntryId);
    if (!timeEntry) {
      console.error('no corresponding timeEntry found -> cannot stop TimeTracking');
      return null;
    }
    timeEntry.endTime = new Date();
    let pausesDuration = 0;
    timeEntry.pauses.forEach((onePause: IPause)=>{
      if (onePause.startTime && onePause.endTime) {
        pausesDuration += this.getTimeDifferenceInMinutes(onePause.endTime, onePause.startTime);
        return;
      }
      if (onePause.startTime && !onePause.endTime) {
        console.error('one pause has no endTime to startTime:' + onePause.startTime);
        pausesDuration += this.getTimeDifferenceInMinutes(new Date(), onePause.startTime);
        return;
      }
      console.error('pause has neither startTime nor endTime');
    });
    let trackedDurationInMinutes = this.getTimeDifferenceInMinutes(timeEntry.endTime, timeEntry.startTime);
    trackedDurationInMinutes = trackedDurationInMinutes - pausesDuration;
    if (trackedDurationInMinutes <= 0) {
      trackedDurationInMinutes = 1;
    }
    timeEntry.duration = trackedDurationInMinutes;

    return timeEntry;
  }

  private getTimeDifferenceInMinutes(endTime: Date, startTime: Date) {
    let durationInMinutes = endTime.getTime() - startTime.getTime();
    durationInMinutes = Math.floor(durationInMinutes / 1000);
    durationInMinutes = Math.floor(durationInMinutes / 60);
    if (durationInMinutes === 0) {
      durationInMinutes = 1;
    }
    return durationInMinutes;
  }
}
