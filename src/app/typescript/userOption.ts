import { IUser } from '../../../../common/typescript/iUser';

export interface IUserOption {
  value: IUser;
  viewValue: string;
}

export class UserOption implements IUserOption {
  constructor(public value: IUser) { }

  public get viewValue(): string {
    return this.value.name + ' ' + this.value.surname;
  }
}
