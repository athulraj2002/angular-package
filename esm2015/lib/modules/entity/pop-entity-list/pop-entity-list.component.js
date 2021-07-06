import { __awaiter } from "tslib";
import { Component, ElementRef, Inject, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableConfig, TableOptionsConfig } from '../../base/pop-table/pop-table.model';
import { PopEntityAdvancedSearchComponent } from './pop-entity-advanced-search/pop-entity-advanced-search.component';
import { PopEntityUtilPortalService } from '../services/pop-entity-util-portal.service';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopBusiness, PopHref, PopTemplate, ServiceInjector, } from '../../../pop-common.model';
import { PopExtendComponent } from '../../../pop-extend.component';
import { MatDialog } from '@angular/material/dialog';
import { PopEntityEventService } from '../services/pop-entity-event.service';
import { ParseLinkUrl, ParseModelValue } from '../pop-entity-utility';
import { PopEntityActionService } from '../services/pop-entity-action.service';
import { PopPipeService } from '../../../services/pop-pipe.service';
import { PopEntityService } from '../services/pop-entity.service';
import { CleanObject, DynamicSort, GetRouteAlias, GetSessionSiteVar, IsArray, IsCallableFunction, IsObject, IsObjectThrowError, IsString, SetSessionSiteVar, Sleep, StorageGetter, TitleCase } from '../../../pop-common-utility';
import { PopCacFilterBarService } from '../../app/pop-cac-filter/pop-cac-filter.service';
import { PopEntityUtilParamService } from '../services/pop-entity-util-param.service';
import { forkJoin } from 'rxjs';
export class PopEntityListComponent extends PopExtendComponent {
    constructor(el, route, _domRepo, APP_GLOBAL) {
        super();
        this.el = el;
        this.route = route;
        this._domRepo = _domRepo;
        this.APP_GLOBAL = APP_GLOBAL;
        this.dataFactory = null;
        this.name = 'PopEntityListComponent';
        this.table = {
            data: [],
            buttons: [
                // { id: 'custom', name: 'Custom', accessType: 'can_read', requireSelected: true },
                // { id: 'advanced_search', name: 'Advanced Search', accessType: 'can_read', requireSelected: false },
                { id: 'archive', name: 'Archive', accessType: 'can_create', requireSelected: true },
                { id: 'restore', name: 'Activate', accessType: 'can_create', requireSelected: true },
                { id: 'show_archived', name: 'Show Archived', accessType: 'can_read', requireSelected: false },
                { id: 'show_active', name: 'Show Active', accessType: 'can_read', requireSelected: false },
                { id: 'new', name: 'New', accessType: 'can_create', requireSelected: false },
            ],
            interface: undefined,
            spinner: { diameter: 0, strokeWidth: 0 },
            config: null,
        };
        this.srv = {
            action: ServiceInjector.get(PopEntityActionService),
            dialog: ServiceInjector.get(MatDialog),
            entity: ServiceInjector.get(PopEntityService),
            events: ServiceInjector.get(PopEntityEventService),
            filter: ServiceInjector.get(PopCacFilterBarService),
            pipe: ServiceInjector.get(PopPipeService),
            param: ServiceInjector.get(PopEntityUtilParamService),
            portal: ServiceInjector.get(PopEntityUtilPortalService),
            router: ServiceInjector.get(Router),
            tab: undefined
        };
        this.ui = {
            actionModal: undefined,
        };
        this.asset = {
            blueprintData: {},
            fieldKeys: undefined,
            blueprint: undefined,
            transformations: undefined,
            tableInterface: undefined,
            tabMenuSessionPath: '',
            showArchivedSessionPath: '',
            searchValueSessionPath: ''
        };
        this.dom.configure = () => {
            // this component set the outer height boundary of this view
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                // Ensure that a CoreConfig exists for this component
                yield this.APP_GLOBAL.isVerified();
                yield this._setCoreConfig();
                this.id = this.core.params.internal_name;
                // #1: Enforce a CoreConfig
                this.core = IsObjectThrowError(this.core, true, `${this.name}:configureDom: - this.core`) ? this.core : {};
                yield forkJoin([
                    this._transformRouteExtension(),
                    this._setConfig(),
                    this._setSessionSettings(),
                    this._configureFilterBar(),
                    this._setCrudHandler(),
                    this._configureTable(),
                    this._setHeight(), // account for the filter bar , and determine the height of this table try to fill all vertical height
                ]);
                return resolve(true);
            }));
        };
        /**
         * This function will call after the dom registration
         */
        this.dom.proceed = () => {
            return new Promise((resolve) => {
                this.dom.setTimeout(`height-adjustment-check`, () => {
                    this._setHeight().then(() => {
                        return resolve(true);
                    });
                }, 250);
            });
        };
    }
    /**
     * This component will display a list of entities that the user can interact with
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * Trigger the table to reset itself
     */
    onResetTable() {
        this.dom.setTimeout('reset', () => {
            this.dom.state.loading = true;
            const overhead = (+this.core.repo.model.table.filter.active ? this.srv.filter.getHeight() : 25);
            this.dom.setHeightWithParent('sw-target-outlet', overhead, window.innerHeight - 65).then((res) => {
                if (this.table.config && typeof this.table.config.setLayout === 'function')
                    this.table.config.setLayout(this._getTableHeight());
            });
        }, 0);
    }
    /**
     * Trigger the table to reset itself
     */
    onResetHeight() {
        this._setHeight().then(() => {
            if (this.table.config && typeof this.table.config.setHeight === 'function')
                this.table.config.setHeight(this._getTableHeight());
        });
    }
    /**
     * A table will generate a slew of event and action triggers
     * @param event
     */
    onTableEvent(event) {
        //     console.log( this.name, event );
        if (event.type === 'table') {
            let ids;
            if (event && Array.isArray(event.data)) {
                ids = event.data.map((row) => row.id).join();
            }
            switch (event.name) {
                case 'search':
                    if (IsString(this.asset.searchValueSessionPath))
                        SetSessionSiteVar(this.asset.searchValueSessionPath, event.data);
                    // console.log('this.asset.searchValueSessionPath', this.asset.searchValueSessionPath);
                    break;
                case 'row_clicked':
                    this.onTableRowClicked(event.data);
                    break;
                case 'columnRouteClick':
                    this.onTableColumnClicked(event.data);
                    break;
                case 'options_save':
                    this.onSaveOptions(event.data);
                    break;
                case 'options_reset':
                    this.onOptionsReset();
                    break;
                case 'new':
                    this.onActionButtonClicked('new');
                    break;
                case 'show_archived':
                    this.onShowArchivedButtonClicked();
                    break;
                case 'show_active':
                    this.onShowArchivedButtonClicked();
                    break;
                case 'archive':
                    this.onArchiveButtonClicked(ids, true);
                    break;
                case 'restore':
                    this.onArchiveButtonClicked(ids, false);
                    break;
                case 'advanced_search':
                    this.onViewAdvancedSearch();
                    break;
                case 'column_definitions':
                    if (IsObject(event.data, true)) {
                        this.dom.setTimeout('build-columns', () => __awaiter(this, void 0, void 0, function* () {
                            this._setFieldKeys(event.data);
                            const columns = yield this._getDefaultColumns();
                            // this.table.config.columnDefinitions=columns;
                            this.table.config.updateColumnDefinitions(columns);
                        }), 0);
                    }
                    break;
                case 'ready':
                    // if( this.table.config && this.table.config.matData && !this.table.config.matData.data.length ) this._configureTable();
                    break;
                default:
                    break;
            }
            if (!['search', 'ready'].includes(event.name)) {
                // console.log('kill trigger refresh');
                this.dom.setTimeout(`lazy-load-fresh-data`, null);
            }
        }
        if (event.type === 'context_menu') {
            if (event.name === 'portal' && event.internal_name && event.id) {
                this.onViewEntityPortal(event.internal_name, +event.id);
            }
        }
    }
    /**
     * This is exploratory??? Idea is to pop a modal to make the user create an advanced search before we fetch the data for the table
     */
    onViewAdvancedSearch() {
        if (!this.dom.state.blockModal && this.srv.dialog.openDialogs.length == 0) {
            this.dom.state.blockModal = true;
            if (true) {
                const dialogRef = this.srv.dialog.open(PopEntityAdvancedSearchComponent, {
                    width: `${window.innerWidth * .50}px`,
                    height: `${window.innerHeight * .75}px`,
                    panelClass: 'sw-relative',
                    data: { test: 'yo yo' }
                });
                this.dom.subscriber.dialog = dialogRef.beforeClosed().subscribe((changed) => {
                    if (changed || this.dom.state.refresh) {
                        // this._configureTable();up
                    }
                    this.dom.state.blockModal = false;
                });
            }
        }
    }
    /**
     * A user can click on a row in a table to navigate the a view for that entity
     * @param row
     */
    onTableRowClicked(row) {
        if (!this.dom.state.blockModal && this.srv.dialog.openDialogs.length == 0) {
            // custom function
            this.onViewEntityPortal(this.core.params.internal_name, +row['id']);
        }
    }
    /**
     * A user can click on a specific column of a table and get a default action
     * @param data
     */
    onTableColumnClicked(data) {
        // placeholder
        if (!this.dom.state.blockModal && this.srv.dialog.openDialogs.length == 0) {
            this.dom.state.blockModal = true;
            if (data && data.name && data.row[data.name] && +data.row[data.name + '_id']) {
                this.onViewEntityPortal(data.row[data.name], +data.row[data.name + '_id']);
            }
        }
    }
    /**
     * A user can click a link to view a specific entity details in a modal
     * @param internal_name
     * @param id
     */
    onViewEntityPortal(internal_name, id) {
        if (!this.dom.state.blockModal && this.srv.dialog.openDialogs.length == 0) {
            this.dom.state.blockModal = true;
            if (internal_name && id) {
                this.srv.portal.view(internal_name, id).then((changed) => {
                    this.core.repo.clearCache('entity', String(id), 'PopEntityListComponent:onViewEntityPortal');
                    if (changed || this.dom.state.refresh) {
                        this.core.repo.clearAllCache('PopEntityListComponent:onViewEntityPortal');
                        this._configureTable().then(() => true);
                    }
                    this.dom.state.blockModal = false;
                });
            }
        }
    }
    /**
     * A user can save custom settings for how they want to view this table
     * @param options
     */
    onSaveOptions(options) {
        // We only want to save the current column defs and options.
        const preferences = {
            settings: {
                columns: options.currentOptions.columnDefinitions,
                options: options.currentOptions
            },
        };
        const existingID = StorageGetter(this.core.preference, ['table', 'id'], 0);
        this.dom.setSubscriber('save-preferences', this.core.repo.savePreference(+existingID, 'table', preferences).subscribe((preference) => {
            // console.log('saved-preferences', preference);
            this.srv.entity.updateBaseCoreConfig(this.core.params.internal_name, 'preference:table', preference);
            console.log('this.core', this.core);
            if (StorageGetter(this.core, ['preference'])) {
                this.core.preference.table = preference;
            }
            // console.log('this.core.preference.table', this.core.preference.table);
        }));
    }
    /**
     * A user can reset their preferences for this table to default
     */
    onOptionsReset() {
        this.dom.setTimeout(`lazy-load-fresh-data`, null);
        if (IsObject(this.core.preference, ['table']) && this.core.preference.table.id) {
            this.core.repo.deletePreference(this.core.preference.table.id, 'table').then((defaultPreference) => {
                if (defaultPreference) {
                    this.core.preference.table = defaultPreference;
                }
                else {
                    this.core.preference.table = {};
                }
                this.srv.entity.updateBaseCoreConfig(this.core.params.internal_name, 'preference:table', this.core.preference.table);
            });
        }
    }
    /**
     * A user can archive a list of entities
     * @param ids
     * @param archive
     */
    onArchiveButtonClicked(ids, archive) {
        this.table.config.loading = true;
        this.dom.setSubscriber('archive-entities', this.core.repo.archiveEntities(ids, archive).subscribe(() => {
            this.table.config.loading = false;
            this.core.repo.clearCache('table', 'data');
            this._triggerDataFetch(1);
            this.srv.events.sendEvent({
                source: this.name,
                method: 'archive',
                type: 'entity',
                name: this.core.params.name,
                internal_name: this.core.params.internal_name,
                id: ids,
                data: archive
            });
        }, err => {
            this.table.config.loading = false;
            this.dom.error.code = err.error.code;
            this.dom.error.message = err.error.message;
            this.dom.setTimeout(`reset-selected-items`, () => {
                if (typeof this.table.config.clearSelected === 'function')
                    this.table.config.clearSelected();
            }, 0);
        }));
    }
    /**
     * The user can click on a btn to show active, archived, or both?
     */
    onShowArchivedButtonClicked() {
        this.dom.state.showArchived = !this.dom.state.showArchived;
        this.core.repo.clearCache('table');
        this._configureTable().then(() => true);
        this.dom.setTimeout(`reset-selected-items`, () => {
            if (typeof this.table.config.clearSelected === 'function')
                this.table.config.clearSelected();
            this.table.config.buttons = this._buildTableButtons();
            if (IsString(this.asset.showArchivedSessionPath))
                SetSessionSiteVar(this.asset.showArchivedSessionPath, this.dom.state.showArchived);
        }, 0);
    }
    /**
     * This will open a modal to create a new entity when the user clicks on the new button
     */
    onActionButtonClicked(actionName) {
        // if( IsString( actionName, true ) ){
        //   this.srv.action.doAction( this.core, actionName, this.extension ).then( ( config: FieldItemGroupConfig ) => {
        //     console.log( 'action config', config );
        //     if( config ){
        //       this.ui.actionModal = config;
        //     }else{
        //       this.ui.actionModal = null;
        //     }
        //
        //     this.log.config( `onNewButtonClicked`, this.ui.actionModal );
        //   } );
        // }
        if (IsString(actionName, true)) {
            this.dom.setTimeout(`do-action`, () => __awaiter(this, void 0, void 0, function* () {
                yield this.srv.action.do(this.core, actionName, this.extension);
            }), 0);
        }
    }
    /**
     * When the modal for creating a new entity is closed, the config needs to be cleared
     */
    onActionModalClose() {
        this.ui.actionModal = null;
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
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            // #1: Grab Route Extension settings
            this._setRouteExtension();
            if (!this.internal_name)
                this.internal_name = this.srv.entity.getRouteInternalName(this.route, this.extension);
            if (!IsObject(this.core, true)) {
                this.srv.entity.getCoreConfig(this.internal_name, 0, this.dom.repo).then((core) => {
                    this.core = core;
                    return resolve(true);
                });
            }
            else {
                return resolve(true);
            }
        }));
    }
    /**
     * Setup basic config
     * Intended to be overridden
     * @private
     */
    _setConfig() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            return resolve(true);
        }));
    }
    /**
     * Attach a handler to handle an crud events
     * @private
     */
    _setCrudHandler() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.dom.setSubscriber('entity', this.srv.events.events.subscribe((event) => this._crudEventHandler(event)));
            return resolve(true);
        }));
    }
    /**
     * Determine the height of the table
     * @private
     */
    _setHeight() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            // Determine height of the table - have to account if filter bar is enabled
            const menu = 48;
            const filterHeight = this.dom.state.filter ? this.srv.filter.getHeight() : 25;
            const overhead = 25;
            const defaultHeight = window.innerHeight - menu - filterHeight;
            this.dom.setHeight(defaultHeight, overhead);
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
            this.asset.showArchivedSessionPath = `Business.${PopBusiness.id}.Entity.${TitleCase(this.core.params.internal_name)}.Table.Main.showArchived`;
            this.asset.searchValueSessionPath = `Business.${PopBusiness.id}.Entity.${TitleCase(this.core.params.internal_name)}.Table.Main.searchValue`;
            // Set any session variables
            SetSessionSiteVar(this.asset.tabMenuSessionPath, null); // remove any menu session data for this entity
            this.dom.state.showArchived = GetSessionSiteVar(this.asset.showArchivedSessionPath, false);
            return resolve(true);
        }));
    }
    /**
     * Determine how to fetch the data for this table
     * @param update
     * @private
     */
    _fetchData(update = false) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const params = {};
            if (!update)
                this.dom.setTimeout(`lazy-load-fresh-data`, null);
            if (IsObject(this.table, ['config']) && IsObject(this.table.config, ['clearSelected']) && typeof this.table.config.clearSelected === 'function')
                this.table.config.clearSelected();
            if (this.dataFactory) {
                this.dataFactory(null, this.dom.state.showArchived ? 1 : 0).then((data) => {
                    // console.log('data', data);
                    data = this._transformData(data);
                    if (update && this.table.config && typeof this.table.config.updateData === 'function') {
                        this.table.config.updateData(data);
                    }
                    PopTemplate.clear();
                    return resolve(data);
                }, () => {
                    reject([]);
                });
            }
            else {
                this.core.repo.getEntities(Object.assign({ archived: (this.dom.state.showArchived ? 1 : 0) }, params)).then((data) => {
                    data = this._transformData(data);
                    this.core.repo.setCache('table', 'data', data, 5);
                    if (update && typeof this.table.config.updateData === 'function') {
                        this.table.config.updateData(data);
                    }
                    PopTemplate.clear();
                    return resolve(data);
                }, err => {
                    reject(err);
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
        this.core.repo.setCache('table', 'data', data, 5);
        return data;
    }
    /**
     * Cleans the row data to remove any unwanted fields
     * @param row
     * @private
     */
    _setFieldKeys(row) {
        this.asset.fieldKeys = {};
        const Decorator = StorageGetter(this.core, ['repo', 'model', 'decorator'], null);
        if (IsCallableFunction(Decorator)) {
            row = Decorator(this.core, row);
        }
        if (IsObject(row, true)) {
            const allowedTypes = ['string', 'number', 'boolean'];
            const blacklist = StorageGetter(this.core.repo, ['model', 'table', 'blacklist'], {});
            const whitelist = StorageGetter(this.core.repo, ['model', 'table', 'whitelist'], {});
            const appendlist = StorageGetter(this.core.repo, ['model', 'table', 'appendlist'], {});
            Object.keys(row).map((key) => {
                if (!(key in blacklist)) {
                    if (key in whitelist || allowedTypes.includes(typeof row[key])) {
                        this.asset.fieldKeys[key] = 1;
                    }
                    else if (IsObject(row[key], ['id', 'name'])) {
                        this.asset.fieldKeys[key] = 1;
                    }
                }
            });
            if (IsObject(appendlist, true)) {
                Object.keys(appendlist).map((key) => {
                    this.asset.fieldKeys[key] = 1;
                });
            }
        }
    }
    /**
     * Apply the transformations to the dataset
     * @private
     */
    _setFieldTableTransformations() {
        this.asset.transformations = {};
        const fields = this.core.repo.model.field;
        Object.keys(this.asset.fieldKeys).map((key) => {
            const field = fields[key];
            if (IsObject(field, ['table', 'model'])) {
                if (field.model.name && field.table.transformation) {
                    this.asset.transformations[field.model.name] = CleanObject({
                        type: field.table.transformation.type,
                        arg1: field.table.transformation.arg1 ? field.table.transformation.arg1 : null,
                        arg2: field.table.transformation.arg2 ? field.table.transformation.arg2 : null,
                        arg3: field.table.transformation.arg3 ? field.table.transformation.arg3 : null,
                    });
                }
            }
        });
    }
    /**
     * A method that preps entity list data for tables
     * @param dataSet
     * @param fieldMap
     */
    _prepareTableData(dataSet) {
        this.log.info(`_prepareTableData: this.asset.fieldKeys`, this.asset.fieldKeys);
        const Decorator = StorageGetter(this.core, ['repo', 'model', 'decorator'], null);
        const Filter = StorageGetter(this.core, ['repo', 'model', 'filter'], null);
        const appendlist = StorageGetter(this.core.repo, ['model', 'table', 'appendlist'], {});
        if (IsArray(dataSet, true)) {
            if (Filter)
                dataSet = dataSet.filter(Filter);
            dataSet.sort(DynamicSort('id', 'desc'));
            return dataSet.map(row => {
                row = Object.keys(row).reduce((obj, k) => {
                    if (k in this.asset.fieldKeys)
                        obj[k] = row[k];
                    return obj;
                }, {});
                if (IsObject(appendlist, true)) {
                    Object.keys(appendlist).map((name) => {
                        const value = appendlist[name];
                        row[name] = ParseModelValue(value, row);
                    });
                }
                if (Decorator)
                    row = Decorator(this.core, row);
                return this.srv.pipe.transformObjectValues(row, this.asset.transformations, this.core);
            });
        }
        else {
            return dataSet;
        }
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
            this.core.repo.getCache('table', 'data').then((cache) => {
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
    /**
     * Trigger the table to re-fetch the data
     * @param seconds
     * @private
     */
    _triggerDataFetch(seconds = 5) {
        this.dom.setTimeout(`lazy-load-fresh-data`, () => {
            // PopTemplate.buffer(`Loading Fresh Data`);
            this._fetchData(true).catch(() => true);
        }, (seconds * 1000)); // allows for cached data to be presented for x amount of seconds before refreshed data is triggered
    }
    /**
     * The table need to know when new entities are created or update so that they can be updated in its view
     * @param event
     *
     */
    _crudEventHandler(event) {
        this.core.repo.clearCache('table', null, `PopEntityListComponent:crudEventHandler`);
        this.core.repo.clearCache('entity', null, `PopEntityListComponent:crudEventHandler`);
        if (event.method === 'create' || event.method === 'delete') {
            this.dom.state.refresh = true;
            this.core.params.refresh = true;
        }
        else if (event.method === 'update') {
            if (event.type === 'entity') {
                if (event.name === 'archive') {
                    this._configureTable(true).then(() => true);
                }
            }
            else if (event.type === 'field' && event.name === 'patch') {
                this.dom.state.refresh = true;
                this.core.params.refresh = true;
            }
        }
        else if (event.method === 'read') {
            if (event.type === 'dialog') {
                if (event.name === 'close') {
                    this.core.repo.clearCache('table', 'data', `PopEntityListComponent:crudEventHandler`);
                    this._configureTable().then(() => true);
                }
            }
        }
    }
    /**
     * THe filter bar needs to be configured for this specific entity
     *
     */
    _configureFilterBar() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            // return this.srv.filter.setActive(false);
            if (+this.core.repo.model.table.filter.active) {
                this.dom.state.filter = true;
                // this.srv.filter.setArchived(this.dom.state.showArchived);
                this.srv.filter.setView(this.core.repo.model.table.filter.view);
                this.srv.filter.setActive(true);
                this.dom.setSubscriber('filters', this.srv.filter.event.bubble.subscribe((event) => {
                    this._filterEventHandler(event);
                }));
                return resolve(true);
            }
            else {
                this.srv.filter.setActive(false);
                this.dom.state.filter = false;
                return resolve(true);
            }
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
                const tableData = yield this._getTableData(reset);
                if (IsArray(tableData.data, true)) {
                    this.asset.blueprintData = tableData.data[0];
                    this.asset.blueprint = tableData.data[0];
                }
                yield this._getTableInterface();
                this.table.config = new TableConfig(Object.assign(Object.assign({}, this.asset.tableInterface), tableData));
            }
            else {
                this.table.config.loading = true;
                this._getTableData().then((result) => __awaiter(this, void 0, void 0, function* () {
                    if (IsArray(result.data, true)) {
                        this.asset.blueprintData = result.data[0];
                        this.asset.blueprint = result.data[0];
                    }
                    this.table.config.buttons = this._buildTableButtons();
                    yield Sleep(10);
                    if (reset && typeof this.table.config.reset === 'function') {
                        this.table.config.reset(result.data);
                    }
                    else {
                        if (typeof this.table.config.updateData === 'function')
                            this.table.config.updateData(result.data);
                    }
                    this.table.config.loading = false;
                    this.dom.state.refresh = false;
                    this.core.params.refresh = false;
                }));
            }
            return resolve(true);
        }));
    }
    /**
     * Allows route to have a resolvable syntax
     *
     */
    _transformRouteExtension() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (!IsObject(this.extension))
                this.extension = {};
            if (IsString(this.extension.goToUrl, true)) {
                this.extension.goToUrl = ParseLinkUrl(this.extension.goToUrl, this.core.params, [':id']);
            }
            if (IsObject(this.extension.table, true)) {
                if (this.extension.table.route) {
                    this.extension.table.route = ParseLinkUrl(this.extension.table.route, this.core.params, [':id']);
                }
            }
            return resolve(true);
        }));
    }
    /**
     * Generates a table config interface to produce a config
     * @param row
     *
     */
    _getTableInterface() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            // this.loading = true;
            // Clear any session for previous viewing history
            if (IsObject(this.asset.tableInterface, true)) {
                return resolve(true);
            }
            else {
                yield this._getDefaultFieldKeys();
                const defaultColumns = yield this._getDefaultColumns();
                let userColumns;
                if (IsObject(this.core.preference, ['table']) && IsObject(this.core.preference.table.columns, true)) {
                    userColumns = this.core.preference.table.columns;
                }
                if (!userColumns)
                    userColumns = defaultColumns;
                // console.log('defaultColumns', defaultColumns);
                // console.log('userColumns', userColumns);
                // console.log('get', this.asset.searchValueSessionPath);
                let baseApp = (this.core.params.app ? this.core.params.app : PopHref);
                baseApp = baseApp ? `/${baseApp}/` : '/';
                let tableInterface = {
                    id: this.core.params.internal_name,
                    internal_name: this.core.params.internal_name,
                    paginator: true,
                    height: this._getTableHeight(),
                    buttons: this._buildTableButtons(),
                    route: `${baseApp}${GetRouteAlias(this.core.params.internal_name)}/:id/general`,
                    data: [],
                    searchValue: GetSessionSiteVar(this.asset.searchValueSessionPath, ''),
                    options: new TableOptionsConfig(Object.assign({ defaultOptions: { columnDefinitions: defaultColumns } }, this.core.repo.model.table.permission)),
                    columnDefinitions: userColumns
                };
                if (this.extension.goToUrl)
                    this.extension.goToUrl = ParseModelValue(this.extension.goToUrl, this.core, true);
                if (this.extension.table && this.extension.table.route)
                    this.extension.table.route = ParseModelValue(this.extension.table.route, this.core, true);
                if (this.extension.table && Object.keys(this.extension.table).length)
                    tableInterface = Object.assign(Object.assign({}, tableInterface), this.extension.table);
                if (IsObject(this.core.preference, ['table'])) {
                    // console.log('this.core.preference.table.options', this.core.preference.table.options);
                    if (this.core.preference.table.options) {
                        tableInterface = Object.assign(Object.assign({}, tableInterface), this.core.preference.table.options);
                    }
                }
                this.asset.tableInterface = tableInterface;
                return resolve(true);
            }
        }));
    }
    /**
     * A table will have a set of actions that it will need a button set to achieve
     *
     */
    _buildTableButtons() {
        let buttons = [];
        if (IsObject(this.core.repo.model.table.button, true)) {
            buttons = this.table.buttons.filter((button) => {
                // if( button.id === 'custom' && !this.core.repo.model.table.button.custom ) return false; // allow custom actions to be performed on a set of entities
                // if( button.id === 'advanced_search' && !this.core.repo.model.table.button.advanced_search ) return false; // allow for a advanced search on the entity data set
                if (button.id === 'archive' && (!this.core.repo.model.table.button.archived || this.dom.state.showArchived))
                    return false;
                if (button.id === 'restore' && (!this.core.repo.model.table.button.archived || !this.dom.state.showArchived))
                    return false;
                if (button.id === 'show_active' && (!this.core.repo.model.table.button.archived || !this.dom.state.showArchived))
                    return false;
                if (button.id === 'show_archived' && (!this.core.repo.model.table.button.archived || this.dom.state.showArchived))
                    return false;
                if (button.id === 'new' && !this.core.repo.model.table.button.new)
                    return false;
                if (!button.accessType)
                    return true;
                if (!this.srv.entity.checkAccess(this.core.params.internal_name, button.accessType))
                    return false;
                return true;
            });
        }
        return buttons;
    }
    /**
     * The filter bar and the table view need to be in sync
     * @param event
     *
     */
    _filterEventHandler(event) {
        this.log.event(`_filterEventHandler`, event);
        if (event.type === 'filter') {
            switch (event.name) {
                case 'clear':
                case 'apply':
                    this.srv.entity.bustAllCache();
                    this.dom.setTimeout('reconfigure-table', () => {
                        this._configureTable().then(() => true);
                    }, 0);
                    break;
                case 'init':
                case 'state':
                    if (event.model === 'open') {
                        this.onResetHeight();
                    }
                    break;
                default:
                    break;
            }
        }
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Allows the route to set/override specific settings
     *
     */
    _setRouteExtension() {
        if (!this.extension)
            this.extension = {};
        if (!this.extension.table)
            this.extension.table = {};
        if (!this.extension.goToUrl)
            this.extension.goToUrl = null;
        if (this.route.snapshot.data && Object.keys(this.route.snapshot.data).length) {
            Object.keys(this.route.snapshot.data).map((key) => {
                this.extension[key] = this.route.snapshot.data[key];
            });
        }
    }
    _getDefaultFieldKeys() {
        return new Promise((resolve) => {
            if (IsObject(this.asset.fieldKeys, true)) {
                return resolve(true);
            }
            else {
                this.core.repo.getCache('table', 'fieldKeys').then((fieldKeys) => {
                    if (IsObject(fieldKeys, true)) {
                        this.asset.fieldKeys = fieldKeys;
                    }
                    else {
                        this._setFieldKeys(this.asset.blueprint);
                    }
                    return resolve(true);
                }, () => {
                    this._setFieldKeys(this.asset.blueprint);
                    return resolve(true);
                });
            }
        });
    }
    _getDefaultColumns() {
        return new Promise((resolve) => {
            let defaultColumns = {};
            this.core.repo.getCache('table', 'columns').then((columns) => {
                if (IsObject(columns, true)) {
                    return resolve(columns);
                }
                else {
                    defaultColumns = {};
                    const fields = IsObjectThrowError(this.core.repo.model.field, true, `Repo contained no field model`) ? this.core.repo.model.field : null;
                    if (IsObject(this.asset.fieldKeys, true)) {
                        Object.keys(this.asset.fieldKeys).map((fieldName) => {
                            if (fieldName in fields) {
                                const field = fields[fieldName];
                                if (IsObject(field.model, ['route'])) {
                                    field.model.route = ParseModelValue(field.model.route, this.core);
                                }
                                if (field.table.visible)
                                    defaultColumns[fieldName] = Object.assign({
                                        name: field.model.name,
                                        label: field.model.label,
                                    }, field.table);
                            }
                        });
                    }
                    else {
                        // console.log('cache redirect');
                        // console.log(this.asset.blueprintData);
                        // SetPopCacheRedirectUrl(this.srv.router.url);
                        // this.srv.router.navigateByUrl('system/cache/clear',{skipLocationChange:true});
                    }
                    if (IsObject(defaultColumns, true)) {
                        this.core.repo.setCache('table', 'columns', defaultColumns, 60);
                    }
                    return resolve(defaultColumns);
                }
            });
        });
    }
    /**
     * Helper function that sets the height of the child view
     *
     */
    _getTableHeight() {
        let height = this.dom.height.inner;
        if (this.srv.filter.isActive()) {
            height -= 20;
        }
        return height;
    }
}
PopEntityListComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-list',
                template: "<div class=\"entity-list-container\" [style.height.px]=\"dom.height.inner\" [ngStyle]=\"!dom.state.filter && {'margin-top': '25px'}\" (window:resize)=\"onResetTable();\">\n  <lib-pop-table #list *ngIf=\"table.config\" [core]=core [config]=\"table.config\" (events)=\"onTableEvent($event)\"></lib-pop-table>\n  <div class=\"entity-list-spinner-box\" *ngIf=\"dom.state.loader\">\n    <lib-main-spinner></lib-main-spinner>\n  </div>\n</div>\n<!--<lib-pop-field-item-group *ngIf=\"ui.actionModal\" [config]=\"ui.actionModal\" (close)=\"onActionModalClose()\"></lib-pop-field-item-group>-->\n<lib-pop-errors *ngIf=\"dom.error?.message\" [error]=\"dom.error\"></lib-pop-errors>\n",
                providers: [PopDomService],
                styles: [".entity-list-container{position:relative;display:flex;width:auto;height:auto;flex-direction:column;box-sizing:border-box;margin:5px 25px 0}.entity-list-container lib-pop-table{position:absolute;left:0;top:0;right:0;bottom:10px}:host ::ng-deep tr{height:48px;max-height:48px}:host ::ng-deep td,:host ::ng-deep th{min-width:50px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;height:48px;max-height:48px}:host ::ng-deep th>.mat-sort-header-container{display:flex;min-width:50px}:host ::ng-deep .checkbox-column{min-width:25px!important;width:25px!important;padding:0 5px!important;text-align:center!important}::ng-deep th[class*=fk],:host ::ng-deep td[class*=fk]{text-align:center!important;justify-content:center}:host ::ng-deep th[class*=fk]>.mat-sort-header-container{justify-content:center!important;text-align:center!important}:host ::ng-deep td[class*=id],:host ::ng-deep th[class*=id]{text-align:center!important;justify-content:center}:host ::ng-deep th[class*=active]>.mat-sort-header-container{justify-content:center!important;text-align:center!important}:host ::ng-deep td[class*=active],:host ::ng-deep th[class*=active]{text-align:center!important;justify-content:center}:host ::ng-deep th[class*=system]>.mat-sort-header-container{justify-content:center!important;text-align:center!important}:host ::ng-deep td[class*=system],:host ::ng-deep th[class*=system]{text-align:center!important;justify-content:center}:host ::ng-deep th[class*=id]>.mat-sort-header-container{justify-content:center!important;text-align:center!important}:host ::ng-deep td[class*=-name],:host ::ng-deep th[class*=-name]{text-align:left!important;padding-left:20px!important;max-width:200px}:host ::ng-deep th[class*=-name] .mat-sort-header-container{padding-left:0!important;justify-content:left!important;max-width:500px}:host ::ng-deep td[class*=-first],:host ::ng-deep th[class*=-first]{text-align:left!important;padding-left:20px!important}:host ::ng-deep th[class*=-first] .mat-sort-header-container{min-width:50px!important;padding-left:0!important;justify-content:left!important}:host ::ng-deep td[class*=-last],:host ::ng-deep th[class*=-last]{text-align:left!important;padding-left:20px!important}:host ::ng-deep th[class*=-last] .mat-sort-header-container{padding-left:0!important;justify-content:left!important}:host ::ng-deep td[class*=-display],:host ::ng-deep th[class*=-display]{text-align:left!important;padding-left:20px!important}:host ::ng-deep th[class*=-display] .mat-sort-header-container{padding-left:0!important;justify-content:left!important}:host ::ng-deep td[class*=-description],:host ::ng-deep th[class*=-description]{text-align:left!important;padding-left:20px!important;max-width:500px}:host ::ng-deep th[class*=-description] .mat-sort-header-container{padding-left:0!important;justify-content:left!important;max-width:500px}:host ::ng-deep td[class*=email],:host ::ng-deep th[class*=email]{min-width:50px!important;text-align:left!important;padding-left:20px!important}:host ::ng-deep th[class*=email] .mat-sort-header-container{min-width:50px!important;padding-left:0!important;justify-content:left!important}.entity-list-spinner-box{height:75vh}"]
            },] }
];
PopEntityListComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: ActivatedRoute },
    { type: PopDomService },
    { type: undefined, decorators: [{ type: Inject, args: ['APP_GLOBAL',] }] }
];
PopEntityListComponent.propDecorators = {
    internal_name: [{ type: Input }],
    extension: [{ type: Input }],
    list: [{ type: ViewChild, args: ['list',] }],
    dataFactory: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1saXN0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LWxpc3QvcG9wLWVudGl0eS1saXN0LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBcUIsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2pHLE9BQU8sRUFBQyxjQUFjLEVBQUUsTUFBTSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDdkQsT0FBTyxFQUVMLFdBQVcsRUFFWCxrQkFBa0IsRUFDbkIsTUFBTSxzQ0FBc0MsQ0FBQztBQUk5QyxPQUFPLEVBQUMsZ0NBQWdDLEVBQUMsTUFBTSxtRUFBbUUsQ0FBQztBQUNuSCxPQUFPLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSw0Q0FBNEMsQ0FBQztBQUN0RixPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFDaEUsT0FBTyxFQVFMLFdBQVcsRUFDWCxPQUFPLEVBQ1AsV0FBVyxFQUNYLGVBQWUsR0FDaEIsTUFBTSwyQkFBMkIsQ0FBQztBQUNuQyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNqRSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDbkQsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sc0NBQXNDLENBQUM7QUFDM0UsT0FBTyxFQUFDLFlBQVksRUFBRSxlQUFlLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNwRSxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSx1Q0FBdUMsQ0FBQztBQUM3RSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sb0NBQW9DLENBQUM7QUFDbEUsT0FBTyxFQUFD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QUFTLFNBQUMsTUFBTTswQkFDaEIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3QsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCwgVmlld0NoaWxkfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QWN0aXZhdGVkUm91dGUsIFJvdXRlcn0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7XG4gIFRhYmxlQnV0dG9uSW50ZXJmYWNlLFxuICBUYWJsZUNvbmZpZyxcbiAgVGFibGVJbnRlcmZhY2UsXG4gIFRhYmxlT3B0aW9uc0NvbmZpZ1xufSBmcm9tICcuLi8uLi9iYXNlL3BvcC10YWJsZS9wb3AtdGFibGUubW9kZWwnO1xuaW1wb3J0IHtNYWluU3Bpbm5lcn0gZnJvbSAnLi4vLi4vYmFzZS9wb3AtaW5kaWNhdG9ycy9wb3AtaW5kaWNhdG9ycy5tb2RlbCc7XG5pbXBvcnQge0ZpZWxkSXRlbUdyb3VwQ29uZmlnfSBmcm9tICcuLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtLWdyb3VwL3BvcC1maWVsZC1pdGVtLWdyb3VwLm1vZGVsJztcbmltcG9ydCB7UG9wVGFibGVDb21wb25lbnR9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLXRhYmxlL3BvcC10YWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHtQb3BFbnRpdHlBZHZhbmNlZFNlYXJjaENvbXBvbmVudH0gZnJvbSAnLi9wb3AtZW50aXR5LWFkdmFuY2VkLXNlYXJjaC9wb3AtZW50aXR5LWFkdmFuY2VkLXNlYXJjaC5jb21wb25lbnQnO1xuaW1wb3J0IHtQb3BFbnRpdHlVdGlsUG9ydGFsU2VydmljZX0gZnJvbSAnLi4vc2VydmljZXMvcG9wLWVudGl0eS11dGlsLXBvcnRhbC5zZXJ2aWNlJztcbmltcG9ydCB7UG9wRG9tU2VydmljZX0gZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvcG9wLWRvbS5zZXJ2aWNlJztcbmltcG9ydCB7XG4gIEFwcEdsb2JhbEludGVyZmFjZSxcbiAgQ29yZUNvbmZpZywgRGF0YUZhY3RvcnksXG4gIERhdGFGaWx0ZXIsXG4gIERpY3Rpb25hcnksXG4gIEVudGl0eSxcbiAgRW50aXR5RXh0ZW5kSW50ZXJmYWNlLFxuICBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsXG4gIFBvcEJ1c2luZXNzLFxuICBQb3BIcmVmLFxuICBQb3BUZW1wbGF0ZSxcbiAgU2VydmljZUluamVjdG9yLFxufSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7UG9wRXh0ZW5kQ29tcG9uZW50fSBmcm9tICcuLi8uLi8uLi9wb3AtZXh0ZW5kLmNvbXBvbmVudCc7XG5pbXBvcnQge01hdERpYWxvZ30gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGlhbG9nJztcbmltcG9ydCB7UG9wRW50aXR5RXZlbnRTZXJ2aWNlfSBmcm9tICcuLi9zZXJ2aWNlcy9wb3AtZW50aXR5LWV2ZW50LnNlcnZpY2UnO1xuaW1wb3J0IHtQYXJzZUxpbmtVcmwsIFBhcnNlTW9kZWxWYWx1ZX0gZnJvbSAnLi4vcG9wLWVudGl0eS11dGlsaXR5JztcbmltcG9ydCB7UG9wRW50aXR5QWN0aW9uU2VydmljZX0gZnJvbSAnLi4vc2VydmljZXMvcG9wLWVudGl0eS1hY3Rpb24uc2VydmljZSc7XG5pbXBvcnQge1BvcFBpcGVTZXJ2aWNlfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlcy9wb3AtcGlwZS5zZXJ2aWNlJztcbmltcG9ydCB7UG9wRW50aXR5U2VydmljZX0gZnJvbSAnLi4vc2VydmljZXMvcG9wLWVudGl0eS5zZXJ2aWNlJztcbmltcG9ydCB7XG4gIENsZWFuT2JqZWN0LFxuICBEeW5hbWljU29ydCwgR2V0Um91dGVBbGlhcywgR2V0U2Vzc2lvblNpdGVWYXIsXG4gIElzQXJyYXksIElzQ2FsbGFibGVGdW5jdGlvbixcbiAgSXNPYmplY3QsXG4gIElzT2JqZWN0VGhyb3dFcnJvcixcbiAgSXNTdHJpbmcsXG4gIFNldFNlc3Npb25TaXRlVmFyLCBTbGVlcCxcbiAgU3RvcmFnZUdldHRlcixcbiAgVGl0bGVDYXNlXG59IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQge1BvcENhY0ZpbHRlckJhclNlcnZpY2V9IGZyb20gJy4uLy4uL2FwcC9wb3AtY2FjLWZpbHRlci9wb3AtY2FjLWZpbHRlci5zZXJ2aWNlJztcbmltcG9ydCB7UG9wRW50aXR5VXRpbFBhcmFtU2VydmljZX0gZnJvbSAnLi4vc2VydmljZXMvcG9wLWVudGl0eS11dGlsLXBhcmFtLnNlcnZpY2UnO1xuaW1wb3J0IHtmb3JrSm9pbn0gZnJvbSAncnhqcyc7XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC1lbnRpdHktbGlzdCcsXG4gIHN0eWxlVXJsczogWycuL3BvcC1lbnRpdHktbGlzdC5jb21wb25lbnQuc2NzcyddLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLWVudGl0eS1saXN0LmNvbXBvbmVudC5odG1sJyxcbiAgcHJvdmlkZXJzOiBbUG9wRG9tU2VydmljZV1cbn0pXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5TGlzdENvbXBvbmVudCBleHRlbmRzIFBvcEV4dGVuZENvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgaW50ZXJuYWxfbmFtZTogc3RyaW5nO1xuICBASW5wdXQoKSBleHRlbnNpb246IEVudGl0eUV4dGVuZEludGVyZmFjZTtcbiAgQFZpZXdDaGlsZCgnbGlzdCcpIGxpc3Q6IFBvcFRhYmxlQ29tcG9uZW50O1xuICBASW5wdXQoKSBkYXRhRmFjdG9yeTogRGF0YUZhY3RvcnkgPSBudWxsO1xuXG4gIHB1YmxpYyBuYW1lID0gJ1BvcEVudGl0eUxpc3RDb21wb25lbnQnO1xuXG5cbiAgcHVibGljIHJlYWRvbmx5IHRhYmxlID0ge1xuICAgIGRhdGE6IDxFbnRpdHlbXT5bXSxcbiAgICBidXR0b25zOiA8VGFibGVCdXR0b25JbnRlcmZhY2VbXT5bXG4gICAgICAvLyB7IGlkOiAnY3VzdG9tJywgbmFtZTogJ0N1c3RvbScsIGFjY2Vzc1R5cGU6ICdjYW5fcmVhZCcsIHJlcXVpcmVTZWxlY3RlZDogdHJ1ZSB9LFxuICAgICAgLy8geyBpZDogJ2FkdmFuY2VkX3NlYXJjaCcsIG5hbWU6ICdBZHZhbmNlZCBTZWFyY2gnLCBhY2Nlc3NUeXBlOiAnY2FuX3JlYWQnLCByZXF1aXJlU2VsZWN0ZWQ6IGZhbHNlIH0sXG4gICAgICB7aWQ6ICdhcmNoaXZlJywgbmFtZTogJ0FyY2hpdmUnLCBhY2Nlc3NUeXBlOiAnY2FuX2NyZWF0ZScsIHJlcXVpcmVTZWxlY3RlZDogdHJ1ZX0sXG4gICAgICB7aWQ6ICdyZXN0b3JlJywgbmFtZTogJ0FjdGl2YXRlJywgYWNjZXNzVHlwZTogJ2Nhbl9jcmVhdGUnLCByZXF1aXJlU2VsZWN0ZWQ6IHRydWV9LFxuICAgICAge2lkOiAnc2hvd19hcmNoaXZlZCcsIG5hbWU6ICdTaG93IEFyY2hpdmVkJywgYWNjZXNzVHlwZTogJ2Nhbl9yZWFkJywgcmVxdWlyZVNlbGVjdGVkOiBmYWxzZX0sXG4gICAgICB7aWQ6ICdzaG93X2FjdGl2ZScsIG5hbWU6ICdTaG93IEFjdGl2ZScsIGFjY2Vzc1R5cGU6ICdjYW5fcmVhZCcsIHJlcXVpcmVTZWxlY3RlZDogZmFsc2V9LFxuICAgICAge2lkOiAnbmV3JywgbmFtZTogJ05ldycsIGFjY2Vzc1R5cGU6ICdjYW5fY3JlYXRlJywgcmVxdWlyZVNlbGVjdGVkOiBmYWxzZX0sXG4gICAgXSxcbiAgICBpbnRlcmZhY2U6IDxUYWJsZUludGVyZmFjZT51bmRlZmluZWQsXG4gICAgc3Bpbm5lcjogPE1haW5TcGlubmVyPntkaWFtZXRlcjogMCwgc3Ryb2tlV2lkdGg6IDB9LFxuICAgIGNvbmZpZzogPFRhYmxlQ29uZmlnPm51bGwsXG4gIH07XG5cbiAgcHJvdGVjdGVkIHNydiA9IHtcbiAgICBhY3Rpb246IDxQb3BFbnRpdHlBY3Rpb25TZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoUG9wRW50aXR5QWN0aW9uU2VydmljZSksXG4gICAgZGlhbG9nOiA8TWF0RGlhbG9nPlNlcnZpY2VJbmplY3Rvci5nZXQoTWF0RGlhbG9nKSxcbiAgICBlbnRpdHk6IDxQb3BFbnRpdHlTZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoUG9wRW50aXR5U2VydmljZSksXG4gICAgZXZlbnRzOiA8UG9wRW50aXR5RXZlbnRTZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoUG9wRW50aXR5RXZlbnRTZXJ2aWNlKSxcbiAgICBmaWx0ZXI6IDxQb3BDYWNGaWx0ZXJCYXJTZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoUG9wQ2FjRmlsdGVyQmFyU2VydmljZSksXG4gICAgcGlwZTogPFBvcFBpcGVTZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoUG9wUGlwZVNlcnZpY2UpLFxuICAgIHBhcmFtOiA8UG9wRW50aXR5VXRpbFBhcmFtU2VydmljZT5TZXJ2aWNlSW5qZWN0b3IuZ2V0KFBvcEVudGl0eVV0aWxQYXJhbVNlcnZpY2UpLFxuICAgIHBvcnRhbDogPFBvcEVudGl0eVV0aWxQb3J0YWxTZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoUG9wRW50aXR5VXRpbFBvcnRhbFNlcnZpY2UpLFxuICAgIHJvdXRlcjogPFJvdXRlcj5TZXJ2aWNlSW5qZWN0b3IuZ2V0KFJvdXRlciksXG4gICAgdGFiOiB1bmRlZmluZWRcbiAgfTtcblxuICBwdWJsaWMgdWkgPSB7XG4gICAgYWN0aW9uTW9kYWw6IDxGaWVsZEl0ZW1Hcm91cENvbmZpZz51bmRlZmluZWQsXG4gIH07XG5cbiAgcHJvdGVjdGVkIGFzc2V0ID0ge1xuICAgIGJsdWVwcmludERhdGE6IDxEaWN0aW9uYXJ5PHN0cmluZz4+e30sXG4gICAgZmllbGRLZXlzOiA8RGljdGlvbmFyeTwxPj51bmRlZmluZWQsXG4gICAgYmx1ZXByaW50OiA8RGljdGlvbmFyeTxhbnk+PnVuZGVmaW5lZCxcbiAgICB0cmFuc2Zvcm1hdGlvbnM6IDxEaWN0aW9uYXJ5PGFueT4+dW5kZWZpbmVkLFxuICAgIHRhYmxlSW50ZXJmYWNlOiA8VGFibGVJbnRlcmZhY2U+dW5kZWZpbmVkLFxuICAgIHRhYk1lbnVTZXNzaW9uUGF0aDogJycsXG4gICAgc2hvd0FyY2hpdmVkU2Vzc2lvblBhdGg6ICcnLFxuICAgIHNlYXJjaFZhbHVlU2Vzc2lvblBhdGg6ICcnXG4gIH07XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSxcbiAgICBwcm90ZWN0ZWQgX2RvbVJlcG86IFBvcERvbVNlcnZpY2UsXG4gICAgQEluamVjdCgnQVBQX0dMT0JBTCcpIHB1YmxpYyBBUFBfR0xPQkFMOiBBcHBHbG9iYWxJbnRlcmZhY2UsXG4gICkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICAvLyB0aGlzIGNvbXBvbmVudCBzZXQgdGhlIG91dGVyIGhlaWdodCBib3VuZGFyeSBvZiB0aGlzIHZpZXdcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgICAvLyBFbnN1cmUgdGhhdCBhIENvcmVDb25maWcgZXhpc3RzIGZvciB0aGlzIGNvbXBvbmVudFxuICAgICAgICBhd2FpdCB0aGlzLkFQUF9HTE9CQUwuaXNWZXJpZmllZCgpO1xuICAgICAgICBhd2FpdCB0aGlzLl9zZXRDb3JlQ29uZmlnKCk7XG5cbiAgICAgICAgdGhpcy5pZCA9IHRoaXMuY29yZS5wYXJhbXMuaW50ZXJuYWxfbmFtZTtcbiAgICAgICAgLy8gIzE6IEVuZm9yY2UgYSBDb3JlQ29uZmlnXG4gICAgICAgIHRoaXMuY29yZSA9IElzT2JqZWN0VGhyb3dFcnJvcih0aGlzLmNvcmUsIHRydWUsIGAke3RoaXMubmFtZX06Y29uZmlndXJlRG9tOiAtIHRoaXMuY29yZWApID8gdGhpcy5jb3JlIDogPENvcmVDb25maWc+e307XG4gICAgICAgIGF3YWl0IGZvcmtKb2luKFtcbiAgICAgICAgICB0aGlzLl90cmFuc2Zvcm1Sb3V0ZUV4dGVuc2lvbigpLCAvLyBwdWxsIGluIHNldHRpbmdzIHBhc3NlZCBpbiB0aHJvdWdoIHRoZSByb3V0ZVxuICAgICAgICAgIHRoaXMuX3NldENvbmZpZygpLCAvLyB2YWxpZGF0ZSB0aGUgcGFzc2VkIGFyZ3VtZW50c1xuICAgICAgICAgIHRoaXMuX3NldFNlc3Npb25TZXR0aW5ncygpLCAvLyBkZXRlcm1pbmUgd2hlbiBhbmQgd2hhdCBzZXR0aW5ncyBzaG91bGQgYmUgc2Vzc2lvblN0b3JhZ2VcbiAgICAgICAgICB0aGlzLl9jb25maWd1cmVGaWx0ZXJCYXIoKSwgLy8gRW5hYmxlL0Rpc2FibGUgdGhlIGZpbHRlciBiYXJcbiAgICAgICAgICB0aGlzLl9zZXRDcnVkSGFuZGxlcigpLCAvLyBEZXRlcm1pbmUgY2FjaGUgYWN0aW9ucyBvbiBjcnVkIG9wZXJhdGlvbnNcbiAgICAgICAgICB0aGlzLl9jb25maWd1cmVUYWJsZSgpLCAvLyBCdWlsZCBvdXQgdGhlIHRhYmxlIGNvbmZpZyBmb3IgdGhlIHZpZXdcbiAgICAgICAgICB0aGlzLl9zZXRIZWlnaHQoKSwgLy8gYWNjb3VudCBmb3IgdGhlIGZpbHRlciBiYXIgLCBhbmQgZGV0ZXJtaW5lIHRoZSBoZWlnaHQgb2YgdGhpcyB0YWJsZSB0cnkgdG8gZmlsbCBhbGwgdmVydGljYWwgaGVpZ2h0XG4gICAgICAgIF0pO1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBjYWxsIGFmdGVyIHRoZSBkb20gcmVnaXN0cmF0aW9uXG4gICAgICovXG4gICAgdGhpcy5kb20ucHJvY2VlZCA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBoZWlnaHQtYWRqdXN0bWVudC1jaGVja2AsICgpID0+IHtcbiAgICAgICAgICB0aGlzLl9zZXRIZWlnaHQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCAyNTApO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IHdpbGwgZGlzcGxheSBhIGxpc3Qgb2YgZW50aXRpZXMgdGhhdCB0aGUgdXNlciBjYW4gaW50ZXJhY3Qgd2l0aFxuICAgKi9cbiAgbmdPbkluaXQoKSB7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgdGhlIHRhYmxlIHRvIHJlc2V0IGl0c2VsZlxuICAgKi9cbiAgb25SZXNldFRhYmxlKCkge1xuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoJ3Jlc2V0JywgKCkgPT4ge1xuICAgICAgdGhpcy5kb20uc3RhdGUubG9hZGluZyA9IHRydWU7XG4gICAgICBjb25zdCBvdmVyaGVhZCA9ICgrdGhpcy5jb3JlLnJlcG8ubW9kZWwudGFibGUuZmlsdGVyLmFjdGl2ZSA/IHRoaXMuc3J2LmZpbHRlci5nZXRIZWlnaHQoKSA6IDI1KTtcbiAgICAgIHRoaXMuZG9tLnNldEhlaWdodFdpdGhQYXJlbnQoJ3N3LXRhcmdldC1vdXRsZXQnLCBvdmVyaGVhZCwgd2luZG93LmlubmVySGVpZ2h0IC0gNjUpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICBpZiAodGhpcy50YWJsZS5jb25maWcgJiYgdHlwZW9mIHRoaXMudGFibGUuY29uZmlnLnNldExheW91dCA9PT0gJ2Z1bmN0aW9uJykgdGhpcy50YWJsZS5jb25maWcuc2V0TGF5b3V0KHRoaXMuX2dldFRhYmxlSGVpZ2h0KCkpO1xuICAgICAgfSk7XG4gICAgfSwgMCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIHRoZSB0YWJsZSB0byByZXNldCBpdHNlbGZcbiAgICovXG4gIG9uUmVzZXRIZWlnaHQoKSB7XG4gICAgdGhpcy5fc2V0SGVpZ2h0KCkudGhlbigoKSA9PiB7XG4gICAgICBpZiAodGhpcy50YWJsZS5jb25maWcgJiYgdHlwZW9mIHRoaXMudGFibGUuY29uZmlnLnNldEhlaWdodCA9PT0gJ2Z1bmN0aW9uJykgdGhpcy50YWJsZS5jb25maWcuc2V0SGVpZ2h0KHRoaXMuX2dldFRhYmxlSGVpZ2h0KCkpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogQSB0YWJsZSB3aWxsIGdlbmVyYXRlIGEgc2xldyBvZiBldmVudCBhbmQgYWN0aW9uIHRyaWdnZXJzXG4gICAqIEBwYXJhbSBldmVudFxuICAgKi9cbiAgb25UYWJsZUV2ZW50KGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UpIHtcbi8vICAgICBjb25zb2xlLmxvZyggdGhpcy5uYW1lLCBldmVudCApO1xuXG4gICAgaWYgKGV2ZW50LnR5cGUgPT09ICd0YWJsZScpIHtcbiAgICAgIGxldCBpZHM7XG4gICAgICBpZiAoZXZlbnQgJiYgQXJyYXkuaXNBcnJheShldmVudC5kYXRhKSkge1xuICAgICAgICBpZHMgPSBldmVudC5kYXRhLm1hcCgocm93KSA9PiByb3cuaWQpLmpvaW4oKTtcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAoZXZlbnQubmFtZSkge1xuICAgICAgICBjYXNlICdzZWFyY2gnOlxuICAgICAgICAgIGlmIChJc1N0cmluZyh0aGlzLmFzc2V0LnNlYXJjaFZhbHVlU2Vzc2lvblBhdGgpKSBTZXRTZXNzaW9uU2l0ZVZhcih0aGlzLmFzc2V0LnNlYXJjaFZhbHVlU2Vzc2lvblBhdGgsIGV2ZW50LmRhdGEpO1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd0aGlzLmFzc2V0LnNlYXJjaFZhbHVlU2Vzc2lvblBhdGgnLCB0aGlzLmFzc2V0LnNlYXJjaFZhbHVlU2Vzc2lvblBhdGgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyb3dfY2xpY2tlZCc6XG4gICAgICAgICAgdGhpcy5vblRhYmxlUm93Q2xpY2tlZChldmVudC5kYXRhKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY29sdW1uUm91dGVDbGljayc6XG4gICAgICAgICAgdGhpcy5vblRhYmxlQ29sdW1uQ2xpY2tlZChldmVudC5kYXRhKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnb3B0aW9uc19zYXZlJzpcbiAgICAgICAgICB0aGlzLm9uU2F2ZU9wdGlvbnMoZXZlbnQuZGF0YSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ29wdGlvbnNfcmVzZXQnOlxuICAgICAgICAgIHRoaXMub25PcHRpb25zUmVzZXQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbmV3JzpcbiAgICAgICAgICB0aGlzLm9uQWN0aW9uQnV0dG9uQ2xpY2tlZCgnbmV3Jyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3Nob3dfYXJjaGl2ZWQnOlxuICAgICAgICAgIHRoaXMub25TaG93QXJjaGl2ZWRCdXR0b25DbGlja2VkKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3Nob3dfYWN0aXZlJzpcbiAgICAgICAgICB0aGlzLm9uU2hvd0FyY2hpdmVkQnV0dG9uQ2xpY2tlZCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdhcmNoaXZlJzpcbiAgICAgICAgICB0aGlzLm9uQXJjaGl2ZUJ1dHRvbkNsaWNrZWQoaWRzLCB0cnVlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncmVzdG9yZSc6XG4gICAgICAgICAgdGhpcy5vbkFyY2hpdmVCdXR0b25DbGlja2VkKGlkcywgZmFsc2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdhZHZhbmNlZF9zZWFyY2gnOlxuICAgICAgICAgIHRoaXMub25WaWV3QWR2YW5jZWRTZWFyY2goKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY29sdW1uX2RlZmluaXRpb25zJzpcbiAgICAgICAgICBpZiAoSXNPYmplY3QoZXZlbnQuZGF0YSwgdHJ1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoJ2J1aWxkLWNvbHVtbnMnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuX3NldEZpZWxkS2V5cyhldmVudC5kYXRhKTtcbiAgICAgICAgICAgICAgY29uc3QgY29sdW1ucyA9IGF3YWl0IHRoaXMuX2dldERlZmF1bHRDb2x1bW5zKCk7XG4gICAgICAgICAgICAgIC8vIHRoaXMudGFibGUuY29uZmlnLmNvbHVtbkRlZmluaXRpb25zPWNvbHVtbnM7XG4gICAgICAgICAgICAgIHRoaXMudGFibGUuY29uZmlnLnVwZGF0ZUNvbHVtbkRlZmluaXRpb25zKGNvbHVtbnMpO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyZWFkeSc6XG4gICAgICAgICAgLy8gaWYoIHRoaXMudGFibGUuY29uZmlnICYmIHRoaXMudGFibGUuY29uZmlnLm1hdERhdGEgJiYgIXRoaXMudGFibGUuY29uZmlnLm1hdERhdGEuZGF0YS5sZW5ndGggKSB0aGlzLl9jb25maWd1cmVUYWJsZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKCFbJ3NlYXJjaCcsICdyZWFkeSddLmluY2x1ZGVzKGV2ZW50Lm5hbWUpKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdraWxsIHRyaWdnZXIgcmVmcmVzaCcpO1xuICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBsYXp5LWxvYWQtZnJlc2gtZGF0YWAsIG51bGwpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2NvbnRleHRfbWVudScpIHtcbiAgICAgIGlmIChldmVudC5uYW1lID09PSAncG9ydGFsJyAmJiBldmVudC5pbnRlcm5hbF9uYW1lICYmIGV2ZW50LmlkKSB7XG4gICAgICAgIHRoaXMub25WaWV3RW50aXR5UG9ydGFsKGV2ZW50LmludGVybmFsX25hbWUsICtldmVudC5pZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBpcyBleHBsb3JhdG9yeT8/PyBJZGVhIGlzIHRvIHBvcCBhIG1vZGFsIHRvIG1ha2UgdGhlIHVzZXIgY3JlYXRlIGFuIGFkdmFuY2VkIHNlYXJjaCBiZWZvcmUgd2UgZmV0Y2ggdGhlIGRhdGEgZm9yIHRoZSB0YWJsZVxuICAgKi9cbiAgb25WaWV3QWR2YW5jZWRTZWFyY2goKSB7XG4gICAgaWYgKCF0aGlzLmRvbS5zdGF0ZS5ibG9ja01vZGFsICYmIHRoaXMuc3J2LmRpYWxvZy5vcGVuRGlhbG9ncy5sZW5ndGggPT0gMCkge1xuICAgICAgdGhpcy5kb20uc3RhdGUuYmxvY2tNb2RhbCA9IHRydWU7XG4gICAgICBpZiAodHJ1ZSkge1xuICAgICAgICBjb25zdCBkaWFsb2dSZWYgPSB0aGlzLnNydi5kaWFsb2cub3BlbihQb3BFbnRpdHlBZHZhbmNlZFNlYXJjaENvbXBvbmVudCwge1xuICAgICAgICAgIHdpZHRoOiBgJHt3aW5kb3cuaW5uZXJXaWR0aCAqIC41MH1weGAsXG4gICAgICAgICAgaGVpZ2h0OiBgJHt3aW5kb3cuaW5uZXJIZWlnaHQgKiAuNzV9cHhgLFxuICAgICAgICAgIHBhbmVsQ2xhc3M6ICdzdy1yZWxhdGl2ZScsXG4gICAgICAgICAgZGF0YToge3Rlc3Q6ICd5byB5byd9XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgdGhpcy5kb20uc3Vic2NyaWJlci5kaWFsb2cgPSBkaWFsb2dSZWYuYmVmb3JlQ2xvc2VkKCkuc3Vic2NyaWJlKChjaGFuZ2VkKSA9PiB7XG4gICAgICAgICAgaWYgKGNoYW5nZWQgfHwgdGhpcy5kb20uc3RhdGUucmVmcmVzaCkge1xuICAgICAgICAgICAgLy8gdGhpcy5fY29uZmlndXJlVGFibGUoKTt1cFxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmRvbS5zdGF0ZS5ibG9ja01vZGFsID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgdXNlciBjYW4gY2xpY2sgb24gYSByb3cgaW4gYSB0YWJsZSB0byBuYXZpZ2F0ZSB0aGUgYSB2aWV3IGZvciB0aGF0IGVudGl0eVxuICAgKiBAcGFyYW0gcm93XG4gICAqL1xuICBvblRhYmxlUm93Q2xpY2tlZChyb3cpIHtcbiAgICBpZiAoIXRoaXMuZG9tLnN0YXRlLmJsb2NrTW9kYWwgJiYgdGhpcy5zcnYuZGlhbG9nLm9wZW5EaWFsb2dzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAvLyBjdXN0b20gZnVuY3Rpb25cbiAgICAgIHRoaXMub25WaWV3RW50aXR5UG9ydGFsKHRoaXMuY29yZS5wYXJhbXMuaW50ZXJuYWxfbmFtZSwgK3Jvd1snaWQnXSk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogQSB1c2VyIGNhbiBjbGljayBvbiBhIHNwZWNpZmljIGNvbHVtbiBvZiBhIHRhYmxlIGFuZCBnZXQgYSBkZWZhdWx0IGFjdGlvblxuICAgKiBAcGFyYW0gZGF0YVxuICAgKi9cbiAgb25UYWJsZUNvbHVtbkNsaWNrZWQoZGF0YSkge1xuICAgIC8vIHBsYWNlaG9sZGVyXG4gICAgaWYgKCF0aGlzLmRvbS5zdGF0ZS5ibG9ja01vZGFsICYmIHRoaXMuc3J2LmRpYWxvZy5vcGVuRGlhbG9ncy5sZW5ndGggPT0gMCkge1xuICAgICAgdGhpcy5kb20uc3RhdGUuYmxvY2tNb2RhbCA9IHRydWU7XG4gICAgICBpZiAoZGF0YSAmJiBkYXRhLm5hbWUgJiYgZGF0YS5yb3dbZGF0YS5uYW1lXSAmJiArZGF0YS5yb3dbZGF0YS5uYW1lICsgJ19pZCddKSB7XG4gICAgICAgIHRoaXMub25WaWV3RW50aXR5UG9ydGFsKGRhdGEucm93W2RhdGEubmFtZV0sICtkYXRhLnJvd1tkYXRhLm5hbWUgKyAnX2lkJ10pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgdXNlciBjYW4gY2xpY2sgYSBsaW5rIHRvIHZpZXcgYSBzcGVjaWZpYyBlbnRpdHkgZGV0YWlscyBpbiBhIG1vZGFsXG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSBpZFxuICAgKi9cbiAgb25WaWV3RW50aXR5UG9ydGFsKGludGVybmFsX25hbWU6IHN0cmluZywgaWQ6IG51bWJlcikge1xuICAgIGlmICghdGhpcy5kb20uc3RhdGUuYmxvY2tNb2RhbCAmJiB0aGlzLnNydi5kaWFsb2cub3BlbkRpYWxvZ3MubGVuZ3RoID09IDApIHtcbiAgICAgIHRoaXMuZG9tLnN0YXRlLmJsb2NrTW9kYWwgPSB0cnVlO1xuICAgICAgaWYgKGludGVybmFsX25hbWUgJiYgaWQpIHtcbiAgICAgICAgdGhpcy5zcnYucG9ydGFsLnZpZXcoaW50ZXJuYWxfbmFtZSwgaWQpLnRoZW4oKGNoYW5nZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICB0aGlzLmNvcmUucmVwby5jbGVhckNhY2hlKCdlbnRpdHknLCBTdHJpbmcoaWQpLCAnUG9wRW50aXR5TGlzdENvbXBvbmVudDpvblZpZXdFbnRpdHlQb3J0YWwnKTtcbiAgICAgICAgICBpZiAoY2hhbmdlZCB8fCB0aGlzLmRvbS5zdGF0ZS5yZWZyZXNoKSB7XG4gICAgICAgICAgICB0aGlzLmNvcmUucmVwby5jbGVhckFsbENhY2hlKCdQb3BFbnRpdHlMaXN0Q29tcG9uZW50Om9uVmlld0VudGl0eVBvcnRhbCcpO1xuICAgICAgICAgICAgdGhpcy5fY29uZmlndXJlVGFibGUoKS50aGVuKCgpID0+IHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmRvbS5zdGF0ZS5ibG9ja01vZGFsID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgdXNlciBjYW4gc2F2ZSBjdXN0b20gc2V0dGluZ3MgZm9yIGhvdyB0aGV5IHdhbnQgdG8gdmlldyB0aGlzIHRhYmxlXG4gICAqIEBwYXJhbSBvcHRpb25zXG4gICAqL1xuICBvblNhdmVPcHRpb25zKG9wdGlvbnMpIHtcbiAgICAvLyBXZSBvbmx5IHdhbnQgdG8gc2F2ZSB0aGUgY3VycmVudCBjb2x1bW4gZGVmcyBhbmQgb3B0aW9ucy5cbiAgICBjb25zdCBwcmVmZXJlbmNlcyA9IHtcbiAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgIGNvbHVtbnM6IG9wdGlvbnMuY3VycmVudE9wdGlvbnMuY29sdW1uRGVmaW5pdGlvbnMsXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnMuY3VycmVudE9wdGlvbnNcbiAgICAgIH0sXG5cbiAgICB9O1xuICAgIGNvbnN0IGV4aXN0aW5nSUQgPSBTdG9yYWdlR2V0dGVyKHRoaXMuY29yZS5wcmVmZXJlbmNlLCBbJ3RhYmxlJywgJ2lkJ10sIDApO1xuICAgIHRoaXMuZG9tLnNldFN1YnNjcmliZXIoJ3NhdmUtcHJlZmVyZW5jZXMnLCB0aGlzLmNvcmUucmVwby5zYXZlUHJlZmVyZW5jZSgrZXhpc3RpbmdJRCwgJ3RhYmxlJywgcHJlZmVyZW5jZXMpLnN1YnNjcmliZSgocHJlZmVyZW5jZSkgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnc2F2ZWQtcHJlZmVyZW5jZXMnLCBwcmVmZXJlbmNlKTtcbiAgICAgICAgdGhpcy5zcnYuZW50aXR5LnVwZGF0ZUJhc2VDb3JlQ29uZmlnKHRoaXMuY29yZS5wYXJhbXMuaW50ZXJuYWxfbmFtZSwgJ3ByZWZlcmVuY2U6dGFibGUnLCBwcmVmZXJlbmNlKTtcbiAgICAgICAgY29uc29sZS5sb2coJ3RoaXMuY29yZScsIHRoaXMuY29yZSk7XG4gICAgICAgIGlmIChTdG9yYWdlR2V0dGVyKHRoaXMuY29yZSwgWydwcmVmZXJlbmNlJ10pKSB7XG4gICAgICAgICAgdGhpcy5jb3JlLnByZWZlcmVuY2UudGFibGUgPSBwcmVmZXJlbmNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCd0aGlzLmNvcmUucHJlZmVyZW5jZS50YWJsZScsIHRoaXMuY29yZS5wcmVmZXJlbmNlLnRhYmxlKTtcbiAgICAgIH1cbiAgICApKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgdXNlciBjYW4gcmVzZXQgdGhlaXIgcHJlZmVyZW5jZXMgZm9yIHRoaXMgdGFibGUgdG8gZGVmYXVsdFxuICAgKi9cbiAgb25PcHRpb25zUmVzZXQoKSB7XG4gICAgdGhpcy5kb20uc2V0VGltZW91dChgbGF6eS1sb2FkLWZyZXNoLWRhdGFgLCBudWxsKTtcbiAgICBpZiAoSXNPYmplY3QodGhpcy5jb3JlLnByZWZlcmVuY2UsIFsndGFibGUnXSkgJiYgdGhpcy5jb3JlLnByZWZlcmVuY2UudGFibGUuaWQpIHtcbiAgICAgIHRoaXMuY29yZS5yZXBvLmRlbGV0ZVByZWZlcmVuY2UodGhpcy5jb3JlLnByZWZlcmVuY2UudGFibGUuaWQsICd0YWJsZScpLnRoZW4oKGRlZmF1bHRQcmVmZXJlbmNlKSA9PiB7XG4gICAgICAgIGlmIChkZWZhdWx0UHJlZmVyZW5jZSkge1xuICAgICAgICAgIHRoaXMuY29yZS5wcmVmZXJlbmNlLnRhYmxlID0gZGVmYXVsdFByZWZlcmVuY2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5jb3JlLnByZWZlcmVuY2UudGFibGUgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNydi5lbnRpdHkudXBkYXRlQmFzZUNvcmVDb25maWcodGhpcy5jb3JlLnBhcmFtcy5pbnRlcm5hbF9uYW1lLCAncHJlZmVyZW5jZTp0YWJsZScsIHRoaXMuY29yZS5wcmVmZXJlbmNlLnRhYmxlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgdXNlciBjYW4gYXJjaGl2ZSBhIGxpc3Qgb2YgZW50aXRpZXNcbiAgICogQHBhcmFtIGlkc1xuICAgKiBAcGFyYW0gYXJjaGl2ZVxuICAgKi9cbiAgb25BcmNoaXZlQnV0dG9uQ2xpY2tlZChpZHMsIGFyY2hpdmU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLnRhYmxlLmNvbmZpZy5sb2FkaW5nID0gdHJ1ZTtcbiAgICB0aGlzLmRvbS5zZXRTdWJzY3JpYmVyKCdhcmNoaXZlLWVudGl0aWVzJywgdGhpcy5jb3JlLnJlcG8uYXJjaGl2ZUVudGl0aWVzKGlkcywgYXJjaGl2ZSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMudGFibGUuY29uZmlnLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuY29yZS5yZXBvLmNsZWFyQ2FjaGUoJ3RhYmxlJywgJ2RhdGEnKTtcbiAgICAgIHRoaXMuX3RyaWdnZXJEYXRhRmV0Y2goMSk7XG4gICAgICB0aGlzLnNydi5ldmVudHMuc2VuZEV2ZW50KHtcbiAgICAgICAgc291cmNlOiB0aGlzLm5hbWUsXG4gICAgICAgIG1ldGhvZDogJ2FyY2hpdmUnLFxuICAgICAgICB0eXBlOiAnZW50aXR5JyxcbiAgICAgICAgbmFtZTogdGhpcy5jb3JlLnBhcmFtcy5uYW1lLFxuICAgICAgICBpbnRlcm5hbF9uYW1lOiB0aGlzLmNvcmUucGFyYW1zLmludGVybmFsX25hbWUsXG4gICAgICAgIGlkOiBpZHMsXG4gICAgICAgIGRhdGE6IGFyY2hpdmVcbiAgICAgIH0pO1xuICAgIH0sIGVyciA9PiB7XG4gICAgICB0aGlzLnRhYmxlLmNvbmZpZy5sb2FkaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmRvbS5lcnJvci5jb2RlID0gZXJyLmVycm9yLmNvZGU7XG4gICAgICB0aGlzLmRvbS5lcnJvci5tZXNzYWdlID0gZXJyLmVycm9yLm1lc3NhZ2U7XG4gICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGByZXNldC1zZWxlY3RlZC1pdGVtc2AsICgpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnRhYmxlLmNvbmZpZy5jbGVhclNlbGVjdGVkID09PSAnZnVuY3Rpb24nKSB0aGlzLnRhYmxlLmNvbmZpZy5jbGVhclNlbGVjdGVkKCk7XG4gICAgICB9LCAwKTtcbiAgICB9KSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgdXNlciBjYW4gY2xpY2sgb24gYSBidG4gdG8gc2hvdyBhY3RpdmUsIGFyY2hpdmVkLCBvciBib3RoP1xuICAgKi9cbiAgb25TaG93QXJjaGl2ZWRCdXR0b25DbGlja2VkKCkge1xuICAgIHRoaXMuZG9tLnN0YXRlLnNob3dBcmNoaXZlZCA9ICF0aGlzLmRvbS5zdGF0ZS5zaG93QXJjaGl2ZWQ7XG4gICAgdGhpcy5jb3JlLnJlcG8uY2xlYXJDYWNoZSgndGFibGUnKTtcbiAgICB0aGlzLl9jb25maWd1cmVUYWJsZSgpLnRoZW4oKCkgPT4gdHJ1ZSk7XG4gICAgdGhpcy5kb20uc2V0VGltZW91dChgcmVzZXQtc2VsZWN0ZWQtaXRlbXNgLCAoKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMudGFibGUuY29uZmlnLmNsZWFyU2VsZWN0ZWQgPT09ICdmdW5jdGlvbicpIHRoaXMudGFibGUuY29uZmlnLmNsZWFyU2VsZWN0ZWQoKTtcbiAgICAgIHRoaXMudGFibGUuY29uZmlnLmJ1dHRvbnMgPSB0aGlzLl9idWlsZFRhYmxlQnV0dG9ucygpO1xuICAgICAgaWYgKElzU3RyaW5nKHRoaXMuYXNzZXQuc2hvd0FyY2hpdmVkU2Vzc2lvblBhdGgpKSBTZXRTZXNzaW9uU2l0ZVZhcih0aGlzLmFzc2V0LnNob3dBcmNoaXZlZFNlc3Npb25QYXRoLCB0aGlzLmRvbS5zdGF0ZS5zaG93QXJjaGl2ZWQpO1xuICAgIH0sIDApO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyB3aWxsIG9wZW4gYSBtb2RhbCB0byBjcmVhdGUgYSBuZXcgZW50aXR5IHdoZW4gdGhlIHVzZXIgY2xpY2tzIG9uIHRoZSBuZXcgYnV0dG9uXG4gICAqL1xuICBvbkFjdGlvbkJ1dHRvbkNsaWNrZWQoYWN0aW9uTmFtZTogc3RyaW5nKSB7XG4gICAgLy8gaWYoIElzU3RyaW5nKCBhY3Rpb25OYW1lLCB0cnVlICkgKXtcbiAgICAvLyAgIHRoaXMuc3J2LmFjdGlvbi5kb0FjdGlvbiggdGhpcy5jb3JlLCBhY3Rpb25OYW1lLCB0aGlzLmV4dGVuc2lvbiApLnRoZW4oICggY29uZmlnOiBGaWVsZEl0ZW1Hcm91cENvbmZpZyApID0+IHtcbiAgICAvLyAgICAgY29uc29sZS5sb2coICdhY3Rpb24gY29uZmlnJywgY29uZmlnICk7XG4gICAgLy8gICAgIGlmKCBjb25maWcgKXtcbiAgICAvLyAgICAgICB0aGlzLnVpLmFjdGlvbk1vZGFsID0gY29uZmlnO1xuICAgIC8vICAgICB9ZWxzZXtcbiAgICAvLyAgICAgICB0aGlzLnVpLmFjdGlvbk1vZGFsID0gbnVsbDtcbiAgICAvLyAgICAgfVxuICAgIC8vXG4gICAgLy8gICAgIHRoaXMubG9nLmNvbmZpZyggYG9uTmV3QnV0dG9uQ2xpY2tlZGAsIHRoaXMudWkuYWN0aW9uTW9kYWwgKTtcbiAgICAvLyAgIH0gKTtcbiAgICAvLyB9XG4gICAgaWYgKElzU3RyaW5nKGFjdGlvbk5hbWUsIHRydWUpKSB7XG4gICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBkby1hY3Rpb25gLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHRoaXMuc3J2LmFjdGlvbi5kbyh0aGlzLmNvcmUsIGFjdGlvbk5hbWUsIHRoaXMuZXh0ZW5zaW9uKTtcbiAgICAgIH0sIDApO1xuICAgIH1cblxuICB9XG5cblxuICAvKipcbiAgICogV2hlbiB0aGUgbW9kYWwgZm9yIGNyZWF0aW5nIGEgbmV3IGVudGl0eSBpcyBjbG9zZWQsIHRoZSBjb25maWcgbmVlZHMgdG8gYmUgY2xlYXJlZFxuICAgKi9cbiAgb25BY3Rpb25Nb2RhbENsb3NlKCkge1xuICAgIHRoaXMudWkuYWN0aW9uTW9kYWwgPSBudWxsO1xuICB9XG5cblxuICAvKipcbiAgICogQ2xlYW4gdXAgdGhlIGRvbSBvZiB0aGlzIGNvbXBvbmVudFxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByb3RlY3RlZCBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgLyoqXG4gICAqIEFsbG93IGZvciBhIENvcmVDb25maWcgdG8gYmUgcGFzc2VkIGluXG4gICAqIElmIGEgQ29yZUNvbmZpZyBkb2VzIG5vdCBleGl0cyB0aGlzIGNvbXBvbmVudCBuZWVkcyB0byBiZSBhYmxlIHRvIGNyZWF0ZSBpdCBmb3IgaXRzZWxmLCB1c2VzIHRoZSBpbnRlcm5hbF9uYW1lIHRoYXQgY29tZXMgZGlyZWN0bHkgZm9yIHRoZSByb3V0ZVxuICAgKiBvciB0cmllcyB0byBleHRyYXBvbGF0ZSBpdCBmcm9tIHRoZSBjdXJyZW50IHVybCBvZiB0aGUgYXBwXG4gICAqXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldENvcmVDb25maWcoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICAvLyAjMTogR3JhYiBSb3V0ZSBFeHRlbnNpb24gc2V0dGluZ3NcbiAgICAgIHRoaXMuX3NldFJvdXRlRXh0ZW5zaW9uKCk7XG4gICAgICBpZiAoIXRoaXMuaW50ZXJuYWxfbmFtZSkgdGhpcy5pbnRlcm5hbF9uYW1lID0gdGhpcy5zcnYuZW50aXR5LmdldFJvdXRlSW50ZXJuYWxOYW1lKHRoaXMucm91dGUsIHRoaXMuZXh0ZW5zaW9uKTtcblxuICAgICAgaWYgKCFJc09iamVjdCh0aGlzLmNvcmUsIHRydWUpKSB7XG4gICAgICAgIHRoaXMuc3J2LmVudGl0eS5nZXRDb3JlQ29uZmlnKHRoaXMuaW50ZXJuYWxfbmFtZSwgMCwgdGhpcy5kb20ucmVwbykudGhlbigoY29yZTogQ29yZUNvbmZpZykgPT4ge1xuICAgICAgICAgIHRoaXMuY29yZSA9IGNvcmU7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZXR1cCBiYXNpYyBjb25maWdcbiAgICogSW50ZW5kZWQgdG8gYmUgb3ZlcnJpZGRlblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJvdGVjdGVkIF9zZXRDb25maWcoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEF0dGFjaCBhIGhhbmRsZXIgdG8gaGFuZGxlIGFuIGNydWQgZXZlbnRzXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldENydWRIYW5kbGVyKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgdGhpcy5kb20uc2V0U3Vic2NyaWJlcignZW50aXR5JywgdGhpcy5zcnYuZXZlbnRzLmV2ZW50cy5zdWJzY3JpYmUoKGV2ZW50KSA9PiB0aGlzLl9jcnVkRXZlbnRIYW5kbGVyKGV2ZW50KSkpO1xuICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgdGhlIGhlaWdodCBvZiB0aGUgdGFibGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByb3RlY3RlZCBfc2V0SGVpZ2h0KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgLy8gRGV0ZXJtaW5lIGhlaWdodCBvZiB0aGUgdGFibGUgLSBoYXZlIHRvIGFjY291bnQgaWYgZmlsdGVyIGJhciBpcyBlbmFibGVkXG4gICAgICBjb25zdCBtZW51ID0gNDg7XG4gICAgICBjb25zdCBmaWx0ZXJIZWlnaHQgPSB0aGlzLmRvbS5zdGF0ZS5maWx0ZXIgPyB0aGlzLnNydi5maWx0ZXIuZ2V0SGVpZ2h0KCkgOiAyNTtcbiAgICAgIGNvbnN0IG92ZXJoZWFkID0gMjU7XG4gICAgICBjb25zdCBkZWZhdWx0SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0IC0gbWVudSAtIGZpbHRlckhlaWdodDtcbiAgICAgIHRoaXMuZG9tLnNldEhlaWdodChkZWZhdWx0SGVpZ2h0LCBvdmVyaGVhZCk7XG5cbiAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogTWFuYWdlIHRoZSBzZXNzaW9uU3RvcmFnZSBzZXR0aW5nc1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJvdGVjdGVkIF9zZXRTZXNzaW9uU2V0dGluZ3MoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICAvLyBTZXQgc2Vzc2lvbiBwYXRoIGZvciB2YXJpYWJsZXNcbiAgICAgIHRoaXMuYXNzZXQudGFiTWVudVNlc3Npb25QYXRoID0gYEVudGl0eS4ke1RpdGxlQ2FzZSh0aGlzLmNvcmUucGFyYW1zLmludGVybmFsX25hbWUpfS5NZW51YDtcbiAgICAgIHRoaXMuYXNzZXQuc2hvd0FyY2hpdmVkU2Vzc2lvblBhdGggPSBgQnVzaW5lc3MuJHtQb3BCdXNpbmVzcy5pZH0uRW50aXR5LiR7VGl0bGVDYXNlKHRoaXMuY29yZS5wYXJhbXMuaW50ZXJuYWxfbmFtZSl9LlRhYmxlLk1haW4uc2hvd0FyY2hpdmVkYDtcbiAgICAgIHRoaXMuYXNzZXQuc2VhcmNoVmFsdWVTZXNzaW9uUGF0aCA9IGBCdXNpbmVzcy4ke1BvcEJ1c2luZXNzLmlkfS5FbnRpdHkuJHtUaXRsZUNhc2UodGhpcy5jb3JlLnBhcmFtcy5pbnRlcm5hbF9uYW1lKX0uVGFibGUuTWFpbi5zZWFyY2hWYWx1ZWA7XG5cbiAgICAgIC8vIFNldCBhbnkgc2Vzc2lvbiB2YXJpYWJsZXNcbiAgICAgIFNldFNlc3Npb25TaXRlVmFyKHRoaXMuYXNzZXQudGFiTWVudVNlc3Npb25QYXRoLCBudWxsKTsgLy8gcmVtb3ZlIGFueSBtZW51IHNlc3Npb24gZGF0YSBmb3IgdGhpcyBlbnRpdHlcbiAgICAgIHRoaXMuZG9tLnN0YXRlLnNob3dBcmNoaXZlZCA9IEdldFNlc3Npb25TaXRlVmFyKHRoaXMuYXNzZXQuc2hvd0FyY2hpdmVkU2Vzc2lvblBhdGgsIGZhbHNlKTtcblxuICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgaG93IHRvIGZldGNoIHRoZSBkYXRhIGZvciB0aGlzIHRhYmxlXG4gICAqIEBwYXJhbSB1cGRhdGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByb3RlY3RlZCBfZmV0Y2hEYXRhKHVwZGF0ZSA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgcGFyYW1zID0ge307XG4gICAgICBpZiAoIXVwZGF0ZSkgdGhpcy5kb20uc2V0VGltZW91dChgbGF6eS1sb2FkLWZyZXNoLWRhdGFgLCBudWxsKTtcbiAgICAgIGlmIChJc09iamVjdCh0aGlzLnRhYmxlLCBbJ2NvbmZpZyddKSAmJiBJc09iamVjdCh0aGlzLnRhYmxlLmNvbmZpZywgWydjbGVhclNlbGVjdGVkJ10pICYmIHR5cGVvZiB0aGlzLnRhYmxlLmNvbmZpZy5jbGVhclNlbGVjdGVkID09PSAnZnVuY3Rpb24nKSB0aGlzLnRhYmxlLmNvbmZpZy5jbGVhclNlbGVjdGVkKCk7XG4gICAgICBpZiAodGhpcy5kYXRhRmFjdG9yeSkge1xuICAgICAgICB0aGlzLmRhdGFGYWN0b3J5KG51bGwsIHRoaXMuZG9tLnN0YXRlLnNob3dBcmNoaXZlZCA/IDEgOiAwKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coJ2RhdGEnLCBkYXRhKTtcbiAgICAgICAgICBkYXRhID0gdGhpcy5fdHJhbnNmb3JtRGF0YShkYXRhKTtcbiAgICAgICAgICBpZiAodXBkYXRlICYmIHRoaXMudGFibGUuY29uZmlnICYmIHR5cGVvZiB0aGlzLnRhYmxlLmNvbmZpZy51cGRhdGVEYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLmNvbmZpZy51cGRhdGVEYXRhKGRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBQb3BUZW1wbGF0ZS5jbGVhcigpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKGRhdGEpO1xuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgcmVqZWN0KFtdKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvcmUucmVwby5nZXRFbnRpdGllcyh7YXJjaGl2ZWQ6ICh0aGlzLmRvbS5zdGF0ZS5zaG93QXJjaGl2ZWQgPyAxIDogMCksIC4uLnBhcmFtc30pLnRoZW4oKGRhdGE6IEVudGl0eVtdKSA9PiB7XG4gICAgICAgICAgZGF0YSA9IHRoaXMuX3RyYW5zZm9ybURhdGEoZGF0YSk7XG4gICAgICAgICAgdGhpcy5jb3JlLnJlcG8uc2V0Q2FjaGUoJ3RhYmxlJywgJ2RhdGEnLCBkYXRhLCA1KTtcbiAgICAgICAgICBpZiAodXBkYXRlICYmIHR5cGVvZiB0aGlzLnRhYmxlLmNvbmZpZy51cGRhdGVEYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLmNvbmZpZy51cGRhdGVEYXRhKGRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBQb3BUZW1wbGF0ZS5jbGVhcigpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKGRhdGEpO1xuICAgICAgICB9LCBlcnIgPT4ge1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgcHJvdGVjdGVkIF90cmFuc2Zvcm1EYXRhKGRhdGE6IGFueVtdKSB7XG4gICAgaWYgKCEoSXNPYmplY3QodGhpcy5hc3NldC5maWVsZEtleXMsIHRydWUpKSkgdGhpcy5fc2V0RmllbGRLZXlzKGRhdGFbMF0pO1xuICAgIGlmICghKElzT2JqZWN0KHRoaXMuYXNzZXQudHJhbnNmb3JtYXRpb25zLCB0cnVlKSkpIHRoaXMuX3NldEZpZWxkVGFibGVUcmFuc2Zvcm1hdGlvbnMoKTtcbiAgICBkYXRhID0gdGhpcy5fcHJlcGFyZVRhYmxlRGF0YShkYXRhKTtcbiAgICB0aGlzLmNvcmUucmVwby5zZXRDYWNoZSgndGFibGUnLCAnZGF0YScsIGRhdGEsIDUpO1xuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDbGVhbnMgdGhlIHJvdyBkYXRhIHRvIHJlbW92ZSBhbnkgdW53YW50ZWQgZmllbGRzXG4gICAqIEBwYXJhbSByb3dcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByb3RlY3RlZCBfc2V0RmllbGRLZXlzKHJvdzogRGljdGlvbmFyeTxhbnk+KTogdm9pZCB7XG4gICAgdGhpcy5hc3NldC5maWVsZEtleXMgPSB7fTtcbiAgICBjb25zdCBEZWNvcmF0b3IgPSBTdG9yYWdlR2V0dGVyKHRoaXMuY29yZSwgWydyZXBvJywgJ21vZGVsJywgJ2RlY29yYXRvciddLCBudWxsKTtcbiAgICBpZiAoSXNDYWxsYWJsZUZ1bmN0aW9uKERlY29yYXRvcikpIHtcbiAgICAgIHJvdyA9IERlY29yYXRvcih0aGlzLmNvcmUsIHJvdyk7XG4gICAgfVxuICAgIGlmIChJc09iamVjdChyb3csIHRydWUpKSB7XG4gICAgICBjb25zdCBhbGxvd2VkVHlwZXMgPSBbJ3N0cmluZycsICdudW1iZXInLCAnYm9vbGVhbiddO1xuICAgICAgY29uc3QgYmxhY2tsaXN0ID0gU3RvcmFnZUdldHRlcih0aGlzLmNvcmUucmVwbywgWydtb2RlbCcsICd0YWJsZScsICdibGFja2xpc3QnXSwge30pO1xuICAgICAgY29uc3Qgd2hpdGVsaXN0ID0gU3RvcmFnZUdldHRlcih0aGlzLmNvcmUucmVwbywgWydtb2RlbCcsICd0YWJsZScsICd3aGl0ZWxpc3QnXSwge30pO1xuICAgICAgY29uc3QgYXBwZW5kbGlzdCA9IFN0b3JhZ2VHZXR0ZXIodGhpcy5jb3JlLnJlcG8sIFsnbW9kZWwnLCAndGFibGUnLCAnYXBwZW5kbGlzdCddLCB7fSk7XG4gICAgICBPYmplY3Qua2V5cyhyb3cpLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgIGlmICghKGtleSBpbiBibGFja2xpc3QpKSB7XG4gICAgICAgICAgaWYgKGtleSBpbiB3aGl0ZWxpc3QgfHwgYWxsb3dlZFR5cGVzLmluY2x1ZGVzKHR5cGVvZiByb3dba2V5XSkpIHtcbiAgICAgICAgICAgIHRoaXMuYXNzZXQuZmllbGRLZXlzW2tleV0gPSAxO1xuICAgICAgICAgIH0gZWxzZSBpZiAoSXNPYmplY3Qocm93W2tleV0sIFsnaWQnLCAnbmFtZSddKSkge1xuICAgICAgICAgICAgdGhpcy5hc3NldC5maWVsZEtleXNba2V5XSA9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChJc09iamVjdChhcHBlbmRsaXN0LCB0cnVlKSkge1xuICAgICAgICBPYmplY3Qua2V5cyhhcHBlbmRsaXN0KS5tYXAoKGtleSkgPT4ge1xuICAgICAgICAgIHRoaXMuYXNzZXQuZmllbGRLZXlzW2tleV0gPSAxO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBcHBseSB0aGUgdHJhbnNmb3JtYXRpb25zIHRvIHRoZSBkYXRhc2V0XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldEZpZWxkVGFibGVUcmFuc2Zvcm1hdGlvbnMoKTogdm9pZCB7XG4gICAgdGhpcy5hc3NldC50cmFuc2Zvcm1hdGlvbnMgPSB7fTtcbiAgICBjb25zdCBmaWVsZHMgPSB0aGlzLmNvcmUucmVwby5tb2RlbC5maWVsZDtcbiAgICBPYmplY3Qua2V5cyh0aGlzLmFzc2V0LmZpZWxkS2V5cykubWFwKChrZXkpID0+IHtcbiAgICAgIGNvbnN0IGZpZWxkID0gZmllbGRzW2tleV07XG4gICAgICBpZiAoSXNPYmplY3QoZmllbGQsIFsndGFibGUnLCAnbW9kZWwnXSkpIHtcbiAgICAgICAgaWYgKGZpZWxkLm1vZGVsLm5hbWUgJiYgZmllbGQudGFibGUudHJhbnNmb3JtYXRpb24pIHtcbiAgICAgICAgICB0aGlzLmFzc2V0LnRyYW5zZm9ybWF0aW9uc1tmaWVsZC5tb2RlbC5uYW1lXSA9IENsZWFuT2JqZWN0KHtcbiAgICAgICAgICAgIHR5cGU6IGZpZWxkLnRhYmxlLnRyYW5zZm9ybWF0aW9uLnR5cGUsXG4gICAgICAgICAgICBhcmcxOiBmaWVsZC50YWJsZS50cmFuc2Zvcm1hdGlvbi5hcmcxID8gZmllbGQudGFibGUudHJhbnNmb3JtYXRpb24uYXJnMSA6IG51bGwsXG4gICAgICAgICAgICBhcmcyOiBmaWVsZC50YWJsZS50cmFuc2Zvcm1hdGlvbi5hcmcyID8gZmllbGQudGFibGUudHJhbnNmb3JtYXRpb24uYXJnMiA6IG51bGwsXG4gICAgICAgICAgICBhcmczOiBmaWVsZC50YWJsZS50cmFuc2Zvcm1hdGlvbi5hcmczID8gZmllbGQudGFibGUudHJhbnNmb3JtYXRpb24uYXJnMyA6IG51bGwsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCBwcmVwcyBlbnRpdHkgbGlzdCBkYXRhIGZvciB0YWJsZXNcbiAgICogQHBhcmFtIGRhdGFTZXRcbiAgICogQHBhcmFtIGZpZWxkTWFwXG4gICAqL1xuICBwcm90ZWN0ZWQgX3ByZXBhcmVUYWJsZURhdGEoZGF0YVNldDogQXJyYXk8YW55Pikge1xuICAgIHRoaXMubG9nLmluZm8oYF9wcmVwYXJlVGFibGVEYXRhOiB0aGlzLmFzc2V0LmZpZWxkS2V5c2AsIHRoaXMuYXNzZXQuZmllbGRLZXlzKTtcbiAgICBjb25zdCBEZWNvcmF0b3IgPSBTdG9yYWdlR2V0dGVyKHRoaXMuY29yZSwgWydyZXBvJywgJ21vZGVsJywgJ2RlY29yYXRvciddLCBudWxsKTtcbiAgICBjb25zdCBGaWx0ZXIgPSA8RGF0YUZpbHRlcj5TdG9yYWdlR2V0dGVyKHRoaXMuY29yZSwgWydyZXBvJywgJ21vZGVsJywgJ2ZpbHRlciddLCBudWxsKTtcbiAgICBjb25zdCBhcHBlbmRsaXN0ID0gU3RvcmFnZUdldHRlcih0aGlzLmNvcmUucmVwbywgWydtb2RlbCcsICd0YWJsZScsICdhcHBlbmRsaXN0J10sIHt9KTtcbiAgICBpZiAoSXNBcnJheShkYXRhU2V0LCB0cnVlKSkge1xuICAgICAgaWYgKEZpbHRlcikgZGF0YVNldCA9IGRhdGFTZXQuZmlsdGVyKEZpbHRlcik7XG4gICAgICBkYXRhU2V0LnNvcnQoRHluYW1pY1NvcnQoJ2lkJywgJ2Rlc2MnKSk7XG4gICAgICByZXR1cm4gZGF0YVNldC5tYXAocm93ID0+IHtcbiAgICAgICAgcm93ID0gT2JqZWN0LmtleXMocm93KS5yZWR1Y2UoKG9iaiwgaykgPT4ge1xuICAgICAgICAgIGlmIChrIGluIHRoaXMuYXNzZXQuZmllbGRLZXlzKSBvYmpba10gPSByb3dba107XG4gICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfSwge30pO1xuICAgICAgICBpZiAoSXNPYmplY3QoYXBwZW5kbGlzdCwgdHJ1ZSkpIHtcbiAgICAgICAgICBPYmplY3Qua2V5cyhhcHBlbmRsaXN0KS5tYXAoKG5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBhcHBlbmRsaXN0W25hbWVdO1xuICAgICAgICAgICAgcm93W25hbWVdID0gUGFyc2VNb2RlbFZhbHVlKHZhbHVlLCByb3cpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChEZWNvcmF0b3IpIHJvdyA9IERlY29yYXRvcih0aGlzLmNvcmUsIHJvdyk7XG4gICAgICAgIHJldHVybiB0aGlzLnNydi5waXBlLnRyYW5zZm9ybU9iamVjdFZhbHVlcyhyb3csIHRoaXMuYXNzZXQudHJhbnNmb3JtYXRpb25zLCB0aGlzLmNvcmUpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBkYXRhU2V0O1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgZGF0YSBzZXQgdGhhdCB0aGlzIHZpZXcgd2lsbCByZXByZXNlbnRcbiAgICogQHBhcmFtIGhhcmRSZXNldFxuICAgKlxuICAgKi9cbiAgcHJvdGVjdGVkIF9nZXRUYWJsZURhdGEoaGFyZFJlc2V0ID0gZmFsc2UpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKHRoaXMuZG9tLmRlbGF5LmRhdGEpIGNsZWFyVGltZW91dCh0aGlzLmRvbS5kZWxheS5kYXRhKTtcbiAgICAgIHRoaXMuY29yZS5yZXBvLmdldENhY2hlKCd0YWJsZScsICdkYXRhJykudGhlbigoY2FjaGUpID0+IHtcbiAgICAgICAgaWYgKElzQXJyYXkoY2FjaGUsIHRydWUpKSB7XG4gICAgICAgICAgdGhpcy5fdHJpZ2dlckRhdGFGZXRjaCgpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKHtkYXRhOiBjYWNoZX0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2ZldGNoRGF0YShmYWxzZSkudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoe2RhdGE6IGRhdGF9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIHRoZSB0YWJsZSB0byByZS1mZXRjaCB0aGUgZGF0YVxuICAgKiBAcGFyYW0gc2Vjb25kc1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJvdGVjdGVkIF90cmlnZ2VyRGF0YUZldGNoKHNlY29uZHM6IG51bWJlciA9IDUpIHtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBsYXp5LWxvYWQtZnJlc2gtZGF0YWAsICgpID0+IHtcbiAgICAgIC8vIFBvcFRlbXBsYXRlLmJ1ZmZlcihgTG9hZGluZyBGcmVzaCBEYXRhYCk7XG4gICAgICB0aGlzLl9mZXRjaERhdGEodHJ1ZSkuY2F0Y2goKCkgPT4gdHJ1ZSk7XG4gICAgfSwgKHNlY29uZHMgKiAxMDAwKSk7IC8vIGFsbG93cyBmb3IgY2FjaGVkIGRhdGEgdG8gYmUgcHJlc2VudGVkIGZvciB4IGFtb3VudCBvZiBzZWNvbmRzIGJlZm9yZSByZWZyZXNoZWQgZGF0YSBpcyB0cmlnZ2VyZWRcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSB0YWJsZSBuZWVkIHRvIGtub3cgd2hlbiBuZXcgZW50aXRpZXMgYXJlIGNyZWF0ZWQgb3IgdXBkYXRlIHNvIHRoYXQgdGhleSBjYW4gYmUgdXBkYXRlZCBpbiBpdHMgdmlld1xuICAgKiBAcGFyYW0gZXZlbnRcbiAgICpcbiAgICovXG4gIHByb3RlY3RlZCBfY3J1ZEV2ZW50SGFuZGxlcihldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlKSB7XG4gICAgdGhpcy5jb3JlLnJlcG8uY2xlYXJDYWNoZSgndGFibGUnLCBudWxsLCBgUG9wRW50aXR5TGlzdENvbXBvbmVudDpjcnVkRXZlbnRIYW5kbGVyYCk7XG4gICAgdGhpcy5jb3JlLnJlcG8uY2xlYXJDYWNoZSgnZW50aXR5JywgbnVsbCwgYFBvcEVudGl0eUxpc3RDb21wb25lbnQ6Y3J1ZEV2ZW50SGFuZGxlcmApO1xuICAgIGlmIChldmVudC5tZXRob2QgPT09ICdjcmVhdGUnIHx8IGV2ZW50Lm1ldGhvZCA9PT0gJ2RlbGV0ZScpIHtcbiAgICAgIHRoaXMuZG9tLnN0YXRlLnJlZnJlc2ggPSB0cnVlO1xuICAgICAgdGhpcy5jb3JlLnBhcmFtcy5yZWZyZXNoID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50Lm1ldGhvZCA9PT0gJ3VwZGF0ZScpIHtcbiAgICAgIGlmIChldmVudC50eXBlID09PSAnZW50aXR5Jykge1xuICAgICAgICBpZiAoZXZlbnQubmFtZSA9PT0gJ2FyY2hpdmUnKSB7XG4gICAgICAgICAgdGhpcy5fY29uZmlndXJlVGFibGUodHJ1ZSkudGhlbigoKSA9PiB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChldmVudC50eXBlID09PSAnZmllbGQnICYmIGV2ZW50Lm5hbWUgPT09ICdwYXRjaCcpIHtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUucmVmcmVzaCA9IHRydWU7XG4gICAgICAgIHRoaXMuY29yZS5wYXJhbXMucmVmcmVzaCA9IHRydWU7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChldmVudC5tZXRob2QgPT09ICdyZWFkJykge1xuICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdkaWFsb2cnKSB7XG4gICAgICAgIGlmIChldmVudC5uYW1lID09PSAnY2xvc2UnKSB7XG4gICAgICAgICAgdGhpcy5jb3JlLnJlcG8uY2xlYXJDYWNoZSgndGFibGUnLCAnZGF0YScsIGBQb3BFbnRpdHlMaXN0Q29tcG9uZW50OmNydWRFdmVudEhhbmRsZXJgKTtcbiAgICAgICAgICB0aGlzLl9jb25maWd1cmVUYWJsZSgpLnRoZW4oKCkgPT4gdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUSGUgZmlsdGVyIGJhciBuZWVkcyB0byBiZSBjb25maWd1cmVkIGZvciB0aGlzIHNwZWNpZmljIGVudGl0eVxuICAgKlxuICAgKi9cbiAgcHJvdGVjdGVkIF9jb25maWd1cmVGaWx0ZXJCYXIoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICAvLyByZXR1cm4gdGhpcy5zcnYuZmlsdGVyLnNldEFjdGl2ZShmYWxzZSk7XG4gICAgICBpZiAoK3RoaXMuY29yZS5yZXBvLm1vZGVsLnRhYmxlLmZpbHRlci5hY3RpdmUpIHtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUuZmlsdGVyID0gdHJ1ZTtcblxuICAgICAgICAvLyB0aGlzLnNydi5maWx0ZXIuc2V0QXJjaGl2ZWQodGhpcy5kb20uc3RhdGUuc2hvd0FyY2hpdmVkKTtcbiAgICAgICAgdGhpcy5zcnYuZmlsdGVyLnNldFZpZXcodGhpcy5jb3JlLnJlcG8ubW9kZWwudGFibGUuZmlsdGVyLnZpZXcpO1xuICAgICAgICB0aGlzLnNydi5maWx0ZXIuc2V0QWN0aXZlKHRydWUpO1xuXG4gICAgICAgIHRoaXMuZG9tLnNldFN1YnNjcmliZXIoJ2ZpbHRlcnMnLCB0aGlzLnNydi5maWx0ZXIuZXZlbnQuYnViYmxlLnN1YnNjcmliZSgoZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSkgPT4ge1xuICAgICAgICAgIHRoaXMuX2ZpbHRlckV2ZW50SGFuZGxlcihldmVudCk7XG4gICAgICAgIH0pKTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNydi5maWx0ZXIuc2V0QWN0aXZlKGZhbHNlKTtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUuZmlsdGVyID0gZmFsc2U7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYSB0YWJsZSBjb25maWcgdGhhdCB3aWxsIGJlIHVzZWQgYnkgdGhlIG5lc3RlZCB2aWV3IGNvbXBvbmVudFxuICAgKiBAcGFyYW0gcmVzZXRcbiAgICpcbiAgICovXG4gIHByb3RlY3RlZCBfY29uZmlndXJlVGFibGUocmVzZXQgPSBmYWxzZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPihhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKCF0aGlzLnRhYmxlLmNvbmZpZykge1xuICAgICAgICBjb25zdCB0YWJsZURhdGEgPSA8YW55PmF3YWl0IHRoaXMuX2dldFRhYmxlRGF0YShyZXNldCk7XG4gICAgICAgIGlmIChJc0FycmF5KHRhYmxlRGF0YS5kYXRhLCB0cnVlKSkge1xuICAgICAgICAgIHRoaXMuYXNzZXQuYmx1ZXByaW50RGF0YSA9IHRhYmxlRGF0YS5kYXRhWzBdO1xuICAgICAgICAgIHRoaXMuYXNzZXQuYmx1ZXByaW50ID0gdGFibGVEYXRhLmRhdGFbMF07XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgdGhpcy5fZ2V0VGFibGVJbnRlcmZhY2UoKTtcbiAgICAgICAgdGhpcy50YWJsZS5jb25maWcgPSBuZXcgVGFibGVDb25maWcoey4uLnRoaXMuYXNzZXQudGFibGVJbnRlcmZhY2UsIC4uLnRhYmxlRGF0YX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50YWJsZS5jb25maWcubG9hZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2dldFRhYmxlRGF0YSgpLnRoZW4oYXN5bmMgKHJlc3VsdDogeyBkYXRhOiBFbnRpdHlbXSB9KSA9PiB7XG4gICAgICAgICAgaWYgKElzQXJyYXkocmVzdWx0LmRhdGEsIHRydWUpKSB7XG4gICAgICAgICAgICB0aGlzLmFzc2V0LmJsdWVwcmludERhdGEgPSByZXN1bHQuZGF0YVswXTtcbiAgICAgICAgICAgIHRoaXMuYXNzZXQuYmx1ZXByaW50ID0gcmVzdWx0LmRhdGFbMF07XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudGFibGUuY29uZmlnLmJ1dHRvbnMgPSB0aGlzLl9idWlsZFRhYmxlQnV0dG9ucygpO1xuICAgICAgICAgIGF3YWl0IFNsZWVwKDEwKTtcbiAgICAgICAgICBpZiAocmVzZXQgJiYgdHlwZW9mIHRoaXMudGFibGUuY29uZmlnLnJlc2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLmNvbmZpZy5yZXNldChyZXN1bHQuZGF0YSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy50YWJsZS5jb25maWcudXBkYXRlRGF0YSA9PT0gJ2Z1bmN0aW9uJykgdGhpcy50YWJsZS5jb25maWcudXBkYXRlRGF0YShyZXN1bHQuZGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudGFibGUuY29uZmlnLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLmRvbS5zdGF0ZS5yZWZyZXNoID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy5jb3JlLnBhcmFtcy5yZWZyZXNoID0gZmFsc2U7XG5cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEFsbG93cyByb3V0ZSB0byBoYXZlIGEgcmVzb2x2YWJsZSBzeW50YXhcbiAgICpcbiAgICovXG4gIHByb3RlY3RlZCBfdHJhbnNmb3JtUm91dGVFeHRlbnNpb24oKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoIUlzT2JqZWN0KHRoaXMuZXh0ZW5zaW9uKSkgdGhpcy5leHRlbnNpb24gPSB7fTtcbiAgICAgIGlmIChJc1N0cmluZyh0aGlzLmV4dGVuc2lvbi5nb1RvVXJsLCB0cnVlKSkge1xuICAgICAgICB0aGlzLmV4dGVuc2lvbi5nb1RvVXJsID0gUGFyc2VMaW5rVXJsKHRoaXMuZXh0ZW5zaW9uLmdvVG9VcmwsIHRoaXMuY29yZS5wYXJhbXMsIFsnOmlkJ10pO1xuICAgICAgfVxuICAgICAgaWYgKElzT2JqZWN0KHRoaXMuZXh0ZW5zaW9uLnRhYmxlLCB0cnVlKSkge1xuICAgICAgICBpZiAodGhpcy5leHRlbnNpb24udGFibGUucm91dGUpIHtcbiAgICAgICAgICB0aGlzLmV4dGVuc2lvbi50YWJsZS5yb3V0ZSA9IFBhcnNlTGlua1VybCh0aGlzLmV4dGVuc2lvbi50YWJsZS5yb3V0ZSwgdGhpcy5jb3JlLnBhcmFtcywgWyc6aWQnXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgdGFibGUgY29uZmlnIGludGVyZmFjZSB0byBwcm9kdWNlIGEgY29uZmlnXG4gICAqIEBwYXJhbSByb3dcbiAgICpcbiAgICovXG4gIHByb3RlY3RlZCBfZ2V0VGFibGVJbnRlcmZhY2UoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIC8vIHRoaXMubG9hZGluZyA9IHRydWU7XG4gICAgICAvLyBDbGVhciBhbnkgc2Vzc2lvbiBmb3IgcHJldmlvdXMgdmlld2luZyBoaXN0b3J5XG4gICAgICBpZiAoSXNPYmplY3QodGhpcy5hc3NldC50YWJsZUludGVyZmFjZSwgdHJ1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCB0aGlzLl9nZXREZWZhdWx0RmllbGRLZXlzKCk7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRDb2x1bW5zID0gPERpY3Rpb25hcnk8YW55Pj5hd2FpdCB0aGlzLl9nZXREZWZhdWx0Q29sdW1ucygpO1xuICAgICAgICBsZXQgdXNlckNvbHVtbnM7XG4gICAgICAgIGlmIChJc09iamVjdCh0aGlzLmNvcmUucHJlZmVyZW5jZSwgWyd0YWJsZSddKSAmJiBJc09iamVjdCh0aGlzLmNvcmUucHJlZmVyZW5jZS50YWJsZS5jb2x1bW5zLCB0cnVlKSkge1xuICAgICAgICAgIHVzZXJDb2x1bW5zID0gdGhpcy5jb3JlLnByZWZlcmVuY2UudGFibGUuY29sdW1ucztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdXNlckNvbHVtbnMpIHVzZXJDb2x1bW5zID0gZGVmYXVsdENvbHVtbnM7XG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2RlZmF1bHRDb2x1bW5zJywgZGVmYXVsdENvbHVtbnMpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZygndXNlckNvbHVtbnMnLCB1c2VyQ29sdW1ucyk7XG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2dldCcsIHRoaXMuYXNzZXQuc2VhcmNoVmFsdWVTZXNzaW9uUGF0aCk7XG5cbiAgICAgICAgbGV0IGJhc2VBcHAgPSAodGhpcy5jb3JlLnBhcmFtcy5hcHAgPyB0aGlzLmNvcmUucGFyYW1zLmFwcCA6IFBvcEhyZWYpO1xuICAgICAgICBiYXNlQXBwID0gYmFzZUFwcCA/IGAvJHtiYXNlQXBwfS9gIDogJy8nO1xuXG4gICAgICAgIGxldCB0YWJsZUludGVyZmFjZTogVGFibGVJbnRlcmZhY2UgPSB7XG4gICAgICAgICAgaWQ6IHRoaXMuY29yZS5wYXJhbXMuaW50ZXJuYWxfbmFtZSxcbiAgICAgICAgICBpbnRlcm5hbF9uYW1lOiB0aGlzLmNvcmUucGFyYW1zLmludGVybmFsX25hbWUsXG4gICAgICAgICAgcGFnaW5hdG9yOiB0cnVlLFxuICAgICAgICAgIGhlaWdodDogdGhpcy5fZ2V0VGFibGVIZWlnaHQoKSxcbiAgICAgICAgICBidXR0b25zOiB0aGlzLl9idWlsZFRhYmxlQnV0dG9ucygpLFxuICAgICAgICAgIHJvdXRlOiBgJHtiYXNlQXBwfSR7R2V0Um91dGVBbGlhcyh0aGlzLmNvcmUucGFyYW1zLmludGVybmFsX25hbWUpfS86aWQvZ2VuZXJhbGAsXG4gICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgc2VhcmNoVmFsdWU6IEdldFNlc3Npb25TaXRlVmFyKHRoaXMuYXNzZXQuc2VhcmNoVmFsdWVTZXNzaW9uUGF0aCwgJycpLFxuICAgICAgICAgIG9wdGlvbnM6IG5ldyBUYWJsZU9wdGlvbnNDb25maWcoey4uLntkZWZhdWx0T3B0aW9uczoge2NvbHVtbkRlZmluaXRpb25zOiBkZWZhdWx0Q29sdW1uc319LCAuLi50aGlzLmNvcmUucmVwby5tb2RlbC50YWJsZS5wZXJtaXNzaW9ufSksXG4gICAgICAgICAgY29sdW1uRGVmaW5pdGlvbnM6IHVzZXJDb2x1bW5zXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuZXh0ZW5zaW9uLmdvVG9VcmwpIHRoaXMuZXh0ZW5zaW9uLmdvVG9VcmwgPSBQYXJzZU1vZGVsVmFsdWUodGhpcy5leHRlbnNpb24uZ29Ub1VybCwgdGhpcy5jb3JlLCB0cnVlKTtcbiAgICAgICAgaWYgKHRoaXMuZXh0ZW5zaW9uLnRhYmxlICYmIHRoaXMuZXh0ZW5zaW9uLnRhYmxlLnJvdXRlKSB0aGlzLmV4dGVuc2lvbi50YWJsZS5yb3V0ZSA9IFBhcnNlTW9kZWxWYWx1ZSh0aGlzLmV4dGVuc2lvbi50YWJsZS5yb3V0ZSwgdGhpcy5jb3JlLCB0cnVlKTtcbiAgICAgICAgaWYgKHRoaXMuZXh0ZW5zaW9uLnRhYmxlICYmIE9iamVjdC5rZXlzKHRoaXMuZXh0ZW5zaW9uLnRhYmxlKS5sZW5ndGgpIHRhYmxlSW50ZXJmYWNlID0gey4uLnRhYmxlSW50ZXJmYWNlLCAuLi50aGlzLmV4dGVuc2lvbi50YWJsZX07XG4gICAgICAgIGlmIChJc09iamVjdCh0aGlzLmNvcmUucHJlZmVyZW5jZSwgWyd0YWJsZSddKSkge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd0aGlzLmNvcmUucHJlZmVyZW5jZS50YWJsZS5vcHRpb25zJywgdGhpcy5jb3JlLnByZWZlcmVuY2UudGFibGUub3B0aW9ucyk7XG4gICAgICAgICAgaWYgKHRoaXMuY29yZS5wcmVmZXJlbmNlLnRhYmxlLm9wdGlvbnMpIHtcbiAgICAgICAgICAgIHRhYmxlSW50ZXJmYWNlID0gey4uLnRhYmxlSW50ZXJmYWNlLCAuLi50aGlzLmNvcmUucHJlZmVyZW5jZS50YWJsZS5vcHRpb25zfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hc3NldC50YWJsZUludGVyZmFjZSA9IHRhYmxlSW50ZXJmYWNlO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgdGFibGUgd2lsbCBoYXZlIGEgc2V0IG9mIGFjdGlvbnMgdGhhdCBpdCB3aWxsIG5lZWQgYSBidXR0b24gc2V0IHRvIGFjaGlldmVcbiAgICpcbiAgICovXG4gIHByb3RlY3RlZCBfYnVpbGRUYWJsZUJ1dHRvbnMoKSB7XG4gICAgbGV0IGJ1dHRvbnMgPSBbXTtcbiAgICBpZiAoSXNPYmplY3QodGhpcy5jb3JlLnJlcG8ubW9kZWwudGFibGUuYnV0dG9uLCB0cnVlKSkge1xuICAgICAgYnV0dG9ucyA9IHRoaXMudGFibGUuYnV0dG9ucy5maWx0ZXIoKGJ1dHRvbikgPT4ge1xuICAgICAgICAvLyBpZiggYnV0dG9uLmlkID09PSAnY3VzdG9tJyAmJiAhdGhpcy5jb3JlLnJlcG8ubW9kZWwudGFibGUuYnV0dG9uLmN1c3RvbSApIHJldHVybiBmYWxzZTsgLy8gYWxsb3cgY3VzdG9tIGFjdGlvbnMgdG8gYmUgcGVyZm9ybWVkIG9uIGEgc2V0IG9mIGVudGl0aWVzXG4gICAgICAgIC8vIGlmKCBidXR0b24uaWQgPT09ICdhZHZhbmNlZF9zZWFyY2gnICYmICF0aGlzLmNvcmUucmVwby5tb2RlbC50YWJsZS5idXR0b24uYWR2YW5jZWRfc2VhcmNoICkgcmV0dXJuIGZhbHNlOyAvLyBhbGxvdyBmb3IgYSBhZHZhbmNlZCBzZWFyY2ggb24gdGhlIGVudGl0eSBkYXRhIHNldFxuICAgICAgICBpZiAoYnV0dG9uLmlkID09PSAnYXJjaGl2ZScgJiYgKCF0aGlzLmNvcmUucmVwby5tb2RlbC50YWJsZS5idXR0b24uYXJjaGl2ZWQgfHwgdGhpcy5kb20uc3RhdGUuc2hvd0FyY2hpdmVkKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoYnV0dG9uLmlkID09PSAncmVzdG9yZScgJiYgKCF0aGlzLmNvcmUucmVwby5tb2RlbC50YWJsZS5idXR0b24uYXJjaGl2ZWQgfHwgIXRoaXMuZG9tLnN0YXRlLnNob3dBcmNoaXZlZCkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKGJ1dHRvbi5pZCA9PT0gJ3Nob3dfYWN0aXZlJyAmJiAoIXRoaXMuY29yZS5yZXBvLm1vZGVsLnRhYmxlLmJ1dHRvbi5hcmNoaXZlZCB8fCAhdGhpcy5kb20uc3RhdGUuc2hvd0FyY2hpdmVkKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoYnV0dG9uLmlkID09PSAnc2hvd19hcmNoaXZlZCcgJiYgKCF0aGlzLmNvcmUucmVwby5tb2RlbC50YWJsZS5idXR0b24uYXJjaGl2ZWQgfHwgdGhpcy5kb20uc3RhdGUuc2hvd0FyY2hpdmVkKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoYnV0dG9uLmlkID09PSAnbmV3JyAmJiAhdGhpcy5jb3JlLnJlcG8ubW9kZWwudGFibGUuYnV0dG9uLm5ldykgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoIWJ1dHRvbi5hY2Nlc3NUeXBlKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgaWYgKCF0aGlzLnNydi5lbnRpdHkuY2hlY2tBY2Nlc3ModGhpcy5jb3JlLnBhcmFtcy5pbnRlcm5hbF9uYW1lLCBidXR0b24uYWNjZXNzVHlwZSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnV0dG9ucztcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSBmaWx0ZXIgYmFyIGFuZCB0aGUgdGFibGUgdmlldyBuZWVkIHRvIGJlIGluIHN5bmNcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqXG4gICAqL1xuICBwcm90ZWN0ZWQgX2ZpbHRlckV2ZW50SGFuZGxlcihldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlKSB7XG4gICAgdGhpcy5sb2cuZXZlbnQoYF9maWx0ZXJFdmVudEhhbmRsZXJgLCBldmVudCk7XG4gICAgaWYgKGV2ZW50LnR5cGUgPT09ICdmaWx0ZXInKSB7XG4gICAgICBzd2l0Y2ggKGV2ZW50Lm5hbWUpIHtcbiAgICAgICAgY2FzZSAnY2xlYXInOlxuICAgICAgICBjYXNlICdhcHBseSc6XG4gICAgICAgICAgdGhpcy5zcnYuZW50aXR5LmJ1c3RBbGxDYWNoZSgpO1xuICAgICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoJ3JlY29uZmlndXJlLXRhYmxlJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fY29uZmlndXJlVGFibGUoKS50aGVuKCgpID0+IHRydWUpO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdpbml0JzpcbiAgICAgICAgY2FzZSAnc3RhdGUnOlxuICAgICAgICAgIGlmIChldmVudC5tb2RlbCA9PT0gJ29wZW4nKSB7XG4gICAgICAgICAgICB0aGlzLm9uUmVzZXRIZWlnaHQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVuZGVyIFRoZSBIb29kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJpdmF0ZSBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHJvdXRlIHRvIHNldC9vdmVycmlkZSBzcGVjaWZpYyBzZXR0aW5nc1xuICAgKlxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0Um91dGVFeHRlbnNpb24oKSB7XG4gICAgaWYgKCF0aGlzLmV4dGVuc2lvbikgdGhpcy5leHRlbnNpb24gPSB7fTtcbiAgICBpZiAoIXRoaXMuZXh0ZW5zaW9uLnRhYmxlKSB0aGlzLmV4dGVuc2lvbi50YWJsZSA9IHt9O1xuICAgIGlmICghdGhpcy5leHRlbnNpb24uZ29Ub1VybCkgdGhpcy5leHRlbnNpb24uZ29Ub1VybCA9IG51bGw7XG4gICAgaWYgKHRoaXMucm91dGUuc25hcHNob3QuZGF0YSAmJiBPYmplY3Qua2V5cyh0aGlzLnJvdXRlLnNuYXBzaG90LmRhdGEpLmxlbmd0aCkge1xuICAgICAgT2JqZWN0LmtleXModGhpcy5yb3V0ZS5zbmFwc2hvdC5kYXRhKS5tYXAoKGtleSkgPT4ge1xuICAgICAgICB0aGlzLmV4dGVuc2lvbltrZXldID0gdGhpcy5yb3V0ZS5zbmFwc2hvdC5kYXRhW2tleV07XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuXG4gIHByaXZhdGUgX2dldERlZmF1bHRGaWVsZEtleXMoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoSXNPYmplY3QodGhpcy5hc3NldC5maWVsZEtleXMsIHRydWUpKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jb3JlLnJlcG8uZ2V0Q2FjaGUoJ3RhYmxlJywgJ2ZpZWxkS2V5cycpLnRoZW4oKGZpZWxkS2V5cykgPT4ge1xuICAgICAgICAgIGlmIChJc09iamVjdChmaWVsZEtleXMsIHRydWUpKSB7XG4gICAgICAgICAgICB0aGlzLmFzc2V0LmZpZWxkS2V5cyA9IDxhbnk+ZmllbGRLZXlzO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9zZXRGaWVsZEtleXModGhpcy5hc3NldC5ibHVlcHJpbnQpO1xuXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fc2V0RmllbGRLZXlzKHRoaXMuYXNzZXQuYmx1ZXByaW50KTtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIHByaXZhdGUgX2dldERlZmF1bHRDb2x1bW5zKCk6IFByb21pc2U8RGljdGlvbmFyeTxhbnk+PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPERpY3Rpb25hcnk8YW55Pj4oKHJlc29sdmUpID0+IHtcbiAgICAgIGxldCBkZWZhdWx0Q29sdW1ucyA9IHt9O1xuICAgICAgdGhpcy5jb3JlLnJlcG8uZ2V0Q2FjaGUoJ3RhYmxlJywgJ2NvbHVtbnMnKS50aGVuKChjb2x1bW5zKSA9PiB7XG4gICAgICAgIGlmIChJc09iamVjdChjb2x1bW5zLCB0cnVlKSkge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKGNvbHVtbnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmF1bHRDb2x1bW5zID0ge307XG4gICAgICAgICAgY29uc3QgZmllbGRzID0gSXNPYmplY3RUaHJvd0Vycm9yKHRoaXMuY29yZS5yZXBvLm1vZGVsLmZpZWxkLCB0cnVlLCBgUmVwbyBjb250YWluZWQgbm8gZmllbGQgbW9kZWxgKSA/IHRoaXMuY29yZS5yZXBvLm1vZGVsLmZpZWxkIDogbnVsbDtcbiAgICAgICAgICBpZiAoSXNPYmplY3QodGhpcy5hc3NldC5maWVsZEtleXMsIHRydWUpKSB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyh0aGlzLmFzc2V0LmZpZWxkS2V5cykubWFwKChmaWVsZE5hbWUpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGZpZWxkTmFtZSBpbiBmaWVsZHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWVsZCA9IGZpZWxkc1tmaWVsZE5hbWVdO1xuICAgICAgICAgICAgICAgIGlmIChJc09iamVjdChmaWVsZC5tb2RlbCwgWydyb3V0ZSddKSkge1xuICAgICAgICAgICAgICAgICAgZmllbGQubW9kZWwucm91dGUgPSBQYXJzZU1vZGVsVmFsdWUoZmllbGQubW9kZWwucm91dGUsIHRoaXMuY29yZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChmaWVsZC50YWJsZS52aXNpYmxlKSBkZWZhdWx0Q29sdW1uc1tmaWVsZE5hbWVdID0ge1xuICAgICAgICAgICAgICAgICAgLi4ue1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBmaWVsZC5tb2RlbC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogZmllbGQubW9kZWwubGFiZWwsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgLi4uZmllbGQudGFibGVcblxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnY2FjaGUgcmVkaXJlY3QnKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuYXNzZXQuYmx1ZXByaW50RGF0YSk7XG5cbiAgICAgICAgICAgIC8vIFNldFBvcENhY2hlUmVkaXJlY3RVcmwodGhpcy5zcnYucm91dGVyLnVybCk7XG4gICAgICAgICAgICAvLyB0aGlzLnNydi5yb3V0ZXIubmF2aWdhdGVCeVVybCgnc3lzdGVtL2NhY2hlL2NsZWFyJyx7c2tpcExvY2F0aW9uQ2hhbmdlOnRydWV9KTtcblxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoSXNPYmplY3QoZGVmYXVsdENvbHVtbnMsIHRydWUpKSB7XG4gICAgICAgICAgICB0aGlzLmNvcmUucmVwby5zZXRDYWNoZSgndGFibGUnLCAnY29sdW1ucycsIGRlZmF1bHRDb2x1bW5zLCA2MCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoZGVmYXVsdENvbHVtbnMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHNldHMgdGhlIGhlaWdodCBvZiB0aGUgY2hpbGQgdmlld1xuICAgKlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0VGFibGVIZWlnaHQoKSB7XG4gICAgbGV0IGhlaWdodCA9IHRoaXMuZG9tLmhlaWdodC5pbm5lcjtcbiAgICBpZiAodGhpcy5zcnYuZmlsdGVyLmlzQWN0aXZlKCkpIHtcbiAgICAgIGhlaWdodCAtPSAyMDtcbiAgICB9XG4gICAgcmV0dXJuIGhlaWdodDtcbiAgfVxufVxuXG4iXX0=