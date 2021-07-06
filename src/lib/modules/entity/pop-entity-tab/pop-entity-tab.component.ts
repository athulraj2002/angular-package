import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {Subject} from 'rxjs';

import {PopEntityEventService} from '../services/pop-entity-event.service';
import {PopEntityService} from '../services/pop-entity.service';
import {PopTabMenuService} from '../../base/pop-tab-menu/pop-tab-menu.service';
import {TabConfig} from '../../base/pop-tab-menu/tab-menu.model';
import {
  CoreConfig, DynamicComponentInterface,
  EntityExtendInterface,
  FieldInterface,
  PopBaseEventInterface,
  PopPortal, PopSchemeComponent, SchemeComponentConfig,
  ServiceInjector
} from '../../../pop-common.model';
import {PopExtendComponent} from '../../../pop-extend.component';
import {PopDomService} from '../../../services/pop-dom.service';
import {IsValidFieldPatchEvent, ParseModelValue, SessionEntityFieldUpdate} from '../pop-entity-utility';
import {
  CleanObject,
  IsArray,
  IsDefined,
  IsObject,
  IsObjectThrowError,
  IsString, SpaceToHyphenLower, SpaceToSnake,
  StorageGetter,
  TitleCase
} from '../../../pop-common-utility';
import {EntitySchemeSectionConfig, EntitySchemeSectionInterface} from '../pop-entity-scheme/pop-entity-scheme.model';
import {PopEntitySchemeCustomComponent} from '../pop-entity-scheme/pop-entity-scheme-custom-component/pop-entity-scheme-custom.component';


