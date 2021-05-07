import {LibNode, LibNodeIterator, LibPosition} from '../shared';
import {HtmlValidator} from './html-validator';

const IS_BLOCK = {includes: (t) => LibNode.isBlockTag(t)};
interface Modify {parent: HTMLElement; txt: string; start: number; end: number; }
export class AddModification {
  readonly start: number;
  readonly end: number;
  private readonly extRange: Range;
  private readonly startPos: LibPosition;
  private readonly endPos: LibPosition;
  private readonly root: Node;
  private readonly validator: HtmlValidator;
  private sortOut: { matchTag: HTMLElement[]; affectBoth: HTMLElement[]; affectStart: HTMLElement[]; affectEnd: HTMLElement[] };
  constructor(private editor: HTMLElement, private source: string, private range: Range, private mark: string,
              private nextId: () => number,
              private update: (range: Range, start: number, end: number, str: string) => void) {
    this.validator = new HtmlValidator(this.source, this.mark);
    this.start = this.syncPosition(range.startContainer, range.startOffset);
    this.end = this.syncPosition(range.endContainer, range.endOffset);
    this.startPos = new LibPosition(this.range.startContainer, this.range.startOffset);
    this.endPos = new LibPosition(this.range.endContainer, this.range.endOffset);
    this.root = this.range.commonAncestorContainer;
    this.extRange = range.cloneRange();
    let n = range.commonAncestorContainer;
    if (n.nodeType === Node.TEXT_NODE) {
      n = n.parentElement;
      for (; n !== this.editor && LibNode.getAttribute(n, this.mark) === null; n = n.parentElement){}
    }
    this.extRange.selectNodeContents(n);
    this.sortOut = this.dependOnRange(IS_BLOCK);
  }
  private static cleanTags(sb: string, tags: readonly string[]): string {
    for (const t of tags) {
      const stag = HtmlValidator.rgStartTag(t);
      const etag = HtmlValidator.rgEndTag(t);
      sb = sb.replace(stag, () => {
        return '';
      });
      sb = sb.replace(etag, () => {
        return '';
      });
    }
    return sb;
  }
  private static closeNodes(nodes: HTMLElement[], skip: (tag: string) => boolean = () => false): string {
    let before = '';
    for (const n of nodes) {
      if (!skip(n.tagName.toLowerCase())) {
        before = before + '</' + n.nodeName + '>';
      }
    }
    return before;
  }
  private openNodes(nodes: HTMLElement[], keepId: boolean): string {
    let after = '';
    for (const n of nodes) { // 3.2
      after = this.copyTag(n, keepId) + after;
    }
    return after;
  }
  private syncPosition(n: Node, offset: number): number {
    return this.validator.syncPosition(n, offset);
  }
  private renderAttr(attr: {[key: string]: string} = {}, keepId = true, id?: string): string {
    let s = '';
    if (!attr[this.mark] || !keepId) {
      attr[this.mark] = id || '' + this.nextId();
    }
    for (const [key, value] of Object.entries<string>(attr)) {
      if (value !== undefined) {
        s += ` ${key}="${value}"`;
      } else {
        s += ' ' + key;
      }
    }
    return s;
  }
  private startTag(tag: string, attr?: {[key: string]: string}, keepId = true, id?: string): string {
    return `<${tag} ${this.renderAttr(attr, keepId, id)}>`;
  }
  private copyTag(n: HTMLElement, keepId = true): string {
    let str = '<' + n.tagName.toLowerCase();
    n.getAttributeNames().forEach(a => {
      str = str + ' ' + a;
      if (!keepId && a === this.mark) {
        str =  str + '="' + this.nextId() + '"';
      } else {
        if (n.getAttribute(a)) {
          str = str + '="' + n.getAttribute(a) + '"';
        }
      }
    });
    return str + '>';
  }
  /**
   * find all elements that contain this range
   * @param tags - array of tags lowerCase
   * @private
   */
  private dependOnRange(tags?: {includes: (s) => boolean}):
    {matchTag: HTMLElement[], affectBoth: HTMLElement[], affectStart: HTMLElement[], affectEnd: HTMLElement[]} {
    const res = {matchTag: [], affectBoth: [], affectStart: [], affectEnd: []};
    if (!this.range.collapsed && this.range.commonAncestorContainer.nodeType !== Node.TEXT_NODE) {
      const iter = new LibNodeIterator(this.root, this.endPos, true);
      const sn = LibPosition.nodeOfPosition(this.startPos);
      const en = LibPosition.nodeOfPosition(this.endPos);
      let out = false;
      for (const p of iter) {
        const n = LibPosition.nodeOfPosition(p);
        if (LibPosition.equal(this.startPos, p)) {
          out = true;
          if (tags.includes(p.tagName()) && !res.matchTag.includes(n)) {
            res.matchTag.push(n);
          }
        }
        if (n.nodeType === Node.ELEMENT_NODE) {
          if (!out && tags.includes(p.tagName()) && !res.matchTag.includes(n)) {
            res.matchTag.push(n);
          }
          // tslint:disable:no-bitwise
          if (!out && (en.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_CONTAINS) !== 0 && !res.affectEnd.includes(n)) {
            res.affectEnd.push(n);
          }
          if (out && (sn.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_CONTAINS) !== 0 && !res.affectStart.includes(n)) {
            res.affectStart.push(n);
          }
        }
      }
    }
    return res;
  }
  // tslint:disable:max-line-length
  private replaceNode(n: HTMLElement, tag: string, attr?: {[key: string]: string}, clean: (s: string) => string = (s) => s): Modify {
    const {m1, m2} = this.validator.mapNode(n);
    const start = m1.index;
    const end = m2.index + m2[0].length;
    return {parent: n.parentElement, start, end, txt: this.startTag(tag, attr) + clean(this.source.substring(m1.index + m1[0].length, m2.index)) + '</' + tag + '>'};
  }
  private wrap(parent: HTMLElement, start: number, end: number, tag: string, attr?: {[key: string]: string}, clean: (s: string) => string = (s) => s): Modify {
    return {parent, start, end, txt: this.startTag(tag, attr) + clean(this.source.substring(start, end)) + '</' + tag + '>'};
  }
  private wrapNode(n: HTMLElement, tag: string, attr?: {[key: string]: string}, clean: (s: string) => string = (s) => s): Modify {
    const {m1, m2} = this.validator.mapNode(n);
    const start = m1.index;
    const end = m2.index + m2[0].length;
    return this.wrap(n.parentElement, start, end, tag, attr, clean);
  }
  private wrapContentNode(n: HTMLElement, tag: string, attr?: {[key: string]: string}, clean: (s: string) => string = (s) => s): Modify {
    const {m1, m2} = this.validator.mapNode(n);
    const start = m1.index + m1[0].length;
    const end = m2.index;
    return this.wrap(n, start, end, tag, attr, clean);
  }
  private unwrapNode(n: HTMLElement): Modify {
    const {m1, m2} = this.validator.mapNode(n);
    const start = m1.index;
    const end = m2.index + m2[0].length;
    return {parent: n.parentElement, start, end, txt: this.source.substring(m1.index + m1[0].length, m2.index)};
  }
  private collectAncestor(p: HTMLElement, c: {includes: (a) => boolean}): void {
    while (p !== this.editor) {
      if (LibNode.getAttribute(p, this.mark) !== null && c.includes(p.nodeName.toLowerCase()) && !this.sortOut.affectBoth.includes(p)) {
        this.sortOut.affectBoth.push(p);
      }
      p = p.parentElement;
    }
  }
  private wrapStr(str: string, tag?: string, attr?: {[key: string]: string}, invert?: boolean): string {
    if (invert) {
      return '</' + tag + '>' + str + this.startTag(tag, attr);
    }
    return this.startTag(tag, attr) + str + '</' + tag + '>';
  }
  private txtSortOut(str: string, tag?: string, attr?: {[key: string]: string}, invert?: boolean, isPhrasing?: boolean): Modify {
    if (tag) {
      tag = tag.toLowerCase();
    }
    let parent = this.range.commonAncestorContainer as HTMLElement;
    if (parent.nodeType !== Node.ELEMENT_NODE) {
      parent = parent.parentElement;
    }
    // case when are selected all node's content (all siblings)
    if (tag && !LibNode.isEmptyTag(tag) && this.startPos.n === this.endPos.n && this.endPos.n.nodeType === Node.ELEMENT_NODE
      && (this.endPos.n.childNodes.length <= 1 || (LibPosition.isFirst(this.startPos) && LibPosition.isLast(this.endPos)))) {
      if (this.endPos.n === this.editor) { // are selected top level
        if (this.sortOut.matchTag.length === 0) { // there is no any block tags
          return this.wrap(this.editor, 0, this.source.length, tag, attr, (s) => AddModification.cleanTags(s, [tag]));
        }
        if (this.editor.childNodes.length === 0) {
          return {parent: this.editor, start: 0, end: 0, txt: this.startTag(tag, attr) + '</' + tag + '>'};
        }
        if (this.editor.childNodes.length === 1) { // there is one block node
          if (isPhrasing) {
            return this.wrapContentNode(this.editor.childNodes[0] as HTMLElement, tag, attr, (s) => AddModification.cleanTags(s, [tag]));
          }
          return this.replaceNode(this.editor.childNodes[0] as HTMLElement, tag, attr, (s) => AddModification.cleanTags(s, LibNode.BLOCK_ELEMENTS));
        }
        // more than one child node
        if (isPhrasing) {
          let txt = '';
          let r;
          let process = -1;
          for (let i = 0; i < this.editor.childNodes.length; ++i) {
            if (!LibNode.isBlockTag(this.editor.childNodes[i].nodeName)){
              continue;
            }
            // wrap from process until i - 1
            if (process + 1 < i) {
              const start = this.syncPosition(this.editor, process + 1);
              const end = this.syncPosition(this.editor, i);
              r = this.wrap(this.editor, start, end, tag, attr, (s) => AddModification.cleanTags(s, [tag]));
              txt += r.txt;
            }
            // wrap content
            r = this.wrapContentNode(this.editor.childNodes[i] as HTMLElement, tag, attr, (s) => AddModification.cleanTags(s, [tag]));
            txt += r.txt;
            process = i;
          }
          if (process < this.editor.childNodes.length) {
            const start = this.syncPosition(this.editor, process + 1);
            const end = this.syncPosition(this.editor, this.editor.childNodes.length);
            r = this.wrap(this.editor, start, end, tag, attr, (s) => AddModification.cleanTags(s, [tag]));
            txt += r.txt;
          }
          return {parent: this.editor, start: 0, end: this.source.length, txt};
        }
        return this.wrap(this.editor, 0, this.source.length, tag, attr, (s) => AddModification.cleanTags(s, LibNode.BLOCK_ELEMENTS));
      }
      if (tag === this.endPos.n.nodeName.toLowerCase()) { // 1.
        return this.unwrapNode(this.endPos.n as HTMLElement);
      }
      if (invert) { // lets check if there is parent that also has only one children
        let e = this.endPos.n as HTMLElement;
        while (e.nodeName.toLowerCase() !== tag && e !== this.editor && e.childNodes.length <= 1) {
          e = e.parentElement;
        }
        if (e.nodeName.toLowerCase() === tag && e !== this.editor && e.childNodes.length <= 1) {
          return this.unwrapNode(e);
        }
      }
      if (LibNode.isBlockTag(tag) && LibNode.isBlockTag(this.endPos.n.nodeName.toLowerCase())) { // 2.
        return this.replaceNode(this.endPos.n as HTMLElement, tag, attr, (s) => AddModification.cleanTags(s, LibNode.BLOCK_ELEMENTS));
      }
      if (LibNode.isBlockTag(tag) && !LibNode.isBlockTag(this.endPos.n.nodeName.toLowerCase())) { // 3.
        this.collectAncestor(this.endPos.n as HTMLElement, {includes: () => true}); // 3.1
        let before = '';
        for (const n of this.sortOut.affectBoth) { // 3.2
          before = before + '</' + n.nodeName + '>';
        }
        const res = this.replaceNode(this.endPos.n as HTMLElement, tag, attr, (s) => AddModification.cleanTags(s, LibNode.BLOCK_ELEMENTS)); // 3.3
        parent = res.parent;
        before += res.txt;
        let after = '';
        for (const n of this.sortOut.affectBoth) { // 3.2
          after = this.copyTag(n, false) + after;
        }
        if (this.sortOut.affectBoth.length !== 0) {
          parent = this.sortOut.affectBoth[this.sortOut.affectBoth.length - 1].parentElement;
        }
        return {parent, start: res.start, end: res.end, txt: before + after};
      }
      if (!LibNode.isBlockTag(tag)) { // 4. 5.
        return this.wrapContentNode(this.endPos.n as HTMLElement, tag, attr, (s) => AddModification.cleanTags(s, [tag]));
      }

    }
    if (this.range.collapsed) {
      if (!tag) {
        return {parent, start: this.start, end: this.end, txt: str};
      }
      if (LibNode.isEmptyTag(tag)) {
        return {parent, start: this.start, end: this.end, txt: this.startTag(tag, attr) + str};
      }
      if (isPhrasing) {
        str = this.wrapStr(str, tag, attr, invert);
        return {parent, start: this.start, end: this.end, txt: this.startTag(tag, attr) + str};
      } else {
        let before = '';
        this.collectAncestor(this.endPos.n as HTMLElement, {includes: () => true});
        for (const n of this.sortOut.affectBoth) {
          before = before + '</' + n.nodeName + '>';
        }
        before = before + this.wrapStr(str, tag, attr, invert);
        let after = '';
        for (const n of this.sortOut.affectBoth) {
          after = this.copyTag(n, false) + after;
        }
        if (this.sortOut.affectBoth.length !== 0) {
          parent = this.sortOut.affectBoth[this.sortOut.affectBoth.length - 1].parentElement;
        }
        return {parent, start: this.start, end: this.end, txt: before + after};
      }
    } else {
      let before = '';
      if (!tag) { // case when range isn't collapsed and we replace part of text with str
        for (const n of this.sortOut.affectStart) {
          before += '</' + n.tagName.toLowerCase() + '>';
        }
        before += str;
        let after = '';
        for (const n of this.sortOut.affectEnd) {
          after = this.copyTag(n) + after;
        }
        return {parent, start: this.start, end: this.end, txt: before + after};
      }
      if (LibNode.isEmptyTag(tag)) { // case when range isn't collapsed and we insert an empty tag
        for (const n of this.sortOut.affectStart) {
          before = '</' + n.tagName.toLowerCase() + '>';
        }
        before = before + this.startTag(tag, attr) + str;
        let after = '';
        for (const n of this.sortOut.affectEnd) {
          after = this.copyTag(n) + after;
        }
        return {parent, start: this.start, end: this.end, txt: before + after};
      }
      if (this.startPos.n === this.endPos.n && !LibPosition.equal(this.startPos, this.endPos)
        && this.endPos.n.nodeType === Node.ELEMENT_NODE && LibPosition.isFirst(this.startPos) && LibPosition.isLast(this.endPos)) {
        // /* this is a particular case
        // 1. if the tag and the n have the same tag name - remove n
        // 2. if the tag is a block element and the n is block element - replace n with new tag name
        // 3. if the tag is a block element and n isn't block element:
        // 3.1. define all element that affect the n
        // 3.2. close all the elements
        // 3.3. replace the n to the tag
        // 3.4. open all the block elements
        // 4. if the tag isn't a block element and the n is a block element - wrap in a tag the n content
        // 5. if tag tag isn't a block element and the n isn't block element - wrap in a tag the n content?
        // */
        // if (tag === this.endPos.n.nodeName.toLowerCase()) { // 1.
        //   return this.unwrapNode(this.endPos.n as HTMLElement);
        // }
        // if (BLOCK_ELEMENTS.includes(tag) && BLOCK_ELEMENTS.includes(this.endPos.n.nodeName.toLowerCase())) { // 2.
        //   return this.replaceNode(this.endPos.n as HTMLElement, tag, attr, (s) => this.cleanTags(s, BLOCK_ELEMENTS));
        // }
        // if (BLOCK_ELEMENTS.includes(tag) && !BLOCK_ELEMENTS.includes(this.endPos.n.nodeName.toLowerCase())) { // 3.
        //   this.collectAncestor(this.endPos.n as HTMLElement, {includes: () => true}); // 3.1
        //   for (const n of this.sortOut.affectBoth) { // 3.2
        //     before = before + '</' + n.nodeName + '>';
        //   }
        //   const res = this.replaceNode(this.endPos.n as HTMLElement, tag, attr, (s) => this.cleanTags(s, BLOCK_ELEMENTS)); // 3.3
        //   parent = res.parent;
        //   before += res.txt;
        //   let after = '';
        //   for (const n of this.sortOut.affectBoth) { // 3.2
        //     after = this.copyTag(n, false) + after;
        //   }
        //   if (this.sortOut.affectBoth.length !== 0) {
        //     parent = this.sortOut.affectBoth[this.sortOut.affectBoth.length - 1].parentElement;
        //   }
        //   return {parent, start: res.start, end: res.end, txt: before + after};
        // }
        // if (!BLOCK_ELEMENTS.includes(tag)) { // 4. 5.
        //   return this.wrapContentNode(this.endPos.n as HTMLElement, tag, attr, (s) => this.cleanTags(s, [tag]));
        // }
      }
      if (isPhrasing) {
        /*
         steps for phrasing tag:
         1. define all text node in range, for every node:
         1.1. if this node is wrapped in this phrasing tag, skip it (if invert - delete)
         1.2. all blocks nodes leave on its place (we work only with text nodes)
         this solution has one big cons: there can be cas when user shift position between tag and new symbol would be
         out tag.
         So there is only one properly solution, I need to wrap all range in a tag.
         ----- Start from here
         Limits:
           - if there is blocking elements in the range, I need to close the tag element before block,
            than open the tag element in this bloke and close it at the and of this block.
            I need open element after this block...
         1. define all element that wrap start position.
          If there is the same tag - (I can close it as all other. If I leave it open I was need to leave open all other
          elements that wrap this tag element.) Decision - close all element that wrap start position!
          BUT! I cannot close the blocking elements! So if I found that the start position is wrapped by block element, I gone to the point 4.
         2. Open tag element.
         3. Define all tag elements that is in the range - delete them
         4. Define all block element that is in the range (them can out paren-children path)
           4.1. close the tag element before block
           4.2. define range for a block with start - start of content, end - end of block or end of main range (in last case
           mark that end is processed)
           4.3. apply this algorithm to this range.
           4.4. if end isn't processed open the tag element
         5. If end is not processed
          5.1. close all elements that affect the end position
          5.2. close tag element
          5.3. open all elements that affect the end position
          */
        if (this.sortOut.matchTag.length === 0) {
          for (const n of this.sortOut.affectStart) {
            before += '</' + n.tagName.toLowerCase() + '>';
          }
          let sb = this.source.substring(this.start, this.end);
          sb = AddModification.cleanTags(sb, [tag]);
          for (const n of this.sortOut.affectEnd) {
            sb = sb + '</' + n.tagName.toLowerCase() + '>';
          }
          before += this.wrapStr(sb, tag, attr, invert);
          let after = '';
          for (const n of this.sortOut.affectEnd) {
            after = this.copyTag(n) + after;
          }
          return {parent, start: this.start, end: this.end, txt: before + after};
        } else {
          const match0 = this.sortOut.matchTag.shift();
          const matchN = this.sortOut.matchTag.pop();
          let p = LibPosition.fromNode(match0);
          let i = this.syncPosition(p.n, p.offset);
          for (const n of this.sortOut.affectStart) {
            before = '</' + n.tagName.toLowerCase() + '>';
          }
          let sb = this.source.substring(this.start, i);
          sb = AddModification.cleanTags(sb, [tag]);
          before += this.wrapStr(sb, tag, attr, invert);
          let after = '';
          if (matchN) {
            p = LibPosition.fromNode(match0);
            i = this.syncPosition(p.n, p.offset);
            sb = this.source.substring(i, this.end);
            AddModification.cleanTags(sb, [tag]);
            after += this.wrapStr(sb, tag, attr, invert);
            let s = '';
            for (const n of this.sortOut.affectEnd) {
              s += this.copyTag(n);
            }
            after += s;
          }
          for (const n of this.sortOut.matchTag) {
            before = this.wrapContentNode(n, tag, attr, (s) => AddModification.cleanTags(s, [tag])) + before;
          }
          before = after + before;
          if (matchN) {
            parent = matchN.parentElement;
          } else {
            parent = match0.parentElement;
          }
          return {parent, start: this.start, end: this.end, txt: before};
        }
      } else {
        // check block nodes
        this.collectAncestor(this.range.commonAncestorContainer as HTMLElement, {includes: () => true});
        /* steps for block tag:
        1. define all elements that wrap start position
          close these elements (we do not open them)
        2. define all blocks nodes that wrap this range (these blocks wrap commonAncestorContainer)
          close all this blocks and after open them
        3.0. start or close the tag
        3.1. define all block element that is in the range (them can out paren-children path)
          delete them (with regexp from src)
        4. define all elements that is not block and affect the end position
          close them
        5. close the tag
        6. open all elements that is not block and affect the end position
       */
        // 1.
        for (const n of this.sortOut.affectStart) {
          before = before + '</' + n.tagName.toLowerCase() + '>';
        }
        // 2.
        for (const n of this.sortOut.affectBoth) {
          before = before + '</' + n.tagName.toLowerCase() + '>';
        }
        // 3.0
        before += this.startTag(tag, attr);
        // 3.1.
        before += AddModification.cleanTags(this.source.substring(this.start, this.end), LibNode.BLOCK_ELEMENTS);
        // 4.
        let after = '';
        for (const n of this.sortOut.affectEnd) {
          if (!LibNode.isBlockTag(n.tagName.toLowerCase())) {
            after += '</' + n.tagName.toLowerCase() + '>';
          }
        }
        // 5.
        before += '</' + tag + '>';
        // 6.
        after = '';
        for (const n of this.sortOut.affectEnd) {
          if (!LibNode.isBlockTag(n.tagName.toLowerCase())) {
            after = this.copyTag(n, false) + after;
          }
        }
        before += after;
        // 1.
        after = '';
        for (const n of this.sortOut.affectBoth) {
          after = this.copyTag(n, false) + after;
        }
        before += after;
        return {parent, start: this.start, end: this.end, txt: before};
      }
    }
  }
  upd(str: Modify): void {
    while (str.parent !== this.editor && str.parent.getAttribute(this.mark) === null) {
      str.parent = str.parent.parentElement;
    }
    this.extRange.selectNodeContents(str.parent);
    this.update(this.extRange, str.start, str.end, str.txt);
  }
  insert(ch: string): void {
    this.upd(this.txtSortOut(ch));
  }
  insertTag(tag: string, attr?: {[key: string]: string}, invert?: boolean, isPhrasing?: boolean): void {
    if (!isPhrasing) {
      isPhrasing = LibNode.isPhrasingTag(tag);
    }
    this.upd(this.txtSortOut('', tag, attr, invert, isPhrasing));
  }
  public delete(): void {
    if (!this.range.collapsed) {
      this.upd(this.txtSortOut(''));
    }
  }
}
