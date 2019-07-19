import { HelpersService } from './helpers.service';
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

  constructor(private inMemoryDataService: InMemoryDataService,
              private helpersService: HelpersService) { }

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

    const durationInMilliseconds = this.calculateTimeDifferenceWithoutPauses(timeEntry);

    let durationInMinutes = this.helpersService.millisecondsInMinutes(durationInMilliseconds);

    if (durationInMinutes === 0) {
      durationInMinutes = 1;
    }
    timeEntry.duration = durationInMinutes;

    return timeEntry;
  }

  public startPause(timeEntryId: string){
    if (!timeEntryId) {
      console.error('cannot start Pause because of missing timeEntryId:' + timeEntryId);
      return;
    }

    const retrievedTimeEntry = this.inMemoryDataService.getTimeEntryById(timeEntryId);
    if (!retrievedTimeEntry || !retrievedTimeEntry.pauses) {
      console.error('could not add pause because of missing timeEntry');
      return;
    }
    const newPause: IPause = {
        startTime: new Date(),
        endTime: null,
        duration: null
    };

    retrievedTimeEntry.pauses.push(newPause);
  }

  public stopPause(timeEntryId: string) {
    if (!timeEntryId) {
      console.error('cannot stop Pause because of missing timeEntryId:' + timeEntryId);
      return;
    }

    const retrievedTimeEntry = this.inMemoryDataService.getTimeEntryById(timeEntryId);
    if (!retrievedTimeEntry || !retrievedTimeEntry.pauses || retrievedTimeEntry.pauses.length === 0) {
      console.error('could not stop pause because of missing timeEntry');
      return;
    }
    const lastIndex = retrievedTimeEntry.pauses.length - 1;
    const latestPause: IPause = retrievedTimeEntry.pauses[lastIndex];
    latestPause.endTime = new Date();

    // currently duration (in minutes) is never used, but could be used in the calculation step of the duration of the entire timeEntry
    latestPause.duration = this.helpersService.getTimeDifferenceInMilliseconds(latestPause.endTime, latestPause.startTime);
    latestPause.duration = this.helpersService.millisecondsInMinutes(latestPause.duration);
  }

  public calculateTimeDifferenceWithoutPauses(timeEntry: ITimeEntry): number {
    let pausesDuration = 0;
    timeEntry.pauses.forEach((onePause: IPause) => {
      if (onePause.startTime && onePause.endTime) {
        pausesDuration += this.helpersService.getTimeDifferenceInMilliseconds(onePause.endTime, onePause.startTime);
        return;
      }
      if (onePause.startTime && !onePause.endTime) {
        console.error('one pause has no endTime to startTime:' + onePause.startTime);
        pausesDuration += this.helpersService.getTimeDifferenceInMilliseconds(new Date(), onePause.startTime);
        return;
      }
      console.error('pause has neither startTime nor endTime');
    });
    let trackedDurationInMilliseconds = this.helpersService.getTimeDifferenceInMilliseconds(timeEntry.endTime, timeEntry.startTime);
    trackedDurationInMilliseconds = trackedDurationInMilliseconds - pausesDuration;

    return trackedDurationInMilliseconds;
  }
}
