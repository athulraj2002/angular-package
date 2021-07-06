import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { FieldConfig } from '../../../../pop-common.model';
import { PopDomService } from '../../../../services/pop-dom.service';
import { StorageGetter } from '../../../../pop-common-utility';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { EntityFieldComponentInterface } from '../pop-entity-field.model';
import { SelectMultiFieldSetting } from './select-mulit.setting';

@Component({
  selector: 'lib-pop-entity-select-multi',
  templateUrl: './pop-entity-select-multi.component.html',
  styleUrls: ['./pop-entity-select-multi.component.scss']
})
export class PopEntitySelectMultiComponent extends FieldTemplate implements EntityFieldComponentInterface, OnInit, OnDestroy  {

  @Input() field: FieldConfig;

  public name = 'PopEntitySelectMultiComponent';


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService
  ){
    super(el, _domRepo, SelectMultiFieldSetting);
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
  /**
   * This will setup this field to handle changes and transformations
   */
  protected _setFieldAttributes(): boolean{
    const defaultLabel = StorageGetter(this.field, [ 'children', 'value', 'model', 'label' ]);
    const entryLabel = this.field.entries[ 0 ].name;
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
