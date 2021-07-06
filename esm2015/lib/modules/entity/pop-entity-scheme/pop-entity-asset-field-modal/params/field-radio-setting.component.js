import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { RadioConfig } from '../../../../base/pop-field-item/pop-radio/radio-config.model';
import { PopCommonService } from '../../../../../services/pop-common.service';
export class FieldRadioSettingComponent {
    constructor(commonRepo, changeDetectorRef) {
        this.commonRepo = commonRepo;
        this.changeDetectorRef = changeDetectorRef;
        this.events = new EventEmitter();
    }
    ngOnInit() {
        this.param = new RadioConfig({
            label: this.config.label,
            name: this.config.name,
            layout: 'row',
            value: this.config.value,
            patch: this.config.patch,
            options: this.config.options
        });
    }
    ngOnDestroy() {
    }
}
FieldRadioSettingComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-field-radio-param',
                template: `<lib-pop-radio (events)="events.emit($event);" [config]=param></lib-pop-radio><div class="sw-mar-vrt-sm sw-clear"></div>`
            },] }
];
FieldRadioSettingComponent.ctorParameters = () => [
    { type: PopCommonService },
    { type: ChangeDetectorRef }
];
FieldRadioSettingComponent.propDecorators = {
    config: [{ type: Input }],
    events: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGQtcmFkaW8tc2V0dGluZy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1zY2hlbWUvcG9wLWVudGl0eS1hc3NldC1maWVsZC1tb2RhbC9wYXJhbXMvZmllbGQtcmFkaW8tc2V0dGluZy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFxQixNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDN0csT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhEQUE4RCxDQUFDO0FBQzNGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBUzlFLE1BQU0sT0FBTywwQkFBMEI7SUFPckMsWUFBb0IsVUFBNEIsRUFDNUIsaUJBQW9DO1FBRHBDLGVBQVUsR0FBVixVQUFVLENBQWtCO1FBQzVCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7UUFOOUMsV0FBTSxHQUF3QyxJQUFJLFlBQVksRUFBeUIsQ0FBQztJQU9sRyxDQUFDO0lBR0QsUUFBUTtRQUNOLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxXQUFXLENBQUM7WUFDM0IsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztZQUN4QixJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJO1lBQ3RCLE1BQU0sRUFBRSxLQUFLO1lBQ2IsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztZQUN4QixLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO1lBQ3hCLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU87U0FDN0IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUdELFdBQVc7SUFDWCxDQUFDOzs7WUE3QkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSx1QkFBdUI7Z0JBQ2pDLFFBQVEsRUFBRSwwSEFBMEg7YUFDckk7OztZQVJRLGdCQUFnQjtZQUZoQixpQkFBaUI7OztxQkFZdkIsS0FBSztxQkFDTCxNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgRXZlbnRFbWl0dGVyLCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQsIE91dHB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUmFkaW9Db25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1yYWRpby9yYWRpby1jb25maWcubW9kZWwnO1xuaW1wb3J0IHsgUG9wQ29tbW9uU2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1jb21tb24uc2VydmljZSc7XG5pbXBvcnQgeyBGaWVsZFNldHRpbmdJbnRlcmZhY2UgfSBmcm9tICcuLi8uLi9wb3AtZW50aXR5LXNjaGVtZS5tb2RlbCc7XG5pbXBvcnQgeyBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItZmllbGQtcmFkaW8tcGFyYW0nLFxuICB0ZW1wbGF0ZTogYDxsaWItcG9wLXJhZGlvIChldmVudHMpPVwiZXZlbnRzLmVtaXQoJGV2ZW50KTtcIiBbY29uZmlnXT1wYXJhbT48L2xpYi1wb3AtcmFkaW8+PGRpdiBjbGFzcz1cInN3LW1hci12cnQtc20gc3ctY2xlYXJcIj48L2Rpdj5gLFxufSlcbmV4cG9ydCBjbGFzcyBGaWVsZFJhZGlvU2V0dGluZ0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgY29uZmlnOiBGaWVsZFNldHRpbmdJbnRlcmZhY2U7XG4gIEBPdXRwdXQoKSBldmVudHM6IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+ID0gbmV3IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+KCk7XG5cbiAgcGFyYW06IFJhZGlvQ29uZmlnO1xuXG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjb21tb25SZXBvOiBQb3BDb21tb25TZXJ2aWNlLFxuICAgICAgICAgICAgICBwcml2YXRlIGNoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZil7XG4gIH1cblxuXG4gIG5nT25Jbml0KCl7XG4gICAgdGhpcy5wYXJhbSA9IG5ldyBSYWRpb0NvbmZpZyh7XG4gICAgICBsYWJlbDogdGhpcy5jb25maWcubGFiZWwsXG4gICAgICBuYW1lOiB0aGlzLmNvbmZpZy5uYW1lLFxuICAgICAgbGF5b3V0OiAncm93JyxcbiAgICAgIHZhbHVlOiB0aGlzLmNvbmZpZy52YWx1ZSxcbiAgICAgIHBhdGNoOiB0aGlzLmNvbmZpZy5wYXRjaCxcbiAgICAgIG9wdGlvbnM6IHRoaXMuY29uZmlnLm9wdGlvbnNcbiAgICB9KTtcbiAgfVxuXG5cbiAgbmdPbkRlc3Ryb3koKXtcbiAgfVxuXG59XG4iXX0=