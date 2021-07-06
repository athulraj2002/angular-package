import { Component, ElementRef, Input } from '@angular/core';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { StorageGetter } from '../../../../pop-common-utility';
import { RadioFieldSetting } from './radio.setting';
export class PopEntityRadioComponent extends FieldTemplate {
    constructor(el, _domRepo) {
        super(el, _domRepo, RadioFieldSetting);
        this.el = el;
        this._domRepo = _domRepo;
        this.name = 'PopEntityRadioComponent';
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
        if (this.field && this.field.items) {
            Object.keys(this.field.items).map((dataKey, index) => {
                const item = this.field.items[dataKey];
                item.config.value.label = item.entry ? item.entry.name : defaultLabel;
            });
        }
        return true;
    }
}
PopEntityRadioComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-radio',
                template: "<div class=\"pop-entity-input-field import-field-container\" *ngFor=\"let dataKey of field.data_keys; let i = index;  last as isLast\">\n  <div *ngIf=\"field.items[dataKey]; let items;\">\n\n    <div class=\"import-flex-row import-flex-item-full\" *ngIf=\"items.config['value']; let item;\">\n      <lib-pop-radio class=\"import-field import-flex-item-xs import-flex-grow-xs\" [config]=\"item\" (events)=\"onFieldItemEvent($event, dataKey, 'value');\"></lib-pop-radio>\n    </div>\n\n    <div class=\"import-field-footer sw-mar-top-sm sw-pad-rgt-lg\" *ngIf=\"field.canRemove && isLast\">\n      <lib-pop-field-btn class=\"sw-mar-rgt-sm\" action=\"remove\" [field]=\"field\" (events)=\"onActionEvent($event, dataKey);\"></lib-pop-field-btn>\n    </div>\n  </div>\n</div>\n",
                styles: [".pop-entity-input-item-icon{display:flex;flex-direction:column;width:10%;align-items:flex-end;justify-content:center}"]
            },] }
];
PopEntityRadioComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService }
];
PopEntityRadioComponent.propDecorators = {
    field: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1yYWRpby5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1maWVsZC9wb3AtZW50aXR5LXJhZGlvL3BvcC1lbnRpdHktcmFkaW8uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFFaEYsT0FBTyxFQUFFLDZCQUE2QixJQUFJLGFBQWEsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBRXRHLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDL0QsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFRcEQsTUFBTSxPQUFPLHVCQUF3QixTQUFRLGFBQWE7SUFNeEQsWUFDUyxFQUFjLEVBQ1gsUUFBdUI7UUFFakMsS0FBSyxDQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLENBQUUsQ0FBQztRQUhsQyxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ1gsYUFBUSxHQUFSLFFBQVEsQ0FBZTtRQUw1QixTQUFJLEdBQUcseUJBQXlCLENBQUM7SUFReEMsQ0FBQztJQUdEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBR0Q7O09BRUc7SUFDSCxXQUFXO1FBQ1QsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFHRDs7Ozs7c0dBS2tHO0lBR2xHOztPQUVHO0lBQ08sbUJBQW1CO1FBQzNCLE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFFLEVBQUUsRUFBRSxDQUFFLENBQUM7UUFDaEcsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFO1lBQ2xDLE1BQU0sQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUUsQ0FBQyxHQUFHLENBQUUsQ0FBRSxPQUFPLEVBQUUsS0FBSyxFQUFHLEVBQUU7Z0JBQ3hELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFFLE9BQU8sQ0FBRSxDQUFDO2dCQUN6QyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztZQUN4RSxDQUFDLENBQUUsQ0FBQztTQUNMO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDOzs7WUF2REYsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSxzQkFBc0I7Z0JBQ2hDLCt3QkFBZ0Q7O2FBRWpEOzs7WUFibUIsVUFBVTtZQUlyQixhQUFhOzs7b0JBV25CLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRmllbGRDb25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFBvcEVudGl0eUZpZWxkQm9pbGVyQ29tcG9uZW50IGFzIEZpZWxkVGVtcGxhdGUgfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkLWJvaWxlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgRW50aXR5RmllbGRDb21wb25lbnRJbnRlcmZhY2UgfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkLm1vZGVsJztcbmltcG9ydCB7IFBvcERvbVNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtZG9tLnNlcnZpY2UnO1xuaW1wb3J0IHsgU3RvcmFnZUdldHRlciB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQgeyBSYWRpb0ZpZWxkU2V0dGluZyB9IGZyb20gJy4vcmFkaW8uc2V0dGluZyc7XG5cblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtZW50aXR5LXJhZGlvJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lbnRpdHktcmFkaW8uY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWVudGl0eS1yYWRpby5jb21wb25lbnQuc2NzcycgXVxufSApXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5UmFkaW9Db21wb25lbnQgZXh0ZW5kcyBGaWVsZFRlbXBsYXRlIGltcGxlbWVudHMgRW50aXR5RmllbGRDb21wb25lbnRJbnRlcmZhY2UsIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgZmllbGQ6IEZpZWxkQ29uZmlnO1xuXG4gIHB1YmxpYyBuYW1lID0gJ1BvcEVudGl0eVJhZGlvQ29tcG9uZW50JztcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgX2RvbVJlcG86IFBvcERvbVNlcnZpY2VcbiAgKXtcbiAgICBzdXBlciggZWwsIF9kb21SZXBvLCBSYWRpb0ZpZWxkU2V0dGluZyApO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBjb21wb25lbnQgc2hvdWxkIGhhdmUgYSBzcGVjaWZpYyBwdXJwb3NlXG4gICAqL1xuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgZG9tIGRlc3Ryb3kgZnVuY3Rpb24gbWFuYWdlcyBhbGwgdGhlIGNsZWFuIHVwIHRoYXQgaXMgbmVjZXNzYXJ5IGlmIHN1YnNjcmlwdGlvbnMsIHRpbWVvdXRzLCBldGMgYXJlIHN0b3JlZCBwcm9wZXJseVxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT3ZlcnJpZGUgSW5oZXJpdGVkIE1ldGhvZHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJvdGVjdGVkIE1ldGhvZHMgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgc2V0dXAgdGhpcyBmaWVsZCB0byBoYW5kbGUgY2hhbmdlcyBhbmQgdHJhbnNmb3JtYXRpb25zXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldEZpZWxkQXR0cmlidXRlcygpOiBib29sZWFue1xuICAgIGNvbnN0IGRlZmF1bHRMYWJlbCA9IFN0b3JhZ2VHZXR0ZXIoIHRoaXMuZmllbGQsIFsgJ2NoaWxkcmVuJywgJ3ZhbHVlJywgJ21vZGVsJywgJ2xhYmVsJyBdLCAnJyApO1xuICAgIGlmKCB0aGlzLmZpZWxkICYmIHRoaXMuZmllbGQuaXRlbXMgKXtcbiAgICAgIE9iamVjdC5rZXlzKCB0aGlzLmZpZWxkLml0ZW1zICkubWFwKCAoIGRhdGFLZXksIGluZGV4ICkgPT4ge1xuICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5maWVsZC5pdGVtc1sgZGF0YUtleSBdO1xuICAgICAgICBpdGVtLmNvbmZpZy52YWx1ZS5sYWJlbCA9IGl0ZW0uZW50cnkgPyBpdGVtLmVudHJ5Lm5hbWUgOiBkZWZhdWx0TGFiZWw7XG4gICAgICB9ICk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbn1cbiJdfQ==