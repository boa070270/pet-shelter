import {LibNode, LibPosition} from '../shared';

export class HtmlValidator {
  constructor(private source: string, private mark: string, private baseMark = '0') {}
  static rgStartTag(t: string): RegExp {
    return new RegExp(`<${t}[^>]*>`, 'gi');
  }
  static rgEndTag(t: string): RegExp {
    return new RegExp(`</${t}[^>]*>`, 'gi');
  }
  findMark(a: string): RegExpExecArray {
    const regexp = new RegExp(`<([a-zA-Z][^<>]*\\s${this.mark}="${a}"[^<>]*)>`, 'gs');
    return regexp.exec(this.source);
  }
  mapNode(n: HTMLElement): {m1: RegExpExecArray, m2: RegExpExecArray} {
    const a = n.getAttribute(this.mark);
    const v = new HtmlValidator(this.source, this.mark);
    const m1 = v.findMark(a);
    const chk = HtmlValidator.rgEndTag(n.nodeName);
    chk.lastIndex = v.syncPosition(n, n.childNodes.length);
    const m2 = chk.exec(this.source);
    if (m2 === null) {
      console.error('Unclosed tag???'); // TODO it's impossible
    }
    return {m1, m2};
  }
  syncPosition(n: Node, offset: number): number {
    const e = LibPosition.elementOfPosition({n, offset});
    const a = e.getAttribute(this.mark);
    if (!a) { // only on development time. Throw out after
      throw new Error(`Invalid position n: ${n}, p: ${offset}`);
    } else if (a === this.baseMark) {
      if (offset === 0) {
        return 0;
      }
      if (offset === e.childNodes.length) {
        return this.source.length;
      }
    }
    if (n.nodeType === Node.ELEMENT_NODE) {
      if (n.childNodes[offset] === e) {
        return this.findMark(a).index;
      }
      let start = 0; let pre = 0;
      if (a !== this.baseMark) {
        const r = this.findMark(a);
        pre = r.index + r[0].length;
      }
      for (let i = 0; i <= offset; ++i) {
        start = pre;
        const ch = n.childNodes[i];
        if (!ch) {
        } else if (ch.nodeType === Node.TEXT_NODE) {
          pre = start + ch.nodeValue.length + this.unicodes(start, start + ch.nodeValue.length);
        } else if (ch.nodeType === Node.ELEMENT_NODE) {
          const attr = (ch as HTMLElement).getAttribute(this.mark);
          if (attr === null) {
            continue;
          }
          let r = this.findMark(attr); if (start !== r.index) { console.log(`Invalid format, pos[${start}]: ${this.source}`); }
          start = r.index;
          const tag = r[1].substring(0, r[1].indexOf(' ')).toLowerCase();
          if (LibNode.isEmptyTag(tag)) {
            pre = r.index + r[0].length;
          } else {
            const range = document.createRange();
            range.selectNodeContents(ch);
            pre = this.syncPosition(range.endContainer, range.endOffset);
            const reg = HtmlValidator.rgEndTag(tag);
            reg.lastIndex = pre;
            r = reg.exec(this.source);
            if (!r) { console.log(`Invalid format, unclose tag <${tag}>, pos[${start}]: ${this.source}`); }
            else {
              if (pre !== r.index) { console.log(`Invalid format, pos[${pre}]: ${this.source}`); }
              pre = r.index + r[0].length;
            }
          }
        } else if (ch.nodeType === Node.COMMENT_NODE) {
          const o = start;
          start = this.source.indexOf('<!--', start); if (start !== o) { console.log(`Invalid format, pos[${start}]: ${this.source}`); }
          pre = this.source.indexOf('-->', start) + 3;
        } else if (ch.nodeType === Node.CDATA_SECTION_NODE) {
          const o = start;
          // tslint:disable-next-line:max-line-length
          start = this.source.indexOf('<!CDATA[[', start); if (start !== o) { console.log(`Invalid format, pos[${start}]: ${this.source}`); }
          pre = this.source.indexOf(']]>', start) + 3;
        }
      }
      return start;
    } else {
      let start = LibNode.orderOfChild(n.parentNode, n);
      start = this.syncPosition(n.parentNode, start);
      return start + offset + this.unicodes(start, start + offset);
    }
  }
  private unicodes(start: number, end: number): number {
    const regexp = /&#(\d{2,4}|x[0-9a-zA-Z]{2,4});/g;
    regexp.lastIndex = start;
    let count = 0;
    do {
      const res = regexp.exec(this.source);
      if (res === null || res.index >= end) {
        break;
      }
      count += (res[1].length + 2);
      end -= (res.index + 1);
    } while (true);
    return count;
  }
}
