// tslint:disable:max-line-length

export abstract class NodeWrapper {
  get errors(): string[] {
    return this._errors;
  }
  get warnings(): string[] {
    return this._warnings;
  }
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
  protected abstract state: number;
  private readonly _errors = [];
  private readonly _warnings = [];
  static isDescOf(n: NodeWrapper, parent: string): boolean {
    while (n.nodeName !== 'body') {
      if (n.nodeName === parent) {
        return true;
      }
      n = n.parent;
    }
    return false;
  }
  setError(s: string): void {
    this._errors.push(s);
  }
  setWarning(s: string): void {
    this._warnings.push(s);
  }
  abstract attribute(name: string): string;
  abstract equal(n: NodeWrapper): boolean;
  abstract addChild(n: NodeWrapper): void;
  abstract getText(): string;
  containAttributes(attr?: {[key: string]: string}): boolean {
    let res = true;
    if (attr) {
      Object.keys(attr).forEach(k => {
        if (attr[k] !== this.attribute(k)) {
          res = false;
        }
      });
    }
    return res;
  }
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
    let prev: NodeWrapper = null;
    const from = this;
    treeWalkerR(from, undefined, (w) => {
      if (w !== from && !(w.typeNode === Node.TEXT_NODE && (w.index === w.parent.numChildren - 1) && !w.getText())) {
        prev = w;
        return true;
      }
    });
    return prev;
  }
  nextNode(): NodeWrapper {
    const from: NodeWrapper = this;
    let next: NodeWrapper = null;
    treeWalker<NodeWrapper>(from, (w) => {
      if (w !== from) {
        next = w;
        return true;
      }
    });
    return next;
  }
  hasParent<T extends NodeWrapper>(nodeNames: Array<string | {nodeName: string, attr: {[key: string]: string}}>): T {
    let p = this.parent;
    while (p) {
      if (nodeNames.find(v => {
        if (typeof v === 'string') {
          return v === p.nodeName;
        }
        return v.nodeName === p.nodeName && p.containAttributes(v.attr);
      })) {
        return p as T;
      }
      p = p.parent;
    }
    return null;
  }
  ancestorIndex(ancestor: NodeWrapper): number {
    let w: NodeWrapper = this;
    while (w.parent && !ancestor.equal(w.parent)) {
      w = w.parent;
    }
    return w ? w.index : -1;
  }
  abstract validate(correct?: boolean): void;
  toString(): string {
    return `${this.nodeName}, parent:${this.parent ? this.parent.nodeName : 'null'}, index:${this.index}`;
  }
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

export function treeWalkerR<T extends NodeWrapper>(from: T, enter: (n: T) => void = () => null, exit: (s: T) => any = () => null, root?: T): void {
  let r = from;
  while (r) {
    if (exit(r)) {
      return;
    }
    if (!r.prev) {
      if (r === root || r.equal(root)) {
        return null;
      }
      r = r.parent as T;
      continue;
    }
    r = r.prev as T;
    enter(r);
    while (r) {
      if (!r.lastChild) {
        break;
      }
      r = r.lastChild as T;
      enter(r);
    }
  }
}
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
    this.current = from || null;
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
      this.current = this.current.nextNode() as T;
    }
    this.done = this.isDone();
    return {done: this.done, value: this.current};
  }
  [Symbol.iterator](): Iterator<T> {
    return this;
  }
}
