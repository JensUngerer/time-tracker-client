import { CommitService } from './../commit.service';
import { IProjectOption, ProjectOption } from './../typescript/projectOption';
import { ActivatedRoute } from '@angular/router';
import { CurrentSelectionsPropertiesService } from './../current-selections-properties.service';
import { TaskService } from './../task.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { ProjectComponent, IProjectGridLine } from '../project/project.component';
import { ProjectService } from '../project.service';
import { IProject } from '../../../../common/typescript/iProject';
import { ITask } from '../../../../common/typescript/iTask';

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

  public projectOptions: IProjectOption[] = [];

  public gridLines: IProjectGridLine[] = [];

  public onSubmit(values: any) {
    const newNewTaskName = values[this.formControlNameTaskName];

    // const projectId = this.currentSelectionsPropertiesService.properties[ProjectComponent.projectIdPropertyName];

    // const projectId = this.activatedRoute.snapshot.queryParams[ProjectComponent.projectIdPropertyName];

    const projectId = this.taskFormGroup.controls[this.formControlNameProjectName].value.projectId;

    const task: ITask = this.taskService.addTask(newNewTaskName, projectId);

    this.isButtonDisabled = true;

    this.commitService.postTask(task);
  }

  constructor(private taskService: TaskService,
    private projectService: ProjectService,
    private commitService: CommitService) {
    const configObj: { [key: string]: AbstractControl } = {};

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

  public onTaskRowClicked(line: IProjectGridLine) {

  }

  public onDeleteRowClicked(line: IProjectGridLine) {

  }

  ngOnInit() {
  }

}
