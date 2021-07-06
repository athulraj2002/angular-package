import {ChangeDetectorRef, ComponentFactoryResolver, ElementRef, InjectionToken, Injector} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';
import {FormGroup, Validators} from '@angular/forms';
import {EventEmitter} from '@angular/core';

import {FieldItemGroupConfig} from './modules/base/pop-field-item-group/pop-field-item-group.model';
import {TabButtonInterface, TabComponentInterface, TabConfig} from './modules/base/pop-tab-menu/tab-menu.model';
import {PopEntityRepoService} from './modules/entity/services/pop-entity-repo.service';
import {LabelConfig, MetadataConfig} from './modules/base/pop-field-item/pop-label/label-config.model';
import {CheckboxConfig} from './modules/base/pop-field-item/pop-checkbox/checkbox-config.model';
import {InputConfig} from './modules/base/pop-field-item/pop-input/input-config.model';
import {SelectConfig} from './modules/base/pop-field-item/pop-select/select-config.model';
import {SelectMultiConfig} from './modules/base/pop-field-item/pop-select-multi/select-mulit-config.model';
import {RadioConfig} from './modules/base/pop-field-item/pop-radio/radio-config.model';
import {TextareaConfig} from './modules/base/pop-field-item/pop-textarea/textarea-config.model';
import {SwitchConfig} from './modules/base/pop-field-item/pop-switch/switch-config.model';
import {SideBySideConfig} from './modules/base/pop-side-by-side/pop-side-by-side.model';
import {MinMaxConfig} from './modules/base/pop-field-item/pop-min-max/min-max.models';
import {PopLogService} from './services/pop-log.service';
import {NumberConfig} from './modules/base/pop-field-item/pop-number/number-config.model';
import {PopTemplateService} from './modules/app/pop-template.service';
import {App, AuthDetails, Business, BusinessUser} from './pop-common-token.model';
import {CacFilter} from './modules/app/pop-cac-filter/pop-cac-filter.model';
import {PopPipeService} from './services/pop-pipe.service';
import {PopDatetimeService} from './services/pop-datetime.service';
import {PopRequestService} from './services/pop-request.service';
import {PopEntityService} from './modules/entity/services/pop-entity.service';
import {PopRouteHistoryResolver} from './services/pop-route-history.resolver';
import {PopEntityUtilPortalService} from './modules/entity/services/pop-entity-util-portal.service';
import {EntityMenu} from './modules/app/pop-left-menu/entity-menu.model';
import {BehaviorSubject, Subject} from 'rxjs';
import {Router} from '@angular/router';
import {ComponentDomInterface} from './pop-common-dom.models';
import {PopRequestExternalService} from './services/pop-request-external.service';
import {PopDomService} from './services/pop-dom.service';
import {DateFilterPredicate} from './modules/base/pop-field-item/pop-date/date-config.model';
import {PopEntitySchemeComponentService} from "./modules/entity/services/pop-entity-scheme-component.service";

export type EventCallback = (core: CoreConfig, event: PopBaseEventInterface, dom?: ComponentDomInterface) => void;
export type EventPromiseCallback = (core: CoreConfig, event: PopBaseEventInterface, dom?: ComponentDomInterface) => Promise<any>;
export type OutletReset = (position?: number) => void;
export type PopTask = () => void;

export type DataFactory = (id?: number, archived?: boolean | number) => Promise<any[]>;
export type DataDecorator = (core: CoreConfig, entity: Entity) => Entity;
export type DataFilter = (entity: Entity) => boolean;
export type DataSetter = (core: CoreConfig, data: any, domRepo?: PopDomService) => any;


export let ServiceInjector: Injector;

export function SetServiceInjector(injector: Injector) {
  if (!ServiceInjector) ServiceInjector = injector;
}

export let PopEntity: PopEntityService;

export function SetPopEntity(entity: PopEntityService) {
  if (!PopEntity) PopEntity = entity;
}

export let PopHistory: PopRouteHistoryResolver;

export function SetPopHistory(history: PopRouteHistoryResolver) {
  if (!PopHistory) PopHistory = history;
}

export let PopPipe: PopPipeService;

export function SetPopPipe(pipe: PopPipeService) {
  if (!PopPipe) PopPipe = pipe;
}

export let PopDate: PopDatetimeService;

export function SetPopDate(date: PopDatetimeService) {
  if (!PopDate) PopDate = date;
}

export let PopLog: PopLogService;

export function SetPopLogger(log: PopLogService) {
  if (!PopLog) PopLog = log;
}

export let PopEnv: Dictionary<any>;

export function SetPopEnv(env: Dictionary<any>) {
  if (!PopEnv) PopEnv = env;
}


export let PopComponentResolver: ComponentFactoryResolver;

export function SetPopComponentResolver(cfr: ComponentFactoryResolver) {
  if (!PopComponentResolver) PopComponentResolver = cfr;
}

export let PopRequest: PopRequestService;

export function SetPopRequest(request: PopRequestService) {
  if (!PopRequest) PopRequest = request;
}

export let PopExternalApi: PopRequestExternalService;

export function SetPopExternalApi(api: PopRequestExternalService) {
  if (!PopExternalApi) PopExternalApi = api;
}


export let PopPortal: PopEntityUtilPortalService;

export function SetPopPortal(portal: PopEntityUtilPortalService) {
  if (!PopPortal) PopPortal = portal;
}

export let PopHref: string;

export function SetPopHref(href: string) {
  if (href && typeof href === 'string') {
    PopHref = href;
  }
}

export let PopMessage: string;

export function SetPopMessage(message: string) {
  if (message && typeof message === 'string') {
    PopMessage = message;
  } else {
    PopMessage = undefined;
  }
}

