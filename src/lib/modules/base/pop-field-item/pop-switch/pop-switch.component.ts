import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { SwitchConfig } from './switch-config.model';
import { FieldItemPatchInterface, PopBaseEventInterface } from '../../../../pop-common.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { FormControl } from '@angular/forms';


@Component( {
  selector: 'lib-pop-switch',
  templateUrl: './pop-switch.component.html',
  styleUrls: [ './pop-switch.component.scss' ],
} )
export class PopSwitchComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
  @ViewChild( 'switch', { static: true } ) private switchRef: MatSlideToggle;
  @ViewChild( 'feedback', { static: true } ) private feedbackRef: ElementRef;
  @Input() config: SwitchConfig;
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();
  public name = 'PopSwitchComponent';


  constructor(
    public el: ElementRef,
  ){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {

        this.switchRef.checked = !!this.config.control.value;
        this.config.switchRef = this.switchRef;
        this.asset.storedValue = this.config.control.value;
        this.config.triggerOnChange = ( value: boolean ) => {
          this.dom.setTimeout( `trigger-change`, () => {
            this.onSelection( { checked: value } );
          }, 0 );
        };

        this.config.setValue = ( value: boolean ) => {
          this.dom.setTimeout( `set-value`, () => {
            this.asset.change = value;
            this.config.control.setValue( value, { emitEvent: false } );
            this.config.control.updateValueAndValidity();
            this.config.control.markAsPristine();
            this.switchRef.checked = value;
          }, 0 );
        };

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


  onEnter( event ){
    if( this.config.tabOnEnter ){
      this.dom.focusNextInput( this.el );
    }
  }


  onSelection( change: { checked: boolean } ){
    this.asset.change = change;
    this.onChange( change.checked );
  }


  /************************************************************************************************
   *                                                                                              *
   *                                    Base Class Overrides                                      *
   *                                    ( Protected Method )                                      *
   *               These are protected instead of private so that they can be overridden          *
   *                                                                                              *
   ************************************************************************************************/


  protected _beforePatch(): Promise<boolean>{
    return new Promise( ( resolve ) => {
      const patch = <FieldItemPatchInterface>this.config.patch;
      const control = <FormControl>this.config.control;

      control.disable();
      patch.running = true;

      return resolve( true );
    } );
  }


  /**
   * Called after a successful patch
   */
  protected _afterPatch(): Promise<boolean>{
    return new Promise( ( resolve ) => {
      const patch = <FieldItemPatchInterface>this.config.patch;
      const control = <FormControl>this.config.control;

      control.enable();
      patch.running = false;

      this.switchRef.checked = this.asset.storedValue;

      return resolve( true );
    } );
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

}
