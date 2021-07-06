import { Component, ElementRef, Input } from '@angular/core';
import { ArrayMapSetter, IsArray, IsObject, SnakeToPascal, TitleCase } from '../../../../pop-common-utility';
import { PopDomService } from '../../../../services/pop-dom.service';
import { ButtonConfig } from '../../../base/pop-field-item/pop-button/button-config.model';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { PhoneFieldSetting } from './phone.setting';
export class PopEntityPhoneComponent extends FieldTemplate {
    constructor(el, _domRepo) {
        super(el, _domRepo, PhoneFieldSetting);
        this.el = el;
        this._domRepo = _domRepo;
        this.name = 'PopEntityPhoneComponent';
        this.asset = {
            extensionKeys: ['type', 'voice_button', 'sms_button', 'do_not_call', 'do_not_sms', 'country_id'],
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
     * Builds the display string
     * @param dataKey
     */
    _getAssetDisplayStr(dataKey) {
        let str = '';
        const display = this.dom.session[dataKey].display;
        const items = this._getDataKeyItemConfig(dataKey);
        if ('country_id' in items && display['country_id']) {
            str += `+${display['country_id']} `;
        }
        if (display['number']) {
            str += `${display['number']}`;
        }
        if ('extension' in items && display['extension']) {
            str += ` Ext. ${display['extension']} `;
        }
        return str;
    }
    /**
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
        this.ui.actionBtnWidth = 50;
        let hasCallBtn = false;
        let hasTextBtn = false;
        const item = this.field.items[dataKey];
        const configKeys = Object.keys(item.config);
        this.dom.state.has_extension = configKeys.some(r => this.asset.extensionKeys.includes(r));
        this.ui.asset[dataKey].canCallBtn = new ButtonConfig({
            icon: 'local_phone',
            value: null,
            // disabled: true
        });
        this.ui.asset[dataKey].canTextBtn = new ButtonConfig({
            icon: 'textsms',
            value: null,
            // disabled: true
        });
        if ('type' in item.config) {
            // If type is set, use as the label of the phone number
            const typeConfig = item.config['type'];
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
        if ('stop_call_at' in item.config) {
            // ToDo:: Figure out what this button will actually do
            hasCallBtn = true;
        }
        if ('stop_text_at' in item.config) {
            // ToDo:: Figure out what this button will actually do
            hasTextBtn = true;
        }
        if ('country_id' in item.config) {
            const countryConfig = item.config['country_id'];
            countryConfig.patch.callback = () => {
                this._updateCountry(+dataKey, index);
            };
            this._updateCountry(+dataKey, index);
        }
        if ('number' in item.config) {
            const numberConfig = item.config['number'];
            numberConfig.mask = '(000) 000-0000';
            numberConfig.dropSpecial = false;
            numberConfig.patch.callback = () => {
                this._updateNumber(+dataKey, index);
            };
            this._updateNumber(+dataKey, index);
        }
        if ('extension' in item.config) {
            const extConfig = item.config['extension'];
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
        if (hasCallBtn)
            this.ui.actionBtnWidth += 50;
        if (hasTextBtn)
            this.ui.actionBtnWidth += 50;
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
        if (countryConfig.metadata.source) {
            const source = countryConfig.metadata.source;
            const sourceMap = countryConfig.metadata.map.source;
            const value = countryConfig.control.value;
            const option = value in sourceMap ? source[sourceMap[value]] : null;
            countryConfig.value = value;
            console.log('_updateCountry option', option);
            if (IsObject(option, ['phone_country_code'])) {
                this._updateDisplayField(dataKey, 'country_id', option.phone_country_code);
            }
            this._triggerUpdateAssetDisplay(dataKey);
        }
    }
    _updateNumber(dataKey, index) {
        const numberConfig = this._getDataKeyItemConfig(dataKey, 'number');
        const value = numberConfig.control.value;
        this._updateDisplayField(dataKey, 'number', value);
        numberConfig.value = value;
        this._triggerUpdateAssetDisplay(dataKey);
    }
    _updateExtension(dataKey, index) {
        const extConfig = this._getDataKeyItemConfig(dataKey, 'extension');
        const value = extConfig.control.value;
        this._updateDisplayField(dataKey, 'extension', value);
        this._triggerUpdateAssetDisplay(dataKey);
    }
    _updateNumberLabel(dataKey, index) {
        if (this.field.multiple && IsArray(this.field.entries, true)) {
            this._updateNumberLabelToMatchEntry(index);
        }
        else {
            this._updateNumberLabelToMatchType(+dataKey);
        }
        this._triggerUpdateAssetDisplay(dataKey);
    }
    _updateNumberLabelToMatchEntry(index) {
        const entry = this._getValueEntry(index);
        const typeConfig = this._getDataKeyItemConfig(this.field.data_keys[index], 'type');
        const numberConfig = this._getDataKeyItemConfig(this.field.data_keys[index], 'number');
        const stored = this._getDataKey(this.field.data_keys[index], 'type');
        const display = this.ui.asset[this.field.data_keys[index]].display;
        if (entry && entry.type && !stored) {
            typeConfig.control.setValue(entry.type);
        }
        const value = entry ? (entry.name ? entry.name : this._getTypeOptionName(entry.type, index)) : (numberConfig.label ? numberConfig.label : '');
        if (value) {
            numberConfig.label = value;
            display.label = value;
        }
    }
    /**
     * The label of value entry should match the type
     * @param dataKey
     */
    _updateNumberLabelToMatchType(dataKey) {
        const typeConfig = this._getDataKeyItemConfig(dataKey, 'type');
        const numberConfig = this._getDataKeyItemConfig(dataKey, 'number');
        const optionsMap = ArrayMapSetter(typeConfig.options.values, 'value');
        const value = typeConfig.control.value;
        const display = this.ui.asset[dataKey].display;
        const option = value in optionsMap ? typeConfig.options.values[optionsMap[value]] : null;
        numberConfig.label = option ? option.name : TitleCase(SnakeToPascal(value));
        display.label = numberConfig.label;
    }
}
PopEntityPhoneComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-phone',
                template: "<div class=\"pop-entity-phone-field import-field-container\">\n  <div *ngFor=\"let dataKey of field.data_keys\">\n    <div *ngIf=\"field.items[dataKey].config; let items;\">\n      <div *ngIf=\"dom.state.loaded && ui.asset[dataKey]; let asset\">\n        <div *ngIf=\"dom.state[dataKey]; let state;\">\n\n          <div class=\"import-flex-row import-field-flex-row-offset\" [ngClass]=\"{'sw-disabled':state.open}\">\n            <div class=\"import-flex-row-wrap\">\n              <div class=\"import-field import-field-spacing import-flex-item-sm import-flex-grow-sm\">\n                <lib-pop-input class=\"pop-entity-phone-display\" [config]=\"asset.display\"></lib-pop-input>\n              </div>\n\n              <div class=\"pop-entity-phone-btn-container\" [style.width.px]=\"ui.actionBtnWidth\">\n                <div *ngIf=\"items['stop_call_at'] && !items['stop_call_at'].control.value\" class=\"import-field import-flex-item-icon\">\n                  <lib-pop-button\n                    [config]=\"asset.canCallBtn\"\n                    (events)=\"onActionEvent($event, dataKey);\"\n                  ></lib-pop-button>\n                </div>\n\n                <div *ngIf=\"items['stop_text_at'] && !items['stop_text_at'].control.value\" class=\"import-field import-flex-item-icon\">\n                  <lib-pop-button\n                    [config]=\"asset.canTextBtn\"\n                    (events)=\"onActionEvent($event, dataKey);\"\n                  ></lib-pop-button>\n                </div>\n\n                <div *ngIf=\"true\" class=\"import-field import-flex-item-icon sw-pad-rgt-md\">\n                  <lib-pop-entity-field-edit-icon\n                    (events)=\"onActionEvent($event, dataKey);\" [field]=\"this.field\"\n                    [dom]=\"dom\"\n                  ></lib-pop-entity-field-edit-icon>\n                </div>\n              </div>\n            </div>\n          </div>\n\n          <!-- extension box -->\n\n          <div [ngClass]=\"{'sw-hidden':!state.open}\" class=\"import-flex-row-wrap pt-02 sw-pad-lft-sm sw-pad-rgt-sm  sw-mar-top-sm\">\n            <div class=\"import-flex-row-wrap\">\n\n\n              <!--<div *ngIf=\"field.multiple && field.setting.edit_label && asset.entry; let entry;\" class=\"import-field import-field-spacing import-flex-item-sm import-flex-grow-sm\">-->\n              <!--<lib-pop-select [config]=\"entry\"></lib-pop-select>-->\n              <!--</div>-->\n              <!--<div *ngIf=\"state.customLabel && asset.customLabel; let item;\" class=\"import-field import-field-spacing import-flex-item-sm import-flex-grow-sm\">-->\n              <!--<lib-pop-input [config]=\"item\"></lib-pop-input>-->\n              <!--</div>-->\n              <!--<div class=\"import-flex-row-break\"></div>-->\n\n              <!--<div class=\"import-flex-column-lg\">-->\n                <div *ngIf=\"items['country_id']\" class=\"import-field import-field-spacing import-flex-item-xs import-flex-grow-xs\">\n                  <lib-pop-select\n                    [config]=\"items['country_id']\"\n                    (events)=\"onFieldItemEvent($event, dataKey, 'country_id');\"\n                  ></lib-pop-select>\n                </div>\n\n                <div *ngIf=\"items['number']\" class=\"import-field import-field-spacing import-flex-item-xs import-flex-grow-sm\">\n                  <lib-pop-input\n                    [config]=\"items['number']\"\n                    (events)=\"onFieldItemEvent($event, dataKey, 'number');\"\n                  ></lib-pop-input>\n                </div>\n\n                <!--<div *ngIf=\"items['type']; let item;\"-->\n                <!--class=\"import-field import-field-spacing import-flex-item-md import-flex-grow-sm\">-->\n                <!--<lib-pop-select-->\n                <!--[config]=\"item\"-->\n                <!--(events)=\"onFieldItemEvent($event, dataKey, item.column);\"-->\n                <!--&gt;</lib-pop-select>-->\n                <!--</div>-->\n\n                <div *ngIf=\"items['extension']\" class=\"import-field import-field-spacing import-flex-item-xs import-flex-grow-xs\">\n                  <lib-pop-input\n                    [config]=\"items['extension']\"\n                    (events)=\"onFieldItemEvent($event, dataKey, 'extension');\"\n                  ></lib-pop-input>\n                </div>\n              <!--</div>-->\n\n            </div>\n\n            <div class=\"import-flex-row-wrap\">\n              <div class=\"import-flex-column-md\">\n                <div class=\"import-field import-flex-item-full import-flex-grow-lg\">\n                  <lib-pop-checkbox\n                    *ngIf=\"items['stop_call_at']; let item;\"\n                    [config]=\"item\"\n                    (events)=\"onFieldItemEvent($event, dataKey, 'can_call');\">\n                  </lib-pop-checkbox>\n                </div>\n\n                <div class=\"import-field import-flex-item-full import-flex-grow-lg\">\n                  <lib-pop-checkbox\n                    *ngIf=\"items['stop_text_at']; let item;\"\n                    [config]=\"item\" (events)=\"onFieldItemEvent($event, dataKey, 'can_text');\"\n                  ></lib-pop-checkbox>\n                </div>\n\n              </div>\n              <div class=\"import-flex-column-md import-flex-end sw-pad-rgt-lg sw-pad-btm-lg\">\n                <div class=\"import-flex-item-full import-flex-grow-lg sw-mar-top-md import-flex-end\">\n                  <lib-pop-field-btn *ngIf=\"field.canRemove\" action=\"remove\" [field]=\"field\" (events)=\"onActionEvent($event, dataKey);\"></lib-pop-field-btn>\n                </div>\n              </div>\n            </div>\n            <mat-divider></mat-divider>\n            <div class=\"import-flex-row-wrap import-flex-end sw-pad-rgt-lg sw-pad-btm-sm\">\n              <lib-pop-button\n                [config]=\"{value:'Close', size: 30, color: 'accent', bubble: true, event: 'close'}\"\n                (events)=\"onActionEvent($event, dataKey);\"\n              ></lib-pop-button>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n",
                styles: [".pop-entity-phone-btn-container{position:relative;top:8px;display:flex;flex-direction:row;max-height:40px;align-items:center;justify-content:flex-end}.pop-entity-phone-btn-container div{margin-left:5px}:host ::ng-deep .pop-entity-phone-display input{font-size:.95em}"]
            },] }
];
PopEntityPhoneComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService }
];
PopEntityPhoneComponent.propDecorators = {
    field: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1waG9uZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1maWVsZC9wb3AtZW50aXR5LXBob25lL3BvcC1lbnRpdHktcGhvbmUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFJaEYsT0FBTyxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUU3RyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDckUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDZEQUE2RCxDQUFDO0FBQzNGLE9BQU8sRUFBRSw2QkFBNkIsSUFBSSxhQUFhLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUN0RyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQVFwRCxNQUFNLE9BQU8sdUJBQXdCLFNBQVEsYUFBYTtJQVN4RCxZQUNTLEVBQWMsRUFDWCxRQUF1QjtRQUVqQyxLQUFLLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBSGhDLE9BQUUsR0FBRixFQUFFLENBQVk7UUFDWCxhQUFRLEdBQVIsUUFBUSxDQUFlO1FBVDVCLFNBQUksR0FBRyx5QkFBeUIsQ0FBQztRQUU5QixVQUFLLEdBQUc7WUFDaEIsYUFBYSxFQUFFLENBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUU7U0FDbkcsQ0FBQztJQVFGLENBQUM7SUFHRDs7T0FFRztJQUNILFFBQVE7UUFDTixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUdEOztPQUVHO0lBQ0gsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBR0Q7Ozs7O3NHQUtrRztJQUVsRzs7O09BR0c7SUFDTyxtQkFBbUIsQ0FBQyxPQUFlO1FBQzNDLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNiLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFFLE9BQU8sQ0FBRSxDQUFDLE9BQU8sQ0FBQztRQUNwRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEQsSUFBSSxZQUFZLElBQUksS0FBSyxJQUFJLE9BQU8sQ0FBRSxZQUFZLENBQUUsRUFBRTtZQUNwRCxHQUFHLElBQUksSUFBSSxPQUFPLENBQUUsWUFBWSxDQUFFLEdBQUcsQ0FBQztTQUN2QztRQUNELElBQUksT0FBTyxDQUFFLFFBQVEsQ0FBRSxFQUFFO1lBQ3ZCLEdBQUcsSUFBSSxHQUFHLE9BQU8sQ0FBRSxRQUFRLENBQUUsRUFBRSxDQUFDO1NBQ2pDO1FBQ0QsSUFBSSxXQUFXLElBQUksS0FBSyxJQUFJLE9BQU8sQ0FBRSxXQUFXLENBQUUsRUFBRTtZQUNsRCxHQUFHLElBQUksU0FBUyxPQUFPLENBQUUsV0FBVyxDQUFFLEdBQUcsQ0FBQztTQUMzQztRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUdEOztPQUVHO0lBQ08sbUJBQW1CO1FBRzNCLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRTtZQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUNuRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDL0MsQ0FBQyxDQUFDLENBQUM7U0FFSjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUdTLHNCQUFzQixDQUFDLE9BQWUsRUFBRSxLQUFhO1FBQzdELElBQUksQ0FBQyxFQUFFLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztRQUU1QixJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBRXZCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFFLE9BQU8sQ0FBRSxDQUFDO1FBQ3pDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTVDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFMUYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUUsT0FBTyxDQUFFLENBQUMsVUFBVSxHQUFHLElBQUksWUFBWSxDQUFDO1lBQ3JELElBQUksRUFBRSxhQUFhO1lBQ25CLEtBQUssRUFBRSxJQUFJO1lBQ1gsaUJBQWlCO1NBQ2xCLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFFLE9BQU8sQ0FBRSxDQUFDLFVBQVUsR0FBRyxJQUFJLFlBQVksQ0FBQztZQUNyRCxJQUFJLEVBQUUsU0FBUztZQUNmLEtBQUssRUFBRSxJQUFJO1lBQ1gsaUJBQWlCO1NBQ2xCLENBQUMsQ0FBQztRQUdILElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDekIsdURBQXVEO1lBQ3ZELE1BQU0sVUFBVSxHQUFpQixJQUFJLENBQUMsTUFBTSxDQUFFLE1BQU0sQ0FBRSxDQUFDO1lBQ3ZELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN6QyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMzQyxDQUFDLENBQUM7WUFDRixzQ0FBc0M7WUFDdEMsNERBQTREO1lBQzVELGtDQUFrQztZQUNsQyxTQUFTO1lBQ1QsaUNBQWlDO1lBQ2pDLElBQUk7U0FDTDtRQUdELElBQUksY0FBYyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDakMsc0RBQXNEO1lBQ3RELFVBQVUsR0FBRyxJQUFJLENBQUM7U0FDbkI7UUFDRCxJQUFJLGNBQWMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2pDLHNEQUFzRDtZQUN0RCxVQUFVLEdBQUcsSUFBSSxDQUFDO1NBQ25CO1FBRUQsSUFBSSxZQUFZLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUMvQixNQUFNLGFBQWEsR0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBRSxZQUFZLENBQUUsQ0FBQztZQUNoRSxhQUFhLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUU7Z0JBQ2xDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdkMsQ0FBQyxDQUFDO1lBQ0YsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN0QztRQUdELElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDM0IsTUFBTSxZQUFZLEdBQWdCLElBQUksQ0FBQyxNQUFNLENBQUUsUUFBUSxDQUFFLENBQUM7WUFDMUQsWUFBWSxDQUFDLElBQUksR0FBRyxnQkFBZ0IsQ0FBQztZQUNyQyxZQUFZLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUNqQyxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdEMsQ0FBQyxDQUFDO1lBQ0YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNyQztRQUVELElBQUksV0FBVyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDOUIsTUFBTSxTQUFTLEdBQWdCLElBQUksQ0FBQyxNQUFNLENBQUUsV0FBVyxDQUFFLENBQUM7WUFDMUQsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7WUFDM0IsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsR0FBRyxFQUFFO2dCQUM5QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDekMsQ0FBQyxDQUFDO1lBQ0YsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3hDO1FBRUQscUNBQXFDO1FBQ3JDLHVFQUF1RTtRQUN2RSxrQ0FBa0M7UUFDbEMsOERBQThEO1FBQzlELHlHQUF5RztRQUN6RyxvRkFBb0Y7UUFDcEYsMEVBQTBFO1FBQzFFLEVBQUU7UUFDRixnR0FBZ0c7UUFDaEcsYUFBYTtRQUNiLGdDQUFnQztRQUNoQywyQkFBMkI7UUFDM0IsUUFBUTtRQUNSLHNDQUFzQztRQUN0Qyx3REFBd0Q7UUFDeEQsV0FBVztRQUNYLElBQUk7UUFDSixJQUFJO1FBRUosSUFBSSxVQUFVO1lBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxjQUFjLElBQUksRUFBRSxDQUFDO1FBQzlDLElBQUksVUFBVTtZQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsY0FBYyxJQUFJLEVBQUUsQ0FBQztRQUU5QyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFHRDs7Ozs7c0dBS2tHO0lBSzFGLGNBQWMsQ0FBQyxPQUFlLEVBQUUsS0FBYTtRQUNuRCxNQUFNLGFBQWEsR0FBaUIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN0RixJQUFJLGFBQWEsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO1lBQ2pDLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQzdDLE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUNwRCxNQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUMxQyxNQUFNLE1BQU0sR0FBRyxLQUFLLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUUsU0FBUyxDQUFFLEtBQUssQ0FBRSxDQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUN4RSxhQUFhLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzdDLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFFLG9CQUFvQixDQUFFLENBQUMsRUFBRTtnQkFDOUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7YUFDNUU7WUFDRCxJQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDMUM7SUFFSCxDQUFDO0lBR08sYUFBYSxDQUFDLE9BQWUsRUFBRSxLQUFhO1FBQ2xELE1BQU0sWUFBWSxHQUFpQixJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2pGLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ25ELFlBQVksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRTNCLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBR08sZ0JBQWdCLENBQUMsT0FBZSxFQUFFLEtBQWE7UUFDckQsTUFBTSxTQUFTLEdBQWlCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDakYsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDdEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFdEQsSUFBSSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFHTyxrQkFBa0IsQ0FBQyxPQUFlLEVBQUUsS0FBYTtRQUN2RCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRTtZQUM1RCxJQUFJLENBQUMsOEJBQThCLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDNUM7YUFBSTtZQUNILElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzlDO1FBQ0QsSUFBSSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFHTyw4QkFBOEIsQ0FBQyxLQUFhO1FBQ2xELE1BQU0sS0FBSyxHQUFlLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckQsTUFBTSxVQUFVLEdBQWlCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBRSxLQUFLLENBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNuRyxNQUFNLFlBQVksR0FBZ0IsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFFLEtBQUssQ0FBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3RHLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUUsS0FBSyxDQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdkUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUUsS0FBSyxDQUFFLENBQUUsQ0FBQyxPQUFPLENBQUM7UUFFdkUsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNsQyxVQUFVLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekM7UUFDRCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBRSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUUsQ0FBQztRQUNsSixJQUFJLEtBQUssRUFBRTtZQUNULFlBQVksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQzNCLE9BQU8sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1NBQ3ZCO0lBQ0gsQ0FBQztJQUdEOzs7T0FHRztJQUNLLDZCQUE2QixDQUFDLE9BQWU7UUFDbkQsTUFBTSxVQUFVLEdBQWlCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDN0UsTUFBTSxZQUFZLEdBQWdCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDaEYsTUFBTSxVQUFVLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RFLE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQ3ZDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFFLE9BQU8sQ0FBRSxDQUFDLE9BQU8sQ0FBQztRQUNqRCxNQUFNLE1BQU0sR0FBRyxLQUFLLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBRSxVQUFVLENBQUUsS0FBSyxDQUFFLENBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzdGLFlBQVksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDNUUsT0FBTyxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO0lBQ3JDLENBQUM7OztZQWhSRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHNCQUFzQjtnQkFDaEMsOGlNQUFnRDs7YUFFakQ7OztZQWhCbUIsVUFBVTtZQU1yQixhQUFhOzs7b0JBWW5CLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRW50aXR5RmllbGRDb21wb25lbnRJbnRlcmZhY2UgfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkLm1vZGVsJztcbmltcG9ydCB7IElucHV0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtaW5wdXQvaW5wdXQtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IEZpZWxkQ29uZmlnLCBGaWVsZEVudHJ5IH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBBcnJheU1hcFNldHRlciwgSXNBcnJheSwgSXNPYmplY3QsIFNuYWtlVG9QYXNjYWwsIFRpdGxlQ2FzZSB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQgeyBTZWxlY3RDb25maWcgfSBmcm9tICcuLi8uLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1zZWxlY3Qvc2VsZWN0LWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBQb3BEb21TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2VydmljZXMvcG9wLWRvbS5zZXJ2aWNlJztcbmltcG9ydCB7IEJ1dHRvbkNvbmZpZyB9IGZyb20gJy4uLy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLWJ1dHRvbi9idXR0b24tY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IFBvcEVudGl0eUZpZWxkQm9pbGVyQ29tcG9uZW50IGFzIEZpZWxkVGVtcGxhdGUgfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkLWJvaWxlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgUGhvbmVGaWVsZFNldHRpbmcgfSBmcm9tICcuL3Bob25lLnNldHRpbmcnO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtZW50aXR5LXBob25lJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lbnRpdHktcGhvbmUuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWVudGl0eS1waG9uZS5jb21wb25lbnQuc2NzcycgXVxufSlcbmV4cG9ydCBjbGFzcyBQb3BFbnRpdHlQaG9uZUNvbXBvbmVudCBleHRlbmRzIEZpZWxkVGVtcGxhdGUgaW1wbGVtZW50cyBFbnRpdHlGaWVsZENvbXBvbmVudEludGVyZmFjZSwgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBmaWVsZDogRmllbGRDb25maWc7XG4gIHB1YmxpYyBuYW1lID0gJ1BvcEVudGl0eVBob25lQ29tcG9uZW50JztcblxuICBwcm90ZWN0ZWQgYXNzZXQgPSB7XG4gICAgZXh0ZW5zaW9uS2V5czogWyAndHlwZScsICd2b2ljZV9idXR0b24nLCAnc21zX2J1dHRvbicsICdkb19ub3RfY2FsbCcsICdkb19ub3Rfc21zJywgJ2NvdW50cnlfaWQnIF0sXG4gIH07XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIF9kb21SZXBvOiBQb3BEb21TZXJ2aWNlXG4gICl7XG4gICAgc3VwZXIoZWwsIF9kb21SZXBvLCBQaG9uZUZpZWxkU2V0dGluZyk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCBzaG91bGQgaGF2ZSBhIHNwZWNpZmljIHB1cnBvc2VcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSBkb20gZGVzdHJveSBmdW5jdGlvbiBtYW5hZ2VzIGFsbCB0aGUgY2xlYW4gdXAgdGhhdCBpcyBuZWNlc3NhcnkgaWYgc3Vic2NyaXB0aW9ucywgdGltZW91dHMsIGV0YyBhcmUgc3RvcmVkIHByb3Blcmx5XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPdmVycmlkZSBJbmhlcml0ZWQgTWV0aG9kcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcm90ZWN0ZWQgTWV0aG9kcyApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIC8qKlxuICAgKiBCdWlsZHMgdGhlIGRpc3BsYXkgc3RyaW5nXG4gICAqIEBwYXJhbSBkYXRhS2V5XG4gICAqL1xuICBwcm90ZWN0ZWQgX2dldEFzc2V0RGlzcGxheVN0cihkYXRhS2V5OiBudW1iZXIpOiBzdHJpbmd7XG4gICAgbGV0IHN0ciA9ICcnO1xuICAgIGNvbnN0IGRpc3BsYXkgPSB0aGlzLmRvbS5zZXNzaW9uWyBkYXRhS2V5IF0uZGlzcGxheTtcbiAgICBjb25zdCBpdGVtcyA9IHRoaXMuX2dldERhdGFLZXlJdGVtQ29uZmlnKGRhdGFLZXkpO1xuICAgIGlmKCAnY291bnRyeV9pZCcgaW4gaXRlbXMgJiYgZGlzcGxheVsgJ2NvdW50cnlfaWQnIF0gKXtcbiAgICAgIHN0ciArPSBgKyR7ZGlzcGxheVsgJ2NvdW50cnlfaWQnIF19IGA7XG4gICAgfVxuICAgIGlmKCBkaXNwbGF5WyAnbnVtYmVyJyBdICl7XG4gICAgICBzdHIgKz0gYCR7ZGlzcGxheVsgJ251bWJlcicgXX1gO1xuICAgIH1cbiAgICBpZiggJ2V4dGVuc2lvbicgaW4gaXRlbXMgJiYgZGlzcGxheVsgJ2V4dGVuc2lvbicgXSApe1xuICAgICAgc3RyICs9IGAgRXh0LiAke2Rpc3BsYXlbICdleHRlbnNpb24nIF19IGA7XG4gICAgfVxuICAgIHJldHVybiBzdHI7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgc2V0dXAgdGhpcyBmaWVsZCB0byBoYW5kbGUgY2hhbmdlcyBhbmQgdHJhbnNmb3JtYXRpb25zXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldEZpZWxkQXR0cmlidXRlcygpOiBib29sZWFue1xuXG5cbiAgICBpZiggdGhpcy5maWVsZCAmJiB0aGlzLmZpZWxkLml0ZW1zICl7XG4gICAgICBPYmplY3Qua2V5cyh0aGlzLmZpZWxkLml0ZW1zKS5tYXAoKGRhdGFLZXksIGluZGV4KSA9PiB7XG4gICAgICAgIHRoaXMuX3NldEZpZWxkSXRlbUF0dHJpYnV0ZSgrZGF0YUtleSwgaW5kZXgpO1xuICAgICAgfSk7XG5cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuXG4gIHByb3RlY3RlZCBfc2V0RmllbGRJdGVtQXR0cmlidXRlKGRhdGFLZXk6IG51bWJlciwgaW5kZXg6IG51bWJlcik6IGJvb2xlYW57XG4gICAgdGhpcy51aS5hY3Rpb25CdG5XaWR0aCA9IDUwO1xuXG4gICAgbGV0IGhhc0NhbGxCdG4gPSBmYWxzZTtcbiAgICBsZXQgaGFzVGV4dEJ0biA9IGZhbHNlO1xuXG4gICAgY29uc3QgaXRlbSA9IHRoaXMuZmllbGQuaXRlbXNbIGRhdGFLZXkgXTtcbiAgICBjb25zdCBjb25maWdLZXlzID0gT2JqZWN0LmtleXMoaXRlbS5jb25maWcpO1xuXG4gICAgdGhpcy5kb20uc3RhdGUuaGFzX2V4dGVuc2lvbiA9IGNvbmZpZ0tleXMuc29tZShyID0+IHRoaXMuYXNzZXQuZXh0ZW5zaW9uS2V5cy5pbmNsdWRlcyhyKSk7XG5cbiAgICB0aGlzLnVpLmFzc2V0WyBkYXRhS2V5IF0uY2FuQ2FsbEJ0biA9IG5ldyBCdXR0b25Db25maWcoe1xuICAgICAgaWNvbjogJ2xvY2FsX3Bob25lJyxcbiAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgLy8gZGlzYWJsZWQ6IHRydWVcbiAgICB9KTtcbiAgICB0aGlzLnVpLmFzc2V0WyBkYXRhS2V5IF0uY2FuVGV4dEJ0biA9IG5ldyBCdXR0b25Db25maWcoe1xuICAgICAgaWNvbjogJ3RleHRzbXMnLFxuICAgICAgdmFsdWU6IG51bGwsXG4gICAgICAvLyBkaXNhYmxlZDogdHJ1ZVxuICAgIH0pO1xuXG5cbiAgICBpZiggJ3R5cGUnIGluIGl0ZW0uY29uZmlnICl7XG4gICAgICAvLyBJZiB0eXBlIGlzIHNldCwgdXNlIGFzIHRoZSBsYWJlbCBvZiB0aGUgcGhvbmUgbnVtYmVyXG4gICAgICBjb25zdCB0eXBlQ29uZmlnID0gPFNlbGVjdENvbmZpZz5pdGVtLmNvbmZpZ1sgJ3R5cGUnIF07XG4gICAgICB0aGlzLl91cGRhdGVOdW1iZXJMYWJlbCgrZGF0YUtleSwgaW5kZXgpO1xuICAgICAgdHlwZUNvbmZpZy5wYXRjaC5jYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5fdXBkYXRlTnVtYmVyTGFiZWwoK2RhdGFLZXksIGluZGV4KTtcbiAgICAgIH07XG4gICAgICAvLyBJZiB2YWx1ZSBlbnRyeSBleGlzdHMsIGRpc2FibGUgdHlwZVxuICAgICAgLy8gaWYoIHRoaXMuZmllbGQubXVsdGlwbGUgJiYgaW5kZXggaW4gdGhpcy5maWVsZC5lbnRyaWVzICl7XG4gICAgICAvLyAgIHR5cGVDb25maWcuY29udHJvbC5kaXNhYmxlKCk7XG4gICAgICAvLyB9ZWxzZXtcbiAgICAgIC8vICAgdHlwZUNvbmZpZy5jb250cm9sLmVuYWJsZSgpO1xuICAgICAgLy8gfVxuICAgIH1cblxuXG4gICAgaWYoICdzdG9wX2NhbGxfYXQnIGluIGl0ZW0uY29uZmlnICl7XG4gICAgICAvLyBUb0RvOjogRmlndXJlIG91dCB3aGF0IHRoaXMgYnV0dG9uIHdpbGwgYWN0dWFsbHkgZG9cbiAgICAgIGhhc0NhbGxCdG4gPSB0cnVlO1xuICAgIH1cbiAgICBpZiggJ3N0b3BfdGV4dF9hdCcgaW4gaXRlbS5jb25maWcgKXtcbiAgICAgIC8vIFRvRG86OiBGaWd1cmUgb3V0IHdoYXQgdGhpcyBidXR0b24gd2lsbCBhY3R1YWxseSBkb1xuICAgICAgaGFzVGV4dEJ0biA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYoICdjb3VudHJ5X2lkJyBpbiBpdGVtLmNvbmZpZyApe1xuICAgICAgY29uc3QgY291bnRyeUNvbmZpZyA9IDxTZWxlY3RDb25maWc+aXRlbS5jb25maWdbICdjb3VudHJ5X2lkJyBdO1xuICAgICAgY291bnRyeUNvbmZpZy5wYXRjaC5jYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5fdXBkYXRlQ291bnRyeSgrZGF0YUtleSwgaW5kZXgpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuX3VwZGF0ZUNvdW50cnkoK2RhdGFLZXksIGluZGV4KTtcbiAgICB9XG5cblxuICAgIGlmKCAnbnVtYmVyJyBpbiBpdGVtLmNvbmZpZyApe1xuICAgICAgY29uc3QgbnVtYmVyQ29uZmlnID0gPElucHV0Q29uZmlnPml0ZW0uY29uZmlnWyAnbnVtYmVyJyBdO1xuICAgICAgbnVtYmVyQ29uZmlnLm1hc2sgPSAnKDAwMCkgMDAwLTAwMDAnO1xuICAgICAgbnVtYmVyQ29uZmlnLmRyb3BTcGVjaWFsID0gZmFsc2U7XG4gICAgICBudW1iZXJDb25maWcucGF0Y2guY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZU51bWJlcigrZGF0YUtleSwgaW5kZXgpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuX3VwZGF0ZU51bWJlcigrZGF0YUtleSwgaW5kZXgpO1xuICAgIH1cblxuICAgIGlmKCAnZXh0ZW5zaW9uJyBpbiBpdGVtLmNvbmZpZyApe1xuICAgICAgY29uc3QgZXh0Q29uZmlnID0gPElucHV0Q29uZmlnPml0ZW0uY29uZmlnWyAnZXh0ZW5zaW9uJyBdO1xuICAgICAgZXh0Q29uZmlnLm1hc2sgPSAnMCowMDAwMCc7XG4gICAgICBleHRDb25maWcucGF0Y2guY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUV4dGVuc2lvbigrZGF0YUtleSwgaW5kZXgpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuX3VwZGF0ZUV4dGVuc2lvbigrZGF0YUtleSwgaW5kZXgpO1xuICAgIH1cblxuICAgIC8vIGlmKCBpdGVtS2V5cy5pbmNsdWRlcygnbnVtYmVyJykgKXtcbiAgICAvLyBpZiggaXRlbUtleXMuaW5jbHVkZXMoJ2NvdW50cnlfY29kZScpIHx8IGl0ZW1LZXlzLmluY2x1ZGVzKCdleHQnKSApe1xuICAgIC8vICAgdGhpcy5kb20uc3RhdGUubWVyZ2VkID0gdHJ1ZTtcbiAgICAvLyAgIGNvbnN0IGl0ZW1zID0gWyB0aGlzLmZpZWxkLml0ZW1zWyBkYXRhSWQgXVsgJ251bWJlcicgXSBdO1xuICAgIC8vICAgaWYoIGl0ZW1LZXlzLmluY2x1ZGVzKCdjb3VudHJ5X2NvZGUnKSApIGl0ZW1zLnVuc2hpZnQodGhpcy5maWVsZC5pdGVtc1sgZGF0YUlkIF1bICdjb3VudHJ5X2NvZGUnIF0pO1xuICAgIC8vICAgaWYoIGl0ZW1LZXlzLmluY2x1ZGVzKCdleHQnKSApIGl0ZW1zLnB1c2godGhpcy5maWVsZC5pdGVtc1sgZGF0YUlkIF1bICdleHQnIF0pO1xuICAgIC8vICAgdGhpcy5maWVsZC5pdGVtc1sgZGF0YUlkIF1bICdudW1iZXInIF0gPSB0aGlzLl9nZXRNZXJnZWRQaG9uZShpdGVtcyk7XG4gICAgLy9cbiAgICAvLyAgIHRoaXMuZG9tLnNldFN1YnNjcmliZXIoJ3Bob25lJywgdGhpcy5maWVsZC5pdGVtc1sgZGF0YUlkIF1bICdudW1iZXInIF0uY29udHJvbC52YWx1ZUNoYW5nZXNcbiAgICAvLyAgICAgLnBpcGUoXG4gICAgLy8gICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAvLyAgICAgICBkZWJvdW5jZVRpbWUoNTAwKSxcbiAgICAvLyAgICAgKVxuICAgIC8vICAgICAuc3Vic2NyaWJlKCh2YWx1ZTogc3RyaW5nKSA9PiB7XG4gICAgLy8gICAgICAgaWYoIHZhbHVlICkgdGhpcy5fdmFsaWRhdGVQaG9uZShkYXRhSWQsIHZhbHVlKTtcbiAgICAvLyAgICAgfSkpO1xuICAgIC8vIH1cbiAgICAvLyB9XG5cbiAgICBpZiggaGFzQ2FsbEJ0biApIHRoaXMudWkuYWN0aW9uQnRuV2lkdGggKz0gNTA7XG4gICAgaWYoIGhhc1RleHRCdG4gKSB0aGlzLnVpLmFjdGlvbkJ0bldpZHRoICs9IDUwO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cblxuXG4gIHByaXZhdGUgX3VwZGF0ZUNvdW50cnkoZGF0YUtleTogbnVtYmVyLCBpbmRleDogbnVtYmVyKXtcbiAgICBjb25zdCBjb3VudHJ5Q29uZmlnID0gPFNlbGVjdENvbmZpZz50aGlzLl9nZXREYXRhS2V5SXRlbUNvbmZpZyhkYXRhS2V5LCAnY291bnRyeV9pZCcpO1xuICAgIGlmKCBjb3VudHJ5Q29uZmlnLm1ldGFkYXRhLnNvdXJjZSApe1xuICAgICAgY29uc3Qgc291cmNlID0gY291bnRyeUNvbmZpZy5tZXRhZGF0YS5zb3VyY2U7XG4gICAgICBjb25zdCBzb3VyY2VNYXAgPSBjb3VudHJ5Q29uZmlnLm1ldGFkYXRhLm1hcC5zb3VyY2U7XG4gICAgICBjb25zdCB2YWx1ZSA9IGNvdW50cnlDb25maWcuY29udHJvbC52YWx1ZTtcbiAgICAgIGNvbnN0IG9wdGlvbiA9IHZhbHVlIGluIHNvdXJjZU1hcCA/IHNvdXJjZVsgc291cmNlTWFwWyB2YWx1ZSBdIF0gOiBudWxsO1xuICAgICAgY291bnRyeUNvbmZpZy52YWx1ZSA9IHZhbHVlO1xuICAgICAgY29uc29sZS5sb2coJ191cGRhdGVDb3VudHJ5IG9wdGlvbicsIG9wdGlvbik7XG4gICAgICBpZiggSXNPYmplY3Qob3B0aW9uLCBbICdwaG9uZV9jb3VudHJ5X2NvZGUnIF0pICl7XG4gICAgICAgIHRoaXMuX3VwZGF0ZURpc3BsYXlGaWVsZChkYXRhS2V5LCAnY291bnRyeV9pZCcsIG9wdGlvbi5waG9uZV9jb3VudHJ5X2NvZGUpO1xuICAgICAgfVxuICAgICAgdGhpcy5fdHJpZ2dlclVwZGF0ZUFzc2V0RGlzcGxheShkYXRhS2V5KTtcbiAgICB9XG5cbiAgfVxuXG5cbiAgcHJpdmF0ZSBfdXBkYXRlTnVtYmVyKGRhdGFLZXk6IG51bWJlciwgaW5kZXg6IG51bWJlcil7XG4gICAgY29uc3QgbnVtYmVyQ29uZmlnID0gPFNlbGVjdENvbmZpZz50aGlzLl9nZXREYXRhS2V5SXRlbUNvbmZpZyhkYXRhS2V5LCAnbnVtYmVyJyk7XG4gICAgY29uc3QgdmFsdWUgPSBudW1iZXJDb25maWcuY29udHJvbC52YWx1ZTtcbiAgICB0aGlzLl91cGRhdGVEaXNwbGF5RmllbGQoZGF0YUtleSwgJ251bWJlcicsIHZhbHVlKTtcbiAgICBudW1iZXJDb25maWcudmFsdWUgPSB2YWx1ZTtcblxuICAgIHRoaXMuX3RyaWdnZXJVcGRhdGVBc3NldERpc3BsYXkoZGF0YUtleSk7XG4gIH1cblxuXG4gIHByaXZhdGUgX3VwZGF0ZUV4dGVuc2lvbihkYXRhS2V5OiBudW1iZXIsIGluZGV4OiBudW1iZXIpe1xuICAgIGNvbnN0IGV4dENvbmZpZyA9IDxTZWxlY3RDb25maWc+dGhpcy5fZ2V0RGF0YUtleUl0ZW1Db25maWcoZGF0YUtleSwgJ2V4dGVuc2lvbicpO1xuICAgIGNvbnN0IHZhbHVlID0gZXh0Q29uZmlnLmNvbnRyb2wudmFsdWU7XG4gICAgdGhpcy5fdXBkYXRlRGlzcGxheUZpZWxkKGRhdGFLZXksICdleHRlbnNpb24nLCB2YWx1ZSk7XG5cbiAgICB0aGlzLl90cmlnZ2VyVXBkYXRlQXNzZXREaXNwbGF5KGRhdGFLZXkpO1xuICB9XG5cblxuICBwcml2YXRlIF91cGRhdGVOdW1iZXJMYWJlbChkYXRhS2V5OiBudW1iZXIsIGluZGV4OiBudW1iZXIpe1xuICAgIGlmKCB0aGlzLmZpZWxkLm11bHRpcGxlICYmIElzQXJyYXkodGhpcy5maWVsZC5lbnRyaWVzLCB0cnVlKSApe1xuICAgICAgdGhpcy5fdXBkYXRlTnVtYmVyTGFiZWxUb01hdGNoRW50cnkoaW5kZXgpO1xuICAgIH1lbHNle1xuICAgICAgdGhpcy5fdXBkYXRlTnVtYmVyTGFiZWxUb01hdGNoVHlwZSgrZGF0YUtleSk7XG4gICAgfVxuICAgIHRoaXMuX3RyaWdnZXJVcGRhdGVBc3NldERpc3BsYXkoZGF0YUtleSk7XG4gIH1cblxuXG4gIHByaXZhdGUgX3VwZGF0ZU51bWJlckxhYmVsVG9NYXRjaEVudHJ5KGluZGV4OiBudW1iZXIpe1xuICAgIGNvbnN0IGVudHJ5ID0gPEZpZWxkRW50cnk+dGhpcy5fZ2V0VmFsdWVFbnRyeShpbmRleCk7XG4gICAgY29uc3QgdHlwZUNvbmZpZyA9IDxTZWxlY3RDb25maWc+dGhpcy5fZ2V0RGF0YUtleUl0ZW1Db25maWcodGhpcy5maWVsZC5kYXRhX2tleXNbIGluZGV4IF0sICd0eXBlJyk7XG4gICAgY29uc3QgbnVtYmVyQ29uZmlnID0gPElucHV0Q29uZmlnPnRoaXMuX2dldERhdGFLZXlJdGVtQ29uZmlnKHRoaXMuZmllbGQuZGF0YV9rZXlzWyBpbmRleCBdLCAnbnVtYmVyJyk7XG4gICAgY29uc3Qgc3RvcmVkID0gdGhpcy5fZ2V0RGF0YUtleSh0aGlzLmZpZWxkLmRhdGFfa2V5c1sgaW5kZXggXSwgJ3R5cGUnKTtcbiAgICBjb25zdCBkaXNwbGF5ID0gdGhpcy51aS5hc3NldFsgdGhpcy5maWVsZC5kYXRhX2tleXNbIGluZGV4IF0gXS5kaXNwbGF5O1xuXG4gICAgaWYoIGVudHJ5ICYmIGVudHJ5LnR5cGUgJiYgIXN0b3JlZCApe1xuICAgICAgdHlwZUNvbmZpZy5jb250cm9sLnNldFZhbHVlKGVudHJ5LnR5cGUpO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IGVudHJ5ID8gKCBlbnRyeS5uYW1lID8gZW50cnkubmFtZSA6IHRoaXMuX2dldFR5cGVPcHRpb25OYW1lKGVudHJ5LnR5cGUsIGluZGV4KSApIDogKCBudW1iZXJDb25maWcubGFiZWwgPyBudW1iZXJDb25maWcubGFiZWwgOiAnJyApO1xuICAgIGlmKCB2YWx1ZSApe1xuICAgICAgbnVtYmVyQ29uZmlnLmxhYmVsID0gdmFsdWU7XG4gICAgICBkaXNwbGF5LmxhYmVsID0gdmFsdWU7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVGhlIGxhYmVsIG9mIHZhbHVlIGVudHJ5IHNob3VsZCBtYXRjaCB0aGUgdHlwZVxuICAgKiBAcGFyYW0gZGF0YUtleVxuICAgKi9cbiAgcHJpdmF0ZSBfdXBkYXRlTnVtYmVyTGFiZWxUb01hdGNoVHlwZShkYXRhS2V5OiBudW1iZXIpe1xuICAgIGNvbnN0IHR5cGVDb25maWcgPSA8U2VsZWN0Q29uZmlnPnRoaXMuX2dldERhdGFLZXlJdGVtQ29uZmlnKGRhdGFLZXksICd0eXBlJyk7XG4gICAgY29uc3QgbnVtYmVyQ29uZmlnID0gPElucHV0Q29uZmlnPnRoaXMuX2dldERhdGFLZXlJdGVtQ29uZmlnKGRhdGFLZXksICdudW1iZXInKTtcbiAgICBjb25zdCBvcHRpb25zTWFwID0gQXJyYXlNYXBTZXR0ZXIodHlwZUNvbmZpZy5vcHRpb25zLnZhbHVlcywgJ3ZhbHVlJyk7XG4gICAgY29uc3QgdmFsdWUgPSB0eXBlQ29uZmlnLmNvbnRyb2wudmFsdWU7XG4gICAgY29uc3QgZGlzcGxheSA9IHRoaXMudWkuYXNzZXRbIGRhdGFLZXkgXS5kaXNwbGF5O1xuICAgIGNvbnN0IG9wdGlvbiA9IHZhbHVlIGluIG9wdGlvbnNNYXAgPyB0eXBlQ29uZmlnLm9wdGlvbnMudmFsdWVzWyBvcHRpb25zTWFwWyB2YWx1ZSBdIF0gOiBudWxsO1xuICAgIG51bWJlckNvbmZpZy5sYWJlbCA9IG9wdGlvbiA/IG9wdGlvbi5uYW1lIDogVGl0bGVDYXNlKFNuYWtlVG9QYXNjYWwodmFsdWUpKTtcbiAgICBkaXNwbGF5LmxhYmVsID0gbnVtYmVyQ29uZmlnLmxhYmVsO1xuICB9XG5cblxuICAvLyBwcml2YXRlIF92YWxpZGF0ZVBob25lKGRhdGFJZCwgdmFsdWUpe1xuICAvLyAgIGlmKCB0aGlzLmZpZWxkLml0ZW1zWyBkYXRhSWQgXVsgJ251bWJlcicgXS5jb250cm9sLnZhbGlkICl7XG4gIC8vICAgICBsZXQgdmFsdWVzID0gU3RyaW5nKHZhbHVlKS5zcGxpdCgnIEV4dC4gJyk7XG4gIC8vICAgICBsZXQgZXh0ID0gU3RyaW5nKHZhbHVlcy5wb3AoKSkubWF0Y2goL1xcZCsvZykubWFwKE51bWJlcikuam9pbignJyk7XG4gIC8vICAgICBpZiggdmFsdWVzLmxlbmd0aCApe1xuICAvLyAgICAgICB2YWx1ZXMgPSA8YW55PnZhbHVlcy5wb3AoKTtcbiAgLy8gICAgIH1lbHNle1xuICAvLyAgICAgICB2YWx1ZXMgPSA8YW55PicnO1xuICAvLyAgICAgfVxuICAvLyAgICAgY29uc3QgY291bnRyeUNvZGUgPSBTdHJpbmcodmFsdWVzKS5zdWJzdHIoMCwgU3RyaW5nKHZhbHVlcykuaW5kZXhPZignICcpKS5tYXRjaCgvXFxkKy9nKS5tYXAoTnVtYmVyKS5qb2luKCcnKTtcbiAgLy8gICAgIGNvbnN0IG51bWJlciA9IFN0cmluZyh2YWx1ZXMpLnN1YnN0cihTdHJpbmcodmFsdWVzKS5pbmRleE9mKCcgJykgKyAxKS5tYXRjaCgvXFxkKy9nKS5tYXAoTnVtYmVyKS5qb2luKCcnKTtcbiAgLy8gICAgIGlmKCB0aGlzLmxvZy5yZXBvLmVuYWJsZWQoJ2luZm8nLCB0aGlzLm5hbWUpICkgY29uc29sZS5sb2codGhpcy5sb2cucmVwby5tZXNzYWdlKGAke3RoaXMubmFtZX06aW5mb2ApLCB0aGlzLmxvZy5yZXBvLmNvbG9yKCdpbmZvJyksIFsgY291bnRyeUNvZGUsIG51bWJlciwgZXh0IF0pO1xuICAvL1xuICAvLyAgICAgaWYoIG51bWJlciApe1xuICAvLyAgICAgICBpZiggIWV4dCApIGV4dCA9IG51bGw7XG4gIC8vICAgICAgIGNvbnN0IG51bWJlckNvbmZpZyA9IDxJbnB1dENvbmZpZz4gdGhpcy5maWVsZC5pdGVtc1sgZGF0YUlkIF1bICdudW1iZXInIF07XG4gIC8vICAgICAgIGlmKCB0eXBlb2YgbnVtYmVyQ29uZmlnLnRyaWdnZXJEaXJlY3RQYXRjaCA9PT0gJ2Z1bmN0aW9uJyApIG51bWJlckNvbmZpZy50cmlnZ2VyRGlyZWN0UGF0Y2gobnVtYmVyKTtcbiAgLy8gICAgICAgY29uc3QgY291bnRyeUNvbmZpZyA9IDxJbnB1dENvbmZpZz4gdGhpcy5maWVsZC5pdGVtc1sgZGF0YUlkIF1bICdjb3VudHJ5X2NvZGUnIF07XG4gIC8vICAgICAgIGlmKCB0eXBlb2YgY291bnRyeUNvbmZpZy50cmlnZ2VyT25DaGFuZ2UgPT09ICdmdW5jdGlvbicgKSBjb3VudHJ5Q29uZmlnLnRyaWdnZXJPbkNoYW5nZShjb3VudHJ5Q29kZSk7XG4gIC8vICAgICAgIGlmKCB0eXBlb2YgY291bnRyeUNvbmZpZy50cmlnZ2VyRGlyZWN0UGF0Y2ggPT09ICdmdW5jdGlvbicgKSBjb3VudHJ5Q29uZmlnLnRyaWdnZXJEaXJlY3RQYXRjaChjb3VudHJ5Q29kZSk7XG4gIC8vICAgICAgIGNvbnN0IGV4dENvbmZpZyA9IDxJbnB1dENvbmZpZz4gdGhpcy5maWVsZC5pdGVtc1sgZGF0YUlkIF1bICdleHQnIF07XG4gIC8vICAgICAgIGlmKCB0eXBlb2YgZXh0Q29uZmlnLnRyaWdnZXJPbkNoYW5nZSA9PT0gJ2Z1bmN0aW9uJyApIGV4dENvbmZpZy50cmlnZ2VyT25DaGFuZ2UoZXh0KTtcbiAgLy8gICAgICAgaWYoIHR5cGVvZiBleHRDb25maWcudHJpZ2dlckRpcmVjdFBhdGNoID09PSAnZnVuY3Rpb24nICkgZXh0Q29uZmlnLnRyaWdnZXJEaXJlY3RQYXRjaChleHQpO1xuICAvLyAgICAgfVxuICAvLyAgIH1cbiAgLy8gfVxuXG5cbiAgLy8gcHJpdmF0ZSBfZ2V0TWVyZ2VkUGhvbmUoaXRlbXM6IElucHV0Q29uZmlnW10pe1xuICAvLyAgIGNvbnN0IGluZGV4SXRlbXMgPSBbXTtcbiAgLy8gICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gIC8vICAgICB0aGlzLl9zZXRJdGVtTWFzayhpdGVtKTtcbiAgLy8gICAgIHRoaXMuX2Rpc2FibGVQaG9uZUl0ZW0oaXRlbSk7XG4gIC8vICAgICBpbmRleEl0ZW1zWyBpdGVtLmNvbHVtbiBdID0gaXRlbTtcbiAgLy8gICB9KTtcbiAgLy8gICB0aGlzLl9tZXJnZVBob25lVmFsdWVzKGluZGV4SXRlbXMpO1xuICAvLyAgIGlmKCBpbmRleEl0ZW1zWyAnbnVtYmVyJyBdICYmIGluZGV4SXRlbXNbICdudW1iZXInIF0uY29udHJvbC52YWx1ZSApe1xuICAvLyAgICAgaWYoIGluZGV4SXRlbXNbICdjb3VudHJ5X2NvZGUnIF0gJiYgaW5kZXhJdGVtc1sgJ2NvdW50cnlfY29kZScgXS5jb250cm9sLnZhbHVlICl7XG4gIC8vICAgICAgIGluZGV4SXRlbXNbICdudW1iZXInIF0uY29udHJvbC52YWx1ZSA9ICggaW5kZXhJdGVtc1sgJ2NvdW50cnlfY29kZScgXS5jb250cm9sLnZhbHVlICsgJyAnICsgaW5kZXhJdGVtc1sgJ251bWJlcicgXS5jb250cm9sLnZhbHVlICk7XG4gIC8vICAgICB9XG4gIC8vICAgICBpZiggaW5kZXhJdGVtc1sgJ2V4dCcgXSAmJiBpbmRleEl0ZW1zWyAnZXh0JyBdLmNvbnRyb2wudmFsdWUgKSBpbmRleEl0ZW1zWyAnbnVtYmVyJyBdLmNvbnRyb2wudmFsdWUgKz0gJyBFeHQuICcgKyBpbmRleEl0ZW1zWyAnZXh0JyBdLmNvbnRyb2wudmFsdWU7XG4gIC8vICAgfVxuICAvLyAgIHRoaXMuZG9tLnN0b3JlKCdzdGF0ZScpO1xuICAvLyAgIHJldHVybiBpbmRleEl0ZW1zWyAnbnVtYmVyJyBdO1xuICAvLyB9XG5cblxuICAvLyBwcml2YXRlIF9zZXRJdGVtTWFzayhpdGVtOiBJbnB1dENvbmZpZyk6IHZvaWR7XG4gIC8vICAgc3dpdGNoKCBpdGVtLmNvbHVtbiApe1xuICAvLyAgICAgY2FzZSAnY291bnRyeV9jb2RlJzpcbiAgLy8gICAgICAgaXRlbS5tYXNrID0gJyswJztcbiAgLy8gICAgICAgaWYoICFpdGVtLm1hc2sgKSBpdGVtLm1hc2sgPSAnKzAnO1xuICAvLyAgICAgICBicmVhaztcbiAgLy8gICAgIGNhc2UgJ2V4dCc6XG4gIC8vICAgICAgIGl0ZW0ubWFzayA9ICcwOTk5OTk5OSc7XG4gIC8vICAgICAgIGlmKCAhaXRlbS5tYXNrICkgaXRlbS5tYXNrID0gJzA5OTk5OTk5JztcbiAgLy8gICAgICAgaWYoICFpdGVtWyAncmVxdWlyZWQnIF0gKSBpdGVtLm1hc2sgPSAnOScgKyBpdGVtLm1hc2s7XG4gIC8vICAgICAgIGJyZWFrO1xuICAvLyAgICAgZGVmYXVsdDpcbiAgLy8gICAgICAgYnJlYWs7XG4gIC8vICAgfVxuICAvLyB9XG4gIC8vXG4gIC8vXG4gIC8vIHByaXZhdGUgX21lcmdlUGhvbmVWYWx1ZXMoaW5kZXhJdGVtczogSW5wdXRDb25maWdbXSk6IHZvaWR7XG4gIC8vICAgaWYoIGluZGV4SXRlbXNbICdjb3VudHJ5X2NvZGUnIF0gKXtcbiAgLy8gICAgIGluZGV4SXRlbXNbICdudW1iZXInIF0ubWFzayA9IGluZGV4SXRlbXNbICdjb3VudHJ5X2NvZGUnIF0ubWFzayArICcgJyArIGluZGV4SXRlbXNbICdudW1iZXInIF0ubWFzaztcbiAgLy8gICB9XG4gIC8vICAgaWYoIGluZGV4SXRlbXNbICdleHQnIF0gKXtcbiAgLy8gICAgIGluZGV4SXRlbXNbICdudW1iZXInIF0ubWFzayArPSAnIEV4dC4gJyArIGluZGV4SXRlbXNbICdleHQnIF0ubWFzaztcbiAgLy8gICAgIGluZGV4SXRlbXNbICdudW1iZXInIF0uc3BlY2lhbENoYXJzLnB1c2goLi4uWyAnRScsICd4JywgJ3QnIF0pO1xuICAvLyAgIH1cbiAgLy8gfVxuICAvL1xuICAvL1xuICAvLyBwcml2YXRlIF9kaXNhYmxlUGhvbmVJdGVtKGl0ZW06IElucHV0Q29uZmlnKTogdm9pZHtcbiAgLy8gICBpdGVtLmRyb3BTcGVjaWFsID0gZmFsc2U7XG4gIC8vICAgaXRlbS5tYXhsZW5ndGggPSBudWxsO1xuICAvLyAgIGl0ZW0ucGF0Y2guZGlzYWJsZWQgPSB0cnVlO1xuICAvLyAgIGl0ZW0uY29udHJvbC5zZXRWYWxpZGF0b3JzKFtdKTtcbiAgLy8gfVxuXG59XG4iXX0=