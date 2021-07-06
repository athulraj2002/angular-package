import { __awaiter } from "tslib";
import { Component, ElementRef, HostBinding, Inject, Input, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { PopTemplateService } from './pop-template.service';
import { PopExtendComponent } from '../../pop-extend.component';
import { Router } from '@angular/router';
export class PopTemplateComponent extends PopExtendComponent {
    constructor(el, router, template, renderer, APP_GLOBAL, APP_THEME) {
        super();
        this.el = el;
        this.router = router;
        this.template = template;
        this.renderer = renderer;
        this.APP_GLOBAL = APP_GLOBAL;
        this.APP_THEME = APP_THEME;
        this.backdrop = true;
        this.menus = [];
        this.widgets = [];
        this.filter = true;
        this.left = true;
        this.right = true;
        this.displayMenu = true;
        this.name = 'PopTemplateComponent';
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.dom.setSubscriber('theme', this.APP_THEME.init.subscribe((val) => {
                    this.dom.setTimeout(`remove-backdrop`, () => {
                        this.renderer.removeClass(document.body, 'site-backdrop-dark');
                    }, 0);
                    if (val)
                        this.backdrop = !val;
                }));
                this.dom.setSubscriber('init', this.APP_GLOBAL.init.subscribe((val) => {
                    if (val)
                        this._initialize();
                }));
                window.onbeforeunload = () => {
                    try {
                        this.APP_GLOBAL._unload.next(true);
                    }
                    catch (e) {
                        console.log(e);
                    }
                };
                return resolve(true);
            }));
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.template.setContentEl(this.content);
                return resolve(true);
            }));
        };
    }
    ngOnInit() {
        super.ngOnInit();
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    _initialize() {
        return true;
    }
}
PopTemplateComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-template',
                template: "<div class=\"pop-template\">\n  <header class=\"pop-template-header\" #header *ngIf=\"displayMenu\">\n    <lib-pop-menu></lib-pop-menu>\n  </header>\n  <section class=\"pop-template-section\">\n    <aside class=\"pop-template-aside-left\">\n      <lib-pop-left-menu [hidden]=!left [entityMenus]=\"menus\"></lib-pop-left-menu>\n    </aside>\n    <div class=\"pop-template-main\">\n      <lib-pop-cac-filter #filter></lib-pop-cac-filter>\n      <div class=\"sw-outlet-target pop-template-content-overflow\">\n        <router-outlet></router-outlet>\n      </div>\n    </div>\n    <aside class=\"pop-template-aside-right\">\n      <lib-pop-widget-bar  [hidden]=!right [widgets]=\"widgets\"></lib-pop-widget-bar>\n    </aside>\n  </section>\n  <footer class=\"pop-template-footer\"></footer>\n</div>\n\n",
                encapsulation: ViewEncapsulation.None,
                styles: [":host{height:100%;display:flex;flex-direction:column;position:absolute;top:0;bottom:0;left:0;right:0}:host ::ng-deep .mat-form-field .mat-form-field-infix{width:0}:host ::ng-deep .mat-form-field-appearance-outline .mat-form-field-flex{margin-top:0}.pop-template{width:100%;height:100vh;margin:0;display:flex;flex-direction:column;overflow-y:hidden}.pop-template-backdrop{background:pink}.pop-template-footer{height:0}.pop-template-section{flex:1;justify-content:space-between;display:flex;flex-direction:row;margin-top:48px}.pop-template-main{position:relative;flex:5}.pop-template-content-overflow{position:absolute!important;height:calc(100vh - 55px)!important;left:0;right:0;overflow-y:auto;overflow-x:auto}.pop-template-aside-left{border-right:1px solid var(--disabled);background:var(--background-main-menu)}.pop-template-aside-left,.pop-template-aside-right{flex:0;border-bottom:1px solid var(--disabled);box-sizing:border-box}.pop-template-aside-right{border-left:1px solid var(--disabled)}.pop-template-center{display:flex;align-items:center;justify-content:center}.pop-template-center div{text-align:center}"]
            },] }
];
PopTemplateComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: Router },
    { type: PopTemplateService },
    { type: Renderer2 },
    { type: undefined, decorators: [{ type: Inject, args: ['APP_GLOBAL',] }] },
    { type: undefined, decorators: [{ type: Inject, args: ['APP_THEME',] }] }
];
PopTemplateComponent.propDecorators = {
    header: [{ type: ViewChild, args: ['header',] }],
    content: [{ type: ViewChild, args: ['content',] }],
    backdrop: [{ type: HostBinding, args: ['class.pop-template-backdrop',] }, { type: Input }],
    menus: [{ type: Input }],
    widgets: [{ type: Input }],
    filter: [{ type: Input }],
    left: [{ type: Input }],
    right: [{ type: Input }],
    displayMenu: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXRlbXBsYXRlLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2FwcC9wb3AtdGVtcGxhdGUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBcUIsU0FBUyxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUU5SSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUk1RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFVekMsTUFBTSxPQUFPLG9CQUFxQixTQUFRLGtCQUFrQjtJQWUxRCxZQUNTLEVBQWMsRUFDYixNQUFjLEVBQ2QsUUFBNEIsRUFDNUIsUUFBbUIsRUFDSyxVQUE4QixFQUMvQixTQUE0QjtRQUUzRCxLQUFLLEVBQUUsQ0FBQztRQVBELE9BQUUsR0FBRixFQUFFLENBQVk7UUFDYixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsYUFBUSxHQUFSLFFBQVEsQ0FBb0I7UUFDNUIsYUFBUSxHQUFSLFFBQVEsQ0FBVztRQUNLLGVBQVUsR0FBVixVQUFVLENBQW9CO1FBQy9CLGNBQVMsR0FBVCxTQUFTLENBQW1CO1FBbEJOLGFBQVEsR0FBRyxJQUFJLENBQUM7UUFDOUQsVUFBSyxHQUFpQixFQUFFLENBQUM7UUFDekIsWUFBTyxHQUFVLEVBQUUsQ0FBQztRQUNwQixXQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ2QsU0FBSSxHQUFHLElBQUksQ0FBQztRQUNaLFVBQUssR0FBRyxJQUFJLENBQUM7UUFDYixnQkFBVyxHQUFHLElBQUksQ0FBQztRQUdyQixTQUFJLEdBQUcsc0JBQXNCLENBQUM7UUFhbkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBcUIsRUFBRTtZQUMxQyxPQUFPLElBQUksT0FBTyxDQUFFLENBQU8sT0FBTyxFQUFHLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUUsQ0FBRSxHQUFZLEVBQUcsRUFBRTtvQkFDakYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsR0FBRSxFQUFFO3dCQUN6QyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLG9CQUFvQixDQUFDLENBQUM7b0JBQ2pFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDTixJQUFJLEdBQUc7d0JBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLEdBQUcsQ0FBQztnQkFDakMsQ0FBQyxDQUFFLENBQUUsQ0FBQztnQkFDTixJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFFLENBQUUsR0FBWSxFQUFHLEVBQUU7b0JBQ2pGLElBQUksR0FBRzt3QkFBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQy9CLENBQUMsQ0FBRSxDQUFFLENBQUM7Z0JBRU4sTUFBTSxDQUFDLGNBQWMsR0FBRyxHQUFHLEVBQUU7b0JBQzNCLElBQUk7d0JBQ0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNwQztvQkFBQyxPQUFNLENBQUMsRUFBQzt3QkFDUixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNoQjtnQkFDSCxDQUFDLENBQUM7Z0JBRUYsT0FBTyxPQUFPLENBQUUsSUFBSSxDQUFFLENBQUM7WUFDekIsQ0FBQyxDQUFBLENBQUUsQ0FBQztRQUNOLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQXFCLEVBQUU7WUFDeEMsT0FBTyxJQUFJLE9BQU8sQ0FBRSxDQUFPLE9BQU8sRUFBRyxFQUFFO2dCQUNyQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBRSxJQUFJLENBQUMsT0FBTyxDQUFFLENBQUM7Z0JBQzNDLE9BQU8sT0FBTyxDQUFFLElBQUksQ0FBRSxDQUFDO1lBQ3pCLENBQUMsQ0FBQSxDQUFFLENBQUM7UUFDTixDQUFDLENBQUM7SUFDSixDQUFDO0lBR0QsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBR0QsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRUQ7Ozs7O3NHQUtrRztJQUUxRixXQUFXO1FBRWpCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQzs7O1lBbkZGLFNBQVMsU0FBRTtnQkFDVixRQUFRLEVBQUUsa0JBQWtCO2dCQUM1QiwyeUJBQTRDO2dCQUU1QyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7YUFDdEM7OztZQWhCbUIsVUFBVTtZQU9yQixNQUFNO1lBTE4sa0JBQWtCO1lBRm9ELFNBQVM7NENBcUNuRixNQUFNLFNBQUUsWUFBWTs0Q0FDcEIsTUFBTSxTQUFFLFdBQVc7OztxQkFwQnJCLFNBQVMsU0FBRSxRQUFRO3NCQUNuQixTQUFTLFNBQUUsU0FBUzt1QkFDcEIsV0FBVyxTQUFFLDZCQUE2QixjQUFJLEtBQUs7b0JBQ25ELEtBQUs7c0JBQ0wsS0FBSztxQkFDTCxLQUFLO21CQUNMLEtBQUs7b0JBQ0wsS0FBSzswQkFDTCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBIb3N0QmluZGluZywgSW5qZWN0LCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQsIFJlbmRlcmVyMiwgVmlld0NoaWxkLCBWaWV3RW5jYXBzdWxhdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRW50aXR5TWVudSB9IGZyb20gJy4vcG9wLWxlZnQtbWVudS9lbnRpdHktbWVudS5tb2RlbCc7XG5pbXBvcnQgeyBQb3BUZW1wbGF0ZVNlcnZpY2UgfSBmcm9tICcuL3BvcC10ZW1wbGF0ZS5zZXJ2aWNlJztcbmltcG9ydCB7XG4gIEFwcEdsb2JhbEludGVyZmFjZSwgQXBwVGhlbWVJbnRlcmZhY2UsXG59IGZyb20gJy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IGZhZGVJbk91dCB9IGZyb20gJy4uLy4uL3BvcC1jb21tb24tYW5pbWF0aW9ucy5tb2RlbCc7XG5cblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtdGVtcGxhdGUnLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLXRlbXBsYXRlLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbICcuL3BvcC10ZW1wbGF0ZS5jb21wb25lbnQuc2NzcycgXSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbn0gKVxuZXhwb3J0IGNsYXNzIFBvcFRlbXBsYXRlQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBAVmlld0NoaWxkKCAnaGVhZGVyJyApIGhlYWRlcjogRWxlbWVudFJlZjtcbiAgQFZpZXdDaGlsZCggJ2NvbnRlbnQnICkgY29udGVudDogRWxlbWVudFJlZjtcbiAgQEhvc3RCaW5kaW5nKCAnY2xhc3MucG9wLXRlbXBsYXRlLWJhY2tkcm9wJyApIEBJbnB1dCgpIGJhY2tkcm9wID0gdHJ1ZTtcbiAgQElucHV0KCkgbWVudXM6IEVudGl0eU1lbnVbXSA9IFtdO1xuICBASW5wdXQoKSB3aWRnZXRzOiBhbnlbXSA9IFtdO1xuICBASW5wdXQoKSBmaWx0ZXIgPSB0cnVlO1xuICBASW5wdXQoKSBsZWZ0ID0gdHJ1ZTtcbiAgQElucHV0KCkgcmlnaHQgPSB0cnVlO1xuICBASW5wdXQoKSBkaXNwbGF5TWVudSA9IHRydWU7XG5cblxuICBwdWJsaWMgbmFtZSA9ICdQb3BUZW1wbGF0ZUNvbXBvbmVudCc7XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcbiAgICBwcml2YXRlIHRlbXBsYXRlOiBQb3BUZW1wbGF0ZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyLFxuICAgIEBJbmplY3QoICdBUFBfR0xPQkFMJyApIHByaXZhdGUgQVBQX0dMT0JBTDogQXBwR2xvYmFsSW50ZXJmYWNlLFxuICAgIEBJbmplY3QoICdBUFBfVEhFTUUnICkgcHJpdmF0ZSBBUFBfVEhFTUU6IEFwcFRoZW1lSW50ZXJmYWNlLFxuICApe1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoIGFzeW5jKCByZXNvbHZlICkgPT4ge1xuICAgICAgICB0aGlzLmRvbS5zZXRTdWJzY3JpYmVyKCAndGhlbWUnLCB0aGlzLkFQUF9USEVNRS5pbml0LnN1YnNjcmliZSggKCB2YWw6IGJvb2xlYW4gKSA9PiB7XG4gICAgICAgICAgdGhpcy5kb20uc2V0VGltZW91dChgcmVtb3ZlLWJhY2tkcm9wYCwgKCk9PntcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQ2xhc3MoZG9jdW1lbnQuYm9keSwgJ3NpdGUtYmFja2Ryb3AtZGFyaycpO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIGlmKCB2YWwgKSB0aGlzLmJhY2tkcm9wID0gIXZhbDtcbiAgICAgICAgfSApICk7XG4gICAgICAgIHRoaXMuZG9tLnNldFN1YnNjcmliZXIoICdpbml0JywgdGhpcy5BUFBfR0xPQkFMLmluaXQuc3Vic2NyaWJlKCAoIHZhbDogYm9vbGVhbiApID0+IHtcbiAgICAgICAgICBpZiggdmFsICkgdGhpcy5faW5pdGlhbGl6ZSgpO1xuICAgICAgICB9ICkgKTtcblxuICAgICAgICB3aW5kb3cub25iZWZvcmV1bmxvYWQgPSAoKSA9PntcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5BUFBfR0xPQkFMLl91bmxvYWQubmV4dCh0cnVlKTtcbiAgICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcblxuICAgIHRoaXMuZG9tLnByb2NlZWQgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoIGFzeW5jKCByZXNvbHZlICkgPT4ge1xuICAgICAgICB0aGlzLnRlbXBsYXRlLnNldENvbnRlbnRFbCggdGhpcy5jb250ZW50ICk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcbiAgfVxuXG5cbiAgbmdPbkluaXQoKTogdm9pZHtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVuZGVyIFRoZSBIb29kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJpdmF0ZSBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICBwcml2YXRlIF9pbml0aWFsaXplKCl7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG5cbn1cbiJdfQ==