export let PopCacheRedirectUrl: string;

export function SetPopCacheRedirectUrl(router: Router = null, url: string = null): void {
  if (router instanceof Router) {
    if (!url) url = router.url;
    PopCacheRedirectUrl = url;
    router.navigateByUrl('system/cache/clear', {skipLocationChange: true}).catch((e) => {
      console.log('e', e);
    });
  } else {
    PopCacheRedirectUrl = undefined;
  }
}


export let PopAuth: AuthDetails;

export function SetPopAuth(auth: AuthDetails) {
  if (auth && typeof auth === 'object' && auth !== null && Object.keys(auth).length) {
    PopAuth = JSON.parse(JSON.stringify(auth));
  }
}

export let PopBusiness: Business;

export function SetPopBusiness(business: Business) {
  if (business && typeof business === 'object' && business !== null && Object.keys(business).length) {
    PopBusiness = JSON.parse(JSON.stringify(business));
  }
}

export let PopApp: App;

export function SetPopApp(app: App) {
  if (app && typeof app === 'object' && app !== null && Object.keys(app).length) {
    PopApp = JSON.parse(JSON.stringify(app));
  }
}

export let PopUser: BusinessUser;

export function SetPopUser(user: BusinessUser) {
  if (user && typeof user === 'object' && user !== null && Object.keys(user).length) {
    PopUser = JSON.parse(JSON.stringify(user));
  }
}

export let PopFilter: CacFilter = {};

export function SetPopFilter(filter: CacFilter) {
  if (typeof filter === 'object' && filter !== null) {
    PopFilter = filter;
  }
}

export let PopSchemeComponent: PopEntitySchemeComponentService;

export function SetPopSchemeComponent(schemeComponent: PopEntitySchemeComponentService) {
  if (!PopSchemeComponent) PopSchemeComponent = schemeComponent;
}

export let PopRouteAliasMap: { client?: string; account?: string, campaign?: string, profile?: string };

export function SetPopRouteAliasMap(aliasMap: { client?: string; account?: string, campaign?: string, profile?: string }) {
  if (aliasMap && typeof aliasMap === 'object') PopRouteAliasMap = aliasMap;
}

export let PopAliasRouteMap: Dictionary<string> = {};

export function SetPopAliasRouteMap(routeMap: Dictionary<string>) {
  if (routeMap && typeof routeMap === 'object') PopAliasRouteMap = routeMap;
}


export let PopTemplate: PopTemplateService;

export function SetPopTemplate(srv: PopTemplateService) {
  if (!PopTemplate) PopTemplate = srv;
}

export const FIELD_CUSTOM_SETTING = new InjectionToken<Dictionary<FieldCustomSettingInterface>>('Field Custom Setting', {
  providedIn: 'root',
  factory: () => <Dictionary<FieldCustomSettingInterface>>{}
});

// export const APP_MENUS = new InjectionToken<Dictionary<FieldCustomSettingInterface>>('APP_MENUS', {
//   providedIn: 'root',
//   factory: () => <Dictionary<FieldCustomSettingInterface>>{}
// });

export interface AppMenusInterface {
  get: () => EntityMenu[];
  set: (menus: EntityMenu[]) => void;
  init: (menus: EntityMenu[]) => EntityMenu[];
}


export interface AppWidgetsInterface {
  get: () => EntityMenu[];
  set: (menus: EntityMenu[]) => void;
}


export interface AppThemeInterface {
  init: BehaviorSubject<boolean>;
  get: () => string;
  set: (theme: string, contrast: string) => void;
  isLoaded: () => boolean;
}


export interface AppGlobalInterface {
  isVerified: () => Promise<boolean>;
  setVerified: () => void;
  setModal: () => void;
  isModal: () => number;
  removeModal: () => void;
  isEntities: () => boolean;
  setEntities: (value: boolean) => void;
  isFilterBar: () => boolean;
  setFilterBar: (value: boolean) => void;
  isPipes: () => boolean;
  setPipes: (value: boolean) => void;
  isAliases: () => boolean;
  setAliases: (value: boolean) => void;
  isOpen: () => boolean;
  setOpen: (value: boolean) => void;
  isSecurity: () => boolean;
  setSecurity: (value: boolean) => void;
  isPermissions: () => boolean;
  setPermissions: (value: boolean) => void;
  init: BehaviorSubject<boolean>;
  verification: Subject<boolean>;
  _unload: Subject<boolean>;
}


export interface AppGlobalParamInterface {
  filter?: boolean; // will the app use the filter bar
  pipes?: boolean; // will the app heavily use the pipe service, meaning a lot thing will auto import into that
  aliases?: boolean; // will the app use aliases
  entities?: boolean; // will the app use entities menus from the database
  open?: boolean; // will the app be a public facing app
  security?: boolean; // will the app enforce security profiles
  permissions?: boolean; // will the app enforce security profiles
}


// export const APP_INITIALIZER_TASKS = new InjectionToken<Promise<boolean>[]>('App Initializer Tasks', {
//   providedIn: 'root',
//   factory: () => <Promise<boolean>[]>[]
// });

// ********************* Core  *************************************************


export interface CoreInterface {
  params: EntityParams;   // the base entityId definitions
  flag?: EntityFlagInterface;
  repo?: PopEntityRepoService;  // handles are server calls
  entity?: Entity | undefined; // the active record
  metadata?: Dictionary<any>; // additional input
  resource?: Dictionary<any>;
  preference?: EntityPreference; // the blueprint for field groups
}


export class CoreConfig {
  flag: EntityFlagInterface = {};
  params: EntityParams;
  repo: PopEntityRepoService;
  entity: Entity;
  resource: Dictionary<any> = {};
  metadata: object;
  preference: EntityPreference;
  access: EntityAccessInterface;
  channel?: EventEmitter<PopBaseEventInterface>;


