import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IDeleteDialogData } from '../typescript/iDeleteDialogData';

@Component({
  selector: 'mtt-project-delete-dialog',
  templateUrl: './project-delete-dialog.component.html',
  styleUrls: ['./project-delete-dialog.component.scss']
})
export class ProjectDeleteDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: IDeleteDialogData) { }

  ngOnInit() {
  }

}
