import {Inject, Injectable, OnDestroy} from '@angular/core';

import {PopExtendService} from "../../../services/pop-extend.service";
import {
  AppGlobalInterface,
  Dictionary,
  DynamicComponentInterface,
  PopLog,
  ResourceInterface,
  SchemeComponentConfig,
  SchemeComponentModelInterface,
  SchemeComponentOptionInterface,
  SchemeComponentParamInterface,
  SchemeComponentSettingInterface
} from "../../../pop-common.model";
import {TabConfig} from "../../base/pop-tab-menu/tab-menu.model";
import {PopResourceService} from "../../../services/pop-resource.service";
import {DeepMerge, IsArray, IsObject, IsString, SnakeToPascal, TitleCase} from "../../../pop-common-utility";
import {EvaluateWhenConditions} from "../pop-entity-utility";
import {PopEntitySchemeCustomComponent} from "../pop-entity-scheme/pop-entity-scheme-custom-component/pop-entity-scheme-custom.component";


@Injectable({
  providedIn: 'root'
})
export class PopEntitySchemeComponentService extends PopExtendService implements OnDestroy {

  protected asset = {
    action: <Map<string, Dictionary<any>>>new Map<string, Dictionary<any>>(),
    base: <Map<string, SchemeComponentConfig>>new Map<string, SchemeComponentConfig>(),
    setting: <Map<string, SchemeComponentSettingInterface>>new Map<string, SchemeComponentSettingInterface>(),
    component: <Map<string, DynamicComponentInterface>>new Map<string, DynamicComponentInterface>(),
    param: <Map<string, SchemeComponentParamInterface>>new Map<string, SchemeComponentParamInterface>(),
    resource: <Map<string, Dictionary<ResourceInterface>>>new Map<string, Dictionary<ResourceInterface>>(),
    option: <Map<string, SchemeComponentOptionInterface>>new Map<string, SchemeComponentOptionInterface>(),
    tabs: <Map<string, TabConfig[]>>new Map<string, TabConfig[]>(),
    baseImageUrl: '',
  };


  /**
   * This srv is used in the
   * @param env
   */
  constructor(
    private resource: PopResourceService,
    @Inject('APP_GLOBAL') private APP_GLOBAL: AppGlobalInterface,
    @Inject('env') private env?
  ) {
    super();

    setTimeout(async () => {
      await APP_GLOBAL.isVerified();
      this.asset.baseImageUrl = IsString(this.env.s3BucketUrl, true) ? this.env.s3BucketUrl : 'https://popcx-dev-public.s3-us-west-2.amazonaws.com';
    }, 0);
  }


  /**
   * Configure/Extend the default behavior of an entity
   * @param internal_name
   * @param extend
   */
  configure(internal_name: string, extend: SchemeComponentModelInterface) {
    if (IsObject(extend.component, ['type'])) this.setComponent(internal_name, extend.component);
    if (IsArray(extend.tab, true)) this.setTab(internal_name, extend.tab);
    if (IsObject(extend.action, true)) this.setAction(internal_name, extend.action);
    if (IsObject(extend.resource, true)) this.setResource(internal_name, extend.resource);
    if (IsObject(extend.setting, true)) this.setSetting(internal_name, extend.setting);
    if (IsObject(extend.option, true)) this.setOption(internal_name, extend.option);
  }


  /**
   * A method to get a Core Config for an entity
   * Uses cache service to improve performance
   * ALL ENTITY RELATED COMPONENTS RELY ON THIS !!!!
   * @param entityParams
   * @param metadata
   */
  getConfig(internal_name: string, item: SchemeComponentParamInterface): Promise<SchemeComponentConfig> {
    return new Promise<SchemeComponentConfig>(async (resolve) => {
      let config = await this._getBaseConfig(internal_name);
      if (item && item.id) {
        config.id = item.id;
        config.param.id = item.id;
        config.preferences = await this._getPreferences(config.param);
        const settingComponent = config.setting.component;
        config = DeepMerge(config, item);
        config.setting.component = settingComponent ? settingComponent : null;
      }
      await this.getResources(config);

      return resolve(config);
    });
  }


  /**
   * This will do all of the work of building and storing the base config for each entity
   * @param internal_name
   * @param routes
   * @private
   */
  private _getBaseConfig(internal_name: string): Promise<SchemeComponentConfig> {
    return new Promise((resolve) => {
      if (!this.asset.base.has(internal_name)) {
        const param = this.getParams(internal_name);
        const base = new SchemeComponentConfig({
          param: param,
          component: this.getComponent(internal_name),
          setting: this.getSetting(internal_name),
          option: this.getOption(internal_name),
          resource: this.getResource(internal_name),
        });
        this.asset.base.set(internal_name, base);
        return resolve(base);
      } else {
        return resolve({...this.asset.base.get(internal_name)});
      }
    });
  }


  /**
   * Get the base set of the entity definitions
   * These is the starting point when it comes to entities
   * @param internal_name
   * @param entityId
   */
  getParams(internal_name: string): SchemeComponentParamInterface {
    let widgetParams = null;
    if (this.asset.param.has(internal_name)) {
      widgetParams = {...this.asset.param.get(internal_name)};
    } else {
      // temporary
      widgetParams = {internal_name: internal_name, name: TitleCase(SnakeToPascal(internal_name))};
    }
    return widgetParams;
  }


  /**
   * Get the set of tab configs that belong to an entity
   */
  getTabs(widget?: SchemeComponentConfig): TabConfig[] {
    if (IsObject(widget, ['param']) && this.asset.tabs.has(widget.param.internal_name)) {
      const tabs = this.asset.tabs.get(widget.param.internal_name).filter((tab) => {
        return EvaluateWhenConditions(widget, tab.when);
      });
      return [...tabs];
    } else {
      return [];
    }
  }


