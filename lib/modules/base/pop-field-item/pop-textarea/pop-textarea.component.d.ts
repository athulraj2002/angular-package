import { ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { TextareaConfig } from './textarea-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
export declare class PopTextareaComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
    el: ElementRef;
    private renderer;
    private textAreaRef;
    config: TextareaConfig;
    name: string;
    constructor(el: ElementRef, renderer: Renderer2);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    /**
     * Trigger on key up event
     */
    onKeyUp(): void;
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
    protected onAutoSize(): void;
}
