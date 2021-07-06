import { PopRequestService } from '../../../services/pop-request.service';
import { CoreConfig, Dictionary, FieldConfig, FieldCustomSettingInterface, PopBaseEventInterface } from '../../../pop-common.model';
import { PopExtendService } from '../../../services/pop-extend.service';
export declare class PopEntityFieldService extends PopExtendService {
    protected name: string;
    protected srv: {
        request: PopRequestService;
    };
    constructor();
    addEntryValue(core: CoreConfig, field: FieldConfig): {
        data: {};
        entry: import("../../../pop-common.model").FieldEntry;
        config: {};
        index: number;
    };
    removeEntryValue(core: CoreConfig, field: FieldConfig, dataKey: number): Promise<boolean>;
    /**
     * Update a value for a single field item column of a field record
     * @param core
     * @param field
     * @param event
     */
    updateFieldItem(core: CoreConfig, field: FieldConfig, event: PopBaseEventInterface): Promise<boolean>;
    /**
     * Set any field settings for this field & field items, and apply and stored values
     * @param field
     * @param settings
     */
    setFieldCustomSetting(field: FieldConfig, settings: Dictionary<FieldCustomSettingInterface>): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    private _my;
}
