import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ISummarizedTasks } from '../../../../common/typescript/summarizedData';

@Component({
  selector: 'mtt-booking-table',
  templateUrl: './booking-table.component.html',
  styleUrls: ['./booking-table.component.scss']
})
export class BookingTableComponent implements AfterViewInit, OnChanges {


  @Input()
  lines: any[];

  // readonly displayedColumns: string[] = ['code', 'description', 'durationInHours', 'durationFraction'];
  readonly displayedColumns: string[] = ['taskNumber', 'taskDescription', 'durationInHours', 'durationFraction'];
  dataSource: MatTableDataSource<any>;

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
