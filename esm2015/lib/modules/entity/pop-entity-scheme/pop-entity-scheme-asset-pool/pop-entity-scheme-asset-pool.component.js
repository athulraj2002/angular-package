import { __awaiter } from "tslib";
import { Component, ElementRef } from '@angular/core';
import { PopEntitySchemeService } from '../pop-entity-scheme.service';
import { ButtonConfig } from '../../../base/pop-field-item/pop-button/button-config.model';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { IsArray, IsArrayThrowError, IsObject, IsObjectThrowError, ObjectContainsTagSearch, TitleCase, ToArray } from '../../../../pop-common-utility';
import { PopPortal, ServiceInjector } from '../../../../pop-common.model';
import { PopTabMenuService } from '../../../base/pop-tab-menu/pop-tab-menu.service';
import { Router } from '@angular/router';
export class PopEntitySchemeAssetPoolComponent extends PopExtendComponent {
    /**
     *
     * @param el
     * @param _domRepo - transfer
     * @param _schemeRepo - transfer
     * @param _tabRepo - transfer
     */
    constructor(el, _domRepo, _schemeRepo, _tabRepo) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this._schemeRepo = _schemeRepo;
        this._tabRepo = _tabRepo;
        this.name = 'PopEntitySchemeAssetPoolComponent';
        this.ui = {
            sections: undefined,
            assignBtnConfigs: undefined,
            assignableConfigs: undefined,
            assetPool: undefined,
            section_keys: undefined
        };
        this.asset = {
            primaryIds: []
        };
        this.srv = {
            scheme: undefined,
            tab: undefined,
            router: ServiceInjector.get(Router)
        };
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.dom.session.searchValue = '';
                // #1: Transfer in misc assets from the schemeRepo
                this.dom.state.searching = false;
                this.asset.primaryIds = this.srv.scheme.ui.primaryIds;
                yield this.dom.setWithComponentInnerHeight('PopEntityTabColumnComponent', this.position, 230, 600);
                this.dom.height.content = this.dom.height.inner - 95;
                this._setUiAssets();
                return resolve(true);
            }));
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                // #5: Reapply any onSession search that may have existed
                this.onApplyUiSearch(this.dom.session.searchValue);
                // #6: Disable the ui assign buttons for the initial view
                this.onDisableUiAssignButtons();
                return resolve(true);
            }));
        };
    }
    /**
     * The purpose of this component is to provide the user with lists of all available types that they can assign into a scheme layout
     */
    ngOnInit() {
        super.ngOnInit();
    }
    _setUiAssets() {
        this.ui.sections = this.srv.scheme.ui.sections; // transfer sections from schemeRepo
        this.ui.assignableConfigs = this.srv.scheme.ui.assignableConfigs; // transfer assignableConfigs for attaching assets from pools
        // #2: Build the config for the buttons that the user will push to assign items to a layout position
        this.ui.assignBtnConfigs = []; // create a button for each section to assign assets from the pools with
        this.ui.sections.map((section) => {
            this.ui.assignBtnConfigs[section.position] = new ButtonConfig({
                bubble: true,
                event: 'assign',
                value: 'Column ' + (+section.position),
                size: 30,
                text: 16,
                icon: null,
            });
        });
        // #4: Configure the asset ppol items that a user can choose from to position in the layout
        let assetPool = IsObjectThrowError(this.srv.scheme.ui.assetPool, true, `${this.name}:configureDom: - this.srv.scheme.asset.asset_pool`) ? JSON.parse(JSON.stringify(this.srv.scheme.ui.assetPool)) : {}; // transfer asset_pools from schemeRepo and mutate
        assetPool = Object.keys(assetPool).map((assetTypeKey) => {
            this.dom.state[assetTypeKey] = {
                expanded: true,
                visible: {},
                attach: {}, // used with the search mechanism
            };
            return {
                name: assetTypeKey,
                asset_type: assetTypeKey,
                display: TitleCase(assetTypeKey),
                data: assetPool[assetTypeKey],
                list: ToArray(assetPool[assetTypeKey])
            };
        });
        this.ui.assetPool = IsArrayThrowError(assetPool, true, `${this.name}:configureDom: - pools`) ? assetPool : [];
    }
    /**
     * Cear the search input and reset the asset pool list
     */
    onUiSearchValueClear() {
        this.dom.session.searchValue = '';
        this.onApplyUiSearch(this.dom.session.searchValue);
    }
    /**
     * Apply the search value the user entered to the asset pool list
     * @param searchValue
     * @param col
     */
    onApplyUiSearch(searchValue, col = '') {
        if (this.dom.delay.search)
            clearTimeout(this.dom.delay.search);
        this.dom.delay.search = setTimeout(() => {
            if (searchValue.length) {
                this.ui.assetPool.map((pool) => {
                    if (IsObject(this.dom.state[pool.name])) {
                        pool.list.map((item) => {
                            this.dom.state[pool.name].visible[item.id] = ObjectContainsTagSearch({
                                id: item.id,
                                name: item.name,
                            }, searchValue) === true;
                        });
                    }
                });
                setTimeout(() => {
                    this.dom.state.searching = true;
                });
            }
            else {
                this.ui.assetPool.map((pool) => {
                    if (IsObject(this.dom.state[pool.name])) {
                        pool.list.map((item) => {
                            this.dom.state[pool.name].visible[item.id] = 1;
                        });
                    }
                });
                this.dom.state.searching = false;
            }
        }, 200);
    }
    /**
     * The user can expand an asset pool type to be open or closed
     * @param pool
     */
    onTogglePoolExpansion(pool) {
        if (pool && pool.name in this.dom.state) {
            this.dom.state[pool.name].expanded = !this.dom.state[pool.name].expanded;
        }
    }
    /**
     * This is triggered when a user selects a checkbox indicating that it will be assigned to a position of the layout
     * @param asset_type
     * @param itemId
     * @param value
     */
    onAssetPoolItemAttaching(asset_type, itemId, value) {
        this.srv.scheme.onAssetAttaching(asset_type, itemId, value);
        this.onEnableUiAssignButtons();
    }
    /**
     * This is triggered when a user selects a position button indicating they want the selected asset pool items moved to a position of the layout
     * @param section
     * @param $event
     */
    onSectionAttachingItems(section, $event) {
        this.onDisableUiAssignButtons();
        section.modified = true;
        this.srv.tab.showAsLoading(true);
        this.srv.scheme.onAttachingAssetsToPosition(section).then((children) => {
            if (IsArray(children, true)) {
                section.children = children;
                this.srv.scheme.onUpdate([section]).then(() => {
                    // console.log( 'done with add ', section );
                    this.srv.tab.showAsLoading(false);
                    this.onDisableUiAssignButtons();
                });
            }
            else {
                // console.log( 'update section failed', section );
                this.srv.tab.showAsLoading(false);
                this.onDisableUiAssignButtons();
            }
        });
    }
    /**
     * This is triggered every time the user selects a checkbox of an asset pool item
     * This should determine which positions of the layout are eligible base on the set of the items selected
     * Asset Pool items should be designated as compact or not, the last position of the layout is reserved for larger modules and compact items should not go in it
     */
    onEnableUiAssignButtons() {
        if (!this.ui.section_keys) {
            this.ui.section_keys = this.ui.sections.map((s, i) => s.position);
        }
        if (this.dom.delay.configure_buttons)
            clearTimeout(this.dom.delay.configure_buttons);
        this.dom.delay.configure_buttons = setTimeout(() => {
            const items = this.srv.scheme._getAssetsToAttach();
            let notCompact;
            const assetTypes = Object.keys(items);
            assetTypes.some((assetType) => {
                notCompact = Object.keys(items[assetType]).filter((assetID) => {
                    if (assetType === 'component') {
                        return !items[assetType][assetID].compact;
                    }
                    return false;
                }).length;
                if (notCompact)
                    return true;
            });
            const positionKeys = this.ui.section_keys.slice();
            if (notCompact) {
                let lastPositionKey;
                if (positionKeys.length) {
                    lastPositionKey = positionKeys.pop();
                }
                positionKeys.map((positionKey) => {
                    this.ui.assignBtnConfigs[positionKey].disabled = true;
                });
                if (lastPositionKey)
                    this.ui.assignBtnConfigs[lastPositionKey].disabled = false;
            }
            else {
                positionKeys.map((positionKey) => {
                    this.ui.assignBtnConfigs[positionKey].disabled = false;
                    this.ui.assignBtnConfigs[positionKey].color = 'accent';
                });
            }
        }, 100);
    }
    /**
     * This will disable or clear the position assign buttons
     */
    onDisableUiAssignButtons() {
        this.core.entity.children.map((section) => {
            if (section.position) {
                this.ui.assignBtnConfigs[section.position].disabled = true;
                this.ui.assignBtnConfigs[section.position].color = 'default';
            }
        });
    }
    onAssetLink(type, id) {
        if (type === 'field') {
            this.srv.router.navigateByUrl(`/cis/fields/${id}`).catch((e) => {
                console.log('e', e);
            });
        }
    }
    /**
     * A user can click on an item in the asset pool to view a modal of that specific entityId item
     * @param internal_namea
     * @param id
     */
    onViewEntityPortal(internal_name, id) {
        if (internal_name === 'field') {
            this.core.channel.emit({ source: this.name, target: 'PopEntityTabColumnComponent', type: 'component', name: 'scrollTo' });
            PopPortal.view(internal_name, id).then(() => {
                this.srv.scheme.ui.refresh.next('reload');
            });
        }
    }
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
PopEntitySchemeAssetPoolComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-entity-scheme-asset-pool',
                template: "<div class=\"entity-scheme-asset-pool-container\" *ngIf=\"dom.state.loaded\" [style.height.px]=\"dom.height.inner\">\n  <div class=\"entity-scheme-asset-pool-search\">\n    <mat-form-field class=\"sw-search\" appearance=\"outline\" color=\"accent\">\n      <a matPrefix>\n        <mat-icon>search</mat-icon>\n      </a>\n      <mat-icon class=\"sw-pointer\" matSuffix (click)=\"onUiSearchValueClear();\">close\n      </mat-icon>\n      <input matInput [(ngModel)]=\"dom.session.searchValue\" (keyup)=\"onApplyUiSearch($event.target.value, '')\" placeholder=\"Search\">\n    </mat-form-field>\n  </div>\n  <div class=\"entity-scheme-asset-pool-content\" [style.height.px]=dom.height.content>\n    <mat-accordion multi=\"true\" [displayMode]=\"'flat'\">\n      <mat-expansion-panel class=\"mat-expansion-panel-first\" *ngFor=\"let pool of ui.assetPool\" [expanded]=\"dom.state[pool.name]?.expanded || this.dom.state['searching']\" hideToggle=\"true\">\n        <mat-expansion-panel-header>\n          <div class=\"entity-scheme-asset-pool-panel-header\" (click)=\"$event.stopPropagation();\">\n            <div class=\"entity-scheme-asset-pool-panel-expansion\">\n              <mat-icon *ngIf=\"!dom.state[pool.name]?.expanded\" (click)=\"onTogglePoolExpansion(pool);\" [ngClass]=\"{'sw-hidden':this.dom.state['searching']}\">\n                keyboard_arrow_right\n              </mat-icon>\n              <mat-icon *ngIf=\"dom.state[pool.name]?.expanded\" (click)=\"onTogglePoolExpansion(pool);\" [ngClass]=\"{'sw-hidden':this.dom.state['searching']}\">\n                keyboard_arrow_down\n              </mat-icon>\n            </div>\n            <div class=\"entity-scheme-asset-pool-panel-name\">{{pool.display}}</div>\n          </div>\n        </mat-expansion-panel-header>\n        <div *ngIf=\"!pool.list.length\" class=\"theme-error\">\n          None\n        </div>\n        <div class=\"entity-scheme-asset-pool-row\"  *ngFor=\"let item of pool.list;\" [ngClass]=\"{'sw-hidden': !this.dom.state[pool.asset_type]?.visible[item.id]}\">\n          <div class=\"entity-scheme-asset-pool-row-container import-flex-column-xs\">\n            <lib-pop-checkbox [config]=\"ui['assignableConfigs'][pool.asset_type][item.id]\" (events)=\"onAssetPoolItemAttaching(pool.asset_type, item.id, $event.config.control.value)\"></lib-pop-checkbox>\n          </div>\n\n          <div class=\"entity-scheme-asset-pool-row-container import-flex-column-md import-flex-grow-sm\">\n            <div class=\"sw-pointer\" [ngClass]=\"{'theme-accent':pool.asset_type === 'field'}\" (click)=\"onViewEntityPortal(pool.asset_type, item.id);\">{{item.name}}</div>\n          </div>\n          <div class=\"entity-scheme-asset-pool-row-container entity-scheme-asset-pool-type import-flex-column-sm\" [ngSwitch]=\"pool.asset_type\">\n            <div *ngSwitchCase=\"'field'\">{{item.fieldgroup.label}}</div>\n            <div *ngSwitchCase=\"'component'\">Component</div>\n          </div>\n        </div>\n      </mat-expansion-panel>\n    </mat-accordion>\n  </div>\n  <div class=\"entity-scheme-asset-pool-assign\">\n    <lib-pop-button *ngFor=\"let section of ui.sections\" class=\"entity-scheme-assign-btn\" [config]=\"ui.assignBtnConfigs [section.position]\" (events)=\"onSectionAttachingItems(section, $event);\"></lib-pop-button>\n  </div>\n</div>\n",
                styles: [".entity-scheme-asset-pool-container{flex:1;padding:var(--gap-s);border:1px solid var(--border);overflow:hidden}.entity-scheme-asset-pool-search{position:relative;display:flex;box-sizing:border-box;width:100%;align-items:stretch;justify-content:stretch;height:40px;margin-bottom:var(--gap-s);clear:both}.entity-scheme-asset-pool-search mat-form-field{width:100%;box-sizing:border-box}.entity-scheme-asset-pool-assign{position:relative;display:flex;box-sizing:border-box;width:100%;align-items:center;justify-content:space-evenly;height:35px;padding:var(--gap-s);margin:var(--gap-s) 0 0 0;clear:both}.entity-scheme-asset-pool-content{position:relative;clear:both;overflow-y:scroll;overflow-x:hidden}.entity-scheme-asset-pool-panel-header{position:relative;display:flex;box-sizing:border-box;width:100%;flex-direction:row;justify-content:flex-start;align-items:center;background:var(--darken02);border-bottom:1px solid var(--border)}.entity-scheme-asset-pool-panel-expansion{display:flex;margin:0 20px 0 8px;align-items:center;height:35px;width:25px}.entity-scheme-asset-pool-panel-name{font-size:var(--text-sm);font-weight:700;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.entity-scheme-asset-pool-row{position:relative;display:flex;box-sizing:border-box;width:100%;flex-direction:row;justify-content:flex-start;align-items:center;height:35px}.entity-scheme-asset-pool-row-container{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.entity-scheme-asset-pool-row-container ::ng-deep .pop-checkbox-container{margin-top:0!important}.entity-scheme-asset-pool-type{font-size:var(--text-sm);padding-top:var(--gap-s)}:host ::ng-deep mat-expansion-panel{background:none;border-left:1px solid var(--border);border-right:1px solid var(--border);border-bottom:1px solid var(--border)}.mat-expansion-panel-first{border-top:1px solid var(--border)!important}:host ::ng-deep .mat-expansion-panel-body{padding:var(--gap-s)!important}:host ::ng-deep mat-expansion-panel-header{padding:0!important;height:35px!important;border-bottom-left-radius:0;border-bottom-right-radius:0}.entity-scheme-assign-btn{display:flex;flex-grow:1;margin-left:var(--gap-xs);margin-right:var(--gap-xs)}.entity-scheme-assign-btn ::ng-deep .pop-button-container{width:100%}.entity-scheme-assign-btn ::ng-deep button{display:flex;width:100%;flex-grow:1}:host ::ng-deep .pop-checkbox-container{min-height:30px}:host ::ng-deep .pop-button-container{background:var(--darken02)}:host ::ng-deep .entity-scheme-asset-pool-search .mat-form-field-prefix{margin-left:2px!important}"]
            },] }
];
PopEntitySchemeAssetPoolComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: PopEntitySchemeService },
    { type: PopTabMenuService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1zY2hlbWUtYXNzZXQtcG9vbC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1zY2hlbWUvcG9wLWVudGl0eS1zY2hlbWUtYXNzZXQtcG9vbC9wb3AtZW50aXR5LXNjaGVtZS1hc3NldC1wb29sLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQXFCLE1BQU0sZUFBZSxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ3RFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw2REFBNkQsQ0FBQztBQUMzRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDckUsT0FBTyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRXZKLE9BQU8sRUFBaUMsU0FBUyxFQUFFLGVBQWUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRXpHLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlEQUFpRCxDQUFDO0FBQ3BGLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQVF6QyxNQUFNLE9BQU8saUNBQWtDLFNBQVEsa0JBQWtCO0lBd0J2RTs7Ozs7O09BTUc7SUFDSCxZQUNTLEVBQWMsRUFDWCxRQUF1QixFQUN2QixXQUFtQyxFQUNuQyxRQUEyQjtRQUVyQyxLQUFLLEVBQUUsQ0FBQztRQUxELE9BQUUsR0FBRixFQUFFLENBQVk7UUFDWCxhQUFRLEdBQVIsUUFBUSxDQUFlO1FBQ3ZCLGdCQUFXLEdBQVgsV0FBVyxDQUF3QjtRQUNuQyxhQUFRLEdBQVIsUUFBUSxDQUFtQjtRQWxDaEMsU0FBSSxHQUFHLG1DQUFtQyxDQUFDO1FBRzNDLE9BQUUsR0FBRztZQUNWLFFBQVEsRUFBa0MsU0FBUztZQUNuRCxnQkFBZ0IsRUFBa0IsU0FBUztZQUMzQyxpQkFBaUIsRUFBc0MsU0FBUztZQUNoRSxTQUFTLEVBQXFDLFNBQVM7WUFDdkQsWUFBWSxFQUFZLFNBQVM7U0FDbEMsQ0FBQztRQUVRLFVBQUssR0FBRztZQUNoQixVQUFVLEVBQVksRUFBRTtTQUN6QixDQUFDO1FBR1EsUUFBRyxHQUFHO1lBQ2QsTUFBTSxFQUEwQixTQUFTO1lBQ3pDLEdBQUcsRUFBcUIsU0FBUztZQUNqQyxNQUFNLEVBQVUsZUFBZSxDQUFDLEdBQUcsQ0FBRSxNQUFNLENBQUU7U0FDOUMsQ0FBQztRQW1CQSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFxQixFQUFFO1lBQzFDLE9BQU8sSUFBSSxPQUFPLENBQUUsQ0FBTyxPQUFPLEVBQUcsRUFBRTtnQkFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztnQkFDbEMsa0RBQWtEO2dCQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO2dCQUVqQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDO2dCQUV0RCxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUUsNkJBQTZCLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFFLENBQUM7Z0JBQ3JHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUNyRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ3BCLE9BQU8sT0FBTyxDQUFFLElBQUksQ0FBRSxDQUFDO1lBQ3pCLENBQUMsQ0FBQSxDQUFFLENBQUM7UUFDTixDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFxQixFQUFFO1lBQ3hDLE9BQU8sSUFBSSxPQUFPLENBQUUsQ0FBTyxPQUFPLEVBQUcsRUFBRTtnQkFDckMseURBQXlEO2dCQUN6RCxJQUFJLENBQUMsZUFBZSxDQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBRSxDQUFDO2dCQUVyRCx5REFBeUQ7Z0JBQ3pELElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO2dCQUVoQyxPQUFPLE9BQU8sQ0FBRSxJQUFJLENBQUUsQ0FBQztZQUN6QixDQUFDLENBQUEsQ0FBRSxDQUFDO1FBQ04sQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUdEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBR08sWUFBWTtRQUNsQixJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUUsb0NBQW9DO1FBQ3JGLElBQUksQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUUsNkRBQTZEO1FBQ2hJLG9HQUFvRztRQUNwRyxJQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQyxDQUFDLHdFQUF3RTtRQUN2RyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUUsQ0FBRSxPQUFPLEVBQUcsRUFBRTtZQUNsQyxJQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUUsR0FBRyxJQUFJLFlBQVksQ0FBRTtnQkFDL0QsTUFBTSxFQUFFLElBQUk7Z0JBQ1osS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsS0FBSyxFQUFFLFNBQVMsR0FBRyxDQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBRTtnQkFDeEMsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFLElBQUk7YUFDWCxDQUFFLENBQUM7UUFDTixDQUFDLENBQUUsQ0FBQztRQUdKLDJGQUEyRjtRQUMzRixJQUFJLFNBQVMsR0FBRyxrQkFBa0IsQ0FBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLG1EQUFtRCxDQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFFLENBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsa0RBQWtEO1FBQ2pRLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFFLFNBQVMsQ0FBRSxDQUFDLEdBQUcsQ0FBRSxDQUFFLFlBQVksRUFBRyxFQUFFO1lBQzNELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFFLFlBQVksQ0FBRSxHQUFHO2dCQUMvQixRQUFRLEVBQUUsSUFBSTtnQkFDZCxPQUFPLEVBQUUsRUFBRTtnQkFDWCxNQUFNLEVBQUUsRUFBRSxFQUFFLGlDQUFpQzthQUM5QyxDQUFDO1lBQ0YsT0FBd0M7Z0JBQ3RDLElBQUksRUFBRSxZQUFZO2dCQUNsQixVQUFVLEVBQUUsWUFBWTtnQkFDeEIsT0FBTyxFQUFFLFNBQVMsQ0FBRSxZQUFZLENBQUU7Z0JBQ2xDLElBQUksRUFBRSxTQUFTLENBQUUsWUFBWSxDQUFFO2dCQUMvQixJQUFJLEVBQUUsT0FBTyxDQUFFLFNBQVMsQ0FBRSxZQUFZLENBQUUsQ0FBRTthQUMzQyxDQUFDO1FBQ0osQ0FBQyxDQUFFLENBQUM7UUFFSixJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxpQkFBaUIsQ0FBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksd0JBQXdCLENBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDbEgsQ0FBQztJQUdEOztPQUVHO0lBQ0gsb0JBQW9CO1FBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLGVBQWUsQ0FBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUUsQ0FBQztJQUN2RCxDQUFDO0lBR0Q7Ozs7T0FJRztJQUNILGVBQWUsQ0FBRSxXQUFtQixFQUFFLEdBQUcsR0FBRyxFQUFFO1FBQzVDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTTtZQUFHLFlBQVksQ0FBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUUsQ0FBQztRQUNsRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFFLEdBQUcsRUFBRTtZQUN2QyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBRSxDQUFFLElBQUksRUFBRyxFQUFFO29CQUNoQyxJQUFJLFFBQVEsQ0FBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBRSxJQUFJLENBQUMsSUFBSSxDQUFFLENBQUUsRUFBRTt3QkFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUUsQ0FBRSxJQUFJLEVBQUcsRUFBRTs0QkFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUUsSUFBSSxDQUFDLElBQUksQ0FBRSxDQUFDLE9BQU8sQ0FBRSxJQUFJLENBQUMsRUFBRSxDQUFFLEdBQUcsdUJBQXVCLENBQUU7Z0NBQ3hFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtnQ0FDWCxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7NkJBQ2hCLEVBQUUsV0FBVyxDQUFFLEtBQUssSUFBSSxDQUFDO3dCQUM1QixDQUFDLENBQUUsQ0FBQztxQkFDTDtnQkFDSCxDQUFDLENBQUUsQ0FBQztnQkFDSixVQUFVLENBQUUsR0FBRyxFQUFFO29CQUNmLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ2xDLENBQUMsQ0FBRSxDQUFDO2FBRUw7aUJBQUk7Z0JBQ0gsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFFLENBQUUsSUFBSSxFQUFHLEVBQUU7b0JBRWhDLElBQUksUUFBUSxDQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFFLElBQUksQ0FBQyxJQUFJLENBQUUsQ0FBRSxFQUFFO3dCQUMzQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBRSxDQUFFLElBQUksRUFBRyxFQUFFOzRCQUN4QixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBRSxJQUFJLENBQUMsSUFBSSxDQUFFLENBQUMsT0FBTyxDQUFFLElBQUksQ0FBQyxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUM7d0JBQ3JELENBQUMsQ0FBRSxDQUFDO3FCQUNMO2dCQUNILENBQUMsQ0FBRSxDQUFDO2dCQUNKLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7YUFDbEM7UUFDSCxDQUFDLEVBQUUsR0FBRyxDQUFFLENBQUM7SUFDWCxDQUFDO0lBR0Q7OztPQUdHO0lBQ0gscUJBQXFCLENBQUUsSUFBSTtRQUN6QixJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFFLElBQUksQ0FBQyxJQUFJLENBQUUsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBRSxJQUFJLENBQUMsSUFBSSxDQUFFLENBQUMsUUFBUSxDQUFDO1NBQzlFO0lBQ0gsQ0FBQztJQUdEOzs7OztPQUtHO0lBQ0gsd0JBQXdCLENBQUUsVUFBa0IsRUFBRSxNQUFjLEVBQUUsS0FBYztRQUMxRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBRSxDQUFDO1FBQzlELElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFHRDs7OztPQUlHO0lBQ0gsdUJBQXVCLENBQUUsT0FBcUMsRUFBRSxNQUFNO1FBQ3BFLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1FBQ2hDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBRSxJQUFJLENBQUUsQ0FBQztRQUNuQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsQ0FBRSxPQUFPLENBQUUsQ0FBQyxJQUFJLENBQUUsQ0FBRSxRQUFxQyxFQUFHLEVBQUU7WUFDdkcsSUFBSSxPQUFPLENBQUUsUUFBUSxFQUFFLElBQUksQ0FBRSxFQUFFO2dCQUM3QixPQUFPLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFFLENBQUUsT0FBTyxDQUFFLENBQUUsQ0FBQyxJQUFJLENBQUUsR0FBRyxFQUFFO29CQUNqRCw0Q0FBNEM7b0JBQzVDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBRSxLQUFLLENBQUUsQ0FBQztvQkFDcEMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7Z0JBQ2xDLENBQUMsQ0FBRSxDQUFDO2FBQ0w7aUJBQUk7Z0JBQ0gsbURBQW1EO2dCQUNuRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUUsS0FBSyxDQUFFLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO2FBQ2pDO1FBQ0gsQ0FBQyxDQUFFLENBQUM7SUFDTixDQUFDO0lBR0Q7Ozs7T0FJRztJQUNILHVCQUF1QjtRQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUU7WUFDekIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFFLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBRSxDQUFDO1NBQ3ZFO1FBQ0QsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxpQkFBaUI7WUFBRyxZQUFZLENBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUUsQ0FBQztRQUN4RixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsR0FBRyxVQUFVLENBQUUsR0FBRyxFQUFFO1lBQ2xELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDbkQsSUFBSSxVQUFVLENBQUM7WUFDZixNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFFLEtBQUssQ0FBRSxDQUFDO1lBQ3hDLFVBQVUsQ0FBQyxJQUFJLENBQUUsQ0FBRSxTQUFpQixFQUFHLEVBQUU7Z0JBQ3ZDLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFFLEtBQUssQ0FBRSxTQUFTLENBQUUsQ0FBRSxDQUFDLE1BQU0sQ0FBRSxDQUFFLE9BQU8sRUFBRyxFQUFFO29CQUNuRSxJQUFJLFNBQVMsS0FBSyxXQUFXLEVBQUU7d0JBQzdCLE9BQU8sQ0FBQyxLQUFLLENBQUUsU0FBUyxDQUFFLENBQUUsT0FBTyxDQUFFLENBQUMsT0FBTyxDQUFDO3FCQUMvQztvQkFDRCxPQUFPLEtBQUssQ0FBQztnQkFDZixDQUFDLENBQUUsQ0FBQyxNQUFNLENBQUM7Z0JBQ1gsSUFBSSxVQUFVO29CQUFHLE9BQU8sSUFBSSxDQUFDO1lBQy9CLENBQUMsQ0FBRSxDQUFDO1lBQ0osTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbEQsSUFBSSxVQUFVLEVBQUU7Z0JBQ2QsSUFBSSxlQUFlLENBQUM7Z0JBQ3BCLElBQUksWUFBWSxDQUFDLE1BQU0sRUFBRTtvQkFDdkIsZUFBZSxHQUFHLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQztpQkFDdEM7Z0JBQ0QsWUFBWSxDQUFDLEdBQUcsQ0FBRSxDQUFFLFdBQVcsRUFBRyxFQUFFO29CQUNsQyxJQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFFLFdBQVcsQ0FBRSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQzFELENBQUMsQ0FBRSxDQUFDO2dCQUNKLElBQUksZUFBZTtvQkFBRyxJQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFFLGVBQWUsQ0FBRSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7YUFDcEY7aUJBQUk7Z0JBQ0gsWUFBWSxDQUFDLEdBQUcsQ0FBRSxDQUFFLFdBQVcsRUFBRyxFQUFFO29CQUNsQyxJQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFFLFdBQVcsQ0FBRSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7b0JBQ3pELElBQUksQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUUsV0FBVyxDQUFFLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFDM0QsQ0FBQyxDQUFFLENBQUM7YUFDTDtRQUNILENBQUMsRUFBRSxHQUFHLENBQUUsQ0FBQztJQUNYLENBQUM7SUFHRDs7T0FFRztJQUNILHdCQUF3QjtRQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFFLENBQUUsT0FBTyxFQUFHLEVBQUU7WUFDM0MsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO2dCQUNwQixJQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUM3RCxJQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUUsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO2FBQ2hFO1FBQ0gsQ0FBQyxDQUFFLENBQUM7SUFDTixDQUFDO0lBR0QsV0FBVyxDQUFFLElBQVksRUFBRSxFQUFVO1FBQ25DLElBQUksSUFBSSxLQUFLLE9BQU8sRUFBRTtZQUNwQixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUUsZUFBZSxFQUFFLEVBQUUsQ0FBRSxDQUFDLEtBQUssQ0FBRSxDQUFFLENBQUMsRUFBRyxFQUFFO2dCQUNsRSxPQUFPLENBQUMsR0FBRyxDQUFFLEdBQUcsRUFBRSxDQUFDLENBQUUsQ0FBQztZQUN4QixDQUFDLENBQUUsQ0FBQztTQUNMO0lBQ0gsQ0FBQztJQUdEOzs7O09BSUc7SUFDSCxrQkFBa0IsQ0FBRSxhQUFxQixFQUFFLEVBQVU7UUFDbkQsSUFBSSxhQUFhLEtBQUssT0FBTyxFQUFFO1lBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSw2QkFBNkIsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBRSxDQUFDO1lBQzVILFNBQVMsQ0FBQyxJQUFJLENBQUUsYUFBYSxFQUFFLEVBQUUsQ0FBRSxDQUFDLElBQUksQ0FBRSxHQUFHLEVBQUU7Z0JBQzdDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLFFBQVEsQ0FBRSxDQUFDO1lBQzlDLENBQUMsQ0FBRSxDQUFDO1NBQ0w7SUFDSCxDQUFDO0lBR0Q7O09BRUc7SUFDSCxXQUFXO1FBQ1QsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7OztZQTdTRixTQUFTLFNBQUU7Z0JBQ1YsUUFBUSxFQUFFLDhCQUE4QjtnQkFDeEMsd3hHQUE0RDs7YUFFN0Q7OztZQWpCbUIsVUFBVTtZQUlyQixhQUFhO1lBSGIsc0JBQXNCO1lBUXRCLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgT25EZXN0cm95LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFBvcEVudGl0eVNjaGVtZVNlcnZpY2UgfSBmcm9tICcuLi9wb3AtZW50aXR5LXNjaGVtZS5zZXJ2aWNlJztcbmltcG9ydCB7IEJ1dHRvbkNvbmZpZyB9IGZyb20gJy4uLy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLWJ1dHRvbi9idXR0b24tY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IFBvcEV4dGVuZENvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1leHRlbmQuY29tcG9uZW50JztcbmltcG9ydCB7IFBvcERvbVNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtZG9tLnNlcnZpY2UnO1xuaW1wb3J0IHsgSXNBcnJheSwgSXNBcnJheVRocm93RXJyb3IsIElzT2JqZWN0LCBJc09iamVjdFRocm93RXJyb3IsIE9iamVjdENvbnRhaW5zVGFnU2VhcmNoLCBUaXRsZUNhc2UsIFRvQXJyYXkgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHsgRW50aXR5U2NoZW1lU2VjdGlvbkNvbmZpZywgRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSwgUHJvZmlsZVNjaGVtZUFzc2V0UG9vbEludGVyZmFjZSB9IGZyb20gJy4uL3BvcC1lbnRpdHktc2NoZW1lLm1vZGVsJztcbmltcG9ydCB7IERpY3Rpb25hcnksIEtleU1hcCwgUG9wRW50aXR5LCBQb3BQb3J0YWwsIFNlcnZpY2VJbmplY3RvciB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgQ2hlY2tib3hDb25maWcgfSBmcm9tICcuLi8uLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1jaGVja2JveC9jaGVja2JveC1jb25maWcubW9kZWwnO1xuaW1wb3J0IHsgUG9wVGFiTWVudVNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi9iYXNlL3BvcC10YWItbWVudS9wb3AtdGFiLW1lbnUuc2VydmljZSc7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5cbkBDb21wb25lbnQoIHtcbiAgc2VsZWN0b3I6ICdsaWItZW50aXR5LXNjaGVtZS1hc3NldC1wb29sJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lbnRpdHktc2NoZW1lLWFzc2V0LXBvb2wuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWVudGl0eS1zY2hlbWUtYXNzZXQtcG9vbC5jb21wb25lbnQuc2NzcycgXVxufSApXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5U2NoZW1lQXNzZXRQb29sQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBwdWJsaWMgbmFtZSA9ICdQb3BFbnRpdHlTY2hlbWVBc3NldFBvb2xDb21wb25lbnQnO1xuXG5cbiAgcHVibGljIHVpID0ge1xuICAgIHNlY3Rpb25zOiA8RW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZVtdPnVuZGVmaW5lZCxcbiAgICBhc3NpZ25CdG5Db25maWdzOiA8QnV0dG9uQ29uZmlnW10+dW5kZWZpbmVkLFxuICAgIGFzc2lnbmFibGVDb25maWdzOiA8RGljdGlvbmFyeTxLZXlNYXA8Q2hlY2tib3hDb25maWc+Pj51bmRlZmluZWQsXG4gICAgYXNzZXRQb29sOiA8UHJvZmlsZVNjaGVtZUFzc2V0UG9vbEludGVyZmFjZVtdPnVuZGVmaW5lZCxcbiAgICBzZWN0aW9uX2tleXM6IDxudW1iZXJbXT51bmRlZmluZWRcbiAgfTtcblxuICBwcm90ZWN0ZWQgYXNzZXQgPSB7XG4gICAgcHJpbWFyeUlkczogPG51bWJlcltdPltdXG4gIH07XG5cblxuICBwcm90ZWN0ZWQgc3J2ID0ge1xuICAgIHNjaGVtZTogPFBvcEVudGl0eVNjaGVtZVNlcnZpY2U+dW5kZWZpbmVkLFxuICAgIHRhYjogPFBvcFRhYk1lbnVTZXJ2aWNlPnVuZGVmaW5lZCxcbiAgICByb3V0ZXI6IDxSb3V0ZXI+U2VydmljZUluamVjdG9yLmdldCggUm91dGVyIClcbiAgfTtcblxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0gZWxcbiAgICogQHBhcmFtIF9kb21SZXBvIC0gdHJhbnNmZXJcbiAgICogQHBhcmFtIF9zY2hlbWVSZXBvIC0gdHJhbnNmZXJcbiAgICogQHBhcmFtIF90YWJSZXBvIC0gdHJhbnNmZXJcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgX2RvbVJlcG86IFBvcERvbVNlcnZpY2UsXG4gICAgcHJvdGVjdGVkIF9zY2hlbWVSZXBvOiBQb3BFbnRpdHlTY2hlbWVTZXJ2aWNlLFxuICAgIHByb3RlY3RlZCBfdGFiUmVwbzogUG9wVGFiTWVudVNlcnZpY2VcbiAgKXtcbiAgICBzdXBlcigpO1xuXG5cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoIGFzeW5jKCByZXNvbHZlICkgPT4ge1xuICAgICAgICB0aGlzLmRvbS5zZXNzaW9uLnNlYXJjaFZhbHVlID0gJyc7XG4gICAgICAgIC8vICMxOiBUcmFuc2ZlciBpbiBtaXNjIGFzc2V0cyBmcm9tIHRoZSBzY2hlbWVSZXBvXG4gICAgICAgIHRoaXMuZG9tLnN0YXRlLnNlYXJjaGluZyA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuYXNzZXQucHJpbWFyeUlkcyA9IHRoaXMuc3J2LnNjaGVtZS51aS5wcmltYXJ5SWRzO1xuXG4gICAgICAgIGF3YWl0IHRoaXMuZG9tLnNldFdpdGhDb21wb25lbnRJbm5lckhlaWdodCggJ1BvcEVudGl0eVRhYkNvbHVtbkNvbXBvbmVudCcsIHRoaXMucG9zaXRpb24sIDIzMCwgNjAwICk7XG4gICAgICAgIHRoaXMuZG9tLmhlaWdodC5jb250ZW50ID0gdGhpcy5kb20uaGVpZ2h0LmlubmVyIC0gOTU7XG4gICAgICAgIHRoaXMuX3NldFVpQXNzZXRzKCk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcblxuICAgIHRoaXMuZG9tLnByb2NlZWQgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoIGFzeW5jKCByZXNvbHZlICkgPT4ge1xuICAgICAgICAvLyAjNTogUmVhcHBseSBhbnkgb25TZXNzaW9uIHNlYXJjaCB0aGF0IG1heSBoYXZlIGV4aXN0ZWRcbiAgICAgICAgdGhpcy5vbkFwcGx5VWlTZWFyY2goIHRoaXMuZG9tLnNlc3Npb24uc2VhcmNoVmFsdWUgKTtcblxuICAgICAgICAvLyAjNjogRGlzYWJsZSB0aGUgdWkgYXNzaWduIGJ1dHRvbnMgZm9yIHRoZSBpbml0aWFsIHZpZXdcbiAgICAgICAgdGhpcy5vbkRpc2FibGVVaUFzc2lnbkJ1dHRvbnMoKTtcblxuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgcHVycG9zZSBvZiB0aGlzIGNvbXBvbmVudCBpcyB0byBwcm92aWRlIHRoZSB1c2VyIHdpdGggbGlzdHMgb2YgYWxsIGF2YWlsYWJsZSB0eXBlcyB0aGF0IHRoZXkgY2FuIGFzc2lnbiBpbnRvIGEgc2NoZW1lIGxheW91dFxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICBwcml2YXRlIF9zZXRVaUFzc2V0cygpe1xuICAgIHRoaXMudWkuc2VjdGlvbnMgPSB0aGlzLnNydi5zY2hlbWUudWkuc2VjdGlvbnM7ICAvLyB0cmFuc2ZlciBzZWN0aW9ucyBmcm9tIHNjaGVtZVJlcG9cbiAgICB0aGlzLnVpLmFzc2lnbmFibGVDb25maWdzID0gdGhpcy5zcnYuc2NoZW1lLnVpLmFzc2lnbmFibGVDb25maWdzOyAgLy8gdHJhbnNmZXIgYXNzaWduYWJsZUNvbmZpZ3MgZm9yIGF0dGFjaGluZyBhc3NldHMgZnJvbSBwb29sc1xuICAgIC8vICMyOiBCdWlsZCB0aGUgY29uZmlnIGZvciB0aGUgYnV0dG9ucyB0aGF0IHRoZSB1c2VyIHdpbGwgcHVzaCB0byBhc3NpZ24gaXRlbXMgdG8gYSBsYXlvdXQgcG9zaXRpb25cbiAgICB0aGlzLnVpLmFzc2lnbkJ0bkNvbmZpZ3MgPSBbXTsgLy8gY3JlYXRlIGEgYnV0dG9uIGZvciBlYWNoIHNlY3Rpb24gdG8gYXNzaWduIGFzc2V0cyBmcm9tIHRoZSBwb29scyB3aXRoXG4gICAgdGhpcy51aS5zZWN0aW9ucy5tYXAoICggc2VjdGlvbiApID0+IHtcbiAgICAgIHRoaXMudWkuYXNzaWduQnRuQ29uZmlnc1sgc2VjdGlvbi5wb3NpdGlvbiBdID0gbmV3IEJ1dHRvbkNvbmZpZygge1xuICAgICAgICBidWJibGU6IHRydWUsXG4gICAgICAgIGV2ZW50OiAnYXNzaWduJyxcbiAgICAgICAgdmFsdWU6ICdDb2x1bW4gJyArICggK3NlY3Rpb24ucG9zaXRpb24gKSxcbiAgICAgICAgc2l6ZTogMzAsXG4gICAgICAgIHRleHQ6IDE2LFxuICAgICAgICBpY29uOiBudWxsLFxuICAgICAgfSApO1xuICAgIH0gKTtcblxuXG4gICAgLy8gIzQ6IENvbmZpZ3VyZSB0aGUgYXNzZXQgcHBvbCBpdGVtcyB0aGF0IGEgdXNlciBjYW4gY2hvb3NlIGZyb20gdG8gcG9zaXRpb24gaW4gdGhlIGxheW91dFxuICAgIGxldCBhc3NldFBvb2wgPSBJc09iamVjdFRocm93RXJyb3IoIHRoaXMuc3J2LnNjaGVtZS51aS5hc3NldFBvb2wsIHRydWUsIGAke3RoaXMubmFtZX06Y29uZmlndXJlRG9tOiAtIHRoaXMuc3J2LnNjaGVtZS5hc3NldC5hc3NldF9wb29sYCApID8gSlNPTi5wYXJzZSggSlNPTi5zdHJpbmdpZnkoIHRoaXMuc3J2LnNjaGVtZS51aS5hc3NldFBvb2wgKSApIDoge307IC8vIHRyYW5zZmVyIGFzc2V0X3Bvb2xzIGZyb20gc2NoZW1lUmVwbyBhbmQgbXV0YXRlXG4gICAgYXNzZXRQb29sID0gT2JqZWN0LmtleXMoIGFzc2V0UG9vbCApLm1hcCggKCBhc3NldFR5cGVLZXkgKSA9PiB7XG4gICAgICB0aGlzLmRvbS5zdGF0ZVsgYXNzZXRUeXBlS2V5IF0gPSB7XG4gICAgICAgIGV4cGFuZGVkOiB0cnVlLFxuICAgICAgICB2aXNpYmxlOiB7fSwgLy8gdXNlZCB3aXRoIHRoZSBzZWFyY2ggbWVjaGFuaXNtXG4gICAgICAgIGF0dGFjaDoge30sIC8vIHVzZWQgd2l0aCB0aGUgc2VhcmNoIG1lY2hhbmlzbVxuICAgICAgfTtcbiAgICAgIHJldHVybiA8UHJvZmlsZVNjaGVtZUFzc2V0UG9vbEludGVyZmFjZT57XG4gICAgICAgIG5hbWU6IGFzc2V0VHlwZUtleSxcbiAgICAgICAgYXNzZXRfdHlwZTogYXNzZXRUeXBlS2V5LFxuICAgICAgICBkaXNwbGF5OiBUaXRsZUNhc2UoIGFzc2V0VHlwZUtleSApLFxuICAgICAgICBkYXRhOiBhc3NldFBvb2xbIGFzc2V0VHlwZUtleSBdLFxuICAgICAgICBsaXN0OiBUb0FycmF5KCBhc3NldFBvb2xbIGFzc2V0VHlwZUtleSBdIClcbiAgICAgIH07XG4gICAgfSApO1xuXG4gICAgdGhpcy51aS5hc3NldFBvb2wgPSBJc0FycmF5VGhyb3dFcnJvciggYXNzZXRQb29sLCB0cnVlLCBgJHt0aGlzLm5hbWV9OmNvbmZpZ3VyZURvbTogLSBwb29sc2AgKSA/IGFzc2V0UG9vbCA6IFtdO1xuICB9XG5cblxuICAvKipcbiAgICogQ2VhciB0aGUgc2VhcmNoIGlucHV0IGFuZCByZXNldCB0aGUgYXNzZXQgcG9vbCBsaXN0XG4gICAqL1xuICBvblVpU2VhcmNoVmFsdWVDbGVhcigpe1xuICAgIHRoaXMuZG9tLnNlc3Npb24uc2VhcmNoVmFsdWUgPSAnJztcbiAgICB0aGlzLm9uQXBwbHlVaVNlYXJjaCggdGhpcy5kb20uc2Vzc2lvbi5zZWFyY2hWYWx1ZSApO1xuICB9XG5cblxuICAvKipcbiAgICogQXBwbHkgdGhlIHNlYXJjaCB2YWx1ZSB0aGUgdXNlciBlbnRlcmVkIHRvIHRoZSBhc3NldCBwb29sIGxpc3RcbiAgICogQHBhcmFtIHNlYXJjaFZhbHVlXG4gICAqIEBwYXJhbSBjb2xcbiAgICovXG4gIG9uQXBwbHlVaVNlYXJjaCggc2VhcmNoVmFsdWU6IHN0cmluZywgY29sID0gJycgKXtcbiAgICBpZiggdGhpcy5kb20uZGVsYXkuc2VhcmNoICkgY2xlYXJUaW1lb3V0KCB0aGlzLmRvbS5kZWxheS5zZWFyY2ggKTtcbiAgICB0aGlzLmRvbS5kZWxheS5zZWFyY2ggPSBzZXRUaW1lb3V0KCAoKSA9PiB7XG4gICAgICBpZiggc2VhcmNoVmFsdWUubGVuZ3RoICl7XG4gICAgICAgIHRoaXMudWkuYXNzZXRQb29sLm1hcCggKCBwb29sICkgPT4ge1xuICAgICAgICAgIGlmKCBJc09iamVjdCggdGhpcy5kb20uc3RhdGVbIHBvb2wubmFtZSBdICkgKXtcbiAgICAgICAgICAgIHBvb2wubGlzdC5tYXAoICggaXRlbSApID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5kb20uc3RhdGVbIHBvb2wubmFtZSBdLnZpc2libGVbIGl0ZW0uaWQgXSA9IE9iamVjdENvbnRhaW5zVGFnU2VhcmNoKCB7XG4gICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgbmFtZTogaXRlbS5uYW1lLFxuICAgICAgICAgICAgICB9LCBzZWFyY2hWYWx1ZSApID09PSB0cnVlO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5kb20uc3RhdGUuc2VhcmNoaW5nID0gdHJ1ZTtcbiAgICAgICAgfSApO1xuXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy51aS5hc3NldFBvb2wubWFwKCAoIHBvb2wgKSA9PiB7XG5cbiAgICAgICAgICBpZiggSXNPYmplY3QoIHRoaXMuZG9tLnN0YXRlWyBwb29sLm5hbWUgXSApICl7XG4gICAgICAgICAgICBwb29sLmxpc3QubWFwKCAoIGl0ZW0gKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuZG9tLnN0YXRlWyBwb29sLm5hbWUgXS52aXNpYmxlWyBpdGVtLmlkIF0gPSAxO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuICAgICAgICB0aGlzLmRvbS5zdGF0ZS5zZWFyY2hpbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9LCAyMDAgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSB1c2VyIGNhbiBleHBhbmQgYW4gYXNzZXQgcG9vbCB0eXBlIHRvIGJlIG9wZW4gb3IgY2xvc2VkXG4gICAqIEBwYXJhbSBwb29sXG4gICAqL1xuICBvblRvZ2dsZVBvb2xFeHBhbnNpb24oIHBvb2wgKXtcbiAgICBpZiggcG9vbCAmJiBwb29sLm5hbWUgaW4gdGhpcy5kb20uc3RhdGUgKXtcbiAgICAgIHRoaXMuZG9tLnN0YXRlWyBwb29sLm5hbWUgXS5leHBhbmRlZCA9ICF0aGlzLmRvbS5zdGF0ZVsgcG9vbC5uYW1lIF0uZXhwYW5kZWQ7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBpcyB0cmlnZ2VyZWQgd2hlbiBhIHVzZXIgc2VsZWN0cyBhIGNoZWNrYm94IGluZGljYXRpbmcgdGhhdCBpdCB3aWxsIGJlIGFzc2lnbmVkIHRvIGEgcG9zaXRpb24gb2YgdGhlIGxheW91dFxuICAgKiBAcGFyYW0gYXNzZXRfdHlwZVxuICAgKiBAcGFyYW0gaXRlbUlkXG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKi9cbiAgb25Bc3NldFBvb2xJdGVtQXR0YWNoaW5nKCBhc3NldF90eXBlOiBzdHJpbmcsIGl0ZW1JZDogbnVtYmVyLCB2YWx1ZTogYm9vbGVhbiApe1xuICAgIHRoaXMuc3J2LnNjaGVtZS5vbkFzc2V0QXR0YWNoaW5nKCBhc3NldF90eXBlLCBpdGVtSWQsIHZhbHVlICk7XG4gICAgdGhpcy5vbkVuYWJsZVVpQXNzaWduQnV0dG9ucygpO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBpcyB0cmlnZ2VyZWQgd2hlbiBhIHVzZXIgc2VsZWN0cyBhIHBvc2l0aW9uIGJ1dHRvbiBpbmRpY2F0aW5nIHRoZXkgd2FudCB0aGUgc2VsZWN0ZWQgYXNzZXQgcG9vbCBpdGVtcyBtb3ZlZCB0byBhIHBvc2l0aW9uIG9mIHRoZSBsYXlvdXRcbiAgICogQHBhcmFtIHNlY3Rpb25cbiAgICogQHBhcmFtICRldmVudFxuICAgKi9cbiAgb25TZWN0aW9uQXR0YWNoaW5nSXRlbXMoIHNlY3Rpb246IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UsICRldmVudCApe1xuICAgIHRoaXMub25EaXNhYmxlVWlBc3NpZ25CdXR0b25zKCk7XG4gICAgc2VjdGlvbi5tb2RpZmllZCA9IHRydWU7XG4gICAgdGhpcy5zcnYudGFiLnNob3dBc0xvYWRpbmcoIHRydWUgKTtcbiAgICB0aGlzLnNydi5zY2hlbWUub25BdHRhY2hpbmdBc3NldHNUb1Bvc2l0aW9uKCBzZWN0aW9uICkudGhlbiggKCBjaGlsZHJlbjogRW50aXR5U2NoZW1lU2VjdGlvbkNvbmZpZ1tdICkgPT4ge1xuICAgICAgaWYoIElzQXJyYXkoIGNoaWxkcmVuLCB0cnVlICkgKXtcbiAgICAgICAgc2VjdGlvbi5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgICAgICB0aGlzLnNydi5zY2hlbWUub25VcGRhdGUoIFsgc2VjdGlvbiBdICkudGhlbiggKCkgPT4ge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCAnZG9uZSB3aXRoIGFkZCAnLCBzZWN0aW9uICk7XG4gICAgICAgICAgdGhpcy5zcnYudGFiLnNob3dBc0xvYWRpbmcoIGZhbHNlICk7XG4gICAgICAgICAgdGhpcy5vbkRpc2FibGVVaUFzc2lnbkJ1dHRvbnMoKTtcbiAgICAgICAgfSApO1xuICAgICAgfWVsc2V7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCAndXBkYXRlIHNlY3Rpb24gZmFpbGVkJywgc2VjdGlvbiApO1xuICAgICAgICB0aGlzLnNydi50YWIuc2hvd0FzTG9hZGluZyggZmFsc2UgKTtcbiAgICAgICAgdGhpcy5vbkRpc2FibGVVaUFzc2lnbkJ1dHRvbnMoKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIHRyaWdnZXJlZCBldmVyeSB0aW1lIHRoZSB1c2VyIHNlbGVjdHMgYSBjaGVja2JveCBvZiBhbiBhc3NldCBwb29sIGl0ZW1cbiAgICogVGhpcyBzaG91bGQgZGV0ZXJtaW5lIHdoaWNoIHBvc2l0aW9ucyBvZiB0aGUgbGF5b3V0IGFyZSBlbGlnaWJsZSBiYXNlIG9uIHRoZSBzZXQgb2YgdGhlIGl0ZW1zIHNlbGVjdGVkXG4gICAqIEFzc2V0IFBvb2wgaXRlbXMgc2hvdWxkIGJlIGRlc2lnbmF0ZWQgYXMgY29tcGFjdCBvciBub3QsIHRoZSBsYXN0IHBvc2l0aW9uIG9mIHRoZSBsYXlvdXQgaXMgcmVzZXJ2ZWQgZm9yIGxhcmdlciBtb2R1bGVzIGFuZCBjb21wYWN0IGl0ZW1zIHNob3VsZCBub3QgZ28gaW4gaXRcbiAgICovXG4gIG9uRW5hYmxlVWlBc3NpZ25CdXR0b25zKCl7XG4gICAgaWYoICF0aGlzLnVpLnNlY3Rpb25fa2V5cyApe1xuICAgICAgdGhpcy51aS5zZWN0aW9uX2tleXMgPSB0aGlzLnVpLnNlY3Rpb25zLm1hcCggKCBzLCBpICkgPT4gcy5wb3NpdGlvbiApO1xuICAgIH1cbiAgICBpZiggdGhpcy5kb20uZGVsYXkuY29uZmlndXJlX2J1dHRvbnMgKSBjbGVhclRpbWVvdXQoIHRoaXMuZG9tLmRlbGF5LmNvbmZpZ3VyZV9idXR0b25zICk7XG4gICAgdGhpcy5kb20uZGVsYXkuY29uZmlndXJlX2J1dHRvbnMgPSBzZXRUaW1lb3V0KCAoKSA9PiB7XG4gICAgICBjb25zdCBpdGVtcyA9IHRoaXMuc3J2LnNjaGVtZS5fZ2V0QXNzZXRzVG9BdHRhY2goKTtcbiAgICAgIGxldCBub3RDb21wYWN0O1xuICAgICAgY29uc3QgYXNzZXRUeXBlcyA9IE9iamVjdC5rZXlzKCBpdGVtcyApO1xuICAgICAgYXNzZXRUeXBlcy5zb21lKCAoIGFzc2V0VHlwZTogc3RyaW5nICkgPT4ge1xuICAgICAgICBub3RDb21wYWN0ID0gT2JqZWN0LmtleXMoIGl0ZW1zWyBhc3NldFR5cGUgXSApLmZpbHRlciggKCBhc3NldElEICkgPT4ge1xuICAgICAgICAgIGlmKCBhc3NldFR5cGUgPT09ICdjb21wb25lbnQnICl7XG4gICAgICAgICAgICByZXR1cm4gIWl0ZW1zWyBhc3NldFR5cGUgXVsgYXNzZXRJRCBdLmNvbXBhY3Q7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSApLmxlbmd0aDtcbiAgICAgICAgaWYoIG5vdENvbXBhY3QgKSByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gKTtcbiAgICAgIGNvbnN0IHBvc2l0aW9uS2V5cyA9IHRoaXMudWkuc2VjdGlvbl9rZXlzLnNsaWNlKCk7XG4gICAgICBpZiggbm90Q29tcGFjdCApe1xuICAgICAgICBsZXQgbGFzdFBvc2l0aW9uS2V5O1xuICAgICAgICBpZiggcG9zaXRpb25LZXlzLmxlbmd0aCApe1xuICAgICAgICAgIGxhc3RQb3NpdGlvbktleSA9IHBvc2l0aW9uS2V5cy5wb3AoKTtcbiAgICAgICAgfVxuICAgICAgICBwb3NpdGlvbktleXMubWFwKCAoIHBvc2l0aW9uS2V5ICkgPT4ge1xuICAgICAgICAgIHRoaXMudWkuYXNzaWduQnRuQ29uZmlnc1sgcG9zaXRpb25LZXkgXS5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIH0gKTtcbiAgICAgICAgaWYoIGxhc3RQb3NpdGlvbktleSApIHRoaXMudWkuYXNzaWduQnRuQ29uZmlnc1sgbGFzdFBvc2l0aW9uS2V5IF0uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgIH1lbHNle1xuICAgICAgICBwb3NpdGlvbktleXMubWFwKCAoIHBvc2l0aW9uS2V5ICkgPT4ge1xuICAgICAgICAgIHRoaXMudWkuYXNzaWduQnRuQ29uZmlnc1sgcG9zaXRpb25LZXkgXS5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMudWkuYXNzaWduQnRuQ29uZmlnc1sgcG9zaXRpb25LZXkgXS5jb2xvciA9ICdhY2NlbnQnO1xuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgfSwgMTAwICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgZGlzYWJsZSBvciBjbGVhciB0aGUgcG9zaXRpb24gYXNzaWduIGJ1dHRvbnNcbiAgICovXG4gIG9uRGlzYWJsZVVpQXNzaWduQnV0dG9ucygpe1xuICAgIHRoaXMuY29yZS5lbnRpdHkuY2hpbGRyZW4ubWFwKCAoIHNlY3Rpb24gKSA9PiB7XG4gICAgICBpZiggc2VjdGlvbi5wb3NpdGlvbiApe1xuICAgICAgICB0aGlzLnVpLmFzc2lnbkJ0bkNvbmZpZ3NbIHNlY3Rpb24ucG9zaXRpb24gXS5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMudWkuYXNzaWduQnRuQ29uZmlnc1sgc2VjdGlvbi5wb3NpdGlvbiBdLmNvbG9yID0gJ2RlZmF1bHQnO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfVxuXG5cbiAgb25Bc3NldExpbmsoIHR5cGU6IHN0cmluZywgaWQ6IG51bWJlciApe1xuICAgIGlmKCB0eXBlID09PSAnZmllbGQnICl7XG4gICAgICB0aGlzLnNydi5yb3V0ZXIubmF2aWdhdGVCeVVybCggYC9jaXMvZmllbGRzLyR7aWR9YCApLmNhdGNoKCAoIGUgKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCAnZScsIGUgKTtcbiAgICAgIH0gKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBIHVzZXIgY2FuIGNsaWNrIG9uIGFuIGl0ZW0gaW4gdGhlIGFzc2V0IHBvb2wgdG8gdmlldyBhIG1vZGFsIG9mIHRoYXQgc3BlY2lmaWMgZW50aXR5SWQgaXRlbVxuICAgKiBAcGFyYW0gaW50ZXJuYWxfbmFtZWFcbiAgICogQHBhcmFtIGlkXG4gICAqL1xuICBvblZpZXdFbnRpdHlQb3J0YWwoIGludGVybmFsX25hbWU6IHN0cmluZywgaWQ6IG51bWJlciApe1xuICAgIGlmKCBpbnRlcm5hbF9uYW1lID09PSAnZmllbGQnICl7XG4gICAgICB0aGlzLmNvcmUuY2hhbm5lbC5lbWl0KCB7IHNvdXJjZTogdGhpcy5uYW1lLCB0YXJnZXQ6ICdQb3BFbnRpdHlUYWJDb2x1bW5Db21wb25lbnQnLCB0eXBlOiAnY29tcG9uZW50JywgbmFtZTogJ3Njcm9sbFRvJyB9ICk7XG4gICAgICBQb3BQb3J0YWwudmlldyggaW50ZXJuYWxfbmFtZSwgaWQgKS50aGVuKCAoKSA9PiB7XG4gICAgICAgIHRoaXMuc3J2LnNjaGVtZS51aS5yZWZyZXNoLm5leHQoICdyZWxvYWQnICk7XG4gICAgICB9ICk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogQ2xlYW4gdXAgdGhlIGRvbSBvZiB0aGlzIGNvbXBvbmVudFxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG59XG4iXX0=