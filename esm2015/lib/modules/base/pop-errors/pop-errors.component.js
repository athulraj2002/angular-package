import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorComponent } from './error/error.component';
export class PopErrorsComponent {
    constructor(dialog) {
        this.dialog = dialog;
    }
    ngAfterViewInit() {
        setTimeout(() => {
            this.loadErrorDialog();
        }, 500);
    }
    loadErrorDialog() {
        this.dialog.open(ErrorComponent, { data: { code: this.error.code, message: this.error.message } });
    }
}
PopErrorsComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-errors',
                template: "",
                styles: [""]
            },] }
];
PopErrorsComponent.ctorParameters = () => [
    { type: MatDialog }
];
PopErrorsComponent.propDecorators = {
    error: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVycm9ycy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC1lcnJvcnMvcG9wLWVycm9ycy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2hFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFPekQsTUFBTSxPQUFPLGtCQUFrQjtJQUk3QixZQUFtQixNQUFpQjtRQUFqQixXQUFNLEdBQU4sTUFBTSxDQUFXO0lBQUUsQ0FBQztJQUV2QyxlQUFlO1FBQ2IsVUFBVSxDQUFDLEdBQUUsRUFBRTtZQUNiLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN6QixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDVixDQUFDO0lBRUQsZUFBZTtRQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFFLENBQUM7SUFDdEcsQ0FBQzs7O1lBbkJGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsZ0JBQWdCO2dCQUMxQixZQUEwQzs7YUFFM0M7OztZQVBRLFNBQVM7OztvQkFVZixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJWaWV3SW5pdCwgQ29tcG9uZW50LCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTWF0RGlhbG9nIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGlhbG9nJztcbmltcG9ydCB7IEVycm9yQ29tcG9uZW50IH0gZnJvbSAnLi9lcnJvci9lcnJvci5jb21wb25lbnQnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWVycm9ycycsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3AtZXJyb3JzLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vcG9wLWVycm9ycy5jb21wb25lbnQuc2NzcyddXG59KVxuZXhwb3J0IGNsYXNzIFBvcEVycm9yc0NvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXR7XG5cbiAgQElucHV0KCkgZXJyb3I6IHsgY29kZTpudW1iZXIsIG1lc3NhZ2U6c3RyaW5nIH07XG5cbiAgY29uc3RydWN0b3IocHVibGljIGRpYWxvZzogTWF0RGlhbG9nKXt9XG5cbiAgbmdBZnRlclZpZXdJbml0KCl7XG4gICAgc2V0VGltZW91dCgoKT0+e1xuICAgICAgdGhpcy5sb2FkRXJyb3JEaWFsb2coKTtcbiAgICB9LCA1MDApO1xuICB9XG5cbiAgbG9hZEVycm9yRGlhbG9nKCl7XG4gICAgdGhpcy5kaWFsb2cub3BlbihFcnJvckNvbXBvbmVudCwgeyBkYXRhOiB7IGNvZGU6IHRoaXMuZXJyb3IuY29kZSwgbWVzc2FnZTogdGhpcy5lcnJvci5tZXNzYWdlIH0gfSApO1xuICB9XG59XG4iXX0=