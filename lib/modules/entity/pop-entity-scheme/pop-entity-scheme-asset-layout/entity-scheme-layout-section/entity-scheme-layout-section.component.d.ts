import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopEntitySchemeService } from '../../pop-entity-scheme.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { PopExtendComponent } from '../../../../../pop-extend.component';
import { PopDomService } from '../../../../../services/pop-dom.service';
import { EntitySchemeSectionInterface } from '../../pop-entity-scheme.model';
import { InputConfig } from '../../../../base/pop-field-item/pop-input/input-config.model';
export declare class EntitySchemeLayoutSectionComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    protected _schemeRepo: PopEntitySchemeService;
    section: any;
    name: string;
    protected srv: {
        scheme: PopEntitySchemeService;
    };
    ui: {
        header: InputConfig;
        primaryIds: number[];
    };
    /**
     * @param el
     * @param _domRepo - transfer
     * @param _schemeRepo - transfer
     */
    constructor(el: ElementRef, _domRepo: PopDomService, _schemeRepo: PopEntitySchemeService);
    /**
     * The purpose of this component is to manage a specific section of the scheme layout
     * A user should be able to drag as sort assets, and apply custom settings to an asset
     * An asset is basically refers to something that the user can position in the scheme layout, field, component, etc
     */
    ngOnInit(): void;
    /**
     * A user can dragSort assets from one column to another in the scheme layout
     * @param event
     */
    onAssetSortDrop(event: CdkDragDrop<string[]>): void;
    /**
     * A user can click on an edit button an edit the config settings of an asset
     * @param asset
     */
    onEditAsset(asset: any): void;
    /**z
     * A user can click on a toggle to expand/close the content section of an asset
     * @param asset
     */
    onExpandAssetContent(asset: EntitySchemeSectionInterface): void;
    /**
     * Triggers when user mouseleaves an asset
     * @param asset
     */
    onHideAssetMenu(asset: EntitySchemeSectionInterface): void;
    /**
     * Triggers when user mouseenters an asset
     * @param asset
     */
    onShowAssetMenu(asset: EntitySchemeSectionInterface): void;
    /**
     * A user can click a remove button to remove an asset/child from the scheme layout
     * @param position
     * @param asset
     */
    onRemoveChildFromLayout(position: number, child: EntitySchemeSectionInterface): void;
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy(): void;
    private _buildHeader;
}
