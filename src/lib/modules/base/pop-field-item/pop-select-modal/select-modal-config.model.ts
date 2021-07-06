import { SelectListConfig } from '../pop-select-list/select-list-config.model';
import { FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';
import { FormControl, ValidatorFn } from '@angular/forms';


export interface SelectModalConfigInterface {
  bubble?: boolean;                 // Bubble Events
  disabled?: boolean;               // Mark as readonly.
  displayErrors?: boolean;         // If Error messages should be displayed.
  facade?: boolean;                                       // Sets a flag that says this fieldItems really does not exist in the backend, and just pretend to hit the api
  header?: string;                   // Header of the modal
  label?: string;                 // label of input trigger field
  subLabel?: string;                 // label of input trigger field
  list?: SelectListConfig;           // the selection list inside the modal
  patch?: FieldItemPatchInterface;            // If field should be auto-patched.
  metadata?: object;                                  // Array of objects. To be passed back on the event emitter and included in a patch if desired.
  noInitialValue?: boolean;                                // Set to true to always have an empty value on load
  value?: Array<number | string> | number | string;                         // Initial value.
  validators?: Array<ValidatorFn>;
}


export class SelectModalConfig implements SetControl {
  control: FormControl;
  displayErrors? = true;
  disabled = false;
  facade? = false;                                       // Sets a flag that says this fieldItems really does not exist in the backend, and just pretend to hit the api
  header = '';
  list: SelectListConfig;
  label = '';
  metadata?: object;                                  // Array of objects. To be passed back on the event emitter and included in a patch if desired.
  noInitialValue = false;                                // Set to true to always have an empty value on load
  patch: FieldItemPatchInterface;
  triggerOpen;
  validators?: Array<ValidatorFn>;
  value?: Array<number | string> | number | string;                         // Initial value.


  constructor( params?: SelectModalConfigInterface ){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    // if( !this.label ) this.label = 'Options';
    if( !this.patch ) this.patch = { field: '', duration: 750, path: '', disabled: false, json: false };
    if( this.patch.displayIndicator !== false ) this.patch.displayIndicator = true;
    if( this.noInitialValue ) this.value = this.list.multiple ? [] : '';
    if( !this.control ) this.setControl();
  }


  setControl(){
    this.control = ( this.disabled ? new FormControl( {
      value: this.value,
      disabled: false
    } ) : new FormControl( this.value, ( this.validators ? this.validators : [] ) ) );
  }
}