  constructor(params?: CoreInterface) {
    if (params) for (const i in params) this[i] = params[i];
    if (!this.metadata) this.metadata = {};
  }
}


export interface EntityFilterInterface {
  entity: string;
  name: string;
  options: OptionItem[];
  path: string;
  parent_link: string | null;
  child_link: string | null;
  single: boolean;
  sort_order: number;
}


// ********************* Entity *********************


export interface Entity {
  id: number;
  name: string;
  client_id?: number;
  client_name?: string;
  account_id?: number;
  account_name?: string;
  campaign_id?: number;
  campaign_name?: string;
  created_at?: string;
  created_by_user_id?: string;
  description?: string;
  added_by_user_id?: number;
  added_by_user?: string;
  added_at?: string;
  updated_by_user_id?: string;
  updated_at?: string;
  deleted_by_user_id?: string;
  deleted_at?: string;
  internal_name?: string;
  scheme_id?: number;
  scheme_assets?: Dictionary<any>;
  ui?: Dictionary<any>;
  assignments?: Dictionary<any>;

  [key: string]: any;
}


export interface EntityAccessInterface {
  can_create: boolean | number;
  can_read: boolean | number;
  can_update: boolean | number;
  can_delete: boolean | number;
  can_destroy: boolean | number;
}


export interface EntityParamsInterface {
  alias?: { name: string, plural: string };
  access?: EntityAccessInterface;
  entityId?: number; // the entityId of the entityId,
  can_extend?: boolean;
  api?: string;
  app?: string;
  id?: number;
  internal_name: string;
  name: string;
  param?: string;
  path?: string; // the api path for the entityId
  cache?: boolean | number;
  refresh?: boolean;
}


export class EntityParams {
  // id = 0; // the entityId of the entityId
  alias?: { name: string, plural: string };
  access?: EntityAccessInterface;
  api = ''; // the api path of this entityId http:server/app/<api>
  app?: string; // the name of the app this entityId belongs to used on both local and server urls
  entityId?: number;
  can_extend = false;
  id: number;
  internal_name: string; // the internal name of this entityId ... client maybe aliased so we need to have a hard reference back to it
  name: string;
  path? = '';
  param? = '';
  refresh? = false;
  blockAssets? = false;


  constructor(params?: EntityParamsInterface) {
    if (params) for (const i in params) this[i] = params[i];
  }
}


export interface EntityFlagInterface {
  routeCheck?: boolean;
  assetCheck?: boolean;
  modalCheck?: boolean;
  refreshCheck?: boolean;

  [key: string]: boolean;
}


export interface EntityPreference {
  table: any;
  fields: any;
  filters: boolean;
  options: any;
}


export interface EntityFieldItemInterface {
  name?: string; // user assigned label for field use for header
  data?: Dictionary<any>; //
  items?: FieldItemInterface[];

  [key: string]: any;
}


export interface EntityModelInterface {
  action?: Dictionary<any>;
  dataSetter?: DataSetter;
  lastDataSetter?: DataSetter;
  decorator?: DataDecorator;
  entryAccess?: string[];
  filter?: DataFilter;
  tab?: TabConfig[];
  table?: EntityModelTableInterface;
  menu?: EntityModelMenuInterface;
  scheme?: Dictionary<any>;
  field?: Dictionary<FieldInterface>;
  resource?: Dictionary<ResourceInterface>;
  route?: ServiceRoutesInterface;
}


export class EntityExtendInterface {
  buttons?: TabButtonInterface[];
  can_read?: boolean | string;
  can_update?: boolean;
  debug?: boolean;
  goToUrl?: string;
  postUrl?: string;
  internal_name?: string;
  linkBehavior?: 'portal';
  parent?: string;
  parentId?: string | number;
  portal?: boolean;
  syncTabs?: boolean;
  width?: string | number;
  table?: EntityModelTableInterface;
  tabs?: TabConfig[];
}


export interface EntityModelTableInterface {
  advanced_search?: boolean;
  preference?: Dictionary<any>;
  button?: EntityModelTableButtonInterface;
  filter?: EntityModelTableFilterInterface;
  linkBehavior?: 'portal';
  extension?: EntityExtendInterface;
  permission?: Dictionary<boolean>;
  whitelist?: Dictionary<1>; // fields to always show
  blacklist?: Dictionary<1>; // fields to never show
  appendlist?: Dictionary<number | string | boolean>; // fields to never show
  route?: string;
}


export interface EntityModelTableFilterInterface {
  active?: boolean;
  display?: string;
  query?: Dictionary<string>;
  view?: string[];
  api?: EntityFilterInterface[];
}


export interface EntityModelTableButtonInterface {
  advanced_search?: boolean;
  archived?: boolean;
  custom?: any[];
  new?: boolean;
}


export interface EntityModelMenuInterface {
  button?: {
    archive?: boolean;
    clone?: boolean;
    custom?: any[];
    delete?: boolean;
    goBack?: boolean;
  };
  archiveKey?: string;
}

export interface SchemeComponentModelInterface {
  action?: Dictionary<any>;
  tab?: TabConfig[];
  component?: DynamicComponentInterface;
  resource?: Dictionary<ResourceInterface>;
  setting?: SchemeComponentSettingInterface;
  option?: Dictionary<any>;
}


export interface SchemeComponentSettingInterface {
  component?: DynamicComponentInterface;
  client_id?: number[];
  account_id?: number[];
  campaign_id?: number[];
  readonly?: boolean;

  [key: string]: any;
}


