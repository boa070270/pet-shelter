
// tslint:disable:max-line-length
import {NodeWrapper, SNodeIterator, treeWalker, treeWalkerR} from './html-helper';
import {HtmlRules} from './html-rules';
import {LibNode} from './lib-node-iterator';

export interface StartEnd { start: number; end: number; }
const EMPTY_S_RANGE: StartEnd = {start: 0, end: 0};
function chkAttribute(n: string, attr?: {[key: string]: string}): any {
  if (attr) {
    const f = Object.keys(attr).find((k) => k.toLowerCase() === n.toLowerCase());
    if (f) {
      return attr[f] ? attr[f].toLowerCase() : attr[f];
    }
  }
  return null;
}
export abstract class SNode extends NodeWrapper {
  get next(): SNode {
    if (this.parent) {
      return this.parent.children[this.index + 1] || null;
    }
    return null;
  }
  get prev(): SNode {
    if (this.parent) {
      return this.parent.children[this.index - 1] || null;
    }
    return null;
  }
  get firstChild(): SNode {
    return null;
  }
  get lastChild(): SNode {
    return null;
  }
  get index(): number {
    return this.parent ? this.parent.children.indexOf(this) : -1;
  }
  get numChildren(): number {
    return 0;
  }
  protected constructor(typeNode: number, nodeName: string, text?: string, public inRange?: StartEnd, public outRange?: StartEnd, public isRoot = false) {
    super();
    this.inRange = inRange;
    this.outRange = outRange;
    this.typeNode = typeNode;
    this.nodeName = nodeName.toLowerCase();
    this._txt = text;
  }
  typeNode: number;
  nodeName: string;
  children: SNode[] = null;
  attr?: {[key: string]: string};
  parent: SNode = null;
  // 0 - without change, -1 - deleted, 1 - modified (or new)
  state = 0;
  protected _txt: string;
  static textNode(text: string, inRange?: StartEnd, outRange?: StartEnd): SNode { // the state was set during add
    return new SNodeText(htmlDecode(text), inRange || EMPTY_S_RANGE, outRange || EMPTY_S_RANGE);
  }
  static elementNode(nodeName: string, attr?: any, inRange?: StartEnd, outRange?: StartEnd, asRoot = false): SNode { // the state was set during add
    const n = new SNodeElement(nodeName, inRange || EMPTY_S_RANGE, outRange || EMPTY_S_RANGE, asRoot);
    n.attr = attr || {};
    return n;
  }
  static commentNode(text: string, inRange?: StartEnd, outRange?: StartEnd): SNode {
    return new SNodeComment(text, inRange, outRange);
  }
  static cdataNode(text: string, inRange?: StartEnd, outRange?: StartEnd): SNode {
    return new SNodeCData(text, inRange, outRange);
  }
  /**
   * define node for this position. If position point to null, return value depends on r.
   * r < 0 - return node before, r > 0 return node after, 0 - null
   * @param sp SPosition
   * @param r number
   */
  static inPosition(sp: SPosition, r?: number): SNode {
    const n = sp.n as SNode;
    if (n.typeNode === Node.ELEMENT_NODE && n.children) {
      if (n.children[sp.offset] === null && !r) {
        if (r > 0) {
          return n.next;
        }
        return sp.offset === 0 ? n : n.children[sp.offset - 1];
      }
      return n.children[sp.offset];
    }
    return n;
  }
  static splitBranch(nodeName: string, from: SNode, offset: number, root: SNode, crossNode: SNode, copyTop: boolean,
                     copyAttr: (attr: {[key: string]: string}) => {[key: string]: string}): {crossed: boolean, topNode: SNode, children: SNode[], newChildren: SNode[], text: string} {
    let text = '';
    let textNode = null;
    const children: SNode[] = [];
    const newChildren: SNode[] = [];
    let crossed = false;
    if (from.typeNode === Node.ELEMENT_NODE) {
      from = from.children[offset];
    } else {
      text = from.getText();
      textNode = from;
      from.setText(text.substring(0, offset));
    }
    let topNode = from.parent;
    while (topNode.nodeName !== nodeName) {
      children.unshift(topNode);
      if (topNode.equal(crossNode)) {
        crossed = true;
      }
      topNode = topNode.parent;
    }
    let last = topNode.parent;
    if (copyTop) {
      children.unshift(topNode);
    }
    let m = null;
    for (const c of children) {
      const t = last.newChild(SNode.elementNode(c.nodeName, copyAttr(c.attr)), Number.MAX_VALUE);
      newChildren.push(t);
      m = c.next;
      while (m) {
        last.newChild(m, Number.MAX_VALUE);
        m = m.next;
      }
      last = t;
    }
    m = from.next;
    if (m) {
      newChildren.push(m);
    }
    while (m) {
      last.newChild(m, Number.MAX_VALUE);
      m = m.next;
    }
    if (textNode) {
      newChildren.push(last.newChild(SNode.textNode(text.substring(offset)), 0));
    }
    return {topNode, crossed, children, text, newChildren};
  }

