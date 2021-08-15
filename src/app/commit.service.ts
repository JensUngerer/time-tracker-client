import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ITimeRecordsDocumentData } from './../../../common/typescript/mongoDB/iTimeRecordsDocument';
import routes from './../../../common/typescript/routes.js';
import { IProject } from '../../../common/typescript/iProject';
import { ITask } from '../../../common/typescript/iTask';
import { ITimeEntry } from '../../../common/typescript/iTimeEntry';
import { IBookingDeclaration } from '../../../common/typescript/iBookingDeclaration';
import { environment } from './../environments/environment';
import { SessionStorageSerializationService } from './session-storage-serialization.service';
import { ITimeInterval } from '../../../common/typescript/iTimeInterval';

@Injectable({
  providedIn: 'root'
})
export class CommitService {
  static httpOptions: any = {
    headers: {
      'Content-Type': 'text/plain'
    },
    reportProgress: true,
    responseType: 'text'
  };

  constructor(private httpClient: HttpClient,
    private sessionStorageSerializationService: SessionStorageSerializationService) { }

  getWorkingTimeEntries(selectedDay: Date) {
    const url = this.getSessionTimeEntryUrl() + routes.workingTimeEntriesSuffix + '/' + selectedDay.getTime();
    return this.httpGet(url);
  }

  getWeeklyWorkingTimeDurationStr() {
    const url = this.getSessionTimeEntryUrl() + routes.weeklyWorkingTimeSuffix;
    return this.httpGet(url);
  }

  getWorkingTimeDurationStr() {
    const url = this.getSessionTimeEntryUrl() + routes.workingTimeSuffix;
    return this.httpGet(url);
  }

  getSessionDuration() {
    const url = this.getSessionTimeEntryUrl();
    return this.httpGet(url);
  }

  getTimeEntriesInInterval(timeInterval: ITimeInterval) {
    const utcStartTime = timeInterval.utcStartTime;
    const utcEndTime = timeInterval.utcEndTime;
    const url = this.getTimeEntriesUrl() +
      routes.timeEntriesIntervalSuffix + '?' +
      routes.startTimeProperty + '=' + utcStartTime.getTime() + '?' +
      routes.endDateProperty + '=' + utcEndTime.getTime() + '?'
    return this.httpGet(url);
  }

  getNonCommittedDays(isBookingBased: boolean) {
    const url = this.getTimeEntriesUrl() +
      routes.nonCommittedDaysSuffix + '?' +
      routes.isBookingBasedPropertyName + '=' + isBookingBased;
    return this.httpGet(url);
  }

  getTaskByTaskId(taskId: string) {
    const url = this.getTaskUrl() + routes.taskIdSuffix + '/' + taskId;
    return this.httpGet(url);
  }

  postCsvFileTrigger(isCsvFileWritten: boolean, utcStartTime: Date, utcEndTime: Date) {
    const url = this.getTimeEntriesUrl() +
      routes.postCsvFileTriggerSuffix;
    const bodyData = {};
    bodyData[routes.isCsvFileWrittenProperty] = isCsvFileWritten;
    bodyData[routes.startTimeProperty] = utcStartTime;
    bodyData[routes.endDateProperty] = utcEndTime;
    return this.httpPost(routes.isCsvWrittenTriggerPropertyName, bodyData, url);
  }

  getStatistics(utcStartTime: Date, utcEndTime: Date, groupCategory: string, isBookingBased: boolean, isTakenCareIsDisabled: boolean) {
    const url = this.getTimeEntriesUrl() +
      routes.timeEntriesStatisticsSufffix + '/' +
      routes.startTimeProperty + '=' + utcStartTime.getTime() + '?' +
      routes.endDateProperty + '=' + utcEndTime.getTime() + '?' +
      routes.groupCategoryPropertyName + '=' + groupCategory + '?' +
      routes.isBookingBasedPropertyName + '=' + isBookingBased + '?' +
      routes.isTakenCareIsDisabledPropertyName + '=' + isTakenCareIsDisabled;
    return this.httpGet(url);
  }

  getTaskById(projectId: string) {
    const url = this.getTaskUrl() + '/' + projectId;
    return this.httpGet(url);
  }

  getTimeEntryById(timeEntryId: string) {
    const url = environment.httpBaseUrl + routes.timeEntries + '/' + timeEntryId;
    return this.httpGet(url);
  }

  getProjectByTaskId(taskId: string) {
    const url = environment.httpBaseUrl + routes.project + routes.projectByTaskIdSuffix + '/' + taskId;
    return this.httpGet(url);
  }

