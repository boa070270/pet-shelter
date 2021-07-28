// tslint:disable:max-line-length
import { SimpleParser } from './html-validator';

class RangeBuilder {
  _range: Range;
  get range(): Range {
    return this._range;
  }
  get selection(): Selection {
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(this._range);
    return window.getSelection();
  }
  constructor() {
    this._range = document.createRange();
  }
  static buildRange(): RangeBuilder {
    return new RangeBuilder();
  }
  start(n: Node, offset: number): RangeBuilder {
    this._range.setStart(n, offset);
    return this;
  }
  end(n: Node, offset: number): RangeBuilder {
    this._range.setEnd(n, offset);
    return this;
  }
}
class SelectionMock implements Selection {
  get anchorNode(): Node {
    return this.ranges.length > 0 ? this.ranges[0].startContainer : null;
  }
  get anchorOffset(): number {
    return this.ranges.length > 0 ? this.ranges[0].startOffset : null;
  }
  get focusNode(): Node  {
    return this.ranges.length > 0 ? this.ranges[0].endContainer : null;
  }
  get focusOffset(): number {
    return this.ranges.length > 0 ? this.ranges[0].endOffset : null;
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
    this.ranges = [];
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
const DESIGN_ATTR = '_design';
function createParser(main: HTMLElement): SimpleParser {
  const sp = new SimpleParser(DESIGN_ATTR);
  sp.editor = main;
  return sp;
}
describe('html-validator', () => {
  const main = document.createElement('main');
  main.setAttribute(DESIGN_ATTR, '0');
  document.body.appendChild(main);

  function init(source: string): SimpleParser {
    const rangeObject = new SelectionMock();
    spyOn(window, 'getSelection').and.returnValue(rangeObject);
    const sp = createParser(main);
    sp.parse(source);
    return sp;
  }

  describe('Check parsing', () => {
    it('The same model', () => {
      const source = '<section><h1>Header</h1><p>First paragraph</p></section>';
      const sp = createParser(main);
      sp.parse(source);
      expect(sp.errors.length).toBe(0);
      expect(main.childNodes.length).toBe(1);
      expect(sp.root.numChildren).toBe(2); // we add text node where expected
      expect(sp.source).toBe(source);
    });
    it('All attributes', () => {
      const source = '<section attr1 attr2="attr2"><h1 _design="1">Header</h1><p _design="2">First paragraph</p></section>';
      const sp = createParser(main);
      sp.parse(source);
      expect(main.firstElementChild.getAttribute(DESIGN_ATTR)).toBe('1');
      expect(main.firstElementChild.getAttribute('attr2')).toBe('attr2');
      expect(main.firstElementChild.getAttribute('attr1')).toBe('');
    });
    it('First position', () => {
      const sp = init('<section><h1>Header</h1><p>First paragraph</p></section>');
      const selection = window.getSelection();
      expect(selection.focusNode.nodeType).toBe(Node.TEXT_NODE);
      expect(selection.focusNode.textContent).toBe('Header');
    });
  });
  describe('Selection', () => {
    it('Select all', () => {
      const sp = init('<section><h1>Header</h1><p>First paragraph</p></section>');
      sp.selectAll();
      const range = document.createRange();
      range.selectNodeContents(main);
      const selection = window.getSelection();
      expect(selection.isCollapsed).toBe(false);
      expect(selection.focusNode).toBe(selection.anchorNode);
      expect(selection.getRangeAt(0)).toEqual(range);
    });
    it('initFromSelection', () => {
      const sp = init('<section><h1>Header</h1><p>First paragraph</p></section>');
      const selection = window.getSelection();
      const h1 = main.querySelector('h1');
      selection.collapse(h1.firstChild, 2);
      sp.initFromSelection(selection);
      expect(sp.range.collapsed).toBe(true);
      expect(sp.range.start.n.typeNode).toBe(Node.TEXT_NODE);
      expect(sp.range.start.offset).toBe(2);
      expect(sp.range.start.n.parent.nodeName).toBe('h1');
    });
  });
  describe('Moving', () => {
    it('move right by text', () => {
      const sp = init('<section><h1>Header</h1><p>First paragraph</p></section>');
      const h1 = main.querySelector('h1');
      expect(window.getSelection().focusNode).toBe(h1.firstChild);
      expect(window.getSelection().focusOffset).toBe(0);
      for (let i = 0; i < 'Header'.length; ++i) {
        sp.moveNext();
        expect(window.getSelection().focusNode).toBe(h1.firstChild);
        expect(window.getSelection().focusOffset).toBe(i + 1);
      }
      const p = main.querySelector('p');
      for (let i = 0; i < 'First paragraph'.length; ++i) {
        sp.moveNext();
        expect(window.getSelection().focusNode).toBe(p.firstChild);
        expect(window.getSelection().focusOffset).toBe(i);
      }
      sp.moveNext();
      expect(window.getSelection().focusNode).toBe(p.firstChild);
      expect(window.getSelection().focusOffset).toBe('First paragraph'.length);
      sp.moveNext();
      expect(window.getSelection().focusNode).toBe(main.firstChild);
      expect(window.getSelection().focusOffset).toBe(2);
      sp.moveNext();
      expect(window.getSelection().focusNode).toBe(main);
      expect(window.getSelection().focusOffset).toBe(1);
      sp.moveNext();
      expect(window.getSelection().focusNode).toBe(main);
      expect(window.getSelection().focusOffset).toBe(1);
    });
    it('move left by text', () => {
      const sp = init('<section><h1>Header</h1><p>First paragraph</p></section>');
      const h1 = main.querySelector('h1');
      const p = main.querySelector('p');
      window.getSelection().collapse(main, 1);
      sp.initFromSelection(window.getSelection());
      for (let i = 'First paragraph'.length; i >= 0; i--) {
        sp.movePrev();
        expect(window.getSelection().focusNode).toBe(p.firstChild);
        expect(window.getSelection().focusOffset).toBe(i);
      }
      for (let i = 'Header'.length; i >= 0; i--) {
        sp.movePrev();
        expect(window.getSelection().focusNode).toBe(h1.firstChild);
        expect(window.getSelection().focusOffset).toBe(i);
      }
      sp.movePrev();
      expect(window.getSelection().focusNode).toBe(h1.firstChild);
      expect(window.getSelection().focusOffset).toBe(0);
    });
    it('move right by node', () => {
      const sp = init('<section><h1>Header</h1><p>First paragraph</p></section>');
      const section = main.firstChild;
      const h1 = main.querySelector('h1');
      const p = main.querySelector('p');
      expect(window.getSelection().focusNode).toBe(h1.firstChild);
      expect(window.getSelection().focusOffset).toBe(0);
      sp.moveNext(false);
      expect(window.getSelection().focusNode).toBe(section);
      expect(window.getSelection().focusOffset).toBe(1);
      sp.moveNext(false);
      expect(window.getSelection().focusNode).toBe(p.firstChild);
      expect(window.getSelection().focusOffset).toBe(0);
      sp.moveNext(false);
      expect(window.getSelection().focusNode).toBe(section);
      expect(window.getSelection().focusOffset).toBe(2);
      sp.moveNext(false);
      expect(window.getSelection().focusNode).toBe(main);
      expect(window.getSelection().focusOffset).toBe(1);
      sp.moveNext(false);
      expect(window.getSelection().focusNode).toBe(main);
      expect(window.getSelection().focusOffset).toBe(1);
    });
    it('move left by node', () => {
      const sp = init('<section><h1>Header</h1><p>First paragraph</p></section>');
      const section = main.firstChild;
      const h1 = main.querySelector('h1');
      const p = main.querySelector('p');
      window.getSelection().collapse(main, 1);
      sp.initFromSelection(window.getSelection());
      sp.movePrev(false); // ob prev the empty text nodes is skipped
      expect(window.getSelection().focusNode).toBe(p.firstChild);
      expect(window.getSelection().focusOffset).toBe(15);
      sp.movePrev(false);
      expect(window.getSelection().focusNode).toBe(section);
      expect(window.getSelection().focusOffset).toBe(1);
      sp.movePrev(false);
      expect(window.getSelection().focusNode).toBe(h1.firstChild);
      expect(window.getSelection().focusOffset).toBe(6);
      sp.movePrev(false);
      expect(window.getSelection().focusNode).toBe(section);
      expect(window.getSelection().focusOffset).toBe(0);
      sp.movePrev(false);
      expect(window.getSelection().focusNode).toBe(main);
      expect(window.getSelection().focusOffset).toBe(0);
    });
  });
  describe('Delete', () => {
    it('delete range', () => {
      const sp = init('<section><h1>Header</h1><p>First paragraph</p></section>');
      let p = main.querySelector('p');
      sp.initFromSelection(RangeBuilder.buildRange().start(p.firstChild, 1).end(p.firstChild, 14).selection);
      sp.delete();
      p = main.querySelector('p');
      expect(p.innerText).toBe('Fh');
      expect(sp.source).toBe('<section><h1>Header</h1><p>Fh</p></section>');
    });
    it('backspace range', () => {
      const sp = init('<section><h1>Header</h1><p>First paragraph</p></section>');
      let p = main.querySelector('p');
      sp.initFromSelection(RangeBuilder.buildRange().start(p.firstChild, 1).end(p.firstChild, 14).selection);
      sp.backspace();
      p = main.querySelector('p');
      expect(p.innerText).toBe('Fh');
      expect(sp.source).toBe('<section><h1>Header</h1><p>Fh</p></section>');
    });
    it('delete symbol', () => {
      const sp = init('<section><h1>Header</h1><p>First paragraph</p></section>');
      const h1 = main.querySelector('h1');
      sp.initFromSelection(RangeBuilder.buildRange().start(h1.firstChild, 0).end(h1.firstChild, 0).selection);
      let s = 'Header';
      while (s.length > 0) {
        sp.delete();
        s = s.substring(1);
        expect(h1.innerText).toBe(s);
      }
      sp.delete();
      const section = main.firstChild;
      const pN = main.querySelector('p');
      expect(section.firstChild).toBe(pN);
      expect(sp.source).toBe('<section><p>First paragraph</p></section>');
    });
    it('backspace symbol', () => {
      const sp = init('<section><h1>Header</h1><p>First paragraph</p></section>');
      const h1 = main.querySelector('h1');
      sp.initFromSelection(RangeBuilder.buildRange().start(h1.firstChild, 6).end(h1.firstChild, 6).selection);
      for (let i = 5; i >= 0; i--) {
        sp.backspace();
        expect(h1.innerText).toBe('Header'.substring(0, i));
      }
      expect(sp.source).toBe('<section><h1></h1><p>First paragraph</p></section>');
      sp.backspace(); // backspace does nothing
      let section = main.firstChild;
      const h = main.querySelector('h1');
      expect(section.firstChild).toBe(h);
      expect(sp.source).toBe('<section><h1></h1><p>First paragraph</p></section>');
      sp.delete();
      section = main.firstChild;
      const pN = main.querySelector('p');
      expect(section.firstChild).toBe(pN);
      expect(sp.source).toBe('<section><p>First paragraph</p></section>');
    });
  });
  describe('New Phrasing elements', () => {
    it('add phrasing element', () => {
      const sp = init('<section><h1>Header</h1><p id="1">First paragraph</p><p id="2">Second paragraph</p></section>');
      let p1 = document.getElementById('1');
      let p2 = document.getElementById('2');
      sp.initFromSelection(RangeBuilder.buildRange().start(p1.firstChild, 6).end(p2.firstChild, 6).selection);
      sp.wrapPhrasingFormat('b', {});
      expect(sp.source).toBe('<section><h1>Header</h1><p id="1">First <b>paragraph</b></p><p id="2"><b>Second</b> paragraph</p></section>');
      p1 = document.getElementById('1');
      p2 = document.getElementById('2');
      const b1 = p1.querySelector('b');
      const b2 = p2.querySelector('b');
      sp.initFromSelection(RangeBuilder.buildRange().start(b1.firstChild, 0).end(b2.firstChild, 6).selection);
      sp.unwrapPhrasingFormat('b', {});
      // TODO there is empty tag, and I don't know do I want to delete it
      expect(sp.source).toBe('<section><h1>Header</h1><p id="1">First <b></b>paragraph</p><p id="2">Second paragraph</p></section>');
    });
    it('add phrasing element 2', () => {
      const sp = init('<section><h1>Header</h1><p id="1">First paragraph</p><p id="2">Second paragraph</p></section>');
      let p1 = document.getElementById('1');
      let p2 = document.getElementById('2');
      sp.initFromSelection(RangeBuilder.buildRange().start(p1.firstChild, 6).end(p2.firstChild, 6).selection);
      sp.addElement('b', {});
      expect(sp.source).toBe('<section><h1>Header</h1><p id="1">First <b>paragraph</b></p><p id="2"><b>Second</b> paragraph</p></section>');
      p1 = document.getElementById('1');
      p2 = document.getElementById('2');
      const b1 = p1.querySelector('b');
      const b2 = p2.querySelector('b');
      sp.initFromSelection(RangeBuilder.buildRange().start(b1.firstChild, 0).end(b2.firstChild, 6).selection);
      sp.addElement('b', {});
      // TODO there is empty tag, and I don't know do I want to delete it
      expect(sp.source).toBe('<section><h1>Header</h1><p id="1">First <b></b>paragraph</p><p id="2">Second paragraph</p></section>');
    });
    it('clearFormat', () => {
      const sp = init('<section><h1><u><i>Header</i></u></h1><p id="1"><u><i><strong>First</strong> paragraph</i></u></p><p id="2"><code>Second</code> paragraph</p></section>');
      sp.selectAll();
      sp.clearFormat();
      expect(sp.source).toBe('<section><h1>Header</h1><p id="1">First paragraph</p><p id="2">Second paragraph</p></section>');
    });
  });
  describe('New Grouping elements', () => {
    it('shiftLeft from section', () => {
      const sp = init('<section><h2>Header</h2><p id="1"><u><i><strong>First</strong> paragraph</i></u></p><p id="2"><code>Second</code> paragraph</p></section>');
      const p1 = document.getElementById('1');
      sp.initFromSelection(RangeBuilder.buildRange().start(p1, 0).end(p1, 0).selection);
      sp.shiftLeft();
      expect(sp.source).toBe('<p>Header</p><p id="1"><u><i><strong>First</strong> paragraph</i></u></p><p id="2"><code>Second</code> paragraph</p>');
      sp.shiftLeft();
      expect(sp.source).toBe('<p>Header</p><p id="1"><u><i><strong>First</strong> paragraph</i></u></p><p id="2"><code>Second</code> paragraph</p>');
    });
    it('shiftLeft from list without parent list', () => {
      const sp = init('<section><h2>Header</h2><p id="1"><ul><li id="2">Row</li></ul></p></section>');
      sp.initFromSelection(RangeBuilder.buildRange().start(document.getElementById('2'), 0).end(document.getElementById('2'), 0).selection);
      sp.shiftLeft();
      expect(sp.source).toBe('<section><h2>Header</h2><p id="1"><ul><li id="2">Row</li></ul></p></section>');
    });
    it('shiftLeft from list with parent list', () => {
      const sp = init('<section><h2>Header</h2><p id="1"><ol><li><ul><li id="2">Row</li></ul></li></ol></p></section>');
      sp.initFromSelection(RangeBuilder.buildRange().start(document.getElementById('2'), 0).end(document.getElementById('2'), 0).selection);
      sp.shiftLeft();
      expect(sp.source).toBe('<section><h2>Header</h2><p id="1"><ol><li id="2">Row</li></ol></p></section>');
    });
    xit('shiftRight from section', () => {
      const sp = init('<section><h2>Header</h2><p id="1"><u><i><strong>First</strong> paragraph</i></u></p><p id="2"><code>Second</code> paragraph</p></section>');
      const p1 = document.getElementById('1');
      sp.initFromSelection(RangeBuilder.buildRange().start(p1, 0).end(p1, 0).selection);
      sp.shiftRight();
      expect(sp.source).toBe('<p>Header</p><p id="1"><u><i><strong>First</strong> paragraph</i></u></p><p id="2"><code>Second</code> paragraph</p>');
      sp.shiftLeft();
      expect(sp.source).toBe('<p>Header</p><p id="1"><u><i><strong>First</strong> paragraph</i></u></p><p id="2"><code>Second</code> paragraph</p>');
    });
    it('heading', () => {
      const sp = init('<p>Header</p><p id="1"><u><i><strong>First</strong> paragraph</i></u></p><p id="2"><code>Second</code> paragraph</p>');
      sp.initFromSelection(RangeBuilder.buildRange().start(main.firstChild.firstChild, 0).end(main.firstChild.firstChild, 0).selection);
      sp.addElement('h1', {});
      expect(sp.source).toBe('<h1>Header</h1><p id="1"><u><i><strong>First</strong> paragraph</i></u></p><p id="2"><code>Second</code> paragraph</p>');
    });
    it('section 1', () => {
      const sp = init('<p>Header</p><p id="1"><u><i><strong>First</strong> paragraph</i></u></p><p id="2"><code>Second</code> paragraph</p>');
      sp.initFromSelection(RangeBuilder.buildRange().start(main.firstChild.firstChild, 0).end(main.firstChild.firstChild, 0).selection);
      sp.addElement('section', {});
      expect(sp.source).toBe('<section>Header</section><p id="1"><u><i><strong>First</strong> paragraph</i></u></p><p id="2"><code>Second</code> paragraph</p>');
    });
    it('section 2', () => {
      const sp = init('<p>Header</p><p id="1"><u><i><strong>First</strong> paragraph</i></u></p><p id="2"><code>Second</code> paragraph</p>');
      sp.selectAll();
      sp.addElement('section', {});
      expect(sp.source).toBe('<section><p>Header</p><p id="1"><u><i><strong>First</strong> paragraph</i></u></p><p id="2"><code>Second</code> paragraph</p></section>');
    });
    it('section 3', () => {
      const sp = init('<p>Header</p><p id="1"><u><i><strong>First</strong> paragraph</i></u></p><p id="2"><code>Second</code> paragraph</p>');
      const p1 = document.getElementById('1');
      const p2 = document.getElementById('2');
      sp.initFromSelection(RangeBuilder.buildRange().start(p1, 0).end(p2, 1).selection);
      sp.addElement('section', {});
      expect(sp.source).toBe('<p>Header</p><section><p id="1"><u><i><strong>First</strong> paragraph</i></u></p></section><p id="2"><code>Second</code> paragraph</p>');
    });
  });
  describe('press Enter and input text', () => {
    it('br to text begin', () => {
      const sp = init('<section><h1>Header</h1><p id="1">First paragraph</p><p id="2">Second paragraph</p></section>');
      const p = document.getElementById('1');
      sp.initFromSelection(RangeBuilder.buildRange().start(p, 0).end(p, 0).selection);
      sp.br(false, false, false);
      sp.insString('a');
      expect(sp.source).toBe('<section><h1>Header</h1><p id="1"><br>aFirst paragraph</p><p id="2">Second paragraph</p></section>');
    });
    it('br in text begin', () => {
      const sp = init('<section><h1>Header</h1><p id="1">First paragraph</p><p id="2">Second paragraph</p></section>');
      const p = document.getElementById('1');
      sp.initFromSelection(RangeBuilder.buildRange().start(p.firstChild, 0).end(p.firstChild, 0).selection);
      sp.br(false, false, false);
      sp.insString('a');
      expect(sp.source).toBe('<section><h1>Header</h1><p id="1"><br>aFirst paragraph</p><p id="2">Second paragraph</p></section>');
    });
    it('br  in text', () => {
      const sp = init('<section><h1>Header</h1><p id="1">First paragraph</p><p id="2">Second paragraph</p></section>');
      const p = document.getElementById('1');
      sp.initFromSelection(RangeBuilder.buildRange().start(p.firstChild, 1).end(p.firstChild, 1).selection);
      sp.br(false, false, false);
      sp.insString('a');
      expect(sp.source).toBe('<section><h1>Header</h1><p id="1">F<br>airst paragraph</p><p id="2">Second paragraph</p></section>');
    });
    it('br to element', () => {
      const sp = init('<section><h1>Header</h1><p id="1">First paragraph</p><p id="2">Second paragraph</p></section>');
      sp.initFromSelection(RangeBuilder.buildRange().start(main.firstChild, 1).end(main.firstChild, 1).selection);
      sp.br(false, false, false);
      sp.insString('a');
      expect(sp.source).toBe('<section><h1>Header</h1><br><p id="1">aFirst paragraph</p><p id="2">Second paragraph</p></section>');
    });
    it('wbr in text begin', () => {
      const sp = init('<section><h1>Header</h1><p id="1">First paragraph</p><p id="2">Second paragraph</p></section>');
      const p = document.getElementById('1');
      sp.initFromSelection(RangeBuilder.buildRange().start(p.firstChild, 0).end(p.firstChild, 0).selection);
      sp.br(true, false, false);
      sp.insString('a');
      expect(sp.source).toBe('<section><h1>Header</h1><p id="1"><wbr>aFirst paragraph</p><p id="2">Second paragraph</p></section>');
    });
    it('wbr in text', () => {
      const sp = init('<section><h1>Header</h1><p id="1">First paragraph</p><p id="2">Second paragraph</p></section>');
      const p = document.getElementById('1');
      sp.initFromSelection(RangeBuilder.buildRange().start(p.firstChild, 1).end(p.firstChild, 1).selection);
      sp.br(true, false, false);
      sp.insString('a');
      expect(sp.source).toBe('<section><h1>Header</h1><p id="1">F<wbr>airst paragraph</p><p id="2">Second paragraph</p></section>');
    });
    it('wbr to element work as br', () => {
      const sp = init('<section><h1>Header</h1><p id="1">First paragraph</p><p id="2">Second paragraph</p></section>');
      sp.initFromSelection(RangeBuilder.buildRange().start(main.firstChild, 1).end(main.firstChild, 1).selection);
      sp.br(true, false, false);
      sp.insString('a');
      expect(sp.source).toBe('<section><h1>Header</h1><br><p id="1">aFirst paragraph</p><p id="2">Second paragraph</p></section>');
    });
    it('br as new paragraph (ctrlKey) in text begin', () => {
      const sp = init('<section><h1>Header</h1><p id="1">First paragraph</p><p id="2">Second paragraph</p></section>');
      const p = document.getElementById('1');
      sp.initFromSelection(RangeBuilder.buildRange().start(p.firstChild, 0).end(p.firstChild, 0).selection);
      sp.br(false, true, false);
      sp.insString('a');
      expect(sp.source).toBe('<section><h1>Header</h1><p id="1"></p><p>aFirst paragraph</p><p id="2">Second paragraph</p></section>');
    });
    it('br as new paragraph (ctrlKey) in text', () => {
      const sp = init('<section><h1>Header</h1><p id="1">First paragraph</p><p id="2">Second paragraph</p></section>');
      const p = document.getElementById('1');
      sp.initFromSelection(RangeBuilder.buildRange().start(p.firstChild, 1).end(p.firstChild, 1).selection);
      sp.br(false, true, false);
      sp.insString('a');
      expect(sp.source).toBe('<section><h1>Header</h1><p id="1">F</p><p>airst paragraph</p><p id="2">Second paragraph</p></section>');
    });
    it('br as new paragraph (ctrlKey) in element', () => {
      const sp = init('<section><h1>Header</h1><p id="1">First paragraph</p><p id="2">Second paragraph</p></section>');
      sp.initFromSelection(RangeBuilder.buildRange().start(main.firstChild, 1).end(main.firstChild, 1).selection);
      sp.br(false, true, false);
      sp.insString('a');
      expect(sp.source).toBe('<section><h1>Header</h1><p>a</p><p id="1">First paragraph</p><p id="2">Second paragraph</p></section>');
    });

    it('br as new section (ctrlKey) in text begin', () => {
      const sp = init('<section><h1>Header</h1><p id="1">First paragraph</p><p id="2">Second paragraph</p></section>');
      const p = document.getElementById('1');
      sp.initFromSelection(RangeBuilder.buildRange().start(p.firstChild, 0).end(p.firstChild, 0).selection);
      sp.br(false, false, true);
      sp.insString('a');
      expect(sp.source).toBe('<section><h1>Header</h1><p id="1"></p><section>aFirst paragraph</section><p id="2">Second paragraph</p></section>');
    });
    it('br as new section (ctrlKey) in text', () => {
      const sp = init('<section><h1>Header</h1><p id="1">First paragraph</p><p id="2">Second paragraph</p></section>');
      const p = document.getElementById('1');
      sp.initFromSelection(RangeBuilder.buildRange().start(p.firstChild, 1).end(p.firstChild, 1).selection);
      sp.br(false, false, true);
      sp.insString('a');
      expect(sp.source).toBe('<section><h1>Header</h1><p id="1">F</p><section>airst paragraph</section><p id="2">Second paragraph</p></section>');
    });
    it('br as new section (ctrlKey) in element', () => {
      const sp = init('<section><h1>Header</h1><p id="1">First paragraph</p><p id="2">Second paragraph</p></section>');
      sp.initFromSelection(RangeBuilder.buildRange().start(main.firstChild, 1).end(main.firstChild, 1).selection);
      sp.br(false, false, true);
      sp.insString('a');
      expect(sp.source).toBe('<section><h1>Header</h1><section>a</section><p id="1">First paragraph</p><p id="2">Second paragraph</p></section>');
    });

  });
});
