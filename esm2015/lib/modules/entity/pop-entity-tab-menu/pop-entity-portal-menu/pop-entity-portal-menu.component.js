import { __awaiter } from "tslib";
import { Component, ElementRef, Input, ViewChild, } from '@angular/core';
import { CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal';
import { PopEntity, ServiceInjector } from '../../../../pop-common.model';
import { PopEntityTabComponent } from '../../pop-entity-tab/pop-entity-tab.component';
import { PopTabMenuService } from '../../../base/pop-tab-menu/pop-tab-menu.service';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { IsArray, IsObjectThrowError } from '../../../../pop-common-utility';
import { PopEntityEventService } from '../../services/pop-entity-event.service';
import { IsValidCoreSignature, IsValidFieldPatchEvent } from '../../pop-entity-utility';
export class PopEntityPortalMenuComponent extends PopExtendComponent {
    constructor(el, _domRepo, _tabRepo) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this._tabRepo = _tabRepo;
        this.name = 'PopTabMenuComponent';
        this.srv = {
            crud: ServiceInjector.get(PopEntityEventService),
            tab: undefined
        };
        this.id = 2;
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                // set the outer height boundary
                yield this.dom.setHeightWithParent('cdk-overlay-pane', 100, window.innerHeight - 180);
                // #1: Enforce a CoreConfig
                this.core = IsObjectThrowError(this.core, true, `${this.name}:configureDom: - this.core`) ? this.core : null;
                // #2: Enforce a TabMenuConfig
                this.config = IsObjectThrowError(this.config, true, `${this.name}:configureDom: - this.core`) ? this.config : {};
                yield PopEntity.setCoreDomAssets(this.core, this.dom.repo);
                // #3: Register the outlet with the tabRepo, gives the tabRepo the ability to reset the view if needed
                this.srv.tab.registerOutlet(this.outlet);
                // #4: Preset a default tab so the view will have something to render
                if (IsArray(this.config.tabs, true))
                    this.onSetPortal(this.config.tabs[0]);
                this.dom.setSubscriber('events', this.srv.crud.events.subscribe((event) => {
                    if (IsValidCoreSignature(this.core, event)) {
                        if (IsValidFieldPatchEvent(this.core, event)) {
                            if (event.config.name === 'name' || event.config.name === 'label') {
                                this.config.name = (event.config.control.value);
                            }
                        }
                    }
                }));
                return resolve(true);
            }));
        };
    }
    /**
     * Setup this component
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * Trigger a portal tab click event
     * @returns void
     */
    onMenuClick(tab) {
        this.onSetPortal(tab);
        this.onBubbleEvent({
            source: this.name,
            type: 'menu',
            id: tab.id,
            name: tab.name,
        });
    }
    /**
     * Whenever a user click on tab av button, the portal needs reset to that tab
     * Has specific render so does not use the built-in render intentionally
     * @param tab
     */
    onSetPortal(tab) {
        if (this.log.repo.enabled('config', this.name))
            console.log(this.log.repo.message(`${this.name}:setPortal:tab`), this.log.repo.color('config'), tab);
        if (tab && tab.id) {
            if (this.portal && this.portal.attachedRef)
                this.portal.detach();
            this.dom.state.tab = tab;
            Object.keys(this.dom.subscriber).map((name) => {
                if (this.dom.subscriber[name]) {
                    this.dom.subscriber[name].unsubscribe();
                }
            });
            const componentRef = this.portal.attach(new ComponentPortal(PopEntityTabComponent));
            componentRef.instance['core'] = this.core;
            componentRef.instance.tab = tab;
            componentRef.changeDetectorRef.detectChanges();
            if (componentRef.instance['events']) {
                this.dom.setSubscriber('portal', componentRef.instance['events'].subscribe((event) => {
                    this.onBubbleEvent(event);
                }));
            }
        }
    }
    /**
     * Trigger a button click event
     * @returns void
     */
    onButtonClick(button) {
        this.onBubbleEvent({
            source: this.name,
            type: 'button',
            id: button.id,
            name: button.name,
        });
    }
    /**
     * This will bubble a event up to a parent component
     * @param event
     */
    onBubbleEvent(event) {
        this.events.emit(event);
    }
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy() {
        super.ngOnDestroy();
        this.portal.detach();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    _onCrudEvent(event) {
    }
}
PopEntityPortalMenuComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-portal-menu',
                template: "<div class=\"portal-menu-container\" [style.height.px]=dom.height.outer>\n  <div class=\"portal-menu-header mat-elevation-z2\">\n    <div class=\"host-name-button-container\">\n      <div class=\"host-label-container\">{{config.name}}</div>\n      <div *ngIf=\"config.buttons?.length\" class=\"host-button-container\">\n        <button class=\"host-button\"\n                *ngFor=\"let button of config.buttons\"\n                [ngClass]=\"{'sw-hidden': button.hidden}\"\n                [disabled]=\"button.disabled\"\n                mat-raised-button\n                (click)=\"onButtonClick(button)\">\n          {{button.name}}\n        </button>\n      </div>\n    </div>\n    <div class=\"host-link-container\">\n      <nav mat-tab-nav-bar>\n        <a mat-tab-link\n           *ngFor=\"let tab of config?.tabs\"\n           [ngClass]=\"{'active':dom.state.tab?.id === tab.id}\"\n           (click)=\"onMenuClick(tab)\"\n           [active]=\"dom.state.tab?.id === tab.id\">\n          {{tab.name}}\n        </a>\n      </nav>\n    </div>\n  </div>\n  <div #outlet class=\"sw-target-outlet portal-outlet-container\" [style.height.px]=dom.height.inner>\n    <ng-template [cdkPortalOutlet]></ng-template>\n  </div>\n</div>\n",
                providers: [PopTabMenuService, PopDomService],
                styles: [".portal-menu-container{display:flex;width:100%;flex-direction:column;justify-content:stretch}.portal-menu-container .portal-menu-header{padding-top:30px;min-height:70px;max-height:70px}.portal-menu-container>div{flex:1;overflow:auto}.host-header{overflow:hidden}.host-back-container{display:inline-flex!important;padding:6px 0 0 8px;justify-content:flex-start;align-items:center;cursor:pointer}.host-back-container mat-icon{width:22px}.host-name-button-container{display:flex;justify-content:space-between;margin:0}.host-label-container{padding:0 0 10px 30px;position:relative;min-width:200px;font-size:24px;flex:1 1 auto}.host-button-container{display:flex!important;justify-content:flex-end;align-items:center;flex:1 1 auto;margin-right:30px}.host-button{margin-left:10px;min-width:100px}.host-link-container{position:relative;display:block;margin:0;padding:3px 30px 0 25px}.portal-outlet-container{overflow:hidden}.mat-tab-link.active{font-weight:500}.mat-tab-nav-bar{border-bottom:none}.mat-tab-link{height:30px!important;min-width:50px!important;font-weight:400;font-size:16px;color:var(--text);padding:0 5px 16px;margin-right:30px!important}"]
            },] }
];
PopEntityPortalMenuComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: PopTabMenuService }
];
PopEntityPortalMenuComponent.propDecorators = {
    config: [{ type: Input }],
    outlet: [{ type: ViewChild, args: ['outlet', { static: true },] }],
    portal: [{ type: ViewChild, args: [CdkPortalOutlet, { static: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1wb3J0YWwtbWVudS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS10YWItbWVudS9wb3AtZW50aXR5LXBvcnRhbC1tZW51L3BvcC1lbnRpdHktcG9ydGFsLW1lbnUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUFFLFVBQVUsRUFDckIsS0FBSyxFQUdMLFNBQVMsR0FDVixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3ZFLE9BQU8sRUFBeUIsU0FBUyxFQUFFLGVBQWUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRWpHLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBQ3RGLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlEQUFpRCxDQUFDO0FBQ3BGLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDN0UsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDaEYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLHNCQUFzQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFTeEYsTUFBTSxPQUFPLDRCQUE2QixTQUFRLGtCQUFrQjtJQWlCbEUsWUFDUyxFQUFjLEVBQ1gsUUFBdUIsRUFDdkIsUUFBMkI7UUFFckMsS0FBSyxFQUFFLENBQUM7UUFKRCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ1gsYUFB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QVEsRUFBRSw0QkFBNEI7Z0JBQ3RDLDZ0Q0FBc0Q7Z0JBRXRELFNBQVMsRUFBRSxDQUFFLGlCQUFpQixFQUFFLGFBQWEsQ0FBRTs7YUFDaEQ7OztZQXZCWSxVQUFVO1lBV2QsYUFBYTtZQURiLGlCQUFpQjs7O3FCQWV2QixLQUFLO3FCQUNMLFNBQVMsU0FBRSxRQUFRLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO3FCQUNyQyxTQUFTLFNBQUUsZUFBZSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBvbmVudCwgRWxlbWVudFJlZixcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBWaWV3Q2hpbGQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ2RrUG9ydGFsT3V0bGV0LCBDb21wb25lbnRQb3J0YWwgfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7IFBvcEJhc2VFdmVudEludGVyZmFjZSwgUG9wRW50aXR5LCBTZXJ2aWNlSW5qZWN0b3IgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFRhYkJ1dHRvbkludGVyZmFjZSwgVGFiQ29uZmlnLCBUYWJNZW51Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vYmFzZS9wb3AtdGFiLW1lbnUvdGFiLW1lbnUubW9kZWwnO1xuaW1wb3J0IHsgUG9wRW50aXR5VGFiQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vcG9wLWVudGl0eS10YWIvcG9wLWVudGl0eS10YWIuY29tcG9uZW50JztcbmltcG9ydCB7IFBvcFRhYk1lbnVTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vYmFzZS9wb3AtdGFiLW1lbnUvcG9wLXRhYi1tZW51LnNlcnZpY2UnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQgeyBQb3BFeHRlbmRDb21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtZXh0ZW5kLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBJc0FycmF5LCBJc09iamVjdFRocm93RXJyb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHsgUG9wRW50aXR5RXZlbnRTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvcG9wLWVudGl0eS1ldmVudC5zZXJ2aWNlJztcbmltcG9ydCB7IElzVmFsaWRDb3JlU2lnbmF0dXJlLCBJc1ZhbGlkRmllbGRQYXRjaEV2ZW50IH0gZnJvbSAnLi4vLi4vcG9wLWVudGl0eS11dGlsaXR5JztcblxuXG5AQ29tcG9uZW50KCB7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC1lbnRpdHktcG9ydGFsLW1lbnUnLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLWVudGl0eS1wb3J0YWwtbWVudS5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9wb3AtZW50aXR5LXBvcnRhbC1tZW51LmNvbXBvbmVudC5zY3NzJyBdLFxuICBwcm92aWRlcnM6IFsgUG9wVGFiTWVudVNlcnZpY2UsIFBvcERvbVNlcnZpY2UgXSxcbn0gKVxuZXhwb3J0IGNsYXNzIFBvcEVudGl0eVBvcnRhbE1lbnVDb21wb25lbnQgZXh0ZW5kcyBQb3BFeHRlbmRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGNvbmZpZzogVGFiTWVudUNvbmZpZztcbiAgQFZpZXdDaGlsZCggJ291dGxldCcsIHsgc3RhdGljOiB0cnVlIH0gKSBvdXRsZXQ6IEVsZW1lbnRSZWY7XG4gIEBWaWV3Q2hpbGQoIENka1BvcnRhbE91dGxldCwgeyBzdGF0aWM6IHRydWUgfSApIHBvcnRhbDogQ2RrUG9ydGFsT3V0bGV0O1xuXG4gIHB1YmxpYyBuYW1lID0gJ1BvcFRhYk1lbnVDb21wb25lbnQnO1xuXG5cbiAgcHJvdGVjdGVkIHNydjoge1xuICAgIGNydWQ6IFBvcEVudGl0eUV2ZW50U2VydmljZSxcbiAgICB0YWI6IFBvcFRhYk1lbnVTZXJ2aWNlLFxuICB9ID0ge1xuICAgIGNydWQ6IFNlcnZpY2VJbmplY3Rvci5nZXQoIFBvcEVudGl0eUV2ZW50U2VydmljZSApLFxuICAgIHRhYjogPFBvcFRhYk1lbnVTZXJ2aWNlPnVuZGVmaW5lZFxuICB9O1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVsOiBFbGVtZW50UmVmLFxuICAgIHByb3RlY3RlZCBfZG9tUmVwbzogUG9wRG9tU2VydmljZSxcbiAgICBwcm90ZWN0ZWQgX3RhYlJlcG86IFBvcFRhYk1lbnVTZXJ2aWNlXG4gICl7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuaWQgPSAyO1xuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggYXN5bmMoIHJlc29sdmUgKSA9PiB7XG4gICAgICAgIC8vIHNldCB0aGUgb3V0ZXIgaGVpZ2h0IGJvdW5kYXJ5XG4gICAgICAgIGF3YWl0IHRoaXMuZG9tLnNldEhlaWdodFdpdGhQYXJlbnQoICdjZGstb3ZlcmxheS1wYW5lJywgMTAwLCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAxODAgKTtcbiAgICAgICAgLy8gIzE6IEVuZm9yY2UgYSBDb3JlQ29uZmlnXG4gICAgICAgIHRoaXMuY29yZSA9IElzT2JqZWN0VGhyb3dFcnJvciggdGhpcy5jb3JlLCB0cnVlLCBgJHt0aGlzLm5hbWV9OmNvbmZpZ3VyZURvbTogLSB0aGlzLmNvcmVgICkgPyB0aGlzLmNvcmUgOiBudWxsO1xuICAgICAgICAvLyAjMjogRW5mb3JjZSBhIFRhYk1lbnVDb25maWdcbiAgICAgICAgdGhpcy5jb25maWcgPSBJc09iamVjdFRocm93RXJyb3IoIHRoaXMuY29uZmlnLCB0cnVlLCBgJHt0aGlzLm5hbWV9OmNvbmZpZ3VyZURvbTogLSB0aGlzLmNvcmVgICkgPyB0aGlzLmNvbmZpZyA6IDxUYWJNZW51Q29uZmlnPnt9O1xuICAgICAgICBhd2FpdCBQb3BFbnRpdHkuc2V0Q29yZURvbUFzc2V0cyggdGhpcy5jb3JlLCB0aGlzLmRvbS5yZXBvICk7XG4gICAgICAgIC8vICMzOiBSZWdpc3RlciB0aGUgb3V0bGV0IHdpdGggdGhlIHRhYlJlcG8sIGdpdmVzIHRoZSB0YWJSZXBvIHRoZSBhYmlsaXR5IHRvIHJlc2V0IHRoZSB2aWV3IGlmIG5lZWRlZFxuICAgICAgICB0aGlzLnNydi50YWIucmVnaXN0ZXJPdXRsZXQoIDxFbGVtZW50UmVmPnRoaXMub3V0bGV0ICk7XG4gICAgICAgIC8vICM0OiBQcmVzZXQgYSBkZWZhdWx0IHRhYiBzbyB0aGUgdmlldyB3aWxsIGhhdmUgc29tZXRoaW5nIHRvIHJlbmRlclxuICAgICAgICBpZiggSXNBcnJheSggdGhpcy5jb25maWcudGFicywgdHJ1ZSApICkgdGhpcy5vblNldFBvcnRhbCggdGhpcy5jb25maWcudGFic1sgMCBdICk7XG5cbiAgICAgICAgdGhpcy5kb20uc2V0U3Vic2NyaWJlciggJ2V2ZW50cycsIHRoaXMuc3J2LmNydWQuZXZlbnRzLnN1YnNjcmliZSggKCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICkgPT4ge1xuICAgICAgICAgIGlmKCBJc1ZhbGlkQ29yZVNpZ25hdHVyZSggdGhpcy5jb3JlLCBldmVudCApICl7XG4gICAgICAgICAgICBpZihJc1ZhbGlkRmllbGRQYXRjaEV2ZW50KHRoaXMuY29yZSwgZXZlbnQpKXtcbiAgICAgICAgICAgICAgaWYoIGV2ZW50LmNvbmZpZy5uYW1lID09PSAnbmFtZScgfHwgZXZlbnQuY29uZmlnLm5hbWUgPT09ICdsYWJlbCcgKXtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5uYW1lID0gKCBldmVudC5jb25maWcuY29udHJvbC52YWx1ZSApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9ICkgKTtcblxuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZXR1cCB0aGlzIGNvbXBvbmVudFxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogVHJpZ2dlciBhIHBvcnRhbCB0YWIgY2xpY2sgZXZlbnRcbiAgICogQHJldHVybnMgdm9pZFxuICAgKi9cbiAgb25NZW51Q2xpY2soIHRhYjogVGFiQ29uZmlnICk6IHZvaWR7XG4gICAgdGhpcy5vblNldFBvcnRhbCggdGFiICk7XG4gICAgdGhpcy5vbkJ1YmJsZUV2ZW50KCB7XG4gICAgICBzb3VyY2U6IHRoaXMubmFtZSxcbiAgICAgIHR5cGU6ICdtZW51JyxcbiAgICAgIGlkOiB0YWIuaWQsXG4gICAgICBuYW1lOiB0YWIubmFtZSxcbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBXaGVuZXZlciBhIHVzZXIgY2xpY2sgb24gdGFiIGF2IGJ1dHRvbiwgdGhlIHBvcnRhbCBuZWVkcyByZXNldCB0byB0aGF0IHRhYlxuICAgKiBIYXMgc3BlY2lmaWMgcmVuZGVyIHNvIGRvZXMgbm90IHVzZSB0aGUgYnVpbHQtaW4gcmVuZGVyIGludGVudGlvbmFsbHlcbiAgICogQHBhcmFtIHRhYlxuICAgKi9cbiAgb25TZXRQb3J0YWwoIHRhYjogVGFiQ29uZmlnICl7XG4gICAgaWYoIHRoaXMubG9nLnJlcG8uZW5hYmxlZCggJ2NvbmZpZycsIHRoaXMubmFtZSApICkgY29uc29sZS5sb2coIHRoaXMubG9nLnJlcG8ubWVzc2FnZSggYCR7dGhpcy5uYW1lfTpzZXRQb3J0YWw6dGFiYCApLCB0aGlzLmxvZy5yZXBvLmNvbG9yKCAnY29uZmlnJyApLCB0YWIgKTtcbiAgICBpZiggdGFiICYmIHRhYi5pZCApe1xuICAgICAgaWYoIHRoaXMucG9ydGFsICYmIHRoaXMucG9ydGFsLmF0dGFjaGVkUmVmICkgdGhpcy5wb3J0YWwuZGV0YWNoKCk7XG4gICAgICB0aGlzLmRvbS5zdGF0ZS50YWIgPSB0YWI7XG4gICAgICBPYmplY3Qua2V5cyggdGhpcy5kb20uc3Vic2NyaWJlciApLm1hcCggKCBuYW1lICkgPT4ge1xuICAgICAgICBpZiggdGhpcy5kb20uc3Vic2NyaWJlclsgbmFtZSBdICl7XG4gICAgICAgICAgdGhpcy5kb20uc3Vic2NyaWJlclsgbmFtZSBdLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICAgIGNvbnN0IGNvbXBvbmVudFJlZiA9IHRoaXMucG9ydGFsLmF0dGFjaCggbmV3IENvbXBvbmVudFBvcnRhbCggUG9wRW50aXR5VGFiQ29tcG9uZW50ICkgKTtcbiAgICAgIGNvbXBvbmVudFJlZi5pbnN0YW5jZVsgJ2NvcmUnIF0gPSB0aGlzLmNvcmU7XG4gICAgICBjb21wb25lbnRSZWYuaW5zdGFuY2UudGFiID0gdGFiO1xuICAgICAgY29tcG9uZW50UmVmLmNoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcblxuICAgICAgaWYoIGNvbXBvbmVudFJlZi5pbnN0YW5jZVsgJ2V2ZW50cycgXSApe1xuICAgICAgICB0aGlzLmRvbS5zZXRTdWJzY3JpYmVyKCAncG9ydGFsJywgY29tcG9uZW50UmVmLmluc3RhbmNlWyAnZXZlbnRzJyBdLnN1YnNjcmliZSggKCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICkgPT4ge1xuICAgICAgICAgIHRoaXMub25CdWJibGVFdmVudCggZXZlbnQgKTtcbiAgICAgICAgfSApICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVHJpZ2dlciBhIGJ1dHRvbiBjbGljayBldmVudFxuICAgKiBAcmV0dXJucyB2b2lkXG4gICAqL1xuICBvbkJ1dHRvbkNsaWNrKCBidXR0b246IFRhYkJ1dHRvbkludGVyZmFjZSApOiB2b2lke1xuICAgIHRoaXMub25CdWJibGVFdmVudCgge1xuICAgICAgc291cmNlOiB0aGlzLm5hbWUsXG4gICAgICB0eXBlOiAnYnV0dG9uJyxcbiAgICAgIGlkOiBidXR0b24uaWQsXG4gICAgICBuYW1lOiBidXR0b24ubmFtZSxcbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgYnViYmxlIGEgZXZlbnQgdXAgdG8gYSBwYXJlbnQgY29tcG9uZW50XG4gICAqIEBwYXJhbSBldmVudFxuICAgKi9cbiAgb25CdWJibGVFdmVudCggZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSApe1xuICAgIHRoaXMuZXZlbnRzLmVtaXQoIGV2ZW50ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDbGVhbiB1cCB0aGUgZG9tIG9mIHRoaXMgY29tcG9uZW50XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gICAgdGhpcy5wb3J0YWwuZGV0YWNoKCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIHByaXZhdGUgX29uQ3J1ZEV2ZW50KGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2Upe1xuXG4gIH1cbn1cbiJdfQ==