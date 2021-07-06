import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SwitchConfig } from '../../../../../base/pop-field-item/pop-switch/switch-config.model';
import { IsDefined } from '../../../../../../pop-common-utility';
export class FieldSwitchParamComponent {
    constructor() {
        this.events = new EventEmitter();
    }
    ngOnInit() {
        this.param = new SwitchConfig({
            name: this.config.name,
            label: this.config.label,
            labelPosition: 'after',
            value: IsDefined(this.config.value) ? this.config.value : this.config.defaultValue,
            patch: this.config.patch,
            facade: this.config.facade,
            metadata: this.config.metadata ? this.config.metadata : {}
        });
    }
}
FieldSwitchParamComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-field-switch-param',
                template: `
    <lib-pop-switch (events)="events.emit($event);" [config]=param></lib-pop-switch>`
            },] }
];
FieldSwitchParamComponent.propDecorators = {
    config: [{ type: Input }],
    events: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGQtc3dpdGNoLXBhcmFtLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci9wb3AtZW50aXR5LWZpZWxkLXNldHRpbmdzL3BvcC1lbnRpdHktZmllbGQtaXRlbS1wYXJhbXMvcGFyYW1zL2ZpZWxkLXN3aXRjaC1wYXJhbS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFVLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUvRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUVBQW1FLENBQUM7QUFDakcsT0FBTyxFQUFFLFNBQVMsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBUWhFLE1BQU0sT0FBTyx5QkFBeUI7SUFMdEM7UUFPWSxXQUFNLEdBQXdDLElBQUksWUFBWSxFQUF5QixDQUFDO0lBZ0JwRyxDQUFDO0lBWEMsUUFBUTtRQUNOLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxZQUFZLENBQUM7WUFDNUIsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSTtZQUN0QixLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO1lBQ3hCLGFBQWEsRUFBRSxPQUFPO1lBQ3RCLEtBQUssRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWTtZQUNsRixLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO1lBQ3hCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU07WUFDMUIsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRTtTQUMzRCxDQUFDLENBQUM7SUFDTCxDQUFDOzs7WUF0QkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSx3QkFBd0I7Z0JBQ2xDLFFBQVEsRUFBRTtxRkFDeUU7YUFDcEY7OztxQkFFRSxLQUFLO3FCQUNMLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE9uSW5pdCwgT3V0cHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGaWVsZFBhcmFtSW50ZXJmYWNlLCBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFN3aXRjaENvbmZpZyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXN3aXRjaC9zd2l0Y2gtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IElzRGVmaW5lZH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItZmllbGQtc3dpdGNoLXBhcmFtJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bGliLXBvcC1zd2l0Y2ggKGV2ZW50cyk9XCJldmVudHMuZW1pdCgkZXZlbnQpO1wiIFtjb25maWddPXBhcmFtPjwvbGliLXBvcC1zd2l0Y2g+YCxcbn0pXG5leHBvcnQgY2xhc3MgRmllbGRTd2l0Y2hQYXJhbUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIEBJbnB1dCgpIGNvbmZpZzogRmllbGRQYXJhbUludGVyZmFjZTtcbiAgQE91dHB1dCgpIGV2ZW50czogRXZlbnRFbWl0dGVyPFBvcEJhc2VFdmVudEludGVyZmFjZT4gPSBuZXcgRXZlbnRFbWl0dGVyPFBvcEJhc2VFdmVudEludGVyZmFjZT4oKTtcblxuICBwYXJhbTogU3dpdGNoQ29uZmlnO1xuXG5cbiAgbmdPbkluaXQoKXtcbiAgICB0aGlzLnBhcmFtID0gbmV3IFN3aXRjaENvbmZpZyh7XG4gICAgICBuYW1lOiB0aGlzLmNvbmZpZy5uYW1lLFxuICAgICAgbGFiZWw6IHRoaXMuY29uZmlnLmxhYmVsLFxuICAgICAgbGFiZWxQb3NpdGlvbjogJ2FmdGVyJyxcbiAgICAgIHZhbHVlOiBJc0RlZmluZWQodGhpcy5jb25maWcudmFsdWUpID8gdGhpcy5jb25maWcudmFsdWUgOiB0aGlzLmNvbmZpZy5kZWZhdWx0VmFsdWUsXG4gICAgICBwYXRjaDogdGhpcy5jb25maWcucGF0Y2gsXG4gICAgICBmYWNhZGU6IHRoaXMuY29uZmlnLmZhY2FkZSxcbiAgICAgIG1ldGFkYXRhOiB0aGlzLmNvbmZpZy5tZXRhZGF0YSA/IHRoaXMuY29uZmlnLm1ldGFkYXRhIDoge31cbiAgICB9KTtcbiAgfVxufVxuIl19