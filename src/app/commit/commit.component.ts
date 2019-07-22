import { ProjectService } from './../project.service';
import { IProjectOption, ProjectOption } from './../typescript/projectOption';
import { Component, OnInit, Output } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { IProject } from '../../../../common/typescript/iProject';
import { HelpersService } from '../helpers.service';
import { CommitService } from '../commit.service';
import { ITimeRecordsDocumentData } from '../../../../common/typescript/mongoDB/iTimeRecordsDocument';

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

  private sumForOneProject: ITimeRecordsDocumentData = null;

  constructor(private projectService: ProjectService,
              private commitService: CommitService,
              private helpersService: HelpersService) {
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
    const projectId = $event.value.projectId;

    this.sumForOneProject = this.projectService.summarizeDurationFor(projectId);

    this.durationStr = this.helpersService.getDurationStr(this.sumForOneProject.durationStructure.hours,
      this.sumForOneProject.durationStructure.minutes);
  }

  public onCommitClicked(values: any) {
    this.commitService.postCommit(this.sumForOneProject).then(() => {
      console.log('then');
    }).catch(() => {
      console.log('catch');
    });
  }
}
