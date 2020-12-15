import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import { IProject } from '../../../../common/typescript/iProject';
import { ITask } from '../../../../common/typescript/iTask';
import { IBookingDeclarationsDocument } from '../../../../common/typescript/mongoDB/iBookingDeclarationsDocument';
import { ProjectService } from '../project.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { TimeMeasurement } from '../start-stop/time-measurement.enum';
import { IGridLine } from '../typescript/iGridLine';
import { ITimeEntryOption } from '../typescript/iTimeEntryOption';
import routesConfig from './../../../../common/typescript/routes.js';
import { CommitService } from './../commit.service';
import { IProjectOption, ProjectOption } from './../typescript/projectOption';

@Component({
  // encapsulation: ViewEncapsulation.None,
  selector: 'mtt-time-tracking',
  templateUrl: './time-tracking.component.html',
  styleUrls: ['./time-tracking.component.scss', './../css/centerVerticalHorizontal.scss', './../css/table.scss', './../css/space-around.scss']
})
export class TimeTrackingComponent implements OnInit, OnDestroy {
  private activatedRouteSubscription: Subscription = null;

  private inMemoryDataServiceSubscription: Subscription = null;

  private allProjectsPromise: Promise<string> = null;

  private allTasksPromise: Promise<string> = null;

  private allTasks: ITask[];

  gridLines: IGridLine[] = [];

  public timeTrackingUserSelectionForm: FormGroup = null;

  public formControlNameProjectSelectionDropDown = 'projectSelectionDropDown';

  public timeTrackingProjectSelectionFormControl: FormControl = null;

  public projectOptions: IProjectOption[] = [];

  public timeEntryOptions: ITimeEntryOption[] = [];

  public bookingDeclarationDescription = '';

  private currentBookingDeclarationId;

  private previousTimeMeasurementState: TimeMeasurement;

  private getTaskFromAllTasks() {
    return this.allTasks.find((oneTask: ITask) => {
      return oneTask.taskId === this.currentTaskId;
    });
  }

  private setCurrentTaskViaCurrentTaskId() {
    this.currentTask = this.getTaskFromAllTasks();
  }

  private setTaskFromId(taskId: string) {
    this.currentTaskId = taskId;
    const task = this.getTaskFromAllTasks();
    this.onTaskChange(task);
  }

  onTaskRowClicked($event: IGridLine) {
    // disabling start stop button...
    this.currentTask = null;

    this.setTaskFromId($event.id);
  }

  onDeleteRowClicked($event: any) {

  }

  isTasksTableVisible = true;
  isUiElementDisabled = false;

  currentTaskId;

  currentTask: ITask;

  private async redrawTableOfTasks(projectId: string) {
    if (!projectId) {
      return;
    }
    this.gridLines = await this.projectService.getTasksByProjectId(projectId);
  }

  public onTaskChange(task: ITask) {
    this.setBookingDescription(task._bookingDeclarationId);
    this.setCurrentTaskViaCurrentTaskId();
  }

  public onProjectChange($event: any) {
    const projectId = $event.value.projectId;
    const initTasksPromise = this.initTasks(projectId);
    initTasksPromise.then(() => {
      this.redrawTableOfTasks(projectId);
    });
    return initTasksPromise;
  }

  private displayCurrentProjectInDropDown(projectId: string) {
    const projectOption: IProjectOption = this.projectOptions.find((oneProjectOption: IProjectOption) => {
      return oneProjectOption.value.projectId === projectId;
    });
    if (projectOption) {
      this.timeTrackingUserSelectionForm.controls[this.formControlNameProjectSelectionDropDown].setValue(projectOption.value);
      const initTasksPromise = this.onProjectChange(projectOption);
      initTasksPromise.then(() => {
        this.redrawTableOfTasks(projectId);
      });
      return initTasksPromise;
    } else {
      console.error('no project option for: ' + projectId);
    }
  }

  private initTasks(projectId: string) {
    return new Promise((resolve: (value?: any) => void) => {
      this.allTasksPromise = this.commitService.getTasksByProjectId(projectId);
      this.allTasksPromise.then((allTasksStr: string) => {
        this.allTasks = this.sessionStorageSerializationService.deSerialize<ITask[]>(allTasksStr);
        resolve();
      });
      this.allTasksPromise.catch(() => {
        console.error('get tasks rejected');
      });
    });
  }

