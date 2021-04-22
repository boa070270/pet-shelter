import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {of} from 'rxjs';

// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
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
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const CDATA_SECTION_NODE = 4;
const COMMENT_NODE = 8;
const DESIGNER_ATTR_NAME = '_design';
const EMPTY_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
function isEmptyElement(tag: string): boolean {
  return EMPTY_ELEMENTS.includes(tag.toLowerCase());
}
function findNodeUp(from: Node, editor: HTMLElement, criteria: (n: Node) => boolean = () => true): Node {
  if (belongDesigner(from, editor) && criteria(from)) {
    return from;
  }
  if (from.nodeType === TEXT_NODE) {
    from = from.parentNode;
  }
  let pos;
  do {
    pos = nextPosition(from.parentNode, orderOfChild(from.parentNode, from) + 1, editor);
  } while (criteria(pos.container));
  return pos.container;
}
function findNodeDown(from: Node, editor: HTMLElement, criteria: (n: Node) => boolean = () => true): Node {
  if (belongDesigner(from, editor) && criteria(from)) {
    return from;
  }
  if (from.nodeType === TEXT_NODE) {
    from = from.parentNode;
  }
  let pos;
  do {
    pos = prevPosition(from.parentNode, orderOfChild(from.parentNode, from), editor);
  } while (criteria(pos.container));
  return pos.container;
}
function findSourceMark(attr: string, source: string): RegExpExecArray {
  const regexp = new RegExp(`<([a-zA-Z][^<>]*\\s${DESIGNER_ATTR_NAME}="${attr}"[^<>]*)>`, 'gs');
  return regexp.exec(source);
}
function startSourceMark(attr: string, source: string): number {
  return findSourceMark(attr, source).index;
}
function endSourceMark(attr: string, source: string): number {
  const res = findSourceMark(attr, source);
  return res.index + res[0].length;
}
function endOfElement(tag: string, source: string, pos: number): RegExpExecArray {
  const regexp = new RegExp(`<\/${tag}\\s*>`, 'gi');
  regexp.lastIndex = pos;
  const chk = new RegExp(`<${tag}(\\s[^>]*|\\s?)>`, 'gi');
  chk.lastIndex = pos;
  let res;
  do {
    res = regexp.exec(source);
    if (res === null) {
      break;
    }
    const p = chk.exec(source);
    if (p === null || p.index > res.index) {
      break;
    }
  } while (true);
  return res;
}
function endOfElementIn(tag: string, source: string, pos: number): number {
  const res = endOfElement(tag, source, pos);
  if (res === null) {
    console.error(`Absent end of tag ${tag}, position: ${pos}`);
    return source.length;
  }
  return res.index;
}
function endOfElementOut(tag: string, source: string, pos: number): number {
  const res = endOfElement(tag, source, pos);
  if (res === null) {
    console.error(`Absent end of tag ${tag}, position: ${pos}`);
    return source.length;
  }
  return res.index + res[0].length;
}
function orderOfChild(parent: Node, child: Node, toStart = true): number {
  let n = 0;
  if (toStart) {
    for (; parent.childNodes[n] !== child; ++n){}
  } else {
    for (; parent.childNodes[parent.childNodes.length - n] !== child; ++n){}
  }
  return n;
}
function findDesignElement(editor: Element, attr: string): Element {
  if (attr && attr !== '0') {
    return editor.querySelector(`[${DESIGNER_ATTR_NAME}="${attr}"]`);
  }
  return editor;
}
function isAncestor(parent: Node, child: Node): boolean {
  while (child.parentNode !== null && child !== parent) { child = child.parentNode; }
  return child === parent;
}
function rangeSourceMarkIn(editor: Element, attr: string, source: string): {start: number, end: number} {
  if (attr === '0') {
    return {start: 0, end: source.length};
  }
  const res = findSourceMark(attr, source);
  if (res) {
    const start = res.index + res[0].length;
    const e = findDesignElement(editor, attr);
    if (e) {
      if (isEmptyElement(e.tagName)) {
        return {start, end: start + res[0].length};
      }
      const end = endOfElementIn(e.tagName, source, start);
      return {start, end};
    } else {
      console.error('Absent element with designId=' + attr);
    }
  }
  console.error('Unknown design ID:' + attr);
  return {start: 0, end: source.length};
}
function rangeSourceMarkOut(editor: Element, attr, source): {start: number, end: number} {
  if (attr === '0') {
    return {start: 0, end: source.length};
  }
  const res = findSourceMark(attr, source);
  if (res) {
    const start = res.index;
    const e = findDesignElement(editor, attr);
    if (e) {
      if (isEmptyElement(e.tagName)) {
        return {start, end: start + res[0].length};
      }
      return {start, end: endOfElementOut(e.tagName, source, start + res[0].length)};
    } else {
      console.error('Absent element with designId=' + attr);
    }
  }
  console.error('Unknown design ID:' + attr);
  return {start: 0, end: source.length};
}

