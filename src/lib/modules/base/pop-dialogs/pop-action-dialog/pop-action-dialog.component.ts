import {
  Component,
  ComponentRef,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {slideInOut} from '../../../../pop-common-animations.model';
import {PopExtendDynamicComponent} from '../../../../pop-extend-dynamic.component';
import {PopDomService} from '../../../../services/pop-dom.service';
import {
  CoreConfig, Dictionary,
  DynamicComponentInterface, Entity, EntityActionDataInterface,
  EntityActionInterface,
  EntityExtendInterface,
  FieldInterface, FieldItemInterface,
  FieldItemPatchInterface, PopBaseEventInterface,
  PopLog,
  PopTemplate,
  ServiceInjector
} from '../../../../pop-common.model';
import {
  ConvertArrayToOptionList,
  DeepMerge, GetHttpErrorMsg,
  GetHttpResult,
  IsArray, IsCallableFunction,
  IsDefined,
  IsObject,
  IsString,
  JsonCopy, Sleep, SnakeToPascal, StorageGetter, TitleCase,
} from '../../../../pop-common-utility';
import {
  EvaluateWhenCondition,
  EvaluateWhenConditions,
  FieldItemModel,
  IsValidFieldPatchEvent,
  ParseLinkUrl,
  ParseModelValue
} from '../../../entity/pop-entity-utility';
import {Router} from '@angular/router';
import {PopEntityUtilFieldService} from '../../../entity/services/pop-entity-util-field.service';
import {CdkPortalOutlet, ComponentPortal, ComponentType} from '@angular/cdk/portal';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {PopRequestService} from '../../../../services/pop-request.service';
import {FormGroup} from '@angular/forms';
import {PopEntityEventService} from '../../../entity/services/pop-entity-event.service';
import {PopSelectComponent} from "../../pop-field-item/pop-select/pop-select.component";


@Component({
  selector: 'lib-pop-action-dialog',
  templateUrl: './pop-action-dialog.component.html',
  styleUrls: ['./pop-action-dialog.component.scss'],
  animations: [
    slideInOut
  ]
})
export class PopActionDialogComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
  @ViewChild('container', {read: ViewContainerRef, static: true}) private container;
  @ViewChild(CdkPortalOutlet, {static: true}) portal: CdkPortalOutlet;
  @Input() action: EntityActionInterface;
  @Input() actionName: string;
  @Input() extension: EntityExtendInterface;

  name = 'PopActionDialogComponent';

  protected srv = {
    dialog: <MatDialog>ServiceInjector.get(MatDialog),
    events: <PopEntityEventService>ServiceInjector.get(PopEntityEventService),
    field: <PopEntityUtilFieldService>ServiceInjector.get(PopEntityUtilFieldService),
    request: <PopRequestService>ServiceInjector.get(PopRequestService),
    router: <Router>ServiceInjector.get(Router),
  };

  protected asset = {
    componentType: <ComponentType<any>>undefined,
    entity: <Entity>{},
    facadeDuration: 250,
    fieldItems: <FieldItemInterface[]>[],
    fieldItemMap: undefined,
    submitText: 'Submit',
    visible: 0,
    http: <'PATCH' | 'POST' | 'DELETE' | 'GET'>'POST',
    postUrl: <string>null,
    goToUrl: <string>null,
  };

  public ui = {
    form: new FormGroup({}),
    submitText: 'Submit',
    header: 'New'
  };


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
    public dialog: MatDialogRef<PopActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EntityActionDataInterface,
  ) {
    super();

    this.dom.configure = (): Promise<boolean> => {
      return new Promise(async (resolve) => {

        await this._setInitialConfig();
        await this._setAction();
        await this._setFieldItems();
        await this._setAdditionalConfig();
        await this._buildFormGroup();

        return resolve(true);
      });
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise((resolve) => {
        this._renderFieldItems();
        this._renderComponent();

        const hasChild = this.asset.fieldItems.find((fieldItem: FieldItemInterface) => StorageGetter(fieldItem, ['model', 'options', 'child'], null));
        this._resetComponentListHidden();
        if (hasChild) {
          this._triggerParentChildUpdates(hasChild.model.name);
        } else {
          this._triggerFormValidation();
        }

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


  /**
   * Intercept the enter press to check if the form can be submitted
   * @param event
   */
  onEnterPress(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.dom.state.validated) {
      this.dom.setTimeout(`submit-form`, () => {
        return this.onFormSubmit();
      }, 250);
    }
  }


  /**
   * The user can click a cancel btn to close the action dialog
   */
  onFormCancel() {
    this.dom.state.loaded = false;
    this.dom.state.loading = true;
    this.dom.setTimeout(`close-modal`, () => {
      this.dialog.close(-1);
    }, 250);
  }


  /**
   * The user will press enter or click a submit btn to submit the form
   */
  onFormSubmit() {
    return new Promise<boolean>(async (resolve) => {
      if (this.dom.state.validated && !this.dom.state.pending) {
        this._onSubmissionStart();
        const params = this.ui.form.value; // get form value before disabling form

        // this.dom.asset.form_group.disable(); //bad idea disabled through css

        if (!this.action.facade) {
          const method = `do${TitleCase(this.asset.http)}`;
          const request = this.srv.request[method](this.asset.postUrl, params, 1, false);
          request.subscribe(async (result: any) => {
              result = GetHttpResult(result);
              const goToUrl = this.asset.goToUrl;
              this.asset.entity = result;
              await this._onSubmissionSuccess();
              this.dialog.close(this.asset.entity);
              if (IsString(goToUrl, true)) {
                const newGoToUrl = ParseLinkUrl(String(goToUrl).slice(), this.asset.entity);
                this.log.info(`onFormSubmit:goToUrl`, newGoToUrl);
                this.log.info(`onFormSubmit:entity`, this.asset.entity);
                this.srv.router.navigate([newGoToUrl]).catch((e) => {
                  console.log(e);
                });
              }
              return resolve(true);
            },
            err => {
              this._onSubmissionFail();
              this._setErrorMessage(GetHttpErrorMsg(err));
              return resolve(false);
            }
          );
        } else {
          await Sleep(this.asset.facadeDuration);
          await this._onSubmissionSuccess();
          let response = IsObject(params) ? params : {};
          if (this.action.responseType === 'boolean') {
            response = true;
          } else if (this.action.responseType === 'store') {
            response = IsObject(this.action.store) ? this.action.store : {};
          }
          this.dialog.close(response);

          return resolve(true);
        }
      }
    });
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
   *                                    ( Protected Method )                                      *
   *               These are protected instead of private so that they can be overridden          *
   *                                                                                              *
   ************************************************************************************************/


  /**
   * This fx will perform the intial config of this component
   * @private
   */
  protected _setInitialConfig(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (!this.dom.state.loaded) {
        this.template.attach('container'); // container references the @viewChild('container')

        if (IsObject(this.data.core, true)) this.core = this.data.core;
        if (IsObject(this.data.action, true)) this.action = this.data.action;
        if (IsString(this.data.actionName, true)) this.actionName = this.data.actionName;
        if (IsObject(this.data.extension, true)) this.extension = this.data.extension;
        if (!IsObject(this.extension, true)) this.extension = {};
        // actionFieldItems.sort( DynamicSort( 'sort' ) );

        if (!(IsString(this.ui.submitText, true))) this.ui.submitText = 'Submit';
        this.dom.state.validated = false;
        this.dom.state.template = 'collection';
        delete this.data;

        this.dom.handler.bubble = async (core: CoreConfig, event: PopBaseEventInterface) => {
          this.log.event(`bubble:handler`, event);
          if (this.action.responseType === 'store') this._handleStoreEvent(event);
          if (IsCallableFunction(this.action.onEvent)) await this.action.onEvent(core, <PopBaseEventInterface>{
            ...event, ...{
              entity: this.asset.entity,
              form: this.ui.form,
              metadata: {
                fieldItems: this.asset.fieldItems
              }
            }
          });
          // Todo:: Are we seeing this event here, on single input forms submit button is not be activated
          if (event.name === 'onKeyUp' || event.name === 'onInvalidChange') {
            this.dom.state.validated = false;
            this.dom.setTimeout(`trigger-validation`, () => {
              this._triggerFormValidation();
            }, 250);

          } else if (IsValidFieldPatchEvent(this.core, event)) {

            if (event.config.name in this.asset.entity) {
              const newValue = isNaN(event.config.control.value) ? event.config.control.value : +event.config.control.value;
              this.asset.entity[event.config.name] = newValue;
              if (this.asset.fieldItems.length > 1) {
                this._resetComponentListHidden();
                this.dom.setTimeout(`update-relations`, () => {
                  this._triggerParentChildUpdates(event.config.name);
                }, 0);
              } else {
                this._triggerFormValidation();
              }
            }
          }


          // if( event.config.bubble || [ 'patch' ].includes( event.name ) ){
          this.events.emit(event);
          // }
        };
      }
      return resolve(true);
    });
  }


  /**
   * This fx will perform additional config of this component that has initial config dependencies
   * @private
   */
  protected _setAdditionalConfig(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      let goToUrl = IsString(this.extension.goToUrl, true) ? this.extension.goToUrl : (this.action.goToUrl ? this.action.goToUrl : null);
      if (goToUrl) goToUrl = ParseModelValue(goToUrl, this.core, true);

      const storage = IsObject(this.core.entity, ['id', 'name']) && !this.action.blockEntity ? this.core.entity : (IsObject(this.asset.entity, true) ? this.asset.entity : {});
      let postUrl = IsString(this.extension.postUrl, true) ? this.extension.postUrl : (this.action.postUrl ? ParseLinkUrl(String(this.action.postUrl).slice(), storage) : this.core.params.path);
      if (postUrl) postUrl = ParseModelValue(postUrl, this.core, true);

      if (+this.action.facadeDuration) this.asset.facadeDuration = this.action.facadeDuration;
      if (+this.action.facadeDuration > 2000) {
        this.action.facadeDuration = 2000;
      }
      this.asset.goToUrl = goToUrl;
      this.asset.postUrl = postUrl;

      this.ui.submitText = IsString(this.action.submitText, true) ? this.action.submitText : 'Submit';
      this.asset.submitText = this.action.submitText;

      if (IsString(this.action.http)) this.asset.http = this.action.http;

      this.ui.header = IsString(this.action.header, true) ? this.action.header : `${TitleCase(this.action.name)} ${SnakeToPascal(this.core.repo.getDisplayName())}`;

      return resolve(true);
    });
  }


  /**
   * This fx will trigger the form validation
   * @private
   */
  protected _buildFormGroup() {
    return new Promise<boolean>((resolve) => {
      if (IsArray(this.asset.fieldItems, true)) {
        this.asset.fieldItems.map((field: FieldItemInterface) => {
          if (field.config && field.config.control) {
            this.ui.form.addControl(field.config.name, field.config.control);
            this.asset.visible++;
          }
        });
      }

      return resolve(true);
    });
  }


  /**
   * This fx will take any patch event that occurs and store the key value pair
   * @param event
   * @private
   */
  protected _handleStoreEvent(event: PopBaseEventInterface) {
    this.log.event(`_handleStoreEvent`, event);
    if (IsValidFieldPatchEvent(this.core, event)) {
      if (!(IsObject(this.action.store))) this.action.store = <Dictionary<any>>{};
      this.action.store[event.config.name] = event.config.control.value;
    }
    this.log.info(`_handleStoreEvent: store`, this.action.store);
  }


  /**
   * This fx will trigger the form validation
   * @private
   */
  protected _triggerFormValidation() {
    this.dom.setTimeout(`trigger-form-validation`, () => {
      this._validateForm().then((valid: boolean) => {
        this.dom.state.validated = valid;
      });
    }, 50);
  }


  /**
   * The form needs to able to make api calls to verify info for certain fields
   * ToDo:: Allow the config to be able to pass in api validation calls for certain fields
   * @private
   */
  protected _validateForm(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.dom.state.validated = false;
      this.dom.setTimeout(`trigger-form-validation`, null);
      this.dom.setTimeout(`validate-form`, () => {
        this.ui.form.updateValueAndValidity();
        setTimeout(() => {
          this.dom.state.validated = true; // mock stub for now
          return resolve(this.ui.form.valid);
        }, 0);
      }, 0);
    });
  }


  /**
   * This fx will handle the error messaging
   * @param message
   * @private
   */
  protected _setErrorMessage(message: string) {
    this.dom.error.message = message;
    // this.dom.setTimeout('message', () => {
    //   this.dom.error.message = '';
    //   this.dom.setTimeout('message', null, 0);
    // }, 3000);
  }


  /**
   * This hook is called when the form is submitting
   * @private
   */
  protected _onSubmissionStart() {
    this.dom.setTimeout('message', null, 0);
    this.dom.error.message = '';
    this.dom.state.pending = true;
    this.ui.submitText = '';
  }


  /**
   * This hook is called when the form submission has failed
   * @private
   */
  protected _onSubmissionFail() {
    // Re-Enable Form and show error
    this.dom.state.pending = false;
    this.dom.state.template = 'fail';
    this.ui.submitText = IsString(this.action.submitText, true) ? this.action.submitText : 'Submit';
  }


  /**
   * This hook is called when the form has submitted successfully
   * @private
   */
  protected _onSubmissionSuccess() {
    return new Promise<boolean>(async (resolve) => {
      this.dom.state.template = 'success';
      this.dom.state.pending = false;
      this.core.repo.clearAllCache(this.name);
      if (IsCallableFunction(this.action.callback)) {
        this.dom.setTimeout(`action-callback`, async () => {
          const actionEvent = <PopBaseEventInterface>{
            type: 'entity',
            source: this.name,
            name: this.action.name,
            entity: this.asset.entity,
            action: this.action,
            data: this.ui.form.value
          };
          await this.action.callback(this.core, actionEvent, this.dom);
        }, 0);
      }

      const crudEvent = <PopBaseEventInterface>{
        source: this.name,
        method: 'create',
        type: 'entity',
        name: this.core.params.name,
        internal_name: this.core.params.internal_name,
        data: this.asset.entity
      };

      this.srv.events.sendEvent(crudEvent);
      return resolve(true);
    });
  }


  /**
   * This fx will render all of the fields that were passed through in the action config
   * @private
   */
  protected _renderFieldItems() {
    const componentList = <DynamicComponentInterface[]>[];
    this.asset.fieldItems.map((fieldItem, index) => {
      if (fieldItem && IsObject(fieldItem.model, ['name']) && fieldItem.config && fieldItem.component) {
        const existingValue = 'control' in fieldItem.config ? fieldItem.config.control.value : null;

        this.asset.entity[fieldItem.model.name] = existingValue;
        if (this.action.bubbleAll) fieldItem.config.bubble = true;
        const component = <DynamicComponentInterface>{
          type: fieldItem.component,
          inputs: {
            config: fieldItem.config,
            position: fieldItem.config['metadata'].position ? fieldItem.config['metadata'].position : 1,
            hidden: IsArray(fieldItem.model.when, true) ? !(EvaluateWhenCondition(this.core, fieldItem.model.when, this.core)) : false,
            when: IsArray(fieldItem.model.when, true) ? fieldItem.model.when : null
          }
        };
        componentList.push(component);
      }
    });

    this.template.render(componentList, [], true);
  }


  /**
   * This fx will render the a component that was passed in through the action config
   * @private
   */
  protected _renderComponent() {
    if (IsObject(this.action.component, ['type']) && this.portal) {
      if (this.portal.attachedRef) this.portal.detach();
      this.dom.setSubscriber('portal-events', null);
      const componentRef = this.portal.attach(new ComponentPortal(this.action.component.type));
      componentRef.instance['core'] = this.core;
      if (IsObject(this.action.component, ['inputs'])) {
        Object.keys(this.action.component.inputs).map((key: string) => {
          componentRef.instance[key] = this.action.component.inputs[key];
        });
      }
      componentRef.changeDetectorRef.detectChanges();

      if (componentRef.instance['events']) {
        this.dom.setSubscriber('portal-events', componentRef.instance['events'].subscribe(async (event: PopBaseEventInterface) => {
          if (this.action.responseType === 'store') {
            this._handleStoreEvent(event);
          }
          if (IsCallableFunction(this.action.onEvent)) await this.action.onEvent(this.core, <PopBaseEventInterface>{
            ...event, ...{
              entity: this.asset.entity,
              form: this.ui.form,
              metadata: {
                fieldItems: this.asset.fieldItems
              }
            }
          });
        }));
      }
    }
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/


  /**
   * This fx will resolve the config of action that pop is suppose to perform
   * @private
   */
  private _setAction(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      if (IsObject(this.action, true)) {
        if (!(IsDefined(this.action.responseType))) this.action.responseType = 'form';
        this.dom.state.hasComponent = IsObject(this.action.component, ['type']);
        this.dom.state.hasFields = IsObject(this.action.fields, true);

        return resolve(true);
      } else if (IsString(this.actionName) && IsObject(this.core.repo.model.action, [this.actionName]) && IsObject(this.core.repo.model.action[this.actionName], true)) {
        this.action = this.core.repo.model.action[this.actionName];
        if (!(IsDefined(this.action.responseType))) this.action.responseType = 'form';
        this.dom.state.hasComponent = IsObject(this.action.component, ['type']);

        this.dom.state.hasFields = IsObject(this.action.fields, true);
        return resolve(true);
      } else {
        this.dom.state.hasComponent = false;
        this.dom.state.hasFields = false;

        return resolve(false);
      }
    });
  }


  /**
   * A helper method that sets build the field item definitions
   * @param entityConfig
   * @param goToUrl
   */
  private _setFieldItems(): Promise<boolean> {

    return new Promise<boolean>(async (resolve) => {
      if (IsObject(this.action, ['fields']) && IsObject(this.action.fields, true)) {

        const actionFieldItems = {};
        this.asset.fieldItems = [];
        this.asset.fieldItemMap = {};
        let needsResource = false;

        Object.keys(this.action.fields).map((name) => {
          let field = <FieldInterface>{};
          if (!this.action.blockEntity && name in this.core.repo.model.field) {
            field = <any>this.core.repo.model.field[name];
          }
          let model = <any>{};

          if (field.when) model.when = JsonCopy(field.when);

          if (IsObject(field.model, true)) {
            model = {...model, ...field.model};
          }
          let actionTransformation;
          if (IsObject(this.action.fields[name], true)) {
            actionTransformation = IsString(this.action.fields[name].transformation, true) ? this.action.fields[name].transformation : null;
            model = {...model, ...this.action.fields[name]};
          }
          // delete model.metadata;
          delete model.transformation;
          if (actionTransformation) model.transformation = actionTransformation; // only want to apply transformation if it was set directly on action

          model.value = IsDefined(model.value) ? ParseModelValue(model.value, this.core) : null;
          // model.value = IsDefined( model.value ) ? ParseModelValue(model.value, core) : null;
          if (!model.value && IsObject(model.options, ['defaultValue'])) {
            model.value = ParseModelValue(model.options.defaultValue, this.core);
          }
          model.hidden = !EvaluateWhenConditions(this.core, model.when, this.core);

          if (IsObject(this.extension, true) && model.name in this.extension) {
            model.value = ParseModelValue(this.extension[model.name]);
            model.readonly = true;
            this.asset.entity[model.name] = model.value;
          }

          model.tabOnEnter = true;
          actionFieldItems[name] = model;
          if (model.options && model.options.resource) {
            needsResource = true;
          }
        });


        // if needsMetadata go grab it before you try to build out the fields
        if (needsResource) {
          const resource = await this.core.repo.getUiResource(this.core);
          if (IsObject(resource, true)) DeepMerge(this.core.resource, resource);
          PopLog.init(this.name, `doAction:needed resource`, resource);
          Object.keys(actionFieldItems).map((name) => {
            const fieldItem = actionFieldItems[name];
            const actionItemModel = FieldItemModel(this.core, JsonCopy(fieldItem), false);
            const actionItem = this.srv.field.buildCoreFieldItem(this.core, actionItemModel);
            if (IsObject(actionItem.config, true)) {
              actionItem.config.facade = true;
              if (IsObject(actionItem.config.patch)) {
                const patch = <FieldItemPatchInterface>actionItem.config.patch;
                patch.duration = 0;
                patch.path = null;
                patch.displayIndicator = false;
              }
            }
            this.asset.fieldItemMap[name] = this.asset.fieldItems.length;
            this.asset.fieldItems.push(actionItem);
          });

        } else {
          // no metadata was needed for any of these fields
          Object.keys(actionFieldItems).map((name) => {
            const actionItemModel = FieldItemModel(this.core, actionFieldItems[name], false);
            const actionItem = this.srv.field.buildCoreFieldItem(this.core, actionItemModel);
            if (IsObject(actionItem.config, true)) {
              actionItem.config.facade = true;
              if (IsObject(actionItem.config.patch)) {
                const patch = <FieldItemPatchInterface>actionItem.config.patch;
                patch.duration = 0;
                patch.path = null;
                patch.displayIndicator = false;
              }
            }
            this.asset.fieldItemMap[name] = this.asset.fieldItems.length;
            this.asset.fieldItems.push(actionItem);
          });
          PopTemplate.clear();
        }
        // console.log('this.asset.fieldItems', this.asset.fieldItems);
        this.asset.fieldItems.map((fieldItem) => {
          if (IsArray(StorageGetter(fieldItem, ['config', 'options', 'values']), true)) {
            // console.log('here', fieldItem);
            (<any>fieldItem).config.height = 180;
          }

        });
        return resolve(true);

      } else {

        return resolve(false);
      }
    });
  }


  /**
   * Determine if field should be auto filled with the first item in the list
   * @param name
   */
  private _fieldHasAutoFill(name: string) {
    if (name in this.asset.fieldItemMap && this.asset.fieldItems[this.asset.fieldItemMap[name]].model && this.asset.fieldItems[this.asset.fieldItemMap[name]].model.options) {
      if (this.asset.fieldItems[this.asset.fieldItemMap[name]].model.autoFill) {
        return true;
      }
    }

    return false;
  }


  /**
   * Determine if field has a child relation in the list
   * @param name
   */
  private _fieldHasChild(name: string) {
    if (name in this.asset.fieldItemMap && this.asset.fieldItems[this.asset.fieldItemMap[name]].model && this.asset.fieldItems[this.asset.fieldItemMap[name]].model.options) {
      if (this.asset.fieldItems[this.asset.fieldItemMap[name]].model.options.child) {
        return true;
      }
    }

    return false;
  }


  /**
   * Get a linear list of the parent child relations from a given point
   * @param self the name to start from (usually the field that has just been changed by user)
   * @param list
   */
  private _getRelationList(name: string, list: any[] = []) { // recursive loop
    let item;
    if (name && name in this.asset.fieldItemMap) {
      item = this.asset.fieldItems[this.asset.fieldItemMap[name]];
      if (IsObject(item, ['config', 'model'])) {
        list.push({
          name: item.config.name,
          autoFill: this._fieldHasAutoFill(name),
        });
        if (this._fieldHasChild(name)) {
          this._getRelationList(this.asset.fieldItems[this.asset.fieldItemMap[name]].model.options.child, list);
        }
      }

    }
    return list;
  }


  /**
   * Whenever a update to the entity happens the fields in the group should be re-evaluated if there are when conditionals set
   * @private
   */
  private _resetComponentListHidden() {
    let name;
    this.template.refs.filter((componentRef: ComponentRef<any>) => {
      return IsObject(componentRef.instance.config, true) && IsArray(componentRef.instance.when, true);
    }).map((componentRef: ComponentRef<any>) => {
      name = componentRef.instance.config.name;
      if (name && name in this.asset.fieldItemMap) {
        componentRef.instance.hidden = !EvaluateWhenCondition(this.asset, componentRef.instance.when);
      }
    });
  }


  /**
   * This fx will manage if the form fields have parent child relations, ie if an account select needs to be filtered by a client select that exists in the form
   * @param name
   * @private
   */
  private _triggerParentChildUpdates(name: string) {
    if (this._fieldHasChild(name)) {
      let values;
      let child_fk;
      let childField;
      let autoFill = false;
      let set;
      let resource;
      const relations = this._getRelationList(name);
      relations.some((relation) => {
        if (relation.autoFill) {
          autoFill = true;
          return true;
        }
      });


      if (name && name in this.asset.fieldItemMap) {
        child_fk = this.asset.fieldItems[this.asset.fieldItemMap[name]].model.options.child;
        if (child_fk && child_fk in this.asset.fieldItemMap) {
          childField = this.asset.fieldItems[this.asset.fieldItemMap[child_fk]];
          if (childField.model.form === 'select') {
            if (childField.model.options.resource) {
              if (IsObject(this.core.resource[childField.model.options.resource], ['data_values'])) {
                resource = this.core.resource[childField.model.options.resource].data_values;
              }
            }
            if (IsArray(resource, true)) {
              values = ConvertArrayToOptionList(resource, {
                // ensure that an option shows up in list in case other conditions remove it, aka it has been archived
                prevent: [], // a list of ids that should not appear in the list for whatever reason
                // parent means this options should all have a common field trait like client_fk, account_fk ....
                parent: childField.model.options.parent ? {
                  field: childField.model.options.parent,
                  value: this.asset.entity[childField.model.options.parent]
                } : null,
                empty: childField.model.options.empty ? childField.model.options.empty : null,
              });
            } else {
              values = [];
            }

            if (autoFill && values.length) {
              set = values[values.length - 1].value;
            } else {
              set = null;
            }
            childField.config.options.values = values;
            autoFill = autoFill && values.length ? values[0].value : null;
            if (typeof childField.config.triggerOnChange === 'function') childField.config.triggerOnChange(set);

            this.dom.setTimeout(`clear-message-${child_fk}`, () => {
              if (typeof childField.config.clearMessage === 'function') {
                childField.config.clearMessage();
              }
            }, 0);

          }
        }
      }
    }
    this._triggerFormValidation();
  }

}
