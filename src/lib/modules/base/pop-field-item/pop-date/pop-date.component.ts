import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import { MatDatepicker } from "@angular/material/datepicker";
import { DateConfig } from './date-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { FormControl } from '@angular/forms';
import { IsObject } from '../../../../pop-common-utility';
import { PopDate } from '../../../../pop-common.model';
import { ExpansionItemsComponent } from './datepicker-expansion-items/expansion-items.component';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component( {
  selector: 'lib-pop-date',
  templateUrl: './pop-date.component.html',
  styleUrls: [ './pop-date.component.scss' ]
} )
export class PopDateComponent extends PopFieldItemComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() config: DateConfig = new DateConfig();
  @ViewChild('datePicker') picker: MatDatepicker<any>;
  public name = 'PopDateComponent';

  ExpansionItems =  ExpansionItemsComponent;
  private selfClose: () => void;

  constructor(public el: ElementRef, private overlayContainer: OverlayContainer){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {

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

        this._setFilter();

        return resolve( true );
      } );
    };
  }

  /**
   * On init hook
   */
  ngOnInit(){
    super.ngOnInit();
    if(this.config.type === 'Basic'){
      this.ExpansionItems = null;
    }
  }


  /**
   * After view init hook
   *  Backup picker close method
   */

  ngAfterViewInit() {
    this.selfClose = this.picker.close;
  }

  /**
   * on Open Event
   * Overwrite picker close to prevent auto closing
   */
  public onOpen() {
    const olcClasses =this.overlayContainer.getContainerElement().classList;


    if(this.config.type === 'Expanded'){
      this.picker.close = () => {};


      olcClasses.add('expanded');


    }else{
      this.removeExpandedClass();
    }
  }


  /**
   * Removes Expanded Class from the Overlay Container if needed
   */
  removeExpandedClass(){
    const olcClasses =this.overlayContainer.getContainerElement().classList;
    if (olcClasses.contains('expanded')) {
      setTimeout( () =>  olcClasses.remove('expanded'), 100);
    }

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
      this.log.info( `onChange`, value );
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
        this.onBubbleEvent( 'onInvalidChange' );
      }
    }
  }

  /**
   * Reset the Form
   */

  onResetForm(): void{
    this.dom.setTimeout( `reset-form`, () => {
      this.config.control.setValue( null, { emitEvent: true } );
      this.config.control.updateValueAndValidity();
      this.onChange();
    }, 0 );

  }


  /**
   * Determine where the click happened. Return picker close to original state
   * @param $click
   */

  onOutsideCLick($click){
    let isDatepickerAreaClick = $click.path.some( path => {
      if(path.className){
        return path.className.includes('mat-datepicker');
      }
    });

    if(isDatepickerAreaClick){
      const r = $click.path.some( path => {
        if(path.className){
          return path.className.includes('mat-overlay');
        }
      });

      if(r){
        isDatepickerAreaClick = false;
      }
    }

    const isDatepickerCancel = $click.path.some( ele =>{
      if(ele.id){
        return ele.id.includes('datepicker-cancel');
      }
    });

    const isDatepickerApply = $click.path.some( ele =>{
      if(ele.id){
        return ele.id.includes('datepicker-apply');
      }
    });

    if(!isDatepickerAreaClick || isDatepickerCancel || isDatepickerApply){



      this.picker.close = this.selfClose;
      this.picker.close();
      this.removeExpandedClass();
    }

  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy(){
    super.ngOnDestroy();
    this.removeExpandedClass();
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
