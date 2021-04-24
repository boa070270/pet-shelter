import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  CmdEditorToolbox,
  EditorToolbarComponent,
  SlideContainerDirective,
  LibNodeIterator,
  Position,
  PositionImpl
} from 'ui-lib';
import * as lib from 'ui-lib';
import {Subscription} from 'rxjs';

const KNOWN_KEYS = ['Enter', 'Tab',
  'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp',
  'Backspace', 'Delete', 'Insert',
];
const WHITESPACE_KEYS = ['Enter', 'Tab'];
const EDITING_KEYS = [
  'Backspace', 'Delete', 'Insert',
];
const NAVIGATION_KEYS = [
  'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp',
];
const PROCESS_NAVIGATION_KEYS = [
  'ArrowLeft', 'ArrowRight'
];
const BLOCK_ELEMENTS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'blockquote'];
const PHRASING_ELEMENTS = ['b', 'bdo', 'code', 'em', 'i', 'kbd', 'mark', 'samp', 'small', 'strong', 'sub', 'sup', 'var', 'del', 'ins', 'u'];
const DESIGNER_ATTR_NAME = '_design';

function asPositionImpl(p: Position): PositionImpl {
  return p.isImpl ? p as PositionImpl : PositionImpl.newObject(p);
}
interface StoragePosition { designId: string; offset: number; txtOffset?: number; }
// tslint:disable-next-line:jsdoc-format
/** remove **/
function printNode(n: Node): string {
  let s = '';
  if (n.nodeType === Node.ELEMENT_NODE) {
    const e = n as HTMLElement;
    s += e.tagName.toLowerCase() + ' ' + e.getAttribute(DESIGNER_ATTR_NAME);
  } else if (n.nodeType === Node.TEXT_NODE) {
    s += '#text ' + n.textContent;
  } else {
    s = 'no-edit';
  }
  return s;
}
// tslint:disable-next-line:jsdoc-format
/** remove **/
function printSelection(where: string): void {
  const p = window.getSelection();
  // tslint:disable-next-line:max-line-length
  console.log(where, {anchorNode: printNode(p.anchorNode), anchorOffset: p.anchorOffset, focusNode: printNode(p.focusNode), focusOffset: p.focusOffset, isCollapse: p.isCollapsed});
}

@Component({
  selector: 'app-test-sync',
  templateUrl: './test-sync.component.html',
  styleUrls: ['./test-sync.component.scss']
})
export class TestSyncComponent implements OnInit, OnDestroy {
  position = 0;
  source = '';
  designIndex = 1;
  editor: HTMLDivElement;
  lastRange: Range;
  // tslint:disable-next-line:variable-name
  _sourceModified = false;
  moveByText = true;
  rollback: Array<{parent: string, before: string, after: string}> = [];
  @ViewChild('editor', {static: true}) editorRef: ElementRef<HTMLDivElement>;
  @ViewChild(EditorToolbarComponent, {static: true}) toolbar: EditorToolbarComponent;
  @ViewChild(SlideContainerDirective, {static: true}) slide: SlideContainerDirective;
  private subsTb: Subscription = null;
  private focused: Node;
  constructor() { }

