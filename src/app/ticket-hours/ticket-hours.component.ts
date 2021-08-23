import { Component, OnInit } from '@angular/core';
import { ITimeInterval } from '../../../../common/typescript/iTimeInterval';

@Component({
  selector: 'mtt-ticket-hours',
  templateUrl: './ticket-hours.component.html',
  styleUrls: ['./ticket-hours.component.scss']
})
export class TicketHoursComponent implements OnInit {
  private currentDate = new Date();

  currentInterval: ITimeInterval = {
    utcStartTime: this.currentDate,
    utcEndTime: this.currentDate
  };

  constructor() { }

  ngOnInit(): void {
  }

  onTimeBoundaries(interval: ITimeInterval) {
    this.currentInterval = interval;
  }
}
