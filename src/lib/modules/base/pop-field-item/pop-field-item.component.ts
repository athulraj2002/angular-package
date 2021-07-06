import { ChangeDetectorRef, Component, ElementRef, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../pop-extend.component';
import { Dictionary, Entity, FieldItemPatchInterface, PopBaseEventInterface, PopRequest, ServiceInjector } from '../../../pop-common.model';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { ValidationErrorMessages } from '../../../services/pop-validators';
import {GetHttpErrorMsg, IsArray, IsNumber, IsObject, IsString, PopTransform} from '../../../pop-common-utility';
import { SessionEntityFieldUpdate } from '../../entity/pop-entity-utility';
import { PopEntityEventService } from '../../entity/services/pop-entity-event.service';


@Component( {
  selector: 'lib-pop-field-item-component',
  template: `Field Item Component`,
} )
export class PopFieldItemComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() position = 1;
  @Input() when: any[] = null;
  @HostBinding( 'class.sw-hidden' ) @Input() hidden = false;
  config: any;
  el: ElementRef;
  name: string;
  protected cdr: ChangeDetectorRef;


  constructor(){
    super();

    this.dom.state.helper = false;
    this.dom.state.tooltip = false;
    this.dom.state.hint = false;
  }


  /**
   * This component should have a specific purpose
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * On Link Click
   */
  onLinkClick(){
    console.log( 'LINK STUB: Link to Entity', this.config );
  }


  /**
   * On Blur Event
   */
  onBlur(){
    if( IsObject( this.config, true ) ){
      let value = this.config.control.value;
      if( IsString( value ) ){
        value = String( value ).trim();
        this.config.control.setValue( value );
      }else if( IsNumber( value ) ){
        value = +String( value ).trim();
        this.config.control.setValue( value );
      }

      this.onBubbleEvent( 'onBlur' );
      if( this._isChangeValid() ){
        if( this._isFieldPatchable() ){
          this.onChange();
        }else{
          this._applyTransformation( value );
        }
      }
    }
  }


  /**
   * On Change event
   * @param value
   * @param force
   */
  onChange( value?: any, force = false ){
    if( IsObject( this.config, [ 'control' ] ) ){
      this.log.info( `onChange`, value );
      const control = <FormControl>this.config.control;
      if( typeof value !== 'undefined' ){
        control.setValue( value );
        control.markAsDirty();
        control.updateValueAndValidity();
      }
      if( this._isChangeValid() ){
        value = typeof value !== 'undefined' ? value : this.config.control.value;
        value = this._applyTransformation( value );
        if( this.config.patch && ( this.config.patch.path || this.config.facade ) ){
          this._onPatch( value, force );
        }else{
          this.onBubbleEvent( 'onChange' );
        }
      }else{
        // console.log( 'invalid change', this.config.control.value );
        this.onBubbleEvent( 'onInvalidChange' );
      }
    }
  }


  /**
   * On Focus event
   */
  onFocus(): void{
    if( IsObject( this.config, [ 'control' ] ) ){
      const control = <FormControl>this.config.control;
      if( !control.dirty ) this.asset.storedValue = this.config.control.value;
      this.config.message = '';
      this.onBubbleEvent( 'onFocus' );
    }
  }


  /**
   * This will bubble an event up the pipeline
   * @param eventName
   * @param message
   * @param extend
   * @param force
   */
  onBubbleEvent( eventName: string, message: string = null, extend: Dictionary<any> = {}, force = false ): PopBaseEventInterface{
    if( IsObject( this.config, true ) ){
      const event = <PopBaseEventInterface>{
        type: 'field',
        name: eventName,
        source: this.name
      };
      if( this.config ) event.config = this.config;
      if( message ) event.message = message;
      Object.keys( extend ).map( ( key ) => {
        event[ key ] = extend[ key ];
      } );
      this.log.event( `onBubbleEvent`, event );
      if( this.config.bubble || force ){
        this.events.emit( event );
      }

      return event;
    }
  }


  ngOnDestroy(){
    this._clearState();
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Protected Method )                                      *
   *               These are protected instead of private so that they can be overridden          *
   *                                                                                              *
   ************************************************************************************************/

  /**
   * Hook that is called on destroy to reset the field
   */
  protected _clearState(): void{
    const patch = <FieldItemPatchInterface>this.config.patch;
    const control = <FormControl>this.config.control;
    if( patch.running ){
      control.enable();
      patch.running = false;
    }
  }


  /**
   * Hook that is called right before a patch
   */
  protected _beforePatch(): Promise<boolean>{
    return new Promise( ( resolve ) => {
      const patch = <FieldItemPatchInterface>this.config.patch;
      const control = <FormControl>this.config.control;

      control.disable();
      patch.running = true;

      this._clearMessage();

      return resolve( true );
    } );
  }


  /**
   * Hook that is called right after the api response returns
   */
  protected _afterPatch(): Promise<boolean>{
    return new Promise( ( resolve ) => {
      const patch = <FieldItemPatchInterface>this.config.patch;
      const control = <FormControl>this.config.control;

      control.enable();
      patch.running = false;

      return resolve( true );
    } );
  }


  /**
   * Prepare to make an api call to the server
   * @param value
   * @param force
   */
  protected _onPatch( value?: string | number | boolean | null | Object, force = false ){
    const patch = <FieldItemPatchInterface>this.config.patch;
    if( !force ){
      if( !this.config.control.valid ) return false;
      if( value === this.asset.storedValue ) return false;
      if( patch.trigger === 'manual' ) return false;
    }
    this._beforePatch().then( () => {
      if( this.config.facade && !force ){
        this.dom.setTimeout( 'api-facade', () => {
          this._onPatchSuccess( <Entity>{} ).then( () => this._afterPatch() );
        }, ( this.config.patch.duration || 0 ) );
      }else{
        this.log.info( `onPatch` );
        this._doPatch( this._getPatchBody( value ) );
      }
    } );
  }


  /**
   * This fx will make the actual api call to the server
   * @param body
   * @private
   */
  protected _doPatch( body: Entity ){
    const method = this.config.patch.method ? this.config.patch.method : 'PATCH';
    const patch = <FieldItemPatchInterface>this.config.patch;
    const ignore401 = ( patch.ignore401 ? true : null );
    const version = ( patch.version ? patch.version : 1 );
    if( IsString( this.config.patch.path, true ) ){
      const request = method === 'PATCH' ? PopRequest.doPatch( this.config.patch.path, body, version, ignore401, this.config.patch.businessId ) : PopRequest.doPost( this.config.patch.path, body, version, ignore401, this.config.patch.businessId );
      this.dom.setSubscriber( 'api-patch', request.subscribe(
        res => {
          this._onPatchSuccess( res ).then( () => this._afterPatch() );
        },
        err => {
          this._onPatchFail( err ).then( () => this._afterPatch() );
        }
      ) );
    }else{
      this._onPatchSuccess( body ).then( () => this._afterPatch() );
    }
  }


  /**
   * Determine if a change is valid
   */
  protected _isChangeValid(){
    const control = <FormControl>this.config.control;
    if( control.invalid ){
      if( this.config.displayErrors ) this._setMessage( ValidationErrorMessages( control.errors ) );
      return false;
    }
    return this._checkPrevent();
  }


  /**
   * Determine if a field should be patched
   */
  protected _isFieldPatchable(){
    if( this.config.facade ){
      return true;
    }else if( this.config.patch && this.config.patch.path ){
      return true;
    }
    return false;
  }


  /**
   * Helper to determine if an event is related to a field update
   * @param event
   */
  protected _isFieldChange( event: PopBaseEventInterface ){
    return event.type === 'field' && ( event.name === 'onChange' || event.name === 'patch' );
  }


  /**
   * Transformations can be applied to a value before it is sent to the api server
   * @param value
   */
  protected _applyTransformation( value: any ){
    if( IsString( this.config.transformation, true ) ){
      value = PopTransform( value, this.config.transformation );
      if( value !== this.config.control.value ) this.config.control.setValue( value );
    }
    return value;
  }


  /**
   * Handle an api call success
   * @param res
   */
  protected _onPatchSuccess( res: Entity ): Promise<boolean>{
    return new Promise( ( resolve ) => {
      this.log.info( `onPatchSuccess` );
      const patch = <FieldItemPatchInterface>this.config.patch;
      const control = <FormControl>this.config.control;
      this.asset.storedValue = control.value;
      patch.success = true;
      patch.running = false;


      const event = this.onBubbleEvent( `patch`, 'Patched.', {
        success: true,
        response: res.data ? res.data : res
      }, true );


      if( IsObject( this.core, [ 'channel' ] ) ){
        if( this.config.session ){
          if( SessionEntityFieldUpdate( this.core, event, this.config.sessionPath ) ){
            if( !event.channel ){
              event.channel = true;
              this.core.channel.emit( event );
            }
            this.core.repo.clearCache( 'table', 'data' );
          }else{
            this.log.error( `SessionEntityFieldUpdate:${event.config.name}`, `Session failed` );
          }

        }
        ServiceInjector.get( PopEntityEventService ).sendEvent( event );
      }

      if( typeof patch.callback === 'function' ){ // allows developer to attach a callback when this field is updated
        patch.callback( this.core, event );

        this._onPatchSuccessAdditional();
      }
      this.dom.setTimeout( 'patch-success', () => {
        patch.success = false;
      }, ( this.config.patch.duration || 0 ) );
      return resolve( true );
    } );
  }


  protected _onPatchSuccessAdditional(): boolean{
    return true;
  }


  /**
   * Handle an http failure
   * @param err
   */
  protected _onPatchFail( err: HttpErrorResponse ): Promise<boolean>{
    return new Promise( ( resolve ) => {
      this.log.info( `onPatchFail` );
      const patch = <FieldItemPatchInterface>this.config.patch;
      const control = <FormControl>this.config.control;
      patch.running = false;
      control.markAsDirty();
      control.setValue( this.asset.storedValue );
      control.setErrors( { server: true } );
      this.config.message = GetHttpErrorMsg(err);
      this.onBubbleEvent( `patch`, this.config.message, {
        success: false,
        response: err
      }, true );

      this._onPatchFailAdditional();

      return resolve( true );
    } );
  }


  protected _onPatchFailAdditional(): boolean{
    return true;
  }


  /**
   * Set up the body of the api patch
   * @param value
   * @private
   */
  protected _getPatchBody( value?: number | string | boolean | null | Object ): Entity{
    let body = <Entity>{};
    const patch = <FieldItemPatchInterface>this.config.patch;

    value = typeof value !== 'undefined' ? value : this.config.control.value;

    if( IsObject( value ) ){
      const val = <{}>value;
      body = <Entity>{ ...body, ...val };
    }else if( IsArray( value ) ){
      body[ this.config.patch.field ] = value;
    }else{
      body[ this.config.patch.field ] = value;
      if( this.config.empty && !body[ this.config.patch.field ] ){
        body[ this.config.patch.field ] = PopTransform( String( value ), this.config.empty );
      }
    }
    if( this.config.patch.json ) body[ this.config.patch.field ] = JSON.stringify( body[ this.config.patch.field ] );

    if( patch && patch.metadata ){
      for( const i in patch.metadata ){
        if( !patch.metadata.hasOwnProperty( i ) ) continue;
        body[ i ] = patch.metadata[ i ];
      }
    }
    return body;
  }


  /**
   * Helper to set error message
   * @param message
   */
  protected _setMessage( message: string ): void{
    this.config.message = message;
  }


  /**
   * Helper to clear error message
   */
  protected _clearMessage(): void{
    this.config.message = '';
  }


  protected _checkPrevent(){
    if( IsArray( this.config.prevent, true ) ){
      const control = <FormControl>this.config.control;
      const value = control.value;
      const conflicts = this.config.prevent.filter( ( str ) => str.toLowerCase() === String( value ).toLowerCase() );
      if( conflicts.length ){
        control.setErrors( { unique: true } );
        this._setMessage( ValidationErrorMessages( control.errors ) );
        return false;
      }else{
        this._clearMessage();
        return true;
      }
    }
    return true;
  }

}
