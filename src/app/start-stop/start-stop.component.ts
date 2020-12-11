import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ITask } from '../../../../common/typescript/iTask';
import { ITimeEntry } from '../../../../common/typescript/iTimeEntry';
import { CommitService } from '../commit.service';
import { HelpersService } from '../helpers.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { TimeTrackingService } from '../time-tracking.service';
import { TimeTrackingState } from '../time-tracking/timeTrackingState.enum';

@Component({
  selector: 'mtt-start-stop',
  templateUrl: './start-stop.component.html',
  styleUrls: ['./start-stop.component.scss']
})
export class StartStopComponent implements OnInit, AfterViewInit, OnChanges {
  private durationVisualizationIntervalId: any = null;
  private timeEntryId: string;

  isStartStopButtonDisabled = true;

  startStopButtonLabel = TimeTrackingState.start;

  currentTimeEntryDuration: string;

  @Input()
  task: ITask;

  constructor(
    private sessionStorageSerializationService: SessionStorageSerializationService,
    private helpersService: HelpersService,
    private commitService: CommitService,
    private timeTrackingService: TimeTrackingService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes &&
      changes.task &&
      changes.task.currentValue) {
      this.isStartStopButtonDisabled = false;
      return;
    }
    if (changes &&
      (!changes.task ||
      !changes.task.currentValue)) {
      this.isStartStopButtonDisabled = true;
      return;
    }
  }

  ngAfterViewInit(): void {
    if (this.task) {
      this.isStartStopButtonDisabled = false;
      return;
    }
    this.isStartStopButtonDisabled = true;
  }

  ngOnInit(): void {
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

  public onStartStopButtonClicked() {
    // always disable as a http-request 'needs some time'
    this.isStartStopButtonDisabled = true;

    // TODO: how to handle tasks?
    // const taskOption = this.taskOptions.find((oneTask: ITaskOption) => {
    //   return oneTask.value.taskId === this.currentTaskId;
    // });
    // if (!taskOption) {
    //   console.error('no task option for currentTaskId:' + this.currentTaskId);
    //   return;
    // }
    // const task = taskOption.value;
    if (!this.task) {
      console.error('there is no task selected');
      return;
    }
    // this.currentTask = this.gridLines.find((singleGridLine: IGridLine) => {
    //   return singleGridLine.id === task.taskId;
    // });
    const taskId = this.task.taskId;

    // TODO: how to handle booking declarations?
    const currentBookingDeclarationId = this.task._bookingDeclarationId;

    this.startStopButtonLabel = (this.startStopButtonLabel === TimeTrackingState.start) ? TimeTrackingState.stop : TimeTrackingState.start;
    if (this.startStopButtonLabel === TimeTrackingState.stop) {
      // TODO: how to handle this ???
      // this.isTasksTableVisible = false;

      // this.isUiElementDisabled = true;
      // this.timeTrackingProjectSelectionFormControl.disable();

      const startedTimeEntryPromise: Promise<string> = this.timeTrackingService.startTimeTracking(taskId,
        currentBookingDeclarationId);
      startedTimeEntryPromise.then((rawTimeEntry: string) => {
        this.visualizeStartedTimeEntry(rawTimeEntry);
      });
      startedTimeEntryPromise.catch(() => {
        console.error('startTimeTracking rejected');

        this.isStartStopButtonDisabled = false;
      });

    } else {
      // TODO: how to handle this?
      // this.isTasksTableVisible = true;

      // this.isUiElementDisabled = false;
      // this.timeTrackingProjectSelectionFormControl.enable();

      const stopTimeTrackingPromise = this.timeTrackingService.stopTimeTracking(this.timeEntryId);
      stopTimeTrackingPromise.then(() => {
        if (this.durationVisualizationIntervalId) {
          clearInterval(this.durationVisualizationIntervalId);
        }

        this.isStartStopButtonDisabled = false;

        this.visualizeTimeEntry(this.timeEntryId);
      });
      stopTimeTrackingPromise.catch(() => {
        console.error('stopTimeTracking rejected');

        this.isStartStopButtonDisabled = false;

        this.visualizeTimeEntry(this.timeEntryId);
      });
    }
  }
}
