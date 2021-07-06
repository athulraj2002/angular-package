import { MatDialog } from '@angular/material/dialog';
export declare class PopEntityUtilPortalService {
    private dialogRepo;
    state: {
        blockModal: boolean;
    };
    constructor(dialogRepo: MatDialog);
    view(internal_name: string, id: number): Promise<boolean>;
}
