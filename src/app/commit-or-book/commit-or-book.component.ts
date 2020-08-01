import { Component, OnInit, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { IDurationSumBase } from '../../../../common/typescript/iDurationSumBase';
import { CommitService } from '../commit.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { ActivatedRoute, Data } from '@angular/router';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

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
  styleUrls: ['./../book/book.component.scss']
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

  constructor(private route: ActivatedRoute,
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
      
      // DEBUGGING:
      // console.log(parsedSums);
      // const durations = parsedSums.durations;
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
      this.initializeTaskBaseDaySelect();
    }
    if (this.isBookingBased && !this.isAlreadyInitialized) {
      this.isAlreadyInitialized = true;
      this.initializeBookingBasedDaySelect();
    }
  }

  private initializeComponentViaRouteData() {
    this.routeDataSubscription = this.route.data.pipe(tap(this.initializeWithRouteData.bind(this))).subscribe();
  }

  ngOnInit(): void {
    this.createFormGroup();
    this.initializeComponentViaRouteData();
  }

  onSubmit(formValues: any) {

  }

  onDaySelectionChanged($event?: any) {
    this.currentDayOption = this.formGroup.controls[this.formGroupControlNames[0]].value;
  }

}
