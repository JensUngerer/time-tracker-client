import { formatDate } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { Constants } from '../../../common/typescript/constants';
import { QueryTimeBoundariesComponent } from './query-time-boundaries/query-time-boundaries.component';

@Injectable({
  providedIn: 'root'
})
export class TimeEntryHelperService {

  constructor(@Inject(LOCALE_ID) private currentLocale) { }

  getCurrentTime(): string {
    let currentTime = Date.now();
    // add one minute as time is measured < and not <=
    currentTime += Constants.MILLISECONDS_IN_MINUTE;
    const formattedCurrentTime = formatDate(currentTime, QueryTimeBoundariesComponent.requiredDateTimeFormat, this.currentLocale);
    return formattedCurrentTime;
  }

  getStartTimeFormatted(dateToFormat: Date) {
    if (!dateToFormat) {
      return '';
    }
    let currentTime = dateToFormat.getTime();
    currentTime += Constants.MILLISECONDS_IN_MINUTE;

    const formattedCurrentTime = formatDate(currentTime, QueryTimeBoundariesComponent.requiredDateTimeFormat, this.currentLocale);
    return formattedCurrentTime;
  }

  getEndTimeFormatted(dateToFormat: Date) {
    if (!dateToFormat) {
      return '';
    }
    let currentTime = dateToFormat.getTime();
    currentTime -= Constants.MILLISECONDS_IN_MINUTE;

    const formattedCurrentTime = formatDate(currentTime, QueryTimeBoundariesComponent.requiredDateTimeFormat, this.currentLocale);
    return formattedCurrentTime;
  }

  formatDate(date: Date) {
    return formatDate(date, QueryTimeBoundariesComponent.requiredDateTimeFormat, this.currentLocale);
  }
}
