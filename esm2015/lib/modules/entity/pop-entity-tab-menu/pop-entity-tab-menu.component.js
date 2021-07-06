import { __awaiter } from "tslib";
import { ChangeDetectorRef, Component, ElementRef, Inject, Input, Optional, ViewChild, ViewContainerRef } from '@angular/core';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { PopEntity, PopTemplate, ServiceInjector } from '../../../pop-common.model';
import { PopEntityEventService } from '../services/pop-entity-event.service';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopExtendDynamicComponent } from '../../../pop-extend-dynamic.component';
import { PopTabMenuComponent } from '../../base/pop-tab-menu/pop-tab-menu.component';
import { PopEntityPortalMenuComponent } from './pop-entity-portal-menu/pop-entity-portal-menu.component';
import { PopEntityActionService } from '../services/pop-entity-action.service';
import { GetRouteAlias, IsObject, IsObjectThrowError, TitleCase } from '../../../pop-common-utility';
import { PopCacFilterBarService } from '../../app/pop-cac-filter/pop-cac-filter.service';
import { GetSingularName, GetTabMenuConfig, IsAliasable, IsEntity, IsValidFieldPatchEvent } from '../pop-entity-utility';
export class PopEntityTabMenuComponent extends PopExtendDynamicComponent {
    constructor(el, cdr, route, _domRepo, _tabRepo, APP_GLOBAL, dialogRef) {
        super();
        this.el = el;
        this.cdr = cdr;
        this.route = route;
        this._domRepo = _domRepo;
        this._tabRepo = _tabRepo;
        this.APP_GLOBAL = APP_GLOBAL;
        this.dialogRef = dialogRef;
        this.name = 'PopEntityTabMenuComponent';
        this.srv = {
            action: ServiceInjector.get(PopEntityActionService),
            dialog: ServiceInjector.get(MatDialog),
            events: ServiceInjector.get(PopEntityEventService),
            tab: undefined
        };
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                yield this.APP_GLOBAL.isVerified();
                if (!IsObject(this.extension, true))
                    this.extension = {};
                if (!this.extension.goToUrl)
                    this.extension.goToUrl = null;
                if (this.route.snapshot.data && Object.keys(this.route.snapshot.data).length) {
                    Object.keys(this.route.snapshot.data).map((key) => {
                        this.extension[key] = this.route.snapshot.data[key];
                    });
                }
                return resolve(true);
            }));
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                // Require a CoreConfig
                yield this._setCore();
                this.core = IsObjectThrowError(this.core, true, `${this.name}:configureDom: - this.core`) ? this.core : null;
                if (this.core.flag.routeCheck) { // check this child routes for any aliasing
                    this.route.routeConfig.children.map((childRoute) => {
                        const internal_name = GetSingularName(childRoute.path);
                        if (IsAliasable(childRoute.path) && IsEntity(TitleCase(internal_name))) {
                            childRoute.path = GetRouteAlias(internal_name);
                        }
                    });
                    this.core.flag.routeCheck = false;
                }
                this.log.info('tab-menu config', this.config);
                this.dom.height.default = window.innerHeight - 100;
                this.dom.setHeight(this.dom.height.default, 100);
                // this component set the outer height boundary
                this.log.info(`Determined height:${this.dom.height.inner}`);
                // Bind events to handlers
                this.dom.handler.bubble = (core, event) => this.onBubbleEvent(event);
                // Require a TabMenuConfig, and pull in extension params from the route
                yield this._setTabMenuConfig();
                if (this.config.portal)
                    this.dom.height.inner = this.dom.height.inner - 50;
                //  Attach Template Container
                this.template.attach('container');
                //  Render the dynamic list of components
                this._templateRender();
                return resolve(true);
            }));
        };
    }
    /**
     * Helper function that renders the list of dynamic components
     *
     */
    _templateRender() {
        if (this.config.portal) {
            this.asset.component = this.template.render([{
                    type: PopEntityPortalMenuComponent,
                    inputs: {
                        config: this.config
                    }
                }]);
            // componentRef.instance.events.subscribe((event: PopBaseEventInterface) => {
            //   if( typeof this.dom.handler.bubble === 'function' ){
            //     this.dom.handler.bubble(event);
            //   }else{
            //     if( this.trait.bubble ) this.events.emit(event);
            //   }
            // })
        }
        else {
            this.template.render([{
                    type: PopTabMenuComponent,
                    inputs: {
                        config: this.config
                    }
                }]);
        }
    }
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * Tie in for a parent component to pass in a TabMenuConfig
     * @param config
     */
    registerTabMenuConfig(config) {
        this.config = IsObjectThrowError(config, true, `${this.name}:registerTabMenuConfig: - config`) ? config : {};
        this.dom.setSubscriber('config-change', this.srv.tab.change.subscribe((event) => {
        }));
        try {
            this.cdr.detectChanges();
        }
        catch (e) {
        }
        this._registerTabMenuConfig();
    }
    /**
     * A TabMenu  will generate a slew of action and event triggers
     * @param event
     */
    onBubbleEvent(event) {
        this.log.event(`onBubbleEvent`, event);
        if (IsValidFieldPatchEvent(this.core, event)) {
            if (event.config.name === 'name' || event.config.name === 'label') {
                this.config.name = event.config.control.value;
            }
        }
        else {
            switch (event.type) {
                case 'button':
                    switch (event.id) {
                        case 'reset':
                            this.srv.tab.refreshEntity(null, this.dom.repo, {}, 'PopEntityTabMenuComponent:handleMenuEvent:reset').then(() => true);
                            break;
                        // case 'archive':
                        //   this.onArchiveButtonClicked(true);
                        //   break;
                        // case 'activate':
                        //   this.onArchiveButtonClicked(false);
                        //   break;
                        case 'clone':
                            this.onCloneButtonClicked();
                            break;
                        case 'close':
                            if (this.dialogRef)
                                this.dialogRef.close();
                            break;
                        default:
                            this.events.emit(event);
                            break;
                    }
                    break;
                case 'portal':
                    break;
                case 'default':
                    break;
            }
        }
    }
    /**
     * A user can click on an archive/active button to change the status of this active entity
     * @param archive
     */
    onArchiveButtonClicked(archive) {
        if (this.dom.subscriber.entity)
            this.dom.subscriber.entity.unsubscribe();
        this.dom.subscriber.entityId = this.core.repo.archiveEntity(this.core.params.entityId, archive).subscribe(() => {
            PopEntity.bustAllCache();
            this.srv.events.sendEvent({
                source: this.name,
                method: 'archive',
                type: 'entity',
                name: this.core.params.name,
                internal_name: this.core.params.internal_name,
                id: this.core.params.entityId,
                data: archive
            });
            if (archive && !this.config.portal) {
                if (false) { // Disabled navigation back to the entity list for now
                    this.core.repo.navigateToEntities().catch(e => {
                        this.srv.tab.refreshEntity(null, this.dom.repo, {}, 'PopEntityTabMenuComponent:setArchived').then(() => PopTemplate.clear());
                    });
                }
                else {
                    this.srv.tab.refreshEntity(null, this.dom.repo, {}, 'PopEntityTabMenuComponent:setArchived').then(() => PopTemplate.clear());
                }
            }
            else {
                this.srv.tab.refreshEntity(null, this.dom.repo, {}, 'PopEntityTabMenuComponent:setArchived').then(() => PopTemplate.clear());
            }
        }, err => {
            this.dom.error.code = err.error.code;
            this.dom.error.message = err.error.message;
        });
    }
    /**
     * A user can click a clone button to trigger this active entity to be cloned
     */
    onCloneButtonClicked() {
        // this.dom.setTimeout( `clone-action`, async() => {
        //   const actionConfig = await this.srv.action.doAction( <CoreConfig>this.core, 'clone', this.extension );
        //   this.ui[ 'actionModal' ] = IsObject( actionConfig, true ) ? actionConfig : null;
        // }, 0 );
        this.dom.setTimeout(`do-action`, () => __awaiter(this, void 0, void 0, function* () {
            yield this.srv.action.do(this.core, 'clone', this.extension);
        }), 0);
    }
    /**
     * When the modal to clone the active entity is closed the asset needs to be cleared
     */
    onActionModalClose() {
        this.ui['actionModal'] = null;
    }
    /**
     * Cleanup the do of this component
     */
    ngOnDestroy() {
        if (this.core && this.core.params && this.core.params.entityId)
            this.core.repo.clearCache('entity', String(this.core.params.entityId), 'PopEntityTabMenuComponent:ngOnDestroy');
        // this.srv.tab.reset();
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * This allows a CoreConfig to be passed in else it will generate one
     *
     */
    _setCore() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (!(IsObject(this.core, true))) {
                if (IsObject(this.portal, ['internal_name', 'entity_id'])) {
                    this.core = yield PopEntity.getCoreConfig(this.portal.internal_name, this.portal.entity_id);
                    return resolve(true);
                }
                else if (IsObject(this.route.snapshot.data.core, true)) {
                    this.core = this.route.snapshot.data.core;
                    yield PopEntity.setCoreDomAssets(this.core, this.dom.repo);
                    return resolve(true);
                }
                else {
                    this.core = yield PopEntity.getCoreConfig(PopEntity.getRouteInternalName(this.route, this.extension), this.route.snapshot.params.id, this.dom.repo);
                    return resolve(true);
                }
            }
            else {
                return resolve(true);
            }
        }));
    }
    /**
     * This allows a TabMenuConfig to be passed in else it will generate one
     *
     */
    _setTabMenuConfig() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (!IsObject(this.config, true)) {
                this.config = GetTabMenuConfig(this.core, PopEntity.getEntityTabs(this.core));
                this.config = IsObjectThrowError(this.config, true, `${this.name}:configureDom: - this.config`) ? this.config : {};
                this._registerTabMenuConfig();
                return resolve(true);
            }
            else {
                this._registerTabMenuConfig();
                return resolve(true);
            }
        }));
    }
    /**
     * This will transfer the TabMenuConfig up to the tabRepo so other components can communicate with it
     *
     */
    _registerTabMenuConfig() {
        if (this.core && this.config) {
            // turn off the filter bar (unless a portal dialog) since it is wasted space
            if (IsObject(this.portal, ['internal_name'])) {
                this.config.portal = true;
            }
            if (!this.config.portal)
                ServiceInjector.get(PopCacFilterBarService).setActive(false);
            if (typeof this.extension === 'object' && Object.keys(this.extension).length) {
                Object.keys(this.extension).map((key) => {
                    if (key in this.config) {
                        this.config[key] = this.extension[key];
                    }
                });
            }
            // Register the config on the Tab Menu Service since it is the master control
            // We store the config of the Tab Menu since other components(Tabs,...) interact with it
            this.config = this.srv.tab.registerConfig(this.core, this.config, this.dom.repo);
            this.srv.tab.registerRoute(this.route);
            try {
                this.cdr.detectChanges();
            }
            catch (e) {
            }
        }
    }
}
PopEntityTabMenuComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-tab-menu',
                template: "<div class=\"entity-tab-menu-container\" [style.height.px]=dom.height.outer>\n  <ng-container #container>\n    <div class=\"entity-tab-menu-spinner-box\" *ngIf=\"dom.state.loader\">\n      <lib-main-spinner></lib-main-spinner>\n    </div>\n  </ng-container>\n  <lib-pop-field-item-group *ngIf=\"ui.actionModal\" [config]=\"ui.actionModal\" (close)=\"onActionModalClose();\"></lib-pop-field-item-group>\n  <lib-pop-errors *ngIf=\"dom.error?.message\" [error]=\"dom.error\"></lib-pop-errors>\n</div>\n",
                providers: [PopTabMenuService, PopDomService],
                styles: [".entity-tab-menu-container{display:flex;height:auto;flex-direction:column;box-sizing:border-box}.entity-tab-menu-container-margin{margin:25px}.entity-tab-menu-loader{position:absolute;height:2px;overflow:hidden;top:0;left:0;right:0;width:100%;clear:both}.entity-tab-menu-spinner-box{height:75vh}"]
            },] }
];
PopEntityTabMenuComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef },
    { type: ActivatedRoute },
    { type: PopDomService },
    { type: PopTabMenuService },
    { type: undefined, decorators: [{ type: Inject, args: ['APP_GLOBAL',] }] },
    { type: MatDialogRef, decorators: [{ type: Optional }] }
];
PopEntityTabMenuComponent.propDecorators = {
    config: [{ type: Input }],
    extension: [{ type: Input }],
    portal: [{ type: Input }],
    container: [{ type: ViewChild, args: ['container', { read: ViewContainerRef, static: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS10YWItbWVudS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS10YWItbWVudS9wb3AtZW50aXR5LXRhYi1tZW51LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQWdCLE1BQU0sRUFBRSxLQUFLLEVBQXFCLFFBQVEsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFaEssT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDakYsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNuRSxPQUFPLEVBQUUsY0FBYyxFQUFTLE1BQU0saUJBQWlCLENBQUM7QUFDeEQsT0FBTyxFQUFnRixTQUFTLEVBQUUsV0FBVyxFQUFFLGVBQWUsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2xLLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUNsRSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUNsRixPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUNyRixPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSwyREFBMkQsQ0FBQztBQUN6RyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUMvRSxPQUFPLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBWSxTQUFTLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMvRyxPQUFP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QUFTLEVBQUUsQ0FBRSxpQkFBaUIsRUFBRSxhQUFhLENBQUU7O2FBQ2hEOzs7WUF0QnNDLFVBQVU7WUFBeEMsaUJBQWlCO1lBSWpCLGNBQWM7WUFHZCxhQUFhO1lBTGIsaUJBQWlCOzRDQTRDckIsTUFBTSxTQUFFLFlBQVk7WUEzQ0wsWUFBWSx1QkE0QzNCLFFBQVE7OztxQkF2QlYsS0FBSzt3QkFDTCxLQUFLO3FCQUNMLEtBQUs7d0JBQ0wsU0FBUyxTQUFFLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSG9zdExpc3RlbmVyLCBJbmplY3QsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCwgT3B0aW9uYWwsIFZpZXdDaGlsZCwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgVGFiTWVudUNvbmZpZywgVGFiTWVudVBvcnRhbEludGVyZmFjZSB9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLXRhYi1tZW51L3RhYi1tZW51Lm1vZGVsJztcbmltcG9ydCB7IFBvcFRhYk1lbnVTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vYmFzZS9wb3AtdGFiLW1lbnUvcG9wLXRhYi1tZW51LnNlcnZpY2UnO1xuaW1wb3J0IHsgTWF0RGlhbG9nLCBNYXREaWFsb2dSZWYgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUsIFJvdXRlIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IEFwcEdsb2JhbEludGVyZmFjZSwgQ29yZUNvbmZpZywgRW50aXR5RXh0ZW5kSW50ZXJmYWNlLCBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsIFBvcEVudGl0eSwgUG9wVGVtcGxhdGUsIFNlcnZpY2VJbmplY3RvciB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgUG9wRW50aXR5RXZlbnRTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvcG9wLWVudGl0eS1ldmVudC5zZXJ2aWNlJztcbmltcG9ydCB7IFBvcERvbVNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlcy9wb3AtZG9tLnNlcnZpY2UnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kRHluYW1pY0NvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL3BvcC1leHRlbmQtZHluYW1pYy5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wVGFiTWVudUNvbXBvbmVudCB9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLXRhYi1tZW51L3BvcC10YWItbWVudS5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRW50aXR5UG9ydGFsTWVudUNvbXBvbmVudCB9IGZyb20gJy4vcG9wLWVudGl0eS1wb3J0YWwtbWVudS9wb3AtZW50aXR5LXBvcnRhbC1tZW51LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BFbnRpdHlBY3Rpb25TZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvcG9wLWVudGl0eS1hY3Rpb24uc2VydmljZSc7XG5pbXBvcnQgeyBHZXRSb3V0ZUFsaWFzLCBJc09iamVjdCwgSXNPYmplY3RUaHJvd0Vycm9yLCBJc1N0cmluZywgVGl0bGVDYXNlIH0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7IFBvcENhY0ZpbHRlckJhclNlcnZpY2UgfSBmcm9tICcuLi8uLi9hcHAvcG9wLWNhYy1maWx0ZXIvcG9wLWNhYy1maWx0ZXIuc2VydmljZSc7XG5pbXBvcnQgeyBHZXRTaW5ndWxhck5hbWUsIEdldFRhYk1lbnVDb25maWcsIElzQWxpYXNhYmxlLCBJc0VudGl0eSwgSXNWYWxpZEZpZWxkUGF0Y2hFdmVudCB9IGZyb20gJy4uL3BvcC1lbnRpdHktdXRpbGl0eSc7XG5cblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtZW50aXR5LXRhYi1tZW51JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lbnRpdHktdGFiLW1lbnUuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWVudGl0eS10YWItbWVudS5jb21wb25lbnQuc2NzcycgXSxcbiAgcHJvdmlkZXJzOiBbIFBvcFRhYk1lbnVTZXJ2aWNlLCBQb3BEb21TZXJ2aWNlIF0sXG59IClcbmV4cG9ydCBjbGFzcyBQb3BFbnRpdHlUYWJNZW51Q29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kRHluYW1pY0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgY29uZmlnOiBUYWJNZW51Q29uZmlnO1xuICBASW5wdXQoKSBleHRlbnNpb246IEVudGl0eUV4dGVuZEludGVyZmFjZTtcbiAgQElucHV0KCkgcG9ydGFsOiBUYWJNZW51UG9ydGFsSW50ZXJmYWNlO1xuICBAVmlld0NoaWxkKCAnY29udGFpbmVyJywgeyByZWFkOiBWaWV3Q29udGFpbmVyUmVmLCBzdGF0aWM6IHRydWUgfSApIHByaXZhdGUgY29udGFpbmVyO1xuXG5cbiAgcHVibGljIG5hbWUgPSAnUG9wRW50aXR5VGFiTWVudUNvbXBvbmVudCc7XG5cbiAgcHJvdGVjdGVkIHNydiA9IHtcbiAgICBhY3Rpb246IDxQb3BFbnRpdHlBY3Rpb25TZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoIFBvcEVudGl0eUFjdGlvblNlcnZpY2UgKSxcbiAgICBkaWFsb2c6IDxNYXREaWFsb2c+U2VydmljZUluamVjdG9yLmdldCggTWF0RGlhbG9nICksXG4gICAgZXZlbnRzOiA8UG9wRW50aXR5RXZlbnRTZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoIFBvcEVudGl0eUV2ZW50U2VydmljZSApLFxuICAgIHRhYjogPFBvcFRhYk1lbnVTZXJ2aWNlPnVuZGVmaW5lZFxuICB9O1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVsOiBFbGVtZW50UmVmLFxuICAgIHB1YmxpYyBjZHI6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHB1YmxpYyByb3V0ZTogQWN0aXZhdGVkUm91dGUsXG4gICAgcHJvdGVjdGVkIF9kb21SZXBvOiBQb3BEb21TZXJ2aWNlLFxuICAgIHByb3RlY3RlZCBfdGFiUmVwbzogUG9wVGFiTWVudVNlcnZpY2UsXG4gICAgQEluamVjdCggJ0FQUF9HTE9CQUwnICkgcHVibGljIEFQUF9HTE9CQUw6IEFwcEdsb2JhbEludGVyZmFjZSxcbiAgICBAT3B0aW9uYWwoKSBwdWJsaWMgZGlhbG9nUmVmOiBNYXREaWFsb2dSZWY8UG9wRW50aXR5VGFiTWVudUNvbXBvbmVudD5cbiAgKXtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyggcmVzb2x2ZSApID0+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5BUFBfR0xPQkFMLmlzVmVyaWZpZWQoKTtcbiAgICAgICAgaWYoICFJc09iamVjdCggdGhpcy5leHRlbnNpb24sIHRydWUgKSApIHRoaXMuZXh0ZW5zaW9uID0ge307XG4gICAgICAgIGlmKCAhdGhpcy5leHRlbnNpb24uZ29Ub1VybCApIHRoaXMuZXh0ZW5zaW9uLmdvVG9VcmwgPSBudWxsO1xuICAgICAgICBpZiggdGhpcy5yb3V0ZS5zbmFwc2hvdC5kYXRhICYmIE9iamVjdC5rZXlzKCB0aGlzLnJvdXRlLnNuYXBzaG90LmRhdGEgKS5sZW5ndGggKXtcbiAgICAgICAgICBPYmplY3Qua2V5cyggdGhpcy5yb3V0ZS5zbmFwc2hvdC5kYXRhICkubWFwKCAoIGtleSApID0+IHtcbiAgICAgICAgICAgIHRoaXMuZXh0ZW5zaW9uWyBrZXkgXSA9IHRoaXMucm91dGUuc25hcHNob3QuZGF0YVsga2V5IF07XG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcblxuICAgIHRoaXMuZG9tLnByb2NlZWQgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoIGFzeW5jKCByZXNvbHZlICkgPT4ge1xuICAgICAgICAvLyBSZXF1aXJlIGEgQ29yZUNvbmZpZ1xuICAgICAgICBhd2FpdCB0aGlzLl9zZXRDb3JlKCk7XG4gICAgICAgIHRoaXMuY29yZSA9IElzT2JqZWN0VGhyb3dFcnJvciggdGhpcy5jb3JlLCB0cnVlLCBgJHt0aGlzLm5hbWV9OmNvbmZpZ3VyZURvbTogLSB0aGlzLmNvcmVgICkgPyB0aGlzLmNvcmUgOiBudWxsO1xuICAgICAgICBpZiggdGhpcy5jb3JlLmZsYWcucm91dGVDaGVjayApeyAvLyBjaGVjayB0aGlzIGNoaWxkIHJvdXRlcyBmb3IgYW55IGFsaWFzaW5nXG4gICAgICAgICAgdGhpcy5yb3V0ZS5yb3V0ZUNvbmZpZy5jaGlsZHJlbi5tYXAoICggY2hpbGRSb3V0ZTogUm91dGUgKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbnRlcm5hbF9uYW1lID0gR2V0U2luZ3VsYXJOYW1lKCBjaGlsZFJvdXRlLnBhdGggKTtcbiAgICAgICAgICAgIGlmKCBJc0FsaWFzYWJsZSggY2hpbGRSb3V0ZS5wYXRoICkgJiYgSXNFbnRpdHkoIFRpdGxlQ2FzZSggaW50ZXJuYWxfbmFtZSApICkgKXtcbiAgICAgICAgICAgICAgY2hpbGRSb3V0ZS5wYXRoID0gR2V0Um91dGVBbGlhcyggaW50ZXJuYWxfbmFtZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gKTtcbiAgICAgICAgICB0aGlzLmNvcmUuZmxhZy5yb3V0ZUNoZWNrID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZy5pbmZvKCAndGFiLW1lbnUgY29uZmlnJywgdGhpcy5jb25maWcgKTtcbiAgICAgICAgdGhpcy5kb20uaGVpZ2h0LmRlZmF1bHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSAxMDA7XG4gICAgICAgIHRoaXMuZG9tLnNldEhlaWdodCggdGhpcy5kb20uaGVpZ2h0LmRlZmF1bHQsIDEwMCApO1xuICAgICAgICAvLyB0aGlzIGNvbXBvbmVudCBzZXQgdGhlIG91dGVyIGhlaWdodCBib3VuZGFyeVxuICAgICAgICB0aGlzLmxvZy5pbmZvKCBgRGV0ZXJtaW5lZCBoZWlnaHQ6JHt0aGlzLmRvbS5oZWlnaHQuaW5uZXJ9YCApO1xuICAgICAgICAvLyBCaW5kIGV2ZW50cyB0byBoYW5kbGVyc1xuICAgICAgICB0aGlzLmRvbS5oYW5kbGVyLmJ1YmJsZSA9ICggY29yZTogQ29yZUNvbmZpZywgZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSApID0+IHRoaXMub25CdWJibGVFdmVudCggZXZlbnQgKTtcbiAgICAgICAgLy8gUmVxdWlyZSBhIFRhYk1lbnVDb25maWcsIGFuZCBwdWxsIGluIGV4dGVuc2lvbiBwYXJhbXMgZnJvbSB0aGUgcm91dGVcbiAgICAgICAgYXdhaXQgdGhpcy5fc2V0VGFiTWVudUNvbmZpZygpO1xuICAgICAgICBpZiggdGhpcy5jb25maWcucG9ydGFsICkgdGhpcy5kb20uaGVpZ2h0LmlubmVyID0gdGhpcy5kb20uaGVpZ2h0LmlubmVyIC0gNTA7XG4gICAgICAgIC8vICBBdHRhY2ggVGVtcGxhdGUgQ29udGFpbmVyXG4gICAgICAgIHRoaXMudGVtcGxhdGUuYXR0YWNoKCAnY29udGFpbmVyJyApO1xuICAgICAgICAvLyAgUmVuZGVyIHRoZSBkeW5hbWljIGxpc3Qgb2YgY29tcG9uZW50c1xuICAgICAgICB0aGlzLl90ZW1wbGF0ZVJlbmRlcigpO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCByZW5kZXJzIHRoZSBsaXN0IG9mIGR5bmFtaWMgY29tcG9uZW50c1xuICAgKlxuICAgKi9cbiAgcHJpdmF0ZSBfdGVtcGxhdGVSZW5kZXIoKXtcbiAgICBpZiggdGhpcy5jb25maWcucG9ydGFsICl7XG4gICAgICB0aGlzLmFzc2V0LmNvbXBvbmVudCA9IHRoaXMudGVtcGxhdGUucmVuZGVyKCBbIHtcbiAgICAgICAgdHlwZTogUG9wRW50aXR5UG9ydGFsTWVudUNvbXBvbmVudCxcbiAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZ1xuICAgICAgICB9XG4gICAgICB9IF0gKTtcbiAgICAgIC8vIGNvbXBvbmVudFJlZi5pbnN0YW5jZS5ldmVudHMuc3Vic2NyaWJlKChldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlKSA9PiB7XG4gICAgICAvLyAgIGlmKCB0eXBlb2YgdGhpcy5kb20uaGFuZGxlci5idWJibGUgPT09ICdmdW5jdGlvbicgKXtcbiAgICAgIC8vICAgICB0aGlzLmRvbS5oYW5kbGVyLmJ1YmJsZShldmVudCk7XG4gICAgICAvLyAgIH1lbHNle1xuICAgICAgLy8gICAgIGlmKCB0aGlzLnRyYWl0LmJ1YmJsZSApIHRoaXMuZXZlbnRzLmVtaXQoZXZlbnQpO1xuICAgICAgLy8gICB9XG4gICAgICAvLyB9KVxuICAgIH1lbHNle1xuICAgICAgdGhpcy50ZW1wbGF0ZS5yZW5kZXIoIFsge1xuICAgICAgICB0eXBlOiBQb3BUYWJNZW51Q29tcG9uZW50LFxuICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICBjb25maWc6IHRoaXMuY29uZmlnXG4gICAgICAgIH1cbiAgICAgIH0gXSApO1xuICAgIH1cbiAgfVxuXG5cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogVGllIGluIGZvciBhIHBhcmVudCBjb21wb25lbnQgdG8gcGFzcyBpbiBhIFRhYk1lbnVDb25maWdcbiAgICogQHBhcmFtIGNvbmZpZ1xuICAgKi9cbiAgcmVnaXN0ZXJUYWJNZW51Q29uZmlnKCBjb25maWc6IFRhYk1lbnVDb25maWcgKXsgLy8gdXNlIGZvciBwcm9ncmFtbWF0aWMvZHluYW1pYyBpbXBsZW1lbnRhdGlvbnNcbiAgICB0aGlzLmNvbmZpZyA9IElzT2JqZWN0VGhyb3dFcnJvciggY29uZmlnLCB0cnVlLCBgJHt0aGlzLm5hbWV9OnJlZ2lzdGVyVGFiTWVudUNvbmZpZzogLSBjb25maWdgICkgPyBjb25maWcgOiA8VGFiTWVudUNvbmZpZz57fTtcbiAgICB0aGlzLmRvbS5zZXRTdWJzY3JpYmVyKCAnY29uZmlnLWNoYW5nZScsIHRoaXMuc3J2LnRhYi5jaGFuZ2Uuc3Vic2NyaWJlKCAoIGV2ZW50ICkgPT4ge1xuICAgIH0gKSApO1xuICAgIHRyeXtcbiAgICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgICB9Y2F0Y2goIGUgKXtcbiAgICB9XG4gICAgdGhpcy5fcmVnaXN0ZXJUYWJNZW51Q29uZmlnKCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBIFRhYk1lbnUgIHdpbGwgZ2VuZXJhdGUgYSBzbGV3IG9mIGFjdGlvbiBhbmQgZXZlbnQgdHJpZ2dlcnNcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuICBvbkJ1YmJsZUV2ZW50KCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICk6IHZvaWR7XG4gICAgdGhpcy5sb2cuZXZlbnQoIGBvbkJ1YmJsZUV2ZW50YCwgZXZlbnQgKTtcbiAgICBpZiggSXNWYWxpZEZpZWxkUGF0Y2hFdmVudCggdGhpcy5jb3JlLCBldmVudCApICl7XG4gICAgICBpZiggZXZlbnQuY29uZmlnLm5hbWUgPT09ICduYW1lJyB8fCBldmVudC5jb25maWcubmFtZSA9PT0gJ2xhYmVsJyApe1xuICAgICAgICB0aGlzLmNvbmZpZy5uYW1lID0gZXZlbnQuY29uZmlnLmNvbnRyb2wudmFsdWU7XG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBzd2l0Y2goIGV2ZW50LnR5cGUgKXtcbiAgICAgICAgY2FzZSAnYnV0dG9uJzpcbiAgICAgICAgICBzd2l0Y2goIGV2ZW50LmlkICl7XG4gICAgICAgICAgICBjYXNlICdyZXNldCc6XG4gICAgICAgICAgICAgIHRoaXMuc3J2LnRhYi5yZWZyZXNoRW50aXR5KCBudWxsLCB0aGlzLmRvbS5yZXBvLCB7fSwgJ1BvcEVudGl0eVRhYk1lbnVDb21wb25lbnQ6aGFuZGxlTWVudUV2ZW50OnJlc2V0JyApLnRoZW4oICgpID0+IHRydWUgKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvLyBjYXNlICdhcmNoaXZlJzpcbiAgICAgICAgICAgIC8vICAgdGhpcy5vbkFyY2hpdmVCdXR0b25DbGlja2VkKHRydWUpO1xuICAgICAgICAgICAgLy8gICBicmVhaztcbiAgICAgICAgICAgIC8vIGNhc2UgJ2FjdGl2YXRlJzpcbiAgICAgICAgICAgIC8vICAgdGhpcy5vbkFyY2hpdmVCdXR0b25DbGlja2VkKGZhbHNlKTtcbiAgICAgICAgICAgIC8vICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjbG9uZSc6XG4gICAgICAgICAgICAgIHRoaXMub25DbG9uZUJ1dHRvbkNsaWNrZWQoKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjbG9zZSc6XG4gICAgICAgICAgICAgIGlmKCB0aGlzLmRpYWxvZ1JlZiApIHRoaXMuZGlhbG9nUmVmLmNsb3NlKCk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgdGhpcy5ldmVudHMuZW1pdCggZXZlbnQgKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdwb3J0YWwnOlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkZWZhdWx0JzpcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBIHVzZXIgY2FuIGNsaWNrIG9uIGFuIGFyY2hpdmUvYWN0aXZlIGJ1dHRvbiB0byBjaGFuZ2UgdGhlIHN0YXR1cyBvZiB0aGlzIGFjdGl2ZSBlbnRpdHlcbiAgICogQHBhcmFtIGFyY2hpdmVcbiAgICovXG4gIG9uQXJjaGl2ZUJ1dHRvbkNsaWNrZWQoIGFyY2hpdmU6IGJvb2xlYW4gKXtcbiAgICBpZiggdGhpcy5kb20uc3Vic2NyaWJlci5lbnRpdHkgKSB0aGlzLmRvbS5zdWJzY3JpYmVyLmVudGl0eS51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuZG9tLnN1YnNjcmliZXIuZW50aXR5SWQgPSB0aGlzLmNvcmUucmVwby5hcmNoaXZlRW50aXR5KCB0aGlzLmNvcmUucGFyYW1zLmVudGl0eUlkLCBhcmNoaXZlICkuc3Vic2NyaWJlKCAoKSA9PiB7XG4gICAgICBQb3BFbnRpdHkuYnVzdEFsbENhY2hlKCk7XG4gICAgICB0aGlzLnNydi5ldmVudHMuc2VuZEV2ZW50KCB7XG4gICAgICAgIHNvdXJjZTogdGhpcy5uYW1lLFxuICAgICAgICBtZXRob2Q6ICdhcmNoaXZlJyxcbiAgICAgICAgdHlwZTogJ2VudGl0eScsXG4gICAgICAgIG5hbWU6IHRoaXMuY29yZS5wYXJhbXMubmFtZSxcbiAgICAgICAgaW50ZXJuYWxfbmFtZTogdGhpcy5jb3JlLnBhcmFtcy5pbnRlcm5hbF9uYW1lLFxuICAgICAgICBpZDogdGhpcy5jb3JlLnBhcmFtcy5lbnRpdHlJZCxcbiAgICAgICAgZGF0YTogYXJjaGl2ZVxuICAgICAgfSApO1xuICAgICAgaWYoIGFyY2hpdmUgJiYgIXRoaXMuY29uZmlnLnBvcnRhbCApe1xuICAgICAgICBpZiggZmFsc2UgKXsgLy8gRGlzYWJsZWQgbmF2aWdhdGlvbiBiYWNrIHRvIHRoZSBlbnRpdHkgbGlzdCBmb3Igbm93XG4gICAgICAgICAgdGhpcy5jb3JlLnJlcG8ubmF2aWdhdGVUb0VudGl0aWVzKCkuY2F0Y2goIGUgPT4ge1xuICAgICAgICAgICAgdGhpcy5zcnYudGFiLnJlZnJlc2hFbnRpdHkoIG51bGwsIHRoaXMuZG9tLnJlcG8sIHt9LCAnUG9wRW50aXR5VGFiTWVudUNvbXBvbmVudDpzZXRBcmNoaXZlZCcgKS50aGVuKCAoKSA9PiBQb3BUZW1wbGF0ZS5jbGVhcigpICk7XG4gICAgICAgICAgfSApO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB0aGlzLnNydi50YWIucmVmcmVzaEVudGl0eSggbnVsbCwgdGhpcy5kb20ucmVwbywge30sICdQb3BFbnRpdHlUYWJNZW51Q29tcG9uZW50OnNldEFyY2hpdmVkJyApLnRoZW4oICgpID0+IFBvcFRlbXBsYXRlLmNsZWFyKCkgKTtcbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuc3J2LnRhYi5yZWZyZXNoRW50aXR5KCBudWxsLCB0aGlzLmRvbS5yZXBvLCB7fSwgJ1BvcEVudGl0eVRhYk1lbnVDb21wb25lbnQ6c2V0QXJjaGl2ZWQnICkudGhlbiggKCkgPT4gUG9wVGVtcGxhdGUuY2xlYXIoKSApO1xuICAgICAgfVxuICAgIH0sIGVyciA9PiB7XG4gICAgICB0aGlzLmRvbS5lcnJvci5jb2RlID0gZXJyLmVycm9yLmNvZGU7XG4gICAgICB0aGlzLmRvbS5lcnJvci5tZXNzYWdlID0gZXJyLmVycm9yLm1lc3NhZ2U7XG4gICAgfSApO1xuICB9XG5cblxuICAvKipcbiAgICogQSB1c2VyIGNhbiBjbGljayBhIGNsb25lIGJ1dHRvbiB0byB0cmlnZ2VyIHRoaXMgYWN0aXZlIGVudGl0eSB0byBiZSBjbG9uZWRcbiAgICovXG4gIG9uQ2xvbmVCdXR0b25DbGlja2VkKCl7XG4gICAgLy8gdGhpcy5kb20uc2V0VGltZW91dCggYGNsb25lLWFjdGlvbmAsIGFzeW5jKCkgPT4ge1xuICAgIC8vICAgY29uc3QgYWN0aW9uQ29uZmlnID0gYXdhaXQgdGhpcy5zcnYuYWN0aW9uLmRvQWN0aW9uKCA8Q29yZUNvbmZpZz50aGlzLmNvcmUsICdjbG9uZScsIHRoaXMuZXh0ZW5zaW9uICk7XG4gICAgLy8gICB0aGlzLnVpWyAnYWN0aW9uTW9kYWwnIF0gPSBJc09iamVjdCggYWN0aW9uQ29uZmlnLCB0cnVlICkgPyBhY3Rpb25Db25maWcgOiBudWxsO1xuICAgIC8vIH0sIDAgKTtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBkby1hY3Rpb25gLCBhc3luYygpPT57XG4gICAgICBhd2FpdCB0aGlzLnNydi5hY3Rpb24uZG8odGhpcy5jb3JlLCAnY2xvbmUnLCB0aGlzLmV4dGVuc2lvbik7XG4gICAgfSwgMCk7XG5cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIG1vZGFsIHRvIGNsb25lIHRoZSBhY3RpdmUgZW50aXR5IGlzIGNsb3NlZCB0aGUgYXNzZXQgbmVlZHMgdG8gYmUgY2xlYXJlZFxuICAgKi9cbiAgb25BY3Rpb25Nb2RhbENsb3NlKCl7XG4gICAgdGhpcy51aVsgJ2FjdGlvbk1vZGFsJyBdID0gbnVsbDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENsZWFudXAgdGhlIGRvIG9mIHRoaXMgY29tcG9uZW50XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIGlmKCB0aGlzLmNvcmUgJiYgdGhpcy5jb3JlLnBhcmFtcyAmJiB0aGlzLmNvcmUucGFyYW1zLmVudGl0eUlkICkgdGhpcy5jb3JlLnJlcG8uY2xlYXJDYWNoZSggJ2VudGl0eScsIFN0cmluZyggdGhpcy5jb3JlLnBhcmFtcy5lbnRpdHlJZCApLCAnUG9wRW50aXR5VGFiTWVudUNvbXBvbmVudDpuZ09uRGVzdHJveScgKTtcbiAgICAvLyB0aGlzLnNydi50YWIucmVzZXQoKTtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVuZGVyIFRoZSBIb29kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJpdmF0ZSBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gIC8qKlxuICAgKiBUaGlzIGFsbG93cyBhIENvcmVDb25maWcgdG8gYmUgcGFzc2VkIGluIGVsc2UgaXQgd2lsbCBnZW5lcmF0ZSBvbmVcbiAgICpcbiAgICovXG4gIHByaXZhdGUgX3NldENvcmUoKTogUHJvbWlzZTxib29sZWFuPntcbiAgICByZXR1cm4gbmV3IFByb21pc2UoIGFzeW5jKCByZXNvbHZlICkgPT4ge1xuICAgICAgaWYoICEoIElzT2JqZWN0KCB0aGlzLmNvcmUsIHRydWUgKSApICl7XG4gICAgICAgIGlmKCBJc09iamVjdCggdGhpcy5wb3J0YWwsIFsgJ2ludGVybmFsX25hbWUnLCAnZW50aXR5X2lkJyBdICkgKXtcbiAgICAgICAgICB0aGlzLmNvcmUgPSBhd2FpdCBQb3BFbnRpdHkuZ2V0Q29yZUNvbmZpZyggdGhpcy5wb3J0YWwuaW50ZXJuYWxfbmFtZSwgdGhpcy5wb3J0YWwuZW50aXR5X2lkICk7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgICAgfWVsc2UgaWYoIElzT2JqZWN0KCB0aGlzLnJvdXRlLnNuYXBzaG90LmRhdGEuY29yZSwgdHJ1ZSApICl7XG4gICAgICAgICAgdGhpcy5jb3JlID0gdGhpcy5yb3V0ZS5zbmFwc2hvdC5kYXRhLmNvcmU7XG4gICAgICAgICAgYXdhaXQgUG9wRW50aXR5LnNldENvcmVEb21Bc3NldHMoIHRoaXMuY29yZSwgdGhpcy5kb20ucmVwbyApO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRoaXMuY29yZSA9IGF3YWl0IFBvcEVudGl0eS5nZXRDb3JlQ29uZmlnKCBQb3BFbnRpdHkuZ2V0Um91dGVJbnRlcm5hbE5hbWUoIHRoaXMucm91dGUsIHRoaXMuZXh0ZW5zaW9uICksIHRoaXMucm91dGUuc25hcHNob3QucGFyYW1zLmlkLCB0aGlzLmRvbS5yZXBvICk7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9XG4gICAgfSApO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBhbGxvd3MgYSBUYWJNZW51Q29uZmlnIHRvIGJlIHBhc3NlZCBpbiBlbHNlIGl0IHdpbGwgZ2VuZXJhdGUgb25lXG4gICAqXG4gICAqL1xuICBwcml2YXRlIF9zZXRUYWJNZW51Q29uZmlnKCk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyggcmVzb2x2ZSApID0+IHtcbiAgICAgIGlmKCAhSXNPYmplY3QoIHRoaXMuY29uZmlnLCB0cnVlICkgKXtcbiAgICAgICAgdGhpcy5jb25maWcgPSBHZXRUYWJNZW51Q29uZmlnKCB0aGlzLmNvcmUsIFBvcEVudGl0eS5nZXRFbnRpdHlUYWJzKCB0aGlzLmNvcmUgKSApO1xuICAgICAgICB0aGlzLmNvbmZpZyA9IElzT2JqZWN0VGhyb3dFcnJvciggdGhpcy5jb25maWcsIHRydWUsIGAke3RoaXMubmFtZX06Y29uZmlndXJlRG9tOiAtIHRoaXMuY29uZmlnYCApID8gdGhpcy5jb25maWcgOiA8VGFiTWVudUNvbmZpZz57fTtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXJUYWJNZW51Q29uZmlnKCk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXJUYWJNZW51Q29uZmlnKCk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9XG4gICAgfSApO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyB3aWxsIHRyYW5zZmVyIHRoZSBUYWJNZW51Q29uZmlnIHVwIHRvIHRoZSB0YWJSZXBvIHNvIG90aGVyIGNvbXBvbmVudHMgY2FuIGNvbW11bmljYXRlIHdpdGggaXRcbiAgICpcbiAgICovXG4gIHByaXZhdGUgX3JlZ2lzdGVyVGFiTWVudUNvbmZpZygpe1xuICAgIGlmKCB0aGlzLmNvcmUgJiYgdGhpcy5jb25maWcgKXtcbiAgICAgIC8vIHR1cm4gb2ZmIHRoZSBmaWx0ZXIgYmFyICh1bmxlc3MgYSBwb3J0YWwgZGlhbG9nKSBzaW5jZSBpdCBpcyB3YXN0ZWQgc3BhY2VcbiAgICAgIGlmKCBJc09iamVjdCggdGhpcy5wb3J0YWwsIFsgJ2ludGVybmFsX25hbWUnIF0gKSApe1xuICAgICAgICB0aGlzLmNvbmZpZy5wb3J0YWwgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYoICF0aGlzLmNvbmZpZy5wb3J0YWwgKSBTZXJ2aWNlSW5qZWN0b3IuZ2V0KCBQb3BDYWNGaWx0ZXJCYXJTZXJ2aWNlICkuc2V0QWN0aXZlKCBmYWxzZSApO1xuXG4gICAgICBpZiggdHlwZW9mIHRoaXMuZXh0ZW5zaW9uID09PSAnb2JqZWN0JyAmJiBPYmplY3Qua2V5cyggdGhpcy5leHRlbnNpb24gKS5sZW5ndGggKXtcbiAgICAgICAgT2JqZWN0LmtleXMoIHRoaXMuZXh0ZW5zaW9uICkubWFwKCAoIGtleSApID0+IHtcbiAgICAgICAgICBpZigga2V5IGluIHRoaXMuY29uZmlnICl7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ1sga2V5IF0gPSB0aGlzLmV4dGVuc2lvblsga2V5IF07XG4gICAgICAgICAgfVxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgICAvLyBSZWdpc3RlciB0aGUgY29uZmlnIG9uIHRoZSBUYWIgTWVudSBTZXJ2aWNlIHNpbmNlIGl0IGlzIHRoZSBtYXN0ZXIgY29udHJvbFxuICAgICAgLy8gV2Ugc3RvcmUgdGhlIGNvbmZpZyBvZiB0aGUgVGFiIE1lbnUgc2luY2Ugb3RoZXIgY29tcG9uZW50cyhUYWJzLC4uLikgaW50ZXJhY3Qgd2l0aCBpdFxuICAgICAgdGhpcy5jb25maWcgPSB0aGlzLnNydi50YWIucmVnaXN0ZXJDb25maWcoIHRoaXMuY29yZSwgPFRhYk1lbnVDb25maWc+dGhpcy5jb25maWcsIHRoaXMuZG9tLnJlcG8gKTtcbiAgICAgIHRoaXMuc3J2LnRhYi5yZWdpc3RlclJvdXRlKCB0aGlzLnJvdXRlICk7XG4gICAgICB0cnl7XG4gICAgICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgICAgIH1jYXRjaCggZSApe1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG59XG5cbiJdfQ==