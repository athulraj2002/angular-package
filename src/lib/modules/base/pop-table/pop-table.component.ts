import {OnInit, Component, ViewChild, OnDestroy, ViewEncapsulation, ElementRef, ChangeDetectorRef} from '@angular/core';
import {Input} from '@angular/core';
import {ColumnDefinitionInterface, TableConfig, TableOptionsInterface} from './pop-table.model';
import {MatPaginator} from '@angular/material/paginator';
import {Subject} from 'rxjs';
import {Entity, PopBaseEventInterface, PopHref, PopPipe, PopTemplate, ServiceInjector} from '../../../pop-common.model';
import {PopBaseService} from '../../../services/pop-base.service';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {PopExtendComponent} from '../../../pop-extend.component';
import {PopDomService} from '../../../services/pop-dom.service';
import {ParseLinkUrl} from '../../entity/pop-entity-utility';
import {
  DynamicSort,
  IsArray,
  IsDefined,
  IsNumber,
  IsObject,
  IsObjectThrowError,
  IsString,
  IsUndefined,
  ObjectContainsTagSearch,
  SetSiteVar,
  Sleep
} from '../../../pop-common-utility';
import {PopTableDialogComponent} from './pop-table-dialog/pop-table-dialog.component';
import {PopPipeService} from "../../../services/pop-pipe.service";