/**
 * get position for selection
 * @param n node
 * @param where number 0 - before node, 1,2 - in node (if node is container. if node isn't container, position before)
 * @param editor - this editor
 */
function positionToNode(n: Node, where: number, editor: Element): {container: Node, offset: number} {
  if (n === editor) {
    return {container: n, offset: where < 2 ? 0 : editor.childNodes.length};
  }
  if (n.nodeType === TEXT_NODE) {
    return {container: n, offset: where < 2 ? 0 : n.textContent.length};
  }
  if (where > 0 && isContainer(n)) {
    return {container: n, offset: where < 2 ? 0 : n.childNodes.length};
  }
  const offset = orderOfChild(n.parentNode, n);
  return {container: n.parentNode, offset};
}

/*
 How I need to move.
 1. When customer use ArrowLeft, ArrowRight - cursor moves only through TEXT_NODE
 2. When customer use Ctrl-ArrowLeft, Ctrl-ArrowRight - cursor moves only through TEXT_NODE by words
 3. When customer use Alt-ArrowLeft, Alt-ArrowRight - cursor moves on every tag when can by TEXT
 If I move to down:
  - end pont is editor last text node if text node present or editor last element + 1 (so undefined)
  - between two element is only one text node! and if there is text node I always select it
  - if there is no text node between elements I select position 0 even there is other comment nodes
  1. If go is element, I check child 0, if it is text I select this node in position 0, if it is undefined or other node
  I select element offset 0.
  2. when I move through sibling I move to next element. I check if this element is not empty element,
   if it is empty I check if there is text node after it.
   if it is container I go in this element.
 */
function downEditor(editor: HTMLElement): {n: Node, offset: number} {
  const offset = editor.childNodes.length;
  if (offset === 0) {
    return {n: editor, offset: 0};
  }
  if (editor.childNodes[offset].nodeType === TEXT_NODE) {
    return {n: editor.childNodes[offset], offset: 0};
  }
  return {n: editor, offset};
}
function childOr0(n: Node, offset: number): {n: Node, offset: number} {
  if (n.childNodes[offset] && n.childNodes[offset].nodeType === TEXT_NODE) {
    return {n: n.childNodes[offset], offset: 0};
  } else {
    return {n, offset};
  }
}
function downIn(n: Node): {n: Node, offset: number} {
  return childOr0(n, 0);
}
function downUp(n: Node, editor: HTMLElement): {n: Node, offset: number} {
  const p = n.parentNode;
  const offset = orderOfChild(p, n);
  return childOr0(n, offset + 1);
}

/**
 * next position
 * @param n - focus node
 * @param offset - focus offset
 * @param editor - editor
 */
function downSibling(n: Node, offset: number, editor: HTMLElement): {n: Node, offset: number} {
  for (;;) {
    do {
      offset++;
    } while (!(n.childNodes[offset] === undefined || n.childNodes[offset].nodeType === ELEMENT_NODE));
    if (n.childNodes[offset] === undefined) {
      if (n === editor) {
        downEditor(editor);
      }
      return downUp(n, editor);
    }
    if (belongDesigner(n.childNodes[offset], editor)) {
      if (isEmptyElement((n as HTMLElement).tagName)) {
        return childOr0(n, offset + 1);
      }
      return downIn(n.childNodes[offset]);
    }
    if (n.childNodes[offset + 1] && n.childNodes[offset + 1].nodeType === TEXT_NODE) {
      return {n: n.childNodes[offset + 1], offset: 0};
    }
  }
}

