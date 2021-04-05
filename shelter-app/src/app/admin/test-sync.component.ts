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
  designAttr = 0;
  source = '';
  designIndex = 0;
  editor: HTMLDivElement;
  lastRange: Range;
  @ViewChild('editor', {static: true}) editorRef: ElementRef<HTMLDivElement>;
  constructor() { }

  ngOnInit(): void {
    this.editor = this.editorRef.nativeElement;
  }
  syncOnTouch(keyEvent?: KeyboardEvent): void {
    /* A user can normally only select one range at a time, so the rangeCount will usually be 1.
     Scripting can be used to make the selection contain more than one range. We do not use script here!
     */
    if (window.getSelection().rangeCount > 1) {
      console.log('There is  modified range by script');
      this.lastRange = null;
      return;
    }
    const range = window.getSelection().getRangeAt(0);
    console.log('syncOnTouch', range);
    // withdraw custom elements nodes and change selection
    const startContainer = findNodeDown(range.startContainer,
      (n) => n && (n === range.endContainer || n.parentElement === this.editor
        || (n.nodeType === ELEMENT_NODE && (n as HTMLElement).getAttribute(DESIGNER_ATTR_NAME) !== null)
        || (n.nodeType === TEXT_NODE && (n.parentElement === this.editor || n.parentElement.getAttribute(DESIGNER_ATTR_NAME) !== null))
      ));
    const endContainer = findNodeUp(range.endContainer,
      (n) => n && ( n === startContainer || n.parentElement === this.editor
        || (n.nodeType === ELEMENT_NODE && (n as HTMLElement).getAttribute(DESIGNER_ATTR_NAME) !== null)
        || (n.nodeType === TEXT_NODE && (n.parentElement === this.editor || n.parentElement.getAttribute(DESIGNER_ATTR_NAME) !== null ))
      ));
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
    this.lastRange = window.getSelection().getRangeAt(0);
  }
  belongDesigner(n: Node): boolean {
    return n && (n === this.editor
      || (n.nodeType === TEXT_NODE && (n.parentElement === this.editor || n.parentElement.getAttribute(DESIGNER_ATTR_NAME) !== null))
      || (n.nodeType === ELEMENT_NODE && (n as HTMLElement).getAttribute(DESIGNER_ATTR_NAME) !== null));
  }
  onClick(event: MouseEvent): void {
    console.log(event);
    if (this.checkAndMarkElements()) {
      this.editor.innerHTML = this.source;
    }
    this.syncOnTouch();
    console.log('onClick:', this.lastRange);
    console.log('onClick:', this.getModifiedPart((t, i) => t));
    if (this.lastRange) {
      const start = this.syncPosition(this.lastRange.startContainer, this.lastRange.startOffset);
      const end = this.syncPosition(this.lastRange.endContainer, this.lastRange.endOffset);
      console.log('onClick start:', start);
      console.log('onClick end:', end);
      console.log('onClick substr:', this.source.substring(start, end));
    }
  }
  getModifiedPart(f: (t: string, i: number) => string, keyEvent?: KeyboardEvent): {parent: HTMLElement, text: string, start, end} {
    // TODO is the end in the result really required?
    if (this.lastRange) {
      if (this.lastRange.commonAncestorContainer === this.editor) {
        return {parent: this.editor, text: this.source.substring(0), start: 0, end: this.source.length};
      } else {
        let parent = this.lastRange.commonAncestorContainer;
        if (parent.nodeType === ELEMENT_NODE) {
          let attr = (parent as HTMLElement).getAttribute(DESIGNER_ATTR_NAME);
          if (attr === null) {
            parent = findNodeUp(parent, (n) =>
              n && n.nodeType === ELEMENT_NODE && ((n as HTMLElement).getAttribute(DESIGNER_ATTR_NAME) !== null || n === this.editor));
            if (parent === this.editor) {
              return {parent: this.editor, text: this.source.substring(0), start: 0, end: this.source.length};
            }
            attr = (parent as HTMLElement).getAttribute(DESIGNER_ATTR_NAME);
          }
          const start = endSourceMark(attr, this.source);
          const end = this.endOfElement((parent as HTMLElement).tagName, start);
          return {parent: parent as HTMLElement, text: this.source.substring(start, end), start, end};
        } else {
          parent = parent.parentElement;
          if (parent === this.editor) {
            return {parent: this.editor, text: this.source.substring(0), start: 0, end: this.source.length};
          }
          const start = endSourceMark((parent as HTMLElement).getAttribute(DESIGNER_ATTR_NAME), this.source);
          const end = this.endOfElement((parent as HTMLElement).tagName, start);
          return {parent: parent as HTMLElement, text: this.source.substring(start, end), start, end};
        }
      }
    }
  }
  /**
   * Range: container, offset.
   * container type can be ELEMENT_NODE and TEXT_NODE, COMMENT_NODE, CDATA_NODE
   * if ELEMENT_NODE the offset is number of child node.
   *   If the node with this number is present it point on the begin of the node.
   *   If there is no node with this number, it point on the end of the node
   * If TEXT_NODE, COMMENT_NODE, CDATA_NODE the offset is the number of characters from the start
   * @param n Node
   * @param offset number
   */
  syncPosition(n: Node, offset: number): number {
    if (n.nodeType === ELEMENT_NODE) {
      if (n.childNodes[offset].nodeType === ELEMENT_NODE) {
        return startSourceMark((n.childNodes[offset] as HTMLElement).getAttribute(DESIGNER_ATTR_NAME), this.source);
      }
      if (offset === 0) {
        if (n === this.editor) {
          return 0;
        } else {
          return endSourceMark((n as HTMLElement).getAttribute(DESIGNER_ATTR_NAME), this.source);
        }
      }
      let start = 0;
      if (n !== this.editor) {
        start = endSourceMark((n as HTMLElement).getAttribute(DESIGNER_ATTR_NAME), this.source);
      }
      for (let i = 0; n.childNodes[i] && i < offset; ++i) {
        const ch = n.childNodes[i];
        if (ch.nodeType === ELEMENT_NODE) {
          start = endSourceMark((n as HTMLElement).getAttribute(DESIGNER_ATTR_NAME), this.source);
        } else if (ch.nodeType === COMMENT_NODE) {
          start = this.source.indexOf('-->', start) + 3;
        } else if (ch.nodeType === CDATA_SECTION_NODE) {
          start = this.source.indexOf(']]>', start) + 3;
        }
      }
      return start;
    } else {
      // we expect only TEXT_NODE here
      let start = 0;
      const parent = n.parentNode;
      for (; parent.childNodes[start] !== n; ++start){}
      start = this.syncPosition(parent, start);
      return start + offset + this.unicodes(start, offset);
    }
  }
  unicodes(start: number, end: number): number {
    let str = this.source.substr(start);
    let count = 0;
    do {
      const res = /&#(\d{2,4}|x[0-9a-zA-Z]{2,4});/.exec(str);
      if (res === null || res.index > end) {
        break;
      }
      count += (res[1].length + 2);
      end -= (res[1].length + 3);
      str = str.substr(res.index + res[1].length + 3);
    } while (true);
    return count;
  }
  endOfElement(tag: string, pos: number): number {
    const regexp = new RegExp(`<\/${tag}>`, 'gi');
    const chk = new RegExp(`<${tag}(\\s[^>]*|\\s?)>`, 'gi');
    let res = pos;
    do {
      const str = this.source.substring(pos);
      pos = str.search(regexp);
      if (pos === -1) {
        break;
      }
      res += pos;
      const p = str.search(chk);
      if (p !== -1 && p < pos) {
        pos = p;
      } else {
        break;
      }
    } while (true);
    if (pos >= 0) {
      return res;
    }
  }

  whatIsCase(): number {
    if (this.lastRange) {
      if (this.lastRange.startContainer === this.lastRange.endContainer) {
        return THE_SAME_NODE;
      }
      if (this.lastRange.startContainer.parentNode === this.lastRange.endContainer.parentNode) {
        return THE_SAME_PARENT;
      }
      return DIFFERENT_PARENTS;
    }
    return -1;
  }
  onKeyUp($event: KeyboardEvent): void {
    this.syncOnTouch();
    if (this.lastRange) {
      const start = this.syncPosition(this.lastRange.startContainer, this.lastRange.startOffset);
      console.log('onKeyUp', this.source.substr(start, 5));
    }
    console.log(this.lastRange);
  }
  onKeyPress(event: KeyboardEvent): void {
    console.log(event);
    if (event.altKey || event.ctrlKey || event.metaKey) {
      console.log('onKeyPress', true);
      return;
    }
    if (event.key.length > 1 && !KNOWN_KEYS.includes(event.key)) {
      console.log('onKeyPress input not editable symbol', event.key);
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
  private whitespace(key: string): void {
    const w = this.whatIsCase();
    if (w >= 0) {
      const part = this.getModifiedPart((t, i) => t);
      const start = this.syncPosition(this.lastRange.startContainer, this.lastRange.startOffset);
      const end = this.syncPosition(this.lastRange.endContainer, this.lastRange.endOffset);
      console.log(part.text, start, end);
      switch (key) {
        case 'Enter':
            switch (w) {
            case THE_SAME_NODE:
              const index = this.designIndex++;
              const tag = `<br ${DESIGNER_ATTR_NAME}="${index}">`;
              this.source = this.source.substring(0, start) + tag + this.source.substring(end);
              part.text = part.text.substring(0, start - part.start) + tag + part.text.substring(end - part.start);
              const startType = this.lastRange.startContainer.nodeType;
              part.parent.innerHTML = part.text;
              let i = 1;
              for ( let sibling = part.parent.firstChild;
                    !(sibling.nodeType === ELEMENT_NODE && (sibling as HTMLElement).getAttribute(DESIGNER_ATTR_NAME) === '' + index);
                    sibling = sibling.nextSibling, i++){}
              window.getSelection().collapse(part.parent, i);
              break;
            }
            break;
          case 'Tab':
            break;
      }
    }
  }

  private editingKey(key: string): void {
    switch (key) {
      case 'Backspace':
        // this.source = this.source.substring(0, cursor[0].finish - 1) + this.source.substring(cursor[0].finish);
        break;
      case 'Delete':
        // this.source = this.source.substring(0, cursor[0].finish) + this.source.substring(cursor[0].finish + 1);
        break;
      case 'Insert':
        break;
    }
    this.editor.innerHTML = this.source;
  }

  private simpleChar(key: string): void {
    // this.source = this.source.substring(0, cursor[0].finish) + key + this.source.substring(cursor[0].finish);
    this.editor.innerHTML = this.source;
    const sel = window.getSelection();
    window.getSelection().setPosition(sel.focusNode, sel.focusOffset + 1);
  }
  checkAndMarkElements(): boolean {
    let result = false;
    const upd = this.source.replace(/<([a-zA-Z][^</]*)(\/?)>/g, (s: string, ...args: any[]) => {
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

}
