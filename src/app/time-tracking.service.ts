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

  public getTimeDifferenceString(endTime: Date, startTime: Date): string {
    let theDuration = endTime.getTime() - startTime.getTime();
    theDuration = Math.floor(theDuration / 1000);
    const durationInSeconds = theDuration % 60;
    theDuration = Math.floor(theDuration / 60);
    const durationInMinutes = theDuration % 60;
    theDuration = Math.floor(theDuration / 60);
    const durationInHours = theDuration % 60;

    return this.ensureTowDigits(durationInHours) + ':'
    + this.ensureTowDigits(durationInMinutes) + ':'
    + this.ensureTowDigits(durationInSeconds);
  }

  private ensureTowDigits(oneNumber: number): string {
    if (oneNumber <= 9) {
      return '0' + oneNumber;
    }
    return oneNumber.toString();
  }

  public getTimeDifferenceInMinutes(endTime: Date, startTime: Date): number {
    let durationInMinutes = endTime.getTime() - startTime.getTime();
    durationInMinutes = Math.floor(durationInMinutes / 1000);
    durationInMinutes = Math.floor(durationInMinutes / 60);
    if (durationInMinutes === 0) {
      durationInMinutes = 1;
    }
    return durationInMinutes;
  }

}
