import { ViewPaths } from './../viewPathsEnum';
import { CommitService } from './../commit.service';
import { ProjectService } from './../project.service';
import { Component, OnInit, Output, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { IProject } from '../../../../common/typescript/iProject';
import { MatTableDataSource, MatTable } from '@angular/material';
import { Router } from '@angular/router';
import * as routesConfig from './../../../../common/typescript/routes.js';

// export interface IProjectGridLine extends IProject {
//   deleteRow: string;
// }

@Component({
  selector: 'mtt-project',
  templateUrl: './project.component.html',
  styleUrls: [
    './project.component.scss',
    './../css/centerVerticalHorizontal.scss'
  ]
})
export class ProjectComponent implements OnInit, AfterViewInit {

  public static projectIdPropertyName = 'projectId';

  private gridLines: IProject[] = [];

  @ViewChild(MatTable, {static: false})
  public theTable: MatTable<IProject>;

  public projectFormGroup: FormGroup = null;

  public formControlNameProjectName = 'theProjectName';

  @Output()
  public displayedColumns: string[] = ['name'];

  @Output()
  public dataSource: MatTableDataSource<IProject> = null;

  @Output()
  public onProjectRowClicked(row: IProject) {
    const tasksRoutePath = routesConfig.viewsPrefix + ViewPaths.task;
    this.router.navigate([tasksRoutePath]);
  }

  public onSubmit(values: any) {
    const projectName = values[this.formControlNameProjectName];
    const project: IProject = this.projectService.addProject(projectName);

    this.commitService.postProject(project);

    this.projectFormGroup.controls[this.formControlNameProjectName].setValue('');
    this.drawTable(true);
  }

  constructor(private projectService: ProjectService,
              private commitService: CommitService,
              private router: Router) {
    const configObj: {[key: string]: AbstractControl} = {};
    configObj[this.formControlNameProjectName] = new FormControl('');

    this.projectFormGroup = new FormGroup(configObj);

    this.gridLines = this.projectService.getProjects();
    this.dataSource = new MatTableDataSource(this.gridLines);
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.drawTable(false)
  }

  private drawTable(resetRows: boolean) {
    if (resetRows) {
      this.gridLines = this.projectService.getProjects();

      this.dataSource.data = this.gridLines;
    }

    this.theTable.renderRows();
  }

}
