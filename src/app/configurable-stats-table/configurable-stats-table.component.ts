import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { IStatistic } from '../../../../common/typescript/iStatistic';
import { ISummarizedTasks, ITaskLine } from '../../../../common/typescript/summarizedData';
import { Constants } from './../../../../common/typescript/constants';

@Component({
  selector: 'mtt-configurable-stats-table',
  templateUrl: './configurable-stats-table.component.html',
  styleUrls: ['./configurable-stats-table.component.scss']
})
export class ConfigurableStatsTableComponent implements OnInit, OnChanges {
  classInstance = Constants;

  @Input()
  summarizedTasks: ISummarizedTasks = null;

  @Input()
  lines: IStatistic[];

  // @Input()
  readonly displayedColumns: string[] = ['identifier', 'description', 'durationInHours', 'durationFraction'];

  // @Input()
  dataSource: MatTableDataSource<IStatistic> = null;

  constructor() { }

  ngOnInit(): void {
  }

  private createDataSourceFromLines() {
    this.dataSource = new MatTableDataSource(this.lines);
  }

  ngAfterViewInit(): void {
    this.createDataSourceFromLines();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes &&
      changes.lines &&
      changes.lines.currentValue &&
      changes.lines.currentValue.length) {
      this.createDataSourceFromLines();
    }
  }
}
