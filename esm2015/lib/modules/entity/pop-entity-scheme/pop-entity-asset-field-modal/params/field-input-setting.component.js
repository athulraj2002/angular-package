import { Component, ElementRef, Input } from '@angular/core';
import { InputConfig } from '../../../../base/pop-field-item/pop-input/input-config.model';
import { PopExtendComponent } from '../../../../../pop-extend.component';
import { IsDefined } from '../../../../../pop-common-utility';
export class FieldInputSettingComponent extends PopExtendComponent {
    constructor(el) {
        super();
        this.el = el;
        this.name = 'FieldInputSettingComponent';
        /**
         * Configure the specifics of this component
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.ui.param = new InputConfig({
                    label: this.config.label,
                    name: this.config.name,
                    value: IsDefined(this.config.value) ? this.config.value : this.config.defaultValue,
                    readonly: this.config.readonly,
                    patch: this.config.patch
                });
                return resolve(true);
            });
        };
    }
    /**
     * This component will product an html field to capture a field item setting value
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * Handle events from the data capture
     * @param event
     */
    onBubbleEvent(event) {
        this.events.emit(event);
    }
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
FieldInputSettingComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-field-asset-param',
                template: `
    <lib-pop-input (events)="onBubbleEvent($event);" [config]=ui.param></lib-pop-input><div class="sw-mar-vrt-sm sw-clear"></div>`
            },] }
];
FieldInputSettingComponent.ctorParameters = () => [
    { type: ElementRef }
];
FieldInputSettingComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGQtaW5wdXQtc2V0dGluZy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1zY2hlbWUvcG9wLWVudGl0eS1hc3NldC1maWVsZC1tb2RhbC9wYXJhbXMvZmllbGQtaW5wdXQtc2V0dGluZy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFxQixNQUFNLGVBQWUsQ0FBQztBQUNoRixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sOERBQThELENBQUM7QUFFM0YsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDekUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBUTlELE1BQU0sT0FBTywwQkFBMkIsU0FBUSxrQkFBa0I7SUFNaEUsWUFDUyxFQUFjO1FBRXJCLEtBQUssRUFBRSxDQUFDO1FBRkQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUpoQixTQUFJLEdBQUcsNEJBQTRCLENBQUM7UUFPekM7O1dBRUc7UUFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFxQixFQUFFO1lBQzFDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxXQUFXLENBQUM7b0JBQzlCLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7b0JBQ3hCLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUk7b0JBQ3RCLEtBQUssRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWTtvQkFDbEYsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUTtvQkFDOUIsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztpQkFDekIsQ0FBQyxDQUFDO2dCQUVILE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUdEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBR0Q7OztPQUdHO0lBQ0gsYUFBYSxDQUFDLEtBQTRCO1FBQ3hDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFHRDs7T0FFRztJQUNILFdBQVc7UUFDVCxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdEIsQ0FBQzs7O1lBeERGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsdUJBQXVCO2dCQUNqQyxRQUFRLEVBQUU7a0lBQ3NIO2FBQ2pJOzs7WUFYbUIsVUFBVTs7O3FCQWEzQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IElucHV0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtaW5wdXQvaW5wdXQtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IEZpZWxkUGFyYW1JbnRlcmZhY2UsIFBvcEJhc2VFdmVudEludGVyZmFjZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHsgSXNEZWZpbmVkIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItZmllbGQtYXNzZXQtcGFyYW0nLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxsaWItcG9wLWlucHV0IChldmVudHMpPVwib25CdWJibGVFdmVudCgkZXZlbnQpO1wiIFtjb25maWddPXVpLnBhcmFtPjwvbGliLXBvcC1pbnB1dD48ZGl2IGNsYXNzPVwic3ctbWFyLXZydC1zbSBzdy1jbGVhclwiPjwvZGl2PmAsXG59KVxuZXhwb3J0IGNsYXNzIEZpZWxkSW5wdXRTZXR0aW5nQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBjb25maWc6IEZpZWxkUGFyYW1JbnRlcmZhY2U7XG5cbiAgcHVibGljIG5hbWUgPSAnRmllbGRJbnB1dFNldHRpbmdDb21wb25lbnQnO1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVsOiBFbGVtZW50UmVmLFxuICApe1xuICAgIHN1cGVyKCk7XG4gICAgLyoqXG4gICAgICogQ29uZmlndXJlIHRoZSBzcGVjaWZpY3Mgb2YgdGhpcyBjb21wb25lbnRcbiAgICAgKi9cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgdGhpcy51aS5wYXJhbSA9IG5ldyBJbnB1dENvbmZpZyh7XG4gICAgICAgICAgbGFiZWw6IHRoaXMuY29uZmlnLmxhYmVsLFxuICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlnLm5hbWUsXG4gICAgICAgICAgdmFsdWU6IElzRGVmaW5lZCh0aGlzLmNvbmZpZy52YWx1ZSkgPyB0aGlzLmNvbmZpZy52YWx1ZSA6IHRoaXMuY29uZmlnLmRlZmF1bHRWYWx1ZSxcbiAgICAgICAgICByZWFkb25seTogdGhpcy5jb25maWcucmVhZG9ubHksXG4gICAgICAgICAgcGF0Y2g6IHRoaXMuY29uZmlnLnBhdGNoXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IHdpbGwgcHJvZHVjdCBhbiBodG1sIGZpZWxkIHRvIGNhcHR1cmUgYSBmaWVsZCBpdGVtIHNldHRpbmcgdmFsdWVcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEhhbmRsZSBldmVudHMgZnJvbSB0aGUgZGF0YSBjYXB0dXJlXG4gICAqIEBwYXJhbSBldmVudFxuICAgKi9cbiAgb25CdWJibGVFdmVudChldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlKXtcbiAgICB0aGlzLmV2ZW50cy5lbWl0KGV2ZW50KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENsZWFuIHVwIHRoZSBkb20gb2YgdGhpcyBjb21wb25lbnRcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG59XG4iXX0=