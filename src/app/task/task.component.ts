import { CommitService } from './../commit.service';
import { IProjectOption, ProjectOption } from './../typescript/projectOption';
import { ActivatedRoute, Params } from '@angular/router';
import { TaskService } from './../task.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { ProjectService } from '../project.service';
import { IProject } from '../../../../common/typescript/iProject';
import { ITask } from '../../../../common/typescript/iTask';
import routesConfig from './../../../../common/typescript/routes.js';
import { Subscription } from 'rxjs';
import { InMemoryDataService } from '../in-memory-data.service';
import * as _ from 'underscore';
import { IGridLine } from './../typescript/iGridLine';

@Component({
  selector: 'mtt-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss', './../css/centerVerticalHorizontal.scss']
})
export class TaskComponent implements OnInit, OnDestroy {

  private projectChangesSubscription: Subscription = null;
  private isMemoryReadySubscription: Subscription = null;

  public taskFormGroup: FormGroup = null;

  public formControlNameTaskName = 'theTaskName';

  public isButtonDisabled = false;

  public formControlNameProjectName = 'theProjectName';

  public projectOptions: IProjectOption[] = [];

  public gridLines: IGridLine[] = [];

  public onSubmit(values: any) {
    const newNewTaskName = values[this.formControlNameTaskName];

    const projectId = this.taskFormGroup.controls[this.formControlNameProjectName].value.projectId;

    const task: ITask = this.taskService.addTask(newNewTaskName, projectId);

    this.isButtonDisabled = true;

    const createTaskPromise: Promise<any> = this.commitService.postTask(task);
    createTaskPromise.then(() => {
      this.inMemoryDataService.loadDataFromDb();

      // isReady will be triggered!
      // --> this.triggerReDraw(projectId);
    });
    createTaskPromise.catch(() => {
      this.inMemoryDataService.loadDataFromDb();

      // isReady will be triggered!
      // --> this.triggerReDraw(projectId);
    });
  }

  private triggerReDraw(projectId: string) {
    const currentProject = this.projectOptions.find((aProjectOption: IProjectOption) => {
      return aProjectOption.value.projectId === projectId;
    });
    if (!currentProject) {
      console.error('no current project found');
      return;
    }

    this.redrawTableOfProject(currentProject.value);
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
        this.redrawTableOfProject(theEvent);
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

      if (this.isMemoryReadySubscription) {
        this.isMemoryReadySubscription.unsubscribe();
      }
      this.isMemoryReadySubscription = this.inMemoryDataService.getIsReady().subscribe((isReady: boolean) => {
        if (isReady) {
          this.triggerReDraw(projectIdFromUrl);
        }
      });
    });
  }

  public onTaskRowClicked(line: IGridLine) {

  }

  // private getSelectedProjectId(): string {
  //   const projectId = this.taskFormGroup.controls[this.formControlNameProjectName].value.projectId;
  //   return projectId;
  // }

  public onDeleteRowClicked(line: IGridLine) {
    // const projectId = this.getSelectedProjectId();
    const taskId = line.id;
    this.commitService.deleteTask(taskId);

    // TODO: dialog

    // TODO: delete all corresponding time-entries (which have not yet been committed!)
  }

  public redrawTableOfProject(selectedProject: IProject) {
    const existingCorrespondingTasks = this.inMemoryDataService.getTasksByProjectId(selectedProject.projectId);
    if (!existingCorrespondingTasks || existingCorrespondingTasks.length === 0) {
      console.error('no corresponding tasks to projectId:' + selectedProject.projectId);
      return;
    }
    existingCorrespondingTasks.forEach((oneTask: ITask) => {
      const taskForRow: IGridLine = {
        name: oneTask.name,
        id: oneTask.taskId,
        deleteRow: ''
      };
      this.gridLines.push(taskForRow);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.projectChangesSubscription.unsubscribe();
    this.isMemoryReadySubscription.unsubscribe();
  }
}
