import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'lib-pop-entity-field-spacer',
  template: '<div class="entityId-field-spacer sw-clear"></div>',
  styles: [ '.entityId-field-spacer { display: flex; height: 10px; clear:both; }' ]
})
export class PopEntityFieldSpacerComponent implements OnInit {

  constructor(){
  }


  ngOnInit(){
  }

}
