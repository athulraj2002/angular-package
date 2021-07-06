import { Component, HostBinding, Input } from '@angular/core';
export class PopFieldItemErrorComponent {
    constructor() {
        this.hidden = false;
        if (!this.message)
            this.message = '';
    }
    ngOnInit() {
    }
}
PopFieldItemErrorComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-field-item-error',
                template: `
    <div class="sw-pointer pop-field-item-error"
         *ngIf="!hidden && message"
         matTooltipPosition="left"
         [matTooltip]=message>
      <mat-icon color="warn">error</mat-icon>
    </div>
  `,
                styles: [`.pop-field-item-error {
    width: 20px;
    height: 20px;
    font-size: 1.1em;
    z-index: 2;
  }`]
            },] }
];
PopFieldItemErrorComponent.ctorParameters = () => [];
PopFieldItemErrorComponent.propDecorators = {
    message: [{ type: Input }],
    hidden: [{ type: HostBinding, args: ['class.sw-hidden',] }, { type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWZpZWxkLWl0ZW0tZXJyb3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtZmllbGQtaXRlbS9hc3NldC9wb3AtZmllbGQtaXRlbS1lcnJvci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBb0J0RSxNQUFNLE9BQU8sMEJBQTBCO0lBTXJDO1FBSnlDLFdBQU0sR0FBRyxLQUFLLENBQUM7UUFLdEQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDeEMsQ0FBQztJQUdELFFBQVE7SUFDUixDQUFDOzs7WUE3QkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSwwQkFBMEI7Z0JBQ3BDLFFBQVEsRUFBRTs7Ozs7OztHQU9UO3lCQUNTOzs7OztJQUtSO2FBQ0g7Ozs7c0JBRUUsS0FBSztxQkFDTCxXQUFXLFNBQUMsaUJBQWlCLGNBQUcsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSG9zdEJpbmRpbmcsIElucHV0LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWZpZWxkLWl0ZW0tZXJyb3InLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxkaXYgY2xhc3M9XCJzdy1wb2ludGVyIHBvcC1maWVsZC1pdGVtLWVycm9yXCJcbiAgICAgICAgICpuZ0lmPVwiIWhpZGRlbiAmJiBtZXNzYWdlXCJcbiAgICAgICAgIG1hdFRvb2x0aXBQb3NpdGlvbj1cImxlZnRcIlxuICAgICAgICAgW21hdFRvb2x0aXBdPW1lc3NhZ2U+XG4gICAgICA8bWF0LWljb24gY29sb3I9XCJ3YXJuXCI+ZXJyb3I8L21hdC1pY29uPlxuICAgIDwvZGl2PlxuICBgLFxuICBzdHlsZXM6IFsgYC5wb3AtZmllbGQtaXRlbS1lcnJvciB7XG4gICAgd2lkdGg6IDIwcHg7XG4gICAgaGVpZ2h0OiAyMHB4O1xuICAgIGZvbnQtc2l6ZTogMS4xZW07XG4gICAgei1pbmRleDogMjtcbiAgfWAgXVxufSlcbmV4cG9ydCBjbGFzcyBQb3BGaWVsZEl0ZW1FcnJvckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIEBJbnB1dCgpIG1lc3NhZ2U6IHN0cmluZztcbiAgQEhvc3RCaW5kaW5nKCdjbGFzcy5zdy1oaWRkZW4nKSBASW5wdXQoKSBoaWRkZW4gPSBmYWxzZTtcbiAgaGVscGVyO1xuXG5cbiAgY29uc3RydWN0b3IoKXtcbiAgICBpZiggIXRoaXMubWVzc2FnZSApIHRoaXMubWVzc2FnZSA9ICcnO1xuICB9XG5cblxuICBuZ09uSW5pdCgpe1xuICB9XG5cbn1cbiJdfQ==