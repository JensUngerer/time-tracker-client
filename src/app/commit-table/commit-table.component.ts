import { Component, OnInit, Input, EventEmitter, Output, ViewChild, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { IDurationSum } from '../../../../common/typescript/iDurationSum';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ICommit } from '../../../../common/typescript/iCommit';

interface ICommitGridLine {
  bookingCode: string;
  durationInHours: number;
}

@Component({
  selector: 'mtt-commit-table',
  templateUrl: './commit-table.component.html',
  styleUrls: ['./commit-table.component.scss']
})
export class CommitTableComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  currentDayOption: IDurationSum;

  @ViewChild(MatTable)
  public theTable: MatTable<ICommitGridLine>;

  @Input()
  public columnName: string = null;

  // @Input()
  public gridLines: ICommitGridLine[] = [];

  @Output()
  public nameCellClicked: EventEmitter<ICommitGridLine> = new EventEmitter<ICommitGridLine>();

  @Output()
  public deleteRowClicked: EventEmitter<ICommitGridLine> = new EventEmitter<ICommitGridLine>();

  public readonly displayedColumns: string[] = ['bookingCode', 'durationInHours'];

  // public readonly faTrash = faTrash;

  public readonly dataSource: MatTableDataSource<ICommitGridLine> = null;

  private onRedrawTable(areRowsReset: boolean) {
    if (areRowsReset) {
      // DEBUGGING:
      // console.log('resetRows');
      this.gridLines = [];
      const durations = this.currentDayOption.durations;
      durations.forEach((oneDuration: ICommit) => {
        const bookingCode = oneDuration.bookingDeclarationId;
        this.gridLines.push({
          bookingCode,
          durationInHours: oneDuration.durationInHours
        })
      });

      this.dataSource.data = this.gridLines;
    } else {
      // DEBUGGING:
      // console.log('rowsAreNotReset');
    }
    if (this.theTable) {
      this.theTable.renderRows();
    }
  }

  public onNameCellClicked(row: ICommitGridLine) {
    this.nameCellClicked.emit(row);
  }

  public onDeleteRowClicked(row: ICommitGridLine) {
    this.deleteRowClicked.emit(row);
  }

  constructor() {
    this.dataSource = new MatTableDataSource(this.gridLines);
  }

  ngOnInit() {

  }

  ngOnDestroy() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.currentDayOption && changes.currentDayOption.currentValue) {
      this.onRedrawTable(true);
    }
  }

}
