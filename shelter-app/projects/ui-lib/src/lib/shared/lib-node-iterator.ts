// tslint:disable:max-line-length
const EMPTY_ELEMENTS: ReadonlyArray<string> = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
const BLOCK_ELEMENTS: ReadonlyArray<string> = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'blockquote'];
const PHRASING_ELEMENTS: ReadonlyArray<string> = ['b', 'bdo', 'code', 'em', 'i', 'kbd', 'mark', 'samp', 'small', 'strong', 'sub', 'sup', 'var', 'del', 'ins', 'u'];
export interface Position { n: Node; offset: number; isImpl?: boolean; }
export class LibRange {
  constructor(private start: Position, private end: Position) {
    this.start = LibPosition.normalize(start);
    this.end = LibPosition.normalize(end);
  }
  static fromRange(range: Range): LibRange {
    return new LibRange({n: range.startContainer, offset: range.startOffset}, {n: range.endContainer, offset: range.endOffset});
  }
  static validate(range: Range, criteria: (p: Position) => boolean): Range {
    const r = LibRange.fromRange(range);
    while (!criteria(r.start) && !LibPosition.equal(r.start, r.end)) {
      r.start = LibPosition.asLibPosition(r.start).nextNode();
    }
    while (!criteria(r.end) && !LibPosition.equal(r.start, r.end)) {
      r.end = LibPosition.asLibPosition(r.end).nextNode();
    }
    if (LibPosition.equal(r.start, r.end) && !criteria(r.start)) {
      return null;
    }
    const rn = range.cloneRange();
    rn.setStart(r.start.n, r.start.offset);
    rn.setEnd(r.end.n, r.end.offset);
    return rn;
  }
}
export class LibPosition implements Position {
  readonly isImpl = true;
  get n(): Node { return this._n; }
  get offset(): number { return this._offset; }
  constructor(private _n: Node, private _offset: number) {}
  static asLibPosition(p: Position): LibPosition {
    return p.isImpl ? p as LibPosition : LibPosition.newObject(p);
  }
  static equal(p1: Position, p2: Position): boolean {
    const a = LibPosition.normalize(p1); const b = LibPosition.normalize(p2);
    return a.n === b.n && a.offset === b.offset;
  }
  static normalizePoint(n: Node, offset: number): Position {
    if (n.nodeType === Node.TEXT_NODE) {
      if (offset === 0) {
        return {n: n.parentNode, offset: LibNode.orderOfChild(n.parentNode, n)};
      }
      if (offset === n.textContent.length) {
        return {n: n.parentNode, offset: LibNode.orderOfChild(n.parentNode, n) + 1};
      }
    }
    return {n, offset};
  }
  static isFirst(p: Position, n?: Node): boolean {
    if (!n) { n = p.n; }
    if (n === p.n && p.offset === 0) {
      return true;
    }
    const p1 = LibPosition.normalize(p);
    return n === p1.n && p1.offset === 0;
  }
  static isLast(p: Position, n?: Node): boolean {
    if (!n) { n = p.n; }
    let l;
    if (n.nodeType === Node.TEXT_NODE) { l = n.textContent.length; }
    else if (n.nodeType === Node.ELEMENT_NODE) { l = n.childNodes.length; }
    else { return false; }
    if (n === p.n && p.offset === l) {
      return true;
    }
    const p1 = LibPosition.normalize(p);
    return n === p1.n && p1.offset === l;
  }
  static textNode(p: Position): Position {
    if (p.n.nodeType === Node.TEXT_NODE) {
      return p;
    }
    if (p.n.childNodes[p.offset]) {
      if (p.n.childNodes[p.offset].nodeType === Node.TEXT_NODE) {
        return {n: p.n.childNodes[p.offset], offset: 0};
      }
    } else if (p.offset > 0 && p.n.childNodes[p.offset - 1].nodeType === Node.TEXT_NODE) {
      return {n: p.n.childNodes[p.offset - 1], offset: p.n.childNodes[p.offset - 1].textContent.length};
    }
    return null;
  }
  static prevText(p: Position): Position {
    p = LibPosition.textNode(p);
    if (p && p.offset > 0) {
      return {n: p.n, offset: p.offset - 1};
    }
    return null;
  }
  static nextText(p: Position): Position {
    p = LibPosition.textNode(p);
    if (p && p.offset < p.n.textContent.length) {
      return {n: p.n, offset: p.offset + 1};
    }
    return null;
  }
  static normalize(p: Position): Position {
    return LibPosition.normalizePoint(p.n, p.offset);
  }
  static newObject(p: Position): LibPosition {
    return new LibPosition(p.n, p.offset);
  }
  static fromNode(n: Node): LibPosition {
    return new LibPosition(n.parentNode, LibNode.orderOfChild(n.parentNode, n));
  }
  static nodeOfPoints(n: Node, offset: number): Node {
    if (n.nodeType === Node.ELEMENT_NODE) {
      return n.childNodes[offset] || n;
    }
    return n;
  }
  static elementOfPoints(n: Node, offset: number): HTMLElement {
    n = LibPosition.nodeOfPoints(n, offset);
    if (n.nodeType === Node.ELEMENT_NODE) {
      return n as HTMLElement;
    }
    return n.parentElement;
  }
  static nodeOfPosition(p: Position): Node {
    return LibPosition.nodeOfPoints(p.n, p.offset);
  }
  static elementOfPosition(p: Position): HTMLElement {
    return LibPosition.elementOfPoints(p.n, p.offset);
  }
  toNode(): Node {
    if (this._n.nodeType === Node.ELEMENT_NODE) {
      return this._n.childNodes[this._offset];
    }
    return this._n;
  }
  present(): boolean {
    return !!this.toNode();
  }
  tagName(): string {
    return LibNode.tagName(this.toNode());
  }
  order(): number {
    const t = this.toNode();
    if (t) {
      return LibNode.orderOfChild(t.parentNode, t);
    }
    return -1;
  }
  container(): boolean {
    return LibNode.isContainer(this.toNode());
  }
  emptyNode(): boolean {
    return LibNode.isEmptyNode(this.toNode());
  }
  private exitContainer(): LibPosition {
    return new LibPosition(this._n.parentNode, LibNode.orderOfChild(this._n.parentNode, this._n));
  }
  private lastPosition(): LibPosition {
    if (this.container()) {
      const n = this.toNode();
      return new LibPosition(n, n.childNodes.length);
    }
    return null;
  }
  private nodePosition(): Position {
    let offset = this._offset;
    let n = this._n;
    if (this._n.nodeType === Node.TEXT_NODE) {
      offset = LibNode.orderOfChild(this._n.parentNode, this._n);
      n = this._n.parentNode;
    }
    return {n, offset};
  }
  prevNode(): LibPosition {
    const {n, offset} = this.nodePosition();
    if (offset > 0) {
      const prev = new LibPosition(n, offset - 1);
      if (prev.container()) {
        return prev.lastPosition();
      }
      return prev;
    } else {
      const p = this.exitContainer();
      if (p.toNode() && p.toNode().nodeType === Node.TEXT_NODE) {
        return p.prevNode();
      } else {
        return p;
      }
    }
  }
  nextNode(checkContainer = true): LibPosition {
    const {n, offset} = this.nodePosition();
    if (checkContainer && this.container()) {
      return new LibPosition(this.toNode(), 0);
    }
    if (offset < n.childNodes.length) {
      return new LibPosition(n, offset + 1);
    } else {
      const p = this.exitContainer();
      return p.nextNode(false);
    }
  }
}
export class LibNode {
  static EMPTY_ELEMENTS = EMPTY_ELEMENTS;
  static BLOCK_ELEMENTS = BLOCK_ELEMENTS;
  static PHRASING_ELEMENTS = PHRASING_ELEMENTS;
  static orderOfChild(parent: Node, child: Node): number {
    let n = 0; for (; parent.childNodes[n] !== child && parent.childNodes[n]; ++n){}
    return parent.childNodes[n] ? n : -1;
  }
  static tagName(n: Node): string {
    return (n && n.nodeType === Node.ELEMENT_NODE) ? (n as HTMLElement).tagName.toLowerCase() : null;
  }
  static getAttribute(n: Node, attr): string {
    if (n) {
      if (n.nodeType === Node.ELEMENT_NODE) {
        return (n as HTMLElement).getAttribute(attr);
      } else {
        return n.parentElement.getAttribute(attr);
      }
    }
    return null;
  }
  static isContainer(n: Node): boolean {
    const tag = LibNode.tagName(n);
    return tag && !EMPTY_ELEMENTS.includes(tag);
  }
  static isEmptyTag(tag: string): boolean {
    return EMPTY_ELEMENTS.includes(tag);
  }
  static isBlockTag(tag: string): boolean {
    return BLOCK_ELEMENTS.includes(tag);
  }
  static isPhrasingTag(tag: string): boolean {
    return PHRASING_ELEMENTS.includes(tag);
  }
  static isEmptyNode(n: Node): boolean {
    return n && EMPTY_ELEMENTS.includes(n.nodeName);
  }
}
export class LibNodeIterator implements Iterable<LibPosition>, Iterator<LibPosition>{
  private current: LibPosition;
  private done: boolean;
  constructor(private root: Node, private from: Position, private revert = false) {
    this.current = LibPosition.newObject(LibPosition.normalize(from));
    this.done = this.isDone();
  }
  private isDone(): boolean {
    return (this.revert && LibPosition.equal({n: this.root, offset: 0}, this.current))
      || (!this.revert && LibPosition.equal({n: this.root, offset: this.root.childNodes.length}, this.current));
  }
  next(...args: [] | [undefined]): IteratorResult<LibPosition> {
    if (this.done) {
      return {done: true, value: null};
    }
    if (this.revert) {
      this.current = this.current.prevNode();
    } else {
      this.current = this.current.nextNode();
    }
    this.done = this.isDone();
    return {done: false, value: this.current};
  }
  [Symbol.iterator](): Iterator<LibPosition> {
    return this;
  }
}
