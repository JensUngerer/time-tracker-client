import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ITimeRecordsDocumentData } from './../../../common/typescript/mongoDB/iTimeRecordsDocument';
import routes from './../../../common/typescript/routes.js';
import { IProject } from '../../../common/typescript/iProject';
import { ITask } from '../../../common/typescript/iTask';
import { ITimeEntry } from '../../../common/typescript/iTimeEntry';
import { IBookingDeclaration } from '../../../common/typescript/iBookingDeclaration';

@Injectable({
  providedIn: 'root'
})
export class CommitService {

  private readonly httpBaseUrl = 'http://localhost:';

  constructor(private httpClient: HttpClient) { }

  getBookingDeclarationsBy(projectId: string) {
    const url = this.getBookingDeclarationUrl() + routes.bookingDeclarationsByProjectIdSuffix + '/' + projectId;
    return this.httpGet(url);
  }

  postBookingDeclaration(bookingDeclaration: IBookingDeclaration) {
    const url = this.getBookingDeclarationUrl();
    this.httpPost(routes.bookingDeclarationProperty, bookingDeclaration, url);
  }

  public getTimeEntriesByTaskId(taskId: string) {
    const timeEntryUrl = this.getTimeEntriesUrl() + routes.timeEntriesViaTaskIdSuffix + '/' + taskId;
    return this.httpGet(timeEntryUrl);
  }

  public deleteTimeEntryByTaskId(taskId: string) {
    const url = this.getTimeEntriesUrl() + '/' + routes.deleteTimeEntryByTaskIdSuffix + '/' + taskId;
    return this.httpDelete(url);
  }

  private getBookingDeclarationUrl(): string {
    const url = this.httpBaseUrl + routes.port + routes.bookingDeclaration;
    return url;
  }

  private httpDelete(url: string) {
    return new Promise<any>((resolve: (value: any) => void) => {
      this.httpClient.delete(url).subscribe((subscriptionResolveValue: any) => {
        resolve(subscriptionResolveValue);
      });
    });
  }

  private getTimeEntriesUrl(): string {
    const url = this.httpBaseUrl + routes.port + routes.timeEntries;
    return url;
  }

  public getDurationStructure(projectId: string): Promise<string> {
    const url = this.getTimeEntriesUrl() + routes.timeEntriesDurationSumSuffix + '/' + projectId;
    return this.httpGet(url);
  }

  public getDuration(timeEntryId: string): Promise<string> {
    const url = this.getTimeEntriesUrl() + routes.timeEntriesDurationSuffix + '/' + timeEntryId;
    return this.httpGet(url);
  }

  public getTimeEntries(): Promise<string> {
    const url = this.getTimeEntriesUrl();
    return this.httpGet(url);
  }

  public patchTimeEntriesIsDeletedInClient(timeEntriesId: string): Promise<any> {
    const url = this.getTimeEntriesUrl();
    const body: any = {};

    body[routes.httpPatchIdPropertyName] = routes.timeEntriesProperty;
    body[routes.httpPatchIdPropertyValue] = timeEntriesId;

    body[routes.httpPatchIdPropertyToUpdateName] = routes.isDeletedInClientProperty;
    body[routes.httpPatchIdPropertyToUpdateValue] = true;

    return this.performHttpPatch(url, body);
  }

  public postTimeEntriesPause(timeEntryId: string): Promise<any> {
    const url = this.getTimeEntriesUrl() + routes.timeEntryPausePathSuffix;
    const body: any = {};

    body[routes.httpPatchIdPropertyName] = routes.timeEntryIdProperty;
    body[routes.httpPatchIdPropertyValue] = timeEntryId;

    return new Promise<any>((resolve: (value: any) => void) => {
      this.httpClient.post(url, body).subscribe((subscriptionValue: any) => {
        resolve(subscriptionValue);
      });
    });
  }

  public postTimeEntries(timeEntry: ITimeEntry): Promise<any> {
    const url = this.getTimeEntriesUrl();

    const propertyName = routes.timeEntriesBodyProperty;

    return this.httpPost(propertyName, timeEntry, url);
  }

  private getProjectsUrl(): string {
    const url = this.httpBaseUrl + routes.port + routes.project;
    return url;
  }

  private getTaskUrl(): string {
    const url = this.httpBaseUrl + routes.port + routes.task;
    return url;
  }