  static splitTextByNode(sp: SPosition, sn: SNode, wrap = true): {newNode: SNode, txtNode: SNode} {
    if (sp.n.typeNode === Node.TEXT_NODE) {
      const txt = sp.n.getText();
      sp.n.setText(txt.substring(0, sp.offset));
      const newNode = sp.n.parent.newChild(sn, sp.n.index + 1);
      let txtNode;
      if (wrap && HtmlRules.elements[sn.nodeName][1] && HtmlRules.elements[sn.nodeName][1].cnt) {
        txtNode = newNode.newChild(SNode.textNode(txt.substring(sp.offset)), 0);
      } else {
        newNode.validate();
        txtNode = sp.n.parent.newChild(SNode.textNode(txt.substring(sp.offset)), newNode.index + 1);
      }
      return {newNode, txtNode};
    }
    return null;
  }
  static splitText(sp: SPosition, nodeName: string, attr: {[key: string]: string}, wrap = true): {newNode: SNode, txtNode: SNode} {
    return SNode.splitTextByNode(sp, SNode.elementNode(nodeName, attr), wrap);
  }
  static validates(nodes: SNode[]): void {
    for (const n of nodes) {
      n.validate();
    }
  }
  static splitStatic(sp: SPosition, cp: (attr: {[key: string]: string}) => {[key: string]: string}): SPosition {
    if (sp.n.parent) { // splitting only if there is parent
      if (sp.n.typeNode === Node.ELEMENT_NODE) {
        const nn = SNode.elementNode(sp.n.nodeName, cp(sp.n.attr));
        sp.n.parent.newChild(nn, sp.n.index + 1);
        let ixn = 0;
        for (let i = sp.offset; i < sp.n.parent.numChildren; ++i) {
          sp.n.children[i].move(nn, ixn++);
        }
        SNode.validates([sp.n, nn, nn.parent]);
        return new SPosition(nn.parent, nn.index);
      } else if (sp.n.typeNode === Node.TEXT_NODE && sp.n.parent.parent) {
        const nn = this.splitText(sp, sp.n.parent.nodeName, cp(sp.n.parent.attr));
        return new SPosition(nn.newNode, nn.newNode.index);
      }
    }
    return null;
  }
  attribute(name: string): string {
    return null;
  }
  equal(n: NodeWrapper): boolean {
    return this === n;
  }
  abstract clone(cp?: (attr: {[key: string]: string}) => {[key: string]: string}): SNode;
  abstract source(onlyBody?: boolean): string;
  modified(): void {
    if (!this.state) {
      this.state = 1;
    }
    if (this.typeNode !== Node.ELEMENT_NODE) {
      this.parent.modified();
    }
  }
  delete(): void {
    this.state = -1;
    this.parent.modified();
  }
  addChild(n: SNode): SNode {
    return n;
  }
  validate(correct = true): void {}
  newChild(n: SNode, inx: number): SNode {
    return n;
  }
  replace(nodeName: string, attr?: any): SNode {
    return this;
  }
  abstract insert(sn: SNode, cp: (a: {[key: string]: string}) => {[key: string]: string}, from: number, to?: number): {sn: SNode, wrapped: SNode[], after: SNode};
  wrapThis(n: SNode): SNode {
    if (this.parent === null) {
      throw new Error('Prohibited to wrap parent');
    }
    n.parent = this.parent;
    this.parent.children[this.index] = n;
    n.addChild(this);
    if (n.typeNode !== Node.ELEMENT_NODE) {
      throw new Error('Text node cannot contain child');
    }
    n.validate();
    this.modified();
    n.modified();
    this.parent.modified();
    return n;
  }
  wrapChildren(n: SNode, from = 0, to?: number): SNode {
    return n;
  }
  extractChildren(): void {}
  unwrapChildren(): SNode { return null; }
  pullChildren(cp: (attr: {[key: string]: string}) => {[key: string]: string}, from: number, to: number): void {}
  move(np: SNode, inx: number): SNode {
    this.parent.modified();
    this.parent.children.splice(this.index, 1);
    this.modified();
    return np.newChild(this, inx);
  }
  moveChildren(dest: SNode, from: number, to?: number, destInx = 0): SNode[] {
    const m = [];
    if (this.children) {
      const tn = this.children[to || this.numChildren - 1];
      const fn = this.children[from];
      while (tn.prev !== fn) {
        m.unshift(tn.prev.move(dest, destInx));
      }
      m.unshift(fn.move(dest, destInx));
    }
    return m;
  }
  chnAttr(n: string, v: string): SNode { return this; }
  rmAttr(n: string): SNode { return this; }
  setText(txt: string): SNode { // new value of text if need
    this._txt = txt;
    this.modified();
    return this;
  }
  getText(): string {
    return this._txt;
  }
}
export class SNodeText extends SNode {
  constructor(text: string, inRange?: StartEnd, outRange?: StartEnd) {
    super(Node.TEXT_NODE, '#text', htmlDecode(text), inRange || EMPTY_S_RANGE, outRange || EMPTY_S_RANGE);
  }
  clone(): SNode {
    return new SNodeText(this._txt);
  }
  source(onlyBody?: boolean): string {
    return this._txt;
  }
  insert(sn: SNode, cp: (a: {[key: string]: string}) => {[key: string]: string}, from: number, to?: number): {sn: SNode, wrapped: SNode[], after: SNode} {
    const text = this.getText();
    const wrapped = []; let after: SNode = null;
    if (!to || to > text.length) {
      to = text.length;
    }
    if (from <= to) {
      if (sn.typeNode === Node.TEXT_NODE) {
        this.setText(text.substring(0, from) + sn.getText() + text.substring(to));
        sn = this;
      } else {
        this.setText(text.substring(0, from));
        this.parent.newChild(sn, this.index + 1);
        if (from < to && HtmlRules.enableTxt(sn)) {
          wrapped.push(sn.addChild(SNode.textNode(text.substring(from, to))));
        }
        if (to < text.length) {
          after = this.parent.newChild(SNode.textNode(text.substring(to)), sn.index + 1);
        }
        sn.validate();
      }
    }
    return {sn, wrapped, after};
  }
}
export class SNodeComment extends SNode {
  constructor(text: string, inRange?: StartEnd, outRange?: StartEnd) {
    super(Node.COMMENT_NODE, '#comment', text, inRange || EMPTY_S_RANGE, outRange || EMPTY_S_RANGE);
  }
  clone(): SNode {
    return new SNodeText(this._txt);
  }
  source(onlyBody?: boolean): string {
    return START_COMMENT + this._txt + END_COMMENT;
  }
  insert(sn: SNode, cp: (a: {[key: string]: string}) => {[key: string]: string}, from: number, to?: number): {sn: SNode, wrapped: SNode[], after: SNode} {
    return {sn, wrapped: [], after: null};
  }
}
export class SNodeCData extends SNode {
  constructor(text: string, inRange?: StartEnd, outRange?: StartEnd) {
    super(Node.CDATA_SECTION_NODE, '#cdata-section', text, inRange, outRange);
  }
  clone(): SNode {
    return new SNodeText(this._txt);
  }
  source(onlyBody?: boolean): string {
    return START_CDATA + this._txt + END_CDATA;
  }
  insert(sn: SNode, cp: (a: {[key: string]: string}) => {[key: string]: string}, from: number, to?: number): {sn: SNode, wrapped: SNode[], after: SNode} {
    return {sn, wrapped: [], after: null};
  }
}
export class SNodeElement extends SNode {
  get firstChild(): SNode {
    return this.children[0] || null;
  }
  get lastChild(): SNode {
    return this.children[this.children.length - 1] || null;
  }
  get numChildren(): number {
    return this.children.length;
  }
  constructor(nodeName: string, public inRange?: StartEnd, public outRange?: StartEnd, public isRoot = false) {
    super(Node.ELEMENT_NODE, nodeName, null, inRange, outRange, isRoot);
    this.children = [];
  }
  attribute(name: string): string {
    return chkAttribute(name, this.attr);
  }
  clone(cp?: (attr: {[key: string]: string}) => {[key: string]: string}): SNode {
    if (!cp) { cp =  (attr) => Object.assign({}, attr); }
    const n = SNode.elementNode(this.nodeName, cp(this.attr), null, null, this.isRoot);
    this.children.forEach(c => n.addChild(c.clone(cp)));
    return n;
  }
  private renderAttr(): string {
    let s = '';
    if (this.attr) {
      for (const [key, value] of Object.entries<string>(this.attr)) {
        if (value !== undefined) {
          s += ` ${key}="${value}"`;
        } else {
          s += ' ' + key;
        }
      }
    }
    return s;
  }
  source(onlyBody = false): string {
    if (this.state < 0) {
      return '';
    }
    if (HtmlRules.isVoid(this.nodeName)) {
      return this.isRoot || onlyBody ? '' : `<${this.nodeName}${this.renderAttr()}>`;
    }
    let s = this.isRoot || onlyBody ? '' : `<${this.nodeName}${this.renderAttr()}>`;
    this.children.forEach( c => s += c.source());
    return s + (this.isRoot || onlyBody ? '' : `</${this.nodeName}>`);
  }
  addChild(n: SNode): SNode {
    n.parent = this;
    if (n.typeNode === Node.TEXT_NODE && this.lastChild && this.lastChild.typeNode === Node.TEXT_NODE) {
      this.lastChild.setText(this.lastChild.getText() + n.getText());
      return this.lastChild;
    }
    this.children.push(n);
    return n;
  }
  validate(correct = true): void {
    const content = HtmlRules.contentOfNode(this);
    if (!content) {
      if (this.numChildren !== 0) {
        this.setError(`Element ${this.nodeName} cannot have children`);
      }
    } else {
      if (content.elem) {
        this.everyChild((c) => {
          if (!content.elem.includes(c.nodeName)) {
            this.setError(`Element ${this.nodeName} cannot have ${c.nodeName} as child`);
          }
        });
      }
      if (content.cnt.includes('Flow') || content.cnt.includes('Phrasing')) {
        if (correct && (this instanceof SNode) && (!this.lastChild || this.lastChild.typeNode !== Node.TEXT_NODE)) {
          this.addChild(SNode.textNode(''));
        }
        if (!this.lastChild || this.lastChild.typeNode !== Node.TEXT_NODE){
          this.setWarning(`Element ${this.nodeName} required child element`);
        }
      }
    }
  }
  newChild(n: SNode, inx: number): SNode {
    this.modified();
    if (inx > this.numChildren) {
      return this.addChild(n);
    }
    if (inx < 0) { inx = 0; }
    if (n.typeNode === Node.TEXT_NODE) {
      if (this.children[inx - 1] && this.children[inx - 1].typeNode === Node.TEXT_NODE) {
        return this.children[inx - 1].setText(this.children[inx - 1].getText() + n.getText());
      }
      if (this.children[inx] && this.children[inx].typeNode === Node.TEXT_NODE) {
        return this.children[inx].setText(this.children[inx].getText() + n.getText());
      }
    }
    n.parent = this;
    this.children.splice(inx, 0, n);
    return n;
  }
  replace(nodeName: string, attr?: any): SNode {
    this.nodeName = nodeName;
    if (attr) {
      this.attr = attr;
    }
    this.modified();
    return this;
  }
  wrapChildren(n: SNode, from = 0, to?: number): SNode {
    while (this.firstChild) { n.addChild( this.children.splice(0, 1)[0]); }
    this.addChild(n);
    this.modified();
    n.modified();
    return n;
  }
  unwrapChildren(): SNode {
    let s = null;
    while (this.lastChild) {
      s = this.lastChild.move(this.parent, this.index);
    }
    return s;
  }
  pullChildren(cp: (attr: {[key: string]: string}) => {[key: string]: string}, from: number, to: number): void {
    if (from === 0) {
      for (let i = 0; i < Math.min(this.children.length, to); ++i) {
        this.children[i].move(this.parent, this.index);
      }
    } else if (to === this.children.length) {
      for (let i = this.children.length - 1; i >= from; i--) {
        this.children[i].move(this.parent, this.index + 1);
      }
    } else {
      this.parent.newChild(SNode.elementNode(this.nodeName, cp(this.attr)), this.index + 1);
      for (let i = to - 1; i >= from; i--) {
        this.children[i].move(this.parent, this.index + 1);
      }
    }
  }
  extractChildren(): void {
    this.unwrapChildren();
  }

