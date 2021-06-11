import { SimpleParser } from './html-validator';

// tslint:disable:max-line-length
const TEST_SOURCE = `
This text is without parent. I don't know if I allow this case.
<lib-link href="https://www.google.com" _design="1"><!-- comment -->This is simple link. I Do not know how it work</lib-link>
<lib-link href="https://www.google.com" _design="2"><span _design="3"><!-- comment -->This is another simple<!-- comment &dollar;&#36;\\0024U+0024 -->link &#36;&#x024;U+0024that can be edited by editor</span></lib-link>
<h1 _design="4">Hello <b _design="5">World</b>!!!</h1>
<br _design="6">
Input Titles:
<lib-input-title _design="7"></lib-input-title>
Other Titles:
<!-- comment
<br><p>this text in comment</p>
 -->
<lib-input-title _design="8" a1="a1" a2="a2" __ng-context__ a3="a3" a4="a4" a5="a5" a6="a6" a7="a7" a8="a8" a9="a9" b1="b1" b2="b2" b3="b3" b4="b4" b5="b5"></lib-input-title>
<p _design="9">This is the <i _design="10">first</i> paragraph</p>
<p _design="11">This is the <i _design="12">second</i> paragraph</p>
<p _design="13">This is the <i _design="14">third</i> paragraph</p>
<p _design="15">This is the <i _design="16">forth</i> paragraph.<br _design="17">And here is next line<br _design="18"></p>
<!-- comment --><b _design="19"><!-- comment--><i _design="20"><!-- comment --></i><!-- comment --></b><b _design="21"><i _design="22"></i></b>`;

describe('html-validator', () => {
  describe('HtmlValidator', () => {
    it('should create an instance', () => {
      expect('new HtmlValidator()').toBeTruthy();
    });
  });
  describe('SimpleParser', () => {
    it('should create an instance', () => {
      const sp = new SimpleParser(TEST_SOURCE, '_design');
      expect(sp).toBeTruthy();
      expect(sp.errors.length).toBe(0);
      expect(sp.root.children.length).toBe(16);
    });
  });
});
