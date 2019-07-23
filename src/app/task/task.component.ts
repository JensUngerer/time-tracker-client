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
import { Subscription, Observable } from 'rxjs';
import { InMemoryDataService } from '../in-memory-data.service';
import * as _ from 'underscore';
import { IGridLine } from './../typescript/iGridLine';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IDeleteDialogData } from '../typescript/iDeleteDialogData';
import { ProjectDeleteDialogComponent } from '../project-delete-dialog/project-delete-dialog.component';
import { ViewPaths } from '../viewPathsEnum';
import { Router } from '@angular/router';

@Component({
  selector: 'mtt-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss', './../css/centerVerticalHorizontal.scss']
})
export class TaskComponent implements OnInit, OnDestroy {

  private projectChangesSubscription: Subscription = null;
  private isMemoryReadySubscription: Subscription = null;
  private afterDialogCloseSubscription$: Observable<boolean> = null;

  public taskFormGroup: FormGroup = null;

  public formControlNameTaskName = 'theTaskName';

  public formControlNameProjectName = 'theProjectName';

  public projectOptions: IProjectOption[] = [];

  public gridLines: IGridLine[] = [];

  public onSubmit(values: any) {
    const newNewTaskName = values[this.formControlNameTaskName];

    const projectId = this.taskFormGroup.controls[this.formControlNameProjectName].value.projectId;

    const task: ITask = this.taskService.addTask(newNewTaskName, projectId);

    // clear input field (and so disable button)
    this.taskFormGroup.controls[this.formControlNameTaskName].setValue('');


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

      // clear input field
      // this.taskFormGroup.controls[this.formControlNameTaskName].setValue('');
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
    private inMemoryDataService: InMemoryDataService,
    public dialog: MatDialog,
    private router: Router) {
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
    const projectId = this.activatedRoute.snapshot.queryParams[routesConfig.projectIdProperty];
    if (!projectId) {
      console.error('cannot switch to commit-view as missing projectId:' + projectId);
      return;
    }
    const taskId = line.id;

    const url = routesConfig.viewsPrefix + ViewPaths.timeTracking;
    const queryParams = {
      taskId,
      projectId
    }
    this.router.navigate([url], { queryParams });
  }


  public onDeleteRowClicked(line: IGridLine) {
    // const projectId = this.getSelectedProjectId();
    const taskId = line.id;


    const dialogData: IDeleteDialogData = {
      line,
      headerText: 'Delete task:',
      contentText: 'Plus all corresponding (not committed!!!) timeEntries?'
    };
    const dialogRef: MatDialogRef<ProjectDeleteDialogComponent, boolean> = this.dialog.open(ProjectDeleteDialogComponent, {
      data: dialogData
    });
    this.afterDialogCloseSubscription$ = dialogRef.afterClosed();
    this.afterDialogCloseSubscription$.subscribe((isOkButtonPressed: boolean) => {
      if (isOkButtonPressed) {
        const deleteTaskPromise = this.commitService.deleteTask(taskId);
        deleteTaskPromise.then((resolvedValue: any) => {
          console.log(resolvedValue);

          // delete all corresponding time-entries (which have not yet been committed, as otherwise they have been deleted before)
          this.inMemoryDataService.deleteTimeEntriesByTaskId(taskId);

          this.inMemoryDataService.loadDataFromDb();
        });
        deleteTaskPromise.catch((rejectValue: any) => {
          console.error(rejectValue);

          // delete all corresponding time-entries (which have not yet been committed, as otherwise they have been deleted before)
          this.inMemoryDataService.deleteTimeEntriesByTaskId(taskId);

          this.inMemoryDataService.loadDataFromDb();
        });

        // --> a refresh will be triggered automatically?
      }
    });


  }

  public redrawTableOfProject(selectedProject: IProject) {
    // TODO: FIXME: why two times triggered ??
    this.gridLines = [];
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
    if (this.projectChangesSubscription) {
      this.projectChangesSubscription.unsubscribe();
    }
    if (this.inMemoryDataService) {
      this.isMemoryReadySubscription.unsubscribe();
    }
  }
}
