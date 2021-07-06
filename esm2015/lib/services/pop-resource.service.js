import { __awaiter } from "tslib";
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PopCacheService } from './pop-cache.service';
import { PopEntity, PopLog, PopRequest, ResourceConfig } from '../pop-common.model';
import { CleanObject, GetHttpResult, IsArray, IsCallableFunction, IsObject, IsString, StorageGetter, StringReplaceAll } from '../pop-common-utility';
import { EvaluateWhenConditions, ParseModelValue } from '../modules/entity/pop-entity-utility';
import { PopExtendService } from './pop-extend.service';
import * as i0 from "@angular/core";
export class PopResourceService extends PopExtendService {
    constructor() {
        super();
        this.name = 'PopResourceService';
        this.cache = new PopCacheService();
    }
    /**
     * This fx will map the api calls for a collection of resources
     * @param collection
     * @param core
     */
    setCollection(collection, core) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const api_requests = [];
            const request_map = [];
            let resource;
            if (IsObject(collection, true)) {
                Object.keys(collection).map((resourceKey) => {
                    resource = collection[resourceKey];
                    if (resource.api_path) {
                        if (!resource.can_read || PopEntity.checkAccess(resource.can_read, 'can_read')) {
                            // break;
                            let path = resource.api_path;
                            if (IsArray(resource.api_when, true) && IsObject(core, true)) {
                                const when = EvaluateWhenConditions(core, resource.api_when);
                                if (!when) {
                                    PopLog.info(this.name, `setCollection: condition not met`, resource);
                                    return false;
                                }
                            }
                            request_map.push(resourceKey);
                            if (IsObject(resource.api_path_vars, true) && core) {
                                Object.keys(resource.api_path_vars).map((varKey) => {
                                    let value = '';
                                    if (String(resource.api_path_vars[varKey]).includes('.')) {
                                        value = StorageGetter(core, String(resource.api_path_vars[varKey]).split('.'));
                                    }
                                    if (!value)
                                        value = ParseModelValue(String(resource.api_path_vars[varKey]));
                                    if (value) {
                                        path = StringReplaceAll(path, `:${varKey}`, value);
                                    }
                                });
                            }
                            const body = IsObject(resource.api_params, true) ? resource.api_params : {};
                            if (IsObject(body)) {
                                Object.keys(body).map((key) => {
                                    body[key] = ParseModelValue(body[key], core);
                                });
                            }
                            if (+resource.api_cache) {
                                PopLog.info(this.name, `cached resource`, resource);
                                api_requests.push(this.cache.get('resource', path, PopRequest.doGet(path, body, resource.api_version), 3600000));
                            }
                            else {
                                api_requests.push(PopRequest.doGet(path, body, resource.api_version));
                            }
                        }
                    }
                });
            }
            if (api_requests.length) {
                forkJoin(api_requests).subscribe((results) => {
                    results.map((res, index) => {
                        res = res.data ? res.data : res;
                        resource = collection[request_map[index]];
                        let dataTarget;
                        if (IsArray(res, false)) {
                            dataTarget = resource.data_storage ? resource.data_storage : 'data_values';
                            if (IsObject(collection[request_map[index]].data_filter, true)) {
                                try {
                                    Object.keys(resource.data_filter).map((filterKey) => {
                                        res = res.filter((item) => {
                                            let filterKeyValue = resource.data_filter[filterKey];
                                            if (String(filterKeyValue).includes('.')) {
                                                filterKeyValue = StorageGetter(core, String(filterKeyValue).split('.'));
                                            }
                                            if (!filterKeyValue)
                                                filterKeyValue = ParseModelValue(String(resource.data_filter[filterKey]));
                                            return item[filterKey] == filterKeyValue;
                                        });
                                    });
                                }
                                catch (e) {
                                    PopLog.warn(this.name, `setCollection`, e);
                                }
                            }
                            res = IsCallableFunction(resource.data_decorator) ? res.map(x => resource.data_decorator(core, x)) : res;
                            if (IsArray(resource.data_when, true)) {
                                // EvaluateModelConditionals();
                                try {
                                    res = res.filter((item) => {
                                        return EvaluateWhenConditions(item, resource.data_when, core);
                                    });
                                }
                                catch (e) {
                                    PopLog.warn(this.name, `setCollection`, e);
                                }
                            }
                            if (IsCallableFunction(resource.data_setter))
                                res = resource.data_setter(core, res);
                            resource[dataTarget] = res;
                        }
                        else {
                            dataTarget = resource.data_storage ? resource.data_storage : 'data';
                            resource[dataTarget] = IsCallableFunction(resource.data_decorator) ? resource.data_decorator(core, res) : res;
                            if (IsCallableFunction(resource.data_setter))
                                resource[dataTarget] = resource.data_setter(core, resource[dataTarget]);
                        }
                    });
                    resolve(true);
                }, err => {
                    resolve(false);
                });
            }
            else {
                resolve(true);
            }
        }));
    }
    /**
     * This fx will extract the data from a resource collection
     * @param collection
     * @param core
     */
    getCollection(collection) {
        const store = {};
        if (IsObject(collection, true)) {
            Object.keys(collection).map((resourceKey) => {
                const resource = collection[resourceKey];
                store[resource.name] = CleanObject(new ResourceConfig(resource));
            });
        }
        return store;
    }
    /**
     * This fx will reload a single existing resource
     * @param collection
     */
    reloadResource(core, resource) {
        return new Promise((resolve) => {
            if (IsObject(resource, ['api_path'] && resource.api_path && IsString(resource.api_path, true))) {
                let path = resource.api_path;
                if (resource.can_read && !PopEntity.checkAccess(resource.can_read, 'can_read')) {
                    PopLog.debug(this.name, `reloadResource: Cannot read resource:${resource.can_read}`);
                    return resolve(resource);
                }
                if (IsArray(resource.api_when, true) && IsObject(core, true)) {
                    const when = EvaluateWhenConditions(core, resource.api_when);
                    if (!when) {
                        PopLog.debug(this.name, 'reloadResource: condition not met');
                        return resolve(resource);
                    }
                }
                if (IsObject(resource.api_path_vars, true) && core) {
                    Object.keys(resource.api_path_vars).map((varKey) => {
                        let value = '';
                        if (String(resource.api_path_vars[varKey]).includes('.')) {
                            value = StorageGetter(core, String(resource.api_path_vars[varKey]).split('.'));
                        }
                        if (!value)
                            value = ParseModelValue(String(resource.api_path_vars[varKey]));
                        if (value) {
                            path = StringReplaceAll(path, `:${varKey}`, value);
                        }
                    });
                }
                const body = IsObject(resource.api_params, true) ? resource.api_params : {};
                if (IsObject(body)) {
                    Object.keys(body).map((key) => {
                        body[key] = ParseModelValue(body[key], core);
                    });
                }
                PopRequest.doGet(path, body, resource.api_version).subscribe((res) => {
                    res = GetHttpResult(res);
                    let dataTarget;
                    PopLog.debug(this.name, 'reloadResource: pass 4');
                    if (IsArray(res, false)) {
                        dataTarget = resource.data_storage ? resource.data_storage : 'data_values';
                        if (IsObject(resource.data_filter, true)) {
                            try {
                                Object.keys(resource.data_filter).map((filterKey) => {
                                    res = res.filter((item) => {
                                        let filterKeyValue = resource.data_filter[filterKey];
                                        if (String(filterKeyValue).includes('.')) {
                                            filterKeyValue = StorageGetter(core, String(filterKeyValue).split('.'));
                                        }
                                        if (!filterKeyValue)
                                            filterKeyValue = ParseModelValue(String(resource.data_filter[filterKey]));
                                        return item[filterKey] == filterKeyValue;
                                    });
                                });
                            }
                            catch (e) {
                                PopLog.warn(this.name, `setCollection`, e);
                            }
                        }
                        if (IsArray(resource.data_when, true)) {
                            // EvaluateModelConditionals();
                            try {
                                res = res.filter((item) => {
                                    return EvaluateWhenConditions(item, resource.data_when, core);
                                });
                            }
                            catch (e) {
                                PopLog.warn(this.name, `setCollection`, e);
                            }
                        }
                        resource[dataTarget] = IsCallableFunction(resource.data_decorator) ? res.map(x => resource.data_decorator(core, x)) : res;
                        if (IsCallableFunction(resource.data_setter))
                            resource[dataTarget] = resource.data_setter(core, resource[dataTarget]);
                    }
                    else {
                        dataTarget = resource.data_storage ? resource.data_storage : 'data';
                        resource[dataTarget] = IsCallableFunction(resource.data_decorator) ? resource.data_decorator(core, res) : res;
                    }
                    return resolve(resource);
                }, () => {
                    return resolve(resource);
                });
            }
            else {
                return resolve(resource);
            }
        });
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
PopResourceService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopResourceService_Factory() { return new PopResourceService(); }, token: PopResourceService, providedIn: "root" });
PopResourceService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopResourceService.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXJlc291cmNlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvc2VydmljZXMvcG9wLXJlc291cmNlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQWEsTUFBTSxlQUFlLENBQUM7QUFDdEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNoQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDdEQsT0FBTyxFQUdMLFNBQVMsRUFDVCxNQUFNLEVBQ04sVUFBVSxFQUNWLGNBQWMsRUFHZixNQUFNLHFCQUFxQixDQUFDO0FBQzdCLE9BQU8sRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3JKLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxlQUFlLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUMvRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQzs7QUFNeEQsTUFBTSxPQUFPLGtCQUFtQixTQUFRLGdCQUFnQjtJQU90RDtRQUNFLEtBQUssRUFBRSxDQUFDO1FBTkgsU0FBSSxHQUFHLG9CQUFvQixDQUFDO1FBRTNCLFVBQUssR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO0lBS3RDLENBQUM7SUFHRDs7OztPQUlHO0lBQ0gsYUFBYSxDQUFFLFVBQXlDLEVBQUUsSUFBaUI7UUFDekUsT0FBTyxJQUFJLE9BQU8sQ0FBRSxDQUFPLE9BQU8sRUFBRyxFQUFFO1lBQ3JDLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztZQUN4QixNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFDdkIsSUFBSSxRQUFRLENBQUM7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bGFyL2NvcmUnO1xuaW1wb3J0IHsgZm9ya0pvaW4gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFBvcENhY2hlU2VydmljZSB9IGZyb20gJy4vcG9wLWNhY2hlLnNlcnZpY2UnO1xuaW1wb3J0IHtcbiAgQ29yZUNvbmZpZyxcbiAgRGljdGlvbmFyeSxcbiAgUG9wRW50aXR5LFxuICBQb3BMb2csXG4gIFBvcFJlcXVlc3QsXG4gIFJlc291cmNlQ29uZmlnLFxuICBSZXNvdXJjZUludGVyZmFjZSxcbiAgU2VydmljZUluamVjdG9yXG59IGZyb20gJy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgQ2xlYW5PYmplY3QsIEdldEh0dHBSZXN1bHQsIElzQXJyYXksIElzQ2FsbGFibGVGdW5jdGlvbiwgSXNPYmplY3QsIElzU3RyaW5nLCBTdG9yYWdlR2V0dGVyLCBTdHJpbmdSZXBsYWNlQWxsIH0gZnJvbSAnLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7IEV2YWx1YXRlV2hlbkNvbmRpdGlvbnMsIFBhcnNlTW9kZWxWYWx1ZSB9IGZyb20gJy4uL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktdXRpbGl0eSc7XG5pbXBvcnQgeyBQb3BFeHRlbmRTZXJ2aWNlIH0gZnJvbSAnLi9wb3AtZXh0ZW5kLnNlcnZpY2UnO1xuXG5cbkBJbmplY3RhYmxlKCB7XG4gIHByb3ZpZGVkSW46ICdyb290J1xufSApXG5leHBvcnQgY2xhc3MgUG9wUmVzb3VyY2VTZXJ2aWNlIGV4dGVuZHMgUG9wRXh0ZW5kU2VydmljZSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG5cbiAgcHVibGljIG5hbWUgPSAnUG9wUmVzb3VyY2VTZXJ2aWNlJztcblxuICBwcml2YXRlIGNhY2hlID0gbmV3IFBvcENhY2hlU2VydmljZSgpO1xuXG5cbiAgY29uc3RydWN0b3IoKXtcbiAgICBzdXBlcigpO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBmeCB3aWxsIG1hcCB0aGUgYXBpIGNhbGxzIGZvciBhIGNvbGxlY3Rpb24gb2YgcmVzb3VyY2VzXG4gICAqIEBwYXJhbSBjb2xsZWN0aW9uXG4gICAqIEBwYXJhbSBjb3JlXG4gICAqL1xuICBzZXRDb2xsZWN0aW9uKCBjb2xsZWN0aW9uOiBEaWN0aW9uYXJ5PFJlc291cmNlSW50ZXJmYWNlPiwgY29yZT86IENvcmVDb25maWcgKTogUHJvbWlzZTxib29sZWFuPntcbiAgICByZXR1cm4gbmV3IFByb21pc2UoIGFzeW5jKCByZXNvbHZlICkgPT4ge1xuICAgICAgY29uc3QgYXBpX3JlcXVlc3RzID0gW107XG4gICAgICBjb25zdCByZXF1ZXN0X21hcCA9IFtdO1xuICAgICAgbGV0IHJlc291cmNlO1xuICAgICAgaWYoIElzT2JqZWN0KCBjb2xsZWN0aW9uLCB0cnVlICkgKXtcbiAgICAgICAgT2JqZWN0LmtleXMoIGNvbGxlY3Rpb24gKS5tYXAoICggcmVzb3VyY2VLZXkgKSA9PiB7XG4gICAgICAgICAgcmVzb3VyY2UgPSA8UmVzb3VyY2VDb25maWc+Y29sbGVjdGlvblsgcmVzb3VyY2VLZXkgXTtcbiAgICAgICAgICBpZiggcmVzb3VyY2UuYXBpX3BhdGggKXtcbiAgICAgICAgICAgIGlmKCFyZXNvdXJjZS5jYW5fcmVhZCB8fCBQb3BFbnRpdHkuY2hlY2tBY2Nlc3MocmVzb3VyY2UuY2FuX3JlYWQsICdjYW5fcmVhZCcpKXtcbiAgICAgICAgICAgICAgLy8gYnJlYWs7XG4gICAgICAgICAgICAgIGxldCBwYXRoID0gcmVzb3VyY2UuYXBpX3BhdGg7XG4gICAgICAgICAgICAgIGlmKCBJc0FycmF5KCByZXNvdXJjZS5hcGlfd2hlbiwgdHJ1ZSApICYmIElzT2JqZWN0KCBjb3JlLCB0cnVlICkgKXtcbiAgICAgICAgICAgICAgICBjb25zdCB3aGVuID0gRXZhbHVhdGVXaGVuQ29uZGl0aW9ucyggY29yZSwgcmVzb3VyY2UuYXBpX3doZW4gKTtcbiAgICAgICAgICAgICAgICBpZiggIXdoZW4gKXtcbiAgICAgICAgICAgICAgICAgIFBvcExvZy5pbmZvKCB0aGlzLm5hbWUsIGBzZXRDb2xsZWN0aW9uOiBjb25kaXRpb24gbm90IG1ldGAsIHJlc291cmNlICk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJlcXVlc3RfbWFwLnB1c2goIHJlc291cmNlS2V5ICk7XG4gICAgICAgICAgICAgIGlmKCBJc09iamVjdCggcmVzb3VyY2UuYXBpX3BhdGhfdmFycywgdHJ1ZSApICYmIGNvcmUgKXtcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyggcmVzb3VyY2UuYXBpX3BhdGhfdmFycyApLm1hcCggKCB2YXJLZXkgKSA9PiB7XG4gICAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICAgIGlmKCBTdHJpbmcoIHJlc291cmNlLmFwaV9wYXRoX3ZhcnNbIHZhcktleSBdICkuaW5jbHVkZXMoICcuJyApICl7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gPGFueT5TdG9yYWdlR2V0dGVyKCBjb3JlLCBTdHJpbmcoIHJlc291cmNlLmFwaV9wYXRoX3ZhcnNbIHZhcktleSBdICkuc3BsaXQoICcuJyApICk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpZiggIXZhbHVlICkgdmFsdWUgPSBQYXJzZU1vZGVsVmFsdWUoIFN0cmluZyggcmVzb3VyY2UuYXBpX3BhdGhfdmFyc1sgdmFyS2V5IF0gKSApO1xuICAgICAgICAgICAgICAgICAgaWYoIHZhbHVlICl7XG4gICAgICAgICAgICAgICAgICAgIHBhdGggPSBTdHJpbmdSZXBsYWNlQWxsKCBwYXRoLCBgOiR7dmFyS2V5fWAsIHZhbHVlICk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBJc09iamVjdCggcmVzb3VyY2UuYXBpX3BhcmFtcywgdHJ1ZSApID8gcmVzb3VyY2UuYXBpX3BhcmFtcyA6IHt9O1xuICAgICAgICAgICAgICBpZiggSXNPYmplY3QoIGJvZHkgKSApe1xuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKCBib2R5ICkubWFwKCAoIGtleTogc3RyaW5nICkgPT4ge1xuICAgICAgICAgICAgICAgICAgYm9keVsga2V5IF0gPSBQYXJzZU1vZGVsVmFsdWUoIGJvZHlbIGtleSBdLCBjb3JlICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYoICtyZXNvdXJjZS5hcGlfY2FjaGUgKXtcbiAgICAgICAgICAgICAgICBQb3BMb2cuaW5mbyggdGhpcy5uYW1lLCBgY2FjaGVkIHJlc291cmNlYCwgcmVzb3VyY2UgKTtcbiAgICAgICAgICAgICAgICBhcGlfcmVxdWVzdHMucHVzaCggdGhpcy5jYWNoZS5nZXQoICdyZXNvdXJjZScsIHBhdGgsIFBvcFJlcXVlc3QuZG9HZXQoIHBhdGgsIGJvZHksIHJlc291cmNlLmFwaV92ZXJzaW9uICksIDM2MDAwMDAgKSApO1xuICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBhcGlfcmVxdWVzdHMucHVzaCggUG9wUmVxdWVzdC5kb0dldCggcGF0aCwgYm9keSwgcmVzb3VyY2UuYXBpX3ZlcnNpb24gKSApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgICBpZiggYXBpX3JlcXVlc3RzLmxlbmd0aCApe1xuICAgICAgICBmb3JrSm9pbiggYXBpX3JlcXVlc3RzICkuc3Vic2NyaWJlKCAoIHJlc3VsdHMgKSA9PiB7XG4gICAgICAgICAgcmVzdWx0cy5tYXAoICggcmVzOiBhbnksIGluZGV4ICkgPT4ge1xuICAgICAgICAgICAgcmVzID0gcmVzLmRhdGEgPyByZXMuZGF0YSA6IHJlcztcbiAgICAgICAgICAgIHJlc291cmNlID0gPFJlc291cmNlQ29uZmlnPmNvbGxlY3Rpb25bIHJlcXVlc3RfbWFwWyBpbmRleCBdIF07XG4gICAgICAgICAgICBsZXQgZGF0YVRhcmdldDtcbiAgICAgICAgICAgIGlmKCBJc0FycmF5KCByZXMsIGZhbHNlICkgKXtcbiAgICAgICAgICAgICAgZGF0YVRhcmdldCA9IHJlc291cmNlLmRhdGFfc3RvcmFnZSA/IHJlc291cmNlLmRhdGFfc3RvcmFnZSA6ICdkYXRhX3ZhbHVlcyc7XG4gICAgICAgICAgICAgIGlmKCBJc09iamVjdCggY29sbGVjdGlvblsgcmVxdWVzdF9tYXBbIGluZGV4IF0gXS5kYXRhX2ZpbHRlciwgdHJ1ZSApICl7XG4gICAgICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoIHJlc291cmNlLmRhdGFfZmlsdGVyICkubWFwKCAoIGZpbHRlcktleTogc3RyaW5nICkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXMgPSByZXMuZmlsdGVyKCAoIGl0ZW0gKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgbGV0IGZpbHRlcktleVZhbHVlID0gcmVzb3VyY2UuZGF0YV9maWx0ZXJbIGZpbHRlcktleSBdO1xuICAgICAgICAgICAgICAgICAgICAgIGlmKCBTdHJpbmcoIGZpbHRlcktleVZhbHVlICkuaW5jbHVkZXMoICcuJyApICl7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJLZXlWYWx1ZSA9IDxhbnk+U3RvcmFnZUdldHRlciggY29yZSwgU3RyaW5nKCBmaWx0ZXJLZXlWYWx1ZSApLnNwbGl0KCAnLicgKSApO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBpZiggIWZpbHRlcktleVZhbHVlICkgZmlsdGVyS2V5VmFsdWUgPSBQYXJzZU1vZGVsVmFsdWUoIFN0cmluZyggcmVzb3VyY2UuZGF0YV9maWx0ZXJbIGZpbHRlcktleSBdICkgKTtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbVsgZmlsdGVyS2V5IF0gPT0gZmlsdGVyS2V5VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9Y2F0Y2goIGUgKXtcbiAgICAgICAgICAgICAgICAgIFBvcExvZy53YXJuKCB0aGlzLm5hbWUsIGBzZXRDb2xsZWN0aW9uYCwgZSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJlcyA9IElzQ2FsbGFibGVGdW5jdGlvbiggcmVzb3VyY2UuZGF0YV9kZWNvcmF0b3IgKSA/IHJlcy5tYXAoIHggPT4gcmVzb3VyY2UuZGF0YV9kZWNvcmF0b3IoIGNvcmUsIHggKSApIDogcmVzO1xuXG4gICAgICAgICAgICAgIGlmKCBJc0FycmF5KCByZXNvdXJjZS5kYXRhX3doZW4sIHRydWUgKSApe1xuICAgICAgICAgICAgICAgIC8vIEV2YWx1YXRlTW9kZWxDb25kaXRpb25hbHMoKTtcbiAgICAgICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgICByZXMgPSByZXMuZmlsdGVyKCAoIGl0ZW0gKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBFdmFsdWF0ZVdoZW5Db25kaXRpb25zKCBpdGVtLCByZXNvdXJjZS5kYXRhX3doZW4sIGNvcmUgKTtcbiAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9Y2F0Y2goIGUgKXtcbiAgICAgICAgICAgICAgICAgIFBvcExvZy53YXJuKCB0aGlzLm5hbWUsIGBzZXRDb2xsZWN0aW9uYCwgZSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmKCBJc0NhbGxhYmxlRnVuY3Rpb24oIHJlc291cmNlLmRhdGFfc2V0dGVyICkgKSByZXMgPSA8YW55W10+cmVzb3VyY2UuZGF0YV9zZXR0ZXIoIGNvcmUsIHJlcyApO1xuICAgICAgICAgICAgICByZXNvdXJjZVsgZGF0YVRhcmdldCBdID0gcmVzO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIGRhdGFUYXJnZXQgPSByZXNvdXJjZS5kYXRhX3N0b3JhZ2UgPyByZXNvdXJjZS5kYXRhX3N0b3JhZ2UgOiAnZGF0YSc7XG4gICAgICAgICAgICAgIHJlc291cmNlWyBkYXRhVGFyZ2V0IF0gPSBJc0NhbGxhYmxlRnVuY3Rpb24oIHJlc291cmNlLmRhdGFfZGVjb3JhdG9yICkgPyByZXNvdXJjZS5kYXRhX2RlY29yYXRvciggY29yZSwgcmVzICkgOiByZXM7XG4gICAgICAgICAgICAgIGlmKCBJc0NhbGxhYmxlRnVuY3Rpb24oIHJlc291cmNlLmRhdGFfc2V0dGVyICkgKSByZXNvdXJjZVsgZGF0YVRhcmdldCBdID0gPGFueVtdPnJlc291cmNlLmRhdGFfc2V0dGVyKCBjb3JlLCByZXNvdXJjZVsgZGF0YVRhcmdldCBdICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSApO1xuICAgICAgICAgIHJlc29sdmUoIHRydWUgKTtcbiAgICAgICAgfSwgZXJyID0+IHtcbiAgICAgICAgICByZXNvbHZlKCBmYWxzZSApO1xuICAgICAgICB9ICk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfVxuXG5cblxuICAvKipcbiAgICogVGhpcyBmeCB3aWxsIGV4dHJhY3QgdGhlIGRhdGEgZnJvbSBhIHJlc291cmNlIGNvbGxlY3Rpb25cbiAgICogQHBhcmFtIGNvbGxlY3Rpb25cbiAgICogQHBhcmFtIGNvcmVcbiAgICovXG4gIGdldENvbGxlY3Rpb24oIGNvbGxlY3Rpb246IERpY3Rpb25hcnk8UmVzb3VyY2VDb25maWc+LCApe1xuICAgIGNvbnN0IHN0b3JlID0ge307XG4gICAgaWYoIElzT2JqZWN0KCBjb2xsZWN0aW9uLCB0cnVlICkgKXtcbiAgICAgIE9iamVjdC5rZXlzKCBjb2xsZWN0aW9uICkubWFwKCAoIHJlc291cmNlS2V5ICkgPT4ge1xuICAgICAgICBjb25zdCByZXNvdXJjZSA9IGNvbGxlY3Rpb25bIHJlc291cmNlS2V5IF07XG4gICAgICAgIHN0b3JlWyByZXNvdXJjZS5uYW1lIF0gPSBDbGVhbk9iamVjdCggbmV3IFJlc291cmNlQ29uZmlnKCByZXNvdXJjZSApICk7XG4gICAgICB9ICk7XG4gICAgfVxuICAgIHJldHVybiBzdG9yZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgZnggd2lsbCByZWxvYWQgYSBzaW5nbGUgZXhpc3RpbmcgcmVzb3VyY2VcbiAgICogQHBhcmFtIGNvbGxlY3Rpb25cbiAgICovXG4gIHJlbG9hZFJlc291cmNlKCBjb3JlOiBDb3JlQ29uZmlnLCByZXNvdXJjZTogUmVzb3VyY2VDb25maWcgKTogUHJvbWlzZTxSZXNvdXJjZUNvbmZpZz57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFJlc291cmNlQ29uZmlnPiggKCByZXNvbHZlICkgPT4ge1xuICAgICAgaWYoIElzT2JqZWN0KCByZXNvdXJjZSwgWyAnYXBpX3BhdGgnIF0gJiYgcmVzb3VyY2UuYXBpX3BhdGggJiYgSXNTdHJpbmcoIHJlc291cmNlLmFwaV9wYXRoLCB0cnVlICkgKSApe1xuICAgICAgICBsZXQgcGF0aCA9IHJlc291cmNlLmFwaV9wYXRoO1xuICAgICAgICBpZihyZXNvdXJjZS5jYW5fcmVhZCAmJiAhUG9wRW50aXR5LmNoZWNrQWNjZXNzKHJlc291cmNlLmNhbl9yZWFkLCAnY2FuX3JlYWQnKSkge1xuICAgICAgICAgIFBvcExvZy5kZWJ1ZyggdGhpcy5uYW1lLCBgcmVsb2FkUmVzb3VyY2U6IENhbm5vdCByZWFkIHJlc291cmNlOiR7cmVzb3VyY2UuY2FuX3JlYWR9YCApO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKCByZXNvdXJjZSApO1xuICAgICAgICB9XG4gICAgICAgIGlmKCBJc0FycmF5KCByZXNvdXJjZS5hcGlfd2hlbiwgdHJ1ZSApICYmIElzT2JqZWN0KCBjb3JlLCB0cnVlICkgKXtcbiAgICAgICAgICBjb25zdCB3aGVuID0gRXZhbHVhdGVXaGVuQ29uZGl0aW9ucyggY29yZSwgcmVzb3VyY2UuYXBpX3doZW4gKTtcbiAgICAgICAgICBpZiggIXdoZW4gKXtcbiAgICAgICAgICAgIFBvcExvZy5kZWJ1ZyggdGhpcy5uYW1lLCAncmVsb2FkUmVzb3VyY2U6IGNvbmRpdGlvbiBub3QgbWV0JyApO1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoIHJlc291cmNlICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKCBJc09iamVjdCggcmVzb3VyY2UuYXBpX3BhdGhfdmFycywgdHJ1ZSApICYmIGNvcmUgKXtcbiAgICAgICAgICBPYmplY3Qua2V5cyggcmVzb3VyY2UuYXBpX3BhdGhfdmFycyApLm1hcCggKCB2YXJLZXkgKSA9PiB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSAnJztcbiAgICAgICAgICAgIGlmKCBTdHJpbmcoIHJlc291cmNlLmFwaV9wYXRoX3ZhcnNbIHZhcktleSBdICkuaW5jbHVkZXMoICcuJyApICl7XG4gICAgICAgICAgICAgIHZhbHVlID0gPGFueT5TdG9yYWdlR2V0dGVyKCBjb3JlLCBTdHJpbmcoIHJlc291cmNlLmFwaV9wYXRoX3ZhcnNbIHZhcktleSBdICkuc3BsaXQoICcuJyApICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiggIXZhbHVlICkgdmFsdWUgPSBQYXJzZU1vZGVsVmFsdWUoIFN0cmluZyggcmVzb3VyY2UuYXBpX3BhdGhfdmFyc1sgdmFyS2V5IF0gKSApO1xuICAgICAgICAgICAgaWYoIHZhbHVlICl7XG4gICAgICAgICAgICAgIHBhdGggPSBTdHJpbmdSZXBsYWNlQWxsKCBwYXRoLCBgOiR7dmFyS2V5fWAsIHZhbHVlICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJvZHkgPSBJc09iamVjdCggcmVzb3VyY2UuYXBpX3BhcmFtcywgdHJ1ZSApID8gcmVzb3VyY2UuYXBpX3BhcmFtcyA6IHt9O1xuICAgICAgICBpZiggSXNPYmplY3QoIGJvZHkgKSApe1xuICAgICAgICAgIE9iamVjdC5rZXlzKCBib2R5ICkubWFwKCAoIGtleTogc3RyaW5nICkgPT4ge1xuICAgICAgICAgICAgYm9keVsga2V5IF0gPSBQYXJzZU1vZGVsVmFsdWUoIGJvZHlbIGtleSBdLCBjb3JlICk7XG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG5cbiAgICAgICAgUG9wUmVxdWVzdC5kb0dldCggcGF0aCwgYm9keSwgcmVzb3VyY2UuYXBpX3ZlcnNpb24gKS5zdWJzY3JpYmUoICggcmVzICkgPT4ge1xuICAgICAgICAgIHJlcyA9IEdldEh0dHBSZXN1bHQoIHJlcyApO1xuICAgICAgICAgIGxldCBkYXRhVGFyZ2V0O1xuICAgICAgICAgIFBvcExvZy5kZWJ1ZyggdGhpcy5uYW1lLCAncmVsb2FkUmVzb3VyY2U6IHBhc3MgNCcgKTtcbiAgICAgICAgICBpZiggSXNBcnJheSggcmVzLCBmYWxzZSApICl7XG4gICAgICAgICAgICBkYXRhVGFyZ2V0ID0gcmVzb3VyY2UuZGF0YV9zdG9yYWdlID8gcmVzb3VyY2UuZGF0YV9zdG9yYWdlIDogJ2RhdGFfdmFsdWVzJztcbiAgICAgICAgICAgIGlmKCBJc09iamVjdCggcmVzb3VyY2UuZGF0YV9maWx0ZXIsIHRydWUgKSApe1xuICAgICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoIHJlc291cmNlLmRhdGFfZmlsdGVyICkubWFwKCAoIGZpbHRlcktleTogc3RyaW5nICkgPT4ge1xuICAgICAgICAgICAgICAgICAgcmVzID0gcmVzLmZpbHRlciggKCBpdGVtICkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZmlsdGVyS2V5VmFsdWUgPSByZXNvdXJjZS5kYXRhX2ZpbHRlclsgZmlsdGVyS2V5IF07XG4gICAgICAgICAgICAgICAgICAgIGlmKCBTdHJpbmcoIGZpbHRlcktleVZhbHVlICkuaW5jbHVkZXMoICcuJyApICl7XG4gICAgICAgICAgICAgICAgICAgICAgZmlsdGVyS2V5VmFsdWUgPSA8YW55PlN0b3JhZ2VHZXR0ZXIoIGNvcmUsIFN0cmluZyggZmlsdGVyS2V5VmFsdWUgKS5zcGxpdCggJy4nICkgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiggIWZpbHRlcktleVZhbHVlICkgZmlsdGVyS2V5VmFsdWUgPSBQYXJzZU1vZGVsVmFsdWUoIFN0cmluZyggcmVzb3VyY2UuZGF0YV9maWx0ZXJbIGZpbHRlcktleSBdICkgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1bIGZpbHRlcktleSBdID09IGZpbHRlcktleVZhbHVlO1xuICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgfWNhdGNoKCBlICl7XG4gICAgICAgICAgICAgICAgUG9wTG9nLndhcm4oIHRoaXMubmFtZSwgYHNldENvbGxlY3Rpb25gLCBlICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoIElzQXJyYXkoIHJlc291cmNlLmRhdGFfd2hlbiwgdHJ1ZSApICl7XG4gICAgICAgICAgICAgIC8vIEV2YWx1YXRlTW9kZWxDb25kaXRpb25hbHMoKTtcbiAgICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHJlcyA9IHJlcy5maWx0ZXIoICggaXRlbSApID0+IHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBFdmFsdWF0ZVdoZW5Db25kaXRpb25zKCBpdGVtLCByZXNvdXJjZS5kYXRhX3doZW4sIGNvcmUgKTtcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgIH1jYXRjaCggZSApe1xuICAgICAgICAgICAgICAgIFBvcExvZy53YXJuKCB0aGlzLm5hbWUsIGBzZXRDb2xsZWN0aW9uYCwgZSApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNvdXJjZVsgZGF0YVRhcmdldCBdID0gSXNDYWxsYWJsZUZ1bmN0aW9uKCByZXNvdXJjZS5kYXRhX2RlY29yYXRvciApID8gcmVzLm1hcCggeCA9PiByZXNvdXJjZS5kYXRhX2RlY29yYXRvciggY29yZSwgeCApICkgOiByZXM7XG4gICAgICAgICAgICBpZiggSXNDYWxsYWJsZUZ1bmN0aW9uKCByZXNvdXJjZS5kYXRhX3NldHRlciApICkgcmVzb3VyY2VbIGRhdGFUYXJnZXQgXSA9IDxhbnlbXT5yZXNvdXJjZS5kYXRhX3NldHRlciggY29yZSwgcmVzb3VyY2VbIGRhdGFUYXJnZXQgXSApO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgZGF0YVRhcmdldCA9IHJlc291cmNlLmRhdGFfc3RvcmFnZSA/IHJlc291cmNlLmRhdGFfc3RvcmFnZSA6ICdkYXRhJztcbiAgICAgICAgICAgIHJlc291cmNlWyBkYXRhVGFyZ2V0IF0gPSBJc0NhbGxhYmxlRnVuY3Rpb24oIHJlc291cmNlLmRhdGFfZGVjb3JhdG9yICkgPyByZXNvdXJjZS5kYXRhX2RlY29yYXRvciggY29yZSwgcmVzICkgOiByZXM7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXNvbHZlKCByZXNvdXJjZSApO1xuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoIHJlc291cmNlICk7XG4gICAgICAgIH0gKTtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSggcmVzb3VyY2UgKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gIH1cblxuXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxufVxuIl19