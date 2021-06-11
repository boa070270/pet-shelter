export abstract class NodeWrapper {
  abstract nodeName: string;
  abstract typeNode: number;
  abstract index: number;
  abstract numChildren: number;
  abstract parent: NodeWrapper;
  abstract firstChild: NodeWrapper;
  abstract lastChild: NodeWrapper;
  abstract next: NodeWrapper;
  abstract prev: NodeWrapper;
  // 0, undefined, null - without change, -1 - deleted, 1 - modified, 2 - new, 3 - attr modified
  abstract state: number;
  readonly errors = [];
  readonly warnings = [];
  static isDescOf(n: NodeWrapper, parent: string): boolean {
    while (n.nodeName !== 'body') {
      if (n.nodeName === parent) {
        return true;
      }
      n = n.parent;
    }
    return false;
  }
  abstract attribute(name: string): string;
  abstract equal(n: NodeWrapper): boolean;
  abstract addChild(n: NodeWrapper): void;
  child(inx: number): NodeWrapper {
    let w = this.firstChild;
    if (inx < 0 && inx >= this.numChildren) { return null; }
    for (let i = 1; i <= inx && w !== null; w = w.next, ++i) {}
    return w;
  }
  findChild(p: (n: NodeWrapper) => boolean): NodeWrapper {
    let w = this.firstChild;
    while (w) {
      if (p(w)) {
        return w;
      }
      w = w.next;
    }
  }
  everyChild(p: (n: NodeWrapper) => void): void {
    let c = this.firstChild;
    while (c) {
      p(c);
      c = c.next;
    }
  }
  thisPosition(): SPosition {
    return this.parent ? new SPosition(this.parent, this.index) : null;
  }
  prevNode(): NodeWrapper {
    return this.prev || this.parent;
  }

  nextNode(root: NodeWrapper): NodeWrapper {
    let n = this.firstChild;
    if (n) { return n; }
    n = this.next;
    if (n) { return n; }
    n = this.parent;
    while (n) {
      if (n === root || root.equal(n)) { break; }
      if (n.next) { return n.next; }
      n = n.parent;
    }
    return null;
  }
  prevPosition(): SPosition {
    const n = this.prevNode();
    if (n) { return n.thisPosition(); }
    return null;
  }
  nextPosition(root: NodeWrapper): SPosition { // we return only palpable node
    const n = this.nextNode(root);
    if (n) { return n.thisPosition(); }
    return null;
  }
  abstract validate(correct?: boolean): void;
}
export function isDescendant(p: NodeWrapper, c: NodeWrapper): boolean {
  while (c !== null) {
    if (c === p) {
      return true;
    }
    c = c.parent;
  }
  return false;
}

export class HtmlWrapper extends NodeWrapper {
  readonly state = 0;
  constructor(private n: Node) {
    super();
  }
  get original(): Node {
    return this.n;
  }
  get nodeName(): string {
    return this.n.nodeName.toLowerCase();
  }
  get typeNode(): number {
    return this.n.nodeType;
  }
  get parent(): NodeWrapper {
    return this.n.parentNode ? new HtmlWrapper(this.n.parentNode) : null;
  }
  get firstChild(): NodeWrapper {
    return this.n.firstChild ? new HtmlWrapper(this.n.firstChild) : null;
  }
  get lastChild(): NodeWrapper {
    return this.n.lastChild ? new HtmlWrapper(this.n.lastChild) : null;
  }
  get next(): NodeWrapper {
    return this.n.nextSibling ? new HtmlWrapper(this.n.nextSibling) : null;
  }
  get prev(): NodeWrapper {
    return this.n.previousSibling ? new HtmlWrapper(this.n.previousSibling) : null;
  }
  get index(): number {
    let i = 0; let f = this.n.parentNode.firstChild;
    while (f !== null) {
      if (f === this.n) {
        return i;
      }
      i++;
      f = f.nextSibling;
    }
    return -1;
  }
  attribute(name: string): string {
    return this.n.nodeType === Node.ELEMENT_NODE ? (this.n as HTMLElement).getAttribute(name) : null;
  }
  get numChildren(): number {
    return this.n.childNodes ? this.n.childNodes.length : 0;
  }
  equal(n: NodeWrapper): boolean {
    return this.n === (n as HtmlWrapper).n;
  }
  addChild(n: NodeWrapper): void {
    // nothing
  }

