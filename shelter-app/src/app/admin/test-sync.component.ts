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
function getAttribute(n: Node): string {
  if (n) {
    if (n.nodeType === Node.ELEMENT_NODE) {
      return (n as HTMLElement).getAttribute(DESIGNER_ATTR_NAME);
    } else {
      return n.parentElement.getAttribute(DESIGNER_ATTR_NAME);
    }
  }
  return null;
}
class AddModification {
  readonly start: number;
  readonly end: number;
  private readonly extRange: Range;
  private readonly startPos: PositionImpl;
  private readonly endPos: PositionImpl;
  private readonly root: Node;
  private sourOut: { matchTag: HTMLElement[]; affectBoth: HTMLElement[]; affectStart: HTMLElement[]; affectEnd: HTMLElement[] };
  constructor(private editor: HTMLElement, private source: string, private range: Range,
              private nextId: () => number,
              private update: (range: Range, start: number, end: number, str: string) => void) {
    this.start = this.syncPosition(range.startContainer, range.startOffset);
    this.end = this.syncPosition(range.endContainer, range.endOffset);
    this.startPos = new PositionImpl(this.range.startContainer, this.range.startOffset);
    this.endPos = new PositionImpl(this.range.endContainer, this.range.endOffset);
    this.root = this.range.commonAncestorContainer;
    this.extRange = range.cloneRange();
    let n = range.commonAncestorContainer;
    if (n.nodeType === Node.TEXT_NODE) {
      n = n.parentElement;
      for (; n !== this.editor && getAttribute(n) === null; n = n.parentElement){}
    }
    this.extRange.selectNodeContents(n);
    this.sourOut = this.dependOnRange(BLOCK_ELEMENTS);
  }
  private belong(p: Position): boolean {
    if (p) {
      const n = PositionImpl.nodeOfPosition(p);
      return n === this.editor || getAttribute(n) !== null;
    }
  }
  private syncPosition(n: Node, offset: number): number {
    if (!this.belong({n, offset})) { // only on development time. Throw out after
      throw new Error('Invalid position');
    }
    if (n.nodeType === Node.ELEMENT_NODE) {
      let start = 0; let pre = 0;
      if (n !== this.editor) {
        pre = this.endSourceMark(getAttribute(n));
      }
      for (let i = 0; i <= offset; ++i) {
        start = pre;
        const ch = n.childNodes[i];
        if (!ch) {
        } else if (ch.nodeType === Node.TEXT_NODE) {
          pre = start + ch.nodeValue.length + this.unicodes(start, start + ch.nodeValue.length);
        } else if (ch.nodeType === Node.ELEMENT_NODE) {
          const attr = getAttribute(ch);
          if (attr === null) {
            continue;
          }
          const r = this.findSourceMark(attr); if (start !== r.index) { console.log(`Invalid format, pos[${start}]: ${this.source}`); }
          start = r.index;
          pre = r.index + r[0].length;
        } else if (ch.nodeType === Node.COMMENT_NODE) {
          const o = start;
          start = this.source.indexOf('<!--', start); if (start !== o) { console.log(`Invalid format, pos[${start}]: ${this.source}`); }
          pre = this.source.indexOf('-->', start) + 3;
        } else if (ch.nodeType === Node.CDATA_SECTION_NODE) {
          const o = start;
          // tslint:disable-next-line:max-line-length
          start = this.source.indexOf('<!CDATA[[', start); if (start !== o) { console.log(`Invalid format, pos[${start}]: ${this.source}`); }
          pre = this.source.indexOf(']]>', start) + 3;
        }
      }
      return start;
    } else {
      let start = lib.orderOfChild(n.parentNode, n);
      start = this.syncPosition(n.parentNode, start);
      return start + offset + this.unicodes(start, start + offset);
    }
  }
  private unicodes(start: number, end: number): number {
    const regexp = /&#(\d{2,4}|x[0-9a-zA-Z]{2,4});/g;
    regexp.lastIndex = start;
    let count = 0;
    do {
      const res = regexp.exec(this.source);
      if (res === null || res.index >= end) {
        break;
      }
      count += (res[1].length + 2);
      end -= (res.index + 1);
    } while (true);
    return count;
  }
  private findSourceMark(attr: string): RegExpExecArray {
    const regexp = new RegExp(`<([a-zA-Z][^<>]*\\s${DESIGNER_ATTR_NAME}="${attr}"[^<>]*)>`, 'gs');
    return regexp.exec(this.source);
  }
  private endSourceMark(attr: string): number {
    const res = this.findSourceMark(attr);
    return res.index + res[0].length;
  }
  private renderAttr(attr: {[key: string]: string} = {}, keepId = true, id?: string): string {
    let s = '';
    if (!attr[DESIGNER_ATTR_NAME] || !keepId) {
      attr[DESIGNER_ATTR_NAME] = id || '' + this.nextId();
    }
    for (const [key, value] of Object.entries<string>(attr)) {
      if (value !== undefined) {
        s += ` ${key}="${value}"`;
      } else {
        s += ' ' + key;
      }
    }
    return s;
  }
  private startTag(tag: string, attr?: {[key: string]: string}, keepId = true, id?: string): string {
    return `<${tag} ${this.renderAttr(attr, keepId, id)}>`;
  }
  private copyTag(n: HTMLElement, keepId = true): string {
    let str = '<' + n.tagName.toLowerCase();
    n.getAttributeNames().forEach(a => {
      str = str + ' ' + a;
      if (!keepId && a === DESIGNER_ATTR_NAME) {
        str =  str + '="' + this.nextId() + '"';
      } else {
        if (n.getAttribute(a)) {
          str = str + '="' + n.getAttribute(a) + '"';
        }
      }
    });
    return str + '>';
  }
  /**
   * find all elements that contain this range
   * @param tags - array of tags lowerCase
   * @private
   */
  private dependOnRange(tags?: string[]):
    {matchTag: HTMLElement[], affectBoth: HTMLElement[], affectStart: HTMLElement[], affectEnd: HTMLElement[]} {
    const res = {matchTag: [], affectBoth: [], affectStart: [], affectEnd: []};
    if (!this.range.collapsed && this.range.commonAncestorContainer.nodeType !== Node.TEXT_NODE) {
      const iter = new LibNodeIterator(this.root, this.endPos, true);
      const sn = PositionImpl.nodeOfPosition(this.startPos);
      const en = PositionImpl.nodeOfPosition(this.endPos);
      for (const p of iter) {
        const n = PositionImpl.nodeOfPosition(p);
        if (n.nodeType === Node.ELEMENT_NODE) {
          if (tags.includes(p.tagName()) &&  !res.matchTag.includes(n)) {
            res.matchTag.push(n);
          }
          // tslint:disable:no-bitwise
          if ((en.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_CONTAINS) !== 0 && !res.affectEnd.includes(n)) {
            res.affectEnd.push(n);
          }
          if ((sn.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_CONTAINS) !== 0 && !res.affectStart.includes(n)) {
            res.affectStart.push(n);
          }
        }
      }
    }
    return res;
  }
  private txtSortOut(str: string, tag?: string, attr?: {[key: string]: string}, invert?: boolean): string {
    if (tag) {
      tag = tag.toLowerCase();
    }
    let before = '';
    if (!tag) {
      for (const n of this.sourOut.affectStart) {
        before = '</' + n.tagName.toLowerCase() + '>';
      }
      before += str;
      for (const n of this.sourOut.affectEnd) {
        before += this.copyTag(n);
      }
    } else if (lib.EMPTY_ELEMENTS.includes(tag)) {
      for (const n of this.sourOut.affectStart) {
        before = '</' + n.tagName.toLowerCase() + '>';
      }
      before = before + this.startTag(tag, attr) + str;
      for (const n of this.sourOut.affectEnd) {
        before += this.copyTag(n);
      }
    } else if (BLOCK_ELEMENTS.includes(tag)) {
      // check block nodes
      let p = this.range.commonAncestorContainer as HTMLElement;
      while (p !== this.editor) {
        if (getAttribute(p) !== null && BLOCK_ELEMENTS.includes(p.tagName) && !this.sourOut.affectBoth.includes(p)) {
          this.sourOut.affectBoth.push(p);
        }
        p = p.parentElement;
      }
      if (this.range.collapsed) {
        for (const n of this.sourOut.affectBoth) {
          before = before + '</' + n.tagName.toLowerCase() + '>';
        }
        if (invert) {
          before = before + '</' + tag + '>' + str + this.startTag(tag, attr);
        } else {
          before = before + this.startTag(tag, attr) + str + '</' + tag + '>';
        }
        for (const n of this.sourOut.affectBoth) {
          before = before + this.copyTag(n, false);
        }
      } else {
        /* steps for block tag:
        1. define all blocks nodes that wrap this range (these blocks wrap commonAncestorContainer)
          close all this blocks and after open them
        2. define all elements that wrap start position
          close these elements (we do not open them)
        3. define all block element that is in the range (them can out paren-children path)
          delete them (with regexp from src)
        4. define all elements that is not block and affect the end position
          close them and then open them
       */
        // 1.
        for (const n of this.sourOut.affectBoth) {
          before = before + '</' + n.tagName.toLowerCase() + '>';
        }
        // 2.
        for (const n of this.sourOut.affectStart) {
          before = before + '</' + n.tagName.toLowerCase() + '>';
        }
        // 3.
        let sb = this.source.substring(this.start, this.end);
        for (const t of BLOCK_ELEMENTS) {
          const stag = new RegExp(`<${t}[^>]*>`, 'gi');
          const etag = new RegExp(`</${t}[^>]*>`, 'gi');
          sb = sb.replace(stag, () => {
            return '';
          });
          sb = sb.replace(etag, () => {
            return '';
          });
        }
        // 4.
        for (const n of this.sourOut.affectEnd) {
          before = before + '</' + n.tagName.toLowerCase() + '>';
        }
        before += sb;
        // 4.
        for (const n of this.sourOut.affectEnd) {
          before = before + this.copyTag(n, false);
        }
        // 1.
        for (const n of this.sourOut.affectBoth) {
          before = before + this.copyTag(n, false);
        }
      }
    } else if (PHRASING_ELEMENTS.includes(tag)) {
      if (this.range.collapsed) {
        if (invert) {
          return '</' + tag + '>' + str + this.startTag(tag, attr);
        } else {
          return this.startTag(tag, attr) + str + '</' + tag + '>';
        }
      } else {
        // tslint:disable:max-line-length
        /*
         steps for phrasing tag:
         1. define all text node in range, for every node:
         1.1. if this node is wrapped in this phrasing tag, skip it (if invert - delete)
         1.2. all blocks nodes leave on its place (we work only with text nodes)
         this solution has one big cons: there can be cas when user shift position between tag and new symbol would be
         out tag.
         So there is only one properly solution, I need to wrap all range in a tag.
         ----- Start from here
         Limits:
           - if there is blocking elements in the range, I need to close the tag element before block,
            than open the tag element in this bloke and close it at the and of this block.
            I need open element after this block...
         1. define all element that wrap start position.
          If there is the same tag - (I can close it as all other. If I leave it open I was need to leave open all other
          elements that wrap this tag element.) Decision - close all element that wrap start position!
          BUT! I cannot close the blocking elements! So if I found that the start position is wrapped by block element, I gone to the point 4.
         2. Open tag element.
         3. Define all tag elements that is in the range - delete them
         4. Define all block element that is in the range (them can out paren-children path)
           4.1. close the tag element before block
           4.2. define range for a block with start - start of content, end - end of block or end of main range (in last case
           mark that end is processed)
           4.3. apply this algorithm to this range.
           4.4. if end isn't processed open the tag element
         5. If end is not processed
          5.1. close all elements that affect the end position
          5.2. close tag element
          5.3. open all elements that affect the end position
          */
        if (this.sourOut.matchTag.length === 0) {
          before = this.wrapInBlock(this.range, tag, attr, invert);
        } else {
          const sn = PositionImpl.nodeOfPosition(this.startPos);
          const en = PositionImpl.nodeOfPosition(this.endPos);
          for (const n of this.sourOut.matchTag) {
            // tslint:disable:no-bitwise max-line-length
            if ((n.compareDocumentPosition(sn) & Node.DOCUMENT_POSITION_CONTAINS) === 0 && (n.compareDocumentPosition(en) & Node.DOCUMENT_POSITION_CONTAINS) === 0) {
              continue;
            }
            const r = this.range.cloneRange();
            r.selectNodeContents(n);
            if ((n.compareDocumentPosition(sn) & Node.DOCUMENT_POSITION_CONTAINS) === 0) {
              r.setStart(this.startPos.n, this.startPos.offset);
              before += this.wrapInBlock(r, tag, attr, invert);
            } else if ((n.compareDocumentPosition(en) & Node.DOCUMENT_POSITION_CONTAINS) === 0) {
              r.setEnd(this.endPos.n, this.endPos.offset);
              before += this.wrapInBlock(r, tag, attr, invert);
            } else {
              before += this.wrapInBlock(r, tag, attr, invert);
            }
          }
        }
      }
    }
    return before;
  }
  private wrapInBlock(range: Range, tag: string, attr?: {[key: string]: string}, invert?: boolean): string {
    // this is private method. There are no blocking elements
    // 1. close all elements that affect start position
    // 2. open the tag element (if not invert)
    // 3. open all element that affect the start position
    // 4. delete all tag elements if them present in range
    // 5. close all element that affect the end position
    // 6. close the tag element (if not invert)
    // 7. open all element that affect the end position
    const start = this.syncPosition(range.startContainer, range.startOffset);
    const end = this.syncPosition(range.endContainer, range.endOffset);
    const sourOut = this.dependOnRange([tag]);
    let sb = this.source.substring(start, end);
    if (invert && sourOut.matchTag.length === 0) { // there is nothing to do
      return sb;
    }
    let before = '';
    // 1.
    for (const n of sourOut.affectStart) {
      before += '</' + n.tagName.toLowerCase() + '>';
    }
    // 2.
    if (!invert) {
      before += this.startTag(tag, attr);
    }
    // 3.
    for (const n of sourOut.affectStart) {
      before += this.copyTag(n, false);
    }
    // 4.
    for (const t of [tag]) {
      const stag = new RegExp(`<${t}[^>]*>`, 'gi');
      const etag = new RegExp(`</${t}[^>]*>`, 'gi');
      sb = sb.replace(stag, () => {
        return '';
      });
      sb = sb.replace(etag, () => {
        return '';
      });
    }
    before += sb;
    // 5.
    for (const n of sourOut.affectEnd) {
      before += '</' + n.tagName.toLowerCase() + '>';
    }
    // 6.
    if (!invert) {
      before += '</' + tag + '>';
    }
    // 7.
    for (const n of sourOut.affectEnd) {
      before += this.copyTag(n, false);
    }
    return before;
  }
  insert(ch: string): void {
    const str = this.txtSortOut(ch);
    this.update(this.extRange, this.start, this.end, str);
  }
  insertTag(tag: string, attr?: {[key: string]: string}, invert?: boolean): void {
    const str = this.txtSortOut('', tag, attr, invert);
    this.update(this.extRange, this.start, this.end, str);
  }
  public delete(): void {
    if (!this.range.collapsed) {
      const str = this.txtSortOut('');
      this.update(this.extRange, this.start, this.end, str);
    }
  }
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
  private focusNode: Node;
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
      parent: getAttribute(part.parent),
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
  private newModification(range: Range): AddModification {
    return new AddModification(this.editor, this.source, range, () => this.designIndex++,
      (r: Range, st: number, en: number, s: string) => this.update(r, st, en, s));
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
  private insertTag(range: Range, tag: string, attr?: {[key: string]: string}, invert = false): void {
    const mod = this.newModification(range);
    const isEmpty = lib.isEmptyTag(tag);
    mod.insertTag(tag, attr, invert);
    const node = this.findDesignElement('' + (this.designIndex - 1)) as Node;
    if (isEmpty) {
      this.newPosition(node.parentNode, lib.orderOfChild(node.parentNode, node) + 1);
    } else {
      this.newPosition(node, 0);
    }
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
      const n = lib.asPositionImpl(p).toNode() || p.n;
      return n === this.editor || getAttribute(n) !== null;
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
      if (this.belong(PositionImpl.fromNode(range.commonAncestorContainer))
        && (range.collapsed || range.commonAncestorContainer.nodeType === Node.TEXT_NODE)) {
        return range;
      }
      const start = this.focusNode === range.startContainer;
      let startPos = new PositionImpl(range.startContainer, range.startOffset);
      let endPos = new PositionImpl(range.endContainer, range.endOffset);
      if (!this.belong(startPos)) {
        startPos = lib.asPositionImpl(this.findNode(startPos, (p) => {
          const n = lib.asPositionImpl(p).toNode();
          if (n && (this.belong(p) || n === endPos.toNode())) {
            if (n.nodeType === Node.TEXT_NODE) {
              return new PositionImpl(n, 0);
            }
            return p;
          }
        }, true));
        if (start) {
          this.focusNode = startPos.n;
        }
      }
      if (!this.belong(endPos)) {
        endPos = lib.asPositionImpl(this.findNode(endPos, (p) => {
          const n = lib.asPositionImpl(p).toNode();
          if (n && (this.belong(p) || n === startPos.toNode())) {
            if (n.nodeType === Node.TEXT_NODE) {
              return new PositionImpl(n, n.textContent.length);
            }
            return p;
          }
        }, false));
        if (!start) {
          this.focusNode = endPos.n;
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
    const result: any = {designId: getAttribute(n), offset};
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
    const i = lib.asPositionImpl(p);
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
