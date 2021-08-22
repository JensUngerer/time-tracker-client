import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ITimeEntryBase } from '../../../../common/typescript/iTimeEntry';
import { CommitService } from '../commit.service';
import { SessionStorageSerializationService } from '../session-storage-serialization.service';

@Component({
  selector: 'mtt-expand-working-hours',
  templateUrl: './expand-working-hours.component.html',
  styleUrls: ['./expand-working-hours.component.scss']
})
export class ExpandWorkingHoursComponent implements OnInit, AfterViewInit, OnChanges {
  selectedLine: ITimeEntryBase;

  pauses: ITimeEntryBase[];

  @Input()
  currentDay: Date = new Date();

  constructor(private commitService: CommitService,
    private sessionStorageSerializationService: SessionStorageSerializationService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes &&
      changes.currentDay &&
      changes.currentDay.currentValue) {
      this.initPauses(changes.currentDay.currentValue);
    }
  }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
  }

  private initPauses(currentDay: Date) {
    const pausesPromise = this.commitService.getWorkingPausesTimeEntries(currentDay);
    if (!pausesPromise) {
      console.error('no pauses Promise');
      return;
    }
    pausesPromise.then((rawPauses: string) => {
      var pauses: ITimeEntryBase[] = this.sessionStorageSerializationService.deSerialize(rawPauses);
      if (!pauses ||
        !pauses.length) {
        console.error('no pauses received');
        return;
      }
      this.pauses = pauses;
    });
    pausesPromise.catch((err: any) => {
      console.error(err);
    });
  }

  onTimeEntryAdded(line: ITimeEntryBase) {
    const postPromise = this.commitService.postWorkingTimeEntry(line);
    postPromise.then((postResult: string) => {
      // DEBUGGING:
      console.log(postResult);
    });
    postPromise.catch((postErr: any) => {
      // DEBUGGING:
      console.log(postErr);
    });
  }

  onLineClicked(line: ITimeEntryBase) {
    this.selectedLine = line;
  }
}
