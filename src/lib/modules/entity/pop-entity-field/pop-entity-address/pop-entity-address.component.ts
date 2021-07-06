import { Component, ElementRef, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { EntityFieldComponentInterface } from '../pop-entity-field.model';
import { FieldConfig, PopExternalApi, PopRequest } from '../../../../pop-common.model';
import { InputConfig } from '../../../base/pop-field-item/pop-input/input-config.model';
import { PopDomService } from '../../../../services/pop-dom.service';
import { AddressFieldSetting } from './address.setting';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { SelectConfig } from '../../../base/pop-field-item/pop-select/select-config.model';
import { GetHttpArrayResult, IsArray, IsObject, JsonCopy } from '../../../../pop-common-utility';
import { Validators } from '@angular/forms';
import { ValidateZip } from "../../../../services/pop-validators";

@Component({
  selector: 'lib-pop-entity-address',
  templateUrl: './pop-entity-address.component.html',
  styleUrls: ['./pop-entity-address.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopEntityAddressComponent extends FieldTemplate implements EntityFieldComponentInterface, OnInit, OnDestroy {
  @Input() field: FieldConfig;

  public name = 'PopEntityAddressComponent';

  protected asset = {
    extensionKeys: [],
    states: []
  };

  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
  ) {
    super(el, _domRepo, AddressFieldSetting);
  }


  /**
   * This component should have a specific purpose
   */
  ngOnInit() {
    super.ngOnInit();
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy() {
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                  Override Inherited Methods                                  *
   *                                    ( Protected Methods )                                     *
   *                                                                                              *
   ************************************************************************************************/

  /**
   * Set the initial config
   * Intended to be overridden per field
   */
  protected _setInitialConfig(): void {

    // this.field.modal = PopEntityAddressEditComponent;
    this.field.modal = null;
  }

  /**
   * This will be different for each type of field group
   * Intended to be overridden in each class, gives the chance to mutate/transform resources if needed
   */
  protected _transformChildren() {
    // const states = IsArray(this.field.children[ 'region_id' ].source, true) ? this.field.children[ 'region_id' ].source : null;
    // if( states ){
    //   this.asset.states = JsonCopy(this.field.children[ 'region_id' ].source).map((state: any) => {
    //     state.long_name = state.name;
    //     state.name = state.abbr;
    //   });
    // }
  }


  /**
   * This will be different for each type of field group
   * Intended to be overridden in each class
   * This will setup this field to handle changes and transformations
   */

  protected _setFieldAttributes(): boolean {


    if (this.field && this.field.items) {
      Object.keys(this.field.items).map((dataKey, index) => {
        this._setFieldItemAttribute(+dataKey, index);
      });

    }
    return true;
  }


  protected _setFieldItemAttribute(dataKey: number, index: number): boolean {
    const item = this.field.items[dataKey];
    const configKeys = Object.keys(item.config);

    this.dom.state.has_extension = configKeys.some(r => this.asset.extensionKeys.includes(r));

    if ('line_1' in item.config) {
      const line1Config = <SelectConfig>item.config['line_1'];
      line1Config.patch.callback = (_core, event) => {
      };
    }

    if ('line_2' in item.config) {
      const line2Config = <SelectConfig>item.config['line_2'];
      line2Config.patch.callback = (core, event) => {
      };
    }

    if ('line_3' in item.config) {
      const line3Config = <SelectConfig>item.config['line_3'];
      line3Config.patch.callback = (core, event) => {
      };
    }

    if ('region_id' in item.config) {
      const regionConfig = <SelectConfig>item.config['region_id'];
      const child = this.field.children['zip'];
      const countryConfig = <SelectConfig>item.config['country_id'];
      regionConfig.height = 250;
      if (!child.setting?.allow_canada) {
        const newOptions =  regionConfig.options.values.filter(region=>region['country_id'] == 1);
        regionConfig.options.values = newOptions;
        this._triggerUpdateAssetDisplay(dataKey);
      }
      // regionConfig.minimal = true;
      regionConfig.patch.callback = () => {
        this._updateRegionId(+dataKey, index);
      };
      this._updateRegionId(+dataKey, index);
    }

    if ('country_id' in item.config) {
      const countryConfig = <SelectConfig>item.config['country_id'];
      // countryConfig.minimal = true;
      countryConfig.patch.callback = () => {
        this._updateCountry(+dataKey, index);
      };
      this._updateCountry(+dataKey, index);
    }
    if ('zip' in item.config) {
      const zipConfig = <InputConfig>item.config['zip'];
      const countryConfig = <SelectConfig>item.config['country_id'];
      const child = this.field.children['zip'];
      zipConfig.validators = [Validators.required, ValidateZip];
      zipConfig.setControl();
      zipConfig.facade = true;
      zipConfig.patch.callback = () => {
        this._updateZip(+dataKey, index, child.setting);
      };
      // this._updateZip(+dataKey, index);
    }
    if ('zip_4' in item.config) {
      const zip4Config = <InputConfig>item.config['zip_4'];
      const zipConfig = <InputConfig>item.config['zip'];
      const countryConfig = <SelectConfig>item.config['country_id'];
      zip4Config.mask = '0000';

      if (this._isUSA(countryConfig)) {
        zip4Config.readonly = zipConfig.value == '' ? true : false;
      } else zip4Config.readonly = true;

      // zip4Config.minimal = true;
      zip4Config.patch.callback = () => {
        // this._updateZip(+dataKey, index);
      };
      // this._updateZip(+dataKey, index);
    }
    if ('county' in item.config) {
      const countyConfig = <InputConfig>item.config['county'];
      const countryConfig = <SelectConfig>item.config['country_id'];
      if (!this._isUSA(countryConfig)) countyConfig.readonly = true;
    }

    return true;
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/


  private _updateCountry(dataKey: number, index: number) {
    const countryConfig = <SelectConfig>this._getDataKeyItemConfig(dataKey, 'country_id');
    const child = this.field.children['country_id'];
    if (IsArray(child.source, true)) {
      const value = countryConfig.control.value;
      const option = value in child.sourceMap ? child.source[child.sourceMap[value]] : null;
      countryConfig.value = value;
      if (IsObject(option, ['name'])) {
        this._updateDisplayField(dataKey, 'country_id', option.name);
      }
      this._triggerUpdateAssetDisplay(dataKey);
    }
  }


  private _updateRegionId(dataKey: number, index: number) {
    const stateConfig = <SelectConfig>this._getDataKeyItemConfig(dataKey, 'region_id');
    const child = this.field.children['region_id'];
    if (IsArray(child.source, true)) {
      const value = stateConfig.control.value;
      if (value) {
        const option = value in child.sourceMap ? child.source[child.sourceMap[value]] : null;
        stateConfig.value = value;

        if (IsObject(option, ['name'])) {
          this._updateDisplayField(dataKey, 'region_id', option.name);
        }
        this._triggerUpdateAssetDisplay(dataKey);
      }
    }
  }

  private async _updateZip(dataKey: number, index: number, customSettings) {
    const zipConfig = <InputConfig>this._getDataKeyItemConfig(dataKey, 'zip');
    const zip4Config = <InputConfig>this._getDataKeyItemConfig(dataKey, 'zip_4');
    const countyConfig = <InputConfig>this._getDataKeyItemConfig(dataKey, 'county');
    // check for +4
    // this._validateZip(dataKey , zipConfig.control.value);
    // Get location details from zipcode
    if (zipConfig && zipConfig.control.value && (customSettings.allow_canada?String(zipConfig.control.value).length <= 6:String(zipConfig.control.value).length == 5) ) {
      zip4Config.readonly = false;
      if (customSettings?.auto_fill) {
        this.dom.state[dataKey].loading = true;
        const details = await this._getAddressFromZip(zipConfig.control.value);

        if (IsObject(details, true)) {
          let newCountry, newRegion;

          const dataKeyConfig = this.field.items[dataKey]['config'];
          if ('region_id' in dataKeyConfig) newRegion = this.field.children['region_id'].source.find(state => String(state['abbr']).toLowerCase() == String(details['state_prefix']).toLowerCase());
          if ('country_id' in dataKeyConfig) newCountry = this.field.children['country_id'].source.find(country => String(country['abbrv']).toLowerCase() == String(details['country']).toLowerCase());
          // updating location from
          // this.field.items[dataKey]['config']['zip'].triggerOnChange(zipConfig.control.value);
          // newCountry.abbrv='CAN'
          if (newCountry.abbrv == "CAN") {
            zip4Config.triggerOnChange(null);
            zip4Config.readonly = true;

            countyConfig.readonly = true;
            countyConfig.triggerOnChange(null);
          } else {
            zip4Config.readonly = false;
            countyConfig.readonly = false;
          }
          if ('city' in dataKeyConfig) {

            this.field.items[dataKey]['config']['city'].triggerOnChange(details['city']);
            this._updateDisplayField(dataKey, 'city', details['city']);
          }
          if ('county' in dataKeyConfig && newCountry.abbrv == "USA") {
            this.field.items[dataKey]['config']['county'].triggerOnChange(details['county']);
            this._updateDisplayField(dataKey, 'county', details['county']);
          }
          if ('country_id' in dataKeyConfig) {
            this.field.items[dataKey]['config']['country_id'].triggerOnChange(newCountry['id']);
            this._updateDisplayField(dataKey, 'county', newCountry['name']);
          }
          if ('region_id' in dataKeyConfig) {
            if (IsObject(newRegion, true)) {
              this.field.items[dataKey]['config']['region_id'].triggerOnChange(newRegion['id']);
            } else {
              this.field.items[dataKey]['config']['region_id'].triggerOnChange(null);
            }
          }

          this.dom.state[dataKey].loading = false;
          this.dom.state[dataKey].zipError = null;
        } else {
          this.dom.state[dataKey].zipError = 'Invalid ZipCode';
          this.dom.state[dataKey].loading = false;
        }
      }

    } else {
      this.dom.state[dataKey].zipError = 'Invalid ZipCode';
      if (zip4Config.control.value) {
        zip4Config.triggerOnChange(null);
      }
      zip4Config.readonly = true;
      zipConfig.triggerOnChange(null);
    }

    const child = this.field.children['zip'];
    if (IsArray(child.source, true)) {
      const value = zipConfig.control.value;
      // console.log(value);
      if (value) {
        const option = value in child.sourceMap ? child.source[child.sourceMap[value]] : null;
        zipConfig.value = value;
        if (IsObject(option, ['name'])) {
          this._updateDisplayField(dataKey, 'zip', option.name);
        }
        this._triggerUpdateAssetDisplay(dataKey);
      }
    }
  }
  /**
   *
   * @param countryConfig
   * @returns
   */
  private _isUSA(countryConfig) {
    if (countryConfig.value && IsArray(countryConfig?.options?.values, true)) {
      const country = countryConfig.options.values.find(country => country.value == countryConfig.value);
      if (country.name.toLowerCase().split(' ').join('') != 'unitedstates') return false
      else return true;
    } else return true;
  }
  private _getAddressFromZip(zipcode: string) {
    return new Promise((resolve, reject) => {
      PopRequest.doGet(`legacy/data/zip-codes?zip_code=${zipcode}`).subscribe(res => {
        res = GetHttpArrayResult(res).pop() || [];
        return resolve(res);

      });
    });

  }

  // private _validateZip(dataId, value) {
  //   console.log(this.field.items, dataId);
  //
  //   if (this.field.items[dataId]['config']['zip'].control.valid) {
  //     const [newZip, newZip_4] = String(value).split('-');
  //     const zip = newZip;
  //     let zip_4 = newZip_4;
  //     if (zip) {
  //       if (!zip_4) zip_4 = null;
  //       if (zip_4 && String(+zip_4).length !== 4) {
  //
  //         this.field.items[dataId]['config']['zip'].control.setErrors({zip_4: 'The +4 is invalid'});
  //         this.field.items[dataId]['config']['zip'].message = 'The +4 is invalid';
  //       } else {
  //         this.field.items[dataId]['config']['zip'].control.setErrors();
  //         this.field.items[dataId]['config']['zip'].message = '';
  //       }
  //       // const zipConfig = <InputConfig> this.field.items[ dataId ][ 'zip' ];
  //       // if( typeof zipConfig.triggerDirectPatch === 'function' ) zipConfig.triggerDirectPatch(zip);
  //       // const zip_4Config = <InputConfig> this.field.items[ dataId ][ 'zip_4' ];
  //       // if( typeof zip_4Config.triggerOnChange === 'function' ) zip_4Config.triggerOnChange(zip_4);
  //       // if( typeof zip_4Config.triggerDirectPatch === 'function' ) zip_4Config.triggerDirectPatch(zip_4);
  //     }
  //   }
  // }

  // private _getMergedZip(zip: InputConfig, zip_4: InputConfig) {
  //   if (!zip_4.mask) zip_4.mask = '90000';
  //   if (!zip_4['required']) zip_4.mask = '9' + zip_4.mask;
  //   zip.mask = '00009';
  //   zip.mask = zip.mask + '-' + zip_4.mask;
  //   zip.maxlength = null;
  //   zip.dropSpecial = false;
  //   zip.patch.disabled = true;
  //
  //   zip_4.patch.disabled = true;
  //   zip.control.setValidators([]);
  //   zip_4.control.setValidators([]);
  //   if (zip_4.control.value && zip_4.control.value) {
  //     zip.control.value = (zip.control.value + '-' + zip_4.control.value);
  //   }
  //   this.dom.state.merged = true;
  //   this.dom.store('state');
  //   return zip;
  // }

}
