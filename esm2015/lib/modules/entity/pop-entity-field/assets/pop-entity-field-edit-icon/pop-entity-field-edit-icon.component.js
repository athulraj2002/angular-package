import { Component, EventEmitter, Input, Output } from '@angular/core';
export class PopEntityFieldEditIconComponent {
    constructor() {
        this.events = new EventEmitter();
    }
    ngOnInit() {
    }
    onEdit() {
        this.dom.state.open = true;
        this.field.state = 'template_edit';
        this.events.emit({ source: 'PopEntityFieldEditIconComponent', type: 'field', name: 'edit', field: this.field });
    }
}
PopEntityFieldEditIconComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-field-edit-icon',
                template: "<mat-icon class=\"sw-pointer\" (click)=\"onEdit();\" [ngClass]=\"{'sw-disabled':this.dom.state.open}\">\n  edit\n</mat-icon>\n\n",
                styles: [""]
            },] }
];
PopEntityFieldEditIconComponent.ctorParameters = () => [];
PopEntityFieldEditIconComponent.propDecorators = {
    dom: [{ type: Input }],
    field: [{ type: Input }],
    events: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1maWVsZC1lZGl0LWljb24uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktZmllbGQvYXNzZXRzL3BvcC1lbnRpdHktZmllbGQtZWRpdC1pY29uL3BvcC1lbnRpdHktZmllbGQtZWRpdC1pY29uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQVUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBUy9FLE1BQU0sT0FBTywrQkFBK0I7SUFNMUM7UUFIVSxXQUFNLEdBQXdDLElBQUksWUFBWSxFQUF5QixDQUFDO0lBSWxHLENBQUM7SUFHRCxRQUFRO0lBQ1IsQ0FBQztJQUdELE1BQU07UUFDSixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLGVBQWUsQ0FBQztRQUNuQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxpQ0FBaUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ2xILENBQUM7OztZQXZCRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGdDQUFnQztnQkFDMUMsNElBQTBEOzthQUUzRDs7OztrQkFFRSxLQUFLO29CQUNMLEtBQUs7cUJBQ0wsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRXZlbnRFbWl0dGVyLCBJbnB1dCwgT25Jbml0LCBPdXRwdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZpZWxkQ29uZmlnLCBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWVudGl0eS1maWVsZC1lZGl0LWljb24nLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLWVudGl0eS1maWVsZC1lZGl0LWljb24uY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWVudGl0eS1maWVsZC1lZGl0LWljb24uY29tcG9uZW50LnNjc3MnIF1cbn0pXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5RmllbGRFZGl0SWNvbkNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIEBJbnB1dCgpIGRvbTtcbiAgQElucHV0KCkgZmllbGQ6IEZpZWxkQ29uZmlnO1xuICBAT3V0cHV0KCkgZXZlbnRzOiBFdmVudEVtaXR0ZXI8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPiA9IG5ldyBFdmVudEVtaXR0ZXI8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPigpO1xuXG5cbiAgY29uc3RydWN0b3IoKXtcbiAgfVxuXG5cbiAgbmdPbkluaXQoKXtcbiAgfVxuXG5cbiAgb25FZGl0KCl7XG4gICAgdGhpcy5kb20uc3RhdGUub3BlbiA9IHRydWU7XG4gICAgdGhpcy5maWVsZC5zdGF0ZSA9ICd0ZW1wbGF0ZV9lZGl0JztcbiAgICB0aGlzLmV2ZW50cy5lbWl0KHsgc291cmNlOiAnUG9wRW50aXR5RmllbGRFZGl0SWNvbkNvbXBvbmVudCcsIHR5cGU6ICdmaWVsZCcsIG5hbWU6ICdlZGl0JywgZmllbGQ6IHRoaXMuZmllbGQgfSk7XG4gIH1cblxufVxuIl19