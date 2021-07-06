import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SelectModalConfig } from './select-modal-config.model';
import { PopSelectModalDialogComponent } from './pop-select-modal-dialog/pop-select-modal-dialog.component';
import { InputConfig } from '../pop-input/input-config.model';
import { SelectListConfig } from '../pop-select-list/select-list-config.model';
import { SelectFilterGroupInterface } from '../pop-select-filter/select-filter-config.model';
import { Dictionary, Entity, PopBaseEventInterface, ServiceInjector } from '../../../../pop-common.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { ArrayOnlyUnique, IsArray, IsCallableFunction, JsonCopy } from '../../../../pop-common-utility';
import { FormControl } from '@angular/forms';
import { ValidationErrorMessages } from '../../../../services/pop-validators';


@Component( {
  selector: 'lib-pop-select-modal',
  templateUrl: './pop-select-modal.component.html',
  styleUrls: [ './pop-select-modal.component.scss' ]
} )
export class PopSelectModalComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
  @Input() config: SelectModalConfig;
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter();

  public name = 'PopSelectModalComponent';

  protected srv = {
    dialog: <MatDialog>ServiceInjector.get( MatDialog ),
  };

  protected asset = {
    original: undefined,
    dialogRef: <MatDialogRef<PopSelectModalDialogComponent>>undefined
  };

  public ui = {
    anchorInput: <InputConfig>undefined,
    dialogRef: <MatDialogRef<PopSelectModalDialogComponent>>undefined
  };


  constructor(){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {


        this.config.triggerOpen = ()=>{
          this.dom.setTimeout(``, ()=>{
            this.onChangeOptions();
          }, 0);
        };

        this.ui.anchorInput = new InputConfig( {
          label: this.config.label,
          value: this.config.list.strVal,
          selectMode: true,
          maxlength: 2048,
        } );

        return resolve( true );
      } );
    };

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
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


  onChangeOptions(){
    this.dom.active.storedValue = this.config.list.strVal;
    this.asset.dialogRef = this.srv.dialog.open( PopSelectModalDialogComponent, {
      width: `450px`,
      height: `600px`,
      panelClass: 'sw-relative',
      data: <Dictionary<any>>{}
    } );

    this.asset.original = {
      all: JsonCopy(this.config.list.all),
      selectedOptions: this.config.list.multiple ? JsonCopy(this.config.control.value): [],
      groups: JsonCopy(this.config.list.groups),
      strVal: JsonCopy(this.config.list.strVal),
    };

    this.asset.dialogRef.componentInstance.config = this.config;

    this.dom.setSubscriber( `select-dialog`, this.asset.dialogRef.beforeClosed().subscribe( ( list: SelectListConfig | null ) => {
      if( list && list.strVal !== this.dom.active.storedValue ){
        this.config.control.setValue(list.control.value);
        if(!list.multiple) list.value = list.control.value;

        // console.log('list', list);
        this.ui.anchorInput.triggerOnChange( list.strVal );
        this.ui.anchorInput.message = '';
        this.onChange();
      }else{
        this.config.list.all = this.asset.original.all;
        this.config.list.selectedOptions = this.asset.original.selectedOptions;
        this.config.list.value = this.asset.original.selectedOptions;
        this.config.list.groups = this.asset.original.groups;
        this.config.list.strVal = this.asset.original.strVal;
      }
      this.asset.dialogRef = null;
    } ) );

    this.dom.setTimeout( `search-focus`, () => {
        if(IsCallableFunction(this.asset.dialogRef.componentInstance.config.list.focusSearch)) this.asset.dialogRef.componentInstance.config.list.focusSearch();
    }, 200 );
  }


  // displaySuccess(): void{
  //   this.ui.anchorInput.message = '';
  //   this.ui.anchorInput.patch.success = true;
  //   setTimeout(() => {
  //     this.ui.anchorInput.patch.success = false;
  //   }, 1000);
  // }

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
   *                                                                                              *
   ************************************************************************************************/

  /**
   * Set up the body of the api patch
   * @param value
   * @private
   */
  protected _getPatchBody( value?: number | string | boolean | null | Object ): Entity{
    const body = <Entity>{};
    if( !value ) value = this.config.list.multiple ? ( this.config.list.control.value.length ? this.config.list.control.value : [] ) : this.config.list.control.value;

    if( this.config.list.all ){
      if( typeof this.config.list.allValue !== 'undefined' ){
        body[ this.config.patch.field ] = this.config.list.allValue;
      }else if( this.config.list.patchGroupFk ){
        body[ this.config.patch.field ] = [];
        this.config.list.groups.map( ( group: SelectFilterGroupInterface ) => {
          body[ this.config.patch.field ].push( `0:${group.groupFk}` );
        } );
      }else{
        body[ this.config.patch.field ] = value;
      }
    }else{
      if( !this.config.list.selectedOptions.length && typeof this.config.list.emptyValue !== 'undefined' ){
        body[ this.config.patch.field ] = this.config.list.emptyValue;
      }else if( this.config.list.patchGroupFk ){
        body[ this.config.patch.field ] = [];
        this.config.list.groups.map( ( group: SelectFilterGroupInterface ) => {
          if( group.all ){
            body[ this.config.patch.field ].push( `0:${group.groupFk}` );
          }else{
            group.options.values.filter( ( option ) => {
              return option.selected;
            } ).map( ( option ) => {
              body[ this.config.patch.field ].push( `${option.value}:${group.groupFk}` );
            } );
          }
        } );
      }else{
        body[ this.config.patch.field ] = value;
      }
    }
    if( IsArray( body[ this.config.patch.field ], true ) ){
      body[ this.config.patch.field ] = ArrayOnlyUnique( body[ this.config.patch.field ] );
      body[ this.config.patch.field ].sort( function( a, b ){
        return a - b;
      } );
    }

    if( this.config.patch.metadata ){
      for( const i in this.config.patch.metadata ){
        if( !this.config.patch.metadata.hasOwnProperty( i ) ) continue;
        body[ i ] = this.config.patch.metadata[ i ];
      }
    }
    if( this.config.patch.json ) body[ this.config.patch.field ] = JSON.stringify( body[ this.config.patch.field ] );

    return body;
  }





  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/


}
