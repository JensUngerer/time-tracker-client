import { Component, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
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

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'mtt-time-tracking',
  templateUrl: './time-tracking.component.html',
  styleUrls: ['./time-tracking.component.scss', './../css/centerVerticalHorizontal.scss']
})
export class TimeTrackingComponent implements OnInit, OnDestroy {
  private activatedRouteSubscription: Subscription = null;

  private inMemoryDataServiceSubscription: Subscription = null;

  private allProjectsPromise: Promise<string> = null;

  private allTasksPromise: Promise<string> = null;

  private durationVisualizationIntervalId: any = null;

  private allTasks: ITask[];

  private timeEntryId: string;

  // https://stackoverflow.com/questions/31548311/angular-html-binding
  @Output()
  public currentTimeEntryDuration: string;

  public timeTrackingUserSelectionForm: FormGroup = null;

  public formControlNameUserSelectionDropDown = 'userSelectionDropDown';

  public timeTrackingUserSelectionFormControl: AbstractControl = null;

  public startStopButtonLabel = TimeTrackingState.start;

  public isStartStopButtonDisabled = false;

  public pauseResumeButtonLabel = 'Pause';

  public isPauseResumeButtonDisabled = true;

  public formControlNameProjectSelectionDropDown = 'projectSelectionDropDown';

  public timeTrackingProjectSelectionFormControl: FormControl = null;

  public projectOptions: IProjectOption[] = [];

  public formControlNameTaskSelectionDropDown = 'taskSelectionDropDown';

  public timeTrackingTaskSelectionFromControl: FormControl = null;

  public taskOptions: ITaskOption[] = [];

  public timeEntryOptions: ITimeEntryOption[] = [];

  public formControlNameTimeEntrySelectionDropDown = 'timeEntrySelectionDropDown';

  public timeTrackingTimeEntrySelectionFromControl: AbstractControl = null;

  public bookingDeclarationDescription = '';

  private currentBookingDeclarationId;

  public onTaskChange() {
    const task = this.timeTrackingUserSelectionForm
    .controls[this.formControlNameTaskSelectionDropDown]
    .value;
    this.setBookingDescription(task._bookingDeclarationId);
  }

  private visualizeStartedTimeEntry(rawTimeEntry: string) {
    const resolvedValue: ITimeEntry = this.sessionStorageSerializationService.deSerialize<ITimeEntry>(rawTimeEntry);
    // visualize current duration
    const oneSecondInMilliseconds = 1000.0;
    this.currentTimeEntryDuration = this.helpersService.getDurationStr(0, 0, 0);
    this.durationVisualizationIntervalId = setInterval(() => {
      this.visualizeTimeEntry(resolvedValue.timeEntryId);
    }, oneSecondInMilliseconds);

    // this.setTimeEntryId(resolvedValue.timeEntryId);
    this.timeEntryId = resolvedValue.timeEntryId;
    this.isStartStopButtonDisabled = false;
    this.isPauseResumeButtonDisabled = false;
  }

  public onStartStopButtonClicked() {
    // always disable as a http-request 'needs some time'
    this.isStartStopButtonDisabled = true;
    this.isPauseResumeButtonDisabled = true;
    const task = this.timeTrackingTaskSelectionFromControl.value;
    if (!task) {
      console.error('there is no task selected');
      return;
    }
    const taskId = task.taskId;
    const currentBookingDeclarationId = task._bookingDeclarationId;

    this.startStopButtonLabel = (this.startStopButtonLabel === TimeTrackingState.start) ? TimeTrackingState.stop : TimeTrackingState.start;
    if (this.startStopButtonLabel === TimeTrackingState.stop) {

      const startedTimeEntryPromise: Promise<string> = this.timeTrackingService.startTimeTracking(taskId, 
        currentBookingDeclarationId);
      startedTimeEntryPromise.then((rawTimeEntry: string) => {
        this.visualizeStartedTimeEntry(rawTimeEntry);
      });
      startedTimeEntryPromise.catch(() => {
        console.error('startTimeTracking rejected');

        this.isStartStopButtonDisabled = false;
        this.isPauseResumeButtonDisabled = false;
      });

    } else {
      const stopTimeTrackingPromise = this.timeTrackingService.stopTimeTracking(this.timeEntryId);
      stopTimeTrackingPromise.then(() => {
        if (this.durationVisualizationIntervalId) {
          clearInterval(this.durationVisualizationIntervalId);
        }

        this.isStartStopButtonDisabled = false;
        this.isPauseResumeButtonDisabled = true;

        this.visualizeTimeEntry(this.timeEntryId);
      });
      stopTimeTrackingPromise.catch(() => {
        console.error('stopTimeTracking rejected');

        this.isStartStopButtonDisabled = false;
        this.isPauseResumeButtonDisabled = true;

        this.visualizeTimeEntry(this.timeEntryId);
      });
    }
  }

