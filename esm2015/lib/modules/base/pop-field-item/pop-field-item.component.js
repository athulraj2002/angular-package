import { Component, HostBinding, Input } from '@angular/core';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopRequest, ServiceInjector } from '../../../pop-common.model';
import { ValidationErrorMessages } from '../../../services/pop-validators';
import { GetHttpErrorMsg, IsArray, IsNumber, IsObject, IsString, PopTransform } from '../../../pop-common-utility';
import { SessionEntityFieldUpdate } from '../../entity/pop-entity-utility';
import { PopEntityEventService } from '../../entity/services/pop-entity-event.service';
export class PopFieldItemComponent extends PopExtendComponent {
    constructor() {
        super();
        this.position = 1;
        this.when = null;
        this.hidden = false;
        this.dom.state.helper = false;
        this.dom.state.tooltip = false;
        this.dom.state.hint = false;
    }
    /**
     * This component should have a specific purpose
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * On Link Click
     */
    onLinkClick() {
        console.log('LINK STUB: Link to Entity', this.config);
    }
    /**
     * On Blur Event
     */
    onBlur() {
        if (IsObject(this.config, true)) {
            let value = this.config.control.value;
            if (IsString(value)) {
                value = String(value).trim();
                this.config.control.setValue(value);
            }
            else if (IsNumber(value)) {
                value = +String(value).trim();
                this.config.control.setValue(value);
            }
            this.onBubbleEvent('onBlur');
            if (this._isChangeValid()) {
                if (this._isFieldPatchable()) {
                    this.onChange();
                }
                else {
                    this._applyTransformation(value);
                }
            }
        }
    }
    /**
     * On Change event
     * @param value
     * @param force
     */
    onChange(value, force = false) {
        if (IsObject(this.config, ['control'])) {
            this.log.info(`onChange`, value);
            const control = this.config.control;
            if (typeof value !== 'undefined') {
                control.setValue(value);
                control.markAsDirty();
                control.updateValueAndValidity();
            }
            if (this._isChangeValid()) {
                value = typeof value !== 'undefined' ? value : this.config.control.value;
                value = this._applyTransformation(value);
                if (this.config.patch && (this.config.patch.path || this.config.facade)) {
                    this._onPatch(value, force);
                }
                else {
                    this.onBubbleEvent('onChange');
                }
            }
            else {
                // console.log( 'invalid change', this.config.control.value );
                this.onBubbleEvent('onInvalidChange');
            }
        }
    }
    /**
     * On Focus event
     */
    onFocus() {
        if (IsObject(this.config, ['control'])) {
            const control = this.config.control;
            if (!control.dirty)
                this.asset.storedValue = this.config.control.value;
            this.config.message = '';
            this.onBubbleEvent('onFocus');
        }
    }
    /**
     * This will bubble an event up the pipeline
     * @param eventName
     * @param message
     * @param extend
     * @param force
     */
    onBubbleEvent(eventName, message = null, extend = {}, force = false) {
        if (IsObject(this.config, true)) {
            const event = {
                type: 'field',
                name: eventName,
                source: this.name
            };
            if (this.config)
                event.config = this.config;
            if (message)
                event.message = message;
            Object.keys(extend).map((key) => {
                event[key] = extend[key];
            });
            this.log.event(`onBubbleEvent`, event);
            if (this.config.bubble || force) {
                this.events.emit(event);
            }
            return event;
        }
    }
    ngOnDestroy() {
        this._clearState();
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Protected Method )                                      *
     *               These are protected instead of private so that they can be overridden          *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Hook that is called on destroy to reset the field
     */
    _clearState() {
        const patch = this.config.patch;
        const control = this.config.control;
        if (patch.running) {
            control.enable();
            patch.running = false;
        }
    }
    /**
     * Hook that is called right before a patch
     */
    _beforePatch() {
        return new Promise((resolve) => {
            const patch = this.config.patch;
            const control = this.config.control;
            control.disable();
            patch.running = true;
            this._clearMessage();
            return resolve(true);
        });
    }
    /**
     * Hook that is called right after the api response returns
     */
    _afterPatch() {
        return new Promise((resolve) => {
            const patch = this.config.patch;
            const control = this.config.control;
            control.enable();
            patch.running = false;
            return resolve(true);
        });
    }
    /**
     * Prepare to make an api call to the server
     * @param value
     * @param force
     */
    _onPatch(value, force = false) {
        const patch = this.config.patch;
        if (!force) {
            if (!this.config.control.valid)
                return false;
            if (value === this.asset.storedValue)
                return false;
            if (patch.trigger === 'manual')
                return false;
        }
        this._beforePatch().then(() => {
            if (this.config.facade && !force) {
                this.dom.setTimeout('api-facade', () => {
                    this._onPatchSuccess({}).then(() => this._afterPatch());
                }, (this.config.patch.duration || 0));
            }
            else {
                this.log.info(`onPatch`);
                this._doPatch(this._getPatchBody(value));
            }
        });
    }
    /**
     * This fx will make the actual api call to the server
     * @param body
     * @private
     */
    _doPatch(body) {
        const method = this.config.patch.method ? this.config.patch.method : 'PATCH';
        const patch = this.config.patch;
        const ignore401 = (patch.ignore401 ? true : null);
        const version = (patch.version ? patch.version : 1);
        if (IsString(this.config.patch.path, true)) {
            const request = method === 'PATCH' ? PopRequest.doPatch(this.config.patch.path, body, version, ignore401, this.config.patch.businessId) : PopRequest.doPost(this.config.patch.path, body, version, ignore401, this.config.patch.businessId);
            this.dom.setSubscriber('api-patch', request.subscribe(res => {
                this._onPatchSuccess(res).then(() => this._afterPatch());
            }, err => {
                this._onPatchFail(err).then(() => this._afterPatch());
            }));
        }
        else {
            this._onPatchSuccess(body).then(() => this._afterPatch());
        }
    }
    /**
     * Determine if a change is valid
     */
    _isChangeValid() {
        const control = this.config.control;
        if (control.invalid) {
            if (this.config.displayErrors)
                this._setMessage(ValidationErrorMessages(control.errors));
            return false;
        }
        return this._checkPrevent();
    }
    /**
     * Determine if a field should be patched
     */
    _isFieldPatchable() {
        if (this.config.facade) {
            return true;
        }
        else if (this.config.patch && this.config.patch.path) {
            return true;
        }
        return false;
    }
    /**
     * Helper to determine if an event is related to a field update
     * @param event
     */
    _isFieldChange(event) {
        return event.type === 'field' && (event.name === 'onChange' || event.name === 'patch');
    }
    /**
     * Transformations can be applied to a value before it is sent to the api server
     * @param value
     */
    _applyTransformation(value) {
        if (IsString(this.config.transformation, true)) {
            value = PopTransform(value, this.config.transformation);
            if (value !== this.config.control.value)
                this.config.control.setValue(value);
        }
        return value;
    }
    /**
     * Handle an api call success
     * @param res
     */
    _onPatchSuccess(res) {
        return new Promise((resolve) => {
            this.log.info(`onPatchSuccess`);
            const patch = this.config.patch;
            const control = this.config.control;
            this.asset.storedValue = control.value;
            patch.success = true;
            patch.running = false;
            const event = this.onBubbleEvent(`patch`, 'Patched.', {
                success: true,
                response: res.data ? res.data : res
            }, true);
            if (IsObject(this.core, ['channel'])) {
                if (this.config.session) {
                    if (SessionEntityFieldUpdate(this.core, event, this.config.sessionPath)) {
                        if (!event.channel) {
                            event.channel = true;
                            this.core.channel.emit(event);
                        }
                        this.core.repo.clearCache('table', 'data');
                    }
                    else {
                        this.log.error(`SessionEntityFieldUpdate:${event.config.name}`, `Session failed`);
                    }
                }
                ServiceInjector.get(PopEntityEventService).sendEvent(event);
            }
            if (typeof patch.callback === 'function') { // allows developer to attach a callback when this field is updated
                patch.callback(this.core, event);
                this._onPatchSuccessAdditional();
            }
            this.dom.setTimeout('patch-success', () => {
                patch.success = false;
            }, (this.config.patch.duration || 0));
            return resolve(true);
        });
    }
    _onPatchSuccessAdditional() {
        return true;
    }
    /**
     * Handle an http failure
     * @param err
     */
    _onPatchFail(err) {
        return new Promise((resolve) => {
            this.log.info(`onPatchFail`);
            const patch = this.config.patch;
            const control = this.config.control;
            patch.running = false;
            control.markAsDirty();
            control.setValue(this.asset.storedValue);
            control.setErrors({ server: true });
            this.config.message = GetHttpErrorMsg(err);
            this.onBubbleEvent(`patch`, this.config.message, {
                success: false,
                response: err
            }, true);
            this._onPatchFailAdditional();
            return resolve(true);
        });
    }
    _onPatchFailAdditional() {
        return true;
    }
    /**
     * Set up the body of the api patch
     * @param value
     * @private
     */
    _getPatchBody(value) {
        let body = {};
        const patch = this.config.patch;
        value = typeof value !== 'undefined' ? value : this.config.control.value;
        if (IsObject(value)) {
            const val = value;
            body = Object.assign(Object.assign({}, body), val);
        }
        else if (IsArray(value)) {
            body[this.config.patch.field] = value;
        }
        else {
            body[this.config.patch.field] = value;
            if (this.config.empty && !body[this.config.patch.field]) {
                body[this.config.patch.field] = PopTransform(String(value), this.config.empty);
            }
        }
        if (this.config.patch.json)
            body[this.config.patch.field] = JSON.stringify(body[this.config.patch.field]);
        if (patch && patch.metadata) {
            for (const i in patch.metadata) {
                if (!patch.metadata.hasOwnProperty(i))
                    continue;
                body[i] = patch.metadata[i];
            }
        }
        return body;
    }
    /**
     * Helper to set error message
     * @param message
     */
    _setMessage(message) {
        this.config.message = message;
    }
    /**
     * Helper to clear error message
     */
    _clearMessage() {
        this.config.message = '';
    }
    _checkPrevent() {
        if (IsArray(this.config.prevent, true)) {
            const control = this.config.control;
            const value = control.value;
            const conflicts = this.config.prevent.filter((str) => str.toLowerCase() === String(value).toLowerCase());
            if (conflicts.length) {
                control.setErrors({ unique: true });
                this._setMessage(ValidationErrorMessages(control.errors));
                return false;
            }
            else {
                this._clearMessage();
                return true;
            }
        }
        return true;
    }
}
PopFieldItemComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-field-item-component',
                template: `Field Item Component`
            },] }
];
PopFieldItemComponent.ctorParameters = () => [];
PopFieldItemComponent.propDecorators = {
    position: [{ type: Input }],
    when: [{ type: Input }],
    hidden: [{ type: HostBinding, args: ['class.sw-hidden',] }, { type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWZpZWxkLWl0ZW0uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtZmllbGQtaXRlbS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFxQixTQUFTLEVBQWMsV0FBVyxFQUFFLEtBQUssRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFDaEgsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDbkUsT0FBTyxFQUFzRSxVQUFVLEVBQUUsZUFBZSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFHNUksT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDM0UsT0FBTyxFQUFDLGVBQWUsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDakgsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDM0UsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFPdkYsTUFBTSxPQUFPLHFCQUFzQixTQUFRLGtCQUFrQjtJQVUzRDtRQUNFLEtBQUssRUFBRSxDQUFDO1FBVkQsYUFBUSxHQUFHLENBQUMsQ0FBQztRQUNiLFNBQUksR0FBVSxJQUFJLENBQUM7UUFDZSxXQUFNLEdBQUcsS0FBSyxDQUFDO1FBVXhELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUMvQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFD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QUMxQztpQkFBSTtnQkFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBRSxTQUFTLENBQUUsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBRSxJQUFJLENBQUMsYUFBYSxDQUFFLEtBQUssQ0FBRSxDQUFFLENBQUM7YUFDOUM7UUFDSCxDQUFDLENBQUUsQ0FBQztJQUNOLENBQUM7SUFHRDs7OztPQUlHO0lBQ08sUUFBUSxDQUFFLElBQVk7UUFDOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUM3RSxNQUFNLEtBQUssR0FBNEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDekQsTUFBTSxTQUFTLEdBQUcsQ0FBRSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBRSxDQUFDO1FBQ3BELE1BQU0sT0FBTyxHQUFHLENBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFLENBQUM7UUFDdEQsSUFBSSxRQUFRLENBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBRSxFQUFFO1lBQzVDLE1BQU0sT0FBTyxHQUFHLE1BQU0sS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUks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QUNqRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQzVCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBRSxDQUFFLEdBQUcsRUFBRyxFQUFFLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLE1BQU0sQ0FBRSxLQUFLLENBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBRSxDQUFDO1lBQy9HLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRTtnQkFDcEIsT0FBTyxDQUFDLFNBQVMsQ0FBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBRSxDQUFDO2dCQUN0QyxJQUFJLENBQUMsV0FBVyxDQUFFLHVCQUF1QixDQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUUsQ0FBRSxDQUFDO2dCQUM5RCxPQUFPLEtBQUssQ0FBQzthQUNkO2lCQUFJO2dCQUNILElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDckIsT0FBTyxJQUFJLENBQUM7YUFDYjtTQUNGO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDOzs7WUFoY0YsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSw4QkFBOEI7Z0JBQ3hDLFFBQVEsRUFBRSxzQkFBc0I7YUFDakM7Ozs7dUJBRUUsS0FBSzttQkFDTCxLQUFLO3FCQUNMLFdBQVcsU0FBRSxpQkFBaUIsY0FBSSxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSG9zdEJpbmRpbmcsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHsgRGljdGlvbmFyeSwgRW50aXR5LCBGaWVsZEl0ZW1QYXRjaEludGVyZmFjZSwgUG9wQmFzZUV2ZW50SW50ZXJmYWNlLCBQb3BSZXF1ZXN0LCBTZXJ2aWNlSW5qZWN0b3IgfSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IEh0dHBFcnJvclJlc3BvbnNlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgRm9ybUNvbnRyb2wgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBWYWxpZGF0aW9uRXJyb3JNZXNzYWdlcyB9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL3BvcC12YWxpZGF0b3JzJztcbmltcG9ydCB7R2V0SHR0cEVycm9yTXNnLCBJc0FycmF5LCBJc051bWJlciwgSXNPYmplY3QsIElzU3RyaW5nLCBQb3BUcmFuc2Zvcm19IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQgeyBTZXNzaW9uRW50aXR5RmllbGRVcGRhdGUgfSBmcm9tICcuLi8uLi9lbnRpdHkvcG9wLWVudGl0eS11dGlsaXR5JztcbmltcG9ydCB7IFBvcEVudGl0eUV2ZW50U2VydmljZSB9IGZyb20gJy4uLy4uL2VudGl0eS9zZXJ2aWNlcy9wb3AtZW50aXR5LWV2ZW50LnNlcnZpY2UnO1xuXG5cbkBDb21wb25lbnQoIHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWZpZWxkLWl0ZW0tY29tcG9uZW50JyxcbiAgdGVtcGxhdGU6IGBGaWVsZCBJdGVtIENvbXBvbmVudGAsXG59IClcbmV4cG9ydCBjbGFzcyBQb3BGaWVsZEl0ZW1Db21wb25lbnQgZXh0ZW5kcyBQb3BFeHRlbmRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIHBvc2l0aW9uID0gMTtcbiAgQElucHV0KCkgd2hlbjogYW55W10gPSBudWxsO1xuICBASG9zdEJpbmRpbmcoICdjbGFzcy5zdy1oaWRkZW4nICkgQElucHV0KCkgaGlkZGVuID0gZmFsc2U7XG4gIGNvbmZpZzogYW55O1xuICBlbDogRWxlbWVudFJlZjtcbiAgbmFtZTogc3RyaW5nO1xuICBwcm90ZWN0ZWQgY2RyOiBDaGFuZ2VEZXRlY3RvclJlZjtcblxuXG4gIGNvbnN0cnVjdG9yKCl7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuZG9tLnN0YXRlLmhlbHBlciA9IGZhbHNlO1xuICAgIHRoaXMuZG9tLnN0YXRlLnRvb2x0aXAgPSBmYWxzZTtcbiAgICB0aGlzLmRvbS5zdGF0ZS5oaW50ID0gZmFsc2U7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCBzaG91bGQgaGF2ZSBhIHNwZWNpZmljIHB1cnBvc2VcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE9uIExpbmsgQ2xpY2tcbiAgICovXG4gIG9uTGlua0NsaWNrKCl7XG4gICAgY29uc29sZS5sb2coICdMSU5LIFNUVUI6IExpbmsgdG8gRW50aXR5JywgdGhpcy5jb25maWcgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE9uIEJsdXIgRXZlbnRcbiAgICovXG4gIG9uQmx1cigpe1xuICAgIGlmKCBJc09iamVjdCggdGhpcy5jb25maWcsIHRydWUgKSApe1xuICAgICAgbGV0IHZhbHVlID0gdGhpcy5jb25maWcuY29udHJvbC52YWx1ZTtcbiAgICAgIGlmKCBJc1N0cmluZyggdmFsdWUgKSApe1xuICAgICAgICB2YWx1ZSA9IFN0cmluZyggdmFsdWUgKS50cmltKCk7XG4gICAgICAgIHRoaXMuY29uZmlnLmNvbnRyb2wuc2V0VmFsdWUoIHZhbHVlICk7XG4gICAgICB9ZWxzZSBpZiggSXNOdW1iZXIoIHZhbHVlICkgKXtcbiAgICAgICAgdmFsdWUgPSArU3RyaW5nKCB2YWx1ZSApLnRyaW0oKTtcbiAgICAgICAgdGhpcy5jb25maWcuY29udHJvbC5zZXRWYWx1ZSggdmFsdWUgKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5vbkJ1YmJsZUV2ZW50KCAnb25CbHVyJyApO1xuICAgICAgaWYoIHRoaXMuX2lzQ2hhbmdlVmFsaWQoKSApe1xuICAgICAgICBpZiggdGhpcy5faXNGaWVsZFBhdGNoYWJsZSgpICl7XG4gICAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB0aGlzLl9hcHBseVRyYW5zZm9ybWF0aW9uKCB2YWx1ZSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogT24gQ2hhbmdlIGV2ZW50XG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKiBAcGFyYW0gZm9yY2VcbiAgICovXG4gIG9uQ2hhbmdlKCB2YWx1ZT86IGFueSwgZm9yY2UgPSBmYWxzZSApe1xuICAgIGlmKCBJc09iamVjdCggdGhpcy5jb25maWcsIFsgJ2NvbnRyb2wnIF0gKSApe1xuICAgICAgdGhpcy5sb2cuaW5mbyggYG9uQ2hhbmdlYCwgdmFsdWUgKTtcbiAgICAgIGNvbnN0IGNvbnRyb2wgPSA8Rm9ybUNvbnRyb2w+dGhpcy5jb25maWcuY29udHJvbDtcbiAgICAgIGlmKCB0eXBlb2YgdmFsdWUgIT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgIGNvbnRyb2wuc2V0VmFsdWUoIHZhbHVlICk7XG4gICAgICAgIGNvbnRyb2wubWFya0FzRGlydHkoKTtcbiAgICAgICAgY29udHJvbC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCk7XG4gICAgICB9XG4gICAgICBpZiggdGhpcy5faXNDaGFuZ2VWYWxpZCgpICl7XG4gICAgICAgIHZhbHVlID0gdHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJyA/IHZhbHVlIDogdGhpcy5jb25maWcuY29udHJvbC52YWx1ZTtcbiAgICAgICAgdmFsdWUgPSB0aGlzLl9hcHBseVRyYW5zZm9ybWF0aW9uKCB2YWx1ZSApO1xuICAgICAgICBpZiggdGhpcy5jb25maWcucGF0Y2ggJiYgKCB0aGlzLmNvbmZpZy5wYXRjaC5wYXRoIHx8IHRoaXMuY29uZmlnLmZhY2FkZSApICl7XG4gICAgICAgICAgdGhpcy5fb25QYXRjaCggdmFsdWUsIGZvcmNlICk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRoaXMub25CdWJibGVFdmVudCggJ29uQ2hhbmdlJyApO1xuICAgICAgICB9XG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy8gY29uc29sZS5sb2coICdpbnZhbGlkIGNoYW5nZScsIHRoaXMuY29uZmlnLmNvbnRyb2wudmFsdWUgKTtcbiAgICAgICAgdGhpcy5vbkJ1YmJsZUV2ZW50KCAnb25JbnZhbGlkQ2hhbmdlJyApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIE9uIEZvY3VzIGV2ZW50XG4gICAqL1xuICBvbkZvY3VzKCk6IHZvaWR7XG4gICAgaWYoIElzT2JqZWN0KCB0aGlzLmNvbmZpZywgWyAnY29udHJvbCcgXSApICl7XG4gICAgICBjb25zdCBjb250cm9sID0gPEZvcm1Db250cm9sPnRoaXMuY29uZmlnLmNvbnRyb2w7XG4gICAgICBpZiggIWNvbnRyb2wuZGlydHkgKSB0aGlzLmFzc2V0LnN0b3JlZFZhbHVlID0gdGhpcy5jb25maWcuY29udHJvbC52YWx1ZTtcbiAgICAgIHRoaXMuY29uZmlnLm1lc3NhZ2UgPSAnJztcbiAgICAgIHRoaXMub25CdWJibGVFdmVudCggJ29uRm9jdXMnICk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVGhpcyB3aWxsIGJ1YmJsZSBhbiBldmVudCB1cCB0aGUgcGlwZWxpbmVcbiAgICogQHBhcmFtIGV2ZW50TmFtZVxuICAgKiBAcGFyYW0gbWVzc2FnZVxuICAgKiBAcGFyYW0gZXh0ZW5kXG4gICAqIEBwYXJhbSBmb3JjZVxuICAgKi9cbiAgb25CdWJibGVFdmVudCggZXZlbnROYW1lOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZyA9IG51bGwsIGV4dGVuZDogRGljdGlvbmFyeTxhbnk+ID0ge30sIGZvcmNlID0gZmFsc2UgKTogUG9wQmFzZUV2ZW50SW50ZXJmYWNle1xuICAgIGlmKCBJc09iamVjdCggdGhpcy5jb25maWcsIHRydWUgKSApe1xuICAgICAgY29uc3QgZXZlbnQgPSA8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPntcbiAgICAgICAgdHlwZTogJ2ZpZWxkJyxcbiAgICAgICAgbmFtZTogZXZlbnROYW1lLFxuICAgICAgICBzb3VyY2U6IHRoaXMubmFtZVxuICAgICAgfTtcbiAgICAgIGlmKCB0aGlzLmNvbmZpZyApIGV2ZW50LmNvbmZpZyA9IHRoaXMuY29uZmlnO1xuICAgICAgaWYoIG1lc3NhZ2UgKSBldmVudC5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgIE9iamVjdC5rZXlzKCBleHRlbmQgKS5tYXAoICgga2V5ICkgPT4ge1xuICAgICAgICBldmVudFsga2V5IF0gPSBleHRlbmRbIGtleSBdO1xuICAgICAgfSApO1xuICAgICAgdGhpcy5sb2cuZXZlbnQoIGBvbkJ1YmJsZUV2ZW50YCwgZXZlbnQgKTtcbiAgICAgIGlmKCB0aGlzLmNvbmZpZy5idWJibGUgfHwgZm9yY2UgKXtcbiAgICAgICAgdGhpcy5ldmVudHMuZW1pdCggZXZlbnQgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1cbiAgfVxuXG5cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICB0aGlzLl9jbGVhclN0YXRlKCk7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByb3RlY3RlZCBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgIFRoZXNlIGFyZSBwcm90ZWN0ZWQgaW5zdGVhZCBvZiBwcml2YXRlIHNvIHRoYXQgdGhleSBjYW4gYmUgb3ZlcnJpZGRlbiAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAvKipcbiAgICogSG9vayB0aGF0IGlzIGNhbGxlZCBvbiBkZXN0cm95IHRvIHJlc2V0IHRoZSBmaWVsZFxuICAgKi9cbiAgcHJvdGVjdGVkIF9jbGVhclN0YXRlKCk6IHZvaWR7XG4gICAgY29uc3QgcGF0Y2ggPSA8RmllbGRJdGVtUGF0Y2hJbnRlcmZhY2U+dGhpcy5jb25maWcucGF0Y2g7XG4gICAgY29uc3QgY29udHJvbCA9IDxGb3JtQ29udHJvbD50aGlzLmNvbmZpZy5jb250cm9sO1xuICAgIGlmKCBwYXRjaC5ydW5uaW5nICl7XG4gICAgICBjb250cm9sLmVuYWJsZSgpO1xuICAgICAgcGF0Y2gucnVubmluZyA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEhvb2sgdGhhdCBpcyBjYWxsZWQgcmlnaHQgYmVmb3JlIGEgcGF0Y2hcbiAgICovXG4gIHByb3RlY3RlZCBfYmVmb3JlUGF0Y2goKTogUHJvbWlzZTxib29sZWFuPntcbiAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSApID0+IHtcbiAgICAgIGNvbnN0IHBhdGNoID0gPEZpZWxkSXRlbVBhdGNoSW50ZXJmYWNlPnRoaXMuY29uZmlnLnBhdGNoO1xuICAgICAgY29uc3QgY29udHJvbCA9IDxGb3JtQ29udHJvbD50aGlzLmNvbmZpZy5jb250cm9sO1xuXG4gICAgICBjb250cm9sLmRpc2FibGUoKTtcbiAgICAgIHBhdGNoLnJ1bm5pbmcgPSB0cnVlO1xuXG4gICAgICB0aGlzLl9jbGVhck1lc3NhZ2UoKTtcblxuICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBIb29rIHRoYXQgaXMgY2FsbGVkIHJpZ2h0IGFmdGVyIHRoZSBhcGkgcmVzcG9uc2UgcmV0dXJuc1xuICAgKi9cbiAgcHJvdGVjdGVkIF9hZnRlclBhdGNoKCk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUgKSA9PiB7XG4gICAgICBjb25zdCBwYXRjaCA9IDxGaWVsZEl0ZW1QYXRjaEludGVyZmFjZT50aGlzLmNvbmZpZy5wYXRjaDtcbiAgICAgIGNvbnN0IGNvbnRyb2wgPSA8Rm9ybUNvbnRyb2w+dGhpcy5jb25maWcuY29udHJvbDtcblxuICAgICAgY29udHJvbC5lbmFibGUoKTtcbiAgICAgIHBhdGNoLnJ1bm5pbmcgPSBmYWxzZTtcblxuICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBQcmVwYXJlIHRvIG1ha2UgYW4gYXBpIGNhbGwgdG8gdGhlIHNlcnZlclxuICAgKiBAcGFyYW0gdmFsdWVcbiAgICogQHBhcmFtIGZvcmNlXG4gICAqL1xuICBwcm90ZWN0ZWQgX29uUGF0Y2goIHZhbHVlPzogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IG51bGwgfCBPYmplY3QsIGZvcmNlID0gZmFsc2UgKXtcbiAgICBjb25zdCBwYXRjaCA9IDxGaWVsZEl0ZW1QYXRjaEludGVyZmFjZT50aGlzLmNvbmZpZy5wYXRjaDtcbiAgICBpZiggIWZvcmNlICl7XG4gICAgICBpZiggIXRoaXMuY29uZmlnLmNvbnRyb2wudmFsaWQgKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiggdmFsdWUgPT09IHRoaXMuYXNzZXQuc3RvcmVkVmFsdWUgKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiggcGF0Y2gudHJpZ2dlciA9PT0gJ21hbnVhbCcgKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMuX2JlZm9yZVBhdGNoKCkudGhlbiggKCkgPT4ge1xuICAgICAgaWYoIHRoaXMuY29uZmlnLmZhY2FkZSAmJiAhZm9yY2UgKXtcbiAgICAgICAgdGhpcy5kb20uc2V0VGltZW91dCggJ2FwaS1mYWNhZGUnLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fb25QYXRjaFN1Y2Nlc3MoIDxFbnRpdHk+e30gKS50aGVuKCAoKSA9PiB0aGlzLl9hZnRlclBhdGNoKCkgKTtcbiAgICAgICAgfSwgKCB0aGlzLmNvbmZpZy5wYXRjaC5kdXJhdGlvbiB8fCAwICkgKTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLmxvZy5pbmZvKCBgb25QYXRjaGAgKTtcbiAgICAgICAgdGhpcy5fZG9QYXRjaCggdGhpcy5fZ2V0UGF0Y2hCb2R5KCB2YWx1ZSApICk7XG4gICAgICB9XG4gICAgfSApO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBmeCB3aWxsIG1ha2UgdGhlIGFjdHVhbCBhcGkgY2FsbCB0byB0aGUgc2VydmVyXG4gICAqIEBwYXJhbSBib2R5XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcm90ZWN0ZWQgX2RvUGF0Y2goIGJvZHk6IEVudGl0eSApe1xuICAgIGNvbnN0IG1ldGhvZCA9IHRoaXMuY29uZmlnLnBhdGNoLm1ldGhvZCA/IHRoaXMuY29uZmlnLnBhdGNoLm1ldGhvZCA6ICdQQVRDSCc7XG4gICAgY29uc3QgcGF0Y2ggPSA8RmllbGRJdGVtUGF0Y2hJbnRlcmZhY2U+dGhpcy5jb25maWcucGF0Y2g7XG4gICAgY29uc3QgaWdub3JlNDAxID0gKCBwYXRjaC5pZ25vcmU0MDEgPyB0cnVlIDogbnVsbCApO1xuICAgIGNvbnN0IHZlcnNpb24gPSAoIHBhdGNoLnZlcnNpb24gPyBwYXRjaC52ZXJzaW9uIDogMSApO1xuICAgIGlmKCBJc1N0cmluZyggdGhpcy5jb25maWcucGF0Y2gucGF0aCwgdHJ1ZSApICl7XG4gICAgICBjb25zdCByZXF1ZXN0ID0gbWV0aG9kID09PSAnUEFUQ0gnID8gUG9wUmVxdWVzdC5kb1BhdGNoKCB0aGlzLmNvbmZpZy5wYXRjaC5wYXRoLCBib2R5LCB2ZXJzaW9uLCBpZ25vcmU0MDEsIHRoaXMuY29uZmlnLnBhdGNoLmJ1c2luZXNzSWQgKSA6IFBvcFJlcXVlc3QuZG9Qb3N0KCB0aGlzLmNvbmZpZy5wYXRjaC5wYXRoLCBib2R5LCB2ZXJzaW9uLCBpZ25vcmU0MDEsIHRoaXMuY29uZmlnLnBhdGNoLmJ1c2luZXNzSWQgKTtcbiAgICAgIHRoaXMuZG9tLnNldFN1YnNjcmliZXIoICdhcGktcGF0Y2gnLCByZXF1ZXN0LnN1YnNjcmliZShcbiAgICAgICAgcmVzID0+IHtcbiAgICAgICAgICB0aGlzLl9vblBhdGNoU3VjY2VzcyggcmVzICkudGhlbiggKCkgPT4gdGhpcy5fYWZ0ZXJQYXRjaCgpICk7XG4gICAgICAgIH0sXG4gICAgICAgIGVyciA9PiB7XG4gICAgICAgICAgdGhpcy5fb25QYXRjaEZhaWwoIGVyciApLnRoZW4oICgpID0+IHRoaXMuX2FmdGVyUGF0Y2goKSApO1xuICAgICAgICB9XG4gICAgICApICk7XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLl9vblBhdGNoU3VjY2VzcyggYm9keSApLnRoZW4oICgpID0+IHRoaXMuX2FmdGVyUGF0Y2goKSApO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIERldGVybWluZSBpZiBhIGNoYW5nZSBpcyB2YWxpZFxuICAgKi9cbiAgcHJvdGVjdGVkIF9pc0NoYW5nZVZhbGlkKCl7XG4gICAgY29uc3QgY29udHJvbCA9IDxGb3JtQ29udHJvbD50aGlzLmNvbmZpZy5jb250cm9sO1xuICAgIGlmKCBjb250cm9sLmludmFsaWQgKXtcbiAgICAgIGlmKCB0aGlzLmNvbmZpZy5kaXNwbGF5RXJyb3JzICkgdGhpcy5fc2V0TWVzc2FnZSggVmFsaWRhdGlvbkVycm9yTWVzc2FnZXMoIGNvbnRyb2wuZXJyb3JzICkgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NoZWNrUHJldmVudCgpO1xuICB9XG5cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIGlmIGEgZmllbGQgc2hvdWxkIGJlIHBhdGNoZWRcbiAgICovXG4gIHByb3RlY3RlZCBfaXNGaWVsZFBhdGNoYWJsZSgpe1xuICAgIGlmKCB0aGlzLmNvbmZpZy5mYWNhZGUgKXtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1lbHNlIGlmKCB0aGlzLmNvbmZpZy5wYXRjaCAmJiB0aGlzLmNvbmZpZy5wYXRjaC5wYXRoICl7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cblxuICAvKipcbiAgICogSGVscGVyIHRvIGRldGVybWluZSBpZiBhbiBldmVudCBpcyByZWxhdGVkIHRvIGEgZmllbGQgdXBkYXRlXG4gICAqIEBwYXJhbSBldmVudFxuICAgKi9cbiAgcHJvdGVjdGVkIF9pc0ZpZWxkQ2hhbmdlKCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICl7XG4gICAgcmV0dXJuIGV2ZW50LnR5cGUgPT09ICdmaWVsZCcgJiYgKCBldmVudC5uYW1lID09PSAnb25DaGFuZ2UnIHx8IGV2ZW50Lm5hbWUgPT09ICdwYXRjaCcgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybWF0aW9ucyBjYW4gYmUgYXBwbGllZCB0byBhIHZhbHVlIGJlZm9yZSBpdCBpcyBzZW50IHRvIHRoZSBhcGkgc2VydmVyXG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKi9cbiAgcHJvdGVjdGVkIF9hcHBseVRyYW5zZm9ybWF0aW9uKCB2YWx1ZTogYW55ICl7XG4gICAgaWYoIElzU3RyaW5nKCB0aGlzLmNvbmZpZy50cmFuc2Zvcm1hdGlvbiwgdHJ1ZSApICl7XG4gICAgICB2YWx1ZSA9IFBvcFRyYW5zZm9ybSggdmFsdWUsIHRoaXMuY29uZmlnLnRyYW5zZm9ybWF0aW9uICk7XG4gICAgICBpZiggdmFsdWUgIT09IHRoaXMuY29uZmlnLmNvbnRyb2wudmFsdWUgKSB0aGlzLmNvbmZpZy5jb250cm9sLnNldFZhbHVlKCB2YWx1ZSApO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBIYW5kbGUgYW4gYXBpIGNhbGwgc3VjY2Vzc1xuICAgKiBAcGFyYW0gcmVzXG4gICAqL1xuICBwcm90ZWN0ZWQgX29uUGF0Y2hTdWNjZXNzKCByZXM6IEVudGl0eSApOiBQcm9taXNlPGJvb2xlYW4+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlICkgPT4ge1xuICAgICAgdGhpcy5sb2cuaW5mbyggYG9uUGF0Y2hTdWNjZXNzYCApO1xuICAgICAgY29uc3QgcGF0Y2ggPSA8RmllbGRJdGVtUGF0Y2hJbnRlcmZhY2U+dGhpcy5jb25maWcucGF0Y2g7XG4gICAgICBjb25zdCBjb250cm9sID0gPEZvcm1Db250cm9sPnRoaXMuY29uZmlnLmNvbnRyb2w7XG4gICAgICB0aGlzLmFzc2V0LnN0b3JlZFZhbHVlID0gY29udHJvbC52YWx1ZTtcbiAgICAgIHBhdGNoLnN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgcGF0Y2gucnVubmluZyA9IGZhbHNlO1xuXG5cbiAgICAgIGNvbnN0IGV2ZW50ID0gdGhpcy5vbkJ1YmJsZUV2ZW50KCBgcGF0Y2hgLCAnUGF0Y2hlZC4nLCB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIHJlc3BvbnNlOiByZXMuZGF0YSA/IHJlcy5kYXRhIDogcmVzXG4gICAgICB9LCB0cnVlICk7XG5cblxuICAgICAgaWYoIElzT2JqZWN0KCB0aGlzLmNvcmUsIFsgJ2NoYW5uZWwnIF0gKSApe1xuICAgICAgICBpZiggdGhpcy5jb25maWcuc2Vzc2lvbiApe1xuICAgICAgICAgIGlmKCBTZXNzaW9uRW50aXR5RmllbGRVcGRhdGUoIHRoaXMuY29yZSwgZXZlbnQsIHRoaXMuY29uZmlnLnNlc3Npb25QYXRoICkgKXtcbiAgICAgICAgICAgIGlmKCAhZXZlbnQuY2hhbm5lbCApe1xuICAgICAgICAgICAgICBldmVudC5jaGFubmVsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgdGhpcy5jb3JlLmNoYW5uZWwuZW1pdCggZXZlbnQgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY29yZS5yZXBvLmNsZWFyQ2FjaGUoICd0YWJsZScsICdkYXRhJyApO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoIGBTZXNzaW9uRW50aXR5RmllbGRVcGRhdGU6JHtldmVudC5jb25maWcubmFtZX1gLCBgU2Vzc2lvbiBmYWlsZWRgICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgU2VydmljZUluamVjdG9yLmdldCggUG9wRW50aXR5RXZlbnRTZXJ2aWNlICkuc2VuZEV2ZW50KCBldmVudCApO1xuICAgICAgfVxuXG4gICAgICBpZiggdHlwZW9mIHBhdGNoLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nICl7IC8vIGFsbG93cyBkZXZlbG9wZXIgdG8gYXR0YWNoIGEgY2FsbGJhY2sgd2hlbiB0aGlzIGZpZWxkIGlzIHVwZGF0ZWRcbiAgICAgICAgcGF0Y2guY2FsbGJhY2soIHRoaXMuY29yZSwgZXZlbnQgKTtcblxuICAgICAgICB0aGlzLl9vblBhdGNoU3VjY2Vzc0FkZGl0aW9uYWwoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoICdwYXRjaC1zdWNjZXNzJywgKCkgPT4ge1xuICAgICAgICBwYXRjaC5zdWNjZXNzID0gZmFsc2U7XG4gICAgICB9LCAoIHRoaXMuY29uZmlnLnBhdGNoLmR1cmF0aW9uIHx8IDAgKSApO1xuICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIHByb3RlY3RlZCBfb25QYXRjaFN1Y2Nlc3NBZGRpdGlvbmFsKCk6IGJvb2xlYW57XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBIYW5kbGUgYW4gaHR0cCBmYWlsdXJlXG4gICAqIEBwYXJhbSBlcnJcbiAgICovXG4gIHByb3RlY3RlZCBfb25QYXRjaEZhaWwoIGVycjogSHR0cEVycm9yUmVzcG9uc2UgKTogUHJvbWlzZTxib29sZWFuPntcbiAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSApID0+IHtcbiAgICAgIHRoaXMubG9nLmluZm8oIGBvblBhdGNoRmFpbGAgKTtcbiAgICAgIGNvbnN0IHBhdGNoID0gPEZpZWxkSXRlbVBhdGNoSW50ZXJmYWNlPnRoaXMuY29uZmlnLnBhdGNoO1xuICAgICAgY29uc3QgY29udHJvbCA9IDxGb3JtQ29udHJvbD50aGlzLmNvbmZpZy5jb250cm9sO1xuICAgICAgcGF0Y2gucnVubmluZyA9IGZhbHNlO1xuICAgICAgY29udHJvbC5tYXJrQXNEaXJ0eSgpO1xuICAgICAgY29udHJvbC5zZXRWYWx1ZSggdGhpcy5hc3NldC5zdG9yZWRWYWx1ZSApO1xuICAgICAgY29udHJvbC5zZXRFcnJvcnMoIHsgc2VydmVyOiB0cnVlIH0gKTtcbiAgICAgIHRoaXMuY29uZmlnLm1lc3NhZ2UgPSBHZXRIdHRwRXJyb3JNc2coZXJyKTtcbiAgICAgIHRoaXMub25CdWJibGVFdmVudCggYHBhdGNoYCwgdGhpcy5jb25maWcubWVzc2FnZSwge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgcmVzcG9uc2U6IGVyclxuICAgICAgfSwgdHJ1ZSApO1xuXG4gICAgICB0aGlzLl9vblBhdGNoRmFpbEFkZGl0aW9uYWwoKTtcblxuICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIHByb3RlY3RlZCBfb25QYXRjaEZhaWxBZGRpdGlvbmFsKCk6IGJvb2xlYW57XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZXQgdXAgdGhlIGJvZHkgb2YgdGhlIGFwaSBwYXRjaFxuICAgKiBAcGFyYW0gdmFsdWVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByb3RlY3RlZCBfZ2V0UGF0Y2hCb2R5KCB2YWx1ZT86IG51bWJlciB8IHN0cmluZyB8IGJvb2xlYW4gfCBudWxsIHwgT2JqZWN0ICk6IEVudGl0eXtcbiAgICBsZXQgYm9keSA9IDxFbnRpdHk+e307XG4gICAgY29uc3QgcGF0Y2ggPSA8RmllbGRJdGVtUGF0Y2hJbnRlcmZhY2U+dGhpcy5jb25maWcucGF0Y2g7XG5cbiAgICB2YWx1ZSA9IHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCcgPyB2YWx1ZSA6IHRoaXMuY29uZmlnLmNvbnRyb2wudmFsdWU7XG5cbiAgICBpZiggSXNPYmplY3QoIHZhbHVlICkgKXtcbiAgICAgIGNvbnN0IHZhbCA9IDx7fT52YWx1ZTtcbiAgICAgIGJvZHkgPSA8RW50aXR5PnsgLi4uYm9keSwgLi4udmFsIH07XG4gICAgfWVsc2UgaWYoIElzQXJyYXkoIHZhbHVlICkgKXtcbiAgICAgIGJvZHlbIHRoaXMuY29uZmlnLnBhdGNoLmZpZWxkIF0gPSB2YWx1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIGJvZHlbIHRoaXMuY29uZmlnLnBhdGNoLmZpZWxkIF0gPSB2YWx1ZTtcbiAgICAgIGlmKCB0aGlzLmNvbmZpZy5lbXB0eSAmJiAhYm9keVsgdGhpcy5jb25maWcucGF0Y2guZmllbGQgXSApe1xuICAgICAgICBib2R5WyB0aGlzLmNvbmZpZy5wYXRjaC5maWVsZCBdID0gUG9wVHJhbnNmb3JtKCBTdHJpbmcoIHZhbHVlICksIHRoaXMuY29uZmlnLmVtcHR5ICk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmKCB0aGlzLmNvbmZpZy5wYXRjaC5qc29uICkgYm9keVsgdGhpcy5jb25maWcucGF0Y2guZmllbGQgXSA9IEpTT04uc3RyaW5naWZ5KCBib2R5WyB0aGlzLmNvbmZpZy5wYXRjaC5maWVsZCBdICk7XG5cbiAgICBpZiggcGF0Y2ggJiYgcGF0Y2gubWV0YWRhdGEgKXtcbiAgICAgIGZvciggY29uc3QgaSBpbiBwYXRjaC5tZXRhZGF0YSApe1xuICAgICAgICBpZiggIXBhdGNoLm1ldGFkYXRhLmhhc093blByb3BlcnR5KCBpICkgKSBjb250aW51ZTtcbiAgICAgICAgYm9keVsgaSBdID0gcGF0Y2gubWV0YWRhdGFbIGkgXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJvZHk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBIZWxwZXIgdG8gc2V0IGVycm9yIG1lc3NhZ2VcbiAgICogQHBhcmFtIG1lc3NhZ2VcbiAgICovXG4gIHByb3RlY3RlZCBfc2V0TWVzc2FnZSggbWVzc2FnZTogc3RyaW5nICk6IHZvaWR7XG4gICAgdGhpcy5jb25maWcubWVzc2FnZSA9IG1lc3NhZ2U7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBIZWxwZXIgdG8gY2xlYXIgZXJyb3IgbWVzc2FnZVxuICAgKi9cbiAgcHJvdGVjdGVkIF9jbGVhck1lc3NhZ2UoKTogdm9pZHtcbiAgICB0aGlzLmNvbmZpZy5tZXNzYWdlID0gJyc7XG4gIH1cblxuXG4gIHByb3RlY3RlZCBfY2hlY2tQcmV2ZW50KCl7XG4gICAgaWYoIElzQXJyYXkoIHRoaXMuY29uZmlnLnByZXZlbnQsIHRydWUgKSApe1xuICAgICAgY29uc3QgY29udHJvbCA9IDxGb3JtQ29udHJvbD50aGlzLmNvbmZpZy5jb250cm9sO1xuICAgICAgY29uc3QgdmFsdWUgPSBjb250cm9sLnZhbHVlO1xuICAgICAgY29uc3QgY29uZmxpY3RzID0gdGhpcy5jb25maWcucHJldmVudC5maWx0ZXIoICggc3RyICkgPT4gc3RyLnRvTG93ZXJDYXNlKCkgPT09IFN0cmluZyggdmFsdWUgKS50b0xvd2VyQ2FzZSgpICk7XG4gICAgICBpZiggY29uZmxpY3RzLmxlbmd0aCApe1xuICAgICAgICBjb250cm9sLnNldEVycm9ycyggeyB1bmlxdWU6IHRydWUgfSApO1xuICAgICAgICB0aGlzLl9zZXRNZXNzYWdlKCBWYWxpZGF0aW9uRXJyb3JNZXNzYWdlcyggY29udHJvbC5lcnJvcnMgKSApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5fY2xlYXJNZXNzYWdlKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG59XG4iXX0=