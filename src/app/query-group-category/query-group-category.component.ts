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

  @Output()
  formControlNameTeamCat = 'theTeamCategoryFormGroupName';

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

  private setInitialValue() {
    const initialValue = this.groupCategories[0].value;
    this.queryGroupCategoryFormGroup.controls[this.formControlNameTeamCat].setValue(initialValue);
    this.queryGroupCategory.emit(initialValue);
  }

  private createFormGroup() {
    const configObj = {};
    configObj[this.formControlNameTeamCat] = new FormControl('');
    this.queryGroupCategoryFormGroup = new FormGroup(configObj);
    this.setInitialValue();
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
