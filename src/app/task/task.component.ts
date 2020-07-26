import { SessionStorageSerializationService } from './../session-storage-serialization.service';
import { CommitService } from './../commit.service';
import { IProjectOption, ProjectOption } from './../typescript/projectOption';
import { ActivatedRoute, Params } from '@angular/router';
import { TaskService } from './../task.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { IProject } from '../../../../common/typescript/iProject';
import { ITask } from '../../../../common/typescript/iTask';
import routesConfig from './../../../../common/typescript/routes.js';
import { Subscription, Observable } from 'rxjs';
import * as _ from 'underscore';
import { IGridLine } from './../typescript/iGridLine';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IDeleteDialogData } from '../typescript/iDeleteDialogData';
import { ProjectDeleteDialogComponent } from '../project-delete-dialog/project-delete-dialog.component';
import { ViewPaths } from '../viewPathsEnum';
import { Router } from '@angular/router';
import { IBookingDeclarationsDocument } from '../../../../common/typescript/mongoDB/iBookingDeclarationsDocument';
import { IBookingDeclarationOption, BookingDeclarationOption } from '../typescript/bookingDeclarationOption';

@Component({
  selector: 'mtt-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss', './../css/centerVerticalHorizontal.scss']
})
export class TaskComponent implements OnInit, OnDestroy {
  private projectId: string;

  private projectChangesSubscription: Subscription = null;
  //private isMemoryReadySubscription: Subscription = null;
  private afterDialogCloseSubscription$: Observable<boolean> = null;

  public taskFormGroup: FormGroup = null;

  public formControlNameTaskName = 'theTaskName';

  public formControlNameProjectName = 'theProjectName';

  public formControlNameBookingDeclaration = 'theBookingDeclaration';

  public projectOptions: IProjectOption[] = [];

  public bookingDeclarationOptions: IBookingDeclarationOption[] = [];

  public gridLines: IGridLine[] = [];

  public onSubmit(values: any) {
    const newNewTaskName = values[this.formControlNameTaskName];

    const projectId = this.taskFormGroup.controls[this.formControlNameProjectName].value.projectId;

    const bookingDeclarationId = this.taskFormGroup.controls[this.formControlNameBookingDeclaration].value.bookingDeclarationId;

    const task: ITask = this.taskService.createTask(newNewTaskName, projectId, bookingDeclarationId);

    // clear input field (and so disable button)
    this.taskFormGroup.controls[this.formControlNameTaskName].setValue('');

    const createTaskPromise: Promise<any> = this.commitService.postTask(task);
    createTaskPromise.then(() => {
      this.triggerReDraw(projectId);
    });
    createTaskPromise.catch(() => {
      this.triggerReDraw(projectId);
    });
  }

