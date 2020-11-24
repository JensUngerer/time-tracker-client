import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ColorsGenerator } from '../../../../common/typescript/helpers/colorsGenerator';
import { ITimeInterval } from '../../../../common/typescript/iTimeInterval';
import { CommitService } from '../commit.service';
import { ConfigurationService } from '../configuration.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { IContextLine } from './../../../../common/typescript/iContextLine';

@Component({
  selector: 'mtt-context',
  templateUrl: './context.component.html',
  styleUrls: ['./context.component.scss']
})
export class ContextComponent implements OnInit {
  public static formatDate = 'yyy-MM-dd HH:mm:ss.SSS';

  private currentTimeInterval: ITimeInterval;

  isQuerySelectionVisible = true;
  isTableVisible = false;

  backgroundColorMap: { [taskId: string]: string } = {};
  colorMap: { [taskId: string]: string } = {};
  contextLines: any[] = [];

  constructor(private configurationService: ConfigurationService,
              private commitService: CommitService,
              private sessionStorageSerializationService: SessionStorageSerializationService) { }

  ngOnInit(): void { }

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
      const contextLines: IContextLine[] = this.sessionStorageSerializationService.deSerialize(rawTimeEntries);

      contextLines.forEach(oneContextLine => {
        if (!this.backgroundColorMap[oneContextLine.taskId]) {

          const generatedColors = ColorsGenerator.generateHexColor();

          this.backgroundColorMap[oneContextLine.taskId] = generatedColors.color;
          this.colorMap[oneContextLine.taskId] = generatedColors.inverseColor;
        }

        oneContextLine.taskNumberUrl = this.configurationService.configuration.taskBasedIdentifierBaseUrl + '/' + oneContextLine.taskNumber;
      });
      this.contextLines = contextLines;

      // DEBUGGING:
      // console.log(this.contextLines);

      this.isTableVisible = true;
      this.dataSource = new MatTableDataSource(this.contextLines);

    });
  }

  dataSource: MatTableDataSource<IContextLine>;

  readonly displayedColumns: string[] = ['startTime', 'duration', 'taskNumber', 'taskName'];

  classInstance = ContextComponent;
}