  /**
   * There we split this node with sn, and children before from leave in this node, children from to moving to sn
   * @param sn - node that is inserted
   * @param cp - copy attribute
   * @param from - position
   * @param to - position
   */
  insert(sn: SNode, cp: (a: {[key: string]: string}) => {[key: string]: string}, from: number, to?: number): {sn: SNode, wrapped: SNode[], after: SNode} {
    let wrapped = []; let after: SNode = null;
    if (!to || to > this.children.length) { to = this.children.length; }
    if (to < this.numChildren) {
      after = this.parent.newChild(SNode.elementNode(this.nodeName, cp(this.attr)), this.index);
      this.moveChildren(after, to);
    }
    this.parent.newChild(sn, from);
    if (from < to) {
      wrapped = this.moveChildren(sn, from, to, 0);
    }
    sn.validate();
    after.validate();
    this.validate();
    return {sn, wrapped, after};
  }
  chnAttr(n: string, v: string): SNode {
    this.attr[n] = v;
    this.modified();
    return this;
  }
  rmAttr(n: string): SNode {
    delete this.attr[n];
    this.modified();
    return this;
  }
  setText(txt: string): SNode { // new value of text if need
    return this;
  }
  getText(): string {
    return null;
  }
}

function htmlDecode(s: string): string{
  if (s && s.length > 0) {
    const e = document.createElement('textarea');
    e.innerHTML = s;
    return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue;
  }
  return '';
}

interface ParseError {
  index: number;
  reason: string;
}
const START_CDATA = '<![CDATA[';
const END_CDATA = ']]>';
const START_COMMENT = '<!--';
const END_COMMENT = '-->';

