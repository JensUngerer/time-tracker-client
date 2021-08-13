import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Duration, DurationObject } from 'luxon';
import { Constants } from './../../../../common/typescript/constants';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ISessionTimeEntry } from './../../../../common/typescript/iSessionTimeEntry';

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
  // https://stackoverflow.com/questions/47908179/how-to-load-observable-array-property-as-angular-material-table-data-source
  // https://material.angular.io/components/table/overview
  Duration = Duration;
  Constants = Constants;
  faTrash = faTrash;

  debuggingLines: IWorkingHoursLine[] = [
    {
      timeEntryId: '',
      day: new Date(),
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

  onStartTimeChange(line: IWorkingHoursLine) {
    console.log(line);
  }
  onEndTimeChange(line: IWorkingHoursLine) {
    console.log(line);
  }
}
