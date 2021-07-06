import {
  CoreConfig,
  Dictionary,
  DynamicComponentInterface,
  EntityAccessInterface,
  EventCallback,
  PopBaseEventInterface,
  ServiceInjector
} from './pop-common.model';
import {Subscription} from 'rxjs';
import {PopContextMenuConfig} from './modules/base/pop-context-menu/pop-context-menu.model';
import {ComponentRef, ElementRef, EventEmitter, ViewContainerRef} from '@angular/core';
import {PopLogService} from './services/pop-log.service';
import {HttpErrorResponse} from '@angular/common/http';


export interface ServiceDomInterface {
  subscriber?: Dictionary<Subscription>;
  delay?: Dictionary<any>;
  interval?: Dictionary<any>;
  handler?: {
    core?: EventCallback,
    bubble?: EventCallback,
    [key: string]: EventCallback
  };
  session?: Dictionary<any>;
  state: DomStateInterface;
  setSubscriber?: (subscriptionKey: string, subscription: Subscription) => void;
  setTimeout?: (timeoutKey: string, callback, delay?: number) => void;
}


export function GetServiceDom(): ServiceDomInterface {
  return <ServiceDomInterface>{
    subscriber: {},
    delay: {},
    interval: {},
    handler: {},
    session: {},
    state: {},
  };
}

export function DestroyServiceDom(dom: ServiceDomInterface): void {
  if (typeof (dom.interval) === 'object') {
    Object.keys(dom.interval).map((name) => {
      if (dom.interval[name]) {
        clearInterval(dom.interval[name]);
      }
      if (dom.interval[name]) {
        clearInterval(dom.interval[name]);
      }
    });
  }

  if (typeof (dom.delay) === 'object') {
    Object.keys(dom.delay).map((name) => {
      if (dom.delay[name]) {
        clearTimeout(dom.delay[name]);
      }
      if (dom.delay[name]) {
        clearTimeout(dom.delay[name]);
      }
    });
  }
  if (typeof (dom.subscriber) === 'object') {
    Object.keys(dom.subscriber).map((name) => {
      if (dom.subscriber[name] && typeof dom.subscriber[name].unsubscribe === 'function') {
        dom.subscriber[name].unsubscribe();
      }
    });
  }
}


export interface DomStateInterface {
  authenticated?: boolean;
  archived?: boolean;
  closed?: boolean;
  loaded?: boolean;
  loader?: boolean;
  loading?: boolean;
  isDevMode?: boolean;
  open?: boolean;
  refreshing?: boolean;
  pending?: boolean;
  success?: boolean;
  validated?: boolean;
  showArchived?: boolean;
  hidden?: boolean;
  template?: number | boolean | string;
  visibility?: boolean;

  [key: string]: any;
}


export type Constructor<T> = new(...args: any[]) => T;


export interface ServiceContainerInterface {
  [key: string]: Dictionary<any>;
}


export function GetServiceAssetContainer(): ServiceAssetContainerInterface {
  return {
    map: {}
  };
}


export interface ServiceUiContainerInterface {
  state: DomStateInterface;
  active: Dictionary<any>;
  session: Dictionary<any>;
  asset: {
    map: Dictionary<any>
    [key: string]: any;
  };
}


export function GetServiceUiContainer(): ServiceUiContainerInterface {
  return {
    state: {loaded: false, loading: true, refreshing: false},
    active: {},
    session: {},
    asset: {
      map: <Dictionary<any>>{},
    }
  };
}


/************************************************************************************************
 *                                                                                              *
 *                                          Service                                             *
 *                                      ( Handles Services )                                    *
 *                                                                                              *
 ************************************************************************************************/


export function GetServiceContainer(): ServiceContainerInterface {
  return <ServiceContainerInterface>{};
}


export interface ServiceAssetContainerInterface {
  map?: Dictionary<any>;

  [key: string]: any;
}


/************************************************************************************************
 *                                                                                              *
 *                                          Base                                                *
 *                                          (  )                                                *
 *                                                                                              *
 ************************************************************************************************/

export interface HasName {
  name: string;
}


export interface HasDom {
  dom: ComponentDomInterface;
}


export interface HasPosition {
  position: number;
}


export interface HasCore {
  core: CoreConfig;
}


export interface HasTemplate {
  template: ComponentTemplateInterface;
}


export interface HasEvents {
  events: EventEmitter<PopBaseEventInterface>;
}


export interface HasTrait {
  trait: ComponentTraitContainerInterface;
}


export interface SetControl {
  setControl: () => void;
}


/************************************************************************************************
 *                                                                                              *
 *                                          UI                                                  *
 *                                         (  )                                                 *
 *                                                                                              *
 ************************************************************************************************/


