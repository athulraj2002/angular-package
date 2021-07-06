import { FormControl, Validators } from '@angular/forms';
import { FieldItemOptions, FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';


export interface CheckboxConfigInterface {
 
  align?: string;                  // With no label, align checkbox < 'left', 'center', 'right';
  bubble?: boolean;               // fire events
  control?: FormControl;          // The form control. If not passed one will be created.
  disabled?: boolean;             // Mark as readonly.
  displayErrors?: boolean;        // If Error messages should be displayed.
  facade?: boolean;               // Sets a flag that says this fieldItems really does not exist in the backend, and should not patch to the api
  helpText?: string;            // On hover helper text.
  id?: number | string;           // A number that will be included in the events so you know which field it came from.
  label?: string;                 // Input label. A label is optional, checkbox will center inside the container without a label
  labelPosition?: string;          // Label can be positioned to be 'before' or 'after' the checkbox. Default is 'after'
  metadata?: object;              // Array of objects. To be passed back on the event emitter and included in a patch if desired.
  name?: string;               // the entityId field name
  noInitialValue?:boolean;        // Set to true to always have an empty value on load
  options?: FieldItemOptions;        // Array of FieldOptions
  patch?: FieldItemPatchInterface;         // If field should be auto-patched.
  session?: boolean;                // If field value change should be stored to core entity
  sessionPath?: string;                // If session path if not stored on root entity
  tabOnEnter?:boolean;
  textOverflow?:'wrap' | 'ellipsis';   // Set the text overflow behavior, default wrap
  validators?: Array<Validators>; // Array of Validators.
  value?: number | boolean;        // Initial value.
}


export class CheckboxConfig implements SetControl {

  align = 'right';
  bubble = false;
  control: FormControl;
  disabled = false;
  displayErrors = true;
  facade = false;
  helpText = '';
  id: number | string = '';
  label = '';
  labelPosition = 'after';
  message = '';
  metadata;
  name = 'name';
  noInitialValue = false;
  options?: FieldItemOptions = { values: [] };
  patch;
  patchSuccess;
  patchFail;
  session?: boolean;
  sessionPath?: string;
  startPatch;
  tabOnEnter = false;
  toolTipDirection = 'right';
  textOverflow = 'wrap';
  value: number | boolean = false;
  validators;

  constructor(params?: CheckboxConfigInterface){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    if( this.label ){
      this.toolTipDirection = this.labelPosition === 'after' ? 'right' : 'left';
    }else{
      this.toolTipDirection = 'above';
    }
    if( [ 'left', 'center', 'right', ].indexOf(this.align) === -1 ) this.align = 'center';
    if( !this.patch ) this.patch = { field: '', path: '', disabled: false, businessId: 0  };
    if( this.patch.displayIndicator !== false ) this.patch.displayIndicator = true;
    if( this.noInitialValue ) this.value =  null;
    if( !this.control ) this.setControl();
  }


  setControl(){
    this.control = this.disabled === true ? new FormControl({
      value: this.value,
      disabled: this.disabled
    }) : new FormControl(this.value, ( this.validators ? this.validators : [] ));
  }

}
