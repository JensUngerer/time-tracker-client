import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

import { DurationCalculator } from '../../../../common/typescript/helpers/durationCalculator';
import { ICommitBase } from '../../../../common/typescript/iCommitBase';
import { ITask } from '../../../../common/typescript/iTask';
import { ITimeRecordsDocumentData } from '../../../../common/typescript/mongoDB/iTimeRecordsDocument';
import { CommitService } from '../commit.service';
import { PostTimeEntryService } from '../post-time-entry.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { ITasksDurationSum } from './../../../../common/typescript/iTasksDurationSum';
import routes from './../../../../common/typescript/routes.js';

interface ICommitOption {
  value: ITasksDurationSum;
  viewValue: Date;
}

class CommitOption implements ICommitOption {
  public viewValue: Date;
  constructor(public value: ITasksDurationSum) {
    this.viewValue = value.day;
  }
}

@Component({
  selector: 'mtt-commit',
  templateUrl: './commit.component.html',
  styleUrls: ['./../book/book.component.scss']
})
export class CommitComponent implements OnInit {
  currentDayOption: ITasksDurationSum;

  formControlName = '';
  formGroup: FormGroup = null;
  formGroupControlNames: string[] = [
    'daySelect'
  ];
  dayOptions: ICommitOption[] = [
    // {
    //   value:  {
    //     aritraryProperty: 'arbitraryProperty'
    //   },
    //   viewValue: new Date()
    // }
  ];

  constructor(private postTimeEntryService: PostTimeEntryService,
              private commitService: CommitService,
              private sessionStorageSerializationService: SessionStorageSerializationService) {
  }

  ngOnInit(): void {
    const configObj: { [key: string]: AbstractControl } = {};
    this.formGroupControlNames.forEach((oneFormGroupControlName: string) => {
      configObj[oneFormGroupControlName] = new FormControl('');
    });
    this.formGroup = new FormGroup(configObj);

    const durationSumsPromise = this.commitService.getDurationSumsForTasks();
    
    durationSumsPromise.then((receivedDurationSums: string) => {
      const parsedSums: ITasksDurationSum[] = this.sessionStorageSerializationService.deSerialize(receivedDurationSums);
      
      if (!parsedSums ||
          parsedSums.length === 0) {
        console.error('no duration sums for tasks received');
        return;
      }
      
      // DEBUGGING:
      // console.log(parsedSums);
      // const durations = parsedSums.durations;
      parsedSums.forEach((oneParsedSum: ITasksDurationSum) => {
        this.dayOptions.push(
            new CommitOption(oneParsedSum)
        )
      });

      this.formGroup.controls[this.formGroupControlNames[0]].setValue(this.dayOptions[0].value);
      this.currentDayOption = this.formGroup.controls[this.formGroupControlNames[0]].value;
    });
    durationSumsPromise.catch(() => {
      console.error('no durations received');
    });
  }

  onDaySelectionChanged($event) {
    // DEBUGGING:
    // console.log($event);
    // console.log(new Error().stack)
    this.currentDayOption = this.formGroup.controls[this.formGroupControlNames[0]].value;
  }

  private deleteAndSwitchToNext(currentDayOption: ITasksDurationSum) {

  }

  onCommitClicked($event) {
    const currentDayOption: ITasksDurationSum = this.formGroup.controls[this.formGroupControlNames[0]].value;
    // const currentDurations: ITasksDurationSum = currentDayOption.value.durations;
    // const tasksDurationSum: ITasksDurationSum = currentDayOption.value;
    const durations: ICommitBase[] = currentDayOption.durations;
  
  
    this.postTimeEntryService.post(routes.commitTimeRecordsCollectionName, durations, currentDayOption,
      (currentDayOption: ITasksDurationSum) => {
        this.deleteAndSwitchToNext(currentDayOption);
      },
      (commitBase: ICommitBase) => {
        const timeRecordData: ITimeRecordsDocumentData = {
          _bookingDeclarationId: null,
          _timeEntryIds: commitBase._timeEntryIds,
          dateStructure: DurationCalculator.getCurrentDateStructure(new Date(currentDayOption.day)),
          durationInHours: commitBase.durationInHours,
          durationInMilliseconds: commitBase.durationSumInMilliseconds,
          durationStructure: DurationCalculator.getSumDataStructureFromMilliseconds(commitBase.durationSumInMilliseconds),
          _taskId: (commitBase.basis as ITask).taskId,
          // collectionName: routes.commitTimeRecordsCollectionName
        };

        return timeRecordData;
      });
  }
}
