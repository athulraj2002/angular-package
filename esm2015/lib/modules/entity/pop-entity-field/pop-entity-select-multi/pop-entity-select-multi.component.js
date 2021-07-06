import { Component, ElementRef, Input } from '@angular/core';
import { PopDomService } from '../../../../services/pop-dom.service';
import { StorageGetter } from '../../../../pop-common-utility';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { SelectMultiFieldSetting } from './select-mulit.setting';
export class PopEntitySelectMultiComponent extends FieldTemplate {
    constructor(el, _domRepo) {
        super(el, _domRepo, SelectMultiFieldSetting);
        this.el = el;
        this._domRepo = _domRepo;
        this.name = 'PopEntitySelectMultiComponent';
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
PopEntitySelectMultiComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-select-multi',
                template: "<div class=\"pop-entity-input-field import-field-container\" *ngFor=\"let dataKey of field.data_keys; let i = index;  last as isLast\">\n  <div *ngIf=\"field.items[dataKey]; let items;\">\n    <div class=\"import-flex-row\">\n      <div class=\"import-flex-row-wrap\">\n        <div *ngIf=\"items.config['value']; let item;\" class=\"import-field import-flex-item-xs import-flex-grow-xs\">\n          <lib-pop-select-multi [config]=\"item\" (events)=\"onFieldItemEvent($event, dataKey, item.column);\"></lib-pop-select-multi>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"import-field-footer sw-mar-top-sm sw-pad-rgt-lg\" *ngIf=\"field.canRemove && isLast\">\n      <lib-pop-field-btn class=\"sw-mar-rgt-sm\" action=\"remove\" [field]=\"field\" (events)=\"onActionEvent($event, dataKey);\"></lib-pop-field-btn>\n    </div>\n\n  </div>\n</div>\n",
                styles: [""]
            },] }
];
PopEntitySelectMultiComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService }
];
PopEntitySelectMultiComponent.propDecorators = {
    field: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1zZWxlY3QtbXVsdGkuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktZmllbGQvcG9wLWVudGl0eS1zZWxlY3QtbXVsdGkvcG9wLWVudGl0eS1zZWxlY3QtbXVsdGkuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFFaEYsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMvRCxPQUFPLEVBQUUsNkJBQTZCLElBQUksYUFBYSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFFdEcsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFPakUsTUFBTSxPQUFPLDZCQUE4QixTQUFRLGFBQWE7SUFPOUQsWUFDUyxFQUFjLEVBQ1gsUUFBdUI7UUFFakMsS0FBSyxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztRQUh0QyxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ1gsYUFBUSxHQUFSLFFBQVEsQ0FBZTtRQUw1QixTQUFJLEdBQUcsK0JBQStCLENBQUM7SUFROUMsQ0FBQztJQUdEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBR0Q7O09BRUc7SUFDSCxXQUFXO1FBQ1QsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFDRDs7T0FFRztJQUNPLG1CQUFtQjtRQUMzQixNQUFNLFlBQVksR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBRSxDQUFDLENBQUM7UUFDMUYsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFFLENBQUMsSUFBSSxDQUFDO1FBQ2hELElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRTtZQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUNuRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBRSxPQUFPLENBQUUsQ0FBQztnQkFDekMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtvQkFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFFLE9BQU8sQ0FBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7aUJBQ3JFO3FCQUFJO29CQUNILElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDO2lCQUNsRTtZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7OztZQW5ERixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLDZCQUE2QjtnQkFDdkMsdzJCQUF1RDs7YUFFeEQ7OztZQVptQixVQUFVO1lBRXJCLGFBQWE7OztvQkFhbkIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGaWVsZENvbmZpZyB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQgeyBTdG9yYWdlR2V0dGVyIH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7IFBvcEVudGl0eUZpZWxkQm9pbGVyQ29tcG9uZW50IGFzIEZpZWxkVGVtcGxhdGUgfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkLWJvaWxlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgRW50aXR5RmllbGRDb21wb25lbnRJbnRlcmZhY2UgfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkLm1vZGVsJztcbmltcG9ydCB7IFNlbGVjdE11bHRpRmllbGRTZXR0aW5nIH0gZnJvbSAnLi9zZWxlY3QtbXVsaXQuc2V0dGluZyc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtZW50aXR5LXNlbGVjdC1tdWx0aScsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3AtZW50aXR5LXNlbGVjdC1tdWx0aS5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3BvcC1lbnRpdHktc2VsZWN0LW11bHRpLmNvbXBvbmVudC5zY3NzJ11cbn0pXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5U2VsZWN0TXVsdGlDb21wb25lbnQgZXh0ZW5kcyBGaWVsZFRlbXBsYXRlIGltcGxlbWVudHMgRW50aXR5RmllbGRDb21wb25lbnRJbnRlcmZhY2UsIE9uSW5pdCwgT25EZXN0cm95ICB7XG5cbiAgQElucHV0KCkgZmllbGQ6IEZpZWxkQ29uZmlnO1xuXG4gIHB1YmxpYyBuYW1lID0gJ1BvcEVudGl0eVNlbGVjdE11bHRpQ29tcG9uZW50JztcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgX2RvbVJlcG86IFBvcERvbVNlcnZpY2VcbiAgKXtcbiAgICBzdXBlcihlbCwgX2RvbVJlcG8sIFNlbGVjdE11bHRpRmllbGRTZXR0aW5nKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IHNob3VsZCBoYXZlIGEgc3BlY2lmaWMgcHVycG9zZVxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIGRvbSBkZXN0cm95IGZ1bmN0aW9uIG1hbmFnZXMgYWxsIHRoZSBjbGVhbiB1cCB0aGF0IGlzIG5lY2Vzc2FyeSBpZiBzdWJzY3JpcHRpb25zLCB0aW1lb3V0cywgZXRjIGFyZSBzdG9yZWQgcHJvcGVybHlcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuICAvKipcbiAgICogVGhpcyB3aWxsIHNldHVwIHRoaXMgZmllbGQgdG8gaGFuZGxlIGNoYW5nZXMgYW5kIHRyYW5zZm9ybWF0aW9uc1xuICAgKi9cbiAgcHJvdGVjdGVkIF9zZXRGaWVsZEF0dHJpYnV0ZXMoKTogYm9vbGVhbntcbiAgICBjb25zdCBkZWZhdWx0TGFiZWwgPSBTdG9yYWdlR2V0dGVyKHRoaXMuZmllbGQsIFsgJ2NoaWxkcmVuJywgJ3ZhbHVlJywgJ21vZGVsJywgJ2xhYmVsJyBdKTtcbiAgICBjb25zdCBlbnRyeUxhYmVsID0gdGhpcy5maWVsZC5lbnRyaWVzWyAwIF0ubmFtZTtcbiAgICBpZiggdGhpcy5maWVsZCAmJiB0aGlzLmZpZWxkLml0ZW1zICl7XG4gICAgICBPYmplY3Qua2V5cyh0aGlzLmZpZWxkLml0ZW1zKS5tYXAoKGRhdGFLZXksIGluZGV4KSA9PiB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmZpZWxkLml0ZW1zWyBkYXRhS2V5IF07XG4gICAgICAgIGlmKCB0aGlzLmZpZWxkLm11bHRpcGxlICl7XG4gICAgICAgICAgaXRlbS5jb25maWcudmFsdWUubGFiZWwgPSB0aGlzLmRvbS5zZXNzaW9uWyBkYXRhS2V5IF0uZGlzcGxheS5sYWJlbDtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgaXRlbS5jb25maWcudmFsdWUubGFiZWwgPSBlbnRyeUxhYmVsID8gZW50cnlMYWJlbCA6IGRlZmF1bHRMYWJlbDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbn1cbiJdfQ==