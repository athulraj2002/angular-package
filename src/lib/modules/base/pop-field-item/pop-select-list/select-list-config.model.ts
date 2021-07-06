import { FormControl, ValidatorFn } from '@angular/forms';
import { SelectFilterGroupInterface } from '../pop-select-filter/select-filter-config.model';
import { EventCallback, FieldItemOption, FieldItemOptions, FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';
import { ArrayKeyBy, ArrayMapSetter, IsArray, IsDefined, IsUndefined } from '../../../../pop-common-utility';


export interface SelectListGroupInterface {
  label: string;                   // Input label.
  options: FieldItemOptions;          // Array of FieldOptions
  all?: boolean;
  indeterminate?: boolean;
  groupFk?: number | string;
  visible?: number; // the count of  visible options within the group
  selected?: number; // the count of selected visible options within the group
  open?: boolean;
}


export interface SelectListConfigInterface {
  all?: boolean;                    // Set boolean to indicate that all options are selected
  allLabel?: string;                // Set string to as label to indicate that all options are selected
  allowAll?: boolean;               // Set boolean to indicate whether to set check all option
  allowGroupAll?: boolean;               // Set boolean to indicate whether to set check all option
  allValue?: boolean | string | number | null | any[];       // A custom value for when all options are selected
  allOverlay?: boolean;
  allOverlayEnabled?: boolean;
  allOverlayLabel?: string;
  allOverlayMessage?: string;
  allOverlayCallback?: EventCallback;
  bubble?: boolean;                 // fire events
  checkboxPosition?: string;       // The position of the checkbox for a multiple selection.
  control?: FormControl;            // The form control. If not passed one will be created.
  collapsed?: boolean;              // Set to true on massive sets to show only option headers on render
  disabledIds?: number[];
  disabled?: boolean;               // Mark as readonly.
  displayErrors?: boolean;          // If Error messages should be displayed.
  emptyValue?: boolean | string | number | null | any[];     // A custom value for when all options are unselected
  empty?: 'ConvertEmptyToNull' | 'ConvertEmptyToZero';
  emptyLabel?: string;              // Set string as label to when no options are selected
  facade?: boolean;                 // Sets a flag that says this fieldItems really does not exist in the backend, and just pretend to hit the api
  filter?: boolean;                 // Search filter.
  helpText?: string;             // On hover helper text.
  height?: number;                  // List height.
  id?: number | string;             // A number that will be included in the events so you know which field it came from.
  label?: string;                   // Input label.
  levelGap?: number;
  mode?: FieldItemOption[];
  minHeight?: number;                  // List height.
  multiple?: boolean;               // If multiple is needed.
  noInitialValue?: boolean;          // Set to true to always have an empty value on load
  name?: string;                    // the entityId field name
  options?: FieldItemOptions;          // Array of FieldOptions
  outline?: boolean;                // Show border around option container
  patch?: FieldItemPatchInterface;           // If field should be auto-patched.
  patchGroupFk?: boolean;           // If value should contain groupFk, 3:12,4:12,5:13 <value:groupFk>
  required?: boolean;                // If field value change should be stored to core entity
  session?: boolean;                // If field value change should be stored to core entity
  sessionPath?: string;                // If session path if not stored on root entity
  sort?: boolean;                   //  Set to true if you want options to be sorted in priority of sort_order, name
  value?: Array<number | string> | number | string;  // Initial value.
  validators?: Array<ValidatorFn>;  // Array of Validators.
}


export class SelectListConfig implements SetControl {
  allValue;
  allLabel = 'All';
  allowAll = true;
  allowGroupAll? = true;
  allOverlay? = false;
  allOverlayEnabled? = false;
  allOverlayLabel? = '';
  allOverlayMessage? = '';
  allOverlayCallback?: EventCallback;
  all = false;
  bubble = false;
  checkboxPosition = 'before';
  collapsed = false;
  control: FormControl;
  column = 'column';
  displayErrors = true;
  disableOption;
  defaultHeight = null;
  defaultMode:string|number;
  disabled: boolean;
  disabledIds = [];
  enableOption;
  emptyValue;
  emptyLabel;
  facade = false;
  filter = true;
  focusSearch;
  groups: SelectListGroupInterface[];
  helpText = '';
  height = null;
  id: number | string;
  levelGap = 35;
  label = '';
  mode?: FieldItemOption[];
  message: string;
  multiple = false;
  minHeight = null;
  noInitialValue = false;
  outline = true;
  options?: FieldItemOptions;
  patch: FieldItemPatchInterface;
  patchGroupFk = false;
  required?: boolean;
  route;
  session?: boolean;
  sessionPath?: string;
  sort: boolean;
  setDisabled;
  strVal = '';
  setActive;
  setHeight;
  clearSelected;
  selectedOptions: any[];
  triggerOnChange;
  value?: Array<number | string> | number | string;
  validators: Array<ValidatorFn>;


  constructor( params?: SelectListConfigInterface ){
    this.setDefaultValues();
    if( params ) for( const i in params ) this[ i ] = params[ i ];
    const mode = this.mode;
    const hasMode = IsArray( this.mode, true ) ? true : false;
    this.defaultMode = hasMode ? this.mode[ 0 ].value : 0;
    this.value = Array.isArray( this.value ) ? this.value : [];
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
      }else if( this.options.values.length ){
        let str: string[] = [];
        this.selectedOptions = [];
        this.options.values.map( ( option ) => {
          if( hasMode && IsUndefined( option.mode ) ) option.mode = this.defaultMode;
          option.selected = ( <any[]>this.value ).includes( option.value ) ? true : false;
          if( option.selected ){
            this.selectedOptions.push( option.value );
            str.push( option.name );
          }
          option.indentation = ( +this.levelGap ) * ( option.level + 1 );
          str = str.sort();
          this.strVal = str.join( ', ' );
        } );
        if( this.options.empty ) this.options.values.unshift( { value: this.options.empty.value, name: this.options.empty.name } );
        const defaultGroup = {
          label: '',
          options: this.options,
          open: true
        };
        this.groups = [ defaultGroup ];
      }else{
        this.groups = [];
      }
    }
    if( !this.groups ) this.groups = [];
    if( !this.levelGap ) this.levelGap = 35;
    this.defaultHeight = this.height;

    let allGroupsSelected = true;
    const selected = this.selectedOptions;
    let groupSelected;
    if( this.all ){
      this.selectedOptions = [];
      this.groups.map( ( group ) => {
        group.all = true;
        this.selectedOptions = group.options.values.map( ( option ) => {
          option.selected = true;
          this.selectedOptions.push( option.value );
        } );
      } );
      this.strVal = this.allLabel;
    }else{
      let str: string[] = [];
      this.selectedOptions = [];
      const isGroups = this.groups.length > 1;

      this.groups.map( ( group: SelectFilterGroupInterface ) => {
        if( group.all ){
          if( isGroups ){
            str.push( group.label + ' (All)' );
          }else{
            str.push( 'All' );
          }
          group.options.values.filter( option => {
            this.selectedOptions.push( option.value );
          } );
        }else{
          groupSelected = group.options.values.filter( ( option ) => {
            return option.selected;
          } );
          if( groupSelected && groupSelected.length ){
            if( groupSelected.length === group.options.values.length ) group.all = true;
            if( group.all ){
              if( isGroups ){
                str.push( group.label + ' (All)' );
              }else{
                str.push( 'All' );
              }
              group.options.values.filter( option => {
                this.selectedOptions.push( option.value );
              } );
            }else{
              allGroupsSelected = false;
              if( isGroups && groupSelected.length ){
                str.push( group.label + ` (${groupSelected.length} of ${group.options.values.length})` );
                groupSelected.map( ( option: any ) => {
                  this.selectedOptions.push( option.value );
                } );
              }else{
                groupSelected.map( ( option: any ) => {
                  this.selectedOptions.push( option.value );
                  str.push( option.name );
                } );
              }
            }
          }else{
            group.all = false;
            allGroupsSelected = false;
          }
        }
      } );
      if( !this.selectedOptions.length ){
        allGroupsSelected = false;
        if( this.emptyLabel ){
          str = [ this.emptyLabel ];
        }
      }else if( !this.all && allGroupsSelected ){
        str = [ 'All' ];
      }
      this.all = allGroupsSelected;
      str = str.sort();
      this.strVal = str.join( ', ' );
    }

    delete this.options;
    delete this.value;

    if( !this.patch ) this.patch = { field: '', duration: 750, path: '', disabled: false };
    if( this.patch.displayIndicator !== false ) this.patch.displayIndicator = true;
    if( this.groups.length === 1 ) this.collapsed = false;
    if( this.noInitialValue ) this.value = this.multiple ? [] : '';
    if( !this.control ) this.setControl();
    if( !( IsDefined( this.value, false ) ) ) this.value = this.multiple ? [] : '';

    if( this.allOverlay && !this.allOverlayLabel ){
      this.allOverlayLabel = 'All Access';
    }
  }


  setControl(){
    this.control = ( this.disabled ? new FormControl( {
      value: this.value,
      disabled: false
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


  private getOptionGroups(): SelectListGroupInterface[]{
    this.selectedOptions = [];

    const groups = {};
    const list = [];
    let defaultGroup = this.options.values[ 0 ].group;
    let defaultGroupFk = this.options.values[ 0 ].groupFk;
    this.options.values.map( ( option, index ) => {
      if( typeof option.level === 'undefined' ) option.level = 0;
      if( this.mode && IsUndefined( option.mode ) ) option.mode = this.defaultMode;
      option.indentation = ( +this.levelGap ) * ( option.level + 1 );
      if( !option.group ) option.group = defaultGroup;
      if( option.group in groups === false ){
        groups[ option.group ] = <SelectListGroupInterface> {
          label: option.group,
          options: { values: [] },
          all: false,
          indeterminate: false,
          open: true,
          groupFk: option.groupFk,
        };
        defaultGroup = option.group;
        defaultGroupFk = option.groupFk;
      }
      option.selected = ( <any[]>this.value ).includes( option.value );
      if( option.selected ){
        this.selectedOptions.push( option.value );
      }
      groups[ option.group ].options.values.push( option );
    } );

    const count = Object.keys( groups ).length;
    Object.keys( groups ).map( ( key ) => {
      let indeterminate = false;
      let all = true;
      groups[ key ].options.values.some( option => {
        if( !option.selected ){
          all = false;
          indeterminate = true;
          return true;
        }
      } );
      groups[ key ].all = all;
      groups[ key ].indeterminate = indeterminate;
      if( count > 1 && this.collapsed ) groups[ key ].open = false;
      list.push( groups[ key ] );
    } );
    const countLabel = this.selectedOptions.length > 1 ? `[${this.selectedOptions.length}] ` : '';

    return list;
  }


  public resetSelection(): void{
    this.selectedOptions = [];
  }


  public addSelectedOption( option: number ): void{
    this.selectedOptions.push( option );
  }
}

