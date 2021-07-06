import { FormControl, Validators } from '@angular/forms';
import { FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';

export type DateFilterPredicate = ( d: Date ) => boolean;




export interface DateConfigInterface {
  type?: 'Basic' | 'Expanded';
  bubble?: boolean;                                 // fire events
  disabled?: boolean;                               // Mark as disabled.
  displayErrors?: boolean;                          // If Error messages should be displayed.
  name?: string;                                // the entityId field name
  facade?: boolean;
  filterPredicate?: string | DateFilterPredicate;   // A function to remove certain dates
  helpText?: string;                             // On hover helper text.
  id?: string | number;                             // A number that will be included in the events so you know which field it came from.
  label?: string;                                   // Date label.
  min?: string | number | Date;                            // Field multiple_min date.
  max?: string | number | Date;                            // Field multiple_max date.
  metadata?: object;                                // Array of objects. To be passed back on the event emitter and included in a patch if desired.
  noInitialValue?: boolean;                          // Set to true to always have an empty value on load
  required?: boolean;
  session?: boolean;                                // If field value change should be stored to core entity
  sessionPath?: string;                            // If session path if not stored on root entity
  patch?: FieldItemPatchInterface;                           // If field should be auto-patched.
  tooltip?: string;                                 // Tooltip for information to show when input is focused
  transformation?: string;                          // Transform the input to match a specific case of format
  validators?: Array<Validators>;                   // Array of Validators.
  value?: string | number;                          // Initial value
  options?: object;                                 //
}


export class DateConfig implements SetControl {


  // Defaults
  type = 'Expanded';
  bubble = false;
  control: FormControl;
  displayErrors = true;
  disabled = false;
  facade?: boolean;
  filterPredicate = null;
  helpText = '';
  id = '';
  label = '';
  min = null;
  max = null;
  message = '';
  metadata;
  name = 'name';
  noInitialValue = false;
  patch: FieldItemPatchInterface;
  required?: boolean;
  session?: boolean;
  sessionPath?: string;
  showTooltip = false;
  transformation;
  tooltip = '';
  value;
  clearMessage;
  triggerOnChange;

  // No Defaults

  validators;


  constructor( params?: DateConfigInterface ){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    if( this.value ) this.value = new Date( this.value );
    if( typeof this.min === 'string'){
      this.min = new Date( this.min );
    }
    if( typeof this.max === 'string'){
      this.max = new Date( this.max );
    }
    // if( isNaN( this.max ) === false ){
    //   const maxDate = new Date();
    //   // maxDate.setDate(maxDate.getDate() - 1);
    //   maxDate.setDate( maxDate.getDate() + parseInt( this.max, 10 ) );
    //   this.max = new Date( maxDate );
    // }
    if( !this.patch ) this.patch = { field: '', duration: 750, path: '', disabled: false, businessId: 0 };
    if( this.patch.displayIndicator !== false ) this.patch.displayIndicator = true;
    if( this.noInitialValue ) this.value = '';
    if( !this.control ) this.setControl();
  }


  setControl(){
    this.control = <FormControl> ( this.disabled ? new FormControl( {
      value: this.value,
      disabled: true
    } ) : new FormControl( this.value, ( this.validators ? this.validators : [] ) ) );
  }
}
