import { FormControl, Validators } from '@angular/forms';
import { EventPromiseCallback, FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';


export interface InputConfigInterface {
  autofocus?:boolean;
  autoselect?:boolean;
  bubble?: boolean;               // fire events
  conceal?: boolean;              // Mask the input as dots

  control?: FormControl;          // The form control. If not passed one will be created.

  dropSpecial?: boolean;
  disabled?: boolean;             // Mark as disabled.
  displayErrors?: boolean;        // If Error messages should be displayed.
  empty?: 'ConvertEmptyToNull' | 'ConvertEmptyToZero';
  facade?: boolean;
  helpText?: string;            // On hover helper text.
  hintText?: string;
  hidden?: boolean;               // Hide input.
  hint?: boolean;
  id?: string | number;           // A number that will be included in the events so you know which field it came from.
  label?: string;                 // Input label.

  minimal?: boolean;              // Allows the input to fit in a tighter space, removes indicators and padding
  mask?: string;                  // ngxMask expression
  maxlength?: number;             // Field multiple_max length.
  metadata?: object;              // Array of objects. To be passed back on the event emitter and included in a patch if desired.
  name?: string;                 // name of column
  noInitialValue?: boolean;        // Set to true to always have an empty value on load
  onEnter?:EventPromiseCallback;
  patch?: FieldItemPatchInterface; // If field should be auto-patched.
  pattern?: string;               // Character type limiter.
  prefix?: string;                // Prefix Character
  prevent?: any[];
  readonly?: boolean;             // Mark as readonly.
  required?: boolean;
  session?: boolean;                // If field value change should be stored to core entity
  sessionPath?: string;                // If session path if not stored on root entity
  showMask?: boolean;
  specialChars?: string[];        // New default characters for mask
  suffix?: string;                // Suffix Character
  selectMode?: boolean;               // Marks input html to mimic disabled select input : ie.. pop a modal when input is clicked, set an onclick event function to on component tag to call a certain function
  selectModeOptionsDirection?: 'up' | 'down';
  tooltip?: string;               // Tooltip for information to show when input is focused
  tabOnEnter?: boolean;           // Convert enter to a tab when control is valid, default is false ie .. set to true when you want to moved down a form list
  type?: 'text' | 'password' | 'email';     // HTML input type.
  transformation?: any;// Transform the input to match a specific case of format 'title' | 'lower' | 'upper' | 'ConvertEmptyToNull' | 'ConvertEmptyToZero'
  validators?: Array<Validators>; // Array of Validators.
  value?: boolean | string | number;        // Initial value.

}


export class InputConfig implements SetControl {
  // Defaults
  autofocus = false;
  autoselect = false;
  bubble = false;
  conceal = false;
  displayErrors = true;
  disabled = false;
  dropSpecial = true;
  empty;
  facade? = false;
  helpText = '';
  hintText = '';
  hidden = false;
  hint = false;
  id = '';
  label = '';
  maxlength = 129;
  mask = null;
  minimal = false;
  message = '';
  name = 'name';
  noInitialValue = false;
  onEnter?:EventPromiseCallback;
  patch: FieldItemPatchInterface;
  prefix = '';
  prevent?: any[];
  readonly = false;
  required?: boolean;
  showMask = false;
  showTooltip = false;
  suffix = '';
  selectMode = false;
  selectModeOptionsDirection = 'down';
  session?: boolean;
  sessionPath?: string;
  specialChars = [ '-', '/', '(', ')', '.', ':', ' ', '+', ',', '@', '[', ']' ];
  tooltip = '';
  type = 'text';
  tabOnEnter = false;
  value?: boolean | string | number = '';


  // No Defaults
  control;
  clearMessage;
  metadata;
  pattern;
  setType;
  transformation;
  triggerOnChange;
  triggerDirectPatch;
  validators;


  constructor( params?: InputConfigInterface ){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    if( !this.patch ) this.patch = { field: '', path: '', duration: 750, disabled: false, businessId: 0 };
    if( this.patch.displayIndicator !== false ) this.patch.displayIndicator = true;
    if( !this.readonly ) this.readonly = false;
    if( this.selectMode ) this.readonly = true; // input is mimicking a select box to a trigger  modal functionality
    if( this.noInitialValue ) this.value = '';
    if( !this.control ) this.setControl();
    if( this.mask ){
      this.maxlength = null;
      this.hint = false;
      this.pattern = null;
    }
  }


  setControl(){
    this.control = ( this.disabled ? new FormControl( {
      value: this.value,
      disabled: true
    } ) : new FormControl( this.value, ( this.validators ? this.validators : [] ) ) );
  }
}
