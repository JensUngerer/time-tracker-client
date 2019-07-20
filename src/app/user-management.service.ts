import { InMemoryDataService } from './in-memory-data.service';
import { Injectable } from '@angular/core';
import { IUser } from '../../../common/typescript/iUser';
import uuid from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  private readonly usersPropertyName = 'users';

  constructor(private inMemoryDataService: InMemoryDataService) { }

  // public addUser(surname: string, name: string) {
  //   const userData: IUser = {
  //     name,
  //     surname,
  //     userId: uuid.v4()
  //   };
  //   this.inMemoryDataService.push(this.usersPropertyName, userData);
  // }

  // public getUsers(): IUser[] {
  //   return this.inMemoryDataService.get(this.usersPropertyName);
  // }
}