/**
 * prev positions
 * @param n - focus node
 * @param offset - focus offset
 * @param editor - editor
 */
function upSibling(n: Node, offset: number, editor: HTMLElement): {n: Node, offset: number} {
  for (;;) {
    do {
      offset--;
    } while (n.childNodes[offset] === undefined || isPositioned(n.childNodes[offset]));
  }
}
function isPositioned(n: Node): boolean {
  return n.nodeType === TEXT_NODE || (n.nodeType === ELEMENT_NODE);
}
function inElement(n: Node, editor: Element): {container: Node, offset: number} {
  if (n.childNodes.length === 0 || isPositioned(n.childNodes[0])) {
    return {container: n, offset: 0};
  }
  return nextSibling(n, 0, editor);
}
function nextSibling(n: Node, offset: number, editor: Element): {container: Node, offset: number} {
  do {
    offset++;
  } while (!(n.childNodes[offset] === undefined || belongDesigner(n.childNodes[offset], editor)));
  return {container: n, offset};
}
function prevSibling(n: Node, offset: number, editor: Element): {container: Node, offset: number} {
  do {
    offset--;
  } while (!(n.childNodes[offset] === undefined || belongDesigner(n.childNodes[offset], editor)));
  return {container: n, offset};
}
function getParent(n: Node, editor: Element): {container: Node, offset: number} {
  let offset;
  do {
    const p = n.parentNode;
    offset = orderOfChild(p, n);
    n = p;
  } while (!belongDesigner(n, editor));
  return {container: n, offset};
}
/**
 * this function expects selection focus (container, offset) as input
 * @param n Node
 * @param offset number
 * @param editor this editor
 */
