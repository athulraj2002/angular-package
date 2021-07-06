import { Component, ElementRef, isDevMode } from '@angular/core';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PopMessage, PopTemplate, ServiceInjector, SetPopMessage } from '../../../../pop-common.model';
import { PopDomService } from '../../../../services/pop-dom.service';
export class PopErrorRedirectComponent extends PopExtendComponent {
    constructor(el, _domRepo, route) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this.route = route;
        this.name = 'PopErrorRedirectComponent';
        this.srv = {
            router: ServiceInjector.get(Router),
        };
        this.ui = {
            code: undefined,
            message: undefined
        };
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.dom.state.isDevMode = isDevMode();
                this.dom.setHeight(PopTemplate.getContentHeight(), 120);
                this._setRoute();
                resolve(true);
            });
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
        SetPopMessage(null);
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    _setRoute() {
        this.ui.code = this.route.snapshot.params.code || 404;
        this.ui.message = PopMessage;
    }
}
PopErrorRedirectComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-error-redirect',
                template: "<div *ngIf=\"dom.state.isDevMode\" class=\"pop-error-redirect-container  import-flex-row import-item-full import-flex-center\" [style.height.px]=\"dom.height.outer\">\n  <div class=\"import-flex-item-md import-flex-center site-pad-xxl import-flex-grow-xs\" [style.height.px]=\"dom.height.inner\">\n    <h1>{{ui.code}}</h1>\n  </div>\n  <div *ngIf=\"ui.message\" class=\"import-flex-item-md import-flex-center site-pad-xxl\" [style.height.px]=\"dom.height.inner\">\n    <p>{{ui.message}}</p>\n  </div>\n\n</div>\n<div *ngIf=\"!dom.state.isDevMode\" class=\"error-container\">\n  <div class=\"error-wrapper\">\n    <svg  height=\"100px\" viewBox=\"0 0 24 24\" width=\"100px\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z\"/></svg>\n    <h1 class=\"pop-error-main-text\">Oops!\n    </h1>\n    <h1>{{ui.message}}</h1>\n  </div>\n\n</div>\n",
                styles: [".pop-error-redirect-container h1{font-size:100px;color:var(--error)}.error-container{color:var(--text-2);height:calc(100vh - 60px);width:100%}.error-container,.error-container .error-wrapper{display:flex;align-items:center;flex-direction:column;justify-content:center}.error-container .error-wrapper svg{fill:var(--text-2)}.error-container .error-wrapper mat-icon{font-size:5rem}.error-container .error-wrapper h1{margin:0}.error-container .error-wrapper .pop-error-main-text{font-size:4rem;margin:var(--mar-md) 0}"]
            },] }
];
PopErrorRedirectComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: ActivatedRoute }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVycm9yLXJlZGlyZWN0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLXJlZGlyZWN0cy9wb3AtZXJyb3ItcmVkaXJlY3QvcG9wLWVycm9yLXJlZGlyZWN0LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQXFCLE1BQU0sZUFBZSxDQUFDO0FBQ3BGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ3RFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDekQsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ3ZHLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQU9yRSxNQUFNLE9BQU8seUJBQTBCLFNBQVEsa0JBQWtCO0lBYS9ELFlBQ1MsRUFBYyxFQUNYLFFBQXVCLEVBQ3pCLEtBQXFCO1FBRTdCLEtBQUssRUFBRSxDQUFDO1FBSkQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUNYLGFBQVEsR0FBUixRQUFRLENBQWU7UUFDekIsVUFBSyxHQUFMLEtBQUssQ0FBZ0I7UUFmeEIsU0FBSSxHQUFHLDJCQUEyQixDQUFDO1FBRWhDLFFBQUcsR0FBRztZQUNkLE1BQU0sRUFBVSxlQUFlLENBQUMsR0FBRyxDQUFFLE1BQU0sQ0FBRTtTQUM5QyxDQUFDO1FBRUssT0FBRSxHQUFHO1lBQ1YsSUFBSSxFQUFVLFNBQVM7WUFDdkIsT0FBTyxFQUFVLFNBQVM7U0FDM0IsQ0FBQztRQVVBOztXQUVHO1FBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBcUIsRUFBRTtZQUMxQyxPQUFPLElBQUksT0FBTyxDQUFFLENBQUUsT0FBTyxFQUFHLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLEVBQUUsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3hELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDakIsT0FBTyxDQUFFLElBQUksQ0FBRSxDQUFDO1lBQ2xCLENBQUMsQ0FBRSxDQUFDO1FBQ04sQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUdEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUVuQixDQUFDO0lBR0Q7O09BRUc7SUFDSCxXQUFXO1FBQ1QsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRUQ7Ozs7O3NHQUtrRztJQUUxRixTQUFTO1FBQ2YsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUM7UUFDdEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDO0lBQy9CLENBQUM7OztZQWxFRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHdCQUF3QjtnQkFDbEMsNjRCQUFrRDs7YUFFbkQ7OztZQVZtQixVQUFVO1lBSXJCLGFBQWE7WUFGYixjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBpc0Rldk1vZGUsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBQb3BFeHRlbmRDb21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtZXh0ZW5kLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBBY3RpdmF0ZWRSb3V0ZSwgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IFBvcE1lc3NhZ2UsIFBvcFRlbXBsYXRlLCBTZXJ2aWNlSW5qZWN0b3IsIFNldFBvcE1lc3NhZ2UgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFBvcERvbVNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtZG9tLnNlcnZpY2UnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWVycm9yLXJlZGlyZWN0JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lcnJvci1yZWRpcmVjdC5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3BvcC1lcnJvci1yZWRpcmVjdC5jb21wb25lbnQuc2NzcyddXG59KVxuZXhwb3J0IGNsYXNzIFBvcEVycm9yUmVkaXJlY3RDb21wb25lbnQgZXh0ZW5kcyBQb3BFeHRlbmRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIHB1YmxpYyBuYW1lID0gJ1BvcEVycm9yUmVkaXJlY3RDb21wb25lbnQnO1xuXG4gIHByb3RlY3RlZCBzcnYgPSB7XG4gICAgcm91dGVyOiA8Um91dGVyPlNlcnZpY2VJbmplY3Rvci5nZXQoIFJvdXRlciApLFxuICB9O1xuXG4gIHB1YmxpYyB1aSA9IHtcbiAgICBjb2RlOiA8bnVtYmVyPnVuZGVmaW5lZCxcbiAgICBtZXNzYWdlOiA8c3RyaW5nPnVuZGVmaW5lZFxuICB9O1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVsOiBFbGVtZW50UmVmLFxuICAgIHByb3RlY3RlZCBfZG9tUmVwbzogUG9wRG9tU2VydmljZSxcbiAgICBwcml2YXRlIHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZVxuICApe1xuICAgIHN1cGVyKCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHNob3VsZCB0cmFuc2Zvcm0gYW5kIHZhbGlkYXRlIHRoZSBkYXRhLiBUaGUgdmlldyBzaG91bGQgdHJ5IHRvIG9ubHkgdXNlIGRhdGEgdGhhdCBpcyBzdG9yZWQgb24gdWkgc28gdGhhdCBpdCBpcyBub3QgZGVwZW5kZW50IG9uIHRoZSBzdHJ1Y3R1cmUgb2YgZGF0YSB0aGF0IGNvbWVzIGZyb20gb3RoZXIgc291cmNlcy4gVGhlIHVpIHNob3VsZCBiZSB0aGUgc291cmNlIG9mIHRydXRoIGhlcmUuXG4gICAgICovXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUgKSA9PiB7XG4gICAgICAgIHRoaXMuZG9tLnN0YXRlLmlzRGV2TW9kZSA9IGlzRGV2TW9kZSgpO1xuICAgICAgICB0aGlzLmRvbS5zZXRIZWlnaHQoUG9wVGVtcGxhdGUuZ2V0Q29udGVudEhlaWdodCgpLCAxMjApO1xuICAgICAgICB0aGlzLl9zZXRSb3V0ZSgpO1xuICAgICAgICByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IHNob3VsZCBoYXZlIGEgc3BlY2lmaWMgcHVycG9zZVxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICAgIFxuICB9XG5cblxuICAvKipcbiAgICogVGhlIGRvbSBkZXN0cm95IGZ1bmN0aW9uIG1hbmFnZXMgYWxsIHRoZSBjbGVhbiB1cCB0aGF0IGlzIG5lY2Vzc2FyeSBpZiBzdWJzY3JpcHRpb25zLCB0aW1lb3V0cywgZXRjIGFyZSBzdG9yZWQgcHJvcGVybHlcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgU2V0UG9wTWVzc2FnZShudWxsKTtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgcHJpdmF0ZSBfc2V0Um91dGUoKXtcbiAgICB0aGlzLnVpLmNvZGUgPSB0aGlzLnJvdXRlLnNuYXBzaG90LnBhcmFtcy5jb2RlIHx8IDQwNDtcbiAgICB0aGlzLnVpLm1lc3NhZ2UgPSBQb3BNZXNzYWdlO1xuICB9XG5cbn1cbiJdfQ==