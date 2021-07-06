import { __awaiter } from "tslib";
import { ChangeDetectorRef, Component, ElementRef, Input } from '@angular/core';
import { TableConfig } from '../../base/pop-table/pop-table.model';
import { PopBaseService } from '../../../services/pop-base.service';
import { PopEntityTabMenuComponent } from '../pop-entity-tab-menu/pop-entity-tab-menu.component';
import { PopEntityService } from '../services/pop-entity.service';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { PopEntityProviderDialogComponent } from './pop-entity-provider-dialog/pop-entity-provider-dialog.component';
import { PopPipe, PopTemplate, ServiceInjector } from '../../../pop-common.model';
import { PopEntityEventService } from '../services/pop-entity-event.service';
import { MatDialog } from '@angular/material/dialog';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopDomService } from '../../../services/pop-dom.service';
import { ArrayOnlyUnique, ArrayRemoveDupliates, DeepCopy, IsArray, IsObject, IsObjectThrowError, IsString, SnakeToPascal, StorageGetter, TitleCase } from '../../../pop-common-utility';
import { GetTabMenuConfig } from '../pop-entity-utility';
export class PopEntityAssignmentsComponent extends PopExtendComponent {
    constructor(el, cdr, _domRepo, _tabRepo) {
        super();
        this.el = el;
        this.cdr = cdr;
        this._domRepo = _domRepo;
        this._tabRepo = _tabRepo;
        this.name = 'PopEntityAssignmentsComponent';
        this.srv = {
            base: ServiceInjector.get(PopBaseService),
            dialog: ServiceInjector.get(MatDialog),
            events: ServiceInjector.get(PopEntityEventService),
            entity: ServiceInjector.get(PopEntityService),
            tab: undefined,
        };
        this.asset = {
            entityParamsMap: {},
            assignedUserMap: undefined
        };
        /**
         * This should transformValue and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                // #1: Enforce a CoreConfig
                this.core = IsObjectThrowError(this.core, true, `${this.name}:configureDom: - this.core`) ? this.core : null;
                this.dom.state = Object.assign(Object.assign({}, this.dom.state), {
                    directBaseline: false,
                    dataHasDirect: false,
                    dataHasParent: false,
                    dataHasProviders: false,
                    dataHasType: false,
                    blockModal: false,
                    loaded: false,
                    loading: true,
                    error: { code: 0, message: '' },
                });
                this.ui.table = {
                    config: undefined,
                };
                this.dom.setHeight(PopTemplate.getContentHeight(), 100);
                this.buildTable();
                this.dom.state.hasData = IsArray(StorageGetter(this.ui.table.config, ['matData', 'data'], []), true);
                return resolve(true);
            }));
        };
    }
    /**
     * This component should have a specific purpose
     */
    ngOnInit() {
        super.ngOnInit();
    }
    buildTable() {
        let parentLabel;
        const isDialogLimit = this.srv.dialog.openDialogs.length > 3;
        if (this.core && this.core.params)
            this.core.params.refresh = false;
        const columnDefinitions = {};
        // this.subscribers.entity = this.entityRepo.events.subscribe((e) => this.crudEventHandler(e));
        if (this.fieldType && String(this.fieldType).includes('assigned_') === false)
            this.fieldType = `assigned_${this.fieldType}`;
        // this.fieldType should reference a entity.metadata key <'assigned_XXXXXX'> if not this.fieldType grab anything with the 'assigned_' prefix in entity.metadata;
        const data = this.getTableData();
        if (this.fieldType && this.dom.state.dataHasParent) {
            parentLabel = TitleCase(SnakeToPascal(PopPipe.transform(data[0].parent.internal_name, { type: 'entity', arg1: 'alias', arg2: 'singular' }))).trim();
        }
        this.ui.table.config = new TableConfig({
            height: this.dom.height.outer,
            paginator: false,
            search: data.length >= 10 ? true : false,
            searchColumns: false,
            columnDefinitions: {
                name: {
                    visible: true,
                    helper: isDialogLimit ? null : { text: 'Jump To: <name>', position: 'right' },
                    link: isDialogLimit ? false : 'entity',
                    order: 0,
                },
                entity: {
                    visible: !this.fieldType ? true : false,
                    order: 1,
                },
                direct: {
                    visible: this.dom.state.dataHasDirect ? true : false,
                    order: 2,
                },
                type: {
                    visible: this.dom.state.dataHasType ? true : false,
                    order: 3,
                },
                parent_name: {
                    visible: this.fieldType && this.dom.state.dataHasParent && parentLabel ? true : false,
                    display: parentLabel,
                    link: 'parent',
                    order: 4,
                },
                has_providers: {
                    display: 'Provider',
                    visible: this.dom.state.dataHasProviders ? true : false,
                    link: 'providers',
                    // helper: { text: 'Jump To: <name>', position: 'right' },
                    order: 5,
                },
                // assigned: {
                //   visible: true,
                //   link: 'section_users',
                //   // helper: { text: 'Jump To: <name>', position: 'right' },
                //   order: 4,
                // },
                // id: {
                //   visible: this.fieldType ? true : false,
                //   order: 100,
                // },
            },
            data: data,
        });
        this.dom.state.loading = false;
        this.dom.state.loaded = true;
        try {
            this.cdr.detectChanges();
        }
        catch (e) {
        }
    }
    crudEventHandler(event) {
        if (this.dom.subscriber.dialog) {
            if (event.method === 'create' || event.method === 'delete') {
                if (this.core && this.core.params)
                    this.core.params.refresh = true;
            }
            else if (event.method === 'update') {
                if (event.type === 'entity') {
                    if (event.name === 'archive') {
                        if (this.core && this.core.params)
                            this.core.params.refresh = true;
                    }
                }
                else if ((event.type === 'field' || event.type === 'sidebyside') && event.name === 'patch') {
                    if (this.core && this.core.params)
                        this.core.params.refresh = true;
                }
            }
        }
    }
    getKeyInternalName(key) {
        return String(key).replace(/(pt_leader|pt_member|_fk|assigned_)/g, '');
    }
    getEntityParams(key, id = null) {
        let entityParams;
        key = this.getKeyInternalName(key);
        if (key in this.asset.entityParamsMap) {
            return this.asset.entityParamsMap[key];
        }
        if (key === 'user') {
            entityParams = {
                app: 'admin',
                internal_name: 'user',
                api: 'user',
            };
        }
        else {
            entityParams = this.srv.entity.getEntityParams(key);
        }
        if (!entityParams) {
            entityParams = this.srv.entity.getEntityParamsWithPath(key);
        }
        this.asset.entityParamsMap[key] = entityParams;
        if (this.log.repo.enabled())
            console.log(this.log.repo.message('PopEntityAssignmentsComponent:entityParams'), this.log.repo.color('info'), DeepCopy(this.asset.entityParamsMap[key]));
        return DeepCopy(this.asset.entityParamsMap[key]);
    }
    getTableData() {
        this.asset.assignedUserMap = {};
        const data = [];
        let rows;
        let userRows = [];
        let user;
        if (this.core && this.core.entity && IsObject(this.core.entity.metadata, true)) {
            if (IsString(this.fieldType, true)) {
                if (IsArray(this.core.entity.metadata[this.fieldType], true)) {
                    rows = this.core.entity.metadata[this.fieldType].map((row) => {
                        return this.transformRow(this.fieldType, row);
                    });
                    if (this.fieldType.includes('user') === false) { // users are handled special because they inherit assignments from multiple sources
                        data.push(...rows);
                    }
                    else {
                        userRows = rows;
                    }
                }
            }
            else {
                Object.keys(this.core.entity.metadata).map((key) => {
                    if (key && String(key).includes('assigned_') && this.getEntityParams(key) && IsArray(this.core.entity.metadata[key], true)) {
                        rows = this.core.entity.metadata[key].map((row) => {
                            return this.transformRow(key, row);
                        });
                        if (key.includes('user') === false) { // users are handled special because they inherit assignments from multiple sources
                            data.push(...rows);
                        }
                        else {
                            userRows = rows;
                        }
                    }
                });
            }
        }
        if (IsArray(userRows, true)) {
            userRows.map((row) => {
                if (row.id in this.asset.assignedUserMap)
                    this.asset.assignedUserMap[row.id].direct = true;
            });
        }
        if (IsObject(this.asset.assignedUserMap, true)) {
            rows = Object.keys(this.asset.assignedUserMap).map((id) => {
                user = this.asset.assignedUserMap[id];
                return {
                    id: +id,
                    internal_name: 'user',
                    name: user.name,
                    entity: 'User',
                    direct: user.direct,
                    providers: user.providers,
                };
            });
            data.push(...rows);
        }
        data.sort(function (a, b) {
            // Sort by Entity
            if (a.entity > b.entity)
                return 1;
            if (a.entity < b.entity)
                return -1;
            // Sort by Title
            if (a.name > b.name)
                return 1;
            if (a.name < b.name)
                return -1;
        });
        data.map((row) => {
            if (!this.dom.state.directBaseline)
                this.dom.state.directBaseline = row.direct;
            if (row.direct !== this.dom.state.directBaseline)
                this.dom.state.dataHasDirect = true;
            if (row.parent) {
                row.parent_name = row.parent.name;
                this.dom.state.dataHasParent = true;
            }
            row.has_providers = IsArray(row.providers, true) ? 'Yes' : null;
            if (row.has_providers) {
                this.dom.state.dataHasProviders = true;
                row.providers = ArrayRemoveDupliates(row.providers, 'uid');
                row.has_providers = this.getProvidersName(row.providers);
                row.providers.map((provider) => {
                    if (provider.internal_name)
                        provider.entityId = TitleCase(SnakeToPascal(PopPipe.transform(provider.internal_name, {
                            type: 'entity',
                            arg1: 'alias',
                            arg2: 'singular'
                        }))).trim();
                    if (provider.type)
                        provider.type = TitleCase(SnakeToPascal(provider.type)).trim();
                    if (provider.direct)
                        row.direct = true;
                });
            }
            row.direct = row.direct ? 'Yes' : 'No';
            if (row.type) {
                this.dom.state.dataHasType = true;
                row.type = TitleCase(SnakeToPascal(row.type)).trim();
            }
        });
        if (this.log.repo.enabled())
            console.log(this.log.repo.message('PopEntityAssignmentsComponent:data'), this.log.repo.color('data'), data);
        return data;
    }
    assignUsers(users, provider) {
        if (IsArray(users, true)) {
            users.map((user) => {
                if (+user.id && user.name) {
                    if (!this.asset.assignedUserMap[user.id])
                        this.asset.assignedUserMap[user.id] = { id: user.id, name: user.name, direct: false, providers: [] };
                    this.asset.assignedUserMap[user.id].providers.push(provider);
                }
            });
        }
    }
    getProvidersName(providers) {
        let types = [];
        if (IsArray(providers, true)) {
            providers.map((provider) => {
                if (provider.internal_name)
                    types.push(TitleCase(SnakeToPascal(PopPipe.transform(provider.internal_name, {
                        type: 'entity',
                        arg1: 'alias',
                        arg2: 'singular'
                    }))).trim());
            });
            types = ArrayOnlyUnique(types);
            types.sort();
        }
        if (this.log.repo.enabled())
            console.log(this.log.repo.message('PopEntityAssignmentsComponent:providersName'), this.log.repo.color('info'), IsArray(types, true) ? types.join(', ') : 'Yes');
        return IsArray(types, true) ? types.join(', ') : 'Yes';
    }
    transformRow(key, row) {
        const entityParams = this.getEntityParams(key);
        // entityParams.entity = row.id;
        // console.log('entityParams', entityParams);
        let direct = row.direct ? true : false;
        let providers = IsArray(row.providers, true) ? row.providers : [];
        let provider;
        const keyInternalName = this.getKeyInternalName(key);
        row.internal_name = keyInternalName;
        const entity = TitleCase(SnakeToPascal(PopPipe.transform(keyInternalName, { type: 'entity', arg1: 'alias', arg2: 'singular' }))).trim();
        let type = row.type ? row.type : '';
        if (entityParams.internal_name) {
            const matches = Object.keys(row).filter((field) => {
                if (field.includes(this.core.params.internal_name) && +row[field] === +this.core.params.entityId) {
                    return true;
                }
            });
            switch (row.internal_name) {
                case 'pod_type':
                    if (IsArray(matches, true)) {
                        direct = true;
                    }
                    if (IsArray(row.pods)) {
                        row.pods.map((pod) => {
                            if (pod.assigned_leaders)
                                this.assignUsers(pod.assigned_leaders, {
                                    id: +pod.id,
                                    name: pod.name,
                                    entity: entity,
                                    type: 'Leader',
                                    internal_name: 'pod',
                                    uid: `pod_${pod.id}_leader`
                                });
                            if (pod.assigned_members)
                                this.assignUsers(pod.assigned_members, {
                                    id: +pod.id,
                                    name: pod.name,
                                    entity: entity,
                                    type: 'Member',
                                    internal_name: 'pod',
                                    uid: `pod_${pod.id}_member`
                                });
                        });
                    }
                    break;
                case 'pod':
                    matches.map((matchFieldName) => {
                        if (IsArray(matches, true)) {
                            if (this.core.params.internal_name === 'security_profile') {
                                type = String(matchFieldName).includes('leader') ? 'Leader' : 'Member';
                                if (String(matchFieldName).includes('pt_')) {
                                    provider = { id: row.pod_type_fk, name: row.pod_type, internal_name: 'pod_type', type: type, uid: `pod_type_${row.pod_type_fk}_${type}` };
                                    providers = [provider];
                                }
                                else {
                                    direct = true;
                                }
                            }
                        }
                        if (row.assigned_leaders)
                            this.assignUsers(row.assigned_leaders, {
                                id: row.id,
                                name: row.name,
                                entity: entity,
                                type: 'Leader',
                                internal_name: 'pod',
                                uid: `pod_${row.id}_leader`
                            });
                        if (row.assigned_members)
                            this.assignUsers(row.assigned_members, {
                                id: row.id,
                                name: row.name,
                                entity: entity,
                                type: 'Member',
                                internal_name: 'pod',
                                uid: `pod_${row.id}_member`
                            });
                    });
                    break;
                case 'role':
                    if (IsArray(matches, true)) {
                        direct = true;
                        if (row.assigned_user)
                            this.assignUsers(row.assigned_user, {
                                id: +row.id,
                                name: row.name,
                                entity: entity,
                                internal_name: 'role',
                                uid: `role_${row.id}`
                            });
                    }
                    break;
                case 'user':
                    if (IsArray(matches, true)) {
                        direct = true;
                        this.assignUsers([row], { id: +row.id, name: row.name, entity: entity, internal_name: 'user', type: 'User', uid: `user_${row.id}_${type}` });
                    }
                    break;
                default:
                    break;
            }
        }
        return {
            id: row.id,
            internal_name: row.internal_name,
            name: row.display_name ? row.display_name : row.name,
            parent: row.parent,
            entity: TitleCase(SnakeToPascal(PopPipe.transform(keyInternalName, { type: 'entity', arg1: 'alias', arg2: 'singular' }))).trim(),
            direct: direct,
            type: type,
            providers: providers,
            uid: type ? `${keyInternalName}_${row.id}_${type}` : `${keyInternalName}_${row.id}`
        };
    }
    eventHandler(event) {
        if (event.type === 'table') {
            if (this.log.repo.enabled())
                console.log(this.log.repo.message('PopEntityAssignmentsComponent:event'), this.log.repo.color('event'), event);
            switch (event.data.link) {
                case 'entity':
                    this.viewEntityPortal(event.data.row.internal_name, +event.data.row.id);
                    break;
                case 'parent':
                    if (event.data.row && event.data.row.parent) {
                        this.viewEntityPortal(event.data.row.parent.internal_name, +event.data.row.parent.id);
                    }
                    break;
                case 'providers':
                    this.viewRowProviders(event.data.row);
                    break;
                default:
                    break;
            }
        }
    }
    viewEntityPortal(internal_name, id) {
        // placeholder
        if (!this.dom.state.blockModal) {
            this.dom.state.blockModal = true;
            if (internal_name && +id) {
                this.srv.entity.getCoreConfig(internal_name, +id).then((entityConfig) => {
                    let tabMenuConfig = this._buildTabMenuConfig(entityConfig);
                    tabMenuConfig.portal = true;
                    let dialogRef = this.srv.dialog.open(PopEntityTabMenuComponent, {
                        width: `${window.innerWidth - 20}px`,
                        height: `${window.innerHeight - 50}px`,
                        data: entityConfig,
                        panelClass: 'sw-relative'
                    });
                    let component = dialogRef.componentInstance;
                    component.registerTabMenuConfig(tabMenuConfig);
                    this.dom.subscriber.dialog = dialogRef.beforeClosed().subscribe(() => {
                        this.dom.state.blockModal = false;
                        this.srv.tab.refreshEntity(this.core.params.entityId, null, {}, 'PopEntityAssignmentsComponent:viewEntityPortal').then(() => {
                            dialogRef = null;
                            tabMenuConfig = null;
                            component = null;
                        });
                    });
                });
            }
        }
    }
    viewRowProviders(row) {
        if (!this.dom.state.blockModal) {
            this.dom.state.blockModal = true;
            const data = [];
            const tableConfig = new TableConfig({
                search: false,
                searchColumns: false,
                headerSticky: true,
                // paginator: 5,
                columnDefinitions: {
                    name: {
                        visible: true,
                        helper: { text: 'Jump To: <name>', position: 'right' },
                        link: 'provider',
                        order: 0,
                    },
                    entity: {
                        visible: true,
                        // link: 'assigned',
                        // helper: { text: 'Jump To: <name>', position: 'right' },
                        order: 1,
                    },
                    type: {
                        visible: true,
                        // link: 'assigned',
                        // helper: { text: 'Jump To: <name>', position: 'right' },
                        order: 2,
                    },
                    id: {
                        visible: true,
                        order: 100,
                    },
                },
                data: row.providers
            });
            const dialogRef = this.srv.dialog.open(PopEntityProviderDialogComponent, {
                data: {
                    table: tableConfig,
                    config: this.core,
                    resource: row,
                }
            });
            this.dom.setSubscriber('pop-table-dialog-close', dialogRef.beforeClosed().subscribe((changed) => {
                this.dom.state.blockModal = false;
                if (true) {
                    this.srv.tab.refreshEntity(null, this.dom.repo, {}, 'PopEntityAssignmentsComponent:viewRowProviders').then(() => true);
                }
            }));
        }
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    _buildTabMenuConfig(core) {
        return GetTabMenuConfig(core, this.srv.entity.getEntityTabs(core));
    }
}
PopEntityAssignmentsComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-assignments',
                template: "<div class=\"entity-assignment-container\">\n  <div class=\"entity-assignment-loader-bar\" *ngIf=\"dom.state.loading\">\n    <mat-progress-bar mode=\"indeterminate\"></mat-progress-bar>\n  </div>\n  <div *ngIf=\"ui.table && ui.table.config\">\n    <div *ngIf=\"!dom.state.hasData\" class=\"host-empty-container\">\n      <div class=\"host-row\">\n        <mat-icon class=\"sw-helper-icon\" [style.marginLeft]=\"'-24px'\">sentiment_dissatisfied</mat-icon>\n      </div>\n      <div class=\"sw-label-container\" [style.textAlign]=\"'center'\">Such Empty!</div>\n    </div>\n    <lib-pop-table *ngIf=\"dom.state.hasData\" [config]=\"ui.table.config\" (events)=\"eventHandler($event);\"></lib-pop-table>\n  </div>\n</div>\n<lib-pop-errors *ngIf=\"dom.error.code\" [error]=\"dom.error\"></lib-pop-errors>\n",
                styles: [".entity-assignment-container{border:1px solid var(--border)}.host-empty-container{min-height:200px;flex-direction:column;justify-content:stretch;align-items:center}.host-row{flex-direction:row;justify-content:center;align-items:center;min-height:30px;text-align:center}::ng-deep td,:host ::ng-deep th{min-width:50px;max-width:100px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;height:48px;max-height:48px}.entity-assignment-loader-bar{position:absolute;left:0;right:0;bottom:0}:host ::ng-deep th>.mat-sort-header-container{display:flex}::ng-deep th[class*=fk],:host ::ng-deep td[class*=fk]{text-align:center!important;justify-content:center}:host ::ng-deep th[class*=fk]>.mat-sort-header-container{justify-content:center!important;text-align:center!important}:host ::ng-deep td[class*=id],:host ::ng-deep th[class*=id]{text-align:center!important;justify-content:center}:host ::ng-deep th[class*=id]>.mat-sort-header-container{justify-content:center!important;text-align:center!important}:host ::ng-deep td[class*=-name],:host ::ng-deep th[class*=-name]{text-align:left!important;padding-left:20px!important}:host ::ng-deep th[class*=-name] .mat-sort-header-container{padding-left:0!important;justify-content:left!important}:host ::ng-deep td[class*=-type],:host ::ng-deep th[class*=-type]{text-align:center!important}:host ::ng-deep th[class*=-type] .mat-sort-header-container{justify-content:center}"]
            },] }
];
PopEntityAssignmentsComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef },
    { type: PopDomService },
    { type: PopTabMenuService }
];
PopEntityAssignmentsComponent.propDecorators = {
    fieldType: [{ type: Input }],
    header: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1hc3NpZ25tZW50cy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1hc3NpZ25tZW50cy9wb3AtZW50aXR5LWFzc2lnbm1lbnRzLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFxQixNQUFNLGVBQWUsQ0FBQztBQUNuRyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDbkUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHNEQUFzRCxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ2xFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBb0MsTUFBTSxtRUFBbUUsQ0FBQztBQUN2SixPQUFPLEVBQXVFLE9BQU8sRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDdkosT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDN0UsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ25FLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUNsRSxPQUFPLEVBQ0wsZUFBZSxFQUNmLG9CQUFvQixFQUNwQixRQUFRLEVBQ1IsT0FBTyxFQUNQLFFBQVEsRUFDUixrQkFBa0IsRUFDbEIsUUFB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V0FBVztvQkFDbEIsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJO29CQUNqQixRQUFRLEVBQUUsR0FBRztpQkFDZDthQUNGLENBQUUsQ0FBQztZQUVKLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFFLHdCQUF3QixFQUFFLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUUsQ0FBRSxPQUFPLEVBQUcsRUFBRTtnQkFDbEcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztnQkFDbEMsSUFBSSxJQUFJLEVBQUU7b0JBQ1IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFFLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsZ0RBQWdELENBQUUsQ0FBQyxJQUFJLENBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFFLENBQUM7aUJBQzVIO1lBQ0gsQ0FBQyxDQUFFLENBQUUsQ0FBQztTQUNQO0lBQ0gsQ0FBQztJQUdELFdBQVc7UUFDVCxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUdEOzs7OztzR0FLa0c7SUFFMUYsbUJBQW1CLENBQUUsSUFBZ0I7UUFDM0MsT0FBTyxnQkFBZ0IsQ0FBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFFLElBQUksQ0FBRSxDQUFFLENBQUM7SUFDekUsQ0FBQzs7O1lBampCRixTQUFTLFNBQUU7Z0JBQ1YsUUFBUSxFQUFFLDRCQUE0QjtnQkFDdEMsNnlCQUFzRDs7YUFHdkQ7OztZQWhDc0MsVUFBVTtZQUF4QyxpQkFBaUI7WUFXakIsYUFBYTtZQU5iLGlCQUFpQjs7O3dCQTZCdkIsS0FBSztxQkFDTCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBUYWJsZUNvbmZpZyB9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLXRhYmxlL3BvcC10YWJsZS5tb2RlbCc7XG5pbXBvcnQgeyBQb3BCYXNlU2VydmljZSB9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1iYXNlLnNlcnZpY2UnO1xuaW1wb3J0IHsgUG9wRW50aXR5VGFiTWVudUNvbXBvbmVudCB9IGZyb20gJy4uL3BvcC1lbnRpdHktdGFiLW1lbnUvcG9wLWVudGl0eS10YWItbWVudS5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRW50aXR5U2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL3BvcC1lbnRpdHkuc2VydmljZSc7XG5pbXBvcnQgeyBQb3BUYWJNZW51U2VydmljZSB9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLXRhYi1tZW51L3BvcC10YWItbWVudS5zZXJ2aWNlJztcbmltcG9ydCB7IFBvcEVudGl0eVByb3ZpZGVyRGlhbG9nQ29tcG9uZW50LCBQb3BFbnRpdHlQcm92aWRlckRpYWxvZ0ludGVyZmFjZSB9IGZyb20gJy4vcG9wLWVudGl0eS1wcm92aWRlci1kaWFsb2cvcG9wLWVudGl0eS1wcm92aWRlci1kaWFsb2cuY29tcG9uZW50JztcbmltcG9ydCB7IENvcmVDb25maWcsIERpY3Rpb25hcnksIEVudGl0eSwgRW50aXR5UGFyYW1zLCBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsIFBvcFBpcGUsIFBvcFRlbXBsYXRlLCBTZXJ2aWNlSW5qZWN0b3IgfSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFBvcEVudGl0eUV2ZW50U2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL3BvcC1lbnRpdHktZXZlbnQuc2VydmljZSc7XG5pbXBvcnQgeyBNYXREaWFsb2cgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQge1xuICBBcnJheU9ubHlVbmlxdWUsXG4gIEFycmF5UmVtb3ZlRHVwbGlhdGVzLFxuICBEZWVwQ29weSxcbiAgSXNBcnJheSxcbiAgSXNPYmplY3QsXG4gIElzT2JqZWN0VGhyb3dFcnJvcixcbiAgSXNTdHJpbmcsXG4gIFNuYWtlVG9QYXNjYWwsXG4gIFN0b3JhZ2VHZXR0ZXIsXG4gIFRpdGxlQ2FzZVxufSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHsgR2V0VGFiTWVudUNvbmZpZyB9IGZyb20gJy4uL3BvcC1lbnRpdHktdXRpbGl0eSc7XG5cblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtZW50aXR5LWFzc2lnbm1lbnRzJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lbnRpdHktYXNzaWdubWVudHMuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWVudGl0eS1hc3NpZ25tZW50cy5jb21wb25lbnQuc2NzcycgXSxcblxufSApXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5QXNzaWdubWVudHNDb21wb25lbnQgZXh0ZW5kcyBQb3BFeHRlbmRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIHByaXZhdGUgZmllbGRUeXBlOiBzdHJpbmc7XG4gIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXI6IHN0cmluZztcblxuICBwdWJsaWMgbmFtZSA9ICdQb3BFbnRpdHlBc3NpZ25tZW50c0NvbXBvbmVudCc7XG5cbiAgcHJvdGVjdGVkIHNydiA9IHtcbiAgICBiYXNlOiA8UG9wQmFzZVNlcnZpY2U+U2VydmljZUluamVjdG9yLmdldCggUG9wQmFzZVNlcnZpY2UgKSxcbiAgICBkaWFsb2c6IDxNYXREaWFsb2c+U2VydmljZUluamVjdG9yLmdldCggTWF0RGlhbG9nICksXG4gICAgZXZlbnRzOiA8UG9wRW50aXR5RXZlbnRTZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoIFBvcEVudGl0eUV2ZW50U2VydmljZSApLFxuICAgIGVudGl0eTogPFBvcEVudGl0eVNlcnZpY2U+U2VydmljZUluamVjdG9yLmdldCggUG9wRW50aXR5U2VydmljZSApLFxuICAgIHRhYjogPFBvcFRhYk1lbnVTZXJ2aWNlPnVuZGVmaW5lZCxcbiAgfTtcblxuICBwcm90ZWN0ZWQgYXNzZXQgPSB7XG4gICAgZW50aXR5UGFyYW1zTWFwOiA8RGljdGlvbmFyeTxFbnRpdHlQYXJhbXM+Pnt9LFxuICAgIGFzc2lnbmVkVXNlck1hcDogdW5kZWZpbmVkXG4gIH07XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHVibGljICBjZHI6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByb3RlY3RlZCBfZG9tUmVwbzogUG9wRG9tU2VydmljZSxcbiAgICBwcm90ZWN0ZWQgX3RhYlJlcG86IFBvcFRhYk1lbnVTZXJ2aWNlLFxuICApe1xuICAgIHN1cGVyKCk7XG4gICAgLyoqXG4gICAgICogVGhpcyBzaG91bGQgdHJhbnNmb3JtVmFsdWUgYW5kIHZhbGlkYXRlIHRoZSBkYXRhLiBUaGUgdmlldyBzaG91bGQgdHJ5IHRvIG9ubHkgdXNlIGRhdGEgdGhhdCBpcyBzdG9yZWQgb24gdWkgc28gdGhhdCBpdCBpcyBub3QgZGVwZW5kZW50IG9uIHRoZSBzdHJ1Y3R1cmUgb2YgZGF0YSB0aGF0IGNvbWVzIGZyb20gb3RoZXIgc291cmNlcy4gVGhlIHVpIHNob3VsZCBiZSB0aGUgc291cmNlIG9mIHRydXRoIGhlcmUuXG4gICAgICovXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyggcmVzb2x2ZSApID0+IHtcblxuXG4gICAgICAgIC8vICMxOiBFbmZvcmNlIGEgQ29yZUNvbmZpZ1xuICAgICAgICB0aGlzLmNvcmUgPSBJc09iamVjdFRocm93RXJyb3IoIHRoaXMuY29yZSwgdHJ1ZSwgYCR7dGhpcy5uYW1lfTpjb25maWd1cmVEb206IC0gdGhpcy5jb3JlYCApID8gdGhpcy5jb3JlIDogbnVsbDtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUgPSB7XG4gICAgICAgICAgLi4udGhpcy5kb20uc3RhdGUsIC4uLntcbiAgICAgICAgICAgIGRpcmVjdEJhc2VsaW5lOiBmYWxzZSxcbiAgICAgICAgICAgIGRhdGFIYXNEaXJlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgZGF0YUhhc1BhcmVudDogZmFsc2UsXG4gICAgICAgICAgICBkYXRhSGFzUHJvdmlkZXJzOiBmYWxzZSxcbiAgICAgICAgICAgIGRhdGFIYXNUeXBlOiBmYWxzZSxcbiAgICAgICAgICAgIGJsb2NrTW9kYWw6IGZhbHNlLFxuICAgICAgICAgICAgbG9hZGVkOiBmYWxzZSxcbiAgICAgICAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICAgICAgICBlcnJvcjogeyBjb2RlOiAwLCBtZXNzYWdlOiAnJyB9LFxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy51aS50YWJsZSA9IHtcbiAgICAgICAgICBjb25maWc6IDxUYWJsZUNvbmZpZz51bmRlZmluZWQsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZG9tLnNldEhlaWdodCggUG9wVGVtcGxhdGUuZ2V0Q29udGVudEhlaWdodCgpLCAxMDAgKTtcbiAgICAgICAgdGhpcy5idWlsZFRhYmxlKCk7XG4gICAgICAgIHRoaXMuZG9tLnN0YXRlLmhhc0RhdGEgPSBJc0FycmF5KFN0b3JhZ2VHZXR0ZXIodGhpcy51aS50YWJsZS5jb25maWcsIFsnbWF0RGF0YScsICdkYXRhJ10sIFtdKSwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcblxuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBjb21wb25lbnQgc2hvdWxkIGhhdmUgYSBzcGVjaWZpYyBwdXJwb3NlXG4gICAqL1xuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIGJ1aWxkVGFibGUoKXtcbiAgICBsZXQgcGFyZW50TGFiZWw7XG4gICAgY29uc3QgaXNEaWFsb2dMaW1pdCA9IHRoaXMuc3J2LmRpYWxvZy5vcGVuRGlhbG9ncy5sZW5ndGggPiAzO1xuICAgIGlmKCB0aGlzLmNvcmUgJiYgdGhpcy5jb3JlLnBhcmFtcyApIHRoaXMuY29yZS5wYXJhbXMucmVmcmVzaCA9IGZhbHNlO1xuICAgIGNvbnN0IGNvbHVtbkRlZmluaXRpb25zID0ge307XG4gICAgLy8gdGhpcy5zdWJzY3JpYmVycy5lbnRpdHkgPSB0aGlzLmVudGl0eVJlcG8uZXZlbnRzLnN1YnNjcmliZSgoZSkgPT4gdGhpcy5jcnVkRXZlbnRIYW5kbGVyKGUpKTtcbiAgICBpZiggdGhpcy5maWVsZFR5cGUgJiYgU3RyaW5nKCB0aGlzLmZpZWxkVHlwZSApLmluY2x1ZGVzKCAnYXNzaWduZWRfJyApID09PSBmYWxzZSApIHRoaXMuZmllbGRUeXBlID0gYGFzc2lnbmVkXyR7dGhpcy5maWVsZFR5cGV9YDtcbiAgICAvLyB0aGlzLmZpZWxkVHlwZSBzaG91bGQgcmVmZXJlbmNlIGEgZW50aXR5Lm1ldGFkYXRhIGtleSA8J2Fzc2lnbmVkX1hYWFhYWCc+IGlmIG5vdCB0aGlzLmZpZWxkVHlwZSBncmFiIGFueXRoaW5nIHdpdGggdGhlICdhc3NpZ25lZF8nIHByZWZpeCBpbiBlbnRpdHkubWV0YWRhdGE7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuZ2V0VGFibGVEYXRhKCk7XG4gICAgaWYoIHRoaXMuZmllbGRUeXBlICYmIHRoaXMuZG9tLnN0YXRlLmRhdGFIYXNQYXJlbnQgKXtcbiAgICAgIHBhcmVudExhYmVsID0gVGl0bGVDYXNlKCBTbmFrZVRvUGFzY2FsKCBQb3BQaXBlLnRyYW5zZm9ybSggZGF0YVsgMCBdLnBhcmVudC5pbnRlcm5hbF9uYW1lLCB7IHR5cGU6ICdlbnRpdHknLCBhcmcxOiAnYWxpYXMnLCBhcmcyOiAnc2luZ3VsYXInIH0gKSApICkudHJpbSgpO1xuICAgIH1cblxuICAgIHRoaXMudWkudGFibGUuY29uZmlnID0gbmV3IFRhYmxlQ29uZmlnKCB7XG4gICAgICBoZWlnaHQ6IHRoaXMuZG9tLmhlaWdodC5vdXRlcixcbiAgICAgIHBhZ2luYXRvcjogZmFsc2UsXG4gICAgICBzZWFyY2g6IGRhdGEubGVuZ3RoID49IDEwID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgc2VhcmNoQ29sdW1uczogZmFsc2UsXG4gICAgICBjb2x1bW5EZWZpbml0aW9uczoge1xuICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICBoZWxwZXI6IGlzRGlhbG9nTGltaXQgPyBudWxsIDogeyB0ZXh0OiAnSnVtcCBUbzogPG5hbWU+JywgcG9zaXRpb246ICdyaWdodCcgfSxcbiAgICAgICAgICBsaW5rOiBpc0RpYWxvZ0xpbWl0ID8gZmFsc2UgOiAnZW50aXR5JyxcbiAgICAgICAgICBvcmRlcjogMCxcbiAgICAgICAgfSxcbiAgICAgICAgZW50aXR5OiB7XG4gICAgICAgICAgdmlzaWJsZTogIXRoaXMuZmllbGRUeXBlID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICAgIG9yZGVyOiAxLFxuICAgICAgICB9LFxuXG4gICAgICAgIGRpcmVjdDoge1xuICAgICAgICAgIHZpc2libGU6IHRoaXMuZG9tLnN0YXRlLmRhdGFIYXNEaXJlY3QgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgICAgb3JkZXI6IDIsXG4gICAgICAgIH0sXG4gICAgICAgIHR5cGU6IHtcbiAgICAgICAgICB2aXNpYmxlOiB0aGlzLmRvbS5zdGF0ZS5kYXRhSGFzVHlwZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgICBvcmRlcjogMyxcbiAgICAgICAgfSxcbiAgICAgICAgcGFyZW50X25hbWU6IHtcbiAgICAgICAgICB2aXNpYmxlOiB0aGlzLmZpZWxkVHlwZSAmJiB0aGlzLmRvbS5zdGF0ZS5kYXRhSGFzUGFyZW50ICYmIHBhcmVudExhYmVsID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICAgIGRpc3BsYXk6IHBhcmVudExhYmVsLFxuICAgICAgICAgIGxpbms6ICdwYXJlbnQnLFxuICAgICAgICAgIG9yZGVyOiA0LFxuICAgICAgICB9LFxuICAgICAgICBoYXNfcHJvdmlkZXJzOiB7XG4gICAgICAgICAgZGlzcGxheTogJ1Byb3ZpZGVyJyxcbiAgICAgICAgICB2aXNpYmxlOiB0aGlzLmRvbS5zdGF0ZS5kYXRhSGFzUHJvdmlkZXJzID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICAgIGxpbms6ICdwcm92aWRlcnMnLFxuICAgICAgICAgIC8vIGhlbHBlcjogeyB0ZXh0OiAnSnVtcCBUbzogPG5hbWU+JywgcG9zaXRpb246ICdyaWdodCcgfSxcbiAgICAgICAgICBvcmRlcjogNSxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gYXNzaWduZWQ6IHtcbiAgICAgICAgLy8gICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICAvLyAgIGxpbms6ICdzZWN0aW9uX3VzZXJzJyxcbiAgICAgICAgLy8gICAvLyBoZWxwZXI6IHsgdGV4dDogJ0p1bXAgVG86IDxuYW1lPicsIHBvc2l0aW9uOiAncmlnaHQnIH0sXG4gICAgICAgIC8vICAgb3JkZXI6IDQsXG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIGlkOiB7XG4gICAgICAgIC8vICAgdmlzaWJsZTogdGhpcy5maWVsZFR5cGUgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIC8vICAgb3JkZXI6IDEwMCxcbiAgICAgICAgLy8gfSxcbiAgICAgIH0sXG4gICAgICBkYXRhOiBkYXRhLFxuICAgIH0gKTtcbiAgICB0aGlzLmRvbS5zdGF0ZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgdGhpcy5kb20uc3RhdGUubG9hZGVkID0gdHJ1ZTtcbiAgICB0cnl7XG4gICAgICB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgfWNhdGNoKCBlICl7XG4gICAgfVxuICB9XG5cblxuICBjcnVkRXZlbnRIYW5kbGVyKCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICl7XG4gICAgaWYoIHRoaXMuZG9tLnN1YnNjcmliZXIuZGlhbG9nICl7XG4gICAgICBpZiggZXZlbnQubWV0aG9kID09PSAnY3JlYXRlJyB8fCBldmVudC5tZXRob2QgPT09ICdkZWxldGUnICl7XG4gICAgICAgIGlmKCB0aGlzLmNvcmUgJiYgdGhpcy5jb3JlLnBhcmFtcyApIHRoaXMuY29yZS5wYXJhbXMucmVmcmVzaCA9IHRydWU7XG4gICAgICB9ZWxzZSBpZiggZXZlbnQubWV0aG9kID09PSAndXBkYXRlJyApe1xuICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ2VudGl0eScgKXtcbiAgICAgICAgICBpZiggZXZlbnQubmFtZSA9PT0gJ2FyY2hpdmUnICl7XG4gICAgICAgICAgICBpZiggdGhpcy5jb3JlICYmIHRoaXMuY29yZS5wYXJhbXMgKSB0aGlzLmNvcmUucGFyYW1zLnJlZnJlc2ggPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2UgaWYoICggZXZlbnQudHlwZSA9PT0gJ2ZpZWxkJyB8fCBldmVudC50eXBlID09PSAnc2lkZWJ5c2lkZScgKSAmJiBldmVudC5uYW1lID09PSAncGF0Y2gnICl7XG4gICAgICAgICAgaWYoIHRoaXMuY29yZSAmJiB0aGlzLmNvcmUucGFyYW1zICkgdGhpcy5jb3JlLnBhcmFtcy5yZWZyZXNoID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgZ2V0S2V5SW50ZXJuYWxOYW1lKCBrZXk6IHN0cmluZyApe1xuICAgIHJldHVybiBTdHJpbmcoIGtleSApLnJlcGxhY2UoIC8ocHRfbGVhZGVyfHB0X21lbWJlcnxfZmt8YXNzaWduZWRfKS9nLCAnJyApO1xuICB9XG5cblxuICBnZXRFbnRpdHlQYXJhbXMoIGtleTogc3RyaW5nLCBpZDogbnVtYmVyID0gbnVsbCApOiBFbnRpdHlQYXJhbXN7XG4gICAgbGV0IGVudGl0eVBhcmFtcztcbiAgICBrZXkgPSB0aGlzLmdldEtleUludGVybmFsTmFtZSgga2V5ICk7XG4gICAgaWYoIGtleSBpbiB0aGlzLmFzc2V0LmVudGl0eVBhcmFtc01hcCApe1xuICAgICAgcmV0dXJuIHRoaXMuYXNzZXQuZW50aXR5UGFyYW1zTWFwWyBrZXkgXTtcbiAgICB9XG4gICAgaWYoIGtleSA9PT0gJ3VzZXInICl7XG4gICAgICBlbnRpdHlQYXJhbXMgPSA8RW50aXR5UGFyYW1zPntcbiAgICAgICAgYXBwOiAnYWRtaW4nLFxuICAgICAgICBpbnRlcm5hbF9uYW1lOiAndXNlcicsXG4gICAgICAgIGFwaTogJ3VzZXInLFxuICAgICAgfTtcbiAgICB9ZWxzZXtcbiAgICAgIGVudGl0eVBhcmFtcyA9IHRoaXMuc3J2LmVudGl0eS5nZXRFbnRpdHlQYXJhbXMoIGtleSApO1xuICAgIH1cbiAgICBpZiggIWVudGl0eVBhcmFtcyApe1xuICAgICAgZW50aXR5UGFyYW1zID0gdGhpcy5zcnYuZW50aXR5LmdldEVudGl0eVBhcmFtc1dpdGhQYXRoKCBrZXkgKTtcbiAgICB9XG4gICAgdGhpcy5hc3NldC5lbnRpdHlQYXJhbXNNYXBbIGtleSBdID0gZW50aXR5UGFyYW1zO1xuXG4gICAgaWYoIHRoaXMubG9nLnJlcG8uZW5hYmxlZCgpICkgY29uc29sZS5sb2coIHRoaXMubG9nLnJlcG8ubWVzc2FnZSggJ1BvcEVudGl0eUFzc2lnbm1lbnRzQ29tcG9uZW50OmVudGl0eVBhcmFtcycgKSwgdGhpcy5sb2cucmVwby5jb2xvciggJ2luZm8nICksIERlZXBDb3B5KCB0aGlzLmFzc2V0LmVudGl0eVBhcmFtc01hcFsga2V5IF0gKSApO1xuICAgIHJldHVybiBEZWVwQ29weSggdGhpcy5hc3NldC5lbnRpdHlQYXJhbXNNYXBbIGtleSBdICk7XG4gIH1cblxuXG4gIGdldFRhYmxlRGF0YSgpe1xuICAgIHRoaXMuYXNzZXQuYXNzaWduZWRVc2VyTWFwID0ge307XG4gICAgY29uc3QgZGF0YSA9IFtdO1xuICAgIGxldCByb3dzO1xuICAgIGxldCB1c2VyUm93cyA9IFtdO1xuICAgIGxldCB1c2VyO1xuICAgIGlmKCB0aGlzLmNvcmUgJiYgdGhpcy5jb3JlLmVudGl0eSAmJiBJc09iamVjdCggdGhpcy5jb3JlLmVudGl0eS5tZXRhZGF0YSwgdHJ1ZSApICl7XG4gICAgICBpZiggSXNTdHJpbmcoIHRoaXMuZmllbGRUeXBlLCB0cnVlICkgKXtcbiAgICAgICAgaWYoIElzQXJyYXkoIHRoaXMuY29yZS5lbnRpdHkubWV0YWRhdGFbIHRoaXMuZmllbGRUeXBlIF0sIHRydWUgKSApe1xuICAgICAgICAgIHJvd3MgPSB0aGlzLmNvcmUuZW50aXR5Lm1ldGFkYXRhWyB0aGlzLmZpZWxkVHlwZSBdLm1hcCggKCByb3cgKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1Sb3coIHRoaXMuZmllbGRUeXBlLCByb3cgKTtcbiAgICAgICAgICB9ICk7XG4gICAgICAgICAgaWYoIHRoaXMuZmllbGRUeXBlLmluY2x1ZGVzKCAndXNlcicgKSA9PT0gZmFsc2UgKXsgLy8gdXNlcnMgYXJlIGhhbmRsZWQgc3BlY2lhbCBiZWNhdXNlIHRoZXkgaW5oZXJpdCBhc3NpZ25tZW50cyBmcm9tIG11bHRpcGxlIHNvdXJjZXNcbiAgICAgICAgICAgIGRhdGEucHVzaCggLi4ucm93cyApO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdXNlclJvd3MgPSByb3dzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIE9iamVjdC5rZXlzKCB0aGlzLmNvcmUuZW50aXR5Lm1ldGFkYXRhICkubWFwKCAoIGtleTogc3RyaW5nICkgPT4ge1xuICAgICAgICAgIGlmKCBrZXkgJiYgU3RyaW5nKCBrZXkgKS5pbmNsdWRlcyggJ2Fzc2lnbmVkXycgKSAmJiB0aGlzLmdldEVudGl0eVBhcmFtcygga2V5ICkgJiYgSXNBcnJheSggdGhpcy5jb3JlLmVudGl0eS5tZXRhZGF0YVsga2V5IF0sIHRydWUgKSApe1xuICAgICAgICAgICAgcm93cyA9IHRoaXMuY29yZS5lbnRpdHkubWV0YWRhdGFbIGtleSBdLm1hcCggKCByb3cgKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybVJvdygga2V5LCByb3cgKTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIGlmKCBrZXkuaW5jbHVkZXMoICd1c2VyJyApID09PSBmYWxzZSApeyAvLyB1c2VycyBhcmUgaGFuZGxlZCBzcGVjaWFsIGJlY2F1c2UgdGhleSBpbmhlcml0IGFzc2lnbm1lbnRzIGZyb20gbXVsdGlwbGUgc291cmNlc1xuICAgICAgICAgICAgICBkYXRhLnB1c2goIC4uLnJvd3MgKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICB1c2VyUm93cyA9IHJvd3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmKCBJc0FycmF5KCB1c2VyUm93cywgdHJ1ZSApICl7XG4gICAgICB1c2VyUm93cy5tYXAoICggcm93ICkgPT4ge1xuICAgICAgICBpZiggcm93LmlkIGluIHRoaXMuYXNzZXQuYXNzaWduZWRVc2VyTWFwICkgdGhpcy5hc3NldC5hc3NpZ25lZFVzZXJNYXBbIHJvdy5pZCBdLmRpcmVjdCA9IHRydWU7XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgaWYoIElzT2JqZWN0KCB0aGlzLmFzc2V0LmFzc2lnbmVkVXNlck1hcCwgdHJ1ZSApICl7XG4gICAgICByb3dzID0gT2JqZWN0LmtleXMoIHRoaXMuYXNzZXQuYXNzaWduZWRVc2VyTWFwICkubWFwKCAoIGlkICkgPT4ge1xuICAgICAgICB1c2VyID0gdGhpcy5hc3NldC5hc3NpZ25lZFVzZXJNYXBbIGlkIF07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6ICtpZCxcbiAgICAgICAgICBpbnRlcm5hbF9uYW1lOiAndXNlcicsXG4gICAgICAgICAgbmFtZTogdXNlci5uYW1lLFxuICAgICAgICAgIGVudGl0eTogJ1VzZXInLFxuICAgICAgICAgIGRpcmVjdDogdXNlci5kaXJlY3QsXG4gICAgICAgICAgcHJvdmlkZXJzOiB1c2VyLnByb3ZpZGVycyxcblxuICAgICAgICB9O1xuICAgICAgfSApO1xuICAgICAgZGF0YS5wdXNoKCAuLi5yb3dzICk7XG5cbiAgICB9XG5cbiAgICBkYXRhLnNvcnQoIGZ1bmN0aW9uKCBhLCBiICl7XG4gICAgICAvLyBTb3J0IGJ5IEVudGl0eVxuICAgICAgaWYoIGEuZW50aXR5ID4gYi5lbnRpdHkgKSByZXR1cm4gMTtcbiAgICAgIGlmKCBhLmVudGl0eSA8IGIuZW50aXR5ICkgcmV0dXJuIC0xO1xuICAgICAgLy8gU29ydCBieSBUaXRsZVxuICAgICAgaWYoIGEubmFtZSA+IGIubmFtZSApIHJldHVybiAxO1xuICAgICAgaWYoIGEubmFtZSA8IGIubmFtZSApIHJldHVybiAtMTtcbiAgICB9ICk7XG4gICAgZGF0YS5tYXAoICggcm93ICkgPT4ge1xuICAgICAgaWYoICF0aGlzLmRvbS5zdGF0ZS5kaXJlY3RCYXNlbGluZSApIHRoaXMuZG9tLnN0YXRlLmRpcmVjdEJhc2VsaW5lID0gcm93LmRpcmVjdDtcbiAgICAgIGlmKCByb3cuZGlyZWN0ICE9PSB0aGlzLmRvbS5zdGF0ZS5kaXJlY3RCYXNlbGluZSApIHRoaXMuZG9tLnN0YXRlLmRhdGFIYXNEaXJlY3QgPSB0cnVlO1xuICAgICAgaWYoIHJvdy5wYXJlbnQgKXtcbiAgICAgICAgcm93LnBhcmVudF9uYW1lID0gcm93LnBhcmVudC5uYW1lO1xuICAgICAgICB0aGlzLmRvbS5zdGF0ZS5kYXRhSGFzUGFyZW50ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJvdy5oYXNfcHJvdmlkZXJzID0gSXNBcnJheSggcm93LnByb3ZpZGVycywgdHJ1ZSApID8gJ1llcycgOiBudWxsO1xuICAgICAgaWYoIHJvdy5oYXNfcHJvdmlkZXJzICl7XG4gICAgICAgIHRoaXMuZG9tLnN0YXRlLmRhdGFIYXNQcm92aWRlcnMgPSB0cnVlO1xuICAgICAgICByb3cucHJvdmlkZXJzID0gQXJyYXlSZW1vdmVEdXBsaWF0ZXMoIHJvdy5wcm92aWRlcnMsICd1aWQnICk7XG4gICAgICAgIHJvdy5oYXNfcHJvdmlkZXJzID0gdGhpcy5nZXRQcm92aWRlcnNOYW1lKCByb3cucHJvdmlkZXJzICk7XG4gICAgICAgIHJvdy5wcm92aWRlcnMubWFwKCAoIHByb3ZpZGVyICkgPT4ge1xuICAgICAgICAgIGlmKCBwcm92aWRlci5pbnRlcm5hbF9uYW1lICkgcHJvdmlkZXIuZW50aXR5SWQgPSBUaXRsZUNhc2UoIFNuYWtlVG9QYXNjYWwoIFBvcFBpcGUudHJhbnNmb3JtKCBwcm92aWRlci5pbnRlcm5hbF9uYW1lLCB7XG4gICAgICAgICAgICB0eXBlOiAnZW50aXR5JyxcbiAgICAgICAgICAgIGFyZzE6ICdhbGlhcycsXG4gICAgICAgICAgICBhcmcyOiAnc2luZ3VsYXInXG4gICAgICAgICAgfSApICkgKS50cmltKCk7XG4gICAgICAgICAgaWYoIHByb3ZpZGVyLnR5cGUgKSBwcm92aWRlci50eXBlID0gVGl0bGVDYXNlKCBTbmFrZVRvUGFzY2FsKCBwcm92aWRlci50eXBlICkgKS50cmltKCk7XG4gICAgICAgICAgaWYoIHByb3ZpZGVyLmRpcmVjdCApIHJvdy5kaXJlY3QgPSB0cnVlO1xuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgICByb3cuZGlyZWN0ID0gcm93LmRpcmVjdCA/ICdZZXMnIDogJ05vJztcbiAgICAgIGlmKCByb3cudHlwZSApe1xuICAgICAgICB0aGlzLmRvbS5zdGF0ZS5kYXRhSGFzVHlwZSA9IHRydWU7XG4gICAgICAgIHJvdy50eXBlID0gVGl0bGVDYXNlKCBTbmFrZVRvUGFzY2FsKCByb3cudHlwZSApICkudHJpbSgpO1xuICAgICAgfVxuICAgIH0gKTtcbiAgICBpZiggdGhpcy5sb2cucmVwby5lbmFibGVkKCkgKSBjb25zb2xlLmxvZyggdGhpcy5sb2cucmVwby5tZXNzYWdlKCAnUG9wRW50aXR5QXNzaWdubWVudHNDb21wb25lbnQ6ZGF0YScgKSwgdGhpcy5sb2cucmVwby5jb2xvciggJ2RhdGEnICksIGRhdGEgKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG5cbiAgYXNzaWduVXNlcnMoIHVzZXJzOiBFbnRpdHlbXSwgcHJvdmlkZXI6IG9iamVjdCApe1xuICAgIGlmKCBJc0FycmF5KCB1c2VycywgdHJ1ZSApICl7XG4gICAgICB1c2Vycy5tYXAoICggdXNlciApID0+IHtcbiAgICAgICAgaWYoICt1c2VyLmlkICYmIHVzZXIubmFtZSApe1xuICAgICAgICAgIGlmKCAhdGhpcy5hc3NldC5hc3NpZ25lZFVzZXJNYXBbIHVzZXIuaWQgXSApIHRoaXMuYXNzZXQuYXNzaWduZWRVc2VyTWFwWyB1c2VyLmlkIF0gPSB7IGlkOiB1c2VyLmlkLCBuYW1lOiB1c2VyLm5hbWUsIGRpcmVjdDogZmFsc2UsIHByb3ZpZGVyczogW10gfTtcbiAgICAgICAgICB0aGlzLmFzc2V0LmFzc2lnbmVkVXNlck1hcFsgdXNlci5pZCBdLnByb3ZpZGVycy5wdXNoKCBwcm92aWRlciApO1xuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfVxuICB9XG5cblxuICBnZXRQcm92aWRlcnNOYW1lKCBwcm92aWRlcnM6IGFueVtdICl7XG4gICAgbGV0IHR5cGVzID0gW107XG4gICAgaWYoIElzQXJyYXkoIHByb3ZpZGVycywgdHJ1ZSApICl7XG4gICAgICBwcm92aWRlcnMubWFwKCAoIHByb3ZpZGVyICkgPT4ge1xuICAgICAgICBpZiggcHJvdmlkZXIuaW50ZXJuYWxfbmFtZSApIHR5cGVzLnB1c2goIFRpdGxlQ2FzZSggU25ha2VUb1Bhc2NhbCggUG9wUGlwZS50cmFuc2Zvcm0oIHByb3ZpZGVyLmludGVybmFsX25hbWUsIHtcbiAgICAgICAgICB0eXBlOiAnZW50aXR5JyxcbiAgICAgICAgICBhcmcxOiAnYWxpYXMnLFxuICAgICAgICAgIGFyZzI6ICdzaW5ndWxhcidcbiAgICAgICAgfSApICkgKS50cmltKCkgKTtcbiAgICAgIH0gKTtcbiAgICAgIHR5cGVzID0gQXJyYXlPbmx5VW5pcXVlKCB0eXBlcyApO1xuICAgICAgdHlwZXMuc29ydCgpO1xuICAgIH1cbiAgICBpZiggdGhpcy5sb2cucmVwby5lbmFibGVkKCkgKSBjb25zb2xlLmxvZyggdGhpcy5sb2cucmVwby5tZXNzYWdlKCAnUG9wRW50aXR5QXNzaWdubWVudHNDb21wb25lbnQ6cHJvdmlkZXJzTmFtZScgKSwgdGhpcy5sb2cucmVwby5jb2xvciggJ2luZm8nICksIElzQXJyYXkoIHR5cGVzLCB0cnVlICkgPyB0eXBlcy5qb2luKCAnLCAnICkgOiAnWWVzJyApO1xuICAgIHJldHVybiBJc0FycmF5KCB0eXBlcywgdHJ1ZSApID8gdHlwZXMuam9pbiggJywgJyApIDogJ1llcyc7XG4gIH1cblxuXG4gIHRyYW5zZm9ybVJvdygga2V5OiBzdHJpbmcsIHJvdzogRW50aXR5ICl7XG4gICAgY29uc3QgZW50aXR5UGFyYW1zID0gdGhpcy5nZXRFbnRpdHlQYXJhbXMoIGtleSApO1xuICAgIC8vIGVudGl0eVBhcmFtcy5lbnRpdHkgPSByb3cuaWQ7XG4gICAgLy8gY29uc29sZS5sb2coJ2VudGl0eVBhcmFtcycsIGVudGl0eVBhcmFtcyk7XG4gICAgbGV0IGRpcmVjdCA9IHJvdy5kaXJlY3QgPyB0cnVlIDogZmFsc2U7XG5cbiAgICBsZXQgcHJvdmlkZXJzID0gSXNBcnJheSggcm93LnByb3ZpZGVycywgdHJ1ZSApID8gcm93LnByb3ZpZGVycyA6IFtdO1xuICAgIGxldCBwcm92aWRlcjtcbiAgICBjb25zdCBrZXlJbnRlcm5hbE5hbWUgPSB0aGlzLmdldEtleUludGVybmFsTmFtZSgga2V5ICk7XG4gICAgcm93LmludGVybmFsX25hbWUgPSBrZXlJbnRlcm5hbE5hbWU7XG4gICAgY29uc3QgZW50aXR5ID0gVGl0bGVDYXNlKCBTbmFrZVRvUGFzY2FsKCBQb3BQaXBlLnRyYW5zZm9ybSgga2V5SW50ZXJuYWxOYW1lLCB7IHR5cGU6ICdlbnRpdHknLCBhcmcxOiAnYWxpYXMnLCBhcmcyOiAnc2luZ3VsYXInIH0gKSApICkudHJpbSgpO1xuICAgIGxldCB0eXBlID0gcm93LnR5cGUgPyByb3cudHlwZSA6ICcnO1xuICAgIGlmKCBlbnRpdHlQYXJhbXMuaW50ZXJuYWxfbmFtZSApe1xuICAgICAgY29uc3QgbWF0Y2hlcyA9IE9iamVjdC5rZXlzKCByb3cgKS5maWx0ZXIoICggZmllbGQ6IHN0cmluZyApID0+IHtcbiAgICAgICAgaWYoIGZpZWxkLmluY2x1ZGVzKCB0aGlzLmNvcmUucGFyYW1zLmludGVybmFsX25hbWUgKSAmJiArcm93WyBmaWVsZCBdID09PSArdGhpcy5jb3JlLnBhcmFtcy5lbnRpdHlJZCApe1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9ICk7XG5cbiAgICAgIHN3aXRjaCggcm93LmludGVybmFsX25hbWUgKXtcbiAgICAgICAgY2FzZSAncG9kX3R5cGUnOlxuICAgICAgICAgIGlmKCBJc0FycmF5KCBtYXRjaGVzLCB0cnVlICkgKXtcbiAgICAgICAgICAgIGRpcmVjdCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmKCBJc0FycmF5KCByb3cucG9kcyApICl7XG4gICAgICAgICAgICByb3cucG9kcy5tYXAoICggcG9kICkgPT4ge1xuICAgICAgICAgICAgICBpZiggcG9kLmFzc2lnbmVkX2xlYWRlcnMgKSB0aGlzLmFzc2lnblVzZXJzKCBwb2QuYXNzaWduZWRfbGVhZGVycywge1xuICAgICAgICAgICAgICAgIGlkOiArcG9kLmlkLFxuICAgICAgICAgICAgICAgIG5hbWU6IHBvZC5uYW1lLFxuICAgICAgICAgICAgICAgIGVudGl0eTogZW50aXR5LFxuICAgICAgICAgICAgICAgIHR5cGU6ICdMZWFkZXInLFxuICAgICAgICAgICAgICAgIGludGVybmFsX25hbWU6ICdwb2QnLFxuICAgICAgICAgICAgICAgIHVpZDogYHBvZF8ke3BvZC5pZH1fbGVhZGVyYFxuICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgIGlmKCBwb2QuYXNzaWduZWRfbWVtYmVycyApIHRoaXMuYXNzaWduVXNlcnMoIHBvZC5hc3NpZ25lZF9tZW1iZXJzLCB7XG4gICAgICAgICAgICAgICAgaWQ6ICtwb2QuaWQsXG4gICAgICAgICAgICAgICAgbmFtZTogcG9kLm5hbWUsXG4gICAgICAgICAgICAgICAgZW50aXR5OiBlbnRpdHksXG4gICAgICAgICAgICAgICAgdHlwZTogJ01lbWJlcicsXG4gICAgICAgICAgICAgICAgaW50ZXJuYWxfbmFtZTogJ3BvZCcsXG4gICAgICAgICAgICAgICAgdWlkOiBgcG9kXyR7cG9kLmlkfV9tZW1iZXJgXG4gICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3BvZCc6XG4gICAgICAgICAgbWF0Y2hlcy5tYXAoICggbWF0Y2hGaWVsZE5hbWUgKSA9PiB7XG4gICAgICAgICAgICBpZiggSXNBcnJheSggbWF0Y2hlcywgdHJ1ZSApICl7XG4gICAgICAgICAgICAgIGlmKCB0aGlzLmNvcmUucGFyYW1zLmludGVybmFsX25hbWUgPT09ICdzZWN1cml0eV9wcm9maWxlJyApe1xuICAgICAgICAgICAgICAgIHR5cGUgPSBTdHJpbmcoIG1hdGNoRmllbGROYW1lICkuaW5jbHVkZXMoICdsZWFkZXInICkgPyAnTGVhZGVyJyA6ICdNZW1iZXInO1xuICAgICAgICAgICAgICAgIGlmKCBTdHJpbmcoIG1hdGNoRmllbGROYW1lICkuaW5jbHVkZXMoICdwdF8nICkgKXtcbiAgICAgICAgICAgICAgICAgIHByb3ZpZGVyID0geyBpZDogcm93LnBvZF90eXBlX2ZrLCBuYW1lOiByb3cucG9kX3R5cGUsIGludGVybmFsX25hbWU6ICdwb2RfdHlwZScsIHR5cGU6IHR5cGUsIHVpZDogYHBvZF90eXBlXyR7cm93LnBvZF90eXBlX2ZrfV8ke3R5cGV9YCB9O1xuICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzID0gWyBwcm92aWRlciBdO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgZGlyZWN0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoIHJvdy5hc3NpZ25lZF9sZWFkZXJzICkgdGhpcy5hc3NpZ25Vc2Vycyggcm93LmFzc2lnbmVkX2xlYWRlcnMsIHtcbiAgICAgICAgICAgICAgaWQ6IHJvdy5pZCxcbiAgICAgICAgICAgICAgbmFtZTogcm93Lm5hbWUsXG4gICAgICAgICAgICAgIGVudGl0eTogZW50aXR5LFxuICAgICAgICAgICAgICB0eXBlOiAnTGVhZGVyJyxcbiAgICAgICAgICAgICAgaW50ZXJuYWxfbmFtZTogJ3BvZCcsXG4gICAgICAgICAgICAgIHVpZDogYHBvZF8ke3Jvdy5pZH1fbGVhZGVyYFxuICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgaWYoIHJvdy5hc3NpZ25lZF9tZW1iZXJzICkgdGhpcy5hc3NpZ25Vc2Vycyggcm93LmFzc2lnbmVkX21lbWJlcnMsIHtcbiAgICAgICAgICAgICAgaWQ6IHJvdy5pZCxcbiAgICAgICAgICAgICAgbmFtZTogcm93Lm5hbWUsXG4gICAgICAgICAgICAgIGVudGl0eTogZW50aXR5LFxuICAgICAgICAgICAgICB0eXBlOiAnTWVtYmVyJyxcbiAgICAgICAgICAgICAgaW50ZXJuYWxfbmFtZTogJ3BvZCcsXG4gICAgICAgICAgICAgIHVpZDogYHBvZF8ke3Jvdy5pZH1fbWVtYmVyYFxuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncm9sZSc6XG4gICAgICAgICAgaWYoIElzQXJyYXkoIG1hdGNoZXMsIHRydWUgKSApe1xuICAgICAgICAgICAgZGlyZWN0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmKCByb3cuYXNzaWduZWRfdXNlciApIHRoaXMuYXNzaWduVXNlcnMoIHJvdy5hc3NpZ25lZF91c2VyLCB7XG4gICAgICAgICAgICAgIGlkOiArcm93LmlkLFxuICAgICAgICAgICAgICBuYW1lOiByb3cubmFtZSxcbiAgICAgICAgICAgICAgZW50aXR5OiBlbnRpdHksXG4gICAgICAgICAgICAgIGludGVybmFsX25hbWU6ICdyb2xlJyxcbiAgICAgICAgICAgICAgdWlkOiBgcm9sZV8ke3Jvdy5pZH1gXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3VzZXInOlxuICAgICAgICAgIGlmKCBJc0FycmF5KCBtYXRjaGVzLCB0cnVlICkgKXtcbiAgICAgICAgICAgIGRpcmVjdCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmFzc2lnblVzZXJzKCBbIHJvdyBdLCB7IGlkOiArcm93LmlkLCBuYW1lOiByb3cubmFtZSwgZW50aXR5OiBlbnRpdHksIGludGVybmFsX25hbWU6ICd1c2VyJywgdHlwZTogJ1VzZXInLCB1aWQ6IGB1c2VyXyR7cm93LmlkfV8ke3R5cGV9YCB9ICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBpZDogcm93LmlkLFxuICAgICAgaW50ZXJuYWxfbmFtZTogcm93LmludGVybmFsX25hbWUsXG4gICAgICBuYW1lOiByb3cuZGlzcGxheV9uYW1lID8gcm93LmRpc3BsYXlfbmFtZSA6IHJvdy5uYW1lLFxuICAgICAgcGFyZW50OiByb3cucGFyZW50LFxuICAgICAgZW50aXR5OiBUaXRsZUNhc2UoIFNuYWtlVG9QYXNjYWwoIFBvcFBpcGUudHJhbnNmb3JtKCBrZXlJbnRlcm5hbE5hbWUsIHsgdHlwZTogJ2VudGl0eScsIGFyZzE6ICdhbGlhcycsIGFyZzI6ICdzaW5ndWxhcicgfSApICkgKS50cmltKCksXG4gICAgICBkaXJlY3Q6IGRpcmVjdCxcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBwcm92aWRlcnM6IHByb3ZpZGVycyxcbiAgICAgIHVpZDogdHlwZSA/IGAke2tleUludGVybmFsTmFtZX1fJHtyb3cuaWR9XyR7dHlwZX1gIDogYCR7a2V5SW50ZXJuYWxOYW1lfV8ke3Jvdy5pZH1gXG4gICAgfTtcbiAgfVxuXG5cbiAgZXZlbnRIYW5kbGVyKCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICl7XG4gICAgaWYoIGV2ZW50LnR5cGUgPT09ICd0YWJsZScgKXtcbiAgICAgIGlmKCB0aGlzLmxvZy5yZXBvLmVuYWJsZWQoKSApIGNvbnNvbGUubG9nKCB0aGlzLmxvZy5yZXBvLm1lc3NhZ2UoICdQb3BFbnRpdHlBc3NpZ25tZW50c0NvbXBvbmVudDpldmVudCcgKSwgdGhpcy5sb2cucmVwby5jb2xvciggJ2V2ZW50JyApLCBldmVudCApO1xuICAgICAgc3dpdGNoKCBldmVudC5kYXRhLmxpbmsgKXtcbiAgICAgICAgY2FzZSAnZW50aXR5JzpcbiAgICAgICAgICB0aGlzLnZpZXdFbnRpdHlQb3J0YWwoIGV2ZW50LmRhdGEucm93LmludGVybmFsX25hbWUsICtldmVudC5kYXRhLnJvdy5pZCApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdwYXJlbnQnOlxuICAgICAgICAgIGlmKCBldmVudC5kYXRhLnJvdyAmJiBldmVudC5kYXRhLnJvdy5wYXJlbnQgKXtcbiAgICAgICAgICAgIHRoaXMudmlld0VudGl0eVBvcnRhbCggZXZlbnQuZGF0YS5yb3cucGFyZW50LmludGVybmFsX25hbWUsICtldmVudC5kYXRhLnJvdy5wYXJlbnQuaWQgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3Byb3ZpZGVycyc6XG4gICAgICAgICAgdGhpcy52aWV3Um93UHJvdmlkZXJzKCBldmVudC5kYXRhLnJvdyApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgdmlld0VudGl0eVBvcnRhbCggaW50ZXJuYWxfbmFtZTogc3RyaW5nLCBpZDogbnVtYmVyICl7XG4gICAgLy8gcGxhY2Vob2xkZXJcbiAgICBpZiggIXRoaXMuZG9tLnN0YXRlLmJsb2NrTW9kYWwgKXtcbiAgICAgIHRoaXMuZG9tLnN0YXRlLmJsb2NrTW9kYWwgPSB0cnVlO1xuICAgICAgaWYoIGludGVybmFsX25hbWUgJiYgK2lkICl7XG4gICAgICAgIHRoaXMuc3J2LmVudGl0eS5nZXRDb3JlQ29uZmlnKCBpbnRlcm5hbF9uYW1lLCAraWQgKS50aGVuKCAoIGVudGl0eUNvbmZpZzogQ29yZUNvbmZpZyApID0+IHtcbiAgICAgICAgICBsZXQgdGFiTWVudUNvbmZpZyA9IHRoaXMuX2J1aWxkVGFiTWVudUNvbmZpZyggZW50aXR5Q29uZmlnICk7XG4gICAgICAgICAgdGFiTWVudUNvbmZpZy5wb3J0YWwgPSB0cnVlO1xuICAgICAgICAgIGxldCBkaWFsb2dSZWYgPSB0aGlzLnNydi5kaWFsb2cub3BlbiggUG9wRW50aXR5VGFiTWVudUNvbXBvbmVudCwge1xuICAgICAgICAgICAgd2lkdGg6IGAke3dpbmRvdy5pbm5lcldpZHRoIC0gMjB9cHhgLFxuICAgICAgICAgICAgaGVpZ2h0OiBgJHt3aW5kb3cuaW5uZXJIZWlnaHQgLSA1MH1weGAsXG4gICAgICAgICAgICBkYXRhOiBlbnRpdHlDb25maWcsXG4gICAgICAgICAgICBwYW5lbENsYXNzOiAnc3ctcmVsYXRpdmUnXG4gICAgICAgICAgfSApO1xuICAgICAgICAgIGxldCBjb21wb25lbnQgPSA8UG9wRW50aXR5VGFiTWVudUNvbXBvbmVudD5kaWFsb2dSZWYuY29tcG9uZW50SW5zdGFuY2U7XG4gICAgICAgICAgY29tcG9uZW50LnJlZ2lzdGVyVGFiTWVudUNvbmZpZyggdGFiTWVudUNvbmZpZyApO1xuICAgICAgICAgIHRoaXMuZG9tLnN1YnNjcmliZXIuZGlhbG9nID0gZGlhbG9nUmVmLmJlZm9yZUNsb3NlZCgpLnN1YnNjcmliZSggKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kb20uc3RhdGUuYmxvY2tNb2RhbCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5zcnYudGFiLnJlZnJlc2hFbnRpdHkoIHRoaXMuY29yZS5wYXJhbXMuZW50aXR5SWQsIG51bGwsIHt9LCAnUG9wRW50aXR5QXNzaWdubWVudHNDb21wb25lbnQ6dmlld0VudGl0eVBvcnRhbCcgKS50aGVuKCAoKSA9PiB7XG4gICAgICAgICAgICAgIGRpYWxvZ1JlZiA9IG51bGw7XG4gICAgICAgICAgICAgIHRhYk1lbnVDb25maWcgPSBudWxsO1xuICAgICAgICAgICAgICBjb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgdmlld1Jvd1Byb3ZpZGVycyggcm93OiBhbnkgKXtcbiAgICBpZiggIXRoaXMuZG9tLnN0YXRlLmJsb2NrTW9kYWwgKXtcbiAgICAgIHRoaXMuZG9tLnN0YXRlLmJsb2NrTW9kYWwgPSB0cnVlO1xuICAgICAgY29uc3QgZGF0YSA9IFtdO1xuICAgICAgY29uc3QgdGFibGVDb25maWcgPSBuZXcgVGFibGVDb25maWcoIHtcbiAgICAgICAgc2VhcmNoOiBmYWxzZSxcbiAgICAgICAgc2VhcmNoQ29sdW1uczogZmFsc2UsXG4gICAgICAgIGhlYWRlclN0aWNreTogdHJ1ZSxcbiAgICAgICAgLy8gcGFnaW5hdG9yOiA1LFxuICAgICAgICBjb2x1bW5EZWZpbml0aW9uczoge1xuICAgICAgICAgIG5hbWU6IHtcbiAgICAgICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgICAgICBoZWxwZXI6IHsgdGV4dDogJ0p1bXAgVG86IDxuYW1lPicsIHBvc2l0aW9uOiAncmlnaHQnIH0sXG4gICAgICAgICAgICBsaW5rOiAncHJvdmlkZXInLFxuICAgICAgICAgICAgb3JkZXI6IDAsXG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGVudGl0eToge1xuICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIC8vIGxpbms6ICdhc3NpZ25lZCcsXG4gICAgICAgICAgICAvLyBoZWxwZXI6IHsgdGV4dDogJ0p1bXAgVG86IDxuYW1lPicsIHBvc2l0aW9uOiAncmlnaHQnIH0sXG4gICAgICAgICAgICBvcmRlcjogMSxcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIC8vIGxpbms6ICdhc3NpZ25lZCcsXG4gICAgICAgICAgICAvLyBoZWxwZXI6IHsgdGV4dDogJ0p1bXAgVG86IDxuYW1lPicsIHBvc2l0aW9uOiAncmlnaHQnIH0sXG4gICAgICAgICAgICBvcmRlcjogMixcbiAgICAgICAgICB9LFxuICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgb3JkZXI6IDEwMCxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBkYXRhOiByb3cucHJvdmlkZXJzXG4gICAgICB9ICk7XG5cblxuICAgICAgY29uc3QgZGlhbG9nUmVmID0gdGhpcy5zcnYuZGlhbG9nLm9wZW4oIFBvcEVudGl0eVByb3ZpZGVyRGlhbG9nQ29tcG9uZW50LCB7XG4gICAgICAgIGRhdGE6IDxQb3BFbnRpdHlQcm92aWRlckRpYWxvZ0ludGVyZmFjZT57XG4gICAgICAgICAgdGFibGU6IHRhYmxlQ29uZmlnLFxuICAgICAgICAgIGNvbmZpZzogdGhpcy5jb3JlLFxuICAgICAgICAgIHJlc291cmNlOiByb3csXG4gICAgICAgIH1cbiAgICAgIH0gKTtcblxuICAgICAgdGhpcy5kb20uc2V0U3Vic2NyaWJlciggJ3BvcC10YWJsZS1kaWFsb2ctY2xvc2UnLCBkaWFsb2dSZWYuYmVmb3JlQ2xvc2VkKCkuc3Vic2NyaWJlKCAoIGNoYW5nZWQgKSA9PiB7XG4gICAgICAgIHRoaXMuZG9tLnN0YXRlLmJsb2NrTW9kYWwgPSBmYWxzZTtcbiAgICAgICAgaWYoIHRydWUgKXtcbiAgICAgICAgICB0aGlzLnNydi50YWIucmVmcmVzaEVudGl0eSggbnVsbCwgdGhpcy5kb20ucmVwbywge30sICdQb3BFbnRpdHlBc3NpZ25tZW50c0NvbXBvbmVudDp2aWV3Um93UHJvdmlkZXJzJyApLnRoZW4oICgpID0+IHRydWUgKTtcbiAgICAgICAgfVxuICAgICAgfSApICk7XG4gICAgfVxuICB9XG5cblxuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIHByaXZhdGUgX2J1aWxkVGFiTWVudUNvbmZpZyggY29yZTogQ29yZUNvbmZpZyApe1xuICAgIHJldHVybiBHZXRUYWJNZW51Q29uZmlnKCBjb3JlLCB0aGlzLnNydi5lbnRpdHkuZ2V0RW50aXR5VGFicyggY29yZSApICk7XG4gIH1cblxuXG59XG4iXX0=