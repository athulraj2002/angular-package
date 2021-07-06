import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TextareaConfig } from '../../../../../base/pop-field-item/pop-textarea/textarea-config.model';
import { IsDefined } from '../../../../../../pop-common-utility';
export class FieldTextareaParamComponent {
    constructor() {
        this.events = new EventEmitter();
    }
    ngOnInit() {
        this.param = new TextareaConfig({
            name: this.config.name,
            label: this.config.label,
            column: this.config.column,
            value: IsDefined(this.config.value) ? this.config.value : this.config.defaultValue,
            height: 70,
            facade: this.config.facade,
            patch: this.config.patch,
            metadata: this.config.metadata ? this.config.metadata : {}
        });
    }
}
FieldTextareaParamComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-field-textarea-param',
                template: `
    <lib-pop-textarea (events)="events.emit($event);" [config]=param></lib-pop-textarea>`
            },] }
];
FieldTextareaParamComponent.propDecorators = {
    config: [{ type: Input }],
    events: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGQtdGV4dGFyZWEtcGFyYW0uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktZmllbGQtZWRpdG9yL3BvcC1lbnRpdHktZmllbGQtc2V0dGluZ3MvcG9wLWVudGl0eS1maWVsZC1pdGVtLXBhcmFtcy9wYXJhbXMvZmllbGQtdGV4dGFyZWEtcGFyYW0uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBVSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFL0UsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHVFQUF1RSxDQUFDO0FBQ3ZHLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQVFqRSxNQUFNLE9BQU8sMkJBQTJCO0lBTHhDO1FBT1ksV0FBTSxHQUF3QyxJQUFJLFlBQVksRUFBeUIsQ0FBQztJQWlCcEcsQ0FBQztJQVpDLFFBQVE7UUFDTixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksY0FBYyxDQUFDO1lBQzlCLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUk7WUFDdEIsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztZQUN4QixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNO1lBQzFCLEtBQUssRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWTtZQUNsRixNQUFNLEVBQUUsRUFBRTtZQUNWLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU07WUFDMUIsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztZQUN4QixRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO1NBQzNELENBQUMsQ0FBQztJQUNMLENBQUM7OztZQXZCRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLDBCQUEwQjtnQkFDcEMsUUFBUSxFQUFFO3lGQUM2RTthQUN4Rjs7O3FCQUVFLEtBQUs7cUJBQ0wsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRXZlbnRFbWl0dGVyLCBJbnB1dCwgT25Jbml0LCBPdXRwdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZpZWxkUGFyYW1JbnRlcmZhY2UsIFBvcEJhc2VFdmVudEludGVyZmFjZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgVGV4dGFyZWFDb25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC10ZXh0YXJlYS90ZXh0YXJlYS1jb25maWcubW9kZWwnO1xuaW1wb3J0IHsgSXNEZWZpbmVkIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItZmllbGQtdGV4dGFyZWEtcGFyYW0nLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxsaWItcG9wLXRleHRhcmVhIChldmVudHMpPVwiZXZlbnRzLmVtaXQoJGV2ZW50KTtcIiBbY29uZmlnXT1wYXJhbT48L2xpYi1wb3AtdGV4dGFyZWE+YCxcbn0pXG5leHBvcnQgY2xhc3MgRmllbGRUZXh0YXJlYVBhcmFtQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgQElucHV0KCkgY29uZmlnOiBGaWVsZFBhcmFtSW50ZXJmYWNlO1xuICBAT3V0cHV0KCkgZXZlbnRzOiBFdmVudEVtaXR0ZXI8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPiA9IG5ldyBFdmVudEVtaXR0ZXI8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPigpO1xuXG4gIHBhcmFtOiBUZXh0YXJlYUNvbmZpZztcblxuXG4gIG5nT25Jbml0KCl7XG4gICAgdGhpcy5wYXJhbSA9IG5ldyBUZXh0YXJlYUNvbmZpZyh7XG4gICAgICBuYW1lOiB0aGlzLmNvbmZpZy5uYW1lLFxuICAgICAgbGFiZWw6IHRoaXMuY29uZmlnLmxhYmVsLFxuICAgICAgY29sdW1uOiB0aGlzLmNvbmZpZy5jb2x1bW4sXG4gICAgICB2YWx1ZTogSXNEZWZpbmVkKHRoaXMuY29uZmlnLnZhbHVlKSA/IHRoaXMuY29uZmlnLnZhbHVlIDogdGhpcy5jb25maWcuZGVmYXVsdFZhbHVlLFxuICAgICAgaGVpZ2h0OiA3MCxcbiAgICAgIGZhY2FkZTogdGhpcy5jb25maWcuZmFjYWRlLFxuICAgICAgcGF0Y2g6IHRoaXMuY29uZmlnLnBhdGNoLFxuICAgICAgbWV0YWRhdGE6IHRoaXMuY29uZmlnLm1ldGFkYXRhID8gdGhpcy5jb25maWcubWV0YWRhdGEgOiB7fVxuICAgIH0pO1xuICB9XG59XG4iXX0=