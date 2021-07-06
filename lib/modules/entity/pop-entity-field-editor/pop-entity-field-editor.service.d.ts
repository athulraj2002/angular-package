import { OnDestroy } from '@angular/core';
import { PopExtendService } from '../../../services/pop-extend.service';
import { CoreConfig, Dictionary, FieldConfig, FieldCustomSettingInterface, FieldInterface, FieldItemInterface, PopBaseEventInterface } from '../../../pop-common.model';
import { PopDomService } from '../../../services/pop-dom.service';
import { EntitySchemeSectionInterface } from '../pop-entity-scheme/pop-entity-scheme.model';
export declare class PopFieldEditorService extends PopExtendService implements OnDestroy {
    name: string;
    protected asset: {
        data: any;
        core: CoreConfig;
        field: FieldConfig;
        viewParams: {
            select: {
                disabled: number;
                display: number;
                required: number;
            };
            select_multi: {
                disabled: number;
                display: number;
                helpText: number;
            };
            input: {
                display: number;
                readonly: number;
                required: number;
                pattern: number;
                validation: number;
                transformation: number;
                maxlength: number;
                minlength: number;
                mask: number;
                disabled: number;
                allow_canada: number;
                auto_fill: number;
            };
            phone: {
                display: number;
                readonly: number;
                required: number;
                mask: number;
            };
            checkbox: {
                display: number;
                readonly: number;
            };
            button: {
                display: number;
                disabled: number;
            };
            radio: {
                display: number;
                disabled: number;
                layout: number;
            };
            switch: {
                display: number;
                disabled: number;
                allow_canada: number;
                auto_fill: number;
            };
        };
        viewLabels: {
            address: {
                defaultValue: string;
            };
            phone: {
                defaultValue: string;
            };
        };
        viewMultiple: {
            address: number;
            phone: number;
            email: number;
            switch: number;
        };
        viewOptions: {
            select: {
                enum: boolean;
                defaultValue: number;
                values: {
                    value: number;
                    name: string;
                }[];
            };
            select_multi: {
                enum: boolean;
                defaultValue: any[];
                values: {
                    value: number;
                    name: string;
                }[];
            };
            radio: {
                enum: boolean;
                defaultValue: string;
                values: {
                    value: string;
                    name: string;
                }[];
            };
        };
        viewRequired: {
            address: {
                label: number;
                zip: number;
            };
            input: {
                value: number;
            };
            select: {
                value: number;
            };
            select_multi: {
                value: number;
            };
            multi_selection: {
                value: number;
            };
            switch: {
                value: number;
            };
            phone: {
                label: number;
                number: number;
            };
            email: {
                address: number;
            };
            name: {
                first: number;
                last: number;
            };
        };
        viewIgnored: {
            address: {
                street: number;
                u_s_state_id: number;
            };
        };
        viewTemplate: {
            selection: number;
        };
        labelTypes: {
            defaultValue: string;
            options: {
                value: string;
                name: string;
            }[];
        };
    };
    constructor();
    /**
     * Register the field to make sure that any needed attributes are added
     * @param core
     * @param dom
     */
    register(core: CoreConfig, dom: PopDomService, scheme?: EntitySchemeSectionInterface): Promise<boolean>;
    /**
     * Get a set of mock data for a given field
     * @param internal_name
     */
    getDefaultValues(internal_name: string): any;
    isSchemePrimaryField(scheme: EntitySchemeSectionInterface, field: FieldInterface): boolean;
    isSchemeFieldItemDisabled(scheme: EntitySchemeSectionInterface, fieldId: number, itemId: number): boolean;
    isSchemeFieldEntryDisabled(scheme: EntitySchemeSectionInterface, fieldId: number, entryId: number): boolean;
    getSchemeFieldSetting(scheme: EntitySchemeSectionInterface, fieldId: number): Dictionary<any>;
    getSchemeFieldSection(scheme: EntitySchemeSectionInterface, fieldId: number, sectionName: string): FieldItemInterface;
    ensureSchemeFieldMapping(scheme: EntitySchemeSectionInterface, fieldId: number): void;
    getSchemeFieldItemMapping(scheme: EntitySchemeSectionInterface, fieldId: number, itemId: number): Dictionary<any>;
    getSchemeFieldItemSection(scheme: EntitySchemeSectionInterface, fieldId: number, itemId: number, sectionName: string): object;
    getFieldTraits(fieldGroupName: string): FieldCustomSettingInterface[];
    getSchemePrimary(scheme: EntitySchemeSectionInterface): object;
    getSchemeRequired(scheme: EntitySchemeSectionInterface): object;
    getSchemeFieldMapping(scheme: EntitySchemeSectionInterface): object;
    updateSchemeFieldMapping(scheme: EntitySchemeSectionInterface): Promise<boolean>;
    updateSchemePrimaryMapping(scheme: EntitySchemeSectionInterface): Promise<boolean>;
    updateSchemeRequiredMapping(scheme: EntitySchemeSectionInterface): void;
    /**
     * When a entry is added , we need to set a default type
     */
    getDefaultLabelTypeOptions(): any;
    /**
     * Check what param options apply to a specific field
     * @param key
     */
    getViewParams(key?: string): any;
    /**
     * Check what param options apply to a specific field
     * @param key
     */
    getViewMultiple(key?: string): any;
    /**
     * Check what fields items are required under a fieldgroup type
     * @param fieldGroupName
     * @param fieldItemName
     */
    getViewRequired(fieldGroupName: string, fieldItemName: string): boolean;
    /**
     * Check what fields items are ingnored under a fieldgroup type
     * @param fieldGroupName
     * @param fieldItemName
     */
    getViewIgnored(fieldGroupName: string, fieldItemName: string, scheme?: EntitySchemeSectionInterface): boolean;
    /**
     * Get a set of default options to for a specific view , ie.. a radio, select need options
     * @param key
     */
    getViewOptions(key?: string): any;
    /**
     * Address Data Factory
     */
    getAddressValues(): {
        line_1: any;
        line_2: any;
        line_3: string;
        city: any;
        region_id: any;
        county: string;
        country_id: number;
        zip: string;
        zip_4: string;
    };
    /**
     * Name Data Factory
     */
    getNameValues(): {
        prefix: any;
        first: any;
        middle: any;
        last: any;
        suffix: any;
    };
    /**
     * Phone Data Factory
     */
    getPhoneValues(): {
        title: any;
        country_id: number;
        number: any;
        extension: string;
        voice_button: any;
        sms_button: any;
        can_call: number;
        can_text: number;
    };
    /**
     * This was built for rendering a dynamic list of custom settings, Probably not the right approach since settings so far have been sporadically placed so far
     * @param core
     * @param field
     * @param setting
     */
    getCustomSettingComponent(core: CoreConfig, field: FieldInterface, setting: FieldCustomSettingInterface, scheme?: EntitySchemeSectionInterface): any;
    /**
     * Store a custom setting
     * Determine whether the setting already exists in the database, post or patch accordingly
     * @param core
     * @param event
     */
    storeCustomSetting(core: CoreConfig, event: PopBaseEventInterface): Promise<boolean | string>;
    /**
     * Store a custom setting
     * Determine whether the setting already exists in the database, post or patch accordingly
     * @param core
     * @param event
     */
    storeFieldItemRule(core: CoreConfig, fieldItem: FieldItemInterface, event: PopBaseEventInterface): Promise<boolean | string>;
    /**
     * Trigger the field prview component to update
     */
    triggerFieldPreviewUpdate(): void;
    /**
     * Cleanup timeouts, intervals, subscriptions, etc
     */
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    private _updateSchemeFieldMapping;
    /**
     * Assign the custom setting values and config that exist for this field
     * @param field
     * @param stored
     */
    private _setFieldCustomSettings;
    /**
     * Ensure that at least 1 label exists
     * @param field
     */
    private _setFieldEntryValues;
}
