import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class PopDisplayService {
    constructor() {
        this.aliases = [];
    }
    /**
     * Provides the actual name we want displayed to the user.
     * field - The field name coming from the DB.
     * displayInfo - Either a string or object. If object then will look for property display or label. Takes aliases into account. IE: account:ID
     * set - If passed will look in the displayInfo object for this field before falling back to the display or label field.
     * returns {string}
     */
    set(text, displayInfo = '', displayField = '') {
        let displayString = '';
        if (displayInfo && typeof displayInfo === 'string') {
            displayString = displayInfo;
        }
        else if (displayInfo && displayField && displayInfo[displayField]) {
            displayString = displayInfo[displayField];
        }
        else if (displayInfo && displayInfo.display) {
            displayString = displayInfo.display;
        }
        else if (displayInfo && displayInfo.label) {
            displayString = displayInfo.label;
        }
        // Check for aliases.
        if (displayString) {
            if (displayString.includes('alias:')) {
                const aliasArray = displayString.split(':');
                aliasArray.shift();
                const alias = this.alias(aliasArray.shift()).toLocaleLowerCase();
                displayString = alias.charAt(0).toUpperCase() + alias.slice(1) + ' ';
                let tempString = '';
                while (tempString = aliasArray.shift())
                    displayString += ' ' + tempString;
            }
        }
        else {
            // Format the string base on the field name.
            const words = text.split('_');
            for (const word of words) {
                if (word === 'id' || word === 'fk') {
                    displayString += 'ID ';
                }
                else {
                    displayString += word.charAt(0).toUpperCase() + word.slice(1) + ' ';
                }
            }
        }
        return displayString.trim();
    }
    alias(entity) {
        return (this.aliases[entity] ? this.aliases[entity] : entity);
    }
}
PopDisplayService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopDisplayService_Factory() { return new PopDisplayService(); }, token: PopDisplayService, providedIn: "root" });
PopDisplayService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopDisplayService.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWRpc3BsYXkuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9zZXJ2aWNlcy9wb3AtZGlzcGxheS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7O0FBTTNDLE1BQU0sT0FBTyxpQkFBaUI7SUFJNUI7UUFDRSxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBR0Q7Ozs7OztPQU1HO0lBQ0ksR0FBRyxDQUFDLElBQVksRUFBRSxjQUFtQixFQUFFLEVBQUUsZUFBdUIsRUFBRTtRQUV2RSxJQUFJLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFFdkIsSUFBSSxXQUFXLElBQUksT0FBTyxXQUFXLEtBQUssUUFBUSxFQUFFO1lBQ2xELGFBQWEsR0FBRyxXQUFXLENBQUM7U0FDN0I7YUFBSyxJQUFJLFdBQVcsSUFBSSxZQUFZLElBQUksV0FBVyxDQUFFLFlBQVksQ0FBRSxFQUFFO1lBQ3BFLGFBQWEsR0FBRyxXQUFXLENBQUUsWUFBWSxDQUFFLENBQUM7U0FDN0M7YUFBSyxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFO1lBQzVDLGFBQWEsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO1NBQ3JDO2FBQUssSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLEtBQUssRUFBRTtZQUMxQyxhQUFhLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztTQUNuQztRQUVELHFCQUFxQjtRQUNyQixJQUFJLGFBQWEsRUFBRTtZQUNqQixJQUFJLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3BDLE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzVDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDbkIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUNqRSxhQUFhLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztnQkFDckUsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO2dCQUNwQixPQUFPLFVBQVUsR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFO29CQUFHLGFBQWEsSUFBSSxHQUFHLEdBQUcsVUFBVSxDQUFDO2FBQzVFO1NBQ0Y7YUFBSTtZQUNILDRDQUE0QztZQUM1QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlCLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO2dCQUN4QixJQUFJLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtvQkFDbEMsYUFBYSxJQUFJLEtBQUssQ0FBQztpQkFDeEI7cUJBQUk7b0JBQ0gsYUFBYSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7aUJBQ3JFO2FBQ0Y7U0FDRjtRQUVELE9BQU8sYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFHTSxLQUFLLENBQUMsTUFBTTtRQUNqQixPQUFPLENBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBRSxNQUFNLENBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBRSxNQUFNLENBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFFLENBQUM7SUFDdEUsQ0FBQzs7OztZQTdERixVQUFVLFNBQUM7Z0JBQ1YsVUFBVSxFQUFFLE1BQU07YUFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgUG9wRGlzcGxheVNlcnZpY2Uge1xuICBwcml2YXRlIHJlYWRvbmx5IGFsaWFzZXM7XG5cblxuICBjb25zdHJ1Y3Rvcigpe1xuICAgIHRoaXMuYWxpYXNlcyA9IFtdO1xuICB9XG5cblxuICAvKipcbiAgICogUHJvdmlkZXMgdGhlIGFjdHVhbCBuYW1lIHdlIHdhbnQgZGlzcGxheWVkIHRvIHRoZSB1c2VyLlxuICAgKiBmaWVsZCAtIFRoZSBmaWVsZCBuYW1lIGNvbWluZyBmcm9tIHRoZSBEQi5cbiAgICogZGlzcGxheUluZm8gLSBFaXRoZXIgYSBzdHJpbmcgb3Igb2JqZWN0LiBJZiBvYmplY3QgdGhlbiB3aWxsIGxvb2sgZm9yIHByb3BlcnR5IGRpc3BsYXkgb3IgbGFiZWwuIFRha2VzIGFsaWFzZXMgaW50byBhY2NvdW50LiBJRTogYWNjb3VudDpJRFxuICAgKiBzZXQgLSBJZiBwYXNzZWQgd2lsbCBsb29rIGluIHRoZSBkaXNwbGF5SW5mbyBvYmplY3QgZm9yIHRoaXMgZmllbGQgYmVmb3JlIGZhbGxpbmcgYmFjayB0byB0aGUgZGlzcGxheSBvciBsYWJlbCBmaWVsZC5cbiAgICogcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgcHVibGljIHNldCh0ZXh0OiBzdHJpbmcsIGRpc3BsYXlJbmZvOiBhbnkgPSAnJywgZGlzcGxheUZpZWxkOiBzdHJpbmcgPSAnJyl7XG5cbiAgICBsZXQgZGlzcGxheVN0cmluZyA9ICcnO1xuXG4gICAgaWYoIGRpc3BsYXlJbmZvICYmIHR5cGVvZiBkaXNwbGF5SW5mbyA9PT0gJ3N0cmluZycgKXtcbiAgICAgIGRpc3BsYXlTdHJpbmcgPSBkaXNwbGF5SW5mbztcbiAgICB9ZWxzZSBpZiggZGlzcGxheUluZm8gJiYgZGlzcGxheUZpZWxkICYmIGRpc3BsYXlJbmZvWyBkaXNwbGF5RmllbGQgXSApe1xuICAgICAgZGlzcGxheVN0cmluZyA9IGRpc3BsYXlJbmZvWyBkaXNwbGF5RmllbGQgXTtcbiAgICB9ZWxzZSBpZiggZGlzcGxheUluZm8gJiYgZGlzcGxheUluZm8uZGlzcGxheSApe1xuICAgICAgZGlzcGxheVN0cmluZyA9IGRpc3BsYXlJbmZvLmRpc3BsYXk7XG4gICAgfWVsc2UgaWYoIGRpc3BsYXlJbmZvICYmIGRpc3BsYXlJbmZvLmxhYmVsICl7XG4gICAgICBkaXNwbGF5U3RyaW5nID0gZGlzcGxheUluZm8ubGFiZWw7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIGFsaWFzZXMuXG4gICAgaWYoIGRpc3BsYXlTdHJpbmcgKXtcbiAgICAgIGlmKCBkaXNwbGF5U3RyaW5nLmluY2x1ZGVzKCdhbGlhczonKSApe1xuICAgICAgICBjb25zdCBhbGlhc0FycmF5ID0gZGlzcGxheVN0cmluZy5zcGxpdCgnOicpO1xuICAgICAgICBhbGlhc0FycmF5LnNoaWZ0KCk7XG4gICAgICAgIGNvbnN0IGFsaWFzID0gdGhpcy5hbGlhcyhhbGlhc0FycmF5LnNoaWZ0KCkpLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG4gICAgICAgIGRpc3BsYXlTdHJpbmcgPSBhbGlhcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGFsaWFzLnNsaWNlKDEpICsgJyAnO1xuICAgICAgICBsZXQgdGVtcFN0cmluZyA9ICcnO1xuICAgICAgICB3aGlsZSggdGVtcFN0cmluZyA9IGFsaWFzQXJyYXkuc2hpZnQoKSApIGRpc3BsYXlTdHJpbmcgKz0gJyAnICsgdGVtcFN0cmluZztcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIC8vIEZvcm1hdCB0aGUgc3RyaW5nIGJhc2Ugb24gdGhlIGZpZWxkIG5hbWUuXG4gICAgICBjb25zdCB3b3JkcyA9IHRleHQuc3BsaXQoJ18nKTtcbiAgICAgIGZvciggY29uc3Qgd29yZCBvZiB3b3JkcyApe1xuICAgICAgICBpZiggd29yZCA9PT0gJ2lkJyB8fCB3b3JkID09PSAnZmsnICl7XG4gICAgICAgICAgZGlzcGxheVN0cmluZyArPSAnSUQgJztcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZGlzcGxheVN0cmluZyArPSB3b3JkLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgd29yZC5zbGljZSgxKSArICcgJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkaXNwbGF5U3RyaW5nLnRyaW0oKTtcbiAgfVxuXG5cbiAgcHVibGljIGFsaWFzKGVudGl0eSl7XG4gICAgcmV0dXJuICggdGhpcy5hbGlhc2VzWyBlbnRpdHkgXSA/IHRoaXMuYWxpYXNlc1sgZW50aXR5IF0gOiBlbnRpdHkgKTtcbiAgfVxuXG59XG5cbiJdfQ==