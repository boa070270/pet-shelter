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
  parent: Element;
  indexOfChildren: number;
  start: number;
  finish: number;
  updateElement?: Element; // If absent, than parent contain an marked element that need to be updated
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
  if (node.firstChild) {
    return firstGrandChild(node.firstChild);
  }
  return node;
}
function lastGrandChild(node: Node): Node {
  if (node.lastChild) {
    return lastGrandChild(node.lastChild);
  }
  return node;
}
function findNodeUp(from: Node, criteria: (n: Node) => boolean): Node {
  if (criteria(from)) {
    return from;
  }
  while (from.previousSibling) {
    from = from.previousSibling;
    if (from.nodeType === ELEMENT_NODE) {
      from = lastGrandChild(from);
    }
    if (criteria(from)) {
      return from;
    }
  }
  // there is nothing on sibling level, so level up
  do {
    from = from.parentNode;
    if (criteria(from)) {
      return from;
    }
  } while (from.previousSibling === null);
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
  while (from.nextSibling) {
    from = from.nextSibling;
    if (from.nodeType === ELEMENT_NODE) {
      from = firstGrandChild(from);
    }
    if (criteria(from)) {
      return from;
    }
  }
  // there is nothing on sibling level, so level up
  do {
    from = from.parentNode;
    if (criteria(from)) {
      return from;
    }
  } while (from.nextSibling === null);
  // we on the node that has nextSibling, lets check these children from the nearest
  from = from.nextSibling;
  if (from.nodeType === ELEMENT_NODE) {
    return findNodeDown(firstGrandChild(from), criteria);
  } else {
    return findNodeDown(from, criteria);
  }
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
  styleUrls: ['./test-sync.component.sass']
})
export class TestSyncComponent implements OnInit {
  position = 0;
  designAttr = 0;
  source = '';
  designIndex = 0;
  editor: HTMLDivElement;
  cursors: Cursor[];
  @ViewChild('editor', {static: true}) editorRef: ElementRef<HTMLDivElement>;
  constructor() { }

