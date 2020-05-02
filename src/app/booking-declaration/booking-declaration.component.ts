import { Component, OnInit } from '@angular/core';
import { FormGroup, AbstractControl, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { IProject } from '../../../../common/typescript/iProject';

@Component({
  selector: 'mtt-booking-declaration',
  templateUrl: './booking-declaration.component.html',
  styleUrls: ['./booking-declaration.component.scss',
    './../css/centerVerticalHorizontal.scss']
})
export class BookingDeclarationComponent implements OnInit {

  formControlNameProjectIds: string[] = [];

  formControlNameCode: string = 'theCode';
  formControlNameDescription: string = 'theDescription';

  bookingDeclarationFromGroup: FormGroup = null;

  projects: IProject[] = [
    {
      name: 'MyProject',
      projectId: 'abc'
    },
    {
      name: 'MyProjectTwo',
      projectId: 'abcde'
    }
  ]

  onSubmit(values: any) {
    // const projectIs = values[this.formControlNameProjectIds];
    const code = values[this.formControlNameCode];
    const description = values[this.formControlNameDescription];

    const selectedProjects: IProject[] = [];
    this.formControlNameProjectIds.forEach((oneProjectFormName: string, projectIndex: number) => {
      const isProjectChecked = values[oneProjectFormName];
      if (isProjectChecked) {
        // store the corresponding project-object
        selectedProjects.push(this.projects[projectIndex]);
      }
    });

    // DEBUGGING:
    console.log(values);
  }

  // https://stackoverflow.com/questions/51094146/angular-assign-custom-validator-to-a-formgroup
  private customBookingDeclarationValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      const codeControl = group.controls[this.formControlNameCode];
      const descriptionControl = group.controls[this.formControlNameDescription];
      const areTextFieldFilled = codeControl.value !== '' && descriptionControl.value !== '';
      if (!areTextFieldFilled) {
        group.setErrors({ textFieldsAreNotAllFilled: true });
        return group.errors;
      }

      let numberOfCheckedCounter = 0;
      for (let index = 0; index < this.formControlNameProjectIds.length; index++) {
        const oneFormControlProjectId = this.formControlNameProjectIds[index];
        const control = group.controls[oneFormControlProjectId];
        if (control.value) {
          numberOfCheckedCounter++;
          group.setErrors(null);
          return group.errors;
        }
      }
      if (numberOfCheckedCounter === 0) {
        group.setErrors({ atLeastOneCheckboxMustBeChecked: true });
        return group.errors;
      }
    };
  }

  private formControlNames = [
    this.formControlNameCode,
    this.formControlNameDescription
  ];

  constructor() {
    this.projects.forEach((oneProject: IProject, index: number) => {
      this.formControlNameProjectIds.push('theProjectId_' + index.toString());
    });
    this.formControlNames = this.formControlNames.concat(this.formControlNameProjectIds);

    const configObj: { [key: string]: AbstractControl } = {};
    // https://stackoverflow.com/questions/35462316/requiring-a-checkbox-to-be-checked
    this.formControlNames.forEach((oneFormControlName: string) => {
      if (oneFormControlName.includes('theProjectId')) {
        configObj[oneFormControlName] = new FormControl(false);
      } else {
        configObj[oneFormControlName] = new FormControl('');
      }
    });
    this.bookingDeclarationFromGroup = new FormGroup(configObj);
    this.bookingDeclarationFromGroup.setValidators(this.customBookingDeclarationValidator());
  }

  ngOnInit(): void {
  }

}
