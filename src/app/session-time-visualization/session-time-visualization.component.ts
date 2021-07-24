import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Constants } from '../../../../common/typescript/constants';
import { CommitService } from '../commit.service';
import { HelpersService } from '../helpers.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { TimeTrackingState } from '../start-stop/timeTrackingState.enum';

@Component({
  selector: 'mtt-session-time-visualization',
  templateUrl: './session-time-visualization.component.html',
  styleUrls: ['./session-time-visualization.component.scss']
})
export class SessionTimeVisualizationComponent implements OnDestroy {

  private internalIsLoggedIn = false;

  currentDuration = this.helperService.getDurationStr(0, 0, 0);
  durationVisualizationIntervalId: any;

  @Input()
  set isLoggedIn(isLoggedInValue: boolean) {
    this.internalIsLoggedIn = isLoggedInValue;
    this.logInStatusChanged(isLoggedInValue);
  }
  get isLoggedIn() {
    return this.internalIsLoggedIn;
  }

  get timeTrackingState() {
    if (this.isLoggedIn) {
      return TimeTrackingState.stop;
    } else {
      return TimeTrackingState.start;
    }
  }

  constructor(private helperService: HelpersService,
    private commitService: CommitService,
    private sessionStorageSerializationService: SessionStorageSerializationService) { }
  
  ngOnDestroy(): void {
    this.stopVisualization();
  }

  private stopVisualization() {
    // just logged out -> stop visualization
    if (this.durationVisualizationIntervalId) {
      clearInterval(this.durationVisualizationIntervalId);
    }
  }

  private logInStatusChanged(isLoggedInValue: boolean) {
    if (isLoggedInValue) {
      // just logged in -> start visualization
      this.durationVisualizationIntervalId = setInterval(() => {
        this.visualizeTimeEntry();
      }, Constants.MILLISECONDS_IN_MINUTE);
    } else {
      this.stopVisualization();
    }
  }

  private visualizeTimeEntry() {
    const durationPromise = this.commitService.getSessionDuration();
    durationPromise.then((duration: string) => {
      const parsedDuration = this.sessionStorageSerializationService.deSerialize<string>(duration);
      if (!parsedDuration)  {
        this.currentDuration = this.helperService.getDurationStr(0, 0, 0);
      } else {
        this.currentDuration = parsedDuration;
      }
    });
    durationPromise.catch((err) => {
      console.error('getSessionDuration rejected with');
      console.error(err);
    });
  }
}
