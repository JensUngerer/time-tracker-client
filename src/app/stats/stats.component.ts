import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import { formatDate, formatNumber } from '@angular/common';
import { CommitService } from '../commit.service';
import { ISummarizedTimeEntries } from './../../../../common/typescript/iSummarizedTimeEntries';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { ITasksDocument } from './../../../../common/typescript/mongoDB/iTasksDocument';
import { ISummarizedTasks, ITaskLine } from './../../../../common/typescript/summarizedData';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';


@Component({
  selector: 'mtt-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  @ViewChild('firstDoughnut', { static: false, read: ElementRef }) firstDoughnut: ElementRef<HTMLCanvasElement>;

  queryTimeStartFormControlName = 'theQueryStartTime';
  queryTimeEndFormControlName = 'theQueryEndTime';

  queryTimeFormGroup: FormGroup;

  summarizedTasksByCategory: ISummarizedTasks[] = [];

  isQuerySelectionVisible = true;
  isQueryDataVisible = false;
  isPieChartButtonVisible = false;
  isPieChartVisible = false;
  public doughnutChartLabels: string[][] = [];
  public doughnutChartData: number[][] = [];
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartDataObjs: any[] = [];
  public doughnutChartOptionsObj: any = [];


  constructor(@Inject(LOCALE_ID) private currentLocale,
    private commitService: CommitService,
    private sessionStorageSerializationService: SessionStorageSerializationService,
    private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    const configObj: { [key: string]: AbstractControl } = {};
    const currentTime = Date.now();
    // https://stackoverflow.com/questions/35144821/angular-use-pipes-in-services-and-components
    // https://stackoverflow.com/questions/46715543/how-to-bind-date-time-form-control
    // https://stackoverflow.com/questions/50362854/how-to-change-time-from-24-to-12-hour-format-in-angular-5
    const requiredDateTimeFormat = "yyyy-MM-ddTHH:mm"
    const cestOffset = "UTC";
    const formattedCurrentTime = formatDate(currentTime, requiredDateTimeFormat, this.currentLocale, cestOffset);

    configObj[this.queryTimeStartFormControlName] = new FormControl(formattedCurrentTime);
    configObj[this.queryTimeEndFormControlName] = new FormControl(formattedCurrentTime);
    this.queryTimeFormGroup = new FormGroup(configObj);
  }

  // TODO: move to common
  convertToUtc(date: Date) {
    // https://stackoverflow.com/questions/948532/how-do-you-convert-a-javascript-date-to-utc
    const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
      date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    return new Date(utc);
  }

  onPieChartOpen() {
    this.isQueryDataVisible = false;
    this.isPieChartButtonVisible = false;
    this.isPieChartVisible = true

    this.changeDetectorRef.detectChanges();

    if (this.summarizedTasksByCategory
      && this.summarizedTasksByCategory.length
      && this.summarizedTasksByCategory.length > 0) {

      // index === 0 --> features
      // const categoryDataEntry: number[] = [];
      this.doughnutChartLabels.push([]);
      this.doughnutChartData.push([]);
      this.summarizedTasksByCategory.forEach((oneSummarizedCategory) => {
        this.doughnutChartLabels[0].push(oneSummarizedCategory.category);
        const formattedValue = formatNumber(oneSummarizedCategory.durationSum, this.currentLocale, '1.2-2');
        this.doughnutChartData[0].push(parseFloat(formattedValue));

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
        labels: this.doughnutChartLabels[0],
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
      this.doughnutChartData[0].forEach(() => {
        backgroundColors.push(random_rgba());
      });

      // cf.: https://stackoverflow.com/questions/37257034/chart-js-2-0-doughnut-tooltip-percentages
      // cf.: https://jsfiddle.net/leighking2/q4yaa78c/
      const data: ChartData = {
        labels: this.doughnutChartLabels[0],
        datasets: [{
          data: this.doughnutChartData[0],
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
                const precentage = Math.floor(((currentValue/total) * 100)+0.5);         
                return precentage + "%";
              }
            }
          },
          plugins: [ChartDataLabels]
      };

      const oneChart = new Chart(donutCtx, {
        type: 'doughnut',
        data: data,
        options: options
      });
      oneChart.render();
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

  onQueryTime($event: any) {
    // DEBUGGING
    // console.log($event[this.queryTimeStartFormControlName]);
    // console.log($event[this.queryTimeEndFormControlName]);

    // console.log(this.convertToUtc(new Date($event[this.queryTimeStartFormControlName])).toUTCString());
    // console.log(this.convertToUtc(new Date($event[this.queryTimeEndFormControlName])).toUTCString());
    const startTime = new Date($event[this.queryTimeStartFormControlName]);
    const utcStartTime = this.convertToUtc(startTime);
    const endTime = new Date($event[this.queryTimeEndFormControlName]);
    const utcEndTime = this.convertToUtc(endTime);

    const statisticsPromise = this.commitService.getStatistics(utcStartTime, utcEndTime);
    statisticsPromise.then((stats: string) => {
      const parsedStats: ISummarizedTimeEntries[] = this.sessionStorageSerializationService.deSerialize(stats);
      if (!parsedStats || !parsedStats.length) {
        console.log('no stats received');
        return;
      }
      this.summarizedTasksByCategory = [];
      let outerLoopCtr = 0;
      const outerLoop = () => {
        if (outerLoopCtr >= parsedStats.length) {
          // console.log('done');

          this.isQuerySelectionVisible = false;
          this.isQueryDataVisible = true;
          this.isPieChartButtonVisible = true;
          return;
        }
        const oneParsedStatistics = parsedStats[outerLoopCtr];

        // parsedStats.forEach(oneParsedStatistics => {
        // console.log(JSON.stringify(oneParsedStatistics, null, 4));

        const taskIds = Object.keys(oneParsedStatistics.durationSumByTaskId);
        // console.log(JSON.stringify(taskIds, null, 4));

        if (!taskIds || !taskIds.length) {
          console.error('not taskIds');
          return;
        }

        const tasks = [];
        let taskIdIndex = 0;
        const loop = () => {
          if (taskIdIndex >= taskIds.length) {
            // TODO:
            console.log(JSON.stringify(tasks, null, 4));

            const category = oneParsedStatistics.taskCategory;
            const lines: ITaskLine[] = [];
            tasks.forEach((oneTaskToMerge: ITasksDocument) => {
              const oneTaskToMergeId = oneTaskToMerge.taskId;
              // taskNumber
              const oneLine: ITaskLine = {
                taskNumberUrl: '',
                taskNumber: oneTaskToMerge.number,
                taskDescription: oneTaskToMerge.name,
                durationInHours: oneParsedStatistics.durationSumByTaskId[oneTaskToMergeId],
                durationFraction: oneParsedStatistics.durationSumFractionByTaskId[oneTaskToMergeId]
              };
              // oneLine ['taskNumberUrl'] = '';
              // oneLine['taskNumber'] = ;
              // oneLine['taskDescription'] = ;
              // oneLine['durationInHours'] = ;
              // oneLine['durationFraction'] = ;
              lines.push(oneLine);
            });
            const durationSum = oneParsedStatistics.overallDurationSum;
            const durationFraction = oneParsedStatistics.overallDurationSumFraction;

            this.summarizedTasksByCategory.push({
              category,
              lines,
              durationSum,
              durationFraction
            });

            outerLoopCtr++;
            outerLoop();
            return;
          }
          const oneTaskId = taskIds[taskIdIndex];
          const oneTaskPromise = this.commitService.getTaskByTaskId(oneTaskId);
          oneTaskPromise.then((oneRawTask: string) => {
            // DEBUGGING
            console.log(oneRawTask);

            const oneParsedTask: ITasksDocument[] = this.sessionStorageSerializationService.deSerialize(oneRawTask);
            if (oneParsedTask && oneParsedTask.length === 1) {
              tasks.push(oneParsedTask[0]);
            } else {
              console.error('No task received');
            }

            taskIdIndex++;
            loop();
          });
          oneTaskPromise.catch((error: any) => {
            console.error(JSON.stringify(error, null, 4));
            taskIdIndex++;
            loop();
          });
        };
        // initial call
        loop();

        // });
      };
      // initial call
      outerLoop();
    })
    statisticsPromise.catch((err: any) => {
      console.error(err);
    });
  }

}
