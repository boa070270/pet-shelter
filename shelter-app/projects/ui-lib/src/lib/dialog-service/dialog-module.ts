/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
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
import {DragDropModule} from "@angular/cdk/drag-drop";
import {CommonModule} from "@angular/common";


@NgModule({
  imports: [
    OverlayModule,
    PortalModule,
    A11yModule,
    DragDropModule,
    CommonModule,
  ],
  exports: [
    // Re-export the PortalModule so that people extending the `CdkDialogContainer`
    // don't have to remember to import it or be faced with an unhelpful error.
    PortalModule,
    CdkDialogContainer,
  ],
  declarations: [
    CdkDialogContainer,
  ],
  providers: [
    MAT_DIALOG_SCROLL_STRATEGY_PROVIDER,
    {provide: DIALOG_REF, useValue: DialogRef},
    {provide: DIALOG_CONTAINER, useValue: CdkDialogContainer},
    {provide: DIALOG_CONFIG, useValue: DialogConfig},
  ],
  entryComponents: [CdkDialogContainer],
})
export class DialogModule {}
