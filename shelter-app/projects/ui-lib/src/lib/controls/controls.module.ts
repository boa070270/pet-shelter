import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CheckboxControlComponent} from './checkbox-control.component';
import {RadioControlComponent} from './radio-control.component';
import {BaseComponent} from './base.component';
import {InputControlComponent} from './input-control.component';
import {SelectControlComponent} from './select-control.component';
import {BooleanControlComponent} from './boolean-control.component';
import {ComponentsPluginService, SwaggerNative, SwaggerObject} from '../shared';
import {TitleTypeControlComponent} from './title-type-control.component';
import {TableComponent} from './table/table.component';
import {CdkTableModule} from '@angular/cdk/table';
import {ListBuilderComponent} from './list-builder.component';
import {ListSelectComponent} from './list-select.component';
import {BidiModule} from '@angular/cdk/bidi';
import {ChoiceFormatPipe} from './choice-format.pipe';
import {UploadFilesComponent} from './upload-files.component';
import {TextareaControlComponent} from './textarea-control.component';
import {AbstractComponent} from './abstract.component';
import {ToolbarComponent} from './toolbar.component';
import {NavbarComponent} from './navbar.component';
import {RouterModule} from '@angular/router';
import {MenuComponent} from './menu/menu.component';
import {SpinnerComponent} from './spinner.component';
import {SimpleDialogComponent} from './dialogs/simple-dialog.component';
import {SnakeBarComponent} from './dialogs/snake-bar.component';
import {CommentComponent, DiscussionComponent, VoteComponent} from './survey';
import {LinkComponent} from './link.component';
import {
  GeneratorFormComponent,
  SwaggerArrayComponent,
  SwaggerFormComponent,
  SwaggerNativeComponent
} from './swagger-form';
import {PortalModule} from '@angular/cdk/portal';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {UiMenuDirective} from './menu/ui-menu.directive';
import {MenuBarComponent} from './menu/menu-bar.component';
import {EditableListComponent} from './editable-list.component';
import {SwaggerBuilderComponent} from './swagger-builder.component';
import {AppBarComponent} from './app-bar.component';
import {CarouselComponent, SlideContainerComponent, SlideContainerDirective, SlideElementDirective} from './slider';
import {
  CardComponent,
  CardContentDirective,
  CardFooterDirective,
  CardHeaderComponent,
  CardImageDirective,
  CardSubtitleDirective,
  CardTitleDirective
} from './card/card.component';
import {CardActionsComponent} from './card/card-actions.component';
import {PluginComponent} from './plugin.component';
import {TabDirective, TabGroupComponent} from './content-display/tab-group.component';
import {AccordionComponent} from './content-display/accordion.component';
import {SwitchPageDataComponent} from './switch-page-data.component';
import {SpanComponent} from './content-display/span.component';
import {UiForOfDirective} from './ui-for-of.directive';
import {AbstractIteratorComponent} from './abstract-iterator.component';

