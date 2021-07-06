import { Component, ElementRef, Input } from '@angular/core';
import { PopDomService } from '../../../../services/pop-dom.service';
import { StorageGetter } from '../../../../pop-common-utility';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { SwitchFieldSetting } from './switch.setting';
export class PopEntitySwitchComponent extends FieldTemplate {
    constructor(el, _domRepo) {
        super(el, _domRepo, SwitchFieldSetting);
        this.el = el;
        this._domRepo = _domRepo;
        this.name = 'PopEntitySwitchComponent';
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
        const defaultLabel = StorageGetter(this.field, ['children', 'value', 'model', 'label'], '');
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
PopEntitySwitchComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-switch',
                template: "<div class=\"pop-entity-input-field import-field-container\" *ngFor=\"let dataKey of field.data_keys; let i = index;  last as isLast\">\n  <div *ngIf=\"field.items[dataKey]; let items;\">\n    <div class=\"import-flex-row\">\n      <div class=\"import-flex-row-wrap\">\n        <div *ngIf=\"items.config['value']; let item;\" class=\"import-field import-flex-item-xs import-flex-grow-xs\">\n          <lib-pop-switch [config]=\"item\" (events)=\"onFieldItemEvent($event, dataKey, item.column);\"></lib-pop-switch>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"import-field-footer sw-mar-top-sm sw-pad-rgt-lg\" *ngIf=\"field.canRemove && isLast\">\n      <lib-pop-field-btn class=\"sw-mar-rgt-sm\" action=\"remove\" [field]=\"field\" (events)=\"onActionEvent($event, dataKey);\"></lib-pop-field-btn>\n    </div>\n\n  </div>\n</div>\n",
                styles: [""]
            },] }
];
PopEntitySwitchComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService }
];
PopEntitySwitchComponent.propDecorators = {
    field: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1zd2l0Y2guY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktZmllbGQvcG9wLWVudGl0eS1zd2l0Y2gvcG9wLWVudGl0eS1zd2l0Y2guY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFFaEYsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMvRCxPQUFPLEVBQUUsNkJBQTZCLElBQUksYUFBYSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFFdEcsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFPdEQsTUFBTSxPQUFPLHdCQUF5QixTQUFRLGFBQWE7SUFPekQsWUFDUyxFQUFjLEVBQ1gsUUFBdUI7UUFFakMsS0FBSyxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUhqQyxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ1gsYUFBUSxHQUFSLFFBQVEsQ0FBZTtRQUw1QixTQUFJLEdBQUcsMEJBQTBCLENBQUM7SUFRekMsQ0FBQztJQUdEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBR0Q7O09BRUc7SUFDSCxXQUFXO1FBQ1QsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFDRDs7T0FFRztJQUNPLG1CQUFtQjtRQUMzQixNQUFNLFlBQVksR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFFLENBQUMsQ0FBRSxDQUFDLElBQUksQ0FBQztRQUNoRCxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUU7WUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDbkQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUUsT0FBTyxDQUFFLENBQUM7Z0JBQ3pDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7b0JBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBRSxPQUFPLENBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO2lCQUNyRTtxQkFBSTtvQkFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztpQkFDbEU7WUFDSCxDQUFDLENBQUMsQ0FBQztTQUNKO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDOzs7WUFuREYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSx1QkFBdUI7Z0JBQ2pDLDQxQkFBaUQ7O2FBRWxEOzs7WUFabUIsVUFBVTtZQUVyQixhQUFhOzs7b0JBYW5CLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRmllbGRDb25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFBvcERvbVNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtZG9tLnNlcnZpY2UnO1xuaW1wb3J0IHsgU3RvcmFnZUdldHRlciB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQgeyBQb3BFbnRpdHlGaWVsZEJvaWxlckNvbXBvbmVudCBhcyBGaWVsZFRlbXBsYXRlIH0gZnJvbSAnLi4vcG9wLWVudGl0eS1maWVsZC1ib2lsZXIuY29tcG9uZW50JztcbmltcG9ydCB7IEVudGl0eUZpZWxkQ29tcG9uZW50SW50ZXJmYWNlIH0gZnJvbSAnLi4vcG9wLWVudGl0eS1maWVsZC5tb2RlbCc7XG5pbXBvcnQgeyBTd2l0Y2hGaWVsZFNldHRpbmcgfSBmcm9tICcuL3N3aXRjaC5zZXR0aW5nJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC1lbnRpdHktc3dpdGNoJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lbnRpdHktc3dpdGNoLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vcG9wLWVudGl0eS1zd2l0Y2guY29tcG9uZW50LnNjc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBQb3BFbnRpdHlTd2l0Y2hDb21wb25lbnQgZXh0ZW5kcyBGaWVsZFRlbXBsYXRlIGltcGxlbWVudHMgRW50aXR5RmllbGRDb21wb25lbnRJbnRlcmZhY2UsIE9uSW5pdCwgT25EZXN0cm95IHtcblxuICBASW5wdXQoKSBmaWVsZDogRmllbGRDb25maWc7XG5cbiAgcHVibGljIG5hbWUgPSAnUG9wRW50aXR5U3dpdGNoQ29tcG9uZW50JztcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgX2RvbVJlcG86IFBvcERvbVNlcnZpY2VcbiAgKXtcbiAgICBzdXBlcihlbCwgX2RvbVJlcG8sIFN3aXRjaEZpZWxkU2V0dGluZyk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCBzaG91bGQgaGF2ZSBhIHNwZWNpZmljIHB1cnBvc2VcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSBkb20gZGVzdHJveSBmdW5jdGlvbiBtYW5hZ2VzIGFsbCB0aGUgY2xlYW4gdXAgdGhhdCBpcyBuZWNlc3NhcnkgaWYgc3Vic2NyaXB0aW9ucywgdGltZW91dHMsIGV0YyBhcmUgc3RvcmVkIHByb3Blcmx5XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cbiAgLyoqXG4gICAqIFRoaXMgd2lsbCBzZXR1cCB0aGlzIGZpZWxkIHRvIGhhbmRsZSBjaGFuZ2VzIGFuZCB0cmFuc2Zvcm1hdGlvbnNcbiAgICovXG4gIHByb3RlY3RlZCBfc2V0RmllbGRBdHRyaWJ1dGVzKCk6IGJvb2xlYW57XG4gICAgY29uc3QgZGVmYXVsdExhYmVsID0gU3RvcmFnZUdldHRlcih0aGlzLmZpZWxkLCBbICdjaGlsZHJlbicsICd2YWx1ZScsICdtb2RlbCcsICdsYWJlbCcgXSwgJycpO1xuICAgIGNvbnN0IGVudHJ5TGFiZWwgPSB0aGlzLmZpZWxkLmVudHJpZXNbIDAgXS5uYW1lO1xuICAgIGlmKCB0aGlzLmZpZWxkICYmIHRoaXMuZmllbGQuaXRlbXMgKXtcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuZmllbGQuaXRlbXMpLm1hcCgoZGF0YUtleSwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuZmllbGQuaXRlbXNbIGRhdGFLZXkgXTtcbiAgICAgICAgaWYoIHRoaXMuZmllbGQubXVsdGlwbGUgKXtcbiAgICAgICAgICBpdGVtLmNvbmZpZy52YWx1ZS5sYWJlbCA9IHRoaXMuZG9tLnNlc3Npb25bIGRhdGFLZXkgXS5kaXNwbGF5LmxhYmVsO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBpdGVtLmNvbmZpZy52YWx1ZS5sYWJlbCA9IGVudHJ5TGFiZWwgPyBlbnRyeUxhYmVsIDogZGVmYXVsdExhYmVsO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxufVxuIl19