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

  public formControlProjectDropDown: AbstractControl = null;

  public projectOptions: IProjectOption[] = [];

  public dataSource: MatTableDataSource<IGridCommitLine> = null;

  public displayedColumns: string[] = [
    'description',
    // 'startTime',
    // 'endTime',
    'durationStr'
  ];

  public rawLinesToCommit: IGridCommitLine[] = null;

  constructor(private projectService: ProjectService,
              private commitService: CommitService) {
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

    this.rawLinesToCommit = this.projectService.summarizeDurationFor(projectId);


    // this.projectDurationsBuffer = JSON.stringify(summarizedDurationStringForOneProject, null, 4);
    this.dataSource = new MatTableDataSource(this.rawLinesToCommit);
  }

  public onCommitClicked(values: any) {
    const sumLine: IGridCommitLine = this.rawLinesToCommit[this.rawLinesToCommit.length - 1];

    const projectId = values[this.formControlNameProjectDropDown].projectId;

    this.commitService.postCommit({
      _id: 'anyIdWithWillBeReplaced',
      dateStructure: sumLine.dateStructure,
      _taskIds: sumLine._taskIds,
      durationStructure: sumLine.durationStructure,
      _projectId: projectId
    }).then(() => {
      console.log('then');
    }).catch(() => {
      console.log('catch');
    });
  }

}
