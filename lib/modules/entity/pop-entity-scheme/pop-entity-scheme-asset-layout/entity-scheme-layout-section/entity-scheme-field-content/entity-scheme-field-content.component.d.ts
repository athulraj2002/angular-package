import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ProfileSchemeFieldInterface } from '../../../pop-entity-scheme.model';
import { PopExtendComponent } from '../../../../../../pop-extend.component';
import { PopEntitySchemeService } from '../../../pop-entity-scheme.service';
import { PopFieldEditorService } from '../../../../pop-entity-field-editor/pop-entity-field-editor.service';
import { Dictionary, FieldCustomSettingInterface, FieldEntry, FieldInterface, KeyMap } from '../../../../../../pop-common.model';
export declare class EntitySchemeFieldContentComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _schemeRepo: PopEntitySchemeService;
    protected _fieldRepo: PopFieldEditorService;
    config: ProfileSchemeFieldInterface;
    name: string;
    protected srv: {
        scheme: PopEntitySchemeService;
        field: PopFieldEditorService;
    };
    protected asset: {
        field: FieldInterface;
        groupName: string;
        mapping: any;
        primary: any;
        traits: FieldCustomSettingInterface[];
        traitMap: Dictionary<number>;
        entryTraitMap: KeyMap<string[]>;
    };
    ui: {
        entries: FieldEntry[];
        traits: FieldCustomSettingInterface[];
    };
    /**
     * @param el
     * @param _schemeRepo - transfer
     * @param _fieldRepo - transfer
     */
    constructor(el: ElementRef, _schemeRepo: PopEntitySchemeService, _fieldRepo: PopFieldEditorService);
    /**
     * This component is responsible to render the inner contents of field asset
     * A field asset is custom field that has been created on an entity in the business unit
     */
    ngOnInit(): void;
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Set the initial config of this component
     * @private
     */
    private _setInitialConfig;
    /**
     * Organizes the trait that should be assigned on this field
     * @private
     */
    private _setEntryTraitMap;
    /**
     * Set the entries of this field
     * @private
     */
    private _setEntries;
    /**
     * Set the traits that belong to a field entry
     * @param entry
     * @private
     */
    private _getEntryTraits;
}
