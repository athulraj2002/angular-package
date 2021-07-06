import { NgModule } from '@angular/core';
import { PhonePipe } from './pipes/phone.pipe';
import { ToYesNoPipe } from './pipes/toYesNo.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { ToActiveOrArchivedPipe } from './pipes/toActiveOrArchived.pipe';
import { PopTemplateModule } from './modules/app/pop-template.module';
import { LabelPipe } from './pipes/label.pipe';
import { LibContainerDirective } from './directives/lib-container.directive';
import { LibOutsideClickDirective } from './directives/lib-outside-click.directive';
import { LibTrackCapsLockDirective } from './directives/lib-track-caps-lock.directive';
export class PopCommonModule {
    static forRoot(environment) {
        return {
            ngModule: PopCommonModule,
            providers: [
                {
                    provide: 'env',
                    useValue: environment
                },
            ]
        };
    }
}
PopCommonModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    PopTemplateModule
                ],
                declarations: [
                    LabelPipe,
                    PhonePipe,
                    ToYesNoPipe,
                    ToActiveOrArchivedPipe,
                    TruncatePipe,
                    LibOutsideClickDirective,
                    LibContainerDirective,
                    LibTrackCapsLockDirective,
                ],
                exports: [
                    PopTemplateModule,
                    LabelPipe,
                    PhonePipe,
                    ToYesNoPipe,
                    ToActiveOrArchivedPipe,
                    TruncatePipe,
                    LibOutsideClickDirective,
                    LibContainerDirective,
                    LibTrackCapsLockDirective,
                ],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWNvbW1vbi5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvcG9wLWNvbW1vbi5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUF1QixRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDOUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDekUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDdEUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQzdFLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBQ3BGLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBNkJ2RixNQUFNLE9BQU8sZUFBZTtJQUMxQixNQUFNLENBQUMsT0FBTyxDQUFDLFdBQWlCO1FBQzlCLE9BQU87WUFDTCxRQUFRLEVBQUUsZUFBZTtZQUN6QixTQUFTLEVBQUU7Z0JBQ1Q7b0JBQ0UsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsUUFBUSxFQUFFLFdBQVc7aUJBQ3RCO2FBQ0Y7U0FDRixDQUFDO0lBQ0osQ0FBQzs7O1lBckNGLFFBQVEsU0FBQztnQkFDUixPQUFPLEVBQUU7b0JBQ1AsaUJBQWlCO2lCQUNsQjtnQkFDRCxZQUFZLEVBQUU7b0JBQ1osU0FBUztvQkFDVCxTQUFTO29CQUNULFdBQVc7b0JBQ1gsc0JBQXNCO29CQUN0QixZQUFZO29CQUNaLHdCQUF3QjtvQkFDeEIscUJBQXFCO29CQUNyQix5QkFBeUI7aUJBQzFCO2dCQUNELE9BQU8sRUFBRTtvQkFDUCxpQkFBaUI7b0JBQ2pCLFNBQVM7b0JBQ1QsU0FBUztvQkFDVCxXQUFXO29CQUNYLHNCQUFzQjtvQkFDdEIsWUFBWTtvQkFDWix3QkFBd0I7b0JBQ3hCLHFCQUFxQjtvQkFDckIseUJBQXlCO2lCQUMxQjthQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFBob25lUGlwZSB9IGZyb20gJy4vcGlwZXMvcGhvbmUucGlwZSc7XG5pbXBvcnQgeyBUb1llc05vUGlwZSB9IGZyb20gJy4vcGlwZXMvdG9ZZXNOby5waXBlJztcbmltcG9ydCB7IFRydW5jYXRlUGlwZSB9IGZyb20gJy4vcGlwZXMvdHJ1bmNhdGUucGlwZSc7XG5pbXBvcnQgeyBUb0FjdGl2ZU9yQXJjaGl2ZWRQaXBlIH0gZnJvbSAnLi9waXBlcy90b0FjdGl2ZU9yQXJjaGl2ZWQucGlwZSc7XG5pbXBvcnQgeyBQb3BUZW1wbGF0ZU1vZHVsZSB9IGZyb20gJy4vbW9kdWxlcy9hcHAvcG9wLXRlbXBsYXRlLm1vZHVsZSc7XG5pbXBvcnQgeyBMYWJlbFBpcGUgfSBmcm9tICcuL3BpcGVzL2xhYmVsLnBpcGUnO1xuaW1wb3J0IHsgTGliQ29udGFpbmVyRGlyZWN0aXZlIH0gZnJvbSAnLi9kaXJlY3RpdmVzL2xpYi1jb250YWluZXIuZGlyZWN0aXZlJztcbmltcG9ydCB7IExpYk91dHNpZGVDbGlja0RpcmVjdGl2ZSB9IGZyb20gJy4vZGlyZWN0aXZlcy9saWItb3V0c2lkZS1jbGljay5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgTGliVHJhY2tDYXBzTG9ja0RpcmVjdGl2ZSB9IGZyb20gJy4vZGlyZWN0aXZlcy9saWItdHJhY2stY2Fwcy1sb2NrLmRpcmVjdGl2ZSc7XG5cblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIFBvcFRlbXBsYXRlTW9kdWxlXG4gIF0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIExhYmVsUGlwZSxcbiAgICBQaG9uZVBpcGUsXG4gICAgVG9ZZXNOb1BpcGUsXG4gICAgVG9BY3RpdmVPckFyY2hpdmVkUGlwZSxcbiAgICBUcnVuY2F0ZVBpcGUsXG4gICAgTGliT3V0c2lkZUNsaWNrRGlyZWN0aXZlLFxuICAgIExpYkNvbnRhaW5lckRpcmVjdGl2ZSxcbiAgICBMaWJUcmFja0NhcHNMb2NrRGlyZWN0aXZlLFxuICBdLFxuICBleHBvcnRzOiBbXG4gICAgUG9wVGVtcGxhdGVNb2R1bGUsXG4gICAgTGFiZWxQaXBlLFxuICAgIFBob25lUGlwZSxcbiAgICBUb1llc05vUGlwZSxcbiAgICBUb0FjdGl2ZU9yQXJjaGl2ZWRQaXBlLFxuICAgIFRydW5jYXRlUGlwZSxcbiAgICBMaWJPdXRzaWRlQ2xpY2tEaXJlY3RpdmUsXG4gICAgTGliQ29udGFpbmVyRGlyZWN0aXZlLFxuICAgIExpYlRyYWNrQ2Fwc0xvY2tEaXJlY3RpdmUsXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIFBvcENvbW1vbk1vZHVsZSB7XG4gIHN0YXRpYyBmb3JSb290KGVudmlyb25tZW50PzogYW55KTogTW9kdWxlV2l0aFByb3ZpZGVyczxQb3BDb21tb25Nb2R1bGU+e1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogUG9wQ29tbW9uTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiAnZW52JyxcbiAgICAgICAgICB1c2VWYWx1ZTogZW52aXJvbm1lbnRcbiAgICAgICAgfSxcbiAgICAgIF1cbiAgICB9O1xuICB9XG59XG4iXX0=