import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input, OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {MatListOption, MatSelectionList} from '@angular/material/list';
import {Observable} from 'rxjs';
import {SelectListConfig, SelectListGroupInterface} from './select-list-config.model';
import {InputConfig} from '../pop-input/input-config.model';

import {debounceTime} from 'rxjs/operators';
import {SelectFilterGroupInterface} from '../pop-select-filter/select-filter-config.model';
import {
  CoreConfig,
  Entity,
  FieldItemOption,
  FieldItemPatchInterface,
  KeyMap,
  PopBaseEventInterface
} from '../../../../pop-common.model';
import {PopFieldItemComponent} from '../pop-field-item.component';
import {
  IsArray,
  IsCallableFunction,
  IsDefined,
  IsNumber,
  IsObject,
  ObjectContainsTagSearch
} from '../../../../pop-common-utility';
import {SwitchConfig} from '../pop-switch/switch-config.model';


@Component({
  selector: 'lib-pop-select-list',
  templateUrl: './pop-select-list.component.html',
  styleUrls: ['./pop-select-list.component.scss'],
})
export class PopSelectListComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
  // configuration for component
  @Input() config: SelectListConfig;

  // emitted every time there is an option selection, search focus, or the filter options close
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();

  // Getting a reference to the selection list in the view so that I can know which options are selected
  @ViewChild('selectionList', {static: true}) selectionListRef: MatSelectionList;
  @ViewChild('search') searchRef: ElementRef;

  public name = 'PopSelectListComponent';


  protected asset = {
    filteredOptions: <Observable<FieldItemOption[]>>undefined,
    groups: [],
    onFocusValue: undefined,
    filterActivated: false,
    disabled: <KeyMap<boolean>>{}
  };

  public ui = {
    search: {
      config: undefined,
    },
    all: {
      overlay: undefined,
    }
  };


  constructor(
    public el: ElementRef,
    protected cdr: ChangeDetectorRef) {
    super();

    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {

        this._setInitialDomState();
        this._setUpFilterObservable();
        this._setListPosition();
        this._filterOptionList('');
        this._setConfigHooks();

        return resolve(true);
      });
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise((resolve) => {

        this._setInitialValue();

        return resolve(true);
      });
    };

  }


  ngOnInit(): void {
    super.ngOnInit();
  }


  triggerOnChange(wait = 1000) {
    this.dom.setTimeout('api-fetch', () => {
      this.onChange();
    }, wait);
  }


  /**
   * Checks/Unchecks all of the filtered options within a specific group
   * @param  FieldOption option
   * @returns boolean
   */
  onGroupChange(checked: boolean, group): boolean {
    if (!this.config.multiple) return false;
    if (!checked) this.config.all = false;
    group.options.values.map((option: FieldItemOption) => {
      if (!option.hidden) option.selected = checked;
    });
    setTimeout(() => {
      this._checkGroupState(checked, group);
      this._updateSelectedOptions();
      this.onBubbleEvent('groupAllChange', 'Group Change', {data: group});
      this.onBubbleEvent('groupChange', 'Group Change', {data: group});
    }, 0);
    return false;
  }


  /**
   * Checks/Unchecks all of the filtered options within a specific group
   * @param  FieldOption option
   * @returns boolean
   */
  onAllChange(checked: boolean): boolean {
    if (!this.config.multiple) return false;
    this.config.groups.map((group) => {
      group.options.values.map((option: FieldItemOption) => {
        option.selected = checked;
      });
      group.all = checked;
      group.indeterminate = false;
    });
    setTimeout(() => {
      this._updateSelectedOptions();
    }, 0);
    return false;
  }

  /**
   * Allow the user to clear the search text
   */
  onClearSearch(): void {
    this.ui.search.config.control.setValue('');
  }


  /**
   * Update's the list of selected options inside of the config
   * and emits a change event. This method will be called by the view
   * whenever an option is selected
   * @param MatSelectionListChange event
   * @returns void
   */
  onOptionChange(event, option, group): void {
    if (this.config.multiple) {
      // option.selected = event.target.className.search( 'mat-pseudo-checkbox-checked' ) > -1 ? true : false;
      option.selected = !option.selected;
      if (!option.selected) this.config.all = false;
      this._checkGroupState(option.selected, group);
      this._updateSelectedOptions();

      this.onBubbleEvent('optionChange', 'Option Change', {data: option});
      setTimeout(() => {
        this.onBubbleEvent('groupChange', 'Group Change', {data: group});
      }, 0);
    } else {
      this.dom.active.optionId = option.value;
      this.config.control.setValue(option.value);
      this.config.strVal = option.name;
      this.triggerOnChange(0);
    }
  }

  /**
   * Add on to set toggle special custom property
   * @param event
   * @param option
   */
  onOptionModeChange(event, option): void {
    if (this.config.multiple) {
      setTimeout(() => {
        this.onBubbleEvent('optionModeChange', 'Option Mode Change', {data: option});
      }, 0);
    }
  }

  /**
   * On link click stub
   */
  onLinkClick() {
    console.log('LINK STUB: Link to Entity', this.config.control.value);
  }

  /**
   * Allow user to open close a group section
   * @param group
   */
  onToggleGroup(group: SelectListGroupInterface) {
    if (this.config.groups.length > 1) {
      group.open = !group.open;
    }
  }


  /**
   * Checks if the given option is in the list of selected options
   * in the config. Used by the view to set the checkboxe's on the
   * initial state of the dropdown
   * @param  FieldOption option
   * @returns boolean
   */
  isOptionSelected(option: FieldItemOption): boolean {
    return option.selected;
  }


  isSearchValue() {
    if (IsObject(this.ui.search.config, ['control']) && this.ui.search.config.control.value) {
      return true;
    }
    return false;
  }


  /**
   * Template logic to determine if a option is hidden
   * @param option
   */
  isOptionHidden(group: SelectListGroupInterface, option: FieldItemOption): boolean {
    if (!group.open && !(this.isSearchValue())) {
      return true;
    }
    if (option.hidden) {
      return true;
    }
    return false;
  }


  /**
   * Template logic to determine if a option is active
   * @param option
   */
  isOptionActive(option: FieldItemOption): boolean {
    return this.dom.active.optionId && option.value === this.dom.active.optionId;
  }


  /**
   * Template logic to determine if a option is disabled
   * @param option
   */
  isOptionDisabled(option: FieldItemOption): boolean {
    return this.asset.disabled[option.value];
  }


  ngOnDestroy() {
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  private _setConfigHooks() {
    this.config.triggerOnChange = (value: string | number | null) => {
      this.config.control.setValue(value);
      this.config.control.markAsPristine();
      this.config.message = '';
      this.config.control.updateValueAndValidity();
      this.onChange();
    };


    this.config.disableOption = (optionId: number) => {
      if (IsDefined(optionId)) {
        this.asset.disabled[optionId] = true;
      }
    };

    this.config.enableOption = (optionId: number) => {
      if (IsDefined(optionId)) {
        delete this.asset.disabled[optionId];
      }
    };

    this.config.setDisabled = (optionsIds: number[] = null) => {
      this.dom.setTimeout(`set-disabled`, () => {
        this.config.disabledIds = optionsIds;
        this._setDisabledIds();
      }, 0);
    };

    this.config.focusSearch = () => {
      this.dom.setTimeout(`search-focus`, () => {
        if (this.searchRef) {
          this.searchRef.nativeElement.focus();
          // this.onBubbleEvent( 'focus' );
        }
      }, 200);
    };

    this.config.setActive = (optionId) => {
      this.dom.setTimeout(`set-disabled`, () => {
        if (+optionId) {
          this.dom.active.optionId = optionId;
          delete this.asset.disabled[optionId];
        }
      }, 5);
    };

    this.config.setHeight = (height: number) => {
      this.dom.setTimeout(`set-height`, () => {
        if (+height) {
          this.config.minHeight = height;
          this.config.height = height;
        }
      }, 5);
    };

    this.config.clearSelected = () => {
      this.dom.setTimeout(`clear-selected`, () => {
        this.onAllChange(false);
      }, 0);
    };
  }

  /**
   * Set the inital dom state of the component
   * @private
   */
  private _setInitialDomState() {
    this.dom.state.helper = false;
    this.dom.state.filter = <boolean>undefined;
    this.dom.state.allOverlayEnabled = this.config.allOverlayEnabled ? true : false;
    this.dom.state.filterActivated = false;
    this.dom.state.above = <number>undefined;
    this.dom.state.below = <number>undefined;
    this.dom.state.list = <any>undefined;
    this.asset.filterActivated = false;
    this.dom.state.checkboxPosition = this.config.checkboxPosition === 'left' ? 'before' : 'after';


    this.ui.search.config = new InputConfig({
      value: '',
      helpText: this.config.helpText,
      displayErrors: false,
      label: this.config.label,
      readonly: true,
      maxlength: 255
    });


    this.ui.all.overlay = this.config.allOverlay ? new SwitchConfig({
      value: this.config.allOverlayEnabled,
      displayErrors: false,
      label: this.config.allOverlayLabel,
      disabled:this.config.disabled,
      facade: true,
      labelPosition: this.config.checkboxPosition === 'after' ? 'before' : 'after',
      patch: {
        path: '',
        field: '',
        callback: (core: CoreConfig, event: PopBaseEventInterface) => {
          this.dom.setTimeout(`overlay-callback`, async () => {
            this.dom.state.allOverlayEnabled = event.config.control.value === true;
            if (IsCallableFunction(this.config.allOverlayCallback)) {
              await this.config.allOverlayCallback(core, event);
            }
          }, 0);

        }
      }
    }) : null;


    if (!this.config.multiple) {
      this.selectionListRef.selectedOptions = new SelectionModel<MatListOption>(false);
    }

    this.asset.onFocusValue = JSON.stringify(this.config.selectedOptions);

    this._setDisabledIds();
  }


  /**
   * Set the lead mapping options that are disabled;
   * @private
   */
  private _setDisabledIds() {
    this.asset.disabled = {};
    if (IsArray(this.config.disabledIds)) {
      this.config.disabledIds.map((optionId: number) => {
        if (IsNumber(optionId)) {
          this.asset.disabled[optionId] = true;
        }
      });
    }
  }


  private _setInitialValue() {
    if (!this.config.multiple && !this.dom.active.optionId) {
      if (IsDefined(this.config.value, false)) {
        this.dom.active.optionId = this.config.value;
        if (!(IsDefined(this.config.control.value, false))) {
          this.config.control.setValue(this.config.value);
        }
      }
    } else {
      if (!(IsArray(this.config.control.value))) {
        this.config.control.setValue([]);
      }
    }
  }


  /**
   * Observes the value changes to the search and triggers the filter of the options
   * @returns void
   */
  private _setUpFilterObservable(): void {
    this.ui.search.config.control.valueChanges
      .pipe(
        debounceTime(200)
      ).subscribe((value: string) => {
      this._filterOptionList(value);
    });
  }


  /**
   * Detects if the list of options should appear above or below the select input
   * @param height
   */
  private _setListPosition(): void {
    // this.config.minHeight = this.config.minHeight;
    // this.config.minHeight = 200;
    // this.config.height = this.config.defaultHeight;
  }


  /**
   * Detects where the check all  box for a group should be unchecked, checked, or indeterminate
   * @param checked
   * @param group
   */
  private _checkGroupState(checked: boolean, group): void {
    let indeterminate = false;
    let all = true;
    if (!checked) {
      all = false;
      group.options.values.some((option) => {
        if (!option.hidden && option.selected) {
          indeterminate = true;
          return true;
        }
      });
    } else {
      group.options.values.some(option => {
        if (!option.hidden && !option.selected) {
          all = false;
          indeterminate = true;
          return true;
        }
      });
    }
    group.all = all;
    group.indeterminate = indeterminate;
  }


  /**
   * Finds only the options from the config's options that match
   * the string passed in, and returns those options.
   * Used as the filter when setting up the filteredOptions observable
   * @param string value
   * @returns FieldItemOption
   */
  private _filterOptionList(search: string): void {
    this.config.groups.map((group: SelectListGroupInterface) => {
      group.options.values.map((option) => {
        option.hidden = ObjectContainsTagSearch(option, search) ? false : true;
      });
      group.selected = group.options.values.filter((option) => {
        return !option.hidden && option.selected;
      }).length;

      group.visible = group.options.values.filter((option) => {
        return !option.hidden;
      }).length;

      const checked = group.visible === group.selected;
      this._checkGroupState(checked, group);
      try {
        this.cdr.detectChanges();
      } catch (e) {
      }
    });
  }


  /**
   * Update's the selection options in config
   * by looping through all of the currently selected items
   * in the selectionListRef.
   * @param number id
   */
  private _updateSelectedOptions() {
    this.dom.setTimeout('update-selected-options', () => {
      const selected = this.selectionListRef.selectedOptions.selected;
      let str: string[] = [];

      this.config.selectedOptions = [];
      for (const option of selected) {
        str.push(option._text.nativeElement.innerText);
        this.config.selectedOptions.push(option.value);
      }
      this.config.control.setValue(this.config.selectedOptions.slice());
      str = str.sort();
      this.config.strVal = str.join(', ');
      this.triggerOnChange();
    }, 50);
  }


  /**
   * Set up the body of the api patch
   * @param value
   * @private
   */
  protected _getPatchBody(value?: number | string | boolean | null | Object): Entity {
    const patch = <FieldItemPatchInterface>this.config.patch;
    const body = <Entity>{};
    if (this.config.all) {
      if (typeof this.config.allValue !== 'undefined') {
        body[this.config.patch.field] = this.config.allValue;
      } else if (this.config.patchGroupFk) {
        body[this.config.patch.field] = [];
        this.config.groups.map((group: SelectFilterGroupInterface) => {
          body[this.config.patch.field].push(`0:${group.groupFk}`);
        });
      } else {
        body[this.config.patch.field] = this.config.selectedOptions.length ? this.config.selectedOptions : [];
      }
    } else {
      if (this.config.multiple) {
        if (!this.config.control.value.length && typeof this.config.emptyValue !== 'undefined') {
          body[this.config.patch.field] = this.config.emptyValue;
        } else if (this.config.patchGroupFk) {
          body[this.config.patch.field] = [];
          this.config.groups.map((group: SelectFilterGroupInterface) => {
            if (group.all) {
              body[this.config.patch.field].push(`0:${group.groupFk}`);
            } else {
              group.options.values.filter((option) => {
                return option.selected;
              }).map((option) => {
                body[this.config.patch.field].push(`${option.value}:${group.groupFk}`);
              });
            }
          });
        } else {
          body[this.config.patch.field] = this.config.control.value.length ? this.config.control.value : [];
        }
      } else {
        value = typeof value !== 'undefined' ? value : this.config.control.value;
        body[this.config.patch.field] = value;
      }

      if (patch && patch.metadata) {
        for (const i in patch.metadata) {
          if (!patch.metadata.hasOwnProperty(i)) continue;
          body[i] = patch.metadata[i];
        }
      }

    }


    if (IsArray(body[this.config.patch.field], true)) body[this.config.patch.field].sort(function (a, b) {
      return a - b;
    });
    if (this.config.patch.metadata) {
      for (const i in this.config.patch.metadata) {
        if (!this.config.patch.metadata.hasOwnProperty(i)) continue;
        body[i] = this.config.patch.metadata[i];
      }
    }
    if (this.config.patch.json) body[this.config.patch.field] = JSON.stringify(body[this.config.patch.field]);
    return body;
  }
}