@Component({
  selector: 'lib-pop-entity-tab',
  templateUrl: './pop-entity-tab.component.html',
  styleUrls: ['./pop-entity-tab.component.scss'],

})
export class PopEntityTabComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() tab: TabConfig;
  @Input() extension: EntityExtendInterface; // allows the route to override certain settings

  public name = 'PopEntityTabComponent';

  protected srv = {
    dialog: <MatDialog>ServiceInjector.get(MatDialog),
    router: <Router>ServiceInjector.get(Router),
    events: <PopEntityEventService>ServiceInjector.get(PopEntityEventService),
    entity: <PopEntityService>ServiceInjector.get(PopEntityService),
    tab: <PopTabMenuService>undefined,
  };

  protected asset = {
    scheme: <EntitySchemeSectionInterface>undefined,
  };


  /**
   * @param el
   * @param cdr
   * @param route
   * @param _tabRepo - transfer
   * @param _domRepo - transfer
   */
  constructor(
    public el: ElementRef,
    public cdr: ChangeDetectorRef,
    public route: ActivatedRoute,
    protected _tabRepo: PopTabMenuService,
    protected _domRepo: PopDomService,
  ) {
    super();
    this.dom.configure = (): Promise<boolean> => {
      return new Promise(async (resolve) => {
        // Require a CoreConfig
        // Pull in the route extension settings
        if (!this.extension) this.extension = {};
        if (this.route.snapshot.data && Object.keys(this.route.snapshot.data).length) {
          Object.keys(this.route.snapshot.data).map((key) => {
            this.extension[key] = this.route.snapshot.data[key];
          });
        }
        return resolve(true);
      });
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise(async (resolve) => {
        // Require a CoreConfig
        this._setCore().then(() => {
          if (!(IsObject(this.core.entity, ['id']))) this.srv.router.navigate(['/system/route'], {skipLocationChange: true});
          // #1: Enforce a CoreConfig && TabConfig
          // this.core = IsObjectThrowError(this.core, true, `${this.name}:configureDom: - this.core`) ? this.core : null;
          this._setTab().then(() => {
            // set the outer height boundary of this component
            this.dom.overhead = this.tab.wrap ? 40 : 10;
            this.dom.overhead = this.tab.overhead ? this.dom.overhead + this.tab.overhead : this.dom.overhead;
            this.dom.height.default = window.innerHeight - 70;
            this.dom.setHeight(this.dom.height.default, 150);

            // #3: Set tab group container
            this.tab.groups = {};
            // #4: Transfer in the ui rescources
            // if( IsObject(this.core.entity, true) && IsObject(this.core.entity.ui, true) ){
            //   Object.keys(this.core.entity.ui).map((key: string) => {
            //     this.ui.resource[ key ] = this.core.entity.ui[ key ]; // ? maybe this should make a copy
            //   });
            // }
            // #5: Build a view with a scheme or a model
            this.asset.scheme = IsObject(this.core.entity, true) && this.core.entity.scheme_id && IsObject(this.core.resource.scheme, ['data']) ? <EntitySchemeSectionInterface>CleanObject(this.core.resource.scheme.data) : null;
            // console.log( 'this.asset.scheme', this.asset.scheme );
            // #6: Bind Event handlers
            this.dom.handler.core = (core: CoreConfig, event: PopBaseEventInterface) => this._coreEventHandler(event);
            // #7: Build the view
            this.tab.view = this._buildTabView();
            // #8: Register the outlet so the tabRepo can reset the view if needed
            if (true || this.tab.syncPositions) this.srv.tab.registerOutletReset((position: number = null) => this.onResetView(position));
            this._callOnLoadEvent();

            this.dom.setTimeout(`determine-layout`, () => {
              this._determineLayout();
            }, 0);

            return resolve(true);
          });
        });
      });
    };

    this.dom.unload = (): Promise<boolean> => {
      return new Promise(async (resolve) => {
        this.srv.tab.showAsLoading(false);
        return resolve(true);
      });
    };
  }


  /**
   * Setup this component
   */
  ngOnInit() {
    super.ngOnInit();
  }


  /**
   * Bubble event handler
   * @param event
   */
  onBubbleEvent(event: PopBaseEventInterface) {
    this.log.event(`onBubbleEvent`, event);
    if (event.type === 'field_group' && event.name === 'init') {
      this.tab.groups[event.id] = event.group;
      this._callOnEvent(event, {reset: true});
    } else if (event.type === 'sidebyside' && event.name === 'portal') {
      const entityParams = this.srv.entity.getEntityParamsWithPath(String(event.data).split('/')[0], +String(event.data).split('/')[1]);
      if (entityParams) {
        this.onViewEntityPortal(entityParams.internal_name, entityParams.entityId);
      }
    } else if (IsValidFieldPatchEvent(this.core, event)) {
      this.log.event(`IsValidFieldPatchEvent`, event);
      if (event.config.name === 'name' || event.config.name === 'label') {
        this.srv.tab.updateName(event.config.control.value);
      }
      const reset = this._needsPositionReset(event);
      if (!reset) {
        if (typeof this.tab.onEvent === 'function') {
          this._callOnEvent(event);
        }
      } else {
        if (typeof this.tab.onEvent === 'function') {
          this._callOnEvent(event);
        }
        this.srv.events.sendEvent(event);
      }
    } else if (event.type === 'context_menu') {
      if (event.name === 'portal' && event.internal_name && event.id) {
        setTimeout(() => {
          this.onViewEntityPortal(event.internal_name, +event.id);
        }, 0);

      }
    } else if (event.type === 'dom') {
      if (event.name === 'refresh') {
        setTimeout(() => {
          this.onResetView(+event.position);
        }, 0);
      }
    }
  }


  /**
   * Triggers when the window is resized
   */
  onWindowResize() {
    this.dom.setTimeout('window-resize', () => {
      this._determineLayout();
      this.srv.tab.resetTab();

    }, 500);
  }


  /**
   * Triggers when a user clicks on an entityId link to see the details of that entityId in a modal
   * @param internal_name
   * @param id
   */
  onViewEntityPortal(internalName: string, entityId: number) {
    // ToDo:: Due to circular injection errors, the portals are not working
    this.tab.view.map((column) => {
      column.reset.next('scrollTop');
    });

    // this.srv.router.navigateByUrl(`entities/fields/${entityId}`).catch(e => true);
    PopPortal.view(internalName, entityId).then((changed: boolean) => {
      if (changed) {
        this.dom.refreshing();
        this.srv.tab.refreshEntity(this.core.params.entityId, this.dom.repo, {}, 'PopEntityTabComponent:viewEntityPortal').then((res) => {
          this.dom.ready();
        });
      }
    });
  }


  /**
   * Trigger to reset the view
   * @param position
   */
  onResetView(position: number = null): void {
    if (this.dom.state.loaded) {
      if (position === null) {
        this.tab.view.map((section) => {
          section.reset.next(true);
        });
      } else {
        this.tab.view[position].reset.next(true);
      }
      setTimeout(() => {
        this.dom.ready();
      }, 0);
    }
  }


  /**
   * Clean up the dom of this component
   */
  ngOnDestroy() {
    this._callUnloadEvent();
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Protected Method )                                      *
   *                                                                                              *
   ************************************************************************************************/


  /**
   * Tie in hook that is called when ever a event if fired
   *
   */
  private _callOnEvent(event: PopBaseEventInterface, options: { reset?: boolean, entityConfig?: boolean } = {}) {
    if (this.tab && typeof this.tab.onEvent === 'function') {
      event.tab = this.tab;
      // event.component = component;
      // event.core = this.core;
      if (options.reset) event.cdr = this.cdr;
      this.tab.onEvent.bind(this)(this.core, event);
    }
  }


  /**
   * Tie in hook that is called when the tab is initialized
   *
   */
  private _callOnLoadEvent() {
    if (this.tab && typeof this.tab.onLoad === 'function') {
      this.tab.onLoad.bind(this)(this.core, this.tab);
    }
  }


  /**
   * Tie in hook that is called when the tab is destroyed
   *
   */
  private _callUnloadEvent() {
    if (this.tab && typeof this.tab.onUnload === 'function') {
      this.tab.onUnload.bind(this)(this.core, this.tab);
    }
  }


  /**
   * Helper funtion to determine the correct header to display
   * @param header
   */
  private _getHeaderText(header: string) {
    if (IsString(header, true)) {
      return TitleCase(ParseModelValue(header, this.core).replace(/_/g, ' ')).trim();
    }
    return null;
  }


  /**
   * Core Event Handler
   * @param event
   */
  private _coreEventHandler(event: PopBaseEventInterface) {
    this.log.event(`_coreEventHandler`, event);
    if (this.tab.wrap && event.type === 'component') {
      if (event.name === 'start-refresh') {
        this.dom.state.refresh = 1;
      } else if (event.name === 'stop-refresh') {
        this.dom.state.refresh = 0;
      } else if (event.name === 'reset-view') {
        this.onResetView();
      }
    }
  }


  /**
   * Detects if a mobile layout should be used based on the width of the screen
   */
  private _determineLayout() {

    const client = this.el.nativeElement.getBoundingClientRect();
    this.dom.width.inner = client.width;
    this.dom.state.mobile = this.dom.width.inner <= 1340 ? true : false;
    if (this.dom.state.mobile) {
      this.tab.view.map((column) => {
        column.maxHeight = null;
        column.minHeight = null;
      });
    } else {
      this.tab.view.map((column) => {
        column.minHeight = column.header ? this.dom.height.inner - 50 : this.dom.height.inner;
        column.maxHeight = column.header ? this.dom.height.inner - 50 : this.dom.height.inner;
      });
    }
    // if( this.log.repo.enabled('dom', this.name) || this.extension.debug ) console.log(this.log.repo.message(`${this.name}:${this.tab.entityId}:_determineLayout:width:${this.dom.width.inner}: mobile: ${this.dom.state.mobile}`), this.log.repo.color('dom'));
  }


  /**
   * Determines if an event should cause a view reset
   * @param event
   */
  private _needsPositionReset(event: PopBaseEventInterface): boolean {
    let position;
    if (this.tab.syncPositions) {
      // console.log('pass 1');
      if (event.config && event.config.metadata && event.config.metadata.position) {
        // console.log('pass 2');
        position = event.config.metadata.position;
        if (event.name === 'patch' && ['field', 'sidebyside', 'permissions'].includes(event.type)) {
          // console.log('pass 3');
          if (!this.tab.syncPositionFields || this.tab.syncPositionFields.includes(event.config.column)) {
            // console.log('pass 4');
            if (!IsObject(this.tab.syncPositionMap, true) || (position in this.tab.syncPositionMap && IsArray(this.tab.syncPositionMap[position]))) {
              // console.log('pass 5');
              if (IsObject(this.tab.syncPositionMap, true)) {
                // console.log('pass 6');
                if (IsArray(this.tab.syncPositionMap[position])) {
                  // console.log('pass 7');
                  this.tab.syncPositionMap[position].map((pos) => {
                    this.onResetView(+pos);
                  });
                }
                return true;
              } else {
                this.onResetView();
              }
              return true;
            }
          }
        }
      }
    }

    return false;
  }


  /**
   * Allows for a pre built core to be passed in else it will build the core itself
   */
  _setCore(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!(IsObject(this.core, true))) {

        const tabCore = this.srv.tab.getCore();
        if (IsObject(tabCore, ['entity'])) {
          this.core = tabCore;
          this.log.info(`_setCore: initial`);
          return resolve(true);
        }

        if (this.route.snapshot.data.core) {
          this.core = IsObjectThrowError(this.route.snapshot.data.core, true, `${this.name}:: - this.route.snapshot.data.core`) ? <CoreConfig>this.route.snapshot.data.core : <CoreConfig>{};
          this.log.info(`_setCore: route`);
          return resolve(true);
        }

        const coreParams = this.srv.tab && this.srv.tab.ui && this.srv.tab.ui.entityParams ? this.srv.tab.ui.entityParams : {};
        if (IsObject(coreParams, true)) {
          this.srv.entity.getCoreConfig(coreParams.internal_name, +coreParams.entity).then((core: CoreConfig) => {
            this.core = IsObjectThrowError(core, true, `${this.name}:: - core`) ? core : <CoreConfig>{};
            this.log.info(`_setCore: tab params`);
            return resolve(true);
          });
        } else {
          this.srv.entity.getCoreConfig(this.srv.entity.getRouteInternalName(this.route, this.extension), this.route.snapshot.params.entity).then((core: CoreConfig) => {
            this.core = IsObjectThrowError(core, true, `${this.name}:: - core`) ? core : null;
            this.log.info(`_setCore: route internal _name`);
            return resolve(true);
          });
        }
      } else {
        return resolve(true);
      }
    });
  }


  /**
   * Allows for a pre built tab to be passed in else it will find try to find one
   */
  _setTab(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!(IsObject(this.tab, true))) {
        const tab = this.srv.tab.getTab();
        this.tab = IsObjectThrowError(tab, true, `${this.name}:_setTab: - tab`) ? tab : {};
        return resolve(true);
      } else {
        return resolve(true);
      }
    });
  }


  /**
   * Determine the structure of the tab view
   *
   */
  _buildTabView(): any[] {
    const view = [];
//     console.log('this.tab.scheme', this.tab.scheme);
    if (this.tab.scheme && IsObject(this.asset.scheme, ['children'])) {
//       console.log('should use the scheme provided', this.asset.scheme);
      const sections = this.asset.scheme.children;
      const sectionKeys = Object.keys(sections);
      const lastSectionKey = sectionKeys[sectionKeys.length - 1];
      let section;
      sectionKeys.map((sectionKey) => {
        section = sections[sectionKey];
        section.position = +sectionKey + 1;
        if (typeof section.flex === 'undefined') {
          section.flex = +lastSectionKey === +sectionKey ? 2 : 1;
        }
        let height = +this.dom.height.outer;
        height = section.header ? (height - 50) : height;

        this.dom.repo.position[sectionKey] = {
          height: height,
        };

        view.push({
          id: sectionKey,
          position: section.position,
          reset: new Subject(),
          components: this._getSchemeSectionAssetComponents(this.core, this.asset.scheme, section),
          header: this._getHeaderText(section.name),
          flex: section.flex,
          minWidth: +sectionKey < 3 ? 350 : null,
          maxWidth: +sectionKey < 2 ? 450 : null,
          maxHeight: height,
          active: true,
        });
      });
    } else {
      const positions = IsObjectThrowError(this.tab.positions, true, `${this.name}:configureDom: - this.tab.positions`) ? this.tab.positions : {};
      Object.keys(positions).map((position) => {
        let height = +this.dom.height.outer;
        height = this.tab.positions[position].header ? (height - 50) : height;

        this.dom.repo.position[position] = {
          height: height,
        };

        view.push({
          id: position,
          position: position,
          reset: new Subject(),
          components: this.tab.positions[position].components,
          extension: this.extension,
          header: this._getHeaderText(this.tab.positions[position].header),
          flex: this.tab.positions[position].flex,
          maxWidth: this.tab.positions[position].max,
          minWidth: this.tab.positions[position].min,
          maxHeight: height,
          active: true,
        });
      });
    }

    return view;
  }


  /**
   * Gather all the assets that should be rendered in a specific section
   * @param core
   * @param assets
   */
  private _getSchemeSectionAssetComponents(core: CoreConfig, scheme: EntitySchemeSectionInterface, section: EntitySchemeSectionInterface) {

    const componentList = [];
    const Field = this.dom.repo.ui.fields;
    // console.log('Field', Field);
    const tableFields = this._getSectionTableFieldsAssets(section);
    section.children = [...tableFields, ...(IsArray(section.children) ? section.children : [])];
    if(IsObject(section.mapping, ['sort_order'])){
      section.children = section.children.sort(function (a, b) {
        const a1 = section.mapping.sort_order.indexOf(a.id);
        const a2 = section.mapping.sort_order.indexOf(b.id);
        if (a1 < a2) return -1;
        if (a1 > a2) return 1;
        return 0;
      });
    }



    section.children.map((child) => {
      if (String(String(child.asset_type).toLowerCase()).includes('field')) {
        child.asset_type = 'field';
      } else if (String(String(child.asset_type).toLowerCase()).includes('component')) {
        child.asset_type = 'component';
      } else if (String(String(child.asset_type).toLowerCase()).includes('widget')) {
        child.asset_type = 'widget';
      }
      if (child.asset_type && IsDefined(child.asset_id)) {
        switch (child.asset_type) {
          case 'table': {
            // console.log( 'table', child );
            // const fieldItem = child.name ? Field.get( child.name ) : null;
            // if( fieldItem ){
            //   componentList.push( fieldItem );
            // }
            break;
          }
          case 'field': {
            const field = Field.get(+child.asset_id);

            if (field) {
              componentList.push(scheme, field);
            }
            break;
          }
          case 'component': {
            // ToDo:: Figure how custom components are going to be managed

            const internalName = StorageGetter(child, ['asset', 'internal_name'], String(SpaceToSnake(child.name)).toLowerCase() + '_1');
            const component = <DynamicComponentInterface>{
              type: PopEntitySchemeCustomComponent,
              inputs: {
                core: core,
                config: <SchemeComponentConfig>undefined,
                componentId: child.asset_id,
                internal_name: internalName
              }
            };
            componentList.push(component);
            break;
          }
          default:
            // if( this.srv.log.enabled('error', this.name) ) console.log(this.srv.log.message(`${this.name}:getSchemeSectionAssetComponents`), this.srv.log.color('error'), asset);
            break;
        }
      }

    });

    return componentList;
  }


  /**
   * Retrieve the default columns tht exist on an entity table
   * @param section
   */
  private _getSectionTableFieldsAssets(section: EntitySchemeSectionInterface) {
    const tableAssets = [];
    if (this.core) {
      const Field = StorageGetter(this.core, 'repo.model.field'.split('.'));
      if (IsObject(Field, true)) {
        Object.values(Field).map((field: FieldInterface) => {
          if (!field.ancillary && field.position === section.position) {
            tableAssets.push(new EntitySchemeSectionConfig({
              id: 0,
              name: field.model.name,
              label: field.model.label,
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
}
