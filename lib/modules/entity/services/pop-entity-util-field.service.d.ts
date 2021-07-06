import { CoreConfig, FieldConfig, FieldInterface, FieldItemModelInterface } from '../../../pop-common.model';
import { PopDomService } from '../../../services/pop-dom.service';
import { ComponentType } from '@angular/cdk/portal';
import { EntitySchemeSectionInterface } from '../pop-entity-scheme/pop-entity-scheme.model';
import { PopFieldEditorService } from '../pop-entity-field-editor/pop-entity-field-editor.service';
export declare class PopEntityUtilFieldService {
    private field;
    private name;
    private cache;
    constructor(field: PopFieldEditorService);
    /**
     * Build out the necessary configs for a custom field group and all of this field items involved
     * Fields may have multiple values , so a unique set of configs mut be created for each data entry
     * @param core
     * @param field
     */
    buildCustomField(core: CoreConfig, field: FieldInterface): FieldConfig;
    private _setSchemeFieldSettings;
    /**
     * Build out a config for a field item
     * @param core
     * @param model
     */
    buildCoreFieldItem(core: CoreConfig, model: FieldItemModelInterface): {
        model: FieldItemModelInterface;
        component: ComponentType<any>;
        config: any;
    };
    /**
     * Get the rules that should be applied on this field
     * @param fieldItem
     * @private
     */
    setFieldItemRules(fieldId: number, fieldItem: any, scheme?: EntitySchemeSectionInterface): void;
    /**
     * A method that builds entity fieldset from the server models
     * @param entityConfig
     * @param fieldPosition
     */
    buildDomFields(core: CoreConfig, dom: PopDomService): Promise<boolean>;
    /**
     * A method that builds entity fieldset from the server models
     * @param entityConfig
     * @param fieldPosition
     */
    getDomFields(fieldPosition: number, dom: PopDomService): any[];
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Loop through the data for the entity and identify what refers to custom fields
     * Retrieve the field data for each of the custom fields that exist
     * @param core
     * @private
     */
    private _getEntityCustomFields;
    clearCustomFieldCache(fieldId: number): void;
    /**
     * Field Entries are a way to define the value structure of a field
     * By default a field will have a single value, but a field can be configured to have multiple values
     * Field entries provide a template of a specific amount of values a field should have
     * @param field
     * @private
     */
    private _setFieldEntries;
    /**
     * Field data should come in as an array of records
     * Ensure that each each record has a unique entry id, and index data by field_entry_id;
     * @param customField
     */
    private _setEntityCustomFieldDataStructure;
    /**
     * Get the settings that should be applied on this field item
     * @param fieldItem
     * @private
     */
    private _getFieldItemSetting;
    /**
     * A field entry is used to identity a specific value in a set of multiple values
     * @param field
     * @param dataKey
     * @param index
     * @private
     */
    private _getFieldItemEntry;
    /**
     * Map the form in a field model to the angular component that will be used to render the field
     * @param form
     * @private
     */
    private _getFormComponent;
    /**
     * Resolve the value that lines up with the column/name of the field item from the data set
     * The idea here is that a value may have already created for this field item and we need to make sure the field item initializes with the value
     * @param core
     * @param field
     * @param model
     * @param dataKey
     * @private
     */
    private _getModelValue;
    /**
     * Get the custom field template that is made for the field group
     * @param name
     * @private
     */
    private _getEntityFieldComponent;
}