  validate(correct?: boolean): void {
  }
}

export class SPosition {
  /**
   * if n.typeNode === Node.ELEMENT_NODE offset point on child node (can be out of range)
   * else offset point on text position
   */
  constructor(public n: NodeWrapper, public offset: number) {}
  static equalPosition(p1: SPosition, p2: SPosition): boolean {
    return p1.n.equal(p2.n) && p1.offset === p2.offset;
  }
  static findPosition(root: NodeWrapper, from: SPosition, criteria: (p: SPosition) => SPosition, down: boolean): SPosition {
    const iterator = new PositionIterator(root, from, !down);
    for (const next of iterator) {
      const res = criteria(next);
      if (res) {
        return res;
      }
    }
    return null;
  }
  prevPosition(root: NodeWrapper): SPosition {
    if (this.n === root && this.offset === 0) {
      return null;
    }
    const n = this.positionToNode();
    if (n) {
      return n.prevPosition();
    }
    throw new Error('There is null node'); // TODO
  }
  nextPosition(root: NodeWrapper): SPosition {
    if (this.n === root && this.offset === root.numChildren) {
      return null;
    }
    const n = this.positionToNode();
    if (n) {
      return n.nextPosition(root);
    }
    throw new Error('There is null node'); // TODO
  }
  positionToNode(): NodeWrapper {
    if (this.n.typeNode === Node.ELEMENT_NODE) {
      return this.n.child(this.offset);
    }
    return this.n;
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
  constructor(public commonAncestor: NodeWrapper, public start: SPosition, public end: SPosition, public collapsed) {
    this.indexStart = start.n.equal(commonAncestor) ? start.offset : this.ancestorIndex(start.n);
    this.indexEnd = end.n.equal(commonAncestor) ? end.offset : this.ancestorIndex(end.n);
  }
  private ancestorIndex(n: NodeWrapper): number {
    while (!this.commonAncestor.equal(n.parent) && n.parent) {
      n = n.parent;
    }
    return n.index;
  }
}
// tslint:disable-next-line:max-line-length
export function treeWalker(from: NodeWrapper, enter: (n: NodeWrapper) => any = () => null, exit: (s: NodeWrapper) => void = () => null, root?: NodeWrapper): void {
  let r = from;
  start: while (r) {
    if (!! enter(r)) {
        break;
    }
    if (r.firstChild) {
      r = r.firstChild;
      continue;
    }
    while (r) {
      exit(r);
      if (r === root || r.equal(root)) {
        r = null;
      } else if (r.next) {
        r = r.next;
        continue start;
      } else {
        r = r.parent;
      }
    }
  }
}
export class PositionIterator implements Iterable<SPosition>, Iterator<SPosition>{
  private current: SPosition;
  private done: boolean;
  constructor(private root: NodeWrapper, private from: SPosition, private revert = false) {
    this.current = from;
    this.done = this.isDone();
  }
  private isDone(): boolean {
    return (this.revert && SPosition.equalPosition(new SPosition(this.root, 0), this.current))
      || (!this.revert && SPosition.equalPosition(new SPosition(this.root, this.root.numChildren), this.current));
  }
  next(...args: [] | [undefined]): IteratorResult<SPosition> {
    if (this.done) {
      return {done: true, value: null};
    }
    if (this.revert) {
      this.current = this.current.prevPosition(this.root);
    } else {
      this.current = this.current.nextPosition(this.root);
    }
    this.done = this.isDone();
    return {done: this.done, value: this.current};
  }
  [Symbol.iterator](): Iterator<SPosition> {
    return this;
  }
}
export class SNodeIterator implements Iterable<NodeWrapper>, Iterator<NodeWrapper>{
  private current: NodeWrapper;
  private done: boolean;
  constructor(private root: NodeWrapper, private from: NodeWrapper, private revert = false) {
    this.current = from;
    this.done = this.isDone();
  }
  private isDone(): boolean {
    return this.current === null || this.root.equal(this.current);
  }
  next(...args: [] | [undefined]): IteratorResult<NodeWrapper> {
    if (this.done) {
      return {done: true, value: null};
    }
    if (this.revert) {
      this.current = this.current.prevNode();
    } else {
      this.current = this.current.nextNode(this.root);
    }
    this.done = this.isDone();
    return {done: this.done, value: this.current};
  }
  [Symbol.iterator](): Iterator<NodeWrapper> {
    return this;
  }
}
