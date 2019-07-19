import { Injectable } from '@angular/core';
import { IStorageData } from '../../../common/typescript/iStorageData';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageSerializationService {

  constructor() { }

  public serialize(data: IStorageData): string {
    return JSON.stringify(data);
  }

  public deSerialize(dataStr: string): IStorageData {
    // c.f.: https://stackoverflow.com/questions/9194372/why-does-json-stringify-screw-up-my-datetime-object
    const dateTimeReceiver = (key: any, value: any) => {
      if (key === 'startTime' || key === 'endTime') {
        return new Date(value);
      } else {
        return value;
      }
    };
    // https://stackoverflow.com/questions/4511705/how-to-parse-json-to-receive-a-date-object-in-javascript
    // const dateTimeReceiver = (key: any, value: any) => {
    //   let a;
    //   if (typeof value === 'string') {
    //     a = /\/Date\((\d*)\)\//.exec(value);
    //     if (a) {
    //       return new Date(+a[1]);
    //     }
    //   }
    //   return value;
    // };
    return JSON.parse(dataStr, dateTimeReceiver);
  }
}
