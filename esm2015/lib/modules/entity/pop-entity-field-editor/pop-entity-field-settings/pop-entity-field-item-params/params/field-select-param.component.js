import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { SelectConfig } from '../../../../../base/pop-field-item/pop-select/select-config.model';
import { ConvertArrayToOptionList, IsObject } from '../../../../../../pop-common-utility';
export class FieldSelectParamComponent {
    constructor() {
        this.events = new EventEmitter();
        this.hidden = false;
    }
    ngOnInit() {
        if (IsObject(this.config, true)) {
            this.param = new SelectConfig({
                label: (this.config.label ? this.config.label : this.config.name),
                name: this.config.name,
                value: this.config.value ? this.config.value : this.config.defaultValue,
                options: {
                    values: IsObject(this.config.options, ['values']) ? ConvertArrayToOptionList(this.config.options.values) : []
                },
                facade: this.config.facade,
                patch: this.config.patch,
                metadata: this.config.metadata ? this.config.metadata : {}
            });
        }
        this.hidden = this.param.options.values.length === 0 ? true : false;
    }
}
FieldSelectParamComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-field-select-param',
                template: `
    <lib-pop-select *ngIf="param" (events)="events.emit($event);" [config]=param></lib-pop-select>`
            },] }
];
FieldSelectParamComponent.propDecorators = {
    config: [{ type: Input }],
    events: [{ type: Output }],
    hidden: [{ type: HostBinding, args: ['class.sw-hidden',] }, { type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGQtc2VsZWN0LXBhcmFtLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci9wb3AtZW50aXR5LWZpZWxkLXNldHRpbmdzL3BvcC1lbnRpdHktZmllbGQtaXRlbS1wYXJhbXMvcGFyYW1zL2ZpZWxkLXNlbGVjdC1wYXJhbS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBVSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFNUYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLG1FQUFtRSxDQUFDO0FBQ2pHLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxRQUFRLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQVExRixNQUFNLE9BQU8seUJBQXlCO0lBTHRDO1FBT1ksV0FBTSxHQUF3QyxJQUFJLFlBQVksRUFBeUIsQ0FBQztRQUN2RCxXQUFNLEdBQUcsS0FBSyxDQUFDO0lBcUI1RCxDQUFDO0lBaEJDLFFBQVE7UUFDTixJQUFJLFFBQVEsQ0FBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBRSxFQUFFO1lBQ2pDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxZQUFZLENBQUU7Z0JBQzdCLEtBQUssRUFBRSxDQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUU7Z0JBQ25FLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUk7Z0JBQ3RCLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWTtnQkFDdkUsT0FBTyxFQUFFO29CQUNQLE1BQU0sRUFBRSxRQUFRLENBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBRSxRQUFRLENBQUUsQ0FBRSxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsQ0FBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRTtpQkFDcEg7Z0JBQ0QsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTtnQkFDMUIsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztnQkFDeEIsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRTthQUMzRCxDQUFFLENBQUM7U0FDTDtRQUNELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ3RFLENBQUM7OztZQTVCRixTQUFTLFNBQUU7Z0JBQ1YsUUFBUSxFQUFFLHdCQUF3QjtnQkFDbEMsUUFBUSxFQUFFO21HQUN1RjthQUNsRzs7O3FCQUVFLEtBQUs7cUJBQ0wsTUFBTTtxQkFDTixXQUFXLFNBQUUsaUJBQWlCLGNBQUksS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRXZlbnRFbWl0dGVyLCBIb3N0QmluZGluZywgSW5wdXQsIE9uSW5pdCwgT3V0cHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGaWVsZFBhcmFtSW50ZXJmYWNlLCBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFNlbGVjdENvbmZpZyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXNlbGVjdC9zZWxlY3QtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IENvbnZlcnRBcnJheVRvT3B0aW9uTGlzdCwgSXNPYmplY3QgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuXG5cbkBDb21wb25lbnQoIHtcbiAgc2VsZWN0b3I6ICdsaWItZmllbGQtc2VsZWN0LXBhcmFtJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bGliLXBvcC1zZWxlY3QgKm5nSWY9XCJwYXJhbVwiIChldmVudHMpPVwiZXZlbnRzLmVtaXQoJGV2ZW50KTtcIiBbY29uZmlnXT1wYXJhbT48L2xpYi1wb3Atc2VsZWN0PmAsXG59IClcbmV4cG9ydCBjbGFzcyBGaWVsZFNlbGVjdFBhcmFtQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgQElucHV0KCkgY29uZmlnOiBGaWVsZFBhcmFtSW50ZXJmYWNlO1xuICBAT3V0cHV0KCkgZXZlbnRzOiBFdmVudEVtaXR0ZXI8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPiA9IG5ldyBFdmVudEVtaXR0ZXI8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPigpO1xuICBASG9zdEJpbmRpbmcoICdjbGFzcy5zdy1oaWRkZW4nICkgQElucHV0KCkgaGlkZGVuID0gZmFsc2U7XG5cbiAgcGFyYW06IFNlbGVjdENvbmZpZztcblxuXG4gIG5nT25Jbml0KCl7XG4gICAgaWYoIElzT2JqZWN0KCB0aGlzLmNvbmZpZywgdHJ1ZSApICl7XG4gICAgICB0aGlzLnBhcmFtID0gbmV3IFNlbGVjdENvbmZpZygge1xuICAgICAgICBsYWJlbDogKCB0aGlzLmNvbmZpZy5sYWJlbCA/IHRoaXMuY29uZmlnLmxhYmVsIDogdGhpcy5jb25maWcubmFtZSApLFxuICAgICAgICBuYW1lOiB0aGlzLmNvbmZpZy5uYW1lLFxuICAgICAgICB2YWx1ZTogdGhpcy5jb25maWcudmFsdWUgPyB0aGlzLmNvbmZpZy52YWx1ZSA6IHRoaXMuY29uZmlnLmRlZmF1bHRWYWx1ZSxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgIHZhbHVlczogSXNPYmplY3QoIHRoaXMuY29uZmlnLm9wdGlvbnMsIFsgJ3ZhbHVlcycgXSApID8gQ29udmVydEFycmF5VG9PcHRpb25MaXN0KCB0aGlzLmNvbmZpZy5vcHRpb25zLnZhbHVlcyApIDogW11cbiAgICAgICAgfSxcbiAgICAgICAgZmFjYWRlOiB0aGlzLmNvbmZpZy5mYWNhZGUsXG4gICAgICAgIHBhdGNoOiB0aGlzLmNvbmZpZy5wYXRjaCxcbiAgICAgICAgbWV0YWRhdGE6IHRoaXMuY29uZmlnLm1ldGFkYXRhID8gdGhpcy5jb25maWcubWV0YWRhdGEgOiB7fVxuICAgICAgfSApO1xuICAgIH1cbiAgICB0aGlzLmhpZGRlbiA9IHRoaXMucGFyYW0ub3B0aW9ucy52YWx1ZXMubGVuZ3RoID09PSAwID8gdHJ1ZSA6IGZhbHNlO1xuICB9XG59XG4iXX0=