export interface SchemeComponentOptionInterface {
  component?: DynamicComponentInterface;
  client_id?: number[];
  account_id?: number[];
  campaign_id?: number[];
  startDate?: string;
  endDate?: string;

  [key: string]: any;
}


export interface SchemeComponentParamInterface {
  id?: string;
  internal_name?: string;
  name?: string;
}


export class SchemeComponentParams {
  id?: string;
  internal_name?: string; // the internal name of this entityId ... client maybe aliased so we need to have a hard reference back to it
  name?: string;


  constructor(params?: SchemeComponentParamInterface) {
    if (params) for (const i in params) this[i] = params[i];
  }
}


export interface SchemeComponentConfigInterface {
  cols?: number;
  component?: DynamicComponentInterface;
  config?: Dictionary<any>;
  faux?: string;
  group?: string;
  icon?: string;
  id?: string;
  internal_name?: string;
  minItemRows?: number;
  minItemCols?: number;
  name?: string;
  option?: SchemeComponentOptionInterface;
  param: SchemeComponentParamInterface;
  preferences?: Dictionary<any>;
  resource?: Dictionary<ResourceInterface>;
  rows?: number;
  setting?: SchemeComponentSettingInterface;
  type?: string;
  x?: number;
  y?: number;
  component_id?: number;
}


export class SchemeComponentConfig {
  cols?: number;
  component?: DynamicComponentInterface;
  config?: Dictionary<any>;
  faux?: string;
  group?: string;
  icon?: string;
  id?: string;
  internal_name?: string;
  minItemRows?: number;
  minItemCols?: number;
  name?: string;
  option?: SchemeComponentOptionInterface;
  param: SchemeComponentParamInterface;
  preferences?: Dictionary<any>;
  resource?: Dictionary<ResourceInterface>;
  rows?: number;
  setting?: SchemeComponentSettingInterface;
  type?: string;
  x?: number;
  y?: number;
  widget_id?: number;


  constructor(params?: SchemeComponentConfigInterface) {
    if (params) for (const i in params) this[i] = params[i];
  }
}


export interface SchemeComponentGroupInterface {
  id?: number | string;
  name?: string;
  widgets?: SchemeComponentConfigInterface[];
}


// ********************* Resource *************************************************

export interface ResourceInterface {
  name: string;
  defaultValue?: string | number | boolean;
  api_cache?: boolean | number;
  api_path?: string;
  api_when?: any[];

  api_path_vars?: Dictionary<string>;
  api_params?: QueryParamsInterface;
  api_version?: number;
  can_read?: string;
  data?: any;
  data_values?: OptionItem[];
  data_decorator?: DataDecorator;
  data_filter?: Dictionary<string | number | boolean>;
  data_setter?: DataSetter;
  data_when?: any[];
  data_storage?: 'data_values' | 'data';
}


export class ResourceConfig {
  name: string;
  defaultValue?: string | number | boolean = null;
  api_cache?: boolean | number = false;
  api_version? = 1;
  api_path? = '';
  api_when?: any[];
  api_path_vars?: Dictionary<string> = null;
  api_params?: QueryParamsInterface;
  can_read?: string;
  data?: any;
  data_values?: OptionItem[] = [];
  data_filter?: Dictionary<string | number | boolean> = null;
  data_setter?: DataSetter;
  data_decorator?: DataDecorator;
  data_when?: any[] = null;
  data_storage?: 'data_values' | 'data';


  constructor(params?: ResourceInterface) {
    if (params) for (const i in params) this[i] = params[i];
  }
}


// ********************* Fields *************************************************


export class FieldItemInterface {
  id?: number;
  active?: boolean | number;
  name?: string;
  component?: ComponentType<any>;
  config?: SideBySideConfig | LabelConfig | CheckboxConfig | InputConfig | NumberConfig | SelectConfig | SelectMultiConfig | RadioConfig | TextareaConfig | SwitchConfig | MinMaxConfig | MetadataConfig;
  custom_setting?: Dictionary<FieldCustomSettingInterface>;
  entry?: FieldEntry;
  field_id?: number;
  field_item_id?: number;
  model?: FieldItemModelInterface;
  view?: Dictionary<any>;
  rule?: Dictionary<string | number | boolean | any[]>;
  rules?: FieldItemRule[];
  table?: FieldItemTableInterace;
  trait?: FieldItemTrait;
  field?: Dictionary<string>;
  source?: FieldItemOption[];
  sourceMap?: KeyMap<number>;
  setting?: Dictionary<boolean | number | string | any[] | Dictionary<boolean | number | string>>;
  sort?: number;
}


export class FieldItemConfig {
  id?: number;
  active?: boolean | number;
  name?: string;
  custom_setting?: Dictionary<FieldCustomSettingInterface> = {};
  component: ComponentType<any>;
  config?: LabelConfig | CheckboxConfig | InputConfig | NumberConfig | SelectConfig | SelectMultiConfig | RadioConfig | TextareaConfig | SwitchConfig | MetadataConfig;
  entry?: FieldEntry;
  field?: Dictionary<string>;
  internal_name?: string;
  model?: FieldItemModelInterface;
  table?: FieldItemTableInterace;
  setting?: Dictionary<boolean | number | string | any[] | Dictionary<boolean | number | string>> = {};
  sort?: number;


  constructor(config?: FieldItemInterface) {
    for (const i in config) this[i] = config[i];
  }
}


export interface FieldCustomSettingInterface {
  id?: number;
  component?: ComponentType<any>;
  defaultValue?: boolean | number | string | any[] | Dictionary<boolean | number | string>;
  disabled?: boolean;
  field_id?: number;