export class SimpleParser {
  mark: string;
  editor: HTMLElement;
  readonly baseMark: string;
  root: SNode;
  range: SRange;
  private _tmpRoot: SNode = null;
  private _tmpRange: SRange = null;
  errors: ParseError[] = [];
  get source(): string {
    return this.root ? this.root.source() : '';
  }
  get currentRoot(): SNode {
    return this._tmpRoot || this.root;
  }
  get currentRange(): SRange {
    return this._tmpRange || this.range;
  }
  constructor(mark: string, private markIndex = 0) {
    this.mark = mark;
    this.baseMark = '' + markIndex;
  }
  static validate(root: SNode): Error {
    return HtmlRules.validateSource(root);
  }
  cloneRoot(): SNode {
    if (!this._tmpRoot && this.root) {
      this._tmpRoot = this.root.clone();
      this._tmpRange = new SRange(
        new SPosition(this.mapToClone(this.range.anchor.n), this.range.anchor.offset),
        new SPosition(this.mapToClone(this.range.focus.n), this.range.focus.offset));
    }
    return this._tmpRoot;
  }
  commit(): void {
    if (this._tmpRoot) {
      let topModified = this._tmpRoot;
      if (!this._tmpRoot.state) {
        topModified = null;
        treeWalker(this._tmpRoot, (w) => {
          if (w.state) {
            if (!topModified && w !== this._tmpRoot) {
              topModified = w;
            } else if (w !== topModified) {
              if (w.ancestorIndex(topModified) === -1) {
                const r = new SRange(new SPosition(topModified.parent, topModified.index), new SPosition(w.parent, w.index));
                topModified = r.commonAncestor;
                if (topModified === this._tmpRoot) {
                  return true;
                }
              }
            }
          }
        });
      }
      if (topModified) {
        this.root = parse(this._tmpRoot.source(), this.mark, this.errors, this.baseMark);
        topModified = this.mapToClone(topModified, this.root);
        const n = this.toNode(topModified);
        (n as HTMLElement).innerHTML = topModified.source(true);
        console.log('commit range: ' + this._tmpRange);
        this.range = new SRange(
          new SPosition(this.mapToClone(this._tmpRange.anchor.n, this.root), this._tmpRange.anchor.offset),
          new SPosition(this.mapToClone(this._tmpRange.focus.n, this.root), this._tmpRange.focus.offset));
        this._tmpRoot = null;
        this._tmpRange = null;
      }
    }
  }
  rollback(): void {
    this._tmpRoot = null;
    this._tmpRange = null;
  }
  isEditing(): boolean {
    return !!this._tmpRoot;
  }
  mapToClone(node: SNode, root?: SNode): SNode {
    if (node.typeNode === Node.ELEMENT_NODE) {
      return this.findSNode(node.attribute(this.mark), root || this._tmpRoot || this.root);
    } else {
      const p = this.findSNode(node.parent.attribute(this.mark), root || this._tmpRoot || this.root);
      return p ? p.children[node.index] : null;
    }
  }
  findSNode(mark: string, from?: SNode): SNode {
    if (mark === this.baseMark) {
      return this.currentRoot;
    }
    let r: SNode;
    treeWalker(from || this.currentRoot, (n) => {
      if (n.attribute(this.mark) === mark) {
        r = n as SNode;
        return true;
      }
    });
    return r;
  }
  private toSNode(w: Node): SNode {
    const a = LibNode.getAttribute(w, this.mark);
    if (a) {
      const sn = this.findSNode(a);
      if (w.nodeType === Node.TEXT_NODE) {
        return sn.child(LibNode.orderOfChild(w.parentNode, w));
      }
      return sn;
    }
  }
  private toNode(s: SNode): Node {
    if (s === this.root || s === this._tmpRoot) {
      return this.editor;
    }
    if (s.typeNode === Node.ELEMENT_NODE) {
      return this.editor.querySelector(`[${this.mark}="${s.attribute(this.mark)}"]`);
    } else {
      const n = this.editor.querySelector(`[${this.mark}="${s.parent.attribute(this.mark)}"]`);
      return n.childNodes.item(s.index);
    }
  }
  // Selection
  initFromSelection(selection: Selection): void {
    const anchor = this.createSPotion(selection.anchorNode, selection.anchorOffset);
    const focus = this.createSPotion(selection.focusNode, selection.focusOffset);
    if (anchor && focus) {
      this.range = new SRange(anchor, focus);
    } else {
      this.range = null;
    }
    console.log('initFromSelection: ' + this.range);
  }
  restorePosition(): void {
    if (this.range) {
      this.collapse(this.range.focus);
    }
  }
  createSPotion(n: Node, offset: number): SPosition {
    const sn = this.toSNode(n);
    if (sn) {
      return new SPosition(sn, offset);
    }
  }
  collapse(sp: SPosition): void {
    console.log('collapse: ' + sp);
    window.getSelection().removeAllRanges();
    const n = this.toNode(sp.n);
    if (n) {
      const offset = n.nodeType === Node.ELEMENT_NODE ? Math.min(n.childNodes.length, sp.offset) : sp.offset;
      window.getSelection().collapse(n, offset);
    }
    this.range = new SRange(sp, sp);
  }
  firstPosition(): void {
    const s0 = new SPosition(this.root, 0);
    const p = this.nextDown(s0);
    this.collapse(p || s0);
  }
  selectAll(): void {
    const range = document.createRange();
    range.selectNode(this.editor);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    this.range = new SRange(new SPosition(this.root, 0), new SPosition(this.root, this.root.numChildren - 1));
  }
  moveNext(stepText = true): void {
    const next = this.nextDown(this.currentRange.focus, stepText);
    console.log('moveNext:' + next);
    if (next) {
      this.currentRange.focus = next;
      this.collapse(this.currentRange.focus);
    }
  }
  movePrev(stepText = true): void {
    const next = this.nextUp(this.currentRange.focus, stepText);
    console.log('movePrev:' + next);
    if (next) {
      this.currentRange.focus = next;
      this.collapse(this.currentRange.focus);
    }
  }
  private nextDown(p: SPosition, stepText = true): SPosition {
    if (stepText && p.n.typeNode === Node.TEXT_NODE && p.offset < p.n.getText().length && p.n.state >= 0) {
      return new SPosition(p.n, p.offset + 1);
    }
    return SPosition.findPosition(this.currentRoot, p, editorNode(stepText), true);
  }
  private nextUp(p: SPosition, stepText = true): SPosition {
    console.log('nextUp: ' + p);
    if (stepText && p.n.typeNode === Node.TEXT_NODE && p.n.getText() && p.offset > 0 && p.n.state >= 0) {
      return new SPosition(p.n, Math.min(p.offset - 1, p.n.getText().length));
    }
    return SPosition.findPosition(this.currentRoot, p, editorNode(stepText), false);
  }
  parse(s: string): void {
    this.errors = [];
    this.root = parse(this.checkAndMarkElements(s), this.mark, this.errors, this.baseMark);
    this.root.nodeName = this.editor.nodeName.toLowerCase();
    this._tmpRoot = null;
    this.editor.innerHTML = this.root.source();
    this.firstPosition();
  }
  checkAndMarkElements(source: string): string {
    let result = false;
    return source.replace(/<([a-zA-Z][^>]*)(\/?)>/g, (s: string, ...args: any[]) => {
      const tagBody = args[0] as string;
      const closed = args[1] ? '"/' : '"';
      if (tagBody.indexOf(this.mark) === -1) {
        result = true;
        return `<` + tagBody + ' ' + this.mark + '="' + this.nextMark() + closed + '>';
      }
      return s;
    });
  }
  // Editor
  private nextMark(): string { return '' + ++this.markIndex; }
  private copyAttr(attr?: {[key: string]: string}): {[key: string]: string} {
    const res = Object.assign({}, attr || {});
    res[this.mark] = this.nextMark();
    return res;
  }

