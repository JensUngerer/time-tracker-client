import { ProjectService } from './../project.service';
import { IProjectOption, ProjectOption } from './../typescript/projectOption';
import { Component, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, FormControl } from '@angular/forms';
import { IProject } from '../../../../common/typescript/iProject';
import { MatTableDataSource } from '@angular/material';
// import { ICommitLine } from './../typescript/iCommitLine'
import { HelpersService } from '../helpers.service';
import { CommitService } from '../commit.service';
import { IGridCommitLine } from './../../../../common/typescript/iGridCommitLine';

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

  public projectOptions: IProjectOption[] = [];

  public dataSource: MatTableDataSource<IGridCommitLine> = null;

  public displayedColumns: string[] = [
    'description',
    // 'startTime',
    // 'endTime',
    'durationStr'
  ];

  private currentProjectId: string = null;

  public rawLinesToCommit: IGridCommitLine[] = null;

  constructor(private formBuilder: FormBuilder,
    private projectService: ProjectService,
    private helpersService: HelpersService,
    private commitService: CommitService) { }

  ngOnInit() {
    const configObj: { [key: string]: AbstractControl } = {};
    configObj[this.formControlNameProjectDropDown] = new FormControl('');

    this.commitFormGroup = this.formBuilder.group(configObj);

    const allProjects = this.projectService.getProjects();
    if (allProjects && allProjects.length > 0) {
      allProjects.forEach((project: IProject) => {
        this.projectOptions.push(new ProjectOption(project));
      });
    }
  }

  public onProjectSelectionChanged($event: any) {
    const projectId = $event.value.projectId;

    this.currentProjectId = projectId;

    this.rawLinesToCommit = this.projectService.summarizeDurationFor(projectId);
    // this.projectDurationsBuffer = JSON.stringify(summarizedDurationStringForOneProject, null, 4);
    this.dataSource = new MatTableDataSource(this.rawLinesToCommit);
  }

  public onCommitClicked() {
    const sumLine: IGridCommitLine = this.rawLinesToCommit[this.rawLinesToCommit.length - 1];

    // const theProjectFormControl: AbstractControl = this.commitFormGroup.controls[this.formControlNameProjectDropDown];
    // let projectId = '';
    // if (theProjectFormControl) {
    //   projectId = theProjectFormControl.value.projectId;
    // }
    // console.error(sumLine.durationStr);
    // console.error(this.helpersService.getCurrentDateStr(sumLine.endTime));
    console.error(JSON.stringify(sumLine, null, 4));
    this.commitService.postCommit({
      _id: 'anyIdWithWillBeReplaced',
      dateStructure: sumLine.dateStructure,
      descriptionArray: sumLine.descriptionArr,
      durationStructure: sumLine.durationStructure,
      _projectId: this.currentProjectId
    }).then(() => {
      console.log('then');
    }).catch(() => {
      console.log('catch');
    });
  }

}