function nextPosition(n: Node, offset: number, editor: Element): {container: Node, offset: number} {
  if (n === editor && offset === editor.childNodes.length) {
    if (offset > 0 && n.childNodes[offset - 1].nodeType === TEXT_NODE) {
      n  = n.childNodes[offset - 1];
      return {container: n, offset: n.textContent.length};
    }
    return {container: n, offset};
  }
  if (n.nodeType === TEXT_NODE && offset < n.textContent.length) {
    return {container: n, offset: offset + 1};
  } else if (n.nodeType === ELEMENT_NODE && isContainer(n.childNodes[offset])) {
    return  inElement(n.childNodes[offset], editor);
  } else {
    if (n.nodeType === ELEMENT_NODE && offset < n.childNodes.length) {
      return nextSibling(n, offset, editor);
    }
    const p = getParent(n, editor);
    return nextSibling(p.container, p.offset, editor);
  }
}
function prevPosition(n: Node, offset: number, editor: Element): {container: Node, offset: number} {
  if (n === editor && offset === 0) {
    if (n.childNodes[0].nodeType === TEXT_NODE) {
      return {container: n.childNodes[0], offset: 0};
    }
    return {container: n, offset};
  }
  if (n.nodeType === TEXT_NODE && offset > 0) {
    return {container: n, offset: offset - 1};
  } else if (offset === 0) {
    const p = getParent(n, editor);
    if (p.offset > 0 && p.container.childNodes[p.offset - 1].nodeType === TEXT_NODE) {
      const t = p.container.childNodes[p.offset - 1];
      return {container: t, offset: t.textContent.length};
    }
    return p;
  } else {
    do {
      offset--;
    } while (offset !== 0 && !belongDesigner(n.childNodes[offset], editor));
    return positionToNode(n.childNodes[offset], 2, editor);
  }
}
function belongDesigner(n: Node, editor: Element): boolean {
  return n && (n === editor
    || (n.nodeType === TEXT_NODE && (n.parentElement.getAttribute(DESIGNER_ATTR_NAME) !== null))
    || (n.nodeType === ELEMENT_NODE && (n as HTMLElement).getAttribute(DESIGNER_ATTR_NAME) !== null));
}
function isContainer(n: Node): boolean {
  return n && n.nodeType === ELEMENT_NODE && !isEmptyElement((n as HTMLElement).tagName);
}
function moveNext(n: Node, offset: number, editor: Element): void {
  const r = nextPosition(n, offset, editor);
  window.getSelection().collapse(r.container, r.offset);
}
function movePrev(n: Node, offset: number, editor: Element): void {
  const r = prevPosition(n, offset, editor);
  window.getSelection().collapse(r.container, r.offset);
}
function unicodes(start: number, end: number, source): number {
  const regexp = /&#(\d{2,4}|x[0-9a-zA-Z]{2,4});/;
  regexp.lastIndex = start;
  let count = 0;
  do {
    const res = regexp.exec(source);
    if (res === null || res.index > end) {
      break;
    }
    count += (res[1].length + 2);
    end -= (res.index + 1);
  } while (true);
  return count;
}
function storePosition(n: Node, offset: number): {designId: string, offset: number, txtOffset?: number}{
  const result: any = {};
  if (n.nodeType === TEXT_NODE) {
    result.txtOffset = offset;
    result.designId = n.parentElement.getAttribute(DESIGNER_ATTR_NAME);
    result.offset = orderOfChild(n.parentNode, n);
  } else {
    result.designId = (n as HTMLElement).getAttribute(DESIGNER_ATTR_NAME);
    result.offset = offset;
  }
  return result;
}
function restorePosition(store: {designId: string, offset: number, txtOffset?: number}, editor: HTMLElement)
  : {container: Node, offset: number} {
  let container = findDesignElement(editor, store.designId) as Node;
  if (store.txtOffset !== undefined && container.childNodes[store.offset] && container.childNodes[store.offset].nodeType === TEXT_NODE) {
    container = container.childNodes[store.offset];
    return {container, offset: store.txtOffset};
  }
  return {container, offset: store.offset};
}
/**
 * Range: container, offset.
 * container type can be ELEMENT_NODE and TEXT_NODE, COMMENT_NODE, CDATA_NODE
 * if ELEMENT_NODE the offset is number of child node.
 *   If the node with this number is present it point on the begin of the node.
 *   If there is no node with this number, it point on the end of the last child node
 * If TEXT_NODE, COMMENT_NODE, CDATA_NODE the offset is the number of characters from the start
 *   the offset can point to the end of text, in this case offset equals to length
 * @param n Node
 * @param editor this editor element
 * @param offset number
 * @param source this source text
 */
