import { HelpersService } from './helpers.service';
import { Injectable } from '@angular/core';
import { ITimeEntry } from '../../../common/typescript/iTimeEntry';
import { v4 } from 'uuid';
import { CommitService } from './commit.service';

@Injectable({
  providedIn: 'root'
})
export class TimeTrackingService {

  private readonly timeEntriesKey = 'timeEntries';

  constructor(private helpersService: HelpersService,
    private commitService: CommitService) { }

  public startTimeTracking(taskId: string, bookingDeclarationId): Promise<string> {
    const timeEntry: ITimeEntry = {
      _bookingDeclarationId: bookingDeclarationId,
      day: null,
      startTime: new Date(),
      endTime: null,
      timeEntryId: v4(),
      _taskId: taskId,
      durationInMilliseconds: null
    };

    const startPromise = this.commitService.postTimeEntries(timeEntry);
    startPromise.then((resolvingObj: any) => {
      // DEBUGGING
      // console.log(resolvingObj);
    });

    return startPromise;
  }

  public stopTimeTracking(timeEntryId: string): Promise<any> {
    const stopPromise = this.commitService.patchTimeEntriesStop(timeEntryId);
    stopPromise.then((retrievedValue: any) => {
      // DEBUGGING
      // console.log(retrievedValue);
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
}
