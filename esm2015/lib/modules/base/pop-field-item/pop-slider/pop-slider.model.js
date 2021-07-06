import { FormControl } from '@angular/forms';
export class SliderConfig {
    constructor(params) {
        this.autoTicks = false;
        this.bubble = false;
        this.column = 'column';
        this.displayErrors = true;
        this.disabled = false;
        this.facade = false;
        this.helpText = '';
        this.label = '';
        this.message = '';
        this.max = 100;
        this.min = 1;
        this.noInitialValue = false;
        this.options = [];
        this.step = 1;
        this.showTooltip = false;
        this.showTicks = true;
        this.thumbLabel = true;
        this.tickInterval = 1;
        this.tooltip = '';
        this.value = null;
        if (params)
            for (const i in params)
                this[i] = params[i];
        if (!this.patch)
            this.patch = { field: '', duration: 750, path: '', disabled: false, businessId: 0 };
        if (this.patch.displayIndicator !== false)
            this.patch.displayIndicator = true;
        if (this.min > this.max) {
            this.min = this.max;
        }
        if (this.noInitialValue)
            this.value = '';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXNsaWRlci5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXNsaWRlci9wb3Atc2xpZGVyLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQWMsTUFBTSxnQkFBZ0IsQ0FBQztBQWdDekQsTUFBTSxPQUFPLFlBQVk7SUErQnZCLFlBQVksTUFBOEI7UUE3QjFDLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFDbEIsV0FBTSxHQUFHLEtBQUssQ0FBQztRQUNmLFdBQU0sR0FBRyxRQUFRLENBQUM7UUFFbEIsa0JBQWEsR0FBRyxJQUFJLENBQUM7UUFDckIsYUFBUSxHQUFHLEtBQUssQ0FBQztRQUNqQixXQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ2YsYUFBUSxHQUFHLEVBQUUsQ0FBQztRQUVkLFVBQUssR0FBRyxFQUFFLENBQUM7UUFDWCxZQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsUUFBRyxHQUFHLEdBQUcsQ0FBQztRQUNWLFFBQUcsR0FBRyxDQUFDLENBQUM7UUFFUixtQkFBYyxHQUFHLEtBQUssQ0FBQztRQUN2QixZQUFPLEdBQXNCLEVBQUUsQ0FBQztRQUloQyxTQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ1QsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUFDcEIsY0FBUyxHQUFHLElBQUksQ0FBQztRQUNqQixlQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLGlCQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLFlBQU8sR0FBRyxFQUFFLENBQUM7UUFFYixVQUFLLEdBQThCLElBQUksQ0FBQztRQUl0QyxJQUFJLE1BQU07WUFBRyxLQUFLLE1BQU0sQ0FBQyxJQUFJLE1BQU07Z0JBQUcsSUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHLE1BQU0sQ0FBRSxDQUFDLENBQUUsQ0FBQztRQUM5RCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUs7WUFBRyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDdEcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixLQUFLLEtBQUs7WUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztRQUMvRSxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUN2QixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7U0FDckI7UUFDRCxJQUFJLElBQUksQ0FBQyxjQUFjO1lBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3hDLENBQUM7SUFHRCxVQUFVO1FBQ1IsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDO1lBQy9DLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztZQUNqQixRQUFRLEVBQUUsSUFBSTtTQUNmLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQUUsQ0FBQztJQUNqRixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBGb3JtQ29udHJvbCwgVmFsaWRhdG9ycyB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IEZpZWxkSXRlbU9wdGlvbiwgRmllbGRJdGVtUGF0Y2hJbnRlcmZhY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFNldENvbnRyb2wgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLWRvbS5tb2RlbHMnO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgU2xpZGVyQ29uZmlnSW50ZXJmYWNlIHtcbiAgYXV0b1RpY2tzPzogZmFsc2U7XG4gIGJ1YmJsZT86IGJvb2xlYW47ICAgICAgICAgICAgICAgLy8gZmlyZSBldmVudHNcbiAgY29sdW1uPzogc3RyaW5nOyAgICAgICAgICAgICAgLy8gdGhlIGVudGl0eUlkIGZpZWxkIG5hbWVcbiAgY29udHJvbD86IEZvcm1Db250cm9sOyAgICAgICAgICAvLyBUaGUgZm9ybSBjb250cm9sLiBJZiBub3QgcGFzc2VkIG9uZSB3aWxsIGJlIGNyZWF0ZWQuXG4gIGRpc2FibGVkPzogYm9vbGVhbjsgICAgICAgICAgICAgLy8gTWFyayBhcyByZWFkb25seS5cbiAgZGlzcGxheUVycm9ycz86IGJvb2xlYW47ICAgICAgICAvLyBJZiBFcnJvciBtZXNzYWdlcyBzaG91bGQgYmUgZGlzcGxheWVkLlxuICBmYWNhZGU6IGJvb2xlYW47XG4gIGhlbHBUZXh0Pzogc3RyaW5nOyAgICAgICAgICAgIC8vIE9uIGhvdmVyIGhlbHBlciB0ZXh0LlxuICBpZD86IG51bWJlciB8IHN0cmluZzsgICAgICAgICAgIC8vIEEgbnVtYmVyIHRoYXQgd2lsbCBiZSBpbmNsdWRlZCBpbiB0aGUgZXZlbnRzIHNvIHlvdSBrbm93IHdoaWNoIGZpZWxkIGl0IGNhbWUgZnJvbS5cbiAgbGFiZWw/OiBzdHJpbmc7ICAgICAgICAgICAgICAgICAvLyBJbnB1dCBsYWJlbC5cbiAgbWF4PzogbnVtYmVyO1xuICBtaW4/OiBudW1iZXI7XG4gIG1ldGFkYXRhPzogb2JqZWN0OyAgICAgICAgICAgICAgLy8gQXJyYXkgb2Ygb2JqZWN0cy4gVG8gYmUgcGFzc2VkIGJhY2sgb24gdGhlIGV2ZW50IGVtaXR0ZXIgYW5kIGluY2x1ZGVkIGluIGEgcGF0Y2ggaWYgZGVzaXJlZC5cbiAgbm9Jbml0aWFsVmFsdWU/OmJvb2xlYW47ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTZXQgdG8gdHJ1ZSB0byBhbHdheXMgaGF2ZSBhbiBlbXB0eSB2YWx1ZSBvbiBsb2FkXG4gIHBhdGNoPzogRmllbGRJdGVtUGF0Y2hJbnRlcmZhY2U7ICAgICAgICAgLy8gSWYgZmllbGQgc2hvdWxkIGJlIGF1dG8tcGF0Y2hlZC5cbiAgc2Vzc2lvbj86IGJvb2xlYW47ICAgICAgICAgICAgICAgIC8vIElmIGZpZWxkIHZhbHVlIGNoYW5nZSBzaG91bGQgYmUgc3RvcmVkIHRvIGNvcmUgZW50aXR5XG4gIHNlc3Npb25QYXRoPzogc3RyaW5nOyAgICAgICAgICAgICAgICAvLyBJZiBzZXNzaW9uIHBhdGggaWYgbm90IHN0b3JlZCBvbiByb290IGVudGl0eVxuICBzaG93VGlja3M/OiB0cnVlO1xuICBzdGVwPzogbnVtYmVyOyAgICAgICAgICAgICAgICAgLy8gIFNldCB0byB0cnVlIGlmIHlvdSB3YW50IG9wdGlvbnMgdG8gYmUgc29ydGVkIGluIHByaW9yaXR5IG9mIHNvcnRfb3JkZXIsIG5hbWVcbiAgdGh1bWJMYWJlbD86IHRydWU7XG4gIHRpY2tJbnRlcnZhbD86IG51bWJlcjtcbiAgdmFsaWRhdG9ycz86IEFycmF5PFZhbGlkYXRvcnM+OyAvLyBBcnJheSBvZiBWYWxpZGF0b3JzLlxuICB2YWx1ZT86IGJvb2xlYW4gfCBudW1iZXIgfCBzdHJpbmc7ICAgLy8gSW5pdGlhbCB2YWx1ZS5cbn1cblxuXG5leHBvcnQgY2xhc3MgU2xpZGVyQ29uZmlnIGltcGxlbWVudHMgU2V0Q29udHJvbCB7XG5cbiAgYXV0b1RpY2tzID0gZmFsc2U7XG4gIGJ1YmJsZSA9IGZhbHNlO1xuICBjb2x1bW4gPSAnY29sdW1uJztcbiAgY29udHJvbDogRm9ybUNvbnRyb2w7XG4gIGRpc3BsYXlFcnJvcnMgPSB0cnVlO1xuICBkaXNhYmxlZCA9IGZhbHNlO1xuICBmYWNhZGUgPSBmYWxzZTtcbiAgaGVscFRleHQgPSAnJztcbiAgaWQ7XG4gIGxhYmVsID0gJyc7XG4gIG1lc3NhZ2UgPSAnJztcbiAgbWF4ID0gMTAwO1xuICBtaW4gPSAxO1xuICBtZXRhZGF0YTtcbiAgbm9Jbml0aWFsVmFsdWUgPSBmYWxzZTtcbiAgb3B0aW9uczogRmllbGRJdGVtT3B0aW9uW10gPSBbXTtcbiAgcGF0Y2g6IEZpZWxkSXRlbVBhdGNoSW50ZXJmYWNlO1xuICBzZXNzaW9uPzogYm9vbGVhbjtcbiAgc2Vzc2lvblBhdGg/OiBzdHJpbmc7XG4gIHN0ZXAgPSAxO1xuICBzaG93VG9vbHRpcCA9IGZhbHNlO1xuICBzaG93VGlja3MgPSB0cnVlO1xuICB0aHVtYkxhYmVsID0gdHJ1ZTtcbiAgdGlja0ludGVydmFsID0gMTtcbiAgdG9vbHRpcCA9ICcnO1xuICB2YWxpZGF0b3JzO1xuICB2YWx1ZTogYm9vbGVhbiB8IG51bWJlciB8IHN0cmluZyA9IG51bGw7XG5cblxuICBjb25zdHJ1Y3RvcihwYXJhbXM/OiBTbGlkZXJDb25maWdJbnRlcmZhY2Upe1xuICAgIGlmKCBwYXJhbXMgKSBmb3IoIGNvbnN0IGkgaW4gcGFyYW1zICkgdGhpc1sgaSBdID0gcGFyYW1zWyBpIF07XG4gICAgaWYoICF0aGlzLnBhdGNoICkgdGhpcy5wYXRjaCA9IHsgZmllbGQ6ICcnLCBkdXJhdGlvbjogNzUwLCBwYXRoOiAnJywgZGlzYWJsZWQ6IGZhbHNlLCBidXNpbmVzc0lkOiAwIH07XG4gICAgaWYoIHRoaXMucGF0Y2guZGlzcGxheUluZGljYXRvciAhPT0gZmFsc2UgKSB0aGlzLnBhdGNoLmRpc3BsYXlJbmRpY2F0b3IgPSB0cnVlO1xuICAgIGlmKCB0aGlzLm1pbiA+IHRoaXMubWF4ICl7XG4gICAgICB0aGlzLm1pbiA9IHRoaXMubWF4O1xuICAgIH1cbiAgICBpZiggdGhpcy5ub0luaXRpYWxWYWx1ZSApIHRoaXMudmFsdWUgPSAnJztcbiAgICBpZiggIXRoaXMuY29udHJvbCApIHRoaXMuc2V0Q29udHJvbCgpO1xuICB9XG5cblxuICBzZXRDb250cm9sKCl7XG4gICAgdGhpcy5jb250cm9sID0gKCB0aGlzLmRpc2FibGVkID8gbmV3IEZvcm1Db250cm9sKHtcbiAgICAgIHZhbHVlOiB0aGlzLnZhbHVlLFxuICAgICAgZGlzYWJsZWQ6IHRydWVcbiAgICB9KSA6IG5ldyBGb3JtQ29udHJvbCh0aGlzLnZhbHVlLCAoIHRoaXMudmFsaWRhdG9ycyA/IHRoaXMudmFsaWRhdG9ycyA6IFtdICkpICk7XG4gIH1cbn1cbiJdfQ==