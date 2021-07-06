import { Pipe } from '@angular/core';
export class LabelPipe {
    constructor() {
        this.aliases = [];
    }
    /**
     * Provides the actual name we want displayed to the user.
     * text - The field name coming from the DB.
     * displayInfo - Either a string or object. If object then will look for property display or label. Takes aliases into account. IE: account:ID
     * set - If passed will look in the displayInfo object for this field before falling back to the display or label field.
     * returns {string}
     */
    transform(text, displayInfo = '', displayField = '') {
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
                const alias = this.getAlias(aliasArray.shift()).toLocaleLowerCase();
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
    getAlias(entity) {
        return (this.aliases[entity] ? this.aliases[entity] : entity);
    }
}
LabelPipe.decorators = [
    { type: Pipe, args: [{ name: 'label', pure: true },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWwucGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9waXBlcy9sYWJlbC5waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQWlCLE1BQU0sZUFBZSxDQUFDO0FBR3BELE1BQU0sT0FBTyxTQUFTO0lBRHRCO1FBR0UsWUFBTyxHQUFHLEVBQUUsQ0FBQztJQW9EZixDQUFDO0lBakRDOzs7Ozs7T0FNRztJQUNILFNBQVMsQ0FBQyxJQUFZLEVBQUUsY0FBbUIsRUFBRSxFQUFFLGVBQXVCLEVBQUU7UUFDdEUsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBRXZCLElBQUksV0FBVyxJQUFJLE9BQU8sV0FBVyxLQUFLLFFBQVEsRUFBRTtZQUNsRCxhQUFhLEdBQUcsV0FBVyxDQUFDO1NBQzdCO2FBQUssSUFBSSxXQUFXLElBQUksWUFBWSxJQUFJLFdBQVcsQ0FBRSxZQUFZLENBQUUsRUFBRTtZQUNwRSxhQUFhLEdBQUcsV0FBVyxDQUFFLFlBQVksQ0FBRSxDQUFDO1NBQzdDO2FBQUssSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRTtZQUM1QyxhQUFhLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQztTQUNyQzthQUFLLElBQUksV0FBVyxJQUFJLFdBQVcsQ0FBQyxLQUFLLEVBQUU7WUFDMUMsYUFBYSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUM7U0FDbkM7UUFFRCxxQkFBcUI7UUFDckIsSUFBSSxhQUFhLEVBQUU7WUFDakIsSUFBSSxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNwQyxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM1QyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ25CLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDcEUsYUFBYSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7Z0JBQ3JFLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztnQkFDcEIsT0FBTyxVQUFVLEdBQUcsVUFBVSxDQUFDLEtBQUssRUFBRTtvQkFBRyxhQUFhLElBQUksR0FBRyxHQUFHLFVBQVUsQ0FBQzthQUM1RTtTQUNGO2FBQUk7WUFDSCw0Q0FBNEM7WUFDNUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDeEIsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7b0JBQ2xDLGFBQWEsSUFBSSxLQUFLLENBQUM7aUJBQ3hCO3FCQUFJO29CQUNILGFBQWEsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO2lCQUNyRTthQUNGO1NBQ0Y7UUFFRCxPQUFPLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBR00sUUFBUSxDQUFDLE1BQU07UUFDcEIsT0FBTyxDQUFFLElBQUksQ0FBQyxPQUFPLENBQUUsTUFBTSxDQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUUsTUFBTSxDQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBRSxDQUFDO0lBQ3RFLENBQUM7OztZQXRERixJQUFJLFNBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBQaXBlKHsgbmFtZTogJ2xhYmVsJywgcHVyZTogdHJ1ZSB9KVxuZXhwb3J0IGNsYXNzIExhYmVsUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuXG4gIGFsaWFzZXMgPSBbXTtcblxuXG4gIC8qKlxuICAgKiBQcm92aWRlcyB0aGUgYWN0dWFsIG5hbWUgd2Ugd2FudCBkaXNwbGF5ZWQgdG8gdGhlIHVzZXIuXG4gICAqIHRleHQgLSBUaGUgZmllbGQgbmFtZSBjb21pbmcgZnJvbSB0aGUgREIuXG4gICAqIGRpc3BsYXlJbmZvIC0gRWl0aGVyIGEgc3RyaW5nIG9yIG9iamVjdC4gSWYgb2JqZWN0IHRoZW4gd2lsbCBsb29rIGZvciBwcm9wZXJ0eSBkaXNwbGF5IG9yIGxhYmVsLiBUYWtlcyBhbGlhc2VzIGludG8gYWNjb3VudC4gSUU6IGFjY291bnQ6SURcbiAgICogc2V0IC0gSWYgcGFzc2VkIHdpbGwgbG9vayBpbiB0aGUgZGlzcGxheUluZm8gb2JqZWN0IGZvciB0aGlzIGZpZWxkIGJlZm9yZSBmYWxsaW5nIGJhY2sgdG8gdGhlIGRpc3BsYXkgb3IgbGFiZWwgZmllbGQuXG4gICAqIHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHRyYW5zZm9ybSh0ZXh0OiBzdHJpbmcsIGRpc3BsYXlJbmZvOiBhbnkgPSAnJywgZGlzcGxheUZpZWxkOiBzdHJpbmcgPSAnJyl7XG4gICAgbGV0IGRpc3BsYXlTdHJpbmcgPSAnJztcblxuICAgIGlmKCBkaXNwbGF5SW5mbyAmJiB0eXBlb2YgZGlzcGxheUluZm8gPT09ICdzdHJpbmcnICl7XG4gICAgICBkaXNwbGF5U3RyaW5nID0gZGlzcGxheUluZm87XG4gICAgfWVsc2UgaWYoIGRpc3BsYXlJbmZvICYmIGRpc3BsYXlGaWVsZCAmJiBkaXNwbGF5SW5mb1sgZGlzcGxheUZpZWxkIF0gKXtcbiAgICAgIGRpc3BsYXlTdHJpbmcgPSBkaXNwbGF5SW5mb1sgZGlzcGxheUZpZWxkIF07XG4gICAgfWVsc2UgaWYoIGRpc3BsYXlJbmZvICYmIGRpc3BsYXlJbmZvLmRpc3BsYXkgKXtcbiAgICAgIGRpc3BsYXlTdHJpbmcgPSBkaXNwbGF5SW5mby5kaXNwbGF5O1xuICAgIH1lbHNlIGlmKCBkaXNwbGF5SW5mbyAmJiBkaXNwbGF5SW5mby5sYWJlbCApe1xuICAgICAgZGlzcGxheVN0cmluZyA9IGRpc3BsYXlJbmZvLmxhYmVsO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBhbGlhc2VzLlxuICAgIGlmKCBkaXNwbGF5U3RyaW5nICl7XG4gICAgICBpZiggZGlzcGxheVN0cmluZy5pbmNsdWRlcygnYWxpYXM6JykgKXtcbiAgICAgICAgY29uc3QgYWxpYXNBcnJheSA9IGRpc3BsYXlTdHJpbmcuc3BsaXQoJzonKTtcbiAgICAgICAgYWxpYXNBcnJheS5zaGlmdCgpO1xuICAgICAgICBjb25zdCBhbGlhcyA9IHRoaXMuZ2V0QWxpYXMoYWxpYXNBcnJheS5zaGlmdCgpKS50b0xvY2FsZUxvd2VyQ2FzZSgpO1xuICAgICAgICBkaXNwbGF5U3RyaW5nID0gYWxpYXMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBhbGlhcy5zbGljZSgxKSArICcgJztcbiAgICAgICAgbGV0IHRlbXBTdHJpbmcgPSAnJztcbiAgICAgICAgd2hpbGUoIHRlbXBTdHJpbmcgPSBhbGlhc0FycmF5LnNoaWZ0KCkgKSBkaXNwbGF5U3RyaW5nICs9ICcgJyArIHRlbXBTdHJpbmc7XG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICAvLyBGb3JtYXQgdGhlIHN0cmluZyBiYXNlIG9uIHRoZSBmaWVsZCBuYW1lLlxuICAgICAgY29uc3Qgd29yZHMgPSB0ZXh0LnNwbGl0KCdfJyk7XG4gICAgICBmb3IoIGNvbnN0IHdvcmQgb2Ygd29yZHMgKXtcbiAgICAgICAgaWYoIHdvcmQgPT09ICdpZCcgfHwgd29yZCA9PT0gJ2ZrJyApe1xuICAgICAgICAgIGRpc3BsYXlTdHJpbmcgKz0gJ0lEICc7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGRpc3BsYXlTdHJpbmcgKz0gd29yZC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHdvcmQuc2xpY2UoMSkgKyAnICc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGlzcGxheVN0cmluZy50cmltKCk7XG4gIH1cblxuXG4gIHB1YmxpYyBnZXRBbGlhcyhlbnRpdHkpe1xuICAgIHJldHVybiAoIHRoaXMuYWxpYXNlc1sgZW50aXR5IF0gPyB0aGlzLmFsaWFzZXNbIGVudGl0eSBdIDogZW50aXR5ICk7XG4gIH1cbn1cbiJdfQ==