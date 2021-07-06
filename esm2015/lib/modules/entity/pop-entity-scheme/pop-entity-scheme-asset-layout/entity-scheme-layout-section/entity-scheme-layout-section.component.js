import { __awaiter } from "tslib";
import { Component, ElementRef, Input } from '@angular/core';
import { PopEntitySchemeService } from '../../pop-entity-scheme.service';
import { PopExtendComponent } from '../../../../../pop-extend.component';
import { PopDomService } from '../../../../../services/pop-dom.service';
import { fadeInOut, slideInOut } from '../../../../../pop-common-animations.model';
import { IsObjectThrowError } from '../../../../../pop-common-utility';
import { InputConfig } from '../../../../base/pop-field-item/pop-input/input-config.model';
export class EntitySchemeLayoutSectionComponent extends PopExtendComponent {
    /**
     * @param el
     * @param _domRepo - transfer
     * @param _schemeRepo - transfer
     */
    constructor(el, _domRepo, _schemeRepo) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this._schemeRepo = _schemeRepo;
        this.section = {};
        this.name = 'EntitySchemeLayoutSectionComponent';
        this.srv = {
            scheme: undefined
        };
        this.ui = {
            header: undefined,
            primaryIds: []
        };
        this.dom.session.expanded = {};
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                // #1: Enforce a CoreConfig
                this.core = IsObjectThrowError(this.core, true, `${this.name}:configureDom: - this.core`) ? this.core : null;
                this.id = this.section.position;
                this.ui.primaryIds = this.srv.scheme.ui.primaryIds;
                this._buildHeader();
                yield this.dom.setWithComponentInnerHeight('PopEntityTabColumnComponent', this.section.position, 75, 700);
                return resolve(true);
            }));
        };
    }
    /**
     * The purpose of this component is to manage a specific section of the scheme layout
     * A user should be able to drag as sort assets, and apply custom settings to an asset
     * An asset is basically refers to something that the user can position in the scheme layout, field, component, etc
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * A user can dragSort assets from one column to another in the scheme layout
     * @param event
     */
    onAssetSortDrop(event) {
        this.srv.scheme.onAssetSortDrop(event);
    }
    /**
     * A user can click on an edit button an edit the config settings of an asset
     * @param asset
     */
    onEditAsset(asset) {
        this.dom.setTimeout('edit-asset', () => __awaiter(this, void 0, void 0, function* () {
            yield this.srv.scheme.onEditAsset(asset);
            if (this.dom.session.expanded[asset.id]) {
                this.onExpandAssetContent(asset);
                this.dom.setTimeout('reset-asset', () => __awaiter(this, void 0, void 0, function* () {
                    this.onExpandAssetContent(asset);
                }), 0);
            }
        }), 0);
    }
    /**z
     * A user can click on a toggle to expand/close the content section of an asset
     * @param asset
     */
    onExpandAssetContent(asset) {
        if (asset.id) {
            this.dom.session.expanded[asset.id] = !this.dom.session.expanded[asset.id];
        }
    }
    /**
     * Triggers when user mouseleaves an asset
     * @param asset
     */
    onHideAssetMenu(asset) {
        asset.menu = false;
    }
    /**
     * Triggers when user mouseenters an asset
     * @param asset
     */
    onShowAssetMenu(asset) {
        if (asset.asset_type != 'table') {
            asset.menu = true;
        }
    }
    /**
     * A user can click a remove button to remove an asset/child from the scheme layout
     * @param position
     * @param asset
     */
    onRemoveChildFromLayout(position, child) {
        // console.log( 'onRemoveChildFromLayout', position, child );
        this.srv.scheme.onRemoveChildFromLayout(position, child).then(() => {
        });
    }
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    _buildHeader() {
        this.ui.header = new InputConfig({
            value: this.section.name,
            label: `Column ${this.section.position}`,
            pattern: 'AlphaNumeric',
            maxlength: 24,
            // hint: true,
            // transformation: 'toTitleCase',
            // hintText: 'This text will appear as a Header',
            patch: {
                field: 'name',
                path: `profile-schemes/${this.section.id}`
            }
        });
    }
}
EntitySchemeLayoutSectionComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-entity-scheme-layout-section',
                template: "<div class=\"entity-scheme-asset-layout-section\" *ngIf=\"dom.state.loaded\">\n  <mat-accordion\n    class=\"entity-scheme-asset-list\"\n    multi=\"true\"\n    [displayMode]=\"'flat'\"\n    [style.height.px]=dom.height.outer>\n    <div class=\"entity-scheme-asset-layout-section-header\">\n      <!--<div>{{section.name}}</div>-->\n      <lib-pop-input [config]=\"ui.header\"></lib-pop-input>\n    </div>\n    <div class=\"entity-scheme-asset-list-content\"\n         cdkDropList\n         id=\"column-{{section.position}}\"\n         [attr.data-position]=section.position\n         [attr.data-start-index]=section.startIndex\n         [attr.data-id]=section.id\n         [cdkDropListData]=\"section.children\"\n         (cdkDropListDropped)=\"onAssetSortDrop($event)\"\n         [cdkDropListEnterPredicate]=\"section.predicate\"\n         [style.height.px]=dom.height.inner>\n      <div class=\"sw-mar-vrt-xs sw-clear\"></div>\n      <div *ngFor=\"let child of section.children\">\n\n        <div class=\"entity-scheme-asset\" *ngIf=\"child.container\">\n          Container\n        </div>\n\n        <div class=\"entity-scheme-asset\" *ngIf=\"!child.container\"\n             [ngClass]=\"{'entity-scheme-asset-field-container': true, 'sw-disabled': child.asset_type === 'table'}\"\n             (mouseenter)=\"onShowAssetMenu(child)\"\n             (mouseleave)=\"onHideAssetMenu(child)\"\n             cdkDrag\n             (cdkDragDrop)=\"onAssetSortDrop($event)\"\n             [cdkDragData]=\"{id: child.id, asset_id: child.asset_id,asset_type: child.asset_type, position: section.position, compact: child.compact}\"\n             cdkDragBoundary=\".entity-scheme-asset-layout-container\">\n          <div class=\"import-flex-row\">\n            <div class=\"import-flex-column-break import-flex-column import-flex-start-center\" [style.maxWidth.px]=\"12\">\n              <i *ngIf=\"child.asset.required\" class=\"sw-pointer entity-scheme-required\" [matTooltip]=\"'required'\">\n                *\n              </i>\n            </div>\n            <div class=\"import-flex-column-break import-flex-column\">\n              <div class=\"entity-scheme-asset-layout-row\">\n                <div class=\"entity-scheme-asset-handle\" [ngClass]=\"{'entity-scheme-asset-handle-disabled': child.asset_type === 'table'}\" cdkDragHandle>\n                  <!--<div>-->\n                    {{child.name}}\n                  <!--</div>-->\n                </div>\n                <div class=\"entity-scheme-asset-menu\" *ngIf=\"!child.menu\" [@fadeInOut]=\"'in'\">\n                  <div class=\"entity-scheme-asset-menu-icon\" *ngIf=\"child.asset.primary\">\n                    <i class=\"material-icons sw-pointer entity-scheme-primary\" [matTooltip]=\"'Primary'\">\n                      star\n                    </i>\n                  </div>\n                </div>\n                <!--<div class=\"entity-scheme-asset-trait-container\">-->\n                  <!--<mat-icon class=\"entity-scheme-asset-trait-icon sw-pointer\" *ngFor=\"let trait of entry.traits\" matTooltip=\"{{trait.label}}\" matTooltipPosition=\"above\">{{trait.icon}}</mat-icon>-->\n                <!--</div>-->\n                <div class=\"entity-scheme-asset-menu\" *ngIf=\"child.menu\" [@fadeInOut]=\"'in'\">\n                  <div class=\"entity-scheme-asset-menu-icon\">\n                    <i class=\"material-icons sw-pointer\"\n                       (click)=\"onEditAsset(child)\">\n                      edit\n                    </i>\n                  </div>\n                  <div class=\"entity-scheme-asset-menu-icon\" *ngIf=\"!child.asset.primary\">\n                    <i class=\"material-icons sw-pointer\"\n                       (click)=\"onRemoveChildFromLayout(section.position, child)\">\n                      clear\n                    </i>\n                  </div>\n\n                </div>\n              </div>\n              <div class=\"entity-scheme-asset-layout-subrow\" [ngSwitch]=\"child.asset_type\">\n                <div *ngSwitchCase=\"'table'\">Default Column</div>\n                <div *ngSwitchCase=\"'field'\">{{child.asset?.fieldgroup?.label}} Field</div>\n                <div *ngSwitchCase=\"'component'\">Component</div>\n              </div>\n            </div>\n\n          </div>\n          <div class=\"entity-scheme-asset-layout-content-row\" *ngIf=\"dom.session.expanded[child.id]\" [ngClass]=\"{'entity-scheme-asset-layout-row-expanded': dom.session.expanded[child.id]}\" [ngSwitch]=\"child.asset_type\">\n            <lib-entity-scheme-table-content *ngSwitchCase=\"'table'\" [core]=\"core\" [config]=\"child\"></lib-entity-scheme-table-content>\n            <lib-entity-scheme-field-content *ngSwitchCase=\"'field'\" [core]=\"core\" [config]=\"child\"></lib-entity-scheme-field-content>\n            <lib-entity-scheme-component-content *ngSwitchCase=\"'component'\" [core]=\"core\" [config]=\"child\"></lib-entity-scheme-component-content>\n          </div>\n          <div class=\"entity-scheme-asset-toggle-row sw-pointer\" *ngIf=\"child.id && child.asset && child.asset.multiple && child.asset.entries && child.asset.entries.length > 1\" (click)=\"onExpandAssetContent(child)\">\n            <div class=\"material-icons sw-pointer\" [ngClass]=\"{'sw-hidden': dom.session.expanded[child.id]}\">\n              expand_more\n            </div>\n            <div class=\"material-icons sw-pointer\" [ngClass]=\"{'sw-hidden': !dom.session.expanded[child.id]}\">\n              expand_less\n            </div>\n          </div>\n\n        </div>\n\n      </div>\n\n    </div>\n  </mat-accordion>\n</div>\n",
                animations: [
                    fadeInOut,
                    slideInOut
                ],
                styles: [".entity-scheme-asset-layout-section-header{height:50px;padding:2px 5px;border-bottom:1px solid var(--border);box-sizing:border-box;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}:host .entity-scheme-asset-layout-section-header ::ng-deep input{font-size:1.2em}:host .entity-scheme-asset-layout-section-header ::ng-deep mat-label{position:relative;top:2px;font-size:1.2em}:host .entity-scheme-asset-layout-section-header ::ng-deep .pop-input-container{margin:0!important;border:0!important}:host .entity-scheme-asset-layout-section-header ::ng-deep .mat-form-field-outline{color:transparent;display:none}"]
            },] }
];
EntitySchemeLayoutSectionComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: PopEntitySchemeService }
];
EntitySchemeLayoutSectionComponent.propDecorators = {
    section: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50aXR5LXNjaGVtZS1sYXlvdXQtc2VjdGlvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1zY2hlbWUvcG9wLWVudGl0eS1zY2hlbWUtYXNzZXQtbGF5b3V0L2VudGl0eS1zY2hlbWUtbGF5b3V0LXNlY3Rpb24vZW50aXR5LXNjaGVtZS1sYXlvdXQtc2VjdGlvbi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBd0MsTUFBTSxlQUFlLENBQUM7QUFDbkcsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFekUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDekUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFDbkYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFFdkUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhEQUE4RCxDQUFDO0FBWTNGLE1BQU0sT0FBTyxrQ0FBbUMsU0FBUSxrQkFBa0I7SUFpQnhFOzs7O09BSUc7SUFDSCxZQUNTLEVBQWMsRUFDWCxRQUF1QixFQUN2QixXQUFtQztRQUU3QyxLQUFLLEVBQUUsQ0FBQztRQUpELE9BQUUsR0FBRixFQUFFLENBQVk7UUFDWCxhQUFRLEdBQVIsUUFBUSxDQUFlO1FBQ3ZCLGdCQUFXLEdBQVgsV0FBVyxDQUF3QjtRQXhCdEMsWUFBTyxHQUFhLEVBQUUsQ0FBQztRQUV6QixTQUFJLEdBQUcsb0NBQW9DLENBQUM7UUFFekMsUUFBRyxHQUVU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WUFDL0IsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7U0FDbkI7SUFDSCxDQUFDO0lBR0Q7Ozs7T0FJRztJQUNILHVCQUF1QixDQUFFLFFBQWdCLEVBQUUsS0FBbUM7UUFDNUUsNkRBQTZEO1FBQzdELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFFLFFBQVEsRUFBRSxLQUFLLENBQUUsQ0FBQyxJQUFJLENBQUUsR0FBRyxFQUFFO1FBQ3RFLENBQUMsQ0FBRSxDQUFDO0lBQ04sQ0FBQztJQUdEOztPQUVHO0lBQ0gsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBR08sWUFBWTtRQUNsQixJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxJQUFJLFdBQVcsQ0FBRTtZQUNoQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJO1lBQ3hCLEtBQUssRUFBRSxVQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQ3hDLE9BQU8sRUFBRSxjQUFjO1lBQ3ZCLFNBQVMsRUFBRSxFQUFFO1lBQ2IsY0FBYztZQUNkLGlDQUFpQztZQUNqQyxpREFBaUQ7WUFDakQsS0FBSyxFQUFFO2dCQUNMLEtBQUssRUFBRSxNQUFNO2dCQUNiLElBQUksRUFBRSxtQkFBbUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUU7YUFDM0M7U0FDRixDQUFFLENBQUM7SUFDTixDQUFDOzs7WUEvSkYsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSxrQ0FBa0M7Z0JBQzVDLDJoTEFBNEQ7Z0JBRTVELFVBQVUsRUFBRTtvQkFDVixTQUFTO29CQUNULFVBQVU7aUJBQ1g7O2FBQ0Y7OztZQW5CbUIsVUFBVTtZQUlyQixhQUFhO1lBSGIsc0JBQXNCOzs7c0JBb0I1QixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQsIFZpZXdFbmNhcHN1bGF0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBQb3BFbnRpdHlTY2hlbWVTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vcG9wLWVudGl0eS1zY2hlbWUuc2VydmljZSc7XG5pbXBvcnQgeyBDZGtEcmFnRHJvcCwgbW92ZUl0ZW1JbkFycmF5LCB0cmFuc2ZlckFycmF5SXRlbSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9kcmFnLWRyb3AnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQgeyBmYWRlSW5PdXQsIHNsaWRlSW5PdXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9wb3AtY29tbW9uLWFuaW1hdGlvbnMubW9kZWwnO1xuaW1wb3J0IHsgSXNPYmplY3RUaHJvd0Vycm9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UgfSBmcm9tICcuLi8uLi9wb3AtZW50aXR5LXNjaGVtZS5tb2RlbCc7XG5pbXBvcnQgeyBJbnB1dENvbmZpZyB9IGZyb20gJy4uLy4uLy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLWlucHV0L2lucHV0LWNvbmZpZy5tb2RlbCc7XG5cblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1lbnRpdHktc2NoZW1lLWxheW91dC1zZWN0aW9uJyxcbiAgdGVtcGxhdGVVcmw6ICcuL2VudGl0eS1zY2hlbWUtbGF5b3V0LXNlY3Rpb24uY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vZW50aXR5LXNjaGVtZS1sYXlvdXQtc2VjdGlvbi5jb21wb25lbnQuc2NzcycgXSxcbiAgYW5pbWF0aW9uczogW1xuICAgIGZhZGVJbk91dCxcbiAgICBzbGlkZUluT3V0XG4gIF0sXG59IClcbmV4cG9ydCBjbGFzcyBFbnRpdHlTY2hlbWVMYXlvdXRTZWN0aW9uQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBzZWN0aW9uOiBhbnkgPSA8YW55Pnt9O1xuXG4gIHB1YmxpYyBuYW1lID0gJ0VudGl0eVNjaGVtZUxheW91dFNlY3Rpb25Db21wb25lbnQnO1xuXG4gIHByb3RlY3RlZCBzcnY6IHtcbiAgICBzY2hlbWU6IFBvcEVudGl0eVNjaGVtZVNlcnZpY2VcbiAgfSA9IHtcbiAgICBzY2hlbWU6IDxQb3BFbnRpdHlTY2hlbWVTZXJ2aWNlPnVuZGVmaW5lZFxuICB9O1xuXG4gIHB1YmxpYyB1aSA9IHtcbiAgICBoZWFkZXI6IDxJbnB1dENvbmZpZz51bmRlZmluZWQsXG4gICAgcHJpbWFyeUlkczogPG51bWJlcltdPltdXG4gIH07XG5cblxuICAvKipcbiAgICogQHBhcmFtIGVsXG4gICAqIEBwYXJhbSBfZG9tUmVwbyAtIHRyYW5zZmVyXG4gICAqIEBwYXJhbSBfc2NoZW1lUmVwbyAtIHRyYW5zZmVyXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIF9kb21SZXBvOiBQb3BEb21TZXJ2aWNlLFxuICAgIHByb3RlY3RlZCBfc2NoZW1lUmVwbzogUG9wRW50aXR5U2NoZW1lU2VydmljZVxuICApe1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmRvbS5zZXNzaW9uLmV4cGFuZGVkID0ge307XG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyggcmVzb2x2ZSApID0+IHtcblxuICAgICAgICAvLyAjMTogRW5mb3JjZSBhIENvcmVDb25maWdcbiAgICAgICAgdGhpcy5jb3JlID0gSXNPYmplY3RUaHJvd0Vycm9yKCB0aGlzLmNvcmUsIHRydWUsIGAke3RoaXMubmFtZX06Y29uZmlndXJlRG9tOiAtIHRoaXMuY29yZWAgKSA/IHRoaXMuY29yZSA6IG51bGw7XG4gICAgICAgIHRoaXMuaWQgPSB0aGlzLnNlY3Rpb24ucG9zaXRpb247XG5cbiAgICAgICAgdGhpcy51aS5wcmltYXJ5SWRzID0gdGhpcy5zcnYuc2NoZW1lLnVpLnByaW1hcnlJZHM7XG5cbiAgICAgICAgdGhpcy5fYnVpbGRIZWFkZXIoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5kb20uc2V0V2l0aENvbXBvbmVudElubmVySGVpZ2h0KCAnUG9wRW50aXR5VGFiQ29sdW1uQ29tcG9uZW50JywgdGhpcy5zZWN0aW9uLnBvc2l0aW9uLCA3NSwgNzAwICk7XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgIH0gKTtcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIHB1cnBvc2Ugb2YgdGhpcyBjb21wb25lbnQgaXMgdG8gbWFuYWdlIGEgc3BlY2lmaWMgc2VjdGlvbiBvZiB0aGUgc2NoZW1lIGxheW91dFxuICAgKiBBIHVzZXIgc2hvdWxkIGJlIGFibGUgdG8gZHJhZyBhcyBzb3J0IGFzc2V0cywgYW5kIGFwcGx5IGN1c3RvbSBzZXR0aW5ncyB0byBhbiBhc3NldFxuICAgKiBBbiBhc3NldCBpcyBiYXNpY2FsbHkgcmVmZXJzIHRvIHNvbWV0aGluZyB0aGF0IHRoZSB1c2VyIGNhbiBwb3NpdGlvbiBpbiB0aGUgc2NoZW1lIGxheW91dCwgZmllbGQsIGNvbXBvbmVudCwgZXRjXG4gICAqL1xuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBIHVzZXIgY2FuIGRyYWdTb3J0IGFzc2V0cyBmcm9tIG9uZSBjb2x1bW4gdG8gYW5vdGhlciBpbiB0aGUgc2NoZW1lIGxheW91dFxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uQXNzZXRTb3J0RHJvcCggZXZlbnQ6IENka0RyYWdEcm9wPHN0cmluZ1tdPiApe1xuICAgIHRoaXMuc3J2LnNjaGVtZS5vbkFzc2V0U29ydERyb3AoIGV2ZW50ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBIHVzZXIgY2FuIGNsaWNrIG9uIGFuIGVkaXQgYnV0dG9uIGFuIGVkaXQgdGhlIGNvbmZpZyBzZXR0aW5ncyBvZiBhbiBhc3NldFxuICAgKiBAcGFyYW0gYXNzZXRcbiAgICovXG4gIG9uRWRpdEFzc2V0KCBhc3NldCApe1xuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoICdlZGl0LWFzc2V0JywgYXN5bmMoKSA9PiB7XG4gICAgICBhd2FpdCB0aGlzLnNydi5zY2hlbWUub25FZGl0QXNzZXQoIGFzc2V0ICk7XG4gICAgICBpZiggdGhpcy5kb20uc2Vzc2lvbi5leHBhbmRlZFsgYXNzZXQuaWQgXSApe1xuICAgICAgICB0aGlzLm9uRXhwYW5kQXNzZXRDb250ZW50KCBhc3NldCApO1xuICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCAncmVzZXQtYXNzZXQnLCBhc3luYygpID0+IHtcbiAgICAgICAgICB0aGlzLm9uRXhwYW5kQXNzZXRDb250ZW50KCBhc3NldCApO1xuICAgICAgICB9LCAwICk7XG4gICAgICB9XG4gICAgfSwgMCApO1xuXG4gIH1cblxuXG4gIC8qKnpcbiAgICogQSB1c2VyIGNhbiBjbGljayBvbiBhIHRvZ2dsZSB0byBleHBhbmQvY2xvc2UgdGhlIGNvbnRlbnQgc2VjdGlvbiBvZiBhbiBhc3NldFxuICAgKiBAcGFyYW0gYXNzZXRcbiAgICovXG4gIG9uRXhwYW5kQXNzZXRDb250ZW50KCBhc3NldDogRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSApe1xuICAgIGlmKCBhc3NldC5pZCApe1xuICAgICAgdGhpcy5kb20uc2Vzc2lvbi5leHBhbmRlZFsgYXNzZXQuaWQgXSA9ICF0aGlzLmRvbS5zZXNzaW9uLmV4cGFuZGVkWyBhc3NldC5pZCBdO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIHdoZW4gdXNlciBtb3VzZWxlYXZlcyBhbiBhc3NldFxuICAgKiBAcGFyYW0gYXNzZXRcbiAgICovXG4gIG9uSGlkZUFzc2V0TWVudSggYXNzZXQ6IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UgKXtcbiAgICBhc3NldC5tZW51ID0gZmFsc2U7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyB3aGVuIHVzZXIgbW91c2VlbnRlcnMgYW4gYXNzZXRcbiAgICogQHBhcmFtIGFzc2V0XG4gICAqL1xuICBvblNob3dBc3NldE1lbnUoIGFzc2V0OiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlICl7XG4gICAgaWYoIGFzc2V0LmFzc2V0X3R5cGUgIT0gJ3RhYmxlJyApe1xuICAgICAgYXNzZXQubWVudSA9IHRydWU7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogQSB1c2VyIGNhbiBjbGljayBhIHJlbW92ZSBidXR0b24gdG8gcmVtb3ZlIGFuIGFzc2V0L2NoaWxkIGZyb20gdGhlIHNjaGVtZSBsYXlvdXRcbiAgICogQHBhcmFtIHBvc2l0aW9uXG4gICAqIEBwYXJhbSBhc3NldFxuICAgKi9cbiAgb25SZW1vdmVDaGlsZEZyb21MYXlvdXQoIHBvc2l0aW9uOiBudW1iZXIsIGNoaWxkOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlICl7XG4gICAgLy8gY29uc29sZS5sb2coICdvblJlbW92ZUNoaWxkRnJvbUxheW91dCcsIHBvc2l0aW9uLCBjaGlsZCApO1xuICAgIHRoaXMuc3J2LnNjaGVtZS5vblJlbW92ZUNoaWxkRnJvbUxheW91dCggcG9zaXRpb24sIGNoaWxkICkudGhlbiggKCkgPT4ge1xuICAgIH0gKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENsZWFuIHVwIHRoZSBkb20gb2YgdGhpcyBjb21wb25lbnRcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfYnVpbGRIZWFkZXIoKXtcbiAgICB0aGlzLnVpLmhlYWRlciA9IG5ldyBJbnB1dENvbmZpZygge1xuICAgICAgdmFsdWU6IHRoaXMuc2VjdGlvbi5uYW1lLFxuICAgICAgbGFiZWw6IGBDb2x1bW4gJHt0aGlzLnNlY3Rpb24ucG9zaXRpb259YCxcbiAgICAgIHBhdHRlcm46ICdBbHBoYU51bWVyaWMnLFxuICAgICAgbWF4bGVuZ3RoOiAyNCxcbiAgICAgIC8vIGhpbnQ6IHRydWUsXG4gICAgICAvLyB0cmFuc2Zvcm1hdGlvbjogJ3RvVGl0bGVDYXNlJyxcbiAgICAgIC8vIGhpbnRUZXh0OiAnVGhpcyB0ZXh0IHdpbGwgYXBwZWFyIGFzIGEgSGVhZGVyJyxcbiAgICAgIHBhdGNoOiB7XG4gICAgICAgIGZpZWxkOiAnbmFtZScsXG4gICAgICAgIHBhdGg6IGBwcm9maWxlLXNjaGVtZXMvJHt0aGlzLnNlY3Rpb24uaWR9YFxuICAgICAgfVxuICAgIH0gKTtcbiAgfVxuXG5cbn1cbiJdfQ==