import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { PopCommonService } from '../../../../../../services/pop-common.service';
import { RadioConfig } from '../../../../../base/pop-field-item/pop-radio/radio-config.model';
export class FieldRadioParamComponent {
    constructor(commonRepo, changeDetectorRef) {
        this.commonRepo = commonRepo;
        this.changeDetectorRef = changeDetectorRef;
        this.events = new EventEmitter();
    }
    ngOnInit() {
        this.param = new RadioConfig({
            label: (this.config.label ? this.config.label : this.config.name),
            name: this.config.name,
            layout: 'row',
            value: this.config.value ? this.config.value : this.config.defaultValue,
            patch: this.config.patch,
            options: this.config.options,
            facade: this.config.facade,
            metadata: this.config.metadata ? this.config.metadata : {}
        });
    }
    ngOnDestroy() {
    }
}
FieldRadioParamComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-field-radio-param',
                template: `<lib-pop-radio (events)="events.emit($event);" [config]=param></lib-pop-radio>`
            },] }
];
FieldRadioParamComponent.ctorParameters = () => [
    { type: PopCommonService },
    { type: ChangeDetectorRef }
];
FieldRadioParamComponent.propDecorators = {
    config: [{ type: Input }],
    events: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGQtcmFkaW8tcGFyYW0uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktZmllbGQtZWRpdG9yL3BvcC1lbnRpdHktZmllbGQtc2V0dGluZ3MvcG9wLWVudGl0eS1maWVsZC1pdGVtLXBhcmFtcy9wYXJhbXMvZmllbGQtcmFkaW8tcGFyYW0uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBcUIsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzdHLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBRWpGLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxpRUFBaUUsQ0FBQztBQU85RixNQUFNLE9BQU8sd0JBQXdCO0lBT25DLFlBQW9CLFVBQTRCLEVBQzVCLGlCQUFvQztRQURwQyxlQUFVLEdBQVYsVUFBVSxDQUFrQjtRQUM1QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1FBTjlDLFdBQU0sR0FBd0MsSUFBSSxZQUFZLEVBQXlCLENBQUM7SUFPbEcsQ0FBQztJQUdELFFBQVE7UUFDTixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksV0FBVyxDQUFDO1lBQzNCLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEUsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSTtZQUN0QixNQUFNLEVBQUUsS0FBSztZQUNiLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWTtZQUN0RSxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO1lBQ3hCLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU87WUFDNUIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTtZQUMxQixRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO1NBQzNELENBQUMsQ0FBQztJQUNMLENBQUM7SUFHRCxXQUFXO0lBQ1gsQ0FBQzs7O1lBL0JGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsdUJBQXVCO2dCQUNqQyxRQUFRLEVBQUUsZ0ZBQWdGO2FBQzNGOzs7WUFSUSxnQkFBZ0I7WUFEaEIsaUJBQWlCOzs7cUJBV3ZCLEtBQUs7cUJBQ0wsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENoYW5nZURldGVjdG9yUmVmLCBDb21wb25lbnQsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0LCBPdXRwdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFBvcENvbW1vblNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtY29tbW9uLnNlcnZpY2UnO1xuaW1wb3J0IHsgRmllbGRQYXJhbUludGVyZmFjZSwgUG9wQmFzZUV2ZW50SW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBSYWRpb0NvbmZpZyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXJhZGlvL3JhZGlvLWNvbmZpZy5tb2RlbCc7XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLWZpZWxkLXJhZGlvLXBhcmFtJyxcbiAgdGVtcGxhdGU6IGA8bGliLXBvcC1yYWRpbyAoZXZlbnRzKT1cImV2ZW50cy5lbWl0KCRldmVudCk7XCIgW2NvbmZpZ109cGFyYW0+PC9saWItcG9wLXJhZGlvPmAsXG59KVxuZXhwb3J0IGNsYXNzIEZpZWxkUmFkaW9QYXJhbUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgY29uZmlnOiBGaWVsZFBhcmFtSW50ZXJmYWNlO1xuICBAT3V0cHV0KCkgZXZlbnRzOiBFdmVudEVtaXR0ZXI8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPiA9IG5ldyBFdmVudEVtaXR0ZXI8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPigpO1xuXG4gIHBhcmFtOiBSYWRpb0NvbmZpZztcblxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY29tbW9uUmVwbzogUG9wQ29tbW9uU2VydmljZSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBjaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpe1xuICB9XG5cblxuICBuZ09uSW5pdCgpe1xuICAgIHRoaXMucGFyYW0gPSBuZXcgUmFkaW9Db25maWcoe1xuICAgICAgbGFiZWw6ICh0aGlzLmNvbmZpZy5sYWJlbCA/IHRoaXMuY29uZmlnLmxhYmVsOiB0aGlzLmNvbmZpZy5uYW1lKSxcbiAgICAgIG5hbWU6IHRoaXMuY29uZmlnLm5hbWUsXG4gICAgICBsYXlvdXQ6ICdyb3cnLFxuICAgICAgdmFsdWU6IHRoaXMuY29uZmlnLnZhbHVlID8gdGhpcy5jb25maWcudmFsdWU6IHRoaXMuY29uZmlnLmRlZmF1bHRWYWx1ZSxcbiAgICAgIHBhdGNoOiB0aGlzLmNvbmZpZy5wYXRjaCxcbiAgICAgIG9wdGlvbnM6IHRoaXMuY29uZmlnLm9wdGlvbnMsXG4gICAgICBmYWNhZGU6IHRoaXMuY29uZmlnLmZhY2FkZSxcbiAgICAgIG1ldGFkYXRhOiB0aGlzLmNvbmZpZy5tZXRhZGF0YSA/IHRoaXMuY29uZmlnLm1ldGFkYXRhIDoge31cbiAgICB9KTtcbiAgfVxuXG5cbiAgbmdPbkRlc3Ryb3koKXtcbiAgfVxuXG59XG4iXX0=