export interface ComponentUiContainerInterface {
  error?: { code?: number, message: string };
  overhead: number;
  height: {
    content?: number
    default: number
    inner: number,
    min?: number,
    max?: number,
    outer: number,
    parent?: number
    split?: number
  };

  width: {
    outer?: number,
    inner?: number,
    min?: number,
    max?: number,
    parent?: number
  };
  state: DomStateInterface;
  active: Dictionary<any>;
  session: Dictionary<any>;
  resource: {
    map: Dictionary<any>
    [key: string]: any;
  };
  asset: {
    map?: Dictionary<any>
    [key: string]: any;
  };

  contextMenu: {
    config: PopContextMenuConfig;
    configure: CallableFunction;
  };

}


export function GetComponentUiContainer(): ComponentUiContainerInterface {
  return {
    error: {
      code: 0,
      message: ''
    },
    overhead: 0,
    height: {
      outer: null,
      inner: null,
      default: 0
    },
    width: {},
    state: <DomStateInterface>{},
    resource: {
      map: <Dictionary<any>>{},
    },
    active: {
      map: <Dictionary<any>>{},
    },
    session: <Dictionary<any>>{},
    asset: {
      map: <Dictionary<any>>{},
    },
    contextMenu: {
      config: <PopContextMenuConfig>undefined,
      configure: undefined,
    }
  };
}

export function AbstractUiMixin<T extends Constructor<{}>>(Base: T = (class {
} as any)): any {
  return class extends Base {
    ui: ComponentUiContainerInterface = GetComponentUiContainer();
  };
}


/************************************************************************************************
 *                                                                                              *
 *                                          Trait                                               *
 *                                           (  )                                               *
 *                                                                                              *
 ************************************************************************************************/

export interface ComponentTraitContainerInterface {
  bubble: boolean;

  [key: string]: boolean;
}


export function GetComponentTraitContainer(): ComponentTraitContainerInterface {
  return {
    bubble: false
  };
}


/************************************************************************************************
 *                                                                                              *
 *                                           Asset                                              *
 *                                           (  )                                               *
 *                                                                                              *
 ************************************************************************************************/

export interface ComponentAssetContainerInterface {
  map?: Dictionary<any>;

  [key: string]: any;
}


export function GetComponentAssetContainer(): ComponentAssetContainerInterface {
  return {
    map: {}
  };
}


/************************************************************************************************
 *                                                                                              *
 *                                          Dom                                                 *
 *                    ( Handles Subscriptions, Timeouts, Intervals, etc )                       *
 *                                                                                              *
 ************************************************************************************************/


export interface ComponentDomInterface {
  active: Dictionary<any>;
  access: EntityAccessInterface;

  contextMenu: {
    config: PopContextMenuConfig;
    configure: CallableFunction;
  };


  delay: Dictionary<any>;

  error?: { code?: number, message: string };

  interval: Dictionary<any>;

  handler: {
    core?: EventCallback,
    bubble?: EventCallback,
    [key: string]: EventCallback
  };

  height: {
    content?: number
    default: number
    inner: number,
    min?: number,
    max?: number,
    outer: number,
    parent?: number
    split?: number
  };

  overhead: number;

  width: {
    outer?: number,
    inner?: number,
    min?: number,
    max?: number,
    parent?: number
  };
  state: DomStateInterface;

  session: Dictionary<any>;

  subscriber: Dictionary<Subscription>;


  repo: any;
  injectRepo: () => void;
  loading: () => void;
  refreshing: () => void;
  _extend: () => Promise<boolean>;
  configure: () => Promise<boolean>;
  register: () => Promise<boolean>;
  proceed: () => Promise<boolean>;
  ready: () => void;
  find: (assetType: 'component' | 'field' | 'el', id: number | string) => any;
  focus: (querySelector: string, delay: number) => void;
  focusNextInput: (el: ElementRef) => void;
  setError: (err: HttpErrorResponse, modal: boolean) => void;
  setHeight: (parentHeight: number, overhead: number) => void;
  setHeightWithParent: (parentClassName: string, overhead?: number, defaultHeight?: number) => Promise<boolean>;
  setWithComponentInnerHeight: (component: string, componentId, overhead: number, defaultHeight: number) => Promise<number>;
  unload: () => Promise<boolean>;
  waitForParent: (el, className?: string, time?: number, counter?: number) => Promise<Element>;
  waitForParentHeight: (el: Element, time?: number, counter?: number) => Promise<number>;
  findParentElement: (el, className) => ElementRef;
  store: (key?: string) => void;
  setSubscriber: (subscriptionKey: string, subscription: Subscription) => void;
  setTimeout: (timeoutKey: string, callback, delay?: number) => void;
  destroy: () => void;

}


