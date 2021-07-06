import { FormControl, Validators } from '@angular/forms';
import { FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';


export interface ButtonConfigInterface {
  bubble?: boolean;                         // fire events
  color?: 'accent' | 'primary' | 'default'; // Color of Icon
  conceal?: boolean;                        // Mask the button as dots
  control?: FormControl;                    // The form control. If not passed one will be created.
  disabled?: boolean;                       // Mark as disabled.
  displayErrors?: boolean;                  // If Error messages should be displayed.
  event?: string;                             // The name you want to give the event that is fired on click
  helpText?: string;                     // On hover helper text.
  hidden?: boolean;                         // Hide button.
  icon?: string;                             // Angular material icon
  iconColor?: 'accent' | 'primary' | 'default'; // Color of Icon
  id?: string | number;                     // A number that will be included in the events so you know which field it came from.
  label?: string;                           // Input label.
  metadata?: object;                        // Array of objects. To be passed back on the event emitter and included in a patch if desired.
  name?: string;                        // the entityId field name
  patch?: FieldItemPatchInterface;          // If field should be auto-patched.
  radius?: number;                          // Radius of button
  size?: number;                             // Width and height of box
  text?: number;                             // Width and height of box
  tooltip?: string;                         // Tooltip for information to show when input is focused
  type?: 'mat-button' | 'mat-raised-button' | 'mat-flat-button'; // HTML input type.
  validators?: Array<Validators>;           // Array of Validators.
  value?: string | number;                  // Initial value.
  width?: number;                           // Width of the value and icon
}


export class ButtonConfig implements SetControl {
  // Defaults
  control;
  color: 'accent' | 'primary' | 'default' = 'default';
  bubble = false;
  displayErrors = true;
  disabled = false;
  event? = 'click';
  helpText = '';
  hidden = false;
  icon = 'help_outline';
  iconColor: 'accent' | 'primary' | 'default' = 'accent';
  id = '';
  label = '';
  message = '';
  metadata;
  name = 'name';
  patch;
  radius = 2;
  size = 35;
  showTooltip = false;
  text = 26;
  tooltip = '';
  type = 'mat-button';

  // No Defaults

  transformation;
  validators;

  triggerOnChange;
  value = 'Button';
  width = null;


  constructor(params?: ButtonConfigInterface){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    if( !this.patch ) this.patch = { field: '', path: '', disabled: false };
    if( this.patch.displayIndicator !== false ) this.patch.displayIndicator = true;
    if( this.size < 10 ) this.size = 10;
    if( !this.control ) this.setControl();
  }


  setControl(){
    this.control = ( this.disabled ? new FormControl({
      value: this.value,
      disabled: true
    }) : new FormControl(this.value, ( this.validators ? this.validators : [] )) );
  }
}
