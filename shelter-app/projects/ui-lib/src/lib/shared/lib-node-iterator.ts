// tslint:disable:max-line-length

import {NodeWrapper} from './html-helper';

export interface RangePosition { n: Node; offset: number; isImpl?: boolean; }
export class LibPosition implements RangePosition {
  readonly isImpl = true;
  get n(): Node { return this._n; }
  get offset(): number { return this._offset; }
  constructor(private _n: Node, private _offset: number) {}
  static asLibPosition(p: RangePosition): LibPosition {
    return p.isImpl ? p as LibPosition : LibPosition.newObject(p);
  }
  static normalizePoint(n: Node, offset: number): RangePosition {
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
  static newObject(p: RangePosition): LibPosition {
    return new LibPosition(p.n, p.offset);
  }
}
export class LibNode {
  static orderOfChild(parent: Node, child: Node): number {
    let n = 0; let f = parent.firstChild;
    while (f) {
      if (f === child) {
        return n;
      }
      n++;
      f = f.nextSibling;
    }
    throw new Error('Absent a child');
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
  static nodeOfPoints(n: Node, offset: number): Node {
    if (n.nodeType === Node.ELEMENT_NODE) {
      return n.childNodes[offset] || n;
    }
    return n;
  }
  static nodeOfPosition(rp: RangePosition): Node {
    return LibNode.nodeOfPoints(rp.n, rp.offset);
  }
  static nodePosition(n: Node): LibPosition {
    return new LibPosition(n.parentNode, LibNode.orderOfChild(n.parentNode, n));
  }
}
export class HtmlWrapper extends NodeWrapper {
  get firstChild(): NodeWrapper {
    return this.wrapperOrNull(this.node.firstChild);
  }
  get index(): number {
    return LibNode.orderOfChild(this.node.parentNode, this.node);
  }
  get lastChild(): NodeWrapper {
    return this.wrapperOrNull(this.node.lastChild);
  }
  get next(): NodeWrapper {
    return this.wrapperOrNull(this.node.nextSibling);
  }
  get nodeName(): string {
    return this.node.nodeName.toLowerCase();
  }
  get numChildren(): number {
    return this.node.hasChildNodes() ? this.node.childNodes.length : 0;
  }
  get parent(): NodeWrapper {
    return this.wrapperOrNull(this.node.parentNode);
  }
  get prev(): NodeWrapper {
    return this.wrapperOrNull(this.node.previousSibling);
  }
  state: number = 0;
  get typeNode(): number {
    return this.node.nodeType;
  }
  addChild(n: NodeWrapper): void {}
  attribute(name: string): string {
    const a = this.typeNode === Node.ELEMENT_NODE ? (this.node as HTMLElement).getAttribute(name) : null;
    return a ? a.toLowerCase() : a;
  }
  equal(n: NodeWrapper): boolean {
    return n instanceof HtmlWrapper ? this.node === n.node : false;
  }
  validate(correct?: boolean): void {}
  constructor(public node: Node) {
    super();
  }
  private wrapperOrNull(n: Node): NodeWrapper {
    return n ? new HtmlWrapper(n) : null;
  }
  getText(): string {
    return this.node.textContent;
  }
}
