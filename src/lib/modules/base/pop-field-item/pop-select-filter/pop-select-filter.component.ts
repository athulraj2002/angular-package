import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy, HostListener } from '@angular/core';
import { SelectFilterConfig, SelectFilterGroupInterface } from './select-filter-config.model';
import { MatSelectionList, MatListOption } from '@angular/material/list';
import { Observable } from 'rxjs';
import { InputConfig } from '../pop-input/input-config.model';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime } from 'rxjs/operators';
import { ValidationErrorMessages } from '../../../../services/pop-validators';
import { FieldItemOption } from '../../../../pop-common.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { IsObject, IsObjectThrowError, JsonCopy, ObjectContainsTagSearch } from '../../../../pop-common-utility';


@Component( {
  selector: 'lib-pop-select-filter',
  templateUrl: './pop-select-filter.component.html',
  styleUrls: [ './pop-select-filter.component.scss' ]
} )
export class PopSelectFilterComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
  @Input() config: SelectFilterConfig; // configuration for component
  @ViewChild( 'list', { static: true } ) listRef: ElementRef; // Getting a reference to the selection list in the view so that I can know which options are selected
  @ViewChild( 'selectionList', { static: true } ) selectionListRef: MatSelectionList; // Getting a reference to the selection list in the view so that I can know which options are selected
  @ViewChild( 'search' ) searchRef: ElementRef;
  name = 'PopSelectFilterComponent';



  protected asset = {
    filteredOptions: <Observable<FieldItemOption[]>>undefined,
    groups: [],
    onFocusValue: undefined
  };

  public ui = {
    selected: {
      config: undefined,
      count: 0
    },
    search: {
      config: undefined,
      count: 0
    }
  };

  @HostListener('document:keydown.escape', ['$event']) onEscapeHandler(event: KeyboardEvent) {
    if(this.dom.state.filterActivated){
      console.log('esc',event);
      this._closeOptionList();
    }
  }



  constructor(
    public el: ElementRef,
    protected cdr: ChangeDetectorRef
  ){
    super();

    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {

        this.config = IsObjectThrowError( this.config, true, `${this.name}:configure: - this.config` ) ? this.config : null;
        this._setInitialDomState();
        this._filterOptionsList( '' );
        this._setUpFilterObservable();

        return resolve( true );
      } );
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {


        return resolve( true );
      } );
    };



  }



  ngOnInit(): void{
    super.ngOnInit();
  }


  /**
   * Set the inital dom state of the component
   * @private
   */
  private _setInitialDomState(){
    this.dom.state.filter = <boolean> undefined;
    this.dom.state.filterActivated = false;
    this.dom.state.above = <number> undefined;
    this.dom.state.below = <number> undefined;
    this.dom.state.list = <any> undefined;
    this.dom.state.position = <'below' | 'above'>'below';
    this.dom.state.active = undefined;
    this.dom.state.checkboxPosition = this.config.checkboxPosition === 'before' ? 'before' : 'after';

    if( !this.config.multiple ){
      this.selectionListRef.selectedOptions = new SelectionModel<MatListOption>( false );
    }

    this.ui.selected.config = new InputConfig( {
      value: this.config.strVal,
      helpText: this.config.helpText,
      displayErrors: false,
      label: this.config.label,
      readonly: true,
      selectMode: true,
      maxlength: 65000
    } );

    this.ui.search.config = new InputConfig( {
      value: this.config.strVal,
      helpText: this.config.helpText,
      displayErrors: false,
      label: this.config.label,
      readonly: true,
      maxlength: 255
    } );

    if( !this.config.multiple && +this.config.value ){
      const activeOption = IsObject(this.config.options, ['values']) ?  this.config.options.values.find( ( option ) => +option.value === +this.config.value ) : null;
      if( IsObject( activeOption, [ 'value', 'name' ] ) ){
        this.config.selectedOptions = [ +activeOption.value ];
        this.asset.onFocusValue = JSON.stringify( this.config.selectedOptions );
        this.dom.active.optionId = +activeOption.value;
        this.ui.selected.config.control.setValue( activeOption.name, { emitEvent: false } );
      }
    }else{
      this.asset.onFocusValue = JSON.stringify( this.config.selectedOptions );
      this._updateSelectedOptions();
    }
    delete this.config.options;
  }


  /**************************************
   * Public methods invoked by the view
   * ************************************/

  /**
   * Turn the dropdown on or off. If it is turned off,
   * it will emit the close event
   * @returns void
   */
  public onToggleFilter( event, list: { clientHeight: number } ): boolean{
    if( this.config.patch.running ) return false;
    this.dom.state.filterActivated = !this.dom.state.filterActivated;
    if(this.dom.state.filterActivated){
      if(this.config.float){
        if(this.config.offsetSession) {
          this.config.offset = this.config.offsetSession;
        } else if(this.config.height){
          this.config.offset = this.config.height;
        }
      } else{
        this.config.offset = null;
      }

    } else{
      this.config.offset = null;
    }

    this.dom.setTimeout('open-close', () => {
      if( !this.config.position ) this._setOptionListPosition( { above: event.pageY - 280, below: window.innerHeight - event.pageY - 20, height: list.clientHeight } );
      if( !this.dom.state.filterActivated ){
        this.onBubbleEvent( 'close' );
      }else{
        this.asset.onFocusValue = JSON.stringify( this.config.selectedOptions );
        this.config.message = '';
        this.onBubbleEvent( 'open' );
      }
      if(this.dom.state.filterActivated){
        if(this.config.float){
          const offsetHeight = this.listRef.nativeElement.offsetHeight;
          if(offsetHeight){
            this.config.offset = offsetHeight * (-1);
            if(this.config.offset) this.config.offsetSession = this.config.offset;
          }
        }
      }

    }, 0 );
    return true;
  }


  /**
   * The client user can toggle a specific grouping to be open/close
   * @param group
   */
  public onToggleGroup( group: SelectFilterGroupInterface ){
    if( this.config.groups.length > 1 ){
      group.open = !group.open;
    }
  }


  /**
   * Closes the dropdown if it is active.
   * This method is called from the ClickOutside directive.
   * If the user clicks outside of the component, it will close
   * @param event
   * @returns void
   */
  public onOutsideCLick(): void{
    this._closeOptionList();
  }


  /**
   * Checks/Unchecks all of the filtered options within a specific group
   * @param  FieldOption option
   * @returns boolean
   */
  public onAllChange( checked: boolean ): boolean{
    if( !this.config.multiple ) return false;
    this.config.groups.map( ( group ) => {
      group.options.values.map( ( option: FieldItemOption ) => {
        option.selected = checked;
      } );
      group.all = checked;
      group.indeterminate = false;
    } );
    setTimeout( () => {
      this._updateSelectedOptions();
    }, 0 );
    return false;
  }


  /**
   * Checks/Unchecks all of the filtered options within a specific group
   * @param  FieldOption option
   * @returns boolean
   */
  public onGroupChange( checked: boolean, group ): boolean{
    if( !this.config.multiple ) return false;
    group.options.values.map( ( option: FieldItemOption ) => {
      if( !option.hidden ){
        option.selected = checked;
      }
    } );
    setTimeout( () => {
      this._checkGroupState( checked, group );
      this._updateSelectedOptions();
    }, 0 );
    return false;
  }


  /**
   * Update's the list of selected options inside of the config
   * and emits a change event. This method will be called by the view
   * whenever an option is selected
   * @param MatSelectionListChange event
   * @returns void
   */
  public onOptionChange( event, option, group ): void{
    setTimeout( () => {
      option.selected = event.target.className.search( 'mat-pseudo-checkbox-checked' ) > -1 ? true : false;
      this._checkGroupState( option.selected, group );
      this._updateSelectedOptions();
    }, 0 );
  }


  public onLink(){
    console.log( 'LINK STUB: Link to Entity', this.config.control.value );
  }


  /**
   * Checks if the given option is in the list of selected options
   * in the config. Used by the view to set the checkbox's on the initial state of the dropdown
   * @param  FieldOption option
   * @returns boolean
   */
  public isOptionSelected( option: FieldItemOption ): boolean{
    return option.selected;
  }


  ngOnDestroy(){
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  /**
   * Observes the value changes to the search and triggers the filter of the options
   * @returns void
   */
  private _setUpFilterObservable(): void{
    this.ui.search.config.control.valueChanges
      .pipe(
        debounceTime( 200 )
      ).subscribe( ( value: string ) => {
      this._filterOptionsList( value );
    } );
  }


  /**
   * Close the option list
   * @private
   */
  private _closeOptionList(){
    if( this.dom.state.filterActivated ){
      // this.config.control.setValue( '', { emitEvent: true } );
      this.dom.state.filterActivated = false;
      this.cdr.detectChanges();
      this._checkSelectedValue( this.dom.state.filterActivated );
      this._filterOptionsList('');
      this.onBubbleEvent( 'close' );
      this.config.offset = null;
    }
  }


  /**
   * Check the selected value to see if it needs to be stored
   * @param open
   * @private
   */
  private _checkSelectedValue( open: boolean ){
    // if( !open ){
    if( this.ui.selected.config.control.invalid ){
      if( this.config.displayErrors ) this.config.message = ValidationErrorMessages( this.ui.selected.config.control.errors );
    }else if( this.config.patch && ( this.config.patch.path || this.config.facade ) ){
      if( JSON.stringify( this.config.selectedOptions ) !== this.asset.onFocusValue ){
        this.onChange();
      }
    }
  }



  /**
   * Detects if the list of options should appear above or below the select input
   * @param height
   */
  private _setOptionListPosition( params: { above: number, below: number, height: number } ): void{
    if( params.height > 0 ){
      this.config.offset = null;
      this.dom.state.above = params.above;
      this.dom.state.below = params.below;
      this.dom.state.list = params.height;
      // if( this.config.allowAll ) this.dom.state.list += 60;
      // if( this.config.filter ) this.dom.state.list += 58;
      this.config.position = this.dom.state.below >= this.dom.state.above ? 'below' : 'above';
      this.config.height = this.config.defaultHeight;
      if( this.config.position === 'above' ){
        if( this.config.height > this.dom.state.above ) this.config.height = this.dom.state.above;
        this.config.minHeight = this.config.height;
      }else{
        if( this.config.height > this.dom.state.below ) this.config.height = this.dom.state.below;
        // this.config.minHeight = this.config.defaultMinHeight;
        this.config.minHeight = this.config.height;
      }
      this.dom.setTimeout( `search-focus`, () => {
        if( this.searchRef ){
          this.searchRef.nativeElement.focus();
          // this.onBubbleEvent( 'focus' );
        }
      }, 200 );
    }
  }


  /**
   * Detects whether the check all  box for a group should be unchecked, checked, or indeterminate
   * @param checked
   * @param group
   */
  private _checkGroupState( checked: boolean, group ): void{
    let indeterminate = false;
    let all = true;
    if( !checked ){
      all = false;
      group.options.values.some( ( option ) => {
        if( !option.hidden && option.selected ){
          indeterminate = true;
          return true;
        }
      } );
    }else{
      group.options.values.some( option => {
        if( !option.hidden && !option.selected ){
          all = false;
          indeterminate = true;
          return true;
        }
      } );
    }
    group.all = all;
    group.indeterminate = indeterminate;
  }


  /**
   * Finds only the options from the config's options that match
   * the string passed in, and returns those options.
   * Used as the filter when setting up the filteredOptions observable
   * @param string value
   * @returns FieldItemOption
   */
  private _filterOptionsList( search: string ): void{
    this.config.groups.map( ( group: SelectFilterGroupInterface ) => {
      group.options.values.map( ( option ) => {
        option.hidden = ObjectContainsTagSearch( option, search ) ? false : true;
      } );
      group.selected = group.options.values.filter( ( option ) => {
        return !option.hidden && option.selected;
      } ).length;

      group.visible = group.options.values.filter( ( option ) => {
        return !option.hidden;
      } ).length;
      const checked = group.visible === group.selected;
      this._checkGroupState( checked, group );
    } );
    this.cdr.detectChanges();
  }


  /**
   * Update's the selection options in config
   * by looping through all of the currently selected items
   * in the selectionListRef.
   * @param number id
   */
  private _updateSelectedOptions(){
    const selected = this.selectionListRef.selectedOptions.selected;
    let str: string[] = [];
    if( this.config.multiple ){
      this.config.selectedOptions = [];
      for( const option of selected ){
        str.push( option._text.nativeElement.innerText );
        this.config.selectedOptions.push( String( option.value ).trim() );
      }
      str = str.sort();
      this.config.strVal = str.join( ', ' );
      this.ui.selected.config.control.setValue( this.config.strVal, { emitEvent: false } );
      const value = JsonCopy( this.config.selectedOptions );
      this.config.control.setValue( value, { emitEvent: false } );
    }else{
      let value;
      for( const option of selected ){
        str.push( option._text.nativeElement.innerText );
        value = option.value;
      }
      str = str.sort();
      this.config.strVal = str.join( ', ' );
      this.ui.selected.config.control.setValue( this.config.strVal, { emitEvent: false } );
      this.dom.active.optionId = value;
      this.config.control.setValue( value, { emitEvent: false } );
      this.config.value = value;
      this._closeOptionList();
    }
  }
}
