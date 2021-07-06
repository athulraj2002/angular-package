import {
  Component, ElementRef, EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef, ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { PopExtendDynamicComponent } from '../../../pop-extend-dynamic.component';
import { EntityFieldComponentInterface } from './pop-entity-field.model';
import { CoreConfig, Dictionary, DynamicComponentInterface, FieldConfig, PopBaseEventInterface, ServiceInjector } from '../../../pop-common.model';
import { PopContextMenuConfig } from '../../base/pop-context-menu/pop-context-menu.model';
import { IsObjectThrowError, StorageGetter } from '../../../pop-common-utility';
import { PopEntityFieldService } from './pop-entity-field.service';


@Component({
  selector: 'lib-pop-entity-field',
  styleUrls: [ './pop-entity-field.component.scss' ],
  templateUrl: './pop-entity-field.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class PopEntityFieldComponent extends PopExtendDynamicComponent implements EntityFieldComponentInterface, OnInit, OnDestroy {
  @Input() field: FieldConfig;
  @ViewChild('container', { read: ViewContainerRef, static: true }) private container;

  public name = 'PopEntityFieldComponent';

  protected srv: {
    field: PopEntityFieldService,
    router: Router,
  } = {
    field: ServiceInjector.get(PopEntityFieldService),
    router: ServiceInjector.get(Router),
  };


  constructor(
    public el: ElementRef,
  ){
    super();


    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {
        // #1 Check Required Data:
        this.field = IsObjectThrowError(this.field, [ 'id' ], `${this.name}:configure: - this.field`) ? this.field : null;
        this.id = this.field.id;
        // #2 Attach a context menu
        this._attachContextMenu();
        // #3 Handle Bubble events
        this.dom.handler.bubble = (core: CoreConfig, event: PopBaseEventInterface) => this.onBubbleEvent('handler', null, event);
        this.trait.bubble = true; // leave this on

        // #5: Render the dynamic field
        this.template.attach('container'); // 'container' references the @viewChild at top of file
        this.template.render([ <DynamicComponentInterface>{
          type: this.field.component,
          inputs: {
            core: this.core,
            field: this.field,
          }
        } ]);

        // set states
        this._setFieldState();

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
   * The user can call actions on this field
   * @param event
   */
  onActionButtonClick(event: PopBaseEventInterface){
    this.log.event(`onActionButtonClick`, event);
    if( event.type === 'field' ){
      if( event.name === 'add' ){
        this.onAdd(event);
      }else if( event.name === 'remove' ){
        // this.onRemove(event);
      }else if( event.name === 'close' ){
        // this.onClose(event);
      }
    }
    return true;
  }


  /**
   * User wants to add a value entry into the field
   * @param event
   */
  onAdd(event: PopBaseEventInterface){
    this.log.event(`onAdd`, event);
    if( this.field.facade ){
      this.onBubbleEvent('onAdd', null, event);
    }else{
      const childEmitter = <EventEmitter<PopBaseEventInterface>>StorageGetter(this.template, [ 'refs', '0', 'instance', 'events' ]);
      if( childEmitter ){
        childEmitter.emit(event);
        this._setFieldState();
      }
    }
    return true;
  }


  /**
   * User wants to make edits to the value entries
   * @param event
   */
  onEdit(event?: PopBaseEventInterface, dataKey?: number){
    this.log.event(`onEdit`, event);
    return true;
  }


  /**
   * User wants to remove a value entry
   * @param event
   */
  onRemove(event: PopBaseEventInterface){
    this.log.event(`onRemove`, event);
    console.log('here');
    if( this.field.facade ){
      this.onBubbleEvent('onRemove', null, event);
    }else{
      console.log('real delete action');
    }
    this._setFieldState();
    return true;
  }


  /**
   * User closes the edit ability of the value entries
   * @param event
   */
  onClose(event: PopBaseEventInterface){
    this.log.event(`onClose`, event);
    return true;
  }


  /**
   * The user can click on a link to view the config setup of this field
   */
  onNavigateToField(): void{
    this.srv.router.navigate([ 'entities', 'fields', this.field.id ]).catch((e) => true);
  }


  /**
   * Handle the bubble events that come up
   * @param event
   */
  onBubbleEvent(name?: string, extension?: Dictionary<any>, event?: PopBaseEventInterface){
    this.log.event(`onBubbleEvent`, event);
    this._setFieldState();
    this.events.emit(event);
    return true;
  }


  /**
   * Clean up the dom of this component
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  /**
   * Set internal state flags of a field
   * @private
   */
  private _setFieldState(): void{

    this.dom.setTimeout(`allow-template-changes`, () => {
      // this.field.canAdd = this.field.multiple && this.field.data_keys.length < this.field.multiple_max;
      this.field.canAdd = this.field.multiple && this.field.data_keys.length < this.field.entries.length;
      this.field.canRemove = this.field.multiple && this.field.data_keys.length > this.field.multiple_min;
    }, 100);

  }


  /**
   * Interept the mouse right click to show a context menu for this field
   * @param event
   */
  private _attachContextMenu(): void{

    this.dom.contextMenu.config = new PopContextMenuConfig();
    //
    this.dom.contextMenu.configure = (event: MouseEvent) => {
      const hasAccess = true; // TBD
      if( hasAccess && this.dom.contextMenu.config ){
        event.preventDefault(); // prevent the default behavior of the right click.
        // reset the context menu, and configure it to load at the position clicked.
        this.dom.contextMenu.config.resetOptions();
        this.dom.contextMenu.config.addPortalOption('field', this.field.id);
        this.dom.contextMenu.config.addNewTabOption(`entities/fields/${this.field.id}`);

        this.dom.contextMenu.config.x = event.clientX;
        this.dom.contextMenu.config.y = event.clientY;
        this.dom.contextMenu.config.toggle.next(true);
      }
    };
    this.dom.setSubscriber('context-menu', this.dom.contextMenu.config.emitter.subscribe((event: PopBaseEventInterface) => {
      this.events.emit(event);
    }));
  }
}
