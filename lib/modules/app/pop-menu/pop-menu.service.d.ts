import { PopBaseService } from '../../../services/pop-base.service';
export declare class PopMenuService {
    protected srv: {
        base: PopBaseService;
    };
    isAuthenticated(): boolean;
    changeBusiness(id: number): void;
}
