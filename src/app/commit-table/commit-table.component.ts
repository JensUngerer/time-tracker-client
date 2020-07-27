import { Component, OnInit, SimpleChanges, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { ICommitTask } from './../../../../common/typescript/iCommitTasks';
import { ICommitGridLine } from '../book-table/book-table.component';
import { ITasksDurationSum } from '../../../../common/typescript/iTasksDurationSum';
import { ITask } from '../../../../common/typescript/iTask';

interface ITaskCommitGridLine  {
  task: ITask;
  durationInHours: number;
}

@Component({
  selector: 'mtt-commit-table',
  templateUrl: './commit-table.component.html',
  styleUrls: ['./../book-table/book-table.component.scss']
})
export class CommitTableComponent implements OnInit {
  @Input()
  currentDayOption: ITasksDurationSum;

  @ViewChild(MatTable)
  public theTable: MatTable<ICommitGridLine>;

  @Input()
  public columnName: string = null;

  // @Input()
  public gridLines: ITaskCommitGridLine[] = [];

  @Output()
  public nameCellClicked: EventEmitter<ICommitGridLine> = new EventEmitter<ICommitGridLine>();

  @Output()
  public deleteRowClicked: EventEmitter<ICommitGridLine> = new EventEmitter<ICommitGridLine>();

  public readonly displayedColumns: string[] = ['taskNumber', 'taskName', 'durationInHours'];

  // public readonly faTrash = faTrash;

  public readonly dataSource: MatTableDataSource<ITaskCommitGridLine> = null;

  private onRedrawTable(areRowsReset: boolean) {
    if (areRowsReset) {
      // DEBUGGING:
      // console.log('resetRows');
      this.gridLines = [];
      if (this.currentDayOption) {
        const durations = this.currentDayOption.durations;
        durations.forEach((oneDuration: ICommitTask) => {
          this.gridLines.push({
            task:  oneDuration.basis,
            durationInHours: oneDuration.durationInHours
          });
        });
      }

      this.dataSource.data = this.gridLines;
    } else {
      // DEBUGGING:
      // console.log('rowsAreNotReset');
    }
    if (this.theTable) {
      this.theTable.renderRows();
    }
  }
  constructor() {
    this.dataSource = new MatTableDataSource(this.gridLines);
  }

  ngOnInit() {

  }

  ngOnDestroy() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes &&
      changes.currentDayOption &&
      typeof changes.currentDayOption.currentValue !== 'undefined') {
      this.onRedrawTable(true);
    }
  }
}
