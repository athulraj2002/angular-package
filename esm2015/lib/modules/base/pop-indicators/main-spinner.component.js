import { Component, Input } from '@angular/core';
export class MainSpinnerComponent {
    ngOnInit() {
        if (!this.options)
            this.options = {};
        this.color = this.options.color ? this.options.color : 'primary';
        this.mode = this.options.mode ? this.options.mode : 'indeterminate';
        this.diameter = this.options.diameter ? this.options.diameter : 75;
        this.strokeWidth = this.options.strokeWidth ? this.options.strokeWidth : 12;
    }
}
MainSpinnerComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-main-spinner',
                template: "<div class=\"spinner-box\">\n  <mat-progress-spinner [color]=color [mode]=mode [diameter]=diameter [strokeWidth]=strokeWidth [value]=options.value></mat-progress-spinner>\n</div>\n\n",
                styles: [".spinner-box{width:100%;height:100%;display:inline-flex}.mat-progress-spinner{margin:auto;align-self:center}"]
            },] }
];
MainSpinnerComponent.propDecorators = {
    options: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi1zcGlubmVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWluZGljYXRvcnMvbWFpbi1zcGlubmVyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBVSxNQUFNLGVBQWUsQ0FBQztBQVN6RCxNQUFNLE9BQU8sb0JBQW9CO0lBUS9CLFFBQVE7UUFDTixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87WUFBRyxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUN0QyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUM7UUFDcEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNuRSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQzlFLENBQUM7OztZQW5CRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGtCQUFrQjtnQkFDNUIsa01BQTBDOzthQUUzQzs7O3NCQUVFLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE1haW5TcGlubmVyIH0gZnJvbSAnLi9wb3AtaW5kaWNhdG9ycy5tb2RlbCc7XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLW1haW4tc3Bpbm5lcicsXG4gIHRlbXBsYXRlVXJsOiAnbWFpbi1zcGlubmVyLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJ21haW4tc3Bpbm5lci5jb21wb25lbnQuc2NzcyddXG59KVxuZXhwb3J0IGNsYXNzIE1haW5TcGlubmVyQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgQElucHV0KCkgb3B0aW9uczogTWFpblNwaW5uZXI7XG4gIGNvbG9yOiBzdHJpbmc7XG4gIG1vZGU6IHN0cmluZztcbiAgZGlhbWV0ZXI6IG51bWJlcjtcbiAgc3Ryb2tlV2lkdGg6IG51bWJlcjtcblxuXG4gIG5nT25Jbml0KCl7XG4gICAgaWYoICF0aGlzLm9wdGlvbnMgKSB0aGlzLm9wdGlvbnMgPSB7fTtcbiAgICB0aGlzLmNvbG9yID0gdGhpcy5vcHRpb25zLmNvbG9yID8gdGhpcy5vcHRpb25zLmNvbG9yIDogJ3ByaW1hcnknO1xuICAgIHRoaXMubW9kZSA9IHRoaXMub3B0aW9ucy5tb2RlID8gdGhpcy5vcHRpb25zLm1vZGUgOiAnaW5kZXRlcm1pbmF0ZSc7XG4gICAgdGhpcy5kaWFtZXRlciA9IHRoaXMub3B0aW9ucy5kaWFtZXRlciA/IHRoaXMub3B0aW9ucy5kaWFtZXRlciA6IDc1O1xuICAgIHRoaXMuc3Ryb2tlV2lkdGggPSB0aGlzLm9wdGlvbnMuc3Ryb2tlV2lkdGggPyB0aGlzLm9wdGlvbnMuc3Ryb2tlV2lkdGggOiAxMjtcbiAgfVxufVxuIl19