import {Component, Inject, OnInit, OnDestroy} from '@angular/core';

import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {PopCommonService} from '../../../../services/pop-common.service';
import {TableOptionsConfig} from '../pop-table.model';
import {SwitchConfig} from '../../pop-field-item/pop-switch/switch-config.model';
import {Dictionary, FieldItemOption} from '../../../../pop-common.model';
import {PopDisplayService} from '../../../../services/pop-display.service';
import {SelectConfig} from "../../pop-field-item/pop-select/select-config.model";

export interface Toggles {
  allowColumnDisplayToggle?: SwitchConfig;
  allowColumnStickyToggle?: SwitchConfig;
  allowColumnSearchToggle?: SwitchConfig;
  allowColumnSortToggle?: SwitchConfig;
  allowHeaderStickyToggle?: SwitchConfig;
  allowHeaderDisplayToggle?: SwitchConfig;
  allowPaginatorToggle?: SwitchConfig;
}

@Component({
  selector: 'lib-dialog',
  templateUrl: 'pop-table-dialog.component.html',
  styleUrls: ['pop-table-dialog.component.scss']
})
export class PopTableDialogComponent implements OnInit, OnDestroy {

  options: TableOptionsConfig;
  toggles: Toggles;
  columns;

  lockedColumns: SelectConfig;


  public dom = {
    state: <Dictionary<string | number | boolean>>{},
    asset: <Dictionary<string | number | boolean>>{},
    height: <Dictionary<number>>{
      outer: null,
      inner: null,
      default: null
    }
  };

  constructor(
    private tableDialogRef: MatDialogRef<PopTableDialogComponent>,
    private cs: PopCommonService,
    private ds: PopDisplayService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
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

  buildLockedColumns(){
    let lockedColumns = 0;

    this.columns.forEach( (col, index) =>{
      if(col.sticky === true){
        lockedColumns = ++index;
      }
    });

    this.lockedColumns = new SelectConfig({
      label: 'Locked columns',
      options: {
        values: [
          {value: 0, name: 'No columns locked'},
          {value: 1, name: 'Lock first column'},
          {value: 2, name: 'Lock first 2 columns'},
          {value: 3, name: 'Lock first 3 columns'},
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
        metadata: {option: 'searchColumns'}
      }),
      allowColumnSortToggle: new SwitchConfig({
        bubble: true,
        label: 'Column Sort',
        value: this.options.currentOptions.sort,
        metadata: {option: 'sort'}
      }),
      allowHeaderStickyToggle: new SwitchConfig({
        bubble: true,
        label: 'Sticky Header',
        value: this.options.currentOptions.headerSticky,
        metadata: {option: 'headerSticky'}
      }),
      allowHeaderDisplayToggle: new SwitchConfig({
        bubble: true,
        label: 'Display Header',
        value: this.options.currentOptions.headerDisplay,
        metadata: {option: 'headerDisplay'}
      }),
      allowPaginatorToggle: new SwitchConfig({
        bubble: true,
        label: 'Pagination',
        value: this.options.currentOptions.paginator,
        metadata: {option: 'paginator'}
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

      if (!this.options.currentOptions.columnDefinitions[col].name) this.options.currentOptions.columnDefinitions[col].name = col;

      if (this.options.currentOptions.columnDefinitions[col].visible) {
        currentColumns.push(this.options.currentOptions.columnDefinitions[col]);
      } else {
        otherColumns.push(this.options.currentOptions.columnDefinitions[col]);
      }

      // If this column has a checkbox then account for it in the list.
      if (this.options.currentOptions.columnDefinitions[col].checkbox) {
        if (this.options.currentOptions.columnDefinitions[col].checkbox.visible) {
          currentColumns.push({
            ...{name: col + '_checkbox', ref: col, display: this.ds.set(col + '_checkbox')},
            ...this.options.currentOptions.columnDefinitions[col].checkbox
          });
        } else {
          otherColumns.push({
            ...{name: col + '_checkbox', ref: col, display: this.ds.set(col + '_checkbox')},
            ...this.options.currentOptions.columnDefinitions[col].checkbox
          });
        }
      }

      // Remove from columns so we don't have duplicates.
      if (this.options.columns.indexOf(col) !== -1) this.options.columns.splice(this.options.columns.indexOf(col), 1);
    }

    // Account for other columns in the dataset.
    if (!otherColumns.length) {
      for (const col of this.options.columns) {
        otherColumns.push({name: col, display: this.ds.set(col), visible: false, sticky: false, sort: 0});
      }
    }

    // Sort current columns by their sort number and sort other columns by their name.
    currentColumns.sort(this.cs.dynamicSort('sort'));
    otherColumns.sort(this.cs.dynamicSort('name'));

    // Update the sort to reflect the new order.
    let order = 0;
    for (const col of currentColumns) col.sort = ++order;
    for (const col of otherColumns) col.sort = ++order;

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

  onSave(): void {

    // Set our order to be the same as the index in the array.
    let order = 0;
    for (const col of this.columns) col.sort = ++order;

    // Build the column definitions based on user selection.
    const columnDefinitions = {};
    for (const col of this.columns) {
      if (col.ref) continue; // Ignore checkboxes for now as they belong under a specific field.
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
      if (!col.ref) continue;
      columnDefinitions[col.ref] = {
        ...columnDefinitions[col.ref],
        ...{checkbox: {sort: col.sort, sticky: col.sticky, visible: col.visible}}
      };
    }

    this.options.currentOptions.columnDefinitions = columnDefinitions;

    this.tableDialogRef.close({type: 'save', options: this.options});
  }

  onResetToDefault(): void {
    this.tableDialogRef.close({type: 'reset', options: this.options});
  }

  onCancel(): void {
    this.tableDialogRef.close({type: 'cancel', options: this.options});
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  ngOnDestroy() {
  }

}
