import { __awaiter } from "tslib";
import { Component, ElementRef, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { ServiceInjector } from '../../../../pop-common.model';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopEntityEventService } from '../../../entity/services/pop-entity-event.service';
import { PopRequestService } from '../../../../services/pop-request.service';
import { Router } from '@angular/router';
import { slideInOut } from '../../../../pop-common-animations.model';
import { IsValidFieldPatchEvent, ParseLinkUrl } from '../../../entity/pop-entity-utility';
import { FieldItemGroupConfig } from '../pop-field-item-group.model';
import { GetHttpErrorMsg, IsCallableFunction, IsString } from '../../../../pop-common-utility';
export class InDialogComponent extends PopExtendComponent {
    constructor(el, dialog, config) {
        super();
        this.el = el;
        this.dialog = dialog;
        this.config = config;
        this.events = new EventEmitter();
        this.http = 'POST';
        this.name = 'InDialogComponent';
        this.srv = {
            events: ServiceInjector.get(PopEntityEventService),
            request: ServiceInjector.get(PopRequestService),
            router: ServiceInjector.get(Router),
        };
        this.asset = {
            visible: 0
        };
        this.ui = {
            form: undefined
        };
        /**
         * This should transformValue and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                const fieldItems = {};
                this.dom.state.validated = false;
                if (!this.config.inDialog.submit)
                    this.config.inDialog.submit = 'Submit';
                this.config.fieldItems.map((field) => {
                    if (field.config && field.config.control) {
                        fieldItems[field.config.name] = field.config.control;
                        this.asset.visible++;
                    }
                });
                this.dom.setHeight(this.asset.visible * 40, 0);
                this.ui.form = new FormGroup(fieldItems);
                resolve(true);
            });
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => {
                this._triggerFormValidation();
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
     * Intercept the enter press to check if the form can be submitted
     * @param event
     */
    onEnterPress(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.dom.state.validated) {
            this.dom.setTimeout(`submit-form`, () => {
                return this.onFormSubmit();
            }, 500);
        }
    }
    /**
     * The user will press enter or click a submit btn to submit the form
     */
    onFormSubmit() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (this.dom.state.validated && !this.dom.state.pending) {
                this._onSubmissionStart();
                const params = this.ui.form.value; // get form value before disabling form
                // this.dom.asset.form_group.disable(); //bad idea disabled through css
                const request = this.http === 'POST' ? this.srv.request.doPost(this.config.inDialog.postUrl, params, (this.config.inDialog.postUrlVersion !== null ? this.config.inDialog.postUrlVersion : 1)) : this.srv.request.doPatch(this.config.inDialog.postUrl, params, (this.config.inDialog.postUrlVersion !== null ? this.config.inDialog.postUrlVersion : 1));
                request.subscribe((result) => __awaiter(this, void 0, void 0, function* () {
                    const goToUrl = this.config.inDialog.goToUrl;
                    result = result.data ? result.data : result;
                    this.config.entity = result;
                    yield this._onSubmissionSuccess();
                    this.dialog.close(this.config.entity);
                    if (IsString(goToUrl, true)) {
                        const newGoToUrl = ParseLinkUrl(String(goToUrl).slice(), this.config.entity);
                        this.srv.router.navigate([newGoToUrl]).catch((e) => {
                            console.log(e);
                        });
                    }
                    return resolve(true);
                }), err => {
                    this._onSubmissionFail();
                    this._setErrorMessage(err);
                    return resolve(false);
                });
            }
        }));
    }
    /**
     * The user can click a canel btn to close the form dialog
     */
    onFormCancel() {
        this.dom.state.loaded = false;
        this.dom.setTimeout(`close-modal`, () => {
            this.config.entity = null;
            this.dialog.close(-1);
        }, 500);
    }
    /**
     * Handle the form events to trigger the form validation
     * @param event
     */
    onBubbleEvent(event) {
        if (event.name === 'onKeyUp') {
            this.dom.state.validated = false;
            this.dom.setTimeout(`trigger-validation`, () => {
                this._triggerFormValidation();
            }, 500);
        }
        if (IsValidFieldPatchEvent(this.core, event) || event.name === 'onBlur') {
            this.dom.setTimeout(`trigger-validation`, () => {
                this._triggerFormValidation();
            }, 500);
        }
        else {
            // if a field is focused we want a chance to validate again
            // this.dom.state.validated = false;
        }
        // if( event.type === 'field' && event.name === 'onChange' ) event.form = this.ui.form;
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
     * This fx will trigger the form validation
     * @private
     */
    _triggerFormValidation() {
        this.dom.setTimeout(`trigger-form-validation`, () => {
            this._validateForm().then((valid) => {
                this.dom.state.validated = valid;
            });
        }, 50);
    }
    /**
     * The form needs to able to make api calls to verify info for certain fields
     * ToDo:: Allow the config to be able to pass in api validation calls for certain fields
     * @private
     */
    _validateForm() {
        return new Promise((resolve) => {
            this.dom.state.validated = false;
            this.dom.setTimeout(`trigger-form-validation`, null);
            this.dom.setTimeout(`validate-form`, () => {
                this.ui.form.updateValueAndValidity();
                setTimeout(() => {
                    this.dom.state.validated = true; // mock stub for now
                    return resolve(this.ui.form.valid);
                }, 0);
            }, 0);
        });
    }
    /**
     * This hook is called when the form is submitting
     * @private
     */
    _onSubmissionStart() {
        this.dom.state.pending = true;
        this.dom.setTimeout(`submit-form`, null);
        this.dom.setTimeout(`trigger-validation`, null);
        this.dom.setTimeout(`trigger-form-validation`, null);
        this.dom.setTimeout(`validate-form`, null);
        this.dom.error.message = '';
        this.dom.setTimeout(`set-error`, null);
    }
    /**
     * This hook is called when the form submission has failed
     * @private
     */
    _onSubmissionFail() {
        this.dom.state.pending = false;
        // this.dom.state.validated = false;
    }
    /**
     * This hook is called when the form has submitted successfully
     * @private
     */
    _onSubmissionSuccess() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.dom.state.pending = false;
            this.dom.state.validated = false;
            this.dom.state.success = (this.config.entity.message !== null ? this.config.entity.message : 'Created');
            const event = {
                source: this.name,
                method: 'create',
                type: 'entity',
                name: this.config.params.name,
                internal_name: this.config.params.internal_name,
                data: this.config.entity
            };
            if (IsCallableFunction(this.config.inDialog.callback)) {
                yield this.config.inDialog.callback(this.core, event);
            }
            this.srv.events.sendEvent(event);
            return resolve(true);
        }));
    }
    /**
     * This fx will handle errors
     * @param message
     * @private
     */
    _setErrorMessage(err) {
        this.dom.setTimeout(`set-err-msg`, () => {
            this.dom.state.pending = false;
            this.dom.error.message = GetHttpErrorMsg(err);
            this.ui.form.markAsPristine();
            // this.dom.setTimeout( `clear-err-msg`, () => {
            //   this.dom.error.message = '';
            // }, 5000 );
        }, 500);
    }
}
InDialogComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-in-dialog',
                template: "<div *ngIf=\"dom.state.loaded\" [@slideInOut]>\n  <div class=\"in-dialog-title\" *ngIf=\"config.inDialog.title !== null\">{{config.inDialog.title}}</div>\n  <div class=\"in-dialog-fields\">\n    <form (keyup.enter)=\"onEnterPress($event);\" [formGroup]=\"ui.form\" [className]=\"dom.state.pending ? 'in-dialog-field-lock' : ''\">\n      <lib-group [ngClass]=\"{'in-dialog-disabled': dom.state.pending}\" [config]=\"config\" (events)=\"onBubbleEvent($event);\"></lib-group>\n    </form>\n  </div>\n  <div class=\"in-dialog-buttons\">\n    <button *ngIf=\"config.inDialog.cancel\" class=\"in-dialog-cancel\" mat-raised-button (click)=\"onFormCancel();\" [disabled]=\"dom.state.pending\">\n      Cancel\n    </button>\n    <button class=\"in-dialog-other\" mat-raised-button color=\"accent\" (click)=\"onFormSubmit()\" [disabled]=\"!dom.state.validated || dom.state.pending\">\n      <span *ngIf=\"!dom.state.pending\">{{config.inDialog.submit}}</span>\n      <div *ngIf=\"dom.state.pending\">\n        <mat-spinner diameter=\"20\"></mat-spinner>\n      </div>\n    </button>\n  </div>\n  <div class=\"in-dialog-message-layout\" *ngIf=\"dom.state.success || dom.error?.message\" [@slideInOut]>\n    <div *ngIf=\"dom.state.success\" class=\"in-dialog-success\">{{dom.state.success}}</div>\n    <div *ngIf=\"dom.error.message\" class=\"in-dialog-errors\" [innerHTML]=dom.error.message></div>\n  </div>\n</div>\n",
                animations: [
                    slideInOut
                ],
                styles: [":host{position:relative;display:block;min-width:350px}:host .in-dialog-title{font-weight:500;text-align:center;margin-bottom:10px}:host .in-dialog-fields{position:relative;display:block;width:100%;margin-bottom:10px}:host .in-dialog-fields .in-dialog-field{margin-bottom:10px}:host .in-dialog-fields .in-dialog-field-lock{pointer-events:none!important}:host .in-dialog-fields .in-dialog-field-spinner{position:absolute;left:50%;top:50%;margin-left:-22px;margin-top:-40px}:host .in-dialog-buttons{margin-top:20px;margin-bottom:10px;display:flex;justify-content:flex-end}:host .in-dialog-buttons .in-dialog-cancel{order:1;display:flex;align-items:center;justify-content:center;min-height:35px;min-width:140px}:host .in-dialog-buttons .in-dialog-other{order:2;display:flex;align-items:center;justify-content:center;margin-left:10px;min-width:140px;min-height:35px}:host .in-dialog-errors{color:var(--warn);text-align:center;word-break:break-word}:host .in-dialog-success{color:var(--success);text-align:center;word-break:break-word}:host .in-dialog-message-layout{display:flex;flex-direction:row;min-height:40px;align-items:center;justify-content:center;text-align:center}:host .in-dialog-disabled{pointer-events:none}"]
            },] }
];
InDialogComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: MatDialogRef },
    { type: FieldItemGroupConfig, decorators: [{ type: Inject, args: [MAT_DIALOG_DATA,] }] }
];
InDialogComponent.propDecorators = {
    events: [{ type: Output }],
    http: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW4tZGlhbG9nLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWZpZWxkLWl0ZW0tZ3JvdXAvaW4tZGlhbG9nL2luLWRpYWxvZy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFxQixNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDOUcsT0FBTyxFQUFFLGVBQWUsRUFBYSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNwRixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0MsT0FBTyxFQUF5QixlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUN0RixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxtREFBbUQsQ0FBQztBQUMxRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUM3RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxZQUFZLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUMxRixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNyRSxPQUFPLEVBQUUsZUFBZSxFQUFFLGtCQUFrQixFQUFFLFFBQVEsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBVy9GLE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxrQkFBa0I7SUF3QnZELFlBQ1MsRUFBYyxFQUNkLE1BQXVDLEVB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QUNGOzs7WUFyQm1CLFVBQVU7WUFDTyxZQUFZO1lBU3hDLG9CQUFvQix1QkF1Q3hCLE1BQU0sU0FBRSxlQUFlOzs7cUJBMUJ6QixNQUFNO21CQUNOLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5qZWN0LCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQsIE91dHB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTUFUX0RJQUxPR19EQVRBLCBNYXREaWFsb2csIE1hdERpYWxvZ1JlZiB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RpYWxvZyc7XG5pbXBvcnQgeyBGb3JtR3JvdXAgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsIFNlcnZpY2VJbmplY3RvciB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRW50aXR5RXZlbnRTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vZW50aXR5L3NlcnZpY2VzL3BvcC1lbnRpdHktZXZlbnQuc2VydmljZSc7XG5pbXBvcnQgeyBQb3BSZXF1ZXN0U2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1yZXF1ZXN0LnNlcnZpY2UnO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IHNsaWRlSW5PdXQgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLWFuaW1hdGlvbnMubW9kZWwnO1xuaW1wb3J0IHsgSXNWYWxpZEZpZWxkUGF0Y2hFdmVudCwgUGFyc2VMaW5rVXJsIH0gZnJvbSAnLi4vLi4vLi4vZW50aXR5L3BvcC1lbnRpdHktdXRpbGl0eSc7XG5pbXBvcnQgeyBGaWVsZEl0ZW1Hcm91cENvbmZpZyB9IGZyb20gJy4uL3BvcC1maWVsZC1pdGVtLWdyb3VwLm1vZGVsJztcbmltcG9ydCB7IEdldEh0dHBFcnJvck1zZywgSXNDYWxsYWJsZUZ1bmN0aW9uLCBJc1N0cmluZyB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5cblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1pbi1kaWFsb2cnLFxuICB0ZW1wbGF0ZVVybDogJy4vaW4tZGlhbG9nLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbICcuL2luLWRpYWxvZy5jb21wb25lbnQuc2NzcycgXSxcbiAgYW5pbWF0aW9uczogW1xuICAgIHNsaWRlSW5PdXRcbiAgXVxufSApXG5leHBvcnQgY2xhc3MgSW5EaWFsb2dDb21wb25lbnQgZXh0ZW5kcyBQb3BFeHRlbmRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBPdXRwdXQoKSBldmVudHM6IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+ID0gbmV3IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+KCk7XG4gIEBJbnB1dCgpIGh0dHAgPSAnUE9TVCc7XG4gIHB1YmxpYyBuYW1lID0gJ0luRGlhbG9nQ29tcG9uZW50JztcblxuICBwcm90ZWN0ZWQgc3J2OiB7XG4gICAgZXZlbnRzOiBQb3BFbnRpdHlFdmVudFNlcnZpY2UsXG4gICAgcmVxdWVzdDogUG9wUmVxdWVzdFNlcnZpY2UsXG4gICAgcm91dGVyOiBSb3V0ZXJcbiAgfSA9IHtcbiAgICBldmVudHM6IFNlcnZpY2VJbmplY3Rvci5nZXQoIFBvcEVudGl0eUV2ZW50U2VydmljZSApLFxuICAgIHJlcXVlc3Q6IFNlcnZpY2VJbmplY3Rvci5nZXQoIFBvcFJlcXVlc3RTZXJ2aWNlICksXG4gICAgcm91dGVyOiBTZXJ2aWNlSW5qZWN0b3IuZ2V0KCBSb3V0ZXIgKSxcbiAgfTtcblxuICBwdWJsaWMgYXNzZXQgPSB7XG4gICAgdmlzaWJsZTogMFxuICB9O1xuXG4gIHB1YmxpYyB1aSA9IHtcbiAgICBmb3JtOiA8Rm9ybUdyb3VwPnVuZGVmaW5lZFxuICB9O1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVsOiBFbGVtZW50UmVmLFxuICAgIHB1YmxpYyBkaWFsb2c6IE1hdERpYWxvZ1JlZjxJbkRpYWxvZ0NvbXBvbmVudD4sXG4gICAgQEluamVjdCggTUFUX0RJQUxPR19EQVRBICkgcHVibGljIGNvbmZpZzogRmllbGRJdGVtR3JvdXBDb25maWcsXG4gICl7XG4gICAgc3VwZXIoKTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgc2hvdWxkIHRyYW5zZm9ybVZhbHVlIGFuZCB2YWxpZGF0ZSB0aGUgZGF0YS4gVGhlIHZpZXcgc2hvdWxkIHRyeSB0byBvbmx5IHVzZSBkYXRhIHRoYXQgaXMgc3RvcmVkIG9uIHVpIHNvIHRoYXQgaXQgaXMgbm90IGRlcGVuZGVudCBvbiB0aGUgc3RydWN0dXJlIG9mIGRhdGEgdGhhdCBjb21lcyBmcm9tIG90aGVyIHNvdXJjZXMuIFRoZSB1aSBzaG91bGQgYmUgdGhlIHNvdXJjZSBvZiB0cnV0aCBoZXJlLlxuICAgICAqL1xuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlICkgPT4ge1xuICAgICAgICBjb25zdCBmaWVsZEl0ZW1zID0ge307XG4gICAgICAgIHRoaXMuZG9tLnN0YXRlLnZhbGlkYXRlZCA9IGZhbHNlO1xuICAgICAgICBpZiggIXRoaXMuY29uZmlnLmluRGlhbG9nLnN1Ym1pdCApIHRoaXMuY29uZmlnLmluRGlhbG9nLnN1Ym1pdCA9ICdTdWJtaXQnO1xuICAgICAgICB0aGlzLmNvbmZpZy5maWVsZEl0ZW1zLm1hcCggKCBmaWVsZCApID0+IHtcbiAgICAgICAgICBpZiggZmllbGQuY29uZmlnICYmIGZpZWxkLmNvbmZpZy5jb250cm9sICl7XG4gICAgICAgICAgICBmaWVsZEl0ZW1zWyBmaWVsZC5jb25maWcubmFtZSBdID0gZmllbGQuY29uZmlnLmNvbnRyb2w7XG4gICAgICAgICAgICB0aGlzLmFzc2V0LnZpc2libGUrKztcbiAgICAgICAgICB9XG4gICAgICAgIH0gKTtcbiAgICAgICAgdGhpcy5kb20uc2V0SGVpZ2h0KCB0aGlzLmFzc2V0LnZpc2libGUgKiA0MCwgMCApO1xuICAgICAgICB0aGlzLnVpLmZvcm0gPSBuZXcgRm9ybUdyb3VwKCBmaWVsZEl0ZW1zICk7XG5cbiAgICAgICAgcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuICAgIH07XG5cbiAgICB0aGlzLmRvbS5wcm9jZWVkID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUgKSA9PiB7XG5cbiAgICAgICAgdGhpcy5fdHJpZ2dlckZvcm1WYWxpZGF0aW9uKCk7XG5cbiAgICAgICAgcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCBzaG91bGQgaGF2ZSBhIHNwZWNpZmljIHB1cnBvc2VcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEludGVyY2VwdCB0aGUgZW50ZXIgcHJlc3MgdG8gY2hlY2sgaWYgdGhlIGZvcm0gY2FuIGJlIHN1Ym1pdHRlZFxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uRW50ZXJQcmVzcyggZXZlbnQgKXtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGlmKCB0aGlzLmRvbS5zdGF0ZS52YWxpZGF0ZWQgKXtcbiAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGBzdWJtaXQtZm9ybWAsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMub25Gb3JtU3VibWl0KCk7XG4gICAgICB9LCA1MDAgKTtcblxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSB1c2VyIHdpbGwgcHJlc3MgZW50ZXIgb3IgY2xpY2sgYSBzdWJtaXQgYnRuIHRvIHN1Ym1pdCB0aGUgZm9ybVxuICAgKi9cbiAgb25Gb3JtU3VibWl0KCl7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KCBhc3luYyggcmVzb2x2ZSApID0+IHtcbiAgICAgIGlmKCB0aGlzLmRvbS5zdGF0ZS52YWxpZGF0ZWQgJiYgIXRoaXMuZG9tLnN0YXRlLnBlbmRpbmcgKXtcbiAgICAgICAgdGhpcy5fb25TdWJtaXNzaW9uU3RhcnQoKTtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gdGhpcy51aS5mb3JtLnZhbHVlOyAvLyBnZXQgZm9ybSB2YWx1ZSBiZWZvcmUgZGlzYWJsaW5nIGZvcm1cbiAgICAgICAgLy8gdGhpcy5kb20uYXNzZXQuZm9ybV9ncm91cC5kaXNhYmxlKCk7IC8vYmFkIGlkZWEgZGlzYWJsZWQgdGhyb3VnaCBjc3NcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHRoaXMuaHR0cCA9PT0gJ1BPU1QnID8gdGhpcy5zcnYucmVxdWVzdC5kb1Bvc3QoIHRoaXMuY29uZmlnLmluRGlhbG9nLnBvc3RVcmwsIHBhcmFtcywgKCB0aGlzLmNvbmZpZy5pbkRpYWxvZy5wb3N0VXJsVmVyc2lvbiAhPT0gbnVsbCA/IHRoaXMuY29uZmlnLmluRGlhbG9nLnBvc3RVcmxWZXJzaW9uIDogMSApICkgOiB0aGlzLnNydi5yZXF1ZXN0LmRvUGF0Y2goIHRoaXMuY29uZmlnLmluRGlhbG9nLnBvc3RVcmwsIHBhcmFtcywgKCB0aGlzLmNvbmZpZy5pbkRpYWxvZy5wb3N0VXJsVmVyc2lvbiAhPT0gbnVsbCA/IHRoaXMuY29uZmlnLmluRGlhbG9nLnBvc3RVcmxWZXJzaW9uIDogMSApICk7XG4gICAgICAgIHJlcXVlc3Quc3Vic2NyaWJlKCBhc3luYyggcmVzdWx0OiBhbnkgKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBnb1RvVXJsID0gdGhpcy5jb25maWcuaW5EaWFsb2cuZ29Ub1VybDtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5kYXRhID8gcmVzdWx0LmRhdGEgOiByZXN1bHQ7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5lbnRpdHkgPSByZXN1bHQ7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLl9vblN1Ym1pc3Npb25TdWNjZXNzKCk7XG4gICAgICAgICAgICB0aGlzLmRpYWxvZy5jbG9zZSggdGhpcy5jb25maWcuZW50aXR5ICk7XG4gICAgICAgICAgICBpZiggSXNTdHJpbmcoIGdvVG9VcmwsIHRydWUgKSApe1xuICAgICAgICAgICAgICBjb25zdCBuZXdHb1RvVXJsID0gUGFyc2VMaW5rVXJsKCBTdHJpbmcoIGdvVG9VcmwgKS5zbGljZSgpLCB0aGlzLmNvbmZpZy5lbnRpdHkgKTtcbiAgICAgICAgICAgICAgdGhpcy5zcnYucm91dGVyLm5hdmlnYXRlKCBbIG5ld0dvVG9VcmwgXSApLmNhdGNoKCAoIGUgKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coIGUgKTtcbiAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVyciA9PiB7XG4gICAgICAgICAgICB0aGlzLl9vblN1Ym1pc3Npb25GYWlsKCk7XG4gICAgICAgICAgICB0aGlzLl9zZXRFcnJvck1lc3NhZ2UoIGVyciApO1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoIGZhbHNlICk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSB1c2VyIGNhbiBjbGljayBhIGNhbmVsIGJ0biB0byBjbG9zZSB0aGUgZm9ybSBkaWFsb2dcbiAgICovXG4gIG9uRm9ybUNhbmNlbCgpe1xuICAgIHRoaXMuZG9tLnN0YXRlLmxvYWRlZCA9IGZhbHNlO1xuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGBjbG9zZS1tb2RhbGAsICgpID0+IHtcbiAgICAgIHRoaXMuY29uZmlnLmVudGl0eSA9IG51bGw7XG4gICAgICB0aGlzLmRpYWxvZy5jbG9zZSggLTEgKTtcbiAgICB9LCA1MDAgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEhhbmRsZSB0aGUgZm9ybSBldmVudHMgdG8gdHJpZ2dlciB0aGUgZm9ybSB2YWxpZGF0aW9uXG4gICAqIEBwYXJhbSBldmVudFxuICAgKi9cbiAgb25CdWJibGVFdmVudCggZXZlbnQgKXtcbiAgICBpZiggZXZlbnQubmFtZSA9PT0gJ29uS2V5VXAnICl7XG4gICAgICB0aGlzLmRvbS5zdGF0ZS52YWxpZGF0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGB0cmlnZ2VyLXZhbGlkYXRpb25gLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuX3RyaWdnZXJGb3JtVmFsaWRhdGlvbigpO1xuICAgICAgfSwgNTAwICk7XG5cbiAgICB9XG4gICAgaWYoIElzVmFsaWRGaWVsZFBhdGNoRXZlbnQoIHRoaXMuY29yZSwgZXZlbnQgKSB8fCBldmVudC5uYW1lID09PSAnb25CbHVyJyApe1xuICAgICAgdGhpcy5kb20uc2V0VGltZW91dCggYHRyaWdnZXItdmFsaWRhdGlvbmAsICgpID0+IHtcbiAgICAgICAgdGhpcy5fdHJpZ2dlckZvcm1WYWxpZGF0aW9uKCk7XG4gICAgICB9LCA1MDAgKTtcbiAgICB9ZWxzZXtcbiAgICAgIC8vIGlmIGEgZmllbGQgaXMgZm9jdXNlZCB3ZSB3YW50IGEgY2hhbmNlIHRvIHZhbGlkYXRlIGFnYWluXG4gICAgICAvLyB0aGlzLmRvbS5zdGF0ZS52YWxpZGF0ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgLy8gaWYoIGV2ZW50LnR5cGUgPT09ICdmaWVsZCcgJiYgZXZlbnQubmFtZSA9PT0gJ29uQ2hhbmdlJyApIGV2ZW50LmZvcm0gPSB0aGlzLnVpLmZvcm07XG4gICAgdGhpcy5ldmVudHMuZW1pdCggZXZlbnQgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSBkb20gZGVzdHJveSBmdW5jdGlvbiBtYW5hZ2VzIGFsbCB0aGUgY2xlYW4gdXAgdGhhdCBpcyBuZWNlc3NhcnkgaWYgc3Vic2NyaXB0aW9ucywgdGltZW91dHMsIGV0YyBhcmUgc3RvcmVkIHByb3Blcmx5XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IHdpbGwgdHJpZ2dlciB0aGUgZm9ybSB2YWxpZGF0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF90cmlnZ2VyRm9ybVZhbGlkYXRpb24oKXtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCBgdHJpZ2dlci1mb3JtLXZhbGlkYXRpb25gLCAoKSA9PiB7XG4gICAgICB0aGlzLl92YWxpZGF0ZUZvcm0oKS50aGVuKCAoIHZhbGlkOiBib29sZWFuICkgPT4ge1xuICAgICAgICB0aGlzLmRvbS5zdGF0ZS52YWxpZGF0ZWQgPSB2YWxpZDtcbiAgICAgIH0gKTtcbiAgICB9LCA1MCApO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIGZvcm0gbmVlZHMgdG8gYWJsZSB0byBtYWtlIGFwaSBjYWxscyB0byB2ZXJpZnkgaW5mbyBmb3IgY2VydGFpbiBmaWVsZHNcbiAgICogVG9Ebzo6IEFsbG93IHRoZSBjb25maWcgdG8gYmUgYWJsZSB0byBwYXNzIGluIGFwaSB2YWxpZGF0aW9uIGNhbGxzIGZvciBjZXJ0YWluIGZpZWxkc1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfdmFsaWRhdGVGb3JtKCk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KCAoIHJlc29sdmUgKSA9PiB7XG4gICAgICB0aGlzLmRvbS5zdGF0ZS52YWxpZGF0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGB0cmlnZ2VyLWZvcm0tdmFsaWRhdGlvbmAsIG51bGwgKTtcbiAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGB2YWxpZGF0ZS1mb3JtYCwgKCkgPT4ge1xuICAgICAgICB0aGlzLnVpLmZvcm0udXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpO1xuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5kb20uc3RhdGUudmFsaWRhdGVkID0gdHJ1ZTsgLy8gbW9jayBzdHViIGZvciBub3dcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSggdGhpcy51aS5mb3JtLnZhbGlkICk7XG4gICAgICAgIH0sIDAgKTtcbiAgICAgIH0sIDAgKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGhvb2sgaXMgY2FsbGVkIHdoZW4gdGhlIGZvcm0gaXMgc3VibWl0dGluZ1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfb25TdWJtaXNzaW9uU3RhcnQoKXtcbiAgICB0aGlzLmRvbS5zdGF0ZS5wZW5kaW5nID0gdHJ1ZTtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCBgc3VibWl0LWZvcm1gLCBudWxsICk7XG4gICAgdGhpcy5kb20uc2V0VGltZW91dCggYHRyaWdnZXItdmFsaWRhdGlvbmAsIG51bGwgKTtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCBgdHJpZ2dlci1mb3JtLXZhbGlkYXRpb25gLCBudWxsICk7XG4gICAgdGhpcy5kb20uc2V0VGltZW91dCggYHZhbGlkYXRlLWZvcm1gLCBudWxsICk7XG4gICAgdGhpcy5kb20uZXJyb3IubWVzc2FnZSA9ICcnO1xuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGBzZXQtZXJyb3JgLCBudWxsICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGhvb2sgaXMgY2FsbGVkIHdoZW4gdGhlIGZvcm0gc3VibWlzc2lvbiBoYXMgZmFpbGVkXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9vblN1Ym1pc3Npb25GYWlsKCl7XG4gICAgdGhpcy5kb20uc3RhdGUucGVuZGluZyA9IGZhbHNlO1xuICAgIC8vIHRoaXMuZG9tLnN0YXRlLnZhbGlkYXRlZCA9IGZhbHNlO1xuXG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGhvb2sgaXMgY2FsbGVkIHdoZW4gdGhlIGZvcm0gaGFzIHN1Ym1pdHRlZCBzdWNjZXNzZnVsbHlcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX29uU3VibWlzc2lvblN1Y2Nlc3MoKXtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oIGFzeW5jKCByZXNvbHZlICkgPT4ge1xuICAgICAgdGhpcy5kb20uc3RhdGUucGVuZGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5kb20uc3RhdGUudmFsaWRhdGVkID0gZmFsc2U7XG4gICAgICB0aGlzLmRvbS5zdGF0ZS5zdWNjZXNzID0gKCB0aGlzLmNvbmZpZy5lbnRpdHkubWVzc2FnZSAhPT0gbnVsbCA/IHRoaXMuY29uZmlnLmVudGl0eS5tZXNzYWdlIDogJ0NyZWF0ZWQnICk7XG4gICAgICBjb25zdCBldmVudCA9IDxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+e1xuICAgICAgICBzb3VyY2U6IHRoaXMubmFtZSxcbiAgICAgICAgbWV0aG9kOiAnY3JlYXRlJyxcbiAgICAgICAgdHlwZTogJ2VudGl0eScsXG4gICAgICAgIG5hbWU6IHRoaXMuY29uZmlnLnBhcmFtcy5uYW1lLFxuICAgICAgICBpbnRlcm5hbF9uYW1lOiB0aGlzLmNvbmZpZy5wYXJhbXMuaW50ZXJuYWxfbmFtZSxcbiAgICAgICAgZGF0YTogdGhpcy5jb25maWcuZW50aXR5XG4gICAgICB9O1xuICAgICAgaWYoIElzQ2FsbGFibGVGdW5jdGlvbiggdGhpcy5jb25maWcuaW5EaWFsb2cuY2FsbGJhY2sgKSApe1xuICAgICAgICBhd2FpdCB0aGlzLmNvbmZpZy5pbkRpYWxvZy5jYWxsYmFjayggdGhpcy5jb3JlLCBldmVudCApO1xuICAgICAgfVxuICAgICAgdGhpcy5zcnYuZXZlbnRzLnNlbmRFdmVudCggZXZlbnQgKTtcblxuICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IHdpbGwgaGFuZGxlIGVycm9yc1xuICAgKiBAcGFyYW0gbWVzc2FnZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0RXJyb3JNZXNzYWdlKCBlcnI6IGFueSApe1xuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGBzZXQtZXJyLW1zZ2AsICgpID0+IHtcbiAgICAgIHRoaXMuZG9tLnN0YXRlLnBlbmRpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuZG9tLmVycm9yLm1lc3NhZ2UgPSBHZXRIdHRwRXJyb3JNc2coIGVyciApO1xuICAgICAgdGhpcy51aS5mb3JtLm1hcmtBc1ByaXN0aW5lKCk7XG5cbiAgICAgIC8vIHRoaXMuZG9tLnNldFRpbWVvdXQoIGBjbGVhci1lcnItbXNnYCwgKCkgPT4ge1xuICAgICAgLy8gICB0aGlzLmRvbS5lcnJvci5tZXNzYWdlID0gJyc7XG4gICAgICAvLyB9LCA1MDAwICk7XG4gICAgfSwgNTAwICk7XG4gIH1cblxuXG59XG4iXX0=