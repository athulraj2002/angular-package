import { FormControl } from '@angular/forms';
import { SetControl } from '../../../../pop-common-dom.models';
export interface TextConfigInterface {
    border?: boolean;
    className?: string;
    control?: FormControl;
    header?: boolean;
    id?: number | string;
    name?: string;
    noInitialValue?: boolean;
    tabOnEnter?: boolean;
    padding?: number;
    size?: number;
    textOverflow?: 'wrap' | 'ellipsis';
    value?: boolean | number | string;
    warning?: boolean;
}
export declare class TextConfig implements SetControl {
    border: boolean;
    className: string;
    control: FormControl;
    header?: boolean;
    id: number | string;
    message: string;
    noInitialValue: boolean;
    name?: string;
    setValue: any;
    padding: number;
    textOverflow: string;
    value: boolean | number | string;
    warning?: boolean;
    constructor(params?: TextConfigInterface);
    setControl(): void;
}
