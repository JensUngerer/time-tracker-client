import { Component, OnInit } from '@angular/core';
import { FormGroup, AbstractControl, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { IProject } from '../../../../common/typescript/iProject';
import { CommitService } from '../commit.service';
import { IBookingDeclaration } from './../../../../common/typescript/iBookingDeclaration';
import uuid from 'uuid';

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

  projects: IProject[] = []

  onSubmit(values: any) {
    const code = values[this.formControlNameCode];
    const description = values[this.formControlNameDescription];

    // const selectedProjects: IProject[] = [];
    const _projectIds: string[] = [];
    this.formControlNameProjectIds.forEach((oneProjectFormName: string, projectIndex: number) => {
      const isProjectChecked = values[oneProjectFormName];
      if (isProjectChecked) {
        // store the corresponding project-object
        const correspondingProject = this.projects[projectIndex];
        // selectedProjects.push(correspondingProject);
        _projectIds.push(correspondingProject.projectId)
      }
    });

    const bookingDeclaration: IBookingDeclaration = {
      _projectIds,
      code,
      description,
      bookingDeclarationId: uuid.v4()
    };

    // DEBUGGING:
    // console.log(values);
    // console.log(bookingDeclaration)

    this.resetFormGroup();
    this.commitService.postBookingDeclaration(bookingDeclaration);
  }

  private resetFormGroup() {
    const allControls = this.bookingDeclarationFromGroup.controls;
    allControls[this.formControlNameCode].setValue('');
    allControls[this.formControlNameDescription].setValue('');

    this.formControlNameProjectIds.forEach((oneFormControlNameOfAProjectId: string) => {
      allControls[oneFormControlNameOfAProjectId].setValue(false);
    });
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

  private setupForm() {
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

  constructor(private commitService: CommitService) {
  }

  ngOnInit(): void {
    this.setupForm();

    const getProjectsPromise = this.commitService.getProjects();
    getProjectsPromise.then((projectsStr: string) => {
      this.projects = JSON.parse(projectsStr);

      this.setupForm();
    });
    getProjectsPromise.catch((error: any) => {
      console.error(error);
    });
  }
}
