import { Component } from '@angular/core';
import { DestroyComponentTemplate, GetComponentTemplateContainer } from './pop-common-dom.models';
import { PopComponentResolver } from './pop-common.model';
import { PopExtendComponent } from './pop-extend.component';
import { IsDefined, IsObject, IsString } from './pop-common-utility';
export class PopExtendDynamicComponent extends PopExtendComponent {
    constructor() {
        super();
        this.template = GetComponentTemplateContainer();
        this.template = Object.assign(Object.assign({}, this.template), {
            attach: (container) => {
                if (IsString(container, true)) {
                    if (this[container]) {
                        this.template.container = this[container];
                        delete this[container];
                    }
                    else {
                    }
                }
                else {
                    this.template.container = container;
                }
            },
            render: (list, transfer = ['core', 'position'], bypassTransfer = false) => {
                this.template.ref_events.map((subscription) => {
                    if (subscription && typeof subscription.unsubscribe === 'function') {
                        subscription.unsubscribe();
                    }
                });
                this.template.refs = this.template.refs.map(function (componentRef) {
                    if (componentRef && typeof componentRef.destroy === 'function') {
                        componentRef.destroy();
                    }
                    componentRef = null;
                    return null;
                });
                this.template.transfer = {};
                if (!bypassTransfer) {
                    transfer.map((transferKey) => {
                        if (typeof this[transferKey] !== 'undefined') {
                            this.template.transfer[transferKey] = this[transferKey];
                        }
                    });
                }
                if (this.template && this.template.container) {
                    this.template.container.clear();
                    if (Array.isArray(list)) {
                        list.map((component) => {
                            if (IsObject(component, true) && IsDefined(component.type)) {
                                const factory = PopComponentResolver.resolveComponentFactory(component.type);
                                const componentRef = this.template.container.createComponent(factory);
                                if (componentRef.instance.events) {
                                    this.template.ref_events.push(componentRef.instance.events.subscribe((event) => {
                                        if (typeof this.dom.handler.bubble === 'function') {
                                            this.dom.handler.bubble(this.core, event);
                                        }
                                        else {
                                            if (this.trait.bubble)
                                                this.events.emit(event);
                                        }
                                    }));
                                }
                                if (typeof (component.inputs) === 'object') {
                                    Object.keys(component.inputs).map((key) => {
                                        if (typeof (key) === 'string' && typeof (component.inputs[key]) !== 'undefined') {
                                            componentRef.instance[key] = component.inputs[key];
                                        }
                                    });
                                }
                                Object.keys(this.template.transfer).map((transferKey) => {
                                    componentRef.instance[transferKey] = this.template.transfer[transferKey];
                                });
                                componentRef.changeDetectorRef.detectChanges();
                                this.template.refs.push(componentRef);
                            }
                        });
                    }
                }
            },
            clear: () => {
                if (this.template.container)
                    this.template.container.clear();
            },
            destroy: () => {
                if (this.template)
                    DestroyComponentTemplate(this.template);
            },
        });
    }
    ngOnInit() {
        super.ngOnInit();
    }
    ngOnDestroy() {
        this.template.destroy();
        super.ngOnDestroy();
    }
}
PopExtendDynamicComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-template-component',
                template: `Template Component`
            },] }
];
PopExtendDynamicComponent.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWV4dGVuZC1keW5hbWljLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9wb3AtZXh0ZW5kLWR5bmFtaWMuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQStFLE1BQU0sZUFBZSxDQUFDO0FBQ3ZILE9BQU8sRUFBOEIsd0JBQXdCLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUM5SCxPQUFPLEVBQW1ELG9CQUFvQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFHMUcsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDNUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFPckUsTUFBTSxPQUFPLHlCQUEwQixTQUFRLGtCQUFrQjtJQUkvRDtRQUNFLEtBQUssRUFBRSxDQUFDO1FBSkEsYUFBUSxHQUErQiw2QkFBNkIsRUFBRSxDQUFDO1FBTS9FLElBQUksQ0FBQyxRQUFRLEdBQUcsZ0NBQ1gsSUFBSSxDQUFDLFFBQVEsR0FBSztZQUNuQixNQUFNLEVBQUUsQ0FBRSxTQUFvQyxFQUFHLEVBQUU7Z0JBQ2pELElBQUksUUFBUSxDQUFFLFNBQVMsRUFBRSxJQUFJLENBQUUsRUFBRTtvQkFDL0IsSUFBSSxJQUFJLENBQVcsU0FBUyxDQUFFLEVBQUU7d0JBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBVSxTQUFTLENBQUUsQ0FBQzt3QkFDcEQsT0FBTyxJQUFJLENBQVUsU0FBUyxDQUFFLENBQUM7cUJBQ2xDO3lCQUFJO3FCQUNKO2lCQUNGO3FCQUFJO29CQUNILElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFxQixTQUFTLENBQUM7aUJBQ3ZEO1lBQ0gsQ0FBQztZQUVELE1B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QztJQUdELFdBQVc7UUFDVCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3hCLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDOzs7WUF4R0YsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSw0QkFBNEI7Z0JBQ3RDLFFBQVEsRUFBRSxvQkFBb0I7YUFDL0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgQ29tcG9uZW50UmVmLCBPbkRlc3Ryb3ksIE9uSW5pdCwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29tcG9uZW50VGVtcGxhdGVJbnRlcmZhY2UsIERlc3Ryb3lDb21wb25lbnRUZW1wbGF0ZSwgR2V0Q29tcG9uZW50VGVtcGxhdGVDb250YWluZXIgfSBmcm9tICcuL3BvcC1jb21tb24tZG9tLm1vZGVscyc7XG5pbXBvcnQge0R5bmFtaWNDb21wb25lbnRJbnRlcmZhY2UsIFBvcEJhc2VFdmVudEludGVyZmFjZSwgUG9wQ29tcG9uZW50UmVzb2x2ZXJ9IGZyb20gJy4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFNlcnZpY2VJbmplY3RvciB9IGZyb20gJy4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBQb3BFeHRlbmRDb21wb25lbnQgfSBmcm9tICcuL3BvcC1leHRlbmQuY29tcG9uZW50JztcbmltcG9ydCB7IElzRGVmaW5lZCwgSXNPYmplY3QsIElzU3RyaW5nIH0gZnJvbSAnLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuXG5cbkBDb21wb25lbnQoIHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLXRlbXBsYXRlLWNvbXBvbmVudCcsXG4gIHRlbXBsYXRlOiBgVGVtcGxhdGUgQ29tcG9uZW50YCxcbn0gKVxuZXhwb3J0IGNsYXNzIFBvcEV4dGVuZER5bmFtaWNDb21wb25lbnQgZXh0ZW5kcyBQb3BFeHRlbmRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIHByb3RlY3RlZCB0ZW1wbGF0ZTogQ29tcG9uZW50VGVtcGxhdGVJbnRlcmZhY2UgPSBHZXRDb21wb25lbnRUZW1wbGF0ZUNvbnRhaW5lcigpO1xuXG5cbiAgY29uc3RydWN0b3IoKXtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy50ZW1wbGF0ZSA9IDxDb21wb25lbnRUZW1wbGF0ZUludGVyZmFjZT57XG4gICAgICAuLi50aGlzLnRlbXBsYXRlLCAuLi57XG4gICAgICAgIGF0dGFjaDogKCBjb250YWluZXI6IHN0cmluZyB8IFZpZXdDb250YWluZXJSZWYgKSA9PiB7XG4gICAgICAgICAgaWYoIElzU3RyaW5nKCBjb250YWluZXIsIHRydWUgKSApe1xuICAgICAgICAgICAgaWYoIHRoaXNbIDxzdHJpbmc+IGNvbnRhaW5lciBdICl7XG4gICAgICAgICAgICAgIHRoaXMudGVtcGxhdGUuY29udGFpbmVyID0gdGhpc1sgPHN0cmluZz5jb250YWluZXIgXTtcbiAgICAgICAgICAgICAgZGVsZXRlIHRoaXNbIDxzdHJpbmc+Y29udGFpbmVyIF07XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGUuY29udGFpbmVyID0gPFZpZXdDb250YWluZXJSZWY+Y29udGFpbmVyO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICByZW5kZXI6ICggbGlzdDogRHluYW1pY0NvbXBvbmVudEludGVyZmFjZVtdLCB0cmFuc2ZlciA9IFsgJ2NvcmUnLCAncG9zaXRpb24nIF0sIGJ5cGFzc1RyYW5zZmVyID0gZmFsc2UgKSA9PiB7XG4gICAgICAgICAgdGhpcy50ZW1wbGF0ZS5yZWZfZXZlbnRzLm1hcCggKCBzdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbiApID0+IHtcbiAgICAgICAgICAgIGlmKCBzdWJzY3JpcHRpb24gJiYgdHlwZW9mIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICB0aGlzLnRlbXBsYXRlLnJlZnMgPSB0aGlzLnRlbXBsYXRlLnJlZnMubWFwKCBmdW5jdGlvbiggY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8YW55PiApe1xuICAgICAgICAgICAgaWYoIGNvbXBvbmVudFJlZiAmJiB0eXBlb2YgY29tcG9uZW50UmVmLmRlc3Ryb3kgPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgICAgY29tcG9uZW50UmVmLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBvbmVudFJlZiA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9ICk7XG4gICAgICAgICAgdGhpcy50ZW1wbGF0ZS50cmFuc2ZlciA9IHt9O1xuICAgICAgICAgIGlmKCAhYnlwYXNzVHJhbnNmZXIgKXtcbiAgICAgICAgICAgIHRyYW5zZmVyLm1hcCggKCB0cmFuc2ZlcktleTogc3RyaW5nICkgPT4ge1xuICAgICAgICAgICAgICBpZiggdHlwZW9mIHRoaXNbIHRyYW5zZmVyS2V5IF0gIT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZS50cmFuc2ZlclsgdHJhbnNmZXJLZXkgXSA9IHRoaXNbIHRyYW5zZmVyS2V5IF07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYoIHRoaXMudGVtcGxhdGUgJiYgdGhpcy50ZW1wbGF0ZS5jb250YWluZXIgKXtcblxuXG4gICAgICAgICAgICB0aGlzLnRlbXBsYXRlLmNvbnRhaW5lci5jbGVhcigpO1xuICAgICAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGxpc3QgKSApe1xuICAgICAgICAgICAgICBsaXN0Lm1hcCggKCBjb21wb25lbnQ6IER5bmFtaWNDb21wb25lbnRJbnRlcmZhY2UgKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoIElzT2JqZWN0KCBjb21wb25lbnQsIHRydWUgKSAmJiBJc0RlZmluZWQoIGNvbXBvbmVudC50eXBlICkgKXtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGZhY3RvcnkgPSBQb3BDb21wb25lbnRSZXNvbHZlci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeSggY29tcG9uZW50LnR5cGUgKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudFJlZiA9IDxhbnk+dGhpcy50ZW1wbGF0ZS5jb250YWluZXIuY3JlYXRlQ29tcG9uZW50KCBmYWN0b3J5ICk7XG5cbiAgICAgICAgICAgICAgICAgIGlmKCBjb21wb25lbnRSZWYuaW5zdGFuY2UuZXZlbnRzICl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGVtcGxhdGUucmVmX2V2ZW50cy5wdXNoKCBjb21wb25lbnRSZWYuaW5zdGFuY2UuZXZlbnRzLnN1YnNjcmliZSggKCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGlmKCB0eXBlb2YgdGhpcy5kb20uaGFuZGxlci5idWJibGUgPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZG9tLmhhbmRsZXIuYnViYmxlKCB0aGlzLmNvcmUsIGV2ZW50ICk7XG4gICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggdGhpcy50cmFpdC5idWJibGUgKSB0aGlzLmV2ZW50cy5lbWl0KCBldmVudCApO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSApICk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGlmKCB0eXBlb2YoIGNvbXBvbmVudC5pbnB1dHMgKSA9PT0gJ29iamVjdCcgKXtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoIGNvbXBvbmVudC5pbnB1dHMgKS5tYXAoICgga2V5ICkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGlmKCB0eXBlb2YoIGtleSApID09PSAnc3RyaW5nJyAmJiB0eXBlb2YoIGNvbXBvbmVudC5pbnB1dHNbIGtleSBdICkgIT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRSZWYuaW5zdGFuY2VbIGtleSBdID0gY29tcG9uZW50LmlucHV0c1sga2V5IF07XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyggdGhpcy50ZW1wbGF0ZS50cmFuc2ZlciApLm1hcCggKCB0cmFuc2ZlcktleTogc3RyaW5nICkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRSZWYuaW5zdGFuY2VbIHRyYW5zZmVyS2V5IF0gPSB0aGlzLnRlbXBsYXRlLnRyYW5zZmVyWyB0cmFuc2ZlcktleSBdO1xuICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgY29tcG9uZW50UmVmLmNoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgICAgICAgICAgIHRoaXMudGVtcGxhdGUucmVmcy5wdXNoKCBjb21wb25lbnRSZWYgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyOiAoKSA9PiB7XG4gICAgICAgICAgaWYoIHRoaXMudGVtcGxhdGUuY29udGFpbmVyICkgdGhpcy50ZW1wbGF0ZS5jb250YWluZXIuY2xlYXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkZXN0cm95OiAoKSA9PiB7XG4gICAgICAgICAgaWYoIHRoaXMudGVtcGxhdGUgKSBEZXN0cm95Q29tcG9uZW50VGVtcGxhdGUoIHRoaXMudGVtcGxhdGUgKTtcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cblxuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIG5nT25EZXN0cm95KCl7XG4gICAgdGhpcy50ZW1wbGF0ZS5kZXN0cm95KCk7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG59XG4iXX0=