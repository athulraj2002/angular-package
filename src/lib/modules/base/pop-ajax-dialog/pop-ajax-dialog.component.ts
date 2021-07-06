import { Component, Input, AfterViewInit, OnInit, Output, EventEmitter, } from '@angular/core';
import { PopAjaxDialogConfigInterface } from './pop-ajax-dialog.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';
import { PopBaseService } from '../../../services/pop-base.service';
import { Router } from '@angular/router';
import { SetSiteVar } from '../../../pop-common-utility';
import { PopHref } from '../../../pop-common.model';


@Component({
  selector: 'lib-pop-ajax-dialog',
  template: '',
})
export class PopAjaxDialogComponent implements OnInit, AfterViewInit {
  @Input() ajaxDialogConfig: PopAjaxDialogConfigInterface;
  @Output() close: EventEmitter<any> = new EventEmitter<any>();


  constructor(
    public dialog: MatDialog,
    private baseService: PopBaseService,
    private router: Router,
  ){
  }


  ngOnInit(){
  }


  ngAfterViewInit(){
    setTimeout(() => {
      this.loadDialog();
    }, 250);
  }


  private loadDialog(): void{
    const dialogBox = this.dialog.open(DialogComponent, {
      width:'500px',
      data: this.ajaxDialogConfig
    });
    dialogBox.afterClosed().subscribe(() => {
      this.close.emit(this.ajaxDialogConfig.response);
      if( this.ajaxDialogConfig.redirect ) this.redirect();
    });
  }


  private redirect(): void{
    if( this.ajaxDialogConfig.redirect.app == PopHref){
      this.router.navigateByUrl(`${this.ajaxDialogConfig.redirect.path}`).catch(e => {
      });
    }
    else{
      SetSiteVar('redirect', `/${this.ajaxDialogConfig.redirect.app}/${this.ajaxDialogConfig.redirect.path}`);
      this.baseService.redirect();
    }
  }


}
