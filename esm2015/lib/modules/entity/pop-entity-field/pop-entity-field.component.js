import { Component, ElementRef, Input, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { PopExtendDynamicComponent } from '../../../pop-extend-dynamic.component';
import { ServiceInjector } from '../../../pop-common.model';
import { PopContextMenuConfig } from '../../base/pop-context-menu/pop-context-menu.model';
import { IsObjectThrowError, StorageGetter } from '../../../pop-common-utility';
import { PopEntityFieldService } from './pop-entity-field.service';
export class PopEntityFieldComponent extends PopExtendDynamicComponent {
    constructor(el) {
        super();
        this.el = el;
        this.name = 'PopEntityFieldComponent';
        this.srv = {
            field: ServiceInjector.get(PopEntityFieldService),
            router: ServiceInjector.get(Router),
        };
        this.dom.configure = () => {
            return new Promise((resolve) => {
                // #1 Check Required Data:
                this.field = IsObjectThrowError(this.field, ['id'], `${this.name}:configure: - this.field`) ? this.field : null;
                this.id = this.field.id;
                // #2 Attach a context menu
                this._attachContextMenu();
                // #3 Handle Bubble events
                this.dom.handler.bubble = (core, event) => this.onBubbleEvent('handler', null, event);
                this.trait.bubble = true; // leave this on
                // #5: Render the dynamic field
                this.template.attach('container'); // 'container' references the @viewChild at top of file
                this.template.render([{
                        type: this.field.component,
                        inputs: {
                            core: this.core,
                            field: this.field,
                        }
                    }]);
                // set states
                this._setFieldState();
                resolve(true);
            });
        };
    }
    /**
     * This component should have a purpose
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * The user can call actions on this field
     * @param event
     */
    onActionButtonClick(event) {
        this.log.event(`onActionButtonClick`, event);
        if (event.type === 'field') {
            if (event.name === 'add') {
                this.onAdd(event);
            }
            else if (event.name === 'remove') {
                // this.onRemove(event);
            }
            else if (event.name === 'close') {
                // this.onClose(event);
            }
        }
        return true;
    }
    /**
     * User wants to add a value entry into the field
     * @param event
     */
    onAdd(event) {
        this.log.event(`onAdd`, event);
        if (this.field.facade) {
            this.onBubbleEvent('onAdd', null, event);
        }
        else {
            const childEmitter = StorageGetter(this.template, ['refs', '0', 'instance', 'events']);
            if (childEmitter) {
                childEmitter.emit(event);
                this._setFieldState();
            }
        }
        return true;
    }
    /**
     * User wants to make edits to the value entries
     * @param event
     */
    onEdit(event, dataKey) {
        this.log.event(`onEdit`, event);
        return true;
    }
    /**
     * User wants to remove a value entry
     * @param event
     */
    onRemove(event) {
        this.log.event(`onRemove`, event);
        console.log('here');
        if (this.field.facade) {
            this.onBubbleEvent('onRemove', null, event);
        }
        else {
            console.log('real delete action');
        }
        this._setFieldState();
        return true;
    }
    /**
     * User closes the edit ability of the value entries
     * @param event
     */
    onClose(event) {
        this.log.event(`onClose`, event);
        return true;
    }
    /**
     * The user can click on a link to view the config setup of this field
     */
    onNavigateToField() {
        this.srv.router.navigate(['entities', 'fields', this.field.id]).catch((e) => true);
    }
    /**
     * Handle the bubble events that come up
     * @param event
     */
    onBubbleEvent(name, extension, event) {
        this.log.event(`onBubbleEvent`, event);
        this._setFieldState();
        this.events.emit(event);
        return true;
    }
    /**
     * Clean up the dom of this component
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
     * Set internal state flags of a field
     * @private
     */
    _setFieldState() {
        this.dom.setTimeout(`allow-template-changes`, () => {
            // this.field.canAdd = this.field.multiple && this.field.data_keys.length < this.field.multiple_max;
            this.field.canAdd = this.field.multiple && this.field.data_keys.length < this.field.entries.length;
            this.field.canRemove = this.field.multiple && this.field.data_keys.length > this.field.multiple_min;
        }, 100);
    }
    /**
     * Interept the mouse right click to show a context menu for this field
     * @param event
     */
    _attachContextMenu() {
        this.dom.contextMenu.config = new PopContextMenuConfig();
        //
        this.dom.contextMenu.configure = (event) => {
            const hasAccess = true; // TBD
            if (hasAccess && this.dom.contextMenu.config) {
                event.preventDefault(); // prevent the default behavior of the right click.
                // reset the context menu, and configure it to load at the position clicked.
                this.dom.contextMenu.config.resetOptions();
                this.dom.contextMenu.config.addPortalOption('field', this.field.id);
                this.dom.contextMenu.config.addNewTabOption(`entities/fields/${this.field.id}`);
                this.dom.contextMenu.config.x = event.clientX;
                this.dom.contextMenu.config.y = event.clientY;
                this.dom.contextMenu.config.toggle.next(true);
            }
        };
        this.dom.setSubscriber('context-menu', this.dom.contextMenu.config.emitter.subscribe((event) => {
            this.events.emit(event);
        }));
    }
}
PopEntityFieldComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-field',
                template: "<!--<div class=\"pop-entity-field-container sw-field-main-wrapper-boundary\" (contextmenu)=\"dom.contextMenu.configure($event);\">-->\n<div class=\"pop-entity-field-container sw-field-main-wrapper-boundary\">\n<!--<div class=\"pop-entity-field-container sw-field-main-wrapper-boundary\">-->\n  <div class=\"import-field-header\" *ngIf=\"field.multiple || field.setting.show_name\">\n    <div class=\"import-field-header-title\" [ngClass]=\"{'sw-field-main-container-header-title-link sw-pointer sw-hover': true}\" (click)=\"onNavigateToField();\">\n      {{field.label}}\n    </div>\n    <!--<lib-pop-field-btn *ngIf=\"field.canAdd\" class=\"sw-mar-hrz-sm\" action=\"add\" [field]=\"field\" (events)=\"onActionButtonClick($event);\"></lib-pop-field-btn>-->\n  </div>\n  <div class=\"import-field-container\">\n    <ng-container #container></ng-container>\n  </div>\n  <!--<lib-pop-context-menu *ngIf=\"dom.contextMenu.config\" [config]=\"dom.contextMenu.config\"></lib-pop-context-menu>-->\n</div>\n",
                encapsulation: ViewEncapsulation.None,
                styles: [".sw-mar-xs{margin:var(--xs)}.sw-mar-sm{margin:var(--sm)}.sw-mar-md{margin:var(--md)}.sw-mar-lg{margin:var(--lg)}.sw-mar-xlg{margin:var(--xlg)}.sw-mar-hrz-xs{margin-left:var(--xs);margin-right:var(--xs)}.sw-mar-hrz-md,.sw-mar-hrz-sm{margin-left:var(--md);margin-right:var(--md)}.sw-mar-hrz-lg{margin-left:var(--lg);margin-right:var(--lg)}.sw-mar-hrz-xlg{margin-left:var(--xlg);margin-right:var(--xlg)}.sw-mar-vrt-xs{margin-top:var(--xs);margin-bottom:var(--xs)}.sw-mar-vrt-md,.sw-mar-vrt-sm{margin-top:var(--md);margin-bottom:var(--md)}.sw-mar-vrt-lg{margin-top:var(--lg);margin-bottom:var(--lg)}.sw-mar-vrt-xlg{margin-top:var(--xlg);margin-bottom:var(--xlg)}.sw-mar-lft-xs{margin-left:var(--xs)}.sw-mar-lft-sm{margin-left:var(--sm)}.sw-mar-lft-md{margin-left:var(--md)}.sw-mar-lft-lg{margin-left:var(--lg)}.sw-mar-lft-xlg{margin-left:var(--xlg)}.sw-mar-rgt-xs{margin-right:var(--xs)}.sw-mar-rgt-sm{margin-right:var(--sm)}.sw-mar-rgt-md{margin-right:var(--md)}.sw-mar-rgt-lg{margin-right:var(--lg)}.sw-mar-rgt-xlg{margin-right:var(--xlg)}.sw-mar-btm-xs{margin-bottom:var(--xs)}.sw-mar-btm-sm{margin-bottom:var(--sm)}.sw-mar-btm-md{margin-bottom:var(--md)}.sw-mar-btm-lg{margin-bottom:var(--lg)}.sw-mar-btm-xlg{margin-bottom:var(--xlg)}.sw-mar-top-xs{margin-top:var(--xs)}.sw-mar-top-sm{margin-top:var(--sm)}.sw-mar-top-md{margin-top:var(--md)}.sw-mar-top-lg{margin-top:var(--lg)}.sw-mar-top-xlg{margin-top:var(--xlg)}.sw-pad-xs{padding:var(--xs)}.sw-pad-md,.sw-pad-sm{padding:var(--md)}.sw-pad-lg{padding:var(--lg)}.sw-pad-xlg{padding:var(--xlg)}.sw-pad-hrz-xs{padding-left:var(--xs);padding-right:var(--xs)}.sw-pad-hrz-sm{padding-left:var(--sm);padding-right:var(--sm)}.sw-pad-hrz-md{padding-left:var(--md);padding-right:var(--md)}.sw-pad-hrz-lg{padding-left:var(--lg);padding-right:var(--lg)}.sw-pad-hrz-xlg{padding-left:var(--xlg);padding-right:var(--xlg)}.sw-pad-vrt-xs{padding-top:var(--xs);padding-bottom:var(--xs)}.sw-pad-vrt-md,.sw-pad-vrt-sm{padding-top:var(--md);padding-bottom:var(--md)}.sw-pad-vrt-lg{padding-top:var(--lg);padding-bottom:var(--lg)}.sw-pad-vrt-xlg{padding-top:var(--xlg);padding-bottom:var(--xlg)}.sw-pad-lft-xs{padding-left:var(--xs)}.sw-pad-lft-sm{padding-left:var(--sm)}.sw-pad-lft-md{padding-left:var(--md)}.sw-pad-lft-lg{padding-left:var(--lg)}.sw-pad-lft-xlg{padding-left:var(--xlg)}.sw-pad-rgt-xs{padding-right:var(--xs)}.sw-pad-rgt-sm{padding-right:var(--sm)}.sw-pad-rgt-md{padding-right:var(--md)}.sw-pad-rgt-lg{padding-right:var(--lg)}.sw-pad-rgt-xlg{padding-right:var(--xlg)}.sw-pad-btm-xs{padding-bottom:var(--xs)}.sw-pad-btm-sm{padding-bottom:var(--sm)}.sw-pad-btm-md{padding-bottom:var(--md)}.sw-pad-btm-lg{padding-bottom:var(--lg)}.sw-pad-btm-xlg{padding-bottom:var(--xlg)}.sw-pad-top-xs{padding-top:var(--xs)}.sw-pad-top-sm{padding-top:var(--sm)}.sw-pad-top-md{padding-top:var(--md)}.sw-pad-top-lg{padding-top:var(--lg)}.sw-pad-top-xlg{padding-top:var(--xlg)}.import-text-xs{font-size:.8em}.import-text-sm{font-size:.9em}.import-text-md{font-size:1em}.import-text-lg{font-size:1.1em}.import-text-xlg{font-size:1.2em}:host ::ng-deep .mat-form-field .mat-form-field-infix{width:0!important}:host ::ng-deep .mat-form-field-appearance-outline .mat-form-field-flex{margin-top:0!important}.pop-entity-field-container{position:relative;display:block;min-height:30px;width:100%;box-sizing:border-box;max-width:var(--field-max-width);margin-top:10px;clear:both}.pop-entity-field-container .import-field-item-container{margin-top:5px!important}.pop-entity-field-container ::ng-deep .mat-form-field-infix{width:0!important}.pop-entity-field-container ::ng-deep .mat-form-field-flex{margin-top:0!important}"]
            },] }
];
PopEntityFieldComponent.ctorParameters = () => [
    { type: ElementRef }
];
PopEntityFieldComponent.propDecorators = {
    field: [{ type: Input }],
    container: [{ type: ViewChild, args: ['container', { read: ViewContainerRef, static: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1maWVsZC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1maWVsZC9wb3AtZW50aXR5LWZpZWxkLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUFFLFVBQVUsRUFDckIsS0FBSyxFQUdMLFNBQVMsRUFDVCxnQkFBZ0IsRUFBRSxpQkFBaUIsRUFDcEMsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRWxGLE9BQU8sRUFBeUYsZUFBZSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbkosT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDMUYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ2hGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBU25FLE1BQU0sT0FBTyx1QkFBd0IsU0FBUSx5QkFBeUI7SUFlcEUsWUFDUyxFQUFjO1FBRXJCLEtBQUssRUFBRSxDQUFDO1FBRkQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQVpoQixTQUFJLEdBQUcseUJBQXlCLENBQUM7UUFFOUIsUUFBRyxHQUdUO1lBQ0YsS0FBSyxFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUM7WUFDakQsTUFBTSxFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO1NBQ3BDLENBQUM7UUFTQSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFxQixFQUFFO1lBQzFDLE9BQU8sSUFBSSxPQUFP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OzthQUN0Qzs7O1lBckJZLFVBQVU7OztvQkF1QnBCLEtBQUs7d0JBQ0wsU0FBUyxTQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgVmlld0NoaWxkLFxuICBWaWV3Q29udGFpbmVyUmVmLCBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBQb3BFeHRlbmREeW5hbWljQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vcG9wLWV4dGVuZC1keW5hbWljLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBFbnRpdHlGaWVsZENvbXBvbmVudEludGVyZmFjZSB9IGZyb20gJy4vcG9wLWVudGl0eS1maWVsZC5tb2RlbCc7XG5pbXBvcnQgeyBDb3JlQ29uZmlnLCBEaWN0aW9uYXJ5LCBEeW5hbWljQ29tcG9uZW50SW50ZXJmYWNlLCBGaWVsZENvbmZpZywgUG9wQmFzZUV2ZW50SW50ZXJmYWNlLCBTZXJ2aWNlSW5qZWN0b3IgfSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFBvcENvbnRleHRNZW51Q29uZmlnIH0gZnJvbSAnLi4vLi4vYmFzZS9wb3AtY29udGV4dC1tZW51L3BvcC1jb250ZXh0LW1lbnUubW9kZWwnO1xuaW1wb3J0IHsgSXNPYmplY3RUaHJvd0Vycm9yLCBTdG9yYWdlR2V0dGVyIH0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7IFBvcEVudGl0eUZpZWxkU2VydmljZSB9IGZyb20gJy4vcG9wLWVudGl0eS1maWVsZC5zZXJ2aWNlJztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWVudGl0eS1maWVsZCcsXG4gIHN0eWxlVXJsczogWyAnLi9wb3AtZW50aXR5LWZpZWxkLmNvbXBvbmVudC5zY3NzJyBdLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLWVudGl0eS1maWVsZC5jb21wb25lbnQuaHRtbCcsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG59KVxuZXhwb3J0IGNsYXNzIFBvcEVudGl0eUZpZWxkQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kRHluYW1pY0NvbXBvbmVudCBpbXBsZW1lbnRzIEVudGl0eUZpZWxkQ29tcG9uZW50SW50ZXJmYWNlLCBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGZpZWxkOiBGaWVsZENvbmZpZztcbiAgQFZpZXdDaGlsZCgnY29udGFpbmVyJywgeyByZWFkOiBWaWV3Q29udGFpbmVyUmVmLCBzdGF0aWM6IHRydWUgfSkgcHJpdmF0ZSBjb250YWluZXI7XG5cbiAgcHVibGljIG5hbWUgPSAnUG9wRW50aXR5RmllbGRDb21wb25lbnQnO1xuXG4gIHByb3RlY3RlZCBzcnY6IHtcbiAgICBmaWVsZDogUG9wRW50aXR5RmllbGRTZXJ2aWNlLFxuICAgIHJvdXRlcjogUm91dGVyLFxuICB9ID0ge1xuICAgIGZpZWxkOiBTZXJ2aWNlSW5qZWN0b3IuZ2V0KFBvcEVudGl0eUZpZWxkU2VydmljZSksXG4gICAgcm91dGVyOiBTZXJ2aWNlSW5qZWN0b3IuZ2V0KFJvdXRlciksXG4gIH07XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICl7XG4gICAgc3VwZXIoKTtcblxuXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIC8vICMxIENoZWNrIFJlcXVpcmVkIERhdGE6XG4gICAgICAgIHRoaXMuZmllbGQgPSBJc09iamVjdFRocm93RXJyb3IodGhpcy5maWVsZCwgWyAnaWQnIF0sIGAke3RoaXMubmFtZX06Y29uZmlndXJlOiAtIHRoaXMuZmllbGRgKSA/IHRoaXMuZmllbGQgOiBudWxsO1xuICAgICAgICB0aGlzLmlkID0gdGhpcy5maWVsZC5pZDtcbiAgICAgICAgLy8gIzIgQXR0YWNoIGEgY29udGV4dCBtZW51XG4gICAgICAgIHRoaXMuX2F0dGFjaENvbnRleHRNZW51KCk7XG4gICAgICAgIC8vICMzIEhhbmRsZSBCdWJibGUgZXZlbnRzXG4gICAgICAgIHRoaXMuZG9tLmhhbmRsZXIuYnViYmxlID0gKGNvcmU6IENvcmVDb25maWcsIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UpID0+IHRoaXMub25CdWJibGVFdmVudCgnaGFuZGxlcicsIG51bGwsIGV2ZW50KTtcbiAgICAgICAgdGhpcy50cmFpdC5idWJibGUgPSB0cnVlOyAvLyBsZWF2ZSB0aGlzIG9uXG5cbiAgICAgICAgLy8gIzU6IFJlbmRlciB0aGUgZHluYW1pYyBmaWVsZFxuICAgICAgICB0aGlzLnRlbXBsYXRlLmF0dGFjaCgnY29udGFpbmVyJyk7IC8vICdjb250YWluZXInIHJlZmVyZW5jZXMgdGhlIEB2aWV3Q2hpbGQgYXQgdG9wIG9mIGZpbGVcbiAgICAgICAgdGhpcy50ZW1wbGF0ZS5yZW5kZXIoWyA8RHluYW1pY0NvbXBvbmVudEludGVyZmFjZT57XG4gICAgICAgICAgdHlwZTogdGhpcy5maWVsZC5jb21wb25lbnQsXG4gICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICBjb3JlOiB0aGlzLmNvcmUsXG4gICAgICAgICAgICBmaWVsZDogdGhpcy5maWVsZCxcbiAgICAgICAgICB9XG4gICAgICAgIH0gXSk7XG5cbiAgICAgICAgLy8gc2V0IHN0YXRlc1xuICAgICAgICB0aGlzLl9zZXRGaWVsZFN0YXRlKCk7XG5cbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCBzaG91bGQgaGF2ZSBhIHB1cnBvc2VcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSB1c2VyIGNhbiBjYWxsIGFjdGlvbnMgb24gdGhpcyBmaWVsZFxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uQWN0aW9uQnV0dG9uQ2xpY2soZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSl7XG4gICAgdGhpcy5sb2cuZXZlbnQoYG9uQWN0aW9uQnV0dG9uQ2xpY2tgLCBldmVudCk7XG4gICAgaWYoIGV2ZW50LnR5cGUgPT09ICdmaWVsZCcgKXtcbiAgICAgIGlmKCBldmVudC5uYW1lID09PSAnYWRkJyApe1xuICAgICAgICB0aGlzLm9uQWRkKGV2ZW50KTtcbiAgICAgIH1lbHNlIGlmKCBldmVudC5uYW1lID09PSAncmVtb3ZlJyApe1xuICAgICAgICAvLyB0aGlzLm9uUmVtb3ZlKGV2ZW50KTtcbiAgICAgIH1lbHNlIGlmKCBldmVudC5uYW1lID09PSAnY2xvc2UnICl7XG4gICAgICAgIC8vIHRoaXMub25DbG9zZShldmVudCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cblxuICAvKipcbiAgICogVXNlciB3YW50cyB0byBhZGQgYSB2YWx1ZSBlbnRyeSBpbnRvIHRoZSBmaWVsZFxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uQWRkKGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2Upe1xuICAgIHRoaXMubG9nLmV2ZW50KGBvbkFkZGAsIGV2ZW50KTtcbiAgICBpZiggdGhpcy5maWVsZC5mYWNhZGUgKXtcbiAgICAgIHRoaXMub25CdWJibGVFdmVudCgnb25BZGQnLCBudWxsLCBldmVudCk7XG4gICAgfWVsc2V7XG4gICAgICBjb25zdCBjaGlsZEVtaXR0ZXIgPSA8RXZlbnRFbWl0dGVyPFBvcEJhc2VFdmVudEludGVyZmFjZT4+U3RvcmFnZUdldHRlcih0aGlzLnRlbXBsYXRlLCBbICdyZWZzJywgJzAnLCAnaW5zdGFuY2UnLCAnZXZlbnRzJyBdKTtcbiAgICAgIGlmKCBjaGlsZEVtaXR0ZXIgKXtcbiAgICAgICAgY2hpbGRFbWl0dGVyLmVtaXQoZXZlbnQpO1xuICAgICAgICB0aGlzLl9zZXRGaWVsZFN0YXRlKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cblxuICAvKipcbiAgICogVXNlciB3YW50cyB0byBtYWtlIGVkaXRzIHRvIHRoZSB2YWx1ZSBlbnRyaWVzXG4gICAqIEBwYXJhbSBldmVudFxuICAgKi9cbiAgb25FZGl0KGV2ZW50PzogUG9wQmFzZUV2ZW50SW50ZXJmYWNlLCBkYXRhS2V5PzogbnVtYmVyKXtcbiAgICB0aGlzLmxvZy5ldmVudChgb25FZGl0YCwgZXZlbnQpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cblxuICAvKipcbiAgICogVXNlciB3YW50cyB0byByZW1vdmUgYSB2YWx1ZSBlbnRyeVxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uUmVtb3ZlKGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2Upe1xuICAgIHRoaXMubG9nLmV2ZW50KGBvblJlbW92ZWAsIGV2ZW50KTtcbiAgICBjb25zb2xlLmxvZygnaGVyZScpO1xuICAgIGlmKCB0aGlzLmZpZWxkLmZhY2FkZSApe1xuICAgICAgdGhpcy5vbkJ1YmJsZUV2ZW50KCdvblJlbW92ZScsIG51bGwsIGV2ZW50KTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUubG9nKCdyZWFsIGRlbGV0ZSBhY3Rpb24nKTtcbiAgICB9XG4gICAgdGhpcy5fc2V0RmllbGRTdGF0ZSgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cblxuICAvKipcbiAgICogVXNlciBjbG9zZXMgdGhlIGVkaXQgYWJpbGl0eSBvZiB0aGUgdmFsdWUgZW50cmllc1xuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uQ2xvc2UoZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSl7XG4gICAgdGhpcy5sb2cuZXZlbnQoYG9uQ2xvc2VgLCBldmVudCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgdXNlciBjYW4gY2xpY2sgb24gYSBsaW5rIHRvIHZpZXcgdGhlIGNvbmZpZyBzZXR1cCBvZiB0aGlzIGZpZWxkXG4gICAqL1xuICBvbk5hdmlnYXRlVG9GaWVsZCgpOiB2b2lke1xuICAgIHRoaXMuc3J2LnJvdXRlci5uYXZpZ2F0ZShbICdlbnRpdGllcycsICdmaWVsZHMnLCB0aGlzLmZpZWxkLmlkIF0pLmNhdGNoKChlKSA9PiB0cnVlKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEhhbmRsZSB0aGUgYnViYmxlIGV2ZW50cyB0aGF0IGNvbWUgdXBcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuICBvbkJ1YmJsZUV2ZW50KG5hbWU/OiBzdHJpbmcsIGV4dGVuc2lvbj86IERpY3Rpb25hcnk8YW55PiwgZXZlbnQ/OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2Upe1xuICAgIHRoaXMubG9nLmV2ZW50KGBvbkJ1YmJsZUV2ZW50YCwgZXZlbnQpO1xuICAgIHRoaXMuX3NldEZpZWxkU3RhdGUoKTtcbiAgICB0aGlzLmV2ZW50cy5lbWl0KGV2ZW50KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENsZWFuIHVwIHRoZSBkb20gb2YgdGhpcyBjb21wb25lbnRcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLyoqXG4gICAqIFNldCBpbnRlcm5hbCBzdGF0ZSBmbGFncyBvZiBhIGZpZWxkXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9zZXRGaWVsZFN0YXRlKCk6IHZvaWR7XG5cbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBhbGxvdy10ZW1wbGF0ZS1jaGFuZ2VzYCwgKCkgPT4ge1xuICAgICAgLy8gdGhpcy5maWVsZC5jYW5BZGQgPSB0aGlzLmZpZWxkLm11bHRpcGxlICYmIHRoaXMuZmllbGQuZGF0YV9rZXlzLmxlbmd0aCA8IHRoaXMuZmllbGQubXVsdGlwbGVfbWF4O1xuICAgICAgdGhpcy5maWVsZC5jYW5BZGQgPSB0aGlzLmZpZWxkLm11bHRpcGxlICYmIHRoaXMuZmllbGQuZGF0YV9rZXlzLmxlbmd0aCA8IHRoaXMuZmllbGQuZW50cmllcy5sZW5ndGg7XG4gICAgICB0aGlzLmZpZWxkLmNhblJlbW92ZSA9IHRoaXMuZmllbGQubXVsdGlwbGUgJiYgdGhpcy5maWVsZC5kYXRhX2tleXMubGVuZ3RoID4gdGhpcy5maWVsZC5tdWx0aXBsZV9taW47XG4gICAgfSwgMTAwKTtcblxuICB9XG5cblxuICAvKipcbiAgICogSW50ZXJlcHQgdGhlIG1vdXNlIHJpZ2h0IGNsaWNrIHRvIHNob3cgYSBjb250ZXh0IG1lbnUgZm9yIHRoaXMgZmllbGRcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuICBwcml2YXRlIF9hdHRhY2hDb250ZXh0TWVudSgpOiB2b2lke1xuXG4gICAgdGhpcy5kb20uY29udGV4dE1lbnUuY29uZmlnID0gbmV3IFBvcENvbnRleHRNZW51Q29uZmlnKCk7XG4gICAgLy9cbiAgICB0aGlzLmRvbS5jb250ZXh0TWVudS5jb25maWd1cmUgPSAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IGhhc0FjY2VzcyA9IHRydWU7IC8vIFRCRFxuICAgICAgaWYoIGhhc0FjY2VzcyAmJiB0aGlzLmRvbS5jb250ZXh0TWVudS5jb25maWcgKXtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTsgLy8gcHJldmVudCB0aGUgZGVmYXVsdCBiZWhhdmlvciBvZiB0aGUgcmlnaHQgY2xpY2suXG4gICAgICAgIC8vIHJlc2V0IHRoZSBjb250ZXh0IG1lbnUsIGFuZCBjb25maWd1cmUgaXQgdG8gbG9hZCBhdCB0aGUgcG9zaXRpb24gY2xpY2tlZC5cbiAgICAgICAgdGhpcy5kb20uY29udGV4dE1lbnUuY29uZmlnLnJlc2V0T3B0aW9ucygpO1xuICAgICAgICB0aGlzLmRvbS5jb250ZXh0TWVudS5jb25maWcuYWRkUG9ydGFsT3B0aW9uKCdmaWVsZCcsIHRoaXMuZmllbGQuaWQpO1xuICAgICAgICB0aGlzLmRvbS5jb250ZXh0TWVudS5jb25maWcuYWRkTmV3VGFiT3B0aW9uKGBlbnRpdGllcy9maWVsZHMvJHt0aGlzLmZpZWxkLmlkfWApO1xuXG4gICAgICAgIHRoaXMuZG9tLmNvbnRleHRNZW51LmNvbmZpZy54ID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgdGhpcy5kb20uY29udGV4dE1lbnUuY29uZmlnLnkgPSBldmVudC5jbGllbnRZO1xuICAgICAgICB0aGlzLmRvbS5jb250ZXh0TWVudS5jb25maWcudG9nZ2xlLm5leHQodHJ1ZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLmRvbS5zZXRTdWJzY3JpYmVyKCdjb250ZXh0LW1lbnUnLCB0aGlzLmRvbS5jb250ZXh0TWVudS5jb25maWcuZW1pdHRlci5zdWJzY3JpYmUoKGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UpID0+IHtcbiAgICAgIHRoaXMuZXZlbnRzLmVtaXQoZXZlbnQpO1xuICAgIH0pKTtcbiAgfVxufVxuIl19