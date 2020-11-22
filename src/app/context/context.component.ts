import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ColorsGenerator } from '../../../../common/typescript/helpers/colorsGenerator';
import { ITimeInterval } from '../../../../common/typescript/iTimeInterval';
import { ITimeEntryDocument } from '../../../../common/typescript/mongoDB/iTimeEntryDocument';
import { CommitService } from '../commit.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';

export interface IContextLine {
  startTime: Date;
  taskId: string;
  duration: string;
}

@Component({
  selector: 'mtt-context',
  templateUrl: './context.component.html',
  styleUrls: ['./context.component.scss']
})
export class ContextComponent implements OnInit {
  private currentTimeInterval: ITimeInterval;

  isQuerySelectionVisible = true;
  isTableVisible = false;

  backgroundColorMap: {[taskId:string]: string} = {};
  colorMap: {[taskId:string]: string} = {};
  contextLines: any[] = [];

  constructor(@Inject(LOCALE_ID) private currentLocale,
    private commitService: CommitService,
    private sessionStorageSerializationService: SessionStorageSerializationService) { }

  private ensureTwoDigits(aValue: number) {
    const convertedValue = aValue.toString();
    if (convertedValue.length === 2) {
      return convertedValue;
    }
    return '0' + convertedValue;
  }

  private ensureThreeDigits(aValue: number) {
    const convertedValue = aValue.toString();
    if (convertedValue.length === 3) {
      return convertedValue;
    }
    if (convertedValue.length === 2) {
      return '0' + convertedValue;
    }
    if (convertedValue.length === 1) {
      return '00' + convertedValue;
    }
  }

  private convertToDuration(durationInMilliseconds: number) {
    const MILLISECONDS_IN_SECOND = 1000;
    const SECONDS_IN_MINUTE = 60;
    const MINUTES_IN_HOUR = 60;
    const HOURS_IN_DAY = 24;
    let timeBuffer = durationInMilliseconds;
    const milliseconds = timeBuffer % MILLISECONDS_IN_SECOND;
    timeBuffer = Math.floor(timeBuffer / MILLISECONDS_IN_SECOND);
    const seconds = timeBuffer % SECONDS_IN_MINUTE;
    timeBuffer = Math.floor(timeBuffer / SECONDS_IN_MINUTE);
    const minutes = timeBuffer % MINUTES_IN_HOUR;
    timeBuffer = Math.floor(timeBuffer / MINUTES_IN_HOUR);
    const hours = timeBuffer % HOURS_IN_DAY;
    timeBuffer = timeBuffer / HOURS_IN_DAY;

    const twoDigitsHours = this.ensureTwoDigits(hours);
    const twoDigitsMinutes = this.ensureTwoDigits(minutes);
    const twoDigitsSeconds = this.ensureTwoDigits(seconds);
    const threeDigitsMilliseconds = this.ensureThreeDigits(milliseconds);
    return twoDigitsHours + ':' + twoDigitsMinutes + ':' + twoDigitsSeconds + '.' + threeDigitsMilliseconds;

    // return formatDate(durationInMilliseconds, ContextComponent.formatDate, this.currentLocale);
  }

  createContextLinesFrom(parsedTimeEntriesOfInterval: ITimeEntryDocument[]) {
    let contextLines: IContextLine[] = [];
    parsedTimeEntriesOfInterval.forEach((oneParseTimeEntry: ITimeEntryDocument) => {
      const duration = this.convertToDuration(oneParseTimeEntry.durationInMilliseconds);
      contextLines.push(
        {
          startTime: oneParseTimeEntry.startTime,
          taskId: oneParseTimeEntry._taskId,
          duration: duration
        }
      );
    });
    contextLines.forEach(oneContextLine => {
      if(!this.backgroundColorMap[oneContextLine.taskId])  {
        const generatedColors = ColorsGenerator.generateHexColor();
        this.backgroundColorMap[oneContextLine.taskId] = generatedColors.color;
        // console.log(this.backgroundColorMap[oneContextLine.taskId]);
        this.colorMap[oneContextLine.taskId] = generatedColors.inverseColor;
      }
    });
    return contextLines;
  }

  ngOnInit(): void {  }

  onQueryTimeBoundaries($event: ITimeInterval) {
    this.currentTimeInterval = $event;

    if (!this.currentTimeInterval) {
      return;
    }
    const timeEntriesIntervalPromise = this.commitService.getTimeEntriesInInterval(this.currentTimeInterval);
    timeEntriesIntervalPromise.then((rawTimeEntries: string) => {
      this.isQuerySelectionVisible = false;

      // DEBUGGING:
      // console.log(rawTimeEntries);
      const parsedTimeEntriesOfInterval: ITimeEntryDocument[] = this.sessionStorageSerializationService.deSerialize(rawTimeEntries);

      this.contextLines = this.createContextLinesFrom(parsedTimeEntriesOfInterval);
      // DEBUGGING:
      console.log(this.contextLines);

      this.isTableVisible = true;
      this.dataSource = new MatTableDataSource(this.contextLines);

    });
  }

  public static formatDate = 'yyy-MM-dd';

  dataSource: MatTableDataSource<IContextLine>;

  readonly displayedColumns: string[] = ['startTime', 'duration', 'taskId'];

  classInstance = ContextComponent;
}
