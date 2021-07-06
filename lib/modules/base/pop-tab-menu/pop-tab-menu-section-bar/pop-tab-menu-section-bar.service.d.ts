import { PopBaseService } from '../../../../services/pop-base.service';
export declare class PopTabMenuSectionBarService {
    private baseRepo;
    private readonly env?;
    constructor(baseRepo: PopBaseService, env?: any);
    /**
     * Store the current tab into onSession memory
     * @param name
     * @returns void
     */
    setSectionSession(internal_name: string, slug: string): void;
    /**
     * Get latest path
     */
    getPathSession(internal_name: string): any;
}
