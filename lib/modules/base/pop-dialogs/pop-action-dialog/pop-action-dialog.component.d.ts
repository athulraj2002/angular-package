import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopExtendDynamicComponent } from '../../../../pop-extend-dynamic.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { Entity, EntityActionDataInterface, EntityActionInterface, EntityExtendInterface, FieldItemInterface, PopBaseEventInterface } from '../../../../pop-common.model';
import { Router } from '@angular/router';
import { PopEntityUtilFieldService } from '../../../entity/services/pop-entity-util-field.service';
import { CdkPortalOutlet, ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PopRequestService } from '../../../../services/pop-request.service';
import { FormGroup } from '@angular/forms';
import { PopEntityEventService } from '../../../entity/services/pop-entity-event.service';
export declare class PopActionDialogComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    dialog: MatDialogRef<PopActionDialogComponent>;
    data: EntityActionDataInterface;
    private container;
    portal: CdkPortalOutlet;
    action: EntityActionInterface;
    actionName: string;
    extension: EntityExtendInterface;
    name: string;
    protected srv: {
        dialog: MatDialog;
        events: PopEntityEventService;
        field: PopEntityUtilFieldService;
        request: PopRequestService;
        router: Router;
    };
    protected asset: {
        componentType: ComponentType<any>;
        entity: Entity;
        facadeDuration: number;
        fieldItems: FieldItemInterface[];
        fieldItemMap: any;
        submitText: string;
        visible: number;
        http: "POST" | "PATCH" | "DELETE" | "GET";
        postUrl: string;
        goToUrl: string;
    };
    ui: {
        form: FormGroup;
        submitText: string;
        header: string;
    };
    constructor(el: ElementRef, _domRepo: PopDomService, dialog: MatDialogRef<PopActionDialogComponent>, data: EntityActionDataInterface);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    /**
     * Intercept the enter press to check if the form can be submitted
     * @param event
     */
    onEnterPress(event: any): void;
    /**
     * The user can click a cancel btn to close the action dialog
     */
    onFormCancel(): void;
    /**
     * The user will press enter or click a submit btn to submit the form
     */
    onFormSubmit(): Promise<boolean>;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Protected Method )                                      *
     *               These are protected instead of private so that they can be overridden          *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * This fx will perform the intial config of this component
     * @private
     */
    protected _setInitialConfig(): Promise<boolean>;
    /**
     * This fx will perform additional config of this component that has initial config dependencies
     * @private
     */
    protected _setAdditionalConfig(): Promise<boolean>;
    /**
     * This fx will trigger the form validation
     * @private
     */
    protected _buildFormGroup(): Promise<boolean>;
    /**
     * This fx will take any patch event that occurs and store the key value pair
     * @param event
     * @private
     */
    protected _handleStoreEvent(event: PopBaseEventInterface): void;
    /**
     * This fx will trigger the form validation
     * @private
     */
    protected _triggerFormValidation(): void;
    /**
     * The form needs to able to make api calls to verify info for certain fields
     * ToDo:: Allow the config to be able to pass in api validation calls for certain fields
     * @private
     */
    protected _validateForm(): Promise<boolean>;
    /**
     * This fx will handle the error messaging
     * @param message
     * @private
     */
    protected _setErrorMessage(message: string): void;
    /**
     * This hook is called when the form is submitting
     * @private
     */
    protected _onSubmissionStart(): void;
    /**
     * This hook is called when the form submission has failed
     * @private
     */
    protected _onSubmissionFail(): void;
    /**
     * This hook is called when the form has submitted successfully
     * @private
     */
    protected _onSubmissionSuccess(): Promise<boolean>;
    /**
     * This fx will render all of the fields that were passed through in the action config
     * @private
     */
    protected _renderFieldItems(): void;
    /**
     * This fx will render the a component that was passed in through the action config
     * @private
     */
    protected _renderComponent(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * This fx will resolve the config of action that pop is suppose to perform
     * @private
     */
    private _setAction;
    /**
     * A helper method that sets build the field item definitions
     * @param entityConfig
     * @param goToUrl
     */
    private _setFieldItems;
    /**
     * Determine if field should be auto filled with the first item in the list
     * @param name
     */
    private _fieldHasAutoFill;
    /**
     * Determine if field has a child relation in the list
     * @param name
     */
    private _fieldHasChild;
    /**
     * Get a linear list of the parent child relations from a given point
     * @param self the name to start from (usually the field that has just been changed by user)
     * @param list
     */
    private _getRelationList;
    /**
     * Whenever a update to the entity happens the fields in the group should be re-evaluated if there are when conditionals set
     * @private
     */
    private _resetComponentListHidden;
    /**
     * This fx will manage if the form fields have parent child relations, ie if an account select needs to be filtered by a client select that exists in the form
     * @param name
     * @private
     */
    private _triggerParentChildUpdates;
}