  ngOnInit(): void {
    this.editor = this.editorRef.nativeElement;
    this.subsTb = this.toolbar.emitter.subscribe((e) => this.onToolbar(e));
  }
  ngOnDestroy(): void {
    if (this.subsTb !== null) {
      this.subsTb.unsubscribe();
      this.subsTb = null;
    }
  }
  private onToolbar(e: CmdEditorToolbox): void {
    switch (e.cmd) {
      case 'tag':
        this.toolbarTag(e.opt.tag, e.opt.attr);
        break;
      case 'toList':
        break;
      case 'align':
        break;
      case 'clearFormat':
        break;
      case 'insTable':
        break;
      case 'insPlugin':
        break;
      case 'showDesigner':
        this.showDesigner();
        break;
      case 'showSource':
        this.slide.to(1);
        break;
      case 'showHelp':
        this.slide.to(2);
        break;
      case 'tblRemoveRow':
        break;
      case 'tblRemoveColumn':
        break;
      case 'tblInsRow':
        break;
      case 'tblInsColumn':
        break;
      case 'tblBorder':
        break;
      case 'switchMove':
        this.moveByText = e.opt.moveByText;
        break;
    }
  }
  showDesigner(): void {
    this.slide.to(0);
    this.editor.focus();
    this.updateDesigner();
  }
  private toolbarTag(tag: string, attr?: {[key: string]: string}): void {
    if (this.focused) {
      const invert = this.isInTag(this.focused, tag.toLowerCase());
      this.wrap(this.lastRange, tag, attr, invert);
    }
    this.storeRange();
  }
  private updateDesigner(): void {
    if (this._sourceModified || this.checkAndMarkElements()) {
      this.editor.innerHTML = this.source;
      this._sourceModified = false;
      this.startPosition();
    }
  }
  onClick(event: MouseEvent): void {
    console.log(event);
    this.updateDesigner();
    this.storeRange();
    this.lastRange = this.validateRange(this.lastRange);
    if (!this.lastRange) {
      this.clearRange();
    }
    this.updateToolbar();
    console.log('onClick: lastRange=', this.lastRange);
    if (this.lastRange) {
      console.log('onClick:', this.getModifiedPart(this.lastRange));
      const start = this.syncPosition(this.lastRange.startContainer, this.lastRange.startOffset);
      const end = this.syncPosition(this.lastRange.endContainer, this.lastRange.endOffset);
      console.log('onClick start:', start);
      console.log('onClick end:', end);
      console.log('onClick substr:', this.source.substring(start, end));
    }
  }
  onKeyDown(event: KeyboardEvent): void {
    console.log('onKeyDown', {key: event.key, altKey: event.altKey, ctrlKey: event.ctrlKey, metaKey: event.metaKey});
    printSelection('onKeyDown');
    console.log('this.moveByText', this.moveByText);
    this.storeRange();
    this.lastRange = this.validateRange(this.lastRange);

    if (event.ctrlKey || event.metaKey || (event.altKey && !PROCESS_NAVIGATION_KEYS.includes(event.key))) {
      return;
    }
    if (event.key.length > 1 && !KNOWN_KEYS.includes(event.key)) {
      // console.error('onKeyPress input not editable symbol', event.key);
      return;
    }
    if (NAVIGATION_KEYS.includes(event.key) && !PROCESS_NAVIGATION_KEYS.includes(event.key)) {
      return;
    }
    if (this.lastRange) {
      if (WHITESPACE_KEYS.includes(event.key)) {
        this.whitespace(event.key);
      } else if (EDITING_KEYS.includes(event.key)) {
        this.editingKey(event.key);
      } else if (PROCESS_NAVIGATION_KEYS.includes(event.key)) {
        switch (event.key) {
          case 'ArrowLeft':
            this.movePrev(window.getSelection().focusNode, window.getSelection().focusOffset, this.moveByText);
            break;
          case 'ArrowRight':
            this.moveNext(window.getSelection().focusNode, window.getSelection().focusOffset, this.moveByText);
            break;
        }
      } else {
        this.simpleChar(event.key);
      }
      this.storeRange();
      this.updateToolbar();
    }
    event.preventDefault();
    printSelection('onKeyDown: exit');
  }
  private update(range: Range, start: number, end: number, str: string): void {
    const part = this.getModifiedPart(range);
    this.source = this.source.substring(0, start) + str + this.source.substring(end);
    const before = part.text;
    part.text = part.text.substring(0, start - part.start) + str + part.text.substring(end - part.start);
    this.rollback.push({
      parent: this.getAttribute(part.parent),
      before,
      after: part.text
    });
    this.lastRange = null;
    if (part.parent.nodeType === Node.ELEMENT_NODE) {
      (part.parent as HTMLElement).innerHTML = part.text;
    } else {
      part.parent.textContent = part.text;
    }
  }
  private insert(range: Range, ch: string): void {
    const start = this.syncPosition(range.startContainer, range.startOffset);
    const end = this.syncPosition(range.endContainer, range.endOffset);
    const store = this.storePosition(range.startContainer, range.startOffset);
    const str = this.txtSortOut(range.startContainer, range.startOffset,
      range.endContainer, range.endOffset) + ch;
    this.update(range, start, end, str);
    const p = this.restorePosition(store);
    if (p.n.nodeType === Node.TEXT_NODE) {
      window.getSelection().collapse(p.n, Math.min(p.n.textContent.length, p.offset + ch.length));
    } else {
      window.getSelection().collapse(p.n, p.offset);
    }
  }
  private selectContent(n: Node): Range {
    const r = document.createRange();
    r.selectNodeContents(n);
    return r;
  }
  private insertTag(range: Range, tag: string, attr?: {[key: string]: string}, invert: boolean = false): void {
    let updRange = range;
    if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
      updRange = this.selectContent(range.commonAncestorContainer.parentNode);
    }
    const start = this.syncPosition(range.startContainer, range.startOffset);
    const end = this.syncPosition(range.endContainer, range.endOffset);
    const id = '' + this.designIndex++;
    const isEmpty = lib.isEmptyTag(tag);
    const s = `<${tag} ${DESIGNER_ATTR_NAME}="${id}"${this.renderAttr(attr)}>`;
    let str = this.txtSortOut(range.startContainer, range.startOffset,
      range.endContainer, range.endOffset);
    if (isEmpty) {
      str += s;
    } else if (invert) {
      str += `</${tag}>` + s;
    } else {
      str += s + `</${tag}>`;
    }
    this.update(updRange, start, end, str);
    const node = this.findDesignElement(id) as Node;
    if (isEmpty) {
      window.getSelection().collapse(node.parentNode, lib.orderOfChild(node.parentNode, node) + 1);
    } else if (invert) {
      window.getSelection().collapse(node.parentNode, lib.orderOfChild(node.parentNode, node));
    } else {
      window.getSelection().collapse(node, 0);
    }
  }
  private updateToolbar(): void {
    if (this.focused) {
      const res: any = {};
      let e = this.focused as HTMLElement;
      if (this.focused.nodeType !== Node.ELEMENT_NODE) {
        e = e.parentElement;
      }
      const cs = window.getComputedStyle(e);
      res.fSize = cs.getPropertyValue('font-size');
      while (e !== this.editor) {
        const tag = e.tagName.toLowerCase();
        if (BLOCK_ELEMENTS.includes(tag)) {
          res.block = tag;
        }
        if (PHRASING_ELEMENTS.includes(tag)) {
          res[tag + 'Tag'] = true;
        }
        e = e.parentElement;
      }
      this.toolbar.updateToolbar(res);
    }
  }
  private renderAttr(attr: {[key: string]: string}): string {
    let s = '';
    if (attr) {
      for (const [key, value] of Object.entries<string>(attr)) {
        if (value !== undefined) {
          s += ` ${key}="${value}"`;
        } else {
          s += ' ' + key;
        }
      }
    }
    return s;
  }
  private wrap(range: Range, tag: string, attr?: {[key: string]: string}, invert: boolean = false): void {
    if (range.collapsed || lib.isEmptyTag(tag)) {
      this.insertTag(range, tag, attr);
    } else {
      const start = this.syncPosition(range.startContainer, range.startOffset);
      const end = this.syncPosition(range.endContainer, range.endOffset);
      const store = this.storePosition(range.startContainer, range.startOffset);
      const id = '' + this.designIndex++;
      const so = this.sortOut(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
      let s = `<${tag} ${DESIGNER_ATTR_NAME}="${id}"${this.renderAttr(attr)}>`;
      let e = `</${tag}>`;
      if (invert) {
        const t = s; s = e; e = t;
      }
      let str = this.source.substring(start, end);
      for (const t of so.close) {
        const i = str.indexOf('>', t.pos - start);
        str = str.substring(0, t.pos - start) + s + str.substring(t.pos - start, i) + e + str.substring(i + 1);
      }
      for (const t of so.open) {
        const res = this.findSourceMark(t.attr[DESIGNER_ATTR_NAME], str);
        str = str.substring(0, res.index) + s + str.substr(res.index, res[0].length) + e + str.substring(res.index + res[0].length);
      }
      str = s + str + e;
      this.update(range, start, end, str);
      const p = this.restorePosition(store);
      window.getSelection().collapse(p.n, p.offset);
    }
  }
  private delete(range: Range, after = true): void {
    if (!range.collapsed) {
      const start = this.syncPosition(range.startContainer, range.startOffset);
      const end = this.syncPosition(range.endContainer, range.endOffset);
      const store = this.storePosition(range.startContainer, range.startOffset);
      const str = this.txtSortOut(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
      this.update(range, start, end, str);
      const p = this.restorePosition(store);
      window.getSelection().collapse(p.n, p.offset);
    } else {
      let startPos: Position;
      let endPos: Position;
      if (after) {
        startPos = {n: range.startContainer, offset: range.startOffset};
        endPos = this.nextDown(startPos);
        if (!endPos) {
          endPos = this.nextDown(startPos, false);
        }
      } else {
        endPos = {n: range.startContainer, offset: range.startOffset};
        startPos = this.nextUp(endPos);
        if (!startPos) {
          startPos = this.nextUp(endPos, false);
        }
      }
      const r = document.createRange();
      r.setStart(startPos.n, startPos.offset);
      r.setEnd(endPos.n, endPos.offset);
      this.delete(r);
    }
  }
  private whitespace(key: string): void {
    switch (key) {
      case 'Enter':
        this.insertTag(this.lastRange, 'br');
        break;
      case 'Tab':
        break;
    }
  }
  private editingKey(key: string): void {
    switch (key) {
      case 'Backspace':
        this.delete(this.lastRange, false);
        break;
      case 'Delete':
        this.delete(this.lastRange);
        break;
      case 'Insert':
        break;
    }
  }
  private simpleChar(key: string): void {
    this.insert(this.lastRange, key);
  }
  private checkAndMarkElements(): boolean {
    let result = false;
    const upd = this.source.replace(/<([a-zA-Z][^>]*)(\/?)>/g, (s: string, ...args: any[]) => {
      const tagBody = args[0] as string;
      const closed = args[1] ? '/' : '';
      if (tagBody.indexOf(DESIGNER_ATTR_NAME) === -1) {
        result = true;
        return `<${tagBody} ${DESIGNER_ATTR_NAME}="${this.designIndex++}"${closed}>`;
      }
      return s;
    });
    if (result) {
      this.source = upd;
    }
    return result;
  }
  sourceKeyDown(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    if (NAVIGATION_KEYS.includes(event.key)) {
      return;
    }
    this._sourceModified = true;
  }
  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }
  drop(event: DragEvent): void {
  }
  dragStart(event: DragEvent): void {
  }
  focusin(event: FocusEvent): void {
    console.log(event);
    this.restoreRange();
  }
  focusout(event: FocusEvent): void {
    this.storeRange();
  }
  private getAttribute(n: Node): string {
    if (n) {
      if (n.nodeType === Node.TEXT_NODE) {
        return n.parentElement.getAttribute(DESIGNER_ATTR_NAME);
      }
      if (n.nodeType === Node.ELEMENT_NODE) {
        return (n as HTMLElement).getAttribute(DESIGNER_ATTR_NAME);
      }
    }
    return null;
  }
  private isAncestor(child: Node): boolean {
    // tslint:disable-next-line:no-bitwise
    return this.editor === child || (this.editor.compareDocumentPosition(child) & Node.DOCUMENT_POSITION_CONTAINED_BY) !== 0;
  }
  private isInTag(n: Node, tag: string): boolean {
    if (n.nodeType === Node.TEXT_NODE) {
      n = n.parentNode;
    }
    while (n !== this.editor) {
      if ((n as HTMLElement).tagName.toLowerCase() === tag) {
        return true;
      }
      n = n.parentNode;
    }
  }
  private belong(p: Position): boolean {
    if (p) {
      const n = asPositionImpl(p).toNode() || p.n;
      return n === this.editor || this.getAttribute(n) !== null;
    }
  }
  private startPosition(): void {
    for (let i = 0; i < this.editor.childNodes.length; ++i) {
      if (this.editor.childNodes[i].nodeType === Node.TEXT_NODE) {
        window.getSelection().collapse(this.editor.childNodes[i], 0);
        return;
      } else if (this.editor.childNodes[i].nodeType === Node.ELEMENT_NODE) {
        window.getSelection().collapse(this.editor, i);
        return;
      }
    }
    window.getSelection().collapse(this.editor, this.editor.childNodes.length);
  }
  private storeRange(): void {
    if (window.getSelection().rangeCount === 1) {
      this.lastRange = window.getSelection().getRangeAt(0);
      this.focused = window.getSelection().focusNode;
    } else {
      this.clearRange();
    }
  }
  private clearRange(): void {
    this.lastRange = null;
    this.focused = null;
  }
  private restoreRange(): void {
    if (this.focused) {
      window.getSelection().collapse(this.focused,
        this.focused === this.lastRange.startContainer ? this.lastRange.startOffset : this.lastRange.endOffset);
    }
  }
  private validateRange(range: Range): Range {
    if (this.focused && this.isAncestor(range.commonAncestorContainer)) {
      if (this.belong(PositionImpl.fromNode(range.commonAncestorContainer))
        && (range.collapsed || range.commonAncestorContainer.nodeType === Node.TEXT_NODE)) {
        return range;
      }
      const start = this.focused === range.startContainer;
      let startPos = new PositionImpl(range.startContainer, range.startOffset);
      let endPos = new PositionImpl(range.endContainer, range.endOffset);
      if (!this.belong(startPos)) {
        startPos = asPositionImpl(this.findNode(startPos, (p) => {
          const n = asPositionImpl(p).toNode();
          if (n && (this.belong(p) || n === endPos.toNode())) {
            if (n.nodeType === Node.TEXT_NODE) {
              return new PositionImpl(n, 0);
            }
            return p;
          }
        }, true));
        if (start) {
          this.focused = startPos.n;
        }
      }
      if (!this.belong(endPos)) {
        endPos = asPositionImpl(this.findNode(endPos, (p) => {
          const n = asPositionImpl(p).toNode();
          if (n && (this.belong(p) || n === startPos.toNode())) {
            if (n.nodeType === Node.TEXT_NODE) {
              return new PositionImpl(n, n.textContent.length);
            }
            return p;
          }
        }, false));
        if (!start) {
          this.focused = endPos.n;
        }
      }
      if (startPos.n === range.endContainer && startPos.offset === range.endOffset) {
        if (this.belong(startPos)) {
          range.collapse(false);
          return range;
        } else {
          return null;
        }
      }
      if (endPos.n === range.startContainer && endPos.offset === range.startOffset) {
        if (this.belong(endPos)) {
          range.collapse(true);
          return range;
        } else {
          return null;
        }
      }
      if (startPos.n !== range.startContainer || startPos.offset !== range.startOffset) {
        range.setStart(startPos.n, startPos.offset);
      }
      if (endPos.n !== range.endContainer || endPos.offset !== range.endOffset) {
        range.setEnd(endPos.n, endPos.offset);
      }
      return range;
    }
    return null;
  }
  private findSourceMark(attr: string, source?: string): RegExpExecArray {
    if (!source) { source = this.source; }
    const regexp = new RegExp(`<([a-zA-Z][^<>]*\\s${DESIGNER_ATTR_NAME}="${attr}"[^<>]*)>`, 'gs');
    return regexp.exec(source);
  }
  private startSourceMark(attr: string): number {
    return this.findSourceMark(attr).index;
  }
  private endSourceMark(attr: string): number {
    const res = this.findSourceMark(attr);
    return res.index + res[0].length;
  }
  private endOfElement(tag: string, pos: number): RegExpExecArray {
    const regexp = new RegExp(`<\/${tag}\\s*>`, 'gi');
    regexp.lastIndex = pos;
    const chk = new RegExp(`<${tag}(\\s[^>]*|\\s?)>`, 'gi');
    chk.lastIndex = pos;
    let res;
    do {
      res = regexp.exec(this.source);
      if (res === null) {
        break;
      }
      const p = chk.exec(this.source);
      if (p === null || p.index > res.index) {
        break;
      }
    } while (true);
    return res;
  }
  private endOfElementIn(tag: string, pos: number): number {
    const res = this.endOfElement(tag, pos);
    if (res === null) {
      console.error(`Absent end of tag ${tag}, position: ${pos}`); // TODO need to inform customer about invalid HTML
      return this.source.length;
    }
    return res.index;
  }
  private endOfElementOut(tag: string, pos: number): number {
    const res = this.endOfElement(tag, pos);
    if (res === null) {
      console.error(`Absent end of tag ${tag}, position: ${pos}`); // TODO need to inform customer about invalid HTML
      return this.source.length;
    }
    return res.index + res[0].length;
  }
  private getModifiedPart(range: Range): {parent: Node, text: string, start: number, end: number} {
    let parent = PositionImpl.fromNode(range.commonAncestorContainer);
    const all = {parent: this.editor, text: this.source, start: 0, end: this.source.length};
    if (parent.toNode() === this.editor) {
      return all;
    }
    if (!this.belong(parent)) {
      parent = asPositionImpl(this.findNode(parent, (p) => {
        const n = asPositionImpl(p).toNode();
        if (n && this.belong(p) && n.nodeType === Node.ELEMENT_NODE) { // there cannot be text node
          return p;
        }
      }, false));
      if (parent === null) {
        throw new Error('getModifiedPart: TODO it is not possible 1');
      }
    }
    if (parent.toNode() === this.editor) {
      return all;
    }
    let start: number; let end: number;
    const node = parent.toNode();
    if (node.nodeType === Node.ELEMENT_NODE) {
      start = this.endSourceMark(this.getAttribute(node));
      end = this.endOfElementIn(parent.tagName(), start);
    } else {
      start = this.syncPosition(range.startContainer, 0);
      end = this.syncPosition(range.endContainer, range.endContainer.textContent.length);
    }
    return {parent: node, text: this.source.substring(start, end), start, end};
  }
  private findDesignElement(attr: string): Element {
    if (attr === '0') {
      return this.editor;
    }
    return this.editor.querySelector(`[${DESIGNER_ATTR_NAME}="${attr}"]`);
  }
  private rangeSourceMarkOut(attr): {start: number, end: number} {
    if (attr === '0') {
      return {start: 0, end: this.source.length};
    }
    const res = this.findSourceMark(attr);
    if (res) {
      const start = res.index;
      const e = this.findDesignElement(attr);
      if (e) {
        if (lib.isEmptyNode(e)) {
          return {start, end: start + res[0].length};
        }
        return {start, end: this.endOfElementOut(e.tagName, start + res[0].length)};
      } else {
        console.error('Absent element with designId=' + attr);
      }
    }
    console.error('Unknown design ID:' + attr);
    return {start: 0, end: this.source.length};
  }
  private syncPosition(n: Node, offset: number): number {
    if (n.nodeType === Node.ELEMENT_NODE) {
      let start = 0;
      if (n !== this.editor) {
        start = this.endSourceMark(this.getAttribute(n));
      }
      for (let i = 0; n.childNodes[i] && i < offset; ++i) {
        const ch = n.childNodes[i];
        if (ch.nodeType === Node.TEXT_NODE) {
          // nothing
        } else if (ch.nodeType === Node.ELEMENT_NODE) {
          const range = this.rangeSourceMarkOut(this.getAttribute(ch));
          start = range.end;
        } else if (ch.nodeType === Node.COMMENT_NODE) {
          start = this.source.indexOf('-->', start) + 3;
        } else if (ch.nodeType === Node.CDATA_SECTION_NODE) {
          start = this.source.indexOf(']]>', start) + 3;
        }
      }
      return start;
    } else {
      // I expect only TEXT_NODE here
      let start = lib.orderOfChild(n.parentNode, n);
      start = this.syncPosition(n.parentNode, start);
      return start + offset + this.unicodes(start, offset);
    }
  }
  private unicodes(start: number, end: number): number {
    const regexp = /&#(\d{2,4}|x[0-9a-zA-Z]{2,4});/;
    regexp.lastIndex = start;
    let count = 0;
    do {
      const res = regexp.exec(this.source);
      if (res === null || res.index > end) {
        break;
      }
      count += (res[1].length + 2);
      end -= (res.index + 1);
    } while (true);
    return count;
  }
  private sortOut(start: Node, sOffset: number, end: Node, eOffset: number):
    {open: Array<{tag: string, attr?: {[key: string]: string}}>, close: Array<{tag: string, pos: number}>} {
    const result = {open: [], close: []};

    const range = document.createRange();
    range.setStart(start, sOffset);
    range.setEnd(end, eOffset);
    const p = range.commonAncestorContainer;
    if (!range.collapsed) {
      let e: Node;
      if (end !== p) {
        e = (end.nodeType === Node.TEXT_NODE) ? end.parentNode : end;
        while (e !== p) {
          const designId = e.nodeType === Node.ELEMENT_NODE ? this.getAttribute(e) : null;
          if (designId) {
            result.open.push({
              tag: (e as HTMLElement).tagName, designId,
              attr: (e as HTMLElement).getAttributeNames().reduce<any>((pv, n) => {
                pv[n] = (e as HTMLElement).getAttribute(n);
              }, {})});
          }
          e = e.parentNode;
        }
      }
      if (start !== p) {
        e = (start.nodeType === Node.TEXT_NODE) ? start.parentNode : start;
        while (e !== p) {
          const designId = e.nodeType === Node.ELEMENT_NODE ? this.getAttribute(e) : null;
          if (designId) {
            const i = result.open.findIndex(v => v.designId === designId);
            if (i >= 0) {
              result.open.splice(i, 1);
            } else {
              let pos = this.endSourceMark(this.getAttribute(e));
              const tag = (e as HTMLElement).tagName;
              pos = this.endOfElementIn(tag, pos);
              result.close.unshift({tag, pos});
            }
          }
          e = e.parentNode;
        }
      }
    }
    return result;
  }
  private txtSortOut(start: Node, sOffset: number, end: Node, nOffset: number): string {
    let src = '';
    const sourOut = this.sortOut(start, sOffset, end, nOffset);
    for (const e of sourOut.close) {
      src += `</${e.tag.toLowerCase()}>`;
    }
    for (const e of sourOut.open) {
      src += `<${e.tag.toLowerCase()}${this.renderAttr(e.attr)}>`;
    }
    return src;
  }
  private storePosition(n: Node, offset: number): StoragePosition {
    const result: any = {designId: this.getAttribute(n), offset};
    if (n.nodeType === Node.TEXT_NODE) {
      result.txtOffset = offset;
      result.offset = lib.orderOfChild(n.parentNode, n);
    }
    return result;
  }
  private restorePosition(store: StoragePosition): Position {
    const p = {n: this.findDesignElement(store.designId) as Node, offset: store.offset};
    if (p.n.childNodes[p.offset] && p.n.childNodes[p.offset].nodeType === Node.TEXT_NODE) {
      p.n = p.n.childNodes[p.offset];
      p.offset = store.txtOffset || 0;
    }
    return p;
  }
  private moveNext(n: Node, offset: number, stepText: boolean = true): void {
    const p = this.nextDown({n, offset}, stepText);
    if (p) {
      window.getSelection().collapse(p.n, p.offset);
    }
  }
  private movePrev(n: Node, offset: number, stepText: boolean = true): void {
    const p = this.nextUp({n, offset}, stepText);
    if (p) {
      window.getSelection().collapse(p.n, p.offset);
    }
  }
  private findNode(p: Position, criteria: (p: Position) => Position, down: boolean): Position {
    const iterator = new LibNodeIterator(this.editor, p, !down);
    for (const next of iterator) {
      const res = criteria(next);
      if (res) {
        return res;
      }
    }
    return null;
  }
  private criteriaTextNode(p: Position, down: boolean = true): Position {
    const i = asPositionImpl(p);
    const n = i.toNode();
    if (n && n.nodeType === Node.TEXT_NODE && this.belong(i)) {
      console.log('criteriaTextNode', p.n, p.offset, true);
      return {n, offset: down ? 0 : n.textContent.length};
    }
    console.log('criteriaTextNode', p.n, p.offset, false);
  }
  private criteriaAllNode(p: Position, down: boolean = true): Position {
    const r = this.criteriaTextNode(p, down);
    if (r) { return r; }
    if (this.belong(p)) {
      console.log('criteriaAllNode', p.n, p.offset, true);
      return p;
    }
    console.log('criteriaAllNode', p.n, p.offset, false);
  }
  private nextDown(p: Position, stepText: boolean = true): Position {
    if (p.n.nodeType === Node.TEXT_NODE && p.n.textContent.length > p.offset) {
      return {n: p.n, offset: p.offset + 1};
    }
    if (stepText) {
      return this.findNode(p, (c) => this.criteriaTextNode(c), true);
    }
    return this.findNode(p, (c) => this.criteriaAllNode(c), true);
  }
  private nextUp(p: Position, stepText: boolean = true): Position {
    if (p.n.nodeType === Node.TEXT_NODE && p.offset > 0) {
      return {n: p.n, offset: p.offset - 1};
    }
    if (stepText) {
      return this.findNode(p, (c) => this.criteriaTextNode(c, false), false);
    }
    return this.findNode(p, (c) => this.criteriaAllNode(c, false), false);
  }

}
