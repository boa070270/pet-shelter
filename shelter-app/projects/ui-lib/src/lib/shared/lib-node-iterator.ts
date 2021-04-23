
const EMPTY_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

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
export class LibNodeIterator implements Iterable<{ n: Node, offset: number }>, Iterator<{ n: Node, offset: number }>{
  private readonly iterator: NodeIterator;
  private current: Node;
  private done: boolean;
  private prepared: { n: Node, offset: number };
  constructor(private root: Node, from: Node, private revert = false,
              private readonly whatToShow?: number, private filter?: NodeFilter) {
    if (this.whatToShow === undefined) {
      this.whatToShow = NodeFilter.SHOW_COMMENT + NodeFilter.SHOW_CDATA_SECTION + NodeFilter.SHOW_TEXT + NodeFilter.SHOW_ELEMENT;
    }
    this.iterator = document.createNodeIterator(root, this.whatToShow, filter);
    do {
      this.current = this.iterator.nextNode();
    } while (this.current !== from && this.current !== null);
    this.done = this.current === null && !this.revert;
  }
  next(...args: [] | [undefined]): IteratorResult<{ n: Node; offset: number }> {
    if (this.done) {
      return this.result();
    }
    if (this.prepared) {
      const r = this.prepared;
      this.prepared = null;
      return this.result(r.n, r.offset);
    }
    if (this.revert) {
      this.current = this.iterator.previousNode();
    } else {
      this.current = this.iterator.nextNode();
    }
    if (this.current && this.current !== this.root) {
      const offset = orderOfChild(this.current.parentNode, this.current);
      if (offset + 1 === this.current.parentNode.childNodes.length) {
        if (this.revert) {
          this.prepared = {n: this.current.parentNode, offset};
          return this.result(this.current.parentNode, offset + 1);
        } else {
          this.prepared = {n: this.current.parentNode, offset: offset + 1};
          return this.resultNode(this.current);
        }
      }
      if (isContainer(this.current) && !this.current.hasChildNodes()) {
        if (this.revert) {
          this.prepared = {n: this.current.parentNode, offset};
          return this.result(this.current, 0);
        } else {
          this.prepared = {n: this.current, offset: 0};
          return this.resultNode(this.current);
        }
      }
      return this.resultNode(this.current);
    } else {
      let res;
      if (this.revert) {
        res = this.result(this.root, 0);
      } else {
        res = this.result(this.root, this.root.childNodes.length);
      }
      this.done = true;
      return res;
    }
  }
  private resultNode(n: Node): IteratorResult<{ n: Node; offset: number }> {
    return this.result(n.parentNode, orderOfChild(n.parentNode, n));
  }
  private result(n?: Node, offset?: number): IteratorResult<{ n: Node; offset: number }> {
    if (!this.done) {
      return {done: false, value: {n, offset}};
    }
    return {done: true, value: null};
  }
  [Symbol.iterator](): Iterator<{ n: Node; offset: number }> {
    return this;
  }

}
