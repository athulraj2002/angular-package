import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {EntitySchemeSectionInterface} from '../pop-entity-scheme.model';
import {PopExtendDynamicComponent} from "../../../../pop-extend-dynamic.component";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {
  Dictionary,
  DynamicComponentInterface,
  EntityActionInterface, PopBaseEventInterface,
  PopSchemeComponent,
  SchemeComponentConfig,
  SchemeComponentConfigInterface,
  ServiceInjector
} from "../../../../pop-common.model";
import {PopEntityActionService} from "../../services/pop-entity-action.service";
import {PopTabMenuService} from "../../../base/pop-tab-menu/pop-tab-menu.service";
import {PopDomService} from "../../../../services/pop-dom.service";
import {IsObject, IsString, JsonCopy, PopUid, StorageGetter} from "../../../../pop-common-utility";

@Component({
  selector: 'lib-entity-scheme-custom-component',
  templateUrl: './pop-entity-scheme-custom.component.html',
  styleUrls: ['./pop-entity-scheme-custom.component.scss']
})
export class PopEntitySchemeCustomComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
  @ViewChild('container', {read: ViewContainerRef, static: true}) private container;
  @Input() componentId: number;
  @Input() config: SchemeComponentConfig;
  @Input() section: EntitySchemeSectionInterface;

  public name = 'PopEntitySchemeCustomComponent';

  protected srv = {
    dialog: <MatDialog>ServiceInjector.get(MatDialog),
    action: <PopEntityActionService>ServiceInjector.get(PopEntityActionService),
    tab: <PopTabMenuService>undefined,
  };

  protected asset = {
    dialogRef: <MatDialogRef<any>>undefined
  };


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
    protected _tabRepo: PopTabMenuService
  ) {
    super();

    this.dom.configure = (): Promise<boolean> => {
      return new Promise(async (resolve) => {
        this.template.attach('container');

        await this._setInitialConfig();
        await this._setInitialState();

        return resolve(true);
      });
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise(async (resolve) => {

        if (IsObject(this.config, true)) {
          await this._setInitialProceed();
          await this._renderComponent();
        }

        return resolve(true);
      });
    };
  }

  /**
   * INit
   */
  ngOnInit() {
    super.ngOnInit();
  }

  /**
   * This fx will present a pop up for the user to configure the options of this widget
   */
  onEditComponentOptions() {

    // TODO implement like edit popup
    this.dom.setTimeout(`edit-item`, async () => {
      if (StorageGetter(this.config, ['option', 'component', 'type'], null)) {

        const actionConfig: EntityActionInterface = {
          name: 'widgets',
          header: 'Edit Widget',
          component: <DynamicComponentInterface>{
            type: this.config.option.component.type,
            inputs: {
              config: JsonCopy(this.config)
            }
          },
          // onEvent: (core: CoreConfig, event: PopBaseEventInterface): Promise<boolean> => {
          //   return new Promise(async(resolve) => {
          //     return resolve(true);
          //   });
          // },
          submitText: 'SAVE',
          facade: true,
          postUrl: null,
          blockEntity: true, // implies that fields should not be inherited from the original field.ts file
          responseType: 'store', // track all the key-value pairs that are updated
        };
        const result = await this.srv.action.do(this.core, actionConfig);
        console.log('result', result);
        if (IsObject(result, true)) {
          this.dom.setTimeout(`reset-component`, async () => {
            await this._renderComponent();
            this.log.info(`options-reset:complete`);
          }, 0);

        }
      } else {
        // ToDo:: handle this case
      }
    });
  }

  /**
   * This user can click on a refresh icon to refresh the widget
   */
  onRefreshComponent() {
    this.dom.state.loaded = false;
    this.dom.state.loader = true;
    this.template.clear();
    this.dom.setTimeout(`refresh-component`, async () => {
      await this._renderComponent();
    }, 500);
  }

  /**
   * Handle the bubble events that come up
   * @param event
   */
  onBubbleEvent(name: string, extension?: Dictionary<any>, event?: PopBaseEventInterface): boolean {
    if (!event) event = {source: this.name, type: 'field', name: name};
    if (extension) event = {...event, ...extension};
    this.log.event(`bubbleEvent`, event);
    this.events.emit(event);
    return true;
  }

  /**
   * Clean up the dom of this component
   */
  ngOnDestroy() {
    super.ngOnDestroy();
  }

  /************************************************************************************************
   *                                                                                              *
   *                                   Base Protected Methods                                     *
   *                                    ( Protected Method )                                      *
   *                                                                                              *
   ************************************************************************************************/

  /**
   * Set the initial config
   * Intended to be overridden per field
   */
  protected _setInitialConfig(): Promise<boolean> {
    return new Promise((resolve) => {
      this.id = IsObject(this.config, ['id']) ? this.config.id : PopUid();
      if (!IsString(this.internal_name)) this.internal_name = 'profile_specialist_1';
      if (!IsObject(this.config, true)) {
        const params = PopSchemeComponent.getParams(this.internal_name);
        this.config = new SchemeComponentConfig(<SchemeComponentConfigInterface>{
          name: params.name ? params.name : 'Custom Component',
          internal_name: this.internal_name,
          component_id: this.componentId,
          component: PopSchemeComponent.getComponent(this.internal_name),
          option: PopSchemeComponent.getOption(this.internal_name),
          setting: PopSchemeComponent.getOption(this.internal_name),
          resource: PopSchemeComponent.getResource(this.internal_name),
          param: PopSchemeComponent.getResource(this.internal_name),
        });
      }

      return resolve(true);
    });
  }

  /**
   * Set the initial config
   * Intended to be overridden per field
   */
  protected _setInitialState(): Promise<boolean> {
    return new Promise((resolve) => {

      const isOptionComponent = StorageGetter(this.config, ['option', 'component']);
      this.dom.state.hasOptions = this.config.setting.edit && isOptionComponent && isOptionComponent.type ? true : false;
      this.dom.state.hasRefresh = this.config.setting.refresh;
      this.dom.state.isEditable = this.config.setting.edit ? true : false;


      // const userPreferences = StorageGetter( this.core, ['preference', this.config.id], {} );
      // if( IsObject( userPreferences, true ) ){
      //   this.config.option = { ...this.config.option, ...userPreferences.option };
      // }


      return resolve(true);
    });
  }

  /**
   * Set the initial config
   * Intended to be overridden per field
   */
  protected _setInitialProceed(): Promise<boolean> {
    return new Promise((resolve) => {


      return resolve(true);
    });
  }


  /**
   * This fx will render the custom component for this widget
   * @private
   */
  private _renderComponent(): Promise<boolean> {
    return new Promise((resolve) => {
      this.dom.setTimeout(`render-widget`, () => {
        if (IsObject(this.config.component, ['type'])) {
          this.template.render([this.config.component], ['core', 'position', 'config']);
        }
        this.dom.ready();
      }, 0);
      return resolve(true);
    });
  }


}
