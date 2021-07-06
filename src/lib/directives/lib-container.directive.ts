import { Directive, ViewContainerRef } from '@angular/core';
import { ServiceInjector } from '../pop-common.model';
import { PopContainerService } from '../services/pop-container.service';


@Directive({
  selector: '[libContainer]',
})

export class LibContainerDirective {
  private templateContainerRepo: PopContainerService;
  constructor(
    vc: ViewContainerRef,
  ){
    this.templateContainerRepo = ServiceInjector.get(PopContainerService);
    this.templateContainerRepo.registerContainer(vc);
  }
}
