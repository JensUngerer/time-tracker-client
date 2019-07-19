import { IDuration } from './iDuration';
import { IDate } from './iDate';

export interface ICommitLine {
  description: string;
  startTime: Date;
  endTime: Date;
  durationStructure: IDuration;
  dateStructure: IDate;
}
