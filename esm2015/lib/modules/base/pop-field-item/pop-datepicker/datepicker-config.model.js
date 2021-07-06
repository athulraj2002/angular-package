import { FormControl } from '@angular/forms';
export class DatePickerConfig {
    constructor(params) {
        // Defaults
        this.bubble = false;
        this.displayErrors = true;
        this.disabled = false;
        this.filterPredicate = null;
        this.helpText = '';
        this.id = '';
        this.label = '';
        this.min = null;
        this.max = null;
        this.message = '';
        this.name = 'name';
        this.noInitialValue = false;
        this.showTooltip = false;
        this.tooltip = '';
        if (params)
            for (const i in params)
                this[i] = params[i];
        if (this.value)
            this.value = new Date(this.value);
        if (typeof this.min === 'string') {
            this.min = new Date(this.min);
        }
        if (isNaN(this.max) === false) {
            const maxDate = new Date();
            // maxDate.setDate(maxDate.getDate() - 1);
            maxDate.setDate(maxDate.getDate() + parseInt(this.max, 10));
            this.max = new Date(maxDate);
        }
        if (!this.patch)
            this.patch = { field: '', duration: 750, path: '', disabled: false, businessId: 0 };
        if (this.patch.displayIndicator !== false)
            this.patch.displayIndicator = true;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1jb25maWcubW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1kYXRlcGlja2VyL2RhdGVwaWNrZXItY29uZmlnLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQWMsTUFBTSxnQkFBZ0IsQ0FBQztBQW1DekQsTUFBTSxPQUFPLGdCQUFnQjtJQW1DM0IsWUFBYSxNQUFrQztRQWhDL0MsV0FBVztRQUNYLFdBQU0sR0FBRyxLQUFLLENBQUM7UUFFZixrQkFBYSxHQUFHLElBQUksQ0FBQztRQUNyQixhQUFRLEdBQUcsS0FBSyxDQUFDO1FBRWpCLG9CQUFlLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLGFBQVEsR0FBRyxFQUFFLENBQUM7UUFDZCxPQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ1IsVUFBSyxHQUFHLEVBQUUsQ0FBQztRQUNYLFFBQUcsR0FBRyxJQUFJLENBQUM7UUFDWCxRQUFHLEdBQUcsSUFBSSxDQUFDO1FBQ1gsWUFBTyxHQUFHLEVBQUUsQ0FBQztRQUViLFNBQUksR0FBRyxNQUFNLENBQUM7UUFDZCxtQkFBYyxHQUFHLEtBQUssQ0FBQztRQUt2QixnQkFBVyxHQUFHLEtBQUssQ0FBQztRQUVwQixZQUFPLEdBQUcsRUFBRSxDQUFDO1FBV1gsSUFBSSxNQUFNO1lBQUcsS0FBSyxNQUFNLENBQUMsSUFBSSxNQUFNO2dCQUFHLElBQUksQ0FBRSxDQUFDLENBQUUsR0FBRyxNQUFNLENBQUUsQ0FBQyxDQUFFLENBQUM7UUFDOUQsSUFBSSxJQUFJLENBQUMsS0FBSztZQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBRSxDQUFDO1FBQ3JELElBQUksT0FBTyxJQUFJLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBQztZQUMvQixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxDQUFFLElBQUksQ0FBQyxHQUFHLENBQUUsQ0FBQztTQUNqQztRQUNELElBQUksS0FBSyxDQUFFLElBQUksQ0FBQyxHQUFHLENBQUUsS0FBSyxLQUFLLEVBQUU7WUFDL0IsTUFBTSxPQUFPLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUMzQiwwQ0FBMEM7WUFDMUMsT0FBTyxDQUFDLE9BQU8sQ0FBRSxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsUUFBUSxDQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFFLENBQUUsQ0FBQztZQUNoRSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxDQUFFLE9BQU8sQ0FBRSxDQUFDO1NBQ2hDO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLO1lBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3RHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsS0FBSyxLQUFLO1lBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDL0UsSUFBSSxJQUFJLENBQUMsY0FBYztZQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQzFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUN4QyxDQUFDO0lBR0QsVUFBVTtRQUNSLElBQUksQ0FBQyxPQUFPLEdBQWlCLENBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUU7WUFDOUQsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxJQUFJO1NBQ2YsQ0FBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFFLENBQUUsQ0FBRSxDQUFDO0lBQ3BGLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEZvcm1Db250cm9sLCBWYWxpZGF0b3JzIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgRmllbGRJdGVtUGF0Y2hJbnRlcmZhY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFNldENvbnRyb2wgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLWRvbS5tb2RlbHMnO1xuXG5leHBvcnQgdHlwZSBEYXRlRmlsdGVyUHJlZGljYXRlID0gKCBkOiBEYXRlICkgPT4gYm9vbGVhbjtcblxuXG5cblxuZXhwb3J0IGludGVyZmFjZSBEYXRlUGlja2VyQ29uZmlnSW50ZXJmYWNlIHtcbiAgYnViYmxlPzogYm9vbGVhbjsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmaXJlIGV2ZW50c1xuICBkaXNhYmxlZD86IGJvb2xlYW47ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1hcmsgYXMgZGlzYWJsZWQuXG4gIGRpc3BsYXlFcnJvcnM/OiBib29sZWFuOyAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgRXJyb3IgbWVzc2FnZXMgc2hvdWxkIGJlIGRpc3BsYXllZC5cbiAgbmFtZT86IHN0cmluZzsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBlbnRpdHlJZCBmaWVsZCBuYW1lXG4gIGZhY2FkZT86IGJvb2xlYW47XG4gIGZpbHRlclByZWRpY2F0ZT86IHN0cmluZyB8IERhdGVGaWx0ZXJQcmVkaWNhdGU7ICAgLy8gQSBmdW5jdGlvbiB0byByZW1vdmUgY2VydGFpbiBkYXRlc1xuICBoZWxwVGV4dD86IHN0cmluZzsgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9uIGhvdmVyIGhlbHBlciB0ZXh0LlxuICBpZD86IHN0cmluZyB8IG51bWJlcjsgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEEgbnVtYmVyIHRoYXQgd2lsbCBiZSBpbmNsdWRlZCBpbiB0aGUgZXZlbnRzIHNvIHlvdSBrbm93IHdoaWNoIGZpZWxkIGl0IGNhbWUgZnJvbS5cbiAgbGFiZWw/OiBzdHJpbmc7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEYXRlIGxhYmVsLlxuICBtaW4/OiBzdHJpbmcgfCBudW1iZXIgfCBEYXRlOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaWVsZCBtdWx0aXBsZV9taW4gZGF0ZS5cbiAgbWF4Pzogc3RyaW5nIHwgbnVtYmVyIHwgRGF0ZTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmllbGQgbXVsdGlwbGVfbWF4IGRhdGUuXG4gIG1ldGFkYXRhPzogb2JqZWN0OyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXJyYXkgb2Ygb2JqZWN0cy4gVG8gYmUgcGFzc2VkIGJhY2sgb24gdGhlIGV2ZW50IGVtaXR0ZXIgYW5kIGluY2x1ZGVkIGluIGEgcGF0Y2ggaWYgZGVzaXJlZC5cbiAgbm9Jbml0aWFsVmFsdWU/OiBib29sZWFuOyAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2V0IHRvIHRydWUgdG8gYWx3YXlzIGhhdmUgYW4gZW1wdHkgdmFsdWUgb24gbG9hZFxuICByZXF1aXJlZD86IGJvb2xlYW47XG4gIHNlc3Npb24/OiBib29sZWFuOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgZmllbGQgdmFsdWUgY2hhbmdlIHNob3VsZCBiZSBzdG9yZWQgdG8gY29yZSBlbnRpdHlcbiAgc2Vzc2lvblBhdGg/OiBzdHJpbmc7ICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHNlc3Npb24gcGF0aCBpZiBub3Qgc3RvcmVkIG9uIHJvb3QgZW50aXR5XG4gIHBhdGNoPzogRmllbGRJdGVtUGF0Y2hJbnRlcmZhY2U7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgZmllbGQgc2hvdWxkIGJlIGF1dG8tcGF0Y2hlZC5cbiAgdG9vbHRpcD86IHN0cmluZzsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUb29sdGlwIGZvciBpbmZvcm1hdGlvbiB0byBzaG93IHdoZW4gaW5wdXQgaXMgZm9jdXNlZFxuICB0cmFuc2Zvcm1hdGlvbj86IHN0cmluZzsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRyYW5zZm9ybSB0aGUgaW5wdXQgdG8gbWF0Y2ggYSBzcGVjaWZpYyBjYXNlIG9mIGZvcm1hdFxuICB2YWxpZGF0b3JzPzogQXJyYXk8VmFsaWRhdG9ycz47ICAgICAgICAgICAgICAgICAgIC8vIEFycmF5IG9mIFZhbGlkYXRvcnMuXG4gIHZhbHVlPzogc3RyaW5nIHwgbnVtYmVyOyAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW5pdGlhbCB2YWx1ZVxuICBvcHRpb25zPzogb2JqZWN0OyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vXG59XG5cblxuZXhwb3J0IGNsYXNzIERhdGVQaWNrZXJDb25maWcgaW1wbGVtZW50cyBTZXRDb250cm9sIHtcblxuXG4gIC8vIERlZmF1bHRzXG4gIGJ1YmJsZSA9IGZhbHNlO1xuICBjb250cm9sOiBGb3JtQ29udHJvbDtcbiAgZGlzcGxheUVycm9ycyA9IHRydWU7XG4gIGRpc2FibGVkID0gZmFsc2U7XG4gIGZhY2FkZT86IGJvb2xlYW47XG4gIGZpbHRlclByZWRpY2F0ZSA9IG51bGw7XG4gIGhlbHBUZXh0ID0gJyc7XG4gIGlkID0gJyc7XG4gIGxhYmVsID0gJyc7XG4gIG1pbiA9IG51bGw7XG4gIG1heCA9IG51bGw7XG4gIG1lc3NhZ2UgPSAnJztcbiAgbWV0YWRhdGE7XG4gIG5hbWUgPSAnbmFtZSc7XG4gIG5vSW5pdGlhbFZhbHVlID0gZmFsc2U7XG4gIHBhdGNoOiBGaWVsZEl0ZW1QYXRjaEludGVyZmFjZTtcbiAgcmVxdWlyZWQ/OiBib29sZWFuO1xuICBzZXNzaW9uPzogYm9vbGVhbjtcbiAgc2Vzc2lvblBhdGg/OiBzdHJpbmc7XG4gIHNob3dUb29sdGlwID0gZmFsc2U7XG4gIHRyYW5zZm9ybWF0aW9uO1xuICB0b29sdGlwID0gJyc7XG4gIHZhbHVlO1xuICBjbGVhck1lc3NhZ2U7XG4gIHRyaWdnZXJPbkNoYW5nZTtcblxuICAvLyBObyBEZWZhdWx0c1xuXG4gIHZhbGlkYXRvcnM7XG5cblxuICBjb25zdHJ1Y3RvciggcGFyYW1zPzogRGF0ZVBpY2tlckNvbmZpZ0ludGVyZmFjZSApe1xuICAgIGlmKCBwYXJhbXMgKSBmb3IoIGNvbnN0IGkgaW4gcGFyYW1zICkgdGhpc1sgaSBdID0gcGFyYW1zWyBpIF07XG4gICAgaWYoIHRoaXMudmFsdWUgKSB0aGlzLnZhbHVlID0gbmV3IERhdGUoIHRoaXMudmFsdWUgKTtcbiAgICBpZiggdHlwZW9mIHRoaXMubWluID09PSAnc3RyaW5nJyl7XG4gICAgICB0aGlzLm1pbiA9IG5ldyBEYXRlKCB0aGlzLm1pbiApO1xuICAgIH1cbiAgICBpZiggaXNOYU4oIHRoaXMubWF4ICkgPT09IGZhbHNlICl7XG4gICAgICBjb25zdCBtYXhEYXRlID0gbmV3IERhdGUoKTtcbiAgICAgIC8vIG1heERhdGUuc2V0RGF0ZShtYXhEYXRlLmdldERhdGUoKSAtIDEpO1xuICAgICAgbWF4RGF0ZS5zZXREYXRlKCBtYXhEYXRlLmdldERhdGUoKSArIHBhcnNlSW50KCB0aGlzLm1heCwgMTAgKSApO1xuICAgICAgdGhpcy5tYXggPSBuZXcgRGF0ZSggbWF4RGF0ZSApO1xuICAgIH1cbiAgICBpZiggIXRoaXMucGF0Y2ggKSB0aGlzLnBhdGNoID0geyBmaWVsZDogJycsIGR1cmF0aW9uOiA3NTAsIHBhdGg6ICcnLCBkaXNhYmxlZDogZmFsc2UsIGJ1c2luZXNzSWQ6IDAgfTtcbiAgICBpZiggdGhpcy5wYXRjaC5kaXNwbGF5SW5kaWNhdG9yICE9PSBmYWxzZSApIHRoaXMucGF0Y2guZGlzcGxheUluZGljYXRvciA9IHRydWU7XG4gICAgaWYoIHRoaXMubm9Jbml0aWFsVmFsdWUgKSB0aGlzLnZhbHVlID0gJyc7XG4gICAgaWYoICF0aGlzLmNvbnRyb2wgKSB0aGlzLnNldENvbnRyb2woKTtcbiAgfVxuXG5cbiAgc2V0Q29udHJvbCgpe1xuICAgIHRoaXMuY29udHJvbCA9IDxGb3JtQ29udHJvbD4gKCB0aGlzLmRpc2FibGVkID8gbmV3IEZvcm1Db250cm9sKCB7XG4gICAgICB2YWx1ZTogdGhpcy52YWx1ZSxcbiAgICAgIGRpc2FibGVkOiB0cnVlXG4gICAgfSApIDogbmV3IEZvcm1Db250cm9sKCB0aGlzLnZhbHVlLCAoIHRoaXMudmFsaWRhdG9ycyA/IHRoaXMudmFsaWRhdG9ycyA6IFtdICkgKSApO1xuICB9XG59XG4iXX0=