import { Injectable, OnDestroy } from '@angular/core';
import { PopExtendService } from '../../../services/pop-extend.service';


@Injectable({ providedIn: 'root' })
export class PopEntityExtendService extends PopExtendService implements OnDestroy {
  constructor(){
    super();
  }


  ngOnDestroy(){
    super.ngOnDestroy();
  }
}
