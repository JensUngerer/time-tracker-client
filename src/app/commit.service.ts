import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ITimeRecordsDocumentData } from './../../../common/typescript/mongoDB/iTimeRecordsDocument';
import * as routes from './../../../common/typescript/routes.js';
import { IProject } from '../../../common/typescript/iProject';
import { ITask } from '../../../common/typescript/iTask';

@Injectable({
  providedIn: 'root'
})
export class CommitService {

  private readonly httpBaseUrl = 'http://localhost:';

  constructor(private httpClient: HttpClient) { }

  public postTask(task: ITask) {
    const url = this.httpBaseUrl + routes.port + routes.task;
    this.httpPost(routes.taskBodyProperty, task, url);
  }

  public postProject(project: IProject) {
    const url = this.httpBaseUrl + routes.port + routes.project;
    this.httpPost(routes.projectBodyProperty, project, url);
  }

  public postCommit(line: ITimeRecordsDocumentData): Promise<any> {
    const url = this.httpBaseUrl + routes.port + routes.timeRecord;
    return this.httpPost(routes.timeRecordBodyProperty, line, url);
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
    const url = this.httpBaseUrl + routes.port + routes.project;
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
