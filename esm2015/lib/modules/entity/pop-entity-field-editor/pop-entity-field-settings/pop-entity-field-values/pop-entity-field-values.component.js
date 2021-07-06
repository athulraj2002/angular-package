import { Component, ElementRef } from '@angular/core';
import { PopExtendComponent } from '../../../../../pop-extend.component';
import { PopDomService } from '../../../../../services/pop-dom.service';
import { SelectConfig } from '../../../../base/pop-field-item/pop-select/select-config.model';
import { InputConfig } from '../../../../base/pop-field-item/pop-input/input-config.model';
import { GetHttpErrorMsg, IsArray, IsObject, IsObjectThrowError, StorageGetter } from '../../../../../pop-common-utility';
import { PopLog, ServiceInjector } from '../../../../../pop-common.model';
import { IsValidFieldPatchEvent } from '../../../pop-entity-utility';
import { PopRequestService } from '../../../../../services/pop-request.service';
import { forkJoin } from 'rxjs';
import { PopFieldEditorService } from '../../pop-entity-field-editor.service';
export class PopEntityFieldValuesComponent extends PopExtendComponent {
    constructor(el, domRepo, fieldRepo) {
        super();
        this.el = el;
        this.domRepo = domRepo;
        this.fieldRepo = fieldRepo;
        this.name = 'PopEntityFieldValuesComponent';
        this.srv = {
            field: undefined,
            request: ServiceInjector.get(PopRequestService),
        };
        this.asset = {
            basePath: undefined,
            field: undefined,
            type: undefined,
            typeOption: undefined,
        };
        this.transformSrvContainer();
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.dom.handler.core = (core, event) => this._coreEventHandler(event);
                this.asset.field = IsObjectThrowError(this.core, true, `Invalid Core`) && IsObjectThrowError(this.core.entity, ['id', 'fieldgroup'], `Invalid Field`) ? this.core.entity : null;
                this.asset.type = this.asset.field.fieldgroup.name; // the field group name , ie.. address, phone
                this.asset.typeOption = this.srv.field.getDefaultLabelTypeOptions(); // the select options that belong to the types
                this.asset.basePath = `fields/${this.asset.field.id}/entries`; // api endpoint to hit for field entries
                this.ui.asset = {
                    entries: [], // list of configs for each entry record
                };
                this.dom.session.controls = new Map(); // store the entry configs so that changes are not lost when the tabs are changed
                return resolve(true);
            });
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => {
                this.dom.setTimeout('show-entries', () => {
                    this._showEntries();
                }, 0);
                return resolve(true);
            });
        };
    }
    /**
     * Nest all service related classes under srv
     */
    transformSrvContainer() {
        this.srv.field = this.fieldRepo;
        this.dom.repo = this.domRepo;
        delete this.fieldRepo;
        delete this.domRepo;
    }
    /**
     * This component should have a specific purpose
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * When the type of an entry is changed in the database, make sure the changes is updated locally
     * @param index
     * @param event
     */
    onEntryTypeChange(index, event) {
        if (IsValidFieldPatchEvent(this.core, event)) {
            const config = this.ui.entries[index];
            const entry = this.asset.field.entries[index];
            const session = this.dom.session.controls.get(index);
            if (entry && session) {
                entry.type = config.type.control.value;
                this._updateEntryTypeSession(session.type, entry);
                this.dom.session.controls.set(index, session);
                this.setDomSession(index, session);
            }
            setTimeout(() => {
                this._triggerFieldPreviewUpdate();
            }, 0);
        }
    }
    /**
     * When the display/label of an entry is changed in the database, make sure the changes is updated locally
     * @param index
     * @param event
     */
    onEntryDisplayChange(index, event) {
        if (IsValidFieldPatchEvent(this.core, event)) {
            const config = this.ui.entries[index];
            const entry = this.asset.field.entries[index];
            const session = this.dom.session.controls.get(index);
            if (entry && session) {
                entry.name = config.display.control.value;
                this._updateEntryDisplaySession(session.display, entry);
                this.dom.session.controls.set(index, session);
                this.setDomSession(index, session);
            }
        }
        setTimeout(() => {
            this._triggerFieldPreviewUpdate();
        }, 0);
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Listen for when the min_multiple && max_multiple values change
     * @param event
     * @private
     */
    _coreEventHandler(event) {
        this.log.info(`_coreEventHandler`, event);
        if (IsValidFieldPatchEvent(this.core, event)) {
            if (event.source === 'PopMinMaxComponent') {
                this.dom.setTimeout('show-entries', () => {
                    this._showEntries();
                }, 250);
            }
        }
    }
    /**
     * Produce a list of the entry values for this field
     * @private
     */
    _showEntries() {
        this.dom.state.pending = true;
        this._setValueEntries().then((entries) => {
            this._setEntrySessionControls(entries).then(() => {
                this._setEntries().then(() => {
                    this.dom.state.pending = false;
                    setTimeout(() => {
                        this._triggerFieldPreviewUpdate();
                    }, 0);
                });
            });
        });
    }
    /**
     * Ensure that the database records match the min/max settings
     * This will remove any excess records in the database that exceed the multiple_min
     * This will create records for an entries that are needed in the database
     * @param patch
     * @private
     */
    _setValueEntries() {
        return new Promise((resolve) => {
            const storedEntries = JSON.parse(JSON.stringify(this.asset.field.entries));
            const excess = storedEntries.splice(this.asset.field.multiple_min);
            let index = 0;
            const needed = [];
            while (index < this.asset.field.multiple_min) {
                const existing = index in storedEntries ? storedEntries[index] : null;
                if (!existing)
                    needed.push(index);
                index++;
            }
            const requests = []; // contains all the create/remove api/requests
            // delete any excess entries from database
            excess.map((entry) => {
                requests.push(this.srv.request.doDelete(`${this.asset.basePath}/${entry.id}`));
            });
            // create any needed entries in database
            needed.map((sessionIndex) => {
                const session = this.dom.session.controls.get(sessionIndex);
                requests.push(this.srv.request.doPost(`${this.asset.basePath}`, {
                    name: session ? session.display.value : null,
                    type: session ? session.type.value : this.asset.type in this.asset.typeOption ? this.asset.typeOption[this.asset.type].defaultValue : 'n/a'
                }, 1, false));
            });
            if (requests.length) { // need to update the data base to match min/max settings
                this._makeApiRequests(requests).then((serverEntries) => {
                    return resolve(serverEntries);
                });
            }
            else { // stored entries already match min/max settings
                return resolve(storedEntries);
            }
        });
    }
    /**
     * Will make all of the needed api requests
     * @param requests
     * @private
     */
    _makeApiRequests(requests) {
        return new Promise((resolve) => {
            forkJoin(requests).subscribe(() => {
                this.srv.request.doGet(this.asset.basePath).subscribe((res) => {
                    res = res.data ? res.data : res;
                    this.asset.field.entries = IsArray(res, true) ? res : [];
                    this.core.entity.entries = JSON.parse(JSON.stringify(this.asset.field.entries));
                    resolve(res);
                });
            }, (err) => {
                PopLog.error(this.name, `_makeApiRequests`, GetHttpErrorMsg(err));
                resolve([]);
            });
        });
    }
    /**
     * Store a set of controls that can store values as the user changes the settings
     * @private
     */
    _setEntrySessionControls(entries) {
        return new Promise((resolve) => {
            let index = 0;
            while (index < this.asset.field.multiple_min) {
                const entry = index in entries ? entries[index] : null;
                const session = this.dom.session.controls.has(index) ? this.dom.session.controls.get(index) : {
                    id: entry ? entry.id : null,
                    type: this._getTypeConfig(),
                    display: this._getDisplayConfig(),
                    increment: index + 1,
                };
                this._updateSessionControl(index, session, entry);
                index++;
            }
            return resolve(true);
        });
    }
    /**
     * Update the entry config to use the stored record, and update the sessions for it
     * @param index
     * @param session
     * @param entry
     * @private
     */
    _updateSessionControl(index, session, entry = null) {
        session.increment = index + 1;
        session.id = entry ? entry.id : null;
        this._updateEntryTypeSession(session.type, entry);
        this._updateEntryDisplaySession(session.display, entry);
        this.dom.session.controls.set(index, session);
        this.setDomSession(index, session);
        return session;
    }
    /**
     * Update the entry type config to use correct value and path
     * @param config
     * @param entry
     * @private
     */
    _updateEntryTypeSession(config, entry = null) {
        config.value = entry ? entry.type : this.asset.type in this.asset.typeOption ? this.asset.typeOption[this.asset.type].defaultValue : 'n/a';
        config.control.setValue(config.value, { emitEvent: false });
        config.patch.path = entry ? `${this.asset.basePath}/${entry.id}` : null;
    }
    /**
     * Update the entry display config to use correct value and path
     * @param config
     * @param entry
     * @private
     */
    _updateEntryDisplaySession(config, entry = null) {
        config.value = entry ? entry.name : '';
        config.control.setValue(config.value, { emitEvent: false });
        config.patch.path = entry ? `${this.asset.basePath}/${entry.id}` : null;
    }
    /**
     * Store each entry config in a dom session so that it can be restored when the users is switching tabs
     * @param index
     * @param session
     */
    setDomSession(index, session) {
        const domStorage = StorageGetter(this.dom.repo, ['components', this.name, this.id + '', 'session']);
        if (IsObject(domStorage, ['controls'])) {
            const controls = domStorage.controls;
            controls.set(index, session);
        }
    }
    /**
     * Set entry config objects that will be used in the html template
     * @private
     */
    _setEntries() {
        return new Promise((resolve) => {
            this.ui.entries = [];
            if (this.dom.session.controls) {
                let index = 0;
                while (index < this.asset.field.multiple_min) {
                    this.ui.entries.push(this.dom.session.controls.get(index));
                    index++;
                }
            }
            return resolve(true);
        });
    }
    /**
     * Manage the type of each entry
     * @param ind
     * @private
     */
    _getTypeConfig() {
        let disabled = false;
        let options = this.asset.type in this.asset.typeOption ? this.asset.typeOption[this.asset.type].options : [];
        if (!IsArray(options, true)) {
            options = [{ value: 'n/a', name: 'N/A' }];
            disabled = true;
        }
        return new SelectConfig({
            label: 'Type',
            options: { values: options },
            disabled: disabled,
            patch: {
                field: 'type',
                path: null,
            }
        });
    }
    /**
     * Manage the display of each entry
     * @param index
     * @private
     */
    _getDisplayConfig() {
        return new InputConfig({
            label: 'Display Name',
            patch: {
                field: 'name',
                path: null
            }
        });
    }
    _triggerFieldPreviewUpdate() {
        this.core.channel.next({ source: this.name, target: 'PopEntityFieldPreviewComponent', type: 'component', name: 'update' });
    }
}
PopEntityFieldValuesComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-field-values',
                template: "<mat-divider [style.width.%]=100 [style.marginTop.px]=5 [style.marginBottom.px]=5></mat-divider>\n<div class=\"entity-field-values-container\" [ngClass]=\"{'sw-disabled': dom.state.pending}\">\n  <div class=\"entity-field-values-row\" *ngFor=\"let entry of ui.entries; let index = index;\">\n    <div class=\"entity-field-values-row import-flex-item-sm import-flex-grow-xs\">\n      <div class=\"entity-field-values-section import-flex-column-break import-flex-item-xs import-flex-start-center\" [style.maxWidth.px]=30>\n        {{entry.increment}}.\n      </div>\n      <div class=\"entity-field-values-section import-flex-column-break import-flex-item-sm import-flex-grow-xs\">\n        <lib-pop-select class=\"import-flex-item-full\" [config]=\"entry.type\" (events)=\"onEntryTypeChange(index, $event)\"></lib-pop-select>\n      </div>\n    </div>\n    <div class=\"entity-field-values-row import-flex-item-sm import-flex-grow-xs\">\n      <div class=\"entity-field-values-section import-flex-column-break import-flex-item-sm import-flex-grow-xs sw-mar-lft-md\">\n        <lib-pop-input class=\"import-flex-item-full\" [config]=\"entry.display\" (events)=\"onEntryDisplayChange(index, $event)\"></lib-pop-input>\n      </div>\n    </div>\n  </div>\n</div>\n\n",
                styles: [".import-flex-row,.import-flex-row-wrap{display:flex;flex-direction:row}.import-flex-row-wrap{flex-wrap:wrap;padding:0;flex-basis:100%;box-sizing:border-box}.import-flex-row-break{flex-basis:100%;height:0}.import-flex-column-break{flex-basis:100%;width:0}.import-flex-item-icon{min-width:var(--field-icon-width);height:var(--field-icon-height);display:flex;justify-content:center;align-items:center}.import-flex-column-xs{display:flex;flex-direction:column;width:12.5%;min-height:30px}.import-flex-column-sm{flex:1;flex-direction:column;width:25%;min-height:30px}.import-flex-column-md{flex:1;flex-direction:column;width:50%}.import-flex-column-lg{flex:1;flex-direction:column;width:75%;min-height:30px}.import-flex-item-xs{flex-basis:12.5%}.import-flex-item-sm{flex-basis:25%}.import-flex-item-md{flex-basis:50%}.import-flex-item-full{flex-basis:100%}.import-flex-grow-xs{flex-grow:1}.import-flex-grow-sm{flex-grow:2}.import-flex-grow-md{flex-grow:3}.import-flex-grow-lg{flex-grow:4}.import-flex-column{display:flex;flex-direction:column}.import-flex-center{display:flex;align-items:center;justify-content:center}.import-flex-space-center{justify-content:space-around;align-items:center}.import-flex-space-between-center{justify-content:space-between;align-items:center}.import-flex-center-start{display:flex;justify-content:center;align-items:flex-start}.import-flex-start-center{display:flex;justify-content:flex-start;align-items:center}.import-flex-end-center{display:flex;justify-content:flex-end;align-items:center}.import-flex-end{display:flex;align-items:flex-end;justify-content:flex-end}.import-flex-align-end{display:flex;align-self:flex-end}.import-flex-stretch-center{display:flex;justify-content:stretch;align-items:center}.sw-mar-xs{margin:var(--xs)}.sw-mar-sm{margin:var(--sm)}.sw-mar-md{margin:var(--md)}.sw-mar-lg{margin:var(--lg)}.sw-mar-xlg{margin:var(--xlg)}.sw-mar-hrz-xs{margin-left:var(--xs);margin-right:var(--xs)}.sw-mar-hrz-md,.sw-mar-hrz-sm{margin-left:var(--md);margin-right:var(--md)}.sw-mar-hrz-lg{margin-left:var(--lg);margin-right:var(--lg)}.sw-mar-hrz-xlg{margin-left:var(--xlg);margin-right:var(--xlg)}.sw-mar-vrt-xs{margin-top:var(--xs);margin-bottom:var(--xs)}.sw-mar-vrt-md,.sw-mar-vrt-sm{margin-top:var(--md);margin-bottom:var(--md)}.sw-mar-vrt-lg{margin-top:var(--lg);margin-bottom:var(--lg)}.sw-mar-vrt-xlg{margin-top:var(--xlg);margin-bottom:var(--xlg)}.sw-mar-lft-xs{margin-left:var(--xs)}.sw-mar-lft-sm{margin-left:var(--sm)}.sw-mar-lft-md{margin-left:var(--md)}.sw-mar-lft-lg{margin-left:var(--lg)}.sw-mar-lft-xlg{margin-left:var(--xlg)}.sw-mar-rgt-xs{margin-right:var(--xs)}.sw-mar-rgt-sm{margin-right:var(--sm)}.sw-mar-rgt-md{margin-right:var(--md)}.sw-mar-rgt-lg{margin-right:var(--lg)}.sw-mar-rgt-xlg{margin-right:var(--xlg)}.sw-mar-btm-xs{margin-bottom:var(--xs)}.sw-mar-btm-sm{margin-bottom:var(--sm)}.sw-mar-btm-md{margin-bottom:var(--md)}.sw-mar-btm-lg{margin-bottom:var(--lg)}.sw-mar-btm-xlg{margin-bottom:var(--xlg)}.sw-mar-top-xs{margin-top:var(--xs)}.sw-mar-top-sm{margin-top:var(--sm)}.sw-mar-top-md{margin-top:var(--md)}.sw-mar-top-lg{margin-top:var(--lg)}.sw-mar-top-xlg{margin-top:var(--xlg)}:host{width:100%}.entity-field-values-container{display:flex;flex-direction:column;width:100%;position:relative;box-sizing:border-box;max-height:245px;overflow-x:hidden;overflow-y:auto}.entity-field-values-row{height:60px;display:flex;width:100%;box-sizing:border-box}.entity-field-values-section{display:flex;height:60px}"]
            },] }
];
PopEntityFieldValuesComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: PopFieldEditorService }
];
// export interface FieldEntrySession {
//   id: number;
//   type: SelectConfig;
//   display: InputConfig;
//   increment: number;
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1maWVsZC12YWx1ZXMuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktZmllbGQtZWRpdG9yL3BvcC1lbnRpdHktZmllbGQtc2V0dGluZ3MvcG9wLWVudGl0eS1maWVsZC12YWx1ZXMvcG9wLWVudGl0eS1maWVsZC12YWx1ZXMuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFxQixNQUFNLGVBQWUsQ0FBQztBQUN6RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUN6RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDeEUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGdFQUFnRSxDQUFDO0FBQzlGLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw4REFBOEQsQ0FBQztBQUMzRixPQUFPLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDMUgsT0FBTyxFQUE4RixNQUFNLEVBQUUsZUFBZSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDdEssT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDckUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDaEYsT0FBTyxFQUFFLFFBQVEsRUFBYyxNQUFNLE1BQU0sQ0FBQztBQUM1QyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQVM5RSxNQUFNLE9BQU8sNkJBQThCLFNBQVEsa0JBQWtCO0lBK0JuRSxZQUNTLEVBQWMsRUFDYixPQUFzQixFQUN0QixTQUFnQztRQUV4QyxLQUFLLEVBQUUsQ0FBQztRQUpELE9BQUUsR0FBRixFQUFFLENBQVk7UUFDYixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQ3RCLGNBQVMsR0FBVCxTQUFTLENBQXVCO1FBaENuQyxTQUFJLEdBQUcsK0JBQStCLENBQUM7UUFFcEMsUUFBRyxHQUdUO1lBQ0YsS0FBSyxFQUF5QixTQUFTO1lBQ3ZDLE9BQU8sRUFBRSxlQUFlLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDO1NBQ2hELENBQUM7UUFFUSxVQUFLLEdBQUc7WUFDaEIsUUFBUSxFQUFVLFNBQVM7WUFDM0IsS0FBSyxFQUFrQixTQUFTO1lBQ2hDLElBQUksRUFBVSxTQUFTO1lBQ3ZCLFVBQVUsRUFBNkUsU0FBUztTQUNqRyxDQUFDO1FBcUJBLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzdCOztXQUVHO1FBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBcUIsRUFBRTtZQUMxQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBRTdCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLElBQWdCLEVBQUUsS0FBMkIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUV6RyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFFLElBQUksRUFBRSxZQUFZLENBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQWlCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ2xNLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyw2Q0FBNkM7Z0JBQ2pHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLENBQUMsQ0FBQyw4Q0FBOEM7Z0JBRW5ILElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyx3Q0FBd0M7Z0JBRXZHLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUF5RztvQkFDcEgsT0FBTyxFQUFFLEVBQUUsRUFBRSx3Q0FBd0M7aUJBQ3RELENBQUM7Z0JBQ0YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxpRkFBaUY7Z0JBRXhILE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBcUIsRUFBRTtZQUN4QyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUU7b0JBQ3ZDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDdEIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUVOLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQW5ERDs7T0FFRztJQUNPLHFCQUFxQjtRQUM3QixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDN0IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0lBOENEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBR0Q7Ozs7T0FJRztJQUNILGlCQUFpQixDQUFDLEtBQWEsRUFBRSxLQUE0QjtRQUMzRCxJQUFJLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDNUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUUsS0FBSyxDQUFFLENBQUM7WUFDeEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFFLEtBQUssQ0FBRSxDQUFDO1lBQ2hELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckQsSUFBSSxLQUFLLElBQUksT0FBTyxFQUFFO2dCQUNwQixLQUFLLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFDdkMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2xELElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQzthQUNwQztZQUNELFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7WUFDcEMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ1A7SUFDSCxDQUFDO0lBR0Q7Ozs7T0FJRztJQUNILG9CQUFvQixDQUFDLEtBQWEsRUFBRSxLQUE0QjtRQUM5RCxJQUFJLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDNUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUUsS0FBSyxDQUFFLENBQUM7WUFDeEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFFLEtBQUssQ0FBRSxDQUFDO1lBQ2hELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckQsSUFBSSxLQUFLLElBQUksT0FBTyxFQUFFO2dCQUNwQixLQUFLLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFDMUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3hELElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQzthQUNwQztTQUNGO1FBQ0QsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNkLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1FBQ3BDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7SUFHRDs7T0FFRztJQUNILFdBQVc7UUFDVCxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUdEOzs7OztzR0FLa0c7SUFFbEc7Ozs7T0FJRztJQUNLLGlCQUFpQixDQUFDLEtBQTRCO1FBQ3BELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzFDLElBQUksc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRTtZQUM1QyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssb0JBQW9CLEVBQUU7Z0JBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUU7b0JBQ3ZDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDdEIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ1Q7U0FDRjtJQUNILENBQUM7SUFHRDs7O09BR0c7SUFDSyxZQUFZO1FBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDOUIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBcUIsRUFBRSxFQUFFO1lBQ3JELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUMvQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDM0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztvQkFDL0IsVUFBVSxDQUFDLEdBQUcsRUFBRTt3QkFDZCxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztvQkFDcEMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNSLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFHRDs7Ozs7O09BTUc7SUFDSyxnQkFBZ0I7UUFDdEIsT0FBTyxJQUFJLE9BQU8sQ0FBZSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzNDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzNFLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbkUsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBRWQsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ2xCLE9BQU8sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRTtnQkFDNUMsTUFBTSxRQUFRLEdBQUcsS0FBSyxJQUFJLGFBQWEsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFFLEtBQUssQ0FBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3hFLElBQUksQ0FBQyxRQUFRO29CQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ25DLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRCxNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUMsQ0FBQyw4Q0FBOEM7WUFDbkUsMENBQTBDO1lBQzFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDbkIsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pGLENBQUMsQ0FBQyxDQUFDO1lBQ0gsd0NBQXdDO1lBQ3hDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxZQUFvQixFQUFFLEVBQUU7Z0JBQ2xDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzVELFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRTtvQkFDOUQsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQzVDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEtBQUs7aUJBQzlJLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRSx5REFBeUQ7Z0JBQzlFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxhQUEyQixFQUFFLEVBQUU7b0JBRW5FLE9BQU8sT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUNoQyxDQUFDLENBQUMsQ0FBQzthQUNKO2lCQUFJLEVBQUUsZ0RBQWdEO2dCQUNyRCxPQUFPLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUMvQjtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUdEOzs7O09BSUc7SUFDSyxnQkFBZ0IsQ0FBQyxRQUEyQjtRQUNsRCxPQUFPLElBQUksT0FBTyxDQUFlLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDM0MsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO29CQUM1RCxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQWUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQ3ZFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtvQkFDL0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNmLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ1QsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUdEOzs7T0FHRztJQUNLLHdCQUF3QixDQUFDLE9BQXFCO1FBQ3BELE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUM3QixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDZCxPQUFPLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUU7Z0JBQzVDLE1BQU0sS0FBSyxHQUFHLEtBQUssSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBRSxLQUFLLENBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUN6RCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUYsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDM0IsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUU7b0JBQzNCLE9BQU8sRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7b0JBQ2pDLFNBQVMsRUFBRSxLQUFLLEdBQUcsQ0FBQztpQkFDckIsQ0FBQztnQkFDRixJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDbEQsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNELE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUdEOzs7Ozs7T0FNRztJQUNLLHFCQUFxQixDQUFDLEtBQWEsRUFBRSxPQUEwQixFQUFFLFFBQW9CLElBQUk7UUFDL0YsT0FBTyxDQUFDLFNBQVMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLE9BQU8sQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDckMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkMsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUdEOzs7OztPQUtHO0lBQ0ssdUJBQXVCLENBQUMsTUFBb0IsRUFBRSxRQUFvQixJQUFJO1FBQzVFLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM3SSxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDNUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQzFFLENBQUM7SUFHRDs7Ozs7T0FLRztJQUNLLDBCQUEwQixDQUFDLE1BQW1CLEVBQUUsUUFBb0IsSUFBSTtRQUM5RSxNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3ZDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM1RCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDMUUsQ0FBQztJQUdEOzs7O09BSUc7SUFDSyxhQUFhLENBQUMsS0FBYSxFQUFFLE9BQTBCO1FBQzdELE1BQU0sVUFBVSxHQUFRLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLFNBQVMsQ0FBRSxDQUFDLENBQUM7UUFDM0csSUFBSSxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUUsVUFBVSxDQUFFLENBQUMsRUFBRTtZQUN4QyxNQUFNLFFBQVEsR0FBbUMsVUFBVSxDQUFDLFFBQVEsQ0FBQztZQUNyRSxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztTQUM5QjtJQUNILENBQUM7SUFHRDs7O09BR0c7SUFDSyxXQUFXO1FBQ2pCLE9BQU8sSUFBSSxPQUFPLENBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUN0QyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDckIsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7Z0JBQzdCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztnQkFDZCxPQUFPLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUU7b0JBQzVDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQzNELEtBQUssRUFBRSxDQUFDO2lCQUNUO2FBQ0Y7WUFDRCxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFHRDs7OztPQUlHO0lBQ0ssY0FBYztRQUNwQixJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDckIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDL0csSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDM0IsT0FBTyxHQUFHLENBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBRSxDQUFDO1lBQzVDLFFBQVEsR0FBRyxJQUFJLENBQUM7U0FDakI7UUFDRCxPQUFPLElBQUksWUFBWSxDQUFDO1lBQ3RCLEtBQUssRUFBRSxNQUFNO1lBQ2IsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRTtZQUM1QixRQUFRLEVBQUUsUUFBUTtZQUNsQixLQUFLLEVBQUU7Z0JBQ0wsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsSUFBSSxFQUFFLElBQUk7YUFDWDtTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7SUFHRDs7OztPQUlHO0lBQ0ssaUJBQWlCO1FBQ3ZCLE9BQU8sSUFBSSxXQUFXLENBQUM7WUFDckIsS0FBSyxFQUFFLGNBQWM7WUFDckIsS0FBSyxFQUFFO2dCQUNMLEtBQUssRUFBRSxNQUFNO2dCQUNiLElBQUksRUFBRSxJQUFJO2FBQ1g7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0lBR08sMEJBQTBCO1FBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxnQ0FBZ0MsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzdILENBQUM7OztZQXpZRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLDZCQUE2QjtnQkFDdkMsMHZDQUF1RDs7YUFFeEQ7OztZQWxCbUIsVUFBVTtZQUVyQixhQUFhO1lBUWIscUJBQXFCOztBQWlaOUIsdUNBQXVDO0FBQ3ZDLGdCQUFnQjtBQUNoQix3QkFBd0I7QUFDeEIsMEJBQTBCO0FBQzFCLHVCQUF1QjtBQUN2QixJQUFJIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQgeyBTZWxlY3RDb25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1zZWxlY3Qvc2VsZWN0LWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBJbnB1dENvbmZpZyB9IGZyb20gJy4uLy4uLy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLWlucHV0L2lucHV0LWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBHZXRIdHRwRXJyb3JNc2csIElzQXJyYXksIElzT2JqZWN0LCBJc09iamVjdFRocm93RXJyb3IsIFN0b3JhZ2VHZXR0ZXIgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHsgQ29yZUNvbmZpZywgRGljdGlvbmFyeSwgRmllbGRFbnRyeSwgRmllbGRJbnRlcmZhY2UsIEZpZWxkSXRlbU9wdGlvbiwgUG9wQmFzZUV2ZW50SW50ZXJmYWNlLCBQb3BMb2csIFNlcnZpY2VJbmplY3RvciB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgSXNWYWxpZEZpZWxkUGF0Y2hFdmVudCB9IGZyb20gJy4uLy4uLy4uL3BvcC1lbnRpdHktdXRpbGl0eSc7XG5pbXBvcnQgeyBQb3BSZXF1ZXN0U2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1yZXF1ZXN0LnNlcnZpY2UnO1xuaW1wb3J0IHsgZm9ya0pvaW4sIE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFBvcEZpZWxkRWRpdG9yU2VydmljZSB9IGZyb20gJy4uLy4uL3BvcC1lbnRpdHktZmllbGQtZWRpdG9yLnNlcnZpY2UnO1xuaW1wb3J0IHtGaWVsZEVudHJ5U2Vzc2lvbn0gZnJvbSBcIi4uL3BvcC1lbnRpdHktZmllbGQtZW50cmllcy9wb3AtZW50aXR5LWZpZWxkLWVudHJpZXMuY29tcG9uZW50XCI7XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC1lbnRpdHktZmllbGQtdmFsdWVzJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lbnRpdHktZmllbGQtdmFsdWVzLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbICcuL3BvcC1lbnRpdHktZmllbGQtdmFsdWVzLmNvbXBvbmVudC5zY3NzJyBdXG59KVxuZXhwb3J0IGNsYXNzIFBvcEVudGl0eUZpZWxkVmFsdWVzQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuXG4gIHB1YmxpYyBuYW1lID0gJ1BvcEVudGl0eUZpZWxkVmFsdWVzQ29tcG9uZW50JztcblxuICBwcm90ZWN0ZWQgc3J2OiB7XG4gICAgZmllbGQ6IFBvcEZpZWxkRWRpdG9yU2VydmljZSxcbiAgICByZXF1ZXN0OiBQb3BSZXF1ZXN0U2VydmljZVxuICB9ID0ge1xuICAgIGZpZWxkOiA8UG9wRmllbGRFZGl0b3JTZXJ2aWNlPnVuZGVmaW5lZCxcbiAgICByZXF1ZXN0OiBTZXJ2aWNlSW5qZWN0b3IuZ2V0KFBvcFJlcXVlc3RTZXJ2aWNlKSxcbiAgfTtcblxuICBwcm90ZWN0ZWQgYXNzZXQgPSB7XG4gICAgYmFzZVBhdGg6IDxzdHJpbmc+dW5kZWZpbmVkLFxuICAgIGZpZWxkOiA8RmllbGRJbnRlcmZhY2U+dW5kZWZpbmVkLFxuICAgIHR5cGU6IDxzdHJpbmc+dW5kZWZpbmVkLFxuICAgIHR5cGVPcHRpb246IDxEaWN0aW9uYXJ5PHsgZGVmYXVsdFZhbHVlOiBzdHJpbmcgfCBudW1iZXIsIG9wdGlvbnM6IEZpZWxkSXRlbU9wdGlvbltdIH0+PnVuZGVmaW5lZCxcbiAgfTtcblxuXG4gIC8qKlxuICAgKiBOZXN0IGFsbCBzZXJ2aWNlIHJlbGF0ZWQgY2xhc3NlcyB1bmRlciBzcnZcbiAgICovXG4gIHByb3RlY3RlZCB0cmFuc2Zvcm1TcnZDb250YWluZXIoKXtcbiAgICB0aGlzLnNydi5maWVsZCA9IHRoaXMuZmllbGRSZXBvO1xuICAgIHRoaXMuZG9tLnJlcG8gPSB0aGlzLmRvbVJlcG87XG4gICAgZGVsZXRlIHRoaXMuZmllbGRSZXBvO1xuICAgIGRlbGV0ZSB0aGlzLmRvbVJlcG87XG4gIH1cblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcml2YXRlIGRvbVJlcG86IFBvcERvbVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBmaWVsZFJlcG86IFBvcEZpZWxkRWRpdG9yU2VydmljZVxuICApe1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLnRyYW5zZm9ybVNydkNvbnRhaW5lcigpO1xuICAgIC8qKlxuICAgICAqIFRoaXMgc2hvdWxkIHRyYW5zZm9ybSBhbmQgdmFsaWRhdGUgdGhlIGRhdGEuIFRoZSB2aWV3IHNob3VsZCB0cnkgdG8gb25seSB1c2UgZGF0YSB0aGF0IGlzIHN0b3JlZCBvbiB1aSBzbyB0aGF0IGl0IGlzIG5vdCBkZXBlbmRlbnQgb24gdGhlIHN0cnVjdHVyZSBvZiBkYXRhIHRoYXQgY29tZXMgZnJvbSBvdGhlciBzb3VyY2VzLiBUaGUgdWkgc2hvdWxkIGJlIHRoZSBzb3VyY2Ugb2YgdHJ1dGggaGVyZS5cbiAgICAgKi9cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblxuICAgICAgICB0aGlzLmRvbS5oYW5kbGVyLmNvcmUgPSAoY29yZTogQ29yZUNvbmZpZywgZXZlbnQ6UG9wQmFzZUV2ZW50SW50ZXJmYWNlKSA9PiB0aGlzLl9jb3JlRXZlbnRIYW5kbGVyKGV2ZW50KTtcblxuICAgICAgICB0aGlzLmFzc2V0LmZpZWxkID0gSXNPYmplY3RUaHJvd0Vycm9yKHRoaXMuY29yZSwgdHJ1ZSwgYEludmFsaWQgQ29yZWApICYmIElzT2JqZWN0VGhyb3dFcnJvcih0aGlzLmNvcmUuZW50aXR5LCBbICdpZCcsICdmaWVsZGdyb3VwJyBdLCBgSW52YWxpZCBGaWVsZGApID8gPEZpZWxkSW50ZXJmYWNlPnRoaXMuY29yZS5lbnRpdHkgOiBudWxsO1xuICAgICAgICB0aGlzLmFzc2V0LnR5cGUgPSB0aGlzLmFzc2V0LmZpZWxkLmZpZWxkZ3JvdXAubmFtZTsgLy8gdGhlIGZpZWxkIGdyb3VwIG5hbWUgLCBpZS4uIGFkZHJlc3MsIHBob25lXG4gICAgICAgIHRoaXMuYXNzZXQudHlwZU9wdGlvbiA9IHRoaXMuc3J2LmZpZWxkLmdldERlZmF1bHRMYWJlbFR5cGVPcHRpb25zKCk7IC8vIHRoZSBzZWxlY3Qgb3B0aW9ucyB0aGF0IGJlbG9uZyB0byB0aGUgdHlwZXNcblxuICAgICAgICB0aGlzLmFzc2V0LmJhc2VQYXRoID0gYGZpZWxkcy8ke3RoaXMuYXNzZXQuZmllbGQuaWR9L2VudHJpZXNgOyAvLyBhcGkgZW5kcG9pbnQgdG8gaGl0IGZvciBmaWVsZCBlbnRyaWVzXG5cbiAgICAgICAgdGhpcy51aS5hc3NldCA9IDx7IGVudHJpZXM6IHsgdHlwZTogU2VsZWN0Q29uZmlnLCBkaXNwbGF5OiBJbnB1dENvbmZpZywgaW5jcmVtZW50OiBudW1iZXIgfVtdLCBtYXA6IERpY3Rpb25hcnk8YW55PiB9PntcbiAgICAgICAgICBlbnRyaWVzOiBbXSwgLy8gbGlzdCBvZiBjb25maWdzIGZvciBlYWNoIGVudHJ5IHJlY29yZFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmRvbS5zZXNzaW9uLmNvbnRyb2xzID0gbmV3IE1hcCgpOyAvLyBzdG9yZSB0aGUgZW50cnkgY29uZmlncyBzbyB0aGF0IGNoYW5nZXMgYXJlIG5vdCBsb3N0IHdoZW4gdGhlIHRhYnMgYXJlIGNoYW5nZWRcblxuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLmRvbS5wcm9jZWVkID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoJ3Nob3ctZW50cmllcycsICgpID0+IHtcbiAgICAgICAgICB0aGlzLl9zaG93RW50cmllcygpO1xuICAgICAgICB9LCAwKTtcblxuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCBzaG91bGQgaGF2ZSBhIHNwZWNpZmljIHB1cnBvc2VcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIHR5cGUgb2YgYW4gZW50cnkgaXMgY2hhbmdlZCBpbiB0aGUgZGF0YWJhc2UsIG1ha2Ugc3VyZSB0aGUgY2hhbmdlcyBpcyB1cGRhdGVkIGxvY2FsbHlcbiAgICogQHBhcmFtIGluZGV4XG4gICAqIEBwYXJhbSBldmVudFxuICAgKi9cbiAgb25FbnRyeVR5cGVDaGFuZ2UoaW5kZXg6IG51bWJlciwgZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSl7XG4gICAgaWYoIElzVmFsaWRGaWVsZFBhdGNoRXZlbnQodGhpcy5jb3JlLCBldmVudCkgKXtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMudWkuZW50cmllc1sgaW5kZXggXTtcbiAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5hc3NldC5maWVsZC5lbnRyaWVzWyBpbmRleCBdO1xuICAgICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuZG9tLnNlc3Npb24uY29udHJvbHMuZ2V0KGluZGV4KTtcbiAgICAgIGlmKCBlbnRyeSAmJiBzZXNzaW9uICl7XG4gICAgICAgIGVudHJ5LnR5cGUgPSBjb25maWcudHlwZS5jb250cm9sLnZhbHVlO1xuICAgICAgICB0aGlzLl91cGRhdGVFbnRyeVR5cGVTZXNzaW9uKHNlc3Npb24udHlwZSwgZW50cnkpO1xuICAgICAgICB0aGlzLmRvbS5zZXNzaW9uLmNvbnRyb2xzLnNldChpbmRleCwgc2Vzc2lvbik7XG4gICAgICAgIHRoaXMuc2V0RG9tU2Vzc2lvbihpbmRleCwgc2Vzc2lvbik7XG4gICAgICB9XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5fdHJpZ2dlckZpZWxkUHJldmlld1VwZGF0ZSgpO1xuICAgICAgfSwgMCk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogV2hlbiB0aGUgZGlzcGxheS9sYWJlbCBvZiBhbiBlbnRyeSBpcyBjaGFuZ2VkIGluIHRoZSBkYXRhYmFzZSwgbWFrZSBzdXJlIHRoZSBjaGFuZ2VzIGlzIHVwZGF0ZWQgbG9jYWxseVxuICAgKiBAcGFyYW0gaW5kZXhcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuICBvbkVudHJ5RGlzcGxheUNoYW5nZShpbmRleDogbnVtYmVyLCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlKXtcbiAgICBpZiggSXNWYWxpZEZpZWxkUGF0Y2hFdmVudCh0aGlzLmNvcmUsIGV2ZW50KSApe1xuICAgICAgY29uc3QgY29uZmlnID0gdGhpcy51aS5lbnRyaWVzWyBpbmRleCBdO1xuICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmFzc2V0LmZpZWxkLmVudHJpZXNbIGluZGV4IF07XG4gICAgICBjb25zdCBzZXNzaW9uID0gdGhpcy5kb20uc2Vzc2lvbi5jb250cm9scy5nZXQoaW5kZXgpO1xuICAgICAgaWYoIGVudHJ5ICYmIHNlc3Npb24gKXtcbiAgICAgICAgZW50cnkubmFtZSA9IGNvbmZpZy5kaXNwbGF5LmNvbnRyb2wudmFsdWU7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUVudHJ5RGlzcGxheVNlc3Npb24oc2Vzc2lvbi5kaXNwbGF5LCBlbnRyeSk7XG4gICAgICAgIHRoaXMuZG9tLnNlc3Npb24uY29udHJvbHMuc2V0KGluZGV4LCBzZXNzaW9uKTtcbiAgICAgICAgdGhpcy5zZXREb21TZXNzaW9uKGluZGV4LCBzZXNzaW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl90cmlnZ2VyRmllbGRQcmV2aWV3VXBkYXRlKCk7XG4gICAgfSwgMCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgZG9tIGRlc3Ryb3kgZnVuY3Rpb24gbWFuYWdlcyBhbGwgdGhlIGNsZWFuIHVwIHRoYXQgaXMgbmVjZXNzYXJ5IGlmIHN1YnNjcmlwdGlvbnMsIHRpbWVvdXRzLCBldGMgYXJlIHN0b3JlZCBwcm9wZXJseVxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVuZGVyIFRoZSBIb29kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJpdmF0ZSBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAvKipcbiAgICogTGlzdGVuIGZvciB3aGVuIHRoZSBtaW5fbXVsdGlwbGUgJiYgbWF4X211bHRpcGxlIHZhbHVlcyBjaGFuZ2VcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9jb3JlRXZlbnRIYW5kbGVyKGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2Upe1xuICAgIHRoaXMubG9nLmluZm8oYF9jb3JlRXZlbnRIYW5kbGVyYCwgZXZlbnQpO1xuICAgIGlmKCBJc1ZhbGlkRmllbGRQYXRjaEV2ZW50KHRoaXMuY29yZSwgZXZlbnQpICl7XG4gICAgICBpZiggZXZlbnQuc291cmNlID09PSAnUG9wTWluTWF4Q29tcG9uZW50JyApe1xuICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCdzaG93LWVudHJpZXMnLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fc2hvd0VudHJpZXMoKTtcbiAgICAgICAgfSwgMjUwKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBQcm9kdWNlIGEgbGlzdCBvZiB0aGUgZW50cnkgdmFsdWVzIGZvciB0aGlzIGZpZWxkXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9zaG93RW50cmllcygpe1xuICAgIHRoaXMuZG9tLnN0YXRlLnBlbmRpbmcgPSB0cnVlO1xuICAgIHRoaXMuX3NldFZhbHVlRW50cmllcygpLnRoZW4oKGVudHJpZXM6IEZpZWxkRW50cnlbXSkgPT4ge1xuICAgICAgdGhpcy5fc2V0RW50cnlTZXNzaW9uQ29udHJvbHMoZW50cmllcykudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuX3NldEVudHJpZXMoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmRvbS5zdGF0ZS5wZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl90cmlnZ2VyRmllbGRQcmV2aWV3VXBkYXRlKCk7XG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBFbnN1cmUgdGhhdCB0aGUgZGF0YWJhc2UgcmVjb3JkcyBtYXRjaCB0aGUgbWluL21heCBzZXR0aW5nc1xuICAgKiBUaGlzIHdpbGwgcmVtb3ZlIGFueSBleGNlc3MgcmVjb3JkcyBpbiB0aGUgZGF0YWJhc2UgdGhhdCBleGNlZWQgdGhlIG11bHRpcGxlX21pblxuICAgKiBUaGlzIHdpbGwgY3JlYXRlIHJlY29yZHMgZm9yIGFuIGVudHJpZXMgdGhhdCBhcmUgbmVlZGVkIGluIHRoZSBkYXRhYmFzZVxuICAgKiBAcGFyYW0gcGF0Y2hcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX3NldFZhbHVlRW50cmllcygpOiBQcm9taXNlPEZpZWxkRW50cnlbXT57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPEZpZWxkRW50cnlbXT4oKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IHN0b3JlZEVudHJpZXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuYXNzZXQuZmllbGQuZW50cmllcykpO1xuICAgICAgY29uc3QgZXhjZXNzID0gc3RvcmVkRW50cmllcy5zcGxpY2UodGhpcy5hc3NldC5maWVsZC5tdWx0aXBsZV9taW4pO1xuICAgICAgbGV0IGluZGV4ID0gMDtcblxuICAgICAgY29uc3QgbmVlZGVkID0gW107XG4gICAgICB3aGlsZSggaW5kZXggPCB0aGlzLmFzc2V0LmZpZWxkLm11bHRpcGxlX21pbiApe1xuICAgICAgICBjb25zdCBleGlzdGluZyA9IGluZGV4IGluIHN0b3JlZEVudHJpZXMgPyBzdG9yZWRFbnRyaWVzWyBpbmRleCBdIDogbnVsbDtcbiAgICAgICAgaWYoICFleGlzdGluZyApIG5lZWRlZC5wdXNoKGluZGV4KTtcbiAgICAgICAgaW5kZXgrKztcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlcXVlc3RzID0gW107IC8vIGNvbnRhaW5zIGFsbCB0aGUgY3JlYXRlL3JlbW92ZSBhcGkvcmVxdWVzdHNcbiAgICAgIC8vIGRlbGV0ZSBhbnkgZXhjZXNzIGVudHJpZXMgZnJvbSBkYXRhYmFzZVxuICAgICAgZXhjZXNzLm1hcCgoZW50cnkpID0+IHtcbiAgICAgICAgcmVxdWVzdHMucHVzaCh0aGlzLnNydi5yZXF1ZXN0LmRvRGVsZXRlKGAke3RoaXMuYXNzZXQuYmFzZVBhdGh9LyR7ZW50cnkuaWR9YCkpO1xuICAgICAgfSk7XG4gICAgICAvLyBjcmVhdGUgYW55IG5lZWRlZCBlbnRyaWVzIGluIGRhdGFiYXNlXG4gICAgICBuZWVkZWQubWFwKChzZXNzaW9uSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICBjb25zdCBzZXNzaW9uID0gdGhpcy5kb20uc2Vzc2lvbi5jb250cm9scy5nZXQoc2Vzc2lvbkluZGV4KTtcbiAgICAgICAgcmVxdWVzdHMucHVzaCh0aGlzLnNydi5yZXF1ZXN0LmRvUG9zdChgJHt0aGlzLmFzc2V0LmJhc2VQYXRofWAsIHtcbiAgICAgICAgICBuYW1lOiBzZXNzaW9uID8gc2Vzc2lvbi5kaXNwbGF5LnZhbHVlIDogbnVsbCxcbiAgICAgICAgICB0eXBlOiBzZXNzaW9uID8gc2Vzc2lvbi50eXBlLnZhbHVlIDogdGhpcy5hc3NldC50eXBlIGluIHRoaXMuYXNzZXQudHlwZU9wdGlvbiA/IHRoaXMuYXNzZXQudHlwZU9wdGlvblsgdGhpcy5hc3NldC50eXBlIF0uZGVmYXVsdFZhbHVlIDogJ24vYSdcbiAgICAgICAgfSwgMSwgZmFsc2UpKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiggcmVxdWVzdHMubGVuZ3RoICl7IC8vIG5lZWQgdG8gdXBkYXRlIHRoZSBkYXRhIGJhc2UgdG8gbWF0Y2ggbWluL21heCBzZXR0aW5nc1xuICAgICAgICB0aGlzLl9tYWtlQXBpUmVxdWVzdHMocmVxdWVzdHMpLnRoZW4oKHNlcnZlckVudHJpZXM6IEZpZWxkRW50cnlbXSkgPT4ge1xuXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoc2VydmVyRW50cmllcyk7XG4gICAgICAgIH0pO1xuICAgICAgfWVsc2V7IC8vIHN0b3JlZCBlbnRyaWVzIGFscmVhZHkgbWF0Y2ggbWluL21heCBzZXR0aW5nc1xuICAgICAgICByZXR1cm4gcmVzb2x2ZShzdG9yZWRFbnRyaWVzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFdpbGwgbWFrZSBhbGwgb2YgdGhlIG5lZWRlZCBhcGkgcmVxdWVzdHNcbiAgICogQHBhcmFtIHJlcXVlc3RzXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9tYWtlQXBpUmVxdWVzdHMocmVxdWVzdHM6IE9ic2VydmFibGU8YW55PltdKTogUHJvbWlzZTxGaWVsZEVudHJ5W10+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxGaWVsZEVudHJ5W10+KChyZXNvbHZlKSA9PiB7XG4gICAgICBmb3JrSm9pbihyZXF1ZXN0cykuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgdGhpcy5zcnYucmVxdWVzdC5kb0dldCh0aGlzLmFzc2V0LmJhc2VQYXRoKS5zdWJzY3JpYmUoKHJlcykgPT4ge1xuICAgICAgICAgIHJlcyA9IHJlcy5kYXRhID8gcmVzLmRhdGEgOiByZXM7XG4gICAgICAgICAgdGhpcy5hc3NldC5maWVsZC5lbnRyaWVzID0gSXNBcnJheShyZXMsIHRydWUpID8gPEZpZWxkRW50cnlbXT5yZXMgOiBbXTtcbiAgICAgICAgICB0aGlzLmNvcmUuZW50aXR5LmVudHJpZXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuYXNzZXQuZmllbGQuZW50cmllcykpXG4gICAgICAgICAgcmVzb2x2ZShyZXMpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgUG9wTG9nLmVycm9yKHRoaXMubmFtZSwgYF9tYWtlQXBpUmVxdWVzdHNgLCBHZXRIdHRwRXJyb3JNc2coZXJyKSk7XG4gICAgICAgIHJlc29sdmUoW10pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTdG9yZSBhIHNldCBvZiBjb250cm9scyB0aGF0IGNhbiBzdG9yZSB2YWx1ZXMgYXMgdGhlIHVzZXIgY2hhbmdlcyB0aGUgc2V0dGluZ3NcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX3NldEVudHJ5U2Vzc2lvbkNvbnRyb2xzKGVudHJpZXM6IEZpZWxkRW50cnlbXSk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgd2hpbGUoIGluZGV4IDwgdGhpcy5hc3NldC5maWVsZC5tdWx0aXBsZV9taW4gKXtcbiAgICAgICAgY29uc3QgZW50cnkgPSBpbmRleCBpbiBlbnRyaWVzID8gZW50cmllc1sgaW5kZXggXSA6IG51bGw7XG4gICAgICAgIGNvbnN0IHNlc3Npb24gPSB0aGlzLmRvbS5zZXNzaW9uLmNvbnRyb2xzLmhhcyhpbmRleCkgPyB0aGlzLmRvbS5zZXNzaW9uLmNvbnRyb2xzLmdldChpbmRleCkgOiB7XG4gICAgICAgICAgaWQ6IGVudHJ5ID8gZW50cnkuaWQgOiBudWxsLFxuICAgICAgICAgIHR5cGU6IHRoaXMuX2dldFR5cGVDb25maWcoKSxcbiAgICAgICAgICBkaXNwbGF5OiB0aGlzLl9nZXREaXNwbGF5Q29uZmlnKCksXG4gICAgICAgICAgaW5jcmVtZW50OiBpbmRleCArIDEsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX3VwZGF0ZVNlc3Npb25Db250cm9sKGluZGV4LCBzZXNzaW9uLCBlbnRyeSk7XG4gICAgICAgIGluZGV4Kys7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgZW50cnkgY29uZmlnIHRvIHVzZSB0aGUgc3RvcmVkIHJlY29yZCwgYW5kIHVwZGF0ZSB0aGUgc2Vzc2lvbnMgZm9yIGl0XG4gICAqIEBwYXJhbSBpbmRleFxuICAgKiBAcGFyYW0gc2Vzc2lvblxuICAgKiBAcGFyYW0gZW50cnlcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX3VwZGF0ZVNlc3Npb25Db250cm9sKGluZGV4OiBudW1iZXIsIHNlc3Npb246IEZpZWxkRW50cnlTZXNzaW9uLCBlbnRyeTogRmllbGRFbnRyeSA9IG51bGwpe1xuICAgIHNlc3Npb24uaW5jcmVtZW50ID0gaW5kZXggKyAxO1xuICAgIHNlc3Npb24uaWQgPSBlbnRyeSA/IGVudHJ5LmlkIDogbnVsbDtcbiAgICB0aGlzLl91cGRhdGVFbnRyeVR5cGVTZXNzaW9uKHNlc3Npb24udHlwZSwgZW50cnkpO1xuICAgIHRoaXMuX3VwZGF0ZUVudHJ5RGlzcGxheVNlc3Npb24oc2Vzc2lvbi5kaXNwbGF5LCBlbnRyeSk7XG4gICAgdGhpcy5kb20uc2Vzc2lvbi5jb250cm9scy5zZXQoaW5kZXgsIHNlc3Npb24pO1xuICAgIHRoaXMuc2V0RG9tU2Vzc2lvbihpbmRleCwgc2Vzc2lvbik7XG4gICAgcmV0dXJuIHNlc3Npb247XG4gIH1cblxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGVudHJ5IHR5cGUgY29uZmlnIHRvIHVzZSBjb3JyZWN0IHZhbHVlIGFuZCBwYXRoXG4gICAqIEBwYXJhbSBjb25maWdcbiAgICogQHBhcmFtIGVudHJ5XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF91cGRhdGVFbnRyeVR5cGVTZXNzaW9uKGNvbmZpZzogU2VsZWN0Q29uZmlnLCBlbnRyeTogRmllbGRFbnRyeSA9IG51bGwpe1xuICAgIGNvbmZpZy52YWx1ZSA9IGVudHJ5ID8gZW50cnkudHlwZSA6IHRoaXMuYXNzZXQudHlwZSBpbiB0aGlzLmFzc2V0LnR5cGVPcHRpb24gPyB0aGlzLmFzc2V0LnR5cGVPcHRpb25bIHRoaXMuYXNzZXQudHlwZSBdLmRlZmF1bHRWYWx1ZSA6ICduL2EnO1xuICAgIGNvbmZpZy5jb250cm9sLnNldFZhbHVlKGNvbmZpZy52YWx1ZSwgeyBlbWl0RXZlbnQ6IGZhbHNlIH0pO1xuICAgIGNvbmZpZy5wYXRjaC5wYXRoID0gZW50cnkgPyBgJHt0aGlzLmFzc2V0LmJhc2VQYXRofS8ke2VudHJ5LmlkfWAgOiBudWxsO1xuICB9XG5cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBlbnRyeSBkaXNwbGF5IGNvbmZpZyB0byB1c2UgY29ycmVjdCB2YWx1ZSBhbmQgcGF0aFxuICAgKiBAcGFyYW0gY29uZmlnXG4gICAqIEBwYXJhbSBlbnRyeVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfdXBkYXRlRW50cnlEaXNwbGF5U2Vzc2lvbihjb25maWc6IElucHV0Q29uZmlnLCBlbnRyeTogRmllbGRFbnRyeSA9IG51bGwpe1xuICAgIGNvbmZpZy52YWx1ZSA9IGVudHJ5ID8gZW50cnkubmFtZSA6ICcnO1xuICAgIGNvbmZpZy5jb250cm9sLnNldFZhbHVlKGNvbmZpZy52YWx1ZSwgeyBlbWl0RXZlbnQ6IGZhbHNlIH0pO1xuICAgIGNvbmZpZy5wYXRjaC5wYXRoID0gZW50cnkgPyBgJHt0aGlzLmFzc2V0LmJhc2VQYXRofS8ke2VudHJ5LmlkfWAgOiBudWxsO1xuICB9XG5cblxuICAvKipcbiAgICogU3RvcmUgZWFjaCBlbnRyeSBjb25maWcgaW4gYSBkb20gc2Vzc2lvbiBzbyB0aGF0IGl0IGNhbiBiZSByZXN0b3JlZCB3aGVuIHRoZSB1c2VycyBpcyBzd2l0Y2hpbmcgdGFic1xuICAgKiBAcGFyYW0gaW5kZXhcbiAgICogQHBhcmFtIHNlc3Npb25cbiAgICovXG4gIHByaXZhdGUgc2V0RG9tU2Vzc2lvbihpbmRleDogbnVtYmVyLCBzZXNzaW9uOiBGaWVsZEVudHJ5U2Vzc2lvbil7XG4gICAgY29uc3QgZG9tU3RvcmFnZSA9IDxhbnk+U3RvcmFnZUdldHRlcih0aGlzLmRvbS5yZXBvLCBbICdjb21wb25lbnRzJywgdGhpcy5uYW1lLCB0aGlzLmlkICsgJycsICdzZXNzaW9uJyBdKTtcbiAgICBpZiggSXNPYmplY3QoZG9tU3RvcmFnZSwgWyAnY29udHJvbHMnIF0pICl7XG4gICAgICBjb25zdCBjb250cm9scyA9IDxNYXA8bnVtYmVyLCBGaWVsZEVudHJ5U2Vzc2lvbj4+ZG9tU3RvcmFnZS5jb250cm9scztcbiAgICAgIGNvbnRyb2xzLnNldChpbmRleCwgc2Vzc2lvbik7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogU2V0IGVudHJ5IGNvbmZpZyBvYmplY3RzIHRoYXQgd2lsbCBiZSB1c2VkIGluIHRoZSBodG1sIHRlbXBsYXRlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9zZXRFbnRyaWVzKCk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KChyZXNvbHZlKSA9PiB7XG4gICAgICB0aGlzLnVpLmVudHJpZXMgPSBbXTtcbiAgICAgIGlmKCB0aGlzLmRvbS5zZXNzaW9uLmNvbnRyb2xzICl7XG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIHdoaWxlKCBpbmRleCA8IHRoaXMuYXNzZXQuZmllbGQubXVsdGlwbGVfbWluICl7XG4gICAgICAgICAgdGhpcy51aS5lbnRyaWVzLnB1c2godGhpcy5kb20uc2Vzc2lvbi5jb250cm9scy5nZXQoaW5kZXgpKTtcbiAgICAgICAgICBpbmRleCsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE1hbmFnZSB0aGUgdHlwZSBvZiBlYWNoIGVudHJ5XG4gICAqIEBwYXJhbSBpbmRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX2dldFR5cGVDb25maWcoKXtcbiAgICBsZXQgZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBsZXQgb3B0aW9ucyA9IHRoaXMuYXNzZXQudHlwZSBpbiB0aGlzLmFzc2V0LnR5cGVPcHRpb24gPyB0aGlzLmFzc2V0LnR5cGVPcHRpb25bIHRoaXMuYXNzZXQudHlwZSBdLm9wdGlvbnMgOiBbXTtcbiAgICBpZiggIUlzQXJyYXkob3B0aW9ucywgdHJ1ZSkgKXtcbiAgICAgIG9wdGlvbnMgPSBbIHsgdmFsdWU6ICduL2EnLCBuYW1lOiAnTi9BJyB9IF07XG4gICAgICBkaXNhYmxlZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU2VsZWN0Q29uZmlnKHtcbiAgICAgIGxhYmVsOiAnVHlwZScsXG4gICAgICBvcHRpb25zOiB7IHZhbHVlczogb3B0aW9ucyB9LFxuICAgICAgZGlzYWJsZWQ6IGRpc2FibGVkLFxuICAgICAgcGF0Y2g6IHtcbiAgICAgICAgZmllbGQ6ICd0eXBlJyxcbiAgICAgICAgcGF0aDogbnVsbCxcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE1hbmFnZSB0aGUgZGlzcGxheSBvZiBlYWNoIGVudHJ5XG4gICAqIEBwYXJhbSBpbmRleFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0RGlzcGxheUNvbmZpZygpe1xuICAgIHJldHVybiBuZXcgSW5wdXRDb25maWcoe1xuICAgICAgbGFiZWw6ICdEaXNwbGF5IE5hbWUnLFxuICAgICAgcGF0Y2g6IHtcbiAgICAgICAgZmllbGQ6ICduYW1lJyxcbiAgICAgICAgcGF0aDogbnVsbFxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cblxuICBwcml2YXRlIF90cmlnZ2VyRmllbGRQcmV2aWV3VXBkYXRlKCl7XG4gICAgdGhpcy5jb3JlLmNoYW5uZWwubmV4dCh7IHNvdXJjZTogdGhpcy5uYW1lLCB0YXJnZXQ6ICdQb3BFbnRpdHlGaWVsZFByZXZpZXdDb21wb25lbnQnLCB0eXBlOiAnY29tcG9uZW50JywgbmFtZTogJ3VwZGF0ZScgfSk7XG4gIH1cbn1cblxuXG4vLyBleHBvcnQgaW50ZXJmYWNlIEZpZWxkRW50cnlTZXNzaW9uIHtcbi8vICAgaWQ6IG51bWJlcjtcbi8vICAgdHlwZTogU2VsZWN0Q29uZmlnO1xuLy8gICBkaXNwbGF5OiBJbnB1dENvbmZpZztcbi8vICAgaW5jcmVtZW50OiBudW1iZXI7XG4vLyB9XG4iXX0=