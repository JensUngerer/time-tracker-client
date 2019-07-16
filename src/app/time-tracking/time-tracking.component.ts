import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, AbstractControl, FormControl, FormBuilder, Validators } from '@angular/forms';
import { IUser } from '../../../../common/typescript/iUser';
import { UserManagementService } from '../user-management.service';
import { IProject } from '../../../../common/typescript/iProject';
import { ProjectService } from '../project.service';

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

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'mtt-time-tracking',
  templateUrl: './time-tracking.component.html',
  styleUrls: ['./time-tracking.component.scss', './../css/centerVerticalHorizontal.scss']
})
export class TimeTrackingComponent implements OnInit {

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

  public projectOptions: ProjectOption[] = [];

  public onStartStopButtonClicked() {
    this.startStopButtonLabel = (this.startStopButtonLabel === 'Start') ? 'Stop' : 'Start';
    if (this.startStopButtonLabel === 'Stop') {
      this.isPauseResumeButtonDisabled = false;
    } else {
      this.isPauseResumeButtonDisabled = true;
    }
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
              private formBuilder: FormBuilder) {
    // init userSelectionFormGroup
    const controlsConfigObj: { [key: string]: AbstractControl } = {};
    // https://stackoverflow.com/questions/30583828/javascript-regex-matching-at-least-one-letter-or-number
    this.timeTrackingUserSelectionFormControl = new FormControl(''/*, [Validators.pattern(/^(?=.*[a-zA-Z0-9])/)]*/);
    controlsConfigObj[this.formControlNameUserSelectionDropDown] = this.timeTrackingUserSelectionFormControl;

    this.timeTrackingProjectSelectionFormControl = new FormControl('');
    controlsConfigObj[this.formControlNameProjectSelectionDropDown] = this.timeTrackingProjectSelectionFormControl;

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
  }

  ngOnInit() {
  }

}
