import { ElementRef, Inject, Injectable, isDevMode } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { PopTemplateAjaxLoaderComponent } from './assets/ajax-loader.component';
import { PopTemplateGoodByeComponent } from './assets/goodbye.component';
import { PopTemplateWelcomeComponent } from './assets/welcome.component';
import { PopTemplateErrorComponent } from './assets/error.component';
import { IsObject } from '../../pop-common-utility';
import { PopTemplateBufferComponent } from './assets/buffer.component';
import { PopCacFilterBarService } from './pop-cac-filter/pop-cac-filter.service';
import { AppGlobalInterface } from '../../pop-common.model';


@Injectable( {
  providedIn: 'root'
} )
export class PopTemplateService {

  protected asset = {
    notification: <MatSnackBarRef<any>>undefined,
    contentEl: <ElementRef>undefined
  };




  constructor(
    private filter: PopCacFilterBarService,
    private snackbar: MatSnackBar,
    @Inject( 'APP_GLOBAL' ) private APP_GLOBAL: AppGlobalInterface,
    @Inject( 'env' ) private env?
  ){
  }


  turnOffFilter(){
    this.filter.setActive( false );
  }


  welcome(){
    this.asset.notification = this.snackbar.openFromComponent( PopTemplateWelcomeComponent, {
      panelClass: 'pop-template-center',
      duration: 5 * 1000
    } );
  }


  buffer( expression: string = null, duration: number = 4 ){
    if( isDevMode() ){
      this.asset.notification = this.snackbar.openFromComponent( PopTemplateBufferComponent, {
        panelClass: 'pop-template-center',
        duration: duration * 1000,
        data: {
          expression: expression,
        }
      } );
    }
  }


  error( error: { message: string, code: number }, duration: number = 5 ){
    if( isDevMode() ){
      this.asset.notification = this.snackbar.openFromComponent( PopTemplateErrorComponent, {
        panelClass: 'pop-template-center',
        duration: duration * 1000
      } );
      this.asset.notification.instance.error = error;
    }
  }


  goodbye(){
    this.asset.notification = this.snackbar.openFromComponent( PopTemplateGoodByeComponent, {
      panelClass: 'pop-template-center',
      duration: 5 * 1000
    } );
  }


  lookBusy( duration: number = 5 ){
    if( isDevMode() ){
      this.asset.notification = this.snackbar.openFromComponent( PopTemplateAjaxLoaderComponent, {
        panelClass: 'pop-template-center',
        duration: duration * 1000
      } );
    }
  }


  notify( message: string, action: string = null, duration: number = 3 ){
    this.asset.notification = this.snackbar.open(
      message, action, {
        panelClass: 'pop-template-center',
        duration: duration * 1000
      }
    );
  }


  clear(){
    if( IsObject( this.asset.notification, [ 'dismiss' ] ) ){
      this.asset.notification.dismiss();
    }
  }


  setContentEl( el: ElementRef ): void{
    if( el ) this.asset.contentEl = el;
  }


  verify(){
    if( this.APP_GLOBAL.isVerified() ){
      this.APP_GLOBAL.verification.next();
    }
  }


  getContentHeight( modal = false, overhead = 60 ): number{
    let height = window.innerHeight;
    if( this.asset.contentEl && this.asset.contentEl.nativeElement.offsetTop) height = (height - this.asset.contentEl.nativeElement.offsetTop);
    if( modal ) height -= 100;
    if( overhead ) height -= overhead;
    return height;
  }
}
