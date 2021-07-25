import { Component, Input, OnInit } from '@angular/core';
import { CommitService } from '../commit.service';
import { HelpersService } from '../helpers.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { SessionTimeVisualizationComponent } from '../session-time-visualization/session-time-visualization.component';

@Component({
  selector: 'mtt-working-time-visualization',
  templateUrl: './../session-time-visualization/session-time-visualization.component.html',
  styleUrls: ['./../session-time-visualization/session-time-visualization.component.scss']
})
export class WorkingTimeVisualizationComponent extends SessionTimeVisualizationComponent implements OnInit {

  constructor(helperService: HelpersService,
    commitService: CommitService,
    sessionStorageSerializationService: SessionStorageSerializationService) {
    super(helperService, commitService, sessionStorageSerializationService);
  }

  ngOnInit(): void {
  }

  protected getDurationStrPromise() {
    return this.commitService.getWorkingTimeDurationStr();
  }
}
