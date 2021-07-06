import {Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
  TableButtonInterface,
  TableConfig,
  TableInterface,
  TableOptionsConfig
} from '../../base/pop-table/pop-table.model';
import {MainSpinner} from '../../base/pop-indicators/pop-indicators.model';
import {FieldItemGroupConfig} from '../../base/pop-field-item-group/pop-field-item-group.model';
import {PopTableComponent} from '../../base/pop-table/pop-table.component';
import {PopEntityAdvancedSearchComponent} from './pop-entity-advanced-search/pop-entity-advanced-search.component';
import {PopEntityUtilPortalService} from '../services/pop-entity-util-portal.service';
import {PopDomService} from '../../../services/pop-dom.service';
import {
  AppGlobalInterface,
  CoreConfig, DataFactory,
  DataFilter,
  Dictionary,
  Entity,
  EntityExtendInterface,
  PopBaseEventInterface,
  PopBusiness,
  PopHref,
  PopTemplate,
  ServiceInjector,
} from '../../../pop-common.model';
import {PopExtendComponent} from '../../../pop-extend.component';
import {MatDialog} from '@angular/material/dialog';
import {PopEntityEventService} from '../services/pop-entity-event.service';
import {ParseLinkUrl, ParseModelValue} from '../pop-entity-utility';
import {PopEntityActionService} from '../services/pop-entity-action.service';
import {PopPipeService} from '../../../services/pop-pipe.service';
import {PopEntityService} from '../services/pop-entity.service';
import {
  CleanObject,
  DynamicSort, GetRouteAlias, GetSessionSiteVar,
  IsArray, IsCallableFunction,
  IsObject,
  IsObjectThrowError,
  IsString,
  SetSessionSiteVar, Sleep,
  StorageGetter,
  TitleCase
} from '../../../pop-common-utility';
import {PopCacFilterBarService} from '../../app/pop-cac-filter/pop-cac-filter.service';
import {PopEntityUtilParamService} from '../services/pop-entity-util-param.service';
import {forkJoin} from 'rxjs';


