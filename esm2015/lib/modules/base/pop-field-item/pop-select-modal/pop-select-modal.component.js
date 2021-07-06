import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopSelectModalDialogComponent } from './pop-select-modal-dialog/pop-select-modal-dialog.component';
import { InputConfig } from '../pop-input/input-config.model';
import { ServiceInjector } from '../../../../pop-common.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { ArrayOnlyUnique, IsArray, IsCallableFunction, JsonCopy } from '../../../../pop-common-utility';
export class PopSelectModalComponent extends PopFieldItemComponent {
    constructor() {
        super();
        this.events = new EventEmitter();
        this.name = 'PopSelectModalComponent';
        this.srv = {
            dialog: ServiceInjector.get(MatDialog),
        };
        this.asset = {
            original: undefined,
            dialogRef: undefined
        };
        this.ui = {
            anchorInput: undefined,
            dialogRef: undefined
        };
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.config.triggerOpen = () => {
                    this.dom.setTimeout(``, () => {
                        this.onChangeOptions();
                    }, 0);
                };
                this.ui.anchorInput = new InputConfig({
                    label: this.config.label,
                    value: this.config.list.strVal,
                    selectMode: true,
                    maxlength: 2048,
                });
                return resolve(true);
            });
        };
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.proceed = () => {
            return new Promise((resolve) => {
                return resolve(true);
            });
        };
    }
    /**
     * This component should have a specific purpose
     */
    ngOnInit() {
        super.ngOnInit();
    }
    onChangeOptions() {
        this.dom.active.storedValue = this.config.list.strVal;
        this.asset.dialogRef = this.srv.dialog.open(PopSelectModalDialogComponent, {
            width: `450px`,
            height: `600px`,
            panelClass: 'sw-relative',
            data: {}
        });
        this.asset.original = {
            all: JsonCopy(this.config.list.all),
            selectedOptions: this.config.list.multiple ? JsonCopy(this.config.control.value) : [],
            groups: JsonCopy(this.config.list.groups),
            strVal: JsonCopy(this.config.list.strVal),
        };
        this.asset.dialogRef.componentInstance.config = this.config;
        this.dom.setSubscriber(`select-dialog`, this.asset.dialogRef.beforeClosed().subscribe((list) => {
            if (list && list.strVal !== this.dom.active.storedValue) {
                this.config.control.setValue(list.control.value);
                if (!list.multiple)
                    list.value = list.control.value;
                // console.log('list', list);
                this.ui.anchorInput.triggerOnChange(list.strVal);
                this.ui.anchorInput.message = '';
                this.onChange();
            }
            else {
                this.config.list.all = this.asset.original.all;
                this.config.list.selectedOptions = this.asset.original.selectedOptions;
                this.config.list.value = this.asset.original.selectedOptions;
                this.config.list.groups = this.asset.original.groups;
                this.config.list.strVal = this.asset.original.strVal;
            }
            this.asset.dialogRef = null;
        }));
        this.dom.setTimeout(`search-focus`, () => {
            if (IsCallableFunction(this.asset.dialogRef.componentInstance.config.list.focusSearch))
                this.asset.dialogRef.componentInstance.config.list.focusSearch();
        }, 200);
    }
    // displaySuccess(): void{
    //   this.ui.anchorInput.message = '';
    //   this.ui.anchorInput.patch.success = true;
    //   setTimeout(() => {
    //     this.ui.anchorInput.patch.success = false;
    //   }, 1000);
    // }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Protected Method )                                      *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Set up the body of the api patch
     * @param value
     * @private
     */
    _getPatchBody(value) {
        const body = {};
        if (!value)
            value = this.config.list.multiple ? (this.config.list.control.value.length ? this.config.list.control.value : []) : this.config.list.control.value;
        if (this.config.list.all) {
            if (typeof this.config.list.allValue !== 'undefined') {
                body[this.config.patch.field] = this.config.list.allValue;
            }
            else if (this.config.list.patchGroupFk) {
                body[this.config.patch.field] = [];
                this.config.list.groups.map((group) => {
                    body[this.config.patch.field].push(`0:${group.groupFk}`);
                });
            }
            else {
                body[this.config.patch.field] = value;
            }
        }
        else {
            if (!this.config.list.selectedOptions.length && typeof this.config.list.emptyValue !== 'undefined') {
                body[this.config.patch.field] = this.config.list.emptyValue;
            }
            else if (this.config.list.patchGroupFk) {
                body[this.config.patch.field] = [];
                this.config.list.groups.map((group) => {
                    if (group.all) {
                        body[this.config.patch.field].push(`0:${group.groupFk}`);
                    }
                    else {
                        group.options.values.filter((option) => {
                            return option.selected;
                        }).map((option) => {
                            body[this.config.patch.field].push(`${option.value}:${group.groupFk}`);
                        });
                    }
                });
            }
            else {
                body[this.config.patch.field] = value;
            }
        }
        if (IsArray(body[this.config.patch.field], true)) {
            body[this.config.patch.field] = ArrayOnlyUnique(body[this.config.patch.field]);
            body[this.config.patch.field].sort(function (a, b) {
                return a - b;
            });
        }
        if (this.config.patch.metadata) {
            for (const i in this.config.patch.metadata) {
                if (!this.config.patch.metadata.hasOwnProperty(i))
                    continue;
                body[i] = this.config.patch.metadata[i];
            }
        }
        if (this.config.patch.json)
            body[this.config.patch.field] = JSON.stringify(body[this.config.patch.field]);
        return body;
    }
}
PopSelectModalComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-select-modal',
                template: "<div class=\"pop-select-modal-container import-field-item-container\" *ngIf=\"dom.state.loaded\">\n  <lib-pop-input class=\"pop-select-modal-values\" (click)=\"onChangeOptions();\" [config]=\"ui.anchorInput\"></lib-pop-input>\n  <lib-pop-field-item-loader [show]=\"config.patch.displayIndicator && config.patch.running\"></lib-pop-field-item-loader>\n</div>\n",
                styles: [".pop-select-modal-container{position:relative;box-sizing:border-box;margin:10px 0}:host ::ng-deep .pop-input-container{margin:0!important}:host ::ng-deep .pop-select-modal-values .mat-form-field-infix{padding:8px 20px 13px 0!important}:host ::ng-deep .pop-select-modal-values input{display:flex;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;pointer-events:none!important;box-sizing:border-box}:host ::ng-deep .pop-select-modal-values .mat-form-field-infix{pointer-events:none!important}"]
            },] }
];
PopSelectModalComponent.ctorParameters = () => [];
PopSelectModalComponent.propDecorators = {
    config: [{ type: Input }],
    events: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXNlbGVjdC1tb2RhbC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1zZWxlY3QtbW9kYWwvcG9wLXNlbGVjdC1tb2RhbC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFxQixNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDMUYsT0FBTyxFQUFFLFNBQVMsRUFBZ0IsTUFBTSwwQkFBMEIsQ0FBQztBQUVuRSxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSw2REFBNkQsQ0FBQztBQUM1RyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFHOUQsT0FBTyxFQUE2QyxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMxRyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNwRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQVV4RyxNQUFNLE9BQU8sdUJBQXdCLFNBQVEscUJBQXFCO0lBcUJoRTtRQUNFLEtBQUssRUFBRSxDQUFDO1FBcEJBLFdBQU0sR0FBd0MsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUVwRSxTQUFJLEdBQUcseUJBQXlCLENBQUM7UUFFOUIsUUFBRyxHQUFHO1lBQ2QsTUFBTSxFQUFhLGVBQWUsQ0FBQyxHQUFHLENBQUUsU0FBUyxDQUFFO1NBQ3BELENBQUM7UUFFUSxVQUFLLEdBQUc7WUFDaEIsUUFBUSxFQUFFLFNBQVM7WUFDbkIsU0FBUyxFQUErQyxTQUFTO1NBQ2xFLENBQUM7UUFFSyxPQUFFLEdBQUc7WUFDVixXQUFXLEVBQWUsU0FBUztZQUNuQyxTQUFTLEVBQStDLFNBQVM7U0FDbEUsQ0FBQztRQU1BOztXQUVHO1FBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBcUIsRUFBRTtZQUMxQyxPQUFPLElBQUksT0FBTyxDQUFFLENBQUUsT0FBTyxFQUFHLEVBQUU7Z0JBR2hDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLEdBQUUsRUFBRTtvQkFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLEdBQUUsRUFBRTt3QkFDMUIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUN6QixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ1IsQ0FBQyxDQUFDO2dCQUVGLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxHQUFHLElBQUksV0FBVyxDQUFFO29CQUNyQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO29CQUN4QixLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTTtvQkFDOUIsVUFBVSxFQUFFLElBQUk7b0JBQ2hCLFNBQVMsRUFBRSxJQUFJO2lCQUNoQixDQUFFLENBQUM7Z0JBRUosT0FBTyxPQUFPLENBQUUsSUFBSSxDQUFFLENBQUM7WUFDekIsQ0FBQyxDQUFFLENBQUM7UUFDTixDQUFDLENBQUM7UUFFRjs7V0FFRztRQUNILElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQXFCLEVBQUU7WUFDeEMsT0FBTyxJQUFJLE9BQU8sQ0FBRSxDQUFFLE9BQU8sRUFBRyxFQUFFO2dCQUVoQyxPQUFPLE9BQU8sQ0FBRSxJQUFJLENBQUUsQ0FBQztZQUN6QixDQUFDLENBQUUsQ0FBQztRQUNOLENBQUMsQ0FBQztJQUNKLENBQUM7SUFHRDs7T0FFRztJQUNILFFBQVE7UUFDTixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUdELGVBQWU7UUFDYixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3RELElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBRSw2QkFBNkIsRUFBRTtZQUMxRSxLQUFLLEVBQUUsT0FBTztZQUNkLE1BQU0sRUFBRSxPQUFPO1lBQ2YsVUFBVSxFQUFFLGFBQWE7WUFDekIsSUFBSSxFQUFtQixFQUFFO1NBQzFCLENBQUUsQ0FBQztRQUVKLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHO1lBQ3BCLEdBQUcsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ25DLGVBQWUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQSxDQUFDLENBQUMsRUFBRTtZQUNwRixNQUFNLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUN6QyxNQUFNLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztTQUMxQyxDQUFDO1FBRUYsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFFNUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUUsZUFBZSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FBRSxDQUFFLElBQTZCLEVBQUcsRUFBRTtZQUMxSCxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRTtnQkFDdkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2pELElBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUTtvQkFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO2dCQUVuRCw2QkFBNkI7Z0JBQzdCLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBRSxJQUFJLENBQUMsTUFBTSxDQUFFLENBQUM7Z0JBQ25ELElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNqQjtpQkFBSTtnQkFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDO2dCQUN2RSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDO2dCQUM3RCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUNyRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2FBQ3REO1lBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQzlCLENBQUMsQ0FBRSxDQUFFLENBQUM7UUFFTixJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBRSxjQUFjLEVBQUUsR0FBRyxFQUFFO1lBQ3RDLElBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7Z0JBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM1SixDQUFDLEVBQUUsR0FBRyxDQUFFLENBQUM7SUFDWCxDQUFDO0lBR0QsMEJBQTBCO0lBQzFCLHNDQUFzQztJQUN0Qyw4Q0FBOEM7SUFDOUMsdUJBQXVCO0lBQ3ZCLGlEQUFpRDtJQUNqRCxjQUFjO0lBQ2QsSUFBSTtJQUVKOztPQUVHO0lBQ0gsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBR0Q7Ozs7O3NHQUtrRztJQUVsRzs7OztPQUlHO0lBQ08sYUFBYSxDQUFFLEtBQWlEO1FBQ3hFLE1BQU0sSUFBSSxHQUFXLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsS0FBSztZQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBRWxLLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ3hCLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssV0FBVyxFQUFFO2dCQUNwRCxJQUFJLENBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO2FBQzdEO2lCQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUN2QyxJQUFJLENBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFFLEdBQUcsRUFBRSxDQUFDO2dCQUNyQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFFLENBQUUsS0FBaUMsRUFBRyxFQUFFO29CQUNuRSxJQUFJLENBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFFLENBQUMsSUFBSSxDQUFFLEtBQUssS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFFLENBQUM7Z0JBQy9ELENBQUMsQ0FBRSxDQUFDO2FBQ0w7aUJBQUk7Z0JBQ0gsSUFBSSxDQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBRSxHQUFHLEtBQUssQ0FBQzthQUN6QztTQUNGO2FBQUk7WUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxXQUFXLEVBQUU7Z0JBQ2xHLElBQUksQ0FBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7YUFDL0Q7aUJBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUUsR0FBRyxFQUFFLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUUsQ0FBRSxLQUFpQyxFQUFHLEVBQUU7b0JBQ25FLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRTt3QkFDYixJQUFJLENBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFFLENBQUMsSUFBSSxDQUFFLEtBQUssS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFFLENBQUM7cUJBQzlEO3lCQUFJO3dCQUNILEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBRSxDQUFFLE1BQU0sRUFBRyxFQUFFOzRCQUN4QyxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUM7d0JBQ3pCLENBQUMsQ0FBRSxDQUFDLEdBQUcsQ0FBRSxDQUFFLE1BQU0sRUFBRyxFQUFFOzRCQUNwQixJQUFJLENBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFFLENBQUMsSUFBSSxDQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUUsQ0FBQzt3QkFDN0UsQ0FBQyxDQUFFLENBQUM7cUJBQ0w7Z0JBQ0gsQ0FBQyxDQUFFLENBQUM7YUFDTDtpQkFBSTtnQkFDSCxJQUFJLENBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFFLEdBQUcsS0FBSyxDQUFDO2FBQ3pDO1NBQ0Y7UUFDRCxJQUFJLE9BQU8sQ0FBRSxJQUFJLENBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFFLEVBQUUsSUFBSSxDQUFFLEVBQUU7WUFDcEQsSUFBSSxDQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBRSxHQUFHLGVBQWUsQ0FBRSxJQUFJLENBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFFLENBQUUsQ0FBQztZQUNyRixJQUFJLENBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFFLENBQUMsSUFBSSxDQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNmLENBQUMsQ0FBRSxDQUFDO1NBQ0w7UUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtZQUM5QixLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtnQkFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUUsQ0FBQyxDQUFFO29CQUFHLFNBQVM7Z0JBQy9ELElBQUksQ0FBRSxDQUFDLENBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUM7YUFDN0M7U0FDRjtRQUNELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSTtZQUFHLElBQUksQ0FBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFFLElBQUksQ0FBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUUsQ0FBRSxDQUFDO1FBRWpILE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQzs7O1lBbk1GLFNBQVMsU0FBRTtnQkFDVixRQUFRLEVBQUUsc0JBQXNCO2dCQUNoQyxtWEFBZ0Q7O2FBRWpEOzs7O3FCQUVFLEtBQUs7cUJBQ0wsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRXZlbnRFbWl0dGVyLCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQsIE91dHB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTWF0RGlhbG9nLCBNYXREaWFsb2dSZWYgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xuaW1wb3J0IHsgU2VsZWN0TW9kYWxDb25maWcgfSBmcm9tICcuL3NlbGVjdC1tb2RhbC1jb25maWcubW9kZWwnO1xuaW1wb3J0IHsgUG9wU2VsZWN0TW9kYWxEaWFsb2dDb21wb25lbnQgfSBmcm9tICcuL3BvcC1zZWxlY3QtbW9kYWwtZGlhbG9nL3BvcC1zZWxlY3QtbW9kYWwtZGlhbG9nLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBJbnB1dENvbmZpZyB9IGZyb20gJy4uL3BvcC1pbnB1dC9pbnB1dC1jb25maWcubW9kZWwnO1xuaW1wb3J0IHsgU2VsZWN0TGlzdENvbmZpZyB9IGZyb20gJy4uL3BvcC1zZWxlY3QtbGlzdC9zZWxlY3QtbGlzdC1jb25maWcubW9kZWwnO1xuaW1wb3J0IHsgU2VsZWN0RmlsdGVyR3JvdXBJbnRlcmZhY2UgfSBmcm9tICcuLi9wb3Atc2VsZWN0LWZpbHRlci9zZWxlY3QtZmlsdGVyLWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBEaWN0aW9uYXJ5LCBFbnRpdHksIFBvcEJhc2VFdmVudEludGVyZmFjZSwgU2VydmljZUluamVjdG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBQb3BGaWVsZEl0ZW1Db21wb25lbnQgfSBmcm9tICcuLi9wb3AtZmllbGQtaXRlbS5jb21wb25lbnQnO1xuaW1wb3J0IHsgQXJyYXlPbmx5VW5pcXVlLCBJc0FycmF5LCBJc0NhbGxhYmxlRnVuY3Rpb24sIEpzb25Db3B5IH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7IEZvcm1Db250cm9sIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgVmFsaWRhdGlvbkVycm9yTWVzc2FnZXMgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtdmFsaWRhdG9ycyc7XG5cblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1wb3Atc2VsZWN0LW1vZGFsJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1zZWxlY3QtbW9kYWwuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLXNlbGVjdC1tb2RhbC5jb21wb25lbnQuc2NzcycgXVxufSApXG5leHBvcnQgY2xhc3MgUG9wU2VsZWN0TW9kYWxDb21wb25lbnQgZXh0ZW5kcyBQb3BGaWVsZEl0ZW1Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGNvbmZpZzogU2VsZWN0TW9kYWxDb25maWc7XG4gIEBPdXRwdXQoKSBldmVudHM6IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIHB1YmxpYyBuYW1lID0gJ1BvcFNlbGVjdE1vZGFsQ29tcG9uZW50JztcblxuICBwcm90ZWN0ZWQgc3J2ID0ge1xuICAgIGRpYWxvZzogPE1hdERpYWxvZz5TZXJ2aWNlSW5qZWN0b3IuZ2V0KCBNYXREaWFsb2cgKSxcbiAgfTtcblxuICBwcm90ZWN0ZWQgYXNzZXQgPSB7XG4gICAgb3JpZ2luYWw6IHVuZGVmaW5lZCxcbiAgICBkaWFsb2dSZWY6IDxNYXREaWFsb2dSZWY8UG9wU2VsZWN0TW9kYWxEaWFsb2dDb21wb25lbnQ+PnVuZGVmaW5lZFxuICB9O1xuXG4gIHB1YmxpYyB1aSA9IHtcbiAgICBhbmNob3JJbnB1dDogPElucHV0Q29uZmlnPnVuZGVmaW5lZCxcbiAgICBkaWFsb2dSZWY6IDxNYXREaWFsb2dSZWY8UG9wU2VsZWN0TW9kYWxEaWFsb2dDb21wb25lbnQ+PnVuZGVmaW5lZFxuICB9O1xuXG5cbiAgY29uc3RydWN0b3IoKXtcbiAgICBzdXBlcigpO1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBzaG91bGQgdHJhbnNmb3JtIGFuZCB2YWxpZGF0ZSB0aGUgZGF0YS4gVGhlIHZpZXcgc2hvdWxkIHRyeSB0byBvbmx5IHVzZSBkYXRhIHRoYXQgaXMgc3RvcmVkIG9uIHVpIHNvIHRoYXQgaXQgaXMgbm90IGRlcGVuZGVudCBvbiB0aGUgc3RydWN0dXJlIG9mIGRhdGEgdGhhdCBjb21lcyBmcm9tIG90aGVyIHNvdXJjZXMuIFRoZSB1aSBzaG91bGQgYmUgdGhlIHNvdXJjZSBvZiB0cnV0aCBoZXJlLlxuICAgICAqL1xuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlICkgPT4ge1xuXG5cbiAgICAgICAgdGhpcy5jb25maWcudHJpZ2dlck9wZW4gPSAoKT0+e1xuICAgICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoYGAsICgpPT57XG4gICAgICAgICAgICB0aGlzLm9uQ2hhbmdlT3B0aW9ucygpO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudWkuYW5jaG9ySW5wdXQgPSBuZXcgSW5wdXRDb25maWcoIHtcbiAgICAgICAgICBsYWJlbDogdGhpcy5jb25maWcubGFiZWwsXG4gICAgICAgICAgdmFsdWU6IHRoaXMuY29uZmlnLmxpc3Quc3RyVmFsLFxuICAgICAgICAgIHNlbGVjdE1vZGU6IHRydWUsXG4gICAgICAgICAgbWF4bGVuZ3RoOiAyMDQ4LFxuICAgICAgICB9ICk7XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgIH0gKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBzaG91bGQgdHJhbnNmb3JtIGFuZCB2YWxpZGF0ZSB0aGUgZGF0YS4gVGhlIHZpZXcgc2hvdWxkIHRyeSB0byBvbmx5IHVzZSBkYXRhIHRoYXQgaXMgc3RvcmVkIG9uIHVpIHNvIHRoYXQgaXQgaXMgbm90IGRlcGVuZGVudCBvbiB0aGUgc3RydWN0dXJlIG9mIGRhdGEgdGhhdCBjb21lcyBmcm9tIG90aGVyIHNvdXJjZXMuIFRoZSB1aSBzaG91bGQgYmUgdGhlIHNvdXJjZSBvZiB0cnV0aCBoZXJlLlxuICAgICAqL1xuICAgIHRoaXMuZG9tLnByb2NlZWQgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSApID0+IHtcblxuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCBzaG91bGQgaGF2ZSBhIHNwZWNpZmljIHB1cnBvc2VcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgb25DaGFuZ2VPcHRpb25zKCl7XG4gICAgdGhpcy5kb20uYWN0aXZlLnN0b3JlZFZhbHVlID0gdGhpcy5jb25maWcubGlzdC5zdHJWYWw7XG4gICAgdGhpcy5hc3NldC5kaWFsb2dSZWYgPSB0aGlzLnNydi5kaWFsb2cub3BlbiggUG9wU2VsZWN0TW9kYWxEaWFsb2dDb21wb25lbnQsIHtcbiAgICAgIHdpZHRoOiBgNDUwcHhgLFxuICAgICAgaGVpZ2h0OiBgNjAwcHhgLFxuICAgICAgcGFuZWxDbGFzczogJ3N3LXJlbGF0aXZlJyxcbiAgICAgIGRhdGE6IDxEaWN0aW9uYXJ5PGFueT4+e31cbiAgICB9ICk7XG5cbiAgICB0aGlzLmFzc2V0Lm9yaWdpbmFsID0ge1xuICAgICAgYWxsOiBKc29uQ29weSh0aGlzLmNvbmZpZy5saXN0LmFsbCksXG4gICAgICBzZWxlY3RlZE9wdGlvbnM6IHRoaXMuY29uZmlnLmxpc3QubXVsdGlwbGUgPyBKc29uQ29weSh0aGlzLmNvbmZpZy5jb250cm9sLnZhbHVlKTogW10sXG4gICAgICBncm91cHM6IEpzb25Db3B5KHRoaXMuY29uZmlnLmxpc3QuZ3JvdXBzKSxcbiAgICAgIHN0clZhbDogSnNvbkNvcHkodGhpcy5jb25maWcubGlzdC5zdHJWYWwpLFxuICAgIH07XG5cbiAgICB0aGlzLmFzc2V0LmRpYWxvZ1JlZi5jb21wb25lbnRJbnN0YW5jZS5jb25maWcgPSB0aGlzLmNvbmZpZztcblxuICAgIHRoaXMuZG9tLnNldFN1YnNjcmliZXIoIGBzZWxlY3QtZGlhbG9nYCwgdGhpcy5hc3NldC5kaWFsb2dSZWYuYmVmb3JlQ2xvc2VkKCkuc3Vic2NyaWJlKCAoIGxpc3Q6IFNlbGVjdExpc3RDb25maWcgfCBudWxsICkgPT4ge1xuICAgICAgaWYoIGxpc3QgJiYgbGlzdC5zdHJWYWwgIT09IHRoaXMuZG9tLmFjdGl2ZS5zdG9yZWRWYWx1ZSApe1xuICAgICAgICB0aGlzLmNvbmZpZy5jb250cm9sLnNldFZhbHVlKGxpc3QuY29udHJvbC52YWx1ZSk7XG4gICAgICAgIGlmKCFsaXN0Lm11bHRpcGxlKSBsaXN0LnZhbHVlID0gbGlzdC5jb250cm9sLnZhbHVlO1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdsaXN0JywgbGlzdCk7XG4gICAgICAgIHRoaXMudWkuYW5jaG9ySW5wdXQudHJpZ2dlck9uQ2hhbmdlKCBsaXN0LnN0clZhbCApO1xuICAgICAgICB0aGlzLnVpLmFuY2hvcklucHV0Lm1lc3NhZ2UgPSAnJztcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuY29uZmlnLmxpc3QuYWxsID0gdGhpcy5hc3NldC5vcmlnaW5hbC5hbGw7XG4gICAgICAgIHRoaXMuY29uZmlnLmxpc3Quc2VsZWN0ZWRPcHRpb25zID0gdGhpcy5hc3NldC5vcmlnaW5hbC5zZWxlY3RlZE9wdGlvbnM7XG4gICAgICAgIHRoaXMuY29uZmlnLmxpc3QudmFsdWUgPSB0aGlzLmFzc2V0Lm9yaWdpbmFsLnNlbGVjdGVkT3B0aW9ucztcbiAgICAgICAgdGhpcy5jb25maWcubGlzdC5ncm91cHMgPSB0aGlzLmFzc2V0Lm9yaWdpbmFsLmdyb3VwcztcbiAgICAgICAgdGhpcy5jb25maWcubGlzdC5zdHJWYWwgPSB0aGlzLmFzc2V0Lm9yaWdpbmFsLnN0clZhbDtcbiAgICAgIH1cbiAgICAgIHRoaXMuYXNzZXQuZGlhbG9nUmVmID0gbnVsbDtcbiAgICB9ICkgKTtcblxuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGBzZWFyY2gtZm9jdXNgLCAoKSA9PiB7XG4gICAgICAgIGlmKElzQ2FsbGFibGVGdW5jdGlvbih0aGlzLmFzc2V0LmRpYWxvZ1JlZi5jb21wb25lbnRJbnN0YW5jZS5jb25maWcubGlzdC5mb2N1c1NlYXJjaCkpIHRoaXMuYXNzZXQuZGlhbG9nUmVmLmNvbXBvbmVudEluc3RhbmNlLmNvbmZpZy5saXN0LmZvY3VzU2VhcmNoKCk7XG4gICAgfSwgMjAwICk7XG4gIH1cblxuXG4gIC8vIGRpc3BsYXlTdWNjZXNzKCk6IHZvaWR7XG4gIC8vICAgdGhpcy51aS5hbmNob3JJbnB1dC5tZXNzYWdlID0gJyc7XG4gIC8vICAgdGhpcy51aS5hbmNob3JJbnB1dC5wYXRjaC5zdWNjZXNzID0gdHJ1ZTtcbiAgLy8gICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgLy8gICAgIHRoaXMudWkuYW5jaG9ySW5wdXQucGF0Y2guc3VjY2VzcyA9IGZhbHNlO1xuICAvLyAgIH0sIDEwMDApO1xuICAvLyB9XG5cbiAgLyoqXG4gICAqIFRoZSBkb20gZGVzdHJveSBmdW5jdGlvbiBtYW5hZ2VzIGFsbCB0aGUgY2xlYW4gdXAgdGhhdCBpcyBuZWNlc3NhcnkgaWYgc3Vic2NyaXB0aW9ucywgdGltZW91dHMsIGV0YyBhcmUgc3RvcmVkIHByb3Blcmx5XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcm90ZWN0ZWQgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIC8qKlxuICAgKiBTZXQgdXAgdGhlIGJvZHkgb2YgdGhlIGFwaSBwYXRjaFxuICAgKiBAcGFyYW0gdmFsdWVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByb3RlY3RlZCBfZ2V0UGF0Y2hCb2R5KCB2YWx1ZT86IG51bWJlciB8IHN0cmluZyB8IGJvb2xlYW4gfCBudWxsIHwgT2JqZWN0ICk6IEVudGl0eXtcbiAgICBjb25zdCBib2R5ID0gPEVudGl0eT57fTtcbiAgICBpZiggIXZhbHVlICkgdmFsdWUgPSB0aGlzLmNvbmZpZy5saXN0Lm11bHRpcGxlID8gKCB0aGlzLmNvbmZpZy5saXN0LmNvbnRyb2wudmFsdWUubGVuZ3RoID8gdGhpcy5jb25maWcubGlzdC5jb250cm9sLnZhbHVlIDogW10gKSA6IHRoaXMuY29uZmlnLmxpc3QuY29udHJvbC52YWx1ZTtcblxuICAgIGlmKCB0aGlzLmNvbmZpZy5saXN0LmFsbCApe1xuICAgICAgaWYoIHR5cGVvZiB0aGlzLmNvbmZpZy5saXN0LmFsbFZhbHVlICE9PSAndW5kZWZpbmVkJyApe1xuICAgICAgICBib2R5WyB0aGlzLmNvbmZpZy5wYXRjaC5maWVsZCBdID0gdGhpcy5jb25maWcubGlzdC5hbGxWYWx1ZTtcbiAgICAgIH1lbHNlIGlmKCB0aGlzLmNvbmZpZy5saXN0LnBhdGNoR3JvdXBGayApe1xuICAgICAgICBib2R5WyB0aGlzLmNvbmZpZy5wYXRjaC5maWVsZCBdID0gW107XG4gICAgICAgIHRoaXMuY29uZmlnLmxpc3QuZ3JvdXBzLm1hcCggKCBncm91cDogU2VsZWN0RmlsdGVyR3JvdXBJbnRlcmZhY2UgKSA9PiB7XG4gICAgICAgICAgYm9keVsgdGhpcy5jb25maWcucGF0Y2guZmllbGQgXS5wdXNoKCBgMDoke2dyb3VwLmdyb3VwRmt9YCApO1xuICAgICAgICB9ICk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgYm9keVsgdGhpcy5jb25maWcucGF0Y2guZmllbGQgXSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgaWYoICF0aGlzLmNvbmZpZy5saXN0LnNlbGVjdGVkT3B0aW9ucy5sZW5ndGggJiYgdHlwZW9mIHRoaXMuY29uZmlnLmxpc3QuZW1wdHlWYWx1ZSAhPT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgYm9keVsgdGhpcy5jb25maWcucGF0Y2guZmllbGQgXSA9IHRoaXMuY29uZmlnLmxpc3QuZW1wdHlWYWx1ZTtcbiAgICAgIH1lbHNlIGlmKCB0aGlzLmNvbmZpZy5saXN0LnBhdGNoR3JvdXBGayApe1xuICAgICAgICBib2R5WyB0aGlzLmNvbmZpZy5wYXRjaC5maWVsZCBdID0gW107XG4gICAgICAgIHRoaXMuY29uZmlnLmxpc3QuZ3JvdXBzLm1hcCggKCBncm91cDogU2VsZWN0RmlsdGVyR3JvdXBJbnRlcmZhY2UgKSA9PiB7XG4gICAgICAgICAgaWYoIGdyb3VwLmFsbCApe1xuICAgICAgICAgICAgYm9keVsgdGhpcy5jb25maWcucGF0Y2guZmllbGQgXS5wdXNoKCBgMDoke2dyb3VwLmdyb3VwRmt9YCApO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgZ3JvdXAub3B0aW9ucy52YWx1ZXMuZmlsdGVyKCAoIG9wdGlvbiApID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5zZWxlY3RlZDtcbiAgICAgICAgICAgIH0gKS5tYXAoICggb3B0aW9uICkgPT4ge1xuICAgICAgICAgICAgICBib2R5WyB0aGlzLmNvbmZpZy5wYXRjaC5maWVsZCBdLnB1c2goIGAke29wdGlvbi52YWx1ZX06JHtncm91cC5ncm91cEZrfWAgKTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gKTtcbiAgICAgIH1lbHNle1xuICAgICAgICBib2R5WyB0aGlzLmNvbmZpZy5wYXRjaC5maWVsZCBdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmKCBJc0FycmF5KCBib2R5WyB0aGlzLmNvbmZpZy5wYXRjaC5maWVsZCBdLCB0cnVlICkgKXtcbiAgICAgIGJvZHlbIHRoaXMuY29uZmlnLnBhdGNoLmZpZWxkIF0gPSBBcnJheU9ubHlVbmlxdWUoIGJvZHlbIHRoaXMuY29uZmlnLnBhdGNoLmZpZWxkIF0gKTtcbiAgICAgIGJvZHlbIHRoaXMuY29uZmlnLnBhdGNoLmZpZWxkIF0uc29ydCggZnVuY3Rpb24oIGEsIGIgKXtcbiAgICAgICAgcmV0dXJuIGEgLSBiO1xuICAgICAgfSApO1xuICAgIH1cblxuICAgIGlmKCB0aGlzLmNvbmZpZy5wYXRjaC5tZXRhZGF0YSApe1xuICAgICAgZm9yKCBjb25zdCBpIGluIHRoaXMuY29uZmlnLnBhdGNoLm1ldGFkYXRhICl7XG4gICAgICAgIGlmKCAhdGhpcy5jb25maWcucGF0Y2gubWV0YWRhdGEuaGFzT3duUHJvcGVydHkoIGkgKSApIGNvbnRpbnVlO1xuICAgICAgICBib2R5WyBpIF0gPSB0aGlzLmNvbmZpZy5wYXRjaC5tZXRhZGF0YVsgaSBdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiggdGhpcy5jb25maWcucGF0Y2guanNvbiApIGJvZHlbIHRoaXMuY29uZmlnLnBhdGNoLmZpZWxkIF0gPSBKU09OLnN0cmluZ2lmeSggYm9keVsgdGhpcy5jb25maWcucGF0Y2guZmllbGQgXSApO1xuXG4gICAgcmV0dXJuIGJvZHk7XG4gIH1cblxuXG5cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbn1cbiJdfQ==