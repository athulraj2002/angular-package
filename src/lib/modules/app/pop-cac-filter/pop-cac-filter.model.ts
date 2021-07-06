import { BehaviorSubject } from 'rxjs';
import { EntityFilterInterface, KeyMap } from '../../../pop-common.model';


export interface CacFilterBarInterface {
  app?: string;
  entity_path?: string;                  // Name of the entityId client, account, campaign ....
  display?: string;                // default (toggles), static(always open), float(filter bar floats)
  archived?: boolean;           // Set whether archived items should be looked at
  active?: boolean;           // Set whether the filter should be shown
  loader?: boolean;           // Set whether the filter should be shown
  sortToTop?: boolean;
}


export class CacFilterBarConfig {
  archived = false;
  active = false;
  api?: EntityFilterInterface[];
  app: string;
  display: 'default' | 'static' | 'float' = 'default';
  loader = false;
  view: string[] = [ 'client', 'account', 'campaign' ];
  sortToTop = false;
  invalid = false;


  constructor(params?: CacFilterBarInterface){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    if( !( [ 'default', 'static', 'float' ].includes(this.display) ) ) this.display = 'default';
  }
}


export interface CacFilterBarEntityInterface {
  internal_name: string;                  // Name of the entity client, account, campaign ....
  parent_link: string | null; // column that creates the parent/child relationship to the next entity
  child_link: string | null; // column that creates the parent/child relationship to the next entity
  name: string;
  options: CacFilterBarItem[];   // Items that should be displayed as options for this entityId
  search?: string;               // A search string that will be applies to the options of this entityId
  single?: boolean;
  mode?: boolean;
  visible?: boolean;
  sort_order?: number;
}


export class CacFilterBarEntityConfig {
  /**/
  allSelected = false;
  internal_name: string;
  child_link: string | null; // column that creates the parent/child relationship
  parent_link: string | null; // column that creates the parent/child relationship
  name: string;
  search: '';
  checkAll = false;
  options: CacFilterBarItem[];
  feed: BehaviorSubject<CacFilterBarItem[]>;
  totalVisible: number;
  totalSelected: number;
  totalAvailable: number;
  totalOptions: number;
  indeterminate = false;
  single = true;
  selected: KeyMap<boolean> = {};
  display: KeyMap<boolean> = {};
  hidden: KeyMap<boolean> = {};
  filter: any[] = [];
  selectedText = '';
  displaySelectedText = '';
  totalText = '';
  mode = false;
  visible = false;
  sort_order?: number;


  constructor(params: CacFilterBarEntityInterface){
    for( const i in params ) this[ i ] = params[ i ];
    this.feed = new BehaviorSubject<CacFilterBarItem[]>([]);
  }
}


export interface CacFilterBarItem {
  id: number;
  name: string;
  selected?: boolean;
  hidden?: boolean;
  display?: boolean;
  client_id: number;
  account_id?: number;
  campaign_id?: number;
  agency_id?: number;
  sort?: number;
}


export interface CacFilter {
  client?: any[];
  account?: any[];
  campaign?: any[];
}




