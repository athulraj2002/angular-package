import { OnDestroy } from '@angular/core';
import { PopExtendService } from "../../../services/pop-extend.service";
import { AppGlobalInterface, Dictionary, DynamicComponentInterface, ResourceInterface, SchemeComponentConfig, SchemeComponentModelInterface, SchemeComponentOptionInterface, SchemeComponentParamInterface, SchemeComponentSettingInterface } from "../../../pop-common.model";
import { TabConfig } from "../../base/pop-tab-menu/tab-menu.model";
import { PopResourceService } from "../../../services/pop-resource.service";
export declare class PopEntitySchemeComponentService extends PopExtendService implements OnDestroy {
    private resource;
    private APP_GLOBAL;
    private env?;
    protected asset: {
        action: Map<string, Dictionary<any>>;
        base: Map<string, SchemeComponentConfig>;
        setting: Map<string, SchemeComponentSettingInterface>;
        component: Map<string, DynamicComponentInterface>;
        param: Map<string, SchemeComponentParamInterface>;
        resource: Map<string, Dictionary<ResourceInterface>>;
        option: Map<string, SchemeComponentOptionInterface>;
        tabs: Map<string, TabConfig[]>;
        baseImageUrl: string;
    };
    /**
     * This srv is used in the
     * @param env
     */
    constructor(resource: PopResourceService, APP_GLOBAL: AppGlobalInterface, env?: any);
    /**
     * Configure/Extend the default behavior of an entity
     * @param internal_name
     * @param extend
     */
    configure(internal_name: string, extend: SchemeComponentModelInterface): void;
    /**
     * A method to get a Core Config for an entity
     * Uses cache service to improve performance
     * ALL ENTITY RELATED COMPONENTS RELY ON THIS !!!!
     * @param entityParams
     * @param metadata
     */
    getConfig(internal_name: string, item: SchemeComponentParamInterface): Promise<SchemeComponentConfig>;
    /**
     * This will do all of the work of building and storing the base config for each entity
     * @param internal_name
     * @param routes
     * @private
     */
    private _getBaseConfig;
    /**
     * Get the base set of the entity definitions
     * These is the starting point when it comes to entities
     * @param internal_name
     * @param entityId
     */
    getParams(internal_name: string): SchemeComponentParamInterface;
    /**
     * Get the set of tab configs that belong to an entity
     */
    getTabs(widget?: SchemeComponentConfig): TabConfig[];
    /**
     * A Http call that gets the entity metadata
     * @param id Primary Key of the entity
     */
    getResources(widget: SchemeComponentConfig): Promise<boolean>;
    /**
     * Set the base definitions for an entity
     * Each entity needs to define these so we know how to talk to the api in regards to it
     * The api should provide this details as part of the auth token
     * @param internal_name
     * @param entityId
     */
    setParam(param: SchemeComponentParamInterface): void;
    /**
     * Attach a set of tab configs to an entity
     * @param internal_name
     * @param tabs
     */
    setTab(internal_name: string, tabs: TabConfig[]): void;
    /**
     * Attach a component to a widget
     * @param internal_name
     * @param tabs
     */
    setComponent(internal_name: string, component: DynamicComponentInterface): void;
    /**
     * Attach a set of actions to an entity
     * @param internal_name
     * @param tabs
     */
    setAction(internal_name: string, action: Dictionary<any>): void;
    /**
     * Attach a set of resources to an entity
     * @param internal_name
     * @param tabs
     */
    setResource(internal_name: string, resource: Dictionary<ResourceInterface>): void;
    /**
     * Attach a set of options to widget
     * @param internal_name
     * @param tabs
     */
    setOption(internal_name: string, option: SchemeComponentOptionInterface): void;
    /**
     * Attach a set of options to widget
     * @param internal_name
     * @param tabs
     */
    setSetting(internal_name: string, setting: SchemeComponentSettingInterface): void;
    /**
     * Get extended fields attached to an entity
     * @param internal_name
     * @param tabs
     */
    getResource(internal_name: string): Dictionary<ResourceInterface>;
    /**
     * Get extended actions attached to an entity
     * @param internal_name
     * @param tabs
     */
    getAction(internal_name: string): Dictionary<any>;
    /**
     * Get extended actions attached to an entity
     * @param internal_name
     * @param tabs
     */
    getSetting(internal_name: string): SchemeComponentSettingInterface;
    /**
     * Get extended actions attached to an entity
     * @param internal_name
     * @param tabs
     */
    getOption(internal_name: string): SchemeComponentOptionInterface;
    /**
     * Get extended actions attached to an entity
     * @param internal_name
     * @param tabs
     */
    getComponent(internal_name: string): DynamicComponentInterface;
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    private _getPreferences;
    getDefaultComponentSetting(internalName: string): SchemeComponentSettingInterface;
    getDefaultComponentOption(internalName: string): SchemeComponentOptionInterface;
}
