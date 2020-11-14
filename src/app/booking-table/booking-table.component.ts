import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ISummarizedTasks } from '../../../../common/typescript/summarizedData';
import { IStatistic } from './../../../../common/typescript/iStatistic';

@Component({
  selector: 'mtt-booking-table',
  templateUrl: './booking-table.component.html',
  styleUrls: ['./booking-table.component.scss']
})
export class BookingTableComponent {


  // @Input()
  // lines: IStatistic[];

  // // readonly displayedColumns: string[] = ['code', 'description', 'durationInHours', 'durationFraction'];
  // // readonly displayedColumns: string[] = ['identifier', 'description', 'durationInHours', 'durationFraction'];
  // dataSource: MatTableDataSource<IStatistic>;

}
