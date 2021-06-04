import {ComponentFactoryResolver, Injector, NgModule, Optional, SkipSelf} from '@angular/core';
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
} from './content-display/card.component';
import {CardActionsComponent} from './content-display/card-actions.component';
import {PluginComponent} from './plugin.component';
import {TabDirective, TabGroupComponent} from './content-display/tab-group.component';
import {AccordionComponent, AccordionDirective, AccordionPanelComponent} from './content-display/accordion.component';
import {SwitchPageDataDirective} from './switch-page-data.directive';
import {SpanComponent} from './content-display/span.component';
import {UiForOfDirective} from './ui-for-of.directive';
import {AbstractIteratorComponent, IteratorDirective} from './abstract-iterator.component';
import {ShowMediaValueComponent} from './media/show-media-value.component';
import {ShowValueComponent} from './media/show-value.component';
import {EndPageComponent} from './end-page.component';
import {IsVisibleDirective} from './is-visible.directive';
import {MasonryListComponent} from './content-display/masonry-list.component';
import {AdvertComponent} from './content-display/advert.component';
import {ExtComponentFactory} from "./ext-component-factory";

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
    SwitchPageDataDirective,
    SpanComponent,
    UiForOfDirective,
    AbstractIteratorComponent,
    IteratorDirective,
    AccordionDirective,
    AccordionPanelComponent,
    ShowMediaValueComponent,
    ShowValueComponent,
    EndPageComponent,
    IsVisibleDirective,
    MasonryListComponent,
    AdvertComponent,
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
    SwitchPageDataDirective,
    SpanComponent,
    UiForOfDirective,
    AbstractIteratorComponent,
    IteratorDirective,
    AccordionDirective,
    AccordionPanelComponent,
    ShowMediaValueComponent,
    ShowValueComponent,
    EndPageComponent,
    IsVisibleDirective,
    MasonryListComponent,
    AdvertComponent,
  ]
})
export class ControlsModule {
  constructor(componentsPlugin: ComponentsPluginService, @Optional() @SkipSelf() parentModule: ControlsModule, injector: Injector) {
    if (parentModule) {
      // throw new Error('ControlsModule is already loaded');
      return;
    }
    const replaceInjector = Injector.create({parent: injector, providers: [
      {provide: ComponentFactoryResolver, useValue: new ExtComponentFactory(injector)}
    ]});

    componentsPlugin.addPlugin(['lib-boolean-control'], {component: BooleanControlComponent, schema: null,
      customElement: {selectorName: 'ui-boolean', injector}});
    componentsPlugin.addPlugin(['lib-checkbox-control'],
      {
        component: CheckboxControlComponent,
        schema: new SwaggerObject([], {value: SwaggerNative.asString()}),
        customElement: {selectorName: 'ui-checkbox', injector}
      });
    componentsPlugin.addPlugin(['lib-checkbox'], {component: CheckboxControlComponent, schema: null});
    componentsPlugin.addPlugin(['lib-input-control'], {component: InputControlComponent, schema: null,
      customElement: {selectorName: 'ui-input', injector}});
    componentsPlugin.addPlugin(['lib-list-builder'], {component: ListBuilderComponent, schema: null});
    componentsPlugin.addPlugin(['lib-list-select'], {component: ListSelectComponent, schema: null});
    componentsPlugin.addPlugin(['lib-radio-control'], {component: RadioControlComponent, schema: null,
      customElement: {selectorName: 'ui-radio', injector}});
    componentsPlugin.addPlugin(['lib-select-control'], {component: SelectControlComponent, schema: null,
      customElement: {selectorName: 'ui-select', injector}});
    componentsPlugin.addPlugin(['lib-title-type-control'], {component: TitleTypeControlComponent, schema: null,
      customElement: {selectorName: 'ui-title-type', injector}});
    componentsPlugin.addPlugin(['lib-table'], {component: TableComponent, schema: null,
      customElement: {selectorName: 'ui-table', injector}});
    componentsPlugin.addPlugin(['lib-upload-files'], {component: UploadFilesComponent, schema: null});
    componentsPlugin.addPlugin(['lib-simple-dialog'], {component: SimpleDialogComponent, schema: null});
    componentsPlugin.addPlugin(['lib-snake-bar'], {component: SnakeBarComponent, schema: null});
    componentsPlugin.addPlugin(['lib-app-bar'], {component: AppBarComponent, schema: null,
      customElement: {selectorName: 'app-bar', injector}});
    componentsPlugin.addPlugin(['lib-editable-list'], {component: EditableListComponent, schema: null});

    componentsPlugin.addPlugin([], {component: SwaggerFormComponent,
      customElement: {selectorName: 'ui-swagger-form', injector}});
    componentsPlugin.addPlugin([], {component: GeneratorFormComponent,
      customElement: {selectorName: 'ui-generator-form', injector}});
    componentsPlugin.addPlugin([], {component: SwaggerArrayComponent,
      customElement: {selectorName: 'ui-swagger-array', injector}});
    componentsPlugin.addPlugin([], {component: SwaggerNativeComponent,
      customElement: {selectorName: 'ui-swagger-native', injector}});
    componentsPlugin.addPlugin([], {component: LinkComponent,
      customElement: {selectorName: 'ui-link', injector}});
    componentsPlugin.addPlugin([], {component: CardComponent,
      customElement: {selectorName: 'ui-card', injector}});
    componentsPlugin.addPlugin([], {component: TabGroupComponent,
      customElement: {selectorName: 'ui-tab-group', injector: replaceInjector}});
    componentsPlugin.addPlugin([], {component: AccordionComponent,
      customElement: {selectorName: 'ui-accordion', injector: replaceInjector}});
    componentsPlugin.addPlugin([], {component: CarouselComponent,
      customElement: {selectorName: 'ui-carousel', injector: replaceInjector}});
    componentsPlugin.addPlugin([], {component: SpanComponent,
      customElement: {selectorName: 'ui-span', injector}});
  }
}
