import { Component, ElementRef, Input } from '@angular/core';
import { TruncatePipe } from '../../../../pipes/truncate.pipe';
import { ButtonConfig } from '../pop-button/button-config.model';
import { Router } from '@angular/router';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { GetVerbStateTheme, IsObjectThrowError, StringReplaceAll } from '../../../../pop-common-utility';
import { PopHref, ServiceInjector } from '../../../../pop-common.model';
export class PopLabelComponent extends PopFieldItemComponent {
    constructor(el) {
        super();
        this.el = el;
        this.name = 'PopLabelComponent';
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.config = IsObjectThrowError(this.config, true, `${this.name}:configure: - this.config`) ? this.config : null;
                this.ui.copyLabel = undefined;
                this.ui.copyValue = undefined;
                this.ui.valueButton = undefined;
                this.dom.state.valueButton_theme = 'default';
                if (this.config.truncate) {
                    const truncatePipe = new TruncatePipe();
                    this.config.value = truncatePipe.transform(this.config.value, [this.config.truncate]);
                }
                if (this.config.copyLabel)
                    this.ui.copyLabel = new ButtonConfig({
                        // disabled: !this.config.copyLabelBody ? true : false,
                        disabled: false,
                        icon: this.config.copyLabelBody ? 'file_copy' : null,
                        value: this.config.copyLabelDisplay,
                        size: 25,
                        width: 100,
                        radius: 5,
                        text: 12,
                    });
                if (this.config.copyValue)
                    this.ui.copyValue = new ButtonConfig({
                        // disabled: !this.config.copyValueBody ? true : false,
                        disabled: false,
                        icon: this.config.copyValueBody ? 'file_copy' : null,
                        value: this.config.copyValueDisplay,
                        size: 25,
                        radius: 5,
                        text: 12,
                    });
                if (this.config.valueButton)
                    this.ui.valueButton = new ButtonConfig({
                        disabled: this.config.valueButtonDisabled ? true : false,
                        icon: this.config.icon,
                        value: this.config.valueButtonDisplay,
                        size: 25,
                        radius: 5,
                        text: 12,
                        bubble: true,
                        event: 'click'
                    });
                this._setValueButtonTheme();
                resolve(true);
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
     * The user can click on a link to route to another part of the app
     */
    onRouteLink() {
        if (this.config.route) {
            const routeApp = String(this.config.route).split('/');
            if (routeApp[1] && routeApp[1] === PopHref) {
                return ServiceInjector.get(Router).navigate([routeApp.slice(2).join('/')]).catch((e) => {
                    console.log(e);
                    return false;
                });
            }
        }
        return this.onBubbleEvent('link');
    }
    /**
     * The user can click on a label button to copy a value into the clipboard
     */
    onLabelCopy() {
        const nav = navigator;
        const strip = ['ID '];
        let body = String(this.config.copyLabelBody).slice();
        strip.map((tag) => {
            if (body.includes(tag))
                body = StringReplaceAll(body, tag, '');
        });
        nav.clipboard.writeText(body);
    }
    /**
     * The user can click on a button value and copy a value to the clipboard
     */
    onValueCopy() {
        const nav = navigator;
        const strip = ['ID '];
        let body = String(this.config.copyValueBody).slice();
        strip.map((tag) => {
            if (body.includes(tag))
                body = StringReplaceAll(body, tag, '');
        });
        nav.clipboard.writeText(body);
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
     * This fx basically checks the label value to sees if it can be associated with a color scheme aka warning, success, error
     */
    _setValueButtonTheme() {
        if (this.config.valueButton) {
            if (this.config.valueButtonDisplay) {
                this.dom.state.valueButton_theme = GetVerbStateTheme(this.config.valueButtonDisplay);
            }
        }
    }
}
PopLabelComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-label',
                template: "<div class=\"import-field-item-container pop-label-container\" [ngClass]=\"{'pop-label-container-border': config.border, 'pop-label-ellipsis': config.textOverflow === 'ellipsis'}\" *ngIf=\"dom.state.loaded\">\n  <div class=\"import-flex-column-xs import-flex-grow-xs\">\n    <div class=\"pop-label-text import-flex-row import-flex-start-center\">\n      <div class=\"pop-label-button-copy\" *ngIf=\"config.copyLabel\">\n        <lib-pop-button\n          (click)=\"onLabelCopy()\"\n          [config]=\"ui['copyLabel']\"\n        ></lib-pop-button>\n      </div>\n      <label *ngIf=\"!config.copyLabel\">{{config.label}}<lib-pop-field-item-helper class=\"pop-label-helper-icon\" [hidden]=\"!config.helpText\" [helpText]=config.helpText></lib-pop-field-item-helper></label>\n    </div>\n  </div>\n  <div class=\"import-flex-column-md import-flex-grow-md\" [ngSwitch]=\"config.html\">\n    <div *ngSwitchCase=\"'label'\">\n      <div *ngIf=\"config.copyValue\">\n        <lib-pop-button\n          class=\"pop-label-button-copy\"\n          (click)=\"onValueCopy()\"\n          [config]=\"ui['copyValue']\"\n        ></lib-pop-button>\n      </div>\n      <div *ngIf=\"!config.copyValue\">\n        <div *ngIf=\"config.valueButton\" class=\"pop-label-button-theme-{{dom.state.valueButton_theme}} sw-mar-rgt-sm\">\n          <lib-pop-button class=\"pop-label-button-value\" [config]=\"ui.valueButton\"></lib-pop-button>\n        </div>\n        <div *ngIf=\"!config.valueButton\" class=\"import-flex-row import-flex-end-center\">\n          <span *ngIf=\"!config.icon\" class=\"pop-label-value-text\"><h4>{{config.value}}</h4></span>\n          <div *ngIf=\"config.icon\" [ngSwitch]=\"config.iconType\" class=\"pop-label-icon-container\">\n            <mat-icon *ngSwitchCase=\"'mat'\">{{config.icon}}</mat-icon>\n            <span *ngSwitchCase=\"'sw'\" class=\"sw-pop-icon\">{{config.icon}}</span>\n          </div>\n        </div>\n      </div>\n    </div>\n    <a class=\"sw-pointer import-flex-row import-flex-end-center\" *ngSwitchCase=\"'link'\" (click)=\"onRouteLink();\" matTooltip=\"{{config.tooltip}}\" matTooltipPosition=\"left\">\n      <div *ngIf=\"!config.icon\" class=\"pop-label-value-text\"><h4>{{config.value}}</h4></div>\n      <div *ngIf=\"config.icon\" [ngSwitch]=\"config.iconType\" class=\"pop-label-icon-container\">\n        <mat-icon *ngSwitchCase=\"'mat'\">{{config.icon}}</mat-icon>\n        <span *ngSwitchCase=\"'sw'\" class=\"sw-pop-icon\">{{config.icon}}</span>\n      </div>\n    </a>\n  </div>\n</div>\n",
                styles: [".pop-label-container{position:relative;display:flex;flex-direction:row;align-items:center;justify-content:space-between;box-sizing:border-box;-moz-box-sizing:border-box}.pop-label-container-border{border-radius:3px;border:1px solid var(--border);padding:10px}.pop-label-container-border:hover{border-color:currentColor}.pop-label-container-border:focus{border-color:var(--accent)}.pop-label-link-container{position:relative;display:flex;flex-grow:1;flex-direction:row;align-items:center;justify-content:flex-end}.pop-label-icon-container{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center}.pop-label-helper-icon{position:relative;top:5px;font-size:.8em;z-index:2}.pop-label-text{flex:1 1 100%}.pop-label-value-text{flex:1;padding-left:var(--gap-s);box-sizing:border-box;min-width:0;text-align:right;flex-grow:1}.pop-label-value-text h4{margin:0}:host ::ng-deep .pop-label-ellipsis .pop-label-value-text h4{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pop-label-button-copy,.pop-label-button-value{min-width:100px!important}:host ::ng-deep .pop-label-button-theme-default button{background:grey;color:#fff;box-shadow:none!important}:host ::ng-deep .pop-label-button-theme-success button{background:#35d18e!important;color:#fff!important;box-shadow:none!important;text-transform:none!important}:host ::ng-deep .pop-label-button-theme-danger button{background:#f8262e!important;color:#fff!important;box-shadow:none!important;text-transform:none!important}:host ::ng-deep .pop-label-button-theme-warn button{background:orange!important;color:#fff!important;box-shadow:none!important;text-transform:none!important}:host ::ng-deep .pop-label-button-theme-info button{background:#4e7fed!important;color:#000!important;text-transform:none!important}:host ::ng-deep .pop-label-icon-container mat-icon{margin-left:var(--gap-xs)!important}"]
            },] }
];
PopLabelComponent.ctorParameters = () => [
    { type: ElementRef }
];
PopLabelComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWxhYmVsLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLWxhYmVsL3BvcC1sYWJlbC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFxQixNQUFNLGVBQWUsQ0FBQztBQUVoRixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDL0QsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNwRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN6RyxPQUFPLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBUXhFLE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxxQkFBcUI7SUFLMUQsWUFDUyxFQUFjO1FBRXJCLEtBQUssRUFBRSxDQUFDO1FBRkQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUpoQixTQUFJLEdBQUcsbUJBQW1CLENBQUM7UUFRaEM7O1dBRUc7UUFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFxQixFQUFFO1lBQzFDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLDJCQUEyQixDQUFDLENB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QUMzQixNQUFNLEtBQUssR0FBRyxDQUFFLEtBQUssQ0FBRSxDQUFDO1FBQ3hCLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JELEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNoQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO2dCQUFHLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2xFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsR0FBRyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUdEOztPQUVHO0lBQ0gsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBR0Q7Ozs7O3NHQUtrRztJQUVsRzs7T0FFRztJQUNPLG9CQUFvQjtRQUM1QixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFO1lBQzNCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRTtnQkFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQ3RGO1NBQ0Y7SUFDSCxDQUFDOzs7WUFsSkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxlQUFlO2dCQUN6QixvL0VBQXlDOzthQUUxQzs7O1lBZG1CLFVBQVU7OztxQkFnQjNCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTGFiZWxDb25maWcgfSBmcm9tICcuL2xhYmVsLWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBUcnVuY2F0ZVBpcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9waXBlcy90cnVuY2F0ZS5waXBlJztcbmltcG9ydCB7IEJ1dHRvbkNvbmZpZyB9IGZyb20gJy4uL3BvcC1idXR0b24vYnV0dG9uLWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgUG9wRmllbGRJdGVtQ29tcG9uZW50IH0gZnJvbSAnLi4vcG9wLWZpZWxkLWl0ZW0uY29tcG9uZW50JztcbmltcG9ydCB7IEdldFZlcmJTdGF0ZVRoZW1lLCBJc09iamVjdFRocm93RXJyb3IsIFN0cmluZ1JlcGxhY2VBbGwgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHsgUG9wSHJlZiwgU2VydmljZUluamVjdG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC1sYWJlbCcsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3AtbGFiZWwuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWxhYmVsLmNvbXBvbmVudC5zY3NzJyBdLFxufSlcbmV4cG9ydCBjbGFzcyBQb3BMYWJlbENvbXBvbmVudCBleHRlbmRzIFBvcEZpZWxkSXRlbUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgY29uZmlnOiBMYWJlbENvbmZpZztcbiAgcHVibGljIG5hbWUgPSAnUG9wTGFiZWxDb21wb25lbnQnO1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVsOiBFbGVtZW50UmVmLFxuICApe1xuICAgIHN1cGVyKCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHNob3VsZCB0cmFuc2Zvcm0gYW5kIHZhbGlkYXRlIHRoZSBkYXRhLiBUaGUgdmlldyBzaG91bGQgdHJ5IHRvIG9ubHkgdXNlIGRhdGEgdGhhdCBpcyBzdG9yZWQgb24gdWkgc28gdGhhdCBpdCBpcyBub3QgZGVwZW5kZW50IG9uIHRoZSBzdHJ1Y3R1cmUgb2YgZGF0YSB0aGF0IGNvbWVzIGZyb20gb3RoZXIgc291cmNlcy4gVGhlIHVpIHNob3VsZCBiZSB0aGUgc291cmNlIG9mIHRydXRoIGhlcmUuXG4gICAgICovXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gSXNPYmplY3RUaHJvd0Vycm9yKHRoaXMuY29uZmlnLCB0cnVlLCBgJHt0aGlzLm5hbWV9OmNvbmZpZ3VyZTogLSB0aGlzLmNvbmZpZ2ApID8gdGhpcy5jb25maWcgOiBudWxsO1xuXG4gICAgICAgIHRoaXMudWkuY29weUxhYmVsID0gPEJ1dHRvbkNvbmZpZz51bmRlZmluZWQ7XG4gICAgICAgIHRoaXMudWkuY29weVZhbHVlID0gPEJ1dHRvbkNvbmZpZz51bmRlZmluZWQ7XG4gICAgICAgIHRoaXMudWkudmFsdWVCdXR0b24gPSA8QnV0dG9uQ29uZmlnPnVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUudmFsdWVCdXR0b25fdGhlbWUgPSAnZGVmYXVsdCc7XG5cbiAgICAgICAgaWYoIHRoaXMuY29uZmlnLnRydW5jYXRlICl7XG4gICAgICAgICAgY29uc3QgdHJ1bmNhdGVQaXBlID0gbmV3IFRydW5jYXRlUGlwZSgpO1xuICAgICAgICAgIHRoaXMuY29uZmlnLnZhbHVlID0gdHJ1bmNhdGVQaXBlLnRyYW5zZm9ybSh0aGlzLmNvbmZpZy52YWx1ZSwgWyB0aGlzLmNvbmZpZy50cnVuY2F0ZSBdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiggdGhpcy5jb25maWcuY29weUxhYmVsICkgdGhpcy51aS5jb3B5TGFiZWwgPSBuZXcgQnV0dG9uQ29uZmlnKHtcbiAgICAgICAgICAvLyBkaXNhYmxlZDogIXRoaXMuY29uZmlnLmNvcHlMYWJlbEJvZHkgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgIGljb246IHRoaXMuY29uZmlnLmNvcHlMYWJlbEJvZHkgPyAnZmlsZV9jb3B5JyA6IG51bGwsXG4gICAgICAgICAgdmFsdWU6IHRoaXMuY29uZmlnLmNvcHlMYWJlbERpc3BsYXksXG4gICAgICAgICAgc2l6ZTogMjUsXG4gICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICByYWRpdXM6IDUsXG4gICAgICAgICAgdGV4dDogMTIsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiggdGhpcy5jb25maWcuY29weVZhbHVlICkgdGhpcy51aS5jb3B5VmFsdWUgPSBuZXcgQnV0dG9uQ29uZmlnKHtcbiAgICAgICAgICAvLyBkaXNhYmxlZDogIXRoaXMuY29uZmlnLmNvcHlWYWx1ZUJvZHkgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgIGljb246IHRoaXMuY29uZmlnLmNvcHlWYWx1ZUJvZHkgPyAnZmlsZV9jb3B5JyA6IG51bGwsXG4gICAgICAgICAgdmFsdWU6IHRoaXMuY29uZmlnLmNvcHlWYWx1ZURpc3BsYXksXG4gICAgICAgICAgc2l6ZTogMjUsXG4gICAgICAgICAgcmFkaXVzOiA1LFxuICAgICAgICAgIHRleHQ6IDEyLFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiggdGhpcy5jb25maWcudmFsdWVCdXR0b24gKSB0aGlzLnVpLnZhbHVlQnV0dG9uID0gbmV3IEJ1dHRvbkNvbmZpZyh7XG4gICAgICAgICAgZGlzYWJsZWQ6IHRoaXMuY29uZmlnLnZhbHVlQnV0dG9uRGlzYWJsZWQgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgICAgaWNvbjogdGhpcy5jb25maWcuaWNvbixcbiAgICAgICAgICB2YWx1ZTogdGhpcy5jb25maWcudmFsdWVCdXR0b25EaXNwbGF5LFxuICAgICAgICAgIHNpemU6IDI1LFxuICAgICAgICAgIHJhZGl1czogNSxcbiAgICAgICAgICB0ZXh0OiAxMixcbiAgICAgICAgICBidWJibGU6IHRydWUsXG4gICAgICAgICAgZXZlbnQ6ICdjbGljaydcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3NldFZhbHVlQnV0dG9uVGhlbWUoKTtcblxuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IHNob3VsZCBoYXZlIGEgc3BlY2lmaWMgcHVycG9zZVxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIHVzZXIgY2FuIGNsaWNrIG9uIGEgbGluayB0byByb3V0ZSB0byBhbm90aGVyIHBhcnQgb2YgdGhlIGFwcFxuICAgKi9cbiAgb25Sb3V0ZUxpbmsoKXtcbiAgICBpZiggdGhpcy5jb25maWcucm91dGUgKXtcbiAgICAgIGNvbnN0IHJvdXRlQXBwID0gU3RyaW5nKHRoaXMuY29uZmlnLnJvdXRlKS5zcGxpdCgnLycpO1xuICAgICAgaWYoIHJvdXRlQXBwWyAxIF0gJiYgcm91dGVBcHBbIDEgXSA9PT0gUG9wSHJlZiApe1xuICAgICAgICByZXR1cm4gU2VydmljZUluamVjdG9yLmdldChSb3V0ZXIpLm5hdmlnYXRlKFsgcm91dGVBcHAuc2xpY2UoMikuam9pbignLycpIF0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMub25CdWJibGVFdmVudCgnbGluaycpO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIHVzZXIgY2FuIGNsaWNrIG9uIGEgbGFiZWwgYnV0dG9uIHRvIGNvcHkgYSB2YWx1ZSBpbnRvIHRoZSBjbGlwYm9hcmRcbiAgICovXG4gIG9uTGFiZWxDb3B5KCl7XG4gICAgY29uc3QgbmF2ID0gPGFueT5uYXZpZ2F0b3I7XG4gICAgY29uc3Qgc3RyaXAgPSBbICdJRCAnIF07XG4gICAgbGV0IGJvZHkgPSBTdHJpbmcodGhpcy5jb25maWcuY29weUxhYmVsQm9keSkuc2xpY2UoKTtcbiAgICBzdHJpcC5tYXAoKHRhZykgPT4ge1xuICAgICAgaWYoIGJvZHkuaW5jbHVkZXModGFnKSApIGJvZHkgPSBTdHJpbmdSZXBsYWNlQWxsKGJvZHksIHRhZywgJycpO1xuICAgIH0pO1xuICAgIG5hdi5jbGlwYm9hcmQud3JpdGVUZXh0KGJvZHkpO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIHVzZXIgY2FuIGNsaWNrIG9uIGEgYnV0dG9uIHZhbHVlIGFuZCBjb3B5IGEgdmFsdWUgdG8gdGhlIGNsaXBib2FyZFxuICAgKi9cbiAgb25WYWx1ZUNvcHkoKXtcbiAgICBjb25zdCBuYXYgPSA8YW55Pm5hdmlnYXRvcjtcbiAgICBjb25zdCBzdHJpcCA9IFsgJ0lEICcgXTtcbiAgICBsZXQgYm9keSA9IFN0cmluZyh0aGlzLmNvbmZpZy5jb3B5VmFsdWVCb2R5KS5zbGljZSgpO1xuICAgIHN0cmlwLm1hcCgodGFnKSA9PiB7XG4gICAgICBpZiggYm9keS5pbmNsdWRlcyh0YWcpICkgYm9keSA9IFN0cmluZ1JlcGxhY2VBbGwoYm9keSwgdGFnLCAnJyk7XG4gICAgfSk7XG4gICAgbmF2LmNsaXBib2FyZC53cml0ZVRleHQoYm9keSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgZG9tIGRlc3Ryb3kgZnVuY3Rpb24gbWFuYWdlcyBhbGwgdGhlIGNsZWFuIHVwIHRoYXQgaXMgbmVjZXNzYXJ5IGlmIHN1YnNjcmlwdGlvbnMsIHRpbWVvdXRzLCBldGMgYXJlIHN0b3JlZCBwcm9wZXJseVxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVuZGVyIFRoZSBIb29kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJpdmF0ZSBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAvKipcbiAgICogVGhpcyBmeCBiYXNpY2FsbHkgY2hlY2tzIHRoZSBsYWJlbCB2YWx1ZSB0byBzZWVzIGlmIGl0IGNhbiBiZSBhc3NvY2lhdGVkIHdpdGggYSBjb2xvciBzY2hlbWUgYWthIHdhcm5pbmcsIHN1Y2Nlc3MsIGVycm9yXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldFZhbHVlQnV0dG9uVGhlbWUoKXtcbiAgICBpZiggdGhpcy5jb25maWcudmFsdWVCdXR0b24gKXtcbiAgICAgIGlmKCB0aGlzLmNvbmZpZy52YWx1ZUJ1dHRvbkRpc3BsYXkgKXtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUudmFsdWVCdXR0b25fdGhlbWUgPSBHZXRWZXJiU3RhdGVUaGVtZSh0aGlzLmNvbmZpZy52YWx1ZUJ1dHRvbkRpc3BsYXkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG59XG4iXX0=