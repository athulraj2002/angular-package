import { Component, ElementRef, Input } from '@angular/core';
import { PopDomService } from '../../../../services/pop-dom.service';
import { StorageGetter } from '../../../../pop-common-utility';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { TextareaFieldSetting } from './textarea.setting';
export class PopEntityTextareaComponent extends FieldTemplate {
    constructor(el, _domRepo) {
        super(el, _domRepo, TextareaFieldSetting);
        this.el = el;
        this._domRepo = _domRepo;
        this.name = 'PopEntityTextareaComponent';
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
        const defaultLabel = StorageGetter(this.field, ['children', 'value', 'model', 'label']);
        if (this.field && this.field.items) {
            Object.keys(this.field.items).map((dataKey, index) => {
                const item = this.field.items[dataKey];
                item.config.content.label = item.entry ? item.entry.name : defaultLabel;
            });
        }
        return true;
    }
}
PopEntityTextareaComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-textarea',
                template: "<div class=\"pop-entity-textarea-field import-field-container\" *ngFor=\"let dataKey of field.data_keys; let i = index;  last as isLast\">\n  <div *ngIf=\"field.items[dataKey]; let items;\">\n\n    <div class=\"import-flex-row import-flex-item-full\" *ngIf=\"items.config['content']; let item;\">\n      <lib-pop-textarea class=\"import-field import-flex-item-xs import-flex-grow-xs\" [config]=\"item\" (events)=\"onFieldItemEvent($event, dataKey, 'content');\"></lib-pop-textarea>\n    </div>\n\n    <div class=\"import-field-footer sw-mar-top-sm sw-pad-rgt-lg\" *ngIf=\"field.canRemove && isLast\">\n      <lib-pop-field-btn class=\"sw-mar-rgt-sm\" action=\"remove\" [field]=\"field\" (events)=\"onActionEvent($event, dataKey);\"></lib-pop-field-btn>\n    </div>\n\n  </div>\n</div>\n",
                styles: [".pop-entity-textarea-item-icon{display:flex;flex-direction:column;width:10%;align-items:flex-end;justify-content:center}"]
            },] }
];
PopEntityTextareaComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService }
];
PopEntityTextareaComponent.propDecorators = {
    field: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS10ZXh0YXJlYS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1maWVsZC9wb3AtZW50aXR5LXRleHRhcmVhL3BvcC1lbnRpdHktdGV4dGFyZWEuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFFaEYsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMvRCxPQUFPLEVBQUUsNkJBQTZCLElBQUksYUFBYSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFFdEcsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFPMUQsTUFBTSxPQUFPLDBCQUEyQixTQUFRLGFBQWE7SUFPM0QsWUFDUyxFQUFjLEVBQ1gsUUFBdUI7UUFFakMsS0FBSyxDQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsb0JBQW9CLENBQUUsQ0FBQztRQUhyQyxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ1gsYUFBUSxHQUFSLFFBQVEsQ0FBZTtRQUw1QixTQUFJLEdBQUcsNEJBQTRCLENBQUM7SUFRM0MsQ0FBQztJQUdEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBR0Q7O09BRUc7SUFDSCxXQUFXO1FBQ1QsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFHRDs7Ozs7c0dBS2tHO0lBR2xHOztPQUVHO0lBQ08sbUJBQW1CO1FBQzNCLE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFFLENBQUUsQ0FBQztRQUM1RixJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUU7WUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBRSxDQUFDLEdBQUcsQ0FBRSxDQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUcsRUFBRTtnQkFDeEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUUsT0FBTyxDQUFFLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDO1lBQzFFLENBQUMsQ0FBRSxDQUFDO1NBQ0w7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7OztZQXhERixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHlCQUF5QjtnQkFDbkMsOHhCQUFtRDs7YUFFcEQ7OztZQVptQixVQUFVO1lBRXJCLGFBQWE7OztvQkFhbkIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGaWVsZENvbmZpZyB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQgeyBTdG9yYWdlR2V0dGVyIH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7IFBvcEVudGl0eUZpZWxkQm9pbGVyQ29tcG9uZW50IGFzIEZpZWxkVGVtcGxhdGUgfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkLWJvaWxlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgRW50aXR5RmllbGRDb21wb25lbnRJbnRlcmZhY2UgfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkLm1vZGVsJztcbmltcG9ydCB7IFRleHRhcmVhRmllbGRTZXR0aW5nIH0gZnJvbSAnLi90ZXh0YXJlYS5zZXR0aW5nJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC1lbnRpdHktdGV4dGFyZWEnLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLWVudGl0eS10ZXh0YXJlYS5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3BvcC1lbnRpdHktdGV4dGFyZWEuY29tcG9uZW50LnNjc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBQb3BFbnRpdHlUZXh0YXJlYUNvbXBvbmVudCBleHRlbmRzIEZpZWxkVGVtcGxhdGUgaW1wbGVtZW50cyBFbnRpdHlGaWVsZENvbXBvbmVudEludGVyZmFjZSwgT25Jbml0LCBPbkRlc3Ryb3l7XG5cbiAgQElucHV0KCkgZmllbGQ6IEZpZWxkQ29uZmlnO1xuXG4gIHB1YmxpYyBuYW1lID0gJ1BvcEVudGl0eVRleHRhcmVhQ29tcG9uZW50JztcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgX2RvbVJlcG86IFBvcERvbVNlcnZpY2VcbiAgKXtcbiAgICBzdXBlciggZWwsIF9kb21SZXBvLCBUZXh0YXJlYUZpZWxkU2V0dGluZyApO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBjb21wb25lbnQgc2hvdWxkIGhhdmUgYSBzcGVjaWZpYyBwdXJwb3NlXG4gICAqL1xuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgZG9tIGRlc3Ryb3kgZnVuY3Rpb24gbWFuYWdlcyBhbGwgdGhlIGNsZWFuIHVwIHRoYXQgaXMgbmVjZXNzYXJ5IGlmIHN1YnNjcmlwdGlvbnMsIHRpbWVvdXRzLCBldGMgYXJlIHN0b3JlZCBwcm9wZXJseVxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT3ZlcnJpZGUgSW5oZXJpdGVkIE1ldGhvZHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJvdGVjdGVkIE1ldGhvZHMgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgc2V0dXAgdGhpcyBmaWVsZCB0byBoYW5kbGUgY2hhbmdlcyBhbmQgdHJhbnNmb3JtYXRpb25zXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldEZpZWxkQXR0cmlidXRlcygpOiBib29sZWFue1xuICAgIGNvbnN0IGRlZmF1bHRMYWJlbCA9IFN0b3JhZ2VHZXR0ZXIoIHRoaXMuZmllbGQsIFsgJ2NoaWxkcmVuJywgJ3ZhbHVlJywgJ21vZGVsJywgJ2xhYmVsJyBdICk7XG4gICAgaWYoIHRoaXMuZmllbGQgJiYgdGhpcy5maWVsZC5pdGVtcyApe1xuICAgICAgT2JqZWN0LmtleXMoIHRoaXMuZmllbGQuaXRlbXMgKS5tYXAoICggZGF0YUtleSwgaW5kZXggKSA9PiB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmZpZWxkLml0ZW1zWyBkYXRhS2V5IF07XG4gICAgICAgIGl0ZW0uY29uZmlnLmNvbnRlbnQubGFiZWwgPSBpdGVtLmVudHJ5ID8gaXRlbS5lbnRyeS5uYW1lIDogZGVmYXVsdExhYmVsO1xuICAgICAgfSApO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG59XG4iXX0=