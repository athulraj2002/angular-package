import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NumberConfig } from '../../../../../base/pop-field-item/pop-number/number-config.model';
import { IsDefined } from '../../../../../../pop-common-utility';
export class FieldNumberParamComponent {
    constructor() {
        this.events = new EventEmitter();
    }
    ngOnInit() {
        const defaultValue = IsDefined(this.config.default_value) ? +this.config.default_value : 255;
        const configInterface = {
            label: this.config.label,
            name: this.config.name,
            value: this.config.value ? this.config.value : this.config.default_value,
            patch: this.config.patch,
            facade: this.config.facade,
            min: 1,
            max: defaultValue,
            metadata: this.config.metadata ? this.config.metadata : {}
        };
        if (this.config.name === 'maxlength') {
            configInterface.helpText = `Limit: ${defaultValue}`;
        }
        this.param = new NumberConfig(configInterface);
    }
    ngOnDestroy() {
    }
}
FieldNumberParamComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-field-number-param',
                template: `
    <lib-pop-number (events)="events.emit($event);" [config]=param></lib-pop-number>`
            },] }
];
FieldNumberParamComponent.ctorParameters = () => [];
FieldNumberParamComponent.propDecorators = {
    config: [{ type: Input }],
    events: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGQtbnVtYmVyLXBhcmFtLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci9wb3AtZW50aXR5LWZpZWxkLXNldHRpbmdzL3BvcC1lbnRpdHktZmllbGQtaXRlbS1wYXJhbXMvcGFyYW1zL2ZpZWxkLW51bWJlci1wYXJhbS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFxQixNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFMUYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLG1FQUFtRSxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQVFqRSxNQUFNLE9BQU8seUJBQXlCO0lBT3BDO1FBTFUsV0FBTSxHQUF3QyxJQUFJLFlBQVksRUFBeUIsQ0FBQztJQU1sRyxDQUFDO0lBR0QsUUFBUTtRQUNOLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDL0YsTUFBTSxlQUFlLEdBQXdCO1lBQzNDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7WUFDeEIsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSTtZQUN0QixLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWE7WUFDeEUsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztZQUN4QixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNO1lBQzFCLEdBQUcsRUFBRSxDQUFDO1lBQ04sR0FBRyxFQUFFLFlBQVk7WUFDakIsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRTtTQUMzRCxDQUFDO1FBQ0YsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxXQUFXLEVBQUU7WUFDcEMsZUFBZSxDQUFDLFFBQVEsR0FBRyxVQUFVLFlBQVksRUFBRSxDQUFDO1NBQ3JEO1FBRUQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLFlBQVksQ0FBRSxlQUFlLENBQUUsQ0FBQztJQUNuRCxDQUFDO0lBR0QsV0FBVztJQUNYLENBQUM7OztZQXJDRixTQUFTLFNBQUU7Z0JBQ1YsUUFBUSxFQUFFLHdCQUF3QjtnQkFDbEMsUUFBUSxFQUFFO3FGQUN5RTthQUNwRjs7OztxQkFFRSxLQUFLO3FCQUNMLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0LCBPdXRwdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZpZWxkUGFyYW1JbnRlcmZhY2UsIFBvcEJhc2VFdmVudEludGVyZmFjZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgTnVtYmVyQ29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtbnVtYmVyL251bWJlci1jb25maWcubW9kZWwnO1xuaW1wb3J0IHsgSXNEZWZpbmVkIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcblxuXG5AQ29tcG9uZW50KCB7XG4gIHNlbGVjdG9yOiAnbGliLWZpZWxkLW51bWJlci1wYXJhbScsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGxpYi1wb3AtbnVtYmVyIChldmVudHMpPVwiZXZlbnRzLmVtaXQoJGV2ZW50KTtcIiBbY29uZmlnXT1wYXJhbT48L2xpYi1wb3AtbnVtYmVyPmAsXG59IClcbmV4cG9ydCBjbGFzcyBGaWVsZE51bWJlclBhcmFtQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBjb25maWc6IEZpZWxkUGFyYW1JbnRlcmZhY2U7XG4gIEBPdXRwdXQoKSBldmVudHM6IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+ID0gbmV3IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+KCk7XG5cbiAgcGFyYW06IE51bWJlckNvbmZpZztcblxuXG4gIGNvbnN0cnVjdG9yKCl7XG4gIH1cblxuXG4gIG5nT25Jbml0KCl7XG4gICAgY29uc3QgZGVmYXVsdFZhbHVlID0gSXNEZWZpbmVkKCB0aGlzLmNvbmZpZy5kZWZhdWx0X3ZhbHVlICkgPyArdGhpcy5jb25maWcuZGVmYXVsdF92YWx1ZSA6IDI1NTtcbiAgICBjb25zdCBjb25maWdJbnRlcmZhY2UgPSA8RmllbGRQYXJhbUludGVyZmFjZT57XG4gICAgICBsYWJlbDogdGhpcy5jb25maWcubGFiZWwsXG4gICAgICBuYW1lOiB0aGlzLmNvbmZpZy5uYW1lLFxuICAgICAgdmFsdWU6IHRoaXMuY29uZmlnLnZhbHVlID8gdGhpcy5jb25maWcudmFsdWUgOiB0aGlzLmNvbmZpZy5kZWZhdWx0X3ZhbHVlLFxuICAgICAgcGF0Y2g6IHRoaXMuY29uZmlnLnBhdGNoLFxuICAgICAgZmFjYWRlOiB0aGlzLmNvbmZpZy5mYWNhZGUsXG4gICAgICBtaW46IDEsXG4gICAgICBtYXg6IGRlZmF1bHRWYWx1ZSxcbiAgICAgIG1ldGFkYXRhOiB0aGlzLmNvbmZpZy5tZXRhZGF0YSA/IHRoaXMuY29uZmlnLm1ldGFkYXRhIDoge31cbiAgICB9O1xuICAgIGlmKCB0aGlzLmNvbmZpZy5uYW1lID09PSAnbWF4bGVuZ3RoJyApe1xuICAgICAgY29uZmlnSW50ZXJmYWNlLmhlbHBUZXh0ID0gYExpbWl0OiAke2RlZmF1bHRWYWx1ZX1gO1xuICAgIH1cblxuICAgIHRoaXMucGFyYW0gPSBuZXcgTnVtYmVyQ29uZmlnKCBjb25maWdJbnRlcmZhY2UgKTtcbiAgfVxuXG5cbiAgbmdPbkRlc3Ryb3koKXtcbiAgfVxuXG59XG4iXX0=