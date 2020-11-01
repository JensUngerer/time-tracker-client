import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as _ from 'underscore';
import { uniqueId } from 'underscore';

import { ISummarizedTasks } from '../../../../common/typescript/summarizedData';
import { ConfigurationService } from '../configuration.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { StatsService } from '../stats.service';
import { ITimeInterval } from './../../../../common/typescript/iTimeInterval';

interface ICommitDayOption {
  value: ITimeInterval;
  viewValue: Date;
  id: string;
}

interface ICommitTeamOption {
  value: string;
  viewValue: string;
  id: string;
}

@Component({
  selector: 'mtt-commit',
  templateUrl: './commit.component.html',
  styleUrls: ['./commit.component.scss']
})
export class CommitComponent implements OnInit {
  private currentTimeInterval: ITimeInterval;
  private currentTimeIntervalId: string;
  private currentGroupId: string;

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
    private sessionStorageSerializationService: SessionStorageSerializationService,
    private changeDetectorRef: ChangeDetectorRef) {
  }

  private createFormGroup() {
    const formGroupConfig = {};
    formGroupConfig[this.dayDropDownFormControlName] = new FormControl(null);
    formGroupConfig[this.teamDropDownFormControlName] = new FormControl(null);
    this.commitFormGroup = new FormGroup(formGroupConfig);
  }

  private initDayDropDown() {
    if(!this.commitDayOptions || !this.commitDayOptions.length) {
      return;
    }
    const displayedObj = this.commitDayOptions[0];
    const displayedValue = displayedObj.value;
    this.commitFormGroup.controls[this.dayDropDownFormControlName].setValue(displayedValue);
    this.onDaySelectionChange({
      value: displayedValue,
      source: null
    })
  }

  private initTeamDropDown() {
    if (!this.groupCategories || !this.groupCategories.length) {
      return;
    }
    // const displayedObj =
    const displayedValue = this.groupCategories[0];
    if (!this.commitTeamOptions || !this.commitTeamOptions.length) {
      return;
    }
    // const correspondingCommitOption = this.commitTeamOptions.find(oneOption => oneOption.value === displayedValue);
    // if (!correspondingCommitOption) {
    //   return;
    // }
    // const id = correspondingCommitOption.id;
    this.commitFormGroup.controls[this.teamDropDownFormControlName].setValue(displayedValue);
    this.onGroupSelectionChange({
      source: null,
      value: displayedValue
    });
  }

  private createTeamDropDown(groupCategories: string[]) {
    this.commitTeamOptions = [];
    groupCategories.forEach((oneGroupCat: string) => {
      this.commitTeamOptions.push({
        value: oneGroupCat,
        viewValue: oneGroupCat,
        id: uniqueId()
      });
    });
  }

  private createDaysDataStructure(days: ITimeInterval[]) {
    // DEBUGGING
    // console.log(days);

    days.forEach((oneDay: ITimeInterval) => {
      this.commitDayOptions.push({
        value: oneDay,
        viewValue: oneDay.utcStartTime,
        id: uniqueId()
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
    // console.log('update with:' + JSON.stringify(currentTimeInterval, null, 4));
    // console.log('and:' + this.displayedGroupCategories)
    if (!this.groupCategories || !this.groupCategories.length) {
      return;
    }
    const statsPromise = this.statsService.getStatsData(currentTimeInterval.utcStartTime, currentTimeInterval.utcEndTime, this.displayedGroupCategories[0]);
    statsPromise.then((rawStats: ISummarizedTasks[]) => {
      this.summarizedTasksByCategoryBuffer = [rawStats];
    });
  }

  onDaySelectionChange($event: MatSelectChange) {
    const value: ITimeInterval = $event.value;

    // this.currentTimeIntervalId = id;
    this.currentTimeInterval = value;
    this.updateBothBoundTableInputs();
  }

  onGroupSelectionChange($event: MatSelectChange) {
    const value: string = $event.value;
    this.displayedGroupCategories = [value];
    // this.currentGroupId = id;
    this.updateBothBoundTableInputs();
  }

  onCommitButtonClicked($event: Event) {
    // a) submit data

    // b) disable table data
    // this.currentTimeInterval = null;
    this.summarizedTasksByCategoryBuffer = [];
    this.displayedGroupCategories = [];

    // b) remove currently displayed drop-down entries (one in each one) ???
    // const dayOptionIndex = this.commitDayOptions.findIndex(oneDayOption => oneDayOption.id === this.currentTimeIntervalId);
    // if (dayOptionIndex >= 0) {
    //   this.commitDayOptions.splice(dayOptionIndex, 1);
    //   // this.commitDayOptions = _.clone(this.commitDayOptions);
    //   // if (dayOptionIndex + 1 < this.commitTeamOptions.length)
    // }
    // const groupOptionIndex = this.commitTeamOptions.findIndex(oneOption => oneOption.id === this.currentGroupId);
    // if (groupOptionIndex >= 0) {
    //   this.commitTeamOptions.splice(groupOptionIndex, 1);
    //   // this.commitTeamOptions = _.clone(this.commitTeamOptions);
    // }
    // // this.changeDetectorRef.detectChanges();
    // this.initDayDropDown();
    // this.initTeamDropDown();
  }
}
