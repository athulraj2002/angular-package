import { FormControl } from '@angular/forms';
import { FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';
import { NumberConfig } from '../pop-number/number-config.model';
import { SwitchConfig } from '../pop-switch/switch-config.model';


export interface MinMaxConfigInterface {
  allowNegative?: boolean;
  bubble?: boolean;               // fire events
  disabled?: boolean;             // Mark as disabled.
  displayErrors?: boolean;        // If Error messages should be displayed.
  helpText?: string;            // On hover helper text.
  id?: string | number;           // A number that will be included in the events so you know which field it came from.
  facade?: boolean;
   
  label?: string;                 // Input label.
  limit?: number;             // Field multiple_max length.
  minValue?: number;
  maxValue?: number;

  minReadonly?: boolean;
  maxReadonly?: boolean;

  min?: number;
  max?: number;


  minRequired?: boolean;
  maxRequired?: boolean;

 
  minColumn?: string;              // Override the patch name for multiple_min
  maxColumn?: string;              // Override the patch name for multiple_max
  minimal?: boolean;
  minLabel?: string;              // Override the patch name for multiple_min
  maxLabel?: string;              // Override the patch name for multiple_max
  metadata?: object;              // Array of objects. To be passed back on the event emitter and included in a patch if desired.
  patch?: FieldItemPatchInterface; // If field should be auto-patched.
  session?: boolean;                // If field value change should be stored to core entity
  sessionPath?: string;            // If session path if not stored on root entity
  tooltip?: string;               // Tooltip for information to show when input is focused
}


export class MinMaxConfig implements SetControl {
  // Defaults

  allowNegative? = false;
  bubble = false;
  control;

  disabled = false;
  facade = false;
  helpText = '';
  id = '';
  isMinConfig: SwitchConfig;
  isMaxConfig: SwitchConfig;
  label = 'Min/Max';
  limit = 100;
  minValue = 1;
  maxValue = 10;

  min = 1;
  max = 10;

  minColumn = 'min';
  maxColumn = 'max';

  minReadonly = false;
  maxReadonly = false;

  minConfig: NumberConfig;

  minRequired? = false;

  maxConfig: NumberConfig;

  maxRequired? = false;

  minDefaultValue? = 1;
  maxDefaultValue? = 1;

  minLabel = 'Minimum';
  maxLabel = 'Maximum';

  minimal: false;
  metadata;
  message = '';
  name;
  pattern;
  patch: FieldItemPatchInterface;
  session?: boolean;
  sessionPath?: string;
  showTooltip = false;
  tooltip = '';
  triggerOnChange;
  transformation;
  validators;
  value = '';

  // No Defaults







  constructor(params?: MinMaxConfigInterface){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    if( !this.patch ) this.patch = { field: '', duration: 750, path: '', disabled: false };
    if( this.patch.displayIndicator !== false ) this.patch.displayIndicator = true;

    // const maxOptions = [];
    // let maxLimit = this.limit;
    // while( maxLimit ){
    //   maxOptions.push({ value: maxLimit, name: maxLimit, sort: maxLimit });
    //   maxLimit--;
    // }

    if( this.limit && this.maxValue > this.limit ) this.maxValue = +this.limit;

    this.isMaxConfig = new SwitchConfig({
      label: this.maxLabel,
      value: +this.maxValue ? true : this.maxRequired ? true : false,
      disabled: this.maxRequired ? true : false,
      bubble: true,
      facade: false,
      labelPosition: 'after',
    });

    this.maxConfig = new NumberConfig({
      label: null,
      value: +this.maxValue,
      min: this.min,
      max: this.max,
      readonly: this.maxReadonly,
      facade: true,
      minimal: true,
      bubble: true,
    });

    if( this.minValue > this.maxValue ) this.minValue = this.maxValue;

    // let minLimit = this.maxValue;
    // const minOptions = [];
    // while( minLimit ){
    //   minOptions.push({ value: minLimit, name: minLimit, sort: minLimit });
    //   minLimit--;
    // }


    this.isMinConfig = new SwitchConfig({
      label: this.minLabel,
      value: +this.minValue ? true : this.minRequired ? true : false,
      disabled: this.minRequired ? true : false,
      bubble: true,
      facade: false,
      labelPosition: 'after',
    });

    this.minConfig = new NumberConfig({
      label: null,
      value: +this.minValue,
      min: this.min,
      max: this.max,
      readonly: this.minReadonly,
      facade: true,
      minimal: true,
      bubble: true,
    });


    if( !this.control ) this.setControl();

  }


  setControl(){
    this.control = ( this.disabled ? new FormControl({
      value: { min: this.minValue, max: this.maxValue },
      disabled: true
    }) : new FormControl(this.value, ( this.validators ? this.validators : [] )) );
  }
}