  ngOnInit(): void {
    this.editor = this.editorRef.nativeElement;
  }
  syncOnTouch(): Cursor[] {
    /* A user can normally only select one range at a time, so the rangeCount will usually be 1.
     Scripting can be used to make the selection contain more than one range. We do not use script here!
     */
    if (window.getSelection().rangeCount > 1) {
      console.log('There is  modified range by script');
      return null;
    }
    let range = window.getSelection().getRangeAt(0);
    // withdraw custom elements nodes and change selection
    const startContainer = findNodeDown(range.startContainer,
      (n) => (n.nodeType === TEXT_NODE && (n.parentElement.getAttribute(DESIGNER_ATTR_NAME) !== null || n.parentElement === this.editor))
        || n === range.endContainer);
    const endContainer = findNodeUp(range.endContainer,
      (n) => (n.nodeType === TEXT_NODE && (n.parentElement.getAttribute(DESIGNER_ATTR_NAME) !== null || n.parentElement === this.editor))
        || n === startContainer);
    if (startContainer === endContainer
      && startContainer.parentElement.getAttribute(DESIGNER_ATTR_NAME) !== null
      && startContainer.parentElement !== this.editor) {
      // this text absent in our designer
      // TODO we can show snake menu here to explain this case to user
      return null;
    }
    if (startContainer !== range.startContainer || endContainer !== range.endContainer) {
      window.getSelection().setBaseAndExtent(startContainer,
        startContainer !== range.startContainer ? 0 : range.startOffset,
        endContainer,
        endContainer !== range.endContainer ? endContainer.textContent.length : range.endOffset);
      range = window.getSelection().getRangeAt(0);
    }

    const {isCollapsed, anchorNode, focusNode} = window.getSelection();
    if (!isDescendant(this.editor, focusNode) || !isDescendant(this.editor, anchorNode)) { // Case 6 simplified
      return null;
    }
    if (isCollapsed && anchorNode.parentElement.getAttribute(DESIGNER_ATTR_NAME) === null) { // case 1.1
      return null;
    }
    if (focusNode.parentElement === anchorNode.parentElement) {
      const parent = focusNode.parentElement;
      if (focusNode === anchorNode) { // Case 1. Case 3. The nodes are same TEXT_NODE
        if (focusNode.nodeType === TEXT_NODE) {
          return [{
            parent,
            indexOfChildren: indexOfChildren(focusNode),
            start: range.startOffset,
            finish: range.endOffset
          }];
        } else {
          console.log('Not text node', isCollapsed);
          return [{parent: this.editor, indexOfChildren: 0, start: 0, finish: 0}];
        }
      } else { // Case 4. The nodes are different but have the same parent
        return [{
          parent,
          indexOfChildren: indexOfChildren(anchorNode),
          start: range.startOffset,
          finish: undefined
        }, {
          parent,
          indexOfChildren: indexOfChildren(focusNode),
          start: 0,
          finish: range.endOffset
        }];
      }
    } else { // Case 5. The nodes have different parents
        let commonParent = range.commonAncestorContainer as Element;
        // step up until define parent from design
        while (commonParent.getAttribute(DESIGNER_ATTR_NAME) !== null
          || commonParent !== this.editor) {
          commonParent = commonParent.parentElement;
        }
        return [{
          parent: range.startContainer.parentElement,
          indexOfChildren: indexOfChildren(range.startContainer),
          start: (startContainer === range.startContainer.parentElement) ? range.startOffset : 0,
          finish: undefined,
          updateElement: commonParent
        }, {
          parent: range.endContainer.parentElement,
          indexOfChildren: indexOfChildren(range.startContainer),
          start: 0,
          finish: (endContainer === range.endContainer.parentElement) ? range.endOffset : undefined,
          updateElement: commonParent
        }];
    }
  }
  syncSource(cursor: Cursor[]): {fromParent: number, toParent: number, start: number, end: number} {
    if (cursor.length === 1) {
      if (cursor[0].parent === this.editor) {
        return {fromParent: 0, toParent: this.source.length, start: cursor[0].start, end: cursor[0].finish};
      }
      const attr = cursor[0].parent.getAttribute(DESIGNER_ATTR_NAME);
      const regexp = new RegExp(`/<([a-zA-Z][^<>]*\s${DESIGNER_ATTR_NAME}="${attr}"[^<>]*)>/g`);
      const startElement = this.source.search(regexp);
      const fromParent = this.source.indexOf('>', startElement);
      const toParent = this.source.indexOf('<', fromParent);
      return {fromParent, toParent, start: fromParent + cursor[0].start, end: fromParent + cursor[0].finish};
    } else {
      const result = {fromParent: 0, toParent: 0, start: 0, end: 0};
      let attr = cursor[0].parent.getAttribute(DESIGNER_ATTR_NAME);
      let regexp = new RegExp(`/<([a-zA-Z][^<>]*\s${DESIGNER_ATTR_NAME}="${attr}"[^<>]*)>/g`);
      let startElement = this.source.search(regexp);
      if (cursor[0].parent === cursor[1].parent) {
        result.fromParent = this.source.indexOf('>', startElement);
        result.start = result.fromParent + cursor[0].start;
      }
      attr = cursor[1].parent.getAttribute(DESIGNER_ATTR_NAME);
      regexp = new RegExp(`/<([a-zA-Z][^<>]*\s${DESIGNER_ATTR_NAME}="${attr}"[^<>]*)>/g`);
      startElement = this.source.search(regexp);
      const fromParent = this.source.indexOf('>', startElement);
      result.end = fromParent + cursor[1].finish;
      result.toParent = this.source.indexOf('<', fromParent);
      return result;
    }
  }
  onClick(event: MouseEvent): void {
    console.log(event);
    this.cursors = this.syncOnTouch();
    if (this.checkAndMarkElements()) {
      this.editor.innerHTML = this.source;
    }
    console.log('syncOnTouch:', this.cursors);
    if (this.cursors) {
      console.log('syncOnTouch:', this.syncSource(this.cursors));
    }
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
    const cursor = this.syncOnTouch();
    if (cursor) {
      if (WHITESPACE_KEYS.includes(event.key)) {
        this.whitespace(cursor, event.key);
      } else if (EDITING_KEYS.includes(event.key)) {
        this.editingKey(cursor, event.key);
      } else if (NAVIGATION_KEYS.includes(event.key)) {
        this.cursors = cursor;
      } else {
        this.simpleChar(cursor, event.key);
      }
    }
    event.preventDefault();
  }
  private whitespace(cursor: Cursor[], key: string): void {
    switch (key) {
      case 'Enter':
        const range = this.syncSource(cursor);
        this.source = this.source.substring(0, range.start) + '<br>' + this.source.substring(range.end);
        break;
      case 'Tab':
        break;
    }
    this.editor.innerHTML = this.source;
  }

  private editingKey(cursor: Cursor[], key: string): void {
    switch (key) {
      case 'Backspace':
        this.source = this.source.substring(0, cursor[0].finish - 1) + this.source.substring(cursor[0].finish);
        break;
      case 'Delete':
        this.source = this.source.substring(0, cursor[0].finish) + this.source.substring(cursor[0].finish + 1);
        break;
      case 'Insert':
        break;
    }
    this.editor.innerHTML = this.source;
  }

  private simpleChar(cursor: Cursor[], key: string): void {
    this.source = this.source.substring(0, cursor[0].finish) + key + this.source.substring(cursor[0].finish);
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
