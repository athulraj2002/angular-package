import { ChangeDetectorRef, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../pop-extend.component';
import { Dictionary, Entity, PopBaseEventInterface } from '../../../pop-common.model';
import { HttpErrorResponse } from '@angular/common/http';
export declare class PopFieldItemComponent extends PopExtendComponent implements OnInit, OnDestroy {
    position: number;
    when: any[];
    hidden: boolean;
    config: any;
    el: ElementRef;
    name: string;
    protected cdr: ChangeDetectorRef;
    constructor();
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    /**
     * On Link Click
     */
    onLinkClick(): void;
    /**
     * On Blur Event
     */
    onBlur(): void;
    /**
     * On Change event
     * @param value
     * @param force
     */
    onChange(value?: any, force?: boolean): void;
    /**
     * On Focus event
     */
    onFocus(): void;
    /**
     * This will bubble an event up the pipeline
     * @param eventName
     * @param message
     * @param extend
     * @param force
     */
    onBubbleEvent(eventName: string, message?: string, extend?: Dictionary<any>, force?: boolean): PopBaseEventInterface;
    ngOnDestroy(): void;
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
    protected _clearState(): void;
    /**
     * Hook that is called right before a patch
     */
    protected _beforePatch(): Promise<boolean>;
    /**
     * Hook that is called right after the api response returns
     */
    protected _afterPatch(): Promise<boolean>;
    /**
     * Prepare to make an api call to the server
     * @param value
     * @param force
     */
    protected _onPatch(value?: string | number | boolean | null | Object, force?: boolean): boolean;
    /**
     * This fx will make the actual api call to the server
     * @param body
     * @private
     */
    protected _doPatch(body: Entity): void;
    /**
     * Determine if a change is valid
     */
    protected _isChangeValid(): boolean;
    /**
     * Determine if a field should be patched
     */
    protected _isFieldPatchable(): boolean;
    /**
     * Helper to determine if an event is related to a field update
     * @param event
     */
    protected _isFieldChange(event: PopBaseEventInterface): boolean;
    /**
     * Transformations can be applied to a value before it is sent to the api server
     * @param value
     */
    protected _applyTransformation(value: any): any;
    /**
     * Handle an api call success
     * @param res
     */
    protected _onPatchSuccess(res: Entity): Promise<boolean>;
    protected _onPatchSuccessAdditional(): boolean;
    /**
     * Handle an http failure
     * @param err
     */
    protected _onPatchFail(err: HttpErrorResponse): Promise<boolean>;
    protected _onPatchFailAdditional(): boolean;
    /**
     * Set up the body of the api patch
     * @param value
     * @private
     */
    protected _getPatchBody(value?: number | string | boolean | null | Object): Entity;
    /**
     * Helper to set error message
     * @param message
     */
    protected _setMessage(message: string): void;
    /**
     * Helper to clear error message
     */
    protected _clearMessage(): void;
    protected _checkPrevent(): boolean;
}
