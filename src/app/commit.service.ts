import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { IGridCommitLine } from './../../../common/typescript/iGridCommitLine';
import routesConfig from './../../../common/typescript/routes';
import { ITimeRecordsDocument } from './../../../common/typescript/mongoDB/iTimeRecordsDocument';

@Injectable({
  providedIn: 'root'
})
export class CommitService {

  constructor(private httpClient: HttpClient) { }

  public postCommit(line: ITimeRecordsDocument): Promise<any> {
    return new Promise<any>((resolve: (value: any) => void) => {
      const url = 'http://localhost:' + routesConfig.port + routesConfig.timeRecord;
      const body: any = {};
      body[routesConfig.timeRecordBodyProperty] = line;
      const options: any = {
        'Content-Type': 'application/json'
      };
      this.httpClient.post(url, body, options).subscribe((subscriptionValue: any) => {
        resolve(subscriptionValue);
      });
    });
  }
}
