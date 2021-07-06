import { Component, ElementRef, Input } from '@angular/core';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { EmailFieldSetting } from './email.setting';
import { ButtonConfig } from '../../../base/pop-field-item/pop-button/button-config.model';
import { Validators } from '@angular/forms';
export class PopEntityEmailComponent extends FieldTemplate {
    constructor(el, _domRepo) {
        super(el, _domRepo, EmailFieldSetting);
        this.el = el;
        this._domRepo = _domRepo;
        this.name = 'PopEntityEmailComponent';
        this.asset = {
            extensionKeys: ['action'],
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
    /**
     * This will be different for each type of field group
     * Intended to be overridden in each class
     */
    _setFieldItemAttribute(dataKey, index) {
        const item = this.field.items[dataKey];
        const configKeys = Object.keys(item.config);
        this.dom.state.has_extension = configKeys.some(r => this.asset.extensionKeys.includes(r));
        if ('action' in item.config) {
            this.ui.actionBtnWidth = 50;
            item.config['action'] = new ButtonConfig({
                icon: 'email',
                size: 42,
                value: null,
                // disabled: true
            });
        }
        if ('address' in item.config) {
            const child = this.field.children['address'];
            const addressConfig = item.config['address'];
            addressConfig.pattern = 'Email';
            addressConfig.type = 'email';
            const validators = [];
            validators.push(Validators.email);
            if (+child.rule.required)
                validators.push(Validators.required);
            if (+child.rule.maxlength)
                validators.push(Validators.maxLength(+child.rule.maxlength));
            addressConfig.validators = validators;
            if (this.field.multiple)
                addressConfig.label = this.field.entries[index].name;
            addressConfig.patch.callback = () => {
                this._updateAddress(+dataKey, index);
            };
            this._updateAddress(+dataKey, index);
        }
        return true;
    }
    _updateAddress(dataKey, index) {
        const addressConfig = this._getDataKeyItemConfig(dataKey, 'address');
        if (addressConfig.metadata.source) {
            const value = addressConfig.control.value;
            addressConfig.value = value;
            this._triggerUpdateAssetDisplay(dataKey);
        }
    }
}
PopEntityEmailComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-email',
                template: "<div class=\"pop-entity-input-field import-field-container\">\n  <div *ngFor=\"let dataKey of field.data_keys; let i = index;  last as isLast\">\n    <div *ngIf=\"field.items[dataKey].config; let items;\" class=\"import-flex-column import-flex-item-full\">\n      <div class=\"import-flex-row import-field-flex-row-offset\">\n        <div class=\"import-field import-field-spacing import-flex-item-sm import-flex-grow-md\" *ngIf=\"items['address']; let item;\">\n          <lib-pop-input [config]=\"item\" (events)=\"onFieldItemEvent($event, dataKey, 'address');\"></lib-pop-input>\n        </div>\n\n        <div *ngIf=\"items['action']; let item;\" class=\"pop-entity-email-btn-container\">\n          <div class=\"import-field import-flex-item-icon\">\n            <lib-pop-button\n              [config]=\"item\"\n              (events)=\"onActionEvent($event, dataKey);\"\n            ></lib-pop-button>\n          </div>\n        </div>\n\n      </div>\n      <div class=\"import-field-footer sw-mar-top-sm sw-pad-rgt-md\" *ngIf=\"field.canRemove && isLast\">\n        <lib-pop-field-btn class=\"sw-mar-rgt-sm\" action=\"remove\" [field]=\"field\" (events)=\"onActionEvent($event, dataKey);\"></lib-pop-field-btn>\n      </div>\n    </div>\n  </div>\n</div>\n",
                styles: [".pop-entity-email-btn-container{position:relative;display:flex;top:9px;left:-7px;flex-direction:row;max-height:40px;align-items:center;justify-content:flex-end}.pop-entity-email-btn-container div{margin-left:5px}"]
            },] }
];
PopEntityEmailComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService }
];
PopEntityEmailComponent.propDecorators = {
    field: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1lbWFpbC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1maWVsZC9wb3AtZW50aXR5LWVtYWlsL3BvcC1lbnRpdHktZW1haWwuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFHaEYsT0FBTyxFQUFFLDZCQUE2QixJQUFJLGFBQWEsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ3RHLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNkRBQTZELENBQUM7QUFHM0YsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBUTVDLE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxhQUFhO0lBV3hELFlBQ1MsRUFBYyxFQUNYLFFBQXVCO1FBRWpDLEtBQUssQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFIaEMsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUNYLGFBQVEsR0FBUixRQUFRLENBQWU7UUFUNUIsU0FBSSxHQUFHLHlCQUF5QixDQUFDO1FBRTlCLFVBQUssR0FBRztZQUNoQixhQUFhLEVBQUUsQ0FBRSxRQUFRLENBQUU7U0FDNUIsQ0FBQztJQVFGLENBQUM7SUFHRDs7T0FFRztJQUNILFFBQVE7UUFDTixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUdEOztPQUVHO0lBQ0gsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJ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RSxLQUFhO1FBQ25ELE1BQU0sYUFBYSxHQUFpQixJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ25GLElBQUksYUFBYSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7WUFDakMsTUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDMUMsYUFBYSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFFNUIsSUFBSSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzFDO0lBQ0gsQ0FBQzs7O1lBekdGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsc0JBQXNCO2dCQUNoQyw2dkNBQWdEOzthQUVqRDs7O1lBaEJtQixVQUFVO1lBSXJCLGFBQWE7OztvQkFjbkIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBFbnRpdHlGaWVsZENvbXBvbmVudEludGVyZmFjZSB9IGZyb20gJy4uL3BvcC1lbnRpdHktZmllbGQubW9kZWwnO1xuaW1wb3J0IHsgRmllbGRDb25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFBvcEVudGl0eUZpZWxkQm9pbGVyQ29tcG9uZW50IGFzIEZpZWxkVGVtcGxhdGUgfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkLWJvaWxlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQgeyBFbWFpbEZpZWxkU2V0dGluZyB9IGZyb20gJy4vZW1haWwuc2V0dGluZyc7XG5pbXBvcnQgeyBCdXR0b25Db25maWcgfSBmcm9tICcuLi8uLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1idXR0b24vYnV0dG9uLWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBTZWxlY3RDb25maWcgfSBmcm9tICcuLi8uLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1zZWxlY3Qvc2VsZWN0LWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBJbnB1dENvbmZpZyB9IGZyb20gJy4uLy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLWlucHV0L2lucHV0LWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBWYWxpZGF0b3JzIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtZW50aXR5LWVtYWlsJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lbnRpdHktZW1haWwuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWVudGl0eS1lbWFpbC5jb21wb25lbnQuc2NzcycgXSxcbn0pXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5RW1haWxDb21wb25lbnQgZXh0ZW5kcyBGaWVsZFRlbXBsYXRlIGltcGxlbWVudHMgRW50aXR5RmllbGRDb21wb25lbnRJbnRlcmZhY2UsIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgZmllbGQ6IEZpZWxkQ29uZmlnO1xuXG5cbiAgcHVibGljIG5hbWUgPSAnUG9wRW50aXR5RW1haWxDb21wb25lbnQnO1xuXG4gIHByb3RlY3RlZCBhc3NldCA9IHtcbiAgICBleHRlbnNpb25LZXlzOiBbICdhY3Rpb24nIF0sXG4gIH07XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIF9kb21SZXBvOiBQb3BEb21TZXJ2aWNlXG4gICl7XG4gICAgc3VwZXIoZWwsIF9kb21SZXBvLCBFbWFpbEZpZWxkU2V0dGluZyk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCBzaG91bGQgaGF2ZSBhIHNwZWNpZmljIHB1cnBvc2VcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSBkb20gZGVzdHJveSBmdW5jdGlvbiBtYW5hZ2VzIGFsbCB0aGUgY2xlYW4gdXAgdGhhdCBpcyBuZWNlc3NhcnkgaWYgc3Vic2NyaXB0aW9ucywgdGltZW91dHMsIGV0YyBhcmUgc3RvcmVkIHByb3Blcmx5XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgc2V0dXAgdGhpcyBmaWVsZCB0byBoYW5kbGUgY2hhbmdlcyBhbmQgdHJhbnNmb3JtYXRpb25zXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldEZpZWxkQXR0cmlidXRlcygpOiBib29sZWFue1xuXG4gICAgaWYoIHRoaXMuZmllbGQgJiYgdGhpcy5maWVsZC5pdGVtcyApe1xuICAgICAgT2JqZWN0LmtleXModGhpcy5maWVsZC5pdGVtcykubWFwKChkYXRhS2V5LCBpbmRleCkgPT4ge1xuICAgICAgICB0aGlzLl9zZXRGaWVsZEl0ZW1BdHRyaWJ1dGUoK2RhdGFLZXksIGluZGV4KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgd2lsbCBiZSBkaWZmZXJlbnQgZm9yIGVhY2ggdHlwZSBvZiBmaWVsZCBncm91cFxuICAgKiBJbnRlbmRlZCB0byBiZSBvdmVycmlkZGVuIGluIGVhY2ggY2xhc3NcbiAgICovXG4gIHByb3RlY3RlZCBfc2V0RmllbGRJdGVtQXR0cmlidXRlKGRhdGFLZXk6IG51bWJlciwgaW5kZXg6IG51bWJlcik6IGJvb2xlYW57XG5cbiAgICBjb25zdCBpdGVtID0gdGhpcy5maWVsZC5pdGVtc1sgZGF0YUtleSBdO1xuICAgIGNvbnN0IGNvbmZpZ0tleXMgPSBPYmplY3Qua2V5cyhpdGVtLmNvbmZpZyk7XG5cbiAgICB0aGlzLmRvbS5zdGF0ZS5oYXNfZXh0ZW5zaW9uID0gY29uZmlnS2V5cy5zb21lKHIgPT4gdGhpcy5hc3NldC5leHRlbnNpb25LZXlzLmluY2x1ZGVzKHIpKTtcblxuICAgIGlmKCAnYWN0aW9uJyBpbiBpdGVtLmNvbmZpZyApe1xuICAgICAgdGhpcy51aS5hY3Rpb25CdG5XaWR0aCA9IDUwO1xuICAgICAgaXRlbS5jb25maWdbICdhY3Rpb24nIF0gPSBuZXcgQnV0dG9uQ29uZmlnKHtcbiAgICAgICAgaWNvbjogJ2VtYWlsJyxcbiAgICAgICAgc2l6ZTogNDIsXG4gICAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgICAvLyBkaXNhYmxlZDogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBpZiggJ2FkZHJlc3MnIGluIGl0ZW0uY29uZmlnICl7XG4gICAgICBjb25zdCBjaGlsZCA9IHRoaXMuZmllbGQuY2hpbGRyZW5bICdhZGRyZXNzJyBdO1xuICAgICAgY29uc3QgYWRkcmVzc0NvbmZpZyA9IDxJbnB1dENvbmZpZz5pdGVtLmNvbmZpZ1sgJ2FkZHJlc3MnIF07XG4gICAgICBhZGRyZXNzQ29uZmlnLnBhdHRlcm4gPSAnRW1haWwnO1xuICAgICAgYWRkcmVzc0NvbmZpZy50eXBlID0gJ2VtYWlsJztcbiAgICAgIGNvbnN0IHZhbGlkYXRvcnMgPSBbXTtcbiAgICAgIHZhbGlkYXRvcnMucHVzaChWYWxpZGF0b3JzLmVtYWlsKTtcbiAgICAgIGlmKCArY2hpbGQucnVsZS5yZXF1aXJlZCApIHZhbGlkYXRvcnMucHVzaChWYWxpZGF0b3JzLnJlcXVpcmVkKTtcbiAgICAgIGlmKCArY2hpbGQucnVsZS5tYXhsZW5ndGggKSB2YWxpZGF0b3JzLnB1c2goVmFsaWRhdG9ycy5tYXhMZW5ndGgoK2NoaWxkLnJ1bGUubWF4bGVuZ3RoKSk7XG4gICAgICBhZGRyZXNzQ29uZmlnLnZhbGlkYXRvcnMgPSB2YWxpZGF0b3JzO1xuICAgICAgaWYoIHRoaXMuZmllbGQubXVsdGlwbGUgKSBhZGRyZXNzQ29uZmlnLmxhYmVsID0gdGhpcy5maWVsZC5lbnRyaWVzWyBpbmRleCBdLm5hbWU7XG4gICAgICBhZGRyZXNzQ29uZmlnLnBhdGNoLmNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLl91cGRhdGVBZGRyZXNzKCtkYXRhS2V5LCBpbmRleCk7XG4gICAgICB9O1xuICAgICAgdGhpcy5fdXBkYXRlQWRkcmVzcygrZGF0YUtleSwgaW5kZXgpO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cblxuICBwcml2YXRlIF91cGRhdGVBZGRyZXNzKGRhdGFLZXk6IG51bWJlciwgaW5kZXg6IG51bWJlcil7XG4gICAgY29uc3QgYWRkcmVzc0NvbmZpZyA9IDxTZWxlY3RDb25maWc+dGhpcy5fZ2V0RGF0YUtleUl0ZW1Db25maWcoZGF0YUtleSwgJ2FkZHJlc3MnKTtcbiAgICBpZiggYWRkcmVzc0NvbmZpZy5tZXRhZGF0YS5zb3VyY2UgKXtcbiAgICAgIGNvbnN0IHZhbHVlID0gYWRkcmVzc0NvbmZpZy5jb250cm9sLnZhbHVlO1xuICAgICAgYWRkcmVzc0NvbmZpZy52YWx1ZSA9IHZhbHVlO1xuXG4gICAgICB0aGlzLl90cmlnZ2VyVXBkYXRlQXNzZXREaXNwbGF5KGRhdGFLZXkpO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=