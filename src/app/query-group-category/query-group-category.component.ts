import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ConfigurationService } from '../configuration.service';
import { GroupCategoryService } from '../group-category.service';
import { ITeamCategoryOption } from '../typescript/iTeamCategoryOption';

@Component({
  selector: 'mtt-query-group-category',
  templateUrl: './query-group-category.component.html',
  styleUrls: ['./query-group-category.component.scss']
})
export class QueryGroupCategoryComponent implements OnInit, OnDestroy {
  @Input()
  isCheckboxUseCase = false;

  @Input()
  isDropDownUseCase = false;

  formControlNameGroupCategory = 'theGroupDropDown';

  private configSubscription: Subscription;

  currentGroupCategory: string;

  isVisible = false;

  formControlNameGroupIds: string[] = [];

  @Output()
  queryGroupCategory: EventEmitter<string[]> = new EventEmitter();

  queryGroupCategoryFormGroup: FormGroup;

  groupCategories: ITeamCategoryOption[];

  constructor(private configurationService: ConfigurationService,
              private groupCategoryService: GroupCategoryService) { }

  ngOnDestroy(): void {
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
  }

  private setInitialValues() {
    if (this.isCheckboxUseCase) {
      const initialValue = true;
      this.formControlNameGroupIds.forEach((oneGroupId: string, index: number)=>{
        this.queryGroupCategoryFormGroup.controls[this.formControlNameGroupIds[index]].setValue(initialValue);
      });
    }
    if (this.isDropDownUseCase) {
      this.currentGroupCategory = this.groupCategories[0].value;
      this.queryGroupCategoryFormGroup.controls[this.formControlNameGroupCategory].setValue(this.groupCategories[0].value);

      // DEBUGGING
      console.log(this.isCheckboxUseCase + '->' + this.groupCategories[0].value);
    }
  }

  private createFormGroup() {
    const configObj = {};
    if (this.isCheckboxUseCase) {
      const baseName = 'theFromControlGroupId';
      this.formControlNameGroupIds = this.groupCategories.map((oneGroupCat, index: number) => {
        const concatName = baseName + index;
        configObj[concatName] = new FormControl(false);
        return concatName;
      });
    }
    if (this.isDropDownUseCase) {
      configObj[this.formControlNameGroupCategory] = new FormControl();
    }
    this.queryGroupCategoryFormGroup = new FormGroup(configObj);
    this.setInitialValues();
  }

  private configurationSubscription(nextValue: boolean) {
    if (!nextValue) {
      return;
    }
    this.groupCategories = this.groupCategoryService.createTeamCategories(),
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

  onDropDownSelectionChanged($event: MatSelectChange) {
    this.currentGroupCategory = $event.value;

    this.queryGroupCategory.emit([this.currentGroupCategory]);
  }
}
