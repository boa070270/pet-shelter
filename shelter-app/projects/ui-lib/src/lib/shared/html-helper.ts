import {SNode} from './html-validator';

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
  child<T extends NodeWrapper>(inx: number): T {
    let w: T = this.firstChild as T;
    if (inx < 0 && inx >= this.numChildren) { return null; }
    for (let i = 1; i <= inx && w !== null; w = w.next as T, ++i) {}
    return w;
  }
  findChild<T extends NodeWrapper>(p: (n: NodeWrapper) => boolean): T {
    let w = this.firstChild as T;
    while (w) {
      if (p(w)) {
        return w;
      }
      w = w.next as T;
    }
  }
  everyChild(p: (n: NodeWrapper) => void): void {
    let c = this.firstChild;
    while (c) {
      p(c);
      c = c.next;
    }
  }
  prevNode(): NodeWrapper {
    return this.prev || this.parent;
  }

  nextNode<T extends NodeWrapper>(root: NodeWrapper): T {
    let n = this.firstChild as T;
    if (n) { return n; }
    n = this.next as T;
    if (n) { return n; }
    n = this.parent as T;
    while (n) {
      if (n === root || root.equal(n)) { break; }
      if (n.next) { return n.next as T; }
      n = n.parent as T;
    }
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

export class SPosition {
  get sNode(): SNode {
    return SPosition.toSNode(this);
  }
  /**
   * if n.typeNode === Node.ELEMENT_NODE offset point on child node (can be out of range)
   * else offset point on text position
   */
  constructor(public n: SNode, public offset: number) {}
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
        if (sn && sn.typeNode === Node.TEXT_NODE) {
          return new SPosition(sn, down ? 0 : sn.getText().length);
        }
        return new SPosition(sn.parent, sn.index);
      }
    }
    return null;
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
  constructor(public commonAncestor: SNode, public start: SPosition, public end: SPosition, public collapsed) {
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
export function treeWalker<T extends NodeWrapper>(from: T, enter: (n: T) => any = () => null, exit: (s: T) => void = () => null, root?: T): void {
  let r = from;
  start: while (r) {
    if (!! enter(r)) {
        break;
    }
    if (r.firstChild) {
      r = r.firstChild as T;
      continue;
    }
    while (r) {
      exit(r);
      if (r === root || r.equal(root)) {
        r = null;
      } else if (r.next) {
        r = r.next as T;
        continue start;
      } else {
        r = r.parent as T;
      }
    }
  }
}
export class SNodeIterator<T extends NodeWrapper> implements Iterable<T>, Iterator<T>{
  private current: T;
  private done: boolean;
  constructor(private root: T, private from: T, private revert = false) {
    this.current = from;
    this.done = this.isDone();
  }
  private isDone(): boolean {
    return this.current === null || this.root.equal(this.current);
  }
  next(...args: [] | [undefined]): IteratorResult<T> {
    if (this.done) {
      return {done: true, value: null};
    }
    if (this.revert) {
      this.current = this.current.prevNode() as T;
    } else {
      this.current = this.current.nextNode(this.root) as T;
    }
    this.done = this.isDone();
    return {done: this.done, value: this.current};
  }
  [Symbol.iterator](): Iterator<T> {
    return this;
  }
}
