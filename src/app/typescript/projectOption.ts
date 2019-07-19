import { IProject } from '../../../../common/typescript/iProject';

export interface IProjectOption {
  value: IProject;
  viewValue: string;
}

export class ProjectOption implements IProjectOption {
  constructor(public value: IProject) { }

  public get viewValue(): string {
    return this.value.name;
  }
}
