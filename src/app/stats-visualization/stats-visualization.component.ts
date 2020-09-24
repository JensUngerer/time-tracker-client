import { formatNumber } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, LOCALE_ID,  OnDestroy,  ViewChild } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { ISummarizedTasks, ITaskLine } from '../../../../common/typescript/summarizedData';
import { ITimeBoundaries } from '../query-time-boundaries/query-time-boundaries.component';
import { StatsService } from '../stats.service';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as Chart from 'chart.js';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ConfigurationService } from '../configuration.service';
import { tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

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
  static randomRgba () {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + r().toFixed(1) + ')';
  }
  @ViewChild('firstDoughnut', { static: false, read: ElementRef }) firstDoughnut: ElementRef<HTMLCanvasElement>;
  @ViewChild(MatPaginator, { static: false}) matPaginator: MatPaginator;

  summarizedTasksByCategory: ISummarizedTasks[] = [];
  
  private configurationServiceSubscription: Subscription;
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

  private categoryToPageIndexMap: {[key: string]: number} = {};

  constructor(@Inject(LOCALE_ID) private currentLocale,
    private statsService: StatsService,
    private changeDetectorRef: ChangeDetectorRef,
    private configurationService: ConfigurationService) {
  }

  ngOnDestroy(): void {
    if (this.configurationServiceSubscription) {
      this.configurationServiceSubscription.unsubscribe();
    }
  }

  onQueryTimeBoundaries($event: ITimeBoundaries) {
    const statsPromise = this.statsService.getStatsData($event.utcStartTime, $event.utcEndTime);
    statsPromise.then((stats: ISummarizedTasks[]) => {
      this.isQuerySelectionVisible = false;
      this.isPieChartVisible = true;
      this.summarizedTasksByCategory = stats;

      this.changeDetectorRef.detectChanges();
      this.doughnutCtx = this.firstDoughnut.nativeElement.getContext('2d');
      this.showSubView(StatsVisualizationComponent.PAGE_INDEX_OF_CATEGORY_VIEW);
    });
    statsPromise.catch((err: any) => {
      console.error(err);
      console.error(JSON.stringify(err, null, 4));
    });
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
    // this.summarizedTasksByCategory.forEach((oneSummarizedCategory) => {
    //   const oneCategoryData = o

    //   this.doughnutChartLabels.push(oneSummarizedCategory.category);
    //   const formattedValue = formatNumber(oneSummarizedCategory.durationSum, this.currentLocale, '1.2-2');
    //   this.doughnutChartData.push(parseFloat(formattedValue));

    //   // categoryDataEntry.push(oneSummarizedCategory.durationSum);
    //   // const oneDataEntry = [];
    //   // oneSummarizedCategory.lines.forEach((oneLine)=>{
    //   //   // const oneDataEntry = [oneLine.durationInHours, oneSummarizedCategory.durationSum];
    //   //   // this.doughnutChartData.push(oneDataEntry);
    //   //   this.doughnutChartData[0].push(oneLine.durationInHours);
    //   // });
    //   // this.doughnutChartData.push(oneDataEntry);
    // });
    const oneCategoryData = this.summarizedTasksByCategory.find((currentCategoryEntry) => currentCategoryEntry.category === category);
    oneCategoryData.lines.forEach((oneLine: ITaskLine) => {
        this.doughnutChartLabels.push(oneLine.taskNumber + ' ' + oneLine.taskDescription);
        const formattedDurationInHours = formatNumber(oneLine.durationInHours, this.currentLocale, StatsVisualizationComponent.formatString);
        this.doughnutChartData.push(parseFloat(formattedDurationInHours));
    });
  }

  private openDetailedDoughnutChartForCategory(category: string) {
    // DEBUGGING:
    console.log('open detailed view for category:' + category);
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

    this.currentChart = new Chart(this.doughnutCtx, {
      type: StatsVisualizationComponent.doughnutType,
      data: data,
      options: this.doughnutOptions
    });
    this.currentChart.render();
  }

  private chartOnClick(evt: MouseEvent) {
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
          this.openDetailedDoughnutChartForCategory(label);
          break;

        default:
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
    // this.isQueryDataVisible = false;
    // this.isPieChartButtonVisible = false;
    // this.isPieChartVisible = true
    this.initializeOutputProperties();

    if (this.summarizedTasksByCategory
      && this.summarizedTasksByCategory.length
      && this.summarizedTasksByCategory.length > 0) {

      // index === 0 --> features
      // const categoryDataEntry: number[] = [];
      // this.doughnutChartLabels.push([]);
      // this.doughnutChartData.push([]);
      this.summarizedTasksByCategory.forEach((oneSummarizedCategory) => {
        this.doughnutChartLabels.push(oneSummarizedCategory.category);
        const formattedValue = formatNumber(oneSummarizedCategory.durationSum, this.currentLocale, StatsVisualizationComponent.formatString);
        this.doughnutChartData.push(parseFloat(formattedValue));

        // categoryDataEntry.push(oneSummarizedCategory.durationSum);
        // const oneDataEntry = [];
        // oneSummarizedCategory.lines.forEach((oneLine)=>{
        //   // const oneDataEntry = [oneLine.durationInHours, oneSummarizedCategory.durationSum];
        //   // this.doughnutChartData.push(oneDataEntry);
        //   this.doughnutChartData[0].push(oneLine.durationInHours);
        // });
        // this.doughnutChartData.push(oneDataEntry);
      });
      // this.doughnutChartData[0].push(categoryDataEntry);

      // this.doughnutChartOptionsObj = {
      //   plugins: {
      //     labels: {
      //       renderer: 'label',
      //       fontColor: '#000',
      //       position: 'outside'
      //     }
      //   }
      // };
      // https://stackoverflow.com/questions/23095637/how-do-you-get-random-rgb-in-javascript
    
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
        //   datasets: [{
        //     label: '# of Votes',
        //     data: [12, 19, 3, 5, 2, 3],
        //     backgroundColor: [
        //         'rgba(255, 99, 132, 0.2)',
        //         'rgba(54, 162, 235, 0.2)',
        //         'rgba(255, 206, 86, 0.2)',
        //         'rgba(75, 192, 192, 0.2)',
        //         'rgba(153, 102, 255, 0.2)',
        //         'rgba(255, 159, 64, 0.2)'
        //     ],
        //     borderColor: [
        //         'rgba(255,99,132,1)',
        //         'rgba(54, 162, 235, 1)',
        //         'rgba(255, 206, 86, 1)',
        //         'rgba(75, 192, 192, 1)',
        //         'rgba(153, 102, 255, 1)',
        //         'rgba(255, 159, 64, 1)'
        //     ],
        //     borderWidth: 1
        // }]
      };
      // const plugin: PluginServiceGlobalRegistration & PluginServiceRegistrationOptions =  {
      //   id: 'labels',
      //   // berforeInit: (chartInstance: Chart, options?: any) => {

      //   // }
      // };
      // Chart.plugins.register(
      //   {
      //     id: 'datalabels',
      //     beforeInit: (chartInstance: Chart) => {
      //       chartInstance.options.plugins.datalabels.formatter = (value: number) => {
      //         return value.toFixed(2);
      //       };
      //     }
      //   }
      // );
      // Chart.prototype
      // ChartDataLabels.formatter = () => {

      // };

      

      this.currentChart = new Chart(this.doughnutCtx, {
        type: StatsVisualizationComponent.doughnutType,
        data: data,
        options: this.doughnutOptions
      });
      this.currentChart.render();

      // Chart.defaults.global.plugins.datalabels.display = true;
      // Chart.defaults.global.plugins.datalabels.formatter = (value: any, context: any) => {
      //   console.log(value);
      //   console.log(context);
      //   console.log('-------------');

      //   return context[value];
      // };
    }

    // this.summarizedTasksByCategory.forEach((oneSummarizedCategory, indexOfCategory: number) => {
    //   this.doughnutChartLabels.push([]);
    //   this.doughnutChartData.push([]);
    //   // this.doughnutChartLabels[1].push(oneSummarizedCategory);
    //   oneSummarizedCategory.lines.forEach((oneLine: ITaskLine, indexOfLine: number) => {

    //     this.doughnutChartLabels[1 + indexOfCategory].push(oneLine.taskDescription);
    //     this.doughnutChartData[1 + indexOfCategory].push(oneLine.durationInHours);
    //   });
    // });
    // // DEBUGGING:
    // console.log(JSON.stringify(this.doughnutChartData[0], null, 4));

  }

  private refreshOptions() {
    const options: ChartOptions = {
      plugins: [ChartDataLabels],
      // {
      //   datalabels: {
      //     // labels: labelOptions,
      //     display: true,
      //     formatter: (value: any, context: Context) => {
      //       console.log(value);
      //       console.log(context);
      //       console.log('-------------');
      //     }
      //     // renderer: 'label',
      //     // fontColor: '#000',
      //     // position: 'outside'
      //   }
      // },
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
            const currentLabel =  labels[toolTipIndex];
            return precentage + "%" + ' ' + currentLabel;
          }
        }
      }
    };
    this.doughnutOptions = options;
  }

  private initializeCategoryToPageIndexMap(isInitialized: boolean) {
    if (!isInitialized) {
      return;
    }
    let pageIndex = StatsVisualizationComponent.START_PAGE_INDEX_OF_DETAILED_SUB_VIEWS;
    this.configurationService.configuration.taskCategories.forEach((category) => {
      this.categoryToPageIndexMap[category] = pageIndex;
      pageIndex++;
    });
  }

  ngAfterViewInit(): void {
    const configurationServiceSubscription = this.configurationService.configurationReceived$.pipe(tap(this.initializeCategoryToPageIndexMap.bind(this))).subscribe();
  }


  onPageChanged($event: PageEvent) {
    // DEBUGGING:
    console.log('onPageChaged');
    console.log($event);

    const pageIndex = $event.pageIndex;
    this.showSubView(pageIndex);
  }
}
