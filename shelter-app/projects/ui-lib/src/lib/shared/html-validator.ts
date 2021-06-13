
// tslint:disable:max-line-length
import {NodeWrapper, SPosition, treeWalker} from './html-helper';
import {HtmlRules} from './html-rules';

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

export class SNode extends NodeWrapper {
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
    return this.children ? this.children[0] || null : null;
  }
  get lastChild(): SNode {
    return this.children ? this.children[this.children.length - 1] || null : null;
  }
  get index(): number {
    return this.parent ? this.parent.children.indexOf(this) : -1;
  }
  get numChildren(): number {
    return this.children ? this.children.length : 0;
  }
  constructor(typeNode: number, nodeName: string, text?: string, public inRange?: StartEnd, public outRange?: StartEnd, public isRoot = false) {
    super();
    this.inRange = inRange;
    this.outRange = outRange;
    this.typeNode = typeNode;
    this.nodeName = nodeName.toLowerCase();
    if (typeNode === Node.ELEMENT_NODE) {
      this.children = [];
    }
    this._txt = text;
  }
  typeNode: number;
  nodeName: string;
  children: SNode[] = null;
  attr?: {[key: string]: string};
  parent: SNode = null;
  // 0, undefined, null - without change, -1 - deleted, 1 - modified, 2 - new, 3 - attr modified
  state: number;
  private _txt: string;
  static textNode(text: string, inRange?: StartEnd, outRange?: StartEnd): SNode { // the state was set during add
    return new SNode(Node.TEXT_NODE, '#text', htmlDecode(text), inRange || EMPTY_S_RANGE, outRange || EMPTY_S_RANGE);
  }
  static elementNode(nodeName: string, attr?: any, inRange?: StartEnd, outRange?: StartEnd, asRoot = false): SNode { // the state was set during add
    const n = new SNode(Node.ELEMENT_NODE, nodeName, null, inRange || EMPTY_S_RANGE, outRange || EMPTY_S_RANGE, asRoot);
    n.attr = attr || {};
    return n;
  }
  static commentNode(text: string, inRange?: StartEnd, outRange?: StartEnd): SNode {
    return new SNode(Node.COMMENT_NODE, '#comment', text, inRange, outRange);
  }
  static cdataNode(text: string, inRange?: StartEnd, outRange?: StartEnd): SNode {
    return new SNode(Node.CDATA_SECTION_NODE, '#cdata-section', text, inRange, outRange);
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

  attribute(name: string): string {
    return chkAttribute(name, this.attr);
  }
  equal(n: NodeWrapper): boolean {
    return this === n;
  }
  clone(): SNode {
    switch (this.typeNode) {
      case Node.TEXT_NODE:
        return SNode.textNode(this._txt);
      case Node.COMMENT_NODE:
        return SNode.commentNode(this._txt);
      case Node.CDATA_SECTION_NODE:
        return SNode.cdataNode(this._txt);
      case Node.ELEMENT_NODE: {
        const n = SNode.elementNode(this.nodeName, this.attr, null, null, this.isRoot);
        this.children.forEach(c => n.addChild(c.clone()));
        return n;
      }
    }
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
  private startTag(): string {
    if (this.typeNode === Node.ELEMENT_NODE) {
      return `<${this.nodeName} ${this.renderAttr()}>`;
    }
    if (this.typeNode === Node.COMMENT_NODE) {
      return START_COMMENT;
    }
    if (this.typeNode === Node.CDATA_SECTION_NODE) {
      return START_CDATA;
    }
    return '';
  }
  private endTag(): string {
    if (this.typeNode === Node.ELEMENT_NODE && !HtmlRules.isVoid(this.nodeName)) {
      return `</${this.nodeName}>`;
    }
    if (this.typeNode === Node.COMMENT_NODE) {
      return END_COMMENT;
    }
    if (this.typeNode === Node.CDATA_SECTION_NODE) {
      return END_CDATA;
    }
    return '';
  }
  source(onlyBody = false): string {
    if (this.state < 0) {
      return '';
    }
    if (this.typeNode === Node.ELEMENT_NODE) {
        let s = this.isRoot || onlyBody ? '' : this.startTag();
        this.children.forEach( c => s += c.source());
        return s + (this.isRoot || onlyBody ? '' : this.endTag());
    } else {
      return this.startTag() + this._txt ? this._txt : '' + this.endTag();
    }
  }
  modified(): void {
    if (!this.state) {
      this.state = 1;
      if (this.parent) {
        this.parent.modified();
      }
    }
  }
  delete(): void {
    this.state = -1;
    if (this.parent) {
      this.parent.modified();
    }
  }
  addChild(n: SNode): SNode {
    n.parent = this;
    this.children.push(n);
    return n;
  }
  validate(correct = true): void {
    if (this.typeNode === Node.ELEMENT_NODE) {
      const content = HtmlRules.contentOfNode(this);
      if (!content) {
        if (this.numChildren !== 0) {
          this.errors.push(`Element ${this.nodeName} cannot have children`);
        }
      } else {
        if (content.elem) {
          this.everyChild((c) => {
            if (!content.elem.includes(c.nodeName)) {
              this.errors.push(`Element ${this.nodeName} cannot have ${c.nodeName} as child`);
            }
          });
        }
        if (content.cnt.includes('Flow') || content.cnt.includes('Phrasing')) {
          if (correct && (this instanceof SNode) && (!this.lastChild || this.lastChild.typeNode !== Node.TEXT_NODE)) {
            this.addChild(SNode.textNode(''));
          }
          if (!this.lastChild || this.lastChild.typeNode !== Node.TEXT_NODE){
            this.warnings.push(`Element ${this.nodeName} required child element`);
          }
        }
      }
    }
  }
  newChild(n: SNode, inx: number): SNode {
    if (this.children) {
      n.parent = this;
      n.state = 2;
      if (inx > this.numChildren) { inx = this.numChildren; }
      if (inx < 0) { inx = 0; }
      this.children.splice(inx, 0, n);
      this.modified();
      return n;
    }
  }
  replace(nodeName: string, attr?: any): SNode {
    this.nodeName = nodeName;
    if (attr) {
      this.attr = attr;
    }
    this.modified();
    return this;
  }
  wrapThis(n: SNode): SNode {
    if (this.parent === null) {
      throw new Error('Prohibited to wrap parent');
    }
    this.modified();
    this.parent.children[this.index] = n;
    n.parent = this.parent;
    n.addChild(this);
    n.state = 2;
    return n;
  }
  wrapChildren(n: SNode, from = 0, to?: number): SNode {
    while (this.firstChild) { n.addChild( this.children.splice(0, 1)[0]); }
    this.addChild(n);
    n.state = 2;
    this.modified();
    return n;
  }
  extractChildren(): void {
    for (const c of this.children) {
      this.parent.newChild(c, this.index);
    }
    this.children = [];
    this.delete();
  }
  chnAttr(n: string, v: string): SNode {
    this.attr[n] = v;
    this.state = 3;
    if (this.parent) {
      this.parent.modified();
    }
    return this;
  }
  rmAttr(n: string): SNode {
    delete this.attr[n];
    this.state = 3;
    if (this.parent) {
      this.parent.modified();
    }
    return this;
  }
  setText(txt: string): SNode { // new value of text if need
    if (this.typeNode !== Node.ELEMENT_NODE) {
      this._txt = txt;
      this.modified();
    }
    return this;
  }
  getText(): string {
    if (this.typeNode !== Node.ELEMENT_NODE) {
      return this._txt;
    }
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
  root: SNode;
  errors: ParseError[] = [];
  get source(): string {
    return this.root.source();
  }
  mark: string;
  private _tmpRoot: SNode = null;
  constructor(source: string, mark: string, private baseMark = '0') {
    this.mark = mark;
    this.root = parse(source, mark, this.errors, baseMark);
  }
  static rgStartTag(t: string): RegExp {
    return new RegExp(`<${t}[^>]*>`, 'gi');
  }
  static validate(root: SNode): Error {
    return HtmlRules.validateSource(root);
  }
  cloneRoot(): SNode {
    if (!this._tmpRoot) {
      this._tmpRoot = this.root.clone();
    }
    return this._tmpRoot;
  }
  isEditing(): boolean {
    return !!this._tmpRoot;
  }
  mapToClone(node: SNode, root?: SNode): SNode {
    if (node.typeNode === Node.ELEMENT_NODE) {
      return this.findSNode(this.mark, node.attribute(this.mark), root || this.cloneRoot());
    } else {
      const p = this.findSNode(this.mark, node.parent.attribute(this.mark), root || this.cloneRoot());
      return p ? p.children[node.index] : null;
    }
  }
  commit(): void {
    if (this._tmpRoot) {
      this.root = parse(this._tmpRoot.source(), this.mark, this.errors, this.baseMark);
      this._tmpRoot = null;
    }
  }
  rollback(): void {
    this._tmpRoot = null;
  }
  findSNode(markAttr: string, mark: string, from?: SNode): SNode {
    let r: SNode;
    treeWalker(from || this._tmpRoot || this.root, (n) => {
      if (n.attribute(markAttr) === mark) {
        r = n as SNode;
        return true;
      }
    });
    return r;
  }
  nextDown(p: SPosition, stepText = true): SPosition {
    return SPosition.findPosition(this._tmpRoot || this.root, p, editorNode(stepText), true);
  }
  nextUp(p: SPosition, stepText = true): SPosition {
    return SPosition.findPosition(this._tmpRoot || this.root, p, editorNode(stepText), false);
  }

  parse(s: string): void {
    this.root = parse(s, this.mark, this.errors, this.baseMark);
    this._tmpRoot = null;
  }
}
function editorNode(stepText: boolean): (p: SNode) => boolean {
  if (stepText) {
    return (c) => {
      return c && c.typeNode === Node.TEXT_NODE;
    };
  } else {
    return (c) => !!c;
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
        r = new RegExp('\\s(\\w*)="(\\w+)"');
        // tslint:disable-next-line:no-conditional-assignment
        while (res = r.exec(res[3])) {
          attr[res[1]] = res[2];
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
