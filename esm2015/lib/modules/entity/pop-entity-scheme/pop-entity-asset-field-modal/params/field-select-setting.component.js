import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectConfig } from '../../../../base/pop-field-item/pop-select/select-config.model';
import { ConvertArrayToOptionList } from '../../../../../pop-common-utility';
export class FieldSelectSettingComponent {
    constructor() {
        this.events = new EventEmitter();
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
        this.param = new SelectConfig({
            label: this.config.label,
            name: this.config.name,
            value: this.config.value ? this.config.value : this.config.default,
            options: { values: ConvertArrayToOptionList(this.config.options.values) },
            patch: this.config.patch
        });
    }
}
FieldSelectSettingComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-field-select-setting',
                template: `
    <lib-pop-select (events)="events.emit($event);" [config]=param></lib-pop-select><div class="sw-mar-vrt-sm sw-clear"></div>`
            },] }
];
FieldSelectSettingComponent.propDecorators = {
    config: [{ type: Input }],
    events: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGQtc2VsZWN0LXNldHRpbmcuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktc2NoZW1lL3BvcC1lbnRpdHktYXNzZXQtZmllbGQtbW9kYWwvcGFyYW1zL2ZpZWxkLXNlbGVjdC1zZXR0aW5nLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQXFCLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFVLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNsRyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0VBQWdFLENBQUM7QUFLOUYsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFRN0UsTUFBTSxPQUFPLDJCQUEyQjtJQUx4QztRQVFZLFdBQU0sR0FBd0MsSUFBSSxZQUFZLEVBQXlCLENBQUM7UUFJbEcsVUFBSyxHQUFHO1lBQ04sUUFBUSxFQUFFLENBQUM7WUFDWCxNQUFNLEVBQUUsS0FBSztZQUNiLE1BQU0sRUFBRSxLQUFLO1lBQ2IsT0FBTyxFQUFFLEtBQUs7WUFDZCxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUU7U0FDaEMsQ0FBQztRQUVGLGVBQVUsR0FBRztZQUNYLElBQUksRUFBZ0IsU0FBUztTQUM5QixDQUFDO1FBRUYsVUFBSyxHQUFHO1lBQ04sSUFBSSxFQUFFLEVBQUU7WUFDUixLQUFLLEVBQUUsU0FBUztZQUNoQixNQUFNLEVBQUUsRUFBRTtTQUNYLENBQUM7UUFFRixXQUFNLEdBQUc7WUFDUCxJQUFJLEVBQUUsU0FBUztTQUNoQixDQUFDO1FBRUYsV0FBTSxHQUFHLEVBQUUsQ0FBQztRQUVaLFlBQU8sR0FBRyxFQUFFLENBQUM7SUFZZixDQUFDO0lBVEMsUUFBUTtRQUNOLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxZQUFZLENBQUM7WUFDNUIsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztZQUN4QixJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJO1lBQ3RCLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTztZQUNsRSxPQUFPLEVBQUUsRUFBQyxNQUFNLEVBQUUsd0JBQXdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUM7WUFDdkUsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztTQUN6QixDQUFDLENBQUM7SUFDTCxDQUFDOzs7WUEvQ0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSwwQkFBMEI7Z0JBQ3BDLFFBQVEsRUFBRTsrSEFDbUg7YUFDOUg7OztxQkFHRSxLQUFLO3FCQUNMLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50LCBFdmVudEVtaXR0ZXIsIElucHV0LCBPbkluaXQsIE91dHB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU2VsZWN0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3Atc2VsZWN0L3NlbGVjdC1jb25maWcubW9kZWwnO1xuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBQb3BDb21tb25TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2VydmljZXMvcG9wLWNvbW1vbi5zZXJ2aWNlJztcbmltcG9ydCB7IEZpZWxkU2V0dGluZ0ludGVyZmFjZSB9IGZyb20gJy4uLy4uL3BvcC1lbnRpdHktc2NoZW1lLm1vZGVsJztcbmltcG9ydCB7IFBvcEJhc2VFdmVudEludGVyZmFjZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgQ29udmVydEFycmF5VG9PcHRpb25MaXN0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItZmllbGQtc2VsZWN0LXNldHRpbmcnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxsaWItcG9wLXNlbGVjdCAoZXZlbnRzKT1cImV2ZW50cy5lbWl0KCRldmVudCk7XCIgW2NvbmZpZ109cGFyYW0+PC9saWItcG9wLXNlbGVjdD48ZGl2IGNsYXNzPVwic3ctbWFyLXZydC1zbSBzdy1jbGVhclwiPjwvZGl2PmAsXG59KVxuZXhwb3J0IGNsYXNzIEZpZWxkU2VsZWN0U2V0dGluZ0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG5cbiAgQElucHV0KCkgY29uZmlnOiBGaWVsZFNldHRpbmdJbnRlcmZhY2U7XG4gIEBPdXRwdXQoKSBldmVudHM6IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+ID0gbmV3IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+KCk7XG5cbiAgcGFyYW06IFNlbGVjdENvbmZpZztcblxuICBzdGF0ZSA9IHtcbiAgICBzZWxlY3RlZDogMCxcbiAgICBzeXN0ZW06IGZhbHNlLFxuICAgIGxvYWRlZDogZmFsc2UsXG4gICAgbG9hZGluZzogZmFsc2UsXG4gICAgZXJyb3I6IHsgY29kZTogMCwgbWVzc2FnZTogJycgfSxcbiAgfTtcblxuICBzdWJzY3JpYmVyID0ge1xuICAgIGRhdGE6IDxTdWJzY3JpcHRpb24+dW5kZWZpbmVkLFxuICB9O1xuXG4gIGZpZWxkID0ge1xuICAgIHR5cGU6ICcnLFxuICAgIGl0ZW1zOiB1bmRlZmluZWQsXG4gICAgYWN0aXZlOiB7fSxcbiAgfTtcblxuICBhY3RpdmUgPSB7XG4gICAgaXRlbTogdW5kZWZpbmVkXG4gIH07XG5cbiAgbW9kZWxzID0ge307XG5cbiAgY29uZmlncyA9IHt9O1xuXG5cbiAgbmdPbkluaXQoKXtcbiAgICB0aGlzLnBhcmFtID0gbmV3IFNlbGVjdENvbmZpZyh7XG4gICAgICBsYWJlbDogdGhpcy5jb25maWcubGFiZWwsXG4gICAgICBuYW1lOiB0aGlzLmNvbmZpZy5uYW1lLFxuICAgICAgdmFsdWU6IHRoaXMuY29uZmlnLnZhbHVlID8gdGhpcy5jb25maWcudmFsdWUgOiB0aGlzLmNvbmZpZy5kZWZhdWx0LFxuICAgICAgb3B0aW9uczoge3ZhbHVlczogQ29udmVydEFycmF5VG9PcHRpb25MaXN0KHRoaXMuY29uZmlnLm9wdGlvbnMudmFsdWVzKX0sXG4gICAgICBwYXRjaDogdGhpcy5jb25maWcucGF0Y2hcbiAgICB9KTtcbiAgfVxufVxuIl19