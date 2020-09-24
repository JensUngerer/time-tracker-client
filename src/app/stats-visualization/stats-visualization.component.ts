import { formatNumber } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, LOCALE_ID, OnDestroy, ViewChild } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { ISummarizedTasks, ITaskLine } from '../../../../common/typescript/summarizedData';
import { ITimeBoundaries } from '../query-time-boundaries/query-time-boundaries.component';
import { StatsService } from '../stats.service';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as Chart from 'chart.js';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ConfigurationService } from '../configuration.service';

@Component({
  selector: 'mtt-stats-visualization',
  templateUrl: './stats-visualization.component.html',
  styleUrls: ['./stats-visualization.component.scss']
})
export class StatsVisualizationComponent implements AfterViewInit, OnDestroy {
  private static doughnutType: ChartType = 'doughnut';
  private static PAGE_INDEX_OF_CATEGORY_VIEW = 0;
  private static START_PAGE_INDEX_OF_DETAILED_SUB_VIEWS = StatsVisualizationComponent.PAGE_INDEX_OF_CATEGORY_VIEW + 1;

  static formatString = '1.2-2';
  static randomRgba() {
    // https://stackoverflow.com/questions/23095637/how-do-you-get-random-rgb-in-javascript
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + r().toFixed(1) + ')';
  }
  @ViewChild('firstDoughnut', { static: false, read: ElementRef }) firstDoughnut: ElementRef<HTMLCanvasElement>;
  @ViewChild(MatPaginator, { static: false }) matPaginator: MatPaginator;

  summarizedTasksByCategory: ISummarizedTasks[] = [];
  pageSizeOptions: number[] = [];

  private doughnutChartLabels: string[] = [];
  private doughnutChartData: number[] = [];
  private doughnutCtx: CanvasRenderingContext2D;
  private doughnutOptions: ChartOptions;

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
    private configurationService: ConfigurationService) {
  }

  private innerNgOnDestroy() {
    if (this.currentChart) {
      try {
        this.currentChart.destroy();
      } catch (e) {
        console.log(e);
      }
    }
  }

  ngOnDestroy(): void {
    this.innerNgOnDestroy();
  }

  onQueryTimeBoundaries($event: ITimeBoundaries) {
    const statsPromise = this.statsService.getStatsData($event.utcStartTime, $event.utcEndTime);
    statsPromise.then((stats: ISummarizedTasks[]) => {
      this.isQuerySelectionVisible = false;
      this.isPieChartVisible = true;
      this.summarizedTasksByCategory = stats;

      this.initializePaginator();

      this.changeDetectorRef.detectChanges();
      this.doughnutCtx = this.firstDoughnut.nativeElement.getContext('2d');
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
      const formattedDurationInHours = formatNumber(oneLine.durationInHours, this.currentLocale, StatsVisualizationComponent.formatString);
      this.doughnutChartData.push(parseFloat(formattedDurationInHours));
    });
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

    // this.innerNgOnDestroy();

    this.currentChart = new Chart(this.doughnutCtx, {
      type: StatsVisualizationComponent.doughnutType,
      data: data,
      options: this.doughnutOptions
    });
    this.currentChart.render();
  }

  private chartOnClick(evt: MouseEvent) {
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
      const value = chartData.datasets[0].data[idx];

      // DEBUGGING
      // console.log(label);
      // console.log(value);

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
    } else {
      console.error('detection of area failed');
    }
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
        const formattedValue = formatNumber(oneSummarizedCategory.durationSum, this.currentLocale, StatsVisualizationComponent.formatString);
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
      
      // this.innerNgOnDestroy();

      this.currentChart = new Chart(this.doughnutCtx, {
        type: StatsVisualizationComponent.doughnutType,
        data: data,
        options: this.doughnutOptions
      });
      this.currentChart.render();
    }
  }

  private refreshOptions() {
    const options: ChartOptions = {
      plugins: [ChartDataLabels],
      onClick: this.matPaginator.pageIndex === StatsVisualizationComponent.PAGE_INDEX_OF_CATEGORY_VIEW ? this.chartOnClick.bind(this) : null,
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
            dataSetData.forEach((oneDataSetData) => {
              total += oneDataSetData;
            });

            const currentValue = dataSetData[toolTipIndex] as number;
            const precentage = Math.floor(((currentValue / total) * 100) + 0.5);
            const currentLabel = labels[toolTipIndex];
            return precentage + "%" + ' ' + currentLabel;
          }
        }
      }
    };
    this.doughnutOptions = options;
  }

  ngAfterViewInit(): void {
  }


  onPageChanged($event: PageEvent) {
    // DEBUGGING:
    // console.log('onPageChaged');
    // console.log($event);

    const pageIndex = $event.pageIndex;
    this.showSubView(pageIndex);
  }
}
