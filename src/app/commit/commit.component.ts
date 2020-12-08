import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { uniqueId } from 'underscore';

import { ISummarizedTasks } from '../../../../common/typescript/summarizedData';
import { CommitService } from '../commit.service';
import { ConfigurationService } from '../configuration.service';
import { DaySelectService } from '../day-select/day-select.service';
import { ICommitDayOption } from '../day-select/i-commit-day-option';
import { IQueryBooleans } from '../is-csv-file-written/iQueryBooleans';
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
  private isCsvFileWritten = false;

  summarizedTasksByCategoryBuffer: ISummarizedTasks[] = [];
  configSubscription: Subscription;
  groupCategories: string[] = [];
  currentGroupCategory: string;

  commitDayOptions: ICommitDayOption[] = [];

  commitTeamOptions: ICommitTeamOption[] = [];

  commitFormGroup: FormGroup;

  displayedGroupCategories: string[] = [];

  days: ITimeInterval[] = [];

  currentlyDisplayedData: any = null;

  teamDropDownFormControlName = 'theTeamDropDown';

  isTableVisible = false;

  isCommitButtonDisabled = false;

  deleteCurrentAndSwitchToNext = new EventEmitter<ITimeInterval>();
  deleteCurrentBooleans = new EventEmitter<any>();

  constructor(private configurationService: ConfigurationService,
    private statsService: StatsService,
    private daySelectService: DaySelectService,
    private commitService: CommitService) {
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

      const daysPromise = this.daySelectService.getNonCommittedDays(false);
      daysPromise.then((days: ITimeInterval[]) => {
        this.days = days;
        // this.initDaysDropDown();
      });
      daysPromise.catch(() => {
        console.error('days promise rejected in commit component!');
      });
    }
  }

  private updateBothBoundTableInputs() {
    this.isCommitButtonDisabled = true;
    const currentTimeInterval = this.currentTimeInterval;
    if (typeof currentTimeInterval === 'undefined' ||
      currentTimeInterval === null) {
      // this.currentGroupCategory = null;
      this.isCommitButtonDisabled = true;
      return;
    }
    // DEBUGGING:
    // console.log('update with:' + JSON.stringify(currentTimeInterval, null, 4));
    // console.log('and:' + this.displayedGroupCategories)
    if (!this.groupCategories || !this.groupCategories.length) {
      this.isCommitButtonDisabled = true;
      return;
    }
    const tempBuffer = [];
    const statsPromise = this.statsService.getStatsData(currentTimeInterval.utcStartTime, currentTimeInterval.utcEndTime, this.currentGroupCategory, false, true);
    statsPromise.then((rawStats: ISummarizedTasks[]) => {
      if (!rawStats || !rawStats.length) {
        return;
      }
      for (let rawStatsIndex = 0; rawStatsIndex < rawStats.length; rawStatsIndex++) {
        const element = rawStats[rawStatsIndex];
        const enrichedElement = this.statsService.enrichStats(element);
        tempBuffer.push(enrichedElement);
      }
      this.summarizedTasksByCategoryBuffer = tempBuffer;
      this.isCommitButtonDisabled = false;
      this.isTableVisible = true;
    });
  }

  ngOnInit(): void {
    this.createFormGroup();
    this.configSubscription = this.configurationService.configurationReceived$.pipe(tap(
      this.configurationSubscription.bind(this)
    )).subscribe();
  }

  onDaySelectionChange(value: ITimeInterval) {
    this.isTableVisible = false;

    this.currentTimeInterval = value;
    this.updateBothBoundTableInputs();
  }

  onGroupSelectionChange($event: MatSelectChange) {
    this.isTableVisible = false;

    const value: string = $event.value;
    this.currentGroupCategory = value;
    // this.currentGroupId = id;
    this.updateBothBoundTableInputs();
  }

  onCommitButtonClicked($event: Event) {
    if (!this.summarizedTasksByCategoryBuffer || !this.summarizedTasksByCategoryBuffer.length) {
      console.error('there is no data which could be committed!');
      return;
    }

    const submitTaskBasedPromise = this.statsService.submitTaskedBased(this.summarizedTasksByCategoryBuffer, this.currentTimeInterval.utcStartTime);
    // submitTaskBasedPromise.then((lastPostCommitResult: string) => {
    // DEBUGGING:
    // const lastPostCommitResultParsed = this.sessionStorageSerializationService.deSerialize<any>(lastPostCommitResult);
    // console.log(lastPostCommitResult);
    submitTaskBasedPromise.then((isSuccessful: boolean) => {
      // DEBUGGING:
      console.log(isSuccessful);

      this.isTableVisible = false;
      this.deleteCurrentAndSwitchToNext.next(this.currentTimeInterval);
      this.summarizedTasksByCategoryBuffer = [];
    });

    if (!this.isCsvFileWritten) {
      return;
    }
    this.commitService.postCsvFileTrigger(this.isCsvFileWritten, this.currentTimeInterval.utcStartTime, this.currentTimeInterval.utcEndTime);
    this.deleteCurrentBooleans.emit();
  }

  onQueryBooleans($event: IQueryBooleans) {
    this.isCsvFileWritten = $event.isCsvFileWritten;
  }
}
