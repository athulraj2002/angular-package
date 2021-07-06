import { PopBaseEventInterface } from '../pop-common.model';
export declare class PopLogService {
    env?: any;
    name: string;
    constructor(env?: any);
    message(message: string): string;
    color(type: string): string;
    enabled(type?: string, component?: string): boolean;
    init(componentName: string, message: string, data?: any, force?: boolean): void;
    debug(componentName: string, message: string, data?: any, force?: boolean): void;
    cache(componentName: string, message: string, set?: boolean, force?: boolean): void;
    warn(componentName: string, message: string, data?: any, force?: boolean): void;
    info(componentName: string, message: string, data?: any, force?: boolean): void;
    theme(componentName: string, message: string, data?: any, force?: boolean): void;
    event(componentName: string, message: string, event: PopBaseEventInterface, force?: boolean): void;
    error(componentName: string, message: string, data?: any, force?: boolean): void;
}
