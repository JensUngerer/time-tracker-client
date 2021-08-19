import { Injectable } from '@angular/core';
import { Duration } from 'luxon';
import { Constants } from '../../../common/typescript/constants';
import { ITimeEntryBase } from '../../../common/typescript/iTimeEntry';

@Injectable({
  providedIn: 'root'
})
export class DurationVisualizationService {
  createDurationSumStringFn(timeEntries: ITimeEntryBase[]) {
    let durationSum = Duration.fromObject(Constants.durationInitializationZero);
    durationSum = durationSum.shiftTo(...Constants.shiftToParameter);

    if (timeEntries &&
      timeEntries.length) {
        timeEntries.forEach((oneTimeEntry) => {
            if (!oneTimeEntry.durationInMilliseconds) {
              return;
            }
            const oneDuration = Duration.fromObject(oneTimeEntry.durationInMilliseconds);
            durationSum = durationSum.plus(oneDuration);
            durationSum = durationSum.shiftTo(...Constants.shiftToParameter);
        });
    }

    return () => {
      return durationSum.toFormat(Constants.contextDurationFormat);
    };
  }
  getDurationStr(line: ITimeEntryBase) {
    if (!line ||
      !line.durationInMilliseconds) {
      return '';
    }
    return Duration.fromObject(line.durationInMilliseconds).toFormat(Constants.contextDurationFormat);
  }

  constructor() { }
}
