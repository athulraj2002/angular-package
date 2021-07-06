import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { TextareaConfig } from '../../../../base/pop-field-item/pop-textarea/textarea-config.model';
export class FieldTextareaSettingComponent {
    constructor(changeDetectorRef) {
        this.changeDetectorRef = changeDetectorRef;
        this.events = new EventEmitter();
    }
    ngOnInit() {
        this.param = new TextareaConfig({
            label: this.config.label,
            name: this.config.name,
            value: this.config.value ? this.config.value : this.config.default,
            height: 70,
        });
    }
}
FieldTextareaSettingComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-field-textarea-setting',
                template: `<lib-pop-textarea (events)="events.emit($event);" [config]=param></lib-pop-textarea>`
            },] }
];
FieldTextareaSettingComponent.ctorParameters = () => [
    { type: ChangeDetectorRef }
];
FieldTextareaSettingComponent.propDecorators = {
    config: [{ type: Input }],
    events: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGQtdGV4dGFyZWEtc2V0dGluZy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1zY2hlbWUvcG9wLWVudGl0eS1hc3NldC1maWVsZC1tb2RhbC9wYXJhbXMvZmllbGQtdGV4dGFyZWEtc2V0dGluZy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFVLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNsRyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sb0VBQW9FLENBQUM7QUFRcEcsTUFBTSxPQUFPLDZCQUE2QjtJQVF4QyxZQUFvQixpQkFBb0M7UUFBcEMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtRQUw5QyxXQUFNLEdBQXdDLElBQUksWUFBWSxFQUF5QixDQUFDO0lBTWxHLENBQUM7SUFHRCxRQUFRO1FBQ04sSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLGNBQWMsQ0FBQztZQUM5QixLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO1lBQ3hCLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUk7WUFDdEIsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPO1lBQ2xFLE1BQU0sRUFBRSxFQUFFO1NBQ1gsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7O1lBdkJGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsNEJBQTRCO2dCQUN0QyxRQUFRLEVBQUUsc0ZBQXNGO2FBQ2pHOzs7WUFSUSxpQkFBaUI7OztxQkFXdkIsS0FBSztxQkFDTCxNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgRXZlbnRFbWl0dGVyLCBJbnB1dCwgT25Jbml0LCBPdXRwdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFRleHRhcmVhQ29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtdGV4dGFyZWEvdGV4dGFyZWEtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IEZpZWxkU2V0dGluZ0ludGVyZmFjZSB9IGZyb20gJy4uLy4uL3BvcC1lbnRpdHktc2NoZW1lLm1vZGVsJztcbmltcG9ydCB7IFBvcEJhc2VFdmVudEludGVyZmFjZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItZmllbGQtdGV4dGFyZWEtc2V0dGluZycsXG4gIHRlbXBsYXRlOiBgPGxpYi1wb3AtdGV4dGFyZWEgKGV2ZW50cyk9XCJldmVudHMuZW1pdCgkZXZlbnQpO1wiIFtjb25maWddPXBhcmFtPjwvbGliLXBvcC10ZXh0YXJlYT5gLFxufSlcbmV4cG9ydCBjbGFzcyBGaWVsZFRleHRhcmVhU2V0dGluZ0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG5cbiAgQElucHV0KCkgY29uZmlnOiBGaWVsZFNldHRpbmdJbnRlcmZhY2U7XG4gIEBPdXRwdXQoKSBldmVudHM6IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+ID0gbmV3IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+KCk7XG5cbiAgcGFyYW06IFRleHRhcmVhQ29uZmlnO1xuXG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpe1xuICB9XG5cblxuICBuZ09uSW5pdCgpe1xuICAgIHRoaXMucGFyYW0gPSBuZXcgVGV4dGFyZWFDb25maWcoe1xuICAgICAgbGFiZWw6IHRoaXMuY29uZmlnLmxhYmVsLFxuICAgICAgbmFtZTogdGhpcy5jb25maWcubmFtZSxcbiAgICAgIHZhbHVlOiB0aGlzLmNvbmZpZy52YWx1ZSA/IHRoaXMuY29uZmlnLnZhbHVlIDogdGhpcy5jb25maWcuZGVmYXVsdCxcbiAgICAgIGhlaWdodDogNzAsXG4gICAgfSk7XG4gIH1cblxufVxuIl19