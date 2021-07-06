import { Directive, ViewContainerRef } from '@angular/core';
import { ServiceInjector } from '../pop-common.model';
import { PopContainerService } from '../services/pop-container.service';
export class LibContainerDirective {
    constructor(vc) {
        this.templateContainerRepo = ServiceInjector.get(PopContainerService);
        this.templateContainerRepo.registerContainer(vc);
    }
}
LibContainerDirective.decorators = [
    { type: Directive, args: [{
                selector: '[libContainer]',
            },] }
];
LibContainerDirective.ctorParameters = () => [
    { type: ViewContainerRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGliLWNvbnRhaW5lci5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvZGlyZWN0aXZlcy9saWItY29udGFpbmVyLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzVELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN0RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQU94RSxNQUFNLE9BQU8scUJBQXFCO0lBRWhDLFlBQ0UsRUFBb0I7UUFFcEIsSUFBSSxDQUFDLHFCQUFxQixHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMscUJBQXFCLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbkQsQ0FBQzs7O1lBWEYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxnQkFBZ0I7YUFDM0I7OztZQVBtQixnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIFZpZXdDb250YWluZXJSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFNlcnZpY2VJbmplY3RvciB9IGZyb20gJy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgUG9wQ29udGFpbmVyU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL3BvcC1jb250YWluZXIuc2VydmljZSc7XG5cblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2xpYkNvbnRhaW5lcl0nLFxufSlcblxuZXhwb3J0IGNsYXNzIExpYkNvbnRhaW5lckRpcmVjdGl2ZSB7XG4gIHByaXZhdGUgdGVtcGxhdGVDb250YWluZXJSZXBvOiBQb3BDb250YWluZXJTZXJ2aWNlO1xuICBjb25zdHJ1Y3RvcihcbiAgICB2YzogVmlld0NvbnRhaW5lclJlZixcbiAgKXtcbiAgICB0aGlzLnRlbXBsYXRlQ29udGFpbmVyUmVwbyA9IFNlcnZpY2VJbmplY3Rvci5nZXQoUG9wQ29udGFpbmVyU2VydmljZSk7XG4gICAgdGhpcy50ZW1wbGF0ZUNvbnRhaW5lclJlcG8ucmVnaXN0ZXJDb250YWluZXIodmMpO1xuICB9XG59XG4iXX0=