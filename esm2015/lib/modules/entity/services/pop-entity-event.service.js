import { EventEmitter, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class PopEntityEventService {
    constructor() {
        this.events = new EventEmitter();
    }
    sendEvent(event) {
        this.events.emit(event);
    }
}
PopEntityEventService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopEntityEventService_Factory() { return new PopEntityEventService(); }, token: PopEntityEventService, providedIn: "root" });
PopEntityEventService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1ldmVudC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3NlcnZpY2VzL3BvcC1lbnRpdHktZXZlbnQuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7QUFJekQsTUFBTSxPQUFPLHFCQUFxQjtJQURsQztRQUVFLFdBQU0sR0FBd0MsSUFBSSxZQUFZLEVBQXlCLENBQUM7S0FJekY7SUFIQyxTQUFTLENBQUMsS0FBNEI7UUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUIsQ0FBQzs7OztZQUxGLFVBQVUsU0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudEVtaXR0ZXIsIEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFBvcEJhc2VFdmVudEludGVyZmFjZSB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIFBvcEVudGl0eUV2ZW50U2VydmljZSB7XG4gIGV2ZW50czogRXZlbnRFbWl0dGVyPFBvcEJhc2VFdmVudEludGVyZmFjZT4gPSBuZXcgRXZlbnRFbWl0dGVyPFBvcEJhc2VFdmVudEludGVyZmFjZT4oKTtcbiAgc2VuZEV2ZW50KGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2Upe1xuICAgIHRoaXMuZXZlbnRzLmVtaXQoZXZlbnQpO1xuICB9XG59XG5cblxuXG4iXX0=