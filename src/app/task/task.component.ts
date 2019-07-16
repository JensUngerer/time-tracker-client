import { TaskService } from './../task.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';

@Component({
  selector: 'mtt-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss', './../css/centerVerticalHorizontal.scss']
})
export class TaskComponent implements OnInit {

  public taskFormGroup: FormGroup = null;

  public formControlNameTaskName = 'theTaskName';

  public isButtonDisabled = false;

  public onSubmit(values: any) {
    const newNewTaskName = values[this.formControlNameTaskName];

    this.taskService.addTask(newNewTaskName);

    this.isButtonDisabled = true;
  }

  constructor(private taskService: TaskService) {
    const configObj: {[key: string]: AbstractControl} = {};

    configObj[this.formControlNameTaskName] = new FormControl('');

    this.taskFormGroup = new FormGroup(configObj);
  }

  ngOnInit() {
  }

}
