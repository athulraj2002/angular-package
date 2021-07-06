import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { PopContextMenuConfig, PopContextMenuOption } from './pop-context-menu.model';


@Component({
  selector: 'lib-pop-context-menu',
  templateUrl: './pop-context-menu.component.html',
  styleUrls: [ './pop-context-menu.component.scss' ]
})
export class PopContextMenuComponent implements OnInit {
  @Input() config: PopContextMenuConfig;
  @ViewChild(MatMenuTrigger, { static: true }) trigger: MatMenuTrigger;


  constructor(){
  }


  ngOnInit(){
    this.config.toggle.subscribe(active => {
      if( active ) this.trigger.openMenu();
      if( !active ) this.trigger.closeMenu();
    });
  }


  public onMenuClick(option: PopContextMenuOption){
    if( option.type === 'new_tab' ) window.open(option.url, '_blank');
    if( option.type === 'portal' ) this.config.emitter.emit({
      source: 'PopContextMenuComponent',
      type: 'context_menu',
      name: 'portal',
      open: true,
      internal_name: option.metadata.internal_name,
      id: option.metadata.id,
      option: option
    });
  }

}
