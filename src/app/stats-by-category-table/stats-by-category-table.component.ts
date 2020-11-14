import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IStatistic } from '../../../../common/typescript/iStatistic';
import { ISummarizedTasks } from '../../../../common/typescript/summarizedData';

@Component({
  selector: 'mtt-stats-by-category-table',
  templateUrl: './stats-by-category-table.component.html',
  styleUrls: ['./stats-by-category-table.component.scss']
})
export class StatsByCategoryTableComponent implements OnInit, AfterViewInit, OnChanges {
  @Input()
  summarizedTasksByCategoryBuffer: ISummarizedTasks[][] = [];

  @Input()
  groupCategories: string[] = [];

  linesBuffer: IStatistic[][] = [];

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.summarizedTasksByCategoryBuffer &&
      changes.summarizedTasksByCategoryBuffer.currentValue) {
      this.fillData();
    }
  }

  private fillData() {
    if (!this.summarizedTasksByCategoryBuffer ||
      !this.summarizedTasksByCategoryBuffer.length) {
      return;
    }
    this.summarizedTasksByCategoryBuffer.forEach((oneSummarizedEntry) => {
      if (!oneSummarizedEntry || !oneSummarizedEntry.length) {
        return;
      }
      const linesOfOneSummarizedEntry: IStatistic[] = [];
      oneSummarizedEntry.forEach((oneSummarizedInnerEntry) => {
        if (!oneSummarizedInnerEntry.lines ||
          !oneSummarizedInnerEntry.lines.length) {
          return;
        }
        oneSummarizedInnerEntry.lines.forEach((oneSingleLine) => {
          linesOfOneSummarizedEntry.push({
            description: oneSingleLine.taskDescription,
            durationFraction: oneSingleLine.durationFraction,
            durationInHours: oneSingleLine.durationInHours,
            identifier: oneSingleLine.taskNumber,
            identifierUrl: oneSingleLine.taskNumberUrl,
            uniqueId: oneSingleLine._taskId,
            _timeEntryIds: oneSingleLine._timeEntryIds
          });
        });
      });
      this.linesBuffer.push(linesOfOneSummarizedEntry);
    });
  }

  ngAfterViewInit(): void {
    this.fillData();
  }

  ngOnInit(): void {
  }
}
