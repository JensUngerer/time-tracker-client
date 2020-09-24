import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export interface IConfiguration {
  taskBasedIdentifierBaseUrl: string;
  bookingBasedIdentifierBaseUrl: string;
  codeOrNumberBaseUrl: string;
  taskCategories: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  configuration: IConfiguration;

  configurationReceived$ = new BehaviorSubject<boolean>(false);

  constructor(private httpClient: HttpClient) {
    this.httpClient.get('assets/config/config.json').subscribe((configuration: IConfiguration) => {
      this.configuration = configuration;
      this.configurationReceived$.next(true);
    });
  }
}
