import {Injectable} from '@angular/core';
import {ToYesNoPipe} from '../pipes/toYesNo.pipe';
import {PhonePipe} from '../pipes/phone.pipe';
import {TruncatePipe} from '../pipes/truncate.pipe';
import {ToActiveOrArchivedPipe} from '../pipes/toActiveOrArchived.pipe';
import {CoreConfig, Entity, KeyMap, PopApp, PopBusiness, PopDate} from '../pop-common.model';
import {
  GetSessionSiteVar,
  IsArray,
  IsDefined,
  IsNumber,
  IsObject,
  IsString,
  PopTransform,
  SetSessionSiteVar,
  StorageGetter,
  TitleCase
} from '../pop-common-utility';
import {PopResourceService} from './pop-resource.service';
import {LabelPipe} from '../pipes/label.pipe';
import {Business} from '../pop-common-token.model';
import {GetSingularName, IsAliasable} from '../modules/entity/pop-entity-utility';


@Injectable({providedIn: 'root'})
export class PopPipeService {

  private name = 'PopPipeService';

  loaded = false;


  constructor(private resource: PopResourceService) {
  }


  private resources: any = {
    timezone: {
      name: 'timezone',
      defaultValue: null,
      data_type: 'api_records',
      api_path: 'records/timezone-values',
      api_cache: 1,
    },
    country: {
      name: 'country',
      defaultValue: null,
      data_type: 'api_records',
      api_path: 'records/countries',
      api_cache: 1,
    },
    state: {
      name: 'state',
      defaultValue: null,
      data_type: 'api_records',
      api_path: 'records/u-s-states',
      api_cache: 1,
    },
    entity: {
      name: 'entity',
      defaultValue: null,
      data_type: 'api_records',
      api_path: `entities?select=id,name,internal_name,alias&with=alias`,
      api_cache: 1,
    }
  };


  private asset = {
    business: <KeyMap<Business>>{},
    country: <KeyMap<Entity>>{},
    timezone: <KeyMap<Entity>>{},
    state: <KeyMap<Entity>>{},
    client: <KeyMap<Entity>>{},
    campaign: <KeyMap<Entity>>{},
    account: <KeyMap<Entity>>{},
    entity: <KeyMap<Entity>>{},
  };

  private assetMap = {
    entity: {}
  };


  active = new ToActiveOrArchivedPipe();
  yesno = new ToYesNoPipe();
  truncate = new TruncatePipe();
  phone = new PhonePipe();
  label = new LabelPipe();


