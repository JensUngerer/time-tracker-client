import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
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
export class QueryGroupCategoryComponent implements OnInit, OnDestroy {

  private configSubscription: Subscription;

  isVisible = false;

  formControlNameGroupIds: string[] = [];

  @Output()
  queryGroupCategory: EventEmitter<string[]> = new EventEmitter();

  queryGroupCategoryFormGroup: FormGroup;

  groupCategories: ITeamCategoryOption[];

  constructor(private configurationService: ConfigurationService) { }

  ngOnDestroy(): void {
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
  }

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
  }

  private createFormGroup() {
    const configObj = {};
    const baseName = 'theFromControlGroupId';
    this.formControlNameGroupIds = this.groupCategories.map((oneGroupCat, index: number) => {
      const concatName = baseName + index;
      configObj[concatName] = new FormControl(false);
      return concatName;
    });
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
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
    // set initial data to parent component
    this.onSelectionChange();
  }

  ngOnInit(): void {
    this.configSubscription = this.configurationService.configurationReceived$.pipe(tap(
      this.configurationSubscription.bind(this)
    )).subscribe();
  }

  onSelectionChange() {
    const selectedGroupCategories = [];
    const controls = this.queryGroupCategoryFormGroup.controls;
    let index = 0;
    for (const key in controls) {
      if (Object.prototype.hasOwnProperty.call(controls, key)) {
        const oneFormElement = controls[key];
        if (oneFormElement.value === true) {
          selectedGroupCategories.push(this.groupCategories[index].value);
        }
      }
      index++;
    }

    this.queryGroupCategory.emit(selectedGroupCategories);
  }
}
