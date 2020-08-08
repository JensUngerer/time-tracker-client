import { Component, OnInit, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { IDurationSumBase } from '../../../../common/typescript/iDurationSumBase';
import { CommitService } from '../commit.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { ActivatedRoute, Data } from '@angular/router';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ITasksDurationSum } from '../../../../common/typescript/iTasksDurationSum';
import { ICommitBase } from '../../../../common/typescript/iCommitBase';
import { PostTimeEntryService } from '../post-time-entry.service';
import routes from './../../../../common/typescript/routes.js';
import { ITimeRecordsDocumentData } from '../../../../common/typescript/mongoDB/iTimeRecordsDocument';
import { DurationCalculator } from '../../../../common/typescript/helpers/durationCalculator';
import { ITask } from '../../../../common/typescript/iTask';
import { IDurationSum } from '../../../../common/typescript/iDurationSum';
import { IBookingDeclaration } from '../../../../common/typescript/iBookingDeclaration';
import { IColumnNames } from '../commit-or-book-table/commit-or-book-table.component';

interface ICommitOrBookOption {
  value: IDurationSumBase;
  viewValue: Date;
}

class ICommitOrBookOption {
  public viewValue: Date;
  constructor(public value: IDurationSumBase) {
    this.viewValue = value.day;
  }
}

@Component({
  selector: 'mtt-commit-or-book',
  templateUrl: './commit-or-book.component.html',
  styleUrls: ['./commit-or-book.component.scss']
})
export class CommitOrBookComponent implements OnDestroy, OnInit, AfterViewInit {
  private routeDataSubscription: Subscription;
  private isAlreadyInitialized = false;

  @Input()
  isTaskBased = false;

  @Input()
  isBookingBased = false;

  currentDayOption: IDurationSumBase;

  formGroup: FormGroup = null;
  formGroupControlNames: string[] = [
    'daySelect'
  ];

  dayOptions: ICommitOrBookOption[] = [];

  isButtonDisabled = false;

  columnNames: IColumnNames = null;

  constructor(private postTimeEntryService: PostTimeEntryService,
              private route: ActivatedRoute,
              private commitService: CommitService,
              private sessionStorageSerializationService: SessionStorageSerializationService) { }
  
  ngOnDestroy(): void {
    if (this.routeDataSubscription) {
      this.routeDataSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    if (this.isTaskBased && !this.isAlreadyInitialized) {
      this.isAlreadyInitialized = true;
      this.initializeTaskBaseDaySelect();
    }
    if (this.isBookingBased && !this.isAlreadyInitialized) {
      this.isAlreadyInitialized = true;
      this.initializeBookingBasedDaySelect();
    }
  }

  private createFormGroup() {
    const configObj: { [key: string]: AbstractControl } = {};
    this.formGroupControlNames.forEach((oneFormGroupControlName: string) => {
      configObj[oneFormGroupControlName] = new FormControl('');
    });
    this.formGroup = new FormGroup(configObj);
  }

  private initializeDaySelect() {
    this.formGroup.controls[this.formGroupControlNames[0]].setValue(this.dayOptions[0].value);
  }

  private handleInComingDaySelectPromise(daySelectPromise: Promise<string>, errorMessage: string) {
    daySelectPromise.then((receivedDurationSums: string) => {
      const parsedSums: IDurationSumBase[] = this.sessionStorageSerializationService.deSerialize(receivedDurationSums);
      
      if (!parsedSums ||
          parsedSums.length === 0) {
        console.error(errorMessage);
        return;
      }

      parsedSums.forEach((oneParsedSum: IDurationSumBase) => {
        this.dayOptions.push(
            new ICommitOrBookOption(oneParsedSum)
        )
      });

      this.initializeDaySelect();
      this.onDaySelectionChanged();
    });
    daySelectPromise.catch(() => {
      console.error('promise rejected for day select options (duration sums)');
    });
  }

  private initializeTaskBaseDaySelect() {
    const durationSumsPromise = this.commitService.getDurationSumsForTasks();
    this.handleInComingDaySelectPromise(durationSumsPromise, 'no duration sums for tasks received');
  }

  private initializeBookingBasedDaySelect() {
    const promise = this.commitService.getCommitDays();
    this.handleInComingDaySelectPromise(promise, 'no duration sums for booking received');
  }

  private initializeWithRouteData(receivedRouteData: Data) {
    this.isTaskBased = receivedRouteData.isTaskBased;
    this.isBookingBased = receivedRouteData.isBookingBased;
    if (this.isTaskBased  && !this.isAlreadyInitialized) {
      this.isAlreadyInitialized = true;
      this.columnNames = {
        description: 'Task Name',
        identifer: 'Task Number'
      };
      this.initializeTaskBaseDaySelect();
    }
    if (this.isBookingBased && !this.isAlreadyInitialized) {
      this.isAlreadyInitialized = true;
      this.columnNames = {
        description: 'Booking Description',
        identifer: 'Booking Code'
      };
      this.initializeBookingBasedDaySelect();
    }
  }

  private initializeComponentViaRouteData() {
    this.routeDataSubscription = this.route.data.pipe(tap(this.initializeWithRouteData.bind(this))).subscribe();
  }

  private deleteAndSwitchToNext(currentDayOption: IDurationSumBase) {
    // delete current entry (visually only)
    const indexToDelete = this.dayOptions.findIndex((oneDayOption: ICommitOrBookOption) => {
      return oneDayOption.value.day === currentDayOption.day;
    });
    if (indexToDelete === -1) {
      console.error('cannot delete visually');
      return;
    }
    this.dayOptions.splice(indexToDelete, 1);

    // switch to next entry
    if (indexToDelete < this.dayOptions.length) {
      this.formGroup.controls[this.formGroupControlNames[0]].setValue(this.dayOptions[indexToDelete].value);
    } else {
      this.formGroup.controls[this.formGroupControlNames[0]].setValue(null);
    }
    this.onDaySelectionChanged();
  }

  private submitTaskedBased(currentDayOption: IDurationSumBase, durations: ICommitBase[]) {
    return this.postTimeEntryService.post(routes.commitTimeRecordsCollectionName, durations, currentDayOption as ITasksDurationSum,
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
        };

        return timeRecordData;
      });
  }

  private submitBookingBased(currentDayOption: IDurationSumBase, currentDurations: ICommitBase[]) {
    return this.postTimeEntryService.post(routes.timeRecordsCollectionName, currentDurations, currentDayOption as IDurationSum,
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
        };

        return timeRecordData;
      });
  }

  ngOnInit(): void {
    this.createFormGroup();
    this.initializeComponentViaRouteData();
  }

  onSubmit(formValues: any) {
    const currentDayOption: IDurationSumBase = this.formGroup.controls[this.formGroupControlNames[0]].value;
    const durations: ICommitBase[] = currentDayOption.durations;
    if (this.isTaskBased) {
      const submitTaskBasedPromise = this.submitTaskedBased(currentDayOption, durations);
      submitTaskBasedPromise.then((lastPostCommitResult: string) => {
        const lastPostCommitResultParsed = this.sessionStorageSerializationService.deSerialize<any>(lastPostCommitResult);
        console.log(lastPostCommitResultParsed);
      });
    }
    if (this.isBookingBased) {
      const submitBookingBasedPromise = this.submitBookingBased(currentDayOption, durations);
      submitBookingBasedPromise.then((lastPostCommitResult: string) => {
        const lastPostCommitResultParsed = this.sessionStorageSerializationService.deSerialize<any>(lastPostCommitResult);
        console.log(lastPostCommitResultParsed);
      });
    }
  }

  onDaySelectionChanged($event?: any) {
    this.currentDayOption = this.formGroup.controls[this.formGroupControlNames[0]].value;
  }

}
