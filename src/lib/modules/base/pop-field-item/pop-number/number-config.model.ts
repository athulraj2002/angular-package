import { FormControl, Validators } from '@angular/forms';
import { FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';


export interface NumberConfigInterface {
  bubble?: boolean;               // fire events
  column?: string;              // the entityId field name
  control?: FormControl;          // The form control. If not passed one will be created.
  readonly?: boolean;             // Mark as readonly.
  disabled?: boolean;             // Mark as disabled.
  displayErrors?: boolean;        // If Error messages should be displayed.
  dropSpecial?: boolean;
  facade?: boolean;
  helpText?: string;            // On hover helper text.
  hidden?: boolean;               // Hide input.
  id?: string | number;           // A number that will be included in the events so you know which field it came from.
  label?: string;                 // Input label.
  metadata?: object;              // Array of objects. To be passed back on the event emitter and included in a patch if desired.
  minimal?: boolean;              // Allows the input to fit in a tighter space, removes indicators and padding
  min?: number;             // Field multiple_max length.
  max?: number;             // Field multiple_max length.
  noInitialValue?:boolean;        // Set to true to always have an empty value on load
  name?: string;
  patch?: FieldItemPatchInterface; // If field should be auto-patched.
  prefix?: string;
  session?: boolean;                // If field value change should be stored to core entity
  sessionPath?: string;                // If session path if not stored on root entity
  suffix?: string;
  step?: number;
  showMask?: boolean;
  tooltip?: string;               // Tooltip for information to show when input is focused
  transformation?: any;// Transform the input to match a specific case of format 'title' | 'lower' | 'upper' | 'ConvertEmptyToNull' | 'ConvertEmptyToZero'
  validators?: Array<Validators>; // Array of Validators.
  value?: boolean | string | number;        // Initial value.

}


export class NumberConfig implements SetControl {
  // Defaults
  bubble = false;
  control;
  dropSpecial = true;
  displayErrors = true;
  disabled = false;
  facade? = false;
  helpText = '';
  hidden = false;
  id = '';
  label = '';
  message = '';
  min? = 1;
  max? = 100;
  metadata;
  minimal = false;
  maxlength;
  mask = '0*';
  name = 'name';
  noInitialValue = false;
  pattern = 'Numeric';
  patch: FieldItemPatchInterface;
  prefix = '';
  readonly = false;
  session?: boolean;
  sessionPath?: string;
  showTooltip = false;
  specialChars = [ '$', ' ', ',', '%' ];
  showMask = false;
  suffix = '';
  step? = 1;
  tooltip = '';
  transformation;
  triggerOnChange;
  triggerDirectPatch;
  value?: boolean | string | number = '';
  validators;
  
  

  // No Defaults



  constructor(params?: NumberConfigInterface){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    if( !this.patch ) this.patch = { field: '', duration: 750, path: '', disabled: false, businessId: 0 };
    if( this.patch.displayIndicator !== false ) this.patch.displayIndicator = true;
    if( !this.readonly ) this.readonly = false;

    if( this.min > this.max ) this.min = this.max;
    if( this.max < this.min ) this.max = this.min;
    this.maxlength = String(this.max).length;

    if( this.value ){
      if( this.value < this.min ) this.value = this.min;
      if( this.value > this.max ) this.value = this.max;
    }
    if( this.noInitialValue ) this.value =  '';
    if( !this.control ) this.setControl();
  }


  setControl(){
    this.control = ( this.disabled ? new FormControl({
      value: this.value,
      disabled: true
    }) : new FormControl(this.value, ( this.validators ? this.validators : [] )) );
  }
}
