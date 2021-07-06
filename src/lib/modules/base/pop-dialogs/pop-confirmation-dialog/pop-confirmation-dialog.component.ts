import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PopConfirmationDialogDataInterface } from '../pop-dialogs.model';


@Component({
  selector: 'lib-pop-confirmation-dialog',
  templateUrl: './pop-confirmation-dialog.component.html',
  styleUrls: [ './pop-confirmation-dialog.component.scss' ]
})
export class PopConfirmationDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public config: PopConfirmationDialogDataInterface,
    public dialog: MatDialogRef<PopConfirmationDialogComponent>
  ){
  }


  ngOnInit(){
    if( !this.config.display ) this.config.display = 'Confirmation';
    if( !this.config.option ) this.config.option = { confirmed: 1 };
    if( !this.config.align ) this.config.align = 'center';
  }


  onConfirm(){
    this.dialog.close(this.config.option);
  }


  onCancel(){
    this.dialog.close(null);
  }
}
