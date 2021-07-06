import { Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { PopBaseEventInterface, ServiceInjector } from '../../../../pop-common.model';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopEntityEventService } from '../../../entity/services/pop-entity-event.service';
import { PopRequestService } from '../../../../services/pop-request.service';
import { Router } from '@angular/router';
import { slideInOut } from '../../../../pop-common-animations.model';
import { IsValidFieldPatchEvent, ParseLinkUrl } from '../../../entity/pop-entity-utility';
import { FieldItemGroupConfig } from '../pop-field-item-group.model';
import { GetHttpErrorMsg, IsCallableFunction, IsString } from '../../../../pop-common-utility';


@Component( {
  selector: 'lib-in-dialog',
  templateUrl: './in-dialog.component.html',
  styleUrls: [ './in-dialog.component.scss' ],
  animations: [
    slideInOut
  ]
} )
export class InDialogComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();
  @Input() http = 'POST';
  public name = 'InDialogComponent';

  protected srv: {
    events: PopEntityEventService,
    request: PopRequestService,
    router: Router
  } = {
    events: ServiceInjector.get( PopEntityEventService ),
    request: ServiceInjector.get( PopRequestService ),
    router: ServiceInjector.get( Router ),
  };

  public asset = {
    visible: 0
  };

  public ui = {
    form: <FormGroup>undefined
  };


  constructor(
    public el: ElementRef,
    public dialog: MatDialogRef<InDialogComponent>,
    @Inject( MAT_DIALOG_DATA ) public config: FieldItemGroupConfig,
  ){
    super();

    /**
     * This should transformValue and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {
        const fieldItems = {};
        this.dom.state.validated = false;
        if( !this.config.inDialog.submit ) this.config.inDialog.submit = 'Submit';
        this.config.fieldItems.map( ( field ) => {
          if( field.config && field.config.control ){
            fieldItems[ field.config.name ] = field.config.control;
            this.asset.visible++;
          }
        } );
        this.dom.setHeight( this.asset.visible * 40, 0 );
        this.ui.form = new FormGroup( fieldItems );

        resolve( true );
      } );
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {

        this._triggerFormValidation();

        resolve( true );
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
   * Intercept the enter press to check if the form can be submitted
   * @param event
   */
  onEnterPress( event ){
    event.preventDefault();
    event.stopPropagation();
    if( this.dom.state.validated ){
      this.dom.setTimeout( `submit-form`, () => {
        return this.onFormSubmit();
      }, 500 );

    }
  }


  /**
   * The user will press enter or click a submit btn to submit the form
   */
  onFormSubmit(){
    return new Promise<boolean>( async( resolve ) => {
      if( this.dom.state.validated && !this.dom.state.pending ){
        this._onSubmissionStart();
        const params = this.ui.form.value; // get form value before disabling form
        // this.dom.asset.form_group.disable(); //bad idea disabled through css
        const request = this.http === 'POST' ? this.srv.request.doPost( this.config.inDialog.postUrl, params, ( this.config.inDialog.postUrlVersion !== null ? this.config.inDialog.postUrlVersion : 1 ) ) : this.srv.request.doPatch( this.config.inDialog.postUrl, params, ( this.config.inDialog.postUrlVersion !== null ? this.config.inDialog.postUrlVersion : 1 ) );
        request.subscribe( async( result: any ) => {
            const goToUrl = this.config.inDialog.goToUrl;
            result = result.data ? result.data : result;
            this.config.entity = result;
            await this._onSubmissionSuccess();
            this.dialog.close( this.config.entity );
            if( IsString( goToUrl, true ) ){
              const newGoToUrl = ParseLinkUrl( String( goToUrl ).slice(), this.config.entity );
              this.srv.router.navigate( [ newGoToUrl ] ).catch( ( e ) => {
                console.log( e );
              } );
            }
            return resolve( true );
          },
          err => {
            this._onSubmissionFail();
            this._setErrorMessage( err );
            return resolve( false );
          }
        );
      }
    } );
  }


  /**
   * The user can click a canel btn to close the form dialog
   */
  onFormCancel(){
    this.dom.state.loaded = false;
    this.dom.setTimeout( `close-modal`, () => {
      this.config.entity = null;
      this.dialog.close( -1 );
    }, 500 );
  }


  /**
   * Handle the form events to trigger the form validation
   * @param event
   */
  onBubbleEvent( event ){
    if( event.name === 'onKeyUp' ){
      this.dom.state.validated = false;
      this.dom.setTimeout( `trigger-validation`, () => {
        this._triggerFormValidation();
      }, 500 );

    }
    if( IsValidFieldPatchEvent( this.core, event ) || event.name === 'onBlur' ){
      this.dom.setTimeout( `trigger-validation`, () => {
        this._triggerFormValidation();
      }, 500 );
    }else{
      // if a field is focused we want a chance to validate again
      // this.dom.state.validated = false;
    }
    // if( event.type === 'field' && event.name === 'onChange' ) event.form = this.ui.form;
    this.events.emit( event );
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
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
   * This fx will trigger the form validation
   * @private
   */
  private _triggerFormValidation(){
    this.dom.setTimeout( `trigger-form-validation`, () => {
      this._validateForm().then( ( valid: boolean ) => {
        this.dom.state.validated = valid;
      } );
    }, 50 );
  }


  /**
   * The form needs to able to make api calls to verify info for certain fields
   * ToDo:: Allow the config to be able to pass in api validation calls for certain fields
   * @private
   */
  private _validateForm(): Promise<boolean>{
    return new Promise<boolean>( ( resolve ) => {
      this.dom.state.validated = false;
      this.dom.setTimeout( `trigger-form-validation`, null );
      this.dom.setTimeout( `validate-form`, () => {
        this.ui.form.updateValueAndValidity();
        setTimeout( () => {
          this.dom.state.validated = true; // mock stub for now
          return resolve( this.ui.form.valid );
        }, 0 );
      }, 0 );
    } );
  }


  /**
   * This hook is called when the form is submitting
   * @private
   */
  private _onSubmissionStart(){
    this.dom.state.pending = true;
    this.dom.setTimeout( `submit-form`, null );
    this.dom.setTimeout( `trigger-validation`, null );
    this.dom.setTimeout( `trigger-form-validation`, null );
    this.dom.setTimeout( `validate-form`, null );
    this.dom.error.message = '';
    this.dom.setTimeout( `set-error`, null );
  }


  /**
   * This hook is called when the form submission has failed
   * @private
   */
  private _onSubmissionFail(){
    this.dom.state.pending = false;
    // this.dom.state.validated = false;

  }


  /**
   * This hook is called when the form has submitted successfully
   * @private
   */
  private _onSubmissionSuccess(){
    return new Promise<boolean>( async( resolve ) => {
      this.dom.state.pending = false;
      this.dom.state.validated = false;
      this.dom.state.success = ( this.config.entity.message !== null ? this.config.entity.message : 'Created' );
      const event = <PopBaseEventInterface>{
        source: this.name,
        method: 'create',
        type: 'entity',
        name: this.config.params.name,
        internal_name: this.config.params.internal_name,
        data: this.config.entity
      };
      if( IsCallableFunction( this.config.inDialog.callback ) ){
        await this.config.inDialog.callback( this.core, event );
      }
      this.srv.events.sendEvent( event );

      return resolve( true );
    } );
  }


  /**
   * This fx will handle errors
   * @param message
   * @private
   */
  private _setErrorMessage( err: any ){
    this.dom.setTimeout( `set-err-msg`, () => {
      this.dom.state.pending = false;
      this.dom.error.message = GetHttpErrorMsg( err );
      this.ui.form.markAsPristine();

      // this.dom.setTimeout( `clear-err-msg`, () => {
      //   this.dom.error.message = '';
      // }, 5000 );
    }, 500 );
  }


}
