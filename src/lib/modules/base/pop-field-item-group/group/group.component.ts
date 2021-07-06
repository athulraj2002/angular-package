import { Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldItemGroupConfig } from '../pop-field-item-group.model';
import { Subscription } from 'rxjs';
import { CoreConfig, DynamicComponentInterface, PopBaseEventInterface } from '../../../../pop-common.model';
import { ConvertArrayToOptionList, IsArray, IsObject } from '../../../../pop-common-utility';
import { EvaluateWhenCondition, IsValidFieldPatchEvent } from '../../../entity/pop-entity-utility';
import { PopExtendDynamicComponent } from '../../../../pop-extend-dynamic.component';


@Component({
  selector: 'lib-group',
  templateUrl: './group.component.html',
  styleUrls: [ './group.component.scss' ]
})
export class GroupComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
  @ViewChild('container', { read: ViewContainerRef, static: true }) private container;
  @Input() config: FieldItemGroupConfig;

  subscribers: Subscription[] = [];

  public name = 'GroupComponent';


  constructor(
    public el: ElementRef,
  ){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {

        // Attach the container for of the field item list element
        this.template.attach('container'); // container references the @viewChild('container')

        this.core.entity = {
          id: 0,
          name: null
        };

        this.config.fieldItemMap = {};
        const fieldItemComponentList = <DynamicComponentInterface[]>[];
        this.config.fieldItems.map((fieldItem) => {
          const existingValue = 'control' in fieldItem.config ? fieldItem.config.control.value : null;
          this.core.entity[ fieldItem.model.name ] = existingValue;
        });

        this.config.fieldItems.map((fieldItem, index) => {
          if( fieldItem && IsObject(fieldItem.model, [ 'name' ]) && fieldItem.config && fieldItem.component ){
            this.config.fieldItemMap[ fieldItem.model.name ] = index;

            if(this.config.inDialog) fieldItem.config.bubble = true;


            const component = <DynamicComponentInterface>{
              type: fieldItem.component,
              inputs: {
                config: fieldItem.config,
                position: fieldItem.config[ 'metadata' ].position ? fieldItem.config[ 'metadata' ].position : 1,
                hidden: IsArray(fieldItem.model.when, true) ? !( EvaluateWhenCondition(this.core, fieldItem.model.when, this.core) ) : false,
                when: IsArray(fieldItem.model.when, true) ? fieldItem.model.when : null
              }
            };
            fieldItemComponentList.push(component);
          }
        });

        this.template.render(fieldItemComponentList, [], true);


        this.dom.handler.bubble = (core: CoreConfig, event: PopBaseEventInterface) => {
          if( IsValidFieldPatchEvent(this.core, event) ){
            if( event.config.name in this.core.entity ){
              const newValue = isNaN(event.config.control.value) ? event.config.control.value : +event.config.control.value;
              this.core.entity[ event.config.name ] = newValue;
              if( this.config.fieldItems.length > 1 ){
                this._resetComponentListHidden();
                this.dom.setTimeout(`update-relations`, () => {
                  this._triggerParentChildUpdates(event.config.name);
                }, 0);
              }
            }
          }
          if( event.config.bubble || [ 'patch', 'portal' ].includes(event.name) ){
            this.events.emit(event);
          }
        };


        this.config.getField = (name: string) => {
          if( name && name in this.config.fieldItemMap ){
            return this.config.fieldItems[ this.config.fieldItemMap[ name ] ];
          }
          return null;
        };

        this.events.emit({ source: 'GroupComponent', type: 'field_group', name: 'init', id: this.config.id, group: this.config });
        resolve(true);
      });
    };

    this.dom.proceed = ()=> {
      return new Promise( ( resolve ) => {
        this.dom.setTimeout(`parent-child`, ()=>{
          this._triggerParentChildUpdates('client_id');
        })
        return resolve( true );
      } );
    };
  }


  /**
   * This component should have a specific purpose
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy(){
    this.subscribers.map(function(subscription: Subscription){
      if( subscription ) subscription.unsubscribe();
    });
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  /**
   * Get a linear list of the parent child relations from a given point
   * @param self the name to start from (usually the field that has just been changed by user)
   * @param list
   */
  private _getRelationList(name: string, list: any[] = []){ // recursive loop
    let item;
    if( name && name in this.config.fieldItemMap ){
      item = this.config.fieldItems[ this.config.fieldItemMap[ name ] ];
      if( IsObject(item, [ 'config', 'model' ]) ){
        list.push({
          name: item.config.name,
          autoFill: this._fieldHasAutoFill(name),
        });
        if( this._fieldHasChild(name) ){
          this._getRelationList(this.config.fieldItems[ this.config.fieldItemMap[ name ] ].model.options.child, list);
        }
      }

    }
    return list;
  }


  /**
   * Determine if field has a child relation in the list
   * @param name
   */
  private _fieldHasChild(name: string){
    if( name in this.config.fieldItemMap && this.config.fieldItems[ this.config.fieldItemMap[ name ] ].model && this.config.fieldItems[ this.config.fieldItemMap[ name ] ].model.options ){
      if( this.config.fieldItems[ this.config.fieldItemMap[ name ] ].model.options.child ){
        return true;
      }
    }

    return false;
  }


  /**
   * Determine if field should be auto filled with the first item in the list
   * @param name
   */
  private _fieldHasAutoFill(name: string){
    if( name in this.config.fieldItemMap && this.config.fieldItems[ this.config.fieldItemMap[ name ] ].model && this.config.fieldItems[ this.config.fieldItemMap[ name ] ].model.options ){
      if( this.config.fieldItems[ this.config.fieldItemMap[ name ] ].model.autoFill ){
        return true;
      }
    }

    return false;
  }


  private _triggerParentChildUpdates(name: string){
    console.log('triggerParentChildUpdates', name);

    if( this._fieldHasChild(name) ){
      let values;
      let child_fk;
      let childField;
      let autoFill = false;
      let set;
      let resource;
      const relations = this._getRelationList(name);
      // console.log('relations', relations);
      relations.some((relation) => {
        if( relation.autoFill ){
          autoFill = true;
          return true;
        }
      });

      if( name && name in this.config.fieldItemMap ){
        child_fk = this.config.fieldItems[ this.config.fieldItemMap[ name ] ].model.options.child;
        if( child_fk && child_fk in this.config.fieldItemMap ){
          childField = this.config.fieldItems[ this.config.fieldItemMap[ child_fk ] ];
          // console.log('child field', childField);
          if( childField.model.form === 'select' ){
            if( childField.model.options.resource ){
              // console.log('has resource', childField.model.options.resource, this.config.metadata[ childField.model.options.resource ]);
              if( IsObject(this.config.metadata[ childField.model.options.resource ], [ 'data_values' ]) ){
                resource = this.config.metadata[ childField.model.options.resource ].data_values;
              }
            }
            // console.log('resource', resource);
            if( IsArray(resource, true) ){
              values = ConvertArrayToOptionList(resource, {
                // ensure that an option shows up in list in case other conditions remove it, aka it has been archived
                prevent: [], // a list of ids that should not appear in the list for whatever reason
                // parent means this options should all have a common field trait like client_fk, account_fk ....
                parent: childField.model.options.parent ? {
                  field: childField.model.options.parent,
                  value: this.core.entity[ childField.model.options.parent ]
                } : null,
                empty: childField.model.options.empty ? childField.model.options.empty : null,
              });
            }else{
              values = [];
            }
            // console.log('values', values);

            if( autoFill && values.length ){
              set = values[ values.length - 1 ].value;
            }else{
              set = null;
            }
            childField.config.options.values = values;
            autoFill = autoFill && values.length ? values[ 0 ].value : null;
            if( typeof childField.config.triggerOnChange === 'function' ) childField.config.triggerOnChange(set);

            this.dom.setTimeout(`clear-message-${child_fk}`, () => {
              if( typeof childField.config.clearMessage === 'function' ){
                childField.config.clearMessage();
              }
            }, 0);

          }
        }
      }
    }

  }


  /**
   * Whenever a update to the core entity happens the fields in the group should be re-evaluated if there are when conditionals set
   * @private
   */
  private _resetComponentListHidden(){
//     console.log('_resetComponentListHidden', this.template.refs);
    let name;
    this.template.refs.filter((componentRef: ComponentRef<any>) => {
      return IsObject(componentRef.instance.config, true) && IsArray(componentRef.instance.when, true);
    }).map((componentRef: ComponentRef<any>) => {
      name = componentRef.instance.config.name;
      if( name && name in this.config.fieldItemMap ){
        componentRef.instance.hidden = !EvaluateWhenCondition(this.core, componentRef.instance.when, this.core);
      }
    });
  }
}
