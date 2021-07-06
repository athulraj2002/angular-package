import { __awaiter } from "tslib";
import { Component, ElementRef, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ServiceInjector } from '../../../../pop-common.model';
import { PopExtendDynamicComponent } from '../../../../pop-extend-dynamic.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopTabMenuService } from '../pop-tab-menu.service';
import { PopTabMenuSectionBarService } from './pop-tab-menu-section-bar.service';
import { ArrayMapSetter, IsArray } from '../../../../pop-common-utility';
export class PopTabMenuSectionBarComponent extends PopExtendDynamicComponent {
    constructor(el, _domRepo, _routeRepo, _tabRepo) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this._routeRepo = _routeRepo;
        this._tabRepo = _tabRepo;
        this.overflow = false;
        this.name = 'PopTabMenuSectionBarComponent';
        this.srv = {
            location: ServiceInjector.get(Location),
            router: ServiceInjector.get(Router),
            route: undefined,
            section: ServiceInjector.get(PopTabMenuSectionBarService),
            tab: undefined
        };
        this.ui = {};
        this.asset = {
            tab: undefined,
            baseUrl: undefined,
            urlSection: undefined,
            map: {}
        };
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                yield this._setCore();
                yield this._setRoute();
                yield this._setSections();
                yield this._setHeight();
                yield this._attachContainer();
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
     * This will load the comonent of the selected section into the view container
     * @param section
     */
    onViewSection(section) {
        this.dom.active.section = section.id;
        this.srv.section.setSectionSession('profile', section.id);
        this.srv.location.go(this.asset.baseUrl + '?section=' + section.id);
        this.dom.setTimeout(`view-section`, () => {
            this.template.render([{
                    type: section.component,
                    inputs: section.inputs,
                    position: this.position,
                }]);
        }, 0);
    }
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Protected Method )                                      *
     *                                                                                              *
     ************************************************************************************************/
    _setCore() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            return resolve(true);
        }));
    }
    _setRoute() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const url = String(this.srv.router.url).split('?')[0];
            const slugs = url.split('/');
            this.asset.baseUrl = slugs.join('/');
            if (this.srv.section.getPathSession(this.core.params.internal_name))
                this.asset.urlSection = this.srv.section.getPathSession(this.core.params.internal_name);
            this.dom.setSubscriber('query-params', this.srv.route.queryParams.subscribe(params => {
                if (params.section)
                    this.asset.urlSection = params.section;
            }));
            return resolve(true);
        }));
    }
    _setSections() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.asset.tab = this.srv.tab.getTab();
            this.dom.active.section = undefined;
            if (!this.sections && this.asset.tab.sections) {
                this.sections = this.asset.tab.sections;
            }
            this.asset.map.sections = ArrayMapSetter(this.sections, 'id');
            return resolve(true);
        }));
    }
    _setHeight() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const defaultHeight = window.innerHeight - 230;
            this.dom.setHeight(defaultHeight, 60);
            return resolve(true);
        }));
    }
    _attachContainer() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.template.attach('container');
            if (IsArray(this.sections, true)) {
                if (this.asset.urlSection in this.asset.map.sections) {
                    this.onViewSection(this.sections[this.asset.map.sections[this.asset.urlSection]]);
                }
                else {
                    this.onViewSection(this.sections[0]);
                }
            }
            return resolve(true);
        }));
    }
}
PopTabMenuSectionBarComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-tab-section-bar',
                template: "<div class=\"pop-entity-tab-section-bar-header\">\n  <nav mat-tab-nav-bar>\n    <a mat-tab-link\n       *ngFor=\"let section of sections\"\n       (click)=\"onViewSection(section)\"\n       [active]=\"dom.active.section === section.id\">\n      {{section.name}}\n    </a>\n  </nav>\n</div>\n<div class=\"pop-entity-tab-section-bar-wrapper\" [ngClass]=\"{'pop-entity-tab-section-bar-overflow': this.overflow}\" [style.height.px]=\"dom.height.inner\">\n  <ng-template #container></ng-template>\n</div>\n",
                styles: [".pop-entity-tab-section-bar-header{position:relative;border:1px solid transparent;border-radius:3px;margin:-20px 0 0}.pop-entity-tab-section-bar-wrapper{flex:1 1 100%}.pop-entity-tab-section-bar-overflow{overflow-y:scroll}#back-button{font-size:14px;color:red}"]
            },] }
];
PopTabMenuSectionBarComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: ActivatedRoute },
    { type: PopTabMenuService }
];
PopTabMenuSectionBarComponent.propDecorators = {
    sections: [{ type: Input }],
    overflow: [{ type: Input }],
    container: [{ type: ViewChild, args: ['container', { read: ViewContainerRef, static: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXRhYi1tZW51LXNlY3Rpb24tYmFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLXRhYi1tZW51L3BvcC10YWItbWVudS1zZWN0aW9uLWJhci9wb3AtdGFiLW1lbnUtc2VjdGlvbi1iYXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQXFCLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM3RyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMzQyxPQUFPLEVBQTBFLGVBQWUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ3ZJLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBRXJGLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUNqRixPQUFPLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBUXpFLE1BQU0sT0FBTyw2QkFBOEIsU0FBUSx5QkFBeUI7SUF5QjFFLFlBQ1MsRUFBYyxFQUNYLFFBQXVCLEVBQ3ZCLFVBQTBCLEVBQzFCLFFBQTJCO1FBRXJDLEtBQUssRUFBRSxDQUFDO1FBTEQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUNYLGFBQVEsR0FBUixRQUFRLENBQWU7UUFDdkIsZUFBVSxHQUFWLFVBQVUsQ0FBZ0I7UUFDMUIs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QUUsQ0FBRSxDQUFDO2lCQUMxQzthQUNGO1lBRUQsT0FBTyxPQUFPLENBQUUsSUFBSSxDQUFFLENBQUM7UUFDekIsQ0FBQyxDQUFBLENBQUUsQ0FBQztJQUVOLENBQUM7OztZQTdKRixTQUFTLFNBQUU7Z0JBQ1YsUUFBUSxFQUFFLHlCQUF5QjtnQkFDbkMsaWdCQUF3RDs7YUFFekQ7OztZQWhCbUIsVUFBVTtZQU1yQixhQUFhO1lBTGIsY0FBYztZQU1kLGlCQUFpQjs7O3VCQVd2QixLQUFLO3VCQUNMLEtBQUs7d0JBQ0wsU0FBUyxTQUFFLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQsIFZpZXdDaGlsZCwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUsIFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBMb2NhdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBEaWN0aW9uYXJ5LCBEeW5hbWljQ29tcG9uZW50SW50ZXJmYWNlLCBTZWN0aW9uQ29uZmlnLCBTZWN0aW9uSW50ZXJmYWNlLCBTZXJ2aWNlSW5qZWN0b3IgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFBvcEV4dGVuZER5bmFtaWNDb21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtZXh0ZW5kLWR5bmFtaWMuY29tcG9uZW50JztcbmltcG9ydCB7IFRhYkNvbmZpZyB9IGZyb20gJy4uL3RhYi1tZW51Lm1vZGVsJztcbmltcG9ydCB7IFBvcERvbVNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtZG9tLnNlcnZpY2UnO1xuaW1wb3J0IHsgUG9wVGFiTWVudVNlcnZpY2UgfSBmcm9tICcuLi9wb3AtdGFiLW1lbnUuc2VydmljZSc7XG5pbXBvcnQgeyBQb3BUYWJNZW51U2VjdGlvbkJhclNlcnZpY2UgfSBmcm9tICcuL3BvcC10YWItbWVudS1zZWN0aW9uLWJhci5zZXJ2aWNlJztcbmltcG9ydCB7IEFycmF5TWFwU2V0dGVyLCBJc0FycmF5IH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcblxuXG5AQ29tcG9uZW50KCB7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC10YWItc2VjdGlvbi1iYXInLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLXRhYi1tZW51LXNlY3Rpb24tYmFyLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbICcuL3BvcC10YWItbWVudS1zZWN0aW9uLWJhci5jb21wb25lbnQuc2NzcycgXSxcbn0gKVxuZXhwb3J0IGNsYXNzIFBvcFRhYk1lbnVTZWN0aW9uQmFyQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kRHluYW1pY0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgc2VjdGlvbnM6IFNlY3Rpb25Db25maWdbXTtcbiAgQElucHV0KCkgb3ZlcmZsb3cgPSBmYWxzZTtcbiAgQFZpZXdDaGlsZCggJ2NvbnRhaW5lcicsIHsgcmVhZDogVmlld0NvbnRhaW5lclJlZiwgc3RhdGljOiB0cnVlIH0gKSBwdWJsaWMgY29udGFpbmVyO1xuXG4gIHB1YmxpYyBuYW1lID0gJ1BvcFRhYk1lbnVTZWN0aW9uQmFyQ29tcG9uZW50JztcblxuICBwcm90ZWN0ZWQgc3J2ID0ge1xuICAgIGxvY2F0aW9uOiA8TG9jYXRpb24+U2VydmljZUluamVjdG9yLmdldCggTG9jYXRpb24gKSxcbiAgICByb3V0ZXI6IDxSb3V0ZXI+U2VydmljZUluamVjdG9yLmdldCggUm91dGVyICksXG4gICAgcm91dGU6IDxBY3RpdmF0ZWRSb3V0ZT51bmRlZmluZWQsXG4gICAgc2VjdGlvbjogPFBvcFRhYk1lbnVTZWN0aW9uQmFyU2VydmljZT5TZXJ2aWNlSW5qZWN0b3IuZ2V0KCBQb3BUYWJNZW51U2VjdGlvbkJhclNlcnZpY2UgKSxcbiAgICB0YWI6IDxQb3BUYWJNZW51U2VydmljZT51bmRlZmluZWRcbiAgfTtcblxuICBwdWJsaWMgdWkgPSB7fTtcblxuICBwcm90ZWN0ZWQgYXNzZXQgPSB7XG4gICAgdGFiOiA8VGFiQ29uZmlnPnVuZGVmaW5lZCxcbiAgICBiYXNlVXJsOiA8c3RyaW5nPnVuZGVmaW5lZCxcbiAgICB1cmxTZWN0aW9uOiA8c3RyaW5nPnVuZGVmaW5lZCxcbiAgICBtYXA6IDxEaWN0aW9uYXJ5PGFueT4+e31cbiAgfTtcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgX2RvbVJlcG86IFBvcERvbVNlcnZpY2UsXG4gICAgcHJvdGVjdGVkIF9yb3V0ZVJlcG86IEFjdGl2YXRlZFJvdXRlLFxuICAgIHByb3RlY3RlZCBfdGFiUmVwbzogUG9wVGFiTWVudVNlcnZpY2UsXG4gICl7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggYXN5bmMoIHJlc29sdmUgKSA9PiB7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5fc2V0Q29yZSgpO1xuICAgICAgICBhd2FpdCB0aGlzLl9zZXRSb3V0ZSgpO1xuICAgICAgICBhd2FpdCB0aGlzLl9zZXRTZWN0aW9ucygpO1xuICAgICAgICBhd2FpdCB0aGlzLl9zZXRIZWlnaHQoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5fYXR0YWNoQ29udGFpbmVyKCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgIH0gKTtcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogU2V0dXAgdGhpcyBjb21wb25lbnRcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgd2lsbCBsb2FkIHRoZSBjb21vbmVudCBvZiB0aGUgc2VsZWN0ZWQgc2VjdGlvbiBpbnRvIHRoZSB2aWV3IGNvbnRhaW5lclxuICAgKiBAcGFyYW0gc2VjdGlvblxuICAgKi9cbiAgb25WaWV3U2VjdGlvbiggc2VjdGlvbjogU2VjdGlvbkludGVyZmFjZSApe1xuXG4gICAgdGhpcy5kb20uYWN0aXZlLnNlY3Rpb24gPSBzZWN0aW9uLmlkO1xuICAgIHRoaXMuc3J2LnNlY3Rpb24uc2V0U2VjdGlvblNlc3Npb24oICdwcm9maWxlJywgc2VjdGlvbi5pZCApO1xuICAgIHRoaXMuc3J2LmxvY2F0aW9uLmdvKCB0aGlzLmFzc2V0LmJhc2VVcmwgKyAnP3NlY3Rpb249JyArIHNlY3Rpb24uaWQgKTtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCBgdmlldy1zZWN0aW9uYCwgKCkgPT4ge1xuICAgICAgdGhpcy50ZW1wbGF0ZS5yZW5kZXIoIFsgPER5bmFtaWNDb21wb25lbnRJbnRlcmZhY2U+e1xuICAgICAgICB0eXBlOiBzZWN0aW9uLmNvbXBvbmVudCxcbiAgICAgICAgaW5wdXRzOiBzZWN0aW9uLmlucHV0cyxcbiAgICAgICAgcG9zaXRpb246IHRoaXMucG9zaXRpb24sXG4gICAgICB9IF0gKTtcbiAgICB9LCAwICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDbGVhbiB1cCB0aGUgZG9tIG9mIHRoaXMgY29tcG9uZW50XG4gICAqL1xuICBuZ09uRGVzdHJveSgpOiB2b2lke1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcm90ZWN0ZWQgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIHByb3RlY3RlZCBfc2V0Q29yZSgpOiBQcm9taXNlPGJvb2xlYW4+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggYXN5bmMoIHJlc29sdmUgKSA9PiB7XG4gICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgIH0gKTtcbiAgfVxuXG5cbiAgcHJvdGVjdGVkIF9zZXRSb3V0ZSgpOiBQcm9taXNlPGJvb2xlYW4+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggYXN5bmMoIHJlc29sdmUgKSA9PiB7XG4gICAgICBjb25zdCB1cmwgPSBTdHJpbmcoIHRoaXMuc3J2LnJvdXRlci51cmwgKS5zcGxpdCggJz8nIClbIDAgXTtcbiAgICAgIGNvbnN0IHNsdWdzID0gdXJsLnNwbGl0KCAnLycgKTtcbiAgICAgIHRoaXMuYXNzZXQuYmFzZVVybCA9IHNsdWdzLmpvaW4oICcvJyApO1xuICAgICAgaWYoIHRoaXMuc3J2LnNlY3Rpb24uZ2V0UGF0aFNlc3Npb24oIHRoaXMuY29yZS5wYXJhbXMuaW50ZXJuYWxfbmFtZSApICkgdGhpcy5hc3NldC51cmxTZWN0aW9uID0gPHN0cmluZz50aGlzLnNydi5zZWN0aW9uLmdldFBhdGhTZXNzaW9uKCB0aGlzLmNvcmUucGFyYW1zLmludGVybmFsX25hbWUgKTtcbiAgICAgIHRoaXMuZG9tLnNldFN1YnNjcmliZXIoICdxdWVyeS1wYXJhbXMnLCB0aGlzLnNydi5yb3V0ZS5xdWVyeVBhcmFtcy5zdWJzY3JpYmUoIHBhcmFtcyA9PiB7XG4gICAgICAgIGlmKCBwYXJhbXMuc2VjdGlvbiApIHRoaXMuYXNzZXQudXJsU2VjdGlvbiA9IHBhcmFtcy5zZWN0aW9uO1xuICAgICAgfSApICk7XG4gICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgIH0gKTtcblxuICB9XG5cblxuICBwcm90ZWN0ZWQgX3NldFNlY3Rpb25zKCk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyggcmVzb2x2ZSApID0+IHtcbiAgICAgIHRoaXMuYXNzZXQudGFiID0gPFRhYkNvbmZpZz50aGlzLnNydi50YWIuZ2V0VGFiKCk7XG4gICAgICB0aGlzLmRvbS5hY3RpdmUuc2VjdGlvbiA9IHVuZGVmaW5lZDtcbiAgICAgIGlmKCAhdGhpcy5zZWN0aW9ucyAmJiB0aGlzLmFzc2V0LnRhYi5zZWN0aW9ucyApe1xuICAgICAgICB0aGlzLnNlY3Rpb25zID0gPFNlY3Rpb25Db25maWdbXT50aGlzLmFzc2V0LnRhYi5zZWN0aW9ucztcbiAgICAgIH1cbiAgICAgIHRoaXMuYXNzZXQubWFwLnNlY3Rpb25zID0gQXJyYXlNYXBTZXR0ZXIoIHRoaXMuc2VjdGlvbnMsICdpZCcgKTtcbiAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgfSApO1xuICB9XG5cblxuICBwcm90ZWN0ZWQgX3NldEhlaWdodCgpOiBQcm9taXNlPGJvb2xlYW4+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggYXN5bmMoIHJlc29sdmUgKSA9PiB7XG5cbiAgICAgIGNvbnN0IGRlZmF1bHRIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSAyMzA7XG4gICAgICB0aGlzLmRvbS5zZXRIZWlnaHQoIGRlZmF1bHRIZWlnaHQsIDYwICk7XG5cbiAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgfSApO1xuXG4gIH1cblxuXG4gIHByb3RlY3RlZCBfYXR0YWNoQ29udGFpbmVyKCk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyggcmVzb2x2ZSApID0+IHtcblxuICAgICAgdGhpcy50ZW1wbGF0ZS5hdHRhY2goICdjb250YWluZXInICk7XG4gICAgICBpZiggSXNBcnJheSggdGhpcy5zZWN0aW9ucywgdHJ1ZSApICl7XG4gICAgICAgIGlmKCB0aGlzLmFzc2V0LnVybFNlY3Rpb24gaW4gdGhpcy5hc3NldC5tYXAuc2VjdGlvbnMgKXtcbiAgICAgICAgICB0aGlzLm9uVmlld1NlY3Rpb24oIHRoaXMuc2VjdGlvbnNbIHRoaXMuYXNzZXQubWFwLnNlY3Rpb25zIFsgdGhpcy5hc3NldC51cmxTZWN0aW9uIF0gXSApO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB0aGlzLm9uVmlld1NlY3Rpb24oIHRoaXMuc2VjdGlvbnNbIDAgXSApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgfSApO1xuXG4gIH1cbn1cbiJdfQ==