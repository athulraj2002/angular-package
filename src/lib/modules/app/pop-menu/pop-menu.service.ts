import { Injectable } from '@angular/core';
import { PopBaseService } from '../../../services/pop-base.service';
import { ServiceInjector } from '../../../pop-common.model';


@Injectable()
export class PopMenuService {
  protected srv: {
    base: PopBaseService,
  } = {
    base: ServiceInjector.get(PopBaseService),
  };

  isAuthenticated(){
    return !this.srv.base.isAuthExpired();
  }


  changeBusiness(id: number){
    this.srv.base.switchBusiness(id);
  }
}
