import { FormControl } from '@angular/forms';
export class SelectMultiConfig {
    constructor(params) {
        this.bubble = false;
        this.displayErrors = true;
        this.disabled = false;
        this.facade = false;
        this.helpText = '';
        this.label = '';
        this.message = '';
        this.noInitialValue = false;
        this.name = 'name';
        this.showTooltip = false;
        this.tooltip = '';
        if (params)
            for (const i in params)
                this[i] = params[i];
        this.value = Array.isArray(this.value) ? this.value : [];
        if (!this.options)
            this.options = { values: [] };
        if (this.sort && this.options.values.length > 1) {
            if (typeof this.options.values[0].sort_order !== 'undefined') {
                this.options.values.sort((a, b) => {
                    if (a.sort_order < b.sort_order)
                        return -1;
                    if (a.sort_order > b.sort_order)
                        return 1;
                    return 0;
                });
            }
            else {
                this.options.values.sort((a, b) => {
                    if (a.name < b.name)
                        return -1;
                    if (a.name > b.name)
                        return 1;
                    return 0;
                });
            }
        }
        if (!this.patch)
            this.patch = { field: '', duration: 750, path: '', disabled: false };
        if (this.patch.displayIndicator !== false)
            this.patch.displayIndicator = true;
        if (this.noInitialValue)
            this.value = [];
        if (!this.control)
            this.setControl();
    }
    setControl() {
        this.control = (this.disabled ? new FormControl({
            value: this.value,
            disabled: true
        }) : new FormControl(this.value, (this.validators ? this.validators : [])));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LW11bGl0LWNvbmZpZy5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXNlbGVjdC1tdWx0aS9zZWxlY3QtbXVsaXQtY29uZmlnLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQWMsTUFBTSxnQkFBZ0IsQ0FBQztBQTZCekQsTUFBTSxPQUFPLGlCQUFpQjtJQTRCNUIsWUFBYSxNQUFtQztRQTNCaEQsV0FBTSxHQUFHLEtBQUssQ0FBQztRQUdmLGtCQUFhLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLGFBQVEsR0FBRyxLQUFLLENBQUM7UUFDakIsV0FBTSxHQUFHLEtBQUssQ0FBQztRQUNmLGFBQVEsR0FBRyxFQUFFLENBQUM7UUFFZCxVQUFLLEdBQUcsRUFBRSxDQUFDO1FBR1gsWUFBTyxHQUFHLEVBQUUsQ0FBQztRQUNiLG1CQUFjLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLFNBQUksR0FBRyxNQUFNLENBQUM7UUFPZCxnQkFBVyxHQUFHLEtBQUssQ0FBQztRQUNwQixZQUFPLEdBQUcsRUFBRSxDQUFDO1FBT1gsSUFBSSxNQUFNO1lBQUcsS0FBSyxNQUFNLENBQUMsSUFBSSxNQUFNO2dCQUFHLElBQUksQ0FBRSxDQUFDLENBQUUsR0FBRyxNQUFNLENBQUUsQ0FBQyxDQUFFLENBQUM7UUFDOUQsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzNELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDbEQsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDL0MsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFFLENBQUMsQ0FBRSxDQUFDLFVBQVUsS0FBSyxXQUFXLEVBQUU7Z0JBQzlELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBRSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUcsRUFBRTtvQkFDbkMsSUFBSSxDQUFDLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxVQUFVO3dCQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQzVDLElBQUksQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsVUFBVTt3QkFBRyxPQUFPLENBQUMsQ0FBQztvQkFDM0MsT0FBTyxDQUFDLENBQUM7Z0JBQ1gsQ0FBQyxDQUFFLENBQUM7YUFDTDtpQkFBSTtnQkFDSCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFHLEVBQUU7b0JBQ25DLElBQUksQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSTt3QkFBRyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNoQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUk7d0JBQUcsT0FBTyxDQUFDLENBQUM7b0JBQy9CLE9BQU8sQ0FBQyxDQUFDO2dCQUNYLENBQUMsQ0FBRSxDQUFDO2FBQ0w7U0FDRjtRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSztZQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUM7UUFDdkYsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixLQUFLLEtBQUs7WUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztRQUMvRSxJQUFJLElBQUksQ0FBQyxjQUFjO1lBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3hDLENBQUM7SUFHRCxVQUFVO1FBQ1IsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFFO1lBQ2hELEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztZQUNqQixRQUFRLEVBQUUsSUFBSTtTQUNmLENBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBRSxDQUFFLENBQUUsQ0FBQztJQUNwRixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBGb3JtQ29udHJvbCwgVmFsaWRhdG9ycyB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IEZpZWxkSXRlbU9wdGlvbnMsIEZpZWxkSXRlbVBhdGNoSW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBTZXRDb250cm9sIH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi1kb20ubW9kZWxzJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIFNlbGVjdE11bHRpQ29uZmlnSW50ZXJmYWNlIHtcbiAgYnViYmxlPzogYm9vbGVhbjsgICAgICAgICAgICAgICAvLyBmaXJlIGV2ZW50c1xuICBjb2x1bW4/OiBzdHJpbmc7ICAgICAgICAgICAgICAvLyB0aGUgZW50aXR5SWQgZmllbGQgbmFtZVxuICBjb250cm9sPzogRm9ybUNvbnRyb2w7ICAgICAgICAgIC8vIFRoZSBmb3JtIGNvbnRyb2wuIElmIG5vdCBwYXNzZWQgb25lIHdpbGwgYmUgY3JlYXRlZC5cbiAgZGlzcGxheUVycm9ycz86IGJvb2xlYW47ICAgICAgICAvLyBJZiBFcnJvciBtZXNzYWdlcyBzaG91bGQgYmUgZGlzcGxheWVkLlxuICBkaXNhYmxlZD86IGJvb2xlYW47ICAgICAgICAgICAgIC8vIE1hcmsgYXMgcmVhZG9ubHkuXG4gIGZhY2FkZT86Ym9vbGVhbjtcbiAgaGVscFRleHQ/OiBzdHJpbmc7ICAgICAgICAgICAgLy8gT24gaG92ZXIgaGVscGVyIHRleHQuXG4gIGlkPzogbnVtYmVyIHwgc3RyaW5nOyAgICAgICAgICAgLy8gQSBudW1iZXIgdGhhdCB3aWxsIGJlIGluY2x1ZGVkIGluIHRoZSBldmVudHMgc28geW91IGtub3cgd2hpY2ggZmllbGQgaXQgY2FtZSBmcm9tLlxuICBsYWJlbD86IHN0cmluZzsgICAgICAgICAgICAgICAgIC8vIElucHV0IGxhYmVsLlxuICBtZXRhZGF0YT86IG9iamVjdDsgICAgICAgICAgICAgIC8vIEFycmF5IG9mIG9iamVjdHMuIFRvIGJlIHBhc3NlZCBiYWNrIG9uIHRoZSBldmVudCBlbWl0dGVyIGFuZCBpbmNsdWRlZCBpbiBhIHBhdGNoIGlmIGRlc2lyZWQuXG4gIG1pbmltYWw/OiBib29sZWFuOyAgICAgICAgICAgICAgLy8gQWxsb3dzIHRoZSBpbnB1dCB0byBmaXQgaW4gYSB0aWdodGVyIHNwYWNlLCByZW1vdmVzIGluZGljYXRvcnMgYW5kIHBhZGRpbmdcbiAgbm9Jbml0aWFsVmFsdWU/OmJvb2xlYW47ICAgICAgICAgLy8gU2V0IHRvIHRydWUgdG8gYWx3YXlzIGhhdmUgYW4gZW1wdHkgdmFsdWUgb24gbG9hZFxuICBvcHRpb25zPzogRmllbGRJdGVtT3B0aW9uczsgICAgICAgIC8vIEFycmF5IG9mIEZpZWxkT3B0aW9uc1xuICBwYXRjaD86IEZpZWxkSXRlbVBhdGNoSW50ZXJmYWNlOyAgICAgICAgIC8vIElmIGZpZWxkIHNob3VsZCBiZSBhdXRvLXBhdGNoZWQuXG4gIHNlc3Npb24/OiBib29sZWFuOyAgICAgICAgICAgICAgICAvLyBJZiBmaWVsZCB2YWx1ZSBjaGFuZ2Ugc2hvdWxkIGJlIHN0b3JlZCB0byBjb3JlIGVudGl0eVxuICBzZXNzaW9uUGF0aD86IHN0cmluZzsgICAgICAgICAgICAgICAgLy8gSWYgc2Vzc2lvbiBwYXRoIGlmIG5vdCBzdG9yZWQgb24gcm9vdCBlbnRpdHlcbiAgc29ydD86IGJvb2xlYW47ICAgICAgICAgICAgICAgICAvLyAgU2V0IHRvIHRydWUgaWYgeW91IHdhbnQgb3B0aW9ucyB0byBiZSBzb3J0ZWQgaW4gcHJpb3JpdHkgb2Ygc29ydF9vcmRlciwgbmFtZVxuICB0b29sdGlwPzogc3RyaW5nOyAgICAgICAgICAgICAgIC8vIFRvb2x0aXAgZm9yIGluZm9ybWF0aW9uIHRvIHNob3cgd2hlbiBpbnB1dCBpcyBmb2N1c2VkXG4gIHZhbGlkYXRvcnM/OiBBcnJheTxWYWxpZGF0b3JzPjsgLy8gQXJyYXkgb2YgVmFsaWRhdG9ycy5cbiAgdmFsdWU/OiBBcnJheTxudW1iZXIgfCBzdHJpbmc+OyAgIC8vIEluaXRpYWwgdmFsdWUuXG59XG5cblxuZXhwb3J0IGNsYXNzIFNlbGVjdE11bHRpQ29uZmlnIGltcGxlbWVudHMgU2V0Q29udHJvbCB7XG4gIGJ1YmJsZSA9IGZhbHNlO1xuICBjbGVhck1lc3NhZ2U7XG4gIGNvbnRyb2w6IEZvcm1Db250cm9sO1xuICBkaXNwbGF5RXJyb3JzID0gdHJ1ZTtcbiAgZGlzYWJsZWQgPSBmYWxzZTtcbiAgZmFjYWRlID0gZmFsc2U7XG4gIGhlbHBUZXh0ID0gJyc7XG4gIGlkO1xuICBsYWJlbCA9ICcnO1xuICBtaW5pbWFsPzogZmFsc2U7XG4gIG1ldGFkYXRhO1xuICBtZXNzYWdlID0gJyc7XG4gIG5vSW5pdGlhbFZhbHVlID0gZmFsc2U7XG4gIG5hbWUgPSAnbmFtZSc7XG4gIG9wdGlvbnM/OiBGaWVsZEl0ZW1PcHRpb25zO1xuICBwYXRjaDogRmllbGRJdGVtUGF0Y2hJbnRlcmZhY2U7XG4gIHJvdXRlO1xuICBzZXNzaW9uPzogYm9vbGVhbjtcbiAgc2Vzc2lvblBhdGg/OiBzdHJpbmc7XG4gIHNvcnQ6IGZhbHNlO1xuICBzaG93VG9vbHRpcCA9IGZhbHNlO1xuICB0b29sdGlwID0gJyc7XG4gIHRyaWdnZXJPbkNoYW5nZTogQ2FsbGFibGVGdW5jdGlvbjtcbiAgdmFsaWRhdG9ycztcbiAgdmFsdWU7XG5cblxuICBjb25zdHJ1Y3RvciggcGFyYW1zPzogU2VsZWN0TXVsdGlDb25maWdJbnRlcmZhY2UgKXtcbiAgICBpZiggcGFyYW1zICkgZm9yKCBjb25zdCBpIGluIHBhcmFtcyApIHRoaXNbIGkgXSA9IHBhcmFtc1sgaSBdO1xuICAgIHRoaXMudmFsdWUgPSBBcnJheS5pc0FycmF5KCB0aGlzLnZhbHVlICkgPyB0aGlzLnZhbHVlIDogW107XG4gICAgaWYoICF0aGlzLm9wdGlvbnMgKSB0aGlzLm9wdGlvbnMgPSB7IHZhbHVlczogW10gfTtcbiAgICBpZiggdGhpcy5zb3J0ICYmIHRoaXMub3B0aW9ucy52YWx1ZXMubGVuZ3RoID4gMSApe1xuICAgICAgaWYoIHR5cGVvZiB0aGlzLm9wdGlvbnMudmFsdWVzWyAwIF0uc29ydF9vcmRlciAhPT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgdGhpcy5vcHRpb25zLnZhbHVlcy5zb3J0KCAoIGEsIGIgKSA9PiB7XG4gICAgICAgICAgaWYoIGEuc29ydF9vcmRlciA8IGIuc29ydF9vcmRlciApIHJldHVybiAtMTtcbiAgICAgICAgICBpZiggYS5zb3J0X29yZGVyID4gYi5zb3J0X29yZGVyICkgcmV0dXJuIDE7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0gKTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLm9wdGlvbnMudmFsdWVzLnNvcnQoICggYSwgYiApID0+IHtcbiAgICAgICAgICBpZiggYS5uYW1lIDwgYi5uYW1lICkgcmV0dXJuIC0xO1xuICAgICAgICAgIGlmKCBhLm5hbWUgPiBiLm5hbWUgKSByZXR1cm4gMTtcbiAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCAhdGhpcy5wYXRjaCApIHRoaXMucGF0Y2ggPSB7IGZpZWxkOiAnJywgZHVyYXRpb246IDc1MCwgcGF0aDogJycsIGRpc2FibGVkOiBmYWxzZSB9O1xuICAgIGlmKCB0aGlzLnBhdGNoLmRpc3BsYXlJbmRpY2F0b3IgIT09IGZhbHNlICkgdGhpcy5wYXRjaC5kaXNwbGF5SW5kaWNhdG9yID0gdHJ1ZTtcbiAgICBpZiggdGhpcy5ub0luaXRpYWxWYWx1ZSApIHRoaXMudmFsdWUgPSBbXTtcbiAgICBpZiggIXRoaXMuY29udHJvbCApIHRoaXMuc2V0Q29udHJvbCgpO1xuICB9XG5cblxuICBzZXRDb250cm9sKCl7XG4gICAgdGhpcy5jb250cm9sID0gKCB0aGlzLmRpc2FibGVkID8gbmV3IEZvcm1Db250cm9sKCB7XG4gICAgICB2YWx1ZTogdGhpcy52YWx1ZSxcbiAgICAgIGRpc2FibGVkOiB0cnVlXG4gICAgfSApIDogbmV3IEZvcm1Db250cm9sKCB0aGlzLnZhbHVlLCAoIHRoaXMudmFsaWRhdG9ycyA/IHRoaXMudmFsaWRhdG9ycyA6IFtdICkgKSApO1xuICB9XG59XG4iXX0=