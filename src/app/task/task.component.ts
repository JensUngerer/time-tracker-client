import { IProjectOption, ProjectOption } from './../typescript/projectOption';
import { ActivatedRoute } from '@angular/router';
import { CurrentSelectionsPropertiesService } from './../current-selections-properties.service';
import { TaskService } from './../task.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { ProjectComponent } from '../project/project.component';
import { ProjectService } from '../project.service';
import { IProject } from '../../../../common/typescript/iProject';

@Component({
  selector: 'mtt-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss', './../css/centerVerticalHorizontal.scss']
})
export class TaskComponent implements OnInit {

  public taskFormGroup: FormGroup = null;

  public formControlNameTaskName = 'theTaskName';

  public isButtonDisabled = false;

  public formControlNameProjectName = 'theProjectName';

  public  projectOptions: IProjectOption[] = [];


  public onSubmit(values: any) {
    const newNewTaskName = values[this.formControlNameTaskName];

    // const projectId = this.currentSelectionsPropertiesService.properties[ProjectComponent.projectIdPropertyName];

    // const projectId = this.activatedRoute.snapshot.queryParams[ProjectComponent.projectIdPropertyName];

    const projectId = this.taskFormGroup.controls[this.formControlNameProjectName].value.projectId;

    this.taskService.addTask(newNewTaskName, projectId);

    this.isButtonDisabled = true;
  }

  constructor(private taskService: TaskService,
              private projectService: ProjectService) {
    const configObj: {[key: string]: AbstractControl} = {};

    configObj[this.formControlNameProjectName] = new FormControl('');


    configObj[this.formControlNameTaskName] = new FormControl('');

    this.taskFormGroup = new FormGroup(configObj);

    const projects = this.projectService.getProjects();
    if (!projects || projects.length === 0) {
      console.error('no projects');
      return;
    }
    projects.forEach((element: IProject) => {
      this.projectOptions.push(new ProjectOption(element));
    });
  }

  ngOnInit() {
  }

}
