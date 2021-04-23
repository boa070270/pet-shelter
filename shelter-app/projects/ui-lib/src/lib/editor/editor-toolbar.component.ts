import {ChangeDetectorRef, Component, EventEmitter, Inject, Optional, Output} from '@angular/core';
import {AbstractComponent} from '../controls';
import {SystemLang} from '../i18n';
import {I18NType} from '../shared';

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
export class EditorToolbarComponent extends AbstractComponent {
  block: string;
  bTag: boolean;
  uTag: boolean;
  iTag: boolean;
  fSize: string;
  alignPressed: number;
  tableControlsHidden: boolean;
  borderStyle: string;
  tblBorderWidth: string;
  moveByText = true;
  @Output() emitter = new EventEmitter<CmdEditorToolbox>();
  constructor(private changeDetector: ChangeDetectorRef, public systemLang: SystemLang,
              @Optional() @Inject('i18NCfg') public i18NCfg?: I18NType) {
    super(systemLang); // TODO add i18N
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
  tag(tag: string, attr?: {[key: string]: string}): void {
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

  removeRow(): void {
    this.emitter.emit({cmd: 'tblRemoveRow'});
  }

  removeColumn(): void {
    this.emitter.emit({cmd: 'tblRemoveColumn'});
  }

  insertRow(after?: boolean): void {
    this.emitter.emit({cmd: 'tblInsRow', opt: {after}});
  }

  insertColumn(after?: boolean): void {
    this.emitter.emit({cmd: 'tblInsColumn', opt: {after}});
  }

  tblBorder(style: string, value: string): void {
    this.emitter.emit({cmd: 'tblBorder', opt: {style, value}});
  }

  switchMove(): void {
    this.moveByText = !this.moveByText;
    this.emitter.emit({cmd: 'switchMove', opt: {moveByText: this.moveByText}});
  }
}
