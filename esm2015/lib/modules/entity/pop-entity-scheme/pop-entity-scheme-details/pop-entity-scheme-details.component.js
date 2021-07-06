import { Component } from '@angular/core';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopEntitySchemeService } from '../pop-entity-scheme.service';
import { PopTabMenuService } from '../../../base/pop-tab-menu/pop-tab-menu.service';
import { IsValidFieldPatchEvent } from '../../pop-entity-utility';
export class PopEntitySchemeDetailsComponent extends PopExtendComponent {
    constructor(_domRepo, _tabRepo, _schemeRepo) {
        super();
        this._domRepo = _domRepo;
        this._tabRepo = _tabRepo;
        this._schemeRepo = _schemeRepo;
        this.name = 'PopEntitySchemeDetailsComponent';
        this.srv = {
            scheme: undefined,
            tab: undefined
        };
        this.ui = {};
    }
    ngOnInit() {
        super.ngOnInit();
    }
    onBubbleEvent(event) {
        this.log.event(`onBubbleEvent`, event);
        if (IsValidFieldPatchEvent(this.core, event) || event.type === 'context_menu') {
            this.log.info(`IsValidFieldPatchEvent`, event);
            this.events.emit(event);
        }
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
PopEntitySchemeDetailsComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-entity-scheme-details',
                template: "<div>\n  <lib-pop-entity-field-group *ngIf=\"core\" [core]=\"core\" (events)=\"onBubbleEvent($event);\"></lib-pop-entity-field-group>\n</div>\n\n",
                styles: [""]
            },] }
];
PopEntitySchemeDetailsComponent.ctorParameters = () => [
    { type: PopDomService },
    { type: PopTabMenuService },
    { type: PopEntitySchemeService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1zY2hlbWUtZGV0YWlscy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1zY2hlbWUvcG9wLWVudGl0eS1zY2hlbWUtZGV0YWlscy9wb3AtZW50aXR5LXNjaGVtZS1kZXRhaWxzLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFxQixNQUFNLGVBQWUsQ0FBQztBQUM3RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDckUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFdEUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saURBQWlELENBQUM7QUFFcEYsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFRbEUsTUFBTSxPQUFPLCtCQUFnQyxTQUFRLGtCQUFrQjtJQWFyRSxZQUNZLFFBQXVCLEVBQ3ZCLFFBQTJCLEVBQzNCLFdBQW1DO1FBRTdDLEtBQUssRUFBRSxDQUFDO1FBSkUsYUFBUSxHQUFSLFFBQVEsQ0FBZTtRQUN2QixhQUFRLEdBQVIsUUFBUSxDQUFtQjtRQUMzQixnQkFBVyxHQUFYLFdBQVcsQ0FBd0I7UUFmeEMsU0FBSSxHQUFHLGlDQUFpQyxDQUFDO1FBR3RDLFFBQUcsR0FBRztZQUNkLE1BQU0sRUFBMEIsU0FBUztZQUN6QyxHQUFHLEVBQXFCLFNBQVM7U0FDbEMsQ0FBQztRQUVLLE9BQUUsR0FBRyxFQUNYLENBQUM7SUFTRixDQUFDO0lBR0QsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBR0QsYUFBYSxDQUFFLEtBQTRCO1FBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFFLGVBQWUsRUFBRSxLQUFLLENBQUUsQ0FBQztRQUN6QyxJQUFJLHNCQUFzQixDQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFFLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxjQUFjLEVBQUU7WUFDL0UsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUUsd0JBQXdCLEVBQUUsS0FBSyxDQUFFLENBQUM7WUFDakQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUUsS0FBSyxDQUFFLENBQUM7U0FDM0I7SUFDSCxDQUFDO0lBR0QsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDOzs7WUEzQ0YsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSwyQkFBMkI7Z0JBQ3JDLDZKQUF5RDs7YUFFMUQ7OztZQVpRLGFBQWE7WUFHYixpQkFBaUI7WUFGakIsc0JBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQgeyBQb3BFbnRpdHlTY2hlbWVTZXJ2aWNlIH0gZnJvbSAnLi4vcG9wLWVudGl0eS1zY2hlbWUuc2VydmljZSc7XG5pbXBvcnQgeyBCdXR0b25Db25maWcgfSBmcm9tICcuLi8uLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1idXR0b24vYnV0dG9uLWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBQb3BUYWJNZW51U2VydmljZSB9IGZyb20gJy4uLy4uLy4uL2Jhc2UvcG9wLXRhYi1tZW51L3BvcC10YWItbWVudS5zZXJ2aWNlJztcbmltcG9ydCB7IFBvcEJhc2VFdmVudEludGVyZmFjZSB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgSXNWYWxpZEZpZWxkUGF0Y2hFdmVudCB9IGZyb20gJy4uLy4uL3BvcC1lbnRpdHktdXRpbGl0eSc7XG5cblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1lbnRpdHktc2NoZW1lLWRldGFpbHMnLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLWVudGl0eS1zY2hlbWUtZGV0YWlscy5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9wb3AtZW50aXR5LXNjaGVtZS1kZXRhaWxzLmNvbXBvbmVudC5zY3NzJyBdXG59IClcbmV4cG9ydCBjbGFzcyBQb3BFbnRpdHlTY2hlbWVEZXRhaWxzQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBwdWJsaWMgbmFtZSA9ICdQb3BFbnRpdHlTY2hlbWVEZXRhaWxzQ29tcG9uZW50JztcblxuXG4gIHByb3RlY3RlZCBzcnYgPSB7XG4gICAgc2NoZW1lOiA8UG9wRW50aXR5U2NoZW1lU2VydmljZT51bmRlZmluZWQsXG4gICAgdGFiOiA8UG9wVGFiTWVudVNlcnZpY2U+dW5kZWZpbmVkXG4gIH07XG5cbiAgcHVibGljIHVpID0ge1xuICB9O1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIF9kb21SZXBvOiBQb3BEb21TZXJ2aWNlLFxuICAgIHByb3RlY3RlZCBfdGFiUmVwbzogUG9wVGFiTWVudVNlcnZpY2UsXG4gICAgcHJvdGVjdGVkIF9zY2hlbWVSZXBvOiBQb3BFbnRpdHlTY2hlbWVTZXJ2aWNlLFxuICApe1xuICAgIHN1cGVyKCk7XG4gIH1cblxuXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgb25CdWJibGVFdmVudCggZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSApe1xuICAgIHRoaXMubG9nLmV2ZW50KCBgb25CdWJibGVFdmVudGAsIGV2ZW50ICk7XG4gICAgaWYoIElzVmFsaWRGaWVsZFBhdGNoRXZlbnQoIHRoaXMuY29yZSwgZXZlbnQgKSB8fCBldmVudC50eXBlID09PSAnY29udGV4dF9tZW51JyApe1xuICAgICAgdGhpcy5sb2cuaW5mbyggYElzVmFsaWRGaWVsZFBhdGNoRXZlbnRgLCBldmVudCApO1xuICAgICAgdGhpcy5ldmVudHMuZW1pdCggZXZlbnQgKTtcbiAgICB9XG4gIH1cblxuXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG59XG4iXX0=