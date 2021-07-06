import { CoreConfig, Dictionary, Entity, EntityParams, FieldItemModelInterface, PopBaseEventInterface, ServiceRoutesInterface, FieldInterface } from '../../pop-common.model';
import { TabConfig, TabMenuConfig } from '../base/pop-tab-menu/tab-menu.model';
import { Validators } from '@angular/forms';
import { Route, Routes } from '@angular/router';
/**
 * A helper method that will build out TabMenuConfig off of an entityConfig
 * @param entityConfig
 * @param tabs
 */
export declare function GetTabMenuConfig(core: CoreConfig, tabs?: TabConfig[]): TabMenuConfig;
/**
 * Determine the buttons that should be shown for this entity
 * @param core
 */
export declare function GetTabMenuButtons(core: CoreConfig): any[];
/**
 * A helper method that sets up a FieldGroupConfig for a create/new pop-table-dialog
 * @param entityConfig
 * @param goToUrl
 */
export declare function GetObjectVar(obj: Dictionary<any>, path: string): any;
/**
 * Get a list of the transformations that are within a field set
 * @param obj
 * @constructor
 */
export declare function GetObjectTransformations(obj: Object): any[];
export declare function SetCoreValue(core: CoreConfig | TabMenuConfig, entity_path: string, value: any): void;
/**
 * Parse a value with any mutations that need to be applied
 * @param value
 * @param core
 * @param blockEntity
 * @constructor
 */
export declare function ParseModelValue(value?: any, core?: CoreConfig, blockEntity?: boolean): any;
/**
 * Look through an entire object and make the necessary mutations
 * @param obj
 * @param entityConfig
 * @constructor
 */
export declare function ParseObjectDefinitions(obj: object, entityConfig: CoreConfig): {};
/**
 * A method to translate entityId fields out of a url /#app/#plural_name/:entityId, (#) indicates a entityId param, (:) indicates a entityId field
 */
export declare function ParseUrlForEntityFields(url: string, entity: Entity): string;
/**
 * Translate an aliases or mutations within a url
 * @param url
 * @param entity
 * @param ignore
 * @constructor
 */
export declare function ParseLinkUrl(url: string, entity?: Object, ignore?: string[]): string;
/**
 * A method to translate entityId params out of a url /#app/#plural_name/:entityId, (#) indicates a entityId param, (:) indicates a entityId field
 */
export declare function ParseUrlForParams(url: string, entityParams: EntityParams): string;
/**
 * A methid that replaces entityId aliases found in a string
 * @param string
 */
export declare function ParseForAlias(string: string): string;
/**
 * A method to translate entityId fields out of a string ':entityId' (:) indicates a entityId field
 */
export declare function ParseStringForEntityField(str: string, entity: Entity): string;
/**
 * A method that replaces entityId params found in a string
 * @param str
 * @param entityParams
 */
export declare function ParseStringForParams(str: string, entityParams: EntityParams, separator?: string): string;
/**
 * Helper function to set routes for an entity
 * @param routes
 * @param params
 * @constructor
 */
export declare function InterpolateEntityRoutes(routes: ServiceRoutesInterface, params: EntityParams): ServiceRoutesInterface;
/**
 * Helper function to set routes for an entity
 * @param routes
 * @param params
 * @constructor
 */
export declare function InterpolateEntityRoute(route: string, obj: Object): string;
/**
 * Remove all the empty values from an object
 * @param model
 * @constructor
 */
export declare function ClearEmptyValues(model: object): object;
/**
 * Get a name to display for an entity, use fall backs if necessary
 * @param entity
 * @constructor
 */
export declare function DetermineEntityName(entity: Entity): string;
/**
 * Parse conditional logic of a when statement
 * [
 *    first level is OR statements
 *    [ ...Every thing in the second level is an AND statement..., ['name', '=', 'user'], ['age', '>', 21] ],
 *    [key, '=', 'value ],
 *    [key, 'in', [1,2,3,45] ],
 * ]
 * @param obj
 * @param when
 * @param core
 * @constructor
 */
export declare function EvaluateWhenConditions(obj: Dictionary<any>, when?: any[], core?: CoreConfig): boolean;
/**
 * Evaluate a single conditional block: [location, operator, value]
 * @param obj
 * @param block
 * @param core
 * @constructor
 */
export declare function EvaluateWhenCondition(obj: Dictionary<any>, block: any[], core?: CoreConfig): boolean;
/**
 * check if event matches the signature for a field patch
 * @param core
 * @param event
 * @constructor
 */
export declare function IsValidFieldPatchEvent(core: CoreConfig, event: PopBaseEventInterface): boolean;
/**
 * check if event matches the signature for a field patch
 * @param core
 * @param event
 * @constructor
 */
export declare function IsValidChangeEvent(core: CoreConfig, event: PopBaseEventInterface): boolean;
/**
 * Check if a event matches the same core signature of a core that belongs to a component
 * @param core
 * @param event
 * @constructor
 */
export declare function IsValidCoreSignature(core: CoreConfig, event?: PopBaseEventInterface): boolean;
export declare function GetCustomFieldSettings(field: FieldInterface): {};
/**
 * Selection type fields require a list of options to present the user
 * The option values may be directly assigned on the field, point to a specific location in the entity data, or reference a resource that may exists in the entity models
 * ...
 * options:{
 *   ...
 *   values: FieldItemOptions[], resolve what is in this list
 *   ...
 * }
 * ...
 * @param core
 * @param options
 * @private
 */
export declare function ModelOptionValues(core: CoreConfig, options: any): any;
/**
 * Get the rules that should be applied on this field
 * @param fieldItem
 * @private
 */
export declare function FieldItemRules(fieldItem: any): void;
export declare function FieldItemModel(core: CoreConfig, fieldItem: any, checkAccess?: boolean): FieldItemModelInterface;
/**
 * When patches are made, we need to update the entity in the core config
 * ToDo:: Hoping to be able to improve this, and have each component be responsible to manage their own updates. My hesitation right now is I want the least amount of components as possible manipulating the core config
 * @param core
 * @param event
 */
export declare function SessionEntityFieldUpdate(core: CoreConfig, event: PopBaseEventInterface, path?: string): boolean;
export declare function GetSingularName(value: string): string;
export declare function IsAliasable(value: string): boolean;
export declare function IsEntity(entityValue: string): boolean;
export declare function ParseModuleRoutes(parent: string, config: Route[], routes?: any[]): any[];
export declare function ParseModuleRoutesForAliases(routes: Routes): Routes;
export declare function FieldItemView(view: any): {
    id: number;
    name: string;
    type: string;
    description: string;
};
export declare function FieldItemBooleanValue(model: FieldItemModelInterface, core: CoreConfig): boolean;
export declare function FieldItemTextValue(model: FieldItemModelInterface, core: CoreConfig): string;
export declare function FieldItemArrayValue(model: FieldItemModelInterface, core: CoreConfig): any[];
export declare function GetPatternValidator(pattern: string): typeof Validators.email;
export declare function FieldItemOptionValues(model: FieldItemModelInterface, core: CoreConfig): any[];
/**
 * Generatea form config from the field item model;
 * @param core
 * @param model
 * @constructor
 */
export declare function FieldItemModelConfig(core: CoreConfig, model: FieldItemModelInterface): any;
