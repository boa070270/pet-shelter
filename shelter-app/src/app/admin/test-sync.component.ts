import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

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
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const CDATA_SECTION_NODE = 4;
const COMMENT_NODE = 8;
const DESIGNER_ATTR_NAME = '_design';
const EMPTY_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
function isEmptyElement(tag: string): boolean {
  return EMPTY_ELEMENTS.includes(tag.toLowerCase());
}
function firstGrandChild(node: Node): Node {
  if (node && node.firstChild) {
    return firstGrandChild(node.firstChild);
  }
  return node;
}
function lastGrandChild(node: Node): Node {
  if (node && node.lastChild) {
    return lastGrandChild(node.lastChild);
  }
  return node;
}
function findNodeUp(from: Node, criteria: (n: Node) => boolean): Node {
  if (criteria(from)) {
    return from;
  }
  while (from && from.previousSibling) {
    from = from.previousSibling;
    if (from.nodeType === ELEMENT_NODE) {
      from = lastGrandChild(from);
    }
    if (criteria(from)) {
      return from;
    }
  }
  if (!from) { return; }
  // there is nothing on sibling level, so level up
  do {
    from = from.parentNode;
    if (criteria(from)) {
      return from;
    }
  } while (from && from.previousSibling === null);
  if (!from) { return; }
  // we on the node that has previousSibling, lets check these children from the nearest
  from = from.previousSibling;
  if (from.nodeType === ELEMENT_NODE) {
    return findNodeUp(lastGrandChild(from), criteria);
  } else {
    return findNodeUp(from, criteria);
  }

}
function findNodeDown(from: Node, criteria: (n: Node) => boolean): Node {
  if (criteria(from)) {
    return from;
  }
  while (from && from.nextSibling) {
    from = from.nextSibling;
    if (from.nodeType === ELEMENT_NODE) {
      from = firstGrandChild(from);
    }
    if (criteria(from)) {
      return from;
    }
  }
  if (!from) { return; }
  // there is nothing on sibling level, so level up
  do {
    from = from.parentNode;
    if (criteria(from)) {
      return from;
    }
  } while (from && from.nextSibling === null);
  if (!from) { return; }
  // we on the node that has nextSibling, lets check these children from the nearest
  from = from.nextSibling;
  if (from.nodeType === ELEMENT_NODE) {
    return findNodeDown(firstGrandChild(from), criteria);
  } else {
    return findNodeDown(from, criteria);
  }
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
function shiftContainer(container: Node, next: boolean, editor: Element): {container: Node, offset: number} {
  let offset;
  if (!container || container === editor) {
    container = editor;
    offset = editor.childNodes.length;
  } else if (container.nodeType === TEXT_NODE) {
    offset = next ? 0 : container.textContent.length;
  } else {
    offset = orderOfChild(container.parentElement, container);
    container = container.parentElement;
  }
  return {container, offset};
}
function nextPosition(container: Node, offset: number, editor: Element): {container: Node, offset: number} {
  if (container.nodeType === TEXT_NODE && offset < container.textContent.length) {
    offset++;
    return {container, offset};
  } else {
    // this designer doesn't support elements that are removed from normal document flow, and display none
    container = findNodeDown(container, (n) => n
      && ((n.nodeType === ELEMENT_NODE && ((n as HTMLElement).getAttribute(DESIGNER_ATTR_NAME) !== null))
        || (n.nodeType === TEXT_NODE && n.parentElement.getAttribute(DESIGNER_ATTR_NAME) !== null)));
    return shiftContainer(container, true, editor);
  }
}
function prevPosition(container: Node, offset: number, editor: Element): {container: Node, offset: number} {
  if (container.nodeType === TEXT_NODE && offset !== 0) {
    offset --;
    return {container, offset};
  } else {
    container = findNodeUp(container, (n) => n
      && ((n.nodeType === ELEMENT_NODE && ((n as HTMLElement).getAttribute(DESIGNER_ATTR_NAME) !== null))
        || (n.nodeType === TEXT_NODE && n.parentElement.getAttribute(DESIGNER_ATTR_NAME) !== null)));
    return shiftContainer(container, false, editor);
  }
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
/**
 * Range: container, offset.
 * container type can be ELEMENT_NODE and TEXT_NODE, COMMENT_NODE, CDATA_NODE
 * if ELEMENT_NODE the offset is number of child node.
 *   If the node with this number is present it point on the begin of the node.
 *   If there is no node with this number, it point on the end of the last child node
 * If TEXT_NODE, COMMENT_NODE, CDATA_NODE the offset is the number of characters from the start
 *   the offset can point to the end of text, in this case offset equals to length
 * @param n Node
 * @param offset number
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

// Cases
const THE_SAME_NODE = 0;
const THE_SAME_PARENT = 1;
const DIFFERENT_PARENTS = 2;
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
  styleUrls: ['./test-sync.component.sass']
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

  syncOnTouch(keyEvent?: KeyboardEvent): void {
    if (window.getSelection().rangeCount > 1) {
      /* A user can normally only select one range at a time, so the rangeCount will usually be 1.
       Scripting can be used to make the selection contain more than one range. We do not use script here!
       */
      this.lastRange = null;
      return;
    }
    const range = window.getSelection().getRangeAt(0);
    if (range.collapsed) {
      if (!this.belongDesigner(range.commonAncestorContainer)) {
        this.lastRange = null;
        return;
      }
    } else {
      // withdraw custom elements nodes and change selection
      const startContainer = findNodeDown(range.startContainer,
        (n) => this.belongDesigner(n) || n === range.endContainer);
      const endContainer = findNodeUp(range.endContainer,
        (n) => this.belongDesigner(n) || n === startContainer);
      if (!this.belongDesigner(startContainer) || !this.belongDesigner(endContainer)) {
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
  belongDesigner(n: Node): boolean {
    return n && (n === this.editor
      || (n.nodeType === TEXT_NODE && (n.parentElement.getAttribute(DESIGNER_ATTR_NAME) !== null))
      || (n.nodeType === ELEMENT_NODE && (n as HTMLElement).getAttribute(DESIGNER_ATTR_NAME) !== null));
  }
  onClick(event: MouseEvent): void {
    console.log(event);
    if (this._sourceModified || this.checkAndMarkElements()) {
      this.editor.innerHTML = this.source;
      this._sourceModified = false;
    }
    this.syncOnTouch();
    this.preCollapse();
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
            parent = findNodeUp(parent, (n) =>
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
  onKeyUp($event: KeyboardEvent): void { // Do I really need this method?
    this.syncOnTouch();
    if (this.lastRange) {
      const start = syncPosition(this.lastRange.startContainer, this.lastRange.startOffset, this.editor, this.source);
    }
  }
  onKeyDown(event: KeyboardEvent): void {
    console.log('onKeyDown', {key: event.key, altKey: event.altKey, ctrlKey: event.ctrlKey, metaKey: event.metaKey});
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    if (event.key.length > 1 && !KNOWN_KEYS.includes(event.key)) {
      console.error('onKeyPress input not editable symbol', event.key);
      return;
    }
    if (NAVIGATION_KEYS.includes(event.key)) {
      return;
    }
    if (this.lastRange) {
      if (WHITESPACE_KEYS.includes(event.key)) {
        this.whitespace(event.key);
      } else if (EDITING_KEYS.includes(event.key)) {
        this.editingKey(event.key);
      } else {
        this.simpleChar(event.key);
      }
    }
    event.preventDefault();
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
  private sortOut(): {open: Array<{tag: string, attr: Array<{name: string, value: string}>}>, close: Array<string>} {
    const result = {open: [], close: []};
    if (this.lastRange && this.lastRange.startContainer !== this.lastRange.endContainer) {
      const tmp = [];
      const p = this.lastRange.commonAncestorContainer;
      let st = (this.lastRange.startContainer.nodeType === TEXT_NODE) ?
        this.lastRange.startContainer.parentElement : this.lastRange.startContainer as HTMLElement;
      while (st !== p) {
        const designId = st.getAttribute(DESIGNER_ATTR_NAME);
        if (designId) {
          tmp.push({tag: st.tagName, designId, attr: st.getAttributeNames().map(a => ({name: a, value: st.getAttribute(a)}))});
        }
        st = st.parentElement;
      }
      st = (this.lastRange.endContainer.nodeType === TEXT_NODE) ?
        this.lastRange.endContainer.parentElement : this.lastRange.endContainer as HTMLElement;
      while (st !== p) {
        const designId = st.getAttribute(DESIGNER_ATTR_NAME);
        if (designId) {
          const i = tmp.findIndex(v => v.designId === designId);
          if (i >= 0) {
            const o = tmp.splice(i, 1);
            result.open.push({tag: o[0].tag, attr: o[0].attr});
          }
        }
      }
      for (const o of tmp) {
        result.close.push(o.tag);
      }
    }
    return result;
  }
  private txtSortOut(): string {
    let src = '';
    const sourOut = this.sortOut();
    for (const e of sourOut.open) {
      let attr = '';
      for (const a of e.attr) {
        attr += ` ${a.name}="${a.value || a.name}"`;
      }
      src += `<${e.tag}${attr}>`;
    }
    for (const e of sourOut.close) {
      src += `</${e}>`;
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

  /**
   * When wrap - I need index of new element and were I want point: before or after (it I can define from selection before)
   * When insert:
   *  - if was collapsed and one char was inserted:
   *    - node can be empty before so I need this node and offset to find new text node
   *    - else else I need this node and offset to increment offset
   *  - if was collapsed and one element was inserted:
   *    - I need designId of this element
   *  - if I don't know what was inserted so I collapse to the start
   *  - if isn't collapsed
   *    - I need focus of selected and it position:
   *      - if focus is from start source: I need to know this position from updated parent to find it after modifying
   *      - if focus is to end source: I need know this position by obtain designId of a node that is parent to focus and
   *      position from the node. So I can find this node and define new position (this node would created by sortOut)
   */
  // tslint:disable-next-line:max-line-length
  preCollapse(lastRange?: Range): {collapsed: boolean, toEnd: boolean, nodeType: number, tagName: string, designId: string, order: number, offset: number} {
    if (!lastRange) {
      lastRange = this.lastRange;
    }
    const selection = window.getSelection();
    // tslint:disable-next-line:no-bitwise
    const toEnd = !(selection.anchorNode.compareDocumentPosition(selection.focusNode) & 2);
    const collapseTo = toEnd ? {node: lastRange.endContainer, offset: lastRange.endOffset}
      : {node: lastRange.startContainer, offset: lastRange.startOffset};
    let designId = '0';
    let tagName = 'DIV';
    let order = 0;
    let offset = 0;
    if (collapseTo.node.nodeType === ELEMENT_NODE) {
      designId = (collapseTo.node as HTMLElement).getAttribute(DESIGNER_ATTR_NAME);
      tagName = (collapseTo.node as HTMLElement).tagName;
      order = toEnd ? collapseTo.node.childNodes.length - collapseTo.offset : collapseTo.offset;
    } else {
      designId = collapseTo.node.parentElement.getAttribute(DESIGNER_ATTR_NAME);
      tagName = collapseTo.node.parentElement.tagName;
      order = orderOfChild(collapseTo.node.parentElement, collapseTo.node, !toEnd);
      offset = toEnd ? collapseTo.node.textContent.length - collapseTo.offset : collapseTo.offset;
    }
    // tslint:disable-next-line:max-line-length
    return {collapsed: selection.isCollapsed, toEnd, nodeType: collapseTo.node.nodeType, tagName, designId, order, offset};
  }

  /**
   * set window selection to new position
   * @param op type of modifying
   * @param pre is result of preCollapse
   * @param length define shift
   */
  collapseTo(op: 'ins' | 'del' | 'wrap',
             // tslint:disable-next-line:max-line-length
             pre: {collapsed: boolean, toEnd: boolean, nodeType: number, tagName: string, designId: string, order: number, offset: number},
             length: number): void {
    let node = findDesignElement(this.editor, pre.designId) as Node;
    if (pre.nodeType === TEXT_NODE) {
      if (pre.toEnd) {
        node = node.childNodes[pre.order] as Node;
      } else {
        node = node.childNodes[node.childNodes.length - pre.order];
      }
    }
    const range = document.createRange();
    range.setEnd(this.editor, 0);
    switch (op) {
      case 'del':
      case 'wrap':
        if (pre.toEnd) {
          range.setStartAfter(node);
        } else {
          range.setStartBefore(node);
        }
        break;
      case 'ins':
        if (length < 0) { // we insert something unknown
          range.setStart(this.editor, 0);
        } else if (pre.nodeType === TEXT_NODE) {
          range.setStart(node, pre.offset);
        } else {
          range.setStartAfter(node);
        }
        break;
    }
    if (pre.toEnd) {
      window.getSelection().collapse(range.startContainer, range.startOffset);
    } else {
      window.getSelection().collapse(range.endContainer, range.endOffset);
    }
  }
  private insert(ch: string): void {
    const start = syncPosition(this.lastRange.startContainer, this.lastRange.startOffset, this.editor, this.source);
    const end = syncPosition(this.lastRange.endContainer, this.lastRange.endOffset, this.editor, this.source);
    const pre = this.preCollapse();
    const str = this.txtSortOut() + ch;
    const addNode = pre.nodeType === ELEMENT_NODE ? 1 : 0;
    this.update(start, end, str);
    let node = findDesignElement(this.editor, pre.designId) as Node;
    let offset = 0;
    if (pre.toEnd) {
      node = node.childNodes[node.childNodes.length - (pre.order + addNode)];
      offset = node.textContent.length - pre.offset;
    } else {
      node = node.childNodes[pre.order];
      offset = pre.offset + ch.length;
    }
    window.getSelection().collapse(node, offset);
    this.lastRange = window.getSelection().getRangeAt(0);
  }
  private insertTag(tag: string): void {
    const start = syncPosition(this.lastRange.startContainer, this.lastRange.startOffset, this.editor, this.source);
    const end = syncPosition(this.lastRange.endContainer, this.lastRange.endOffset, this.editor, this.source);
    const pre = this.preCollapse();
    const id = '' + this.designIndex++;
    const isEmpty = isEmptyElement(tag);
    const str = this.txtSortOut()
      + (isEmpty ? `<${tag} ${DESIGNER_ATTR_NAME}="${id}">` : `<${tag} ${DESIGNER_ATTR_NAME}="${id}"></${tag}>`) ;
    this.update(start, end, str);
    const node = findDesignElement(this.editor, id) as Node;
    if (isEmpty) {
      const order = orderOfChild(node.parentNode, node) + 1;
      if (node.parentNode.childNodes[order] && node.parentNode.childNodes[order].nodeType === TEXT_NODE) {
        window.getSelection().collapse(node.parentNode.childNodes[order], 0);
      } else {
        window.getSelection().collapse(node.parentNode, order);
      }
    } else {
      window.getSelection().collapse(node, 0);
    }
    this.lastRange = window.getSelection().getRangeAt(0);
  }
  private delete(after = true): void {
    if (!this.lastRange.collapsed) {
      const start = syncPosition(this.lastRange.startContainer, this.lastRange.startOffset, this.editor, this.source);
      const end = syncPosition(this.lastRange.endContainer, this.lastRange.endOffset, this.editor, this.source);
      const pre = this.preCollapse();
      const str = this.txtSortOut();
      this.update(start, end, str);
      this.collapseTo('ins', pre, str.length);
    } else {
      const st = this.lastRange.startContainer;
      const prev = prevPosition(st, this.lastRange.startOffset, this.editor);
      const next = nextPosition(st, this.lastRange.startOffset, this.editor);
      const range = document.createRange();
      if (prev.container !== st && next.container !== st) {
        range.setStart(prev.container, prev.offset);
        range.setEnd(next.container, next.offset);
        const pre = this.preCollapse(range);
        const start = syncPosition(range.startContainer, range.startOffset, this.editor, this.source);
        const end = syncPosition(range.endContainer, range.endOffset, this.editor, this.source);
        this.update(start, end, '');
        this.collapseTo('del', pre, 0);
      } else {
        let to = prev;
        if (after) {
          to = next;
        }
        if (to.container === st) {
          if (after) {
            range.setStart(this.lastRange.startContainer, this.lastRange.startOffset);
            range.setEnd(to.container, to.offset);
          } else {
            range.setStart(to.container, to.offset);
            range.setEnd(this.lastRange.startContainer, this.lastRange.startOffset);
          }
          const pre = this.preCollapse(range);
          const start = syncPosition(range.startContainer, range.startOffset, this.editor, this.source);
          const end = syncPosition(range.endContainer, range.endOffset, this.editor, this.source);
          this.update(start, end, '');
          this.collapseTo('del', pre, 0);
        } else {
          range.setStart(to.container, to.offset);
          range.setEnd(to.container, to.offset);
          window.getSelection().removeAllRanges();
          window.getSelection().addRange(range);
          this.lastRange = range;
          this.delete(after);
        }
      }
    }
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
    this.editor.innerHTML = this.source;
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
    if (event.key.length > 1 && !KNOWN_KEYS.includes(event.key)) {
      console.error('onKeyPress input not editable symbol', event.key);
      return;
    }
    if (NAVIGATION_KEYS.includes(event.key)) {
      return;
    }
    this._sourceModified = true;
  }
}
