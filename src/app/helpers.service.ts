import { Injectable } from '@angular/core';

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

  public getDurationStr(hours: number, minutes: number): string {
    return this.ensureTwoDigits(hours) + ':' + this.ensureTwoDigits(minutes);
  }

  public getFullDurationStr(hours: number, minutes: number, seconds: number) {
    return this.getDurationStr(hours, minutes) + ':' + this.ensureTwoDigits(seconds);
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

    return this.getFullDurationStr(durationInHours, durationInMinutes, durationInSeconds);
  }

  public millisecondsInMinutes(durationInMilliseconds): number {
    return Math.floor(durationInMilliseconds / (60 * 1000));
  }
}
