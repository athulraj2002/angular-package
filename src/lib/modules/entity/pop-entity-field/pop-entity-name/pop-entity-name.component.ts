import { Component, ElementRef, Input, OnDestroy, OnInit, } from '@angular/core';
import { EntityFieldComponentInterface } from '../pop-entity-field.model';
import { FieldConfig } from '../../../../pop-common.model';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { NameFieldSetting } from './name.setting';


@Component({
  selector: 'lib-pop-entity-name',
  templateUrl: './pop-entity-name.component.html',
  styleUrls: [ './pop-entity-name.component.scss' ],
})
export class PopEntityNameComponent extends FieldTemplate implements EntityFieldComponentInterface, OnInit, OnDestroy  {
  @Input() field: FieldConfig;

  public name = 'PopEntityNameComponent';


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService
  ){
    super(el, _domRepo, NameFieldSetting);
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

}
