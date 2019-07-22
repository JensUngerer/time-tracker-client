import { InMemoryDataService } from './../in-memory-data.service';
import { ProjectService } from './../project.service';
import { IProjectOption, ProjectOption } from './../typescript/projectOption';
import { Component, OnInit, Output } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { IProject } from '../../../../common/typescript/iProject';
import { HelpersService } from '../helpers.service';
import { CommitService } from '../commit.service';
import { ITimeRecordsDocumentData, IExtendedTimeRecordsDocumentData } from '../../../../common/typescript/mongoDB/iTimeRecordsDocument';

@Component({
  selector: 'mtt-commit',
  templateUrl: './commit.component.html',
  styleUrls: [
    './commit.component.scss',
    './../css/centerVerticalHorizontal.scss'
  ]
})
export class CommitComponent implements OnInit {

  public commitFormGroup: FormGroup = null;

  public formControlNameProjectDropDown = 'formControlProjectDropDown';

  public formControlProjectDropDown: AbstractControl = null;

  public projectOptions: IProjectOption[] = [];

  @Output()
  public durationStr: string = null;

  @Output()
  public isButtonDisabled = false;

  private sumForOneProject: IExtendedTimeRecordsDocumentData = null;

  constructor(private projectService: ProjectService,
    private commitService: CommitService,
    private helpersService: HelpersService,
    private inMemoryDataService: InMemoryDataService) {
    const configObj: { [key: string]: AbstractControl } = {};

    this.formControlProjectDropDown = new FormControl('');
    configObj[this.formControlNameProjectDropDown] = this.formControlProjectDropDown;

    this.commitFormGroup = new FormGroup(configObj);

    const allProjects = this.projectService.getProjects();
    if (allProjects && allProjects.length > 0) {
      allProjects.forEach((project: IProject) => {
        this.projectOptions.push(new ProjectOption(project));
      });
    }
  }

  ngOnInit() {

  }

  public onProjectSelectionChanged($event: any) {
    const projectId = $event.value.projectId;

    this.sumForOneProject = this.projectService.summarizeDurationFor(projectId);

    if (this.sumForOneProject) {
      this.durationStr = this.helpersService.getDurationStr(this.sumForOneProject.data.durationStructure.hours,
        this.sumForOneProject.data.durationStructure.minutes);
      this.isButtonDisabled = false;
    } else {
      this.durationStr = 'not available, as there are no time-entries';
      this.isButtonDisabled = true;
    }
  }


  public onCommitClicked(values: any) {
    if (this.sumForOneProject) {
      this.commitService.postCommit(this.sumForOneProject.data).then(() => {
        this.inMemoryDataService.clearTimeEntries(this.sumForOneProject.timeEntryIds);
        this.durationStr = '';
        this.formControlProjectDropDown.setValue('');
      }).catch(() => {
        console.log('catch');
        this.durationStr = '';
        this.formControlProjectDropDown.setValue('');
      });
    } else {
      console.error('commit is not possible');
      this.durationStr = '';
      this.formControlProjectDropDown.setValue('');
    }
  }
}
