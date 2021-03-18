import {NgModule} from '@angular/core';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UiLibComponent} from './ui-lib.component';
import {ShowMediaValueComponent} from './show-media-value.component';
import {ShowValueComponent} from './show-value.component';
import {EndPageComponent} from './end-page.component';
import {IsVisibleDirective} from './is-visible.directive';
import {ImageListComponent} from './image-list.component';
import {PlainHtmlPipe} from './plain-html.pipe';
import {MasonryListComponent} from './masonry-list.component';
import {AdvertComponent} from './advert.component';
import {CdkTableModule} from '@angular/cdk/table';

@NgModule({
  declarations: [
    UiLibComponent,
    ShowMediaValueComponent,
    ShowValueComponent,
    EndPageComponent,
    IsVisibleDirective,
    ImageListComponent,
    PlainHtmlPipe,
    MasonryListComponent,
    AdvertComponent,
  ],
  imports: [
    DragDropModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CdkTableModule,
  ],
  exports: [
    UiLibComponent,
    ShowMediaValueComponent,
    ShowValueComponent,
    EndPageComponent,
    IsVisibleDirective,
    ImageListComponent,
    PlainHtmlPipe,
    MasonryListComponent,
    AdvertComponent,
  ]
})
export class UiLibModule {}
