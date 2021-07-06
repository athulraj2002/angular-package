import { ElementRef, EventEmitter } from '@angular/core';
export declare class LibOutsideClickDirective {
    private _elementRef;
    constructor(_elementRef: ElementRef);
    clickOutside: EventEmitter<any>;
    onMouseEnter(targetElement: any): void;
}
