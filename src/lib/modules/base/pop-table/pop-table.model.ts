import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { PopBaseEventInterface } from '../../../pop-common.model';

export interface ColumnDefinitionInterface {
  checkbox?: boolean | { order?: number, sticky?: boolean, visible?: boolean };
  display?: string;  // The actual name display to be shown. If not passed then will map name through fieldMap.
  helper?: string | { text?: string, position?: string }; // Any helper text (on hover) this name should have
  icon?: { type: string, name: string }; // If this name should display an icon instead of the value.
  link?: boolean | string;      // Highlight name text, and fire route event
  order?: number;     // The order this name should be in.
  route?: string;     // The path that will jump to if set. IE: /admin/users/:user_fk
  internal_name?: string; // portal param
  sticky?: boolean;   // If this name should be sticky on horizontal scrolling.
  visible?: boolean;  // If this name should be visible.
}


export interface TableButtonInterface {
  id?: string | number;           // For setting the 'type' in table events. If not passed, name will be used.
  name: string;                   // The name of the button.
  accessType?: string;             // Requires user to have level of permissons to see button
  requireSelected?: boolean;      // Makes button available when at least one item in table is selected.
  requireOneSelected?: boolean;   // Makes button available when only one item is selected.
  requireNoneSelected?: boolean;  // Makes button available when no items are selected.
  hidden?: boolean;
  disabled?: boolean;
}




export interface TableOptionsInterface {
  columns?: Array<string>; // Array of all name names.
  currentOptions?: {
    columnDefinitions: { [ key: string ]: ColumnDefinitionInterface };
    headerDisplay: boolean,
    headerSticky: boolean,
    paginator: boolean,
    search: boolean,
    searchColumns: boolean,
    sort: boolean,
  };
  defaultOptions: {
    columnDefinitions: { [ key: string ]: ColumnDefinitionInterface };
    headerDisplay?: boolean,
    headerSticky?: boolean,
    paginator?: number,
    search?: boolean,
    searchColumns?: boolean,
    sort?: boolean,
  };

  allowColumnDisplayToggle?: boolean; // User is allowed to toggle which columns can be displayed.
  allowColumnStickyToggle?: boolean;  // User is allowed to toggle which columns are sticky.
  allowColumnSearchToggle?: boolean;  // User is allowed to toggle name search on/off.
  allowColumnSortToggle?: boolean;    // User is allowed to toggle name sort on/off.
  allowHeaderStickyToggle?: boolean;  // User is allowed to toggle sticky header.
  allowHeaderDisplayToggle?: boolean; // User is allowed to toggle display of header.
  allowPaginatorToggle?: boolean;     // User is allowed to toggle pagination sizes/on/off.
}


export class TableOptionsConfig {

  columns = [];
  currentOptions;
  defaultOptions;

  allowColumnDisplayToggle = true;
  allowColumnStickyToggle = true;
  allowColumnSearchToggle = true;
  allowColumnSortToggle = true;
  allowHeaderStickyToggle = true;
  allowHeaderDisplayToggle = true;
  allowPaginatorToggle = true;


  constructor(params: TableOptionsInterface){
    if( params ) for( const i in params ) this[ i ] = params[ i ];

    if( this.defaultOptions.headerDisplay !== false ) this.defaultOptions.headerDisplay = true;
    if( this.defaultOptions.headerSticky !== false ) this.defaultOptions.headerSticky = true;
    if( !this.defaultOptions.paginator ) this.defaultOptions.paginator = 0;
    if( this.defaultOptions.search !== false ) this.defaultOptions.search = true;
    if( this.defaultOptions.searchColumns !== true ) this.defaultOptions.searchColumns = false;
    if( this.defaultOptions.sort !== true ) this.defaultOptions.sort = false;
  }
}



export interface TableInterface {
  id?: string | number;
  columnDefinitions?: { [ key: string ]: ColumnDefinitionInterface }; // object of name names and their definitions.
  buttons?: Array<TableButtonInterface>;  // Array of table buttons.
  data?: Array<object>;                   // Data set - array of objects.
  height?: number;                        // static height
  parentHeight?: string;                  // the height that the table should match
  headerDisplay?: boolean;                // If header should be displayed.
  headerSticky?: boolean;                 // If header should be sticky. Can not be on if pagination is on.
  internal_name?: string;
  initialSort?: string;                   // Initial name to sort on any time the dataset is updated.
  initialSortDirection?: 'asc' | 'desc';
  linkBehavior?: string;                  // Set the default behavior of clicking on links, route, modal, custom
  metadata?: object;                      // Any metadata object to be returned on all events.
  advanced_search?: boolean;                  // Set true if you want to override default search functionality. Search event will be triggered instead;
  options?: TableOptionsConfig;
  paginator?: boolean;                     // Items per page in pagination. false = off. Can not be on with sticky header.
  search?: boolean;                       // If main search should be turned on. If on, will over-ride name search.
  searchValue?:string;                    // Init the search value
  searchColumns?: boolean;                // Individual name search. Overridden by searchMain
  sort?: boolean;                         // Column Sort option
  route?: string;                          // general route to redirect on a name click if the route parameter on the name definition hasn't been set.
}


export class TableConfig {
  id;
  matDataPaginator;
  selection;
  // General Params
  buttons: TableButtonInterface[] = [];
  columnDefinitions = {};
  dealWithAngularChangeDetectionFailure = false;
  data = [];
  height = 500; // static height px
  parentHeight?: string; // class name of the outer div that table should match
  initialSort = null;
  initialSortDirection:'asc' | 'desc' = 'asc';
  internal_name?: string;
  loading = false;
  metadata = null;
  options = null;
  sort = false;
  route = '';
  linkBehavior = 'route';

  // Optionable Params
  //  - These can be toggled in options so if any default are changed here make sure to also subject them in TableOptionsConfig
  headerDisplay = true;
  headerSticky = false;
  paginator = false;
  search = true;
  searchValue = '';
  searchColumns = false;
  advanced_search = false;

  onEvent: Subject<PopBaseEventInterface>;

  // Built through updates.
  matData = new MatTableDataSource();
  columnConfig = { visible: [], templates: {} };
  updateColumnDefinitions;
  updateData;
  applyFilter;
  clearSelected;
  reset;
  setLayout;
  setHeight;


  constructor(params?: TableInterface){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    if( !( [ 'route', 'portal' ].includes(this.linkBehavior) ) ) this.linkBehavior = 'route';
    // Run these in case params had conflicting info.
    if( this.paginator ){
      this.headerSticky = false;
    }
  }

}
