import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { PopBaseService } from './pop-base.service';

@Injectable({
  providedIn: 'root'
})
export class PopAuthGuardService implements CanActivate {

  constructor(public base: PopBaseService, public router: Router) {
  }

  canActivate(): boolean {
    if (this.base.isAuthExpired()) {
      this.router.navigate(['login']).catch((e) => console.log(e));
      return false;
    }
    return true;
  }
}
