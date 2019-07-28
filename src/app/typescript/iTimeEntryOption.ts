import { ITimeEntryDocument } from '../../../../common/typescript/mongoDB/iTimeEntryDocument';

export interface ITimeEntryOption {
  value: ITimeEntryDocument;
  viewValue: string;
}

export class TimeEntryOption implements ITimeEntryOption {
  constructor(public value: ITimeEntryDocument) {
  }

  public get viewValue(): string {
    return this.value.startTime.toISOString();
  }
}
