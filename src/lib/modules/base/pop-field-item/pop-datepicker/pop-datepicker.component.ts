import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { DatePickerConfig } from './datepicker-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { FormControl } from '@angular/forms';
import { IsObject, IsUndefined } from '../../../../pop-common-utility';
import { PopDate } from '../../../../pop-common.model';


@Component( {
  selector: 'lib-pop-datepicker',
  templateUrl: './pop-datepicker.component.html',
  styleUrls: [ './pop-datepicker.component.scss' ]
} )
export class PopDatePickerComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
  @Input() config: DatePickerConfig = new DatePickerConfig();
  public name = 'PopDateComponent';


  constructor(
    public el: ElementRef,
  ){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {

        this.config.max = null;

        this.config.triggerOnChange = ( value: string | number | null, forcePatch = false ) => {
          this.dom.setTimeout( `config-trigger-change`, () => {
            // this.cdr.detectChanges();
            this.onChange( value, forcePatch );
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

        // this.config.helpText = 'sdfsdafsadf';

        this._setFilter();

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
   * On Change event
   * @param value
   * @param force
   */
  onChange( value?: any, force = false ){
    if( value ){
      value = PopDate.toIso( value );
    }else{
      value = null;
    }
    if( IsObject( this.config, [ 'control' ] ) ){
      this.log.info( `onChange`, value )
      const control = <FormControl>this.config.control;
      if( typeof value !== 'undefined' ){
        control.setValue( value );
        control.markAsDirty();
        control.updateValueAndValidity();
      }
      if( this._isChangeValid() ){
        value = typeof value !== 'undefined' ? value : this.config.control.value;
        value = this._applyTransformation( value );
        if( this.config.patch && ( this.config.patch.path || this.config.facade ) ){
          this._onPatch( value, force );
        }else{
          this.onBubbleEvent( 'onChange' );
        }
      }else{
        // console.log( 'invalid change', this.config.control.value );
      }
    }
  }


  onResetForm(): void{
    this.dom.setTimeout( `reset-form`, () => {
      this.config.control.setValue( null, { emitEvent: true } );
      this.config.control.updateValueAndValidity();
      this.onChange();
    }, 0 );

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

  protected _setFilter(): void{
    if( typeof this.config.filterPredicate === 'string' ){
      switch( String( this.config.filterPredicate ).toLowerCase() ){
        case 'weekday':
          this.config.filterPredicate = ( d: Date ): boolean => {
            const day = d.getDay();
            // Prevent Saturday and Sunday from being selected.
            return day !== 0 && day !== 6;
          };
          break;
        case 'weekday':
          this.config.filterPredicate = ( d: Date ): boolean => {
            const day = d.getDay();
            // Prevent Saturday and Sunday from being selected.
            return day >= 1 && day <= 5;
          };
          break;
        case 'monday':
          this.config.filterPredicate = ( d: Date ): boolean => {
            const day = d.getDay();
            // monday
            return day === 1;
          };
          break;
        default:
          this.config.filterPredicate = null;
          break;
      }
    }
  }

}
