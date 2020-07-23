import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

import { ITimeRecordsDocumentData } from '../../../../common/typescript/mongoDB/iTimeRecordsDocument';
import { CommitService } from '../commit.service';
import { HelpersService } from '../helpers.service';
import { DurationCalculator } from '../../../../common/typescript/helpers/durationCalculator';
import { IDurationSum } from '../../../../common/typescript/iDurationSum';
import { ProjectService } from '../project.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';

interface ICommitOption {
  value: IDurationSum;
  viewValue: Date;
}

class CommitOption implements ICommitOption {
  public viewValue: Date;
  constructor(public value: IDurationSum) {
    this.viewValue = value.day;
  }
}

@Component({
  selector: 'mtt-commit',
  templateUrl: './book.component.html',
  styleUrls: [
    './book.component.scss',
    './../css/centerVerticalHorizontal.scss'
  ]
})
export class BookComponent implements OnInit, AfterViewInit {

  public commitFormGroup: FormGroup = null;

  public formControlNameProjectDropDown = 'formControlProjectDropDown';

  public formControlProjectDropDown: AbstractControl = null;

  public formControlsMap: { [key: string]: AbstractControl } = {
    DayDropDown: new FormControl('')
  };

  public dayOptions: ICommitOption[] = [];

  public isButtonDisabled = false;

  public selectedOption: IDurationSum;

  constructor(private projectService: ProjectService,
              private commitService: CommitService,
              private helpersService: HelpersService,
              private sessionStorageSerializationService: SessionStorageSerializationService) {
    const configObj: { [key: string]: AbstractControl } = {};

    this.commitFormGroup = new FormGroup(this.formControlsMap);

    const promise = this.commitService.getCommitDays();
    promise.then((receivedData) => {
      console.log(receivedData);
      const parsedDurationSums: IDurationSum[] = this.sessionStorageSerializationService.deSerialize(receivedData);
      if (!parsedDurationSums || parsedDurationSums.length === 0) {
        console.error('no duration sums received');
        return;
      }

      parsedDurationSums.forEach((oneDurationSumForOneDay) => {
        this.dayOptions.push(new CommitOption(oneDurationSumForOneDay));
      });

      this.selectedOption = this.dayOptions[0].value;
    });
  }

  ngAfterViewInit(): void {
  }

  ngOnInit() {

  }

  public onDaySelectionChanged() {
    this.selectedOption = this.formControlsMap.DayDropDown.value;
  }

  private deleteAndSwitchToNext(currentDayOption: IDurationSum) {
    // delete current entry (visually only)
    const indexToDelete = this.dayOptions.findIndex((oneDayOption: ICommitOption) => {
      return oneDayOption.value.day === currentDayOption.day;
    });
    if (indexToDelete === -1) {
      console.error('cannot delete visually');
      return;
    }
    this.dayOptions.splice(indexToDelete, 1);

    // switch to next entry
    if (indexToDelete < this.dayOptions.length) {
      this.selectedOption = this.dayOptions[indexToDelete].value;
    } else {
      this.selectedOption = null;
    }
  }

  public onCommitClicked(values: any) {
    const currentDayOption = this.selectedOption;
    const currentDurations = currentDayOption.durations;
    // trigger writing of a time-record
    // (this will trigger a PATCH operation
    // of used time-entries to mark them as isDeletedInClient)
    // currentDuration.forEach((oneDuration: ICommit) => {
    let indexInLoop = 0;
    const loop = () => {
      if (indexInLoop >= currentDurations.length) {
        this.deleteAndSwitchToNext(currentDayOption);
        return;
      }
      const durationEntry = currentDurations[indexInLoop];
      const timeRecordData: ITimeRecordsDocumentData = {
        _bookingDeclarationId: durationEntry.booking.bookingDeclarationId,
        _timeEntryIds: durationEntry._timeEntryIds,
        dateStructure: DurationCalculator.getCurrentDateStructure(new Date(currentDayOption.day)),
        durationInHours: durationEntry.durationInHours,
        durationInMilliseconds: durationEntry.durationSumInMilliseconds,
        durationStructure: DurationCalculator.getSumDataStructureFromMilliseconds(durationEntry.durationSumInMilliseconds)
      };
      const postCommitPromise = this.commitService.postCommit(timeRecordData);
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
