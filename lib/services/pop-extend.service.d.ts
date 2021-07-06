import { OnDestroy } from '@angular/core';
export declare class PopExtendService implements OnDestroy {
    protected dom: import("../pop-common-dom.models").ServiceDomInterface;
    protected id: number | string;
    protected name: any;
    protected asset: any;
    constructor();
    ngOnDestroy(): void;
}
