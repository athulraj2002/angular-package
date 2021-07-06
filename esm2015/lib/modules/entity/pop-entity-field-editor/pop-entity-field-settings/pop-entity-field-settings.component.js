import { Component, ElementRef, Input } from '@angular/core';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopFieldEditorService } from '../pop-entity-field-editor.service';
import { IsObject, IsObjectThrowError, StorageGetter } from '../../../../pop-common-utility';
export class PopEntityFieldSettingsComponent extends PopExtendComponent {
    /**
     * @param el
     * @param _domRepo - transfer
     * @param _fieldRepo - transfer
     */
    constructor(el, _domRepo, _fieldRepo) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this._fieldRepo = _fieldRepo;
        this.name = 'PopEntityFieldSettingsComponent';
        this.srv = {
            field: undefined,
        };
        this.asset = {
            schemeFieldSetting: {},
        };
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.core = IsObjectThrowError(this.core, true, `${this.name}:configure: - this.core`) ? this.core : null;
                this.field = this.core.entity;
                if (StorageGetter(this.dom, ['repo', 'position', String(this.position), 'height'], false)) {
                    this.dom.overhead = 60;
                    this.dom.height.outer = +this.dom.repo.position[this.position].height - 300;
                    this.dom.setHeight(this.dom.repo.asset[this.dom.height.outer], this.dom.overhead);
                }
                if (IsObject(this.scheme)) {
                    this.asset.schemeFieldSetting = this.srv.field.getSchemeFieldSetting(this.scheme, +this.field.id);
                    //           console.log( 'scheme field', this.asset.schemeFieldSetting );
                }
                this.dom.state.hasScheme = IsObject(this.scheme, true) ? true : false;
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
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
PopEntityFieldSettingsComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-field-settings',
                template: "<div class=\"entity-field-editor-header\" *ngIf=\"!this.dom.state.hasScheme\">\n  <div class=\"entity-field-editor-header-section\">\n    <div class=\"sw-label-container-sm\">Field Attributes</div>\n  </div>\n  <div class=\"pop-entity-field-editor-header-section\">\n    <p>Assign field value and attributes for this field.</p>\n  </div>\n</div>\n<div class=\"pop-entity-field-editor-settings-container\">\n  <div #entries class=\"import-flex-row\">\n    <lib-pop-entity-field-entries [core]=\"core\" [field]=\"field\" [scheme]=\"scheme\"></lib-pop-entity-field-entries>\n  </div>\n\n  <mat-divider [style.width.%]=100 [style.marginBottom.px]=15></mat-divider>\n\n  <div class=\"import-flex-row\" [style.maxHeight.px]=\"dom.height.outer\">\n    <div class=\"import-flex-item-md import-flex-grow-md\">\n      <lib-field-builder-items [core]=\"core\" [scheme]=\"scheme\"></lib-field-builder-items>\n    </div>\n    <div class=\"import-flex-item-md import-flex-grow-md\">\n      <lib-field-builder-items-params [core]=core [scheme]=\"scheme\"></lib-field-builder-items-params>\n    </div>\n  </div>\n</div>\n",
                styles: [":host{flex:1;flex-grow:1}.pop-entity-field-editor-settings-container{display:flex;flex-direction:column;border:1px solid var(--border);padding:var(--gap-s) var(--gap-sm) var(--gap-sm) var(--gap-sm);background:var(--bg-3);margin:var(--gap-sm) 0}"]
            },] }
];
PopEntityFieldSettingsComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: PopFieldEditorService }
];
PopEntityFieldSettingsComponent.propDecorators = {
    field: [{ type: Input }],
    scheme: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1maWVsZC1zZXR0aW5ncy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1maWVsZC1lZGl0b3IvcG9wLWVudGl0eS1maWVsZC1zZXR0aW5ncy9wb3AtZW50aXR5LWZpZWxkLXNldHRpbmdzLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQXFCLE1BQU0sZUFBZSxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ3RFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUMzRSxPQUFPLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLGFBQWEsRUFBaUIsTUFBTSxnQ0FBZ0MsQ0FBQztBQVU1RyxNQUFNLE9BQU8sK0JBQWdDLFNBQVEsa0JBQWtCO0lBZXJFOzs7O09BSUc7SUFDSCxZQUNTLEVBQWMsRUFDWCxRQUF1QixFQUN2QixVQUFpQztRQUUzQyxLQUFLLEVBQUUsQ0FBQztRQUpELE9BQUUsR0FBRixFQUFFLENBQVk7UUFDWCxhQUFRLEdBQVIsUUFBUSxDQUFlO1FBQ3ZCLGVBQVUsR0FBVixVQUFVLENBQXVCO1FBcEJ0QyxTQUFJLEdBQUcsaUNBQWlDLENBQUM7UUFHdEMsUUFBRyxHQUFHO1lBQ2QsS0FBSyxFQUF5QixTQUFTO1NBQ3hDLENBQUM7UUFFUSxVQUFLLEdBQUc7WUFDaEIsa0JBQWtCLEVBQW1CLEVBQUU7U0FDeEMsQ0FBQztRQWVBOztXQUVHO1FBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBcUIsRUFBRTtZQUMxQyxPQUFPLElBQUksT0FBTyxDQUFFLENBQUUsT0FBTyxFQUFHLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxJQUFJLEdBQUcsa0JBQWtCLENBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSx5QkFBeUIsQ0FBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQzVHLElBQUksQ0FBQyxLQUFLLEdBQW1CLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUM5QyxJQUFJLGFBQWEsQ0FBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBRSxFQUFFLFFBQVEsQ0FBRSxFQUFFLEtBQUssQ0FBRSxFQUFFO29CQUMvRixJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7b0JBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBRSxJQUFJLENBQUMsUUFBUSxDQUFFLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztvQkFDOUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFFLENBQUM7aUJBQ3ZGO2dCQUNELElBQUksUUFBUSxDQUFFLElBQUksQ0FBQyxNQUFNLENBQUUsRUFBRTtvQkFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUUsQ0FBQztvQkFDOUcsMEVBQTBFO2lCQUNqRTtnQkFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUN4RSxPQUFPLE9BQU8sQ0FBRSxJQUFJLENBQUUsQ0FBQztZQUN6QixDQUFDLENBQUUsQ0FBQztRQUNOLENBQUMsQ0FBQztJQUNKLENBQUM7SUFHRDs7T0FFRztJQUNILFFBQVE7UUFDTixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUdEOztPQUVHO0lBQ0gsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDOzs7WUFwRUYsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSwrQkFBK0I7Z0JBQ3pDLDZsQ0FBeUQ7O2FBRTFEOzs7WUFibUIsVUFBVTtZQUVyQixhQUFhO1lBQ2IscUJBQXFCOzs7b0JBWTNCLEtBQUs7cUJBQ0wsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBQb3BFeHRlbmRDb21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtZXh0ZW5kLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BEb21TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2VydmljZXMvcG9wLWRvbS5zZXJ2aWNlJztcbmltcG9ydCB7IFBvcEZpZWxkRWRpdG9yU2VydmljZSB9IGZyb20gJy4uL3BvcC1lbnRpdHktZmllbGQtZWRpdG9yLnNlcnZpY2UnO1xuaW1wb3J0IHsgSXNPYmplY3QsIElzT2JqZWN0VGhyb3dFcnJvciwgU3RvcmFnZUdldHRlciwgU3RvcmFnZVNldHRlciB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQgeyBEaWN0aW9uYXJ5LCBGaWVsZEludGVyZmFjZSwgUG9wQmFzZUV2ZW50SW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vcG9wLWVudGl0eS1zY2hlbWUvcG9wLWVudGl0eS1zY2hlbWUubW9kZWwnO1xuXG5cbkBDb21wb25lbnQoIHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWVudGl0eS1maWVsZC1zZXR0aW5ncycsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3AtZW50aXR5LWZpZWxkLXNldHRpbmdzLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbICcuL3BvcC1lbnRpdHktZmllbGQtc2V0dGluZ3MuY29tcG9uZW50LnNjc3MnIF0sXG59IClcbmV4cG9ydCBjbGFzcyBQb3BFbnRpdHlGaWVsZFNldHRpbmdzQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBmaWVsZDogRmllbGRJbnRlcmZhY2U7XG4gIEBJbnB1dCgpIHNjaGVtZTogRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZTtcbiAgcHVibGljIG5hbWUgPSAnUG9wRW50aXR5RmllbGRTZXR0aW5nc0NvbXBvbmVudCc7XG5cblxuICBwcm90ZWN0ZWQgc3J2ID0ge1xuICAgIGZpZWxkOiA8UG9wRmllbGRFZGl0b3JTZXJ2aWNlPnVuZGVmaW5lZCxcbiAgfTtcblxuICBwcm90ZWN0ZWQgYXNzZXQgPSB7XG4gICAgc2NoZW1lRmllbGRTZXR0aW5nOiA8RGljdGlvbmFyeTxhbnk+Pnt9LFxuICB9O1xuXG5cbiAgLyoqXG4gICAqIEBwYXJhbSBlbFxuICAgKiBAcGFyYW0gX2RvbVJlcG8gLSB0cmFuc2ZlclxuICAgKiBAcGFyYW0gX2ZpZWxkUmVwbyAtIHRyYW5zZmVyXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIF9kb21SZXBvOiBQb3BEb21TZXJ2aWNlLFxuICAgIHByb3RlY3RlZCBfZmllbGRSZXBvOiBQb3BGaWVsZEVkaXRvclNlcnZpY2UsXG4gICl7XG4gICAgc3VwZXIoKTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgc2hvdWxkIHRyYW5zZm9ybSBhbmQgdmFsaWRhdGUgdGhlIGRhdGEuIFRoZSB2aWV3IHNob3VsZCB0cnkgdG8gb25seSB1c2UgZGF0YSB0aGF0IGlzIHN0b3JlZCBvbiB1aSBzbyB0aGF0IGl0IGlzIG5vdCBkZXBlbmRlbnQgb24gdGhlIHN0cnVjdHVyZSBvZiBkYXRhIHRoYXQgY29tZXMgZnJvbSBvdGhlciBzb3VyY2VzLiBUaGUgdWkgc2hvdWxkIGJlIHRoZSBzb3VyY2Ugb2YgdHJ1dGggaGVyZS5cbiAgICAgKi9cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSApID0+IHtcbiAgICAgICAgdGhpcy5jb3JlID0gSXNPYmplY3RUaHJvd0Vycm9yKCB0aGlzLmNvcmUsIHRydWUsIGAke3RoaXMubmFtZX06Y29uZmlndXJlOiAtIHRoaXMuY29yZWAgKSA/IHRoaXMuY29yZSA6IG51bGw7XG4gICAgICAgIHRoaXMuZmllbGQgPSA8RmllbGRJbnRlcmZhY2U+dGhpcy5jb3JlLmVudGl0eTtcbiAgICAgICAgaWYoIFN0b3JhZ2VHZXR0ZXIoIHRoaXMuZG9tLCBbICdyZXBvJywgJ3Bvc2l0aW9uJywgU3RyaW5nKCB0aGlzLnBvc2l0aW9uICksICdoZWlnaHQnIF0sIGZhbHNlICkgKXtcbiAgICAgICAgICB0aGlzLmRvbS5vdmVyaGVhZCA9IDYwO1xuICAgICAgICAgIHRoaXMuZG9tLmhlaWdodC5vdXRlciA9ICt0aGlzLmRvbS5yZXBvLnBvc2l0aW9uWyB0aGlzLnBvc2l0aW9uIF0uaGVpZ2h0IC0gMzAwO1xuICAgICAgICAgIHRoaXMuZG9tLnNldEhlaWdodCggdGhpcy5kb20ucmVwby5hc3NldFsgdGhpcy5kb20uaGVpZ2h0Lm91dGVyIF0sIHRoaXMuZG9tLm92ZXJoZWFkICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYoIElzT2JqZWN0KCB0aGlzLnNjaGVtZSApICl7XG4gICAgICAgICAgdGhpcy5hc3NldC5zY2hlbWVGaWVsZFNldHRpbmcgPSB0aGlzLnNydi5maWVsZC5nZXRTY2hlbWVGaWVsZFNldHRpbmcoIHRoaXMuc2NoZW1lLCArdGhpcy5maWVsZC5pZCApO1xuLy8gICAgICAgICAgIGNvbnNvbGUubG9nKCAnc2NoZW1lIGZpZWxkJywgdGhpcy5hc3NldC5zY2hlbWVGaWVsZFNldHRpbmcgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRvbS5zdGF0ZS5oYXNTY2hlbWUgPSBJc09iamVjdCggdGhpcy5zY2hlbWUsIHRydWUgKSA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgIH0gKTtcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBjb21wb25lbnQgc2hvdWxkIGhhdmUgYSBzcGVjaWZpYyBwdXJwb3NlXG4gICAqL1xuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgZG9tIGRlc3Ryb3kgZnVuY3Rpb24gbWFuYWdlcyBhbGwgdGhlIGNsZWFuIHVwIHRoYXQgaXMgbmVjZXNzYXJ5IGlmIHN1YnNjcmlwdGlvbnMsIHRpbWVvdXRzLCBldGMgYXJlIHN0b3JlZCBwcm9wZXJseVxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cbn1cbiJdfQ==