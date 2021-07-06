import { __awaiter } from "tslib";
import { Component, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { Sleep } from '../../../../pop-common-utility';
export class PopTextareaComponent extends PopFieldItemComponent {
    constructor(el, renderer) {
        super();
        this.el = el;
        this.renderer = renderer;
        this.name = 'PopTextareaComponent';
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                if (this.config.autoSize) {
                    this.dom.setSubscriber('auto-size', this.config.control.valueChanges.subscribe(() => {
                        this.onAutoSize();
                    }));
                }
                else {
                    if (+this.config.height) {
                        this.renderer.setStyle(this.textAreaRef.nativeElement, 'height', this.config.height + 'px');
                    }
                }
                resolve(true);
            });
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                if (this.config.autoSize && this.config.control.value) {
                    yield Sleep(5);
                    this.onAutoSize();
                }
                resolve(true);
            }));
        };
    }
    /**
     * This component should have a specific purpose
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * Trigger on key up event
     */
    onKeyUp() {
        this.onBubbleEvent(`onKeyUp`);
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
    onAutoSize() {
        this.dom.setTimeout('size-delay', () => {
            this.renderer.setStyle(this.textAreaRef.nativeElement, 'height', '0');
            let height = this.textAreaRef.nativeElement.scrollHeight;
            if (+this.config.height && height < this.config.height)
                height = this.config.height;
            if (+this.config.maxHeight && height > this.config.maxHeight)
                height = this.config.maxHeight;
            this.renderer.setStyle(this.textAreaRef.nativeElement, 'height', height + 'px');
        }, 250);
    }
}
PopTextareaComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-textarea',
                template: "<!-- <div class=\"import-field-item-container pop-textarea-container\" [ngClass]=\"{'pop-textarea-container-tooltip-adjust': config.tooltip && dom.state.tooltip}\"> -->\n<div class=\"import-field-item-container pop-textarea-container\" >\n<div class=\"pop-textarea-feedback-container\">\n    <!--<lib-main-spinner-->\n      <!--[ngClass]=\"{'sw-hidden': !config.patch.running || !config.patch.displayIndicator, 'switch-no-pointer': config.patch.running}\"-->\n      <!--[options]=\"{strokeWidth:3, color:'accent', diameter:18}\">-->\n    <!--</lib-main-spinner>-->\n    <!--<mat-icon-->\n      <!--class=\"pop-textarea-error-icon\"-->\n      <!--[ngClass]=\"{'sw-hidden': !config.message || config.patch.running}\"-->\n      <!--[matTooltipPosition]=\"'left'\"-->\n      <!--[matTooltip]=config.message-->\n      <!--[color]=\"'warn'\">info-->\n    <!--</mat-icon>-->\n  <lib-pop-field-item-error class=\"pop-textarea-error-icon\" [hidden]=\"!config.message\" [message]=\"config.message\"></lib-pop-field-item-error>\n    <!--<div-->\n      <!--*ngIf=\"config.helpText && !config.message && ( !config.patch || !config.patch.running )\"-->\n      <!--class=\"sw-pop-icon textarea-helper-icon\"-->\n      <!--(mouseenter)=\"dom.state.helper = true\"-->\n      <!--(mouseleave)=\"dom.state.helper = false\"-->\n      <!--matTooltip=\"{{config.helpText}}\"-->\n      <!--matTooltipPosition=\"left\">X-->\n    <!--</div>-->\n  <lib-pop-field-item-helper class=\"textarea-helper-icon\" [hidden]=\"config.message\" [helpText]=config.helpText></lib-pop-field-item-helper>\n  </div>\n<!--  <div *ngIf=\"config.tooltip && dom.state.tooltip\" class=\"pop-textarea-tooltip-container\" [innerHTML]=config.tooltip></div>-->\n  <mat-form-field appearance=\"outline\" class=\"import-field-item-container-expansion\" [title]=\"config?.tooltip\">\n    <mat-label *ngIf=\"config.label\">{{config.label}}</mat-label>\n    <textarea\n      #textArea\n      matInput\n      [readonly]=config.readonly\n      [formControl]=config.control\n      [maxlength]=config.maxlength\n      spellcheck=\"false\"\n      (focus)=\"dom.state.tooltip=true; onFocus();\"\n      (keyup)=\"onKeyUp();\"\n      (blur)=\"dom.state.tooltip=false; onBlur();\">\n\n    </textarea>\n    <mat-hint *ngIf=\"config.hint\" align=\"end\">{{textArea.value?.length || 0}}/{{config.maxlength}}</mat-hint>\n  </mat-form-field>\n  <lib-pop-field-item-loader [show]=\"config.patch.displayIndicator && config.patch.running\"></lib-pop-field-item-loader>\n</div>\n\n",
                styles: [".pop-textarea-feedback-container{position:absolute;right:2px;top:4px;width:20px;z-index:2}.pop-textarea-error-icon{position:relative;top:2px;right:-2px;cursor:pointer}:host ::ng-deep .pop-textarea-error-icon mat-icon{font-size:.98em!important}.textarea-helper-icon{position:relative;font-size:.7em;right:-2px;top:4px;cursor:pointer}:host ::ng-deep .mat-form-field-appearance-outline .mat-form-field-wrapper{padding-bottom:0;margin:0!important}:host ::ng-deep .mat-form-field-appearance-outline textarea{resize:none;min-height:40px}"]
            },] }
];
PopTextareaComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: Renderer2 }
];
PopTextareaComponent.propDecorators = {
    textAreaRef: [{ type: ViewChild, args: ['textArea', { static: true },] }],
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXRleHRhcmVhLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXRleHRhcmVhL3BvcC10ZXh0YXJlYS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLEtBQUssRUFHTCxTQUFTLEVBQ1QsU0FBUyxFQUNWLE1BQU0sZUFBZSxDQUFDO0FBR3ZCLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3BFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQVF2RCxNQUFNLE9BQU8sb0JBQXFCLFNBQVEscUJBQXFCO0lBTTdELFlBQ1MsRUFBYyxFQUNiLFFBQW1CO1FBRTNCLEtBQUssRUFBRSxDQUFDO1FBSEQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUNiLGFBQVEsR0FBUixRQUFRLENBQVc7UUFMdEIsU0FBSSxHQUFHLHNCQUFzQixDQUFDO1FBU25DOztXQUVHO1FBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBcUIsRUFBRTtZQUMxQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQzdCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7b0JBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTt3QkFDbEYsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUNwQixDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNMO3FCQUFLO29CQUNKLElBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBQzt3QkFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDO3FCQUM3RjtpQkFDRjtnQkFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFxQixFQUFFO1lBQ3hDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBTSxPQUFPLEVBQUUsRUFBRTtnQkFDbEMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUM7b0JBQ3BELE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNmLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztpQkFDbkI7Z0JBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hCLENBQUMsQ0FBQSxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7SUFDSixDQUFDO0lBR0Q7O09BRUc7SUFDSCxRQUFRO1FBQ04sS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFHRDs7T0FFRztJQUNILE9BQU87UUFDTCxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFHRDs7T0FFRztJQUNILFdBQVc7UUFDVCxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUdEOzs7OztzR0FLa0c7SUFHeEYsVUFBVTtRQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO1lBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN0RSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUM7WUFDekQsSUFBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU07Z0JBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQ25GLElBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTO2dCQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUM1RixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUUsTUFBTSxHQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2pGLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNWLENBQUM7OztZQXZGRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGtCQUFrQjtnQkFDNUIsdTlFQUE0Qzs7YUFFN0M7OztZQWpCQyxVQUFVO1lBSVYsU0FBUzs7OzBCQWVSLFNBQVMsU0FBQyxVQUFVLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO3FCQUN0QyxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIFJlbmRlcmVyMixcbiAgVmlld0NoaWxkXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBUZXh0YXJlYUNvbmZpZyB9IGZyb20gJy4vdGV4dGFyZWEtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IFBvcEZpZWxkSXRlbUNvbXBvbmVudCB9IGZyb20gJy4uL3BvcC1maWVsZC1pdGVtLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBTbGVlcCB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC10ZXh0YXJlYScsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3AtdGV4dGFyZWEuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLXRleHRhcmVhLmNvbXBvbmVudC5zY3NzJyBdXG59KVxuZXhwb3J0IGNsYXNzIFBvcFRleHRhcmVhQ29tcG9uZW50IGV4dGVuZHMgUG9wRmllbGRJdGVtQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBAVmlld0NoaWxkKCd0ZXh0QXJlYScsIHsgc3RhdGljOiB0cnVlIH0pIHByaXZhdGUgdGV4dEFyZWFSZWY6IEVsZW1lbnRSZWY7XG4gIEBJbnB1dCgpIGNvbmZpZzogVGV4dGFyZWFDb25maWc7XG4gIHB1YmxpYyBuYW1lID0gJ1BvcFRleHRhcmVhQ29tcG9uZW50JztcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcml2YXRlIHJlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICl7XG4gICAgc3VwZXIoKTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgc2hvdWxkIHRyYW5zZm9ybSBhbmQgdmFsaWRhdGUgdGhlIGRhdGEuIFRoZSB2aWV3IHNob3VsZCB0cnkgdG8gb25seSB1c2UgZGF0YSB0aGF0IGlzIHN0b3JlZCBvbiB1aSBzbyB0aGF0IGl0IGlzIG5vdCBkZXBlbmRlbnQgb24gdGhlIHN0cnVjdHVyZSBvZiBkYXRhIHRoYXQgY29tZXMgZnJvbSBvdGhlciBzb3VyY2VzLiBUaGUgdWkgc2hvdWxkIGJlIHRoZSBzb3VyY2Ugb2YgdHJ1dGggaGVyZS5cbiAgICAgKi9cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgaWYoIHRoaXMuY29uZmlnLmF1dG9TaXplICl7XG4gICAgICAgICAgdGhpcy5kb20uc2V0U3Vic2NyaWJlcignYXV0by1zaXplJywgdGhpcy5jb25maWcuY29udHJvbC52YWx1ZUNoYW5nZXMuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMub25BdXRvU2l6ZSgpO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgfSBlbHNle1xuICAgICAgICAgIGlmKCt0aGlzLmNvbmZpZy5oZWlnaHQpe1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLnRleHRBcmVhUmVmLm5hdGl2ZUVsZW1lbnQsICdoZWlnaHQnLCB0aGlzLmNvbmZpZy5oZWlnaHQgKyAncHgnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLmRvbS5wcm9jZWVkID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jKHJlc29sdmUpID0+IHtcbiAgICAgICAgaWYoIHRoaXMuY29uZmlnLmF1dG9TaXplICYmIHRoaXMuY29uZmlnLmNvbnRyb2wudmFsdWUpe1xuICAgICAgICAgIGF3YWl0IFNsZWVwKDUpO1xuICAgICAgICAgIHRoaXMub25BdXRvU2l6ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBjb21wb25lbnQgc2hvdWxkIGhhdmUgYSBzcGVjaWZpYyBwdXJwb3NlXG4gICAqL1xuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIG9uIGtleSB1cCBldmVudFxuICAgKi9cbiAgb25LZXlVcCgpOiB2b2lke1xuICAgIHRoaXMub25CdWJibGVFdmVudChgb25LZXlVcGApO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIGRvbSBkZXN0cm95IGZ1bmN0aW9uIG1hbmFnZXMgYWxsIHRoZSBjbGVhbiB1cCB0aGF0IGlzIG5lY2Vzc2FyeSBpZiBzdWJzY3JpcHRpb25zLCB0aW1lb3V0cywgZXRjIGFyZSBzdG9yZWQgcHJvcGVybHlcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICBwcm90ZWN0ZWQgb25BdXRvU2l6ZSgpe1xuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoJ3NpemUtZGVsYXknLCAoKSA9PiB7XG4gICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMudGV4dEFyZWFSZWYubmF0aXZlRWxlbWVudCwgJ2hlaWdodCcsICcwJyk7XG4gICAgICBsZXQgaGVpZ2h0ID0gdGhpcy50ZXh0QXJlYVJlZi5uYXRpdmVFbGVtZW50LnNjcm9sbEhlaWdodDtcbiAgICAgIGlmKCt0aGlzLmNvbmZpZy5oZWlnaHQgJiYgaGVpZ2h0IDwgdGhpcy5jb25maWcuaGVpZ2h0KSBoZWlnaHQgPSB0aGlzLmNvbmZpZy5oZWlnaHQ7XG4gICAgICBpZigrdGhpcy5jb25maWcubWF4SGVpZ2h0ICYmIGhlaWdodCA+IHRoaXMuY29uZmlnLm1heEhlaWdodCkgaGVpZ2h0ID0gdGhpcy5jb25maWcubWF4SGVpZ2h0O1xuICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLnRleHRBcmVhUmVmLm5hdGl2ZUVsZW1lbnQsICdoZWlnaHQnLCBoZWlnaHQgKydweCcpO1xuICAgIH0sIDI1MCk7XG4gIH1cbn1cbiJdfQ==