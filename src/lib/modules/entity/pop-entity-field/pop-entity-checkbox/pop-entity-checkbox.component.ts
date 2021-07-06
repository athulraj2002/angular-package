import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { EntityFieldComponentInterface } from '../pop-entity-field.model';
import { FieldConfig } from '../../../../pop-common.model';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { StorageGetter } from '../../../../pop-common-utility';
import { CheckboxFieldSetting } from './checkbox.setting';


@Component({
  selector: 'lib-pop-entity-checkbox',
  templateUrl: './pop-entity-checkbox.component.html',
  styleUrls: [ './pop-entity-checkbox.component.scss' ]
})
export class PopEntityCheckboxComponent extends FieldTemplate implements EntityFieldComponentInterface, OnInit, OnDestroy {
  @Input() field: FieldConfig;

  public name = 'PopEntityCheckboxComponent';


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService
  ){
    super(el, _domRepo, CheckboxFieldSetting);
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
    const defaultLabel = StorageGetter(this.field, [ 'children', 'value', 'model', 'label' ], '');
    console.log('defaultLabel', defaultLabel);
    const entryLabel = this.field.entries[ 0 ].name;
    console.log('entryLabel', entryLabel);
    if( this.field && this.field.items ){
      Object.keys(this.field.items).map((dataKey, index) => {
        const item = this.field.items[ dataKey ];
        if( this.field.multiple ){
          item.config.value.label = this.dom.session[ dataKey ].display.label;
        }else{
          item.config.value.label = entryLabel ? entryLabel : defaultLabel;
        }
      });
    }
    return true;
  }


}
