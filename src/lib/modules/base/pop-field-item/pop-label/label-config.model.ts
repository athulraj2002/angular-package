import { FormControl } from '@angular/forms';
import { FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';


export interface LabelConfigInterface {
  button?: boolean;       // Turn text/icon into a route method
  bubble?: boolean;
  border?: boolean;
  copyLabel?: boolean;         // The label text has a click to copy
  copyLabelDisplay?: string;  // The label that should go with the label copy button
  copyLabelBody?: string | number;    // The value that be copied when the label copy button is clicked
  copyLabelDisplayTransformation?: any; // The transformation that should happen to the copyLabelDisplay
  copyLabelBodyTransformation?: any; // The transformation that should happen to the copyLabelBody
  copyValue?: boolean;         // The value text has a click to copy
  copyValueDisplay?: string;  // The value that should go with the value copy button
  copyValueBody?: string | number;    // The value that be copied when the label value button is clicked
  copyValueDisplayTransformation?: any; // The transformation that should happen to the copyLabelDisplay
  copyValueBodyTransformation?: any; // The transformation that should happen to the copyLabelBody
  helpText?: string;  // Helper Text on the right side of label
  icon?: string;        // Use an icon instead of text. Pass in icon string as Materials(icon_key) or Pop(A)
  labelButton?: boolean;  // Display the label with a button
  link?: boolean;       // Turn text/icon into a route method
  label: string;          // The label Text on the left side
  metadata?: object;    // Desired Metadata
  name?: string;    // the entityId field name
  patch?: FieldItemPatchInterface; // If field should be auto-patched.
  route?: string;       // a router url path
  subLabel?: string;
  subValue?: string;
  textOverflow?: 'wrap' | 'ellipsis';   // Set the text overflow behavior, default wrap
  truncate?: number;    // Truncate the text a character length
  tooltip?: string;     // Tooltip on the left side of the text/icon
  valueButton?: boolean;  // Display the value with a button
  valueButtonDisplay?: string;
  valueButtonDisplayTransformation?: any; // The transformation that should happen to the valueButtonDisplay
  valueButtonDisabled?: boolean; // The transformation that should happen to the valueButtonDisplay
  value?: string | number; // The text on the right side

}


export class LabelConfig implements SetControl {
  bubble = false;
  button = false;
  border = false;
  control;
  copyValue = false;
  copyValueDisplay?: string;
  copyValueBody?: string | number;
  copyValueDisplayTransformation?: string;
  copyValueBodyTransformation?: string;
  copyLabel = false;
  copyLabelDisplay?: string;
  copyLabelBody?: string | number;
  copyLabelDisplayTransformation?: string;
  copyLabelBodyTransformation?: string;
  html = 'label';
  helpText = '';
  icon;
  iconType = 'mat';
  name = 'name';
  label = 'Label';
  labelButton?: boolean;
  link = false;
  metadata;
  patch: FieldItemPatchInterface;
  route;
  subLabel = '';
  subValue = '';
  tooltip = '';
  textOverflow?: 'wrap' | 'ellipsis' = 'wrap';
  truncate = 0;
  value = '';
  valueButton = false;
  valueButtonDisplay?: string;
  valueButtonDisplayTransformation?: any;
  valueButtonDisabled = false;
 



  constructor( params?: LabelConfigInterface ){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    if( this.link || this.route ) this.html = 'link';
    if( !this.patch ) this.patch = { field: '', duration: 750, path: '', disabled: false };
    if( this.patch.displayIndicator !== false ) this.patch.displayIndicator = true;
    if( this.icon ){
      if( this.icon.length === 1 ){
        this.icon = this.icon.toUpperCase();
        this.iconType = 'sw';
      }
    }
  }


  setControl(){
    // meet requirement
  }
}


export class MetadataConfig {
  bubble = false;
  value: string | number | any[] = '';
  control: FormControl;
  name;


  constructor( name: string, value: string | number | any[] ){
    this.name = name;
    this.value = value;
    this.control = new FormControl( value );
  }
}
