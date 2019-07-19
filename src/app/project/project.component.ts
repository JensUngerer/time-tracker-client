import { CurrentSelectionsPropertiesService } from './../current-selections-properties.service';
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

  public static projectIdPropertyName = 'projectId';

  public projectFormGroup: FormGroup = null;

  public formControlNameProjectName = 'theProjectName';

  public isAddButtonDisabled = false;

  public onSubmit(values: any) {
    const projectName = values[this.formControlNameProjectName];
    const projectId: string = this.projectService.addProject(projectName);
    this.isAddButtonDisabled = true;

    this.currentSelectionsPropertiesService.properties[ProjectComponent.projectIdPropertyName] = projectId;
  }

  constructor(private projectService: ProjectService,
              private currentSelectionsPropertiesService: CurrentSelectionsPropertiesService) {
    const configObj: {[key: string]: AbstractControl} = {};
    configObj[this.formControlNameProjectName] = new FormControl('');

    this.projectFormGroup = new FormGroup(configObj);
  }

  ngOnInit() {
  }

}
