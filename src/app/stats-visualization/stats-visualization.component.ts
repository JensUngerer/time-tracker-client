import { formatNumber, formatPercent } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import * as Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { ITimeInterval } from '../../../../common/typescript/iTimeInterval';
import { ISummarizedTasks, ITaskLine } from '../../../../common/typescript/summarizedData';
import { ConfigurableStatsTableComponent } from '../configurable-stats-table/configurable-stats-table.component';
import { ConfigurationService } from '../configuration.service';
import { StatsService } from '../stats.service';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'mtt-stats-visualization',
  templateUrl: './stats-visualization.component.html',
  styleUrls: ['./stats-visualization.component.scss']
})
export class StatsVisualizationComponent implements OnInit, OnDestroy {
  private static doughnutType: ChartType = 'doughnut';
  private static PAGE_INDEX_OF_CATEGORY_VIEW = 0;
  private static START_PAGE_INDEX_OF_DETAILED_SUB_VIEWS = StatsVisualizationComponent.PAGE_INDEX_OF_CATEGORY_VIEW + 1;

  static randomRgba() {
    // https://stackoverflow.com/questions/23095637/how-do-you-get-random-rgb-in-javascript
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + r().toFixed(1) + ')';
  }
  // https://stackoverflow.com/questions/51341497/how-to-append-html-tags-or-elements-to-a-div-in-angular-6
  @ViewChild(MatPaginator, { static: false }) matPaginator: MatPaginator;
  @ViewChild('canvasContainer', { static: false }) canvasContainer: ElementRef<HTMLDivElement>;

  summarizedTasksByCategory: ISummarizedTasks[] = [];
  pageSizeOptions: number[] = [];

  private doughnutChartLabels: string[] = [];
  private doughnutChartData: number[] = [];
  private doughnutCtx: CanvasRenderingContext2D;
  private doughnutOptions: ChartOptions;

  private currentGroupCategory: string;

  private internalDoughnutTitle: string;
  private set doughnutTitle(value: string) {
    this.internalDoughnutTitle = value;
    this.refreshOptions();
  }
  private get doughnutTitle() {
    return this.internalDoughnutTitle;
  }

  isQuerySelectionVisible = true;
  isPieChartVisible = false;

  private currentChart: Chart;

  private categoryToPageIndexMap: { [key: string]: number } = {};

  constructor(@Inject(LOCALE_ID) private currentLocale,
    private statsService: StatsService,
    private changeDetectorRef: ChangeDetectorRef,
    private configurationService: ConfigurationService,
    private renderer: Renderer2) {
  }

  private destroyVisualRepresentationOfChartJs() {
    if (this.currentChart) {
      this.currentChart.stop();
      this.currentChart.clear();
      this.doughnutCtx.restore();
      // https://stackoverflow.com/questions/51341497/how-to-append-html-tags-or-elements-to-a-div-in-angular-6
      const singleChild = this.getCanvasNode();
      this.canvasContainer.nativeElement.removeChild(singleChild);

      const canvas = this.renderer.createElement('canvas');
      this.renderer.addClass(canvas, 'doughnut-fixed-width');
      // https://stackoverflow.com/questions/45085567/how-to-append-dynamic-dom-elements-from-a-directive-in-angular-2
      this.renderer.appendChild(this.canvasContainer.nativeElement, canvas);
      this.changeDetectorRef.detectChanges();
    }
    this.currentChart = null;
  }

  ngOnDestroy(): void {
    this.destroyVisualRepresentationOfChartJs();
  }

  onQueryTimeBoundaries($event: ITimeInterval) {
    const statsPromise = this.statsService.getStatsData($event.utcStartTime, $event.utcEndTime, this.currentGroupCategory, false, false);
    statsPromise.then((stats: ISummarizedTasks[]) => {
      if (!stats || !stats.length) {
        return;
      }
      this.isQuerySelectionVisible = false;
      this.isPieChartVisible = true;
      this.summarizedTasksByCategory = stats;

      this.initializePaginator();

      this.changeDetectorRef.detectChanges();
      this.showSubView(StatsVisualizationComponent.PAGE_INDEX_OF_CATEGORY_VIEW);
    });
    statsPromise.catch((err: any) => {
      console.error(err);
      console.error(JSON.stringify(err, null, 4));
    });
  }

  private initializePaginator() {
    this.categoryToPageIndexMap = {};
    const START_INDEX_OF_PAGINATOR = 1;
    // the first paginator page is the categories sub-view
    const generatedPageSizeOptions = [START_INDEX_OF_PAGINATOR];
    let pageIndex = StatsVisualizationComponent.START_PAGE_INDEX_OF_DETAILED_SUB_VIEWS;
    this.summarizedTasksByCategory.forEach((oneSummarizedObj) => {
      const category = oneSummarizedObj.category;
      this.categoryToPageIndexMap[category] = pageIndex;
      // each following paginator page is a detailed sub-view (of a category)
      generatedPageSizeOptions.push(START_INDEX_OF_PAGINATOR + pageIndex);
      pageIndex++;
    });
    this.pageSizeOptions = generatedPageSizeOptions;
  }

