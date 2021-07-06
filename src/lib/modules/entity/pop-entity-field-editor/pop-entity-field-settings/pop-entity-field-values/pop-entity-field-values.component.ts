import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../../../pop-extend.component';
import { PopDomService } from '../../../../../services/pop-dom.service';
import { SelectConfig } from '../../../../base/pop-field-item/pop-select/select-config.model';
import { InputConfig } from '../../../../base/pop-field-item/pop-input/input-config.model';
import { GetHttpErrorMsg, IsArray, IsObject, IsObjectThrowError, StorageGetter } from '../../../../../pop-common-utility';
import { CoreConfig, Dictionary, FieldEntry, FieldInterface, FieldItemOption, PopBaseEventInterface, PopLog, ServiceInjector } from '../../../../../pop-common.model';
import { IsValidFieldPatchEvent } from '../../../pop-entity-utility';
import { PopRequestService } from '../../../../../services/pop-request.service';
import { forkJoin, Observable } from 'rxjs';
import { PopFieldEditorService } from '../../pop-entity-field-editor.service';
import {FieldEntrySession} from "../pop-entity-field-entries/pop-entity-field-entries.component";


@Component({
  selector: 'lib-pop-entity-field-values',
  templateUrl: './pop-entity-field-values.component.html',
  styleUrls: [ './pop-entity-field-values.component.scss' ]
})
export class PopEntityFieldValuesComponent extends PopExtendComponent implements OnInit, OnDestroy {

  public name = 'PopEntityFieldValuesComponent';

  protected srv: {
    field: PopFieldEditorService,
    request: PopRequestService
  } = {
    field: <PopFieldEditorService>undefined,
    request: ServiceInjector.get(PopRequestService),
  };

  protected asset = {
    basePath: <string>undefined,
    field: <FieldInterface>undefined,
    type: <string>undefined,
    typeOption: <Dictionary<{ defaultValue: string | number, options: FieldItemOption[] }>>undefined,
  };


  /**
   * Nest all service related classes under srv
   */
  protected transformSrvContainer(){
    this.srv.field = this.fieldRepo;
    this.dom.repo = this.domRepo;
    delete this.fieldRepo;
    delete this.domRepo;
  }


