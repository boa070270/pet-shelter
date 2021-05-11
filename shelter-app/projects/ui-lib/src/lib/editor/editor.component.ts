import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SlideContainerDirective} from '../controls';
import {CmdEditorToolbox, EditorToolbarComponent} from './editor-toolbar.component';
import {Subscription} from 'rxjs';
import {LibNode, LibNodeIterator, LibPosition, LibRange, Position} from '../shared';
import {AddModification} from './add-modification';
import {CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragSortEvent, CdkDropList} from '@angular/cdk/drag-drop';
import {DOCUMENT} from '@angular/common';

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
const DESIGNER_ATTR_NAME = '_design';

interface StoragePosition { designId: string; offset: number; txtOffset?: number; }

@Component({
  selector: 'lib-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {
  position = 0;
  source = '';
  designIndex = 1;
  editor: HTMLDivElement;
  lastRange: Range;
  // tslint:disable-next-line:variable-name
  _sourceModified = false;
  moveByText = true;
  rollback: Array<{parent: string, before: string, after: string}> = [];
  @ViewChild(CdkDropList, {static: true}) dropList: CdkDropList;
  @ViewChild('editor', {static: true}) editorRef: ElementRef<HTMLDivElement>;
  @ViewChild(EditorToolbarComponent, {static: true}) toolbar: EditorToolbarComponent;
  @ViewChild(SlideContainerDirective, {static: true}) slide: SlideContainerDirective;
  private subsTb: Subscription = null;
  private focusNode: Node;
  constructor(@Inject(DOCUMENT) private _document: Document) { }
  getCdkDropList: () => CdkDropList = () => this.dropList;

  ngOnInit(): void {
    this.editor = this.editorRef.nativeElement;
    this.subsTb = this.toolbar.emitter.subscribe((e) => {
      try {
        this.onToolbar(e);
      } catch (e) {
        console.error(e); // TODO If subscriber throw error, the link is closed
      }
    });
    this.dropList.disabled = false;
    this.dropList.dropped.subscribe((e: CdkDragDrop<any, any>) => {
      console.log('editor:dropped', e);
    });
    this.dropList.entered.subscribe( (e: CdkDragEnter<any>) => {
      console.log('editor:entered', e);
    });
    this.dropList.exited.subscribe( (e: CdkDragExit<any>) => {
      console.log('editor:exited', e);
    });
    this.dropList.sorted.subscribe((e: CdkDragSortEvent<any>) => {
      // console.log('editor:sorted', e);
    });
  }
  ngOnDestroy(): void {
    if (this.subsTb !== null) {
      this.subsTb.unsubscribe();
      this.subsTb = null;
    }
  }
  private onToolbar(e: CmdEditorToolbox): void {
    console.log('onToolbar', e);
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
    if (this.focusNode) {
      const invert = !!this.isInTag(this.focusNode, tag.toLowerCase());
      this.insertTag(this.lastRange, tag.toLowerCase(), attr, invert);
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
  }
  onKeyDown(event: KeyboardEvent): void {
    console.log('onKeyDown', {key: event.key, altKey: event.altKey, ctrlKey: event.ctrlKey, metaKey: event.metaKey});
    console.log('this.moveByText', this.moveByText);
    this.storeRange();
    this.lastRange = this.validateRange(this.lastRange);
    if (!this.lastRange) {
      this.clearRange();
    }

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
  }
  private update(range: Range, start: number, end: number, str: string): void {
    const part = this.getModifiedPart(range);
    this.source = this.source.substring(0, start) + str + this.source.substring(end);
    const before = part.text;
    part.text = part.text.substring(0, start - part.start) + str + part.text.substring(end - part.start);
    this.rollback.push({
      parent: LibNode.getAttribute(part.parent, DESIGNER_ATTR_NAME),
      before,
      after: part.text
    });
    this.clearRange();
    if (part.parent.nodeType === Node.ELEMENT_NODE) {
      (part.parent as HTMLElement).innerHTML = part.text;
    } else {
      part.parent.textContent = part.text;
    }
  }
  private updateToolbar(): void {
    if (this.focusNode) {
      const res: any = {};
      let e = this.focusNode as HTMLElement;
      if (this.focusNode.nodeType !== Node.ELEMENT_NODE) {
        e = e.parentElement;
      }
      const cs = window.getComputedStyle(e);
      res.fSize = cs.getPropertyValue('font-size');
      while (e !== this.editor) {
        const tag = e.tagName.toLowerCase();
        if (LibNode.isBlockTag(tag)) {
          res.block = tag;
        }
        if (LibNode.isPhrasingTag(tag)) {
          res[tag + 'Tag'] = true;
        }
        e = e.parentElement;
      }
      this.toolbar.updateToolbar(res);
    }
  }
  private newModification(range: Range): AddModification {
    const r = range.cloneRange();
    let p = LibPosition.normalizePoint(r.startContainer, r.startOffset);
    r.setStart(p.n, p.offset);
    p = LibPosition.normalizePoint(r.endContainer, r.endOffset);
    r.setEnd(p.n, p.offset);
    return new AddModification(this.editor, this.source, r, DESIGNER_ATTR_NAME, () => this.designIndex++,
      (rg: Range, st: number, en: number, s: string) => this.update(rg, st, en, s));
  }
  private newPosition(n: Node, offset: number): void {
    if (n.nodeType === Node.TEXT_NODE && offset > n.textContent.length) {
      offset = n.textContent.length;
    }
    if (n.nodeType === Node.ELEMENT_NODE && offset > n.childNodes.length) {
      offset = n.childNodes.length;
    }
    window.getSelection().collapse(n, offset);
    this.storeRange();
  }
  private insert(range: Range, ch: string): void {
    const mod = this.newModification(range);
    const store = this.storePosition(range.startContainer, range.startOffset);
    mod.insert(ch);
    const p = this.restorePosition(store);
    if (p.n.nodeType === Node.TEXT_NODE) {
      this.newPosition(p.n, Math.min(p.n.textContent.length, p.offset + ch.length));
    } else {
      this.newPosition(p.n, p.offset);
    }
  }
  private insertTag(range: Range, tag: string, attr?: {[key: string]: string}, invert = false, isPhrasing?: boolean): void {
    const mod = this.newModification(range);
    const isEmpty = LibNode.isEmptyTag(tag);
    mod.insertTag(tag, attr, invert, isPhrasing);
    const node = this.findDesignElement('' + (this.designIndex - 1)) as Node;
    if (isEmpty) {
      this.newPosition(node.parentNode, LibNode.orderOfChild(node.parentNode, node) + 1);
    } else {
      this.newPosition(node, 0);
    }
  }
  private insertPlugin(range: Range, tag: string, attr?: {[key: string]: string}, isPhrasing?: boolean): void {
    const mod = this.newModification(range);
    mod.insertPlugin(tag, attr); // TODO need to process isPhrasing
    const node = this.findDesignElement('' + (this.designIndex - 1)) as Node;
    this.newPosition(node, 0);
  }
  private delete(range: Range, after = true): void {
    if (!range.collapsed) {
      const mod = this.newModification(range);
      const store = this.storePosition(range.startContainer, range.startOffset);
      mod.delete();
      const p = this.restorePosition(store);
      this.newPosition(p.n, p.offset);
    } else {
      let startPos: Position;
      let endPos: Position;
      const from = {n: range.startContainer, offset: range.startOffset};
      if (after) {
        startPos = from;
        endPos = this.nextDown(startPos);
      } else {
        endPos = from;
        startPos = this.nextUp(endPos);
      }
      if (startPos && endPos) {
        const r = document.createRange();
        r.setStart(startPos.n, startPos.offset);
        r.setEnd(endPos.n, endPos.offset);
        this.delete(r);
      }
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
      const closed = args[1] ? '"/' : '"';
      if (tagBody.indexOf(DESIGNER_ATTR_NAME) === -1) {
        result = true;
        return `<` + tagBody + ' ' + DESIGNER_ATTR_NAME + '="' + this.designIndex++ + closed + '>';
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
  dragOver(e: DragEvent): void {
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(this.defineRange(e));
    this.storeRange();
    this.lastRange = this.validateRange(this.lastRange);
    if (!this.lastRange) {
      this.clearRange();
    } else {
      e.preventDefault();
    }
  }
  defineRange(e: DragEvent): Range {
    const x = e.clientX;
    const y = e.clientY;
    const r = this._document.createRange();
    r.selectNodeContents(e.target as Node);
    return this.collapseRange(r, x, y);
  }
  collapseRange(r: Range, x: number, y: number): Range {
    const rect = r.getBoundingClientRect();
    console.log(rect, x, y);
    if (x >= rect.right || y >= rect.bottom) {
      r.collapse(false);
    } else if (x <= rect.left || y <= rect.top) {
      r.collapse();
    } else {
      const st = LibPosition.nextText({n: r.startContainer, offset: r.startOffset})
        || LibPosition.asLibPosition({n: r.startContainer, offset: r.startOffset}).nextNode();
      const en = LibPosition.prevText({n: r.endContainer, offset: r.endOffset})
        || LibPosition.asLibPosition({n: r.startContainer, offset: r.startOffset}).prevNode();
      if (st) {
        r.setStart(st.n, st.offset);
      } else {
        r.collapse(false);
        return r;
      }
      if (en) {
        r.setEnd(en.n, en.offset);
      } else {
        r.collapse();
        return r;
      }
      r = this.collapseRange(r, x, y);
    }
    return r;
  }
  drop(e: DragEvent): void {
    console.log('drop', e);
    if (this.lastRange) {
      const selectorName = e.dataTransfer.getData('text/plain');
      // TODO there need to be attributes
      this.insertPlugin(this.lastRange, selectorName);
    }
  }
  dragStart(e: DragEvent): void {
    console.log('dragStart', e);
  }
  dragEnd(e: DragEvent): void {
    console.log('dragEnd', e);
  }
  dragExit(e: Event): void {
    console.log('dragExit', e);
  }
  drag(e: DragEvent): void {
    console.log('drag', e);
  }
  dragEnter(e: DragEvent): void {
    console.log('dragEnter', e);
  }
  dragLeave(e: DragEvent): void {
    console.log('dragLeave', e);
  }
  focusin(event: FocusEvent): void {
    console.log('focusin', event);
    this.restoreRange();
  }
  focusout(event: FocusEvent): void {
    console.log('focusout', event);
    this.storeRange();
  }
  private isAncestor(child: Node): boolean {
    // tslint:disable-next-line:no-bitwise
    return this.editor === child || (this.editor.compareDocumentPosition(child) & Node.DOCUMENT_POSITION_CONTAINED_BY) !== 0;
  }
  private isInTag(n: Node, tag: string): Node {
    if (n.nodeType === Node.TEXT_NODE) {
      n = n.parentNode;
    }
    while (n !== this.editor) {
      if ((n as HTMLElement).tagName.toLowerCase() === tag) {
        return n;
      }
      n = n.parentNode;
    }
  }
  private belong(p: Position): boolean {
    if (p) {
      const n = LibPosition.asLibPosition(p).toNode() || p.n;
      return n === this.editor || LibNode.getAttribute(n, DESIGNER_ATTR_NAME) !== null;
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
      this.focusNode = window.getSelection().focusNode;
    } else {
      this.clearRange();
    }
  }
  private clearRange(): void {
    this.lastRange = null;
    this.focusNode = null;
  }
  private restoreRange(): void {
    if (this.focusNode) {
      window.getSelection().collapse(this.focusNode,
        this.focusNode === this.lastRange.startContainer ? this.lastRange.startOffset : this.lastRange.endOffset);
    }
  }
  private validateRange(range: Range): Range {
    if (this.focusNode && this.isAncestor(range.commonAncestorContainer)) {
      if (this.belong(LibPosition.fromNode(range.commonAncestorContainer)) && range.collapsed) {
        return range;
      }
      return LibRange.validate(range, (p) => this.belong(p));
    }
    return null;
  }
  private getModifiedPart(range: Range): {parent: Node, text: string, start: number, end: number} {
    const all = {parent: this.editor, text: this.source, start: 0, end: this.source.length};
    if (range.commonAncestorContainer === this.editor) {
      return all;
    }
    const mod = this.newModification(range);
    return {parent: range.commonAncestorContainer, text: this.source.substring(mod.start, mod.end), start: mod.start, end: mod.end};
  }
  private findDesignElement(id: string): Element {
    if (id === '0') {
      return this.editor;
    }
    return this.editor.querySelector(`[${DESIGNER_ATTR_NAME}="${id}"]`);
  }
  private storePosition(n: Node, offset: number): StoragePosition {
    const result: any = {designId: LibNode.getAttribute(n, DESIGNER_ATTR_NAME), offset};
    if (n.nodeType === Node.TEXT_NODE) {
      result.txtOffset = offset;
      result.offset = LibNode.orderOfChild(n.parentNode, n);
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
  private moveNext(n: Node, offset: number, stepText = true): void {
    const p = this.nextDown({n, offset}, stepText);
    if (p) {
      window.getSelection().collapse(p.n, p.offset);
    }
  }
  private movePrev(n: Node, offset: number, stepText = true): void {
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
  private criteriaTextNode(p: Position, down = true): Position {
    const i = LibPosition.asLibPosition(p);
    const n = i.toNode();
    if (n && n.nodeType === Node.TEXT_NODE && this.belong(i)) {
      console.log('criteriaTextNode', p.n, p.offset, true);
      return {n, offset: down ? 0 : n.textContent.length};
    }
    console.log('criteriaTextNode', p.n, p.offset, false);
  }
  private criteriaAllNode(p: Position, down = true): Position {
    const r = this.criteriaTextNode(p, down);
    if (r) { return r; }
    if (this.belong(p)) {
      console.log('criteriaAllNode', p.n, p.offset, true);
      return p;
    }
    console.log('criteriaAllNode', p.n, p.offset, false);
  }
  private nextDown(p: Position, stepText = true): Position {
    const t = LibPosition.nextText(p);
    if (t) {
      return t;
    }
    if (stepText) {
      return this.findNode(p, (c) => this.criteriaTextNode(c), true);
    }
    return this.findNode(p, (c) => this.criteriaAllNode(c), true);
  }
  private nextUp(p: Position, stepText = true): Position {
    const t = LibPosition.prevText(p);
    if (t) {
      return t;
    }
    if (stepText) {
      return this.findNode(p, (c) => this.criteriaTextNode(c, false), false);
    }
    return this.findNode(p, (c) => this.criteriaAllNode(c, false), false);
  }


}
