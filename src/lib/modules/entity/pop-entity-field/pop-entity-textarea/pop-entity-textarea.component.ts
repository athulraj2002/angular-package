import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { FieldConfig } from '../../../../pop-common.model';
import { PopDomService } from '../../../../services/pop-dom.service';
import { StorageGetter } from '../../../../pop-common-utility';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { EntityFieldComponentInterface } from '../pop-entity-field.model';
import { TextareaFieldSetting } from './textarea.setting';

@Component({
  selector: 'lib-pop-entity-textarea',
  templateUrl: './pop-entity-textarea.component.html',
  styleUrls: ['./pop-entity-textarea.component.scss']
})
export class PopEntityTextareaComponent extends FieldTemplate implements EntityFieldComponentInterface, OnInit, OnDestroy{

  @Input() field: FieldConfig;

  public name = 'PopEntityTextareaComponent';


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService
  ){
    super( el, _domRepo, TextareaFieldSetting );
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
        item.config.content.label = item.entry ? item.entry.name : defaultLabel;
      } );
    }
    return true;
  }

}
