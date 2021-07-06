import {Injectable, OnDestroy} from '@angular/core';
import {PopLogService} from './pop-log.service';
import {IsObject, PopUid} from '../pop-common-utility';
import {
  ComponentDomInterface,
} from '../pop-common-dom.models';
import {Dictionary} from '../pop-common.model';


@Injectable({
  providedIn: 'root'
})
export class PopDomService implements OnDestroy {
  private id: number | string = PopUid();

  private name = 'PopDomService';

  private asset: {
    sessionKeys: Dictionary<number>
    map: Dictionary<any>
  } = {
    sessionKeys: {height: 1, width: 1, state: 1, active: 1, session: 1},
    map: {}
  };

  protected srv: {
    log: PopLogService,
  };

  public ui: {
    active: Dictionary<any>;
    fields: Map<number | string, any>,
    map: Dictionary<any>
    [key: string]: any;
  } = {
    active: {},
    fields: new Map(),
    map: {}
  };
  public position = {};
  public map = {};
  public components: Dictionary<any> = {};


  constructor() {
  }


  onRegister(component: any) {
    if (component.name && typeof component.id !== 'undefined' && component.dom) {
      if (this.components[component.name] && this.components[component.name][component.id]) {
        this.applyDomKeys(component);
      } else {
        this.createDomSession(component);
      }
    }
  }


  onSession(dom: any, key: string = null) {
    if (dom.name && dom.id) {
      this.sessionDomKeys(dom, key);
    }
  }


  getComponentHeight(component: string, componentId: number = 1) {
    return this.components[component] && this.components[component][componentId] && IsObject(this.components[component][componentId].height, true) ? this.components[component][componentId].height : null;
  }


  getComponentWidth(component: string, componentId: number = 1) {
    return this.components[component] && this.components[component][componentId] && IsObject(this.components[component][componentId].width, true) ? this.components[component][componentId].width : null;
  }


  getComponentSession(component: string, componentId: number = 1) {
    return this.components[component] && this.components[component][componentId] && IsObject(this.components[component][componentId].onSession, true) ? this.components[component][componentId].onSession : null;
  }


  onDetach(name: string, id) {
    if (name && id) {
      if (this.components[name] && this.components[name][id]) {
        delete this.components[name][id];
      }
    }
  }


  ngOnDestroy() {
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  private createDomSession(component: { id: string | number, name: 'string', dom: ComponentDomInterface }) {
    if (component.name && typeof component.id !== 'undefined') {
      if (!this.components[component.name]) this.components[component.name] = {};
      if (!this.components[component.name][component.id]) this.components[component.name][component.id] = {};
      // if( dom.emitter instanceof EventEmitter ) this.components[ dom.name ][ dom.entityId ].emitter = dom.emitter;
      this.sessionDomKeys(component);
    }
  }


  private applyDomKeys(component: { id: string | number, name: 'string', dom: ComponentDomInterface }) {
    if (this.components[component.name] && this.components[component.name][component.id]) {
      Object.keys(this.components[component.name][component.id]).map((key) => {
        if (key && this.asset.sessionKeys[key]) {
          component.dom[key] = this.components[component.name][component.id][key];
        }
      });
    }
  }


  private sessionDomKeys(component: { id: string | number, name: 'string', dom: ComponentDomInterface }, key: string = null) {
    if (this.components[component.name] && this.components[component.name][component.id]) {
      if (key && key in this.asset.sessionKeys) {
        if (IsObject(component.dom[key], true)) {
          this.components[component.name][component.id][key] = component.dom[key];
        }

      } else {
        Object.keys(this.asset.sessionKeys).map((sessionKey: string) => {
          if (IsObject(component.dom[sessionKey], true)) {
            this.components[component.name][component.id][sessionKey] = component.dom[sessionKey];
          }
        });
      }
    }
  }
}
