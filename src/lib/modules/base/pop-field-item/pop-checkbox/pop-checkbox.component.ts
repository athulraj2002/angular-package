import {
  AfterViewInit, ChangeDetectorRef,
  Component,
  ElementRef,
  Input, OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { CheckboxConfig } from './checkbox-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { FormControl } from '@angular/forms';
import { FieldItemPatchInterface } from '../../../../pop-common.model';


@Component( {
  selector: 'lib-pop-checkbox',
  templateUrl: './pop-checkbox.component.html',
  styleUrls: [ './pop-checkbox.component.scss' ],
} )
export class PopCheckboxComponent extends PopFieldItemComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() config: CheckboxConfig;
  public name = 'PopCheckboxComponent';


  constructor(
    public el: ElementRef,
    private renderer: Renderer2,
    protected cdr: ChangeDetectorRef
  ){
    super();
    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {
        this.dom.state.indeterminate = false;
        this.asset.storedValue = +this.config.control.value === 1 ? true : false;
        return resolve( true );
      } );
    };
  }


  /**
   * This component should have a specific purpose
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * This will position the feedback container in the right spot
   */
  ngAfterViewInit(){
    this.asset.checkBoxBackground = this.el.nativeElement.querySelector( '.mat-checkbox-background' );
    this.asset.checkBoxFrame = this.el.nativeElement.querySelector( '.mat-checkbox-frame' );

    this.cdr.detectChanges();
  }


  onEnter( event ){
    if( this.config.tabOnEnter ){
      this.dom.focusNextInput( this.el );
    }
  }


  _beforePatch(): Promise<boolean>{
    return new Promise( ( resolve ) => {
      const patch = <FieldItemPatchInterface>this.config.patch;
      const control = <FormControl>this.config.control;

      control.disable();
      patch.running = true;
      this._onHideCheckbox();

      this._clearMessage();

      return resolve( true );
    } );
  }


  _afterPatch(): Promise<boolean>{
    return new Promise( ( resolve ) => {
      const patch = <FieldItemPatchInterface>this.config.patch;
      const control = <FormControl>this.config.control;

      control.enable();
      control.markAsPristine();
      patch.running = false;

      return resolve( true );
    } );
  }


  protected _onPatchSuccessAdditional(): boolean{
    this._displayCheckbox();
    return true;
  }


  protected _onPatchFailAdditional(): boolean{
    this._displayCheckbox();
    return true;
  }


  /**
   * This will trigger when the user click the checkbox to subject its value
   * This updates the config value since that is auto-handled with this input type
   */
  onToggleValue(){
    const value = !this.asset.storedValue;
    this.config.control.setValue( value, { emitEvent: true } );
    this.onChange( value );
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
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
   * This will make the checkbox hidden in the view
   */
  private _onHideCheckbox(){
    this.renderer.setStyle( this.asset.checkBoxFrame, 'border-color', '' );
    this.renderer.setStyle( this.asset.checkBoxBackground, 'background-color', '' );
    this.renderer.setStyle( this.asset.checkBoxBackground, 'border', '' );
    this.renderer.setStyle( this.asset.checkBoxBackground, 'display', 'none' );
  }


  /**
   * This will make the checkbox visible in the view
   */
  private _displayCheckbox(){
    this.renderer.setStyle( this.asset.checkBoxBackground, 'display', 'block' );
  }

}
