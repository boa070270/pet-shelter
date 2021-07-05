import { SimpleParser } from './html-validator';

class SelectionMock implements Selection {
  get anchorNode(): Node {
    return this.ranges.length > 0 ? this.ranges[0].startContainer : null;
  }
  get anchorOffset(): number {
    return this.ranges.length > 0 ? this.ranges[0].startOffset : null;
  }
  get focusNode(): Node  {
    return this.ranges.length > 0 ? this.ranges[0].startContainer : null;
  }
  get focusOffset(): number {
    return this.ranges.length > 0 ? this.ranges[0].startOffset : null;
  }
  get isCollapsed(): boolean {
    return this.ranges.length > 0 ? this.ranges[0].startOffset === this.ranges[0].endOffset
      && this.ranges[0].startOffset === this.ranges[0].endOffset : true;
  }
  get rangeCount(): number {
    return this.ranges.length;
  }
  readonly type: string;
  ranges: Range[] = [];
  addRange(range: Range): void {
    this.ranges.push(range);
  }
  collapse(node: Node | null, offset?: number): void {
    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    this.addRange(range);
  }
  collapseToEnd(): void {
  }
  collapseToStart(): void {
  }
  containsNode(node: Node, allowPartialContainment?: boolean): boolean {
    return false;
  }
  deleteFromDocument(): void {
  }
  empty(): void {
  }
  extend(node: Node, offset?: number): void {
  }
  getRangeAt(index: number): Range {
    return this.ranges[index];
  }
  removeAllRanges(): void {
    this.ranges = [];
  }
  removeRange(range: Range): void {
  }
  selectAllChildren(node: Node): void {
  }
  setBaseAndExtent(anchorNode: Node, anchorOffset: number, focusNode: Node, focusOffset: number): void {
  }
  setPosition(node: Node | null, offset?: number): void {
  }
}
describe('html-validator', () => {
  const main = document.createElement('main');
  describe('Check parsing', () => {
    it('The same model', () => {
      const source = '<section _design="0"><h1 _design="1">Header</h1><p _design="2">First paragraph</p></section>';
      const sp = new SimpleParser(source, main, '_design');
      expect(sp.errors.length).toBe(0);
      expect(main.childNodes.length).toBe(1);
      expect(sp.root.numChildren).toBe(2); // we add text node where expected
      expect(sp.source).toBe(source);
    });
    it('All attributes', () => {
      const source = '<section _design="1" attr1 attr2="attr2"><h1 _design="1">Header</h1><p _design="2">First paragraph</p></section>';
      const sp = new SimpleParser(source, main, '_design');
      expect(main.firstElementChild.getAttribute('_design')).toBe('1');
      expect(main.firstElementChild.getAttribute('attr2')).toBe('attr2');
      expect(main.firstElementChild.getAttribute('attr1')).toBe('');
    });
    it('First position', () => {
      const rangeObject = new SelectionMock();
      spyOn(window, 'getSelection').and.returnValue(rangeObject);
      const sp = new SimpleParser('<section><h1>Header</h1><p>First paragraph</p></section>', main, '_design');
      const selection = window.getSelection();
      expect(selection.focusNode.nodeType).toBe(Node.TEXT_NODE);
      expect(selection.focusNode.textContent).toBe('Header');
    });
  });
  // describe('Simple parser position', () => {
  //   const range = {};
  //   beforeEach(() => {
  //
  //   });
  // });
});
