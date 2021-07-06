/**
 * This directive was taken from this github repository
 * https://github.com/christianliebel/angular2-click-outside
 * found on stack over flow post
 * https://stackoverflow.com/questions/35712379/how-can-i-close-a-dropdown-on-click-outside
 *
 * Credit goes to github user christianliebel
 */
import { ElementRef, EventEmitter } from '@angular/core';
export declare class ClickOutsideDirective {
    private _elementRef;
    constructor(_elementRef: ElementRef);
    libClickOutside: EventEmitter<MouseEvent>;
    onClick(event: MouseEvent, targetElement: HTMLElement): void;
}
