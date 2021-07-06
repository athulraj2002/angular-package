export interface PopAjaxDialogConfigInterface {
    message: string;
    timeDelay?: number;
    patch?: PopAjaxDialogRequest;
    redirect?: PopAjaxDialogRedirectInterface;
    response?: any;
    body?: string;
}
export interface PopAjaxDialogRequestInterface {
    path: string;
    body?: any;
    type: 'patch' | 'post' | 'get' | 'delete';
    version?: number;
}
export declare class PopAjaxDialogRequest {
    path: string;
    body: any;
    type: 'patch' | 'post' | 'get' | 'delete';
    version: number;
    constructor(data: PopAjaxDialogRequestInterface);
}
export interface PopAjaxDialogRedirectInterface {
    path: string;
    app: string;
}
