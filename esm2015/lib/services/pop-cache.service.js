import { Observable, of, Subject, } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { IsString } from '../pop-common-utility';
import * as i0 from "@angular/core";
/**
 * Cache Service is an observables based in-memory cache implementation
 * Keeps track of in-flight observables and sets a default expiry for cached values
 */
export class PopCacheService {
    constructor() {
        this.name = 'PopCacheService';
        this.cache = {};
        this.inFlightObservables = new Map();
        this.DEFAULT_MAX_AGE = 60000; // 1 minute
    }
    /**
     * Gets the value from cache if the key is provided.
     * If no value exists in cache, then check if the same call exists
     * in flight, if so return the subject. If not create a new
     * Subject inFlightObservable and return the source observable.
     */
    get(type, key, fallback, maxAge) {
        if (this.hasValidCachedValue(type, key)) {
            return of(this.cache[type].get(key).value);
        }
        if (!maxAge) {
            maxAge = this.DEFAULT_MAX_AGE;
        }
        if (fallback && fallback instanceof Observable) {
            if (this.inFlightObservables.has(key)) {
                const sub = this.inFlightObservables.get(key);
                if (sub) {
                    sub.complete();
                    sub.unsubscribe();
                }
            }
            this.inFlightObservables.set(key, new Subject());
            return fallback.pipe(tap((value) => {
                this.set(type, key, value, maxAge);
            }));
        }
        else {
            return of(null);
            // return throwError('Requested key is not available in Cache');
        }
    }
    clear(cacheType, cacheKey) {
        if (IsString(cacheType, true)) {
            if (IsString(cacheKey, true)) {
                if (this.cache[cacheType] && this.has(cacheType, cacheKey)) {
                    this.cache[cacheType].delete(cacheKey);
                }
            }
            else {
                if (this.cache[cacheType])
                    delete this.cache[cacheType];
            }
        }
    }
    clearAll() {
        this.cache = {};
    }
    /**
     * Sets the value with key in the cache
     * Notifies all observers of the new value
     */
    set(type, key, value, maxAge = this.DEFAULT_MAX_AGE) {
        if (!this.cache[type])
            this.cache[type] = new Map();
        this.cache[type].set(key, { value: value, expiry: Date.now() + maxAge });
        this.notifyInFlightObservers(key, value);
    }
    /**
     * Checks if the a key exists in cache
     */
    has(type, key) {
        if (this.cache[type]) {
            return this.cache[type].has(key);
        }
        return false;
    }
    /**
     * Publishes the value to all observers of the given
     * in progress observables if observers exist.
     */
    notifyInFlightObservers(key, value) {
        if (this.inFlightObservables.has(key)) {
            const inFlight = this.inFlightObservables.get(key);
            const observersCount = inFlight.observers.length;
            if (observersCount) {
                inFlight.next(value);
            }
            inFlight.complete();
            this.inFlightObservables.delete(key);
        }
    }
    /**
     * Checks if the key exists and  has not expired.
     */
    hasValidCachedValue(type, key) {
        if (this.cache[type] && this.cache[type].has(key)) {
            if (this.cache[type].get(key).expiry < Date.now()) {
                this.cache[type].delete(key);
                return false;
            }
            return true;
        }
        else {
            return false;
        }
    }
}
PopCacheService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopCacheService_Factory() { return new PopCacheService(); }, token: PopCacheService, providedIn: "root" });
PopCacheService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
PopCacheService.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWNhY2hlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvc2VydmljZXMvcG9wLWNhY2hlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsT0FBTyxHQUFFLE1BQU0sTUFBTSxDQUFDO0FBQy9DLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNyQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQzs7QUFTakQ7OztHQUdHO0FBRUgsTUFBTSxPQUFPLGVBQWU7SUFNMUI7UUFMUSxTQUFJLEdBQUcsaUJBQWlCLENBQUM7UUFDekIsVUFBSyxHQUFHLEVBQUUsQ0FBQztRQUNYLHdCQUFtQixHQUE4QixJQUFJLEdBQUcsRUFBd0IsQ0FBQztRQUNoRixvQkFBZSxHQUFXLEtBQUssQ0FBQyxDQUFDLFdBQVc7SUFHckQsQ0FBQztJQUdEOzs7OztPQUtHO0lBQ0gsR0FBRyxDQUFDLElBQVksRUFBRSxHQUFXLEVBQUUsUUFBMEIsRUFBRSxNQUFlO1FBQ3hFLElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRTtZQUN2QyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFFLElBQUksQ0FBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUM5QztRQUVELElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDWCxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztTQUMvQjtRQUVELElBQUksUUFBUSxJQUFJLFFBQVEsWUFBWSxVQUFVLEVBQUU7WUFDOUMsSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNyQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLEdBQUcsRUFBRTtvQkFDUCxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ2YsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO2lCQUNuQjthQUNGO1lBQ0QsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ2pELE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ0w7YUFBSTtZQUNILE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hCLGdFQUFnRTtTQUNqRTtJQUNILENBQUM7SUFHRCxLQUFLLENBQUMsU0FBaUIsRUFBRSxRQUFpQjtRQUN4QyxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDN0IsSUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUM1QixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUUsU0FBUyxDQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQUU7b0JBQzVELElBQUksQ0FBQyxLQUFLLENBQUUsU0FBUyxDQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUMxQzthQUNGO2lCQUFJO2dCQUNILElBQUksSUFBSSxDQUFDLEtBQUssQ0FBRSxTQUFTLENBQUU7b0JBQUcsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFFLFNBQVMsQ0FBRSxDQUFDO2FBQzlEO1NBQ0Y7SUFDSCxDQUFDO0lBR0QsUUFBUTtRQUNOLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLENBQUM7SUFHRDs7O09BR0c7SUFDSCxHQUFHLENBQUMsSUFBWSxFQUFFLEdBQVcsRUFBRSxLQUFVLEVBQUUsU0FBaUIsSUFBSSxDQUFDLGVBQWU7UUFDOUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUUsSUFBSSxDQUFFO1lBQUcsSUFBSSxDQUFDLEtBQUssQ0FBRSxJQUFJLENBQUUsR0FBK0IsSUFBSSxHQUFHLEVBQXdCLENBQUM7UUFDM0csSUFBSSxDQUFDLEtBQUssQ0FBRSxJQUFJLENBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDM0UsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBR0Q7O09BRUc7SUFDSCxHQUFHLENBQUMsSUFBWSxFQUFFLEdBQVc7UUFDM0IsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFFLElBQUksQ0FBRSxFQUFFO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBRSxJQUFJLENBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDcEM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFHRDs7O09BR0c7SUFDSyx1QkFBdUIsQ0FBQyxHQUFXLEVBQUUsS0FBVTtRQUNyRCxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDckMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuRCxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztZQUNqRCxJQUFJLGNBQWMsRUFBRTtnQkFDbEIsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN0QjtZQUNELFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3RDO0lBQ0gsQ0FBQztJQUdEOztPQUVHO0lBQ0ssbUJBQW1CLENBQUMsSUFBWSxFQUFFLEdBQVc7UUFFbkQsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFFLElBQUksQ0FBRSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUUsSUFBSSxDQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3JELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBRSxJQUFJLENBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDbkQsSUFBSSxDQUFDLEtBQUssQ0FBRSxJQUFJLENBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQy9CLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxPQUFPLElBQUksQ0FBQztTQUNiO2FBQUk7WUFDSCxPQUFPLEtBQUssQ0FBQztTQUNkO0lBQ0gsQ0FBQzs7OztZQXBIRixVQUFVLFNBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT2JzZXJ2YWJsZSwgb2YsIFN1YmplY3QsfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IElzU3RyaW5nIH0gZnJvbSAnLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcblxuXG5pbnRlcmZhY2UgQ2FjaGVDb250ZW50IHtcbiAgZXhwaXJ5OiBudW1iZXI7XG4gIHZhbHVlOiBhbnk7XG59XG5cblxuLyoqXG4gKiBDYWNoZSBTZXJ2aWNlIGlzIGFuIG9ic2VydmFibGVzIGJhc2VkIGluLW1lbW9yeSBjYWNoZSBpbXBsZW1lbnRhdGlvblxuICogS2VlcHMgdHJhY2sgb2YgaW4tZmxpZ2h0IG9ic2VydmFibGVzIGFuZCBzZXRzIGEgZGVmYXVsdCBleHBpcnkgZm9yIGNhY2hlZCB2YWx1ZXNcbiAqL1xuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBjbGFzcyBQb3BDYWNoZVNlcnZpY2Uge1xuICBwcml2YXRlIG5hbWUgPSAnUG9wQ2FjaGVTZXJ2aWNlJztcbiAgcHJpdmF0ZSBjYWNoZSA9IHt9O1xuICBwcml2YXRlIGluRmxpZ2h0T2JzZXJ2YWJsZXM6IE1hcDxzdHJpbmcsIFN1YmplY3Q8YW55Pj4gPSBuZXcgTWFwPHN0cmluZywgU3ViamVjdDxhbnk+PigpO1xuICByZWFkb25seSBERUZBVUxUX01BWF9BR0U6IG51bWJlciA9IDYwMDAwOyAvLyAxIG1pbnV0ZVxuXG4gIGNvbnN0cnVjdG9yKCl7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSB2YWx1ZSBmcm9tIGNhY2hlIGlmIHRoZSBrZXkgaXMgcHJvdmlkZWQuXG4gICAqIElmIG5vIHZhbHVlIGV4aXN0cyBpbiBjYWNoZSwgdGhlbiBjaGVjayBpZiB0aGUgc2FtZSBjYWxsIGV4aXN0c1xuICAgKiBpbiBmbGlnaHQsIGlmIHNvIHJldHVybiB0aGUgc3ViamVjdC4gSWYgbm90IGNyZWF0ZSBhIG5ld1xuICAgKiBTdWJqZWN0IGluRmxpZ2h0T2JzZXJ2YWJsZSBhbmQgcmV0dXJuIHRoZSBzb3VyY2Ugb2JzZXJ2YWJsZS5cbiAgICovXG4gIGdldCh0eXBlOiBzdHJpbmcsIGtleTogc3RyaW5nLCBmYWxsYmFjaz86IE9ic2VydmFibGU8YW55PiwgbWF4QWdlPzogbnVtYmVyKTogT2JzZXJ2YWJsZTxhbnk+IHwgU3ViamVjdDxhbnk+e1xuICAgIGlmKCB0aGlzLmhhc1ZhbGlkQ2FjaGVkVmFsdWUodHlwZSwga2V5KSApe1xuICAgICAgcmV0dXJuIG9mKHRoaXMuY2FjaGVbIHR5cGUgXS5nZXQoa2V5KS52YWx1ZSk7XG4gICAgfVxuXG4gICAgaWYoICFtYXhBZ2UgKXtcbiAgICAgIG1heEFnZSA9IHRoaXMuREVGQVVMVF9NQVhfQUdFO1xuICAgIH1cblxuICAgIGlmKCBmYWxsYmFjayAmJiBmYWxsYmFjayBpbnN0YW5jZW9mIE9ic2VydmFibGUgKXtcbiAgICAgIGlmKCB0aGlzLmluRmxpZ2h0T2JzZXJ2YWJsZXMuaGFzKGtleSkgKXtcbiAgICAgICAgY29uc3Qgc3ViID0gdGhpcy5pbkZsaWdodE9ic2VydmFibGVzLmdldChrZXkpO1xuICAgICAgICBpZiggc3ViICl7XG4gICAgICAgICAgc3ViLmNvbXBsZXRlKCk7XG4gICAgICAgICAgc3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuaW5GbGlnaHRPYnNlcnZhYmxlcy5zZXQoa2V5LCBuZXcgU3ViamVjdCgpKTtcbiAgICAgIHJldHVybiBmYWxsYmFjay5waXBlKHRhcCgodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5zZXQodHlwZSwga2V5LCB2YWx1ZSwgbWF4QWdlKTtcbiAgICAgIH0pKTtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBvZihudWxsKTtcbiAgICAgIC8vIHJldHVybiB0aHJvd0Vycm9yKCdSZXF1ZXN0ZWQga2V5IGlzIG5vdCBhdmFpbGFibGUgaW4gQ2FjaGUnKTtcbiAgICB9XG4gIH1cblxuXG4gIGNsZWFyKGNhY2hlVHlwZTogc3RyaW5nLCBjYWNoZUtleT86IHN0cmluZyk6IHZvaWR7XG4gICAgaWYoIElzU3RyaW5nKGNhY2hlVHlwZSwgdHJ1ZSkgKXtcbiAgICAgIGlmKCBJc1N0cmluZyhjYWNoZUtleSwgdHJ1ZSkgKXtcbiAgICAgICAgaWYoIHRoaXMuY2FjaGVbIGNhY2hlVHlwZSBdICYmIHRoaXMuaGFzKGNhY2hlVHlwZSwgY2FjaGVLZXkpICl7XG4gICAgICAgICAgdGhpcy5jYWNoZVsgY2FjaGVUeXBlIF0uZGVsZXRlKGNhY2hlS2V5KTtcbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKCB0aGlzLmNhY2hlWyBjYWNoZVR5cGUgXSApIGRlbGV0ZSB0aGlzLmNhY2hlWyBjYWNoZVR5cGUgXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIGNsZWFyQWxsKCl7XG4gICAgdGhpcy5jYWNoZSA9IHt9O1xuICB9XG5cblxuICAvKipcbiAgICogU2V0cyB0aGUgdmFsdWUgd2l0aCBrZXkgaW4gdGhlIGNhY2hlXG4gICAqIE5vdGlmaWVzIGFsbCBvYnNlcnZlcnMgb2YgdGhlIG5ldyB2YWx1ZVxuICAgKi9cbiAgc2V0KHR5cGU6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnksIG1heEFnZTogbnVtYmVyID0gdGhpcy5ERUZBVUxUX01BWF9BR0UpOiB2b2lke1xuICAgIGlmKCAhdGhpcy5jYWNoZVsgdHlwZSBdICkgdGhpcy5jYWNoZVsgdHlwZSBdID0gPE1hcDxzdHJpbmcsIENhY2hlQ29udGVudD4gPm5ldyBNYXA8c3RyaW5nLCBDYWNoZUNvbnRlbnQ+KCk7XG4gICAgdGhpcy5jYWNoZVsgdHlwZSBdLnNldChrZXksIHsgdmFsdWU6IHZhbHVlLCBleHBpcnk6IERhdGUubm93KCkgKyBtYXhBZ2UgfSk7XG4gICAgdGhpcy5ub3RpZnlJbkZsaWdodE9ic2VydmVycyhrZXksIHZhbHVlKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgYSBrZXkgZXhpc3RzIGluIGNhY2hlXG4gICAqL1xuICBoYXModHlwZTogc3RyaW5nLCBrZXk6IHN0cmluZyk6IGJvb2xlYW57XG4gICAgaWYoIHRoaXMuY2FjaGVbIHR5cGUgXSApe1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGVbIHR5cGUgXS5oYXMoa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cblxuICAvKipcbiAgICogUHVibGlzaGVzIHRoZSB2YWx1ZSB0byBhbGwgb2JzZXJ2ZXJzIG9mIHRoZSBnaXZlblxuICAgKiBpbiBwcm9ncmVzcyBvYnNlcnZhYmxlcyBpZiBvYnNlcnZlcnMgZXhpc3QuXG4gICAqL1xuICBwcml2YXRlIG5vdGlmeUluRmxpZ2h0T2JzZXJ2ZXJzKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZHtcbiAgICBpZiggdGhpcy5pbkZsaWdodE9ic2VydmFibGVzLmhhcyhrZXkpICl7XG4gICAgICBjb25zdCBpbkZsaWdodCA9IHRoaXMuaW5GbGlnaHRPYnNlcnZhYmxlcy5nZXQoa2V5KTtcbiAgICAgIGNvbnN0IG9ic2VydmVyc0NvdW50ID0gaW5GbGlnaHQub2JzZXJ2ZXJzLmxlbmd0aDtcbiAgICAgIGlmKCBvYnNlcnZlcnNDb3VudCApe1xuICAgICAgICBpbkZsaWdodC5uZXh0KHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIGluRmxpZ2h0LmNvbXBsZXRlKCk7XG4gICAgICB0aGlzLmluRmxpZ2h0T2JzZXJ2YWJsZXMuZGVsZXRlKGtleSk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBrZXkgZXhpc3RzIGFuZCAgaGFzIG5vdCBleHBpcmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBoYXNWYWxpZENhY2hlZFZhbHVlKHR5cGU6IHN0cmluZywga2V5OiBzdHJpbmcpOiBib29sZWFue1xuXG4gICAgaWYoIHRoaXMuY2FjaGVbIHR5cGUgXSAmJiB0aGlzLmNhY2hlWyB0eXBlIF0uaGFzKGtleSkgKXtcbiAgICAgIGlmKCB0aGlzLmNhY2hlWyB0eXBlIF0uZ2V0KGtleSkuZXhwaXJ5IDwgRGF0ZS5ub3coKSApe1xuICAgICAgICB0aGlzLmNhY2hlWyB0eXBlIF0uZGVsZXRlKGtleSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufVxuIl19