import { Component } from '@angular/core';
import { ServiceInjector } from '../../../pop-common.model';
import { PopBaseService } from '../../../services/pop-base.service';
import { RandomArrayElement } from '../../../pop-common-utility';
export class PopTemplateWelcomeComponent {
    constructor() {
        const name = ServiceInjector.get(PopBaseService).getAuthPrimeUser().first_name;
        const greetings = [
            `Hola!`,
            `Welcome Back, ${name}`,
            `Howd, partner`,
            `Good to see you, ${name}`,
            `Hello, ${name}`,
            `Lets do this!`,
            `Alright, Alright, Alright ...`
        ];
        this.expression = RandomArrayElement(greetings);
    }
}
PopTemplateWelcomeComponent.decorators = [
    { type: Component, args: [{
                template: `
    <div class="pop-template-welcome">
      <div class="pop-template-welcome-row">
        <h4>{{expression}}</h4>
      </div>
    </div>
  `,
                styles: [`
    .pop-template-welcome {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 30px;
      justify-content: center;
      align-items: center;
      font-size: 1.5em;
      background: var(--background-2);
    }

    .pop-template-welcome-row {
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
PopTemplateWelcomeComponent.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VsY29tZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9hcHAvYXNzZXRzL3dlbGNvbWUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzVELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUNwRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQWlDakUsTUFBTSxPQUFPLDJCQUEyQjtJQUl0QztRQUNFLE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxVQUFVLENBQUM7UUFDL0UsTUFBTSxTQUFTLEdBQUc7WUFDaEIsT0FBTztZQUNQLGlCQUFpQixJQUFJLEVBQUU7WUFDdkIsZUFBZTtZQUNmLG9CQUFvQixJQUFJLEVBQUU7WUFDMUIsVUFBVSxJQUFJLEVBQUU7WUFDaEIsZUFBZTtZQUNmLCtCQUErQjtTQUNoQyxDQUFDO1FBQ0YsSUFBSSxDQUFDLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUVsRCxDQUFDOzs7WUEvQ0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRTs7Ozs7O0dBTVQ7eUJBQ1M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0JUO2FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU2VydmljZUluamVjdG9yIH0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBQb3BCYXNlU2VydmljZSB9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1iYXNlLnNlcnZpY2UnO1xuaW1wb3J0IHsgUmFuZG9tQXJyYXlFbGVtZW50IH0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcblxuXG5AQ29tcG9uZW50KHtcbiAgdGVtcGxhdGU6IGBcbiAgICA8ZGl2IGNsYXNzPVwicG9wLXRlbXBsYXRlLXdlbGNvbWVcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJwb3AtdGVtcGxhdGUtd2VsY29tZS1yb3dcIj5cbiAgICAgICAgPGg0Pnt7ZXhwcmVzc2lvbn19PC9oND5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgLFxuICBzdHlsZXM6IFsgYFxuICAgIC5wb3AtdGVtcGxhdGUtd2VsY29tZSB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgbWluLWhlaWdodDogMzBweDtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGZvbnQtc2l6ZTogMS41ZW07XG4gICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLTIpO1xuICAgIH1cblxuICAgIC5wb3AtdGVtcGxhdGUtd2VsY29tZS1yb3cge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgbWluLWhlaWdodDogMzBweDtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGNsZWFyOiBib3RoO1xuICAgIH1cbiAgYCBdXG59KVxuZXhwb3J0IGNsYXNzIFBvcFRlbXBsYXRlV2VsY29tZUNvbXBvbmVudCB7XG4gIGV4cHJlc3Npb247XG5cblxuICBjb25zdHJ1Y3Rvcigpe1xuICAgIGNvbnN0IG5hbWUgPSBTZXJ2aWNlSW5qZWN0b3IuZ2V0KFBvcEJhc2VTZXJ2aWNlKS5nZXRBdXRoUHJpbWVVc2VyKCkuZmlyc3RfbmFtZTtcbiAgICBjb25zdCBncmVldGluZ3MgPSBbXG4gICAgICBgSG9sYSFgLFxuICAgICAgYFdlbGNvbWUgQmFjaywgJHtuYW1lfWAsXG4gICAgICBgSG93ZCwgcGFydG5lcmAsXG4gICAgICBgR29vZCB0byBzZWUgeW91LCAke25hbWV9YCxcbiAgICAgIGBIZWxsbywgJHtuYW1lfWAsXG4gICAgICBgTGV0cyBkbyB0aGlzIWAsXG4gICAgICBgQWxyaWdodCwgQWxyaWdodCwgQWxyaWdodCAuLi5gXG4gICAgXTtcbiAgICB0aGlzLmV4cHJlc3Npb24gPSBSYW5kb21BcnJheUVsZW1lbnQoZ3JlZXRpbmdzKTtcblxuICB9XG59XG4iXX0=