import { Component, ElementRef, Input } from '@angular/core';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { StorageGetter } from '../../../../pop-common-utility';
import { CheckboxFieldSetting } from './checkbox.setting';
export class PopEntityCheckboxComponent extends FieldTemplate {
    constructor(el, _domRepo) {
        super(el, _domRepo, CheckboxFieldSetting);
        this.el = el;
        this._domRepo = _domRepo;
        this.name = 'PopEntityCheckboxComponent';
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
     * This will setup this field to handle changes and transformations
     */
    _setFieldAttributes() {
        const defaultLabel = StorageGetter(this.field, ['children', 'value', 'model', 'label'], '');
        console.log('defaultLabel', defaultLabel);
        const entryLabel = this.field.entries[0].name;
        console.log('entryLabel', entryLabel);
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
PopEntityCheckboxComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-checkbox',
                template: "<div class=\"pop-entity-input-field import-field-container\" *ngFor=\"let dataKey of field.data_keys; let i = index;  last as isLast\">\n  <div *ngIf=\"field.items[dataKey]; let items;\">\n\n    <div class=\"import-flex-row import-flex-item-full\" *ngIf=\"items.config['value']; let item;\">\n      <lib-pop-checkbox class=\"import-field import-flex-item-xs import-flex-grow-xs\" [config]=\"item\" (events)=\"onFieldItemEvent($event, dataKey, 'value');\"></lib-pop-checkbox>\n    </div>\n    <div class=\"import-field-footer sw-mar-top-sm sw-pad-rgt-md\" *ngIf=\"field.canRemove && isLast\">\n      <lib-pop-field-btn class=\"sw-mar-rgt-sm\" action=\"remove\" [field]=\"field\" (events)=\"onActionEvent($event, dataKey);\"></lib-pop-field-btn>\n    </div>\n  </div>\n</div>\n\n",
                styles: [""]
            },] }
];
PopEntityCheckboxComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService }
];
PopEntityCheckboxComponent.propDecorators = {
    field: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1jaGVja2JveC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1maWVsZC9wb3AtZW50aXR5LWNoZWNrYm94L3BvcC1lbnRpdHktY2hlY2tib3guY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFHaEYsT0FBTyxFQUFFLDZCQUE2QixJQUFJLGFBQWEsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ3RHLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDL0QsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFRMUQsTUFBTSxPQUFPLDBCQUEyQixTQUFRLGFBQWE7SUFNM0QsWUFDUyxFQUFjLEVBQ1gsUUFBdUI7UUFFakMsS0FBSyxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUhuQyxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ1gsYUFBUSxHQUFSLFFBQVEsQ0FBZTtRQUw1QixTQUFJLEdBQUcsNEJBQTRCLENBQUM7SUFRM0MsQ0FBQztJQUdEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBR0Q7O09BRUc7SUFDSCxXQUFXO1FBQ1QsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFHRDs7Ozs7c0dBS2tHO0lBR2xHOztPQUVHO0lBQ08sbUJBQW1CO1FBQzNCLE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDMUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFFLENBQUMsSUFBSSxDQUFDO1FBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RDLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRTtZQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUNuRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBRSxPQUFPLENBQUUsQ0FBQztnQkFDekMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtvQkFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFFLE9BQU8sQ0FBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7aUJBQ3JFO3FCQUFJO29CQUNILElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDO2lCQUNsRTtZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7OztZQTlERixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHlCQUF5QjtnQkFDbkMscXhCQUFtRDs7YUFFcEQ7OztZQWJtQixVQUFVO1lBSXJCLGFBQWE7OztvQkFXbkIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBFbnRpdHlGaWVsZENvbXBvbmVudEludGVyZmFjZSB9IGZyb20gJy4uL3BvcC1lbnRpdHktZmllbGQubW9kZWwnO1xuaW1wb3J0IHsgRmllbGRDb25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFBvcEVudGl0eUZpZWxkQm9pbGVyQ29tcG9uZW50IGFzIEZpZWxkVGVtcGxhdGUgfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkLWJvaWxlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQgeyBTdG9yYWdlR2V0dGVyIH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7IENoZWNrYm94RmllbGRTZXR0aW5nIH0gZnJvbSAnLi9jaGVja2JveC5zZXR0aW5nJztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWVudGl0eS1jaGVja2JveCcsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3AtZW50aXR5LWNoZWNrYm94LmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbICcuL3BvcC1lbnRpdHktY2hlY2tib3guY29tcG9uZW50LnNjc3MnIF1cbn0pXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5Q2hlY2tib3hDb21wb25lbnQgZXh0ZW5kcyBGaWVsZFRlbXBsYXRlIGltcGxlbWVudHMgRW50aXR5RmllbGRDb21wb25lbnRJbnRlcmZhY2UsIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgZmllbGQ6IEZpZWxkQ29uZmlnO1xuXG4gIHB1YmxpYyBuYW1lID0gJ1BvcEVudGl0eUNoZWNrYm94Q29tcG9uZW50JztcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgX2RvbVJlcG86IFBvcERvbVNlcnZpY2VcbiAgKXtcbiAgICBzdXBlcihlbCwgX2RvbVJlcG8sIENoZWNrYm94RmllbGRTZXR0aW5nKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IHNob3VsZCBoYXZlIGEgc3BlY2lmaWMgcHVycG9zZVxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIGRvbSBkZXN0cm95IGZ1bmN0aW9uIG1hbmFnZXMgYWxsIHRoZSBjbGVhbiB1cCB0aGF0IGlzIG5lY2Vzc2FyeSBpZiBzdWJzY3JpcHRpb25zLCB0aW1lb3V0cywgZXRjIGFyZSBzdG9yZWQgcHJvcGVybHlcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE92ZXJyaWRlIEluaGVyaXRlZCBNZXRob2RzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByb3RlY3RlZCBNZXRob2RzICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAvKipcbiAgICogVGhpcyB3aWxsIHNldHVwIHRoaXMgZmllbGQgdG8gaGFuZGxlIGNoYW5nZXMgYW5kIHRyYW5zZm9ybWF0aW9uc1xuICAgKi9cbiAgcHJvdGVjdGVkIF9zZXRGaWVsZEF0dHJpYnV0ZXMoKTogYm9vbGVhbntcbiAgICBjb25zdCBkZWZhdWx0TGFiZWwgPSBTdG9yYWdlR2V0dGVyKHRoaXMuZmllbGQsIFsgJ2NoaWxkcmVuJywgJ3ZhbHVlJywgJ21vZGVsJywgJ2xhYmVsJyBdLCAnJyk7XG4gICAgY29uc29sZS5sb2coJ2RlZmF1bHRMYWJlbCcsIGRlZmF1bHRMYWJlbCk7XG4gICAgY29uc3QgZW50cnlMYWJlbCA9IHRoaXMuZmllbGQuZW50cmllc1sgMCBdLm5hbWU7XG4gICAgY29uc29sZS5sb2coJ2VudHJ5TGFiZWwnLCBlbnRyeUxhYmVsKTtcbiAgICBpZiggdGhpcy5maWVsZCAmJiB0aGlzLmZpZWxkLml0ZW1zICl7XG4gICAgICBPYmplY3Qua2V5cyh0aGlzLmZpZWxkLml0ZW1zKS5tYXAoKGRhdGFLZXksIGluZGV4KSA9PiB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmZpZWxkLml0ZW1zWyBkYXRhS2V5IF07XG4gICAgICAgIGlmKCB0aGlzLmZpZWxkLm11bHRpcGxlICl7XG4gICAgICAgICAgaXRlbS5jb25maWcudmFsdWUubGFiZWwgPSB0aGlzLmRvbS5zZXNzaW9uWyBkYXRhS2V5IF0uZGlzcGxheS5sYWJlbDtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgaXRlbS5jb25maWcudmFsdWUubGFiZWwgPSBlbnRyeUxhYmVsID8gZW50cnlMYWJlbCA6IGRlZmF1bHRMYWJlbDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cblxufVxuIl19