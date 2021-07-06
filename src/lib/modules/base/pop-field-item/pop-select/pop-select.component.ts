import {Component, ElementRef, Input, OnDestroy, OnInit} from '@angular/core';
import {SelectConfig} from './select-config.model';
import {PopFieldItemComponent} from '../pop-field-item.component';
import {InputConfig} from '../pop-input/input-config.model';
import {IsCallableFunction, IsObject, IsObjectThrowError} from '../../../../pop-common-utility';


@Component({
  selector: 'lib-pop-select',
  templateUrl: './pop-select.component.html',
  styleUrls: ['./pop-select.component.scss']
})
export class PopSelectComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
  @Input() config: SelectConfig = new SelectConfig();
  name = 'PopSelectComponent';

  optionsTopPos = '-5px';

  ui = {selected: {config: undefined}};


  constructor(
    public el: ElementRef,
  ) {
    super();

    this.dom.configure = (): Promise<boolean> => {
      return new Promise(async (resolve) => {

        await Promise.all([
          this._setInitialConfig(),
          this._setConfigHooks(),
          this._initialFauxControl()
        ]);

        resolve(true);
      });
    };


    this.dom.proceed = (): Promise<boolean> => {
      return new Promise((resolve) => {
        this.dom.setTimeout('check-existing-value', () => {
          if (!this.config.control.value && this.config.autoFill && this.config.required) {
            if (this.config.options.values.length === 1) {
              if (IsCallableFunction(this.config.triggerOnChange)) {
                const existingValue = this.config.options.values[0].value;
                this.config.triggerOnChange(existingValue);
              }
            }
          }
        }, 0);
        resolve(true);
      });
    };

  }


  ngOnInit() {
    super.ngOnInit();
  }


  /**
   * SelectsOption
   * @param optionValue: option value selected
   */

  onOptionSelected(optionValue: string | number): void {
    this.config.control.setValue(optionValue);
    this.dom.state.displayItems = false;
    this.ui.selected.config.label = this.config.label;
    this.onBlur();
  }


  /**
   *  Select Box clicked
   *  @returns void
   */
  onSelectionClick($event): void {
    if (!this.config.readonly && this.config.control.status !== 'DISABLED') {

      // determine display direction and top offset
      const thirdHeight = window.innerHeight / 3;

      if ($event.clientY < (thirdHeight * 2)) {
        this.dom.state.displayBottom = true;
        this.optionsTopPos = '-5px';
        this.ui.selected.config.selectModeOptionsDirection = 'down';
      } else {
        this.dom.state.displayBottom = false;
        let offset = (44 + (this.config.options.values.length * 48));

        offset = offset > 284 ? 284 : offset;

        this.optionsTopPos = `-${offset}px`;
        this.ui.selected.config.label = ' ';
        this.ui.selected.config.selectModeOptionsDirection = 'up';
      }

      if (this.dom.state.displayItems) {
        this.dom.state.displayItems = false;
        this.ui.selected.config.label = this.config.label;
        this.onBlur();
      } else {
        this.dom.state.displayItems = true;
        this.onFocus();
      }
    }
  }


  /**
   * Closes the dropdown if it is active.
   * This method is called from the ClickOutside directive.
   * If the user clicks outside of the component, it will close
   * @returns void
   */
  public onOutsideCLick(): void {
    this.dom.state.displayItems = false;
    this.ui.selected.config.label = this.config.label;
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
   * Set the initial config for this component
   * @private
   */
  private _setInitialConfig(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.dom.state.displayItems = false;
      this.dom.state.displayBottom = true;
      this.config = IsObjectThrowError(this.config, true, `Config required`) ? this.config : null;
      this.id = this.config.name;
      return resolve(true);
    });
  }

  /**
   * Set the config hooks for this component
   * @private
   */
  private _setConfigHooks(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.config.triggerOnChange = (value: string | number | null) => {

        this.dom.setTimeout(`config-trigger-change`, () => {
          // this.cdr.detectChanges();
          this._setStrVal(value);
          this.onChange(value, true);
        }, 0);
      };

      this.config.clearMessage = () => {
        this.dom.setTimeout(`config-clear-message`, () => {
          this.config.message = '';
          this.config.control.markAsPristine();
          this.config.control.markAsUntouched();
          // this.cdr.detectChanges();
        }, 0);
      };
      return resolve(true);
    });
  }


  /**
   * Initialize Faux control ( used to display string value of select ). Subscribes to actual control value changes to update value.
   */

  private _initialFauxControl(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.ui.selected.config = new InputConfig({
        value: '',
        disabled: this.config.disabled ? this.config.disabled : null,
        helpText: this.config.helpText,
        displayErrors: false,
        label: this.config.label,
        readonly: true,
        selectMode: true,
        minimal: this.config.minimal,
        maxlength: 65000
      });

      this._setStrVal((<any>this.config.value));


      this.dom.setSubscriber(`value-changes`, this.config.control.valueChanges.subscribe((value) => {
        this._setStrVal((<any>value));
      }));

      this.dom.setSubscriber(`status-changes`, this.config.control.statusChanges.subscribe((status) => {
        this.ui.selected.config.control.status = status;
      }));

      return resolve(true);
    });
  }


  private _setStrVal(value: number | string): void {
    if (value || value == '') { // code change by chetu developer on 16-05-2021
      const selected = this.config.options.values.find((o) => o.value === value);
      if (IsObject(selected, ['name'])) {
        this.ui.selected.config.control.setValue(selected.name);
      } else {
        this.ui.selected.config.control.setValue('');
      }
    } else {
      this.ui.selected.config.control.setValue(null);
    }
  }
}
