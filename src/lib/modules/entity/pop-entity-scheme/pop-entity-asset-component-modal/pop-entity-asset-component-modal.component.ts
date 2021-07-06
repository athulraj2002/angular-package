import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { EntitySchemeSectionInterface } from '../pop-entity-scheme.model';
import { PopExtendComponent } from '../../../../pop-extend.component';


@Component({
  selector: 'lib-pop-entity-asset-component-modal',
  templateUrl: './pop-entity-asset-component-modal.component.html',
  styleUrls: [ './pop-entity-asset-component-modal.component.scss' ]
})
export class PopEntityAssetComponentModalComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() config: EntitySchemeSectionInterface = <EntitySchemeSectionInterface>{};

  public name = 'PopEntityAssetComponentModalComponent';


  constructor(
    public el: ElementRef,
  ){
    super();
    /**
     * Configure the specifics of this component
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {
        resolve(true);
      });
    };
  }


  /**
   * This component should have a purpose
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
