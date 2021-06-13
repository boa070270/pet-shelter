import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  SecurityContext,
  ViewChild
} from '@angular/core';
import {SlideContainerDirective} from '../controls';
import {CmdEditorToolbox, EditorToolbarComponent} from './editor-toolbar.component';
import {fromEvent, Observable, Subscription} from 'rxjs';
import {
  ComponentsPluginService,
  ExtendedData,
  HtmlRules,
  HtmlWrapper,
  LibNode,
  NodeWrapper,
  RangePosition,
  SimpleParser,
  SNode,
  SNodeIterator,
  SPosition,
  SRange,
  SwaggerNative,
  SwaggerObject,
  treeWalker
} from '../shared';
// import {AddModification} from './add-modification';
import {CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragSortEvent, CdkDropList} from '@angular/cdk/drag-drop';
import {DOCUMENT} from '@angular/common';
import {DialogService} from '../dialog-service';
import {map} from 'rxjs/operators';
import {DomSanitizer} from '@angular/platform-browser';

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
interface PasteData {
  type: string; // mime type
  data: any;
}
@Component({
  selector: 'lib-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy, AfterViewInit {
  set source(s: string) {
    this.parser.parse(this.checkAndMarkElements(s));
  }
  get source(): string {
    return this.parser ? this.parser.source : '';
  }
  constructor(@Inject(DOCUMENT) private _document: Document, private dialogService: DialogService, private pluginService: ComponentsPluginService,
              private sanitizer: DomSanitizer) { }
  position = 0;
  private readonly parser = new SimpleParser('', DESIGNER_ATTR_NAME);
  private replaceChar = false;
  designIndex = 1;
  editor: HTMLDivElement;
  // @Deprecated
  lastRange: Range;
  // @Deprecated
  private focusNode: 'start' | 'end';
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
  protected static findWithParentCntFlow(w: SNode): SNode {
    if (w.parent) {
      while (!HtmlRules.elements[w.parent.nodeName]
      && !HtmlRules.elements[w.parent.nodeName][1]
      && !HtmlRules.elements[w.parent.nodeName][1].cnt
      && !HtmlRules.elements[w.parent.nodeName][1].cnt.includes('Flow')) {
        if (w.parent.attribute(DESIGNER_ATTR_NAME) === '0') {
          return w;
        }
        w = w.parent;
      }
      return w;
    }
  }
  protected static sNodeId(sn: SNode): string {
    return sn.typeNode === Node.ELEMENT_NODE ? sn.attribute(DESIGNER_ATTR_NAME) : sn.parent.attribute(DESIGNER_ATTR_NAME);
  }
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
  ngAfterViewInit(): void {
    // this.editor.addEventListener('paste', async (e) => { await this.paste(e.clipboardData, false); });
    fromEvent<ClipboardEvent>(this.editor, 'paste', {capture: true}).pipe(
      map(e => e.clipboardData),
      (d) => this.paste(d)
    ).subscribe(d => {
      console.log(d);
      this.processPasteData(d);
    });
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
    if (this.range) {
      const insertParentModel = HtmlRules.elements[tag][0];
      const insertModel = HtmlRules.elements[tag][1];
      const focus = this.focusNode === 'start' ? this.range.start.sNode : this.range.end.sNode;
      const focusParentModel = focus.parent ? HtmlRules.elements[focus.parent.nodeName][1] : HtmlRules.elements[focus.nodeName][1];
      const focusModel = focus.typeNode === Node.ELEMENT_NODE ? HtmlRules.elements[focus.nodeName][1] : null;
      const n = SNode.elementNode(tag, attr);
      if (insertModel.cnt) {
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
  }
  private updateDesigner(): void {
    if (this._sourceModified) {
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
    console.log('onKeyDown', {target: event.target, key: event.key, altKey: event.altKey, ctrlKey: event.ctrlKey, metaKey: event.metaKey});
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
    e.preventDefault();
  }
  onPaste(event: ClipboardEvent): void {
    console.log('onPaste', event);
    event.preventDefault();
  }
  private paste(dataTransfer: Observable<DataTransfer>): Observable<PasteData> {
    return new Observable<any>(subscriber => {
      dataTransfer.subscribe((dt) => {
        const choice: string[] = [];
        const allData = {}; // WTF? there have to be another way
        for (const t of dt.types) {
          if (t === 'text/plain' || t === 'text/html') {
            choice.push(t);
            allData[t] = dt.getData(t);
          } else {
            if (t === 'Files') {
              // process files
            } else {
              // process as files
            }
          }
        }
        if (choice.length > 0) {
          const extData = ExtendedData.create({}, false, new SwaggerObject(['select'], {
            select: SwaggerNative.asString(null, {enum: choice as string[]})
          }, null, null, null, null), 'ok_cancel', 'Paste', 'gm-paste', 'info-color', null);
          const ref = this.dialogService.infoExtDialog(extData, true);
          ref.afterClosed().subscribe(v => {
            if (typeof v === 'object' && v !== null) {
              subscriber.next({type: v.select, data: allData[v.select]});
            }
            subscriber.complete();
          });
        } else if (choice[0]) {
          subscriber.next({type: choice[0], data: dt.getData(choice[0])});
          subscriber.complete();
        }
      });
    });
  }
  private processPasteData(pd: PasteData): void {
      if (pd.type === 'text/plain') {
        this.simpleChar(pd.data);
      } else if (pd.type === 'text/html') {
        if (this.range) {
          this.startEditing();
          try {
            let sn = this.focusNode === 'start' ? this.range.start.sNode : this.range.end.sNode;
            if (sn.typeNode === Node.TEXT_NODE) {
              sn = sn.parent;
            }
            const p = new SimpleParser(this.sanitizer.sanitize(SecurityContext.HTML, pd.data), DESIGNER_ATTR_NAME);
            console.log(p.errors);
            const n = p.root.wrapChildren(SNode.elementNode('div', this.copyAttr({})));
            sn.newChild(n, sn.index);
            this.update(sn.attribute(DESIGNER_ATTR_NAME));
            this.collapse(null, new SPosition(n.parent, n.index));
          } catch (e) {
            console.log(e);
            this.cancelEditing();
          }
        }
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
  private updateToolbar(): void {
    if (this.focusNode) {
      const res: any = {};
      let e: Node = LibNode.nodeOfPosition(this.focusPosition());
      if (e.nodeType !== Node.ELEMENT_NODE) {
        e = e.parentElement;
      }
      const cs = window.getComputedStyle(e as HTMLElement);
      res.fSize = cs.getPropertyValue('font-size');
      while (e !== this.editor) {
        const tag = e.nodeName.toLowerCase();
        if (HtmlRules.isPhrasing(SNode.elementNode(tag))) {
          res[tag + 'Tag'] = true;
        }
        e = e.parentElement;
      }
      this.toolbar.updateToolbar(res);
    }
  }
  private focusPosition(): RangePosition {
    if (this.focusNode) {
      return this.focusNode === 'start' ? {n: this.lastRange.startContainer, offset: this.lastRange.startOffset}
        : {n: this.lastRange.endContainer, offset: this.lastRange.endOffset};
    }
  }
  private startPosition(): void {
    if (!this.editor.hasChildNodes()) {
      window.getSelection().collapse(this.editor, 0);
    }
    const rp = this.findPalpable(this.editor, 0);
    if (rp) {
      this.collapse(null, this.toSPosition(rp));
    }
    window.getSelection().collapse(this.editor, this.editor.childNodes.length);
  }
  private storeRange(): void {
    if (window.getSelection().rangeCount === 1) {
      const range = window.getSelection().getRangeAt(0).cloneRange();
      if (this.isAncestor(range.commonAncestorContainer)) {
        const st = this.findPalpable(range.startContainer, range.startOffset);
        const en = this.findPalpable(range.endContainer, range.endOffset, true);
        if (st && en) {
          this.focusNode = (window.getSelection().focusNode === LibNode.nodeOfPoints(range.startContainer, range.startOffset)) ? 'start' : 'end';
          range.setStart(st.n, st.offset);
          range.setEnd(en.n, en.offset);
          this.lastRange = range;
          window.getSelection().removeAllRanges();
          window.getSelection().addRange(range);
          let ca = range.commonAncestorContainer;
          while (!LibNode.getAttribute(range.commonAncestorContainer, DESIGNER_ATTR_NAME)) {
            ca = ca.parentElement;
          }
          this.range = new SRange(this.toSNode(ca), new SPosition(this.toSNode(st.n), st.offset), new SPosition(this.toSNode(en.n), en.offset), range.collapsed);
          return;
        }
      }
    }
    this.clearRange();
  }
  private restoreRange(): void {
    if (this.focusNode) {
      const rp = this.focusPosition();
      window.getSelection().collapse(rp.n, rp.offset);
    }
  }
  private startEditing(): void {
    if (this.range) {
      if (!this.parser.isEditing()) {
        this.range.commonAncestor = this.parser.mapToClone(this.range.commonAncestor);
        this.range.start.n = this.parser.mapToClone(this.range.start.n);
        this.range.end.n = this.parser.mapToClone(this.range.end.n);
      }
    }
  }
  private cancelEditing(): void {
    this.parser.rollback();
    this.clearRange();
  }
  private update(mark: string): void {
    this.parser.commit();
    const w = this.parser.findSNode(DESIGNER_ATTR_NAME, mark);
    let n: HTMLElement;
    if (w.typeNode === Node.TEXT_NODE) {
      n = this.findDesignElement(w.parent.attribute(DESIGNER_ATTR_NAME));
    } else {
      n = this.findDesignElement(w.attribute(DESIGNER_ATTR_NAME));
    }
    n.innerHTML = w.source(true);
    this.range.commonAncestor = this.parser.mapToClone(this.range.commonAncestor, this.parser.root);
    this.range.start.n = this.parser.mapToClone(this.range.start.n, this.parser.root);
    this.range.end.n = this.parser.mapToClone(this.range.end.n, this.parser.root);
  }
  private collapse(where: 'commonAncestor' | 'start' | 'end', sp?: SPosition): void {
    if (sp) {
      let n: HTMLElement;
      if (sp.n.typeNode === Node.TEXT_NODE) {
        n = this.findDesignElement(sp.n.parent.attribute(DESIGNER_ATTR_NAME));
        if (n.childNodes.item(sp.n.index)) {
          window.getSelection().collapse(n.childNodes.item(sp.n.index), sp.offset);
        } else {
          if (n.hasChildNodes()) {
            window.getSelection().collapse(n, n.childNodes.length);
          } else {
            window.getSelection().collapse(n, 0);
          }
        }
      } else {
        n = this.findDesignElement(sp.n.attribute(DESIGNER_ATTR_NAME));
        window.getSelection().collapse(n, sp.offset);
      }
    } else if (this.range) {
      let w: RangePosition;
      switch (where) {
        case 'commonAncestor':
          w = this.findPalpable(this.toNode(this.range.commonAncestor), 0);
          break;
        case 'start':
          w = this.toPosition(this.range.start);
          w = this.findPalpable(w.n, w.offset) || w;
          break;
        case 'end':
          w = this.toPosition(this.range.end);
          w = this.findPalpable(w.n, w.offset, true) || w;
          break;
      }
      this.collapse(null, this.toSPosition(w));
    }
    this.storeRange();
  }
  private deleteRange(inTransaction = false): void {
    if (this.range) {
      try {
        this.startEditing();
        const start = this.range.start;
        const end = this.range.end;
        if (start.sNode.equal(end.sNode) && start.offset === end.offset) {
          if (!inTransaction) {
            this.cancelEditing();
          }
          return;
        }
        if (start.n.equal(end.n)) {
          const sn = start.sNode;
          sn.setText(sn.getText().substring(0, this.range.start.offset) + sn.getText().substring(this.range.end.offset));
        } else {
          const sn = start.sNode;
          const en = end.sNode;
          if (start.n.typeNode === Node.TEXT_NODE) {
            sn.setText(sn.getText().substring(0, this.range.start.offset));
          } else {
            sn.delete();
            this.range.start = new SPosition(sn.parent, Math.max(0, sn.index - 1));
          }
          if (end.n.typeNode === Node.TEXT_NODE) {
            en.setText(en.getText().substring(this.range.end.offset));
          } else {
            // en.delete(); we are positioned before
          }
          const from: SNode = sn.nextNode(this.parser.cloneRoot());
          if (from) {
            treeWalker<SNode>(from, (n) => n === en, (n) => n.delete(), this.parser.cloneRoot());
          }
        }
        if (inTransaction) {
          return;
        }
        this.update(EditorComponent.sNodeId(this.range.commonAncestor.isRoot ? this.range.commonAncestor : this.range.commonAncestor.parent));
        this.collapse('start');
      } catch (e) {
        console.log(e);
        if (inTransaction) {
          throw e;
        }
        this.cancelEditing();
      }
    }
  }
  private phrasing(tag: string, attr?: {[key: string]: string}): void {
    try {
      this.startEditing();
      const commonAncestor = this.range.commonAncestor;
      let update = commonAncestor;
      let split = null;
      if (this.range.commonAncestor.typeNode === Node.TEXT_NODE) {
        if (NodeWrapper.isDescOf(commonAncestor, tag)) {
          split = SNode.splitBranch(tag, commonAncestor, this.range.end.offset, this.parser.cloneRoot(), commonAncestor, true, (a) => this.copyAttr(a));
          if (split.crossed) {
            update = split.topNode;
          }
          SNode.splitBranch(tag, commonAncestor, this.range.start.offset, this.parser.cloneRoot(), commonAncestor, true, (a) => this.copyAttr(a));
        } else {
          const text = commonAncestor.getText();
          commonAncestor.setText(text.substring(0, this.range.start.offset));
          commonAncestor.parent.newChild(SNode.elementNode(tag, this.copyAttr(attr)).setText(text.substring(this.range.start.offset, this.range.end.offset)), commonAncestor.index + 1);
          commonAncestor.parent.newChild(SNode.textNode(text.substring(this.range.end.offset)), commonAncestor.index + 2);
        }
      } else {
        if (this.range.collapsed) {
          console.error('WTF!!! Why the range is collapsed and doesn\'t place in text node');
          this.cancelEditing();
          return;
        }
        // collect info to make decision. Define invert only by start position
        // I need to find the range that I need to modify. Then I'll clean that range from other element with the same tag
        // So I split this tree on three branches
        let w = this.range.start.sNode;
        if (w.typeNode === Node.ELEMENT_NODE) {
          w = w.child(this.range.start.offset);
        }
        let e = this.range.end.sNode;
        if (e.typeNode === Node.ELEMENT_NODE) {
          e = e.child(this.range.end.offset);
        }
        const invert = w.nodeName === tag || NodeWrapper.isDescOf(w, tag);
        if (invert && (e.nodeName === tag || NodeWrapper.isDescOf(e, tag))) {
          split = SNode.splitBranch(tag, w, this.range.start.offset, this.parser.cloneRoot(), commonAncestor, true, (a) => this.copyAttr(a));
          if (split.crossed) {
            update = split.topNode;
          }
        }
        if (invert) {
          SNode.splitBranch(tag, w, this.range.start.offset, this.parser.cloneRoot(), commonAncestor, false, (a) => this.copyAttr(a));
        }
        treeWalker(w, (k) => {
          if (e.equal(k)) {
            return true;
          }
          if (invert) {
            if (k.nodeName === tag) {
              k.extractChildren();
            }
          } else {
            if (k.typeNode === Node.TEXT_NODE && !NodeWrapper.isDescOf(k, tag)) {
              k.wrapThis(SNode.elementNode(tag, this.copyAttr(attr)));
            }
          }
        }, () => null, this.parser.cloneRoot());
      }
      this.update(EditorComponent.sNodeId(update));
      this.collapse('start');
    } catch (e) {
      console.log(e);
      this.cancelEditing();
    }
  }
  private sectioning(tag: string, attr?: {[key: string]: string}, invert = false): void {
    try {
      this.startEditing();
      let wrap = EditorComponent.findWithParentCntFlow(this.range.commonAncestor);
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
        treeWalker(wrap.nextNode(wrap), (k) => {
          if (k.nodeName === 'main') {
            err = `The element ${k.nodeName} cannot we wrapping. Expected Phrasing content`;
            return true;
          }
        });
        wrap.validate(); wrap.parent.validate();
        if (err || wrap.errors.length > 0 || wrap.parent.errors.length > 0) {
          console.log(err); // TODO Say about this
          this.cancelEditing();
          return;
        }
      }
      this.update(EditorComponent.sNodeId(wrap.parent));
      this.collapse('start');
    }
    } catch (e) {
      console.log(e);
      this.cancelEditing();
    }
  }
  private grouping(tag: string, attr?: {[key: string]: string}, invert = false): void {
    try {
      this.startEditing();
      let wrap = EditorComponent.findWithParentCntFlow(this.range.commonAncestor);
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
          treeWalker(wrap.nextNode(wrap), (k) => {
            if (k.nodeName === 'main') {
              err = `The element ${k.nodeName} cannot we wrapping. Expected Phrasing content`;
              return true;
            }
          });
          wrap.validate(); wrap.parent.validate();
          if (err || wrap.errors.length > 0 || wrap.parent.errors.length > 0) {
            console.log(err); // TODO Say about this
            this.cancelEditing();
            return;
          }
        }
        this.update(EditorComponent.sNodeId(wrap.parent));
        this.collapse('start');
      }
    } catch (e) {
      console.log(e);
      this.cancelEditing();
    }
  }
  private sectioningRoot(tag: string, attr?: {[key: string]: string}, invert = false): void {
    try {
      this.startEditing();
      let wrap = EditorComponent.findWithParentCntFlow(this.range.commonAncestor);
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
        treeWalker(wrap.nextNode(wrap), (k) => {
          if (!HtmlRules.isSectioning(k)) {
            err = `The element ${k.nodeName} cannot we wrapping. Expected Phrasing content`;
            return true;
          }
        });
        wrap.validate(); wrap.parent.validate();
        if (err || wrap.errors.length > 0 || wrap.parent.errors.length > 0) {
          console.log(err); // TODO Say about this
          this.cancelEditing();
          return;
        }
      }
      this.update(EditorComponent.sNodeId(wrap.parent));
      this.collapse('start');
    }
    } catch (e) {
      console.log(e);
      this.cancelEditing();
    }
  }
  private heading(tag: string, attr?: {[key: string]: string}): void {
    try {
      this.startEditing();
      let wrap = EditorComponent.findWithParentCntFlow(this.range.commonAncestor);
      if (wrap) {
      if (HtmlRules.isHeading(wrap)) {
        wrap.replace(tag, attr);
      } else {
        if (wrap.equal(this.range.commonAncestor)) {
          if (wrap.typeNode === Node.TEXT_NODE) {
            wrap = wrap.wrapThis(SNode.elementNode(tag, this.copyAttr(attr)));
          } else {
            wrap = wrap.wrapChildren(SNode.elementNode(tag, this.copyAttr(attr)), this.range.indexStart, this.range.indexEnd + 1);
          }
        } else {
          wrap = wrap.wrapChildren(SNode.elementNode(tag, this.copyAttr(attr)));
        }
        let err: string = null;
        treeWalker(wrap.nextNode(wrap), (k) => {
          if (!HtmlRules.isPhrasing(k)) {
            err = `The element ${k.nodeName} cannot we wrapping. Expected Phrasing content`;
            return true;
          }
        });
        wrap.validate(); wrap.parent.validate();
        if (err || wrap.errors.length > 0 || wrap.parent.errors.length > 0) {
          console.log(err); // TODO Say about this
          this.cancelEditing();
          return;
        }
      }
      this.update(EditorComponent.sNodeId(wrap.parent));
      this.collapse('start');
    }
    } catch (e) {
      console.log(e);
      this.cancelEditing();
    }
  }
  private void(tag: string, attr?: {[key: string]: string}): void {
    try {
      this.startEditing();
      this.deleteRange(true);
      const w = this.range.start.sNode;
      let sp: SPosition;
      let n: SNode;
      if (w.typeNode === Node.TEXT_NODE) {
        const text = w.getText();
        if (this.range.start.offset < text.length) {
          w.setText(text.substring(0, this.range.start.offset));
          n = w.parent.newChild(SNode.elementNode(tag, this.copyAttr(attr)), w.index + 1);
          w.parent.newChild(SNode.textNode(text.substring(this.range.start.offset)), w.index + 2);
        } else {
          n = w.parent.newChild(SNode.elementNode(tag, this.copyAttr(attr)), w.index + 1);
        }
      } else {
        n = w.newChild(SNode.elementNode(tag, this.copyAttr(attr)), this.range.start.offset);
      }
      n.parent.validate();
      this.update(EditorComponent.sNodeId(n.parent));
      sp = new SPosition(n.parent, n.index + 1);
      this.collapse(null, sp);
    } catch (e) {
      console.log(e);
      this.cancelEditing();
    }
  }
  private simpleChar(key: string): void {
    try {
      this.startEditing();
      let parent = this.range.commonAncestor;
      let sp: SPosition;
      if (parent.typeNode === Node.TEXT_NODE) {
        // don't need validation
        const work = parent;
        work.setText(work.getText().substring(0, this.range.start.offset) + key + work.getText().substring(this.range.end.offset));
        sp = new SPosition(work, this.range.start.offset + key.length);
        parent = parent.parent;
      } else {
        const work = this.range.start.n;
        let offset = work.typeNode === Node.TEXT_NODE ? this.range.start.offset : 0;
        let child;
        if (work.typeNode !== Node.TEXT_NODE) {
          const cnt = HtmlRules.contentOfNode(work);
          if (!cnt || !(cnt.cnt.includes('Flow') || cnt.cnt.includes('Phrasing'))) {
            // TODO say that there cannot be text
            this.cancelEditing();
            return;
          }
          child = work.child(this.range.start.offset);
        } else {
          child = work;
        }
        this.deleteRange(true);
        if (child && child.typeNode === Node.TEXT_NODE) {
          child.setText(child.getText().substring(0, offset) + key);
          offset += key.length;
        } else {
          child = work.newChild(SNode.textNode(key), this.range.start.offset);
          offset = key.length;
        }
        sp = new SPosition(child, offset);
      }
      this.update(EditorComponent.sNodeId(parent));
      this.collapse(null, sp);
    } catch (e) {
      console.log(e);
      this.cancelEditing();
    }
  }
  private nextMark(): string { return '' + this.designIndex++; }
  private copyAttr(attr?: {[key: string]: string}): {[key: string]: string} {
    const res = Object.assign({}, attr || {});
    res[DESIGNER_ATTR_NAME] = this.nextMark();
    return res;
  }
  private insertPlugin(tag: string, attr?: {[key: string]: string}, isPhrasing?: boolean): void {
    try {
      this.startEditing();
    // TODO need to process isPhrasing
    } catch (e) {
      console.log(e);
      this.cancelEditing();
    }
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
    if (this.lastRange) {
      if (!this.lastRange.collapsed) {
        this.deleteRange();
      } else {
        switch (key) {
          case 'Backspace':
            if (this.range.start.n.typeNode === Node.TEXT_NODE && this.range.start.offset > 0) {
              this.range.start.offset -= 1;
            } else {
              const sp = this.parser.nextUp(this.range.start, true);
              if (sp) {
                this.range.start = sp;
              } else if (!this.range.start.n.isRoot) {
                this.range.start = new SPosition(this.range.start.n.parent, this.range.start.n.index);
              }
            }
            this.deleteRange();
            break;
          case 'Delete':
            if (this.range.end.n.typeNode === Node.TEXT_NODE && this.range.end.offset < this.range.end.n.getText().length) {
              this.range.end.offset += 1;
            } else {
              const sp = this.parser.nextDown(this.range.end, true);
              if (sp) {
                this.range.end = sp;
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
  }
  private toNode(s: SNode): HTMLElement {
    if (s.typeNode === Node.TEXT_NODE) {
      return this.findDesignElement(s.parent.attribute(DESIGNER_ATTR_NAME));
    } else {
      return this.findDesignElement(s.attribute(DESIGNER_ATTR_NAME));
    }
  }
  private toPosition(sp: SPosition): RangePosition {
    const n = this.toNode(sp.n);
    if (sp.n.typeNode === Node.TEXT_NODE) {
      if (n.childNodes.item(sp.n.index)) {
        return {n: n.childNodes.item(sp.n.index), offset: sp.offset};
      } else {
        if (n.hasChildNodes()) {
          return {n, offset: n.childNodes.length};
        } else {
          return {n, offset: 0};
        }
      }
    } else {
      return {n, offset: sp.offset};
    }
  }
  private toSPosition(rp: RangePosition): SPosition {
    return new SPosition(this.toSNode(rp.n), rp.offset);
  }
  private checkAndMarkElements(source: string): string {
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
    return upd;
  }
  private clearRange(): void {
    this.lastRange = null;
    this.focusNode = null;
    this.range = null;
  }
  private toSNode(w: Node): SNode {
    const a = LibNode.getAttribute(w, DESIGNER_ATTR_NAME);
    if (a) {
      const sn = this.parser.findSNode(DESIGNER_ATTR_NAME, a);
      if (w.nodeType === Node.TEXT_NODE) {
        return sn.child(LibNode.orderOfChild(w.parentNode, w));
      }
      return sn;
    }
  }
  private isAncestor(child: Node): boolean {
    // tslint:disable-next-line:no-bitwise
    return this.editor === child || (this.editor.compareDocumentPosition(child) & Node.DOCUMENT_POSITION_CONTAINED_BY) !== 0;
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
      return;
    }
    this.collapse(null, this.parser.nextDown(new SPosition(this.toSNode(n), offset), stepText));
  }
  private movePrev(n: Node, offset: number, stepText = true): void {
    if (n.nodeType === Node.TEXT_NODE && offset > 0) {
      window.getSelection().collapse(n, offset - 1);
      return;
    }
    this.collapse(null, this.parser.nextUp(new SPosition(this.toSNode(n), offset), stepText));
  }
  private findPalpable(container: Node, offset: number, revert = false): RangePosition {
    const w = new HtmlWrapper(container);
    if (w && HtmlRules.isPalpable(w)) {
      return {n: w.node, offset};
    }
    const start = this.toSNode(container);
    const iter = new SNodeIterator(this.parser.cloneRoot(), start, revert);
    for (const n of iter) {
      if (HtmlRules.isPalpable(n)) {
        return n.typeNode === Node.TEXT_NODE ?
          {n: this.toNode(n), offset: revert ? (n).getText().length : 0}
          : {n: this.toNode(n.parent), offset: n.index};
      }
    }
    return null;
  }

  gag(e: Event): void { e.preventDefault(); }
}

