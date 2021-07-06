import { FormControl, Validators } from '@angular/forms';
import { FieldItemOption, FieldItemOptions, FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';


export interface SelectConfigInterface {
  autoFill?: boolean;
  bubble?: boolean;               // fire events
  control?: FormControl;          // The form control. If not passed one will be created.
  disabled?: boolean;             // Mark as readonly.
  displayErrors?: boolean;        // If Error messages should be displayed.
  emptyOption?: FieldItemOption;      // Sets an empty or a null option value as the first option
  empty?: 'ConvertEmptyToNull' | 'ConvertEmptyToZero';
  facade?: boolean;               // Sets a flag that says this fieldItems really does not exist in the backend, and just pretend to hit the api
  helpText?: string;           // On hover helper text.
  height?: number;
  hidden?: boolean;                // Hide a field by setting to true;
  id?: number | string;           // A number that will be included in the events so you know which field it came from.
  label?: string;                 // Input label.
  metadata?: object;              // Array of objects. To be passed back on the event emitter and included in a patch if desired.
  mode?: 'select' | 'label';
  minimal?: boolean;              // Allows the input to fit in a tighter space, removes indicators and padding
  name?: string;                 //  name of column
  noInitialValue?: boolean;        // Set to true to always have an empty value on load
  options?: FieldItemOptions;        // Array of FieldOptions
  patch?: FieldItemPatchInterface;         // If field should be auto-patched.
  route?: string;                 // a router url path
  readonly?: boolean;
  required?: boolean;
  session?: boolean;                // If field value change should be stored to core entity
  sessionPath?: string;                // If session path if not stored on root entity
  sort?: boolean;                 //  Set to true if you want options to be sorted in priority of sort_order, name
  tooltip?: string;               // Tooltip for information to show when input is focused
  validators?: Array<Validators>; // Array of Validators.
  value?: boolean | string | number;        // Initial value.
}


export class SelectConfig implements SetControl {
  autoFill?: boolean;
  bubble = false;
  clearMessage;
  control: FormControl;
  disabled = false;
  displayErrors = true;
  empty;
  facade = false;
  helpText = '';
  hidden: false;
  height? = 240;
  id;
  label = '';
  message = '';
  mode = 'select';
  metadata;
  minimal = false;
  name = 'name';
  noInitialValue = false;
  options?: FieldItemOptions = { values: [] };
  patch: FieldItemPatchInterface;
  route;
  readonly = false;
  required?: boolean;
  showTooltip = false;
  sort = false;
  session?: boolean;
  sessionPath?: string;
  triggerOnChange;
  tooltip = '';
  validators;
  value?: boolean | string | number | any[] = null;


  constructor( params?: SelectConfigInterface ){
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
    if( this.options.empty ) this.options.values.unshift( { value: this.options.empty.value, name: this.options.empty.name } );

    if( !this.patch ) this.patch = { field: '', duration: 750, path: '', disabled: false, businessId: 0 };
    if( !this.disabled ) this.disabled = false;
    if( this.patch.displayIndicator !== false ) this.patch.displayIndicator = true;
    if( this.noInitialValue ) this.value = '';
    if( !this.control ) this.setControl();
  }


  setControl(){
    this.control = ( this.disabled
        ? new FormControl( { value: this.value, disabled: true } )
        : new FormControl( this.value, ( this.validators ? this.validators : [] ) )
    );
  }
}
