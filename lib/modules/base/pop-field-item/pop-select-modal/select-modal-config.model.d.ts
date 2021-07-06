import { SelectListConfig } from '../pop-select-list/select-list-config.model';
import { FieldItemPatchInterface } from '../../../../pop-common.model';
import { SetControl } from '../../../../pop-common-dom.models';
import { FormControl, ValidatorFn } from '@angular/forms';
export interface SelectModalConfigInterface {
    bubble?: boolean;
    disabled?: boolean;
    displayErrors?: boolean;
    facade?: boolean;
    header?: string;
    label?: string;
    subLabel?: string;
    list?: SelectListConfig;
    patch?: FieldItemPatchInterface;
    metadata?: object;
    noInitialValue?: boolean;
    value?: Array<number | string> | number | string;
    validators?: Array<ValidatorFn>;
}
export declare class SelectModalConfig implements SetControl {
    control: FormControl;
    displayErrors?: boolean;
    disabled: boolean;
    facade?: boolean;
    header: string;
    list: SelectListConfig;
    label: string;
    metadata?: object;
    noInitialValue: boolean;
    patch: FieldItemPatchInterface;
    triggerOpen: any;
    validators?: Array<ValidatorFn>;
    value?: Array<number | string> | number | string;
    constructor(params?: SelectModalConfigInterface);
    setControl(): void;
}
