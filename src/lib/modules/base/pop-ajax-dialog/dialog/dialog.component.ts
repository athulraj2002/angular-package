import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PopAjaxDialogComponent } from '../pop-ajax-dialog.component';
import { PopRouteHistoryResolver } from '../../../../services/pop-route-history.resolver';
import { PopAjaxDialogConfigInterface } from '../pop-ajax-dialog.model';
import { MainSpinner } from '../../pop-indicators/pop-indicators.model';
import { PopRequestService } from '../../../../services/pop-request.service';


@Component({
  selector: 'lib-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: [ './dialog.component.scss' ]
})
export class DialogComponent implements OnInit {
  mainSpinner: MainSpinner;
  loading: boolean;
  httpError: { error: string, code: number };


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PopAjaxDialogConfigInterface,
    private dialog: MatDialogRef<PopAjaxDialogComponent>,
    private history: PopRouteHistoryResolver,
    private requestService: PopRequestService,
  ){
  }


  ngOnInit(){
    this.setSpinnerOptions();
    if( this.data.patch ) this.makeRequest();
    else this.closeDialogAfterDelay();
  }


  private makeRequest(): void{
    this.loading = true;
    switch( this.data.patch.type ){
      case 'delete':
        this.doDelete();
        break;
      case 'get':
        this.doGet();
        break;
      case 'patch':
        this.doPatch();
        break;
      case 'post':
        this.doPost();
        break;
    }
  }


  private doPatch(): void{
    this.requestService.doPatch(this.data.patch.path, this.data.patch.body, this.data.patch.version, false).subscribe(res => {
      this.data.response = res;
      this.loading = false;
      this.closeDialogAfterDelay();
    }, err => {
      this.loading = false;
      this.httpError = {
        error: typeof err.error !== 'undefined' ? err.error.message : err.statusText,
        code: err.status
      };
    });
  }


  private doDelete(): void{
    this.requestService.doDelete(this.data.patch.path, this.data.patch.body, this.data.patch.version, false).subscribe(res => {
      this.data.response = res;
      this.loading = false;
      this.closeDialogAfterDelay();
    }, err => {
      this.loading = false;
      this.httpError.error = typeof err.error !== 'undefined' ? err.error.message : err.statusText;
      this.httpError.code = err.status;
    });

  }


  private doPost(): void{
    this.requestService.doPost(this.data.patch.path, this.data.patch.body, this.data.patch.version, false).subscribe(res => {
      this.data.response = res;
      this.loading = false;
      this.closeDialogAfterDelay();
    }, err => {
      this.loading = false;
      this.httpError.error = typeof err.error !== 'undefined' ? err.error.message : err.statusText;
      this.httpError.code = err.status;
    });

  }


  private doGet(): void{
    this.requestService.doGet(this.data.patch.path, {},this.data.patch.version, false).subscribe(res => {
      this.loading = false;
      this.data.response = res;
      this.closeDialogAfterDelay();
    }, err => {
      this.loading = false;
      this.httpError.error = typeof err.error !== 'undefined' ? err.error.message : err.statusText;
      this.httpError.code = err.status;
    });

  }


  public close(): void{
    this.dialog.close();
  }


  private closeDialogAfterDelay(): void{
    setTimeout(() => {
      this.dialog.close();
    }, this.data.timeDelay ? this.data.timeDelay : 1000);
  }


  private setSpinnerOptions(): void{
    this.mainSpinner = {
      diameter: 100,
      strokeWidth: 10,
    };
  }
}
