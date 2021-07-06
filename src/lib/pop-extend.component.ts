import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {
  CoreConfig,
  EntityExtendInterface,
  EventPromiseCallback,
  PopBaseEventInterface,
  PopEnv,
  PopTemplate
} from './pop-common.model';

import {
  HasEvents,
  HasCore,
  ComponentTraitContainerInterface,
  ComponentDomInterface,
  GetComponentAssetContainer,
  GetComponentTraitContainer,
  DestroyComponentDom,
  GetComponentDomContainer,
  ComponentLogInterface,
} from './pop-common-dom.models';

import {Subscription} from 'rxjs';
import {
  GetHttpErrorMsg,
  IsArray,
  IsCallableFunction,
  IsObject,
  IsString,
  JsonCopy,
  StorageGetter,
} from './pop-common-utility';
import {PopDomService} from './services/pop-dom.service';
import {PopTabMenuService} from './modules/base/pop-tab-menu/pop-tab-menu.service';
import {EvaluateWhenConditions, IsValidFieldPatchEvent} from './modules/entity/pop-entity-utility';
import {HttpErrorResponse} from '@angular/common/http';


@Component({
  selector: 'lib-pop-base-component',
  template: `Base Component`,
})
export class PopExtendComponent implements HasEvents, HasCore, OnInit, OnDestroy {
  @Input() position = 1;
  @Input() core: CoreConfig = <CoreConfig>{};
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();
  @Input() extension: EntityExtendInterface;

  @Input() onLoad?: EventPromiseCallback;
  @Input() onEvent?: EventPromiseCallback;
  @Input() onUnload?: EventPromiseCallback;

  @Input() when: any[] = null;
  @HostBinding('class.sw-hidden') @Input() hidden = false;

  name: string;
  internal_name: string;
  protected id: string | number = 1;

  protected el: ElementRef;
  protected trait = <ComponentTraitContainerInterface>GetComponentTraitContainer();
  protected asset;
  protected srv;
  protected _domRepo: PopDomService;
  protected _tabRepo: PopTabMenuService;

  /**
   * The Dom is boiler plate for managing the state and assets of the html view
   */
  public dom: ComponentDomInterface;

  public log: ComponentLogInterface;

  /**
   * The ui is a container for assets that are created for the html view specifically
   */
  public ui;


  constructor() {
    if (!this.asset) this.asset = GetComponentAssetContainer();
    if (!this.ui) this.ui = GetComponentAssetContainer();
    this.log = this._initializeLogSystem();
    this.dom = this._initializeDom();
  }


