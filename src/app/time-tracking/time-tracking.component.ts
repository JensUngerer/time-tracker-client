import { Component, OnInit } from '@angular/core';
import { FormGroup, AbstractControl, FormControl, FormBuilder } from '@angular/forms';
import { IUser } from '../../../../common/typescript/iUser';
import { UserManagementService } from '../user-management.service';

export interface IUserOption {
  value: IUser;
  viewValue: string;
}

export class UserOption implements IUserOption {
  constructor(public value: IUser) { }

  public get viewValue(): string {
    return this.value.name + ', ' + this.value.surname;
  }
}

@Component({
  selector: 'mtt-time-tracking',
  templateUrl: './time-tracking.component.html',
  styleUrls: ['./time-tracking.component.scss', './../css/centerVerticalHorizontal.scss']
})
export class TimeTrackingComponent implements OnInit {

  public timeTrackingUserSelectionForm: FormGroup = null;

  public formControlNameUserSelectionDropDown = 'userSelectionDropDown';

  public userOptions: IUserOption[] = [];

  public timeTrackingUserSelectionFormControl: AbstractControl = null;

  constructor(private userManagementService: UserManagementService, private formBuilder: FormBuilder) {
    // init userSelectionFormGroup
    const controlsConfigObj: { [key: string]: AbstractControl } = {};
    this.timeTrackingUserSelectionFormControl = new FormControl('');
    controlsConfigObj[this.formControlNameUserSelectionDropDown] = this.timeTrackingUserSelectionFormControl;

    this.timeTrackingUserSelectionForm = this.formBuilder.group(controlsConfigObj);

    // init userSelectionDropDown data
    const allUsers: IUser[] = this.userManagementService.getUsers();
    if (allUsers && allUsers.length > 0 && this.userOptions.length === 0) {
      allUsers.forEach((user: IUser) => {
        this.userOptions.push(new UserOption(user));
      });
    }
  }

  ngOnInit() {
  }

}
