import { BehaviorSubject } from 'rxjs';
import { EntityFilterInterface, KeyMap } from '../../../pop-common.model';
export interface CacFilterBarInterface {
    app?: string;
    entity_path?: string;
    display?: string;
    archived?: boolean;
    active?: boolean;
    loader?: boolean;
    sortToTop?: boolean;
}
export declare class CacFilterBarConfig {
    archived: boolean;
    active: boolean;
    api?: EntityFilterInterface[];
    app: string;
    display: 'default' | 'static' | 'float';
    loader: boolean;
    view: string[];
    sortToTop: boolean;
    invalid: boolean;
    constructor(params?: CacFilterBarInterface);
}
export interface CacFilterBarEntityInterface {
    internal_name: string;
    parent_link: string | null;
    child_link: string | null;
    name: string;
    options: CacFilterBarItem[];
    search?: string;
    single?: boolean;
    mode?: boolean;
    visible?: boolean;
    sort_order?: number;
}
export declare class CacFilterBarEntityConfig {
    allSelected: boolean;
    internal_name: string;
    child_link: string | null;
    parent_link: string | null;
    name: string;
    search: '';
    checkAll: boolean;
    options: CacFilterBarItem[];
    feed: BehaviorSubject<CacFilterBarItem[]>;
    totalVisible: number;
    totalSelected: number;
    totalAvailable: number;
    totalOptions: number;
    indeterminate: boolean;
    single: boolean;
    selected: KeyMap<boolean>;
    display: KeyMap<boolean>;
    hidden: KeyMap<boolean>;
    filter: any[];
    selectedText: string;
    displaySelectedText: string;
    totalText: string;
    mode: boolean;
    visible: boolean;
    sort_order?: number;
    constructor(params: CacFilterBarEntityInterface);
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
