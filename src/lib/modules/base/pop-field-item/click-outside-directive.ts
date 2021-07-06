/**
 * This directive was taken from this github repository
 * https://github.com/christianliebel/angular2-click-outside
 * found on stack over flow post 
 * https://stackoverflow.com/questions/35712379/how-can-i-close-a-dropdown-on-click-outside
 * 
 * Credit goes to github user christianliebel
 */

import {Directive, ElementRef, Output, EventEmitter, HostListener} from '@angular/core';

@Directive({
    selector: '[libClickOutside]'
})
export class ClickOutsideDirective {
    constructor(private _elementRef: ElementRef) {
    }

    @Output()
    public libClickOutside = new EventEmitter<MouseEvent>();

    @HostListener('document:click', ['$event', '$event.target'])
    public onClick(event: MouseEvent, targetElement: HTMLElement): void {
        if (!targetElement) {
            return;
        }

        const clickedInside = this._elementRef.nativeElement.contains(targetElement);
        if (!clickedInside) {
            this.libClickOutside.emit(event);
        }
    }
}