export function GetComponentDomContainer(): ComponentDomInterface {
  const dom = <ComponentDomInterface>{
    /**
     * Service will preserve session, state, etc and allow all components on the core to communicate and share assets`
     */

    active: <Dictionary<any>>{},

    error: {
      code: 0,
      message: ''
    },


    overhead: 0,
    height: {
      outer: null,
      inner: null,
      default: 0
    },
    width: {},
    state: <DomStateInterface>{},


    session: <Dictionary<any>>{},

    contextMenu: {
      config: <PopContextMenuConfig>undefined,
      configure: undefined,
    },

    repo: undefined,

    /**
     * Store all subscribers here
     */
    subscriber: {},

    /**
     * Store all time intervals here
     */
    interval: {},

    /**
     * Store all timeouts here
     */
    delay: {},

    handler: {},

  };
  return dom;
}


export function AbstractDomMixin<T extends Constructor<{}>>(Base: T = (class {
} as any)) {
  return class extends Base {
    dom: ComponentDomInterface = GetComponentDomContainer();
  };
}


export function DestroyComponentDom(dom: ComponentDomInterface): void {

  if (typeof (dom.interval) === 'object') {
    Object.keys(dom.interval).map((name) => {
      if (dom.interval[name]) {
        clearInterval(dom.interval[name]);
      }
      if (dom.interval[name]) {
        clearInterval(dom.interval[name]);
      }
    });
  }

  if (typeof (dom.delay) === 'object') {
    Object.keys(dom.delay).map((name) => {
      if (dom.delay[name]) {
        clearTimeout(dom.delay[name]);
      }
      if (dom.delay[name]) {
        clearTimeout(dom.delay[name]);
      }
    });
  }
  if (typeof (dom.subscriber) === 'object') {
    Object.keys(dom.subscriber).map((name) => {
      if (dom.subscriber[name] && typeof dom.subscriber[name].unsubscribe === 'function') {
        dom.subscriber[name].unsubscribe();
      }
    });
  }
}


/************************************************************************************************
 *                                                                                              *
 *                                          Log                                                 *
 *                                  ( Handles Logging )                                         *
 *                                                                                              *
 ************************************************************************************************/

export interface ComponentLogInterface {
  repo: {
    message: (message?: string) => string;
    color: (type?: string) => string;
    enabled: (type?: string, component?: string) => boolean;
    init: (componentName: string, message: string, data?: any, force?: boolean) => void;
    debug: (componentName: string, message: string, data?: any, force?: boolean) => void;
    cache: (componentName: string, message: string, set?: boolean, force?: boolean) => void;
    warn: (componentName: string, message: string, data?: any, force?: boolean) => void;
    info: (componentName: string, message: string, data?: any, force?: boolean) => void;
    theme: (componentName: string, message: string, data?: any, force?: boolean) => void;
    event: (componentName: string, message: string, event?: PopBaseEventInterface, force?: boolean) => void;
    error: (componentName: string, message: string, data?: any, force?: boolean) => void;
  };
  init: () => void;
  debug: (msg: string, data?: any) => void;
  error: (msg: string, error?: any) => void;
  warn: (msg: string, data?: any) => void;
  info: (msg: string, data?: any) => void;
  event: (msg: string, event: PopBaseEventInterface) => void;
  config: (msg: string, config?: any) => void;
  destroy: () => void;
}


/************************************************************************************************
 *                                                                                              *
 *                                          Template                                            *
 *                            ( Handles rendering Dynamic content )                             *
 *                                                                                              *
 ************************************************************************************************/


export interface ComponentTemplateInterface {
  container: ViewContainerRef;
  refs: ComponentRef<any>[];
  ref_events: Subscription[];
  attach: (container: string | ViewContainerRef) => void;
  render: (list: DynamicComponentInterface[], transfer?: string[], bypassTransfer?: boolean) => void;
  transfer: Dictionary<any>;
  clear: () => void;
  destroy: () => void;
}


export function GetComponentTemplateContainer(): ComponentTemplateInterface {
  const template = <ComponentTemplateInterface>{
    container: undefined,
    refs: [],
    ref_events: []
  };

  return template;
}

export function AbstractTemplateMixin<T extends Constructor<{}>>(Base: T = (class {
} as any)): any {
  return class extends Base implements HasTemplate {
    template: ComponentTemplateInterface = GetComponentTemplateContainer();
  };
}


export function DestroyComponentTemplate(template: ComponentTemplateInterface) {
  if (typeof template === 'object') {
    template.ref_events.map((subscription: Subscription) => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    });

    template.refs = template.refs.map(function (componentRef: ComponentRef<any>) {
      if (componentRef && typeof componentRef.destroy === 'function') {
        componentRef.destroy();
      }
      componentRef = null;
      return null;
    });

    if (template.container) template.container.clear();

    template = null;
  }
}




