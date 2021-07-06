import { EventCallback, FieldItemOptions, OptionItem } from '../../../pop-common.model';
import { TableConfig } from '../pop-table/pop-table.model';


export interface SideBySideOptionInterface {
  value: string | number;
  name: string;
  group?: string;
  sort_order?: number;
  patching?: boolean;
  optionFilter?: boolean;
  assignBlock?: boolean;
  optionBlock?: boolean;
  assignedFilter?: boolean;
  errMessage?: string;
}


export interface SideBySideOptions {
  assigned?: any;
  resource?: string;
  child?: string;
  parent?: string;
  values: SideBySideOptionInterface[];
  empty?: OptionItem;                       // Pass in an Option Item that you want to represent an unassigned value
  prevent?: Array<string | number>;         // pass in ids of an Option Items that you don't want in list
  ensure?: OptionItem;
}


export interface SideBySideInterface {
  id?: number | string;           // A number that will be included in the events so you know which field it came from.
  name?: string;              // the entityId field name
  assigned?: Array<string | number>;  // the ids of the assigned items
  assignAll?: boolean;        // If "Assign All" should be available.
  assignedLabel?: string;     // Label of the assigned items name
  bubble?:boolean;

  bucketHeight?: number;      // The exact px height you want the buckets to be. Overrides bucket limit
  bucketLimit?: number;      // The limit of items to show in a bucket
  disabled?: boolean;          // Set to true to disable buttons
  displayCircleID?: boolean;   //
  displayHelper?: boolean;     // Set to false if you don't want to see helper icons when no assigned
  displayTitle?: boolean;     //
  facade?:boolean;            // mimic api calls
  facadeEvent?:boolean;       // If set means that only an event should be fired instead of actually doing anything
  helpText?: string;         // Displayed text when none assigned
  helpTextRight?:string;   // Displayed text when no options available to assign
  height?: number;               // static px height
  optionsLabel?: string;         // Label of the available items name.
  filter?: boolean;           // If filters are available
  filterBoth?: boolean;        // If filter boxes should be combined
  route?: string;              // Absolute Url path to route to each option: Extrapolate the entityId/value by  passing 'users/:value'
  metadata?: object;
  options: SideBySideOptions;// The options available.
  removeAll?: boolean;        // If "Remove All" should be available.
  required?: boolean;
  sort?: boolean;             //  Set to true if you want items to be sorted in priority of sort_order, name
  sessionPath?: string;          // Entity Config location to store values, ie...  a way store the captured values of facades on the entityId metadata <'entityId.metadata.role_type'>
  display?: string;             // Title of the Side by Side
  parentHeight?: string;     // class name of parent height to match
  patch?: {
    path: string;
    conflictPath?:string;
    conflictMessage?:string;
    conflictHeader?:string;
    addId?:boolean
    conflictTableConfig?:TableConfig;
    field?: string;
    businessId?: number;
    callback?: EventCallback;
    ignore401?: boolean,
    metadata?: object;
    displayIndicator?: boolean;
    version?: number,
    running?: boolean;
    assignErrMessage?: string // Store (mass) assign Http Error message
    removeErrMessage?: string // Store (mass) remove Http Error message
    assignMethod?: 'POST' | 'PATCH';
    removeMethod?: 'POST' | 'PATCH' | 'DELETE';
  };
}


export class SideBySideConfig {
  id;
  name = 'name';
  bubble = false;
  hasLabelRow = false;
  hasFilterRow = false;
  hasHeader = false;
  assigned: Array<string | number> = []; // List of item ids of assigned items
  assignAll = false;
  assignedLabel = '';
  bucketHeight?: number;
  bucketLimit = 0;
  disabled = false;
  displayCircleID = true;
  displayHelper = true;
  displayTitle = true;
  facade = false;
  facadeEvent = false;
  helpText: string;
  helpTextRight:string;
  optionsLabel = '';
  optionHtml = 'label';
  filter = true;
  filterBoth = false;
  height?: number;               // static px height
  route = '';
  metadata = null;
  options: SideBySideOptions = { values: [] }; // List of all available items
  removeAll = false;
  required?: boolean;
  sort: false;
  display = '';
  patch = null;
  parentClassName?: string;     // class name of parent height to match
  removeAllOptions;
  addAllOptions;
  assign;
  remove;
  applyFilter;
  getAssigned;
  block;
  unblock;
  control;


  constructor(config: SideBySideInterface){
    for( const i in config ) this[ i ] = config[ i ];
    if( !this.patch ) this.patch = {};
    if( this.patch.displayIndicator !== false ) this.patch.displayIndicator = true;
    if( !this.patch.field ) this.patch.field = 'option';
    if( !this.patch.assignMethod ) this.patch.assignMethod = 'POST';
    if( !this.patch.removeMethod ) this.patch.removeMethod = 'DELETE';
    if( !this.patch.businessId ) this.patch.businessId = 0;

    if( !this.metadata ) this.metadata = {};
    this.hasHeader = this.display && this.displayTitle;
    this.hasLabelRow = this.assignAll || this.removeAll || this.optionsLabel || this.assignedLabel ? true : false;
    this.hasFilterRow = this.filter || this.filterBoth ? true : false;


    if( this.route ) this.optionHtml = 'route';

    if( this.displayHelper && !this.helpText ) this.helpText = 'You have no ' + ( this.display ? this.display.toLowerCase() : 'options' );
    this.options = JSON.parse(JSON.stringify(this.options)); // make as deep copy of options so that options reference can be used elsewhere

    if( this.displayHelper && !this.helpTextRight ) this.helpTextRight = ' No ' + ( this.display ? this.display.toLowerCase() +' available ' : 'data available ');
    this.options = JSON.parse(JSON.stringify(this.options)); // make as deep copy of options so that options reference can be used elsewhere

    if( this.sort && this.options.values.length > 1 ){
      if( typeof this.options[ 0 ].sort_order !== 'undefined' ){
        this.options.values.sort((a, b) => {
          if( a.sort_order < b.sort_order ) return -1;
          if( a.sort_order > b.sort_order ) return 1;
          return 0;
        });
      }else{
        this.options.values.sort((a, b) => {
          if( a.name < b.name ) return -1;
          if( a.name > b.name ) return 1;
          return 0;
        });
      }
    }
  }
}
