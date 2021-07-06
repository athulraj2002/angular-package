import { ComponentType } from '@angular/cdk/portal';
import { CoreConfig, Dictionary, EntityExtendInterface, EventCallback, OutletReset, PopBaseEventInterface, SectionConfig } from '../../../pop-common.model';
import { FieldItemGroupConfig } from '../pop-field-item-group/pop-field-item-group.model';
import { Subject } from 'rxjs';
export declare type TabLoadCallback = (config: CoreConfig, tab: TabConfig) => void;
export declare type TabUnloadCallback = (config: CoreConfig, tab: TabConfig) => void;
export declare type TabCoreCallback = (event: PopBaseEventInterface) => void;
export interface TabComponentInterface {
    type: ComponentType<any>;
    inputs?: Dictionary<any>;
    position: number;
    name?: string;
    width?: string;
    header?: string;
    when?: any[];
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
    onLoad?: TabLoadCallback;
    onEvent?: EventCallback;
    overhead?: number;
    onUnload?: TabUnloadCallback;
    requireRefresh?: boolean;
    scheme?: boolean;
    sections?: SectionConfig[];
    syncPositionFields?: string[];
    syncPositionMap?: Dictionary<number[]>;
    syncPositions?: boolean;
    wrap?: boolean;
    columnWrap?: boolean;
    when?: any[];
}
export declare class TabConfig {
    id: string;
    name?: string;
    hidden?: boolean;
    path?: string;
    metadata?: object;
    scheme?: boolean;
    overhead?: number;
    positions?: {
        1?: TabPositionInterface;
        2?: TabPositionInterface;
        3?: TabPositionInterface;
    };
    sections?: any;
    syncPositionFields?: string[];
    syncPositions?: boolean;
    syncPositionMap?: Dictionary<number[]>;
    requireRefresh?: boolean;
    onLoad?: TabLoadCallback;
    onEvent?: EventCallback;
    onUnload?: TabUnloadCallback;
    view?: any;
    resetView?: OutletReset;
    when?: any;
    wrap?: boolean;
    columnWrap?: boolean;
    groups?: Dictionary<FieldItemGroupConfig>;
    constructor(params: TabInterface);
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
export declare class TabMenuConfig {
    name: string;
    goBack: boolean;
    tabs: Array<TabConfig>;
    buttons: Array<TabButtonInterface>;
    portal: boolean;
    metadata: Dictionary<any>;
    loaded: boolean;
    loading: boolean;
    constructor(params?: TabMenuInterface);
}
export interface BackButton {
    returnUrl: string;
    hardReload: boolean;
}
