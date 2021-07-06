import { FormControl } from '@angular/forms';
import { SetControl } from '../../../../pop-common-dom.models';


export interface TextConfigInterface {
  border?: boolean;
  className?: string;
  control?: FormControl;          // The form control. If not passed one will be created.
  header?: boolean;
  id?: number | string;           // A number that will be included in the events so you know which field it came from.
  name?: string;
  noInitialValue?: boolean;                 // Set to true to always have an empty value on load
  tabOnEnter?: boolean;
  padding?: number;                         // padding adjustment
  size?: number;                            // font size adjustment
  textOverflow?: 'wrap' | 'ellipsis';       // Set the text overflow behavior, default wrap
  value?: boolean | number | string;        // Initial value.
  warning?:boolean;

}


export class TextConfig implements SetControl {

  border = false;
  className = 'theme-foreground-base';
  control: FormControl;
  header? = false;
  id: number | string;
  message = '';
  noInitialValue = false;
  name? = 'name';
  setValue;
  padding = 5;
  textOverflow = 'wrap';
  value: boolean | number | string = false;
  warning? = true;


  constructor( params?: TextConfigInterface ){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    if( !this.control ) this.setControl();
  }


  setControl(){
    this.control = new FormControl( this.value );
  }

}
