import { Component, ElementRef, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  EntitySuccessDataInterface,
  ServiceInjector
} from '../../../../pop-common.model';

import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { PopExtendComponent } from '../../../../pop-extend.component';


@Component( {
  selector: 'lib-pop-success-dialog',
  templateUrl: './pop-success-dialog.component.html',
  styleUrls: [ './pop-success-dialog.component.scss' ]
} )
export class PopSuccessDialogComponent extends PopExtendComponent implements OnInit, OnDestroy {


  name = 'PopSuccessDialogComponent';

  protected srv = {
    dialog: <MatDialog>ServiceInjector.get( MatDialog ),
  };

  protected asset = {};

  public ui = {
    submitText: 'Ok',
    header: 'Success',
    message: 'Action was Successful'
  };


  constructor(
    public el: ElementRef,
    public dialog: MatDialogRef<PopSuccessDialogComponent>,
    @Inject( MAT_DIALOG_DATA ) public data: EntitySuccessDataInterface,
  ){
    super();

    this.dom.configure = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {

        this.ui = { ...this.ui, ...this.data };

        return resolve( true );
      } );
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {


        return resolve( true );
      } );
    };
  }


  /**
   * This component should have a specific purpose
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * The user can click a cancel btn to close the action dialog
   */
  onFormClose(){
    this.dom.setTimeout( `close-modal`, () => {
      this.dialog.close( -1 );
    }, 250 );
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Protected Method )                                      *
   *               These are protected instead of private so that they can be overridden          *
   *                                                                                              *
   ************************************************************************************************/


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/


}
