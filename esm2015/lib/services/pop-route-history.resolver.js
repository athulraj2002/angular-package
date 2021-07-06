import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { GetSessionSiteVar, IsArray, SetSessionSiteVar } from '../pop-common-utility';
import * as i0 from "@angular/core";
import * as i1 from "@angular/router";
export class PopRouteHistoryResolver {
    constructor(router) {
        this.router = router;
        this.sessionVar = 'Navigation.history';
        // ToDo: Grab enitty map dynamically
        router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event) => {
            const path = window.location.pathname.split('/');
            path.shift();
            path.pop();
            SetSessionSiteVar('App.name', path[0]);
            SetSessionSiteVar('App.entity', path[path.length - 1]);
        });
    }
    resolve(route, state) {
        const path = window.location.pathname.split('/');
        path.shift();
        path.pop();
        SetSessionSiteVar('App.name', path[0]);
        SetSessionSiteVar('App.entity', path[path[path.length - 1]]);
        this.saveNavigationHistory({ name: '', base: path[0], path: state.url });
        return true;
    }
    saveNavigationHistory(history) {
        let historyArray = GetSessionSiteVar(this.sessionVar);
        if (!historyArray)
            historyArray = [];
        // Because a non-existing siteVar returns an object and we need it to be an array.
        if (typeof historyArray[0] === 'undefined')
            historyArray = [];
        // Make sure that we don't have two entries in a row of the same thing.
        if (typeof historyArray[0] !== 'undefined' && historyArray[0].path == history.path)
            return;
        // Add the new entry and keep the multiple_max to 20 for now.
        historyArray.unshift(history);
        if (historyArray.length > 20)
            historyArray.splice(-1, 1);
        SetSessionSiteVar(this.sessionVar, historyArray);
    }
    isPreviousHistory() {
        const historyArray = GetSessionSiteVar(this.sessionVar);
        return IsArray(historyArray, true);
    }
    goBack(count = 1) {
        if (count < 1)
            count = 1;
        const historyArray = GetSessionSiteVar(this.sessionVar);
        const path = window.location.pathname.split('/');
        // If they came from outside of pop then don't send them back there but instead send them to apps main page.
        if (typeof historyArray.length === 'undefined' || typeof historyArray[1] === 'undefined') {
            this.router.navigate(['/']);
            return;
        }
        // The where they should go back to and also purge that route from the array.
        const goBackTo = (historyArray[count] !== 'undefined' ? historyArray[count] : historyArray.slice(-1)[0]);
        if (historyArray.length)
            historyArray.shift();
        SetSessionSiteVar(this.sessionVar, historyArray);
        // If where they are going back to is in the same app then use the router otherwise do reload to sthat route.
        if (goBackTo.base === path[1]) {
            this.router.navigate([goBackTo.path]).catch(() => true);
        }
        else {
            window.location.href = window.location.origin + '/' + goBackTo.base + goBackTo.path;
        }
    }
}
PopRouteHistoryResolver.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopRouteHistoryResolver_Factory() { return new PopRouteHistoryResolver(i0.ɵɵinject(i1.Router)); }, token: PopRouteHistoryResolver, providedIn: "root" });
PopRouteHistoryResolver.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root',
            },] }
];
PopRouteHistoryResolver.ctorParameters = () => [
    { type: Router }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXJvdXRlLWhpc3RvcnkucmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvc2VydmljZXMvcG9wLXJvdXRlLWhpc3RvcnkucmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQXdELE1BQU0sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUM5RyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDOzs7QUFhdEYsTUFBTSxPQUFPLHVCQUF1QjtJQUlsQyxZQUNVLE1BQWM7UUFBZCxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBSnhCLGVBQVUsR0FBRyxvQkFBb0IsQ0FBQztRQU1oQyxvQ0FBb0M7UUFDcEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxZQUFZLGFBQWEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDdEYsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNiLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNYLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBQztZQUN6QyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBQztRQUMz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QyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRWpELDZHQUE2RztRQUM3RyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFFLENBQUMsQ0FBRSxFQUFFO1lBQy9CLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUUsUUFBUSxDQUFDLElBQUksQ0FBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzNEO2FBQUk7WUFDSCxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQUcsUUFBUSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1NBQ3JGO0lBQ0gsQ0FBQzs7OztZQWpGRixVQUFVLFNBQUM7Z0JBQ1YsVUFBVSxFQUFFLE1BQU07YUFDbkI7OztZQWQ4RCxNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUmVzb2x2ZSwgUm91dGVyU3RhdGVTbmFwc2hvdCwgQWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgUm91dGVyLCBOYXZpZ2F0aW9uRW5kIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IGZpbHRlciB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IEdldFNlc3Npb25TaXRlVmFyLCBJc0FycmF5LCBTZXRTZXNzaW9uU2l0ZVZhciB9IGZyb20gJy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5cblxuZXhwb3J0IGludGVyZmFjZSBSb3V0ZUhpc3RvcnlJbnRlcmZhY2Uge1xuICBuYW1lOiBzdHJpbmc7XG4gIGJhc2U6IHN0cmluZztcbiAgcGF0aDogc3RyaW5nO1xufVxuXG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxufSlcbmV4cG9ydCBjbGFzcyBQb3BSb3V0ZUhpc3RvcnlSZXNvbHZlciBpbXBsZW1lbnRzIFJlc29sdmU8YW55PiB7XG4gIHNlc3Npb25WYXIgPSAnTmF2aWdhdGlvbi5oaXN0b3J5JztcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXG4gICl7XG4gICAgLy8gVG9EbzogR3JhYiBlbml0dHkgbWFwIGR5bmFtaWNhbGx5XG4gICAgcm91dGVyLmV2ZW50cy5waXBlKGZpbHRlcihldmVudCA9PiBldmVudCBpbnN0YW5jZW9mIE5hdmlnYXRpb25FbmQpKS5zdWJzY3JpYmUoKGV2ZW50KSA9PiB7XG4gICAgICBjb25zdCBwYXRoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJyk7XG4gICAgICBwYXRoLnNoaWZ0KCk7XG4gICAgICBwYXRoLnBvcCgpO1xuICAgICAgU2V0U2Vzc2lvblNpdGVWYXIoJ0FwcC5uYW1lJywgcGF0aFsgMCBdKTtcbiAgICAgIFNldFNlc3Npb25TaXRlVmFyKCdBcHAuZW50aXR5JywgcGF0aFsgcGF0aC5sZW5ndGggLSAxIF0pO1xuICAgIH0pO1xuICB9XG5cblxuICByZXNvbHZlKHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LCBzdGF0ZTogUm91dGVyU3RhdGVTbmFwc2hvdCk6IGJvb2xlYW57XG4gICAgY29uc3QgcGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpO1xuICAgIHBhdGguc2hpZnQoKTtcbiAgICBwYXRoLnBvcCgpO1xuICAgIFNldFNlc3Npb25TaXRlVmFyKCdBcHAubmFtZScsIHBhdGhbIDAgXSk7XG4gICAgU2V0U2Vzc2lvblNpdGVWYXIoJ0FwcC5lbnRpdHknLCBwYXRoWyBwYXRoWyBwYXRoLmxlbmd0aCAtIDEgXSBdKTtcbiAgICB0aGlzLnNhdmVOYXZpZ2F0aW9uSGlzdG9yeSh7IG5hbWU6ICcnLCBiYXNlOiBwYXRoWyAwIF0sIHBhdGg6IHN0YXRlLnVybCB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG5cbiAgc2F2ZU5hdmlnYXRpb25IaXN0b3J5KGhpc3Rvcnk6IFJvdXRlSGlzdG9yeUludGVyZmFjZSl7XG5cbiAgICBsZXQgaGlzdG9yeUFycmF5ID0gR2V0U2Vzc2lvblNpdGVWYXIodGhpcy5zZXNzaW9uVmFyKTtcbiAgICBpZiggIWhpc3RvcnlBcnJheSApIGhpc3RvcnlBcnJheSA9IFtdO1xuXG4gICAgLy8gQmVjYXVzZSBhIG5vbi1leGlzdGluZyBzaXRlVmFyIHJldHVybnMgYW4gb2JqZWN0IGFuZCB3ZSBuZWVkIGl0IHRvIGJlIGFuIGFycmF5LlxuICAgIGlmKCB0eXBlb2YgaGlzdG9yeUFycmF5WyAwIF0gPT09ICd1bmRlZmluZWQnICkgaGlzdG9yeUFycmF5ID0gW107XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhhdCB3ZSBkb24ndCBoYXZlIHR3byBlbnRyaWVzIGluIGEgcm93IG9mIHRoZSBzYW1lIHRoaW5nLlxuICAgIGlmKCB0eXBlb2YgaGlzdG9yeUFycmF5WyAwIF0gIT09ICd1bmRlZmluZWQnICYmIGhpc3RvcnlBcnJheVsgMCBdLnBhdGggPT0gaGlzdG9yeS5wYXRoICkgcmV0dXJuO1xuXG4gICAgLy8gQWRkIHRoZSBuZXcgZW50cnkgYW5kIGtlZXAgdGhlIG11bHRpcGxlX21heCB0byAyMCBmb3Igbm93LlxuICAgIGhpc3RvcnlBcnJheS51bnNoaWZ0KGhpc3RvcnkpO1xuICAgIGlmKCBoaXN0b3J5QXJyYXkubGVuZ3RoID4gMjAgKSBoaXN0b3J5QXJyYXkuc3BsaWNlKC0xLCAxKTtcblxuICAgIFNldFNlc3Npb25TaXRlVmFyKHRoaXMuc2Vzc2lvblZhciwgaGlzdG9yeUFycmF5KTtcbiAgfVxuXG5cbiAgaXNQcmV2aW91c0hpc3RvcnkoKXtcbiAgICBjb25zdCBoaXN0b3J5QXJyYXkgPSBHZXRTZXNzaW9uU2l0ZVZhcih0aGlzLnNlc3Npb25WYXIpO1xuICAgIHJldHVybiBJc0FycmF5KGhpc3RvcnlBcnJheSwgdHJ1ZSk7XG4gIH1cblxuXG4gIGdvQmFjayhjb3VudDogbnVtYmVyID0gMSl7XG5cbiAgICBpZiggY291bnQgPCAxICkgY291bnQgPSAxO1xuXG4gICAgY29uc3QgaGlzdG9yeUFycmF5ID0gR2V0U2Vzc2lvblNpdGVWYXIodGhpcy5zZXNzaW9uVmFyKTtcbiAgICBjb25zdCBwYXRoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJyk7XG5cbiAgICAvLyBJZiB0aGV5IGNhbWUgZnJvbSBvdXRzaWRlIG9mIHBvcCB0aGVuIGRvbid0IHNlbmQgdGhlbSBiYWNrIHRoZXJlIGJ1dCBpbnN0ZWFkIHNlbmQgdGhlbSB0byBhcHBzIG1haW4gcGFnZS5cbiAgICBpZiggdHlwZW9mIGhpc3RvcnlBcnJheS5sZW5ndGggPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBoaXN0b3J5QXJyYXlbIDEgXSA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsgJy8nIF0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRoZSB3aGVyZSB0aGV5IHNob3VsZCBnbyBiYWNrIHRvIGFuZCBhbHNvIHB1cmdlIHRoYXQgcm91dGUgZnJvbSB0aGUgYXJyYXkuXG4gICAgY29uc3QgZ29CYWNrVG8gPSAoIGhpc3RvcnlBcnJheVsgY291bnQgXSAhPT0gJ3VuZGVmaW5lZCcgPyBoaXN0b3J5QXJyYXlbIGNvdW50IF0gOiBoaXN0b3J5QXJyYXkuc2xpY2UoLTEpWyAwIF0gKTtcbiAgICBpZiggaGlzdG9yeUFycmF5Lmxlbmd0aCApIGhpc3RvcnlBcnJheS5zaGlmdCgpO1xuICAgIFNldFNlc3Npb25TaXRlVmFyKHRoaXMuc2Vzc2lvblZhciwgaGlzdG9yeUFycmF5KTtcblxuICAgIC8vIElmIHdoZXJlIHRoZXkgYXJlIGdvaW5nIGJhY2sgdG8gaXMgaW4gdGhlIHNhbWUgYXBwIHRoZW4gdXNlIHRoZSByb3V0ZXIgb3RoZXJ3aXNlIGRvIHJlbG9hZCB0byBzdGhhdCByb3V0ZS5cbiAgICBpZiggZ29CYWNrVG8uYmFzZSA9PT0gcGF0aFsgMSBdICl7XG4gICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbIGdvQmFja1RvLnBhdGggXSkuY2F0Y2goKCkgPT4gdHJ1ZSk7XG4gICAgfWVsc2V7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyAnLycgKyBnb0JhY2tUby5iYXNlICsgZ29CYWNrVG8ucGF0aDtcbiAgICB9XG4gIH1cblxufVxuIl19