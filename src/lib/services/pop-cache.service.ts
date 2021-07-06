import { Observable, of, Subject,} from 'rxjs';
import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { IsString } from '../pop-common-utility';


interface CacheContent {
  expiry: number;
  value: any;
}


/**
 * Cache Service is an observables based in-memory cache implementation
 * Keeps track of in-flight observables and sets a default expiry for cached values
 */
@Injectable({ providedIn: 'root' })
export class PopCacheService {
  private name = 'PopCacheService';
  private cache = {};
  private inFlightObservables: Map<string, Subject<any>> = new Map<string, Subject<any>>();
  readonly DEFAULT_MAX_AGE: number = 60000; // 1 minute

  constructor(){
  }


  /**
   * Gets the value from cache if the key is provided.
   * If no value exists in cache, then check if the same call exists
   * in flight, if so return the subject. If not create a new
   * Subject inFlightObservable and return the source observable.
   */
  get(type: string, key: string, fallback?: Observable<any>, maxAge?: number): Observable<any> | Subject<any>{
    if( this.hasValidCachedValue(type, key) ){
      return of(this.cache[ type ].get(key).value);
    }

    if( !maxAge ){
      maxAge = this.DEFAULT_MAX_AGE;
    }

    if( fallback && fallback instanceof Observable ){
      if( this.inFlightObservables.has(key) ){
        const sub = this.inFlightObservables.get(key);
        if( sub ){
          sub.complete();
          sub.unsubscribe();
        }
      }
      this.inFlightObservables.set(key, new Subject());
      return fallback.pipe(tap((value) => {
        this.set(type, key, value, maxAge);
      }));
    }else{
      return of(null);
      // return throwError('Requested key is not available in Cache');
    }
  }


  clear(cacheType: string, cacheKey?: string): void{
    if( IsString(cacheType, true) ){
      if( IsString(cacheKey, true) ){
        if( this.cache[ cacheType ] && this.has(cacheType, cacheKey) ){
          this.cache[ cacheType ].delete(cacheKey);
        }
      }else{
        if( this.cache[ cacheType ] ) delete this.cache[ cacheType ];
      }
    }
  }


  clearAll(){
    this.cache = {};
  }


  /**
   * Sets the value with key in the cache
   * Notifies all observers of the new value
   */
  set(type: string, key: string, value: any, maxAge: number = this.DEFAULT_MAX_AGE): void{
    if( !this.cache[ type ] ) this.cache[ type ] = <Map<string, CacheContent> >new Map<string, CacheContent>();
    this.cache[ type ].set(key, { value: value, expiry: Date.now() + maxAge });
    this.notifyInFlightObservers(key, value);
  }


  /**
   * Checks if the a key exists in cache
   */
  has(type: string, key: string): boolean{
    if( this.cache[ type ] ){
      return this.cache[ type ].has(key);
    }
    return false;
  }


  /**
   * Publishes the value to all observers of the given
   * in progress observables if observers exist.
   */
  private notifyInFlightObservers(key: string, value: any): void{
    if( this.inFlightObservables.has(key) ){
      const inFlight = this.inFlightObservables.get(key);
      const observersCount = inFlight.observers.length;
      if( observersCount ){
        inFlight.next(value);
      }
      inFlight.complete();
      this.inFlightObservables.delete(key);
    }
  }


  /**
   * Checks if the key exists and  has not expired.
   */
  private hasValidCachedValue(type: string, key: string): boolean{

    if( this.cache[ type ] && this.cache[ type ].has(key) ){
      if( this.cache[ type ].get(key).expiry < Date.now() ){
        this.cache[ type ].delete(key);
        return false;
      }
      return true;
    }else{
      return false;
    }
  }
}
