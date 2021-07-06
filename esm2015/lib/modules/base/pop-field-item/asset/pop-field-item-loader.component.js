import { Component, Input } from '@angular/core';
export class PopFieldItemLoaderComponent {
    constructor() {
        this.show = false;
    }
    ngOnInit() {
    }
}
PopFieldItemLoaderComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-field-item-loader',
                template: `
    <mat-progress-bar
      class="pop-field-item-loader"
      *ngIf="show"
      [style.height.px]="1"
      [mode]="'query'"
    >
    </mat-progress-bar>
  `,
                styles: [':host { position: absolute; bottom:0; left: 0; right: 0 }']
            },] }
];
PopFieldItemLoaderComponent.propDecorators = {
    show: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWZpZWxkLWl0ZW0tbG9hZGVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vYXNzZXQvcG9wLWZpZWxkLWl0ZW0tbG9hZGVyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBVSxNQUFNLGVBQWUsQ0FBQztBQWdCekQsTUFBTSxPQUFPLDJCQUEyQjtJQWJ4QztRQWNXLFNBQUksR0FBRyxLQUFLLENBQUM7SUFNeEIsQ0FBQztJQUhDLFFBQVE7SUFDUixDQUFDOzs7WUFsQkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSwyQkFBMkI7Z0JBQ3JDLFFBQVEsRUFBRTs7Ozs7Ozs7R0FRVDt5QkFDUywyREFBMkQ7YUFDdEU7OzttQkFFRSxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC1maWVsZC1pdGVtLWxvYWRlcicsXG4gIHRlbXBsYXRlOiBgXG4gICAgPG1hdC1wcm9ncmVzcy1iYXJcbiAgICAgIGNsYXNzPVwicG9wLWZpZWxkLWl0ZW0tbG9hZGVyXCJcbiAgICAgICpuZ0lmPVwic2hvd1wiXG4gICAgICBbc3R5bGUuaGVpZ2h0LnB4XT1cIjFcIlxuICAgICAgW21vZGVdPVwiJ3F1ZXJ5J1wiXG4gICAgPlxuICAgIDwvbWF0LXByb2dyZXNzLWJhcj5cbiAgYCxcbiAgc3R5bGVzOiBbICc6aG9zdCB7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgYm90dG9tOjA7IGxlZnQ6IDA7IHJpZ2h0OiAwIH0nIF1cbn0pXG5leHBvcnQgY2xhc3MgUG9wRmllbGRJdGVtTG9hZGVyQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgQElucHV0KCkgc2hvdyA9IGZhbHNlO1xuXG5cbiAgbmdPbkluaXQoKXtcbiAgfVxuXG59XG4iXX0=