  constructor(
    public el: ElementRef,
    private domRepo: PopDomService,
    private fieldRepo: PopFieldEditorService
  ){
    super();

    this.transformSrvContainer();
    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {

        this.dom.handler.core = (core: CoreConfig, event:PopBaseEventInterface) => this._coreEventHandler(event);

        this.asset.field = IsObjectThrowError(this.core, true, `Invalid Core`) && IsObjectThrowError(this.core.entity, [ 'id', 'fieldgroup' ], `Invalid Field`) ? <FieldInterface>this.core.entity : null;
        this.asset.type = this.asset.field.fieldgroup.name; // the field group name , ie.. address, phone
        this.asset.typeOption = this.srv.field.getDefaultLabelTypeOptions(); // the select options that belong to the types

        this.asset.basePath = `fields/${this.asset.field.id}/entries`; // api endpoint to hit for field entries

        this.ui.asset = <{ entries: { type: SelectConfig, display: InputConfig, increment: number }[], map: Dictionary<any> }>{
          entries: [], // list of configs for each entry record
        };
        this.dom.session.controls = new Map(); // store the entry configs so that changes are not lost when the tabs are changed

        return resolve(true);
      });
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise((resolve) => {
        this.dom.setTimeout('show-entries', () => {
          this._showEntries();
        }, 0);

        return resolve(true);
      });
    };
  }


  /**
   * This component should have a specific purpose
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * When the type of an entry is changed in the database, make sure the changes is updated locally
   * @param index
   * @param event
   */
  onEntryTypeChange(index: number, event: PopBaseEventInterface){
    if( IsValidFieldPatchEvent(this.core, event) ){
      const config = this.ui.entries[ index ];
      const entry = this.asset.field.entries[ index ];
      const session = this.dom.session.controls.get(index);
      if( entry && session ){
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
  onEntryDisplayChange(index: number, event: PopBaseEventInterface){
    if( IsValidFieldPatchEvent(this.core, event) ){
      const config = this.ui.entries[ index ];
      const entry = this.asset.field.entries[ index ];
      const session = this.dom.session.controls.get(index);
      if( entry && session ){
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
  ngOnDestroy(){
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
  private _coreEventHandler(event: PopBaseEventInterface){
    this.log.info(`_coreEventHandler`, event);
    if( IsValidFieldPatchEvent(this.core, event) ){
      if( event.source === 'PopMinMaxComponent' ){
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
  private _showEntries(){
    this.dom.state.pending = true;
    this._setValueEntries().then((entries: FieldEntry[]) => {
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
  private _setValueEntries(): Promise<FieldEntry[]>{
    return new Promise<FieldEntry[]>((resolve) => {
      const storedEntries = JSON.parse(JSON.stringify(this.asset.field.entries));
      const excess = storedEntries.splice(this.asset.field.multiple_min);
      let index = 0;

      const needed = [];
      while( index < this.asset.field.multiple_min ){
        const existing = index in storedEntries ? storedEntries[ index ] : null;
        if( !existing ) needed.push(index);
        index++;
      }
      const requests = []; // contains all the create/remove api/requests
      // delete any excess entries from database
      excess.map((entry) => {
        requests.push(this.srv.request.doDelete(`${this.asset.basePath}/${entry.id}`));
      });
      // create any needed entries in database
      needed.map((sessionIndex: number) => {
        const session = this.dom.session.controls.get(sessionIndex);
        requests.push(this.srv.request.doPost(`${this.asset.basePath}`, {
          name: session ? session.display.value : null,
          type: session ? session.type.value : this.asset.type in this.asset.typeOption ? this.asset.typeOption[ this.asset.type ].defaultValue : 'n/a'
        }, 1, false));
      });

      if( requests.length ){ // need to update the data base to match min/max settings
        this._makeApiRequests(requests).then((serverEntries: FieldEntry[]) => {

          return resolve(serverEntries);
        });
      }else{ // stored entries already match min/max settings
        return resolve(storedEntries);
      }
    });
  }


  /**
   * Will make all of the needed api requests
   * @param requests
   * @private
   */
  private _makeApiRequests(requests: Observable<any>[]): Promise<FieldEntry[]>{
    return new Promise<FieldEntry[]>((resolve) => {
      forkJoin(requests).subscribe(() => {
        this.srv.request.doGet(this.asset.basePath).subscribe((res) => {
          res = res.data ? res.data : res;
          this.asset.field.entries = IsArray(res, true) ? <FieldEntry[]>res : [];
          this.core.entity.entries = JSON.parse(JSON.stringify(this.asset.field.entries))
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
  private _setEntrySessionControls(entries: FieldEntry[]): Promise<boolean>{
    return new Promise((resolve) => {
      let index = 0;
      while( index < this.asset.field.multiple_min ){
        const entry = index in entries ? entries[ index ] : null;
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
  private _updateSessionControl(index: number, session: FieldEntrySession, entry: FieldEntry = null){
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
  private _updateEntryTypeSession(config: SelectConfig, entry: FieldEntry = null){
    config.value = entry ? entry.type : this.asset.type in this.asset.typeOption ? this.asset.typeOption[ this.asset.type ].defaultValue : 'n/a';
    config.control.setValue(config.value, { emitEvent: false });
    config.patch.path = entry ? `${this.asset.basePath}/${entry.id}` : null;
  }


  /**
   * Update the entry display config to use correct value and path
   * @param config
   * @param entry
   * @private
   */
  private _updateEntryDisplaySession(config: InputConfig, entry: FieldEntry = null){
    config.value = entry ? entry.name : '';
    config.control.setValue(config.value, { emitEvent: false });
    config.patch.path = entry ? `${this.asset.basePath}/${entry.id}` : null;
  }


  /**
   * Store each entry config in a dom session so that it can be restored when the users is switching tabs
   * @param index
   * @param session
   */
  private setDomSession(index: number, session: FieldEntrySession){
    const domStorage = <any>StorageGetter(this.dom.repo, [ 'components', this.name, this.id + '', 'session' ]);
    if( IsObject(domStorage, [ 'controls' ]) ){
      const controls = <Map<number, FieldEntrySession>>domStorage.controls;
      controls.set(index, session);
    }
  }


  /**
   * Set entry config objects that will be used in the html template
   * @private
   */
  private _setEntries(): Promise<boolean>{
    return new Promise<boolean>((resolve) => {
      this.ui.entries = [];
      if( this.dom.session.controls ){
        let index = 0;
        while( index < this.asset.field.multiple_min ){
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
  private _getTypeConfig(){
    let disabled = false;
    let options = this.asset.type in this.asset.typeOption ? this.asset.typeOption[ this.asset.type ].options : [];
    if( !IsArray(options, true) ){
      options = [ { value: 'n/a', name: 'N/A' } ];
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
  private _getDisplayConfig(){
    return new InputConfig({
      label: 'Display Name',
      patch: {
        field: 'name',
        path: null
      }
    });
  }


  private _triggerFieldPreviewUpdate(){
    this.core.channel.next({ source: this.name, target: 'PopEntityFieldPreviewComponent', type: 'component', name: 'update' });
  }
}


// export interface FieldEntrySession {
//   id: number;
//   type: SelectConfig;
//   display: InputConfig;
//   increment: number;
// }