function syncPosition(n: Node, offset: number, editor: Element, source: string): number {
  if (n.nodeType === ELEMENT_NODE) {
    let start = 0;
    if (n !== editor) {
      start = endSourceMark((n as HTMLElement).getAttribute(DESIGNER_ATTR_NAME), source);
    }
    for (let i = 0; n.childNodes[i] && i < offset; ++i) {
      const ch = n.childNodes[i];
      if (ch.nodeType === TEXT_NODE) {
        // nothing
      } else if (ch.nodeType === ELEMENT_NODE) {
        const range = rangeSourceMarkOut(editor, (ch as HTMLElement).getAttribute(DESIGNER_ATTR_NAME), source);
        start = range.end;
      } else if (ch.nodeType === COMMENT_NODE) {
        start = source.indexOf('-->', start) + 3;
      } else if (ch.nodeType === CDATA_SECTION_NODE) {
        start = source.indexOf(']]>', start) + 3;
      }
    }
    return start;
  } else {
    // I expect only TEXT_NODE here
    let start = orderOfChild(n.parentNode, n);
    start = syncPosition(n.parentNode, start, editor, source);
    return start + offset + unicodes(start, offset, source);
  }
}
function printNode(n: Node): string {
  let s = '';
  if (n.nodeType === ELEMENT_NODE) {
    const e = n as HTMLElement;
    s += e.tagName.toLowerCase() + ' ' + e.getAttribute(DESIGNER_ATTR_NAME);
  } else if (n.nodeType === TEXT_NODE) {
    s += '#text ' + n.textContent;
  } else {
    s = 'no-edit';
  }
  return s;
}
function printSelection(where: string): void {
  const p = window.getSelection();
  console.log(where, {anchorNode: printNode(p.anchorNode), anchorOffset: p.anchorOffset, focusNode: printNode(p.focusNode), focusOffset: p.focusOffset, isCollapse: p.isCollapsed});
}
/**
 * How it works.
 * We use custom elements, so when I place a custom element on the designer panel,
 * this element is transformed into a collection of different elements which compose it.
 * After this, I cannot use the inner HTML of the designer.
 * My solution: I use two panels one for designer, second "source" to store untransformed HTML.
 * The customer works in designer panel, but all actions from keyboard and mouse modify source panel and then
 * the result is copied to the designer panel.
 * I try copy only modified parts.
 * As anchor, ALL ELEMENTS that I place into design panel I mark with attribute DESIGNER_ATTR_NAME with unique number ID
 * On every action, I need to:
 * - define position that will be modified
 * - find this part of text in the source panel
 * - modify this part
 * - update the design panel with this part
 * Cases:
 * 1. Selection is collapsed and focusNode is TEXT_NODE:
 *   1. take parent element and check DESIGNER_ATTR_NAME, if the attribute is absent, this text node belongs to a custom
 *   element, do nothing. This can be incorrect, but this our custom elements and we can take a rules:
 *     1. Custom elements render content with tags.
 *     2. All other text variables that are rendering by custom element are given to it through property configuration.
 *     3. the source always marked all elements with _design attribute. see checkAndMarkElements()
 *   2. parent element has attribute:
 *    find text that belong to this parent element, modify it and update inner html of
 *   this parent element
 * 2. Selection is collapsed and focusNode is not TEXT_NODE:
 *    I know only one reason for this, there is empty source.
 * 3. Selection isn't collapsed and focusNode is TEXT_NODE and anchorNode is the same TEXT_NODE:
 *    It's like 1. But in this case I need to replace selected text with one input character,
 *    then update inner Html of parent.
 * 4. Selection isn't collapsed and focusNode is TEXT_NODE and anchorNode is another TEXT_NODE and both focusNode and
 * anchorNode have the same parent element:
 * 5. Selection isn't collapsed and focusNode is TEXT_NODE and anchorNode is another TEXT_NODE and both focusNode and
 * anchorNode have the different parent elements:
 * 6. Selection isn't collapsed and focusNode or anchorNode do not belong to designer panel:
 *   skip this action.
 */
@Component({
  selector: 'app-test-sync',
  templateUrl: './test-sync.component.html',
  styleUrls: ['./test-sync.component.scss']
})
export class TestSyncComponent implements OnInit {
  position = 0;
  source = '';
  designIndex = 1;
  editor: HTMLDivElement;
  lastRange: Range;
  // tslint:disable-next-line:variable-name
  _sourceModified = false;
  rollback: Array<{parent: string, before: string, after: string}> = [];
  @ViewChild('editor', {static: true}) editorRef: ElementRef<HTMLDivElement>;
  constructor() { }

  ngOnInit(): void {
    this.editor = this.editorRef.nativeElement;
  }

