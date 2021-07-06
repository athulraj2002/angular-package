import { Component, ElementRef, Input } from '@angular/core';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopPipeService } from '../../../../services/pop-pipe.service';
import { PopBusiness, ServiceInjector } from '../../../../pop-common.model';
import { ArrayMapSetter, GetSessionSiteVar, IsArray, IsObject, JsonCopy, ObjectContainsTagSearch } from '../../../../pop-common-utility';
import { fadeInOut, slideInOut } from '../../../../pop-common-animations.model';
import { PopCacFilterBarService } from '../pop-cac-filter.service';
export class PopCacFilterViewComponent extends PopExtendComponent {
    constructor(el) {
        super();
        this.el = el;
        this.name = 'PopCacFilterViewComponent';
        this.ui = {
            config: undefined,
            entities: undefined,
            map: {}
        };
        this.asset = {
            filter: undefined // the current filter applied to all columns, this is the (finished product) that we want to be stored in the base service
        };
        this.srv = {
            filter: ServiceInjector.get(PopCacFilterBarService),
            pipe: ServiceInjector.get(PopPipeService),
        };
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.asset.filter = this.srv.filter.getFilter();
                this.ui.entities = this.srv.filter.getEntities();
                this.ui.map.entities = ArrayMapSetter(this.ui.entities, 'internal_name');
                this.ui.config = this.srv.filter.getConfig();
                this._setDefaultState();
                this._setEntityConfig();
                this.dom.setSubscriber(`data-reset`, this.srv.filter.event.data.subscribe((caller) => {
                    this.dom.setTimeout(`data-reset`, () => {
                        if (IsArray(this.ui.entities, true)) {
                            const first = this.ui.entities[0];
                            first.options.map((option) => {
                                first.display[option.id] = true;
                            });
                            this._checkVisibleForAll(first);
                            this._updateEntitySelectedText(first);
                            this._onEntityFeedUpdate(first);
                        }
                        this.ui.entities.map((entity, index) => {
                            entity.totalOptions = entity.options.length;
                            entity.filter = Object.keys(entity.selected).filter((id) => entity.selected[id]);
                            entity.totalSelected = entity.filter.length;
                        });
                        this.onUpdateOptionsDisplay(0);
                    }, 0);
                }));
                this.dom.setTimeout('init', () => {
                    this.events.emit({ source: this.name, type: 'filter', name: 'init', data: this.asset.filter });
                });
                return resolve(true);
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
     * Trigger an entity column to apply search
     * @param entity
     */
    onApplySearch(entity) {
        if (this.dom.state.searchDelay)
            clearTimeout(this.dom.state.searchDelay);
        this.dom.setTimeout(`search-delay`, () => {
            entity.options.map((option) => {
                entity.hidden[option.id] = ObjectContainsTagSearch(option, entity.search) ? false : true;
            });
            this._onEntityFeedUpdate(entity);
            this._checkVisibleForAll(entity);
        }, 200);
    }
    /**
     * Checks/Unchecks all the options within an entity column
     * @param entity
     */
    onCheckAll(entity) {
        if (IsObject(entity, true) && !entity.single) {
            entity.options.filter((option) => !entity.hidden[option.id]).map((option) => {
                entity.selected[option.id] = +entity.display[option.id] ? entity.checkAll : false;
            });
            entity.filter = Object.keys(entity.selected).filter((id) => entity.selected[id]);
            entity.totalSelected = entity.filter.length;
            entity.allSelected = entity.totalSelected === entity.totalAvailable;
            this._checkVisibleForAll(entity);
            this._updateEntitySelectedText(entity);
            this.onUpdateOptionsDisplay(this.ui.map.entities[entity.internal_name]);
            this.dom.state.filterNeedsApplied = true;
        }
    }
    /**
     * Handle when an option selection has changed
     * Detects progmatic changes
     * @param entity
     */
    onCheckboxChange(event, entity, id) {
        event.preventDefault();
        entity.selected[id] = !entity.selected[id];
        this.dom.setTimeout(`update-${entity.internal_name}-column`, () => {
            entity.filter = Object.keys(entity.selected).filter((key) => entity.selected[key]);
            entity.totalSelected = entity.filter.length;
            entity.allSelected = entity.totalSelected === entity.totalAvailable;
            this._checkVisibleForAll(entity);
            this._updateEntitySelectedText(entity);
            this.onUpdateOptionsDisplay(this.ui.map.entities[entity.internal_name]);
            this.dom.state.filterNeedsApplied = true;
        }, 100);
    }
    /**
     * Handle when an option selection has changed
     * Detects manual changes
     * @param entity
     */
    onRadioChange(event, entity, id) {
        event.preventDefault();
        if (entity.single) {
            entity.checkAll = false;
            entity.allSelected = false;
            entity.indeterminate = false;
            entity.filter = [String(id)];
            entity.totalSelected = entity.filter.length;
            entity.options.map((option) => {
                if (+option.id !== +id) {
                    entity.selected[option.id] = false;
                }
                else {
                    entity.selected[option.id] = true;
                    entity.selectedText = option.name;
                }
            });
            this.onUpdateOptionsDisplay(this.ui.map.entities[entity.internal_name]);
            this.dom.state.filterNeedsApplied = true;
        }
    }
    /**
     * The menu bar has been opened or closed
     * @param entity
     */
    onToggleOpen(entity = null) {
        this.dom.state.open = !this.dom.state.open;
        if (this.dom.state.open && entity) {
            setTimeout(() => {
                this.el.nativeElement.querySelector(`#${entity}-search-input`).focus();
            });
        }
        this.events.emit({ source: this.name, type: 'filter', name: 'state', model: 'open', data: this.dom.state.open });
    }
    /**
     * Event handler for the click of the reset button
     * @returns void
     */
    resetFilter() {
        this.asset.filter = {};
        this.ui.entities.map((entity, index) => {
            if (entity.single) {
                this._setSingleEntityConfig(entity, index);
            }
            else {
                this._setMultipleEntityConfig(entity, index);
            }
        });
        this.asset.filter = this._getCurrentFilter();
        this.dom.state.filterNeedsApplied = false;
        this.dom.state.currentFilterRelevant = false;
        this.events.emit({ source: this.name, type: 'filter', name: 'clear', data: this.asset.filter });
    }
    /**
     * Emits the apply filter event, called
     * when the apply filter button is clicked.
     * @returns void
     */
    applyFilter() {
        if (!this.ui.config.invalid) {
            this.asset.filter = this._getCurrentFilter();
            this.dom.state.currentFilterRelevant = this._isCurrentFilterRelevant();
            this.dom.state.filterNeedsApplied = false;
            this.events.emit({ source: this.name, type: 'filter', name: 'apply', data: this.asset.filter });
            // close on apply ?
            if (this.ui.config.display !== 'static') {
                this.dom.state.open = false;
                this.events.emit({ source: this.name, type: 'filter', name: 'state', model: 'open', data: this.dom.state.open });
            }
        }
    }
    trackByFn(index, item) {
        if (!item)
            return null;
        return item.id;
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Determne if all the visible options are either all checked or unchecked
     * @param entity
     * @private
     */
    _checkForIndeterminate(entity) {
        const selectedVisible = entity.options.filter((option) => !entity.hidden[option.id] && entity.display[option.id] && entity.selected[option.id]).length;
        entity.indeterminate = selectedVisible && selectedVisible < entity.totalVisible ? true : false;
    }
    /**
     * Trigger the column list to update with filtered options
     * @param entity
     */
    _onEntityFeedUpdate(entity) {
        const list = entity.options.filter(option => entity.display[option.id] && !entity.hidden[option.id]);
        if (!entity.allSelected) {
            list.sort((a, b) => {
                if (entity.selected[a.id] && !entity.selected[b.id])
                    return -1;
                if (!entity.selected[a.id] && entity.selected[b.id])
                    return 1;
            });
        }
        entity.feed.next(list);
    }
    /**
     * Updates the select configurations based on the filter bar configurations
     * @returns void
     */
    _setEntityConfig() {
        this.dom.state.loading = true;
        this.ui.entities.map((entity, index) => {
            if (entity.single) {
                this._setSingleEntityConfig(entity, index);
            }
            else {
                this._setMultipleEntityConfig(entity, index);
            }
            entity.totalAvailable = entity.options.length;
            entity.totalOptions = entity.options.length;
            entity.totalVisible = Object.keys(entity.display).filter((id) => entity.display[id] && !entity.hidden[id]).length;
        });
        this.dom.state.filterNeedsApplied = false;
        this.dom.state.currentFilterRelevant = this._isCurrentFilterRelevant();
        if (!this.dom.state.currentFilterRelevant) {
            this.srv.filter.clearFilters();
        }
    }
    /**
     * Configure a radio enity config
     * @param entity
     * @param index
     * @private
     */
    _setSingleEntityConfig(entity, index) {
        let first = entity.options[0];
        entity.checkAll = false;
        entity.indeterminate = false;
        if (IsArray(this.asset.filter[entity.internal_name], true)) {
            const asset = this.srv.filter.getAsset(entity.internal_name, +this.asset.filter[entity.internal_name][0]);
            first = { id: this.asset.filter[entity.internal_name][0], name: IsObject(asset, ['name']) ? asset.name : 'Name' };
        }
        entity.filter = [first.id];
        entity.selectedText = first.name;
        entity.totalSelected = 1;
        entity.hidden = {};
        if (index === 0) {
            entity.options.map((option) => {
                entity.display[option.id] = true;
                entity.hidden[option.id] = false;
                entity.selected[option.id] = false;
            });
            entity.selected[first.id] = true;
        }
        else {
            const prevIndex = +index - 1;
            const prevEntity = this.ui.entities[prevIndex];
            entity.options.map((option) => {
                entity.display[option.id] = prevEntity.selected[option.id];
                entity.hidden[option.id] = false;
                entity.selected[option.id] = false;
            });
            entity.selected[first.id] = true;
        }
        this._onEntityFeedUpdate(entity);
    }
    /**
     * Configure a multiple checkbox entity config
     * @param entity
     * @param index
     * @private
     */
    _setMultipleEntityConfig(entity, index) {
        const existingFilter = IsArray(this.asset.filter[entity.internal_name], true);
        entity.filter = existingFilter ? JsonCopy(this.asset.filter[entity.internal_name]) : [];
        // console.log('_setMultipleEntityConfig', entity.name, index, entity.filter.length);
        if (entity.filter.length) {
            entity.checkAll = false;
            entity.indeterminate = true;
        }
        else {
            entity.checkAll = true;
            entity.indeterminate = false;
        }
        entity.totalSelected = entity.checkAll ? entity.options.length : entity.filter.length;
        if (index === 0) {
            entity.options.map((option) => {
                entity.selected[option.id] = entity.checkAll ? true : entity.filter.includes(String(option.id));
                entity.display[option.id] = true;
                entity.hidden[option.id] = false;
            });
            entity.totalAvailable = entity.options.length;
            entity.totalSelected = existingFilter ? entity.filter.length : entity.options.length;
            entity.allSelected = entity.totalSelected === entity.totalAvailable;
            this._checkVisibleForAll(entity);
            this._updateEntitySelectedText(entity);
        }
        else {
            const prevIndex = +index - 1;
            const prevEntity = this.ui.entities[prevIndex];
            entity.options.map((option) => {
                entity.selected[option.id] = entity.checkAll ? true : prevEntity.filter.includes(String(option[prevEntity.child_link]));
                entity.display[option.id] = prevEntity.selected[option[prevEntity.child_link]];
                entity.hidden[option.id] = false;
            });
            entity.totalAvailable = entity.options.length;
            entity.totalSelected = existingFilter ? entity.filter.length : entity.options.length;
            entity.allSelected = entity.totalSelected === entity.totalAvailable;
            this._checkVisibleForAll(entity);
            this._updateEntitySelectedText(entity);
        }
        this._onEntityFeedUpdate(entity);
    }
    /**
     * Cascade changes to all columns of the right of the column that made changes
     * @param entityName
     */
    onUpdateOptionsDisplay(changedIndex) {
        this.dom.setTimeout(`options-update-${changedIndex}`, () => {
            let invalid = false;
            this.ui.entities.map((entity, index) => {
                const inView = this.ui.config.view.includes(entity.internal_name);
                if (!entity.totalSelected && inView)
                    invalid = true;
                if (index > changedIndex) {
                    const prevIndex = +index - 1;
                    const prevEntity = this.ui.entities[prevIndex];
                    entity.options.map((option) => {
                        entity.display[option.id] = prevEntity.allSelected ? true : prevEntity.filter.includes(String(option[prevEntity.child_link]));
                        if (!entity.display[option.id]) {
                            entity.selected[option.id] = false;
                        }
                    });
                    this._onEntityFeedUpdate(entity);
                    if (!(inView)) {
                        entity.options.filter((option) => !entity.hidden[option.id]).map((option) => {
                            entity.selected[option.id] = +entity.display[option.id] ? true : false;
                        });
                    }
                    entity.filter = Object.keys(entity.selected).filter((id) => entity.selected[id]);
                    entity.totalSelected = entity.filter.length;
                    if (!entity.totalSelected && this.ui.config.view.includes(entity.internal_name))
                        invalid = true;
                    this._checkVisibleForAll(entity);
                    this._updateEntitySelectedText(entity);
                }
            });
            this.ui.config.invalid = invalid;
        }, 50);
    }
    _setDefaultState() {
        if (this.ui.config.display === 'static')
            this.dom.state.open = true;
        this.dom.state = Object.assign(Object.assign({}, this.dom.state), {
            differentEntities: false,
            searchDelay: undefined,
            loading: false,
            open: false,
            loaded: false,
            currentFilterRelevant: false,
            filterNeedsApplied: false, // flags when user needs to apply changes to the filter
        });
        this.dom.state.open = IsObject(PopBusiness, ['id']) ? GetSessionSiteVar(`Business.${PopBusiness.id}.Filter.open`, false) : false;
    }
    /**
     * Update the text appears in the header of each entity column
     * @param entity
     */
    _updateEntitySelectedText(entity) {
        entity.totalText = `${entity.totalAvailable} ${entity.name} available.`;
        if (this.ui.map.entities[entity.internal_name] > 0) {
            const index = this.ui.map.entities[entity.internal_name];
            let prevIndex = index - 1;
            while (prevIndex > 0) {
                if (this.ui.entities[prevIndex].indeterminate) {
                    break;
                }
                else {
                    prevIndex--;
                }
            }
            if (entity.totalAvailable < entity.totalOptions) {
                entity.totalText += `  ${entity.totalOptions - entity.totalAvailable} filtered out by ${this.ui.entities[prevIndex].name}.`;
            }
        }
        entity.allSelected = entity.totalSelected === entity.totalAvailable;
        if (entity.allSelected || !entity.totalSelected) {
            entity.selectedText = entity.allSelected ? 'All' : 'None';
        }
        else {
            const selectedOptions = entity.options.filter((option) => {
                return entity.display[option.id] && entity.selected[option.id];
            }).map((option) => {
                return option.name;
            });
            entity.selectedText = selectedOptions.length > 4 ? selectedOptions.slice(0, 4).join(', ') + `, ... ${selectedOptions.length - 4} more` : selectedOptions.join(', ');
        }
    }
    /**
     * Determine if all the visible options in an entity column have been selected
     * @param entity
     */
    _checkVisibleForAll(entity) {
        if (IsObject(entity, true) && !entity.single) {
            let all = true;
            const visible = Object.keys(entity.display).filter((id) => entity.display[id] && !entity.hidden[id]);
            entity.totalVisible = visible.length;
            if (visible.length) {
                visible.some(id => {
                    if (!entity.selected[id]) {
                        all = false;
                        return true;
                    }
                });
            }
            else {
                all = false;
            }
            entity.checkAll = all;
            this._checkForIndeterminate(entity);
        }
    }
    /**
     * Create a payload for what the filter has generated
     */
    _getCurrentFilter() {
        const currentFilter = {};
        this.ui.entities.map((entity) => {
            if (!entity.allSelected) {
                if (entity.filter.length) {
                    currentFilter[entity.internal_name] = entity.filter.filter((id) => +id > 0);
                    console.log(entity.internal_name, entity.filter);
                    this._onEntityFeedUpdate(entity);
                }
            }
        });
        console.log('currentFilter', currentFilter);
        return currentFilter;
    }
    /**
     * Determine which entity columns are having a filtering effect
     */
    _isCurrentFilterRelevant() {
        let relevant = false;
        Object.keys(this.asset.filter).some((internal_name) => {
            if (Array.isArray(this.asset.filter[internal_name]) && this.asset.filter[internal_name].length) {
                if (internal_name in this.ui.map.entities && this.ui.entities[this.ui.map.entities[internal_name]].totalAvailable) {
                    if (this.asset.filter[internal_name].length < this.ui.entities[this.ui.map.entities[internal_name]].totalAvailable) {
                        relevant = true;
                        return true;
                    }
                }
            }
        });
        return relevant;
    }
}
PopCacFilterViewComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-cac-filter-view',
                template: "<div class=\"cac-filter-container theme-background-base\" *ngIf=\"ui.config\" [ngClass]=\"{'sw-hidden': !ui.config.active, 'cac-filter-container-open': dom.state.open && ui.config.display === 'default'}\">\n  <div class=\"cac-filter-loader\">\n    <mat-progress-bar *ngIf=\"ui.config.loader\" mode=\"indeterminate\"></mat-progress-bar>\n  </div>\n\n  <div class=\"cac-filter-header\" [ngClass]=\"{'sw-hidden':dom.state.loading}\">\n\n    <div class=\"cac-filter-header-column theme-background-base\" [style.minWidth.px]=\"125\" [style.maxWidth.px]=\"125\">\n      <div class=\"cac-filter-label-text\">\n        FILTERS\n      </div>\n      <mat-icon class=\"cac-filter-label-icon sw-pointer\" [ngClass]=\"{'sw-hidden':dom.state.open}\" (click)=\"onToggleOpen();\">\n        arrow_right\n      </mat-icon>\n      <mat-icon class=\"cac-filter-label-icon sw-pointer\" [ngClass]=\"{'sw-hidden':!dom.state.open}\" (click)=\"onToggleOpen();\">\n        arrow_drop_down\n      </mat-icon>\n    </div>\n    <div class=\"cac-filter-header-column theme-background-base\" *ngFor=\"let entity of ui.entities\" [ngClass]=\"{'sw-hidden': !entity.visible}\">\n      <div class=\"cac-select-filter-button\">\n        <div class=\"cac-select-filter-button-bar\" [ngClass]=\"{'filter-selected':entity.indeterminate}\"></div>\n        <mat-form-field appearance=\"none\">\n          <mat-label>{{entity.name}}</mat-label>\n          <input\n            matInput\n            [matTooltip]=\"entity.selectedText\"\n            [readonly]=true\n            type=\"text\"\n            [(ngModel)]=\"entity.selectedText\"\n          >\n          <div class=\"sw-pointer cac-select-filter-icon\" matSuffix matTooltipPosition=\"below\" [matTooltipShowDelay]=\"500\" [matTooltip]=\"entity.totalText\">\n            <mat-icon class=\"sw-pointer\" (click)=\"onToggleOpen(entity.internal_name);\">\n              filter_list\n            </mat-icon>\n          </div>\n        </mat-form-field>\n      </div>\n    </div>\n    <div class=\"cac-filter-header-menu\" [style.minWidth.px]=\"125\" [style.maxWidth.px]=\"125\">\n      <div class=\"cac-filter-header-row\">\n        <div class=\"cac-filter-action-text\" [ngClass]=\"{'sw-disabled': ui.config.invalid, 'sw-pointer': !ui.config.invalid}\" *ngIf=\"dom.state.filterNeedsApplied\" (click)=\"applyFilter();\">\n          APPLY\n        </div>\n        <div class=\"cac-filter-action-text sw-pointer\" *ngIf=\"dom.state.currentFilterRelevant && !dom.state.filterNeedsApplied\" (click)=\"resetFilter();\">\n          RESET\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <!-- Toggle Container-->\n  <div class=\"cac-filter-body\" *ngIf=\"dom.state.open\" [@slideInOut] [ngClass]=\"{'cac-filter-body-float theme-background-base': ui.config.display === 'float'}\">\n    <div class=\"cac-filter-header-column\" [style.border]=\"0\" [style.minWidth.px]=\"125\" [style.maxWidth.px]=\"125\">\n      <!--Filler to reserve space to match headers-->\n    </div>\n    <div class=\"cac-filter-body-column\" *ngFor=\"let entity of ui.entities\" [ngClass]=\"{'sw-hidden': !entity.visible}\">\n\n      <div class=\"cac-filter-body-column-header\">\n\n        <div class=\"cac-filter-option-select-container\" *ngIf=\"!entity.single\" [style.marginLeft.px]=\"3\">\n\n          <mat-checkbox class=\"cac-filter-check-all\" [(ngModel)]=\"entity.checkAll\"\n                        [style.marginRight.px]=\"1\"\n                        [disabled]=!entity.totalVisible\n                        [indeterminate]=\"entity.indeterminate\"\n                        (change)=\"onCheckAll(entity);\">\n          </mat-checkbox>\n        </div>\n\n        <mat-form-field class=\"sw-search\" appearance=\"none\" color=\"accent\">\n          <a matPrefix>\n            <mat-icon>search</mat-icon>\n          </a>\n          <input id=\"{{entity.internal_name}}-search-input\" matInput [(ngModel)]=\"entity.search\" (keyup)=\"onApplySearch(entity)\">\n        </mat-form-field>\n        <mat-icon class=\"sw-pointer cac-filter-clear-icon\"\n                  [ngClass]=\"{'sw-transparent': !entity.search }\"\n                  matTooltip=\"Clear Search\"\n                  (click)=\"onApplySearch(entity); entity.search = '';\"\n        >\n          close\n        </mat-icon>\n      </div>\n      <mat-divider></mat-divider>\n      <cdk-virtual-scroll-viewport [@fadeInOut] itemSize=\"25\" minBufferPx=\"125\" maxBufferPx=\"250\" class=\"cac-filter-body-column-contents\">\n        <div class=\"cac-filter-body-column-row pop-checkbox-container checkbox-has-label cac-filter-option-hover\" *cdkVirtualFor=\"let option of entity.feed | async ; trackBy: trackByFn\"\n        >\n          <div class=\"cac-filter-option-select-container\">\n            <mat-checkbox\n              [ngClass]=\"{'sw-hidden':entity.single}\"\n              [(ngModel)]=\"entity.selected[option.id]\"\n              [labelPosition]=\"'before'\"\n              (click)=\"onCheckboxChange($event, entity, option.id)\"\n            ></mat-checkbox>\n            <div class=\"cac-filter-option-radio\" [ngClass]=\"{'sw-hidden':!entity.single}\">\n              <mat-icon class=\"sw-pointer\" [ngClass]=\"{'sw-hidden': entity.selected[option.id]}\" (click)=\"onRadioChange($event, entity, option.id)\">\n                radio_button_unchecked\n              </mat-icon>\n              <mat-icon class=\"sw-pointer cac-filter-option-checked\" [ngClass]=\"{'sw-hidden': !entity.selected[option.id]}\" (click)=\"onRadioChange($event, entity, option.id)\">\n                radio_button_checked\n              </mat-icon>\n            </div>\n          </div>\n          <div class=\"cac-filter-option-select-text\" *ngIf=\"entity.single\" (click)=\"onRadioChange($event, entity, option.id)\">\n            {{option.name}}\n            <small class=\"cac-filter-option-select-id\">{{option.id}}</small>\n          </div>\n          <div class=\"cac-filter-option-select-text\" *ngIf=\"!entity.single\" (click)=\"onCheckboxChange($event, entity, option.id);\">\n            {{option.name}}\n            <small class=\"cac-filter-option-select-id\">{{option.id}}</small>\n          </div>\n\n        </div>\n      </cdk-virtual-scroll-viewport>\n\n    </div>\n    <div class=\"cac-filter-header-menu\" [style.minWidth.px]=\"125\" [style.maxWidth.px]=\"125\">\n      <!--Filler to reserve space to match headers-->\n    </div>\n  </div>\n</div>\n",
                animations: [slideInOut, fadeInOut],
                styles: [".cac-filter-container{display:flex;flex-direction:column;justify-content:stretch;align-items:stretch;border:1px solid var(--border);min-height:35px;padding:5px 10px 13px;margin:30px 30px 5px;border-radius:3px;transition:height .5s}.cac-filter-container ::ng-deep .cac-filter-option-select-container .mat-checkbox-inner-container{margin-left:0!important}.cac-filter-container ::ng-deep .cac-filter-option-checked.mat-icon{color:var(--background-focused-button)!important}.cac-filter-container ::ng-deep .pop-checkbox-container{min-height:25px!important}.cac-filter-container ::ng-deep .cac-filter-body-column-header mat-form-field,.cac-filter-container mat-form-field input{width:100%;font-weight:700}.cac-filter-container ::ng-deep .cac-filter-body-column-header .mat-form-field-infix{padding-top:2px}.cac-filter-container ::ng-deep .cac-filter-body-column-row .mat-checkbox-label{width:100%}.cac-filter-container-open{min-height:220px!important;transition:height .5s}.cac-filter-loader{position:relative;display:block;width:100%;height:2px;overflow:hidden;clear:both;margin-bottom:8px}.cac-filter-header{display:flex;flex-direction:row;justify-content:flex-start;align-items:center;height:36px}.cac-filter-header-column{position:relative;display:flex;flex-direction:row;margin-left:10px;flex-basis:75%;max-width:400px;box-sizing:border-box}.cac-filter-header-column ::ng-deep .mat-form-field{width:100%;box-sizing:border-box}.cac-filter-header-column ::ng-deep .mat-form-field-infix{top:-8px;padding:2px 5px!important;margin:0 0 0 5px}.cac-filter-header-column ::ng-deep .mat-form-field-outline{color:transparent;display:none}.cac-filter-header-column ::ng-deep .mat-form-field-wrapper{padding-bottom:0!important;margin:0!important;min-width:100%;box-sizing:border-box}.cac-filter-header-column ::ng-deep input{position:relative;top:6px;white-space:nowrap;text-overflow:ellipsis;height:20px;line-height:20px;overflow:hidden;max-width:100%;pointer-events:none!important;background:var(--background-base)!important}.cac-filter-header-column ::ng-deep mat-label{background:var(--background-base)!important;font-size:1.2em;padding:0 5px}.cac-filter-header-column ::ng-deep .mat-form-field-subscript-wrapper{display:none}.cac-filter-header-menu{flex-direction:column;flex-basis:25%;flex-grow:1}.cac-filter-header-menu,.cac-filter-header-row{position:relative;display:flex;justify-content:flex-end}.cac-filter-header-row{flex-direction:row;margin-left:10px;flex-basis:100%;align-self:flex-end}.cac-filter-label-text{position:relative;text-decoration:none;margin-left:5px;margin-right:20px;color:var(--accent-900)!important;top:2px}.cac-filter-label-icon{position:relative}.cac-filter-body-column{margin-left:10px;flex-basis:75%;height:180px;width:75%;box-sizing:border-box;max-width:400px;border:1px solid var(--border)}.cac-filter-body-column,.cac-filter-body-menu{position:relative;display:flex;flex-direction:column}.cac-filter-body-menu{flex-basis:25%;overflow-x:hidden;justify-content:flex-end;align-items:center;flex-grow:1}.cac-filter-body-row{margin-left:10px;justify-content:flex-end;align-self:flex-end}.cac-filter-body-row,.cac-select-filter-button{position:relative;display:flex;flex-direction:row;flex-basis:100%}.cac-select-filter-button{height:36px;border:1px solid var(--border);border-radius:3px;justify-content:flex-start;align-items:center;cursor:pointer}.cac-select-filter-button .cac-select-filter-button-bar{width:5px;height:100%;border-radius:2px 0 0 2px}.cac-select-filter-button .cac-select-filter-button-text{display:flex;flex-direction:row;justify-content:flex-start;flex-basis:100%;padding:0}.cac-select-filter-button .cac-select-filter-button-icon{display:flex;flex-basis:10%;align-items:center;margin-right:10px}.cac-filter-clear-icon{position:relative;font-size:.9em;top:5px;right:2px}.cac-select-filter-icon{position:relative;left:-5px;font-size:1.2em}.cac-filter-body{display:flex;flex-direction:row;justify-content:flex-start;align-items:flex-start;min-height:178px}.cac-filter-body-float{position:absolute;margin-top:46px;left:0;right:0;border:1px solid var(--border);border-top:none;z-index:999999}.cac-filter-body-column-contents{position:relative;flex:1 1;height:140px;overflow-y:auto;overflow-x:hidden;margin:0}.cac-filter-body-column-header{position:relative;display:flex;flex-direction:row;justify-content:flex-start;align-items:center;min-height:25px;clear:both;padding:0 4px;border-radius:3px;border-bottom:1px solid transparent}.cac-filter-option-select-text{display:flex;flex-grow:1;box-sizing:border-box;height:25px;cursor:pointer;padding-left:2px;padding-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cac-filter-option-select-id{display:flex;padding-right:10px;padding-top:5px;justify-content:flex-end;flex-grow:1;text-align:right;font-size:.6em;opacity:.5}.cac-filter-option-hover:hover{background:var(--background-hover)!important}.cac-filter-body-column-row{position:relative;display:flex;height:25px;clear:both;align-items:center;padding:0 4px}.cac-filter-option-select-container{width:25px;height:25px;display:flex;align-items:center;justify-content:center;margin-right:5px}.cac-filter-action-text{text-decoration:none;margin:0 20px;color:var(--accent-900);font-size:.9em}.cac-filter-option-radio{padding-top:4px!important}:host ::ng-deep .mat-ripple-element{display:none!important}.filter-selected{background-color:var(--primary)!important}"]
            },] }
];
PopCacFilterViewComponent.ctorParameters = () => [
    { type: ElementRef }
];
PopCacFilterViewComponent.propDecorators = {
    channel: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWNhYy1maWx0ZXItdmlldy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9hcHAvcG9wLWNhYy1maWx0ZXIvcG9wLWNhYy1maWx0ZXItdmlldy9wb3AtY2FjLWZpbHRlci12aWV3LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQXFCLE1BQU0sZUFBZSxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBRXRFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUN2RSxPQUFPLEVBQWMsV0FBVyxFQUFFLGVBQWUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ3hGLE9BQU8sRUFBRSxjQUFjLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN6SSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBVW5FLE1BQU0sT0FBTyx5QkFBMEIsU0FBUSxrQkFBa0I7SUF5Qi9ELFlBQ1MsRUFBYztRQUVyQixLQUFLLEVBQUUsQ0FBQztRQUZELE9BQUUsR0FBRixFQUFFLENBQVk7UUF2QmhCLFNBQUksR0FBRywyQkFBMkIsQ0FBQztRQUVuQyxPQUFFLEdBQUc7WUFDVixNQUFNLEVBQXNCLFNBQVM7WUFDckMsUUFBUSxFQUE4QixTQUFTO1lBQy9DLEdBQUcsRUFBbUIsRUFBRTtTQUN6QixDQUFDO1FBRVEsVUFBSyxHQUFHO1lBRWhCLE1BQU0sRUFBRSxTQUFTLENBQUMsMEhB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QUcsQ0FBQyxRQUFRLENBQUUsYUFBYSxDQUFFLENBQUUsQ0FBQyxjQUFjLEVBQUU7d0JBQ3hILFFBQVEsR0FBRyxJQUFJLENBQUM7d0JBQ2hCLE9BQU8sSUFBSSxDQUFDO3FCQUNiO2lCQUNGO2FBQ0Y7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7OztZQTloQkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSx5QkFBeUI7Z0JBQ25DLDR4TUFBbUQ7Z0JBRW5ELFVBQVUsRUFBRSxDQUFFLFVBQVUsRUFBRSxTQUFTLENBQUU7O2FBQ3RDOzs7WUFoQm1CLFVBQVU7OztzQkFrQjNCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgUG9wUGlwZVNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtcGlwZS5zZXJ2aWNlJztcbmltcG9ydCB7IERpY3Rpb25hcnksIFBvcEJ1c2luZXNzLCBTZXJ2aWNlSW5qZWN0b3IgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IEFycmF5TWFwU2V0dGVyLCBHZXRTZXNzaW9uU2l0ZVZhciwgSXNBcnJheSwgSXNPYmplY3QsIEpzb25Db3B5LCBPYmplY3RDb250YWluc1RhZ1NlYXJjaCB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQgeyBmYWRlSW5PdXQsIHNsaWRlSW5PdXQgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLWFuaW1hdGlvbnMubW9kZWwnO1xuaW1wb3J0IHsgUG9wQ2FjRmlsdGVyQmFyU2VydmljZSB9IGZyb20gJy4uL3BvcC1jYWMtZmlsdGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ2FjRmlsdGVyQmFyQ29uZmlnLCBDYWNGaWx0ZXJCYXJFbnRpdHlDb25maWcgfSBmcm9tICcuLi9wb3AtY2FjLWZpbHRlci5tb2RlbCc7XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC1jYWMtZmlsdGVyLXZpZXcnLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLWNhYy1maWx0ZXItdmlldy5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9wb3AtY2FjLWZpbHRlci12aWV3LmNvbXBvbmVudC5zY3NzJyBdLFxuICBhbmltYXRpb25zOiBbIHNsaWRlSW5PdXQsIGZhZGVJbk91dCBdXG59KVxuZXhwb3J0IGNsYXNzIFBvcENhY0ZpbHRlclZpZXdDb21wb25lbnQgZXh0ZW5kcyBQb3BFeHRlbmRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGNoYW5uZWw6IFN1YmplY3Q8Q2FjRmlsdGVyQmFyRW50aXR5Q29uZmlnW10+OyAvLyB0aGlzIGlzIHRoZSBjaGFubmVsIG9mIHRoYXQgdGhlIHBhcmVudCBzZW5kcyBkb3duIHRoZSBjb25maWd1cmF0aW9uXG5cbiAgcHVibGljIG5hbWUgPSAnUG9wQ2FjRmlsdGVyVmlld0NvbXBvbmVudCc7XG5cbiAgcHVibGljIHVpID0ge1xuICAgIGNvbmZpZzogPENhY0ZpbHRlckJhckNvbmZpZz51bmRlZmluZWQsXG4gICAgZW50aXRpZXM6IDxDYWNGaWx0ZXJCYXJFbnRpdHlDb25maWdbXT51bmRlZmluZWQsLy8gdGhlIGNvbmZpZ3VyYXRpb24gdXNlZCB0byBidWlsZCB0aGUgY29uZmlncyBmb3IgdGhlIHNlbGVjdHMsIHN1YmplY3QgZW1pdCdzIGl0IGV2ZXJ5IHRpbWUgdGhlIGZpbHRlcnMgbmVlZCB0byBiZSB1cGRhdGVkLFxuICAgIG1hcDogPERpY3Rpb25hcnk8YW55Pj57fVxuICB9O1xuXG4gIHByb3RlY3RlZCBhc3NldCA9IHtcblxuICAgIGZpbHRlcjogdW5kZWZpbmVkIC8vIHRoZSBjdXJyZW50IGZpbHRlciBhcHBsaWVkIHRvIGFsbCBjb2x1bW5zLCB0aGlzIGlzIHRoZSAoZmluaXNoZWQgcHJvZHVjdCkgdGhhdCB3ZSB3YW50IHRvIGJlIHN0b3JlZCBpbiB0aGUgYmFzZSBzZXJ2aWNlXG4gIH07XG5cbiAgcHJvdGVjdGVkIHNydjoge1xuICAgIGZpbHRlcjogUG9wQ2FjRmlsdGVyQmFyU2VydmljZSxcbiAgICBwaXBlOiBQb3BQaXBlU2VydmljZSxcbiAgfSA9IHtcbiAgICBmaWx0ZXI6IFNlcnZpY2VJbmplY3Rvci5nZXQoUG9wQ2FjRmlsdGVyQmFyU2VydmljZSksXG4gICAgcGlwZTogU2VydmljZUluamVjdG9yLmdldChQb3BQaXBlU2VydmljZSksXG4gIH07XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICl7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICB0aGlzLmFzc2V0LmZpbHRlciA9IHRoaXMuc3J2LmZpbHRlci5nZXRGaWx0ZXIoKTtcbiAgICAgICAgdGhpcy51aS5lbnRpdGllcyA9IHRoaXMuc3J2LmZpbHRlci5nZXRFbnRpdGllcygpO1xuICAgICAgICB0aGlzLnVpLm1hcC5lbnRpdGllcyA9IEFycmF5TWFwU2V0dGVyKHRoaXMudWkuZW50aXRpZXMsICdpbnRlcm5hbF9uYW1lJyk7XG5cbiAgICAgICAgdGhpcy51aS5jb25maWcgPSB0aGlzLnNydi5maWx0ZXIuZ2V0Q29uZmlnKCk7XG4gICAgICAgIHRoaXMuX3NldERlZmF1bHRTdGF0ZSgpO1xuICAgICAgICB0aGlzLl9zZXRFbnRpdHlDb25maWcoKTtcbiAgICAgICAgdGhpcy5kb20uc2V0U3Vic2NyaWJlcihgZGF0YS1yZXNldGAsIHRoaXMuc3J2LmZpbHRlci5ldmVudC5kYXRhLnN1YnNjcmliZSgoY2FsbGVyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBkYXRhLXJlc2V0YCwgKCkgPT4ge1xuICAgICAgICAgICAgaWYoIElzQXJyYXkodGhpcy51aS5lbnRpdGllcywgdHJ1ZSkgKXtcbiAgICAgICAgICAgICAgY29uc3QgZmlyc3QgPSB0aGlzLnVpLmVudGl0aWVzWyAwIF07XG4gICAgICAgICAgICAgIGZpcnN0Lm9wdGlvbnMubWFwKChvcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgICBmaXJzdC5kaXNwbGF5WyBvcHRpb24uaWQgXSA9IHRydWU7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB0aGlzLl9jaGVja1Zpc2libGVGb3JBbGwoZmlyc3QpO1xuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVFbnRpdHlTZWxlY3RlZFRleHQoZmlyc3QpO1xuICAgICAgICAgICAgICB0aGlzLl9vbkVudGl0eUZlZWRVcGRhdGUoZmlyc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy51aS5lbnRpdGllcy5tYXAoKGVudGl0eSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgZW50aXR5LnRvdGFsT3B0aW9ucyA9IGVudGl0eS5vcHRpb25zLmxlbmd0aDtcbiAgICAgICAgICAgICAgZW50aXR5LmZpbHRlciA9IE9iamVjdC5rZXlzKGVudGl0eS5zZWxlY3RlZCkuZmlsdGVyKChpZCkgPT4gZW50aXR5LnNlbGVjdGVkWyBpZCBdKTtcbiAgICAgICAgICAgICAgZW50aXR5LnRvdGFsU2VsZWN0ZWQgPSBlbnRpdHkuZmlsdGVyLmxlbmd0aDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5vblVwZGF0ZU9wdGlvbnNEaXNwbGF5KDApO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoJ2luaXQnLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5ldmVudHMuZW1pdCh7IHNvdXJjZTogdGhpcy5uYW1lLCB0eXBlOiAnZmlsdGVyJywgbmFtZTogJ2luaXQnLCBkYXRhOiB0aGlzLmFzc2V0LmZpbHRlciB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IHNob3VsZCBoYXZlIGEgc3BlY2lmaWMgcHVycG9zZVxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogVHJpZ2dlciBhbiBlbnRpdHkgY29sdW1uIHRvIGFwcGx5IHNlYXJjaFxuICAgKiBAcGFyYW0gZW50aXR5XG4gICAqL1xuICBvbkFwcGx5U2VhcmNoKGVudGl0eTogQ2FjRmlsdGVyQmFyRW50aXR5Q29uZmlnKXtcbiAgICBpZiggdGhpcy5kb20uc3RhdGUuc2VhcmNoRGVsYXkgKSBjbGVhclRpbWVvdXQodGhpcy5kb20uc3RhdGUuc2VhcmNoRGVsYXkpO1xuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoYHNlYXJjaC1kZWxheWAsICgpID0+IHtcbiAgICAgIGVudGl0eS5vcHRpb25zLm1hcCgob3B0aW9uKSA9PiB7XG4gICAgICAgIGVudGl0eS5oaWRkZW5bIG9wdGlvbi5pZCBdID0gT2JqZWN0Q29udGFpbnNUYWdTZWFyY2gob3B0aW9uLCBlbnRpdHkuc2VhcmNoKSA/IGZhbHNlIDogdHJ1ZTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fb25FbnRpdHlGZWVkVXBkYXRlKGVudGl0eSk7XG4gICAgICB0aGlzLl9jaGVja1Zpc2libGVGb3JBbGwoZW50aXR5KTtcbiAgICB9LCAyMDApO1xuICB9XG5cblxuICAvKipcbiAgICogQ2hlY2tzL1VuY2hlY2tzIGFsbCB0aGUgb3B0aW9ucyB3aXRoaW4gYW4gZW50aXR5IGNvbHVtblxuICAgKiBAcGFyYW0gZW50aXR5XG4gICAqL1xuICBvbkNoZWNrQWxsKGVudGl0eTogQ2FjRmlsdGVyQmFyRW50aXR5Q29uZmlnKXtcbiAgICBpZiggSXNPYmplY3QoZW50aXR5LCB0cnVlKSAmJiAhZW50aXR5LnNpbmdsZSApe1xuICAgICAgZW50aXR5Lm9wdGlvbnMuZmlsdGVyKChvcHRpb24pID0+ICFlbnRpdHkuaGlkZGVuWyBvcHRpb24uaWQgXSkubWFwKChvcHRpb24pID0+IHtcbiAgICAgICAgZW50aXR5LnNlbGVjdGVkWyBvcHRpb24uaWQgXSA9ICtlbnRpdHkuZGlzcGxheVsgb3B0aW9uLmlkIF0gPyBlbnRpdHkuY2hlY2tBbGwgOiBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgZW50aXR5LmZpbHRlciA9IE9iamVjdC5rZXlzKGVudGl0eS5zZWxlY3RlZCkuZmlsdGVyKChpZCkgPT4gZW50aXR5LnNlbGVjdGVkWyBpZCBdKTtcbiAgICAgIGVudGl0eS50b3RhbFNlbGVjdGVkID0gZW50aXR5LmZpbHRlci5sZW5ndGg7XG4gICAgICBlbnRpdHkuYWxsU2VsZWN0ZWQgPSBlbnRpdHkudG90YWxTZWxlY3RlZCA9PT0gZW50aXR5LnRvdGFsQXZhaWxhYmxlO1xuICAgICAgdGhpcy5fY2hlY2tWaXNpYmxlRm9yQWxsKGVudGl0eSk7XG4gICAgICB0aGlzLl91cGRhdGVFbnRpdHlTZWxlY3RlZFRleHQoZW50aXR5KTtcbiAgICAgIHRoaXMub25VcGRhdGVPcHRpb25zRGlzcGxheSh0aGlzLnVpLm1hcC5lbnRpdGllc1sgZW50aXR5LmludGVybmFsX25hbWUgXSk7XG4gICAgICB0aGlzLmRvbS5zdGF0ZS5maWx0ZXJOZWVkc0FwcGxpZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEhhbmRsZSB3aGVuIGFuIG9wdGlvbiBzZWxlY3Rpb24gaGFzIGNoYW5nZWRcbiAgICogRGV0ZWN0cyBwcm9nbWF0aWMgY2hhbmdlc1xuICAgKiBAcGFyYW0gZW50aXR5XG4gICAqL1xuICBvbkNoZWNrYm94Q2hhbmdlKGV2ZW50LCBlbnRpdHksIGlkOiBudW1iZXIpe1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZW50aXR5LnNlbGVjdGVkWyBpZCBdID0gIWVudGl0eS5zZWxlY3RlZFsgaWQgXTtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGB1cGRhdGUtJHtlbnRpdHkuaW50ZXJuYWxfbmFtZX0tY29sdW1uYCwgKCkgPT4ge1xuICAgICAgZW50aXR5LmZpbHRlciA9IE9iamVjdC5rZXlzKGVudGl0eS5zZWxlY3RlZCkuZmlsdGVyKChrZXkpID0+IGVudGl0eS5zZWxlY3RlZFsga2V5IF0pO1xuICAgICAgZW50aXR5LnRvdGFsU2VsZWN0ZWQgPSBlbnRpdHkuZmlsdGVyLmxlbmd0aDtcbiAgICAgIGVudGl0eS5hbGxTZWxlY3RlZCA9IGVudGl0eS50b3RhbFNlbGVjdGVkID09PSBlbnRpdHkudG90YWxBdmFpbGFibGU7XG4gICAgICB0aGlzLl9jaGVja1Zpc2libGVGb3JBbGwoZW50aXR5KTtcbiAgICAgIHRoaXMuX3VwZGF0ZUVudGl0eVNlbGVjdGVkVGV4dChlbnRpdHkpO1xuICAgICAgdGhpcy5vblVwZGF0ZU9wdGlvbnNEaXNwbGF5KHRoaXMudWkubWFwLmVudGl0aWVzWyBlbnRpdHkuaW50ZXJuYWxfbmFtZSBdKTtcbiAgICAgIHRoaXMuZG9tLnN0YXRlLmZpbHRlck5lZWRzQXBwbGllZCA9IHRydWU7XG4gICAgfSwgMTAwKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEhhbmRsZSB3aGVuIGFuIG9wdGlvbiBzZWxlY3Rpb24gaGFzIGNoYW5nZWRcbiAgICogRGV0ZWN0cyBtYW51YWwgY2hhbmdlc1xuICAgKiBAcGFyYW0gZW50aXR5XG4gICAqL1xuICBvblJhZGlvQ2hhbmdlKGV2ZW50LCBlbnRpdHksIGlkKXtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmKCBlbnRpdHkuc2luZ2xlICl7XG4gICAgICBlbnRpdHkuY2hlY2tBbGwgPSBmYWxzZTtcblxuICAgICAgZW50aXR5LmFsbFNlbGVjdGVkID0gZmFsc2U7XG4gICAgICBlbnRpdHkuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgICAgZW50aXR5LmZpbHRlciA9IFsgU3RyaW5nKGlkKSBdO1xuICAgICAgZW50aXR5LnRvdGFsU2VsZWN0ZWQgPSBlbnRpdHkuZmlsdGVyLmxlbmd0aDtcbiAgICAgIGVudGl0eS5vcHRpb25zLm1hcCgob3B0aW9uKSA9PiB7XG4gICAgICAgIGlmKCArb3B0aW9uLmlkICE9PSAraWQgKXtcbiAgICAgICAgICBlbnRpdHkuc2VsZWN0ZWRbIG9wdGlvbi5pZCBdID0gZmFsc2U7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGVudGl0eS5zZWxlY3RlZFsgb3B0aW9uLmlkIF0gPSB0cnVlO1xuICAgICAgICAgIGVudGl0eS5zZWxlY3RlZFRleHQgPSBvcHRpb24ubmFtZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLm9uVXBkYXRlT3B0aW9uc0Rpc3BsYXkodGhpcy51aS5tYXAuZW50aXRpZXNbIGVudGl0eS5pbnRlcm5hbF9uYW1lIF0pO1xuICAgICAgdGhpcy5kb20uc3RhdGUuZmlsdGVyTmVlZHNBcHBsaWVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgbWVudSBiYXIgaGFzIGJlZW4gb3BlbmVkIG9yIGNsb3NlZFxuICAgKiBAcGFyYW0gZW50aXR5XG4gICAqL1xuICBvblRvZ2dsZU9wZW4oZW50aXR5OiBzdHJpbmcgPSBudWxsKXtcblxuICAgIHRoaXMuZG9tLnN0YXRlLm9wZW4gPSAhdGhpcy5kb20uc3RhdGUub3BlbjtcbiAgICBpZiggdGhpcy5kb20uc3RhdGUub3BlbiAmJiBlbnRpdHkgKXtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcihgIyR7ZW50aXR5fS1zZWFyY2gtaW5wdXRgKS5mb2N1cygpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuZXZlbnRzLmVtaXQoeyBzb3VyY2U6IHRoaXMubmFtZSwgdHlwZTogJ2ZpbHRlcicsIG5hbWU6ICdzdGF0ZScsIG1vZGVsOiAnb3BlbicsIGRhdGE6IHRoaXMuZG9tLnN0YXRlLm9wZW4gfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBFdmVudCBoYW5kbGVyIGZvciB0aGUgY2xpY2sgb2YgdGhlIHJlc2V0IGJ1dHRvblxuICAgKiBAcmV0dXJucyB2b2lkXG4gICAqL1xuICByZXNldEZpbHRlcigpOiB2b2lke1xuICAgIHRoaXMuYXNzZXQuZmlsdGVyID0ge307XG4gICAgdGhpcy51aS5lbnRpdGllcy5tYXAoKGVudGl0eSwgaW5kZXgpID0+IHtcbiAgICAgIGlmKCBlbnRpdHkuc2luZ2xlICl7XG4gICAgICAgIHRoaXMuX3NldFNpbmdsZUVudGl0eUNvbmZpZyhlbnRpdHksIGluZGV4KTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLl9zZXRNdWx0aXBsZUVudGl0eUNvbmZpZyhlbnRpdHksIGluZGV4KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLmFzc2V0LmZpbHRlciA9IHRoaXMuX2dldEN1cnJlbnRGaWx0ZXIoKTtcbiAgICB0aGlzLmRvbS5zdGF0ZS5maWx0ZXJOZWVkc0FwcGxpZWQgPSBmYWxzZTtcbiAgICB0aGlzLmRvbS5zdGF0ZS5jdXJyZW50RmlsdGVyUmVsZXZhbnQgPSBmYWxzZTtcblxuICAgIHRoaXMuZXZlbnRzLmVtaXQoeyBzb3VyY2U6IHRoaXMubmFtZSwgdHlwZTogJ2ZpbHRlcicsIG5hbWU6ICdjbGVhcicsIGRhdGE6IHRoaXMuYXNzZXQuZmlsdGVyIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogRW1pdHMgdGhlIGFwcGx5IGZpbHRlciBldmVudCwgY2FsbGVkXG4gICAqIHdoZW4gdGhlIGFwcGx5IGZpbHRlciBidXR0b24gaXMgY2xpY2tlZC5cbiAgICogQHJldHVybnMgdm9pZFxuICAgKi9cbiAgYXBwbHlGaWx0ZXIoKTogdm9pZHtcbiAgICBpZiggIXRoaXMudWkuY29uZmlnLmludmFsaWQgKXtcbiAgICAgIHRoaXMuYXNzZXQuZmlsdGVyID0gdGhpcy5fZ2V0Q3VycmVudEZpbHRlcigpO1xuICAgICAgdGhpcy5kb20uc3RhdGUuY3VycmVudEZpbHRlclJlbGV2YW50ID0gdGhpcy5faXNDdXJyZW50RmlsdGVyUmVsZXZhbnQoKTtcbiAgICAgIHRoaXMuZG9tLnN0YXRlLmZpbHRlck5lZWRzQXBwbGllZCA9IGZhbHNlO1xuICAgICAgdGhpcy5ldmVudHMuZW1pdCh7IHNvdXJjZTogdGhpcy5uYW1lLCB0eXBlOiAnZmlsdGVyJywgbmFtZTogJ2FwcGx5JywgZGF0YTogdGhpcy5hc3NldC5maWx0ZXIgfSk7XG4gICAgICAvLyBjbG9zZSBvbiBhcHBseSA/XG4gICAgICBpZiggdGhpcy51aS5jb25maWcuZGlzcGxheSAhPT0gJ3N0YXRpYycgKXtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUub3BlbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLmV2ZW50cy5lbWl0KHsgc291cmNlOiB0aGlzLm5hbWUsIHR5cGU6ICdmaWx0ZXInLCBuYW1lOiAnc3RhdGUnLCBtb2RlbDogJ29wZW4nLCBkYXRhOiB0aGlzLmRvbS5zdGF0ZS5vcGVuIH0pO1xuICAgICAgfVxuXG4gICAgfVxuICB9XG5cblxuICB0cmFja0J5Rm4oaW5kZXgsIGl0ZW0pe1xuICAgIGlmKCAhaXRlbSApIHJldHVybiBudWxsO1xuICAgIHJldHVybiBpdGVtLmlkO1xuICB9XG5cblxuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgLyoqXG4gICAqIERldGVybW5lIGlmIGFsbCB0aGUgdmlzaWJsZSBvcHRpb25zIGFyZSBlaXRoZXIgYWxsIGNoZWNrZWQgb3IgdW5jaGVja2VkXG4gICAqIEBwYXJhbSBlbnRpdHlcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX2NoZWNrRm9ySW5kZXRlcm1pbmF0ZShlbnRpdHk6IENhY0ZpbHRlckJhckVudGl0eUNvbmZpZyk6IHZvaWR7XG4gICAgY29uc3Qgc2VsZWN0ZWRWaXNpYmxlID0gZW50aXR5Lm9wdGlvbnMuZmlsdGVyKChvcHRpb24pID0+ICFlbnRpdHkuaGlkZGVuWyBvcHRpb24uaWQgXSAmJiBlbnRpdHkuZGlzcGxheVsgb3B0aW9uLmlkIF0gJiYgZW50aXR5LnNlbGVjdGVkWyBvcHRpb24uaWQgXSkubGVuZ3RoO1xuICAgIGVudGl0eS5pbmRldGVybWluYXRlID0gc2VsZWN0ZWRWaXNpYmxlICYmIHNlbGVjdGVkVmlzaWJsZSA8IGVudGl0eS50b3RhbFZpc2libGUgPyB0cnVlIDogZmFsc2U7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIHRoZSBjb2x1bW4gbGlzdCB0byB1cGRhdGUgd2l0aCBmaWx0ZXJlZCBvcHRpb25zXG4gICAqIEBwYXJhbSBlbnRpdHlcbiAgICovXG4gIHByaXZhdGUgX29uRW50aXR5RmVlZFVwZGF0ZShlbnRpdHk6IENhY0ZpbHRlckJhckVudGl0eUNvbmZpZyl7XG4gICAgY29uc3QgbGlzdCA9IGVudGl0eS5vcHRpb25zLmZpbHRlcihvcHRpb24gPT4gZW50aXR5LmRpc3BsYXlbIG9wdGlvbi5pZCBdICYmICFlbnRpdHkuaGlkZGVuWyBvcHRpb24uaWQgXSk7XG4gICAgaWYoICFlbnRpdHkuYWxsU2VsZWN0ZWQgKXtcbiAgICAgIGxpc3Quc29ydCgoYSwgYikgPT4ge1xuICAgICAgICBpZiggZW50aXR5LnNlbGVjdGVkWyBhLmlkIF0gJiYgIWVudGl0eS5zZWxlY3RlZFsgYi5pZCBdICkgcmV0dXJuIC0xO1xuICAgICAgICBpZiggIWVudGl0eS5zZWxlY3RlZFsgYS5pZCBdICYmIGVudGl0eS5zZWxlY3RlZFsgYi5pZCBdICkgcmV0dXJuIDE7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBlbnRpdHkuZmVlZC5uZXh0KGxpc3QpO1xuICB9XG5cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgc2VsZWN0IGNvbmZpZ3VyYXRpb25zIGJhc2VkIG9uIHRoZSBmaWx0ZXIgYmFyIGNvbmZpZ3VyYXRpb25zXG4gICAqIEByZXR1cm5zIHZvaWRcbiAgICovXG4gIHByaXZhdGUgX3NldEVudGl0eUNvbmZpZygpOiB2b2lke1xuICAgIHRoaXMuZG9tLnN0YXRlLmxvYWRpbmcgPSB0cnVlO1xuICAgIHRoaXMudWkuZW50aXRpZXMubWFwKChlbnRpdHksIGluZGV4KSA9PiB7XG5cbiAgICAgIGlmKCBlbnRpdHkuc2luZ2xlICl7XG4gICAgICAgIHRoaXMuX3NldFNpbmdsZUVudGl0eUNvbmZpZyhlbnRpdHksIGluZGV4KTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLl9zZXRNdWx0aXBsZUVudGl0eUNvbmZpZyhlbnRpdHksIGluZGV4KTtcbiAgICAgIH1cbiAgICAgIGVudGl0eS50b3RhbEF2YWlsYWJsZSA9IGVudGl0eS5vcHRpb25zLmxlbmd0aDtcbiAgICAgIGVudGl0eS50b3RhbE9wdGlvbnMgPSBlbnRpdHkub3B0aW9ucy5sZW5ndGg7XG4gICAgICBlbnRpdHkudG90YWxWaXNpYmxlID0gT2JqZWN0LmtleXMoZW50aXR5LmRpc3BsYXkpLmZpbHRlcigoaWQpID0+IGVudGl0eS5kaXNwbGF5WyBpZCBdICYmICFlbnRpdHkuaGlkZGVuWyBpZCBdKS5sZW5ndGg7XG4gICAgfSk7XG4gICAgdGhpcy5kb20uc3RhdGUuZmlsdGVyTmVlZHNBcHBsaWVkID0gZmFsc2U7XG4gICAgdGhpcy5kb20uc3RhdGUuY3VycmVudEZpbHRlclJlbGV2YW50ID0gdGhpcy5faXNDdXJyZW50RmlsdGVyUmVsZXZhbnQoKTtcbiAgICBpZiggIXRoaXMuZG9tLnN0YXRlLmN1cnJlbnRGaWx0ZXJSZWxldmFudCApe1xuICAgICAgdGhpcy5zcnYuZmlsdGVyLmNsZWFyRmlsdGVycygpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZSBhIHJhZGlvIGVuaXR5IGNvbmZpZ1xuICAgKiBAcGFyYW0gZW50aXR5XG4gICAqIEBwYXJhbSBpbmRleFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0U2luZ2xlRW50aXR5Q29uZmlnKGVudGl0eTogQ2FjRmlsdGVyQmFyRW50aXR5Q29uZmlnLCBpbmRleDogbnVtYmVyKXtcbiAgICBsZXQgZmlyc3QgPSA8YW55PmVudGl0eS5vcHRpb25zWyAwIF07XG4gICAgZW50aXR5LmNoZWNrQWxsID0gZmFsc2U7XG4gICAgZW50aXR5LmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICBpZiggSXNBcnJheSh0aGlzLmFzc2V0LmZpbHRlclsgZW50aXR5LmludGVybmFsX25hbWUgXSwgdHJ1ZSkgKXtcbiAgICAgIGNvbnN0IGFzc2V0ID0gdGhpcy5zcnYuZmlsdGVyLmdldEFzc2V0KGVudGl0eS5pbnRlcm5hbF9uYW1lLCArdGhpcy5hc3NldC5maWx0ZXJbIGVudGl0eS5pbnRlcm5hbF9uYW1lIF1bIDAgXSk7XG4gICAgICBmaXJzdCA9IHsgaWQ6IHRoaXMuYXNzZXQuZmlsdGVyWyBlbnRpdHkuaW50ZXJuYWxfbmFtZSBdWyAwIF0sIG5hbWU6IElzT2JqZWN0KGFzc2V0LCBbICduYW1lJyBdKSA/IGFzc2V0Lm5hbWUgOiAnTmFtZScgfTtcbiAgICB9XG4gICAgZW50aXR5LmZpbHRlciA9IFsgZmlyc3QuaWQgXTtcbiAgICBlbnRpdHkuc2VsZWN0ZWRUZXh0ID0gZmlyc3QubmFtZTtcbiAgICBlbnRpdHkudG90YWxTZWxlY3RlZCA9IDE7XG5cbiAgICBlbnRpdHkuaGlkZGVuID0ge307XG5cbiAgICBpZiggaW5kZXggPT09IDAgKXtcbiAgICAgIGVudGl0eS5vcHRpb25zLm1hcCgob3B0aW9uKSA9PiB7XG4gICAgICAgIGVudGl0eS5kaXNwbGF5WyBvcHRpb24uaWQgXSA9IHRydWU7XG4gICAgICAgIGVudGl0eS5oaWRkZW5bIG9wdGlvbi5pZCBdID0gZmFsc2U7XG4gICAgICAgIGVudGl0eS5zZWxlY3RlZFsgb3B0aW9uLmlkIF0gPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgZW50aXR5LnNlbGVjdGVkWyBmaXJzdC5pZCBdID0gdHJ1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnN0IHByZXZJbmRleCA9ICtpbmRleCAtIDE7XG4gICAgICBjb25zdCBwcmV2RW50aXR5ID0gdGhpcy51aS5lbnRpdGllc1sgcHJldkluZGV4IF07XG4gICAgICBlbnRpdHkub3B0aW9ucy5tYXAoKG9wdGlvbikgPT4ge1xuICAgICAgICBlbnRpdHkuZGlzcGxheVsgb3B0aW9uLmlkIF0gPSBwcmV2RW50aXR5LnNlbGVjdGVkWyBvcHRpb24uaWQgXTtcbiAgICAgICAgZW50aXR5LmhpZGRlblsgb3B0aW9uLmlkIF0gPSBmYWxzZTtcbiAgICAgICAgZW50aXR5LnNlbGVjdGVkWyBvcHRpb24uaWQgXSA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgICBlbnRpdHkuc2VsZWN0ZWRbIGZpcnN0LmlkIF0gPSB0cnVlO1xuICAgIH1cbiAgICB0aGlzLl9vbkVudGl0eUZlZWRVcGRhdGUoZW50aXR5KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZSBhIG11bHRpcGxlIGNoZWNrYm94IGVudGl0eSBjb25maWdcbiAgICogQHBhcmFtIGVudGl0eVxuICAgKiBAcGFyYW0gaW5kZXhcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX3NldE11bHRpcGxlRW50aXR5Q29uZmlnKGVudGl0eTogQ2FjRmlsdGVyQmFyRW50aXR5Q29uZmlnLCBpbmRleDogbnVtYmVyKXtcblxuXG4gICAgY29uc3QgZXhpc3RpbmdGaWx0ZXIgPSBJc0FycmF5KHRoaXMuYXNzZXQuZmlsdGVyWyBlbnRpdHkuaW50ZXJuYWxfbmFtZSBdLCB0cnVlKTtcbiAgICBlbnRpdHkuZmlsdGVyID0gZXhpc3RpbmdGaWx0ZXIgPyBKc29uQ29weSh0aGlzLmFzc2V0LmZpbHRlclsgZW50aXR5LmludGVybmFsX25hbWUgXSkgOiBbXTtcbiAgICAvLyBjb25zb2xlLmxvZygnX3NldE11bHRpcGxlRW50aXR5Q29uZmlnJywgZW50aXR5Lm5hbWUsIGluZGV4LCBlbnRpdHkuZmlsdGVyLmxlbmd0aCk7XG4gICAgaWYoIGVudGl0eS5maWx0ZXIubGVuZ3RoICl7XG4gICAgICBlbnRpdHkuY2hlY2tBbGwgPSBmYWxzZTtcbiAgICAgIGVudGl0eS5pbmRldGVybWluYXRlID0gdHJ1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIGVudGl0eS5jaGVja0FsbCA9IHRydWU7XG4gICAgICBlbnRpdHkuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgICBlbnRpdHkudG90YWxTZWxlY3RlZCA9IGVudGl0eS5jaGVja0FsbCA/IGVudGl0eS5vcHRpb25zLmxlbmd0aCA6IGVudGl0eS5maWx0ZXIubGVuZ3RoO1xuICAgIGlmKCBpbmRleCA9PT0gMCApe1xuICAgICAgZW50aXR5Lm9wdGlvbnMubWFwKChvcHRpb24pID0+IHtcbiAgICAgICAgZW50aXR5LnNlbGVjdGVkWyBvcHRpb24uaWQgXSA9IGVudGl0eS5jaGVja0FsbCA/IHRydWUgOiBlbnRpdHkuZmlsdGVyLmluY2x1ZGVzKFN0cmluZyhvcHRpb24uaWQpKTtcbiAgICAgICAgZW50aXR5LmRpc3BsYXlbIG9wdGlvbi5pZCBdID0gdHJ1ZTtcbiAgICAgICAgZW50aXR5LmhpZGRlblsgb3B0aW9uLmlkIF0gPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgZW50aXR5LnRvdGFsQXZhaWxhYmxlID0gZW50aXR5Lm9wdGlvbnMubGVuZ3RoO1xuICAgICAgZW50aXR5LnRvdGFsU2VsZWN0ZWQgPSBleGlzdGluZ0ZpbHRlciA/IGVudGl0eS5maWx0ZXIubGVuZ3RoIDogZW50aXR5Lm9wdGlvbnMubGVuZ3RoO1xuICAgICAgZW50aXR5LmFsbFNlbGVjdGVkID0gZW50aXR5LnRvdGFsU2VsZWN0ZWQgPT09IGVudGl0eS50b3RhbEF2YWlsYWJsZTtcbiAgICAgIHRoaXMuX2NoZWNrVmlzaWJsZUZvckFsbChlbnRpdHkpO1xuICAgICAgdGhpcy5fdXBkYXRlRW50aXR5U2VsZWN0ZWRUZXh0KGVudGl0eSk7XG4gICAgfWVsc2V7XG4gICAgICBjb25zdCBwcmV2SW5kZXggPSAraW5kZXggLSAxO1xuICAgICAgY29uc3QgcHJldkVudGl0eSA9IHRoaXMudWkuZW50aXRpZXNbIHByZXZJbmRleCBdO1xuICAgICAgZW50aXR5Lm9wdGlvbnMubWFwKChvcHRpb24pID0+IHtcbiAgICAgICAgZW50aXR5LnNlbGVjdGVkWyBvcHRpb24uaWQgXSA9IGVudGl0eS5jaGVja0FsbCA/IHRydWUgOiBwcmV2RW50aXR5LmZpbHRlci5pbmNsdWRlcyhTdHJpbmcob3B0aW9uW3ByZXZFbnRpdHkuY2hpbGRfbGlua10pKTtcbiAgICAgICAgZW50aXR5LmRpc3BsYXlbIG9wdGlvbi5pZCBdID0gcHJldkVudGl0eS5zZWxlY3RlZFsgb3B0aW9uW3ByZXZFbnRpdHkuY2hpbGRfbGlua11dO1xuICAgICAgICBlbnRpdHkuaGlkZGVuWyBvcHRpb24uaWQgXSA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgICBlbnRpdHkudG90YWxBdmFpbGFibGUgPSBlbnRpdHkub3B0aW9ucy5sZW5ndGg7XG4gICAgICBlbnRpdHkudG90YWxTZWxlY3RlZCA9IGV4aXN0aW5nRmlsdGVyID8gZW50aXR5LmZpbHRlci5sZW5ndGggOiBlbnRpdHkub3B0aW9ucy5sZW5ndGg7XG4gICAgICBlbnRpdHkuYWxsU2VsZWN0ZWQgPSBlbnRpdHkudG90YWxTZWxlY3RlZCA9PT0gZW50aXR5LnRvdGFsQXZhaWxhYmxlO1xuICAgICAgdGhpcy5fY2hlY2tWaXNpYmxlRm9yQWxsKGVudGl0eSk7XG4gICAgICB0aGlzLl91cGRhdGVFbnRpdHlTZWxlY3RlZFRleHQoZW50aXR5KTtcbiAgICB9XG4gICAgdGhpcy5fb25FbnRpdHlGZWVkVXBkYXRlKGVudGl0eSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDYXNjYWRlIGNoYW5nZXMgdG8gYWxsIGNvbHVtbnMgb2YgdGhlIHJpZ2h0IG9mIHRoZSBjb2x1bW4gdGhhdCBtYWRlIGNoYW5nZXNcbiAgICogQHBhcmFtIGVudGl0eU5hbWVcbiAgICovXG4gIG9uVXBkYXRlT3B0aW9uc0Rpc3BsYXkoY2hhbmdlZEluZGV4KXtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBvcHRpb25zLXVwZGF0ZS0ke2NoYW5nZWRJbmRleH1gLCAoKSA9PiB7XG4gICAgICBsZXQgaW52YWxpZCA9IGZhbHNlO1xuICAgICAgdGhpcy51aS5lbnRpdGllcy5tYXAoKGVudGl0eSwgaW5kZXgpID0+IHtcblxuICAgICAgICBjb25zdCBpblZpZXcgPSB0aGlzLnVpLmNvbmZpZy52aWV3LmluY2x1ZGVzKGVudGl0eS5pbnRlcm5hbF9uYW1lKTtcbiAgICAgICAgaWYoICFlbnRpdHkudG90YWxTZWxlY3RlZCAmJiBpblZpZXcgKSBpbnZhbGlkID0gdHJ1ZTtcbiAgICAgICAgaWYoIGluZGV4ID4gY2hhbmdlZEluZGV4ICl7XG4gICAgICAgICAgY29uc3QgcHJldkluZGV4ID0gK2luZGV4IC0gMTtcbiAgICAgICAgICBjb25zdCBwcmV2RW50aXR5ID0gdGhpcy51aS5lbnRpdGllc1sgcHJldkluZGV4IF07XG4gICAgICAgICAgZW50aXR5Lm9wdGlvbnMubWFwKChvcHRpb24pID0+IHtcbiAgICAgICAgICAgIGVudGl0eS5kaXNwbGF5WyBvcHRpb24uaWQgXSA9IHByZXZFbnRpdHkuYWxsU2VsZWN0ZWQgPyB0cnVlIDogcHJldkVudGl0eS5maWx0ZXIuaW5jbHVkZXMoU3RyaW5nKG9wdGlvbltwcmV2RW50aXR5LmNoaWxkX2xpbmtdKSk7XG4gICAgICAgICAgICBpZiggIWVudGl0eS5kaXNwbGF5WyBvcHRpb24uaWQgXSApe1xuICAgICAgICAgICAgICBlbnRpdHkuc2VsZWN0ZWRbIG9wdGlvbi5pZCBdID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5fb25FbnRpdHlGZWVkVXBkYXRlKGVudGl0eSk7XG5cbiAgICAgICAgICBpZighKGluVmlldykpe1xuICAgICAgICAgICAgZW50aXR5Lm9wdGlvbnMuZmlsdGVyKChvcHRpb24pID0+ICFlbnRpdHkuaGlkZGVuWyBvcHRpb24uaWQgXSkubWFwKChvcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgZW50aXR5LnNlbGVjdGVkWyBvcHRpb24uaWQgXSA9ICtlbnRpdHkuZGlzcGxheVsgb3B0aW9uLmlkIF0gPyB0cnVlIDogZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBlbnRpdHkuZmlsdGVyID0gT2JqZWN0LmtleXMoZW50aXR5LnNlbGVjdGVkKS5maWx0ZXIoKGlkKSA9PiBlbnRpdHkuc2VsZWN0ZWRbIGlkIF0pO1xuICAgICAgICAgIGVudGl0eS50b3RhbFNlbGVjdGVkID0gZW50aXR5LmZpbHRlci5sZW5ndGg7XG4gICAgICAgICAgaWYoICFlbnRpdHkudG90YWxTZWxlY3RlZCAmJiB0aGlzLnVpLmNvbmZpZy52aWV3LmluY2x1ZGVzKGVudGl0eS5pbnRlcm5hbF9uYW1lKSApIGludmFsaWQgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuX2NoZWNrVmlzaWJsZUZvckFsbChlbnRpdHkpO1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZUVudGl0eVNlbGVjdGVkVGV4dChlbnRpdHkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMudWkuY29uZmlnLmludmFsaWQgPSBpbnZhbGlkO1xuICAgIH0sIDUwKTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfc2V0RGVmYXVsdFN0YXRlKCl7XG4gICAgaWYoIHRoaXMudWkuY29uZmlnLmRpc3BsYXkgPT09ICdzdGF0aWMnICkgdGhpcy5kb20uc3RhdGUub3BlbiA9IHRydWU7XG4gICAgdGhpcy5kb20uc3RhdGUgPSB7XG4gICAgICAuLi50aGlzLmRvbS5zdGF0ZSxcbiAgICAgIC4uLntcbiAgICAgICAgZGlmZmVyZW50RW50aXRpZXM6IGZhbHNlLFxuICAgICAgICBzZWFyY2hEZWxheTogdW5kZWZpbmVkLCAvLyBkZWJvdW5jZSBmb3Igc2VhcmNoIGlucHV0c1xuICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgIGxvYWRlZDogZmFsc2UsXG4gICAgICAgIGN1cnJlbnRGaWx0ZXJSZWxldmFudDogZmFsc2UsIC8vIGZsYWdzIHdoZXRoZXIgYW4gYW55IGVudGl0eUlkIGZpbHRlciBpcyBkZWZpbmVkXG4gICAgICAgIGZpbHRlck5lZWRzQXBwbGllZDogZmFsc2UsIC8vIGZsYWdzIHdoZW4gdXNlciBuZWVkcyB0byBhcHBseSBjaGFuZ2VzIHRvIHRoZSBmaWx0ZXJcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5kb20uc3RhdGUub3BlbiA9IElzT2JqZWN0KFBvcEJ1c2luZXNzLCBbICdpZCcgXSkgPyBHZXRTZXNzaW9uU2l0ZVZhcihgQnVzaW5lc3MuJHtQb3BCdXNpbmVzcy5pZH0uRmlsdGVyLm9wZW5gLCBmYWxzZSkgOiBmYWxzZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgdGV4dCBhcHBlYXJzIGluIHRoZSBoZWFkZXIgb2YgZWFjaCBlbnRpdHkgY29sdW1uXG4gICAqIEBwYXJhbSBlbnRpdHlcbiAgICovXG4gIHByaXZhdGUgX3VwZGF0ZUVudGl0eVNlbGVjdGVkVGV4dChlbnRpdHk6IENhY0ZpbHRlckJhckVudGl0eUNvbmZpZyl7XG4gICAgZW50aXR5LnRvdGFsVGV4dCA9IGAke2VudGl0eS50b3RhbEF2YWlsYWJsZX0gJHtlbnRpdHkubmFtZX0gYXZhaWxhYmxlLmA7XG4gICAgaWYoIHRoaXMudWkubWFwLmVudGl0aWVzWyBlbnRpdHkuaW50ZXJuYWxfbmFtZSBdID4gMCApe1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnVpLm1hcC5lbnRpdGllc1sgZW50aXR5LmludGVybmFsX25hbWUgXTtcbiAgICAgIGxldCBwcmV2SW5kZXggPSBpbmRleCAtIDE7XG4gICAgICB3aGlsZSggcHJldkluZGV4ID4gMCApe1xuICAgICAgICBpZiggdGhpcy51aS5lbnRpdGllc1sgcHJldkluZGV4IF0uaW5kZXRlcm1pbmF0ZSApe1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBwcmV2SW5kZXgtLTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiggZW50aXR5LnRvdGFsQXZhaWxhYmxlIDwgZW50aXR5LnRvdGFsT3B0aW9ucyApe1xuICAgICAgICBlbnRpdHkudG90YWxUZXh0ICs9IGAgICR7ZW50aXR5LnRvdGFsT3B0aW9ucyAtIGVudGl0eS50b3RhbEF2YWlsYWJsZX0gZmlsdGVyZWQgb3V0IGJ5ICR7dGhpcy51aS5lbnRpdGllc1sgcHJldkluZGV4IF0ubmFtZX0uYDtcbiAgICAgIH1cbiAgICB9XG4gICAgZW50aXR5LmFsbFNlbGVjdGVkID0gZW50aXR5LnRvdGFsU2VsZWN0ZWQgPT09IGVudGl0eS50b3RhbEF2YWlsYWJsZTtcbiAgICBpZiggZW50aXR5LmFsbFNlbGVjdGVkIHx8ICFlbnRpdHkudG90YWxTZWxlY3RlZCApe1xuICAgICAgZW50aXR5LnNlbGVjdGVkVGV4dCA9IGVudGl0eS5hbGxTZWxlY3RlZCA/ICdBbGwnIDogJ05vbmUnO1xuICAgIH1lbHNle1xuICAgICAgY29uc3Qgc2VsZWN0ZWRPcHRpb25zID0gZW50aXR5Lm9wdGlvbnMuZmlsdGVyKChvcHRpb24pID0+IHtcbiAgICAgICAgcmV0dXJuIGVudGl0eS5kaXNwbGF5WyBvcHRpb24uaWQgXSAmJiBlbnRpdHkuc2VsZWN0ZWRbIG9wdGlvbi5pZCBdO1xuICAgICAgfSkubWFwKChvcHRpb24pID0+IHtcbiAgICAgICAgcmV0dXJuIG9wdGlvbi5uYW1lO1xuICAgICAgfSk7XG4gICAgICBlbnRpdHkuc2VsZWN0ZWRUZXh0ID0gc2VsZWN0ZWRPcHRpb25zLmxlbmd0aCA+IDQgPyBzZWxlY3RlZE9wdGlvbnMuc2xpY2UoMCwgNCkuam9pbignLCAnKSArIGAsIC4uLiAke3NlbGVjdGVkT3B0aW9ucy5sZW5ndGggLSA0fSBtb3JlYCA6IHNlbGVjdGVkT3B0aW9ucy5qb2luKCcsICcpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIERldGVybWluZSBpZiBhbGwgdGhlIHZpc2libGUgb3B0aW9ucyBpbiBhbiBlbnRpdHkgY29sdW1uIGhhdmUgYmVlbiBzZWxlY3RlZFxuICAgKiBAcGFyYW0gZW50aXR5XG4gICAqL1xuICBwcml2YXRlIF9jaGVja1Zpc2libGVGb3JBbGwoZW50aXR5OiBDYWNGaWx0ZXJCYXJFbnRpdHlDb25maWcpe1xuICAgIGlmKCBJc09iamVjdChlbnRpdHksIHRydWUpICYmICFlbnRpdHkuc2luZ2xlICl7XG4gICAgICBsZXQgYWxsID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHZpc2libGUgPSBPYmplY3Qua2V5cyhlbnRpdHkuZGlzcGxheSkuZmlsdGVyKChpZCkgPT4gZW50aXR5LmRpc3BsYXlbIGlkIF0gJiYgIWVudGl0eS5oaWRkZW5bIGlkIF0pO1xuICAgICAgZW50aXR5LnRvdGFsVmlzaWJsZSA9IHZpc2libGUubGVuZ3RoO1xuICAgICAgaWYoIHZpc2libGUubGVuZ3RoICl7XG4gICAgICAgIHZpc2libGUuc29tZShpZCA9PiB7XG4gICAgICAgICAgaWYoICFlbnRpdHkuc2VsZWN0ZWRbIGlkIF0gKXtcbiAgICAgICAgICAgIGFsbCA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1lbHNle1xuICAgICAgICBhbGwgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGVudGl0eS5jaGVja0FsbCA9IGFsbDtcbiAgICAgIHRoaXMuX2NoZWNrRm9ySW5kZXRlcm1pbmF0ZShlbnRpdHkpO1xuXG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogQ3JlYXRlIGEgcGF5bG9hZCBmb3Igd2hhdCB0aGUgZmlsdGVyIGhhcyBnZW5lcmF0ZWRcbiAgICovXG4gIHByaXZhdGUgX2dldEN1cnJlbnRGaWx0ZXIoKXtcbiAgICBjb25zdCBjdXJyZW50RmlsdGVyID0ge307XG4gICAgdGhpcy51aS5lbnRpdGllcy5tYXAoKGVudGl0eSkgPT4ge1xuICAgICAgaWYoICFlbnRpdHkuYWxsU2VsZWN0ZWQgKXtcbiAgICAgICAgaWYoIGVudGl0eS5maWx0ZXIubGVuZ3RoICl7XG4gICAgICAgICAgY3VycmVudEZpbHRlclsgZW50aXR5LmludGVybmFsX25hbWUgXSA9IGVudGl0eS5maWx0ZXIuZmlsdGVyKChpZCk9PitpZD4wKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlbnRpdHkuaW50ZXJuYWxfbmFtZSAsIGVudGl0eS5maWx0ZXIpO1xuICAgICAgICAgIHRoaXMuX29uRW50aXR5RmVlZFVwZGF0ZShlbnRpdHkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZygnY3VycmVudEZpbHRlcicsIGN1cnJlbnRGaWx0ZXIpO1xuXG4gICAgcmV0dXJuIGN1cnJlbnRGaWx0ZXI7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgd2hpY2ggZW50aXR5IGNvbHVtbnMgYXJlIGhhdmluZyBhIGZpbHRlcmluZyBlZmZlY3RcbiAgICovXG4gIHByaXZhdGUgX2lzQ3VycmVudEZpbHRlclJlbGV2YW50KCl7XG4gICAgbGV0IHJlbGV2YW50ID0gZmFsc2U7XG4gICAgT2JqZWN0LmtleXModGhpcy5hc3NldC5maWx0ZXIpLnNvbWUoKGludGVybmFsX25hbWU6IHN0cmluZykgPT4ge1xuICAgICAgaWYoIEFycmF5LmlzQXJyYXkodGhpcy5hc3NldC5maWx0ZXJbIGludGVybmFsX25hbWUgXSkgJiYgdGhpcy5hc3NldC5maWx0ZXJbIGludGVybmFsX25hbWUgXS5sZW5ndGggKXtcbiAgICAgICAgaWYoIGludGVybmFsX25hbWUgaW4gdGhpcy51aS5tYXAuZW50aXRpZXMgJiYgdGhpcy51aS5lbnRpdGllc1sgdGhpcy51aS5tYXAuZW50aXRpZXNbIGludGVybmFsX25hbWUgXSBdLnRvdGFsQXZhaWxhYmxlICl7XG4gICAgICAgICAgaWYoIHRoaXMuYXNzZXQuZmlsdGVyWyBpbnRlcm5hbF9uYW1lIF0ubGVuZ3RoIDwgdGhpcy51aS5lbnRpdGllc1sgdGhpcy51aS5tYXAuZW50aXRpZXNbIGludGVybmFsX25hbWUgXSBdLnRvdGFsQXZhaWxhYmxlICl7XG4gICAgICAgICAgICByZWxldmFudCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVsZXZhbnQ7XG4gIH1cbn1cbiJdfQ==