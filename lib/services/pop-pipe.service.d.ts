import { ToYesNoPipe } from '../pipes/toYesNo.pipe';
import { PhonePipe } from '../pipes/phone.pipe';
import { TruncatePipe } from '../pipes/truncate.pipe';
import { ToActiveOrArchivedPipe } from '../pipes/toActiveOrArchived.pipe';
import { CoreConfig, Entity, KeyMap } from '../pop-common.model';
import { PopResourceService } from './pop-resource.service';
import { LabelPipe } from '../pipes/label.pipe';
export declare class PopPipeService {
    private resource;
    private name;
    loaded: boolean;
    constructor(resource: PopResourceService);
    private resources;
    private asset;
    private assetMap;
    active: ToActiveOrArchivedPipe;
    yesno: ToYesNoPipe;
    truncate: TruncatePipe;
    phone: PhonePipe;
    label: LabelPipe;
    /**
     * Mutate a value with a specified transformation
     * @param value
     * @param transformation
     * @param core
     */
    transform(value: string | number | boolean, transformation: any, core?: CoreConfig): any;
    loadResources(allowCache?: boolean): Promise<unknown>;
    setAsset(assetName: string, data: KeyMap<Entity>): void;
    updateEntityAlias(entityId: string, alias: any): void;
    /**
     * A helper method to prepareTableData
     * @param row
     * @param transformations
     */
    transformObjectValues(obj: Object, transformations: {}, core?: CoreConfig): Object;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    private _setAssetMap;
}
