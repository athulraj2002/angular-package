import { __awaiter } from "tslib";
import { Component, ElementRef, Inject, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TableConfig } from '../../base/pop-table/pop-table.model';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopBusiness, PopTemplate } from '../../../pop-common.model';
import { GetSessionSiteVar, IsArray, IsObject, TitleCase } from '../../../pop-common-utility';
import { PopEntityListComponent } from '../pop-entity-list/pop-entity-list.component';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
export class PopEntityTabListComponent extends PopEntityListComponent {
    constructor(el, route, _domRepo, _tabRepo, APP_GLOBAL) {
        super(el, route, _domRepo, APP_GLOBAL);
        this.el = el;
        this.route = route;
        this._domRepo = _domRepo;
        this._tabRepo = _tabRepo;
        this.APP_GLOBAL = APP_GLOBAL;
        this.name = 'PopEntityTabListComponent';
    }
    /**
     * This component will display a list of entities that the user can interact with
     */
    ngOnInit() {
        super.ngOnInit();
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
     *                                    ( Protected Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Allow for a CoreConfig to be passed in
     * If a CoreConfig does not exits this component needs to be able to create it for itself, uses the internal_name that comes directly for the route
     * or tries to extrapolate it from the current url of the app
     *
     */
    _setCoreConfig() {
        // console.log(this.route);
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.srv.entity.getCoreConfig(this.internal_name, 0).then((core) => {
                this.core = core;
                this.id = `${this.parent}_${this.core.params.internal_name}`;
                this.log.info(`_setCore: initial`, core);
                return resolve(true);
            }, () => {
                return resolve(false);
            });
        }));
    }
    /**
     * Setup basic config
     * Intended to be overridden
     * @private
     */
    _setConfig() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (!this.parentId)
                this.parentId = this.srv.entity.getRouteParentId(this.route);
            if (!this.internal_name)
                this.internal_name = this.srv.entity.getRouteInternalName(this.route);
            if (this.parent === 'client') {
                this.extension.client_id = +this.parentId;
            }
            else if (this.parent === 'account') {
                const account = this.srv.tab.getCore().entity;
                this.extension.client_id = +account.client_id;
                this.extension.account_id = +account.id;
            }
            return resolve(true);
        }));
    }
    /**
     * Manage the sessionStorage settings
     * @private
     */
    _setSessionSettings() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            // Set session path for variables
            this.asset.tabMenuSessionPath = `Entity.${TitleCase(this.core.params.internal_name)}.Menu`;
            this.asset.showArchivedSessionPath = `Business.${PopBusiness.id}.Entity.${TitleCase(this.parent)}.Table.${TitleCase(this.internal_name)}.showArchived`;
            this.asset.searchValueSessionPath = `Business.${PopBusiness.id}.Entity.${TitleCase(this.parent)}.Table.${TitleCase(this.internal_name)}.searchValue`;
            // Set any session variables
            // SetSessionSiteVar(this.asset.tabMenuSessionPath, null); // remove any menu session data for this entity
            this.dom.state.showArchived = GetSessionSiteVar(this.asset.showArchivedSessionPath, false);
            return resolve(true);
        }));
    }
    /**z
     * Determine the height of the table
     * @private
     */
    _setHeight() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            // Determine height of the table - have to account if filter bar is enabled
            const overhead = 50; // trial and error , increase to make component shorter, lower to increase height
            this.dom.setHeight(window.innerHeight - 200, overhead);
            return resolve(true);
        }));
    }
    _fetchData(update = false) {
        if (!update)
            this.dom.setTimeout(`lazy-load-fresh-data`, null);
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (this.dataFactory) {
                this.dataFactory(this.parentId, this.dom.state.showArchived ? 1 : 0).then((data) => {
                    // console.log('data', data);
                    data = this._transformData(data);
                    if (update && this.table.config && typeof this.table.config.updateData === 'function') {
                        this.table.config.updateData(data);
                    }
                    PopTemplate.clear();
                    resolve(data);
                }, () => {
                    reject([]);
                });
            }
            else {
                const params = {};
                params[`${this.parent}_id`] = this.parentId;
                // console.log(params);
                this.core.repo.getEntities(Object.assign({ archived: (this.dom.state.showArchived ? 1 : 0) }, params)).then((list) => {
                    list = this._transformData(list);
                    // this.core.repo.setCache('table', this.internal_name, data, 5);
                    if (update && this.table.config && typeof this.table.config.updateData === 'function') {
                        this.table.config.updateData(list);
                    }
                    PopTemplate.clear();
                    resolve(list);
                }, () => {
                    reject([]);
                });
            }
        }));
    }
    _transformData(data) {
        if (!(IsObject(this.asset.fieldKeys, true)))
            this._setFieldKeys(data[0]);
        if (!(IsObject(this.asset.transformations, true)))
            this._setFieldTableTransformations();
        data = this._prepareTableData(data);
        this.core.repo.setCache('table', this.parent, data, 5);
        return data;
    }
    /**
     * Retrieves the data set that this view will represent
     * @param hardReset
     *
     */
    _getTableData(hardReset = false) {
        return new Promise((resolve, reject) => {
            if (this.dom.delay.data)
                clearTimeout(this.dom.delay.data);
            this.core.repo.getCache('table', this.parent).then((cache) => {
                if (IsArray(cache, true)) {
                    this._triggerDataFetch();
                    return resolve({ data: cache });
                }
                else {
                    this._fetchData(false).then((data) => {
                        return resolve({ data: data });
                    });
                }
            });
        });
    }
    _configureFilterBar() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.srv.filter.setActive(false);
            return resolve(true);
        }));
    }
    /**
     * Generates a table config that will be used by the nested view component
     * @param reset
     *
     */
    _configureTable(reset = false) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (!this.table.config) {
                this._getTableData(reset).then((tableData) => {
                    if (IsArray(tableData.data, true)) {
                        this.asset.blueprint = tableData.data[0];
                    }
                    this._getTableInterface().then(() => {
                        this.asset.tableInterface.paginator = false;
                        this.table.config = new TableConfig(Object.assign(Object.assign({}, this.asset.tableInterface), tableData));
                    });
                });
            }
            else {
                this.table.config.loading = true;
                this._getTableData().then((result) => {
                    if (IsArray(result.data, true))
                        this.asset.blueprint = result.data[0];
                    this.table.config.buttons = this._buildTableButtons();
                    if (reset) {
                        this.table.config.reset(result.data);
                    }
                    else {
                        this.table.config.updateData(result.data);
                    }
                    this.table.config.loading = false;
                    this.dom.state.refresh = false;
                    this.core.params.refresh = false;
                });
            }
            return resolve(true);
        }));
    }
}
PopEntityTabListComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-tab-list',
                template: "<div *ngIf=\"dom.state.loaded\" class=\"entity-tab-list-container\" [style.height.px]=\"dom.height.inner\">\n  <lib-pop-table #list *ngIf=\"table.config\" [core]=core [config]=\"table.config\" (events)=\"onTableEvent($event)\"></lib-pop-table>\n</div>\n<lib-pop-field-item-group *ngIf=\"ui.actionModal\" [config]=\"ui.actionModal\" (close)=\"onActionModalClose()\"></lib-pop-field-item-group>\n<lib-pop-errors *ngIf=\"dom.error?.message\" [error]=\"dom.error\"></lib-pop-errors>\n",
                styles: [".entity-tab-list-container{position:relative;display:flex;width:auto;height:auto;flex-direction:column;box-sizing:border-box}.entity-tab-list-container lib-pop-table{position:absolute;left:0;top:0;right:0;bottom:10px}:host ::ng-deep tr{height:48px;max-height:48px}:host ::ng-deep td,:host ::ng-deep th{min-width:50px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;height:48px;max-height:48px}:host ::ng-deep th>.mat-sort-header-container{display:flex;min-width:50px}:host ::ng-deep .pop-table-button-control{margin-top:6px!important}:host ::ng-deep .checkbox-column{min-width:25px!important;width:25px!important;padding:0 5px!important;text-align:center!important}::ng-deep th[class*=fk],:host ::ng-deep td[class*=fk]{text-align:center!important;justify-content:center}:host ::ng-deep th[class*=fk]>.mat-sort-header-container{justify-content:center!important;text-align:center!important}:host ::ng-deep td[class*=id],:host ::ng-deep th[class*=id]{text-align:center!important;justify-content:center}:host ::ng-deep th[class*=active]>.mat-sort-header-container{justify-content:center!important;text-align:center!important}:host ::ng-deep td[class*=active],:host ::ng-deep th[class*=active]{text-align:center!important;justify-content:center}:host ::ng-deep th[class*=system]>.mat-sort-header-container{justify-content:center!important;text-align:center!important}:host ::ng-deep td[class*=system],:host ::ng-deep th[class*=system]{text-align:center!important;justify-content:center}:host ::ng-deep th[class*=id]>.mat-sort-header-container{justify-content:center!important;text-align:center!important}:host ::ng-deep td[class*=-name],:host ::ng-deep th[class*=-name]{text-align:left!important;padding-left:20px!important;max-width:200px}:host ::ng-deep th[class*=-name] .mat-sort-header-container{padding-left:0!important;justify-content:left!important;max-width:500px}:host ::ng-deep td[class*=-first],:host ::ng-deep th[class*=-first]{text-align:left!important;padding-left:20px!important}:host ::ng-deep th[class*=-first] .mat-sort-header-container{min-width:50px!important;padding-left:0!important;justify-content:left!important}:host ::ng-deep td[class*=-last],:host ::ng-deep th[class*=-last]{text-align:left!important;padding-left:20px!important}:host ::ng-deep th[class*=-last] .mat-sort-header-container{padding-left:0!important;justify-content:left!important}:host ::ng-deep td[class*=-display],:host ::ng-deep th[class*=-display]{text-align:left!important;padding-left:20px!important}:host ::ng-deep th[class*=-display] .mat-sort-header-container{padding-left:0!important;justify-content:left!important}:host ::ng-deep td[class*=-description],:host ::ng-deep th[class*=-description]{text-align:left!important;padding-left:20px!important;max-width:500px}:host ::ng-deep th[class*=-description] .mat-sort-header-container{padding-left:0!important;justify-content:left!important;max-width:500px}:host ::ng-deep td[class*=email],:host ::ng-deep th[class*=email]{min-width:50px!important;text-align:left!important;padding-left:20px!important}:host ::ng-deep th[class*=email] .mat-sort-header-container{min-width:50px!important;padding-left:0!important;justify-content:left!important}"]
            },] }
];
PopEntityTabListComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: ActivatedRoute },
    { type: PopDomService },
    { type: PopTabMenuService },
    { type: undefined, decorators: [{ type: Inject, args: ['APP_GLOBAL',] }] }
];
PopEntityTabListComponent.propDecorators = {
    internal_name: [{ type: Input }],
    parentId: [{ type: Input }],
    parent: [{ type: Input }],
    param: [{ type: Input }],
    extension: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS10YWItbGlzdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS10YWItbGlzdC9wb3AtZW50aXR5LXRhYi1saXN0LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFDeEYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUVuRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDbEUsT0FBTyxFQUEwQyxXQUFXLEVBQXNCLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2pJLE9BQU8sRUFFTCxpQkFBaUIsRUFDakIsT0FBTyxFQUNQLFFBQVEsRUFDUixTQUFTLEVBQ1YsTUFBTSw2QkFBNkIsQ0FBQztBQUNyQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUN0RixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQVFqRixNQUFNLE9BQU8seUJBQTBCLFNBQVEsc0JBQXNCO0lBVW5FLFlBQ1MsRUFBYyxFQUNYLEtBQXFCLEVBQ3JCLFFBQXVCLEVBQ3ZCLFFBQTJCLEVBQ04sVUFBOEI7UUFFN0QsS0FBSyxDQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBRSxDQUFDO1FBTmxDLE9BQUUsR0FBRixFQUFFLENBQVk7UUFDWCxVQUFLLEdBQUwsS0FBSyxDQUFnQjtRQUNyQixhQUFRLEdBQVIsUUFBUSxDQUFlO1FBQ3ZCLGFBQVEsR0FBUixR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QUFDLE1BQU0sQ0FBQyxVQUFVLENBQUUsTUFBTSxDQUFDLElBQUksQ0FBRSxDQUFDO3FCQUM3QztvQkFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO29CQUNsQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO29CQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO2dCQUVuQyxDQUFDLENBQUUsQ0FBQzthQUNMO1lBQ0QsT0FBTyxPQUFPLENBQUUsSUFBSSxDQUFFLENBQUM7UUFDekIsQ0FBQyxDQUFBLENBQUUsQ0FBQztJQUNOLENBQUM7OztZQTlPRixTQUFTLFNBQUU7Z0JBQ1YsUUFBUSxFQUFFLHlCQUF5QjtnQkFFbkMsNGVBQW1EOzthQUNwRDs7O1lBckJtQixVQUFVO1lBQ3JCLGNBQWM7WUFHZCxhQUFhO1lBVWIsaUJBQWlCOzRDQXVCckIsTUFBTSxTQUFFLFlBQVk7Ozs0QkFkdEIsS0FBSzt1QkFDTCxLQUFLO3FCQUNMLEtBQUs7b0JBQ0wsS0FBSzt3QkFDTCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3QsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgVGFibGVDb25maWcgfSBmcm9tICcuLi8uLi9iYXNlL3BvcC10YWJsZS9wb3AtdGFibGUubW9kZWwnO1xuaW1wb3J0IHsgRW50aXR5VGFiTGlzdEV4dGVuZEludGVyZmFjZSB9IGZyb20gJy4vcG9wLWVudGl0eS10YWItbGlzdC5tb2RlbCc7XG5pbXBvcnQgeyBQb3BEb21TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvcG9wLWRvbS5zZXJ2aWNlJztcbmltcG9ydCB7IEFwcEdsb2JhbEludGVyZmFjZSwgQ29yZUNvbmZpZywgRW50aXR5LCBQb3BCdXNpbmVzcywgUG9wRW50aXR5LCBQb3BQaXBlLCBQb3BUZW1wbGF0ZSB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHtcbiAgR2V0SHR0cE9iamVjdFJlc3VsdCxcbiAgR2V0U2Vzc2lvblNpdGVWYXIsXG4gIElzQXJyYXksXG4gIElzT2JqZWN0LFxuICBUaXRsZUNhc2Vcbn0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7IFBvcEVudGl0eUxpc3RDb21wb25lbnQgfSBmcm9tICcuLi9wb3AtZW50aXR5LWxpc3QvcG9wLWVudGl0eS1saXN0LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BUYWJNZW51U2VydmljZSB9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLXRhYi1tZW51L3BvcC10YWItbWVudS5zZXJ2aWNlJztcblxuXG5AQ29tcG9uZW50KCB7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC1lbnRpdHktdGFiLWxpc3QnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWVudGl0eS10YWItbGlzdC5jb21wb25lbnQuc2NzcycgXSxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lbnRpdHktdGFiLWxpc3QuY29tcG9uZW50Lmh0bWwnLFxufSApXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5VGFiTGlzdENvbXBvbmVudCBleHRlbmRzIFBvcEVudGl0eUxpc3RDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGludGVybmFsX25hbWU6IHN0cmluZztcbiAgQElucHV0KCkgcGFyZW50SWQ6IG51bWJlcjtcbiAgQElucHV0KCkgcGFyZW50OiBzdHJpbmc7XG4gIEBJbnB1dCgpIHBhcmFtOiBzdHJpbmc7XG4gIEBJbnB1dCgpIGV4dGVuc2lvbjogRW50aXR5VGFiTGlzdEV4dGVuZEludGVyZmFjZTtcblxuICBwdWJsaWMgbmFtZSA9ICdQb3BFbnRpdHlUYWJMaXN0Q29tcG9uZW50JztcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgcm91dGU6IEFjdGl2YXRlZFJvdXRlLFxuICAgIHByb3RlY3RlZCBfZG9tUmVwbzogUG9wRG9tU2VydmljZSxcbiAgICBwcm90ZWN0ZWQgX3RhYlJlcG86IFBvcFRhYk1lbnVTZXJ2aWNlLFxuICAgIEBJbmplY3QoICdBUFBfR0xPQkFMJyApIHB1YmxpYyBBUFBfR0xPQkFMOiBBcHBHbG9iYWxJbnRlcmZhY2UsXG4gICl7XG4gICAgc3VwZXIoIGVsLCByb3V0ZSwgX2RvbVJlcG8sIEFQUF9HTE9CQUwgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IHdpbGwgZGlzcGxheSBhIGxpc3Qgb2YgZW50aXRpZXMgdGhhdCB0aGUgdXNlciBjYW4gaW50ZXJhY3Qgd2l0aFxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogQ2xlYW4gdXAgdGhlIGRvbSBvZiB0aGlzIGNvbXBvbmVudFxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuXG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcm90ZWN0ZWQgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gIC8qKlxuICAgKiBBbGxvdyBmb3IgYSBDb3JlQ29uZmlnIHRvIGJlIHBhc3NlZCBpblxuICAgKiBJZiBhIENvcmVDb25maWcgZG9lcyBub3QgZXhpdHMgdGhpcyBjb21wb25lbnQgbmVlZHMgdG8gYmUgYWJsZSB0byBjcmVhdGUgaXQgZm9yIGl0c2VsZiwgdXNlcyB0aGUgaW50ZXJuYWxfbmFtZSB0aGF0IGNvbWVzIGRpcmVjdGx5IGZvciB0aGUgcm91dGVcbiAgICogb3IgdHJpZXMgdG8gZXh0cmFwb2xhdGUgaXQgZnJvbSB0aGUgY3VycmVudCB1cmwgb2YgdGhlIGFwcFxuICAgKlxuICAgKi9cbiAgcHJvdGVjdGVkIF9zZXRDb3JlQ29uZmlnKCk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgLy8gY29uc29sZS5sb2codGhpcy5yb3V0ZSk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyggcmVzb2x2ZSApID0+IHtcbiAgICAgIHRoaXMuc3J2LmVudGl0eS5nZXRDb3JlQ29uZmlnKCB0aGlzLmludGVybmFsX25hbWUsIDAgKS50aGVuKCAoIGNvcmU6IENvcmVDb25maWcgKSA9PiB7XG4gICAgICAgIHRoaXMuY29yZSA9IGNvcmU7XG4gICAgICAgIHRoaXMuaWQgPSBgJHt0aGlzLnBhcmVudH1fJHt0aGlzLmNvcmUucGFyYW1zLmludGVybmFsX25hbWV9YDtcbiAgICAgICAgdGhpcy5sb2cuaW5mbyggYF9zZXRDb3JlOiBpbml0aWFsYCwgY29yZSApO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSggZmFsc2UgKTtcbiAgICAgIH0gKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZXR1cCBiYXNpYyBjb25maWdcbiAgICogSW50ZW5kZWQgdG8gYmUgb3ZlcnJpZGRlblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJvdGVjdGVkIF9zZXRDb25maWcoKTogUHJvbWlzZTxib29sZWFuPntcbiAgICByZXR1cm4gbmV3IFByb21pc2UoIGFzeW5jKCByZXNvbHZlICkgPT4ge1xuXG4gICAgICBpZiggIXRoaXMucGFyZW50SWQgKSB0aGlzLnBhcmVudElkID0gdGhpcy5zcnYuZW50aXR5LmdldFJvdXRlUGFyZW50SWQoIHRoaXMucm91dGUgKTtcbiAgICAgIGlmKCAhdGhpcy5pbnRlcm5hbF9uYW1lICkgdGhpcy5pbnRlcm5hbF9uYW1lID0gdGhpcy5zcnYuZW50aXR5LmdldFJvdXRlSW50ZXJuYWxOYW1lKCB0aGlzLnJvdXRlICk7XG5cbiAgICAgIGlmKCB0aGlzLnBhcmVudCA9PT0gJ2NsaWVudCcgKXtcbiAgICAgICAgdGhpcy5leHRlbnNpb24uY2xpZW50X2lkID0gK3RoaXMucGFyZW50SWQ7XG4gICAgICB9ZWxzZSBpZiggdGhpcy5wYXJlbnQgPT09ICdhY2NvdW50JyApe1xuICAgICAgICBjb25zdCBhY2NvdW50ID0gdGhpcy5zcnYudGFiLmdldENvcmUoKS5lbnRpdHk7XG4gICAgICAgIHRoaXMuZXh0ZW5zaW9uLmNsaWVudF9pZCA9ICthY2NvdW50LmNsaWVudF9pZDtcbiAgICAgICAgdGhpcy5leHRlbnNpb24uYWNjb3VudF9pZCA9ICthY2NvdW50LmlkO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBNYW5hZ2UgdGhlIHNlc3Npb25TdG9yYWdlIHNldHRpbmdzXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldFNlc3Npb25TZXR0aW5ncygpOiBQcm9taXNlPGJvb2xlYW4+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggYXN5bmMoIHJlc29sdmUgKSA9PiB7XG4gICAgICAvLyBTZXQgc2Vzc2lvbiBwYXRoIGZvciB2YXJpYWJsZXNcbiAgICAgIHRoaXMuYXNzZXQudGFiTWVudVNlc3Npb25QYXRoID0gYEVudGl0eS4ke1RpdGxlQ2FzZSggdGhpcy5jb3JlLnBhcmFtcy5pbnRlcm5hbF9uYW1lICl9Lk1lbnVgO1xuICAgICAgdGhpcy5hc3NldC5zaG93QXJjaGl2ZWRTZXNzaW9uUGF0aCA9IGBCdXNpbmVzcy4ke1BvcEJ1c2luZXNzLmlkfS5FbnRpdHkuJHtUaXRsZUNhc2UoIHRoaXMucGFyZW50ICl9LlRhYmxlLiR7VGl0bGVDYXNlKCB0aGlzLmludGVybmFsX25hbWUgKX0uc2hvd0FyY2hpdmVkYDtcbiAgICAgIHRoaXMuYXNzZXQuc2VhcmNoVmFsdWVTZXNzaW9uUGF0aCA9IGBCdXNpbmVzcy4ke1BvcEJ1c2luZXNzLmlkfS5FbnRpdHkuJHtUaXRsZUNhc2UoIHRoaXMucGFyZW50ICl9LlRhYmxlLiR7VGl0bGVDYXNlKCB0aGlzLmludGVybmFsX25hbWUgKX0uc2VhcmNoVmFsdWVgO1xuXG4gICAgICAvLyBTZXQgYW55IHNlc3Npb24gdmFyaWFibGVzXG4gICAgICAvLyBTZXRTZXNzaW9uU2l0ZVZhcih0aGlzLmFzc2V0LnRhYk1lbnVTZXNzaW9uUGF0aCwgbnVsbCk7IC8vIHJlbW92ZSBhbnkgbWVudSBzZXNzaW9uIGRhdGEgZm9yIHRoaXMgZW50aXR5XG4gICAgICB0aGlzLmRvbS5zdGF0ZS5zaG93QXJjaGl2ZWQgPSBHZXRTZXNzaW9uU2l0ZVZhciggdGhpcy5hc3NldC5zaG93QXJjaGl2ZWRTZXNzaW9uUGF0aCwgZmFsc2UgKTtcblxuICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKnpcbiAgICogRGV0ZXJtaW5lIHRoZSBoZWlnaHQgb2YgdGhlIHRhYmxlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldEhlaWdodCgpOiBQcm9taXNlPGJvb2xlYW4+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggYXN5bmMoIHJlc29sdmUgKSA9PiB7XG4gICAgICAvLyBEZXRlcm1pbmUgaGVpZ2h0IG9mIHRoZSB0YWJsZSAtIGhhdmUgdG8gYWNjb3VudCBpZiBmaWx0ZXIgYmFyIGlzIGVuYWJsZWRcbiAgICAgIGNvbnN0IG92ZXJoZWFkID0gNTA7IC8vIHRyaWFsIGFuZCBlcnJvciAsIGluY3JlYXNlIHRvIG1ha2UgY29tcG9uZW50IHNob3J0ZXIsIGxvd2VyIHRvIGluY3JlYXNlIGhlaWdodFxuICAgICAgdGhpcy5kb20uc2V0SGVpZ2h0KCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAyMDAsIG92ZXJoZWFkICk7XG4gICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgIH0gKTtcbiAgfVxuXG5cbiAgcHJvdGVjdGVkIF9mZXRjaERhdGEoIHVwZGF0ZSA9IGZhbHNlICl7XG4gICAgaWYoICF1cGRhdGUgKSB0aGlzLmRvbS5zZXRUaW1lb3V0KCBgbGF6eS1sb2FkLWZyZXNoLWRhdGFgLCBudWxsICk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuICAgICAgaWYoIHRoaXMuZGF0YUZhY3RvcnkgKXtcbiAgICAgICAgdGhpcy5kYXRhRmFjdG9yeSggdGhpcy5wYXJlbnRJZCwgdGhpcy5kb20uc3RhdGUuc2hvd0FyY2hpdmVkID8gMSA6IDAgKS50aGVuKCAoIGRhdGEgKSA9PiB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coJ2RhdGEnLCBkYXRhKTtcbiAgICAgICAgICBkYXRhID0gdGhpcy5fdHJhbnNmb3JtRGF0YSggZGF0YSApO1xuICAgICAgICAgIGlmKCB1cGRhdGUgJiYgdGhpcy50YWJsZS5jb25maWcgJiYgdHlwZW9mIHRoaXMudGFibGUuY29uZmlnLnVwZGF0ZURhdGEgPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRoaXMudGFibGUuY29uZmlnLnVwZGF0ZURhdGEoIGRhdGEgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgUG9wVGVtcGxhdGUuY2xlYXIoKTtcbiAgICAgICAgICByZXNvbHZlKCBkYXRhICk7XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICByZWplY3QoIFtdICk7XG4gICAgICAgIH0gKTtcbiAgICAgIH1lbHNle1xuICAgICAgICBjb25zdCBwYXJhbXMgPSB7fTtcbiAgICAgICAgcGFyYW1zWyBgJHt0aGlzLnBhcmVudH1faWRgIF0gPSB0aGlzLnBhcmVudElkO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhwYXJhbXMpO1xuICAgICAgICB0aGlzLmNvcmUucmVwby5nZXRFbnRpdGllcyggeyBhcmNoaXZlZDogKCB0aGlzLmRvbS5zdGF0ZS5zaG93QXJjaGl2ZWQgPyAxIDogMCApLCAuLi5wYXJhbXMgfSApLnRoZW4oICggbGlzdDogRW50aXR5W10gKSA9PiB7XG4gICAgICAgICAgbGlzdCA9IHRoaXMuX3RyYW5zZm9ybURhdGEoIGxpc3QgKVxuICAgICAgICAgIC8vIHRoaXMuY29yZS5yZXBvLnNldENhY2hlKCd0YWJsZScsIHRoaXMuaW50ZXJuYWxfbmFtZSwgZGF0YSwgNSk7XG4gICAgICAgICAgaWYoIHVwZGF0ZSAmJiB0aGlzLnRhYmxlLmNvbmZpZyAmJiB0eXBlb2YgdGhpcy50YWJsZS5jb25maWcudXBkYXRlRGF0YSA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhpcy50YWJsZS5jb25maWcudXBkYXRlRGF0YSggbGlzdCApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBQb3BUZW1wbGF0ZS5jbGVhcigpO1xuICAgICAgICAgIHJlc29sdmUoIGxpc3QgKTtcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgIHJlamVjdCggW10gKTtcbiAgICAgICAgfSApO1xuICAgICAgfVxuXG4gICAgfSApO1xuICB9XG5cblxuICBwcm90ZWN0ZWQgX3RyYW5zZm9ybURhdGEoIGRhdGE6IGFueVtdICl7XG4gICAgaWYoICEoIElzT2JqZWN0KCB0aGlzLmFzc2V0LmZpZWxkS2V5cywgdHJ1ZSApICkgKSB0aGlzLl9zZXRGaWVsZEtleXMoIGRhdGFbIDAgXSApO1xuICAgIGlmKCAhKCBJc09iamVjdCggdGhpcy5hc3NldC50cmFuc2Zvcm1hdGlvbnMsIHRydWUgKSApICkgdGhpcy5fc2V0RmllbGRUYWJsZVRyYW5zZm9ybWF0aW9ucygpO1xuICAgIGRhdGEgPSB0aGlzLl9wcmVwYXJlVGFibGVEYXRhKCBkYXRhICk7XG4gICAgdGhpcy5jb3JlLnJlcG8uc2V0Q2FjaGUoICd0YWJsZScsIHRoaXMucGFyZW50LCBkYXRhLCA1ICk7XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgZGF0YSBzZXQgdGhhdCB0aGlzIHZpZXcgd2lsbCByZXByZXNlbnRcbiAgICogQHBhcmFtIGhhcmRSZXNldFxuICAgKlxuICAgKi9cbiAgcHJvdGVjdGVkIF9nZXRUYWJsZURhdGEoIGhhcmRSZXNldCA9IGZhbHNlICl7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IHtcbiAgICAgIGlmKCB0aGlzLmRvbS5kZWxheS5kYXRhICkgY2xlYXJUaW1lb3V0KCB0aGlzLmRvbS5kZWxheS5kYXRhICk7XG4gICAgICB0aGlzLmNvcmUucmVwby5nZXRDYWNoZSggJ3RhYmxlJywgdGhpcy5wYXJlbnQgKS50aGVuKCAoIGNhY2hlICkgPT4ge1xuICAgICAgICBpZiggSXNBcnJheSggY2FjaGUsIHRydWUgKSApe1xuICAgICAgICAgIHRoaXMuX3RyaWdnZXJEYXRhRmV0Y2goKTtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSggeyBkYXRhOiBjYWNoZSB9ICk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRoaXMuX2ZldGNoRGF0YSggZmFsc2UgKS50aGVuKCAoIGRhdGEgKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSggeyBkYXRhOiBkYXRhIH0gKTtcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIHByb3RlY3RlZCBfY29uZmlndXJlRmlsdGVyQmFyKCk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyggcmVzb2x2ZSApID0+IHtcbiAgICAgIHRoaXMuc3J2LmZpbHRlci5zZXRBY3RpdmUoIGZhbHNlICk7XG4gICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgIH0gKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlcyBhIHRhYmxlIGNvbmZpZyB0aGF0IHdpbGwgYmUgdXNlZCBieSB0aGUgbmVzdGVkIHZpZXcgY29tcG9uZW50XG4gICAqIEBwYXJhbSByZXNldFxuICAgKlxuICAgKi9cbiAgcHJvdGVjdGVkIF9jb25maWd1cmVUYWJsZSggcmVzZXQgPSBmYWxzZSApOiBQcm9taXNlPGJvb2xlYW4+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggYXN5bmMoIHJlc29sdmUgKSA9PiB7XG4gICAgICBpZiggIXRoaXMudGFibGUuY29uZmlnICl7XG4gICAgICAgIHRoaXMuX2dldFRhYmxlRGF0YSggcmVzZXQgKS50aGVuKCAoIHRhYmxlRGF0YTogYW55ICkgPT4ge1xuICAgICAgICAgIGlmKCBJc0FycmF5KCB0YWJsZURhdGEuZGF0YSwgdHJ1ZSApICl7XG4gICAgICAgICAgICB0aGlzLmFzc2V0LmJsdWVwcmludCA9IHRhYmxlRGF0YS5kYXRhWyAwIF07XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuX2dldFRhYmxlSW50ZXJmYWNlKCkudGhlbiggKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5hc3NldC50YWJsZUludGVyZmFjZS5wYWdpbmF0b3IgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudGFibGUuY29uZmlnID0gbmV3IFRhYmxlQ29uZmlnKCB7IC4uLnRoaXMuYXNzZXQudGFibGVJbnRlcmZhY2UsIC4uLnRhYmxlRGF0YSB9ICk7XG4gICAgICAgICAgfSApO1xuICAgICAgICB9ICk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy50YWJsZS5jb25maWcubG9hZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2dldFRhYmxlRGF0YSgpLnRoZW4oICggcmVzdWx0OiB7IGRhdGE6IEVudGl0eVtdIH0gKSA9PiB7XG4gICAgICAgICAgaWYoIElzQXJyYXkoIHJlc3VsdC5kYXRhLCB0cnVlICkgKSB0aGlzLmFzc2V0LmJsdWVwcmludCA9IHJlc3VsdC5kYXRhWyAwIF07XG4gICAgICAgICAgdGhpcy50YWJsZS5jb25maWcuYnV0dG9ucyA9IHRoaXMuX2J1aWxkVGFibGVCdXR0b25zKCk7XG4gICAgICAgICAgaWYoIHJlc2V0ICl7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLmNvbmZpZy5yZXNldCggcmVzdWx0LmRhdGEgKTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMudGFibGUuY29uZmlnLnVwZGF0ZURhdGEoIHJlc3VsdC5kYXRhICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudGFibGUuY29uZmlnLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLmRvbS5zdGF0ZS5yZWZyZXNoID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy5jb3JlLnBhcmFtcy5yZWZyZXNoID0gZmFsc2U7XG5cbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbn1cblxuIl19