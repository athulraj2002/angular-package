import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, } from '@angular/router';
import { PopTabMenuService } from './pop-tab-menu.service';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopTemplate, ServiceInjector } from '../../../pop-common.model';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopRouteHistoryResolver } from '../../../services/pop-route-history.resolver';
import { IsObjectThrowError } from '../../../pop-common-utility';
export class PopTabMenuComponent extends PopExtendComponent {
    constructor(el, route, _domRepo, _tabRepo) {
        super();
        this.el = el;
        this.route = route;
        this._domRepo = _domRepo;
        this._tabRepo = _tabRepo;
        this.name = 'PopTabMenuComponent';
        this.srv = {
            history: ServiceInjector.get(PopRouteHistoryResolver),
            router: ServiceInjector.get(Router),
            tab: undefined
        };
        /**
         * Configure the component tailored to its specific needs
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                PopTemplate.turnOffFilter();
                this.config = IsObjectThrowError(this.config, true, `${this.name}:configure: - this.config`) ? this.config : null;
                if (this.config.goBack)
                    this.config.goBack = this.srv.history.isPreviousHistory();
                this.dom.setHeight(window.innerHeight - 55, 10);
                this.log.info(`Determined height:${this.dom.height.inner}`);
                return resolve(true);
            });
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => {
                this._registerConfig().then(() => {
                    setTimeout(() => {
                        this.srv.tab.setTabScrollPosition();
                        this.srv.tab.registerOutlet(this.outletRef);
                    });
                    return resolve(true);
                });
            });
        };
    }
    /**
     * This component should have a purpose
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * Go back in history
     * @returns void
     */
    onBackButtonClick() {
        this.srv.tab.clearSession();
        this.srv.history.goBack();
    }
    /**
     * Trigger a menu click event
     * @returns void
     */
    onMenuButtonClick(button) {
        this.log.info(`${this.name}:button`, button);
        this.dom.setTimeout(`stop-loader`, null, 0);
        this.config.loading = true;
        const eventData = {
            source: this.name,
            type: 'button',
            id: button.id,
            name: button.name,
            metadata: (button.metadata ? button.metadata : false)
        };
        this.onBubbleEvent(eventData);
        this.dom.setTimeout(`stop-loader`, () => {
            this.config.loading = false;
        }, 3000);
    }
    /**
     * Trigger a tab click event
     * @returns void
     */
    onTabMenuClick(tab) {
        this.log.info(`onTabMenuClick`, tab);
        this.srv.tab.setPathSession(tab);
        const eventData = {
            source: this.name,
            type: 'tab',
            id: tab.id,
            name: tab.name,
            metadata: (tab.metadata ? tab.metadata : false)
        };
        this.onBubbleEvent(eventData);
    }
    /**
     * Event Emitter
     * @returns void
     */
    onBubbleEvent(eventData) {
        this.events.emit(eventData);
    }
    /**
     * Clean up the dom of this component
     *
     * Clear out data stored for this Tab Menu out of the global service
     */
    ngOnDestroy() {
        if (this.core && this.core.params && this.core.params.entityId)
            this.core.repo.clearCache('entity', String(this.core.params.entityId), `PopTabMenuComponent:ngOnDestroy`);
        // this.srv.tab.reset();
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    _registerConfig() {
        return new Promise((resolve) => {
            this.config = IsObjectThrowError(this.config, true, `${this.name}:registerConfig: - this.config`) ? this.srv.tab.registerConfig(this.core, this.config, this.dom.repo) : {};
            resolve(true);
        });
    }
}
PopTabMenuComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-tab-menu',
                template: "<div class=\"tab-menu-container\" [style.height.px]=\"dom.height.outer\" [ngClass]=\"{'tab-menu-loading': config.loading}\">\n  <div class=\"mat-elevation-z2\" [ngClass]=\"{'tab-menu-header': config?.goBack, 'tab-menu-header-without-back': !config?.goBack }\" >\n    <div class=\"tab-menu-nav-container\" >\n      <div class=\"tab-menu-back-container\" *ngIf=\"config.goBack\" >\n        <div id=\"back-button\" class=\"tab-menu-back-btn\"  (click)=\"onBackButtonClick();\">\n          <mat-icon>keyboard_arrow_left</mat-icon>\n          <div >Back</div>\n        </div>\n        <div *ngIf=\"config.buttons.length\" class=\"tab-menu-button-container\">\n          <button class=\"tab-menu-button\"\n                  *ngFor=\"let button of config.buttons\"\n                  [ngClass]=\"{'sw-hidden': button.hidden}\"\n                  [disabled]=\"button.disabled\"\n                  mat-raised-button\n                  (click)=\"onMenuButtonClick(button)\">\n            {{button.name}}\n          </button>\n        </div>\n      </div>\n\n    </div>\n    <div class=\"tab-menu-button-header\" >\n      <div class=\"tab-menu-label-container\">{{config.name}}</div>\n\n    </div>\n    <div class=\"tab-menu-link-container\">\n      <nav mat-tab-nav-bar>\n        <a mat-tab-link class=\"mat-body tab-menu-link\"\n           *ngFor=\"let tab of config.tabs\"\n           [routerLink]=\"tab.path\"\n           [ngClass]=\"{'active':rla.isActive}\"\n           (click)=\"onTabMenuClick(tab)\"\n           routerLinkActive #rla=\"routerLinkActive\"\n           [active]=\"rla.isActive\">\n          {{tab.name}}\n        </a>\n      </nav>\n    </div>\n  </div>\n  <div #outlet class=\"sw-target-outlet tab-menu-router-outlet-container\" [style.height.px]=\"dom.height.inner\">\n    <div class=\"tab-menu-loader\">\n      <mat-progress-bar *ngIf=\"config.loading\" mode=\"indeterminate\"></mat-progress-bar>\n    </div>\n    <router-outlet></router-outlet>\n  </div>\n</div>\n",
                styles: [".tab-menu-back-container{padding:var(--gap-xxs) var(--gap-lm) 0 var(--gap-s);display:flex;justify-content:space-between}.tab-menu-back-container mat-icon{width:22px}.tab-menu-back-container .tab-menu-back-btn{color:var(--foreground-base);font-size:14px;min-width:150px;display:flex;align-items:center;justify-content:flex-start;cursor:pointer}.tab-menu-nav-container{height:var(--gap-lm)}.tab-menu-container{position:relative;display:flex;width:auto;flex-direction:column;justify-content:stretch;box-sizing:border-box;overflow-y:hidden}.tab-menu-container .tab-menu-header{height:108px;max-height:108px;background:var(--background-main-menu)}.tab-menu-container .tab-menu-header-without-back{height:108px;max-height:108px}.tab-menu-label-container{padding:0 0 10px 30px;min-width:200px;font-size:20px;color:var(--foreground-base);flex:1 1 auto}.tab-menu-loading{opacity:.9!important;pointer-events:none!important}.tab-menu-container>div{flex:1}.tab-menu-button-header{position:relative;top:5px;display:flex;justify-content:space-between;margin:0;height:37px}.tab-menu-button-container{display:flex!important;justify-content:flex-end;align-items:center;flex:1 1 auto;position:relative;top:var(--gap-m)}.tab-menu-loader{position:absolute;height:2px;overflow:hidden;top:0;left:0;right:0;width:100%;clear:both}.tab-menu-button{margin:0 0 0 var(--gap-s)!important;min-width:100px;height:30px}.tab-menu-link-container{position:relative;top:-7px;display:block;margin:0;padding-left:var(--gap-lm)}.mat-tab-link.active{font-weight:500}.mat-tab-nav-bar{border-bottom:none}.mat-tab-link{min-width:0!important;font-weight:400;color:var(--foreground-base);padding:0 5px;margin-right:var(--gap-m);text-align:left;justify-content:left}.mat-ink-bar{position:absolute;bottom:0;height:10px;transition:.5s cubic-bezier(.35,0,.25,1)}.tab-menu-router-outlet-container{margin-top:2px;position:relative;overflow-y:auto}:host ::ng-deep .mat-raised-button{line-height:20px!important}.tab-menu-link{opacity:1}"]
            },] }
];
PopTabMenuComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: ActivatedRoute },
    { type: PopDomService },
    { type: PopTabMenuService }
];
PopTabMenuComponent.propDecorators = {
    config: [{ type: Input }],
    header: [{ type: ViewChild, args: ['header', { static: true },] }],
    outletRef: [{ type: ViewChild, args: ['outlet', { static: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXRhYi1tZW51LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLXRhYi1tZW51L3BvcC10YWItbWVudS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFFVCxLQUFLLEVBQ0wsU0FBUyxFQUNULFVBQVUsRUFFWCxNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQ0wsY0FBYyxFQUFFLE1BQU0sR0FDdkIsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUMzRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRSxPQUFPLEVBQXlCLFdBQVcsRUFBRSxlQUFlLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNoRyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDbEUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDdkYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFTakUsTUFBTSxPQUFPLG1CQUFvQixTQUFRLGtCQUFrQjtJQW1CekQsWUFDUyxFQUFjLEVBQ2IsS0FBcUIsRUFDbkIsUUFBdUIsRUFDdkIsUUFBMkI7UUFFckMsS0FBSyxFQUFFLENBQUM7UUFMRCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ2IsVUFBSyxHQUFMLEtBQUssQ0FBZ0I7UUFDbkIsYUFBUSxHQUFSLFFBQVEsQ0FBZTtRQUN2QixhQUFRLEdBQVIsUUFBUSxDQUFtQjtRQWxCaEMsU0FBSSxHQUFHLHFCQUFxQixDQUFDO1FBRTFCLFFBQUcsR0FJVDtZQUNGLE9BQU8sRUFBRSxlQUFlLENBQUMsR0FBRyxDQUFDLHVCQUF1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SSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLGlDQUFpQyxDQUFDLENBQUM7UUFDM0ssd0JBQXdCO1FBQ3hCLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBR0Q7Ozs7O3NHQUtrRztJQUsxRixlQUFlO1FBQ3JCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUM3QixJQUFJLENBQUMsTUFBTSxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksZ0NBQWdDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQW9CLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQWdCLEVBQUUsQ0FBQztZQUM3TSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOzs7WUEzSkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxrQkFBa0I7Z0JBQzVCLHU4REFBNEM7O2FBRTdDOzs7WUFuQkMsVUFBVTtZQUtWLGNBQWM7WUFLUCxhQUFhO1lBSGIsaUJBQWlCOzs7cUJBZXZCLEtBQUs7cUJBQ0wsU0FBUyxTQUFDLFFBQVEsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7d0JBQ3BDLFNBQVMsU0FBQyxRQUFRLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBPbkluaXQsXG4gIElucHV0LFxuICBWaWV3Q2hpbGQsXG4gIEVsZW1lbnRSZWYsXG4gIE9uRGVzdHJveVxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFRhYk1lbnVDb25maWcsIFRhYkJ1dHRvbkludGVyZmFjZSwgVGFiQ29uZmlnLCBUYWJNZW51SW50ZXJmYWNlIH0gZnJvbSAnLi90YWItbWVudS5tb2RlbCc7XG5pbXBvcnQge1xuICBBY3RpdmF0ZWRSb3V0ZSwgUm91dGVyLFxufSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgUG9wVGFiTWVudVNlcnZpY2UgfSBmcm9tICcuL3BvcC10YWItbWVudS5zZXJ2aWNlJztcbmltcG9ydCB7IFBvcEV4dGVuZENvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL3BvcC1leHRlbmQuY29tcG9uZW50JztcbmltcG9ydCB7IFBvcEJhc2VFdmVudEludGVyZmFjZSwgUG9wVGVtcGxhdGUsIFNlcnZpY2VJbmplY3RvciB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQgeyBQb3BSb3V0ZUhpc3RvcnlSZXNvbHZlciB9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1yb3V0ZS1oaXN0b3J5LnJlc29sdmVyJztcbmltcG9ydCB7IElzT2JqZWN0VGhyb3dFcnJvciB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC10YWItbWVudScsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3AtdGFiLW1lbnUuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLXRhYi1tZW51LmNvbXBvbmVudC5zY3NzJyBdLFxufSlcblxuZXhwb3J0IGNsYXNzIFBvcFRhYk1lbnVDb21wb25lbnQgZXh0ZW5kcyBQb3BFeHRlbmRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGNvbmZpZzogVGFiTWVudUNvbmZpZztcbiAgQFZpZXdDaGlsZCgnaGVhZGVyJywgeyBzdGF0aWM6IHRydWUgfSkgaGVhZGVyOiBFbGVtZW50UmVmO1xuICBAVmlld0NoaWxkKCdvdXRsZXQnLCB7IHN0YXRpYzogdHJ1ZSB9KSBvdXRsZXRSZWY6IEVsZW1lbnRSZWY7XG5cbiAgcHVibGljIG5hbWUgPSAnUG9wVGFiTWVudUNvbXBvbmVudCc7XG5cbiAgcHJvdGVjdGVkIHNydjoge1xuICAgIGhpc3Rvcnk6IFBvcFJvdXRlSGlzdG9yeVJlc29sdmVyLFxuICAgIHJvdXRlcjogUm91dGVyLFxuICAgIHRhYjogUG9wVGFiTWVudVNlcnZpY2VcbiAgfSA9IHtcbiAgICBoaXN0b3J5OiBTZXJ2aWNlSW5qZWN0b3IuZ2V0KFBvcFJvdXRlSGlzdG9yeVJlc29sdmVyKSxcbiAgICByb3V0ZXI6IFNlcnZpY2VJbmplY3Rvci5nZXQoUm91dGVyKSxcbiAgICB0YWI6IDxQb3BUYWJNZW51U2VydmljZT51bmRlZmluZWRcbiAgfTtcblxuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVsOiBFbGVtZW50UmVmLFxuICAgIHByaXZhdGUgcm91dGU6IEFjdGl2YXRlZFJvdXRlLFxuICAgIHByb3RlY3RlZCBfZG9tUmVwbzogUG9wRG9tU2VydmljZSxcbiAgICBwcm90ZWN0ZWQgX3RhYlJlcG86IFBvcFRhYk1lbnVTZXJ2aWNlLFxuICApe1xuICAgIHN1cGVyKCk7XG5cbiAgICAvKipcbiAgICAgKiBDb25maWd1cmUgdGhlIGNvbXBvbmVudCB0YWlsb3JlZCB0byBpdHMgc3BlY2lmaWMgbmVlZHNcbiAgICAgKi9cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgUG9wVGVtcGxhdGUudHVybk9mZkZpbHRlcigpO1xuICAgICAgICB0aGlzLmNvbmZpZyA9IElzT2JqZWN0VGhyb3dFcnJvcih0aGlzLmNvbmZpZywgdHJ1ZSwgYCR7dGhpcy5uYW1lfTpjb25maWd1cmU6IC0gdGhpcy5jb25maWdgKSA/IHRoaXMuY29uZmlnIDogbnVsbDtcbiAgICAgICAgaWYoIHRoaXMuY29uZmlnLmdvQmFjayApIHRoaXMuY29uZmlnLmdvQmFjayA9IHRoaXMuc3J2Lmhpc3RvcnkuaXNQcmV2aW91c0hpc3RvcnkoKTtcbiAgICAgICAgdGhpcy5kb20uc2V0SGVpZ2h0KHdpbmRvdy5pbm5lckhlaWdodCAtIDU1LCAxMCk7XG4gICAgICAgIHRoaXMubG9nLmluZm8oYERldGVybWluZWQgaGVpZ2h0OiR7dGhpcy5kb20uaGVpZ2h0LmlubmVyfWApO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLmRvbS5wcm9jZWVkID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyQ29uZmlnKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNydi50YWIuc2V0VGFiU2Nyb2xsUG9zaXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMuc3J2LnRhYi5yZWdpc3Rlck91dGxldCh0aGlzLm91dGxldFJlZik7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IHNob3VsZCBoYXZlIGEgcHVycG9zZVxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogR28gYmFjayBpbiBoaXN0b3J5XG4gICAqIEByZXR1cm5zIHZvaWRcbiAgICovXG4gIG9uQmFja0J1dHRvbkNsaWNrKCk6IHZvaWR7XG4gICAgdGhpcy5zcnYudGFiLmNsZWFyU2Vzc2lvbigpO1xuICAgIHRoaXMuc3J2Lmhpc3RvcnkuZ29CYWNrKCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGEgbWVudSBjbGljayBldmVudFxuICAgKiBAcmV0dXJucyB2b2lkXG4gICAqL1xuICBvbk1lbnVCdXR0b25DbGljayhidXR0b246IFRhYkJ1dHRvbkludGVyZmFjZSk6IHZvaWR7XG4gICAgdGhpcy5sb2cuaW5mbyhgJHt0aGlzLm5hbWV9OmJ1dHRvbmAsIGJ1dHRvbik7XG4gICAgdGhpcy5kb20uc2V0VGltZW91dChgc3RvcC1sb2FkZXJgLCBudWxsLCAwKVxuICAgIHRoaXMuY29uZmlnLmxvYWRpbmcgPSB0cnVlO1xuICAgIGNvbnN0IGV2ZW50RGF0YTogUG9wQmFzZUV2ZW50SW50ZXJmYWNlID0ge1xuICAgICAgc291cmNlOiB0aGlzLm5hbWUsXG4gICAgICB0eXBlOiAnYnV0dG9uJyxcbiAgICAgIGlkOiBidXR0b24uaWQsXG4gICAgICBuYW1lOiBidXR0b24ubmFtZSxcbiAgICAgIG1ldGFkYXRhOiAoIGJ1dHRvbi5tZXRhZGF0YSA/IGJ1dHRvbi5tZXRhZGF0YSA6IGZhbHNlIClcbiAgICB9O1xuICAgIHRoaXMub25CdWJibGVFdmVudChldmVudERhdGEpO1xuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoYHN0b3AtbG9hZGVyYCwgKCkgPT4ge1xuICAgICAgdGhpcy5jb25maWcubG9hZGluZyA9IGZhbHNlO1xuICAgIH0sIDMwMDApO1xuICB9XG5cblxuICAvKipcbiAgICogVHJpZ2dlciBhIHRhYiBjbGljayBldmVudFxuICAgKiBAcmV0dXJucyB2b2lkXG4gICAqL1xuICBvblRhYk1lbnVDbGljayh0YWI6IFRhYkNvbmZpZyk6IHZvaWR7XG4gICAgdGhpcy5sb2cuaW5mbyhgb25UYWJNZW51Q2xpY2tgLCB0YWIpO1xuICAgIHRoaXMuc3J2LnRhYi5zZXRQYXRoU2Vzc2lvbih0YWIpO1xuICAgIGNvbnN0IGV2ZW50RGF0YTogUG9wQmFzZUV2ZW50SW50ZXJmYWNlID0ge1xuICAgICAgc291cmNlOiB0aGlzLm5hbWUsXG4gICAgICB0eXBlOiAndGFiJyxcbiAgICAgIGlkOiB0YWIuaWQsXG4gICAgICBuYW1lOiB0YWIubmFtZSxcbiAgICAgIG1ldGFkYXRhOiAoIHRhYi5tZXRhZGF0YSA/IHRhYi5tZXRhZGF0YSA6IGZhbHNlIClcbiAgICB9O1xuICAgIHRoaXMub25CdWJibGVFdmVudChldmVudERhdGEpO1xuICB9XG5cblxuICAvKipcbiAgICogRXZlbnQgRW1pdHRlclxuICAgKiBAcmV0dXJucyB2b2lkXG4gICAqL1xuICBvbkJ1YmJsZUV2ZW50KGV2ZW50RGF0YTogUG9wQmFzZUV2ZW50SW50ZXJmYWNlKTogdm9pZHtcbiAgICB0aGlzLmV2ZW50cy5lbWl0KGV2ZW50RGF0YSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDbGVhbiB1cCB0aGUgZG9tIG9mIHRoaXMgY29tcG9uZW50XG4gICAqXG4gICAqIENsZWFyIG91dCBkYXRhIHN0b3JlZCBmb3IgdGhpcyBUYWIgTWVudSBvdXQgb2YgdGhlIGdsb2JhbCBzZXJ2aWNlXG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIGlmKCB0aGlzLmNvcmUgJiYgdGhpcy5jb3JlLnBhcmFtcyAmJiB0aGlzLmNvcmUucGFyYW1zLmVudGl0eUlkICkgdGhpcy5jb3JlLnJlcG8uY2xlYXJDYWNoZSgnZW50aXR5JywgU3RyaW5nKHRoaXMuY29yZS5wYXJhbXMuZW50aXR5SWQpLCBgUG9wVGFiTWVudUNvbXBvbmVudDpuZ09uRGVzdHJveWApO1xuICAgIC8vIHRoaXMuc3J2LnRhYi5yZXNldCgpO1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cblxuXG4gIHByaXZhdGUgX3JlZ2lzdGVyQ29uZmlnKCk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICB0aGlzLmNvbmZpZyA9IElzT2JqZWN0VGhyb3dFcnJvcih0aGlzLmNvbmZpZywgdHJ1ZSwgYCR7dGhpcy5uYW1lfTpyZWdpc3RlckNvbmZpZzogLSB0aGlzLmNvbmZpZ2ApID8gdGhpcy5zcnYudGFiLnJlZ2lzdGVyQ29uZmlnKHRoaXMuY29yZSwgPFRhYk1lbnVJbnRlcmZhY2U+dGhpcy5jb25maWcsIHRoaXMuZG9tLnJlcG8pIDogPFRhYk1lbnVDb25maWc+e307XG4gICAgICByZXNvbHZlKHRydWUpO1xuICAgIH0pO1xuICB9XG5cblxufVxuIl19