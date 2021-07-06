import { Pipe } from '@angular/core';
export class ToActiveOrArchivedPipe {
    /**
     * If value is true, then that would indicate that is archived
     * @param value
     */
    transform(value) {
        if (value === 'true' || value === '1')
            value = true;
        if (value === 'false' || value === '0')
            value = false;
        return value && value !== null ? 'Archived' : 'Active';
    }
}
ToActiveOrArchivedPipe.decorators = [
    { type: Pipe, args: [{ name: 'toActiveOrArchived', pure: true },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9BY3RpdmVPckFyY2hpdmVkLnBpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvcGlwZXMvdG9BY3RpdmVPckFyY2hpdmVkLnBpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLElBQUksRUFBaUIsTUFBTSxlQUFlLENBQUM7QUFJcEQsTUFBTSxPQUFPLHNCQUFzQjtJQUNqQzs7O09BR0c7SUFDSCxTQUFTLENBQUMsS0FBSztRQUNiLElBQUksS0FBSyxLQUFLLE1BQU0sSUFBSSxLQUFLLEtBQUssR0FBRztZQUFHLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDckQsSUFBSSxLQUFLLEtBQUssT0FBTyxJQUFJLEtBQUssS0FBSyxHQUFHO1lBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUN2RCxPQUFPLEtBQUssSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUN6RCxDQUFDOzs7WUFWRixJQUFJLFNBQUMsRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuXG5AUGlwZSh7IG5hbWU6ICd0b0FjdGl2ZU9yQXJjaGl2ZWQnLCBwdXJlOiB0cnVlIH0pXG5leHBvcnQgY2xhc3MgVG9BY3RpdmVPckFyY2hpdmVkUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICAvKipcbiAgICogSWYgdmFsdWUgaXMgdHJ1ZSwgdGhlbiB0aGF0IHdvdWxkIGluZGljYXRlIHRoYXQgaXMgYXJjaGl2ZWRcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqL1xuICB0cmFuc2Zvcm0odmFsdWUpe1xuICAgIGlmKCB2YWx1ZSA9PT0gJ3RydWUnIHx8IHZhbHVlID09PSAnMScgKSB2YWx1ZSA9IHRydWU7XG4gICAgaWYoIHZhbHVlID09PSAnZmFsc2UnIHx8IHZhbHVlID09PSAnMCcgKSB2YWx1ZSA9IGZhbHNlO1xuICAgIHJldHVybiB2YWx1ZSAmJiB2YWx1ZSAhPT0gbnVsbCA/ICdBcmNoaXZlZCcgOiAnQWN0aXZlJztcbiAgfVxufVxuIl19