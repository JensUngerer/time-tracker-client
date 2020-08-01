import { Injectable } from '@angular/core';
import { IDurationSum } from '../../../common/typescript/iDurationSum';
import { ICommitBase } from '../../../common/typescript/iCommitBase';
import { ITasksDurationSum } from '../../../common/typescript/iTasksDurationSum';
import { ITimeRecordsDocumentData } from '../../../common/typescript/mongoDB/iTimeRecordsDocument';
import { DurationCalculator } from '../../../common/typescript/helpers/durationCalculator';
import { CommitService } from './commit.service';

@Injectable({
  providedIn: 'root'
})
export class PostTimeEntryService {

  constructor(private commitService: CommitService) { }

 post(collectionName: string,
  currentDurations: ICommitBase[], 
  currentDayOption: IDurationSum | ITasksDurationSum, 
  deleteAndSwitchToNext: (currentDayOption: IDurationSum | ITasksDurationSum) => void,
  createTimeRecordData: (commitBase: ICommitBase) => ITimeRecordsDocumentData ) {
    let indexInLoop = 0;
    const loop = () => {
      if (indexInLoop >= currentDurations.length) {
        deleteAndSwitchToNext(currentDayOption);
        return;
      }
      const durationEntry = currentDurations[indexInLoop];
      
      const timeRecordData: ITimeRecordsDocumentData = createTimeRecordData(durationEntry);
      const postCommitPromise = this.commitService.postCommit(collectionName, timeRecordData);
      postCommitPromise.then(() => {
        indexInLoop++;
        loop();
      });
      postCommitPromise.catch(() => {
        console.error('posting commit failed:' + JSON.stringify(timeRecordData, null, 4));

        indexInLoop++;
        loop();
      });
    };
    // initial call
    loop();
  }
}
