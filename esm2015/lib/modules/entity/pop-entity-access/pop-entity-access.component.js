import { Component, ElementRef } from '@angular/core';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopRequestService } from '../../../services/pop-request.service';
import { ServiceInjector } from '../../../pop-common.model';
import { CheckboxConfig } from '../../base/pop-field-item/pop-checkbox/checkbox-config.model';
import { GetServiceContainer } from '../../../pop-common-dom.models';
import { ArrayMapSetter, DeepCopy, IsArray, IsArrayThrowError } from '../../../pop-common-utility';
export class PopEntityAccessComponent extends PopExtendComponent {
    constructor(el) {
        super();
        this.el = el;
        this.srv = GetServiceContainer();
        this.name = 'PopEntityAccessComponent';
        this.extendServiceContainer();
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.dom.state.expansion = 'compact';
                this.core.repo.getEntity(this.core.params.entityId, { select: 'permissions' }).subscribe((res) => {
                    const entity = res.data ? res.data : res.data;
                    let appDisabled;
                    let appHasEntitiesAccess, appEntitiesWithAccess;
                    this.ui.access = IsArrayThrowError(entity.permissions, true, `${this.name}:configure: - entity.permissions`) ? DeepCopy(entity.permissions) : [];
                    this.ui.access.forEach((app) => {
                        app.expanded = false;
                        appDisabled = this.core.entity.system || !this.core.access.can_update || app.entities.length === 0 ? true : false;
                        app.can_read = { all: app.entities.length ? true : false, disabled: appDisabled, indeterminate: app.entities.length ? true : false };
                        app.can_create = { all: app.entities.length ? true : false, disabled: appDisabled, indeterminate: app.entities.length ? true : false };
                        app.can_update = { all: app.entities.length ? true : false, disabled: appDisabled, indeterminate: app.entities.length ? true : false };
                        app.can_delete = { all: app.entities.length ? true : false, disabled: appDisabled, indeterminate: app.entities.length ? true : false };
                        appHasEntitiesAccess = { can_read: 0, can_create: 0, can_update: 0, can_delete: 0 };
                        appEntitiesWithAccess = { can_read: 0, can_create: 0, can_update: 0, can_delete: 0 };
                        app.entities.forEach((entityToken) => {
                            entityToken.field = {};
                            Object.keys(entityToken.access).forEach((entityAccess) => {
                                entityToken.field[entityAccess] = new CheckboxConfig({
                                    align: 'left',
                                    // patch: { path: `admin/security-profiles/${this.tab.securityProfile.id}/entities/add`, field: access, metadata: { access: 1, entity_fk: entity.id } },
                                    bubble: true,
                                    value: +entityToken.access[entityAccess],
                                    disabled: this.core.entity.system || !entityToken[entityAccess] ? true : false,
                                    metadata: {
                                        app: app,
                                        entity: entityToken,
                                        access: entityAccess,
                                    },
                                });
                                if (entityToken[entityAccess])
                                    appHasEntitiesAccess[entityAccess]++;
                                if (entityToken.access[entityAccess])
                                    appEntitiesWithAccess[entityAccess]++;
                                if (+entityToken.access[entityAccess] === 0) {
                                    if (entityAccess in app) {
                                        app[entityAccess].all = false;
                                    }
                                }
                            });
                        });
                        // if none of the entities are able to use an access just disable the all checkbox
                        Object.keys(appHasEntitiesAccess).forEach((entityAccess) => {
                            if (!appHasEntitiesAccess[entityAccess] && entityAccess in app)
                                app[entityAccess].disabled = true;
                            if (app[entityAccess].all)
                                app[entityAccess].indeterminate = false;
                            if (appEntitiesWithAccess[entityAccess] && !app[entityAccess].all)
                                app[entityAccess].indeterminate = true;
                            if (!appEntitiesWithAccess[entityAccess] && !app[entityAccess].all)
                                app[entityAccess].indeterminate = false;
                        });
                    });
                    this.setExpansionState(this.dom.state.expansion);
                    resolve(true);
                }, err => {
                    this.dom.error = {
                        code: err.error ? err.error.code : err.status,
                        message: err.error ? err.error.message : err.statusText
                    };
                    resolve(false);
                });
            });
        };
    }
    extendServiceContainer() {
        this.srv.request = ServiceInjector.get(PopRequestService);
    }
    /**
     * This component should have a specific purpose
     */
    ngOnInit() {
        super.ngOnInit();
    }
    checkAll(app, access) {
        if (app && access in app) {
            let all = true, indeterminate = false;
            const entity_fks = [];
            const value = +app[access].all;
            if (app.entities.length) {
                all = +value === 1;
                app.entities.forEach((entity) => {
                    if (!this.core.entity.system && this.core.access.can_update && entity[access]) {
                        if (+entity.field[access].control.value !== value) {
                            // entity.field[ access ].patch.running = true;
                            entity.access[access] = value;
                            entity.field[access].control.setValue(value);
                            entity.field[access].message = '';
                            entity.field[access].startPatch();
                            entity_fks.push(entity.id);
                        }
                    }
                    else {
                        if (+entity.field[access].control.value !== value) {
                            indeterminate = true;
                            all = !value;
                        }
                    }
                });
                if (entity_fks.length) {
                    const patch = { access: 1, entity_fk: entity_fks.join() };
                    patch[access] = value;
                    const method = patch[access] === 1 ? 'add' : 'remove';
                    this.srv.request.doPatch(`${this.core.params.path}/${this.core.params.entityId}/entities/${method}`, patch, 1).subscribe(res => {
                        app.entities.forEach((entity) => {
                            entity.field[access]._patchSuccess();
                        });
                        setTimeout(() => {
                            app[access].all = all;
                            app[access].indeterminate = indeterminate;
                        });
                        const sendEvent = {
                            source: this.name,
                            type: 'permissions',
                            model: 'entity',
                            name: 'patch',
                            method: 'update',
                            success: true,
                            config: this.core,
                            data: app,
                            ids: entity_fks,
                            access: access,
                            value: patch[access]
                        };
                        this.sessionChanges(sendEvent);
                        if (this.log.repo.enabled('event', this.name))
                            console.log(this.log.repo.message(`${this.name}:event`), this.log.repo.color('event'), sendEvent);
                    }, err => {
                        app.entities.forEach((entity) => {
                            entity.patchFail((err.error && err.error.message) ? err.error.message : err.message);
                        });
                        setTimeout(() => {
                            app[access].all = all;
                            app[access].indeterminate = indeterminate;
                        });
                        this.dom.error = {
                            code: (err.error ? err.error.code : err.status),
                            message: (err.error ? err.error.message : err.statusText)
                        };
                    });
                }
                else {
                    setTimeout(() => {
                        // app[ access ].all = all;
                        app[access].indeterminate = true;
                    });
                }
            }
            else {
                setTimeout(() => {
                    app[access].all = false;
                    app[access].indeterminate = false;
                });
            }
        }
    }
    setExpansionState(state) {
        if (state) {
            this.dom.state.expansion = state;
        }
        switch (this.dom.state.expansion) {
            case 'none':
                this.ui.access.forEach(function (app) {
                    app.expanded = false;
                });
                break;
            case 'compact':
                this.ui.access.forEach(function (app) {
                    app.expanded = app.can_read.indeterminate || app.can_update.indeterminate || app.can_create.indeterminate || app.can_delete.indeterminate ? true : false;
                });
                break;
            case 'full':
                this.ui.access.forEach(function (app) {
                    app.expanded = true;
                });
                break;
            default:
                break;
        }
    }
    handleInputEvents(event) {
        if (event.type === 'field') {
            if (this.log.repo.enabled())
                console.log(this.log.repo.message('PopEntityAccessComponent:event'), this.log.repo.color('event'), event);
            switch (event.name) {
                case 'onChange':
                    const patch = { access: 1, entity_fk: event.config.metadata.entity.id };
                    patch[event.config.metadata.access] = +event.config.control.value;
                    const method = +event.config.control.value === 1 ? 'add' : 'remove';
                    event.config.startPatch();
                    this.srv.request.doPatch(`${this.core.params.path}/${this.core.params.entityId}/entities/${method}`, patch, 1).subscribe(() => {
                        event.config._patchSuccess();
                        this.checkAppAll(event.config.metadata.app, event.config.metadata.access, +event.config.control.value);
                        const sendEvent = {
                            source: this.name,
                            method: 'update',
                            model: 'entity',
                            type: 'permissions',
                            name: 'patch',
                            success: true,
                            config: this.core,
                            data: event.config.metadata.app,
                            ids: [event.config.metadata.entity.id],
                            access: event.config.metadata.access,
                            value: patch[event.config.metadata.access]
                        };
                        setTimeout(() => {
                            this.sessionChanges(sendEvent);
                        }, 0);
                    }, err => {
                        event.config.patchFail((err.error && err.error.message) ? err.error.message : err.message);
                    });
                    break;
                case patch:
                    if (event.success) {
                        this.checkAppAll(event.config.metadata.app, event.config.metadata.access, event.config.control.value);
                    }
                    break;
                default:
                    break;
            }
        }
    }
    checkAppAll(app, access, val) {
        val = +val;
        let indeterminate = false;
        let all = true;
        if (!val) {
            all = false;
            app.entities.some(entity => {
                if (entity.field[access].control.value) {
                    indeterminate = true;
                    return true;
                }
            });
        }
        else {
            app.entities.some(entity => {
                if (!entity.field[access].control.value) {
                    all = false;
                    indeterminate = true;
                    return true;
                }
            });
        }
        setTimeout(() => {
            app[access].all = all;
            app[access].indeterminate = indeterminate;
        });
    }
    sessionChanges(event) {
        let appId;
        let storedPermissions;
        let storedApp;
        let storedEntity;
        if (event.type === 'permissions' && event.name === 'patch' && event.success && event.config && +event.config.params.id === +this.core.entity.id) {
            if (this.log.repo.enabled('event', this.name))
                console.log(`${this.name} made an access permissions patch session`, this.log.repo.color('event'), event);
            if (this.core.entity.metadata && this.core.entity.metadata.permissions) {
                storedPermissions = this.core.entity.metadata.permissions;
                appId = event.data.id;
                const appMap = ArrayMapSetter(storedPermissions, 'id');
                if (appId in appMap) {
                    if (IsArray(storedPermissions[appMap[appId]].entities, true)) {
                        storedApp = storedPermissions[appMap[appId]];
                        const entityMap = ArrayMapSetter(storedApp.entities, 'id');
                        if (IsArray(event.ids, true)) {
                            event.ids.map((entityID) => {
                                if (entityID in entityMap) {
                                    storedEntity = storedApp.entities[entityMap[entityID]];
                                    if (storedEntity.access && event.access in storedEntity.access)
                                        storedEntity.access[event.access] = event.value;
                                }
                            });
                        }
                    }
                }
            }
            return true;
        }
    }
    toggleApp(app) {
        app.expanded = !app.expanded;
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
PopEntityAccessComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-access',
                template: "<div class=\"access-permissions-container\">\n  <div class=\"sw-label-container\">\n    Access Permissions\n    <mat-form-field class=\"access-expansion-state-select\" appearance=\"outline\">\n      <mat-label>Expand</mat-label>\n      <mat-select [(ngModel)]=\"dom.state.expansion\" (selectionChange)=\"setExpansionState();\">\n        <mat-option value=\"none\">None</mat-option>\n        <mat-option value=\"compact\">Compact</mat-option>\n        <mat-option value=\"full\">Full</mat-option>\n      </mat-select>\n    </mat-form-field>\n    <!--<mat-icon class=\"admin-icon-top-right\"-->\n    <!--[ngClass]=\"{'sw-hidden': state.expansion === 'full'}\"-->\n    <!--matTooltip=\"Expand\"-->\n    <!--matTooltipPosition=\"left\"-->\n    <!--(click)=\"setExpansionState('full');\">expand_more</mat-icon>-->\n    <!--<mat-icon class=\"admin-icon-top-right\"-->\n    <!--[ngClass]=\"{'sw-hidden': state.expansion === 'compact'}\"-->\n    <!--matTooltip=\"Compact\"-->\n    <!--matTooltipPosition=\"left\"-->\n    <!--(click)=\"setExpansionState('compact');\">expand_less</mat-icon>-->\n  </div>\n  <mat-divider></mat-divider>\n  <div class=\"access-filter-bar-loader\">\n    <mat-progress-bar *ngIf=\"dom.state.loading\" mode=\"indeterminate\"></mat-progress-bar>\n  </div>\n  <div class=\"access-permissions-content\">\n    <mat-accordion *ngIf=\"ui.access\" multi=\"true\" [displayMode]=\"'flat'\">\n      <mat-expansion-panel *ngFor=\"let app of ui.access\" [ngClass]=\"{'sw-hidden':!app.entities.length}\"\n                           [expanded]=\"app.expanded\" hideToggle=\"true\">\n        <mat-expansion-panel-header>\n          <div class=\"access-app-permission-header pt-bg-1\" (click)=\"$event.stopPropagation();\">\n            <div class=\"access-app-title-container mat-h2\">\n              <div class=\"access-app-title\">{{app.name}}</div>\n              <div class=\"access-app-toggle-container\">\n                <mat-icon *ngIf=\"!app.expanded\" (click)=\"toggleApp(app);\">keyboard_arrow_right\n                </mat-icon>\n                <mat-icon *ngIf=\"app.expanded\" (click)=\"toggleApp(app);\">keyboard_arrow_down\n                </mat-icon>\n              </div>\n            </div>\n            <div class=\"access-spacer\"></div>\n            <div class=\"access-app-permission-container\">\n              <mat-checkbox [(ngModel)]=\"app.can_read.all\"\n                            [indeterminate]=\"app.can_read.indeterminate\"\n                            (change)=\"checkAll(app, 'can_read');\" [disabled]=\"app.can_read.disabled\">\n                View\n              </mat-checkbox>\n            </div>\n            <div class=\"access-app-permission-container\">\n              <mat-checkbox [(ngModel)]=\"app.can_create.all\"\n                            [indeterminate]=\"app.can_create.indeterminate\"\n                            (change)=\"checkAll(app, 'can_create');\"\n                            [disabled]=\"app.can_create.disabled\">Create\n              </mat-checkbox>\n            </div>\n            <div class=\"access-app-permission-container\">\n              <mat-checkbox [(ngModel)]=\"app.can_update.all\"\n                            [indeterminate]=\"app.can_update.indeterminate\"\n                            (change)=\"checkAll(app, 'can_update');\"\n                            [disabled]=\"app.can_update.disabled\">Edit\n              </mat-checkbox>\n            </div>\n            <div class=\"access-app-permission-container\">\n              <mat-checkbox [(ngModel)]=\"app.can_delete.all\"\n                            [indeterminate]=\"app.can_delete.indeterminate\"\n                            (change)=\"checkAll(app, 'can_delete');\"\n                            [disabled]=\"app.can_delete.disabled\">Delete\n              </mat-checkbox>\n            </div>\n          </div>\n        </mat-expansion-panel-header>\n        <div class=\"mat-expansion-panel-body\">\n          <div class=\"access-app-entity-header\" *ngFor=\"let entity of app.entities\">\n            <div class=\"access-entity-title-container mat-h2\">\n              <div class=\"access-entity-title\">{{entity.name}}</div>\n            </div>\n            <div class=\"access-spacer\"></div>\n            <div class=\"access-app-permission-container\">\n              <lib-pop-checkbox [config]=\"entity.field.can_read\"\n                                (events)=\"handleInputEvents($event)\"></lib-pop-checkbox>\n            </div>\n            <div class=\"access-app-permission-container\">\n              <lib-pop-checkbox [config]=\"entity.field.can_create\"\n                                (events)=\"handleInputEvents($event)\"></lib-pop-checkbox>\n            </div>\n            <div class=\"access-app-permission-container\">\n              <lib-pop-checkbox [config]=\"entity.field.can_update\"\n                                (events)=\"handleInputEvents($event)\"></lib-pop-checkbox>\n            </div>\n            <div class=\"access-app-permission-container\">\n              <lib-pop-checkbox [config]=\"entity.field.can_delete\"\n                                (events)=\"handleInputEvents($event)\"></lib-pop-checkbox>\n            </div>\n          </div>\n        </div>\n      </mat-expansion-panel>\n    </mat-accordion>\n  </div>\n</div>\n",
                styles: [":host{flex:1 1}.access-permissions-container{flex:1 1;padding:0 20px}.access-permissions-content{flex:1 1 100%;height:calc(100vh - 235px);clear:both;overflow-y:scroll;overflow-x:hidden;padding-top:2px}.access-expansion-state-select{position:absolute;right:5px;top:0;max-width:200px}.access-app-permission-header{flex:1 1 100%;min-height:48px;display:flex;justify-content:flex-start;flex-direction:row;align-items:center;border-top:1px solid #ccc;border-bottom:1px solid #ccc}.access-app-title-container{display:flex;height:48px;padding:0 0 0 2%;pointer-events:all;align-items:center;width:30%;max-width:30%;overflow:hidden}.access-spacer{display:flex;flex-grow:1;height:48px;padding:0 1%}.access-app-title{font-size:18px}.access-app-title,.access-entity-title{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.access-entity-title{font-size:16px}.access-app-permission-container{min-width:16%}.access-app-toggle-container{display:flex;margin-left:10px;align-items:center;height:48px}.access-app-entity-header{flex:1 1 100%;min-height:48px;display:flex;justify-content:flex-start;flex-direction:row;align-items:center;border-bottom:1px solid #ccc}.access-entity-title-container{display:flex;height:48px;padding:0 0 0 3%;pointer-events:all;align-items:center;width:30%;max-width:30%}.access-filter-bar-loader{position:relative;display:block;width:100%;height:7px;clear:both}:host ::ng-deep.mat-expansion-panel:not([class*=mat-elevation-z]){box-shadow:none!important}:host ::ng-deep mat-expansion-panel{margin-bottom:40px!important;border:1px solid #ccc}:host ::ng-deep .mat-expansion-panel-body{padding:0!important}:host ::ng-deep mat-expansion-panel-header{padding:0!important;max-height:48px!important}"]
            },] }
];
PopEntityAccessComponent.ctorParameters = () => [
    { type: ElementRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1hY2Nlc3MuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktYWNjZXNzL3BvcC1lbnRpdHktYWNjZXNzLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFDekUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDbkUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDMUUsT0FBTyxFQUFpQyxlQUFlLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMzRixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOERBQThELENBQUM7QUFDOUYsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDckUsT0FBTyxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFRbkcsTUFBTSxPQUFPLHdCQUF5QixTQUFRLGtCQUFrQjtJQVU5RCxZQUNTLEVBQWM7UUFFckIsS0FBSyxFQUFFLENBQUM7UUFGRCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBVmIsUUFBRyxHQUFHLG1CQUFtQixFQUFFLENBQUM7UUFDL0IsU0FBSSxHQUFHLDBCQUEwQixDQUFDO1FBYXZDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBQzlCOztXQUVHO1FBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBcUIsRUFBRTtZQUUxQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBRzdCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNB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QUMsR0FBRztRQUNYLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO0lBQy9CLENBQUM7SUFHRDs7T0FFRztJQUNILFdBQVc7UUFDVCxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdEIsQ0FBQzs7O1lBbFVGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsdUJBQXVCO2dCQUNqQyxrdEtBQWlEOzthQUVsRDs7O1lBYm1CLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBQb3BFeHRlbmRDb21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi9wb3AtZXh0ZW5kLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BSZXF1ZXN0U2VydmljZSB9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1yZXF1ZXN0LnNlcnZpY2UnO1xuaW1wb3J0IHsgRW50aXR5LCBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsIFNlcnZpY2VJbmplY3RvciB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgQ2hlY2tib3hDb25maWcgfSBmcm9tICcuLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1jaGVja2JveC9jaGVja2JveC1jb25maWcubW9kZWwnO1xuaW1wb3J0IHsgR2V0U2VydmljZUNvbnRhaW5lciB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24tZG9tLm1vZGVscyc7XG5pbXBvcnQgeyBBcnJheU1hcFNldHRlciwgRGVlcENvcHksIElzQXJyYXksIElzQXJyYXlUaHJvd0Vycm9yIH0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWVudGl0eS1hY2Nlc3MnLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLWVudGl0eS1hY2Nlc3MuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWVudGl0eS1hY2Nlc3MuY29tcG9uZW50LnNjc3MnIF1cbn0pXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5QWNjZXNzQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBwcm90ZWN0ZWQgc3J2ID0gR2V0U2VydmljZUNvbnRhaW5lcigpO1xuICBwdWJsaWMgbmFtZSA9ICdQb3BFbnRpdHlBY2Nlc3NDb21wb25lbnQnO1xuXG5cbiAgcHJvdGVjdGVkIGV4dGVuZFNlcnZpY2VDb250YWluZXIoKXtcbiAgICB0aGlzLnNydi5yZXF1ZXN0ID0gU2VydmljZUluamVjdG9yLmdldChQb3BSZXF1ZXN0U2VydmljZSk7XG4gIH1cblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgKXtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5leHRlbmRTZXJ2aWNlQ29udGFpbmVyKCk7XG4gICAgLyoqXG4gICAgICogVGhpcyBzaG91bGQgdHJhbnNmb3JtIGFuZCB2YWxpZGF0ZSB0aGUgZGF0YS4gVGhlIHZpZXcgc2hvdWxkIHRyeSB0byBvbmx5IHVzZSBkYXRhIHRoYXQgaXMgc3RvcmVkIG9uIHVpIHNvIHRoYXQgaXQgaXMgbm90IGRlcGVuZGVudCBvbiB0aGUgc3RydWN0dXJlIG9mIGRhdGEgdGhhdCBjb21lcyBmcm9tIG90aGVyIHNvdXJjZXMuIFRoZSB1aSBzaG91bGQgYmUgdGhlIHNvdXJjZSBvZiB0cnV0aCBoZXJlLlxuICAgICAqL1xuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cblxuICAgICAgICB0aGlzLmRvbS5zdGF0ZS5leHBhbnNpb24gPSAnY29tcGFjdCc7XG4gICAgICAgIHRoaXMuY29yZS5yZXBvLmdldEVudGl0eSh0aGlzLmNvcmUucGFyYW1zLmVudGl0eUlkLCB7IHNlbGVjdDogJ3Blcm1pc3Npb25zJyB9KS5zdWJzY3JpYmUoKHJlczogYW55KSA9PiB7XG4gICAgICAgICAgY29uc3QgZW50aXR5ID0gcmVzLmRhdGEgPyA8RW50aXR5PnJlcy5kYXRhIDogPEVudGl0eT5yZXMuZGF0YTtcbiAgICAgICAgICBsZXQgYXBwRGlzYWJsZWQ7XG4gICAgICAgICAgbGV0IGFwcEhhc0VudGl0aWVzQWNjZXNzLCBhcHBFbnRpdGllc1dpdGhBY2Nlc3M7XG4gICAgICAgICAgdGhpcy51aS5hY2Nlc3MgPSBJc0FycmF5VGhyb3dFcnJvcihlbnRpdHkucGVybWlzc2lvbnMsIHRydWUsIGAke3RoaXMubmFtZX06Y29uZmlndXJlOiAtIGVudGl0eS5wZXJtaXNzaW9uc2ApID8gRGVlcENvcHkoZW50aXR5LnBlcm1pc3Npb25zKSA6IFtdO1xuXG4gICAgICAgICAgdGhpcy51aS5hY2Nlc3MuZm9yRWFjaCgoYXBwKSA9PiB7XG4gICAgICAgICAgICBhcHAuZXhwYW5kZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGFwcERpc2FibGVkID0gdGhpcy5jb3JlLmVudGl0eS5zeXN0ZW0gfHwgIXRoaXMuY29yZS5hY2Nlc3MuY2FuX3VwZGF0ZSB8fCBhcHAuZW50aXRpZXMubGVuZ3RoID09PSAwID8gdHJ1ZSA6IGZhbHNlXG4gICAgICAgICAgICBhcHAuY2FuX3JlYWQgPSB7IGFsbDogYXBwLmVudGl0aWVzLmxlbmd0aCA/IHRydWUgOiBmYWxzZSwgZGlzYWJsZWQ6IGFwcERpc2FibGVkLCBpbmRldGVybWluYXRlOiBhcHAuZW50aXRpZXMubGVuZ3RoID8gdHJ1ZSA6IGZhbHNlIH07XG4gICAgICAgICAgICBhcHAuY2FuX2NyZWF0ZSA9IHsgYWxsOiBhcHAuZW50aXRpZXMubGVuZ3RoID8gdHJ1ZSA6IGZhbHNlLCBkaXNhYmxlZDogYXBwRGlzYWJsZWQsIGluZGV0ZXJtaW5hdGU6IGFwcC5lbnRpdGllcy5sZW5ndGggPyB0cnVlIDogZmFsc2UgfTtcbiAgICAgICAgICAgIGFwcC5jYW5fdXBkYXRlID0geyBhbGw6IGFwcC5lbnRpdGllcy5sZW5ndGggPyB0cnVlIDogZmFsc2UsIGRpc2FibGVkOiBhcHBEaXNhYmxlZCwgaW5kZXRlcm1pbmF0ZTogYXBwLmVudGl0aWVzLmxlbmd0aCA/IHRydWUgOiBmYWxzZSB9O1xuICAgICAgICAgICAgYXBwLmNhbl9kZWxldGUgPSB7IGFsbDogYXBwLmVudGl0aWVzLmxlbmd0aCA/IHRydWUgOiBmYWxzZSwgZGlzYWJsZWQ6IGFwcERpc2FibGVkLCBpbmRldGVybWluYXRlOiBhcHAuZW50aXRpZXMubGVuZ3RoID8gdHJ1ZSA6IGZhbHNlIH07XG4gICAgICAgICAgICBhcHBIYXNFbnRpdGllc0FjY2VzcyA9IHsgY2FuX3JlYWQ6IDAsIGNhbl9jcmVhdGU6IDAsIGNhbl91cGRhdGU6IDAsIGNhbl9kZWxldGU6IDAgfTtcbiAgICAgICAgICAgIGFwcEVudGl0aWVzV2l0aEFjY2VzcyA9IHsgY2FuX3JlYWQ6IDAsIGNhbl9jcmVhdGU6IDAsIGNhbl91cGRhdGU6IDAsIGNhbl9kZWxldGU6IDAgfTtcbiAgICAgICAgICAgIGFwcC5lbnRpdGllcy5mb3JFYWNoKChlbnRpdHlUb2tlbikgPT4ge1xuICAgICAgICAgICAgICBlbnRpdHlUb2tlbi5maWVsZCA9IHt9O1xuICAgICAgICAgICAgICBPYmplY3Qua2V5cyhlbnRpdHlUb2tlbi5hY2Nlc3MpLmZvckVhY2goKGVudGl0eUFjY2VzcykgPT4ge1xuICAgICAgICAgICAgICAgIGVudGl0eVRva2VuLmZpZWxkWyBlbnRpdHlBY2Nlc3MgXSA9IG5ldyBDaGVja2JveENvbmZpZyh7XG4gICAgICAgICAgICAgICAgICBhbGlnbjogJ2xlZnQnLFxuICAgICAgICAgICAgICAgICAgLy8gcGF0Y2g6IHsgcGF0aDogYGFkbWluL3NlY3VyaXR5LXByb2ZpbGVzLyR7dGhpcy50YWIuc2VjdXJpdHlQcm9maWxlLmlkfS9lbnRpdGllcy9hZGRgLCBmaWVsZDogYWNjZXNzLCBtZXRhZGF0YTogeyBhY2Nlc3M6IDEsIGVudGl0eV9mazogZW50aXR5LmlkIH0gfSxcbiAgICAgICAgICAgICAgICAgIGJ1YmJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiArZW50aXR5VG9rZW4uYWNjZXNzWyBlbnRpdHlBY2Nlc3MgXSxcbiAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLmNvcmUuZW50aXR5LnN5c3RlbSB8fCAhZW50aXR5VG9rZW5bIGVudGl0eUFjY2VzcyBdID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgYXBwOiBhcHAsXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eTogZW50aXR5VG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIGFjY2VzczogZW50aXR5QWNjZXNzLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiggZW50aXR5VG9rZW5bIGVudGl0eUFjY2VzcyBdICkgYXBwSGFzRW50aXRpZXNBY2Nlc3NbIGVudGl0eUFjY2VzcyBdKys7XG4gICAgICAgICAgICAgICAgaWYoIGVudGl0eVRva2VuLmFjY2Vzc1sgZW50aXR5QWNjZXNzIF0gKSBhcHBFbnRpdGllc1dpdGhBY2Nlc3NbIGVudGl0eUFjY2VzcyBdKys7XG4gICAgICAgICAgICAgICAgaWYoICtlbnRpdHlUb2tlbi5hY2Nlc3NbIGVudGl0eUFjY2VzcyBdID09PSAwICl7XG4gICAgICAgICAgICAgICAgICBpZiggZW50aXR5QWNjZXNzIGluIGFwcCApe1xuICAgICAgICAgICAgICAgICAgICBhcHBbIGVudGl0eUFjY2VzcyBdLmFsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIGlmIG5vbmUgb2YgdGhlIGVudGl0aWVzIGFyZSBhYmxlIHRvIHVzZSBhbiBhY2Nlc3MganVzdCBkaXNhYmxlIHRoZSBhbGwgY2hlY2tib3hcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGFwcEhhc0VudGl0aWVzQWNjZXNzKS5mb3JFYWNoKChlbnRpdHlBY2Nlc3MpID0+IHtcbiAgICAgICAgICAgICAgaWYoICFhcHBIYXNFbnRpdGllc0FjY2Vzc1sgZW50aXR5QWNjZXNzIF0gJiYgZW50aXR5QWNjZXNzIGluIGFwcCApIGFwcFsgZW50aXR5QWNjZXNzIF0uZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBpZiggYXBwWyBlbnRpdHlBY2Nlc3MgXS5hbGwgKSBhcHBbIGVudGl0eUFjY2VzcyBdLmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgaWYoIGFwcEVudGl0aWVzV2l0aEFjY2Vzc1sgZW50aXR5QWNjZXNzIF0gJiYgIWFwcFsgZW50aXR5QWNjZXNzIF0uYWxsICkgYXBwWyBlbnRpdHlBY2Nlc3MgXS5pbmRldGVybWluYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgaWYoICFhcHBFbnRpdGllc1dpdGhBY2Nlc3NbIGVudGl0eUFjY2VzcyBdICYmICFhcHBbIGVudGl0eUFjY2VzcyBdLmFsbCApIGFwcFsgZW50aXR5QWNjZXNzIF0uaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB0aGlzLnNldEV4cGFuc2lvblN0YXRlKHRoaXMuZG9tLnN0YXRlLmV4cGFuc2lvbik7XG5cbiAgICAgICAgICByZXNvbHZlKHRydWUpO1xuXG4gICAgICAgIH0sIGVyciA9PiB7XG4gICAgICAgICAgdGhpcy5kb20uZXJyb3IgPSB7XG4gICAgICAgICAgICBjb2RlOiBlcnIuZXJyb3IgPyBlcnIuZXJyb3IuY29kZSA6IGVyci5zdGF0dXMsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnIuZXJyb3IgPyBlcnIuZXJyb3IubWVzc2FnZSA6IGVyci5zdGF0dXNUZXh0XG4gICAgICAgICAgfTtcbiAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBjb21wb25lbnQgc2hvdWxkIGhhdmUgYSBzcGVjaWZpYyBwdXJwb3NlXG4gICAqL1xuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIGNoZWNrQWxsKGFwcCwgYWNjZXNzKTogdm9pZHtcbiAgICBpZiggYXBwICYmIGFjY2VzcyBpbiBhcHAgKXtcbiAgICAgIGxldCBhbGwgPSB0cnVlLCBpbmRldGVybWluYXRlID0gZmFsc2U7XG4gICAgICBjb25zdCBlbnRpdHlfZmtzID0gW107XG4gICAgICBjb25zdCB2YWx1ZSA9ICthcHBbIGFjY2VzcyBdLmFsbDtcbiAgICAgIGlmKCBhcHAuZW50aXRpZXMubGVuZ3RoICl7XG4gICAgICAgIGFsbCA9ICt2YWx1ZSA9PT0gMTtcbiAgICAgICAgYXBwLmVudGl0aWVzLmZvckVhY2goKGVudGl0eSkgPT4ge1xuICAgICAgICAgIGlmKCAhdGhpcy5jb3JlLmVudGl0eS5zeXN0ZW0gJiYgdGhpcy5jb3JlLmFjY2Vzcy5jYW5fdXBkYXRlICYmIGVudGl0eVsgYWNjZXNzIF0gKXtcbiAgICAgICAgICAgIGlmKCArZW50aXR5LmZpZWxkWyBhY2Nlc3MgXS5jb250cm9sLnZhbHVlICE9PSB2YWx1ZSApe1xuICAgICAgICAgICAgICAvLyBlbnRpdHkuZmllbGRbIGFjY2VzcyBdLnBhdGNoLnJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICAgICAgICBlbnRpdHkuYWNjZXNzWyBhY2Nlc3MgXSA9IHZhbHVlO1xuICAgICAgICAgICAgICBlbnRpdHkuZmllbGRbIGFjY2VzcyBdLmNvbnRyb2wuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgICAgICAgICBlbnRpdHkuZmllbGRbIGFjY2VzcyBdLm1lc3NhZ2UgPSAnJztcbiAgICAgICAgICAgICAgZW50aXR5LmZpZWxkWyBhY2Nlc3MgXS5zdGFydFBhdGNoKCk7XG4gICAgICAgICAgICAgIGVudGl0eV9ma3MucHVzaChlbnRpdHkuaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgaWYoICtlbnRpdHkuZmllbGRbIGFjY2VzcyBdLmNvbnRyb2wudmFsdWUgIT09IHZhbHVlICl7XG4gICAgICAgICAgICAgIGluZGV0ZXJtaW5hdGUgPSB0cnVlO1xuICAgICAgICAgICAgICBhbGwgPSAhdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYoIGVudGl0eV9ma3MubGVuZ3RoICl7XG4gICAgICAgICAgY29uc3QgcGF0Y2ggPSB7IGFjY2VzczogMSwgZW50aXR5X2ZrOiBlbnRpdHlfZmtzLmpvaW4oKSB9O1xuICAgICAgICAgIHBhdGNoWyBhY2Nlc3MgXSA9IHZhbHVlO1xuICAgICAgICAgIGNvbnN0IG1ldGhvZCA9IHBhdGNoWyBhY2Nlc3MgXSA9PT0gMSA/ICdhZGQnIDogJ3JlbW92ZSc7XG4gICAgICAgICAgdGhpcy5zcnYucmVxdWVzdC5kb1BhdGNoKGAke3RoaXMuY29yZS5wYXJhbXMucGF0aH0vJHt0aGlzLmNvcmUucGFyYW1zLmVudGl0eUlkfS9lbnRpdGllcy8ke21ldGhvZH1gLCBwYXRjaCwgMSkuc3Vic2NyaWJlKHJlcyA9PiB7XG4gICAgICAgICAgICBhcHAuZW50aXRpZXMuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICAgIGVudGl0eS5maWVsZFsgYWNjZXNzIF0uX3BhdGNoU3VjY2VzcygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgYXBwWyBhY2Nlc3MgXS5hbGwgPSBhbGw7XG4gICAgICAgICAgICAgIGFwcFsgYWNjZXNzIF0uaW5kZXRlcm1pbmF0ZSA9IGluZGV0ZXJtaW5hdGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHNlbmRFdmVudCA9IHtcbiAgICAgICAgICAgICAgc291cmNlOiB0aGlzLm5hbWUsXG4gICAgICAgICAgICAgIHR5cGU6ICdwZXJtaXNzaW9ucycsXG4gICAgICAgICAgICAgIG1vZGVsOiAnZW50aXR5JyxcbiAgICAgICAgICAgICAgbmFtZTogJ3BhdGNoJyxcbiAgICAgICAgICAgICAgbWV0aG9kOiAndXBkYXRlJyxcbiAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgY29uZmlnOiB0aGlzLmNvcmUsXG4gICAgICAgICAgICAgIGRhdGE6IGFwcCxcbiAgICAgICAgICAgICAgaWRzOiBlbnRpdHlfZmtzLFxuICAgICAgICAgICAgICBhY2Nlc3M6IGFjY2VzcyxcbiAgICAgICAgICAgICAgdmFsdWU6IHBhdGNoWyBhY2Nlc3MgXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuc2Vzc2lvbkNoYW5nZXMoc2VuZEV2ZW50KTtcbiAgICAgICAgICAgIGlmKCB0aGlzLmxvZy5yZXBvLmVuYWJsZWQoJ2V2ZW50JywgdGhpcy5uYW1lKSApIGNvbnNvbGUubG9nKHRoaXMubG9nLnJlcG8ubWVzc2FnZShgJHt0aGlzLm5hbWV9OmV2ZW50YCksIHRoaXMubG9nLnJlcG8uY29sb3IoJ2V2ZW50JyksIHNlbmRFdmVudCk7XG4gICAgICAgICAgfSwgZXJyID0+IHtcbiAgICAgICAgICAgIGFwcC5lbnRpdGllcy5mb3JFYWNoKChlbnRpdHkpID0+IHtcbiAgICAgICAgICAgICAgZW50aXR5LnBhdGNoRmFpbCgoIGVyci5lcnJvciAmJiBlcnIuZXJyb3IubWVzc2FnZSApID8gZXJyLmVycm9yLm1lc3NhZ2UgOiBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICBhcHBbIGFjY2VzcyBdLmFsbCA9IGFsbDtcbiAgICAgICAgICAgICAgYXBwWyBhY2Nlc3MgXS5pbmRldGVybWluYXRlID0gaW5kZXRlcm1pbmF0ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5kb20uZXJyb3IgPSB7XG4gICAgICAgICAgICAgIGNvZGU6ICggZXJyLmVycm9yID8gZXJyLmVycm9yLmNvZGUgOiBlcnIuc3RhdHVzICksXG4gICAgICAgICAgICAgIG1lc3NhZ2U6ICggZXJyLmVycm9yID8gZXJyLmVycm9yLm1lc3NhZ2UgOiBlcnIuc3RhdHVzVGV4dCApXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIC8vIGFwcFsgYWNjZXNzIF0uYWxsID0gYWxsO1xuICAgICAgICAgICAgYXBwWyBhY2Nlc3MgXS5pbmRldGVybWluYXRlID0gdHJ1ZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGFwcFsgYWNjZXNzIF0uYWxsID0gZmFsc2U7XG4gICAgICAgICAgYXBwWyBhY2Nlc3MgXS5pbmRldGVybWluYXRlID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgc2V0RXhwYW5zaW9uU3RhdGUoc3RhdGU/OiBzdHJpbmcpe1xuICAgIGlmKCBzdGF0ZSApe1xuICAgICAgdGhpcy5kb20uc3RhdGUuZXhwYW5zaW9uID0gc3RhdGU7XG4gICAgfVxuICAgIHN3aXRjaCggdGhpcy5kb20uc3RhdGUuZXhwYW5zaW9uICl7XG4gICAgICBjYXNlICdub25lJzpcbiAgICAgICAgdGhpcy51aS5hY2Nlc3MuZm9yRWFjaChmdW5jdGlvbihhcHApe1xuICAgICAgICAgIGFwcC5leHBhbmRlZCA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjb21wYWN0JzpcbiAgICAgICAgdGhpcy51aS5hY2Nlc3MuZm9yRWFjaChmdW5jdGlvbihhcHApe1xuICAgICAgICAgIGFwcC5leHBhbmRlZCA9IGFwcC5jYW5fcmVhZC5pbmRldGVybWluYXRlIHx8IGFwcC5jYW5fdXBkYXRlLmluZGV0ZXJtaW5hdGUgfHwgYXBwLmNhbl9jcmVhdGUuaW5kZXRlcm1pbmF0ZSB8fCBhcHAuY2FuX2RlbGV0ZS5pbmRldGVybWluYXRlID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdmdWxsJzpcbiAgICAgICAgdGhpcy51aS5hY2Nlc3MuZm9yRWFjaChmdW5jdGlvbihhcHApe1xuICAgICAgICAgIGFwcC5leHBhbmRlZCA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuXG4gICAgfVxuICB9XG5cblxuICBoYW5kbGVJbnB1dEV2ZW50cyhldmVudCl7XG4gICAgaWYoIGV2ZW50LnR5cGUgPT09ICdmaWVsZCcgKXtcbiAgICAgIGlmKCB0aGlzLmxvZy5yZXBvLmVuYWJsZWQoKSApIGNvbnNvbGUubG9nKHRoaXMubG9nLnJlcG8ubWVzc2FnZSgnUG9wRW50aXR5QWNjZXNzQ29tcG9uZW50OmV2ZW50JyksIHRoaXMubG9nLnJlcG8uY29sb3IoJ2V2ZW50JyksIGV2ZW50KTtcbiAgICAgIHN3aXRjaCggZXZlbnQubmFtZSApe1xuICAgICAgICBjYXNlICdvbkNoYW5nZSc6XG4gICAgICAgICAgY29uc3QgcGF0Y2ggPSB7IGFjY2VzczogMSwgZW50aXR5X2ZrOiBldmVudC5jb25maWcubWV0YWRhdGEuZW50aXR5LmlkIH07XG4gICAgICAgICAgcGF0Y2hbIGV2ZW50LmNvbmZpZy5tZXRhZGF0YS5hY2Nlc3MgXSA9ICtldmVudC5jb25maWcuY29udHJvbC52YWx1ZTtcbiAgICAgICAgICBjb25zdCBtZXRob2QgPSArZXZlbnQuY29uZmlnLmNvbnRyb2wudmFsdWUgPT09IDEgPyAnYWRkJyA6ICdyZW1vdmUnO1xuICAgICAgICAgIGV2ZW50LmNvbmZpZy5zdGFydFBhdGNoKCk7XG4gICAgICAgICAgdGhpcy5zcnYucmVxdWVzdC5kb1BhdGNoKGAke3RoaXMuY29yZS5wYXJhbXMucGF0aH0vJHt0aGlzLmNvcmUucGFyYW1zLmVudGl0eUlkfS9lbnRpdGllcy8ke21ldGhvZH1gLCBwYXRjaCwgMSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LmNvbmZpZy5fcGF0Y2hTdWNjZXNzKCk7XG4gICAgICAgICAgICB0aGlzLmNoZWNrQXBwQWxsKGV2ZW50LmNvbmZpZy5tZXRhZGF0YS5hcHAsIGV2ZW50LmNvbmZpZy5tZXRhZGF0YS5hY2Nlc3MsICtldmVudC5jb25maWcuY29udHJvbC52YWx1ZSk7XG4gICAgICAgICAgICBjb25zdCBzZW5kRXZlbnQgPSB7XG4gICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5uYW1lLFxuICAgICAgICAgICAgICBtZXRob2Q6ICd1cGRhdGUnLFxuICAgICAgICAgICAgICBtb2RlbDogJ2VudGl0eScsXG4gICAgICAgICAgICAgIHR5cGU6ICdwZXJtaXNzaW9ucycsXG4gICAgICAgICAgICAgIG5hbWU6ICdwYXRjaCcsXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgIGNvbmZpZzogdGhpcy5jb3JlLFxuICAgICAgICAgICAgICBkYXRhOiBldmVudC5jb25maWcubWV0YWRhdGEuYXBwLFxuICAgICAgICAgICAgICBpZHM6IFsgZXZlbnQuY29uZmlnLm1ldGFkYXRhLmVudGl0eS5pZCBdLFxuICAgICAgICAgICAgICBhY2Nlc3M6IGV2ZW50LmNvbmZpZy5tZXRhZGF0YS5hY2Nlc3MsXG4gICAgICAgICAgICAgIHZhbHVlOiBwYXRjaFsgZXZlbnQuY29uZmlnLm1ldGFkYXRhLmFjY2VzcyBdXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuc2Vzc2lvbkNoYW5nZXMoc2VuZEV2ZW50KTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIH0sIGVyciA9PiB7XG4gICAgICAgICAgICBldmVudC5jb25maWcucGF0Y2hGYWlsKCggZXJyLmVycm9yICYmIGVyci5lcnJvci5tZXNzYWdlICkgPyBlcnIuZXJyb3IubWVzc2FnZSA6IGVyci5tZXNzYWdlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBwYXRjaDpcbiAgICAgICAgICBpZiggZXZlbnQuc3VjY2VzcyApe1xuICAgICAgICAgICAgdGhpcy5jaGVja0FwcEFsbChldmVudC5jb25maWcubWV0YWRhdGEuYXBwLCBldmVudC5jb25maWcubWV0YWRhdGEuYWNjZXNzLCBldmVudC5jb25maWcuY29udHJvbC52YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgY2hlY2tBcHBBbGwoYXBwLCBhY2Nlc3MsIHZhbCl7XG4gICAgdmFsID0gK3ZhbDtcbiAgICBsZXQgaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgIGxldCBhbGwgPSB0cnVlO1xuICAgIGlmKCAhdmFsICl7XG4gICAgICBhbGwgPSBmYWxzZTtcbiAgICAgIGFwcC5lbnRpdGllcy5zb21lKGVudGl0eSA9PiB7XG4gICAgICAgIGlmKCBlbnRpdHkuZmllbGRbIGFjY2VzcyBdLmNvbnRyb2wudmFsdWUgKXtcbiAgICAgICAgICBpbmRldGVybWluYXRlID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfWVsc2V7XG4gICAgICBhcHAuZW50aXRpZXMuc29tZShlbnRpdHkgPT4ge1xuICAgICAgICBpZiggIWVudGl0eS5maWVsZFsgYWNjZXNzIF0uY29udHJvbC52YWx1ZSApe1xuICAgICAgICAgIGFsbCA9IGZhbHNlO1xuICAgICAgICAgIGluZGV0ZXJtaW5hdGUgPSB0cnVlO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBhcHBbIGFjY2VzcyBdLmFsbCA9IGFsbDtcbiAgICAgIGFwcFsgYWNjZXNzIF0uaW5kZXRlcm1pbmF0ZSA9IGluZGV0ZXJtaW5hdGU7XG4gICAgfSk7XG4gIH1cblxuXG4gIHNlc3Npb25DaGFuZ2VzKGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2Upe1xuICAgIGxldCBhcHBJZDtcbiAgICBsZXQgc3RvcmVkUGVybWlzc2lvbnM7XG4gICAgbGV0IHN0b3JlZEFwcDtcbiAgICBsZXQgc3RvcmVkRW50aXR5O1xuICAgIGlmKCBldmVudC50eXBlID09PSAncGVybWlzc2lvbnMnICYmIGV2ZW50Lm5hbWUgPT09ICdwYXRjaCcgJiYgZXZlbnQuc3VjY2VzcyAmJiBldmVudC5jb25maWcgJiYgK2V2ZW50LmNvbmZpZy5wYXJhbXMuaWQgPT09ICt0aGlzLmNvcmUuZW50aXR5LmlkICl7XG4gICAgICBpZiggdGhpcy5sb2cucmVwby5lbmFibGVkKCdldmVudCcsIHRoaXMubmFtZSkgKSBjb25zb2xlLmxvZyhgJHt0aGlzLm5hbWV9IG1hZGUgYW4gYWNjZXNzIHBlcm1pc3Npb25zIHBhdGNoIHNlc3Npb25gLCB0aGlzLmxvZy5yZXBvLmNvbG9yKCdldmVudCcpLCBldmVudCk7XG4gICAgICBpZiggdGhpcy5jb3JlLmVudGl0eS5tZXRhZGF0YSAmJiB0aGlzLmNvcmUuZW50aXR5Lm1ldGFkYXRhLnBlcm1pc3Npb25zICl7XG4gICAgICAgIHN0b3JlZFBlcm1pc3Npb25zID0gdGhpcy5jb3JlLmVudGl0eS5tZXRhZGF0YS5wZXJtaXNzaW9ucztcbiAgICAgICAgYXBwSWQgPSBldmVudC5kYXRhLmlkO1xuICAgICAgICBjb25zdCBhcHBNYXAgPSBBcnJheU1hcFNldHRlcihzdG9yZWRQZXJtaXNzaW9ucywgJ2lkJyk7XG4gICAgICAgIGlmKCBhcHBJZCBpbiBhcHBNYXAgKXtcbiAgICAgICAgICBpZiggSXNBcnJheShzdG9yZWRQZXJtaXNzaW9uc1sgYXBwTWFwWyBhcHBJZCBdIF0uZW50aXRpZXMsIHRydWUpICl7XG4gICAgICAgICAgICBzdG9yZWRBcHAgPSBzdG9yZWRQZXJtaXNzaW9uc1sgYXBwTWFwWyBhcHBJZCBdIF07XG4gICAgICAgICAgICBjb25zdCBlbnRpdHlNYXAgPSBBcnJheU1hcFNldHRlcihzdG9yZWRBcHAuZW50aXRpZXMsICdpZCcpO1xuICAgICAgICAgICAgaWYoIElzQXJyYXkoZXZlbnQuaWRzLCB0cnVlKSApe1xuICAgICAgICAgICAgICBldmVudC5pZHMubWFwKChlbnRpdHlJRDogbnVtYmVyKSA9PiB7IC8vIHRoZSBpZHMgdGhhdCBuZWVkIHRvIGJlIHVwZGF0ZWQgaW4gc2Vzc2lvblxuICAgICAgICAgICAgICAgIGlmKCBlbnRpdHlJRCBpbiBlbnRpdHlNYXAgKXtcbiAgICAgICAgICAgICAgICAgIHN0b3JlZEVudGl0eSA9IHN0b3JlZEFwcC5lbnRpdGllc1sgZW50aXR5TWFwWyBlbnRpdHlJRCBdIF07XG4gICAgICAgICAgICAgICAgICBpZiggc3RvcmVkRW50aXR5LmFjY2VzcyAmJiBldmVudC5hY2Nlc3MgaW4gc3RvcmVkRW50aXR5LmFjY2VzcyApIHN0b3JlZEVudGl0eS5hY2Nlc3NbIGV2ZW50LmFjY2VzcyBdID0gZXZlbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG5cbiAgdG9nZ2xlQXBwKGFwcCl7XG4gICAgYXBwLmV4cGFuZGVkID0gIWFwcC5leHBhbmRlZDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSBkb20gZGVzdHJveSBmdW5jdGlvbiBtYW5hZ2VzIGFsbCB0aGUgY2xlYW4gdXAgdGhhdCBpcyBuZWNlc3NhcnkgaWYgc3Vic2NyaXB0aW9ucywgdGltZW91dHMsIGV0YyBhcmUgc3RvcmVkIHByb3Blcmx5XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG59XG4iXX0=