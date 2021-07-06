import { __awaiter } from "tslib";
import { Injectable } from '@angular/core';
import { ToYesNoPipe } from '../pipes/toYesNo.pipe';
import { PhonePipe } from '../pipes/phone.pipe';
import { TruncatePipe } from '../pipes/truncate.pipe';
import { ToActiveOrArchivedPipe } from '../pipes/toActiveOrArchived.pipe';
import { PopApp, PopBusiness, PopDate } from '../pop-common.model';
import { GetSessionSiteVar, IsArray, IsDefined, IsNumber, IsObject, IsString, PopTransform, SetSessionSiteVar, StorageGetter, TitleCase } from '../pop-common-utility';
import { PopResourceService } from './pop-resource.service';
import { LabelPipe } from '../pipes/label.pipe';
import { GetSingularName, IsAliasable } from '../modules/entity/pop-entity-utility';
import * as i0 from "@angular/core";
import * as i1 from "./pop-resource.service";
export class PopPipeService {
    constructor(resource) {
        this.resource = resource;
        this.name = 'PopPipeService';
        this.loaded = false;
        this.resources = {
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
        this.asset = {
            business: {},
            country: {},
            timezone: {},
            state: {},
            client: {},
            campaign: {},
            account: {},
            entity: {},
        };
        this.assetMap = {
            entity: {}
        };
        this.active = new ToActiveOrArchivedPipe();
        this.yesno = new ToYesNoPipe();
        this.truncate = new TruncatePipe();
        this.phone = new PhonePipe();
        this.label = new LabelPipe();
    }
    /**
     * Mutate a value with a specified transformation
     * @param value
     * @param transformation
     * @param core
     */
    transform(value, transformation, core = null) {
        if (IsObject(transformation, true)) {
            switch (transformation.type) {
                case 'toRelationName':
                    if (IsObject(value)) {
                        if (transformation.arg1) { // core storage path
                            const location = IsString(transformation.arg1, true) ? transformation.arg1 : 'name';
                            const steps = String(location).split('.');
                            // steps.push(value);
                            const name = StorageGetter(value, steps);
                            if (name)
                                value = name;
                            if (IsString(transformation.arg2, true)) { // alias
                                if (IsAliasable(GetSingularName(String(value)))) {
                                    value = StorageGetter(PopApp.entities[TitleCase(String(value))], ['alias', String(transformation.arg2).toLowerCase()], value);
                                }
                            }
                        }
                    }
                    else {
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
                                    if (IsString(transformation.arg2, true))
                                        key = transformation.arg2;
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
                            }
                            else if (resourceName in this.asset) {
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
                    }
                    else {
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
                                }
                                else {
                                    if (alias === 'plural') {
                                        value = entity.name;
                                    }
                                    else {
                                        value = TitleCase(value + '');
                                    }
                                }
                            }
                            else {
                                value = TitleCase(value + '');
                            }
                        }
                        else if (IsString(value, true)) {
                            const id = this.assetMap.entity[value + ''];
                            key = 'name';
                            if (IsString(transformation.arg1, true)) {
                                key = transformation.arg1;
                            }
                            if (id in this.asset.entity && this.asset.entity[id] && IsDefined(this.asset.entity[id][key])) {
                                value = this.asset.entity[id][key];
                            }
                            else {
                                value = TitleCase(value + '');
                            }
                        }
                        else if (IsNumber(value, true)) {
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
        }
        else if (IsString(transformation, true)) {
            return PopTransform(value, transformation);
        }
        return value;
    }
    loadResources(allowCache = true) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (this.loaded)
                return resolve(true);
            let resources;
            if (allowCache && IsObject(PopBusiness, ['id'])) {
                try {
                    resources = GetSessionSiteVar(`App.${PopBusiness.id}.Resource`);
                    resources = JSON.parse(atob(resources));
                }
                catch (e) {
                }
            }
            if (IsObject(resources, Object.keys(this.resources))) {
                Object.keys(resources).map((key) => {
                    const values = resources[key].data_values;
                    this.asset[key] = {};
                    values.map((item) => {
                        this.asset[key][item.id] = item;
                    });
                });
                this._setAssetMap();
                return resolve(true);
            }
            else {
                this.resource.setCollection(this.resources).then(() => {
                    resources = this.resource.getCollection(this.resources);
                    if (IsObject(resources, true)) {
                        try {
                            SetSessionSiteVar(`App.${PopBusiness.id}.Resource`, btoa(JSON.stringify(resources)));
                        }
                        catch (e) {
                        }
                        Object.keys(resources).map((key) => {
                            const values = resources[key].data_values;
                            this.asset[key] = {};
                            values.map((item) => {
                                this.asset[key][item.id] = item;
                            });
                        });
                        this._setAssetMap();
                        this.loaded = true;
                        return resolve(true);
                    }
                    else {
                        this.loaded = true;
                        return resolve(true);
                    }
                }, () => {
                    return resolve(false);
                });
            }
        }));
    }
    setAsset(assetName, data) {
        if (assetName in this.asset && IsObject(data, true)) {
            this.asset[assetName] = data;
        }
    }
    updateEntityAlias(entityId, alias) {
        if (entityId in this.asset.entity && IsObject(this.asset.entity[entityId])) {
            this.asset.entity[entityId].alias = alias;
        }
    }
    /**
     * A helper method to prepareTableData
     * @param row
     * @param transformations
     */
    transformObjectValues(obj, transformations, core = null) {
        for (const field in transformations) {
            if (!transformations.hasOwnProperty(field))
                continue;
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
    _setAssetMap() {
        if (IsObject(this.asset.entity, true)) {
            Object.keys(this.asset.entity).map(entityId => {
                const entity = this.asset.entity[entityId];
                this.assetMap.entity[entity.internal_name] = entityId;
            });
        }
    }
}
PopPipeService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopPipeService_Factory() { return new PopPipeService(i0.ɵɵinject(i1.PopResourceService)); }, token: PopPipeService, providedIn: "root" });
PopPipeService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
PopPipeService.ctorParameters = () => [
    { type: PopResourceService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXBpcGUuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9zZXJ2aWNlcy9wb3AtcGlwZS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDOUMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3BELE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBQ3hFLE9BQU8sRUFBNkIsTUFBTSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUM3RixPQUFPLEVBQ0wsaUJBQWlCLEVBQ2pCLE9BQU8sRUFDUCxTQUFTLEVBQ1QsUUFBUSxFQUNSLFFBQVEsRUFDUixRQUFRLEVBQ1IsWUFBWSxFQUNaLGlCQUFpQixFQUNqQixhQUFhLEVBQ2IsU0FBUyxFQUNWLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDMUQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRTlDLE9BQU8sRUFBQyxlQUFlLEVBQUUsV0FBVyxFQUFDLE1BQU0sc0NBQXNDLENBQUM7OztBQUlsRixNQUFNLE9BQU8sY0FBYztJQU96QixZQUFvQixRQUE0QjtRQUE1QixhQUFRLEdBQVIsUUFBUSxDQUFvQjtRQUx4QyxTQUFJLEdBQUcsZ0JBQWdCLENBQUM7UUFFaEMsV0FBTSxHQUFHLEtBQUssQ0FBQztRQU9QLGNBQVMsR0FBUTtZQUN2QixRQUFRLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFLFVBQVU7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QyxHQUFXLEVBQUUsZUFBbUIsRUFBRSxPQUFtQixJQUFJO1FBQzdFLEtBQUssTUFBTSxLQUFLLElBQUksZUFBZSxFQUFFO1lBQ25DLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztnQkFBRSxTQUFTO1lBQ3JELEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxlQUFlLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDdkU7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFHRDs7Ozs7c0dBS2tHO0lBRTFGLFlBQVk7UUFDbEIsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDckMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDNUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxRQUFRLENBQUM7WUFDeEQsQ0FBQyxDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7Ozs7WUF4VUYsVUFBVSxTQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7O1lBTnhCLGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1RvWWVzTm9QaXBlfSBmcm9tICcuLi9waXBlcy90b1llc05vLnBpcGUnO1xuaW1wb3J0IHtQaG9uZVBpcGV9IGZyb20gJy4uL3BpcGVzL3Bob25lLnBpcGUnO1xuaW1wb3J0IHtUcnVuY2F0ZVBpcGV9IGZyb20gJy4uL3BpcGVzL3RydW5jYXRlLnBpcGUnO1xuaW1wb3J0IHtUb0FjdGl2ZU9yQXJjaGl2ZWRQaXBlfSBmcm9tICcuLi9waXBlcy90b0FjdGl2ZU9yQXJjaGl2ZWQucGlwZSc7XG5pbXBvcnQge0NvcmVDb25maWcsIEVudGl0eSwgS2V5TWFwLCBQb3BBcHAsIFBvcEJ1c2luZXNzLCBQb3BEYXRlfSBmcm9tICcuLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7XG4gIEdldFNlc3Npb25TaXRlVmFyLFxuICBJc0FycmF5LFxuICBJc0RlZmluZWQsXG4gIElzTnVtYmVyLFxuICBJc09iamVjdCxcbiAgSXNTdHJpbmcsXG4gIFBvcFRyYW5zZm9ybSxcbiAgU2V0U2Vzc2lvblNpdGVWYXIsXG4gIFN0b3JhZ2VHZXR0ZXIsXG4gIFRpdGxlQ2FzZVxufSBmcm9tICcuLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHtQb3BSZXNvdXJjZVNlcnZpY2V9IGZyb20gJy4vcG9wLXJlc291cmNlLnNlcnZpY2UnO1xuaW1wb3J0IHtMYWJlbFBpcGV9IGZyb20gJy4uL3BpcGVzL2xhYmVsLnBpcGUnO1xuaW1wb3J0IHtCdXNpbmVzc30gZnJvbSAnLi4vcG9wLWNvbW1vbi10b2tlbi5tb2RlbCc7XG5pbXBvcnQge0dldFNpbmd1bGFyTmFtZSwgSXNBbGlhc2FibGV9IGZyb20gJy4uL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktdXRpbGl0eSc7XG5cblxuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgUG9wUGlwZVNlcnZpY2Uge1xuXG4gIHByaXZhdGUgbmFtZSA9ICdQb3BQaXBlU2VydmljZSc7XG5cbiAgbG9hZGVkID0gZmFsc2U7XG5cblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlc291cmNlOiBQb3BSZXNvdXJjZVNlcnZpY2UpIHtcbiAgfVxuXG5cbiAgcHJpdmF0ZSByZXNvdXJjZXM6IGFueSA9IHtcbiAgICB0aW1lem9uZToge1xuICAgICAgbmFtZTogJ3RpbWV6b25lJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogbnVsbCxcbiAgICAgIGRhdGFfdHlwZTogJ2FwaV9yZWNvcmRzJyxcbiAgICAgIGFwaV9wYXRoOiAncmVjb3Jkcy90aW1lem9uZS12YWx1ZXMnLFxuICAgICAgYXBpX2NhY2hlOiAxLFxuICAgIH0sXG4gICAgY291bnRyeToge1xuICAgICAgbmFtZTogJ2NvdW50cnknLFxuICAgICAgZGVmYXVsdFZhbHVlOiBudWxsLFxuICAgICAgZGF0YV90eXBlOiAnYXBpX3JlY29yZHMnLFxuICAgICAgYXBpX3BhdGg6ICdyZWNvcmRzL2NvdW50cmllcycsXG4gICAgICBhcGlfY2FjaGU6IDEsXG4gICAgfSxcbiAgICBzdGF0ZToge1xuICAgICAgbmFtZTogJ3N0YXRlJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogbnVsbCxcbiAgICAgIGRhdGFfdHlwZTogJ2FwaV9yZWNvcmRzJyxcbiAgICAgIGFwaV9wYXRoOiAncmVjb3Jkcy91LXMtc3RhdGVzJyxcbiAgICAgIGFwaV9jYWNoZTogMSxcbiAgICB9LFxuICAgIGVudGl0eToge1xuICAgICAgbmFtZTogJ2VudGl0eScsXG4gICAgICBkZWZhdWx0VmFsdWU6IG51bGwsXG4gICAgICBkYXRhX3R5cGU6ICdhcGlfcmVjb3JkcycsXG4gICAgICBhcGlfcGF0aDogYGVudGl0aWVzP3NlbGVjdD1pZCxuYW1lLGludGVybmFsX25hbWUsYWxpYXMmd2l0aD1hbGlhc2AsXG4gICAgICBhcGlfY2FjaGU6IDEsXG4gICAgfVxuICB9O1xuXG5cbiAgcHJpdmF0ZSBhc3NldCA9IHtcbiAgICBidXNpbmVzczogPEtleU1hcDxCdXNpbmVzcz4+e30sXG4gICAgY291bnRyeTogPEtleU1hcDxFbnRpdHk+Pnt9LFxuICAgIHRpbWV6b25lOiA8S2V5TWFwPEVudGl0eT4+e30sXG4gICAgc3RhdGU6IDxLZXlNYXA8RW50aXR5Pj57fSxcbiAgICBjbGllbnQ6IDxLZXlNYXA8RW50aXR5Pj57fSxcbiAgICBjYW1wYWlnbjogPEtleU1hcDxFbnRpdHk+Pnt9LFxuICAgIGFjY291bnQ6IDxLZXlNYXA8RW50aXR5Pj57fSxcbiAgICBlbnRpdHk6IDxLZXlNYXA8RW50aXR5Pj57fSxcbiAgfTtcblxuICBwcml2YXRlIGFzc2V0TWFwID0ge1xuICAgIGVudGl0eToge31cbiAgfTtcblxuXG4gIGFjdGl2ZSA9IG5ldyBUb0FjdGl2ZU9yQXJjaGl2ZWRQaXBlKCk7XG4gIHllc25vID0gbmV3IFRvWWVzTm9QaXBlKCk7XG4gIHRydW5jYXRlID0gbmV3IFRydW5jYXRlUGlwZSgpO1xuICBwaG9uZSA9IG5ldyBQaG9uZVBpcGUoKTtcbiAgbGFiZWwgPSBuZXcgTGFiZWxQaXBlKCk7XG5cblxuICAvKipcbiAgICogTXV0YXRlIGEgdmFsdWUgd2l0aCBhIHNwZWNpZmllZCB0cmFuc2Zvcm1hdGlvblxuICAgKiBAcGFyYW0gdmFsdWVcbiAgICogQHBhcmFtIHRyYW5zZm9ybWF0aW9uXG4gICAqIEBwYXJhbSBjb3JlXG4gICAqL1xuICB0cmFuc2Zvcm0odmFsdWU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4sIHRyYW5zZm9ybWF0aW9uOiBhbnksIGNvcmU6IENvcmVDb25maWcgPSBudWxsKTogYW55IHtcbiAgICBpZiAoSXNPYmplY3QodHJhbnNmb3JtYXRpb24sIHRydWUpKSB7XG4gICAgICBzd2l0Y2ggKHRyYW5zZm9ybWF0aW9uLnR5cGUpIHtcbiAgICAgICAgY2FzZSAndG9SZWxhdGlvbk5hbWUnOlxuICAgICAgICAgIGlmIChJc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIGlmICh0cmFuc2Zvcm1hdGlvbi5hcmcxKSB7IC8vIGNvcmUgc3RvcmFnZSBwYXRoXG4gICAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gSXNTdHJpbmcodHJhbnNmb3JtYXRpb24uYXJnMSwgdHJ1ZSkgPyB0cmFuc2Zvcm1hdGlvbi5hcmcxIDogJ25hbWUnO1xuICAgICAgICAgICAgICBjb25zdCBzdGVwcyA9IDxhbnlbXT5TdHJpbmcobG9jYXRpb24pLnNwbGl0KCcuJyk7XG4gICAgICAgICAgICAgIC8vIHN0ZXBzLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgICBjb25zdCBuYW1lID0gPHN0cmluZz5TdG9yYWdlR2V0dGVyKHZhbHVlLCBzdGVwcyk7XG4gICAgICAgICAgICAgIGlmIChuYW1lKSB2YWx1ZSA9IG5hbWU7XG4gICAgICAgICAgICAgIGlmIChJc1N0cmluZyh0cmFuc2Zvcm1hdGlvbi5hcmcyLCB0cnVlKSkgeyAvLyBhbGlhc1xuICAgICAgICAgICAgICAgIGlmIChJc0FsaWFzYWJsZShHZXRTaW5ndWxhck5hbWUoU3RyaW5nKHZhbHVlKSkpKSB7XG4gICAgICAgICAgICAgICAgICB2YWx1ZSA9IFN0b3JhZ2VHZXR0ZXIoUG9wQXBwLmVudGl0aWVzW1RpdGxlQ2FzZShTdHJpbmcodmFsdWUpKV0sIFsnYWxpYXMnLCBTdHJpbmcodHJhbnNmb3JtYXRpb24uYXJnMikudG9Mb3dlckNhc2UoKV0sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFsdWUgPSB0cmFuc2Zvcm1hdGlvbi5hcmcyID8gdHJhbnNmb3JtYXRpb24uYXJnMiA6IHZhbHVlOyAvLyB0cmFuc2Zvcm1hdGlvbnNbIGZpZWxkIF0uYXJnMiBpcyBkZWZhdWx0IHZhbHVlXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0b1Jlc291cmNlTmFtZSc6XG4gICAgICAgICAgaWYgKElzTnVtYmVyKHZhbHVlKSkge1xuICAgICAgICAgICAgbGV0IHJlc291cmNlO1xuICAgICAgICAgICAgbGV0IGtleSA9ICduYW1lJztcbiAgICAgICAgICAgIGxldCByZXNvdXJjZU5hbWU7XG4gICAgICAgICAgICBsZXQgaWQ7XG4gICAgICAgICAgICBpZiAoSXNTdHJpbmcodHJhbnNmb3JtYXRpb24uYXJnMSwgdHJ1ZSkpIHsgLy8gcmVzb3VyY2UgbmFtZVxuICAgICAgICAgICAgICByZXNvdXJjZU5hbWUgPSBTdHJpbmcodHJhbnNmb3JtYXRpb24uYXJnMSkudHJpbSgpO1xuICAgICAgICAgICAgICBpZiAoSXNPYmplY3QoY29yZSwgWydyZXNvdXJjZSddKSAmJiByZXNvdXJjZU5hbWUgaW4gY29yZS5yZXNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHJlc291cmNlID0gY29yZS5yZXNvdXJjZVtyZXNvdXJjZU5hbWVdO1xuICAgICAgICAgICAgICAgIGlmIChJc0FycmF5KGNvcmUucmVzb3VyY2VbcmVzb3VyY2VOYW1lXS5kYXRhX3ZhbHVlcywgdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChJc1N0cmluZyh0cmFuc2Zvcm1hdGlvbi5hcmcyLCB0cnVlKSkga2V5ID0gdHJhbnNmb3JtYXRpb24uYXJnMjtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBjb3JlLnJlc291cmNlW3Jlc291cmNlTmFtZV0uZGF0YV92YWx1ZXMuZmluZCgoaSkgPT4gK2kuaWQgPT09IHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIGlmIChJc09iamVjdChpdGVtLCBba2V5XSkgJiYgSXNEZWZpbmVkKGl0ZW1ba2V5XSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBpdGVtW2tleV07XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChJc1N0cmluZyh0cmFuc2Zvcm1hdGlvbi5hcmcyLCB0cnVlKSkgeyAvLyBhbGlhc1xuICAgICAgICAgICAgICAgICAgaWYgKElzQWxpYXNhYmxlKEdldFNpbmd1bGFyTmFtZShTdHJpbmcodmFsdWUpKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBTdG9yYWdlR2V0dGVyKFBvcEFwcC5lbnRpdGllc1tUaXRsZUNhc2UoU3RyaW5nKHZhbHVlKSldLCBbJ2FsaWFzJywgU3RyaW5nKHRyYW5zZm9ybWF0aW9uLmFyZzIpLnRvTG93ZXJDYXNlKCldLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlc291cmNlTmFtZSBpbiB0aGlzLmFzc2V0KSB7XG4gICAgICAgICAgICAgICAgaWQgPSArdmFsdWU7XG4gICAgICAgICAgICAgICAgcmVzb3VyY2VOYW1lID0gU3RyaW5nKHRyYW5zZm9ybWF0aW9uLmFyZzEpLnRyaW0oKTtcbiAgICAgICAgICAgICAgICBpZiAoSXNTdHJpbmcodHJhbnNmb3JtYXRpb24uYXJnMSwgdHJ1ZSkpIHsgLy8gYWx0ZXJuYXRlIHZhbHVlXG4gICAgICAgICAgICAgICAgICBrZXkgPSB0cmFuc2Zvcm1hdGlvbi5hcmcxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmVzb3VyY2VOYW1lIGluIHRoaXMuYXNzZXQgJiYgaWQgaW4gdGhpcy5hc3NldFtyZXNvdXJjZU5hbWVdICYmIElzRGVmaW5lZCh0aGlzLmFzc2V0W3Jlc291cmNlTmFtZV1baWRdW2tleV0pKSB7XG4gICAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMuYXNzZXRbdHJhbnNmb3JtYXRpb24udHlwZV1baWRdW2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlID0gdHJhbnNmb3JtYXRpb24uYXJnMyA/IHRyYW5zZm9ybWF0aW9uLmFyZzMgOiB2YWx1ZTsgLy8gdHJhbnNmb3JtYXRpb25zWyBmaWVsZCBdLmFyZzIgaXMgZGVmYXVsdCB2YWx1ZVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZW50aXR5JzpcbiAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIGxldCBrZXk7XG4gICAgICAgICAgICBpZiAoSXNTdHJpbmcodmFsdWUsIHRydWUpICYmIHRyYW5zZm9ybWF0aW9uLmFyZzEgPT09ICdhbGlhcycpIHtcbiAgICAgICAgICAgICAgY29uc3QgaWQgPSB0aGlzLmFzc2V0TWFwLmVudGl0eVt2YWx1ZSArICcnXTtcbiAgICAgICAgICAgICAgY29uc3QgYWxpYXMgPSB0cmFuc2Zvcm1hdGlvbi5hcmcyID8gKHRyYW5zZm9ybWF0aW9uLmFyZzIgIT09ICdwbHVyYWwnID8gJ25hbWUnIDogJ3BsdXJhbCcpIDogJ25hbWUnO1xuICAgICAgICAgICAgICBpZiAoaWQgaW4gdGhpcy5hc3NldC5lbnRpdHkgJiYgdGhpcy5hc3NldC5lbnRpdHlbaWRdKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZW50aXR5ID0gdGhpcy5hc3NldC5lbnRpdHlbaWRdO1xuICAgICAgICAgICAgICAgIGlmIChJc09iamVjdChlbnRpdHkuYWxpYXMpICYmIGFsaWFzIGluIGVudGl0eS5hbGlhcykge1xuICAgICAgICAgICAgICAgICAgdmFsdWUgPSBUaXRsZUNhc2UoZW50aXR5LmFsaWFzW2FsaWFzXSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGlmIChhbGlhcyA9PT0gJ3BsdXJhbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBlbnRpdHkubmFtZTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gVGl0bGVDYXNlKHZhbHVlICsgJycpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IFRpdGxlQ2FzZSh2YWx1ZSArICcnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChJc1N0cmluZyh2YWx1ZSwgdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgaWQgPSB0aGlzLmFzc2V0TWFwLmVudGl0eVt2YWx1ZSArICcnXTtcbiAgICAgICAgICAgICAga2V5ID0gJ25hbWUnO1xuICAgICAgICAgICAgICBpZiAoSXNTdHJpbmcodHJhbnNmb3JtYXRpb24uYXJnMSwgdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICBrZXkgPSB0cmFuc2Zvcm1hdGlvbi5hcmcxO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChpZCBpbiB0aGlzLmFzc2V0LmVudGl0eSAmJiB0aGlzLmFzc2V0LmVudGl0eVtpZF0gJiYgSXNEZWZpbmVkKHRoaXMuYXNzZXQuZW50aXR5W2lkXVtrZXldKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5hc3NldC5lbnRpdHlbaWRdW2tleV07XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBUaXRsZUNhc2UodmFsdWUgKyAnJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoSXNOdW1iZXIodmFsdWUsIHRydWUpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGlkID0gK3ZhbHVlO1xuICAgICAgICAgICAgICBrZXkgPSAnbmFtZSc7XG4gICAgICAgICAgICAgIGlmIChJc1N0cmluZyh0cmFuc2Zvcm1hdGlvbi5hcmcxLCB0cnVlKSkgeyAvLyBhbHRlcm5hdGUgdmFsdWVcbiAgICAgICAgICAgICAgICBrZXkgPSB0cmFuc2Zvcm1hdGlvbi5hcmcxO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChpZCBpbiB0aGlzLmFzc2V0LmVudGl0eSAmJiBJc1N0cmluZyh0aGlzLmFzc2V0LmVudGl0eVtpZF1ba2V5XSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMuYXNzZXRbdHJhbnNmb3JtYXRpb24udHlwZV1baWRdW2tleV07XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY2xpZW50JzpcbiAgICAgICAgY2FzZSAnYWNjb3VudCc6XG4gICAgICAgIGNhc2UgJ2NhbXBhaWduJzpcbiAgICAgICAgY2FzZSAnc3RhdGUnOlxuICAgICAgICBjYXNlICdjb3VudHJ5JzpcbiAgICAgICAgY2FzZSAndGltZXpvbmUnOlxuICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgY29uc3QgaWQgPSArdmFsdWU7XG4gICAgICAgICAgICBsZXQga2V5ID0gJ25hbWUnO1xuICAgICAgICAgICAgaWYgKElzU3RyaW5nKHRyYW5zZm9ybWF0aW9uLmFyZzEsIHRydWUpKSB7IC8vIGFsdGVybmF0ZSB2YWx1ZVxuICAgICAgICAgICAgICBrZXkgPSB0cmFuc2Zvcm1hdGlvbi5hcmcxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHJhbnNmb3JtYXRpb24udHlwZSBpbiB0aGlzLmFzc2V0ICYmIGlkIGluIHRoaXMuYXNzZXRbdHJhbnNmb3JtYXRpb24udHlwZV0gJiYgSXNEZWZpbmVkKHRoaXMuYXNzZXRbdHJhbnNmb3JtYXRpb24udHlwZV1baWRdW2tleV0pKSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5hc3NldFt0cmFuc2Zvcm1hdGlvbi50eXBlXVtpZF1ba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3RvRGlnaXRzJzpcbiAgICAgICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSkubWF0Y2goL1xcZCsvZykubWFwKE51bWJlcikuam9pbignJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3RvWWVzTm9QaXBlJzpcbiAgICAgICAgICB2YWx1ZSA9IHRoaXMueWVzbm8udHJhbnNmb3JtKCt2YWx1ZSA+IDApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0b1Bob25lUGlwZSc6XG4gICAgICAgICAgdmFsdWUgPSB0aGlzLnBob25lLnRyYW5zZm9ybSh2YWx1ZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3RvQWN0aXZlT3JBcmNoaXZlZCc6XG4gICAgICAgICAgdmFsdWUgPSB0aGlzLmFjdGl2ZS50cmFuc2Zvcm0odmFsdWUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0b1RpdGxlQ2FzZSc6XG4gICAgICAgICAgdmFsdWUgPSBUaXRsZUNhc2UodmFsdWUgKyAnJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3RvVXBwZXJDYXNlJzpcbiAgICAgICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSkudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndG9Mb3dlckNhc2UnOlxuICAgICAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkYXRlJzpcbiAgICAgICAgICB2YWx1ZSA9IFBvcERhdGUudHJhbnNmb3JtKHZhbHVlLCB0cmFuc2Zvcm1hdGlvbi5hcmcxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndG9DdXJyZW5jeSc6XG4gICAgICAgICAgdmFsdWUgPSBuZXcgSW50bC5OdW1iZXJGb3JtYXQoJ2VuLVVTJywge1xuICAgICAgICAgICAgc3R5bGU6ICdjdXJyZW5jeScsXG4gICAgICAgICAgICBjdXJyZW5jeTogJ1VTRCcsXG4gICAgICAgICAgICBtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IDJcbiAgICAgICAgICB9KS5mb3JtYXQoTnVtYmVyKHZhbHVlKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChJc1N0cmluZyh0cmFuc2Zvcm1hdGlvbiwgdHJ1ZSkpIHtcbiAgICAgIHJldHVybiBQb3BUcmFuc2Zvcm0odmFsdWUsIHRyYW5zZm9ybWF0aW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cblxuICBsb2FkUmVzb3VyY2VzKGFsbG93Q2FjaGUgPSB0cnVlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAodGhpcy5sb2FkZWQpIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgbGV0IHJlc291cmNlcztcbiAgICAgIGlmIChhbGxvd0NhY2hlICYmIElzT2JqZWN0KFBvcEJ1c2luZXNzLCBbJ2lkJ10pKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzb3VyY2VzID0gR2V0U2Vzc2lvblNpdGVWYXIoYEFwcC4ke1BvcEJ1c2luZXNzLmlkfS5SZXNvdXJjZWApO1xuICAgICAgICAgIHJlc291cmNlcyA9IEpTT04ucGFyc2UoYXRvYihyZXNvdXJjZXMpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoSXNPYmplY3QocmVzb3VyY2VzLCBPYmplY3Qua2V5cyh0aGlzLnJlc291cmNlcykpKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHJlc291cmNlcykubWFwKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGNvbnN0IHZhbHVlcyA9IHJlc291cmNlc1trZXldLmRhdGFfdmFsdWVzO1xuICAgICAgICAgIHRoaXMuYXNzZXRba2V5XSA9IHt9O1xuICAgICAgICAgIHZhbHVlcy5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIHRoaXMuYXNzZXRba2V5XVtpdGVtLmlkXSA9IGl0ZW07XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9zZXRBc3NldE1hcCgpO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVzb3VyY2Uuc2V0Q29sbGVjdGlvbih0aGlzLnJlc291cmNlcykudGhlbigoKSA9PiB7XG4gICAgICAgICAgcmVzb3VyY2VzID0gdGhpcy5yZXNvdXJjZS5nZXRDb2xsZWN0aW9uKHRoaXMucmVzb3VyY2VzKTtcbiAgICAgICAgICBpZiAoSXNPYmplY3QocmVzb3VyY2VzLCB0cnVlKSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgU2V0U2Vzc2lvblNpdGVWYXIoYEFwcC4ke1BvcEJ1c2luZXNzLmlkfS5SZXNvdXJjZWAsIGJ0b2EoSlNPTi5zdHJpbmdpZnkocmVzb3VyY2VzKSkpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgT2JqZWN0LmtleXMocmVzb3VyY2VzKS5tYXAoKGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlcyA9IHJlc291cmNlc1trZXldLmRhdGFfdmFsdWVzO1xuICAgICAgICAgICAgICB0aGlzLmFzc2V0W2tleV0gPSB7fTtcbiAgICAgICAgICAgICAgdmFsdWVzLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYXNzZXRba2V5XVtpdGVtLmlkXSA9IGl0ZW07XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLl9zZXRBc3NldE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICB9KTtcbiAgfVxuXG5cbiAgc2V0QXNzZXQoYXNzZXROYW1lOiBzdHJpbmcsIGRhdGE6IEtleU1hcDxFbnRpdHk+KSB7XG4gICAgaWYgKGFzc2V0TmFtZSBpbiB0aGlzLmFzc2V0ICYmIElzT2JqZWN0KGRhdGEsIHRydWUpKSB7XG4gICAgICB0aGlzLmFzc2V0W2Fzc2V0TmFtZV0gPSBkYXRhO1xuICAgIH1cbiAgfVxuXG5cbiAgdXBkYXRlRW50aXR5QWxpYXMoZW50aXR5SWQ6IHN0cmluZywgYWxpYXM6IGFueSkge1xuICAgIGlmIChlbnRpdHlJZCBpbiB0aGlzLmFzc2V0LmVudGl0eSAmJiBJc09iamVjdCh0aGlzLmFzc2V0LmVudGl0eVtlbnRpdHlJZF0pKSB7XG4gICAgICB0aGlzLmFzc2V0LmVudGl0eVtlbnRpdHlJZF0uYWxpYXMgPSBhbGlhcztcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBIGhlbHBlciBtZXRob2QgdG8gcHJlcGFyZVRhYmxlRGF0YVxuICAgKiBAcGFyYW0gcm93XG4gICAqIEBwYXJhbSB0cmFuc2Zvcm1hdGlvbnNcbiAgICovXG4gIHRyYW5zZm9ybU9iamVjdFZhbHVlcyhvYmo6IE9iamVjdCwgdHJhbnNmb3JtYXRpb25zOiB7fSwgY29yZTogQ29yZUNvbmZpZyA9IG51bGwpIHtcbiAgICBmb3IgKGNvbnN0IGZpZWxkIGluIHRyYW5zZm9ybWF0aW9ucykge1xuICAgICAgaWYgKCF0cmFuc2Zvcm1hdGlvbnMuaGFzT3duUHJvcGVydHkoZmllbGQpKSBjb250aW51ZTtcbiAgICAgIG9ialtmaWVsZF0gPSB0aGlzLnRyYW5zZm9ybShvYmpbZmllbGRdLCB0cmFuc2Zvcm1hdGlvbnNbZmllbGRdLCBjb3JlKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgcHJpdmF0ZSBfc2V0QXNzZXRNYXAoKSB7XG4gICAgaWYgKElzT2JqZWN0KHRoaXMuYXNzZXQuZW50aXR5LCB0cnVlKSkge1xuICAgICAgT2JqZWN0LmtleXModGhpcy5hc3NldC5lbnRpdHkpLm1hcChlbnRpdHlJZCA9PiB7XG4gICAgICAgIGNvbnN0IGVudGl0eSA9IHRoaXMuYXNzZXQuZW50aXR5W2VudGl0eUlkXTtcbiAgICAgICAgdGhpcy5hc3NldE1hcC5lbnRpdHlbZW50aXR5LmludGVybmFsX25hbWVdID0gZW50aXR5SWQ7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==