import { EntityAccessInterface, EntityParams, EntityParamsInterface } from '../../../pop-common.model';
export declare class PopEntityUtilParamService {
    private store;
    private mapById;
    private mapByRoute;
    constructor();
    getEntityParamsWithPath(path: string, entityId?: number): EntityParams;
    setEntityParams(params: EntityParamsInterface): void;
    getEntityParams(internal_name: string | number, entityId?: number): EntityParamsInterface;
    getAccess(internal_name: string | number, accessType?: string): EntityAccessInterface | null;
    getAlias(internal_name: string | number, accessType?: string): EntityAccessInterface | null;
    /**
     * Checks if the user has permissons to the specific type of an entity depending upon the local token details.
     *
     * @param appName - The name of the app to check. IE: admin, cis, etc...
     * @param entityName - The name of the entity inside the app to check: IE: For the admin app, users.
     * @param accessType - The type of permissons to check. Enum [can_create, can_read, can_update, can_delete]
     */
    checkAccess(internal_name: string | number, accessType: string): boolean;
}
