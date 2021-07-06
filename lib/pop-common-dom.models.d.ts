import { CoreConfig, Dictionary, DynamicComponentInterface, EntityAccessInterface, EventCallback, PopBaseEventInterface } from './pop-common.model';
import { Subscription } from 'rxjs';
import { PopContextMenuConfig } from './modules/base/pop-context-menu/pop-context-menu.model';
import { ComponentRef, ElementRef, EventEmitter, ViewContainerRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
export interface ServiceDomInterface {
    subscriber?: Dictionary<Subscription>;
    delay?: Dictionary<any>;
    interval?: Dictionary<any>;
    handler?: {
        core?: EventCallback;
        bubble?: EventCallback;
        [key: string]: EventCallback;
    };
    session?: Dictionary<any>;
    state: DomStateInterface;
    setSubscriber?: (subscriptionKey: string, subscription: Subscription) => void;
    setTimeout?: (timeoutKey: string, callback: any, delay?: number) => void;
}
export declare function GetServiceDom(): ServiceDomInterface;
export declare function DestroyServiceDom(dom: ServiceDomInterface): void;
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
export declare type Constructor<T> = new (...args: any[]) => T;
export interface ServiceContainerInterface {
    [key: string]: Dictionary<any>;
}
export declare function GetServiceAssetContainer(): ServiceAssetContainerInterface;
export interface ServiceUiContainerInterface {
    state: DomStateInterface;
    active: Dictionary<any>;
    session: Dictionary<any>;
    asset: {
        map: Dictionary<any>;
        [key: string]: any;
    };
}
export declare function GetServiceUiContainer(): ServiceUiContainerInterface;
/************************************************************************************************
 *                                                                                              *
 *                                          Service                                             *
 *                                      ( Handles Services )                                    *
 *                                                                                              *
 ************************************************************************************************/
export declare function GetServiceContainer(): ServiceContainerInterface;
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
    error?: {
        code?: number;
        message: string;
    };
    overhead: number;
    height: {
        content?: number;
        default: number;
        inner: number;
        min?: number;
        max?: number;
        outer: number;
        parent?: number;
        split?: number;
    };
    width: {
        outer?: number;
        inner?: number;
        min?: number;
        max?: number;
        parent?: number;
    };
    state: DomStateInterface;
    active: Dictionary<any>;
    session: Dictionary<any>;
    resource: {
        map: Dictionary<any>;
        [key: string]: any;
    };
    asset: {
        map?: Dictionary<any>;
        [key: string]: any;
    };
    contextMenu: {
        config: PopContextMenuConfig;
        configure: CallableFunction;
    };
}
export declare function GetComponentUiContainer(): ComponentUiContainerInterface;
export declare function AbstractUiMixin<T extends Constructor<{}>>(Base?: T): any;
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
export declare function GetComponentTraitContainer(): ComponentTraitContainerInterface;
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
export declare function GetComponentAssetContainer(): ComponentAssetContainerInterface;
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
    error?: {
        code?: number;
        message: string;
    };
    interval: Dictionary<any>;
    handler: {
        core?: EventCallback;
        bubble?: EventCallback;
        [key: string]: EventCallback;
    };
    height: {
        content?: number;
        default: number;
        inner: number;
        min?: number;
        max?: number;
        outer: number;
        parent?: number;
        split?: number;
    };
    overhead: number;
    width: {
        outer?: number;
        inner?: number;
        min?: number;
        max?: number;
        parent?: number;
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
    setWithComponentInnerHeight: (component: string, componentId: any, overhead: number, defaultHeight: number) => Promise<number>;
    unload: () => Promise<boolean>;
    waitForParent: (el: any, className?: string, time?: number, counter?: number) => Promise<Element>;
    waitForParentHeight: (el: Element, time?: number, counter?: number) => Promise<number>;
    findParentElement: (el: any, className: any) => ElementRef;
    store: (key?: string) => void;
    setSubscriber: (subscriptionKey: string, subscription: Subscription) => void;
    setTimeout: (timeoutKey: string, callback: any, delay?: number) => void;
    destroy: () => void;
}
export declare function GetComponentDomContainer(): ComponentDomInterface;
export declare function AbstractDomMixin<T extends Constructor<{}>>(Base?: T): {
    new (...args: any[]): {
        dom: ComponentDomInterface;
    };
} & T;
export declare function DestroyComponentDom(dom: ComponentDomInterface): void;
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
export declare function GetComponentTemplateContainer(): ComponentTemplateInterface;
export declare function AbstractTemplateMixin<T extends Constructor<{}>>(Base?: T): any;
export declare function DestroyComponentTemplate(template: ComponentTemplateInterface): void;