  group?: string;
  helpText?: string;
  icon?: string;
  item?: string;
  items?: any;
  label?: string;
  modal?: ComponentType<any>;
  model?: string;
  multiple?: boolean;
  name: string;
  options?: FieldItemOptions;
  selected?: boolean;
  type: 'boolean' | 'expression' | 'validation' | 'transformation' | 'model' | 'primary' | 'fixed' | 'trait'; // just guesses at this point
  value?: boolean | number | string | any[] | Dictionary<boolean | number | string>;
  when?: any[];
}


export interface FieldEntry {
  disabled?: boolean;
  id: number;
  field_id: number;
  name: string;
  orphaned?: boolean;
  orphaned_at?: boolean | string;
  sort_order: number;
  type: string;
  traits: FieldCustomSettingInterface[];
}


export interface FieldItemPatchInterface {
  field: string;
  path: string;
  method?: 'POST' | 'PATCH';
  businessId?: number; // specify the business
  callback?: EventCallback;
  disabled?: boolean;  // allow for auto-patch to be disabled and but still allow to be called manually
  displayIndicator?: boolean;
  duration?: number;
  ignore401?: boolean;
  metadata?: {};
  trigger?: 'auto' | 'manual';
  version?: number;
  running?: boolean;
  success?: boolean;
  raw?: boolean;          // Set to True to patch raw value, aka not json_encode
  json?: boolean;          // Set to True to patch raw value, aka not json_encode
}


export interface FieldItemRule {
  id: number;
  field_id: number | null;
  field_item_id: number | null;
  name: string;
  defaultValue?: string | boolean | number | any[];
  value?: string | boolean | number | any[];
  source?: any[] | null;
  options?: any[] | null;
}


export interface FieldItemOptions {
  assigned?: any;
  child?: string;
  converted?: boolean;                      // Indicates that option list has already been parsed into an options set
  defaultValue?: string | number | boolean | any[];
  empty?: OptionItem;                       // Pass in an Option Item that you want to represent an unassigned value
  ensure?: OptionItem;
  nameKey?: 'string';
  parent?: string;
  preserveKeys?: string[];
  rawValues?: FieldItemOption[];
  values?: FieldItemOption[];
  resource?: string;
  sort?: boolean;
  prevent?: Array<string | number>;         // pass in ids of an Option Items that you don't want in list
}


export interface FieldItemOption {
  value: number | string;
  name: string;
  group?: string;
  groupFk?: number;
  level?: number;
  indentation?: number;
  mode?: number | string;
  sort_order?: number;
  selected?: boolean;
  hidden?: boolean;
}


export interface FieldItemTableInterace {
  sort?: number;
  visible?: boolean;
  transformation?: any;
  hidden?: boolean;
}


export interface FieldItemTrait {
  metadata?: boolean;
  primary?: boolean;
  bubble?: boolean;
  readonly?: boolean;
  unique?: boolean;
  secure?: boolean;
}


export interface FieldOptionsInterface {
  layout?: string;
  legend?: boolean;
  bubble?: boolean;

  [key: string]: any;
}


export interface FieldItemModelInterface {
  active?: boolean;
  all?: boolean;
  allowAll?: boolean;
  allowGroupAll?: boolean;
  allOverlay?: boolean;
  allOverlayEnabled?: boolean;
  allOverlayLabel?: string;
  allOverlayMessage?: string;
  allOverlayCallback?: EventCallback;
  api_path?: string;
  api_column?: string;
  api_metadata?: object | any[];
  assign_all?: boolean;
  autoFill?: boolean;
  autoSize?: boolean;
  autofocus?: boolean;
  autoselect?: boolean;
  assignedLabel?: string;
  bubble?: boolean;
  button?: boolean;

  border?: boolean;
  checkbox?: { visible?: boolean, sort?: number };      // [Table: 'Display a selectable checkbox:extraction: a little muddy']
  name?: string;
  className?: string;
  copyLabel?: boolean;         // [Label: The label text has a click to copy]
  copyLabelDisplay?: string;  // [Label: The label that should go with the label copy button]
  copyLabelBody?: string | number;    // [Label: The value that be copied when the label copy button is clicked]
  copyLabelDisplayTransformation?: any; // The transformation that should happen to the copyLabelDisplay
  copyLabelBodyTransformation?: any; // The transformation that should happen to the copyLabelBody

  copyValue?: boolean;         // [Label: The value text has a click to copy]
  copyValueDisplay?: string;  // [Label: The value that should go with the value copy button]
  copyValueBody?: string | number;    // [Label: The value that be copied when the label value button is clicked]
  copyValueDisplayTransformation?: any; // The transformation that should happen to the copyLabelDisplay
  copyValueBodyTransformation?: any; // The transformation that should happen to the copyLabelBody

  display?: string;     // [Univr: 'the label of the field/name']
  displayTitle?: boolean;
  displayHelper?: boolean;
  entry?: FieldEntry;
  empty?: 'ConvertEmptyToNull' | 'ConvertEmptyToZero';
  filter?: boolean;
  filterPredicate?: string | DateFilterPredicate;
  helpText?: string;  // [Univr: 'Creates a tooltip that displays this value :usage: <'The is some helpful information about this field'>']
  helper?: string;       // [Univr: 'A navigation mechanism: a combo of tooltip, route, and helpText: usage < 'Go to <client>' : extraction : Will look on the active record to find the actual value of client to display inn tooltip and also look for 'client' + '_fk' to create a route
  hidden?: boolean;
  html?: string;
  route?: string;        // [Univr: 'Navigate on click target':extraction: If a field or name navigates, this value needs to till it where to go]
  subLabel?: string;
  subValue?: string;
  id?: string | number;
  icon?: string;        // Material icon
  iconType?: string;
  link?: boolean;       // [Univr: 'Indicate <hype-route> text':extraction:Displays the value as a hyperlink, fires a event when clicked]
  order?: number;      // [Univr: 'left to right (horizontal) position']
  sort?: number;       // [Univr: 'top to bottom (vertical) position']
  visible?: boolean;    // [Table: 'Set to true to see in table view']
  // show name'

