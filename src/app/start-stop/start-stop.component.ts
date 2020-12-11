import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Constants } from '../../../../common/typescript/constants';
import { ITask } from '../../../../common/typescript/iTask';
import { ITimeEntry } from '../../../../common/typescript/iTimeEntry';
import { CommitService } from '../commit.service';
import { HelpersService } from '../helpers.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { TimeTrackingService } from '../time-tracking.service';
import { TimeMeasurement } from './time-measurement.enum';
import { TimeTrackingState } from './timeTrackingState.enum';

@Component({
  selector: 'mtt-start-stop',
  templateUrl: './start-stop.component.html',
  styleUrls: ['./start-stop.component.scss', './../css/space-around.scss']
})
export class StartStopComponent implements OnInit, AfterViewInit, OnChanges {
  private durationVisualizationIntervalId: any = null;
  private timeEntryId: string;

  isStartStopButtonDisabled = true;

  // internal state
  startStopButtonLabel = TimeTrackingState.start;

  currentTimeEntryDuration: string;

  TimeTrackingState = TimeTrackingState;

  @Input()
  task: ITask;

  // mapping from internal state to this external state
  @Output()
  state: EventEmitter<TimeMeasurement> = new EventEmitter<TimeMeasurement>();

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
    const resolvedTimeEntry: ITimeEntry = this.sessionStorageSerializationService.deSerialize<ITimeEntry>(rawTimeEntry);
    // visualize current duration
    this.currentTimeEntryDuration = this.helpersService.getDurationStr(0, 0, 0);
    this.durationVisualizationIntervalId = setInterval(() => {
      this.visualizeTimeEntry(resolvedTimeEntry.timeEntryId);
    }, Constants.MILLISECONDS_IN_SECOND);

    this.timeEntryId = resolvedTimeEntry.timeEntryId;
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

  private setStateToStopped() {
    // set state to stopped
    if (this.durationVisualizationIntervalId) {
      clearInterval(this.durationVisualizationIntervalId);
    }

    this.isStartStopButtonDisabled = false;

    this.visualizeTimeEntry(this.timeEntryId);
  }

  private emitStateStopped() {
    // state changed visualized stated from stop to start
    // -> i.e. the stop button has just been pressed --> i.e. time-measurement should be changed to "stopped"
    // as late as possible!
    this.state.emit(TimeMeasurement.stopped);
  }

  private emitStateRunning() {
      // state changed visualized stated from start to stop
      // -> i.e. the start button has just been pressed --> i.e. time-measurement is "running"
      // as early as possible!
      this.state.emit(TimeMeasurement.running);
  }

  public onStartStopButtonClicked() {
    // always disable as a http-request 'needs some time'
    this.isStartStopButtonDisabled = true;

    if (!this.task) {
      console.error('there is no task selected');
      return;
    }
    const taskId = this.task.taskId;
    const currentBookingDeclarationId = this.task._bookingDeclarationId;

    // internal state changed !
    this.startStopButtonLabel = (this.startStopButtonLabel === TimeTrackingState.start) ? TimeTrackingState.stop : TimeTrackingState.start;

    if (this.startStopButtonLabel === TimeTrackingState.stop) {
      this.emitStateRunning();

      const startedTimeEntryPromise: Promise<string> = this.timeTrackingService.startTimeTracking(taskId,
        currentBookingDeclarationId);
      startedTimeEntryPromise.then((rawTimeEntry: string) => {
        this.visualizeStartedTimeEntry(rawTimeEntry);
      });
      startedTimeEntryPromise.catch(() => {
        console.error('startTimeTracking rejected');

        this.isStartStopButtonDisabled = false;
      });

    } else if (this.startStopButtonLabel === TimeTrackingState.start) {
      const stopTimeTrackingPromise = this.timeTrackingService.stopTimeTracking(this.timeEntryId);
      stopTimeTrackingPromise.then(() => {
        this.setStateToStopped();

        this.emitStateStopped();
      });
      stopTimeTrackingPromise.catch(() => {
        console.error('stopTimeTracking rejected');

        this.setStateToStopped();

        this.emitStateStopped();
      });
    }
  }
}
