import { Component, Input } from '@angular/core';
import { IsObject } from '../../../pop-common-utility';


@Component({
  template: `
    <div class="pop-template-error">
      <div class="pop-template-error-row">
        <h5>{{error.code}} - {{error.message}}</h5>
      </div>
    </div>
  `,
  styles: [ `
    .pop-template-error {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 30px;
      justify-content: center;
      align-items: center;
      font-size: 1em;
      color: white;
      padding: 10px;
      background: red;
      box-sizing: border-box;
    }

    .pop-template-error-row {
      display: flex;
      width: 100%;
      min-height: 30px;
      justify-content: center;
      align-items: center;
      clear: both;
      word-wrap: break-word;
      box-sizing: border-box;
    }
  ` ]
})
export class PopTemplateErrorComponent {
  @Input() error: { code: number, message: string };


  constructor(){
    if( !IsObject(this.error) ) this.error = { message: 'Something went wrong!', code: 500 };
  }
}