  private showSubView(pageIndex: number) {
    const categories = this.configurationService.configuration.taskCategories;
    if (pageIndex === StatsVisualizationComponent.PAGE_INDEX_OF_CATEGORY_VIEW) {
      this.openCategoryDoughnutChart();
    } else {
      this.openDetailedDoughnutChartForCategory(categories[this.matPaginator.pageIndex - StatsVisualizationComponent.START_PAGE_INDEX_OF_DETAILED_SUB_VIEWS]);
    }
  }

  private initializeOutputProperties() {
    this.doughnutChartLabels = [];
    this.doughnutChartData = [];
  }

  private fillOutputPropertiesForCategory(category: string) {
    const oneCategoryData = this.summarizedTasksByCategory.find((currentCategoryEntry) => currentCategoryEntry.category === category);
    oneCategoryData.lines.forEach((oneLine: ITaskLine) => {
      this.doughnutChartLabels.push(oneLine.taskNumber + ' ' + oneLine.taskDescription);
      const formattedDurationInHours = formatNumber(oneLine.durationInHours, this.currentLocale, ConfigurableStatsTableComponent.formatNumber);
      this.doughnutChartData.push(parseFloat(formattedDurationInHours));
    });
  }

  private getCanvasNode() {
    const childNodes = this.canvasContainer.nativeElement.children;
    for (let index = 0; index < childNodes.length; index++) {
      const oneChildNode = childNodes[index];
      if (oneChildNode.nodeName === 'CANVAS') {
        return oneChildNode;
      }
    }

  }

  private openDetailedDoughnutChartForCategory(category: string) {
    // DEBUGGING:
    // console.log('open detailed view for category:' + category);
    // a) paging control
    this.matPaginator.pageIndex = this.categoryToPageIndexMap[category];

    // b) chart
    this.initializeOutputProperties();
    this.fillOutputPropertiesForCategory(category);
    this.doughnutTitle = category;
    const backgroundColors = this.generateRandomRgbBackgroundColors();
    const data: ChartData = {
      labels: this.doughnutChartLabels,
      datasets: [{
        data: this.doughnutChartData,
        label: this.doughnutTitle,
        backgroundColor: backgroundColors
      }]
    };

    this.destroyVisualRepresentationOfChartJs();
    const canvas = this.getCanvasNode();
    this.doughnutCtx = (canvas as HTMLCanvasElement).getContext('2d');

    this.currentChart = new Chart(this.doughnutCtx, {
      type: StatsVisualizationComponent.doughnutType,
      data: data,
      options: this.doughnutOptions
    });
    this.changeDetectorRef.detectChanges();
    this.currentChart.render();
  }

  private onClickAbstract(evt: MouseEvent, callback: (idx: number, label: string) => void) {
    try {
      evt.stopImmediatePropagation();
      // evt.stopPropagation();
      // evt.preventDefault();
    } catch (e) {
      console.log(e);
    }
    // https://stackoverflow.com/questions/26257268/click-events-on-pie-charts-in-chart-js
    // https://jsfiddle.net/u1szh96g/208/
    const activePoints = this.currentChart.getElementsAtEvent(evt);
    if (activePoints[0]) {
      const chartData = activePoints[0]['_chart'].config.data;
      const idx = activePoints[0]['_index'];

      const label = chartData.labels[idx];
      // const value = chartData.datasets[0].data[idx];

      // DEBUGGING:
      // console.log(JSON.stringify(chartData, null, 4));

      // DEBUGGING
      // console.log(label);
      // console.log(value);
      callback(idx, label);
    } else {
      console.error('detection of area failed');
    }
  }

  private chartDetailOnClick(evt: MouseEvent) {
    this.onClickAbstract(evt, (idx: number, label: string) => {
      const category = this.doughnutTitle;
      const foundSummary = this.summarizedTasksByCategory.find((oneCatSummary) => oneCatSummary.category === category);
      if (!foundSummary) {
        console.log('no summary found for:' + label + '->' + category);
        return;
      }
      const foundLine = foundSummary.lines[idx];
      if (foundLine &&
        foundLine.taskNumberUrl) {
        location.href = foundLine.taskNumberUrl;
      } else {
        console.log('no taskNumberUrl:' + foundLine.taskNumberUrl + ' for:' + foundLine.taskNumber);
      }
    });
  }

  private chartOverviewOnClick(evt: MouseEvent) {
    this.onClickAbstract(evt, (idx: number, label: string) => {
      // go to specific detail(ed) doughnut chart
      // --> so switch the page control
      // --> so switch the doughnut visualization
      switch (this.matPaginator.pageIndex) {
        case 0:
          // DEBUGGING:
          // console.log(new Error().stack);
          this.openDetailedDoughnutChartForCategory(label);
          break;

        default:
          // DEBUGGING:
          console.log('do not change view as pageIndex:' + this.matPaginator.pageIndex);
          break;
      }
    });
  }
  private generateRandomRgbBackgroundColors() {
    const backgroundColors = [];
    this.doughnutChartData.forEach(() => {
      backgroundColors.push(StatsVisualizationComponent.randomRgba());
    });
    return backgroundColors;
  }