  private initProjects() {
    return new Promise((resolve: (value?: any) => void) => {
      // init projectSectionDropDown data
      this.allProjectsPromise = this.commitService.getProjects();
      this.allProjectsPromise.then((projectsStr: string) => {
        const allProjects = this.sessionStorageSerializationService.deSerialize<IProject[]>(projectsStr);
        if (allProjects && allProjects.length > 0 && this.projectOptions.length === 0) {
          allProjects.forEach((project: IProject) => {
            this.projectOptions.push(new ProjectOption(project));
          });
        }
        if (!allProjects || !allProjects.length) {
          resolve();
          return;
        }
        resolve(allProjects[0]);
      });
      this.allProjectsPromise.catch(() => {
        console.error('getProjects rejected');
      });
    });
  }

  private initForm() {
    const controlsConfigObj: { [key: string]: AbstractControl } = {};

    this.timeTrackingProjectSelectionFormControl = new FormControl('');
    controlsConfigObj[this.formControlNameProjectSelectionDropDown] = this.timeTrackingProjectSelectionFormControl;

    this.timeTrackingUserSelectionForm = this.formBuilder.group(controlsConfigObj);
  }

  constructor(private projectService: ProjectService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private commitService: CommitService,
    private sessionStorageSerializationService: SessionStorageSerializationService) {
  }

  // private displayRunningTask(projectId: string, taskId: string) {
  //   // TODO: re-introduce this feature
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
  //             this.setTaskFromId(taskId);
  //             this.redrawTableOfTasks(projectId);
  //           }
  //         });
  //       });
  //     }
  //   });
  // }

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

  private initWithDefaults() {
    const outerProjectPromise = this.initProjects();
    outerProjectPromise.then((firstProject: IProject) => {
      const initTaskPromise = this.displayCurrentProjectInDropDown(firstProject.projectId);
      if (!initTaskPromise || typeof initTaskPromise.then !== 'function') {
        console.error('cannot set task');
        return;
      }
      initTaskPromise.then(() => {
        // the first task of a project should be displayed ???
        if (!this.allTasks || !this.allTasks.length) {
          console.error('cannot display first task, as there are no ones');
          return;
        }
        const firstTaskIdOfProjectId = this.allTasks[0].taskId;
        this.setTaskFromId(firstTaskIdOfProjectId);
      });
    });
  }

  private initWithUrl() {
    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe((params: Params) => {
      const projectId = params[routesConfig.projectIdProperty];
      const taskId = params[routesConfig.taskIdProperty];

      if (!projectId || !taskId) {
        console.error('no projectId _and_ taskId');
        this.initWithDefaults();
        return;
      }

      const initProjectsPromise = this.initProjects();
      initProjectsPromise.then(() => {
        const initTaskPromise = this.displayCurrentProjectInDropDown(projectId);
        if (!initTaskPromise || typeof initTaskPromise.then !== 'function') {
          console.error('cannot set task');
          return;
        }
        initTaskPromise.then(() => {
          this.setTaskFromId(taskId);
        });
      });
      initProjectsPromise.catch(() => {
        console.error('init of projects rejected');
      })
    });
  }

  ngOnInit() {
    this.initForm();
    this.initWithUrl();
  }

  ngOnDestroy(): void {
    if (this.activatedRouteSubscription) {
      this.activatedRouteSubscription.unsubscribe();
    }
    if (this.inMemoryDataServiceSubscription) {
      this.inMemoryDataServiceSubscription.unsubscribe();
    }
  }

  onTimeMeasurementStateChanged(newTimeMeasurementState: TimeMeasurement) {
    if (newTimeMeasurementState === TimeMeasurement.running) {
      this.isTasksTableVisible = false;

      // show visually as disabled ... (it is read only, btw)
      this.isUiElementDisabled = true;

      // project selection must be disabled, too
      this.timeTrackingProjectSelectionFormControl.disable();
    } else if (newTimeMeasurementState === TimeMeasurement.stopped) {
      this.isTasksTableVisible = true;

      this.isUiElementDisabled = false;
      this.timeTrackingProjectSelectionFormControl.enable();
    } else {
      console.error('unknown new state:' + newTimeMeasurementState + ' previous state was:' + this.previousTimeMeasurementState);
    }
    // necessary for debugging
    this.previousTimeMeasurementState = newTimeMeasurementState;
  }
}
