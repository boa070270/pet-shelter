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
const TEXT_NODE = 3;
const ELEMENT_NODE = 1;
const DESIGNER_ATTR_NAME = '_design';
interface Cursor {
  parent: HTMLElement;
  indexOfChildren: number;
  start: number;
  finish: number;
  updateElement?: HTMLElement; // If absent, than parent contain an marked element that need to be updated
}
function isDescendant(parent: Node, child: Node): boolean {
  if (parent && child) {
    while (child !== parent && child !== null) {
      child = child.parentNode;
    }
    return child === parent;
  }
  return false;
}
function indexOfChildren(node: Node): number {
  let i = 0;
  while (node.previousSibling !== null) {
    node = node.previousSibling;
    ++i;
  }
  return i;
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
function findEndOfTag(tag: string, source: string, p: number = 0): number {
  const regexp = new RegExp(`</${tag}\s*>`, 'ig');
  return source.substring(p).search(regexp);
}
function isEmptyElement(n: Node): boolean {
  return n.nodeType === ELEMENT_NODE && n.firstChild === null;
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
  syncSource(cursor: Cursor[]): {fromParent: number, toParent: number, start: number, end: number} {
    if (cursor.length === 1) {
      if (cursor[0].parent === this.editor) {
        return {fromParent: 0, toParent: this.source.length, start: cursor[0].start, end: cursor[0].finish};
      }
      const attr = cursor[0].parent.getAttribute(DESIGNER_ATTR_NAME);
      const regexp = new RegExp(`<([a-zA-Z][^<>]*\\s${DESIGNER_ATTR_NAME}="${attr}"[^<>]*)>`, 'g');
      const res = regexp.exec(this.source);
      const fromParent = res.index + res[0].length;
      const toParent = this.source.indexOf('<', fromParent);
      return {fromParent, toParent, start: fromParent + cursor[0].start, end: fromParent + cursor[0].finish};
    } else {
      const result = {fromParent: 0, toParent: 0, start: 0, end: 0};
      if ( ((cursor[0].updateElement || cursor[0].parent) === this.editor)
        || ((cursor[1].updateElement || cursor[1].parent) === this.editor) ) {
        result.fromParent = 0;
        result.toParent = this.source.length;
        let attr = cursor[0].parent.getAttribute(DESIGNER_ATTR_NAME);
        let pos = result.fromParent;
        if (attr !== null) {
          const regexp = new RegExp(`<([a-zA-Z][^<>]*\\s${DESIGNER_ATTR_NAME}="${attr}"[^<>]*)>`, 'gs');
          const res = regexp.exec(this.source);
          pos = res.index + res[0].length;
        }
        for (let i = 0; i < cursor[0].indexOfChildren; ++i) {
          pos = this.source.indexOf('>', pos);
        }
        result.start = pos + cursor[0].start;
        pos = result.fromParent;
        attr = cursor[1].parent.getAttribute(DESIGNER_ATTR_NAME);
        if (attr !== null) {
          const regexp = new RegExp(`<([a-zA-Z][^<>]*\\s${DESIGNER_ATTR_NAME}="${attr}"[^<>]*)>`, 'gs');
          const res = regexp.exec(this.source);
          pos = res.index + res[0].length;
        }
        for (let i = 0; i < cursor[1].indexOfChildren; ++i) {
          pos = this.source.indexOf('>', pos);
        }
        result.end = pos + cursor[1].finish;
      } else if (cursor[0].parent === cursor[1].parent) {
        const attr = cursor[0].parent.getAttribute(DESIGNER_ATTR_NAME);
        const regexp = new RegExp(`<([a-zA-Z][^<>]*\\s${DESIGNER_ATTR_NAME}="${attr}"[^<>]*)>`, 'gs');
        const res = regexp.exec(this.source);
        let pos = res.index + res[0].length;
        result.fromParent = pos;
        for (let i = 0; i < cursor[0].indexOfChildren; ++i) {
          pos = this.source.indexOf('>', pos);
        }
        result.start = pos + cursor[0].start;
        pos = result.fromParent;
        for (let i = 0; i < cursor[1].indexOfChildren; ++i) {
          pos = this.source.indexOf('>', pos);
        }
        result.end = pos + cursor[1].finish;
        result.toParent = this.source.indexOf('<', result.end);
      } else {
        let attr = cursor[0].parent.getAttribute(DESIGNER_ATTR_NAME);
        let regexp = new RegExp(`<([a-zA-Z][^<>]*\\s${DESIGNER_ATTR_NAME}="${attr}"[^<>]*)>`, 'gs');
        let res = regexp.exec(this.source);
        let pos = res.index + res[0].length;
        result.fromParent = this.source.indexOf('>', pos);
        pos = result.fromParent;
        for (let i = 0; i < cursor[0].indexOfChildren; ++i) {
          pos = this.source.indexOf('>', pos);
        }
        result.start = pos + cursor[0].start;
        attr = cursor[1].parent.getAttribute(DESIGNER_ATTR_NAME);
        regexp = new RegExp(`<([a-zA-Z][^<>]*\\s${DESIGNER_ATTR_NAME}="${attr}"[^<>]*)>`, 'gs');
        res = regexp.exec(this.source);
        pos = res.index + res[0].length;
        for (let i = 0; i < cursor[1].indexOfChildren; ++i) {
          pos = this.source.indexOf('>', pos);
        }
        result.end = pos + cursor[1].finish;
        // for toParent need to find next sibling that has DESIGNER_ATTR_NAME
        let parent = cursor[0].updateElement || cursor[0].parent;
        parent = findNodeDown(parent.nextSibling,
          ( n) => (n && n.nodeType === ELEMENT_NODE) && ((n as HTMLElement).getAttribute(DESIGNER_ATTR_NAME)) !== null) as HTMLElement;
        if (parent === null) {
          result.end = this.source.length;
        } else {
          attr = parent.getAttribute(DESIGNER_ATTR_NAME);
          regexp = new RegExp(`<([a-zA-Z][^<>]*\\s${DESIGNER_ATTR_NAME}="${attr}"[^<>]*)>`, 'gs');
          res = regexp.exec(this.source);
          result.end = res.index + res[0].length;
        }
      }
      return result;
    }
  }
  onClick(event: MouseEvent): void {
    console.log(event);
    if (this.checkAndMarkElements()) {
      this.editor.innerHTML = this.source;
    }
    this.syncOnTouch();
    console.log('syncOnTouch:', this.lastRange);
    console.log('syncOnTouch:', this.getModifiedPart((t, i) => t));
    if (this.lastRange) {
      const start = this.syncPosition(this.lastRange.startContainer, this.lastRange.startOffset);
      const end = this.syncPosition(this.lastRange.endContainer, this.lastRange.endOffset);
      console.log('syncOnTouch start:', start);
      console.log('syncOnTouch end:', end);
      console.log('syncOnTouch substr:', this.source.substring(start, end));
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
          const res = findSourceMark(attr, this.source);
          const start = res.index + res[0].length;
          const end = this.endOfElement((parent as HTMLElement).tagName, start);
          return {parent: parent as HTMLElement, text: this.source.substring(start, end), start, end};
        } else {
          parent = parent.parentElement;
          if (parent === this.editor) {
            return {parent: this.editor, text: this.source.substring(0), start: 0, end: this.source.length};
          }
          const res = findSourceMark((parent as HTMLElement).getAttribute(DESIGNER_ATTR_NAME), this.source);
          const start = res.index + res[0].length;
          const end = this.endOfElement((parent as HTMLElement).tagName, start);
          return {parent: parent as HTMLElement, text: this.source.substring(start, end), start, end};
        }
      }
    }
  }
  syncPosition(n: Node, offset: number): number {
    // let prevMark = n;
    let parent = n;
    let child = offset;
    let shift = 0;
    if (n.nodeType === TEXT_NODE) {
      parent = n.parentNode;
      shift = offset;
      for (child = 0; child < parent.childNodes.length; ++child) {
        if (parent.childNodes[child] === n) {
          break;
        }
      }
    }
    // for (;child >= 0; --child) {
    //   if (parent.nodeType === ELEMENT_NODE) {
    //
    //   }
    // }
    const prevMark = findNodeUp(n, (s) =>
      s === this.editor || (s.nodeType === ELEMENT_NODE && (s as HTMLElement).getAttribute(DESIGNER_ATTR_NAME) !== null));
    let start = 0;
    if (prevMark !== this.editor) {
      const res = findSourceMark((prevMark as HTMLElement).getAttribute(DESIGNER_ATTR_NAME), this.source);
      start = res.index + res[0].length;
    }
    return start + offset;
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
    const upd = this.source.replace(/<([a-zA-Z][^<]*)>/g, (s: string, ...args: any[]) => {
      const tagBody = args[0] as string;
      if (tagBody.indexOf(DESIGNER_ATTR_NAME) === -1) {
        result = true;
        return `<${tagBody} ${DESIGNER_ATTR_NAME}="${this.designIndex++}">`;
      }
      return s;
    });
    if (result) {
      this.source = upd;
    }
    return result;
  }

}