  public patchTimeEntriesStopPause(timeEntryId: string): Promise<any> {
    const url = this.getTimeEntriesUrl() + routes.timeEntryPausePathSuffix;
    const body: any = {};
    body[routes.httpPatchIdPropertyName] = routes.timeEntryIdProperty;
    body[routes.httpPatchIdPropertyValue] = timeEntryId;
    return this.performHttpPatch(url, body);
  }

  public patchTimeEntriesStop(timeEntryId: string): Promise<any> {
    const url = this.getTimeEntriesUrl() + routes.timeEntriesStopPathSuffix;
    const body: any = {};
    body[routes.httpPatchIdPropertyName] = routes.timeEntryIdProperty;
    body[routes.httpPatchIdPropertyValue] = timeEntryId;

    // further body properties are not necessary as in /NodeJS/timeEntries/stop an endTime-timestamp will be set!

    return this.performHttpPatch(url, body);
  }

  // TODO: use this after committing a timeRecord
  public patchTimeEntriesDelete(timeEntryId): Promise<any> {
    const url = this.getTimeEntriesUrl() + routes.timeEntriesDeletePathSuffix;
    const body: any = {};
    body[routes.httpPatchIdPropertyName] = routes.timeEntryIdProperty;
    body[routes.httpPatchIdPropertyValue] = timeEntryId;

    // further body properties are not necessary as in /NodeJS/timeEntries/entries the isDeletedInClient property will be set to true

    return this.performHttpPatch(url, body);
  }

  public patchProjectIsDeletedInClient(projectId: string): Promise<any> {
    const url = this.getProjectsUrl();
    const body: any = {};
    body[routes.httpPatchIdPropertyName] = routes.projectIdProperty;
    body[routes.httpPatchIdPropertyValue] = projectId;

    body[routes.httpPatchIdPropertyToUpdateName] = routes.isDeletedInClientProperty;
    body[routes.httpPatchIdPropertyToUpdateValue] = true;

    return this.performHttpPatch(url, body);
  }

  private performHttpPatch(url: string, body: any): Promise<any> {
    return new Promise<any>((resolve: (value: any) => void) => {
      this.httpClient.patch(url, body).subscribe((subscriptionReturnValue: any) => {
        resolve(subscriptionReturnValue);
      });
    });
  }

  public postTask(task: ITask) {
    const url = this.getTaskUrl();
    return this.httpPost(routes.taskBodyProperty, task, url);
  }

  public deleteTask(taskId: string) {
    const url = this.getTaskUrl();
    const body: any = {};

    body[routes.httpPatchIdPropertyName] = routes.taskIdProperty;
    body[routes.httpPatchIdPropertyValue] = taskId;

    body[routes.httpPatchIdPropertyToUpdateName] = routes.isDeletedInClientProperty;
    body[routes.httpPatchIdPropertyToUpdateValue] = true;

    return this.performHttpPatch(url, body);
  }

  public postProject(project: IProject) {
    const url = this.getProjectsUrl();
    return this.httpPost(routes.projectBodyProperty, project, url);
  }

  public postCommit(line: ITimeRecordsDocumentData): Promise<any> {
    const url = this.httpBaseUrl + routes.port + routes.timeRecord;
    return this.httpPost(routes.timeRecordBodyProperty, line, url);
  }

  public getTasksByProjectId(projectId: string): Promise<string> {
    const url = this.getTaskUrl() + '/' + projectId;
    return this.httpGet(url);
  }

  private httpPost(propertyName: string, data: any, url: string): Promise<any> {
    return new Promise<any>((resolve: (value: any) => void) => {
      const body: any = {};
      body[propertyName] = data;

      const options: any = {
        'Content-Type': 'application/json'
      };
      this.httpClient.post(url, body, options).subscribe((subscriptionValue: any) => {
        resolve(subscriptionValue);
      });
    });
  }

  public getTasks(): Promise<string> {
    const url = this.httpBaseUrl + routes.port + routes.task;
    return this.httpGet(url);
  }

  public getProjects(): Promise<string> {
    const url = this.getProjectsUrl();
    return this.httpGet(url);
  }

  private httpGet(url: string): Promise<string> {
    return new Promise<string>((resolve: (values: string) => void, reject: (value: any) => void) => {
      const options: any = {
        headers: {
          'Content-Type': 'application/json'
        },
        reportProgress: true,
        responseType: 'text'
      };
      this.httpClient.get(url, options).subscribe((subscriptionReceivedData: any) => {
        resolve(subscriptionReceivedData);
      });
    });
  }
}