  private displayCurrentProjectInDropDown(projectId: string) {
    const projectOption: IProjectOption = this.projectOptions.find((oneProjectOption: IProjectOption) => {
      return oneProjectOption.value.projectId === projectId;
    });
    if (projectOption) {
      this.timeTrackingUserSelectionForm.controls[this.formControlNameProjectSelectionDropDown].setValue(projectOption.value);
    } else {
      console.error('no project option for: ' + projectId);
    }
  }

  constructor(private helpersService: HelpersService,
    private timeTrackingService: TimeTrackingService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private commitService: CommitService,
    private sessionStorageSerializationService: SessionStorageSerializationService) {
    const controlsConfigObj: { [key: string]: AbstractControl } = {};

    this.timeTrackingProjectSelectionFormControl = new FormControl('');
    controlsConfigObj[this.formControlNameProjectSelectionDropDown] = this.timeTrackingProjectSelectionFormControl;

    this.timeTrackingTaskSelectionFromControl = new FormControl('');
    controlsConfigObj[this.formControlNameTaskSelectionDropDown] = this.timeTrackingTaskSelectionFromControl;

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

    // init taskSelectionDropDrown data
    this.allTasksPromise = this.commitService.getTasks();
    this.allTasksPromise.then((allTasksStr: string) => {
      this.allTasks = sessionStorageSerializationService.deSerialize<ITask[]>(allTasksStr);
      if (this.allTasks && this.allTasks.length > 0 && this.taskOptions.length === 0) {
        this.allTasks.forEach((task: ITask) => {
          this.taskOptions.push(new TaskOption(task));
        });
      }
    });
    this.allTasksPromise.catch(() => {
      console.error('get tasks rejected');
    });

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe((params: Params) => {
      const projectId = params[routesConfig.projectIdProperty];
      const taskId = params[routesConfig.taskIdProperty];

      const isTimeEntryRunningPromise = this.displayRunningTimeEntry();
      isTimeEntryRunningPromise.then((resolvedTimeEntryValues: ITimeEntryDocument) => {
        if (!resolvedTimeEntryValues) {
            // there are not running timeEntries --> continue as before
            this.allProjectsPromise.finally(() => {
              if (projectId) {
                this.displayCurrentProjectInDropDown(projectId);
              }
              this.allTasksPromise.finally(() => {
                if (taskId) {
                  this.setTask(taskId);
                }
              });
            });
        }
      });


    });
  }

  private setTask(taskId: string) {
    const taskOption: ITaskOption = this.taskOptions.find((oneTaskOption: ITaskOption) => {
      return oneTaskOption.value.taskId === taskId;
    });
    if (taskOption) {
      this.timeTrackingUserSelectionForm.controls[this.formControlNameTaskSelectionDropDown].setValue(taskOption.value);

      const currentTask = this.allTasks.find((oneTask: ITask) => {
        return oneTask.taskId === taskId;
      });

      this.setBookingDescription(currentTask._bookingDeclarationId);
    } else {
      console.error('no task option for:' + taskId);
    }
  }

  private insertProjectIfNotContained(project: IProjectsDocument) {
    if (!project) {
      return;
    }
    if (!this.projectOptions) {
      this.projectOptions = [];
    }
    const indexInOptions = this.projectOptions.findIndex((oneProjectOption: IProjectOption) => {
      return oneProjectOption.value.projectId === project.projectId;
    });
    if (indexInOptions === -1) {
      this.projectOptions.push(new ProjectOption(project));
    }
  }