  form?: string;       // [Field: 'html input type <'input' | 'select' | 'textarea' | 'radio' | 'checkbox' | 'switch' | 'metadata'>  'metadata' will not display an html capture but will append field=>value to metadata']
  value?: any;         // [Field: 'A default/existing value on the html capture'
  header?: string | number | boolean;
  height?: string | number;
  hint?: boolean;
  hintText?: string;
  maxHeight?: number;
  interval?: string;
  disabled?: boolean;   // [Field: 'Disabled']
  facade?: boolean;    // [Field: 'Set to true to signal that this field is a client side mechanism (filter, helper, toggle),effects no actual value on the server side(no patch)]
  label?: string;     // [Univr: 'the label of the field/name']
  labelButton?: boolean;  // Display the label with a button
  labelPosition?: string;
  layout?: string;
  list?: any;
  min?: number;         // [Field: 'min value']
  max?: number;         // [Field: 'max value']
  mode?: any;
  maxColumn?: string;
  maxlength?: number;   // [Field: 'maxlength:default:64]
  minHeight?: number;   // [Field: 'maxlength:default:64]
  minlength?: number;   // [Field: 'maxlength:default:64]
  minValue?: number;
  maxValue?: number;
  minColumn?: string;
  metadata?: object;   // [Field: 'maxlength:default:64]
  noInitialValue?: boolean;
  multiple?: boolean;
  options?: FieldItemOptions;   // [Field: 'maxlength:default:64]
  optionsLabel?: string;
  patch?: FieldItemPatchInterface;
  prevent?: any[];
  pattern?: string;     // [Field: 'regex pattern:default:'AlphaNumeric']
  preserve?: boolean;
  required?: boolean | number;   // [Field: 'set to false to bypass required validator:default:true']


  removeAll?: boolean;
  readonly?: boolean;   // [Field: 'Html attribute']
  reset?: boolean;       // Flags whether the view should be reset if this field changes
  step?: number;
  mask?: string;        // [Field: 'Input Mask']
  prefix?: string;      // [Field: 'Set a prefix on the html capture .. $, does not get stored on captured value']
  session?: boolean;
  sessionPath?: string;
  size?: number;
  suffix?: string;      // [Field: 'Set a prefix on the html capture .. '%', does not get stored on captured value']
  transformation?: any;
  tabOnEnter?: boolean;           // Convert enter to a tab when control is valid, default is false ie .. set to true when you want to moved down a form list
  time?: string;
  truncate?: number;
  textOverflow?: 'ellipsis' | 'wrap'; // Text overflow behavior,
  type?: string;
  validators?: Array<Validators>; // Array of Validators.
  valueButton?: boolean;  // Display the value with a button
  valueButtonDisabled?: boolean;  // Display the value with a button
  valueButtonDisplay?: string;  // The label that should go with the label value button
  valueButtonDisplayTransformation?: any;  // The transformation that should happen to the valueButtonDisplay
  warning?: string | number | boolean;
  when?: any[];         // [Field: 'Pass an array of strings <['name[:value]']> that should be truthful for this field to show.// ['account_fk'] ..ie  <['account_fk']> account_fk just needs to be defined or <['client_fk', 'account_fk:88']> client just needs to be defined, account_fk has to be 88']
}


export interface FieldInterface {
  canAdd?: boolean;
  canRemove?: boolean;
  configs?: { field_configs: FieldCustomSettingInterface[ ], item_configs: KeyMap<FieldCustomSettingInterface[]> };
  custom_rule?: Dictionary<any>;
  custom_setting?: Dictionary<FieldCustomSettingInterface>;
  custom?: boolean;
  component?: ComponentType<any>;
  ancillary?: boolean | number;
  children?: Dictionary<FieldItemInterface>;
  data?: any;
  data_keys?: any[];
  entries?: FieldEntry[];
  metadata?: Dictionary<any>;
  multiple?: boolean;
  multiple_min?: number;
  multiple_max?: number;
  multiple_max_limit?: number;
  facade?: boolean;
  fieldgroup?: Entity;
  hidden?: boolean;
  id?: number | string;
  internal_name?: string;
  model?: FieldItemModelInterface;
  items?: KeyMap<FieldItemInterface>;
  itemMap?: any;
  name?: string;
  label?: string;
  options?: Dictionary<any>;
  position?: number;
  primary?: boolean;
  setting?: Dictionary<boolean | number | string | any[] | Dictionary<boolean | number | string>>;
  show_name?: boolean;
  sort?: number;
  state?: 'template_edit' | 'template_readonly' | 'text_single' | 'text_format';
  table?: Dictionary<any>;
  trait?: Dictionary<any>;
  value?: any;
  view?: Dictionary<any>;
  when?: any;
}


export class FieldConfig {
  canAdd = false;
  canRemove = false;
  children?: Dictionary<FieldItemInterface>;
  component: ComponentType<any>;
  configs?: { field_configs: FieldCustomSettingInterface[ ], item_configs: KeyMap<FieldCustomSettingInterface[]> };
  custom_rule?: Dictionary<any>;
  custom_setting?: Dictionary<FieldCustomSettingInterface> = {};
  data?: any = {};
  data_keys: any[] = [];
  facade? = false;
  fieldgroup?: Entity;
  entry?: FieldEntry;
  entries?: FieldEntry[] = [];
  metadata? = {};
  multiple = false;
  multiple_min? = 1;
  multiple_max? = 1;
  multiple_max_limit? = 10;