  ngOnInit() {
    this.dom.loading();
    const init = new Promise<boolean>(async (resolve) => {
      await this.dom._extend();
      await this.dom.configure();
      await this.dom.register();
      await this.dom.proceed();
      if (IsCallableFunction(this.onLoad)) {
        await this.onLoad(this.core, <PopBaseEventInterface>{
          source: this.name,
          type: 'component',
          name: 'onLoad',
          data: this
        }, this.dom);
      }
      this.dom.ready();
      return resolve(true);
    });

    init.then(() => {
      this.log.init();
    });
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy() {
    const destroy = new Promise<boolean>(async (resolve) => {
      if (IsCallableFunction(this.onUnload)) {
        await this.onUnload(this.core, <PopBaseEventInterface>{
          source: this.name,
          type: 'component',
          name: 'onUnload',
          data: this
        });
      }
      await this.dom.unload();
      if (this.dom.repo) this.dom.store();
      this.dom.destroy();

      return resolve(true);
    });
    destroy.then(() => {
      this.log.destroy();
    });
  }

  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  private _initializeDom(): ComponentDomInterface {
    return <ComponentDomInterface>{
      ...GetComponentDomContainer(), ...{
        /**
         * Initialize the component in a loading state
         */
        loading: () => {
          this.dom.error = {code: 0, message: ''};
          this.dom.state.loading = true;
          this.dom.state.loader = false;
          this.dom.setTimeout('delay-loader-trigger', () => {
            this.dom.state.loader = true;
          }, 500);
        },

        /**
         * Configure the component tailored to its specific needs
         */
        _extend: (): Promise<boolean> => {
          return new Promise((resolve) => {
            const repos = Object.keys(this).filter((key: string) => String(key).startsWith('_') && String(key).endsWith('Repo') && String(key).length > 6 && IsObject(this[key], true));
            if (IsArray(repos, true)) {
              if (!(IsObject(this.srv))) this.srv = {};
              repos.map((repoName: string) => {
                const srvName = repoName.replace('_', '').replace('Repo', '');
                // this.log.info( `Transferred ${repoName} to srv container as ${srvName}` );
                if (srvName === 'dom') {
                  this.dom.repo = this[repoName];
                } else {
                  this.srv[srvName] = this[repoName];
                }
                delete this[repoName];
              });
            }
            return resolve(true);
          });
        },

        /**
         * Configure the component tailored to its specific needs
         */
        configure: (): Promise<boolean> => {
          return new Promise((resolve) => {
            return resolve(true);
          });
        },

        /**
         * Configure the component tailored to its specific needs
         */
        proceed: (): Promise<boolean> => {
          return new Promise((resolve) => {
            return resolve(true);
          });
        },


        /**
         * Trigger the view to render
         */
        ready: () => {
          this.dom.setTimeout('delay-loader-trigger', null);
          this.dom.state.loading = false;
          this.dom.state.loaded = true;
          this.dom.state.loader = false;
          this.dom.state.refresh = false;
          if (IsArray(this.when, true)) {
            this.log.info(`eval when`, this.when);
            this.hidden = !EvaluateWhenConditions(this.core, this.when, this.core);
          }
        },

        /**
         * Trigger the view to refresh
         */
        refreshing: () => {
          this.dom.state.refresh = true;
        },


        /**
         * Register this component in the PopDomService so that session, state, etc can be preserved
         * It will also bind events to the appropriate handlers
         * CoreConfig is obviously something that you must have for any of this to work
         */
        register: (): Promise<boolean> => {
          return new Promise<boolean>(async (resolve) => {
            if (this.el && !this.dom.width.outer) this.dom.width.outer = this.el.nativeElement.getBoundingClientRect().width;
            if (IsObject(this.core, true)) {
              if (IsObject(this.core.access, true)) this.dom.access = JsonCopy(this.core.access);
              if (typeof this.dom.handler.core === 'function' || IsArray(this.when, true)) {
                this.dom.setSubscriber('on-core-event', this.core.channel.subscribe(async (event: PopBaseEventInterface) => {
                  // if( event.source !== this.name ){
                  if (IsValidFieldPatchEvent(this.core, event) && IsArray(this.when)) {
                    this.log.info('eval when', this.when);
                    this.dom.setTimeout('eval-when', () => {
                      this.hidden = !EvaluateWhenConditions(this.core, this.when, this.core);
                    }, 50);
                  }

                  if (event.source && event.target) {
                    if (event.source && event.source === this.name) return;
                    if (event.target && String(event.target).search(this.name) === -1) return;
                  }
                  if (IsCallableFunction(this.dom.handler.core)) this.dom.handler.core(IsObject(this.core, true) ? this.core : null, event);
                  // }
                }));
              }
            }

            if (this.name && typeof this.id !== 'undefined') {
              if (this.dom.repo && typeof this.dom.repo.onRegister === 'function') {
                this.dom.repo.onRegister(this);
              }
            }

            if (IsCallableFunction(this.onEvent)) {
              this.dom.setSubscriber(`on-event`, this.events.subscribe(async (event: PopBaseEventInterface) => {
                await this.onEvent(this.core, event, this.dom);
                this.log.event(this.name, event);
              }));
            }
            return resolve(true);
          });
        },


        find: (assetType: 'component' | 'field' | 'el', name: string | number, id: string | number = 1): any => {
          let asset = null;
          if (assetType === 'field') {
            const fieldRepo = StorageGetter(this.dom, ['repo', 'ui', 'fields']);
            asset = fieldRepo.get(name);
            asset = StorageGetter(asset, ['inputs', 'config']);
          } else if (assetType === 'component') {
            asset = StorageGetter(this.dom, ['repo', 'components', String(name)]);
            if (IsObject(asset) && id in asset) {
              asset = asset[id];
            } else {
              asset = null;
            }
          } else if (this.el && assetType === 'el') {
            asset = this.el.nativeElement.querySelector(name);
          }

          return asset;
        },

        focus: (querySelector: string, delay: 50): void => {
          if (this.el && IsString(querySelector, true)) {
            this.dom.setTimeout('focus-child-element-delay', () => {
              this.dom.setTimeout('focus-child-element', () => {
                const childEl = this.el.nativeElement.querySelector(querySelector);
                if (childEl) {
                  childEl.focus();
                }
              }, 0);
            }, delay);
          }
        },

        setError(err: HttpErrorResponse = null, modal = false) {
          if (IsObject(err)) {
            if (modal) {
              PopTemplate.error({code: (err.status ? err.status : 422), message: GetHttpErrorMsg(err)});
            } else {
              this.dom.error.code = err.status ? err.status : 422;
              this.dom.error.message = GetHttpErrorMsg(err);
            }
          } else {
            this.dom.error.message = '';
          }
        },

        /**
         * Configure operations that need to happen when this component is going to be destroyed
         */
        unload: (): Promise<boolean> => {
          return new Promise<boolean>(async (resolve) => {
            return resolve(true);
          });
        },
        /**
         * Preferred method of setting a subscriber
         * @param subscriptionKey
         * @param subscription
         */
        setSubscriber: (subscriptionKey: string, subscription: Subscription = null) => {
          if (subscriptionKey && this.dom.subscriber && subscriptionKey in this.dom.subscriber && this.dom.subscriber[subscriptionKey] && typeof this.dom.subscriber[subscriptionKey].unsubscribe === 'function') {
            this.dom.subscriber[subscriptionKey].unsubscribe();
          }
          if (subscription) {
            this.dom.subscriber[subscriptionKey] = subscription;
          }
        },
        /**
         * Preferred method of setting a timeout
         * @param timeoutKey
         * @param callback
         * @param delay
         */
        setTimeout: (timeoutKey: string, callback = null, delay = 250) => {
          if (timeoutKey && this.dom.delay && timeoutKey in this.dom.delay && this.dom.delay[timeoutKey]) {
            clearTimeout(this.dom.delay[timeoutKey]);
          }
          if (typeof callback === 'function') {
            this.dom.delay[timeoutKey] = setTimeout(callback, delay);
          }
        },

        setHeight: (parentHeight: number, overhead: number) => {
          if (this.name && parentHeight > 0) {
            this.dom.overhead = overhead;
            this.dom.height = {
              outer: parentHeight,
              inner: parentHeight - overhead,
              split: +((parentHeight - overhead) / 2),
              default: 0
            };
          }
        },

        setHeightWithParent: (parentClassName: string = null, overhead: number = 0, defaultHeight: number): Promise<boolean> => {
          return new Promise((resolve) => {
            if (this.el) {
              this.dom.waitForParent(this.el, parentClassName, 10, 10).then((parentEl: Element) => {
                if (parentEl) {
                  this.dom.waitForParentHeight(parentEl).then((parentHeight: number) => {
                    if (parentHeight < defaultHeight) parentHeight = defaultHeight;
                    if (parentHeight) {
                      this.dom.setHeight(+parentHeight, overhead);
                      resolve(true);
                    } else {
                      this.dom.setHeight(defaultHeight, overhead);
                      resolve(true);
                    }
                  });
                } else {
                  this.dom.setHeight(defaultHeight, overhead);
                  resolve(true);
                }
              });
            } else {
              resolve(false);
            }
          });
        },

        focusNextInput(el: ElementRef): void {
          if (el) {
            let limit = 5;
            let input = null;
            let next = el.nativeElement.nextElementSibling;
            while (limit && !input) {
              input = next.querySelector('input[type=text]');
              if (!input) {
                input = next.querySelector('input[type=checkbox]');
              }
              if (!input) {
                input = next.querySelector('mat-select');
              }

              if (!input) {
                input = next.querySelector('button');
              }

              if (!input) {
                if (next.nativeElement && next.nativeElement.nextElementSibling) {
                  next = next.nativeElement.nextElementSibling;
                } else if (next.nextElementSibling) {
                  next = <Element>next;
                  next = next.nextElementSibling;
                } else {
                  limit = 0;
                }
              }
              limit--;
            }

            if (input) {
              if (input instanceof ElementRef) {
                input.nativeElement.focus();
              } else if (IsCallableFunction(next.focus)) {
                input.focus();
              }
            }
          }
        },

        setWithComponentInnerHeight: (component: string, componentId = 1, overhead: number, defaultHeight: number): Promise<number> => {
          return new Promise((resolve) => {
            if (this.dom.repo) {
              let height = this.dom.repo.getComponentHeight(component);
              if (height && height.inner) {
                height = height.inner;
              } else {
                height = defaultHeight;
              }

              this.dom.setHeight(+height, overhead);
              resolve(this.dom.height.inner);
            } else {
              this.dom.setHeight(+defaultHeight, overhead);
              resolve(this.dom.height.inner);
            }
          });
        },

        waitForParent: (el: ElementRef, className: string = null, time: number = 50, counter: number = 5) => {
          let interval;
          let parentEl;
          return new Promise((resolve) => {
            interval = setInterval(() => {
              parentEl = this.dom.findParentElement(el, className);
              if (!counter || (parentEl)) {
                clearInterval(interval);
                return resolve(parentEl);
              }
              counter--;
            }, time);
          });
        },

        waitForParentHeight: (el: Element, time: number = 5, counter: number = 10) => {
          return new Promise((resolve) => {
            const interval = setInterval(() => {
              if (!counter || (el && el.clientHeight)) {
                clearInterval(interval);
                return resolve(el.clientHeight);
              }
              counter--;
            }, time);
          });
        },

        findParentElement: (el: ElementRef, className: string = null) => {
          let attempts = 10;
          let found;
          if (el && el.nativeElement && el.nativeElement.parentElement) {
            let parent = el.nativeElement.parentElement;
            while (!found && attempts) {
              if (parent) {
                if (className) {
                  if (parent.classList && parent.classList.contains(className)) {
                    found = parent;
                  }
                } else {
                  found = parent;
                }
                if (!found) {
                  parent = parent.parentElement;
                }
              }
              attempts--;
            }
          }
          return found;
        },
        store: (key: string = null) => {
          if (this.dom.repo && this.name && this.id) {
            return this.dom.repo.onSession(this, key);
          }
        },
        destroy: () => {
          if (this.dom) DestroyComponentDom(this.dom);
        }
      }
    };
  }

  private _initializeLogSystem(): ComponentLogInterface {
    return <ComponentLogInterface>{
      repo: {
        message: (message: string) => {
          return `%c${message}`;
        },
        color: (type: string) => {
          let color = 'aqua';
          switch (type) {
            case 'warn':
              color = 'orange';
              break;
            case 'force':
            case 'error':
            case 'destroy':
              color = 'red';
              break;
            case 'info':
              color = 'aqua';
              break;
            case 'event':
              color = 'yellow';
              break;
            case 'onSession':
            case 'event-trigger':
              color = 'gold';
              break;
            case 'cache-in':
              color = 'green';
              break;
            case 'cache-out':
              color = 'darkgreen';
              break;
            case 'dom':
              color = 'brown';
              break;
            case 'debug':
              color = 'pink';
              break;
            case 'api':
              color = 'darkgreen';
              break;
            case 'config':
              color = 'pink';
              break;
            case 'theme':
              color = 'purple';
              break;
            default:
              color = 'aqua';
              break;
          }
          return `color: ${color}`;
        },


        enabled: (type: string = '', component: string = null) => {
          if (IsObject(PopEnv, true) && PopEnv.debug) {
            if (type && Array.isArray(PopEnv.debugTypes)) {
              if (PopEnv.debugTypes.includes(type)) return true;
            }
            if (typeof PopEnv.debugLevel === 'number') {
              if (['error', 'onSession'].includes(type) && PopEnv.debug >= 1) {
                return true;
              }
              if (['warning', 'info'].includes(type) && PopEnv.debug >= 2) {
                return true;
              }
              if (['events'].includes(type) && PopEnv.debug >= 2) {
                return true;
              }
            }
            if (component && typeof PopEnv.debugComponents === 'string') {
              return PopEnv.debugComponents.search(component) > -1;
            }
          }
          return false;
        },


        init: (componentName: string, message: string, data: any = '', force = false) => {
          const type = 'init';
          if (this.log.repo.enabled(type, componentName) || force) console.log(this.log.repo.message(`${componentName}:${message}`), this.log.repo.color((force ? 'force' : type)), data);
        },

        debug: (componentName: string, message: string, data: any = '', force = false) => {
          const type = 'debug';
          if (this.log.repo.enabled(type, componentName) || force) console.log(this.log.repo.message(`${componentName}:${message}`), this.log.repo.color((force ? 'force' : type)), data);
        },


        cache: (componentName: string, message: string, set = true, force = false) => {
          let type = 'cache';
          if (this.log.repo.enabled(type, componentName) || force) {
            type = set ? 'cache-in' : 'cache-out';
            console.log(this.log.repo.message(`${componentName}:${message}`), this.log.repo.color((force ? 'force' : type)));
          }
        },


        warn: (componentName: string, message: string, data: any = '', force = false) => {
          const type = 'warn';
          if (this.log.repo.enabled(type, componentName) || force) console.log(this.log.repo.message(`${componentName}:${message}`), this.log.repo.color((force ? 'force' : type)), data);
        },


        info: (componentName: string, message: string, data: any = '', force = false) => {
          const type = 'info';
          if (this.log.repo.enabled(type, componentName) || force) console.log(this.log.repo.message(`${componentName}:${message}`), this.log.repo.color((force ? 'force' : type)), data);
        },


        theme: (componentName: string, message: string, data: any = '', force = false) => {
          const type = 'theme';
          if (this.log.repo.enabled(type, componentName) || force) console.log(this.log.repo.message(`${componentName}:${message}`), this.log.repo.color((force ? 'force' : type)), data);
        },


        event: (componentName: string, message: string, event: PopBaseEventInterface, force = false) => {
          const type = 'event';
          if (this.log.repo.enabled(type, componentName) || force) console.log(this.log.repo.message(`${componentName}:${message}`), this.log.repo.color((force ? 'force' : type)), event);
        },


        error: (componentName: string, message: string, data: any = '', force = false) => {
          const type = 'error';
          if (this.log.repo.enabled(type, componentName) || force) {
            console.log(this.log.repo.message(`${componentName}:${message}`), this.log.repo.color((force ? 'force' : type)), data);
            // throw new Error('message');
          }
        }
      },

      init: () => {
        if (this.log.repo.enabled('init', this.name)) console.log(this.log.repo.message(`${this.name}:init`), this.log.repo.color('init'), this);
      },

      debug: (msg = 'Debug', data: any = '') => {
        if (this.log.repo.enabled('debug', this.name)) console.log(this.log.repo.message(`${this.name}:${msg}`), this.log.repo.color('debug'), data);
      },

      error: (msg = 'Error', error: any = '') => {
        if (this.log.repo.enabled('error', this.name)) console.log(this.log.repo.message(`${this.name}:${msg}`), this.log.repo.color('error'), error);
      },

      warn: (msg = 'Warning', data: any = '') => {
        if (this.log.repo.enabled('warn', this.name)) console.log(this.log.repo.message(`${this.name}:${msg}`), this.log.repo.color('error'), data);
      },

      info: (msg = 'info', data: any = '') => {
        if (this.log.repo.enabled('event', this.name)) console.log(this.log.repo.message(`${this.name}:${msg}`), this.log.repo.color('info'), data);
      },

      event: (msg = 'event', event: PopBaseEventInterface) => {
        if (this.log.repo.enabled('event', this.name)) console.log(this.log.repo.message(`${this.name}:${msg}`), this.log.repo.color('event'), event);
      },

      config: (msg = 'config', config: any = '') => {
        if (this.log.repo.enabled('config', this.name)) console.log(this.log.repo.message(`${this.name}:${msg}`), this.log.repo.color('config'), config);
      },
      destroy: () => {
        if (this.log.repo.enabled('destroy', this.name)) console.log(this.log.repo.message(`${this.name}:destroy`), this.log.repo.color('destroy'));
      },
    };
  }
}
