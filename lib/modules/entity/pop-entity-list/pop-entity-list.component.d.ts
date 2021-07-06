import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableButtonInterface, TableConfig, TableInterface } from '../../base/pop-table/pop-table.model';
import { MainSpinner } from '../../base/pop-indicators/pop-indicators.model';
import { FieldItemGroupConfig } from '../../base/pop-field-item-group/pop-field-item-group.model';
import { PopTableComponent } from '../../base/pop-table/pop-table.component';
import { PopEntityUtilPortalService } from '../services/pop-entity-util-portal.service';
import { PopDomService } from '../../../services/pop-dom.service';
import { AppGlobalInterface, DataFactory, Dictionary, Entity, EntityExtendInterface, PopBaseEventInterface } from '../../../pop-common.model';
import { PopExtendComponent } from '../../../pop-extend.component';
import { MatDialog } from '@angular/material/dialog';
import { PopEntityEventService } from '../services/pop-entity-event.service';
import { PopEntityActionService } from '../services/pop-entity-action.service';
import { PopPipeService } from '../../../services/pop-pipe.service';
import { PopEntityService } from '../services/pop-entity.service';
import { PopCacFilterBarService } from '../../app/pop-cac-filter/pop-cac-filter.service';
import { PopEntityUtilParamService } from '../services/pop-entity-util-param.service';
export declare class PopEntityListComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected route: ActivatedRoute;
    protected _domRepo: PopDomService;
    APP_GLOBAL: AppGlobalInterface;
    internal_name: string;
    extension: EntityExtendInterface;
    list: PopTableComponent;
    dataFactory: DataFactory;
    name: string;
    readonly table: {
        data: Entity[];
        buttons: TableButtonInterface[];
        interface: TableInterface;
        spinner: MainSpinner;
        config: TableConfig;
    };
    protected srv: {
        action: PopEntityActionService;
        dialog: MatDialog;
        entity: PopEntityService;
        events: PopEntityEventService;
        filter: PopCacFilterBarService;
        pipe: PopPipeService;
        param: PopEntityUtilParamService;
        portal: PopEntityUtilPortalService;
        router: Router;
        tab: any;
    };
    ui: {
        actionModal: FieldItemGroupConfig;
    };
    protected asset: {
        blueprintData: Dictionary<string>;
        fieldKeys: Dictionary<1>;
        blueprint: Dictionary<any>;
        transformations: Dictionary<any>;
        tableInterface: TableInterface;
        tabMenuSessionPath: string;
        showArchivedSessionPath: string;
        searchValueSessionPath: string;
    };
    constructor(el: ElementRef, route: ActivatedRoute, _domRepo: PopDomService, APP_GLOBAL: AppGlobalInterface);
    /**
     * This component will display a list of entities that the user can interact with
     */
    ngOnInit(): void;
    /**
     * Trigger the table to reset itself
     */
    onResetTable(): void;
    /**
     * Trigger the table to reset itself
     */
    onResetHeight(): void;
    /**
     * A table will generate a slew of event and action triggers
     * @param event
     */
    onTableEvent(event: PopBaseEventInterface): void;
    /**
     * This is exploratory??? Idea is to pop a modal to make the user create an advanced search before we fetch the data for the table
     */
    onViewAdvancedSearch(): void;
    /**
     * A user can click on a row in a table to navigate the a view for that entity
     * @param row
     */
    onTableRowClicked(row: any): void;
    /**
     * A user can click on a specific column of a table and get a default action
     * @param data
     */
    onTableColumnClicked(data: any): void;
    /**
     * A user can click a link to view a specific entity details in a modal
     * @param internal_name
     * @param id
     */
    onViewEntityPortal(internal_name: string, id: number): void;
    /**
     * A user can save custom settings for how they want to view this table
     * @param options
     */
    onSaveOptions(options: any): void;
    /**
     * A user can reset their preferences for this table to default
     */
    onOptionsReset(): void;
    /**
     * A user can archive a list of entities
     * @param ids
     * @param archive
     */
    onArchiveButtonClicked(ids: any, archive: boolean): void;
    /**
     * The user can click on a btn to show active, archived, or both?
     */
    onShowArchivedButtonClicked(): void;
    /**
     * This will open a modal to create a new entity when the user clicks on the new button
     */
    onActionButtonClicked(actionName: string): void;
    /**
     * When the modal for creating a new entity is closed, the config needs to be cleared
     */
    onActionModalClose(): void;
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy(): void;
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
    protected _setCoreConfig(): Promise<boolean>;
    /**
     * Setup basic config
     * Intended to be overridden
     * @private
     */
    protected _setConfig(): Promise<boolean>;
    /**
     * Attach a handler to handle an crud events
     * @private
     */
    protected _setCrudHandler(): Promise<boolean>;
    /**
     * Determine the height of the table
     * @private
     */
    protected _setHeight(): Promise<boolean>;
    /**
     * Manage the sessionStorage settings
     * @private
     */
    protected _setSessionSettings(): Promise<boolean>;
    /**
     * Determine how to fetch the data for this table
     * @param update
     * @private
     */
    protected _fetchData(update?: boolean): Promise<any>;
    protected _transformData(data: any[]): any[];
    /**
     * Cleans the row data to remove any unwanted fields
     * @param row
     * @private
     */
    protected _setFieldKeys(row: Dictionary<any>): void;
    /**
     * Apply the transformations to the dataset
     * @private
     */
    protected _setFieldTableTransformations(): void;
    /**
     * A method that preps entity list data for tables
     * @param dataSet
     * @param fieldMap
     */
    protected _prepareTableData(dataSet: Array<any>): any[];
    /**
     * Retrieves the data set that this view will represent
     * @param hardReset
     *
     */
    protected _getTableData(hardReset?: boolean): Promise<unknown>;
    /**
     * Trigger the table to re-fetch the data
     * @param seconds
     * @private
     */
    protected _triggerDataFetch(seconds?: number): void;
    /**
     * The table need to know when new entities are created or update so that they can be updated in its view
     * @param event
     *
     */
    protected _crudEventHandler(event: PopBaseEventInterface): void;
    /**
     * THe filter bar needs to be configured for this specific entity
     *
     */
    protected _configureFilterBar(): Promise<boolean>;
    /**
     * Generates a table config that will be used by the nested view component
     * @param reset
     *
     */
    protected _configureTable(reset?: boolean): Promise<boolean>;
    /**
     * Allows route to have a resolvable syntax
     *
     */
    protected _transformRouteExtension(): Promise<boolean>;
    /**
     * Generates a table config interface to produce a config
     * @param row
     *
     */
    protected _getTableInterface(): Promise<boolean>;
    /**
     * A table will have a set of actions that it will need a button set to achieve
     *
     */
    protected _buildTableButtons(): any[];
    /**
     * The filter bar and the table view need to be in sync
     * @param event
     *
     */
    protected _filterEventHandler(event: PopBaseEventInterface): void;
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
    private _setRouteExtension;
    private _getDefaultFieldKeys;
    private _getDefaultColumns;
    /**
     * Helper function that sets the height of the child view
     *
     */
    private _getTableHeight;
}
