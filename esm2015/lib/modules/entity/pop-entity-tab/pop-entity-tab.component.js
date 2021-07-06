import { __awaiter } from "tslib";
import { ChangeDetectorRef, Component, ElementRef, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { PopEntityEventService } from '../services/pop-entity-event.service';
import { PopEntityService } from '../services/pop-entity.service';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { PopPortal, ServiceInjector } from '../../../pop-common.model';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopDomService } from '../../../services/pop-dom.service';
import { IsValidFieldPatchEvent, ParseModelValue } from '../pop-entity-utility';
import { CleanObject, IsArray, IsDefined, IsObject, IsObjectThrowError, IsString, SpaceToSnake, StorageGetter, TitleCase } from '../../../pop-common-utility';
import { EntitySchemeSectionConfig } from '../pop-entity-scheme/pop-entity-scheme.model';
import { PopEntitySchemeCustomComponent } from '../pop-entity-scheme/pop-entity-scheme-custom-component/pop-entity-scheme-custom.component';
export class PopEntityTabComponent extends PopExtendComponent {
    /**
     * @param el
     * @param cdr
     * @param route
     * @param _tabRepo - transfer
     * @param _domRepo - transfer
     */
    constructor(el, cdr, route, _tabRepo, _domRepo) {
        super();
        this.el = el;
        this.cdr = cdr;
        this.route = route;
        this._tabRepo = _tabRepo;
        this._domRepo = _domRepo;
        this.name = 'PopEntityTabComponent';
        this.srv = {
            dialog: ServiceInjector.get(MatDialog),
            router: ServiceInjector.get(Router),
            events: ServiceInjector.get(PopEntityEventService),
            entity: ServiceInjector.get(PopEntityService),
            tab: undefined,
        };
        this.asset = {
            scheme: undefined,
        };
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                // Require a CoreConfig
                // Pull in the route extension settings
                if (!this.extension)
                    this.extension = {};
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
                this._setCore().then(() => {
                    if (!(IsObject(this.core.entity, ['id'])))
                        this.srv.router.navigate(['/system/route'], { skipLocationChange: true });
                    // #1: Enforce a CoreConfig && TabConfig
                    // this.core = IsObjectThrowError(this.core, true, `${this.name}:configureDom: - this.core`) ? this.core : null;
                    this._setTab().then(() => {
                        // set the outer height boundary of this component
                        this.dom.overhead = this.tab.wrap ? 40 : 10;
                        this.dom.overhead = this.tab.overhead ? this.dom.overhead + this.tab.overhead : this.dom.overhead;
                        this.dom.height.default = window.innerHeight - 70;
                        this.dom.setHeight(this.dom.height.default, 150);
                        // #3: Set tab group container
                        this.tab.groups = {};
                        // #4: Transfer in the ui rescources
                        // if( IsObject(this.core.entity, true) && IsObject(this.core.entity.ui, true) ){
                        //   Object.keys(this.core.entity.ui).map((key: string) => {
                        //     this.ui.resource[ key ] = this.core.entity.ui[ key ]; // ? maybe this should make a copy
                        //   });
                        // }
                        // #5: Build a view with a scheme or a model
                        this.asset.scheme = IsObject(this.core.entity, true) && this.core.entity.scheme_id && IsObject(this.core.resource.scheme, ['data']) ? CleanObject(this.core.resource.scheme.data) : null;
                        // console.log( 'this.asset.scheme', this.asset.scheme );
                        // #6: Bind Event handlers
                        this.dom.handler.core = (core, event) => this._coreEventHandler(event);
                        // #7: Build the view
                        this.tab.view = this._buildTabView();
                        // #8: Register the outlet so the tabRepo can reset the view if needed
                        if (true || this.tab.syncPositions)
                            this.srv.tab.registerOutletReset((position = null) => this.onResetView(position));
                        this._callOnLoadEvent();
                        this.dom.setTimeout(`determine-layout`, () => {
                            this._determineLayout();
                        }, 0);
                        return resolve(true);
                    });
                });
            }));
        };
        this.dom.unload = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.srv.tab.showAsLoading(false);
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
     * Bubble event handler
     * @param event
     */
    onBubbleEvent(event) {
        this.log.event(`onBubbleEvent`, event);
        if (event.type === 'field_group' && event.name === 'init') {
            this.tab.groups[event.id] = event.group;
            this._callOnEvent(event, { reset: true });
        }
        else if (event.type === 'sidebyside' && event.name === 'portal') {
            const entityParams = this.srv.entity.getEntityParamsWithPath(String(event.data).split('/')[0], +String(event.data).split('/')[1]);
            if (entityParams) {
                this.onViewEntityPortal(entityParams.internal_name, entityParams.entityId);
            }
        }
        else if (IsValidFieldPatchEvent(this.core, event)) {
            this.log.event(`IsValidFieldPatchEvent`, event);
            if (event.config.name === 'name' || event.config.name === 'label') {
                this.srv.tab.updateName(event.config.control.value);
            }
            const reset = this._needsPositionReset(event);
            if (!reset) {
                if (typeof this.tab.onEvent === 'function') {
                    this._callOnEvent(event);
                }
            }
            else {
                if (typeof this.tab.onEvent === 'function') {
                    this._callOnEvent(event);
                }
                this.srv.events.sendEvent(event);
            }
        }
        else if (event.type === 'context_menu') {
            if (event.name === 'portal' && event.internal_name && event.id) {
                setTimeout(() => {
                    this.onViewEntityPortal(event.internal_name, +event.id);
                }, 0);
            }
        }
        else if (event.type === 'dom') {
            if (event.name === 'refresh') {
                setTimeout(() => {
                    this.onResetView(+event.position);
                }, 0);
            }
        }
    }
    /**
     * Triggers when the window is resized
     */
    onWindowResize() {
        this.dom.setTimeout('window-resize', () => {
            this._determineLayout();
            this.srv.tab.resetTab();
        }, 500);
    }
    /**
     * Triggers when a user clicks on an entityId link to see the details of that entityId in a modal
     * @param internal_name
     * @param id
     */
    onViewEntityPortal(internalName, entityId) {
        // ToDo:: Due to circular injection errors, the portals are not working
        this.tab.view.map((column) => {
            column.reset.next('scrollTop');
        });
        // this.srv.router.navigateByUrl(`entities/fields/${entityId}`).catch(e => true);
        PopPortal.view(internalName, entityId).then((changed) => {
            if (changed) {
                this.dom.refreshing();
                this.srv.tab.refreshEntity(this.core.params.entityId, this.dom.repo, {}, 'PopEntityTabComponent:viewEntityPortal').then((res) => {
                    this.dom.ready();
                });
            }
        });
    }
    /**
     * Trigger to reset the view
     * @param position
     */
    onResetView(position = null) {
        if (this.dom.state.loaded) {
            if (position === null) {
                this.tab.view.map((section) => {
                    section.reset.next(true);
                });
            }
            else {
                this.tab.view[position].reset.next(true);
            }
            setTimeout(() => {
                this.dom.ready();
            }, 0);
        }
    }
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy() {
        this._callUnloadEvent();
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Protected Method )                                      *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Tie in hook that is called when ever a event if fired
     *
     */
    _callOnEvent(event, options = {}) {
        if (this.tab && typeof this.tab.onEvent === 'function') {
            event.tab = this.tab;
            // event.component = component;
            // event.core = this.core;
            if (options.reset)
                event.cdr = this.cdr;
            this.tab.onEvent.bind(this)(this.core, event);
        }
    }
    /**
     * Tie in hook that is called when the tab is initialized
     *
     */
    _callOnLoadEvent() {
        if (this.tab && typeof this.tab.onLoad === 'function') {
            this.tab.onLoad.bind(this)(this.core, this.tab);
        }
    }
    /**
     * Tie in hook that is called when the tab is destroyed
     *
     */
    _callUnloadEvent() {
        if (this.tab && typeof this.tab.onUnload === 'function') {
            this.tab.onUnload.bind(this)(this.core, this.tab);
        }
    }
    /**
     * Helper funtion to determine the correct header to display
     * @param header
     */
    _getHeaderText(header) {
        if (IsString(header, true)) {
            return TitleCase(ParseModelValue(header, this.core).replace(/_/g, ' ')).trim();
        }
        return null;
    }
    /**
     * Core Event Handler
     * @param event
     */
    _coreEventHandler(event) {
        this.log.event(`_coreEventHandler`, event);
        if (this.tab.wrap && event.type === 'component') {
            if (event.name === 'start-refresh') {
                this.dom.state.refresh = 1;
            }
            else if (event.name === 'stop-refresh') {
                this.dom.state.refresh = 0;
            }
            else if (event.name === 'reset-view') {
                this.onResetView();
            }
        }
    }
    /**
     * Detects if a mobile layout should be used based on the width of the screen
     */
    _determineLayout() {
        const client = this.el.nativeElement.getBoundingClientRect();
        this.dom.width.inner = client.width;
        this.dom.state.mobile = this.dom.width.inner <= 1340 ? true : false;
        if (this.dom.state.mobile) {
            this.tab.view.map((column) => {
                column.maxHeight = null;
                column.minHeight = null;
            });
        }
        else {
            this.tab.view.map((column) => {
                column.minHeight = column.header ? this.dom.height.inner - 50 : this.dom.height.inner;
                column.maxHeight = column.header ? this.dom.height.inner - 50 : this.dom.height.inner;
            });
        }
        // if( this.log.repo.enabled('dom', this.name) || this.extension.debug ) console.log(this.log.repo.message(`${this.name}:${this.tab.entityId}:_determineLayout:width:${this.dom.width.inner}: mobile: ${this.dom.state.mobile}`), this.log.repo.color('dom'));
    }
    /**
     * Determines if an event should cause a view reset
     * @param event
     */
    _needsPositionReset(event) {
        let position;
        if (this.tab.syncPositions) {
            // console.log('pass 1');
            if (event.config && event.config.metadata && event.config.metadata.position) {
                // console.log('pass 2');
                position = event.config.metadata.position;
                if (event.name === 'patch' && ['field', 'sidebyside', 'permissions'].includes(event.type)) {
                    // console.log('pass 3');
                    if (!this.tab.syncPositionFields || this.tab.syncPositionFields.includes(event.config.column)) {
                        // console.log('pass 4');
                        if (!IsObject(this.tab.syncPositionMap, true) || (position in this.tab.syncPositionMap && IsArray(this.tab.syncPositionMap[position]))) {
                            // console.log('pass 5');
                            if (IsObject(this.tab.syncPositionMap, true)) {
                                // console.log('pass 6');
                                if (IsArray(this.tab.syncPositionMap[position])) {
                                    // console.log('pass 7');
                                    this.tab.syncPositionMap[position].map((pos) => {
                                        this.onResetView(+pos);
                                    });
                                }
                                return true;
                            }
                            else {
                                this.onResetView();
                            }
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    /**
     * Allows for a pre built core to be passed in else it will build the core itself
     */
    _setCore() {
        return new Promise((resolve) => {
            if (!(IsObject(this.core, true))) {
                const tabCore = this.srv.tab.getCore();
                if (IsObject(tabCore, ['entity'])) {
                    this.core = tabCore;
                    this.log.info(`_setCore: initial`);
                    return resolve(true);
                }
                if (this.route.snapshot.data.core) {
                    this.core = IsObjectThrowError(this.route.snapshot.data.core, true, `${this.name}:: - this.route.snapshot.data.core`) ? this.route.snapshot.data.core : {};
                    this.log.info(`_setCore: route`);
                    return resolve(true);
                }
                const coreParams = this.srv.tab && this.srv.tab.ui && this.srv.tab.ui.entityParams ? this.srv.tab.ui.entityParams : {};
                if (IsObject(coreParams, true)) {
                    this.srv.entity.getCoreConfig(coreParams.internal_name, +coreParams.entity).then((core) => {
                        this.core = IsObjectThrowError(core, true, `${this.name}:: - core`) ? core : {};
                        this.log.info(`_setCore: tab params`);
                        return resolve(true);
                    });
                }
                else {
                    this.srv.entity.getCoreConfig(this.srv.entity.getRouteInternalName(this.route, this.extension), this.route.snapshot.params.entity).then((core) => {
                        this.core = IsObjectThrowError(core, true, `${this.name}:: - core`) ? core : null;
                        this.log.info(`_setCore: route internal _name`);
                        return resolve(true);
                    });
                }
            }
            else {
                return resolve(true);
            }
        });
    }
    /**
     * Allows for a pre built tab to be passed in else it will find try to find one
     */
    _setTab() {
        return new Promise((resolve) => {
            if (!(IsObject(this.tab, true))) {
                const tab = this.srv.tab.getTab();
                this.tab = IsObjectThrowError(tab, true, `${this.name}:_setTab: - tab`) ? tab : {};
                return resolve(true);
            }
            else {
                return resolve(true);
            }
        });
    }
    /**
     * Determine the structure of the tab view
     *
     */
    _buildTabView() {
        const view = [];
        //     console.log('this.tab.scheme', this.tab.scheme);
        if (this.tab.scheme && IsObject(this.asset.scheme, ['children'])) {
            //       console.log('should use the scheme provided', this.asset.scheme);
            const sections = this.asset.scheme.children;
            const sectionKeys = Object.keys(sections);
            const lastSectionKey = sectionKeys[sectionKeys.length - 1];
            let section;
            sectionKeys.map((sectionKey) => {
                section = sections[sectionKey];
                section.position = +sectionKey + 1;
                if (typeof section.flex === 'undefined') {
                    section.flex = +lastSectionKey === +sectionKey ? 2 : 1;
                }
                let height = +this.dom.height.outer;
                height = section.header ? (height - 50) : height;
                this.dom.repo.position[sectionKey] = {
                    height: height,
                };
                view.push({
                    id: sectionKey,
                    position: section.position,
                    reset: new Subject(),
                    components: this._getSchemeSectionAssetComponents(this.core, this.asset.scheme, section),
                    header: this._getHeaderText(section.name),
                    flex: section.flex,
                    minWidth: +sectionKey < 3 ? 350 : null,
                    maxWidth: +sectionKey < 2 ? 450 : null,
                    maxHeight: height,
                    active: true,
                });
            });
        }
        else {
            const positions = IsObjectThrowError(this.tab.positions, true, `${this.name}:configureDom: - this.tab.positions`) ? this.tab.positions : {};
            Object.keys(positions).map((position) => {
                let height = +this.dom.height.outer;
                height = this.tab.positions[position].header ? (height - 50) : height;
                this.dom.repo.position[position] = {
                    height: height,
                };
                view.push({
                    id: position,
                    position: position,
                    reset: new Subject(),
                    components: this.tab.positions[position].components,
                    extension: this.extension,
                    header: this._getHeaderText(this.tab.positions[position].header),
                    flex: this.tab.positions[position].flex,
                    maxWidth: this.tab.positions[position].max,
                    minWidth: this.tab.positions[position].min,
                    maxHeight: height,
                    active: true,
                });
            });
        }
        return view;
    }
    /**
     * Gather all the assets that should be rendered in a specific section
     * @param core
     * @param assets
     */
    _getSchemeSectionAssetComponents(core, scheme, section) {
        const componentList = [];
        const Field = this.dom.repo.ui.fields;
        // console.log('Field', Field);
        const tableFields = this._getSectionTableFieldsAssets(section);
        section.children = [...tableFields, ...(IsArray(section.children) ? section.children : [])];
        if (IsObject(section.mapping, ['sort_order'])) {
            section.children = section.children.sort(function (a, b) {
                const a1 = section.mapping.sort_order.indexOf(a.id);
                const a2 = section.mapping.sort_order.indexOf(b.id);
                if (a1 < a2)
                    return -1;
                if (a1 > a2)
                    return 1;
                return 0;
            });
        }
        section.children.map((child) => {
            if (String(String(child.asset_type).toLowerCase()).includes('field')) {
                child.asset_type = 'field';
            }
            else if (String(String(child.asset_type).toLowerCase()).includes('component')) {
                child.asset_type = 'component';
            }
            else if (String(String(child.asset_type).toLowerCase()).includes('widget')) {
                child.asset_type = 'widget';
            }
            if (child.asset_type && IsDefined(child.asset_id)) {
                switch (child.asset_type) {
                    case 'table': {
                        // console.log( 'table', child );
                        // const fieldItem = child.name ? Field.get( child.name ) : null;
                        // if( fieldItem ){
                        //   componentList.push( fieldItem );
                        // }
                        break;
                    }
                    case 'field': {
                        const field = Field.get(+child.asset_id);
                        if (field) {
                            componentList.push(scheme, field);
                        }
                        break;
                    }
                    case 'component': {
                        // ToDo:: Figure how custom components are going to be managed
                        const internalName = StorageGetter(child, ['asset', 'internal_name'], String(SpaceToSnake(child.name)).toLowerCase() + '_1');
                        const component = {
                            type: PopEntitySchemeCustomComponent,
                            inputs: {
                                core: core,
                                config: undefined,
                                componentId: child.asset_id,
                                internal_name: internalName
                            }
                        };
                        componentList.push(component);
                        break;
                    }
                    default:
                        // if( this.srv.log.enabled('error', this.name) ) console.log(this.srv.log.message(`${this.name}:getSchemeSectionAssetComponents`), this.srv.log.color('error'), asset);
                        break;
                }
            }
        });
        return componentList;
    }
    /**
     * Retrieve the default columns tht exist on an entity table
     * @param section
     */
    _getSectionTableFieldsAssets(section) {
        const tableAssets = [];
        if (this.core) {
            const Field = StorageGetter(this.core, 'repo.model.field'.split('.'));
            if (IsObject(Field, true)) {
                Object.values(Field).map((field) => {
                    if (!field.ancillary && field.position === section.position) {
                        tableAssets.push(new EntitySchemeSectionConfig({
                            id: 0,
                            name: field.model.name,
                            label: field.model.label,
                            asset_type: 'table',
                            asset_id: 0,
                            asset: field,
                            scheme_id: +section.id,
                            sort_order: field.sort,
                            position: section.position,
                        }));
                    }
                });
            }
        }
        section.startIndex = tableAssets.length;
        return tableAssets.sort((a, b) => {
            if (a.sort < b.sort)
                return -1;
            if (a.sort > b.sort)
                return 1;
            return 0;
        });
    }
}
PopEntityTabComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-tab',
                template: "<div class=\"pop-entity-tab-container\" [style.maxHeight.px]=dom.height.outer (window:resize)=\"onWindowResize();\" [ngClass]=\"{'sw-hidden': !dom.state.loaded, 'pop-entity-tab-container-wrap': tab?.wrap, 'pop-entity-tab-refresh':dom.state['refresh']}\">\n  <div class=\"import-flex-row-wrap\">\n    <div class=\"pop-entity-tab-column\"  [ngClass]=\"{'pop-entity-tab-column-wrap': tab.columnWrap}\" *ngFor=\"let col of tab?.view\" [style.flexGrow]=\"col.flex\" [style.maxWidth.px]=\"col.maxWidth\" [style.minWidth.px]=\"col.minWidth\">\n      <div class=\"pop-entity-tab-column-header\" *ngIf=\"col.header\">\n        <div class=\"sw-label-container-sm\">{{col.header}}</div>\n      </div>\n      <div class=\"pop-entity-tab-column-content pop-entity-tab-column-{{col.id}}\" [style.minHeight.px]=col.minHeight [style.maxHeight.px]=\"col.maxHeight\">\n        <lib-pop-entity-tab-column [core]=\"core\" [column]=col (events)=\"onBubbleEvent($event);\"></lib-pop-entity-tab-column>\n      </div>\n    </div>\n  </div>\n  <div class=\"pop-entity-tab-loader\" *ngIf=\"tab?.wrap\">\n    <mat-progress-bar *ngIf=\"dom.state['refresh']\" mode=\"indeterminate\"></mat-progress-bar>\n  </div>\n</div>\n<lib-pop-errors *ngIf=\"dom.error.code\" [error]=\"dom.error\"></lib-pop-errors>\n",
                styles: [".pop-entity-tab-container{flex:1 1 100%;height:100%;box-sizing:border-box}.pop-entity-tab-container-wrap{padding:30px 15px 15px;box-sizing:border-box}.pop-entity-tab-column-header{position:relative;height:50px;clear:both}.pop-entity-tab-column{position:relative;flex:1;box-sizing:border-box;display:flex;flex-flow:column;align-items:stretch;min-height:0}.pop-entity-tab-column-wrap{margin:0 15px}.pop-entity-tab-column-content{position:relative;overflow-x:hidden;flex:1 1 auto;padding-bottom:2px}.pop-entity-tab-loader{position:absolute;bottom:0;left:0;right:0;height:7px;clear:both;z-index:2;opacity:1!important}.pop-entity-tab-refresh{opacity:.5;pointer-events:none}"]
            },] }
];
PopEntityTabComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef },
    { type: ActivatedRoute },
    { type: PopTabMenuService },
    { type: PopDomService }
];
PopEntityTabComponent.propDecorators = {
    tab: [{ type: Input }],
    extension: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS10YWIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktdGFiL3BvcC1lbnRpdHktdGFiLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUNMLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsVUFBVSxFQUVWLEtBQUssRUFJTixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsY0FBYyxFQUFFLE1BQU0sRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNuRCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBRTdCLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBQzNFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ2hFLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLDhDQUE4QyxDQUFDO0FBRS9FLE9BQU8sRUFLTCxTQUFTLEVBQ1QsZUFBZSxFQUNoQixNQUFNLDJCQUEyQixDQUFDO0FBQ25DLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ2pFLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUNoRSxPQUFPLEVBQUMsc0JBQXNCLEVBQUUsZUFBZSxFQUEyQixNQUFNLHVCQUF1QixDQUFDO0FBQ3hHLE9BQU8sRUFDTCxXQUFXLEVBQ1gsT0FBTyxFQUNQLFNBQVMsRUFDVCxRQUFRLEVBQ1Isa0JBQWtCLEVBQ2xCLFFBQVEsRUFBc0IsWUFBWSxFQUMxQyxhQUFhLEVBQ2IsU0FBUyxFQUNWLE1BQU0sNkJBQTZCLENBQUM7QUFDckMsT0FBTyxFQUFDLHlC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LENBQUMsQ0FBQyxJQUFJO2dCQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzlCLE9BQU8sQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOzs7WUF4bEJGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsb0JBQW9CO2dCQUM5Qix1d0NBQThDOzthQUcvQzs7O1lBN0NDLFVBQVU7WUFGVixpQkFBaUI7WUFTWCxjQUFjO1lBTWQsaUJBQWlCO1lBV2pCLGFBQWE7OztrQkF1QmxCLEtBQUs7d0JBQ0wsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIEVsZW1lbnRSZWYsXG4gIEhvc3RMaXN0ZW5lcixcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QWN0aXZhdGVkUm91dGUsIFJvdXRlcn0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7TWF0RGlhbG9nfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtQb3BFbnRpdHlFdmVudFNlcnZpY2V9IGZyb20gJy4uL3NlcnZpY2VzL3BvcC1lbnRpdHktZXZlbnQuc2VydmljZSc7XG5pbXBvcnQge1BvcEVudGl0eVNlcnZpY2V9IGZyb20gJy4uL3NlcnZpY2VzL3BvcC1lbnRpdHkuc2VydmljZSc7XG5pbXBvcnQge1BvcFRhYk1lbnVTZXJ2aWNlfSBmcm9tICcuLi8uLi9iYXNlL3BvcC10YWItbWVudS9wb3AtdGFiLW1lbnUuc2VydmljZSc7XG5pbXBvcnQge1RhYkNvbmZpZ30gZnJvbSAnLi4vLi4vYmFzZS9wb3AtdGFiLW1lbnUvdGFiLW1lbnUubW9kZWwnO1xuaW1wb3J0IHtcbiAgQ29yZUNvbmZpZywgRHluYW1pY0NvbXBvbmVudEludGVyZmFjZSxcbiAgRW50aXR5RXh0ZW5kSW50ZXJmYWNlLFxuICBGaWVsZEludGVyZmFjZSxcbiAgUG9wQmFzZUV2ZW50SW50ZXJmYWNlLFxuICBQb3BQb3J0YWwsIFBvcFNjaGVtZUNvbXBvbmVudCwgU2NoZW1lQ29tcG9uZW50Q29uZmlnLFxuICBTZXJ2aWNlSW5qZWN0b3Jcbn0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQge1BvcEV4dGVuZENvbXBvbmVudH0gZnJvbSAnLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHtQb3BEb21TZXJ2aWNlfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlcy9wb3AtZG9tLnNlcnZpY2UnO1xuaW1wb3J0IHtJc1ZhbGlkRmllbGRQYXRjaEV2ZW50LCBQYXJzZU1vZGVsVmFsdWUsIFNlc3Npb25FbnRpdHlGaWVsZFVwZGF0ZX0gZnJvbSAnLi4vcG9wLWVudGl0eS11dGlsaXR5JztcbmltcG9ydCB7XG4gIENsZWFuT2JqZWN0LFxuICBJc0FycmF5LFxuICBJc0RlZmluZWQsXG4gIElzT2JqZWN0LFxuICBJc09iamVjdFRocm93RXJyb3IsXG4gIElzU3RyaW5nLCBTcGFjZVRvSHlwaGVuTG93ZXIsIFNwYWNlVG9TbmFrZSxcbiAgU3RvcmFnZUdldHRlcixcbiAgVGl0bGVDYXNlXG59IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQge0VudGl0eVNjaGVtZVNlY3Rpb25Db25maWcsIEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2V9IGZyb20gJy4uL3BvcC1lbnRpdHktc2NoZW1lL3BvcC1lbnRpdHktc2NoZW1lLm1vZGVsJztcbmltcG9ydCB7UG9wRW50aXR5U2NoZW1lQ3VzdG9tQ29tcG9uZW50fSBmcm9tICcuLi9wb3AtZW50aXR5LXNjaGVtZS9wb3AtZW50aXR5LXNjaGVtZS1jdXN0b20tY29tcG9uZW50L3BvcC1lbnRpdHktc2NoZW1lLWN1c3RvbS5jb21wb25lbnQnO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtZW50aXR5LXRhYicsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3AtZW50aXR5LXRhYi5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3BvcC1lbnRpdHktdGFiLmNvbXBvbmVudC5zY3NzJ10sXG5cbn0pXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5VGFiQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSB0YWI6IFRhYkNvbmZpZztcbiAgQElucHV0KCkgZXh0ZW5zaW9uOiBFbnRpdHlFeHRlbmRJbnRlcmZhY2U7IC8vIGFsbG93cyB0aGUgcm91dGUgdG8gb3ZlcnJpZGUgY2VydGFpbiBzZXR0aW5nc1xuXG4gIHB1YmxpYyBuYW1lID0gJ1BvcEVudGl0eVRhYkNvbXBvbmVudCc7XG5cbiAgcHJvdGVjdGVkIHNydiA9IHtcbiAgICBkaWFsb2c6IDxNYXREaWFsb2c+U2VydmljZUluamVjdG9yLmdldChNYXREaWFsb2cpLFxuICAgIHJvdXRlcjogPFJvdXRlcj5TZXJ2aWNlSW5qZWN0b3IuZ2V0KFJvdXRlciksXG4gICAgZXZlbnRzOiA8UG9wRW50aXR5RXZlbnRTZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoUG9wRW50aXR5RXZlbnRTZXJ2aWNlKSxcbiAgICBlbnRpdHk6IDxQb3BFbnRpdHlTZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoUG9wRW50aXR5U2VydmljZSksXG4gICAgdGFiOiA8UG9wVGFiTWVudVNlcnZpY2U+dW5kZWZpbmVkLFxuICB9O1xuXG4gIHByb3RlY3RlZCBhc3NldCA9IHtcbiAgICBzY2hlbWU6IDxFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlPnVuZGVmaW5lZCxcbiAgfTtcblxuXG4gIC8qKlxuICAgKiBAcGFyYW0gZWxcbiAgICogQHBhcmFtIGNkclxuICAgKiBAcGFyYW0gcm91dGVcbiAgICogQHBhcmFtIF90YWJSZXBvIC0gdHJhbnNmZXJcbiAgICogQHBhcmFtIF9kb21SZXBvIC0gdHJhbnNmZXJcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwdWJsaWMgY2RyOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBwdWJsaWMgcm91dGU6IEFjdGl2YXRlZFJvdXRlLFxuICAgIHByb3RlY3RlZCBfdGFiUmVwbzogUG9wVGFiTWVudVNlcnZpY2UsXG4gICAgcHJvdGVjdGVkIF9kb21SZXBvOiBQb3BEb21TZXJ2aWNlLFxuICApIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgICAvLyBSZXF1aXJlIGEgQ29yZUNvbmZpZ1xuICAgICAgICAvLyBQdWxsIGluIHRoZSByb3V0ZSBleHRlbnNpb24gc2V0dGluZ3NcbiAgICAgICAgaWYgKCF0aGlzLmV4dGVuc2lvbikgdGhpcy5leHRlbnNpb24gPSB7fTtcbiAgICAgICAgaWYgKHRoaXMucm91dGUuc25hcHNob3QuZGF0YSAmJiBPYmplY3Qua2V5cyh0aGlzLnJvdXRlLnNuYXBzaG90LmRhdGEpLmxlbmd0aCkge1xuICAgICAgICAgIE9iamVjdC5rZXlzKHRoaXMucm91dGUuc25hcHNob3QuZGF0YSkubWFwKChrZXkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZXh0ZW5zaW9uW2tleV0gPSB0aGlzLnJvdXRlLnNuYXBzaG90LmRhdGFba2V5XTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLmRvbS5wcm9jZWVkID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICAgIC8vIFJlcXVpcmUgYSBDb3JlQ29uZmlnXG4gICAgICAgIHRoaXMuX3NldENvcmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICBpZiAoIShJc09iamVjdCh0aGlzLmNvcmUuZW50aXR5LCBbJ2lkJ10pKSkgdGhpcy5zcnYucm91dGVyLm5hdmlnYXRlKFsnL3N5c3RlbS9yb3V0ZSddLCB7c2tpcExvY2F0aW9uQ2hhbmdlOiB0cnVlfSk7XG4gICAgICAgICAgLy8gIzE6IEVuZm9yY2UgYSBDb3JlQ29uZmlnICYmIFRhYkNvbmZpZ1xuICAgICAgICAgIC8vIHRoaXMuY29yZSA9IElzT2JqZWN0VGhyb3dFcnJvcih0aGlzLmNvcmUsIHRydWUsIGAke3RoaXMubmFtZX06Y29uZmlndXJlRG9tOiAtIHRoaXMuY29yZWApID8gdGhpcy5jb3JlIDogbnVsbDtcbiAgICAgICAgICB0aGlzLl9zZXRUYWIoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIHNldCB0aGUgb3V0ZXIgaGVpZ2h0IGJvdW5kYXJ5IG9mIHRoaXMgY29tcG9uZW50XG4gICAgICAgICAgICB0aGlzLmRvbS5vdmVyaGVhZCA9IHRoaXMudGFiLndyYXAgPyA0MCA6IDEwO1xuICAgICAgICAgICAgdGhpcy5kb20ub3ZlcmhlYWQgPSB0aGlzLnRhYi5vdmVyaGVhZCA/IHRoaXMuZG9tLm92ZXJoZWFkICsgdGhpcy50YWIub3ZlcmhlYWQgOiB0aGlzLmRvbS5vdmVyaGVhZDtcbiAgICAgICAgICAgIHRoaXMuZG9tLmhlaWdodC5kZWZhdWx0ID0gd2luZG93LmlubmVySGVpZ2h0IC0gNzA7XG4gICAgICAgICAgICB0aGlzLmRvbS5zZXRIZWlnaHQodGhpcy5kb20uaGVpZ2h0LmRlZmF1bHQsIDE1MCk7XG5cbiAgICAgICAgICAgIC8vICMzOiBTZXQgdGFiIGdyb3VwIGNvbnRhaW5lclxuICAgICAgICAgICAgdGhpcy50YWIuZ3JvdXBzID0ge307XG4gICAgICAgICAgICAvLyAjNDogVHJhbnNmZXIgaW4gdGhlIHVpIHJlc2NvdXJjZXNcbiAgICAgICAgICAgIC8vIGlmKCBJc09iamVjdCh0aGlzLmNvcmUuZW50aXR5LCB0cnVlKSAmJiBJc09iamVjdCh0aGlzLmNvcmUuZW50aXR5LnVpLCB0cnVlKSApe1xuICAgICAgICAgICAgLy8gICBPYmplY3Qua2V5cyh0aGlzLmNvcmUuZW50aXR5LnVpKS5tYXAoKGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAvLyAgICAgdGhpcy51aS5yZXNvdXJjZVsga2V5IF0gPSB0aGlzLmNvcmUuZW50aXR5LnVpWyBrZXkgXTsgLy8gPyBtYXliZSB0aGlzIHNob3VsZCBtYWtlIGEgY29weVxuICAgICAgICAgICAgLy8gICB9KTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vICM1OiBCdWlsZCBhIHZpZXcgd2l0aCBhIHNjaGVtZSBvciBhIG1vZGVsXG4gICAgICAgICAgICB0aGlzLmFzc2V0LnNjaGVtZSA9IElzT2JqZWN0KHRoaXMuY29yZS5lbnRpdHksIHRydWUpICYmIHRoaXMuY29yZS5lbnRpdHkuc2NoZW1lX2lkICYmIElzT2JqZWN0KHRoaXMuY29yZS5yZXNvdXJjZS5zY2hlbWUsIFsnZGF0YSddKSA/IDxFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlPkNsZWFuT2JqZWN0KHRoaXMuY29yZS5yZXNvdXJjZS5zY2hlbWUuZGF0YSkgOiBudWxsO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coICd0aGlzLmFzc2V0LnNjaGVtZScsIHRoaXMuYXNzZXQuc2NoZW1lICk7XG4gICAgICAgICAgICAvLyAjNjogQmluZCBFdmVudCBoYW5kbGVyc1xuICAgICAgICAgICAgdGhpcy5kb20uaGFuZGxlci5jb3JlID0gKGNvcmU6IENvcmVDb25maWcsIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UpID0+IHRoaXMuX2NvcmVFdmVudEhhbmRsZXIoZXZlbnQpO1xuICAgICAgICAgICAgLy8gIzc6IEJ1aWxkIHRoZSB2aWV3XG4gICAgICAgICAgICB0aGlzLnRhYi52aWV3ID0gdGhpcy5fYnVpbGRUYWJWaWV3KCk7XG4gICAgICAgICAgICAvLyAjODogUmVnaXN0ZXIgdGhlIG91dGxldCBzbyB0aGUgdGFiUmVwbyBjYW4gcmVzZXQgdGhlIHZpZXcgaWYgbmVlZGVkXG4gICAgICAgICAgICBpZiAodHJ1ZSB8fCB0aGlzLnRhYi5zeW5jUG9zaXRpb25zKSB0aGlzLnNydi50YWIucmVnaXN0ZXJPdXRsZXRSZXNldCgocG9zaXRpb246IG51bWJlciA9IG51bGwpID0+IHRoaXMub25SZXNldFZpZXcocG9zaXRpb24pKTtcbiAgICAgICAgICAgIHRoaXMuX2NhbGxPbkxvYWRFdmVudCgpO1xuXG4gICAgICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBkZXRlcm1pbmUtbGF5b3V0YCwgKCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLl9kZXRlcm1pbmVMYXlvdXQoKTtcbiAgICAgICAgICAgIH0sIDApO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5kb20udW5sb2FkID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHRoaXMuc3J2LnRhYi5zaG93QXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogU2V0dXAgdGhpcyBjb21wb25lbnRcbiAgICovXG4gIG5nT25Jbml0KCkge1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBCdWJibGUgZXZlbnQgaGFuZGxlclxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uQnViYmxlRXZlbnQoZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSkge1xuICAgIHRoaXMubG9nLmV2ZW50KGBvbkJ1YmJsZUV2ZW50YCwgZXZlbnQpO1xuICAgIGlmIChldmVudC50eXBlID09PSAnZmllbGRfZ3JvdXAnICYmIGV2ZW50Lm5hbWUgPT09ICdpbml0Jykge1xuICAgICAgdGhpcy50YWIuZ3JvdXBzW2V2ZW50LmlkXSA9IGV2ZW50Lmdyb3VwO1xuICAgICAgdGhpcy5fY2FsbE9uRXZlbnQoZXZlbnQsIHtyZXNldDogdHJ1ZX0pO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQudHlwZSA9PT0gJ3NpZGVieXNpZGUnICYmIGV2ZW50Lm5hbWUgPT09ICdwb3J0YWwnKSB7XG4gICAgICBjb25zdCBlbnRpdHlQYXJhbXMgPSB0aGlzLnNydi5lbnRpdHkuZ2V0RW50aXR5UGFyYW1zV2l0aFBhdGgoU3RyaW5nKGV2ZW50LmRhdGEpLnNwbGl0KCcvJylbMF0sICtTdHJpbmcoZXZlbnQuZGF0YSkuc3BsaXQoJy8nKVsxXSk7XG4gICAgICBpZiAoZW50aXR5UGFyYW1zKSB7XG4gICAgICAgIHRoaXMub25WaWV3RW50aXR5UG9ydGFsKGVudGl0eVBhcmFtcy5pbnRlcm5hbF9uYW1lLCBlbnRpdHlQYXJhbXMuZW50aXR5SWQpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoSXNWYWxpZEZpZWxkUGF0Y2hFdmVudCh0aGlzLmNvcmUsIGV2ZW50KSkge1xuICAgICAgdGhpcy5sb2cuZXZlbnQoYElzVmFsaWRGaWVsZFBhdGNoRXZlbnRgLCBldmVudCk7XG4gICAgICBpZiAoZXZlbnQuY29uZmlnLm5hbWUgPT09ICduYW1lJyB8fCBldmVudC5jb25maWcubmFtZSA9PT0gJ2xhYmVsJykge1xuICAgICAgICB0aGlzLnNydi50YWIudXBkYXRlTmFtZShldmVudC5jb25maWcuY29udHJvbC52YWx1ZSk7XG4gICAgICB9XG4gICAgICBjb25zdCByZXNldCA9IHRoaXMuX25lZWRzUG9zaXRpb25SZXNldChldmVudCk7XG4gICAgICBpZiAoIXJlc2V0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy50YWIub25FdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMuX2NhbGxPbkV2ZW50KGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnRhYi5vbkV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhpcy5fY2FsbE9uRXZlbnQoZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3J2LmV2ZW50cy5zZW5kRXZlbnQoZXZlbnQpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZXZlbnQudHlwZSA9PT0gJ2NvbnRleHRfbWVudScpIHtcbiAgICAgIGlmIChldmVudC5uYW1lID09PSAncG9ydGFsJyAmJiBldmVudC5pbnRlcm5hbF9uYW1lICYmIGV2ZW50LmlkKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMub25WaWV3RW50aXR5UG9ydGFsKGV2ZW50LmludGVybmFsX25hbWUsICtldmVudC5pZCk7XG4gICAgICAgIH0sIDApO1xuXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChldmVudC50eXBlID09PSAnZG9tJykge1xuICAgICAgaWYgKGV2ZW50Lm5hbWUgPT09ICdyZWZyZXNoJykge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLm9uUmVzZXRWaWV3KCtldmVudC5wb3NpdGlvbik7XG4gICAgICAgIH0sIDApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIHdoZW4gdGhlIHdpbmRvdyBpcyByZXNpemVkXG4gICAqL1xuICBvbldpbmRvd1Jlc2l6ZSgpIHtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCd3aW5kb3ctcmVzaXplJywgKCkgPT4ge1xuICAgICAgdGhpcy5fZGV0ZXJtaW5lTGF5b3V0KCk7XG4gICAgICB0aGlzLnNydi50YWIucmVzZXRUYWIoKTtcblxuICAgIH0sIDUwMCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyB3aGVuIGEgdXNlciBjbGlja3Mgb24gYW4gZW50aXR5SWQgbGluayB0byBzZWUgdGhlIGRldGFpbHMgb2YgdGhhdCBlbnRpdHlJZCBpbiBhIG1vZGFsXG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSBpZFxuICAgKi9cbiAgb25WaWV3RW50aXR5UG9ydGFsKGludGVybmFsTmFtZTogc3RyaW5nLCBlbnRpdHlJZDogbnVtYmVyKSB7XG4gICAgLy8gVG9Ebzo6IER1ZSB0byBjaXJjdWxhciBpbmplY3Rpb24gZXJyb3JzLCB0aGUgcG9ydGFscyBhcmUgbm90IHdvcmtpbmdcbiAgICB0aGlzLnRhYi52aWV3Lm1hcCgoY29sdW1uKSA9PiB7XG4gICAgICBjb2x1bW4ucmVzZXQubmV4dCgnc2Nyb2xsVG9wJyk7XG4gICAgfSk7XG5cbiAgICAvLyB0aGlzLnNydi5yb3V0ZXIubmF2aWdhdGVCeVVybChgZW50aXRpZXMvZmllbGRzLyR7ZW50aXR5SWR9YCkuY2F0Y2goZSA9PiB0cnVlKTtcbiAgICBQb3BQb3J0YWwudmlldyhpbnRlcm5hbE5hbWUsIGVudGl0eUlkKS50aGVuKChjaGFuZ2VkOiBib29sZWFuKSA9PiB7XG4gICAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICB0aGlzLmRvbS5yZWZyZXNoaW5nKCk7XG4gICAgICAgIHRoaXMuc3J2LnRhYi5yZWZyZXNoRW50aXR5KHRoaXMuY29yZS5wYXJhbXMuZW50aXR5SWQsIHRoaXMuZG9tLnJlcG8sIHt9LCAnUG9wRW50aXR5VGFiQ29tcG9uZW50OnZpZXdFbnRpdHlQb3J0YWwnKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICB0aGlzLmRvbS5yZWFkeSgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgdG8gcmVzZXQgdGhlIHZpZXdcbiAgICogQHBhcmFtIHBvc2l0aW9uXG4gICAqL1xuICBvblJlc2V0Vmlldyhwb3NpdGlvbjogbnVtYmVyID0gbnVsbCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRvbS5zdGF0ZS5sb2FkZWQpIHtcbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLnRhYi52aWV3Lm1hcCgoc2VjdGlvbikgPT4ge1xuICAgICAgICAgIHNlY3Rpb24ucmVzZXQubmV4dCh0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRhYi52aWV3W3Bvc2l0aW9uXS5yZXNldC5uZXh0KHRydWUpO1xuICAgICAgfVxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZG9tLnJlYWR5KCk7XG4gICAgICB9LCAwKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDbGVhbiB1cCB0aGUgZG9tIG9mIHRoaXMgY29tcG9uZW50XG4gICAqL1xuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9jYWxsVW5sb2FkRXZlbnQoKTtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVuZGVyIFRoZSBIb29kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJvdGVjdGVkIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gIC8qKlxuICAgKiBUaWUgaW4gaG9vayB0aGF0IGlzIGNhbGxlZCB3aGVuIGV2ZXIgYSBldmVudCBpZiBmaXJlZFxuICAgKlxuICAgKi9cbiAgcHJpdmF0ZSBfY2FsbE9uRXZlbnQoZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSwgb3B0aW9uczogeyByZXNldD86IGJvb2xlYW4sIGVudGl0eUNvbmZpZz86IGJvb2xlYW4gfSA9IHt9KSB7XG4gICAgaWYgKHRoaXMudGFiICYmIHR5cGVvZiB0aGlzLnRhYi5vbkV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBldmVudC50YWIgPSB0aGlzLnRhYjtcbiAgICAgIC8vIGV2ZW50LmNvbXBvbmVudCA9IGNvbXBvbmVudDtcbiAgICAgIC8vIGV2ZW50LmNvcmUgPSB0aGlzLmNvcmU7XG4gICAgICBpZiAob3B0aW9ucy5yZXNldCkgZXZlbnQuY2RyID0gdGhpcy5jZHI7XG4gICAgICB0aGlzLnRhYi5vbkV2ZW50LmJpbmQodGhpcykodGhpcy5jb3JlLCBldmVudCk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVGllIGluIGhvb2sgdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgdGFiIGlzIGluaXRpYWxpemVkXG4gICAqXG4gICAqL1xuICBwcml2YXRlIF9jYWxsT25Mb2FkRXZlbnQoKSB7XG4gICAgaWYgKHRoaXMudGFiICYmIHR5cGVvZiB0aGlzLnRhYi5vbkxvYWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMudGFiLm9uTG9hZC5iaW5kKHRoaXMpKHRoaXMuY29yZSwgdGhpcy50YWIpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRpZSBpbiBob29rIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIHRhYiBpcyBkZXN0cm95ZWRcbiAgICpcbiAgICovXG4gIHByaXZhdGUgX2NhbGxVbmxvYWRFdmVudCgpIHtcbiAgICBpZiAodGhpcy50YWIgJiYgdHlwZW9mIHRoaXMudGFiLm9uVW5sb2FkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLnRhYi5vblVubG9hZC5iaW5kKHRoaXMpKHRoaXMuY29yZSwgdGhpcy50YWIpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW50aW9uIHRvIGRldGVybWluZSB0aGUgY29ycmVjdCBoZWFkZXIgdG8gZGlzcGxheVxuICAgKiBAcGFyYW0gaGVhZGVyXG4gICAqL1xuICBwcml2YXRlIF9nZXRIZWFkZXJUZXh0KGhlYWRlcjogc3RyaW5nKSB7XG4gICAgaWYgKElzU3RyaW5nKGhlYWRlciwgdHJ1ZSkpIHtcbiAgICAgIHJldHVybiBUaXRsZUNhc2UoUGFyc2VNb2RlbFZhbHVlKGhlYWRlciwgdGhpcy5jb3JlKS5yZXBsYWNlKC9fL2csICcgJykpLnRyaW0oKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDb3JlIEV2ZW50IEhhbmRsZXJcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuICBwcml2YXRlIF9jb3JlRXZlbnRIYW5kbGVyKGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UpIHtcbiAgICB0aGlzLmxvZy5ldmVudChgX2NvcmVFdmVudEhhbmRsZXJgLCBldmVudCk7XG4gICAgaWYgKHRoaXMudGFiLndyYXAgJiYgZXZlbnQudHlwZSA9PT0gJ2NvbXBvbmVudCcpIHtcbiAgICAgIGlmIChldmVudC5uYW1lID09PSAnc3RhcnQtcmVmcmVzaCcpIHtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUucmVmcmVzaCA9IDE7XG4gICAgICB9IGVsc2UgaWYgKGV2ZW50Lm5hbWUgPT09ICdzdG9wLXJlZnJlc2gnKSB7XG4gICAgICAgIHRoaXMuZG9tLnN0YXRlLnJlZnJlc2ggPSAwO1xuICAgICAgfSBlbHNlIGlmIChldmVudC5uYW1lID09PSAncmVzZXQtdmlldycpIHtcbiAgICAgICAgdGhpcy5vblJlc2V0VmlldygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIERldGVjdHMgaWYgYSBtb2JpbGUgbGF5b3V0IHNob3VsZCBiZSB1c2VkIGJhc2VkIG9uIHRoZSB3aWR0aCBvZiB0aGUgc2NyZWVuXG4gICAqL1xuICBwcml2YXRlIF9kZXRlcm1pbmVMYXlvdXQoKSB7XG5cbiAgICBjb25zdCBjbGllbnQgPSB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgdGhpcy5kb20ud2lkdGguaW5uZXIgPSBjbGllbnQud2lkdGg7XG4gICAgdGhpcy5kb20uc3RhdGUubW9iaWxlID0gdGhpcy5kb20ud2lkdGguaW5uZXIgPD0gMTM0MCA/IHRydWUgOiBmYWxzZTtcbiAgICBpZiAodGhpcy5kb20uc3RhdGUubW9iaWxlKSB7XG4gICAgICB0aGlzLnRhYi52aWV3Lm1hcCgoY29sdW1uKSA9PiB7XG4gICAgICAgIGNvbHVtbi5tYXhIZWlnaHQgPSBudWxsO1xuICAgICAgICBjb2x1bW4ubWluSGVpZ2h0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRhYi52aWV3Lm1hcCgoY29sdW1uKSA9PiB7XG4gICAgICAgIGNvbHVtbi5taW5IZWlnaHQgPSBjb2x1bW4uaGVhZGVyID8gdGhpcy5kb20uaGVpZ2h0LmlubmVyIC0gNTAgOiB0aGlzLmRvbS5oZWlnaHQuaW5uZXI7XG4gICAgICAgIGNvbHVtbi5tYXhIZWlnaHQgPSBjb2x1bW4uaGVhZGVyID8gdGhpcy5kb20uaGVpZ2h0LmlubmVyIC0gNTAgOiB0aGlzLmRvbS5oZWlnaHQuaW5uZXI7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8gaWYoIHRoaXMubG9nLnJlcG8uZW5hYmxlZCgnZG9tJywgdGhpcy5uYW1lKSB8fCB0aGlzLmV4dGVuc2lvbi5kZWJ1ZyApIGNvbnNvbGUubG9nKHRoaXMubG9nLnJlcG8ubWVzc2FnZShgJHt0aGlzLm5hbWV9OiR7dGhpcy50YWIuZW50aXR5SWR9Ol9kZXRlcm1pbmVMYXlvdXQ6d2lkdGg6JHt0aGlzLmRvbS53aWR0aC5pbm5lcn06IG1vYmlsZTogJHt0aGlzLmRvbS5zdGF0ZS5tb2JpbGV9YCksIHRoaXMubG9nLnJlcG8uY29sb3IoJ2RvbScpKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgYW4gZXZlbnQgc2hvdWxkIGNhdXNlIGEgdmlldyByZXNldFxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIHByaXZhdGUgX25lZWRzUG9zaXRpb25SZXNldChldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlKTogYm9vbGVhbiB7XG4gICAgbGV0IHBvc2l0aW9uO1xuICAgIGlmICh0aGlzLnRhYi5zeW5jUG9zaXRpb25zKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZygncGFzcyAxJyk7XG4gICAgICBpZiAoZXZlbnQuY29uZmlnICYmIGV2ZW50LmNvbmZpZy5tZXRhZGF0YSAmJiBldmVudC5jb25maWcubWV0YWRhdGEucG9zaXRpb24pIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3Bhc3MgMicpO1xuICAgICAgICBwb3NpdGlvbiA9IGV2ZW50LmNvbmZpZy5tZXRhZGF0YS5wb3NpdGlvbjtcbiAgICAgICAgaWYgKGV2ZW50Lm5hbWUgPT09ICdwYXRjaCcgJiYgWydmaWVsZCcsICdzaWRlYnlzaWRlJywgJ3Blcm1pc3Npb25zJ10uaW5jbHVkZXMoZXZlbnQudHlwZSkpIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygncGFzcyAzJyk7XG4gICAgICAgICAgaWYgKCF0aGlzLnRhYi5zeW5jUG9zaXRpb25GaWVsZHMgfHwgdGhpcy50YWIuc3luY1Bvc2l0aW9uRmllbGRzLmluY2x1ZGVzKGV2ZW50LmNvbmZpZy5jb2x1bW4pKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygncGFzcyA0Jyk7XG4gICAgICAgICAgICBpZiAoIUlzT2JqZWN0KHRoaXMudGFiLnN5bmNQb3NpdGlvbk1hcCwgdHJ1ZSkgfHwgKHBvc2l0aW9uIGluIHRoaXMudGFiLnN5bmNQb3NpdGlvbk1hcCAmJiBJc0FycmF5KHRoaXMudGFiLnN5bmNQb3NpdGlvbk1hcFtwb3NpdGlvbl0pKSkge1xuICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygncGFzcyA1Jyk7XG4gICAgICAgICAgICAgIGlmIChJc09iamVjdCh0aGlzLnRhYi5zeW5jUG9zaXRpb25NYXAsIHRydWUpKSB7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3Bhc3MgNicpO1xuICAgICAgICAgICAgICAgIGlmIChJc0FycmF5KHRoaXMudGFiLnN5bmNQb3NpdGlvbk1hcFtwb3NpdGlvbl0pKSB7XG4gICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygncGFzcyA3Jyk7XG4gICAgICAgICAgICAgICAgICB0aGlzLnRhYi5zeW5jUG9zaXRpb25NYXBbcG9zaXRpb25dLm1hcCgocG9zKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25SZXNldFZpZXcoK3Bvcyk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblJlc2V0VmlldygpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEFsbG93cyBmb3IgYSBwcmUgYnVpbHQgY29yZSB0byBiZSBwYXNzZWQgaW4gZWxzZSBpdCB3aWxsIGJ1aWxkIHRoZSBjb3JlIGl0c2VsZlxuICAgKi9cbiAgX3NldENvcmUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoIShJc09iamVjdCh0aGlzLmNvcmUsIHRydWUpKSkge1xuXG4gICAgICAgIGNvbnN0IHRhYkNvcmUgPSB0aGlzLnNydi50YWIuZ2V0Q29yZSgpO1xuICAgICAgICBpZiAoSXNPYmplY3QodGFiQ29yZSwgWydlbnRpdHknXSkpIHtcbiAgICAgICAgICB0aGlzLmNvcmUgPSB0YWJDb3JlO1xuICAgICAgICAgIHRoaXMubG9nLmluZm8oYF9zZXRDb3JlOiBpbml0aWFsYCk7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5yb3V0ZS5zbmFwc2hvdC5kYXRhLmNvcmUpIHtcbiAgICAgICAgICB0aGlzLmNvcmUgPSBJc09iamVjdFRocm93RXJyb3IodGhpcy5yb3V0ZS5zbmFwc2hvdC5kYXRhLmNvcmUsIHRydWUsIGAke3RoaXMubmFtZX06OiAtIHRoaXMucm91dGUuc25hcHNob3QuZGF0YS5jb3JlYCkgPyA8Q29yZUNvbmZpZz50aGlzLnJvdXRlLnNuYXBzaG90LmRhdGEuY29yZSA6IDxDb3JlQ29uZmlnPnt9O1xuICAgICAgICAgIHRoaXMubG9nLmluZm8oYF9zZXRDb3JlOiByb3V0ZWApO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29yZVBhcmFtcyA9IHRoaXMuc3J2LnRhYiAmJiB0aGlzLnNydi50YWIudWkgJiYgdGhpcy5zcnYudGFiLnVpLmVudGl0eVBhcmFtcyA/IHRoaXMuc3J2LnRhYi51aS5lbnRpdHlQYXJhbXMgOiB7fTtcbiAgICAgICAgaWYgKElzT2JqZWN0KGNvcmVQYXJhbXMsIHRydWUpKSB7XG4gICAgICAgICAgdGhpcy5zcnYuZW50aXR5LmdldENvcmVDb25maWcoY29yZVBhcmFtcy5pbnRlcm5hbF9uYW1lLCArY29yZVBhcmFtcy5lbnRpdHkpLnRoZW4oKGNvcmU6IENvcmVDb25maWcpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29yZSA9IElzT2JqZWN0VGhyb3dFcnJvcihjb3JlLCB0cnVlLCBgJHt0aGlzLm5hbWV9OjogLSBjb3JlYCkgPyBjb3JlIDogPENvcmVDb25maWc+e307XG4gICAgICAgICAgICB0aGlzLmxvZy5pbmZvKGBfc2V0Q29yZTogdGFiIHBhcmFtc2ApO1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zcnYuZW50aXR5LmdldENvcmVDb25maWcodGhpcy5zcnYuZW50aXR5LmdldFJvdXRlSW50ZXJuYWxOYW1lKHRoaXMucm91dGUsIHRoaXMuZXh0ZW5zaW9uKSwgdGhpcy5yb3V0ZS5zbmFwc2hvdC5wYXJhbXMuZW50aXR5KS50aGVuKChjb3JlOiBDb3JlQ29uZmlnKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvcmUgPSBJc09iamVjdFRocm93RXJyb3IoY29yZSwgdHJ1ZSwgYCR7dGhpcy5uYW1lfTo6IC0gY29yZWApID8gY29yZSA6IG51bGw7XG4gICAgICAgICAgICB0aGlzLmxvZy5pbmZvKGBfc2V0Q29yZTogcm91dGUgaW50ZXJuYWwgX25hbWVgKTtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEFsbG93cyBmb3IgYSBwcmUgYnVpbHQgdGFiIHRvIGJlIHBhc3NlZCBpbiBlbHNlIGl0IHdpbGwgZmluZCB0cnkgdG8gZmluZCBvbmVcbiAgICovXG4gIF9zZXRUYWIoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoIShJc09iamVjdCh0aGlzLnRhYiwgdHJ1ZSkpKSB7XG4gICAgICAgIGNvbnN0IHRhYiA9IHRoaXMuc3J2LnRhYi5nZXRUYWIoKTtcbiAgICAgICAgdGhpcy50YWIgPSBJc09iamVjdFRocm93RXJyb3IodGFiLCB0cnVlLCBgJHt0aGlzLm5hbWV9Ol9zZXRUYWI6IC0gdGFiYCkgPyB0YWIgOiB7fTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIERldGVybWluZSB0aGUgc3RydWN0dXJlIG9mIHRoZSB0YWIgdmlld1xuICAgKlxuICAgKi9cbiAgX2J1aWxkVGFiVmlldygpOiBhbnlbXSB7XG4gICAgY29uc3QgdmlldyA9IFtdO1xuLy8gICAgIGNvbnNvbGUubG9nKCd0aGlzLnRhYi5zY2hlbWUnLCB0aGlzLnRhYi5zY2hlbWUpO1xuICAgIGlmICh0aGlzLnRhYi5zY2hlbWUgJiYgSXNPYmplY3QodGhpcy5hc3NldC5zY2hlbWUsIFsnY2hpbGRyZW4nXSkpIHtcbi8vICAgICAgIGNvbnNvbGUubG9nKCdzaG91bGQgdXNlIHRoZSBzY2hlbWUgcHJvdmlkZWQnLCB0aGlzLmFzc2V0LnNjaGVtZSk7XG4gICAgICBjb25zdCBzZWN0aW9ucyA9IHRoaXMuYXNzZXQuc2NoZW1lLmNoaWxkcmVuO1xuICAgICAgY29uc3Qgc2VjdGlvbktleXMgPSBPYmplY3Qua2V5cyhzZWN0aW9ucyk7XG4gICAgICBjb25zdCBsYXN0U2VjdGlvbktleSA9IHNlY3Rpb25LZXlzW3NlY3Rpb25LZXlzLmxlbmd0aCAtIDFdO1xuICAgICAgbGV0IHNlY3Rpb247XG4gICAgICBzZWN0aW9uS2V5cy5tYXAoKHNlY3Rpb25LZXkpID0+IHtcbiAgICAgICAgc2VjdGlvbiA9IHNlY3Rpb25zW3NlY3Rpb25LZXldO1xuICAgICAgICBzZWN0aW9uLnBvc2l0aW9uID0gK3NlY3Rpb25LZXkgKyAxO1xuICAgICAgICBpZiAodHlwZW9mIHNlY3Rpb24uZmxleCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBzZWN0aW9uLmZsZXggPSArbGFzdFNlY3Rpb25LZXkgPT09ICtzZWN0aW9uS2V5ID8gMiA6IDE7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGhlaWdodCA9ICt0aGlzLmRvbS5oZWlnaHQub3V0ZXI7XG4gICAgICAgIGhlaWdodCA9IHNlY3Rpb24uaGVhZGVyID8gKGhlaWdodCAtIDUwKSA6IGhlaWdodDtcblxuICAgICAgICB0aGlzLmRvbS5yZXBvLnBvc2l0aW9uW3NlY3Rpb25LZXldID0ge1xuICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICB9O1xuXG4gICAgICAgIHZpZXcucHVzaCh7XG4gICAgICAgICAgaWQ6IHNlY3Rpb25LZXksXG4gICAgICAgICAgcG9zaXRpb246IHNlY3Rpb24ucG9zaXRpb24sXG4gICAgICAgICAgcmVzZXQ6IG5ldyBTdWJqZWN0KCksXG4gICAgICAgICAgY29tcG9uZW50czogdGhpcy5fZ2V0U2NoZW1lU2VjdGlvbkFzc2V0Q29tcG9uZW50cyh0aGlzLmNvcmUsIHRoaXMuYXNzZXQuc2NoZW1lLCBzZWN0aW9uKSxcbiAgICAgICAgICBoZWFkZXI6IHRoaXMuX2dldEhlYWRlclRleHQoc2VjdGlvbi5uYW1lKSxcbiAgICAgICAgICBmbGV4OiBzZWN0aW9uLmZsZXgsXG4gICAgICAgICAgbWluV2lkdGg6ICtzZWN0aW9uS2V5IDwgMyA/IDM1MCA6IG51bGwsXG4gICAgICAgICAgbWF4V2lkdGg6ICtzZWN0aW9uS2V5IDwgMiA/IDQ1MCA6IG51bGwsXG4gICAgICAgICAgbWF4SGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwb3NpdGlvbnMgPSBJc09iamVjdFRocm93RXJyb3IodGhpcy50YWIucG9zaXRpb25zLCB0cnVlLCBgJHt0aGlzLm5hbWV9OmNvbmZpZ3VyZURvbTogLSB0aGlzLnRhYi5wb3NpdGlvbnNgKSA/IHRoaXMudGFiLnBvc2l0aW9ucyA6IHt9O1xuICAgICAgT2JqZWN0LmtleXMocG9zaXRpb25zKS5tYXAoKHBvc2l0aW9uKSA9PiB7XG4gICAgICAgIGxldCBoZWlnaHQgPSArdGhpcy5kb20uaGVpZ2h0Lm91dGVyO1xuICAgICAgICBoZWlnaHQgPSB0aGlzLnRhYi5wb3NpdGlvbnNbcG9zaXRpb25dLmhlYWRlciA/IChoZWlnaHQgLSA1MCkgOiBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5kb20ucmVwby5wb3NpdGlvbltwb3NpdGlvbl0gPSB7XG4gICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgIH07XG5cbiAgICAgICAgdmlldy5wdXNoKHtcbiAgICAgICAgICBpZDogcG9zaXRpb24sXG4gICAgICAgICAgcG9zaXRpb246IHBvc2l0aW9uLFxuICAgICAgICAgIHJlc2V0OiBuZXcgU3ViamVjdCgpLFxuICAgICAgICAgIGNvbXBvbmVudHM6IHRoaXMudGFiLnBvc2l0aW9uc1twb3NpdGlvbl0uY29tcG9uZW50cyxcbiAgICAgICAgICBleHRlbnNpb246IHRoaXMuZXh0ZW5zaW9uLFxuICAgICAgICAgIGhlYWRlcjogdGhpcy5fZ2V0SGVhZGVyVGV4dCh0aGlzLnRhYi5wb3NpdGlvbnNbcG9zaXRpb25dLmhlYWRlciksXG4gICAgICAgICAgZmxleDogdGhpcy50YWIucG9zaXRpb25zW3Bvc2l0aW9uXS5mbGV4LFxuICAgICAgICAgIG1heFdpZHRoOiB0aGlzLnRhYi5wb3NpdGlvbnNbcG9zaXRpb25dLm1heCxcbiAgICAgICAgICBtaW5XaWR0aDogdGhpcy50YWIucG9zaXRpb25zW3Bvc2l0aW9uXS5taW4sXG4gICAgICAgICAgbWF4SGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB2aWV3O1xuICB9XG5cblxuICAvKipcbiAgICogR2F0aGVyIGFsbCB0aGUgYXNzZXRzIHRoYXQgc2hvdWxkIGJlIHJlbmRlcmVkIGluIGEgc3BlY2lmaWMgc2VjdGlvblxuICAgKiBAcGFyYW0gY29yZVxuICAgKiBAcGFyYW0gYXNzZXRzXG4gICAqL1xuICBwcml2YXRlIF9nZXRTY2hlbWVTZWN0aW9uQXNzZXRDb21wb25lbnRzKGNvcmU6IENvcmVDb25maWcsIHNjaGVtZTogRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSwgc2VjdGlvbjogRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSkge1xuXG4gICAgY29uc3QgY29tcG9uZW50TGlzdCA9IFtdO1xuICAgIGNvbnN0IEZpZWxkID0gdGhpcy5kb20ucmVwby51aS5maWVsZHM7XG4gICAgLy8gY29uc29sZS5sb2coJ0ZpZWxkJywgRmllbGQpO1xuICAgIGNvbnN0IHRhYmxlRmllbGRzID0gdGhpcy5fZ2V0U2VjdGlvblRhYmxlRmllbGRzQXNzZXRzKHNlY3Rpb24pO1xuICAgIHNlY3Rpb24uY2hpbGRyZW4gPSBbLi4udGFibGVGaWVsZHMsIC4uLihJc0FycmF5KHNlY3Rpb24uY2hpbGRyZW4pID8gc2VjdGlvbi5jaGlsZHJlbiA6IFtdKV07XG4gICAgaWYoSXNPYmplY3Qoc2VjdGlvbi5tYXBwaW5nLCBbJ3NvcnRfb3JkZXInXSkpe1xuICAgICAgc2VjdGlvbi5jaGlsZHJlbiA9IHNlY3Rpb24uY2hpbGRyZW4uc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICBjb25zdCBhMSA9IHNlY3Rpb24ubWFwcGluZy5zb3J0X29yZGVyLmluZGV4T2YoYS5pZCk7XG4gICAgICAgIGNvbnN0IGEyID0gc2VjdGlvbi5tYXBwaW5nLnNvcnRfb3JkZXIuaW5kZXhPZihiLmlkKTtcbiAgICAgICAgaWYgKGExIDwgYTIpIHJldHVybiAtMTtcbiAgICAgICAgaWYgKGExID4gYTIpIHJldHVybiAxO1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH0pO1xuICAgIH1cblxuXG5cbiAgICBzZWN0aW9uLmNoaWxkcmVuLm1hcCgoY2hpbGQpID0+IHtcbiAgICAgIGlmIChTdHJpbmcoU3RyaW5nKGNoaWxkLmFzc2V0X3R5cGUpLnRvTG93ZXJDYXNlKCkpLmluY2x1ZGVzKCdmaWVsZCcpKSB7XG4gICAgICAgIGNoaWxkLmFzc2V0X3R5cGUgPSAnZmllbGQnO1xuICAgICAgfSBlbHNlIGlmIChTdHJpbmcoU3RyaW5nKGNoaWxkLmFzc2V0X3R5cGUpLnRvTG93ZXJDYXNlKCkpLmluY2x1ZGVzKCdjb21wb25lbnQnKSkge1xuICAgICAgICBjaGlsZC5hc3NldF90eXBlID0gJ2NvbXBvbmVudCc7XG4gICAgICB9IGVsc2UgaWYgKFN0cmluZyhTdHJpbmcoY2hpbGQuYXNzZXRfdHlwZSkudG9Mb3dlckNhc2UoKSkuaW5jbHVkZXMoJ3dpZGdldCcpKSB7XG4gICAgICAgIGNoaWxkLmFzc2V0X3R5cGUgPSAnd2lkZ2V0JztcbiAgICAgIH1cbiAgICAgIGlmIChjaGlsZC5hc3NldF90eXBlICYmIElzRGVmaW5lZChjaGlsZC5hc3NldF9pZCkpIHtcbiAgICAgICAgc3dpdGNoIChjaGlsZC5hc3NldF90eXBlKSB7XG4gICAgICAgICAgY2FzZSAndGFibGUnOiB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyggJ3RhYmxlJywgY2hpbGQgKTtcbiAgICAgICAgICAgIC8vIGNvbnN0IGZpZWxkSXRlbSA9IGNoaWxkLm5hbWUgPyBGaWVsZC5nZXQoIGNoaWxkLm5hbWUgKSA6IG51bGw7XG4gICAgICAgICAgICAvLyBpZiggZmllbGRJdGVtICl7XG4gICAgICAgICAgICAvLyAgIGNvbXBvbmVudExpc3QucHVzaCggZmllbGRJdGVtICk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSAnZmllbGQnOiB7XG4gICAgICAgICAgICBjb25zdCBmaWVsZCA9IEZpZWxkLmdldCgrY2hpbGQuYXNzZXRfaWQpO1xuXG4gICAgICAgICAgICBpZiAoZmllbGQpIHtcbiAgICAgICAgICAgICAgY29tcG9uZW50TGlzdC5wdXNoKHNjaGVtZSwgZmllbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgJ2NvbXBvbmVudCc6IHtcbiAgICAgICAgICAgIC8vIFRvRG86OiBGaWd1cmUgaG93IGN1c3RvbSBjb21wb25lbnRzIGFyZSBnb2luZyB0byBiZSBtYW5hZ2VkXG5cbiAgICAgICAgICAgIGNvbnN0IGludGVybmFsTmFtZSA9IFN0b3JhZ2VHZXR0ZXIoY2hpbGQsIFsnYXNzZXQnLCAnaW50ZXJuYWxfbmFtZSddLCBTdHJpbmcoU3BhY2VUb1NuYWtlKGNoaWxkLm5hbWUpKS50b0xvd2VyQ2FzZSgpICsgJ18xJyk7XG4gICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSA8RHluYW1pY0NvbXBvbmVudEludGVyZmFjZT57XG4gICAgICAgICAgICAgIHR5cGU6IFBvcEVudGl0eVNjaGVtZUN1c3RvbUNvbXBvbmVudCxcbiAgICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgICAgY29yZTogY29yZSxcbiAgICAgICAgICAgICAgICBjb25maWc6IDxTY2hlbWVDb21wb25lbnRDb25maWc+dW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudElkOiBjaGlsZC5hc3NldF9pZCxcbiAgICAgICAgICAgICAgICBpbnRlcm5hbF9uYW1lOiBpbnRlcm5hbE5hbWVcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbXBvbmVudExpc3QucHVzaChjb21wb25lbnQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyBpZiggdGhpcy5zcnYubG9nLmVuYWJsZWQoJ2Vycm9yJywgdGhpcy5uYW1lKSApIGNvbnNvbGUubG9nKHRoaXMuc3J2LmxvZy5tZXNzYWdlKGAke3RoaXMubmFtZX06Z2V0U2NoZW1lU2VjdGlvbkFzc2V0Q29tcG9uZW50c2ApLCB0aGlzLnNydi5sb2cuY29sb3IoJ2Vycm9yJyksIGFzc2V0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJldHVybiBjb21wb25lbnRMaXN0O1xuICB9XG5cblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIGRlZmF1bHQgY29sdW1ucyB0aHQgZXhpc3Qgb24gYW4gZW50aXR5IHRhYmxlXG4gICAqIEBwYXJhbSBzZWN0aW9uXG4gICAqL1xuICBwcml2YXRlIF9nZXRTZWN0aW9uVGFibGVGaWVsZHNBc3NldHMoc2VjdGlvbjogRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSkge1xuICAgIGNvbnN0IHRhYmxlQXNzZXRzID0gW107XG4gICAgaWYgKHRoaXMuY29yZSkge1xuICAgICAgY29uc3QgRmllbGQgPSBTdG9yYWdlR2V0dGVyKHRoaXMuY29yZSwgJ3JlcG8ubW9kZWwuZmllbGQnLnNwbGl0KCcuJykpO1xuICAgICAgaWYgKElzT2JqZWN0KEZpZWxkLCB0cnVlKSkge1xuICAgICAgICBPYmplY3QudmFsdWVzKEZpZWxkKS5tYXAoKGZpZWxkOiBGaWVsZEludGVyZmFjZSkgPT4ge1xuICAgICAgICAgIGlmICghZmllbGQuYW5jaWxsYXJ5ICYmIGZpZWxkLnBvc2l0aW9uID09PSBzZWN0aW9uLnBvc2l0aW9uKSB7XG4gICAgICAgICAgICB0YWJsZUFzc2V0cy5wdXNoKG5ldyBFbnRpdHlTY2hlbWVTZWN0aW9uQ29uZmlnKHtcbiAgICAgICAgICAgICAgaWQ6IDAsXG4gICAgICAgICAgICAgIG5hbWU6IGZpZWxkLm1vZGVsLm5hbWUsXG4gICAgICAgICAgICAgIGxhYmVsOiBmaWVsZC5tb2RlbC5sYWJlbCxcbiAgICAgICAgICAgICAgYXNzZXRfdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgICAgICAgYXNzZXRfaWQ6IDAsXG4gICAgICAgICAgICAgIGFzc2V0OiBmaWVsZCxcbiAgICAgICAgICAgICAgc2NoZW1lX2lkOiArc2VjdGlvbi5pZCxcbiAgICAgICAgICAgICAgc29ydF9vcmRlcjogZmllbGQuc29ydCxcbiAgICAgICAgICAgICAgcG9zaXRpb246IHNlY3Rpb24ucG9zaXRpb24sXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWN0aW9uLnN0YXJ0SW5kZXggPSB0YWJsZUFzc2V0cy5sZW5ndGg7XG4gICAgcmV0dXJuIHRhYmxlQXNzZXRzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIGlmIChhLnNvcnQgPCBiLnNvcnQpIHJldHVybiAtMTtcbiAgICAgIGlmIChhLnNvcnQgPiBiLnNvcnQpIHJldHVybiAxO1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==