  private wrapEditing(op: (inTransaction: boolean) => void): void {
    if (this.currentRange) {
      const inTransaction = this.isEditing();
      this.cloneRoot();
      try {
        op(inTransaction);
        if (inTransaction) {
          return;
        }
        this.commit();
        this.collapse(this.currentRange.focus);
      } catch (e) {
        console.error(e); // TODO throw and shows this error to user
        if (inTransaction) {
          throw e;
        }
        this.rollback();
      }
    }
  }
  insString(s: string): void {
    this.wrapEditing(() => {
      this.deleteRange();
      const f = this.currentRange.focus;
      if (f.n.typeNode === Node.TEXT_NODE) {
        const txt = f.n.getText();
        f.n.setText(txt.substring(0, f.offset) + s + txt.substring(f.offset));
        this.currentRange.focus = new SPosition(f.n, f.offset + s.length);
      }
    });
  }
  insHTML(s: string): void {
    this.wrapEditing(() => {
      const errors = [];
      const root = parse(this.checkAndMarkElements(s), this.mark, errors, this.baseMark);
      if (errors.length > 0) {
        throw new Error('This is invalid html: ' + errors);
      }
      this.deleteRange();
      const f = this.currentRange.focus.sNode;
      let ixn = f.index;
      if (f.typeNode === Node.TEXT_NODE && f.getText()) {
        ixn++;
      }
      const cnt = HtmlRules.contentOfNode(f.parent);
      if (!cnt.cnt.includes('Flow')) {
        for (const ch of root.children) {
          if (HtmlRules.isElementParentContent('Flow', ch)) {
            throw new Error('Cannot be placed here');
          }
        }
      }
      for (const ch of root.children) {
        f.parent.newChild(ch, ixn++);
      }
    });
  }
  backspace(): void {
    this.wrapEditing(() => {
      if (this.currentRange.collapsed) {
        const next = this.nextUp(this.currentRange.focus, true);
        if (!next) { return; }
        this.currentRange.focus = next;
      }
      this.deleteRange();
    });
  }
  delete(): void {
    this.wrapEditing(() => {
      if (this.currentRange.collapsed) {
        const next = this.nextDown(this.currentRange.focus, true);
        if (!next) { return; }
        this.currentRange.focus = next;
      }
      this.deleteRange();
    });
  }
  private deleteRange(): void {
    this.wrapEditing(() => {
      if (!this.currentRange.collapsed) {
        const start = this.currentRange.start;
        const end = this.currentRange.end;
        if (start.n.equal(end.n)) {
          if (start.n.typeNode !== Node.ELEMENT_NODE) {
            const sn = start.sNode;
            sn.setText(sn.getText().substring(0, start.offset) + sn.getText().substring(end.offset));
          } else {
            for (let i = start.offset; i < end.offset; ++i) {
              start.n.children[i].delete();
            }
          }
          this.currentRange.focus = this.currentRange.start;
        } else {
          let sp1 = end;
          while (sp1.n !== this.currentRange.commonAncestor) {
            sp1 = SNode.splitStatic(sp1, (a) => this.copyAttr(a));
          }
          let sp0 = start;
          while (sp0.n !== this.currentRange.commonAncestor) {
            sp0 = SNode.splitStatic(sp0, (a) => this.copyAttr(a));
          }
          for (let i = sp0.offset; i < sp1.offset; ++i) {
            sp0.n.children[i].delete();
          }
          this.currentRange.focus = sp1;
        }
      }
      this.currentRange.collapse('focus');
      }
    );
  }
  private extractRange(range: SRange): SNode {
    if (range.collapsed) {
      if (range.start.sNode.typeNode === Node.TEXT_NODE) {
        return SNode.textNode('');
      } else {
        return range.start.sNode;
      }
    } else if (range.commonAncestor.typeNode === Node.TEXT_NODE) {
       return range.commonAncestor.insert(SNode.elementNode('span'), a => this.copyAttr(a), range.start.offset, range.end.offset).sn;
    } else if (range.anchor.n === range.focus.n) {
      return range.commonAncestor.insert(SNode.elementNode('div'), a => this.copyAttr(a), range.start.offset, range.end.offset).sn;
    }
    const startNode = range.start.sNode;
    const endNode = range.end.sNode;
    const div = SNode.elementNode('div');
    let start: SNode; let end: SNode;
    if (startNode.typeNode === Node.TEXT_NODE) {
      start = startNode.insert(SNode.elementNode('span'), a => this.copyAttr(a), range.start.offset).sn;
    }
    while (start.parent !== range.commonAncestor) {
      start = start.insert(SNode.elementNode(start.nodeName, this.copyAttr(start.attr)), a => this.copyAttr(a), start.index).sn;
    }
    if (endNode.typeNode === Node.TEXT_NODE) {
      end = endNode.insert(SNode.elementNode('span'), a => this.copyAttr(a), 0, range.end.offset).sn;
    }
    while (end.parent !== range.commonAncestor) {
      end = endNode.insert(SNode.elementNode(end.nodeName, this.copyAttr(end.attr)), a => this.copyAttr(a), 0, end.index + 1).sn;
    }
    return range.commonAncestor.insert(SNode.elementNode('div'), a => this.copyAttr(a), start.index, end.index + 1).sn;
  }
  private validateHeading(): void {
    const heads: SNode[] = [];
    treeWalker(this.currentRoot, n => {
      if (HtmlRules.isHeading(n)) {
        heads.push(n);
      }
    });
    for (const h of heads) {
      let t = h; let i = 0;
      while (t) {
        t = t.hasParent(HtmlRules.contents.Heading);
        i++;
      }
      h.replace(HtmlRules.contents.Heading[Math.min(i, HtmlRules.contents.Heading.length)]);
    }
  }
  shiftLeft(): void {
    this.wrapEditing(() => {
      const w = this.range.focus.sNode;
      // there can be position in <section>, or <article>, or in <li>
      const li: SNode = w.hasParent(['li', 'section', 'article']);
      if (li && li.nodeName === 'li') {
        const oum = ['ol', 'ul', 'menu'];
        // check if there is parent list
        const tList = li.parent;
        if (tList || !oum.includes(tList.nodeName)) {
          throw new Error('Invalid html. Element <li> must have parent <ol>|<ul>|<menu>');
        }
        const pList: SNode = tList.hasParent(oum);
        if (pList) {
          li.move(pList, li.ancestorIndex(pList) + 1);
          this.currentRange.focus = new SPosition(li.parent, li.index);
          this.currentRange.collapse();
        }
      } else if (li) {
        if (this.currentRange.collapsed) {
          const inx = li.index;
          while (li.children.length > 0) {
            const ch = li.children.pop();
            if (HtmlRules.isHeading(ch)) {
              ch.replace('p');
            }
            ch.move(li.parent, inx);
          }
          this.currentRange.focus = new SPosition(li.parent, inx);
          li.delete();
          this.currentRange.collapse();
        } else {
          throw new Error('This operation is not supported');
        }
      }
      this.validateHeading();
    });
  }
  shiftRight(): void {
    this.wrapEditing(() => {
      const w = this.currentRange.focus.sNode;
      // there can be position in <section>, or <article>, or in <li>
      const li: SNode = w.hasParent(['li', 'section', 'article']);
      if (li && li.nodeName === 'li') {
        const oum = ['ol', 'ul', 'menu'];
        const tList = li.parent;
        if (tList || !oum.includes(tList.nodeName)) {
          throw new Error('Invalid html. Element <li> must have parent <ol>|<ul>|<menu>');
        }
        let l;
        if (tList.nodeName === 'ol') {
          l = SNode.elementNode('ol', this.copyAttr({}));
        } else {
          l = SNode.elementNode('ul', this.copyAttr({}));
        }
        tList.newChild(l, li.index);
        li.move(l, 0);
        this.currentRange.focus = new SPosition(li.parent, li.index);
        this.currentRange.collapse();
      } else if (li) {
        if (this.currentRange.collapsed) {
          throw new Error('This operation is not supported');
        } else {
          throw new Error('This operation is not supported');
        }
      }
    });
  }
  br(wbr: boolean, newParagraph: boolean, newSection: boolean): void {
    this.wrapEditing(() => {
      this.deleteRange();
      const w = this.currentRange.focus.sNode;
      if (w.typeNode === Node.TEXT_NODE) {
        if (wbr) {
          const nn = SNode.splitText(this.currentRange.focus, 'wbr', this.copyAttr({}), false);
          this.currentRange.focus = new SPosition(nn.txtNode, 0);
          this.currentRange.collapse('focus');
        } else {
          let nn;
          if (HtmlRules.isHeading(w.parent) || newParagraph) {
            nn = SNode.splitText(this.currentRange.focus, 'p', this.copyAttr({}));
            nn.newNode.move(w.parent.parent, w.parent.index + 1);
          } else if (newSection) {
            nn = SNode.splitText(this.currentRange.focus, 'section', this.copyAttr({}));
            nn.newNode.move(w.parent.parent, w.parent.index + 1);
          } else {
            nn = SNode.splitText(this.currentRange.focus, 'br', this.copyAttr({}));
          }
          this.currentRange.focus = new SPosition(nn.txtNode, 0);
          this.currentRange.collapse();
        }
      } else if (!wbr) {
        let newElement;
        if (newParagraph || newSection) {
          newElement = w.parent.newChild(SNode.elementNode(newParagraph ? 'p' : 'section', this.copyAttr({})), w.index + 1);
          this.currentRange.focus = new SPosition(newElement, 0);
        } else {
          newElement = w.parent.newChild(SNode.elementNode('br', this.copyAttr({})), w.index + 1);
          this.currentRange.focus = new SPosition(newElement.parent, newElement.index + 1);
        }
        this.currentRange.collapse();
      }
    });
  }
  addElement(nodeName: string, attr: {[key: string]: string}): void {
    this.wrapEditing(() => {
      const insertParentModel = HtmlRules.elements[nodeName][0];
      const insertModel = HtmlRules.elements[nodeName][1];
      if (!insertParentModel) {
        throw new Error(`Unknown element: "${nodeName}"`);
      }
      const sn = SNode.elementNode(nodeName, this.copyAttr(attr));
      const focus = this.currentRange.focus.sNode;
      if (!insertParentModel.cnt) {
        // TODO specific elements
        throw new Error(`Doesn't support this element: "${nodeName}"`);
      } else if (insertParentModel.cnt.includes('Flow')) {
        // only parent that has content 'Flow'
        const top = findWithParentCntFlow(this.currentRange.focus);
        // if a new element has empty content, insert it in this position
        if (!insertModel) {
          top.parent.newChild(sn, top.index + 1);
        } else if (HtmlRules.isContent('Heading', sn)) {
          // if new element is heading and top is heading - nothing, there will auto-heading and only one per section is allowed. If section has heading, user cannot select heading from list
        } else {
          // if range collapsed or in the same "top" node, ignore this range (we process only elements text range or range into one child node to the Flow content isn't interested here)
          // what parent elements can be here:
          // address, article, aside, blockquote, caption, dd, details, dialog, div, dt, fieldset, figcaption, figure, footer, header, li, section, td, th
          // what element needs FLow
          // address, article, aside, blockquote, details, dialog, div, dl, fieldset, figcaption, figure, footer, form, header, hr, menu, nav, ol, p, prem section, table, ul
          // this element is grouping as:
          // address, aside, blockquote, details, dialog, div, dl, fieldset, figcaption, figure, footer, form, header, hr, menu, nav, ol, p, prem section, table, ul

        }
      } else if (insertParentModel.cnt.includes('Phrasing')) {
        // any element can be parent
        if (HtmlRules.isContent('PhrasingFormat', sn)) {
          if (focus.hasParent([{nodeName, attr}])) {
            this.revert(nodeName, this.currentRange, attr);
          } else {
            this.format(nodeName, this.currentRange, attr);
          }
        } else {
          if (focus.hasParent([{nodeName, attr}])) {
            throw new Error(`There is already present this element: "${nodeName}"`);
          }
          this.format(nodeName, this.currentRange, attr);
        }
      }
    });
  }
  private format(nodeName: string, range: SRange, attr?: {[key: string]: string}): void {
    this.wrapEditing(() => {
      if (range.collapsed) {
        const focus = range.focus.sNode;
        const p: SNodeElement = focus.hasParent([{nodeName, attr}]);
        if (!p) {
          let f;
          if (focus.typeNode === Node.TEXT_NODE && !range.equal(SRange.fromNode(focus))) {
            f = focus.insert(SNode.elementNode(nodeName, this.copyAttr(attr)), a => this.copyAttr(a), range.start.offset, range.end.offset).sn;
          } else {
            f = focus.wrapThis(SNode.elementNode(nodeName, this.copyAttr(attr)));
          }
          range.focus = new SPosition(f.parent, f.index);
        }
      } else {
        const startNode = range.start.sNode;
        const endNode = range.end.sNode;
        if (startNode === endNode) {
          const {sn} = startNode.insert(SNode.elementNode(nodeName, this.copyAttr(attr)), a => this.copyAttr(a), range.start.offset, range.end.offset);
          range.focus = new SPosition(sn, sn.index);
          range.collapse();
        } else {
          const en: SNode = endNode.hasParent([{nodeName, attr}]);
          const st: SNode = startNode.hasParent([{nodeName, attr}]);
          if (!st) {
            if (range.start.offset === 0) {
              startNode.wrapThis(SNode.elementNode(nodeName, this.copyAttr(attr)));
            } else {
              startNode.insert(SNode.elementNode(nodeName, this.copyAttr(attr)), a => this.copyAttr(a), range.start.offset);
            }
          }
          if (!en) {
            if (range.end.offset === SRange.fromNode(endNode).end.offset) {
              endNode.wrapThis(SNode.elementNode(nodeName, this.copyAttr(attr)));
            } else {
              endNode.insert(SNode.elementNode(nodeName, this.copyAttr(attr)), a => this.copyAttr(a), 0, range.end.offset);
            }
          }
          treeWalker(startNode, n => {
            if (n === endNode) {
              return true;
            }
            if (n !== startNode && n.typeNode === Node.TEXT_NODE && !n.hasParent([{nodeName, attr}])) {
              n.wrapThis(SNode.elementNode(nodeName, this.copyAttr(attr)));
            }
          });
        }
      }
    });
  }
  private revert(nodeName: string, range: SRange, attr?: {[key: string]: string}): void {
    this.wrapEditing(() => {
      if (range.collapsed) {
        const focus = range.focus.sNode;
        const p: SNodeElement = focus.hasParent([{nodeName, attr}]);
        if (p) {
          const f = p.unwrapChildren();
          p.delete();
          if (f) {
            range.focus = new SPosition(f.parent, f.index);
            range.collapse();
          }
        }
      } else {
        const en: SNode = range.end.sNode.hasParent([{nodeName, attr}]);
        const st: SNode = range.start.sNode.hasParent([{nodeName, attr}]);
        if (en === st) {
          const chk = SRange.fromNode(st);
          if (range.equal(chk)) {
            const f = st.unwrapChildren();
            st.delete();
            if (f) {
              range.focus = new SPosition(f.parent, f.index);
              range.collapse();
            }
          } else {
            const {sn} = st.insert(SNode.elementNode('div'), a => this.copyAttr(a), this.currentRange.start.offset, this.currentRange.end.offset);
            st.pullChildren((a) => this.copyAttr(a), sn.index, sn.index + 1);
            const f = sn.unwrapChildren();
            sn.delete();
            if (f) {
              range.focus = new SPosition(f.parent, f.index);
              range.collapse();
            }
          }
        } else {
          let r;
          if (st) {
            r = SRange.fromNode(st);
            r.start.offset = range.start.sNode.ancestorIndex(st);
            this.revert(nodeName, r, attr);
          }
          if (en) {
            r = SRange.fromNode(en);
            r.end.offset = range.end.sNode.ancestorIndex(en);
            this.revert(nodeName, r, attr);
          }
          treeWalker(st, (n) => {
            if (n === en) {
              return true;
            }
            if (n.nodeName === nodeName) {
              n.unwrapChildren();
              n.delete();
            }
          });
        }
      }
    });
  }
  clearFormat(): void {
    this.wrapEditing(() => {
      const en = this.currentRange.end.sNode;
      const sn = this.currentRange.start.sNode;
      const exit = this.range.collapsed ?
        (w: SNode) => !HtmlRules.isElementParentContent('Phrasing', w) :
        (w: SNode) => w === sn;
      treeWalkerR(en, w => {
        if (HtmlRules.isContent('PhrasingFormat', w) && w.numChildren === 0) {
          w.delete();
        }
        if (HtmlRules.isContent('PhrasingFormat', w.parent)) {
          w.move(w.parent.parent, w.parent.index + 1);
        }
      }, exit);
      this.currentRange.focus = new SPosition(en.parent, en.index);
      this.currentRange.collapse();
    });
  }
}
export class SPosition {
  get sNode(): SNode {
    return SPosition.toSNode(this);
  }
  /**
   * if n.typeNode === Node.ELEMENT_NODE offset point on child node (can be out of range)
   * else offset point on text position
   */
  constructor(public n: SNode, public offset: number) {
    if (n.typeNode === Node.TEXT_NODE && !n.getText()) {
      this.n = n.parent;
      this.offset = n.index;
    }
  }
  static toSNode(sp: SPosition): SNode {
    return sp.n.typeNode === Node.ELEMENT_NODE ? sp.n.children[sp.offset] : sp.n;
  }
  static equalPosition(p1: SPosition, p2: SPosition): boolean {
    return p1.n.equal(p2.n) && p1.offset === p2.offset;
  }
  static findPosition(root: SNode, from: SPosition, criteria: (p: SNode) => boolean, down: boolean): SPosition {
    const iter = new SNodeIterator(root, SPosition.toSNode(from), !down);
    for (const sn of iter) {
      console.log('next findPosition: ' + sn);
      if (criteria(sn)) {
        console.log('exit findPosition: ' + sn);
        if (sn && sn.typeNode === Node.TEXT_NODE && sn.getText()) {
          return new SPosition(sn, down ? 0 : sn.getText().length);
        }
        return new SPosition(sn.parent, sn.index);
      }
    }
    return null;
  }
  equal(sp: SPosition): boolean {
    if (this === sp) {
      return true;
    }
    if (this.sNode === sp.sNode && this.offset === sp.offset) {
      return true;
    }
  }
  toString(): string {
    return `n: ${this.n}, offset:${this.offset}`;
  }
}
export function beforePosition(sp: SPosition): (n: NodeWrapper) => boolean {
  if (sp.n.typeNode === Node.ELEMENT_NODE && sp.offset > 0) {
    return (n) => {
      return ! (n.parent === sp.n && n.index === sp.offset - 1);
    };
  } else {
    return (n) => {
      return ! (n.parent === sp.n);
    };
  }
}
export class SRange {
  indexStart: number;
  indexEnd: number;
  commonAncestor: SNode;
  private _start: 'anchor' | 'focus';
  private _end: 'anchor' | 'focus';
  get start(): SPosition { return this._start === 'anchor' ? this.anchor : this._focus; }
  set start(sp: SPosition) {
    this.update(sp, this._start);
  }
  get end(): SPosition { return this._end === 'anchor' ? this.anchor : this._focus; }
  set end(sp: SPosition) {
    this.update(sp, this._end);
  }
  get collapsed(): boolean {
    return SPosition.equalPosition(this._focus, this.anchor);
  }
  get focus(): SPosition {
    return this._focus;
  }
  set focus(sp: SPosition) {
    console.log('focus:' + sp);
    this._focus = sp;
    this.fCommonAncestor(this.anchor, sp);
  }
  get coverAll(): boolean {
    return this.commonAncestor.typeNode === Node.ELEMENT_NODE ? this.indexStart === 0 && this.indexEnd === this.commonAncestor.numChildren - 1
      : this.indexStart === 0 && this.indexEnd === this.commonAncestor.getText().length - 1;
  }
  constructor(public anchor: SPosition, private _focus: SPosition) {
    this.fCommonAncestor(anchor, _focus);
  }
  static fromNode(sn: SNode): SRange {
    if (sn.typeNode === Node.ELEMENT_NODE) {
      const e = HtmlRules.elements[sn.nodeName];
      if (e && e[1]) {
        return new SRange(new SPosition(sn, 0), new SPosition(sn, sn.lastChild && sn.lastChild.getText() ? sn.numChildren : sn.numChildren - 1));
      }
      const sp = new SPosition(sn.parent, sn.index);
      return new SRange(sp, sp);
    }
    return new SRange(new SPosition(sn, 0), new SPosition(sn, sn.getText().length));
  }
  private update(sp: SPosition, what: 'anchor' | 'focus'): void {
    if (what === 'anchor') {
      this.anchor = sp;
    } else {
      this._focus = sp;
    }
    this.fCommonAncestor(this.anchor, this._focus);
  }
  private fCommonAncestor(anchor: SPosition, focus: SPosition): void {
    if (anchor.n === focus.n) {
      this.commonAncestor = anchor.n;
      if (anchor.offset <= focus.offset) {
        this._start = 'anchor'; this._end = 'focus';
      } else {
        this._start = 'focus'; this._end = 'anchor';
      }
      this.indexStart = this.start.offset; this.indexEnd = this.end.offset;
    } else {
      let n = anchor.n;
      const pts = [];
      while (n) { pts.push(n); n = n.parent; }
      n = focus.n;
      while (n) {
        if (pts.find(p => p === n)) {
          this.commonAncestor = n;
          break;
        }
        n = n.parent;
      }
      const i1 = anchor.n === this.commonAncestor ? anchor.offset : anchor.n.ancestorIndex(this.commonAncestor);
      const i2 = focus.n === this.commonAncestor ? focus.offset : focus.n.ancestorIndex(this.commonAncestor);
      if (i1 <= i2) {
        this._start = 'anchor'; this._end = 'focus';
        this.indexStart = i1; this.indexEnd = i2;
      } else {
        this._start = 'focus'; this._end = 'anchor';
        this.indexStart = i2; this.indexEnd = i1;
      }
    }
  }
  collapse(to: 'anchor' | 'focus' = 'focus'): void {
    if (to === 'anchor') {
      this._focus = this.anchor;
    } else {
      this.anchor = this.focus;
    }
    this.fCommonAncestor(this.anchor, this._focus);
  }
  equal(r: SRange): boolean {
    return this.start.equal(r.start);
  }
  toString(): string {
    return 'anchor:' + this.anchor + ', focus:' + this._focus;
  }
}

