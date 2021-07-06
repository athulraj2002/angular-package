import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PopLog } from '../../../../../../pop-common.model';
import { SliderConfig } from '../../../../../base/pop-field-item/pop-slider/pop-slider.model';
export class FieldSliderParamComponent {
    constructor() {
        this.events = new EventEmitter();
        this.name = 'FieldSliderParamComponent';
    }
    /**
     * This component expects config to be a Label config
     */
    ngOnInit() {
        if (!this.config.value)
            this.config.value = this.config.defaultValue;
        this.param = new SliderConfig({
            name: this.config.name,
            label: this.config.label,
            column: this.config.column,
            value: this.config.value ? this.config.value : this.config.defaultValue,
            min: this.config.min ? this.config.min : 1,
            max: this.config.defaultValue,
            facade: this.config.facade,
            patch: this.config.patch,
            metadata: this.config.metadata ? this.config.metadata : {}
        });
        PopLog.init(this.name, `init`, this);
    }
}
FieldSliderParamComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-field-slider-param',
                template: `
    <lib-pop-slider (events)="events.emit($event);" [config]=param></lib-pop-slider>
  `
            },] }
];
FieldSliderParamComponent.propDecorators = {
    config: [{ type: Input }],
    events: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGQtc2xpZGVyLXBhcmFtLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci9wb3AtZW50aXR5LWZpZWxkLXNldHRpbmdzL3BvcC1lbnRpdHktZmllbGQtaXRlbS1wYXJhbXMvcGFyYW1zL2ZpZWxkLXNsaWRlci1wYXJhbS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFVLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMvRSxPQUFPLEVBQThDLE1BQU0sRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQ3hHLE9BQU8sRUFBRSxZQUFZLEVBQXlCLE1BQU0sZ0VBQWdFLENBQUM7QUFTckgsTUFBTSxPQUFPLHlCQUF5QjtJQU50QztRQVFZLFdBQU0sR0FBd0MsSUFBSSxZQUFZLEVBQXlCLENBQUM7UUFDM0YsU0FBSSxHQUFHLDJCQUEyQixDQUFDO0lBdUI1QyxDQUFDO0lBbEJDOztPQUVHO0lBQ0gsUUFBUTtRQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7WUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztRQUN0RSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksWUFBWSxDQUF3QjtZQUNuRCxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJO1lBQ3RCLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7WUFDeEIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTtZQUMxQixLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVk7WUFDdkUsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZO1lBQzdCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU07WUFDMUIsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztZQUN4QixRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO1NBQzNELENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQzs7O1lBL0JGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsd0JBQXdCO2dCQUNsQyxRQUFRLEVBQUU7O0dBRVQ7YUFDRjs7O3FCQUVFLEtBQUs7cUJBQ0wsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRXZlbnRFbWl0dGVyLCBJbnB1dCwgT25Jbml0LCBPdXRwdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZpZWxkUGFyYW1JbnRlcmZhY2UsIFBvcEJhc2VFdmVudEludGVyZmFjZSwgUG9wTG9nIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBTbGlkZXJDb25maWcsIFNsaWRlckNvbmZpZ0ludGVyZmFjZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXNsaWRlci9wb3Atc2xpZGVyLm1vZGVsJztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItZmllbGQtc2xpZGVyLXBhcmFtJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bGliLXBvcC1zbGlkZXIgKGV2ZW50cyk9XCJldmVudHMuZW1pdCgkZXZlbnQpO1wiIFtjb25maWddPXBhcmFtPjwvbGliLXBvcC1zbGlkZXI+XG4gIGAsXG59KVxuZXhwb3J0IGNsYXNzIEZpZWxkU2xpZGVyUGFyYW1Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICBASW5wdXQoKSBjb25maWc6IEZpZWxkUGFyYW1JbnRlcmZhY2U7XG4gIEBPdXRwdXQoKSBldmVudHM6IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+ID0gbmV3IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+KCk7XG4gIHB1YmxpYyBuYW1lID0gJ0ZpZWxkU2xpZGVyUGFyYW1Db21wb25lbnQnO1xuXG4gIHBhcmFtOiBTbGlkZXJDb25maWc7XG5cblxuICAvKipcbiAgICogVGhpcyBjb21wb25lbnQgZXhwZWN0cyBjb25maWcgdG8gYmUgYSBMYWJlbCBjb25maWdcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgaWYoICF0aGlzLmNvbmZpZy52YWx1ZSApIHRoaXMuY29uZmlnLnZhbHVlID0gdGhpcy5jb25maWcuZGVmYXVsdFZhbHVlO1xuICAgIHRoaXMucGFyYW0gPSBuZXcgU2xpZGVyQ29uZmlnKDxTbGlkZXJDb25maWdJbnRlcmZhY2U+e1xuICAgICAgbmFtZTogdGhpcy5jb25maWcubmFtZSxcbiAgICAgIGxhYmVsOiB0aGlzLmNvbmZpZy5sYWJlbCxcbiAgICAgIGNvbHVtbjogdGhpcy5jb25maWcuY29sdW1uLFxuICAgICAgdmFsdWU6IHRoaXMuY29uZmlnLnZhbHVlID8gdGhpcy5jb25maWcudmFsdWUgOiB0aGlzLmNvbmZpZy5kZWZhdWx0VmFsdWUsXG4gICAgICBtaW46IHRoaXMuY29uZmlnLm1pbiA/IHRoaXMuY29uZmlnLm1pbiA6IDEsXG4gICAgICBtYXg6IHRoaXMuY29uZmlnLmRlZmF1bHRWYWx1ZSxcbiAgICAgIGZhY2FkZTogdGhpcy5jb25maWcuZmFjYWRlLFxuICAgICAgcGF0Y2g6IHRoaXMuY29uZmlnLnBhdGNoLFxuICAgICAgbWV0YWRhdGE6IHRoaXMuY29uZmlnLm1ldGFkYXRhID8gdGhpcy5jb25maWcubWV0YWRhdGEgOiB7fVxuICAgIH0pO1xuICAgIFBvcExvZy5pbml0KHRoaXMubmFtZSwgYGluaXRgLCB0aGlzKTtcbiAgfVxufVxuIl19