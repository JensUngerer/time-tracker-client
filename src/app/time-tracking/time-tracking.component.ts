import { CommitService } from './../commit.service';
import { HelpersService } from './../helpers.service';
import { ITaskOption, TaskOption } from './../typescript/taskOption';
import { IProjectOption, ProjectOption } from './../typescript/projectOption';
import { InMemoryDataService } from './../in-memory-data.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TimeTrackingService } from './../time-tracking.service';
import { TaskService } from './../task.service';
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl, FormControl, FormBuilder } from '@angular/forms';
import { IProject } from '../../../../common/typescript/iProject';
import { ProjectService } from '../project.service';
import { ITask } from '../../../../common/typescript/iTask';
import { ITimeEntry } from '../../../../common/typescript/iTimeEntry';
import { Subscription } from 'rxjs';
import * as _ from 'underscore';
import { IUserOption } from './../typescript/userOption';
import routesConfig from './../../../../common/typescript/routes.js';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'mtt-time-tracking',
  templateUrl: './time-tracking.component.html',
  styleUrls: ['./time-tracking.component.scss', './../css/centerVerticalHorizontal.scss']
})
export class TimeTrackingComponent implements OnInit, OnDestroy {

  public static timeEntryIdProperty = 'timeEntryId';

  private activatedRouteSubscription: Subscription = null;

  private inMemoryDataServiceSubscription: Subscription = null;

  public currentTimeEntryDuration: string;

  public timeTrackingUserSelectionForm: FormGroup = null;

  public formControlNameUserSelectionDropDown = 'userSelectionDropDown';

  public userOptions: IUserOption[] = [];

  public timeTrackingUserSelectionFormControl: AbstractControl = null;

  public startStopButtonLabel = 'Start';

  public isStartStopButtonDisabled = false;

  public pauseResumeButtonLabel = 'Pause';

  public isPauseResumeButtonDisabled = true;

  public formControlNameProjectSelectionDropDown = 'projectSelectionDropDown';

  public timeTrackingProjectSelectionFormControl: FormControl = null;

  public projectOptions: IProjectOption[] = [];

  public formControlNameTaskSelectionDropDown = 'taskSelectionDropDown';

  public timeTrackingTaskSelectionFromControl: FormControl = null;

  public taskOptions: ITaskOption[] = [];

  public onStartStopButtonClicked() {
    // always disable as a http-request 'needs some time'
    this.isStartStopButtonDisabled = true;
    this.isPauseResumeButtonDisabled = true;

    this.startStopButtonLabel = (this.startStopButtonLabel === 'Start') ? 'Stop' : 'Start';
    if (this.startStopButtonLabel === 'Stop') {
      const taskId = this.timeTrackingTaskSelectionFromControl.value.taskId;

      const startedTimeEntryPromise: Promise<ITimeEntry> = this.timeTrackingService.startTimeTracking(taskId);
      startedTimeEntryPromise.then((resolvedValue: ITimeEntry) => {
        this.currentTimeEntryDuration = '';

        this.setTimeEntryIdInUrl(resolvedValue.timeEntryId);
        this.isStartStopButtonDisabled = false;
        this.isPauseResumeButtonDisabled = false;
      });
      startedTimeEntryPromise.catch(() => {
        console.error('startTimeTracking rejected');

        this.isStartStopButtonDisabled = false;
        this.isPauseResumeButtonDisabled = false;
      });
    } else {
      const stopTimeTrackingPromise = this.timeTrackingService.stopTimeTracking(this.getTimeEntryIdFromUrl());
      stopTimeTrackingPromise.then(() => {
        this.isStartStopButtonDisabled = false;
        this.isPauseResumeButtonDisabled = true;

        this.visualizeTimeEntry(this.getTimeEntryIdFromUrl());
      });
      stopTimeTrackingPromise.catch(() => {
        console.error('stopTimeTracking rejected');

        this.isStartStopButtonDisabled = false;
        this.isPauseResumeButtonDisabled = true;

        this.visualizeTimeEntry(this.getTimeEntryIdFromUrl());
      });
    }
  }


  private getTimeEntryIdFromUrl(): string {
    const retrievedTimeEntryId = this.activatedRoute.snapshot.queryParams[TimeTrackingComponent.timeEntryIdProperty];
    return retrievedTimeEntryId;
  }

