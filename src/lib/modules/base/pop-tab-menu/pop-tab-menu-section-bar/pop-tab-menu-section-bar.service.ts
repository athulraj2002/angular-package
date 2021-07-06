import { Inject, Injectable } from '@angular/core';
import { PopBaseService } from '../../../../services/pop-base.service';
import { PopBusiness } from '../../../../pop-common.model';
import { GetSessionSiteVar, SetSessionSiteVar, TitleCase } from '../../../../pop-common-utility';


@Injectable({
  providedIn: 'root'
})
export class PopTabMenuSectionBarService {

  constructor(
    private baseRepo: PopBaseService,
    @Inject('env') private readonly env?
  ){
  }

  /**
   * Store the current tab into onSession memory
   * @param name
   * @returns void
   */
  setSectionSession(internal_name: string, slug: string): void{
    if( internal_name ) SetSessionSiteVar(`Business.${PopBusiness.id}.Entity.${TitleCase(internal_name)}.TabMenu.Main.section`, slug);
  }


  /**
   * Get latest path
   */
  getPathSession(internal_name: string){
    return GetSessionSiteVar(`Business.${PopBusiness.id}.Entity.${TitleCase(internal_name)}.TabMenu.Main.section`);
  }

}