function findWithParentCntFlow(focus: SPosition): SNode {
  let w = focus.sNode;
  while (w.parent && !HtmlRules.isElementContent('Flow', w.parent)) {
    w = w.parent;
  }
  return w;
}
function editorNode(stepText: boolean): (p: SNode) => boolean {
  if (stepText) {
    return (c) => {
      return c && c.state >= 0 && c.typeNode === Node.TEXT_NODE;
    };
  } else {
    return (c) =>  c && c.state >= 0;
  }
}
function parse(source: string, mark: string, errors: ParseError[], baseMark: string): SNode {
  const deep: SNode[] = [];
  const mainAttr = {}; mainAttr[mark] = baseMark;
  const _root = SNode.elementNode('main', mainAttr, {start: 0, end: source.length}, {start: 0, end: source.length}, true);
  let root = _root;
  let pos = 0;
  function isNode(i: number): boolean {
    const c = source[i + 1];
    return (c === '!' || c === '/'
      || (c > '0' && c < '9')
      || (c > 'A' && c < 'Z')
      || (c > 'a' && c < 'z'));
  }
  function cdata(): void {
    const start = pos + START_CDATA.length;
    const end = source.indexOf(END_CDATA, start);
    if (end >= 0) {
      root.addChild(SNode.cdataNode(source.substring(start, end), {start, end}, {start: pos, end: end + END_CDATA.length}));
      pos = end + END_CDATA.length;
    } else {
      errors.push({index: pos, reason: 'Unclosed CDATA'});
      pos = source.length;
    }
  }
  function tag(): void {
    const start = pos;
    if (source[pos + 1] === '/') {
      const d = deep.pop();
      const r = new RegExp('</([a-z]*(-*[a-z0-9]*)*)\\s*>', 'gi');
      r.lastIndex = pos;
      const res = r.exec(source);
      if (res === null) {
        pos = source.length;
        errors.push({index: start, reason: 'Incorrect end tag format'});
        return;
      }
      pos += res[0].length;
      if (!(d && res[1] === d.nodeName)) {
        errors.push({index: start, reason: 'Expected closing tag: ' + (d ? d.nodeName : 'undefined') + ' but actually ' + res[1]});
        pos = source.length;
      } else {
        d.inRange.end = start;
        d.outRange.end = pos;
        root = deep[deep.length - 1] ? deep[deep.length - 1] : _root;
        try {
          d.validate();
        } catch (e) {
          errors.push({index: d.outRange.start, reason: e.message});
        }
      }
    } else {
      let r = new RegExp('<([a-z]*(-*[a-z0-9]*)*)([^>]*)>', 'ig');
      r.lastIndex = pos;
      let res = r.exec(source);
      if (res === null) {
        pos = source.length;
        errors.push({index: start, reason: 'Incorrect start tag format'});
        return;
      }
      pos += res[0].length; const nodeName = res[1]; const attr = {};
      const voidTag = HtmlRules.isVoid(res[1]) || res[3].endsWith('/');
      if (res[3]) {
        const pa = res[3];
        r = new RegExp('\\s(\\w*)(="([^"]*)")?', 'g');
        res = r.exec(pa);
        while (res) {
          attr[res[1]] = res[3];
          res = r.exec(pa);
        }
      }
      const n = SNode.elementNode(nodeName, attr, {start: pos, end: pos}, {start, end: pos});
      root.addChild(n);
      if (!voidTag) { // check if the tag closed
        root = n;
        deep.push(n);
      } else {
        try {
          n.validate();
        } catch (e) {
          errors.push({index: n.outRange.start, reason: e.message});
        }
      }
    }
  }
  function comment(): void {
    const start = pos + START_COMMENT.length;
    const end = source.indexOf(END_COMMENT, pos + START_COMMENT.length);
    if (end >= 0) {
      root.addChild(SNode.commentNode(source.substring(start, end), {start, end}, {start: pos, end: end + END_COMMENT.length}));
      pos = end + END_COMMENT.length;
    } else {
      errors.push({index: pos, reason: 'Unclosed comment'});
      pos = source.length;
    }
  }
  function text(): void {
    const start = pos;
    let end;
    for (;;) {
      end = source.indexOf('<', pos + 1);
      if (end > 0) {
        pos = end;
        if (isNode(end)){
          break;
        }
      } else {
        pos = source.length;
        if (end === 0) {
          errors.push({index: end, reason: 'Cannot start with "<"'});
        }
        break;
      }
    }
    const range = {start, end: pos};
    root.addChild(SNode.textNode(source.substring(start, pos), range, range));
  }
  while (pos < source.length) {
    if (source[pos] === '<' && isNode(pos)) {
      if (source.startsWith(START_CDATA, pos)) {
        cdata();
      } else if (source.startsWith(START_COMMENT, pos)) {
        comment();
      } else {
        tag();
      }
    } else {
      text();
    }
  }
  _root.validate();
  return _root;
}