  syncOnTouch(): void {
    if (window.getSelection().rangeCount > 1) {
      /* A user can normally only select one range at a time, so the rangeCount will usually be 1.
       Scripting can be used to make the selection contain more than one range. We do not use script here!
       */
      this.lastRange = null;
      return;
    }
    const range = window.getSelection().getRangeAt(0);
    if (range.collapsed) {
      if (!belongDesigner(range.commonAncestorContainer, this.editor)) {
        this.lastRange = null;
        return;
      }
    } else {
      // withdraw custom elements nodes and change selection
      const startContainer = findNodeDown(range.startContainer, this.editor,
        (n) => belongDesigner(n, this.editor) || n === range.endContainer);
      const endContainer = findNodeUp(range.endContainer, this.editor,
        (n) => belongDesigner(n, this.editor) || n === startContainer);
      if (!belongDesigner(startContainer, this.editor) || !belongDesigner(endContainer, this.editor)) {
        // this text absent in our designer. If we want to place text inside plugin, need text cover by tag
        // TODO We can try define a plugin here and then light it, or position cursor correctly before ar after this plugin!
        // TODO we can show snake menu here to explain this case to user
        // window.getSelection().collapse(range.commonAncestorContainer);
        this.lastRange = null;
        return;
      }
      if (startContainer !== range.startContainer || endContainer !== range.endContainer) {
        window.getSelection().setBaseAndExtent(startContainer,
          startContainer !== range.startContainer ? 0 : range.startOffset,
          endContainer,
          endContainer !== range.endContainer ? endContainer.textContent.length : range.endOffset);
      }
    }
    this.lastRange = window.getSelection().getRangeAt(0);
    this.tmlCheckEmpty(this.lastRange.commonAncestorContainer);
    this.tmlCheckEmpty(this.lastRange.startContainer);
    this.tmlCheckEmpty(this.lastRange.endContainer);
  }
  tmlCheckEmpty(n: Node): void {
    if (n.nodeType === ELEMENT_NODE) {
      if ( isEmptyElement((n as HTMLElement).tagName)) {
        throw new Error('There is empty element');
      }
    }
  }
  onClick(event: MouseEvent): void {
    console.log(event);
    if (this._sourceModified || this.checkAndMarkElements()) {
      this.editor.innerHTML = this.source;
      this._sourceModified = false;
      const f = nextSibling(this.editor, 0, this.editor);
      window.getSelection().collapse(f.container, f.offset);
    }
    this.syncOnTouch();
    console.log('onClick:', this.lastRange);
    console.log('onClick:', this.getModifiedPart());
    if (this.lastRange) {
      const start = syncPosition(this.lastRange.startContainer, this.lastRange.startOffset, this.editor, this.source);
      const end = syncPosition(this.lastRange.endContainer, this.lastRange.endOffset, this.editor, this.source);
      console.log('onClick start:', start);
      console.log('onClick end:', end);
      console.log('onClick substr:', this.source.substring(start, end));
    }
  }
  getModifiedPart(): {parent: HTMLElement, text: string, start: number, end: number} {
    // TODO is the end in the result really required?
    const allSource = {parent: this.editor, text: this.source.substring(0), start: 0, end: this.source.length};
    if (this.lastRange) {
      if (this.lastRange.commonAncestorContainer === this.editor) {
        return allSource;
      } else {
        let parent = this.lastRange.commonAncestorContainer;
        if (parent.nodeType === ELEMENT_NODE) {
          let attr = (parent as HTMLElement).getAttribute(DESIGNER_ATTR_NAME);
          if (attr === null) {
            parent = findNodeUp(parent, this.editor, (n) =>
              n && n.nodeType === ELEMENT_NODE && ((n as HTMLElement).getAttribute(DESIGNER_ATTR_NAME) !== null || n === this.editor));
            if (parent === this.editor) {
              return allSource;
            }
            attr = (parent as HTMLElement).getAttribute(DESIGNER_ATTR_NAME);
          }
          const start = endSourceMark(attr, this.source);
          const end = endOfElementIn((parent as HTMLElement).tagName, this.source, start);
          return {parent: parent as HTMLElement, text: this.source.substring(start, end), start, end};
        } else {
          parent = parent.parentElement;
          if (isEmptyElement((parent as HTMLElement).tagName)) {
            console.error('Empty element as parent!!!', (parent as HTMLElement).tagName);
            parent = parent.parentElement;
          }
          if (parent === this.editor) {
            return allSource;
          }
          const start = endSourceMark((parent as HTMLElement).getAttribute(DESIGNER_ATTR_NAME), this.source);
          const end = endOfElementIn((parent as HTMLElement).tagName, this.source, start);
          return {parent: parent as HTMLElement, text: this.source.substring(start, end), start, end};
        }
      }
    }
  }
  onKeyUp(event: KeyboardEvent): void { // Do I really need this method?
    // console.log('onKeyUp', window.getSelection());
    this.syncOnTouch();
    // console.log('onKeyUp', window.getSelection());
    // if (this.lastRange) {
    //   const start = syncPosition(this.lastRange.startContainer, this.lastRange.startOffset, this.editor, this.source);
    // }
  }
  onKeyDown(event: KeyboardEvent): void {
    console.log('onKeyDown', {key: event.key, altKey: event.altKey, ctrlKey: event.ctrlKey, metaKey: event.metaKey});
    printSelection('onKeyDown');
    if (event.altKey || event.ctrlKey || event.metaKey) {
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
            movePrev(window.getSelection().focusNode, window.getSelection().focusOffset, this.editor);
            break;
          case 'ArrowRight':
            moveNext(window.getSelection().focusNode, window.getSelection().focusOffset, this.editor);
            break;
        }
        this.lastRange = window.getSelection().getRangeAt(0);
      } else {
        this.simpleChar(event.key);
      }
    }
    event.preventDefault();
    printSelection('onKeyDown: exit');
  }
  /**
   * if range isn't collapsed:
   * <div>Text_1<label>Text_2<input><span>Text_3_</span></label>Text_4_</div>
   * case select: [t_1], result: {open:[], close:[]}
   * case select: [t_1, Text_2], result: {open: [label], close:[]}
   * case select: [t_1, Text_3], result: {open: [label, span], close:[]}
   * case select: [t_1, Text_4], result: {open:[], close:[]}
   * case select: [t_2, Text_3], result: {open: [span], close:[]}
   * case select: [t_2, Text_4], result: {open: [], close:[label]}
   * case select: [t_3, Text_4], result: {open: [], close:[span]}
   */
  private sortOut(start: Node, sOffset: number, end: Node, eOffset: number):
    {open: Array<{tag: string, attr: Array<{name: string, value: string}>}>, close: Array<string>} {
    const result = {open: [], close: []};

    const range = document.createRange();
    range.setStart(start, sOffset);
    range.setEnd(end, eOffset);
    const p = range.commonAncestorContainer;
    if (!range.collapsed) {
      let e: Node;
      if (end !== p) {
        e = (end.nodeType === TEXT_NODE) ? end.parentNode : end;
        while (e !== p) {
          const designId = e.nodeType === ELEMENT_NODE ? (e as HTMLElement).getAttribute(DESIGNER_ATTR_NAME) : null;
          if (designId) {
            result.open.push({
              tag: (e as HTMLElement).tagName, designId,
              attr: (e as HTMLElement).getAttributeNames().map(a => ({
                name: a,
                value: (e as HTMLElement).getAttribute(a)
              }))
            });
          }
          e = e.parentNode;
        }
      }
      if (start !== p) {
        e = (start.nodeType === TEXT_NODE) ? start.parentNode : start;
        while (e !== p) {
          const designId = e.nodeType === ELEMENT_NODE ? (e as HTMLElement).getAttribute(DESIGNER_ATTR_NAME) : null;
          if (designId) {
            const i = result.open.findIndex(v => v.designId === designId);
            if (i >= 0) {
              result.open.splice(i, 1);
            } else {
              result.close.push((e as HTMLElement).tagName);
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
      src += `</${e.toLowerCase()}>`;
    }
    for (const e of sourOut.open) {
      let attr = '';
      for (const a of e.attr) {
        attr += ` ${a.name}="${a.value || a.name}"`;
      }
      src += `<${e.tag.toLowerCase()}${attr}>`;
    }
    return src;
  }
  private update(start: number, end: number, str: string): void {
    const part = this.getModifiedPart();
    this.source = this.source.substring(0, start) + str + this.source.substring(end);
    const before = part.text;
    part.text = part.text.substring(0, start - part.start) + str + part.text.substring(end - part.start);
    this.rollback.push({
      parent: part.parent === this.editor ? null : (part.parent as HTMLElement).getAttribute(DESIGNER_ATTR_NAME),
      before,
      after: part.text
    });
    this.lastRange = null;
    part.parent.innerHTML = part.text;
  }
  private insert(ch: string): void {
    if (this.lastRange) {
      const start = syncPosition(this.lastRange.startContainer, this.lastRange.startOffset, this.editor, this.source);
      const end = syncPosition(this.lastRange.endContainer, this.lastRange.endOffset, this.editor, this.source);
      const store = storePosition(this.lastRange.startContainer, this.lastRange.startOffset);
      const str = this.txtSortOut(this.lastRange.startContainer, this.lastRange.startOffset,
        this.lastRange.endContainer, this.lastRange.endOffset) + ch;
      this.update(start, end, str);
      let pos = restorePosition(store, this.editor);
      pos = nextPosition(pos.container, pos.offset, this.editor);
      if (pos.container.nodeType === TEXT_NODE && pos.offset === 0) {
        window.getSelection().collapse(pos.container, pos.offset + ch.length);
      } else {
        window.getSelection().collapse(pos.container, pos.offset);
      }
      this.lastRange = window.getSelection().getRangeAt(0);
    }
  }
  private insertTag(tag: string): void {
    if (this.lastRange) {
      const start = syncPosition(this.lastRange.startContainer, this.lastRange.startOffset, this.editor, this.source);
      const end = syncPosition(this.lastRange.endContainer, this.lastRange.endOffset, this.editor, this.source);
      const id = '' + this.designIndex++;
      const isEmpty = isEmptyElement(tag);
      const str = this.txtSortOut(this.lastRange.startContainer, this.lastRange.startOffset,
        this.lastRange.endContainer, this.lastRange.endOffset)
        + (isEmpty ? `<${tag} ${DESIGNER_ATTR_NAME}="${id}">` : `<${tag} ${DESIGNER_ATTR_NAME}="${id}"></${tag}>`);
      this.update(start, end, str);
      const node = findDesignElement(this.editor, id) as Node;
      const pos = positionToNode(node, 2, this.editor);
      window.getSelection().collapse(pos.container, pos.offset);
      this.lastRange = window.getSelection().getRangeAt(0);
    }
  }
  private delete(after = true): void {
    if (!this.lastRange.collapsed) {
      const start = syncPosition(this.lastRange.startContainer, this.lastRange.startOffset, this.editor, this.source);
      const end = syncPosition(this.lastRange.endContainer, this.lastRange.endOffset, this.editor, this.source);
      const store = storePosition(this.lastRange.startContainer, this.lastRange.startOffset);
      const str = this.txtSortOut(this.lastRange.startContainer, this.lastRange.startOffset,
        this.lastRange.endContainer, this.lastRange.endOffset);
      this.update(start, end, str);
      let pos = restorePosition(store, this.editor);
      pos = nextPosition(pos.container, pos.offset, this.editor);
      window.getSelection().collapse(pos.container, pos.offset);
    } else {
      let startPos: any = {};
      let endPos: any = {};
      if (after) {
        startPos.container = this.lastRange.startContainer;
        startPos.offset = this.lastRange.startOffset;
        endPos = nextPosition(startPos.container, startPos.offset, this.editor);
      } else {
        endPos.container = this.lastRange.startContainer;
        endPos.offset = this.lastRange.startOffset;
        startPos = prevPosition(endPos.container, endPos.offset, this.editor);
      }
      const start = syncPosition(startPos.container, startPos.offset, this.editor, this.source);
      const end = syncPosition(endPos.container, endPos.offset, this.editor, this.source);
      this.lastRange.setStart(startPos.container, startPos.offset);
      this.lastRange.setEnd(endPos.container, endPos.offset);
      const store = storePosition(startPos.container, startPos.offset);
      const str = this.txtSortOut(startPos.container, startPos.offset, endPos.container, endPos.offset);
      this.update(start, end, str);
      const pos = restorePosition(store, this.editor);
      window.getSelection().collapse(pos.container, pos.offset);
    }
    this.lastRange = window.getSelection().getRangeAt(0);
  }
  private whitespace(key: string): void {
    switch (key) {
      case 'Enter':
        this.insertTag('br');
        break;
      case 'Tab':
        break;
    }
  }
  private editingKey(key: string): void {
    switch (key) {
      case 'Backspace':
        this.delete(false);
        break;
      case 'Delete':
        this.delete();
        break;
      case 'Insert':
        break;
    }
  }

  private simpleChar(key: string): void {
    this.insert(key);
  }
  checkAndMarkElements(): boolean {
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

  sourceModified(): void {
    this._sourceModified = true;
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
}