  id = null;
  internal_name?: string;

  items?: any;
  itemMap: any;
  name = '';
  label: string;
  modal?: ComponentType<any>;
  show_name = true;
  options = <FieldOptionsInterface>{};
  primary?: boolean;
  setting?: Dictionary<boolean | number | string | any[] | Dictionary<boolean | number | string>> = {};
  sort? = 99;
  state: 'template_edit' | 'template_readonly' | 'text_single' | 'text_format' = 'template_edit';
  view?: Dictionary<any>;


  // onEvent: Subject<PopBaseEventInterface>;


  constructor(params?: FieldInterface) {
    if (params) for (const i in params) this[i] = params[i];
    if (!this.options) this.options = {};
  }
}


// ********************* FIELD GROUPS *************************************************


export interface FieldGroupInterface {
  id?: string | number;
  header?: string;
  border?: boolean;
  position?: string;
  debug?: boolean;
  layout?: 'row' | 'column';
  metadata?: object;   // Any metadata desired.
  fields?: FieldInterface[];
  fieldMap?: object;
}


export class FieldGroupConfig {
  id?: string | number;
  header? = '';
  border? = false;
  position? = 'left';
  debug? = false;
  layout?: 'row' | 'column' = 'column';
  metadata?: object = {};   // Any metadata desired.
  fields?: FieldInterface[] = [];
  fieldMap?: object;


  constructor(params?: FieldGroupInterface) {
    if (params) for (const i in params) this[i] = params[i];
  }
}


export interface SectionInterface {
  id: string;
  active?: boolean;
  name?: string;
  path?: string;
  inputs?: object;
  component: ComponentType<any>;
  metadata?: object;
  requireRefresh?: boolean;        // require an api call to refresh the entityId on every load
}


export class SectionConfig {
  id: string;
  name?: string;
  path? = '';
  metadata?: object;
  inputs = {};
  component: ComponentType<any>;
  visible = true;
  require_refresh? = false;


  constructor(params: SectionInterface) {
    if (params) for (const i in params) this[i] = params[i];
    if (!this.name) this.name = this.id.replace(/_/g, ' ').replace(/(?:^|\s)\S/g, function (a) {
      return a.toUpperCase();
    });

    if (!this.path) this.path = this.id.replace(/_/g, '-').toLowerCase();
    if (!this.metadata) this.metadata = {};
  }
}


export interface TabSectionBarInterface {
  name: string;
  params: EntityParams;
  access?: EntityAccessInterface;
  field?: Dictionary<any>;
  action?: Dictionary<any>;
  repo?: PopEntityRepoService;
  entity?: Entity;
  preference?: EntityPreference;
  sections?: Array<SectionConfig>;
  metadata?: any;
}


export class TabSectionBarConfig {
  access: EntityAccessInterface = {
    can_create: false,
    can_read: false,
    can_update: false,
    can_delete: false,
    can_destroy: false,
  };
  params: EntityParams;
  repo: PopEntityRepoService;
  entity: Entity;
  field?: Dictionary<any>;
  action?: Dictionary<any>;
  preference: EntityPreference;
  metadata?: any;
  name = '';
  sections: Array<SectionConfig> = [];


  constructor(params?: TabSectionBarInterface) {
    if (params) for (const i in params) this[i] = params[i];
    if (!this.metadata) this.metadata = {};
  }
}


export interface FieldParamInterface {
  column: string;
  name: string;   // the base entityId definitions
  label: string;
  value: number | string | boolean;
  defaultValue: number | string | boolean;
  default_value: number | string | boolean;
  metadata: Dictionary<any>;
  params: any;
  options?: FieldItemOptions;
  helpText?: string;
  patch?: FieldItemPatchInterface;
  facade?: boolean;
  readonly: boolean;
  required: boolean;
  min?: number;
  max?: number;
}


export interface Dictionary<T> {
  [key: string]: T;
}


export interface KeyMap<T> {
  [key: number]: T;
}


export interface DynamicComponentInterface {
  type: ComponentType<any>;
  inputs?: Dictionary<number | string | boolean | object | any[]>;
  position?: number;
  when?: any;
  ancillary?: boolean | number;
  hidden?: boolean;
  sort?: number;
}


export interface QueryParamsInterface {
  archived?: -1 | 0 | 1;
  related?: boolean;
  bypassFilters?: boolean;
  bypassParams?: boolean;
  select?: string;
  with?: string;
  bypassCache?: boolean;
  cache?: boolean;
  cacheKey?: string;
}


export interface PopBaseEventInterface {
  type: string;                             // (*required)  this should be a generic name of the source component  ..ie field, table, tab, button
  source: string;                           // the name of the Component that the event came from
  name: string;                             // (*required)  this should be specific to the event ie ... blur, patch, focus, onValueChange

  channel?: boolean;                        // (optional)   This sets a flag that this event has already be sent across the channel, and should NOT be sent across the channel again
  session?: boolean;                        // (optional)   This sets a flag that this event created a onSession event

  access?: string;                          // (optional)   This should be a crud access
  config?: any;                             // (optional)   This should be the source component's configuration
  core?: CoreConfig;                        // (optional)   This should be an core

