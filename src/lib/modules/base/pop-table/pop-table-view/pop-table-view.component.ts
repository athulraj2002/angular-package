import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatSort, SortDirection} from '@angular/material/sort';
import {SelectionModel} from '@angular/cdk/collections';
import {TableConfig} from '../pop-table.model';
import {PopContextMenuConfig} from '../../pop-context-menu/pop-context-menu.model';
import {PopBaseEventInterface} from '../../../../pop-common.model';
import {PopExtendComponent} from '../../../../pop-extend.component';
import {PopDomService} from '../../../../services/pop-dom.service';
import {fadeInOut} from '../../../../pop-common-animations.model';
import {ParseLinkUrl} from '../../../entity/pop-entity-utility';
import {PopDisplayService} from '../../../../services/pop-display.service';


@Component({
  selector: 'lib-pop-table-view',
  templateUrl: './pop-table-view.component.html',
  styleUrls: ['./pop-table-view.component.scss'],
  animations: [
    fadeInOut,
  ]
})
export class PopTableViewComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() config: TableConfig;
  @ViewChild(MatSort, {static: true}) tableSort: MatSort;
  @ViewChild('checkbox') checkbox: MatCheckbox;

  public name = 'PopTableViewComponent';

  srv = {
    display: <PopDisplayService>undefined,
  };

  public ui = {
    helperText:<any[]> []
  };


  /**
   * @param el
   * @param _displayRepo
   * @param _domRepo
   */
  constructor(
    public el: ElementRef,
    protected _displayRepo: PopDisplayService,
    protected _domRepo: PopDomService,
  ) {
    super();
    /**
     * Configure the specifics of this component
     */
    this.dom.configure = (): Promise<boolean> => {
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
          if (this.config.initialSort) this.tableSort.sort({
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
    let direction: SortDirection = 'asc';
    if (isActive) {
      direction = this.tableSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      direction = 'asc';
    }
    this.tableSort.direction = direction === 'asc' ? 'desc' : 'asc';
    this.tableSort.sort({id: col, start: direction, disableClear: true});
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
    
    if (!row[col]) return '';
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
      if (!textArray[i]) continue;
      if (textArray[i].indexOf('>') === -1) {
        text += textArray[i];
      } else {
        const fieldArray = textArray[i].split('>');
        for (let ii = 0; ii < fieldArray.length; ii++) {
          if (!fieldArray[ii]) continue;
          if (ii === 0) {
            text += (row[fieldArray[ii]] ? row[fieldArray[ii]] : '');
          } else {
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
    } else {
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
  onApplySearchValue(filter: string, col: string) {
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
    if (!item) return null;
    return item;
  }


  /**
   * *ngFor track by for rows
   * Prevents rows from re-rendering when the item entityId is still the same
   * @param index
   * @param item
   */
  trackRowByItemId(index, item) {
    if (!item) return null;
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
  private _attachContextMenu() {
    this.dom.contextMenu.config = new PopContextMenuConfig();
    //
    this.dom.contextMenu.configure = (name, row, event: MouseEvent) => {
      let goToUrl = '';
      let internal_name;
      // check if it is a route, get the url from the route given from name definition
      if (this.config.columnDefinitions[name].route) {
        goToUrl = ParseLinkUrl(this.config.columnDefinitions[name].route, row);
      } else if (this.config.route) {
        // else check if a global route exists on the table config. If it does, route to that
        // this will most likely be used to route to an entityId by their entityId
        goToUrl = ParseLinkUrl(this.config.route, row);
      }

      if (this.config.columnDefinitions[name].internal_name) {
        internal_name = this.config.columnDefinitions[name].internal_name;
      } else {
        internal_name = row.internal_name ? row.internal_name : this.config.internal_name ? this.config.internal_name : null;
      }
      if (!goToUrl && !internal_name) return false;

      // if we haven't returned, prevent the default behavior of the right click.
      event.preventDefault();

      // reset the context menu, and configure it to load at the position clicked.
      this.dom.contextMenu.config.resetOptions();


      if (internal_name) {
        this.dom.contextMenu.config.addPortalOption(internal_name, row.id ? +row.id : +row[internal_name + '_fk']);
      }
      if (goToUrl) this.dom.contextMenu.config.addNewTabOption(goToUrl);

      this.dom.contextMenu.config.x = event.clientX;
      this.dom.contextMenu.config.y = event.clientY;
      this.dom.contextMenu.config.toggle.next(true);
    };
    this.dom.setSubscriber('context-menu', this.dom.contextMenu.config.emitter.subscribe((event: PopBaseEventInterface) => {
      this.config.onEvent.next(event);
    }));
  }
}
