import { Directive, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';
export class LibOutsideClickDirective {
    constructor(_elementRef) {
        this._elementRef = _elementRef;
        this.clickOutside = new EventEmitter();
    }
    onMouseEnter(targetElement) {
        const clickedInside = this._elementRef.nativeElement.contains(targetElement);
        if (!clickedInside) {
            this.clickOutside.emit(null);
        }
    }
}
LibOutsideClickDirective.decorators = [
    { type: Directive, args: [{
                selector: '[libOutsideClick]'
            },] }
];
LibOutsideClickDirective.ctorParameters = () => [
    { type: ElementRef }
];
LibOutsideClickDirective.propDecorators = {
    clickOutside: [{ type: Output, args: ['clickOutside',] }],
    onMouseEnter: [{ type: HostListener, args: ['document:click', ['$event.target'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGliLW91dHNpZGUtY2xpY2suZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL2RpcmVjdGl2ZXMvbGliLW91dHNpZGUtY2xpY2suZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBUyxNQUFNLEVBQUUsWUFBWSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBS2pHLE1BQU0sT0FBTyx3QkFBd0I7SUFFbkMsWUFBb0IsV0FBdUI7UUFBdkIsZ0JBQVcsR0FBWCxXQUFXLENBQVk7UUFFbkIsaUJBQVksR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQUY5QixDQUFDO0lBSUcsWUFBWSxDQUFDLGFBQWE7UUFDM0UsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzdFLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDOUI7SUFDSCxDQUFDOzs7WUFkRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLG1CQUFtQjthQUM5Qjs7O1lBSm1CLFVBQVU7OzsyQkFTM0IsTUFBTSxTQUFDLGNBQWM7MkJBRXJCLFlBQVksU0FBQyxnQkFBZ0IsRUFBRSxDQUFDLGVBQWUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSG9zdExpc3RlbmVyLCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2xpYk91dHNpZGVDbGlja10nXG59KVxuZXhwb3J0IGNsYXNzIExpYk91dHNpZGVDbGlja0RpcmVjdGl2ZSB7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZikgeyB9XG5cbiAgQE91dHB1dCgnY2xpY2tPdXRzaWRlJykgY2xpY2tPdXRzaWRlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDpjbGljaycsIFsnJGV2ZW50LnRhcmdldCddKSBvbk1vdXNlRW50ZXIodGFyZ2V0RWxlbWVudCkge1xuICAgIGNvbnN0IGNsaWNrZWRJbnNpZGUgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuY29udGFpbnModGFyZ2V0RWxlbWVudCk7XG4gICAgaWYgKCFjbGlja2VkSW5zaWRlKSB7XG4gICAgICB0aGlzLmNsaWNrT3V0c2lkZS5lbWl0KG51bGwpO1xuICAgIH1cbiAgfVxuXG5cbn1cbiJdfQ==