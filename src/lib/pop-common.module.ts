import { ModuleWithProviders, NgModule } from '@angular/core';
import { PhonePipe } from './pipes/phone.pipe';
import { ToYesNoPipe } from './pipes/toYesNo.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { ToActiveOrArchivedPipe } from './pipes/toActiveOrArchived.pipe';
import { PopTemplateModule } from './modules/app/pop-template.module';
import { LabelPipe } from './pipes/label.pipe';
import { LibContainerDirective } from './directives/lib-container.directive';
import { LibOutsideClickDirective } from './directives/lib-outside-click.directive';
import { LibTrackCapsLockDirective } from './directives/lib-track-caps-lock.directive';


@NgModule({
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
})
export class PopCommonModule {
  static forRoot(environment?: any): ModuleWithProviders<PopCommonModule>{
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
