import { __awaiter } from "tslib";
import { Component, ElementRef, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { PopEnv, PopTemplate } from './pop-common.model';
import { GetComponentAssetContainer, GetComponentTraitContainer, DestroyComponentDom, GetComponentDomContainer, } from './pop-common-dom.models';
import { GetHttpErrorMsg, IsArray, IsCallableFunction, IsObject, IsString, JsonCopy, StorageGetter, } from './pop-common-utility';
import { EvaluateWhenConditions, IsValidFieldPatchEvent } from './modules/entity/pop-entity-utility';
export class PopExtendComponent {
    constructor() {
        this.position = 1;
        this.core = {};
        this.events = new EventEmitter();
        this.when = null;
        this.hidden = false;
        this.id = 1;
        this.trait = GetComponentTraitContainer();
        if (!this.asset)
            this.asset = GetComponentAssetContainer();
        if (!this.ui)
            this.ui = GetComponentAssetContainer();
        this.log = this._initializeLogSystem();
        this.dom = this._initializeDom();
    }
    ngOnInit() {
        this.dom.loading();
        const init = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            yield this.dom._extend();
            yield this.dom.configure();
            yield this.dom.register();
            yield this.dom.proceed();
            if (IsCallableFunction(this.onLoad)) {
                yield this.onLoad(this.core, {
                    source: this.name,
                    type: 'component',
                    name: 'onLoad',
                    data: this
                }, this.dom);
            }
            this.dom.ready();
            return resolve(true);
        }));
        init.then(() => {
            this.log.init();
        });
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        const destroy = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (IsCallableFunction(this.onUnload)) {
                yield this.onUnload(this.core, {
                    source: this.name,
                    type: 'component',
                    name: 'onUnload',
                    data: this
                });
            }
            yield this.dom.unload();
            if (this.dom.repo)
                this.dom.store();
            this.dom.destroy();
            return resolve(true);
        }));
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
    _initializeDom() {
        return Object.assign(Object.assign({}, GetComponentDomContainer()), {
            /**
             * Initialize the component in a loading state
             */
            loading: () => {
                this.dom.error = { code: 0, message: '' };
                this.dom.state.loading = true;
                this.dom.state.loader = false;
                this.dom.setTimeout('delay-loader-trigger', () => {
                    this.dom.state.loader = true;
                }, 500);
            },
            /**
             * Configure the component tailored to its specific needs
             */
            _extend: () => {
                return new Promise((resolve) => {
                    const repos = Object.keys(this).filter((key) => String(key).startsWith('_') && String(key).endsWith('Repo') && String(key).length > 6 && IsObject(this[key], true));
                    if (IsArray(repos, true)) {
                        if (!(IsObject(this.srv)))
                            this.srv = {};
                        repos.map((repoName) => {
                            const srvName = repoName.replace('_', '').replace('Repo', '');
                            // this.log.info( `Transferred ${repoName} to srv container as ${srvName}` );
                            if (srvName === 'dom') {
                                this.dom.repo = this[repoName];
                            }
                            else {
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
            configure: () => {
                return new Promise((resolve) => {
                    return resolve(true);
                });
            },
            /**
             * Configure the component tailored to its specific needs
             */
            proceed: () => {
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
            register: () => {
                return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                    if (this.el && !this.dom.width.outer)
                        this.dom.width.outer = this.el.nativeElement.getBoundingClientRect().width;
                    if (IsObject(this.core, true)) {
                        if (IsObject(this.core.access, true))
                            this.dom.access = JsonCopy(this.core.access);
                        if (typeof this.dom.handler.core === 'function' || IsArray(this.when, true)) {
                            this.dom.setSubscriber('on-core-event', this.core.channel.subscribe((event) => __awaiter(this, void 0, void 0, function* () {
                                // if( event.source !== this.name ){
                                if (IsValidFieldPatchEvent(this.core, event) && IsArray(this.when)) {
                                    this.log.info('eval when', this.when);
                                    this.dom.setTimeout('eval-when', () => {
                                        this.hidden = !EvaluateWhenConditions(this.core, this.when, this.core);
                                    }, 50);
                                }
                                if (event.source && event.target) {
                                    if (event.source && event.source === this.name)
                                        return;
                                    if (event.target && String(event.target).search(this.name) === -1)
                                        return;
                                }
                                if (IsCallableFunction(this.dom.handler.core))
                                    this.dom.handler.core(IsObject(this.core, true) ? this.core : null, event);
                                // }
                            })));
                        }
                    }
                    if (this.name && typeof this.id !== 'undefined') {
                        if (this.dom.repo && typeof this.dom.repo.onRegister === 'function') {
                            this.dom.repo.onRegister(this);
                        }
                    }
                    if (IsCallableFunction(this.onEvent)) {
                        this.dom.setSubscriber(`on-event`, this.events.subscribe((event) => __awaiter(this, void 0, void 0, function* () {
                            yield this.onEvent(this.core, event, this.dom);
                            this.log.event(this.name, event);
                        })));
                    }
                    return resolve(true);
                }));
            },
            find: (assetType, name, id = 1) => {
                let asset = null;
                if (assetType === 'field') {
                    const fieldRepo = StorageGetter(this.dom, ['repo', 'ui', 'fields']);
                    asset = fieldRepo.get(name);
                    asset = StorageGetter(asset, ['inputs', 'config']);
                }
                else if (assetType === 'component') {
                    asset = StorageGetter(this.dom, ['repo', 'components', String(name)]);
                    if (IsObject(asset) && id in asset) {
                        asset = asset[id];
                    }
                    else {
                        asset = null;
                    }
                }
                else if (this.el && assetType === 'el') {
                    asset = this.el.nativeElement.querySelector(name);
                }
                return asset;
            },
            focus: (querySelector, delay) => {
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
            setError(err = null, modal = false) {
                if (IsObject(err)) {
                    if (modal) {
                        PopTemplate.error({ code: (err.status ? err.status : 422), message: GetHttpErrorMsg(err) });
                    }
                    else {
                        this.dom.error.code = err.status ? err.status : 422;
                        this.dom.error.message = GetHttpErrorMsg(err);
                    }
                }
                else {
                    this.dom.error.message = '';
                }
            },
            /**
             * Configure operations that need to happen when this component is going to be destroyed
             */
            unload: () => {
                return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                    return resolve(true);
                }));
            },
            /**
             * Preferred method of setting a subscriber
             * @param subscriptionKey
             * @param subscription
             */
            setSubscriber: (subscriptionKey, subscription = null) => {
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
            setTimeout: (timeoutKey, callback = null, delay = 250) => {
                if (timeoutKey && this.dom.delay && timeoutKey in this.dom.delay && this.dom.delay[timeoutKey]) {
                    clearTimeout(this.dom.delay[timeoutKey]);
                }
                if (typeof callback === 'function') {
                    this.dom.delay[timeoutKey] = setTimeout(callback, delay);
                }
            },
            setHeight: (parentHeight, overhead) => {
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
            setHeightWithParent: (parentClassName = null, overhead = 0, defaultHeight) => {
                return new Promise((resolve) => {
                    if (this.el) {
                        this.dom.waitForParent(this.el, parentClassName, 10, 10).then((parentEl) => {
                            if (parentEl) {
                                this.dom.waitForParentHeight(parentEl).then((parentHeight) => {
                                    if (parentHeight < defaultHeight)
                                        parentHeight = defaultHeight;
                                    if (parentHeight) {
                                        this.dom.setHeight(+parentHeight, overhead);
                                        resolve(true);
                                    }
                                    else {
                                        this.dom.setHeight(defaultHeight, overhead);
                                        resolve(true);
                                    }
                                });
                            }
                            else {
                                this.dom.setHeight(defaultHeight, overhead);
                                resolve(true);
                            }
                        });
                    }
                    else {
                        resolve(false);
                    }
                });
            },
            focusNextInput(el) {
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
                            }
                            else if (next.nextElementSibling) {
                                next = next;
                                next = next.nextElementSibling;
                            }
                            else {
                                limit = 0;
                            }
                        }
                        limit--;
                    }
                    if (input) {
                        if (input instanceof ElementRef) {
                            input.nativeElement.focus();
                        }
                        else if (IsCallableFunction(next.focus)) {
                            input.focus();
                        }
                    }
                }
            },
            setWithComponentInnerHeight: (component, componentId = 1, overhead, defaultHeight) => {
                return new Promise((resolve) => {
                    if (this.dom.repo) {
                        let height = this.dom.repo.getComponentHeight(component);
                        if (height && height.inner) {
                            height = height.inner;
                        }
                        else {
                            height = defaultHeight;
                        }
                        this.dom.setHeight(+height, overhead);
                        resolve(this.dom.height.inner);
                    }
                    else {
                        this.dom.setHeight(+defaultHeight, overhead);
                        resolve(this.dom.height.inner);
                    }
                });
            },
            waitForParent: (el, className = null, time = 50, counter = 5) => {
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
            waitForParentHeight: (el, time = 5, counter = 10) => {
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
            findParentElement: (el, className = null) => {
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
                            }
                            else {
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
            store: (key = null) => {
                if (this.dom.repo && this.name && this.id) {
                    return this.dom.repo.onSession(this, key);
                }
            },
            destroy: () => {
                if (this.dom)
                    DestroyComponentDom(this.dom);
            }
        });
    }
    _initializeLogSystem() {
        return {
            repo: {
                message: (message) => {
                    return `%c${message}`;
                },
                color: (type) => {
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
                enabled: (type = '', component = null) => {
                    if (IsObject(PopEnv, true) && PopEnv.debug) {
                        if (type && Array.isArray(PopEnv.debugTypes)) {
                            if (PopEnv.debugTypes.includes(type))
                                return true;
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
                init: (componentName, message, data = '', force = false) => {
                    const type = 'init';
                    if (this.log.repo.enabled(type, componentName) || force)
                        console.log(this.log.repo.message(`${componentName}:${message}`), this.log.repo.color((force ? 'force' : type)), data);
                },
                debug: (componentName, message, data = '', force = false) => {
                    const type = 'debug';
                    if (this.log.repo.enabled(type, componentName) || force)
                        console.log(this.log.repo.message(`${componentName}:${message}`), this.log.repo.color((force ? 'force' : type)), data);
                },
                cache: (componentName, message, set = true, force = false) => {
                    let type = 'cache';
                    if (this.log.repo.enabled(type, componentName) || force) {
                        type = set ? 'cache-in' : 'cache-out';
                        console.log(this.log.repo.message(`${componentName}:${message}`), this.log.repo.color((force ? 'force' : type)));
                    }
                },
                warn: (componentName, message, data = '', force = false) => {
                    const type = 'warn';
                    if (this.log.repo.enabled(type, componentName) || force)
                        console.log(this.log.repo.message(`${componentName}:${message}`), this.log.repo.color((force ? 'force' : type)), data);
                },
                info: (componentName, message, data = '', force = false) => {
                    const type = 'info';
                    if (this.log.repo.enabled(type, componentName) || force)
                        console.log(this.log.repo.message(`${componentName}:${message}`), this.log.repo.color((force ? 'force' : type)), data);
                },
                theme: (componentName, message, data = '', force = false) => {
                    const type = 'theme';
                    if (this.log.repo.enabled(type, componentName) || force)
                        console.log(this.log.repo.message(`${componentName}:${message}`), this.log.repo.color((force ? 'force' : type)), data);
                },
                event: (componentName, message, event, force = false) => {
                    const type = 'event';
                    if (this.log.repo.enabled(type, componentName) || force)
                        console.log(this.log.repo.message(`${componentName}:${message}`), this.log.repo.color((force ? 'force' : type)), event);
                },
                error: (componentName, message, data = '', force = false) => {
                    const type = 'error';
                    if (this.log.repo.enabled(type, componentName) || force) {
                        console.log(this.log.repo.message(`${componentName}:${message}`), this.log.repo.color((force ? 'force' : type)), data);
                        // throw new Error('message');
                    }
                }
            },
            init: () => {
                if (this.log.repo.enabled('init', this.name))
                    console.log(this.log.repo.message(`${this.name}:init`), this.log.repo.color('init'), this);
            },
            debug: (msg = 'Debug', data = '') => {
                if (this.log.repo.enabled('debug', this.name))
                    console.log(this.log.repo.message(`${this.name}:${msg}`), this.log.repo.color('debug'), data);
            },
            error: (msg = 'Error', error = '') => {
                if (this.log.repo.enabled('error', this.name))
                    console.log(this.log.repo.message(`${this.name}:${msg}`), this.log.repo.color('error'), error);
            },
            warn: (msg = 'Warning', data = '') => {
                if (this.log.repo.enabled('warn', this.name))
                    console.log(this.log.repo.message(`${this.name}:${msg}`), this.log.repo.color('error'), data);
            },
            info: (msg = 'info', data = '') => {
                if (this.log.repo.enabled('event', this.name))
                    console.log(this.log.repo.message(`${this.name}:${msg}`), this.log.repo.color('info'), data);
            },
            event: (msg = 'event', event) => {
                if (this.log.repo.enabled('event', this.name))
                    console.log(this.log.repo.message(`${this.name}:${msg}`), this.log.repo.color('event'), event);
            },
            config: (msg = 'config', config = '') => {
                if (this.log.repo.enabled('config', this.name))
                    console.log(this.log.repo.message(`${this.name}:${msg}`), this.log.repo.color('config'), config);
            },
            destroy: () => {
                if (this.log.repo.enabled('destroy', this.name))
                    console.log(this.log.repo.message(`${this.name}:destroy`), this.log.repo.color('destroy'));
            },
        };
    }
}
PopExtendComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-base-component',
                template: `Base Component`
            },] }
];
PopExtendComponent.ctorParameters = () => [];
PopExtendComponent.propDecorators = {
    position: [{ type: Input }],
    core: [{ type: Input }],
    events: [{ type: Output }],
    extension: [{ type: Input }],
    onLoad: [{ type: Input }],
    onEvent: [{ type: Input }],
    onUnload: [{ type: Input }],
    when: [{ type: Input }],
    hidden: [{ type: HostBinding, args: ['class.sw-hidden',] }, { type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWV4dGVuZC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvcG9wLWV4dGVuZC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixXQUFXLEVBQ1gsS0FBSyxFQUdMLE1BQU0sRUFDUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBS0wsTUFBTSxFQUNOLFdBQVcsRUFDWixNQUFNLG9CQUFvQixDQUFDO0FBRTVCLE9BQU8sRUFLTCwwQkFBMEIsRUFDMUIsMEJBQTBCLEVBQzFCLG1CQUFtQixFQUNuQix3QkFBd0IsR0FFekIsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQyxPQUFPLEVBQ0wsZUFBZSxFQUNmLE9BQU8sRUFDUCxrQkFBa0IsRUFDbEIsUUFBUSxFQUNSLFFBQVEsRUFDUixRQUFRLEVBQ1IsYUFBYSxHQUNkLE1BQU0sc0JBQXNCLENBQUM7QUFHOUIsT0FBTyxFQUFDLHNCQUFzQixFQUFFLHNCQUFzQixFQUFDLE1BQU0scUNBQXFDLENBQUM7QUFRbkcsTUFBTSxPQUFPLGtCQUFrQjtJQXFDN0I7UUFwQ1MsYUFBUSxHQUFHLENBQUMsQ0FBQztRQUNiLFNBQUksR0FBMkIsRUFBRSxDQUFDO1FBQ2pDLFdBQU0sR0FBd0MsSUFBSSxZQUFZLEVBQXlCLENBQUM7UUFPekYsU0FBSSxHQUFVLElBQUksQ0FBQztRQUNhLFdBQU0sR0FBRyxLQUFLLENBQUM7UUFJOUMsT0FBRSxHQUFvQixDQUFDLENBQUM7UUFHeEIsVUFBSyxHQUFxQywwQkFBMEIsRUFBRSxDQUFDO1FBb0IvRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUs7WUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLDBCQUEwQixFQUFFLENBQUM7UUFDM0QsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQUUsSUFB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QUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDOUksQ0FBQztTQUNGLENBQUM7SUFDSixDQUFDOzs7WUE5bkJGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsd0JBQXdCO2dCQUNsQyxRQUFRLEVBQUUsZ0JBQWdCO2FBQzNCOzs7O3VCQUVFLEtBQUs7bUJBQ0wsS0FBSztxQkFDTCxNQUFNO3dCQUNOLEtBQUs7cUJBRUwsS0FBSztzQkFDTCxLQUFLO3VCQUNMLEtBQUs7bUJBRUwsS0FBSztxQkFDTCxXQUFXLFNBQUMsaUJBQWlCLGNBQUcsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBIb3N0QmluZGluZyxcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBPdXRwdXRcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICBDb3JlQ29uZmlnLFxuICBFbnRpdHlFeHRlbmRJbnRlcmZhY2UsXG4gIEV2ZW50UHJvbWlzZUNhbGxiYWNrLFxuICBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsXG4gIFBvcEVudixcbiAgUG9wVGVtcGxhdGVcbn0gZnJvbSAnLi9wb3AtY29tbW9uLm1vZGVsJztcblxuaW1wb3J0IHtcbiAgSGFzRXZlbnRzLFxuICBIYXNDb3JlLFxuICBDb21wb25lbnRUcmFpdENvbnRhaW5lckludGVyZmFjZSxcbiAgQ29tcG9uZW50RG9tSW50ZXJmYWNlLFxuICBHZXRDb21wb25lbnRBc3NldENvbnRhaW5lcixcbiAgR2V0Q29tcG9uZW50VHJhaXRDb250YWluZXIsXG4gIERlc3Ryb3lDb21wb25lbnREb20sXG4gIEdldENvbXBvbmVudERvbUNvbnRhaW5lcixcbiAgQ29tcG9uZW50TG9nSW50ZXJmYWNlLFxufSBmcm9tICcuL3BvcC1jb21tb24tZG9tLm1vZGVscyc7XG5cbmltcG9ydCB7U3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIEdldEh0dHBFcnJvck1zZyxcbiAgSXNBcnJheSxcbiAgSXNDYWxsYWJsZUZ1bmN0aW9uLFxuICBJc09iamVjdCxcbiAgSXNTdHJpbmcsXG4gIEpzb25Db3B5LFxuICBTdG9yYWdlR2V0dGVyLFxufSBmcm9tICcuL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQge1BvcERvbVNlcnZpY2V9IGZyb20gJy4vc2VydmljZXMvcG9wLWRvbS5zZXJ2aWNlJztcbmltcG9ydCB7UG9wVGFiTWVudVNlcnZpY2V9IGZyb20gJy4vbW9kdWxlcy9iYXNlL3BvcC10YWItbWVudS9wb3AtdGFiLW1lbnUuc2VydmljZSc7XG5pbXBvcnQge0V2YWx1YXRlV2hlbkNvbmRpdGlvbnMsIElzVmFsaWRGaWVsZFBhdGNoRXZlbnR9IGZyb20gJy4vbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS11dGlsaXR5JztcbmltcG9ydCB7SHR0cEVycm9yUmVzcG9uc2V9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWJhc2UtY29tcG9uZW50JyxcbiAgdGVtcGxhdGU6IGBCYXNlIENvbXBvbmVudGAsXG59KVxuZXhwb3J0IGNsYXNzIFBvcEV4dGVuZENvbXBvbmVudCBpbXBsZW1lbnRzIEhhc0V2ZW50cywgSGFzQ29yZSwgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBwb3NpdGlvbiA9IDE7XG4gIEBJbnB1dCgpIGNvcmU6IENvcmVDb25maWcgPSA8Q29yZUNvbmZpZz57fTtcbiAgQE91dHB1dCgpIGV2ZW50czogRXZlbnRFbWl0dGVyPFBvcEJhc2VFdmVudEludGVyZmFjZT4gPSBuZXcgRXZlbnRFbWl0dGVyPFBvcEJhc2VFdmVudEludGVyZmFjZT4oKTtcbiAgQElucHV0KCkgZXh0ZW5zaW9uOiBFbnRpdHlFeHRlbmRJbnRlcmZhY2U7XG5cbiAgQElucHV0KCkgb25Mb2FkPzogRXZlbnRQcm9taXNlQ2FsbGJhY2s7XG4gIEBJbnB1dCgpIG9uRXZlbnQ/OiBFdmVudFByb21pc2VDYWxsYmFjaztcbiAgQElucHV0KCkgb25VbmxvYWQ/OiBFdmVudFByb21pc2VDYWxsYmFjaztcblxuICBASW5wdXQoKSB3aGVuOiBhbnlbXSA9IG51bGw7XG4gIEBIb3N0QmluZGluZygnY2xhc3Muc3ctaGlkZGVuJykgQElucHV0KCkgaGlkZGVuID0gZmFsc2U7XG5cbiAgbmFtZTogc3RyaW5nO1xuICBpbnRlcm5hbF9uYW1lOiBzdHJpbmc7XG4gIHByb3RlY3RlZCBpZDogc3RyaW5nIHwgbnVtYmVyID0gMTtcblxuICBwcm90ZWN0ZWQgZWw6IEVsZW1lbnRSZWY7XG4gIHByb3RlY3RlZCB0cmFpdCA9IDxDb21wb25lbnRUcmFpdENvbnRhaW5lckludGVyZmFjZT5HZXRDb21wb25lbnRUcmFpdENvbnRhaW5lcigpO1xuICBwcm90ZWN0ZWQgYXNzZXQ7XG4gIHByb3RlY3RlZCBzcnY7XG4gIHByb3RlY3RlZCBfZG9tUmVwbzogUG9wRG9tU2VydmljZTtcbiAgcHJvdGVjdGVkIF90YWJSZXBvOiBQb3BUYWJNZW51U2VydmljZTtcblxuICAvKipcbiAgICogVGhlIERvbSBpcyBib2lsZXIgcGxhdGUgZm9yIG1hbmFnaW5nIHRoZSBzdGF0ZSBhbmQgYXNzZXRzIG9mIHRoZSBodG1sIHZpZXdcbiAgICovXG4gIHB1YmxpYyBkb206IENvbXBvbmVudERvbUludGVyZmFjZTtcblxuICBwdWJsaWMgbG9nOiBDb21wb25lbnRMb2dJbnRlcmZhY2U7XG5cbiAgLyoqXG4gICAqIFRoZSB1aSBpcyBhIGNvbnRhaW5lciBmb3IgYXNzZXRzIHRoYXQgYXJlIGNyZWF0ZWQgZm9yIHRoZSBodG1sIHZpZXcgc3BlY2lmaWNhbGx5XG4gICAqL1xuICBwdWJsaWMgdWk7XG5cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBpZiAoIXRoaXMuYXNzZXQpIHRoaXMuYXNzZXQgPSBHZXRDb21wb25lbnRBc3NldENvbnRhaW5lcigpO1xuICAgIGlmICghdGhpcy51aSkgdGhpcy51aSA9IEdldENvbXBvbmVudEFzc2V0Q29udGFpbmVyKCk7XG4gICAgdGhpcy5sb2cgPSB0aGlzLl9pbml0aWFsaXplTG9nU3lzdGVtKCk7XG4gICAgdGhpcy5kb20gPSB0aGlzLl9pbml0aWFsaXplRG9tKCk7XG4gIH1cblxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuZG9tLmxvYWRpbmcoKTtcbiAgICBjb25zdCBpbml0ID0gbmV3IFByb21pc2U8Ym9vbGVhbj4oYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgIGF3YWl0IHRoaXMuZG9tLl9leHRlbmQoKTtcbiAgICAgIGF3YWl0IHRoaXMuZG9tLmNvbmZpZ3VyZSgpO1xuICAgICAgYXdhaXQgdGhpcy5kb20ucmVnaXN0ZXIoKTtcbiAgICAgIGF3YWl0IHRoaXMuZG9tLnByb2NlZWQoKTtcbiAgICAgIGlmIChJc0NhbGxhYmxlRnVuY3Rpb24odGhpcy5vbkxvYWQpKSB7XG4gICAgICAgIGF3YWl0IHRoaXMub25Mb2FkKHRoaXMuY29yZSwgPFBvcEJhc2VFdmVudEludGVyZmFjZT57XG4gICAgICAgICAgc291cmNlOiB0aGlzLm5hbWUsXG4gICAgICAgICAgdHlwZTogJ2NvbXBvbmVudCcsXG4gICAgICAgICAgbmFtZTogJ29uTG9hZCcsXG4gICAgICAgICAgZGF0YTogdGhpc1xuICAgICAgICB9LCB0aGlzLmRvbSk7XG4gICAgICB9XG4gICAgICB0aGlzLmRvbS5yZWFkeSgpO1xuICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG5cbiAgICBpbml0LnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5sb2cuaW5pdCgpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIGRvbSBkZXN0cm95IGZ1bmN0aW9uIG1hbmFnZXMgYWxsIHRoZSBjbGVhbiB1cCB0aGF0IGlzIG5lY2Vzc2FyeSBpZiBzdWJzY3JpcHRpb25zLCB0aW1lb3V0cywgZXRjIGFyZSBzdG9yZWQgcHJvcGVybHlcbiAgICovXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGNvbnN0IGRlc3Ryb3kgPSBuZXcgUHJvbWlzZTxib29sZWFuPihhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKElzQ2FsbGFibGVGdW5jdGlvbih0aGlzLm9uVW5sb2FkKSkge1xuICAgICAgICBhd2FpdCB0aGlzLm9uVW5sb2FkKHRoaXMuY29yZSwgPFBvcEJhc2VFdmVudEludGVyZmFjZT57XG4gICAgICAgICAgc291cmNlOiB0aGlzLm5hbWUsXG4gICAgICAgICAgdHlwZTogJ2NvbXBvbmVudCcsXG4gICAgICAgICAgbmFtZTogJ29uVW5sb2FkJyxcbiAgICAgICAgICBkYXRhOiB0aGlzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5kb20udW5sb2FkKCk7XG4gICAgICBpZiAodGhpcy5kb20ucmVwbykgdGhpcy5kb20uc3RvcmUoKTtcbiAgICAgIHRoaXMuZG9tLmRlc3Ryb3koKTtcblxuICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG4gICAgZGVzdHJveS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMubG9nLmRlc3Ryb3koKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIHByaXZhdGUgX2luaXRpYWxpemVEb20oKTogQ29tcG9uZW50RG9tSW50ZXJmYWNlIHtcbiAgICByZXR1cm4gPENvbXBvbmVudERvbUludGVyZmFjZT57XG4gICAgICAuLi5HZXRDb21wb25lbnREb21Db250YWluZXIoKSwgLi4ue1xuICAgICAgICAvKipcbiAgICAgICAgICogSW5pdGlhbGl6ZSB0aGUgY29tcG9uZW50IGluIGEgbG9hZGluZyBzdGF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgbG9hZGluZzogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZG9tLmVycm9yID0ge2NvZGU6IDAsIG1lc3NhZ2U6ICcnfTtcbiAgICAgICAgICB0aGlzLmRvbS5zdGF0ZS5sb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLmRvbS5zdGF0ZS5sb2FkZXIgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCdkZWxheS1sb2FkZXItdHJpZ2dlcicsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZG9tLnN0YXRlLmxvYWRlciA9IHRydWU7XG4gICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29uZmlndXJlIHRoZSBjb21wb25lbnQgdGFpbG9yZWQgdG8gaXRzIHNwZWNpZmljIG5lZWRzXG4gICAgICAgICAqL1xuICAgICAgICBfZXh0ZW5kOiAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXBvcyA9IE9iamVjdC5rZXlzKHRoaXMpLmZpbHRlcigoa2V5OiBzdHJpbmcpID0+IFN0cmluZyhrZXkpLnN0YXJ0c1dpdGgoJ18nKSAmJiBTdHJpbmcoa2V5KS5lbmRzV2l0aCgnUmVwbycpICYmIFN0cmluZyhrZXkpLmxlbmd0aCA+IDYgJiYgSXNPYmplY3QodGhpc1trZXldLCB0cnVlKSk7XG4gICAgICAgICAgICBpZiAoSXNBcnJheShyZXBvcywgdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgaWYgKCEoSXNPYmplY3QodGhpcy5zcnYpKSkgdGhpcy5zcnYgPSB7fTtcbiAgICAgICAgICAgICAgcmVwb3MubWFwKChyZXBvTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3J2TmFtZSA9IHJlcG9OYW1lLnJlcGxhY2UoJ18nLCAnJykucmVwbGFjZSgnUmVwbycsICcnKTtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmxvZy5pbmZvKCBgVHJhbnNmZXJyZWQgJHtyZXBvTmFtZX0gdG8gc3J2IGNvbnRhaW5lciBhcyAke3Nydk5hbWV9YCApO1xuICAgICAgICAgICAgICAgIGlmIChzcnZOYW1lID09PSAnZG9tJykge1xuICAgICAgICAgICAgICAgICAgdGhpcy5kb20ucmVwbyA9IHRoaXNbcmVwb05hbWVdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLnNydltzcnZOYW1lXSA9IHRoaXNbcmVwb05hbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpc1tyZXBvTmFtZV07XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbmZpZ3VyZSB0aGUgY29tcG9uZW50IHRhaWxvcmVkIHRvIGl0cyBzcGVjaWZpYyBuZWVkc1xuICAgICAgICAgKi9cbiAgICAgICAgY29uZmlndXJlOiAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29uZmlndXJlIHRoZSBjb21wb25lbnQgdGFpbG9yZWQgdG8gaXRzIHNwZWNpZmljIG5lZWRzXG4gICAgICAgICAqL1xuICAgICAgICBwcm9jZWVkOiAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyIHRoZSB2aWV3IHRvIHJlbmRlclxuICAgICAgICAgKi9cbiAgICAgICAgcmVhZHk6ICgpID0+IHtcbiAgICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCdkZWxheS1sb2FkZXItdHJpZ2dlcicsIG51bGwpO1xuICAgICAgICAgIHRoaXMuZG9tLnN0YXRlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLmRvbS5zdGF0ZS5sb2FkZWQgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuZG9tLnN0YXRlLmxvYWRlciA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMuZG9tLnN0YXRlLnJlZnJlc2ggPSBmYWxzZTtcbiAgICAgICAgICBpZiAoSXNBcnJheSh0aGlzLndoZW4sIHRydWUpKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5pbmZvKGBldmFsIHdoZW5gLCB0aGlzLndoZW4pO1xuICAgICAgICAgICAgdGhpcy5oaWRkZW4gPSAhRXZhbHVhdGVXaGVuQ29uZGl0aW9ucyh0aGlzLmNvcmUsIHRoaXMud2hlbiwgdGhpcy5jb3JlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXIgdGhlIHZpZXcgdG8gcmVmcmVzaFxuICAgICAgICAgKi9cbiAgICAgICAgcmVmcmVzaGluZzogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZG9tLnN0YXRlLnJlZnJlc2ggPSB0cnVlO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlZ2lzdGVyIHRoaXMgY29tcG9uZW50IGluIHRoZSBQb3BEb21TZXJ2aWNlIHNvIHRoYXQgc2Vzc2lvbiwgc3RhdGUsIGV0YyBjYW4gYmUgcHJlc2VydmVkXG4gICAgICAgICAqIEl0IHdpbGwgYWxzbyBiaW5kIGV2ZW50cyB0byB0aGUgYXBwcm9wcmlhdGUgaGFuZGxlcnNcbiAgICAgICAgICogQ29yZUNvbmZpZyBpcyBvYnZpb3VzbHkgc29tZXRoaW5nIHRoYXQgeW91IG11c3QgaGF2ZSBmb3IgYW55IG9mIHRoaXMgdG8gd29ya1xuICAgICAgICAgKi9cbiAgICAgICAgcmVnaXN0ZXI6ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmVsICYmICF0aGlzLmRvbS53aWR0aC5vdXRlcikgdGhpcy5kb20ud2lkdGgub3V0ZXIgPSB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICAgICAgICBpZiAoSXNPYmplY3QodGhpcy5jb3JlLCB0cnVlKSkge1xuICAgICAgICAgICAgICBpZiAoSXNPYmplY3QodGhpcy5jb3JlLmFjY2VzcywgdHJ1ZSkpIHRoaXMuZG9tLmFjY2VzcyA9IEpzb25Db3B5KHRoaXMuY29yZS5hY2Nlc3MpO1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuZG9tLmhhbmRsZXIuY29yZSA9PT0gJ2Z1bmN0aW9uJyB8fCBJc0FycmF5KHRoaXMud2hlbiwgdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRvbS5zZXRTdWJzY3JpYmVyKCdvbi1jb3JlLWV2ZW50JywgdGhpcy5jb3JlLmNoYW5uZWwuc3Vic2NyaWJlKGFzeW5jIChldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAvLyBpZiggZXZlbnQuc291cmNlICE9PSB0aGlzLm5hbWUgKXtcbiAgICAgICAgICAgICAgICAgIGlmIChJc1ZhbGlkRmllbGRQYXRjaEV2ZW50KHRoaXMuY29yZSwgZXZlbnQpICYmIElzQXJyYXkodGhpcy53aGVuKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5pbmZvKCdldmFsIHdoZW4nLCB0aGlzLndoZW4pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCdldmFsLXdoZW4nLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRkZW4gPSAhRXZhbHVhdGVXaGVuQ29uZGl0aW9ucyh0aGlzLmNvcmUsIHRoaXMud2hlbiwgdGhpcy5jb3JlKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgNTApO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBpZiAoZXZlbnQuc291cmNlICYmIGV2ZW50LnRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQuc291cmNlICYmIGV2ZW50LnNvdXJjZSA9PT0gdGhpcy5uYW1lKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQgJiYgU3RyaW5nKGV2ZW50LnRhcmdldCkuc2VhcmNoKHRoaXMubmFtZSkgPT09IC0xKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpZiAoSXNDYWxsYWJsZUZ1bmN0aW9uKHRoaXMuZG9tLmhhbmRsZXIuY29yZSkpIHRoaXMuZG9tLmhhbmRsZXIuY29yZShJc09iamVjdCh0aGlzLmNvcmUsIHRydWUpID8gdGhpcy5jb3JlIDogbnVsbCwgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5uYW1lICYmIHR5cGVvZiB0aGlzLmlkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICBpZiAodGhpcy5kb20ucmVwbyAmJiB0eXBlb2YgdGhpcy5kb20ucmVwby5vblJlZ2lzdGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kb20ucmVwby5vblJlZ2lzdGVyKHRoaXMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChJc0NhbGxhYmxlRnVuY3Rpb24odGhpcy5vbkV2ZW50KSkge1xuICAgICAgICAgICAgICB0aGlzLmRvbS5zZXRTdWJzY3JpYmVyKGBvbi1ldmVudGAsIHRoaXMuZXZlbnRzLnN1YnNjcmliZShhc3luYyAoZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSkgPT4ge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMub25FdmVudCh0aGlzLmNvcmUsIGV2ZW50LCB0aGlzLmRvbSk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2cuZXZlbnQodGhpcy5uYW1lLCBldmVudCk7XG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgZmluZDogKGFzc2V0VHlwZTogJ2NvbXBvbmVudCcgfCAnZmllbGQnIHwgJ2VsJywgbmFtZTogc3RyaW5nIHwgbnVtYmVyLCBpZDogc3RyaW5nIHwgbnVtYmVyID0gMSk6IGFueSA9PiB7XG4gICAgICAgICAgbGV0IGFzc2V0ID0gbnVsbDtcbiAgICAgICAgICBpZiAoYXNzZXRUeXBlID09PSAnZmllbGQnKSB7XG4gICAgICAgICAgICBjb25zdCBmaWVsZFJlcG8gPSBTdG9yYWdlR2V0dGVyKHRoaXMuZG9tLCBbJ3JlcG8nLCAndWknLCAnZmllbGRzJ10pO1xuICAgICAgICAgICAgYXNzZXQgPSBmaWVsZFJlcG8uZ2V0KG5hbWUpO1xuICAgICAgICAgICAgYXNzZXQgPSBTdG9yYWdlR2V0dGVyKGFzc2V0LCBbJ2lucHV0cycsICdjb25maWcnXSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChhc3NldFR5cGUgPT09ICdjb21wb25lbnQnKSB7XG4gICAgICAgICAgICBhc3NldCA9IFN0b3JhZ2VHZXR0ZXIodGhpcy5kb20sIFsncmVwbycsICdjb21wb25lbnRzJywgU3RyaW5nKG5hbWUpXSk7XG4gICAgICAgICAgICBpZiAoSXNPYmplY3QoYXNzZXQpICYmIGlkIGluIGFzc2V0KSB7XG4gICAgICAgICAgICAgIGFzc2V0ID0gYXNzZXRbaWRdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYXNzZXQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5lbCAmJiBhc3NldFR5cGUgPT09ICdlbCcpIHtcbiAgICAgICAgICAgIGFzc2V0ID0gdGhpcy5lbC5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IobmFtZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGFzc2V0O1xuICAgICAgICB9LFxuXG4gICAgICAgIGZvY3VzOiAocXVlcnlTZWxlY3Rvcjogc3RyaW5nLCBkZWxheTogNTApOiB2b2lkID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5lbCAmJiBJc1N0cmluZyhxdWVyeVNlbGVjdG9yLCB0cnVlKSkge1xuICAgICAgICAgICAgdGhpcy5kb20uc2V0VGltZW91dCgnZm9jdXMtY2hpbGQtZWxlbWVudC1kZWxheScsICgpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5kb20uc2V0VGltZW91dCgnZm9jdXMtY2hpbGQtZWxlbWVudCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEVsID0gdGhpcy5lbC5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IocXVlcnlTZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkRWwpIHtcbiAgICAgICAgICAgICAgICAgIGNoaWxkRWwuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfSwgZGVsYXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRFcnJvcihlcnI6IEh0dHBFcnJvclJlc3BvbnNlID0gbnVsbCwgbW9kYWwgPSBmYWxzZSkge1xuICAgICAgICAgIGlmIChJc09iamVjdChlcnIpKSB7XG4gICAgICAgICAgICBpZiAobW9kYWwpIHtcbiAgICAgICAgICAgICAgUG9wVGVtcGxhdGUuZXJyb3Ioe2NvZGU6IChlcnIuc3RhdHVzID8gZXJyLnN0YXR1cyA6IDQyMiksIG1lc3NhZ2U6IEdldEh0dHBFcnJvck1zZyhlcnIpfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLmRvbS5lcnJvci5jb2RlID0gZXJyLnN0YXR1cyA/IGVyci5zdGF0dXMgOiA0MjI7XG4gICAgICAgICAgICAgIHRoaXMuZG9tLmVycm9yLm1lc3NhZ2UgPSBHZXRIdHRwRXJyb3JNc2coZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kb20uZXJyb3IubWVzc2FnZSA9ICcnO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29uZmlndXJlIG9wZXJhdGlvbnMgdGhhdCBuZWVkIHRvIGhhcHBlbiB3aGVuIHRoaXMgY29tcG9uZW50IGlzIGdvaW5nIHRvIGJlIGRlc3Ryb3llZFxuICAgICAgICAgKi9cbiAgICAgICAgdW5sb2FkOiAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFByZWZlcnJlZCBtZXRob2Qgb2Ygc2V0dGluZyBhIHN1YnNjcmliZXJcbiAgICAgICAgICogQHBhcmFtIHN1YnNjcmlwdGlvbktleVxuICAgICAgICAgKiBAcGFyYW0gc3Vic2NyaXB0aW9uXG4gICAgICAgICAqL1xuICAgICAgICBzZXRTdWJzY3JpYmVyOiAoc3Vic2NyaXB0aW9uS2V5OiBzdHJpbmcsIHN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uID0gbnVsbCkgPT4ge1xuICAgICAgICAgIGlmIChzdWJzY3JpcHRpb25LZXkgJiYgdGhpcy5kb20uc3Vic2NyaWJlciAmJiBzdWJzY3JpcHRpb25LZXkgaW4gdGhpcy5kb20uc3Vic2NyaWJlciAmJiB0aGlzLmRvbS5zdWJzY3JpYmVyW3N1YnNjcmlwdGlvbktleV0gJiYgdHlwZW9mIHRoaXMuZG9tLnN1YnNjcmliZXJbc3Vic2NyaXB0aW9uS2V5XS51bnN1YnNjcmliZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhpcy5kb20uc3Vic2NyaWJlcltzdWJzY3JpcHRpb25LZXldLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuZG9tLnN1YnNjcmliZXJbc3Vic2NyaXB0aW9uS2V5XSA9IHN1YnNjcmlwdGlvbjtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQcmVmZXJyZWQgbWV0aG9kIG9mIHNldHRpbmcgYSB0aW1lb3V0XG4gICAgICAgICAqIEBwYXJhbSB0aW1lb3V0S2V5XG4gICAgICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAgICAgKiBAcGFyYW0gZGVsYXlcbiAgICAgICAgICovXG4gICAgICAgIHNldFRpbWVvdXQ6ICh0aW1lb3V0S2V5OiBzdHJpbmcsIGNhbGxiYWNrID0gbnVsbCwgZGVsYXkgPSAyNTApID0+IHtcbiAgICAgICAgICBpZiAodGltZW91dEtleSAmJiB0aGlzLmRvbS5kZWxheSAmJiB0aW1lb3V0S2V5IGluIHRoaXMuZG9tLmRlbGF5ICYmIHRoaXMuZG9tLmRlbGF5W3RpbWVvdXRLZXldKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5kb20uZGVsYXlbdGltZW91dEtleV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLmRvbS5kZWxheVt0aW1lb3V0S2V5XSA9IHNldFRpbWVvdXQoY2FsbGJhY2ssIGRlbGF5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0SGVpZ2h0OiAocGFyZW50SGVpZ2h0OiBudW1iZXIsIG92ZXJoZWFkOiBudW1iZXIpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5uYW1lICYmIHBhcmVudEhlaWdodCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuZG9tLm92ZXJoZWFkID0gb3ZlcmhlYWQ7XG4gICAgICAgICAgICB0aGlzLmRvbS5oZWlnaHQgPSB7XG4gICAgICAgICAgICAgIG91dGVyOiBwYXJlbnRIZWlnaHQsXG4gICAgICAgICAgICAgIGlubmVyOiBwYXJlbnRIZWlnaHQgLSBvdmVyaGVhZCxcbiAgICAgICAgICAgICAgc3BsaXQ6ICsoKHBhcmVudEhlaWdodCAtIG92ZXJoZWFkKSAvIDIpLFxuICAgICAgICAgICAgICBkZWZhdWx0OiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRIZWlnaHRXaXRoUGFyZW50OiAocGFyZW50Q2xhc3NOYW1lOiBzdHJpbmcgPSBudWxsLCBvdmVyaGVhZDogbnVtYmVyID0gMCwgZGVmYXVsdEhlaWdodDogbnVtYmVyKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5lbCkge1xuICAgICAgICAgICAgICB0aGlzLmRvbS53YWl0Rm9yUGFyZW50KHRoaXMuZWwsIHBhcmVudENsYXNzTmFtZSwgMTAsIDEwKS50aGVuKChwYXJlbnRFbDogRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChwYXJlbnRFbCkge1xuICAgICAgICAgICAgICAgICAgdGhpcy5kb20ud2FpdEZvclBhcmVudEhlaWdodChwYXJlbnRFbCkudGhlbigocGFyZW50SGVpZ2h0OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudEhlaWdodCA8IGRlZmF1bHRIZWlnaHQpIHBhcmVudEhlaWdodCA9IGRlZmF1bHRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnRIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRvbS5zZXRIZWlnaHQoK3BhcmVudEhlaWdodCwgb3ZlcmhlYWQpO1xuICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5kb20uc2V0SGVpZ2h0KGRlZmF1bHRIZWlnaHQsIG92ZXJoZWFkKTtcbiAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgdGhpcy5kb20uc2V0SGVpZ2h0KGRlZmF1bHRIZWlnaHQsIG92ZXJoZWFkKTtcbiAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZvY3VzTmV4dElucHV0KGVsOiBFbGVtZW50UmVmKTogdm9pZCB7XG4gICAgICAgICAgaWYgKGVsKSB7XG4gICAgICAgICAgICBsZXQgbGltaXQgPSA1O1xuICAgICAgICAgICAgbGV0IGlucHV0ID0gbnVsbDtcbiAgICAgICAgICAgIGxldCBuZXh0ID0gZWwubmF0aXZlRWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgICAgICAgICB3aGlsZSAobGltaXQgJiYgIWlucHV0KSB7XG4gICAgICAgICAgICAgIGlucHV0ID0gbmV4dC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPXRleHRdJyk7XG4gICAgICAgICAgICAgIGlmICghaW5wdXQpIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IG5leHQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1jaGVja2JveF0nKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoIWlucHV0KSB7XG4gICAgICAgICAgICAgICAgaW5wdXQgPSBuZXh0LnF1ZXJ5U2VsZWN0b3IoJ21hdC1zZWxlY3QnKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmICghaW5wdXQpIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IG5leHQucXVlcnlTZWxlY3RvcignYnV0dG9uJyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoIWlucHV0KSB7XG4gICAgICAgICAgICAgICAgaWYgKG5leHQubmF0aXZlRWxlbWVudCAmJiBuZXh0Lm5hdGl2ZUVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nKSB7XG4gICAgICAgICAgICAgICAgICBuZXh0ID0gbmV4dC5uYXRpdmVFbGVtZW50Lm5leHRFbGVtZW50U2libGluZztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5leHQubmV4dEVsZW1lbnRTaWJsaW5nKSB7XG4gICAgICAgICAgICAgICAgICBuZXh0ID0gPEVsZW1lbnQ+bmV4dDtcbiAgICAgICAgICAgICAgICAgIG5leHQgPSBuZXh0Lm5leHRFbGVtZW50U2libGluZztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgbGltaXQgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBsaW1pdC0tO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaW5wdXQpIHtcbiAgICAgICAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgRWxlbWVudFJlZikge1xuICAgICAgICAgICAgICAgIGlucHV0Lm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChJc0NhbGxhYmxlRnVuY3Rpb24obmV4dC5mb2N1cykpIHtcbiAgICAgICAgICAgICAgICBpbnB1dC5mb2N1cygpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldFdpdGhDb21wb25lbnRJbm5lckhlaWdodDogKGNvbXBvbmVudDogc3RyaW5nLCBjb21wb25lbnRJZCA9IDEsIG92ZXJoZWFkOiBudW1iZXIsIGRlZmF1bHRIZWlnaHQ6IG51bWJlcik6IFByb21pc2U8bnVtYmVyPiA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5kb20ucmVwbykge1xuICAgICAgICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5kb20ucmVwby5nZXRDb21wb25lbnRIZWlnaHQoY29tcG9uZW50KTtcbiAgICAgICAgICAgICAgaWYgKGhlaWdodCAmJiBoZWlnaHQuaW5uZXIpIHtcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBoZWlnaHQuaW5uZXI7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gZGVmYXVsdEhlaWdodDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHRoaXMuZG9tLnNldEhlaWdodCgraGVpZ2h0LCBvdmVyaGVhZCk7XG4gICAgICAgICAgICAgIHJlc29sdmUodGhpcy5kb20uaGVpZ2h0LmlubmVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuZG9tLnNldEhlaWdodCgrZGVmYXVsdEhlaWdodCwgb3ZlcmhlYWQpO1xuICAgICAgICAgICAgICByZXNvbHZlKHRoaXMuZG9tLmhlaWdodC5pbm5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgd2FpdEZvclBhcmVudDogKGVsOiBFbGVtZW50UmVmLCBjbGFzc05hbWU6IHN0cmluZyA9IG51bGwsIHRpbWU6IG51bWJlciA9IDUwLCBjb3VudGVyOiBudW1iZXIgPSA1KSA9PiB7XG4gICAgICAgICAgbGV0IGludGVydmFsO1xuICAgICAgICAgIGxldCBwYXJlbnRFbDtcbiAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICBwYXJlbnRFbCA9IHRoaXMuZG9tLmZpbmRQYXJlbnRFbGVtZW50KGVsLCBjbGFzc05hbWUpO1xuICAgICAgICAgICAgICBpZiAoIWNvdW50ZXIgfHwgKHBhcmVudEVsKSkge1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHBhcmVudEVsKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb3VudGVyLS07XG4gICAgICAgICAgICB9LCB0aW1lKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICB3YWl0Rm9yUGFyZW50SGVpZ2h0OiAoZWw6IEVsZW1lbnQsIHRpbWU6IG51bWJlciA9IDUsIGNvdW50ZXI6IG51bWJlciA9IDEwKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKCFjb3VudGVyIHx8IChlbCAmJiBlbC5jbGllbnRIZWlnaHQpKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZWwuY2xpZW50SGVpZ2h0KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb3VudGVyLS07XG4gICAgICAgICAgICB9LCB0aW1lKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaW5kUGFyZW50RWxlbWVudDogKGVsOiBFbGVtZW50UmVmLCBjbGFzc05hbWU6IHN0cmluZyA9IG51bGwpID0+IHtcbiAgICAgICAgICBsZXQgYXR0ZW1wdHMgPSAxMDtcbiAgICAgICAgICBsZXQgZm91bmQ7XG4gICAgICAgICAgaWYgKGVsICYmIGVsLm5hdGl2ZUVsZW1lbnQgJiYgZWwubmF0aXZlRWxlbWVudC5wYXJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICBsZXQgcGFyZW50ID0gZWwubmF0aXZlRWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgd2hpbGUgKCFmb3VuZCAmJiBhdHRlbXB0cykge1xuICAgICAgICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudC5jbGFzc0xpc3QgJiYgcGFyZW50LmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gcGFyZW50O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBmb3VuZCA9IHBhcmVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGF0dGVtcHRzLS07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgICAgfSxcbiAgICAgICAgc3RvcmU6IChrZXk6IHN0cmluZyA9IG51bGwpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5kb20ucmVwbyAmJiB0aGlzLm5hbWUgJiYgdGhpcy5pZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZG9tLnJlcG8ub25TZXNzaW9uKHRoaXMsIGtleSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkZXN0cm95OiAoKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuZG9tKSBEZXN0cm95Q29tcG9uZW50RG9tKHRoaXMuZG9tKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIF9pbml0aWFsaXplTG9nU3lzdGVtKCk6IENvbXBvbmVudExvZ0ludGVyZmFjZSB7XG4gICAgcmV0dXJuIDxDb21wb25lbnRMb2dJbnRlcmZhY2U+e1xuICAgICAgcmVwbzoge1xuICAgICAgICBtZXNzYWdlOiAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGAlYyR7bWVzc2FnZX1gO1xuICAgICAgICB9LFxuICAgICAgICBjb2xvcjogKHR5cGU6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGxldCBjb2xvciA9ICdhcXVhJztcbiAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3dhcm4nOlxuICAgICAgICAgICAgICBjb2xvciA9ICdvcmFuZ2UnO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2ZvcmNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgIGNhc2UgJ2Rlc3Ryb3knOlxuICAgICAgICAgICAgICBjb2xvciA9ICdyZWQnO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2luZm8nOlxuICAgICAgICAgICAgICBjb2xvciA9ICdhcXVhJztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdldmVudCc6XG4gICAgICAgICAgICAgIGNvbG9yID0gJ3llbGxvdyc7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnb25TZXNzaW9uJzpcbiAgICAgICAgICAgIGNhc2UgJ2V2ZW50LXRyaWdnZXInOlxuICAgICAgICAgICAgICBjb2xvciA9ICdnb2xkJztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjYWNoZS1pbic6XG4gICAgICAgICAgICAgIGNvbG9yID0gJ2dyZWVuJztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjYWNoZS1vdXQnOlxuICAgICAgICAgICAgICBjb2xvciA9ICdkYXJrZ3JlZW4nO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2RvbSc6XG4gICAgICAgICAgICAgIGNvbG9yID0gJ2Jyb3duJztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkZWJ1Zyc6XG4gICAgICAgICAgICAgIGNvbG9yID0gJ3BpbmsnO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2FwaSc6XG4gICAgICAgICAgICAgIGNvbG9yID0gJ2RhcmtncmVlbic7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY29uZmlnJzpcbiAgICAgICAgICAgICAgY29sb3IgPSAncGluayc7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndGhlbWUnOlxuICAgICAgICAgICAgICBjb2xvciA9ICdwdXJwbGUnO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIGNvbG9yID0gJ2FxdWEnO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGBjb2xvcjogJHtjb2xvcn1gO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgZW5hYmxlZDogKHR5cGU6IHN0cmluZyA9ICcnLCBjb21wb25lbnQ6IHN0cmluZyA9IG51bGwpID0+IHtcbiAgICAgICAgICBpZiAoSXNPYmplY3QoUG9wRW52LCB0cnVlKSAmJiBQb3BFbnYuZGVidWcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlICYmIEFycmF5LmlzQXJyYXkoUG9wRW52LmRlYnVnVHlwZXMpKSB7XG4gICAgICAgICAgICAgIGlmIChQb3BFbnYuZGVidWdUeXBlcy5pbmNsdWRlcyh0eXBlKSkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIFBvcEVudi5kZWJ1Z0xldmVsID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICBpZiAoWydlcnJvcicsICdvblNlc3Npb24nXS5pbmNsdWRlcyh0eXBlKSAmJiBQb3BFbnYuZGVidWcgPj0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChbJ3dhcm5pbmcnLCAnaW5mbyddLmluY2x1ZGVzKHR5cGUpICYmIFBvcEVudi5kZWJ1ZyA+PSAyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKFsnZXZlbnRzJ10uaW5jbHVkZXModHlwZSkgJiYgUG9wRW52LmRlYnVnID49IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvbXBvbmVudCAmJiB0eXBlb2YgUG9wRW52LmRlYnVnQ29tcG9uZW50cyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFBvcEVudi5kZWJ1Z0NvbXBvbmVudHMuc2VhcmNoKGNvbXBvbmVudCkgPiAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgaW5pdDogKGNvbXBvbmVudE5hbWU6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nLCBkYXRhOiBhbnkgPSAnJywgZm9yY2UgPSBmYWxzZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHR5cGUgPSAnaW5pdCc7XG4gICAgICAgICAgaWYgKHRoaXMubG9nLnJlcG8uZW5hYmxlZCh0eXBlLCBjb21wb25lbnROYW1lKSB8fCBmb3JjZSkgY29uc29sZS5sb2codGhpcy5sb2cucmVwby5tZXNzYWdlKGAke2NvbXBvbmVudE5hbWV9OiR7bWVzc2FnZX1gKSwgdGhpcy5sb2cucmVwby5jb2xvcigoZm9yY2UgPyAnZm9yY2UnIDogdHlwZSkpLCBkYXRhKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkZWJ1ZzogKGNvbXBvbmVudE5hbWU6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nLCBkYXRhOiBhbnkgPSAnJywgZm9yY2UgPSBmYWxzZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHR5cGUgPSAnZGVidWcnO1xuICAgICAgICAgIGlmICh0aGlzLmxvZy5yZXBvLmVuYWJsZWQodHlwZSwgY29tcG9uZW50TmFtZSkgfHwgZm9yY2UpIGNvbnNvbGUubG9nKHRoaXMubG9nLnJlcG8ubWVzc2FnZShgJHtjb21wb25lbnROYW1lfToke21lc3NhZ2V9YCksIHRoaXMubG9nLnJlcG8uY29sb3IoKGZvcmNlID8gJ2ZvcmNlJyA6IHR5cGUpKSwgZGF0YSk7XG4gICAgICAgIH0sXG5cblxuICAgICAgICBjYWNoZTogKGNvbXBvbmVudE5hbWU6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nLCBzZXQgPSB0cnVlLCBmb3JjZSA9IGZhbHNlKSA9PiB7XG4gICAgICAgICAgbGV0IHR5cGUgPSAnY2FjaGUnO1xuICAgICAgICAgIGlmICh0aGlzLmxvZy5yZXBvLmVuYWJsZWQodHlwZSwgY29tcG9uZW50TmFtZSkgfHwgZm9yY2UpIHtcbiAgICAgICAgICAgIHR5cGUgPSBzZXQgPyAnY2FjaGUtaW4nIDogJ2NhY2hlLW91dCc7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmxvZy5yZXBvLm1lc3NhZ2UoYCR7Y29tcG9uZW50TmFtZX06JHttZXNzYWdlfWApLCB0aGlzLmxvZy5yZXBvLmNvbG9yKChmb3JjZSA/ICdmb3JjZScgOiB0eXBlKSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuXG4gICAgICAgIHdhcm46IChjb21wb25lbnROYW1lOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZywgZGF0YTogYW55ID0gJycsIGZvcmNlID0gZmFsc2UpID0+IHtcbiAgICAgICAgICBjb25zdCB0eXBlID0gJ3dhcm4nO1xuICAgICAgICAgIGlmICh0aGlzLmxvZy5yZXBvLmVuYWJsZWQodHlwZSwgY29tcG9uZW50TmFtZSkgfHwgZm9yY2UpIGNvbnNvbGUubG9nKHRoaXMubG9nLnJlcG8ubWVzc2FnZShgJHtjb21wb25lbnROYW1lfToke21lc3NhZ2V9YCksIHRoaXMubG9nLnJlcG8uY29sb3IoKGZvcmNlID8gJ2ZvcmNlJyA6IHR5cGUpKSwgZGF0YSk7XG4gICAgICAgIH0sXG5cblxuICAgICAgICBpbmZvOiAoY29tcG9uZW50TmFtZTogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcsIGRhdGE6IGFueSA9ICcnLCBmb3JjZSA9IGZhbHNlKSA9PiB7XG4gICAgICAgICAgY29uc3QgdHlwZSA9ICdpbmZvJztcbiAgICAgICAgICBpZiAodGhpcy5sb2cucmVwby5lbmFibGVkKHR5cGUsIGNvbXBvbmVudE5hbWUpIHx8IGZvcmNlKSBjb25zb2xlLmxvZyh0aGlzLmxvZy5yZXBvLm1lc3NhZ2UoYCR7Y29tcG9uZW50TmFtZX06JHttZXNzYWdlfWApLCB0aGlzLmxvZy5yZXBvLmNvbG9yKChmb3JjZSA/ICdmb3JjZScgOiB0eXBlKSksIGRhdGEpO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgdGhlbWU6IChjb21wb25lbnROYW1lOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZywgZGF0YTogYW55ID0gJycsIGZvcmNlID0gZmFsc2UpID0+IHtcbiAgICAgICAgICBjb25zdCB0eXBlID0gJ3RoZW1lJztcbiAgICAgICAgICBpZiAodGhpcy5sb2cucmVwby5lbmFibGVkKHR5cGUsIGNvbXBvbmVudE5hbWUpIHx8IGZvcmNlKSBjb25zb2xlLmxvZyh0aGlzLmxvZy5yZXBvLm1lc3NhZ2UoYCR7Y29tcG9uZW50TmFtZX06JHttZXNzYWdlfWApLCB0aGlzLmxvZy5yZXBvLmNvbG9yKChmb3JjZSA/ICdmb3JjZScgOiB0eXBlKSksIGRhdGEpO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgZXZlbnQ6IChjb21wb25lbnROYW1lOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZywgZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSwgZm9yY2UgPSBmYWxzZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHR5cGUgPSAnZXZlbnQnO1xuICAgICAgICAgIGlmICh0aGlzLmxvZy5yZXBvLmVuYWJsZWQodHlwZSwgY29tcG9uZW50TmFtZSkgfHwgZm9yY2UpIGNvbnNvbGUubG9nKHRoaXMubG9nLnJlcG8ubWVzc2FnZShgJHtjb21wb25lbnROYW1lfToke21lc3NhZ2V9YCksIHRoaXMubG9nLnJlcG8uY29sb3IoKGZvcmNlID8gJ2ZvcmNlJyA6IHR5cGUpKSwgZXZlbnQpO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgZXJyb3I6IChjb21wb25lbnROYW1lOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZywgZGF0YTogYW55ID0gJycsIGZvcmNlID0gZmFsc2UpID0+IHtcbiAgICAgICAgICBjb25zdCB0eXBlID0gJ2Vycm9yJztcbiAgICAgICAgICBpZiAodGhpcy5sb2cucmVwby5lbmFibGVkKHR5cGUsIGNvbXBvbmVudE5hbWUpIHx8IGZvcmNlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmxvZy5yZXBvLm1lc3NhZ2UoYCR7Y29tcG9uZW50TmFtZX06JHttZXNzYWdlfWApLCB0aGlzLmxvZy5yZXBvLmNvbG9yKChmb3JjZSA/ICdmb3JjZScgOiB0eXBlKSksIGRhdGEpO1xuICAgICAgICAgICAgLy8gdGhyb3cgbmV3IEVycm9yKCdtZXNzYWdlJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBpbml0OiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmxvZy5yZXBvLmVuYWJsZWQoJ2luaXQnLCB0aGlzLm5hbWUpKSBjb25zb2xlLmxvZyh0aGlzLmxvZy5yZXBvLm1lc3NhZ2UoYCR7dGhpcy5uYW1lfTppbml0YCksIHRoaXMubG9nLnJlcG8uY29sb3IoJ2luaXQnKSwgdGhpcyk7XG4gICAgICB9LFxuXG4gICAgICBkZWJ1ZzogKG1zZyA9ICdEZWJ1ZycsIGRhdGE6IGFueSA9ICcnKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmxvZy5yZXBvLmVuYWJsZWQoJ2RlYnVnJywgdGhpcy5uYW1lKSkgY29uc29sZS5sb2codGhpcy5sb2cucmVwby5tZXNzYWdlKGAke3RoaXMubmFtZX06JHttc2d9YCksIHRoaXMubG9nLnJlcG8uY29sb3IoJ2RlYnVnJyksIGRhdGEpO1xuICAgICAgfSxcblxuICAgICAgZXJyb3I6IChtc2cgPSAnRXJyb3InLCBlcnJvcjogYW55ID0gJycpID0+IHtcbiAgICAgICAgaWYgKHRoaXMubG9nLnJlcG8uZW5hYmxlZCgnZXJyb3InLCB0aGlzLm5hbWUpKSBjb25zb2xlLmxvZyh0aGlzLmxvZy5yZXBvLm1lc3NhZ2UoYCR7dGhpcy5uYW1lfToke21zZ31gKSwgdGhpcy5sb2cucmVwby5jb2xvcignZXJyb3InKSwgZXJyb3IpO1xuICAgICAgfSxcblxuICAgICAgd2FybjogKG1zZyA9ICdXYXJuaW5nJywgZGF0YTogYW55ID0gJycpID0+IHtcbiAgICAgICAgaWYgKHRoaXMubG9nLnJlcG8uZW5hYmxlZCgnd2FybicsIHRoaXMubmFtZSkpIGNvbnNvbGUubG9nKHRoaXMubG9nLnJlcG8ubWVzc2FnZShgJHt0aGlzLm5hbWV9OiR7bXNnfWApLCB0aGlzLmxvZy5yZXBvLmNvbG9yKCdlcnJvcicpLCBkYXRhKTtcbiAgICAgIH0sXG5cbiAgICAgIGluZm86IChtc2cgPSAnaW5mbycsIGRhdGE6IGFueSA9ICcnKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmxvZy5yZXBvLmVuYWJsZWQoJ2V2ZW50JywgdGhpcy5uYW1lKSkgY29uc29sZS5sb2codGhpcy5sb2cucmVwby5tZXNzYWdlKGAke3RoaXMubmFtZX06JHttc2d9YCksIHRoaXMubG9nLnJlcG8uY29sb3IoJ2luZm8nKSwgZGF0YSk7XG4gICAgICB9LFxuXG4gICAgICBldmVudDogKG1zZyA9ICdldmVudCcsIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UpID0+IHtcbiAgICAgICAgaWYgKHRoaXMubG9nLnJlcG8uZW5hYmxlZCgnZXZlbnQnLCB0aGlzLm5hbWUpKSBjb25zb2xlLmxvZyh0aGlzLmxvZy5yZXBvLm1lc3NhZ2UoYCR7dGhpcy5uYW1lfToke21zZ31gKSwgdGhpcy5sb2cucmVwby5jb2xvcignZXZlbnQnKSwgZXZlbnQpO1xuICAgICAgfSxcblxuICAgICAgY29uZmlnOiAobXNnID0gJ2NvbmZpZycsIGNvbmZpZzogYW55ID0gJycpID0+IHtcbiAgICAgICAgaWYgKHRoaXMubG9nLnJlcG8uZW5hYmxlZCgnY29uZmlnJywgdGhpcy5uYW1lKSkgY29uc29sZS5sb2codGhpcy5sb2cucmVwby5tZXNzYWdlKGAke3RoaXMubmFtZX06JHttc2d9YCksIHRoaXMubG9nLnJlcG8uY29sb3IoJ2NvbmZpZycpLCBjb25maWcpO1xuICAgICAgfSxcbiAgICAgIGRlc3Ryb3k6ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMubG9nLnJlcG8uZW5hYmxlZCgnZGVzdHJveScsIHRoaXMubmFtZSkpIGNvbnNvbGUubG9nKHRoaXMubG9nLnJlcG8ubWVzc2FnZShgJHt0aGlzLm5hbWV9OmRlc3Ryb3lgKSwgdGhpcy5sb2cucmVwby5jb2xvcignZGVzdHJveScpKTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxufVxuIl19