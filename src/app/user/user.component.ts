import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';

@Component({
  selector: 'mtt-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss', './../css/centerVerticalHorizontal.scss']
})
export class UserComponent implements OnInit {

  constructor(private formBuilder: FormBuilder) { }

  public formControlName = 'theNameInput';
  public formControlSurname = 'theSurnameInput';
  public nameForm: FormGroup = null;

  public onSubmit(values: any) {
    console.log(this.nameForm.value);
  }

  ngOnInit() {
    const userNameInput = new FormControl();
    const userSurnameInput = new FormControl();
    const configObj: {[key: string]: AbstractControl} = {};
    configObj[this.formControlSurname] = userSurnameInput;
    configObj[this.formControlName] = userNameInput;
    this.nameForm = new FormGroup(configObj);
  }

}
