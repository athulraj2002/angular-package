import { __awaiter } from "tslib";
import { Inject, Injectable } from '@angular/core';
import { PopExtendService } from "../../../services/pop-extend.service";
import { PopLog, SchemeComponentConfig } from "../../../pop-common.model";
import { PopResourceService } from "../../../services/pop-resource.service";
import { DeepMerge, IsArray, IsObject, IsString, SnakeToPascal, TitleCase } from "../../../pop-common-utility";
import { EvaluateWhenConditions } from "../pop-entity-utility";
import * as i0 from "@angular/core";
import * as i1 from "../../../services/pop-resource.service";
export class PopEntitySchemeComponentService extends PopExtendService {
    /**
     * This srv is used in the
     * @param env
     */
    constructor(resource, APP_GLOBAL, env) {
        super();
        this.resource = resource;
        this.APP_GLOBAL = APP_GLOBAL;
        this.env = env;
        this.asset = {
            action: new Map(),
            base: new Map(),
            setting: new Map(),
            component: new Map(),
            param: new Map(),
            resource: new Map(),
            option: new Map(),
            tabs: new Map(),
            baseImageUrl: '',
        };
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            yield APP_GLOBAL.isVerified();
            this.asset.baseImageUrl = IsString(this.env.s3BucketUrl, true) ? this.env.s3BucketUrl : 'https://popcx-dev-public.s3-us-west-2.amazonaws.com';
        }), 0);
    }
    /**
     * Configure/Extend the default behavior of an entity
     * @param internal_name
     * @param extend
     */
    configure(internal_name, extend) {
        if (IsObject(extend.component, ['type']))
            this.setComponent(internal_name, extend.component);
        if (IsArray(extend.tab, true))
            this.setTab(internal_name, extend.tab);
        if (IsObject(extend.action, true))
            this.setAction(internal_name, extend.action);
        if (IsObject(extend.resource, true))
            this.setResource(internal_name, extend.resource);
        if (IsObject(extend.setting, true))
            this.setSetting(internal_name, extend.setting);
        if (IsObject(extend.option, true))
            this.setOption(internal_name, extend.option);
    }
    /**
     * A method to get a Core Config for an entity
     * Uses cache service to improve performance
     * ALL ENTITY RELATED COMPONENTS RELY ON THIS !!!!
     * @param entityParams
     * @param metadata
     */
    getConfig(internal_name, item) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let config = yield this._getBaseConfig(internal_name);
            if (item && item.id) {
                config.id = item.id;
                config.param.id = item.id;
                config.preferences = yield this._getPreferences(config.param);
                const settingComponent = config.setting.component;
                config = DeepMerge(config, item);
                config.setting.component = settingComponent ? settingComponent : null;
            }
            yield this.getResources(config);
            return resolve(config);
        }));
    }
    /**
     * This will do all of the work of building and storing the base config for each entity
     * @param internal_name
     * @param routes
     * @private
     */
    _getBaseConfig(internal_name) {
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
            }
            else {
                return resolve(Object.assign({}, this.asset.base.get(internal_name)));
            }
        });
    }
    /**
     * Get the base set of the entity definitions
     * These is the starting point when it comes to entities
     * @param internal_name
     * @param entityId
     */
    getParams(internal_name) {
        let widgetParams = null;
        if (this.asset.param.has(internal_name)) {
            widgetParams = Object.assign({}, this.asset.param.get(internal_name));
        }
        else {
            // temporary
            widgetParams = { internal_name: internal_name, name: TitleCase(SnakeToPascal(internal_name)) };
        }
        return widgetParams;
    }
    /**
     * Get the set of tab configs that belong to an entity
     */
    getTabs(widget) {
        if (IsObject(widget, ['param']) && this.asset.tabs.has(widget.param.internal_name)) {
            const tabs = this.asset.tabs.get(widget.param.internal_name).filter((tab) => {
                return EvaluateWhenConditions(widget, tab.when);
            });
            return [...tabs];
        }
        else {
            return [];
        }
    }
    /**
     * A Http call that gets the entity metadata
     * @param id Primary Key of the entity
     */
    getResources(widget) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (IsObject(widget.resource, true)) {
                const success = yield this.resource.setCollection(widget.resource);
                if (success) {
                    this.resource.getCollection(widget.resource);
                    return resolve(true);
                }
                else {
                    resolve(false);
                }
            }
            else {
                resolve(false);
            }
        }));
    }
    /**
     * Set the base definitions for an entity
     * Each entity needs to define these so we know how to talk to the api in regards to it
     * The api should provide this details as part of the auth token
     * @param internal_name
     * @param entityId
     */
    setParam(param) {
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
    setTab(internal_name, tabs) {
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
    setComponent(internal_name, component) {
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
    setAction(internal_name, action) {
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
    setResource(internal_name, resource) {
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
    setOption(internal_name, option) {
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
    setSetting(internal_name, setting) {
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
    getResource(internal_name) {
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
    getAction(internal_name) {
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
    getSetting(internal_name) {
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
    getOption(internal_name) {
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
    getComponent(internal_name) {
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
    _getPreferences(param) {
        return new Promise((resolve) => {
            return resolve({});
        });
    }
    getDefaultComponentSetting(internalName) {
        const setting = {
            client_id: [],
            account_id: [],
            campaign_id: [],
            edit: true,
            refresh: true
        };
        return setting;
    }
    getDefaultComponentOption(internalName) {
        const option = {
            client_id: [],
            account_id: [],
            campaign_id: [],
            edit: true,
            refresh: true
        };
        return option;
    }
}
PopEntitySchemeComponentService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopEntitySchemeComponentService_Factory() { return new PopEntitySchemeComponentService(i0.ɵɵinject(i1.PopResourceService), i0.ɵɵinject("APP_GLOBAL"), i0.ɵɵinject("env")); }, token: PopEntitySchemeComponentService, providedIn: "root" });
PopEntitySchemeComponentService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopEntitySchemeComponentService.ctorParameters = () => [
    { type: PopResourceService },
    { type: undefined, decorators: [{ type: Inject, args: ['APP_GLOBAL',] }] },
    { type: undefined, decorators: [{ type: Inject, args: ['env',] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1zY2hlbWUtY29tcG9uZW50LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvc2VydmljZXMvcG9wLWVudGl0eS1zY2hlbWUtY29tcG9uZW50LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBRTVELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBQ3RFLE9BQU8sRUFJTCxNQUFNLEVBRU4scUJBQXFCLEVBS3RCLE1BQU0sMkJBQTJCLENBQUM7QUFFbkMsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sd0NBQXdDLENBQUM7QUFDMUUsT0FBTyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDN0csT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7OztBQU83RCxNQUFNLE9BQU8sK0JBQWdDLFNBQVEsZ0JBQWdCO0lBZW5FOzs7T0FHRztJQUNILFlBQ1UsUUFBNEIsRUFDTixVQUE4QixFQUNyQyxHQUFJO1FBRTNCLEtBQUssRUFBRSxDQUFDO1FBSkEsYUFBUSxHQUFSLFFBQVEsQ0FBb0I7UUFDTixlQUFVLEdBQVYsVUFBVSxDQUFvQjtRQUNyQyxRQUFHLEdBQUgsR0FBRyxDQUFDO1FBcEJuQixVQUFLLEdBQUc7WUFDaEIsTUFBTSxFQUFnQyxJQUFJLEdBQUcsRUFBMkI7WUFDeEUsSUFBSSxFQUFzQyxJQUFJLEdBQUcsRUFBaUM7WUFDbEYsT0FBTyxFQUFnRCxJQUFJLEdBQUcsRUFBMkM7WUFDekcsU0FBUyxFQUEwQyxJQUFJLEdBQUcsRUFBcUM7WUFD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QUksT0FBTyxDQUFrQixDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzlDLE9BQU8sT0FBTyxDQUFrQixFQUFFLENBQUMsQ0FBQztRQUN0QyxDQUFDLENBQUMsQ0FBQztJQUVMLENBQUM7SUFHRCwwQkFBMEIsQ0FBQyxZQUFvQjtRQUM3QyxNQUFNLE9BQU8sR0FBb0M7WUFDL0MsU0FBUyxFQUFFLEVBQUU7WUFDYixVQUFVLEVBQUUsRUFBRTtZQUNkLFdBQVcsRUFBRSxFQUFFO1lBQ2YsSUFBSSxFQUFFLElBQUk7WUFDVixPQUFPLEVBQUUsSUFBSTtTQUNkLENBQUM7UUFFRixPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBR0QseUJBQXlCLENBQUMsWUFBb0I7UUFDNUMsTUFBTSxNQUFNLEdBQW1DO1lBQzdDLFNBQVMsRUFBRSxFQUFFO1lBQ2IsVUFBVSxFQUFFLEVBQUU7WUFDZCxXQUFXLEVBQUUsRUFBRTtZQUNmLElBQUksRUFBRSxJQUFJO1lBQ1YsT0FBTyxFQUFFLElBQUk7U0FDZCxDQUFDO1FBRUYsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQzs7OztZQXpXRixVQUFVLFNBQUM7Z0JBQ1YsVUFBVSxFQUFFLE1BQU07YUFDbkI7OztZQVJPLGtCQUFrQjs0Q0E4QnJCLE1BQU0sU0FBQyxZQUFZOzRDQUNuQixNQUFNLFNBQUMsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1BvcEV4dGVuZFNlcnZpY2V9IGZyb20gXCIuLi8uLi8uLi9zZXJ2aWNlcy9wb3AtZXh0ZW5kLnNlcnZpY2VcIjtcbmltcG9ydCB7XG4gIEFwcEdsb2JhbEludGVyZmFjZSxcbiAgRGljdGlvbmFyeSxcbiAgRHluYW1pY0NvbXBvbmVudEludGVyZmFjZSxcbiAgUG9wTG9nLFxuICBSZXNvdXJjZUludGVyZmFjZSxcbiAgU2NoZW1lQ29tcG9uZW50Q29uZmlnLFxuICBTY2hlbWVDb21wb25lbnRNb2RlbEludGVyZmFjZSxcbiAgU2NoZW1lQ29tcG9uZW50T3B0aW9uSW50ZXJmYWNlLFxuICBTY2hlbWVDb21wb25lbnRQYXJhbUludGVyZmFjZSxcbiAgU2NoZW1lQ29tcG9uZW50U2V0dGluZ0ludGVyZmFjZVxufSBmcm9tIFwiLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbFwiO1xuaW1wb3J0IHtUYWJDb25maWd9IGZyb20gXCIuLi8uLi9iYXNlL3BvcC10YWItbWVudS90YWItbWVudS5tb2RlbFwiO1xuaW1wb3J0IHtQb3BSZXNvdXJjZVNlcnZpY2V9IGZyb20gXCIuLi8uLi8uLi9zZXJ2aWNlcy9wb3AtcmVzb3VyY2Uuc2VydmljZVwiO1xuaW1wb3J0IHtEZWVwTWVyZ2UsIElzQXJyYXksIElzT2JqZWN0LCBJc1N0cmluZywgU25ha2VUb1Bhc2NhbCwgVGl0bGVDYXNlfSBmcm9tIFwiLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5XCI7XG5pbXBvcnQge0V2YWx1YXRlV2hlbkNvbmRpdGlvbnN9IGZyb20gXCIuLi9wb3AtZW50aXR5LXV0aWxpdHlcIjtcbmltcG9ydCB7UG9wRW50aXR5U2NoZW1lQ3VzdG9tQ29tcG9uZW50fSBmcm9tIFwiLi4vcG9wLWVudGl0eS1zY2hlbWUvcG9wLWVudGl0eS1zY2hlbWUtY3VzdG9tLWNvbXBvbmVudC9wb3AtZW50aXR5LXNjaGVtZS1jdXN0b20uY29tcG9uZW50XCI7XG5cblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5U2NoZW1lQ29tcG9uZW50U2VydmljZSBleHRlbmRzIFBvcEV4dGVuZFNlcnZpY2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuXG4gIHByb3RlY3RlZCBhc3NldCA9IHtcbiAgICBhY3Rpb246IDxNYXA8c3RyaW5nLCBEaWN0aW9uYXJ5PGFueT4+Pm5ldyBNYXA8c3RyaW5nLCBEaWN0aW9uYXJ5PGFueT4+KCksXG4gICAgYmFzZTogPE1hcDxzdHJpbmcsIFNjaGVtZUNvbXBvbmVudENvbmZpZz4+bmV3IE1hcDxzdHJpbmcsIFNjaGVtZUNvbXBvbmVudENvbmZpZz4oKSxcbiAgICBzZXR0aW5nOiA8TWFwPHN0cmluZywgU2NoZW1lQ29tcG9uZW50U2V0dGluZ0ludGVyZmFjZT4+bmV3IE1hcDxzdHJpbmcsIFNjaGVtZUNvbXBvbmVudFNldHRpbmdJbnRlcmZhY2U+KCksXG4gICAgY29tcG9uZW50OiA8TWFwPHN0cmluZywgRHluYW1pY0NvbXBvbmVudEludGVyZmFjZT4+bmV3IE1hcDxzdHJpbmcsIER5bmFtaWNDb21wb25lbnRJbnRlcmZhY2U+KCksXG4gICAgcGFyYW06IDxNYXA8c3RyaW5nLCBTY2hlbWVDb21wb25lbnRQYXJhbUludGVyZmFjZT4+bmV3IE1hcDxzdHJpbmcsIFNjaGVtZUNvbXBvbmVudFBhcmFtSW50ZXJmYWNlPigpLFxuICAgIHJlc291cmNlOiA8TWFwPHN0cmluZywgRGljdGlvbmFyeTxSZXNvdXJjZUludGVyZmFjZT4+Pm5ldyBNYXA8c3RyaW5nLCBEaWN0aW9uYXJ5PFJlc291cmNlSW50ZXJmYWNlPj4oKSxcbiAgICBvcHRpb246IDxNYXA8c3RyaW5nLCBTY2hlbWVDb21wb25lbnRPcHRpb25JbnRlcmZhY2U+Pm5ldyBNYXA8c3RyaW5nLCBTY2hlbWVDb21wb25lbnRPcHRpb25JbnRlcmZhY2U+KCksXG4gICAgdGFiczogPE1hcDxzdHJpbmcsIFRhYkNvbmZpZ1tdPj5uZXcgTWFwPHN0cmluZywgVGFiQ29uZmlnW10+KCksXG4gICAgYmFzZUltYWdlVXJsOiAnJyxcbiAgfTtcblxuXG4gIC8qKlxuICAgKiBUaGlzIHNydiBpcyB1c2VkIGluIHRoZVxuICAgKiBAcGFyYW0gZW52XG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlc291cmNlOiBQb3BSZXNvdXJjZVNlcnZpY2UsXG4gICAgQEluamVjdCgnQVBQX0dMT0JBTCcpIHByaXZhdGUgQVBQX0dMT0JBTDogQXBwR2xvYmFsSW50ZXJmYWNlLFxuICAgIEBJbmplY3QoJ2VudicpIHByaXZhdGUgZW52P1xuICApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCBBUFBfR0xPQkFMLmlzVmVyaWZpZWQoKTtcbiAgICAgIHRoaXMuYXNzZXQuYmFzZUltYWdlVXJsID0gSXNTdHJpbmcodGhpcy5lbnYuczNCdWNrZXRVcmwsIHRydWUpID8gdGhpcy5lbnYuczNCdWNrZXRVcmwgOiAnaHR0cHM6Ly9wb3BjeC1kZXYtcHVibGljLnMzLXVzLXdlc3QtMi5hbWF6b25hd3MuY29tJztcbiAgICB9LCAwKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZS9FeHRlbmQgdGhlIGRlZmF1bHQgYmVoYXZpb3Igb2YgYW4gZW50aXR5XG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSBleHRlbmRcbiAgICovXG4gIGNvbmZpZ3VyZShpbnRlcm5hbF9uYW1lOiBzdHJpbmcsIGV4dGVuZDogU2NoZW1lQ29tcG9uZW50TW9kZWxJbnRlcmZhY2UpIHtcbiAgICBpZiAoSXNPYmplY3QoZXh0ZW5kLmNvbXBvbmVudCwgWyd0eXBlJ10pKSB0aGlzLnNldENvbXBvbmVudChpbnRlcm5hbF9uYW1lLCBleHRlbmQuY29tcG9uZW50KTtcbiAgICBpZiAoSXNBcnJheShleHRlbmQudGFiLCB0cnVlKSkgdGhpcy5zZXRUYWIoaW50ZXJuYWxfbmFtZSwgZXh0ZW5kLnRhYik7XG4gICAgaWYgKElzT2JqZWN0KGV4dGVuZC5hY3Rpb24sIHRydWUpKSB0aGlzLnNldEFjdGlvbihpbnRlcm5hbF9uYW1lLCBleHRlbmQuYWN0aW9uKTtcbiAgICBpZiAoSXNPYmplY3QoZXh0ZW5kLnJlc291cmNlLCB0cnVlKSkgdGhpcy5zZXRSZXNvdXJjZShpbnRlcm5hbF9uYW1lLCBleHRlbmQucmVzb3VyY2UpO1xuICAgIGlmIChJc09iamVjdChleHRlbmQuc2V0dGluZywgdHJ1ZSkpIHRoaXMuc2V0U2V0dGluZyhpbnRlcm5hbF9uYW1lLCBleHRlbmQuc2V0dGluZyk7XG4gICAgaWYgKElzT2JqZWN0KGV4dGVuZC5vcHRpb24sIHRydWUpKSB0aGlzLnNldE9wdGlvbihpbnRlcm5hbF9uYW1lLCBleHRlbmQub3B0aW9uKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRvIGdldCBhIENvcmUgQ29uZmlnIGZvciBhbiBlbnRpdHlcbiAgICogVXNlcyBjYWNoZSBzZXJ2aWNlIHRvIGltcHJvdmUgcGVyZm9ybWFuY2VcbiAgICogQUxMIEVOVElUWSBSRUxBVEVEIENPTVBPTkVOVFMgUkVMWSBPTiBUSElTICEhISFcbiAgICogQHBhcmFtIGVudGl0eVBhcmFtc1xuICAgKiBAcGFyYW0gbWV0YWRhdGFcbiAgICovXG4gIGdldENvbmZpZyhpbnRlcm5hbF9uYW1lOiBzdHJpbmcsIGl0ZW06IFNjaGVtZUNvbXBvbmVudFBhcmFtSW50ZXJmYWNlKTogUHJvbWlzZTxTY2hlbWVDb21wb25lbnRDb25maWc+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8U2NoZW1lQ29tcG9uZW50Q29uZmlnPihhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgbGV0IGNvbmZpZyA9IGF3YWl0IHRoaXMuX2dldEJhc2VDb25maWcoaW50ZXJuYWxfbmFtZSk7XG4gICAgICBpZiAoaXRlbSAmJiBpdGVtLmlkKSB7XG4gICAgICAgIGNvbmZpZy5pZCA9IGl0ZW0uaWQ7XG4gICAgICAgIGNvbmZpZy5wYXJhbS5pZCA9IGl0ZW0uaWQ7XG4gICAgICAgIGNvbmZpZy5wcmVmZXJlbmNlcyA9IGF3YWl0IHRoaXMuX2dldFByZWZlcmVuY2VzKGNvbmZpZy5wYXJhbSk7XG4gICAgICAgIGNvbnN0IHNldHRpbmdDb21wb25lbnQgPSBjb25maWcuc2V0dGluZy5jb21wb25lbnQ7XG4gICAgICAgIGNvbmZpZyA9IERlZXBNZXJnZShjb25maWcsIGl0ZW0pO1xuICAgICAgICBjb25maWcuc2V0dGluZy5jb21wb25lbnQgPSBzZXR0aW5nQ29tcG9uZW50ID8gc2V0dGluZ0NvbXBvbmVudCA6IG51bGw7XG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLmdldFJlc291cmNlcyhjb25maWcpO1xuXG4gICAgICByZXR1cm4gcmVzb2x2ZShjb25maWcpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyB3aWxsIGRvIGFsbCBvZiB0aGUgd29yayBvZiBidWlsZGluZyBhbmQgc3RvcmluZyB0aGUgYmFzZSBjb25maWcgZm9yIGVhY2ggZW50aXR5XG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSByb3V0ZXNcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX2dldEJhc2VDb25maWcoaW50ZXJuYWxfbmFtZTogc3RyaW5nKTogUHJvbWlzZTxTY2hlbWVDb21wb25lbnRDb25maWc+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGlmICghdGhpcy5hc3NldC5iYXNlLmhhcyhpbnRlcm5hbF9uYW1lKSkge1xuICAgICAgICBjb25zdCBwYXJhbSA9IHRoaXMuZ2V0UGFyYW1zKGludGVybmFsX25hbWUpO1xuICAgICAgICBjb25zdCBiYXNlID0gbmV3IFNjaGVtZUNvbXBvbmVudENvbmZpZyh7XG4gICAgICAgICAgcGFyYW06IHBhcmFtLFxuICAgICAgICAgIGNvbXBvbmVudDogdGhpcy5nZXRDb21wb25lbnQoaW50ZXJuYWxfbmFtZSksXG4gICAgICAgICAgc2V0dGluZzogdGhpcy5nZXRTZXR0aW5nKGludGVybmFsX25hbWUpLFxuICAgICAgICAgIG9wdGlvbjogdGhpcy5nZXRPcHRpb24oaW50ZXJuYWxfbmFtZSksXG4gICAgICAgICAgcmVzb3VyY2U6IHRoaXMuZ2V0UmVzb3VyY2UoaW50ZXJuYWxfbmFtZSksXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmFzc2V0LmJhc2Uuc2V0KGludGVybmFsX25hbWUsIGJhc2UpO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZShiYXNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHsuLi50aGlzLmFzc2V0LmJhc2UuZ2V0KGludGVybmFsX25hbWUpfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGJhc2Ugc2V0IG9mIHRoZSBlbnRpdHkgZGVmaW5pdGlvbnNcbiAgICogVGhlc2UgaXMgdGhlIHN0YXJ0aW5nIHBvaW50IHdoZW4gaXQgY29tZXMgdG8gZW50aXRpZXNcbiAgICogQHBhcmFtIGludGVybmFsX25hbWVcbiAgICogQHBhcmFtIGVudGl0eUlkXG4gICAqL1xuICBnZXRQYXJhbXMoaW50ZXJuYWxfbmFtZTogc3RyaW5nKTogU2NoZW1lQ29tcG9uZW50UGFyYW1JbnRlcmZhY2Uge1xuICAgIGxldCB3aWRnZXRQYXJhbXMgPSBudWxsO1xuICAgIGlmICh0aGlzLmFzc2V0LnBhcmFtLmhhcyhpbnRlcm5hbF9uYW1lKSkge1xuICAgICAgd2lkZ2V0UGFyYW1zID0gey4uLnRoaXMuYXNzZXQucGFyYW0uZ2V0KGludGVybmFsX25hbWUpfTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gdGVtcG9yYXJ5XG4gICAgICB3aWRnZXRQYXJhbXMgPSB7aW50ZXJuYWxfbmFtZTogaW50ZXJuYWxfbmFtZSwgbmFtZTogVGl0bGVDYXNlKFNuYWtlVG9QYXNjYWwoaW50ZXJuYWxfbmFtZSkpfTtcbiAgICB9XG4gICAgcmV0dXJuIHdpZGdldFBhcmFtcztcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdldCB0aGUgc2V0IG9mIHRhYiBjb25maWdzIHRoYXQgYmVsb25nIHRvIGFuIGVudGl0eVxuICAgKi9cbiAgZ2V0VGFicyh3aWRnZXQ/OiBTY2hlbWVDb21wb25lbnRDb25maWcpOiBUYWJDb25maWdbXSB7XG4gICAgaWYgKElzT2JqZWN0KHdpZGdldCwgWydwYXJhbSddKSAmJiB0aGlzLmFzc2V0LnRhYnMuaGFzKHdpZGdldC5wYXJhbS5pbnRlcm5hbF9uYW1lKSkge1xuICAgICAgY29uc3QgdGFicyA9IHRoaXMuYXNzZXQudGFicy5nZXQod2lkZ2V0LnBhcmFtLmludGVybmFsX25hbWUpLmZpbHRlcigodGFiKSA9PiB7XG4gICAgICAgIHJldHVybiBFdmFsdWF0ZVdoZW5Db25kaXRpb25zKHdpZGdldCwgdGFiLndoZW4pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gWy4uLnRhYnNdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogQSBIdHRwIGNhbGwgdGhhdCBnZXRzIHRoZSBlbnRpdHkgbWV0YWRhdGFcbiAgICogQHBhcmFtIGlkIFByaW1hcnkgS2V5IG9mIHRoZSBlbnRpdHlcbiAgICovXG4gIGdldFJlc291cmNlcyh3aWRnZXQ6IFNjaGVtZUNvbXBvbmVudENvbmZpZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKElzT2JqZWN0KHdpZGdldC5yZXNvdXJjZSwgdHJ1ZSkpIHtcbiAgICAgICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IHRoaXMucmVzb3VyY2Uuc2V0Q29sbGVjdGlvbih3aWRnZXQucmVzb3VyY2UpO1xuICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgIHRoaXMucmVzb3VyY2UuZ2V0Q29sbGVjdGlvbih3aWRnZXQucmVzb3VyY2UpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFNldCB0aGUgYmFzZSBkZWZpbml0aW9ucyBmb3IgYW4gZW50aXR5XG4gICAqIEVhY2ggZW50aXR5IG5lZWRzIHRvIGRlZmluZSB0aGVzZSBzbyB3ZSBrbm93IGhvdyB0byB0YWxrIHRvIHRoZSBhcGkgaW4gcmVnYXJkcyB0byBpdFxuICAgKiBUaGUgYXBpIHNob3VsZCBwcm92aWRlIHRoaXMgZGV0YWlscyBhcyBwYXJ0IG9mIHRoZSBhdXRoIHRva2VuXG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSBlbnRpdHlJZFxuICAgKi9cbiAgc2V0UGFyYW0ocGFyYW06IFNjaGVtZUNvbXBvbmVudFBhcmFtSW50ZXJmYWNlKSB7XG4gICAgaWYgKElzT2JqZWN0KHBhcmFtLCBbJ2ludGVybmFsX25hbWUnLCAnbmFtZSddKSkge1xuICAgICAgUG9wTG9nLmluZm8odGhpcy5uYW1lLCBgUGFyYW1zIHNldCBmb3IgJHtwYXJhbS5pbnRlcm5hbF9uYW1lfWAsIHBhcmFtKTtcbiAgICAgIHRoaXMuYXNzZXQucGFyYW0uc2V0KHBhcmFtLmludGVybmFsX25hbWUsIHBhcmFtKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBdHRhY2ggYSBzZXQgb2YgdGFiIGNvbmZpZ3MgdG8gYW4gZW50aXR5XG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSB0YWJzXG4gICAqL1xuICBzZXRUYWIoaW50ZXJuYWxfbmFtZTogc3RyaW5nLCB0YWJzOiBUYWJDb25maWdbXSkge1xuICAgIGlmIChJc1N0cmluZyhpbnRlcm5hbF9uYW1lLCB0cnVlKSAmJiBBcnJheS5pc0FycmF5KHRhYnMpKSB7XG4gICAgICBQb3BMb2cuaW5mbyh0aGlzLm5hbWUsIGBFbnRpdHkgVGFicyBzZXQgZm9yICR7aW50ZXJuYWxfbmFtZX1gLCB0YWJzKTtcbiAgICAgIHRoaXMuYXNzZXQudGFicy5zZXQoaW50ZXJuYWxfbmFtZSwgdGFicyk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogQXR0YWNoIGEgY29tcG9uZW50IHRvIGEgd2lkZ2V0XG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSB0YWJzXG4gICAqL1xuICBzZXRDb21wb25lbnQoaW50ZXJuYWxfbmFtZTogc3RyaW5nLCBjb21wb25lbnQ6IER5bmFtaWNDb21wb25lbnRJbnRlcmZhY2UpIHtcbiAgICBpZiAoSXNTdHJpbmcoaW50ZXJuYWxfbmFtZSwgdHJ1ZSkgJiYgSXNPYmplY3QoY29tcG9uZW50LCBbJ3R5cGUnXSkpIHtcbiAgICAgIFBvcExvZy5pbmZvKHRoaXMubmFtZSwgYENvbXBvbmVudCBzZXQgZm9yICR7aW50ZXJuYWxfbmFtZX1gLCBjb21wb25lbnQpO1xuICAgICAgdGhpcy5hc3NldC5jb21wb25lbnQuc2V0KGludGVybmFsX25hbWUsIGNvbXBvbmVudCk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogQXR0YWNoIGEgc2V0IG9mIGFjdGlvbnMgdG8gYW4gZW50aXR5XG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSB0YWJzXG4gICAqL1xuICBzZXRBY3Rpb24oaW50ZXJuYWxfbmFtZTogc3RyaW5nLCBhY3Rpb246IERpY3Rpb25hcnk8YW55Pik6IHZvaWQge1xuICAgIGlmIChJc1N0cmluZyhpbnRlcm5hbF9uYW1lLCB0cnVlKSAmJiBJc09iamVjdChhY3Rpb24pKSB7XG4gICAgICBQb3BMb2cuaW5mbyh0aGlzLm5hbWUsIGBBY3Rpb24gc2V0IGZvciAke2ludGVybmFsX25hbWV9YCwgYWN0aW9uKTtcbiAgICAgIHRoaXMuYXNzZXQuYWN0aW9uLnNldChpbnRlcm5hbF9uYW1lLCBhY3Rpb24pO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEF0dGFjaCBhIHNldCBvZiByZXNvdXJjZXMgdG8gYW4gZW50aXR5XG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSB0YWJzXG4gICAqL1xuICBzZXRSZXNvdXJjZShpbnRlcm5hbF9uYW1lOiBzdHJpbmcsIHJlc291cmNlOiBEaWN0aW9uYXJ5PFJlc291cmNlSW50ZXJmYWNlPik6IHZvaWQge1xuICAgIGlmIChJc1N0cmluZyhpbnRlcm5hbF9uYW1lLCB0cnVlKSAmJiBJc09iamVjdChyZXNvdXJjZSkpIHtcbiAgICAgIFBvcExvZy5pbmZvKHRoaXMubmFtZSwgYEVudGl0eSBSZXNvdXJjZSBzZXQgZm9yICR7aW50ZXJuYWxfbmFtZX1gLCByZXNvdXJjZSk7XG4gICAgICB0aGlzLmFzc2V0LnJlc291cmNlLnNldChpbnRlcm5hbF9uYW1lLCByZXNvdXJjZSk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogQXR0YWNoIGEgc2V0IG9mIG9wdGlvbnMgdG8gd2lkZ2V0XG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSB0YWJzXG4gICAqL1xuICBzZXRPcHRpb24oaW50ZXJuYWxfbmFtZTogc3RyaW5nLCBvcHRpb246IFNjaGVtZUNvbXBvbmVudE9wdGlvbkludGVyZmFjZSk6IHZvaWQge1xuICAgIGlmIChJc1N0cmluZyhpbnRlcm5hbF9uYW1lLCB0cnVlKSAmJiBJc09iamVjdChvcHRpb24pKSB7XG4gICAgICBQb3BMb2cuaW5mbyh0aGlzLm5hbWUsIGBPcHRpb24gc2V0IGZvciAke2ludGVybmFsX25hbWV9YCwgb3B0aW9uKTtcbiAgICAgIHRoaXMuYXNzZXQub3B0aW9uLnNldChpbnRlcm5hbF9uYW1lLCBvcHRpb24pO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEF0dGFjaCBhIHNldCBvZiBvcHRpb25zIHRvIHdpZGdldFxuICAgKiBAcGFyYW0gaW50ZXJuYWxfbmFtZVxuICAgKiBAcGFyYW0gdGFic1xuICAgKi9cbiAgc2V0U2V0dGluZyhpbnRlcm5hbF9uYW1lOiBzdHJpbmcsIHNldHRpbmc6IFNjaGVtZUNvbXBvbmVudFNldHRpbmdJbnRlcmZhY2UpOiB2b2lkIHtcbiAgICBpZiAoSXNTdHJpbmcoaW50ZXJuYWxfbmFtZSwgdHJ1ZSkgJiYgSXNPYmplY3Qoc2V0dGluZykpIHtcbiAgICAgIFBvcExvZy5pbmZvKHRoaXMubmFtZSwgYFNldHRpbmcgc2V0IGZvciAke2ludGVybmFsX25hbWV9YCwgc2V0dGluZyk7XG4gICAgICB0aGlzLmFzc2V0LnNldHRpbmcuc2V0KGludGVybmFsX25hbWUsIHNldHRpbmcpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdldCBleHRlbmRlZCBmaWVsZHMgYXR0YWNoZWQgdG8gYW4gZW50aXR5XG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSB0YWJzXG4gICAqL1xuICBnZXRSZXNvdXJjZShpbnRlcm5hbF9uYW1lOiBzdHJpbmcpOiBEaWN0aW9uYXJ5PFJlc291cmNlSW50ZXJmYWNlPiB7XG4gICAgaWYgKElzU3RyaW5nKGludGVybmFsX25hbWUsIHRydWUpKSB7XG4gICAgICBjb25zdCByZXNvdXJjZSA9IHRoaXMuYXNzZXQucmVzb3VyY2UuZ2V0KGludGVybmFsX25hbWUpO1xuICAgICAgcmV0dXJuIHJlc291cmNlID8gcmVzb3VyY2UgOiB7fTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgZXh0ZW5kZWQgYWN0aW9ucyBhdHRhY2hlZCB0byBhbiBlbnRpdHlcbiAgICogQHBhcmFtIGludGVybmFsX25hbWVcbiAgICogQHBhcmFtIHRhYnNcbiAgICovXG4gIGdldEFjdGlvbihpbnRlcm5hbF9uYW1lOiBzdHJpbmcpOiBEaWN0aW9uYXJ5PGFueT4ge1xuICAgIGlmIChJc1N0cmluZyhpbnRlcm5hbF9uYW1lLCB0cnVlKSkge1xuICAgICAgY29uc3QgYWN0aW9uID0gdGhpcy5hc3NldC5hY3Rpb24uZ2V0KGludGVybmFsX25hbWUpO1xuICAgICAgcmV0dXJuIGFjdGlvbiA/IGFjdGlvbiA6IHt9O1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdldCBleHRlbmRlZCBhY3Rpb25zIGF0dGFjaGVkIHRvIGFuIGVudGl0eVxuICAgKiBAcGFyYW0gaW50ZXJuYWxfbmFtZVxuICAgKiBAcGFyYW0gdGFic1xuICAgKi9cbiAgZ2V0U2V0dGluZyhpbnRlcm5hbF9uYW1lOiBzdHJpbmcpOiBTY2hlbWVDb21wb25lbnRTZXR0aW5nSW50ZXJmYWNlIHtcbiAgICBpZiAoSXNTdHJpbmcoaW50ZXJuYWxfbmFtZSwgdHJ1ZSkpIHtcbiAgICAgIGNvbnN0IHNldHRpbmcgPSB0aGlzLmFzc2V0LnNldHRpbmcuZ2V0KGludGVybmFsX25hbWUpO1xuICAgICAgcmV0dXJuIHNldHRpbmcgPyBzZXR0aW5nIDoge307XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogR2V0IGV4dGVuZGVkIGFjdGlvbnMgYXR0YWNoZWQgdG8gYW4gZW50aXR5XG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSB0YWJzXG4gICAqL1xuICBnZXRPcHRpb24oaW50ZXJuYWxfbmFtZTogc3RyaW5nKTogU2NoZW1lQ29tcG9uZW50T3B0aW9uSW50ZXJmYWNlIHtcbiAgICBpZiAoSXNTdHJpbmcoaW50ZXJuYWxfbmFtZSwgdHJ1ZSkpIHtcbiAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMuYXNzZXQub3B0aW9uLmdldChpbnRlcm5hbF9uYW1lKTtcbiAgICAgIHJldHVybiBvcHRpb24gPyBvcHRpb24gOiB7fTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgZXh0ZW5kZWQgYWN0aW9ucyBhdHRhY2hlZCB0byBhbiBlbnRpdHlcbiAgICogQHBhcmFtIGludGVybmFsX25hbWVcbiAgICogQHBhcmFtIHRhYnNcbiAgICovXG4gIGdldENvbXBvbmVudChpbnRlcm5hbF9uYW1lOiBzdHJpbmcpOiBEeW5hbWljQ29tcG9uZW50SW50ZXJmYWNlIHtcbiAgICBpZiAoSXNTdHJpbmcoaW50ZXJuYWxfbmFtZSwgdHJ1ZSkpIHtcbiAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMuYXNzZXQuY29tcG9uZW50LmdldChpbnRlcm5hbF9uYW1lKTtcbiAgICAgIHJldHVybiBjb21wb25lbnQgPyBjb21wb25lbnQgOiBudWxsO1xuICAgIH1cbiAgfVxuXG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgY29uc29sZS5sb2codGhpcy5uYW1lLCBgZGVzdHJveWVkOiR7dGhpcy5pZH1gKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuXG5cblxuICBwcml2YXRlIF9nZXRQcmVmZXJlbmNlcyhwYXJhbTogU2NoZW1lQ29tcG9uZW50UGFyYW1JbnRlcmZhY2UpOiBQcm9taXNlPERpY3Rpb25hcnk8YW55Pj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxEaWN0aW9uYXJ5PGFueT4+KChyZXNvbHZlKSA9PiB7XG4gICAgICByZXR1cm4gcmVzb2x2ZSg8RGljdGlvbmFyeTxhbnk+Pnt9KTtcbiAgICB9KTtcblxuICB9XG5cblxuICBnZXREZWZhdWx0Q29tcG9uZW50U2V0dGluZyhpbnRlcm5hbE5hbWU6IHN0cmluZyk6IFNjaGVtZUNvbXBvbmVudFNldHRpbmdJbnRlcmZhY2Uge1xuICAgIGNvbnN0IHNldHRpbmcgPSA8U2NoZW1lQ29tcG9uZW50U2V0dGluZ0ludGVyZmFjZT57XG4gICAgICBjbGllbnRfaWQ6IFtdLFxuICAgICAgYWNjb3VudF9pZDogW10sXG4gICAgICBjYW1wYWlnbl9pZDogW10sXG4gICAgICBlZGl0OiB0cnVlLFxuICAgICAgcmVmcmVzaDogdHJ1ZVxuICAgIH07XG5cbiAgICByZXR1cm4gc2V0dGluZztcbiAgfVxuXG5cbiAgZ2V0RGVmYXVsdENvbXBvbmVudE9wdGlvbihpbnRlcm5hbE5hbWU6IHN0cmluZyk6IFNjaGVtZUNvbXBvbmVudE9wdGlvbkludGVyZmFjZSB7XG4gICAgY29uc3Qgb3B0aW9uID0gPFNjaGVtZUNvbXBvbmVudE9wdGlvbkludGVyZmFjZT57XG4gICAgICBjbGllbnRfaWQ6IFtdLFxuICAgICAgYWNjb3VudF9pZDogW10sXG4gICAgICBjYW1wYWlnbl9pZDogW10sXG4gICAgICBlZGl0OiB0cnVlLFxuICAgICAgcmVmcmVzaDogdHJ1ZVxuICAgIH07XG5cbiAgICByZXR1cm4gb3B0aW9uO1xuICB9XG5cblxufVxuIl19