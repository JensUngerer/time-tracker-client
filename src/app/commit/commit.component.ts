import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as _ from 'underscore';
import { uniqueId } from 'underscore';

import { ISummarizedTasks } from '../../../../common/typescript/summarizedData';
import { ConfigurationService } from '../configuration.service';
import { DaySelectService } from '../day-select/day-select.service';
import { ICommitDayOption } from '../day-select/i-commit-day-option';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { StatsService } from '../stats.service';
import { ITimeInterval } from './../../../../common/typescript/iTimeInterval';

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

  summarizedTasksByCategoryBuffer: ISummarizedTasks[][] = [];
  configSubscription: Subscription;
  groupCategories: string[] = [];

  commitDayOptions: ICommitDayOption[] = [];

  commitTeamOptions: ICommitTeamOption[] = [];

  commitFormGroup: FormGroup;

  displayedGroupCategories: string[] = [];

  days: ITimeInterval[] = [];

  currentlyDisplayedData: any = null;

  teamDropDownFormControlName = 'theTeamDropDown'

  constructor(private configurationService: ConfigurationService,
    private statsService: StatsService,
    private daySelectService: DaySelectService) {
  }

  private createFormGroup() {
    const formGroupConfig = {};
    formGroupConfig[this.teamDropDownFormControlName] = new FormControl(null);
    this.commitFormGroup = new FormGroup(formGroupConfig);
  }

  private initTeamDropDown() {
    if (!this.groupCategories || !this.groupCategories.length) {
      return;
    }
    const displayedValue = this.groupCategories[0];
    if (!this.commitTeamOptions || !this.commitTeamOptions.length) {
      return;
    }
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

  private configurationSubscription(isReady: boolean) {
    if (isReady) {
      this.groupCategories = this.configurationService.configuration.groupCategories;
      this.createTeamDropDown(this.groupCategories);
      this.initTeamDropDown();

      const daysPromise = this.daySelectService.getNonCommittedDays();
      daysPromise.then((days: ITimeInterval[]) => {
        this.days = days;
      });
      daysPromise.catch(() => {
        console.error('days promise rejected in commit component!');
      });
    }
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
    const statsPromise = this.statsService.getStatsData(currentTimeInterval.utcStartTime, currentTimeInterval.utcEndTime, this.displayedGroupCategories[0], false, true);
    statsPromise.then((rawStats: ISummarizedTasks[]) => {
      this.summarizedTasksByCategoryBuffer = this.statsService.enrichStats(rawStats);
    });
  }

  ngOnInit(): void {
    this.createFormGroup();
    this.configSubscription = this.configurationService.configurationReceived$.pipe(tap(
      this.configurationSubscription.bind(this)
    )).subscribe();
  }

  onDaySelectionChange(value: ITimeInterval) {
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
    // currentDayOption, durations
    if (!this.summarizedTasksByCategoryBuffer || !this.summarizedTasksByCategoryBuffer.length || this.summarizedTasksByCategoryBuffer.length > 1) {
      console.error('there is no data which could be committed!');
      return;
    }
    // )

    // TODO: ensure that there is only on index aka index 0!
    const submitTaskBasedPromise = this.statsService.submitTaskedBased(this.summarizedTasksByCategoryBuffer[0], this.currentTimeInterval.utcStartTime);
    submitTaskBasedPromise.then((lastPostCommitResult: string) => {
      // DEBUGGING:
      // const lastPostCommitResultParsed = this.sessionStorageSerializationService.deSerialize<any>(lastPostCommitResult);
      console.log(lastPostCommitResult);
    });
    // b) disable table data
    this.summarizedTasksByCategoryBuffer = [];
    this.displayedGroupCategories = [];
  }
}
