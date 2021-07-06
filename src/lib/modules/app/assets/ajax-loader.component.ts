import { Component } from '@angular/core';
import { RandomArrayElement } from '../../../pop-common-utility';


@Component({
  template: `
    <div class="pop-template-ajax-loader">
      <div class="pop-template-ajax-row">
        <h5>{{expression}}</h5>
      </div>
      <div class="pop-template-ajax-row">
        <lib-main-spinner
          [options]="{strokeWidth:10, color:'primary', diameter:40}">
        </lib-main-spinner>
      </div>
    </div>
  `,
  styles: [ `
    .pop-template-ajax-loader {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 30px;
      justify-content: center;
      align-items: center;
    }

    .pop-template-ajax-row {
      display: flex;
      width: 100%;
      min-height: 30px;
      justify-content: center;
      align-items: center;
      clear: both;
    }
  ` ]
})
export class PopTemplateAjaxLoaderComponent {
  expression;


  constructor(){
    const greetings = [
      `Just a sec ...`,
      `Git \'Er Done`,
      `This may take a while ...`,
      `No Problemo`,
    ];
    this.expression = RandomArrayElement(greetings);

  }

}
