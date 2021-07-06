import { OnDestroy } from '@angular/core';
import { PopLogService } from './pop-log.service';
import { Dictionary } from '../pop-common.model';
export declare class PopDomService implements OnDestroy {
    private id;
    private name;
    private asset;
    protected srv: {
        log: PopLogService;
    };
    ui: {
        active: Dictionary<any>;
        fields: Map<number | string, any>;
        map: Dictionary<any>;
        [key: string]: any;
    };
    position: {};
    map: {};
    components: Dictionary<any>;
    constructor();
    onRegister(component: any): void;
    onSession(dom: any, key?: string): void;
    getComponentHeight(component: string, componentId?: number): any;
    getComponentWidth(component: string, componentId?: number): any;
    getComponentSession(component: string, componentId?: number): any;
    onDetach(name: string, id: any): void;
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    private createDomSession;
    private applyDomKeys;
    private sessionDomKeys;
}
