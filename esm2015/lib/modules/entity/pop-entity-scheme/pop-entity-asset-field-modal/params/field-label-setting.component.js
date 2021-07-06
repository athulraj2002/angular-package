import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { PopCommonService } from '../../../../../services/pop-common.service';
export class FieldLabelSettingComponent {
    constructor(commonRepo, changeDetectorRef) {
        this.commonRepo = commonRepo;
        this.changeDetectorRef = changeDetectorRef;
        this.state = {
            selected: 0,
            system: false,
            loaded: false,
            loading: false,
            error: { code: 0, message: '' },
        };
        this.subscriber = {
            data: undefined,
        };
        this.field = {
            type: '',
            items: undefined,
            active: {},
        };
        this.active = {
            item: undefined
        };
        this.models = {};
        this.configs = {};
    }
    ngOnInit() {
    }
}
FieldLabelSettingComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-field-asset-param',
                template: `
    <div class="field-builder-param-container">
      <div class="field-builder-param-title-container mat-h2">
        <div class="field-builder-param-title">{{config.name}}</div>
      </div>
    </div>`
            },] }
];
FieldLabelSettingComponent.ctorParameters = () => [
    { type: PopCommonService },
    { type: ChangeDetectorRef }
];
FieldLabelSettingComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGQtbGFiZWwtc2V0dGluZy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1zY2hlbWUvcG9wLWVudGl0eS1hc3NldC1maWVsZC1tb2RhbC9wYXJhbXMvZmllbGQtbGFiZWwtc2V0dGluZy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQWtCLE1BQU0sZUFBZSxDQUFDO0FBRXBGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBYTlFLE1BQU0sT0FBTywwQkFBMEI7SUErQnJDLFlBQW9CLFVBQTRCLEVBQzVCLGlCQUFvQztRQURwQyxlQUFVLEdBQVYsVUFBVSxDQUFrQjtRQUM1QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1FBNUJ4RCxVQUFLLEdBQUc7WUFDTixRQUFRLEVBQUUsQ0FBQztZQUNYLE1BQU0sRUFBRSxLQUFLO1lBQ2IsTUFBTSxFQUFFLEtBQUs7WUFDYixPQUFPLEVBQUUsS0FBSztZQUNkLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRTtTQUNoQyxDQUFDO1FBRUYsZUFBVSxHQUFHO1lBQ1gsSUFBSSxFQUFnQixTQUFTO1NBQzlCLENBQUM7UUFFRixVQUFLLEdBQUc7WUFDTixJQUFJLEVBQUUsRUFBRTtZQUNSLEtBQUssRUFBRSxTQUFTO1lBQ2hCLE1BQU0sRUFBRSxFQUFFO1NBQ1gsQ0FBQztRQUVGLFdBQU0sR0FBRTtZQUNOLElBQUksRUFBRSxTQUFTO1NBQ2hCLENBQUM7UUFFRixXQUFNLEdBQUcsRUFBRSxDQUFDO1FBRVosWUFBTyxHQUFHLEVBQUUsQ0FBQztJQUtiLENBQUM7SUFHRCxRQUFRO0lBRVIsQ0FBQzs7O1lBL0NGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsdUJBQXVCO2dCQUNqQyxRQUFRLEVBQUU7Ozs7O1dBS0Q7YUFDVjs7O1lBWlEsZ0JBQWdCO1lBRmhCLGlCQUFpQjs7O3FCQWlCdkIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENoYW5nZURldGVjdG9yUmVmLCBDb21wb25lbnQsIElucHV0LCBPbkluaXQsIE91dHB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBQb3BDb21tb25TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2VydmljZXMvcG9wLWNvbW1vbi5zZXJ2aWNlJztcbmltcG9ydCB7IEZpZWxkU2V0dGluZ0ludGVyZmFjZSB9IGZyb20gJy4uLy4uL3BvcC1lbnRpdHktc2NoZW1lLm1vZGVsJztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItZmllbGQtYXNzZXQtcGFyYW0nLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1idWlsZGVyLXBhcmFtLWNvbnRhaW5lclwiPlxuICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWJ1aWxkZXItcGFyYW0tdGl0bGUtY29udGFpbmVyIG1hdC1oMlwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQtYnVpbGRlci1wYXJhbS10aXRsZVwiPnt7Y29uZmlnLm5hbWV9fTwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+YCxcbn0pXG5leHBvcnQgY2xhc3MgRmllbGRMYWJlbFNldHRpbmdDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuXG4gIEBJbnB1dCgpIGNvbmZpZzogRmllbGRTZXR0aW5nSW50ZXJmYWNlO1xuXG4gIHN0YXRlID0ge1xuICAgIHNlbGVjdGVkOiAwLFxuICAgIHN5c3RlbTogZmFsc2UsXG4gICAgbG9hZGVkOiBmYWxzZSxcbiAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICBlcnJvcjogeyBjb2RlOiAwLCBtZXNzYWdlOiAnJyB9LFxuICB9O1xuXG4gIHN1YnNjcmliZXIgPSB7XG4gICAgZGF0YTogPFN1YnNjcmlwdGlvbj51bmRlZmluZWQsXG4gIH07XG5cbiAgZmllbGQgPSB7XG4gICAgdHlwZTogJycsXG4gICAgaXRlbXM6IHVuZGVmaW5lZCxcbiAgICBhY3RpdmU6IHt9LFxuICB9O1xuXG4gIGFjdGl2ZSA9e1xuICAgIGl0ZW06IHVuZGVmaW5lZFxuICB9O1xuXG4gIG1vZGVscyA9IHt9O1xuXG4gIGNvbmZpZ3MgPSB7fTtcblxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY29tbW9uUmVwbzogUG9wQ29tbW9uU2VydmljZSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBjaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpe1xuICB9XG5cblxuICBuZ09uSW5pdCgpe1xuXG4gIH1cbn1cbiJdfQ==