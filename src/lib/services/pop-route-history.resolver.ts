import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { GetSessionSiteVar, IsArray, SetSessionSiteVar } from '../pop-common-utility';


export interface RouteHistoryInterface {
  name: string;
  base: string;
  path: string;
}


@Injectable({
  providedIn: 'root',
})
export class PopRouteHistoryResolver implements Resolve<any> {
  sessionVar = 'Navigation.history';


  constructor(
    private router: Router,
  ){
    // ToDo: Grab enitty map dynamically
    router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event) => {
      const path = window.location.pathname.split('/');
      path.shift();
      path.pop();
      SetSessionSiteVar('App.name', path[ 0 ]);
      SetSessionSiteVar('App.entity', path[ path.length - 1 ]);
    });
  }


  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean{
    const path = window.location.pathname.split('/');
    path.shift();
    path.pop();
    SetSessionSiteVar('App.name', path[ 0 ]);
    SetSessionSiteVar('App.entity', path[ path[ path.length - 1 ] ]);
    this.saveNavigationHistory({ name: '', base: path[ 0 ], path: state.url });
    return true;
  }


  saveNavigationHistory(history: RouteHistoryInterface){

    let historyArray = GetSessionSiteVar(this.sessionVar);
    if( !historyArray ) historyArray = [];

    // Because a non-existing siteVar returns an object and we need it to be an array.
    if( typeof historyArray[ 0 ] === 'undefined' ) historyArray = [];

    // Make sure that we don't have two entries in a row of the same thing.
    if( typeof historyArray[ 0 ] !== 'undefined' && historyArray[ 0 ].path == history.path ) return;

    // Add the new entry and keep the multiple_max to 20 for now.
    historyArray.unshift(history);
    if( historyArray.length > 20 ) historyArray.splice(-1, 1);

    SetSessionSiteVar(this.sessionVar, historyArray);
  }


  isPreviousHistory(){
    const historyArray = GetSessionSiteVar(this.sessionVar);
    return IsArray(historyArray, true);
  }


  goBack(count: number = 1){

    if( count < 1 ) count = 1;

    const historyArray = GetSessionSiteVar(this.sessionVar);
    const path = window.location.pathname.split('/');

    // If they came from outside of pop then don't send them back there but instead send them to apps main page.
    if( typeof historyArray.length === 'undefined' || typeof historyArray[ 1 ] === 'undefined' ){
      this.router.navigate([ '/' ]);
      return;
    }

    // The where they should go back to and also purge that route from the array.
    const goBackTo = ( historyArray[ count ] !== 'undefined' ? historyArray[ count ] : historyArray.slice(-1)[ 0 ] );
    if( historyArray.length ) historyArray.shift();
    SetSessionSiteVar(this.sessionVar, historyArray);

    // If where they are going back to is in the same app then use the router otherwise do reload to sthat route.
    if( goBackTo.base === path[ 1 ] ){
      this.router.navigate([ goBackTo.path ]).catch(() => true);
    }else{
      window.location.href = window.location.origin + '/' + goBackTo.base + goBackTo.path;
    }
  }

}
