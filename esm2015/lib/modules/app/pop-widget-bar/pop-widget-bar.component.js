import { __awaiter } from "tslib";
import { Component, HostBinding, Inject, Input } from '@angular/core';
import { PopAuth } from '../../../pop-common.model';
import { PopExtendDynamicComponent } from '../../../pop-extend-dynamic.component';
import { IsObject } from '../../../pop-common-utility';
export class PopWidgetBarComponent extends PopExtendDynamicComponent {
    constructor(APP_GLOBAL, APP_WIDGETS) {
        super();
        this.APP_GLOBAL = APP_GLOBAL;
        this.APP_WIDGETS = APP_WIDGETS;
        this.hidden = false;
        this.widgets = [];
        this.name = 'PopWidgetBarComponent';
        this.ui = {};
        this.asset = {};
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.dom.state.open = false;
                this.dom.state.closed = true;
                this.dom.setSubscriber('init', this.APP_GLOBAL.init.subscribe((val) => {
                    if (val)
                        this._initialize();
                }));
                return resolve(true);
            }));
        };
    }
    ngOnInit() {
        super.ngOnInit();
    }
    onToggleMenu() {
        this.dom.state.open = !this.dom.state.open;
        this.dom.state.closed = !this.dom.state.open;
        window.dispatchEvent(new Event('onWindowResize'));
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    _initialize() {
        this.hidden = ((this.APP_GLOBAL.isEntities() && !(IsObject(PopAuth))) || !(this.widgets.length)) ? true : false;
        return true;
    }
}
PopWidgetBarComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-widget-bar',
                template: "<div class=\"pop-widget-bar-container \" [ngClass]=\"{'pop-widget-bar-open': dom.state.open, 'pop-widget-bar-closed': dom.state.closed}\">\n  <div class=\"pop-widget-bar-layout\">\n    <p class=\"pop-widget-bar-icon-container\"></p>\n    <div class=\"pop-widget-item\">\n\n    </div>\n  </div>\n  <!--<button class=\"pop-widget-bar-toggle\" mat-icon-button (click)=\"onToggleMenu()\">-->\n    <!--<span class=\"sw-pop-icon\" *ngIf=\"dom.state.closed\">H</span>-->\n    <!--<span class=\"sw-pop-icon\" *ngIf=\"dom.state.open\">I</span>-->\n  <!--</button>-->\n</div>\n\n",
                styles: [".pop-widget-bar-container{overflow-x:hidden;overflow-y:hidden;height:100vh;margin:0}.pop-widget-bar-open{width:255px;transition:width .5s}.pop-widget-bar-closed{width:79px;transition:width .5s;background-color:var(--background-main-menu)}.pop-widget-bar-layout{overflow:hidden}.pop-widget-bar-icon-container{width:79px;position:relative;display:block;float:right}.pop-widget-item{width:196px;position:relative;display:block;overflow:hidden;float:left}.pop-widget-bar-toggle{position:fixed;width:40px;height:40px;padding:10px 30px 30px 26px;margin:0 0 30px;box-sizing:border-box;overflow:hidden;float:left;bottom:0;border-radius:50%}.pop-widget-bar-toggle .mat-icon-button{background-color:var(--bg-3)}"]
            },] }
];
PopWidgetBarComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: ['APP_GLOBAL',] }] },
    { type: undefined, decorators: [{ type: Inject, args: ['APP_WIDGETS',] }] }
];
PopWidgetBarComponent.propDecorators = {
    hidden: [{ type: HostBinding, args: ['class.sw-hidden',] }, { type: Input }],
    widgets: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXdpZGdldC1iYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYXBwL3BvcC13aWRnZXQtYmFyL3BvcC13aWRnZXQtYmFyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFDekYsT0FBTyxFQUEyQyxPQUFPLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUM3RixPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUVsRixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFRdkQsTUFBTSxPQUFPLHFCQUFzQixTQUFRLHlCQUF5QjtJQVNsRSxZQUNrQyxVQUE4QixFQUM3QixXQUFnQztRQUVqRSxLQUFLLEVBQUUsQ0FBQztRQUh3QixlQUFVLEdBQVYsVUFBVSxDQUFvQjtRQUM3QixnQkFBVyxHQUFYLFdBQVcsQ0FBcUI7UUFWMUIsV0FBTSxHQUFHLEtBQUssQ0FBQztRQUMvQyxZQUFPLEdBQVUsRUFBRSxDQUFDO1FBQ3RCLFNBQUksR0FBSSx1QkFBdUIsQ0FBQztRQUVoQyxPQUFFLEdBQUcsRUFBRSxDQUFDO1FBRUwsVUFBSyxHQUFHLEVBQUUsQ0FBQztRQVFuQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFxQixFQUFFO1lBQzFDLE9BQU8sSUFBSSxPQUFPLENBQUUsQ0FBTyxPQUFPLEVBQUcsRUFBRTtnQkFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztnQkFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztnQkFFN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBRSxDQUFFLEdBQVksRUFBRyxFQUFFO29CQUNqRixJQUFJLEdBQUc7d0JBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUMvQixDQUFDLENBQUUsQ0FBRSxDQUFDO2dCQUNOLE9BQU8sT0FBTyxDQUFFLElBQUksQ0FBRSxDQUFDO1lBQ3pCLENBQUMsQ0FBQSxDQUFFLENBQUM7UUFDTixDQUFDLENBQUM7SUFDSixDQUFDO0lBR0QsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBR00sWUFBWTtRQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDM0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQzdDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRCxXQUFXO1FBQ1QsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFTyxXQUFXO1FBQ2pCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBRSxDQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFFLFFBQVEsQ0FBRSxPQUFPLENBQUUsQ0FBRSxDQUFFLElBQUksQ0FBQyxDQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFFLENBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDMUgsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDOzs7WUFwREYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxvQkFBb0I7Z0JBQzlCLHFrQkFBOEM7O2FBRS9DOzs7NENBV0ksTUFBTSxTQUFFLFlBQVk7NENBQ3BCLE1BQU0sU0FBRSxhQUFhOzs7cUJBVnZCLFdBQVcsU0FBQyxpQkFBaUIsY0FBRyxLQUFLO3NCQUNyQyxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBIb3N0QmluZGluZywgSW5qZWN0LCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFwcEdsb2JhbEludGVyZmFjZSwgQXBwV2lkZ2V0c0ludGVyZmFjZSwgUG9wQXV0aCB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kRHluYW1pY0NvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL3BvcC1leHRlbmQtZHluYW1pYy5jb21wb25lbnQnO1xuaW1wb3J0IHsgRW50aXR5TWVudSB9IGZyb20gJy4uL3BvcC1sZWZ0LW1lbnUvZW50aXR5LW1lbnUubW9kZWwnO1xuaW1wb3J0IHsgSXNPYmplY3QgfSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3Atd2lkZ2V0LWJhcicsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3Atd2lkZ2V0LWJhci5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9wb3Atd2lkZ2V0LWJhci5jb21wb25lbnQuc2NzcycgXSxcbn0pXG5leHBvcnQgY2xhc3MgUG9wV2lkZ2V0QmFyQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kRHluYW1pY0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQEhvc3RCaW5kaW5nKCdjbGFzcy5zdy1oaWRkZW4nKSBASW5wdXQoKSBoaWRkZW4gPSBmYWxzZTtcbiAgQElucHV0KCkgd2lkZ2V0czogYW55W10gPSBbXTtcbiAgcHVibGljIG5hbWUgPSAgJ1BvcFdpZGdldEJhckNvbXBvbmVudCc7XG5cbiAgcHVibGljIHVpID0ge307XG5cbiAgcHJvdGVjdGVkIGFzc2V0ID0ge307XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdCggJ0FQUF9HTE9CQUwnICkgcHJpdmF0ZSBBUFBfR0xPQkFMOiBBcHBHbG9iYWxJbnRlcmZhY2UsXG4gICAgQEluamVjdCggJ0FQUF9XSURHRVRTJyApIHByaXZhdGUgQVBQX1dJREdFVFM6IEFwcFdpZGdldHNJbnRlcmZhY2UsXG4gICl7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggYXN5bmMoIHJlc29sdmUgKSA9PiB7XG4gICAgICAgIHRoaXMuZG9tLnN0YXRlLm9wZW4gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUuY2xvc2VkID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLmRvbS5zZXRTdWJzY3JpYmVyKCAnaW5pdCcsIHRoaXMuQVBQX0dMT0JBTC5pbml0LnN1YnNjcmliZSggKCB2YWw6IGJvb2xlYW4gKSA9PiB7XG4gICAgICAgICAgaWYoIHZhbCApIHRoaXMuX2luaXRpYWxpemUoKTtcbiAgICAgICAgfSApICk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcbiAgfVxuXG5cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICBwdWJsaWMgb25Ub2dnbGVNZW51KCk6IHZvaWR7XG4gICAgdGhpcy5kb20uc3RhdGUub3BlbiA9ICF0aGlzLmRvbS5zdGF0ZS5vcGVuO1xuICAgIHRoaXMuZG9tLnN0YXRlLmNsb3NlZCA9ICF0aGlzLmRvbS5zdGF0ZS5vcGVuO1xuICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnb25XaW5kb3dSZXNpemUnKSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuICBwcml2YXRlIF9pbml0aWFsaXplKCl7XG4gICAgdGhpcy5oaWRkZW4gPSAoICggdGhpcy5BUFBfR0xPQkFMLmlzRW50aXRpZXMoKSAmJiAhKCBJc09iamVjdCggUG9wQXV0aCApICkgKSB8fCAhKCB0aGlzLndpZGdldHMubGVuZ3RoICkgKSA/IHRydWUgOiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuIl19