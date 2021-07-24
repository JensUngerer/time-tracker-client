import { Component, Input, OnInit } from '@angular/core';
import { HelpersService } from '../helpers.service';
import { TimeTrackingState } from '../start-stop/timeTrackingState.enum';

@Component({
  selector: 'mtt-time-visualization',
  templateUrl: './time-visualization.component.html',
  styleUrls: ['./time-visualization.component.scss']
})
export class TimeVisualizationComponent implements OnInit {
  @Input()
  timeTrackingState: TimeTrackingState = TimeTrackingState.stop;

  @Input()
  currentDuration: string = this.helpersService.getDurationStr(0, 0, 0);

  TimeTrackingState = TimeTrackingState;

  constructor(private helpersService: HelpersService) { }

  ngOnInit(): void {
  }

}
