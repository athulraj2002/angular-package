import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { EntityFieldComponentInterface } from '../pop-entity-field.model';
import { FieldConfig } from '../../../../pop-common.model';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { EmailFieldSetting } from './email.setting';
import { ButtonConfig } from '../../../base/pop-field-item/pop-button/button-config.model';
import { SelectConfig } from '../../../base/pop-field-item/pop-select/select-config.model';
import { InputConfig } from '../../../base/pop-field-item/pop-input/input-config.model';
import { Validators } from '@angular/forms';


@Component({
  selector: 'lib-pop-entity-email',
  templateUrl: './pop-entity-email.component.html',
  styleUrls: [ './pop-entity-email.component.scss' ],
})
export class PopEntityEmailComponent extends FieldTemplate implements EntityFieldComponentInterface, OnInit, OnDestroy {
  @Input() field: FieldConfig;


  public name = 'PopEntityEmailComponent';

  protected asset = {
    extensionKeys: [ 'action' ],
  };


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService
  ){
    super(el, _domRepo, EmailFieldSetting);
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

    if( this.field && this.field.items ){
      Object.keys(this.field.items).map((dataKey, index) => {
        this._setFieldItemAttribute(+dataKey, index);
      });
    }
    return true;
  }


  /**
   * This will be different for each type of field group
   * Intended to be overridden in each class
   */
  protected _setFieldItemAttribute(dataKey: number, index: number): boolean{

    const item = this.field.items[ dataKey ];
    const configKeys = Object.keys(item.config);

    this.dom.state.has_extension = configKeys.some(r => this.asset.extensionKeys.includes(r));

    if( 'action' in item.config ){
      this.ui.actionBtnWidth = 50;
      item.config[ 'action' ] = new ButtonConfig({
        icon: 'email',
        size: 42,
        value: null,
        // disabled: true
      });
    }


    if( 'address' in item.config ){
      const child = this.field.children[ 'address' ];
      const addressConfig = <InputConfig>item.config[ 'address' ];
      addressConfig.pattern = 'Email';
      addressConfig.type = 'email';
      const validators = [];
      validators.push(Validators.email);
      if( +child.rule.required ) validators.push(Validators.required);
      if( +child.rule.maxlength ) validators.push(Validators.maxLength(+child.rule.maxlength));
      addressConfig.validators = validators;
      if( this.field.multiple ) addressConfig.label = this.field.entries[ index ].name;
      addressConfig.patch.callback = () => {
        this._updateAddress(+dataKey, index);
      };
      this._updateAddress(+dataKey, index);
    }

    return true;
  }


  private _updateAddress(dataKey: number, index: number){
    const addressConfig = <SelectConfig>this._getDataKeyItemConfig(dataKey, 'address');
    if( addressConfig.metadata.source ){
      const value = addressConfig.control.value;
      addressConfig.value = value;

      this._triggerUpdateAssetDisplay(dataKey);
    }
  }

}
