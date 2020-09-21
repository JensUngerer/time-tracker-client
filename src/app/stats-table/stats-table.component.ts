import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ISummarizedTasks, ITaskLine } from './../../../../common/typescript/summarizedData';

@Component({
  selector: 'mtt-stats-table',
  templateUrl: './stats-table.component.html',
  styleUrls: ['./stats-table.component.scss']
})
export class StatsTableComponent implements OnInit, AfterViewInit {
  @Input()
  summarizedTasks: ISummarizedTasks = null;

  @ViewChild(MatTable)
  public theTable: MatTable<ITaskLine>;
  
  readonly displayedColumns: string[] = ['taskNumber', 'taskDescription', 'durationInHours', 'durationFraction'];
  dataSource: MatTableDataSource<ITaskLine> = null;

  constructor() { }

  ngAfterViewInit(): void {
    this.dataSource = new MatTableDataSource(this.summarizedTasks.lines);
  }

  ngOnInit(): void {
  }

}
