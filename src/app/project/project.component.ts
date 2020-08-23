import { SessionStorageSerializationService } from './../session-storage-serialization.service';
import { IDeleteDialogData } from './../typescript/iDeleteDialogData';
import { Subscription, Observable } from 'rxjs';
import { ViewPaths } from './../viewPathsEnum';
import { CommitService } from './../commit.service';
import { ProjectService } from './../project.service';
import { Component, OnInit, Output, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { IProject } from '../../../../common/typescript/iProject';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import routesConfig from './../../../../common/typescript/routes.js';
import * as _ from 'underscore';
import { ProjectDeleteDialogComponent } from '../project-delete-dialog/project-delete-dialog.component';
import { IGridLine } from './../typescript/iGridLine';
import { ITask } from '../../../../common/typescript/iTask';

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
  public gridLines: IGridLine[] = [];

  private afterDialogCloseSubscription$: Observable<boolean> = null;

  private isMemoryReadySubscription: Subscription = null;

  public projectFormGroup: FormGroup = null;

  public formControlNameProjectName = 'theProjectName';

  @Output()
  public onProjectRowClicked(row: IGridLine) {
    const queryParams = {};
    queryParams[routesConfig.projectIdProperty] = row.id;

    const tasksRoutePath = routesConfig.viewsPrefix + ViewPaths.task;
    this.router.navigate([tasksRoutePath], { queryParams });
  }

  @Output()
  public onDeleteRowClicked(row: IGridLine) {
    const dialogData: IDeleteDialogData = {
      line: row,
      headerText: 'Delete project:',
      contentText: ''
    };
    const dialogRef: MatDialogRef<ProjectDeleteDialogComponent, boolean> = this.dialog.open(ProjectDeleteDialogComponent, {
      data: dialogData
    });
    this.afterDialogCloseSubscription$ = dialogRef.afterClosed();
    this.afterDialogCloseSubscription$.subscribe((isOkButtonPressed: boolean) => {
      if (isOkButtonPressed) {
        const dbPatchedPromise: Promise<any> = this.commitService.patchProjectIsDeletedInClient(row.id);
        dbPatchedPromise.then((resolveValue: any) => {
          // DEBUGGING:
          console.log(resolveValue);

          this.drawTable(true);
        });
        dbPatchedPromise.catch((rejectValue: any) => {
          // DEBUGGING:
          // should be never called
          console.error(rejectValue);

          this.drawTable(true);
        });
      }
    });
  }

  public onSubmit(values: any) {
    const projectName = values[this.formControlNameProjectName];
    const project: IProject = this.projectService.createProject(projectName);

    // store in db ? --> necessary but when deleting mark as isLocallyDeleted as true
    const postProjectPromise = this.commitService.postProject(project);
    this.projectFormGroup.controls[this.formControlNameProjectName].setValue('');

    postProjectPromise.then((retrievedResponse: string) => {
      // DEBUGGING:
      // console.log(retrievedResponse);
      // const parsedResponse = this.sessionStorageSerializationService.deSerialize<IProject>(retrievedResponse);
      // console.log(JSON.stringify(parsedResponse, null, 4));

      this.drawTable(true);
    });
    postProjectPromise.catch(() => {
      this.drawTable(true);
    })

  }

  constructor(private projectService: ProjectService,
    private commitService: CommitService,
    private router: Router,
    public dialog: MatDialog,
    private sessionStorageSerializationService: SessionStorageSerializationService) {
    const configObj: { [key: string]: AbstractControl } = {};
    configObj[this.formControlNameProjectName] = new FormControl('');

    this.projectFormGroup = new FormGroup(configObj);

    // this.isMemoryReadySubscription = this.inMemoryDataService.getIsReady().subscribe((isReady: boolean) => {
    //   if (isReady) {
    //     this.drawTable(true);
    //   }
    // });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.drawTable(true);
  }

  ngOnDestroy() {
    if (this.isMemoryReadySubscription) {
      this.isMemoryReadySubscription.unsubscribe();
    }
  }

  private setCloneGridLines() {
    this.gridLines = [];
    const projectsStrPromise = this.commitService.getProjects();
    projectsStrPromise.then((projectsStr: string) => {
      const projects = this.sessionStorageSerializationService.deSerialize<IProject[]>(projectsStr);
      if (!projects || !projects.length || projects.length === 0) {
        console.error(JSON.stringify(projects));
        console.error('no projects to display');
        return;
      }

      projects.forEach((oneProject: IProject) => {
        const gridLine: IGridLine = {
          codeOrNumberUrl: '',
          codeOrNumber: '',
          name: oneProject.name,
          id: oneProject.projectId,
          deleteRow: ''
        };
        this.gridLines.push(gridLine);
      });
    });
    projectsStrPromise.catch(() => {
      console.error('getProjects rejected');
    });
  }

  private drawTable(resetRows: boolean) {
    if (resetRows) {
      this.setCloneGridLines();
    }
  }
}
