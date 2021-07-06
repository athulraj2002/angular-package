import { FormControl, Validators } from '@angular/forms';
import { FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';


export interface TextareaConfigInterface {
  autoSize?: boolean;           // Auto Adjust the height to fit content
  bubble?: boolean;               // fire events
  column?: string;              // the entityId field name
  control?: FormControl;          // The form control. If not passed one will be created.
  displayErrors?: boolean;        // If Error messages should be displayed.
  disabled?: boolean;             // Mark as disabled.
  facade?: boolean;               // Sets a flag that says this fieldItems really does not exist in the backend, and should not patch to the api
  helpText?: string;            // On hover helper text.
  height?: number;                // Set a fixed height for the text area otherwise container will auto expand
  hint?: boolean;                 // If remaining of available characters should be displayed
  id?: string | number;           // A number that will be included in the events so you know which field it came from.
  label?: string;                 // Input label.
  maxHeight?: number;                // Set a fixed height for the text area otherwise container will auto expand
  maxlength?: number;             // Field multiple_max length.
  metadata?: object;              // Array of objects. To be passed back on the event emitter and included in a patch if desired.
  name?: string;
  noInitialValue?:boolean;        // Set to true to always have an empty value on load
  patch?: FieldItemPatchInterface;         // If field should be auto-patched.
  readonly?: boolean;             // Mark as readonly.
  session?: boolean;                // If field value change should be stored to core entity
  sessionPath?: string;                // If session path if not stored on root entity
  tooltip?: string;               // Tooltip for information to show when input is focused
  validators?: Array<Validators>; // Array of Validators.
  value?: boolean | string | number;        // Initial value.
}


export class TextareaConfig implements SetControl{
  autoSize = false;
  bubble = false;
  control: FormControl;
  _disabled = false;
  displayErrors = true;
  facade = false;
  helpText = '';
  height = 0;
  maxHeight = null;
  hint = false;
  id: number | string;
  label: string;
  message = '';
  metadata;
  maxlength = 1024;
  name = 'name';
  noInitialValue = false;
  patch:FieldItemPatchInterface;
  readonly = false;
  session?: boolean;
  sessionPath?: string;
  showTooltip = false;
  tabOnEnter = false;
  tooltip = '';
  validators;
  value:boolean | string | number = '';


  constructor(params?: TextareaConfigInterface){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    // if( this.height && !isNaN(Number(this.height)) ) this.height = this.height + 'px';
    if( !this.patch ) this.patch = { field: '', duration: 750, path: '', disabled: false , businessId: 0 };
    if( this.patch.displayIndicator !== false ) this.patch.displayIndicator = true;
    if( this.noInitialValue) this.value = '';
    if( !this.control ) this.setControl();
  }

  setControl(){
    this.control = ( this.disabled ? new FormControl({
      value: this.value,
      disabled: true
    }) : new FormControl(this.value, ( this.validators ? this.validators : [] )) );
  }

  get disabled():boolean{
    return this._disabled;
  }

  set disabled(value){
    this._disabled = value;
    if(value === true){
      this.control.disable();
    }else if (value === false){
      this.control.enable();
    }
  }

}
