import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DateTime, Duration, DurationObject } from 'luxon';
import { Constants } from './../../../../common/typescript/constants';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ISessionTimeEntry } from './../../../../common/typescript/iSessionTimeEntry';
import { DurationCalculator } from '../../../../common/typescript/helpers/durationCalculator';

// TEMPORARY !!!
export interface IWorkingHoursLine extends ISessionTimeEntry {
  // sessionTimeEntryId: string;
  // day: Date;
  // startTime: Date;
  // duration: DurationObject;
  // endTime: Date,
  deleteButton: string;
}

@Component({
  selector: 'mtt-working-hours',
  templateUrl: './working-hours.component.html',
  styleUrls: ['./working-hours.component.scss']
})
export class WorkingHoursComponent implements OnInit {
  static requiredTimeFormat = 'HH:mm';

  WorkingHoursComponent = WorkingHoursComponent;
  // https://stackoverflow.com/questions/47908179/how-to-load-observable-array-property-as-angular-material-table-data-source
  // https://material.angular.io/components/table/overview
  // Duration = Duration;
  // DateTime = DateTime;
  // Constants = Constants;
  faTrash = faTrash;

  debuggingLines: IWorkingHoursLine[] = [
    {
      timeEntryId: '',
      day: DurationCalculator.getDayFrom(new Date()),
      startTime: new Date(),
      durationInMilliseconds: {},
      endTime: new Date(),
      deleteButton: ''
    }
  ];
  displayedColumns = ['day', 'startTime', 'durationInMilliseconds', 'endTime', 'deleteButton'];
  workingHoursDataSource: MatTableDataSource<IWorkingHoursLine> = new MatTableDataSource(this.debuggingLines);
  constructor() { }

  ngOnInit(): void {
  }

  getDayStr(element: IWorkingHoursLine) {
    return DateTime.fromJSDate(element.day).toFormat(Constants.contextIsoFormat);
  }

  getDurationStr(element: IWorkingHoursLine) {
    return Duration.fromObject(element.durationInMilliseconds).toFormat(Constants.contextDurationFormat);
  }

  private timeToDateObject(day: Date, time: string): Date {
    let dateTime = DateTime.fromJSDate(day);
    const split = time.split(':');
    if (split.length < 2) {
      return new Date();
    }
    const hoursStr = split[0];
    const minutesStr = split[1];
    const hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);
    dateTime = dateTime.plus({hours, minutes});

    return dateTime.toJSDate();
  }

  onStartTimeChange($event: string, line: IWorkingHoursLine) {
    console.log($event + '-->' + this.timeToDateObject(line.day, $event));
  }
  onEndTimeChange($event: string, line: IWorkingHoursLine) {
    console.log($event + '-->' + this.timeToDateObject(line.day, $event));
  }
}
