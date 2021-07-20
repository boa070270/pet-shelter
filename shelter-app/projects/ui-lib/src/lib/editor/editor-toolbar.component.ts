// tslint:disable:max-line-length
import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output, ViewContainerRef} from '@angular/core';
import {AbstractComponent} from '../controls';
import {DialogService} from '../dialog-service';
import {PluginsPanelComponent} from './plugins-panel.component';
import {CdkDropList} from '@angular/cdk/drag-drop';
import {Attributes, SwaggerNative, SwaggerObject, swaggerUI, TitleType} from '../shared';

const HREF_ATTRIBUTE = new SwaggerObject(['href'], {href: SwaggerNative.asString('lib-input-control', null,
    swaggerUI([{lang: 'en', title: 'Link'}, {lang: 'uk', title: 'Посилання'}]))});
const TITLE_ATTRIBUTE = new SwaggerObject(['title'], {title: SwaggerNative.asString('lib-input-control', null,
    swaggerUI([{lang: 'en', title: 'Description for the abbreviation'}, {lang: 'uk', title: 'Опис для абревіатури'}]))});
const ID_ATTRIBUTE = new SwaggerObject(['id'], {id: SwaggerNative.asString('lib-input-control', null,
    swaggerUI([{lang: 'en', title: 'ID'}]))});
const CITE_ATTRIBUTE = new SwaggerObject(['cite'], {cite: SwaggerNative.asString('lib-input-control', null,
    swaggerUI([{lang: 'en', title: 'URL that designates a source document or message'}, {lang: 'uk', title: 'URL на первинний документ'}]))});
const VALUE_ATTRIBUTE = new SwaggerObject(['value'], {value: SwaggerNative.asString('lib-input-control', null,
    swaggerUI([{lang: 'en', title: 'Value'}, {lang: 'uk', title: 'Значення'}]))});
const DATETIME_ATTRIBUTE = new SwaggerObject(['datetime'], {datetime: SwaggerNative.asString('lib-input-control', null,
    swaggerUI([{lang: 'en', title: 'Value'}, {lang: 'uk', title: 'Значення'}]))});
export interface SpecialElementSpec { name: string; attr: SwaggerObject; description: TitleType[]; }
export class SpecialElements {
  static elements: Array< SpecialElementSpec > = [
    {name: 'a', attr: HREF_ATTRIBUTE, description: [{lang: 'en', title: 'The Anchor element'}]},
    {name: 'abbr', attr: TITLE_ATTRIBUTE, description: [{lang: 'en', title: 'The Abbreviation element'}]},
    {name: 'data', attr: VALUE_ATTRIBUTE, description: [{lang: 'en', title: 'The machine-readable value'}]},
    {name: 'dfn', attr: ID_ATTRIBUTE, description: [{lang: 'en', title: 'The Definition element'}]},
    {name: 'q', attr: CITE_ATTRIBUTE, description: [{lang: 'en', title: 'The Inline Quotation element'}]},
    {name: 'time', attr: VALUE_ATTRIBUTE, description: [{lang: 'en', title: 'The machine-readable time'}]}
  ];
  static findElement(name: string): SpecialElementSpec {
    return this.elements.find(e => e.name === name);
  }
}

export interface CmdEditorToolbox {
  cmd: string;
  opt?: any;
}
/*
<address>, <article>, <aside>, <footer>, <header>, <h1>-<h6>, <main>, <nav>, <section>
 <abbr>, <cite>, <data>, <datalist>, <dfn>, <embed>, <iframe>, <img>, <input>, <label>, <meter>, <output>, <picture>, <progress>, <q>,
 <ruby>, <span>, <svg>, <time>
 <dl>, <dt>, <dd>,
 <figure>
 */
/* empty
  hr,wbr,
 */

@Component({
  selector: 'lib-editor-toolbar',
  templateUrl: './editor-toolbar.component.html',
  styleUrls: ['./editor-toolbar.component.scss']
})
export class EditorToolbarComponent extends AbstractComponent implements OnDestroy {
  block: string;
  bTag: boolean;
  uTag: boolean;
  iTag: boolean;
  fSize: string;
  alignPressed: number;
  moveByText = true;
  @Input() fCdkDropList: () => CdkDropList;
  private pluginEmitter: EventEmitter<string>;
  @Output() emitter = new EventEmitter<CmdEditorToolbox>();
  constructor(private changeDetector: ChangeDetectorRef, protected _view: ViewContainerRef, private dialogService: DialogService) {
    super(_view); // TODO add i18N
    this.pluginEmitter = new EventEmitter<string>();
    this.pluginEmitter.subscribe((s) => this.emitter.emit({cmd: 'plugin', opt: {name: s}}) );
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.pluginEmitter.complete();
    this.emitter.complete();
  }

  updateToolbar(what: any): void {
    let modified = false;
    if (what) {
      if (this.isModified(what, 'block')) {
        modified = true;
      }
      if (this.isModified(what, 'bTag')) {
        modified = true;
      }
      if (this.isModified(what, 'uTag')) {
        modified = true;
      }
      if (this.isModified(what, 'iTag')) {
        modified = true;
      }
      if (this.isModified(what, 'fSize')) {
        modified = true;
      }
      if (this.isModified(what, 'alignPressed')) {
        modified = true;
      }
      if (this.isModified(what, 'tableControlsHidden')) {
        modified = true;
      }
      if (this.isModified(what, 'borderStyle')) {
        modified = true;
      }
      if (this.isModified(what, 'tblBorderWidth')) {
        modified = true;
      }
    }
    if (modified) {
      this.changeDetector.detectChanges();
    }
  }
  private isModified(what: any, name: string): boolean {
    if (!!what[name] !== this[name]) {
      this[name] = !!what[name];
      return true;
    }
  }
  tag(tag: string, attr?: string[] | Attributes): void { // was without 'string |' and was causing error
    this.emitter.emit({cmd: 'tag', opt: {tag, attr}});
  }

  transformToList(numberList?: boolean): void {
    this.emitter.emit({cmd: 'toList', opt: {numberList}});
  }

  align(align: string): void {
    this.emitter.emit({cmd: 'align', opt: {align}});
  }

  clearFormatting(): void {
    this.emitter.emit({cmd: 'clearFormat'});
  }

  insertTable(cells: number, rows: number): void {
    this.emitter.emit({cmd: 'insTable', opt: {cells, rows}});
  }

  insertPlugin(name?: string): void {
    this.emitter.emit({cmd: 'insPlugin', opt: {name}});
  }

  showDesigner(): void {
    this.emitter.emit({cmd: 'showDesigner'});
  }

  showSource(): void {
    this.emitter.emit({cmd: 'showSource'});
  }

  showHelp(): void {
    this.emitter.emit({cmd: 'showHelp'});
  }

  switchMove(): void {
    this.moveByText = !this.moveByText;
    this.emitter.emit({cmd: 'switchMove', opt: {moveByText: this.moveByText}});
  }

  showPlugins(): void {
    this.dialogService.open(PluginsPanelComponent,
      {data: {emitter: this.pluginEmitter, fCdkDropList: this.fCdkDropList}, hasBackdrop: false});
  }
}
