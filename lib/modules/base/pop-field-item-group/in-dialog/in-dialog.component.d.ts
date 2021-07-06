import { ElementRef, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { PopBaseEventInterface } from '../../../../pop-common.model';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopEntityEventService } from '../../../entity/services/pop-entity-event.service';
import { PopRequestService } from '../../../../services/pop-request.service';
import { Router } from '@angular/router';
import { FieldItemGroupConfig } from '../pop-field-item-group.model';
export declare class InDialogComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    dialog: MatDialogRef<InDialogComponent>;
    config: FieldItemGroupConfig;
    events: EventEmitter<PopBaseEventInterface>;
    http: string;
    name: string;
    protected srv: {
        events: PopEntityEventService;
        request: PopRequestService;
        router: Router;
    };
    asset: {
        visible: number;
    };
    ui: {
        form: FormGroup;
    };
    constructor(el: ElementRef, dialog: MatDialogRef<InDialogComponent>, config: FieldItemGroupConfig);
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
     * The user will press enter or click a submit btn to submit the form
     */
    onFormSubmit(): Promise<boolean>;
    /**
     * The user can click a canel btn to close the form dialog
     */
    onFormCancel(): void;
    /**
     * Handle the form events to trigger the form validation
     * @param event
     */
    onBubbleEvent(event: any): void;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
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
    private _triggerFormValidation;
    /**
     * The form needs to able to make api calls to verify info for certain fields
     * ToDo:: Allow the config to be able to pass in api validation calls for certain fields
     * @private
     */
    private _validateForm;
    /**
     * This hook is called when the form is submitting
     * @private
     */
    private _onSubmissionStart;
    /**
     * This hook is called when the form submission has failed
     * @private
     */
    private _onSubmissionFail;
    /**
     * This hook is called when the form has submitted successfully
     * @private
     */
    private _onSubmissionSuccess;
    /**
     * This fx will handle errors
     * @param message
     * @private
     */
    private _setErrorMessage;
}
