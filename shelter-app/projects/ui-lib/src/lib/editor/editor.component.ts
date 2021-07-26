import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  SecurityContext,
  ViewChild
} from '@angular/core';
import {SlideContainerDirective} from '../controls';
import {CmdEditorToolbox, EditorToolbarComponent, SpecialElements} from './editor-toolbar.component';
import {fromEvent, Observable, Subscription} from 'rxjs';
import {
  Attributes,
  ComponentsPluginService,
  ExtendedData,
  HtmlRules,
  HtmlWrapper,
  LibNode,
  SimpleParser,
  SNode,
  SwaggerNative,
  SwaggerObject,
  SYSTEM_LANG_TOKEN,
  SystemLang
} from '../shared';
import {CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragSortEvent, CdkDropList} from '@angular/cdk/drag-drop';
import {DOCUMENT} from '@angular/common';
import {DialogService} from '../dialog-service';
import {map} from 'rxjs/operators';
import {DomSanitizer} from '@angular/platform-browser';
import {DEF_TEMPLATE} from './editor-store';

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
const VIEW_DESIGNER = 0;
const VIEW_SOURCE = 1;
const VIEW_HELP = 2;
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
  private _source = DEF_TEMPLATE;
  private _initParser = false;
  @Input()
  set source(s: string) {
    this._source = s;
    if (this._initParser) {
      this.parser.parse(this._source);
    }
  }
  get source(): string {
    return this.parser ? this.parser.source : '';
  }
  set showSlide(n: number) {
    this._slide = n;
    this.slide.to(this._slide);
  }
  private _slide = 0;
  position = 0;
  private parser = new SimpleParser(DESIGNER_ATTR_NAME);
  private replaceChar = false;
  designIndex = 1;
  editor: HTMLDivElement;
  _sourceModified = false;
  moveByText = true;
  rollback: Array<{parent: string, before: string, after: string}> = [];
  @ViewChild(CdkDropList, {static: true}) dropList: CdkDropList;
  @ViewChild('editor', {static: true}) editorRef: ElementRef<HTMLDivElement>;
  @ViewChild(EditorToolbarComponent, {static: true}) toolbar: EditorToolbarComponent;
  @ViewChild(SlideContainerDirective, {static: true}) slide: SlideContainerDirective;
  private subsTb: Subscription = null;
  constructor(@Inject(DOCUMENT) private _document: Document,
              private dialogService: DialogService,
              private pluginService: ComponentsPluginService,
              private sanitizer: DomSanitizer,
              @Inject(SYSTEM_LANG_TOKEN) private systemLang: SystemLang) { }
  getCdkDropList: () => CdkDropList = () => this.dropList;

  ngOnInit(): void {
    this.editor = this.editorRef.nativeElement;
    this.parser.editor = this.editor;
    this._initParser = true;
    this.parser.parse(this._source);
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
    this.dropList.entered.subscribe( (e: CdkDragEnter) => {
      console.log('editor:entered', e);
    });
    this.dropList.exited.subscribe( (e: CdkDragExit) => {
      console.log('editor:exited', e);
    });
    this.dropList.sorted.subscribe((e: CdkDragSortEvent) => {
      console.log('editor:sorted', e);
    });
    this.showDesigner();
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
    this.showDesigner();
  }
  private onToolbar(e: CmdEditorToolbox): void {
    console.log('onToolbar', e);
    try {
      switch (e.cmd) {
        case 'tag':
          this.addElement(e.opt.tag, e.opt.attr);
          break;
        case 'toList':
          break;
        case 'align':
          break;
        case 'clearFormat':
          this.parser.clearFormat();
          break;
        case 'insPlugin':
          break;
        case 'showDesigner':
          this.showDesigner();
          break;
        case 'showSource':
          this.showSlide = VIEW_SOURCE;
          break;
        case 'showHelp':
          this.showSlide = VIEW_HELP;
          break;
        case 'switchMove':
          this.moveByText = e.opt.moveByText;
          break;
        case 'save':
          break;
      }
    } catch (e) {
      this.dialogService.snakeError(e);
    }
  }
  showDesigner(): void {
    this.showSlide = VIEW_DESIGNER;
    this.parser.restorePosition();
  }
  private addElement(tag: string, attr: Attributes): void {
    const se = SpecialElements.findElement(tag);
    if (se) {
      const extData = ExtendedData.create({}, false, se.attr, 'save_cancel',
        this.systemLang.getTitle(se.description), 'dm_ask', 'info-color');
      const dRef = this.dialogService.infoExtDialog(extData);
      dRef.afterClosed().subscribe(d => {
        const at = Object.assign({}, attr, d);
        // wrap text in only one element or only one grouping element
        this.parser.addElement(tag, at);
      });
    } else {
      this.parser.addElement(tag, attr);
    }
  }
  onClick(event: MouseEvent): void {
    console.log(event);
    if (this._slide !== VIEW_DESIGNER) {
      return;
    }
    this.parser.initFromSelection(window.getSelection());
    this.updateToolbar();
  }
  onKeyDown(event: KeyboardEvent): void {
    console.log('onKeyDown', {target: event.target, key: event.key, altKey: event.altKey, ctrlKey: event.ctrlKey, metaKey: event.metaKey});
    console.log('this.moveByText', this.moveByText);
    if (this._slide !== VIEW_DESIGNER) {
      return;
    }
    this.parser.initFromSelection(window.getSelection());

    if (event.key.length > 1 && !KNOWN_KEYS.includes(event.key)) {
      return;
    }
    if (NAVIGATION_KEYS.includes(event.key) && !PROCESS_NAVIGATION_KEYS.includes(event.key)) {
      return;
    }
    if (WHITESPACE_KEYS.includes(event.key)) {
      this.whitespace(event.key, event.ctrlKey, event.altKey, event.shiftKey);
    } else if (EDITING_KEYS.includes(event.key)) {
      this.editingKey(event.key);
    } else if (PROCESS_NAVIGATION_KEYS.includes(event.key)) {
      switch (event.key) {
        case 'ArrowLeft':
          this.parser.movePrev(this.moveByText);
          break;
        case 'ArrowRight':
          this.parser.moveNext(this.moveByText);
          break;
      }
    } else if (!event.ctrlKey && !event.metaKey && !event.altKey) {
      this.parser.insString(event.key);
    }
    this.updateToolbar();
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
    const r = this.defineRange(e);
    if (r) {
      // console.log('drag over range:', r);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(r);
      this.parser.initFromSelection(window.getSelection());
    }
    if (this.parser.range) {
      e.preventDefault();
    }
  }
  defineRange(event: DragEvent): Range {
    const editorClientRect = this.editor.getBoundingClientRect();
    const n = event.target as HTMLElement;
    if (!n && typeof n.getBoundingClientRect !== 'function') {
      return null;
    }
    const cx = event.pageX - this.editor.offsetLeft;
    const cy = event.pageY - this.editor.offsetTop;
    console.log(`x: ${cx}, y: ${cy}`);
    function isIn(chr: DOMRect): boolean {
      const result = chr && chr.top + window.scrollY <= Math.ceil(cy) + 1
        && chr.bottom + window.scrollY >= Math.floor(cy) - 1
        && chr.left + window.scrollX <= Math.ceil(cx) + 1
        && chr.right + window.scrollX >= Math.floor(cx) - 1;
      console.log(`editorClientRect top:${editorClientRect.top}, bottom:${editorClientRect.bottom}, left:${editorClientRect.left}, right:${editorClientRect.right},
      cx: ${cx}, cy: ${cy},
      chr top:${chr.top + window.scrollY}, bottom:${chr.bottom + window.scrollY}, left:${chr.left + window.scrollX}, right:${chr.right + window.scrollX},
      result: ${result}`);
      return result;
    }
    function filter(e: HTMLElement, r: Range): Range {
      let c = e.firstChild;
      while (c) {
        let chr = null;
        if (c.nodeType === Node.ELEMENT_NODE) {
          chr = (c as HTMLElement).getBoundingClientRect();
          if (isIn(chr)) {
            // return filter(c as HTMLElement, r);
            r.selectNodeContents(c);
            return r;
          }
        } else if (c.nodeType === Node.TEXT_NODE) {
          r.selectNode(e);
          chr = r.getBoundingClientRect();
          if (isIn(chr)) {
            return tailoring(c, 0, c.textContent.length, r);
          }
        }
        c = c.nextSibling;
      }
      return null;
    }
    function tailoring(t: Node, from: number, to: number, r: Range): Range {
      if (to - from > 1) {
        const half = Math.floor((from + to) / 2);
        r.setStart(t, from);
        r.setEnd(t, half);
        const left = isIn(r.getBoundingClientRect());
        r.setStart(t, half);
        r.setEnd(t, to);
        const right = isIn(r.getBoundingClientRect());
        if (left) {
          return tailoring(t, from, half, r);
        } else if (right) {
          return tailoring(t, half, to, r);
        }
        r.setStart(t, from);
        r.setEnd(t, to);
        return r;
      }
      r.setStart(t, from);
      r.setEnd(t, to);
      return r;
    }
    const a = LibNode.getAttribute(n, DESIGNER_ATTR_NAME);
    if (a) {
      const r = this._document.createRange();
      if (n.hasChildNodes()) {
        return filter(n, r);
      } else {
        r.selectNode(n);
        return r;
      }
    }
    return null;
  }
  drop(e: DragEvent): void {
    console.log('drop', e);
    e.preventDefault();
    this.processPasteData({type: 'text/plain', data: e.dataTransfer.getData('text/plain')});
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
      if (pd.type === 'text/plain') { // TODO process files info and plugins
        this.parser.insString(pd.data);
      } else if (pd.type === 'text/html') {
        this.parser.insHTML(this.sanitizer.sanitize(SecurityContext.HTML, pd.data));
      }
  }
  dragStart(e: DragEvent): void {
    if (this._slide !== VIEW_DESIGNER) {
      return;
    }
    console.log('dragStart', e);
  }
  dragEnd(e: DragEvent): void {
    if (this._slide !== VIEW_DESIGNER) {
      return;
    }
    console.log('dragEnd', e);
  }
  dragExit(e: Event): void {
    if (this._slide !== VIEW_DESIGNER) {
      return;
    }
    console.log('dragExit', e);
  }
  drag(e: DragEvent): void {
    if (this._slide !== VIEW_DESIGNER) {
      return;
    }
    console.log('drag', e);
  }
  dragEnter(e: DragEvent): void {
    if (this._slide !== VIEW_DESIGNER) {
      return;
    }
    console.log('dragEnter', e);
  }
  dragLeave(e: DragEvent): void {
    if (this._slide !== VIEW_DESIGNER) {
      return;
    }
    console.log('dragLeave', e);
  }
  focusin(event: FocusEvent): void {
    if (this._slide !== VIEW_DESIGNER) {
      return;
    }
    console.log('focusin', event);
    this.parser.restorePosition();
  }
  focusout(event: FocusEvent): void {
    if (this._slide !== VIEW_DESIGNER) {
      return;
    }
    console.log('focusout', event);
  }
  private updateToolbar(): void {
    if (this.parser.range) {
      const res: any = {};
      let e: Node = LibNode.nodeOfPosition({n: window.getSelection().focusNode, offset: window.getSelection().focusOffset});
      if (e.nodeType !== Node.ELEMENT_NODE) {
        e = e.parentElement;
      }
      const cs = window.getComputedStyle(e as HTMLElement);
      res.fSize = cs.getPropertyValue('font-size');
      while (e !== this.editor) {
        const tag = e.nodeName.toLowerCase();
        if (HtmlRules.isContent('PhrasingFormat', SNode.elementNode(tag))) {
          res[tag + 'Tag'] = true;
        }
        e = e.parentElement;
      }
      this.toolbar.updateToolbar(res);
    }
  }
  private whitespace(key: string, ctrlKey: boolean, altKey: boolean, shiftKey: boolean): void {
    switch (key) {
      case 'Enter':
        this.parser.br(shiftKey, ctrlKey, altKey);
        break;
      case 'Tab':
        if (shiftKey) {
          this.parser.shiftRight();
        } else {
          this.parser.shiftLeft();
        }
        break;
    }
  }
  private editingKey(key: string): void {
      switch (key) {
        case 'Backspace':
          this.parser.backspace();
          break;
        case 'Delete':
          this.parser.delete();
          break;
        case 'Insert':
          this.replaceChar = !this.replaceChar; // TODO process this parameter by changing this.range on one symbol
          break;
      }
  }
  gag(e: Event): void { e.preventDefault(); }
}
