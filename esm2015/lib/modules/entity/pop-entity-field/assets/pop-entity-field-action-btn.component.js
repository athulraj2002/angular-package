import { Component, EventEmitter, Inject, Input, Output, } from '@angular/core';
import { TitleCase } from '../../../../pop-common-utility';
export class PopEntityFieldActionBtnComponent {
    constructor(env) {
        this.env = env;
        this.events = new EventEmitter();
    }
    ngOnInit() {
        if (!this.action)
            this.action = 'add';
        this.tooltip = TitleCase(this.action);
    }
    callAction() {
        this.events.emit({ source: 'PopEntityFieldActionBtnComponent', type: 'field', name: this.action, field: this.field });
    }
    ngOnDestroy() {
    }
}
PopEntityFieldActionBtnComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-field-btn',
                template: `
    <div class="field-action-btn" *ngIf="field.multiple">
      <mat-icon class="sw-pointer" matTooltip="{{tooltip}}" matTooltipPosition="above" (click)="callAction();">{{action}}</mat-icon>
    </div>
  `,
                styles: ['.field-doAction-btn {background: var(--bg-1);border-radius: 50%;width: 14px;height: 14px; mar-top:2px; color: var(--accent);border-width: 1px;border-style: solid;border-color: var(--bg-3);box-shadow: 0 2px 5px 0 var(--darken18), 0 2px 10px 0 var(--darken12) !important; } .field-doAction-btn mat-icon {position:relative; top:-2px; left:1px; width: 12px;height: 12px;font-size: 12px;line-height: 16px;}']
            },] }
];
PopEntityFieldActionBtnComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: ['env',] }] }
];
PopEntityFieldActionBtnComponent.propDecorators = {
    field: [{ type: Input }],
    action: [{ type: Input }],
    events: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1maWVsZC1hY3Rpb24tYnRuLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LWZpZWxkL2Fzc2V0cy9wb3AtZW50aXR5LWZpZWxkLWFjdGlvbi1idG4uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQUUsWUFBWSxFQUN2QixNQUFNLEVBQ04sS0FBSyxFQUVHLE1BQU0sR0FDZixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFZM0QsTUFBTSxPQUFPLGdDQUFnQztJQVMzQyxZQUMwQixHQUFJO1FBQUosUUFBRyxHQUFILEdBQUcsQ0FBQztRQVBwQixXQUFNLEdBQXdDLElBQUksWUFBWSxFQUF5QixDQUFDO0lBU2xHLENBQUM7SUFHRCxRQUFRO1FBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNO1lBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDdkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFHRCxVQUFVO1FBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsa0NBQWtDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDeEgsQ0FBQztJQUdELFdBQVc7SUFDWCxDQUFDOzs7WUFwQ0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxtQkFBbUI7Z0JBQzdCLFFBQVEsRUFBRTs7OztHQUlUO3lCQUNTLG1aQUFtWjthQUM5Wjs7OzRDQVdJLE1BQU0sU0FBQyxLQUFLOzs7b0JBVGQsS0FBSztxQkFDTCxLQUFLO3FCQUNMLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21wb25lbnQsIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsIE91dHB1dCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGaWVsZENvbmZpZywgUG9wQmFzZUV2ZW50SW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBUaXRsZUNhc2UgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtZmllbGQtYnRuJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8ZGl2IGNsYXNzPVwiZmllbGQtYWN0aW9uLWJ0blwiICpuZ0lmPVwiZmllbGQubXVsdGlwbGVcIj5cbiAgICAgIDxtYXQtaWNvbiBjbGFzcz1cInN3LXBvaW50ZXJcIiBtYXRUb29sdGlwPVwie3t0b29sdGlwfX1cIiBtYXRUb29sdGlwUG9zaXRpb249XCJhYm92ZVwiIChjbGljayk9XCJjYWxsQWN0aW9uKCk7XCI+e3thY3Rpb259fTwvbWF0LWljb24+XG4gICAgPC9kaXY+XG4gIGAsXG4gIHN0eWxlczogWyAnLmZpZWxkLWRvQWN0aW9uLWJ0biB7YmFja2dyb3VuZDogdmFyKC0tYmctMSk7Ym9yZGVyLXJhZGl1czogNTAlO3dpZHRoOiAxNHB4O2hlaWdodDogMTRweDsgbWFyLXRvcDoycHg7IGNvbG9yOiB2YXIoLS1hY2NlbnQpO2JvcmRlci13aWR0aDogMXB4O2JvcmRlci1zdHlsZTogc29saWQ7Ym9yZGVyLWNvbG9yOiB2YXIoLS1iZy0zKTtib3gtc2hhZG93OiAwIDJweCA1cHggMCB2YXIoLS1kYXJrZW4xOCksIDAgMnB4IDEwcHggMCB2YXIoLS1kYXJrZW4xMikgIWltcG9ydGFudDsgfSAuZmllbGQtZG9BY3Rpb24tYnRuIG1hdC1pY29uIHtwb3NpdGlvbjpyZWxhdGl2ZTsgdG9wOi0ycHg7IGxlZnQ6MXB4OyB3aWR0aDogMTJweDtoZWlnaHQ6IDEycHg7Zm9udC1zaXplOiAxMnB4O2xpbmUtaGVpZ2h0OiAxNnB4O30nIF1cbn0pXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5RmllbGRBY3Rpb25CdG5Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGZpZWxkOiBGaWVsZENvbmZpZztcbiAgQElucHV0KCkgYWN0aW9uOiAnYWRkJyB8ICdyZW1vdmUnO1xuICBAT3V0cHV0KCkgZXZlbnRzOiBFdmVudEVtaXR0ZXI8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPiA9IG5ldyBFdmVudEVtaXR0ZXI8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPigpO1xuXG4gIGljb246IHN0cmluZztcbiAgdG9vbHRpcDogc3RyaW5nO1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdCgnZW52JykgcmVhZG9ubHkgZW52P1xuICApe1xuICB9XG5cblxuICBuZ09uSW5pdCgpe1xuICAgIGlmKCAhdGhpcy5hY3Rpb24gKSB0aGlzLmFjdGlvbiA9ICdhZGQnO1xuICAgIHRoaXMudG9vbHRpcCA9IFRpdGxlQ2FzZSh0aGlzLmFjdGlvbik7XG4gIH1cblxuXG4gIGNhbGxBY3Rpb24oKXtcbiAgICB0aGlzLmV2ZW50cy5lbWl0KHsgc291cmNlOiAnUG9wRW50aXR5RmllbGRBY3Rpb25CdG5Db21wb25lbnQnLCB0eXBlOiAnZmllbGQnLCBuYW1lOiB0aGlzLmFjdGlvbiwgZmllbGQ6IHRoaXMuZmllbGQgfSk7XG4gIH1cblxuXG4gIG5nT25EZXN0cm95KCl7XG4gIH1cbn1cblxuIl19