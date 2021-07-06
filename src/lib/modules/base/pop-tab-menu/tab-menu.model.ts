import { ComponentType } from '@angular/cdk/portal';
import { CoreConfig, Dictionary, EntityExtendInterface, EventCallback, OutletReset, PopBaseEventInterface, SectionConfig } from '../../../pop-common.model';
import { FieldItemGroupConfig } from '../pop-field-item-group/pop-field-item-group.model';
import { Subject } from 'rxjs';

export type TabLoadCallback = ( config: CoreConfig, tab: TabConfig ) => void;
export type TabUnloadCallback = ( config: CoreConfig, tab: TabConfig ) => void;
export type TabCoreCallback = ( event: PopBaseEventInterface ) => void;


const enum TabPosition {
  left = 'left',
  center = 'center',
  right = 'center'
}


export interface TabComponentInterface {
  type: ComponentType<any>;
  inputs?: Dictionary<any>;
  position: number;
  name?: string;
  width?: string;
  header?: string;
  when?:any[];
}


export interface TabPositionInterface {
  id?: string | number;
  name?: string;
  flex: number;
  maxWidth?: number;
  minWidth?: number;
  maxHeight?: number;
  position?: number;
  components?: TabComponentInterface[];
  reset?: Subject<any>;
  header?: string;
  extension?: EntityExtendInterface;
}


export interface TabInterface {
  id: string;
  hidden?: boolean;
  positions?: any;
  name?: string;
  path?: string;
  metadata?: object;
  onLoad?: TabLoadCallback; // initial load event hook for custom logic
  onEvent?: EventCallback;  // main event hook for custom logic
  overhead?: number;       // compute extra overhead assigned by parent component
  onUnload?: TabUnloadCallback;
  requireRefresh?: boolean;        // require an api call to refresh the entityId on every load
  scheme?: boolean;
  sections?: SectionConfig[];
  syncPositionFields?: string[]; // a list of fieldItems that should only trigger tab to reload modules of the tab
  syncPositionMap?: Dictionary<number[]>; // a more specific mapping to specify certain positions to reload with a patch comes from a certain position
  syncPositions?: boolean;  // a general switch that triggers all positions to reset on a patch, should be reduced by providing syncPositionFields <['security_profile_fk', 'type_fk']> or syncPositionMap <{'left':['right']>}
  wrap?: boolean;   // Indicate whether this tab should have the default wrapper .ie margin, sometimes a tab might be framed from within another tab that already has the wrap
  columnWrap?: boolean;   // Indicate whether this tab should have the default wrapper .ie margin, sometimes a tab might be framed from within another tab that already has the wrap
  when?: any[];  // conditional whether to show tab or not
}


export class TabConfig {
  id: string;
  name?: string;
  hidden? = false;
  path? = '';
  metadata?: object;
  scheme? = false;
  overhead? = 0;
  positions?: {
    1?: TabPositionInterface,
    2?: TabPositionInterface,
    3?: TabPositionInterface,
  };
  sections? = null;
  syncPositionFields?: string[];
  syncPositions? = false;
  syncPositionMap?: Dictionary<number[]>;
  requireRefresh? = false;
  onLoad?: TabLoadCallback;
  onEvent?: EventCallback;
  onUnload?: TabUnloadCallback;
  // internal assets
  view?: any;
  resetView?: OutletReset;
  when? = null;

  wrap? = true;
  columnWrap? = true;
  groups?: Dictionary<FieldItemGroupConfig> = {};


  constructor( params: TabInterface ){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    if( !this.name ) this.name = this.id.replace( /_/g, ' ' ).replace( /(?:^|\s)\S/g, function( a ){
      return a.toUpperCase();
    } );

    if( !this.path ) this.path = this.id.replace( /_/g, '-' ).toLowerCase();
    if( !this.metadata ) this.metadata = {};
    if( !this.syncPositionMap ) this.syncPositionMap = {};
    if( !this.positions ) this.positions = { 1: { flex: 1 } };
    Object.keys( this.positions ).map( ( position ) => {
      if( !this.positions[ position ].min ) this.positions[ position ].multiple_min = null;
      if( !this.positions[ position ].max ) this.positions[ position ].multiple_max = null;
      if( !this.positions[ position ].flex && this.positions[ position ].cols ) this.positions[ position ].flex = this.positions[ position ].cols;
      delete this.positions[ position ].cols;
    } );
  }
}


export interface TabButtonInterface {
  id: number | string;
  name: string;
  metadata?: any;
  hidden?: boolean;
  disabled?: boolean;
  accessType?: string;
}


export interface TabMenuInterface {
  name: string;
  goBack?: boolean;
  portal?: boolean;
  tabs?: Array<TabConfig>;
  buttons?: Array<TabButtonInterface>;
}


export interface TabMenuPortalInterface {
  internal_name: string;
  entity_id: number;
}


export class TabMenuConfig {
  name = '';
  goBack = true;
  tabs: Array<TabConfig> = [];
  buttons: Array<TabButtonInterface> = [];
  portal = <boolean>false;
  metadata: Dictionary<any> = {};
  loaded = false;
  loading = false;


  constructor( params?: TabMenuInterface ){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
  }
}


export interface BackButton {
  returnUrl: string;
  hardReload: boolean;
} 



