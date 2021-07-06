import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';

import { TextareaConfig } from './textarea-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { Sleep } from '../../../../pop-common-utility';


@Component({
  selector: 'lib-pop-textarea',
  templateUrl: './pop-textarea.component.html',
  styleUrls: [ './pop-textarea.component.scss' ]
})
export class PopTextareaComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
  @ViewChild('textArea', { static: true }) private textAreaRef: ElementRef;
  @Input() config: TextareaConfig;
  public name = 'PopTextareaComponent';


  constructor(
    public el: ElementRef,
    private renderer: Renderer2,
  ){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {
        if( this.config.autoSize ){
          this.dom.setSubscriber('auto-size', this.config.control.valueChanges.subscribe(() => {
            this.onAutoSize();
          }));
        } else{
          if(+this.config.height){
            this.renderer.setStyle(this.textAreaRef.nativeElement, 'height', this.config.height + 'px');
          }
        }
        resolve(true);
      });
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise(async(resolve) => {
        if( this.config.autoSize && this.config.control.value){
          await Sleep(5);
          this.onAutoSize();
        }
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
   * Trigger on key up event
   */
  onKeyUp(): void{
    this.onBubbleEvent(`onKeyUp`);
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


  protected onAutoSize(){
    this.dom.setTimeout('size-delay', () => {
      this.renderer.setStyle(this.textAreaRef.nativeElement, 'height', '0');
      let height = this.textAreaRef.nativeElement.scrollHeight;
      if(+this.config.height && height < this.config.height) height = this.config.height;
      if(+this.config.maxHeight && height > this.config.maxHeight) height = this.config.maxHeight;
      this.renderer.setStyle(this.textAreaRef.nativeElement, 'height', height +'px');
    }, 250);
  }
}
