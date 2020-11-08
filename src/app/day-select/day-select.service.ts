import { Injectable } from '@angular/core';
import { ITimeInterval } from '../../../../common/typescript/iTimeInterval';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';
import { StatsService } from '../stats.service';

@Injectable({
  providedIn: 'root'
})
export class DaySelectService {

  constructor(private statsService: StatsService,
    private sessionStorageSerializationService: SessionStorageSerializationService) { }

  getNonCommittedDays() {
    return new Promise<ITimeInterval[]>((resolve: (value?: ITimeInterval[]) => void) => {
      const nonCommittedDaysPromise = this.statsService.getNonCommittedDays();
      nonCommittedDaysPromise.then((theDays: string) => {
        // DEBUGGING:
        // console.log(theDays);

        const parsedDays: ITimeInterval[] = this.sessionStorageSerializationService.deSerialize(theDays);
        if (!parsedDays ||
          !parsedDays.length) {
          console.error('no days to display:' + parsedDays);
          resolve([]);
          return;
        }
        resolve(parsedDays);
      });
    });
  }
}
