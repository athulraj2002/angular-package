import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InDialogComponent } from './in-dialog/in-dialog.component';
import { FieldItemGroupConfig } from './pop-field-item-group.model';
import { PopExtendComponent } from '../../../pop-extend.component';
import { Entity, PopBaseEventInterface, ServiceInjector } from '../../../pop-common.model';


@Component( {
  selector: 'lib-pop-field-item-group',
  template: '<lib-group *ngIf="config && config.inDialog === null"  (events)="onBubbleEvent($event);" [config]=config></lib-group>',
  styleUrls: []
} )
export class PopFieldItemGroupComponent extends PopExtendComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() config: FieldItemGroupConfig;
  @Output() close = new EventEmitter<Entity>();

  public name = 'PopFieldItemGroupComponent';


  protected srv: {
    dialog: MatDialog
  } = {
    dialog: ServiceInjector.get( MatDialog ),
  };


  constructor(
    public el: ElementRef,
  ){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {
        resolve( true );
      } );
    };
  }


  /**
   * This component will take a list of field item configs and render them in a column list
   */
  ngOnInit(){
    super.ngOnInit();
  }


  ngAfterViewInit(){
    if( this.config.inDialog ){
      this.dom.setTimeout( `load-modal`, () => {
        this._loadGroupInDialogBox();
      }, 0 );
    }
  }


  /**
   * This fx will bubble events up the pipeline
   * @param event
   */
  onBubbleEvent( event: PopBaseEventInterface ){
    this.events.emit( event );
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
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/
  /**
   * This fx will load the field item list in a dialog modal, this is for typically for creating entities and such actions.
   * This will allow all the fields items to be placed in an angular form so all the data can be validated collectively.
   * @private
   */
  private _loadGroupInDialogBox(){
    const dialogBox = this.srv.dialog.open(
      InDialogComponent,
      {
        data: this.config,
        disableClose: true
      }
    );
    dialogBox.componentInstance[ 'http' ] = this.config.http;
    dialogBox.componentInstance[ 'debug' ] = this.config.debug;
    dialogBox.componentInstance.events.subscribe( ( event: PopBaseEventInterface ) => {
      event.group = this.config;
      this.events.emit( event );
    } );
    dialogBox.afterClosed().subscribe( ( result: any ) => {
      this.close.emit( result );
    } );
  }


}
