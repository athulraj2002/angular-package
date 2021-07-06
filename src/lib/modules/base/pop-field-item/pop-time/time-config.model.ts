import { FormControl, Validators } from '@angular/forms';
import { FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';


export interface TimeConfigInterface {
  bubble?: boolean;               // fire events
  control?: FormControl;          // The form control. If not passed one will be created.
  disabled?: boolean;             // Mark as disabled.
  displayErrors?: boolean;        // If Error messages should be displayed.
  facade?: boolean;               // Sets a flag that says this fieldItems really does not exist in the backend, and just pretend to hit the api
  helpText?: string;           // On hover helper text.
  interval: 1 | 5 | 10 | 15;      // Minute interval
  id?: string | number;           // A number that will be included in the events so you know which field it came from.
  label?: string;                 // Time label.
  metadata?: object;              // Array of objects. To be passed back on the event emitter and included in a patch if desired.
  name?: string;              // the entityId field name
  noInitialValue?: boolean;        // Set to true to always have an empty value on load
  patch?: FieldItemPatchInterface;         // If field should be auto-patched.
  readonly?: boolean;             // Mark as readonly.
  session?: boolean;                // If field value change should be stored to core entity
  sessionPath?: string;                // If session path if not stored on root entity
  tooltip?: string;               // Tooltip for information to show when input is focused
  time: 12 | 24;                  // Selectable times
  transformation?: string;        // Transform the input to match a specific case of format
  validators?: Array<Validators>; // Array of Validators.
  value?: string | number;        // Initial value.
}


export class TimeConfig implements SetControl {
  // Defaults
  bubble = false;
  control;
  displayErrors = true;
  disabled = false;
  facade = false;
  helpText = '';
  id = '';
  label = '';
  message = '';
  metadata;
  name = 'name';
  noInitialValue = false;
  patch: FieldItemPatchInterface;
  showTooltip = false;
  readonly = false;
  session?: boolean;
  sessionPath?: string;
  tooltip = '';
  transformation;
  triggerOnChange;
  time: 12 | 24 = 12;
  interval: 1 | 5 | 10 | 15 = 15;
  value = '';
  validators;
  // No Defaults


  constructor( params?: TimeConfigInterface ){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    if( !this.patch ) this.patch = { field: '', duration: 750, path: '', disabled: false, businessId: 0 };
    if( this.patch.displayIndicator !== false ) this.patch.displayIndicator = true;
    if( !this.readonly ) this.readonly = false;
    if( this.noInitialValue ) this.value = '';
    if( !this.control ) this.setControl();

  }


  setControl(){
    this.control = ( this.disabled ? new FormControl( {
      value: this.value,
      disabled: true
    } ) : new FormControl( this.value, ( this.validators ? this.validators : [] ) ) );
  }
}
