import { FormControl, ValidatorFn } from '@angular/forms';
import { FieldItemOption, FieldItemOptions, FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';
import { DynamicSort, IsArray, IsNumber } from '../../../../pop-common-utility';


export interface SelectFilterGroupInterface {
  label: string;                   // Input label.
  options: FieldItemOptions;          // Array of FieldOptions
  all?: boolean;
  indeterminate?: boolean;
  groupFk: number;
  visible?: number; // the count of  visible options within the group
  open?: boolean;
  selected?: number; // the count of selected visible options within the group
}


export interface SelectFilterConfigInterface {
  allLabel?: string;                                      // Set string to as label to indicate that all options are selected
  all?: boolean;                                          // Set boolean to indicate that all options are selected
  allValue?: boolean | string | number | null | any[];    // A custom value for when all options are selected
  allowAll?: boolean;                                     // Set boolean to indicate whether to set check all option
  bubble?: boolean;                                       // fire events
  checkboxPosition?: string;                             // The position of the checkbox for a multiple selection.
  collapsed?: boolean;                                    // Set to true on massive sets to show only option headers on render
  control?: FormControl;                                  // The form control. If not passed one will be created.
  disabled?: boolean;                                     // Mark as readonly.
  displayErrors?: boolean;                                // If Error messages should be displayed.
  emptyLabel?: string;                                    // Set string as label to when no options are selected
  emptyValue?: boolean | string | number | null | any[];  // A custom value for when all options are unselected
  float?: boolean;
  filter?: boolean;                                       // Search filter.
  facade?: boolean;                                       // Sets a flag that says this fieldItems really does not exist in the backend, and just pretend to hit the api
  helpText?: string;                                   // On hover helper text.
  height?: number;                                        // List height.
  id?: number | string;                                   // A number that will be included in the events so you know which field it came from.
  levelGap?: number;
  label?: string;                                         // Input label.
  metadata?: object;                                  // Array of objects. To be passed back on the event emitter and included in a patch if desired.
  multiple?: boolean;                                     // If multiple is needed.
  name?: string;                                      // the entityId field name
  noInitialValue?:boolean;                                // Set to true to always have an empty value on load
  options?: FieldItemOptions;                                // Array of FieldOptions
  patch?: FieldItemPatchInterface;                                 // If field should be auto-patched.
  patchGroupFk?: boolean;                                 // If value should contain groupFk, 3:12,4:12,5:13 <value:groupFk>
  session?: boolean;                                      // If field value change should be stored to core entity
  sessionPath?: string;                                  // If session path if not stored on root entity
  sort?: boolean;                                         //  Set to true if you want options to be sorted in priority of sort_order, name
  position?: 'above' | 'below';                           // list position
  value?: Array<number | string> | number | string;                         // Initial value.
  validators?: Array<ValidatorFn>;                        // Array of Validators.
}


export class SelectFilterConfig implements SetControl {
  allLabel = 'All';
  all = false;
  allValue;
  allowAll = true;
  bubble = false;
  displayErrors = true;
  collapsed = false;
  checkboxPosition = 'before';
  control: FormControl;
  defaultHeight;
  defaultMinHeight = 1;
  disabled: boolean;
  emptyValue;
  emptyLabel;
  facade = false;
  float? = false;
  filter = true;
  groups: SelectFilterGroupInterface[];
  helpText = '';
  height = 200;
  id: number | string;
  label: string;
  levelGap = 35;
  message: string;
  metadata;
  minHeight = 50;
  multiple = false;
  name = 'name';
  noInitialValue = false;
  offset = null;
  offsetSession = null;
  options?: FieldItemOptions;
  patch: FieldItemPatchInterface;
  patchGroupFk = false;
  position;
  session?: boolean;
  sessionPath?: string;
  sort: boolean;
  selectedOptions: any[];
  strVal = '';
  value?: Array<number | string> | number | string;
  validators: Array<ValidatorFn>;
  route;


  constructor( params?: SelectFilterConfigInterface ){
    this.setDefaultValues();
    if( params ) for( const i in params ) this[ i ] = params[ i ];

    this.value = this.multiple ? ( Array.isArray( this.value ) ? this.value : [] ) : ( +this.value ? this.value : null );

    if( this.options.values.length > 1 ){
      if( this.sort ){
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

      if( this.options.values[ 0 ].group ){
        this.groups = this.getOptionGroups();
        if( this.groups.length < 2 ){
          this.allowAll = false;
        }
      }else{
        const str: string[] = [];
        this.selectedOptions = [];
        this.options.values.map( ( option ) => {
          if( this.all ){
            option.selected = true;
            this.selectedOptions.push( option.value );
          }else{
            option.selected = IsArray( this.value ) ? ( ( <any[]>this.value ).includes( option.value ) ? true : false ) : false;
            if( option.selected ){
              this.selectedOptions.push( option.value );
              str.push( option.name );
            }
          }
          option.level = this.levelGap * option.level;
        } );
        const defaultGroup = {
          label: '',
          options: this.options,
          groupFk: 0,
          open: true,
        };
        this.groups = [ defaultGroup ];
      }
    }
    if( !this.levelGap ) this.levelGap = 35;
    this.defaultHeight = this.height;
    this.all = IsArray( this.value ) ? ( this.options.values.length === ( <any[]>this.value ).length ) : false;

    if( !this.position ) this.position = 'below';
    if( !this.patch ) this.patch = { field: '', duration: 750, path: '', disabled: false };
    if( this.patch.displayIndicator !== false ) this.patch.displayIndicator = true;
    if( this.groups.length === 1 ) this.collapsed = false;
    if( this.noInitialValue ) this.value = this.multiple ? [] : '';
    if( !this.control ) this.setControl();
  }


  setControl(){
    this.control = ( this.disabled ? new FormControl( {
      value: this.value,
      disabled: true
    } ) : new FormControl( this.value, ( this.validators ? this.validators : [] ) ) );
  }


  private setDefaultValues(): void{
    // this.helpText = '';
    this.label = '';
    this.message = '';
    this.options = { values: [] };
    this.disabled = false;
    this.sort = false;
    // this.showTooltip = false;
    // this.tooltip = '';
  }


  private getOptionGroups(): SelectFilterGroupInterface[]{
    this.selectedOptions = [];

    const groups = {};
    const list = [];
    let defaultGroup = this.options.values[ 0 ].group;
    this.options.values.map( ( option, index ) => {
      if( typeof option.level === 'undefined' ) option.level = 0;
      option.level = this.levelGap * option.level;
      if( !option.group ) option.group = defaultGroup;
      if( option.group in groups === false ){
        groups[ option.group ] = <SelectFilterGroupInterface> {
          label: option.group,
          groupFk: option.groupFk,
          options: {
            values: [],
            filtered: []
          },
          all: false,
          open: true,
          indeterminate: false,
        };
        defaultGroup = option.group;
      }
      if( this.all ){
        option.selected = true;
        this.selectedOptions.push( option.value );
      }else{
        option.selected = IsArray(this.value) ? (<any[]>this.value).includes( option.value ): false;
        if( option.selected ){
          this.selectedOptions.push( option.value );
        }
      }
      groups[ option.group ].options.values.push( option );
    } );
    const count = Object.keys( groups ).length;
    Object.keys( groups ).map( ( key ) => {
      const group = groups[ key ];
      // if(IsArray(group.options.values)){
      //   // ToDo:: allow ordering by a sort order property
      //   group.options.values = group.options.values.sort(DynamicSort('name'));
      // }
      if( count > 1 && this.collapsed ) group.open = false;
      list.push( groups[ key ] );
    } );
    return list;
  }


  public resetSelection(): void{
    this.selectedOptions = [];
  }


  public addSelectedOption( option: number ): void{
    this.selectedOptions.push( option );
  }
}

