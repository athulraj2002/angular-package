import { ChangeDetectorRef, ComponentFactoryResolver, ElementRef, InjectionToken, Injector } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { FormGroup, Validators } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { FieldItemGroupConfig } from './modules/base/pop-field-item-group/pop-field-item-group.model';
import { TabButtonInterface, TabComponentInterface, TabConfig } from './modules/base/pop-tab-menu/tab-menu.model';
import { PopEntityRepoService } from './modules/entity/services/pop-entity-repo.service';
import { LabelConfig, MetadataConfig } from './modules/base/pop-field-item/pop-label/label-config.model';
import { CheckboxConfig } from './modules/base/pop-field-item/pop-checkbox/checkbox-config.model';
import { InputConfig } from './modules/base/pop-field-item/pop-input/input-config.model';
import { SelectConfig } from './modules/base/pop-field-item/pop-select/select-config.model';
import { SelectMultiConfig } from './modules/base/pop-field-item/pop-select-multi/select-mulit-config.model';
import { RadioConfig } from './modules/base/pop-field-item/pop-radio/radio-config.model';
import { TextareaConfig } from './modules/base/pop-field-item/pop-textarea/textarea-config.model';
import { SwitchConfig } from './modules/base/pop-field-item/pop-switch/switch-config.model';
import { SideBySideConfig } from './modules/base/pop-side-by-side/pop-side-by-side.model';
import { MinMaxConfig } from './modules/base/pop-field-item/pop-min-max/min-max.models';
import { PopLogService } from './services/pop-log.service';
import { NumberConfig } from './modules/base/pop-field-item/pop-number/number-config.model';
import { PopTemplateService } from './modules/app/pop-template.service';
import { App, AuthDetails, Business, BusinessUser } from './pop-common-token.model';
import { CacFilter } from './modules/app/pop-cac-filter/pop-cac-filter.model';
import { PopPipeService } from './services/pop-pipe.service';
import { PopDatetimeService } from './services/pop-datetime.service';
import { PopRequestService } from './services/pop-request.service';
import { PopEntityService } from './modules/entity/services/pop-entity.service';
import { PopRouteHistoryResolver } from './services/pop-route-history.resolver';
import { PopEntityUtilPortalService } from './modules/entity/services/pop-entity-util-portal.service';
import { EntityMenu } from './modules/app/pop-left-menu/entity-menu.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ComponentDomInterface } from './pop-common-dom.models';
import { PopRequestExternalService } from './services/pop-request-external.service';
import { PopDomService } from './services/pop-dom.service';
import { DateFilterPredicate } from './modules/base/pop-field-item/pop-date/date-config.model';
import { PopEntitySchemeComponentService } from "./modules/entity/services/pop-entity-scheme-component.service";
export declare type EventCallback = (core: CoreConfig, event: PopBaseEventInterface, dom?: ComponentDomInterface) => void;
export declare type EventPromiseCallback = (core: CoreConfig, event: PopBaseEventInterface, dom?: ComponentDomInterface) => Promise<any>;
export declare type OutletReset = (position?: number) => void;
export declare type PopTask = () => void;
export declare type DataFactory = (id?: number, archived?: boolean | number) => Promise<any[]>;
export declare type DataDecorator = (core: CoreConfig, entity: Entity) => Entity;
export declare type DataFilter = (entity: Entity) => boolean;
export declare type DataSetter = (core: CoreConfig, data: any, domRepo?: PopDomService) => any;
export declare let ServiceInjector: Injector;
export declare function SetServiceInjector(injector: Injector): void;
export declare let PopEntity: PopEntityService;
export declare function SetPopEntity(entity: PopEntityService): void;
export declare let PopHistory: PopRouteHistoryResolver;
export declare function SetPopHistory(history: PopRouteHistoryResolver): void;
export declare let PopPipe: PopPipeService;
export declare function SetPopPipe(pipe: PopPipeService): void;
export declare let PopDate: PopDatetimeService;
export declare function SetPopDate(date: PopDatetimeService): void;
export declare let PopLog: PopLogService;
export declare function SetPopLogger(log: PopLogService): void;
export declare let PopEnv: Dictionary<any>;
export declare function SetPopEnv(env: Dictionary<any>): void;
export declare let PopComponentResolver: ComponentFactoryResolver;
export declare function SetPopComponentResolver(cfr: ComponentFactoryResolver): void;
export declare let PopRequest: PopRequestService;
export declare function SetPopRequest(request: PopRequestService): void;
export declare let PopExternalApi: PopRequestExternalService;
export declare function SetPopExternalApi(api: PopRequestExternalService): void;
export declare let PopPortal: PopEntityUtilPortalService;
export declare function SetPopPortal(portal: PopEntityUtilPortalService): void;
export declare let PopHref: string;
export declare function SetPopHref(href: string): void;
export declare let PopMessage: string;
export declare function SetPopMessage(message: string): void;
export declare let PopCacheRedirectUrl: string;
export declare function SetPopCacheRedirectUrl(router?: Router, url?: string): void;
export declare let PopAuth: AuthDetails;
export declare function SetPopAuth(auth: AuthDetails): void;
export declare let PopBusiness: Business;
export declare function SetPopBusiness(business: Business): void;
export declare let PopApp: App;
export declare function SetPopApp(app: App): void;
export declare let PopUser: BusinessUser;
export declare function SetPopUser(user: BusinessUser): void;
export declare let PopFilter: CacFilter;
export declare function SetPopFilter(filter: CacFilter): void;
export declare let PopSchemeComponent: PopEntitySchemeComponentService;
export declare function SetPopSchemeComponent(schemeComponent: PopEntitySchemeComponentService): void;
export declare let PopRouteAliasMap: {
    client?: string;
    account?: string;
    campaign?: string;
    profile?: string;
};
export declare function SetPopRouteAliasMap(aliasMap: {
    client?: string;
    account?: string;
    campaign?: string;
    profile?: string;
}): void;
export declare let PopAliasRouteMap: Dictionary<string>;
export declare function SetPopAliasRouteMap(routeMap: Dictionary<string>): void;
export declare let PopTemplate: PopTemplateService;
export declare function SetPopTemplate(srv: PopTemplateService): void;
export declare const FIELD_CUSTOM_SETTING: InjectionToken<Dictionary<FieldCustomSettingInterface>>;
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
    filter?: boolean;
    pipes?: boolean;
    aliases?: boolean;
    entities?: boolean;
    open?: boolean;
    security?: boolean;
    permissions?: boolean;
}
export interface CoreInterface {
    params: EntityParams;
    flag?: EntityFlagInterface;
    repo?: PopEntityRepoService;
    entity?: Entity | undefined;
    metadata?: Dictionary<any>;
    resource?: Dictionary<any>;
    preference?: EntityPreference;
}
export declare class CoreConfig {
    flag: EntityFlagInterface;
    params: EntityParams;
    repo: PopEntityRepoService;
    entity: Entity;
    resource: Dictionary<any>;
    metadata: object;
    preference: EntityPreference;
    access: EntityAccessInterface;
    channel?: EventEmitter<PopBaseEventInterface>;
    constructor(params?: CoreInterface);
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
    alias?: {
        name: string;
        plural: string;
    };
    access?: EntityAccessInterface;
    entityId?: number;
    can_extend?: boolean;
    api?: string;
    app?: string;
    id?: number;
    internal_name: string;
    name: string;
    param?: string;
    path?: string;
    cache?: boolean | number;
    refresh?: boolean;
}
export declare class EntityParams {
    alias?: {
        name: string;
        plural: string;
    };
    access?: EntityAccessInterface;
    api: string;
    app?: string;
    entityId?: number;
    can_extend: boolean;
    id: number;
    internal_name: string;
    name: string;
    path?: string;
    param?: string;
    refresh?: boolean;
    blockAssets?: boolean;
    constructor(params?: EntityParamsInterface);
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
    name?: string;
    data?: Dictionary<any>;
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
export declare class EntityExtendInterface {
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
    whitelist?: Dictionary<1>;
    blacklist?: Dictionary<1>;
    appendlist?: Dictionary<number | string | boolean>;
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
export declare class SchemeComponentParams {
    id?: string;
    internal_name?: string;
    name?: string;
    constructor(params?: SchemeComponentParamInterface);
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
export declare class SchemeComponentConfig {
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
    constructor(params?: SchemeComponentConfigInterface);
}
export interface SchemeComponentGroupInterface {
    id?: number | string;
    name?: string;
    widgets?: SchemeComponentConfigInterface[];
}
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
export declare class ResourceConfig {
    name: string;
    defaultValue?: string | number | boolean;
    api_cache?: boolean | number;
    api_version?: number;
    api_path?: string;
    api_when?: any[];
    api_path_vars?: Dictionary<string>;
    api_params?: QueryParamsInterface;
    can_read?: string;
    data?: any;
    data_values?: OptionItem[];
    data_filter?: Dictionary<string | number | boolean>;
    data_setter?: DataSetter;
    data_decorator?: DataDecorator;
    data_when?: any[];
    data_storage?: 'data_values' | 'data';
    constructor(params?: ResourceInterface);
}
export declare class FieldItemInterface {
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
export declare class FieldItemConfig {
    id?: number;
    active?: boolean | number;
    name?: string;
    custom_setting?: Dictionary<FieldCustomSettingInterface>;
    component: ComponentType<any>;
    config?: LabelConfig | CheckboxConfig | InputConfig | NumberConfig | SelectConfig | SelectMultiConfig | RadioConfig | TextareaConfig | SwitchConfig | MetadataConfig;
    entry?: FieldEntry;
    field?: Dictionary<string>;
    internal_name?: string;
    model?: FieldItemModelInterface;
    table?: FieldItemTableInterace;
    setting?: Dictionary<boolean | number | string | any[] | Dictionary<boolean | number | string>>;
    sort?: number;
    constructor(config?: FieldItemInterface);
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
    type: 'boolean' | 'expression' | 'validation' | 'transformation' | 'model' | 'primary' | 'fixed' | 'trait';
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
    businessId?: number;
    callback?: EventCallback;
    disabled?: boolean;
    displayIndicator?: boolean;
    duration?: number;
    ignore401?: boolean;
    metadata?: {};
    trigger?: 'auto' | 'manual';
    version?: number;
    running?: boolean;
    success?: boolean;
    raw?: boolean;
    json?: boolean;
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
    converted?: boolean;
    defaultValue?: string | number | boolean | any[];
    empty?: OptionItem;
    ensure?: OptionItem;
    nameKey?: 'string';
    parent?: string;
    preserveKeys?: string[];
    rawValues?: FieldItemOption[];
    values?: FieldItemOption[];
    resource?: string;
    sort?: boolean;
    prevent?: Array<string | number>;
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
    checkbox?: {
        visible?: boolean;
        sort?: number;
    };
    name?: string;
    className?: string;
    copyLabel?: boolean;
    copyLabelDisplay?: string;
    copyLabelBody?: string | number;
    copyLabelDisplayTransformation?: any;
    copyLabelBodyTransformation?: any;
    copyValue?: boolean;
    copyValueDisplay?: string;
    copyValueBody?: string | number;
    copyValueDisplayTransformation?: any;
    copyValueBodyTransformation?: any;
    display?: string;
    displayTitle?: boolean;
    displayHelper?: boolean;
    entry?: FieldEntry;
    empty?: 'ConvertEmptyToNull' | 'ConvertEmptyToZero';
    filter?: boolean;
    filterPredicate?: string | DateFilterPredicate;
    helpText?: string;
    helper?: string;
    hidden?: boolean;
    html?: string;
    route?: string;
    subLabel?: string;
    subValue?: string;
    id?: string | number;
    icon?: string;
    iconType?: string;
    link?: boolean;
    order?: number;
    sort?: number;
    visible?: boolean;
    form?: string;
    value?: any;
    header?: string | number | boolean;
    height?: string | number;
    hint?: boolean;
    hintText?: string;
    maxHeight?: number;
    interval?: string;
    disabled?: boolean;
    facade?: boolean;
    label?: string;
    labelButton?: boolean;
    labelPosition?: string;
    layout?: string;
    list?: any;
    min?: number;
    max?: number;
    mode?: any;
    maxColumn?: string;
    maxlength?: number;
    minHeight?: number;
    minlength?: number;
    minValue?: number;
    maxValue?: number;
    minColumn?: string;
    metadata?: object;
    noInitialValue?: boolean;
    multiple?: boolean;
    options?: FieldItemOptions;
    optionsLabel?: string;
    patch?: FieldItemPatchInterface;
    prevent?: any[];
    pattern?: string;
    preserve?: boolean;
    required?: boolean | number;
    removeAll?: boolean;
    readonly?: boolean;
    reset?: boolean;
    step?: number;
    mask?: string;
    prefix?: string;
    session?: boolean;
    sessionPath?: string;
    size?: number;
    suffix?: string;
    transformation?: any;
    tabOnEnter?: boolean;
    time?: string;
    truncate?: number;
    textOverflow?: 'ellipsis' | 'wrap';
    type?: string;
    validators?: Array<Validators>;
    valueButton?: boolean;
    valueButtonDisabled?: boolean;
    valueButtonDisplay?: string;
    valueButtonDisplayTransformation?: any;
    warning?: string | number | boolean;
    when?: any[];
}
export interface FieldInterface {
    canAdd?: boolean;
    canRemove?: boolean;
    configs?: {
        field_configs: FieldCustomSettingInterface[];
        item_configs: KeyMap<FieldCustomSettingInterface[]>;
    };
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
export declare class FieldConfig {
    canAdd: boolean;
    canRemove: boolean;
    children?: Dictionary<FieldItemInterface>;
    component: ComponentType<any>;
    configs?: {
        field_configs: FieldCustomSettingInterface[];
        item_configs: KeyMap<FieldCustomSettingInterface[]>;
    };
    custom_rule?: Dictionary<any>;
    custom_setting?: Dictionary<FieldCustomSettingInterface>;
    data?: any;
    data_keys: any[];
    facade?: boolean;
    fieldgroup?: Entity;
    entry?: FieldEntry;
    entries?: FieldEntry[];
    metadata?: {};
    multiple: boolean;
    multiple_min?: number;
    multiple_max?: number;
    multiple_max_limit?: number;
    id: any;
    internal_name?: string;
    items?: any;
    itemMap: any;
    name: string;
    label: string;
    modal?: ComponentType<any>;
    show_name: boolean;
    options: FieldOptionsInterface;
    primary?: boolean;
    setting?: Dictionary<boolean | number | string | any[] | Dictionary<boolean | number | string>>;
    sort?: number;
    state: 'template_edit' | 'template_readonly' | 'text_single' | 'text_format';
    view?: Dictionary<any>;
    constructor(params?: FieldInterface);
}
export interface FieldGroupInterface {
    id?: string | number;
    header?: string;
    border?: boolean;
    position?: string;
    debug?: boolean;
    layout?: 'row' | 'column';
    metadata?: object;
    fields?: FieldInterface[];
    fieldMap?: object;
}
export declare class FieldGroupConfig {
    id?: string | number;
    header?: string;
    border?: boolean;
    position?: string;
    debug?: boolean;
    layout?: 'row' | 'column';
    metadata?: object;
    fields?: FieldInterface[];
    fieldMap?: object;
    constructor(params?: FieldGroupInterface);
}
export interface SectionInterface {
    id: string;
    active?: boolean;
    name?: string;
    path?: string;
    inputs?: object;
    component: ComponentType<any>;
    metadata?: object;
    requireRefresh?: boolean;
}
export declare class SectionConfig {
    id: string;
    name?: string;
    path?: string;
    metadata?: object;
    inputs: {};
    component: ComponentType<any>;
    visible: boolean;
    require_refresh?: boolean;
    constructor(params: SectionInterface);
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
export declare class TabSectionBarConfig {
    access: EntityAccessInterface;
    params: EntityParams;
    repo: PopEntityRepoService;
    entity: Entity;
    field?: Dictionary<any>;
    action?: Dictionary<any>;
    preference: EntityPreference;
    metadata?: any;
    name: string;
    sections: Array<SectionConfig>;
    constructor(params?: TabSectionBarInterface);
}
export interface FieldParamInterface {
    column: string;
    name: string;
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
    type: string;
    source: string;
    name: string;
    channel?: boolean;
    session?: boolean;
    access?: string;
    config?: any;
    core?: CoreConfig;
    data?: any;
    data_key?: number;
    id?: string | number;
    ids?: any[];
    entity?: Entity;
    form?: FormGroup;
    group?: FieldItemGroupConfig;
    field?: FieldInterface;
    fields?: Dictionary<FieldInterface>;
    column?: string;
    fieldgroup?: FieldGroupConfig;
    internal_name?: string;
    message?: string;
    metadata?: any;
    method?: string;
    model?: any;
    open?: boolean;
    option?: any;
    tab?: TabConfig;
    target?: string;
    component?: TabComponentInterface;
    options?: any[];
    position?: string;
    success?: boolean;
    refresh?: boolean;
    response?: any;
    value?: boolean;
    cdr?: ChangeDetectorRef;
}
/**
 * Method to travel up dom of element until a height is found
 * @param el
 */
export declare function ParentHeightSetter(el: ElementRef, className?: string): number;
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
    key?: string;
    setKey?: string;
    nameKey?: string;
    tags?: string[];
    sort?: boolean;
    group?: string;
    activeKey?: string;
    groupKey?: string;
    groupFkKey?: string;
    parent?: {
        field: string;
        value: number;
    };
    level?: number;
    empty?: OptionItem;
    preserveKeys?: Array<string>;
    prevent?: Array<string | number>;
    ensure?: OptionItem;
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
