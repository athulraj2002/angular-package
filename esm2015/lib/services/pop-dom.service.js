import { Injectable } from '@angular/core';
import { IsObject, PopUid } from '../pop-common-utility';
import * as i0 from "@angular/core";
export class PopDomService {
    constructor() {
        this.id = PopUid();
        this.name = 'PopDomService';
        this.asset = {
            sessionKeys: { height: 1, width: 1, state: 1, active: 1, session: 1 },
            map: {}
        };
        this.ui = {
            active: {},
            fields: new Map(),
            map: {}
        };
        this.position = {};
        this.map = {};
        this.components = {};
    }
    onRegister(component) {
        if (component.name && typeof component.id !== 'undefined' && component.dom) {
            if (this.components[component.name] && this.components[component.name][component.id]) {
                this.applyDomKeys(component);
            }
            else {
                this.createDomSession(component);
            }
        }
    }
    onSession(dom, key = null) {
        if (dom.name && dom.id) {
            this.sessionDomKeys(dom, key);
        }
    }
    getComponentHeight(component, componentId = 1) {
        return this.components[component] && this.components[component][componentId] && IsObject(this.components[component][componentId].height, true) ? this.components[component][componentId].height : null;
    }
    getComponentWidth(component, componentId = 1) {
        return this.components[component] && this.components[component][componentId] && IsObject(this.components[component][componentId].width, true) ? this.components[component][componentId].width : null;
    }
    getComponentSession(component, componentId = 1) {
        return this.components[component] && this.components[component][componentId] && IsObject(this.components[component][componentId].onSession, true) ? this.components[component][componentId].onSession : null;
    }
    onDetach(name, id) {
        if (name && id) {
            if (this.components[name] && this.components[name][id]) {
                delete this.components[name][id];
            }
        }
    }
    ngOnDestroy() {
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    createDomSession(component) {
        if (component.name && typeof component.id !== 'undefined') {
            if (!this.components[component.name])
                this.components[component.name] = {};
            if (!this.components[component.name][component.id])
                this.components[component.name][component.id] = {};
            // if( dom.emitter instanceof EventEmitter ) this.components[ dom.name ][ dom.entityId ].emitter = dom.emitter;
            this.sessionDomKeys(component);
        }
    }
    applyDomKeys(component) {
        if (this.components[component.name] && this.components[component.name][component.id]) {
            Object.keys(this.components[component.name][component.id]).map((key) => {
                if (key && this.asset.sessionKeys[key]) {
                    component.dom[key] = this.components[component.name][component.id][key];
                }
            });
        }
    }
    sessionDomKeys(component, key = null) {
        if (this.components[component.name] && this.components[component.name][component.id]) {
            if (key && key in this.asset.sessionKeys) {
                if (IsObject(component.dom[key], true)) {
                    this.components[component.name][component.id][key] = component.dom[key];
                }
            }
            else {
                Object.keys(this.asset.sessionKeys).map((sessionKey) => {
                    if (IsObject(component.dom[sessionKey], true)) {
                        this.components[component.name][component.id][sessionKey] = component.dom[sessionKey];
                    }
                });
            }
        }
    }
}
PopDomService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopDomService_Factory() { return new PopDomService(); }, token: PopDomService, providedIn: "root" });
PopDomService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopDomService.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWRvbS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBRXBELE9BQU8sRUFBQyxRQUFRLEVBQUUsTUFBTSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7O0FBVXZELE1BQU0sT0FBTyxhQUFhO0lBZ0N4QjtRQS9CUSxPQUFFLEdBQW9CLE1BQU0sRUFBRSxDQUFDO1FBRS9CLFNBQUksR0FBRyxlQUFlLENBQUM7UUFFdkIsVUFBSyxHQUdUO1lBQ0YsV0FBVyxFQUFFLEVBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFDO1lBQ25FLEdBQUcsRUFBRSxFQUFFO1NBQ1IsQ0FBQztRQU1LLE9BQUUsR0FLTDtZQUNGLE1BQU0sRUFBRSxFQUFFO1lBQ1YsTUFBTSxFQUFFLElBQUksR0FBRyxFQUFFO1lBQ2pCLEdBQUcsRUFBRSxFQUFFO1NBQ1IsQ0FBQztRQUNLLGFBQVEsR0FBRyxFQUFFLENBQUM7UUFDZCxRQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ1QsZUFBVSxHQUFvQixFQUFFLENBQUM7SUFJeEMsQ0FBQztJQUdELFVBQVUsQ0FBQyxTQUFjO1FBQ3ZCLElBQUksU0FBUyxDQUFDLElBQUksSUFBSSxPQUFPLFNBQVMsQ0FBQyxFQUFFLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDMUUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FB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SyxDQUFDLFdBQVcsRUFBRTtnQkFDeEMsSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRTtvQkFDdEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3pFO2FBRUY7aUJBQU07Z0JBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQWtCLEVBQUUsRUFBRTtvQkFDN0QsSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRTt3QkFDN0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7cUJBQ3ZGO2dCQUNILENBQUMsQ0FBQyxDQUFDO2FBQ0o7U0FDRjtJQUNILENBQUM7Ozs7WUFoSUYsVUFBVSxTQUFDO2dCQUNWLFVBQVUsRUFBRSxNQUFNO2FBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlLCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtQb3BMb2dTZXJ2aWNlfSBmcm9tICcuL3BvcC1sb2cuc2VydmljZSc7XG5pbXBvcnQge0lzT2JqZWN0LCBQb3BVaWR9IGZyb20gJy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQge1xuICBDb21wb25lbnREb21JbnRlcmZhY2UsXG59IGZyb20gJy4uL3BvcC1jb21tb24tZG9tLm1vZGVscyc7XG5pbXBvcnQge0RpY3Rpb25hcnl9IGZyb20gJy4uL3BvcC1jb21tb24ubW9kZWwnO1xuXG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIFBvcERvbVNlcnZpY2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIGlkOiBudW1iZXIgfCBzdHJpbmcgPSBQb3BVaWQoKTtcblxuICBwcml2YXRlIG5hbWUgPSAnUG9wRG9tU2VydmljZSc7XG5cbiAgcHJpdmF0ZSBhc3NldDoge1xuICAgIHNlc3Npb25LZXlzOiBEaWN0aW9uYXJ5PG51bWJlcj5cbiAgICBtYXA6IERpY3Rpb25hcnk8YW55PlxuICB9ID0ge1xuICAgIHNlc3Npb25LZXlzOiB7aGVpZ2h0OiAxLCB3aWR0aDogMSwgc3RhdGU6IDEsIGFjdGl2ZTogMSwgc2Vzc2lvbjogMX0sXG4gICAgbWFwOiB7fVxuICB9O1xuXG4gIHByb3RlY3RlZCBzcnY6IHtcbiAgICBsb2c6IFBvcExvZ1NlcnZpY2UsXG4gIH07XG5cbiAgcHVibGljIHVpOiB7XG4gICAgYWN0aXZlOiBEaWN0aW9uYXJ5PGFueT47XG4gICAgZmllbGRzOiBNYXA8bnVtYmVyIHwgc3RyaW5nLCBhbnk+LFxuICAgIG1hcDogRGljdGlvbmFyeTxhbnk+XG4gICAgW2tleTogc3RyaW5nXTogYW55O1xuICB9ID0ge1xuICAgIGFjdGl2ZToge30sXG4gICAgZmllbGRzOiBuZXcgTWFwKCksXG4gICAgbWFwOiB7fVxuICB9O1xuICBwdWJsaWMgcG9zaXRpb24gPSB7fTtcbiAgcHVibGljIG1hcCA9IHt9O1xuICBwdWJsaWMgY29tcG9uZW50czogRGljdGlvbmFyeTxhbnk+ID0ge307XG5cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgfVxuXG5cbiAgb25SZWdpc3Rlcihjb21wb25lbnQ6IGFueSkge1xuICAgIGlmIChjb21wb25lbnQubmFtZSAmJiB0eXBlb2YgY29tcG9uZW50LmlkICE9PSAndW5kZWZpbmVkJyAmJiBjb21wb25lbnQuZG9tKSB7XG4gICAgICBpZiAodGhpcy5jb21wb25lbnRzW2NvbXBvbmVudC5uYW1lXSAmJiB0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50Lm5hbWVdW2NvbXBvbmVudC5pZF0pIHtcbiAgICAgICAgdGhpcy5hcHBseURvbUtleXMoY29tcG9uZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY3JlYXRlRG9tU2Vzc2lvbihjb21wb25lbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgb25TZXNzaW9uKGRvbTogYW55LCBrZXk6IHN0cmluZyA9IG51bGwpIHtcbiAgICBpZiAoZG9tLm5hbWUgJiYgZG9tLmlkKSB7XG4gICAgICB0aGlzLnNlc3Npb25Eb21LZXlzKGRvbSwga2V5KTtcbiAgICB9XG4gIH1cblxuXG4gIGdldENvbXBvbmVudEhlaWdodChjb21wb25lbnQ6IHN0cmluZywgY29tcG9uZW50SWQ6IG51bWJlciA9IDEpIHtcbiAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzW2NvbXBvbmVudF0gJiYgdGhpcy5jb21wb25lbnRzW2NvbXBvbmVudF1bY29tcG9uZW50SWRdICYmIElzT2JqZWN0KHRoaXMuY29tcG9uZW50c1tjb21wb25lbnRdW2NvbXBvbmVudElkXS5oZWlnaHQsIHRydWUpID8gdGhpcy5jb21wb25lbnRzW2NvbXBvbmVudF1bY29tcG9uZW50SWRdLmhlaWdodCA6IG51bGw7XG4gIH1cblxuXG4gIGdldENvbXBvbmVudFdpZHRoKGNvbXBvbmVudDogc3RyaW5nLCBjb21wb25lbnRJZDogbnVtYmVyID0gMSkge1xuICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50XSAmJiB0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50XVtjb21wb25lbnRJZF0gJiYgSXNPYmplY3QodGhpcy5jb21wb25lbnRzW2NvbXBvbmVudF1bY29tcG9uZW50SWRdLndpZHRoLCB0cnVlKSA/IHRoaXMuY29tcG9uZW50c1tjb21wb25lbnRdW2NvbXBvbmVudElkXS53aWR0aCA6IG51bGw7XG4gIH1cblxuXG4gIGdldENvbXBvbmVudFNlc3Npb24oY29tcG9uZW50OiBzdHJpbmcsIGNvbXBvbmVudElkOiBudW1iZXIgPSAxKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcG9uZW50c1tjb21wb25lbnRdICYmIHRoaXMuY29tcG9uZW50c1tjb21wb25lbnRdW2NvbXBvbmVudElkXSAmJiBJc09iamVjdCh0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50XVtjb21wb25lbnRJZF0ub25TZXNzaW9uLCB0cnVlKSA/IHRoaXMuY29tcG9uZW50c1tjb21wb25lbnRdW2NvbXBvbmVudElkXS5vblNlc3Npb24gOiBudWxsO1xuICB9XG5cblxuICBvbkRldGFjaChuYW1lOiBzdHJpbmcsIGlkKSB7XG4gICAgaWYgKG5hbWUgJiYgaWQpIHtcbiAgICAgIGlmICh0aGlzLmNvbXBvbmVudHNbbmFtZV0gJiYgdGhpcy5jb21wb25lbnRzW25hbWVdW2lkXSkge1xuICAgICAgICBkZWxldGUgdGhpcy5jb21wb25lbnRzW25hbWVdW2lkXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIG5nT25EZXN0cm95KCkge1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVuZGVyIFRoZSBIb29kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJpdmF0ZSBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICBwcml2YXRlIGNyZWF0ZURvbVNlc3Npb24oY29tcG9uZW50OiB7IGlkOiBzdHJpbmcgfCBudW1iZXIsIG5hbWU6ICdzdHJpbmcnLCBkb206IENvbXBvbmVudERvbUludGVyZmFjZSB9KSB7XG4gICAgaWYgKGNvbXBvbmVudC5uYW1lICYmIHR5cGVvZiBjb21wb25lbnQuaWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBpZiAoIXRoaXMuY29tcG9uZW50c1tjb21wb25lbnQubmFtZV0pIHRoaXMuY29tcG9uZW50c1tjb21wb25lbnQubmFtZV0gPSB7fTtcbiAgICAgIGlmICghdGhpcy5jb21wb25lbnRzW2NvbXBvbmVudC5uYW1lXVtjb21wb25lbnQuaWRdKSB0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50Lm5hbWVdW2NvbXBvbmVudC5pZF0gPSB7fTtcbiAgICAgIC8vIGlmKCBkb20uZW1pdHRlciBpbnN0YW5jZW9mIEV2ZW50RW1pdHRlciApIHRoaXMuY29tcG9uZW50c1sgZG9tLm5hbWUgXVsgZG9tLmVudGl0eUlkIF0uZW1pdHRlciA9IGRvbS5lbWl0dGVyO1xuICAgICAgdGhpcy5zZXNzaW9uRG9tS2V5cyhjb21wb25lbnQpO1xuICAgIH1cbiAgfVxuXG5cbiAgcHJpdmF0ZSBhcHBseURvbUtleXMoY29tcG9uZW50OiB7IGlkOiBzdHJpbmcgfCBudW1iZXIsIG5hbWU6ICdzdHJpbmcnLCBkb206IENvbXBvbmVudERvbUludGVyZmFjZSB9KSB7XG4gICAgaWYgKHRoaXMuY29tcG9uZW50c1tjb21wb25lbnQubmFtZV0gJiYgdGhpcy5jb21wb25lbnRzW2NvbXBvbmVudC5uYW1lXVtjb21wb25lbnQuaWRdKSB7XG4gICAgICBPYmplY3Qua2V5cyh0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50Lm5hbWVdW2NvbXBvbmVudC5pZF0pLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgIGlmIChrZXkgJiYgdGhpcy5hc3NldC5zZXNzaW9uS2V5c1trZXldKSB7XG4gICAgICAgICAgY29tcG9uZW50LmRvbVtrZXldID0gdGhpcy5jb21wb25lbnRzW2NvbXBvbmVudC5uYW1lXVtjb21wb25lbnQuaWRdW2tleV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG5cbiAgcHJpdmF0ZSBzZXNzaW9uRG9tS2V5cyhjb21wb25lbnQ6IHsgaWQ6IHN0cmluZyB8IG51bWJlciwgbmFtZTogJ3N0cmluZycsIGRvbTogQ29tcG9uZW50RG9tSW50ZXJmYWNlIH0sIGtleTogc3RyaW5nID0gbnVsbCkge1xuICAgIGlmICh0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50Lm5hbWVdICYmIHRoaXMuY29tcG9uZW50c1tjb21wb25lbnQubmFtZV1bY29tcG9uZW50LmlkXSkge1xuICAgICAgaWYgKGtleSAmJiBrZXkgaW4gdGhpcy5hc3NldC5zZXNzaW9uS2V5cykge1xuICAgICAgICBpZiAoSXNPYmplY3QoY29tcG9uZW50LmRvbVtrZXldLCB0cnVlKSkge1xuICAgICAgICAgIHRoaXMuY29tcG9uZW50c1tjb21wb25lbnQubmFtZV1bY29tcG9uZW50LmlkXVtrZXldID0gY29tcG9uZW50LmRvbVtrZXldO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMuYXNzZXQuc2Vzc2lvbktleXMpLm1hcCgoc2Vzc2lvbktleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgaWYgKElzT2JqZWN0KGNvbXBvbmVudC5kb21bc2Vzc2lvbktleV0sIHRydWUpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50Lm5hbWVdW2NvbXBvbmVudC5pZF1bc2Vzc2lvbktleV0gPSBjb21wb25lbnQuZG9tW3Nlc3Npb25LZXldO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=