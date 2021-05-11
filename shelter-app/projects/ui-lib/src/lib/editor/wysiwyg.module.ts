import { NgModule } from '@angular/core';
import { EditorComponent } from './editor.component';
import {CommonModule} from '@angular/common';
import {EditorPluginComponent} from './editor-plugin.component';
import {DynamicHTMLModule} from './dynamic-html';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ControlsModule} from '../controls';
import { EditorToolbarComponent } from './editor-toolbar.component';
import { PluginsPanelComponent } from './plugins-panel.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { ExtCdkDragDirective, WhateverComponent } from './ext-cdk-drag.directive';

@NgModule({
  declarations: [
      EditorComponent,
      EditorPluginComponent,
      EditorToolbarComponent,
      PluginsPanelComponent,
      ExtCdkDragDirective,
      WhateverComponent
  ],
    imports: [
        CommonModule,
        DynamicHTMLModule.forRoot({
            components: [
                {component: EditorPluginComponent, selector: 'editor-plugin'}
            ]
        }),
        ReactiveFormsModule,
        FormsModule,
        ControlsModule,
        DragDropModule,
    ],
  exports: [
    EditorComponent,
    EditorToolbarComponent,
    PluginsPanelComponent,
    ExtCdkDragDirective,
    WhateverComponent
  ]
})
export class WysiwygModule { }
