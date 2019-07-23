import { CommitService } from './../commit.service';
import { IProjectOption, ProjectOption } from './../typescript/projectOption';
import { ActivatedRoute, Params } from '@angular/router';
import { CurrentSelectionsPropertiesService } from './../current-selections-properties.service';
import { TaskService } from './../task.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { ProjectComponent, IProjectGridLine } from '../project/project.component';
import { ProjectService } from '../project.service';
import { IProject } from '../../../../common/typescript/iProject';
import { ITask } from '../../../../common/typescript/iTask';
import routesConfig from './../../../../common/typescript/routes.js';
import { Subscription } from 'rxjs';
import { InMemoryDataService } from '../in-memory-data.service';
import * as _ from 'underscore';

@Component({
  selector: 'mtt-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss', './../css/centerVerticalHorizontal.scss']
})
export class TaskComponent implements OnInit, OnDestroy {

  private projectChangesSubscription: Subscription = null;

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
              private commitService: CommitService,
              private activatedRoute: ActivatedRoute,
              private inMemoryDataService: InMemoryDataService) {
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

    this.projectChangesSubscription = this.taskFormGroup
    .controls[this.formControlNameProjectName]
    .valueChanges
    .subscribe((theEvent: any) => {
      this.onProjectSelectionChanged(theEvent);
    });

    this.activatedRoute.queryParams.subscribe((params: Params) => {
      const projectIdFromUrl = params[routesConfig.projectIdProperty];

      const correspondingDropDownMenuEntry = this.projectOptions.find((oneProjectOption: IProjectOption) => {
        return oneProjectOption.value.projectId === projectIdFromUrl;
      });
      if (!correspondingDropDownMenuEntry) {
        console.error('!correspondingDropDownMenuEntry');
        return;
      }
      this.taskFormGroup.controls[this.formControlNameProjectName].setValue(correspondingDropDownMenuEntry.value);
    });
  }

  public onTaskRowClicked(line: IProjectGridLine) {

  }

  public onDeleteRowClicked(line: IProjectGridLine) {

  }

  public onProjectSelectionChanged(selectedProject: IProject) {
    const existingCorrespondingTasks = this.inMemoryDataService.getTasksByProjectId(selectedProject.projectId);
    if (!existingCorrespondingTasks || existingCorrespondingTasks.length === 0) {
      console.error('no corresponding tasks to projectId:' + selectedProject.projectId);
      return;
    }
    existingCorrespondingTasks.forEach((oneTask: ITask) => {
      const taskForRow: IProjectGridLine = {
        name: oneTask.name,
        projectId: oneTask._projectId,
        deleteRow: ''
      };
      this.gridLines.push(taskForRow);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.projectChangesSubscription.unsubscribe();
  }
}