  /**
   * Mutate a value with a specified transformation
   * @param value
   * @param transformation
   * @param core
   */
  transform(value: string | number | boolean, transformation: any, core: CoreConfig = null): any {
    if (IsObject(transformation, true)) {
      switch (transformation.type) {
        case 'toRelationName':
          if (IsObject(value)) {
            if (transformation.arg1) { // core storage path
              const location = IsString(transformation.arg1, true) ? transformation.arg1 : 'name';
              const steps = <any[]>String(location).split('.');
              // steps.push(value);
              const name = <string>StorageGetter(value, steps);
              if (name) value = name;
              if (IsString(transformation.arg2, true)) { // alias
                if (IsAliasable(GetSingularName(String(value)))) {
                  value = StorageGetter(PopApp.entities[TitleCase(String(value))], ['alias', String(transformation.arg2).toLowerCase()], value);
                }
              }
            }
          } else {
            value = transformation.arg2 ? transformation.arg2 : value; // transformations[ field ].arg2 is default value
          }
          break;
        case 'toResourceName':
          if (IsNumber(value)) {
            let resource;
            let key = 'name';
            let resourceName;
            let id;
            if (IsString(transformation.arg1, true)) { // resource name
              resourceName = String(transformation.arg1).trim();
              if (IsObject(core, ['resource']) && resourceName in core.resource) {
                resource = core.resource[resourceName];
                if (IsArray(core.resource[resourceName].data_values, true)) {
                  if (IsString(transformation.arg2, true)) key = transformation.arg2;
                  const item = core.resource[resourceName].data_values.find((i) => +i.id === value);
                  if (IsObject(item, [key]) && IsDefined(item[key])) {
                    value = item[key];
                  }
                }
                if (IsString(transformation.arg2, true)) { // alias
                  if (IsAliasable(GetSingularName(String(value)))) {
                    value = StorageGetter(PopApp.entities[TitleCase(String(value))], ['alias', String(transformation.arg2).toLowerCase()], value);
                  }
                }
              } else if (resourceName in this.asset) {
                id = +value;
                resourceName = String(transformation.arg1).trim();
                if (IsString(transformation.arg1, true)) { // alternate value
                  key = transformation.arg1;
                }
                if (resourceName in this.asset && id in this.asset[resourceName] && IsDefined(this.asset[resourceName][id][key])) {
                  value = this.asset[transformation.type][id][key];
                }
              }
            }
          } else {
            value = transformation.arg3 ? transformation.arg3 : value; // transformations[ field ].arg2 is default value
          }
          break;
        case 'entity':
          if (value) {
            let key;
            if (IsString(value, true) && transformation.arg1 === 'alias') {
              const id = this.assetMap.entity[value + ''];
              const alias = transformation.arg2 ? (transformation.arg2 !== 'plural' ? 'name' : 'plural') : 'name';
              if (id in this.asset.entity && this.asset.entity[id]) {
                const entity = this.asset.entity[id];
                if (IsObject(entity.alias) && alias in entity.alias) {
                  value = TitleCase(entity.alias[alias]);
                } else {
                  if (alias === 'plural') {
                    value = entity.name;
                  } else {
                    value = TitleCase(value + '');
                  }
                }
              } else {
                value = TitleCase(value + '');
              }
            } else if (IsString(value, true)) {
              const id = this.assetMap.entity[value + ''];
              key = 'name';
              if (IsString(transformation.arg1, true)) {
                key = transformation.arg1;
              }
              if (id in this.asset.entity && this.asset.entity[id] && IsDefined(this.asset.entity[id][key])) {
                value = this.asset.entity[id][key];
              } else {
                value = TitleCase(value + '');
              }
            } else if (IsNumber(value, true)) {
              const id = +value;
              key = 'name';
              if (IsString(transformation.arg1, true)) { // alternate value
                key = transformation.arg1;
              }
              if (id in this.asset.entity && IsString(this.asset.entity[id][key])) {
                value = this.asset[transformation.type][id][key];
              }

            }
          }
          break;
        case 'client':
        case 'account':
        case 'campaign':
        case 'state':
        case 'country':
        case 'timezone':
          if (value) {
            const id = +value;
            let key = 'name';
            if (IsString(transformation.arg1, true)) { // alternate value
              key = transformation.arg1;
            }

            if (transformation.type in this.asset && id in this.asset[transformation.type] && IsDefined(this.asset[transformation.type][id][key])) {
              value = this.asset[transformation.type][id][key];
            }
          }
          break;
        case 'toDigits':
          value = String(value).match(/\d+/g).map(Number).join('');
          break;
        case 'toYesNoPipe':
          value = this.yesno.transform(+value > 0);
          break;
        case 'toPhonePipe':
          value = this.phone.transform(value);
          break;
        case 'toActiveOrArchived':
          value = this.active.transform(value);
          break;
        case 'toTitleCase':
          value = TitleCase(value + '');
          break;
        case 'toUpperCase':
          value = String(value).toUpperCase();
          break;
        case 'toLowerCase':
          value = String(value).toLowerCase();
          break;
        case 'date':
          value = PopDate.transform(value, transformation.arg1);
          break;
        case 'toCurrency':
          value = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
          }).format(Number(value));
          break;
        default:
          break;
      }
    } else if (IsString(transformation, true)) {
      return PopTransform(value, transformation);
    }
    return value;
  }


  loadResources(allowCache = true) {
    return new Promise(async (resolve) => {
      if (this.loaded) return resolve(true);
      let resources;
      if (allowCache && IsObject(PopBusiness, ['id'])) {
        try {
          resources = GetSessionSiteVar(`App.${PopBusiness.id}.Resource`);
          resources = JSON.parse(atob(resources));
        } catch (e) {
        }
      }
      if (IsObject(resources, Object.keys(this.resources))) {
        Object.keys(resources).map((key: string) => {
          const values = resources[key].data_values;
          this.asset[key] = {};
          values.map((item) => {
            this.asset[key][item.id] = item;
          });
        });
        this._setAssetMap();
        return resolve(true);
      } else {
        this.resource.setCollection(this.resources).then(() => {
          resources = this.resource.getCollection(this.resources);
          if (IsObject(resources, true)) {
            try {
              SetSessionSiteVar(`App.${PopBusiness.id}.Resource`, btoa(JSON.stringify(resources)));
            } catch (e) {
            }
            Object.keys(resources).map((key: string) => {
              const values = resources[key].data_values;
              this.asset[key] = {};
              values.map((item) => {
                this.asset[key][item.id] = item;
              });
            });
            this._setAssetMap();
            this.loaded = true;
            return resolve(true);
          } else {
            this.loaded = true;
            return resolve(true);
          }
        }, () => {
          return resolve(false);
        });
      }

    });
  }


  setAsset(assetName: string, data: KeyMap<Entity>) {
    if (assetName in this.asset && IsObject(data, true)) {
      this.asset[assetName] = data;
    }
  }


  updateEntityAlias(entityId: string, alias: any) {
    if (entityId in this.asset.entity && IsObject(this.asset.entity[entityId])) {
      this.asset.entity[entityId].alias = alias;
    }
  }


  /**
   * A helper method to prepareTableData
   * @param row
   * @param transformations
   */
  transformObjectValues(obj: Object, transformations: {}, core: CoreConfig = null) {
    for (const field in transformations) {
      if (!transformations.hasOwnProperty(field)) continue;
      obj[field] = this.transform(obj[field], transformations[field], core);
    }
    return obj;
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  private _setAssetMap() {
    if (IsObject(this.asset.entity, true)) {
      Object.keys(this.asset.entity).map(entityId => {
        const entity = this.asset.entity[entityId];
        this.assetMap.entity[entity.internal_name] = entityId;
      });
    }
  }
}
