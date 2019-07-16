import { ProjectService } from './../project.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';

@Component({
  selector: 'mtt-project',
  templateUrl: './project.component.html',
  styleUrls: [
    './project.component.scss',
    './../css/centerVerticalHorizontal.scss'
  ]
})
export class ProjectComponent implements OnInit {

  public projectFormGroup: FormGroup = null;

  public formControlNameProjectName = 'theProjectName';

  public isAddButtonDisabled = false;

  public onSubmit(values: any) {
    const projectName = values[this.formControlNameProjectName];
    this.projectService.addProject(projectName);
    this.isAddButtonDisabled = true;
  }

  constructor(private projectService: ProjectService) {
    const configObj: {[key: string]: AbstractControl} = {};
    configObj[this.formControlNameProjectName] = new FormControl('');

    this.projectFormGroup = new FormGroup(configObj);
  }

  ngOnInit() {
  }

}