@Component({
  selector: 'lib-pop-entity-list',
  styleUrls: ['./pop-entity-list.component.scss'],
  templateUrl: './pop-entity-list.component.html',
  providers: [PopDomService]
})
export class PopEntityListComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() internal_name: string;
  @Input() extension: EntityExtendInterface;
  @ViewChild('list') list: PopTableComponent;
  @Input() dataFactory: DataFactory = null;

  public name = 'PopEntityListComponent';


  public readonly table = {
    data: <Entity[]>[],
    buttons: <TableButtonInterface[]>[
      // { id: 'custom', name: 'Custom', accessType: 'can_read', requireSelected: true },
      // { id: 'advanced_search', name: 'Advanced Search', accessType: 'can_read', requireSelected: false },
      {id: 'archive', name: 'Archive', accessType: 'can_create', requireSelected: true},
      {id: 'restore', name: 'Activate', accessType: 'can_create', requireSelected: true},
      {id: 'show_archived', name: 'Show Archived', accessType: 'can_read', requireSelected: false},
      {id: 'show_active', name: 'Show Active', accessType: 'can_read', requireSelected: false},
      {id: 'new', name: 'New', accessType: 'can_create', requireSelected: false},
    ],
    interface: <TableInterface>undefined,
    spinner: <MainSpinner>{diameter: 0, strokeWidth: 0},
    config: <TableConfig>null,
  };

  protected srv = {
    action: <PopEntityActionService>ServiceInjector.get(PopEntityActionService),
    dialog: <MatDialog>ServiceInjector.get(MatDialog),
    entity: <PopEntityService>ServiceInjector.get(PopEntityService),
    events: <PopEntityEventService>ServiceInjector.get(PopEntityEventService),
    filter: <PopCacFilterBarService>ServiceInjector.get(PopCacFilterBarService),
    pipe: <PopPipeService>ServiceInjector.get(PopPipeService),
    param: <PopEntityUtilParamService>ServiceInjector.get(PopEntityUtilParamService),
    portal: <PopEntityUtilPortalService>ServiceInjector.get(PopEntityUtilPortalService),
    router: <Router>ServiceInjector.get(Router),
    tab: undefined
  };

  public ui = {
    actionModal: <FieldItemGroupConfig>undefined,
  };

  protected asset = {
    blueprintData: <Dictionary<string>>{},
    fieldKeys: <Dictionary<1>>undefined,
    blueprint: <Dictionary<any>>undefined,
    transformations: <Dictionary<any>>undefined,
    tableInterface: <TableInterface>undefined,
    tabMenuSessionPath: '',
    showArchivedSessionPath: '',
    searchValueSessionPath: ''
  };


  constructor(
    public el: ElementRef,
    protected route: ActivatedRoute,
    protected _domRepo: PopDomService,
    @Inject('APP_GLOBAL') public APP_GLOBAL: AppGlobalInterface,
  ) {
    super();

    this.dom.configure = (): Promise<boolean> => {
      // this component set the outer height boundary of this view
      return new Promise(async (resolve) => {
        // Ensure that a CoreConfig exists for this component
        await this.APP_GLOBAL.isVerified();
        await this._setCoreConfig();

        this.id = this.core.params.internal_name;
        // #1: Enforce a CoreConfig
        this.core = IsObjectThrowError(this.core, true, `${this.name}:configureDom: - this.core`) ? this.core : <CoreConfig>{};
        await forkJoin([
          this._transformRouteExtension(), // pull in settings passed in through the route
          this._setConfig(), // validate the passed arguments
          this._setSessionSettings(), // determine when and what settings should be sessionStorage
          this._configureFilterBar(), // Enable/Disable the filter bar
          this._setCrudHandler(), // Determine cache actions on crud operations
          this._configureTable(), // Build out the table config for the view
          this._setHeight(), // account for the filter bar , and determine the height of this table try to fill all vertical height
        ]);

        return resolve(true);
      });
    };

    /**
     * This function will call after the dom registration
     */
    this.dom.proceed = (): Promise<boolean> => {
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
        if (this.table.config && typeof this.table.config.setLayout === 'function') this.table.config.setLayout(this._getTableHeight());
      });
    }, 0);
  }


  /**
   * Trigger the table to reset itself
   */
  onResetHeight() {
    this._setHeight().then(() => {
      if (this.table.config && typeof this.table.config.setHeight === 'function') this.table.config.setHeight(this._getTableHeight());
    });
  }


  /**
   * A table will generate a slew of event and action triggers
   * @param event
   */
  onTableEvent(event: PopBaseEventInterface) {
//     console.log( this.name, event );

    if (event.type === 'table') {
      let ids;
      if (event && Array.isArray(event.data)) {
        ids = event.data.map((row) => row.id).join();
      }
      switch (event.name) {
        case 'search':
          if (IsString(this.asset.searchValueSessionPath)) SetSessionSiteVar(this.asset.searchValueSessionPath, event.data);
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
            this.dom.setTimeout('build-columns', async () => {
              this._setFieldKeys(event.data);
              const columns = await this._getDefaultColumns();
              // this.table.config.columnDefinitions=columns;
              this.table.config.updateColumnDefinitions(columns);
            }, 0);
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
          data: {test: 'yo yo'}
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
  onViewEntityPortal(internal_name: string, id: number) {
    if (!this.dom.state.blockModal && this.srv.dialog.openDialogs.length == 0) {
      this.dom.state.blockModal = true;
      if (internal_name && id) {
        this.srv.portal.view(internal_name, id).then((changed: boolean) => {
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
      }
    ));
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
        } else {
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
  onArchiveButtonClicked(ids, archive: boolean) {
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
        if (typeof this.table.config.clearSelected === 'function') this.table.config.clearSelected();
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
      if (typeof this.table.config.clearSelected === 'function') this.table.config.clearSelected();
      this.table.config.buttons = this._buildTableButtons();
      if (IsString(this.asset.showArchivedSessionPath)) SetSessionSiteVar(this.asset.showArchivedSessionPath, this.dom.state.showArchived);
    }, 0);
  }


  /**
   * This will open a modal to create a new entity when the user clicks on the new button
   */
  onActionButtonClicked(actionName: string) {
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
      this.dom.setTimeout(`do-action`, async () => {
        await this.srv.action.do(this.core, actionName, this.extension);
      }, 0);
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
  protected _setCoreConfig(): Promise<boolean> {
    return new Promise(async (resolve) => {
      // #1: Grab Route Extension settings
      this._setRouteExtension();
      if (!this.internal_name) this.internal_name = this.srv.entity.getRouteInternalName(this.route, this.extension);

      if (!IsObject(this.core, true)) {
        this.srv.entity.getCoreConfig(this.internal_name, 0, this.dom.repo).then((core: CoreConfig) => {
          this.core = core;
          return resolve(true);
        });
      } else {
        return resolve(true);
      }
    });
  }


  /**
   * Setup basic config
   * Intended to be overridden
   * @private
   */
  protected _setConfig(): Promise<boolean> {
    return new Promise(async (resolve) => {
      return resolve(true);
    });
  }


  /**
   * Attach a handler to handle an crud events
   * @private
   */
  protected _setCrudHandler(): Promise<boolean> {
    return new Promise(async (resolve) => {
      this.dom.setSubscriber('entity', this.srv.events.events.subscribe((event) => this._crudEventHandler(event)));
      return resolve(true);
    });
  }


  /**
   * Determine the height of the table
   * @private
   */
  protected _setHeight(): Promise<boolean> {
    return new Promise(async (resolve) => {
      // Determine height of the table - have to account if filter bar is enabled
      const menu = 48;
      const filterHeight = this.dom.state.filter ? this.srv.filter.getHeight() : 25;
      const overhead = 25;
      const defaultHeight = window.innerHeight - menu - filterHeight;
      this.dom.setHeight(defaultHeight, overhead);

      return resolve(true);
    });
  }


  /**
   * Manage the sessionStorage settings
   * @private
   */
  protected _setSessionSettings(): Promise<boolean> {
    return new Promise(async (resolve) => {
      // Set session path for variables
      this.asset.tabMenuSessionPath = `Entity.${TitleCase(this.core.params.internal_name)}.Menu`;
      this.asset.showArchivedSessionPath = `Business.${PopBusiness.id}.Entity.${TitleCase(this.core.params.internal_name)}.Table.Main.showArchived`;
      this.asset.searchValueSessionPath = `Business.${PopBusiness.id}.Entity.${TitleCase(this.core.params.internal_name)}.Table.Main.searchValue`;

      // Set any session variables
      SetSessionSiteVar(this.asset.tabMenuSessionPath, null); // remove any menu session data for this entity
      this.dom.state.showArchived = GetSessionSiteVar(this.asset.showArchivedSessionPath, false);

      return resolve(true);
    });
  }


  /**
   * Determine how to fetch the data for this table
   * @param update
   * @private
   */
  protected _fetchData(update = false): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const params = {};
      if (!update) this.dom.setTimeout(`lazy-load-fresh-data`, null);
      if (IsObject(this.table, ['config']) && IsObject(this.table.config, ['clearSelected']) && typeof this.table.config.clearSelected === 'function') this.table.config.clearSelected();
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
      } else {
        this.core.repo.getEntities({archived: (this.dom.state.showArchived ? 1 : 0), ...params}).then((data: Entity[]) => {
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
    });
  }


  protected _transformData(data: any[]) {
    if (!(IsObject(this.asset.fieldKeys, true))) this._setFieldKeys(data[0]);
    if (!(IsObject(this.asset.transformations, true))) this._setFieldTableTransformations();
    data = this._prepareTableData(data);
    this.core.repo.setCache('table', 'data', data, 5);

    return data;
  }


  /**
   * Cleans the row data to remove any unwanted fields
   * @param row
   * @private
   */
  protected _setFieldKeys(row: Dictionary<any>): void {
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
          } else if (IsObject(row[key], ['id', 'name'])) {
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
  protected _setFieldTableTransformations(): void {
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
  protected _prepareTableData(dataSet: Array<any>) {
    this.log.info(`_prepareTableData: this.asset.fieldKeys`, this.asset.fieldKeys);
    const Decorator = StorageGetter(this.core, ['repo', 'model', 'decorator'], null);
    const Filter = <DataFilter>StorageGetter(this.core, ['repo', 'model', 'filter'], null);
    const appendlist = StorageGetter(this.core.repo, ['model', 'table', 'appendlist'], {});
    if (IsArray(dataSet, true)) {
      if (Filter) dataSet = dataSet.filter(Filter);
      dataSet.sort(DynamicSort('id', 'desc'));
      return dataSet.map(row => {
        row = Object.keys(row).reduce((obj, k) => {
          if (k in this.asset.fieldKeys) obj[k] = row[k];
          return obj;
        }, {});
        if (IsObject(appendlist, true)) {
          Object.keys(appendlist).map((name: string) => {
            const value = appendlist[name];
            row[name] = ParseModelValue(value, row);
          });
        }
        if (Decorator) row = Decorator(this.core, row);
        return this.srv.pipe.transformObjectValues(row, this.asset.transformations, this.core);
      });
    } else {
      return dataSet;
    }
  }


  /**
   * Retrieves the data set that this view will represent
   * @param hardReset
   *
   */
  protected _getTableData(hardReset = false) {
    return new Promise((resolve, reject) => {
      if (this.dom.delay.data) clearTimeout(this.dom.delay.data);
      this.core.repo.getCache('table', 'data').then((cache) => {
        if (IsArray(cache, true)) {
          this._triggerDataFetch();
          return resolve({data: cache});
        } else {
          this._fetchData(false).then((data) => {
            return resolve({data: data});
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
  protected _triggerDataFetch(seconds: number = 5) {
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
  protected _crudEventHandler(event: PopBaseEventInterface) {
    this.core.repo.clearCache('table', null, `PopEntityListComponent:crudEventHandler`);
    this.core.repo.clearCache('entity', null, `PopEntityListComponent:crudEventHandler`);
    if (event.method === 'create' || event.method === 'delete') {
      this.dom.state.refresh = true;
      this.core.params.refresh = true;
    } else if (event.method === 'update') {
      if (event.type === 'entity') {
        if (event.name === 'archive') {
          this._configureTable(true).then(() => true);
        }
      } else if (event.type === 'field' && event.name === 'patch') {
        this.dom.state.refresh = true;
        this.core.params.refresh = true;
      }
    } else if (event.method === 'read') {
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
  protected _configureFilterBar(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      // return this.srv.filter.setActive(false);
      if (+this.core.repo.model.table.filter.active) {
        this.dom.state.filter = true;

        // this.srv.filter.setArchived(this.dom.state.showArchived);
        this.srv.filter.setView(this.core.repo.model.table.filter.view);
        this.srv.filter.setActive(true);

        this.dom.setSubscriber('filters', this.srv.filter.event.bubble.subscribe((event: PopBaseEventInterface) => {
          this._filterEventHandler(event);
        }));
        return resolve(true);
      } else {
        this.srv.filter.setActive(false);
        this.dom.state.filter = false;
        return resolve(true);
      }
    });

  }


  /**
   * Generates a table config that will be used by the nested view component
   * @param reset
   *
   */
  protected _configureTable(reset = false): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      if (!this.table.config) {
        const tableData = <any>await this._getTableData(reset);
        if (IsArray(tableData.data, true)) {
          this.asset.blueprintData = tableData.data[0];
          this.asset.blueprint = tableData.data[0];
        }
        await this._getTableInterface();
        this.table.config = new TableConfig({...this.asset.tableInterface, ...tableData});
      } else {
        this.table.config.loading = true;
        this._getTableData().then(async (result: { data: Entity[] }) => {
          if (IsArray(result.data, true)) {
            this.asset.blueprintData = result.data[0];
            this.asset.blueprint = result.data[0];
          }
          this.table.config.buttons = this._buildTableButtons();
          await Sleep(10);
          if (reset && typeof this.table.config.reset === 'function') {
            this.table.config.reset(result.data);
          } else {
            if (typeof this.table.config.updateData === 'function') this.table.config.updateData(result.data);
          }
          this.table.config.loading = false;
          this.dom.state.refresh = false;
          this.core.params.refresh = false;

        });
      }
      return resolve(true);
    });
  }


  /**
   * Allows route to have a resolvable syntax
   *
   */
  protected _transformRouteExtension(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      if (!IsObject(this.extension)) this.extension = {};
      if (IsString(this.extension.goToUrl, true)) {
        this.extension.goToUrl = ParseLinkUrl(this.extension.goToUrl, this.core.params, [':id']);
      }
      if (IsObject(this.extension.table, true)) {
        if (this.extension.table.route) {
          this.extension.table.route = ParseLinkUrl(this.extension.table.route, this.core.params, [':id']);
        }
      }
      return resolve(true);
    });
  }


  /**
   * Generates a table config interface to produce a config
   * @param row
   *
   */
  protected _getTableInterface(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      // this.loading = true;
      // Clear any session for previous viewing history
      if (IsObject(this.asset.tableInterface, true)) {
        return resolve(true);
      } else {
        await this._getDefaultFieldKeys();
        const defaultColumns = <Dictionary<any>>await this._getDefaultColumns();
        let userColumns;
        if (IsObject(this.core.preference, ['table']) && IsObject(this.core.preference.table.columns, true)) {
          userColumns = this.core.preference.table.columns;
        }

        if (!userColumns) userColumns = defaultColumns;

        // console.log('defaultColumns', defaultColumns);
        // console.log('userColumns', userColumns);

        // console.log('get', this.asset.searchValueSessionPath);

        let baseApp = (this.core.params.app ? this.core.params.app : PopHref);
        baseApp = baseApp ? `/${baseApp}/` : '/';

        let tableInterface: TableInterface = {
          id: this.core.params.internal_name,
          internal_name: this.core.params.internal_name,
          paginator: true,
          height: this._getTableHeight(),
          buttons: this._buildTableButtons(),
          route: `${baseApp}${GetRouteAlias(this.core.params.internal_name)}/:id/general`,
          data: [],
          searchValue: GetSessionSiteVar(this.asset.searchValueSessionPath, ''),
          options: new TableOptionsConfig({...{defaultOptions: {columnDefinitions: defaultColumns}}, ...this.core.repo.model.table.permission}),
          columnDefinitions: userColumns
        };

        if (this.extension.goToUrl) this.extension.goToUrl = ParseModelValue(this.extension.goToUrl, this.core, true);
        if (this.extension.table && this.extension.table.route) this.extension.table.route = ParseModelValue(this.extension.table.route, this.core, true);
        if (this.extension.table && Object.keys(this.extension.table).length) tableInterface = {...tableInterface, ...this.extension.table};
        if (IsObject(this.core.preference, ['table'])) {
          // console.log('this.core.preference.table.options', this.core.preference.table.options);
          if (this.core.preference.table.options) {
            tableInterface = {...tableInterface, ...this.core.preference.table.options};
          }
        }
        this.asset.tableInterface = tableInterface;
        return resolve(true);
      }
    });
  }


  /**
   * A table will have a set of actions that it will need a button set to achieve
   *
   */
  protected _buildTableButtons() {
    let buttons = [];
    if (IsObject(this.core.repo.model.table.button, true)) {
      buttons = this.table.buttons.filter((button) => {
        // if( button.id === 'custom' && !this.core.repo.model.table.button.custom ) return false; // allow custom actions to be performed on a set of entities
        // if( button.id === 'advanced_search' && !this.core.repo.model.table.button.advanced_search ) return false; // allow for a advanced search on the entity data set
        if (button.id === 'archive' && (!this.core.repo.model.table.button.archived || this.dom.state.showArchived)) return false;
        if (button.id === 'restore' && (!this.core.repo.model.table.button.archived || !this.dom.state.showArchived)) return false;
        if (button.id === 'show_active' && (!this.core.repo.model.table.button.archived || !this.dom.state.showArchived)) return false;
        if (button.id === 'show_archived' && (!this.core.repo.model.table.button.archived || this.dom.state.showArchived)) return false;
        if (button.id === 'new' && !this.core.repo.model.table.button.new) return false;
        if (!button.accessType) return true;
        if (!this.srv.entity.checkAccess(this.core.params.internal_name, button.accessType)) return false;
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
  protected _filterEventHandler(event: PopBaseEventInterface) {
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
  private _setRouteExtension() {
    if (!this.extension) this.extension = {};
    if (!this.extension.table) this.extension.table = {};
    if (!this.extension.goToUrl) this.extension.goToUrl = null;
    if (this.route.snapshot.data && Object.keys(this.route.snapshot.data).length) {
      Object.keys(this.route.snapshot.data).map((key) => {
        this.extension[key] = this.route.snapshot.data[key];
      });
    }
  }


  private _getDefaultFieldKeys(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (IsObject(this.asset.fieldKeys, true)) {
        return resolve(true);
      } else {
        this.core.repo.getCache('table', 'fieldKeys').then((fieldKeys) => {
          if (IsObject(fieldKeys, true)) {
            this.asset.fieldKeys = <any>fieldKeys;
          } else {
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


  private _getDefaultColumns(): Promise<Dictionary<any>> {
    return new Promise<Dictionary<any>>((resolve) => {
      let defaultColumns = {};
      this.core.repo.getCache('table', 'columns').then((columns) => {
        if (IsObject(columns, true)) {
          return resolve(columns);
        } else {
          defaultColumns = {};
          const fields = IsObjectThrowError(this.core.repo.model.field, true, `Repo contained no field model`) ? this.core.repo.model.field : null;
          if (IsObject(this.asset.fieldKeys, true)) {
            Object.keys(this.asset.fieldKeys).map((fieldName) => {
              if (fieldName in fields) {
                const field = fields[fieldName];
                if (IsObject(field.model, ['route'])) {
                  field.model.route = ParseModelValue(field.model.route, this.core);
                }
                if (field.table.visible) defaultColumns[fieldName] = {
                  ...{
                    name: field.model.name,
                    label: field.model.label,
                  },
                  ...field.table

                };
              }
            });
          } else {
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
  private _getTableHeight() {
    let height = this.dom.height.inner;
    if (this.srv.filter.isActive()) {
      height -= 20;
    }
    return height;
  }
}

