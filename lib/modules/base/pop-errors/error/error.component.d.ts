import { MatDialogRef } from '@angular/material/dialog';
import { PopRouteHistoryResolver } from '../../../../services/pop-route-history.resolver';
export declare class ErrorComponent {
    data: any;
    private dialog;
    private history;
    constructor(data: any, dialog: MatDialogRef<ErrorComponent>, history: PopRouteHistoryResolver);
    goBack(): void;
}
