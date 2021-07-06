import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { PopContextMenuConfig } from '../../pop-context-menu/pop-context-menu.model';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { fadeInOut } from '../../../../pop-common-animations.model';
import { ParseLinkUrl } from '../../../entity/pop-entity-utility';
import { PopDisplayService } from '../../../../services/pop-display.service';
export class PopTableViewComponent extends PopExtendComponent {
    /**
     * @param el
     * @param _displayRepo
     * @param _domRepo
     */
    constructor(el, _displayRepo, _domRepo) {
        super();
        this.el = el;
        this._displayRepo = _displayRepo;
        this._domRepo = _domRepo;
        this.name = 'PopTableViewComponent';
        this.srv = {
            display: undefined,
        };
        this.ui = {
            helperText: []
        };
        /**
         * Configure the specifics of this component
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this._attachContextMenu();
                // Assign this so it is available inside the filterBarConfig.
                this.config.matData.sort = this.tableSort;
                // Create a container for helper texts
                this.ui.helperText = [];
                // Add to the config so it's available to prepTable.
                this.config.selection = new SelectionModel(true, []);
                this.config.headerSticky = true;
                setTimeout(() => {
                    this.config.matData.sort = this.tableSort;
                    if (this.config.initialSort)
                        this.tableSort.sort({
                            id: this.config.initialSort,
                            start: this.config.initialSortDirection,
                            disableClear: true
                        });
                }, 500);
                resolve(true);
            });
        };
    }
    sortDisplay(col) {
        const isActive = this.tableSort.active === col ? true : false;
        let display = 'arrow_drop_down';
        if (isActive) {
            if (this.tableSort.direction === 'asc') {
                display = 'arrow_drop_up';
            }
        }
        return display;
    }
    // sort(column,direction){
    //   // console.log(this.tableSort);
    //   this.tableSort.direction = direction === 'asc' ? 'desc' : 'asc';
    //   this.tableSort.sort({ id: column, start: direction, disableClear: true });
    // }
    sort(col) {
        const isActive = this.tableSort.active === col ? true : false;
        let direction = 'asc';
        if (isActive) {
            direction = this.tableSort.direction === 'asc' ? 'desc' : 'asc';
        }
        else {
            direction = 'asc';
        }
        this.tableSort.direction = direction === 'asc' ? 'desc' : 'asc';
        this.tableSort.sort({ id: col, start: direction, disableClear: true });
    }
    /**
     * This component is a child component of pop table
     * This component specifically handles the view that renders the data
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * Trigger an event when the user click on a name
     * @param name
     * @param row
     */
    onColumnStandardClick(name, row) {
        this.config.onEvent.next({
            source: this.name,
            type: 'table',
            name: 'columnStandardClick',
            data: {
                name: name,
                row: row
            }
        });
    }
    /**
     * Trigger an event when the user click on a name that is linked to a route
     * @param name
     * @param row
     */
    onColumnRouteClick(name, row) {
        this.config.onEvent.next({
            source: this.name,
            type: 'table',
            name: 'columnRouteClick',
            data: {
                name: name,
                row: row
            }
        });
    }
    /**
     * Create a helper text for a name
     * @param index
     * @param col
     * @param row
     */
    onHelperText(index, col, row) {
        if (!row[col])
            return '';
        let text = this.config.columnConfig.templates[col].helper.text;
        // Check for alias
        if (text.includes('alias:')) {
            const start = text.indexOf('alias:');
            const end = text.indexOf(' ', start) !== -1 ? text.indexOf(' ', start) : text.length;
            const aliasString = text.substring(start, end);
            const aliasArray = aliasString.split(':');
            aliasArray.shift();
            const alias = this.srv.display.alias(aliasArray.shift());
            text = text.replace(aliasString, alias);
        }
        // If no text is wrapped in < > then this is the text we want.
        if (text.indexOf('<') === -1) {
            this.ui.helperText[index] = text;
            return text;
        }
        // Replace any text between < > with the corresponding name data.
        const textArray = text.split('<');
        text = '';
        for (let i = 0; i < textArray.length; i++) {
            if (!textArray[i])
                continue;
            if (textArray[i].indexOf('>') === -1) {
                text += textArray[i];
            }
            else {
                const fieldArray = textArray[i].split('>');
                for (let ii = 0; ii < fieldArray.length; ii++) {
                    if (!fieldArray[ii])
                        continue;
                    if (ii === 0) {
                        text += (row[fieldArray[ii]] ? row[fieldArray[ii]] : '');
                    }
                    else {
                        text += fieldArray[ii];
                    }
                }
            }
        }
        this.ui.helperText[index] = text;
        return text;
    }
    /**
     * Trigger an doAction when a name link is clicked
     * @param name
     * @param row
     */
    onColumnLinkClick(name, row) {
        this.config.onEvent.next({
            source: this.name,
            type: 'table',
            name: 'columnLinkClick',
            data: {
                name: name,
                row: row
            }
        });
    }
    /**
     * Selects all rows if they are not all selected; otherwise clear all row selections.
     */
    onMasterRowToggleClick() {
        if (this.config.selection.hasValue() && !this.isAllRowsSelected()) {
            this.config.selection.clear();
            this.checkbox.checked = false;
        }
        else {
            this.isAllRowsSelected() ? this.config.selection.clear() : this.config.matData.filteredData.forEach(row => this.config.selection.select(row));
            this.config.onEvent.next({
                source: this.name,
                type: 'table',
                name: 'rows_selected',
                data: this.config.selection.selected
            });
        }
    }
    /**
     * This will pass up to the table component
     * @param filter
     * @param col
     */
    onApplySearchValue(filter, col) {
        this.config.onEvent.next({
            source: this.name,
            type: 'table',
            name: 'filter',
            data: {
                filter: filter,
                col: col,
            }
        });
    }
    /**
     * Asks whether the number of selected elements matches the total number of rows.
     */
    isAllRowsSelected() {
        const numSelected = this.config.selection.selected.length;
        const numRows = this.config.matData.filteredData.length;
        return numSelected === numRows;
    }
    /**
     * This will bubble events with the table signature
     * @param name
     * @param event
     */
    onBubbleEvent(name, event) {
        this.config.onEvent.next({
            source: this.name,
            type: 'table',
            name: name,
            data: event
        });
    }
    /**
     * *ngFor track by for columns
     * Prevents columns from re-rendering when the item is the same
     * @param index
     * @param item
     */
    trackColumnByItem(index, item) {
        if (!item)
            return null;
        return item;
    }
    /**
     * *ngFor track by for rows
     * Prevents rows from re-rendering when the item entityId is still the same
     * @param index
     * @param item
     */
    trackRowByItemId(index, item) {
        if (!item)
            return null;
        return item.id;
    }
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    /**
     * This will a build a context-menu that can used when user right clicks a certain element
     */
    _attachContextMenu() {
        this.dom.contextMenu.config = new PopContextMenuConfig();
        //
        this.dom.contextMenu.configure = (name, row, event) => {
            let goToUrl = '';
            let internal_name;
            // check if it is a route, get the url from the route given from name definition
            if (this.config.columnDefinitions[name].route) {
                goToUrl = ParseLinkUrl(this.config.columnDefinitions[name].route, row);
            }
            else if (this.config.route) {
                // else check if a global route exists on the table config. If it does, route to that
                // this will most likely be used to route to an entityId by their entityId
                goToUrl = ParseLinkUrl(this.config.route, row);
            }
            if (this.config.columnDefinitions[name].internal_name) {
                internal_name = this.config.columnDefinitions[name].internal_name;
            }
            else {
                internal_name = row.internal_name ? row.internal_name : this.config.internal_name ? this.config.internal_name : null;
            }
            if (!goToUrl && !internal_name)
                return false;
            // if we haven't returned, prevent the default behavior of the right click.
            event.preventDefault();
            // reset the context menu, and configure it to load at the position clicked.
            this.dom.contextMenu.config.resetOptions();
            if (internal_name) {
                this.dom.contextMenu.config.addPortalOption(internal_name, row.id ? +row.id : +row[internal_name + '_fk']);
            }
            if (goToUrl)
                this.dom.contextMenu.config.addNewTabOption(goToUrl);
            this.dom.contextMenu.config.x = event.clientX;
            this.dom.contextMenu.config.y = event.clientY;
            this.dom.contextMenu.config.toggle.next(true);
        };
        this.dom.setSubscriber('context-menu', this.dom.contextMenu.config.emitter.subscribe((event) => {
            this.config.onEvent.next(event);
        }));
    }
}
PopTableViewComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-table-view',
                template: "<table mat-table  [trackBy]=\"trackRowByItemId\" [dataSource]=\"config.matData\" matSort class=\"table\" full-width>\n\n  <ng-container\n    *ngFor=\"let col of config.columnConfig.visible;\"\n    matColumnDef=\"{{col}}\"\n    [ngSwitch]=\"config.columnConfig.templates[col].template\"\n    sticky=\"{{config.columnConfig.templates[col].sticky === true}}\">\n\n    <!-- DEFAULT -->\n    <div *ngSwitchDefault></div>\n\n    <!-- STANDARD -->\n    <div  *ngSwitchCase=\"'Standard'\">\n      <th *ngIf=\"!config.searchColumns && !config.sort; then HeaderStandard\"></th>\n      <th *ngIf=\"config.searchColumns && !config.sort; then HeaderSearch\"></th>\n      <th *ngIf=\"!config.searchColumns && config.sort; then HeaderSort\"></th>\n      <th *ngIf=\"config.searchColumns && config.sort; then HeaderSortSearch\"></th>\n      <td\n        mat-cell *matCellDef=\"let row;let index = index;\" [ngClass]=\"{'first-row-no-header': index === 0 && !config.headerDisplay}\"\n        (click)=\"( row[col] ? onColumnStandardClick(col, row) : onBubbleEvent('row_clicked', row) )\"\n        (contextmenu)=\"( row[col] ? dom.contextMenu.configure(col, row, $event) : onBubbleEvent('row_right_clicked', row) )\"\n      >{{row[col]}}\n      </td>\n    </div>\n\n    <!-- STANDARD WITH HELPER TEXT -->\n    <div *ngSwitchCase=\"'StandardHelper'\">\n      <th *ngIf=\"!config.searchColumns && !config.sort; then HeaderStandard\"></th>\n      <th *ngIf=\"config.searchColumns && !config.sort; then HeaderSearch\"></th>\n      <th *ngIf=\"!config.searchColumns && config.sort; then HeaderSort\"></th>\n      <th *ngIf=\"config.searchColumns && config.sort; then HeaderSortSearch\"></th>\n      <td\n        (mouseenter)=\"ui.helperText[ii] = '';\"\n        (mouseleave)=\"ui.helperText.splice(ii, 1)\"\n        matTooltip=\"{{ui.helperText[ii] ? ui.helperText[ii] : onHelperText(ii, col, row)}}\"\n        matTooltipPosition=\"{{config.columnConfig.templates[col].helper.position}}\"\n        mat-cell *matCellDef=\"let row; let ii = index\" [ngClass]=\"{'first-row-no-header': ii === 0 && !config.headerDisplay}\"\n        (click)=\"( row[col] ? onColumnStandardClick(col, row) : onBubbleEvent('row_clicked', row) )\"\n        (contextmenu)=\"( row[col] ? dom.contextMenu.configure(col, row, $event) : onBubbleEvent('row_right_clicked', row) )\"\n      >{{row[col]}}\n      </td>\n    </div>\n\n\n    <!-- ROUTE -->\n    <div *ngSwitchCase=\"'Route'\">\n      <th *ngIf=\"!config.searchColumns && !config.sort; then HeaderStandard\"></th>\n      <th *ngIf=\"config.searchColumns && !config.sort; then HeaderSearch\"></th>\n      <th *ngIf=\"!config.searchColumns && config.sort; then HeaderSort\"></th>\n      <th *ngIf=\"config.searchColumns && config.sort; then HeaderSortSearch\"></th>\n      <td [ngClass]=\"row[col] ? 'sw-a' : ''\"\n        mat-cell *matCellDef=\"let row; let index = index\" [ngClass]=\"{'first-row-no-header': index === 0 && !config.headerDisplay}\"\n        (click)=\"( row[col] ? onColumnRouteClick(col, row) : onBubbleEvent('row_clicked', row) )\"\n        (contextmenu)=\"( row[col] ? dom.contextMenu.configure(col, row, $event) : onBubbleEvent('row_right_clicked', row) )\"\n      >{{row[col]}}\n      </td>\n    </div>\n\n\n    <!-- ROUTE WITH HELPER TEXT -->\n    <div *ngSwitchCase=\"'RouteHelper'\">\n      <th *ngIf=\"!config.searchColumns && !config.sort; then HeaderStandard\"></th>\n      <th *ngIf=\"config.searchColumns && !config.sort; then HeaderSearch\"></th>\n      <th *ngIf=\"!config.searchColumns && config.sort; then HeaderSort\"></th>\n      <th *ngIf=\"config.searchColumns && config.sort; then HeaderSortSearch\"></th>\n      <td\n        [ngClass]=\"{'sw-a': row[col],  'first-row-no-header': ii === 0 && !config.headerDisplay}\"\n        (mouseenter)=\"ui.helperText[ii] = ''\"\n        (mouseleave)=\"ui.helperText.splice(ii, 1)\"\n        matTooltip=\"{{ ui.helperText[ii] ? ui.helperText[ii] : onHelperText(ii, col, row)}}\"\n        matTooltipPosition=\"{{config.columnConfig.templates[col].helper.position}}\"\n        mat-cell *matCellDef=\"let row; let ii = index\"\n        (click)=\"( row[col] ? onColumnRouteClick(col, row) : onBubbleEvent('row_clicked', row) )\"\n        (contextmenu)=\"( row[col] ? dom.contextMenu.configure(col, row, $event) : onBubbleEvent('row_right_clicked', row) )\"\n      >{{row[col]}}\n      </td>\n    </div>\n\n\n    <!-- ROUTE WITH ICON -->\n    <div *ngSwitchCase=\"'RouteIcon'\">\n      <th mat-header-cell *matHeaderCellDef>{{config.columnConfig.templates[col].display}}</th>\n      <td\n        class=\"sw-a site-pointer\"\n        mat-cell *matCellDef=\"let row; let index = i\" [ngClass]=\"{'first-row-no-header': index === 0 && !config.headerDisplay}\"\n        (click)=\"onColumnRouteClick(col, row)\"\n        (contextmenu)=\"( row[col] ? dom.contextMenu.configure(col, row, $event) : onBubbleEvent('row_right_clicked', row) )\"\n      >\n        <div [ngSwitch]=\"config.columnConfig.templates[col].icon.type\">\n          <div *ngSwitchCase=\"'IconImg'\">\n            <img src=\"{{config.columnConfig.templates[col].icon.name}}\" alt=\"{{row[col]}}\">\n          </div>\n          <div *ngSwitchCase=\"'IconMat'\">\n            <mat-icon class=\"sw-cursor-pointer\">{{config.columnConfig.templates[col].icon.name}}</mat-icon>\n          </div>\n          <div *ngSwitchCase=\"'IconPop'\">\n            <span class=\"sw-pop-icon\">{{config.columnConfig.templates[col].icon.name}}</span>\n          </div>\n          <div *ngSwitchDefault>{{row[col]}}</div>\n        </div>\n      </td>\n    </div>\n\n\n    <!-- ROUTE WITH ICON AND HELPER TEXT -->\n    <div *ngSwitchCase=\"'RouteIconHelper'\">\n      <th mat-header-cell *matHeaderCellDef>{{config.columnConfig.templates[col].display}}</th>\n      <td\n        class=\"sw-a site-pointer\"\n        (mouseenter)=\"ui.helperText[ii] = '';\"\n        (mouseleave)=\"ui.helperText.splice(ii, 1)\"\n        matTooltip=\"{{ui.helperText[ii] ? ui.helperText[ii] : onHelperText(ii, col, row)}}\"\n        matTooltipPosition=\"{{config.columnConfig.templates[col].helper.position}}\"\n        mat-cell *matCellDef=\"let row; let ii = index\" [ngClass]=\"{'first-row-no-header': ii === 0 && !config.headerDisplay}\"\n        (click)=\"onColumnRouteClick(col, row)\"\n        (contextmenu)=\"( row[col] ? dom.contextMenu.configure(col, row, $event) : onBubbleEvent('row_right_clicked', row) )\"\n      >\n        <div [ngSwitch]=\"config.columnConfig.templates[col].icon.type\">\n          <div *ngSwitchCase=\"'IconImg'\">\n            <img src=\"{{config.columnConfig.templates[col].icon.name}}\" alt=\"{{row[col]}}\">\n          </div>\n          <div *ngSwitchCase=\"'IconMat'\">\n            <mat-icon class=\"sw-cursor-pointer\">{{config.columnConfig.templates[col].icon.name}}</mat-icon>\n          </div>\n          <div *ngSwitchCase=\"'IconPop'\">\n            <span class=\"sw-pop-icon\">{{config.columnConfig.templates[col].icon.name}}</span>\n          </div>\n          <div *ngSwitchDefault>{{row[col]}}</div>\n        </div>\n      </td>\n    </div>\n\n\n    <!-- LINK -->\n    <div *ngSwitchCase=\"'Link'\">\n      <th *ngIf=\"!config.searchColumns && !config.sort; then HeaderStandard\"></th>\n      <th *ngIf=\"config.searchColumns && !config.sort; then HeaderSearch\"></th>\n      <th *ngIf=\"!config.searchColumns && config.sort; then HeaderSort\"></th>\n      <th *ngIf=\"config.searchColumns && config.sort; then HeaderSortSearch\"></th>\n      <td class=\"site-pointer\"\n        [ngClass]=\"row[col] ? 'sw-a' : ''\"\n        mat-cell *matCellDef=\"let row; let index = index\" [ngClass]=\"{'first-row-no-header': index === 0 && !config.headerDisplay}\"\n        (click)=\"( row[col] ? onColumnLinkClick(col, row) : onBubbleEvent('row_clicked', row) )\"\n      >{{row[col]}}\n      </td>\n    </div>\n\n    <!-- LINK WITH HELPER TEXT -->\n    <div *ngSwitchCase=\"'LinkHelper'\">\n      <th *ngIf=\"!config.searchColumns && !config.sort; then HeaderStandard\"></th>\n      <th *ngIf=\"config.searchColumns && !config.sort; then HeaderSearch\"></th>\n      <th *ngIf=\"!config.searchColumns && config.sort; then HeaderSort\"></th>\n      <th *ngIf=\"config.searchColumns && config.sort; then HeaderSortSearch\"></th>\n      <td class=\"site-pointer\"\n        [ngClass]=\"row[col] ? 'sw-a' : ''\"\n        (mouseenter)=\"ui.helperText[ii] = '';\"\n        (mouseleave)=\"ui.helperText.splice(ii, 1)\"\n        matTooltip=\"{{ui.helperText[ii] ? ui.helperText[ii] : onHelperText(ii, col, row)}}\"\n        matTooltipPosition=\"{{config.columnConfig.templates[col].helper.position}}\"\n        mat-cell *matCellDef=\"let row; let ii = index\" [ngClass]=\"{'first-row-no-header': ii === 0 && !config.headerDisplay}\"\n        (click)=\"( row[col] ? onColumnLinkClick(col, row) : onBubbleEvent('row_clicked', row) )\"\n      >{{row[col]}}\n      </td>\n    </div>\n\n    <!-- LINK WITH ICON -->\n    <div *ngSwitchCase=\"'LinkIcon'\">\n      <th mat-header-cell *matHeaderCellDef>{{config.columnConfig.templates[col].display}}</th>\n      <td\n        class=\"sw-a site-pointer\"\n        mat-cell *matCellDef=\"let row; let index = index\" [ngClass]=\"{'first-row-no-header': index === 0 && !config.headerDisplay}\"\n        (click)=\"onColumnLinkClick(col, row)\"\n      >\n        <div [ngSwitch]=\"config.columnConfig.templates[col].icon.type\">\n          <div *ngSwitchCase=\"'IconImg'\">\n            <img src=\"{{config.columnConfig.templates[col].icon.name}}\" alt=\"{{row[col]}}\">\n          </div>\n          <div *ngSwitchCase=\"'IconMat'\">\n            <mat-icon class=\"sw-cursor-pointer\">{{config.columnConfig.templates[col].icon.name}}</mat-icon>\n          </div>\n          <div *ngSwitchCase=\"'IconPop'\">\n            <span class=\"sw-pop-icon\">{{config.columnConfig.templates[col].icon.name}}</span>\n          </div>\n          <div *ngSwitchDefault>{{row[col]}}</div>\n        </div>\n      </td>\n    </div>\n\n    <!-- LINK WITH ICON AND HELPER TEXT -->\n    <div *ngSwitchCase=\"'LinkIconHelper'\">\n      <th mat-header-cell *matHeaderCellDef>{{config.columnConfig.templates[col].display}}</th>\n      <td\n        class=\"sw-a site-pointer\"\n        (mouseenter)=\"ui.helperText[ii] = '';\"\n        (mouseleave)=\"ui.helperText.splice(ii, 1)\"\n        matTooltip=\"{{ui.helperText[ii] ? ui.helperText[ii] : onHelperText(ii, col, row)}}\"\n        matTooltipPosition=\"{{config.columnConfig.templates[col].helper.position}}\"\n        mat-cell *matCellDef=\"let row; let ii = index\" [ngClass]=\"{'first-row-no-header': ii === 0 && !config.headerDisplay}\"\n        (click)=\"onColumnLinkClick(col, row)\"\n      >\n        <div [ngSwitch]=\"config.columnConfig.templates[col].icon.type\">\n          <div *ngSwitchCase=\"'IconImg'\">\n            <img src=\"{{config.columnConfig.templates[col].icon.name}}\" alt=\"{{row[col]}}\">\n          </div>\n          <div *ngSwitchCase=\"'IconMat'\">\n            <mat-icon class=\"sw-cursor-pointer\">{{config.columnConfig.templates[col].icon.name}}</mat-icon>\n          </div>\n          <div *ngSwitchCase=\"'IconPop'\">\n            <span class=\"sw-pop-icon\">{{config.columnConfig.templates[col].icon.name}}</span>\n          </div>\n          <div *ngSwitchDefault>{{row[col]}}</div>\n        </div>\n      </td>\n    </div>\n\n\n    <!-- ICON -->\n    <div *ngSwitchCase=\"'Icon'\">\n      <th mat-header-cell *matHeaderCellDef>{{config.columnConfig.templates[col].display}}</th>\n      <td class=\"site-pointer\"\n        mat-cell *matCellDef=\"let row; let index = index\" [ngClass]=\"{'first-row-no-header': index === 0 && !config.headerDisplay}\"\n        (click)=\"( row[col] ? onColumnStandardClick(col, row) : onBubbleEvent('row_right_clicked', row) )\"\n      >\n        <div [ngSwitch]=\"config.columnConfig.templates[col].icon.type\">\n          <div *ngSwitchCase=\"'IconImg'\">\n            <img src=\"{{config.columnConfig.templates[col].icon.name}}\" alt=\"{{row[col]}}\">\n          </div>\n          <div *ngSwitchCase=\"'IconMat'\">\n            <mat-icon class=\"sw-cursor-pointer\">{{config.columnConfig.templates[col].icon.name}}</mat-icon>\n          </div>\n          <div *ngSwitchCase=\"'IconPop'\">\n            <span class=\"sw-pop-icon\">{{config.columnConfig.templates[col].icon.name}}</span>\n          </div>\n          <div *ngSwitchDefault>{{row[col]}}</div>\n        </div>\n      </td>\n    </div>\n\n\n    <!-- ICON WITH HELPER TEXT -->\n    <div *ngSwitchCase=\"'IconHelper'\">\n      <th mat-header-cell *matHeaderCellDef>{{config.columnConfig.templates[col].display}}</th>\n      <td class=\"site-pointer\"\n        (mouseenter)=\"ui.helperText[ii] = '';\"\n        (mouseleave)=\"ui.helperText.splice(ii, 1)\"\n        matTooltip=\"{{ui.helperText[ii] ? ui.helperText[ii] : onHelperText(ii, col, row)}}\"\n        matTooltipPosition=\"{{config.columnConfig.templates[col].helper.position}}\"\n        mat-cell *matCellDef=\"let row; let ii = index\" [ngClass]=\"{'first-row-no-header': ii === 0 && !config.headerDisplay}\"\n        (click)=\"( row[col] ? onColumnStandardClick(col, row) : onBubbleEvent('row_right_clicked', row) )\"\n      >\n        <div [ngSwitch]=\"config.columnConfig.templates[col].icon.type\">\n          <div *ngSwitchCase=\"'IconImg'\">\n            <img src=\"{{config.columnConfig.templates[col].icon.name}}\" alt=\"{{row[col]}}\">\n          </div>\n          <div *ngSwitchCase=\"'IconMat'\">\n            <mat-icon class=\"sw-cursor-pointer\">{{config.columnConfig.templates[col].icon.name}}</mat-icon>\n          </div>\n          <div *ngSwitchCase=\"'IconPop'\">\n            <span class=\"sw-pop-icon\">{{config.columnConfig.templates[col].icon.name}}</span>\n          </div>\n          <div *ngSwitchDefault>{{row[col]}}</div>\n        </div>\n      </td>\n    </div>\n\n\n    <!-- CHECKBOX -->\n    <div *ngSwitchCase=\"'Checkbox'\">\n      <th mat-header-cell *matHeaderCellDef class=\"checkbox-column\">\n        <mat-checkbox [ngClass]=\"{'column-search-checkbox': config?.searchColumns}\" #checkbox color=\"accent\" (change)=\"$event ? onMasterRowToggleClick() : null\"\n                      [checked]=\"config.selection?.hasValue() && isAllRowsSelected()\"\n                      [indeterminate]=\"config.selection?.hasValue() && !isAllRowsSelected()\">\n        </mat-checkbox>\n      </th>\n      <td mat-cell *matCellDef=\"let row; let i = index\" class=\"checkbox-column\" [ngClass]=\"{'first-row-no-header': i === 0 && !config.headerDisplay}\">\n        <mat-checkbox color=\"accent\" (click)=\"$event.stopPropagation()\"\n                      (change)=\"($event ? config.selection?.toggle(row) : null); onBubbleEvent(($event.checked ? 'row_selected' : 'row_unselected'), row)\"\n                      [checked]=\"config.selection?.isSelected(row)\">\n        </mat-checkbox>\n      </td>\n    </div>\n\n    <!-- HEADER TEMPLATES -->\n    <ng-template #HeaderStandard>\n      <th mat-header-cell *matHeaderCellDef>{{config.columnConfig.templates[col].display}}</th>\n    </ng-template>\n\n    <ng-template #HeaderSort>\n      <th class=\"sortable-header\" mat-header-cell *matHeaderCellDef (click)=\"sort(config.columnConfig?.templates[col].name)\">\n\n\n        <div class=\"column-header-sort\">\n          <div>\n            {{config.columnConfig.templates[col].display}}\n          </div>\n\n          <div >\n            <mat-icon class=\"sort-top-searchable\"\n                      [ngClass]=\"{visible: tableSort.active === config.columnConfig?.templates[col].name, hidden: tableSort.active !== config.columnConfig?.templates[col].name}\"\n\n                      >{{sortDisplay(config.columnConfig?.templates[col].name)}}</mat-icon>\n\n<!--            <mat-icon class=\"sort-top-searchable\"-->\n<!--                      [ngClass]=\"{'sort-selected': tableSort.active === config.columnConfig?.templates[col].name && tableSort.direction === 'asc'}\"-->\n<!--                      (click)=\"sort(config.columnConfig?.templates[col].name, 'asc')\">arrow_drop_up</mat-icon>-->\n<!--            <mat-icon class=\"sort-bottom-searchable\"-->\n<!--                      [ngClass]=\"{'sort-selected': tableSort.active === config.columnConfig?.templates[col].name && tableSort.direction === 'desc'}\"-->\n<!--                      (click)=\"sort(config.columnConfig?.templates[col].name, 'desc')\">arrow_drop_down</mat-icon>-->\n          </div>\n        </div>\n      </th>\n    </ng-template>\n\n    <ng-template #HeaderSearch>\n      <th  mat-header-cell *matHeaderCellDef >\n        <div style=\"padding-top: var(--gap-m)\">{{config.columnConfig?.templates[col].display}}</div>\n\n        <div class=\"column-sort\">\n          <mat-form-field appearance=\"outline\" class=\"sw-search\" style=\"padding-bottom: var(--gap-s)\">\n            <!--          <mat-label><mat-icon>search</mat-icon> </mat-label>-->\n            <!--          <mat-label>{{config.columnConfig.templates[col].display}}</mat-label>-->\n            <!--          <a matPrefix><mat-icon>search</mat-icon></a>-->\n            <input matInput (keyup)=\"onApplySearchValue($event.target.value, col)\" placeholder=\"Search\">\n          </mat-form-field>\n        </div>\n\n      </th>\n    </ng-template>\n\n    <ng-template #HeaderSortSearch>\n      <th class=\"sortable-header\" mat-header-cell *matHeaderCellDef (click)=\"sort(config.columnConfig?.templates[col].name)\">\n        <div class=\"column-header-sort\" style=\"padding-top: var(--gap-m)\">\n          <div>\n            {{config.columnConfig?.templates[col].display}}\n          </div>\n\n          <div >\n            <mat-icon class=\"sort-top-searchable\"\n                      [ngClass]=\"{visible: tableSort.active === config.columnConfig?.templates[col].name, hidden: tableSort.active !== config.columnConfig?.templates[col].name}\"\n\n                      (click)=\"sort(config.columnConfig?.templates[col].name)\">{{sortDisplay(config.columnConfig?.templates[col].name)}}</mat-icon>\n<!--            <mat-icon class=\"sort-top-searchable\"-->\n<!--                      [ngClass]=\"{'sort-selected': tableSort.active === config.columnConfig.templates[col].name && tableSort.direction === 'asc'}\"-->\n<!--                      (click)=\"sort(config.columnConfig?.templates[col].name, 'asc')\">arrow_drop_up</mat-icon>-->\n<!--            <mat-icon class=\"sort-bottom-searchable\"-->\n<!--                      [ngClass]=\"{'sort-selected': tableSort.active === config.columnConfig.templates[col].name && tableSort.direction === 'desc'}\"-->\n<!--                      (click)=\"sort(config.columnConfig?.templates[col].name, 'desc')\">arrow_drop_down</mat-icon>-->\n          </div>\n        </div>\n\n        <div class=\"column-sort\" >\n          <mat-form-field appearance=\"outline\" class=\"sw-search\" style=\"padding-bottom: var(--gap-s)\">\n            <!--          <mat-label><mat-icon>search</mat-icon> </mat-label>-->\n            <!--          <mat-label>{{config.columnConfig.templates[col].display}}</mat-label>-->\n            <!--          <a matPrefix><mat-icon>search</mat-icon></a>-->\n            <input matInput (keyup)=\"onApplySearchValue($event.target.value, col)\" placeholder=\"Search\">\n          </mat-form-field>\n        </div>\n      </th>\n    </ng-template>\n\n  </ng-container>\n\n  <tr [ngClass]=\"{'sw-hidden': !config.headerDisplay}\" mat-header-row\n      *matHeaderRowDef=\"config.columnConfig?.visible; sticky:config.headerSticky\"></tr>\n  <tr mat-row *matRowDef=\"let row; columns: config.columnConfig?.visible;\"></tr>\n  <tr class=\"mat-row\" *matNoDataRow>\n    <td class=\"mat-cell\" colspan=\"12\">No Data Found</td>\n  </tr>\n</table>\n<lib-pop-context-menu *ngIf=\"dom.contextMenu?.config\" [config]=\"dom.contextMenu.config\"></lib-pop-context-menu>\n",
                animations: [
                    fadeInOut,
                ],
                styles: [".sw-a{color:var(--accent)}.mat-sort-header-container{align-items:center;color:red}.column-sort{display:flex;white-space:nowrap}.sticky-row{padding-top:55px}:host ::ng-deep .table{width:100%;overflow-x:auto}:host ::ng-deep .mat-form-field{width:100%}.sort-header{position:relative;top:10px}.sort-bottom,.sort-bottom:hover,.sort-top,.sort-top:hover{position:relative;opacity:.6;cursor:pointer}.sort-bottom,.sort-bottom:hover{top:12px;left:-24px}.sort-bottom:hover,.sort-top:hover{opacity:1;cursor:pointer}.sort-selected{color:var(--primary-foreground);opacity:1}.column-header-sort{display:flex}.column-search-checkbox{position:relative;top:10px}.sort-top-searchable{top:-4px;left:5px}.sort-bottom-searchable,.sort-top-searchable{display:inherit;height:0;position:relative;opacity:.6;cursor:pointer}.sort-bottom-searchable{top:0}.visible{visibility:visible}.hidden{visibility:hidden}.sort-bottom-searchable:hover{opacity:1}.sortable-header{cursor:pointer}.sortable-header:hover .hidden{visibility:visible}.mat-row:hover{background-color:var(--background-main-menu)}"]
            },] }
];
PopTableViewComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDisplayService },
    { type: PopDomService }
];
PopTableViewComponent.propDecorators = {
    config: [{ type: Input }],
    tableSort: [{ type: ViewChild, args: [MatSort, { static: true },] }],
    checkbox: [{ type: ViewChild, args: ['checkbox',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXRhYmxlLXZpZXcuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtdGFibGUvcG9wLXRhYmxlLXZpZXcvcG9wLXRhYmxlLXZpZXcuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBcUIsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXpGLE9BQU8sRUFBQyxPQUFPLEVBQWdCLE1BQU0sd0JBQXdCLENBQUM7QUFDOUQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBRXhELE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLCtDQUErQyxDQUFDO0FBRW5GLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBQ3BFLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxzQ0FBc0MsQ0FBQztBQUNuRSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0seUNBQXlDLENBQUM7QUFDbEUsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLG9DQUFvQyxDQUFDO0FBQ2hFLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLDBDQUEwQyxDQUFDO0FBVzNFLE1BQU0sT0FBTyxxQkFBc0IsU0FBUSxrQkFBa0I7SUFnQjNEOzs7O09BSUc7SUFDSCxZQUNTLEVBQWMsRUFDWCxZQUErQixFQUMvQixRQUF1QjtRQUVqQyxLQUFLLEVBQUUsQ0FBQztRQUpELE9BQUUsR0FBRixFQUFFLENBQVk7UUFDWCxpQkFBWSxHQUFaLFlBQVksQ0FBbUI7UUFDL0IsYUFBUSxHQUFSLFFBQVEsQ0FBZTtRQW5CNUIsU0FBSSxHQUFHLHVCQUF1QixDQUFDO1FBRXRDLFFBQUcsR0FBRztZQUNKLE9BQU8sRUFBcUIsU0FBUztTQUN0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dXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBFbGVtZW50UmVmLCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQsIFZpZXdDaGlsZH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdENoZWNrYm94fSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jaGVja2JveCc7XG5pbXBvcnQge01hdFNvcnQsIFNvcnREaXJlY3Rpb259IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3NvcnQnO1xuaW1wb3J0IHtTZWxlY3Rpb25Nb2RlbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7VGFibGVDb25maWd9IGZyb20gJy4uL3BvcC10YWJsZS5tb2RlbCc7XG5pbXBvcnQge1BvcENvbnRleHRNZW51Q29uZmlnfSBmcm9tICcuLi8uLi9wb3AtY29udGV4dC1tZW51L3BvcC1jb250ZXh0LW1lbnUubW9kZWwnO1xuaW1wb3J0IHtQb3BCYXNlRXZlbnRJbnRlcmZhY2V9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHtQb3BFeHRlbmRDb21wb25lbnR9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1leHRlbmQuY29tcG9uZW50JztcbmltcG9ydCB7UG9wRG9tU2VydmljZX0gZnJvbSAnLi4vLi4vLi4vLi4vc2VydmljZXMvcG9wLWRvbS5zZXJ2aWNlJztcbmltcG9ydCB7ZmFkZUluT3V0fSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLWFuaW1hdGlvbnMubW9kZWwnO1xuaW1wb3J0IHtQYXJzZUxpbmtVcmx9IGZyb20gJy4uLy4uLy4uL2VudGl0eS9wb3AtZW50aXR5LXV0aWxpdHknO1xuaW1wb3J0IHtQb3BEaXNwbGF5U2VydmljZX0gZnJvbSAnLi4vLi4vLi4vLi4vc2VydmljZXMvcG9wLWRpc3BsYXkuc2VydmljZSc7XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC10YWJsZS12aWV3JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC10YWJsZS12aWV3LmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vcG9wLXRhYmxlLXZpZXcuY29tcG9uZW50LnNjc3MnXSxcbiAgYW5pbWF0aW9uczogW1xuICAgIGZhZGVJbk91dCxcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBQb3BUYWJsZVZpZXdDb21wb25lbnQgZXh0ZW5kcyBQb3BFeHRlbmRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGNvbmZpZzogVGFibGVDb25maWc7XG4gIEBWaWV3Q2hpbGQoTWF0U29ydCwge3N0YXRpYzogdHJ1ZX0pIHRhYmxlU29ydDogTWF0U29ydDtcbiAgQFZpZXdDaGlsZCgnY2hlY2tib3gnKSBjaGVja2JveDogTWF0Q2hlY2tib3g7XG5cbiAgcHVibGljIG5hbWUgPSAnUG9wVGFibGVWaWV3Q29tcG9uZW50JztcblxuICBzcnYgPSB7XG4gICAgZGlzcGxheTogPFBvcERpc3BsYXlTZXJ2aWNlPnVuZGVmaW5lZCxcbiAgfTtcblxuICBwdWJsaWMgdWkgPSB7XG4gICAgaGVscGVyVGV4dDo8YW55W10+IFtdXG4gIH07XG5cblxuICAvKipcbiAgICogQHBhcmFtIGVsXG4gICAqIEBwYXJhbSBfZGlzcGxheVJlcG9cbiAgICogQHBhcmFtIF9kb21SZXBvXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIF9kaXNwbGF5UmVwbzogUG9wRGlzcGxheVNlcnZpY2UsXG4gICAgcHJvdGVjdGVkIF9kb21SZXBvOiBQb3BEb21TZXJ2aWNlLFxuICApIHtcbiAgICBzdXBlcigpO1xuICAgIC8qKlxuICAgICAqIENvbmZpZ3VyZSB0aGUgc3BlY2lmaWNzIG9mIHRoaXMgY29tcG9uZW50XG4gICAgICovXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHRoaXMuX2F0dGFjaENvbnRleHRNZW51KCk7XG5cbiAgICAgICAgLy8gQXNzaWduIHRoaXMgc28gaXQgaXMgYXZhaWxhYmxlIGluc2lkZSB0aGUgZmlsdGVyQmFyQ29uZmlnLlxuICAgICAgICB0aGlzLmNvbmZpZy5tYXREYXRhLnNvcnQgPSB0aGlzLnRhYmxlU29ydDtcbiAgICAgICAgLy8gQ3JlYXRlIGEgY29udGFpbmVyIGZvciBoZWxwZXIgdGV4dHNcbiAgICAgICAgdGhpcy51aS5oZWxwZXJUZXh0ID0gW107XG4gICAgICAgIC8vIEFkZCB0byB0aGUgY29uZmlnIHNvIGl0J3MgYXZhaWxhYmxlIHRvIHByZXBUYWJsZS5cbiAgICAgICAgdGhpcy5jb25maWcuc2VsZWN0aW9uID0gbmV3IFNlbGVjdGlvbk1vZGVsKHRydWUsIFtdKTtcbiAgICAgICAgdGhpcy5jb25maWcuaGVhZGVyU3RpY2t5ID0gdHJ1ZTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5jb25maWcubWF0RGF0YS5zb3J0ID0gdGhpcy50YWJsZVNvcnQ7XG4gICAgICAgICAgaWYgKHRoaXMuY29uZmlnLmluaXRpYWxTb3J0KSB0aGlzLnRhYmxlU29ydC5zb3J0KHtcbiAgICAgICAgICAgIGlkOiB0aGlzLmNvbmZpZy5pbml0aWFsU29ydCxcbiAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmNvbmZpZy5pbml0aWFsU29ydERpcmVjdGlvbixcbiAgICAgICAgICAgIGRpc2FibGVDbGVhcjogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LCA1MDApO1xuXG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cblxuICBzb3J0RGlzcGxheShjb2wpIHtcblxuICAgIGNvbnN0IGlzQWN0aXZlID0gdGhpcy50YWJsZVNvcnQuYWN0aXZlID09PSBjb2wgPyB0cnVlIDogZmFsc2U7XG4gICAgbGV0IGRpc3BsYXkgPSAnYXJyb3dfZHJvcF9kb3duJztcblxuICAgIGlmIChpc0FjdGl2ZSkge1xuICAgICAgaWYgKHRoaXMudGFibGVTb3J0LmRpcmVjdGlvbiA9PT0gJ2FzYycpIHtcbiAgICAgICAgZGlzcGxheSA9ICdhcnJvd19kcm9wX3VwJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGlzcGxheTtcblxuICB9XG5cbiAgLy8gc29ydChjb2x1bW4sZGlyZWN0aW9uKXtcbiAgLy8gICAvLyBjb25zb2xlLmxvZyh0aGlzLnRhYmxlU29ydCk7XG4gIC8vICAgdGhpcy50YWJsZVNvcnQuZGlyZWN0aW9uID0gZGlyZWN0aW9uID09PSAnYXNjJyA/ICdkZXNjJyA6ICdhc2MnO1xuICAvLyAgIHRoaXMudGFibGVTb3J0LnNvcnQoeyBpZDogY29sdW1uLCBzdGFydDogZGlyZWN0aW9uLCBkaXNhYmxlQ2xlYXI6IHRydWUgfSk7XG4gIC8vIH1cblxuICBzb3J0KGNvbCkge1xuICAgIGNvbnN0IGlzQWN0aXZlID0gdGhpcy50YWJsZVNvcnQuYWN0aXZlID09PSBjb2wgPyB0cnVlIDogZmFsc2U7XG4gICAgbGV0IGRpcmVjdGlvbjogU29ydERpcmVjdGlvbiA9ICdhc2MnO1xuICAgIGlmIChpc0FjdGl2ZSkge1xuICAgICAgZGlyZWN0aW9uID0gdGhpcy50YWJsZVNvcnQuZGlyZWN0aW9uID09PSAnYXNjJyA/ICdkZXNjJyA6ICdhc2MnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkaXJlY3Rpb24gPSAnYXNjJztcbiAgICB9XG4gICAgdGhpcy50YWJsZVNvcnQuZGlyZWN0aW9uID0gZGlyZWN0aW9uID09PSAnYXNjJyA/ICdkZXNjJyA6ICdhc2MnO1xuICAgIHRoaXMudGFibGVTb3J0LnNvcnQoe2lkOiBjb2wsIHN0YXJ0OiBkaXJlY3Rpb24sIGRpc2FibGVDbGVhcjogdHJ1ZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IGlzIGEgY2hpbGQgY29tcG9uZW50IG9mIHBvcCB0YWJsZVxuICAgKiBUaGlzIGNvbXBvbmVudCBzcGVjaWZpY2FsbHkgaGFuZGxlcyB0aGUgdmlldyB0aGF0IHJlbmRlcnMgdGhlIGRhdGFcbiAgICovXG4gIG5nT25Jbml0KCkge1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGFuIGV2ZW50IHdoZW4gdGhlIHVzZXIgY2xpY2sgb24gYSBuYW1lXG4gICAqIEBwYXJhbSBuYW1lXG4gICAqIEBwYXJhbSByb3dcbiAgICovXG4gIG9uQ29sdW1uU3RhbmRhcmRDbGljayhuYW1lLCByb3cpIHtcbiAgICB0aGlzLmNvbmZpZy5vbkV2ZW50Lm5leHQoe1xuICAgICAgc291cmNlOiB0aGlzLm5hbWUsXG4gICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgbmFtZTogJ2NvbHVtblN0YW5kYXJkQ2xpY2snLFxuICAgICAgZGF0YToge1xuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICByb3c6IHJvd1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogVHJpZ2dlciBhbiBldmVudCB3aGVuIHRoZSB1c2VyIGNsaWNrIG9uIGEgbmFtZSB0aGF0IGlzIGxpbmtlZCB0byBhIHJvdXRlXG4gICAqIEBwYXJhbSBuYW1lXG4gICAqIEBwYXJhbSByb3dcbiAgICovXG4gIG9uQ29sdW1uUm91dGVDbGljayhuYW1lLCByb3cpIHtcbiAgICB0aGlzLmNvbmZpZy5vbkV2ZW50Lm5leHQoe1xuICAgICAgc291cmNlOiB0aGlzLm5hbWUsXG4gICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgbmFtZTogJ2NvbHVtblJvdXRlQ2xpY2snLFxuICAgICAgZGF0YToge1xuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICByb3c6IHJvd1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogQ3JlYXRlIGEgaGVscGVyIHRleHQgZm9yIGEgbmFtZVxuICAgKiBAcGFyYW0gaW5kZXhcbiAgICogQHBhcmFtIGNvbFxuICAgKiBAcGFyYW0gcm93XG4gICAqL1xuICBvbkhlbHBlclRleHQoaW5kZXgsIGNvbCwgcm93KSB7XG4gICAgXG4gICAgaWYgKCFyb3dbY29sXSkgcmV0dXJuICcnO1xuICAgIGxldCB0ZXh0ID0gdGhpcy5jb25maWcuY29sdW1uQ29uZmlnLnRlbXBsYXRlc1tjb2xdLmhlbHBlci50ZXh0O1xuXG4gICAgLy8gQ2hlY2sgZm9yIGFsaWFzXG4gICAgaWYgKHRleHQuaW5jbHVkZXMoJ2FsaWFzOicpKSB7XG4gICAgICBjb25zdCBzdGFydCA9IHRleHQuaW5kZXhPZignYWxpYXM6Jyk7XG4gICAgICBjb25zdCBlbmQgPSB0ZXh0LmluZGV4T2YoJyAnLCBzdGFydCkgIT09IC0xID8gdGV4dC5pbmRleE9mKCcgJywgc3RhcnQpIDogdGV4dC5sZW5ndGg7XG4gICAgICBjb25zdCBhbGlhc1N0cmluZyA9IHRleHQuc3Vic3RyaW5nKHN0YXJ0LCBlbmQpO1xuICAgICAgY29uc3QgYWxpYXNBcnJheSA9IGFsaWFzU3RyaW5nLnNwbGl0KCc6Jyk7XG4gICAgICBhbGlhc0FycmF5LnNoaWZ0KCk7XG4gICAgICBjb25zdCBhbGlhcyA9IHRoaXMuc3J2LmRpc3BsYXkuYWxpYXMoYWxpYXNBcnJheS5zaGlmdCgpKTtcbiAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoYWxpYXNTdHJpbmcsIGFsaWFzKTtcbiAgICB9XG5cbiAgICAvLyBJZiBubyB0ZXh0IGlzIHdyYXBwZWQgaW4gPCA+IHRoZW4gdGhpcyBpcyB0aGUgdGV4dCB3ZSB3YW50LlxuICAgIGlmICh0ZXh0LmluZGV4T2YoJzwnKSA9PT0gLTEpIHtcbiAgICAgIHRoaXMudWkuaGVscGVyVGV4dFtpbmRleF0gPSB0ZXh0O1xuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuXG4gICAgLy8gUmVwbGFjZSBhbnkgdGV4dCBiZXR3ZWVuIDwgPiB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIG5hbWUgZGF0YS5cbiAgICBjb25zdCB0ZXh0QXJyYXkgPSB0ZXh0LnNwbGl0KCc8Jyk7XG4gICAgdGV4dCA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGV4dEFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIXRleHRBcnJheVtpXSkgY29udGludWU7XG4gICAgICBpZiAodGV4dEFycmF5W2ldLmluZGV4T2YoJz4nKSA9PT0gLTEpIHtcbiAgICAgICAgdGV4dCArPSB0ZXh0QXJyYXlbaV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBmaWVsZEFycmF5ID0gdGV4dEFycmF5W2ldLnNwbGl0KCc+Jyk7XG4gICAgICAgIGZvciAobGV0IGlpID0gMDsgaWkgPCBmaWVsZEFycmF5Lmxlbmd0aDsgaWkrKykge1xuICAgICAgICAgIGlmICghZmllbGRBcnJheVtpaV0pIGNvbnRpbnVlO1xuICAgICAgICAgIGlmIChpaSA9PT0gMCkge1xuICAgICAgICAgICAgdGV4dCArPSAocm93W2ZpZWxkQXJyYXlbaWldXSA/IHJvd1tmaWVsZEFycmF5W2lpXV0gOiAnJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRleHQgKz0gZmllbGRBcnJheVtpaV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIHRoaXMudWkuaGVscGVyVGV4dFtpbmRleF0gPSB0ZXh0O1xuXG4gICAgcmV0dXJuIHRleHQ7XG4gICAgXG4gIH1cblxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGFuIGRvQWN0aW9uIHdoZW4gYSBuYW1lIGxpbmsgaXMgY2xpY2tlZFxuICAgKiBAcGFyYW0gbmFtZVxuICAgKiBAcGFyYW0gcm93XG4gICAqL1xuICBvbkNvbHVtbkxpbmtDbGljayhuYW1lLCByb3cpIHtcbiAgICB0aGlzLmNvbmZpZy5vbkV2ZW50Lm5leHQoe1xuICAgICAgc291cmNlOiB0aGlzLm5hbWUsXG4gICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgbmFtZTogJ2NvbHVtbkxpbmtDbGljaycsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIHJvdzogcm93XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZWxlY3RzIGFsbCByb3dzIGlmIHRoZXkgYXJlIG5vdCBhbGwgc2VsZWN0ZWQ7IG90aGVyd2lzZSBjbGVhciBhbGwgcm93IHNlbGVjdGlvbnMuXG4gICAqL1xuICBvbk1hc3RlclJvd1RvZ2dsZUNsaWNrKCkge1xuICAgIGlmICh0aGlzLmNvbmZpZy5zZWxlY3Rpb24uaGFzVmFsdWUoKSAmJiAhdGhpcy5pc0FsbFJvd3NTZWxlY3RlZCgpKSB7XG4gICAgICB0aGlzLmNvbmZpZy5zZWxlY3Rpb24uY2xlYXIoKTtcbiAgICAgIHRoaXMuY2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmlzQWxsUm93c1NlbGVjdGVkKCkgPyB0aGlzLmNvbmZpZy5zZWxlY3Rpb24uY2xlYXIoKSA6IHRoaXMuY29uZmlnLm1hdERhdGEuZmlsdGVyZWREYXRhLmZvckVhY2gocm93ID0+IHRoaXMuY29uZmlnLnNlbGVjdGlvbi5zZWxlY3Qocm93KSk7XG4gICAgICB0aGlzLmNvbmZpZy5vbkV2ZW50Lm5leHQoe1xuICAgICAgICBzb3VyY2U6IHRoaXMubmFtZSxcbiAgICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgbmFtZTogJ3Jvd3Nfc2VsZWN0ZWQnLFxuICAgICAgICBkYXRhOiB0aGlzLmNvbmZpZy5zZWxlY3Rpb24uc2VsZWN0ZWRcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgd2lsbCBwYXNzIHVwIHRvIHRoZSB0YWJsZSBjb21wb25lbnRcbiAgICogQHBhcmFtIGZpbHRlclxuICAgKiBAcGFyYW0gY29sXG4gICAqL1xuICBvbkFwcGx5U2VhcmNoVmFsdWUoZmlsdGVyOiBzdHJpbmcsIGNvbDogc3RyaW5nKSB7XG4gICAgdGhpcy5jb25maWcub25FdmVudC5uZXh0KHtcbiAgICAgIHNvdXJjZTogdGhpcy5uYW1lLFxuICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgIG5hbWU6ICdmaWx0ZXInLFxuICAgICAgZGF0YToge1xuICAgICAgICBmaWx0ZXI6IGZpbHRlcixcbiAgICAgICAgY29sOiBjb2wsXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBc2tzIHdoZXRoZXIgdGhlIG51bWJlciBvZiBzZWxlY3RlZCBlbGVtZW50cyBtYXRjaGVzIHRoZSB0b3RhbCBudW1iZXIgb2Ygcm93cy5cbiAgICovXG4gIGlzQWxsUm93c1NlbGVjdGVkKCkge1xuICAgIGNvbnN0IG51bVNlbGVjdGVkID0gdGhpcy5jb25maWcuc2VsZWN0aW9uLnNlbGVjdGVkLmxlbmd0aDtcbiAgICBjb25zdCBudW1Sb3dzID0gdGhpcy5jb25maWcubWF0RGF0YS5maWx0ZXJlZERhdGEubGVuZ3RoO1xuICAgIHJldHVybiBudW1TZWxlY3RlZCA9PT0gbnVtUm93cztcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgd2lsbCBidWJibGUgZXZlbnRzIHdpdGggdGhlIHRhYmxlIHNpZ25hdHVyZVxuICAgKiBAcGFyYW0gbmFtZVxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uQnViYmxlRXZlbnQobmFtZSwgZXZlbnQpIHtcbiAgICB0aGlzLmNvbmZpZy5vbkV2ZW50Lm5leHQoe1xuICAgICAgc291cmNlOiB0aGlzLm5hbWUsXG4gICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIGRhdGE6IGV2ZW50XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiAqbmdGb3IgdHJhY2sgYnkgZm9yIGNvbHVtbnNcbiAgICogUHJldmVudHMgY29sdW1ucyBmcm9tIHJlLXJlbmRlcmluZyB3aGVuIHRoZSBpdGVtIGlzIHRoZSBzYW1lXG4gICAqIEBwYXJhbSBpbmRleFxuICAgKiBAcGFyYW0gaXRlbVxuICAgKi9cbiAgdHJhY2tDb2x1bW5CeUl0ZW0oaW5kZXgsIGl0ZW0pIHtcbiAgICBpZiAoIWl0ZW0pIHJldHVybiBudWxsO1xuICAgIHJldHVybiBpdGVtO1xuICB9XG5cblxuICAvKipcbiAgICogKm5nRm9yIHRyYWNrIGJ5IGZvciByb3dzXG4gICAqIFByZXZlbnRzIHJvd3MgZnJvbSByZS1yZW5kZXJpbmcgd2hlbiB0aGUgaXRlbSBlbnRpdHlJZCBpcyBzdGlsbCB0aGUgc2FtZVxuICAgKiBAcGFyYW0gaW5kZXhcbiAgICogQHBhcmFtIGl0ZW1cbiAgICovXG4gIHRyYWNrUm93QnlJdGVtSWQoaW5kZXgsIGl0ZW0pIHtcbiAgICBpZiAoIWl0ZW0pIHJldHVybiBudWxsO1xuICAgIHJldHVybiBpdGVtLmlkO1xuICB9XG5cblxuICAvKipcbiAgICogQ2xlYW4gdXAgdGhlIGRvbSBvZiB0aGlzIGNvbXBvbmVudFxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgd2lsbCBhIGJ1aWxkIGEgY29udGV4dC1tZW51IHRoYXQgY2FuIHVzZWQgd2hlbiB1c2VyIHJpZ2h0IGNsaWNrcyBhIGNlcnRhaW4gZWxlbWVudFxuICAgKi9cbiAgcHJpdmF0ZSBfYXR0YWNoQ29udGV4dE1lbnUoKSB7XG4gICAgdGhpcy5kb20uY29udGV4dE1lbnUuY29uZmlnID0gbmV3IFBvcENvbnRleHRNZW51Q29uZmlnKCk7XG4gICAgLy9cbiAgICB0aGlzLmRvbS5jb250ZXh0TWVudS5jb25maWd1cmUgPSAobmFtZSwgcm93LCBldmVudDogTW91c2VFdmVudCkgPT4ge1xuICAgICAgbGV0IGdvVG9VcmwgPSAnJztcbiAgICAgIGxldCBpbnRlcm5hbF9uYW1lO1xuICAgICAgLy8gY2hlY2sgaWYgaXQgaXMgYSByb3V0ZSwgZ2V0IHRoZSB1cmwgZnJvbSB0aGUgcm91dGUgZ2l2ZW4gZnJvbSBuYW1lIGRlZmluaXRpb25cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9uc1tuYW1lXS5yb3V0ZSkge1xuICAgICAgICBnb1RvVXJsID0gUGFyc2VMaW5rVXJsKHRoaXMuY29uZmlnLmNvbHVtbkRlZmluaXRpb25zW25hbWVdLnJvdXRlLCByb3cpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmNvbmZpZy5yb3V0ZSkge1xuICAgICAgICAvLyBlbHNlIGNoZWNrIGlmIGEgZ2xvYmFsIHJvdXRlIGV4aXN0cyBvbiB0aGUgdGFibGUgY29uZmlnLiBJZiBpdCBkb2VzLCByb3V0ZSB0byB0aGF0XG4gICAgICAgIC8vIHRoaXMgd2lsbCBtb3N0IGxpa2VseSBiZSB1c2VkIHRvIHJvdXRlIHRvIGFuIGVudGl0eUlkIGJ5IHRoZWlyIGVudGl0eUlkXG4gICAgICAgIGdvVG9VcmwgPSBQYXJzZUxpbmtVcmwodGhpcy5jb25maWcucm91dGUsIHJvdyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9uc1tuYW1lXS5pbnRlcm5hbF9uYW1lKSB7XG4gICAgICAgIGludGVybmFsX25hbWUgPSB0aGlzLmNvbmZpZy5jb2x1bW5EZWZpbml0aW9uc1tuYW1lXS5pbnRlcm5hbF9uYW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW50ZXJuYWxfbmFtZSA9IHJvdy5pbnRlcm5hbF9uYW1lID8gcm93LmludGVybmFsX25hbWUgOiB0aGlzLmNvbmZpZy5pbnRlcm5hbF9uYW1lID8gdGhpcy5jb25maWcuaW50ZXJuYWxfbmFtZSA6IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAoIWdvVG9VcmwgJiYgIWludGVybmFsX25hbWUpIHJldHVybiBmYWxzZTtcblxuICAgICAgLy8gaWYgd2UgaGF2ZW4ndCByZXR1cm5lZCwgcHJldmVudCB0aGUgZGVmYXVsdCBiZWhhdmlvciBvZiB0aGUgcmlnaHQgY2xpY2suXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAvLyByZXNldCB0aGUgY29udGV4dCBtZW51LCBhbmQgY29uZmlndXJlIGl0IHRvIGxvYWQgYXQgdGhlIHBvc2l0aW9uIGNsaWNrZWQuXG4gICAgICB0aGlzLmRvbS5jb250ZXh0TWVudS5jb25maWcucmVzZXRPcHRpb25zKCk7XG5cblxuICAgICAgaWYgKGludGVybmFsX25hbWUpIHtcbiAgICAgICAgdGhpcy5kb20uY29udGV4dE1lbnUuY29uZmlnLmFkZFBvcnRhbE9wdGlvbihpbnRlcm5hbF9uYW1lLCByb3cuaWQgPyArcm93LmlkIDogK3Jvd1tpbnRlcm5hbF9uYW1lICsgJ19mayddKTtcbiAgICAgIH1cbiAgICAgIGlmIChnb1RvVXJsKSB0aGlzLmRvbS5jb250ZXh0TWVudS5jb25maWcuYWRkTmV3VGFiT3B0aW9uKGdvVG9VcmwpO1xuXG4gICAgICB0aGlzLmRvbS5jb250ZXh0TWVudS5jb25maWcueCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICB0aGlzLmRvbS5jb250ZXh0TWVudS5jb25maWcueSA9IGV2ZW50LmNsaWVudFk7XG4gICAgICB0aGlzLmRvbS5jb250ZXh0TWVudS5jb25maWcudG9nZ2xlLm5leHQodHJ1ZSk7XG4gICAgfTtcbiAgICB0aGlzLmRvbS5zZXRTdWJzY3JpYmVyKCdjb250ZXh0LW1lbnUnLCB0aGlzLmRvbS5jb250ZXh0TWVudS5jb25maWcuZW1pdHRlci5zdWJzY3JpYmUoKGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UpID0+IHtcbiAgICAgIHRoaXMuY29uZmlnLm9uRXZlbnQubmV4dChldmVudCk7XG4gICAgfSkpO1xuICB9XG59XG4iXX0=