import { FormControl } from '@angular/forms';
export class SwitchConfig {
    constructor(params) {
        this.bubble = false;
        this.disabled = false;
        this.displayErrors = true;
        this.facade = false;
        this.helpText = '';
        this.label = '';
        this.labelPosition = 'after';
        this.message = '';
        this.noInitialValue = false;
        this.name = 'name';
        this.padding = '0';
        this.toolTipDirection = 'right';
        this.tabOnEnter = false;
        this.textOverflow = 'wrap';
        this.value = false;
        if (params)
            for (const i in params)
                this[i] = params[i];
        this.value = +this.value === 1 ? true : false;
        this.labelPosition = ['before', 'after'].indexOf(this.labelPosition) >= 0 ? this.labelPosition : 'after';
        if (this.label) {
            if (this.labelPosition === 'after') {
                this.toolTipDirection = 'right';
            }
        }
        else {
            this.toolTipDirection = 'above';
        }
        if (!this.patch)
            this.patch = { field: '', duration: 750, path: '', disabled: false, businessId: 0 };
        if (!this.disabled)
            this.disabled = false;
        if (this.patch.displayIndicator !== false)
            this.patch.displayIndicator = true;
        if (!this.control)
            this.setControl();
    }
    setControl() {
        this.control = this.disabled === true ? new FormControl({
            value: this.value,
            disabled: this.disabled
        }) : new FormControl(this.value, (this.validators ? this.validators : []));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLWNvbmZpZy5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXN3aXRjaC9zd2l0Y2gtY29uZmlnLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQWMsTUFBTSxnQkFBZ0IsQ0FBQztBQWdDekQsTUFBTSxPQUFPLFlBQVk7SUE4QnZCLFlBQVksTUFBOEI7UUE3QjFDLFdBQU0sR0FBRyxLQUFLLENBQUM7UUFFZixhQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ2pCLGtCQUFhLEdBQUcsSUFBSSxDQUFDO1FBRXJCLFdBQU0sR0FBRyxLQUFLLENBQUM7UUFDZixhQUFRLEdBQUcsRUFBRSxDQUFDO1FBRWQsVUFBSyxHQUFHLEVBQUUsQ0FBQztRQUNYLGtCQUFhLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLFlBQU8sR0FBRyxFQUFFLENBQUM7UUFFYixtQkFBYyxHQUFHLEtBQUssQ0FBQztRQUN2QixTQUFJLEdBQUksTUFBTSxDQUFDO1FBRWYsWUFBTyxHQUFHLEdBQUcsQ0FBQztRQU9kLHFCQUFnQixHQUFHLE9BQU8sQ0FBQztRQUMzQixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ25CLGlCQUFZLEdBQUcsTUFBTSxDQUFDO1FBRXRCLFVBQUssR0FBOEIsS0FBSyxDQUFDO1FBSXZDLElBQUksTUFBTTtZQUFHLEtBQUssTUFBTSxDQUFDLElBQUksTUFBTTtnQkFBRyxJQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUcsTUFBTSxDQUFFLENBQUMsQ0FBRSxDQUFDO1FBQzlELElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDOUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFFLFFBQVEsRUFBRSxPQUFPLENBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQzNHLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNkLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxPQUFPLEVBQUU7Z0JBQ2xDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUM7YUFDakM7U0FDRjthQUFJO1lBQ0gsSUFBSSxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQztTQUNqQztRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSztZQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFHLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN2RyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7WUFBRyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUMzQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEtBQUssS0FBSztZQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO1FBQy9FLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUN4QyxDQUFDO0lBR0QsVUFBVTtRQUNSLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDO1lBQ3RELEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztZQUNqQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7U0FDeEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFFLENBQUMsQ0FBQztJQUMvRSxDQUFDO0NBRUYiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBGb3JtQ29udHJvbCwgVmFsaWRhdG9ycyB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IEZpZWxkSXRlbVBhdGNoSW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBTZXRDb250cm9sIH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi1kb20ubW9kZWxzJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIFN3aXRjaENvbmZpZ0ludGVyZmFjZSB7XG4gIGJ1YmJsZT86IGJvb2xlYW47ICAgICAgICAgICAgICAgLy8gZmlyZSBldmVudHNcbiAgY29udHJvbD86IEZvcm1Db250cm9sOyAgICAgICAgICAvLyBUaGUgZm9ybSBjb250cm9sLiBJZiBub3QgcGFzc2VkIG9uZSB3aWxsIGJlIGNyZWF0ZWQuXG4gIGRpc2FibGVkPzogYm9vbGVhbjsgICAgICAgICAgICAgLy8gTWFyayBhcyByZWFkb25seS5cbiAgZGlzcGxheUVycm9ycz86IGJvb2xlYW47ICAgICAgICAvLyBJZiBFcnJvciBtZXNzYWdlcyBzaG91bGQgYmUgZGlzcGxheWVkLlxuICBlbXB0eT86ICdDb252ZXJ0RW1wdHlUb051bGwnIHwgJ0NvbnZlcnRFbXB0eVRvWmVybyc7XG4gIGZhY2FkZT86IGJvb2xlYW47ICAgICAgICAgICAgICAgLy8gU2V0cyBhIGZsYWcgdGhhdCBzYXlzIHRoaXMgZmllbGRJdGVtcyByZWFsbHkgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGJhY2tlbmQsIGFuZCBzaG91bGQgbm90IHBhdGNoIHRvIHRoZSBhcGlcbiAgaGVscFRleHQ/OiBzdHJpbmc7ICAgICAgICAgICAgLy8gT24gaG92ZXIgaGVscGVyIHRleHQuXG4gIGlkPzogbnVtYmVyIHwgc3RyaW5nOyAgICAgICAgICAgLy8gQSBudW1iZXIgdGhhdCB3aWxsIGJlIGluY2x1ZGVkIGluIHRoZSBldmVudHMgc28geW91IGtub3cgd2hpY2ggZmllbGQgaXQgY2FtZSBmcm9tLlxuICBsYWJlbD86IHN0cmluZzsgICAgICAgICAgICAgICAgIC8vIElucHV0IGxhYmVsLiBBIGxhYmVsIGlzIG9wdGlvbmFsLCBjaGVja2JveCB3aWxsIGNlbnRlciBpbnNpZGUgdGhlIGNvbnRhaW5lciB3aXRob3V0IGEgbGFiZWxcbiAgbGFiZWxQb3NpdGlvbj86IHN0cmluZzsgICAgICAgICAgLy8gTGFiZWwgY2FuIGJlIHBvc2l0aW9uZWQgdG8gYmUgJ2JlZm9yZScgb3IgJ2FmdGVyJyB0aGUgY2hlY2tib3guIERlZmF1bHQgaXMgJ2FmdGVyJ1xuICBtZXRhZGF0YT86IG9iamVjdDsgICAgICAgICAgICAgIC8vIEFycmF5IG9mIG9iamVjdHMuIFRvIGJlIHBhc3NlZCBiYWNrIG9uIHRoZSBldmVudCBlbWl0dGVyIGFuZCBpbmNsdWRlZCBpbiBhIHBhdGNoIGlmIGRlc2lyZWQuXG4gIG5hbWU/OiBzdHJpbmc7XG4gIG5vSW5pdGlhbFZhbHVlPzpib29sZWFuOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2V0IHRvIHRydWUgdG8gYWx3YXlzIGhhdmUgYW4gZW1wdHkgdmFsdWUgb24gbG9hZFxuICBwYXRjaD86IEZpZWxkSXRlbVBhdGNoSW50ZXJmYWNlOyAgICAgICAgIC8vIElmIGZpZWxkIHNob3VsZCBiZSBhdXRvLXBhdGNoZWQuXG4gIHRhYk9uRW50ZXI/OmJvb2xlYW47XG4gIHBhZGRpbmc/OiBzdHJpbmc7ICAgICAgICAgICAgICAgLy8gcGFkZGluZyBhZGp1c3RtZW50XG4gIHNlc3Npb24/OiBib29sZWFuOyAgICAgICAgICAgICAgICAvLyBJZiBmaWVsZCB2YWx1ZSBjaGFuZ2Ugc2hvdWxkIGJlIHN0b3JlZCB0byBjb3JlIGVudGl0eVxuICBzZXNzaW9uUGF0aD86IHN0cmluZzsgICAgICAgICAgICAgICAgLy8gSWYgc2Vzc2lvbiBwYXRoIGlmIG5vdCBzdG9yZWQgb24gcm9vdCBlbnRpdHlcbiAgdGV4dE92ZXJmbG93Pzond3JhcCcgfCAnZWxsaXBzaXMnOyAgIC8vIFNldCB0aGUgdGV4dCBvdmVyZmxvdyBiZWhhdmlvciwgZGVmYXVsdCB3cmFwXG4gIHRvb2x0aXA/OiBzdHJpbmc7XG4gIHZhbGlkYXRvcnM/OiBBcnJheTxWYWxpZGF0b3JzPjsgLy8gQXJyYXkgb2YgVmFsaWRhdG9ycy5cbiAgdmFsdWU/OiBib29sZWFuIHwgbnVtYmVyIHwgc3RyaW5nOyAgICAgICAgLy8gSW5pdGlhbCB2YWx1ZS5cblxufVxuXG5cbmV4cG9ydCBjbGFzcyBTd2l0Y2hDb25maWcgaW1wbGVtZW50cyBTZXRDb250cm9sIHtcbiAgYnViYmxlID0gZmFsc2U7XG4gIGNvbnRyb2w6IEZvcm1Db250cm9sO1xuICBkaXNhYmxlZCA9IGZhbHNlO1xuICBkaXNwbGF5RXJyb3JzID0gdHJ1ZTtcbiAgZW1wdHk/OiAnQ29udmVydEVtcHR5VG9OdWxsJyB8ICdDb252ZXJ0RW1wdHlUb1plcm8nO1xuICBmYWNhZGUgPSBmYWxzZTtcbiAgaGVscFRleHQgPSAnJztcbiAgaWQ6IG51bWJlciB8IHN0cmluZztcbiAgbGFiZWwgPSAnJztcbiAgbGFiZWxQb3NpdGlvbiA9ICdhZnRlcic7XG4gIG1lc3NhZ2UgPSAnJztcbiAgbWV0YWRhdGE7XG4gIG5vSW5pdGlhbFZhbHVlID0gZmFsc2U7XG4gIG5hbWU/ID0gJ25hbWUnO1xuICBwYXRjaDogRmllbGRJdGVtUGF0Y2hJbnRlcmZhY2U7XG4gIHBhZGRpbmcgPSAnMCc7XG4gIHNlc3Npb24/OiBib29sZWFuO1xuICBzZXNzaW9uUGF0aD86IHN0cmluZztcbiAgc2V0VmFsdWU7XG4gIHN3aXRjaFJlZjtcbiAgdHJpZ2dlck9uQ2hhbmdlO1xuICB0b29sdGlwOiBzdHJpbmc7XG4gIHRvb2xUaXBEaXJlY3Rpb24gPSAncmlnaHQnO1xuICB0YWJPbkVudGVyID0gZmFsc2U7XG4gIHRleHRPdmVyZmxvdyA9ICd3cmFwJztcbiAgdmFsaWRhdG9ycztcbiAgdmFsdWU6IGJvb2xlYW4gfCBudW1iZXIgfCBzdHJpbmcgPSBmYWxzZTtcblxuXG4gIGNvbnN0cnVjdG9yKHBhcmFtcz86IFN3aXRjaENvbmZpZ0ludGVyZmFjZSl7XG4gICAgaWYoIHBhcmFtcyApIGZvciggY29uc3QgaSBpbiBwYXJhbXMgKSB0aGlzWyBpIF0gPSBwYXJhbXNbIGkgXTtcbiAgICB0aGlzLnZhbHVlID0gK3RoaXMudmFsdWUgPT09IDEgPyB0cnVlIDogZmFsc2U7XG4gICAgdGhpcy5sYWJlbFBvc2l0aW9uID0gWyAnYmVmb3JlJywgJ2FmdGVyJyBdLmluZGV4T2YodGhpcy5sYWJlbFBvc2l0aW9uKSA+PSAwID8gdGhpcy5sYWJlbFBvc2l0aW9uIDogJ2FmdGVyJztcbiAgICBpZiggdGhpcy5sYWJlbCApe1xuICAgICAgaWYoIHRoaXMubGFiZWxQb3NpdGlvbiA9PT0gJ2FmdGVyJyApe1xuICAgICAgICB0aGlzLnRvb2xUaXBEaXJlY3Rpb24gPSAncmlnaHQnO1xuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgdGhpcy50b29sVGlwRGlyZWN0aW9uID0gJ2Fib3ZlJztcbiAgICB9XG4gICAgaWYoICF0aGlzLnBhdGNoICkgdGhpcy5wYXRjaCA9IHsgZmllbGQ6ICcnLCBkdXJhdGlvbjogNzUwLCBwYXRoOiAnJywgZGlzYWJsZWQ6IGZhbHNlICwgYnVzaW5lc3NJZDogMCB9O1xuICAgIGlmKCAhdGhpcy5kaXNhYmxlZCApIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBpZiggdGhpcy5wYXRjaC5kaXNwbGF5SW5kaWNhdG9yICE9PSBmYWxzZSApIHRoaXMucGF0Y2guZGlzcGxheUluZGljYXRvciA9IHRydWU7XG4gICAgaWYoICF0aGlzLmNvbnRyb2wgKSB0aGlzLnNldENvbnRyb2woKTtcbiAgfVxuXG5cbiAgc2V0Q29udHJvbCgpe1xuICAgIHRoaXMuY29udHJvbCA9IHRoaXMuZGlzYWJsZWQgPT09IHRydWUgPyBuZXcgRm9ybUNvbnRyb2woe1xuICAgICAgdmFsdWU6IHRoaXMudmFsdWUsXG4gICAgICBkaXNhYmxlZDogdGhpcy5kaXNhYmxlZFxuICAgIH0pIDogbmV3IEZvcm1Db250cm9sKHRoaXMudmFsdWUsICggdGhpcy52YWxpZGF0b3JzID8gdGhpcy52YWxpZGF0b3JzIDogW10gKSk7XG4gIH1cblxufVxuXG4iXX0=