import { Component, ElementRef, Input } from '@angular/core';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { SelectFieldSetting } from './select.setting';
import { StorageGetter } from '../../../../pop-common-utility';
export class PopEntitySelectComponent extends FieldTemplate {
    constructor(el, _domRepo) {
        super(el, _domRepo, SelectFieldSetting);
        this.el = el;
        this._domRepo = _domRepo;
        this.name = 'PopEntitySelectComponent';
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
        const defaultLabel = StorageGetter(this.field, ['children', 'value', 'model', 'label']);
        const entryLabel = this.field.entries[0].name;
        if (this.field && this.field.items) {
            Object.keys(this.field.items).map((dataKey, index) => {
                const item = this.field.items[dataKey];
                if (this.field.multiple) {
                    item.config.value.label = this.dom.session[dataKey].display.label;
                }
                else {
                    item.config.value.label = entryLabel ? entryLabel : defaultLabel;
                }
            });
        }
        return true;
    }
}
PopEntitySelectComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-select',
                template: "<div class=\"pop-entity-input-field import-field-container\" *ngFor=\"let dataKey of field.data_keys; let i = index;  last as isLast\">\n  <div *ngIf=\"field.items[dataKey]; let items;\">\n    <div class=\"import-flex-row\">\n      <div class=\"import-flex-row-wrap\">\n        <div *ngIf=\"items.config['value']; let item;\" class=\"import-field import-flex-item-xs import-flex-grow-xs\">\n          <lib-pop-select [config]=\"item\" (events)=\"onFieldItemEvent($event, dataKey, item.column);\"></lib-pop-select>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"import-field-footer sw-mar-top-sm sw-pad-rgt-lg\" *ngIf=\"field.canRemove && isLast\">\n      <lib-pop-field-btn class=\"sw-mar-rgt-sm\" action=\"remove\" [field]=\"field\" (events)=\"onActionEvent($event, dataKey);\"></lib-pop-field-btn>\n    </div>\n\n  </div>\n</div>\n",
                styles: [""]
            },] }
];
PopEntitySelectComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService }
];
PopEntitySelectComponent.propDecorators = {
    field: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1zZWxlY3QuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktZmllbGQvcG9wLWVudGl0eS1zZWxlY3QvcG9wLWVudGl0eS1zZWxlY3QuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFHaEYsT0FBTyxFQUFFLDZCQUE2QixJQUFJLGFBQWEsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ3RHLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFRL0QsTUFBTSxPQUFPLHdCQUF5QixTQUFRLGFBQWE7SUFNekQsWUFDUyxFQUFjLEVBQ1gsUUFBdUI7UUFFakMsS0FBSyxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUhqQyxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ1gsYUFBUSxHQUFSLFFBQVEsQ0FBZTtRQUw1QixTQUFJLEdBQUcsMEJBQTBCLENBQUM7SUFRekMsQ0FBQztJQUdEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBR0Q7O09BRUc7SUFDSCxXQUFXO1FBQ1QsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFDRDs7T0FFRztJQUNPLG1CQUFtQjtRQUMzQixNQUFNLFlBQVksR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBRSxDQUFDLENBQUM7UUFDMUYsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFFLENBQUMsSUFBSSxDQUFDO1FBQ2hELElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRTtZQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUNuRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBRSxPQUFPLENBQUUsQ0FBQztnQkFDekMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtvQkFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFFLE9BQU8sQ0FBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7aUJBQ3JFO3FCQUFJO29CQUNILElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDO2lCQUNsRTtZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7OztZQWxERixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHVCQUF1QjtnQkFDakMsNDFCQUFpRDs7YUFFbEQ7OztZQWJtQixVQUFVO1lBSXJCLGFBQWE7OztvQkFXbkIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGaWVsZENvbmZpZyB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgRW50aXR5RmllbGRDb21wb25lbnRJbnRlcmZhY2UgfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkLm1vZGVsJztcbmltcG9ydCB7IFBvcEVudGl0eUZpZWxkQm9pbGVyQ29tcG9uZW50IGFzIEZpZWxkVGVtcGxhdGUgfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkLWJvaWxlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQgeyBTZWxlY3RGaWVsZFNldHRpbmcgfSBmcm9tICcuL3NlbGVjdC5zZXR0aW5nJztcbmltcG9ydCB7IFN0b3JhZ2VHZXR0ZXIgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtZW50aXR5LXNlbGVjdCcsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3AtZW50aXR5LXNlbGVjdC5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9wb3AtZW50aXR5LXNlbGVjdC5jb21wb25lbnQuc2NzcycgXVxufSlcbmV4cG9ydCBjbGFzcyBQb3BFbnRpdHlTZWxlY3RDb21wb25lbnQgZXh0ZW5kcyBGaWVsZFRlbXBsYXRlIGltcGxlbWVudHMgRW50aXR5RmllbGRDb21wb25lbnRJbnRlcmZhY2UsIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgZmllbGQ6IEZpZWxkQ29uZmlnO1xuXG4gIHB1YmxpYyBuYW1lID0gJ1BvcEVudGl0eVNlbGVjdENvbXBvbmVudCc7XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIF9kb21SZXBvOiBQb3BEb21TZXJ2aWNlXG4gICl7XG4gICAgc3VwZXIoZWwsIF9kb21SZXBvLCBTZWxlY3RGaWVsZFNldHRpbmcpO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBjb21wb25lbnQgc2hvdWxkIGhhdmUgYSBzcGVjaWZpYyBwdXJwb3NlXG4gICAqL1xuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgZG9tIGRlc3Ryb3kgZnVuY3Rpb24gbWFuYWdlcyBhbGwgdGhlIGNsZWFuIHVwIHRoYXQgaXMgbmVjZXNzYXJ5IGlmIHN1YnNjcmlwdGlvbnMsIHRpbWVvdXRzLCBldGMgYXJlIHN0b3JlZCBwcm9wZXJseVxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgc2V0dXAgdGhpcyBmaWVsZCB0byBoYW5kbGUgY2hhbmdlcyBhbmQgdHJhbnNmb3JtYXRpb25zXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldEZpZWxkQXR0cmlidXRlcygpOiBib29sZWFue1xuICAgIGNvbnN0IGRlZmF1bHRMYWJlbCA9IFN0b3JhZ2VHZXR0ZXIodGhpcy5maWVsZCwgWyAnY2hpbGRyZW4nLCAndmFsdWUnLCAnbW9kZWwnLCAnbGFiZWwnIF0pO1xuICAgIGNvbnN0IGVudHJ5TGFiZWwgPSB0aGlzLmZpZWxkLmVudHJpZXNbIDAgXS5uYW1lO1xuICAgIGlmKCB0aGlzLmZpZWxkICYmIHRoaXMuZmllbGQuaXRlbXMgKXtcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuZmllbGQuaXRlbXMpLm1hcCgoZGF0YUtleSwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuZmllbGQuaXRlbXNbIGRhdGFLZXkgXTtcbiAgICAgICAgaWYoIHRoaXMuZmllbGQubXVsdGlwbGUgKXtcbiAgICAgICAgICBpdGVtLmNvbmZpZy52YWx1ZS5sYWJlbCA9IHRoaXMuZG9tLnNlc3Npb25bIGRhdGFLZXkgXS5kaXNwbGF5LmxhYmVsO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBpdGVtLmNvbmZpZy52YWx1ZS5sYWJlbCA9IGVudHJ5TGFiZWwgPyBlbnRyeUxhYmVsIDogZGVmYXVsdExhYmVsO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuXG59XG4iXX0=