import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { EntityFieldComponentInterface } from '../pop-entity-field.model';
import { InputConfig } from '../../../base/pop-field-item/pop-input/input-config.model';
import { FieldConfig, FieldEntry } from '../../../../pop-common.model';
import { ArrayMapSetter, IsArray, IsObject, SnakeToPascal, TitleCase } from '../../../../pop-common-utility';
import { SelectConfig } from '../../../base/pop-field-item/pop-select/select-config.model';
import { PopDomService } from '../../../../services/pop-dom.service';
import { ButtonConfig } from '../../../base/pop-field-item/pop-button/button-config.model';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { PhoneFieldSetting } from './phone.setting';


@Component({
  selector: 'lib-pop-entity-phone',
  templateUrl: './pop-entity-phone.component.html',
  styleUrls: [ './pop-entity-phone.component.scss' ]
})
export class PopEntityPhoneComponent extends FieldTemplate implements EntityFieldComponentInterface, OnInit, OnDestroy {
  @Input() field: FieldConfig;
  public name = 'PopEntityPhoneComponent';

  protected asset = {
    extensionKeys: [ 'type', 'voice_button', 'sms_button', 'do_not_call', 'do_not_sms', 'country_id' ],
  };


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService
  ){
    super(el, _domRepo, PhoneFieldSetting);
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
   * Builds the display string
   * @param dataKey
   */
  protected _getAssetDisplayStr(dataKey: number): string{
    let str = '';
    const display = this.dom.session[ dataKey ].display;
    const items = this._getDataKeyItemConfig(dataKey);
    if( 'country_id' in items && display[ 'country_id' ] ){
      str += `+${display[ 'country_id' ]} `;
    }
    if( display[ 'number' ] ){
      str += `${display[ 'number' ]}`;
    }
    if( 'extension' in items && display[ 'extension' ] ){
      str += ` Ext. ${display[ 'extension' ]} `;
    }
    return str;
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


  protected _setFieldItemAttribute(dataKey: number, index: number): boolean{
    this.ui.actionBtnWidth = 50;

    let hasCallBtn = false;
    let hasTextBtn = false;

    const item = this.field.items[ dataKey ];
    const configKeys = Object.keys(item.config);

    this.dom.state.has_extension = configKeys.some(r => this.asset.extensionKeys.includes(r));

    this.ui.asset[ dataKey ].canCallBtn = new ButtonConfig({
      icon: 'local_phone',
      value: null,
      // disabled: true
    });
    this.ui.asset[ dataKey ].canTextBtn = new ButtonConfig({
      icon: 'textsms',
      value: null,
      // disabled: true
    });


    if( 'type' in item.config ){
      // If type is set, use as the label of the phone number
      const typeConfig = <SelectConfig>item.config[ 'type' ];
      this._updateNumberLabel(+dataKey, index);
      typeConfig.patch.callback = () => {
        this._updateNumberLabel(+dataKey, index);
      };
      // If value entry exists, disable type
      // if( this.field.multiple && index in this.field.entries ){
      //   typeConfig.control.disable();
      // }else{
      //   typeConfig.control.enable();
      // }
    }


    if( 'stop_call_at' in item.config ){
      // ToDo:: Figure out what this button will actually do
      hasCallBtn = true;
    }
    if( 'stop_text_at' in item.config ){
      // ToDo:: Figure out what this button will actually do
      hasTextBtn = true;
    }

    if( 'country_id' in item.config ){
      const countryConfig = <SelectConfig>item.config[ 'country_id' ];
      countryConfig.patch.callback = () => {
        this._updateCountry(+dataKey, index);
      };
      this._updateCountry(+dataKey, index);
    }


    if( 'number' in item.config ){
      const numberConfig = <InputConfig>item.config[ 'number' ];
      numberConfig.mask = '(000) 000-0000';
      numberConfig.dropSpecial = false;
      numberConfig.patch.callback = () => {
        this._updateNumber(+dataKey, index);
      };
      this._updateNumber(+dataKey, index);
    }

    if( 'extension' in item.config ){
      const extConfig = <InputConfig>item.config[ 'extension' ];
      extConfig.mask = '0*00000';
      extConfig.patch.callback = () => {
        this._updateExtension(+dataKey, index);
      };
      this._updateExtension(+dataKey, index);
    }

    // if( itemKeys.includes('number') ){
    // if( itemKeys.includes('country_code') || itemKeys.includes('ext') ){
    //   this.dom.state.merged = true;
    //   const items = [ this.field.items[ dataId ][ 'number' ] ];
    //   if( itemKeys.includes('country_code') ) items.unshift(this.field.items[ dataId ][ 'country_code' ]);
    //   if( itemKeys.includes('ext') ) items.push(this.field.items[ dataId ][ 'ext' ]);
    //   this.field.items[ dataId ][ 'number' ] = this._getMergedPhone(items);
    //
    //   this.dom.setSubscriber('phone', this.field.items[ dataId ][ 'number' ].control.valueChanges
    //     .pipe(
    //       distinctUntilChanged(),
    //       debounceTime(500),
    //     )
    //     .subscribe((value: string) => {
    //       if( value ) this._validatePhone(dataId, value);
    //     }));
    // }
    // }

    if( hasCallBtn ) this.ui.actionBtnWidth += 50;
    if( hasTextBtn ) this.ui.actionBtnWidth += 50;

    return true;
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/




  private _updateCountry(dataKey: number, index: number){
    const countryConfig = <SelectConfig>this._getDataKeyItemConfig(dataKey, 'country_id');
    if( countryConfig.metadata.source ){
      const source = countryConfig.metadata.source;
      const sourceMap = countryConfig.metadata.map.source;
      const value = countryConfig.control.value;
      const option = value in sourceMap ? source[ sourceMap[ value ] ] : null;
      countryConfig.value = value;
      console.log('_updateCountry option', option);
      if( IsObject(option, [ 'phone_country_code' ]) ){
        this._updateDisplayField(dataKey, 'country_id', option.phone_country_code);
      }
      this._triggerUpdateAssetDisplay(dataKey);
    }

  }


  private _updateNumber(dataKey: number, index: number){
    const numberConfig = <SelectConfig>this._getDataKeyItemConfig(dataKey, 'number');
    const value = numberConfig.control.value;
    this._updateDisplayField(dataKey, 'number', value);
    numberConfig.value = value;

    this._triggerUpdateAssetDisplay(dataKey);
  }


  private _updateExtension(dataKey: number, index: number){
    const extConfig = <SelectConfig>this._getDataKeyItemConfig(dataKey, 'extension');
    const value = extConfig.control.value;
    this._updateDisplayField(dataKey, 'extension', value);

    this._triggerUpdateAssetDisplay(dataKey);
  }


  private _updateNumberLabel(dataKey: number, index: number){
    if( this.field.multiple && IsArray(this.field.entries, true) ){
      this._updateNumberLabelToMatchEntry(index);
    }else{
      this._updateNumberLabelToMatchType(+dataKey);
    }
    this._triggerUpdateAssetDisplay(dataKey);
  }


  private _updateNumberLabelToMatchEntry(index: number){
    const entry = <FieldEntry>this._getValueEntry(index);
    const typeConfig = <SelectConfig>this._getDataKeyItemConfig(this.field.data_keys[ index ], 'type');
    const numberConfig = <InputConfig>this._getDataKeyItemConfig(this.field.data_keys[ index ], 'number');
    const stored = this._getDataKey(this.field.data_keys[ index ], 'type');
    const display = this.ui.asset[ this.field.data_keys[ index ] ].display;

    if( entry && entry.type && !stored ){
      typeConfig.control.setValue(entry.type);
    }
    const value = entry ? ( entry.name ? entry.name : this._getTypeOptionName(entry.type, index) ) : ( numberConfig.label ? numberConfig.label : '' );
    if( value ){
      numberConfig.label = value;
      display.label = value;
    }
  }


  /**
   * The label of value entry should match the type
   * @param dataKey
   */
  private _updateNumberLabelToMatchType(dataKey: number){
    const typeConfig = <SelectConfig>this._getDataKeyItemConfig(dataKey, 'type');
    const numberConfig = <InputConfig>this._getDataKeyItemConfig(dataKey, 'number');
    const optionsMap = ArrayMapSetter(typeConfig.options.values, 'value');
    const value = typeConfig.control.value;
    const display = this.ui.asset[ dataKey ].display;
    const option = value in optionsMap ? typeConfig.options.values[ optionsMap[ value ] ] : null;
    numberConfig.label = option ? option.name : TitleCase(SnakeToPascal(value));
    display.label = numberConfig.label;
  }


  // private _validatePhone(dataId, value){
  //   if( this.field.items[ dataId ][ 'number' ].control.valid ){
  //     let values = String(value).split(' Ext. ');
  //     let ext = String(values.pop()).match(/\d+/g).map(Number).join('');
  //     if( values.length ){
  //       values = <any>values.pop();
  //     }else{
  //       values = <any>'';
  //     }
  //     const countryCode = String(values).substr(0, String(values).indexOf(' ')).match(/\d+/g).map(Number).join('');
  //     const number = String(values).substr(String(values).indexOf(' ') + 1).match(/\d+/g).map(Number).join('');
  //     if( this.log.repo.enabled('info', this.name) ) console.log(this.log.repo.message(`${this.name}:info`), this.log.repo.color('info'), [ countryCode, number, ext ]);
  //
  //     if( number ){
  //       if( !ext ) ext = null;
  //       const numberConfig = <InputConfig> this.field.items[ dataId ][ 'number' ];
  //       if( typeof numberConfig.triggerDirectPatch === 'function' ) numberConfig.triggerDirectPatch(number);
  //       const countryConfig = <InputConfig> this.field.items[ dataId ][ 'country_code' ];
  //       if( typeof countryConfig.triggerOnChange === 'function' ) countryConfig.triggerOnChange(countryCode);
  //       if( typeof countryConfig.triggerDirectPatch === 'function' ) countryConfig.triggerDirectPatch(countryCode);
  //       const extConfig = <InputConfig> this.field.items[ dataId ][ 'ext' ];
  //       if( typeof extConfig.triggerOnChange === 'function' ) extConfig.triggerOnChange(ext);
  //       if( typeof extConfig.triggerDirectPatch === 'function' ) extConfig.triggerDirectPatch(ext);
  //     }
  //   }
  // }


  // private _getMergedPhone(items: InputConfig[]){
  //   const indexItems = [];
  //   items.forEach((item) => {
  //     this._setItemMask(item);
  //     this._disablePhoneItem(item);
  //     indexItems[ item.column ] = item;
  //   });
  //   this._mergePhoneValues(indexItems);
  //   if( indexItems[ 'number' ] && indexItems[ 'number' ].control.value ){
  //     if( indexItems[ 'country_code' ] && indexItems[ 'country_code' ].control.value ){
  //       indexItems[ 'number' ].control.value = ( indexItems[ 'country_code' ].control.value + ' ' + indexItems[ 'number' ].control.value );
  //     }
  //     if( indexItems[ 'ext' ] && indexItems[ 'ext' ].control.value ) indexItems[ 'number' ].control.value += ' Ext. ' + indexItems[ 'ext' ].control.value;
  //   }
  //   this.dom.store('state');
  //   return indexItems[ 'number' ];
  // }


  // private _setItemMask(item: InputConfig): void{
  //   switch( item.column ){
  //     case 'country_code':
  //       item.mask = '+0';
  //       if( !item.mask ) item.mask = '+0';
  //       break;
  //     case 'ext':
  //       item.mask = '09999999';
  //       if( !item.mask ) item.mask = '09999999';
  //       if( !item[ 'required' ] ) item.mask = '9' + item.mask;
  //       break;
  //     default:
  //       break;
  //   }
  // }
  //
  //
  // private _mergePhoneValues(indexItems: InputConfig[]): void{
  //   if( indexItems[ 'country_code' ] ){
  //     indexItems[ 'number' ].mask = indexItems[ 'country_code' ].mask + ' ' + indexItems[ 'number' ].mask;
  //   }
  //   if( indexItems[ 'ext' ] ){
  //     indexItems[ 'number' ].mask += ' Ext. ' + indexItems[ 'ext' ].mask;
  //     indexItems[ 'number' ].specialChars.push(...[ 'E', 'x', 't' ]);
  //   }
  // }
  //
  //
  // private _disablePhoneItem(item: InputConfig): void{
  //   item.dropSpecial = false;
  //   item.maxlength = null;
  //   item.patch.disabled = true;
  //   item.control.setValidators([]);
  // }

}
