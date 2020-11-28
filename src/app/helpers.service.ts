import { IDate } from './../../../common/typescript/iDate';
import { Injectable } from '@angular/core';
import { IDuration } from './../../../common/typescript/iDuration';

@Injectable({
  providedIn: 'root'
})
export class HelpersService {

  constructor() { }

  public ensureTwoDigits(aNumber: number): string {
    if (aNumber <= 9) {
      return '0' + aNumber;
    }
    return aNumber.toString();
  }

  public getDurationStr(hours: number, minutes: number, seconds: number): string {
    return this.ensureTwoDigits(hours) + ':' + this.ensureTwoDigits(minutes) + ':' + this.ensureTwoDigits(seconds);
  }

  public getDurationStructure(hours: number, minutes: number): IDuration {
    return { hours, minutes, seconds: 0};
  }

  public getDateStructure(theDate: Date): IDate {
    return {
      dayOfMonth: theDate.getDate(),
      month: theDate.getMonth() + 1,
      year: theDate.getFullYear()
    };
  }

  public getTimeDifferenceInMilliseconds(endTime: Date, startTime: Date): number {
    const theDuration = endTime.getTime() - startTime.getTime();
    return theDuration;
  }

  public getCurrentDateStr(theDate: Date) {
    return theDate.getDate() + ':' + (theDate.getMonth() + 1) + ':' + theDate.getFullYear();
  }
}
