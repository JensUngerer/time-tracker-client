import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigurationService } from '../configuration.service';
import { ITeamCategoryOption } from '../typescript/iTeamCategoryOption';

@Component({
  selector: 'mtt-query-group-category',
  templateUrl: './query-group-category.component.html',
  styleUrls: ['./query-group-category.component.scss']
})
export class QueryGroupCategoryComponent implements OnInit {

  private subscription: Subscription;

  isVisible = false;

  // @Output()
  // formControlNameTeamCat = 'theTeamCategoryFormGroupName';

  @Output()
  formControlNameGroupIds: string[] = [];

  @Output()
  queryGroupCategory: EventEmitter<string> = new EventEmitter();

  @Output()
  queryGroupCategoryFormGroup: FormGroup;

  @Output()
  groupCategories: ITeamCategoryOption[];

  constructor(private configurationService: ConfigurationService) { }

  private createTeamCategories() {
    this.groupCategories = this.configurationService.configuration.groupCategories.map((oneTeamCat: string) => {
      return {
        value: oneTeamCat,
        viewValue: oneTeamCat
      };
    });
  }

  private setInitialValues() {
    const initialValue = true;
    this.formControlNameGroupIds.forEach((oneGroupId: string, index: number)=>{
      this.queryGroupCategoryFormGroup.controls[this.formControlNameGroupIds[index]].setValue(initialValue);
    });
    // this.queryGroupCategory.emit(initialValue);
  }

  private createFormGroup() {
    const configObj = {};
    const baseName = 'theFromControlGroupId';
    this.formControlNameGroupIds = this.groupCategories.map((oneGroupCat, index: number) => {
      const concatName = baseName + index;
      configObj[concatName] = new FormControl(false);
      return concatName;
    });
    // configObj[this.formControlNameTeamCat] = new FormControl('');
    this.queryGroupCategoryFormGroup = new FormGroup(configObj);
    this.setInitialValues();
  }

  private configurationSubscription(nextValue: boolean) {
    if (!nextValue) {
      return;
    }
    this.createTeamCategories(),
    this.createFormGroup();
    this.isVisible = true;
  }

  ngOnInit(): void {
    this.subscription = this.configurationService.configurationReceived$.pipe(tap(
      this.configurationSubscription.bind(this)
    )).subscribe();
  }

  onSelectionChange($event: MatSelectChange) {
    this.queryGroupCategory.emit($event.value)
  }
}
