import { IBookingDeclaration } from '../../../../common/typescript/iBookingDeclaration';

export interface IBookingDeclarationOption {
  value: IBookingDeclaration,
  viewValue: string;
}

export class BookingDeclarationOption implements IBookingDeclarationOption {
  constructor(public value: IBookingDeclaration){
  }
  get viewValue() {
    return this.value.description;
  }
}


