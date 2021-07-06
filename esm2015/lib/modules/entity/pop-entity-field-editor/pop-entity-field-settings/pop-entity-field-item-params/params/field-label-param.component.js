import { Component, Input } from '@angular/core';
export class FieldLabelParamComponent {
    /**
     * This component expects config to be a Label config
     */
    ngOnInit() {
    }
}
FieldLabelParamComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-field-label-param',
                template: `
    <div class="field-builder-param-container">
      <div class="field-builder-param-title-container mat-h2">
        <div class="field-builder-param-title">{{config.name}}</div>
      </div>
    </div>`
            },] }
];
FieldLabelParamComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGQtbGFiZWwtcGFyYW0uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktZmllbGQtZWRpdG9yL3BvcC1lbnRpdHktZmllbGQtc2V0dGluZ3MvcG9wLWVudGl0eS1maWVsZC1pdGVtLXBhcmFtcy9wYXJhbXMvZmllbGQtbGFiZWwtcGFyYW0uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBWXpELE1BQU0sT0FBTyx3QkFBd0I7SUFJbkM7O09BRUc7SUFDSCxRQUFRO0lBRVIsQ0FBQzs7O1lBbEJGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsdUJBQXVCO2dCQUNqQyxRQUFRLEVBQUU7Ozs7O1dBS0Q7YUFDVjs7O3FCQUVFLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZpZWxkUGFyYW1JbnRlcmZhY2UgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLWZpZWxkLWxhYmVsLXBhcmFtJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8ZGl2IGNsYXNzPVwiZmllbGQtYnVpbGRlci1wYXJhbS1jb250YWluZXJcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZC1idWlsZGVyLXBhcmFtLXRpdGxlLWNvbnRhaW5lciBtYXQtaDJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkLWJ1aWxkZXItcGFyYW0tdGl0bGVcIj57e2NvbmZpZy5uYW1lfX08L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PmAsXG59KVxuZXhwb3J0IGNsYXNzIEZpZWxkTGFiZWxQYXJhbUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIEBJbnB1dCgpIGNvbmZpZzogRmllbGRQYXJhbUludGVyZmFjZTtcblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCBleHBlY3RzIGNvbmZpZyB0byBiZSBhIExhYmVsIGNvbmZpZ1xuICAgKi9cbiAgbmdPbkluaXQoKXtcblxuICB9XG59XG4iXX0=