  /**
   * A Http call that gets the entity metadata
   * @param id Primary Key of the entity
   */
  getResources(widget: SchemeComponentConfig): Promise<boolean> {
    return new Promise(async (resolve) => {
      if (IsObject(widget.resource, true)) {
        const success = await this.resource.setCollection(widget.resource);
        if (success) {
          this.resource.getCollection(widget.resource);
          return resolve(true);
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  }


  /**
   * Set the base definitions for an entity
   * Each entity needs to define these so we know how to talk to the api in regards to it
   * The api should provide this details as part of the auth token
   * @param internal_name
   * @param entityId
   */
  setParam(param: SchemeComponentParamInterface) {
    if (IsObject(param, ['internal_name', 'name'])) {
      PopLog.info(this.name, `Params set for ${param.internal_name}`, param);
      this.asset.param.set(param.internal_name, param);
    }
  }


  /**
   * Attach a set of tab configs to an entity
   * @param internal_name
   * @param tabs
   */
  setTab(internal_name: string, tabs: TabConfig[]) {
    if (IsString(internal_name, true) && Array.isArray(tabs)) {
      PopLog.info(this.name, `Entity Tabs set for ${internal_name}`, tabs);
      this.asset.tabs.set(internal_name, tabs);
    }
  }


  /**
   * Attach a component to a widget
   * @param internal_name
   * @param tabs
   */
  setComponent(internal_name: string, component: DynamicComponentInterface) {
    if (IsString(internal_name, true) && IsObject(component, ['type'])) {
      PopLog.info(this.name, `Component set for ${internal_name}`, component);
      this.asset.component.set(internal_name, component);
    }
  }


  /**
   * Attach a set of actions to an entity
   * @param internal_name
   * @param tabs
   */
  setAction(internal_name: string, action: Dictionary<any>): void {
    if (IsString(internal_name, true) && IsObject(action)) {
      PopLog.info(this.name, `Action set for ${internal_name}`, action);
      this.asset.action.set(internal_name, action);
    }
  }


  /**
   * Attach a set of resources to an entity
   * @param internal_name
   * @param tabs
   */
  setResource(internal_name: string, resource: Dictionary<ResourceInterface>): void {
    if (IsString(internal_name, true) && IsObject(resource)) {
      PopLog.info(this.name, `Entity Resource set for ${internal_name}`, resource);
      this.asset.resource.set(internal_name, resource);
    }
  }


  /**
   * Attach a set of options to widget
   * @param internal_name
   * @param tabs
   */
  setOption(internal_name: string, option: SchemeComponentOptionInterface): void {
    if (IsString(internal_name, true) && IsObject(option)) {
      PopLog.info(this.name, `Option set for ${internal_name}`, option);
      this.asset.option.set(internal_name, option);
    }
  }


  /**
   * Attach a set of options to widget
   * @param internal_name
   * @param tabs
   */
  setSetting(internal_name: string, setting: SchemeComponentSettingInterface): void {
    if (IsString(internal_name, true) && IsObject(setting)) {
      PopLog.info(this.name, `Setting set for ${internal_name}`, setting);
      this.asset.setting.set(internal_name, setting);
    }
  }


  /**
   * Get extended fields attached to an entity
   * @param internal_name
   * @param tabs
   */
  getResource(internal_name: string): Dictionary<ResourceInterface> {
    if (IsString(internal_name, true)) {
      const resource = this.asset.resource.get(internal_name);
      return resource ? resource : {};
    }
  }


  /**
   * Get extended actions attached to an entity
   * @param internal_name
   * @param tabs
   */
  getAction(internal_name: string): Dictionary<any> {
    if (IsString(internal_name, true)) {
      const action = this.asset.action.get(internal_name);
      return action ? action : {};
    }
  }


  /**
   * Get extended actions attached to an entity
   * @param internal_name
   * @param tabs
   */
  getSetting(internal_name: string): SchemeComponentSettingInterface {
    if (IsString(internal_name, true)) {
      const setting = this.asset.setting.get(internal_name);
      return setting ? setting : {};
    }
  }


  /**
   * Get extended actions attached to an entity
   * @param internal_name
   * @param tabs
   */
  getOption(internal_name: string): SchemeComponentOptionInterface {
    if (IsString(internal_name, true)) {
      const option = this.asset.option.get(internal_name);
      return option ? option : {};
    }
  }


  /**
   * Get extended actions attached to an entity
   * @param internal_name
   * @param tabs
   */
  getComponent(internal_name: string): DynamicComponentInterface {
    if (IsString(internal_name, true)) {
      const component = this.asset.component.get(internal_name);
      return component ? component : null;
    }
  }


  ngOnDestroy() {
    console.log(this.name, `destroyed:${this.id}`);
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/





  private _getPreferences(param: SchemeComponentParamInterface): Promise<Dictionary<any>> {
    return new Promise<Dictionary<any>>((resolve) => {
      return resolve(<Dictionary<any>>{});
    });

  }


  getDefaultComponentSetting(internalName: string): SchemeComponentSettingInterface {
    const setting = <SchemeComponentSettingInterface>{
      client_id: [],
      account_id: [],
      campaign_id: [],
      edit: true,
      refresh: true
    };

    return setting;
  }


  getDefaultComponentOption(internalName: string): SchemeComponentOptionInterface {
    const option = <SchemeComponentOptionInterface>{
      client_id: [],
      account_id: [],
      campaign_id: [],
      edit: true,
      refresh: true
    };

    return option;
  }


}