  private setTimeEntryIdInUrl(timeEntryId: string) {
    const matrixParams = {};
    matrixParams[TimeTrackingComponent.timeEntryIdProperty] = timeEntryId;

    // https://stackoverflow.com/questions/43698032/angular-how-to-update-queryparams-without-changing-route
    this.router.navigate([], { queryParams: matrixParams, queryParamsHandling: 'merge' });
  }

  public onPauseResumeButtonClicked() {
    this.isPauseResumeButtonDisabled = true;
    this.isStartStopButtonDisabled = true;

    const currentTimeEntryId = this.getTimeEntryIdFromUrl();

    this.pauseResumeButtonLabel = (this.pauseResumeButtonLabel === 'Pause') ? 'Resume' : 'Pause';
    if (this.pauseResumeButtonLabel === 'Resume') {
      // the 'Pause' button has just been pressed

      const startPausePromise = this.timeTrackingService.startPause(currentTimeEntryId);
      startPausePromise.then(() => {
        this.isPauseResumeButtonDisabled = false;
      });
      startPausePromise.catch(() => {
        console.error('startPause rejected');
        this.isPauseResumeButtonDisabled = false;
      });
    } else {
      // the 'Resume' button has just been pressed
      const stopPromise = this.timeTrackingService.stopPause(currentTimeEntryId);
      stopPromise.then(() => {
        this.isStartStopButtonDisabled = false;
        this.isPauseResumeButtonDisabled = false;
      });
      stopPromise.catch(() => {
        console.error('stopPause rejected');
        this.isStartStopButtonDisabled = false;
        this.isPauseResumeButtonDisabled = false;
      });
    }
  }


  constructor(private projectManagementService: ProjectService,
              private taskManagementService: TaskService,
              private timeTrackingService: TimeTrackingService,
              private formBuilder: FormBuilder,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private commitService: CommitService) {
    const controlsConfigObj: { [key: string]: AbstractControl } = {};

    this.timeTrackingProjectSelectionFormControl = new FormControl('');
    controlsConfigObj[this.formControlNameProjectSelectionDropDown] = this.timeTrackingProjectSelectionFormControl;

    this.timeTrackingTaskSelectionFromControl = new FormControl('');
    controlsConfigObj[this.formControlNameTaskSelectionDropDown] = this.timeTrackingTaskSelectionFromControl;

    this.timeTrackingUserSelectionForm = this.formBuilder.group(controlsConfigObj);

    // init projectSectionDropDown data
    const allProjects: IProject[] = this.projectManagementService.getProjects();
    if (allProjects && allProjects.length > 0 && this.projectOptions.length === 0) {
      allProjects.forEach((project: IProject) => {
        this.projectOptions.push(new ProjectOption(project));
      });
    }
    // init taskSelectionDropDrown data
    const allTasks: ITask[] = this.taskManagementService.getTasks();
    if (allTasks && allTasks.length > 0 && this.taskOptions.length === 0) {
      allTasks.forEach((task: ITask) => {
        this.taskOptions.push(new TaskOption(task));
      });
    }

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe((params: Params) => {
      const projectId = params[routesConfig.projectIdProperty];
      const taskId = params[routesConfig.taskIdProperty];
      if (projectId && taskId) {
        const projectOption: IProjectOption = this.projectOptions.find((oneProjectOption: IProjectOption) => {
          return oneProjectOption.value.projectId === projectId;
        });
        if (projectOption) {
          this.timeTrackingUserSelectionForm.controls[this.formControlNameProjectSelectionDropDown].setValue(projectOption.value);
        } else {
          console.error('no project option for: ' + projectId);
        }
        const taskOption: ITaskOption = this.taskOptions.find((oneTaskOption: ITaskOption) => {
          return oneTaskOption.value.taskId === taskId;
        });
        if (taskOption) {
          this.timeTrackingUserSelectionForm.controls[this.formControlNameTaskSelectionDropDown].setValue(taskOption.value);
        } else {
          console.error('no task option for:' + taskId);
        }
      }
    });
  }

  private visualizeTimeEntry(timeEntryId: string) {
    const durationPromise = this.commitService.getDuration(timeEntryId);
    durationPromise.then((durationStr: string) => {
      this.currentTimeEntryDuration = durationStr;
    });
    durationPromise.catch((err: any) => {
      console.error('getDuration rejected with');
      console.error(err);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    if (this.activatedRouteSubscription) {
      this.activatedRouteSubscription.unsubscribe();
    }
    if (this.inMemoryDataServiceSubscription) {
      this.inMemoryDataServiceSubscription.unsubscribe();
    }
  }
}