  private openCategoryDoughnutChart() {
    this.initializeOutputProperties();

    if (this.summarizedTasksByCategory
      && this.summarizedTasksByCategory.length
      && this.summarizedTasksByCategory.length > 0) {

      this.summarizedTasksByCategory.forEach((oneSummarizedCategory) => {
        this.doughnutChartLabels.push(oneSummarizedCategory.category);
        const formattedValue = formatNumber(oneSummarizedCategory.durationSum, this.currentLocale, ConfigurableStatsTableComponent.formatNumber);
        this.doughnutChartData.push(parseFloat(formattedValue));
      });

      const backgroundColors = this.generateRandomRgbBackgroundColors();
      this.doughnutTitle = 'Categories';

      // cf.: https://stackoverflow.com/questions/37257034/chart-js-2-0-doughnut-tooltip-percentages
      // cf.: https://jsfiddle.net/leighking2/q4yaa78c/
      const data: ChartData = {
        labels: this.doughnutChartLabels,
        datasets: [{
          data: this.doughnutChartData,
          label: this.doughnutTitle,
          backgroundColor: backgroundColors
        }]
      };

      this.destroyVisualRepresentationOfChartJs();
      const canvas = this.getCanvasNode();
      this.doughnutCtx = (canvas as HTMLCanvasElement).getContext('2d');

      this.currentChart = new Chart(this.doughnutCtx, {
        type: StatsVisualizationComponent.doughnutType,
        data: data,
        options: this.doughnutOptions
      });
      this.changeDetectorRef.detectChanges();
      this.currentChart.render();
    }
  }

  private isCategoryChart(currentLabel: string) {
    const foundCorrespondingSummaryForCategories = this.summarizedTasksByCategory.find(summary => summary.category === currentLabel);
    if (typeof foundCorrespondingSummaryForCategories !== 'undefined') {
      return true;
    }
    return false
  }

  private isDetailChart(category: string) {
    const foundCorrespondingSummaryForDetail = this.summarizedTasksByCategory.find(summary => summary.category === category);
    if (typeof foundCorrespondingSummaryForDetail !== 'undefined') {
      return true;
    }
    return false;
  }

  private refreshOptions() {
    const options: ChartOptions = {
      plugins: [ChartDataLabels],
      onClick: this.matPaginator.pageIndex === StatsVisualizationComponent.PAGE_INDEX_OF_CATEGORY_VIEW ? this.chartOverviewOnClick.bind(this) : this.chartDetailOnClick.bind(this),
      legend: {
        display: true,
        position: 'bottom',
        fullWidth: true
      },
      title: {
        display: true,
        text: this.internalDoughnutTitle
      },
      tooltips: {
        // position: 'nearest', // https://www.chartjs.org/docs/latest/configuration/tooltip.html#position-modes
        xPadding: 30,
        yPadding: 30,
        callbacks: {
          label: (tooltipItem, data) => {
            const datasetIndex = tooltipItem.datasetIndex;
            const toolTipIndex = tooltipItem.index;
            const labels = data.labels;
            const dataset = data.datasets[datasetIndex];
            const dataSetData = dataset.data;

            let total = 0.0;
            let percentNumber = -1.0;
            const category = dataset.label;
            const currentLabel = labels[toolTipIndex].toString();
            if (this.isDetailChart(category)) {
              // use case of detail
              const foundCorrespondingSummaryForDetail = this.summarizedTasksByCategory.find(summary => summary.category === category);
              percentNumber = foundCorrespondingSummaryForDetail.lines[toolTipIndex].durationFraction;
            } else if (this.isCategoryChart(currentLabel)) {
              // use case of Categories
              const foundCorrespondingSummaryForCategories = this.summarizedTasksByCategory.find(summary => summary.category === currentLabel);
              percentNumber = foundCorrespondingSummaryForCategories.durationFraction;
            } else {
              // fallback
              console.error('this case should never be taken');
              dataSetData.forEach((oneDataSetData) => {
                total += oneDataSetData;
              });
              const currentValue = dataSetData[toolTipIndex] as number;
              percentNumber = currentValue / total;
            }

            const precentage = formatPercent(percentNumber, this.currentLocale, ConfigurableStatsTableComponent.formatPercent);
            return precentage + ' ' + currentLabel;
          }
        }
      }
    };
    this.doughnutOptions = options;
  }

  ngOnInit(): void {
  }

  onPageChanged($event: PageEvent) {
    // DEBUGGING:
    // console.log('onPageChaged');
    // console.log($event);

    const pageIndex = $event.pageIndex;
    this.showSubView(pageIndex);
  }

  onQueryGroupCategory(groupCategories: string[]) {
    if (groupCategories && groupCategories.length && groupCategories.length === 1) {
      this.currentGroupCategory = groupCategories[0];
    }
  }
}