@Component({
  selector: 'lib-pop-table',
  templateUrl: './pop-table.component.html',
  styleUrls: ['./pop-table.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class PopTableComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() config: TableConfig;
  @ViewChild('wrapper', {static: true}) wrapper: ElementRef;
  @ViewChild('footer') footer: ElementRef;
  @ViewChild(MatPaginator, {static: true}) matPaginator: MatPaginator;
  public name = 'PopTableComponent';

  srv = {
    base: <PopBaseService>undefined,
    dialog: <MatDialog>undefined,
    router: <Router>undefined,
    pipe: <PopPipeService>undefined,
  };


  asset = {
    data: undefined,
    filter: {
      column: {},
      predicate: undefined,
      search: undefined
    }
  };


  /**
   * @param el
   * @param cdr
   * @param _baseRepo
   * @param _dialogRepo
   * @param _domRepo
   * @param _routerRepo
   * @param _pipeRepo
   */
  constructor(
    public el: ElementRef,
    public cdr: ChangeDetectorRef,
    protected _baseRepo: PopBaseService,
    protected _dialogRepo: MatDialog,
    protected _domRepo: PopDomService,
    protected _routerRepo: Router,
    protected _pipeRepo: PopPipeService,
  ) {
    super();
    /**
     * Configure the specifics of this component
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise(async (resolve) => {

        await Promise.all([
          this._setInitialConfig(), // set default configs
          this._setHeight(), // Determine the height of the table
          this._updateButtonControl(),
          this._attachPaginator(), // Attach the paginator to the config
          this._handleConfigEvents(), //  Manage Config Events
          this._setConfigHooks(), // attach hooks on to the config that let other components tie in to this component
          this._initSearchFilter(), // sets the search abilities
          this._configureTable() // Prep the table for display.
        ]);

        return resolve(true);
      });
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise(async (resolve) => {
        this._setFilterPredicate(this.dom.session.searchValue); // Set up the filter predicates to use with this table
        return resolve(true);
      });
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
  onBubbleEvent(name, event): void {
    // All selections of table rows should come through here so _update the buttonControls.
    const tableEvent: PopBaseEventInterface = {
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
  onApplySearchValue(searchValue: string, col: string) {
    this.dom.setTimeout('apply-search', () => {
      this.asset.filter.search(searchValue, col);
      this.onBubbleEvent('search', searchValue);
    }, 250);
  }


  /**
   * The user can click on a button to edit their preferences for this table in a modal
   */
  onEditTablePreferencesClick(): void {

    // Get a copy of the current options.
    const searchColumns = this.config.searchColumns;
    const options: TableOptionsInterface = JSON.parse(JSON.stringify(this.config.options));

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
        if (!this.asset.data[0].hasOwnProperty(col)) continue;
        if (IsString(this.asset.data[0][col]) || IsNumber(this.asset.data[0][col])) {
          options.columns.push(col);
        }
      }
    }

    this.onBubbleEvent('options_open', options);

    const dialogRef = this.srv.dialog.open(PopTableDialogComponent, {
      data: {options: options}
    });

    dialogRef.afterClosed().subscribe(dialog => {
      if (dialog) {
        console.log('here', dialog);
        if (dialog.type === 'save') {
          this.dom.refreshing();
          try {
            this.cdr.detectChanges();
          } catch (e) {
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
          if (searchColumns !== this.config.searchColumns) this._setFilterPredicate();
          try {
            this.cdr.detectChanges();
          } catch (e) {
          }
          this._resetTable();

        } else if (dialog.type === 'reset') {
          this.dom.refreshing();
          try {
            this.cdr.detectChanges();
          } catch (e) {
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
          if (searchColumns !== this.config.searchColumns) this._setFilterPredicate();
          try {
            this.cdr.detectChanges();
          } catch (e) {
          }
          this._resetTable();

        } else if (dialog.type === 'cancel') {
          this.onBubbleEvent('options_cancel', {});
        }
      } else {
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
  protected _setInitialConfig(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      // Ensure config
      this.config = IsObjectThrowError(this.config, true, `${this.name}:configure: - this.config`) ? this.config : null;
      // Set a data container to hold raw data
      this.asset.data = <any[]>[];
      if (IsDefined(this.config.id)) this.id = this.config.id;
      return resolve(true);
    });
  }


  /**
   * Handle table events
   * @param event
   */
  protected _onTableEvent(event: PopBaseEventInterface) {
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
                PopTemplate.error({message: `Invalid Client Route: ${route}`, code: 500});
                console.log(e);
              });
            } else {
              // do a hard reload if we aren't.
              SetSiteVar('redirect', goToUrl);
              this.srv.base.redirect();
            }
          } else {
            this.onBubbleEvent('row_clicked', event.data.row);
          }
          break;

        case 'columnRouteClick':
          if (this.config.linkBehavior === 'route') {
            goToUrl = this._parseGoToUrl(this.config.columnDefinitions[event.data.name].route, event.data.row);
            if (!goToUrl) return false;
            routeApp = String(goToUrl).split('/');
            if (routeApp[1] && routeApp[1] === PopHref) {
              const route = routeApp.slice(2).join('/');
              this.srv.router.navigate([route]).catch((e) => {
                console.log(e);
                PopTemplate.error({message: `Invalid Client Route: ${route}`, code: 500});
              });
            } else {
              SetSiteVar('redirect', goToUrl);
              this.srv.base.redirect();
            }
          } else {
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
  protected _setHeight(height: number = null): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      this.dom.overhead = 0;
      if (this.config) {
        if (height) this.config.height = height;
        if (this.config.height) {
          if (this.config.options || this.config.buttons.length || (this.config.search && !this.config.searchColumns)) this.dom.overhead = this.dom.overhead + 55;
          if (this.config.paginator) this.dom.overhead = this.dom.overhead + 65;
          this.dom.setHeight(this.config.height, this.dom.overhead);
          return resolve(true);
        }
      } else {
        this.dom.setHeight(0, 0);
        this.dom.height.outer = null;
        this.dom.height.inner = null;
      }
      return resolve(false);
    });
  }


  /**
   * The user can choose from a global search or a column search
   */
  private _setFilterPredicate(searchValue: string = null) {
    if (this.config.searchColumns) {
      this.config.matData.filter = '';
      this.config.matData.filterPredicate = this.asset.filter.predicate.column;
    } else {
      this.config.matData.filterPredicate = this.asset.filter.predicate.tag;
      this.onApplySearchValue((searchValue ? searchValue : ''), '');
    }
  }


  protected _updateData(data: Array<object>) {
    this.dom.refreshing();
    if (!this.config.matData.paginator) this.config.matData.paginator = this.matPaginator;
    if (IsObject(this.config.columnDefinitions, true)) {
      if (IsArray(data)) {
        this.asset.data = data;
        this.config.matData.data = this.asset.data.slice();
        if (!this.config.searchColumns && this.dom.session.searchValue) {
          this.asset.filter.search(this.dom.session.searchValue, '');
        }

        this._setTableLayout();
      }
    } else if (IsArray(data, true)) {
      this.config.data = data;
      this.onBubbleEvent('column_definitions', data[0]);
    }
  }


  protected _resetTable(data: Array<object> = null) {
    this.log.info(`_resetTable`);
    this.dom.setTimeout(`reset-table`, async () => {
      this.dom.refreshing();
      await this._configureTable();
      await this._updateButtonControl();
      if (Array.isArray(data)) {
        this._updateData(data);
      } else {
        this.dom.setTimeout(`view-ready`, async () => {
          this.dom.ready();
        }, 200);
      }
    }, 0);
  }


  /**
   * This will bring in the table config,user preferences,data set and tie it all together
   * The structure of the data set is important to what the table will render
   */
  protected _configureTable(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      this.log.info(`_configureTable`);
      this.config.matData.data.length = 0;
      const templates = {};
      const visible = [];
      let visibleOrdered = [];
      let validDefinition = false;

      if(!IsObject(this.config.columnDefinitions, true)){
        this.dom.state.hasColumnDefinitions = true;
        this.config.columnDefinitions = {
          description: { name: "description", label: "Description", visible: true, sort: 3 },
          id: { name: "id", label: "ID", checkbox: { visible: true, sort: 0 }, visible: true, sort: 999 },
          name: { name: "name", label: "Name", visible: true, sort: 2 }
        }
      } else {

        this.dom.state.hasColumnDefinitions = IsObject(this.config.columnDefinitions, true);
      }

      for (const col in this.config.columnDefinitions) {
        if (!this.config.columnDefinitions.hasOwnProperty(col)) continue;

        // Marking this as true so that the auto config does not run.
        validDefinition = true;

        // Figure out the template to use.
        let template = 'Standard';
        if (this.config.columnDefinitions[col].route) {
          if (this.config.columnDefinitions[col].icon) {
            template = this.config.columnDefinitions[col].helper ? 'RouteIconHelper' : 'RouteIcon';
          } else {
            template = this.config.columnDefinitions[col].helper ? 'RouteHelper' : 'Route';
          }
        } else if (this.config.columnDefinitions[col].link) {
          if (this.config.columnDefinitions[col].icon) {
            template = this.config.columnDefinitions[col].helper ? 'LinkIconHelper' : 'LinkIcon';
          } else {
            template = this.config.columnDefinitions[col].helper ? 'LinkHelper' : 'Link';
          }
        } else if (this.config.columnDefinitions[col].icon) {
          template = this.config.columnDefinitions[col].helper ? 'IconHelper' : 'Icon';
        } else if (this.config.columnDefinitions[col].helper) {
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
        if (this.config.columnDefinitions[col].visible) visible.push({
          name: col,
          sort: this.config.columnDefinitions[col].sort
        });

        // Check if this column should also have a checkbox.
        if (this.config.columnDefinitions[col].checkbox) {
          const cbName = 'checkbox_' + col;
          templates[cbName] = {
            template: 'Checkbox',
            name: col,
            helper: {text: '', position: 'left'},
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
      for (const i in visible) visibleOrdered.push(visible[i].name);

      // If no column configs were passed in then use the data set and just display all the columns.
      if (!validDefinition && this.asset.data && this.asset.data[0]) {
        for (const col in this.asset.data[0]) {
          if (!this.asset.data[0].hasOwnProperty(col)) continue;
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
      this.config.columnConfig = {templates: templates, visible: visibleOrdered};


      // Clear previous selections.
      if (this.config.selection) this.config.selection.clear();


      // Set the data.
      if (IsArray(this.config.data, false)) {
        this._updateData(this.config.data);
      }
      setTimeout(() => {
        this.dom.ready();
        this.onBubbleEvent('ready', 1);
      });

      return resolve(true);
    });
  }


  protected _setTablePagination() {
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
          this.config.matData.paginator.page.next({pageIndex: 0, pageSize: 50, length: 50});
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

  private _updateColumnDefinitions(definitions: { [key: string]: ColumnDefinitionInterface }) {
    this.config.columnDefinitions = definitions;
    this._configureTable().then(() => true);
  }


  /**
   * This function will attach and configure a paginator if it is needed
   */
  private _attachPaginator(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      if (this.matPaginator) {
        this.matPaginator.hidePageSize = true;
        if (this.config && this.config.matData) this.config.matData.paginator = this.matPaginator;
      }
      return resolve(false);
    });
  }


  /**
   * This will manage the button interface
   * Buttons can have a dependency on what the user has currently selected(list items have a checkbox selection)
   */
  private _updateButtonControl(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
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
      } else {
        this.ui.buttonControl.requireSelected = false;
        this.ui.buttonControl.requireOneSelected = false;
        this.ui.buttonControl.requireNoneSelected = true;
      }
      return resolve(true);
    });
  }


  /**
   * The table config has its own event emitter that need to be handled
   */
  private _handleConfigEvents(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      if (!this.config.onEvent) this.config.onEvent = new Subject<PopBaseEventInterface>();
      this.dom.setSubscriber('config-events', this.config.onEvent.subscribe((event: PopBaseEventInterface) => {
        this._updateButtonControl().then(() => true);
        this._onTableEvent(event);
      }));
      return resolve(false);
    });
  }


  /**
   * This will allow an outside component to trigger specific functionality through the config of this component
   */
  private _setConfigHooks(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {

      this.config.setHeight = (height: number) => {
        this._setTableHeight(height);
      };

      this.config.clearSelected = (): Promise<boolean> => {
        return new Promise<boolean>(async (clearResolver) => {
          this.config.selection.clear();
          await Sleep(250);
          this._updateButtonControl().then(() => {
            return clearResolver(true);
          });
        });
      };

      this.config.updateColumnDefinitions = (definitions) => {
        this._updateColumnDefinitions(definitions);
      };

      this.config.updateData = (data) => {
        this._updateData(data);
      };

      this.config.setLayout = (height: number) => {
        this._setTableLayout(height);
      };

      this.config.reset = (data: Array<object> = null) => {
        this._resetTable(data);
      };

      this.config.applyFilter = (searchValue: string, col: string) => {
        if (!this.config.searchColumns) {
          this.onApplySearchValue(searchValue, col);
        }
      };
      return resolve(true);
    });
  }


  /**
   * Initialize and manage the filter predicates that this table will use
   */
  private _initSearchFilter(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      this.dom.session.searchValue = this.dom.session.searchValue ? this.dom.session.searchValue : (this.config.searchValue ? this.config.searchValue : '');
      this.asset.filter.predicate = {
        default: this.config.matData.filterPredicate, // Store a copy of this for resetting when options toggle search/column search.
        column: (data, filter: string): boolean => {
          let exists = true;
          for (const i in this.asset.filter.column) {
            if (data[i] && data[i].toLowerCase) {
              exists = data[i].toLowerCase().includes(this.asset.filter.column[i]);
            } else {
              // Cast numbers to strings.
              exists = String(data[i]).includes(this.asset.filter.column[i]);
            }
            if (!exists) return false;
          }
          return true;
        },
        tag: (data: any, filter: string): boolean => {
          return ObjectContainsTagSearch(data, filter);
        }
      };
      this.asset.filter.search = (searchValue: string, col: string) => {
        searchValue = searchValue.trim().toLocaleLowerCase();
        if (!col) {
          this.config.matData.filter = searchValue;
        } else {
          if (searchValue) {
            // Make sure that this column is in the list.
            this.asset.filter.column[col] = searchValue;
          } else if (this.asset.filter.column[col]) {
            // Since filter is empty this column shouldn't be considered.
            delete (this.asset.filter.column[col]);
          }
          this.config.matData.filter = searchValue;
        }

        if (this.config.paginator && this.config.matData.paginator) this.config.matData.paginator.firstPage();
      };
      return resolve(true);
    });
  }


  private _setTableLayout(height: number = null) {
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


  private _setTableHeight(height: number = null) {
    if (this.config && IsArray(this.asset.data, false)) {
      this._setHeight(height);
      setTimeout(() => {
        this.dom.ready();
        this._setTablePagination();
      }, 0);
    }
  }


  private _parseGoToUrl(goToUrl = '', row: Entity): string {
    if (!goToUrl) return goToUrl;

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





