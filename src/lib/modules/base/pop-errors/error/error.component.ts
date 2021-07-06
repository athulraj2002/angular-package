import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PopRouteHistoryResolver } from '../../../../services/pop-route-history.resolver';


@Component({
  selector: 'lib-pop-error',
  templateUrl: './error.component.html',
  styles: []
})
export class ErrorComponent{

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialog: MatDialogRef<ErrorComponent>,
    private history: PopRouteHistoryResolver
  ){}

  goBack(){
    this.history.goBack();
    this.dialog.close();
  }
}
