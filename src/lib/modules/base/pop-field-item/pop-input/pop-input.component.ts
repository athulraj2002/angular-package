import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { InputConfig } from './input-config.model';
import { PatternValidation, ValidationErrorMessages } from '../../../../services/pop-validators';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { slideInOut } from '../../../../pop-common-animations.model';
import { IsArray, IsCallableFunction } from '../../../../pop-common-utility';


@Component( {
  selector: 'lib-pop-input',
  templateUrl: './pop-input.component.html',
  styleUrls: [ './pop-input.component.scss' ],
  animations: [
    slideInOut
  ]
} )
export class PopInputComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
  @Input() config: InputConfig = new InputConfig();
  @ViewChild('inputField', {static: true}) inputField:any;
  public name = 'PopInputComponent';


  constructor(
    public el: ElementRef,
    // protected cdr: ChangeDetectorRef,
  ){
    super();
    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {
        if(this.config.autofocus) {
         this.inputField.nativeElement.focus();
        } else if (this.config.autoselect) {
          this.inputField.nativeElement.focus();
           this.inputField.nativeElement.select();
        } 
       
        this.config.triggerOnChange = ( value: string | number | null, forcePatch = false ) => {
          this.dom.setTimeout( `config-trigger-change`, () => {
            // this.cdr.detectChanges();
            this.onChange( value, forcePatch );
          }, 0 );

        };

        this.config.triggerDirectPatch = ( value: string | number | null ) => {
          this.dom.setTimeout( `config-trigger-patch`, () => {
            this._onPatch( value, true );
          }, 0 );
        };

        this.config.clearMessage = () => {

          this.dom.setTimeout( `config-clear-message`, () => {
            this.config.message = '';
            this.config.control.markAsPristine();
            this.config.control.markAsUntouched();
            // this.cdr.detectChanges();
          }, 0 );
        };

        this.config.setType = ( type: 'text' | 'password' ) => {
          this.dom.setTimeout( `config-set-type`, () => {
            this.config.type = type;
            // this.cdr.detectChanges();
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


  onKeyUp( event ): void{
    if( event.code === 'Enter' ){
      if( this.config.control.invalid ){
        if( this.config.displayErrors ) this._setMessage( ValidationErrorMessages( this.config.control.errors ) );
      }else{
        this._clearMessage();
        if( this.config.patch && ( this.config.patch.path || this.config.facade ) ){
          if( this.config.control.value !== this.asset.storedValue ){
            if( this._isFieldPatchable() ){
              this.onChange();
            }
          }
        }
        if( this.config.tabOnEnter ){
          this.dom.focusNextInput( this.el );

        }else{
          this.onBubbleEvent( 'onEnter' );
        }

        if( IsCallableFunction( this.config.onEnter ) ){
          this.dom.setTimeout( `on-enter`, async() => {
            await this.config.onEnter( this.core, event );
          }, 250 );
        }
      }
    }else if( !this.config.mask && this.config.pattern && this.config.pattern.length ){
      const val = PatternValidation( this.config.pattern, 'value', this.config.control.value );
      if( val !== this.config.control.value ) this.config.control.setValue( val );
      if( this.config.control.touched && this._isChangeValid() ){
        this._clearMessage();
      }else if( IsArray( this.config.prevent, true ) ){
        this._isChangeValid();
      }

      this.onBubbleEvent( 'onKeyUp' );
    }else{
      if( this.config.control.touched && this._isChangeValid() ){
        this._clearMessage();
      }else if( IsArray( this.config.prevent, true ) ){
        this._isChangeValid();
      }
      this.onBubbleEvent( 'onKeyUp' );
    }
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }


}
