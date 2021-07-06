import { FormControl, Validators } from '@angular/forms';
import { FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';


export interface SwitchConfigInterface {
  bubble?: boolean;               // fire events
  control?: FormControl;          // The form control. If not passed one will be created.
  disabled?: boolean;             // Mark as readonly.
  displayErrors?: boolean;        // If Error messages should be displayed.
  empty?: 'ConvertEmptyToNull' | 'ConvertEmptyToZero';
  facade?: boolean;               // Sets a flag that says this fieldItems really does not exist in the backend, and should not patch to the api
  helpText?: string;            // On hover helper text.
  id?: number | string;           // A number that will be included in the events so you know which field it came from.
  label?: string;                 // Input label. A label is optional, checkbox will center inside the container without a label
  labelPosition?: string;          // Label can be positioned to be 'before' or 'after' the checkbox. Default is 'after'
  metadata?: object;              // Array of objects. To be passed back on the event emitter and included in a patch if desired.
  name?: string;
  noInitialValue?:boolean;                                // Set to true to always have an empty value on load
  patch?: FieldItemPatchInterface;         // If field should be auto-patched.
  tabOnEnter?:boolean;
  padding?: string;               // padding adjustment
  session?: boolean;                // If field value change should be stored to core entity
  sessionPath?: string;                // If session path if not stored on root entity
  textOverflow?:'wrap' | 'ellipsis';   // Set the text overflow behavior, default wrap
  tooltip?: string;
  validators?: Array<Validators>; // Array of Validators.
  value?: boolean | number | string;        // Initial value.

}


export class SwitchConfig implements SetControl {
  bubble = false;
  control: FormControl;
  disabled = false;
  displayErrors = true;
  empty?: 'ConvertEmptyToNull' | 'ConvertEmptyToZero';
  facade = false;
  helpText = '';
  id: number | string;
  label = '';
  labelPosition = 'after';
  message = '';
  metadata;
  noInitialValue = false;
  name? = 'name';
  patch: FieldItemPatchInterface;
  padding = '0';
  session?: boolean;
  sessionPath?: string;
  setValue;
  switchRef;
  triggerOnChange;
  tooltip: string;
  toolTipDirection = 'right';
  tabOnEnter = false;
  textOverflow = 'wrap';
  validators;
  value: boolean | number | string = false;


  constructor(params?: SwitchConfigInterface){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    this.value = +this.value === 1 ? true : false;
    this.labelPosition = [ 'before', 'after' ].indexOf(this.labelPosition) >= 0 ? this.labelPosition : 'after';
    if( this.label ){
      if( this.labelPosition === 'after' ){
        this.toolTipDirection = 'right';
      }
    }else{
      this.toolTipDirection = 'above';
    }
    if( !this.patch ) this.patch = { field: '', duration: 750, path: '', disabled: false , businessId: 0 };
    if( !this.disabled ) this.disabled = false;
    if( this.patch.displayIndicator !== false ) this.patch.displayIndicator = true;
    if( !this.control ) this.setControl();
  }


  setControl(){
    this.control = this.disabled === true ? new FormControl({
      value: this.value,
      disabled: this.disabled
    }) : new FormControl(this.value, ( this.validators ? this.validators : [] ));
  }

}

