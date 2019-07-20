import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { UserManagementService } from '../user-management.service';
import { IUser } from '../../../../common/typescript/iUser';

@Component({
  selector: 'mtt-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss', './../css/centerVerticalHorizontal.scss']
})
export class UserComponent implements OnInit {

  public isButtonDisabled = false;

  constructor(private userManagementService: UserManagementService) { }

  public formControlName = 'theNameInput';
  public formControlSurname = 'theSurnameInput';
  public nameForm: FormGroup = null;

  public onSubmit(values: any) {
    // this.userManagementService.addUser(values[this.formControlSurname], values[this.formControlName]);
    this.isButtonDisabled = true;
  }

  ngOnInit() {
    const userNameInput = new FormControl();
    const userSurnameInput = new FormControl();
    const configObj: { [key: string]: AbstractControl } = {};
    configObj[this.formControlSurname] = userSurnameInput;
    configObj[this.formControlName] = userNameInput;
    this.nameForm = new FormGroup(configObj);
  }
}
