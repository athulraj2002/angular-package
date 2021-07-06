import { Component} from '@angular/core';
import { ServiceInjector } from '../../../pop-common.model';
import { PopBaseService } from '../../../services/pop-base.service';
import { RandomArrayElement } from '../../../pop-common-utility';


@Component({
  template: `
    <div class="pop-template-welcome">
      <div class="pop-template-welcome-row">
        <h4>{{expression}}</h4>
      </div>
    </div>
  `,
  styles: [ `
    .pop-template-welcome {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 30px;
      justify-content: center;
      align-items: center;
      font-size: 1.5em;
      background: var(--background-2);
    }

    .pop-template-welcome-row {
      display: flex;
      width: 100%;
      min-height: 30px;
      justify-content: center;
      align-items: center;
      clear: both;
    }
  ` ]
})
export class PopTemplateWelcomeComponent {
  expression;


  constructor(){
    const name = ServiceInjector.get(PopBaseService).getAuthPrimeUser().first_name;
    const greetings = [
      `Hola!`,
      `Welcome Back, ${name}`,
      `Howd, partner`,
      `Good to see you, ${name}`,
      `Hello, ${name}`,
      `Lets do this!`,
      `Alright, Alright, Alright ...`
    ];
    this.expression = RandomArrayElement(greetings);

  }
}
