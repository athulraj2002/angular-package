import { __awaiter } from "tslib";
import { Injectable } from '@angular/core';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { CheckboxConfig } from '../../base/pop-field-item/pop-checkbox/checkbox-config.model';
import { PopExtendService } from '../../../services/pop-extend.service';
import { PopBusiness, PopLog, PopRequest, ServiceInjector } from '../../../pop-common.model';
import { ArrayKeyBy, ArrayOnlyUnique, CleanObject, DeepCopy, DynamicSort, IsArray, IsArrayThrowError, IsDefined, IsObject, IsObjectThrowError, IsString, JsonCopy, PopUid, StorageGetter, StorageSetter } from '../../../pop-common-utility';
import { EntitySchemeSectionConfig } from './pop-entity-scheme.model';
import { forkJoin, Subject } from 'rxjs';
import { ParseModelValue } from '../pop-entity-utility';
import { PopEntitySchemeFieldSettingComponent } from './pop-entity-scheme-field-setting/pop-entity-scheme-field-setting.component';
import { PopEntityActionService } from '../services/pop-entity-action.service';
import * as i0 from "@angular/core";
import * as i1 from "../../base/pop-tab-menu/pop-tab-menu.service";
export class PopEntitySchemeService extends PopExtendService {
    constructor(// This service is unique to every component, provided in the PopEntityTabComponent
    tabRepo) {
        super();
        this.tabRepo = tabRepo;
        this.name = 'PopEntitySchemeService';
        this.ui = {
            refresh: new Subject(),
            attachedMap: {},
            assetPool: {},
            assignableConfigs: {},
            primary: {},
            primaryIds: [],
            sections_keys: [],
            sections: undefined
        };
        this.asset = {
            attachingSet: {},
            assetMap: {
                field: new Map(),
                component: new Map(),
            },
            core: undefined,
            tab: undefined,
        };
        this._setServiceContainer();
        PopLog.init(this.name, `created:${this.id}`);
    }
    _setServiceContainer() {
        this.srv = {
            action: ServiceInjector.get(PopEntityActionService),
            dialog: ServiceInjector.get(MatDialog),
            tab: this.tabRepo
        };
        delete this.tabRepo;
    }
    /**
     * This fx takes the initial data and configures it to the expected structure and sets up all the ancillary assets needed
     * @param core
     * @param tab
     */
    init(core, tab) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.asset.core = IsObjectThrowError(core, true, `${this.name}:core`) ? core : null;
            this.asset.tab = IsObjectThrowError(tab, true, `${this.name}:init: - tab`) ? tab : {};
            // this.asset.attach = { fields: {}, components: {} };
            // let value;
            this.ui.sections_keys = [];
            if (!(IsObject(core.entity.mapping))) {
                core.entity.mapping = {};
            }
            if (!(IsObject(core.entity.mapping.field))) {
                core.entity.mapping.field = {};
            }
            if (!(IsObject(core.entity.mapping.primary))) {
                core.entity.mapping.primary = {};
            }
            if (!(IsArray(core.entity.mapping.required))) {
                core.entity.mapping.required = [];
            }
            else {
                core.entity.mapping.required = ArrayOnlyUnique(core.entity.mapping.required);
            }
            // if( !( IsObject( core.entity.mapping.field ) ) ){
            //   core.entity.mapping.field = <KeyMap<any>>{};
            // }
            // console.log('orig scheme', core.entity.name, core.entity.mapping);
            this.ui.primary = StorageGetter(core, ['entity', 'mapping', 'primary'], {});
            this.ui.primaryIds = Object.values(this.ui.primary).map((i => +i)).sort();
            const fields = ArrayKeyBy(StorageGetter(this.asset.core, 'resource.custom_fields.data_values'.split('.'), []), 'id');
            Object.keys(fields).map((fieldId) => {
                const field = fields[fieldId];
                field.primary = this.ui.primaryIds.includes(+fieldId);
            });
            const components = ArrayKeyBy(StorageGetter(this.asset.core, 'resource.custom_components.data_values'.split('.'), []), 'id');
            Object.keys(components).map((componentId) => {
                components[componentId].primary = false;
            });
            this.ui.assetPool = {
                field: fields,
                component: components
            };
            PopLog.init(this.name, `ui.assetPool`, this.ui.assetPool);
            Object.keys(this.ui.assetPool).map((assetType) => {
                this._ensureAssetTypeContainers(assetType);
                Object.keys(this.ui.assetPool[assetType]).map((assetId) => {
                    this.asset.assetMap[assetType].set(+assetId, CleanObject(this.ui.assetPool[assetType][assetId]));
                    this.ui.assetPool[assetType][assetId].compact = typeof this.ui.assetPool[assetType][assetId].compact !== 'undefined' ? +this.ui.assetPool[assetType][assetId].compact : 1;
                });
            });
            const defaultSections = [
                {
                    id: 0,
                    name: ``,
                    business_id: PopBusiness.id,
                    scheme_id: +core.entity.id,
                    sort_order: 0,
                    container: true,
                    children: [],
                    mapping: {},
                    modified: true
                },
                {
                    id: 0,
                    name: ``,
                    business_id: PopBusiness.id,
                    scheme_id: +core.entity.id,
                    sort_order: 1,
                    container: true,
                    children: [],
                    mapping: {},
                    modified: true
                },
                {
                    id: 0,
                    name: ``,
                    business_id: PopBusiness.id,
                    scheme_id: +core.entity.id,
                    sort_order: 2,
                    container: true,
                    children: [],
                    mapping: {},
                    modified: true
                }
            ];
            this.ui.sections = IsArrayThrowError(core.entity.children, false, `Entity did not contain children`) ? core.entity.children.slice(0, 3) : []; // turned off copy for now since other components are looking at the _server_sections for looping
            if (!(IsArray(this.ui.sections, true)))
                this.ui.sections = defaultSections;
            const remainingFlex = 4 - this.ui.sections.length;
            this.ui.sections.map((section, index) => {
                section = this._transformSection(section, index);
                // const tableAssets = this._getSectionTableFieldsAssets( section );
                // section.children = [ ...tableAssets, ...section.children ];
                section.predicate = (item) => {
                    const data = item.data;
                    return data.compact;
                };
                this.ui.sections_keys.push(section.position);
            });
            if (this.ui.sections && this.ui.sections.length > 1) {
                const lastSection = this.ui.sections[this.ui.sections.length - 1];
                lastSection.predicate = (item) => {
                    return true;
                };
                if (remainingFlex)
                    lastSection.flex += remainingFlex;
            }
            Object.keys(this.ui.assetPool).map((assetType) => {
                let value;
                Object.keys(this.ui.assetPool[assetType]).map((assetId) => {
                    value = this.ui.attachedMap[assetType].has(+assetId);
                    this.ui.assignableConfigs[assetType][assetId] = new CheckboxConfig({
                        bubble: true,
                        value: value,
                        disabled: value,
                    });
                });
            });
            const requests = [];
            this.ui.sections.map((section) => {
                requests.push(this._resolveSectionId(section).then((id) => {
                    section.id = id;
                }));
            });
            yield forkJoin(requests);
            let primaryIds = JsonCopy(this.ui.primaryIds);
            this.ui.sections.sort(DynamicSort('sort_order'));
            primaryIds = this._checkForTraits(core, this.ui.sections, primaryIds);
            if (IsArray(this.ui.sections, true) && primaryIds.length) {
                primaryIds.map((fieldId) => {
                    this.onAssetAttaching('field', +fieldId, true);
                });
                this.ui.sections[0].children = yield this.onAttachingAssetsToPosition(this.ui.sections[0]);
            }
            return resolve(true);
        }));
    }
    /**
     * This fx is used to remove an asset/child from the scheme
     * @param position
     * @param asset
     */
    onRemoveChildFromLayout(position, child) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const positionIndex = position - 1;
            if (this.asset.core.entity.children[positionIndex]) {
                const container = this.ui.sections[positionIndex];
                if (child && typeof child.sort_order === 'number') {
                    this.srv.tab.showAsLoading(true);
                    yield this._removeSection(child);
                    container.children = container.children.filter((section) => {
                        return section.id !== child.id;
                    });
                    // transferArrayItem( container.children, [], child.sort_order, 0 );
                    container.mapping.sort_order = [];
                    container.children.map((item, index) => {
                        if (item.id)
                            container.mapping.sort_order.push(item.id);
                        item.sort_order = index;
                    });
                    this._setChildAsAttachable(child);
                    this.srv.tab.showAsLoading(false);
                    // this.onTriggerUpdate(1000);
                    return resolve(true);
                }
            }
            else {
                return resolve(true);
            }
        }));
    }
    /**
     * A user can dragSort aassets from one column to another in the scheme layout
     * @param event
     */
    onAssetSortDrop(event) {
        // console.log( 'onAssetSortDrop', event );
        let data;
        let prev;
        if (event.previousContainer === event.container) {
            data = this._getEventContainerData(event.container);
            if (+event.currentIndex < +data.startIndex)
                event.currentIndex = +data.startIndex;
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
            this._storePositionSortOrder(this._getSectionByPosition(data.position));
        }
        else {
            data = this._getEventContainerData(event.container);
            prev = this._getEventContainerData(event.previousContainer);
            if (+event.currentIndex < +data.startIndex)
                event.currentIndex = +data.startIndex;
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
            this._storePositionSortOrder(this._getSectionByPosition(prev.position));
            this._storePositionSortOrder(this._getSectionByPosition(data.position));
        }
        const droppedItem = event.item.data;
        let section = event.container.data.find((i) => {
            return +i.id === +droppedItem.id;
        });
        if (IsObject(section, ['id'])) {
            section = section;
            if (+data.id !== +section.scheme_id) {
                section.scheme_id = +data.id;
                PopRequest.doPatch(`profile-schemes/${section.id}`, { scheme_id: +data.id }, 1, false).subscribe(() => true);
            }
        }
    }
    /**
     * This fx used to register that a user has check an asset in the asset poll intending to attach it to a column in the scheme
     * @param asset_type
     * @param itemId
     * @param value
     */
    onAssetAttaching(asset_type, itemId, value) {
        if (this.asset.attachingSet[asset_type]) {
            if (value) {
                this.asset.attachingSet[asset_type].add(+itemId);
            }
            else {
                this.asset.attachingSet[asset_type].delete(+itemId);
            }
        }
    }
    /**
     * This fx is used to attach assets to a column in the scheme
     * The user will select which assets from a pool and then click a button representing the column where the assets should be pushed into
     * @param section
     */
    onAttachingAssetsToPosition(section) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            section.id = yield this._resolveSectionId(section);
            if (section.id) {
                const items = this._getAssetsToAttach();
                let child, asset;
                let children = [];
                const requests = [];
                if (IsObject(items, true)) {
                    Object.keys(items).map((assetType) => {
                        Object.keys(items[assetType]).map((itemId) => {
                            asset = this.asset.assetMap[assetType].get(+itemId);
                            child = {
                                id: null,
                                name: asset.name,
                                scheme_id: +section.id,
                                asset_type: assetType,
                                asset_id: +itemId,
                                asset: asset,
                                compact: assetType === 'component' ? asset.compact ? 1 : 0 : 1,
                                position: section.position,
                            };
                            this._setChildAsAttached(child);
                            children.push(child);
                            requests.push(this._resolveSectionId(child).then((id) => {
                                child.id = id;
                            }));
                        });
                    });
                }
                forkJoin(requests).subscribe(() => {
                    const tmp = IsArray(section.children, true) ? section.children : [];
                    section.mapping.sort_order = [];
                    children = [...tmp, ...children];
                    children.map((x, i) => {
                        if (x.id)
                            section.mapping.sort_order.push(x.id);
                        x.sort_order = i;
                    });
                    // this.onTriggerUpdate();
                    this._resetAssetAttachingData();
                    return resolve(children);
                });
            }
            else {
                return resolve(null);
            }
        }));
    }
    /**
     * This fx will take an array of sections an update any of the modified sections
     * @param sections
     */
    onUpdate(sections) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (IsArray(sections, true)) {
                yield this._update(sections, true);
                return resolve(true);
            }
            else {
                return resolve(false);
            }
        }));
    }
    /**
     * This fx is used to trigger an api call to save the current state of the scheme
     * @param delay
     */
    onTriggerUpdate(delay = 500) {
        this.dom.setTimeout('update-api', () => {
            // this._update();
        }, delay);
    }
    /**   * A user can click on an edit button an edit the config settings of an asset
  
     * @param asset
     */
    onEditAsset(asset) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (!this.dom.state.blockModal) {
                this.dom.state.blockModal = true;
                let componentType = null;
                // console.log('asset', asset);
                if (asset.asset_type === 'field') {
                    componentType = PopEntitySchemeFieldSettingComponent;
                }
                else if (asset.asset_type === 'component') {
                    // console.log('here');
                }
                if (componentType) {
                    const dialogRef = this.srv.dialog.open(PopEntitySchemeFieldSettingComponent, {
                        width: `900px`,
                        height: `1080px`,
                        panelClass: 'sw-mar-sm',
                        disableClose: true
                    });
                    let component = dialogRef.componentInstance;
                    component.core = this.asset.core;
                    component.config = asset;
                    this.dom.setSubscriber('asset-modal', dialogRef.beforeClosed().subscribe((scheme) => {
                        if (scheme) {
                            this.init(this.asset.core, this.asset.tab);
                            component = null;
                        }
                        else {
                            component = null;
                        }
                        this.dom.state.blockModal = false;
                        return resolve(true);
                    }));
                }
                else {
                    this.dom.state.blockModal = false;
                    return resolve(false);
                }
            }
            else {
                this.dom.state.blockModal = false;
                return resolve(false);
            }
        }));
    }
    getFieldMapping(fieldId) {
        const storage = this.asset.core.entity.mapping.field;
        return StorageSetter(storage, [`field_${fieldId}`]);
    }
    ngOnDestroy() {
        PopLog.warn(this.name, `destroyed:${this.id}`);
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * There a by default 3 columns, 1,2,3, this fx allows to find the section that represent one of those columns with
     * @param position number 1,2,3
     * @private
     */
    _getSectionByPosition(position) {
        let section = {};
        // console.log( 'position', position );
        if (+position) {
            const sectionIndex = position - 1;
            // console.log( 'sectionIndex', sectionIndex, this.ui.sections );
            if (sectionIndex in this.ui.sections) {
                section = this.ui.sections[sectionIndex];
            }
        }
        return section;
    }
    /**
     * This fx is used to map the the sort_order of all a section's children
     * @param section
     * @private
     */
    _storePositionSortOrder(section) {
        // console.log( '_storePositionSortOrder', section );
        if (IsObject(section, ['id', 'children'])) {
            section.mapping.sort_order = [];
            if (IsArray(section.children)) {
                section.children.map((item, index) => {
                    // console.log('item', item);
                    if (item.id)
                        section.mapping.sort_order.push(item.id);
                    item.sort_order = index;
                });
                const patch = {
                    mapping: {
                        sort_order: section.mapping.sort_order
                    }
                };
                PopRequest.doPatch(`profile-schemes/${section.id}`, patch, 1, false).subscribe(() => true);
            }
        }
    }
    /**
     * This fx will extract the data attributes stored on a html element
     * @param container
     * @private
     */
    _getEventContainerData(container) {
        const data = DeepCopy(StorageGetter(container, 'element.nativeElement.dataset'.split('.'), {}));
        if (IsObject(data, true)) {
            Object.keys(data).map((key) => {
                data[key] = ParseModelValue(data[key]);
            });
        }
        return data;
    }
    /**
     * Ensure that a section has an id that is stored int the api database
     * @param section
     */
    _resolveSectionId(section) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (IsObject(section, true)) {
                if (+section.id) {
                    return resolve(+section.id);
                }
                else {
                    const data = this._extractSectionData(section);
                    this.dom.setSubscriber(PopUid(), PopRequest.doPost(`profile-schemes`, data, 1, false).subscribe((res) => {
                        if (res.data)
                            res = res.data;
                        return resolve(+res.id);
                    }, () => {
                        return resolve(0);
                    }));
                }
            }
            else {
                return resolve(0);
            }
        }));
    }
    /**
     * This fx will make the api call to remove a section in the api database
     * @param section
     */
    _removeSection(section) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (IsObject(section, ['id'])) {
                this.dom.setSubscriber(PopUid(), PopRequest.doDelete(`profile-schemes/${section.id}`, {}, 1, false).subscribe((res) => {
                    if (res.data)
                        res = res.data;
                    // console.log( '_removeSection', res );
                    return resolve(true);
                }, () => {
                    return resolve(false);
                }));
            }
            else {
                return resolve(true);
            }
        }));
    }
    /**
     * This fx is used to make api call to the backend to save the scheme
     * @param store
     * @private
     */
    _update(sections, store = true) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (this.asset.core) {
                const modified = this._extractModifiedSections(sections, []);
                if (store && IsArray(modified, true)) {
                    const request = [];
                    modified.map((section) => {
                        if (+section.id) {
                            request.push(PopRequest.doPatch(`profile-schemes/${section.id}`, section, 1, false));
                        }
                        else {
                            request.push(PopRequest.doPost(`profile-schemes`, section, 1, false));
                        }
                    });
                    yield forkJoin(request);
                    return resolve(true);
                }
            }
            else {
                return resolve(true);
            }
        }));
    }
    /**
     * This fx is used to pull out all the scheme sections that need to be saved
     * @param sections
     * @private
     */
    _extractModifiedSections(sections, extracted = []) {
        if (IsArray(sections, true)) {
            sections.map((section, index) => {
                section.sort_order = index;
                if (section.modified) {
                    extracted.push(this._extractSectionData(section));
                    section.modified = false;
                }
                if (IsArray(section.children, true)) {
                    section.children.map((child, childIndex) => {
                        child.sort_order = childIndex;
                        if (child.modified) {
                            extracted.push(this._extractSectionData(child));
                            child.modified = false;
                        }
                        if (IsArray(child.children, true)) {
                            extracted = this._extractModifiedSections(child.children, extracted);
                        }
                    });
                }
            });
        }
        return extracted;
    }
    /**
     * This fx extracts the data off a section that should be store in the api database
     * @param section
     * @private
     */
    _extractSectionData(section) {
        return CleanObject({
            id: section.id,
            entity_id: 111,
            name: section.name ? section.name : null,
            asset_type: section.asset_type ? section.asset_type : null,
            asset_id: section.asset_type ? section.asset_id : null,
            scheme_id: section.scheme_id ? section.scheme_id : null,
            mapping: IsObject(section.mapping) ? section.mapping : { children: {} },
            sort_order: IsDefined(section.sort_order) ? section.sort_order : 99
        });
    }
    /**
     * Determine what assets have been set from the asset pool
     * This fx is called when a user click on a <column button> intending to attach assets into a specific column of the scheme
     */
    _getAssetsToAttach() {
        const attaching = {};
        Object.keys(this.asset.attachingSet).map((assetTypeKey) => {
            this.asset.attachingSet[assetTypeKey].forEach((assetId) => {
                if (!attaching[assetTypeKey])
                    attaching[assetTypeKey] = {};
                const assetable = this.asset.assetMap[assetTypeKey].get(assetId);
                if (assetTypeKey === 'component') {
                    attaching[assetTypeKey][assetId] = { compact: assetable.compact ? 1 : 0 };
                }
                else {
                    attaching[assetTypeKey][assetId] = { compact: 1 };
                }
            });
        });
        return attaching;
    }
    /**
     * Retrieve the default columns tht exist on an entity table
     * @param section
     */
    _getSectionTableFieldsAssets(section) {
        const tableAssets = [];
        if (this.asset.core) {
            const Field = StorageGetter(this.asset.core, 'repo.model.field'.split('.'));
            if (IsObject(Field, true)) {
                Object.values(Field).map((field) => {
                    if (!field.ancillary && field.position === section.position) {
                        tableAssets.push(new EntitySchemeSectionConfig({
                            id: 0,
                            name: field.model.label,
                            asset_type: 'table',
                            asset_id: 0,
                            asset: field,
                            scheme_id: +section.id,
                            sort_order: field.sort,
                            position: section.position,
                        }));
                    }
                });
            }
        }
        section.startIndex = tableAssets.length;
        return tableAssets.sort((a, b) => {
            if (a.sort < b.sort)
                return -1;
            if (a.sort > b.sort)
                return 1;
            return 0;
        });
    }
    /**
     * Convert child sections to the expected structure
     * @param child
     * @private
     */
    _transformSection(section, index) {
        section = CleanObject(section, { blacklist: ['flattened'] }); // first level are only containers
        section.container = true;
        section.position = index + 1;
        section.flex = 1;
        section.sort_order = index;
        if (!(IsObject(section.mapping)))
            section.mapping = {};
        if (!(IsArray(section.mapping.sort_order)))
            section.mapping.sort_order = [];
        if (!(IsArray(section.children)))
            section.children = [];
        section.children = section.children.filter((child) => {
            if (String(String(child.asset_type).toLowerCase()).includes('field')) {
                child.asset_type = 'field';
            }
            else if (String(String(child.asset_type).toLowerCase()).includes('component')) {
                child.asset_type = 'component';
            }
            else if (String(String(child.asset_type).toLowerCase()).includes('widget')) {
                child.asset_type = 'widget';
            }
            // console.log('type', child.asset_type);
            if (child.asset_type && child.asset_type != 'table') {
                if (+child.asset_id) {
                    return this.asset.assetMap[child.asset_type].has(child.asset_id);
                }
                else {
                    return true;
                }
            }
            return child.asset_type != 'table';
        });
        section.children.map((child) => {
            child = this._transformChild(child);
            child.sort_order = section.mapping.sort_order.includes(child.id) ? +section.mapping.sort_order.indexOf(child.id) : 99;
            if (IsObject(child.asset, true)) {
                if (IsString(child.asset_type, true)) {
                    child.compact = (IsObject(child.asset, ['compact']) && IsDefined(child.asset.compact) ? child.asset.compact : false);
                    this._ensureAssetTypeContainers(child.asset_type);
                    this.ui.attachedMap[child.asset_type].set(+child.asset_id, section.position);
                }
                else {
                    this._transformSection(child, index);
                }
            }
        });
        section.children.sort(DynamicSort('sort_order'));
        return section;
    }
    /**
     * Convert child of a section to the expected structure
     * @param child
     */
    _transformChild(child) {
        child = CleanObject(child);
        if (!(IsObject(child.mapping)))
            child.mapping = {};
        if (IsDefined(child.asset_id) && +child.asset_id) {
            delete child.children;
            if (String(String(child.asset_type).toLowerCase()).includes('field'))
                child.asset_type = 'field';
            if (child.asset_type === 'field' && this.asset.assetMap.field.has(child.asset_id)) {
                child.asset = this.asset.assetMap.field.get(child.asset_id);
                child.name = child.asset.name;
                child.compact = true;
            }
            else if (child.asset_type === 'component' && this.asset.assetMap.component.has(child.asset_id)) {
                child.asset_type = 'component';
                child.asset = this.asset.assetMap.component.get(child.asset_id);
                child.name = child.asset.name;
            }
            child.container = false;
        }
        else {
            child.container = true;
        }
        return child;
    }
    /**
     * This fx is used ensures that an asset type has the all ancillary assets needed
     * @param assetType
     */
    _ensureAssetTypeContainers(assetType) {
        if (!this.asset.attachingSet[assetType])
            this.asset.attachingSet[assetType] = new Set();
        if (!this.asset.assetMap[assetType])
            this.asset.assetMap[assetType] = new Map();
        if (!this.ui.attachedMap[assetType])
            this.ui.attachedMap[assetType] = new Map();
        if (!this.ui.assignableConfigs[assetType])
            this.ui.assignableConfigs[assetType] = {};
    }
    /**
     * Clear out all the attaching set data
     */
    _resetAssetAttachingData() {
        Object.keys(this.asset.attachingSet).map((key) => {
            this.asset.attachingSet[key].clear();
        });
    }
    /**
     * Refresh the core entity
     * @param dom
     */
    _refreshEntity(dom = null) {
        this.asset.core.channel.emit({
            source: this.name,
            target: 'PopEntityTabComponent',
            type: 'component',
            name: 'start-refresh'
        });
        this.srv.tab.refreshEntity(null, dom, {}, `${this.name}:viewEntityPortal`).then((res) => {
            this.init(this.asset.core, this.asset.tab);
            this.dom.state.blockModal = false;
            this.asset.core.channel.emit({
                source: this.name,
                target: 'PopEntityTabComponent',
                type: 'component',
                name: 'stop-refresh'
            });
        });
    }
    /**
     * This fx is used to mark an asset in the asset pool as attachable
     * @param asset
     */
    _setChildAsAttachable(child) {
        if (!child.container) {
            this.ui.attachedMap[child.asset_type].delete(child.asset_id);
            this.ui.assignableConfigs[child.asset_type][child.asset_id].control.setValue(0);
            this.ui.assignableConfigs[child.asset_type][child.asset_id].control.enable();
        }
    }
    /**
     * This fx is used to mark an asset in as attached, setting it up to be transferred to a column in the scheme
     * @param asset
     */
    _setChildAsAttached(child, position = 1) {
        if (!child.container) {
            this.ui.attachedMap[child.asset_type].set(child.asset_id, position);
            this.ui.assignableConfigs[child.asset_type][child.asset_id].control.setValue(1);
            this.ui.assignableConfigs[child.asset_type][child.asset_id].control.disable();
        }
    }
    /**
     * This fx is used to pull out all the scheme sections that need to be saved
     * @param sections
     * @private
     */
    _checkForTraits(core, sections, primaryIds = []) {
        if (IsArray(sections, true)) {
            sections.map((section) => {
                if (IsArray(section.children, true)) {
                    section.children.map((child) => {
                        if (child.asset_type === 'field') {
                            child.asset.required = IsArray(core.entity.mapping.required) ? core.entity.mapping.required.includes(child.asset_id) : false;
                            if (primaryIds.includes(child.asset_id)) {
                                primaryIds.splice(primaryIds.indexOf(child.asset_id), 1);
                                child.asset.primary = true;
                            }
                            else {
                                child.asset.primary = false;
                            }
                        }
                        if (IsArray(child.children, true)) {
                            this._checkForTraits(core, child.children, primaryIds);
                        }
                    });
                }
            });
        }
        return primaryIds;
    }
}
PopEntitySchemeService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopEntitySchemeService_Factory() { return new PopEntitySchemeService(i0.ɵɵinject(i1.PopTabMenuService)); }, token: PopEntitySchemeService, providedIn: "root" });
PopEntitySchemeService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopEntitySchemeService.ctorParameters = () => [
    { type: PopTabMenuService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1zY2hlbWUuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LXNjaGVtZS9wb3AtZW50aXR5LXNjaGVtZS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3BELE9BQU8sRUFBdUIsZUFBZSxFQUFFLGlCQUFpQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDaEcsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBR25ELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLDhDQUE4QyxDQUFDO0FBRS9FLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSw4REFBOEQsQ0FBQztBQUU1RixPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxzQ0FBc0MsQ0FBQztBQUN0RSxPQUFPLEVBS0wsV0FBVyxFQUNYLE1BQU0sRUFDTixVQUFVLEVBQ1YsZUFBZSxFQUNoQixNQUFNLDJCQUEyQixDQUFDO0FBQ25DLE9BQU8sRUFDTCxVQUFVLEVBQUUsZUFBZSxFQUMzQixXQUFXLEVBQ1gsUUFBUSxFQUNSLFdBQVcsRUFDWCxPQUFPLEVBQUUsaUJBQWlCLEVBQzFCLFNBQVMsRUFDVCxRQUFRLEVBQ1Isa0JBQWtCLEVBQ2xCLFFBQVEsRUFBRSxRQUFRLEVBQ2xCLE1BQU0sRUFDTixhQUFhLEVBQUUsYUFBYSxFQUM3QixNQUFNLDZCQUE2QixDQUFDO0FBQ3JDLE9BQU8sRUFBQyx5QkFBeUIsRUFBK0IsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRyxPQUFPLEVBQUMsUUFBUSxFQUFFLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN2QyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDdEQs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QyxLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQzs2QkFDN0I7eUJBQ0Y7d0JBQ0QsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsRUFBRTs0QkFDakMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQzt5QkFDeEQ7b0JBQ0gsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7WUFDSCxDQUFDLENBQUMsQ0FBQztTQUNKO1FBQ0QsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQzs7OztZQTcyQkYsVUFBVSxTQUFDO2dCQUNWLFVBQVUsRUFBRSxNQUFNO2FBQ25COzs7WUFyQ08saUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlLCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDZGtEcmFnLCBDZGtEcmFnRHJvcCwgbW92ZUl0ZW1JbkFycmF5LCB0cmFuc2ZlckFycmF5SXRlbX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2RyYWctZHJvcCc7XG5pbXBvcnQge01hdERpYWxvZ30gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGlhbG9nJztcblxuaW1wb3J0IHtQb3BEb21TZXJ2aWNlfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlcy9wb3AtZG9tLnNlcnZpY2UnO1xuaW1wb3J0IHtQb3BUYWJNZW51U2VydmljZX0gZnJvbSAnLi4vLi4vYmFzZS9wb3AtdGFiLW1lbnUvcG9wLXRhYi1tZW51LnNlcnZpY2UnO1xuaW1wb3J0IHtUYWJDb25maWd9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLXRhYi1tZW51L3RhYi1tZW51Lm1vZGVsJztcbmltcG9ydCB7Q2hlY2tib3hDb25maWd9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLWNoZWNrYm94L2NoZWNrYm94LWNvbmZpZy5tb2RlbCc7XG5cbmltcG9ydCB7UG9wRXh0ZW5kU2VydmljZX0gZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvcG9wLWV4dGVuZC5zZXJ2aWNlJztcbmltcG9ydCB7XG4gIENvcmVDb25maWcsXG4gIERpY3Rpb25hcnksXG4gIEZpZWxkSW50ZXJmYWNlLFxuICBLZXlNYXAsXG4gIFBvcEJ1c2luZXNzLFxuICBQb3BMb2csXG4gIFBvcFJlcXVlc3QsXG4gIFNlcnZpY2VJbmplY3RvclxufSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7XG4gIEFycmF5S2V5QnksIEFycmF5T25seVVuaXF1ZSxcbiAgQ2xlYW5PYmplY3QsXG4gIERlZXBDb3B5LFxuICBEeW5hbWljU29ydCxcbiAgSXNBcnJheSwgSXNBcnJheVRocm93RXJyb3IsXG4gIElzRGVmaW5lZCxcbiAgSXNPYmplY3QsXG4gIElzT2JqZWN0VGhyb3dFcnJvcixcbiAgSXNTdHJpbmcsIEpzb25Db3B5LFxuICBQb3BVaWQsXG4gIFN0b3JhZ2VHZXR0ZXIsIFN0b3JhZ2VTZXR0ZXJcbn0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7RW50aXR5U2NoZW1lU2VjdGlvbkNvbmZpZywgRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZX0gZnJvbSAnLi9wb3AtZW50aXR5LXNjaGVtZS5tb2RlbCc7XG5pbXBvcnQge2ZvcmtKb2luLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7UGFyc2VNb2RlbFZhbHVlfSBmcm9tICcuLi9wb3AtZW50aXR5LXV0aWxpdHknO1xuaW1wb3J0IHtQb3BFbnRpdHlTY2hlbWVGaWVsZFNldHRpbmdDb21wb25lbnR9IGZyb20gJy4vcG9wLWVudGl0eS1zY2hlbWUtZmllbGQtc2V0dGluZy9wb3AtZW50aXR5LXNjaGVtZS1maWVsZC1zZXR0aW5nLmNvbXBvbmVudCc7XG5pbXBvcnQge1BvcEVudGl0eUFjdGlvblNlcnZpY2V9IGZyb20gJy4uL3NlcnZpY2VzL3BvcC1lbnRpdHktYWN0aW9uLnNlcnZpY2UnO1xuXG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIFBvcEVudGl0eVNjaGVtZVNlcnZpY2UgZXh0ZW5kcyBQb3BFeHRlbmRTZXJ2aWNlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHVibGljIG5hbWUgPSAnUG9wRW50aXR5U2NoZW1lU2VydmljZSc7XG5cbiAgcHJvdGVjdGVkIHNydjoge1xuICAgIGFjdGlvbjogUG9wRW50aXR5QWN0aW9uU2VydmljZSxcbiAgICBkaWFsb2c6IE1hdERpYWxvZyxcbiAgICB0YWI6IFBvcFRhYk1lbnVTZXJ2aWNlLFxuICB9O1xuXG4gIHB1YmxpYyB1aSA9IHtcbiAgICByZWZyZXNoOiBuZXcgU3ViamVjdDxzdHJpbmc+KCksXG4gICAgYXR0YWNoZWRNYXA6IHt9LCAvLyB0aGUgbWFwIG9mIGFzc2V0cyB0aGF0IGFyZSBhbHJlYWR5IGF0dGFjaGVkIHRvIGEgc2VjdGlvbiBvZiB0aGUgc2NoZW1lXG4gICAgYXNzZXRQb29sOiA8RGljdGlvbmFyeTxhbnk+Pnt9LFxuICAgIGFzc2lnbmFibGVDb25maWdzOiB7fSwgLy8gYSBjb2xsZWN0aW9uIG1hcCBvZiBjaGVja2JveCBjb25maWdzIHRoYXQgYXJlIHVzZWQgdG8gbW92ZSBhbiBhc3NldCBpbnRvIHRoZSBhdHRhY2hpbmcgc3RhdGVcbiAgICBwcmltYXJ5OiA8RGljdGlvbmFyeTxudW1iZXI+Pnt9LFxuICAgIHByaW1hcnlJZHM6IDxudW1iZXJbXT5bXSxcbiAgICBzZWN0aW9uc19rZXlzOiBbXSxcbiAgICBzZWN0aW9uczogPGFueVtdPnVuZGVmaW5lZFxuICB9O1xuXG4gIHByb3RlY3RlZCBhc3NldCA9IHtcbiAgICBhdHRhY2hpbmdTZXQ6IHt9LCAvLyB0aGUgbWFwIG9mIGFzc2V0cyB0aGF0IGFyZSBpbiBhIHN0YXRlIG9mIGJlaW5nIGF0dGFjaGVkXG4gICAgYXNzZXRNYXA6IHtcbiAgICAgIGZpZWxkOiA8TWFwPG51bWJlciwgRmllbGRJbnRlcmZhY2U+Pm5ldyBNYXA8bnVtYmVyLCBGaWVsZEludGVyZmFjZT4oKSxcbiAgICAgIGNvbXBvbmVudDogPE1hcDxudW1iZXIsIGFueT4+bmV3IE1hcDxudW1iZXIsIGFueT4oKSxcbiAgICB9LC8vIHRoZSBhY3R1YWxseSBEYXRhT2JqZWN0IHRoYXQgYW4gYXNzZXQgcmVwcmVzZW50c1xuICAgIGNvcmU6IDxDb3JlQ29uZmlnPnVuZGVmaW5lZCxcbiAgICB0YWI6IDxUYWJDb25maWc+dW5kZWZpbmVkLFxuICB9O1xuXG5cbiAgcHJpdmF0ZSBfc2V0U2VydmljZUNvbnRhaW5lcigpIHtcbiAgICB0aGlzLnNydiA9IHtcbiAgICAgIGFjdGlvbjogU2VydmljZUluamVjdG9yLmdldChQb3BFbnRpdHlBY3Rpb25TZXJ2aWNlKSxcbiAgICAgIGRpYWxvZzogU2VydmljZUluamVjdG9yLmdldChNYXREaWFsb2cpLFxuICAgICAgdGFiOiB0aGlzLnRhYlJlcG9cbiAgICB9O1xuICAgIGRlbGV0ZSB0aGlzLnRhYlJlcG87XG4gIH1cblxuXG4gIGNvbnN0cnVjdG9yKCAvLyBUaGlzIHNlcnZpY2UgaXMgdW5pcXVlIHRvIGV2ZXJ5IGNvbXBvbmVudCwgcHJvdmlkZWQgaW4gdGhlIFBvcEVudGl0eVRhYkNvbXBvbmVudFxuICAgIHByaXZhdGUgdGFiUmVwbzogUG9wVGFiTWVudVNlcnZpY2UsXG4gICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fc2V0U2VydmljZUNvbnRhaW5lcigpO1xuICAgIFBvcExvZy5pbml0KHRoaXMubmFtZSwgYGNyZWF0ZWQ6JHt0aGlzLmlkfWApO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBmeCB0YWtlcyB0aGUgaW5pdGlhbCBkYXRhIGFuZCBjb25maWd1cmVzIGl0IHRvIHRoZSBleHBlY3RlZCBzdHJ1Y3R1cmUgYW5kIHNldHMgdXAgYWxsIHRoZSBhbmNpbGxhcnkgYXNzZXRzIG5lZWRlZFxuICAgKiBAcGFyYW0gY29yZVxuICAgKiBAcGFyYW0gdGFiXG4gICAqL1xuICBpbml0KGNvcmU6IENvcmVDb25maWcsIHRhYjogVGFiQ29uZmlnKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICB0aGlzLmFzc2V0LmNvcmUgPSBJc09iamVjdFRocm93RXJyb3IoY29yZSwgdHJ1ZSwgYCR7dGhpcy5uYW1lfTpjb3JlYCkgPyA8Q29yZUNvbmZpZz5jb3JlIDogbnVsbDtcbiAgICAgIHRoaXMuYXNzZXQudGFiID0gSXNPYmplY3RUaHJvd0Vycm9yKHRhYiwgdHJ1ZSwgYCR7dGhpcy5uYW1lfTppbml0OiAtIHRhYmApID8gPFRhYkNvbmZpZz50YWIgOiA8VGFiQ29uZmlnPnt9O1xuICAgICAgLy8gdGhpcy5hc3NldC5hdHRhY2ggPSB7IGZpZWxkczoge30sIGNvbXBvbmVudHM6IHt9IH07XG4gICAgICAvLyBsZXQgdmFsdWU7XG5cbiAgICAgIHRoaXMudWkuc2VjdGlvbnNfa2V5cyA9IFtdO1xuXG4gICAgICBpZiAoIShJc09iamVjdChjb3JlLmVudGl0eS5tYXBwaW5nKSkpIHtcbiAgICAgICAgY29yZS5lbnRpdHkubWFwcGluZyA9IDxEaWN0aW9uYXJ5PGFueT4+e307XG4gICAgICB9XG4gICAgICBpZiAoIShJc09iamVjdChjb3JlLmVudGl0eS5tYXBwaW5nLmZpZWxkKSkpIHtcbiAgICAgICAgY29yZS5lbnRpdHkubWFwcGluZy5maWVsZCA9IDxEaWN0aW9uYXJ5PGFueT4+e307XG4gICAgICB9XG4gICAgICBpZiAoIShJc09iamVjdChjb3JlLmVudGl0eS5tYXBwaW5nLnByaW1hcnkpKSkge1xuICAgICAgICBjb3JlLmVudGl0eS5tYXBwaW5nLnByaW1hcnkgPSA8RGljdGlvbmFyeTxib29sZWFuPj57fTtcbiAgICAgIH1cbiAgICAgIGlmICghKElzQXJyYXkoY29yZS5lbnRpdHkubWFwcGluZy5yZXF1aXJlZCkpKSB7XG4gICAgICAgIGNvcmUuZW50aXR5Lm1hcHBpbmcucmVxdWlyZWQgPSBbXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvcmUuZW50aXR5Lm1hcHBpbmcucmVxdWlyZWQgPSBBcnJheU9ubHlVbmlxdWUoY29yZS5lbnRpdHkubWFwcGluZy5yZXF1aXJlZCk7XG4gICAgICB9XG4gICAgICAvLyBpZiggISggSXNPYmplY3QoIGNvcmUuZW50aXR5Lm1hcHBpbmcuZmllbGQgKSApICl7XG4gICAgICAvLyAgIGNvcmUuZW50aXR5Lm1hcHBpbmcuZmllbGQgPSA8S2V5TWFwPGFueT4+e307XG4gICAgICAvLyB9XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKCdvcmlnIHNjaGVtZScsIGNvcmUuZW50aXR5Lm5hbWUsIGNvcmUuZW50aXR5Lm1hcHBpbmcpO1xuXG4gICAgICB0aGlzLnVpLnByaW1hcnkgPSBTdG9yYWdlR2V0dGVyKGNvcmUsIFsnZW50aXR5JywgJ21hcHBpbmcnLCAncHJpbWFyeSddLCB7fSk7XG4gICAgICB0aGlzLnVpLnByaW1hcnlJZHMgPSBPYmplY3QudmFsdWVzKHRoaXMudWkucHJpbWFyeSkubWFwKChpID0+ICtpKSkuc29ydCgpO1xuXG5cbiAgICAgIGNvbnN0IGZpZWxkcyA9IEFycmF5S2V5QnkoU3RvcmFnZUdldHRlcih0aGlzLmFzc2V0LmNvcmUsICdyZXNvdXJjZS5jdXN0b21fZmllbGRzLmRhdGFfdmFsdWVzJy5zcGxpdCgnLicpLCBbXSksICdpZCcpO1xuICAgICAgT2JqZWN0LmtleXMoZmllbGRzKS5tYXAoKGZpZWxkSWQpID0+IHtcbiAgICAgICAgY29uc3QgZmllbGQgPSBmaWVsZHNbZmllbGRJZF07XG4gICAgICAgIGZpZWxkLnByaW1hcnkgPSB0aGlzLnVpLnByaW1hcnlJZHMuaW5jbHVkZXMoK2ZpZWxkSWQpO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGNvbXBvbmVudHMgPSBBcnJheUtleUJ5KFN0b3JhZ2VHZXR0ZXIodGhpcy5hc3NldC5jb3JlLCAncmVzb3VyY2UuY3VzdG9tX2NvbXBvbmVudHMuZGF0YV92YWx1ZXMnLnNwbGl0KCcuJyksIFtdKSwgJ2lkJyk7XG4gICAgICBPYmplY3Qua2V5cyhjb21wb25lbnRzKS5tYXAoKGNvbXBvbmVudElkKSA9PiB7XG4gICAgICAgIGNvbXBvbmVudHNbY29tcG9uZW50SWRdLnByaW1hcnkgPSBmYWxzZTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnVpLmFzc2V0UG9vbCA9IHtcbiAgICAgICAgZmllbGQ6IGZpZWxkcyxcbiAgICAgICAgY29tcG9uZW50OiBjb21wb25lbnRzXG4gICAgICB9O1xuXG4gICAgICBQb3BMb2cuaW5pdCh0aGlzLm5hbWUsIGB1aS5hc3NldFBvb2xgLCB0aGlzLnVpLmFzc2V0UG9vbCk7XG5cbiAgICAgIE9iamVjdC5rZXlzKHRoaXMudWkuYXNzZXRQb29sKS5tYXAoKGFzc2V0VHlwZSkgPT4ge1xuICAgICAgICB0aGlzLl9lbnN1cmVBc3NldFR5cGVDb250YWluZXJzKGFzc2V0VHlwZSk7XG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMudWkuYXNzZXRQb29sW2Fzc2V0VHlwZV0pLm1hcCgoYXNzZXRJZCkgPT4ge1xuICAgICAgICAgIHRoaXMuYXNzZXQuYXNzZXRNYXBbYXNzZXRUeXBlXS5zZXQoK2Fzc2V0SWQsIENsZWFuT2JqZWN0KHRoaXMudWkuYXNzZXRQb29sW2Fzc2V0VHlwZV1bYXNzZXRJZF0pKTtcbiAgICAgICAgICB0aGlzLnVpLmFzc2V0UG9vbFthc3NldFR5cGVdW2Fzc2V0SWRdLmNvbXBhY3QgPSB0eXBlb2YgdGhpcy51aS5hc3NldFBvb2xbYXNzZXRUeXBlXVthc3NldElkXS5jb21wYWN0ICE9PSAndW5kZWZpbmVkJyA/ICt0aGlzLnVpLmFzc2V0UG9vbFthc3NldFR5cGVdW2Fzc2V0SWRdLmNvbXBhY3QgOiAxO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBkZWZhdWx0U2VjdGlvbnMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogMCxcbiAgICAgICAgICBuYW1lOiBgYCxcbiAgICAgICAgICBidXNpbmVzc19pZDogUG9wQnVzaW5lc3MuaWQsXG4gICAgICAgICAgc2NoZW1lX2lkOiArY29yZS5lbnRpdHkuaWQsXG4gICAgICAgICAgc29ydF9vcmRlcjogMCxcbiAgICAgICAgICBjb250YWluZXI6IHRydWUsXG4gICAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAgIG1hcHBpbmc6IHt9LFxuICAgICAgICAgIG1vZGlmaWVkOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogMCxcbiAgICAgICAgICBuYW1lOiBgYCxcbiAgICAgICAgICBidXNpbmVzc19pZDogUG9wQnVzaW5lc3MuaWQsXG4gICAgICAgICAgc2NoZW1lX2lkOiArY29yZS5lbnRpdHkuaWQsXG4gICAgICAgICAgc29ydF9vcmRlcjogMSxcbiAgICAgICAgICBjb250YWluZXI6IHRydWUsXG4gICAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAgIG1hcHBpbmc6IHt9LFxuICAgICAgICAgIG1vZGlmaWVkOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogMCxcbiAgICAgICAgICBuYW1lOiBgYCxcbiAgICAgICAgICBidXNpbmVzc19pZDogUG9wQnVzaW5lc3MuaWQsXG4gICAgICAgICAgc2NoZW1lX2lkOiArY29yZS5lbnRpdHkuaWQsXG4gICAgICAgICAgc29ydF9vcmRlcjogMixcbiAgICAgICAgICBjb250YWluZXI6IHRydWUsXG4gICAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAgIG1hcHBpbmc6IHt9LFxuICAgICAgICAgIG1vZGlmaWVkOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIF07XG5cblxuICAgICAgdGhpcy51aS5zZWN0aW9ucyA9IElzQXJyYXlUaHJvd0Vycm9yKGNvcmUuZW50aXR5LmNoaWxkcmVuLCBmYWxzZSwgYEVudGl0eSBkaWQgbm90IGNvbnRhaW4gY2hpbGRyZW5gKSA/IGNvcmUuZW50aXR5LmNoaWxkcmVuLnNsaWNlKDAsIDMpIDogW107IC8vIHR1cm5lZCBvZmYgY29weSBmb3Igbm93IHNpbmNlIG90aGVyIGNvbXBvbmVudHMgYXJlIGxvb2tpbmcgYXQgdGhlIF9zZXJ2ZXJfc2VjdGlvbnMgZm9yIGxvb3BpbmdcblxuICAgICAgaWYgKCEoSXNBcnJheSh0aGlzLnVpLnNlY3Rpb25zLCB0cnVlKSkpIHRoaXMudWkuc2VjdGlvbnMgPSBkZWZhdWx0U2VjdGlvbnM7XG5cblxuICAgICAgY29uc3QgcmVtYWluaW5nRmxleCA9IDQgLSB0aGlzLnVpLnNlY3Rpb25zLmxlbmd0aDtcbiAgICAgIHRoaXMudWkuc2VjdGlvbnMubWFwKChzZWN0aW9uLCBpbmRleCkgPT4ge1xuICAgICAgICBzZWN0aW9uID0gdGhpcy5fdHJhbnNmb3JtU2VjdGlvbihzZWN0aW9uLCBpbmRleCk7XG4gICAgICAgIC8vIGNvbnN0IHRhYmxlQXNzZXRzID0gdGhpcy5fZ2V0U2VjdGlvblRhYmxlRmllbGRzQXNzZXRzKCBzZWN0aW9uICk7XG4gICAgICAgIC8vIHNlY3Rpb24uY2hpbGRyZW4gPSBbIC4uLnRhYmxlQXNzZXRzLCAuLi5zZWN0aW9uLmNoaWxkcmVuIF07XG4gICAgICAgIHNlY3Rpb24ucHJlZGljYXRlID0gKGl0ZW06IENka0RyYWc8bnVtYmVyPikgPT4ge1xuICAgICAgICAgIGNvbnN0IGRhdGEgPSA8YW55Pml0ZW0uZGF0YTtcbiAgICAgICAgICByZXR1cm4gZGF0YS5jb21wYWN0O1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnVpLnNlY3Rpb25zX2tleXMucHVzaChzZWN0aW9uLnBvc2l0aW9uKTtcbiAgICAgIH0pO1xuICAgICAgaWYgKHRoaXMudWkuc2VjdGlvbnMgJiYgdGhpcy51aS5zZWN0aW9ucy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGNvbnN0IGxhc3RTZWN0aW9uID0gdGhpcy51aS5zZWN0aW9uc1t0aGlzLnVpLnNlY3Rpb25zLmxlbmd0aCAtIDFdO1xuICAgICAgICBsYXN0U2VjdGlvbi5wcmVkaWNhdGUgPSAoaXRlbTogQ2RrRHJhZzxudW1iZXI+KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChyZW1haW5pbmdGbGV4KSBsYXN0U2VjdGlvbi5mbGV4ICs9IHJlbWFpbmluZ0ZsZXg7XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5rZXlzKHRoaXMudWkuYXNzZXRQb29sKS5tYXAoKGFzc2V0VHlwZSkgPT4ge1xuICAgICAgICBsZXQgdmFsdWU7XG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMudWkuYXNzZXRQb29sW2Fzc2V0VHlwZV0pLm1hcCgoYXNzZXRJZCkgPT4ge1xuICAgICAgICAgIHZhbHVlID0gdGhpcy51aS5hdHRhY2hlZE1hcFthc3NldFR5cGVdLmhhcygrYXNzZXRJZCk7XG4gICAgICAgICAgdGhpcy51aS5hc3NpZ25hYmxlQ29uZmlnc1thc3NldFR5cGVdW2Fzc2V0SWRdID0gbmV3IENoZWNrYm94Q29uZmlnKHtcbiAgICAgICAgICAgIGJ1YmJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIGRpc2FibGVkOiB2YWx1ZSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcmVxdWVzdHMgPSBbXTtcbiAgICAgIHRoaXMudWkuc2VjdGlvbnMubWFwKChzZWN0aW9uKSA9PiB7XG4gICAgICAgIHJlcXVlc3RzLnB1c2godGhpcy5fcmVzb2x2ZVNlY3Rpb25JZChzZWN0aW9uKS50aGVuKChpZDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgc2VjdGlvbi5pZCA9IGlkO1xuICAgICAgICB9KSk7XG4gICAgICB9KTtcbiAgICAgIGF3YWl0IGZvcmtKb2luKHJlcXVlc3RzKTtcbiAgICAgIGxldCBwcmltYXJ5SWRzID0gSnNvbkNvcHkodGhpcy51aS5wcmltYXJ5SWRzKTtcbiAgICAgIHRoaXMudWkuc2VjdGlvbnMuc29ydChEeW5hbWljU29ydCgnc29ydF9vcmRlcicpKTtcbiAgICAgIHByaW1hcnlJZHMgPSB0aGlzLl9jaGVja0ZvclRyYWl0cyhjb3JlLCB0aGlzLnVpLnNlY3Rpb25zLCBwcmltYXJ5SWRzKTtcbiAgICAgIGlmIChJc0FycmF5KHRoaXMudWkuc2VjdGlvbnMsIHRydWUpICYmIHByaW1hcnlJZHMubGVuZ3RoKSB7XG4gICAgICAgIHByaW1hcnlJZHMubWFwKChmaWVsZElkOiBudW1iZXIpID0+IHtcbiAgICAgICAgICB0aGlzLm9uQXNzZXRBdHRhY2hpbmcoJ2ZpZWxkJywgK2ZpZWxkSWQsIHRydWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy51aS5zZWN0aW9uc1swXS5jaGlsZHJlbiA9IGF3YWl0IHRoaXMub25BdHRhY2hpbmdBc3NldHNUb1Bvc2l0aW9uKHRoaXMudWkuc2VjdGlvbnNbMF0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG5cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgZnggaXMgdXNlZCB0byByZW1vdmUgYW4gYXNzZXQvY2hpbGQgZnJvbSB0aGUgc2NoZW1lXG4gICAqIEBwYXJhbSBwb3NpdGlvblxuICAgKiBAcGFyYW0gYXNzZXRcbiAgICovXG4gIG9uUmVtb3ZlQ2hpbGRGcm9tTGF5b3V0KHBvc2l0aW9uOiBudW1iZXIsIGNoaWxkOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCBwb3NpdGlvbkluZGV4ID0gcG9zaXRpb24gLSAxO1xuICAgICAgaWYgKHRoaXMuYXNzZXQuY29yZS5lbnRpdHkuY2hpbGRyZW5bcG9zaXRpb25JbmRleF0pIHtcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy51aS5zZWN0aW9uc1twb3NpdGlvbkluZGV4XTtcbiAgICAgICAgaWYgKGNoaWxkICYmIHR5cGVvZiBjaGlsZC5zb3J0X29yZGVyID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHRoaXMuc3J2LnRhYi5zaG93QXNMb2FkaW5nKHRydWUpO1xuICAgICAgICAgIGF3YWl0IHRoaXMuX3JlbW92ZVNlY3Rpb24oY2hpbGQpO1xuICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbiA9IGNvbnRhaW5lci5jaGlsZHJlbi5maWx0ZXIoKHNlY3Rpb246IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzZWN0aW9uLmlkICE9PSBjaGlsZC5pZDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyB0cmFuc2ZlckFycmF5SXRlbSggY29udGFpbmVyLmNoaWxkcmVuLCBbXSwgY2hpbGQuc29ydF9vcmRlciwgMCApO1xuICAgICAgICAgIGNvbnRhaW5lci5tYXBwaW5nLnNvcnRfb3JkZXIgPSBbXTtcbiAgICAgICAgICBjb250YWluZXIuY2hpbGRyZW4ubWFwKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgaWYgKGl0ZW0uaWQpIGNvbnRhaW5lci5tYXBwaW5nLnNvcnRfb3JkZXIucHVzaChpdGVtLmlkKTtcbiAgICAgICAgICAgIGl0ZW0uc29ydF9vcmRlciA9IGluZGV4O1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuX3NldENoaWxkQXNBdHRhY2hhYmxlKGNoaWxkKTtcbiAgICAgICAgICB0aGlzLnNydi50YWIuc2hvd0FzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgICAgLy8gdGhpcy5vblRyaWdnZXJVcGRhdGUoMTAwMCk7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfVxuXG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBIHVzZXIgY2FuIGRyYWdTb3J0IGFhc3NldHMgZnJvbSBvbmUgY29sdW1uIHRvIGFub3RoZXIgaW4gdGhlIHNjaGVtZSBsYXlvdXRcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuICBvbkFzc2V0U29ydERyb3AoZXZlbnQ6IENka0RyYWdEcm9wPHN0cmluZ1tdPikge1xuICAgIC8vIGNvbnNvbGUubG9nKCAnb25Bc3NldFNvcnREcm9wJywgZXZlbnQgKTtcbiAgICBsZXQgZGF0YTtcbiAgICBsZXQgcHJldjtcbiAgICBpZiAoZXZlbnQucHJldmlvdXNDb250YWluZXIgPT09IGV2ZW50LmNvbnRhaW5lcikge1xuICAgICAgZGF0YSA9IHRoaXMuX2dldEV2ZW50Q29udGFpbmVyRGF0YShldmVudC5jb250YWluZXIpO1xuICAgICAgaWYgKCtldmVudC5jdXJyZW50SW5kZXggPCArZGF0YS5zdGFydEluZGV4KSBldmVudC5jdXJyZW50SW5kZXggPSArZGF0YS5zdGFydEluZGV4O1xuICAgICAgbW92ZUl0ZW1JbkFycmF5KGV2ZW50LmNvbnRhaW5lci5kYXRhLCBldmVudC5wcmV2aW91c0luZGV4LCBldmVudC5jdXJyZW50SW5kZXgpO1xuICAgICAgdGhpcy5fc3RvcmVQb3NpdGlvblNvcnRPcmRlcih0aGlzLl9nZXRTZWN0aW9uQnlQb3NpdGlvbihkYXRhLnBvc2l0aW9uKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRhdGEgPSB0aGlzLl9nZXRFdmVudENvbnRhaW5lckRhdGEoZXZlbnQuY29udGFpbmVyKTtcbiAgICAgIHByZXYgPSB0aGlzLl9nZXRFdmVudENvbnRhaW5lckRhdGEoZXZlbnQucHJldmlvdXNDb250YWluZXIpO1xuICAgICAgaWYgKCtldmVudC5jdXJyZW50SW5kZXggPCArZGF0YS5zdGFydEluZGV4KSBldmVudC5jdXJyZW50SW5kZXggPSArZGF0YS5zdGFydEluZGV4O1xuICAgICAgdHJhbnNmZXJBcnJheUl0ZW0oZXZlbnQucHJldmlvdXNDb250YWluZXIuZGF0YSwgZXZlbnQuY29udGFpbmVyLmRhdGEsIGV2ZW50LnByZXZpb3VzSW5kZXgsIGV2ZW50LmN1cnJlbnRJbmRleCk7XG4gICAgICB0aGlzLl9zdG9yZVBvc2l0aW9uU29ydE9yZGVyKHRoaXMuX2dldFNlY3Rpb25CeVBvc2l0aW9uKHByZXYucG9zaXRpb24pKTtcbiAgICAgIHRoaXMuX3N0b3JlUG9zaXRpb25Tb3J0T3JkZXIodGhpcy5fZ2V0U2VjdGlvbkJ5UG9zaXRpb24oZGF0YS5wb3NpdGlvbikpO1xuICAgIH1cbiAgICBjb25zdCBkcm9wcGVkSXRlbSA9IGV2ZW50Lml0ZW0uZGF0YTtcbiAgICBsZXQgc2VjdGlvbiA9IDxhbnk+ZXZlbnQuY29udGFpbmVyLmRhdGEuZmluZCgoaTogYW55KSA9PiB7XG4gICAgICByZXR1cm4gK2kuaWQgPT09ICtkcm9wcGVkSXRlbS5pZDtcbiAgICB9KTtcbiAgICBpZiAoSXNPYmplY3Qoc2VjdGlvbiwgWydpZCddKSkge1xuICAgICAgc2VjdGlvbiA9IDxFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlPnNlY3Rpb247XG4gICAgICBpZiAoK2RhdGEuaWQgIT09ICtzZWN0aW9uLnNjaGVtZV9pZCkge1xuICAgICAgICBzZWN0aW9uLnNjaGVtZV9pZCA9ICtkYXRhLmlkO1xuICAgICAgICBQb3BSZXF1ZXN0LmRvUGF0Y2goYHByb2ZpbGUtc2NoZW1lcy8ke3NlY3Rpb24uaWR9YCwge3NjaGVtZV9pZDogK2RhdGEuaWR9LCAxLCBmYWxzZSkuc3Vic2NyaWJlKCgpID0+IHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgZnggdXNlZCB0byByZWdpc3RlciB0aGF0IGEgdXNlciBoYXMgY2hlY2sgYW4gYXNzZXQgaW4gdGhlIGFzc2V0IHBvbGwgaW50ZW5kaW5nIHRvIGF0dGFjaCBpdCB0byBhIGNvbHVtbiBpbiB0aGUgc2NoZW1lXG4gICAqIEBwYXJhbSBhc3NldF90eXBlXG4gICAqIEBwYXJhbSBpdGVtSWRcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqL1xuICBvbkFzc2V0QXR0YWNoaW5nKGFzc2V0X3R5cGUsIGl0ZW1JZDogbnVtYmVyLCB2YWx1ZTogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLmFzc2V0LmF0dGFjaGluZ1NldFthc3NldF90eXBlXSkge1xuICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuYXNzZXQuYXR0YWNoaW5nU2V0W2Fzc2V0X3R5cGVdLmFkZCgraXRlbUlkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXNzZXQuYXR0YWNoaW5nU2V0W2Fzc2V0X3R5cGVdLmRlbGV0ZSgraXRlbUlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IGlzIHVzZWQgdG8gYXR0YWNoIGFzc2V0cyB0byBhIGNvbHVtbiBpbiB0aGUgc2NoZW1lXG4gICAqIFRoZSB1c2VyIHdpbGwgc2VsZWN0IHdoaWNoIGFzc2V0cyBmcm9tIGEgcG9vbCBhbmQgdGhlbiBjbGljayBhIGJ1dHRvbiByZXByZXNlbnRpbmcgdGhlIGNvbHVtbiB3aGVyZSB0aGUgYXNzZXRzIHNob3VsZCBiZSBwdXNoZWQgaW50b1xuICAgKiBAcGFyYW0gc2VjdGlvblxuICAgKi9cbiAgb25BdHRhY2hpbmdBc3NldHNUb1Bvc2l0aW9uKHNlY3Rpb246IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UpOiBQcm9taXNlPEVudGl0eVNjaGVtZVNlY3Rpb25Db25maWdbXT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxFbnRpdHlTY2hlbWVTZWN0aW9uQ29uZmlnW10+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBzZWN0aW9uLmlkID0gYXdhaXQgdGhpcy5fcmVzb2x2ZVNlY3Rpb25JZChzZWN0aW9uKTtcbiAgICAgIGlmIChzZWN0aW9uLmlkKSB7XG4gICAgICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5fZ2V0QXNzZXRzVG9BdHRhY2goKTtcbiAgICAgICAgbGV0IGNoaWxkLCBhc3NldDtcbiAgICAgICAgbGV0IGNoaWxkcmVuID0gW107XG4gICAgICAgIGNvbnN0IHJlcXVlc3RzID0gW107XG4gICAgICAgIGlmIChJc09iamVjdChpdGVtcywgdHJ1ZSkpIHtcbiAgICAgICAgICBPYmplY3Qua2V5cyhpdGVtcykubWFwKChhc3NldFR5cGU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoaXRlbXNbYXNzZXRUeXBlXSkubWFwKChpdGVtSWQpID0+IHtcbiAgICAgICAgICAgICAgYXNzZXQgPSB0aGlzLmFzc2V0LmFzc2V0TWFwW2Fzc2V0VHlwZV0uZ2V0KCtpdGVtSWQpO1xuICAgICAgICAgICAgICBjaGlsZCA9IDxFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlPntcbiAgICAgICAgICAgICAgICBpZDogbnVsbCxcbiAgICAgICAgICAgICAgICBuYW1lOiBhc3NldC5uYW1lLFxuICAgICAgICAgICAgICAgIHNjaGVtZV9pZDogK3NlY3Rpb24uaWQsXG4gICAgICAgICAgICAgICAgYXNzZXRfdHlwZTogYXNzZXRUeXBlLFxuICAgICAgICAgICAgICAgIGFzc2V0X2lkOiAraXRlbUlkLFxuICAgICAgICAgICAgICAgIGFzc2V0OiBhc3NldCxcbiAgICAgICAgICAgICAgICBjb21wYWN0OiBhc3NldFR5cGUgPT09ICdjb21wb25lbnQnID8gYXNzZXQuY29tcGFjdCA/IDEgOiAwIDogMSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogc2VjdGlvbi5wb3NpdGlvbixcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgdGhpcy5fc2V0Q2hpbGRBc0F0dGFjaGVkKGNoaWxkKTtcbiAgICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgICAgICAgICAgIHJlcXVlc3RzLnB1c2godGhpcy5fcmVzb2x2ZVNlY3Rpb25JZChjaGlsZCkudGhlbigoaWQpID0+IHtcbiAgICAgICAgICAgICAgICBjaGlsZC5pZCA9IGlkO1xuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmb3JrSm9pbihyZXF1ZXN0cykuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICBjb25zdCB0bXAgPSBJc0FycmF5KHNlY3Rpb24uY2hpbGRyZW4sIHRydWUpID8gc2VjdGlvbi5jaGlsZHJlbiA6IFtdO1xuICAgICAgICAgIHNlY3Rpb24ubWFwcGluZy5zb3J0X29yZGVyID0gW107XG4gICAgICAgICAgY2hpbGRyZW4gPSBbLi4udG1wLCAuLi5jaGlsZHJlbl07XG4gICAgICAgICAgY2hpbGRyZW4ubWFwKCh4LCBpKSA9PiB7XG4gICAgICAgICAgICBpZiAoeC5pZCkgc2VjdGlvbi5tYXBwaW5nLnNvcnRfb3JkZXIucHVzaCh4LmlkKTtcbiAgICAgICAgICAgIHguc29ydF9vcmRlciA9IGk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gdGhpcy5vblRyaWdnZXJVcGRhdGUoKTtcbiAgICAgICAgICB0aGlzLl9yZXNldEFzc2V0QXR0YWNoaW5nRGF0YSgpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKGNoaWxkcmVuKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKG51bGwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBmeCB3aWxsIHRha2UgYW4gYXJyYXkgb2Ygc2VjdGlvbnMgYW4gdXBkYXRlIGFueSBvZiB0aGUgbW9kaWZpZWQgc2VjdGlvbnNcbiAgICogQHBhcmFtIHNlY3Rpb25zXG4gICAqL1xuICBvblVwZGF0ZShzZWN0aW9uczogRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZVtdKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoSXNBcnJheShzZWN0aW9ucywgdHJ1ZSkpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlKHNlY3Rpb25zLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IGlzIHVzZWQgdG8gdHJpZ2dlciBhbiBhcGkgY2FsbCB0byBzYXZlIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBzY2hlbWVcbiAgICogQHBhcmFtIGRlbGF5XG4gICAqL1xuICBvblRyaWdnZXJVcGRhdGUoZGVsYXkgPSA1MDApIHtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCd1cGRhdGUtYXBpJywgKCkgPT4ge1xuICAgICAgLy8gdGhpcy5fdXBkYXRlKCk7XG4gICAgfSwgZGVsYXkpO1xuICB9XG5cblxuICAvKiogICAqIEEgdXNlciBjYW4gY2xpY2sgb24gYW4gZWRpdCBidXR0b24gYW4gZWRpdCB0aGUgY29uZmlnIHNldHRpbmdzIG9mIGFuIGFzc2V0XG5cbiAgICogQHBhcmFtIGFzc2V0XG4gICAqL1xuICBvbkVkaXRBc3NldChhc3NldCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPihhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmRvbS5zdGF0ZS5ibG9ja01vZGFsKSB7XG4gICAgICAgIHRoaXMuZG9tLnN0YXRlLmJsb2NrTW9kYWwgPSB0cnVlO1xuICAgICAgICBsZXQgY29tcG9uZW50VHlwZSA9IG51bGw7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdhc3NldCcsIGFzc2V0KTtcbiAgICAgICAgaWYgKGFzc2V0LmFzc2V0X3R5cGUgPT09ICdmaWVsZCcpIHtcbiAgICAgICAgICBjb21wb25lbnRUeXBlID0gUG9wRW50aXR5U2NoZW1lRmllbGRTZXR0aW5nQ29tcG9uZW50O1xuICAgICAgICB9IGVsc2UgaWYgKGFzc2V0LmFzc2V0X3R5cGUgPT09ICdjb21wb25lbnQnKSB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coJ2hlcmUnKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKGNvbXBvbmVudFR5cGUpIHtcbiAgICAgICAgICBjb25zdCBkaWFsb2dSZWYgPSB0aGlzLnNydi5kaWFsb2cub3BlbihQb3BFbnRpdHlTY2hlbWVGaWVsZFNldHRpbmdDb21wb25lbnQsIHtcbiAgICAgICAgICAgIHdpZHRoOiBgOTAwcHhgLFxuICAgICAgICAgICAgaGVpZ2h0OiBgMTA4MHB4YCxcbiAgICAgICAgICAgIHBhbmVsQ2xhc3M6ICdzdy1tYXItc20nLFxuICAgICAgICAgICAgZGlzYWJsZUNsb3NlOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbGV0IGNvbXBvbmVudCA9IDxhbnk+ZGlhbG9nUmVmLmNvbXBvbmVudEluc3RhbmNlO1xuICAgICAgICAgIGNvbXBvbmVudC5jb3JlID0gdGhpcy5hc3NldC5jb3JlO1xuICAgICAgICAgIGNvbXBvbmVudC5jb25maWcgPSBhc3NldDtcblxuICAgICAgICAgIHRoaXMuZG9tLnNldFN1YnNjcmliZXIoJ2Fzc2V0LW1vZGFsJywgZGlhbG9nUmVmLmJlZm9yZUNsb3NlZCgpLnN1YnNjcmliZSgoc2NoZW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2NoZW1lKSB7XG4gICAgICAgICAgICAgIHRoaXMuaW5pdCh0aGlzLmFzc2V0LmNvcmUsIHRoaXMuYXNzZXQudGFiKTtcbiAgICAgICAgICAgICAgY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRvbS5zdGF0ZS5ibG9ja01vZGFsID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5kb20uc3RhdGUuYmxvY2tNb2RhbCA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUuYmxvY2tNb2RhbCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIGdldEZpZWxkTWFwcGluZyhmaWVsZElkOiBudW1iZXIpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gdGhpcy5hc3NldC5jb3JlLmVudGl0eS5tYXBwaW5nLmZpZWxkO1xuICAgIHJldHVybiBTdG9yYWdlU2V0dGVyKHN0b3JhZ2UsIFtgZmllbGRfJHtmaWVsZElkfWBdKTtcbiAgfVxuXG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgUG9wTG9nLndhcm4odGhpcy5uYW1lLCBgZGVzdHJveWVkOiR7dGhpcy5pZH1gKTtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVuZGVyIFRoZSBIb29kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJpdmF0ZSBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAvKipcbiAgICogVGhlcmUgYSBieSBkZWZhdWx0IDMgY29sdW1ucywgMSwyLDMsIHRoaXMgZnggYWxsb3dzIHRvIGZpbmQgdGhlIHNlY3Rpb24gdGhhdCByZXByZXNlbnQgb25lIG9mIHRob3NlIGNvbHVtbnMgd2l0aFxuICAgKiBAcGFyYW0gcG9zaXRpb24gbnVtYmVyIDEsMiwzXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9nZXRTZWN0aW9uQnlQb3NpdGlvbihwb3NpdGlvbjogbnVtYmVyKTogRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSB7XG4gICAgbGV0IHNlY3Rpb24gPSA8RW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZT57fTtcbiAgICAvLyBjb25zb2xlLmxvZyggJ3Bvc2l0aW9uJywgcG9zaXRpb24gKTtcbiAgICBpZiAoK3Bvc2l0aW9uKSB7XG4gICAgICBjb25zdCBzZWN0aW9uSW5kZXggPSBwb3NpdGlvbiAtIDE7XG4gICAgICAvLyBjb25zb2xlLmxvZyggJ3NlY3Rpb25JbmRleCcsIHNlY3Rpb25JbmRleCwgdGhpcy51aS5zZWN0aW9ucyApO1xuICAgICAgaWYgKHNlY3Rpb25JbmRleCBpbiB0aGlzLnVpLnNlY3Rpb25zKSB7XG4gICAgICAgIHNlY3Rpb24gPSB0aGlzLnVpLnNlY3Rpb25zW3NlY3Rpb25JbmRleF07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzZWN0aW9uO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBmeCBpcyB1c2VkIHRvIG1hcCB0aGUgdGhlIHNvcnRfb3JkZXIgb2YgYWxsIGEgc2VjdGlvbidzIGNoaWxkcmVuXG4gICAqIEBwYXJhbSBzZWN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9zdG9yZVBvc2l0aW9uU29ydE9yZGVyKHNlY3Rpb246IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UpIHtcbiAgICAvLyBjb25zb2xlLmxvZyggJ19zdG9yZVBvc2l0aW9uU29ydE9yZGVyJywgc2VjdGlvbiApO1xuICAgIGlmIChJc09iamVjdChzZWN0aW9uLCBbJ2lkJywgJ2NoaWxkcmVuJ10pKSB7XG4gICAgICBzZWN0aW9uLm1hcHBpbmcuc29ydF9vcmRlciA9IFtdO1xuICAgICAgaWYgKElzQXJyYXkoc2VjdGlvbi5jaGlsZHJlbikpIHtcbiAgICAgICAgc2VjdGlvbi5jaGlsZHJlbi5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coJ2l0ZW0nLCBpdGVtKTtcbiAgICAgICAgICBpZiAoaXRlbS5pZCkgc2VjdGlvbi5tYXBwaW5nLnNvcnRfb3JkZXIucHVzaChpdGVtLmlkKTtcbiAgICAgICAgICBpdGVtLnNvcnRfb3JkZXIgPSBpbmRleDtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHBhdGNoID0ge1xuICAgICAgICAgIG1hcHBpbmc6IHtcbiAgICAgICAgICAgIHNvcnRfb3JkZXI6IHNlY3Rpb24ubWFwcGluZy5zb3J0X29yZGVyXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBQb3BSZXF1ZXN0LmRvUGF0Y2goYHByb2ZpbGUtc2NoZW1lcy8ke3NlY3Rpb24uaWR9YCwgcGF0Y2gsIDEsIGZhbHNlKS5zdWJzY3JpYmUoKCkgPT4gdHJ1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IHdpbGwgZXh0cmFjdCB0aGUgZGF0YSBhdHRyaWJ1dGVzIHN0b3JlZCBvbiBhIGh0bWwgZWxlbWVudFxuICAgKiBAcGFyYW0gY29udGFpbmVyXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9nZXRFdmVudENvbnRhaW5lckRhdGEoY29udGFpbmVyOiBhbnkpOiBEaWN0aW9uYXJ5PGFueT4ge1xuICAgIGNvbnN0IGRhdGEgPSBEZWVwQ29weShTdG9yYWdlR2V0dGVyKGNvbnRhaW5lciwgJ2VsZW1lbnQubmF0aXZlRWxlbWVudC5kYXRhc2V0Jy5zcGxpdCgnLicpLCB7fSkpO1xuICAgIGlmIChJc09iamVjdChkYXRhLCB0cnVlKSkge1xuICAgICAgT2JqZWN0LmtleXMoZGF0YSkubWFwKChrZXkpID0+IHtcbiAgICAgICAgZGF0YVtrZXldID0gUGFyc2VNb2RlbFZhbHVlKGRhdGFba2V5XSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBFbnN1cmUgdGhhdCBhIHNlY3Rpb24gaGFzIGFuIGlkIHRoYXQgaXMgc3RvcmVkIGludCB0aGUgYXBpIGRhdGFiYXNlXG4gICAqIEBwYXJhbSBzZWN0aW9uXG4gICAqL1xuICBwcml2YXRlIF9yZXNvbHZlU2VjdGlvbklkKHNlY3Rpb246IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxudW1iZXI+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoSXNPYmplY3Qoc2VjdGlvbiwgdHJ1ZSkpIHtcbiAgICAgICAgaWYgKCtzZWN0aW9uLmlkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoK3NlY3Rpb24uaWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLl9leHRyYWN0U2VjdGlvbkRhdGEoc2VjdGlvbik7XG4gICAgICAgICAgdGhpcy5kb20uc2V0U3Vic2NyaWJlcihQb3BVaWQoKSwgUG9wUmVxdWVzdC5kb1Bvc3QoYHByb2ZpbGUtc2NoZW1lc2AsIGRhdGEsIDEsIGZhbHNlKS5zdWJzY3JpYmUoKHJlczogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzLmRhdGEpIHJlcyA9IHJlcy5kYXRhO1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoK3Jlcy5pZCk7XG4gICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoMCk7XG4gICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSgwKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBmeCB3aWxsIG1ha2UgdGhlIGFwaSBjYWxsIHRvIHJlbW92ZSBhIHNlY3Rpb24gaW4gdGhlIGFwaSBkYXRhYmFzZVxuICAgKiBAcGFyYW0gc2VjdGlvblxuICAgKi9cbiAgcHJpdmF0ZSBfcmVtb3ZlU2VjdGlvbihzZWN0aW9uOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoSXNPYmplY3Qoc2VjdGlvbiwgWydpZCddKSkge1xuICAgICAgICB0aGlzLmRvbS5zZXRTdWJzY3JpYmVyKFBvcFVpZCgpLCBQb3BSZXF1ZXN0LmRvRGVsZXRlKGBwcm9maWxlLXNjaGVtZXMvJHtzZWN0aW9uLmlkfWAsIHt9LCAxLCBmYWxzZSkuc3Vic2NyaWJlKChyZXM6IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChyZXMuZGF0YSkgcmVzID0gcmVzLmRhdGE7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coICdfcmVtb3ZlU2VjdGlvbicsIHJlcyApO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICB9KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgZnggaXMgdXNlZCB0byBtYWtlIGFwaSBjYWxsIHRvIHRoZSBiYWNrZW5kIHRvIHNhdmUgdGhlIHNjaGVtZVxuICAgKiBAcGFyYW0gc3RvcmVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX3VwZGF0ZShzZWN0aW9uczogRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZVtdLCBzdG9yZSA9IHRydWUpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgIGlmICh0aGlzLmFzc2V0LmNvcmUpIHtcbiAgICAgICAgY29uc3QgbW9kaWZpZWQgPSB0aGlzLl9leHRyYWN0TW9kaWZpZWRTZWN0aW9ucyhzZWN0aW9ucywgW10pO1xuICAgICAgICBpZiAoc3RvcmUgJiYgSXNBcnJheShtb2RpZmllZCwgdHJ1ZSkpIHtcbiAgICAgICAgICBjb25zdCByZXF1ZXN0ID0gW107XG4gICAgICAgICAgbW9kaWZpZWQubWFwKChzZWN0aW9uOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlKSA9PiB7XG4gICAgICAgICAgICBpZiAoK3NlY3Rpb24uaWQpIHtcbiAgICAgICAgICAgICAgcmVxdWVzdC5wdXNoKFBvcFJlcXVlc3QuZG9QYXRjaChgcHJvZmlsZS1zY2hlbWVzLyR7c2VjdGlvbi5pZH1gLCBzZWN0aW9uLCAxLCBmYWxzZSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVxdWVzdC5wdXNoKFBvcFJlcXVlc3QuZG9Qb3N0KGBwcm9maWxlLXNjaGVtZXNgLCBzZWN0aW9uLCAxLCBmYWxzZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGF3YWl0IGZvcmtKb2luKHJlcXVlc3QpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH1cblxuICAgIH0pO1xuXG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IGlzIHVzZWQgdG8gcHVsbCBvdXQgYWxsIHRoZSBzY2hlbWUgc2VjdGlvbnMgdGhhdCBuZWVkIHRvIGJlIHNhdmVkXG4gICAqIEBwYXJhbSBzZWN0aW9uc1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfZXh0cmFjdE1vZGlmaWVkU2VjdGlvbnMoc2VjdGlvbnM6IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2VbXSwgZXh0cmFjdGVkID0gW10pOiBhbnlbXSB7XG4gICAgaWYgKElzQXJyYXkoc2VjdGlvbnMsIHRydWUpKSB7XG4gICAgICBzZWN0aW9ucy5tYXAoKHNlY3Rpb24sIGluZGV4KSA9PiB7XG4gICAgICAgIHNlY3Rpb24uc29ydF9vcmRlciA9IGluZGV4O1xuICAgICAgICBpZiAoc2VjdGlvbi5tb2RpZmllZCkge1xuICAgICAgICAgIGV4dHJhY3RlZC5wdXNoKHRoaXMuX2V4dHJhY3RTZWN0aW9uRGF0YShzZWN0aW9uKSk7XG4gICAgICAgICAgc2VjdGlvbi5tb2RpZmllZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChJc0FycmF5KHNlY3Rpb24uY2hpbGRyZW4sIHRydWUpKSB7XG4gICAgICAgICAgc2VjdGlvbi5jaGlsZHJlbi5tYXAoKGNoaWxkLCBjaGlsZEluZGV4KSA9PiB7XG4gICAgICAgICAgICBjaGlsZC5zb3J0X29yZGVyID0gY2hpbGRJbmRleDtcbiAgICAgICAgICAgIGlmIChjaGlsZC5tb2RpZmllZCkge1xuICAgICAgICAgICAgICBleHRyYWN0ZWQucHVzaCh0aGlzLl9leHRyYWN0U2VjdGlvbkRhdGEoY2hpbGQpKTtcbiAgICAgICAgICAgICAgY2hpbGQubW9kaWZpZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChJc0FycmF5KGNoaWxkLmNoaWxkcmVuLCB0cnVlKSkge1xuICAgICAgICAgICAgICBleHRyYWN0ZWQgPSB0aGlzLl9leHRyYWN0TW9kaWZpZWRTZWN0aW9ucyhjaGlsZC5jaGlsZHJlbiwgZXh0cmFjdGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBleHRyYWN0ZWQ7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IGV4dHJhY3RzIHRoZSBkYXRhIG9mZiBhIHNlY3Rpb24gdGhhdCBzaG91bGQgYmUgc3RvcmUgaW4gdGhlIGFwaSBkYXRhYmFzZVxuICAgKiBAcGFyYW0gc2VjdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfZXh0cmFjdFNlY3Rpb25EYXRhKHNlY3Rpb246IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UpIHtcbiAgICByZXR1cm4gQ2xlYW5PYmplY3Qoe1xuICAgICAgaWQ6IHNlY3Rpb24uaWQsXG4gICAgICBlbnRpdHlfaWQ6IDExMSxcbiAgICAgIG5hbWU6IHNlY3Rpb24ubmFtZSA/IHNlY3Rpb24ubmFtZSA6IG51bGwsXG4gICAgICBhc3NldF90eXBlOiBzZWN0aW9uLmFzc2V0X3R5cGUgPyBzZWN0aW9uLmFzc2V0X3R5cGUgOiBudWxsLFxuICAgICAgYXNzZXRfaWQ6IHNlY3Rpb24uYXNzZXRfdHlwZSA/IHNlY3Rpb24uYXNzZXRfaWQgOiBudWxsLFxuICAgICAgc2NoZW1lX2lkOiBzZWN0aW9uLnNjaGVtZV9pZCA/IHNlY3Rpb24uc2NoZW1lX2lkIDogbnVsbCxcbiAgICAgIG1hcHBpbmc6IElzT2JqZWN0KHNlY3Rpb24ubWFwcGluZykgPyBzZWN0aW9uLm1hcHBpbmcgOiB7Y2hpbGRyZW46IHt9fSxcbiAgICAgIHNvcnRfb3JkZXI6IElzRGVmaW5lZChzZWN0aW9uLnNvcnRfb3JkZXIpID8gc2VjdGlvbi5zb3J0X29yZGVyIDogOTlcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIERldGVybWluZSB3aGF0IGFzc2V0cyBoYXZlIGJlZW4gc2V0IGZyb20gdGhlIGFzc2V0IHBvb2xcbiAgICogVGhpcyBmeCBpcyBjYWxsZWQgd2hlbiBhIHVzZXIgY2xpY2sgb24gYSA8Y29sdW1uIGJ1dHRvbj4gaW50ZW5kaW5nIHRvIGF0dGFjaCBhc3NldHMgaW50byBhIHNwZWNpZmljIGNvbHVtbiBvZiB0aGUgc2NoZW1lXG4gICAqL1xuICBfZ2V0QXNzZXRzVG9BdHRhY2goKTogRGljdGlvbmFyeTxLZXlNYXA8YW55Pj4ge1xuICAgIGNvbnN0IGF0dGFjaGluZyA9IHt9O1xuICAgIE9iamVjdC5rZXlzKHRoaXMuYXNzZXQuYXR0YWNoaW5nU2V0KS5tYXAoKGFzc2V0VHlwZUtleSkgPT4ge1xuICAgICAgdGhpcy5hc3NldC5hdHRhY2hpbmdTZXRbYXNzZXRUeXBlS2V5XS5mb3JFYWNoKChhc3NldElkKSA9PiB7XG4gICAgICAgIGlmICghYXR0YWNoaW5nW2Fzc2V0VHlwZUtleV0pIGF0dGFjaGluZ1thc3NldFR5cGVLZXldID0ge307XG4gICAgICAgIGNvbnN0IGFzc2V0YWJsZSA9IHRoaXMuYXNzZXQuYXNzZXRNYXBbYXNzZXRUeXBlS2V5XS5nZXQoYXNzZXRJZCk7XG4gICAgICAgIGlmIChhc3NldFR5cGVLZXkgPT09ICdjb21wb25lbnQnKSB7XG4gICAgICAgICAgYXR0YWNoaW5nW2Fzc2V0VHlwZUtleV1bYXNzZXRJZF0gPSB7Y29tcGFjdDogYXNzZXRhYmxlLmNvbXBhY3QgPyAxIDogMH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXR0YWNoaW5nW2Fzc2V0VHlwZUtleV1bYXNzZXRJZF0gPSB7Y29tcGFjdDogMX07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBhdHRhY2hpbmc7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgZGVmYXVsdCBjb2x1bW5zIHRodCBleGlzdCBvbiBhbiBlbnRpdHkgdGFibGVcbiAgICogQHBhcmFtIHNlY3Rpb25cbiAgICovXG4gIHByaXZhdGUgX2dldFNlY3Rpb25UYWJsZUZpZWxkc0Fzc2V0cyhzZWN0aW9uKSB7XG4gICAgY29uc3QgdGFibGVBc3NldHMgPSBbXTtcbiAgICBpZiAodGhpcy5hc3NldC5jb3JlKSB7XG4gICAgICBjb25zdCBGaWVsZCA9IFN0b3JhZ2VHZXR0ZXIodGhpcy5hc3NldC5jb3JlLCAncmVwby5tb2RlbC5maWVsZCcuc3BsaXQoJy4nKSk7XG4gICAgICBpZiAoSXNPYmplY3QoRmllbGQsIHRydWUpKSB7XG4gICAgICAgIE9iamVjdC52YWx1ZXMoRmllbGQpLm1hcCgoZmllbGQ6IEZpZWxkSW50ZXJmYWNlKSA9PiB7XG4gICAgICAgICAgaWYgKCFmaWVsZC5hbmNpbGxhcnkgJiYgZmllbGQucG9zaXRpb24gPT09IHNlY3Rpb24ucG9zaXRpb24pIHtcbiAgICAgICAgICAgIHRhYmxlQXNzZXRzLnB1c2gobmV3IEVudGl0eVNjaGVtZVNlY3Rpb25Db25maWcoe1xuICAgICAgICAgICAgICBpZDogMCxcbiAgICAgICAgICAgICAgbmFtZTogZmllbGQubW9kZWwubGFiZWwsXG4gICAgICAgICAgICAgIGFzc2V0X3R5cGU6ICd0YWJsZScsXG4gICAgICAgICAgICAgIGFzc2V0X2lkOiAwLFxuICAgICAgICAgICAgICBhc3NldDogZmllbGQsXG4gICAgICAgICAgICAgIHNjaGVtZV9pZDogK3NlY3Rpb24uaWQsXG4gICAgICAgICAgICAgIHNvcnRfb3JkZXI6IGZpZWxkLnNvcnQsXG4gICAgICAgICAgICAgIHBvc2l0aW9uOiBzZWN0aW9uLnBvc2l0aW9uLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VjdGlvbi5zdGFydEluZGV4ID0gdGFibGVBc3NldHMubGVuZ3RoO1xuICAgIHJldHVybiB0YWJsZUFzc2V0cy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICBpZiAoYS5zb3J0IDwgYi5zb3J0KSByZXR1cm4gLTE7XG4gICAgICBpZiAoYS5zb3J0ID4gYi5zb3J0KSByZXR1cm4gMTtcbiAgICAgIHJldHVybiAwO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogQ29udmVydCBjaGlsZCBzZWN0aW9ucyB0byB0aGUgZXhwZWN0ZWQgc3RydWN0dXJlXG4gICAqIEBwYXJhbSBjaGlsZFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfdHJhbnNmb3JtU2VjdGlvbihzZWN0aW9uOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlLCBpbmRleDogbnVtYmVyKTogRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSB7XG4gICAgc2VjdGlvbiA9IDxFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlPkNsZWFuT2JqZWN0KHNlY3Rpb24sIHtibGFja2xpc3Q6IFsnZmxhdHRlbmVkJ119KTsgLy8gZmlyc3QgbGV2ZWwgYXJlIG9ubHkgY29udGFpbmVyc1xuICAgIHNlY3Rpb24uY29udGFpbmVyID0gdHJ1ZTtcbiAgICBzZWN0aW9uLnBvc2l0aW9uID0gaW5kZXggKyAxO1xuICAgIHNlY3Rpb24uZmxleCA9IDE7XG4gICAgc2VjdGlvbi5zb3J0X29yZGVyID0gaW5kZXg7XG4gICAgaWYgKCEoSXNPYmplY3Qoc2VjdGlvbi5tYXBwaW5nKSkpIHNlY3Rpb24ubWFwcGluZyA9IHt9O1xuICAgIGlmICghKElzQXJyYXkoc2VjdGlvbi5tYXBwaW5nLnNvcnRfb3JkZXIpKSkgc2VjdGlvbi5tYXBwaW5nLnNvcnRfb3JkZXIgPSBbXTtcbiAgICBpZiAoIShJc0FycmF5KHNlY3Rpb24uY2hpbGRyZW4pKSkgc2VjdGlvbi5jaGlsZHJlbiA9IFtdO1xuICAgIHNlY3Rpb24uY2hpbGRyZW4gPSBzZWN0aW9uLmNoaWxkcmVuLmZpbHRlcigoY2hpbGQ6IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UpID0+IHsgLy8gc3ViIGxldmVsIG1heWJlIGFuIGFjdHVhbCBhc3NldCBvciBhIGNvbnRhaW5lclxuICAgICAgaWYgKFN0cmluZyhTdHJpbmcoY2hpbGQuYXNzZXRfdHlwZSkudG9Mb3dlckNhc2UoKSkuaW5jbHVkZXMoJ2ZpZWxkJykpIHtcbiAgICAgICAgY2hpbGQuYXNzZXRfdHlwZSA9ICdmaWVsZCc7XG4gICAgICB9ZWxzZSBpZiAoU3RyaW5nKFN0cmluZyhjaGlsZC5hc3NldF90eXBlKS50b0xvd2VyQ2FzZSgpKS5pbmNsdWRlcygnY29tcG9uZW50JykpIHtcbiAgICAgICAgY2hpbGQuYXNzZXRfdHlwZSA9ICdjb21wb25lbnQnO1xuICAgICAgfSBlbHNlICBpZiAoU3RyaW5nKFN0cmluZyhjaGlsZC5hc3NldF90eXBlKS50b0xvd2VyQ2FzZSgpKS5pbmNsdWRlcygnd2lkZ2V0JykpIHtcbiAgICAgICAgY2hpbGQuYXNzZXRfdHlwZSA9ICd3aWRnZXQnO1xuICAgICAgfVxuICAgICAgLy8gY29uc29sZS5sb2coJ3R5cGUnLCBjaGlsZC5hc3NldF90eXBlKTtcbiAgICAgIGlmIChjaGlsZC5hc3NldF90eXBlICYmIGNoaWxkLmFzc2V0X3R5cGUgIT0gJ3RhYmxlJykge1xuICAgICAgICBpZiAoK2NoaWxkLmFzc2V0X2lkKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYXNzZXQuYXNzZXRNYXBbY2hpbGQuYXNzZXRfdHlwZV0uaGFzKGNoaWxkLmFzc2V0X2lkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2hpbGQuYXNzZXRfdHlwZSAhPSAndGFibGUnO1xuICAgIH0pO1xuXG4gICAgc2VjdGlvbi5jaGlsZHJlbi5tYXAoKGNoaWxkOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlKSA9PiB7XG4gICAgICBjaGlsZCA9IHRoaXMuX3RyYW5zZm9ybUNoaWxkKGNoaWxkKTtcbiAgICAgIGNoaWxkLnNvcnRfb3JkZXIgPSBzZWN0aW9uLm1hcHBpbmcuc29ydF9vcmRlci5pbmNsdWRlcyhjaGlsZC5pZCkgPyArc2VjdGlvbi5tYXBwaW5nLnNvcnRfb3JkZXIuaW5kZXhPZihjaGlsZC5pZCkgOiA5OTtcbiAgICAgIGlmIChJc09iamVjdChjaGlsZC5hc3NldCwgdHJ1ZSkpIHtcbiAgICAgICAgaWYgKElzU3RyaW5nKGNoaWxkLmFzc2V0X3R5cGUsIHRydWUpKSB7XG4gICAgICAgICAgY2hpbGQuY29tcGFjdCA9IDxib29sZWFuPihJc09iamVjdChjaGlsZC5hc3NldCwgWydjb21wYWN0J10pICYmIElzRGVmaW5lZChjaGlsZC5hc3NldC5jb21wYWN0KSA/IGNoaWxkLmFzc2V0LmNvbXBhY3QgOiBmYWxzZSk7XG4gICAgICAgICAgdGhpcy5fZW5zdXJlQXNzZXRUeXBlQ29udGFpbmVycyhjaGlsZC5hc3NldF90eXBlKTtcbiAgICAgICAgICB0aGlzLnVpLmF0dGFjaGVkTWFwW2NoaWxkLmFzc2V0X3R5cGVdLnNldCgrY2hpbGQuYXNzZXRfaWQsIHNlY3Rpb24ucG9zaXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3RyYW5zZm9ybVNlY3Rpb24oY2hpbGQsIGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2VjdGlvbi5jaGlsZHJlbi5zb3J0KER5bmFtaWNTb3J0KCdzb3J0X29yZGVyJykpO1xuXG5cbiAgICByZXR1cm4gc2VjdGlvbjtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENvbnZlcnQgY2hpbGQgb2YgYSBzZWN0aW9uIHRvIHRoZSBleHBlY3RlZCBzdHJ1Y3R1cmVcbiAgICogQHBhcmFtIGNoaWxkXG4gICAqL1xuXG4gIHByaXZhdGUgX3RyYW5zZm9ybUNoaWxkKGNoaWxkOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlKTogRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSB7XG4gICAgY2hpbGQgPSA8RW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZT5DbGVhbk9iamVjdChjaGlsZCk7XG4gICAgaWYgKCEoSXNPYmplY3QoY2hpbGQubWFwcGluZykpKSBjaGlsZC5tYXBwaW5nID0ge307XG4gICAgaWYgKElzRGVmaW5lZChjaGlsZC5hc3NldF9pZCkgJiYgK2NoaWxkLmFzc2V0X2lkKSB7XG4gICAgICBkZWxldGUgY2hpbGQuY2hpbGRyZW47XG4gICAgICBpZiAoU3RyaW5nKFN0cmluZyhjaGlsZC5hc3NldF90eXBlKS50b0xvd2VyQ2FzZSgpKS5pbmNsdWRlcygnZmllbGQnKSkgY2hpbGQuYXNzZXRfdHlwZSA9ICdmaWVsZCc7XG4gICAgICBpZiAoY2hpbGQuYXNzZXRfdHlwZSA9PT0gJ2ZpZWxkJyAmJiB0aGlzLmFzc2V0LmFzc2V0TWFwLmZpZWxkLmhhcyhjaGlsZC5hc3NldF9pZCkpIHtcbiAgICAgICAgY2hpbGQuYXNzZXQgPSB0aGlzLmFzc2V0LmFzc2V0TWFwLmZpZWxkLmdldChjaGlsZC5hc3NldF9pZCk7XG4gICAgICAgIGNoaWxkLm5hbWUgPSBjaGlsZC5hc3NldC5uYW1lO1xuICAgICAgICBjaGlsZC5jb21wYWN0ID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoY2hpbGQuYXNzZXRfdHlwZSA9PT0gJ2NvbXBvbmVudCcgJiYgdGhpcy5hc3NldC5hc3NldE1hcC5jb21wb25lbnQuaGFzKGNoaWxkLmFzc2V0X2lkKSkge1xuICAgICAgICBjaGlsZC5hc3NldF90eXBlID0gJ2NvbXBvbmVudCc7XG4gICAgICAgIGNoaWxkLmFzc2V0ID0gdGhpcy5hc3NldC5hc3NldE1hcC5jb21wb25lbnQuZ2V0KGNoaWxkLmFzc2V0X2lkKTtcbiAgICAgICAgY2hpbGQubmFtZSA9IGNoaWxkLmFzc2V0Lm5hbWU7XG4gICAgICB9XG4gICAgICBjaGlsZC5jb250YWluZXIgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hpbGQuY29udGFpbmVyID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGNoaWxkO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBmeCBpcyB1c2VkIGVuc3VyZXMgdGhhdCBhbiBhc3NldCB0eXBlIGhhcyB0aGUgYWxsIGFuY2lsbGFyeSBhc3NldHMgbmVlZGVkXG4gICAqIEBwYXJhbSBhc3NldFR5cGVcbiAgICovXG4gIHByaXZhdGUgX2Vuc3VyZUFzc2V0VHlwZUNvbnRhaW5lcnMoYXNzZXRUeXBlOiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMuYXNzZXQuYXR0YWNoaW5nU2V0W2Fzc2V0VHlwZV0pIHRoaXMuYXNzZXQuYXR0YWNoaW5nU2V0W2Fzc2V0VHlwZV0gPSBuZXcgU2V0KCk7XG4gICAgaWYgKCF0aGlzLmFzc2V0LmFzc2V0TWFwW2Fzc2V0VHlwZV0pIHRoaXMuYXNzZXQuYXNzZXRNYXBbYXNzZXRUeXBlXSA9IG5ldyBNYXAoKTtcbiAgICBpZiAoIXRoaXMudWkuYXR0YWNoZWRNYXBbYXNzZXRUeXBlXSkgdGhpcy51aS5hdHRhY2hlZE1hcFthc3NldFR5cGVdID0gbmV3IE1hcCgpO1xuICAgIGlmICghdGhpcy51aS5hc3NpZ25hYmxlQ29uZmlnc1thc3NldFR5cGVdKSB0aGlzLnVpLmFzc2lnbmFibGVDb25maWdzW2Fzc2V0VHlwZV0gPSB7fTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENsZWFyIG91dCBhbGwgdGhlIGF0dGFjaGluZyBzZXQgZGF0YVxuICAgKi9cbiAgcHJpdmF0ZSBfcmVzZXRBc3NldEF0dGFjaGluZ0RhdGEoKSB7XG4gICAgT2JqZWN0LmtleXModGhpcy5hc3NldC5hdHRhY2hpbmdTZXQpLm1hcCgoa2V5KSA9PiB7XG4gICAgICB0aGlzLmFzc2V0LmF0dGFjaGluZ1NldFtrZXldLmNsZWFyKCk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZWZyZXNoIHRoZSBjb3JlIGVudGl0eVxuICAgKiBAcGFyYW0gZG9tXG4gICAqL1xuICBwcml2YXRlIF9yZWZyZXNoRW50aXR5KGRvbTogUG9wRG9tU2VydmljZSA9IG51bGwpIHtcbiAgICB0aGlzLmFzc2V0LmNvcmUuY2hhbm5lbC5lbWl0KHtcbiAgICAgIHNvdXJjZTogdGhpcy5uYW1lLFxuICAgICAgdGFyZ2V0OiAnUG9wRW50aXR5VGFiQ29tcG9uZW50JyxcbiAgICAgIHR5cGU6ICdjb21wb25lbnQnLFxuICAgICAgbmFtZTogJ3N0YXJ0LXJlZnJlc2gnXG4gICAgfSk7XG4gICAgdGhpcy5zcnYudGFiLnJlZnJlc2hFbnRpdHkobnVsbCwgZG9tLCB7fSwgYCR7dGhpcy5uYW1lfTp2aWV3RW50aXR5UG9ydGFsYCkudGhlbigocmVzKSA9PiB7XG4gICAgICB0aGlzLmluaXQodGhpcy5hc3NldC5jb3JlLCB0aGlzLmFzc2V0LnRhYik7XG4gICAgICB0aGlzLmRvbS5zdGF0ZS5ibG9ja01vZGFsID0gZmFsc2U7XG4gICAgICB0aGlzLmFzc2V0LmNvcmUuY2hhbm5lbC5lbWl0KHtcbiAgICAgICAgc291cmNlOiB0aGlzLm5hbWUsXG4gICAgICAgIHRhcmdldDogJ1BvcEVudGl0eVRhYkNvbXBvbmVudCcsXG4gICAgICAgIHR5cGU6ICdjb21wb25lbnQnLFxuICAgICAgICBuYW1lOiAnc3RvcC1yZWZyZXNoJ1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IGlzIHVzZWQgdG8gbWFyayBhbiBhc3NldCBpbiB0aGUgYXNzZXQgcG9vbCBhcyBhdHRhY2hhYmxlXG4gICAqIEBwYXJhbSBhc3NldFxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0Q2hpbGRBc0F0dGFjaGFibGUoY2hpbGQ6IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UpIHtcbiAgICBpZiAoIWNoaWxkLmNvbnRhaW5lcikge1xuICAgICAgdGhpcy51aS5hdHRhY2hlZE1hcFtjaGlsZC5hc3NldF90eXBlXS5kZWxldGUoY2hpbGQuYXNzZXRfaWQpO1xuICAgICAgdGhpcy51aS5hc3NpZ25hYmxlQ29uZmlnc1tjaGlsZC5hc3NldF90eXBlXVtjaGlsZC5hc3NldF9pZF0uY29udHJvbC5zZXRWYWx1ZSgwKTtcbiAgICAgIHRoaXMudWkuYXNzaWduYWJsZUNvbmZpZ3NbY2hpbGQuYXNzZXRfdHlwZV1bY2hpbGQuYXNzZXRfaWRdLmNvbnRyb2wuZW5hYmxlKCk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBmeCBpcyB1c2VkIHRvIG1hcmsgYW4gYXNzZXQgaW4gYXMgYXR0YWNoZWQsIHNldHRpbmcgaXQgdXAgdG8gYmUgdHJhbnNmZXJyZWQgdG8gYSBjb2x1bW4gaW4gdGhlIHNjaGVtZVxuICAgKiBAcGFyYW0gYXNzZXRcbiAgICovXG4gIHByaXZhdGUgX3NldENoaWxkQXNBdHRhY2hlZChjaGlsZDogRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSwgcG9zaXRpb246IG51bWJlciA9IDEpIHtcbiAgICBpZiAoIWNoaWxkLmNvbnRhaW5lcikge1xuICAgICAgdGhpcy51aS5hdHRhY2hlZE1hcFtjaGlsZC5hc3NldF90eXBlXS5zZXQoY2hpbGQuYXNzZXRfaWQsIHBvc2l0aW9uKTtcbiAgICAgIHRoaXMudWkuYXNzaWduYWJsZUNvbmZpZ3NbY2hpbGQuYXNzZXRfdHlwZV1bY2hpbGQuYXNzZXRfaWRdLmNvbnRyb2wuc2V0VmFsdWUoMSk7XG4gICAgICB0aGlzLnVpLmFzc2lnbmFibGVDb25maWdzW2NoaWxkLmFzc2V0X3R5cGVdW2NoaWxkLmFzc2V0X2lkXS5jb250cm9sLmRpc2FibGUoKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IGlzIHVzZWQgdG8gcHVsbCBvdXQgYWxsIHRoZSBzY2hlbWUgc2VjdGlvbnMgdGhhdCBuZWVkIHRvIGJlIHNhdmVkXG4gICAqIEBwYXJhbSBzZWN0aW9uc1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfY2hlY2tGb3JUcmFpdHMoY29yZTogQ29yZUNvbmZpZywgc2VjdGlvbnM6IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2VbXSwgcHJpbWFyeUlkcyA9IFtdKTogYW55W10ge1xuICAgIGlmIChJc0FycmF5KHNlY3Rpb25zLCB0cnVlKSkge1xuICAgICAgc2VjdGlvbnMubWFwKChzZWN0aW9uKSA9PiB7XG4gICAgICAgIGlmIChJc0FycmF5KHNlY3Rpb24uY2hpbGRyZW4sIHRydWUpKSB7XG4gICAgICAgICAgc2VjdGlvbi5jaGlsZHJlbi5tYXAoKGNoaWxkKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2hpbGQuYXNzZXRfdHlwZSA9PT0gJ2ZpZWxkJykge1xuICAgICAgICAgICAgICBjaGlsZC5hc3NldC5yZXF1aXJlZCA9IElzQXJyYXkoY29yZS5lbnRpdHkubWFwcGluZy5yZXF1aXJlZCkgPyBjb3JlLmVudGl0eS5tYXBwaW5nLnJlcXVpcmVkLmluY2x1ZGVzKGNoaWxkLmFzc2V0X2lkKSA6IGZhbHNlO1xuICAgICAgICAgICAgICBpZiAocHJpbWFyeUlkcy5pbmNsdWRlcyhjaGlsZC5hc3NldF9pZCkpIHtcbiAgICAgICAgICAgICAgICBwcmltYXJ5SWRzLnNwbGljZShwcmltYXJ5SWRzLmluZGV4T2YoY2hpbGQuYXNzZXRfaWQpLCAxKTtcbiAgICAgICAgICAgICAgICBjaGlsZC5hc3NldC5wcmltYXJ5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjaGlsZC5hc3NldC5wcmltYXJ5ID0gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChJc0FycmF5KGNoaWxkLmNoaWxkcmVuLCB0cnVlKSkge1xuICAgICAgICAgICAgICB0aGlzLl9jaGVja0ZvclRyYWl0cyhjb3JlLCBjaGlsZC5jaGlsZHJlbiwgcHJpbWFyeUlkcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcHJpbWFyeUlkcztcbiAgfVxufVxuIl19