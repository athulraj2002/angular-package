import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InDialogComponent } from './in-dialog/in-dialog.component';
import { PopExtendComponent } from '../../../pop-extend.component';
import { ServiceInjector } from '../../../pop-common.model';
export class PopFieldItemGroupComponent extends PopExtendComponent {
    constructor(el) {
        super();
        this.el = el;
        this.close = new EventEmitter();
        this.name = 'PopFieldItemGroupComponent';
        this.srv = {
            dialog: ServiceInjector.get(MatDialog),
        };
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                resolve(true);
            });
        };
    }
    /**
     * This component will take a list of field item configs and render them in a column list
     */
    ngOnInit() {
        super.ngOnInit();
    }
    ngAfterViewInit() {
        if (this.config.inDialog) {
            this.dom.setTimeout(`load-modal`, () => {
                this._loadGroupInDialogBox();
            }, 0);
        }
    }
    /**
     * This fx will bubble events up the pipeline
     * @param event
     */
    onBubbleEvent(event) {
        this.events.emit(event);
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * This fx will load the field item list in a dialog modal, this is for typically for creating entities and such actions.
     * This will allow all the fields items to be placed in an angular form so all the data can be validated collectively.
     * @private
     */
    _loadGroupInDialogBox() {
        const dialogBox = this.srv.dialog.open(InDialogComponent, {
            data: this.config,
            disableClose: true
        });
        dialogBox.componentInstance['http'] = this.config.http;
        dialogBox.componentInstance['debug'] = this.config.debug;
        dialogBox.componentInstance.events.subscribe((event) => {
            event.group = this.config;
            this.events.emit(event);
        });
        dialogBox.afterClosed().subscribe((result) => {
            this.close.emit(result);
        });
    }
}
PopFieldItemGroupComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-field-item-group',
                template: '<lib-group *ngIf="config && config.inDialog === null"  (events)="onBubbleEvent($event);" [config]=config></lib-group>'
            },] }
];
PopFieldItemGroupComponent.ctorParameters = () => [
    { type: ElementRef }
];
PopFieldItemGroupComponent.propDecorators = {
    config: [{ type: Input }],
    close: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWZpZWxkLWl0ZW0tZ3JvdXAuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtZmllbGQtaXRlbS1ncm91cC9wb3AtZmllbGQtaXRlbS1ncm91cC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQXFCLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNySCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDckQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFcEUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDbkUsT0FBTyxFQUFpQyxlQUFlLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQVEzRixNQUFNLE9BQU8sMEJBQTJCLFNBQVEsa0JBQWtCO0lBY2hFLFlBQ1MsRUFBYztRQUVyQixLQUFLLEVBQUUsQ0FBQztRQUZELE9BQUUsR0FBRixFQUFFLENBQVk7UUFiYixVQUFLLEdBQUcsSUFBSSxZQUFZLEVBQVUsQ0FBQztRQUV0QyxTQUFJLEdBQUcsNEJBQTRCLENBQUM7UUFHakMsUUFBRyxHQUVUO1lBQ0YsTUFBTSxFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUUsU0FBUyxDQUFFO1NBQ3pDLENBQUM7UUFRQTs7V0FFRztRQUNILElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLEdBQXFCLEVBQUU7WUFDMUMsT0FBTyxJQUFJLE9BQU8sQ0FBRSxDQUFFLE9BQU8sRUFBRyxFQUFFO2dCQUNoQyxPQUFPLENBQUUsSUFBSSxDQUFFLENBQUM7WUFDbEIsQ0FBQyxDQUFFLENBQUM7UUFDTixDQUFDLENBQUM7SUFDSixDQUFDO0lBR0Q7O09BRUc7SUFDSCxRQUFRO1FBQ04sS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFHRCxlQUFlO1FBQ2IsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUN4QixJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBRSxZQUFZLEVBQUUsR0FBRyxFQUFFO2dCQUN0QyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUMvQixDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUM7U0FDUjtJQUNILENBQUM7SUFHRDs7O09BR0c7SUFDSCxhQUFhLENBQUUsS0FBNEI7UUFDekMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUUsS0FBSyxDQUFFLENBQUM7SUFDNUIsQ0FBQztJQUdEOztPQUVHO0lBQ0gsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBR0Q7Ozs7O3NHQUtrRztJQUNsRzs7OztPQUlHO0lBQ0sscUJBQXFCO1FBQzNCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDcEMsaUJBQWlCLEVBQ2pCO1lBQ0UsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ2pCLFlBQVksRUFBRSxJQUFJO1NBQ25CLENBQ0YsQ0FBQztRQUNGLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBRSxNQUFNLENBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUN6RCxTQUFTLENBQUMsaUJBQWlCLENBQUUsT0FBTyxDQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDM0QsU0FBUyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUUsQ0FBRSxLQUE0QixFQUFHLEVBQUU7WUFDL0UsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQzFCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFFLEtBQUssQ0FBRSxDQUFDO1FBQzVCLENBQUMsQ0FBRSxDQUFDO1FBQ0osU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBRSxDQUFFLE1BQVcsRUFBRyxFQUFFO1lBQ25ELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSxDQUFDO1FBQzVCLENBQUMsQ0FBRSxDQUFDO0lBQ04sQ0FBQzs7O1lBakdGLFNBQVMsU0FBRTtnQkFDVixRQUFRLEVBQUUsMEJBQTBCO2dCQUNwQyxRQUFRLEVBQUUsdUhBQXVIO2FBRWxJOzs7WUFaa0MsVUFBVTs7O3FCQWMxQyxLQUFLO29CQUNMLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0LCBPdXRwdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE1hdERpYWxvZyB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RpYWxvZyc7XG5pbXBvcnQgeyBJbkRpYWxvZ0NvbXBvbmVudCB9IGZyb20gJy4vaW4tZGlhbG9nL2luLWRpYWxvZy5jb21wb25lbnQnO1xuaW1wb3J0IHsgRmllbGRJdGVtR3JvdXBDb25maWcgfSBmcm9tICcuL3BvcC1maWVsZC1pdGVtLWdyb3VwLm1vZGVsJztcbmltcG9ydCB7IFBvcEV4dGVuZENvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL3BvcC1leHRlbmQuY29tcG9uZW50JztcbmltcG9ydCB7IEVudGl0eSwgUG9wQmFzZUV2ZW50SW50ZXJmYWNlLCBTZXJ2aWNlSW5qZWN0b3IgfSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcblxuXG5AQ29tcG9uZW50KCB7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC1maWVsZC1pdGVtLWdyb3VwJyxcbiAgdGVtcGxhdGU6ICc8bGliLWdyb3VwICpuZ0lmPVwiY29uZmlnICYmIGNvbmZpZy5pbkRpYWxvZyA9PT0gbnVsbFwiICAoZXZlbnRzKT1cIm9uQnViYmxlRXZlbnQoJGV2ZW50KTtcIiBbY29uZmlnXT1jb25maWc+PC9saWItZ3JvdXA+JyxcbiAgc3R5bGVVcmxzOiBbXVxufSApXG5leHBvcnQgY2xhc3MgUG9wRmllbGRJdGVtR3JvdXBDb21wb25lbnQgZXh0ZW5kcyBQb3BFeHRlbmRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSwgQWZ0ZXJWaWV3SW5pdCB7XG4gIEBJbnB1dCgpIGNvbmZpZzogRmllbGRJdGVtR3JvdXBDb25maWc7XG4gIEBPdXRwdXQoKSBjbG9zZSA9IG5ldyBFdmVudEVtaXR0ZXI8RW50aXR5PigpO1xuXG4gIHB1YmxpYyBuYW1lID0gJ1BvcEZpZWxkSXRlbUdyb3VwQ29tcG9uZW50JztcblxuXG4gIHByb3RlY3RlZCBzcnY6IHtcbiAgICBkaWFsb2c6IE1hdERpYWxvZ1xuICB9ID0ge1xuICAgIGRpYWxvZzogU2VydmljZUluamVjdG9yLmdldCggTWF0RGlhbG9nICksXG4gIH07XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICl7XG4gICAgc3VwZXIoKTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgc2hvdWxkIHRyYW5zZm9ybSBhbmQgdmFsaWRhdGUgdGhlIGRhdGEuIFRoZSB2aWV3IHNob3VsZCB0cnkgdG8gb25seSB1c2UgZGF0YSB0aGF0IGlzIHN0b3JlZCBvbiB1aSBzbyB0aGF0IGl0IGlzIG5vdCBkZXBlbmRlbnQgb24gdGhlIHN0cnVjdHVyZSBvZiBkYXRhIHRoYXQgY29tZXMgZnJvbSBvdGhlciBzb3VyY2VzLiBUaGUgdWkgc2hvdWxkIGJlIHRoZSBzb3VyY2Ugb2YgdHJ1dGggaGVyZS5cbiAgICAgKi9cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSApID0+IHtcbiAgICAgICAgcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCB3aWxsIHRha2UgYSBsaXN0IG9mIGZpZWxkIGl0ZW0gY29uZmlncyBhbmQgcmVuZGVyIHRoZW0gaW4gYSBjb2x1bW4gbGlzdFxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICBuZ0FmdGVyVmlld0luaXQoKXtcbiAgICBpZiggdGhpcy5jb25maWcuaW5EaWFsb2cgKXtcbiAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGBsb2FkLW1vZGFsYCwgKCkgPT4ge1xuICAgICAgICB0aGlzLl9sb2FkR3JvdXBJbkRpYWxvZ0JveCgpO1xuICAgICAgfSwgMCApO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgZnggd2lsbCBidWJibGUgZXZlbnRzIHVwIHRoZSBwaXBlbGluZVxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uQnViYmxlRXZlbnQoIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgKXtcbiAgICB0aGlzLmV2ZW50cy5lbWl0KCBldmVudCApO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIGRvbSBkZXN0cm95IGZ1bmN0aW9uIG1hbmFnZXMgYWxsIHRoZSBjbGVhbiB1cCB0aGF0IGlzIG5lY2Vzc2FyeSBpZiBzdWJzY3JpcHRpb25zLCB0aW1lb3V0cywgZXRjIGFyZSBzdG9yZWQgcHJvcGVybHlcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gIC8qKlxuICAgKiBUaGlzIGZ4IHdpbGwgbG9hZCB0aGUgZmllbGQgaXRlbSBsaXN0IGluIGEgZGlhbG9nIG1vZGFsLCB0aGlzIGlzIGZvciB0eXBpY2FsbHkgZm9yIGNyZWF0aW5nIGVudGl0aWVzIGFuZCBzdWNoIGFjdGlvbnMuXG4gICAqIFRoaXMgd2lsbCBhbGxvdyBhbGwgdGhlIGZpZWxkcyBpdGVtcyB0byBiZSBwbGFjZWQgaW4gYW4gYW5ndWxhciBmb3JtIHNvIGFsbCB0aGUgZGF0YSBjYW4gYmUgdmFsaWRhdGVkIGNvbGxlY3RpdmVseS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX2xvYWRHcm91cEluRGlhbG9nQm94KCl7XG4gICAgY29uc3QgZGlhbG9nQm94ID0gdGhpcy5zcnYuZGlhbG9nLm9wZW4oXG4gICAgICBJbkRpYWxvZ0NvbXBvbmVudCxcbiAgICAgIHtcbiAgICAgICAgZGF0YTogdGhpcy5jb25maWcsXG4gICAgICAgIGRpc2FibGVDbG9zZTogdHJ1ZVxuICAgICAgfVxuICAgICk7XG4gICAgZGlhbG9nQm94LmNvbXBvbmVudEluc3RhbmNlWyAnaHR0cCcgXSA9IHRoaXMuY29uZmlnLmh0dHA7XG4gICAgZGlhbG9nQm94LmNvbXBvbmVudEluc3RhbmNlWyAnZGVidWcnIF0gPSB0aGlzLmNvbmZpZy5kZWJ1ZztcbiAgICBkaWFsb2dCb3guY29tcG9uZW50SW5zdGFuY2UuZXZlbnRzLnN1YnNjcmliZSggKCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICkgPT4ge1xuICAgICAgZXZlbnQuZ3JvdXAgPSB0aGlzLmNvbmZpZztcbiAgICAgIHRoaXMuZXZlbnRzLmVtaXQoIGV2ZW50ICk7XG4gICAgfSApO1xuICAgIGRpYWxvZ0JveC5hZnRlckNsb3NlZCgpLnN1YnNjcmliZSggKCByZXN1bHQ6IGFueSApID0+IHtcbiAgICAgIHRoaXMuY2xvc2UuZW1pdCggcmVzdWx0ICk7XG4gICAgfSApO1xuICB9XG5cblxufVxuIl19