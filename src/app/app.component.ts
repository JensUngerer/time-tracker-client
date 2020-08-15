import { Component } from '@angular/core';
import { ConfigurationService } from './configuration.service';

@Component({
  selector: 'mtt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'mtt-client';

  constructor(private configurationService: ConfigurationService)  {
    
  }
}
