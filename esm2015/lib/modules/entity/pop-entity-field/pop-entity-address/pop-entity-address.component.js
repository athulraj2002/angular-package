import { __awaiter } from "tslib";
import { Component, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import { PopRequest } from '../../../../pop-common.model';
import { PopDomService } from '../../../../services/pop-dom.service';
import { AddressFieldSetting } from './address.setting';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { GetHttpArrayResult, IsArray, IsObject } from '../../../../pop-common-utility';
import { Validators } from '@angular/forms';
import { ValidateZip } from "../../../../services/pop-validators";
export class PopEntityAddressComponent extends FieldTemplate {
    constructor(el, _domRepo) {
        super(el, _domRepo, AddressFieldSetting);
        this.el = el;
        this._domRepo = _domRepo;
        this.name = 'PopEntityAddressComponent';
        this.asset = {
            extensionKeys: [],
            states: []
        };
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
    _setInitialConfig() {
        // this.field.modal = PopEntityAddressEditComponent;
        this.field.modal = null;
    }
    /**
     * This will be different for each type of field group
     * Intended to be overridden in each class, gives the chance to mutate/transform resources if needed
     */
    _transformChildren() {
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
    _setFieldAttributes() {
        if (this.field && this.field.items) {
            Object.keys(this.field.items).map((dataKey, index) => {
                this._setFieldItemAttribute(+dataKey, index);
            });
        }
        return true;
    }
    _setFieldItemAttribute(dataKey, index) {
        var _a;
        const item = this.field.items[dataKey];
        const configKeys = Object.keys(item.config);
        this.dom.state.has_extension = configKeys.some(r => this.asset.extensionKeys.includes(r));
        if ('line_1' in item.config) {
            const line1Config = item.config['line_1'];
            line1Config.patch.callback = (_core, event) => {
            };
        }
        if ('line_2' in item.config) {
            const line2Config = item.config['line_2'];
            line2Config.patch.callback = (core, event) => {
            };
        }
        if ('line_3' in item.config) {
            const line3Config = item.config['line_3'];
            line3Config.patch.callback = (core, event) => {
            };
        }
        if ('region_id' in item.config) {
            const regionConfig = item.config['region_id'];
            const child = this.field.children['zip'];
            const countryConfig = item.config['country_id'];
            regionConfig.height = 250;
            if (!((_a = child.setting) === null || _a === void 0 ? void 0 : _a.allow_canada)) {
                const newOptions = regionConfig.options.values.filter(region => region['country_id'] == 1);
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
            const countryConfig = item.config['country_id'];
            // countryConfig.minimal = true;
            countryConfig.patch.callback = () => {
                this._updateCountry(+dataKey, index);
            };
            this._updateCountry(+dataKey, index);
        }
        if ('zip' in item.config) {
            const zipConfig = item.config['zip'];
            const countryConfig = item.config['country_id'];
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
            const zip4Config = item.config['zip_4'];
            const zipConfig = item.config['zip'];
            const countryConfig = item.config['country_id'];
            zip4Config.mask = '0000';
            if (this._isUSA(countryConfig)) {
                zip4Config.readonly = zipConfig.value == '' ? true : false;
            }
            else
                zip4Config.readonly = true;
            // zip4Config.minimal = true;
            zip4Config.patch.callback = () => {
                // this._updateZip(+dataKey, index);
            };
            // this._updateZip(+dataKey, index);
        }
        if ('county' in item.config) {
            const countyConfig = item.config['county'];
            const countryConfig = item.config['country_id'];
            if (!this._isUSA(countryConfig))
                countyConfig.readonly = true;
        }
        return true;
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    _updateCountry(dataKey, index) {
        const countryConfig = this._getDataKeyItemConfig(dataKey, 'country_id');
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
    _updateRegionId(dataKey, index) {
        const stateConfig = this._getDataKeyItemConfig(dataKey, 'region_id');
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
    _updateZip(dataKey, index, customSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            const zipConfig = this._getDataKeyItemConfig(dataKey, 'zip');
            const zip4Config = this._getDataKeyItemConfig(dataKey, 'zip_4');
            const countyConfig = this._getDataKeyItemConfig(dataKey, 'county');
            // check for +4
            // this._validateZip(dataKey , zipConfig.control.value);
            // Get location details from zipcode
            if (zipConfig && zipConfig.control.value && (customSettings.allow_canada ? String(zipConfig.control.value).length <= 6 : String(zipConfig.control.value).length == 5)) {
                zip4Config.readonly = false;
                if (customSettings === null || customSettings === void 0 ? void 0 : customSettings.auto_fill) {
                    this.dom.state[dataKey].loading = true;
                    const details = yield this._getAddressFromZip(zipConfig.control.value);
                    if (IsObject(details, true)) {
                        let newCountry, newRegion;
                        const dataKeyConfig = this.field.items[dataKey]['config'];
                        if ('region_id' in dataKeyConfig)
                            newRegion = this.field.children['region_id'].source.find(state => String(state['abbr']).toLowerCase() == String(details['state_prefix']).toLowerCase());
                        if ('country_id' in dataKeyConfig)
                            newCountry = this.field.children['country_id'].source.find(country => String(country['abbrv']).toLowerCase() == String(details['country']).toLowerCase());
                        // updating location from
                        // this.field.items[dataKey]['config']['zip'].triggerOnChange(zipConfig.control.value);
                        // newCountry.abbrv='CAN'
                        if (newCountry.abbrv == "CAN") {
                            zip4Config.triggerOnChange(null);
                            zip4Config.readonly = true;
                            countyConfig.readonly = true;
                            countyConfig.triggerOnChange(null);
                        }
                        else {
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
                            }
                            else {
                                this.field.items[dataKey]['config']['region_id'].triggerOnChange(null);
                            }
                        }
                        this.dom.state[dataKey].loading = false;
                        this.dom.state[dataKey].zipError = null;
                    }
                    else {
                        this.dom.state[dataKey].zipError = 'Invalid ZipCode';
                        this.dom.state[dataKey].loading = false;
                    }
                }
            }
            else {
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
        });
    }
    /**
     *
     * @param countryConfig
     * @returns
     */
    _isUSA(countryConfig) {
        var _a;
        if (countryConfig.value && IsArray((_a = countryConfig === null || countryConfig === void 0 ? void 0 : countryConfig.options) === null || _a === void 0 ? void 0 : _a.values, true)) {
            const country = countryConfig.options.values.find(country => country.value == countryConfig.value);
            if (country.name.toLowerCase().split(' ').join('') != 'unitedstates')
                return false;
            else
                return true;
        }
        else
            return true;
    }
    _getAddressFromZip(zipcode) {
        return new Promise((resolve, reject) => {
            PopRequest.doGet(`legacy/data/zip-codes?zip_code=${zipcode}`).subscribe(res => {
                res = GetHttpArrayResult(res).pop() || [];
                return resolve(res);
            });
        });
    }
}
PopEntityAddressComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-address',
                template: "<div class=\"pop-entity-address-field import-field-container\">\n\n  <!--<div class=\"pop-entity-address-readonly-container\" [ngClass]=\"{'sw-hidden': dom.state.template !== 'template_readonly'}\">-->\n  <div class=\"pop-entity-address-readonly-container\">\n    <div class=\"pop-entity-address-label-header\">\n      <div class=\"pop-entity-address-label pop-entity-address-label-title\" *ngIf=\"field.multiple\">\n        &nbsp;Label\n      </div>\n      <div class=\"pop-entity-address-label pop-entity-address-label-address\">\n        &nbsp;<div *ngIf=\"field.multiple\">Address</div>\n        <div *ngIf=\"!field.multiple\">{{field.entries[0].name}}</div>\n      </div>\n\n      <div class=\"pop-entity-address-label pop-entity-address-label-icon\">\n        <div class=\"import-flex-row import-flex-item-sm import-flex-grow-sm\"></div><!-- Filler -->\n        <lib-pop-entity-field-edit-icon\n          *ngIf=\"!field.multiple\"\n          class=\"import-flex-align-end\"\n          (events)=\"onActionEvent($event, 0);\" [field]=\"field\"\n          [dom]=\"dom\"\n        ></lib-pop-entity-field-edit-icon>\n      </div>\n\n    </div>\n\n    <div [ngClass]=\"{'sw-field-mar-btm-sm':isLast}\" *ngFor=\"let dataKey of field.data_keys; last as isLast;\">\n      <div *ngIf=\"field.data[dataKey]; let data;\">\n        <div *ngIf=\"field.items[dataKey].config; let items;\">\n          <div *ngIf=\"dom.state[dataKey]; let state;\">\n            <div *ngIf=\"dom.session[dataKey].display; let display;\">\n\n              <div class=\"pop-entity-address-item-header\" [ngClass]=\"{'sw-hidden':state.open}\">\n                <div class=\"pop-entity-address-item  pop-entity-address-item-title\" *ngIf=\"field.multiple\">\n                  <div>{{dom.session[ dataKey ].display.label}}</div>\n                </div>\n                <div class=\"pop-entity-address-item  pop-entity-address-item-address\">\n                  <div class=\"import-flex-row-wrap\" *ngIf=\"items['line_1'] && data['line_1']\">\n                    <div>&nbsp;{{data['line_1']}}</div>\n                  </div>\n\n                  <div class=\"import-flex-row-wrap\">\n                    <div *ngIf=\"items['line_2'] && data['line_2']\">&nbsp;{{data['line_2']}}</div>\n                    <div *ngIf=\"items['line_3'] && data['line_3']\">&nbsp;{{data['line_3']}}</div>\n                  </div>\n\n                  <div class=\"import-flex-row-wrap\">\n                    <div *ngIf=\"items['city'] && data['city']\">&nbsp;{{data['city']}}</div>\n                    <div *ngIf=\"items['city'] && data['city'] && items['region_id'] && display['region_id']\">,</div>\n                    <div *ngIf=\"items['region_id'] && display['region_id']\">\n                      &nbsp;{{display['region_id']}}</div>\n                    <div *ngIf=\"items['region_id'] && data['region_id'] && items['county'] && data['county']\">\n                      ,</div>\n                    <div *ngIf=\"items['county'] && data['county']\">&nbsp;{{data['county']}}</div>\n                    <div *ngIf=\"items['zip'] && data['zip']\">&nbsp;{{data['zip']}}</div>\n                    <div *ngIf=\"items['zip_4'] && data['zip_4']\">-{{data['zip_4']}}</div>\n                    <div *ngIf=\"items['country_id'] && display['country_id']\">&nbsp;{{display['country_id']}}</div>\n                  </div>\n\n                </div>\n                <div class=\"pop-entity-address-item-icon\">\n                  <!-- Filler -->\n                  <lib-pop-entity-field-edit-icon\n                    *ngIf=\"field.multiple\"\n                    [style.marginLeft.px]=\"-15\"\n                    (events)=\"onActionEvent($event, dataKey);\" [field]=\"field\"\n                    [dom]=\"dom\"\n                  ></lib-pop-entity-field-edit-icon>\n                </div>\n              </div>\n              <mat-divider *ngIf=\"!isLast\" [style.width.%]=\"100\" [style.marginTop.px]=\"5\"></mat-divider>\n\n              <div [ngClass]=\"{'sw-hidden':!state.open}\" class=\"pt-02 sw-pad-hrz-sm sw-mar-top-xs\">\n                <div class=\"import-flex-row import-field-flex-row-offset\">\n                  <div class=\"import-flex-row-wrap\">\n\n                    <!-- v Label and Custom lablel - turned off for now v -->\n\n                    <!--<div *ngIf=\"field.multiple && field.setting.edit_label && asset.entry; let entry;\" class=\"import-field import-field-spacing import-flex-item-sm import-flex-grow-sm\">-->\n                    <!--<lib-pop-select [config]=\"entry\"></lib-pop-select>-->\n                    <!--</div>-->\n                    <!--<div *ngIf=\"state.customLabel && asset.customLabel; let item;\" class=\"import-field import-field-spacing import-flex-item-sm import-flex-grow-sm\">-->\n                    <!--<lib-pop-input [config]=\"item\"></lib-pop-input>-->\n                    <!--</div>-->\n                    <!--<div class=\"import-flex-row-break\"></div>-->\n\n                    <!-- ^ Label and Custom lable - turned off for now ^ -->\n\n\n                    <div *ngIf=\"items['line_1']\" class=\"import-field import-field-spacing import-flex-item-full import-flex-grow-lg\">\n                      <lib-pop-input\n                        [config]=\"items['line_1']\"\n                        (events)=\"onFieldItemEvent($event, dataKey, 'line_1');\"\n                      ></lib-pop-input>\n                    </div>\n\n                    <div *ngIf=\"items['line_2']\" class=\"import-field import-field-spacing import-flex-item-sm import-flex-grow-sm\">\n                      <lib-pop-input\n                        [config]=\"items['line_2']\"\n                        (events)=\"onFieldItemEvent($event, dataKey, 'line_2');\"\n                      ></lib-pop-input>\n                    </div>\n\n                    <div *ngIf=\"items['line_3']\" class=\"import-field import-field-spacing import-flex-item-sm import-flex-grow-sm\">\n                      <lib-pop-input\n                        [config]=\"items['line_3']\"\n                        (events)=\"onFieldItemEvent($event, dataKey, 'line_3');\"\n                      ></lib-pop-input>\n                    </div>\n\n                    <div class=\"import-flex-row-break\"></div>\n                    <div *ngIf=\"items['zip']\" class=\"import-flex-row import-field-spacing import-flex-item-xs import-flex-grow-xs\">\n                      <lib-pop-input class=\"import-flex-item-xs import-flex-grow-xs\" [config]=\"items['zip']\" (events)=\"onFieldItemEvent($event, dataKey, 'zip');\"></lib-pop-input>\n                    </div>\n\n                    <div *ngIf=\"items['zip_4']\" class=\"import-flex-row import-field-spacing import-flex-item-xs import-flex-grow-xs\">\n                      <lib-pop-input class=\"import-flex-item-xs import-flex-grow-xs\" [config]=\"items['zip_4']\" (events)=\"onFieldItemEvent($event, dataKey, 'zip_4');\"></lib-pop-input>\n                    </div>\n                    <!-- Show error message -->\n\n                    <div *ngIf=\"items['zip']\" class=\"import-flex-row-break\"></div>\n\n                    <mat-progress-bar\n                    class=\"pop-field-item-loader\"\n                    *ngIf=\"state.loading\"\n                    [style.height.px]=\"1\"\n                    [mode]=\"'query'\"\n                  >\n                  </mat-progress-bar>\n\n                    <div *ngIf=\"items['zip'] && state.zipError\" class=\"import-flex-row import-field-spacing import-flex-item-xs import-flex-grow-xs\">\n\n                      <p >{{state.zipError}}</p>\n                    </div>\n                    <div class=\"import-flex-row-break\"></div>\n\n\n\n                    <div *ngIf=\"items['city']\" class=\"import-field import-field-spacing import-flex-item-xs import-flex-grow-xs\">\n                      <lib-pop-input [config]=\"items['city']\" (events)=\"onFieldItemEvent($event, dataKey, 'city');\"></lib-pop-input>\n                    </div>\n\n                    <div *ngIf=\"items['region_id']\" class=\"import-field import-field-spacing import-flex-item-xs import-flex-grow-xs\">\n                      <lib-pop-select [config]=\"items['region_id']\" (events)=\"onFieldItemEvent($event, dataKey, 'region_id');\"></lib-pop-select>\n                    </div>\n\n\n                    <div class=\"import-flex-row-break\"></div>\n\n                    <div *ngIf=\"items['county']\"\n                         class=\"import-field import-field-spacing import-flex-item-xs import-flex-grow-xs\">\n                      <lib-pop-input [config]=\"items['county']\"\n                                     (events)=\"onFieldItemEvent($event,dataKey,  'county');\"></lib-pop-input>\n                    </div>\n\n                    <div *ngIf=\"items['country_id']\"\n                         class=\"import-field import-field-spacing import-flex-item-xs import-flex-grow-xs\">\n                      <lib-pop-select [config]=\"items['country_id']\"\n                                      (events)=\"onFieldItemEvent($event, dataKey, 'country_id');\"></lib-pop-select>\n                    </div>\n                  </div>\n                </div>\n\n                <div class=\"import-field-footer sw-mar-top-sm sw-pad-rgt-lg\" *ngIf=\"field.canRemove\">\n                  <lib-pop-field-btn class=\"sw-mar-rgt-sm\" action=\"remove\" [field]=\"field\" (events)=\"onActionEvent($event, dataKey);\"></lib-pop-field-btn>\n                </div>\n\n                <div *ngIf=\"true\" class=\"import-flex-row-wrap import-flex-end sw-pad-rgt-lg sw-pad-vrt-lg\">\n                  <lib-pop-button\n                    [config]=\"{value:'Close', size: 30, color: 'accent', bubble: true, event: 'close'}\"\n                    (events)=\"onActionEvent($event, dataKey);\"\n                  ></lib-pop-button>\n                </div>\n                <div *ngIf=\"false\" class=\"import-flex-row-wrap import-flex-end sw-pad-rgt-lg sw-pad-vrt-lg\">\n                  <lib-pop-button\n                    [config]=\"{value:'Close', size: 30, color: 'accent', bubble: true, event: 'close'}\"\n                    (events)=\"onActionEvent($event);\"\n                  ></lib-pop-button>\n                </div>\n\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n",
                encapsulation: ViewEncapsulation.None,
                styles: [".pop-entity-address-field{position:relative;min-height:80px;clear:both;margin-top:17px}.pop-entity-address-readonly-container{position:relative;flex:1;border:1px solid var(--border);border-radius:3px;padding-bottom:5px}.pop-entity-address-label-header{display:flex;align-items:center;justify-content:flex-start;min-height:45px;border-bottom:1px solid var(--border)}.pop-entity-address-label-title{width:30%}.pop-entity-address-label-address{word-wrap:break-word;display:flex;flex-grow:1;width:60%}.pop-entity-address-label-icon{display:flex;width:10%}.pop-entity-address-item-title{width:25%}.pop-entity-address-item-address{display:flex;flex-grow:1;width:70%;flex-direction:column}.pop-entity-address-item-icon{display:flex;flex-direction:row;width:5%;align-items:center;justify-content:flex-start}:host ::ng-deep .pop-entity-address-item-icon mat-icon{font-size:.95em}.pop-entity-address-item-header{display:flex;align-items:flex-start;justify-content:flex-start;margin-top:5px;min-height:35px}.pop-entity-address-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 5px}.pop-entity-address-item{font-size:.8em;padding:0 5px}:host ::ng-deep lib-pop-field-item-loader{top:3rem!important}"]
            },] }
];
PopEntityAddressComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService }
];
PopEntityAddressComponent.propDecorators = {
    field: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1hZGRyZXNzLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LWZpZWxkL3BvcC1lbnRpdHktYWRkcmVzcy9wb3AtZW50aXR5LWFkZHJlc3MuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQXFCLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRW5HLE9BQU8sRUFBK0IsVUFBVSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFdkYsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3hELE9BQU8sRUFBRSw2QkFBNkIsSUFBSSxhQUFhLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUV0RyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBWSxNQUFNLGdDQUFnQyxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFRbEUsTUFBTSxPQUFPLHlCQUEwQixTQUFRLGFBQWE7SUFVMUQsWUFDUyxFQUFjLEVBQ1gsUUFBdUI7UUFFakMsS0FBSyxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUhsQyxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ1gsYUFBUSxHQUFSLFFBQVEsQ0FBZTtRQVQ1QixTQUFJLEdBQUcsMkJBQTJCLENBQUM7UUFFaEMsVUFBSyxHQUFHO1lBQ2hCLGFBQWEsRUFBRSxFQUFFO1lBQ2pCLE1BQU0sRUFBRSxF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TyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFdEIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUVMLENBQUM7OztZQW5VRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHdCQUF3QjtnQkFDbEMseXFVQUFrRDtnQkFFbEQsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7O2FBQ3RDOzs7WUFqQm1CLFVBQVU7WUFJckIsYUFBYTs7O29CQWVuQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQsIFZpZXdFbmNhcHN1bGF0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBFbnRpdHlGaWVsZENvbXBvbmVudEludGVyZmFjZSB9IGZyb20gJy4uL3BvcC1lbnRpdHktZmllbGQubW9kZWwnO1xuaW1wb3J0IHsgRmllbGRDb25maWcsIFBvcEV4dGVybmFsQXBpLCBQb3BSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBJbnB1dENvbmZpZyB9IGZyb20gJy4uLy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLWlucHV0L2lucHV0LWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBQb3BEb21TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2VydmljZXMvcG9wLWRvbS5zZXJ2aWNlJztcbmltcG9ydCB7IEFkZHJlc3NGaWVsZFNldHRpbmcgfSBmcm9tICcuL2FkZHJlc3Muc2V0dGluZyc7XG5pbXBvcnQgeyBQb3BFbnRpdHlGaWVsZEJvaWxlckNvbXBvbmVudCBhcyBGaWVsZFRlbXBsYXRlIH0gZnJvbSAnLi4vcG9wLWVudGl0eS1maWVsZC1ib2lsZXIuY29tcG9uZW50JztcbmltcG9ydCB7IFNlbGVjdENvbmZpZyB9IGZyb20gJy4uLy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXNlbGVjdC9zZWxlY3QtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IEdldEh0dHBBcnJheVJlc3VsdCwgSXNBcnJheSwgSXNPYmplY3QsIEpzb25Db3B5IH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7IFZhbGlkYXRvcnMgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBWYWxpZGF0ZVppcCB9IGZyb20gXCIuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtdmFsaWRhdG9yc1wiO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWVudGl0eS1hZGRyZXNzJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lbnRpdHktYWRkcmVzcy5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3BvcC1lbnRpdHktYWRkcmVzcy5jb21wb25lbnQuc2NzcyddLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxufSlcbmV4cG9ydCBjbGFzcyBQb3BFbnRpdHlBZGRyZXNzQ29tcG9uZW50IGV4dGVuZHMgRmllbGRUZW1wbGF0ZSBpbXBsZW1lbnRzIEVudGl0eUZpZWxkQ29tcG9uZW50SW50ZXJmYWNlLCBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGZpZWxkOiBGaWVsZENvbmZpZztcblxuICBwdWJsaWMgbmFtZSA9ICdQb3BFbnRpdHlBZGRyZXNzQ29tcG9uZW50JztcblxuICBwcm90ZWN0ZWQgYXNzZXQgPSB7XG4gICAgZXh0ZW5zaW9uS2V5czogW10sXG4gICAgc3RhdGVzOiBbXVxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgX2RvbVJlcG86IFBvcERvbVNlcnZpY2UsXG4gICkge1xuICAgIHN1cGVyKGVsLCBfZG9tUmVwbywgQWRkcmVzc0ZpZWxkU2V0dGluZyk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCBzaG91bGQgaGF2ZSBhIHNwZWNpZmljIHB1cnBvc2VcbiAgICovXG4gIG5nT25Jbml0KCkge1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgZG9tIGRlc3Ryb3kgZnVuY3Rpb24gbWFuYWdlcyBhbGwgdGhlIGNsZWFuIHVwIHRoYXQgaXMgbmVjZXNzYXJ5IGlmIHN1YnNjcmlwdGlvbnMsIHRpbWVvdXRzLCBldGMgYXJlIHN0b3JlZCBwcm9wZXJseVxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE92ZXJyaWRlIEluaGVyaXRlZCBNZXRob2RzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByb3RlY3RlZCBNZXRob2RzICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLyoqXG4gICAqIFNldCB0aGUgaW5pdGlhbCBjb25maWdcbiAgICogSW50ZW5kZWQgdG8gYmUgb3ZlcnJpZGRlbiBwZXIgZmllbGRcbiAgICovXG4gIHByb3RlY3RlZCBfc2V0SW5pdGlhbENvbmZpZygpOiB2b2lkIHtcblxuICAgIC8vIHRoaXMuZmllbGQubW9kYWwgPSBQb3BFbnRpdHlBZGRyZXNzRWRpdENvbXBvbmVudDtcbiAgICB0aGlzLmZpZWxkLm1vZGFsID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgYmUgZGlmZmVyZW50IGZvciBlYWNoIHR5cGUgb2YgZmllbGQgZ3JvdXBcbiAgICogSW50ZW5kZWQgdG8gYmUgb3ZlcnJpZGRlbiBpbiBlYWNoIGNsYXNzLCBnaXZlcyB0aGUgY2hhbmNlIHRvIG11dGF0ZS90cmFuc2Zvcm0gcmVzb3VyY2VzIGlmIG5lZWRlZFxuICAgKi9cbiAgcHJvdGVjdGVkIF90cmFuc2Zvcm1DaGlsZHJlbigpIHtcbiAgICAvLyBjb25zdCBzdGF0ZXMgPSBJc0FycmF5KHRoaXMuZmllbGQuY2hpbGRyZW5bICdyZWdpb25faWQnIF0uc291cmNlLCB0cnVlKSA/IHRoaXMuZmllbGQuY2hpbGRyZW5bICdyZWdpb25faWQnIF0uc291cmNlIDogbnVsbDtcbiAgICAvLyBpZiggc3RhdGVzICl7XG4gICAgLy8gICB0aGlzLmFzc2V0LnN0YXRlcyA9IEpzb25Db3B5KHRoaXMuZmllbGQuY2hpbGRyZW5bICdyZWdpb25faWQnIF0uc291cmNlKS5tYXAoKHN0YXRlOiBhbnkpID0+IHtcbiAgICAvLyAgICAgc3RhdGUubG9uZ19uYW1lID0gc3RhdGUubmFtZTtcbiAgICAvLyAgICAgc3RhdGUubmFtZSA9IHN0YXRlLmFiYnI7XG4gICAgLy8gICB9KTtcbiAgICAvLyB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgYmUgZGlmZmVyZW50IGZvciBlYWNoIHR5cGUgb2YgZmllbGQgZ3JvdXBcbiAgICogSW50ZW5kZWQgdG8gYmUgb3ZlcnJpZGRlbiBpbiBlYWNoIGNsYXNzXG4gICAqIFRoaXMgd2lsbCBzZXR1cCB0aGlzIGZpZWxkIHRvIGhhbmRsZSBjaGFuZ2VzIGFuZCB0cmFuc2Zvcm1hdGlvbnNcbiAgICovXG5cbiAgcHJvdGVjdGVkIF9zZXRGaWVsZEF0dHJpYnV0ZXMoKTogYm9vbGVhbiB7XG5cblxuICAgIGlmICh0aGlzLmZpZWxkICYmIHRoaXMuZmllbGQuaXRlbXMpIHtcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuZmllbGQuaXRlbXMpLm1hcCgoZGF0YUtleSwgaW5kZXgpID0+IHtcbiAgICAgICAgdGhpcy5fc2V0RmllbGRJdGVtQXR0cmlidXRlKCtkYXRhS2V5LCBpbmRleCk7XG4gICAgICB9KTtcblxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG5cbiAgcHJvdGVjdGVkIF9zZXRGaWVsZEl0ZW1BdHRyaWJ1dGUoZGF0YUtleTogbnVtYmVyLCBpbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgY29uc3QgaXRlbSA9IHRoaXMuZmllbGQuaXRlbXNbZGF0YUtleV07XG4gICAgY29uc3QgY29uZmlnS2V5cyA9IE9iamVjdC5rZXlzKGl0ZW0uY29uZmlnKTtcblxuICAgIHRoaXMuZG9tLnN0YXRlLmhhc19leHRlbnNpb24gPSBjb25maWdLZXlzLnNvbWUociA9PiB0aGlzLmFzc2V0LmV4dGVuc2lvbktleXMuaW5jbHVkZXMocikpO1xuXG4gICAgaWYgKCdsaW5lXzEnIGluIGl0ZW0uY29uZmlnKSB7XG4gICAgICBjb25zdCBsaW5lMUNvbmZpZyA9IDxTZWxlY3RDb25maWc+aXRlbS5jb25maWdbJ2xpbmVfMSddO1xuICAgICAgbGluZTFDb25maWcucGF0Y2guY2FsbGJhY2sgPSAoX2NvcmUsIGV2ZW50KSA9PiB7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmICgnbGluZV8yJyBpbiBpdGVtLmNvbmZpZykge1xuICAgICAgY29uc3QgbGluZTJDb25maWcgPSA8U2VsZWN0Q29uZmlnPml0ZW0uY29uZmlnWydsaW5lXzInXTtcbiAgICAgIGxpbmUyQ29uZmlnLnBhdGNoLmNhbGxiYWNrID0gKGNvcmUsIGV2ZW50KSA9PiB7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmICgnbGluZV8zJyBpbiBpdGVtLmNvbmZpZykge1xuICAgICAgY29uc3QgbGluZTNDb25maWcgPSA8U2VsZWN0Q29uZmlnPml0ZW0uY29uZmlnWydsaW5lXzMnXTtcbiAgICAgIGxpbmUzQ29uZmlnLnBhdGNoLmNhbGxiYWNrID0gKGNvcmUsIGV2ZW50KSA9PiB7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmICgncmVnaW9uX2lkJyBpbiBpdGVtLmNvbmZpZykge1xuICAgICAgY29uc3QgcmVnaW9uQ29uZmlnID0gPFNlbGVjdENvbmZpZz5pdGVtLmNvbmZpZ1sncmVnaW9uX2lkJ107XG4gICAgICBjb25zdCBjaGlsZCA9IHRoaXMuZmllbGQuY2hpbGRyZW5bJ3ppcCddO1xuICAgICAgY29uc3QgY291bnRyeUNvbmZpZyA9IDxTZWxlY3RDb25maWc+aXRlbS5jb25maWdbJ2NvdW50cnlfaWQnXTtcbiAgICAgIHJlZ2lvbkNvbmZpZy5oZWlnaHQgPSAyNTA7XG4gICAgICBpZiAoIWNoaWxkLnNldHRpbmc/LmFsbG93X2NhbmFkYSkge1xuICAgICAgICBjb25zdCBuZXdPcHRpb25zID0gIHJlZ2lvbkNvbmZpZy5vcHRpb25zLnZhbHVlcy5maWx0ZXIocmVnaW9uPT5yZWdpb25bJ2NvdW50cnlfaWQnXSA9PSAxKTtcbiAgICAgICAgcmVnaW9uQ29uZmlnLm9wdGlvbnMudmFsdWVzID0gbmV3T3B0aW9ucztcbiAgICAgICAgdGhpcy5fdHJpZ2dlclVwZGF0ZUFzc2V0RGlzcGxheShkYXRhS2V5KTtcbiAgICAgIH1cbiAgICAgIC8vIHJlZ2lvbkNvbmZpZy5taW5pbWFsID0gdHJ1ZTtcbiAgICAgIHJlZ2lvbkNvbmZpZy5wYXRjaC5jYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5fdXBkYXRlUmVnaW9uSWQoK2RhdGFLZXksIGluZGV4KTtcbiAgICAgIH07XG4gICAgICB0aGlzLl91cGRhdGVSZWdpb25JZCgrZGF0YUtleSwgaW5kZXgpO1xuICAgIH1cblxuICAgIGlmICgnY291bnRyeV9pZCcgaW4gaXRlbS5jb25maWcpIHtcbiAgICAgIGNvbnN0IGNvdW50cnlDb25maWcgPSA8U2VsZWN0Q29uZmlnPml0ZW0uY29uZmlnWydjb3VudHJ5X2lkJ107XG4gICAgICAvLyBjb3VudHJ5Q29uZmlnLm1pbmltYWwgPSB0cnVlO1xuICAgICAgY291bnRyeUNvbmZpZy5wYXRjaC5jYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5fdXBkYXRlQ291bnRyeSgrZGF0YUtleSwgaW5kZXgpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuX3VwZGF0ZUNvdW50cnkoK2RhdGFLZXksIGluZGV4KTtcbiAgICB9XG4gICAgaWYgKCd6aXAnIGluIGl0ZW0uY29uZmlnKSB7XG4gICAgICBjb25zdCB6aXBDb25maWcgPSA8SW5wdXRDb25maWc+aXRlbS5jb25maWdbJ3ppcCddO1xuICAgICAgY29uc3QgY291bnRyeUNvbmZpZyA9IDxTZWxlY3RDb25maWc+aXRlbS5jb25maWdbJ2NvdW50cnlfaWQnXTtcbiAgICAgIGNvbnN0IGNoaWxkID0gdGhpcy5maWVsZC5jaGlsZHJlblsnemlwJ107XG4gICAgICB6aXBDb25maWcudmFsaWRhdG9ycyA9IFtWYWxpZGF0b3JzLnJlcXVpcmVkLCBWYWxpZGF0ZVppcF07XG4gICAgICB6aXBDb25maWcuc2V0Q29udHJvbCgpO1xuICAgICAgemlwQ29uZmlnLmZhY2FkZSA9IHRydWU7XG4gICAgICB6aXBDb25maWcucGF0Y2guY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVppcCgrZGF0YUtleSwgaW5kZXgsIGNoaWxkLnNldHRpbmcpO1xuICAgICAgfTtcbiAgICAgIC8vIHRoaXMuX3VwZGF0ZVppcCgrZGF0YUtleSwgaW5kZXgpO1xuICAgIH1cbiAgICBpZiAoJ3ppcF80JyBpbiBpdGVtLmNvbmZpZykge1xuICAgICAgY29uc3QgemlwNENvbmZpZyA9IDxJbnB1dENvbmZpZz5pdGVtLmNvbmZpZ1snemlwXzQnXTtcbiAgICAgIGNvbnN0IHppcENvbmZpZyA9IDxJbnB1dENvbmZpZz5pdGVtLmNvbmZpZ1snemlwJ107XG4gICAgICBjb25zdCBjb3VudHJ5Q29uZmlnID0gPFNlbGVjdENvbmZpZz5pdGVtLmNvbmZpZ1snY291bnRyeV9pZCddO1xuICAgICAgemlwNENvbmZpZy5tYXNrID0gJzAwMDAnO1xuXG4gICAgICBpZiAodGhpcy5faXNVU0EoY291bnRyeUNvbmZpZykpIHtcbiAgICAgICAgemlwNENvbmZpZy5yZWFkb25seSA9IHppcENvbmZpZy52YWx1ZSA9PSAnJyA/IHRydWUgOiBmYWxzZTtcbiAgICAgIH0gZWxzZSB6aXA0Q29uZmlnLnJlYWRvbmx5ID0gdHJ1ZTtcblxuICAgICAgLy8gemlwNENvbmZpZy5taW5pbWFsID0gdHJ1ZTtcbiAgICAgIHppcDRDb25maWcucGF0Y2guY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgIC8vIHRoaXMuX3VwZGF0ZVppcCgrZGF0YUtleSwgaW5kZXgpO1xuICAgICAgfTtcbiAgICAgIC8vIHRoaXMuX3VwZGF0ZVppcCgrZGF0YUtleSwgaW5kZXgpO1xuICAgIH1cbiAgICBpZiAoJ2NvdW50eScgaW4gaXRlbS5jb25maWcpIHtcbiAgICAgIGNvbnN0IGNvdW50eUNvbmZpZyA9IDxJbnB1dENvbmZpZz5pdGVtLmNvbmZpZ1snY291bnR5J107XG4gICAgICBjb25zdCBjb3VudHJ5Q29uZmlnID0gPFNlbGVjdENvbmZpZz5pdGVtLmNvbmZpZ1snY291bnRyeV9pZCddO1xuICAgICAgaWYgKCF0aGlzLl9pc1VTQShjb3VudHJ5Q29uZmlnKSkgY291bnR5Q29uZmlnLnJlYWRvbmx5ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICBwcml2YXRlIF91cGRhdGVDb3VudHJ5KGRhdGFLZXk6IG51bWJlciwgaW5kZXg6IG51bWJlcikge1xuICAgIGNvbnN0IGNvdW50cnlDb25maWcgPSA8U2VsZWN0Q29uZmlnPnRoaXMuX2dldERhdGFLZXlJdGVtQ29uZmlnKGRhdGFLZXksICdjb3VudHJ5X2lkJyk7XG4gICAgY29uc3QgY2hpbGQgPSB0aGlzLmZpZWxkLmNoaWxkcmVuWydjb3VudHJ5X2lkJ107XG4gICAgaWYgKElzQXJyYXkoY2hpbGQuc291cmNlLCB0cnVlKSkge1xuICAgICAgY29uc3QgdmFsdWUgPSBjb3VudHJ5Q29uZmlnLmNvbnRyb2wudmFsdWU7XG4gICAgICBjb25zdCBvcHRpb24gPSB2YWx1ZSBpbiBjaGlsZC5zb3VyY2VNYXAgPyBjaGlsZC5zb3VyY2VbY2hpbGQuc291cmNlTWFwW3ZhbHVlXV0gOiBudWxsO1xuICAgICAgY291bnRyeUNvbmZpZy52YWx1ZSA9IHZhbHVlO1xuICAgICAgaWYgKElzT2JqZWN0KG9wdGlvbiwgWyduYW1lJ10pKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZURpc3BsYXlGaWVsZChkYXRhS2V5LCAnY291bnRyeV9pZCcsIG9wdGlvbi5uYW1lKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3RyaWdnZXJVcGRhdGVBc3NldERpc3BsYXkoZGF0YUtleSk7XG4gICAgfVxuICB9XG5cblxuICBwcml2YXRlIF91cGRhdGVSZWdpb25JZChkYXRhS2V5OiBudW1iZXIsIGluZGV4OiBudW1iZXIpIHtcbiAgICBjb25zdCBzdGF0ZUNvbmZpZyA9IDxTZWxlY3RDb25maWc+dGhpcy5fZ2V0RGF0YUtleUl0ZW1Db25maWcoZGF0YUtleSwgJ3JlZ2lvbl9pZCcpO1xuICAgIGNvbnN0IGNoaWxkID0gdGhpcy5maWVsZC5jaGlsZHJlblsncmVnaW9uX2lkJ107XG4gICAgaWYgKElzQXJyYXkoY2hpbGQuc291cmNlLCB0cnVlKSkge1xuICAgICAgY29uc3QgdmFsdWUgPSBzdGF0ZUNvbmZpZy5jb250cm9sLnZhbHVlO1xuICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHZhbHVlIGluIGNoaWxkLnNvdXJjZU1hcCA/IGNoaWxkLnNvdXJjZVtjaGlsZC5zb3VyY2VNYXBbdmFsdWVdXSA6IG51bGw7XG4gICAgICAgIHN0YXRlQ29uZmlnLnZhbHVlID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKElzT2JqZWN0KG9wdGlvbiwgWyduYW1lJ10pKSB7XG4gICAgICAgICAgdGhpcy5fdXBkYXRlRGlzcGxheUZpZWxkKGRhdGFLZXksICdyZWdpb25faWQnLCBvcHRpb24ubmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdHJpZ2dlclVwZGF0ZUFzc2V0RGlzcGxheShkYXRhS2V5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIF91cGRhdGVaaXAoZGF0YUtleTogbnVtYmVyLCBpbmRleDogbnVtYmVyLCBjdXN0b21TZXR0aW5ncykge1xuICAgIGNvbnN0IHppcENvbmZpZyA9IDxJbnB1dENvbmZpZz50aGlzLl9nZXREYXRhS2V5SXRlbUNvbmZpZyhkYXRhS2V5LCAnemlwJyk7XG4gICAgY29uc3QgemlwNENvbmZpZyA9IDxJbnB1dENvbmZpZz50aGlzLl9nZXREYXRhS2V5SXRlbUNvbmZpZyhkYXRhS2V5LCAnemlwXzQnKTtcbiAgICBjb25zdCBjb3VudHlDb25maWcgPSA8SW5wdXRDb25maWc+dGhpcy5fZ2V0RGF0YUtleUl0ZW1Db25maWcoZGF0YUtleSwgJ2NvdW50eScpO1xuICAgIC8vIGNoZWNrIGZvciArNFxuICAgIC8vIHRoaXMuX3ZhbGlkYXRlWmlwKGRhdGFLZXkgLCB6aXBDb25maWcuY29udHJvbC52YWx1ZSk7XG4gICAgLy8gR2V0IGxvY2F0aW9uIGRldGFpbHMgZnJvbSB6aXBjb2RlXG4gICAgaWYgKHppcENvbmZpZyAmJiB6aXBDb25maWcuY29udHJvbC52YWx1ZSAmJiAoY3VzdG9tU2V0dGluZ3MuYWxsb3dfY2FuYWRhP1N0cmluZyh6aXBDb25maWcuY29udHJvbC52YWx1ZSkubGVuZ3RoIDw9IDY6U3RyaW5nKHppcENvbmZpZy5jb250cm9sLnZhbHVlKS5sZW5ndGggPT0gNSkgKSB7XG4gICAgICB6aXA0Q29uZmlnLnJlYWRvbmx5ID0gZmFsc2U7XG4gICAgICBpZiAoY3VzdG9tU2V0dGluZ3M/LmF1dG9fZmlsbCkge1xuICAgICAgICB0aGlzLmRvbS5zdGF0ZVtkYXRhS2V5XS5sb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgZGV0YWlscyA9IGF3YWl0IHRoaXMuX2dldEFkZHJlc3NGcm9tWmlwKHppcENvbmZpZy5jb250cm9sLnZhbHVlKTtcblxuICAgICAgICBpZiAoSXNPYmplY3QoZGV0YWlscywgdHJ1ZSkpIHtcbiAgICAgICAgICBsZXQgbmV3Q291bnRyeSwgbmV3UmVnaW9uO1xuXG4gICAgICAgICAgY29uc3QgZGF0YUtleUNvbmZpZyA9IHRoaXMuZmllbGQuaXRlbXNbZGF0YUtleV1bJ2NvbmZpZyddO1xuICAgICAgICAgIGlmICgncmVnaW9uX2lkJyBpbiBkYXRhS2V5Q29uZmlnKSBuZXdSZWdpb24gPSB0aGlzLmZpZWxkLmNoaWxkcmVuWydyZWdpb25faWQnXS5zb3VyY2UuZmluZChzdGF0ZSA9PiBTdHJpbmcoc3RhdGVbJ2FiYnInXSkudG9Mb3dlckNhc2UoKSA9PSBTdHJpbmcoZGV0YWlsc1snc3RhdGVfcHJlZml4J10pLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgIGlmICgnY291bnRyeV9pZCcgaW4gZGF0YUtleUNvbmZpZykgbmV3Q291bnRyeSA9IHRoaXMuZmllbGQuY2hpbGRyZW5bJ2NvdW50cnlfaWQnXS5zb3VyY2UuZmluZChjb3VudHJ5ID0+IFN0cmluZyhjb3VudHJ5WydhYmJydiddKS50b0xvd2VyQ2FzZSgpID09IFN0cmluZyhkZXRhaWxzWydjb3VudHJ5J10pLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgIC8vIHVwZGF0aW5nIGxvY2F0aW9uIGZyb21cbiAgICAgICAgICAvLyB0aGlzLmZpZWxkLml0ZW1zW2RhdGFLZXldWydjb25maWcnXVsnemlwJ10udHJpZ2dlck9uQ2hhbmdlKHppcENvbmZpZy5jb250cm9sLnZhbHVlKTtcbiAgICAgICAgICAvLyBuZXdDb3VudHJ5LmFiYnJ2PSdDQU4nXG4gICAgICAgICAgaWYgKG5ld0NvdW50cnkuYWJicnYgPT0gXCJDQU5cIikge1xuICAgICAgICAgICAgemlwNENvbmZpZy50cmlnZ2VyT25DaGFuZ2UobnVsbCk7XG4gICAgICAgICAgICB6aXA0Q29uZmlnLnJlYWRvbmx5ID0gdHJ1ZTtcblxuICAgICAgICAgICAgY291bnR5Q29uZmlnLnJlYWRvbmx5ID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvdW50eUNvbmZpZy50cmlnZ2VyT25DaGFuZ2UobnVsbCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHppcDRDb25maWcucmVhZG9ubHkgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvdW50eUNvbmZpZy5yZWFkb25seSA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoJ2NpdHknIGluIGRhdGFLZXlDb25maWcpIHtcblxuICAgICAgICAgICAgdGhpcy5maWVsZC5pdGVtc1tkYXRhS2V5XVsnY29uZmlnJ11bJ2NpdHknXS50cmlnZ2VyT25DaGFuZ2UoZGV0YWlsc1snY2l0eSddKTtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURpc3BsYXlGaWVsZChkYXRhS2V5LCAnY2l0eScsIGRldGFpbHNbJ2NpdHknXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgnY291bnR5JyBpbiBkYXRhS2V5Q29uZmlnICYmIG5ld0NvdW50cnkuYWJicnYgPT0gXCJVU0FcIikge1xuICAgICAgICAgICAgdGhpcy5maWVsZC5pdGVtc1tkYXRhS2V5XVsnY29uZmlnJ11bJ2NvdW50eSddLnRyaWdnZXJPbkNoYW5nZShkZXRhaWxzWydjb3VudHknXSk7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVEaXNwbGF5RmllbGQoZGF0YUtleSwgJ2NvdW50eScsIGRldGFpbHNbJ2NvdW50eSddKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCdjb3VudHJ5X2lkJyBpbiBkYXRhS2V5Q29uZmlnKSB7XG4gICAgICAgICAgICB0aGlzLmZpZWxkLml0ZW1zW2RhdGFLZXldWydjb25maWcnXVsnY291bnRyeV9pZCddLnRyaWdnZXJPbkNoYW5nZShuZXdDb3VudHJ5WydpZCddKTtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURpc3BsYXlGaWVsZChkYXRhS2V5LCAnY291bnR5JywgbmV3Q291bnRyeVsnbmFtZSddKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCdyZWdpb25faWQnIGluIGRhdGFLZXlDb25maWcpIHtcbiAgICAgICAgICAgIGlmIChJc09iamVjdChuZXdSZWdpb24sIHRydWUpKSB7XG4gICAgICAgICAgICAgIHRoaXMuZmllbGQuaXRlbXNbZGF0YUtleV1bJ2NvbmZpZyddWydyZWdpb25faWQnXS50cmlnZ2VyT25DaGFuZ2UobmV3UmVnaW9uWydpZCddKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuZmllbGQuaXRlbXNbZGF0YUtleV1bJ2NvbmZpZyddWydyZWdpb25faWQnXS50cmlnZ2VyT25DaGFuZ2UobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5kb20uc3RhdGVbZGF0YUtleV0ubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMuZG9tLnN0YXRlW2RhdGFLZXldLnppcEVycm9yID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmRvbS5zdGF0ZVtkYXRhS2V5XS56aXBFcnJvciA9ICdJbnZhbGlkIFppcENvZGUnO1xuICAgICAgICAgIHRoaXMuZG9tLnN0YXRlW2RhdGFLZXldLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZG9tLnN0YXRlW2RhdGFLZXldLnppcEVycm9yID0gJ0ludmFsaWQgWmlwQ29kZSc7XG4gICAgICBpZiAoemlwNENvbmZpZy5jb250cm9sLnZhbHVlKSB7XG4gICAgICAgIHppcDRDb25maWcudHJpZ2dlck9uQ2hhbmdlKG51bGwpO1xuICAgICAgfVxuICAgICAgemlwNENvbmZpZy5yZWFkb25seSA9IHRydWU7XG4gICAgICB6aXBDb25maWcudHJpZ2dlck9uQ2hhbmdlKG51bGwpO1xuICAgIH1cblxuICAgIGNvbnN0IGNoaWxkID0gdGhpcy5maWVsZC5jaGlsZHJlblsnemlwJ107XG4gICAgaWYgKElzQXJyYXkoY2hpbGQuc291cmNlLCB0cnVlKSkge1xuICAgICAgY29uc3QgdmFsdWUgPSB6aXBDb25maWcuY29udHJvbC52YWx1ZTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICBjb25zdCBvcHRpb24gPSB2YWx1ZSBpbiBjaGlsZC5zb3VyY2VNYXAgPyBjaGlsZC5zb3VyY2VbY2hpbGQuc291cmNlTWFwW3ZhbHVlXV0gOiBudWxsO1xuICAgICAgICB6aXBDb25maWcudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgaWYgKElzT2JqZWN0KG9wdGlvbiwgWyduYW1lJ10pKSB7XG4gICAgICAgICAgdGhpcy5fdXBkYXRlRGlzcGxheUZpZWxkKGRhdGFLZXksICd6aXAnLCBvcHRpb24ubmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdHJpZ2dlclVwZGF0ZUFzc2V0RGlzcGxheShkYXRhS2V5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSBjb3VudHJ5Q29uZmlnXG4gICAqIEByZXR1cm5zXG4gICAqL1xuICBwcml2YXRlIF9pc1VTQShjb3VudHJ5Q29uZmlnKSB7XG4gICAgaWYgKGNvdW50cnlDb25maWcudmFsdWUgJiYgSXNBcnJheShjb3VudHJ5Q29uZmlnPy5vcHRpb25zPy52YWx1ZXMsIHRydWUpKSB7XG4gICAgICBjb25zdCBjb3VudHJ5ID0gY291bnRyeUNvbmZpZy5vcHRpb25zLnZhbHVlcy5maW5kKGNvdW50cnkgPT4gY291bnRyeS52YWx1ZSA9PSBjb3VudHJ5Q29uZmlnLnZhbHVlKTtcbiAgICAgIGlmIChjb3VudHJ5Lm5hbWUudG9Mb3dlckNhc2UoKS5zcGxpdCgnICcpLmpvaW4oJycpICE9ICd1bml0ZWRzdGF0ZXMnKSByZXR1cm4gZmFsc2VcbiAgICAgIGVsc2UgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHJldHVybiB0cnVlO1xuICB9XG4gIHByaXZhdGUgX2dldEFkZHJlc3NGcm9tWmlwKHppcGNvZGU6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBQb3BSZXF1ZXN0LmRvR2V0KGBsZWdhY3kvZGF0YS96aXAtY29kZXM/emlwX2NvZGU9JHt6aXBjb2RlfWApLnN1YnNjcmliZShyZXMgPT4ge1xuICAgICAgICByZXMgPSBHZXRIdHRwQXJyYXlSZXN1bHQocmVzKS5wb3AoKSB8fCBbXTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUocmVzKTtcblxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgfVxuXG4gIC8vIHByaXZhdGUgX3ZhbGlkYXRlWmlwKGRhdGFJZCwgdmFsdWUpIHtcbiAgLy8gICBjb25zb2xlLmxvZyh0aGlzLmZpZWxkLml0ZW1zLCBkYXRhSWQpO1xuICAvL1xuICAvLyAgIGlmICh0aGlzLmZpZWxkLml0ZW1zW2RhdGFJZF1bJ2NvbmZpZyddWyd6aXAnXS5jb250cm9sLnZhbGlkKSB7XG4gIC8vICAgICBjb25zdCBbbmV3WmlwLCBuZXdaaXBfNF0gPSBTdHJpbmcodmFsdWUpLnNwbGl0KCctJyk7XG4gIC8vICAgICBjb25zdCB6aXAgPSBuZXdaaXA7XG4gIC8vICAgICBsZXQgemlwXzQgPSBuZXdaaXBfNDtcbiAgLy8gICAgIGlmICh6aXApIHtcbiAgLy8gICAgICAgaWYgKCF6aXBfNCkgemlwXzQgPSBudWxsO1xuICAvLyAgICAgICBpZiAoemlwXzQgJiYgU3RyaW5nKCt6aXBfNCkubGVuZ3RoICE9PSA0KSB7XG4gIC8vXG4gIC8vICAgICAgICAgdGhpcy5maWVsZC5pdGVtc1tkYXRhSWRdWydjb25maWcnXVsnemlwJ10uY29udHJvbC5zZXRFcnJvcnMoe3ppcF80OiAnVGhlICs0IGlzIGludmFsaWQnfSk7XG4gIC8vICAgICAgICAgdGhpcy5maWVsZC5pdGVtc1tkYXRhSWRdWydjb25maWcnXVsnemlwJ10ubWVzc2FnZSA9ICdUaGUgKzQgaXMgaW52YWxpZCc7XG4gIC8vICAgICAgIH0gZWxzZSB7XG4gIC8vICAgICAgICAgdGhpcy5maWVsZC5pdGVtc1tkYXRhSWRdWydjb25maWcnXVsnemlwJ10uY29udHJvbC5zZXRFcnJvcnMoKTtcbiAgLy8gICAgICAgICB0aGlzLmZpZWxkLml0ZW1zW2RhdGFJZF1bJ2NvbmZpZyddWyd6aXAnXS5tZXNzYWdlID0gJyc7XG4gIC8vICAgICAgIH1cbiAgLy8gICAgICAgLy8gY29uc3QgemlwQ29uZmlnID0gPElucHV0Q29uZmlnPiB0aGlzLmZpZWxkLml0ZW1zWyBkYXRhSWQgXVsgJ3ppcCcgXTtcbiAgLy8gICAgICAgLy8gaWYoIHR5cGVvZiB6aXBDb25maWcudHJpZ2dlckRpcmVjdFBhdGNoID09PSAnZnVuY3Rpb24nICkgemlwQ29uZmlnLnRyaWdnZXJEaXJlY3RQYXRjaCh6aXApO1xuICAvLyAgICAgICAvLyBjb25zdCB6aXBfNENvbmZpZyA9IDxJbnB1dENvbmZpZz4gdGhpcy5maWVsZC5pdGVtc1sgZGF0YUlkIF1bICd6aXBfNCcgXTtcbiAgLy8gICAgICAgLy8gaWYoIHR5cGVvZiB6aXBfNENvbmZpZy50cmlnZ2VyT25DaGFuZ2UgPT09ICdmdW5jdGlvbicgKSB6aXBfNENvbmZpZy50cmlnZ2VyT25DaGFuZ2UoemlwXzQpO1xuICAvLyAgICAgICAvLyBpZiggdHlwZW9mIHppcF80Q29uZmlnLnRyaWdnZXJEaXJlY3RQYXRjaCA9PT0gJ2Z1bmN0aW9uJyApIHppcF80Q29uZmlnLnRyaWdnZXJEaXJlY3RQYXRjaCh6aXBfNCk7XG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvLyB9XG5cbiAgLy8gcHJpdmF0ZSBfZ2V0TWVyZ2VkWmlwKHppcDogSW5wdXRDb25maWcsIHppcF80OiBJbnB1dENvbmZpZykge1xuICAvLyAgIGlmICghemlwXzQubWFzaykgemlwXzQubWFzayA9ICc5MDAwMCc7XG4gIC8vICAgaWYgKCF6aXBfNFsncmVxdWlyZWQnXSkgemlwXzQubWFzayA9ICc5JyArIHppcF80Lm1hc2s7XG4gIC8vICAgemlwLm1hc2sgPSAnMDAwMDknO1xuICAvLyAgIHppcC5tYXNrID0gemlwLm1hc2sgKyAnLScgKyB6aXBfNC5tYXNrO1xuICAvLyAgIHppcC5tYXhsZW5ndGggPSBudWxsO1xuICAvLyAgIHppcC5kcm9wU3BlY2lhbCA9IGZhbHNlO1xuICAvLyAgIHppcC5wYXRjaC5kaXNhYmxlZCA9IHRydWU7XG4gIC8vXG4gIC8vICAgemlwXzQucGF0Y2guZGlzYWJsZWQgPSB0cnVlO1xuICAvLyAgIHppcC5jb250cm9sLnNldFZhbGlkYXRvcnMoW10pO1xuICAvLyAgIHppcF80LmNvbnRyb2wuc2V0VmFsaWRhdG9ycyhbXSk7XG4gIC8vICAgaWYgKHppcF80LmNvbnRyb2wudmFsdWUgJiYgemlwXzQuY29udHJvbC52YWx1ZSkge1xuICAvLyAgICAgemlwLmNvbnRyb2wudmFsdWUgPSAoemlwLmNvbnRyb2wudmFsdWUgKyAnLScgKyB6aXBfNC5jb250cm9sLnZhbHVlKTtcbiAgLy8gICB9XG4gIC8vICAgdGhpcy5kb20uc3RhdGUubWVyZ2VkID0gdHJ1ZTtcbiAgLy8gICB0aGlzLmRvbS5zdG9yZSgnc3RhdGUnKTtcbiAgLy8gICByZXR1cm4gemlwO1xuICAvLyB9XG5cbn1cbiJdfQ==