import { Router, ActivatedRoute } from '@angular/router';
import { TimeTrackingService } from './../time-tracking.service';
import { TaskService } from './../task.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, AbstractControl, FormControl, FormBuilder, Validators } from '@angular/forms';
import { IUser } from '../../../../common/typescript/iUser';
import { UserManagementService } from '../user-management.service';
import { IProject } from '../../../../common/typescript/iProject';
import { ProjectService } from '../project.service';
import { ITask } from '../../../../common/typescript/iTask';
import { ITimeEntry } from '../../../../common/typescript/iTimeEntry';

export interface IUserOption {
  value: IUser;
  viewValue: string;
}

export class UserOption implements IUserOption {
  constructor(public value: IUser) { }

  public get viewValue(): string {
    return this.value.name + ' ' + this.value.surname;
  }
}

export interface IProjectOption {
  value: IProject;
  viewValue: string;
}

export class ProjectOption implements IProjectOption {
  constructor(public value: IProject) { }

  public get viewValue(): string {
    return this.value.name;
  }
}

export interface ITaskOption {
  value: ITask;
  viewValue: string;
}

export class TaskOption implements ITaskOption {
  constructor(public value: ITask) { }

  public get viewValue(): string {
    return this.value.name;
  }
}

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'mtt-time-tracking',
  templateUrl: './time-tracking.component.html',
  styleUrls: ['./time-tracking.component.scss', './../css/centerVerticalHorizontal.scss']
})
export class TimeTrackingComponent implements OnInit {
  public static timeEntryIdProperty = 'timeEntryId';

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
    this.startStopButtonLabel = (this.startStopButtonLabel === 'Start') ? 'Stop' : 'Start';
    if (this.startStopButtonLabel === 'Stop') {
      const taskId = this.timeTrackingTaskSelectionFromControl.value.taskId;
      const startedTimeEntry: ITimeEntry = this.timeTrackingService.startTimeTracking(taskId);
      this.setTimeEntryIdInUrl(startedTimeEntry.timeEntryId);
      this.isPauseResumeButtonDisabled = false;
    } else {
      const stoppedTimeEntry: ITimeEntry = this.timeTrackingService.stopTimeTracking(this.getTimeEntryIdFromUrl());
      this.isPauseResumeButtonDisabled = true;
    }
  }


  private getTimeEntryIdFromUrl(): string {
    const retrievedTimeEntryId = this.activatedRoute.snapshot.params[TimeTrackingComponent.timeEntryIdProperty];
    return retrievedTimeEntryId;
  }

  private setTimeEntryIdInUrl(timeEntryId: string) {
    const matrixParams = {};
    matrixParams[TimeTrackingComponent.timeEntryIdProperty] = timeEntryId;

    // https://stackoverflow.com/questions/38242584/clear-all-queryparams-with-new-router-v3-angular2
    // https://stackoverflow.com/questions/35618463/change-route-params-without-reloading-in-angular-2
    //this.router.navigate([this.router.url.substr(1)]);

    // https://stackoverflow.com/questions/43698032/angular-how-to-update-queryparams-without-changing-route
    this.router.navigate([], {queryParams: matrixParams, queryParamsHandling: 'merge'});
  }

  public onPauseResumeButtonClicked() {
    this.pauseResumeButtonLabel = (this.pauseResumeButtonLabel === 'Pause') ? 'Resume' : 'Pause';
    if (this.pauseResumeButtonLabel === 'Resume') {
      this.isStartStopButtonDisabled = true;
    } else {
      this.isStartStopButtonDisabled = false;
    }
  }


  constructor(private userManagementService: UserManagementService,
              private projectManagementService: ProjectService,
              private taskManagementService: TaskService,
              private timeTrackingService: TimeTrackingService,
              private formBuilder: FormBuilder,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
    // init userSelectionFormGroup
    const controlsConfigObj: { [key: string]: AbstractControl } = {};
    // https://stackoverflow.com/questions/30583828/javascript-regex-matching-at-least-one-letter-or-number
    this.timeTrackingUserSelectionFormControl = new FormControl(''/*, [Validators.pattern(/^(?=.*[a-zA-Z0-9])/)]*/);
    controlsConfigObj[this.formControlNameUserSelectionDropDown] = this.timeTrackingUserSelectionFormControl;

    this.timeTrackingProjectSelectionFormControl = new FormControl('');
    controlsConfigObj[this.formControlNameProjectSelectionDropDown] = this.timeTrackingProjectSelectionFormControl;

    this.timeTrackingTaskSelectionFromControl = new FormControl('');
    controlsConfigObj[this.formControlNameTaskSelectionDropDown] = this.timeTrackingTaskSelectionFromControl;

    this.timeTrackingUserSelectionForm = this.formBuilder.group(controlsConfigObj);

    // init userSelectionDropDown data
    const allUsers: IUser[] = this.userManagementService.getUsers();
    if (allUsers && allUsers.length > 0 && this.userOptions.length === 0) {
      allUsers.forEach((user: IUser) => {
        this.userOptions.push(new UserOption(user));
      });
    }
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
  }

  ngOnInit() {
  }
}