@NgModule({
  declarations: [
    CheckboxControlComponent,
    RadioControlComponent,
    BaseComponent,
    InputControlComponent,
    SelectControlComponent,
    BooleanControlComponent,
    TitleTypeControlComponent,
    TableComponent,
    ListBuilderComponent,
    ListSelectComponent,
    ChoiceFormatPipe,
    UploadFilesComponent,
    TextareaControlComponent,
    AbstractComponent,
    ToolbarComponent,
    NavbarComponent,
    MenuComponent,
    SpinnerComponent,
    CarouselComponent,
    LinkComponent,
    SimpleDialogComponent, SnakeBarComponent,
    GeneratorFormComponent, SwaggerArrayComponent, SwaggerFormComponent, SwaggerNativeComponent,
    CommentComponent, VoteComponent, DiscussionComponent, UiMenuDirective, MenuBarComponent,
    EditableListComponent,
    SwaggerBuilderComponent,
    AppBarComponent,
    SlideContainerDirective,
    SlideContainerComponent,
    SlideElementDirective,
    CardComponent,
    CardHeaderComponent,
    CardTitleDirective,
    CardSubtitleDirective,
    CardContentDirective,
    CardActionsComponent,
    CardFooterDirective,
    CardImageDirective,
    PluginComponent,
    TabDirective, TabGroupComponent,
    AccordionComponent,
    SwitchPageDataComponent,
    SpanComponent,
    UiForOfDirective,
    AbstractIteratorComponent
  ],
    imports: [
        CommonModule,
        FormsModule,
        CdkTableModule,
        BidiModule,
        RouterModule,
        PortalModule,
        ReactiveFormsModule,
        ScrollingModule,
    ],
  exports: [
    PortalModule,
    CheckboxControlComponent,
    RadioControlComponent,
    InputControlComponent,
    SelectControlComponent,
    BooleanControlComponent,
    ListBuilderComponent,
    ListSelectComponent,
    TitleTypeControlComponent,
    TableComponent,
    UploadFilesComponent,
    TextareaControlComponent,
    AbstractComponent,
    ToolbarComponent,
    NavbarComponent,
    MenuComponent,
    SpinnerComponent,
    CarouselComponent,
    LinkComponent,
    SimpleDialogComponent, SnakeBarComponent,
    GeneratorFormComponent, SwaggerArrayComponent, SwaggerFormComponent, SwaggerNativeComponent,
    CommentComponent, VoteComponent, DiscussionComponent, UiMenuDirective, MenuBarComponent,
    EditableListComponent,
    SwaggerBuilderComponent,
    AppBarComponent,
    SlideContainerDirective,
    SlideContainerComponent,
    SlideElementDirective,
    CardComponent,
    CardHeaderComponent,
    CardTitleDirective,
    CardSubtitleDirective,
    CardContentDirective,
    CardActionsComponent,
    CardFooterDirective,
    CardImageDirective,
    PluginComponent,
    TabDirective, TabGroupComponent,
    AccordionComponent,
    SwitchPageDataComponent,
    SpanComponent,
    UiForOfDirective,
    AbstractIteratorComponent
  ]
})
export class ControlsModule {
  constructor(componentsPlugin: ComponentsPluginService) {
    componentsPlugin.addPlugin('lib-boolean-control', {component: BooleanControlComponent, schema: null});
    componentsPlugin.addPlugin('boolean', {component: BooleanControlComponent, schema: null});
    componentsPlugin.addPlugin('lib-checkbox-control',
      {
        component: CheckboxControlComponent,
        schema: new SwaggerObject([], {value: SwaggerNative.asString()})
      });
    componentsPlugin.addPlugin('checkbox', {component: CheckboxControlComponent, schema: null});
    componentsPlugin.addPlugin('lib-input-control', {component: InputControlComponent, schema: null});
    componentsPlugin.addPlugin('input', {component: InputControlComponent, schema: null});
    componentsPlugin.addPlugin('lib-list-builder', {component: ListBuilderComponent, schema: null});
    componentsPlugin.addPlugin('list-builder', {component: ListBuilderComponent, schema: null});
    componentsPlugin.addPlugin('lib-list-select', {component: ListSelectComponent, schema: null});
    componentsPlugin.addPlugin('list-select', {component: ListSelectComponent, schema: null});
    componentsPlugin.addPlugin('lib-radio-control', {component: RadioControlComponent, schema: null});
    componentsPlugin.addPlugin('radio', {component: RadioControlComponent, schema: null});
    componentsPlugin.addPlugin('lib-select-control', {component: SelectControlComponent, schema: null});
    componentsPlugin.addPlugin('select', {component: SelectControlComponent, schema: null});
    componentsPlugin.addPlugin('lib-title-type-control', {component: TitleTypeControlComponent, schema: null});
    componentsPlugin.addPlugin('title-type', {component: TitleTypeControlComponent, schema: null});
    componentsPlugin.addPlugin('lib-table', {component: TableComponent, schema: null});
    componentsPlugin.addPlugin('lib-upload-files', {component: UploadFilesComponent, schema: null});
    componentsPlugin.addPlugin('simple-dialog', {component: SimpleDialogComponent, schema: null});
    componentsPlugin.addPlugin('snake-bar', {component: SnakeBarComponent, schema: null});
    componentsPlugin.addPlugin('app-bar', {component: AppBarComponent, schema: null});
    componentsPlugin.addPlugin('editable-list', {component: EditableListComponent, schema: null});
  }
}
