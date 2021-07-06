import { Inject, Injectable, isDevMode } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PopTemplateAjaxLoaderComponent } from './assets/ajax-loader.component';
import { PopTemplateGoodByeComponent } from './assets/goodbye.component';
import { PopTemplateWelcomeComponent } from './assets/welcome.component';
import { PopTemplateErrorComponent } from './assets/error.component';
import { IsObject } from '../../pop-common-utility';
import { PopTemplateBufferComponent } from './assets/buffer.component';
import { PopCacFilterBarService } from './pop-cac-filter/pop-cac-filter.service';
import * as i0 from "@angular/core";
import * as i1 from "./pop-cac-filter/pop-cac-filter.service";
import * as i2 from "@angular/material/snack-bar";
export class PopTemplateService {
    constructor(filter, snackbar, APP_GLOBAL, env) {
        this.filter = filter;
        this.snackbar = snackbar;
        this.APP_GLOBAL = APP_GLOBAL;
        this.env = env;
        this.asset = {
            notification: undefined,
            contentEl: undefined
        };
    }
    turnOffFilter() {
        this.filter.setActive(false);
    }
    welcome() {
        this.asset.notification = this.snackbar.openFromComponent(PopTemplateWelcomeComponent, {
            panelClass: 'pop-template-center',
            duration: 5 * 1000
        });
    }
    buffer(expression = null, duration = 4) {
        if (isDevMode()) {
            this.asset.notification = this.snackbar.openFromComponent(PopTemplateBufferComponent, {
                panelClass: 'pop-template-center',
                duration: duration * 1000,
                data: {
                    expression: expression,
                }
            });
        }
    }
    error(error, duration = 5) {
        if (isDevMode()) {
            this.asset.notification = this.snackbar.openFromComponent(PopTemplateErrorComponent, {
                panelClass: 'pop-template-center',
                duration: duration * 1000
            });
            this.asset.notification.instance.error = error;
        }
    }
    goodbye() {
        this.asset.notification = this.snackbar.openFromComponent(PopTemplateGoodByeComponent, {
            panelClass: 'pop-template-center',
            duration: 5 * 1000
        });
    }
    lookBusy(duration = 5) {
        if (isDevMode()) {
            this.asset.notification = this.snackbar.openFromComponent(PopTemplateAjaxLoaderComponent, {
                panelClass: 'pop-template-center',
                duration: duration * 1000
            });
        }
    }
    notify(message, action = null, duration = 3) {
        this.asset.notification = this.snackbar.open(message, action, {
            panelClass: 'pop-template-center',
            duration: duration * 1000
        });
    }
    clear() {
        if (IsObject(this.asset.notification, ['dismiss'])) {
            this.asset.notification.dismiss();
        }
    }
    setContentEl(el) {
        if (el)
            this.asset.contentEl = el;
    }
    verify() {
        if (this.APP_GLOBAL.isVerified()) {
            this.APP_GLOBAL.verification.next();
        }
    }
    getContentHeight(modal = false, overhead = 60) {
        let height = window.innerHeight;
        if (this.asset.contentEl && this.asset.contentEl.nativeElement.offsetTop)
            height = (height - this.asset.contentEl.nativeElement.offsetTop);
        if (modal)
            height -= 100;
        if (overhead)
            height -= overhead;
        return height;
    }
}
PopTemplateService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopTemplateService_Factory() { return new PopTemplateService(i0.ɵɵinject(i1.PopCacFilterBarService), i0.ɵɵinject(i2.MatSnackBar), i0.ɵɵinject("APP_GLOBAL"), i0.ɵɵinject("env")); }, token: PopTemplateService, providedIn: "root" });
PopTemplateService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopTemplateService.ctorParameters = () => [
    { type: PopCacFilterBarService },
    { type: MatSnackBar },
    { type: undefined, decorators: [{ type: Inject, args: ['APP_GLOBAL',] }] },
    { type: undefined, decorators: [{ type: Inject, args: ['env',] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXRlbXBsYXRlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9hcHAvcG9wLXRlbXBsYXRlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFjLE1BQU0sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzFFLE9BQU8sRUFBRSxXQUFXLEVBQWtCLE1BQU0sNkJBQTZCLENBQUM7QUFDMUUsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDaEYsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekUsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekUsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDckUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3BELE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDOzs7O0FBT2pGLE1BQU0sT0FBTyxrQkFBa0I7SUFVN0IsWUFDVSxNQUE4QixFQUM5QixRQUFxQixFQUNHLFVBQThCLEVBQ3JDLEdBQUk7UUFIckIsV0FBTSxHQUFOLE1BQU0sQ0FBd0I7UUFDOUIsYUFBUSxHQUFSLFFBQVEsQ0FBYTtRQUNHLGVBQVUsR0FBVixVQUFVLENBQW9CO1FBQ3JDLFFBQUcsR0FBSCxHQUFHLENBQUM7UUFackIsVUFBSyxHQUFHO1lBQ2hCLFlBQVksRUFBdUIsU0FBUztZQUM1QyxTQUFTLEVBQWMsU0FBUztTQUNqQyxDQUFDO0lBV0YsQ0FBQztJQUdELGFBQWE7UUFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMs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QyxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ2hDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLFNBQVM7WUFBRSxNQUFNLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzNJLElBQUksS0FBSztZQUFHLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDMUIsSUFBSSxRQUFRO1lBQUcsTUFBTSxJQUFJLFFBQVEsQ0FBQztRQUNsQyxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDOzs7O1lBaEhGLFVBQVUsU0FBRTtnQkFDWCxVQUFVLEVBQUUsTUFBTTthQUNuQjs7O1lBTlEsc0JBQXNCO1lBUHRCLFdBQVc7NENBMkJmLE1BQU0sU0FBRSxZQUFZOzRDQUNwQixNQUFNLFNBQUUsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVsZW1lbnRSZWYsIEluamVjdCwgSW5qZWN0YWJsZSwgaXNEZXZNb2RlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBNYXRTbmFja0JhciwgTWF0U25hY2tCYXJSZWYgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9zbmFjay1iYXInO1xuaW1wb3J0IHsgUG9wVGVtcGxhdGVBamF4TG9hZGVyQ29tcG9uZW50IH0gZnJvbSAnLi9hc3NldHMvYWpheC1sb2FkZXIuY29tcG9uZW50JztcbmltcG9ydCB7IFBvcFRlbXBsYXRlR29vZEJ5ZUNvbXBvbmVudCB9IGZyb20gJy4vYXNzZXRzL2dvb2RieWUuY29tcG9uZW50JztcbmltcG9ydCB7IFBvcFRlbXBsYXRlV2VsY29tZUNvbXBvbmVudCB9IGZyb20gJy4vYXNzZXRzL3dlbGNvbWUuY29tcG9uZW50JztcbmltcG9ydCB7IFBvcFRlbXBsYXRlRXJyb3JDb21wb25lbnQgfSBmcm9tICcuL2Fzc2V0cy9lcnJvci5jb21wb25lbnQnO1xuaW1wb3J0IHsgSXNPYmplY3QgfSBmcm9tICcuLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHsgUG9wVGVtcGxhdGVCdWZmZXJDb21wb25lbnQgfSBmcm9tICcuL2Fzc2V0cy9idWZmZXIuY29tcG9uZW50JztcbmltcG9ydCB7IFBvcENhY0ZpbHRlckJhclNlcnZpY2UgfSBmcm9tICcuL3BvcC1jYWMtZmlsdGVyL3BvcC1jYWMtZmlsdGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgQXBwR2xvYmFsSW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5cblxuQEluamVjdGFibGUoIHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59IClcbmV4cG9ydCBjbGFzcyBQb3BUZW1wbGF0ZVNlcnZpY2Uge1xuXG4gIHByb3RlY3RlZCBhc3NldCA9IHtcbiAgICBub3RpZmljYXRpb246IDxNYXRTbmFja0JhclJlZjxhbnk+PnVuZGVmaW5lZCxcbiAgICBjb250ZW50RWw6IDxFbGVtZW50UmVmPnVuZGVmaW5lZFxuICB9O1xuXG5cblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgZmlsdGVyOiBQb3BDYWNGaWx0ZXJCYXJTZXJ2aWNlLFxuICAgIHByaXZhdGUgc25hY2tiYXI6IE1hdFNuYWNrQmFyLFxuICAgIEBJbmplY3QoICdBUFBfR0xPQkFMJyApIHByaXZhdGUgQVBQX0dMT0JBTDogQXBwR2xvYmFsSW50ZXJmYWNlLFxuICAgIEBJbmplY3QoICdlbnYnICkgcHJpdmF0ZSBlbnY/XG4gICl7XG4gIH1cblxuXG4gIHR1cm5PZmZGaWx0ZXIoKXtcbiAgICB0aGlzLmZpbHRlci5zZXRBY3RpdmUoIGZhbHNlICk7XG4gIH1cblxuXG4gIHdlbGNvbWUoKXtcbiAgICB0aGlzLmFzc2V0Lm5vdGlmaWNhdGlvbiA9IHRoaXMuc25hY2tiYXIub3BlbkZyb21Db21wb25lbnQoIFBvcFRlbXBsYXRlV2VsY29tZUNvbXBvbmVudCwge1xuICAgICAgcGFuZWxDbGFzczogJ3BvcC10ZW1wbGF0ZS1jZW50ZXInLFxuICAgICAgZHVyYXRpb246IDUgKiAxMDAwXG4gICAgfSApO1xuICB9XG5cblxuICBidWZmZXIoIGV4cHJlc3Npb246IHN0cmluZyA9IG51bGwsIGR1cmF0aW9uOiBudW1iZXIgPSA0ICl7XG4gICAgaWYoIGlzRGV2TW9kZSgpICl7XG4gICAgICB0aGlzLmFzc2V0Lm5vdGlmaWNhdGlvbiA9IHRoaXMuc25hY2tiYXIub3BlbkZyb21Db21wb25lbnQoIFBvcFRlbXBsYXRlQnVmZmVyQ29tcG9uZW50LCB7XG4gICAgICAgIHBhbmVsQ2xhc3M6ICdwb3AtdGVtcGxhdGUtY2VudGVyJyxcbiAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uICogMTAwMCxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGV4cHJlc3Npb246IGV4cHJlc3Npb24sXG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9XG4gIH1cblxuXG4gIGVycm9yKCBlcnJvcjogeyBtZXNzYWdlOiBzdHJpbmcsIGNvZGU6IG51bWJlciB9LCBkdXJhdGlvbjogbnVtYmVyID0gNSApe1xuICAgIGlmKCBpc0Rldk1vZGUoKSApe1xuICAgICAgdGhpcy5hc3NldC5ub3RpZmljYXRpb24gPSB0aGlzLnNuYWNrYmFyLm9wZW5Gcm9tQ29tcG9uZW50KCBQb3BUZW1wbGF0ZUVycm9yQ29tcG9uZW50LCB7XG4gICAgICAgIHBhbmVsQ2xhc3M6ICdwb3AtdGVtcGxhdGUtY2VudGVyJyxcbiAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uICogMTAwMFxuICAgICAgfSApO1xuICAgICAgdGhpcy5hc3NldC5ub3RpZmljYXRpb24uaW5zdGFuY2UuZXJyb3IgPSBlcnJvcjtcbiAgICB9XG4gIH1cblxuXG4gIGdvb2RieWUoKXtcbiAgICB0aGlzLmFzc2V0Lm5vdGlmaWNhdGlvbiA9IHRoaXMuc25hY2tiYXIub3BlbkZyb21Db21wb25lbnQoIFBvcFRlbXBsYXRlR29vZEJ5ZUNvbXBvbmVudCwge1xuICAgICAgcGFuZWxDbGFzczogJ3BvcC10ZW1wbGF0ZS1jZW50ZXInLFxuICAgICAgZHVyYXRpb246IDUgKiAxMDAwXG4gICAgfSApO1xuICB9XG5cblxuICBsb29rQnVzeSggZHVyYXRpb246IG51bWJlciA9IDUgKXtcbiAgICBpZiggaXNEZXZNb2RlKCkgKXtcbiAgICAgIHRoaXMuYXNzZXQubm90aWZpY2F0aW9uID0gdGhpcy5zbmFja2Jhci5vcGVuRnJvbUNvbXBvbmVudCggUG9wVGVtcGxhdGVBamF4TG9hZGVyQ29tcG9uZW50LCB7XG4gICAgICAgIHBhbmVsQ2xhc3M6ICdwb3AtdGVtcGxhdGUtY2VudGVyJyxcbiAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uICogMTAwMFxuICAgICAgfSApO1xuICAgIH1cbiAgfVxuXG5cbiAgbm90aWZ5KCBtZXNzYWdlOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nID0gbnVsbCwgZHVyYXRpb246IG51bWJlciA9IDMgKXtcbiAgICB0aGlzLmFzc2V0Lm5vdGlmaWNhdGlvbiA9IHRoaXMuc25hY2tiYXIub3BlbihcbiAgICAgIG1lc3NhZ2UsIGFjdGlvbiwge1xuICAgICAgICBwYW5lbENsYXNzOiAncG9wLXRlbXBsYXRlLWNlbnRlcicsXG4gICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiAqIDEwMDBcbiAgICAgIH1cbiAgICApO1xuICB9XG5cblxuICBjbGVhcigpe1xuICAgIGlmKCBJc09iamVjdCggdGhpcy5hc3NldC5ub3RpZmljYXRpb24sIFsgJ2Rpc21pc3MnIF0gKSApe1xuICAgICAgdGhpcy5hc3NldC5ub3RpZmljYXRpb24uZGlzbWlzcygpO1xuICAgIH1cbiAgfVxuXG5cbiAgc2V0Q29udGVudEVsKCBlbDogRWxlbWVudFJlZiApOiB2b2lke1xuICAgIGlmKCBlbCApIHRoaXMuYXNzZXQuY29udGVudEVsID0gZWw7XG4gIH1cblxuXG4gIHZlcmlmeSgpe1xuICAgIGlmKCB0aGlzLkFQUF9HTE9CQUwuaXNWZXJpZmllZCgpICl7XG4gICAgICB0aGlzLkFQUF9HTE9CQUwudmVyaWZpY2F0aW9uLm5leHQoKTtcbiAgICB9XG4gIH1cblxuXG4gIGdldENvbnRlbnRIZWlnaHQoIG1vZGFsID0gZmFsc2UsIG92ZXJoZWFkID0gNjAgKTogbnVtYmVye1xuICAgIGxldCBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgaWYoIHRoaXMuYXNzZXQuY29udGVudEVsICYmIHRoaXMuYXNzZXQuY29udGVudEVsLm5hdGl2ZUVsZW1lbnQub2Zmc2V0VG9wKSBoZWlnaHQgPSAoaGVpZ2h0IC0gdGhpcy5hc3NldC5jb250ZW50RWwubmF0aXZlRWxlbWVudC5vZmZzZXRUb3ApO1xuICAgIGlmKCBtb2RhbCApIGhlaWdodCAtPSAxMDA7XG4gICAgaWYoIG92ZXJoZWFkICkgaGVpZ2h0IC09IG92ZXJoZWFkO1xuICAgIHJldHVybiBoZWlnaHQ7XG4gIH1cbn1cbiJdfQ==