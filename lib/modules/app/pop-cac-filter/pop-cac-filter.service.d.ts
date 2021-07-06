import { ElementRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Entity, PopBaseEventInterface, AppGlobalInterface } from '../../../pop-common.model';
import { PopExtendService } from '../../../services/pop-extend.service';
import { CacFilterBarConfig, CacFilterBarEntityConfig } from './pop-cac-filter.model';
import { PopEntityEventService } from '../../entity/services/pop-entity-event.service';
import { PopPipeService } from '../../../services/pop-pipe.service';
export declare class PopCacFilterBarService extends PopExtendService implements OnDestroy {
    private crud;
    private pipe;
    private APP_GLOBAL;
    loading: boolean;
    name: string;
    private config;
    protected asset: {
        lookup: {};
        el: ElementRef<any>;
        client: Map<number, Entity>;
        account: Map<number, Entity>;
        campaign: Map<number, Entity>;
        triggerFields: string[];
        views: string[];
    };
    event: {
        data: Subject<string>;
        config: Subject<CacFilterBarEntityConfig[]>;
        bubble: Subject<PopBaseEventInterface>;
    };
    private filter;
    private readonly entities;
    constructor(crud: PopEntityEventService, pipe: PopPipeService, APP_GLOBAL: AppGlobalInterface);
    private _init;
    register(el: ElementRef<any>): void;
    getEntities(): CacFilterBarEntityConfig[];
    getFilter(): {
        client?: number[];
        account?: number[];
        campaign?: number[];
    };
    /**
     * Return the filter bar config
     */
    getConfig(): CacFilterBarConfig;
    setFilter(filter: {
        client?: number[];
        account?: number[];
        campaign?: number[];
    }): void;
    getElHeight(): number;
    getHeight(): number;
    /**
     * Clear any existing filters
     * @param app
     */
    clearFilters(): void;
    /**
     * Trigger update trigger
     * @param type strings
     * @returns void
     */
    onChange(event: PopBaseEventInterface): void;
    /**
     * Ask whether the filter bar is active or not
     */
    isActive(): boolean;
    refresh(): void;
    /**
     * Toggle whether to include archived records
     * @param active
     */
    setArchived(archived: boolean): void;
    /**
     * Toggle the filer bar on and off
     * @param active
     */
    setActive(active: boolean): void;
    /**
     * Toggle the Loader
     * @param loader
     */
    setLoader(loader: boolean): void;
    /**
     * Change the display state of the filter bar
     * @param display
     */
    setDisplay(display: any): void;
    /**
     * Change the display state of the filter bar
     * @param display
     */
    setView(view: string[]): void;
    getAsset(internal_name: string, id: number): any;
    setData(caller: string, allowCache?: boolean): Promise<boolean>;
    setConfigAliases(): void;
    ngOnDestroy(): void;
    private _triggerDataRefresh;
    private _transFormData;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Retrieves any filter settings from session storage
     */
    private _getFilterStorage;
    private _setDataStructure;
}
