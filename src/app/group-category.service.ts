import { Injectable } from '@angular/core';
import { ConfigurationService } from './configuration.service';
import { ITeamCategoryOption } from './typescript/iTeamCategoryOption';

@Injectable({
  providedIn: 'root'
})
export class GroupCategoryService {

  private groupCategories: ITeamCategoryOption[];

  constructor(private configurationService: ConfigurationService) { }

  createTeamCategories() {
    this.groupCategories = this.configurationService.configuration.groupCategories.map((oneTeamCat: string) => {
      return {
        value: oneTeamCat,
        viewValue: oneTeamCat
      };
    });
    return this.groupCategories;
  }
}
