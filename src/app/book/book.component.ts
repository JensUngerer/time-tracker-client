import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

import { DurationCalculator } from '../../../../common/typescript/helpers/durationCalculator';
import { IBookingDeclaration } from '../../../../common/typescript/iBookingDeclaration';
import { IDurationSum } from '../../../../common/typescript/iDurationSum';
import { ITimeRecordsDocumentData } from '../../../../common/typescript/mongoDB/iTimeRecordsDocument';
import { CommitService } from '../commit.service';
import { PostTimeEntryService } from '../post-time-entry.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { ICommitBase } from './../../../../common/typescript/iCommitBase';
import routes from './../../../../common/typescript/routes.js';

interface IBookOption {
  value: IDurationSum;
  viewValue: Date;
}

class BookOption implements IBookOption {
  public viewValue: Date;
  constructor(public value: IDurationSum) {
    this.viewValue = value.day;
  }
}

@Component({
  selector: 'mtt-book',
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

  public dayOptions: IBookOption[] = [];

  public isButtonDisabled = false;

  public selectedOption: IDurationSum;

  constructor(private postTimeEntryService: PostTimeEntryService,
    private commitService: CommitService,
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
        this.dayOptions.push(new BookOption(oneDurationSumForOneDay));
      });

      const valueToSetInDaysDropDown = this.dayOptions[0].value;
      this.formControlsMap.DayDropDown.setValue(valueToSetInDaysDropDown);
      this.onDaySelectionChanged();
    });
    promise.catch((err: any) => {
      console.log(err);
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
    const indexToDelete = this.dayOptions.findIndex((oneDayOption: IBookOption) => {
      return oneDayOption.value.day === currentDayOption.day;
    });
    if (indexToDelete === -1) {
      console.error('cannot delete visually');
      return;
    }
    this.dayOptions.splice(indexToDelete, 1);

    // switch to next entry
    if (indexToDelete < this.dayOptions.length) {
      this.formControlsMap.DayDropDown.setValue(this.dayOptions[indexToDelete].value);
    } else {
      this.formControlsMap.DayDropDown.setValue(null);
    }
    this.onDaySelectionChanged();
  }

  public onCommitClicked(values: any) {
    const currentDayOption = this.formControlsMap.DayDropDown.value;
    const currentDurations: ICommitBase[] = currentDayOption.durations;
    // trigger writing of a time-record
    // (this will trigger a PATCH operation
    // of used time-entries to mark them as isDeletedInClient)
    this.postTimeEntryService.post(routes.timeRecordsCollectionName, currentDurations, currentDayOption,
      (currentDayOption: IDurationSum) => {
        this.deleteAndSwitchToNext(currentDayOption);
      },
      (commitBase: ICommitBase) => {
        const timeRecordData: ITimeRecordsDocumentData = {
          _bookingDeclarationId: (commitBase.basis as IBookingDeclaration).bookingDeclarationId,
          _timeEntryIds: commitBase._timeEntryIds,
          dateStructure: DurationCalculator.getCurrentDateStructure(new Date(currentDayOption.day)),
          durationInHours: commitBase.durationInHours,
          durationInMilliseconds: commitBase.durationSumInMilliseconds,
          durationStructure: DurationCalculator.getSumDataStructureFromMilliseconds(commitBase.durationSumInMilliseconds),
          _taskId: null,
          // collectionName: routes.timeRecordsCollectionName
        };

        return timeRecordData;
      });
  }
}
