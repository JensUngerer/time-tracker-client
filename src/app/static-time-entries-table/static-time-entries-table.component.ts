import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ITimeEntryBase } from '../../../../common/typescript/iTimeEntry';
import { DurationVisualizationService } from '../duration-visualization.service';
import { QueryTimeBoundariesComponent } from '../query-time-boundaries/query-time-boundaries.component';

@Component({
  selector: 'mtt-static-time-entries-table',
  templateUrl: './static-time-entries-table.component.html',
  styleUrls: ['./static-time-entries-table.component.scss',
    './../css/table.scss']
})
export class StaticTimeEntriesTableComponent implements OnInit {
  static shortDateTimeFormat = 'short';
  shortDateTimeFormat = StaticTimeEntriesTableComponent.shortDateTimeFormat;

  requiredDateTimeFormat = QueryTimeBoundariesComponent.requiredDateTimeFormat;
  isVisible = false;

  private internalTimeEntries: ITimeEntryBase[] = [];

  @Input()
  get timeEntries(): ITimeEntryBase[] {
    return this.internalTimeEntries;
  }
  set timeEntries(newValue: ITimeEntryBase[]) {
    if (!newValue ||
      !newValue.length) {
      return;
    }
    this.isVisible = false;
    this.internalTimeEntries = newValue;
    this.dataSource = new MatTableDataSource(newValue);
    this.getDurationSumStr = this.durationVisualizationService.createDurationSumStringFn(newValue);
    this.isVisible = true;
  }

  @Output()
  lineClick: EventEmitter<ITimeEntryBase> = new EventEmitter<ITimeEntryBase>();

  dataSource: MatTableDataSource<ITimeEntryBase>;
  displayedColumns = ['startTime', 'durationInMilliseconds', 'endTime'];

  selectedRowIndex: number;

  constructor(private durationVisualizationService: DurationVisualizationService,
    @Inject(LOCALE_ID) public currentLocale) { }

  ngOnInit(): void {
  }

  getDurationStr = this.durationVisualizationService.getDurationStr;

  getDurationSumStr: () => string = () => { return ''; };

  onLineClicked(line: ITimeEntryBase, rowIndex: number) {
    this.selectedRowIndex = rowIndex;
    this.lineClick.emit(line);
  }
}
