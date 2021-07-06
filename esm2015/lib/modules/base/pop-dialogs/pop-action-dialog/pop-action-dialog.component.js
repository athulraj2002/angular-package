import { __awaiter } from "tslib";
import { Component, ElementRef, Inject, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { slideInOut } from '../../../../pop-common-animations.model';
import { PopExtendDynamicComponent } from '../../../../pop-extend-dynamic.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopLog, PopTemplate, ServiceInjector } from '../../../../pop-common.model';
import { ConvertArrayToOptionList, DeepMerge, GetHttpErrorMsg, GetHttpResult, IsArray, IsCallableFunction, IsDefined, IsObject, IsString, JsonCopy, Sleep, SnakeToPascal, StorageGetter, TitleCase, } from '../../../../pop-common-utility';
import { EvaluateWhenCondition, EvaluateWhenConditions, FieldItemModel, IsValidFieldPatchEvent, ParseLinkUrl, ParseModelValue } from '../../../entity/pop-entity-utility';
import { Router } from '@angular/router';
import { PopEntityUtilFieldService } from '../../../entity/services/pop-entity-util-field.service';
import { CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PopRequestService } from '../../../../services/pop-request.service';
import { FormGroup } from '@angular/forms';
import { PopEntityEventService } from '../../../entity/services/pop-entity-event.service';
export class PopActionDialogComponent extends PopExtendDynamicComponent {
    constructor(el, _domRepo, dialog, data) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this.dialog = dialog;
        this.data = data;
        this.name = 'PopActionDialogComponent';
        this.srv = {
            dialog: ServiceInjector.get(MatDialog),
            events: ServiceInjector.get(PopEntityEventService),
            field: ServiceInjector.get(PopEntityUtilFieldService),
            request: ServiceInjector.get(PopRequestService),
            router: ServiceInjector.get(Router),
        };
        this.asset = {
            componentType: undefined,
            entity: {},
            facadeDuration: 250,
            fieldItems: [],
            fieldItemMap: undefined,
            submitText: 'Submit',
            visible: 0,
            http: 'POST',
            postUrl: null,
            goToUrl: null,
        };
        this.ui = {
            form: new FormGroup({}),
            submitText: 'Submit',
            header: 'New'
        };
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                yield this._setInitialConfig();
                yield this._setAction();
                yield this._setFieldItems();
                yield this._setAdditionalConfig();
                yield this._buildFormGroup();
                return resolve(true);
            }));
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => {
                this._renderFieldItems();
                this._renderComponent();
                const hasChild = this.asset.fieldItems.find((fieldItem) => StorageGetter(fieldItem, ['model', 'options', 'child'], null));
                this._resetComponentListHidden();
                if (hasChild) {
                    this._triggerParentChildUpdates(hasChild.model.name);
                }
                else {
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
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (this.dom.state.validated && !this.dom.state.pending) {
                this._onSubmissionStart();
                const params = this.ui.form.value; // get form value before disabling form
                // this.dom.asset.form_group.disable(); //bad idea disabled through css
                if (!this.action.facade) {
                    const method = `do${TitleCase(this.asset.http)}`;
                    const request = this.srv.request[method](this.asset.postUrl, params, 1, false);
                    request.subscribe((result) => __awaiter(this, void 0, void 0, function* () {
                        result = GetHttpResult(result);
                        const goToUrl = this.asset.goToUrl;
                        this.asset.entity = result;
                        yield this._onSubmissionSuccess();
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
                    }), err => {
                        this._onSubmissionFail();
                        this._setErrorMessage(GetHttpErrorMsg(err));
                        return resolve(false);
                    });
                }
                else {
                    yield Sleep(this.asset.facadeDuration);
                    yield this._onSubmissionSuccess();
                    let response = IsObject(params) ? params : {};
                    if (this.action.responseType === 'boolean') {
                        response = true;
                    }
                    else if (this.action.responseType === 'store') {
                        response = IsObject(this.action.store) ? this.action.store : {};
                    }
                    this.dialog.close(response);
                    return resolve(true);
                }
            }
        }));
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
    _setInitialConfig() {
        return new Promise((resolve) => {
            if (!this.dom.state.loaded) {
                this.template.attach('container'); // container references the @viewChild('container')
                if (IsObject(this.data.core, true))
                    this.core = this.data.core;
                if (IsObject(this.data.action, true))
                    this.action = this.data.action;
                if (IsString(this.data.actionName, true))
                    this.actionName = this.data.actionName;
                if (IsObject(this.data.extension, true))
                    this.extension = this.data.extension;
                if (!IsObject(this.extension, true))
                    this.extension = {};
                // actionFieldItems.sort( DynamicSort( 'sort' ) );
                if (!(IsString(this.ui.submitText, true)))
                    this.ui.submitText = 'Submit';
                this.dom.state.validated = false;
                this.dom.state.template = 'collection';
                delete this.data;
                this.dom.handler.bubble = (core, event) => __awaiter(this, void 0, void 0, function* () {
                    this.log.event(`bubble:handler`, event);
                    if (this.action.responseType === 'store')
                        this._handleStoreEvent(event);
                    if (IsCallableFunction(this.action.onEvent))
                        yield this.action.onEvent(core, Object.assign(Object.assign({}, event), {
                            entity: this.asset.entity,
                            form: this.ui.form,
                            metadata: {
                                fieldItems: this.asset.fieldItems
                            }
                        }));
                    // Todo:: Are we seeing this event here, on single input forms submit button is not be activated
                    if (event.name === 'onKeyUp' || event.name === 'onInvalidChange') {
                        this.dom.state.validated = false;
                        this.dom.setTimeout(`trigger-validation`, () => {
                            this._triggerFormValidation();
                        }, 250);
                    }
                    else if (IsValidFieldPatchEvent(this.core, event)) {
                        if (event.config.name in this.asset.entity) {
                            const newValue = isNaN(event.config.control.value) ? event.config.control.value : +event.config.control.value;
                            this.asset.entity[event.config.name] = newValue;
                            if (this.asset.fieldItems.length > 1) {
                                this._resetComponentListHidden();
                                this.dom.setTimeout(`update-relations`, () => {
                                    this._triggerParentChildUpdates(event.config.name);
                                }, 0);
                            }
                            else {
                                this._triggerFormValidation();
                            }
                        }
                    }
                    // if( event.config.bubble || [ 'patch' ].includes( event.name ) ){
                    this.events.emit(event);
                    // }
                });
            }
            return resolve(true);
        });
    }
    /**
     * This fx will perform additional config of this component that has initial config dependencies
     * @private
     */
    _setAdditionalConfig() {
        return new Promise((resolve) => {
            let goToUrl = IsString(this.extension.goToUrl, true) ? this.extension.goToUrl : (this.action.goToUrl ? this.action.goToUrl : null);
            if (goToUrl)
                goToUrl = ParseModelValue(goToUrl, this.core, true);
            const storage = IsObject(this.core.entity, ['id', 'name']) && !this.action.blockEntity ? this.core.entity : (IsObject(this.asset.entity, true) ? this.asset.entity : {});
            let postUrl = IsString(this.extension.postUrl, true) ? this.extension.postUrl : (this.action.postUrl ? ParseLinkUrl(String(this.action.postUrl).slice(), storage) : this.core.params.path);
            if (postUrl)
                postUrl = ParseModelValue(postUrl, this.core, true);
            if (+this.action.facadeDuration)
                this.asset.facadeDuration = this.action.facadeDuration;
            if (+this.action.facadeDuration > 2000) {
                this.action.facadeDuration = 2000;
            }
            this.asset.goToUrl = goToUrl;
            this.asset.postUrl = postUrl;
            this.ui.submitText = IsString(this.action.submitText, true) ? this.action.submitText : 'Submit';
            this.asset.submitText = this.action.submitText;
            if (IsString(this.action.http))
                this.asset.http = this.action.http;
            this.ui.header = IsString(this.action.header, true) ? this.action.header : `${TitleCase(this.action.name)} ${SnakeToPascal(this.core.repo.getDisplayName())}`;
            return resolve(true);
        });
    }
    /**
     * This fx will trigger the form validation
     * @private
     */
    _buildFormGroup() {
        return new Promise((resolve) => {
            if (IsArray(this.asset.fieldItems, true)) {
                this.asset.fieldItems.map((field) => {
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
    _handleStoreEvent(event) {
        this.log.event(`_handleStoreEvent`, event);
        if (IsValidFieldPatchEvent(this.core, event)) {
            if (!(IsObject(this.action.store)))
                this.action.store = {};
            this.action.store[event.config.name] = event.config.control.value;
        }
        this.log.info(`_handleStoreEvent: store`, this.action.store);
    }
    /**
     * This fx will trigger the form validation
     * @private
     */
    _triggerFormValidation() {
        this.dom.setTimeout(`trigger-form-validation`, () => {
            this._validateForm().then((valid) => {
                this.dom.state.validated = valid;
            });
        }, 50);
    }
    /**
     * The form needs to able to make api calls to verify info for certain fields
     * ToDo:: Allow the config to be able to pass in api validation calls for certain fields
     * @private
     */
    _validateForm() {
        return new Promise((resolve) => {
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
    _setErrorMessage(message) {
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
    _onSubmissionStart() {
        this.dom.setTimeout('message', null, 0);
        this.dom.error.message = '';
        this.dom.state.pending = true;
        this.ui.submitText = '';
    }
    /**
     * This hook is called when the form submission has failed
     * @private
     */
    _onSubmissionFail() {
        // Re-Enable Form and show error
        this.dom.state.pending = false;
        this.dom.state.template = 'fail';
        this.ui.submitText = IsString(this.action.submitText, true) ? this.action.submitText : 'Submit';
    }
    /**
     * This hook is called when the form has submitted successfully
     * @private
     */
    _onSubmissionSuccess() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.dom.state.template = 'success';
            this.dom.state.pending = false;
            this.core.repo.clearAllCache(this.name);
            if (IsCallableFunction(this.action.callback)) {
                this.dom.setTimeout(`action-callback`, () => __awaiter(this, void 0, void 0, function* () {
                    const actionEvent = {
                        type: 'entity',
                        source: this.name,
                        name: this.action.name,
                        entity: this.asset.entity,
                        action: this.action,
                        data: this.ui.form.value
                    };
                    yield this.action.callback(this.core, actionEvent, this.dom);
                }), 0);
            }
            const crudEvent = {
                source: this.name,
                method: 'create',
                type: 'entity',
                name: this.core.params.name,
                internal_name: this.core.params.internal_name,
                data: this.asset.entity
            };
            this.srv.events.sendEvent(crudEvent);
            return resolve(true);
        }));
    }
    /**
     * This fx will render all of the fields that were passed through in the action config
     * @private
     */
    _renderFieldItems() {
        const componentList = [];
        this.asset.fieldItems.map((fieldItem, index) => {
            if (fieldItem && IsObject(fieldItem.model, ['name']) && fieldItem.config && fieldItem.component) {
                const existingValue = 'control' in fieldItem.config ? fieldItem.config.control.value : null;
                this.asset.entity[fieldItem.model.name] = existingValue;
                if (this.action.bubbleAll)
                    fieldItem.config.bubble = true;
                const component = {
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
    _renderComponent() {
        if (IsObject(this.action.component, ['type']) && this.portal) {
            if (this.portal.attachedRef)
                this.portal.detach();
            this.dom.setSubscriber('portal-events', null);
            const componentRef = this.portal.attach(new ComponentPortal(this.action.component.type));
            componentRef.instance['core'] = this.core;
            if (IsObject(this.action.component, ['inputs'])) {
                Object.keys(this.action.component.inputs).map((key) => {
                    componentRef.instance[key] = this.action.component.inputs[key];
                });
            }
            componentRef.changeDetectorRef.detectChanges();
            if (componentRef.instance['events']) {
                this.dom.setSubscriber('portal-events', componentRef.instance['events'].subscribe((event) => __awaiter(this, void 0, void 0, function* () {
                    if (this.action.responseType === 'store') {
                        this._handleStoreEvent(event);
                    }
                    if (IsCallableFunction(this.action.onEvent))
                        yield this.action.onEvent(this.core, Object.assign(Object.assign({}, event), {
                            entity: this.asset.entity,
                            form: this.ui.form,
                            metadata: {
                                fieldItems: this.asset.fieldItems
                            }
                        }));
                })));
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
    _setAction() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (IsObject(this.action, true)) {
                if (!(IsDefined(this.action.responseType)))
                    this.action.responseType = 'form';
                this.dom.state.hasComponent = IsObject(this.action.component, ['type']);
                this.dom.state.hasFields = IsObject(this.action.fields, true);
                return resolve(true);
            }
            else if (IsString(this.actionName) && IsObject(this.core.repo.model.action, [this.actionName]) && IsObject(this.core.repo.model.action[this.actionName], true)) {
                this.action = this.core.repo.model.action[this.actionName];
                if (!(IsDefined(this.action.responseType)))
                    this.action.responseType = 'form';
                this.dom.state.hasComponent = IsObject(this.action.component, ['type']);
                this.dom.state.hasFields = IsObject(this.action.fields, true);
                return resolve(true);
            }
            else {
                this.dom.state.hasComponent = false;
                this.dom.state.hasFields = false;
                return resolve(false);
            }
        }));
    }
    /**
     * A helper method that sets build the field item definitions
     * @param entityConfig
     * @param goToUrl
     */
    _setFieldItems() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (IsObject(this.action, ['fields']) && IsObject(this.action.fields, true)) {
                const actionFieldItems = {};
                this.asset.fieldItems = [];
                this.asset.fieldItemMap = {};
                let needsResource = false;
                Object.keys(this.action.fields).map((name) => {
                    let field = {};
                    if (!this.action.blockEntity && name in this.core.repo.model.field) {
                        field = this.core.repo.model.field[name];
                    }
                    let model = {};
                    if (field.when)
                        model.when = JsonCopy(field.when);
                    if (IsObject(field.model, true)) {
                        model = Object.assign(Object.assign({}, model), field.model);
                    }
                    let actionTransformation;
                    if (IsObject(this.action.fields[name], true)) {
                        actionTransformation = IsString(this.action.fields[name].transformation, true) ? this.action.fields[name].transformation : null;
                        model = Object.assign(Object.assign({}, model), this.action.fields[name]);
                    }
                    // delete model.metadata;
                    delete model.transformation;
                    if (actionTransformation)
                        model.transformation = actionTransformation; // only want to apply transformation if it was set directly on action
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
                    const resource = yield this.core.repo.getUiResource(this.core);
                    if (IsObject(resource, true))
                        DeepMerge(this.core.resource, resource);
                    PopLog.init(this.name, `doAction:needed resource`, resource);
                    Object.keys(actionFieldItems).map((name) => {
                        const fieldItem = actionFieldItems[name];
                        const actionItemModel = FieldItemModel(this.core, JsonCopy(fieldItem), false);
                        const actionItem = this.srv.field.buildCoreFieldItem(this.core, actionItemModel);
                        if (IsObject(actionItem.config, true)) {
                            actionItem.config.facade = true;
                            if (IsObject(actionItem.config.patch)) {
                                const patch = actionItem.config.patch;
                                patch.duration = 0;
                                patch.path = null;
                                patch.displayIndicator = false;
                            }
                        }
                        this.asset.fieldItemMap[name] = this.asset.fieldItems.length;
                        this.asset.fieldItems.push(actionItem);
                    });
                }
                else {
                    // no metadata was needed for any of these fields
                    Object.keys(actionFieldItems).map((name) => {
                        const actionItemModel = FieldItemModel(this.core, actionFieldItems[name], false);
                        const actionItem = this.srv.field.buildCoreFieldItem(this.core, actionItemModel);
                        if (IsObject(actionItem.config, true)) {
                            actionItem.config.facade = true;
                            if (IsObject(actionItem.config.patch)) {
                                const patch = actionItem.config.patch;
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
                        fieldItem.config.height = 180;
                    }
                });
                return resolve(true);
            }
            else {
                return resolve(false);
            }
        }));
    }
    /**
     * Determine if field should be auto filled with the first item in the list
     * @param name
     */
    _fieldHasAutoFill(name) {
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
    _fieldHasChild(name) {
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
    _getRelationList(name, list = []) {
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
    _resetComponentListHidden() {
        let name;
        this.template.refs.filter((componentRef) => {
            return IsObject(componentRef.instance.config, true) && IsArray(componentRef.instance.when, true);
        }).map((componentRef) => {
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
    _triggerParentChildUpdates(name) {
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
                                prevent: [],
                                // parent means this options should all have a common field trait like client_fk, account_fk ....
                                parent: childField.model.options.parent ? {
                                    field: childField.model.options.parent,
                                    value: this.asset.entity[childField.model.options.parent]
                                } : null,
                                empty: childField.model.options.empty ? childField.model.options.empty : null,
                            });
                        }
                        else {
                            values = [];
                        }
                        if (autoFill && values.length) {
                            set = values[values.length - 1].value;
                        }
                        else {
                            set = null;
                        }
                        childField.config.options.values = values;
                        autoFill = autoFill && values.length ? values[0].value : null;
                        if (typeof childField.config.triggerOnChange === 'function')
                            childField.config.triggerOnChange(set);
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
PopActionDialogComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-action-dialog',
                template: "<div [ngClass]=\"{'sw-hidden': !dom.state.loaded}\" class=\"pop-action-close-btn sw-pointer\" (click)=\"onFormCancel();\">\n  <mat-icon>close</mat-icon>\n</div>\n<div class=\"pop-action-container\" [ngClass]=\"{'sw-hidden': !dom.state.loaded}\">\n  <div class=\"pop-action-dialog-header\" *ngIf=\"ui.header\">{{ui.header}}</div>\n  <div class=\"pop-action-dialog-content\">\n    <form (keyup.enter)=\"onEnterPress($event);\" [formGroup]=\"ui.form\" [className]=\"dom.state.pending ? 'pop-action-dialog-field-lock' : ''\">\n      <div class=\"import-flex-row\">\n        <div class=\"import-flex-column-break\" [ngClass]=\"{'sw-hidden': !dom.state.hasFields}\">\n          <template #container></template>\n        </div>\n        <div class=\"pop-action-spacer\" *ngIf=\"dom.state.hasFields && dom.state.hasComponent\" [style.width.px]=\"20\">\n\n        </div>\n        <div class=\"import-flex-column-break pop-action-portal-container\" [ngClass]=\"{'sw-hidden': !dom.state.hasComponent}\">\n          <ng-template [cdkPortalOutlet]></ng-template>\n        </div>\n      </div>\n    </form>\n  </div>\n  <div class=\"pop-action-dialog-buttons\">\n    <button class=\"pop-action-dialog-cancel\" mat-raised-button (click)=\"onFormCancel();\" [disabled]=\"dom.state.pending\">\n      Cancel\n    </button>\n    <button class=\"pop-action-dialog-other\" mat-raised-button color=\"accent\" (click)=\"onFormSubmit()\" [disabled]=\"!dom.state.validated || dom.state.pending\">\n      <span *ngIf=\"!dom.state.pending\">{{ui.submitText}}</span>\n      <div *ngIf=\"dom.state.pending\">\n        <mat-spinner diameter=\"20\"></mat-spinner>\n      </div>\n    </button>\n  </div>\n  <div class=\"pop-action-dialog-message-layout\" *ngIf=\"dom.state.success || dom.error?.message\" [@slideInOut]>\n    <div *ngIf=\"dom.state.success\" class=\"pop-action-dialog-success\" [innerHTML]=dom.state.success></div>\n    <div *ngIf=\"dom.error.message\" class=\"pop-action-dialog-errors\" [innerHTML]=dom.error.message></div>\n  </div>\n</div>\n<div class=\"pop-action-spinner-box\" *ngIf=\"dom.state.loading\">\n  <lib-main-spinner></lib-main-spinner>\n</div>\n",
                animations: [
                    slideInOut
                ],
                styles: [".pop-action-container{flex:1;padding-bottom:50px}.pop-action-close-btn{position:absolute;top:-20px;right:-20px}.pop-action-dialog-header{font-weight:500;text-align:center;margin-bottom:var(--gap-s)}.pop-action-dialog-content{position:relative;display:block;width:100%;min-height:30px;margin-bottom:10px;padding-bottom:50px}.pop-action-dialog-content .pop-action-dialog-field{margin-bottom:10px}.pop-action-dialog-content .pop-action-dialog-field-lock{pointer-events:none!important}.pop-action-dialog-content .pop-action-dialog-field-spinner{position:absolute;left:50%;top:50%;margin-left:-22px;margin-top:-40px}.pop-action-dialog-buttons{margin-top:20px;margin-bottom:10px;display:flex;justify-content:flex-end}.pop-action-dialog-buttons .pop-action-dialog-cancel{order:1;display:flex;align-items:center;justify-content:center;min-height:35px;min-width:120px}.pop-action-dialog-buttons .pop-action-dialog-other{order:2;display:flex;align-items:center;justify-content:center;margin-left:10px;min-width:120px;min-height:35px}.pop-action-dialog-errors{color:var(--warn);text-align:center;word-break:break-word}.pop-action-dialog-success{color:var(--success);text-align:center;word-break:break-word}.pop-action-dialog-message-layout{display:flex;flex-direction:row;min-height:40px;align-items:center;justify-content:center;text-align:center;margin-top:var(--gap-xl)}.pop-action-dialog-disabled{pointer-events:none}.pop-action-spinner-box{height:150px}.import-flex-column-break{min-width:350px;max-width:350px}.pop-action-portal-container{padding-top:18px}"]
            },] }
];
PopActionDialogComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: MatDialogRef },
    { type: undefined, decorators: [{ type: Inject, args: [MAT_DIALOG_DATA,] }] }
];
PopActionDialogComponent.propDecorators = {
    container: [{ type: ViewChild, args: ['container', { read: ViewContainerRef, static: true },] }],
    portal: [{ type: ViewChild, args: [CdkPortalOutlet, { static: true },] }],
    action: [{ type: Input }],
    actionName: [{ type: Input }],
    extension: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWFjdGlvbi1kaWFsb2cuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtZGlhbG9ncy9wb3AtYWN0aW9uLWRpYWxvZy9wb3AtYWN0aW9uLWRpYWxvZy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDTCxTQUFTLEVBRVQsVUFBVSxFQUNWLE1BQU0sRUFDTixLQUFLLEVBR0wsU0FBUyxFQUNULGdCQUFnQixFQUNqQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0seUNBQXlDLENBQUM7QUFDbkUsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sMENBQTBDLENBQUM7QUFDbkYsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBQ25FLE9BQU8sRUFPTCxNQUFNLEVBQ04sV0FBVyxFQUNYLGVBQWUsRUFDaEIsTUFBTSw4QkFBOEIsQ0FBQztBQUN0QyxPQUFPLEVBQ0wsd0JBQXdCLEVBQ3hCLFNBQVMsRUFBRSxlQUFlLEVBQzFCLGFBQWEsRUFDYixPQUFPLEVBQUUsa0JBQWtCLEVBQzNCLFNBQVMsRUFDVCxRQUFRLEVBQ1IsUUFBUSxFQUNSLFFBQVEsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxTQUFTLEdBQ3pELE1BQU0sZ0NBQWdDLENBQUM7QUFDeEMsT0FBTyxFQUNMLHFCQUFxQixFQUNyQixzQkFBc0IsRUFDdEIsY0FBYyxFQUNkLHNCQUFzQixFQUN0QixZQUFZLEVBQ1osZUFBZSxFQUNoQixNQUFNLG9DQUFvQyxDQUFDO0FBQzVDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSx3REFBd0QsQ0FBQztBQUNqRyxP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biAgRWxlbWVudFJlZixcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIFZpZXdDaGlsZCxcbiAgVmlld0NvbnRhaW5lclJlZlxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7c2xpZGVJbk91dH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi1hbmltYXRpb25zLm1vZGVsJztcbmltcG9ydCB7UG9wRXh0ZW5kRHluYW1pY0NvbXBvbmVudH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWV4dGVuZC1keW5hbWljLmNvbXBvbmVudCc7XG5pbXBvcnQge1BvcERvbVNlcnZpY2V9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQge1xuICBDb3JlQ29uZmlnLCBEaWN0aW9uYXJ5LFxuICBEeW5hbWljQ29tcG9uZW50SW50ZXJmYWNlLCBFbnRpdHksIEVudGl0eUFjdGlvbkRhdGFJbnRlcmZhY2UsXG4gIEVudGl0eUFjdGlvbkludGVyZmFjZSxcbiAgRW50aXR5RXh0ZW5kSW50ZXJmYWNlLFxuICBGaWVsZEludGVyZmFjZSwgRmllbGRJdGVtSW50ZXJmYWNlLFxuICBGaWVsZEl0ZW1QYXRjaEludGVyZmFjZSwgUG9wQmFzZUV2ZW50SW50ZXJmYWNlLFxuICBQb3BMb2csXG4gIFBvcFRlbXBsYXRlLFxuICBTZXJ2aWNlSW5qZWN0b3Jcbn0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQge1xuICBDb252ZXJ0QXJyYXlUb09wdGlvbkxpc3QsXG4gIERlZXBNZXJnZSwgR2V0SHR0cEVycm9yTXNnLFxuICBHZXRIdHRwUmVzdWx0LFxuICBJc0FycmF5LCBJc0NhbGxhYmxlRnVuY3Rpb24sXG4gIElzRGVmaW5lZCxcbiAgSXNPYmplY3QsXG4gIElzU3RyaW5nLFxuICBKc29uQ29weSwgU2xlZXAsIFNuYWtlVG9QYXNjYWwsIFN0b3JhZ2VHZXR0ZXIsIFRpdGxlQ2FzZSxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7XG4gIEV2YWx1YXRlV2hlbkNvbmRpdGlvbixcbiAgRXZhbHVhdGVXaGVuQ29uZGl0aW9ucyxcbiAgRmllbGRJdGVtTW9kZWwsXG4gIElzVmFsaWRGaWVsZFBhdGNoRXZlbnQsXG4gIFBhcnNlTGlua1VybCxcbiAgUGFyc2VNb2RlbFZhbHVlXG59IGZyb20gJy4uLy4uLy4uL2VudGl0eS9wb3AtZW50aXR5LXV0aWxpdHknO1xuaW1wb3J0IHtSb3V0ZXJ9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQge1BvcEVudGl0eVV0aWxGaWVsZFNlcnZpY2V9IGZyb20gJy4uLy4uLy4uL2VudGl0eS9zZXJ2aWNlcy9wb3AtZW50aXR5LXV0aWwtZmllbGQuc2VydmljZSc7XG5pbXBvcnQge0Nka1BvcnRhbE91dGxldCwgQ29tcG9uZW50UG9ydGFsLCBDb21wb25lbnRUeXBlfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7TUFUX0RJQUxPR19EQVRBLCBNYXREaWFsb2csIE1hdERpYWxvZ1JlZn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGlhbG9nJztcbmltcG9ydCB7UG9wUmVxdWVzdFNlcnZpY2V9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1yZXF1ZXN0LnNlcnZpY2UnO1xuaW1wb3J0IHtGb3JtR3JvdXB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7UG9wRW50aXR5RXZlbnRTZXJ2aWNlfSBmcm9tICcuLi8uLi8uLi9lbnRpdHkvc2VydmljZXMvcG9wLWVudGl0eS1ldmVudC5zZXJ2aWNlJztcbmltcG9ydCB7UG9wU2VsZWN0Q29tcG9uZW50fSBmcm9tIFwiLi4vLi4vcG9wLWZpZWxkLWl0ZW0vcG9wLXNlbGVjdC9wb3Atc2VsZWN0LmNvbXBvbmVudFwiO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtYWN0aW9uLWRpYWxvZycsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3AtYWN0aW9uLWRpYWxvZy5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3BvcC1hY3Rpb24tZGlhbG9nLmNvbXBvbmVudC5zY3NzJ10sXG4gIGFuaW1hdGlvbnM6IFtcbiAgICBzbGlkZUluT3V0XG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgUG9wQWN0aW9uRGlhbG9nQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kRHluYW1pY0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQFZpZXdDaGlsZCgnY29udGFpbmVyJywge3JlYWQ6IFZpZXdDb250YWluZXJSZWYsIHN0YXRpYzogdHJ1ZX0pIHByaXZhdGUgY29udGFpbmVyO1xuICBAVmlld0NoaWxkKENka1BvcnRhbE91dGxldCwge3N0YXRpYzogdHJ1ZX0pIHBvcnRhbDogQ2RrUG9ydGFsT3V0bGV0O1xuICBASW5wdXQoKSBhY3Rpb246IEVudGl0eUFjdGlvbkludGVyZmFjZTtcbiAgQElucHV0KCkgYWN0aW9uTmFtZTogc3RyaW5nO1xuICBASW5wdXQoKSBleHRlbnNpb246IEVudGl0eUV4dGVuZEludGVyZmFjZTtcblxuICBuYW1lID0gJ1BvcEFjdGlvbkRpYWxvZ0NvbXBvbmVudCc7XG5cbiAgcHJvdGVjdGVkIHNydiA9IHtcbiAgICBkaWFsb2c6IDxNYXREaWFsb2c+U2VydmljZUluamVjdG9yLmdldChNYXREaWFsb2cpLFxuICAgIGV2ZW50czogPFBvcEVudGl0eUV2ZW50U2VydmljZT5TZXJ2aWNlSW5qZWN0b3IuZ2V0KFBvcEVudGl0eUV2ZW50U2VydmljZSksXG4gICAgZmllbGQ6IDxQb3BFbnRpdHlVdGlsRmllbGRTZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoUG9wRW50aXR5VXRpbEZpZWxkU2VydmljZSksXG4gICAgcmVxdWVzdDogPFBvcFJlcXVlc3RTZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoUG9wUmVxdWVzdFNlcnZpY2UpLFxuICAgIHJvdXRlcjogPFJvdXRlcj5TZXJ2aWNlSW5qZWN0b3IuZ2V0KFJvdXRlciksXG4gIH07XG5cbiAgcHJvdGVjdGVkIGFzc2V0ID0ge1xuICAgIGNvbXBvbmVudFR5cGU6IDxDb21wb25lbnRUeXBlPGFueT4+dW5kZWZpbmVkLFxuICAgIGVudGl0eTogPEVudGl0eT57fSxcbiAgICBmYWNhZGVEdXJhdGlvbjogMjUwLFxuICAgIGZpZWxkSXRlbXM6IDxGaWVsZEl0ZW1JbnRlcmZhY2VbXT5bXSxcbiAgICBmaWVsZEl0ZW1NYXA6IHVuZGVmaW5lZCxcbiAgICBzdWJtaXRUZXh0OiAnU3VibWl0JyxcbiAgICB2aXNpYmxlOiAwLFxuICAgIGh0dHA6IDwnUEFUQ0gnIHwgJ1BPU1QnIHwgJ0RFTEVURScgfCAnR0VUJz4nUE9TVCcsXG4gICAgcG9zdFVybDogPHN0cmluZz5udWxsLFxuICAgIGdvVG9Vcmw6IDxzdHJpbmc+bnVsbCxcbiAgfTtcblxuICBwdWJsaWMgdWkgPSB7XG4gICAgZm9ybTogbmV3IEZvcm1Hcm91cCh7fSksXG4gICAgc3VibWl0VGV4dDogJ1N1Ym1pdCcsXG4gICAgaGVhZGVyOiAnTmV3J1xuICB9O1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVsOiBFbGVtZW50UmVmLFxuICAgIHByb3RlY3RlZCBfZG9tUmVwbzogUG9wRG9tU2VydmljZSxcbiAgICBwdWJsaWMgZGlhbG9nOiBNYXREaWFsb2dSZWY8UG9wQWN0aW9uRGlhbG9nQ29tcG9uZW50PixcbiAgICBASW5qZWN0KE1BVF9ESUFMT0dfREFUQSkgcHVibGljIGRhdGE6IEVudGl0eUFjdGlvbkRhdGFJbnRlcmZhY2UsXG4gICkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcblxuICAgICAgICBhd2FpdCB0aGlzLl9zZXRJbml0aWFsQ29uZmlnKCk7XG4gICAgICAgIGF3YWl0IHRoaXMuX3NldEFjdGlvbigpO1xuICAgICAgICBhd2FpdCB0aGlzLl9zZXRGaWVsZEl0ZW1zKCk7XG4gICAgICAgIGF3YWl0IHRoaXMuX3NldEFkZGl0aW9uYWxDb25maWcoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5fYnVpbGRGb3JtR3JvdXAoKTtcblxuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLmRvbS5wcm9jZWVkID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHRoaXMuX3JlbmRlckZpZWxkSXRlbXMoKTtcbiAgICAgICAgdGhpcy5fcmVuZGVyQ29tcG9uZW50KCk7XG5cbiAgICAgICAgY29uc3QgaGFzQ2hpbGQgPSB0aGlzLmFzc2V0LmZpZWxkSXRlbXMuZmluZCgoZmllbGRJdGVtOiBGaWVsZEl0ZW1JbnRlcmZhY2UpID0+IFN0b3JhZ2VHZXR0ZXIoZmllbGRJdGVtLCBbJ21vZGVsJywgJ29wdGlvbnMnLCAnY2hpbGQnXSwgbnVsbCkpO1xuICAgICAgICB0aGlzLl9yZXNldENvbXBvbmVudExpc3RIaWRkZW4oKTtcbiAgICAgICAgaWYgKGhhc0NoaWxkKSB7XG4gICAgICAgICAgdGhpcy5fdHJpZ2dlclBhcmVudENoaWxkVXBkYXRlcyhoYXNDaGlsZC5tb2RlbC5uYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl90cmlnZ2VyRm9ybVZhbGlkYXRpb24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IHNob3VsZCBoYXZlIGEgc3BlY2lmaWMgcHVycG9zZVxuICAgKi9cbiAgbmdPbkluaXQoKSB7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEludGVyY2VwdCB0aGUgZW50ZXIgcHJlc3MgdG8gY2hlY2sgaWYgdGhlIGZvcm0gY2FuIGJlIHN1Ym1pdHRlZFxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uRW50ZXJQcmVzcyhldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgaWYgKHRoaXMuZG9tLnN0YXRlLnZhbGlkYXRlZCkge1xuICAgICAgdGhpcy5kb20uc2V0VGltZW91dChgc3VibWl0LWZvcm1gLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLm9uRm9ybVN1Ym1pdCgpO1xuICAgICAgfSwgMjUwKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgdXNlciBjYW4gY2xpY2sgYSBjYW5jZWwgYnRuIHRvIGNsb3NlIHRoZSBhY3Rpb24gZGlhbG9nXG4gICAqL1xuICBvbkZvcm1DYW5jZWwoKSB7XG4gICAgdGhpcy5kb20uc3RhdGUubG9hZGVkID0gZmFsc2U7XG4gICAgdGhpcy5kb20uc3RhdGUubG9hZGluZyA9IHRydWU7XG4gICAgdGhpcy5kb20uc2V0VGltZW91dChgY2xvc2UtbW9kYWxgLCAoKSA9PiB7XG4gICAgICB0aGlzLmRpYWxvZy5jbG9zZSgtMSk7XG4gICAgfSwgMjUwKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSB1c2VyIHdpbGwgcHJlc3MgZW50ZXIgb3IgY2xpY2sgYSBzdWJtaXQgYnRuIHRvIHN1Ym1pdCB0aGUgZm9ybVxuICAgKi9cbiAgb25Gb3JtU3VibWl0KCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPihhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKHRoaXMuZG9tLnN0YXRlLnZhbGlkYXRlZCAmJiAhdGhpcy5kb20uc3RhdGUucGVuZGluZykge1xuICAgICAgICB0aGlzLl9vblN1Ym1pc3Npb25TdGFydCgpO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSB0aGlzLnVpLmZvcm0udmFsdWU7IC8vIGdldCBmb3JtIHZhbHVlIGJlZm9yZSBkaXNhYmxpbmcgZm9ybVxuXG4gICAgICAgIC8vIHRoaXMuZG9tLmFzc2V0LmZvcm1fZ3JvdXAuZGlzYWJsZSgpOyAvL2JhZCBpZGVhIGRpc2FibGVkIHRocm91Z2ggY3NzXG5cbiAgICAgICAgaWYgKCF0aGlzLmFjdGlvbi5mYWNhZGUpIHtcbiAgICAgICAgICBjb25zdCBtZXRob2QgPSBgZG8ke1RpdGxlQ2FzZSh0aGlzLmFzc2V0Lmh0dHApfWA7XG4gICAgICAgICAgY29uc3QgcmVxdWVzdCA9IHRoaXMuc3J2LnJlcXVlc3RbbWV0aG9kXSh0aGlzLmFzc2V0LnBvc3RVcmwsIHBhcmFtcywgMSwgZmFsc2UpO1xuICAgICAgICAgIHJlcXVlc3Quc3Vic2NyaWJlKGFzeW5jIChyZXN1bHQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICByZXN1bHQgPSBHZXRIdHRwUmVzdWx0KHJlc3VsdCk7XG4gICAgICAgICAgICAgIGNvbnN0IGdvVG9VcmwgPSB0aGlzLmFzc2V0LmdvVG9Vcmw7XG4gICAgICAgICAgICAgIHRoaXMuYXNzZXQuZW50aXR5ID0gcmVzdWx0O1xuICAgICAgICAgICAgICBhd2FpdCB0aGlzLl9vblN1Ym1pc3Npb25TdWNjZXNzKCk7XG4gICAgICAgICAgICAgIHRoaXMuZGlhbG9nLmNsb3NlKHRoaXMuYXNzZXQuZW50aXR5KTtcbiAgICAgICAgICAgICAgaWYgKElzU3RyaW5nKGdvVG9VcmwsIHRydWUpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3R29Ub1VybCA9IFBhcnNlTGlua1VybChTdHJpbmcoZ29Ub1VybCkuc2xpY2UoKSwgdGhpcy5hc3NldC5lbnRpdHkpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmluZm8oYG9uRm9ybVN1Ym1pdDpnb1RvVXJsYCwgbmV3R29Ub1VybCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2cuaW5mbyhgb25Gb3JtU3VibWl0OmVudGl0eWAsIHRoaXMuYXNzZXQuZW50aXR5KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNydi5yb3V0ZXIubmF2aWdhdGUoW25ld0dvVG9VcmxdKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5fb25TdWJtaXNzaW9uRmFpbCgpO1xuICAgICAgICAgICAgICB0aGlzLl9zZXRFcnJvck1lc3NhZ2UoR2V0SHR0cEVycm9yTXNnKGVycikpO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhd2FpdCBTbGVlcCh0aGlzLmFzc2V0LmZhY2FkZUR1cmF0aW9uKTtcbiAgICAgICAgICBhd2FpdCB0aGlzLl9vblN1Ym1pc3Npb25TdWNjZXNzKCk7XG4gICAgICAgICAgbGV0IHJlc3BvbnNlID0gSXNPYmplY3QocGFyYW1zKSA/IHBhcmFtcyA6IHt9O1xuICAgICAgICAgIGlmICh0aGlzLmFjdGlvbi5yZXNwb25zZVR5cGUgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgcmVzcG9uc2UgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5hY3Rpb24ucmVzcG9uc2VUeXBlID09PSAnc3RvcmUnKSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IElzT2JqZWN0KHRoaXMuYWN0aW9uLnN0b3JlKSA/IHRoaXMuYWN0aW9uLnN0b3JlIDoge307XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuZGlhbG9nLmNsb3NlKHJlc3BvbnNlKTtcblxuICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgZG9tIGRlc3Ryb3kgZnVuY3Rpb24gbWFuYWdlcyBhbGwgdGhlIGNsZWFuIHVwIHRoYXQgaXMgbmVjZXNzYXJ5IGlmIHN1YnNjcmlwdGlvbnMsIHRpbWVvdXRzLCBldGMgYXJlIHN0b3JlZCBwcm9wZXJseVxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByb3RlY3RlZCBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgIFRoZXNlIGFyZSBwcm90ZWN0ZWQgaW5zdGVhZCBvZiBwcml2YXRlIHNvIHRoYXQgdGhleSBjYW4gYmUgb3ZlcnJpZGRlbiAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IHdpbGwgcGVyZm9ybSB0aGUgaW50aWFsIGNvbmZpZyBvZiB0aGlzIGNvbXBvbmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJvdGVjdGVkIF9zZXRJbml0aWFsQ29uZmlnKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPigocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmRvbS5zdGF0ZS5sb2FkZWQpIHtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZS5hdHRhY2goJ2NvbnRhaW5lcicpOyAvLyBjb250YWluZXIgcmVmZXJlbmNlcyB0aGUgQHZpZXdDaGlsZCgnY29udGFpbmVyJylcblxuICAgICAgICBpZiAoSXNPYmplY3QodGhpcy5kYXRhLmNvcmUsIHRydWUpKSB0aGlzLmNvcmUgPSB0aGlzLmRhdGEuY29yZTtcbiAgICAgICAgaWYgKElzT2JqZWN0KHRoaXMuZGF0YS5hY3Rpb24sIHRydWUpKSB0aGlzLmFjdGlvbiA9IHRoaXMuZGF0YS5hY3Rpb247XG4gICAgICAgIGlmIChJc1N0cmluZyh0aGlzLmRhdGEuYWN0aW9uTmFtZSwgdHJ1ZSkpIHRoaXMuYWN0aW9uTmFtZSA9IHRoaXMuZGF0YS5hY3Rpb25OYW1lO1xuICAgICAgICBpZiAoSXNPYmplY3QodGhpcy5kYXRhLmV4dGVuc2lvbiwgdHJ1ZSkpIHRoaXMuZXh0ZW5zaW9uID0gdGhpcy5kYXRhLmV4dGVuc2lvbjtcbiAgICAgICAgaWYgKCFJc09iamVjdCh0aGlzLmV4dGVuc2lvbiwgdHJ1ZSkpIHRoaXMuZXh0ZW5zaW9uID0ge307XG4gICAgICAgIC8vIGFjdGlvbkZpZWxkSXRlbXMuc29ydCggRHluYW1pY1NvcnQoICdzb3J0JyApICk7XG5cbiAgICAgICAgaWYgKCEoSXNTdHJpbmcodGhpcy51aS5zdWJtaXRUZXh0LCB0cnVlKSkpIHRoaXMudWkuc3VibWl0VGV4dCA9ICdTdWJtaXQnO1xuICAgICAgICB0aGlzLmRvbS5zdGF0ZS52YWxpZGF0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUudGVtcGxhdGUgPSAnY29sbGVjdGlvbic7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmRhdGE7XG5cbiAgICAgICAgdGhpcy5kb20uaGFuZGxlci5idWJibGUgPSBhc3luYyAoY29yZTogQ29yZUNvbmZpZywgZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSkgPT4ge1xuICAgICAgICAgIHRoaXMubG9nLmV2ZW50KGBidWJibGU6aGFuZGxlcmAsIGV2ZW50KTtcbiAgICAgICAgICBpZiAodGhpcy5hY3Rpb24ucmVzcG9uc2VUeXBlID09PSAnc3RvcmUnKSB0aGlzLl9oYW5kbGVTdG9yZUV2ZW50KGV2ZW50KTtcbiAgICAgICAgICBpZiAoSXNDYWxsYWJsZUZ1bmN0aW9uKHRoaXMuYWN0aW9uLm9uRXZlbnQpKSBhd2FpdCB0aGlzLmFjdGlvbi5vbkV2ZW50KGNvcmUsIDxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+e1xuICAgICAgICAgICAgLi4uZXZlbnQsIC4uLntcbiAgICAgICAgICAgICAgZW50aXR5OiB0aGlzLmFzc2V0LmVudGl0eSxcbiAgICAgICAgICAgICAgZm9ybTogdGhpcy51aS5mb3JtLFxuICAgICAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgICAgIGZpZWxkSXRlbXM6IHRoaXMuYXNzZXQuZmllbGRJdGVtc1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gVG9kbzo6IEFyZSB3ZSBzZWVpbmcgdGhpcyBldmVudCBoZXJlLCBvbiBzaW5nbGUgaW5wdXQgZm9ybXMgc3VibWl0IGJ1dHRvbiBpcyBub3QgYmUgYWN0aXZhdGVkXG4gICAgICAgICAgaWYgKGV2ZW50Lm5hbWUgPT09ICdvbktleVVwJyB8fCBldmVudC5uYW1lID09PSAnb25JbnZhbGlkQ2hhbmdlJykge1xuICAgICAgICAgICAgdGhpcy5kb20uc3RhdGUudmFsaWRhdGVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGB0cmlnZ2VyLXZhbGlkYXRpb25gLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJGb3JtVmFsaWRhdGlvbigpO1xuICAgICAgICAgICAgfSwgMjUwKTtcblxuICAgICAgICAgIH0gZWxzZSBpZiAoSXNWYWxpZEZpZWxkUGF0Y2hFdmVudCh0aGlzLmNvcmUsIGV2ZW50KSkge1xuXG4gICAgICAgICAgICBpZiAoZXZlbnQuY29uZmlnLm5hbWUgaW4gdGhpcy5hc3NldC5lbnRpdHkpIHtcbiAgICAgICAgICAgICAgY29uc3QgbmV3VmFsdWUgPSBpc05hTihldmVudC5jb25maWcuY29udHJvbC52YWx1ZSkgPyBldmVudC5jb25maWcuY29udHJvbC52YWx1ZSA6ICtldmVudC5jb25maWcuY29udHJvbC52YWx1ZTtcbiAgICAgICAgICAgICAgdGhpcy5hc3NldC5lbnRpdHlbZXZlbnQuY29uZmlnLm5hbWVdID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmFzc2V0LmZpZWxkSXRlbXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc2V0Q29tcG9uZW50TGlzdEhpZGRlbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoYHVwZGF0ZS1yZWxhdGlvbnNgLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICB0aGlzLl90cmlnZ2VyUGFyZW50Q2hpbGRVcGRhdGVzKGV2ZW50LmNvbmZpZy5uYW1lKTtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90cmlnZ2VyRm9ybVZhbGlkYXRpb24oKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuXG4gICAgICAgICAgLy8gaWYoIGV2ZW50LmNvbmZpZy5idWJibGUgfHwgWyAncGF0Y2gnIF0uaW5jbHVkZXMoIGV2ZW50Lm5hbWUgKSApe1xuICAgICAgICAgIHRoaXMuZXZlbnRzLmVtaXQoZXZlbnQpO1xuICAgICAgICAgIC8vIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBmeCB3aWxsIHBlcmZvcm0gYWRkaXRpb25hbCBjb25maWcgb2YgdGhpcyBjb21wb25lbnQgdGhhdCBoYXMgaW5pdGlhbCBjb25maWcgZGVwZW5kZW5jaWVzXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldEFkZGl0aW9uYWxDb25maWcoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KChyZXNvbHZlKSA9PiB7XG4gICAgICBsZXQgZ29Ub1VybCA9IElzU3RyaW5nKHRoaXMuZXh0ZW5zaW9uLmdvVG9VcmwsIHRydWUpID8gdGhpcy5leHRlbnNpb24uZ29Ub1VybCA6ICh0aGlzLmFjdGlvbi5nb1RvVXJsID8gdGhpcy5hY3Rpb24uZ29Ub1VybCA6IG51bGwpO1xuICAgICAgaWYgKGdvVG9VcmwpIGdvVG9VcmwgPSBQYXJzZU1vZGVsVmFsdWUoZ29Ub1VybCwgdGhpcy5jb3JlLCB0cnVlKTtcblxuICAgICAgY29uc3Qgc3RvcmFnZSA9IElzT2JqZWN0KHRoaXMuY29yZS5lbnRpdHksIFsnaWQnLCAnbmFtZSddKSAmJiAhdGhpcy5hY3Rpb24uYmxvY2tFbnRpdHkgPyB0aGlzLmNvcmUuZW50aXR5IDogKElzT2JqZWN0KHRoaXMuYXNzZXQuZW50aXR5LCB0cnVlKSA/IHRoaXMuYXNzZXQuZW50aXR5IDoge30pO1xuICAgICAgbGV0IHBvc3RVcmwgPSBJc1N0cmluZyh0aGlzLmV4dGVuc2lvbi5wb3N0VXJsLCB0cnVlKSA/IHRoaXMuZXh0ZW5zaW9uLnBvc3RVcmwgOiAodGhpcy5hY3Rpb24ucG9zdFVybCA/IFBhcnNlTGlua1VybChTdHJpbmcodGhpcy5hY3Rpb24ucG9zdFVybCkuc2xpY2UoKSwgc3RvcmFnZSkgOiB0aGlzLmNvcmUucGFyYW1zLnBhdGgpO1xuICAgICAgaWYgKHBvc3RVcmwpIHBvc3RVcmwgPSBQYXJzZU1vZGVsVmFsdWUocG9zdFVybCwgdGhpcy5jb3JlLCB0cnVlKTtcblxuICAgICAgaWYgKCt0aGlzLmFjdGlvbi5mYWNhZGVEdXJhdGlvbikgdGhpcy5hc3NldC5mYWNhZGVEdXJhdGlvbiA9IHRoaXMuYWN0aW9uLmZhY2FkZUR1cmF0aW9uO1xuICAgICAgaWYgKCt0aGlzLmFjdGlvbi5mYWNhZGVEdXJhdGlvbiA+IDIwMDApIHtcbiAgICAgICAgdGhpcy5hY3Rpb24uZmFjYWRlRHVyYXRpb24gPSAyMDAwO1xuICAgICAgfVxuICAgICAgdGhpcy5hc3NldC5nb1RvVXJsID0gZ29Ub1VybDtcbiAgICAgIHRoaXMuYXNzZXQucG9zdFVybCA9IHBvc3RVcmw7XG5cbiAgICAgIHRoaXMudWkuc3VibWl0VGV4dCA9IElzU3RyaW5nKHRoaXMuYWN0aW9uLnN1Ym1pdFRleHQsIHRydWUpID8gdGhpcy5hY3Rpb24uc3VibWl0VGV4dCA6ICdTdWJtaXQnO1xuICAgICAgdGhpcy5hc3NldC5zdWJtaXRUZXh0ID0gdGhpcy5hY3Rpb24uc3VibWl0VGV4dDtcblxuICAgICAgaWYgKElzU3RyaW5nKHRoaXMuYWN0aW9uLmh0dHApKSB0aGlzLmFzc2V0Lmh0dHAgPSB0aGlzLmFjdGlvbi5odHRwO1xuXG4gICAgICB0aGlzLnVpLmhlYWRlciA9IElzU3RyaW5nKHRoaXMuYWN0aW9uLmhlYWRlciwgdHJ1ZSkgPyB0aGlzLmFjdGlvbi5oZWFkZXIgOiBgJHtUaXRsZUNhc2UodGhpcy5hY3Rpb24ubmFtZSl9ICR7U25ha2VUb1Bhc2NhbCh0aGlzLmNvcmUucmVwby5nZXREaXNwbGF5TmFtZSgpKX1gO1xuXG4gICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgZnggd2lsbCB0cmlnZ2VyIHRoZSBmb3JtIHZhbGlkYXRpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByb3RlY3RlZCBfYnVpbGRGb3JtR3JvdXAoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoSXNBcnJheSh0aGlzLmFzc2V0LmZpZWxkSXRlbXMsIHRydWUpKSB7XG4gICAgICAgIHRoaXMuYXNzZXQuZmllbGRJdGVtcy5tYXAoKGZpZWxkOiBGaWVsZEl0ZW1JbnRlcmZhY2UpID0+IHtcbiAgICAgICAgICBpZiAoZmllbGQuY29uZmlnICYmIGZpZWxkLmNvbmZpZy5jb250cm9sKSB7XG4gICAgICAgICAgICB0aGlzLnVpLmZvcm0uYWRkQ29udHJvbChmaWVsZC5jb25maWcubmFtZSwgZmllbGQuY29uZmlnLmNvbnRyb2wpO1xuICAgICAgICAgICAgdGhpcy5hc3NldC52aXNpYmxlKys7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IHdpbGwgdGFrZSBhbnkgcGF0Y2ggZXZlbnQgdGhhdCBvY2N1cnMgYW5kIHN0b3JlIHRoZSBrZXkgdmFsdWUgcGFpclxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByb3RlY3RlZCBfaGFuZGxlU3RvcmVFdmVudChldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlKSB7XG4gICAgdGhpcy5sb2cuZXZlbnQoYF9oYW5kbGVTdG9yZUV2ZW50YCwgZXZlbnQpO1xuICAgIGlmIChJc1ZhbGlkRmllbGRQYXRjaEV2ZW50KHRoaXMuY29yZSwgZXZlbnQpKSB7XG4gICAgICBpZiAoIShJc09iamVjdCh0aGlzLmFjdGlvbi5zdG9yZSkpKSB0aGlzLmFjdGlvbi5zdG9yZSA9IDxEaWN0aW9uYXJ5PGFueT4+e307XG4gICAgICB0aGlzLmFjdGlvbi5zdG9yZVtldmVudC5jb25maWcubmFtZV0gPSBldmVudC5jb25maWcuY29udHJvbC52YWx1ZTtcbiAgICB9XG4gICAgdGhpcy5sb2cuaW5mbyhgX2hhbmRsZVN0b3JlRXZlbnQ6IHN0b3JlYCwgdGhpcy5hY3Rpb24uc3RvcmUpO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBmeCB3aWxsIHRyaWdnZXIgdGhlIGZvcm0gdmFsaWRhdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJvdGVjdGVkIF90cmlnZ2VyRm9ybVZhbGlkYXRpb24oKSB7XG4gICAgdGhpcy5kb20uc2V0VGltZW91dChgdHJpZ2dlci1mb3JtLXZhbGlkYXRpb25gLCAoKSA9PiB7XG4gICAgICB0aGlzLl92YWxpZGF0ZUZvcm0oKS50aGVuKCh2YWxpZDogYm9vbGVhbikgPT4ge1xuICAgICAgICB0aGlzLmRvbS5zdGF0ZS52YWxpZGF0ZWQgPSB2YWxpZDtcbiAgICAgIH0pO1xuICAgIH0sIDUwKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSBmb3JtIG5lZWRzIHRvIGFibGUgdG8gbWFrZSBhcGkgY2FsbHMgdG8gdmVyaWZ5IGluZm8gZm9yIGNlcnRhaW4gZmllbGRzXG4gICAqIFRvRG86OiBBbGxvdyB0aGUgY29uZmlnIHRvIGJlIGFibGUgdG8gcGFzcyBpbiBhcGkgdmFsaWRhdGlvbiBjYWxscyBmb3IgY2VydGFpbiBmaWVsZHNcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByb3RlY3RlZCBfdmFsaWRhdGVGb3JtKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPigocmVzb2x2ZSkgPT4ge1xuICAgICAgdGhpcy5kb20uc3RhdGUudmFsaWRhdGVkID0gZmFsc2U7XG4gICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGB0cmlnZ2VyLWZvcm0tdmFsaWRhdGlvbmAsIG51bGwpO1xuICAgICAgdGhpcy5kb20uc2V0VGltZW91dChgdmFsaWRhdGUtZm9ybWAsICgpID0+IHtcbiAgICAgICAgdGhpcy51aS5mb3JtLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5kb20uc3RhdGUudmFsaWRhdGVkID0gdHJ1ZTsgLy8gbW9jayBzdHViIGZvciBub3dcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0aGlzLnVpLmZvcm0udmFsaWQpO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH0sIDApO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBmeCB3aWxsIGhhbmRsZSB0aGUgZXJyb3IgbWVzc2FnaW5nXG4gICAqIEBwYXJhbSBtZXNzYWdlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldEVycm9yTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICB0aGlzLmRvbS5lcnJvci5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAvLyB0aGlzLmRvbS5zZXRUaW1lb3V0KCdtZXNzYWdlJywgKCkgPT4ge1xuICAgIC8vICAgdGhpcy5kb20uZXJyb3IubWVzc2FnZSA9ICcnO1xuICAgIC8vICAgdGhpcy5kb20uc2V0VGltZW91dCgnbWVzc2FnZScsIG51bGwsIDApO1xuICAgIC8vIH0sIDMwMDApO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBob29rIGlzIGNhbGxlZCB3aGVuIHRoZSBmb3JtIGlzIHN1Ym1pdHRpbmdcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByb3RlY3RlZCBfb25TdWJtaXNzaW9uU3RhcnQoKSB7XG4gICAgdGhpcy5kb20uc2V0VGltZW91dCgnbWVzc2FnZScsIG51bGwsIDApO1xuICAgIHRoaXMuZG9tLmVycm9yLm1lc3NhZ2UgPSAnJztcbiAgICB0aGlzLmRvbS5zdGF0ZS5wZW5kaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnVpLnN1Ym1pdFRleHQgPSAnJztcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgaG9vayBpcyBjYWxsZWQgd2hlbiB0aGUgZm9ybSBzdWJtaXNzaW9uIGhhcyBmYWlsZWRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByb3RlY3RlZCBfb25TdWJtaXNzaW9uRmFpbCgpIHtcbiAgICAvLyBSZS1FbmFibGUgRm9ybSBhbmQgc2hvdyBlcnJvclxuICAgIHRoaXMuZG9tLnN0YXRlLnBlbmRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmRvbS5zdGF0ZS50ZW1wbGF0ZSA9ICdmYWlsJztcbiAgICB0aGlzLnVpLnN1Ym1pdFRleHQgPSBJc1N0cmluZyh0aGlzLmFjdGlvbi5zdWJtaXRUZXh0LCB0cnVlKSA/IHRoaXMuYWN0aW9uLnN1Ym1pdFRleHQgOiAnU3VibWl0JztcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgaG9vayBpcyBjYWxsZWQgd2hlbiB0aGUgZm9ybSBoYXMgc3VibWl0dGVkIHN1Y2Nlc3NmdWxseVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJvdGVjdGVkIF9vblN1Ym1pc3Npb25TdWNjZXNzKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPihhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgdGhpcy5kb20uc3RhdGUudGVtcGxhdGUgPSAnc3VjY2Vzcyc7XG4gICAgICB0aGlzLmRvbS5zdGF0ZS5wZW5kaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmNvcmUucmVwby5jbGVhckFsbENhY2hlKHRoaXMubmFtZSk7XG4gICAgICBpZiAoSXNDYWxsYWJsZUZ1bmN0aW9uKHRoaXMuYWN0aW9uLmNhbGxiYWNrKSkge1xuICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBhY3Rpb24tY2FsbGJhY2tgLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgYWN0aW9uRXZlbnQgPSA8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPntcbiAgICAgICAgICAgIHR5cGU6ICdlbnRpdHknLFxuICAgICAgICAgICAgc291cmNlOiB0aGlzLm5hbWUsXG4gICAgICAgICAgICBuYW1lOiB0aGlzLmFjdGlvbi5uYW1lLFxuICAgICAgICAgICAgZW50aXR5OiB0aGlzLmFzc2V0LmVudGl0eSxcbiAgICAgICAgICAgIGFjdGlvbjogdGhpcy5hY3Rpb24sXG4gICAgICAgICAgICBkYXRhOiB0aGlzLnVpLmZvcm0udmFsdWVcbiAgICAgICAgICB9O1xuICAgICAgICAgIGF3YWl0IHRoaXMuYWN0aW9uLmNhbGxiYWNrKHRoaXMuY29yZSwgYWN0aW9uRXZlbnQsIHRoaXMuZG9tKTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNydWRFdmVudCA9IDxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+e1xuICAgICAgICBzb3VyY2U6IHRoaXMubmFtZSxcbiAgICAgICAgbWV0aG9kOiAnY3JlYXRlJyxcbiAgICAgICAgdHlwZTogJ2VudGl0eScsXG4gICAgICAgIG5hbWU6IHRoaXMuY29yZS5wYXJhbXMubmFtZSxcbiAgICAgICAgaW50ZXJuYWxfbmFtZTogdGhpcy5jb3JlLnBhcmFtcy5pbnRlcm5hbF9uYW1lLFxuICAgICAgICBkYXRhOiB0aGlzLmFzc2V0LmVudGl0eVxuICAgICAgfTtcblxuICAgICAgdGhpcy5zcnYuZXZlbnRzLnNlbmRFdmVudChjcnVkRXZlbnQpO1xuICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IHdpbGwgcmVuZGVyIGFsbCBvZiB0aGUgZmllbGRzIHRoYXQgd2VyZSBwYXNzZWQgdGhyb3VnaCBpbiB0aGUgYWN0aW9uIGNvbmZpZ1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJvdGVjdGVkIF9yZW5kZXJGaWVsZEl0ZW1zKCkge1xuICAgIGNvbnN0IGNvbXBvbmVudExpc3QgPSA8RHluYW1pY0NvbXBvbmVudEludGVyZmFjZVtdPltdO1xuICAgIHRoaXMuYXNzZXQuZmllbGRJdGVtcy5tYXAoKGZpZWxkSXRlbSwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChmaWVsZEl0ZW0gJiYgSXNPYmplY3QoZmllbGRJdGVtLm1vZGVsLCBbJ25hbWUnXSkgJiYgZmllbGRJdGVtLmNvbmZpZyAmJiBmaWVsZEl0ZW0uY29tcG9uZW50KSB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nVmFsdWUgPSAnY29udHJvbCcgaW4gZmllbGRJdGVtLmNvbmZpZyA/IGZpZWxkSXRlbS5jb25maWcuY29udHJvbC52YWx1ZSA6IG51bGw7XG5cbiAgICAgICAgdGhpcy5hc3NldC5lbnRpdHlbZmllbGRJdGVtLm1vZGVsLm5hbWVdID0gZXhpc3RpbmdWYWx1ZTtcbiAgICAgICAgaWYgKHRoaXMuYWN0aW9uLmJ1YmJsZUFsbCkgZmllbGRJdGVtLmNvbmZpZy5idWJibGUgPSB0cnVlO1xuICAgICAgICBjb25zdCBjb21wb25lbnQgPSA8RHluYW1pY0NvbXBvbmVudEludGVyZmFjZT57XG4gICAgICAgICAgdHlwZTogZmllbGRJdGVtLmNvbXBvbmVudCxcbiAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgIGNvbmZpZzogZmllbGRJdGVtLmNvbmZpZyxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBmaWVsZEl0ZW0uY29uZmlnWydtZXRhZGF0YSddLnBvc2l0aW9uID8gZmllbGRJdGVtLmNvbmZpZ1snbWV0YWRhdGEnXS5wb3NpdGlvbiA6IDEsXG4gICAgICAgICAgICBoaWRkZW46IElzQXJyYXkoZmllbGRJdGVtLm1vZGVsLndoZW4sIHRydWUpID8gIShFdmFsdWF0ZVdoZW5Db25kaXRpb24odGhpcy5jb3JlLCBmaWVsZEl0ZW0ubW9kZWwud2hlbiwgdGhpcy5jb3JlKSkgOiBmYWxzZSxcbiAgICAgICAgICAgIHdoZW46IElzQXJyYXkoZmllbGRJdGVtLm1vZGVsLndoZW4sIHRydWUpID8gZmllbGRJdGVtLm1vZGVsLndoZW4gOiBudWxsXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb21wb25lbnRMaXN0LnB1c2goY29tcG9uZW50KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMudGVtcGxhdGUucmVuZGVyKGNvbXBvbmVudExpc3QsIFtdLCB0cnVlKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgZnggd2lsbCByZW5kZXIgdGhlIGEgY29tcG9uZW50IHRoYXQgd2FzIHBhc3NlZCBpbiB0aHJvdWdoIHRoZSBhY3Rpb24gY29uZmlnXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcm90ZWN0ZWQgX3JlbmRlckNvbXBvbmVudCgpIHtcbiAgICBpZiAoSXNPYmplY3QodGhpcy5hY3Rpb24uY29tcG9uZW50LCBbJ3R5cGUnXSkgJiYgdGhpcy5wb3J0YWwpIHtcbiAgICAgIGlmICh0aGlzLnBvcnRhbC5hdHRhY2hlZFJlZikgdGhpcy5wb3J0YWwuZGV0YWNoKCk7XG4gICAgICB0aGlzLmRvbS5zZXRTdWJzY3JpYmVyKCdwb3J0YWwtZXZlbnRzJywgbnVsbCk7XG4gICAgICBjb25zdCBjb21wb25lbnRSZWYgPSB0aGlzLnBvcnRhbC5hdHRhY2gobmV3IENvbXBvbmVudFBvcnRhbCh0aGlzLmFjdGlvbi5jb21wb25lbnQudHlwZSkpO1xuICAgICAgY29tcG9uZW50UmVmLmluc3RhbmNlWydjb3JlJ10gPSB0aGlzLmNvcmU7XG4gICAgICBpZiAoSXNPYmplY3QodGhpcy5hY3Rpb24uY29tcG9uZW50LCBbJ2lucHV0cyddKSkge1xuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLmFjdGlvbi5jb21wb25lbnQuaW5wdXRzKS5tYXAoKGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgY29tcG9uZW50UmVmLmluc3RhbmNlW2tleV0gPSB0aGlzLmFjdGlvbi5jb21wb25lbnQuaW5wdXRzW2tleV07XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgY29tcG9uZW50UmVmLmNoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcblxuICAgICAgaWYgKGNvbXBvbmVudFJlZi5pbnN0YW5jZVsnZXZlbnRzJ10pIHtcbiAgICAgICAgdGhpcy5kb20uc2V0U3Vic2NyaWJlcigncG9ydGFsLWV2ZW50cycsIGNvbXBvbmVudFJlZi5pbnN0YW5jZVsnZXZlbnRzJ10uc3Vic2NyaWJlKGFzeW5jIChldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuYWN0aW9uLnJlc3BvbnNlVHlwZSA9PT0gJ3N0b3JlJykge1xuICAgICAgICAgICAgdGhpcy5faGFuZGxlU3RvcmVFdmVudChldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChJc0NhbGxhYmxlRnVuY3Rpb24odGhpcy5hY3Rpb24ub25FdmVudCkpIGF3YWl0IHRoaXMuYWN0aW9uLm9uRXZlbnQodGhpcy5jb3JlLCA8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPntcbiAgICAgICAgICAgIC4uLmV2ZW50LCAuLi57XG4gICAgICAgICAgICAgIGVudGl0eTogdGhpcy5hc3NldC5lbnRpdHksXG4gICAgICAgICAgICAgIGZvcm06IHRoaXMudWkuZm9ybSxcbiAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICBmaWVsZEl0ZW1zOiB0aGlzLmFzc2V0LmZpZWxkSXRlbXNcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVuZGVyIFRoZSBIb29kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJpdmF0ZSBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IHdpbGwgcmVzb2x2ZSB0aGUgY29uZmlnIG9mIGFjdGlvbiB0aGF0IHBvcCBpcyBzdXBwb3NlIHRvIHBlcmZvcm1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX3NldEFjdGlvbigpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgIGlmIChJc09iamVjdCh0aGlzLmFjdGlvbiwgdHJ1ZSkpIHtcbiAgICAgICAgaWYgKCEoSXNEZWZpbmVkKHRoaXMuYWN0aW9uLnJlc3BvbnNlVHlwZSkpKSB0aGlzLmFjdGlvbi5yZXNwb25zZVR5cGUgPSAnZm9ybSc7XG4gICAgICAgIHRoaXMuZG9tLnN0YXRlLmhhc0NvbXBvbmVudCA9IElzT2JqZWN0KHRoaXMuYWN0aW9uLmNvbXBvbmVudCwgWyd0eXBlJ10pO1xuICAgICAgICB0aGlzLmRvbS5zdGF0ZS5oYXNGaWVsZHMgPSBJc09iamVjdCh0aGlzLmFjdGlvbi5maWVsZHMsIHRydWUpO1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfSBlbHNlIGlmIChJc1N0cmluZyh0aGlzLmFjdGlvbk5hbWUpICYmIElzT2JqZWN0KHRoaXMuY29yZS5yZXBvLm1vZGVsLmFjdGlvbiwgW3RoaXMuYWN0aW9uTmFtZV0pICYmIElzT2JqZWN0KHRoaXMuY29yZS5yZXBvLm1vZGVsLmFjdGlvblt0aGlzLmFjdGlvbk5hbWVdLCB0cnVlKSkge1xuICAgICAgICB0aGlzLmFjdGlvbiA9IHRoaXMuY29yZS5yZXBvLm1vZGVsLmFjdGlvblt0aGlzLmFjdGlvbk5hbWVdO1xuICAgICAgICBpZiAoIShJc0RlZmluZWQodGhpcy5hY3Rpb24ucmVzcG9uc2VUeXBlKSkpIHRoaXMuYWN0aW9uLnJlc3BvbnNlVHlwZSA9ICdmb3JtJztcbiAgICAgICAgdGhpcy5kb20uc3RhdGUuaGFzQ29tcG9uZW50ID0gSXNPYmplY3QodGhpcy5hY3Rpb24uY29tcG9uZW50LCBbJ3R5cGUnXSk7XG5cbiAgICAgICAgdGhpcy5kb20uc3RhdGUuaGFzRmllbGRzID0gSXNPYmplY3QodGhpcy5hY3Rpb24uZmllbGRzLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRvbS5zdGF0ZS5oYXNDb21wb25lbnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUuaGFzRmllbGRzID0gZmFsc2U7XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogQSBoZWxwZXIgbWV0aG9kIHRoYXQgc2V0cyBidWlsZCB0aGUgZmllbGQgaXRlbSBkZWZpbml0aW9uc1xuICAgKiBAcGFyYW0gZW50aXR5Q29uZmlnXG4gICAqIEBwYXJhbSBnb1RvVXJsXG4gICAqL1xuICBwcml2YXRlIF9zZXRGaWVsZEl0ZW1zKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoSXNPYmplY3QodGhpcy5hY3Rpb24sIFsnZmllbGRzJ10pICYmIElzT2JqZWN0KHRoaXMuYWN0aW9uLmZpZWxkcywgdHJ1ZSkpIHtcblxuICAgICAgICBjb25zdCBhY3Rpb25GaWVsZEl0ZW1zID0ge307XG4gICAgICAgIHRoaXMuYXNzZXQuZmllbGRJdGVtcyA9IFtdO1xuICAgICAgICB0aGlzLmFzc2V0LmZpZWxkSXRlbU1hcCA9IHt9O1xuICAgICAgICBsZXQgbmVlZHNSZXNvdXJjZSA9IGZhbHNlO1xuXG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMuYWN0aW9uLmZpZWxkcykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgbGV0IGZpZWxkID0gPEZpZWxkSW50ZXJmYWNlPnt9O1xuICAgICAgICAgIGlmICghdGhpcy5hY3Rpb24uYmxvY2tFbnRpdHkgJiYgbmFtZSBpbiB0aGlzLmNvcmUucmVwby5tb2RlbC5maWVsZCkge1xuICAgICAgICAgICAgZmllbGQgPSA8YW55PnRoaXMuY29yZS5yZXBvLm1vZGVsLmZpZWxkW25hbWVdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgbW9kZWwgPSA8YW55Pnt9O1xuXG4gICAgICAgICAgaWYgKGZpZWxkLndoZW4pIG1vZGVsLndoZW4gPSBKc29uQ29weShmaWVsZC53aGVuKTtcblxuICAgICAgICAgIGlmIChJc09iamVjdChmaWVsZC5tb2RlbCwgdHJ1ZSkpIHtcbiAgICAgICAgICAgIG1vZGVsID0gey4uLm1vZGVsLCAuLi5maWVsZC5tb2RlbH07XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBhY3Rpb25UcmFuc2Zvcm1hdGlvbjtcbiAgICAgICAgICBpZiAoSXNPYmplY3QodGhpcy5hY3Rpb24uZmllbGRzW25hbWVdLCB0cnVlKSkge1xuICAgICAgICAgICAgYWN0aW9uVHJhbnNmb3JtYXRpb24gPSBJc1N0cmluZyh0aGlzLmFjdGlvbi5maWVsZHNbbmFtZV0udHJhbnNmb3JtYXRpb24sIHRydWUpID8gdGhpcy5hY3Rpb24uZmllbGRzW25hbWVdLnRyYW5zZm9ybWF0aW9uIDogbnVsbDtcbiAgICAgICAgICAgIG1vZGVsID0gey4uLm1vZGVsLCAuLi50aGlzLmFjdGlvbi5maWVsZHNbbmFtZV19O1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBkZWxldGUgbW9kZWwubWV0YWRhdGE7XG4gICAgICAgICAgZGVsZXRlIG1vZGVsLnRyYW5zZm9ybWF0aW9uO1xuICAgICAgICAgIGlmIChhY3Rpb25UcmFuc2Zvcm1hdGlvbikgbW9kZWwudHJhbnNmb3JtYXRpb24gPSBhY3Rpb25UcmFuc2Zvcm1hdGlvbjsgLy8gb25seSB3YW50IHRvIGFwcGx5IHRyYW5zZm9ybWF0aW9uIGlmIGl0IHdhcyBzZXQgZGlyZWN0bHkgb24gYWN0aW9uXG5cbiAgICAgICAgICBtb2RlbC52YWx1ZSA9IElzRGVmaW5lZChtb2RlbC52YWx1ZSkgPyBQYXJzZU1vZGVsVmFsdWUobW9kZWwudmFsdWUsIHRoaXMuY29yZSkgOiBudWxsO1xuICAgICAgICAgIC8vIG1vZGVsLnZhbHVlID0gSXNEZWZpbmVkKCBtb2RlbC52YWx1ZSApID8gUGFyc2VNb2RlbFZhbHVlKG1vZGVsLnZhbHVlLCBjb3JlKSA6IG51bGw7XG4gICAgICAgICAgaWYgKCFtb2RlbC52YWx1ZSAmJiBJc09iamVjdChtb2RlbC5vcHRpb25zLCBbJ2RlZmF1bHRWYWx1ZSddKSkge1xuICAgICAgICAgICAgbW9kZWwudmFsdWUgPSBQYXJzZU1vZGVsVmFsdWUobW9kZWwub3B0aW9ucy5kZWZhdWx0VmFsdWUsIHRoaXMuY29yZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG1vZGVsLmhpZGRlbiA9ICFFdmFsdWF0ZVdoZW5Db25kaXRpb25zKHRoaXMuY29yZSwgbW9kZWwud2hlbiwgdGhpcy5jb3JlKTtcblxuICAgICAgICAgIGlmIChJc09iamVjdCh0aGlzLmV4dGVuc2lvbiwgdHJ1ZSkgJiYgbW9kZWwubmFtZSBpbiB0aGlzLmV4dGVuc2lvbikge1xuICAgICAgICAgICAgbW9kZWwudmFsdWUgPSBQYXJzZU1vZGVsVmFsdWUodGhpcy5leHRlbnNpb25bbW9kZWwubmFtZV0pO1xuICAgICAgICAgICAgbW9kZWwucmVhZG9ubHkgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5hc3NldC5lbnRpdHlbbW9kZWwubmFtZV0gPSBtb2RlbC52YWx1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBtb2RlbC50YWJPbkVudGVyID0gdHJ1ZTtcbiAgICAgICAgICBhY3Rpb25GaWVsZEl0ZW1zW25hbWVdID0gbW9kZWw7XG4gICAgICAgICAgaWYgKG1vZGVsLm9wdGlvbnMgJiYgbW9kZWwub3B0aW9ucy5yZXNvdXJjZSkge1xuICAgICAgICAgICAgbmVlZHNSZXNvdXJjZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuXG4gICAgICAgIC8vIGlmIG5lZWRzTWV0YWRhdGEgZ28gZ3JhYiBpdCBiZWZvcmUgeW91IHRyeSB0byBidWlsZCBvdXQgdGhlIGZpZWxkc1xuICAgICAgICBpZiAobmVlZHNSZXNvdXJjZSkge1xuICAgICAgICAgIGNvbnN0IHJlc291cmNlID0gYXdhaXQgdGhpcy5jb3JlLnJlcG8uZ2V0VWlSZXNvdXJjZSh0aGlzLmNvcmUpO1xuICAgICAgICAgIGlmIChJc09iamVjdChyZXNvdXJjZSwgdHJ1ZSkpIERlZXBNZXJnZSh0aGlzLmNvcmUucmVzb3VyY2UsIHJlc291cmNlKTtcbiAgICAgICAgICBQb3BMb2cuaW5pdCh0aGlzLm5hbWUsIGBkb0FjdGlvbjpuZWVkZWQgcmVzb3VyY2VgLCByZXNvdXJjZSk7XG4gICAgICAgICAgT2JqZWN0LmtleXMoYWN0aW9uRmllbGRJdGVtcykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmaWVsZEl0ZW0gPSBhY3Rpb25GaWVsZEl0ZW1zW25hbWVdO1xuICAgICAgICAgICAgY29uc3QgYWN0aW9uSXRlbU1vZGVsID0gRmllbGRJdGVtTW9kZWwodGhpcy5jb3JlLCBKc29uQ29weShmaWVsZEl0ZW0pLCBmYWxzZSk7XG4gICAgICAgICAgICBjb25zdCBhY3Rpb25JdGVtID0gdGhpcy5zcnYuZmllbGQuYnVpbGRDb3JlRmllbGRJdGVtKHRoaXMuY29yZSwgYWN0aW9uSXRlbU1vZGVsKTtcbiAgICAgICAgICAgIGlmIChJc09iamVjdChhY3Rpb25JdGVtLmNvbmZpZywgdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgYWN0aW9uSXRlbS5jb25maWcuZmFjYWRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgaWYgKElzT2JqZWN0KGFjdGlvbkl0ZW0uY29uZmlnLnBhdGNoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGNoID0gPEZpZWxkSXRlbVBhdGNoSW50ZXJmYWNlPmFjdGlvbkl0ZW0uY29uZmlnLnBhdGNoO1xuICAgICAgICAgICAgICAgIHBhdGNoLmR1cmF0aW9uID0gMDtcbiAgICAgICAgICAgICAgICBwYXRjaC5wYXRoID0gbnVsbDtcbiAgICAgICAgICAgICAgICBwYXRjaC5kaXNwbGF5SW5kaWNhdG9yID0gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYXNzZXQuZmllbGRJdGVtTWFwW25hbWVdID0gdGhpcy5hc3NldC5maWVsZEl0ZW1zLmxlbmd0aDtcbiAgICAgICAgICAgIHRoaXMuYXNzZXQuZmllbGRJdGVtcy5wdXNoKGFjdGlvbkl0ZW0pO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gbm8gbWV0YWRhdGEgd2FzIG5lZWRlZCBmb3IgYW55IG9mIHRoZXNlIGZpZWxkc1xuICAgICAgICAgIE9iamVjdC5rZXlzKGFjdGlvbkZpZWxkSXRlbXMpLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWN0aW9uSXRlbU1vZGVsID0gRmllbGRJdGVtTW9kZWwodGhpcy5jb3JlLCBhY3Rpb25GaWVsZEl0ZW1zW25hbWVdLCBmYWxzZSk7XG4gICAgICAgICAgICBjb25zdCBhY3Rpb25JdGVtID0gdGhpcy5zcnYuZmllbGQuYnVpbGRDb3JlRmllbGRJdGVtKHRoaXMuY29yZSwgYWN0aW9uSXRlbU1vZGVsKTtcbiAgICAgICAgICAgIGlmIChJc09iamVjdChhY3Rpb25JdGVtLmNvbmZpZywgdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgYWN0aW9uSXRlbS5jb25maWcuZmFjYWRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgaWYgKElzT2JqZWN0KGFjdGlvbkl0ZW0uY29uZmlnLnBhdGNoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGNoID0gPEZpZWxkSXRlbVBhdGNoSW50ZXJmYWNlPmFjdGlvbkl0ZW0uY29uZmlnLnBhdGNoO1xuICAgICAgICAgICAgICAgIHBhdGNoLmR1cmF0aW9uID0gMDtcbiAgICAgICAgICAgICAgICBwYXRjaC5wYXRoID0gbnVsbDtcbiAgICAgICAgICAgICAgICBwYXRjaC5kaXNwbGF5SW5kaWNhdG9yID0gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYXNzZXQuZmllbGRJdGVtTWFwW25hbWVdID0gdGhpcy5hc3NldC5maWVsZEl0ZW1zLmxlbmd0aDtcbiAgICAgICAgICAgIHRoaXMuYXNzZXQuZmllbGRJdGVtcy5wdXNoKGFjdGlvbkl0ZW0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIFBvcFRlbXBsYXRlLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3RoaXMuYXNzZXQuZmllbGRJdGVtcycsIHRoaXMuYXNzZXQuZmllbGRJdGVtcyk7XG4gICAgICAgIHRoaXMuYXNzZXQuZmllbGRJdGVtcy5tYXAoKGZpZWxkSXRlbSkgPT4ge1xuICAgICAgICAgIGlmIChJc0FycmF5KFN0b3JhZ2VHZXR0ZXIoZmllbGRJdGVtLCBbJ2NvbmZpZycsICdvcHRpb25zJywgJ3ZhbHVlcyddKSwgdHJ1ZSkpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdoZXJlJywgZmllbGRJdGVtKTtcbiAgICAgICAgICAgICg8YW55PmZpZWxkSXRlbSkuY29uZmlnLmhlaWdodCA9IDE4MDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuXG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIERldGVybWluZSBpZiBmaWVsZCBzaG91bGQgYmUgYXV0byBmaWxsZWQgd2l0aCB0aGUgZmlyc3QgaXRlbSBpbiB0aGUgbGlzdFxuICAgKiBAcGFyYW0gbmFtZVxuICAgKi9cbiAgcHJpdmF0ZSBfZmllbGRIYXNBdXRvRmlsbChuYW1lOiBzdHJpbmcpIHtcbiAgICBpZiAobmFtZSBpbiB0aGlzLmFzc2V0LmZpZWxkSXRlbU1hcCAmJiB0aGlzLmFzc2V0LmZpZWxkSXRlbXNbdGhpcy5hc3NldC5maWVsZEl0ZW1NYXBbbmFtZV1dLm1vZGVsICYmIHRoaXMuYXNzZXQuZmllbGRJdGVtc1t0aGlzLmFzc2V0LmZpZWxkSXRlbU1hcFtuYW1lXV0ubW9kZWwub3B0aW9ucykge1xuICAgICAgaWYgKHRoaXMuYXNzZXQuZmllbGRJdGVtc1t0aGlzLmFzc2V0LmZpZWxkSXRlbU1hcFtuYW1lXV0ubW9kZWwuYXV0b0ZpbGwpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIGlmIGZpZWxkIGhhcyBhIGNoaWxkIHJlbGF0aW9uIGluIHRoZSBsaXN0XG4gICAqIEBwYXJhbSBuYW1lXG4gICAqL1xuICBwcml2YXRlIF9maWVsZEhhc0NoaWxkKG5hbWU6IHN0cmluZykge1xuICAgIGlmIChuYW1lIGluIHRoaXMuYXNzZXQuZmllbGRJdGVtTWFwICYmIHRoaXMuYXNzZXQuZmllbGRJdGVtc1t0aGlzLmFzc2V0LmZpZWxkSXRlbU1hcFtuYW1lXV0ubW9kZWwgJiYgdGhpcy5hc3NldC5maWVsZEl0ZW1zW3RoaXMuYXNzZXQuZmllbGRJdGVtTWFwW25hbWVdXS5tb2RlbC5vcHRpb25zKSB7XG4gICAgICBpZiAodGhpcy5hc3NldC5maWVsZEl0ZW1zW3RoaXMuYXNzZXQuZmllbGRJdGVtTWFwW25hbWVdXS5tb2RlbC5vcHRpb25zLmNoaWxkKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdldCBhIGxpbmVhciBsaXN0IG9mIHRoZSBwYXJlbnQgY2hpbGQgcmVsYXRpb25zIGZyb20gYSBnaXZlbiBwb2ludFxuICAgKiBAcGFyYW0gc2VsZiB0aGUgbmFtZSB0byBzdGFydCBmcm9tICh1c3VhbGx5IHRoZSBmaWVsZCB0aGF0IGhhcyBqdXN0IGJlZW4gY2hhbmdlZCBieSB1c2VyKVxuICAgKiBAcGFyYW0gbGlzdFxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0UmVsYXRpb25MaXN0KG5hbWU6IHN0cmluZywgbGlzdDogYW55W10gPSBbXSkgeyAvLyByZWN1cnNpdmUgbG9vcFxuICAgIGxldCBpdGVtO1xuICAgIGlmIChuYW1lICYmIG5hbWUgaW4gdGhpcy5hc3NldC5maWVsZEl0ZW1NYXApIHtcbiAgICAgIGl0ZW0gPSB0aGlzLmFzc2V0LmZpZWxkSXRlbXNbdGhpcy5hc3NldC5maWVsZEl0ZW1NYXBbbmFtZV1dO1xuICAgICAgaWYgKElzT2JqZWN0KGl0ZW0sIFsnY29uZmlnJywgJ21vZGVsJ10pKSB7XG4gICAgICAgIGxpc3QucHVzaCh7XG4gICAgICAgICAgbmFtZTogaXRlbS5jb25maWcubmFtZSxcbiAgICAgICAgICBhdXRvRmlsbDogdGhpcy5fZmllbGRIYXNBdXRvRmlsbChuYW1lKSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0aGlzLl9maWVsZEhhc0NoaWxkKG5hbWUpKSB7XG4gICAgICAgICAgdGhpcy5fZ2V0UmVsYXRpb25MaXN0KHRoaXMuYXNzZXQuZmllbGRJdGVtc1t0aGlzLmFzc2V0LmZpZWxkSXRlbU1hcFtuYW1lXV0ubW9kZWwub3B0aW9ucy5jaGlsZCwgbGlzdCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH1cbiAgICByZXR1cm4gbGlzdDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFdoZW5ldmVyIGEgdXBkYXRlIHRvIHRoZSBlbnRpdHkgaGFwcGVucyB0aGUgZmllbGRzIGluIHRoZSBncm91cCBzaG91bGQgYmUgcmUtZXZhbHVhdGVkIGlmIHRoZXJlIGFyZSB3aGVuIGNvbmRpdGlvbmFscyBzZXRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX3Jlc2V0Q29tcG9uZW50TGlzdEhpZGRlbigpIHtcbiAgICBsZXQgbmFtZTtcbiAgICB0aGlzLnRlbXBsYXRlLnJlZnMuZmlsdGVyKChjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxhbnk+KSA9PiB7XG4gICAgICByZXR1cm4gSXNPYmplY3QoY29tcG9uZW50UmVmLmluc3RhbmNlLmNvbmZpZywgdHJ1ZSkgJiYgSXNBcnJheShjb21wb25lbnRSZWYuaW5zdGFuY2Uud2hlbiwgdHJ1ZSk7XG4gICAgfSkubWFwKChjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxhbnk+KSA9PiB7XG4gICAgICBuYW1lID0gY29tcG9uZW50UmVmLmluc3RhbmNlLmNvbmZpZy5uYW1lO1xuICAgICAgaWYgKG5hbWUgJiYgbmFtZSBpbiB0aGlzLmFzc2V0LmZpZWxkSXRlbU1hcCkge1xuICAgICAgICBjb21wb25lbnRSZWYuaW5zdGFuY2UuaGlkZGVuID0gIUV2YWx1YXRlV2hlbkNvbmRpdGlvbih0aGlzLmFzc2V0LCBjb21wb25lbnRSZWYuaW5zdGFuY2Uud2hlbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IHdpbGwgbWFuYWdlIGlmIHRoZSBmb3JtIGZpZWxkcyBoYXZlIHBhcmVudCBjaGlsZCByZWxhdGlvbnMsIGllIGlmIGFuIGFjY291bnQgc2VsZWN0IG5lZWRzIHRvIGJlIGZpbHRlcmVkIGJ5IGEgY2xpZW50IHNlbGVjdCB0aGF0IGV4aXN0cyBpbiB0aGUgZm9ybVxuICAgKiBAcGFyYW0gbmFtZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfdHJpZ2dlclBhcmVudENoaWxkVXBkYXRlcyhuYW1lOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5fZmllbGRIYXNDaGlsZChuYW1lKSkge1xuICAgICAgbGV0IHZhbHVlcztcbiAgICAgIGxldCBjaGlsZF9maztcbiAgICAgIGxldCBjaGlsZEZpZWxkO1xuICAgICAgbGV0IGF1dG9GaWxsID0gZmFsc2U7XG4gICAgICBsZXQgc2V0O1xuICAgICAgbGV0IHJlc291cmNlO1xuICAgICAgY29uc3QgcmVsYXRpb25zID0gdGhpcy5fZ2V0UmVsYXRpb25MaXN0KG5hbWUpO1xuICAgICAgcmVsYXRpb25zLnNvbWUoKHJlbGF0aW9uKSA9PiB7XG4gICAgICAgIGlmIChyZWxhdGlvbi5hdXRvRmlsbCkge1xuICAgICAgICAgIGF1dG9GaWxsID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cblxuICAgICAgaWYgKG5hbWUgJiYgbmFtZSBpbiB0aGlzLmFzc2V0LmZpZWxkSXRlbU1hcCkge1xuICAgICAgICBjaGlsZF9mayA9IHRoaXMuYXNzZXQuZmllbGRJdGVtc1t0aGlzLmFzc2V0LmZpZWxkSXRlbU1hcFtuYW1lXV0ubW9kZWwub3B0aW9ucy5jaGlsZDtcbiAgICAgICAgaWYgKGNoaWxkX2ZrICYmIGNoaWxkX2ZrIGluIHRoaXMuYXNzZXQuZmllbGRJdGVtTWFwKSB7XG4gICAgICAgICAgY2hpbGRGaWVsZCA9IHRoaXMuYXNzZXQuZmllbGRJdGVtc1t0aGlzLmFzc2V0LmZpZWxkSXRlbU1hcFtjaGlsZF9ma11dO1xuICAgICAgICAgIGlmIChjaGlsZEZpZWxkLm1vZGVsLmZvcm0gPT09ICdzZWxlY3QnKSB7XG4gICAgICAgICAgICBpZiAoY2hpbGRGaWVsZC5tb2RlbC5vcHRpb25zLnJlc291cmNlKSB7XG4gICAgICAgICAgICAgIGlmIChJc09iamVjdCh0aGlzLmNvcmUucmVzb3VyY2VbY2hpbGRGaWVsZC5tb2RlbC5vcHRpb25zLnJlc291cmNlXSwgWydkYXRhX3ZhbHVlcyddKSkge1xuICAgICAgICAgICAgICAgIHJlc291cmNlID0gdGhpcy5jb3JlLnJlc291cmNlW2NoaWxkRmllbGQubW9kZWwub3B0aW9ucy5yZXNvdXJjZV0uZGF0YV92YWx1ZXM7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChJc0FycmF5KHJlc291cmNlLCB0cnVlKSkge1xuICAgICAgICAgICAgICB2YWx1ZXMgPSBDb252ZXJ0QXJyYXlUb09wdGlvbkxpc3QocmVzb3VyY2UsIHtcbiAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhhdCBhbiBvcHRpb24gc2hvd3MgdXAgaW4gbGlzdCBpbiBjYXNlIG90aGVyIGNvbmRpdGlvbnMgcmVtb3ZlIGl0LCBha2EgaXQgaGFzIGJlZW4gYXJjaGl2ZWRcbiAgICAgICAgICAgICAgICBwcmV2ZW50OiBbXSwgLy8gYSBsaXN0IG9mIGlkcyB0aGF0IHNob3VsZCBub3QgYXBwZWFyIGluIHRoZSBsaXN0IGZvciB3aGF0ZXZlciByZWFzb25cbiAgICAgICAgICAgICAgICAvLyBwYXJlbnQgbWVhbnMgdGhpcyBvcHRpb25zIHNob3VsZCBhbGwgaGF2ZSBhIGNvbW1vbiBmaWVsZCB0cmFpdCBsaWtlIGNsaWVudF9maywgYWNjb3VudF9mayAuLi4uXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjaGlsZEZpZWxkLm1vZGVsLm9wdGlvbnMucGFyZW50ID8ge1xuICAgICAgICAgICAgICAgICAgZmllbGQ6IGNoaWxkRmllbGQubW9kZWwub3B0aW9ucy5wYXJlbnQsXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5hc3NldC5lbnRpdHlbY2hpbGRGaWVsZC5tb2RlbC5vcHRpb25zLnBhcmVudF1cbiAgICAgICAgICAgICAgICB9IDogbnVsbCxcbiAgICAgICAgICAgICAgICBlbXB0eTogY2hpbGRGaWVsZC5tb2RlbC5vcHRpb25zLmVtcHR5ID8gY2hpbGRGaWVsZC5tb2RlbC5vcHRpb25zLmVtcHR5IDogbnVsbCxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2YWx1ZXMgPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGF1dG9GaWxsICYmIHZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgc2V0ID0gdmFsdWVzW3ZhbHVlcy5sZW5ndGggLSAxXS52YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNldCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGlsZEZpZWxkLmNvbmZpZy5vcHRpb25zLnZhbHVlcyA9IHZhbHVlcztcbiAgICAgICAgICAgIGF1dG9GaWxsID0gYXV0b0ZpbGwgJiYgdmFsdWVzLmxlbmd0aCA/IHZhbHVlc1swXS52YWx1ZSA6IG51bGw7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNoaWxkRmllbGQuY29uZmlnLnRyaWdnZXJPbkNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykgY2hpbGRGaWVsZC5jb25maWcudHJpZ2dlck9uQ2hhbmdlKHNldCk7XG5cbiAgICAgICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoYGNsZWFyLW1lc3NhZ2UtJHtjaGlsZF9ma31gLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgY2hpbGRGaWVsZC5jb25maWcuY2xlYXJNZXNzYWdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRGaWVsZC5jb25maWcuY2xlYXJNZXNzYWdlKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDApO1xuXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3RyaWdnZXJGb3JtVmFsaWRhdGlvbigpO1xuICB9XG5cbn1cbiJdfQ==