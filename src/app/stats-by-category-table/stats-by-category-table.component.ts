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
  summarizedTasksByCategoryBuffer: ISummarizedTasks[] = [];

  @Input()
  groupCategory: string;

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
    // DEBUGGING:
    // console.error(this.summarizedTasksByCategoryBuffer);
    // console.error(this.groupCategories);
    // console.error(this.linesBuffer);

    this.summarizedTasksByCategoryBuffer.forEach((oneBuffer) => {
      const convertedLines = [];
      oneBuffer.lines.forEach((oneLine) => {
        convertedLines.push({
          description: oneLine.taskDescription,
          durationFraction: oneLine.durationFraction,
          durationInHours: oneLine.durationInHours,
          identifier: oneLine.taskNumber,
          identifierUrl: oneLine.taskNumberUrl,
          uniqueId: oneLine._taskId,
          _timeEntryIds: oneLine._timeEntryIds
        });
      });
      this.linesBuffer.push(convertedLines);
    });

    // this.summarizedTasksByCategoryBuffer.forEach((oneSummarizedEntry) => {

    //   const oneClonedEntry: IStatistic = {
    //     _timeEntryIds: oneSummarizedEntry._timeEntryIds,
    //     description: oneSummarizedEntry.
    //   };
    //   this.linesBuffer.push(oneClonedEntry);
    // })
    // this.summarizedTasksByCategoryBuffer.forEach((oneSummarizedEntry) => {
    //   if (!oneSummarizedEntry || !oneSummarizedEntry.length) {
    //     return;
    //   }
    //   const linesOfOneSummarizedEntry: IStatistic[] = [];
    //   oneSummarizedEntry.forEach((oneSummarizedInnerEntry) => {
    //     if (!oneSummarizedInnerEntry.lines ||
    //       !oneSummarizedInnerEntry.lines.length) {
    //       return;
    //     }
    //     oneSummarizedInnerEntry.lines.forEach((oneSingleLine) => {
    //       linesOfOneSummarizedEntry.push({
    //         description: oneSingleLine.taskDescription,
    //         durationFraction: oneSingleLine.durationFraction,
    //         durationInHours: oneSingleLine.durationInHours,
    //         identifier: oneSingleLine.taskNumber,
    //         identifierUrl: oneSingleLine.taskNumberUrl,
    //         uniqueId: oneSingleLine._taskId,
    //         _timeEntryIds: oneSingleLine._timeEntryIds
    //       });
    //     });
    //   });
    //   this.linesBuffer.push(linesOfOneSummarizedEntry);
    // });
  }

  ngAfterViewInit(): void {
    this.fillData();
  }

  ngOnInit(): void {
  }
}
