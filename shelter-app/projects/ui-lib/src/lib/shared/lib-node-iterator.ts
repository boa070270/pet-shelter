export const EMPTY_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
export interface Position { n: Node; offset: number; isImpl?: boolean; }
export function asPositionImpl(p: Position): PositionImpl {
  return p.isImpl ? p as PositionImpl : PositionImpl.newObject(p);
}
export class PositionImpl implements Position {
  readonly isImpl = true;
  get n(): Node { return this._n; }
  get offset(): number { return this._offset; }
  constructor(private _n: Node, private _offset: number) {}
  static newObject(p: Position): PositionImpl {
    return new PositionImpl(p.n, p.offset);
  }
  static fromNode(n: Node): PositionImpl {
    return new PositionImpl(n.parentNode, orderOfChild(n.parentNode, n));
  }
  static nodeOfPoints(n: Node, offset: number): Node {
    if (n.nodeType === Node.ELEMENT_NODE) {
      return n.childNodes[offset] || n;
    }
    return n;
  }
  static nodeOfPosition(p: Position): Node {
    return this.nodeOfPoints(p.n, p.offset);
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
    return tagName(this.toNode());
  }
  getAttribute(s: string): string {
    const n = this.toNode();
    if (n && n.nodeType === Node.ELEMENT_NODE) {
      return (n as HTMLElement).getAttribute(s);
    }
    return null;
  }
  order(): number {
    const t = this.toNode();
    if (t) {
      return orderOfChild(t.parentNode, t);
    }
    return -1;
  }
  hasOffset(): boolean {
    return hasOffset(this.toNode());
  }
  container(): boolean {
    return isContainer(this.toNode());
  }
  emptyNode(): boolean {
    return isEmptyNode(this.toNode());
  }
  textOrElement(): boolean {
    const n = this.toNode();
    return n && (n.nodeType === Node.TEXT_NODE || n.nodeType === Node.ELEMENT_NODE);
  }
  private exitContainer(): PositionImpl {
    return new PositionImpl(this._n.parentNode, orderOfChild(this._n.parentNode, this._n));
  }
  private lastPosition(): PositionImpl {
    if (this.container()) {
      const n = this.toNode();
      return new PositionImpl(n, n.childNodes.length);
    }
    return null;
  }
  private nodePosition(): Position {
    let offset = this._offset;
    let n = this._n;
    if (this._n.nodeType === Node.TEXT_NODE) {
      offset = orderOfChild(this._n.parentNode, this._n);
      n = this._n.parentNode;
    }
    return {n, offset};
  }
  prevNode(): PositionImpl {
    const {n, offset} = this.nodePosition();
    if (offset > 0) {
      const prev = new PositionImpl(n, offset - 1);
      if (prev.container()) {
        return prev.lastPosition();
      }
      return prev;
    } else {
      const p = this.exitContainer();
      if (this.toNode() && this.toNode().nodeType === Node.TEXT_NODE) {
        return p.prevNode();
      } else {
        return p;
      }
    }
  }
  nextNode(checkContainer = true): PositionImpl {
    const {n, offset} = this.nodePosition();
    if (checkContainer && this.container()) {
      return new PositionImpl(this.toNode(), 0);
    }
    if (offset < n.childNodes.length) {
      return new PositionImpl(n, offset + 1);
    } else {
      const p = this.exitContainer();
      return p.nextNode(false);
    }
  }
}
export function orderOfChild(parent: Node, child: Node): number {
  let n = 0; for (; parent.childNodes[n] !== child && parent.childNodes[n]; ++n){}
  return parent.childNodes[n] ? n : -1;
}
export function tagName(n: Node): string {
  return (n && n.nodeType === Node.ELEMENT_NODE) ? (n as HTMLElement).tagName.toLowerCase() : null;
}
export function hasOffset(n: Node): boolean {
  const tag = tagName(n);
  return tag && (!EMPTY_ELEMENTS.includes(tag) || n.nodeType === Node.TEXT_NODE);
}
export function isContainer(n: Node): boolean {
  const tag = tagName(n);
  return tag && !EMPTY_ELEMENTS.includes(tag);
}
export function isEmptyTag(tag: string): boolean {
  return EMPTY_ELEMENTS.includes(tag.toLowerCase());
}
export function isEmptyNode(n: Node): boolean {
  const tag = tagName(n);
  return tag && EMPTY_ELEMENTS.includes(tag);
}
export class LibNodeIterator implements Iterable<PositionImpl>, Iterator<PositionImpl>{
  private current: PositionImpl;
  private done: boolean;
  constructor(private root: Node, private from: Position, private revert = false) {
    this.current = from.isImpl ? from as PositionImpl : PositionImpl.newObject(from);
    this.done = this.isDone();
  }
  private isDone(): boolean {
    return (this.revert && this.current.n === this.root && this.current.offset === 0)
      || (!this.revert && this.current.n === this.root && this.current.offset === this.root.childNodes.length);
  }
  next(...args: [] | [undefined]): IteratorResult<PositionImpl> {
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
  [Symbol.iterator](): Iterator<PositionImpl> {
    return this;
  }
}
