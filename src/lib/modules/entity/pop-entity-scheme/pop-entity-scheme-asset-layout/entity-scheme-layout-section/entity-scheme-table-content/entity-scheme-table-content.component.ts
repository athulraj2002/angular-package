import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ProfileSchemeFieldInterface } from '../../../pop-entity-scheme.model';
import { PopExtendComponent } from '../../../../../../pop-extend.component';


@Component({
  selector: 'lib-entity-scheme-table-content',
  templateUrl: './entity-scheme-table-content.component.html',
  styleUrls: [ './entity-scheme-table-content.component.scss' ]
})
export class EntitySchemeTableContentComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() config: ProfileSchemeFieldInterface = <ProfileSchemeFieldInterface>{};

  public name ='EntitySchemeTableContentComponent';

  constructor(
    public el: ElementRef,
  ){
    super();
    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {
        return resolve(true);
      });
    };
  }


  /**
   * This component is responsible to render the inner contents of table asset
   * A table asset is basically a column that exists on the base table of an entity, ..ie: id, name, description ...
   */
  ngOnInit(){
    super.ngOnInit();
  }



  /**
   * Clean up the dom of this component
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }
}
