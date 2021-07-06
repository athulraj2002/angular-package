export interface PopAjaxDialogConfigInterface {
    message:string; // the message to display after successful request (request error will display otherwise)
    timeDelay?: number; // the time (in milliseconds) that the pop-table-dialog will stay open after successful request (if made)
    patch?: PopAjaxDialogRequest; // if given, outlines the details for making a request
    redirect?: PopAjaxDialogRedirectInterface; // if given, outlines the details for redirecting after request
    response?: any;
    body?:string;
}

export interface PopAjaxDialogRequestInterface {
    path: string;
    body?: any;
    type: 'patch' | 'post' | 'get' | 'delete';
    version?: number;

}

export class PopAjaxDialogRequest {
    path: string; // the path to make the request to
    body: any; // the body to include in the request, defaults to empty object
    type: 'patch' | 'post' | 'get' | 'delete'; // the type of request to make
    version: number; // the version number of api, defaults to 1

    constructor(data:PopAjaxDialogRequestInterface) {
        const fields = Object.keys(data);
        for (const value of fields) {
            this[value] = data[value];
        }
        if (!data.body) this.body = {};
        if (!data.version) this.version = 1;
    }
}

export interface PopAjaxDialogRedirectInterface {
    path: string; // the path the redirect to. Make sure to not include the app in the first part of the path. 
    app: string; // the app to redirect (acts as the first part of the path)
}
