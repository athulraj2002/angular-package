import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { EntityFieldComponentInterface } from '../pop-entity-field.model';
import { FieldConfig } from '../../../../pop-common.model';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { StorageGetter } from '../../../../pop-common-utility';
import { InputFieldSetting } from './input.settings';


@Component( {
  selector: 'lib-pop-entity-input',
  templateUrl: './pop-entity-input.component.html',
  styleUrls: [ './pop-entity-input.component.scss' ]
} )
export class PopEntityInputComponent extends FieldTemplate implements EntityFieldComponentInterface, OnInit, OnDestroy {
  @Input() field: FieldConfig;

  public name = 'PopEntityInputComponent';


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService
  ){
    super( el, _domRepo, InputFieldSetting );
  }


  /**
   * This component should have a specific purpose
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                  Override Inherited Methods                                  *
   *                                    ( Protected Methods )                                     *
   *                                                                                              *
   ************************************************************************************************/


  /**
   * This will setup this field to handle changes and transformations
   */
  protected _setFieldAttributes(): boolean{
    const defaultLabel = StorageGetter( this.field, [ 'children', 'value', 'model', 'label' ] );
    if( this.field && this.field.items ){
      Object.keys( this.field.items ).map( ( dataKey, index ) => {
        const item = this.field.items[ dataKey ];
        item.config.value.label = item.entry ? item.entry.name : defaultLabel;
      } );
    }
    return true;
  }
}
