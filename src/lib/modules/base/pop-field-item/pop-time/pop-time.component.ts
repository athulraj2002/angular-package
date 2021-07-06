import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { TimeConfig } from './time-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';


@Component({
  selector: 'lib-pop-time',
  templateUrl: './pop-time.component.html',
  styleUrls: [ './pop-time.component.scss' ]
})
export class PopTimeComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
  @Input() config: TimeConfig = new TimeConfig();
  public name = 'PopTimeComponent';


  constructor(
    public el: ElementRef,
    protected cdr: ChangeDetectorRef
  ){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {

        this.config.time = 12;
        this.ui.time = {
          12: {
            hours: [],
            minutes: [],
            periods: [ 'AM', 'PM' ]

          },
          24: {
            hours: [],
            minutes: [],
            periods: []
          },
          selectedHour: '12',
          selectedMinute: '00',
          selectedPeriod: 'AM',
        };

        this.setHoursAndMinutes();
        this.setSelectedValues();
        this.config.triggerOnChange = (value: string | number | null) => {
          this.cdr.detectChanges();
          this.onChange(value, true);
        };

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

  protected setSelectedValues(): void{
    const time = this.ui.time;
    const timeValue = this.config.control.value;
    const minuteValue = timeValue.slice(2, 5).replace(/[^a-zA-Z0-9]/g, '').padStart(2, '0');
    let hourValue = timeValue.slice(0, 2).replace(/[^a-zA-Z0-9]/g, '').padStart(2, '0');
    hourValue = ( ( hourValue % 12 ) || 12 ).toString(10).padStart(2, '0');
    if( Number(hourValue) > 12 && this.config.time === 12 ) time.selectedPeriod = 'PM';
    if( timeValue ) time.selectedHour = hourValue;
    time.selectedMinute = minuteValue;
  }


  protected setHoursAndMinutes(): void{
    let i;
    const hourLimit = this.config.time === 12 ? 12 : 23;
    for( i = 1; i <= hourLimit; i++ ){
      this.ui.time[ this.config.time ].hours.push(i.toString().padStart(2, '0'));
    }
    for( i = 0; i < 60; i += this.config.interval ){
      this.ui.time[ this.config.time ].minutes.push(i.toString().padStart(2, '0'));
    }
  }


  protected setTimeValue(): void{
    let selectedHour = this.ui.time.selectedHour;
    if( this.ui.time.selectedPeriod === 'AM' && Number(selectedHour) === 12 ) selectedHour = '00';
    if( this.ui.time.selectedPeriod === 'PM' && Number(selectedHour) > 12 ) selectedHour = ( 12 + Number(selectedHour) ).toString(10);
    const selectedTime = selectedHour + ':' + this.ui.time.selectedMinute + ':00';
    this.config.control.setValue(selectedTime, { emitEvent: false });
  }
}
