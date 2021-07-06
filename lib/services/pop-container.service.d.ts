import { ViewContainerRef } from '@angular/core';
export declare class PopContainerService {
    createListeners: any[];
    destroyListeners: any[];
    onContainerCreated: (fn: any) => void;
    onContainerDestroyed: (fn: any) => void;
    registerContainer: (container: ViewContainerRef) => void;
    destroyContainer: (container: ViewContainerRef) => void;
}
