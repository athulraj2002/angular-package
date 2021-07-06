import { Component, ElementRef, Input } from '@angular/core';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { StorageGetter } from '../../../../pop-common-utility';
import { InputFieldSetting } from './input.settings';
export class PopEntityInputComponent extends FieldTemplate {
    constructor(el, _domRepo) {
        super(el, _domRepo, InputFieldSetting);
        this.el = el;
        this._domRepo = _domRepo;
        this.name = 'PopEntityInputComponent';
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
                item.config.value.label = item.entry ? item.entry.name : defaultLabel;
            });
        }
        return true;
    }
}
PopEntityInputComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-input',
                template: "<div class=\"pop-entity-input-field import-field-container\" *ngFor=\"let dataKey of field.data_keys; let i = index;  last as isLast\">\n  <div *ngIf=\"field.items[dataKey]; let items;\">\n    <!--<div *ngIf=\"dom.state[dataKey]; let state;\">-->\n      <!--<div *ngIf=\"ui.asset[dataKey]; let asset;\">-->\n        <div class=\"import-flex-row import-flex-item-full\" *ngIf=\"items.config['value']; let item;\">\n          <lib-pop-input class=\"import-field import-flex-item-xs import-flex-grow-xs\" [config]=\"item\" (events)=\"onFieldItemEvent($event, dataKey, 'value');\"></lib-pop-input>\n          <!--<div class=\"pop-entity-input-item-icon\" *ngIf=\"field.multiple\">-->\n            <!--<lib-pop-entity-field-edit-icon-->\n              <!--(events)=\"onActionEvent($event, dataKey);\" [field]=\"field\"-->\n              <!--[dom]=\"dom\"-->\n            <!--&gt;</lib-pop-entity-field-edit-icon>-->\n          <!--</div>-->\n        </div>\n        <!--<div [ngClass]=\"{'sw-hidden':!state.open}\" class=\"pt-02 sw-pad-hrz-sm sw-mar-top-xs\">-->\n\n          <!--<div class=\"import-flex-row import-field-flex-row-offset\">-->\n            <!--<div class=\"import-flex-row-wrap\">-->\n              <!--<div *ngIf=\"field.setting.edit_label && asset.entry; let entry;\" class=\"import-field import-field-spacing import-flex-item-sm import-flex-grow-sm\">-->\n                <!--<lib-pop-select [config]=\"entry\"></lib-pop-select>-->\n              <!--</div>-->\n              <!--<div *ngIf=\"state.customLabel && asset.customLabel; let item;\" class=\"import-field import-field-spacing import-flex-item-sm import-flex-grow-sm\">-->\n                <!--<lib-pop-input [config]=\"item\"></lib-pop-input>-->\n              <!--</div>-->\n            <!--</div>-->\n          <!--</div>-->\n\n          <!--<div *ngIf=\"field.canRemove\" class=\"import-flex-row-wrap import-flex-end\">-->\n            <!--<lib-pop-field-btn class=\"sw-mar-top-md sw-pad-rgt-lg\" doAction=\"remove\" [field]=\"field\" (events)=\"onActionEvent($event, dataKey);\"></lib-pop-field-btn>-->\n          <!--</div>-->\n          <!---->\n        <!--</div>-->\n        <!--<div *ngIf=\"isLast && i !== 0\" class=\"import-flex-row-wrap import-flex-end sw-pad-rgt-md sw-pad-vrt-lg\">-->\n          <!--<lib-pop-button-->\n            <!--[config]=\"{value:'Close', size: 30, color: 'accent', bubble: true, event: 'close'}\"-->\n            <!--(events)=\"onActionEvent($event, dataKey);\"-->\n          <!--&gt;</lib-pop-button>-->\n        <!--</div>-->\n        <div class=\"import-field-footer sw-mar-top-sm sw-pad-rgt-lg\" *ngIf=\"field.canRemove && isLast\">\n          <lib-pop-field-btn class=\"sw-mar-rgt-sm\" action=\"remove\" [field]=\"field\" (events)=\"onActionEvent($event, dataKey);\"></lib-pop-field-btn>\n        </div>\n\n      <!--</div>-->\n    <!--</div>-->\n  </div>\n</div>\n\n",
                styles: [".pop-entity-input-item-icon{display:flex;flex-direction:column;width:10%;align-items:flex-end;justify-content:center}"]
            },] }
];
PopEntityInputComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService }
];
PopEntityInputComponent.propDecorators = {
    field: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1pbnB1dC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1maWVsZC9wb3AtZW50aXR5LWlucHV0L3BvcC1lbnRpdHktaW5wdXQuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFHaEYsT0FBTyxFQUFFLDZCQUE2QixJQUFJLGFBQWEsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ3RHLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDL0QsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFRckQsTUFBTSxPQUFPLHVCQUF3QixTQUFRLGFBQWE7SUFNeEQsWUFDUyxFQUFjLEVBQ1gsUUFBdUI7UUFFakMsS0FBSyxDQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLENBQUUsQ0FBQztRQUhsQyxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ1gsYUFBUSxHQUFSLFFBQVEsQ0FBZTtRQUw1QixTQUFJLEdBQUcseUJBQXlCLENBQUM7SUFReEMsQ0FBQztJQUdEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBR0Q7O09BRUc7SUFDSCxXQUFXO1FBQ1QsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFHRDs7Ozs7c0dBS2tHO0lBR2xHOztPQUVHO0lBQ08sbUJBQW1CO1FBQzNCLE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFFLENBQUUsQ0FBQztRQUM1RixJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUU7WUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBRSxDQUFDLEdBQUcsQ0FBRSxDQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUcsRUFBRTtnQkFDeEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUUsT0FBTyxDQUFFLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDO1lBQ3hFLENBQUMsQ0FBRSxDQUFDO1NBQ0w7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7OztZQXZERixTQUFTLFNBQUU7Z0JBQ1YsUUFBUSxFQUFFLHNCQUFzQjtnQkFDaEMsbTFGQUFnRDs7YUFFakQ7OztZQWJtQixVQUFVO1lBSXJCLGFBQWE7OztvQkFXbkIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBFbnRpdHlGaWVsZENvbXBvbmVudEludGVyZmFjZSB9IGZyb20gJy4uL3BvcC1lbnRpdHktZmllbGQubW9kZWwnO1xuaW1wb3J0IHsgRmllbGRDb25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFBvcEVudGl0eUZpZWxkQm9pbGVyQ29tcG9uZW50IGFzIEZpZWxkVGVtcGxhdGUgfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkLWJvaWxlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQgeyBTdG9yYWdlR2V0dGVyIH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7IElucHV0RmllbGRTZXR0aW5nIH0gZnJvbSAnLi9pbnB1dC5zZXR0aW5ncyc7XG5cblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtZW50aXR5LWlucHV0JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lbnRpdHktaW5wdXQuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWVudGl0eS1pbnB1dC5jb21wb25lbnQuc2NzcycgXVxufSApXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5SW5wdXRDb21wb25lbnQgZXh0ZW5kcyBGaWVsZFRlbXBsYXRlIGltcGxlbWVudHMgRW50aXR5RmllbGRDb21wb25lbnRJbnRlcmZhY2UsIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgZmllbGQ6IEZpZWxkQ29uZmlnO1xuXG4gIHB1YmxpYyBuYW1lID0gJ1BvcEVudGl0eUlucHV0Q29tcG9uZW50JztcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgX2RvbVJlcG86IFBvcERvbVNlcnZpY2VcbiAgKXtcbiAgICBzdXBlciggZWwsIF9kb21SZXBvLCBJbnB1dEZpZWxkU2V0dGluZyApO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBjb21wb25lbnQgc2hvdWxkIGhhdmUgYSBzcGVjaWZpYyBwdXJwb3NlXG4gICAqL1xuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgZG9tIGRlc3Ryb3kgZnVuY3Rpb24gbWFuYWdlcyBhbGwgdGhlIGNsZWFuIHVwIHRoYXQgaXMgbmVjZXNzYXJ5IGlmIHN1YnNjcmlwdGlvbnMsIHRpbWVvdXRzLCBldGMgYXJlIHN0b3JlZCBwcm9wZXJseVxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT3ZlcnJpZGUgSW5oZXJpdGVkIE1ldGhvZHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJvdGVjdGVkIE1ldGhvZHMgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgc2V0dXAgdGhpcyBmaWVsZCB0byBoYW5kbGUgY2hhbmdlcyBhbmQgdHJhbnNmb3JtYXRpb25zXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldEZpZWxkQXR0cmlidXRlcygpOiBib29sZWFue1xuICAgIGNvbnN0IGRlZmF1bHRMYWJlbCA9IFN0b3JhZ2VHZXR0ZXIoIHRoaXMuZmllbGQsIFsgJ2NoaWxkcmVuJywgJ3ZhbHVlJywgJ21vZGVsJywgJ2xhYmVsJyBdICk7XG4gICAgaWYoIHRoaXMuZmllbGQgJiYgdGhpcy5maWVsZC5pdGVtcyApe1xuICAgICAgT2JqZWN0LmtleXMoIHRoaXMuZmllbGQuaXRlbXMgKS5tYXAoICggZGF0YUtleSwgaW5kZXggKSA9PiB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmZpZWxkLml0ZW1zWyBkYXRhS2V5IF07XG4gICAgICAgIGl0ZW0uY29uZmlnLnZhbHVlLmxhYmVsID0gaXRlbS5lbnRyeSA/IGl0ZW0uZW50cnkubmFtZSA6IGRlZmF1bHRMYWJlbDtcbiAgICAgIH0gKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==