  data?: any;                               // (optional)   Used for tracking a changed value
  data_key?: number;                        // (optional)   data index
  id?: string | number;                     // (optional)   Misc, used to track between events of modules that are similar
  ids?: any[];                              // (optional)   Misc, used to track between events of modules that are similar
  entity?: Entity;
  form?: FormGroup;                         // (optional)   Form Group of fieldItems
  group?: FieldItemGroupConfig;             // (optional)   The Field Group Config that this event source belongs to .. ie will give you permissons to the config of other fieldItems in the group
  field?: FieldInterface;                   // (optional)   Core Field Interface
  fields?: Dictionary<FieldInterface>;                   // (optional)   Core Field Interface
  column?: string;                          // (optional)   The field item entityId
  fieldgroup?: FieldGroupConfig;            // (optional)   The Field Group Config that this event source belongs to .. ie will give you permissons to the config of other fieldItems in the group
  internal_name?: string;                   // (optional)
  message?: string;                         // (optional)   Helpful language
  metadata?: any;                           // (optional)   Additional info
  method?: string;                          // (optional)   This should be a entityId name create, read, store, delete
  model?: any;                              // (optional)   This should be the field configuration model that a field config is built off
  open?: boolean;                            //
  option?: any;                              //

  tab?: TabConfig;                          // (optional)   The tab config that this event occurred from, ie ... will contain a mapping of the view, ie ... allow you to reload all/portion of the view
  target?: string;                           // the name of the Component that the event should go to
  component?: TabComponentInterface;        // (optional)   The tab component config that this event occurred from, ie ... will contain a mapping of the specific tab section of the view
  options?: any[];                          // (optional)   Used to track options of selects fieldItems, sidebyside, radios
  position?: string;                        // (optional)   This should reference a template position ie ... left, center, right
  success?: boolean;                        // (optional)   Specify if a event was successful ie.. patch
  refresh?: boolean;                        //
  response?: any;                           // (optional)   The server response on a patch
  value?: boolean;                          // (optional)   Specify a certain value ie.. patch
  cdr?: ChangeDetectorRef;                  // (optional)   Reload Tab Position

}


/**
 * Method to travel up dom of element until a height is found
 * @param el
 */

export function ParentHeightSetter(el: ElementRef, className: string = null) {
  let height = 0;
  let maxHeight = 0;
  let attempts = 20;
  if (el && el.nativeElement && el.nativeElement.parentElement) {
    let parent = el.nativeElement.parentElement;
    while (!height && attempts) {
      if (parent.clientHeight) {
        if (parent.clientHeight > maxHeight) {
          maxHeight = parent.clientHeight;
        }
        if (className) {
          if (parent.classList && parent.classList.contains(className)) {
            height = parent.clientHeight;
          }
        } else {
          height = parent.clientHeight;
        }
      }
      if (!height && parent.parentElement) {
        parent = parent.parentElement;

      }
      attempts--;
    }
  }
  if (!height && maxHeight) height = maxHeight;

  return height;
}


export interface OptionItem {
  id?: string | number;
  value?: string | number | null;
  name: string;
  label?: string;
  sort?: number;
  active?: number | boolean;
  compact?: boolean;
}


export interface OptionParamsInterface {
  key?: string;                             // the default key is 'entityId' ie.. it is going to look for the entityId of the passing in options and convert it to setKey which should be 'value'
  setKey?: string;                          // the default key is 'value', not really an reason to subject ... yet
  nameKey?: string;                          // the default key is 'name', this is the column that should be used to present the "name" of the item
  tags?: string[];                          // cant remember
  sort?: boolean;                           // If set to true, will sort based off of key
  group?: string;                           // set a default group on the options
  activeKey?: string;                        // which key should be used for active
  groupKey?: string;                        // which key should be used for the grouping
  groupFkKey?: string;                      // which key should be used for the groupFk
  parent?: { field: string, value: number };// If Set, all options that do not have field:value match will be removed
  level?: number;                           // Set an indentation level
  empty?: OptionItem;                       // Pass in an Option Item that you want to represent an unassigned value
  preserveKeys?: Array<string>;             // pass in keys that should remain in the list
  prevent?: Array<string | number>;         // pass in ids of an Option Items that you don't want in list
  ensure?: OptionItem;                      // Pass in an Option item that has to be in the list ... ie maybe the assigned value is archived and does not come through
  converted?: boolean;
  hasEmpty?: boolean;
}


export interface EntityActionInterface {
  name: string;
  bubbleAll?: boolean;
  component?: DynamicComponentInterface;
  blockEntity?: boolean;
  facade?: boolean;
  facadeDuration?: number;
  fields?: Dictionary<any>;
  header?: string;
  width?: string;
  submitText?: string;
  cancelText?: string;
  label?: string;
  postUrl?: string;
  goToUrl?: string;
  http?: 'POST' | 'PATCH' | 'DELETE' | 'GET';
  responseType?: 'form' | 'boolean' | 'store';
  store?: Dictionary<any>;
  active?: boolean | number;
  callback?: EventCallback;
  onEvent?: EventPromiseCallback;
}


export interface EntityActionDataInterface {
  core: CoreConfig;
  action?: EntityActionInterface;
  actionName?: string;
  extension?: EntityExtendInterface;
}


export interface EntitySuccessDataInterface {
  header: string;
  message: string;
  submitText?: string;
}


export interface ServiceRoutesInterface {
  get?: {
    entity?: ServiceRouteInterface;
    entities?: ServiceRouteInterface;
    config?: ServiceRouteInterface;
    preference?: ServiceRouteInterface;
  };
  patch?: {
    entity: ServiceRouteInterface;
    entities?: ServiceRouteInterface;
  };
  archive?: {
    entity?: ServiceRouteInterface;
  };
  restore?: {
    entity?: ServiceRouteInterface;
  };
}


export interface ServiceRouteInterface {
  path: string;
  params?: ServiceRouteParamInterface;
}


export interface ServiceRouteParamInterface {
  with?: string;
  select?: string;

  [key: string]: string | boolean | number | number[];
}




