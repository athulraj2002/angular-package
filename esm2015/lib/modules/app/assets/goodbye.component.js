import { Component } from '@angular/core';
import { ServiceInjector } from '../../../pop-common.model';
import { PopBaseService } from '../../../services/pop-base.service';
import { RandomArrayElement } from '../../../pop-common-utility';
export class PopTemplateGoodByeComponent {
    constructor() {
        const name = ServiceInjector.get(PopBaseService).getAuthPrimeUser().first_name;
        const greetings = [
            `Audios Amigo`,
            `See Ya Later, ${name}`,
            `Hasta la vista`,
            `Later Hater`,
            `Done so soon?`,
            `GoodBye`,
            `Thanks for all you have done, ${name}`
        ];
        this.expression = RandomArrayElement(greetings);
    }
}
PopTemplateGoodByeComponent.decorators = [
    { type: Component, args: [{
                template: `
    <div class="pop-template-goodbye">
      <div class="pop-template-goodbye-row">
        <h4>{{expression}}</h4>
      </div>
    </div>
  `,
                styles: [`
    .pop-template-goodbye {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 30px;
      justify-content: center;
      align-items: center;
      font-size: 1.5em;
    }

    .pop-template-goodbye-row {
      display: flex;
      width: 100%;
      min-height: 30px;
      justify-content: center;
      align-items: center;
      clear: both;
    }
  `]
            },] }
];
PopTemplateGoodByeComponent.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29vZGJ5ZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9hcHAvYXNzZXRzL2dvb2RieWUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQVUsTUFBTSxlQUFlLENBQUM7QUFDbEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzVELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUNwRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQWdDakUsTUFBTSxPQUFPLDJCQUEyQjtJQUt0QztRQUNFLE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxVQUFVLENBQUM7UUFDL0UsTUFBTSxTQUFTLEdBQUc7WUFDaEIsY0FBYztZQUNkLGlCQUFpQixJQUFJLEVBQUU7WUFDdkIsZ0JBQWdCO1lBQ2hCLGFBQWE7WUFDYixlQUFlO1lBQ2YsU0FBUztZQUNULGlDQUFpQyxJQUFJLEVBQUU7U0FDeEMsQ0FBQztRQUNGLElBQUksQ0FBQyxVQUFVLEdBQUcsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFbEQsQ0FBQzs7O1lBL0NGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUU7Ozs7OztHQU1UO3lCQUNTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJUO2FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU2VydmljZUluamVjdG9yIH0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBQb3BCYXNlU2VydmljZSB9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1iYXNlLnNlcnZpY2UnO1xuaW1wb3J0IHsgUmFuZG9tQXJyYXlFbGVtZW50IH0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcblxuXG5AQ29tcG9uZW50KHtcbiAgdGVtcGxhdGU6IGBcbiAgICA8ZGl2IGNsYXNzPVwicG9wLXRlbXBsYXRlLWdvb2RieWVcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJwb3AtdGVtcGxhdGUtZ29vZGJ5ZS1yb3dcIj5cbiAgICAgICAgPGg0Pnt7ZXhwcmVzc2lvbn19PC9oND5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgLFxuICBzdHlsZXM6IFsgYFxuICAgIC5wb3AtdGVtcGxhdGUtZ29vZGJ5ZSB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgbWluLWhlaWdodDogMzBweDtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGZvbnQtc2l6ZTogMS41ZW07XG4gICAgfVxuXG4gICAgLnBvcC10ZW1wbGF0ZS1nb29kYnllLXJvdyB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICBtaW4taGVpZ2h0OiAzMHB4O1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgY2xlYXI6IGJvdGg7XG4gICAgfVxuICBgIF1cbn0pXG5leHBvcnQgY2xhc3MgUG9wVGVtcGxhdGVHb29kQnllQ29tcG9uZW50IHtcblxuICBleHByZXNzaW9uO1xuXG5cbiAgY29uc3RydWN0b3IoKXtcbiAgICBjb25zdCBuYW1lID0gU2VydmljZUluamVjdG9yLmdldChQb3BCYXNlU2VydmljZSkuZ2V0QXV0aFByaW1lVXNlcigpLmZpcnN0X25hbWU7XG4gICAgY29uc3QgZ3JlZXRpbmdzID0gW1xuICAgICAgYEF1ZGlvcyBBbWlnb2AsXG4gICAgICBgU2VlIFlhIExhdGVyLCAke25hbWV9YCxcbiAgICAgIGBIYXN0YSBsYSB2aXN0YWAsXG4gICAgICBgTGF0ZXIgSGF0ZXJgLFxuICAgICAgYERvbmUgc28gc29vbj9gLFxuICAgICAgYEdvb2RCeWVgLFxuICAgICAgYFRoYW5rcyBmb3IgYWxsIHlvdSBoYXZlIGRvbmUsICR7bmFtZX1gXG4gICAgXTtcbiAgICB0aGlzLmV4cHJlc3Npb24gPSBSYW5kb21BcnJheUVsZW1lbnQoZ3JlZXRpbmdzKTtcblxuICB9XG59XG4iXX0=