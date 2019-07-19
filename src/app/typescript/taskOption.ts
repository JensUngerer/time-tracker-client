import { ITask } from '../../../../common/typescript/iTask';

export interface ITaskOption {
  value: ITask;
  viewValue: string;
}

export class TaskOption implements ITaskOption {
  constructor(public value: ITask) { }

  public get viewValue(): string {
    return this.value.name;
  }
}
