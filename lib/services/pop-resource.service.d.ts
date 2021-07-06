import { OnDestroy } from '@angular/core';
import { CoreConfig, Dictionary, ResourceConfig, ResourceInterface } from '../pop-common.model';
import { PopExtendService } from './pop-extend.service';
export declare class PopResourceService extends PopExtendService implements OnDestroy {
    name: string;
    private cache;
    constructor();
    /**
     * This fx will map the api calls for a collection of resources
     * @param collection
     * @param core
     */
    setCollection(collection: Dictionary<ResourceInterface>, core?: CoreConfig): Promise<boolean>;
    /**
     * This fx will extract the data from a resource collection
     * @param collection
     * @param core
     */
    getCollection(collection: Dictionary<ResourceConfig>): {};
    /**
     * This fx will reload a single existing resource
     * @param collection
     */
    reloadResource(core: CoreConfig, resource: ResourceConfig): Promise<ResourceConfig>;
    ngOnDestroy(): void;
}
