import { __awaiter } from "tslib";
import { Component, ElementRef, Input } from '@angular/core';
import { PopExtendComponent } from '../../../../../../pop-extend.component';
import { ArrayMapSetter, DynamicSort, IsArray, IsObject, SnakeToPascal, TitleCase } from '../../../../../../pop-common-utility';
import { PopEntitySchemeService } from '../../../pop-entity-scheme.service';
import { PopFieldEditorService } from '../../../../pop-entity-field-editor/pop-entity-field-editor.service';
export class EntitySchemeFieldContentComponent extends PopExtendComponent {
    /**
     * @param el
     * @param _schemeRepo - transfer
     * @param _fieldRepo - transfer
     */
    constructor(el, _schemeRepo, _fieldRepo) {
        super();
        this.el = el;
        this._schemeRepo = _schemeRepo;
        this._fieldRepo = _fieldRepo;
        this.config = {};
        this.name = 'EntitySchemeFieldContentComponent';
        this.srv = {
            scheme: undefined,
            field: undefined,
        };
        this.asset = {
            field: undefined,
            groupName: undefined,
            mapping: undefined,
            primary: undefined,
            traits: undefined,
            traitMap: {},
            entryTraitMap: {},
        };
        this.ui = {
            entries: [],
            traits: [],
        };
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                yield this._setInitialConfig();
                yield this._setEntryTraitMap();
                yield this._setEntries();
                return resolve(true);
            }));
        };
    }
    /**
     * This component is responsible to render the inner contents of field asset
     * A field asset is custom field that has been created on an entity in the business unit
     */
    ngOnInit() {
        super.ngOnInit();
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
     * Set the initial config of this component
     * @private
     */
    _setInitialConfig() {
        return new Promise((resolve) => {
            this.asset.field = this.config.asset;
            this.asset.groupName = this.config.asset.fieldgroup.name;
            this.asset.mapping = this.srv.scheme.getFieldMapping(+this.config.asset_id);
            this.asset.primary = this.srv.field.getSchemePrimary(this.core.entity);
            this.dom.state.isPrimary = +this.config.asset_id === this.asset.primary[this.asset.groupName];
            this.asset.traits = this.srv.field.getFieldTraits(this.asset.field.fieldgroup.name).sort(DynamicSort('name'));
            this.asset.traitMap = ArrayMapSetter(this.asset.traits, 'name');
            return resolve(true);
        });
    }
    /**
     * Organizes the trait that should be assigned on this field
     * @private
     */
    _setEntryTraitMap() {
        return new Promise((resolve) => {
            this.asset.entryTraitMap = {};
            if (IsArray(this.asset.traits, true) && IsObject(this.asset.mapping.trait_entry, true)) {
                Object.keys(this.asset.mapping.trait_entry).map((traitName) => {
                    const entryId = +this.asset.mapping.trait_entry[traitName];
                    if (+entryId) {
                        if (!(IsArray(this.asset.entryTraitMap[entryId]))) {
                            this.asset.entryTraitMap[entryId] = [];
                        }
                        this.asset.entryTraitMap[entryId].push(traitName);
                    }
                });
            }
            return resolve(true);
        });
    }
    /**
     * Set the entries of this field
     * @private
     */
    _setEntries() {
        return new Promise((resolve) => {
            this.ui.entries = [];
            this.ui.entries.push(...this.asset.field.entries);
            if (IsObject(this.config, ['asset'])) {
                if (IsArray(this.ui.entries, true)) {
                    this.ui.entries.map((entry) => {
                        entry.disabled = IsArray(this.asset.mapping.disabled_entries, true) && this.asset.mapping.disabled_entries.includes(+entry.id);
                        entry.traits = this._getEntryTraits(entry);
                    });
                    this.ui.entries.sort(DynamicSort('sort_order'));
                }
            }
            return resolve(true);
        });
    }
    /**
     * Set the traits that belong to a field entry
     * @param entry
     * @private
     */
    _getEntryTraits(entry) {
        const traits = [];
        if (IsObject(entry, ['id']) && IsArray(this.asset.traits, true) && this.dom.state.isPrimary) {
            if (entry.id in this.asset.entryTraitMap && IsArray(this.asset.entryTraitMap[entry.id], true)) {
                this.asset.entryTraitMap[entry.id].map((traitName) => {
                    if (traitName in this.asset.traitMap) {
                        const trait = this.asset.traits[this.asset.traitMap[traitName]];
                        if (IsObject(trait, ['icon', 'name'])) {
                            if (!trait.label)
                                trait.label = TitleCase(SnakeToPascal(trait.name));
                            traits.push(trait);
                        }
                    }
                });
            }
        }
        return traits;
    }
}
EntitySchemeFieldContentComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-entity-scheme-field-content',
                template: "<div class=\"entity-scheme-asset-item-row\" *ngFor=\"let entry of ui.entries;\" [ngClass]=\"{'sw-disabled': entry.disabled}\">\n  {{entry.name}}\n  <div class=\"entity-scheme-asset-trait-container\">\n    <mat-icon class=\"entity-scheme-asset-trait-icon sw-pointer\" *ngFor=\"let trait of entry.traits\" matTooltip=\"{{trait.label}}\" matTooltipPosition=\"above\">{{trait.icon}}</mat-icon>\n  </div>\n</div>\n",
                styles: [".entity-scheme-asset-item-row{padding-left:var(--gap-m);align-items:center;justify-content:space-between!important}.entity-scheme-asset-trait-container{min-width:20px;padding-top:var(--gap-s);padding-right:var(--gap-xs)}.entity-scheme-asset-trait-icon{font-size:14px}"]
            },] }
];
EntitySchemeFieldContentComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopEntitySchemeService },
    { type: PopFieldEditorService }
];
EntitySchemeFieldContentComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50aXR5LXNjaGVtZS1maWVsZC1jb250ZW50LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LXNjaGVtZS9wb3AtZW50aXR5LXNjaGVtZS1hc3NldC1sYXlvdXQvZW50aXR5LXNjaGVtZS1sYXlvdXQtc2VjdGlvbi9lbnRpdHktc2NoZW1lLWZpZWxkLWNvbnRlbnQvZW50aXR5LXNjaGVtZS1maWVsZC1jb250ZW50LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFxQixNQUFNLGVBQWUsQ0FBQztBQUVoRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUM1RSxPQUFPLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNoSSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUM1RSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxxRUFBcUUsQ0FBQztBQVM1RyxNQUFNLE9BQU8saUNBQWtDLFNBQVEsa0JBQWtCO0lBMEJ2RTs7OztPQUlHO0lBQ0gsWUFDUyxFQUFjLEVBQ1gsV0FBbUMsRUFDbkMsVUFBaUM7UUFFM0MsS0FBSyxFQUFFLENBQUM7UUFKRCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ1gsZ0JBQVcsR0FBWCxXQUFXLENBQXdCO1FBQ25DLGVBQVUsR0FBVixVQUFVLENBQXVCO1FBakNwQyxXQUFNLEdBQTZELEVBQUUsQ0FBQztRQUV4RSxTQUFJLEdBQUcsbUNBQW1DLENBQUM7UUFFeEMsUUFBRyxHQUFHO1lBQ2QsTUFBTSxFQUEw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LEVBQUUsSUFBSSxDQUFFLEVBQUU7Z0JBQ2pHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFFLEtBQUssQ0FBQyxFQUFFLENBQUUsQ0FBQyxHQUFHLENBQUUsQ0FBRSxTQUFpQixFQUFHLEVBQUU7b0JBQ2hFLElBQUksU0FBUyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO3dCQUNwQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBRSxTQUFTLENBQUUsQ0FBRSxDQUFDO3dCQUNwRSxJQUFJLFFBQVEsQ0FBRSxLQUFLLEVBQUUsQ0FBRSxNQUFNLEVBQUUsTUFBTSxDQUFFLENBQUUsRUFBRTs0QkFDekMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLO2dDQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFFLGFBQWEsQ0FBRSxLQUFLLENBQUMsSUFBSSxDQUFFLENBQUUsQ0FBQzs0QkFDMUUsTUFBTSxDQUFDLElBQUksQ0FBRSxLQUFLLENBQUUsQ0FBQzt5QkFDdEI7cUJBQ0Y7Z0JBQ0gsQ0FBQyxDQUFFLENBQUM7YUFDTDtTQUNGO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQzs7O1lBdEtGLFNBQVMsU0FBRTtnQkFDVixRQUFRLEVBQUUsaUNBQWlDO2dCQUMzQyxxYUFBMkQ7O2FBRTVEOzs7WUFibUIsVUFBVTtZQUlyQixzQkFBc0I7WUFDdEIscUJBQXFCOzs7cUJBVTNCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSwgUHJvZmlsZVNjaGVtZUZpZWxkSW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vLi4vcG9wLWVudGl0eS1zY2hlbWUubW9kZWwnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHsgQXJyYXlNYXBTZXR0ZXIsIER5bmFtaWNTb3J0LCBJc0FycmF5LCBJc09iamVjdCwgU25ha2VUb1Bhc2NhbCwgVGl0bGVDYXNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7IFBvcEVudGl0eVNjaGVtZVNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi9wb3AtZW50aXR5LXNjaGVtZS5zZXJ2aWNlJztcbmltcG9ydCB7IFBvcEZpZWxkRWRpdG9yU2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1lbnRpdHktZmllbGQtZWRpdG9yL3BvcC1lbnRpdHktZmllbGQtZWRpdG9yLnNlcnZpY2UnO1xuaW1wb3J0IHsgRGljdGlvbmFyeSwgRmllbGRDdXN0b21TZXR0aW5nSW50ZXJmYWNlLCBGaWVsZEVudHJ5LCBGaWVsZEludGVyZmFjZSwgS2V5TWFwIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5cblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1lbnRpdHktc2NoZW1lLWZpZWxkLWNvbnRlbnQnLFxuICB0ZW1wbGF0ZVVybDogJy4vZW50aXR5LXNjaGVtZS1maWVsZC1jb250ZW50LmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbICcuL2VudGl0eS1zY2hlbWUtZmllbGQtY29udGVudC5jb21wb25lbnQuc2NzcycgXVxufSApXG5leHBvcnQgY2xhc3MgRW50aXR5U2NoZW1lRmllbGRDb250ZW50Q29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBjb25maWc6IFByb2ZpbGVTY2hlbWVGaWVsZEludGVyZmFjZSA9IDxQcm9maWxlU2NoZW1lRmllbGRJbnRlcmZhY2U+e307XG5cbiAgcHVibGljIG5hbWUgPSAnRW50aXR5U2NoZW1lRmllbGRDb250ZW50Q29tcG9uZW50JztcblxuICBwcm90ZWN0ZWQgc3J2ID0ge1xuICAgIHNjaGVtZTogPFBvcEVudGl0eVNjaGVtZVNlcnZpY2U+dW5kZWZpbmVkLFxuICAgIGZpZWxkOiA8UG9wRmllbGRFZGl0b3JTZXJ2aWNlPnVuZGVmaW5lZCxcbiAgfTtcblxuICBwcm90ZWN0ZWQgYXNzZXQgPSB7XG4gICAgZmllbGQ6IDxGaWVsZEludGVyZmFjZT51bmRlZmluZWQsXG4gICAgZ3JvdXBOYW1lOiA8c3RyaW5nPnVuZGVmaW5lZCxcbiAgICBtYXBwaW5nOiA8YW55PnVuZGVmaW5lZCxcbiAgICBwcmltYXJ5OiA8YW55PnVuZGVmaW5lZCxcbiAgICB0cmFpdHM6IDxGaWVsZEN1c3RvbVNldHRpbmdJbnRlcmZhY2VbXT51bmRlZmluZWQsXG4gICAgdHJhaXRNYXA6IDxEaWN0aW9uYXJ5PG51bWJlcj4+e30sXG4gICAgZW50cnlUcmFpdE1hcDogPEtleU1hcDxzdHJpbmdbXT4+e30sXG4gIH07XG5cbiAgcHVibGljIHVpID0ge1xuICAgIGVudHJpZXM6IDxGaWVsZEVudHJ5W10+W10sXG4gICAgdHJhaXRzOiA8RmllbGRDdXN0b21TZXR0aW5nSW50ZXJmYWNlW10+W10sXG4gIH07XG5cblxuICAvKipcbiAgICogQHBhcmFtIGVsXG4gICAqIEBwYXJhbSBfc2NoZW1lUmVwbyAtIHRyYW5zZmVyXG4gICAqIEBwYXJhbSBfZmllbGRSZXBvIC0gdHJhbnNmZXJcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgX3NjaGVtZVJlcG86IFBvcEVudGl0eVNjaGVtZVNlcnZpY2UsXG4gICAgcHJvdGVjdGVkIF9maWVsZFJlcG86IFBvcEZpZWxkRWRpdG9yU2VydmljZVxuICApe1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyggcmVzb2x2ZSApID0+IHtcblxuICAgICAgICBhd2FpdCB0aGlzLl9zZXRJbml0aWFsQ29uZmlnKCk7XG4gICAgICAgIGF3YWl0IHRoaXMuX3NldEVudHJ5VHJhaXRNYXAoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5fc2V0RW50cmllcygpO1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IGlzIHJlc3BvbnNpYmxlIHRvIHJlbmRlciB0aGUgaW5uZXIgY29udGVudHMgb2YgZmllbGQgYXNzZXRcbiAgICogQSBmaWVsZCBhc3NldCBpcyBjdXN0b20gZmllbGQgdGhhdCBoYXMgYmVlbiBjcmVhdGVkIG9uIGFuIGVudGl0eSBpbiB0aGUgYnVzaW5lc3MgdW5pdFxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogQ2xlYW4gdXAgdGhlIGRvbSBvZiB0aGlzIGNvbXBvbmVudFxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVuZGVyIFRoZSBIb29kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJpdmF0ZSBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAvKipcbiAgICogU2V0IHRoZSBpbml0aWFsIGNvbmZpZyBvZiB0aGlzIGNvbXBvbmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0SW5pdGlhbENvbmZpZygpOiBQcm9taXNlPGJvb2xlYW4+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlICkgPT4ge1xuXG4gICAgICB0aGlzLmFzc2V0LmZpZWxkID0gdGhpcy5jb25maWcuYXNzZXQ7XG4gICAgICB0aGlzLmFzc2V0Lmdyb3VwTmFtZSA9IHRoaXMuY29uZmlnLmFzc2V0LmZpZWxkZ3JvdXAubmFtZTtcbiAgICAgIHRoaXMuYXNzZXQubWFwcGluZyA9IHRoaXMuc3J2LnNjaGVtZS5nZXRGaWVsZE1hcHBpbmcoICt0aGlzLmNvbmZpZy5hc3NldF9pZCApO1xuICAgICAgdGhpcy5hc3NldC5wcmltYXJ5ID0gdGhpcy5zcnYuZmllbGQuZ2V0U2NoZW1lUHJpbWFyeSggPEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2U+dGhpcy5jb3JlLmVudGl0eSApO1xuICAgICAgdGhpcy5kb20uc3RhdGUuaXNQcmltYXJ5ID0gK3RoaXMuY29uZmlnLmFzc2V0X2lkID09PSB0aGlzLmFzc2V0LnByaW1hcnlbIHRoaXMuYXNzZXQuZ3JvdXBOYW1lIF07XG4gICAgICB0aGlzLmFzc2V0LnRyYWl0cyA9IHRoaXMuc3J2LmZpZWxkLmdldEZpZWxkVHJhaXRzKCB0aGlzLmFzc2V0LmZpZWxkLmZpZWxkZ3JvdXAubmFtZSApLnNvcnQoIER5bmFtaWNTb3J0KCAnbmFtZScgKSApO1xuICAgICAgdGhpcy5hc3NldC50cmFpdE1hcCA9IEFycmF5TWFwU2V0dGVyKCB0aGlzLmFzc2V0LnRyYWl0cywgJ25hbWUnICk7XG5cbiAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgfSApO1xuICB9XG5cblxuICAvKipcbiAgICogT3JnYW5pemVzIHRoZSB0cmFpdCB0aGF0IHNob3VsZCBiZSBhc3NpZ25lZCBvbiB0aGlzIGZpZWxkXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9zZXRFbnRyeVRyYWl0TWFwKCk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUgKSA9PiB7XG4gICAgICB0aGlzLmFzc2V0LmVudHJ5VHJhaXRNYXAgPSB7fTtcbiAgICAgIGlmKCBJc0FycmF5KCB0aGlzLmFzc2V0LnRyYWl0cywgdHJ1ZSApICYmIElzT2JqZWN0KCB0aGlzLmFzc2V0Lm1hcHBpbmcudHJhaXRfZW50cnksIHRydWUgKSApe1xuICAgICAgICBPYmplY3Qua2V5cyggdGhpcy5hc3NldC5tYXBwaW5nLnRyYWl0X2VudHJ5ICkubWFwKCAoIHRyYWl0TmFtZTogc3RyaW5nICkgPT4ge1xuICAgICAgICAgIGNvbnN0IGVudHJ5SWQgPSArdGhpcy5hc3NldC5tYXBwaW5nLnRyYWl0X2VudHJ5WyB0cmFpdE5hbWUgXTtcbiAgICAgICAgICBpZiggK2VudHJ5SWQgKXtcbiAgICAgICAgICAgIGlmKCAhKCBJc0FycmF5KCB0aGlzLmFzc2V0LmVudHJ5VHJhaXRNYXBbIGVudHJ5SWQgXSApICkgKXtcbiAgICAgICAgICAgICAgdGhpcy5hc3NldC5lbnRyeVRyYWl0TWFwWyBlbnRyeUlkIF0gPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYXNzZXQuZW50cnlUcmFpdE1hcFsgZW50cnlJZCBdLnB1c2goIHRyYWl0TmFtZSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGVudHJpZXMgb2YgdGhpcyBmaWVsZFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0RW50cmllcygpOiBQcm9taXNlPGJvb2xlYW4+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlICkgPT4ge1xuICAgICAgdGhpcy51aS5lbnRyaWVzID0gW107XG4gICAgICB0aGlzLnVpLmVudHJpZXMucHVzaCggLi4udGhpcy5hc3NldC5maWVsZC5lbnRyaWVzICk7XG4gICAgICBpZiggSXNPYmplY3QoIHRoaXMuY29uZmlnLCBbICdhc3NldCcgXSApICl7XG4gICAgICAgIGlmKCBJc0FycmF5KCB0aGlzLnVpLmVudHJpZXMsIHRydWUgKSApe1xuICAgICAgICAgIHRoaXMudWkuZW50cmllcy5tYXAoICggZW50cnk6RmllbGRFbnRyeSApID0+IHtcbiAgICAgICAgICAgIGVudHJ5LmRpc2FibGVkID0gSXNBcnJheSggdGhpcy5hc3NldC5tYXBwaW5nLmRpc2FibGVkX2VudHJpZXMsIHRydWUgKSAmJiB0aGlzLmFzc2V0Lm1hcHBpbmcuZGlzYWJsZWRfZW50cmllcy5pbmNsdWRlcyggK2VudHJ5LmlkICk7XG4gICAgICAgICAgICBlbnRyeS50cmFpdHMgPSB0aGlzLl9nZXRFbnRyeVRyYWl0cyggZW50cnkgKTtcbiAgICAgICAgICB9ICk7XG4gICAgICAgICAgdGhpcy51aS5lbnRyaWVzLnNvcnQoIER5bmFtaWNTb3J0KCAnc29ydF9vcmRlcicgKSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgIH0gKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdHJhaXRzIHRoYXQgYmVsb25nIHRvIGEgZmllbGQgZW50cnlcbiAgICogQHBhcmFtIGVudHJ5XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9nZXRFbnRyeVRyYWl0cyggZW50cnk6IEZpZWxkRW50cnkgKTogRmllbGRDdXN0b21TZXR0aW5nSW50ZXJmYWNlW117XG4gICAgY29uc3QgdHJhaXRzID0gW107XG4gICAgaWYoIElzT2JqZWN0KCBlbnRyeSwgWyAnaWQnIF0gKSAmJiBJc0FycmF5KCB0aGlzLmFzc2V0LnRyYWl0cywgdHJ1ZSApICYmIHRoaXMuZG9tLnN0YXRlLmlzUHJpbWFyeSApe1xuICAgICAgaWYoIGVudHJ5LmlkIGluIHRoaXMuYXNzZXQuZW50cnlUcmFpdE1hcCAmJiBJc0FycmF5KCB0aGlzLmFzc2V0LmVudHJ5VHJhaXRNYXBbIGVudHJ5LmlkIF0sIHRydWUgKSApe1xuICAgICAgICB0aGlzLmFzc2V0LmVudHJ5VHJhaXRNYXBbIGVudHJ5LmlkIF0ubWFwKCAoIHRyYWl0TmFtZTogc3RyaW5nICkgPT4ge1xuICAgICAgICAgIGlmKCB0cmFpdE5hbWUgaW4gdGhpcy5hc3NldC50cmFpdE1hcCApe1xuICAgICAgICAgICAgY29uc3QgdHJhaXQgPSB0aGlzLmFzc2V0LnRyYWl0c1sgdGhpcy5hc3NldC50cmFpdE1hcFsgdHJhaXROYW1lIF0gXTtcbiAgICAgICAgICAgIGlmKCBJc09iamVjdCggdHJhaXQsIFsgJ2ljb24nLCAnbmFtZScgXSApICl7XG4gICAgICAgICAgICAgIGlmKCAhdHJhaXQubGFiZWwgKSB0cmFpdC5sYWJlbCA9IFRpdGxlQ2FzZSggU25ha2VUb1Bhc2NhbCggdHJhaXQubmFtZSApICk7XG4gICAgICAgICAgICAgIHRyYWl0cy5wdXNoKCB0cmFpdCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cmFpdHM7XG4gIH1cbn1cbiJdfQ==