  private insertTaskIfNotContained(taskId: string) {
    return new Promise<any>((resolve: (value?:any) => void) => {
      if (!this.taskOptions) {
        this.taskOptions = [];
      }
      const indexInTaskOptions = this.taskOptions.findIndex((oneTaskOption: TaskOption) => {
        return oneTaskOption.value.taskId === taskId;
      });
      if (indexInTaskOptions === -1) {
        const getTaskPromise = this.commitService.getTaskById(taskId);
        getTaskPromise.then((rawTask: string) => {
          const task: ITask = this.sessionStorageSerializationService.deSerialize(rawTask);
          this.taskOptions.push(new TaskOption(task));
          resolve(true);
        });
        getTaskPromise.catch(() => {
          console.error('error when catching task');
          resolve(null);
        });
      } else {
        resolve(false);
      }
    });
  }

  private displayRunningTimeEntry(): Promise<ITimeEntryDocument> {
    return new Promise<ITimeEntryDocument>((resolve: (value?: ITimeEntryDocument) => void) => {
      const getRunningPromise = this.commitService.getRunningTimeEntry();
        getRunningPromise.then((runningTimeEntry: string)=>{
          const runningTimeEntryParsed: ITimeEntryDocument = this.sessionStorageSerializationService.deSerialize(runningTimeEntry);
          if (runningTimeEntryParsed) {
            resolve(runningTimeEntryParsed);

            const timeEntryId = runningTimeEntryParsed.timeEntryId;
            const projectPromise = this.commitService.getProjectByTaskId(runningTimeEntryParsed._taskId);
            projectPromise.then((rawProject: string) => {
              if (!rawProject) {
                console.error('no project found');
                return;
              }
              // a) project
              const project: IProjectsDocument = this.sessionStorageSerializationService.deSerialize(rawProject);
              this.insertProjectIfNotContained(project);
              this.displayCurrentProjectInDropDown(project.projectId)
          
              // b) booking-declaration
              this.setBookingDescription(runningTimeEntryParsed._bookingDeclarationId);


              // c) task
              const taskId = runningTimeEntryParsed._taskId;
              const insertTaskPromise = this.insertTaskIfNotContained(taskId);
              
              insertTaskPromise.then(()=> {
                this.setTask(taskId);

                // start visualization
                this.startStopButtonLabel = TimeTrackingState.stop;
                const timeEntryPromise = this.commitService.getTimeEntryById(timeEntryId);
                timeEntryPromise.then((rawTimeEntry: string) => {
                  this.visualizeStartedTimeEntry(rawTimeEntry);
                });
                timeEntryPromise.catch(()=>{
                  console.error('timeEntry rejected');
                });
              });
              insertTaskPromise.catch(() => {
                console.error('error when inserting missing task');
              });
            });

          } else  {
            resolve(null);
          }
        });
        
    });
  }

  private setBookingDescription(bookingDeclarationId: string) {
    this.currentBookingDeclarationId = bookingDeclarationId;

    const bookingDocumentPromise = this.commitService.getBookingDeclarationById(this.currentBookingDeclarationId);
    bookingDocumentPromise.then((receivedBookingRaw: string) => {
      const parsedDocuments: IBookingDeclarationsDocument[]
      = this.sessionStorageSerializationService.deSerialize(receivedBookingRaw);

      this.bookingDeclarationDescription = parsedDocuments[0].description;
    });
  }

  private visualizeTimeEntry(timeEntryId: string) {
    if (!timeEntryId) {
      this.currentTimeEntryDuration = this.helpersService.getDurationStr(0, 0, 0);
      return;
    }

    const durationPromise = this.commitService.getDuration(timeEntryId);
    durationPromise.then((durationStr: string) => {
      const parsedDuration = this.sessionStorageSerializationService.deSerialize<string>(durationStr);
      if (!parsedDuration) {
        this.currentTimeEntryDuration = this.helpersService.getDurationStr(0, 0, 0);
      } else {
        this.currentTimeEntryDuration = parsedDuration;
      }
    });
    durationPromise.catch((err: any) => {
      console.error('getDuration rejected with');
      console.error(err);
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
    this.visualizeTimeEntry(null);
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
