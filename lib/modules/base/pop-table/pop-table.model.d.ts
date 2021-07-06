import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { PopBaseEventInterface } from '../../../pop-common.model';
export interface ColumnDefinitionInterface {
    checkbox?: boolean | {
        order?: number;
        sticky?: boolean;
        visible?: boolean;
    };
    display?: string;
    helper?: string | {
        text?: string;
        position?: string;
    };
    icon?: {
        type: string;
        name: string;
    };
    link?: boolean | string;
    order?: number;
    route?: string;
    internal_name?: string;
    sticky?: boolean;
    visible?: boolean;
}
export interface TableButtonInterface {
    id?: string | number;
    name: string;
    accessType?: string;
    requireSelected?: boolean;
    requireOneSelected?: boolean;
    requireNoneSelected?: boolean;
    hidden?: boolean;
    disabled?: boolean;
}
export interface TableOptionsInterface {
    columns?: Array<string>;
    currentOptions?: {
        columnDefinitions: {
            [key: string]: ColumnDefinitionInterface;
        };
        headerDisplay: boolean;
        headerSticky: boolean;
        paginator: boolean;
        search: boolean;
        searchColumns: boolean;
        sort: boolean;
    };
    defaultOptions: {
        columnDefinitions: {
            [key: string]: ColumnDefinitionInterface;
        };
        headerDisplay?: boolean;
        headerSticky?: boolean;
        paginator?: number;
        search?: boolean;
        searchColumns?: boolean;
        sort?: boolean;
    };
    allowColumnDisplayToggle?: boolean;
    allowColumnStickyToggle?: boolean;
    allowColumnSearchToggle?: boolean;
    allowColumnSortToggle?: boolean;
    allowHeaderStickyToggle?: boolean;
    allowHeaderDisplayToggle?: boolean;
    allowPaginatorToggle?: boolean;
}
export declare class TableOptionsConfig {
    columns: any[];
    currentOptions: any;
    defaultOptions: any;
    allowColumnDisplayToggle: boolean;
    allowColumnStickyToggle: boolean;
    allowColumnSearchToggle: boolean;
    allowColumnSortToggle: boolean;
    allowHeaderStickyToggle: boolean;
    allowHeaderDisplayToggle: boolean;
    allowPaginatorToggle: boolean;
    constructor(params: TableOptionsInterface);
}
export interface TableInterface {
    id?: string | number;
    columnDefinitions?: {
        [key: string]: ColumnDefinitionInterface;
    };
    buttons?: Array<TableButtonInterface>;
    data?: Array<object>;
    height?: number;
    parentHeight?: string;
    headerDisplay?: boolean;
    headerSticky?: boolean;
    internal_name?: string;
    initialSort?: string;
    initialSortDirection?: 'asc' | 'desc';
    linkBehavior?: string;
    metadata?: object;
    advanced_search?: boolean;
    options?: TableOptionsConfig;
    paginator?: boolean;
    search?: boolean;
    searchValue?: string;
    searchColumns?: boolean;
    sort?: boolean;
    route?: string;
}
export declare class TableConfig {
    id: any;
    matDataPaginator: any;
    selection: any;
    buttons: TableButtonInterface[];
    columnDefinitions: {};
    dealWithAngularChangeDetectionFailure: boolean;
    data: any[];
    height: number;
    parentHeight?: string;
    initialSort: any;
    initialSortDirection: 'asc' | 'desc';
    internal_name?: string;
    loading: boolean;
    metadata: any;
    options: any;
    sort: boolean;
    route: string;
    linkBehavior: string;
    headerDisplay: boolean;
    headerSticky: boolean;
    paginator: boolean;
    search: boolean;
    searchValue: string;
    searchColumns: boolean;
    advanced_search: boolean;
    onEvent: Subject<PopBaseEventInterface>;
    matData: MatTableDataSource<unknown>;
    columnConfig: {
        visible: any[];
        templates: {};
    };
    updateColumnDefinitions: any;
    updateData: any;
    applyFilter: any;
    clearSelected: any;
    reset: any;
    setLayout: any;
    setHeight: any;
    constructor(params?: TableInterface);
}
