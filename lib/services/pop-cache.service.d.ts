import { Observable, Subject } from 'rxjs';
/**
 * Cache Service is an observables based in-memory cache implementation
 * Keeps track of in-flight observables and sets a default expiry for cached values
 */
export declare class PopCacheService {
    private name;
    private cache;
    private inFlightObservables;
    readonly DEFAULT_MAX_AGE: number;
    constructor();
    /**
     * Gets the value from cache if the key is provided.
     * If no value exists in cache, then check if the same call exists
     * in flight, if so return the subject. If not create a new
     * Subject inFlightObservable and return the source observable.
     */
    get(type: string, key: string, fallback?: Observable<any>, maxAge?: number): Observable<any> | Subject<any>;
    clear(cacheType: string, cacheKey?: string): void;
    clearAll(): void;
    /**
     * Sets the value with key in the cache
     * Notifies all observers of the new value
     */
    set(type: string, key: string, value: any, maxAge?: number): void;
    /**
     * Checks if the a key exists in cache
     */
    has(type: string, key: string): boolean;
    /**
     * Publishes the value to all observers of the given
     * in progress observables if observers exist.
     */
    private notifyInFlightObservers;
    /**
     * Checks if the key exists and  has not expired.
     */
    private hasValidCachedValue;
}
