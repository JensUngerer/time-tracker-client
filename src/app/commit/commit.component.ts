import { Component, OnInit } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { CommitService } from '../commit.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { ITasksDurationSum } from './../../../../common/typescript/iTasksDurationSum'
import { ICommitTask } from '../../../../common/typescript/iCommitTasks';

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

  constructor(private commitService: CommitService,
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

}
