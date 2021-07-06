import { ChangeDetectorRef, Component, ElementRef, Input, Renderer2, } from '@angular/core';
import { PopFieldItemComponent } from '../pop-field-item.component';
export class PopCheckboxComponent extends PopFieldItemComponent {
    constructor(el, renderer, cdr) {
        super();
        this.el = el;
        this.renderer = renderer;
        this.cdr = cdr;
        this.name = 'PopCheckboxComponent';
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.dom.state.indeterminate = false;
                this.asset.storedValue = +this.config.control.value === 1 ? true : false;
                return resolve(true);
            });
        };
    }
    /**
     * This component should have a specific purpose
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * This will position the feedback container in the right spot
     */
    ngAfterViewInit() {
        this.asset.checkBoxBackground = this.el.nativeElement.querySelector('.mat-checkbox-background');
        this.asset.checkBoxFrame = this.el.nativeElement.querySelector('.mat-checkbox-frame');
        this.cdr.detectChanges();
    }
    onEnter(event) {
        if (this.config.tabOnEnter) {
            this.dom.focusNextInput(this.el);
        }
    }
    _beforePatch() {
        return new Promise((resolve) => {
            const patch = this.config.patch;
            const control = this.config.control;
            control.disable();
            patch.running = true;
            this._onHideCheckbox();
            this._clearMessage();
            return resolve(true);
        });
    }
    _afterPatch() {
        return new Promise((resolve) => {
            const patch = this.config.patch;
            const control = this.config.control;
            control.enable();
            control.markAsPristine();
            patch.running = false;
            return resolve(true);
        });
    }
    _onPatchSuccessAdditional() {
        this._displayCheckbox();
        return true;
    }
    _onPatchFailAdditional() {
        this._displayCheckbox();
        return true;
    }
    /**
     * This will trigger when the user click the checkbox to subject its value
     * This updates the config value since that is auto-handled with this input type
     */
    onToggleValue() {
        const value = !this.asset.storedValue;
        this.config.control.setValue(value, { emitEvent: true });
        this.onChange(value);
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
     * This will make the checkbox hidden in the view
     */
    _onHideCheckbox() {
        this.renderer.setStyle(this.asset.checkBoxFrame, 'border-color', '');
        this.renderer.setStyle(this.asset.checkBoxBackground, 'background-color', '');
        this.renderer.setStyle(this.asset.checkBoxBackground, 'border', '');
        this.renderer.setStyle(this.asset.checkBoxBackground, 'display', 'none');
    }
    /**
     * This will make the checkbox visible in the view
     */
    _displayCheckbox() {
        this.renderer.setStyle(this.asset.checkBoxBackground, 'display', 'block');
    }
}
PopCheckboxComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-checkbox',
                template: "<div class=\"pop-checkbox-container pop-checkbox-label-{{config.labelPosition}} pop-checkbox-{{config.textOverflow}}-text position-{{this.config.align}} import-field-item-container\" [ngClass]=\"{'pop-checkbox-has-label':config.label, 'pop-checkbox-no-label': !config.label, 'pop-checkbox-reverse':config.label && config.labelPosition === 'before'}\">\n  <mat-checkbox\n    [formControl]=config.control\n    [ngClass]=\"{'pop-checkbox-no-pointer': config.patch.running}\"\n    [(indeterminate)]=\"dom.state.indeterminate\"\n    [labelPosition]=\"config.labelPosition\"\n    (click)=\"$event.stopPropagation();\"\n    (change)=\"onChange();\"\n    (keyup.enter)=\"onEnter($event)\"\n  >\n  </mat-checkbox>\n\n  <!--<div class=\"pop-checkbox-spacer\" *ngIf=\"config.label\"></div>-->\n  <div class=\"pop-checkbox-filler\" *ngIf=\"config.label\"></div>\n  <div class=\"pop-checkbox-column\">\n    <lib-pop-field-item-error class=\"pop-checkbox-error\" [hidden]=\"!config.message || !config.label\" [message]=\"config.message\"></lib-pop-field-item-error>\n    <lib-pop-field-item-helper class=\"pop-checkbox-helper\" [hidden]=\"config.message || !config.label\" [helpText]=config.helpText></lib-pop-field-item-helper>\n  </div>\n  <div *ngIf=\"config.label\" class=\"pop-checkbox-label\">\n    <h4>{{config.label}}</h4>\n  </div>\n  <lib-pop-field-item-loader [show]=\"config.patch.displayIndicator && config.patch.running\"></lib-pop-field-item-loader>\n</div>\n\n\n\n",
                styles: [":host{width:100%}.pop-checkbox-container{position:relative;display:flex;flex-direction:row;flex:1;box-sizing:border-box;-moz-box-sizing:border-box;justify-content:flex-start;align-items:center;min-height:40px}.pop-checkbox-reverse{flex-direction:row-reverse!important}.pop-checkbox-sub-container{display:flex;flex-grow:1;max-width:calc(var(--field-max-width) - 40px)}.pop-checkbox-filler{flex:1;flex-grow:1;min-width:10px;min-height:35px}.pop-checkbox-spacer{width:10px;box-sizing:border-box}.pop-checkbox-row{display:flex;padding-top:2px;flex-grow:1;margin-bottom:var(--gap-xxs);text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.pop-checkbox-column{display:flex;flex-direction:column;align-items:center;justify-content:center;max-width:30px;min-width:30px}:host ::ng-deep .pop-checkbox-has-label .pop-checkbox-row{margin-top:var(--gap-xs)}:host ::ng-deep .pop-checkbox-has-label .mat-checkbox-layout{flex-grow:1!important}:host ::ng-deep .pop-checkbox-has-label .mat-checkbox-label{flex-grow:1!important}.pop-checkbox-no-label{margin-left:0!important;margin-right:0!important;padding-left:0!important;padding-right:0!important}:host ::ng-deep .pop-checkbox-no-label .mat-checkbox-inner-container{margin-left:0}:host ::ng-deep .pop-checkbox-no-label.position-left mat-checkbox{float:left}:host ::ng-deep .pop-checkbox-no-label.position-center mat-checkbox{margin:auto}:host ::ng-deep .pop-checkbox-no-label.position-right mat-checkbox{float:right}:host ::ng-deep .pop-checkbox-hover:hover{background:var(--accent-shade)!important}:host ::ng-deep .pop-checkbox-has-label.pop-checkbox-label-before .pop-checkbox-label{padding-right:var(--gap-xs)}:host ::ng-deep .pop-checkbox-has-label.pop-checkbox-label-after .pop-checkbox-label{padding-left:var(--gap-xs);padding-right:var(--gap-xs)}:host ::ng-deep .pop-checkbox-has-label.pop-checkbox-ellipsis-text .pop-checkbox-label{text-overflow:ellipsis;overflow:hidden;white-space:nowrap}:host ::ng-deep .pop-checkbox-has-label.pop-checkbox-ellipsis-text .pop-checkbox-label>h4{text-overflow:ellipsis;overflow:hidden;white-space:nowrap;min-width:0}:host ::ng-deep .pop-checkbox-has-label.pop-checkbox-wrap-text .pop-checkbox-label>h4{overflow-wrap:break-spaces!important;word-wrap:break-spaces!important;white-space:normal!important}.pop-checkbox-helper{position:relative;top:3px;left:0;font-size:.7em}.pop-checkbox-error{position:relative;top:2px;left:2px;z-index:2}:host ::ng-deep .pop-checkbox-error .mat-icon{font-size:.9em}.pop-checkbox-no-label-adjust{margin-top:1px}.pop-checkbox-no-pointer{pointer-events:none}:host ::ng-deep h4{margin:0;flex:1}"]
            },] }
];
PopCheckboxComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: Renderer2 },
    { type: ChangeDetectorRef }
];
PopCheckboxComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWNoZWNrYm94LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLWNoZWNrYm94L3BvcC1jaGVja2JveC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNVLGlCQUFpQixFQUNoQyxTQUFTLEVBQ1QsVUFBVSxFQUNWLEtBQUssRUFFTCxTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFVcEUsTUFBTSxPQUFPLG9CQUFxQixTQUFRLHFCQUFxQjtJQUs3RCxZQUNTLEVBQWMsRUFDYixRQUFtQixFQUNqQixHQUFzQjtRQUVoQyxLQUFLLEVBQUUsQ0FBQztRQUpELE9BQUUsR0FBRixFQUFFLENBQVk7UUFDYixhQUFRLEdBQVIsUUFBUSxDQUFXO1FBQ2pCLFFBQUcsR0FBSCxHQUFHLENBQW1CO1FBTjNCLFNBQUksR0FBRyxzQkFBc0IsQ0FBQztRQVNuQzs7V0FFRztRQUNILElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLEdBQXFCLEVBQUU7WUFDMUMsT0FBTyxJQUFJLE9BQU8sQ0FBRSxDQUFFLE9BQU8sRUFBRyxFQUFFO2dCQUNoQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO2dCQUNyQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUN6RSxPQUFPLE9BQU8sQ0FBRSxJQUFJLENBQUUsQ0FBQztZQUN6QixDQUFDLENBQUUsQ0FBQztR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RUFBRSxFQUFFLENBQUUsQ0FBQztRQUNoRixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUUsQ0FBQztRQUN0RSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUUsQ0FBQztJQUM3RSxDQUFDO0lBR0Q7O09BRUc7SUFDSyxnQkFBZ0I7UUFDdEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFFLENBQUM7SUFDOUUsQ0FBQzs7O1lBNUlGLFNBQVMsU0FBRTtnQkFDVixRQUFRLEVBQUUsa0JBQWtCO2dCQUM1QixzOENBQTRDOzthQUU3Qzs7O1lBZkMsVUFBVTtZQUdWLFNBQVM7WUFMTSxpQkFBaUI7OztxQkFtQi9CLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBBZnRlclZpZXdJbml0LCBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBJbnB1dCwgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIFJlbmRlcmVyMixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDaGVja2JveENvbmZpZyB9IGZyb20gJy4vY2hlY2tib3gtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IFBvcEZpZWxkSXRlbUNvbXBvbmVudCB9IGZyb20gJy4uL3BvcC1maWVsZC1pdGVtLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBGb3JtQ29udHJvbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IEZpZWxkSXRlbVBhdGNoSW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5cblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtY2hlY2tib3gnLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLWNoZWNrYm94LmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbICcuL3BvcC1jaGVja2JveC5jb21wb25lbnQuc2NzcycgXSxcbn0gKVxuZXhwb3J0IGNsYXNzIFBvcENoZWNrYm94Q29tcG9uZW50IGV4dGVuZHMgUG9wRmllbGRJdGVtQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBjb25maWc6IENoZWNrYm94Q29uZmlnO1xuICBwdWJsaWMgbmFtZSA9ICdQb3BDaGVja2JveENvbXBvbmVudCc7XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyLFxuICAgIHByb3RlY3RlZCBjZHI6IENoYW5nZURldGVjdG9yUmVmXG4gICl7XG4gICAgc3VwZXIoKTtcbiAgICAvKipcbiAgICAgKiBUaGlzIHNob3VsZCB0cmFuc2Zvcm0gYW5kIHZhbGlkYXRlIHRoZSBkYXRhLiBUaGUgdmlldyBzaG91bGQgdHJ5IHRvIG9ubHkgdXNlIGRhdGEgdGhhdCBpcyBzdG9yZWQgb24gdWkgc28gdGhhdCBpdCBpcyBub3QgZGVwZW5kZW50IG9uIHRoZSBzdHJ1Y3R1cmUgb2YgZGF0YSB0aGF0IGNvbWVzIGZyb20gb3RoZXIgc291cmNlcy4gVGhlIHVpIHNob3VsZCBiZSB0aGUgc291cmNlIG9mIHRydXRoIGhlcmUuXG4gICAgICovXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUgKSA9PiB7XG4gICAgICAgIHRoaXMuZG9tLnN0YXRlLmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5hc3NldC5zdG9yZWRWYWx1ZSA9ICt0aGlzLmNvbmZpZy5jb250cm9sLnZhbHVlID09PSAxID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCBzaG91bGQgaGF2ZSBhIHNwZWNpZmljIHB1cnBvc2VcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgd2lsbCBwb3NpdGlvbiB0aGUgZmVlZGJhY2sgY29udGFpbmVyIGluIHRoZSByaWdodCBzcG90XG4gICAqL1xuICBuZ0FmdGVyVmlld0luaXQoKXtcbiAgICB0aGlzLmFzc2V0LmNoZWNrQm94QmFja2dyb3VuZCA9IHRoaXMuZWwubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCAnLm1hdC1jaGVja2JveC1iYWNrZ3JvdW5kJyApO1xuICAgIHRoaXMuYXNzZXQuY2hlY2tCb3hGcmFtZSA9IHRoaXMuZWwubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCAnLm1hdC1jaGVja2JveC1mcmFtZScgKTtcblxuICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgfVxuXG5cbiAgb25FbnRlciggZXZlbnQgKXtcbiAgICBpZiggdGhpcy5jb25maWcudGFiT25FbnRlciApe1xuICAgICAgdGhpcy5kb20uZm9jdXNOZXh0SW5wdXQoIHRoaXMuZWwgKTtcbiAgICB9XG4gIH1cblxuXG4gIF9iZWZvcmVQYXRjaCgpOiBQcm9taXNlPGJvb2xlYW4+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlICkgPT4ge1xuICAgICAgY29uc3QgcGF0Y2ggPSA8RmllbGRJdGVtUGF0Y2hJbnRlcmZhY2U+dGhpcy5jb25maWcucGF0Y2g7XG4gICAgICBjb25zdCBjb250cm9sID0gPEZvcm1Db250cm9sPnRoaXMuY29uZmlnLmNvbnRyb2w7XG5cbiAgICAgIGNvbnRyb2wuZGlzYWJsZSgpO1xuICAgICAgcGF0Y2gucnVubmluZyA9IHRydWU7XG4gICAgICB0aGlzLl9vbkhpZGVDaGVja2JveCgpO1xuXG4gICAgICB0aGlzLl9jbGVhck1lc3NhZ2UoKTtcblxuICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIF9hZnRlclBhdGNoKCk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUgKSA9PiB7XG4gICAgICBjb25zdCBwYXRjaCA9IDxGaWVsZEl0ZW1QYXRjaEludGVyZmFjZT50aGlzLmNvbmZpZy5wYXRjaDtcbiAgICAgIGNvbnN0IGNvbnRyb2wgPSA8Rm9ybUNvbnRyb2w+dGhpcy5jb25maWcuY29udHJvbDtcblxuICAgICAgY29udHJvbC5lbmFibGUoKTtcbiAgICAgIGNvbnRyb2wubWFya0FzUHJpc3RpbmUoKTtcbiAgICAgIHBhdGNoLnJ1bm5pbmcgPSBmYWxzZTtcblxuICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIHByb3RlY3RlZCBfb25QYXRjaFN1Y2Nlc3NBZGRpdGlvbmFsKCk6IGJvb2xlYW57XG4gICAgdGhpcy5fZGlzcGxheUNoZWNrYm94KCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuXG4gIHByb3RlY3RlZCBfb25QYXRjaEZhaWxBZGRpdGlvbmFsKCk6IGJvb2xlYW57XG4gICAgdGhpcy5fZGlzcGxheUNoZWNrYm94KCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgdHJpZ2dlciB3aGVuIHRoZSB1c2VyIGNsaWNrIHRoZSBjaGVja2JveCB0byBzdWJqZWN0IGl0cyB2YWx1ZVxuICAgKiBUaGlzIHVwZGF0ZXMgdGhlIGNvbmZpZyB2YWx1ZSBzaW5jZSB0aGF0IGlzIGF1dG8taGFuZGxlZCB3aXRoIHRoaXMgaW5wdXQgdHlwZVxuICAgKi9cbiAgb25Ub2dnbGVWYWx1ZSgpe1xuICAgIGNvbnN0IHZhbHVlID0gIXRoaXMuYXNzZXQuc3RvcmVkVmFsdWU7XG4gICAgdGhpcy5jb25maWcuY29udHJvbC5zZXRWYWx1ZSggdmFsdWUsIHsgZW1pdEV2ZW50OiB0cnVlIH0gKTtcbiAgICB0aGlzLm9uQ2hhbmdlKCB2YWx1ZSApO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIGRvbSBkZXN0cm95IGZ1bmN0aW9uIG1hbmFnZXMgYWxsIHRoZSBjbGVhbiB1cCB0aGF0IGlzIG5lY2Vzc2FyeSBpZiBzdWJzY3JpcHRpb25zLCB0aW1lb3V0cywgZXRjIGFyZSBzdG9yZWQgcHJvcGVybHlcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAvKipcbiAgICogVGhpcyB3aWxsIG1ha2UgdGhlIGNoZWNrYm94IGhpZGRlbiBpbiB0aGUgdmlld1xuICAgKi9cbiAgcHJpdmF0ZSBfb25IaWRlQ2hlY2tib3goKXtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKCB0aGlzLmFzc2V0LmNoZWNrQm94RnJhbWUsICdib3JkZXItY29sb3InLCAnJyApO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoIHRoaXMuYXNzZXQuY2hlY2tCb3hCYWNrZ3JvdW5kLCAnYmFja2dyb3VuZC1jb2xvcicsICcnICk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSggdGhpcy5hc3NldC5jaGVja0JveEJhY2tncm91bmQsICdib3JkZXInLCAnJyApO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoIHRoaXMuYXNzZXQuY2hlY2tCb3hCYWNrZ3JvdW5kLCAnZGlzcGxheScsICdub25lJyApO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyB3aWxsIG1ha2UgdGhlIGNoZWNrYm94IHZpc2libGUgaW4gdGhlIHZpZXdcbiAgICovXG4gIHByaXZhdGUgX2Rpc3BsYXlDaGVja2JveCgpe1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoIHRoaXMuYXNzZXQuY2hlY2tCb3hCYWNrZ3JvdW5kLCAnZGlzcGxheScsICdibG9jaycgKTtcbiAgfVxuXG59XG4iXX0=