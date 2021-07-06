import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InputConfig } from '../../../../../base/pop-field-item/pop-input/input-config.model';
import { Validators } from '@angular/forms';
export class FieldInputParamComponent {
    constructor() {
        this.events = new EventEmitter();
    }
    ngOnInit() {
        const validators = [];
        if (this.config.required)
            validators.push(Validators.required);
        this.param = new InputConfig({
            name: this.config.name,
            label: this.config.label,
            value: this.config.value ? this.config.value : this.config.defaultValue,
            readonly: this.config.readonly,
            validators: validators,
            patch: this.config.patch,
            facade: this.config.facade,
            metadata: this.config.metadata ? this.config.metadata : {}
        });
    }
}
FieldInputParamComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-field-input-param',
                template: `
    <lib-pop-input (events)="events.emit($event);" [config]=param></lib-pop-input>`
            },] }
];
FieldInputParamComponent.ctorParameters = () => [];
FieldInputParamComponent.propDecorators = {
    config: [{ type: Input }],
    events: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGQtaW5wdXQtcGFyYW0uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktZmllbGQtZWRpdG9yL3BvcC1lbnRpdHktZmllbGQtc2V0dGluZ3MvcG9wLWVudGl0eS1maWVsZC1pdGVtLXBhcmFtcy9wYXJhbXMvZmllbGQtaW5wdXQtcGFyYW0uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBVSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFL0UsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGlFQUFpRSxDQUFDO0FBQzlGLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQVE1QyxNQUFNLE9BQU8sd0JBQXdCO0lBT25DO1FBTFUsV0FBTSxHQUF3QyxJQUFJLFlBQVksRUFBeUIsQ0FBQztJQU1sRyxDQUFDO0lBR0QsUUFBUTtRQUNOLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUN0QixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUTtZQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxXQUFXLENBQUM7WUFDM0IsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSTtZQUN0QixLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO1lBQ3hCLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWTtZQUN2RSxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRO1lBQzlCLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7WUFDeEIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTtZQUMxQixRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO1NBQzNELENBQUMsQ0FBQztJQUNMLENBQUM7OztZQTdCRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHVCQUF1QjtnQkFDakMsUUFBUSxFQUFFO21GQUN1RTthQUNsRjs7OztxQkFFRSxLQUFLO3FCQUNMLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE9uSW5pdCwgT3V0cHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGaWVsZFBhcmFtSW50ZXJmYWNlLCBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IElucHV0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtaW5wdXQvaW5wdXQtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IFZhbGlkYXRvcnMgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLWZpZWxkLWlucHV0LXBhcmFtJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bGliLXBvcC1pbnB1dCAoZXZlbnRzKT1cImV2ZW50cy5lbWl0KCRldmVudCk7XCIgW2NvbmZpZ109cGFyYW0+PC9saWItcG9wLWlucHV0PmAsXG59KVxuZXhwb3J0IGNsYXNzIEZpZWxkSW5wdXRQYXJhbUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIEBJbnB1dCgpIGNvbmZpZzogRmllbGRQYXJhbUludGVyZmFjZTtcbiAgQE91dHB1dCgpIGV2ZW50czogRXZlbnRFbWl0dGVyPFBvcEJhc2VFdmVudEludGVyZmFjZT4gPSBuZXcgRXZlbnRFbWl0dGVyPFBvcEJhc2VFdmVudEludGVyZmFjZT4oKTtcblxuICBwYXJhbTogSW5wdXRDb25maWc7XG5cblxuICBjb25zdHJ1Y3Rvcigpe1xuICB9XG5cblxuICBuZ09uSW5pdCgpe1xuICAgIGNvbnN0IHZhbGlkYXRvcnMgPSBbXTtcbiAgICBpZiggdGhpcy5jb25maWcucmVxdWlyZWQgKSB2YWxpZGF0b3JzLnB1c2goVmFsaWRhdG9ycy5yZXF1aXJlZCk7XG4gICAgdGhpcy5wYXJhbSA9IG5ldyBJbnB1dENvbmZpZyh7XG4gICAgICBuYW1lOiB0aGlzLmNvbmZpZy5uYW1lLFxuICAgICAgbGFiZWw6IHRoaXMuY29uZmlnLmxhYmVsLFxuICAgICAgdmFsdWU6IHRoaXMuY29uZmlnLnZhbHVlID8gdGhpcy5jb25maWcudmFsdWUgOiB0aGlzLmNvbmZpZy5kZWZhdWx0VmFsdWUsXG4gICAgICByZWFkb25seTogdGhpcy5jb25maWcucmVhZG9ubHksXG4gICAgICB2YWxpZGF0b3JzOiB2YWxpZGF0b3JzLFxuICAgICAgcGF0Y2g6IHRoaXMuY29uZmlnLnBhdGNoLFxuICAgICAgZmFjYWRlOiB0aGlzLmNvbmZpZy5mYWNhZGUsXG4gICAgICBtZXRhZGF0YTogdGhpcy5jb25maWcubWV0YWRhdGEgPyB0aGlzLmNvbmZpZy5tZXRhZGF0YSA6IHt9XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==