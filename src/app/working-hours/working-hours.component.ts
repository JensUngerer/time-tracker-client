import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DateTime, Duration, DurationObject } from 'luxon';
import { Constants } from './../../../../common/typescript/constants';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ISessionTimeEntry } from './../../../../common/typescript/iSessionTimeEntry';
import { DurationCalculator } from '../../../../common/typescript/helpers/durationCalculator';
import { QueryDateComponent } from '../query-date/query-date.component';

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

  requiredTimeFormat = WorkingHoursComponent.requiredTimeFormat;
  requiredDateFormat = QueryDateComponent.requiredDateFormat;

  // WorkingHoursComponent = WorkingHoursComponent;
  // QueryDateComponent = QueryDateComponent;
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
  constructor(@Inject(LOCALE_ID) public currentLocale) { }

  ngOnInit(): void {
  }

  // getDayStr(element: IWorkingHoursLine) {

  //   // return DateTime.fromJSDate(element.day).toFormat(Constants.contextIsoFormat);
  // }

  getDurationStr(element: IWorkingHoursLine) {
    return Duration.fromObject(element.durationInMilliseconds).toFormat(Constants.contextDurationFormat);
  }

  private timeToDateObject(day: Date, time: string): Date {
    let dateTime = DateTime.fromJSDate(day);
    console.log(this.currentLocale);
    dateTime = dateTime.setLocale(this.currentLocale).toLocal();
    // dateTime = dateTime.toLocal();
    // const newDate = new Date();
    // newDate.setMinutes(day.getMinutes() - day.getTimezoneOffset())
    const split = time.split(':');
    if (split.length < 2) {
      return new Date();
    }
    const hoursStr = split[0];
    const minutesStr = split[1];
    const hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);
    // newDate.setHours(newDate.getHours() + hours);
    // newDate.setMinutes(newDate.getMinutes() + minutes);
    dateTime = dateTime.plus({hours, minutes});

    // // dateTime = dateTime.toUTC();

    return dateTime.toJSDate();
    // return newDate;
  }

  onStartTimeChange($event: string, line: IWorkingHoursLine) {
    console.log($event + '-->' + this.timeToDateObject(line.day, $event));
  }
  onEndTimeChange($event: string, line: IWorkingHoursLine) {
    console.log($event + '-->' + this.timeToDateObject(line.day, $event));
  }
}
