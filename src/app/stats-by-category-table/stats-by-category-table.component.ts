import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ISummarizedTasks } from '../../../../common/typescript/summarizedData';

@Component({
  selector: 'mtt-stats-by-category-table',
  templateUrl: './stats-by-category-table.component.html',
  styleUrls: ['./stats-by-category-table.component.scss']
})
export class StatsByCategoryTableComponent implements OnInit, AfterViewInit {
  @Input()
  summarizedTasksByCategoryBuffer: ISummarizedTasks[][] = [];

  @Input()
  groupCategories: string[] = [];

  constructor() { }

  ngAfterViewInit(): void {
    // this.summarizedTasksByCategoryBuffer.forEach((oneBuffers) => {
    //   if (oneBuffers && oneBuffers.length > 0) {
    //     this.groupCategories.push(oneBuffers[0].)
    //   }
    // });
  }

  ngOnInit(): void {
  }
}