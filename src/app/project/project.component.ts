import { InMemoryDataService } from './../in-memory-data.service';
import { Subscription, Observable } from 'rxjs';
import { ViewPaths } from './../viewPathsEnum';
import { CommitService } from './../commit.service';
import { ProjectService } from './../project.service';
import { Component, OnInit, Output, ViewChild, AfterViewInit, OnDestroy, EventEmitter } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { IProject } from '../../../../common/typescript/iProject';
import { MatTableDataSource, MatTable, MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import routesConfig from './../../../../common/typescript/routes.js';
import * as _ from 'underscore';
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
export class ProjectComponent implements OnInit, AfterViewInit, OnDestroy {

  public static projectIdPropertyName = 'projectId';

  @Output()
  public gridLines: IProjectGridLine[] = [];

  private afterDialogCloseSubscription$: Observable<boolean> = null;

  private isMemoryReadySubscription: Subscription = null;

  public projectFormGroup: FormGroup = null;

  public formControlNameProjectName = 'theProjectName';

  @Output()
  public onProjectRowClicked(row: IProjectGridLine) {
    const queryParams = {};
    queryParams[routesConfig.projectIdProperty] = row.projectId;

    const tasksRoutePath = routesConfig.viewsPrefix + ViewPaths.task;
    this.router.navigate([tasksRoutePath], {queryParams});
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

        // NEW update database with the idDeletedInClient = true flag
        const dbPatchedPromise: Promise<any> = this.commitService.patchProjectIsDeletedInClient(row.projectId);
        dbPatchedPromise.then((resolveValue: any) => {
           console.log(resolveValue);
        });
        dbPatchedPromise.catch((rejectValue: any) => {
          // should be never called
          console.error(rejectValue);
        });
      }
    });
  }

  public onSubmit(values: any) {
    const projectName = values[this.formControlNameProjectName];
    const project: IProject = this.projectService.addProject(projectName);

    // store in db ? --> necessary but when deleting mark as isLocallyDeleted as true
    this.commitService.postProject(project);

    this.projectFormGroup.controls[this.formControlNameProjectName].setValue('');
    this.drawTable(true);
  }

  constructor(private projectService: ProjectService,
              private commitService: CommitService,
              private router: Router,
              public dialog: MatDialog,
              private inMemoryDataService: InMemoryDataService) {
    const configObj: { [key: string]: AbstractControl } = {};
    configObj[this.formControlNameProjectName] = new FormControl('');

    this.projectFormGroup = new FormGroup(configObj);

    this.isMemoryReadySubscription = this.inMemoryDataService.getIsReady().subscribe((isReady: boolean)=>{
      if (isReady) {
        this.drawTable(true);
      }
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.drawTable(false);
  }

  ngOnDestroy() {
    if (this.isMemoryReadySubscription) {
      this.isMemoryReadySubscription.unsubscribe();
    }
  }

  private setCloneGridLines() {
    this.gridLines = [];
    const projects = this.projectService.getProjects();

    if (!projects || projects.length === 0) {
      // this.dataSource.data = this.gridLines;
      console.error('no projects to display');
      return;
    }

    projects.forEach((oneProject: IProject) => {
      const clonedLine: IProjectGridLine = _.clone(oneProject) as IProjectGridLine;
      clonedLine.deleteRow = '';
      this.gridLines.push(clonedLine);
    });
    // this.dataSource.data = this.gridLines;
  }

  private drawTable(resetRows: boolean) {
    if (resetRows) {
      this.setCloneGridLines();
    }
  }
}
