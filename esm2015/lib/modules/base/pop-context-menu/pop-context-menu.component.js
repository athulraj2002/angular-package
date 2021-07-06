import { Component, Input, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
export class PopContextMenuComponent {
    constructor() {
    }
    ngOnInit() {
        this.config.toggle.subscribe(active => {
            if (active)
                this.trigger.openMenu();
            if (!active)
                this.trigger.closeMenu();
        });
    }
    onMenuClick(option) {
        if (option.type === 'new_tab')
            window.open(option.url, '_blank');
        if (option.type === 'portal')
            this.config.emitter.emit({
                source: 'PopContextMenuComponent',
                type: 'context_menu',
                name: 'portal',
                open: true,
                internal_name: option.metadata.internal_name,
                id: option.metadata.id,
                option: option
            });
    }
}
PopContextMenuComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-context-menu',
                template: "<mat-menu #menu=\"matMenu\" >\n    <button *ngFor=\"let option of config.options\" mat-menu-item (click)=\"onMenuClick(option)\">\n        {{option.label}}\n    </button>\n</mat-menu>\n\n<div class=\"pcm-trigger-button\" [matMenuTriggerFor]=\"menu\" [ngStyle]=\"{'left.px': config.x, 'top.px': config.y}\" ></div>",
                styles: [".pcm-trigger-button{position:fixed}"]
            },] }
];
PopContextMenuComponent.ctorParameters = () => [];
PopContextMenuComponent.propDecorators = {
    config: [{ type: Input }],
    trigger: [{ type: ViewChild, args: [MatMenuTrigger, { static: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWNvbnRleHQtbWVudS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC1jb250ZXh0LW1lbnUvcG9wLWNvbnRleHQtbWVudS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBVSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQVN4RCxNQUFNLE9BQU8sdUJBQXVCO0lBS2xDO0lBQ0EsQ0FBQztJQUdELFFBQVE7UUFDTixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDcEMsSUFBSSxNQUFNO2dCQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLE1BQU07Z0JBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN6QyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFHTSxXQUFXLENBQUMsTUFBNEI7UUFDN0MsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLFNBQVM7WUFBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbEUsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLFFBQVE7WUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQ3RELE1BQU0sRUFBRSx5QkFBeUI7Z0JBQ2pDLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUUsSUFBSTtnQkFDVixhQUFhLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhO2dCQUM1QyxFQUFFLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN0QixNQUFNLEVBQUUsTUFBTTthQUNmLENBQUMsQ0FBQztJQUNMLENBQUM7OztZQWpDRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHNCQUFzQjtnQkFDaEMscVVBQWdEOzthQUVqRDs7OztxQkFFRSxLQUFLO3NCQUNMLFNBQVMsU0FBQyxjQUFjLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQsIElucHV0LCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE1hdE1lbnVUcmlnZ2VyIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvbWVudSc7XG5pbXBvcnQgeyBQb3BDb250ZXh0TWVudUNvbmZpZywgUG9wQ29udGV4dE1lbnVPcHRpb24gfSBmcm9tICcuL3BvcC1jb250ZXh0LW1lbnUubW9kZWwnO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtY29udGV4dC1tZW51JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1jb250ZXh0LW1lbnUuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWNvbnRleHQtbWVudS5jb21wb25lbnQuc2NzcycgXVxufSlcbmV4cG9ydCBjbGFzcyBQb3BDb250ZXh0TWVudUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIEBJbnB1dCgpIGNvbmZpZzogUG9wQ29udGV4dE1lbnVDb25maWc7XG4gIEBWaWV3Q2hpbGQoTWF0TWVudVRyaWdnZXIsIHsgc3RhdGljOiB0cnVlIH0pIHRyaWdnZXI6IE1hdE1lbnVUcmlnZ2VyO1xuXG5cbiAgY29uc3RydWN0b3IoKXtcbiAgfVxuXG5cbiAgbmdPbkluaXQoKXtcbiAgICB0aGlzLmNvbmZpZy50b2dnbGUuc3Vic2NyaWJlKGFjdGl2ZSA9PiB7XG4gICAgICBpZiggYWN0aXZlICkgdGhpcy50cmlnZ2VyLm9wZW5NZW51KCk7XG4gICAgICBpZiggIWFjdGl2ZSApIHRoaXMudHJpZ2dlci5jbG9zZU1lbnUoKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgcHVibGljIG9uTWVudUNsaWNrKG9wdGlvbjogUG9wQ29udGV4dE1lbnVPcHRpb24pe1xuICAgIGlmKCBvcHRpb24udHlwZSA9PT0gJ25ld190YWInICkgd2luZG93Lm9wZW4ob3B0aW9uLnVybCwgJ19ibGFuaycpO1xuICAgIGlmKCBvcHRpb24udHlwZSA9PT0gJ3BvcnRhbCcgKSB0aGlzLmNvbmZpZy5lbWl0dGVyLmVtaXQoe1xuICAgICAgc291cmNlOiAnUG9wQ29udGV4dE1lbnVDb21wb25lbnQnLFxuICAgICAgdHlwZTogJ2NvbnRleHRfbWVudScsXG4gICAgICBuYW1lOiAncG9ydGFsJyxcbiAgICAgIG9wZW46IHRydWUsXG4gICAgICBpbnRlcm5hbF9uYW1lOiBvcHRpb24ubWV0YWRhdGEuaW50ZXJuYWxfbmFtZSxcbiAgICAgIGlkOiBvcHRpb24ubWV0YWRhdGEuaWQsXG4gICAgICBvcHRpb246IG9wdGlvblxuICAgIH0pO1xuICB9XG5cbn1cbiJdfQ==