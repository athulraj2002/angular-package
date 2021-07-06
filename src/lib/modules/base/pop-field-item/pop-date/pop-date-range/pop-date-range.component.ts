import { Component, ElementRef, Input,Output, EventEmitter, OnDestroy, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import { MatDateRangePicker } from "@angular/material/datepicker";
import { PopFieldItemComponent } from '../../pop-field-item.component';
import { PopDate } from '../../../../../pop-common.model';
import { IsObject } from '../../../../../pop-common-utility';
import { FormControl } from '@angular/forms';
import { DateRangeExpansionItemsComponent } from './expansion-items/date-range-expansion-items.component';
import { DateRangeConfig } from './date-range-config.models';
import { ValidationErrorMessages } from '../../../../../services/pop-validators';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component( {
  selector: 'lib-pop-date-range',
  templateUrl: 'pop-date-range.component.html',
  styleUrls: [ 'pop-date-range.component.scss' ]
} )
export class PopDateRangeComponent extends PopFieldItemComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() config: DateRangeConfig = new DateRangeConfig();
  @Output() apply = new EventEmitter();
  ExpansionItems =  DateRangeExpansionItemsComponent;
  @ViewChild('dateRangePicker') picker: MatDateRangePicker<any>;

  public name = 'PopDateRangeComponent';
  private selfClose: () => void;

  constructor(public el: ElementRef,  private overlayContainer: OverlayContainer){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {

        this.config.triggerOnChange = ( value: {start: string | number | null, end:  string | number | null}, forcePatch = false ) => {
          this.dom.setTimeout( `config-trigger-change`, () => {
            // this.cdr.detectChanges();
            this.onChange( 'start',value.start, forcePatch );
            this.onChange( 'end',value.end, forcePatch );
          }, 0 );
        };

        this.config.clearMessage = () => {
          this.dom.setTimeout( `config-clear-message`, () => {
            this.config.message = '';
            this.config.formGroup.get('start').markAsPristine();
            this.config.formGroup.get('start').markAsPristine();
            this.config.formGroup.get('end').markAsPristine();
            this.config.formGroup.get('end').markAsPristine();
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
   * Get the date control name for start or end
   * @param type: start or end
   */

  getDateControlName(type: 'start' | 'end'){
    if(type === 'start') return Object.keys(this.config.formGroup.controls)[0];
    else if(type === 'end') return Object.keys(this.config.formGroup.controls)[1];
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

    if(isDatepickerCancel || isDatepickerApply){
      this.onChange('start');
      this.onChange('end');
      this.picker.close = this.selfClose;
      this.picker.close();
      this.removeExpandedClass();

      if(isDatepickerApply){
        this.apply.emit({start: this.config.formGroup.get('start').value, end: this.config.formGroup.get('end').value});
      }
    }else if(!isDatepickerAreaClick){
      this.picker.close = this.selfClose;
      this.picker.close();
      this.removeExpandedClass();
    }


  }

  /**
   * On Change event
   * @param controlName
   * @param value
   * @param force
   */
  onChange(  controlName: 'start' | 'end',  value?: any,  force = false, ){

   value = this.config.formGroup.get(this.getDateControlName(controlName)).value;

    if( value ){
      value = PopDate.toIso( value );
    }else{
      value = null;
    }

    if( IsObject( this.config, [ 'formGroup' ] ) ){
      this.log.info( `onChange`, value );


      const control = <FormControl>this.config.formGroup.get(controlName);
      if( typeof value !== 'undefined' ){
         control.setValue( value );
         control.markAsDirty();
         control.updateValueAndValidity();
      }
      if( this.isChangeValid(controlName) ){
         value = typeof value !== 'undefined' ? value : this.config.formGroup.get(this.getDateControlName(controlName)).value;
         value = this._applyTransformation( value );
         if( this.config.patch && ( this.config.patch.path || this.config.facade ) ){
           this._onPatch( value, force );
         }else{
           this.onBubbleEvent( 'onChange' );
         }
       }else{
      }
    }
  }


  /**
   * Check to see if change is valid
   * @param controlName: start or end
   * @protected
   */

  protected isChangeValid(controlName: 'start' | 'end'){


    const control = <FormControl> this.config.formGroup.get(this.getDateControlName(controlName)).value;
    if(control){
      if( control.invalid ){
        if( this.config.displayErrors ) this._setMessage( ValidationErrorMessages( control.errors ) );
        return false;
      }
    }

    return this._checkPrevent();
  }


  /**
   * Reset Form event
   */

  onResetForm(): void{
    this.dom.setTimeout( `reset-form`, () => {
      this.config.formGroup.get('start').setValue( null, { emitEvent: true } );
      this.config.formGroup.get('start').updateValueAndValidity();
      this.config.formGroup.get('end').setValue( null, { emitEvent: true } );
      this.config.formGroup.get('end').updateValueAndValidity();
      this.onChange('start');
      this.apply.emit({start:null,end:null});
    }, 0 );

  }

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
