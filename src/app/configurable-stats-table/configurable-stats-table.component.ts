import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ISummarizedTasks, ITaskLine } from '../../../../common/typescript/summarizedData';

@Component({
  selector: 'mtt-configurable-stats-table',
  templateUrl: './configurable-stats-table.component.html',
  styleUrls: ['./configurable-stats-table.component.scss']
})
export class ConfigurableStatsTableComponent implements OnInit {
  static formatPercent = '2.0-0';
  static formatNumber = '1.2-2';

  classInstance = ConfigurableStatsTableComponent;

  @Input()
  summarizedTasks: ISummarizedTasks = null;

  @Input()
  displayedColumns: string[] = [];

  @Input()
  dataSource: MatTableDataSource<any> = null;

  constructor() { }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
  }
}
