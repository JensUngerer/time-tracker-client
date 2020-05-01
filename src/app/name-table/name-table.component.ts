import { IGridLine } from './../typescript/iGridLine';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { MatTable, MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'mtt-name-table',
  templateUrl: './name-table.component.html',
  styleUrls: ['./name-table.component.scss']
})
export class NameTableComponent implements OnInit, OnDestroy, OnChanges {

  @ViewChild(MatTable)
  public theTable: MatTable<IGridLine>;

  @Input()
  public columnName: string = null;

  @Input()
  public gridLines: IGridLine[] = [];

  @Output()
  public nameCellClicked: EventEmitter<IGridLine> = new EventEmitter<IGridLine>();

  @Output()
  public deleteRowClicked: EventEmitter<IGridLine> = new EventEmitter<IGridLine>();

  public readonly displayedColumns: string[] = ['name', 'deleteRow'];

  public readonly faTrash = faTrash;

  public readonly dataSource: MatTableDataSource<IGridLine> = null;

  private onRedrawTable(areRowsReset: boolean) {
    if (areRowsReset) {
      // DEBUGGING:
      // console.log('resetRows');

      this.dataSource.data = this.gridLines;
    } else {
      // DEBUGGING:
      // console.log('rowsAreNotReset');
    }
    if (this.theTable) {
      this.theTable.renderRows();
    }
  }

  public onNameCellClicked(row: IGridLine) {
    this.nameCellClicked.emit(row);
  }

  public onDeleteRowClicked(row: IGridLine) {
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
    if (changes && changes.gridLines) {
      this.onRedrawTable(true);
    }
  }
}
