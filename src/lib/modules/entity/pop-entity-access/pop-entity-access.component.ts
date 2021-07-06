import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopRequestService } from '../../../services/pop-request.service';
import { Entity, PopBaseEventInterface, ServiceInjector } from '../../../pop-common.model';
import { CheckboxConfig } from '../../base/pop-field-item/pop-checkbox/checkbox-config.model';
import { GetServiceContainer } from '../../../pop-common-dom.models';
import { ArrayMapSetter, DeepCopy, IsArray, IsArrayThrowError } from '../../../pop-common-utility';


@Component({
  selector: 'lib-pop-entity-access',
  templateUrl: './pop-entity-access.component.html',
  styleUrls: [ './pop-entity-access.component.scss' ]
})
export class PopEntityAccessComponent extends PopExtendComponent implements OnInit, OnDestroy {
  protected srv = GetServiceContainer();
  public name = 'PopEntityAccessComponent';


  protected extendServiceContainer(){
    this.srv.request = ServiceInjector.get(PopRequestService);
  }


  constructor(
    public el: ElementRef,
  ){
    super();

    this.extendServiceContainer();
    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {

      return new Promise((resolve) => {


        this.dom.state.expansion = 'compact';
        this.core.repo.getEntity(this.core.params.entityId, { select: 'permissions' }).subscribe((res: any) => {
          const entity = res.data ? <Entity>res.data : <Entity>res.data;
          let appDisabled;
          let appHasEntitiesAccess, appEntitiesWithAccess;
          this.ui.access = IsArrayThrowError(entity.permissions, true, `${this.name}:configure: - entity.permissions`) ? DeepCopy(entity.permissions) : [];

          this.ui.access.forEach((app) => {
            app.expanded = false;
            appDisabled = this.core.entity.system || !this.core.access.can_update || app.entities.length === 0 ? true : false
            app.can_read = { all: app.entities.length ? true : false, disabled: appDisabled, indeterminate: app.entities.length ? true : false };
            app.can_create = { all: app.entities.length ? true : false, disabled: appDisabled, indeterminate: app.entities.length ? true : false };
            app.can_update = { all: app.entities.length ? true : false, disabled: appDisabled, indeterminate: app.entities.length ? true : false };
            app.can_delete = { all: app.entities.length ? true : false, disabled: appDisabled, indeterminate: app.entities.length ? true : false };
            appHasEntitiesAccess = { can_read: 0, can_create: 0, can_update: 0, can_delete: 0 };
            appEntitiesWithAccess = { can_read: 0, can_create: 0, can_update: 0, can_delete: 0 };
            app.entities.forEach((entityToken) => {
              entityToken.field = {};
              Object.keys(entityToken.access).forEach((entityAccess) => {
                entityToken.field[ entityAccess ] = new CheckboxConfig({
                  align: 'left',
                  // patch: { path: `admin/security-profiles/${this.tab.securityProfile.id}/entities/add`, field: access, metadata: { access: 1, entity_fk: entity.id } },
                  bubble: true,
                  value: +entityToken.access[ entityAccess ],
                  disabled: this.core.entity.system || !entityToken[ entityAccess ] ? true : false,
                  metadata: {
                    app: app,
                    entity: entityToken,
                    access: entityAccess,
                  },
                });
                if( entityToken[ entityAccess ] ) appHasEntitiesAccess[ entityAccess ]++;
                if( entityToken.access[ entityAccess ] ) appEntitiesWithAccess[ entityAccess ]++;
                if( +entityToken.access[ entityAccess ] === 0 ){
                  if( entityAccess in app ){
                    app[ entityAccess ].all = false;
                  }
                }
              });
            });
            // if none of the entities are able to use an access just disable the all checkbox
            Object.keys(appHasEntitiesAccess).forEach((entityAccess) => {
              if( !appHasEntitiesAccess[ entityAccess ] && entityAccess in app ) app[ entityAccess ].disabled = true;
              if( app[ entityAccess ].all ) app[ entityAccess ].indeterminate = false;
              if( appEntitiesWithAccess[ entityAccess ] && !app[ entityAccess ].all ) app[ entityAccess ].indeterminate = true;
              if( !appEntitiesWithAccess[ entityAccess ] && !app[ entityAccess ].all ) app[ entityAccess ].indeterminate = false;
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


  /**
   * This component should have a specific purpose
   */
  ngOnInit(){
    super.ngOnInit();
  }


  checkAll(app, access): void{
    if( app && access in app ){
      let all = true, indeterminate = false;
      const entity_fks = [];
      const value = +app[ access ].all;
      if( app.entities.length ){
        all = +value === 1;
        app.entities.forEach((entity) => {
          if( !this.core.entity.system && this.core.access.can_update && entity[ access ] ){
            if( +entity.field[ access ].control.value !== value ){
              // entity.field[ access ].patch.running = true;
              entity.access[ access ] = value;
              entity.field[ access ].control.setValue(value);
              entity.field[ access ].message = '';
              entity.field[ access ].startPatch();
              entity_fks.push(entity.id);
            }
          }else{
            if( +entity.field[ access ].control.value !== value ){
              indeterminate = true;
              all = !value;
            }
          }
        });
        if( entity_fks.length ){
          const patch = { access: 1, entity_fk: entity_fks.join() };
          patch[ access ] = value;
          const method = patch[ access ] === 1 ? 'add' : 'remove';
          this.srv.request.doPatch(`${this.core.params.path}/${this.core.params.entityId}/entities/${method}`, patch, 1).subscribe(res => {
            app.entities.forEach((entity) => {
              entity.field[ access ]._patchSuccess();
            });
            setTimeout(() => {
              app[ access ].all = all;
              app[ access ].indeterminate = indeterminate;
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
              value: patch[ access ]
            };
            this.sessionChanges(sendEvent);
            if( this.log.repo.enabled('event', this.name) ) console.log(this.log.repo.message(`${this.name}:event`), this.log.repo.color('event'), sendEvent);
          }, err => {
            app.entities.forEach((entity) => {
              entity.patchFail(( err.error && err.error.message ) ? err.error.message : err.message);
            });
            setTimeout(() => {
              app[ access ].all = all;
              app[ access ].indeterminate = indeterminate;
            });
            this.dom.error = {
              code: ( err.error ? err.error.code : err.status ),
              message: ( err.error ? err.error.message : err.statusText )
            };
          });
        }else{
          setTimeout(() => {
            // app[ access ].all = all;
            app[ access ].indeterminate = true;
          });
        }
      }else{
        setTimeout(() => {
          app[ access ].all = false;
          app[ access ].indeterminate = false;
        });
      }
    }
  }


  setExpansionState(state?: string){
    if( state ){
      this.dom.state.expansion = state;
    }
    switch( this.dom.state.expansion ){
      case 'none':
        this.ui.access.forEach(function(app){
          app.expanded = false;
        });
        break;
      case 'compact':
        this.ui.access.forEach(function(app){
          app.expanded = app.can_read.indeterminate || app.can_update.indeterminate || app.can_create.indeterminate || app.can_delete.indeterminate ? true : false;
        });
        break;
      case 'full':
        this.ui.access.forEach(function(app){
          app.expanded = true;
        });
        break;
      default:
        break;

    }
  }


  handleInputEvents(event){
    if( event.type === 'field' ){
      if( this.log.repo.enabled() ) console.log(this.log.repo.message('PopEntityAccessComponent:event'), this.log.repo.color('event'), event);
      switch( event.name ){
        case 'onChange':
          const patch = { access: 1, entity_fk: event.config.metadata.entity.id };
          patch[ event.config.metadata.access ] = +event.config.control.value;
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
              ids: [ event.config.metadata.entity.id ],
              access: event.config.metadata.access,
              value: patch[ event.config.metadata.access ]
            };
            setTimeout(() => {
              this.sessionChanges(sendEvent);
            }, 0);
          }, err => {
            event.config.patchFail(( err.error && err.error.message ) ? err.error.message : err.message);
          });
          break;
        case patch:
          if( event.success ){
            this.checkAppAll(event.config.metadata.app, event.config.metadata.access, event.config.control.value);
          }
          break;
        default:
          break;
      }
    }
  }


  checkAppAll(app, access, val){
    val = +val;
    let indeterminate = false;
    let all = true;
    if( !val ){
      all = false;
      app.entities.some(entity => {
        if( entity.field[ access ].control.value ){
          indeterminate = true;
          return true;
        }
      });
    }else{
      app.entities.some(entity => {
        if( !entity.field[ access ].control.value ){
          all = false;
          indeterminate = true;
          return true;
        }
      });
    }
    setTimeout(() => {
      app[ access ].all = all;
      app[ access ].indeterminate = indeterminate;
    });
  }


  sessionChanges(event: PopBaseEventInterface){
    let appId;
    let storedPermissions;
    let storedApp;
    let storedEntity;
    if( event.type === 'permissions' && event.name === 'patch' && event.success && event.config && +event.config.params.id === +this.core.entity.id ){
      if( this.log.repo.enabled('event', this.name) ) console.log(`${this.name} made an access permissions patch session`, this.log.repo.color('event'), event);
      if( this.core.entity.metadata && this.core.entity.metadata.permissions ){
        storedPermissions = this.core.entity.metadata.permissions;
        appId = event.data.id;
        const appMap = ArrayMapSetter(storedPermissions, 'id');
        if( appId in appMap ){
          if( IsArray(storedPermissions[ appMap[ appId ] ].entities, true) ){
            storedApp = storedPermissions[ appMap[ appId ] ];
            const entityMap = ArrayMapSetter(storedApp.entities, 'id');
            if( IsArray(event.ids, true) ){
              event.ids.map((entityID: number) => { // the ids that need to be updated in session
                if( entityID in entityMap ){
                  storedEntity = storedApp.entities[ entityMap[ entityID ] ];
                  if( storedEntity.access && event.access in storedEntity.access ) storedEntity.access[ event.access ] = event.value;
                }
              });
            }
          }
        }
      }
      return true;
    }
  }


  toggleApp(app){
    app.expanded = !app.expanded;
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }


}
