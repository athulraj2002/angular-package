import { Component, HostBinding, Input } from '@angular/core';
export class PopFieldItemHelperComponent {
    constructor() {
        this.hidden = false;
        if (!this.helpText)
            this.helpText = '';
    }
    ngOnInit() {
    }
}
PopFieldItemHelperComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-field-item-helper',
                template: `
    <span class="pop-field-item-help-text material-icons sw-pointer"
          *ngIf="!hidden && helpText"
          (mouseenter)="helper = true"
          (mouseleave)="helper = false"
          matTooltip="{{helpText}}"
          matTooltipPosition="above">help_outline
    </span>
  `,
                styles: [`
    .pop-field-item-help-text {
      position: relative;
      font-size: 1.5em;
      color: var(--text-disabled);
      z-index: 2;
    }`]
            },] }
];
PopFieldItemHelperComponent.ctorParameters = () => [];
PopFieldItemHelperComponent.propDecorators = {
    helpText: [{ type: Input }],
    hidden: [{ type: HostBinding, args: ['class.sw-hidden',] }, { type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWZpZWxkLWl0ZW0taGVscGVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vYXNzZXQvcG9wLWZpZWxkLWl0ZW0taGVscGVyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQVUsTUFBTSxlQUFlLENBQUM7QUFzQnRFLE1BQU0sT0FBTywyQkFBMkI7SUFNdEM7UUFKeUMsV0FBTSxHQUFHLEtBQUssQ0FBQztRQUt0RCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7WUFBRyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUMxQyxDQUFDO0lBR0QsUUFBUTtJQUNSLENBQUM7OztZQS9CRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLDJCQUEyQjtnQkFDckMsUUFBUSxFQUFFOzs7Ozs7OztHQVFUO3lCQUNTOzs7Ozs7TUFNTjthQUNMOzs7O3VCQUVFLEtBQUs7cUJBQ0wsV0FBVyxTQUFDLGlCQUFpQixjQUFHLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEhvc3RCaW5kaW5nLCBJbnB1dCwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC1maWVsZC1pdGVtLWhlbHBlcicsXG4gIHRlbXBsYXRlOiBgXG4gICAgPHNwYW4gY2xhc3M9XCJwb3AtZmllbGQtaXRlbS1oZWxwLXRleHQgbWF0ZXJpYWwtaWNvbnMgc3ctcG9pbnRlclwiXG4gICAgICAgICAgKm5nSWY9XCIhaGlkZGVuICYmIGhlbHBUZXh0XCJcbiAgICAgICAgICAobW91c2VlbnRlcik9XCJoZWxwZXIgPSB0cnVlXCJcbiAgICAgICAgICAobW91c2VsZWF2ZSk9XCJoZWxwZXIgPSBmYWxzZVwiXG4gICAgICAgICAgbWF0VG9vbHRpcD1cInt7aGVscFRleHR9fVwiXG4gICAgICAgICAgbWF0VG9vbHRpcFBvc2l0aW9uPVwiYWJvdmVcIj5oZWxwX291dGxpbmVcbiAgICA8L3NwYW4+XG4gIGAsXG4gIHN0eWxlczogWyBgXG4gICAgLnBvcC1maWVsZC1pdGVtLWhlbHAtdGV4dCB7XG4gICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICBmb250LXNpemU6IDEuNWVtO1xuICAgICAgY29sb3I6IHZhcigtLXRleHQtZGlzYWJsZWQpO1xuICAgICAgei1pbmRleDogMjtcbiAgICB9YCBdXG59KVxuZXhwb3J0IGNsYXNzIFBvcEZpZWxkSXRlbUhlbHBlckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIEBJbnB1dCgpIGhlbHBUZXh0O1xuICBASG9zdEJpbmRpbmcoJ2NsYXNzLnN3LWhpZGRlbicpIEBJbnB1dCgpIGhpZGRlbiA9IGZhbHNlO1xuICBoZWxwZXI7XG5cblxuICBjb25zdHJ1Y3Rvcigpe1xuICAgIGlmKCAhdGhpcy5oZWxwVGV4dCApIHRoaXMuaGVscFRleHQgPSAnJztcbiAgfVxuXG5cbiAgbmdPbkluaXQoKXtcbiAgfVxuXG59XG4iXX0=