import { FormControl, Validators } from '@angular/forms';
import { FieldItemOption, FieldItemOptions, FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';


export interface RadioConfigInterface {
  bubble?: boolean;               // fire events
  control?: FormControl;          // The form control. If not passed one will be created.
  disabled?: boolean;             // Mark as readonly.
  displayErrors?: boolean;        // If Error messages should be displayed.
  emptyOption?: FieldItemOption;      // Sets an empty or a null option value as the first option
  facade?: boolean;               // Sets a flag that says this fieldItems really does not exist in the backend, and should not patch to the api
  helpText?: string;            // On hover helper text.
  id?: number | string;           // A number that will be included in the events so you know which field it came from.
  label?: string;                 // Input label.
  labelPosition?: string;         // 'above' (default) 'inline' (Left of selection)
  layout?: string;                // Default to 'row'. Set to 'name' to display options vertically
  metadata?: object;              // Array of objects. To be passed back on the event emitter and included in a patch if desired.
  name?: string;              // the entityId field name
  noInitialValue?: boolean;        // Set to true to always have an empty value on load
  options?: FieldItemOptions;        // Array of FieldOptions
  patch?: FieldItemPatchInterface;         // If field should be auto-patched.
  session?: boolean;                // If field value change should be stored to core entity
  sessionPath?: string;                // If session path if not stored on root entity
  sort?: boolean;                 //  Set to true if you want options to be sorted in priority of sort_order, name
  validators?: Array<Validators>; // Array of Validators.
  value?: boolean | string | number;        // Initial value.
}


export class RadioConfig implements SetControl {
  bubble = false;
  control: FormControl;
  clearMessage;
  disabled = false;
  displayErrors = true;
  facade = false;
  helpText = '';
  id: number | string;
  label = '';
  labelPosition = 'above';
  layout = 'row';
  message = '';
  metadata;
  noInitialValue = false;
  name = 'name';
  options: FieldItemOptions;
  patch: FieldItemPatchInterface;
  reset? = false;
  session?: boolean;
  sessionPath?: string;
  sort? = false;
  triggerOnChange;
  validators;
  value?: boolean | string | number = '';


  constructor( params?: RadioConfigInterface ){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    if( this.sort && this.options.values.length > 1 ){
      if( typeof this.options.values[ 0 ].sort_order !== 'undefined' ){
        this.options.values.sort( ( a, b ) => {
          if( a.sort_order < b.sort_order ) return -1;
          if( a.sort_order > b.sort_order ) return 1;
          return 0;
        } );
      }else{
        this.options.values.sort( ( a, b ) => {
          if( a.name < b.name ) return -1;
          if( a.name > b.name ) return 1;
          return 0;
        } );
      }
    }
    if( this.layout !== 'column' ) this.layout = 'row';

    if( !this.patch ) this.patch = { field: '', duration: 750, path: '', disabled: false, businessId: 0 };
    if( !this.disabled ) this.disabled = false;
    if( this.patch.displayIndicator !== false ) this.patch.displayIndicator = true;
    if( this.noInitialValue ) this.value = '';
    if( !this.control ) this.setControl();
  }


  setControl(){
    if( !this.control ){
      this.control = ( this.disabled === true
        ? new FormControl( {
          value: this.value,
          disabled: this.disabled
        } )
        : new FormControl( this.value, ( this.validators ? this.validators : [] ) ) );
    }
  }
}
