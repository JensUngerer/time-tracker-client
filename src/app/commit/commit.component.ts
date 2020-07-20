import { SessionStorageSerializationService } from './../session-storage-serialization.service';
import { ProjectService } from './../project.service';
import { IProjectOption, ProjectOption } from './../typescript/projectOption';
import { Component, OnInit, Output } from '@angular/core';
import { FormGroup, AbstractControl, FormControl, ControlContainer } from '@angular/forms';
import { IProject } from '../../../../common/typescript/iProject';
import { HelpersService } from '../helpers.service';
import { CommitService } from '../commit.service';
import { ITimeRecordsDocumentData } from '../../../../common/typescript/mongoDB/iTimeRecordsDocument';
import  { ICommit } from './../../../../common/typescript/iCommit';
import { IDurationSum } from './../../../../common/typescript/iDurationSum';

interface ICommitOption {
  value: IDurationSum;
  viewValue: Date;
}

class CommitOption implements ICommitOption {
  public viewValue: Date;
  constructor(public value: IDurationSum) {
    this.viewValue = value.day;
  }
}

@Component({
  selector: 'mtt-commit',
  templateUrl: './commit.component.html',
  styleUrls: [
    './commit.component.scss',
    './../css/centerVerticalHorizontal.scss'
  ]
})
export class CommitComponent implements OnInit {

  public commitFormGroup: FormGroup = null;

  public formControlNameProjectDropDown = 'formControlProjectDropDown';

  public formControlProjectDropDown: AbstractControl = null;

  // public projectOptions: IProjectOption[] = [];

  public formControlsMap: {[key: string]: AbstractControl} = {
    DayDropDown: new FormControl('')
  };

  public dayOptions: ICommitOption[] = [];

  // @Output()
  // public durationStr: string = null;

  // @Output()
  public isButtonDisabled = false;

  // private sumForOneProject: ITimeRecordsDocumentData = null;

  // private hasProjectDurationSum(project: IProject): Promise<boolean> {
  //   return new Promise<boolean>((resolve: (value: boolean) => void) => {
  //     const durationStructurePromise = this.commitService.getDurationStructure(project.projectId);
  //     durationStructurePromise.then((theDurationStructureStr: string) => {
  //       if (!theDurationStructureStr) {
  //         resolve(false);
  //         return;
  //       }
  //       const sumForOneProject: ITimeRecordsDocumentData = JSON.parse(theDurationStructureStr);
  //       if (!sumForOneProject) {
  //         resolve(false);
  //       } else {
  //         resolve(true);
  //       }
  //     });
  //   });
  // }

  constructor(private projectService: ProjectService,
    private commitService: CommitService,
    private helpersService: HelpersService,
    private sessionStorageSerializationService: SessionStorageSerializationService) {
    const configObj: { [key: string]: AbstractControl } = {};

    // this.formControlProjectDropDown = new FormControl('');
    // configObj[this.formControlNameProjectDropDown] = this.formControlProjectDropDown;

    this.commitFormGroup = new FormGroup(this.formControlsMap);

    const promise = this.commitService.getCommitDays();
    promise.then((receivedData) => {
      console.log(receivedData);
      const parsedDurationSums: IDurationSum[] = this.sessionStorageSerializationService.deSerialize(receivedData);
      if (!parsedDurationSums || parsedDurationSums.length === 0)  {
        console.error('no duration sums received');
        return;
      }

      parsedDurationSums.forEach((oneDurationSumForOneDay) => {
        this.dayOptions.push(new CommitOption(oneDurationSumForOneDay));
      });

      // const endDate: Date = parsedData[0].day;
      // const year = endDate.getFullYear

      // console.log(parsedData);
    });
    // const allProjectsPromise = this.commitService.getProjects();
    // allProjectsPromise.then((projectsStr) => {
    //   const allProjects: IProject[] = this.sessionStorageSerializationService.deSerialize<IProject[]>(projectsStr);
    //   if (allProjects && allProjects.length > 0) {
    //     allProjects.forEach((project: IProject) => {
    //       this.hasProjectDurationSum(project).then((isDurationSumPresent: boolean) => {
    //         if (!isDurationSumPresent) {
    //           return;
    //         }
    //         this.projectOptions.push(new ProjectOption(project));
    //       }).catch(() => {
    //         console.error('rejection of hasProjectDurationSum');
    //       });
    //     });
    //   }
    // });
    // allProjectsPromise.catch(() => {
    //   console.error('getProjects rejected');
    // });
  }

  ngOnInit() {

  }

  public onDaySelectionChanged() {

  }

  // public onProjectSelectionChanged($event: any) {
  //   // while the server get is running do not enable the commit button!
  //   this.isButtonDisabled = true;

  //   const projectId = $event.value.projectId;

  //   const durationStructurePromise = this.commitService.getDurationStructure(projectId);
  //   durationStructurePromise.then((theDurationStructureStr: string) => {
  //     if (!theDurationStructureStr) {
  //       return;
  //     }
  //     const sumForOneProject: ITimeRecordsDocumentData = JSON.parse(theDurationStructureStr);

  //     // DEBUGGING:
  //     // console.log(durationStructure, null, 4);
  //     this.sumForOneProject = sumForOneProject;
  //     if (!this.sumForOneProject) {
  //       console.error('there is no sum for the project');
  //       return;
  //     }

  //     this.durationStr = this.helpersService.getDurationStr(sumForOneProject.durationStructure.hours,
  //       sumForOneProject.durationStructure.minutes, sumForOneProject.durationStructure.seconds);
  //     this.isButtonDisabled = false;
  //   });
  //   durationStructurePromise.catch(() => {
  //     console.error('no duration structure retrieved');
  //   });
  // }


  public onCommitClicked(values: any) {
    // if (this.sumForOneProject) {
    //   this.durationStr = '';
    //   this.formControlProjectDropDown.setValue('');

    //   // DEBUGGING:
    //   // console.log(JSON.stringify(this.sumForOneProject, null, 4));
    //   const commitPostPromise = this.commitService.postCommit(this.sumForOneProject);
    //   commitPostPromise.then((resolvedValue: any) => {
    //     console.log(JSON.stringify(resolvedValue, null, 4));
    //   });
    //   commitPostPromise.catch((rejectedValue: any) => {
    //     console.log(JSON.stringify(rejectedValue, null, 4));
    //   });
    // } else {
    //   console.error('cannot commit because of missing duration sum');
    // }
  }
}
