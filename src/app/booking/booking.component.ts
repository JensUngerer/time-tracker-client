import { Component, OnInit } from '@angular/core';
import { isEqual } from 'underscore';
import { ITimeInterval } from '../../../../common/typescript/iTimeInterval';
import { DaySelectService } from '../day-select/day-select.service';

@Component({
  selector: 'mtt-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {

  days: ITimeInterval[];

  isInvalid = false;

  constructor(private daySelectService: DaySelectService) { }

  ngOnInit(): void {
    const daysPromise = this.daySelectService.getNonCommittedDays();
    daysPromise.then((days: ITimeInterval[]) => {
      this.days = days;

      // // get the summary by day(s)
      // this.days.forEach((oneDay) => {

      // });
    });
    daysPromise.catch(() => {
      console.error('days promise rejected in booking component!');
    });

  }

  onDaySelectionChange(currentDayAsTimeInterval: ITimeInterval) {

  }

  onBookButtonClicked($event: Event) {

  }

  onInvalid(isInvalid: boolean) {
    this.isInvalid = isInvalid;
  }
}
