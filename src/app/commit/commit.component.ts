import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ISummarizedTasks } from '../../../../common/typescript/summarizedData';
import { ConfigurationService } from '../configuration.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { StatsService } from '../stats.service';
import { ITimeInterval } from './../../../../common/typescript/iTimeInterval';

interface ICommitDayOption {
  value: ITimeInterval;
  viewValue: Date;
}

interface ICommitTeamOption {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'mtt-commit',
  templateUrl: './commit.component.html',
  styleUrls: ['./commit.component.scss']
})
export class CommitComponent implements OnInit {
  private currentGroupCategory: string;
  private currentTimeInterval: ITimeInterval;

  summarizedTasksByCategoryBuffer: ISummarizedTasks[][] = [];
  configSubscription: Subscription;
  groupCategories: string[] = [];

  commitDayOptions: ICommitDayOption[] = [];

  commitTeamOptions: ICommitTeamOption[] = [];

  commitFormGroup: FormGroup;

  displayedGroupCategories: string[] = [];

  currentlyDisplayedData: any = null;

  dayDropDownFormControlName = 'theDayDropDown';
  teamDropDownFormControlName = 'theTeamDropDown'

  constructor(private configurationService: ConfigurationService,
    private statsService: StatsService,
    private sessionStorageSerializationService: SessionStorageSerializationService) {
  }

  private createFormGroup() {
    const formGroupConfig = {};
    formGroupConfig[this.dayDropDownFormControlName] = new FormControl(null);
    formGroupConfig[this.teamDropDownFormControlName] = new FormControl(null);
    this.commitFormGroup = new FormGroup(formGroupConfig);
  }

  private initDayDropDown() {
    const displayedValue = this.commitDayOptions[0].value;
    this.commitFormGroup.controls[this.dayDropDownFormControlName].setValue(displayedValue);
    this.onSelectionChange({
      value: displayedValue,
      source: null
    })
  }

  private initTeamDropDown() {
    const displayedValue = this.groupCategories[0];
    this.commitFormGroup.controls[this.teamDropDownFormControlName].setValue(displayedValue);
    this.onTeamSelectionChange({
      source: null,
      value: displayedValue
    });
  }

  private createTeamDropDown(groupCategories: string[]) {
    this.commitTeamOptions = [];
    groupCategories.forEach((oneGroupCat: string) => {
      this.commitTeamOptions.push({
        value: oneGroupCat,
        viewValue: oneGroupCat
      });
    });
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
      this.createTeamDropDown(this.groupCategories);
      this.initTeamDropDown();

      const nonCommittedDaysPromise = this.statsService.getNonCommittedDays();
      nonCommittedDaysPromise.then((theDays: string) => {
        // DEBUGGING:
        // console.log(theDays);

        const parsedDays: ITimeInterval[] = this.sessionStorageSerializationService.deSerialize(theDays);
        this.createDaysDataStructure(parsedDays);
        this.initDayDropDown();
      });
    }
  }

  ngOnInit(): void {
    this.createFormGroup();
    this.configSubscription = this.configurationService.configurationReceived$.pipe(tap(
      this.configurationSubscription.bind(this)
    )).subscribe();
  }

  private updateBothBoundTableInputs() {
    const currentTimeInterval = this.currentTimeInterval;
    if (!currentTimeInterval) {
      return;
    }

    // DEBUGGING:
    console.log('update with:' + JSON.stringify(currentTimeInterval, null, 4));
    console.log('and:' + this.displayedGroupCategories)

    const statsPromise = this.statsService.getStatsData(currentTimeInterval.utcStartTime, currentTimeInterval.utcEndTime, this.currentGroupCategory);
    statsPromise.then((rawStats: ISummarizedTasks[]) => {
      this.summarizedTasksByCategoryBuffer = [rawStats];
    });
  }

  onSelectionChange($event: MatSelectChange) {
    const value: ITimeInterval = $event.value;

    this.currentTimeInterval = value;
    this.updateBothBoundTableInputs();
  }

  onTeamSelectionChange($event: MatSelectChange) {
    const value: string = $event.value;
    this.currentGroupCategory = value;
    this.displayedGroupCategories = [value];
    this.updateBothBoundTableInputs();
  }
}
