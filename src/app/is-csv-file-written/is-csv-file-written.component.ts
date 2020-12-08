import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IQueryBooleans } from './iQueryBooleans';

@Component({
  selector: 'mtt-is-csv-file-written',
  templateUrl: './is-csv-file-written.component.html',
  styleUrls: ['./is-csv-file-written.component.scss']
})
export class IsCsvFileWrittenComponent implements OnInit, OnDestroy, AfterViewInit {
  private formChangesSubscription: Subscription;
  private deleteCurrentSubscription: Subscription;

  formControlNameIsCsvFileWritten = 'theIsCsvWrittenFormControl';
  queryIsCsvFileWrittenFormGroup: FormGroup;

  @Input()
  deleteCurrent: EventEmitter<any>;

  @Output()
  queryBooleans: EventEmitter<IQueryBooleans> = new EventEmitter<IQueryBooleans>();

  constructor() { }

  private initialize() {
    const configObj: { [key: string]: AbstractControl } = {};
    configObj[this.formControlNameIsCsvFileWritten] = new FormControl(false);
    this.queryIsCsvFileWrittenFormGroup = new FormGroup(configObj);
    this.formChangesSubscription = this.queryIsCsvFileWrittenFormGroup.valueChanges.pipe(tap(this.onQueryBooleans.bind(this))).subscribe();
  }

  private deleteCurrentCallback() {
    this.queryIsCsvFileWrittenFormGroup.controls[this.formControlNameIsCsvFileWritten].setValue(false);
    this.queryBooleans.emit({
      isCsvFileWritten: false
    });
  }

  ngAfterViewInit(): void {
    if (this.deleteCurrent) {
      this.deleteCurrentSubscription = this.deleteCurrent.pipe(tap(this.deleteCurrentCallback.bind(this))).subscribe();
    }
  }

  ngOnDestroy(): void {
    if (this.formChangesSubscription) {
      this.formChangesSubscription.unsubscribe();
    }
    if (this.deleteCurrentSubscription) {
      this.deleteCurrentSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.initialize();
  }

  onQueryBooleans(values: any) {
    const isCsvFileWritten = values[this.formControlNameIsCsvFileWritten];

    // DEBUGGING:
    // console.log('isCsvFileWritten:' + isCsvFileWritten);

    this.queryBooleans.emit({
      isCsvFileWritten
    });
  }

}
