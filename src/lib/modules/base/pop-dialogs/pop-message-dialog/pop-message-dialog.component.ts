import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PopMessageDialogDataInterface } from '../pop-dialogs.model';

@Component({
  selector: 'lib-pop-message-dialog',
  templateUrl: './pop-message-dialog.component.html',
  styleUrls: ['./pop-message-dialog.component.scss']
})
export class PopMessageDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public config:PopMessageDialogDataInterface ,
    public dialog: MatDialogRef<PopMessageDialogComponent>
  ) { }

  ngOnInit(): void {
  }

  onCancel(){
    this.dialog.close(null);
  }
  
}
