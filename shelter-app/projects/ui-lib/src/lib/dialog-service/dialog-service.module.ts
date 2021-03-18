import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {A11yModule} from '@angular/cdk/a11y';
import {CdkDialogContainer} from './dialog-container';
import {DialogConfig} from './dialog-config';
import {DialogRef} from './dialog-ref';
import {
  DIALOG_CONFIG,
  DIALOG_CONTAINER,
  DIALOG_REF,
  MAT_DIALOG_SCROLL_STRATEGY_PROVIDER
} from './dialog-injectors';
import {ComponentsPluginService} from '../shared';
@NgModule({
  declarations: [
    CdkDialogContainer,
  ],
  imports: [
    CommonModule,
    OverlayModule,
    PortalModule,
    A11yModule
  ],
  exports: [
    // Re-export the PortalModule so that people extending the `CdkDialogContainer`
    // don't have to remember to import it or be faced with an unhelpful error.
    CdkDialogContainer,
    PortalModule,
    OverlayModule,
  ],
  providers: [
    MAT_DIALOG_SCROLL_STRATEGY_PROVIDER,
    {provide: DIALOG_CONTAINER, useValue: CdkDialogContainer},
    {provide: DIALOG_CONFIG, useValue: DialogConfig},
    {provide: DIALOG_REF, useValue: DialogRef}
  ],
  entryComponents: [CdkDialogContainer],
})
export class DialogServiceModule {
}
