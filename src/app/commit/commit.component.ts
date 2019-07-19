import { ProjectService } from './../project.service';
import { IProjectOption, ProjectOption } from './../typescript/projectOption';
import { Component, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, FormControl } from '@angular/forms';
import { IProject } from '../../../../common/typescript/iProject';
import { MatTableDataSource } from '@angular/material';
import { ICommitLine } from './../typescript/iCommitLine'

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

  public dataSource: MatTableDataSource<ICommitLine> = null;

  public displayedColumns: string[] = [
    'description',
    // 'startTime',
    // 'endTime',
    'durationStr'
  ];

  public rawLinesToCommit: ICommitLine[] = null;

  constructor(private formBuilder: FormBuilder,
              private projectService: ProjectService) { }

  ngOnInit() {
    const configObj: {[key: string]: AbstractControl} = {};
    configObj[this.formControlNameProjectDropDown] = new FormControl('');

    this.commitFormGroup = this.formBuilder.group(configObj);

    const allProjects = this.projectService.getProjects();
    if(allProjects && allProjects.length > 0) {
      allProjects.forEach((project: IProject)=>{
        this.projectOptions.push(new ProjectOption(project));
      });
    }
  }

  public onProjectSelectionChanged($event: any) {
    console.log($event.value.projectId);
    const projectId = $event.value.projectId;

    this.rawLinesToCommit = this.projectService.summarizeDurationFor(projectId);
    // this.projectDurationsBuffer = JSON.stringify(summarizedDurationStringForOneProject, null, 4);
    this.dataSource = new MatTableDataSource(this.rawLinesToCommit);
  }

  public onCommitClicked() {
    console.error(this.rawLinesToCommit[this.rawLinesToCommit.length - 1].durationStr);
  }

}
