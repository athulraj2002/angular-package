import { Component, ComponentFactoryResolver, ComponentRef, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { ComponentTemplateInterface, DestroyComponentTemplate, GetComponentTemplateContainer } from './pop-common-dom.models';
import {DynamicComponentInterface, PopBaseEventInterface, PopComponentResolver} from './pop-common.model';
import { Subscription } from 'rxjs';
import { ServiceInjector } from './pop-common.model';
import { PopExtendComponent } from './pop-extend.component';
import { IsDefined, IsObject, IsString } from './pop-common-utility';


@Component( {
  selector: 'lib-pop-template-component',
  template: `Template Component`,
} )
export class PopExtendDynamicComponent extends PopExtendComponent implements OnInit, OnDestroy {
  protected template: ComponentTemplateInterface = GetComponentTemplateContainer();


  constructor(){
    super();

    this.template = <ComponentTemplateInterface>{
      ...this.template, ...{
        attach: ( container: string | ViewContainerRef ) => {
          if( IsString( container, true ) ){
            if( this[ <string> container ] ){
              this.template.container = this[ <string>container ];
              delete this[ <string>container ];
            }else{
            }
          }else{
            this.template.container = <ViewContainerRef>container;
          }
        },

        render: ( list: DynamicComponentInterface[], transfer = [ 'core', 'position' ], bypassTransfer = false ) => {
          this.template.ref_events.map( ( subscription: Subscription ) => {
            if( subscription && typeof subscription.unsubscribe === 'function' ){
              subscription.unsubscribe();
            }
          } );

          this.template.refs = this.template.refs.map( function( componentRef: ComponentRef<any> ){
            if( componentRef && typeof componentRef.destroy === 'function' ){
              componentRef.destroy();
            }
            componentRef = null;
            return null;
          } );
          this.template.transfer = {};
          if( !bypassTransfer ){
            transfer.map( ( transferKey: string ) => {
              if( typeof this[ transferKey ] !== 'undefined' ){
                this.template.transfer[ transferKey ] = this[ transferKey ];
              }
            } );
          }
          if( this.template && this.template.container ){


            this.template.container.clear();
            if( Array.isArray( list ) ){
              list.map( ( component: DynamicComponentInterface ) => {
                if( IsObject( component, true ) && IsDefined( component.type ) ){
                  const factory = PopComponentResolver.resolveComponentFactory( component.type );
                  const componentRef = <any>this.template.container.createComponent( factory );

                  if( componentRef.instance.events ){
                    this.template.ref_events.push( componentRef.instance.events.subscribe( ( event: PopBaseEventInterface ) => {
                      if( typeof this.dom.handler.bubble === 'function' ){
                        this.dom.handler.bubble( this.core, event );
                      }else{
                        if( this.trait.bubble ) this.events.emit( event );
                      }
                    } ) );
                  }

                  if( typeof( component.inputs ) === 'object' ){
                    Object.keys( component.inputs ).map( ( key ) => {
                      if( typeof( key ) === 'string' && typeof( component.inputs[ key ] ) !== 'undefined' ){
                        componentRef.instance[ key ] = component.inputs[ key ];
                      }
                    } );
                  }
                  Object.keys( this.template.transfer ).map( ( transferKey: string ) => {
                    componentRef.instance[ transferKey ] = this.template.transfer[ transferKey ];
                  } );
                  componentRef.changeDetectorRef.detectChanges();
                  this.template.refs.push( componentRef );
                }
              } );
            }
          }
        },
        clear: () => {
          if( this.template.container ) this.template.container.clear();
        },

        destroy: () => {
          if( this.template ) DestroyComponentTemplate( this.template );
        },
      }
    };
  }


  ngOnInit(){
    super.ngOnInit();
  }


  ngOnDestroy(){
    this.template.destroy();
    super.ngOnDestroy();
  }

}
