import { __awaiter } from "tslib";
import { Component, ViewChild, ViewEncapsulation, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { PopHref, PopPipe, PopTemplate } from '../../../pop-common.model';
import { PopBaseService } from '../../../services/pop-base.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopDomService } from '../../../services/pop-dom.service';
import { ParseLinkUrl } from '../../entity/pop-entity-utility';
import { DynamicSort, IsArray, IsDefined, IsNumber, IsObject, IsObjectThrowError, IsString, IsUndefined, ObjectContainsTagSearch, SetSiteVar, Sleep } from '../../../pop-common-utility';
import { PopTableDialogComponent } from './pop-table-dialog/pop-table-dialog.component';
import { PopPipeService } from "../../../services/pop-pipe.service";
export class PopTableComponent extends PopExtendComponent {
    /**
     * @param el
     * @param cdr
     * @param _baseRepo
     * @param _dialogRepo
     * @param _domRepo
     * @param _routerRepo
     * @param _pipeRepo
     */
    constructor(el, cdr, _baseRepo, _dialogRepo, _domRepo, _routerRepo, _pipeRepo) {
        super();
        this.el = el;
        this.cdr = cdr;
        this._baseRepo = _baseRepo;
        this._dialogRepo = _dialogRepo;
        this._domRepo = _domRepo;
        this._routerRepo = _routerRepo;
        this._pipeRepo = _pipeRepo;
        this.name = 'PopTableComponent';
        this.srv = {
            base: undefined,
            dialog: undefined,
            router: undefined,
            pipe: undefined,
        };
        this.asset = {
            data: undefined,
            filter: {
                column: {},
                predicate: undefined,
                search: undefined
            }
        };
        /**
         * Configure the specifics of this component
         */
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                yield Promise.all([
                    this._setInitialConfig(),
                    this._setHeight(),
                    this._updateButtonControl(),
                    this._attachPaginator(),
                    this._handleConfigEvents(),
                    this._setConfigHooks(),
                    this._initSearchFilter(),
                    this._configureTable() // Prep the table for display.
                ]);
                return resolve(true);
            }));
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this._setFilterPredicate(this.dom.session.searchValue); // Set up the filter predicates to use with this table
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
     * The table will generate a slew of action and event triggers that need passed up the chain
     * @param name
     * @param event
     */
    onBubbleEvent(name, event) {
        // All selections of table rows should come through here so _update the buttonControls.
        const tableEvent = {
            source: this.name,
            type: 'table',
            name: name,
            data: event,
            metadata: this.config.metadata
        };
        this.log.event(`onBubbleEvent`, tableEvent);
        // We want a copy being emitted not the actual objects.
        this.events.emit(JSON.parse(JSON.stringify(tableEvent)));
    }
    /**
     * This will apply the search value that the user enters behind a debouncer
     * @param searchValue
     * @param col
     */
    onApplySearchValue(searchValue, col) {
        this.dom.setTimeout('apply-search', () => {
            this.asset.filter.search(searchValue, col);
            this.onBubbleEvent('search', searchValue);
        }, 250);
    }
    /**
     * The user can click on a button to edit their preferences for this table in a modal
     */
    onEditTablePreferencesClick() {
        // Get a copy of the current options.
        const searchColumns = this.config.searchColumns;
        const options = JSON.parse(JSON.stringify(this.config.options));
        // Defaults and allowables should be set by the coder but if not they will use the TableOptionsConfig defaults.
        // But we still need to set the current options.
        options.currentOptions = {
            columnDefinitions: this.config.columnDefinitions,
            headerDisplay: this.config.headerDisplay,
            headerSticky: this.config.headerSticky,
            paginator: this.config.paginator,
            search: this.config.search,
            searchColumns: this.config.searchColumns,
            sort: this.config.sort,
        };
        // If the coder didn't pass into options the available columns then get a list of all possible columns from the data.
        if (!options.columns.length && this.asset.data && this.asset.data[0]) {
            for (const col in this.asset.data[0]) {
                if (!this.asset.data[0].hasOwnProperty(col))
                    continue;
                if (IsString(this.asset.data[0][col]) || IsNumber(this.asset.data[0][col])) {
                    options.columns.push(col);
                }
            }
        }
        this.onBubbleEvent('options_open', options);
        const dialogRef = this.srv.dialog.open(PopTableDialogComponent, {
            data: { options: options }
        });
        dialogRef.afterClosed().subscribe(dialog => {
            if (dialog) {
                console.log('here', dialog);
                if (dialog.type === 'save') {
                    this.dom.refreshing();
                    try {
                        this.cdr.detectChanges();
                    }
                    catch (e) {
                    }
                    const newOptions = JSON.parse(JSON.stringify(dialog.options));
                    this.onBubbleEvent('options_save', newOptions);
                    // Build a new config object instead of updating the old one so that Angular's change detection will auto _update the view.
                    // - Certain things (column sort / search) wont auto-_update otherwise.
                    // - Requires the updating of the column defs in the setTimeout.
                    // - Might be an Angular bug: https://github.com/angular/material2/issues/13030
                    this.config.headerDisplay = newOptions.currentOptions.headerDisplay;
                    this.config.headerSticky = newOptions.currentOptions.headerSticky;
                    this.config.paginator = newOptions.currentOptions.paginator;
                    this.config.searchColumns = newOptions.currentOptions.searchColumns;
                    this.config.sort = newOptions.currentOptions.sort;
                    this.config.updateColumnDefinitions(newOptions.currentOptions.columnDefinitions);
                    if (searchColumns !== this.config.searchColumns)
                        this._setFilterPredicate();
                    try {
                        this.cdr.detectChanges();
                    }
                    catch (e) {
                    }
                    this._resetTable();
                }
                else if (dialog.type === 'reset') {
                    this.dom.refreshing();
                    try {
                        this.cdr.detectChanges();
                    }
                    catch (e) {
                    }
                    // Build a new config object instead of updating the old one so that Angular's change detection will auto _update the view.
                    // - Certain things (column sort / search) wont auto-_update otherwise.
                    // - Requires the updating of the column defs in the setTimeout.
                    // - Might be an Angular bug: https://github.com/angular/material2/issues/13030
                    this.onBubbleEvent('options_reset', dialog.options);
                    this.config.headerDisplay = this.config.options.defaultOptions.headerDisplay;
                    this.config.headerSticky = this.config.options.defaultOptions.headerSticky;
                    // this.config.paginator = this.config.options.defaultOptions.paginator;
                    this.config.searchColumns = this.config.options.defaultOptions.searchColumns;
                    this.config.sort = this.config.options.defaultOptions.sort;
                    this.config.dealWithAngularChangeDetectionFailure = false;
                    const columnDefinitions = JSON.parse(JSON.stringify(dialog.options.defaultOptions.columnDefinitions));
                    this.config.updateColumnDefinitions(columnDefinitions);
                    if (searchColumns !== this.config.searchColumns)
                        this._setFilterPredicate();
                    try {
                        this.cdr.detectChanges();
                    }
                    catch (e) {
                    }
                    this._resetTable();
                }
                else if (dialog.type === 'cancel') {
                    this.onBubbleEvent('options_cancel', {});
                }
            }
            else {
                this.onBubbleEvent('options_cancel', {});
            }
        });
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
    /**
     * Setup an intial config for this component here
     * @private
     */
    _setInitialConfig() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            // Ensure config
            this.config = IsObjectThrowError(this.config, true, `${this.name}:configure: - this.config`) ? this.config : null;
            // Set a data container to hold raw data
            this.asset.data = [];
            if (IsDefined(this.config.id))
                this.id = this.config.id;
            return resolve(true);
        }));
    }
    /**
     * Handle table events
     * @param event
     */
    _onTableEvent(event) {
        let goToUrl;
        let routeApp;
        if (event.type === 'table') {
            switch (event.name) {
                case 'columnStandardClick':
                    // If global route was set then let the table handle the routing else emit the event.
                    if (this.config.route) {
                        goToUrl = this._parseGoToUrl(this.config.route, event.data.row);
                        routeApp = String(goToUrl).split('/');
                        if (routeApp[1] && routeApp[1] === PopHref) {
                            // Since we are in the same app then use Angular to route.
                            const route = routeApp.slice(2).join('/');
                            this.srv.router.navigate([route]).catch((e) => {
                                PopTemplate.error({ message: `Invalid Client Route: ${route}`, code: 500 });
                                console.log(e);
                            });
                        }
                        else {
                            // do a hard reload if we aren't.
                            SetSiteVar('redirect', goToUrl);
                            this.srv.base.redirect();
                        }
                    }
                    else {
                        this.onBubbleEvent('row_clicked', event.data.row);
                    }
                    break;
                case 'columnRouteClick':
                    if (this.config.linkBehavior === 'route') {
                        goToUrl = this._parseGoToUrl(this.config.columnDefinitions[event.data.name].route, event.data.row);
                        if (!goToUrl)
                            return false;
                        routeApp = String(goToUrl).split('/');
                        if (routeApp[1] && routeApp[1] === PopHref) {
                            const route = routeApp.slice(2).join('/');
                            this.srv.router.navigate([route]).catch((e) => {
                                console.log(e);
                                PopTemplate.error({ message: `Invalid Client Route: ${route}`, code: 500 });
                            });
                        }
                        else {
                            SetSiteVar('redirect', goToUrl);
                            this.srv.base.redirect();
                        }
                    }
                    else {
                        this.onBubbleEvent(event.name, event.data);
                    }
                    break;
                case 'columnLinkClick':
                    this.onBubbleEvent('columnLinkClick', {
                        link: this.config.columnDefinitions[event.data.name].link,
                        row: event.data.row,
                        col: event.data.name
                    });
                    break;
                case 'filter':
                    this.onApplySearchValue(event.data.filter, event.data.col);
                    break;
                default:
                    this.onBubbleEvent(event.name, event.data);
                    break;
            }
        }
        if (event.type === 'context_menu') {
            this.events.emit(event);
        }
    }
    /**
     * This determine what the height of the table should be
     * @param height
     */
    _setHeight(height = null) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.dom.overhead = 0;
            if (this.config) {
                if (height)
                    this.config.height = height;
                if (this.config.height) {
                    if (this.config.options || this.config.buttons.length || (this.config.search && !this.config.searchColumns))
                        this.dom.overhead = this.dom.overhead + 55;
                    if (this.config.paginator)
                        this.dom.overhead = this.dom.overhead + 65;
                    this.dom.setHeight(this.config.height, this.dom.overhead);
                    return resolve(true);
                }
            }
            else {
                this.dom.setHeight(0, 0);
                this.dom.height.outer = null;
                this.dom.height.inner = null;
            }
            return resolve(false);
        }));
    }
    /**
     * The user can choose from a global search or a column search
     */
    _setFilterPredicate(searchValue = null) {
        if (this.config.searchColumns) {
            this.config.matData.filter = '';
            this.config.matData.filterPredicate = this.asset.filter.predicate.column;
        }
        else {
            this.config.matData.filterPredicate = this.asset.filter.predicate.tag;
            this.onApplySearchValue((searchValue ? searchValue : ''), '');
        }
    }
    _updateData(data) {
        this.dom.refreshing();
        if (!this.config.matData.paginator)
            this.config.matData.paginator = this.matPaginator;
        if (IsObject(this.config.columnDefinitions, true)) {
            if (IsArray(data)) {
                this.asset.data = data;
                this.config.matData.data = this.asset.data.slice();
                if (!this.config.searchColumns && this.dom.session.searchValue) {
                    this.asset.filter.search(this.dom.session.searchValue, '');
                }
                this._setTableLayout();
            }
        }
        else if (IsArray(data, true)) {
            this.config.data = data;
            this.onBubbleEvent('column_definitions', data[0]);
        }
    }
    _resetTable(data = null) {
        this.log.info(`_resetTable`);
        this.dom.setTimeout(`reset-table`, () => __awaiter(this, void 0, void 0, function* () {
            this.dom.refreshing();
            yield this._configureTable();
            yield this._updateButtonControl();
            if (Array.isArray(data)) {
                this._updateData(data);
            }
            else {
                this.dom.setTimeout(`view-ready`, () => __awaiter(this, void 0, void 0, function* () {
                    this.dom.ready();
                }), 200);
            }
        }), 0);
    }
    /**
     * This will bring in the table config,user preferences,data set and tie it all together
     * The structure of the data set is important to what the table will render
     */
    _configureTable() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.log.info(`_configureTable`);
            this.config.matData.data.length = 0;
            const templates = {};
            const visible = [];
            let visibleOrdered = [];
            let validDefinition = false;
            if (!IsObject(this.config.columnDefinitions, true)) {
                this.dom.state.hasColumnDefinitions = true;
                this.config.columnDefinitions = {
                    description: { name: "description", label: "Description", visible: true, sort: 3 },
                    id: { name: "id", label: "ID", checkbox: { visible: true, sort: 0 }, visible: true, sort: 999 },
                    name: { name: "name", label: "Name", visible: true, sort: 2 }
                };
            }
            else {
                this.dom.state.hasColumnDefinitions = IsObject(this.config.columnDefinitions, true);
            }
            for (const col in this.config.columnDefinitions) {
                if (!this.config.columnDefinitions.hasOwnProperty(col))
                    continue;
                // Marking this as true so that the auto config does not run.
                validDefinition = true;
                // Figure out the template to use.
                let template = 'Standard';
                if (this.config.columnDefinitions[col].route) {
                    if (this.config.columnDefinitions[col].icon) {
                        template = this.config.columnDefinitions[col].helper ? 'RouteIconHelper' : 'RouteIcon';
                    }
                    else {
                        template = this.config.columnDefinitions[col].helper ? 'RouteHelper' : 'Route';
                    }
                }
                else if (this.config.columnDefinitions[col].link) {
                    if (this.config.columnDefinitions[col].icon) {
                        template = this.config.columnDefinitions[col].helper ? 'LinkIconHelper' : 'LinkIcon';
                    }
                    else {
                        template = this.config.columnDefinitions[col].helper ? 'LinkHelper' : 'Link';
                    }
                }
                else if (this.config.columnDefinitions[col].icon) {
                    template = this.config.columnDefinitions[col].helper ? 'IconHelper' : 'Icon';
                }
                else if (this.config.columnDefinitions[col].helper) {
                    template = 'StandardHelper';
                }
                // Populate the template with anything it may need.
                templates[col] = {
                    template: template,
                    name: col,
                    display: this.srv.pipe.label.transform(col, this.config.columnDefinitions[col]),
                    icon: this.config.columnDefinitions[col].icon,
                    helper: {
                        text: (!this.config.columnDefinitions[col].helper ? '' : (typeof this.config.columnDefinitions[col].helper === 'string' ? this.config.columnDefinitions[col].helper : this.config.columnDefinitions[col].helper.text)),
                        position: (!this.config.columnDefinitions[col].helper ? 'left' : (typeof this.config.columnDefinitions[col].helper === 'string' ? 'left' : this.config.columnDefinitions[col].helper.position)),
                    },
                    sticky: !this.config.columnDefinitions[col].sticky ? false : this.config.columnDefinitions[col].sticky
                };
                // If Visible
                if (this.config.columnDefinitions[col].visible)
                    visible.push({
                        name: col,
                        sort: this.config.columnDefinitions[col].sort
                    });
                // Check if this column should also have a checkbox.
                if (this.config.columnDefinitions[col].checkbox) {
                    const cbName = 'checkbox_' + col;
                    templates[cbName] = {
                        template: 'Checkbox',
                        name: col,
                        helper: { text: '', position: 'left' },
                        sticky: !this.config.columnDefinitions[col].checkbox.sticky ? false : this.config.columnDefinitions[col].checkbox.sticky
                    };
                    if (this.config.columnDefinitions[col].checkbox.visible) {
                        visible.push({
                            name: cbName,
                            sort: this.config.columnDefinitions[col].checkbox.sort ? this.config.columnDefinitions[col].checkbox.sort : 0
                        });
                    }
                }
            }
            // Put the visible columns are in the correct order.
            visible.sort(DynamicSort('sort'));
            for (const i in visible)
                visibleOrdered.push(visible[i].name);
            // If no column configs were passed in then use the data set and just display all the columns.
            if (!validDefinition && this.asset.data && this.asset.data[0]) {
                for (const col in this.asset.data[0]) {
                    if (!this.asset.data[0].hasOwnProperty(col))
                        continue;
                    visibleOrdered.push(col);
                    templates[col] = {
                        template: 'Standard',
                        name: col,
                        display: PopPipe.label.transform(col)
                    };
                }
            }
            // Just in case, remove any columns in the visibleOrdered that do not exist in the data set.
            if (Array.isArray(this.asset.data) && this.asset.data.length) {
                const availableFields = Object.keys(this.asset.data[0]);
                visibleOrdered = visibleOrdered.filter((col) => {
                    return (col.includes('checkbox_') ? true : availableFields.includes(col));
                });
            }
            // Set the config.
            this.config.columnConfig = { templates: templates, visible: visibleOrdered };
            // Clear previous selections.
            if (this.config.selection)
                this.config.selection.clear();
            // Set the data.
            if (IsArray(this.config.data, false)) {
                this._updateData(this.config.data);
            }
            setTimeout(() => {
                this.dom.ready();
                this.onBubbleEvent('ready', 1);
            });
            return resolve(true);
        }));
    }
    _setTablePagination() {
        if (this.config && this.config.height) {
            let viewableRows;
            if (this.config.paginator && this.matPaginator && IsArray(this.asset.data, false)) {
                this.dom.state.hasPagination = this.asset.data.length > 50;
                // viewableRows = this.asset.data ? this.asset.data.length : 0;
                // if( this.dom.state.hasPagination ){
                // viewableRows = parseInt(String(( ( this.dom.height.inner - 25 ) / 50 )), 10);
                viewableRows = 50;
                // if( this.config.headerSticky ) viewableRows--;
                // }
                setTimeout(() => {
                    this.config.matData.paginator.pageSize = 50;
                    this.config.matData.paginator.pageSizeOptions = [50];
                    this.config.matData.paginator.pageIndex = 0;
                    this.config.matData.paginator.page.next({ pageIndex: 0, pageSize: 50, length: 50 });
                });
            }
        }
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    _updateColumnDefinitions(definitions) {
        this.config.columnDefinitions = definitions;
        this._configureTable().then(() => true);
    }
    /**
     * This function will attach and configure a paginator if it is needed
     */
    _attachPaginator() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (this.matPaginator) {
                this.matPaginator.hidePageSize = true;
                if (this.config && this.config.matData)
                    this.config.matData.paginator = this.matPaginator;
            }
            return resolve(false);
        }));
    }
    /**
     * This will manage the button interface
     * Buttons can have a dependency on what the user has currently selected(list items have a checkbox selection)
     */
    _updateButtonControl() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            // Initialize the ui button control
            if (IsUndefined(this.ui.buttonControl)) {
                this.ui.buttonControl = {
                    requireSelected: false,
                    requireOneSelected: false,
                    requireNoneSelected: true
                };
            }
            if (this.config.selection) {
                const selectCount = this.config.selection.selected.length;
                this.ui.buttonControl.requireSelected = +selectCount > 0;
                this.ui.buttonControl.requireOneSelected = +selectCount === 1;
                this.ui.buttonControl.requireNoneSelected = +selectCount === 0;
            }
            else {
                this.ui.buttonControl.requireSelected = false;
                this.ui.buttonControl.requireOneSelected = false;
                this.ui.buttonControl.requireNoneSelected = true;
            }
            return resolve(true);
        }));
    }
    /**
     * The table config has its own event emitter that need to be handled
     */
    _handleConfigEvents() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (!this.config.onEvent)
                this.config.onEvent = new Subject();
            this.dom.setSubscriber('config-events', this.config.onEvent.subscribe((event) => {
                this._updateButtonControl().then(() => true);
                this._onTableEvent(event);
            }));
            return resolve(false);
        }));
    }
    /**
     * This will allow an outside component to trigger specific functionality through the config of this component
     */
    _setConfigHooks() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.config.setHeight = (height) => {
                this._setTableHeight(height);
            };
            this.config.clearSelected = () => {
                return new Promise((clearResolver) => __awaiter(this, void 0, void 0, function* () {
                    this.config.selection.clear();
                    yield Sleep(250);
                    this._updateButtonControl().then(() => {
                        return clearResolver(true);
                    });
                }));
            };
            this.config.updateColumnDefinitions = (definitions) => {
                this._updateColumnDefinitions(definitions);
            };
            this.config.updateData = (data) => {
                this._updateData(data);
            };
            this.config.setLayout = (height) => {
                this._setTableLayout(height);
            };
            this.config.reset = (data = null) => {
                this._resetTable(data);
            };
            this.config.applyFilter = (searchValue, col) => {
                if (!this.config.searchColumns) {
                    this.onApplySearchValue(searchValue, col);
                }
            };
            return resolve(true);
        }));
    }
    /**
     * Initialize and manage the filter predicates that this table will use
     */
    _initSearchFilter() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.dom.session.searchValue = this.dom.session.searchValue ? this.dom.session.searchValue : (this.config.searchValue ? this.config.searchValue : '');
            this.asset.filter.predicate = {
                default: this.config.matData.filterPredicate,
                column: (data, filter) => {
                    let exists = true;
                    for (const i in this.asset.filter.column) {
                        if (data[i] && data[i].toLowerCase) {
                            exists = data[i].toLowerCase().includes(this.asset.filter.column[i]);
                        }
                        else {
                            // Cast numbers to strings.
                            exists = String(data[i]).includes(this.asset.filter.column[i]);
                        }
                        if (!exists)
                            return false;
                    }
                    return true;
                },
                tag: (data, filter) => {
                    return ObjectContainsTagSearch(data, filter);
                }
            };
            this.asset.filter.search = (searchValue, col) => {
                searchValue = searchValue.trim().toLocaleLowerCase();
                if (!col) {
                    this.config.matData.filter = searchValue;
                }
                else {
                    if (searchValue) {
                        // Make sure that this column is in the list.
                        this.asset.filter.column[col] = searchValue;
                    }
                    else if (this.asset.filter.column[col]) {
                        // Since filter is empty this column shouldn't be considered.
                        delete (this.asset.filter.column[col]);
                    }
                    this.config.matData.filter = searchValue;
                }
                if (this.config.paginator && this.config.matData.paginator)
                    this.config.matData.paginator.firstPage();
            };
            return resolve(true);
        }));
    }
    _setTableLayout(height = null) {
        this.dom.setTimeout('table-layout', () => {
            this.dom.loading();
            if (this.config && IsArray(this.asset.data, false)) {
                this._setHeight(height).then(() => {
                });
                setTimeout(() => {
                    this.dom.ready();
                    this._setTablePagination();
                }, 0);
            }
        }, 0);
    }
    _setTableHeight(height = null) {
        if (this.config && IsArray(this.asset.data, false)) {
            this._setHeight(height);
            setTimeout(() => {
                this.dom.ready();
                this._setTablePagination();
            }, 0);
        }
    }
    _parseGoToUrl(goToUrl = '', row) {
        if (!goToUrl)
            return goToUrl;
        // Check for alias
        if (goToUrl.includes('alias:')) {
            const start = goToUrl.indexOf('alias:');
            const end = goToUrl.indexOf('/', start) !== -1 ? goToUrl.indexOf('/', start) : goToUrl.length;
            const aliasString = goToUrl.substring(start, end);
            const aliasArray = aliasString.split(':');
            aliasArray.shift();
            const alias = PopPipe.label.getAlias(aliasArray.shift());
            goToUrl = goToUrl.replace(aliasString, alias);
        }
        // Check for other id.
        if (goToUrl.includes(':') && row) {
            goToUrl = ParseLinkUrl(goToUrl, row);
        }
        return goToUrl;
    }
}
PopTableComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-table',
                template: "<div class=\"pop-table-container\" [style.height.px]=dom.height.outer>\n  <div class=\"pt-dark-text pop-table-control\" *ngIf=\"config?.options || config?.buttons.length || ( config?.search && !config?.searchColumns )\">\n    <div class=\"search-control\">\n      <div *ngIf=\"config.search && !config.searchColumns\">\n        <mat-form-field class=\"sw-search\" appearance=\"outline\" color=\"accent\">\n          <a matPrefix>\n            <mat-icon>search</mat-icon>\n          </a>\n          <mat-icon class=\"sw-pointer\" matSuffix (click)=\"onApplySearchValue('',''); dom.session.searchValue = '';\">\n            close\n          </mat-icon>\n          <input matInput [(ngModel)]=\"dom.session.searchValue\" (keyup)=\"onApplySearchValue($event.target.value, '')\"\n                 placeholder=\"Search\">\n        </mat-form-field>\n      </div>\n    </div>\n    <div *ngIf=\"config.buttons.length && ui.buttonControl\">\n      <div class=\"pop-table-button-control\">\n        <div *ngFor=\"let button of config.buttons; last as isLast\">\n          <div [ngClass]=\"{'last-button': isLast && !config.options}\">\n            <button mat-raised-button class=\"pop-table-buttons\"\n                    (click)=\"onBubbleEvent((button.id ? button.id : button.name), config.selection?.selected)\" [ngClass]=\"{'sw-hidden': (\n                ( button.requireSelected && !ui.buttonControl.requireSelected ) ||\n                ( button.requireOneSelected && !ui.buttonControl.requireOneSelected ) ||\n                ( button.requireNoneSelected && !ui.buttonControl.requireNoneSelected )\n              )}\">\n              {{button.name}}\n            </button>\n          </div>\n        </div>\n        <button mat-raised-button *ngIf=\"config.options\" (click)=\"onEditTablePreferencesClick()\" class=\"sw-icon-button\">\n          <span class=\"sw-pop-icon\">Q</span>\n        </button>\n      </div>\n    </div>\n  </div>\n  <div class=\"pop-table-loader\">\n    <mat-progress-bar *ngIf=\"config?.loading\" mode=\"indeterminate\"></mat-progress-bar>\n  </div>\n  <div #wrapper class=\"pop-table-wrapper\" [style.maxHeight.px]=null [style.minHeight.px]=dom.height.inner\n       [ngClass]=\"{'pop-table-wrapper-pagination': this.dom.state.hasPagination, 'pop-table-pagination-inactive pop-table-wrapper-scroll': !this.dom.state.hasPagination}\">\n    <!-- Needs some design process -->\n    <h1 *ngIf=\"!dom.state['hasColumnDefinitions']\">No Data Available</h1>\n    <!--  -->\n    <lib-pop-table-view *ngIf=\"dom.state.loaded && !dom.state.refresh\" [config]=config></lib-pop-table-view>\n  </div>\n  <div class=\"pop-table-footer\" class=\"sw-hidden\"[ngClass]=\"{'sw-hidden': true || !config?.paginator}\">\n    <div >\n      <mat-paginator></mat-paginator>\n    </div>\n  </div>\n</div>\n",
                encapsulation: ViewEncapsulation.Emulated,
                styles: [".pop-table-container{position:relative;display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;margin:0 5px}.pop-table-container .pop-table-control{display:flex;justify-content:space-between;height:45px}.pop-table-container .pop-table-control .search-control{flex-grow:0.5}.pop-table-container .pop-table-control .pop-table-button-control{display:flex;justify-content:flex-end;align-items:flex-end;flex-grow:1;margin-bottom:7px;margin-right:-5px}.pop-table-container .pop-table-control .pop-table-button-control button{font-size:14px;margin-top:1px;margin-right:10px!important;line-height:20px!important;height:34px}.pop-table-container .pop-table-wrapper{display:flex;flex-direction:column;overflow-x:auto}.pop-table-container .pop-table-footer{position:absolute;display:flex;flex-direction:column;left:0;right:0;bottom:0;height:40px;border:1px solid var(--background-border);background:var(--background-item-menu);border-bottom-left-radius:var(--radius-xs);border-bottom-right-radius:var(--radius-xs)}.pop-table-loader{position:relative;top:-1px;height:1px;overflow:hidden;clear:both;z-index:1}.pop-table-wrapper-pagination,.pop-table-wrapper-scroll{overflow-y:auto!important}:host ::ng-deep .pop-table-wrapper-scroll mat-paginator .mat-icon-button{opacity:.1;pointer-events:none}:host ::ng-deep .search-control .mat-form-field .mat-form-field-infix{width:200px}::ng-deep td.mat-cell,::ng-deep th.mat-header-cell{font-size:14px;height:0!important;padding:0}::ng-deep .mat-header-row{height:40px!important}::ng-deep .mat-header-row,::ng-deep .mat-row{height:40px!important}"]
            },] }
];
PopTableComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef },
    { type: PopBaseService },
    { type: MatDialog },
    { type: PopDomService },
    { type: Router },
    { type: PopPipeService }
];
PopTableComponent.propDecorators = {
    config: [{ type: Input }],
    wrapper: [{ type: ViewChild, args: ['wrapper', { static: true },] }],
    footer: [{ type: ViewChild, args: ['footer',] }],
    matPaginator: [{ type: ViewChild, args: [MatPaginator, { static: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXRhYmxlLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLXRhYmxlL3BvcC10YWJsZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBUyxTQUFTLEVBQUUsU0FBUyxFQUFhLGlCQUFpQixFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN4SCxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXBDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUN6RCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sRUFBZ0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQWtCLE1BQU0sMkJBQTJCLENBQUM7QUFDeEgsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG9DQUFvQyxDQUFDO0FBQ2xFLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNuRCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDakUsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBQ2hFLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUM3RCxPQUFPLEVBQ0wsV0FBVyxFQUNYLE9BQU8sRUFDUCxTQUFTLEVBQ1QsUUFBUSxFQUNSLFFBQVEsRUFDUixrQkFBa0IsRUFDbEIsUUFBUSxFQUNSLFdBQVcsRUFDWCx1QkFBdUIsRUFDdkIsVUFBVSxFQUNWLEtBQUssRUFDTixNQUFNLDZCQUE2QixDQUFDO0FBQ3JDLE9BQU8sRUFBQyx1QkFBdUIs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U0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxlQUFlO2dCQUN6Qixrd0ZBQXlDO2dCQUV6QyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsUUFBUTs7YUFDMUM7OztZQWxDbUUsVUFBVTtZQUFFLGlCQUFpQjtZQU16RixjQUFjO1lBQ2QsU0FBUztZQUdULGFBQWE7WUFGYixNQUFNO1lBa0JOLGNBQWM7OztxQkFVbkIsS0FBSztzQkFDTCxTQUFTLFNBQUMsU0FBUyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQztxQkFDbkMsU0FBUyxTQUFDLFFBQVE7MkJBQ2xCLFNBQVMsU0FBQyxZQUFZLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtPbkluaXQsIENvbXBvbmVudCwgVmlld0NoaWxkLCBPbkRlc3Ryb3ksIFZpZXdFbmNhcHN1bGF0aW9uLCBFbGVtZW50UmVmLCBDaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0lucHV0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q29sdW1uRGVmaW5pdGlvbkludGVyZmFjZSwgVGFibGVDb25maWcsIFRhYmxlT3B0aW9uc0ludGVyZmFjZX0gZnJvbSAnLi9wb3AtdGFibGUubW9kZWwnO1xuaW1wb3J0IHtNYXRQYWdpbmF0b3J9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3BhZ2luYXRvcic7XG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtFbnRpdHksIFBvcEJhc2VFdmVudEludGVyZmFjZSwgUG9wSHJlZiwgUG9wUGlwZSwgUG9wVGVtcGxhdGUsIFNlcnZpY2VJbmplY3Rvcn0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQge1BvcEJhc2VTZXJ2aWNlfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlcy9wb3AtYmFzZS5zZXJ2aWNlJztcbmltcG9ydCB7TWF0RGlhbG9nfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xuaW1wb3J0IHtSb3V0ZXJ9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQge1BvcEV4dGVuZENvbXBvbmVudH0gZnJvbSAnLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHtQb3BEb21TZXJ2aWNlfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlcy9wb3AtZG9tLnNlcnZpY2UnO1xuaW1wb3J0IHtQYXJzZUxpbmtVcmx9IGZyb20gJy4uLy4uL2VudGl0eS9wb3AtZW50aXR5LXV0aWxpdHknO1xuaW1wb3J0IHtcbiAgRHluYW1pY1NvcnQsXG4gIElzQXJyYXksXG4gIElzRGVmaW5lZCxcbiAgSXNOdW1iZXIsXG4gIElzT2JqZWN0LFxuICBJc09iamVjdFRocm93RXJyb3IsXG4gIElzU3RyaW5nLFxuICBJc1VuZGVmaW5lZCxcbiAgT2JqZWN0Q29udGFpbnNUYWdTZWFyY2gsXG4gIFNldFNpdGVWYXIsXG4gIFNsZWVwXG59IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQge1BvcFRhYmxlRGlhbG9nQ29tcG9uZW50fSBmcm9tICcuL3BvcC10YWJsZS1kaWFsb2cvcG9wLXRhYmxlLWRpYWxvZy5jb21wb25lbnQnO1xuaW1wb3J0IHtQb3BQaXBlU2VydmljZX0gZnJvbSBcIi4uLy4uLy4uL3NlcnZpY2VzL3BvcC1waXBlLnNlcnZpY2VcIjtcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLXRhYmxlJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC10YWJsZS5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3BvcC10YWJsZS5jb21wb25lbnQuc2NzcyddLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5FbXVsYXRlZCxcbn0pXG5leHBvcnQgY2xhc3MgUG9wVGFibGVDb21wb25lbnQgZXh0ZW5kcyBQb3BFeHRlbmRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGNvbmZpZzogVGFibGVDb25maWc7XG4gIEBWaWV3Q2hpbGQoJ3dyYXBwZXInLCB7c3RhdGljOiB0cnVlfSkgd3JhcHBlcjogRWxlbWVudFJlZjtcbiAgQFZpZXdDaGlsZCgnZm9vdGVyJykgZm9vdGVyOiBFbGVtZW50UmVmO1xuICBAVmlld0NoaWxkKE1hdFBhZ2luYXRvciwge3N0YXRpYzogdHJ1ZX0pIG1hdFBhZ2luYXRvcjogTWF0UGFnaW5hdG9yO1xuICBwdWJsaWMgbmFtZSA9ICdQb3BUYWJsZUNvbXBvbmVudCc7XG5cbiAgc3J2ID0ge1xuICAgIGJhc2U6IDxQb3BCYXNlU2VydmljZT51bmRlZmluZWQsXG4gICAgZGlhbG9nOiA8TWF0RGlhbG9nPnVuZGVmaW5lZCxcbiAgICByb3V0ZXI6IDxSb3V0ZXI+dW5kZWZpbmVkLFxuICAgIHBpcGU6IDxQb3BQaXBlU2VydmljZT51bmRlZmluZWQsXG4gIH07XG5cblxuICBhc3NldCA9IHtcbiAgICBkYXRhOiB1bmRlZmluZWQsXG4gICAgZmlsdGVyOiB7XG4gICAgICBjb2x1bW46IHt9LFxuICAgICAgcHJlZGljYXRlOiB1bmRlZmluZWQsXG4gICAgICBzZWFyY2g6IHVuZGVmaW5lZFxuICAgIH1cbiAgfTtcblxuXG4gIC8qKlxuICAgKiBAcGFyYW0gZWxcbiAgICogQHBhcmFtIGNkclxuICAgKiBAcGFyYW0gX2Jhc2VSZXBvXG4gICAqIEBwYXJhbSBfZGlhbG9nUmVwb1xuICAgKiBAcGFyYW0gX2RvbVJlcG9cbiAgICogQHBhcmFtIF9yb3V0ZXJSZXBvXG4gICAqIEBwYXJhbSBfcGlwZVJlcG9cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwdWJsaWMgY2RyOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBwcm90ZWN0ZWQgX2Jhc2VSZXBvOiBQb3BCYXNlU2VydmljZSxcbiAgICBwcm90ZWN0ZWQgX2RpYWxvZ1JlcG86IE1hdERpYWxvZyxcbiAgICBwcm90ZWN0ZWQgX2RvbVJlcG86IFBvcERvbVNlcnZpY2UsXG4gICAgcHJvdGVjdGVkIF9yb3V0ZXJSZXBvOiBSb3V0ZXIsXG4gICAgcHJvdGVjdGVkIF9waXBlUmVwbzogUG9wUGlwZVNlcnZpY2UsXG4gICkge1xuICAgIHN1cGVyKCk7XG4gICAgLyoqXG4gICAgICogQ29uZmlndXJlIHRoZSBzcGVjaWZpY3Mgb2YgdGhpcyBjb21wb25lbnRcbiAgICAgKi9cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcblxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgdGhpcy5fc2V0SW5pdGlhbENvbmZpZygpLCAvLyBzZXQgZGVmYXVsdCBjb25maWdzXG4gICAgICAgICAgdGhpcy5fc2V0SGVpZ2h0KCksIC8vIERldGVybWluZSB0aGUgaGVpZ2h0IG9mIHRoZSB0YWJsZVxuICAgICAgICAgIHRoaXMuX3VwZGF0ZUJ1dHRvbkNvbnRyb2woKSxcbiAgICAgICAgICB0aGlzLl9hdHRhY2hQYWdpbmF0b3IoKSwgLy8gQXR0YWNoIHRoZSBwYWdpbmF0b3IgdG8gdGhlIGNvbmZpZ1xuICAgICAgICAgIHRoaXMuX2hhbmRsZUNvbmZpZ0V2ZW50cygpLCAvLyAgTWFuYWdlIENvbmZpZyBFdmVudHNcbiAgICAgICAgICB0aGlzLl9zZXRDb25maWdIb29rcygpLCAvLyBhdHRhY2ggaG9va3Mgb24gdG8gdGhlIGNvbmZpZyB0aGF0IGxldCBvdGhlciBjb21wb25lbnRzIHRpZSBpbiB0byB0aGlzIGNvbXBvbmVudFxuICAgICAgICAgIHRoaXMuX2luaXRTZWFyY2hGaWx0ZXIoKSwgLy8gc2V0cyB0aGUgc2VhcmNoIGFiaWxpdGllc1xuICAgICAgICAgIHRoaXMuX2NvbmZpZ3VyZVRhYmxlKCkgLy8gUHJlcCB0aGUgdGFibGUgZm9yIGRpc3BsYXkuXG4gICAgICAgIF0pO1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuZG9tLnByb2NlZWQgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgICAgdGhpcy5fc2V0RmlsdGVyUHJlZGljYXRlKHRoaXMuZG9tLnNlc3Npb24uc2VhcmNoVmFsdWUpOyAvLyBTZXQgdXAgdGhlIGZpbHRlciBwcmVkaWNhdGVzIHRvIHVzZSB3aXRoIHRoaXMgdGFibGVcbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBjb21wb25lbnQgc2hvdWxkIGhhdmUgYSBwdXJwb3NlXG4gICAqL1xuICBuZ09uSW5pdCgpIHtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIHRhYmxlIHdpbGwgZ2VuZXJhdGUgYSBzbGV3IG9mIGFjdGlvbiBhbmQgZXZlbnQgdHJpZ2dlcnMgdGhhdCBuZWVkIHBhc3NlZCB1cCB0aGUgY2hhaW5cbiAgICogQHBhcmFtIG5hbWVcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuICBvbkJ1YmJsZUV2ZW50KG5hbWUsIGV2ZW50KTogdm9pZCB7XG4gICAgLy8gQWxsIHNlbGVjdGlvbnMgb2YgdGFibGUgcm93cyBzaG91bGQgY29tZSB0aHJvdWdoIGhlcmUgc28gX3VwZGF0ZSB0aGUgYnV0dG9uQ29udHJvbHMuXG4gICAgY29uc3QgdGFibGVFdmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlID0ge1xuICAgICAgc291cmNlOiB0aGlzLm5hbWUsXG4gICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIGRhdGE6IGV2ZW50LFxuICAgICAgbWV0YWRhdGE6IHRoaXMuY29uZmlnLm1ldGFkYXRhXG4gICAgfTtcbiAgICB0aGlzLmxvZy5ldmVudChgb25CdWJibGVFdmVudGAsIHRhYmxlRXZlbnQpO1xuICAgIC8vIFdlIHdhbnQgYSBjb3B5IGJlaW5nIGVtaXR0ZWQgbm90IHRoZSBhY3R1YWwgb2JqZWN0cy5cbiAgICB0aGlzLmV2ZW50cy5lbWl0KEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGFibGVFdmVudCkpKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgd2lsbCBhcHBseSB0aGUgc2VhcmNoIHZhbHVlIHRoYXQgdGhlIHVzZXIgZW50ZXJzIGJlaGluZCBhIGRlYm91bmNlclxuICAgKiBAcGFyYW0gc2VhcmNoVmFsdWVcbiAgICogQHBhcmFtIGNvbFxuICAgKi9cbiAgb25BcHBseVNlYXJjaFZhbHVlKHNlYXJjaFZhbHVlOiBzdHJpbmcsIGNvbDogc3RyaW5nKSB7XG4gICAgdGhpcy5kb20uc2V0VGltZW91dCgnYXBwbHktc2VhcmNoJywgKCkgPT4ge1xuICAgICAgdGhpcy5hc3NldC5maWx0ZXIuc2VhcmNoKHNlYXJjaFZhbHVlLCBjb2wpO1xuICAgICAgdGhpcy5vbkJ1YmJsZUV2ZW50KCdzZWFyY2gnLCBzZWFyY2hWYWx1ZSk7XG4gICAgfSwgMjUwKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSB1c2VyIGNhbiBjbGljayBvbiBhIGJ1dHRvbiB0byBlZGl0IHRoZWlyIHByZWZlcmVuY2VzIGZvciB0aGlzIHRhYmxlIGluIGEgbW9kYWxcbiAgICovXG4gIG9uRWRpdFRhYmxlUHJlZmVyZW5jZXNDbGljaygpOiB2b2lkIHtcblxuICAgIC8vIEdldCBhIGNvcHkgb2YgdGhlIGN1cnJlbnQgb3B0aW9ucy5cbiAgICBjb25zdCBzZWFyY2hDb2x1bW5zID0gdGhpcy5jb25maWcuc2VhcmNoQ29sdW1ucztcbiAgICBjb25zdCBvcHRpb25zOiBUYWJsZU9wdGlvbnNJbnRlcmZhY2UgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuY29uZmlnLm9wdGlvbnMpKTtcblxuICAgIC8vIERlZmF1bHRzIGFuZCBhbGxvd2FibGVzIHNob3VsZCBiZSBzZXQgYnkgdGhlIGNvZGVyIGJ1dCBpZiBub3QgdGhleSB3aWxsIHVzZSB0aGUgVGFibGVPcHRpb25zQ29uZmlnIGRlZmF1bHRzLlxuICAgIC8vIEJ1dCB3ZSBzdGlsbCBuZWVkIHRvIHNldCB0aGUgY3VycmVudCBvcHRpb25zLlxuICAgIG9wdGlvbnMuY3VycmVudE9wdGlvbnMgPSB7XG4gICAgICBjb2x1bW5EZWZpbml0aW9uczogdGhpcy5jb25maWcuY29sdW1uRGVmaW5pdGlvbnMsXG4gICAgICBoZWFkZXJEaXNwbGF5OiB0aGlzLmNvbmZpZy5oZWFkZXJEaXNwbGF5LFxuICAgICAgaGVhZGVyU3RpY2t5OiB0aGlzLmNvbmZpZy5oZWFkZXJTdGlja3ksXG4gICAgICBwYWdpbmF0b3I6IHRoaXMuY29uZmlnLnBhZ2luYXRvcixcbiAgICAgIHNlYXJjaDogdGhpcy5jb25maWcuc2VhcmNoLFxuICAgICAgc2VhcmNoQ29sdW1uczogdGhpcy5jb25maWcuc2VhcmNoQ29sdW1ucyxcbiAgICAgIHNvcnQ6IHRoaXMuY29uZmlnLnNvcnQsXG4gICAgfTtcblxuICAgIC8vIElmIHRoZSBjb2RlciBkaWRuJ3QgcGFzcyBpbnRvIG9wdGlvbnMgdGhlIGF2YWlsYWJsZSBjb2x1bW5zIHRoZW4gZ2V0IGEgbGlzdCBvZiBhbGwgcG9zc2libGUgY29sdW1ucyBmcm9tIHRoZSBkYXRhLlxuICAgIGlmICghb3B0aW9ucy5jb2x1bW5zLmxlbmd0aCAmJiB0aGlzLmFzc2V0LmRhdGEgJiYgdGhpcy5hc3NldC5kYXRhWzBdKSB7XG4gICAgICBmb3IgKGNvbnN0IGNvbCBpbiB0aGlzLmFzc2V0LmRhdGFbMF0pIHtcbiAgICAgICAgaWYgKCF0aGlzLmFzc2V0LmRhdGFbMF0uaGFzT3duUHJvcGVydHkoY29sKSkgY29udGludWU7XG4gICAgICAgIGlmIChJc1N0cmluZyh0aGlzLmFzc2V0LmRhdGFbMF1bY29sXSkgfHwgSXNOdW1iZXIodGhpcy5hc3NldC5kYXRhWzBdW2NvbF0pKSB7XG4gICAgICAgICAgb3B0aW9ucy5jb2x1bW5zLnB1c2goY29sKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMub25CdWJibGVFdmVudCgnb3B0aW9uc19vcGVuJywgb3B0aW9ucyk7XG5cbiAgICBjb25zdCBkaWFsb2dSZWYgPSB0aGlzLnNydi5kaWFsb2cub3BlbihQb3BUYWJsZURpYWxvZ0NvbXBvbmVudCwge1xuICAgICAgZGF0YToge29wdGlvbnM6IG9wdGlvbnN9XG4gICAgfSk7XG5cbiAgICBkaWFsb2dSZWYuYWZ0ZXJDbG9zZWQoKS5zdWJzY3JpYmUoZGlhbG9nID0+IHtcbiAgICAgIGlmIChkaWFsb2cpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2hlcmUnLCBkaWFsb2cpO1xuICAgICAgICBpZiAoZGlhbG9nLnR5cGUgPT09ICdzYXZlJykge1xuICAgICAgICAgIHRoaXMuZG9tLnJlZnJlc2hpbmcoKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5jZHIuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgbmV3T3B0aW9ucyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGlhbG9nLm9wdGlvbnMpKTtcbiAgICAgICAgICB0aGlzLm9uQnViYmxlRXZlbnQoJ29wdGlvbnNfc2F2ZScsIG5ld09wdGlvbnMpO1xuICAgICAgICAgIC8vIEJ1aWxkIGEgbmV3IGNvbmZpZyBvYmplY3QgaW5zdGVhZCBvZiB1cGRhdGluZyB0aGUgb2xkIG9uZSBzbyB0aGF0IEFuZ3VsYXIncyBjaGFuZ2UgZGV0ZWN0aW9uIHdpbGwgYXV0byBfdXBkYXRlIHRoZSB2aWV3LlxuICAgICAgICAgIC8vIC0gQ2VydGFpbiB0aGluZ3MgKGNvbHVtbiBzb3J0IC8gc2VhcmNoKSB3b250IGF1dG8tX3VwZGF0ZSBvdGhlcndpc2UuXG4gICAgICAgICAgLy8gLSBSZXF1aXJlcyB0aGUgdXBkYXRpbmcgb2YgdGhlIGNvbHVtbiBkZWZzIGluIHRoZSBzZXRUaW1lb3V0LlxuICAgICAgICAgIC8vIC0gTWlnaHQgYmUgYW4gQW5ndWxhciBidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL21hdGVyaWFsMi9pc3N1ZXMvMTMwMzBcblxuICAgICAgICAgIHRoaXMuY29uZmlnLmhlYWRlckRpc3BsYXkgPSBuZXdPcHRpb25zLmN1cnJlbnRPcHRpb25zLmhlYWRlckRpc3BsYXk7XG4gICAgICAgICAgdGhpcy5jb25maWcuaGVhZGVyU3RpY2t5ID0gbmV3T3B0aW9ucy5jdXJyZW50T3B0aW9ucy5oZWFkZXJTdGlja3k7XG4gICAgICAgICAgdGhpcy5jb25maWcucGFnaW5hdG9yID0gbmV3T3B0aW9ucy5jdXJyZW50T3B0aW9ucy5wYWdpbmF0b3I7XG4gICAgICAgICAgdGhpcy5jb25maWcuc2VhcmNoQ29sdW1ucyA9IG5ld09wdGlvbnMuY3VycmVudE9wdGlvbnMuc2VhcmNoQ29sdW1ucztcbiAgICAgICAgICB0aGlzLmNvbmZpZy5zb3J0ID0gbmV3T3B0aW9ucy5jdXJyZW50T3B0aW9ucy5zb3J0O1xuXG4gICAgICAgICAgdGhpcy5jb25maWcudXBkYXRlQ29sdW1uRGVmaW5pdGlvbnMobmV3T3B0aW9ucy5jdXJyZW50T3B0aW9ucy5jb2x1bW5EZWZpbml0aW9ucyk7XG4gICAgICAgICAgaWYgKHNlYXJjaENvbHVtbnMgIT09IHRoaXMuY29uZmlnLnNlYXJjaENvbHVtbnMpIHRoaXMuX3NldEZpbHRlclByZWRpY2F0ZSgpO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9yZXNldFRhYmxlKCk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChkaWFsb2cudHlwZSA9PT0gJ3Jlc2V0Jykge1xuICAgICAgICAgIHRoaXMuZG9tLnJlZnJlc2hpbmcoKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5jZHIuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBCdWlsZCBhIG5ldyBjb25maWcgb2JqZWN0IGluc3RlYWQgb2YgdXBkYXRpbmcgdGhlIG9sZCBvbmUgc28gdGhhdCBBbmd1bGFyJ3MgY2hhbmdlIGRldGVjdGlvbiB3aWxsIGF1dG8gX3VwZGF0ZSB0aGUgdmlldy5cbiAgICAgICAgICAvLyAtIENlcnRhaW4gdGhpbmdzIChjb2x1bW4gc29ydCAvIHNlYXJjaCkgd29udCBhdXRvLV91cGRhdGUgb3RoZXJ3aXNlLlxuICAgICAgICAgIC8vIC0gUmVxdWlyZXMgdGhlIHVwZGF0aW5nIG9mIHRoZSBjb2x1bW4gZGVmcyBpbiB0aGUgc2V0VGltZW91dC5cbiAgICAgICAgICAvLyAtIE1pZ2h0IGJlIGFuIEFuZ3VsYXIgYnVnOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9tYXRlcmlhbDIvaXNzdWVzLzEzMDMwXG5cblxuICAgICAgICAgIHRoaXMub25CdWJibGVFdmVudCgnb3B0aW9uc19yZXNldCcsIGRpYWxvZy5vcHRpb25zKTtcbiAgICAgICAgICB0aGlzLmNvbmZpZy5oZWFkZXJEaXNwbGF5ID0gdGhpcy5jb25maWcub3B0aW9ucy5kZWZhdWx0T3B0aW9ucy5oZWFkZXJEaXNwbGF5O1xuICAgICAgICAgIHRoaXMuY29uZmlnLmhlYWRlclN0aWNreSA9IHRoaXMuY29uZmlnLm9wdGlvbnMuZGVmYXVsdE9wdGlvbnMuaGVhZGVyU3RpY2t5O1xuICAgICAgICAgIC8vIHRoaXMuY29uZmlnLnBhZ2luYXRvciA9IHRoaXMuY29uZmlnLm9wdGlvbnMuZGVmYXVsdE9wdGlvbnMucGFnaW5hdG9yO1xuICAgICAgICAgIHRoaXMuY29uZmlnLnNlYXJjaENvbHVtbnMgPSB0aGlzLmNvbmZpZy5vcHRpb25zLmRlZmF1bHRPcHRpb25zLnNlYXJjaENvbHVtbnM7XG4gICAgICAgICAgdGhpcy5jb25maWcuc29ydCA9IHRoaXMuY29uZmlnLm9wdGlvbnMuZGVmYXVsdE9wdGlvbnMuc29ydDtcbiAgICAgICAgICB0aGlzLmNvbmZpZy5kZWFsV2l0aEFuZ3VsYXJDaGFuZ2VEZXRlY3Rpb25GYWlsdXJlID0gZmFsc2U7XG5cbiAgICAgICAgICBjb25zdCBjb2x1bW5EZWZpbml0aW9ucyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGlhbG9nLm9wdGlvbnMuZGVmYXVsdE9wdGlvbnMuY29sdW1uRGVmaW5pdGlvbnMpKTtcbiAgICAgICAgICB0aGlzLmNvbmZpZy51cGRhdGVDb2x1bW5EZWZpbml0aW9ucyhjb2x1bW5EZWZpbml0aW9ucyk7XG4gICAgICAgICAgaWYgKHNlYXJjaENvbHVtbnMgIT09IHRoaXMuY29uZmlnLnNlYXJjaENvbHVtbnMpIHRoaXMuX3NldEZpbHRlclByZWRpY2F0ZSgpO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9yZXNldFRhYmxlKCk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChkaWFsb2cudHlwZSA9PT0gJ2NhbmNlbCcpIHtcbiAgICAgICAgICB0aGlzLm9uQnViYmxlRXZlbnQoJ29wdGlvbnNfY2FuY2VsJywge30pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm9uQnViYmxlRXZlbnQoJ29wdGlvbnNfY2FuY2VsJywge30pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogQ2xlYW4gdXAgdGhlIGRvbSBvZiB0aGlzIGNvbXBvbmVudFxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByb3RlY3RlZCBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLyoqXG4gICAqIFNldHVwIGFuIGludGlhbCBjb25maWcgZm9yIHRoaXMgY29tcG9uZW50IGhlcmVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByb3RlY3RlZCBfc2V0SW5pdGlhbENvbmZpZygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgIC8vIEVuc3VyZSBjb25maWdcbiAgICAgIHRoaXMuY29uZmlnID0gSXNPYmplY3RUaHJvd0Vycm9yKHRoaXMuY29uZmlnLCB0cnVlLCBgJHt0aGlzLm5hbWV9OmNvbmZpZ3VyZTogLSB0aGlzLmNvbmZpZ2ApID8gdGhpcy5jb25maWcgOiBudWxsO1xuICAgICAgLy8gU2V0IGEgZGF0YSBjb250YWluZXIgdG8gaG9sZCByYXcgZGF0YVxuICAgICAgdGhpcy5hc3NldC5kYXRhID0gPGFueVtdPltdO1xuICAgICAgaWYgKElzRGVmaW5lZCh0aGlzLmNvbmZpZy5pZCkpIHRoaXMuaWQgPSB0aGlzLmNvbmZpZy5pZDtcbiAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogSGFuZGxlIHRhYmxlIGV2ZW50c1xuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIHByb3RlY3RlZCBfb25UYWJsZUV2ZW50KGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UpIHtcbiAgICBsZXQgZ29Ub1VybDtcbiAgICBsZXQgcm91dGVBcHA7XG4gICAgaWYgKGV2ZW50LnR5cGUgPT09ICd0YWJsZScpIHtcbiAgICAgIHN3aXRjaCAoZXZlbnQubmFtZSkge1xuICAgICAgICBjYXNlICdjb2x1bW5TdGFuZGFyZENsaWNrJzpcbiAgICAgICAgICAvLyBJZiBnbG9iYWwgcm91dGUgd2FzIHNldCB0aGVuIGxldCB0aGUgdGFibGUgaGFuZGxlIHRoZSByb3V0aW5nIGVsc2UgZW1pdCB0aGUgZXZlbnQuXG4gICAgICAgICAgaWYgKHRoaXMuY29uZmlnLnJvdXRlKSB7XG4gICAgICAgICAgICBnb1RvVXJsID0gdGhpcy5fcGFyc2VHb1RvVXJsKHRoaXMuY29uZmlnLnJvdXRlLCBldmVudC5kYXRhLnJvdyk7XG4gICAgICAgICAgICByb3V0ZUFwcCA9IFN0cmluZyhnb1RvVXJsKS5zcGxpdCgnLycpO1xuICAgICAgICAgICAgaWYgKHJvdXRlQXBwWzFdICYmIHJvdXRlQXBwWzFdID09PSBQb3BIcmVmKSB7XG4gICAgICAgICAgICAgIC8vIFNpbmNlIHdlIGFyZSBpbiB0aGUgc2FtZSBhcHAgdGhlbiB1c2UgQW5ndWxhciB0byByb3V0ZS5cbiAgICAgICAgICAgICAgY29uc3Qgcm91dGUgPSByb3V0ZUFwcC5zbGljZSgyKS5qb2luKCcvJyk7XG4gICAgICAgICAgICAgIHRoaXMuc3J2LnJvdXRlci5uYXZpZ2F0ZShbcm91dGVdKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgICAgIFBvcFRlbXBsYXRlLmVycm9yKHttZXNzYWdlOiBgSW52YWxpZCBDbGllbnQgUm91dGU6ICR7cm91dGV9YCwgY29kZTogNTAwfSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gZG8gYSBoYXJkIHJlbG9hZCBpZiB3ZSBhcmVuJ3QuXG4gICAgICAgICAgICAgIFNldFNpdGVWYXIoJ3JlZGlyZWN0JywgZ29Ub1VybCk7XG4gICAgICAgICAgICAgIHRoaXMuc3J2LmJhc2UucmVkaXJlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vbkJ1YmJsZUV2ZW50KCdyb3dfY2xpY2tlZCcsIGV2ZW50LmRhdGEucm93KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnY29sdW1uUm91dGVDbGljayc6XG4gICAgICAgICAgaWYgKHRoaXMuY29uZmlnLmxpbmtCZWhhdmlvciA9PT0gJ3JvdXRlJykge1xuICAgICAgICAgICAgZ29Ub1VybCA9IHRoaXMuX3BhcnNlR29Ub1VybCh0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9uc1tldmVudC5kYXRhLm5hbWVdLnJvdXRlLCBldmVudC5kYXRhLnJvdyk7XG4gICAgICAgICAgICBpZiAoIWdvVG9VcmwpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHJvdXRlQXBwID0gU3RyaW5nKGdvVG9VcmwpLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICBpZiAocm91dGVBcHBbMV0gJiYgcm91dGVBcHBbMV0gPT09IFBvcEhyZWYpIHtcbiAgICAgICAgICAgICAgY29uc3Qgcm91dGUgPSByb3V0ZUFwcC5zbGljZSgyKS5qb2luKCcvJyk7XG4gICAgICAgICAgICAgIHRoaXMuc3J2LnJvdXRlci5uYXZpZ2F0ZShbcm91dGVdKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgICAgIFBvcFRlbXBsYXRlLmVycm9yKHttZXNzYWdlOiBgSW52YWxpZCBDbGllbnQgUm91dGU6ICR7cm91dGV9YCwgY29kZTogNTAwfSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgU2V0U2l0ZVZhcigncmVkaXJlY3QnLCBnb1RvVXJsKTtcbiAgICAgICAgICAgICAgdGhpcy5zcnYuYmFzZS5yZWRpcmVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm9uQnViYmxlRXZlbnQoZXZlbnQubmFtZSwgZXZlbnQuZGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2NvbHVtbkxpbmtDbGljayc6XG4gICAgICAgICAgdGhpcy5vbkJ1YmJsZUV2ZW50KCdjb2x1bW5MaW5rQ2xpY2snLCB7XG4gICAgICAgICAgICBsaW5rOiB0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9uc1tldmVudC5kYXRhLm5hbWVdLmxpbmssXG4gICAgICAgICAgICByb3c6IGV2ZW50LmRhdGEucm93LFxuICAgICAgICAgICAgY29sOiBldmVudC5kYXRhLm5hbWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZmlsdGVyJzpcbiAgICAgICAgICB0aGlzLm9uQXBwbHlTZWFyY2hWYWx1ZShldmVudC5kYXRhLmZpbHRlciwgZXZlbnQuZGF0YS5jb2wpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRoaXMub25CdWJibGVFdmVudChldmVudC5uYW1lLCBldmVudC5kYXRhKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGV2ZW50LnR5cGUgPT09ICdjb250ZXh0X21lbnUnKSB7XG4gICAgICB0aGlzLmV2ZW50cy5lbWl0KGV2ZW50KTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGRldGVybWluZSB3aGF0IHRoZSBoZWlnaHQgb2YgdGhlIHRhYmxlIHNob3VsZCBiZVxuICAgKiBAcGFyYW0gaGVpZ2h0XG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldEhlaWdodChoZWlnaHQ6IG51bWJlciA9IG51bGwpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgIHRoaXMuZG9tLm92ZXJoZWFkID0gMDtcbiAgICAgIGlmICh0aGlzLmNvbmZpZykge1xuICAgICAgICBpZiAoaGVpZ2h0KSB0aGlzLmNvbmZpZy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5oZWlnaHQpIHtcbiAgICAgICAgICBpZiAodGhpcy5jb25maWcub3B0aW9ucyB8fCB0aGlzLmNvbmZpZy5idXR0b25zLmxlbmd0aCB8fCAodGhpcy5jb25maWcuc2VhcmNoICYmICF0aGlzLmNvbmZpZy5zZWFyY2hDb2x1bW5zKSkgdGhpcy5kb20ub3ZlcmhlYWQgPSB0aGlzLmRvbS5vdmVyaGVhZCArIDU1O1xuICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5wYWdpbmF0b3IpIHRoaXMuZG9tLm92ZXJoZWFkID0gdGhpcy5kb20ub3ZlcmhlYWQgKyA2NTtcbiAgICAgICAgICB0aGlzLmRvbS5zZXRIZWlnaHQodGhpcy5jb25maWcuaGVpZ2h0LCB0aGlzLmRvbS5vdmVyaGVhZCk7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZG9tLnNldEhlaWdodCgwLCAwKTtcbiAgICAgICAgdGhpcy5kb20uaGVpZ2h0Lm91dGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5kb20uaGVpZ2h0LmlubmVyID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSB1c2VyIGNhbiBjaG9vc2UgZnJvbSBhIGdsb2JhbCBzZWFyY2ggb3IgYSBjb2x1bW4gc2VhcmNoXG4gICAqL1xuICBwcml2YXRlIF9zZXRGaWx0ZXJQcmVkaWNhdGUoc2VhcmNoVmFsdWU6IHN0cmluZyA9IG51bGwpIHtcbiAgICBpZiAodGhpcy5jb25maWcuc2VhcmNoQ29sdW1ucykge1xuICAgICAgdGhpcy5jb25maWcubWF0RGF0YS5maWx0ZXIgPSAnJztcbiAgICAgIHRoaXMuY29uZmlnLm1hdERhdGEuZmlsdGVyUHJlZGljYXRlID0gdGhpcy5hc3NldC5maWx0ZXIucHJlZGljYXRlLmNvbHVtbjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb25maWcubWF0RGF0YS5maWx0ZXJQcmVkaWNhdGUgPSB0aGlzLmFzc2V0LmZpbHRlci5wcmVkaWNhdGUudGFnO1xuICAgICAgdGhpcy5vbkFwcGx5U2VhcmNoVmFsdWUoKHNlYXJjaFZhbHVlID8gc2VhcmNoVmFsdWUgOiAnJyksICcnKTtcbiAgICB9XG4gIH1cblxuXG4gIHByb3RlY3RlZCBfdXBkYXRlRGF0YShkYXRhOiBBcnJheTxvYmplY3Q+KSB7XG4gICAgdGhpcy5kb20ucmVmcmVzaGluZygpO1xuICAgIGlmICghdGhpcy5jb25maWcubWF0RGF0YS5wYWdpbmF0b3IpIHRoaXMuY29uZmlnLm1hdERhdGEucGFnaW5hdG9yID0gdGhpcy5tYXRQYWdpbmF0b3I7XG4gICAgaWYgKElzT2JqZWN0KHRoaXMuY29uZmlnLmNvbHVtbkRlZmluaXRpb25zLCB0cnVlKSkge1xuICAgICAgaWYgKElzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgdGhpcy5hc3NldC5kYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5jb25maWcubWF0RGF0YS5kYXRhID0gdGhpcy5hc3NldC5kYXRhLnNsaWNlKCk7XG4gICAgICAgIGlmICghdGhpcy5jb25maWcuc2VhcmNoQ29sdW1ucyAmJiB0aGlzLmRvbS5zZXNzaW9uLnNlYXJjaFZhbHVlKSB7XG4gICAgICAgICAgdGhpcy5hc3NldC5maWx0ZXIuc2VhcmNoKHRoaXMuZG9tLnNlc3Npb24uc2VhcmNoVmFsdWUsICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3NldFRhYmxlTGF5b3V0KCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChJc0FycmF5KGRhdGEsIHRydWUpKSB7XG4gICAgICB0aGlzLmNvbmZpZy5kYXRhID0gZGF0YTtcbiAgICAgIHRoaXMub25CdWJibGVFdmVudCgnY29sdW1uX2RlZmluaXRpb25zJywgZGF0YVswXSk7XG4gICAgfVxuICB9XG5cblxuICBwcm90ZWN0ZWQgX3Jlc2V0VGFibGUoZGF0YTogQXJyYXk8b2JqZWN0PiA9IG51bGwpIHtcbiAgICB0aGlzLmxvZy5pbmZvKGBfcmVzZXRUYWJsZWApO1xuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoYHJlc2V0LXRhYmxlYCwgYXN5bmMgKCkgPT4ge1xuICAgICAgdGhpcy5kb20ucmVmcmVzaGluZygpO1xuICAgICAgYXdhaXQgdGhpcy5fY29uZmlndXJlVGFibGUoKTtcbiAgICAgIGF3YWl0IHRoaXMuX3VwZGF0ZUJ1dHRvbkNvbnRyb2woKTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZURhdGEoZGF0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGB2aWV3LXJlYWR5YCwgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZG9tLnJlYWR5KCk7XG4gICAgICAgIH0sIDIwMCk7XG4gICAgICB9XG4gICAgfSwgMCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgYnJpbmcgaW4gdGhlIHRhYmxlIGNvbmZpZyx1c2VyIHByZWZlcmVuY2VzLGRhdGEgc2V0IGFuZCB0aWUgaXQgYWxsIHRvZ2V0aGVyXG4gICAqIFRoZSBzdHJ1Y3R1cmUgb2YgdGhlIGRhdGEgc2V0IGlzIGltcG9ydGFudCB0byB3aGF0IHRoZSB0YWJsZSB3aWxsIHJlbmRlclxuICAgKi9cbiAgcHJvdGVjdGVkIF9jb25maWd1cmVUYWJsZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgIHRoaXMubG9nLmluZm8oYF9jb25maWd1cmVUYWJsZWApO1xuICAgICAgdGhpcy5jb25maWcubWF0RGF0YS5kYXRhLmxlbmd0aCA9IDA7XG4gICAgICBjb25zdCB0ZW1wbGF0ZXMgPSB7fTtcbiAgICAgIGNvbnN0IHZpc2libGUgPSBbXTtcbiAgICAgIGxldCB2aXNpYmxlT3JkZXJlZCA9IFtdO1xuICAgICAgbGV0IHZhbGlkRGVmaW5pdGlvbiA9IGZhbHNlO1xuXG4gICAgICBpZighSXNPYmplY3QodGhpcy5jb25maWcuY29sdW1uRGVmaW5pdGlvbnMsIHRydWUpKXtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUuaGFzQ29sdW1uRGVmaW5pdGlvbnMgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9ucyA9IHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogeyBuYW1lOiBcImRlc2NyaXB0aW9uXCIsIGxhYmVsOiBcIkRlc2NyaXB0aW9uXCIsIHZpc2libGU6IHRydWUsIHNvcnQ6IDMgfSxcbiAgICAgICAgICBpZDogeyBuYW1lOiBcImlkXCIsIGxhYmVsOiBcIklEXCIsIGNoZWNrYm94OiB7IHZpc2libGU6IHRydWUsIHNvcnQ6IDAgfSwgdmlzaWJsZTogdHJ1ZSwgc29ydDogOTk5IH0sXG4gICAgICAgICAgbmFtZTogeyBuYW1lOiBcIm5hbWVcIiwgbGFiZWw6IFwiTmFtZVwiLCB2aXNpYmxlOiB0cnVlLCBzb3J0OiAyIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICB0aGlzLmRvbS5zdGF0ZS5oYXNDb2x1bW5EZWZpbml0aW9ucyA9IElzT2JqZWN0KHRoaXMuY29uZmlnLmNvbHVtbkRlZmluaXRpb25zLCB0cnVlKTtcbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBjb2wgaW4gdGhpcy5jb25maWcuY29sdW1uRGVmaW5pdGlvbnMpIHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9ucy5oYXNPd25Qcm9wZXJ0eShjb2wpKSBjb250aW51ZTtcblxuICAgICAgICAvLyBNYXJraW5nIHRoaXMgYXMgdHJ1ZSBzbyB0aGF0IHRoZSBhdXRvIGNvbmZpZyBkb2VzIG5vdCBydW4uXG4gICAgICAgIHZhbGlkRGVmaW5pdGlvbiA9IHRydWU7XG5cbiAgICAgICAgLy8gRmlndXJlIG91dCB0aGUgdGVtcGxhdGUgdG8gdXNlLlxuICAgICAgICBsZXQgdGVtcGxhdGUgPSAnU3RhbmRhcmQnO1xuICAgICAgICBpZiAodGhpcy5jb25maWcuY29sdW1uRGVmaW5pdGlvbnNbY29sXS5yb3V0ZSkge1xuICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdLmljb24pIHtcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGhpcy5jb25maWcuY29sdW1uRGVmaW5pdGlvbnNbY29sXS5oZWxwZXIgPyAnUm91dGVJY29uSGVscGVyJyA6ICdSb3V0ZUljb24nO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRoaXMuY29uZmlnLmNvbHVtbkRlZmluaXRpb25zW2NvbF0uaGVscGVyID8gJ1JvdXRlSGVscGVyJyA6ICdSb3V0ZSc7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY29uZmlnLmNvbHVtbkRlZmluaXRpb25zW2NvbF0ubGluaykge1xuICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdLmljb24pIHtcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGhpcy5jb25maWcuY29sdW1uRGVmaW5pdGlvbnNbY29sXS5oZWxwZXIgPyAnTGlua0ljb25IZWxwZXInIDogJ0xpbmtJY29uJztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGVtcGxhdGUgPSB0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdLmhlbHBlciA/ICdMaW5rSGVscGVyJyA6ICdMaW5rJztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jb25maWcuY29sdW1uRGVmaW5pdGlvbnNbY29sXS5pY29uKSB7XG4gICAgICAgICAgdGVtcGxhdGUgPSB0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdLmhlbHBlciA/ICdJY29uSGVscGVyJyA6ICdJY29uJztcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdLmhlbHBlcikge1xuICAgICAgICAgIHRlbXBsYXRlID0gJ1N0YW5kYXJkSGVscGVyJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFBvcHVsYXRlIHRoZSB0ZW1wbGF0ZSB3aXRoIGFueXRoaW5nIGl0IG1heSBuZWVkLlxuICAgICAgICB0ZW1wbGF0ZXNbY29sXSA9IHtcbiAgICAgICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXG4gICAgICAgICAgbmFtZTogY29sLFxuICAgICAgICAgIGRpc3BsYXk6IHRoaXMuc3J2LnBpcGUubGFiZWwudHJhbnNmb3JtKGNvbCwgdGhpcy5jb25maWcuY29sdW1uRGVmaW5pdGlvbnNbY29sXSksXG4gICAgICAgICAgaWNvbjogdGhpcy5jb25maWcuY29sdW1uRGVmaW5pdGlvbnNbY29sXS5pY29uLFxuICAgICAgICAgIGhlbHBlcjoge1xuICAgICAgICAgICAgdGV4dDogKCF0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdLmhlbHBlciA/ICcnIDogKHR5cGVvZiB0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdLmhlbHBlciA9PT0gJ3N0cmluZycgPyB0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdLmhlbHBlciA6IHRoaXMuY29uZmlnLmNvbHVtbkRlZmluaXRpb25zW2NvbF0uaGVscGVyLnRleHQpKSxcbiAgICAgICAgICAgIHBvc2l0aW9uOiAoIXRoaXMuY29uZmlnLmNvbHVtbkRlZmluaXRpb25zW2NvbF0uaGVscGVyID8gJ2xlZnQnIDogKHR5cGVvZiB0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdLmhlbHBlciA9PT0gJ3N0cmluZycgPyAnbGVmdCcgOiB0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdLmhlbHBlci5wb3NpdGlvbikpLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgc3RpY2t5OiAhdGhpcy5jb25maWcuY29sdW1uRGVmaW5pdGlvbnNbY29sXS5zdGlja3kgPyBmYWxzZSA6IHRoaXMuY29uZmlnLmNvbHVtbkRlZmluaXRpb25zW2NvbF0uc3RpY2t5XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSWYgVmlzaWJsZVxuICAgICAgICBpZiAodGhpcy5jb25maWcuY29sdW1uRGVmaW5pdGlvbnNbY29sXS52aXNpYmxlKSB2aXNpYmxlLnB1c2goe1xuICAgICAgICAgIG5hbWU6IGNvbCxcbiAgICAgICAgICBzb3J0OiB0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdLnNvcnRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBjb2x1bW4gc2hvdWxkIGFsc28gaGF2ZSBhIGNoZWNrYm94LlxuICAgICAgICBpZiAodGhpcy5jb25maWcuY29sdW1uRGVmaW5pdGlvbnNbY29sXS5jaGVja2JveCkge1xuICAgICAgICAgIGNvbnN0IGNiTmFtZSA9ICdjaGVja2JveF8nICsgY29sO1xuICAgICAgICAgIHRlbXBsYXRlc1tjYk5hbWVdID0ge1xuICAgICAgICAgICAgdGVtcGxhdGU6ICdDaGVja2JveCcsXG4gICAgICAgICAgICBuYW1lOiBjb2wsXG4gICAgICAgICAgICBoZWxwZXI6IHt0ZXh0OiAnJywgcG9zaXRpb246ICdsZWZ0J30sXG4gICAgICAgICAgICBzdGlja3k6ICF0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdLmNoZWNrYm94LnN0aWNreSA/IGZhbHNlIDogdGhpcy5jb25maWcuY29sdW1uRGVmaW5pdGlvbnNbY29sXS5jaGVja2JveC5zdGlja3lcbiAgICAgICAgICB9O1xuICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdLmNoZWNrYm94LnZpc2libGUpIHtcbiAgICAgICAgICAgIHZpc2libGUucHVzaCh7XG4gICAgICAgICAgICAgIG5hbWU6IGNiTmFtZSxcbiAgICAgICAgICAgICAgc29ydDogdGhpcy5jb25maWcuY29sdW1uRGVmaW5pdGlvbnNbY29sXS5jaGVja2JveC5zb3J0ID8gdGhpcy5jb25maWcuY29sdW1uRGVmaW5pdGlvbnNbY29sXS5jaGVja2JveC5zb3J0IDogMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFB1dCB0aGUgdmlzaWJsZSBjb2x1bW5zIGFyZSBpbiB0aGUgY29ycmVjdCBvcmRlci5cbiAgICAgIHZpc2libGUuc29ydChEeW5hbWljU29ydCgnc29ydCcpKTtcbiAgICAgIGZvciAoY29uc3QgaSBpbiB2aXNpYmxlKSB2aXNpYmxlT3JkZXJlZC5wdXNoKHZpc2libGVbaV0ubmFtZSk7XG5cbiAgICAgIC8vIElmIG5vIGNvbHVtbiBjb25maWdzIHdlcmUgcGFzc2VkIGluIHRoZW4gdXNlIHRoZSBkYXRhIHNldCBhbmQganVzdCBkaXNwbGF5IGFsbCB0aGUgY29sdW1ucy5cbiAgICAgIGlmICghdmFsaWREZWZpbml0aW9uICYmIHRoaXMuYXNzZXQuZGF0YSAmJiB0aGlzLmFzc2V0LmRhdGFbMF0pIHtcbiAgICAgICAgZm9yIChjb25zdCBjb2wgaW4gdGhpcy5hc3NldC5kYXRhWzBdKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLmFzc2V0LmRhdGFbMF0uaGFzT3duUHJvcGVydHkoY29sKSkgY29udGludWU7XG4gICAgICAgICAgdmlzaWJsZU9yZGVyZWQucHVzaChjb2wpO1xuICAgICAgICAgIHRlbXBsYXRlc1tjb2xdID0ge1xuICAgICAgICAgICAgdGVtcGxhdGU6ICdTdGFuZGFyZCcsXG4gICAgICAgICAgICBuYW1lOiBjb2wsXG4gICAgICAgICAgICBkaXNwbGF5OiBQb3BQaXBlLmxhYmVsLnRyYW5zZm9ybShjb2wpXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBKdXN0IGluIGNhc2UsIHJlbW92ZSBhbnkgY29sdW1ucyBpbiB0aGUgdmlzaWJsZU9yZGVyZWQgdGhhdCBkbyBub3QgZXhpc3QgaW4gdGhlIGRhdGEgc2V0LlxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5hc3NldC5kYXRhKSAmJiB0aGlzLmFzc2V0LmRhdGEubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGF2YWlsYWJsZUZpZWxkcyA9IE9iamVjdC5rZXlzKHRoaXMuYXNzZXQuZGF0YVswXSk7XG4gICAgICAgIHZpc2libGVPcmRlcmVkID0gdmlzaWJsZU9yZGVyZWQuZmlsdGVyKChjb2wpID0+IHtcbiAgICAgICAgICByZXR1cm4gKGNvbC5pbmNsdWRlcygnY2hlY2tib3hfJykgPyB0cnVlIDogYXZhaWxhYmxlRmllbGRzLmluY2x1ZGVzKGNvbCkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gU2V0IHRoZSBjb25maWcuXG4gICAgICB0aGlzLmNvbmZpZy5jb2x1bW5Db25maWcgPSB7dGVtcGxhdGVzOiB0ZW1wbGF0ZXMsIHZpc2libGU6IHZpc2libGVPcmRlcmVkfTtcblxuXG4gICAgICAvLyBDbGVhciBwcmV2aW91cyBzZWxlY3Rpb25zLlxuICAgICAgaWYgKHRoaXMuY29uZmlnLnNlbGVjdGlvbikgdGhpcy5jb25maWcuc2VsZWN0aW9uLmNsZWFyKCk7XG5cblxuICAgICAgLy8gU2V0IHRoZSBkYXRhLlxuICAgICAgaWYgKElzQXJyYXkodGhpcy5jb25maWcuZGF0YSwgZmFsc2UpKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZURhdGEodGhpcy5jb25maWcuZGF0YSk7XG4gICAgICB9XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5kb20ucmVhZHkoKTtcbiAgICAgICAgdGhpcy5vbkJ1YmJsZUV2ZW50KCdyZWFkeScsIDEpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgIH0pO1xuICB9XG5cblxuICBwcm90ZWN0ZWQgX3NldFRhYmxlUGFnaW5hdGlvbigpIHtcbiAgICBpZiAodGhpcy5jb25maWcgJiYgdGhpcy5jb25maWcuaGVpZ2h0KSB7XG4gICAgICBsZXQgdmlld2FibGVSb3dzO1xuICAgICAgaWYgKHRoaXMuY29uZmlnLnBhZ2luYXRvciAmJiB0aGlzLm1hdFBhZ2luYXRvciAmJiBJc0FycmF5KHRoaXMuYXNzZXQuZGF0YSwgZmFsc2UpKSB7XG4gICAgICAgIHRoaXMuZG9tLnN0YXRlLmhhc1BhZ2luYXRpb24gPSB0aGlzLmFzc2V0LmRhdGEubGVuZ3RoID4gNTA7XG4gICAgICAgIC8vIHZpZXdhYmxlUm93cyA9IHRoaXMuYXNzZXQuZGF0YSA/IHRoaXMuYXNzZXQuZGF0YS5sZW5ndGggOiAwO1xuICAgICAgICAvLyBpZiggdGhpcy5kb20uc3RhdGUuaGFzUGFnaW5hdGlvbiApe1xuICAgICAgICAvLyB2aWV3YWJsZVJvd3MgPSBwYXJzZUludChTdHJpbmcoKCAoIHRoaXMuZG9tLmhlaWdodC5pbm5lciAtIDI1ICkgLyA1MCApKSwgMTApO1xuICAgICAgICB2aWV3YWJsZVJvd3MgPSA1MDtcbiAgICAgICAgLy8gaWYoIHRoaXMuY29uZmlnLmhlYWRlclN0aWNreSApIHZpZXdhYmxlUm93cy0tO1xuICAgICAgICAvLyB9XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuY29uZmlnLm1hdERhdGEucGFnaW5hdG9yLnBhZ2VTaXplID0gNTA7XG4gICAgICAgICAgdGhpcy5jb25maWcubWF0RGF0YS5wYWdpbmF0b3IucGFnZVNpemVPcHRpb25zID0gWzUwXTtcbiAgICAgICAgICB0aGlzLmNvbmZpZy5tYXREYXRhLnBhZ2luYXRvci5wYWdlSW5kZXggPSAwO1xuICAgICAgICAgIHRoaXMuY29uZmlnLm1hdERhdGEucGFnaW5hdG9yLnBhZ2UubmV4dCh7cGFnZUluZGV4OiAwLCBwYWdlU2l6ZTogNTAsIGxlbmd0aDogNTB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVuZGVyIFRoZSBIb29kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJpdmF0ZSBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICBwcml2YXRlIF91cGRhdGVDb2x1bW5EZWZpbml0aW9ucyhkZWZpbml0aW9uczogeyBba2V5OiBzdHJpbmddOiBDb2x1bW5EZWZpbml0aW9uSW50ZXJmYWNlIH0pIHtcbiAgICB0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9ucyA9IGRlZmluaXRpb25zO1xuICAgIHRoaXMuX2NvbmZpZ3VyZVRhYmxlKCkudGhlbigoKSA9PiB0cnVlKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBhdHRhY2ggYW5kIGNvbmZpZ3VyZSBhIHBhZ2luYXRvciBpZiBpdCBpcyBuZWVkZWRcbiAgICovXG4gIHByaXZhdGUgX2F0dGFjaFBhZ2luYXRvcigpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgIGlmICh0aGlzLm1hdFBhZ2luYXRvcikge1xuICAgICAgICB0aGlzLm1hdFBhZ2luYXRvci5oaWRlUGFnZVNpemUgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5jb25maWcgJiYgdGhpcy5jb25maWcubWF0RGF0YSkgdGhpcy5jb25maWcubWF0RGF0YS5wYWdpbmF0b3IgPSB0aGlzLm1hdFBhZ2luYXRvcjtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgd2lsbCBtYW5hZ2UgdGhlIGJ1dHRvbiBpbnRlcmZhY2VcbiAgICogQnV0dG9ucyBjYW4gaGF2ZSBhIGRlcGVuZGVuY3kgb24gd2hhdCB0aGUgdXNlciBoYXMgY3VycmVudGx5IHNlbGVjdGVkKGxpc3QgaXRlbXMgaGF2ZSBhIGNoZWNrYm94IHNlbGVjdGlvbilcbiAgICovXG4gIHByaXZhdGUgX3VwZGF0ZUJ1dHRvbkNvbnRyb2woKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICAvLyBJbml0aWFsaXplIHRoZSB1aSBidXR0b24gY29udHJvbFxuICAgICAgaWYgKElzVW5kZWZpbmVkKHRoaXMudWkuYnV0dG9uQ29udHJvbCkpIHtcbiAgICAgICAgdGhpcy51aS5idXR0b25Db250cm9sID0ge1xuICAgICAgICAgIHJlcXVpcmVTZWxlY3RlZDogZmFsc2UsXG4gICAgICAgICAgcmVxdWlyZU9uZVNlbGVjdGVkOiBmYWxzZSxcbiAgICAgICAgICByZXF1aXJlTm9uZVNlbGVjdGVkOiB0cnVlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5jb25maWcuc2VsZWN0aW9uKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdENvdW50ID0gdGhpcy5jb25maWcuc2VsZWN0aW9uLnNlbGVjdGVkLmxlbmd0aDtcbiAgICAgICAgdGhpcy51aS5idXR0b25Db250cm9sLnJlcXVpcmVTZWxlY3RlZCA9ICtzZWxlY3RDb3VudCA+IDA7XG4gICAgICAgIHRoaXMudWkuYnV0dG9uQ29udHJvbC5yZXF1aXJlT25lU2VsZWN0ZWQgPSArc2VsZWN0Q291bnQgPT09IDE7XG4gICAgICAgIHRoaXMudWkuYnV0dG9uQ29udHJvbC5yZXF1aXJlTm9uZVNlbGVjdGVkID0gK3NlbGVjdENvdW50ID09PSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51aS5idXR0b25Db250cm9sLnJlcXVpcmVTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnVpLmJ1dHRvbkNvbnRyb2wucmVxdWlyZU9uZVNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMudWkuYnV0dG9uQ29udHJvbC5yZXF1aXJlTm9uZVNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIHRhYmxlIGNvbmZpZyBoYXMgaXRzIG93biBldmVudCBlbWl0dGVyIHRoYXQgbmVlZCB0byBiZSBoYW5kbGVkXG4gICAqL1xuICBwcml2YXRlIF9oYW5kbGVDb25maWdFdmVudHMoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuY29uZmlnLm9uRXZlbnQpIHRoaXMuY29uZmlnLm9uRXZlbnQgPSBuZXcgU3ViamVjdDxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+KCk7XG4gICAgICB0aGlzLmRvbS5zZXRTdWJzY3JpYmVyKCdjb25maWctZXZlbnRzJywgdGhpcy5jb25maWcub25FdmVudC5zdWJzY3JpYmUoKGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UpID0+IHtcbiAgICAgICAgdGhpcy5fdXBkYXRlQnV0dG9uQ29udHJvbCgpLnRoZW4oKCkgPT4gdHJ1ZSk7XG4gICAgICAgIHRoaXMuX29uVGFibGVFdmVudChldmVudCk7XG4gICAgICB9KSk7XG4gICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgYWxsb3cgYW4gb3V0c2lkZSBjb21wb25lbnQgdG8gdHJpZ2dlciBzcGVjaWZpYyBmdW5jdGlvbmFsaXR5IHRocm91Z2ggdGhlIGNvbmZpZyBvZiB0aGlzIGNvbXBvbmVudFxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0Q29uZmlnSG9va3MoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG5cbiAgICAgIHRoaXMuY29uZmlnLnNldEhlaWdodCA9IChoZWlnaHQ6IG51bWJlcikgPT4ge1xuICAgICAgICB0aGlzLl9zZXRUYWJsZUhlaWdodChoZWlnaHQpO1xuICAgICAgfTtcblxuICAgICAgdGhpcy5jb25maWcuY2xlYXJTZWxlY3RlZCA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChjbGVhclJlc29sdmVyKSA9PiB7XG4gICAgICAgICAgdGhpcy5jb25maWcuc2VsZWN0aW9uLmNsZWFyKCk7XG4gICAgICAgICAgYXdhaXQgU2xlZXAoMjUwKTtcbiAgICAgICAgICB0aGlzLl91cGRhdGVCdXR0b25Db250cm9sKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY2xlYXJSZXNvbHZlcih0cnVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmNvbmZpZy51cGRhdGVDb2x1bW5EZWZpbml0aW9ucyA9IChkZWZpbml0aW9ucykgPT4ge1xuICAgICAgICB0aGlzLl91cGRhdGVDb2x1bW5EZWZpbml0aW9ucyhkZWZpbml0aW9ucyk7XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmNvbmZpZy51cGRhdGVEYXRhID0gKGRhdGEpID0+IHtcbiAgICAgICAgdGhpcy5fdXBkYXRlRGF0YShkYXRhKTtcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuY29uZmlnLnNldExheW91dCA9IChoZWlnaHQ6IG51bWJlcikgPT4ge1xuICAgICAgICB0aGlzLl9zZXRUYWJsZUxheW91dChoZWlnaHQpO1xuICAgICAgfTtcblxuICAgICAgdGhpcy5jb25maWcucmVzZXQgPSAoZGF0YTogQXJyYXk8b2JqZWN0PiA9IG51bGwpID0+IHtcbiAgICAgICAgdGhpcy5fcmVzZXRUYWJsZShkYXRhKTtcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuY29uZmlnLmFwcGx5RmlsdGVyID0gKHNlYXJjaFZhbHVlOiBzdHJpbmcsIGNvbDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5jb25maWcuc2VhcmNoQ29sdW1ucykge1xuICAgICAgICAgIHRoaXMub25BcHBseVNlYXJjaFZhbHVlKHNlYXJjaFZhbHVlLCBjb2wpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIGFuZCBtYW5hZ2UgdGhlIGZpbHRlciBwcmVkaWNhdGVzIHRoYXQgdGhpcyB0YWJsZSB3aWxsIHVzZVxuICAgKi9cbiAgcHJpdmF0ZSBfaW5pdFNlYXJjaEZpbHRlcigpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgIHRoaXMuZG9tLnNlc3Npb24uc2VhcmNoVmFsdWUgPSB0aGlzLmRvbS5zZXNzaW9uLnNlYXJjaFZhbHVlID8gdGhpcy5kb20uc2Vzc2lvbi5zZWFyY2hWYWx1ZSA6ICh0aGlzLmNvbmZpZy5zZWFyY2hWYWx1ZSA/IHRoaXMuY29uZmlnLnNlYXJjaFZhbHVlIDogJycpO1xuICAgICAgdGhpcy5hc3NldC5maWx0ZXIucHJlZGljYXRlID0ge1xuICAgICAgICBkZWZhdWx0OiB0aGlzLmNvbmZpZy5tYXREYXRhLmZpbHRlclByZWRpY2F0ZSwgLy8gU3RvcmUgYSBjb3B5IG9mIHRoaXMgZm9yIHJlc2V0dGluZyB3aGVuIG9wdGlvbnMgdG9nZ2xlIHNlYXJjaC9jb2x1bW4gc2VhcmNoLlxuICAgICAgICBjb2x1bW46IChkYXRhLCBmaWx0ZXI6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICAgICAgICAgIGxldCBleGlzdHMgPSB0cnVlO1xuICAgICAgICAgIGZvciAoY29uc3QgaSBpbiB0aGlzLmFzc2V0LmZpbHRlci5jb2x1bW4pIHtcbiAgICAgICAgICAgIGlmIChkYXRhW2ldICYmIGRhdGFbaV0udG9Mb3dlckNhc2UpIHtcbiAgICAgICAgICAgICAgZXhpc3RzID0gZGF0YVtpXS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHRoaXMuYXNzZXQuZmlsdGVyLmNvbHVtbltpXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBDYXN0IG51bWJlcnMgdG8gc3RyaW5ncy5cbiAgICAgICAgICAgICAgZXhpc3RzID0gU3RyaW5nKGRhdGFbaV0pLmluY2x1ZGVzKHRoaXMuYXNzZXQuZmlsdGVyLmNvbHVtbltpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWV4aXN0cykgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgdGFnOiAoZGF0YTogYW55LCBmaWx0ZXI6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICAgICAgICAgIHJldHVybiBPYmplY3RDb250YWluc1RhZ1NlYXJjaChkYXRhLCBmaWx0ZXIpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdGhpcy5hc3NldC5maWx0ZXIuc2VhcmNoID0gKHNlYXJjaFZhbHVlOiBzdHJpbmcsIGNvbDogc3RyaW5nKSA9PiB7XG4gICAgICAgIHNlYXJjaFZhbHVlID0gc2VhcmNoVmFsdWUudHJpbSgpLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICghY29sKSB7XG4gICAgICAgICAgdGhpcy5jb25maWcubWF0RGF0YS5maWx0ZXIgPSBzZWFyY2hWYWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoc2VhcmNoVmFsdWUpIHtcbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHRoaXMgY29sdW1uIGlzIGluIHRoZSBsaXN0LlxuICAgICAgICAgICAgdGhpcy5hc3NldC5maWx0ZXIuY29sdW1uW2NvbF0gPSBzZWFyY2hWYWx1ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYXNzZXQuZmlsdGVyLmNvbHVtbltjb2xdKSB7XG4gICAgICAgICAgICAvLyBTaW5jZSBmaWx0ZXIgaXMgZW1wdHkgdGhpcyBjb2x1bW4gc2hvdWxkbid0IGJlIGNvbnNpZGVyZWQuXG4gICAgICAgICAgICBkZWxldGUgKHRoaXMuYXNzZXQuZmlsdGVyLmNvbHVtbltjb2xdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5jb25maWcubWF0RGF0YS5maWx0ZXIgPSBzZWFyY2hWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5wYWdpbmF0b3IgJiYgdGhpcy5jb25maWcubWF0RGF0YS5wYWdpbmF0b3IpIHRoaXMuY29uZmlnLm1hdERhdGEucGFnaW5hdG9yLmZpcnN0UGFnZSgpO1xuICAgICAgfTtcbiAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgIH0pO1xuICB9XG5cblxuICBwcml2YXRlIF9zZXRUYWJsZUxheW91dChoZWlnaHQ6IG51bWJlciA9IG51bGwpIHtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCd0YWJsZS1sYXlvdXQnLCAoKSA9PiB7XG4gICAgICB0aGlzLmRvbS5sb2FkaW5nKCk7XG4gICAgICBpZiAodGhpcy5jb25maWcgJiYgSXNBcnJheSh0aGlzLmFzc2V0LmRhdGEsIGZhbHNlKSkge1xuICAgICAgICB0aGlzLl9zZXRIZWlnaHQoaGVpZ2h0KS50aGVuKCgpID0+IHtcblxuICAgICAgICB9KTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5kb20ucmVhZHkoKTtcbiAgICAgICAgICB0aGlzLl9zZXRUYWJsZVBhZ2luYXRpb24oKTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9XG4gICAgfSwgMCk7XG4gIH1cblxuXG4gIHByaXZhdGUgX3NldFRhYmxlSGVpZ2h0KGhlaWdodDogbnVtYmVyID0gbnVsbCkge1xuICAgIGlmICh0aGlzLmNvbmZpZyAmJiBJc0FycmF5KHRoaXMuYXNzZXQuZGF0YSwgZmFsc2UpKSB7XG4gICAgICB0aGlzLl9zZXRIZWlnaHQoaGVpZ2h0KTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmRvbS5yZWFkeSgpO1xuICAgICAgICB0aGlzLl9zZXRUYWJsZVBhZ2luYXRpb24oKTtcbiAgICAgIH0sIDApO1xuICAgIH1cbiAgfVxuXG5cbiAgcHJpdmF0ZSBfcGFyc2VHb1RvVXJsKGdvVG9VcmwgPSAnJywgcm93OiBFbnRpdHkpOiBzdHJpbmcge1xuICAgIGlmICghZ29Ub1VybCkgcmV0dXJuIGdvVG9Vcmw7XG5cbiAgICAvLyBDaGVjayBmb3IgYWxpYXNcbiAgICBpZiAoZ29Ub1VybC5pbmNsdWRlcygnYWxpYXM6JykpIHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gZ29Ub1VybC5pbmRleE9mKCdhbGlhczonKTtcbiAgICAgIGNvbnN0IGVuZCA9IGdvVG9VcmwuaW5kZXhPZignLycsIHN0YXJ0KSAhPT0gLTEgPyBnb1RvVXJsLmluZGV4T2YoJy8nLCBzdGFydCkgOiBnb1RvVXJsLmxlbmd0aDtcbiAgICAgIGNvbnN0IGFsaWFzU3RyaW5nID0gZ29Ub1VybC5zdWJzdHJpbmcoc3RhcnQsIGVuZCk7XG4gICAgICBjb25zdCBhbGlhc0FycmF5ID0gYWxpYXNTdHJpbmcuc3BsaXQoJzonKTtcbiAgICAgIGFsaWFzQXJyYXkuc2hpZnQoKTtcbiAgICAgIGNvbnN0IGFsaWFzID0gUG9wUGlwZS5sYWJlbC5nZXRBbGlhcyhhbGlhc0FycmF5LnNoaWZ0KCkpO1xuICAgICAgZ29Ub1VybCA9IGdvVG9VcmwucmVwbGFjZShhbGlhc1N0cmluZywgYWxpYXMpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBvdGhlciBpZC5cbiAgICBpZiAoZ29Ub1VybC5pbmNsdWRlcygnOicpICYmIHJvdykge1xuICAgICAgZ29Ub1VybCA9IFBhcnNlTGlua1VybChnb1RvVXJsLCByb3cpO1xuICAgIH1cblxuICAgIHJldHVybiBnb1RvVXJsO1xuICB9XG5cbn1cblxuXG5cblxuXG4iXX0=