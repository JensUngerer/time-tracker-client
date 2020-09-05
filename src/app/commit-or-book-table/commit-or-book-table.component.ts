import { AfterViewInit, Component, Input, ViewChild, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';

import { IDurationSumBase } from '../../../../common/typescript/iDurationSumBase';
import { ICommitBase } from '../../../../common/typescript/iCommitBase';
import { ITask } from '../../../../common/typescript/iTask';
import { IBookingDeclaration } from '../../../../common/typescript/iBookingDeclaration';
import { ConfigurationService } from '../configuration.service';

export interface IColumnNames {
  identifer: string;
  description: string;
}

export interface ICommitOrBookGridLine {
  identifierUrl: string;
  identifier: string;
  description: string;
  durationInHours: number;
}

@Component({
  selector: 'mtt-commit-or-book-table',
  templateUrl: './commit-or-book-table.component.html',
  styleUrls: ['./commit-or-book-table.component.scss']
})
export class CommitOrBookTableComponent implements AfterViewInit, OnChanges {
  @ViewChild(MatTable)
  public theTable: MatTable<ICommitOrBookGridLine>;

  @Input()
  currentDayOption: IDurationSumBase;

  @Input()
  columnNames: IColumnNames;

  @Input()
  isTaskBased = false;

  @Input()
  isBookingBased = false;

  gridLines: ICommitOrBookGridLine[] = [];

  identiferColumnName = '';
  descriptionColumnName = '';

  readonly displayedColumns: string[] = ['identifer', 'description', 'durationInHours'];
  readonly dataSource: MatTableDataSource<ICommitOrBookGridLine> = new MatTableDataSource(this.gridLines);

  constructor(private configurationService: ConfigurationService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes &&
      changes.currentDayOption &&
      typeof changes.currentDayOption.currentValue !== 'undefined') {
      this.onRedrawTable(true);
    }
  }

  private onRedrawTable(areRowsReset: boolean) {
    if (areRowsReset) {
      this.gridLines = [];
      if (this.currentDayOption) {
        const durations = this.currentDayOption.durations;
        durations.forEach((oneDuration: ICommitBase) => {
          let identifier = '';
          let description = '';
          let identifierUrl = '';
          if (this.isTaskBased) {
            identifier = (oneDuration.basis as ITask).number;
            identifierUrl = this.configurationService.configuration.taskBasedIdentifierBaseUrl + '/' + (oneDuration.basis as ITask).number;
            description = (oneDuration.basis as ITask).name;
          } else if (this.isBookingBased) {
            identifier = (oneDuration.basis as IBookingDeclaration).code;
            identifierUrl = this.configurationService.configuration.bookingBasedIdentifierBaseUrl + '/' +  (oneDuration.basis as IBookingDeclaration).code;
            description = (oneDuration.basis as IBookingDeclaration).description;
          }

          this.gridLines.push({
            identifierUrl,
            identifier: identifier,
            description,
            durationInHours: oneDuration.durationInHours
          });
        });
      }

      this.dataSource.data = this.gridLines;
    }
    if (this.theTable) {
      this.theTable.renderRows();
    }
  }


  ngAfterViewInit(): void {
    this.identiferColumnName = this.columnNames.identifer;
    this.descriptionColumnName = this.columnNames.description;
    // this.onRedrawTable(true);
  }

}
