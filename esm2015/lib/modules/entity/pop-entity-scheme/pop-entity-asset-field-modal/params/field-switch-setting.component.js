import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { SwitchConfig } from '../../../../base/pop-field-item/pop-switch/switch-config.model';
import { PopCommonService } from '../../../../../services/pop-common.service';
export class FieldSwitchSettingComponent {
    constructor(commonRepo, changeDetectorRef) {
        this.commonRepo = commonRepo;
        this.changeDetectorRef = changeDetectorRef;
        this.events = new EventEmitter();
    }
    ngOnInit() {
        this.param = new SwitchConfig({
            label: this.config.label,
            name: this.config.name,
            value: this.config.value,
            patch: this.config.patch
        });
    }
}
FieldSwitchSettingComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-field-switch-setting',
                template: `<lib-pop-switch (events)="events.emit($event);" [config]=param></lib-pop-switch>`
            },] }
];
FieldSwitchSettingComponent.ctorParameters = () => [
    { type: PopCommonService },
    { type: ChangeDetectorRef }
];
FieldSwitchSettingComponent.propDecorators = {
    config: [{ type: Input }],
    events: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGQtc3dpdGNoLXNldHRpbmcuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktc2NoZW1lL3BvcC1lbnRpdHktYXNzZXQtZmllbGQtbW9kYWwvcGFyYW1zL2ZpZWxkLXN3aXRjaC1zZXR0aW5nLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQVUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2xHLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnRUFBZ0UsQ0FBQztBQUM5RixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQztBQVM5RSxNQUFNLE9BQU8sMkJBQTJCO0lBUXRDLFlBQW9CLFVBQTRCLEVBQzVCLGlCQUFvQztRQURwQyxlQUFVLEdBQVYsVUFBVSxDQUFrQjtRQUM1QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1FBTjlDLFdBQU0sR0FBd0MsSUFBSSxZQUFZLEVBQXlCLENBQUM7SUFPbEcsQ0FBQztJQUdELFFBQVE7UUFDTixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksWUFBWSxDQUFDO1lBQzVCLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7WUFDeEIsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSTtZQUN0QixLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO1lBQ3hCLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7U0FDekIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7O1lBeEJGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsMEJBQTBCO2dCQUNwQyxRQUFRLEVBQUUsa0ZBQWtGO2FBQzdGOzs7WUFSUSxnQkFBZ0I7WUFGaEIsaUJBQWlCOzs7cUJBYXZCLEtBQUs7cUJBQ0wsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENoYW5nZURldGVjdG9yUmVmLCBDb21wb25lbnQsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE9uSW5pdCwgT3V0cHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTd2l0Y2hDb25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1zd2l0Y2gvc3dpdGNoLWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBQb3BDb21tb25TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2VydmljZXMvcG9wLWNvbW1vbi5zZXJ2aWNlJztcbmltcG9ydCB7IEZpZWxkU2V0dGluZ0ludGVyZmFjZSB9IGZyb20gJy4uLy4uL3BvcC1lbnRpdHktc2NoZW1lLm1vZGVsJztcbmltcG9ydCB7IFBvcEJhc2VFdmVudEludGVyZmFjZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1maWVsZC1zd2l0Y2gtc2V0dGluZycsXG4gIHRlbXBsYXRlOiBgPGxpYi1wb3Atc3dpdGNoIChldmVudHMpPVwiZXZlbnRzLmVtaXQoJGV2ZW50KTtcIiBbY29uZmlnXT1wYXJhbT48L2xpYi1wb3Atc3dpdGNoPmAsXG59KVxuZXhwb3J0IGNsYXNzIEZpZWxkU3dpdGNoU2V0dGluZ0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG5cbiAgQElucHV0KCkgY29uZmlnOiBGaWVsZFNldHRpbmdJbnRlcmZhY2U7XG4gIEBPdXRwdXQoKSBldmVudHM6IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+ID0gbmV3IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+KCk7XG5cbiAgcGFyYW06IFN3aXRjaENvbmZpZztcblxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY29tbW9uUmVwbzogUG9wQ29tbW9uU2VydmljZSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBjaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpe1xuICB9XG5cblxuICBuZ09uSW5pdCgpe1xuICAgIHRoaXMucGFyYW0gPSBuZXcgU3dpdGNoQ29uZmlnKHtcbiAgICAgIGxhYmVsOiB0aGlzLmNvbmZpZy5sYWJlbCxcbiAgICAgIG5hbWU6IHRoaXMuY29uZmlnLm5hbWUsXG4gICAgICB2YWx1ZTogdGhpcy5jb25maWcudmFsdWUsXG4gICAgICBwYXRjaDogdGhpcy5jb25maWcucGF0Y2hcbiAgICB9KTtcbiAgfVxuXG5cbn1cbiJdfQ==