import {ANALYZE_FOR_ENTRY_COMPONENTS, ModuleWithProviders, NgModule} from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {MatListModule} from '@angular/material/list';
import { UiLibComponent } from './ui-lib.component';
import { ColumnEditorComponent } from './column-editor.component';
import { YesNoDialogComponent } from './yes-no-dialog.component';
import { ShowMediaDialogComponent } from './show-media-dialog.component';
import { ShowMediaValueComponent } from './show-media-value.component';
import { ShowValueComponent } from './show-value.component';
import { EditTableComponent } from './edit-table.component';
import { CarouselComponent } from './carousel.component';
import { LinkComponent } from './link.component';
import { EndPageComponent } from './end-page.component';
import { IsVisibleDirective } from './is-visible.directive';
import { ImageListComponent } from './image-list.component';
import { PlainHtmlPipe } from './plain-html.pipe';
import { MasonryListComponent } from './masonry-list.component';
import { AdvertComponent } from './advert.component';

@NgModule({
  declarations: [
    UiLibComponent,
    ColumnEditorComponent,
    YesNoDialogComponent,
    ShowMediaDialogComponent,
    ShowMediaValueComponent,
    ShowValueComponent,
    EditTableComponent,
    CarouselComponent,
    LinkComponent,
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
    MatDialogModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatListModule,
    FormsModule,
  ],
  exports: [
    UiLibComponent,
    ColumnEditorComponent,
    YesNoDialogComponent,
    ShowMediaDialogComponent,
    ShowMediaValueComponent,
    ShowValueComponent,
    EditTableComponent,
    CarouselComponent,
    LinkComponent,
    EndPageComponent,
    IsVisibleDirective,
    ImageListComponent,
    PlainHtmlPipe,
    MasonryListComponent,
    AdvertComponent,
  ]
})
export class UiLibModule {}
