import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { FieldConfig, PopBaseEventInterface } from '../../../../pop-common.model';
import { TimeConfig } from '../../../base/pop-field-item/pop-time/time-config.model';
import { DateConfig } from '../../../base/pop-field-item/pop-date/date-config.model';
import { ConvertDateFormat, ConvertDateToTimeFormat } from '../../../../pop-common-utility';


@Component({
  selector: 'lib-pop-entity-datetime',
  templateUrl: './pop-entity-datetime.component.html',
  styleUrls: [ './pop-entity-datetime.component.scss' ]
})
export class PopEntityDatetimeComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() field: FieldConfig;

  public name ='PopEntityDatetimeComponent';


  constructor(
    public el: ElementRef,
  ){
    super();
    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {
        this.id = this.field.id;
        this.trait.bubble = true;
        this.dom.state.open = false;
        this.dom.state.footer_adjust = false;
        this.dom.state.row1 = {
          first: true,
          visible: true,
        };
        this.setDateItem();
        this.setTimeItem();
        resolve(true);
      });
    };
  }


  /**
   * This component should have a specific purpose
   */
  ngOnInit(){
    super.ngOnInit();
  }


  setDateItem(): void{
    let dateValue = this.field.items[ 'datetime' ].value ? ConvertDateFormat(this.field.items[ 'datetime' ].value, 'mm/dd/yyyy') : null;
    dateValue = dateValue === '12/31/1969' ? null : dateValue;
    // console.log(dateValue, 'dateValue');
    this.field.items[ 'date' ] = new DateConfig({
      label: 'Date',
      value: dateValue,
    });
  }


  setTimeItem(): void{
    const timeValue = this.field.items[ 'datetime' ].value ? ConvertDateToTimeFormat(this.field.items[ 'datetime' ].value) : null;
    this.field.items[ 'time' ] = new TimeConfig({
      label: 'Time',
      time: 12,
      interval: 1,
      value: timeValue,
    });
  }


  emitInputEvent(name, config: any, message: string = null, success: boolean = null): void{
    if( this.field.options.bubble ) this.events.emit({ source: this.name, type: 'field', name: name, config: config, success: success, message: message });
  }


  handleDateEvent(event): void{
    const items = this.field.items;
    if( items[ 'datetime' ] && items[ 'time' ] && items[ 'time' ].value ){
      const datetimeValue = ConvertDateFormat(items[ 'date' ].control.value, 'yyyy-mm-dd') + ' ' + items[ 'time' ].control.value;
      // console.log(datetimeValue, 'datetimeValue');
      items[ 'datetime' ].triggerOnChange(datetimeValue);
    }
    if( this.field.options.bubble ){
      this.emitInputEvent(event.name, this.field.items[ 'date' ]);
    }
    // this.events.emit(event);
  }


  handleEvent(event: PopBaseEventInterface): void{
    // console.log(event, 'handleEventEmail');

    this.events.emit(event);
  }


  handleTimeEvent(event){
    if( event.type === 'field' && event.name === 'onChange' ){
      const items = this.field.items;
      if( items[ 'datetime' ] && items[ 'date' ] && items[ 'date' ].value ){
        const datetimeValue = ConvertDateFormat(items[ 'date' ].control.value, 'yyyy-mm-dd') + ' ' + items[ 'time' ].control.value;
        console.log(datetimeValue, 'datetimeValue');
        items[ 'datetime' ].triggerOnChange(datetimeValue);
      }
    }

    if( this.field.options.bubble ){
      this.emitInputEvent(event.name, this.field.items[ 'time' ]);
    }
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }

}
