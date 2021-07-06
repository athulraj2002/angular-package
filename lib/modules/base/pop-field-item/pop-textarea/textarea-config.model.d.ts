import { FormControl, Validators } from '@angular/forms';
import { FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';
export interface TextareaConfigInterface {
    autoSize?: boolean;
    bubble?: boolean;
    column?: string;
    control?: FormControl;
    displayErrors?: boolean;
    disabled?: boolean;
    facade?: boolean;
    helpText?: string;
    height?: number;
    hint?: boolean;
    id?: string | number;
    label?: string;
    maxHeight?: number;
    maxlength?: number;
    metadata?: object;
    name?: string;
    noInitialValue?: boolean;
    patch?: FieldItemPatchInterface;
    readonly?: boolean;
    session?: boolean;
    sessionPath?: string;
    tooltip?: string;
    validators?: Array<Validators>;
    value?: boolean | string | number;
}
export declare class TextareaConfig implements SetControl {
    autoSize: boolean;
    bubble: boolean;
    control: FormControl;
    _disabled: boolean;
    displayErrors: boolean;
    facade: boolean;
    helpText: string;
    height: number;
    maxHeight: any;
    hint: boolean;
    id: number | string;
    label: string;
    message: string;
    metadata: any;
    maxlength: number;
    name: string;
    noInitialValue: boolean;
    patch: FieldItemPatchInterface;
    readonly: boolean;
    session?: boolean;
    sessionPath?: string;
    showTooltip: boolean;
    tabOnEnter: boolean;
    tooltip: string;
    validators: any;
    value: boolean | string | number;
    constructor(params?: TextareaConfigInterface);
    setControl(): void;
    get disabled(): boolean;
    set disabled(value: boolean);
}
