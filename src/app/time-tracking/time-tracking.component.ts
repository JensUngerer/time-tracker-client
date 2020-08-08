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

  public startStopButtonLabel = 'Start';

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
    this.setBookingDescription(task);
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


    this.startStopButtonLabel = (this.startStopButtonLabel === 'Start') ? 'Stop' : 'Start';
    if (this.startStopButtonLabel === 'Stop') {

      const startedTimeEntryPromise: Promise<string> = this.timeTrackingService.startTimeTracking(taskId, 
        currentBookingDeclarationId);
      startedTimeEntryPromise.then((rawTimeEntry: string) => {
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

      this.allProjectsPromise.finally(() => {
        if (projectId) {
          const projectOption: IProjectOption = this.projectOptions.find((oneProjectOption: IProjectOption) => {
            return oneProjectOption.value.projectId === projectId;
          });
          if (projectOption) {
            this.timeTrackingUserSelectionForm.controls[this.formControlNameProjectSelectionDropDown].setValue(projectOption.value);
          } else {
            console.error('no project option for: ' + projectId);
          }
        }
        this.allTasksPromise.finally(() => {
          if (taskId) {
            // const notCompletedTimeEntriesPromise = this.commitService.getTimeEntriesByTaskId(taskId);
            // notCompletedTimeEntriesPromise.then((theJsonString: string) => {
            //   const notCompletedTimeEntries: ITimeEntryDocument[] = this.sessionStorageSerializationService
            //     .deSerialize<ITimeEntryDocument[]>(theJsonString);

            //   this.timeEntryOptions = [];
            //   // DEBUGGING:
            //   // console.log(JSON.stringify(notCompletedTimeEntries, null, 4));
            //   if (!notCompletedTimeEntries || notCompletedTimeEntries.length === 0) {
            //     console.error('there are not "open" timeEntries');
            //     return;
            //   }
            //   notCompletedTimeEntries.forEach((oneNotCompletedTimeEntry: ITimeEntryDocument) => {
            //     this.timeEntryOptions.push(new TimeEntryOption(oneNotCompletedTimeEntry));
            //   });
            // });


            const taskOption: ITaskOption = this.taskOptions.find((oneTaskOption: ITaskOption) => {
              return oneTaskOption.value.taskId === taskId;
            });
            if (taskOption) {
              this.timeTrackingUserSelectionForm.controls[this.formControlNameTaskSelectionDropDown].setValue(taskOption.value);

              // i) get the correlated booking - declarations (which are possible for a unique projectId)
              // const bookingDeclarationsPromise = this.commitService.getBookingDeclarationsBy();
              // bookingDeclarationsPromise.then((rawBookingDeclarations: string) => {
              //   const parsedBookingDeclarations: IBookingDeclarationsDocument[] = JSON.parse(rawBookingDeclarations);


              // ii) currently displayed task:
              const currentTask = this.allTasks.find((oneTask: ITask) => {
                return oneTask.taskId === taskId;
              });

              // iii) filter by task
              // const filteredBooking = parsedBookingDeclarations.filter((oneBooking: IBookingDeclarationsDocument) => {
              //   return oneBooking.bookingDeclarationId = currentTask._bookingDeclarationId;
              // });
              // if (!filteredBooking || filteredBooking.length !== 1) {
              //   console.error('not a unique booking id found');
              //   return;
              // }
              
              // });
              this.setBookingDescription(currentTask);

            } else {
              console.error('no task option for:' + taskId);
            }


          }
        });
      });
    });
  }

  private setBookingDescription(task: ITask) {
    this.currentBookingDeclarationId = task._bookingDeclarationId;

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
  //   // // this.startStopButtonLabel = 'Stop';
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
