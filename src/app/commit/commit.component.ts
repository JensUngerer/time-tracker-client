import { InMemoryDataService } from './../in-memory-data.service';
import { ProjectService } from './../project.service';
import { IProjectOption, ProjectOption } from './../typescript/projectOption';
import { Component, OnInit, Output } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { IProject } from '../../../../common/typescript/iProject';
import { HelpersService } from '../helpers.service';
import { CommitService } from '../commit.service';
import { ITimeRecordsDocumentData } from '../../../../common/typescript/mongoDB/iTimeRecordsDocument';
import { IDuration } from '../../../../common/typescript/iDuration';

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

  public projectOptions: IProjectOption[] = [];

  @Output()
  public durationStr: string = null;

  @Output()
  public isButtonDisabled = false;

  private sumForOneProject: ITimeRecordsDocumentData = null;

  constructor(private projectService: ProjectService,
    private commitService: CommitService,
    private helpersService: HelpersService,
    private inMemoryDataService: InMemoryDataService) {
    const configObj: { [key: string]: AbstractControl } = {};

    this.formControlProjectDropDown = new FormControl('');
    configObj[this.formControlNameProjectDropDown] = this.formControlProjectDropDown;

    this.commitFormGroup = new FormGroup(configObj);

    const allProjects = this.projectService.getProjects();
    if (allProjects && allProjects.length > 0) {
      allProjects.forEach((project: IProject) => {
        this.projectOptions.push(new ProjectOption(project));
      });
    }
  }

  ngOnInit() {

  }

  public onProjectSelectionChanged($event: any) {
    // while the server get is running do not enable the commit button!
    this.isButtonDisabled = true;

    const projectId = $event.value.projectId;

    const durationStructurePromise = this.commitService.getDurationStructure(projectId);
    durationStructurePromise.then((theDurationStructureStr: string) => {
      if (!theDurationStructureStr) {
        return;
      }
      const sumForOneProject: ITimeRecordsDocumentData = JSON.parse(theDurationStructureStr);

      // DEBUGGING:
      // console.log(durationStructure, null, 4);
      this.sumForOneProject = sumForOneProject;
      if (!this.sumForOneProject) {
        console.error('there is no sum for the project');
        return;
      }

      this.durationStr = this.helpersService.getDurationStr(sumForOneProject.durationStructure.hours,
        sumForOneProject.durationStructure.minutes);
      this.isButtonDisabled = false;
    });
    durationStructurePromise.catch(() => {
      console.error('no duration structure retrieved');
    });

    // this.sumForOneProject = this.projectService.summarizeDurationFor(projectId);

    // if (this.sumForOneProject) {
    //   this.durationStr = this.helpersService.getDurationStr(this.sumForOneProject.data.durationStructure.hours,
    //     this.sumForOneProject.data.durationStructure.minutes);
    //   this.isButtonDisabled = false;
    // } else {
    //   this.durationStr = 'no time-entries to sum';
    //   this.isButtonDisabled = true;
    // }
  }


  public onCommitClicked(values: any) {
    if (this.sumForOneProject) {
      this.durationStr = '';
      this.formControlProjectDropDown.setValue('');

      // DEBUGGING:
      // console.log(JSON.stringify(this.sumForOneProject, null, 4));
      const commitPostPromise = this.commitService.postCommit(this.sumForOneProject);
      commitPostPromise.then((resolvedValue: any) => {
        console.log(JSON.stringify(resolvedValue, null, 4));
      });
      commitPostPromise.catch((rejectedValue: any) => {
        console.log(JSON.stringify(rejectedValue, null, 4));
      });
    } else {
      console.error('cannot commit because of missing duration sum');
    }

    //   if (this.sumForOneProject) {
    //     this.commitService.postCommit(this.sumForOneProject.data).then(() => {

    //       // TODO: implement deleting of timeEntries on server
    //       // this.inMemoryDataService.clearTimeEntries(this.sumForOneProject.timeEntryIds);

    //       this.durationStr = '';
    //       this.formControlProjectDropDown.setValue('');
    //     }).catch(() => {
    //       console.log('catch');
    //       this.durationStr = '';
    //       this.formControlProjectDropDown.setValue('');
    //     });
    //   } else {
    //     console.error('commit is not possible');
    //     this.durationStr = '';
    //     this.formControlProjectDropDown.setValue('');
    //   }
    // }
  }
}
