import { NgModule } from '@angular/core';
import { EditorComponent } from './editor.component';
import {CommonModule} from '@angular/common';
import {EditorPluginComponent} from './editor-plugin.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ControlsModule} from '../controls';
import { EditorToolbarComponent } from './editor-toolbar.component';
import { PluginsPanelComponent } from './plugins-panel.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { DynamicPageDirective } from './dynamic-page.directive';
import {PageSnapshotStorage, PageSnapshotToken} from './editor-store';

@NgModule({
  declarations: [
      EditorComponent,
      EditorPluginComponent,
      EditorToolbarComponent,
      PluginsPanelComponent,
      DynamicPageDirective,
  ],
  imports: [
      CommonModule,
      ReactiveFormsModule,
      FormsModule,
      ControlsModule,
      DragDropModule,
  ],
  exports: [
    EditorComponent,
    EditorToolbarComponent,
    PluginsPanelComponent,
    DynamicPageDirective,
  ],
  providers: [
    {provide: PageSnapshotToken, useClass: PageSnapshotStorage}
  ]
})
export class WysiwygModule { }
