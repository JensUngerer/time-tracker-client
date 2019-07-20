import { IDuration } from '././../../../../common/typescript/iDuration';
import { IDate } from '././../../../../common/typescript/iDate';

export interface ICommitLine {
  description: string;
  startTime: Date;
  endTime: Date;
  durationStructure: IDuration;
  dateStructure: IDate;
}
