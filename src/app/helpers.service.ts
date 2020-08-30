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
      day: theDate.getDate(),
      month: theDate.getMonth() + 1,
      year: theDate.getFullYear()
    };
  }

  public getTimeDifferenceInMilliseconds(endTime: Date, startTime: Date): number {
    const theDuration = endTime.getTime() - startTime.getTime();
    return theDuration;
  }

  public getTimeDifferenceString(theDuration: number): string {
    theDuration = Math.floor(theDuration / 1000);
    const durationInSeconds = theDuration % 60;
    theDuration = Math.floor(theDuration / 60);
    const durationInMinutes = theDuration % 60;
    theDuration = Math.floor(theDuration / 60);
    const durationInHours = theDuration % 60;

    return this.getDurationStr(durationInHours, durationInMinutes, durationInSeconds);
  }

  public millisecondsInMinutes(durationInMilliseconds): number {
    return Math.floor(durationInMilliseconds / (60 * 1000));
  }

  public getCurrentDateStr(theDate: Date) {
    return theDate.getDate() + ':' + (theDate.getMonth() + 1) + ':' + theDate.getFullYear();
  }
}
