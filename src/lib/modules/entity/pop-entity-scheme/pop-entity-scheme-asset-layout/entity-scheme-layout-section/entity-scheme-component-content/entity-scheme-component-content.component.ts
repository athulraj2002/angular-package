import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../../../../pop-extend.component';


@Component({
  selector: 'lib-entity-scheme-component-content',
  templateUrl: './entity-scheme-component-content.component.html',
  styleUrls: [ './entity-scheme-component-content.component.scss' ]
})
export class EntitySchemeComponentContentComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() config: any = {};

  public name ='EntitySchemeComponentContentComponent';


  constructor(
    public el: ElementRef,
  ){
    super();

    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {
        resolve(true);
      });
    };
  }


  /**
   * This component is responsible to render the inner contents of component asset
   * A component asset is custom widget that has been created for the entityId
   */
  ngOnInit(){
    super.ngOnInit();
    this.dom.configure().then(() => {
      this.dom.register();
      this.dom.ready();
    });
  }


  /**
   * Clean up the dom of this component
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }
}
