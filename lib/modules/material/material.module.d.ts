import { MatDialog } from '@angular/material/dialog';
import { Overlay } from "@angular/cdk/overlay";
export declare class MaterialModule {
    static forRoot(): {
        ngModule: typeof MaterialModule;
        providers: (typeof Overlay | typeof MatDialog)[];
    };
}
