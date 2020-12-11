import { ChangeDetectorRef, Component, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { IProject } from '../../../../common/typescript/iProject';
import { ITask } from '../../../../common/typescript/iTask';
import { ITimeEntry } from '../../../../common/typescript/iTimeEntry';
import { HelpersService } from '../helpers.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { ITimeEntryOption } from '../typescript/iTimeEntryOption';
import routesConfig from './../../../../common/typescript/routes.js';
import { CommitService } from './../commit.service';
import { TimeTrackingService } from './../time-tracking.service';
import { IProjectOption, ProjectOption } from './../typescript/projectOption';
import { ITaskOption, TaskOption } from './../typescript/taskOption';
import { IBookingDeclarationsDocument } from '../../../../common/typescript/mongoDB/iBookingDeclarationsDocument';
import { ITimeEntryDocument } from './../../../../common/typescript/mongoDB/iTimeEntryDocument';
import { IProjectsDocument } from './../../../../common/typescript/mongoDB/iProjectsDocument';
import { TimeTrackingState } from './timeTrackingState.enum';
import { IGridLine } from '../typescript/iGridLine';
import { ProjectService } from '../project.service';
import { TaskService } from '../task.service';

@Component({
  // encapsulation: ViewEncapsulation.None,
  selector: 'mtt-time-tracking',
  templateUrl: './time-tracking.component.html',
  styleUrls: ['./time-tracking.component.scss', './../css/centerVerticalHorizontal.scss', './../css/table.scss']
})
export class TimeTrackingComponent implements OnInit, OnDestroy {
  private activatedRouteSubscription: Subscription = null;

  private inMemoryDataServiceSubscription: Subscription = null;

  private allProjectsPromise: Promise<string> = null;

  private allTasksPromise: Promise<string> = null;

  private allTasks: ITask[];

  // @Output()
  gridLines: IGridLine[] = [];

  public timeTrackingUserSelectionForm: FormGroup = null;

  public formControlNameUserSelectionDropDown = 'userSelectionDropDown';

  public timeTrackingUserSelectionFormControl: AbstractControl = null;

  public formControlNameProjectSelectionDropDown = 'projectSelectionDropDown';

  public timeTrackingProjectSelectionFormControl: FormControl = null;

  public projectOptions: IProjectOption[] = [];

  public taskOptions: ITaskOption[] = [];

  public timeEntryOptions: ITimeEntryOption[] = [];

  public formControlNameTimeEntrySelectionDropDown = 'timeEntrySelectionDropDown';

  public timeTrackingTimeEntrySelectionFromControl: AbstractControl = null;

  public bookingDeclarationDescription = '';

  private currentBookingDeclarationId;

  private setCurrentTaskViaCurrentTaskId() {
    // TODO: can be replaced
    // this.currentTask = this.gridLines.find((oneGridLine: IGridLine) => {
    //   return oneGridLine.id === this.currentTaskId;
    // });
    this.currentTask = this.allTasks.find((oneTask: ITask) => {
      return oneTask.taskId === this.currentTaskId;
    });

  }

  onTaskRowClicked($event: IGridLine) {
    const taskId = $event.id;
    const task = this.taskOptions.find((oneTaskOption: ITaskOption) => {
      return oneTaskOption.value.taskId === taskId;
    });
    this.onTaskChange(task.value);

    this.setCurrentTaskViaCurrentTaskId();

    // TODO: necessary ?
    // this.isStartStopButtonDisabled = false;
  }

  onDeleteRowClicked($event: any) {

  }

  isTasksTableVisible = true;
  isUiElementDisabled = false;

  currentTaskId = this.taskService.taskId;

  // currentTask: IGridLine = this.gridLines.find((oneGridLine: IGridLine) => {
  //   return oneGridLine.id === this.currentTaskId;
  // });
  currentTask: ITask;

  private async redrawTableOfTasks(projectId: string) {
    if (!projectId) {
      return;
    }
    this.gridLines = await this.projectService.getTasksByProjectId(projectId);
  }

  public onTaskChange(task: ITask) {
    this.setBookingDescription(task._bookingDeclarationId);
    this.currentTaskId = task.taskId;

    // TODO: necessary ?
    // this.isStartStopButtonDisabled = false;

    this.taskService.taskId = this.currentTaskId;

    this.setCurrentTaskViaCurrentTaskId();
  }

  public onProjectChange($event: any) {
    const projectId = $event.value.projectId;
    this.redrawTableOfTasks(projectId);
    this.initTasksDropDown(projectId);
    if (this.taskService.taskId) {
      this.currentTaskId = this.taskService.taskId;

      // TODO: necessary ?
      // this.isStartStopButtonDisabled = false;
    }
  }

  // private displayCurrentProjectInDropDown(projectId: string) {
  //   const projectOption: IProjectOption = this.projectOptions.find((oneProjectOption: IProjectOption) => {
  //     return oneProjectOption.value.projectId === projectId;
  //   });
  //   if (projectOption) {
  //     this.timeTrackingUserSelectionForm.controls[this.formControlNameProjectSelectionDropDown].setValue(projectOption.value);
  //   } else {
  //     console.error('no project option for: ' + projectId);
  //   }

  //   this.redrawTableOfTasks(projectId);
  // }

  private initTasksDropDown(projectId) {
    return new Promise((resolve: (value?: any) => void) => {
      // init taskSelectionDropDrown data
      this.taskOptions = [];
      this.allTasksPromise = this.commitService.getTasksByProjectId(projectId);
      // this.allTasksPromise = this.projectService.getTasksByProjectId(projectId);
      this.allTasksPromise.then((allTasksStr: string) => {
        this.allTasks = this.sessionStorageSerializationService.deSerialize<ITask[]>(allTasksStr);
        if (this.allTasks && this.allTasks.length > 0 && this.taskOptions.length === 0) {
          this.allTasks.forEach((task: ITask) => {
            this.taskOptions.push(new TaskOption(task));
          });
          resolve();
        }
      });
      this.allTasksPromise.catch(() => {
        console.error('get tasks rejected');
      });
    });
  }

  constructor(private taskService: TaskService,
    private projectService: ProjectService,
    private helpersService: HelpersService,
    private timeTrackingService: TimeTrackingService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private commitService: CommitService,
    private sessionStorageSerializationService: SessionStorageSerializationService) {
    const controlsConfigObj: { [key: string]: AbstractControl } = {};

    this.timeTrackingProjectSelectionFormControl = new FormControl('');
    controlsConfigObj[this.formControlNameProjectSelectionDropDown] = this.timeTrackingProjectSelectionFormControl;

    this.timeTrackingTimeEntrySelectionFromControl = new FormControl('');
    controlsConfigObj[this.formControlNameTimeEntrySelectionDropDown] = this.timeTrackingTimeEntrySelectionFromControl;

    this.timeTrackingUserSelectionForm = this.formBuilder.group(controlsConfigObj);

    // init projectSectionDropDown data
    this.allProjectsPromise = this.commitService.getProjects();
    this.allProjectsPromise.then((projectsStr: string) => {
      const allProjects = this.sessionStorageSerializationService.deSerialize<IProject[]>(projectsStr);
      if (allProjects && allProjects.length > 0 && this.projectOptions.length === 0) {
        allProjects.forEach((project: IProject) => {
          this.projectOptions.push(new ProjectOption(project));
        });
      }
    });
    this.allProjectsPromise.catch(() => {
      console.error('getProjects rejected');
    });


    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe((params: Params) => {
      const projectId = params[routesConfig.projectIdProperty];
      const taskId = params[routesConfig.taskIdProperty];

      if (taskId) {
        this.currentTaskId = taskId;
        taskService.taskId = this.currentTaskId;

        this.setCurrentTaskViaCurrentTaskId();

        // TODO: necessary ???
        // this.isStartStopButtonDisabled = false;
      }
      if (!projectId) {
        return;
      }

      const initTaskDropDownPromise = this.initTasksDropDown(projectId);
      initTaskDropDownPromise.then(() => {

        this.redrawTableOfTasks(projectId);

        // TODO: re-introduce this feature
      //   const isTimeEntryRunningPromise = this.displayRunningTimeEntry();
      //   isTimeEntryRunningPromise.then((resolvedTimeEntryValues: ITimeEntryDocument) => {
      //     if (!resolvedTimeEntryValues) {
      //       // there are not running timeEntries --> continue as before
      //       this.allProjectsPromise.finally(() => {
      //         if (projectId) {
      //           this.displayCurrentProjectInDropDown(projectId);
      //         }
      //         this.allTasksPromise.finally(() => {
      //           if (taskId) {
      //             this.setTask(taskId);
      //           }
      //         });
      //       });
      //     }
      //   });
      });
      initTaskDropDownPromise.catch(() => {
        console.error('could not get tasks');
      });
    });
  }

  // private setTask(taskId: string) {
  //   const taskOption: ITaskOption = this.taskOptions.find((oneTaskOption: ITaskOption) => {
  //     return oneTaskOption.value.taskId === taskId;
  //   });
  //   if (taskOption) {
  //     const currentTask = this.allTasks.find((oneTask: ITask) => {
  //       return oneTask.taskId === taskId;
  //     });

  //     this.setBookingDescription(currentTask._bookingDeclarationId);

  //     this.redrawTableOfTasks(currentTask._projectId);
  //   } else {
  //     console.error('no task option for:' + taskId);
  //   }
  // }

  // private displayRunningTimeEntry(): Promise<ITimeEntryDocument> {
  //   return new Promise<ITimeEntryDocument>((resolve: (value?: ITimeEntryDocument) => void) => {
  //     const getRunningPromise = this.commitService.getRunningTimeEntry();
  //     getRunningPromise.then((runningTimeEntry: string) => {
  //       const runningTimeEntryParsed: ITimeEntryDocument = this.sessionStorageSerializationService.deSerialize(runningTimeEntry);
  //       if (runningTimeEntryParsed) {
  //         resolve(runningTimeEntryParsed);

  //         const timeEntryId = runningTimeEntryParsed.timeEntryId;
  //         const projectPromise = this.commitService.getProjectByTaskId(runningTimeEntryParsed._taskId);
  //         projectPromise.then((rawProject: string) => {
  //           if (!rawProject) {
  //             console.error('no project found');
  //             return;
  //           }
  //           // a) project
  //           const project: IProjectsDocument = this.sessionStorageSerializationService.deSerialize(rawProject);
  //           this.insertProjectIfNotContained(project);
  //           this.displayCurrentProjectInDropDown(project.projectId)

  //           // b) booking-declaration
  //           this.setBookingDescription(runningTimeEntryParsed._bookingDeclarationId);


  //           // c) task
  //           const taskId = runningTimeEntryParsed._taskId;
  //           const insertTaskPromise = this.insertTaskIfNotContained(taskId);

  //           insertTaskPromise.then(() => {
  //             this.setTask(taskId);

  //             // start visualization
  //             this.startStopButtonLabel = TimeTrackingState.stop;
  //             const timeEntryPromise = this.commitService.getTimeEntryById(timeEntryId);
  //             timeEntryPromise.then((rawTimeEntry: string) => {
  //               this.visualizeStartedTimeEntry(rawTimeEntry);
  //             });
  //             timeEntryPromise.catch(() => {
  //               console.error('timeEntry rejected');
  //             });
  //           });
  //           insertTaskPromise.catch(() => {
  //             console.error('error when inserting missing task');
  //           });
  //         });

  //       } else {
  //         resolve(null);
  //       }
  //     });

  //   });
  // }


  // private insertProjectIfNotContained(project: IProjectsDocument) {
  //   if (!project) {
  //     return;
  //   }
  //   if (!this.projectOptions) {
  //     this.projectOptions = [];
  //   }
  //   const indexInOptions = this.projectOptions.findIndex((oneProjectOption: IProjectOption) => {
  //     return oneProjectOption.value.projectId === project.projectId;
  //   });
  //   if (indexInOptions === -1) {
  //     this.projectOptions.push(new ProjectOption(project));
  //   }
  // }

  // private insertTaskIfNotContained(taskId: string) {
  //   return new Promise<any>((resolve: (value?: any) => void) => {
  //     if (!this.taskOptions) {
  //       this.taskOptions = [];
  //     }
  //     const indexInTaskOptions = this.taskOptions.findIndex((oneTaskOption: TaskOption) => {
  //       return oneTaskOption.value.taskId === taskId;
  //     });
  //     if (indexInTaskOptions === -1) {
  //       const getTaskPromise = this.commitService.getTaskById(taskId);
  //       getTaskPromise.then((rawTask: string) => {
  //         const task: ITask = this.sessionStorageSerializationService.deSerialize(rawTask);
  //         this.taskOptions.push(new TaskOption(task));
  //         resolve(true);
  //       });
  //       getTaskPromise.catch(() => {
  //         console.error('error when catching task');
  //         resolve(null);
  //       });
  //     } else {
  //       resolve(false);
  //     }
  //   });
  // }

  private setBookingDescription(bookingDeclarationId: string) {
    this.currentBookingDeclarationId = bookingDeclarationId;

    const bookingDocumentPromise = this.commitService.getBookingDeclarationById(this.currentBookingDeclarationId);
    bookingDocumentPromise.then((receivedBookingRaw: string) => {
      const parsedDocuments: IBookingDeclarationsDocument[]
        = this.sessionStorageSerializationService.deSerialize(receivedBookingRaw);

      this.bookingDeclarationDescription = parsedDocuments[0].description;
    });
  }

  // public onTimeEntryChanged($event: any) {
  //   // DEBUGGING:
  //   console.log($event);

  //   // const value: ITimeEntryDocument = $event.value;
  //   // this.setTimeEntryIdInUrl(value.timeEntryId);
  //   // // this.startStopButtonLabel = TimeTrackingState.stop;
  // }

  ngOnInit() {
    // TODO: still necessary ???
    // this.visualizeTimeEntry(null);
  }

  ngOnDestroy(): void {
    if (this.activatedRouteSubscription) {
      this.activatedRouteSubscription.unsubscribe();
    }
    if (this.inMemoryDataServiceSubscription) {
      this.inMemoryDataServiceSubscription.unsubscribe();
    }
  }
}
