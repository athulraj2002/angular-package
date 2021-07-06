import { Component, ElementRef, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { PopExtendDynamicComponent } from '../../../pop-extend-dynamic.component';
import { PopDomService } from '../../../services/pop-dom.service';
import { IsArray, IsObject, IsObjectThrowError, StorageGetter } from '../../../pop-common-utility';
import { IsValidFieldPatchEvent } from '../pop-entity-utility';
export class PopEntityTabColumnComponent extends PopExtendDynamicComponent {
    constructor(el, _domRepo, _tabRepo) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this._tabRepo = _tabRepo;
        this.name = 'PopEntityTabColumnComponent';
        this.srv = {
            tab: undefined
        };
        this.ui = {
            tabId: undefined,
        };
        this.dom.configure = () => {
            return new Promise((resolve) => {
                //  Enforce CoreConfig
                this.core = IsObjectThrowError(this.core, true, `${this.name}:: - this.core`) ? this.core : null;
                //  Set Attributes
                this.position = +this.column.id;
                this.id = this.column.id;
                // Event Handlers
                this.trait.bubble = true; // passes bubble events up to parent
                this.dom.handler.bubble = (core, event) => {
                    this.onBubbleEvent(event);
                };
                const tab = this.srv.tab.getTab();
                if (tab && tab.id) {
                    this.ui.tabId = tab.id;
                }
                return resolve(true);
            });
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => {
                this.dom.setSubscriber('name-reset', this.column.reset.subscribe((e) => this._onColumnResetEvent(e)));
                this._determineHeight();
                // Attach Template Container
                this.template.attach('container');
                //  Render the dynamic list of components
                this._templateRender();
                return resolve(true);
            });
        };
    }
    /**
     * The component should take a specific section/column of a defined tab, and dynamically render all of the components that belong in that section
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * Event handler for the parent tab to tell this column to reset itself
     * @param reset
     */
    onBubbleEvent(event) {
        this.log.event(`onBubbleEvent`, event);
        if (IsValidFieldPatchEvent(this.core, event) || event.type === 'context_menu') {
            this.events.emit(event);
        }
    }
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy() {
        this._setScrollTop();
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Event handler for the parent tab to tell this column to reset itself
     * @param reset
     */
    _onColumnResetEvent(reset) {
        if (reset && typeof reset === 'boolean') {
            if (this.dom.delay.render)
                clearTimeout(this.dom.delay.render);
            this.dom.delay.render = setTimeout(() => {
                this._templateRender();
            }, 250);
        }
        else if (typeof reset === 'string') {
            if (reset === 'scrollTop') {
                this._setScrollTop();
            }
        }
    }
    /**
     * Helper function that determines what the height of this component should be
     *
     */
    _determineHeight() {
        this.dom.state.hasHeader = this.column.header ? true : false;
        const columnHeight = StorageGetter(this.dom.repo, ['position', String(this.column.id), 'height'], 650);
        this.dom.height.outer = +columnHeight;
        this.dom.height.inner = this.dom.height.outer - 30;
    }
    /**
     * Helper function that renders the list of dynamic components
     *
     */
    _templateRender() {
        const transfer = ['core', 'position'];
        if (IsObject(this.column.extension, true)) {
            this.extension = this.column.extension;
            transfer.push('extension');
        }
        const components = IsArray(this.column.components, true) ? this.column.components : [];
        this.template.render(components, transfer);
        this._applyScrollTop();
    }
    /**
     * Reaches up to the parent container and sets the current scroll position
     * The parent container component uses an *ngIf that prevents using @viewChild to do this
     */
    _applyScrollTop() {
        setTimeout(() => {
            if (this.dom.session.scroll && this.ui.tabId && this.dom.session.scroll[this.ui.tabId]) {
                this.el.nativeElement.parentElement.scrollTop = this.dom.session.scroll[this.ui.tabId];
            }
        }, 0);
    }
    /**
     * Reaches up to the parent container and stores the current scroll position
     * The parent container component uses an *ngIf that prevents using @viewChild to do this
     */
    _setScrollTop() {
        if (!this.dom.session.scroll)
            this.dom.session.scroll = {};
        if (this.ui.tabId) {
            this.dom.session.scroll[this.ui.tabId] = this.el.nativeElement.parentElement.scrollTop;
        }
    }
}
PopEntityTabColumnComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-tab-column',
                template: '<ng-template #container></ng-template>'
            },] }
];
PopEntityTabColumnComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: PopTabMenuService }
];
PopEntityTabColumnComponent.propDecorators = {
    column: [{ type: Input }],
    container: [{ type: ViewChild, args: ['container', { read: ViewContainerRef, static: true },] }],
    extension: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS10YWItY29sdW1uLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LXRhYi9wb3AtZW50aXR5LXRhYi1jb2x1bW4uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLEtBQUssRUFHTCxTQUFTLEVBQ1QsZ0JBQWdCLEVBQ2pCLE1BQU0sZUFBZSxDQUFDO0FBR3ZCLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBQ2pGLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQ2xGLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUNsRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBRSxhQUFhLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNuRyxPQUFPLEVBQTBCLHNCQUFzQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFPdkYsTUFBTSxPQUFPLDJCQUE0QixTQUFRLHlCQUF5QjtJQWtCeEUsWUFDUyxFQUFjLEVBQ1gsUUFBdUIsRUFDdkIsUUFBMkI7UUFFckMsS0FBSyxFQUFFLENBQUM7UUFKRCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ1gsYUFBUSxHQUFSLFFBQVEsQ0FBZTtRQUN2QixhQUFRLEdBQVIsUUFBUSxDQUFtQjtRQWhCaEMsU0FBSSxHQUFHLDZCQUE2QixDQUFDO1FBQ2xDLFFBQUcsR0FFVDtZQUNGLEdBQUcsRUFBcUIsU0FBUztTQUNsQyxDQUFDO1FBR0ssT0FBRSxHQUFHO1lBQ1YsS0FBSyxFQUFVLFNBQVM7U0FDekIsQ0FBQztRQVVBLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLEdBQXFCLEVB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QzVELElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUU7WUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQztTQUMxRjtJQUNILENBQUM7OztZQS9LRixTQUFTLFNBQUU7Z0JBQ1YsUUFBUSxFQUFFLDJCQUEyQjtnQkFDckMsUUFBUSxFQUFFLHdDQUF3QzthQUNuRDs7O1lBbkJDLFVBQVU7WUFXSCxhQUFhO1lBRmIsaUJBQWlCOzs7cUJBWXZCLEtBQUs7d0JBQ0wsU0FBUyxTQUFFLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO3dCQUNoRSxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIFZpZXdDaGlsZCxcbiAgVmlld0NvbnRhaW5lclJlZlxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFRhYlBvc2l0aW9uSW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vYmFzZS9wb3AtdGFiLW1lbnUvdGFiLW1lbnUubW9kZWwnO1xuaW1wb3J0IHsgQ29yZUNvbmZpZywgRHluYW1pY0NvbXBvbmVudEludGVyZmFjZSwgRW50aXR5RXh0ZW5kSW50ZXJmYWNlLCBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgfSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFBvcFRhYk1lbnVTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vYmFzZS9wb3AtdGFiLW1lbnUvcG9wLXRhYi1tZW51LnNlcnZpY2UnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kRHluYW1pY0NvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL3BvcC1leHRlbmQtZHluYW1pYy5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQgeyBJc0FycmF5LCBJc09iamVjdCwgSXNPYmplY3RUaHJvd0Vycm9yLCBTdG9yYWdlR2V0dGVyIH0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7IEV2YWx1YXRlV2hlbkNvbmRpdGlvbnMsIElzVmFsaWRGaWVsZFBhdGNoRXZlbnQgfSBmcm9tICcuLi9wb3AtZW50aXR5LXV0aWxpdHknO1xuXG5cbkBDb21wb25lbnQoIHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWVudGl0eS10YWItY29sdW1uJyxcbiAgdGVtcGxhdGU6ICc8bmctdGVtcGxhdGUgI2NvbnRhaW5lcj48L25nLXRlbXBsYXRlPicsXG59IClcbmV4cG9ydCBjbGFzcyBQb3BFbnRpdHlUYWJDb2x1bW5Db21wb25lbnQgZXh0ZW5kcyBQb3BFeHRlbmREeW5hbWljQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBjb2x1bW46IFRhYlBvc2l0aW9uSW50ZXJmYWNlO1xuICBAVmlld0NoaWxkKCAnY29udGFpbmVyJywgeyByZWFkOiBWaWV3Q29udGFpbmVyUmVmLCBzdGF0aWM6IHRydWUgfSApIHB1YmxpYyBjb250YWluZXI7XG4gIEBJbnB1dCgpIGV4dGVuc2lvbjogRW50aXR5RXh0ZW5kSW50ZXJmYWNlOyAvLyBhbGxvd3MgdGhlIHJvdXRlIHRvIG92ZXJyaWRlIGNlcnRhaW4gc2V0dGluZ3NcblxuICBwdWJsaWMgbmFtZSA9ICdQb3BFbnRpdHlUYWJDb2x1bW5Db21wb25lbnQnO1xuICBwcm90ZWN0ZWQgc3J2OiB7XG4gICAgdGFiOiBQb3BUYWJNZW51U2VydmljZSxcbiAgfSA9IHtcbiAgICB0YWI6IDxQb3BUYWJNZW51U2VydmljZT51bmRlZmluZWRcbiAgfTtcblxuXG4gIHB1YmxpYyB1aSA9IHtcbiAgICB0YWJJZDogPG51bWJlcj51bmRlZmluZWQsXG4gIH07XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIF9kb21SZXBvOiBQb3BEb21TZXJ2aWNlLFxuICAgIHByb3RlY3RlZCBfdGFiUmVwbzogUG9wVGFiTWVudVNlcnZpY2UsXG4gICl7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlICkgPT4ge1xuICAgICAgICAvLyAgRW5mb3JjZSBDb3JlQ29uZmlnXG4gICAgICAgIHRoaXMuY29yZSA9IElzT2JqZWN0VGhyb3dFcnJvciggdGhpcy5jb3JlLCB0cnVlLCBgJHt0aGlzLm5hbWV9OjogLSB0aGlzLmNvcmVgICkgPyB0aGlzLmNvcmUgOiBudWxsO1xuICAgICAgICAvLyAgU2V0IEF0dHJpYnV0ZXNcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9ICt0aGlzLmNvbHVtbi5pZDtcbiAgICAgICAgdGhpcy5pZCA9IHRoaXMuY29sdW1uLmlkO1xuICAgICAgICAvLyBFdmVudCBIYW5kbGVyc1xuICAgICAgICB0aGlzLnRyYWl0LmJ1YmJsZSA9IHRydWU7IC8vIHBhc3NlcyBidWJibGUgZXZlbnRzIHVwIHRvIHBhcmVudFxuXG4gICAgICAgIHRoaXMuZG9tLmhhbmRsZXIuYnViYmxlID0gKCBjb3JlOiBDb3JlQ29uZmlnLCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICkgPT4ge1xuICAgICAgICAgIHRoaXMub25CdWJibGVFdmVudCggZXZlbnQgKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB0YWIgPSB0aGlzLnNydi50YWIuZ2V0VGFiKCk7XG4gICAgICAgIGlmKCB0YWIgJiYgdGFiLmlkICl7XG4gICAgICAgICAgdGhpcy51aS50YWJJZCA9IHRhYi5pZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcblxuICAgIHRoaXMuZG9tLnByb2NlZWQgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSApID0+IHtcblxuXG4gICAgICAgIHRoaXMuZG9tLnNldFN1YnNjcmliZXIoICduYW1lLXJlc2V0JywgdGhpcy5jb2x1bW4ucmVzZXQuc3Vic2NyaWJlKCAoIGU6IHN0cmluZyB8IGJvb2xlYW4gKSA9PiB0aGlzLl9vbkNvbHVtblJlc2V0RXZlbnQoIGUgKSApICk7XG5cbiAgICAgICAgdGhpcy5fZGV0ZXJtaW5lSGVpZ2h0KCk7XG4gICAgICAgIC8vIEF0dGFjaCBUZW1wbGF0ZSBDb250YWluZXJcbiAgICAgICAgdGhpcy50ZW1wbGF0ZS5hdHRhY2goICdjb250YWluZXInICk7XG4gICAgICAgIC8vICBSZW5kZXIgdGhlIGR5bmFtaWMgbGlzdCBvZiBjb21wb25lbnRzXG4gICAgICAgIHRoaXMuX3RlbXBsYXRlUmVuZGVyKCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgIH0gKTtcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIGNvbXBvbmVudCBzaG91bGQgdGFrZSBhIHNwZWNpZmljIHNlY3Rpb24vY29sdW1uIG9mIGEgZGVmaW5lZCB0YWIsIGFuZCBkeW5hbWljYWxseSByZW5kZXIgYWxsIG9mIHRoZSBjb21wb25lbnRzIHRoYXQgYmVsb25nIGluIHRoYXQgc2VjdGlvblxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogRXZlbnQgaGFuZGxlciBmb3IgdGhlIHBhcmVudCB0YWIgdG8gdGVsbCB0aGlzIGNvbHVtbiB0byByZXNldCBpdHNlbGZcbiAgICogQHBhcmFtIHJlc2V0XG4gICAqL1xuICBvbkJ1YmJsZUV2ZW50KCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICl7XG4gICAgdGhpcy5sb2cuZXZlbnQoIGBvbkJ1YmJsZUV2ZW50YCwgZXZlbnQgKTtcbiAgICBpZiggSXNWYWxpZEZpZWxkUGF0Y2hFdmVudCggdGhpcy5jb3JlLCBldmVudCApIHx8IGV2ZW50LnR5cGUgPT09ICdjb250ZXh0X21lbnUnICl7XG4gICAgICB0aGlzLmV2ZW50cy5lbWl0KCBldmVudCApO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIENsZWFuIHVwIHRoZSBkb20gb2YgdGhpcyBjb21wb25lbnRcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgdGhpcy5fc2V0U2Nyb2xsVG9wKCk7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAvKipcbiAgICogRXZlbnQgaGFuZGxlciBmb3IgdGhlIHBhcmVudCB0YWIgdG8gdGVsbCB0aGlzIGNvbHVtbiB0byByZXNldCBpdHNlbGZcbiAgICogQHBhcmFtIHJlc2V0XG4gICAqL1xuICBwcml2YXRlIF9vbkNvbHVtblJlc2V0RXZlbnQoIHJlc2V0OiBzdHJpbmcgfCBib29sZWFuICl7XG4gICAgaWYoIHJlc2V0ICYmIHR5cGVvZiByZXNldCA9PT0gJ2Jvb2xlYW4nICl7XG4gICAgICBpZiggdGhpcy5kb20uZGVsYXkucmVuZGVyICkgY2xlYXJUaW1lb3V0KCB0aGlzLmRvbS5kZWxheS5yZW5kZXIgKTtcbiAgICAgIHRoaXMuZG9tLmRlbGF5LnJlbmRlciA9IHNldFRpbWVvdXQoICgpID0+IHtcbiAgICAgICAgdGhpcy5fdGVtcGxhdGVSZW5kZXIoKTtcbiAgICAgIH0sIDI1MCApO1xuICAgIH1lbHNlIGlmKCB0eXBlb2YgcmVzZXQgPT09ICdzdHJpbmcnICl7XG4gICAgICBpZiggcmVzZXQgPT09ICdzY3JvbGxUb3AnICl7XG4gICAgICAgIHRoaXMuX3NldFNjcm9sbFRvcCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IGRldGVybWluZXMgd2hhdCB0aGUgaGVpZ2h0IG9mIHRoaXMgY29tcG9uZW50IHNob3VsZCBiZVxuICAgKlxuICAgKi9cbiAgcHJpdmF0ZSBfZGV0ZXJtaW5lSGVpZ2h0KCl7XG4gICAgdGhpcy5kb20uc3RhdGUuaGFzSGVhZGVyID0gdGhpcy5jb2x1bW4uaGVhZGVyID8gdHJ1ZSA6IGZhbHNlO1xuICAgIGNvbnN0IGNvbHVtbkhlaWdodCA9IFN0b3JhZ2VHZXR0ZXIoIHRoaXMuZG9tLnJlcG8sIFsgJ3Bvc2l0aW9uJywgU3RyaW5nKCB0aGlzLmNvbHVtbi5pZCApLCAnaGVpZ2h0JyBdLCA2NTAgKTtcbiAgICB0aGlzLmRvbS5oZWlnaHQub3V0ZXIgPSArY29sdW1uSGVpZ2h0O1xuICAgIHRoaXMuZG9tLmhlaWdodC5pbm5lciA9IHRoaXMuZG9tLmhlaWdodC5vdXRlciAtIDMwO1xuICB9XG5cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgcmVuZGVycyB0aGUgbGlzdCBvZiBkeW5hbWljIGNvbXBvbmVudHNcbiAgICpcbiAgICovXG4gIHByaXZhdGUgX3RlbXBsYXRlUmVuZGVyKCl7XG4gICAgY29uc3QgdHJhbnNmZXIgPSBbICdjb3JlJywgJ3Bvc2l0aW9uJyBdO1xuICAgIGlmKCBJc09iamVjdCggdGhpcy5jb2x1bW4uZXh0ZW5zaW9uLCB0cnVlICkgKXtcbiAgICAgIHRoaXMuZXh0ZW5zaW9uID0gdGhpcy5jb2x1bW4uZXh0ZW5zaW9uO1xuICAgICAgdHJhbnNmZXIucHVzaCggJ2V4dGVuc2lvbicgKTtcbiAgICB9XG4gICAgY29uc3QgY29tcG9uZW50cyA9IElzQXJyYXkoIHRoaXMuY29sdW1uLmNvbXBvbmVudHMsIHRydWUgKSA/IHRoaXMuY29sdW1uLmNvbXBvbmVudHMgOiBbXTtcbiAgICB0aGlzLnRlbXBsYXRlLnJlbmRlciggY29tcG9uZW50cywgdHJhbnNmZXIgKTtcbiAgICB0aGlzLl9hcHBseVNjcm9sbFRvcCgpO1xuICB9XG5cblxuICAvKipcbiAgICogUmVhY2hlcyB1cCB0byB0aGUgcGFyZW50IGNvbnRhaW5lciBhbmQgc2V0cyB0aGUgY3VycmVudCBzY3JvbGwgcG9zaXRpb25cbiAgICogVGhlIHBhcmVudCBjb250YWluZXIgY29tcG9uZW50IHVzZXMgYW4gKm5nSWYgdGhhdCBwcmV2ZW50cyB1c2luZyBAdmlld0NoaWxkIHRvIGRvIHRoaXNcbiAgICovXG4gIHByaXZhdGUgX2FwcGx5U2Nyb2xsVG9wKCl7XG4gICAgc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgaWYoIHRoaXMuZG9tLnNlc3Npb24uc2Nyb2xsICYmIHRoaXMudWkudGFiSWQgJiYgdGhpcy5kb20uc2Vzc2lvbi5zY3JvbGxbIHRoaXMudWkudGFiSWQgXSApe1xuICAgICAgICB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQucGFyZW50RWxlbWVudC5zY3JvbGxUb3AgPSB0aGlzLmRvbS5zZXNzaW9uLnNjcm9sbFsgdGhpcy51aS50YWJJZCBdO1xuICAgICAgfVxuICAgIH0sIDAgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJlYWNoZXMgdXAgdG8gdGhlIHBhcmVudCBjb250YWluZXIgYW5kIHN0b3JlcyB0aGUgY3VycmVudCBzY3JvbGwgcG9zaXRpb25cbiAgICogVGhlIHBhcmVudCBjb250YWluZXIgY29tcG9uZW50IHVzZXMgYW4gKm5nSWYgdGhhdCBwcmV2ZW50cyB1c2luZyBAdmlld0NoaWxkIHRvIGRvIHRoaXNcbiAgICovXG4gIHByaXZhdGUgX3NldFNjcm9sbFRvcCgpe1xuICAgIGlmKCAhdGhpcy5kb20uc2Vzc2lvbi5zY3JvbGwgKSB0aGlzLmRvbS5zZXNzaW9uLnNjcm9sbCA9IHt9O1xuICAgIGlmKCB0aGlzLnVpLnRhYklkICl7XG4gICAgICB0aGlzLmRvbS5zZXNzaW9uLnNjcm9sbFsgdGhpcy51aS50YWJJZCBdID0gdGhpcy5lbC5uYXRpdmVFbGVtZW50LnBhcmVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuICAgIH1cbiAgfVxufVxuIl19