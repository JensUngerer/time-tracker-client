import { HelpersService } from './helpers.service';
import { Injectable } from '@angular/core';
import { ITimeEntry } from '../../../common/typescript/iTimeEntry';
import uuid from 'uuid';
import { InMemoryDataService } from './in-memory-data.service';
import { IPause } from '../../../common/typescript/iPause';
import { CommitService } from './commit.service';

@Injectable({
  providedIn: 'root'
})
export class TimeTrackingService {

  private readonly timeEntriesKey = 'timeEntries';

  constructor(private inMemoryDataService: InMemoryDataService,
    private helpersService: HelpersService,
    private commitService: CommitService) { }

  public startTimeTracking(taskId: string): Promise<ITimeEntry> {
    const timeEntry: ITimeEntry = {
      startTime: new Date(),
      endTime: null,
      timeEntryId: uuid.v4(),
      _taskId: taskId,
      duration: null,
      pauses: []
    };

    const startPromise = this.commitService.postTimeEntries(timeEntry);
    startPromise.then((resolvingObj: any) => {
      console.log(resolvingObj);
    });

    return startPromise;
  }

  public stopTimeTracking(timeEntryId: string): Promise<any> {
    const stopPromise = this.commitService.patchTimeEntriesStop(timeEntryId);
    stopPromise.then((retrievedValue: any) => {
      console.log(retrievedValue);
    });

    return stopPromise;
  }

  public startPause(timeEntryId: string): Promise<any> {
    if (!timeEntryId) {
      console.error('cannot start Pause because of missing timeEntryId:' + timeEntryId);
      return;
    }

    const promise = this.commitService.postTimeEntriesPause(timeEntryId);
    promise.then((resolvedValue: any) => {
      console.log(resolvedValue);
    });
    promise.catch((rejectionValue: any) => {
      console.log(rejectionValue);
    });
    return promise;
  }

  public stopPause(timeEntryId: string): Promise<any> {
    if (!timeEntryId) {
      console.error('cannot stop Pause because of missing timeEntryId:' + timeEntryId);
      return;
    }

    const promise = this.commitService.patchTimeEntriesStopPause(timeEntryId);
    promise.then((resolvedValue: any) => {
      console.log(resolvedValue);
    });
    promise.catch((rejectValue: any) => {
      console.log(rejectValue);
    });

    return promise;
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
