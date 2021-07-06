import { __awaiter } from "tslib";
import { Inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { PopBusiness, PopPipe, PopLog, PopUser, SetPopFilter, PopRequest, } from '../../../pop-common.model';
import { GetSessionSiteVar, IsArray, IsNumber, IsObject, IsString, SetSessionSiteVar, StorageGetter } from '../../../pop-common-utility';
import { PopExtendService } from '../../../services/pop-extend.service';
import { CacFilterBarConfig, CacFilterBarEntityConfig } from './pop-cac-filter.model';
import { PopEntityEventService } from '../../entity/services/pop-entity-event.service';
import { IsValidFieldPatchEvent } from '../../entity/pop-entity-utility';
import { PopPipeService } from '../../../services/pop-pipe.service';
import * as i0 from "@angular/core";
import * as i1 from "../../entity/services/pop-entity-event.service";
import * as i2 from "../../../services/pop-pipe.service";
export class PopCacFilterBarService extends PopExtendService {
    constructor(crud, pipe, APP_GLOBAL) {
        super();
        this.crud = crud;
        this.pipe = pipe;
        this.APP_GLOBAL = APP_GLOBAL;
        this.loading = false;
        this.name = 'PopClientFilterBarService';
        this.config = new CacFilterBarConfig({
            active: false
        });
        this.asset = {
            lookup: {},
            el: undefined,
            client: new Map(),
            account: new Map(),
            campaign: new Map(),
            triggerFields: ['name', 'archived', 'deleted_at', 'client_id', 'account_id', 'campaign_id'],
            views: ['client', 'account', 'campaign']
        };
        this.event = {
            data: new Subject(),
            config: new Subject(),
            bubble: new Subject()
        };
        this.filter = {};
        this.entities = [
            new CacFilterBarEntityConfig({
                sort_order: 0,
                internal_name: 'client',
                name: 'Client(s)',
                options: [],
                parent_link: null,
                child_link: 'client_id',
                single: false,
                visible: true
            }),
            new CacFilterBarEntityConfig({
                sort_order: 1,
                internal_name: 'account',
                name: 'Account(s)',
                options: [],
                parent_link: 'client_id',
                child_link: 'account_id',
                single: false,
                visible: true,
            }),
            new CacFilterBarEntityConfig({
                sort_order: 2,
                internal_name: 'campaign',
                name: 'Campaigns(s)',
                options: [],
                parent_link: 'account_id',
                child_link: null,
                single: false,
                visible: true
            }),
        ];
        this._init().then(() => true);
    }
    _init() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            yield this.APP_GLOBAL.isVerified();
            if (IsObject(PopBusiness, ['id']) && IsObject(PopUser, ['id'])) {
                this._getFilterStorage(); // retrieve any session data
            }
            else {
                this.config.active = false;
                return resolve(false);
            }
            this.dom.setSubscriber(`crud-events`, this.crud.events.subscribe((event) => {
                if (IsValidFieldPatchEvent({}, event)) {
                    const internalName = StorageGetter(event.config, ['metadata', 'internal_name'], null);
                    if (internalName && this.asset.views.includes(internalName) && this.asset.triggerFields.includes(event.config.name)) {
                        this._triggerDataRefresh('Patch');
                    }
                }
                else {
                    if (event.internal_name && event.type === 'entity' && this.asset.views.includes(event.internal_name)) {
                        if (event.method === 'archive') {
                            const entity = this.entities.find((e) => e.internal_name);
                            const filter = this.filter[entity.internal_name];
                            const archive = event.data;
                            if (archive) {
                                let id;
                                if (IsString(event.id, true)) {
                                    if (String(event.id).includes(',')) {
                                        id = String(event.id).split(',').map(x => +x);
                                    }
                                    else {
                                        id = [+event.id];
                                    }
                                }
                                else if (IsNumber(event.id)) {
                                    id = [+event.data.id];
                                }
                                let setFilter = false;
                                id.map((x) => {
                                    delete entity.hidden[x];
                                    delete entity.display[x];
                                    delete entity.selected[x];
                                    if (IsArray(filter, true)) {
                                        const index = filter.indexOf(String(x), 0);
                                        if (index > -1) {
                                            setFilter = true;
                                            filter.splice(index, 1);
                                        }
                                    }
                                });
                                if (setFilter) {
                                    this.setFilter(this.filter);
                                }
                            }
                            this._triggerDataRefresh('archive', 1);
                        }
                        if (event.method === 'create') {
                            const entity = this.entities.find((e) => e.internal_name);
                            this._triggerDataRefresh('create', 1);
                        }
                    }
                }
            }));
            return resolve(false);
        }));
    }
    register(el) {
        this.asset.el = el;
    }
    getEntities() {
        return this.entities;
    }
    getFilter() {
        return this.filter;
    }
    /**
     * Return the filter bar config
     */
    getConfig() {
        return this.config;
    }
    setFilter(filter) {
        this.filter = {};
        if (IsObject(PopBusiness, ['id'])) {
            if (IsArray(filter.client, true))
                this.filter.client = filter.client;
            if (this.config.view.includes('account') && IsArray(filter.account, true)) {
                this.filter.account = filter.account;
            }
            else {
                if (IsArray(filter.client, true)) {
                    const clients = filter.client.map(c => +c);
                    filter.account = this.entities[1].options.filter((account) => {
                        return +account.client_id && clients.includes(account.client_id);
                    }).map(a => String(a.id));
                    this.filter.account = filter.account;
                }
            }
            if (this.config.view.includes('campaign') && IsArray(filter.campaign, true)) {
                this.filter.campaign = filter.campaign;
            }
            else {
                if (IsArray(filter.account, true)) {
                    const accounts = filter.account.map(c => +c);
                    filter.campaign = this.entities[2].options.filter((campaign) => {
                        return +campaign.account_id && accounts.includes(campaign.account_id);
                    }).map(c => String(c.id));
                    console.log('filter.campaign', filter.campaign);
                    this.filter.campaign = filter.campaign;
                }
            }
            SetSessionSiteVar(`Business.${PopBusiness.id}.Filter.Entities`, filter);
            SetPopFilter(filter);
        }
    }
    getElHeight() {
        if (this.asset.el) {
            return this.asset.el.nativeElement.lastChild.clientHeight;
        }
        return 0;
    }
    getHeight() {
        if (IsObject(PopBusiness, ['id'])) {
            const open = GetSessionSiteVar(`Business.${PopBusiness.id}.Filter.open`, false);
            if (+open) {
                return 281;
            }
            else {
                return 101;
            }
        }
        return 0;
    }
    /**
     * Clear any existing filters
     * @param app
     */
    clearFilters() {
        this.setFilter({});
    }
    /**
     * Trigger update trigger
     * @param type strings
     * @returns void
     */
    onChange(event) {
        setTimeout(() => {
            this.event.bubble.next(event);
        }, 0);
    }
    /**
     * Ask whether the filter bar is active or not
     */
    isActive() {
        return this.config.active;
    }
    refresh() {
        this.event.bubble.next({
            source: 'PopFilterBarService',
            type: 'filter',
            name: 'refresh',
        });
    }
    /**
     * Toggle whether to include archived records
     * @param active
     */
    setArchived(archived) {
        if (this.config) {
            this.config.archived = archived;
            this.event.bubble.next({
                source: 'PopFilterBarService',
                type: 'filter',
                name: 'archived',
                data: archived
            });
        }
    }
    /**
     * Toggle the filer bar on and off
     * @param active
     */
    setActive(active) {
        if (this.config) {
            this.config.active = active;
            this.event.bubble.next({
                source: 'PopFilterBarService',
                type: 'filter',
                name: 'state',
                model: 'active'
            });
        }
    }
    /**
     * Toggle the Loader
     * @param loader
     */
    setLoader(loader) {
        if (this.config) {
            this.config.loader = loader;
        }
    }
    /**
     * Change the display state of the filter bar
     * @param display
     */
    setDisplay(display) {
        if (this.config) {
            if (!['default', 'static', 'float'].includes(display))
                display = 'default';
            this.config.display = display;
        }
    }
    /**
     * Change the display state of the filter bar
     * @param display
     */
    setView(view) {
        if (IsArray(view)) {
            this.config.view = view;
            this.entities.map((entity) => {
                entity.visible = this.config.view.includes(entity.internal_name);
            });
        }
    }
    getAsset(internal_name, id) {
        if (internal_name in this.asset) {
            return this.asset[internal_name].get(+id);
        }
        return null;
    }
    setData(caller, allowCache = true) {
        PopLog.info(this.name, `setData`, caller);
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let cache;
            if (allowCache && IsObject(PopBusiness, ['id'])) {
                try {
                    cache = GetSessionSiteVar(`Business.${PopBusiness.id}.Filter.Data`);
                    cache = JSON.parse(atob(cache));
                }
                catch (e) {
                }
            }
            if (IsArray(cache, true)) {
                this._transFormData(cache);
                this._triggerDataRefresh('init');
                return resolve(true);
            }
            else {
                // this.config.loader = true;
                const url = `clients?select=id,name,client_id,account_id,campaign_id,allaccounts,allcampaigns&archived=0&with=allaccounts.allcampaigns&limit=500`;
                this.dom.setSubscriber(`data-fetch`, PopRequest.doGet(url, {}, 1, false).subscribe((x) => {
                    if (x.data)
                        x = x.data;
                    if (IsObject(PopBusiness, ['id'])) {
                        try {
                            SetSessionSiteVar(`Business.${PopBusiness.id}.Filter.Data`, btoa(JSON.stringify(x)));
                        }
                        catch (e) {
                        }
                    }
                    this._transFormData(x);
                    // this.config.loader = false;
                    return resolve(true);
                }, () => {
                    return resolve(false);
                }));
            }
        }));
    }
    setConfigAliases() {
        this.entities.map((entity) => {
            entity.name = PopPipe.transform(entity.internal_name, { type: 'entity', arg1: 'alias', arg2: 'singular' }) + '(s)';
        });
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    _triggerDataRefresh(caller, seconds = 10) {
        this.dom.setTimeout('lazy-load-filter-data', () => {
            this.setData(`_triggerDataRefresh`, false).then(() => {
                this.event.data.next(caller);
            });
        }, (seconds * 1000));
    }
    _transFormData(x) {
        const data = this._setDataStructure(x);
        Object.keys(data).map(key => {
            this.pipe.setAsset(key, data[key]);
            PopLog.init(this.name, `Transfer asset to PipeService: ${key}`);
        });
        this.entities[0].options = Object.values(data.client).sort((a, b) => {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        });
        this.entities[1].options = Object.values(data.account).sort((a, b) => {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        });
        this.entities[2].options = Object.values(data.campaign).sort((a, b) => {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        });
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Retrieves any filter settings from session storage
     */
    _getFilterStorage() {
        let filter = {};
        if (IsObject(PopBusiness, ['id'])) {
            filter = GetSessionSiteVar(`Business.${PopBusiness.id}.Filter.Entities`, {});
            if (IsArray(filter.client, true)) {
                const client = this.entities[0];
                if (!IsObject(client.selected))
                    client.selected = {};
                filter.client.map((c) => {
                    client.selected[c.id] = true;
                });
            }
            if (IsArray(filter.account, true)) {
                const account = this.entities[1];
                if (!IsObject(account.selected))
                    account.selected = {};
                filter.account.map((a) => {
                    account.selected[a.id] = true;
                });
            }
            if (IsArray(filter.campaign, true)) {
                const campaign = this.entities[2];
                if (!IsObject(campaign.selected))
                    campaign.selected = {};
                filter.campaign.map((c) => {
                    campaign.selected[c.id] = true;
                });
            }
            // this.asset.views.map((internal_name: string) => {
            //   if( !IsArray(filter[ internal_name ], true) ) delete filter[ internal_name ];
            // });
            SetPopFilter(filter);
        }
        this.filter = filter;
    }
    _setDataStructure(res) {
        const data = {
            client: {},
            account: {},
            campaign: {}
        };
        if (IsArray(res, true)) {
            res.map((client) => {
                data.client[+client.id] = {
                    id: +client.id,
                    name: client.name,
                    archived: client.archived,
                };
                // this.asset.client.set(+client.id, data.client[ +client.id ]);
                if (IsArray(client.allaccounts, true)) {
                    client.allaccounts.map((account) => {
                        if (IsObject(account)) {
                            data.account[+account.id] = {
                                id: +account.id,
                                name: account.name,
                                client_id: +account.client_id,
                                archived: +account.archived,
                            };
                            // this.asset.account.set(+account.id, data.account[ +account.id ]);
                            if (IsArray(account.allcampaigns, true)) {
                                account.allcampaigns.map((campaign) => {
                                    if (IsObject(campaign)) {
                                        data.campaign[+campaign.id] = {
                                            id: +campaign.id,
                                            name: campaign.name,
                                            client_id: +client.id,
                                            account_id: +campaign.account_id,
                                            archived: +campaign.archived,
                                        };
                                        // this.asset.campaign.set(+campaign.id, data.campaign[ +campaign.id ]);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
        return data;
    }
}
PopCacFilterBarService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopCacFilterBarService_Factory() { return new PopCacFilterBarService(i0.ɵɵinject(i1.PopEntityEventService), i0.ɵɵinject(i2.PopPipeService), i0.ɵɵinject("APP_GLOBAL")); }, token: PopCacFilterBarService, providedIn: "root" });
PopCacFilterBarService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopCacFilterBarService.ctorParameters = () => [
    { type: PopEntityEventService },
    { type: PopPipeService },
    { type: undefined, decorators: [{ type: Inject, args: ['APP_GLOBAL',] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWNhYy1maWx0ZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2FwcC9wb3AtY2FjLWZpbHRlci9wb3AtY2FjLWZpbHRlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQWMsTUFBTSxFQUFFLFVBQVUsRUFBYSxNQUFNLGVBQWUsQ0FBQztBQUMxRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQy9CLE9BQU8sRUFJTCxXQUFXLEVBQ1gsT0FBTyxFQUNQLE1BQU0sRUFDTixPQUFPLEVBQ1AsWUFBWSxFQUFjLFVBQVUsR0FDckMsTUFBTSwyQkFBMkIsQ0FBQztBQUNuQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3pJLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3RGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBQ3ZGLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQzs7OztBQU1wRSxNQUFNLE9BQU8sc0JBQXVCLFNBQVEsZ0JBQWdCO0lBK0QxRCxZQUNVLElBQTJCLEVBQzNCLElBQW9CLEVBQ0ksVUFBOEI7UUFFOUQsS0FBSyxFQUFFLENBQUM7UUFKQSxTQUFJLEdBQUosSUFBSSxDQUF1QjtRQUMzQixTQUFJLEdBQUosSUFBSSxDQUFnQjtRQUNJLGVBQVUsR0FBVixV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LENBQUUsRUFBRTtnQ0FDekMsT0FBTyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUUsQ0FBRSxRQUFhLEVBQUcsRUFBRTtvQ0FDNUMsSUFBSSxRQUFRLENBQUUsUUFBUSxDQUFFLEVBQUU7d0NBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFFLEdBQUc7NENBQzlCLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFOzRDQUNoQixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUk7NENBQ25CLFNBQVMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFOzRDQUNyQixVQUFVLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBVTs0Q0FDaEMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVE7eUNBQzdCLENBQUM7d0NBQ0Ysd0VBQXdFO3FDQUN6RTtnQ0FDSCxDQUFDLENBQUUsQ0FBQzs2QkFDTDt5QkFDRjtvQkFDSCxDQUFDLENBQUUsQ0FBQztpQkFDTDtZQUNILENBQUMsQ0FBRSxDQUFDO1NBQ0w7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7Ozs7WUFyZ0JGLFVBQVUsU0FBRTtnQkFDWCxVQUFVLEVBQUUsTUFBTTthQUNuQjs7O1lBUFEscUJBQXFCO1lBRXJCLGNBQWM7NENBd0VsQixNQUFNLFNBQUUsWUFBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVsZW1lbnRSZWYsIEluamVjdCwgSW5qZWN0YWJsZSwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge1xuICBFbnRpdHksXG4gIE9wdGlvbkl0ZW0sXG4gIFBvcEJhc2VFdmVudEludGVyZmFjZSxcbiAgUG9wQnVzaW5lc3MsXG4gIFBvcFBpcGUsXG4gIFBvcExvZyxcbiAgUG9wVXNlcixcbiAgU2V0UG9wRmlsdGVyLCBDb3JlQ29uZmlnLCBQb3BSZXF1ZXN0LCBBcHBHbG9iYWxJbnRlcmZhY2UsIFBvcEVudGl0eSxcbn0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBHZXRTZXNzaW9uU2l0ZVZhciwgSXNBcnJheSwgSXNOdW1iZXIsIElzT2JqZWN0LCBJc1N0cmluZywgU2V0U2Vzc2lvblNpdGVWYXIsIFN0b3JhZ2VHZXR0ZXIgfSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHsgUG9wRXh0ZW5kU2VydmljZSB9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1leHRlbmQuc2VydmljZSc7XG5pbXBvcnQgeyBDYWNGaWx0ZXJCYXJDb25maWcsIENhY0ZpbHRlckJhckVudGl0eUNvbmZpZyB9IGZyb20gJy4vcG9wLWNhYy1maWx0ZXIubW9kZWwnO1xuaW1wb3J0IHsgUG9wRW50aXR5RXZlbnRTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vZW50aXR5L3NlcnZpY2VzL3BvcC1lbnRpdHktZXZlbnQuc2VydmljZSc7XG5pbXBvcnQgeyBJc1ZhbGlkRmllbGRQYXRjaEV2ZW50IH0gZnJvbSAnLi4vLi4vZW50aXR5L3BvcC1lbnRpdHktdXRpbGl0eSc7XG5pbXBvcnQgeyBQb3BQaXBlU2VydmljZSB9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1waXBlLnNlcnZpY2UnO1xuXG5cbkBJbmplY3RhYmxlKCB7XG4gIHByb3ZpZGVkSW46ICdyb290J1xufSApXG5leHBvcnQgY2xhc3MgUG9wQ2FjRmlsdGVyQmFyU2VydmljZSBleHRlbmRzIFBvcEV4dGVuZFNlcnZpY2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBsb2FkaW5nID0gZmFsc2U7XG5cbiAgcHVibGljIG5hbWUgPSAnUG9wQ2xpZW50RmlsdGVyQmFyU2VydmljZSc7XG5cbiAgcHJpdmF0ZSBjb25maWc6IENhY0ZpbHRlckJhckNvbmZpZyA9IG5ldyBDYWNGaWx0ZXJCYXJDb25maWcoXG4gICAge1xuICAgICAgYWN0aXZlOiBmYWxzZVxuICAgIH1cbiAgKTtcblxuICBwcm90ZWN0ZWQgYXNzZXQgPSB7XG4gICAgbG9va3VwOiB7fSxcbiAgICBlbDogPEVsZW1lbnRSZWY8YW55Pj51bmRlZmluZWQsXG4gICAgY2xpZW50OiA8IE1hcDxudW1iZXIsIEVudGl0eT4gPm5ldyBNYXA8bnVtYmVyLCBFbnRpdHk+KCksXG4gICAgYWNjb3VudDogPCBNYXA8bnVtYmVyLCBFbnRpdHk+ID5uZXcgTWFwPG51bWJlciwgRW50aXR5PigpLFxuICAgIGNhbXBhaWduOiA8IE1hcDxudW1iZXIsIEVudGl0eT4gPm5ldyBNYXA8bnVtYmVyLCBFbnRpdHk+KCksXG4gICAgdHJpZ2dlckZpZWxkczogWyAnbmFtZScsICdhcmNoaXZlZCcsICdkZWxldGVkX2F0JywgJ2NsaWVudF9pZCcsICdhY2NvdW50X2lkJywgJ2NhbXBhaWduX2lkJyBdLFxuICAgIHZpZXdzOiBbICdjbGllbnQnLCAnYWNjb3VudCcsICdjYW1wYWlnbicgXVxuICB9O1xuXG4gIGV2ZW50ID0ge1xuICAgIGRhdGE6IG5ldyBTdWJqZWN0PHN0cmluZz4oKSxcbiAgICBjb25maWc6IG5ldyBTdWJqZWN0PENhY0ZpbHRlckJhckVudGl0eUNvbmZpZ1tdPigpLFxuICAgIGJ1YmJsZTogbmV3IFN1YmplY3Q8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPigpXG4gIH07XG5cbiAgcHJpdmF0ZSBmaWx0ZXI6IHsgY2xpZW50PzogbnVtYmVyW10sIGFjY291bnQ/OiBudW1iZXJbXSwgY2FtcGFpZ24/OiBudW1iZXJbXSB9ID0ge307XG5cbiAgcHJpdmF0ZSByZWFkb25seSBlbnRpdGllcyA9IDxDYWNGaWx0ZXJCYXJFbnRpdHlDb25maWdbXT5bXG4gICAgbmV3IENhY0ZpbHRlckJhckVudGl0eUNvbmZpZygge1xuICAgICAgc29ydF9vcmRlcjogMCxcbiAgICAgIGludGVybmFsX25hbWU6ICdjbGllbnQnLFxuICAgICAgbmFtZTogJ0NsaWVudChzKScsXG4gICAgICBvcHRpb25zOiBbXSxcbiAgICAgIHBhcmVudF9saW5rOiBudWxsLFxuICAgICAgY2hpbGRfbGluazogJ2NsaWVudF9pZCcsXG4gICAgICBzaW5nbGU6IGZhbHNlLFxuICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgIH0gKSxcbiAgICBuZXcgQ2FjRmlsdGVyQmFyRW50aXR5Q29uZmlnKCB7XG4gICAgICBzb3J0X29yZGVyOiAxLFxuICAgICAgaW50ZXJuYWxfbmFtZTogJ2FjY291bnQnLFxuICAgICAgbmFtZTogJ0FjY291bnQocyknLFxuICAgICAgb3B0aW9uczogW10sXG4gICAgICBwYXJlbnRfbGluazogJ2NsaWVudF9pZCcsXG4gICAgICBjaGlsZF9saW5rOiAnYWNjb3VudF9pZCcsXG4gICAgICBzaW5nbGU6IGZhbHNlLFxuICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICB9ICksXG4gICAgbmV3IENhY0ZpbHRlckJhckVudGl0eUNvbmZpZygge1xuICAgICAgc29ydF9vcmRlcjogMixcbiAgICAgIGludGVybmFsX25hbWU6ICdjYW1wYWlnbicsXG4gICAgICBuYW1lOiAnQ2FtcGFpZ25zKHMpJyxcbiAgICAgIG9wdGlvbnM6IFtdLFxuICAgICAgcGFyZW50X2xpbms6ICdhY2NvdW50X2lkJyxcbiAgICAgIGNoaWxkX2xpbms6IG51bGwsXG4gICAgICBzaW5nbGU6IGZhbHNlLFxuICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgIH0gKSxcbiAgXTtcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgY3J1ZDogUG9wRW50aXR5RXZlbnRTZXJ2aWNlLFxuICAgIHByaXZhdGUgcGlwZTogUG9wUGlwZVNlcnZpY2UsXG4gICAgQEluamVjdCggJ0FQUF9HTE9CQUwnICkgcHJpdmF0ZSBBUFBfR0xPQkFMOiBBcHBHbG9iYWxJbnRlcmZhY2UsXG4gICl7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9pbml0KCkudGhlbigoKT0+dHJ1ZSk7XG4gIH1cblxuXG4gIHByaXZhdGUgX2luaXQoKXtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oIGFzeW5jKCByZXNvbHZlICkgPT4ge1xuICAgICAgYXdhaXQgdGhpcy5BUFBfR0xPQkFMLmlzVmVyaWZpZWQoKTtcbiAgICAgIGlmKCBJc09iamVjdCggUG9wQnVzaW5lc3MsIFsgJ2lkJyBdICkgJiYgSXNPYmplY3QoIFBvcFVzZXIsIFsgJ2lkJyBdICkgKXtcbiAgICAgICAgdGhpcy5fZ2V0RmlsdGVyU3RvcmFnZSgpOyAvLyByZXRyaWV2ZSBhbnkgc2Vzc2lvbiBkYXRhXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5jb25maWcuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCBmYWxzZSApO1xuICAgICAgfVxuICAgICAgdGhpcy5kb20uc2V0U3Vic2NyaWJlciggYGNydWQtZXZlbnRzYCwgdGhpcy5jcnVkLmV2ZW50cy5zdWJzY3JpYmUoICggZXZlbnQgKSA9PiB7XG4gICAgICAgIGlmKCBJc1ZhbGlkRmllbGRQYXRjaEV2ZW50KCA8Q29yZUNvbmZpZz57fSwgZXZlbnQgKSApe1xuICAgICAgICAgIGNvbnN0IGludGVybmFsTmFtZSA9IFN0b3JhZ2VHZXR0ZXIoIGV2ZW50LmNvbmZpZywgWyAnbWV0YWRhdGEnLCAnaW50ZXJuYWxfbmFtZScgXSwgbnVsbCApO1xuICAgICAgICAgIGlmKCBpbnRlcm5hbE5hbWUgJiYgdGhpcy5hc3NldC52aWV3cy5pbmNsdWRlcyggaW50ZXJuYWxOYW1lICkgJiYgdGhpcy5hc3NldC50cmlnZ2VyRmllbGRzLmluY2x1ZGVzKCBldmVudC5jb25maWcubmFtZSApICl7XG4gICAgICAgICAgICB0aGlzLl90cmlnZ2VyRGF0YVJlZnJlc2goICdQYXRjaCcgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGlmKCBldmVudC5pbnRlcm5hbF9uYW1lICYmIGV2ZW50LnR5cGUgPT09ICdlbnRpdHknICYmIHRoaXMuYXNzZXQudmlld3MuaW5jbHVkZXMoIGV2ZW50LmludGVybmFsX25hbWUgKSApe1xuICAgICAgICAgICAgaWYoIGV2ZW50Lm1ldGhvZCA9PT0gJ2FyY2hpdmUnICl7XG4gICAgICAgICAgICAgIGNvbnN0IGVudGl0eSA9IHRoaXMuZW50aXRpZXMuZmluZCggKCBlICkgPT4gZS5pbnRlcm5hbF9uYW1lICk7XG4gICAgICAgICAgICAgIGNvbnN0IGZpbHRlciA9IHRoaXMuZmlsdGVyWyBlbnRpdHkuaW50ZXJuYWxfbmFtZSBdO1xuICAgICAgICAgICAgICBjb25zdCBhcmNoaXZlID0gZXZlbnQuZGF0YTtcbiAgICAgICAgICAgICAgaWYoIGFyY2hpdmUgKXtcbiAgICAgICAgICAgICAgICBsZXQgaWQ7XG4gICAgICAgICAgICAgICAgaWYoIElzU3RyaW5nKCBldmVudC5pZCwgdHJ1ZSApICl7XG4gICAgICAgICAgICAgICAgICBpZiggU3RyaW5nKGV2ZW50LmlkKS5pbmNsdWRlcyggJywnICkgKXtcbiAgICAgICAgICAgICAgICAgICAgaWQgPSBTdHJpbmcoIGV2ZW50LmlkICkuc3BsaXQoICcsJyApLm1hcCggeCA9PiAreCApO1xuICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGlkID0gWyArZXZlbnQuaWQgXTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ZWxzZSBpZiggSXNOdW1iZXIoIGV2ZW50LmlkICkgKXtcbiAgICAgICAgICAgICAgICAgIGlkID0gWyArZXZlbnQuZGF0YS5pZCBdO1xuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAgICAgbGV0IHNldEZpbHRlciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlkLm1hcCggKCB4ICkgPT4ge1xuICAgICAgICAgICAgICAgICAgZGVsZXRlIGVudGl0eS5oaWRkZW5bIHggXTtcbiAgICAgICAgICAgICAgICAgIGRlbGV0ZSBlbnRpdHkuZGlzcGxheVsgeCBdO1xuICAgICAgICAgICAgICAgICAgZGVsZXRlIGVudGl0eS5zZWxlY3RlZFsgeCBdO1xuICAgICAgICAgICAgICAgICAgaWYoIElzQXJyYXkoIGZpbHRlciwgdHJ1ZSApICl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gZmlsdGVyLmluZGV4T2YoIFN0cmluZyggeCApLCAwICk7XG4gICAgICAgICAgICAgICAgICAgIGlmKCBpbmRleCA+IC0xICl7XG4gICAgICAgICAgICAgICAgICAgICAgc2V0RmlsdGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXIuc3BsaWNlKCBpbmRleCwgMSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgaWYoIHNldEZpbHRlciApe1xuICAgICAgICAgICAgICAgICAgdGhpcy5zZXRGaWx0ZXIoIHRoaXMuZmlsdGVyICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJEYXRhUmVmcmVzaCggJ2FyY2hpdmUnLCAxICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiggZXZlbnQubWV0aG9kID09PSAnY3JlYXRlJyApe1xuICAgICAgICAgICAgICBjb25zdCBlbnRpdHkgPSB0aGlzLmVudGl0aWVzLmZpbmQoICggZSApID0+IGUuaW50ZXJuYWxfbmFtZSApO1xuICAgICAgICAgICAgICB0aGlzLl90cmlnZ2VyRGF0YVJlZnJlc2goICdjcmVhdGUnLCAxICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9ICkgKTtcblxuICAgICAgcmV0dXJuIHJlc29sdmUoIGZhbHNlICk7XG4gICAgfSApO1xuICB9XG5cblxuICBwdWJsaWMgcmVnaXN0ZXIoIGVsOiBFbGVtZW50UmVmPGFueT4gKXtcbiAgICB0aGlzLmFzc2V0LmVsID0gZWw7XG4gIH1cblxuXG4gIGdldEVudGl0aWVzKCk6IENhY0ZpbHRlckJhckVudGl0eUNvbmZpZ1tde1xuICAgIHJldHVybiB0aGlzLmVudGl0aWVzO1xuICB9XG5cblxuICBnZXRGaWx0ZXIoKXtcbiAgICByZXR1cm4gdGhpcy5maWx0ZXI7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIGZpbHRlciBiYXIgY29uZmlnXG4gICAqL1xuICBnZXRDb25maWcoKTogQ2FjRmlsdGVyQmFyQ29uZmlne1xuICAgIHJldHVybiB0aGlzLmNvbmZpZztcbiAgfVxuXG5cbiAgcHVibGljIHNldEZpbHRlciggZmlsdGVyOiB7IGNsaWVudD86IG51bWJlcltdLCBhY2NvdW50PzogbnVtYmVyW10sIGNhbXBhaWduPzogbnVtYmVyW10gfSApe1xuICAgIHRoaXMuZmlsdGVyID0ge307XG4gICAgaWYoIElzT2JqZWN0KCBQb3BCdXNpbmVzcywgWyAnaWQnIF0gKSApe1xuICAgICAgaWYoIElzQXJyYXkoIGZpbHRlci5jbGllbnQsIHRydWUgKSApIHRoaXMuZmlsdGVyLmNsaWVudCA9IGZpbHRlci5jbGllbnQ7XG5cbiAgICAgIGlmKCB0aGlzLmNvbmZpZy52aWV3LmluY2x1ZGVzKCAnYWNjb3VudCcgKSAmJiBJc0FycmF5KCBmaWx0ZXIuYWNjb3VudCwgdHJ1ZSApICl7XG4gICAgICAgIHRoaXMuZmlsdGVyLmFjY291bnQgPSBmaWx0ZXIuYWNjb3VudDtcbiAgICAgIH1lbHNle1xuICAgICAgICBpZiggSXNBcnJheSggZmlsdGVyLmNsaWVudCwgdHJ1ZSApICl7XG4gICAgICAgICAgY29uc3QgY2xpZW50cyA9IGZpbHRlci5jbGllbnQubWFwKCBjID0+ICtjICk7XG4gICAgICAgICAgZmlsdGVyLmFjY291bnQgPSA8YW55PnRoaXMuZW50aXRpZXNbIDEgXS5vcHRpb25zLmZpbHRlciggKCBhY2NvdW50ICkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICthY2NvdW50LmNsaWVudF9pZCAgJiYgY2xpZW50cy5pbmNsdWRlcyggYWNjb3VudC5jbGllbnRfaWQgKTtcbiAgICAgICAgICB9ICkubWFwKCBhID0+IFN0cmluZyggYS5pZCApICk7XG4gICAgICAgICAgdGhpcy5maWx0ZXIuYWNjb3VudCA9IGZpbHRlci5hY2NvdW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiggdGhpcy5jb25maWcudmlldy5pbmNsdWRlcyggJ2NhbXBhaWduJyApICYmIElzQXJyYXkoIGZpbHRlci5jYW1wYWlnbiwgdHJ1ZSApICl7XG4gICAgICAgIHRoaXMuZmlsdGVyLmNhbXBhaWduID0gZmlsdGVyLmNhbXBhaWduO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKCBJc0FycmF5KCBmaWx0ZXIuYWNjb3VudCwgdHJ1ZSApICl7XG4gICAgICAgICAgY29uc3QgYWNjb3VudHMgPSBmaWx0ZXIuYWNjb3VudC5tYXAoIGMgPT4gK2MgKTtcbiAgICAgICAgICBmaWx0ZXIuY2FtcGFpZ24gPSA8YW55PnRoaXMuZW50aXRpZXNbIDIgXS5vcHRpb25zLmZpbHRlciggKCBjYW1wYWlnbiApID0+IHtcbiAgICAgICAgICAgIHJldHVybiArY2FtcGFpZ24uYWNjb3VudF9pZCAmJiBhY2NvdW50cy5pbmNsdWRlcyggY2FtcGFpZ24uYWNjb3VudF9pZCApO1xuICAgICAgICAgIH0gKS5tYXAoIGMgPT4gU3RyaW5nKCBjLmlkICkgKTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnZmlsdGVyLmNhbXBhaWduJywgZmlsdGVyLmNhbXBhaWduKTtcbiAgICAgICAgICB0aGlzLmZpbHRlci5jYW1wYWlnbiA9IGZpbHRlci5jYW1wYWlnbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgU2V0U2Vzc2lvblNpdGVWYXIoIGBCdXNpbmVzcy4ke1BvcEJ1c2luZXNzLmlkfS5GaWx0ZXIuRW50aXRpZXNgLCBmaWx0ZXIgKTtcbiAgICAgIFNldFBvcEZpbHRlciggZmlsdGVyICk7XG4gICAgfVxuICB9XG5cblxuICBnZXRFbEhlaWdodCgpOiBudW1iZXJ7XG4gICAgaWYoIHRoaXMuYXNzZXQuZWwgKXtcbiAgICAgIHJldHVybiB0aGlzLmFzc2V0LmVsLm5hdGl2ZUVsZW1lbnQubGFzdENoaWxkLmNsaWVudEhlaWdodDtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuXG4gIGdldEhlaWdodCgpOiBudW1iZXJ7XG4gICAgaWYoIElzT2JqZWN0KCBQb3BCdXNpbmVzcywgWyAnaWQnIF0gKSApe1xuICAgICAgY29uc3Qgb3BlbiA9IEdldFNlc3Npb25TaXRlVmFyKCBgQnVzaW5lc3MuJHtQb3BCdXNpbmVzcy5pZH0uRmlsdGVyLm9wZW5gLCBmYWxzZSApO1xuICAgICAgaWYoICtvcGVuICl7XG4gICAgICAgIHJldHVybiAyODE7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIDEwMTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDbGVhciBhbnkgZXhpc3RpbmcgZmlsdGVyc1xuICAgKiBAcGFyYW0gYXBwXG4gICAqL1xuICBwdWJsaWMgY2xlYXJGaWx0ZXJzKCl7XG4gICAgdGhpcy5zZXRGaWx0ZXIoe30pO1xuICB9XG5cblxuICAvKipcbiAgICogVHJpZ2dlciB1cGRhdGUgdHJpZ2dlclxuICAgKiBAcGFyYW0gdHlwZSBzdHJpbmdzXG4gICAqIEByZXR1cm5zIHZvaWRcbiAgICovXG4gIG9uQ2hhbmdlKCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICl7XG4gICAgc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgdGhpcy5ldmVudC5idWJibGUubmV4dCggZXZlbnQgKTtcbiAgICB9LCAwICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBc2sgd2hldGhlciB0aGUgZmlsdGVyIGJhciBpcyBhY3RpdmUgb3Igbm90XG4gICAqL1xuICBpc0FjdGl2ZSgpOiBib29sZWFue1xuICAgIHJldHVybiB0aGlzLmNvbmZpZy5hY3RpdmU7XG4gIH1cblxuXG4gIHJlZnJlc2goKXtcbiAgICB0aGlzLmV2ZW50LmJ1YmJsZS5uZXh0KCB7XG4gICAgICBzb3VyY2U6ICdQb3BGaWx0ZXJCYXJTZXJ2aWNlJyxcbiAgICAgIHR5cGU6ICdmaWx0ZXInLFxuICAgICAgbmFtZTogJ3JlZnJlc2gnLFxuICAgIH0gKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRvZ2dsZSB3aGV0aGVyIHRvIGluY2x1ZGUgYXJjaGl2ZWQgcmVjb3Jkc1xuICAgKiBAcGFyYW0gYWN0aXZlXG4gICAqL1xuICBzZXRBcmNoaXZlZCggYXJjaGl2ZWQ6IGJvb2xlYW4gKXtcbiAgICBpZiggdGhpcy5jb25maWcgKXtcbiAgICAgIHRoaXMuY29uZmlnLmFyY2hpdmVkID0gYXJjaGl2ZWQ7XG4gICAgICB0aGlzLmV2ZW50LmJ1YmJsZS5uZXh0KCB7XG4gICAgICAgIHNvdXJjZTogJ1BvcEZpbHRlckJhclNlcnZpY2UnLFxuICAgICAgICB0eXBlOiAnZmlsdGVyJyxcbiAgICAgICAgbmFtZTogJ2FyY2hpdmVkJyxcbiAgICAgICAgZGF0YTogYXJjaGl2ZWRcbiAgICAgIH0gKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUb2dnbGUgdGhlIGZpbGVyIGJhciBvbiBhbmQgb2ZmXG4gICAqIEBwYXJhbSBhY3RpdmVcbiAgICovXG4gIHNldEFjdGl2ZSggYWN0aXZlOiBib29sZWFuICl7XG4gICAgaWYoIHRoaXMuY29uZmlnICl7XG4gICAgICB0aGlzLmNvbmZpZy5hY3RpdmUgPSBhY3RpdmU7XG4gICAgICB0aGlzLmV2ZW50LmJ1YmJsZS5uZXh0KCB7XG4gICAgICAgIHNvdXJjZTogJ1BvcEZpbHRlckJhclNlcnZpY2UnLFxuICAgICAgICB0eXBlOiAnZmlsdGVyJyxcbiAgICAgICAgbmFtZTogJ3N0YXRlJyxcbiAgICAgICAgbW9kZWw6ICdhY3RpdmUnXG4gICAgICB9ICk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVG9nZ2xlIHRoZSBMb2FkZXJcbiAgICogQHBhcmFtIGxvYWRlclxuICAgKi9cbiAgc2V0TG9hZGVyKCBsb2FkZXI6IGJvb2xlYW4gKXtcbiAgICBpZiggdGhpcy5jb25maWcgKXtcbiAgICAgIHRoaXMuY29uZmlnLmxvYWRlciA9IGxvYWRlcjtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIGRpc3BsYXkgc3RhdGUgb2YgdGhlIGZpbHRlciBiYXJcbiAgICogQHBhcmFtIGRpc3BsYXlcbiAgICovXG4gIHNldERpc3BsYXkoIGRpc3BsYXk6IGFueSApe1xuICAgIGlmKCB0aGlzLmNvbmZpZyApe1xuICAgICAgaWYoICFbICdkZWZhdWx0JywgJ3N0YXRpYycsICdmbG9hdCcgXS5pbmNsdWRlcyggZGlzcGxheSApICkgZGlzcGxheSA9ICdkZWZhdWx0JztcbiAgICAgIHRoaXMuY29uZmlnLmRpc3BsYXkgPSBkaXNwbGF5O1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIENoYW5nZSB0aGUgZGlzcGxheSBzdGF0ZSBvZiB0aGUgZmlsdGVyIGJhclxuICAgKiBAcGFyYW0gZGlzcGxheVxuICAgKi9cbiAgc2V0Vmlldyggdmlldzogc3RyaW5nW10gKXtcbiAgICBpZiggSXNBcnJheSggdmlldyApICl7XG4gICAgICB0aGlzLmNvbmZpZy52aWV3ID0gdmlldztcbiAgICAgIHRoaXMuZW50aXRpZXMubWFwKCAoIGVudGl0eSApID0+IHtcbiAgICAgICAgZW50aXR5LnZpc2libGUgPSB0aGlzLmNvbmZpZy52aWV3LmluY2x1ZGVzKCBlbnRpdHkuaW50ZXJuYWxfbmFtZSApO1xuICAgICAgfSApO1xuICAgIH1cbiAgfVxuXG5cbiAgZ2V0QXNzZXQoIGludGVybmFsX25hbWU6IHN0cmluZywgaWQ6IG51bWJlciApe1xuICAgIGlmKCBpbnRlcm5hbF9uYW1lIGluIHRoaXMuYXNzZXQgKXtcbiAgICAgIHJldHVybiB0aGlzLmFzc2V0WyBpbnRlcm5hbF9uYW1lIF0uZ2V0KCAraWQgKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuXG4gIHNldERhdGEoIGNhbGxlcjogc3RyaW5nLCBhbGxvd0NhY2hlID0gdHJ1ZSApOiBQcm9taXNlPGJvb2xlYW4+e1xuICAgIFBvcExvZy5pbmZvKCB0aGlzLm5hbWUsIGBzZXREYXRhYCwgY2FsbGVyICk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KCBhc3luYyggcmVzb2x2ZSApID0+IHtcbiAgICAgIGxldCBjYWNoZTtcbiAgICAgIGlmKCBhbGxvd0NhY2hlICYmIElzT2JqZWN0KCBQb3BCdXNpbmVzcywgWyAnaWQnIF0gKSApe1xuICAgICAgICB0cnl7XG4gICAgICAgICAgY2FjaGUgPSBHZXRTZXNzaW9uU2l0ZVZhciggYEJ1c2luZXNzLiR7UG9wQnVzaW5lc3MuaWR9LkZpbHRlci5EYXRhYCApO1xuICAgICAgICAgIGNhY2hlID0gSlNPTi5wYXJzZSggYXRvYiggY2FjaGUgKSApO1xuICAgICAgICB9Y2F0Y2goIGUgKXtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYoIElzQXJyYXkoIGNhY2hlLCB0cnVlICkgKXtcbiAgICAgICAgdGhpcy5fdHJhbnNGb3JtRGF0YSggY2FjaGUgKTtcbiAgICAgICAgdGhpcy5fdHJpZ2dlckRhdGFSZWZyZXNoKCAnaW5pdCcgKTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgIH1lbHNle1xuICAgICAgICAvLyB0aGlzLmNvbmZpZy5sb2FkZXIgPSB0cnVlO1xuICAgICAgICBjb25zdCB1cmwgPSBgY2xpZW50cz9zZWxlY3Q9aWQsbmFtZSxjbGllbnRfaWQsYWNjb3VudF9pZCxjYW1wYWlnbl9pZCxhbGxhY2NvdW50cyxhbGxjYW1wYWlnbnMmYXJjaGl2ZWQ9MCZ3aXRoPWFsbGFjY291bnRzLmFsbGNhbXBhaWducyZsaW1pdD01MDBgO1xuICAgICAgICB0aGlzLmRvbS5zZXRTdWJzY3JpYmVyKCBgZGF0YS1mZXRjaGAsIFBvcFJlcXVlc3QuZG9HZXQoIHVybCwge30sIDEsIGZhbHNlICkuc3Vic2NyaWJlKCAoIHggKSA9PiB7XG4gICAgICAgICAgaWYoIHguZGF0YSApIHggPSB4LmRhdGE7XG4gICAgICAgICAgaWYoIElzT2JqZWN0KCBQb3BCdXNpbmVzcywgWyAnaWQnIF0gKSApe1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICBTZXRTZXNzaW9uU2l0ZVZhciggYEJ1c2luZXNzLiR7UG9wQnVzaW5lc3MuaWR9LkZpbHRlci5EYXRhYCwgYnRvYSggSlNPTi5zdHJpbmdpZnkoIHggKSApICk7XG4gICAgICAgICAgICB9Y2F0Y2goIGUgKXtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fdHJhbnNGb3JtRGF0YSggeCApO1xuICAgICAgICAgIC8vIHRoaXMuY29uZmlnLmxvYWRlciA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSggZmFsc2UgKTtcbiAgICAgICAgfSApICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gIH1cblxuXG4gIHNldENvbmZpZ0FsaWFzZXMoKXtcbiAgICB0aGlzLmVudGl0aWVzLm1hcCggKCBlbnRpdHkgKSA9PiB7XG4gICAgICBlbnRpdHkubmFtZSA9IFBvcFBpcGUudHJhbnNmb3JtKCBlbnRpdHkuaW50ZXJuYWxfbmFtZSwgeyB0eXBlOiAnZW50aXR5JywgYXJnMTogJ2FsaWFzJywgYXJnMjogJ3Npbmd1bGFyJyB9ICkgKyAnKHMpJztcbiAgICB9ICk7XG4gIH1cblxuXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfdHJpZ2dlckRhdGFSZWZyZXNoKCBjYWxsZXI6IHN0cmluZywgc2Vjb25kcyA9IDEwICk6IHZvaWR7XG4gICAgdGhpcy5kb20uc2V0VGltZW91dCggJ2xhenktbG9hZC1maWx0ZXItZGF0YScsICgpID0+IHtcbiAgICAgIHRoaXMuc2V0RGF0YSggYF90cmlnZ2VyRGF0YVJlZnJlc2hgLCBmYWxzZSApLnRoZW4oICgpID0+IHtcbiAgICAgICAgdGhpcy5ldmVudC5kYXRhLm5leHQoIGNhbGxlciApO1xuICAgICAgfSApO1xuICAgIH0sICggc2Vjb25kcyAqIDEwMDAgKSApO1xuICB9XG5cblxuICBwcml2YXRlIF90cmFuc0Zvcm1EYXRhKCB4OiBhbnlbXSApOiB2b2lke1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLl9zZXREYXRhU3RydWN0dXJlKCB4ICk7XG5cbiAgICBPYmplY3Qua2V5cyggZGF0YSApLm1hcCgga2V5ID0+IHtcbiAgICAgIHRoaXMucGlwZS5zZXRBc3NldCgga2V5LCBkYXRhWyBrZXkgXSApO1xuICAgICAgUG9wTG9nLmluaXQoIHRoaXMubmFtZSwgYFRyYW5zZmVyIGFzc2V0IHRvIFBpcGVTZXJ2aWNlOiAke2tleX1gICk7XG4gICAgfSApO1xuXG4gICAgdGhpcy5lbnRpdGllc1sgMCBdLm9wdGlvbnMgPSA8YW55Pk9iamVjdC52YWx1ZXMoIGRhdGEuY2xpZW50ICkuc29ydCggKCBhOiBPcHRpb25JdGVtLCBiOiBPcHRpb25JdGVtICkgPT4ge1xuICAgICAgaWYoIGEubmFtZSA8IGIubmFtZSApIHJldHVybiAtMTtcbiAgICAgIGlmKCBhLm5hbWUgPiBiLm5hbWUgKSByZXR1cm4gMTtcbiAgICAgIHJldHVybiAwO1xuICAgIH0gKTtcblxuICAgIHRoaXMuZW50aXRpZXNbIDEgXS5vcHRpb25zID0gPGFueT5PYmplY3QudmFsdWVzKCBkYXRhLmFjY291bnQgKS5zb3J0KCAoIGE6IE9wdGlvbkl0ZW0sIGI6IE9wdGlvbkl0ZW0gKSA9PiB7XG4gICAgICBpZiggYS5uYW1lIDwgYi5uYW1lICkgcmV0dXJuIC0xO1xuICAgICAgaWYoIGEubmFtZSA+IGIubmFtZSApIHJldHVybiAxO1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSApO1xuXG4gICAgdGhpcy5lbnRpdGllc1sgMiBdLm9wdGlvbnMgPSA8YW55Pk9iamVjdC52YWx1ZXMoIGRhdGEuY2FtcGFpZ24gKS5zb3J0KCAoIGE6IE9wdGlvbkl0ZW0sIGI6IE9wdGlvbkl0ZW0gKSA9PiB7XG4gICAgICBpZiggYS5uYW1lIDwgYi5uYW1lICkgcmV0dXJuIC0xO1xuICAgICAgaWYoIGEubmFtZSA+IGIubmFtZSApIHJldHVybiAxO1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSApO1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVuZGVyIFRoZSBIb29kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJpdmF0ZSBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAvKipcbiAgICogUmV0cmlldmVzIGFueSBmaWx0ZXIgc2V0dGluZ3MgZnJvbSBzZXNzaW9uIHN0b3JhZ2VcbiAgICovXG4gIHByaXZhdGUgX2dldEZpbHRlclN0b3JhZ2UoKXtcbiAgICBsZXQgZmlsdGVyID0gPHsgY2xpZW50PzogYW55W10sIGFjY291bnQ/OiBhbnlbXSwgY2FtcGFpZ24/OiBhbnlbXSB9Pnt9O1xuICAgIGlmKCBJc09iamVjdCggUG9wQnVzaW5lc3MsIFsgJ2lkJyBdICkgKXtcbiAgICAgIGZpbHRlciA9IEdldFNlc3Npb25TaXRlVmFyKCBgQnVzaW5lc3MuJHtQb3BCdXNpbmVzcy5pZH0uRmlsdGVyLkVudGl0aWVzYCwge30gKTtcbiAgICAgIGlmKElzQXJyYXkoZmlsdGVyLmNsaWVudCwgdHJ1ZSkpe1xuICAgICAgICBjb25zdCBjbGllbnQgPSB0aGlzLmVudGl0aWVzWzBdO1xuICAgICAgICBpZighSXNPYmplY3QoY2xpZW50LnNlbGVjdGVkKSkgY2xpZW50LnNlbGVjdGVkID0ge307XG4gICAgICAgIGZpbHRlci5jbGllbnQubWFwKChjKT0+e1xuICAgICAgICAgIGNsaWVudC5zZWxlY3RlZFtjLmlkXSA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYoSXNBcnJheShmaWx0ZXIuYWNjb3VudCwgdHJ1ZSkpe1xuICAgICAgICBjb25zdCBhY2NvdW50ID0gdGhpcy5lbnRpdGllc1sxXTtcbiAgICAgICAgaWYoIUlzT2JqZWN0KGFjY291bnQuc2VsZWN0ZWQpKSBhY2NvdW50LnNlbGVjdGVkID0ge307XG4gICAgICAgIGZpbHRlci5hY2NvdW50Lm1hcCgoYSk9PntcbiAgICAgICAgICBhY2NvdW50LnNlbGVjdGVkW2EuaWRdID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZihJc0FycmF5KGZpbHRlci5jYW1wYWlnbiwgdHJ1ZSkpe1xuICAgICAgICBjb25zdCBjYW1wYWlnbiA9IHRoaXMuZW50aXRpZXNbMl07XG4gICAgICAgIGlmKCFJc09iamVjdChjYW1wYWlnbi5zZWxlY3RlZCkpIGNhbXBhaWduLnNlbGVjdGVkID0ge307XG4gICAgICAgIGZpbHRlci5jYW1wYWlnbi5tYXAoKGMpPT57XG4gICAgICAgICAgY2FtcGFpZ24uc2VsZWN0ZWRbYy5pZF0gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIC8vIHRoaXMuYXNzZXQudmlld3MubWFwKChpbnRlcm5hbF9uYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIC8vICAgaWYoICFJc0FycmF5KGZpbHRlclsgaW50ZXJuYWxfbmFtZSBdLCB0cnVlKSApIGRlbGV0ZSBmaWx0ZXJbIGludGVybmFsX25hbWUgXTtcbiAgICAgIC8vIH0pO1xuXG4gICAgICBTZXRQb3BGaWx0ZXIoIGZpbHRlciApO1xuICAgIH1cblxuXG4gICAgdGhpcy5maWx0ZXIgPSBmaWx0ZXI7XG4gIH1cblxuXG4gIHByaXZhdGUgX3NldERhdGFTdHJ1Y3R1cmUoIHJlcyApe1xuICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICBjbGllbnQ6IHt9LFxuICAgICAgYWNjb3VudDoge30sXG4gICAgICBjYW1wYWlnbjoge31cbiAgICB9O1xuXG4gICAgaWYoIElzQXJyYXkoIHJlcywgdHJ1ZSApICl7XG4gICAgICByZXMubWFwKCAoIGNsaWVudCApID0+IHtcbiAgICAgICAgZGF0YS5jbGllbnRbICtjbGllbnQuaWQgXSA9IHtcbiAgICAgICAgICBpZDogK2NsaWVudC5pZCxcbiAgICAgICAgICBuYW1lOiBjbGllbnQubmFtZSxcbiAgICAgICAgICBhcmNoaXZlZDogY2xpZW50LmFyY2hpdmVkLFxuICAgICAgICB9O1xuICAgICAgICAvLyB0aGlzLmFzc2V0LmNsaWVudC5zZXQoK2NsaWVudC5pZCwgZGF0YS5jbGllbnRbICtjbGllbnQuaWQgXSk7XG4gICAgICAgIGlmKCBJc0FycmF5KCBjbGllbnQuYWxsYWNjb3VudHMsIHRydWUgKSApe1xuICAgICAgICAgIGNsaWVudC5hbGxhY2NvdW50cy5tYXAoICggYWNjb3VudDogYW55ICkgPT4ge1xuICAgICAgICAgICAgaWYoIElzT2JqZWN0KCBhY2NvdW50ICkgKXtcbiAgICAgICAgICAgICAgZGF0YS5hY2NvdW50WyArYWNjb3VudC5pZCBdID0ge1xuICAgICAgICAgICAgICAgIGlkOiArYWNjb3VudC5pZCxcbiAgICAgICAgICAgICAgICBuYW1lOiBhY2NvdW50Lm5hbWUsXG4gICAgICAgICAgICAgICAgY2xpZW50X2lkOiArYWNjb3VudC5jbGllbnRfaWQsXG4gICAgICAgICAgICAgICAgYXJjaGl2ZWQ6ICthY2NvdW50LmFyY2hpdmVkLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAvLyB0aGlzLmFzc2V0LmFjY291bnQuc2V0KCthY2NvdW50LmlkLCBkYXRhLmFjY291bnRbICthY2NvdW50LmlkIF0pO1xuICAgICAgICAgICAgICBpZiggSXNBcnJheSggYWNjb3VudC5hbGxjYW1wYWlnbnMsIHRydWUgKSApe1xuICAgICAgICAgICAgICAgIGFjY291bnQuYWxsY2FtcGFpZ25zLm1hcCggKCBjYW1wYWlnbjogYW55ICkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYoIElzT2JqZWN0KCBjYW1wYWlnbiApICl7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuY2FtcGFpZ25bICtjYW1wYWlnbi5pZCBdID0ge1xuICAgICAgICAgICAgICAgICAgICAgIGlkOiArY2FtcGFpZ24uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2FtcGFpZ24ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICBjbGllbnRfaWQ6ICtjbGllbnQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgYWNjb3VudF9pZDogK2NhbXBhaWduLmFjY291bnRfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgYXJjaGl2ZWQ6ICtjYW1wYWlnbi5hcmNoaXZlZCxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5hc3NldC5jYW1wYWlnbi5zZXQoK2NhbXBhaWduLmlkLCBkYXRhLmNhbXBhaWduWyArY2FtcGFpZ24uaWQgXSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cblxufVxuIl19