  getRunningTimeEntry() {
    const url = environment.httpBaseUrl + routes.timeEntries + routes.timeEntriesRunningSuffix;
    return this.httpGet(url);
  }

  getDurationSumsForTasks() {
    const url = environment.httpBaseUrl + routes.timeEntries + routes.timeEntriesDurationSumTasksSuffix;
    return this.httpGet(url);
  }

  getCommitDays() {
    const url = environment.httpBaseUrl + routes.timeEntries + routes.timeEntriesDurationSumSuffix;
    return this.httpGet(url);
  }

  getBookingDeclarationById(bookingDeclarationId: string) {
    const url = this.getBookingDeclarationUrl() + '/' + bookingDeclarationId;
    return this.httpGet(url);
  }

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
    const url = environment.httpBaseUrl + routes.bookingDeclaration;
    return url;
  }

  private httpDelete(url: string) {
    return new Promise<any>((resolve: (value: any) => void) => {
      this.httpClient.delete(url).subscribe((subscriptionResolveValue: any) => {
        resolve(subscriptionResolveValue);
      });
    });
  }

  private getSessionTimeEntryUrl(): string {
    const url = environment.httpBaseUrl + routes.sessionTimeEntry;
    return url;
  }

  private getTimeEntriesUrl(): string {
    const url = environment.httpBaseUrl + routes.timeEntries;
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
    const url = environment.httpBaseUrl + routes.project;
    return url;
  }

  private getTaskUrl(): string {
    const url = environment.httpBaseUrl + routes.task;
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

  public stopTimeTrackingByBeacon(timeEntryId: string) {
    // http POST request --> trigger PATCH (routes.timeEntriesStopPathSuffix) in case of really running time-entry
    const url = this.getTimeEntriesUrl() + routes.timeEntriesTryStopSuffix;

    const body: any = {};
    body[routes.httpPatchIdPropertyName] = routes.timeEntryIdProperty;
    body[routes.httpPatchIdPropertyValue] = timeEntryId;

    const stringifiedBody = this.sessionStorageSerializationService.serialize(body);
    window.navigator.sendBeacon(url, stringifiedBody);
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

    body[routes.httpPatchIdPropertyToUpdateName] = routes.isDisabledProperty;
    body[routes.httpPatchIdPropertyToUpdateValue] = true;

    return this.performHttpPatch(url, body);
  }

  private performHttpPatch(url: string, body: any): Promise<any> {
    const serializedBody = this.sessionStorageSerializationService.serialize(body);
    return new Promise<any>((resolve: (value: any) => void) => {
      this.httpClient.patch(url, serializedBody, CommitService.httpOptions).subscribe((subscriptionReturnValue: any) => {
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

    body[routes.httpPatchIdPropertyToUpdateName] = routes.isDisabledProperty;
    body[routes.httpPatchIdPropertyToUpdateValue] = true;

    return this.performHttpPatch(url, body);
  }

  public postProject(project: IProject) {
    const url = this.getProjectsUrl();
    return this.httpPost(routes.projectBodyProperty, project, url);
  }

  public postCommit(collectionName: string, line: ITimeRecordsDocumentData): Promise<any> {
    const url = environment.httpBaseUrl + routes.timeRecord;
    return this.httpPost(routes.timeRecordBodyProperty, line, url, collectionName);
  }

  public getTasksByProjectId(projectId: string): Promise<string> {
    const url = this.getTaskUrl() + '/' + projectId;
    return this.httpGet(url);
  }

  private httpPost(propertyName: string, data: any, url: string, collectionName?: string): Promise<any> {
    return new Promise<any>((resolve: (value: any) => void) => {
      const body: any = {};
      body[propertyName] = data;
      if (collectionName) {
        body[routes.collectionNamePropertyName] = collectionName;
      }
      const stringifiedBody = this.sessionStorageSerializationService.serialize<any>(body);
      this.httpClient.post(url, stringifiedBody, CommitService.httpOptions).subscribe((subscriptionValue: any) => {
        resolve(subscriptionValue);
      });
    });
  }

  public getTasks(): Promise<string> {
    const url = environment.httpBaseUrl + routes.task;
    return this.httpGet(url);
  }

  public getProjects(): Promise<string> {
    const url = this.getProjectsUrl();
    return this.httpGet(url);
  }

  private httpGet(url: string): Promise<string> {
    return new Promise<string>((resolve: (values: string) => void, reject: (value: any) => void) => {

      this.httpClient.get(url, CommitService.httpOptions).subscribe((subscriptionReceivedData: any) => {
        resolve(subscriptionReceivedData);
      });
    });
  }
}
