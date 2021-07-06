/**
 * This directive was taken from this github repository
 * https://github.com/christianliebel/angular2-click-outside
 * found on stack over flow post
 * https://stackoverflow.com/questions/35712379/how-can-i-close-a-dropdown-on-click-outside
 *
 * Credit goes to github user christianliebel
 */
import { Directive, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';
export class ClickOutsideDirective {
    constructor(_elementRef) {
        this._elementRef = _elementRef;
        this.libClickOutside = new EventEmitter();
    }
    onClick(event, targetElement) {
        if (!targetElement) {
            return;
        }
        const clickedInside = this._elementRef.nativeElement.contains(targetElement);
        if (!clickedInside) {
            this.libClickOutside.emit(event);
        }
    }
}
ClickOutsideDirective.decorators = [
    { type: Directive, args: [{
                selector: '[libClickOutside]'
            },] }
];
ClickOutsideDirective.ctorParameters = () => [
    { type: ElementRef }
];
ClickOutsideDirective.propDecorators = {
    libClickOutside: [{ type: Output }],
    onClick: [{ type: HostListener, args: ['document:click', ['$event', '$event.target'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpY2stb3V0c2lkZS1kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC1maWVsZC1pdGVtL2NsaWNrLW91dHNpZGUtZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0dBT0c7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUt4RixNQUFNLE9BQU8scUJBQXFCO0lBQzlCLFlBQW9CLFdBQXVCO1FBQXZCLGdCQUFXLEdBQVgsV0FBVyxDQUFZO1FBSXBDLG9CQUFlLEdBQUcsSUFBSSxZQUFZLEVBQWMsQ0FBQztJQUh4RCxDQUFDO0lBTU0sT0FBTyxDQUFDLEtBQWlCLEVBQUUsYUFBMEI7UUFDeEQsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNoQixPQUFPO1NBQ1Y7UUFFRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNoQixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNwQztJQUNMLENBQUM7OztZQXBCSixTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLG1CQUFtQjthQUNoQzs7O1lBSmtCLFVBQVU7Ozs4QkFTeEIsTUFBTTtzQkFHTixZQUFZLFNBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsZUFBZSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3YXMgdGFrZW4gZnJvbSB0aGlzIGdpdGh1YiByZXBvc2l0b3J5XG4gKiBodHRwczovL2dpdGh1Yi5jb20vY2hyaXN0aWFubGllYmVsL2FuZ3VsYXIyLWNsaWNrLW91dHNpZGVcbiAqIGZvdW5kIG9uIHN0YWNrIG92ZXIgZmxvdyBwb3N0IFxuICogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzU3MTIzNzkvaG93LWNhbi1pLWNsb3NlLWEtZHJvcGRvd24tb24tY2xpY2stb3V0c2lkZVxuICogXG4gKiBDcmVkaXQgZ29lcyB0byBnaXRodWIgdXNlciBjaHJpc3RpYW5saWViZWxcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRWxlbWVudFJlZiwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIEhvc3RMaXN0ZW5lcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW2xpYkNsaWNrT3V0c2lkZV0nXG59KVxuZXhwb3J0IGNsYXNzIENsaWNrT3V0c2lkZURpcmVjdGl2ZSB7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZikge1xuICAgIH1cblxuICAgIEBPdXRwdXQoKVxuICAgIHB1YmxpYyBsaWJDbGlja091dHNpZGUgPSBuZXcgRXZlbnRFbWl0dGVyPE1vdXNlRXZlbnQ+KCk7XG5cbiAgICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDpjbGljaycsIFsnJGV2ZW50JywgJyRldmVudC50YXJnZXQnXSlcbiAgICBwdWJsaWMgb25DbGljayhldmVudDogTW91c2VFdmVudCwgdGFyZ2V0RWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0YXJnZXRFbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGlja2VkSW5zaWRlID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNvbnRhaW5zKHRhcmdldEVsZW1lbnQpO1xuICAgICAgICBpZiAoIWNsaWNrZWRJbnNpZGUpIHtcbiAgICAgICAgICAgIHRoaXMubGliQ2xpY2tPdXRzaWRlLmVtaXQoZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19