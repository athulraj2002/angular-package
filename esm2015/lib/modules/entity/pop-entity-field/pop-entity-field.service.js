import { Injectable } from '@angular/core';
import { PopRequestService } from '../../../services/pop-request.service';
import { PopLog, ServiceInjector } from '../../../pop-common.model';
import { PopExtendService } from '../../../services/pop-extend.service';
import { GetHttpErrorMsg, IsArray, IsDefined, IsObject, JsonCopy, StringReplaceAll } from '../../../pop-common-utility';
import { EntityFieldSetting } from './pop-entity-field.setting';
import { FieldItemModelConfig, IsValidFieldPatchEvent, ParseUrlForParams } from '../pop-entity-utility';
import * as i0 from "@angular/core";
export class PopEntityFieldService extends PopExtendService {
    constructor() {
        super();
        this.name = 'PopEntityFieldService';
        this.srv = {
            request: ServiceInjector.get(PopRequestService)
        };
        PopLog.init(this.name, 'init', this);
    }
    // /**
    //  * Ensure that at least 1 label exists
    //  * @param field
    //  */
    // setFieldEntries(field: FieldInterface): Promise<boolean>{
    //   return new Promise<boolean>((resolve) => {
    //     if( !( IsArray(field.entries, true) ) ){
    //       const entry = {
    //         name: TitleCase(`${field.fieldgroup.name} 1`),
    //         type: 'provided'
    //       };
    //       this.srv.request.doPost(`fields/${field.id}/entries`, entry, 1, false).subscribe((res) => {
    //         res = res.data ? res.data : res;
    //         field.entries = [ res ];
    //         return resolve(true);
    //       }, (err) => {
    //         PopLog.error(this.name, `_setFieldEntryValues`, GetHttpErrorMsg(err));
    //         return resolve(false);
    //       });
    //     }else{
    //       return resolve(true);
    //     }
    //   });
    // }
    // /**
    //  * Ensure that the field has the correct amount of values
    //  * @param field
    //  */
    // setFieldValues(field: FieldInterface): Promise<boolean>{
    //   return new Promise<boolean>((resolve) => {
    //
    //     if( IsArray(field.entries, true) ){
    //       const realDataKeys = Object.keys(field.data).filter((id) => +id > 0);
    //       const api = [];
    //       if( !realDataKeys.length ){
    //         console.log('create default value for  ', realDataKeys, field);
    //         api.push(1);
    //       }
    //       if(field.multiple){
    //         let neededValues = field.multiple_min - realDataKeys.length;
    //         console.log('needed', neededValues);
    //         while(neededValues){
    //           api.push(1);
    //           neededValues--;
    //         }
    //
    //       }
    //       console.log('should have values', api)
    //
    //       return resolve(true);
    //     }else{
    //       return resolve(false);
    //     }
    //   });
    // }
    addEntryValue(core, field) {
        const dataIndex = field.data_keys.length;
        const entry = dataIndex in field.entries ? field.entries[dataIndex] : null;
        if (IsObject(entry, ['id'])) {
            console.log('entry', entry);
            const item = {
                data: {},
                entry: entry,
                config: {},
                index: dataIndex
            };
            Object.keys(field.children).map((name) => {
                const fieldItem = JsonCopy(field.children[name]);
                fieldItem.model.value = null; // clear any value that might have been stored from previous entry
                item.data[name] = null;
                fieldItem.model.facade = true;
                item.config[name] = FieldItemModelConfig(core, fieldItem.model);
            });
            return item;
        }
        else {
            console.log('fail', entry);
            return null;
        }
    }
    removeEntryValue(core, field, dataKey) {
        return new Promise((resolve) => {
            console.log('removeEntryValue', core, field, dataKey);
            const data = field.data[dataKey];
            if (IsObject(data, ['id'])) {
                const body = {};
                const path = StringReplaceAll(ParseUrlForParams(`#path/#entityId`, core.params), '//', '/');
                body[field.name] = {
                    field_entry_id: dataKey,
                    id: data.id
                };
                this.srv.request.doDelete(path, body, 1, false).subscribe((res) => {
                    if (res.data)
                        res = res.data;
                    console.log('removeEntryValue', res);
                    return resolve(true);
                }, () => {
                    return resolve(false);
                });
            }
            else {
                return resolve(true);
            }
        });
    }
    /**
     * Update a value for a single field item column of a field record
     * @param core
     * @param field
     * @param event
     */
    updateFieldItem(core, field, event) {
        return new Promise((resolve) => {
            if (IsValidFieldPatchEvent(core, event)) {
                const patch = {};
                const path = StringReplaceAll(ParseUrlForParams(`#path/#entityId`, core.params), '//', '/');
                patch[field.name] = {
                    field_entry_id: +event.data_key,
                    field_id: +field.id,
                    id: field.data[event.data_key].id ? field.data[event.data_key].id : null
                };
                patch[field.name][event.column] = event.config.control.value;
                this.srv.request.doPatch(path, patch, 1, false).subscribe((res) => {
                    if (res.data)
                        res = res.data;
                    const value = res[field.name].record[event.column];
                    field.data[event.data_key].id = res[field.name].record.id;
                    field.data[event.data_key][event.column] = value;
                    // if( IsObject(core.entity[ field.name ], true) ){
                    //   core.entity[ field.name ][ event.column ] = value;
                    // }else if( IsArray(core.entity[ field.name ], true) ){
                    //   console.log('session the data', core.entity[ field.name ], value);
                    // }
                    return resolve(true);
                }, (err) => {
                    const fieldPatch = event.config.patch;
                    const control = event.config.control;
                    fieldPatch.running = false;
                    control.markAsDirty();
                    control.setValue(this.asset.storedValue);
                    control.setErrors({ server: true });
                    event.config.message = GetHttpErrorMsg(err);
                    return resolve(false);
                });
            }
        });
    }
    /**
     * Set any field settings for this field & field items, and apply and stored values
     * @param field
     * @param settings
     */
    setFieldCustomSetting(field, settings) {
        const stored = field.configs;
        if (IsObject(field, ['fieldgroup', 'configs']) && IsObject(settings)) {
            settings = JSON.parse(JSON.stringify(Object.assign(Object.assign({}, EntityFieldSetting), settings)));
            Object.keys(settings).map((name) => {
                const setting = settings[name];
                if (IsObject(setting, true)) {
                    const value = IsDefined(setting.value, false) ? setting.value : setting.defaultValue;
                    setting.value = value;
                    if (setting.item && IsObject(field.children, [setting.item])) {
                        field.children[setting.item].custom_setting[name] = setting;
                        field.children[setting.item].setting[name] = value;
                    }
                    else {
                        field.custom_setting[name] = setting;
                        field.setting[name] = value;
                    }
                }
            });
            const childrenIdLookup = {};
            Object.keys(field.children).map((name) => {
                childrenIdLookup[field.children[name].id] = name;
            });
            if (IsArray(stored.field_configs, true)) {
                stored.field_configs.map((setting) => {
                    if (!field.custom_setting[setting.name]) {
                        // ToDo:: Do We want to allow the database to pass in configs that are not local?
                        PopLog.warn(this.name, `setFieldCustomSettingDefaults: setting no longer defined`, setting);
                        // field.custom_setting[ setting.name ] = setting;
                    }
                    else {
                        field.custom_setting[setting.name].id = setting.id;
                        field.custom_setting[setting.name].value = setting.value;
                    }
                    field.setting[setting.name] = setting.value;
                });
            }
            if (IsObject(stored.item_configs, true)) {
                Object.keys(stored.item_configs).map((fieldItemId) => {
                    const fieldItemConfigs = stored.item_configs[fieldItemId];
                    if (IsArray(fieldItemConfigs, true)) {
                        fieldItemConfigs.map((setting) => {
                            if (setting.field_id in childrenIdLookup) {
                                const item = field.children[childrenIdLookup[setting.field_id]];
                                // if( !item.custom_setting ) item.custom_setting = {};
                                if (!item.custom_setting[setting.name]) {
                                    // ToDo:: Do We want to allow the database to pass in configs that are not local
                                    PopLog.warn(this.name, `setFieldCustomSettingDefaults: setting no longer defined`, setting);
                                    // item.custom_setting[ setting.name ] = setting;
                                }
                                else {
                                    item.custom_setting[setting.name].id = setting.id;
                                    item.custom_setting[setting.name].value = setting.value;
                                }
                                // if( !item.setting ) item.setting = {};
                                item.setting[setting.name] = setting.value;
                                console.log('here', setting.name, { item: item, setting: setting });
                            }
                        });
                    }
                });
            }
        }
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    _my() {
        return true;
    }
}
PopEntityFieldService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopEntityFieldService_Factory() { return new PopEntityFieldService(); }, token: PopEntityFieldService, providedIn: "root" });
PopEntityFieldService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
PopEntityFieldService.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1maWVsZC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktZmllbGQvcG9wLWVudGl0eS1maWVsZC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sdUNBQXVDLENBQUM7QUFDeEUsT0FBTyxFQU9MLE1BQU0sRUFDTixlQUFlLEVBQ2hCLE1BQU0sMkJBQTJCLENBQUM7QUFDbkMsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sc0NBQXNDLENBQUM7QUFDdEUsT0FBTyxFQUVMLGVBQWUsRUFDZixPQUFPLEVBQ1AsU0FBUyxFQUNULFFBQVEsRUFDUixRQUFRLEVBQ1IsZ0JBQWdCLEVBQ2pCLE1BQU0sNkJBQTZCLENBQUM7QUFDckMsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDOUQsT0FBTyxFQUFDLG9CQUFvQixFQUFFLHNCQUFzQixFQUFFLGlCQUFpQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7O0FBS3RHLE1BQU0sT0FBTyxxQkFBc0IsU0FBUSxnQkFBZ0I7SUFVekQ7UUFDRSxLQUFLLEVBQUUsQ0FBQztRQVZBLFNBQUksR0FBRyx1QkFBdUIsQ0FBQztRQUUvQixRQUFHLEdBRVQ7WUFDRixPQUFPLEVBQUUsZUFBZSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQztTQUNoRCxDQUFDO1FBS0EsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBR0QsTUFBTTtJQUNOLHlDQUF5QztJQUN6QyxrQkFBa0I7SUFDbEIsTUFBTTtJQUNO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QUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtQb3BSZXF1ZXN0U2VydmljZX0gZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvcG9wLXJlcXVlc3Quc2VydmljZSc7XG5pbXBvcnQge1xuICBDb3JlQ29uZmlnLFxuICBEaWN0aW9uYXJ5LFxuICBGaWVsZENvbmZpZyxcbiAgRmllbGRDdXN0b21TZXR0aW5nSW50ZXJmYWNlLFxuICBGaWVsZEl0ZW1QYXRjaEludGVyZmFjZSxcbiAgUG9wQmFzZUV2ZW50SW50ZXJmYWNlLFxuICBQb3BMb2csXG4gIFNlcnZpY2VJbmplY3RvclxufSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7UG9wRXh0ZW5kU2VydmljZX0gZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvcG9wLWV4dGVuZC5zZXJ2aWNlJztcbmltcG9ydCB7XG4gIENvbnZlcnRPYmplY3RUb1VyaSxcbiAgR2V0SHR0cEVycm9yTXNnLFxuICBJc0FycmF5LFxuICBJc0RlZmluZWQsXG4gIElzT2JqZWN0LFxuICBKc29uQ29weSwgU3RvcmFnZUdldHRlcixcbiAgU3RyaW5nUmVwbGFjZUFsbFxufSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHtFbnRpdHlGaWVsZFNldHRpbmd9IGZyb20gJy4vcG9wLWVudGl0eS1maWVsZC5zZXR0aW5nJztcbmltcG9ydCB7RmllbGRJdGVtTW9kZWxDb25maWcsIElzVmFsaWRGaWVsZFBhdGNoRXZlbnQsIFBhcnNlVXJsRm9yUGFyYW1zfSBmcm9tICcuLi9wb3AtZW50aXR5LXV0aWxpdHknO1xuaW1wb3J0IHtGb3JtQ29udHJvbH0gZnJvbSBcIkBhbmd1bGFyL2Zvcm1zXCI7XG5cblxuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5RmllbGRTZXJ2aWNlIGV4dGVuZHMgUG9wRXh0ZW5kU2VydmljZSB7XG4gIHByb3RlY3RlZCBuYW1lID0gJ1BvcEVudGl0eUZpZWxkU2VydmljZSc7XG5cbiAgcHJvdGVjdGVkIHNydjoge1xuICAgIHJlcXVlc3Q6IFBvcFJlcXVlc3RTZXJ2aWNlLFxuICB9ID0ge1xuICAgIHJlcXVlc3Q6IFNlcnZpY2VJbmplY3Rvci5nZXQoUG9wUmVxdWVzdFNlcnZpY2UpXG4gIH07XG5cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIFBvcExvZy5pbml0KHRoaXMubmFtZSwgJ2luaXQnLCB0aGlzKTtcbiAgfVxuXG5cbiAgLy8gLyoqXG4gIC8vICAqIEVuc3VyZSB0aGF0IGF0IGxlYXN0IDEgbGFiZWwgZXhpc3RzXG4gIC8vICAqIEBwYXJhbSBmaWVsZFxuICAvLyAgKi9cbiAgLy8gc2V0RmllbGRFbnRyaWVzKGZpZWxkOiBGaWVsZEludGVyZmFjZSk6IFByb21pc2U8Ym9vbGVhbj57XG4gIC8vICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KChyZXNvbHZlKSA9PiB7XG4gIC8vICAgICBpZiggISggSXNBcnJheShmaWVsZC5lbnRyaWVzLCB0cnVlKSApICl7XG4gIC8vICAgICAgIGNvbnN0IGVudHJ5ID0ge1xuICAvLyAgICAgICAgIG5hbWU6IFRpdGxlQ2FzZShgJHtmaWVsZC5maWVsZGdyb3VwLm5hbWV9IDFgKSxcbiAgLy8gICAgICAgICB0eXBlOiAncHJvdmlkZWQnXG4gIC8vICAgICAgIH07XG4gIC8vICAgICAgIHRoaXMuc3J2LnJlcXVlc3QuZG9Qb3N0KGBmaWVsZHMvJHtmaWVsZC5pZH0vZW50cmllc2AsIGVudHJ5LCAxLCBmYWxzZSkuc3Vic2NyaWJlKChyZXMpID0+IHtcbiAgLy8gICAgICAgICByZXMgPSByZXMuZGF0YSA/IHJlcy5kYXRhIDogcmVzO1xuICAvLyAgICAgICAgIGZpZWxkLmVudHJpZXMgPSBbIHJlcyBdO1xuICAvLyAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAvLyAgICAgICB9LCAoZXJyKSA9PiB7XG4gIC8vICAgICAgICAgUG9wTG9nLmVycm9yKHRoaXMubmFtZSwgYF9zZXRGaWVsZEVudHJ5VmFsdWVzYCwgR2V0SHR0cEVycm9yTXNnKGVycikpO1xuICAvLyAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgLy8gICAgICAgfSk7XG4gIC8vICAgICB9ZWxzZXtcbiAgLy8gICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gIC8vICAgICB9XG4gIC8vICAgfSk7XG4gIC8vIH1cblxuXG4gIC8vIC8qKlxuICAvLyAgKiBFbnN1cmUgdGhhdCB0aGUgZmllbGQgaGFzIHRoZSBjb3JyZWN0IGFtb3VudCBvZiB2YWx1ZXNcbiAgLy8gICogQHBhcmFtIGZpZWxkXG4gIC8vICAqL1xuICAvLyBzZXRGaWVsZFZhbHVlcyhmaWVsZDogRmllbGRJbnRlcmZhY2UpOiBQcm9taXNlPGJvb2xlYW4+e1xuICAvLyAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPigocmVzb2x2ZSkgPT4ge1xuICAvL1xuICAvLyAgICAgaWYoIElzQXJyYXkoZmllbGQuZW50cmllcywgdHJ1ZSkgKXtcbiAgLy8gICAgICAgY29uc3QgcmVhbERhdGFLZXlzID0gT2JqZWN0LmtleXMoZmllbGQuZGF0YSkuZmlsdGVyKChpZCkgPT4gK2lkID4gMCk7XG4gIC8vICAgICAgIGNvbnN0IGFwaSA9IFtdO1xuICAvLyAgICAgICBpZiggIXJlYWxEYXRhS2V5cy5sZW5ndGggKXtcbiAgLy8gICAgICAgICBjb25zb2xlLmxvZygnY3JlYXRlIGRlZmF1bHQgdmFsdWUgZm9yICAnLCByZWFsRGF0YUtleXMsIGZpZWxkKTtcbiAgLy8gICAgICAgICBhcGkucHVzaCgxKTtcbiAgLy8gICAgICAgfVxuICAvLyAgICAgICBpZihmaWVsZC5tdWx0aXBsZSl7XG4gIC8vICAgICAgICAgbGV0IG5lZWRlZFZhbHVlcyA9IGZpZWxkLm11bHRpcGxlX21pbiAtIHJlYWxEYXRhS2V5cy5sZW5ndGg7XG4gIC8vICAgICAgICAgY29uc29sZS5sb2coJ25lZWRlZCcsIG5lZWRlZFZhbHVlcyk7XG4gIC8vICAgICAgICAgd2hpbGUobmVlZGVkVmFsdWVzKXtcbiAgLy8gICAgICAgICAgIGFwaS5wdXNoKDEpO1xuICAvLyAgICAgICAgICAgbmVlZGVkVmFsdWVzLS07XG4gIC8vICAgICAgICAgfVxuICAvL1xuICAvLyAgICAgICB9XG4gIC8vICAgICAgIGNvbnNvbGUubG9nKCdzaG91bGQgaGF2ZSB2YWx1ZXMnLCBhcGkpXG4gIC8vXG4gIC8vICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAvLyAgICAgfWVsc2V7XG4gIC8vICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgLy8gICAgIH1cbiAgLy8gICB9KTtcbiAgLy8gfVxuXG4gIGFkZEVudHJ5VmFsdWUoY29yZTogQ29yZUNvbmZpZywgZmllbGQ6IEZpZWxkQ29uZmlnKSB7XG5cbiAgICBjb25zdCBkYXRhSW5kZXggPSBmaWVsZC5kYXRhX2tleXMubGVuZ3RoO1xuICAgIGNvbnN0IGVudHJ5ID0gZGF0YUluZGV4IGluIGZpZWxkLmVudHJpZXMgPyBmaWVsZC5lbnRyaWVzW2RhdGFJbmRleF0gOiBudWxsO1xuICAgIGlmIChJc09iamVjdChlbnRyeSwgWydpZCddKSkge1xuICAgICAgY29uc29sZS5sb2coJ2VudHJ5JywgZW50cnkpO1xuICAgICAgY29uc3QgaXRlbSA9IHtcbiAgICAgICAgZGF0YToge30sXG4gICAgICAgIGVudHJ5OiBlbnRyeSxcbiAgICAgICAgY29uZmlnOiB7fSxcbiAgICAgICAgaW5kZXg6IGRhdGFJbmRleFxuICAgICAgfTtcbiAgICAgIE9iamVjdC5rZXlzKGZpZWxkLmNoaWxkcmVuKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgY29uc3QgZmllbGRJdGVtID0gSnNvbkNvcHkoZmllbGQuY2hpbGRyZW5bbmFtZV0pO1xuICAgICAgICBmaWVsZEl0ZW0ubW9kZWwudmFsdWUgPSBudWxsOyAvLyBjbGVhciBhbnkgdmFsdWUgdGhhdCBtaWdodCBoYXZlIGJlZW4gc3RvcmVkIGZyb20gcHJldmlvdXMgZW50cnlcbiAgICAgICAgaXRlbS5kYXRhW25hbWVdID0gbnVsbDtcbiAgICAgICAgZmllbGRJdGVtLm1vZGVsLmZhY2FkZSA9IHRydWU7XG4gICAgICAgIGl0ZW0uY29uZmlnW25hbWVdID0gRmllbGRJdGVtTW9kZWxDb25maWcoY29yZSwgZmllbGRJdGVtLm1vZGVsKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdmYWlsJywgZW50cnkpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cblxuICByZW1vdmVFbnRyeVZhbHVlKGNvcmU6IENvcmVDb25maWcsIGZpZWxkOiBGaWVsZENvbmZpZywgZGF0YUtleTogbnVtYmVyKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZygncmVtb3ZlRW50cnlWYWx1ZScsIGNvcmUsIGZpZWxkLCBkYXRhS2V5KTtcbiAgICAgIGNvbnN0IGRhdGEgPSBmaWVsZC5kYXRhW2RhdGFLZXldO1xuICAgICAgaWYgKElzT2JqZWN0KGRhdGEsIFsnaWQnXSkpIHtcbiAgICAgICAgY29uc3QgYm9keSA9IHt9O1xuICAgICAgICBjb25zdCBwYXRoID0gU3RyaW5nUmVwbGFjZUFsbChQYXJzZVVybEZvclBhcmFtcyhgI3BhdGgvI2VudGl0eUlkYCwgY29yZS5wYXJhbXMpLCAnLy8nLCAnLycpO1xuICAgICAgICBib2R5W2ZpZWxkLm5hbWVdID0ge1xuICAgICAgICAgIGZpZWxkX2VudHJ5X2lkOiBkYXRhS2V5LFxuICAgICAgICAgIGlkOiBkYXRhLmlkXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc3J2LnJlcXVlc3QuZG9EZWxldGUocGF0aCwgYm9keSwgMSwgZmFsc2UpLnN1YnNjcmliZSgocmVzKSA9PiB7XG4gICAgICAgICAgaWYgKHJlcy5kYXRhKSByZXMgPSByZXMuZGF0YTtcbiAgICAgICAgICBjb25zb2xlLmxvZygncmVtb3ZlRW50cnlWYWx1ZScsIHJlcyk7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBhIHZhbHVlIGZvciBhIHNpbmdsZSBmaWVsZCBpdGVtIGNvbHVtbiBvZiBhIGZpZWxkIHJlY29yZFxuICAgKiBAcGFyYW0gY29yZVxuICAgKiBAcGFyYW0gZmllbGRcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuICB1cGRhdGVGaWVsZEl0ZW0oY29yZTogQ29yZUNvbmZpZywgZmllbGQ6IEZpZWxkQ29uZmlnLCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoSXNWYWxpZEZpZWxkUGF0Y2hFdmVudChjb3JlLCBldmVudCkpIHtcbiAgICAgICAgY29uc3QgcGF0Y2ggPSB7fTtcbiAgICAgICAgY29uc3QgcGF0aCA9IFN0cmluZ1JlcGxhY2VBbGwoUGFyc2VVcmxGb3JQYXJhbXMoYCNwYXRoLyNlbnRpdHlJZGAsIGNvcmUucGFyYW1zKSwgJy8vJywgJy8nKTtcbiAgICAgICAgcGF0Y2hbZmllbGQubmFtZV0gPSB7XG4gICAgICAgICAgZmllbGRfZW50cnlfaWQ6ICtldmVudC5kYXRhX2tleSxcbiAgICAgICAgICBmaWVsZF9pZDogK2ZpZWxkLmlkLFxuICAgICAgICAgIGlkOiBmaWVsZC5kYXRhW2V2ZW50LmRhdGFfa2V5XS5pZCA/IGZpZWxkLmRhdGFbZXZlbnQuZGF0YV9rZXldLmlkIDogbnVsbFxuICAgICAgICB9O1xuICAgICAgICBwYXRjaFtmaWVsZC5uYW1lXVtldmVudC5jb2x1bW5dID0gZXZlbnQuY29uZmlnLmNvbnRyb2wudmFsdWU7XG4gICAgICAgIHRoaXMuc3J2LnJlcXVlc3QuZG9QYXRjaChwYXRoLCBwYXRjaCwgMSwgZmFsc2UpLnN1YnNjcmliZSgocmVzKSA9PiB7XG4gICAgICAgICAgaWYgKHJlcy5kYXRhKSByZXMgPSByZXMuZGF0YTtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHJlc1tmaWVsZC5uYW1lXS5yZWNvcmRbZXZlbnQuY29sdW1uXTtcbiAgICAgICAgICBmaWVsZC5kYXRhW2V2ZW50LmRhdGFfa2V5XS5pZCA9IHJlc1tmaWVsZC5uYW1lXS5yZWNvcmQuaWQ7XG4gICAgICAgICAgZmllbGQuZGF0YVtldmVudC5kYXRhX2tleV1bZXZlbnQuY29sdW1uXSA9IHZhbHVlO1xuXG5cbiAgICAgICAgICAvLyBpZiggSXNPYmplY3QoY29yZS5lbnRpdHlbIGZpZWxkLm5hbWUgXSwgdHJ1ZSkgKXtcbiAgICAgICAgICAvLyAgIGNvcmUuZW50aXR5WyBmaWVsZC5uYW1lIF1bIGV2ZW50LmNvbHVtbiBdID0gdmFsdWU7XG4gICAgICAgICAgLy8gfWVsc2UgaWYoIElzQXJyYXkoY29yZS5lbnRpdHlbIGZpZWxkLm5hbWUgXSwgdHJ1ZSkgKXtcbiAgICAgICAgICAvLyAgIGNvbnNvbGUubG9nKCdzZXNzaW9uIHRoZSBkYXRhJywgY29yZS5lbnRpdHlbIGZpZWxkLm5hbWUgXSwgdmFsdWUpO1xuICAgICAgICAgIC8vIH1cblxuICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgY29uc3QgZmllbGRQYXRjaCA9IDxGaWVsZEl0ZW1QYXRjaEludGVyZmFjZT5ldmVudC5jb25maWcucGF0Y2g7XG4gICAgICAgICAgY29uc3QgY29udHJvbCA9IDxGb3JtQ29udHJvbD5ldmVudC5jb25maWcuY29udHJvbDtcbiAgICAgICAgICBmaWVsZFBhdGNoLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICBjb250cm9sLm1hcmtBc0RpcnR5KCk7XG4gICAgICAgICAgY29udHJvbC5zZXRWYWx1ZSh0aGlzLmFzc2V0LnN0b3JlZFZhbHVlKTtcbiAgICAgICAgICBjb250cm9sLnNldEVycm9ycyh7c2VydmVyOiB0cnVlfSk7XG4gICAgICAgICAgZXZlbnQuY29uZmlnLm1lc3NhZ2UgPSBHZXRIdHRwRXJyb3JNc2coZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZXQgYW55IGZpZWxkIHNldHRpbmdzIGZvciB0aGlzIGZpZWxkICYgZmllbGQgaXRlbXMsIGFuZCBhcHBseSBhbmQgc3RvcmVkIHZhbHVlc1xuICAgKiBAcGFyYW0gZmllbGRcbiAgICogQHBhcmFtIHNldHRpbmdzXG4gICAqL1xuICBzZXRGaWVsZEN1c3RvbVNldHRpbmcoZmllbGQ6IEZpZWxkQ29uZmlnLCBzZXR0aW5nczogRGljdGlvbmFyeTxGaWVsZEN1c3RvbVNldHRpbmdJbnRlcmZhY2U+KSB7XG4gICAgY29uc3Qgc3RvcmVkID0gZmllbGQuY29uZmlncztcbiAgICBpZiAoSXNPYmplY3QoZmllbGQsIFsnZmllbGRncm91cCcsICdjb25maWdzJ10pICYmIElzT2JqZWN0KHNldHRpbmdzKSkge1xuICAgICAgc2V0dGluZ3MgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHsuLi5FbnRpdHlGaWVsZFNldHRpbmcsIC4uLnNldHRpbmdzfSkpO1xuICAgICAgT2JqZWN0LmtleXMoc2V0dGluZ3MpLm1hcCgobmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IHNldHRpbmcgPSBzZXR0aW5nc1tuYW1lXTtcbiAgICAgICAgaWYgKElzT2JqZWN0KHNldHRpbmcsIHRydWUpKSB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBJc0RlZmluZWQoc2V0dGluZy52YWx1ZSwgZmFsc2UpID8gc2V0dGluZy52YWx1ZSA6IHNldHRpbmcuZGVmYXVsdFZhbHVlO1xuICAgICAgICAgIHNldHRpbmcudmFsdWUgPSA8YW55PnZhbHVlO1xuICAgICAgICAgIGlmIChzZXR0aW5nLml0ZW0gJiYgSXNPYmplY3QoZmllbGQuY2hpbGRyZW4sIFtzZXR0aW5nLml0ZW1dKSkge1xuICAgICAgICAgICAgZmllbGQuY2hpbGRyZW5bc2V0dGluZy5pdGVtXS5jdXN0b21fc2V0dGluZ1tuYW1lXSA9IHNldHRpbmc7XG4gICAgICAgICAgICBmaWVsZC5jaGlsZHJlbltzZXR0aW5nLml0ZW1dLnNldHRpbmdbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmllbGQuY3VzdG9tX3NldHRpbmdbbmFtZV0gPSBzZXR0aW5nO1xuICAgICAgICAgICAgZmllbGQuc2V0dGluZ1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGNoaWxkcmVuSWRMb29rdXAgPSB7fTtcbiAgICAgIE9iamVjdC5rZXlzKGZpZWxkLmNoaWxkcmVuKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgY2hpbGRyZW5JZExvb2t1cFtmaWVsZC5jaGlsZHJlbltuYW1lXS5pZF0gPSBuYW1lO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChJc0FycmF5KHN0b3JlZC5maWVsZF9jb25maWdzLCB0cnVlKSkge1xuICAgICAgICBzdG9yZWQuZmllbGRfY29uZmlncy5tYXAoKHNldHRpbmcpID0+IHtcbiAgICAgICAgICBpZiAoIWZpZWxkLmN1c3RvbV9zZXR0aW5nW3NldHRpbmcubmFtZV0pIHtcbiAgICAgICAgICAgIC8vIFRvRG86OiBEbyBXZSB3YW50IHRvIGFsbG93IHRoZSBkYXRhYmFzZSB0byBwYXNzIGluIGNvbmZpZ3MgdGhhdCBhcmUgbm90IGxvY2FsP1xuICAgICAgICAgICAgUG9wTG9nLndhcm4odGhpcy5uYW1lLCBgc2V0RmllbGRDdXN0b21TZXR0aW5nRGVmYXVsdHM6IHNldHRpbmcgbm8gbG9uZ2VyIGRlZmluZWRgLCBzZXR0aW5nKTtcbiAgICAgICAgICAgIC8vIGZpZWxkLmN1c3RvbV9zZXR0aW5nWyBzZXR0aW5nLm5hbWUgXSA9IHNldHRpbmc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpZWxkLmN1c3RvbV9zZXR0aW5nW3NldHRpbmcubmFtZV0uaWQgPSBzZXR0aW5nLmlkO1xuICAgICAgICAgICAgZmllbGQuY3VzdG9tX3NldHRpbmdbc2V0dGluZy5uYW1lXS52YWx1ZSA9IHNldHRpbmcudmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZpZWxkLnNldHRpbmdbc2V0dGluZy5uYW1lXSA9IHNldHRpbmcudmFsdWU7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG5cbiAgICAgIGlmIChJc09iamVjdChzdG9yZWQuaXRlbV9jb25maWdzLCB0cnVlKSkge1xuICAgICAgICBPYmplY3Qua2V5cyhzdG9yZWQuaXRlbV9jb25maWdzKS5tYXAoKGZpZWxkSXRlbUlkKSA9PiB7XG4gICAgICAgICAgY29uc3QgZmllbGRJdGVtQ29uZmlncyA9IHN0b3JlZC5pdGVtX2NvbmZpZ3NbZmllbGRJdGVtSWRdO1xuICAgICAgICAgIGlmIChJc0FycmF5KGZpZWxkSXRlbUNvbmZpZ3MsIHRydWUpKSB7XG4gICAgICAgICAgICBmaWVsZEl0ZW1Db25maWdzLm1hcCgoc2V0dGluZykgPT4ge1xuICAgICAgICAgICAgICBpZiAoc2V0dGluZy5maWVsZF9pZCBpbiBjaGlsZHJlbklkTG9va3VwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IGZpZWxkLmNoaWxkcmVuW2NoaWxkcmVuSWRMb29rdXBbc2V0dGluZy5maWVsZF9pZF1dO1xuXG4gICAgICAgICAgICAgICAgLy8gaWYoICFpdGVtLmN1c3RvbV9zZXR0aW5nICkgaXRlbS5jdXN0b21fc2V0dGluZyA9IHt9O1xuICAgICAgICAgICAgICAgIGlmICghaXRlbS5jdXN0b21fc2V0dGluZ1tzZXR0aW5nLm5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAvLyBUb0RvOjogRG8gV2Ugd2FudCB0byBhbGxvdyB0aGUgZGF0YWJhc2UgdG8gcGFzcyBpbiBjb25maWdzIHRoYXQgYXJlIG5vdCBsb2NhbFxuICAgICAgICAgICAgICAgICAgUG9wTG9nLndhcm4odGhpcy5uYW1lLCBgc2V0RmllbGRDdXN0b21TZXR0aW5nRGVmYXVsdHM6IHNldHRpbmcgbm8gbG9uZ2VyIGRlZmluZWRgLCBzZXR0aW5nKTtcbiAgICAgICAgICAgICAgICAgIC8vIGl0ZW0uY3VzdG9tX3NldHRpbmdbIHNldHRpbmcubmFtZSBdID0gc2V0dGluZztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaXRlbS5jdXN0b21fc2V0dGluZ1tzZXR0aW5nLm5hbWVdLmlkID0gc2V0dGluZy5pZDtcbiAgICAgICAgICAgICAgICAgIGl0ZW0uY3VzdG9tX3NldHRpbmdbc2V0dGluZy5uYW1lXS52YWx1ZSA9IHNldHRpbmcudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGlmKCAhaXRlbS5zZXR0aW5nICkgaXRlbS5zZXR0aW5nID0ge307XG4gICAgICAgICAgICAgICAgaXRlbS5zZXR0aW5nW3NldHRpbmcubmFtZV0gPSBzZXR0aW5nLnZhbHVlO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdoZXJlJywgc2V0dGluZy5uYW1lLCB7aXRlbTogaXRlbSwgc2V0dGluZzogc2V0dGluZ30pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgcHJpdmF0ZSBfbXkoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==