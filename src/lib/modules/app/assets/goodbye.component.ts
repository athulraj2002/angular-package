import { Component, OnInit } from '@angular/core';
import { ServiceInjector } from '../../../pop-common.model';
import { PopBaseService } from '../../../services/pop-base.service';
import { RandomArrayElement } from '../../../pop-common-utility';


@Component({
  template: `
    <div class="pop-template-goodbye">
      <div class="pop-template-goodbye-row">
        <h4>{{expression}}</h4>
      </div>
    </div>
  `,
  styles: [ `
    .pop-template-goodbye {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 30px;
      justify-content: center;
      align-items: center;
      font-size: 1.5em;
    }

    .pop-template-goodbye-row {
      display: flex;
      width: 100%;
      min-height: 30px;
      justify-content: center;
      align-items: center;
      clear: both;
    }
  ` ]
})
export class PopTemplateGoodByeComponent {

  expression;


  constructor(){
    const name = ServiceInjector.get(PopBaseService).getAuthPrimeUser().first_name;
    const greetings = [
      `Audios Amigo`,
      `See Ya Later, ${name}`,
      `Hasta la vista`,
      `Later Hater`,
      `Done so soon?`,
      `GoodBye`,
      `Thanks for all you have done, ${name}`
    ];
    this.expression = RandomArrayElement(greetings);

  }
}