  private triggerReDraw(projectId: string) {
    if (!projectId) {
      console.error('cannot draw grid because of missing projectId:' + projectId);
      return;
    }
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
              private commitService: CommitService,
              private activatedRoute: ActivatedRoute,
              public dialog: MatDialog,
              private router: Router,
              private sessionStorageSerializationService: SessionStorageSerializationService) {
    const configObj: { [key: string]: AbstractControl } = {};

    configObj[this.formControlNameProjectName] = new FormControl('');
    configObj[this.formControlNameTaskName] = new FormControl('');
    configObj[this.formControlNameBookingDeclaration] = new FormControl('');

    this.taskFormGroup = new FormGroup(configObj);

    const projectsPromise = this.commitService.getProjects();
    projectsPromise.then((projectsStr: string) => {
      const projects = this.sessionStorageSerializationService.deSerialize<IProject[]>(projectsStr);
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
        const projectIdFromUrl = this.getProjectIdFromUrl(params);
        if (!projectIdFromUrl) {
          return;
        }
        this.projectId = projectIdFromUrl;

        // a) show the projectId from URL in the drop-down-menu (for it)
        const correspondingDropDownMenuEntry = this.projectOptions.find((oneProjectOption: IProjectOption) => {
          return oneProjectOption.value.projectId === projectIdFromUrl;
        });
        if (!correspondingDropDownMenuEntry) {
          console.error('!correspondingDropDownMenuEntry');
          return;
        }
        this.taskFormGroup.controls[this.formControlNameProjectName].setValue(correspondingDropDownMenuEntry.value);

        // b) get the correlated booking - declarations (which are possible for a unique projectId)
        this.setCorrelatedBooking(projectIdFromUrl);


        // if (this.isMemoryReadySubscription) {
        //   this.isMemoryReadySubscription.unsubscribe();
        // }
      });
      projectsPromise.catch(() => {
        console.error('getProjects rejected in task.component');
      });
    });
  }

  private setCorrelatedBooking(projectId: string) {
      const bookingDeclarationsPromise = this.commitService.getBookingDeclarationsBy(projectId);
      bookingDeclarationsPromise.then((rawBookingDeclarations: string) => {
        const parsedBookingDeclarations: IBookingDeclarationsDocument[] = JSON.parse(rawBookingDeclarations);

        // DEBUGGING
        // console.log(parsedBookingDeclarations);
        parsedBookingDeclarations.forEach((oneBookingDeclaration: IBookingDeclarationsDocument) => {
          this.bookingDeclarationOptions.push(new BookingDeclarationOption(oneBookingDeclaration));
        });
      });
  }

  public onProjectSelectionChanged() {
    this.projectId = this.taskFormGroup.controls[this.formControlNameProjectName].value.projectId;
    this.setCorrelatedBooking(this.projectId);
  }

  private getProjectIdFromUrl(params?: Params): string {
    let projectIdFromUrl = '';
    if (params && params[routesConfig.projectIdProperty]) {
      projectIdFromUrl = params[routesConfig.projectIdProperty];
    } else {
      if (this.activatedRoute.snapshot.queryParams && this.activatedRoute.snapshot.queryParams[routesConfig.projectIdProperty]) {
        projectIdFromUrl = this.activatedRoute.snapshot.queryParams[routesConfig.projectIdProperty];
      }
    }

    return projectIdFromUrl;
  }

  public onTaskRowClicked(line: IGridLine) {
    const projectId = this.projectId;
    if (!projectId) {
      console.error('cannot switch to commit-view as missing projectId:' + projectId);
      return;
    }
    const taskId = line.id;

    const url = routesConfig.viewsPrefix + ViewPaths.timeTracking;
    const queryParams = {};
    queryParams[routesConfig.taskIdProperty] = taskId;
    queryParams[routesConfig.projectIdProperty] = projectId;
    this.router.navigate([url], { queryParams });
  }


  public onDeleteRowClicked(line: IGridLine) {
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
          // DEBUGGING:
          console.log(resolvedValue);
          this.deleteAndTriggerRedrawAfterwards(taskId);
        });
        deleteTaskPromise.catch((rejectValue: any) => {
          // DEBUGGING:
          console.error('rejection:');
          console.error(rejectValue);

          this.deleteAndTriggerRedrawAfterwards(taskId);
        });
      }
    });
  }

  private deleteAndTriggerRedrawAfterwards(taskId: string) {
    // delete all corresponding time-entries (which have not yet been committed, as otherwise they have been deleted before)
    const deletePromise = this.commitService.deleteTimeEntryByTaskId(taskId);

    deletePromise.then(() => {
      const selectedProject = this.findSelectedProject();
      if (selectedProject) {
        this.redrawTableOfProject(selectedProject);
      }
    });
    deletePromise.catch(() => {
      const selectedProject = this.findSelectedProject();
      if (selectedProject) {
        this.redrawTableOfProject(selectedProject);
      }
    });
  }

  private findSelectedProject(): IProject {
    const projectIdFromUrl = this.projectId;
    const foundProject = this.projectOptions.find((oneProjectOption: IProjectOption) => {
      return oneProjectOption.value.projectId === projectIdFromUrl;
    });
    if (foundProject) {
      return foundProject.value;
    }
    return null;
  }

  public redrawTableOfProject(selectedProject: IProject) {
    this.gridLines = [];
    const existingCorrespondingTasksPromise = this.commitService.getTasksByProjectId(selectedProject.projectId);

    existingCorrespondingTasksPromise.then((tasksStr: string) => {
      const existingCorrespondingTasks = this.sessionStorageSerializationService.deSerialize<ITask[]>(tasksStr);

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
    });
    existingCorrespondingTasksPromise.catch(() => {
      console.error('an rejection when getting tasks');
    });
  }


  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.projectChangesSubscription) {
      this.projectChangesSubscription.unsubscribe();
    }
    // if (this.isMemoryReadySubscription) {
    //   this.isMemoryReadySubscription.unsubscribe();
    // }
  }
}
