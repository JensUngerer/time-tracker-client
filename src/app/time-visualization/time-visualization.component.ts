import { Component, Input, OnInit } from '@angular/core';
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
  currentDuration: string = '00:00:00';

  TimeTrackingState = TimeTrackingState;

  constructor() { }

  ngOnInit(): void {
  }

}
