import { FormControl, Validators } from '@angular/forms';
import { FieldItemOption, FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';


export interface SliderConfigInterface {
  autoTicks?: false;
  bubble?: boolean;               // fire events
  column?: string;              // the entityId field name
  control?: FormControl;          // The form control. If not passed one will be created.
  disabled?: boolean;             // Mark as readonly.
  displayErrors?: boolean;        // If Error messages should be displayed.
  facade: boolean;
  helpText?: string;            // On hover helper text.
  id?: number | string;           // A number that will be included in the events so you know which field it came from.
  label?: string;                 // Input label.
  max?: number;
  min?: number;
  metadata?: object;              // Array of objects. To be passed back on the event emitter and included in a patch if desired.
  noInitialValue?:boolean;                                // Set to true to always have an empty value on load
  patch?: FieldItemPatchInterface;         // If field should be auto-patched.
  session?: boolean;                // If field value change should be stored to core entity
  sessionPath?: string;                // If session path if not stored on root entity
  showTicks?: true;
  step?: number;                 //  Set to true if you want options to be sorted in priority of sort_order, name
  thumbLabel?: true;
  tickInterval?: number;
  validators?: Array<Validators>; // Array of Validators.
  value?: boolean | number | string;   // Initial value.
}


export class SliderConfig implements SetControl {

  autoTicks = false;
  bubble = false;
  column = 'column';
  control: FormControl;
  displayErrors = true;
  disabled = false;
  facade = false;
  helpText = '';
  id;
  label = '';
  message = '';
  max = 100;
  min = 1;
  metadata;
  noInitialValue = false;
  options: FieldItemOption[] = [];
  patch: FieldItemPatchInterface;
  session?: boolean;
  sessionPath?: string;
  step = 1;
  showTooltip = false;
  showTicks = true;
  thumbLabel = true;
  tickInterval = 1;
  tooltip = '';
  validators;
  value: boolean | number | string = null;


  constructor(params?: SliderConfigInterface){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    if( !this.patch ) this.patch = { field: '', duration: 750, path: '', disabled: false, businessId: 0 };
    if( this.patch.displayIndicator !== false ) this.patch.displayIndicator = true;
    if( this.min > this.max ){
      this.min = this.max;
    }
    if( this.noInitialValue ) this.value = '';
    if( !this.control ) this.setControl();
  }


  setControl(){
    this.control = ( this.disabled ? new FormControl({
      value: this.value,
      disabled: true
    }) : new FormControl(this.value, ( this.validators ? this.validators : [] )) );
  }
}
