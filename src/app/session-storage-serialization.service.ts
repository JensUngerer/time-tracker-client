import { Injectable } from '@angular/core';
import { Serialization } from './../../../common/typescript/helpers/serialization';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageSerializationService {

  constructor() { }

  public serialize<T>(data: T): string {
    return Serialization.serialize<T>(data);
  }

  public deSerialize<T>(dataStr: string): T {
    return Serialization.deSerialize<T>(dataStr);
  }
}
