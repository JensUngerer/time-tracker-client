import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IGridCommitLine } from './../../../common/typescript/iGridCommitLine';
import routesConfig from './../../../common/typescript/routes';

@Injectable({
  providedIn: 'root'
})
export class CommitService {

  constructor(private httpClient: HttpClient) { }


  public postCommit(line: IGridCommitLine): Promise<any> {
    return new Promise<any>((resolve: (value: any) => void) => {
      const url = 'http://localhost:3000' + routesConfig.timeRecord;
      const body: any = {
        line
      };
      const options: any = {
        'Content-Type': 'application/json'
      };
      this.httpClient.post(url, body, options).subscribe((subscriptionValue: any) => {
        resolve(subscriptionValue);
      });
    });
  }
}
