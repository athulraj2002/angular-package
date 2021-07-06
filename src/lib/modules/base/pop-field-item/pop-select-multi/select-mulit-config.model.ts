import { FormControl, Validators } from '@angular/forms';
import { FieldItemOptions, FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';


export interface SelectMultiConfigInterface {
  bubble?: boolean;               // fire events
  column?: string;              // the entityId field name
  control?: FormControl;          // The form control. If not passed one will be created.
  displayErrors?: boolean;        // If Error messages should be displayed.
  disabled?: boolean;             // Mark as readonly.
  facade?:boolean;
  helpText?: string;            // On hover helper text.
  id?: number | string;           // A number that will be included in the events so you know which field it came from.
  label?: string;                 // Input label.
  metadata?: object;              // Array of objects. To be passed back on the event emitter and included in a patch if desired.
  minimal?: boolean;              // Allows the input to fit in a tighter space, removes indicators and padding
  noInitialValue?:boolean;         // Set to true to always have an empty value on load
  options?: FieldItemOptions;        // Array of FieldOptions
  patch?: FieldItemPatchInterface;         // If field should be auto-patched.
  session?: boolean;                // If field value change should be stored to core entity
  sessionPath?: string;                // If session path if not stored on root entity
  sort?: boolean;                 //  Set to true if you want options to be sorted in priority of sort_order, name
  tooltip?: string;               // Tooltip for information to show when input is focused
  validators?: Array<Validators>; // Array of Validators.
  value?: Array<number | string>;   // Initial value.
}


export class SelectMultiConfig implements SetControl {
  bubble = false;
  clearMessage;
  control: FormControl;
  displayErrors = true;
  disabled = false;
  facade = false;
  helpText = '';
  id;
  label = '';
  minimal?: false;
  metadata;
  message = '';
  noInitialValue = false;
  name = 'name';
  options?: FieldItemOptions;
  patch: FieldItemPatchInterface;
  route;
  session?: boolean;
  sessionPath?: string;
  sort: false;
  showTooltip = false;
  tooltip = '';
  triggerOnChange: CallableFunction;
  validators;
  value;


  constructor( params?: SelectMultiConfigInterface ){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    this.value = Array.isArray( this.value ) ? this.value : [];
    if( !this.options ) this.options = { values: [] };
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

    if( !this.patch ) this.patch = { field: '', duration: 750, path: '', disabled: false };
    if( this.patch.displayIndicator !== false ) this.patch.displayIndicator = true;
    if( this.noInitialValue ) this.value = [];
    if( !this.control ) this.setControl();
  }


  setControl(){
    this.control = ( this.disabled ? new FormControl( {
      value: this.value,
      disabled: true
    } ) : new FormControl( this.value, ( this.validators ? this.validators : [] ) ) );
  }
}
