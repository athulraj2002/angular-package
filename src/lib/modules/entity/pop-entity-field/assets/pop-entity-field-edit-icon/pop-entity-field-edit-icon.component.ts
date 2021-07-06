import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FieldConfig, PopBaseEventInterface } from '../../../../../pop-common.model';


@Component({
  selector: 'lib-pop-entity-field-edit-icon',
  templateUrl: './pop-entity-field-edit-icon.component.html',
  styleUrls: [ './pop-entity-field-edit-icon.component.scss' ]
})
export class PopEntityFieldEditIconComponent implements OnInit {
  @Input() dom;
  @Input() field: FieldConfig;
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();


  constructor(){
  }


  ngOnInit(){
  }


  onEdit(){
    this.dom.state.open = true;
    this.field.state = 'template_edit';
    this.events.emit({ source: 'PopEntityFieldEditIconComponent', type: 'field', name: 'edit', field: this.field });
  }

}
