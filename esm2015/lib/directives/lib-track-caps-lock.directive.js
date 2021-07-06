import { Directive, Output, EventEmitter, HostListener } from "@angular/core";
export class LibTrackCapsLockDirective {
    constructor() {
        this.capsLock = new EventEmitter();
    }
    onKeyDown(event) {
        const capsOn = event.getModifierState && event.getModifierState('CapsLock');
        this.capsLock.emit(capsOn);
    }
    onKeyUp(event) {
        const capsOn = event.getModifierState && event.getModifierState('CapsLock');
        this.capsLock.emit(capsOn);
    }
}
LibTrackCapsLockDirective.decorators = [
    { type: Directive, args: [{ selector: '[libTrackCapsLock]' },] }
];
LibTrackCapsLockDirective.propDecorators = {
    capsLock: [{ type: Output, args: ['capsLock',] }],
    onKeyDown: [{ type: HostListener, args: ['window:keydown', ['$event'],] }],
    onKeyUp: [{ type: HostListener, args: ['window:keyup', ['$event'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGliLXRyYWNrLWNhcHMtbG9jay5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvZGlyZWN0aXZlcy9saWItdHJhY2stY2Fwcy1sb2NrLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRzdFLE1BQU0sT0FBTyx5QkFBeUI7SUFEdEM7UUFFc0IsYUFBUSxHQUFHLElBQUksWUFBWSxFQUFXLENBQUM7SUFZN0QsQ0FBQztJQVRDLFNBQVMsQ0FBQyxLQUFvQjtRQUM1QixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsZ0JBQWdCLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCxPQUFPLENBQUMsS0FBb0I7UUFDMUIsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM3QixDQUFDOzs7WUFiRixTQUFTLFNBQUMsRUFBRSxRQUFRLEVBQUUsb0JBQW9CLEVBQUU7Ozt1QkFFMUMsTUFBTSxTQUFDLFVBQVU7d0JBRWpCLFlBQVksU0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFFBQVEsQ0FBQztzQkFLekMsWUFBWSxTQUFDLGNBQWMsRUFBRSxDQUFDLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIEhvc3RMaXN0ZW5lcn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcblxuQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW2xpYlRyYWNrQ2Fwc0xvY2tdJyB9KVxuZXhwb3J0IGNsYXNzIExpYlRyYWNrQ2Fwc0xvY2tEaXJlY3RpdmUge1xuICBAT3V0cHV0KCdjYXBzTG9jaycpIGNhcHNMb2NrID0gbmV3IEV2ZW50RW1pdHRlcjxCb29sZWFuPigpO1xuXG4gIEBIb3N0TGlzdGVuZXIoJ3dpbmRvdzprZXlkb3duJywgWyckZXZlbnQnXSlcbiAgb25LZXlEb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgY2Fwc09uID0gZXZlbnQuZ2V0TW9kaWZpZXJTdGF0ZSAmJiBldmVudC5nZXRNb2RpZmllclN0YXRlKCdDYXBzTG9jaycpO1xuICAgIHRoaXMuY2Fwc0xvY2suZW1pdChjYXBzT24pO1xuICB9XG4gIEBIb3N0TGlzdGVuZXIoJ3dpbmRvdzprZXl1cCcsIFsnJGV2ZW50J10pXG4gIG9uS2V5VXAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBjYXBzT24gPSBldmVudC5nZXRNb2RpZmllclN0YXRlICYmIGV2ZW50LmdldE1vZGlmaWVyU3RhdGUoJ0NhcHNMb2NrJyk7XG4gICAgdGhpcy5jYXBzTG9jay5lbWl0KGNhcHNPbik7XG4gIH1cbn1cbiJdfQ==