import {HtmlRules} from '../shared/html-rules';
import {NodeWrapper, SPosition, treeWalker} from '../shared';

// tslint:disable:max-line-length
export interface SRange { start: number; end: number; }
const EMPTY_S_RANGE: SRange = {start: 0, end: 0};
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
    return this.children ? this.children[this.children.length] || null : null;
  }
  get index(): number {
    return this.parent ? this.parent.children.indexOf(this) : -1;
  }
  get numChildren(): number {
    return this.children ? this.children.length : 0;
  }
  constructor(inRange: SRange, outRange: SRange, typeNode: number, nodeName: string, text?: string) {
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
  // start and end include tag whole
  inRange: SRange;
  outRange: SRange;
  typeNode: number;
  nodeName: string;
  children: SNode[] = null;
  attr?: {[key: string]: string};
  parent: SNode = null;
  // 0, undefined, null - without change, -1 - deleted, 1 - modified, 2 - new, 3 - attr modified
  state: number;
  private _txt: string;
  static textNode(text: string, inRange?: SRange, outRange?: SRange): SNode { // the state was set during add
    return new SNode(inRange || EMPTY_S_RANGE, outRange || EMPTY_S_RANGE, Node.TEXT_NODE, '#text', htmlDecode(text));
  }
  static elementNode(nodeName: string, attr?: any, inRange?: SRange, outRange?: SRange): SNode { // the state was set during add
    const n = new SNode(inRange || EMPTY_S_RANGE, outRange || EMPTY_S_RANGE, Node.ELEMENT_NODE, nodeName);
    n.attr = attr || {};
    return n;
  }
  static commentNode(text: string, inRange: SRange, outRange: SRange): SNode {
    return new SNode(inRange, outRange, Node.COMMENT_NODE, '#comment', text);
  }
  static cdataNode(text: string, inRange: SRange, outRange: SRange): SNode {
    return new SNode(inRange, outRange, Node.CDATA_SECTION_NODE, '#cdata-section', text);
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
  static splitBranch(nodeName: string, from: SNode, offset: number, root: SNode, source: string, crossNode: SNode, copyTop: boolean,
                     copyAttr: (attr: {[key: string]: string}) => {[key: string]: string}): {crossed: boolean, topNode: SNode, children: SNode[], newChildren: SNode[], text: string} {
    let text = '';
    let textNode = null;
    const children: SNode[] = [];
    const newChildren: SNode[] = [];
    let crossed = false;
    if (from.typeNode === Node.ELEMENT_NODE) {
      from = from.children[offset];
    } else {
      text = from.getText(source);
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
  setParent(n: SNode): SNode {
    n.parent = n;
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
  newSource(source: string): string {
    if (!this.state) {
      return source.substring(this.outRange.start, this.outRange.end);
    }
    if (this.state < 0) {
      return '';
    }
    if (this.typeNode === Node.ELEMENT_NODE) {
      if (this.state === 1) { // modified
        let s =  source.substring(this.outRange.start, this.inRange.start);
        this.children.forEach( c => s += c.newSource(source));
        return s + source.substring(this.inRange.end, this.outRange.end);
      }
      if (this.state === 2) {
        let s = this.startTag();
        this.children.forEach( c => s += c.newSource(source));
        return s + this.endTag();
      }
      if (this.state === 3) {
        return this.startTag() + source.substring(this.inRange.start, this.outRange.end) + this.endTag();
      }
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
  addChild(n: SNode): void {
    n.parent = this;
    this.children.push(n);
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
  wrapThis(n: SNode): void {
    if (this.parent === null) {
      throw new Error('Prohibited to wrap parent');
    }
    this.parent.children[this.index] = n;
    n.addChild(this);
    n.state = 2;
    this.parent.modified();
  }
  wrapChildren(n: SNode, from = 0, to?: number): SNode {
    for (let i = from; i < to || this.numChildren; ++i) { n.addChild( this.children.splice(i, 1)[0]); }
    this.addChild(n);
    n.state = 2;
    this.parent.modified();
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
  getText(source: string): string {
    if (this.typeNode !== Node.ELEMENT_NODE) {
      const s = this._txt ? this._txt : source.substring(this.inRange.start, this.inRange.end);
      return htmlDecode(s);
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
  source: string;
  mark: string;
  constructor(source: string, mark: string, private baseMark = '0') {
    this.source = source;
    this.mark = mark;
    this.root = parse(source, mark, this.errors);
  }
  static rgStartTag(t: string): RegExp {
    return new RegExp(`<${t}[^>]*>`, 'gi');
  }
  static rgEndTag(t: string): RegExp {
    return new RegExp(`</${t}[^>]*>`, 'gi');
  }
  clone(): SimpleParser {
    return new SimpleParser(this.source, this.mark, this.baseMark);
  }
  findMark(a: string): RegExpExecArray {
    const regexp = new RegExp(`<([a-zA-Z][^<>]*\\s${this.mark}="${a}"[^<>]*)>`, 'gs');
    return regexp.exec(this.source);
  }
  findSNode(markAttr: string, mark: string): SNode {
    let r: SNode;
    treeWalker(this.root, (n) => {
      if (n.attribute(markAttr) === mark) {
        r = n as SNode;
        return true;
      }
    });
    return r;
  }
  textPosition(sn: SNode, offset: number): number {
    return sn.inRange.start + offset + this.unicode(sn.inRange.start, sn.inRange.start + offset);
  }
  private unicode(start: number, end: number): number {
    const regexp = /&#(\d{2,4}|x[0-9a-zA-Z]{2,4});/g;
    regexp.lastIndex = start;
    let count = 0;
    do {
      const res = regexp.exec(this.source);
      if (res === null || res.index >= end) {
        break;
      }
      count += (res[1].length + 2);
      end -= (res.index + 1);
    } while (true);
    return count;
  }
  validate(): Error {
    return HtmlRules.validateSource(this.root);
  }
}
function parse(source: string, mark: string, errors: ParseError[]): SNode {
  const deep: SNode[] = [];
  const _root = new SNode({start: 0, end: source.length}, {start: 0, end: source.length}, Node.ELEMENT_NODE, 'main', this.baseMark);
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
      pos += res[0].length; let m; const attr = {};
      const voidTag = HtmlRules.isVoid(res[1]) || res[3].endsWith('/');
      if (res[3]) {
        r = new RegExp(mark + '="(\\d+)"');
        res = r.exec(res[3]);
        if (res) {
          m = res[1];
        }
        r = new RegExp('\\s(\\w*)="(\\w+)"');
        // tslint:disable-next-line:no-conditional-assignment
        while (res = r.exec(res[3])) {
          attr[res[1]] = res[2];
        }
      }
      const n = SNode.elementNode(res[1], attr, {start: pos, end: pos}, {start, end: pos});
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
    const range = {start, end};
    root.addChild(SNode.textNode(source.substring(start, end), range, range));
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
  return _root;
}
