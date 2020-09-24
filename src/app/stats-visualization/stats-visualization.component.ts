import { formatNumber } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { ISummarizedTasks } from '../../../../common/typescript/summarizedData';
import { ITimeBoundaries } from '../query-time-boundaries/query-time-boundaries.component';
import { StatsService } from '../stats.service';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as Chart from 'chart.js';
import { PageEvent } from '@angular/material/paginator';
import { ConfigurationService } from '../configuration.service';

@Component({
  selector: 'mtt-stats-visualization',
  templateUrl: './stats-visualization.component.html',
  styleUrls: ['./stats-visualization.component.scss']
})
export class StatsVisualizationComponent implements OnInit {
  @ViewChild('firstDoughnut', { static: false, read: ElementRef }) firstDoughnut: ElementRef<HTMLCanvasElement>;

  summarizedTasksByCategory: ISummarizedTasks[] = [];
  doughnutChartLabels: string[] = [];
  doughnutChartData: number[] = [];
  doughnutChartType: ChartType = 'doughnut';
  doughnutChartDataObjs: any[] = [];
  doughnutChartOptionsObj: any = [];

  isQuerySelectionVisible = true;
  isPieChartVisible = false;

  private currentPageIndex: number;
  private currentChart: Chart;

  constructor(@Inject(LOCALE_ID) private currentLocale,
    private statsService: StatsService,
    private changeDetectorRef: ChangeDetectorRef,
    private configurationService: ConfigurationService) {
  }

  onQueryTimeBoundaries($event: ITimeBoundaries) {
    const statsPromise = this.statsService.getStatsData($event.utcStartTime, $event.utcEndTime);
    statsPromise.then((stats: ISummarizedTasks[]) => {
      this.isQuerySelectionVisible = false;
      this.isPieChartVisible = true;
      this.summarizedTasksByCategory = stats;

      this.changeDetectorRef.detectChanges();

      this.showSubView(0);
    });
    statsPromise.catch((err: any) => {
      console.error(err);
      console.error(JSON.stringify(err, null, 4));
    });
  }

  private showSubView(pageIndex: number) {
    this.currentPageIndex = pageIndex;
    const categories = this.configurationService.configuration.taskCategories;
    switch (pageIndex) {
      case 0:
        this.openCategoryDoughnutChart();
        break;
      case 1:
        this.openDetailedDoughnutChartForCategory(categories[0]);
        break;
      default:
        break;
    }
  }

  private initializeOutputProperties() {
    this.doughnutChartLabels = [];
    this.doughnutChartData = [];
    this.doughnutChartType = 'doughnut';
    this.doughnutChartDataObjs = [];
    this.doughnutChartOptionsObj = [];
  }

  private openDetailedDoughnutChartForCategory(category: string) {
    // DEBUGGING:
    console.log('open detailed view for category:' + category);


    this.initializeOutputProperties();

    // this.doughnutChartLabels.push([]);
    // this.doughnutChartData.push([]);



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
      switch (this.currentPageIndex) {
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
        const formattedValue = formatNumber(oneSummarizedCategory.durationSum, this.currentLocale, '1.2-2');
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

      this.doughnutChartDataObjs.push({
        labels: this.doughnutChartLabels,
        datasets: [
          {
            label: 'categories',
          }
        ]
      });

      this.doughnutChartOptionsObj = {
        plugins: {
          labels: {
            renderer: 'label',
            fontColor: '#000',
            position: 'outside'
          }
        }
      };
      let donutCtx = this.firstDoughnut.nativeElement.getContext('2d');
      // https://stackoverflow.com/questions/23095637/how-do-you-get-random-rgb-in-javascript
      const random_rgba = () => {
        var o = Math.round, r = Math.random, s = 255;
        return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + r().toFixed(1) + ')';
      };
      const backgroundColors = [];
      this.doughnutChartData.forEach(() => {
        backgroundColors.push(random_rgba());
      });

      // cf.: https://stackoverflow.com/questions/37257034/chart-js-2-0-doughnut-tooltip-percentages
      // cf.: https://jsfiddle.net/leighking2/q4yaa78c/
      const data: ChartData = {
        labels: this.doughnutChartLabels,
        datasets: [{
          data: this.doughnutChartData,
          label: 'Categories',
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
      const options: ChartOptions = {
        onClick: this.chartOnClick.bind(this),
        legend: {
          display: true,
          position: 'bottom',
          fullWidth: true
        },
        title: {
          display: true,
          text: 'Categories'
        },
        tooltips: {
          callbacks: {
            label: (tooltipItem, data) => {
              var dataset = data.datasets[tooltipItem.datasetIndex];
              const dataSetData = dataset.data;
              let total = 0.0;
              dataSetData.forEach((oneDataSetData) => {
                total += oneDataSetData;
              });
              const currentValue = dataset.data[tooltipItem.index] as number;
              const precentage = Math.floor(((currentValue / total) * 100) + 0.5);
              return precentage + "%";
            }
          }
        },
        plugins: [ChartDataLabels]
      };

      this.currentChart = new Chart(donutCtx, {
        type: 'doughnut',
        data: data,
        options: options
      });
      this.currentChart.render();
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

  ngOnInit(): void {
  }


  onPageChanged($event: PageEvent) {
    const pageIndex = $event.pageIndex;
    this.showSubView(pageIndex);
  }
}
