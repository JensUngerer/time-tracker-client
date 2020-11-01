import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ISummarizedTasks } from '../../../../common/typescript/summarizedData';
import { ConfigurationService, IConfiguration } from '../configuration.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { StatsService } from '../stats.service';
import { ITimeInterval } from './../../../../common/typescript/iTimeInterval';

interface ICommitDayOption {
  value: ITimeInterval;
  viewValue: Date;
}

@Component({
  selector: 'mtt-commit',
  templateUrl: './commit.component.html',
  styleUrls: ['./commit.component.scss']
})
export class CommitComponent implements OnInit {
  summarizedTasksByCategoryBuffer: ISummarizedTasks[][] = [];
  configSubscription: Subscription;
  groupCategories: string[] = [];

  commitDayOptions: ICommitDayOption[] = [];


  commitFormGroup: FormGroup;

  dayDropDownFormControlName = 'theDayDropDown';

  // currentDay: ITimeInterval;

  constructor(private configurationService: ConfigurationService,
    private statsService: StatsService,
    private sessionStorageSerializationService: SessionStorageSerializationService) {
    // const config = {};
    // config[this.dayDropDownFormControlName] = new FormControl(null);
    // this.commitFormGroup = new FormGroup(config);
  }

  private createFormGroup() {
    const formGroupConfig = {};
    formGroupConfig[this.dayDropDownFormControlName] = new FormControl(null);
    // formGroupConfig[this.dayDropDownFormControlName].setValue(this.dayDropDownFormControlName[0].value);
    this.commitFormGroup = new FormGroup(formGroupConfig);
    // this.currentDay = this.commitDayOptions[0].value;
    // this.commitFormGroup.controls[this.dayDropDownFormControlName].setValue(this.commitDayOptions[0].viewValue);
  }

  private createDaysDataStructure(days: ITimeInterval[]) {
    // DEBUGGING
    // console.log(days);

    days.forEach((oneDay: ITimeInterval) => {
      this.commitDayOptions.push({
        value: oneDay,
        viewValue: oneDay.utcStartTime
      });
    });
  }

  private configurationSubscription(isReady: boolean) {
    if (isReady) {
      this.groupCategories = this.configurationService.configuration.groupCategories;

      const nonCommittedDaysPromise = this.statsService.getNonCommittedDays();
      nonCommittedDaysPromise.then((theDays: string) => {
        // DEBUGGING:
        // console.log(theDays);

        const parsedDays: ITimeInterval[] = this.sessionStorageSerializationService.deSerialize(theDays);
        this.createDaysDataStructure(parsedDays);
        // this.createFormGroup();
      });
      // this.groupCategories.forEach((oneCategory: string) => {
      //   this.statsService.getCommitsByDay(null, oneCategory);
      // });
    }
  }

  ngOnInit(): void {
    this.createFormGroup();
    this.configSubscription = this.configurationService.configurationReceived$.pipe(tap(
      this.configurationSubscription.bind(this)
    )).subscribe();
  }

}
