// tslint:disable:max-line-length
// tslint:disable:variable-name
import {Attributes, FilterNode, NodeWrapper, SNodeIterator, treeWalker, treeWalkerR} from './html-helper';
import {HtmlElementContent, HtmlRules} from './html-rules';
import {LibNode} from './lib-node-iterator';

export interface StartEnd { start: number; end: number; }
const EMPTY_S_RANGE: StartEnd = {start: 0, end: 0};
function chkAttribute(n: string, attr?: Attributes): any {
  if (attr) {
    const f = Object.keys(attr).find((k) => k.toLowerCase() === n.toLowerCase());
    if (f) {
      return attr[f] ? attr[f].toLowerCase() : attr[f];
    }
  }
  return null;
}
export abstract class DesignElement {
  abstract pCnt: HtmlElementContent;
  abstract cnt: HtmlElementContent;
  abstract transform(sn: SNode, cp: (a: Attributes) => Attributes): SNode;
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
  get numRealChildren(): number {
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
  attr?: Attributes;
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
  attribute(name: string): string {
    return null;
  }
  equal(n: NodeWrapper): boolean {
    return this === n;
  }
  abstract clone(cp?: (attr: Attributes) => Attributes): SNode;
  abstract source(onlyBody?: boolean): string;

  /**
   * this define nesting only. There isn't present any validation
   * @param sn SNode that can be equal to this, nested in this, or be out to this
   */
  nesting(sn: SNode): 'in' | 'out' | 'equal' {
    if (HtmlRules.isContent('Phrasing', sn)) {
      return 'equal';
    }
    return 'out';
  }
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
  insert(sn: SNode, cp: (a: Attributes) => Attributes, from: number, to?: number): {sn: SNode, after: SNode} {
    return {sn: this, after: null};
  }
  canBeParent(children: SNode[]): boolean {
    return false;
  }
  /**
   * split node to two or three nodes.
   * For text node, cdata and comment nodes we split text than we call node splitting
   * @param cp - copy attributes
   * @param from - from position position in text
   * @param to - to position in text
   * @param sn - is splitting by this determined node or by copy of parent node (default)
   */
  split(cp: (a: Attributes) => Attributes, from: number, to?: number, sn?: SNode): {sn: SNode, after: SNode} {
    const text = this.getText();
    this.setText(text.substring(0, from));
    this.parent.children.splice(this.index + 1, 0, SNode.textNode(text.substring(from, to)));
    from = this.index + 1;
    if (to < text.length) {
      this.parent.children.splice(this.index + 2, 0, SNode.textNode(text.substring(to)));
      to = this.index + 2;
    }
    return this.parent.split(cp, from, to, sn);
  }
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
  unwrapChildren(): SNode { return null; }
  move(np: SNode, inx: number): SNode {
    const p = this.parent;
    p.children.splice(this.index, 1);
    if (p.numChildren > 0) {
      p.modified();
    } else {
      p.delete();
    }
    this.modified();
    return np.newChild(this, inx);
  }
  moveChildren(dest: SNode, from: number, to?: number, destInx = 0): SNode[] {
    let m = [];
    to = to || this.numChildren;
    if (this.children) {
      this.modified();
      m = this.children.splice(from, to - from);
      for (const c of m) {
        dest.newChild(c, destInx++);
      }
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
  insert(sn: SNode, cp: (a: Attributes) => Attributes, from: number, to?: number): {sn: SNode, after: SNode} {
    let after = null;
    const txt = this.getText();
    if (sn.typeNode === Node.TEXT_NODE) {
      throw new Error('Insert only element node');
    }
    if (from === 0) {
      this.parent.newChild(sn, this.index);
      this.setText('');
    } else {
      this.parent.newChild(sn, this.index + 1);
      this.setText(txt.substring(0, from));
    }
    if (HtmlRules.enableTxt(sn)) {
      sn.addChild(SNode.textNode(txt.substring(from, to)));
      if (to < txt.length) {
        after = this.parent.newChild(SNode.textNode(txt.substring(to)), sn.index + 1);
      }
    } else {
      this.parent.newChild(SNode.textNode(txt.substring(from, to)), sn.index + 1);
    }
    return {sn, after: sn.next};
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
  get numRealChildren(): number {
    let n = 0;
    for (const c of this.children) {
      if (c.state === -1 || (c.next === null && c.typeNode === Node.TEXT_NODE && c.getText().length === 0)) {
        continue;
      }
      n++;
    }
    return n;
  }
  constructor(nodeName: string, public inRange?: StartEnd, public outRange?: StartEnd, public isRoot = false) {
    super(Node.ELEMENT_NODE, nodeName, null, inRange, outRange, isRoot);
    this.children = [];
  }
  attribute(name: string): string {
    return chkAttribute(name, this.attr);
  }
  clone(cp?: (attr: Attributes) => Attributes): SNode {
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
  nesting(sn: SNode): 'in' | 'out' | 'equal' {
    if (this.nodeName === 'main' || sn.typeNode === Node.TEXT_NODE) {
      return 'in';
    }
    const oSectioning = HtmlRules.isContent('Sectioning', sn);
    if (HtmlRules.isContent('Sectioning', this)) {
      if (oSectioning) {
        return 'equal';
      }
      return 'in';
    }
    if (HtmlRules.isContent('Grouping', this)) {
      if (oSectioning) {
        return 'out';
      }
      if (HtmlRules.isContent('Grouping', sn)) {
        return 'equal';
      }
      return 'in';
    }
    if (HtmlRules.isContent('Phrasing', this)) {
      if (HtmlRules.isContent('Phrasing', sn)) {
        return 'equal';
      }
      return 'out';
    }
    return null;
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
    this.clearError();
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
      if (content.cnt && (content.cnt.includes('Flow') || content.cnt.includes('Phrasing'))) {
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
  unwrapChildren(): SNode {
    let s = null;
    this.delete();
    const ixn = this.index;
    while (this.lastChild) {
      s = this.lastChild.move(this.parent, ixn);
    }
    return s;
  }
  insert(sn: SNode, cp: (a: Attributes) => Attributes, from: number, to?: number): {sn: SNode, after: SNode} {
    to = Math.min(this.numChildren, to || Number.MAX_VALUE);
    if (sn.canBeParent(this.children.slice(from, to - 1))) {
      const ixn = sn.numChildren;
      for (let i = from; i < to; ++i) {
        const ch = this.children.splice(from, 1);
        sn.newChild(ch[0], ixn);
      }
    }
    sn.validate();
    this.newChild(sn, from);
    return {sn, after: sn.next};
  }
  canBeParent(children: SNode[]): boolean {
    if (HtmlRules.contentOfNode(this)) {
      return children.length === 0 || !children.find(c => this.nesting(c) !== 'out');
    }
    return false;
  }
  /**
   * split node to two or three nodes.
   * this: ElementNode, from: 1, to: 2
   * <splitted m1><a><b><c></splitted> => <splitted m1><a></splitted><splitted m2><b></splitted><splitted m3><c></splitted> {sn: m2, after: m3}
   * this: ElementNode, from: 0, to: 2
   * <splitted m1><a><b><c></splitted> => <splitted m1><a><b></splitted><splitted m2><c></splitted> {sn: m1, after: m2}
   * @param cp - copy attributes
   * @param from - from child (or text) position
   * @param to - to child (or text) position
   * @param sn - is splitting by this determined node or by copy of parent node (default)
   */
  split(cp: (a: Attributes) => Attributes, from: number, to?: number, sn?: SNode): {sn: SNode, after: SNode} {
    let after = null;
    if (!to || to > this.numChildren) { to = this.numChildren; }
    from = Math.max(0, from);
    sn = sn || (from !== 0 ? SNode.elementNode(this.nodeName, cp(this.attr)) : this);
    if (sn.typeNode === Node.TEXT_NODE) {
      throw new Error('Expected element node');
    } else {
      if (sn !== this) {
        const cnt = HtmlRules.contentOfNode(sn);
        if (from === 0 && cnt) { // TODO make a function that can validate this position, not only a void element
          this.nodeName = sn.nodeName;
          this.attr = Object.assign({}, this.attr, sn.attr);
          this.modified();
          sn = this;
        } else {
          this.parent.newChild(sn, this.index + 1);
          if (cnt) { // TODO make a function that can validate this position, not only a void element
            this.moveChildren(sn, from, to, 0);
          }
        }
      }
      if (to - from < this.numRealChildren) {
        after = this.parent.newChild(SNode.elementNode(this.nodeName, cp(this.attr)), sn.index + 1);
        this.moveChildren(after, to - from);
        after.validate();
      }
      sn.validate();
      if (sn !== this) {
        this.validate();
      }
      this.parent.validate();
    }
    return {sn, after};
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
    if (!this.root) {
      return '';
    }
    const r = new RegExp('\\s' + this.mark + '="[^"]"', 'g');
    return this.root.source().replace(r, '');
  }
  get currentRoot(): SNode {
    return this._tmpRoot || this.root;
  }
  get currentRange(): SRange {
    return this._tmpRange || this.range;
  }
  constructor(mark_: string, private markIndex = 0) {
    this.mark = mark_;
    this.baseMark = '' + markIndex;
  }
  static validate(root: SNode): Error {
    return HtmlRules.validateSource(root);
  }
  validateNewChild(p: SNode, offset: number, newNode: SNode): string[] {
    const c = p.clone();
    const n = c.newChild(newNode, offset);
    c.validate();
    n.validate();
    return c.errors.concat(n.errors);
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
        if (n) {
          (n as HTMLElement).innerHTML = topModified.source(true);
        } else {
          this.editor.innerHTML = this.root.source();
        }
        this.range = new SRange(
          new SPosition(this.mapToClone(this._tmpRange.anchor.n, this.root), this._tmpRange.anchor.offset),
          new SPosition(this.mapToClone(this._tmpRange.focus.n, this.root), this._tmpRange.focus.offset));
      }
      this._tmpRoot = null;
      this._tmpRange = null;
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
    if (s.attribute(this.mark) === this.baseMark) {
      return this.editor;
    }
    if (s.typeNode === Node.ELEMENT_NODE) {
      return this.editor.querySelector(`[${this.mark}="${s.attribute(this.mark)}"]`);
    } else {
      const n = this.toNode(s.parent);
      return n.childNodes.item(s.index);
    }
  }
  // Selection
  initFromSelection(selection: Selection): void {
    if (!selection.isCollapsed) {
      const r = selection.getRangeAt(0);
      if (r) {
        const chr = r.getBoundingClientRect();
        console.log(`window.scrollX: ${window.scrollX}, window.scrollY: ${window.scrollY},
          chr top:${chr.top + window.scrollY}, bottom:${chr.bottom + window.scrollY}, left:${chr.left + window.scrollX}, right:${chr.right + window.scrollX}
        `);
      }
    }
    const anchor = this.createSPosition(selection.anchorNode, selection.anchorOffset);
    const focus = this.createSPosition(selection.focusNode, selection.focusOffset);
    if (anchor && focus) {
      this.range = new SRange(anchor, focus);
    } else {
      this.range = null;
    }
  }
  restorePosition(): void {
    if (this.range) {
      this.collapse(this.range.focus);
    }
  }
  createSPosition(n: Node, offset: number): SPosition {
    const sn = this.toSNode(n);
    if (sn) {
      return new SPosition(sn, offset);
    }
  }
  collapse(sp: SPosition): void {
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
    range.selectNodeContents(this.editor);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    this.range = new SRange(new SPosition(this.root, 0), new SPosition(this.root, this.root.numChildren - 1));
  }
  moveNext(stepText = true): void {
    const next = this.nextDown(this.currentRange.focus, stepText);
    if (next) {
      this.currentRange.focus = next;
      this.collapse(this.currentRange.focus);
    }
  }
  movePrev(stepText = true): void {
    const next = this.nextUp(this.currentRange.focus, stepText);
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
  private copyAttr(attr?: Attributes): Attributes {
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
      let f = this.currentRange.focus;
      let offset = f.offset;
      if (f.n.typeNode !== Node.TEXT_NODE) {
        if (f.sNode.typeNode !== Node.TEXT_NODE) {
          f = this.nextDown(this.currentRange.focus);
          if (!f) {
            return;
          }
        }
        offset = 0;
      }
      const txt = f.sNode.getText();
      f.sNode.setText(txt.substring(0, offset) + s + txt.substring(offset));
      this.currentRange.focus = new SPosition(f.sNode, offset + s.length);
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
        if (this.currentRange.commonAncestor.typeNode === Node.TEXT_NODE) {
          const text = this.currentRange.commonAncestor.getText();
          this.currentRange.commonAncestor.setText(text.substring(0, this.currentRange.start.offset) + text.substring(this.currentRange.end.offset));
          this.currentRange.focus = this.currentRange.start;
        } else {
          const sn = this.extractRange(this.currentRange);
          sn.delete();
          const sp = this.nextDown(new SPosition(sn.parent, sn.index + 1));
          if (sp) {
            this.currentRange.focus = sp;
          } else {
            this.currentRange.focus = new SPosition(sn, sn.index + 1);
          }
        }
        this.currentRange.collapse();
      }
    });
  }
  extractRange(range: SRange): SNode {
    if (range.collapsed) {
      if (range.start.sNode.typeNode === Node.TEXT_NODE) {
        return SNode.textNode('');
      } else {
        return range.start.sNode;
      }
    } else if (range.commonAncestor.typeNode === Node.TEXT_NODE || range.anchor.n === range.focus.n) {
       return range.commonAncestor.split(a => this.copyAttr(a), range.start.offset, range.end.offset).sn;
    }
    let start = range.start;
    while (start.n !== range.commonAncestor) {
      const r = start.n.split(a => this.copyAttr(a), start.offset);
      start = new SPosition(r.sn.parent, r.sn.index);
    }
    let end = range.end;
    while (end.n !== range.commonAncestor) {
      const r = end.n.split(a => this.copyAttr(a), 0, end.offset);
      end = new SPosition(r.sn.parent, r.sn.index + 1);
    }
    return range.commonAncestor.split(a => this.copyAttr(a), start.offset, end.offset).sn;
  }
  private hasHeading(sn: SNode): boolean {
    let res = false;
    if (HtmlRules.isElementContent('Flow', sn)) {
      let c = sn.firstChild;
      while (c && !res) {
        if (HtmlRules.isHeading(c)) {
          res = true;
        }
        c = c.next;
      }
    }
    return res;
  }
  private validateHeading(): void {
    let level = 1;
    treeWalker(this.currentRoot, w => {
      if (HtmlRules.isContent('Sectioning', w)) {
        level++;
      }
      if (HtmlRules.isContent('Heading', w)) {
        if (w.nodeName !== 'h' + Math.min(level, 6)) {
          w.replace('h' + Math.min(level, 6));
        }
      }
    }, w => {
      if (HtmlRules.isContent('Sectioning', w)) {
        level--;
      }
    });
  }
  shiftLeft(): void {
    this.wrapEditing(() => {
      const w = this.range.focus.sNode;
      // there can be position in <section>, or <article>, or in <li>
      const filter = new FilterNode(['li', 'section', 'article']);
      const li: SNode = w.hasParent(filter);
      if (li && li.nodeName === 'li') {
        const oum = new FilterNode(['ol', 'ul', 'menu']);
        // check if there is parent list
        const tList = li.parent;
        if (!tList || !oum.allowed(tList)) {
          throw new Error('Invalid html. Element <li> must have parent <ol>|<ul>|<menu>');
        }
        const pList: SNode = tList.hasParent(oum);
        if (pList) {
          li.move(pList, li.ancestorIndex(pList) + 1);
          if (li.prev && li.prev.numRealChildren === 0) {
            li.prev.delete();
          }
          this.currentRange.focus = new SPosition(li.parent, li.index);
          this.currentRange.collapse();
        }
      } else if (li) {
        if (this.currentRange.collapsed) {
          for (const ch of li.children) {
            if (HtmlRules.isHeading(ch)) {
              ch.replace('p');
            }
          }
          const f = li.unwrapChildren();
          this.currentRange.focus = new SPosition(f.parent, f.index);
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
      const filter = new FilterNode(['li', 'section', 'article']);
      const li: SNode = w.hasParent(filter);
      if (li && li.nodeName === 'li') {
        const oum = new FilterNode(['ol', 'ul', 'menu']);
        const tList = li.parent;
        if (tList || !oum.allowed(tList)) {
          throw new Error('Invalid html. Element <li> must have parent <ol>|<ul>|<menu>');
        }
        const l = SNode.elementNode(tList.nodeName, this.copyAttr(tList.attr));
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
      const focus = this.currentRange.focus;
      let nodeName = 'br';
      if (wbr && focus.n.typeNode === Node.TEXT_NODE) {
        nodeName = 'wbr';
      } else if (HtmlRules.isHeading(focus.n.parent) || newParagraph) {
        nodeName = 'p';
      } else if (newSection) {
        nodeName = 'section';
      }
      const sn = SNode.elementNode(nodeName, this.copyAttr({}));
      let r;
      switch (focus.n.nesting(sn)) {
        case 'out':
          r = focus.n.split((a) => this.copyAttr(a), focus.offset, undefined, sn);
          break;
        default:
          r = focus.n.insert(sn, (a) => this.copyAttr(a), focus.offset);
      }
      if (r.sn.numChildren > 0) {
        this.currentRange.focus = new SPosition(r.sn, 0);
      } else {
        this.currentRange.focus = new SPosition(r.sn.parent, r.sn.index);
      }
      this.currentRange.collapse();
    });
  }
  addElement(nodeName: string, attr: Attributes): void {
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
        const top = HtmlRules.isElementContent('Flow', this.currentRange.commonAncestor)
          || HtmlRules.isElementContent('Flow', this.currentRange.commonAncestor.parent) ?
          this.currentRange.commonAncestor : findWithParentCntFlow(this.currentRange.focus);
        // if a new element has empty content, insert it in this position
        if (!insertModel) {
          const insPos = (top === this.currentRange.commonAncestor) ?
            new SPosition(this.currentRange.commonAncestor, this.currentRange.indexStart) :
            new SPosition(top.parent, top.index);
          this.deleteRange();
          insPos.n.newChild(sn, insPos.offset);
          this.currentRange.focus = this.nextDown(insPos);
          this.currentRange.collapse();
        } else if (HtmlRules.isContent('Heading', sn)) {
          // if new element is heading and top is heading - nothing, there will auto-heading and only one per section is allowed. If section has heading, user cannot select heading from list
          if (!this.hasHeading(top.parent)) {
            const f = top.parent.newChild(SNode.elementNode('h1', this.copyAttr(attr)), 0);
            if (focus.typeNode === Node.TEXT_NODE) {
              focus.move(f, 0);
            }
            f.validate();
            this.currentRange.focus = new SPosition(f.firstChild, 0);
            this.currentRange.collapse();
            this.validateHeading();
          }
        } else {
          // if range collapsed or in the same "top" node, ignore this range (we process only elements, text range or range in one child node to the Flow content isn't interested here)
          // what parent elements can be here:
          // address, article, aside, blockquote, caption, dd, details, dialog, div, dt, fieldset, figcaption, figure, footer, header, li, section, td, th
          // what element needs FLow
          // address, article, aside, blockquote, details, dialog, div, dl, fieldset, figcaption, figure, footer, form, header, hr, menu, nav, ol, p, prem section, table, ul
          // this element is grouping as:
          // address, aside, blockquote, details, dialog, div, dl, fieldset, figcaption, figure, footer, form, header, hr, menu, nav, ol, p, prem section, table, ul
          if (this.currentRange.isCoverFully(top)) {
            if (top.parent) {
              if (top.typeNode === Node.TEXT_NODE) {
                top.parent.replace(nodeName, this.copyAttr(attr));
              } else {
                top.replace(nodeName, this.copyAttr(attr));
              }
            } else {
              sn.children = top.children;
              top.children = [];
              top.newChild(sn, 0);
            }
          } else {
            if (this.currentRange.commonAncestor === this.currentRoot) {
              this.currentRoot.insert(sn, a => this.copyAttr(a), this.currentRange.indexStart, this.currentRange.indexEnd);
            } else {
              const div = this.extractRange(this.currentRange);
              div.replace(nodeName, this.copyAttr(attr));
            }
          }
        }
      } else if (insertParentModel.cnt.includes('Phrasing')) {
        // any element can be parent
        const filter = new FilterNode([{nodeName, attr}]);
        if (HtmlRules.isContent('PhrasingFormat', sn)) {
          if (focus.hasParent(filter)) {
            this.unwrapPhrasingFormat(nodeName, attr);
          } else {
            this.wrapPhrasingFormat(nodeName, attr);
          }
        } else {
          if (focus.hasParent(filter)) {
            throw new Error(`There is already present this element: "${nodeName}"`);
          }
          this.wrapPhrasingFormat(nodeName, attr);
        }
      }
    });
  }
  wrapPhrasingFormat(nodeName: string, attr?: Attributes): void {
    this.wrapEditing(() => {
      const range = this.currentRange;
      if (range.start.n === range.end.n) {
        const r = range.commonAncestor.insert(SNode.elementNode(nodeName, this.copyAttr(attr)), (a) => this.copyAttr(a), range.start.offset, range.end.offset);
        this.currentRange.focus = new SPosition(r.sn.firstChild, 0);
        this.currentRange.collapse();
      } else {
        const s = range.start.n.insert(SNode.elementNode(nodeName, this.copyAttr(attr)), (a) => this.copyAttr(a), range.start.offset);
        const e = range.end.n.insert(SNode.elementNode(nodeName, this.copyAttr(attr)), (a) => this.copyAttr(a), 0, range.end.offset);
        const filter = new FilterNode([{nodeName, attr}]);
        treeWalker(s.sn, (n) => n === e.sn, (n) => {
          if (HtmlRules.isContent('Phrasing', n)) {
            if (n.hasParent(filter)) {
              if (filter.allowed(n)) {
                n.unwrapChildren();
              }
            } else {
              if (!filter.allowed(n)) {
                n.wrapThis(SNode.elementNode(nodeName, this.copyAttr(attr)));
              }
            }
          }
        });
        this.currentRange.focus = new SPosition(e.sn.firstChild, 0);
        this.currentRange.collapse();
      }
    });
  }
  unwrapPhrasingFormat(nodeName: string, attr?: Attributes): void {
    this.wrapEditing(() => {
      const range = this.currentRange;
      if (range.start.n === range.end.n) {
        const r = range.commonAncestor.split((a) => this.copyAttr(a), range.start.offset, range.end.offset);
        const l = r.sn.unwrapChildren();
        if (l) {
          this.currentRange.focus = new SPosition(l, l.index);
        }
        this.currentRange.collapse();
      } else {
        let from = this.currentRange.start.sNode;
        let to = this.currentRange.end.sNode;
        const filter = new FilterNode([{nodeName, attr}]);
        if (range.start.sNode.hasParent(filter)) {
          let start = this.range.start;
          while (!filter.allowed(start.sNode)) {
            const r = start.n.split((a) => this.copyAttr(a), start.offset);
            start = new SPosition(r.sn.parent, r.sn.index);
          }
          from = start.sNode.unwrapChildren() || from;
        }
        if (range.end.sNode.hasParent(filter)) {
          let end = this.range.end;
          while (!filter.allowed(end.sNode)) {
            const r = end.n.split(a => this.copyAttr(a), 0, end.offset);
            end = new SPosition(r.sn.parent, r.sn.index);
          }
          to = end.sNode.unwrapChildren() || to;
        }
        treeWalker(from, (n) => {
          if (n === to) {
            return true;
          }
          if (n.nodeName === nodeName && n.containAttributes(attr)) {
            n.unwrapChildren();
          }
        });
        this.currentRange.focus = new SPosition(to.parent, to.index);
        this.currentRange.collapse();
      }
    });
  }
  clearFormat(): void {
    this.wrapEditing(() => {
      let en = this.currentRange.end.sNode;
      if (en.numChildren > 0) {
        en = en.firstChild;
      }
      const sn = this.currentRange.start.sNode;
      treeWalker(sn, w => w === en, w => {
        if (HtmlRules.isContent('PhrasingFormat', w)) {
          if (w.numChildren === 0) {
            w.delete();
          } else {
            w.unwrapChildren();
          }
        }
      });
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
      if (criteria(sn)) {
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
  isCoverFully(sn: SNode): boolean {
    if (sn.typeNode === Node.TEXT_NODE) {
      return sn === this.commonAncestor;
    }
    const st = this.start.sNode;
    const en = this.end.sNode;
    return st.ancestorIndex(sn) === 0 && en.ancestorIndex(sn) === sn.numChildren - 1;
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
  selectNodes(filter: FilterNode, group: FilterNode): SNode[][] {
    return null;
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
