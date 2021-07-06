import { __awaiter } from "tslib";
import { Component, ElementRef, Input } from '@angular/core';
import { of } from 'rxjs';
import { PopContextMenuConfig } from '../pop-context-menu/pop-context-menu.model';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopRequest, PopTemplate, ServiceInjector } from '../../../pop-common.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PopDomService } from '../../../services/pop-dom.service';
import { ArrayMapSetter, GetHttpErrorMsg, InterpolateString, IsArray, IsCallableFunction, IsObject, ObjectContainsTagSearch, PopUid, Sleep } from '../../../pop-common-utility';
import { PopEntityUtilParamService } from '../../entity/services/pop-entity-util-param.service';
import { PopTableDialogComponent } from '../pop-dialogs/pop-table-dialog/pop-table-dialog.component';
export class PopSideBySideComponent extends PopExtendComponent {
    constructor(el, _domRepo) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this.name = 'PopSideBySideComponent';
        this.srv = {
            dialog: ServiceInjector.get(MatDialog),
            param: ServiceInjector.get(PopEntityUtilParamService),
            router: ServiceInjector.get(Router),
        };
        this.availableFilterValue = '';
        this.assignedFilterValue = '';
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.id = this.config.id ? this.config.id : PopUid();
                this._trackAssignedOptions();
                this._setHooks();
                this._setContextMenu();
                this._checkForAssignedOptions();
                return resolve(true);
            }));
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                yield this._setHeight();
                return resolve(true);
            }));
        };
    }
    /**
     * This component should have a purpose
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * Filter Utility
     * @param type
     * @param filter
     */
    onApplyFilter(type, filter) {
        this.dom.setTimeout('apply-filter', () => {
            if (this.config.filterBoth) {
                this.onFilterBoth(filter);
                this.assignedFilterValue = filter;
                this.availableFilterValue = filter;
            }
            else {
                if (type === 'assigned') {
                    this._filterAssignedOptions(filter);
                    this.assignedFilterValue = filter;
                }
                else {
                    this._filterAvailableOptions(filter);
                    this.availableFilterValue = filter;
                }
            }
            this.onBubbleEvent('apply-filter', null, { method: type, value: filter });
        }, 200);
    }
    /**
     * Filter both columns
     */
    onFilterBoth(filter) {
        this.config.options.values.map(option => {
            option.assignedFilter = option.optionFilter = !ObjectContainsTagSearch(option, filter);
        });
    }
    /**
     * Assign a specific option
     */
    onOptionAssign(option, confirmed = false) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (!this.config.disabled) {
                if (IsObject(option, true) && !this.ui.assigned[option.value] && !option.optionBlock && !option.optionFilter) {
                    if (this.config.facadeEvent) {
                        this.onBubbleEvent('facadeEvent', 'Facade Event has been triggered', {
                            method: 'remove',
                            options: [option],
                            ids: [+option.value]
                        }, true);
                        return resolve(true);
                    }
                    else {
                        yield this._assign([option], confirmed);
                        return resolve(true);
                    }
                }
                else {
                    return resolve(true);
                }
            }
        }));
    }
    /**
     * Assign all options
     */
    onAssignAllOptions(confirmed = false) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const options = this.config.options.values.filter(option => {
                return !this.ui.assigned[option.value] && !option.optionBlock && !option.optionFilter;
            });
            if (!options.length) {
                return resolve(true);
            }
            if (this.config.facadeEvent) {
                this.onBubbleEvent('facadeEvent', 'Facade Event has been triggered', {
                    method: 'assign',
                    options: options,
                    ids: options.map(o => +o.value)
                }, true);
                return resolve(true);
            }
            else {
                yield this._assign(options, confirmed);
                return resolve(true);
            }
        }));
    }
    /**
     * Remove an option that is assigned
     * @param option
     * @param confirmed
     */
    onRemoveOption(option, confirmed = false) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (!this.config.disabled) {
                if (IsObject(option)) {
                    if (this.config.facadeEvent) {
                        this.onBubbleEvent('facadeEvent', 'Facade Event has been triggered', {
                            method: 'remove',
                            options: [option],
                            ids: [+option.value]
                        }, true);
                        return resolve(true);
                    }
                    else {
                        yield this._remove([option], confirmed);
                        return resolve(true);
                    }
                }
                else {
                    return resolve(true);
                }
            }
        }));
    }
    /**
     * Remove all options that are assigned
     */
    onRemoveAllOptions(confirmed = false) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.config.patch.removeErrMessage = '';
            const options = [];
            this.config.options.values.map(option => {
                if (this.ui.assigned[option.value] && !option.assignedFilter) {
                    option.patching = true;
                    options.push(option);
                }
            });
            if (!options.length) {
                return resolve(true);
            }
            if (this.config.facadeEvent) {
                this.onBubbleEvent('facadeEvent', 'Facade Event has been triggered', {
                    method: 'remove',
                    options: options,
                    ids: options.map(o => +o.value)
                }, true);
                return resolve(true);
            }
            else {
                yield this._remove(options, confirmed);
                return resolve(true);
            }
        }));
    }
    /**
     * Go to linked route of option
     * @param option
     */
    onNavigateToOptionRoute(option) {
        if (this.config.route) {
            let route = this.config.route.slice();
            route = String(route).replace(/:value/g, '' + option.value).replace(/:name/g, option.name);
            this.srv.router.navigateByUrl(route).then(data => {
            })
                .catch(e => {
                // const errMessage = 'Route not found:' + route;
                // console.log(e);
                this.events.emit({ source: this.name, type: 'context_menu', name: 'portal', data: route, config: this.config });
                // option.errMessage = errMessage;
                // setTimeout(() => {
                //   if( option.errMessage === errMessage ) option.errMessage = '';
                // }, 2000);
            });
        }
    }
    /**
     * Intercept the user right mouse click to show a context menu for this component
     * @param option
     * @param event
     */
    onMouseRightClick(option, event) {
        let route = this.config.route.slice();
        route = String(route).replace(/:value/g, '' + option.value).replace(/:name/g, option.name);
        if (!route)
            return false;
        // if we haven't returned, prevent the default behavior of the right click.
        event.preventDefault();
        const context = this.dom.contextMenu.config;
        // reset the context menu, and configure it to load at the position clicked.
        context.resetOptions();
        // if(this.config.internal_name) this.dom.contextMenu.addPortalOption(this.config.internal_name, +row.entityId);
        const api_path = route.split('/')[0];
        const entityParams = this.srv.param.getEntityParamsWithPath(api_path, option.value);
        if (entityParams)
            context.addPortalOption(entityParams.internal_name, entityParams.entityId);
        context.addNewTabOption(route);
        context.x = event.clientX;
        context.y = event.clientY;
        context.toggle.next(true);
    }
    onBubbleEvent(eventName, message = null, extend = {}, force = false) {
        const event = {
            type: 'field',
            name: eventName,
            source: this.name
        };
        if (this.config)
            event.config = this.config;
        if (message)
            event.message = message;
        Object.keys(extend).map((key) => {
            event[key] = extend[key];
        });
        this.log.event(`onBubbleEvent`, event);
        if (this.config.bubble || force) {
            this.events.emit(event);
        }
        return event;
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
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    _assign(options, confirmed = false) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this._beforePatch(options);
            if (this.config.facade) {
                yield Sleep(500);
                this._onAssignSuccess(options);
                return resolve(true);
            }
            else if (this.config.patch.path && this.config.patch.field) {
                const request = this._getRequest('assign', this._getRequestBody('assign', options, confirmed));
                request.subscribe((res) => __awaiter(this, void 0, void 0, function* () {
                    if (res.data)
                        res = res.data;
                    if (res.confirmation) {
                        const isConfirmed = yield this._confirmAction(res.confirmation);
                        if (isConfirmed) {
                            this._assign(options, true).then(() => true);
                        }
                    }
                    else {
                        this._onAssignSuccess(options);
                        this.onBubbleEvent('patch', 'Patched', {
                            success: true,
                            method: 'assign',
                            ids: options.map(o => o.value),
                            value: this.config.assigned
                        }, true);
                    }
                    return resolve(res);
                }), (err) => {
                    this._handleAssignError(err);
                    this._onAssignFail(options);
                    return resolve(false);
                });
            }
            else {
                this._onAssignSuccess(options);
                return resolve(true);
            }
        }));
    }
    _remove(options = [], confirmed = false) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this._beforePatch(options);
            if (this.config.facade) {
                yield Sleep(500);
                this._onRemoveSuccess(options);
                return resolve(true);
            }
            else if (this.config.patch.path && this.config.patch.field) {
                if (!confirmed && this.config.patch.conflictPath) {
                    const value = options[0].value;
                    // const path = 'users/12/roles/1/conflicts';
                    const path = InterpolateString(this.config.patch.conflictPath, { value: value });
                    // users/{entityId}/roles/{value}/conflicts
                    PopRequest.doPost(path, {}).subscribe((res) => __awaiter(this, void 0, void 0, function* () {
                        if (res.data)
                            res = res.data;
                        if (IsArray(res, true)) {
                            options.map((option) => {
                                option.patching = false;
                            });
                            const isConfirmed = yield this._confirmAction(res[0]);
                            if (isConfirmed) {
                                this._remove(options, true).then(() => true);
                            }
                        }
                        else {
                            this._remove(options, true).then(() => true);
                        }
                    }));
                }
                else {
                    const request = this._getRequest('remove', this._getRequestBody('remove', options, confirmed));
                    request.subscribe((res) => __awaiter(this, void 0, void 0, function* () {
                        if (res.data)
                            res = res.data;
                        this._onRemoveSuccess(options);
                        this.onBubbleEvent('patch', 'Patched', {
                            success: true,
                            method: 'remove',
                            ids: options.map(o => o.value),
                            value: this.config.assigned
                        }, true);
                        return resolve(res);
                    }), (err) => {
                        this._handleRemoveError(err);
                        this._onRemoveFail(options);
                    });
                }
            }
            else {
                this._onRemoveSuccess(options);
                return resolve(true);
            }
        }));
    }
    _getRequestBody(method, options, confirmed = false) {
        if (this.config.patch.field) {
        }
        const body = {};
        if (this.config.patch.metadata) {
            for (const i in this.config.patch.metadata) {
                if (!this.config.patch.metadata.hasOwnProperty(i))
                    continue;
                body[i] = this.config.patch.metadata[i];
            }
        }
        body[this.config.patch.field] = options.map(o => o.value);
        body['method'] = method;
        body['confirmed'] = confirmed;
        return body;
    }
    _getRequest(method, body = {}) {
        let path = this.config.patch.path;
        const ignore401 = (this.config.patch.ignore401 ? true : null);
        const version = (this.config.patch.version ? this.config.patch.version : 1);
        const post = {};
        if (this.config.patch.metadata) {
            for (const i in this.config.patch.metadata) {
                if (!this.config.patch.metadata.hasOwnProperty(i))
                    continue;
                post[i] = this.config.patch.metadata[i];
            }
        }
        if (this.config.patch.addId) {
            const id = body[this.config.patch.field][0];
            path = InterpolateString(this.config.patch.path, { id: id });
        }
        if (method === 'assign') {
            switch (String(this.config.patch.assignMethod).toLowerCase()) {
                case 'patch':
                    return PopRequest.doPatch(`${path}`, body, version, ignore401);
                    break;
                case 'post':
                    return PopRequest.doPost(`${path}`, body, version, ignore401);
                    break;
                default:
                    return PopRequest.doPost(`${path}`, body, version, ignore401);
                    break;
            }
        }
        else {
            switch (String(this.config.patch.removedMethod).toLowerCase()) {
                case 'patch':
                    return PopRequest.doPatch(`${path}`, body, version, ignore401);
                    break;
                case 'post':
                    return PopRequest.doPost(`${path}`, body, version, ignore401);
                    break;
                case 'delete':
                    return PopRequest.doDelete(`${path}`, body, version, ignore401);
                    break;
                default:
                    return PopRequest.doDelete(`${path}`, body, version, ignore401);
                    break;
            }
            return PopRequest.doDelete(`${path}`, body, version, ignore401);
        }
    }
    _handleAssignError(err) {
        this.config.patch.assignErrMessage = GetHttpErrorMsg(err);
        this.config.patch.running = false;
    }
    _handleRemoveError(err) {
        this.config.patch.removeErrMessage = GetHttpErrorMsg(err);
        this.config.patch.running = false;
    }
    _onAssignSuccess(options = []) {
        this.config.patch.running = false;
        options.map(option => {
            this.ui.assigned[option.value] = 1;
            option.patching = false;
        });
        this._checkForAssignedOptions();
        const event = this.onBubbleEvent('assign', 'Assigned', {
            method: 'assign',
            ids: options.map(o => o.value),
            value: this.config.assigned
        });
        if (IsCallableFunction(this.config.patch.callback)) {
            this.config.patch.callback(this.core, event);
        }
    }
    _beforePatch(options = []) {
        this.config.patch.removeErrMessage = '';
        this.config.patch.running = true;
        options.map((option) => {
            option.patching = true;
            option.errMessage = '';
        });
    }
    _formatConflictData(conflictData) {
        const tableData = conflictData.map(pods => {
            return { pod: pods.name, title: pods.pivot.is_leader ? 'Leader' : 'Member' };
        });
        return tableData;
    }
    _confirmAction(conflictData) {
        return new Promise((resolve) => {
            const tableData = this._formatConflictData(conflictData);
            this.srv.dialog.open(PopTableDialogComponent, {
                width: '500px',
                data: {
                    data: tableData,
                    type: 'sideBySide',
                    table: this.config.patch.conflictTableConfig,
                    message: this.config.patch.conflictMessage,
                    header: this.config.patch.conflictHeader ? this.config.patch.conflictHeader : ''
                }
            }).afterClosed().subscribe(res => {
                return resolve(res ? true : false);
            });
        });
    }
    _onAssignFail(options = []) {
        this.config.patch.running = false;
        options.map(option => {
            delete this.ui.assigned[option.value];
            option.patching = false;
        });
        this._checkForAssignedOptions();
    }
    _onRemoveFail(options = []) {
        this.config.patch.running = false;
        options.map(option => {
            this.ui.assigned[option.value] = 1;
            option.patching = false;
        });
        this._checkForAssignedOptions();
    }
    _onRemoveSuccess(options = []) {
        this.config.patch.running = false;
        options.map(option => {
            delete this.ui.assigned[option.value];
            option.patching = false;
        });
        this._checkForAssignedOptions();
        const event = this.onBubbleEvent('remove', 'Removed', {
            method: 'remove',
            ids: options.map(o => o.value),
            value: this.config.assigned
        });
        if (IsCallableFunction(this.config.patch.callback)) {
            this.config.patch.callback(this.core, event);
        }
    }
    /**
     * Helper function that naivgates the complexity of the setting the heights needed in this component
     */
    _setHeight() {
        return new Promise((resolve) => {
            this.dom.overhead = 2;
            if (this.config.hasHeader)
                this.dom.overhead += 38;
            if (this.config.hasFilterRow)
                this.dom.overhead += 49;
            if (this.config.hasLabelRow)
                this.dom.overhead += 45;
            if (!this.config.height)
                this.config.height = PopTemplate.getContentHeight(false, 270);
            let tabColumnHeight = this.dom.repo.getComponentHeight('PopEntityTabColumnComponent', this.position);
            if (!tabColumnHeight)
                tabColumnHeight = this.dom.repo.getComponentHeight('PopTabMenuComponent', 1);
            if (tabColumnHeight && tabColumnHeight.inner) {
                this.dom.height.default = tabColumnHeight.inner - 20;
            }
            else {
                this.dom.height.default = PopTemplate.getContentHeight(false, this.dom.overhead);
            }
            if (this.config.parentClassName) {
                this.dom.overhead = this.dom.overhead + (Math.abs(this.el.nativeElement.offsetTop) + 100);
                this.dom.setHeightWithParent(this.config.parentClassName, this.dom.overhead, this.dom.height.default).then((res) => {
                    this.log.info(`setHeight with ${this.config.parentClassName}`);
                    return resolve(true);
                });
            }
            else {
                if (this.config.height) {
                    // if( this.config.height < ( this.dom.overhead * 2 ) ) this.config.height = this.dom.overhead * 2;
                    this.dom.setHeight(this.config.height, this.dom.overhead);
                    this.log.info(`setHeight with config.height:${this.config.height} - overhead:${this.dom.overhead}`);
                }
                else if (this.config.bucketHeight) {
                    this.config.height = this.config.bucketHeight + this.dom.overhead;
                    this.dom.setHeight(+this.config.height, this.dom.overhead);
                    this.log.info(`setHeight with config.bucketHeight:${this.config.bucketHeight} - overhead:${this.dom.overhead}`);
                }
                else if (this.config.bucketLimit) {
                    this.config.bucketLimit = this.config.bucketLimit > this.config.options.values.length ? this.config.options.values.length : this.config.bucketLimit;
                    this.config.bucketHeight = (this.config.bucketLimit * 30.5);
                    this.config.height = this.config.bucketHeight + this.dom.overhead;
                    this.dom.setHeight(+this.config.height, this.dom.overhead);
                    this.log.info(`setHeight with config.bucketLimit:${this.config.bucketLimit} - overhead:${this.dom.overhead}`);
                }
                else {
                    this.log.info(`setHeight with defaultHeight:${this.dom.height.default} - overhead:${this.dom.overhead}`);
                    this.dom.setHeight(this.dom.height.default, this.dom.overhead);
                }
                return resolve(true);
            }
        });
    }
    /**
     * This will block certain options from being available
     * @param bucket
     * @param ids
     */
    _blockBucketOptions(bucket, ids) {
        if (['assign', 'option', 'both'].includes(bucket)) {
            const map = ArrayMapSetter(this.config.options.values, 'value');
            ids.map((id) => {
                if (id in map) {
                    if (bucket === 'assign') {
                        this.config.options.values[map[id]].assignBlock = true;
                    }
                    else if (bucket === 'option') {
                        this.config.options.values[map[id]].optionBlock = true;
                    }
                    else {
                        this.config.options.values[map[id]].assignBlock = true;
                        this.config.options.values[map[id]].optionBlock = true;
                    }
                }
            });
        }
    }
    /**
     * This will un-block certain options from being available
     * @param bucket
     * @param ids
     */
    _unblockBucketOptions(bucket, ids) {
        if (['assign', 'option', 'both'].includes(bucket)) {
            const map = ArrayMapSetter(this.config.options.values, 'value');
            ids.map((id) => {
                if (id in map) {
                    if (bucket === 'assign') {
                        this.config.options.values[map[id]].assignBlock = false;
                    }
                    else if (bucket === 'option') {
                        this.config.options.values[map[id]].optionBlock = false;
                    }
                    else {
                        this.config.options.values[map[id]].assignBlock = false;
                        this.config.options.values[map[id]].optionBlock = false;
                    }
                }
            });
        }
    }
    /**
     * Allow other modules to trigger certain functionality
     * @param option
     * @param event
     */
    _setHooks() {
        this.config.assign = (options, confirmed = false) => {
            return this._assign(options, confirmed);
        };
        this.config.remove = (options, confirmed = false) => {
            return this._remove(options, confirmed);
        };
        this.config.removeAllOptions = () => {
            return of(this.onRemoveAllOptions());
        };
        this.config.addAllOptions = () => {
            return of(this.onAssignAllOptions());
        };
        this.config.applyFilter = (type, filter) => {
            this.onApplyFilter(type, filter);
        };
        this.config.getAssigned = () => {
            return this.config.assigned.slice();
        };
        this.config.block = (bucket, ids) => {
            this._blockBucketOptions(bucket, ids);
        };
        this.config.unblock = (bucket, ids) => {
            this._unblockBucketOptions(bucket, ids);
        };
    }
    /**
     * Intercept the user right mouse click to show a context menu for this component
     * @param option
     * @param event
     */
    _setContextMenu() {
        this.dom.contextMenu.config = new PopContextMenuConfig();
        this.dom.setSubscriber('context-menu', this.dom.contextMenu.config.emitter.subscribe((event) => {
            this.log.event(`context-menu`, event);
            this.events.emit(event);
        }));
    }
    /**
     * Get the count of assigned options
     */
    _checkForAssignedOptions() {
        this.config.assigned = Object.keys(this.ui.assigned);
        this.ui.assignedCount = this.config.assigned.length;
        this.ui.optionsCount = this.config.options.values.length;
        if (this.ui.assignedCount == this.ui.optionsCount)
            this.ui.optionsCount = 0;
    }
    /**
     * Filter assigned options
     * @param filter
     */
    _filterAssignedOptions(filter) {
        this.config.options.values.map(option => {
            option.assignedFilter = !ObjectContainsTagSearch(option, filter);
        });
    }
    /**
     * Filter un-assigned options
     * @param filter
     */
    _filterAvailableOptions(filter) {
        this.config.options.values.map(option => {
            option.optionFilter = !ObjectContainsTagSearch(option, filter);
        });
    }
    /**
     * Set the intial state of the assigned options
     */
    _trackAssignedOptions() {
        this.ui.assigned = {};
        this.config.assigned.map(optionID => {
            this.ui.assigned[optionID] = 1;
        });
    }
}
PopSideBySideComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-side-by-side',
                template: "<div class=\"sbs-container\" [style.height.px]=dom.height.outer *ngIf=\"dom.state.loaded\">\n  <div *ngIf=\"config.display && config.displayTitle\" class=\"sbs-row-container\">\n    <div class=\"sbs-title\">{{config.display}}</div>\n  </div>\n\n  <div class=\"sbs-row-container sbs-border-top sbs-border-r sbs-border-l\" *ngIf=\"config.hasLabelRow\">\n    <div class=\"sbs-column-container sbs-border-r sbs-header\">\n      <div class=\"sbs-column-content sbs-center-text-vert\" >\n        <div class=\"sbs-row-container\">\n          <div class=\"sbs-error-container sbs-assigned-error-container\" *ngIf=\"config.patch.removeErrMessage\">\n            <div class=\"sw-pointer options-error\" matTooltipPosition=\"right\" [matTooltip]=\"config.patch.removeErrMessage\">\n              <mat-icon class=\"sbs-error-icon\" color=\"warn\">info</mat-icon>\n            </div>\n        </div>\n\n        <div class=\"sbs-item-toggle-container sw-pointer sbs-item-toggle-container-left\" *ngIf=\"config.removeAll\">\n          <div class=\"sw-push-button-label\"\n\n               [ngClass]=\"{'sw-disabled': config.disabled || config.patch.running}\"\n               (click)=\"onRemoveAllOptions();\"\n               matTooltipPosition=\"above\"\n               [matTooltip]=\"'Remove All'\"\n               [matTooltipShowDelay]=\"750\"\n               [matTooltipHideDelay]=\"250\">\n            <p>S</p>\n            <div class=\"sw-push-button-inner-label\">\n            </div>\n          </div>\n        </div>\n\n        <div class=\"sbs-row-container sbs-flex sbs-title-left\"\n             [ngClass]=\"{'sw-hidden': !config.assignedLabel, 'sw-disabled': config.disabled}\">\n            <div class=\"sbs-flex mat-body-2 sbs-label header-label\">{{config.assignedLabel}}</div>\n          </div>\n\n        </div>\n      </div>\n    </div>\n    <div class=\"sbs-column-container sbs-header\">\n      <div class=\"sbs-column-content sbs-center-text-vert\">\n        <div class=\"sbs-row-container\">\n\n          <div class=\"sbs-item-toggle-container\"\n               *ngIf=\"config.assignAll\">\n            <div class=\"sw-push-button-label sw-pointer\"\n                 [ngClass]=\"{'sw-disabled': config.disabled || config.patch.running}\"\n                 (click)=\"onAssignAllOptions();\"\n                 matTooltipPosition=\"above\"\n                 [matTooltipShowDelay]=\"750\"\n                 [matTooltipHideDelay]=\"250\"\n                 [matTooltip]=\"'Assign All'\">\n              <p class=\"rotate\">S</p>\n              <div class=\"sw-push-button-inner-label\">\n              </div>\n            </div>\n\n          </div>\n          <div class=\"sbs-row-container sbs-flex sbs-title-left\"\n               [ngClass]=\"{'sw-hidden': !config.optionsLabel,'sw-disabled': config.disabled}\">\n            <div class=\"sbs-label sbs-flex sbs-header-label mat-body-2 header-label\">{{config.optionsLabel}}</div>\n          </div>\n          <div class=\"sbs-error-container sbs-options-error-container\" *ngIf=\"config.patch.assignErrMessage\">\n            <div class=\"sw-pointer options-error\"\n                 matTooltipPosition=\"left\"\n                 [matTooltip]=\"config.patch.assignErrMessage\">\n              <mat-icon class=\"sbs-error-icon\" color=\"warn\">info</mat-icon>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"sbs-row-container \" *ngIf=\"config.hasFilterRow && !config.filterBoth\">\n    <div class=\"sbs-column-container sbs-search-header sbs-border-l sbs-border-top \">\n      <div class=\"sbs-column-content sbs-center-text-vert\">\n        <div class=\"sbs-row-container\">\n          <mat-icon matPrefix class=\"sbs-search-icon\">search</mat-icon>\n          <input #assignedFilter class=\"sbs-flex sbs-filter mat-body-2\" placeholder=\"Search\"\n                 (keyup)=\"onApplyFilter('assigned', $event.target['value'])\">\n          <mat-icon class=\"sw-pointer sbs-clear-filter\"  class=\"sw-pointer sbs-clear-filter\" [ngClass]=\"{'hide-clear-icon': !this.assignedFilterValue, 'show-clear-icon': this.assignedFilterValue}\"\n                    (click)=\"assignedFilter.value = ''; assignedFilter.focus(); onApplyFilter('assigned', '');\">clear\n          </mat-icon>\n        </div>\n      </div>\n    </div>\n    <div class=\"sbs-column-container sbs-border-l sbs-border-r sbs-border-top\">\n      <div class=\"sbs-column-content  sbs-center-text-vert\">\n        <div class=\"sbs-row-container\">\n          <mat-icon matPrefix class=\"sbs-search-icon\">search</mat-icon>\n          <input #optionFilter class=\"sbs-flex sbs-filter\" placeholder=\"Search\"\n                 (keyup)=\"onApplyFilter('options', $event.target['value'])\">\n          <mat-icon class=\"sw-pointer sbs-clear-filter\" [ngClass]=\"{'hide-clear-icon': !this.availableFilterValue, 'show-clear-icon': this.availableFilterValue}\" (click)=\"optionFilter.value = ''; optionFilter.focus(); onApplyFilter('options', '');\">\n            clear\n          </mat-icon>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"sbs-row-container sbs-border-l sbs-border-r sbs-border-top sbs-content-pad sbs-search-header\" *ngIf=\"config.hasFilterRow && config.filterBoth\">\n\n    <div class=\"sbs-column-content  sbs-center-text-vert\">\n      <div class=\"sbs-row-container\">\n\n    <mat-icon matPrefix class=\"sbs-search-icon\">search</mat-icon>\n    <input #bothFilter class=\"sbs-flex sbs-filter\" placeholder=\"Search\" (keyup)=\"onApplyFilter('both', $event.target.value)\">\n    <mat-icon class=\"sw-pointer sbs-clear-filter\" [ngClass]=\"{'hide-clear-icon': !this.availableFilterValue, 'show-clear-icon': this.availableFilterValue}\" (click)=\"bothFilter.value = ''; bothFilter.focus(); onApplyFilter('both', '');\">\n      clear\n    </mat-icon>\n      </div></div>\n  </div>\n\n  <div class=\"sbs-row-container sbs-border-top sbs-border-r sbs-border-l sbs-border-bottom\" [style.height.px]=\"dom.height.inner\">\n    <div class=\"sbs-column-container sbs-border-r sbs-column-left\">\n      <div class=\"sbs-column-container sbs-flex\" *ngIf=\"!ui.optionsCount && config.displayHelper ? '': !ui.assignedCount && config.displayHelper\">\n        <div class=\"sbs-column-content\">\n          <div class=\"sbs-row-container\">\n            <mat-icon class=\"sbs-helper-icon\">sentiment_dissatisfied</mat-icon>\n          </div>\n          <div class=\"sbs-row-container \">\n            <label class=\"help-text sbs-align-center\">{{config.helpText}}</label>\n          </div>\n          <div class=\"sbs-row-container \">\n          <p class=\"help-caption mat-caption sbs-align-center\">Use the arrows <span class=\"left-arrow\">S</span> to make assignments</p>\n          </div>\n        </div>\n      </div>\n      <mat-list class=\"sbs-bucket sbs-assigned-bucket\" [style.height.px]=\"dom.height.inner\" *ngIf=\"ui.assignedCount || !config.displayHelper\">\n        <!--<mat-list-item class=\"sbs-assigned-item\" *ngFor=\"let option of config.options.values\" [ngClass]=\"{'sw-disabled': config.disabled, 'sw-hidden': !ui.assigned[option.value] || option.assignedFilter || option.assignBlock }\" (contextmenu)=onMouseRightClick(option,$event)>-->\n        <mat-list-item class=\"sbs-assigned-item\" *ngFor=\"let option of config.options.values\" [ngClass]=\"{'sw-disabled': config.disabled, 'sw-hidden': !ui.assigned[option.value] || option.assignedFilter || option.assignBlock }\">\n          <div class=\"sbs-item-toggle-container sbs-align-left\">\n            <div class=\"sw-push-button sw-pointer\"\n                 [ngClass]=\"{'sw-hidden': option.patching}\"\n                 matTooltipPosition=\"above\"\n                 [matTooltipShowDelay]=\"750\"\n                 [matTooltipHideDelay]=\"250\"\n                 [matTooltip]=\"'Remove'\"\n                 (click)=\"onRemoveOption(option);\">\n              <p>S</p>\n              <div class=\"sw-push-button-inner\">\n              </div>\n            </div>\n            <div class=\"sbs-feedback-container\"\n                 [ngClass]=\"{'sw-hidden': !option.patching || !config.patch.displayIndicator}\">\n              <lib-main-spinner\n                [options]=\"{strokeWidth:3, color:'accent', diameter:19}\">\n              </lib-main-spinner>\n            </div>\n          </div>\n\n          <div class=\"sw-circle-ID\" *ngIf=\"config.displayCircleID\">\n            {{ option.name | characterIcon }}\n          </div>\n\n          <div class=\"sbs-item-label-container\">\n              <span class=\"sbs-label sbs-flex\">\n                <div [ngSwitch]=\"config.optionHtml\">\n                  <span *ngSwitchCase=\"'label'\" class=\"mat-body-2 sbs-right-bucket-label\">{{option.name}}</span>\n                  <a *ngSwitchCase=\"'route'\" (click)=\"onNavigateToOptionRoute(option);\" class=\"mat-body-2 sbs-right-bucket-label sw-pointer\">{{option.name}}</a></div></span>\n            <div class=\"sw-pointer\"\n                 *ngIf=\"option.errMessage\"\n                 matSuffix=\"\"\n                 matTooltipPosition=\"left\"\n                 [matTooltip]=option.errMessage>\n              <mat-icon color=\"warn\">info</mat-icon>\n            </div>\n          </div>\n\n        </mat-list-item>\n      </mat-list>\n    </div>\n    <div class=\"sbs-column-container  sbs-column-left \">\n      <mat-list class=\"sbs-bucket\" [style.height.px]=\"dom.height.inner\">\n\n        <div class=\"sbs-column-container sbs-flex\" *ngIf=\"!ui.optionsCount && config.displayHelper\">\n          <div class=\"sbs-column-content sbs-mar-btm \">\n            <div class=\"sbs-row-container\">\n              <mat-icon class=\"sbs-helper-icon\">sentiment_dissatisfied</mat-icon>\n            </div>\n            <div class=\"sbs-row-container\">\n              <label class=\"help-text h2 sbs-align-center\">{{config.helpTextRight}}</label>\n            </div>\n            <!--<div class=\"sbs-row-container sbs-align-center\">-->\n            <!--<p class=\"sbs-helper-text sbs-align-center\">Use the arrows <span class=\"sw-push-button-sample\">S</span>to make assignments</p>-->\n            <!--</div>-->\n          </div>\n        </div>\n\n        <!--<mat-list-item *ngFor=\"let option of config.options.values\" [ngClass]=\"{'sw-disabled': config.disabled, 'sw-hidden': ui.assigned[option.value] || option.optionFilter || option.optionBlock}\" (contextmenu)=onMouseRightClick(option,$event)>-->\n        <mat-list-item class=\"sbs-item\" *ngFor=\"let option of config.options.values\" [ngClass]=\"{'sw-disabled': config.disabled, 'sw-hidden': ui.assigned[option.value] || option.optionFilter || option.optionBlock}\">\n          <div class=\"sbs-item-toggle-container\">\n            <div class=\"sw-push-button sw-pointer\"\n                 [ngClass]=\"{'sw-hidden': option.patching}\"\n                 matTooltipPosition=\"above\"\n                 [matTooltipShowDelay]=\"750\"\n                 [matTooltipHideDelay]=\"250\"\n                 [matTooltip]=\"'Assign'\"\n                 (click)=\"onOptionAssign(option);\">\n              <p class=\"rotate\">S</p>\n              <div class=\"sw-push-button-inner\">\n              </div>\n            </div>\n            <div class=\"sbs-feedback-container\"\n                 [ngClass]=\"{'sw-hidden': !option.patching || !config.patch.displayIndicator}\">\n              <lib-main-spinner\n                [options]=\"{strokeWidth:3, color:'accent', diameter:19}\">\n              </lib-main-spinner>\n            </div>\n          </div>\n\n          <div class=\"sw-circle-ID\" *ngIf=\"config.displayCircleID\">\n            {{ option.name | characterIcon }}\n          </div>\n\n          <div class=\"sbs-item-label-container\">\n              <span class=\"sbs-label sbs-flex\">\n                <div [ngSwitch]=\"config.optionHtml\">\n                  <span *ngSwitchCase=\"'label'\" class=\"mat-body-2 sbs-right-bucket-label\">{{option.name}}</span>\n                  <a *ngSwitchCase=\"'route'\" (click)=\"onNavigateToOptionRoute(option);\" class=\"mat-body-2 sbs-right-bucket-label sw-pointer\">{{option.name}}</a>\n                </div>\n              </span>\n            <div class=\"sw-pointer\"\n                 *ngIf=\"option.errMessage\"\n                 matSuffix=\"\"\n                 matTooltipPosition=\"left\"\n                 [matTooltip]=option.errMessage>\n              <mat-icon color=\"warn\">info</mat-icon>\n            </div>\n          </div>\n        </mat-list-item>\n      </mat-list>\n    </div>\n  </div>\n  <!--<lib-pop-context-menu *ngIf=\"dom.contextMenu\" [config]=\"dom.contextMenu.config\"></lib-pop-context-menu>-->\n</div>\n",
                styles: [".sbs-container{flex:1}.sbs-row-container{display:flex;flex-direction:row;clear:both}.sbs-align-center{align-items:center}.sbs-flex{display:flex;min-width:1%;flex-basis:1%;flex-grow:1}.sbs-column-container{display:flex;flex-direction:column;flex-basis:50%;overflow:hidden}.sbs-column-content{position:relative;display:block}.sbs-title{position:relative;font-size:1em;overflow:hidden;text-overflow:ellipsis;margin:var(--mar-md) 0}.sbs-header{height:46px;background-color:var(--background-main-menu)}.sbs-search-header{height:46px}.header-label{color:var(--foreground-disabled)}.sbs-center-text-vert{margin:auto;width:100%}.sbs-label{position:relative;margin-left:var(--gap-m)}.sbs-label>span{position:relative;font-size:var(--text-md);line-height:var(--gap-m);margin:var(--mar-sm) 0;font-weight:lighter;text-overflow:ellipsis;justify-content:space-between;white-space:nowrap}.sbs-label-null{font-size:var(--text-lg);font-weight:500}.sbs-align-left{text-align:left!important}.sbs-align-center{width:100%;text-align:center!important}.sbs-search-container{position:relative;display:flex;flex-direction:row;align-items:center;height:var(--gap-m)}.sbs-bucket{min-height:var(--gap-lm);height:100%;overflow-y:scroll;overflow-x:hidden;padding-bottom:var(--mar-sm)}.sbs-bucket::-webkit-scrollbar{width:6px}.sbs-left-bucket-label,.sbs-right-bucket-label{position:absolute;left:0;top:-8px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.sbs-right-bucket-label{min-width:0;color:var(--foreground-header)}.sbs-right-bucket-label:hover{text-decoration:underline;color:var(--foreground-icon);opacity:1}.sbs-bucket::-webkit-scrollbar-track{-webkit-box-shadow:inset 0 0 var(--gap-lm) var(--darken02);border-radius:var(--border-s)}.sbs-bucket::-webkit-scrollbar-thumb{border-radius:var(--border-s);-webkit-box-shadow:inset 0 0 var(--gap-lm) var(--darken06)}.sbs-assigned-item{position:relative;direction:ltr;height:var(--gap-lm)}.sbs-item{padding-top:px}.sbs-filter{border:0;outline:0;background:none;color:var(--text);padding:0}.sbs-filter::-moz-placeholder{color:var(--foreground-disabled)}.sbs-filter:-ms-input-placeholder{color:var(--foreground-disabled)}.sbs-filter::placeholder{color:var(--foreground-disabled)}.sbs-search-icon,.search-icon{margin-left:var(--gap-m)}.sbs-search-icon{margin-right:var(--gap-xs);font-weight:700}.sbs-clear-filter{position:relative;font-size:24px;text-align:center;margin-right:var(--gap-m)}.sbs-all-icon{outline:0}p.sbs-helper-text{margin:0}.sbs-helper-text{line-height:24px;min-height:24px;font-size:var(---text-sm)}.sbs-helper-icon{width:var(--gap-xxl);height:var(--gap-xxl);font-size:var(--gap-xxl);color:var(--accent);margin:0 auto;padding-top:112px}.sbs-container ::ng-deep .mat-form-field-infix{max-width:100%!important;margin:0 auto!important}.sbs-container ::ng-deep mat-list{padding-top:var(--gap-xxs)!important;border:0!important}.sbs-container ::ng-deep mat-list-item{box-sizing:border-box;height:38px;border-left:0!important}.sbs-container ::ng-deep .mat-list-item-content{padding:0!important;justify-content:space-between;box-sizing:border-box}a{text-decoration:none}.sbs-feedback-container{position:relative;display:flex;height:var(--gap-lm);padding-top:var(--mar-xs);flex-flow:column;align-items:center;justify-content:center}.sbs-item-label-container{display:flex;flex-grow:1;min-width:0;align-items:center}.sbs-item-toggle-container{padding-left:var(--gap-m)}.sbs-error-container,.sbs-item-toggle-container{display:flex;flex-direction:column;align-items:center;justify-content:center}.sbs-error-container{height:var(--gap-lm);width:var(--gap-lm);padding-top:var(--mar-xs)}.sbs-assigned-error-container{top:0}.sbs-assigned-error-container,.sbs-options-error-container{position:absolute;right:0;z-index:2}.options-error{position:relative;top:-6px;left:-5px}.mat-list .mat-list-item,.mat-nav-list .mat-list-item,.mat-selection-list .mat-list-item{background-color:var(--bg-3)}.sbs-border-l{border-left:1px solid var(--border)}.sbs-border-r{border-right:1px solid var(--border)}.sbs-border-top{border-top:1px solid var(--border)}.sbs-border-bottom{border-bottom:1px solid var(--border)}.sw-circle-ID{margin-left:var(--gap-sm);height:24px!important;width:24px!important;line-height:24px}.sw-push-button-label p.rotate{top:-var(--gap-xs)!important}.sw-push-button-label{margin-left:var(--gap-m);position:relative}.sbs-mar-btm{margin-bottom:50px}.left-arrow{display:inline-block;height:10px;width:10px;border-radius:2px;position:relative;text-align:center;background-color:var(--background-code);margin:0;line-height:1.8em;color:#fff;font-size:5px;font-family:pop-icon,sans-serif;transform:rotate(180deg);top:-2px}.help-text{font-size:18px;margin-top:var(--gap-sm)}.help-caption{color:var(--foreground-disabled)}.hide-clear-icon{visibility:hidden}.show-clear-icon{visibility:visible}"]
            },] }
];
PopSideBySideComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService }
];
PopSideBySideComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXNpZGUtYnktc2lkZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC1zaWRlLWJ5LXNpZGUvcG9wLXNpZGUtYnktc2lkZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFHaEYsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMxQixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQztBQUNsRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRSxPQUFPLEVBQXFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDeEgsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDbEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLFFBQVEsRUFBRSx1QkFBdUIsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDaEwsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0scURBQXFELENBQUM7QUFDaEcsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNERBQTRELENBQUM7QUFRckcsTUFBTSxPQUFPLHNCQUF1QixTQUFRLGtCQUFrQjtJQWtCNUQsWUFDUyxFQUFjLEVBQ1gsUUFBdUI7UUFFakMsS0FBSyxFQUFFLENB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Q25DLENBQUMsQ0FBRSxDQUFDO0lBQ04sQ0FBQzs7O1lBM3ZCRixTQUFTLFNBQUU7Z0JBQ1YsUUFBUSxFQUFFLHNCQUFzQjtnQkFDaEMsMjlZQUFnRDs7YUFFakQ7OztZQW5CbUIsVUFBVTtZQVNyQixhQUFhOzs7cUJBWW5CLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU2lkZUJ5U2lkZUNvbmZpZywgU2lkZUJ5U2lkZU9wdGlvbkludGVyZmFjZSB9IGZyb20gJy4vcG9wLXNpZGUtYnktc2lkZS5tb2RlbCc7XG5pbXBvcnQgeyBQb3BDb25maXJtYXRpb25EaWFsb2dDb21wb25lbnQgfSBmcm9tICcuLi9wb3AtZGlhbG9ncy9wb3AtY29uZmlybWF0aW9uLWRpYWxvZy9wb3AtY29uZmlybWF0aW9uLWRpYWxvZy5jb21wb25lbnQnO1xuaW1wb3J0IHsgb2YgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFBvcENvbnRleHRNZW51Q29uZmlnIH0gZnJvbSAnLi4vcG9wLWNvbnRleHQtbWVudS9wb3AtY29udGV4dC1tZW51Lm1vZGVsJztcbmltcG9ydCB7IFBvcEV4dGVuZENvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL3BvcC1leHRlbmQuY29tcG9uZW50JztcbmltcG9ydCB7IERpY3Rpb25hcnksIFBvcEJhc2VFdmVudEludGVyZmFjZSwgUG9wUmVxdWVzdCwgUG9wVGVtcGxhdGUsIFNlcnZpY2VJbmplY3RvciB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IE1hdERpYWxvZyB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RpYWxvZyc7XG5pbXBvcnQgeyBQb3BEb21TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvcG9wLWRvbS5zZXJ2aWNlJztcbmltcG9ydCB7IEFycmF5TWFwU2V0dGVyLCBHZXRIdHRwRXJyb3JNc2csIEludGVycG9sYXRlU3RyaW5nLCBJc0FycmF5LCBJc0NhbGxhYmxlRnVuY3Rpb24sIElzT2JqZWN0LCBPYmplY3RDb250YWluc1RhZ1NlYXJjaCwgUG9wVWlkLCBTbGVlcCB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQgeyBQb3BFbnRpdHlVdGlsUGFyYW1TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vZW50aXR5L3NlcnZpY2VzL3BvcC1lbnRpdHktdXRpbC1wYXJhbS5zZXJ2aWNlJztcbmltcG9ydCB7IFBvcFRhYmxlRGlhbG9nQ29tcG9uZW50IH0gZnJvbSAnLi4vcG9wLWRpYWxvZ3MvcG9wLXRhYmxlLWRpYWxvZy9wb3AtdGFibGUtZGlhbG9nLmNvbXBvbmVudCc7XG5cblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1wb3Atc2lkZS1ieS1zaWRlJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1zaWRlLWJ5LXNpZGUuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLXNpZGUtYnktc2lkZS5jb21wb25lbnQuc2NzcycgXSxcbn0gKVxuZXhwb3J0IGNsYXNzIFBvcFNpZGVCeVNpZGVDb21wb25lbnQgZXh0ZW5kcyBQb3BFeHRlbmRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGNvbmZpZzogU2lkZUJ5U2lkZUNvbmZpZztcblxuICBwdWJsaWMgbmFtZSA9ICdQb3BTaWRlQnlTaWRlQ29tcG9uZW50JztcblxuICBwcm90ZWN0ZWQgc3J2OiB7XG4gICAgZGlhbG9nOiBNYXREaWFsb2csXG4gICAgcm91dGVyOiBSb3V0ZXIsXG4gICAgcGFyYW06IFBvcEVudGl0eVV0aWxQYXJhbVNlcnZpY2UsXG4gIH0gPSB7XG4gICAgZGlhbG9nOiBTZXJ2aWNlSW5qZWN0b3IuZ2V0KCBNYXREaWFsb2cgKSxcbiAgICBwYXJhbTogU2VydmljZUluamVjdG9yLmdldCggUG9wRW50aXR5VXRpbFBhcmFtU2VydmljZSApLFxuICAgIHJvdXRlcjogU2VydmljZUluamVjdG9yLmdldCggUm91dGVyICksXG4gIH07XG5cbiAgYXZhaWxhYmxlRmlsdGVyVmFsdWUgPSAnJztcbiAgYXNzaWduZWRGaWx0ZXJWYWx1ZSA9ICcnO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgX2RvbVJlcG86IFBvcERvbVNlcnZpY2UsXG4gICl7XG4gICAgc3VwZXIoKTtcblxuXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyggcmVzb2x2ZSApID0+IHtcbiAgICAgICAgdGhpcy5pZCA9IHRoaXMuY29uZmlnLmlkID8gdGhpcy5jb25maWcuaWQgOiBQb3BVaWQoKTtcbiAgICAgICAgdGhpcy5fdHJhY2tBc3NpZ25lZE9wdGlvbnMoKTtcbiAgICAgICAgdGhpcy5fc2V0SG9va3MoKTtcbiAgICAgICAgdGhpcy5fc2V0Q29udGV4dE1lbnUoKTtcbiAgICAgICAgdGhpcy5fY2hlY2tGb3JBc3NpZ25lZE9wdGlvbnMoKTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgIH0gKTtcbiAgICB9O1xuXG4gICAgdGhpcy5kb20ucHJvY2VlZCA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggYXN5bmMoIHJlc29sdmUgKSA9PiB7XG4gICAgICAgIGF3YWl0IHRoaXMuX3NldEhlaWdodCgpO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCBzaG91bGQgaGF2ZSBhIHB1cnBvc2VcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEZpbHRlciBVdGlsaXR5XG4gICAqIEBwYXJhbSB0eXBlXG4gICAqIEBwYXJhbSBmaWx0ZXJcbiAgICovXG4gIG9uQXBwbHlGaWx0ZXIoIHR5cGU6IHN0cmluZywgZmlsdGVyOiBzdHJpbmcgKXtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCAnYXBwbHktZmlsdGVyJywgKCkgPT4ge1xuICAgICAgaWYoIHRoaXMuY29uZmlnLmZpbHRlckJvdGggKXtcbiAgICAgICAgdGhpcy5vbkZpbHRlckJvdGgoIGZpbHRlciApO1xuICAgICAgICB0aGlzLmFzc2lnbmVkRmlsdGVyVmFsdWUgPSBmaWx0ZXI7XG4gICAgICAgIHRoaXMuYXZhaWxhYmxlRmlsdGVyVmFsdWUgPSBmaWx0ZXI7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYoIHR5cGUgPT09ICdhc3NpZ25lZCcgKXtcbiAgICAgICAgICB0aGlzLl9maWx0ZXJBc3NpZ25lZE9wdGlvbnMoIGZpbHRlciApO1xuICAgICAgICAgIHRoaXMuYXNzaWduZWRGaWx0ZXJWYWx1ZSA9IGZpbHRlcjtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhpcy5fZmlsdGVyQXZhaWxhYmxlT3B0aW9ucyggZmlsdGVyICk7XG4gICAgICAgICAgdGhpcy5hdmFpbGFibGVGaWx0ZXJWYWx1ZSA9IGZpbHRlcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5vbkJ1YmJsZUV2ZW50KCAnYXBwbHktZmlsdGVyJywgbnVsbCwgeyBtZXRob2Q6IHR5cGUsIHZhbHVlOiBmaWx0ZXIgfSApO1xuICAgIH0sIDIwMCApO1xuICB9XG5cblxuICAvKipcbiAgICogRmlsdGVyIGJvdGggY29sdW1uc1xuICAgKi9cbiAgb25GaWx0ZXJCb3RoKCBmaWx0ZXI6IHN0cmluZyApe1xuICAgIHRoaXMuY29uZmlnLm9wdGlvbnMudmFsdWVzLm1hcCggb3B0aW9uID0+IHtcbiAgICAgIG9wdGlvbi5hc3NpZ25lZEZpbHRlciA9IG9wdGlvbi5vcHRpb25GaWx0ZXIgPSAhT2JqZWN0Q29udGFpbnNUYWdTZWFyY2goIG9wdGlvbiwgZmlsdGVyICk7XG4gICAgfSApO1xuICB9XG5cblxuICAvKipcbiAgICogQXNzaWduIGEgc3BlY2lmaWMgb3B0aW9uXG4gICAqL1xuICBvbk9wdGlvbkFzc2lnbiggb3B0aW9uOiBTaWRlQnlTaWRlT3B0aW9uSW50ZXJmYWNlLCBjb25maXJtZWQgPSBmYWxzZSApOiBQcm9taXNlPGJvb2xlYW4+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPiggYXN5bmMoIHJlc29sdmUgKSA9PiB7XG4gICAgICBpZighdGhpcy5jb25maWcuZGlzYWJsZWQpe1xuICAgICAgaWYoIElzT2JqZWN0KCBvcHRpb24sIHRydWUgKSAmJiAhdGhpcy51aS5hc3NpZ25lZFsgb3B0aW9uLnZhbHVlIF0gJiYgIW9wdGlvbi5vcHRpb25CbG9jayAmJiAhb3B0aW9uLm9wdGlvbkZpbHRlciApe1xuICAgICAgICBpZiggdGhpcy5jb25maWcuZmFjYWRlRXZlbnQgKXtcbiAgICAgICAgICB0aGlzLm9uQnViYmxlRXZlbnQoICdmYWNhZGVFdmVudCcsICdGYWNhZGUgRXZlbnQgaGFzIGJlZW4gdHJpZ2dlcmVkJywge1xuICAgICAgICAgICAgbWV0aG9kOiAncmVtb3ZlJyxcbiAgICAgICAgICAgIG9wdGlvbnM6IFsgb3B0aW9uIF0sXG4gICAgICAgICAgICBpZHM6IFsgK29wdGlvbi52YWx1ZSBdXG4gICAgICAgICAgfSwgdHJ1ZSApO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGF3YWl0IHRoaXMuX2Fzc2lnbiggWyBvcHRpb24gXSwgY29uZmlybWVkICk7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9fVxuICAgIH0gKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEFzc2lnbiBhbGwgb3B0aW9uc1xuICAgKi9cbiAgb25Bc3NpZ25BbGxPcHRpb25zKCBjb25maXJtZWQgPSBmYWxzZSApOiBQcm9taXNlPGJvb2xlYW4+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPiggYXN5bmMoIHJlc29sdmUgKSA9PiB7XG4gICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5jb25maWcub3B0aW9ucy52YWx1ZXMuZmlsdGVyKCBvcHRpb24gPT4ge1xuICAgICAgICByZXR1cm4gIXRoaXMudWkuYXNzaWduZWRbIG9wdGlvbi52YWx1ZSBdICYmICFvcHRpb24ub3B0aW9uQmxvY2sgJiYgIW9wdGlvbi5vcHRpb25GaWx0ZXI7XG4gICAgICB9ICk7XG4gICAgICBpZiggIW9wdGlvbnMubGVuZ3RoICl7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9XG4gICAgICBpZiggdGhpcy5jb25maWcuZmFjYWRlRXZlbnQgKXtcbiAgICAgICAgdGhpcy5vbkJ1YmJsZUV2ZW50KCAnZmFjYWRlRXZlbnQnLCAnRmFjYWRlIEV2ZW50IGhhcyBiZWVuIHRyaWdnZXJlZCcsIHtcbiAgICAgICAgICBtZXRob2Q6ICdhc3NpZ24nLFxuICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICAgICAgaWRzOiBvcHRpb25zLm1hcCggbyA9PiArby52YWx1ZSApXG4gICAgICAgIH0sIHRydWUgKTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgIH1lbHNle1xuICAgICAgICBhd2FpdCB0aGlzLl9hc3NpZ24oIG9wdGlvbnMsIGNvbmZpcm1lZCApO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbiBvcHRpb24gdGhhdCBpcyBhc3NpZ25lZFxuICAgKiBAcGFyYW0gb3B0aW9uXG4gICAqIEBwYXJhbSBjb25maXJtZWRcbiAgICovXG4gIG9uUmVtb3ZlT3B0aW9uKCBvcHRpb246IFNpZGVCeVNpZGVPcHRpb25JbnRlcmZhY2UsIGNvbmZpcm1lZCA9IGZhbHNlICk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KCBhc3luYyggcmVzb2x2ZSApID0+IHtcbiAgICAgIGlmKCF0aGlzLmNvbmZpZy5kaXNhYmxlZCl7XG4gICAgICBpZiggSXNPYmplY3QoIG9wdGlvbiApICl7XG4gICAgICAgIGlmKCB0aGlzLmNvbmZpZy5mYWNhZGVFdmVudCApe1xuICAgICAgICAgIHRoaXMub25CdWJibGVFdmVudCggJ2ZhY2FkZUV2ZW50JywgJ0ZhY2FkZSBFdmVudCBoYXMgYmVlbiB0cmlnZ2VyZWQnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdyZW1vdmUnLFxuICAgICAgICAgICAgb3B0aW9uczogWyBvcHRpb24gXSxcbiAgICAgICAgICAgIGlkczogWyArb3B0aW9uLnZhbHVlIF1cbiAgICAgICAgICB9LCB0cnVlICk7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYXdhaXQgdGhpcy5fcmVtb3ZlKCBbIG9wdGlvbiBdLCBjb25maXJtZWQgKTtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgICB9XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgfSApO1xuICB9XG5cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCBvcHRpb25zIHRoYXQgYXJlIGFzc2lnbmVkXG4gICAqL1xuICBvblJlbW92ZUFsbE9wdGlvbnMoIGNvbmZpcm1lZCA9IGZhbHNlICk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KCBhc3luYyggcmVzb2x2ZSApID0+IHtcbiAgICAgIHRoaXMuY29uZmlnLnBhdGNoLnJlbW92ZUVyck1lc3NhZ2UgPSAnJztcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBbXTtcbiAgICAgIHRoaXMuY29uZmlnLm9wdGlvbnMudmFsdWVzLm1hcCggb3B0aW9uID0+IHtcbiAgICAgICAgaWYoIHRoaXMudWkuYXNzaWduZWRbIG9wdGlvbi52YWx1ZSBdICYmICFvcHRpb24uYXNzaWduZWRGaWx0ZXIgKXtcbiAgICAgICAgICBvcHRpb24ucGF0Y2hpbmcgPSB0cnVlO1xuICAgICAgICAgIG9wdGlvbnMucHVzaCggb3B0aW9uICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICAgIGlmKCAhb3B0aW9ucy5sZW5ndGggKXtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgIH1cbiAgICAgIGlmKCB0aGlzLmNvbmZpZy5mYWNhZGVFdmVudCApe1xuICAgICAgICB0aGlzLm9uQnViYmxlRXZlbnQoICdmYWNhZGVFdmVudCcsICdGYWNhZGUgRXZlbnQgaGFzIGJlZW4gdHJpZ2dlcmVkJywge1xuICAgICAgICAgIG1ldGhvZDogJ3JlbW92ZScsXG4gICAgICAgICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICAgICAgICBpZHM6IG9wdGlvbnMubWFwKCBvID0+ICtvLnZhbHVlIClcbiAgICAgICAgfSwgdHJ1ZSApO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGF3YWl0IHRoaXMuX3JlbW92ZSggb3B0aW9ucywgY29uZmlybWVkICk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9XG4gICAgfSApO1xuICB9XG5cblxuICAvKipcbiAgICogR28gdG8gbGlua2VkIHJvdXRlIG9mIG9wdGlvblxuICAgKiBAcGFyYW0gb3B0aW9uXG4gICAqL1xuICBvbk5hdmlnYXRlVG9PcHRpb25Sb3V0ZSggb3B0aW9uOiBTaWRlQnlTaWRlT3B0aW9uSW50ZXJmYWNlICl7XG4gICAgaWYoIHRoaXMuY29uZmlnLnJvdXRlICl7XG4gICAgICBsZXQgcm91dGUgPSB0aGlzLmNvbmZpZy5yb3V0ZS5zbGljZSgpO1xuICAgICAgcm91dGUgPSBTdHJpbmcoIHJvdXRlICkucmVwbGFjZSggLzp2YWx1ZS9nLCAnJyArIG9wdGlvbi52YWx1ZSApLnJlcGxhY2UoIC86bmFtZS9nLCBvcHRpb24ubmFtZSApO1xuXG4gICAgICB0aGlzLnNydi5yb3V0ZXIubmF2aWdhdGVCeVVybCggcm91dGUgKS50aGVuKCBkYXRhID0+IHtcbiAgICAgIH0gKVxuICAgICAgICAuY2F0Y2goIGUgPT4ge1xuICAgICAgICAgIC8vIGNvbnN0IGVyck1lc3NhZ2UgPSAnUm91dGUgbm90IGZvdW5kOicgKyByb3V0ZTtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICB0aGlzLmV2ZW50cy5lbWl0KCB7IHNvdXJjZTogdGhpcy5uYW1lLCB0eXBlOiAnY29udGV4dF9tZW51JywgbmFtZTogJ3BvcnRhbCcsIGRhdGE6IHJvdXRlLCBjb25maWc6IHRoaXMuY29uZmlnIH0gKTtcbiAgICAgICAgICAvLyBvcHRpb24uZXJyTWVzc2FnZSA9IGVyck1lc3NhZ2U7XG4gICAgICAgICAgLy8gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgLy8gICBpZiggb3B0aW9uLmVyck1lc3NhZ2UgPT09IGVyck1lc3NhZ2UgKSBvcHRpb24uZXJyTWVzc2FnZSA9ICcnO1xuICAgICAgICAgIC8vIH0sIDIwMDApO1xuICAgICAgICB9ICk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogSW50ZXJjZXB0IHRoZSB1c2VyIHJpZ2h0IG1vdXNlIGNsaWNrIHRvIHNob3cgYSBjb250ZXh0IG1lbnUgZm9yIHRoaXMgY29tcG9uZW50XG4gICAqIEBwYXJhbSBvcHRpb25cbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuICBvbk1vdXNlUmlnaHRDbGljayggb3B0aW9uLCBldmVudDogTW91c2VFdmVudCApe1xuICAgIGxldCByb3V0ZSA9IHRoaXMuY29uZmlnLnJvdXRlLnNsaWNlKCk7XG4gICAgcm91dGUgPSBTdHJpbmcoIHJvdXRlICkucmVwbGFjZSggLzp2YWx1ZS9nLCAnJyArIG9wdGlvbi52YWx1ZSApLnJlcGxhY2UoIC86bmFtZS9nLCBvcHRpb24ubmFtZSApO1xuXG4gICAgaWYoICFyb3V0ZSApIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGlmIHdlIGhhdmVuJ3QgcmV0dXJuZWQsIHByZXZlbnQgdGhlIGRlZmF1bHQgYmVoYXZpb3Igb2YgdGhlIHJpZ2h0IGNsaWNrLlxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5kb20uY29udGV4dE1lbnUuY29uZmlnO1xuXG4gICAgLy8gcmVzZXQgdGhlIGNvbnRleHQgbWVudSwgYW5kIGNvbmZpZ3VyZSBpdCB0byBsb2FkIGF0IHRoZSBwb3NpdGlvbiBjbGlja2VkLlxuICAgIGNvbnRleHQucmVzZXRPcHRpb25zKCk7XG5cbiAgICAvLyBpZih0aGlzLmNvbmZpZy5pbnRlcm5hbF9uYW1lKSB0aGlzLmRvbS5jb250ZXh0TWVudS5hZGRQb3J0YWxPcHRpb24odGhpcy5jb25maWcuaW50ZXJuYWxfbmFtZSwgK3Jvdy5lbnRpdHlJZCk7XG4gICAgY29uc3QgYXBpX3BhdGggPSByb3V0ZS5zcGxpdCggJy8nIClbIDAgXTtcbiAgICBjb25zdCBlbnRpdHlQYXJhbXMgPSB0aGlzLnNydi5wYXJhbS5nZXRFbnRpdHlQYXJhbXNXaXRoUGF0aCggYXBpX3BhdGgsIG9wdGlvbi52YWx1ZSApO1xuICAgIGlmKCBlbnRpdHlQYXJhbXMgKSBjb250ZXh0LmFkZFBvcnRhbE9wdGlvbiggZW50aXR5UGFyYW1zLmludGVybmFsX25hbWUsIGVudGl0eVBhcmFtcy5lbnRpdHlJZCApO1xuXG4gICAgY29udGV4dC5hZGROZXdUYWJPcHRpb24oIHJvdXRlICk7XG5cbiAgICBjb250ZXh0LnggPSBldmVudC5jbGllbnRYO1xuICAgIGNvbnRleHQueSA9IGV2ZW50LmNsaWVudFk7XG4gICAgY29udGV4dC50b2dnbGUubmV4dCggdHJ1ZSApO1xuICB9XG5cblxuICBvbkJ1YmJsZUV2ZW50KCBldmVudE5hbWU6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nID0gbnVsbCwgZXh0ZW5kOiBEaWN0aW9uYXJ5PGFueT4gPSB7fSwgZm9yY2UgPSBmYWxzZSApOiBQb3BCYXNlRXZlbnRJbnRlcmZhY2V7XG4gICAgY29uc3QgZXZlbnQgPSA8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPntcbiAgICAgIHR5cGU6ICdmaWVsZCcsXG4gICAgICBuYW1lOiBldmVudE5hbWUsXG4gICAgICBzb3VyY2U6IHRoaXMubmFtZVxuICAgIH07XG4gICAgaWYoIHRoaXMuY29uZmlnICkgZXZlbnQuY29uZmlnID0gdGhpcy5jb25maWc7XG4gICAgaWYoIG1lc3NhZ2UgKSBldmVudC5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICBPYmplY3Qua2V5cyggZXh0ZW5kICkubWFwKCAoIGtleSApID0+IHtcbiAgICAgIGV2ZW50WyBrZXkgXSA9IGV4dGVuZFsga2V5IF07XG4gICAgfSApO1xuICAgIHRoaXMubG9nLmV2ZW50KCBgb25CdWJibGVFdmVudGAsIGV2ZW50ICk7XG4gICAgaWYoIHRoaXMuY29uZmlnLmJ1YmJsZSB8fCBmb3JjZSApe1xuICAgICAgdGhpcy5ldmVudHMuZW1pdCggZXZlbnQgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZXZlbnQ7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDbGVhbiB1cCB0aGUgZG9tIG9mIHRoaXMgY29tcG9uZW50XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIHByaXZhdGUgX2Fzc2lnbiggb3B0aW9uczogU2lkZUJ5U2lkZU9wdGlvbkludGVyZmFjZVtdLCBjb25maXJtZWQgPSBmYWxzZSApOiBQcm9taXNlPGFueT57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KCBhc3luYyggcmVzb2x2ZSApID0+IHtcbiAgICAgIHRoaXMuX2JlZm9yZVBhdGNoKCBvcHRpb25zICk7XG4gICAgICBpZiggdGhpcy5jb25maWcuZmFjYWRlICl7XG4gICAgICAgIGF3YWl0IFNsZWVwKCA1MDAgKTtcbiAgICAgICAgdGhpcy5fb25Bc3NpZ25TdWNjZXNzKCBvcHRpb25zICk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ZWxzZSBpZiggdGhpcy5jb25maWcucGF0Y2gucGF0aCAmJiB0aGlzLmNvbmZpZy5wYXRjaC5maWVsZCApe1xuICAgICAgICBjb25zdCByZXF1ZXN0ID0gdGhpcy5fZ2V0UmVxdWVzdCggJ2Fzc2lnbicsIHRoaXMuX2dldFJlcXVlc3RCb2R5KCAnYXNzaWduJywgb3B0aW9ucywgY29uZmlybWVkICkgKTtcbiAgICAgICAgcmVxdWVzdC5zdWJzY3JpYmUoIGFzeW5jKCByZXM6IGFueSApID0+IHtcbiAgICAgICAgICBpZiggcmVzLmRhdGEgKSByZXMgPSByZXMuZGF0YTtcbiAgICAgICAgICBpZiggcmVzLmNvbmZpcm1hdGlvbiApe1xuICAgICAgICAgICAgY29uc3QgaXNDb25maXJtZWQgPSBhd2FpdCB0aGlzLl9jb25maXJtQWN0aW9uKCByZXMuY29uZmlybWF0aW9uICk7XG4gICAgICAgICAgICBpZiggaXNDb25maXJtZWQgKXtcbiAgICAgICAgICAgICAgdGhpcy5fYXNzaWduKCBvcHRpb25zLCB0cnVlICkudGhlbiggKCkgPT4gdHJ1ZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5fb25Bc3NpZ25TdWNjZXNzKCBvcHRpb25zICk7XG4gICAgICAgICAgICB0aGlzLm9uQnViYmxlRXZlbnQoICdwYXRjaCcsICdQYXRjaGVkJywge1xuICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICBtZXRob2Q6ICdhc3NpZ24nLFxuICAgICAgICAgICAgICBpZHM6IG9wdGlvbnMubWFwKCBvID0+IG8udmFsdWUgKSxcbiAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuY29uZmlnLmFzc2lnbmVkXG4gICAgICAgICAgICB9LCB0cnVlICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXNvbHZlKCByZXMgKTtcbiAgICAgICAgfSwgKCBlcnIgKSA9PiB7XG4gICAgICAgICAgdGhpcy5faGFuZGxlQXNzaWduRXJyb3IoIGVyciApO1xuICAgICAgICAgIHRoaXMuX29uQXNzaWduRmFpbCggb3B0aW9ucyApO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKCBmYWxzZSApO1xuICAgICAgICB9ICk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5fb25Bc3NpZ25TdWNjZXNzKCBvcHRpb25zICk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9XG4gICAgfSApO1xuICB9XG5cblxuICBwcml2YXRlIF9yZW1vdmUoIG9wdGlvbnM6IFNpZGVCeVNpZGVPcHRpb25JbnRlcmZhY2VbXSA9IFtdLCBjb25maXJtZWQgPSBmYWxzZSApOiBQcm9taXNlPGFueT57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KCBhc3luYyggcmVzb2x2ZSApID0+IHtcbiAgICAgIHRoaXMuX2JlZm9yZVBhdGNoKCBvcHRpb25zICk7XG4gICAgICBpZiggdGhpcy5jb25maWcuZmFjYWRlICl7XG4gICAgICAgIGF3YWl0IFNsZWVwKCA1MDAgKTtcbiAgICAgICAgdGhpcy5fb25SZW1vdmVTdWNjZXNzKCBvcHRpb25zICk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ZWxzZSBpZiggdGhpcy5jb25maWcucGF0Y2gucGF0aCAmJiB0aGlzLmNvbmZpZy5wYXRjaC5maWVsZCApe1xuICAgICAgICBpZighY29uZmlybWVkICYmIHRoaXMuY29uZmlnLnBhdGNoLmNvbmZsaWN0UGF0aCl7XG5cblxuICAgICAgICAgIGNvbnN0IHZhbHVlID0gb3B0aW9uc1swXS52YWx1ZTtcbiAgICAgICAgICAvLyBjb25zdCBwYXRoID0gJ3VzZXJzLzEyL3JvbGVzLzEvY29uZmxpY3RzJztcblxuICAgICAgICAgIGNvbnN0IHBhdGggPSBJbnRlcnBvbGF0ZVN0cmluZyggdGhpcy5jb25maWcucGF0Y2guY29uZmxpY3RQYXRoLHt2YWx1ZTp2YWx1ZX0pO1xuICAgICAgICAgIC8vIHVzZXJzL3tlbnRpdHlJZH0vcm9sZXMve3ZhbHVlfS9jb25mbGljdHNcbiAgICAgICAgICBQb3BSZXF1ZXN0LmRvUG9zdChwYXRoICwge30pLnN1YnNjcmliZSggYXN5bmMgKHJlczphbnkpPT57XG4gICAgICAgICAgICBpZihyZXMuZGF0YSkgcmVzPXJlcy5kYXRhO1xuICAgICAgICAgICAgaWYoSXNBcnJheShyZXMsdHJ1ZSkpe1xuICAgICAgICAgICAgICBvcHRpb25zLm1hcCggKCBvcHRpb24gKSA9PiB7XG4gICAgICAgICAgICAgICAgb3B0aW9uLnBhdGNoaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgY29uc3QgaXNDb25maXJtZWQgPSBhd2FpdCB0aGlzLl9jb25maXJtQWN0aW9uKCByZXNbMF0gKTtcbiAgICAgICAgICAgICAgaWYoIGlzQ29uZmlybWVkICl7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVtb3ZlKCBvcHRpb25zLCB0cnVlICkudGhlbiggKCkgPT4gdHJ1ZSApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLl9yZW1vdmUoIG9wdGlvbnMsIHRydWUgKS50aGVuKCAoKSA9PiB0cnVlICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9KVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgcmVxdWVzdCA9IHRoaXMuX2dldFJlcXVlc3QoICdyZW1vdmUnLCB0aGlzLl9nZXRSZXF1ZXN0Qm9keSggJ3JlbW92ZScsIG9wdGlvbnMsIGNvbmZpcm1lZCApICk7XG4gICAgICAgICAgcmVxdWVzdC5zdWJzY3JpYmUoIGFzeW5jKCByZXM6IGFueSApID0+IHtcbiAgICAgICAgICAgIGlmKCByZXMuZGF0YSApIHJlcyA9IHJlcy5kYXRhO1xuXG4gICAgICAgICAgICAgIHRoaXMuX29uUmVtb3ZlU3VjY2Vzcyggb3B0aW9ucyApO1xuICAgICAgICAgICAgICB0aGlzLm9uQnViYmxlRXZlbnQoICdwYXRjaCcsICdQYXRjaGVkJywge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAncmVtb3ZlJyxcbiAgICAgICAgICAgICAgICBpZHM6IG9wdGlvbnMubWFwKCBvID0+IG8udmFsdWUgKSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5jb25maWcuYXNzaWduZWRcbiAgICAgICAgICAgICAgfSwgdHJ1ZSApO1xuXG5cbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCByZXMgKTtcbiAgICAgICAgICB9LCAoIGVyciApID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZVJlbW92ZUVycm9yKCBlcnIgKTtcbiAgICAgICAgICAgIHRoaXMuX29uUmVtb3ZlRmFpbCggb3B0aW9ucyApO1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5fb25SZW1vdmVTdWNjZXNzKCBvcHRpb25zICk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9XG4gICAgfSApO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UmVxdWVzdEJvZHkoIG1ldGhvZDogJ2Fzc2lnbicgfCAncmVtb3ZlJywgb3B0aW9uczogU2lkZUJ5U2lkZU9wdGlvbkludGVyZmFjZVtdLCBjb25maXJtZWQgPSBmYWxzZSApe1xuXG4gICAgaWYoIHRoaXMuY29uZmlnLnBhdGNoLmZpZWxkICl7XG5cbiAgICB9XG4gICAgY29uc3QgYm9keSA9IHt9O1xuICAgIGlmKCB0aGlzLmNvbmZpZy5wYXRjaC5tZXRhZGF0YSApe1xuICAgICAgZm9yKCBjb25zdCBpIGluIHRoaXMuY29uZmlnLnBhdGNoLm1ldGFkYXRhICl7XG4gICAgICAgIGlmKCAhdGhpcy5jb25maWcucGF0Y2gubWV0YWRhdGEuaGFzT3duUHJvcGVydHkoIGkgKSApIGNvbnRpbnVlO1xuICAgICAgICBib2R5WyBpIF0gPSB0aGlzLmNvbmZpZy5wYXRjaC5tZXRhZGF0YVsgaSBdO1xuICAgICAgfVxuICAgIH1cbiAgICBib2R5WyB0aGlzLmNvbmZpZy5wYXRjaC5maWVsZCBdID0gb3B0aW9ucy5tYXAoIG8gPT4gby52YWx1ZSApO1xuICAgIGJvZHlbICdtZXRob2QnIF0gPSBtZXRob2Q7XG4gICAgYm9keVsgJ2NvbmZpcm1lZCcgXSA9IGNvbmZpcm1lZDtcblxuICAgIHJldHVybiBib2R5O1xuICB9XG5cblxuICBwcml2YXRlIF9nZXRSZXF1ZXN0KCBtZXRob2Q6ICdhc3NpZ24nIHwgJ3JlbW92ZScsIGJvZHk6IG9iamVjdCA9IHt9ICl7XG4gICAgbGV0IHBhdGggPSB0aGlzLmNvbmZpZy5wYXRjaC5wYXRoO1xuICAgIGNvbnN0IGlnbm9yZTQwMSA9ICggdGhpcy5jb25maWcucGF0Y2guaWdub3JlNDAxID8gdHJ1ZSA6IG51bGwgKTtcbiAgICBjb25zdCB2ZXJzaW9uID0gKCB0aGlzLmNvbmZpZy5wYXRjaC52ZXJzaW9uID8gdGhpcy5jb25maWcucGF0Y2gudmVyc2lvbiA6IDEgKTtcbiAgICBjb25zdCBwb3N0ID0ge307XG4gICAgaWYoIHRoaXMuY29uZmlnLnBhdGNoLm1ldGFkYXRhICl7XG4gICAgICBmb3IoIGNvbnN0IGkgaW4gdGhpcy5jb25maWcucGF0Y2gubWV0YWRhdGEgKXtcbiAgICAgICAgaWYoICF0aGlzLmNvbmZpZy5wYXRjaC5tZXRhZGF0YS5oYXNPd25Qcm9wZXJ0eSggaSApICkgY29udGludWU7XG4gICAgICAgIHBvc3RbIGkgXSA9IHRoaXMuY29uZmlnLnBhdGNoLm1ldGFkYXRhWyBpIF07XG4gICAgICB9XG4gICAgfVxuICAgIGlmKHRoaXMuY29uZmlnLnBhdGNoLmFkZElkKXtcbiAgICAgIGNvbnN0IGlkID0gIGJvZHlbIHRoaXMuY29uZmlnLnBhdGNoLmZpZWxkIF1bMF0gO1xuICAgICAgcGF0aCA9IEludGVycG9sYXRlU3RyaW5nKCB0aGlzLmNvbmZpZy5wYXRjaC5wYXRoLHtpZDppZH0pO1xuXG4gICAgfVxuXG4gICAgaWYoIG1ldGhvZCA9PT0gJ2Fzc2lnbicgKXtcbiAgICAgIHN3aXRjaCggU3RyaW5nKCB0aGlzLmNvbmZpZy5wYXRjaC5hc3NpZ25NZXRob2QgKS50b0xvd2VyQ2FzZSgpICl7XG4gICAgICAgIGNhc2UgJ3BhdGNoJzpcbiAgICAgICAgICByZXR1cm4gUG9wUmVxdWVzdC5kb1BhdGNoKCBgJHsgcGF0aH1gLCBib2R5LCB2ZXJzaW9uLCBpZ25vcmU0MDEgKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncG9zdCc6XG4gICAgICAgICAgcmV0dXJuIFBvcFJlcXVlc3QuZG9Qb3N0KCBgJHsgcGF0aCB9YCwgYm9keSwgdmVyc2lvbiwgaWdub3JlNDAxICk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIFBvcFJlcXVlc3QuZG9Qb3N0KCBgJHsgcGF0aH1gLCBib2R5LCB2ZXJzaW9uLCBpZ25vcmU0MDEgKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgIH1lbHNle1xuICAgICAgc3dpdGNoKCBTdHJpbmcoIHRoaXMuY29uZmlnLnBhdGNoLnJlbW92ZWRNZXRob2QgKS50b0xvd2VyQ2FzZSgpICl7XG4gICAgICAgIGNhc2UgJ3BhdGNoJzpcbiAgICAgICAgICByZXR1cm4gUG9wUmVxdWVzdC5kb1BhdGNoKCBgJHsgcGF0aH1gLCBib2R5LCB2ZXJzaW9uLCBpZ25vcmU0MDEgKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncG9zdCc6XG4gICAgICAgICAgcmV0dXJuIFBvcFJlcXVlc3QuZG9Qb3N0KCBgJHsgcGF0aH1gLCBib2R5LCB2ZXJzaW9uLCBpZ25vcmU0MDEgKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgICByZXR1cm4gUG9wUmVxdWVzdC5kb0RlbGV0ZSggYCR7IHBhdGh9YCwgYm9keSwgdmVyc2lvbiwgaWdub3JlNDAxICk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIFBvcFJlcXVlc3QuZG9EZWxldGUoIGAkeyBwYXRofWAsIGJvZHksIHZlcnNpb24sIGlnbm9yZTQwMSApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFBvcFJlcXVlc3QuZG9EZWxldGUoIGAkeyBwYXRofWAsIGJvZHksIHZlcnNpb24sIGlnbm9yZTQwMSApO1xuICAgIH1cbiAgfVxuXG5cbiAgcHJpdmF0ZSBfaGFuZGxlQXNzaWduRXJyb3IoIGVycjogYW55ICl7XG4gICAgdGhpcy5jb25maWcucGF0Y2guYXNzaWduRXJyTWVzc2FnZSA9IEdldEh0dHBFcnJvck1zZyggZXJyICk7XG4gICAgdGhpcy5jb25maWcucGF0Y2gucnVubmluZyA9IGZhbHNlO1xuICB9XG5cblxuICBwcml2YXRlIF9oYW5kbGVSZW1vdmVFcnJvciggZXJyOiBhbnkgKXtcbiAgICB0aGlzLmNvbmZpZy5wYXRjaC5yZW1vdmVFcnJNZXNzYWdlID0gR2V0SHR0cEVycm9yTXNnKCBlcnIgKTtcbiAgICB0aGlzLmNvbmZpZy5wYXRjaC5ydW5uaW5nID0gZmFsc2U7XG4gIH1cblxuXG4gIHByaXZhdGUgX29uQXNzaWduU3VjY2Vzcyggb3B0aW9uczogYW55W10gPSBbXSApe1xuICAgIHRoaXMuY29uZmlnLnBhdGNoLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICBvcHRpb25zLm1hcCggb3B0aW9uID0+IHtcbiAgICAgIHRoaXMudWkuYXNzaWduZWRbIG9wdGlvbi52YWx1ZSBdID0gMTtcbiAgICAgIG9wdGlvbi5wYXRjaGluZyA9IGZhbHNlO1xuICAgIH0gKTtcbiAgICB0aGlzLl9jaGVja0ZvckFzc2lnbmVkT3B0aW9ucygpO1xuICAgIGNvbnN0IGV2ZW50ID0gdGhpcy5vbkJ1YmJsZUV2ZW50KCAnYXNzaWduJywgJ0Fzc2lnbmVkJywge1xuICAgICAgbWV0aG9kOiAnYXNzaWduJyxcbiAgICAgIGlkczogb3B0aW9ucy5tYXAoIG8gPT4gby52YWx1ZSApLFxuICAgICAgdmFsdWU6IHRoaXMuY29uZmlnLmFzc2lnbmVkXG4gICAgfSApO1xuICAgIGlmKCBJc0NhbGxhYmxlRnVuY3Rpb24oIHRoaXMuY29uZmlnLnBhdGNoLmNhbGxiYWNrICkgKXtcbiAgICAgIHRoaXMuY29uZmlnLnBhdGNoLmNhbGxiYWNrKHRoaXMuY29yZSwgZXZlbnQgKTtcbiAgICB9XG4gIH1cblxuXG4gIHByaXZhdGUgX2JlZm9yZVBhdGNoKCBvcHRpb25zOiBTaWRlQnlTaWRlT3B0aW9uSW50ZXJmYWNlW10gPSBbXSApe1xuICAgIHRoaXMuY29uZmlnLnBhdGNoLnJlbW92ZUVyck1lc3NhZ2UgPSAnJztcbiAgICB0aGlzLmNvbmZpZy5wYXRjaC5ydW5uaW5nID0gdHJ1ZTtcbiAgICBvcHRpb25zLm1hcCggKCBvcHRpb24gKSA9PiB7XG4gICAgICBvcHRpb24ucGF0Y2hpbmcgPSB0cnVlO1xuICAgICAgb3B0aW9uLmVyck1lc3NhZ2UgPSAnJztcbiAgICB9ICk7XG4gIH1cblxuICBwcml2YXRlIF9mb3JtYXRDb25mbGljdERhdGEoY29uZmxpY3REYXRhOmFueVtdKXtcbiAgICBjb25zdCB0YWJsZURhdGEgPSBjb25mbGljdERhdGEubWFwKHBvZHM9PntcbiAgICAgIHJldHVybiB7ICBwb2Q6cG9kcy5uYW1lLCB0aXRsZTpwb2RzLnBpdm90LmlzX2xlYWRlcj8nTGVhZGVyJzonTWVtYmVyJ31cbiAgICB9KTtcbiAgICByZXR1cm4gdGFibGVEYXRhO1xuICB9XG4gIHByaXZhdGUgX2NvbmZpcm1BY3Rpb24oIGNvbmZsaWN0RGF0YTphbnlbXSk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KCAoIHJlc29sdmUgKSA9PiB7XG4gICAgICBjb25zdCB0YWJsZURhdGEgPSB0aGlzLl9mb3JtYXRDb25mbGljdERhdGEoY29uZmxpY3REYXRhKTtcbiAgICAgIHRoaXMuc3J2LmRpYWxvZy5vcGVuKCBQb3BUYWJsZURpYWxvZ0NvbXBvbmVudCwge1xuICAgICAgICB3aWR0aDogJzUwMHB4JyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGRhdGE6IHRhYmxlRGF0YSxcbiAgICAgICAgICB0eXBlOidzaWRlQnlTaWRlJyxcbiAgICAgICAgICB0YWJsZTp0aGlzLmNvbmZpZy5wYXRjaC5jb25mbGljdFRhYmxlQ29uZmlnLFxuICAgICAgICAgIG1lc3NhZ2U6IHRoaXMuY29uZmlnLnBhdGNoLmNvbmZsaWN0TWVzc2FnZSxcbiAgICAgICAgICBoZWFkZXI6dGhpcy5jb25maWcucGF0Y2guY29uZmxpY3RIZWFkZXI/dGhpcy5jb25maWcucGF0Y2guY29uZmxpY3RIZWFkZXI6JydcbiAgICAgICAgfVxuICAgICAgfSApLmFmdGVyQ2xvc2VkKCkuc3Vic2NyaWJlKCByZXMgPT4ge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSggcmVzID8gdHJ1ZSA6IGZhbHNlICk7XG4gICAgICB9ICk7XG4gICAgfSApO1xuICB9XG5cblxuICBwcml2YXRlIF9vbkFzc2lnbkZhaWwoIG9wdGlvbnM6IFNpZGVCeVNpZGVPcHRpb25JbnRlcmZhY2VbXSA9IFtdICl7XG4gICAgdGhpcy5jb25maWcucGF0Y2gucnVubmluZyA9IGZhbHNlO1xuICAgIG9wdGlvbnMubWFwKCBvcHRpb24gPT4ge1xuICAgICAgZGVsZXRlIHRoaXMudWkuYXNzaWduZWRbIG9wdGlvbi52YWx1ZSBdO1xuICAgICAgb3B0aW9uLnBhdGNoaW5nID0gZmFsc2U7XG4gICAgfSApO1xuICAgIHRoaXMuX2NoZWNrRm9yQXNzaWduZWRPcHRpb25zKCk7XG4gIH1cblxuXG4gIHByaXZhdGUgX29uUmVtb3ZlRmFpbCggb3B0aW9uczogU2lkZUJ5U2lkZU9wdGlvbkludGVyZmFjZVtdID0gW10gKXtcbiAgICB0aGlzLmNvbmZpZy5wYXRjaC5ydW5uaW5nID0gZmFsc2U7XG4gICAgb3B0aW9ucy5tYXAoIG9wdGlvbiA9PiB7XG4gICAgICB0aGlzLnVpLmFzc2lnbmVkWyBvcHRpb24udmFsdWUgXSA9IDE7XG4gICAgICBvcHRpb24ucGF0Y2hpbmcgPSBmYWxzZTtcbiAgICB9ICk7XG4gICAgdGhpcy5fY2hlY2tGb3JBc3NpZ25lZE9wdGlvbnMoKTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfb25SZW1vdmVTdWNjZXNzKCBvcHRpb25zOiBTaWRlQnlTaWRlT3B0aW9uSW50ZXJmYWNlW10gPSBbXSApe1xuICAgIHRoaXMuY29uZmlnLnBhdGNoLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICBvcHRpb25zLm1hcCggb3B0aW9uID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLnVpLmFzc2lnbmVkWyBvcHRpb24udmFsdWUgXTtcbiAgICAgIG9wdGlvbi5wYXRjaGluZyA9IGZhbHNlO1xuICAgIH0gKTtcbiAgICB0aGlzLl9jaGVja0ZvckFzc2lnbmVkT3B0aW9ucygpO1xuXG4gICAgY29uc3QgZXZlbnQgPSB0aGlzLm9uQnViYmxlRXZlbnQoICdyZW1vdmUnLCAnUmVtb3ZlZCcsXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ3JlbW92ZScsXG4gICAgICAgIGlkczogb3B0aW9ucy5tYXAoIG8gPT4gby52YWx1ZSApLFxuICAgICAgICB2YWx1ZTogdGhpcy5jb25maWcuYXNzaWduZWRcbiAgICAgIH1cbiAgICApO1xuICAgIGlmKCBJc0NhbGxhYmxlRnVuY3Rpb24oIHRoaXMuY29uZmlnLnBhdGNoLmNhbGxiYWNrICkgKXtcbiAgICAgIHRoaXMuY29uZmlnLnBhdGNoLmNhbGxiYWNrKCB0aGlzLmNvcmUsIGV2ZW50ICk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgbmFpdmdhdGVzIHRoZSBjb21wbGV4aXR5IG9mIHRoZSBzZXR0aW5nIHRoZSBoZWlnaHRzIG5lZWRlZCBpbiB0aGlzIGNvbXBvbmVudFxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0SGVpZ2h0KCl7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUgKSA9PiB7XG4gICAgICB0aGlzLmRvbS5vdmVyaGVhZCA9IDI7XG4gICAgICBpZiggdGhpcy5jb25maWcuaGFzSGVhZGVyICkgdGhpcy5kb20ub3ZlcmhlYWQgKz0gMzg7XG4gICAgICBpZiggdGhpcy5jb25maWcuaGFzRmlsdGVyUm93ICkgdGhpcy5kb20ub3ZlcmhlYWQgKz0gNDk7XG4gICAgICBpZiggdGhpcy5jb25maWcuaGFzTGFiZWxSb3cgKSB0aGlzLmRvbS5vdmVyaGVhZCArPSA0NTtcblxuICAgICAgaWYoICF0aGlzLmNvbmZpZy5oZWlnaHQgKSB0aGlzLmNvbmZpZy5oZWlnaHQgPSBQb3BUZW1wbGF0ZS5nZXRDb250ZW50SGVpZ2h0KCBmYWxzZSwgMjcwICk7XG5cblxuICAgICAgbGV0IHRhYkNvbHVtbkhlaWdodCA9IHRoaXMuZG9tLnJlcG8uZ2V0Q29tcG9uZW50SGVpZ2h0KCAnUG9wRW50aXR5VGFiQ29sdW1uQ29tcG9uZW50JywgdGhpcy5wb3NpdGlvbiApO1xuICAgICAgaWYoICF0YWJDb2x1bW5IZWlnaHQgKSB0YWJDb2x1bW5IZWlnaHQgPSB0aGlzLmRvbS5yZXBvLmdldENvbXBvbmVudEhlaWdodCggJ1BvcFRhYk1lbnVDb21wb25lbnQnLCAxICk7XG4gICAgICBpZiggdGFiQ29sdW1uSGVpZ2h0ICYmIHRhYkNvbHVtbkhlaWdodC5pbm5lciApe1xuICAgICAgICB0aGlzLmRvbS5oZWlnaHQuZGVmYXVsdCA9IHRhYkNvbHVtbkhlaWdodC5pbm5lciAtIDIwO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuZG9tLmhlaWdodC5kZWZhdWx0ID0gUG9wVGVtcGxhdGUuZ2V0Q29udGVudEhlaWdodCggZmFsc2UsIHRoaXMuZG9tLm92ZXJoZWFkICk7XG4gICAgICB9XG5cbiAgICAgIGlmKCB0aGlzLmNvbmZpZy5wYXJlbnRDbGFzc05hbWUgKXtcbiAgICAgICAgdGhpcy5kb20ub3ZlcmhlYWQgPSB0aGlzLmRvbS5vdmVyaGVhZCArICggTWF0aC5hYnMoIHRoaXMuZWwubmF0aXZlRWxlbWVudC5vZmZzZXRUb3AgKSArIDEwMCApO1xuICAgICAgICB0aGlzLmRvbS5zZXRIZWlnaHRXaXRoUGFyZW50KCB0aGlzLmNvbmZpZy5wYXJlbnRDbGFzc05hbWUsIHRoaXMuZG9tLm92ZXJoZWFkLCB0aGlzLmRvbS5oZWlnaHQuZGVmYXVsdCApLnRoZW4oICggcmVzICkgPT4ge1xuICAgICAgICAgIHRoaXMubG9nLmluZm8oIGBzZXRIZWlnaHQgd2l0aCAkeyB0aGlzLmNvbmZpZy5wYXJlbnRDbGFzc05hbWUgfWAgKTtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgICB9ICk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYoIHRoaXMuY29uZmlnLmhlaWdodCApe1xuICAgICAgICAgIC8vIGlmKCB0aGlzLmNvbmZpZy5oZWlnaHQgPCAoIHRoaXMuZG9tLm92ZXJoZWFkICogMiApICkgdGhpcy5jb25maWcuaGVpZ2h0ID0gdGhpcy5kb20ub3ZlcmhlYWQgKiAyO1xuICAgICAgICAgIHRoaXMuZG9tLnNldEhlaWdodCggdGhpcy5jb25maWcuaGVpZ2h0LCB0aGlzLmRvbS5vdmVyaGVhZCApO1xuICAgICAgICAgIHRoaXMubG9nLmluZm8oIGBzZXRIZWlnaHQgd2l0aCBjb25maWcuaGVpZ2h0OiR7IHRoaXMuY29uZmlnLmhlaWdodCB9IC0gb3ZlcmhlYWQ6JHsgdGhpcy5kb20ub3ZlcmhlYWQgfWAgKTtcbiAgICAgICAgfWVsc2UgaWYoIHRoaXMuY29uZmlnLmJ1Y2tldEhlaWdodCApe1xuICAgICAgICAgIHRoaXMuY29uZmlnLmhlaWdodCA9IHRoaXMuY29uZmlnLmJ1Y2tldEhlaWdodCArIHRoaXMuZG9tLm92ZXJoZWFkO1xuICAgICAgICAgIHRoaXMuZG9tLnNldEhlaWdodCggK3RoaXMuY29uZmlnLmhlaWdodCwgdGhpcy5kb20ub3ZlcmhlYWQgKTtcbiAgICAgICAgICB0aGlzLmxvZy5pbmZvKCBgc2V0SGVpZ2h0IHdpdGggY29uZmlnLmJ1Y2tldEhlaWdodDokeyB0aGlzLmNvbmZpZy5idWNrZXRIZWlnaHQgfSAtIG92ZXJoZWFkOiR7IHRoaXMuZG9tLm92ZXJoZWFkIH1gICk7XG4gICAgICAgIH1lbHNlIGlmKCB0aGlzLmNvbmZpZy5idWNrZXRMaW1pdCApe1xuICAgICAgICAgIHRoaXMuY29uZmlnLmJ1Y2tldExpbWl0ID0gdGhpcy5jb25maWcuYnVja2V0TGltaXQgPiB0aGlzLmNvbmZpZy5vcHRpb25zLnZhbHVlcy5sZW5ndGggPyB0aGlzLmNvbmZpZy5vcHRpb25zLnZhbHVlcy5sZW5ndGggOiB0aGlzLmNvbmZpZy5idWNrZXRMaW1pdDtcbiAgICAgICAgICB0aGlzLmNvbmZpZy5idWNrZXRIZWlnaHQgPSAoIHRoaXMuY29uZmlnLmJ1Y2tldExpbWl0ICogMzAuNSApO1xuICAgICAgICAgIHRoaXMuY29uZmlnLmhlaWdodCA9IHRoaXMuY29uZmlnLmJ1Y2tldEhlaWdodCArIHRoaXMuZG9tLm92ZXJoZWFkO1xuICAgICAgICAgIHRoaXMuZG9tLnNldEhlaWdodCggK3RoaXMuY29uZmlnLmhlaWdodCwgdGhpcy5kb20ub3ZlcmhlYWQgKTtcbiAgICAgICAgICB0aGlzLmxvZy5pbmZvKCBgc2V0SGVpZ2h0IHdpdGggY29uZmlnLmJ1Y2tldExpbWl0OiR7IHRoaXMuY29uZmlnLmJ1Y2tldExpbWl0IH0gLSBvdmVyaGVhZDokeyB0aGlzLmRvbS5vdmVyaGVhZCB9YCApO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB0aGlzLmxvZy5pbmZvKCBgc2V0SGVpZ2h0IHdpdGggZGVmYXVsdEhlaWdodDokeyB0aGlzLmRvbS5oZWlnaHQuZGVmYXVsdCB9IC0gb3ZlcmhlYWQ6JHsgdGhpcy5kb20ub3ZlcmhlYWQgfWAgKTtcbiAgICAgICAgICB0aGlzLmRvbS5zZXRIZWlnaHQoIHRoaXMuZG9tLmhlaWdodC5kZWZhdWx0LCB0aGlzLmRvbS5vdmVyaGVhZCApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9XG5cbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgYmxvY2sgY2VydGFpbiBvcHRpb25zIGZyb20gYmVpbmcgYXZhaWxhYmxlXG4gICAqIEBwYXJhbSBidWNrZXRcbiAgICogQHBhcmFtIGlkc1xuICAgKi9cbiAgcHJpdmF0ZSBfYmxvY2tCdWNrZXRPcHRpb25zKCBidWNrZXQ6IHN0cmluZywgaWRzOiBhbnlbXSApe1xuICAgIGlmKCBbICdhc3NpZ24nLCAnb3B0aW9uJywgJ2JvdGgnIF0uaW5jbHVkZXMoIGJ1Y2tldCApICl7XG4gICAgICBjb25zdCBtYXAgPSBBcnJheU1hcFNldHRlciggdGhpcy5jb25maWcub3B0aW9ucy52YWx1ZXMsICd2YWx1ZScgKTtcbiAgICAgIGlkcy5tYXAoICggaWQgKSA9PiB7XG4gICAgICAgIGlmKCBpZCBpbiBtYXAgKXtcbiAgICAgICAgICBpZiggYnVja2V0ID09PSAnYXNzaWduJyApe1xuICAgICAgICAgICAgdGhpcy5jb25maWcub3B0aW9ucy52YWx1ZXNbIG1hcFsgaWQgXSBdLmFzc2lnbkJsb2NrID0gdHJ1ZTtcbiAgICAgICAgICB9ZWxzZSBpZiggYnVja2V0ID09PSAnb3B0aW9uJyApe1xuICAgICAgICAgICAgdGhpcy5jb25maWcub3B0aW9ucy52YWx1ZXNbIG1hcFsgaWQgXSBdLm9wdGlvbkJsb2NrID0gdHJ1ZTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLm9wdGlvbnMudmFsdWVzWyBtYXBbIGlkIF0gXS5hc3NpZ25CbG9jayA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5vcHRpb25zLnZhbHVlc1sgbWFwWyBpZCBdIF0ub3B0aW9uQmxvY2sgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgd2lsbCB1bi1ibG9jayBjZXJ0YWluIG9wdGlvbnMgZnJvbSBiZWluZyBhdmFpbGFibGVcbiAgICogQHBhcmFtIGJ1Y2tldFxuICAgKiBAcGFyYW0gaWRzXG4gICAqL1xuICBwcml2YXRlIF91bmJsb2NrQnVja2V0T3B0aW9ucyggYnVja2V0OiBzdHJpbmcsIGlkczogYW55W10gKXtcbiAgICBpZiggWyAnYXNzaWduJywgJ29wdGlvbicsICdib3RoJyBdLmluY2x1ZGVzKCBidWNrZXQgKSApe1xuICAgICAgY29uc3QgbWFwID0gQXJyYXlNYXBTZXR0ZXIoIHRoaXMuY29uZmlnLm9wdGlvbnMudmFsdWVzLCAndmFsdWUnICk7XG4gICAgICBpZHMubWFwKCAoIGlkICkgPT4ge1xuICAgICAgICBpZiggaWQgaW4gbWFwICl7XG4gICAgICAgICAgaWYoIGJ1Y2tldCA9PT0gJ2Fzc2lnbicgKXtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLm9wdGlvbnMudmFsdWVzWyBtYXBbIGlkIF0gXS5hc3NpZ25CbG9jayA9IGZhbHNlO1xuICAgICAgICAgIH1lbHNlIGlmKCBidWNrZXQgPT09ICdvcHRpb24nICl7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5vcHRpb25zLnZhbHVlc1sgbWFwWyBpZCBdIF0ub3B0aW9uQmxvY2sgPSBmYWxzZTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLm9wdGlvbnMudmFsdWVzWyBtYXBbIGlkIF0gXS5hc3NpZ25CbG9jayA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5jb25maWcub3B0aW9ucy52YWx1ZXNbIG1hcFsgaWQgXSBdLm9wdGlvbkJsb2NrID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogQWxsb3cgb3RoZXIgbW9kdWxlcyB0byB0cmlnZ2VyIGNlcnRhaW4gZnVuY3Rpb25hbGl0eVxuICAgKiBAcGFyYW0gb3B0aW9uXG4gICAqIEBwYXJhbSBldmVudFxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0SG9va3MoKXtcbiAgICB0aGlzLmNvbmZpZy5hc3NpZ24gPSAoIG9wdGlvbnM6IFNpZGVCeVNpZGVPcHRpb25JbnRlcmZhY2VbXSwgY29uZmlybWVkID0gZmFsc2UgKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5fYXNzaWduKCBvcHRpb25zLCBjb25maXJtZWQgKTtcbiAgICB9O1xuXG4gICAgdGhpcy5jb25maWcucmVtb3ZlID0gKCBvcHRpb25zOiBTaWRlQnlTaWRlT3B0aW9uSW50ZXJmYWNlW10sIGNvbmZpcm1lZCA9IGZhbHNlICkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlbW92ZSggb3B0aW9ucywgY29uZmlybWVkICk7XG4gICAgfTtcbiAgICB0aGlzLmNvbmZpZy5yZW1vdmVBbGxPcHRpb25zID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIG9mKCB0aGlzLm9uUmVtb3ZlQWxsT3B0aW9ucygpICk7XG4gICAgfTtcbiAgICB0aGlzLmNvbmZpZy5hZGRBbGxPcHRpb25zID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIG9mKCB0aGlzLm9uQXNzaWduQWxsT3B0aW9ucygpICk7XG4gICAgfTtcbiAgICB0aGlzLmNvbmZpZy5hcHBseUZpbHRlciA9ICggdHlwZSwgZmlsdGVyICkgPT4ge1xuICAgICAgdGhpcy5vbkFwcGx5RmlsdGVyKCB0eXBlLCBmaWx0ZXIgKTtcbiAgICB9O1xuXG4gICAgdGhpcy5jb25maWcuZ2V0QXNzaWduZWQgPSAoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5jb25maWcuYXNzaWduZWQuc2xpY2UoKTtcbiAgICB9O1xuXG4gICAgdGhpcy5jb25maWcuYmxvY2sgPSAoIGJ1Y2tldDogc3RyaW5nLCBpZHM6IGFueVtdICkgPT4ge1xuICAgICAgdGhpcy5fYmxvY2tCdWNrZXRPcHRpb25zKCBidWNrZXQsIGlkcyApO1xuICAgIH07XG4gICAgdGhpcy5jb25maWcudW5ibG9jayA9ICggYnVja2V0OiBzdHJpbmcsIGlkczogYW55W10gKSA9PiB7XG4gICAgICB0aGlzLl91bmJsb2NrQnVja2V0T3B0aW9ucyggYnVja2V0LCBpZHMgKTtcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogSW50ZXJjZXB0IHRoZSB1c2VyIHJpZ2h0IG1vdXNlIGNsaWNrIHRvIHNob3cgYSBjb250ZXh0IG1lbnUgZm9yIHRoaXMgY29tcG9uZW50XG4gICAqIEBwYXJhbSBvcHRpb25cbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuICBwcml2YXRlIF9zZXRDb250ZXh0TWVudSgpe1xuICAgIHRoaXMuZG9tLmNvbnRleHRNZW51LmNvbmZpZyA9IG5ldyBQb3BDb250ZXh0TWVudUNvbmZpZygpO1xuICAgIHRoaXMuZG9tLnNldFN1YnNjcmliZXIoICdjb250ZXh0LW1lbnUnLCB0aGlzLmRvbS5jb250ZXh0TWVudS5jb25maWcuZW1pdHRlci5zdWJzY3JpYmUoICggZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSApID0+IHtcbiAgICAgIHRoaXMubG9nLmV2ZW50KCBgY29udGV4dC1tZW51YCwgZXZlbnQgKTtcbiAgICAgIHRoaXMuZXZlbnRzLmVtaXQoIGV2ZW50ICk7XG4gICAgfSApICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGNvdW50IG9mIGFzc2lnbmVkIG9wdGlvbnNcbiAgICovXG4gIHByaXZhdGUgX2NoZWNrRm9yQXNzaWduZWRPcHRpb25zKCl7XG4gICAgdGhpcy5jb25maWcuYXNzaWduZWQgPSBPYmplY3Qua2V5cyggdGhpcy51aS5hc3NpZ25lZCApO1xuICAgIHRoaXMudWkuYXNzaWduZWRDb3VudCA9IHRoaXMuY29uZmlnLmFzc2lnbmVkLmxlbmd0aDtcbiAgICB0aGlzLnVpLm9wdGlvbnNDb3VudCA9IHRoaXMuY29uZmlnLm9wdGlvbnMudmFsdWVzLmxlbmd0aDtcbiAgICBpZih0aGlzLnVpLmFzc2lnbmVkQ291bnQgPT0gdGhpcy51aS5vcHRpb25zQ291bnQpIHRoaXMudWkub3B0aW9uc0NvdW50ID0gMFxuICB9XG5cblxuICAvKipcbiAgICogRmlsdGVyIGFzc2lnbmVkIG9wdGlvbnNcbiAgICogQHBhcmFtIGZpbHRlclxuICAgKi9cbiAgcHJpdmF0ZSBfZmlsdGVyQXNzaWduZWRPcHRpb25zKCBmaWx0ZXI6IHN0cmluZyApe1xuXG4gICAgdGhpcy5jb25maWcub3B0aW9ucy52YWx1ZXMubWFwKCBvcHRpb24gPT4ge1xuICAgICAgb3B0aW9uLmFzc2lnbmVkRmlsdGVyID0gIU9iamVjdENvbnRhaW5zVGFnU2VhcmNoKCBvcHRpb24sIGZpbHRlciApO1xuICAgIH0gKTtcblxuXG4gIH1cblxuXG4gIC8qKlxuICAgKiBGaWx0ZXIgdW4tYXNzaWduZWQgb3B0aW9uc1xuICAgKiBAcGFyYW0gZmlsdGVyXG4gICAqL1xuICBwcml2YXRlIF9maWx0ZXJBdmFpbGFibGVPcHRpb25zKCBmaWx0ZXI6IHN0cmluZyApe1xuICAgIHRoaXMuY29uZmlnLm9wdGlvbnMudmFsdWVzLm1hcCggb3B0aW9uID0+IHtcbiAgICAgIG9wdGlvbi5vcHRpb25GaWx0ZXIgPSAhT2JqZWN0Q29udGFpbnNUYWdTZWFyY2goIG9wdGlvbiwgZmlsdGVyICk7XG4gICAgfSApO1xuICB9XG5cblxuICAvKipcbiAgICogU2V0IHRoZSBpbnRpYWwgc3RhdGUgb2YgdGhlIGFzc2lnbmVkIG9wdGlvbnNcbiAgICovXG4gIHByaXZhdGUgX3RyYWNrQXNzaWduZWRPcHRpb25zKCl7XG4gICAgdGhpcy51aS5hc3NpZ25lZCA9IHt9O1xuICAgIHRoaXMuY29uZmlnLmFzc2lnbmVkLm1hcCggb3B0aW9uSUQgPT4ge1xuICAgICAgdGhpcy51aS5hc3NpZ25lZFsgb3B0aW9uSUQgXSA9IDE7XG4gICAgfSApO1xuICB9XG5cblxufVxuIl19