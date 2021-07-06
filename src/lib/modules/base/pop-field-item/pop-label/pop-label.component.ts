import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { LabelConfig } from './label-config.model';
import { TruncatePipe } from '../../../../pipes/truncate.pipe';
import { ButtonConfig } from '../pop-button/button-config.model';
import { Router } from '@angular/router';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { GetVerbStateTheme, IsObjectThrowError, StringReplaceAll } from '../../../../pop-common-utility';
import { PopHref, ServiceInjector } from '../../../../pop-common.model';


@Component({
  selector: 'lib-pop-label',
  templateUrl: './pop-label.component.html',
  styleUrls: [ './pop-label.component.scss' ],
})
export class PopLabelComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
  @Input() config: LabelConfig;
  public name = 'PopLabelComponent';


  constructor(
    public el: ElementRef,
  ){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {
        this.config = IsObjectThrowError(this.config, true, `${this.name}:configure: - this.config`) ? this.config : null;

        this.ui.copyLabel = <ButtonConfig>undefined;
        this.ui.copyValue = <ButtonConfig>undefined;
        this.ui.valueButton = <ButtonConfig>undefined;
        this.dom.state.valueButton_theme = 'default';

        if( this.config.truncate ){
          const truncatePipe = new TruncatePipe();
          this.config.value = truncatePipe.transform(this.config.value, [ this.config.truncate ]);
        }
        if( this.config.copyLabel ) this.ui.copyLabel = new ButtonConfig({
          // disabled: !this.config.copyLabelBody ? true : false,
          disabled: false,
          icon: this.config.copyLabelBody ? 'file_copy' : null,
          value: this.config.copyLabelDisplay,
          size: 25,
          width: 100,
          radius: 5,
          text: 12,
        });
        if( this.config.copyValue ) this.ui.copyValue = new ButtonConfig({
          // disabled: !this.config.copyValueBody ? true : false,
          disabled: false,
          icon: this.config.copyValueBody ? 'file_copy' : null,
          value: this.config.copyValueDisplay,
          size: 25,
          radius: 5,
          text: 12,
        });

        if( this.config.valueButton ) this.ui.valueButton = new ButtonConfig({
          disabled: this.config.valueButtonDisabled ? true : false,
          icon: this.config.icon,
          value: this.config.valueButtonDisplay,
          size: 25,
          radius: 5,
          text: 12,
          bubble: true,
          event: 'click'
        });
        this._setValueButtonTheme();

        resolve(true);
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
   * The user can click on a link to route to another part of the app
   */
  onRouteLink(){
    if( this.config.route ){
      const routeApp = String(this.config.route).split('/');
      if( routeApp[ 1 ] && routeApp[ 1 ] === PopHref ){
        return ServiceInjector.get(Router).navigate([ routeApp.slice(2).join('/') ]).catch((e) => {
          console.log(e);
          return false;
        });
      }
    }
    return this.onBubbleEvent('link');
  }


  /**
   * The user can click on a label button to copy a value into the clipboard
   */
  onLabelCopy(){
    const nav = <any>navigator;
    const strip = [ 'ID ' ];
    let body = String(this.config.copyLabelBody).slice();
    strip.map((tag) => {
      if( body.includes(tag) ) body = StringReplaceAll(body, tag, '');
    });
    nav.clipboard.writeText(body);
  }


  /**
   * The user can click on a button value and copy a value to the clipboard
   */
  onValueCopy(){
    const nav = <any>navigator;
    const strip = [ 'ID ' ];
    let body = String(this.config.copyValueBody).slice();
    strip.map((tag) => {
      if( body.includes(tag) ) body = StringReplaceAll(body, tag, '');
    });
    nav.clipboard.writeText(body);
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
   * This fx basically checks the label value to sees if it can be associated with a color scheme aka warning, success, error
   */
  protected _setValueButtonTheme(){
    if( this.config.valueButton ){
      if( this.config.valueButtonDisplay ){
        this.dom.state.valueButton_theme = GetVerbStateTheme(this.config.valueButtonDisplay);
      }
    }
  }

}
