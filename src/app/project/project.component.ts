import { Subscription, Observable } from 'rxjs';
import { ViewPaths } from './../viewPathsEnum';
import { CommitService } from './../commit.service';
import { ProjectService } from './../project.service';
import { Component, OnInit, Output, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { IProject } from '../../../../common/typescript/iProject';
import { MatTableDataSource, MatTable, MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import * as routesConfig from './../../../../common/typescript/routes.js';
import * as _ from 'underscore';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ProjectDeleteDialogComponent } from '../project-delete-dialog/project-delete-dialog.component';


export interface IProjectGridLine extends IProject {
  deleteRow: string;
}

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

  private gridLines: IProjectGridLine[] = [];

  private afterDialogCloseSubscription$: Observable<boolean> = null;

  public faTrash = faTrash;

  @ViewChild(MatTable, { static: false })
  public theTable: MatTable<IProjectGridLine>;

  public projectFormGroup: FormGroup = null;

  public formControlNameProjectName = 'theProjectName';

  @Output()
  public displayedColumns: string[] = ['name', 'deleteRow'];

  @Output()
  public dataSource: MatTableDataSource<IProjectGridLine> = null;

  @Output()
  public onProjectRowClicked(row: IProjectGridLine) {
    const tasksRoutePath = routesConfig.viewsPrefix + ViewPaths.task;
    this.router.navigate([tasksRoutePath]);
  }

  @Output()
  public onDeleteRowClicked(row: IProjectGridLine) {
    const dialogRef: MatDialogRef<ProjectDeleteDialogComponent, boolean> = this.dialog.open(ProjectDeleteDialogComponent, {
      data: row
    });
    this.afterDialogCloseSubscription$ = dialogRef.afterClosed();
    this.afterDialogCloseSubscription$.subscribe((isOkButtonPressed: boolean) => {
      if (isOkButtonPressed) {
        this.projectService.deleteProject(row.projectId);
        this.drawTable(true);
      }
    });
  }

  public onSubmit(values: any) {
    const projectName = values[this.formControlNameProjectName];
    const project: IProject = this.projectService.addProject(projectName);

    // TODO: no longer store in db
    // this.commitService.postProject(project);

    this.projectFormGroup.controls[this.formControlNameProjectName].setValue('');
    this.drawTable(true);
  }

  constructor(private projectService: ProjectService,
    private commitService: CommitService,
    private router: Router,
    public dialog: MatDialog) {
    const configObj: { [key: string]: AbstractControl } = {};
    configObj[this.formControlNameProjectName] = new FormControl('');

    this.projectFormGroup = new FormGroup(configObj);

    this.dataSource = new MatTableDataSource(this.gridLines);
    this.setCloneGridLines();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.drawTable(false);
  }

  private setCloneGridLines() {
    this.gridLines = [];
    const projects = this.projectService.getProjects();

    if (!projects || projects.length === 0) {
      this.dataSource.data = this.gridLines;
      return;
    }

    projects.forEach((oneProject: IProject) => {
      const clonedLine: IProjectGridLine = _.clone(oneProject) as IProjectGridLine;
      clonedLine.deleteRow = '';
      this.gridLines.push(clonedLine);
    });
    this.dataSource.data = this.gridLines;
  }

  private drawTable(resetRows: boolean) {
    if (resetRows) {
      this.setCloneGridLines();
    }

    this.theTable.renderRows();
  }
}
