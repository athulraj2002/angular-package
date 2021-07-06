import {Injectable, OnDestroy} from '@angular/core';
import {CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {MatDialog} from '@angular/material/dialog';

import {PopDomService} from '../../../services/pop-dom.service';
import {PopTabMenuService} from '../../base/pop-tab-menu/pop-tab-menu.service';
import {TabConfig} from '../../base/pop-tab-menu/tab-menu.model';
import {CheckboxConfig} from '../../base/pop-field-item/pop-checkbox/checkbox-config.model';

import {PopExtendService} from '../../../services/pop-extend.service';
import {
  CoreConfig,
  Dictionary,
  FieldInterface,
  KeyMap,
  PopBusiness,
  PopLog,
  PopRequest,
  ServiceInjector
} from '../../../pop-common.model';
import {
  ArrayKeyBy, ArrayOnlyUnique,
  CleanObject,
  DeepCopy,
  DynamicSort,
  IsArray, IsArrayThrowError,
  IsDefined,
  IsObject,
  IsObjectThrowError,
  IsString, JsonCopy,
  PopUid,
  StorageGetter, StorageSetter
} from '../../../pop-common-utility';
import {EntitySchemeSectionConfig, EntitySchemeSectionInterface} from './pop-entity-scheme.model';
import {forkJoin, Subject} from 'rxjs';
import {ParseModelValue} from '../pop-entity-utility';
import {PopEntitySchemeFieldSettingComponent} from './pop-entity-scheme-field-setting/pop-entity-scheme-field-setting.component';
import {PopEntityActionService} from '../services/pop-entity-action.service';


@Injectable({
  providedIn: 'root'
})
export class PopEntitySchemeService extends PopExtendService implements OnDestroy {
  public name = 'PopEntitySchemeService';

  protected srv: {
    action: PopEntityActionService,
    dialog: MatDialog,
    tab: PopTabMenuService,
  };

  public ui = {
    refresh: new Subject<string>(),
    attachedMap: {}, // the map of assets that are already attached to a section of the scheme
    assetPool: <Dictionary<any>>{},
    assignableConfigs: {}, // a collection map of checkbox configs that are used to move an asset into the attaching state
    primary: <Dictionary<number>>{},
    primaryIds: <number[]>[],
    sections_keys: [],
    sections: <any[]>undefined
  };

  protected asset = {
    attachingSet: {}, // the map of assets that are in a state of being attached
    assetMap: {
      field: <Map<number, FieldInterface>>new Map<number, FieldInterface>(),
      component: <Map<number, any>>new Map<number, any>(),
    },// the actually DataObject that an asset represents
    core: <CoreConfig>undefined,
    tab: <TabConfig>undefined,
  };


  private _setServiceContainer() {
    this.srv = {
      action: ServiceInjector.get(PopEntityActionService),
      dialog: ServiceInjector.get(MatDialog),
      tab: this.tabRepo
    };
    delete this.tabRepo;
  }


  constructor( // This service is unique to every component, provided in the PopEntityTabComponent
    private tabRepo: PopTabMenuService,
  ) {
    super();
    this._setServiceContainer();
    PopLog.init(this.name, `created:${this.id}`);
  }


  /**
   * This fx takes the initial data and configures it to the expected structure and sets up all the ancillary assets needed
   * @param core
   * @param tab
   */
  init(core: CoreConfig, tab: TabConfig): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      this.asset.core = IsObjectThrowError(core, true, `${this.name}:core`) ? <CoreConfig>core : null;
      this.asset.tab = IsObjectThrowError(tab, true, `${this.name}:init: - tab`) ? <TabConfig>tab : <TabConfig>{};
      // this.asset.attach = { fields: {}, components: {} };
      // let value;

      this.ui.sections_keys = [];

      if (!(IsObject(core.entity.mapping))) {
        core.entity.mapping = <Dictionary<any>>{};
      }
      if (!(IsObject(core.entity.mapping.field))) {
        core.entity.mapping.field = <Dictionary<any>>{};
      }
      if (!(IsObject(core.entity.mapping.primary))) {
        core.entity.mapping.primary = <Dictionary<boolean>>{};
      }
      if (!(IsArray(core.entity.mapping.required))) {
        core.entity.mapping.required = [];
      } else {
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

      if (!(IsArray(this.ui.sections, true))) this.ui.sections = defaultSections;


      const remainingFlex = 4 - this.ui.sections.length;
      this.ui.sections.map((section, index) => {
        section = this._transformSection(section, index);
        // const tableAssets = this._getSectionTableFieldsAssets( section );
        // section.children = [ ...tableAssets, ...section.children ];
        section.predicate = (item: CdkDrag<number>) => {
          const data = <any>item.data;
          return data.compact;
        };
        this.ui.sections_keys.push(section.position);
      });
      if (this.ui.sections && this.ui.sections.length > 1) {
        const lastSection = this.ui.sections[this.ui.sections.length - 1];
        lastSection.predicate = (item: CdkDrag<number>) => {
          return true;
        };
        if (remainingFlex) lastSection.flex += remainingFlex;
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
        requests.push(this._resolveSectionId(section).then((id: number) => {
          section.id = id;
        }));
      });
      await forkJoin(requests);
      let primaryIds = JsonCopy(this.ui.primaryIds);
      this.ui.sections.sort(DynamicSort('sort_order'));
      primaryIds = this._checkForTraits(core, this.ui.sections, primaryIds);
      if (IsArray(this.ui.sections, true) && primaryIds.length) {
        primaryIds.map((fieldId: number) => {
          this.onAssetAttaching('field', +fieldId, true);
        });
        this.ui.sections[0].children = await this.onAttachingAssetsToPosition(this.ui.sections[0]);
      }
      return resolve(true);
    });

  }


  /**
   * This fx is used to remove an asset/child from the scheme
   * @param position
   * @param asset
   */
  onRemoveChildFromLayout(position: number, child: EntitySchemeSectionInterface): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      const positionIndex = position - 1;
      if (this.asset.core.entity.children[positionIndex]) {
        const container = this.ui.sections[positionIndex];
        if (child && typeof child.sort_order === 'number') {
          this.srv.tab.showAsLoading(true);
          await this._removeSection(child);
          container.children = container.children.filter((section: EntitySchemeSectionInterface) => {
            return section.id !== child.id;
          });
          // transferArrayItem( container.children, [], child.sort_order, 0 );
          container.mapping.sort_order = [];
          container.children.map((item, index) => {
            if (item.id) container.mapping.sort_order.push(item.id);
            item.sort_order = index;
          });
          this._setChildAsAttachable(child);
          this.srv.tab.showAsLoading(false);
          // this.onTriggerUpdate(1000);
          return resolve(true);
        }
      } else {
        return resolve(true);
      }

    });
  }


  /**
   * A user can dragSort aassets from one column to another in the scheme layout
   * @param event
   */
  onAssetSortDrop(event: CdkDragDrop<string[]>) {
    // console.log( 'onAssetSortDrop', event );
    let data;
    let prev;
    if (event.previousContainer === event.container) {
      data = this._getEventContainerData(event.container);
      if (+event.currentIndex < +data.startIndex) event.currentIndex = +data.startIndex;
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this._storePositionSortOrder(this._getSectionByPosition(data.position));
    } else {
      data = this._getEventContainerData(event.container);
      prev = this._getEventContainerData(event.previousContainer);
      if (+event.currentIndex < +data.startIndex) event.currentIndex = +data.startIndex;
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      this._storePositionSortOrder(this._getSectionByPosition(prev.position));
      this._storePositionSortOrder(this._getSectionByPosition(data.position));
    }
    const droppedItem = event.item.data;
    let section = <any>event.container.data.find((i: any) => {
      return +i.id === +droppedItem.id;
    });
    if (IsObject(section, ['id'])) {
      section = <EntitySchemeSectionInterface>section;
      if (+data.id !== +section.scheme_id) {
        section.scheme_id = +data.id;
        PopRequest.doPatch(`profile-schemes/${section.id}`, {scheme_id: +data.id}, 1, false).subscribe(() => true);
      }
    }
  }


  /**
   * This fx used to register that a user has check an asset in the asset poll intending to attach it to a column in the scheme
   * @param asset_type
   * @param itemId
   * @param value
   */
  onAssetAttaching(asset_type, itemId: number, value: boolean) {
    if (this.asset.attachingSet[asset_type]) {
      if (value) {
        this.asset.attachingSet[asset_type].add(+itemId);
      } else {
        this.asset.attachingSet[asset_type].delete(+itemId);
      }
    }
  }


  /**
   * This fx is used to attach assets to a column in the scheme
   * The user will select which assets from a pool and then click a button representing the column where the assets should be pushed into
   * @param section
   */
  onAttachingAssetsToPosition(section: EntitySchemeSectionInterface): Promise<EntitySchemeSectionConfig[]> {
    return new Promise<EntitySchemeSectionConfig[]>(async (resolve) => {
      section.id = await this._resolveSectionId(section);
      if (section.id) {
        const items = this._getAssetsToAttach();
        let child, asset;
        let children = [];
        const requests = [];
        if (IsObject(items, true)) {
          Object.keys(items).map((assetType: string) => {
            Object.keys(items[assetType]).map((itemId) => {
              asset = this.asset.assetMap[assetType].get(+itemId);
              child = <EntitySchemeSectionInterface>{
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
            if (x.id) section.mapping.sort_order.push(x.id);
            x.sort_order = i;
          });
          // this.onTriggerUpdate();
          this._resetAssetAttachingData();
          return resolve(children);
        });

      } else {
        return resolve(null);
      }
    });
  }


  /**
   * This fx will take an array of sections an update any of the modified sections
   * @param sections
   */
  onUpdate(sections: EntitySchemeSectionInterface[]): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      if (IsArray(sections, true)) {
        await this._update(sections, true);
        return resolve(true);
      } else {
        return resolve(false);
      }
    });
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
  onEditAsset(asset): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      if (!this.dom.state.blockModal) {
        this.dom.state.blockModal = true;
        let componentType = null;
        // console.log('asset', asset);
        if (asset.asset_type === 'field') {
          componentType = PopEntitySchemeFieldSettingComponent;
        } else if (asset.asset_type === 'component') {
          // console.log('here');
        }


        if (componentType) {
          const dialogRef = this.srv.dialog.open(PopEntitySchemeFieldSettingComponent, {
            width: `900px`,
            height: `1080px`,
            panelClass: 'sw-mar-sm',
            disableClose: true
          });
          let component = <any>dialogRef.componentInstance;
          component.core = this.asset.core;
          component.config = asset;

          this.dom.setSubscriber('asset-modal', dialogRef.beforeClosed().subscribe((scheme) => {
            if (scheme) {
              this.init(this.asset.core, this.asset.tab);
              component = null;
            } else {
              component = null;
            }
            this.dom.state.blockModal = false;
            return resolve(true);
          }));
        } else {
          this.dom.state.blockModal = false;
          return resolve(false);
        }
      } else {
        this.dom.state.blockModal = false;
        return resolve(false);
      }
    });
  }


  getFieldMapping(fieldId: number) {
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
  private _getSectionByPosition(position: number): EntitySchemeSectionInterface {
    let section = <EntitySchemeSectionInterface>{};
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
  private _storePositionSortOrder(section: EntitySchemeSectionInterface) {
    // console.log( '_storePositionSortOrder', section );
    if (IsObject(section, ['id', 'children'])) {
      section.mapping.sort_order = [];
      if (IsArray(section.children)) {
        section.children.map((item, index) => {
          // console.log('item', item);
          if (item.id) section.mapping.sort_order.push(item.id);
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
  private _getEventContainerData(container: any): Dictionary<any> {
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
  private _resolveSectionId(section: EntitySchemeSectionInterface): Promise<number> {
    return new Promise<number>(async (resolve) => {
      if (IsObject(section, true)) {
        if (+section.id) {
          return resolve(+section.id);
        } else {
          const data = this._extractSectionData(section);
          this.dom.setSubscriber(PopUid(), PopRequest.doPost(`profile-schemes`, data, 1, false).subscribe((res: any) => {
            if (res.data) res = res.data;
            return resolve(+res.id);
          }, () => {
            return resolve(0);
          }));
        }
      } else {
        return resolve(0);
      }
    });

  }


  /**
   * This fx will make the api call to remove a section in the api database
   * @param section
   */
  private _removeSection(section: EntitySchemeSectionInterface): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      if (IsObject(section, ['id'])) {
        this.dom.setSubscriber(PopUid(), PopRequest.doDelete(`profile-schemes/${section.id}`, {}, 1, false).subscribe((res: any) => {
          if (res.data) res = res.data;
          // console.log( '_removeSection', res );
          return resolve(true);
        }, () => {
          return resolve(false);
        }));
      } else {
        return resolve(true);
      }
    });
  }


  /**
   * This fx is used to make api call to the backend to save the scheme
   * @param store
   * @private
   */
  private _update(sections: EntitySchemeSectionInterface[], store = true): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      if (this.asset.core) {
        const modified = this._extractModifiedSections(sections, []);
        if (store && IsArray(modified, true)) {
          const request = [];
          modified.map((section: EntitySchemeSectionInterface) => {
            if (+section.id) {
              request.push(PopRequest.doPatch(`profile-schemes/${section.id}`, section, 1, false));
            } else {
              request.push(PopRequest.doPost(`profile-schemes`, section, 1, false));
            }
          });
          await forkJoin(request);
          return resolve(true);
        }
      } else {
        return resolve(true);
      }

    });

  }


  /**
   * This fx is used to pull out all the scheme sections that need to be saved
   * @param sections
   * @private
   */
  private _extractModifiedSections(sections: EntitySchemeSectionInterface[], extracted = []): any[] {
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
  private _extractSectionData(section: EntitySchemeSectionInterface) {
    return CleanObject({
      id: section.id,
      entity_id: 111,
      name: section.name ? section.name : null,
      asset_type: section.asset_type ? section.asset_type : null,
      asset_id: section.asset_type ? section.asset_id : null,
      scheme_id: section.scheme_id ? section.scheme_id : null,
      mapping: IsObject(section.mapping) ? section.mapping : {children: {}},
      sort_order: IsDefined(section.sort_order) ? section.sort_order : 99
    });
  }


  /**
   * Determine what assets have been set from the asset pool
   * This fx is called when a user click on a <column button> intending to attach assets into a specific column of the scheme
   */
  _getAssetsToAttach(): Dictionary<KeyMap<any>> {
    const attaching = {};
    Object.keys(this.asset.attachingSet).map((assetTypeKey) => {
      this.asset.attachingSet[assetTypeKey].forEach((assetId) => {
        if (!attaching[assetTypeKey]) attaching[assetTypeKey] = {};
        const assetable = this.asset.assetMap[assetTypeKey].get(assetId);
        if (assetTypeKey === 'component') {
          attaching[assetTypeKey][assetId] = {compact: assetable.compact ? 1 : 0};
        } else {
          attaching[assetTypeKey][assetId] = {compact: 1};
        }
      });
    });
    return attaching;
  }


  /**
   * Retrieve the default columns tht exist on an entity table
   * @param section
   */
  private _getSectionTableFieldsAssets(section) {
    const tableAssets = [];
    if (this.asset.core) {
      const Field = StorageGetter(this.asset.core, 'repo.model.field'.split('.'));
      if (IsObject(Field, true)) {
        Object.values(Field).map((field: FieldInterface) => {
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
      if (a.sort < b.sort) return -1;
      if (a.sort > b.sort) return 1;
      return 0;
    });
  }


  /**
   * Convert child sections to the expected structure
   * @param child
   * @private
   */
  private _transformSection(section: EntitySchemeSectionInterface, index: number): EntitySchemeSectionInterface {
    section = <EntitySchemeSectionInterface>CleanObject(section, {blacklist: ['flattened']}); // first level are only containers
    section.container = true;
    section.position = index + 1;
    section.flex = 1;
    section.sort_order = index;
    if (!(IsObject(section.mapping))) section.mapping = {};
    if (!(IsArray(section.mapping.sort_order))) section.mapping.sort_order = [];
    if (!(IsArray(section.children))) section.children = [];
    section.children = section.children.filter((child: EntitySchemeSectionInterface) => { // sub level maybe an actual asset or a container
      if (String(String(child.asset_type).toLowerCase()).includes('field')) {
        child.asset_type = 'field';
      }else if (String(String(child.asset_type).toLowerCase()).includes('component')) {
        child.asset_type = 'component';
      } else  if (String(String(child.asset_type).toLowerCase()).includes('widget')) {
        child.asset_type = 'widget';
      }
      // console.log('type', child.asset_type);
      if (child.asset_type && child.asset_type != 'table') {
        if (+child.asset_id) {
          return this.asset.assetMap[child.asset_type].has(child.asset_id);
        } else {
          return true;
        }
      }

      return child.asset_type != 'table';
    });

    section.children.map((child: EntitySchemeSectionInterface) => {
      child = this._transformChild(child);
      child.sort_order = section.mapping.sort_order.includes(child.id) ? +section.mapping.sort_order.indexOf(child.id) : 99;
      if (IsObject(child.asset, true)) {
        if (IsString(child.asset_type, true)) {
          child.compact = <boolean>(IsObject(child.asset, ['compact']) && IsDefined(child.asset.compact) ? child.asset.compact : false);
          this._ensureAssetTypeContainers(child.asset_type);
          this.ui.attachedMap[child.asset_type].set(+child.asset_id, section.position);
        } else {
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

  private _transformChild(child: EntitySchemeSectionInterface): EntitySchemeSectionInterface {
    child = <EntitySchemeSectionInterface>CleanObject(child);
    if (!(IsObject(child.mapping))) child.mapping = {};
    if (IsDefined(child.asset_id) && +child.asset_id) {
      delete child.children;
      if (String(String(child.asset_type).toLowerCase()).includes('field')) child.asset_type = 'field';
      if (child.asset_type === 'field' && this.asset.assetMap.field.has(child.asset_id)) {
        child.asset = this.asset.assetMap.field.get(child.asset_id);
        child.name = child.asset.name;
        child.compact = true;
      } else if (child.asset_type === 'component' && this.asset.assetMap.component.has(child.asset_id)) {
        child.asset_type = 'component';
        child.asset = this.asset.assetMap.component.get(child.asset_id);
        child.name = child.asset.name;
      }
      child.container = false;
    } else {
      child.container = true;
    }
    return child;
  }


  /**
   * This fx is used ensures that an asset type has the all ancillary assets needed
   * @param assetType
   */
  private _ensureAssetTypeContainers(assetType: string) {
    if (!this.asset.attachingSet[assetType]) this.asset.attachingSet[assetType] = new Set();
    if (!this.asset.assetMap[assetType]) this.asset.assetMap[assetType] = new Map();
    if (!this.ui.attachedMap[assetType]) this.ui.attachedMap[assetType] = new Map();
    if (!this.ui.assignableConfigs[assetType]) this.ui.assignableConfigs[assetType] = {};
  }


  /**
   * Clear out all the attaching set data
   */
  private _resetAssetAttachingData() {
    Object.keys(this.asset.attachingSet).map((key) => {
      this.asset.attachingSet[key].clear();
    });
  }


  /**
   * Refresh the core entity
   * @param dom
   */
  private _refreshEntity(dom: PopDomService = null) {
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
  private _setChildAsAttachable(child: EntitySchemeSectionInterface) {
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
  private _setChildAsAttached(child: EntitySchemeSectionInterface, position: number = 1) {
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
  private _checkForTraits(core: CoreConfig, sections: EntitySchemeSectionInterface[], primaryIds = []): any[] {
    if (IsArray(sections, true)) {
      sections.map((section) => {
        if (IsArray(section.children, true)) {
          section.children.map((child) => {
            if (child.asset_type === 'field') {
              child.asset.required = IsArray(core.entity.mapping.required) ? core.entity.mapping.required.includes(child.asset_id) : false;
              if (primaryIds.includes(child.asset_id)) {
                primaryIds.splice(primaryIds.indexOf(child.asset_id), 1);
                child.asset.primary = true;
              } else {
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
