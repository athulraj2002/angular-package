import { Component, Inject } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PopCommonService } from '../../../../services/pop-common.service';
import { SwitchConfig } from '../../pop-field-item/pop-switch/switch-config.model';
import { PopDisplayService } from '../../../../services/pop-display.service';
import { SelectConfig } from "../../pop-field-item/pop-select/select-config.model";
export class PopTableDialogComponent {
    constructor(tableDialogRef, cs, ds, data) {
        this.tableDialogRef = tableDialogRef;
        this.cs = cs;
        this.ds = ds;
        this.data = data;
        this.dom = {
            state: {},
            asset: {},
            height: {
                outer: null,
                inner: null,
                default: null
            }
        };
        this.options = data.options;
    }
    ngOnInit() {
        this.dom.height.outer = window.innerHeight - 300;
        this.dom.height.inner = this.dom.height.outer - 150;
        this.buildToggles();
        this.buildColumns();
        this.buildLockedColumns();
        this.lockedColumns.control.valueChanges.subscribe((value) => this.updateLockedColumns(value));
    }
    buildLockedColumns() {
        let lockedColumns = 0;
        this.columns.forEach((col, index) => {
            if (col.sticky === true) {
                lockedColumns = ++index;
            }
        });
        this.lockedColumns = new SelectConfig({
            label: 'Locked columns',
            options: {
                values: [
                    { value: 0, name: 'No columns locked' },
                    { value: 1, name: 'Lock first column' },
                    { value: 2, name: 'Lock first 2 columns' },
                    { value: 3, name: 'Lock first 3 columns' },
                ]
            },
            value: lockedColumns
        });
    }
    updateLockedColumns(value) {
        this.clearColSticky();
        if (value > 0) {
            this.updateStickyColumns(value);
        }
    }
    clearColSticky() {
        this.columns.forEach(col => col.sticky = false);
    }
    updateStickyColumns(value) {
        this.columns.forEach((col, index) => {
            if (index < value) {
                col.sticky = true;
            }
        });
    }
    handleInputEvents(event) {
        console.log('event', event);
    }
    buildToggles() {
        this.toggles = {
            allowColumnSearchToggle: new SwitchConfig({
                bubble: true,
                label: 'Column Search',
                value: this.options.currentOptions.searchColumns,
                metadata: { option: 'searchColumns' }
            }),
            allowColumnSortToggle: new SwitchConfig({
                bubble: true,
                label: 'Column Sort',
                value: this.options.currentOptions.sort,
                metadata: { option: 'sort' }
            }),
            allowHeaderStickyToggle: new SwitchConfig({
                bubble: true,
                label: 'Sticky Header',
                value: this.options.currentOptions.headerSticky,
                metadata: { option: 'headerSticky' }
            }),
            allowHeaderDisplayToggle: new SwitchConfig({
                bubble: true,
                label: 'Display Header',
                value: this.options.currentOptions.headerDisplay,
                metadata: { option: 'headerDisplay' }
            }),
            allowPaginatorToggle: new SwitchConfig({
                bubble: true,
                label: 'Pagination',
                value: this.options.currentOptions.paginator,
                metadata: { option: 'paginator' }
            }),
        };
    }
    setAllShow(checked) {
        this.columns.map(c => c.visible = checked);
    }
    buildColumns() {
        // Display column order: Current order of visible items then alphabetized list of non visible items.
        const currentColumns = [];
        const otherColumns = [];
        // Account for current column def set.
        for (const col in this.options.currentOptions.columnDefinitions) {
            this.options.currentOptions.columnDefinitions[col].display = this.ds.set(col, this.options.currentOptions.columnDefinitions[col]);
            if (!this.options.currentOptions.columnDefinitions[col].name)
                this.options.currentOptions.columnDefinitions[col].name = col;
            if (this.options.currentOptions.columnDefinitions[col].visible) {
                currentColumns.push(this.options.currentOptions.columnDefinitions[col]);
            }
            else {
                otherColumns.push(this.options.currentOptions.columnDefinitions[col]);
            }
            // If this column has a checkbox then account for it in the list.
            if (this.options.currentOptions.columnDefinitions[col].checkbox) {
                if (this.options.currentOptions.columnDefinitions[col].checkbox.visible) {
                    currentColumns.push(Object.assign({ name: col + '_checkbox', ref: col, display: this.ds.set(col + '_checkbox') }, this.options.currentOptions.columnDefinitions[col].checkbox));
                }
                else {
                    otherColumns.push(Object.assign({ name: col + '_checkbox', ref: col, display: this.ds.set(col + '_checkbox') }, this.options.currentOptions.columnDefinitions[col].checkbox));
                }
            }
            // Remove from columns so we don't have duplicates.
            if (this.options.columns.indexOf(col) !== -1)
                this.options.columns.splice(this.options.columns.indexOf(col), 1);
        }
        // Account for other columns in the dataset.
        if (!otherColumns.length) {
            for (const col of this.options.columns) {
                otherColumns.push({ name: col, display: this.ds.set(col), visible: false, sticky: false, sort: 0 });
            }
        }
        // Sort current columns by their sort number and sort other columns by their name.
        currentColumns.sort(this.cs.dynamicSort('sort'));
        otherColumns.sort(this.cs.dynamicSort('name'));
        // Update the sort to reflect the new order.
        let order = 0;
        for (const col of currentColumns)
            col.sort = ++order;
        for (const col of otherColumns)
            col.sort = ++order;
        this.columns = [...currentColumns, ...otherColumns];
    }
    handleToggleEvents(event) {
        if (event.name === 'onChange') {
            const option = event.config.metadata.option;
            const value = event.config.control.value;
            this.options.currentOptions[event.config.metadata.option] = event.config.control.value;
            switch (option) {
                case 'headerDisplay':
                    if (!value) {
                        this.options.currentOptions.sort = false;
                        this.toggles.allowColumnSortToggle.switchRef.checked = false;
                        this.toggles.allowColumnSortToggle.control.setValue(false);
                        this.toggles.allowHeaderStickyToggle.switchRef.checked = false;
                        this.toggles.allowHeaderStickyToggle.control.setValue(false);
                        this.options.currentOptions.headerSticky = false;
                        this.toggles.allowColumnSearchToggle.switchRef.checked = false;
                        this.toggles.allowColumnSearchToggle.control.setValue(false);
                        this.options.currentOptions.searchColumns = false;
                    }
                    break;
                default:
                    break;
            }
        }
    }
    onSave() {
        // Set our order to be the same as the index in the array.
        let order = 0;
        for (const col of this.columns)
            col.sort = ++order;
        // Build the column definitions based on user selection.
        const columnDefinitions = {};
        for (const col of this.columns) {
            if (col.ref)
                continue; // Ignore checkboxes for now as they belong under a specific field.
            columnDefinitions[col.name] = {
                display: col.display,
                helper: (col.helper ? col.helper : null),
                icon: (col.icon ? col.icon : null),
                sort: col.sort,
                route: (col.route ? col.route : null),
                sticky: col.sticky,
                visible: col.visible,
            };
        }
        // Account for checkboxes
        for (const col of this.columns) {
            if (!col.ref)
                continue;
            columnDefinitions[col.ref] = Object.assign(Object.assign({}, columnDefinitions[col.ref]), { checkbox: { sort: col.sort, sticky: col.sticky, visible: col.visible } });
        }
        this.options.currentOptions.columnDefinitions = columnDefinitions;
        this.tableDialogRef.close({ type: 'save', options: this.options });
    }
    onResetToDefault() {
        this.tableDialogRef.close({ type: 'reset', options: this.options });
    }
    onCancel() {
        this.tableDialogRef.close({ type: 'cancel', options: this.options });
    }
    drop(event) {
        moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    }
    ngOnDestroy() {
    }
}
PopTableDialogComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-dialog',
                template: "<div>\n  <div>\n    <span class=\"mat-h3\">Settings</span>\n\n    <div class=\"options-container\">\n      <div class=\"options-column\">\n        <div class=\"dialog-option\" *ngIf=\"options.allowHeaderDisplayToggle\">\n          <lib-pop-switch [config]=\"toggles?.allowHeaderDisplayToggle\"\n                          (events)=\"handleToggleEvents($event)\"></lib-pop-switch>\n        </div>\n\n        <div class=\"dialog-option\" *ngIf=\"options.allowColumnSearchToggle && toggles.allowColumnSearchToggle\"\n             [hidden]=\"!this.options.currentOptions.headerDisplay\">\n          <lib-pop-switch [config]=\"toggles?.allowColumnSearchToggle\"\n                          (events)=\"handleToggleEvents($event)\"></lib-pop-switch>\n        </div>\n\n\n        <div class=\"dialog-option\" *ngIf=\"options.allowColumnSortToggle\"\n             [hidden]=\"!this.options.currentOptions.headerDisplay\">\n          <lib-pop-switch [config]=\"toggles.allowColumnSortToggle\"\n                          (events)=\"handleToggleEvents($event)\"></lib-pop-switch>\n        </div>\n\n\n        <div class=\"dialog-option\" *ngIf=\"options.allowHeaderStickyToggle\"\n             [hidden]=\"!this.options.currentOptions.headerDisplay\">\n          <lib-pop-switch [config]=\"toggles.allowHeaderStickyToggle\"\n                          (events)=\"handleToggleEvents($event)\"></lib-pop-switch>\n        </div>\n\n\n      </div>\n      <div style=\"flex: 1 1 auto;\"></div>\n      <div >\n        <div class=\"dialog-option\" style=\"overflow:hidden\">\n          <button class=\"dialog-button\" mat-raised-button (click)=\"onResetToDefault()\" style=\"float: right\">Reset to Default</button>\n        </div>\n        <div  class=\"dialog-option\" style=\"width: 175px;\" *ngIf=\"options.allowColumnStickyToggle\">\n          <lib-pop-select [config]=\"lockedColumns\" (events)=\"handleInputEvents($event)\"></lib-pop-select>\n        </div>\n      </div>\n    </div>\n\n\n    <div class=\"dialog-container\" [style.maxHeight.px]=dom.height.outer>\n      <div class=\"dialog-options\" [style.minHeight.px]=dom.height.inner>\n        <div class=\"dialog-draggable-header\">\n          <div class=\"dialog-draggable-show\">\n            <mat-checkbox (change)=\"setAllShow($event.checked)\" color=\"accent\"></mat-checkbox>\n          </div>\n          <div class=\"dialog-draggable-name\">Column Label</div>\n\n          <!--          <div class=\"dialog-draggable-sticky\">Sticky</div>-->\n          <div class=\"dialog-draggable-handle\"></div>\n        </div>\n\n        <div cdkDropList class=\"dialog-draggable-columns\" [style.maxHeight.px]=dom.height.inner\n             (cdkDropListDropped)=\"drop($event)\">\n          <div class=\"dialog-draggable-column\" *ngFor=\"let col of columns\" cdkDrag cdkDragLockAxis=\"y\"\n               cdkDragBoundary=\".dialog-draggable-columns\">\n            <mat-checkbox class=\"dialog-draggable-show\" [(ngModel)]=\"col.visible\" color=\"accent\"></mat-checkbox>\n            <div class=\"dialog-draggable-name\">{{col.display}}</div>\n\n            <!--            <mat-checkbox class=\"dialog-draggable-sticky\" [(ngModel)]=\"col.sticky\" color=\"accent\" disabled=\"true\"-->\n            <!--                          *ngIf=\"!options.allowColumnStickyToggle\"></mat-checkbox>-->\n            <!--            <mat-checkbox class=\"dialog-draggable-sticky\" [(ngModel)]=\"col.sticky\" color=\"accent\"-->\n            <!--                          *ngIf=\"options.allowColumnStickyToggle\"></mat-checkbox>-->\n            <mat-icon class=\"dialog-draggable-handle\" cdkDragHandle>drag_handle</mat-icon>\n          </div>\n        </div>\n      </div>\n      <!--      <div class=\"dialog-options\" [style.minHeight.px]=dom.height.inner>-->\n      <!--        &lt;!&ndash; Display Header Option &ndash;&gt;-->\n\n\n      <!--        &lt;!&ndash;Paginator Option &ndash;&gt;-->\n      <!--        &lt;!&ndash;<div class=\"pop-table-dialog-option\" *ngIf=\"options.allowPaginatorToggle\">&ndash;&gt;-->\n      <!--        &lt;!&ndash;<lib-pop-switch [config]=\"toggles.allowPaginatorToggle\" (events)=\"handleToggleEvents($event)\"></lib-pop-switch>&ndash;&gt;-->\n      <!--        &lt;!&ndash;</div>&ndash;&gt;-->\n      <!--      </div>-->\n      <!--    </div>-->\n\n    </div>\n    <div class=\"dialog-buttons\">\n      <button class=\"dialog-button\" mat-raised-button (click)=\"onCancel()\">Cancel</button>\n\n      <button class=\"dialog-button\" mat-raised-button (click)=\"onSave()\" color=\"accent\">Save</button>\n    </div>\n\n  </div>\n\n</div>\n",
                styles: [".options-container{display:flex;padding-bottom:var(--gap-m)}.dialog-container{display:flex;flex-direction:row;min-width:800px;min-height:300px;overflow:hidden}.dialog-options{flex:1 1 100%;flex-direction:column;min-height:300px;margin:5px}.dialog-option{margin-top:3px;padding:2px}.dialog-draggable-header{display:flex;flex-direction:row;justify-content:space-between;flex-wrap:nowrap;max-height:20px!important;border:1px solid var(--border);padding:15px 5px!important;align-items:center;background-color:var(--tableheader)}.dialog-draggable-columns{display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden;min-height:300px;max-height:calc(100vh - 300px)}.dialog-draggable-column{display:flex;flex-direction:row;justify-content:space-between;flex-wrap:nowrap;max-height:20px!important;border:1px solid var(--border);padding:15px 5px!important;align-items:center;background-color:var(--bg-3)}.dialog-draggable-name{flex-grow:5;padding-left:10px}.dialog-draggable-show{padding-left:var(--gap-s)}.dialog-draggable-sticky{width:50px}.dialog-draggable-handle{width:25px;text-align:right}.dialog-draggable-handle:hover{cursor:-webkit-grab;cursor:grab}.dialog-draggable-handle:active{cursor:grabbing;cursor:-webkit-grabbing;cursor:-moz-grabbing}.dialog-buttons{display:flex;flex-direction:row;flex-wrap:nowrap;justify-content:flex-end;margin-top:20px}.dialog-button{margin-left:10px}.dialog-cancel{margin-left:-10px;display:flex;flex-grow:2}"]
            },] }
];
PopTableDialogComponent.ctorParameters = () => [
    { type: MatDialogRef },
    { type: PopCommonService },
    { type: PopDisplayService },
    { type: undefined, decorators: [{ type: Inject, args: [MAT_DIALOG_DATA,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXRhYmxlLWRpYWxvZy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC10YWJsZS9wb3AtdGFibGUtZGlhbG9nL3BvcC10YWJsZS1kaWFsb2cuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFvQixNQUFNLGVBQWUsQ0FBQztBQUVuRSxPQUFPLEVBQWMsZUFBZSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFFcEUsT0FBTyxFQUFDLGVBQWUsRUFBRSxZQUFZLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUN2RSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSx5Q0FBeUMsQ0FBQztBQUV6RSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0scURBQXFELENBQUM7QUFFakYsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sMENBQTBDLENBQUM7QUFDM0UsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHFEQUFxRCxDQUFDO0FBaUJqRixNQUFNLE9BQU8sdUJBQXVCO0lBbUJsQyxZQUNVLGNBQXFELEVBQ3JELEVBQW9CLEVBQ3BCLEVBQXFCLEVBQ0csSUFBSTtRQUg1QixtQkFBYyxHQUFkLGNBQWMsQ0FBdUM7UUFDckQsT0FBRSxHQUFGLEVBQUUsQ0FBa0I7UUFDcEIsT0FBRSxHQUFGLEVBQUUsQ0FBbUI7UUFDRyxTQUFJLEdBQUosSUFBSSxDQUFBO1FBZC9CLFFBQUcsR0FBRztZQUNYLEtBQUssRUFBeUMsRUFBRTtZQUNoRCxLQUFLLEVBQXlDLEVBQUU7WUFDaEQsTUFBTSxFQUFzQjtnQkFDMUIsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsT0FBTyxFQUFFLElBQUk7YUFDZDtTQUNGLENBQUM7UUFRQSxJQUFJLENB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SSxDQUFDLE9BQU8sRUFBQyxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVELGdCQUFnQjtRQUNkLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBQyxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVELFFBQVE7UUFDTixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFRCxJQUFJLENBQUMsS0FBNEI7UUFDL0IsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVELFdBQVc7SUFDWCxDQUFDOzs7WUFyUUYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxZQUFZO2dCQUN0Qix5Z0pBQThDOzthQUUvQzs7O1lBdEJ3QixZQUFZO1lBQzdCLGdCQUFnQjtZQUloQixpQkFBaUI7NENBeUNwQixNQUFNLFNBQUMsZUFBZSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBJbmplY3QsIE9uSW5pdCwgT25EZXN0cm95fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtDZGtEcmFnRHJvcCwgbW92ZUl0ZW1JbkFycmF5fSBmcm9tICdAYW5ndWxhci9jZGsvZHJhZy1kcm9wJztcblxuaW1wb3J0IHtNQVRfRElBTE9HX0RBVEEsIE1hdERpYWxvZ1JlZn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGlhbG9nJztcbmltcG9ydCB7UG9wQ29tbW9uU2VydmljZX0gZnJvbSAnLi4vLi4vLi4vLi4vc2VydmljZXMvcG9wLWNvbW1vbi5zZXJ2aWNlJztcbmltcG9ydCB7VGFibGVPcHRpb25zQ29uZmlnfSBmcm9tICcuLi9wb3AtdGFibGUubW9kZWwnO1xuaW1wb3J0IHtTd2l0Y2hDb25maWd9IGZyb20gJy4uLy4uL3BvcC1maWVsZC1pdGVtL3BvcC1zd2l0Y2gvc3dpdGNoLWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQge0RpY3Rpb25hcnksIEZpZWxkSXRlbU9wdGlvbn0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQge1BvcERpc3BsYXlTZXJ2aWNlfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtZGlzcGxheS5zZXJ2aWNlJztcbmltcG9ydCB7U2VsZWN0Q29uZmlnfSBmcm9tIFwiLi4vLi4vcG9wLWZpZWxkLWl0ZW0vcG9wLXNlbGVjdC9zZWxlY3QtY29uZmlnLm1vZGVsXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVG9nZ2xlcyB7XG4gIGFsbG93Q29sdW1uRGlzcGxheVRvZ2dsZT86IFN3aXRjaENvbmZpZztcbiAgYWxsb3dDb2x1bW5TdGlja3lUb2dnbGU/OiBTd2l0Y2hDb25maWc7XG4gIGFsbG93Q29sdW1uU2VhcmNoVG9nZ2xlPzogU3dpdGNoQ29uZmlnO1xuICBhbGxvd0NvbHVtblNvcnRUb2dnbGU/OiBTd2l0Y2hDb25maWc7XG4gIGFsbG93SGVhZGVyU3RpY2t5VG9nZ2xlPzogU3dpdGNoQ29uZmlnO1xuICBhbGxvd0hlYWRlckRpc3BsYXlUb2dnbGU/OiBTd2l0Y2hDb25maWc7XG4gIGFsbG93UGFnaW5hdG9yVG9nZ2xlPzogU3dpdGNoQ29uZmlnO1xufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItZGlhbG9nJyxcbiAgdGVtcGxhdGVVcmw6ICdwb3AtdGFibGUtZGlhbG9nLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJ3BvcC10YWJsZS1kaWFsb2cuY29tcG9uZW50LnNjc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBQb3BUYWJsZURpYWxvZ0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcblxuICBvcHRpb25zOiBUYWJsZU9wdGlvbnNDb25maWc7XG4gIHRvZ2dsZXM6IFRvZ2dsZXM7XG4gIGNvbHVtbnM7XG5cbiAgbG9ja2VkQ29sdW1uczogU2VsZWN0Q29uZmlnO1xuXG5cbiAgcHVibGljIGRvbSA9IHtcbiAgICBzdGF0ZTogPERpY3Rpb25hcnk8c3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbj4+e30sXG4gICAgYXNzZXQ6IDxEaWN0aW9uYXJ5PHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4+Pnt9LFxuICAgIGhlaWdodDogPERpY3Rpb25hcnk8bnVtYmVyPj57XG4gICAgICBvdXRlcjogbnVsbCxcbiAgICAgIGlubmVyOiBudWxsLFxuICAgICAgZGVmYXVsdDogbnVsbFxuICAgIH1cbiAgfTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHRhYmxlRGlhbG9nUmVmOiBNYXREaWFsb2dSZWY8UG9wVGFibGVEaWFsb2dDb21wb25lbnQ+LFxuICAgIHByaXZhdGUgY3M6IFBvcENvbW1vblNlcnZpY2UsXG4gICAgcHJpdmF0ZSBkczogUG9wRGlzcGxheVNlcnZpY2UsXG4gICAgQEluamVjdChNQVRfRElBTE9HX0RBVEEpIHB1YmxpYyBkYXRhXG4gICkge1xuICAgIHRoaXMub3B0aW9ucyA9IGRhdGEub3B0aW9ucztcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuZG9tLmhlaWdodC5vdXRlciA9IHdpbmRvdy5pbm5lckhlaWdodCAtIDMwMDtcbiAgICB0aGlzLmRvbS5oZWlnaHQuaW5uZXIgPSB0aGlzLmRvbS5oZWlnaHQub3V0ZXIgLSAxNTA7XG4gICAgdGhpcy5idWlsZFRvZ2dsZXMoKTtcbiAgICB0aGlzLmJ1aWxkQ29sdW1ucygpO1xuICAgIHRoaXMuYnVpbGRMb2NrZWRDb2x1bW5zKCk7XG5cbiAgICB0aGlzLmxvY2tlZENvbHVtbnMuY29udHJvbC52YWx1ZUNoYW5nZXMuc3Vic2NyaWJlKCh2YWx1ZSkgPT4gdGhpcy51cGRhdGVMb2NrZWRDb2x1bW5zKHZhbHVlKSk7XG5cbiAgfVxuXG4gIGJ1aWxkTG9ja2VkQ29sdW1ucygpe1xuICAgIGxldCBsb2NrZWRDb2x1bW5zID0gMDtcblxuICAgIHRoaXMuY29sdW1ucy5mb3JFYWNoKCAoY29sLCBpbmRleCkgPT57XG4gICAgICBpZihjb2wuc3RpY2t5ID09PSB0cnVlKXtcbiAgICAgICAgbG9ja2VkQ29sdW1ucyA9ICsraW5kZXg7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmxvY2tlZENvbHVtbnMgPSBuZXcgU2VsZWN0Q29uZmlnKHtcbiAgICAgIGxhYmVsOiAnTG9ja2VkIGNvbHVtbnMnLFxuICAgICAgb3B0aW9uczoge1xuICAgICAgICB2YWx1ZXM6IFtcbiAgICAgICAgICB7dmFsdWU6IDAsIG5hbWU6ICdObyBjb2x1bW5zIGxvY2tlZCd9LFxuICAgICAgICAgIHt2YWx1ZTogMSwgbmFtZTogJ0xvY2sgZmlyc3QgY29sdW1uJ30sXG4gICAgICAgICAge3ZhbHVlOiAyLCBuYW1lOiAnTG9jayBmaXJzdCAyIGNvbHVtbnMnfSxcbiAgICAgICAgICB7dmFsdWU6IDMsIG5hbWU6ICdMb2NrIGZpcnN0IDMgY29sdW1ucyd9LFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAgdmFsdWU6IGxvY2tlZENvbHVtbnNcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZUxvY2tlZENvbHVtbnModmFsdWUpIHtcbiAgICB0aGlzLmNsZWFyQ29sU3RpY2t5KCk7XG4gICAgaWYgKHZhbHVlID4gMCkge1xuICAgICAgdGhpcy51cGRhdGVTdGlja3lDb2x1bW5zKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBjbGVhckNvbFN0aWNreSgpIHtcbiAgICB0aGlzLmNvbHVtbnMuZm9yRWFjaChjb2wgPT4gY29sLnN0aWNreSA9IGZhbHNlKTtcbiAgfVxuXG4gIHVwZGF0ZVN0aWNreUNvbHVtbnModmFsdWUpIHtcbiAgICB0aGlzLmNvbHVtbnMuZm9yRWFjaCgoY29sLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKGluZGV4IDwgdmFsdWUpIHtcbiAgICAgICAgY29sLnN0aWNreSA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBoYW5kbGVJbnB1dEV2ZW50cyhldmVudCkge1xuICAgIGNvbnNvbGUubG9nKCdldmVudCcsIGV2ZW50KTtcbiAgfVxuXG4gIGJ1aWxkVG9nZ2xlcygpIHtcbiAgICB0aGlzLnRvZ2dsZXMgPSB7XG4gICAgICBhbGxvd0NvbHVtblNlYXJjaFRvZ2dsZTogbmV3IFN3aXRjaENvbmZpZyh7XG4gICAgICAgIGJ1YmJsZTogdHJ1ZSxcbiAgICAgICAgbGFiZWw6ICdDb2x1bW4gU2VhcmNoJyxcbiAgICAgICAgdmFsdWU6IHRoaXMub3B0aW9ucy5jdXJyZW50T3B0aW9ucy5zZWFyY2hDb2x1bW5zLFxuICAgICAgICBtZXRhZGF0YToge29wdGlvbjogJ3NlYXJjaENvbHVtbnMnfVxuICAgICAgfSksXG4gICAgICBhbGxvd0NvbHVtblNvcnRUb2dnbGU6IG5ldyBTd2l0Y2hDb25maWcoe1xuICAgICAgICBidWJibGU6IHRydWUsXG4gICAgICAgIGxhYmVsOiAnQ29sdW1uIFNvcnQnLFxuICAgICAgICB2YWx1ZTogdGhpcy5vcHRpb25zLmN1cnJlbnRPcHRpb25zLnNvcnQsXG4gICAgICAgIG1ldGFkYXRhOiB7b3B0aW9uOiAnc29ydCd9XG4gICAgICB9KSxcbiAgICAgIGFsbG93SGVhZGVyU3RpY2t5VG9nZ2xlOiBuZXcgU3dpdGNoQ29uZmlnKHtcbiAgICAgICAgYnViYmxlOiB0cnVlLFxuICAgICAgICBsYWJlbDogJ1N0aWNreSBIZWFkZXInLFxuICAgICAgICB2YWx1ZTogdGhpcy5vcHRpb25zLmN1cnJlbnRPcHRpb25zLmhlYWRlclN0aWNreSxcbiAgICAgICAgbWV0YWRhdGE6IHtvcHRpb246ICdoZWFkZXJTdGlja3knfVxuICAgICAgfSksXG4gICAgICBhbGxvd0hlYWRlckRpc3BsYXlUb2dnbGU6IG5ldyBTd2l0Y2hDb25maWcoe1xuICAgICAgICBidWJibGU6IHRydWUsXG4gICAgICAgIGxhYmVsOiAnRGlzcGxheSBIZWFkZXInLFxuICAgICAgICB2YWx1ZTogdGhpcy5vcHRpb25zLmN1cnJlbnRPcHRpb25zLmhlYWRlckRpc3BsYXksXG4gICAgICAgIG1ldGFkYXRhOiB7b3B0aW9uOiAnaGVhZGVyRGlzcGxheSd9XG4gICAgICB9KSxcbiAgICAgIGFsbG93UGFnaW5hdG9yVG9nZ2xlOiBuZXcgU3dpdGNoQ29uZmlnKHtcbiAgICAgICAgYnViYmxlOiB0cnVlLFxuICAgICAgICBsYWJlbDogJ1BhZ2luYXRpb24nLFxuICAgICAgICB2YWx1ZTogdGhpcy5vcHRpb25zLmN1cnJlbnRPcHRpb25zLnBhZ2luYXRvcixcbiAgICAgICAgbWV0YWRhdGE6IHtvcHRpb246ICdwYWdpbmF0b3InfVxuICAgICAgfSksXG4gICAgfTtcbiAgfVxuXG4gIHNldEFsbFNob3coY2hlY2tlZCkge1xuICAgIHRoaXMuY29sdW1ucy5tYXAoYyA9PiBjLnZpc2libGUgPSBjaGVja2VkKTtcbiAgfVxuXG4gIGJ1aWxkQ29sdW1ucygpIHtcbiAgICAvLyBEaXNwbGF5IGNvbHVtbiBvcmRlcjogQ3VycmVudCBvcmRlciBvZiB2aXNpYmxlIGl0ZW1zIHRoZW4gYWxwaGFiZXRpemVkIGxpc3Qgb2Ygbm9uIHZpc2libGUgaXRlbXMuXG4gICAgY29uc3QgY3VycmVudENvbHVtbnMgPSBbXTtcbiAgICBjb25zdCBvdGhlckNvbHVtbnMgPSBbXTtcblxuICAgIC8vIEFjY291bnQgZm9yIGN1cnJlbnQgY29sdW1uIGRlZiBzZXQuXG4gICAgZm9yIChjb25zdCBjb2wgaW4gdGhpcy5vcHRpb25zLmN1cnJlbnRPcHRpb25zLmNvbHVtbkRlZmluaXRpb25zKSB7XG5cbiAgICAgIHRoaXMub3B0aW9ucy5jdXJyZW50T3B0aW9ucy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdLmRpc3BsYXkgPSB0aGlzLmRzLnNldChjb2wsIHRoaXMub3B0aW9ucy5jdXJyZW50T3B0aW9ucy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdKTtcblxuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuY3VycmVudE9wdGlvbnMuY29sdW1uRGVmaW5pdGlvbnNbY29sXS5uYW1lKSB0aGlzLm9wdGlvbnMuY3VycmVudE9wdGlvbnMuY29sdW1uRGVmaW5pdGlvbnNbY29sXS5uYW1lID0gY29sO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmN1cnJlbnRPcHRpb25zLmNvbHVtbkRlZmluaXRpb25zW2NvbF0udmlzaWJsZSkge1xuICAgICAgICBjdXJyZW50Q29sdW1ucy5wdXNoKHRoaXMub3B0aW9ucy5jdXJyZW50T3B0aW9ucy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG90aGVyQ29sdW1ucy5wdXNoKHRoaXMub3B0aW9ucy5jdXJyZW50T3B0aW9ucy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdKTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhpcyBjb2x1bW4gaGFzIGEgY2hlY2tib3ggdGhlbiBhY2NvdW50IGZvciBpdCBpbiB0aGUgbGlzdC5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3VycmVudE9wdGlvbnMuY29sdW1uRGVmaW5pdGlvbnNbY29sXS5jaGVja2JveCkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmN1cnJlbnRPcHRpb25zLmNvbHVtbkRlZmluaXRpb25zW2NvbF0uY2hlY2tib3gudmlzaWJsZSkge1xuICAgICAgICAgIGN1cnJlbnRDb2x1bW5zLnB1c2goe1xuICAgICAgICAgICAgLi4ue25hbWU6IGNvbCArICdfY2hlY2tib3gnLCByZWY6IGNvbCwgZGlzcGxheTogdGhpcy5kcy5zZXQoY29sICsgJ19jaGVja2JveCcpfSxcbiAgICAgICAgICAgIC4uLnRoaXMub3B0aW9ucy5jdXJyZW50T3B0aW9ucy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdLmNoZWNrYm94XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3RoZXJDb2x1bW5zLnB1c2goe1xuICAgICAgICAgICAgLi4ue25hbWU6IGNvbCArICdfY2hlY2tib3gnLCByZWY6IGNvbCwgZGlzcGxheTogdGhpcy5kcy5zZXQoY29sICsgJ19jaGVja2JveCcpfSxcbiAgICAgICAgICAgIC4uLnRoaXMub3B0aW9ucy5jdXJyZW50T3B0aW9ucy5jb2x1bW5EZWZpbml0aW9uc1tjb2xdLmNoZWNrYm94XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUmVtb3ZlIGZyb20gY29sdW1ucyBzbyB3ZSBkb24ndCBoYXZlIGR1cGxpY2F0ZXMuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmNvbHVtbnMuaW5kZXhPZihjb2wpICE9PSAtMSkgdGhpcy5vcHRpb25zLmNvbHVtbnMuc3BsaWNlKHRoaXMub3B0aW9ucy5jb2x1bW5zLmluZGV4T2YoY29sKSwgMSk7XG4gICAgfVxuXG4gICAgLy8gQWNjb3VudCBmb3Igb3RoZXIgY29sdW1ucyBpbiB0aGUgZGF0YXNldC5cbiAgICBpZiAoIW90aGVyQ29sdW1ucy5sZW5ndGgpIHtcbiAgICAgIGZvciAoY29uc3QgY29sIG9mIHRoaXMub3B0aW9ucy5jb2x1bW5zKSB7XG4gICAgICAgIG90aGVyQ29sdW1ucy5wdXNoKHtuYW1lOiBjb2wsIGRpc3BsYXk6IHRoaXMuZHMuc2V0KGNvbCksIHZpc2libGU6IGZhbHNlLCBzdGlja3k6IGZhbHNlLCBzb3J0OiAwfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU29ydCBjdXJyZW50IGNvbHVtbnMgYnkgdGhlaXIgc29ydCBudW1iZXIgYW5kIHNvcnQgb3RoZXIgY29sdW1ucyBieSB0aGVpciBuYW1lLlxuICAgIGN1cnJlbnRDb2x1bW5zLnNvcnQodGhpcy5jcy5keW5hbWljU29ydCgnc29ydCcpKTtcbiAgICBvdGhlckNvbHVtbnMuc29ydCh0aGlzLmNzLmR5bmFtaWNTb3J0KCduYW1lJykpO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBzb3J0IHRvIHJlZmxlY3QgdGhlIG5ldyBvcmRlci5cbiAgICBsZXQgb3JkZXIgPSAwO1xuICAgIGZvciAoY29uc3QgY29sIG9mIGN1cnJlbnRDb2x1bW5zKSBjb2wuc29ydCA9ICsrb3JkZXI7XG4gICAgZm9yIChjb25zdCBjb2wgb2Ygb3RoZXJDb2x1bW5zKSBjb2wuc29ydCA9ICsrb3JkZXI7XG5cbiAgICB0aGlzLmNvbHVtbnMgPSBbLi4uY3VycmVudENvbHVtbnMsIC4uLm90aGVyQ29sdW1uc107XG4gIH1cblxuICBoYW5kbGVUb2dnbGVFdmVudHMoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQubmFtZSA9PT0gJ29uQ2hhbmdlJykge1xuICAgICAgY29uc3Qgb3B0aW9uID0gZXZlbnQuY29uZmlnLm1ldGFkYXRhLm9wdGlvbjtcbiAgICAgIGNvbnN0IHZhbHVlID0gZXZlbnQuY29uZmlnLmNvbnRyb2wudmFsdWU7XG5cbiAgICAgIHRoaXMub3B0aW9ucy5jdXJyZW50T3B0aW9uc1tldmVudC5jb25maWcubWV0YWRhdGEub3B0aW9uXSA9IGV2ZW50LmNvbmZpZy5jb250cm9sLnZhbHVlO1xuICAgICAgc3dpdGNoIChvcHRpb24pIHtcbiAgICAgICAgY2FzZSAnaGVhZGVyRGlzcGxheSc6XG4gICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmN1cnJlbnRPcHRpb25zLnNvcnQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlcy5hbGxvd0NvbHVtblNvcnRUb2dnbGUuc3dpdGNoUmVmLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlcy5hbGxvd0NvbHVtblNvcnRUb2dnbGUuY29udHJvbC5zZXRWYWx1ZShmYWxzZSk7XG5cbiAgICAgICAgICAgIHRoaXMudG9nZ2xlcy5hbGxvd0hlYWRlclN0aWNreVRvZ2dsZS5zd2l0Y2hSZWYuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy50b2dnbGVzLmFsbG93SGVhZGVyU3RpY2t5VG9nZ2xlLmNvbnRyb2wuc2V0VmFsdWUoZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmN1cnJlbnRPcHRpb25zLmhlYWRlclN0aWNreSA9IGZhbHNlO1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZXMuYWxsb3dDb2x1bW5TZWFyY2hUb2dnbGUuc3dpdGNoUmVmLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlcy5hbGxvd0NvbHVtblNlYXJjaFRvZ2dsZS5jb250cm9sLnNldFZhbHVlKGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5jdXJyZW50T3B0aW9ucy5zZWFyY2hDb2x1bW5zID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9uU2F2ZSgpOiB2b2lkIHtcblxuICAgIC8vIFNldCBvdXIgb3JkZXIgdG8gYmUgdGhlIHNhbWUgYXMgdGhlIGluZGV4IGluIHRoZSBhcnJheS5cbiAgICBsZXQgb3JkZXIgPSAwO1xuICAgIGZvciAoY29uc3QgY29sIG9mIHRoaXMuY29sdW1ucykgY29sLnNvcnQgPSArK29yZGVyO1xuXG4gICAgLy8gQnVpbGQgdGhlIGNvbHVtbiBkZWZpbml0aW9ucyBiYXNlZCBvbiB1c2VyIHNlbGVjdGlvbi5cbiAgICBjb25zdCBjb2x1bW5EZWZpbml0aW9ucyA9IHt9O1xuICAgIGZvciAoY29uc3QgY29sIG9mIHRoaXMuY29sdW1ucykge1xuICAgICAgaWYgKGNvbC5yZWYpIGNvbnRpbnVlOyAvLyBJZ25vcmUgY2hlY2tib3hlcyBmb3Igbm93IGFzIHRoZXkgYmVsb25nIHVuZGVyIGEgc3BlY2lmaWMgZmllbGQuXG4gICAgICBjb2x1bW5EZWZpbml0aW9uc1tjb2wubmFtZV0gPSB7XG4gICAgICAgIGRpc3BsYXk6IGNvbC5kaXNwbGF5LFxuICAgICAgICBoZWxwZXI6IChjb2wuaGVscGVyID8gY29sLmhlbHBlciA6IG51bGwpLFxuICAgICAgICBpY29uOiAoY29sLmljb24gPyBjb2wuaWNvbiA6IG51bGwpLFxuICAgICAgICBzb3J0OiBjb2wuc29ydCxcbiAgICAgICAgcm91dGU6IChjb2wucm91dGUgPyBjb2wucm91dGUgOiBudWxsKSxcbiAgICAgICAgc3RpY2t5OiBjb2wuc3RpY2t5LFxuICAgICAgICB2aXNpYmxlOiBjb2wudmlzaWJsZSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gQWNjb3VudCBmb3IgY2hlY2tib3hlc1xuICAgIGZvciAoY29uc3QgY29sIG9mIHRoaXMuY29sdW1ucykge1xuICAgICAgaWYgKCFjb2wucmVmKSBjb250aW51ZTtcbiAgICAgIGNvbHVtbkRlZmluaXRpb25zW2NvbC5yZWZdID0ge1xuICAgICAgICAuLi5jb2x1bW5EZWZpbml0aW9uc1tjb2wucmVmXSxcbiAgICAgICAgLi4ue2NoZWNrYm94OiB7c29ydDogY29sLnNvcnQsIHN0aWNreTogY29sLnN0aWNreSwgdmlzaWJsZTogY29sLnZpc2libGV9fVxuICAgICAgfTtcbiAgICB9XG5cbiAgICB0aGlzLm9wdGlvbnMuY3VycmVudE9wdGlvbnMuY29sdW1uRGVmaW5pdGlvbnMgPSBjb2x1bW5EZWZpbml0aW9ucztcblxuICAgIHRoaXMudGFibGVEaWFsb2dSZWYuY2xvc2Uoe3R5cGU6ICdzYXZlJywgb3B0aW9uczogdGhpcy5vcHRpb25zfSk7XG4gIH1cblxuICBvblJlc2V0VG9EZWZhdWx0KCk6IHZvaWQge1xuICAgIHRoaXMudGFibGVEaWFsb2dSZWYuY2xvc2Uoe3R5cGU6ICdyZXNldCcsIG9wdGlvbnM6IHRoaXMub3B0aW9uc30pO1xuICB9XG5cbiAgb25DYW5jZWwoKTogdm9pZCB7XG4gICAgdGhpcy50YWJsZURpYWxvZ1JlZi5jbG9zZSh7dHlwZTogJ2NhbmNlbCcsIG9wdGlvbnM6IHRoaXMub3B0aW9uc30pO1xuICB9XG5cbiAgZHJvcChldmVudDogQ2RrRHJhZ0Ryb3A8c3RyaW5nW10+KSB7XG4gICAgbW92ZUl0ZW1JbkFycmF5KHRoaXMuY29sdW1ucywgZXZlbnQucHJldmlvdXNJbmRleCwgZXZlbnQuY3VycmVudEluZGV4KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICB9XG5cbn1cbiJdfQ==