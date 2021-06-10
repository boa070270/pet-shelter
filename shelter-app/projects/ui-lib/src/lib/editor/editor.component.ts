import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SlideContainerDirective} from '../controls';
import {CmdEditorToolbox, EditorToolbarComponent} from './editor-toolbar.component';
import {Subscription} from 'rxjs';
import {
  ComponentsPluginService,
  HtmlRules,
  HtmlWrapper,
  LibNode,
  NodeWrapper,
  SimpleParser,
  SNode,
  SNodeIterator,
  SPosition,
  SRange,
  treeWalker
} from '../shared';
// import {AddModification} from './add-modification';
import {CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragSortEvent, CdkDropList} from '@angular/cdk/drag-drop';
import {DOCUMENT} from '@angular/common';
import {DialogService} from '../dialog-service';

// tslint:disable:max-line-length
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
  private parser = new SimpleParser('', DESIGNER_ATTR_NAME);
  private replaceChar = false;
  set source(s: string) {
    this.parser = new SimpleParser(s, DESIGNER_ATTR_NAME);
  }
  get source(): string {
    return this.parser ? this.parser.source : '';
  }
  designIndex = 1;
  editor: HTMLDivElement;
  // @Deprecated
  lastRange: Range;
  // @Deprecated
  private focusNode: Node;
  private range: SRange;
  // tslint:disable-next-line:variable-name
  _sourceModified = false;
  moveByText = true;
  rollback: Array<{parent: string, before: string, after: string}> = [];
  @ViewChild(CdkDropList, {static: true}) dropList: CdkDropList;
  @ViewChild('editor', {static: true}) editorRef: ElementRef<HTMLDivElement>;
  @ViewChild(EditorToolbarComponent, {static: true}) toolbar: EditorToolbarComponent;
  @ViewChild(SlideContainerDirective, {static: true}) slide: SlideContainerDirective;
  private subsTb: Subscription = null;
  constructor(@Inject(DOCUMENT) private _document: Document, private dialogService: DialogService, private pluginService: ComponentsPluginService) { }
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
    const r = HtmlRules.elements[tag][0];
    if (r.cnt) {
      const n = SNode.elementNode(tag, attr);
      if (HtmlRules.isVoid(tag)) {
        this.void(tag, attr);
      } else if (HtmlRules.isPhrasing(n)) {
        this.phrasing(tag, attr);
      } else if (HtmlRules.isHeading(n)) {
        this.heading(tag, attr);
      } else if (HtmlRules.isSectioning(n)) {
        this.sectioning(tag, attr);
      } else if (HtmlRules.isSectionRoot(n)) {
        this.sectioningRoot(tag, attr);
      }
    }
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
    if (!this.range) {
      this.clearRange();
    }
    this.updateToolbar();
    console.log('onClick: lastRange=', this.lastRange);
  }
  onKeyDown(event: KeyboardEvent): void {
    console.log('onKeyDown', {key: event.key, altKey: event.altKey, ctrlKey: event.ctrlKey, metaKey: event.metaKey});
    console.log('this.moveByText', this.moveByText);
    this.storeRange();
    if (!this.range) {
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
    if (this.range) {
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
        // if (HtmlRules.isBlockTag(tag)) { TODO I don't remeber what it is
        //   res.block = tag;
        // }
        if (HtmlRules.isPhrasing(SNode.elementNode(tag))) {
          res[tag + 'Tag'] = true;
        }
        e = e.parentElement;
      }
      this.toolbar.updateToolbar(res);
    }
  }
  // private newModification(range: Range): AddModification {
  //   const r = range.cloneRange();
  //   let p = LibPosition.normalizePoint(r.startContainer, r.startOffset);
  //   r.setStart(p.n, p.offset);
  //   p = LibPosition.normalizePoint(r.endContainer, r.endOffset);
  //   r.setEnd(p.n, p.offset);
  //   return new AddModification(this.editor, this.parser, r, DESIGNER_ATTR_NAME, () => this.designIndex++,
  //     (rg: Range, st: number, en: number, s: string) => this.update(rg, st, en, s));
  // }
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
  private deleteRange(): void {
    if (this.range) {
      const start = this.toSNode(this.range.start.positionToNode(this.parser.root));
      const end = this.toSNode(this.range.end.positionToNode(this.parser.root));
      const iter = new SNodeIterator(this.parser.root, start);
      if (start.typeNode === Node.TEXT_NODE) {
        start.setText(start.getText(this.parser.source).substring(0, this.range.start.offset));
      } else {
        start.delete();
      }
      for (const w of iter) {
        const p = this.toSNode(w);
        if (p.equal(end)) {
          if (end.typeNode === Node.TEXT_NODE) {
            end.setText(end.getText(this.parser.source).substring(this.range.end.offset));
          } else {
            end.delete();
          }
          break;
        }
      }
    }
  }
  private phrasing(tag: string, attr?: {[key: string]: string}): void {
    const commonAncestor = this.toSNode(this.range.commonAncestor);
    let update = commonAncestor;
    let split = null;
    if (this.range.commonAncestor.typeNode === Node.TEXT_NODE) {
      if (NodeWrapper.isDescOf(commonAncestor, tag)) {
        split = SNode.splitBranch(tag, commonAncestor, this.range.end.offset, this.parser.root, this.parser.source, commonAncestor, true, (a) => this.copyAttr(a));
        if (split.crossed) {
          update = split.topNode;
        }
        SNode.splitBranch(tag, commonAncestor, this.range.start.offset, this.parser.root, this.parser.source, commonAncestor, true, (a) => this.copyAttr(a));
      } else {
        const text = commonAncestor.getText(this.parser.source);
        commonAncestor.setText(text.substring(0, this.range.start.offset));
        commonAncestor.parent.newChild(SNode.elementNode(tag, this.copyAttr(attr)).setText(text.substring(this.range.start.offset, this.range.end.offset)), commonAncestor.index + 1);
        commonAncestor.parent.newChild(SNode.textNode(text.substring(this.range.end.offset)), commonAncestor.index + 2);
      }
    } else {
      if (this.range.collapsed) {
        console.error('WTF!!! Why the range is collapsed and doesn\'t place in text node');
        return;
      }
      // collect info to make decision. Define invert only by start position
      // I need to find the range that I need to modify. Then I'll clean that range from other element with the same tag
      // So I split this tree on three branches
      let w = this.toSNode(this.range.start.n);
      if (w.typeNode === Node.ELEMENT_NODE) {
        w = w.children[this.range.start.offset];
      }
      let e = this.toSNode(this.range.end.n);
      if (e.typeNode === Node.ELEMENT_NODE) {
        e = e.children[this.range.end.offset];
      }
      const invert = w.nodeName === tag || NodeWrapper.isDescOf(w, tag);
      if (invert && (e.nodeName === tag || NodeWrapper.isDescOf(e, tag))) {
        split = SNode.splitBranch(tag, w, this.range.start.offset, this.parser.root, this.parser.source, commonAncestor, true, (a) => this.copyAttr(a));
        if (split.crossed) {
          update = split.topNode;
        }
      }
      if (invert) {
        SNode.splitBranch(tag, w, this.range.start.offset, this.parser.root, this.parser.source, commonAncestor, false, (a) => this.copyAttr(a));
      }
      treeWalker(w, (k) => {
        if (e.equal(k)) {
          return true;
        }
        if (invert) {
          if (k.nodeName === tag) {
            (k as SNode).extractChildren();
          }
        } else {
          if (k.typeNode === Node.TEXT_NODE && !NodeWrapper.isDescOf(k, tag)) {
            (k as SNode).wrapThis(SNode.elementNode(tag, this.copyAttr(attr)));
          }
        }
      }, () => null, this.parser.root);
    }
    const n = this.toHtmlWrapper(update);
    (n.original as HTMLElement).innerHTML = this.toSNode(update).newSource(this.parser.source);
    this.collapse('start');
  }
  private sectioning(tag: string, attr?: {[key: string]: string}, invert = false): void {
    let wrap = this.findWithParentCntFlow(this.range.commonAncestor);
    if (wrap) {
      if (HtmlRules.isSectioning(wrap)) {
        wrap.replace(tag, attr);
      } else {
        if (wrap.equal(this.range.commonAncestor)) {
          wrap = wrap.wrapChildren(SNode.elementNode(tag, this.copyAttr(attr)), this.range.indexStart, this.range.indexEnd + 1);
        } else {
          wrap = wrap.wrapChildren(SNode.elementNode(tag, this.copyAttr(attr)));
        }
        let err: string = null;
        treeWalker(wrap, (k) => {
          if (k.nodeName === 'main') {
            err = `The element ${k.nodeName} cannot we wrapping. Expected Phrasing content`;
            return true;
          }
        });
        if (err) {
          console.log(err); // TODO Say about this
          return;
        }
      }
      const n = this.toHtmlWrapper(wrap);
      (n.original as HTMLElement).innerHTML = this.toSNode(wrap).newSource(this.parser.source);
      this.collapse('start');
    }
  }
  private sectioningRoot(tag: string, attr?: {[key: string]: string}, invert = false): void {
    let wrap = this.findWithParentCntFlow(this.range.commonAncestor);
    if (wrap) {
      if (HtmlRules.isSectionRoot(wrap)) {
        wrap.replace(tag, attr);
      } else {
        if (wrap.equal(this.range.commonAncestor)) {
          wrap = wrap.wrapChildren(SNode.elementNode(tag, this.copyAttr(attr)), this.range.indexStart, this.range.indexEnd + 1);
        } else {
          wrap = wrap.wrapChildren(SNode.elementNode(tag, this.copyAttr(attr)));
        }
        let err: string = null;
        treeWalker(wrap, (k) => {
          if (!HtmlRules.isSectioning(k)) {
            err = `The element ${k.nodeName} cannot we wrapping. Expected Phrasing content`;
            return true;
          }
        });
        if (err) {
          console.log(err); // TODO Say about this
          return;
        }
      }
      const n = this.toHtmlWrapper(wrap);
      (n.original as HTMLElement).innerHTML = this.toSNode(wrap).newSource(this.parser.source);
      this.collapse('start');
    }
  }
  private heading(tag: string, attr?: {[key: string]: string}): void {
    let wrap = this.findWithParentCntFlow(this.range.commonAncestor);
    if (wrap) {
      if (HtmlRules.isHeading(wrap)) {
        wrap.replace(tag, attr);
      } else {
        if (wrap.equal(this.range.commonAncestor)) {
          wrap = wrap.wrapChildren(SNode.elementNode(tag, this.copyAttr(attr)), this.range.indexStart, this.range.indexEnd + 1);
        } else {
          wrap = wrap.wrapChildren(SNode.elementNode(tag, this.copyAttr(attr)));
        }
        let err: string = null;
        treeWalker(wrap, (k) => {
          if (!HtmlRules.isPhrasing(k)) {
            err = `The element ${k.nodeName} cannot we wrapping. Expected Phrasing content`;
            return true;
          }
        });
        if (err) {
          console.log(err); // TODO Say about this
          return;
        }
      }
      const n = this.toHtmlWrapper(wrap);
      (n.original as HTMLElement).innerHTML = this.toSNode(wrap).newSource(this.parser.source);
      this.collapse('start');
    }
  }
  private void(tag: string, attr?: {[key: string]: string}): void {
    const parent = this.range.commonAncestor;
    if (!this.range.collapsed) {
      this.deleteRange();
    }
    const w = this.toSNode(this.range.start.n);
    if (w.typeNode === Node.TEXT_NODE) {
      const text = w.getText(this.parser.source);
      w.setText(text.substring(0, this.range.start.offset));
      w.parent.newChild(SNode.elementNode(tag, this.copyAttr(attr)), w.index + 1);
      w.parent.newChild(SNode.textNode(text.substring(this.range.start.offset)), w.index + 2);
      this.range.start.n = this.range.start.n.parent;
      this.range.start.offset += 2;
    } else {
      w.newChild(SNode.elementNode(tag, this.copyAttr(attr)), this.range.start.offset);
      this.range.start.offset += 1;
    }
    const n = this.toHtmlWrapper(parent);
    (n.original as HTMLElement).innerHTML = this.toSNode(parent).newSource(this.parser.source);
    this.collapse('start');
  }
  private nextMark(): string { return '' + this.designIndex++; }
  private findWithParentCntFlow(w: NodeWrapper): SNode {
    if (w.parent) {
      while (!HtmlRules.elements[w.parent.nodeName]
      && !HtmlRules.elements[w.parent.nodeName][1]
      && !HtmlRules.elements[w.parent.nodeName][1].cnt
      && !HtmlRules.elements[w.parent.nodeName][1].cnt.includes('Flow')) {
        if (w.parent.attribute(DESIGNER_ATTR_NAME) === '0') {
          return this.toSNode(w);
        }
        w = w.parent;
      }
      return this.toSNode(w);
    }
  }
  private copyAttr(attr?: {[key: string]: string}): {[key: string]: string} {
    const res = Object.assign({}, attr || {});
    res[DESIGNER_ATTR_NAME] = this.nextMark();
    return res;
  }
  private insertPlugin(range: Range, tag: string, attr?: {[key: string]: string}, isPhrasing?: boolean): void {
    // TODO need to process isPhrasing
  }
  private whitespace(key: string): void {
    switch (key) {
      case 'Enter':
        this.void('br');
        break;
      case 'Tab':
        break;
    }
  }
  private editingKey(key: string): void {
    if (this.range) {
      switch (key) {
        case 'Backspace':
          if (this.range.collapsed) {
            if (this.range.start.n.typeNode === Node.TEXT_NODE && this.range.start.offset > 0) {
              this.range.start.offset -= 1;
            } else {
              this.range.start = this.nextUp(this.range.start, true);
            }
          }
          this.deleteRange();
          break;
        case 'Delete':
          if (this.range.collapsed) {
            if (this.range.end.n.typeNode === Node.TEXT_NODE && this.range.end.offset < this.toSNode(this.range.end.n).getText(this.parser.source).length) {
              this.range.end.offset += 1;
            } else {
              this.range.end = this.nextDown(this.range.end, true);
            }
          }
          this.deleteRange();
          break;
        case 'Insert':
          this.replaceChar = !this.replaceChar; // TODO process this parameter by changing this.range on one symbol
          break;
      }
    }
  }
  private simpleChar(key: string): void {
    let parent = this.range.commonAncestor;
    if (parent.typeNode === Node.TEXT_NODE) {
      // don't need validation
      const work = this.toSNode(parent);
      work.setText(work.getText(this.parser.source).substring(0, this.range.start.offset) + key + work.getText(this.parser.source).substring(this.range.end.offset));
      parent = parent.parent;
    } else {
      const work = this.toSNode(this.range.start.n);
      const offset = work.typeNode === Node.TEXT_NODE ? this.range.start.offset : undefined;
      let child;
      if (work.typeNode !== Node.TEXT_NODE) {
        const cnt = HtmlRules.contentOfNode(work);
        if (!cnt || !(cnt.cnt.includes('Flow') || cnt.cnt.includes('Phrasing'))) {
          // TODO say that there cannot be text
          return;
        }
        child = work.child(this.range.start.offset);
        if (child && child.typeNode !== Node.TEXT_NODE && work.child(this.range.start.offset - 1) && work.child(this.range.start.offset - 1).typeNode === Node.TEXT_NODE) {
          child = work.child(this.range.start.offset - 1);
        }
      } else {
        child = work;
      }
      if (!this.range.collapsed) {
        this.deleteRange();
      }
      if (child && child.typeNode === Node.TEXT_NODE) {
        child.setText(child.getText(this.parser.source).substring(0, offset) + key);
      } else {
        work.newChild(SNode.textNode(key), this.range.start.offset);
      }
    }
    const n = this.toHtmlWrapper(parent);
    (n.original as HTMLElement).innerHTML = this.toSNode(parent).newSource(this.parser.source);
    this.collapse('start');
  }
  private collapse(where: 'commonAncestor' | 'start' | 'end'): void {
    if (this.range) {
      let w: SPosition;
      switch (where) {
        case 'commonAncestor':
          w = this.findPalpable(this.toHtmlWrapper(this.range.commonAncestor).original, 0);
          break;
        case 'start':
          w = this.findPalpable(this.toHtmlWrapper(this.range.start.n).original, this.range.start.offset);
          break;
        case 'end':
          w = this.findPalpable(this.toHtmlWrapper(this.range.end.n).original, this.range.end.offset);
          break;
      }
      window.getSelection().collapse(this.toHtmlWrapper(w.n).original, w.offset);
    }
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
    if (!this.range) {
      this.clearRange();
    } else {
      e.preventDefault();
    }
  }
  defineRange(e: DragEvent): Range {
    function shift(x: number, y: number, rect: DOMRect): number {
      return Math.min(Math.abs(x - rect.right), Math.abs(x - rect.left))
        + Math.min(Math.abs(y - rect.top), Math.abs(y - rect.bottom));
    }
    const cx = e.clientX;
    const cy = e.clientY;
    const n = e.target as Node;
    const r = this._document.createRange();
    r.selectNodeContents(e.target as Node);
    if (LibNode.getAttribute(n, DESIGNER_ATTR_NAME)) {
      if (n.nodeType === Node.TEXT_NODE) {
        let calc = Number.MAX_SAFE_INTEGER;
        let offset = 0;
        for (let i = 0; i < n.textContent.length; ++i) {
          r.setStart(n, i);
          r.setEnd(n, i);
          const c = shift(cx, cy, r.getBoundingClientRect());
          if (calc > c) {
            calc = c;
            offset = i;
          }
        }
        r.setStart(n, offset); r.setEnd(n, offset);
        return r;
      } else {
        console.log(`defineRange cx: ${cx}, cy: ${cy}`);
      }
    }
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
  private startPosition(): void {
    const root = new HtmlWrapper(this.editor);
    if (root.numChildren === 0) {
      window.getSelection().collapse(this.editor, 0);
    }
    const sp = this.findPalpable(this.editor, 0);
    if (sp) {
      window.getSelection().collapse(this.toHtmlWrapper(sp.n).original, sp.offset);
    }
    window.getSelection().collapse(this.editor, this.editor.childNodes.length);
  }
  private storeRange(): void {
    if (window.getSelection().rangeCount === 1) {
      this.lastRange = window.getSelection().getRangeAt(0);
      this.focusNode = window.getSelection().focusNode;
      this.range = this.validateRange(window.getSelection().getRangeAt(0));
    } else {
      this.clearRange();
    }
  }
  private clearRange(): void {
    this.lastRange = null;
    this.focusNode = null;
    this.range = null;
  }
  private toSNode(w: NodeWrapper): SNode {
    if (w instanceof HtmlWrapper) {
      const a = w.attribute(DESIGNER_ATTR_NAME);
      if (a) {
        const sn = this.parser.findSNode(DESIGNER_ATTR_NAME, a);
        if (w.typeNode === Node.TEXT_NODE) {
          return sn.children[LibNode.orderOfChild((w.parent as HtmlWrapper).original, w.original)];
        }
        return sn;
      }
    }
    return w as SNode;
  }
  private toHtmlWrapper(w: NodeWrapper): HtmlWrapper {
    if (w instanceof SNode) {
      if (w.typeNode === Node.TEXT_NODE) {
        const n = this.findDesignElement(w.attribute(DESIGNER_ATTR_NAME));
        return new HtmlWrapper(n.children.item(w.index));
      }
      return new HtmlWrapper(this.findDesignElement(w.attribute(DESIGNER_ATTR_NAME)));
    }
    return w as HtmlWrapper;
  }
  private restoreRange(): void {
    if (this.focusNode) {
      window.getSelection().collapse(this.focusNode,
        this.focusNode === this.lastRange.startContainer ? this.lastRange.startOffset : this.lastRange.endOffset);
    }
  }
  private isAncestor(child: Node): boolean {
    // tslint:disable-next-line:no-bitwise
    return this.editor === child || (this.editor.compareDocumentPosition(child) & Node.DOCUMENT_POSITION_CONTAINED_BY) !== 0;
  }
  private validateRange(range: Range): SRange {
    if (this.focusNode && this.isAncestor(range.commonAncestorContainer)) {
      let ca = range.commonAncestorContainer;
      while (!LibNode.getAttribute(range.commonAncestorContainer, DESIGNER_ATTR_NAME)) {
        ca = ca.parentElement;
      }
      const st = this.findPalpable(range.startContainer, range.startOffset);
      const en = this.findPalpable(range.endContainer, range.endOffset, true);
      if (ca && st && en) {
        return new SRange(this.toSNode(new HtmlWrapper(ca)), st, en, range.collapsed);
      }
    }
    return null;
  }
  private findDesignElement(id: string): HTMLElement {
    if (id === '0') {
      return this.editor;
    }
    return this.editor.querySelector(`[${DESIGNER_ATTR_NAME}="${id}"]`);
  }
  private moveNext(n: Node, offset: number, stepText = true): void {
    if (n.nodeType === Node.TEXT_NODE && offset < n.textContent.length) {
      window.getSelection().collapse(n, offset + 1);
    }
    SPosition.collapseTo(this.nextDown(new SPosition(new HtmlWrapper(n), offset), stepText));
  }
  private movePrev(n: Node, offset: number, stepText = true): void {
    if (n.nodeType === Node.TEXT_NODE && offset > 0) {
      window.getSelection().collapse(n, offset - 1);
    }
    SPosition.collapseTo(this.nextUp(new SPosition(new HtmlWrapper(n), offset), stepText));
  }
  private nextDown(p: SPosition, stepText = true): SPosition {
    return SPosition.findPosition(new HtmlWrapper(this.editor), p, editorNode(stepText), true);
  }
  private nextUp(p: SPosition, stepText = true): SPosition {
    return SPosition.findPosition(new HtmlWrapper(this.editor), p, editorNode(stepText), false);
  }
  private findPalpable(container: Node, offset: number, revert = false): SPosition {
    function sp(w: SNode): SPosition {
      const cnt = HtmlRules.contentOfNode(p);
      if (cnt && (cnt.cnt.includes('Flow') || cnt.cnt.includes('Phrasing'))) {
        return new SPosition(w, 0);
      }
      return new SPosition(w.parent, w.index);
    }
    const p = new HtmlWrapper(LibNode.nodeOfPoints(container, offset));
    if (p.attribute(DESIGNER_ATTR_NAME) && HtmlRules.isPalpable(p)) {
      return sp(this.toSNode(p));
    }
    const iter = new SNodeIterator(this.parser.root, this.toSNode(p), revert);
    for (const n of iter) {
      if (n.attribute(DESIGNER_ATTR_NAME) && HtmlRules.isPalpable(n)) {
        return sp(this.toSNode(n));
      }
    }
    return null;
  }
}
function editorNode(stepText: boolean): (p: SPosition) => SPosition {
  return (c) => {
    if (c && c.n.attribute(DESIGNER_ATTR_NAME)
      && ((stepText && c.n.typeNode === Node.TEXT_NODE) || !stepText)) {
      return c;
    }
  };
}

