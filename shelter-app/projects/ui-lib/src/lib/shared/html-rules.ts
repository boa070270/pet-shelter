/**
 * This type is used as array of 2 items, where first item describe the Parent category,
 * second describe which element can be children
 * Categories in the "Parents" column refer to parents that list the given categories in their content model,
 * not to elements that themselves are in those categories. For example, the 'a' element's "Parents" column says "phrasing",
 * so any element whose content model contains the "phrasing" category could be a parent of an 'a' element.
 * Since the "Flow" category includes all the "Phrasing" elements, that means the 'th' element could be 'a' parent to an a element.
 */
import {NodeWrapper, treeWalker} from './html-helper';

// tslint:disable:max-line-length
export type HtmlElementContent = {cnt?: ContentType[], elem?: string[]};
export type ContentType = 'Metadata' | 'Flow' | 'Sectioning' | 'Heading' | 'Phrasing' | 'Embedded' | 'Interactive' | 'SectioningRoot'
  | 'Palpable' | 'Script' | 'None' | 'Transparent' | 'Grouping' | 'FormElements' | 'ListedElements' | 'SubmittableElements' | 'ResettableElements'
  | 'AutocapitalizeInheritingElements' | 'LabelableElements' | 'Foreign' | 'EscapableRawTexElements' | 'VoidElements' | 'PhrasingFormat'
  | 'PhrasingWithAttribute';
/**
 * If this child can be added
 * p: parent element
 * e: child tag name
 * attr: child attributes
 */
export type ChildRestriction = (e: NodeWrapper) => boolean;
export interface HtmlContent {
  type: ContentType;
  restriction?: ChildRestriction;
}
export interface Tag {
  name: string;
  childRestriction?: ChildRestriction;
  contentRestriction?: (e: NodeWrapper) => boolean;
}
/**
 * childRestriction doesn't allow any children
 */
const NO_CHILDREN: ChildRestriction = () => false;

function findInArray(e: NodeWrapper, where: Array<string | Tag>): string | Tag {
  const tag = e.nodeName;
  return where.find( v => {
    if (typeof v === 'object') {
      return v.name === tag && (v.contentRestriction ? v.contentRestriction(e) : true);
    }
    return v === tag;
  });
}
const AMBIGUOUS_AMPERSAND = '&\w*;'; // TODO: it is not accurate
const DEF_CUSTOM_CONTENTS: HtmlElementContent[] = [{cnt: ['Flow']}, {cnt: ['Flow']}];

const ELEMENTS: {[key: string]: Array<HtmlElementContent>} = {
  a:	[{cnt: ['Phrasing']}, {cnt: ['Transparent']}],
  abbr:	[{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  address: [{cnt: ['Flow']}, {cnt: ['Flow']}],
  area:	[{cnt: ['Phrasing']}],
  article:	[{cnt: ['Flow']}, {cnt:	['Flow']}],
  aside:	[{cnt: ['Flow']}, {cnt:	['Flow']}],
  audio:	[{cnt: ['Phrasing']}, {elem: ['source', 'track'], cnt: ['Transparent']}],
  b: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  base:	[{elem: ['head']}],
  bdi: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  bdo: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  blockquote: [{cnt: ['Flow']}, {cnt: ['Flow']}],
  body: [{elem: ['html']}, {cnt: ['Flow']}],
  br: [{cnt: ['Phrasing']}],
  button: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  canvas: [{cnt: ['Phrasing']}, {cnt: ['Transparent']}],
  caption: [{elem: ['table']}, {cnt: ['Flow']}],
  cite: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  code: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  col: [{elem: ['colgroup']}],
  colgroup: [{elem: ['table']}, {elem: ['col', 'template']}],
  data: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  datalist: [{cnt: ['Phrasing']}, {cnt: ['Phrasing'], elem: ['option']}],
  dd: [{elem: ['dl', 'div']}, {cnt: ['Flow']}],
  del: [{cnt: ['Phrasing']}, {cnt: ['Transparent']}],
  details: [{cnt: ['Flow']}, {cnt: ['Flow'], elem: ['summary']}],
  dfn: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  dialog: [{cnt: ['Flow']}, {cnt: ['Flow']}],
  div: [{cnt: ['Flow'], elem: ['dl']}, {cnt: ['Flow']}],
  dl:  [{cnt: ['Flow']}, {elem: ['dt', 'dd', 'div']}],
  dt: [{elem: ['dl', 'div']}, {cnt: ['Flow']}],
  em: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  embed: [{cnt: ['Phrasing']}],
  fieldset: [{cnt: ['Flow']}, {elem: ['legend'], cnt: ['Flow']}],
  figcaption: [{elem: ['figure']}, {cnt: ['Flow']}],
  figure: [{cnt: ['Flow'], elem: ['figcaption']}, {cnt: ['Flow']}],
  footer: [{cnt: ['Flow']}, {cnt: ['Flow']}],
  form: [{cnt: ['Flow']}, {cnt: ['Flow']}],
  h1: [{elem: ['legend', 'summary'], cnt: ['Flow']}, {cnt: ['Phrasing']}],
  h2: [{elem: ['legend', 'summary'], cnt: ['Flow']}, {cnt: ['Phrasing']}],
  h3: [{elem: ['legend', 'summary'], cnt: ['Flow']}, {cnt: ['Phrasing']}],
  h4: [{elem: ['legend', 'summary'], cnt: ['Flow']}, {cnt: ['Phrasing']}],
  h5: [{elem: ['legend', 'summary'], cnt: ['Flow']}, {cnt: ['Phrasing']}],
  h6: [{elem: ['legend', 'summary'], cnt: ['Flow']}, {cnt: ['Phrasing']}],
  head: [{elem: ['html']}, {cnt: ['Metadata']}],
  header: [{cnt: ['Flow']}, {cnt: ['Flow']}],
  hgroup: [{elem: ['legend', 'summary'], cnt: ['Flow']}, {elem: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']}],
  hr: [{cnt: ['Flow']}],
  html: [null, {elem: ['head', 'body']}],
  i: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  iframe: [{cnt: ['Phrasing']}],
  img: [{cnt: ['Phrasing'], elem: ['picture']}],
  input: [{cnt: ['Phrasing']}],
  ins: [{cnt: ['Phrasing']}, {cnt: ['Transparent']}],
  kbd: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  label: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  legend: [{elem: ['fieldset']}, {cnt: ['Phrasing', 'Heading']}],
  li: [{elem: ['ol', 'ul', 'menu']}, {cnt: ['Flow']}],
  link: [{elem: ['head', 'noscript'], cnt: ['Phrasing']}],
  main: [{cnt: ['Flow']}, {cnt: ['Flow']}],
  map: [{cnt: ['Phrasing']}, {cnt: ['Transparent'], elem: ['area']}],
  mark: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  math: [{cnt: ['Phrasing']}, {elem: ['per']}],
  menu: [{cnt: ['Flow']}, {elem: ['li', 'script', 'template']}],
  meta: [{elem: ['head', 'noscript'], cnt: ['Phrasing']}],
  meter: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  nav: [{cnt: ['Flow']}, {cnt: ['Flow']}],
  noscript: [{elem: ['head'], cnt: ['Phrasing']}, {elem: ['#text']}],
  object: [{cnt: ['Phrasing']}, {elem: ['param'], cnt: ['Transparent']}],
  ol: [{cnt: ['Flow']}, {elem: ['li', 'script', 'template']}],
  optgroup: [{elem: ['select']}, {elem: ['option', 'script', 'template']}],
  option: [{elem: ['select', 'datalist', 'optgroup']}, {elem: ['#text']}],
  output: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  p: [{cnt: ['Flow']}, {cnt: ['Phrasing']}],
  param: [{elem: ['object']}],
  picture: [{cnt: ['Phrasing']}, {elem: ['source', 'img', 'script', 'template']}],
  pre: [{cnt: ['Flow']}, {cnt: ['Phrasing']}],
  progress: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  q: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  rp: [{elem: ['ruby']}, {elem: ['#text']}],
  rt: [{elem: ['ruby']}, {cnt: ['Phrasing']}],
  ruby: [{cnt: ['Phrasing']}, {cnt: ['Phrasing'], elem: ['rp', 'rt']}],
  s: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  samp: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  script: [{elem: ['head', 'script', 'template'], cnt: ['Phrasing']}, {elem: ['#text']}],
  section: [{cnt: ['Flow']}, {cnt: ['Flow']}],
  select: [{cnt: ['Phrasing']}, {elem: ['option', 'optgroup', 'script', 'template']}],
  slot: [{cnt: ['Phrasing']}, {cnt: ['Transparent']}],
  small: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  source: [{elem: ['picture', 'video', 'audio']}],
  span: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  strong: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  style: [{elem: ['head', 'noscript']}, {elem: ['#text']}],
  sub: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  summary: [{elem: ['details']}, {cnt: ['Phrasing', 'Heading']}],
  sup: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  svg: [{cnt: ['Phrasing']}, {elem: ['per']}],
  table: [{cnt: ['Flow']}, {elem: ['caption', 'colgroup', 'thead', 'tbody', 'tfoot', 'tr', 'script', 'template']}],
  tbody: [{elem: ['table']}, {elem: ['tr', 'script', 'template']}],
  td: [{elem: ['tr']}, {cnt: ['Flow']}],
  template: [{cnt: ['Metadata', 'Phrasing'], elem: ['colgroup', 'script', 'template']}],
  textarea: [{cnt: ['Phrasing']}, {elem: ['#text']}],
  tfoot: [{elem: ['table']}, {elem: ['tr', 'script', 'template']}],
  th: [{elem: ['tr']}, {cnt: ['Flow']}],
  thead: [{elem: ['table']}, {elem: ['tr', 'script', 'template']}],
  time: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  title: [{elem: ['head']}, {elem: ['#text']}],
  tr: [{elem: ['table', 'thead', 'tbody', 'tfoot']}, {elem: ['th', 'td', 'script', 'template']}],
  track: [{elem: ['audio', 'video']}],
  u: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  ul: [{cnt: ['Flow']}, {elem: ['li', 'script', 'template']}],
  var: [{cnt: ['Phrasing']}, {cnt: ['Phrasing']}],
  video: [{cnt: ['Phrasing']}, {elem: ['source', 'track'], cnt: ['Transparent']}],
  wbr: [{cnt: ['Phrasing']}],
};
const CONTENTS = {
  Metadata: [
    {name:  'base', childRestriction: NO_CHILDREN },
    'link', 'meta', 'noscript', 'script', 'style', 'template', 'title'],
  Flow: ['a', 'abbr', 'address',
    // (if it is a descendant of a 'map' element)
    {name: 'area', contentRestriction: e => NodeWrapper.isDescOf(e, 'map') },
    'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'blockquote', 'br',
    'button', 'canvas', 'cite', 'code', 'data', 'datalist', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'em', 'embed', 'fieldset',
    'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label',
    // (if it is allowed in the body)
    {name: 'link', contentRestriction: () => false}, // TODO we do not use it
    'main', 'map', 'mark', 'math', 'menu',
    // (if the 'itemprop' attribute is present)
    {name: 'meta', contentRestriction: e => !!e.attribute('itemprop')},
    'meter', 'nav', 'noscript', 'object', 'ol', 'output', 'p', 'picture',
    'pre', 'progress', 'q', 'ruby', 's', 'samp', 'script', 'section', 'select', 'slot', 'small', 'span', 'strong', 'sub', 'sup',
    'svg', 'table', 'template', 'textarea', 'time', 'u', 'ul', 'var', 'video', 'wbr',
  ],
  Sectioning: ['article', 'aside', 'nav', 'section'],
  Heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'/*, 'hgroup'*/],
  Phrasing: [ // can place to phrasing content is expected where
    'a', 'abbr',
    // (if it is a descendant of a 'map')
    {name: 'area', contentRestriction: e => NodeWrapper.isDescOf(e, 'map'), childRestriction: NO_CHILDREN},
    'audio', 'b', 'bdi', 'bdo',
    {name: 'br', childRestriction: NO_CHILDREN },
    'button', 'canvas', 'cite', 'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label',
    // (if it is allowed in the body)
    {name: 'link', contentRestriction: () => false}, // TODO we do not use it
    'map', 'mark', 'math',
    // (if the 'itemprop' attribute is present)
    {name: 'meta', contentRestriction: e => !!e.attribute('itemprop')},
    'meter', 'noscript', 'object', 'output', 'picture', 'progress', 'q', 'ruby', 's', 'samp', 'script', 'select', 'slot', 'small', 'span', 'strong', 'sub', 'sup',
    'svg', 'template', 'textarea', 'time', 'u', 'var', 'video',
    {name: 'wbr', childRestriction: NO_CHILDREN },
    '#text'
  ],
  PhrasingWithAttribute: [
    'a', 'abbr', 'data', 'dfn', 'q', 'time'
  ],
  PhrasingFormat: [
    'b', 'bdi', 'bdo', 'cite', 'code', 'del', 'em', 'i', 'ins', 'kbd', 'mark', 's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'u', 'var'
  ],
  Embedded: ['audio', 'canvas', 'embed', 'iframe', 'img', 'math', 'object', 'picture', 'svg', 'video'],
  Interactive: [
    // (if the 'href' attribute is present)
    {name: 'a', contentRestriction: (e) => {
        return !!e.attribute('href');
      }},
    // (if the 'controls' attribute is present)
    {name: 'audio', contentRestriction: (e) => {
        return !!e.attribute('controls');
      }},
    'button', 'details', 'embed', 'iframe',
    // (if the 'usemap' attribute is present)
    {name: 'img', contentRestriction: (e) => {
        return !!e.attribute('usemap');
      }},
    // (if the 'type' attribute is not in the Hidden state)
    {name: 'input', contentRestriction: (e) => {
        const type = e.attribute('type');
        return type ? type.toLowerCase() !== 'hidden' : true;
      }},
    'label', 'select', 'textarea',
    // (if the 'controls' attribute is present)
    {name: 'video', contentRestriction: (e) => {
        return !!e.attribute('controls');
      }}
  ],
  SectioningRoot: ['blockquote', 'body', 'details', 'dialog', 'fieldset', 'figure', 'td'],
  Grouping: ['p', 'hr', 'pre', 'blockquote', 'ol', 'ul', 'menu', 'li', 'dl', 'dt', 'dd', 'figure', 'figcaption', 'main', 'div'],
  FormElements: ['button', 'fieldset', 'input', 'label', 'object', 'output', 'select', 'textarea', 'img'],
  ListedElements: ['button', 'fieldset', 'input', 'object', 'output', 'select', 'textarea'],
  SubmittableElements: ['button', 'input', 'select', 'textarea'],
  ResettableElements: ['input', 'output', 'select', 'textarea'],
  AutocapitalizeInheritingElements: ['button', 'fieldset', 'input', 'output', 'select', 'textarea'],
  LabelableElements: ['button', 'input', 'meter', 'output', 'progress', 'select', 'textarea'],
  Palpable: [ // should have at least one node
    'a', 'abbr', 'address', 'article', 'aside',
    // (if the 'controls' attribute is present)
    {name: 'audio', contentRestriction: (e) => {
        return !!e.attribute('controls');
      }},
    'b', 'bdi', 'bdo', 'blockquote', 'button', 'canvas', 'cite', 'code', 'data', 'details', 'dfn', 'div',
    // (if the element's children include at least one name-value group)
    {name: 'dl', contentRestriction: (e) => {
      let dt = !!e.findChild(w => w.nodeName === 'dt');
      let dd = !!e.findChild(w => w.nodeName === 'dd');
      if (!dt && !dd) {
        const div = e.findChild(w => w.nodeName === 'div');
        if (div) {
          dt = dt || !!div.findChild(w => w.nodeName === 'dt');
          dd = dd || !!div.findChild(w => w.nodeName === 'dd');
        }
      }
      return dt && dd;
    }},
    'em', 'embed', 'fieldset', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'i', 'iframe', 'img',
    // (if the 'type' attribute is not in the Hidden state)
    {name: 'input', contentRestriction: (e) => {
        return e.attribute('type') !== 'hidden';
    }},
    'ins', 'kbd', 'label', 'main', 'map', 'mark', 'math',
    // (if the element's children include at least one 'li' element)
    {name: 'menu', contentRestriction: (e) => {
        return !!e.findChild(w => w.nodeName === 'li');
      }},
    'meter', 'nav', 'object',
    // (if the element's children include at least one 'li' element)
    {name: 'ol', contentRestriction: (e) => {
        return !!e.findChild(w => w.nodeName === 'li');
      }},
    'output', 'p', 'pre', 'progress', 'q', 'ruby', 's', 'samp', 'section', 'select', 'small', 'span', 'strong', 'sub', 'sup',
    'svg', 'table', 'textarea', 'time', 'u',
    // (if the element's children include at least one 'li' element)
    {name: 'ul', contentRestriction: (e) => {
        return !!e.findChild(w => w.nodeName === 'li');
      }},
    'var', 'video',
    // 'text' that is not inter-element whitespace
    '#text'
  ],
  ScripElements: ['script', 'template'],
  None: [
    {name: 'html', childRestriction: (e) => e.nodeName === 'head' || e.nodeName === 'body'},
    {name: 'head', childRestriction: (e) => !!findInArray(e, CONTENTS.Metadata)},
    {name: 'li', childRestriction: (e) => !!findInArray(e, CONTENTS.Flow)},
    {name: 'dt', childRestriction: (e) =>
        !!findInArray(e, CONTENTS.Flow) && !findInArray(e, CONTENTS.Sectioning) && !findInArray(e, CONTENTS.Heading) && !['header', 'footer'].includes(e)},
    {name: 'dd', childRestriction: (e) => !!findInArray(e, CONTENTS.Flow)},
    {name: 'figcaption', childRestriction: (e) => !!findInArray(e, CONTENTS.Flow)},
    {name: 'rt', childRestriction: (e) => !!findInArray(e, CONTENTS.Phrasing)},
    {name: 'rp', childRestriction: (e) => !!findInArray(e, CONTENTS.Phrasing)},
    {name: 'source', childRestriction: NO_CHILDREN},
    {name: 'param', childRestriction: NO_CHILDREN},
    {name: 'track', childRestriction: NO_CHILDREN},
    {name: 'caption', childRestriction: (e) => !!findInArray(e, CONTENTS.Flow)
        && !NodeWrapper.isDescOf(e, 'table') && e.nodeName !== 'table'},
    {name: 'colgroup', childRestriction: (e) => !!e.attribute('span') && (e.nodeName === 'col' || e.nodeName === 'template')},
    {name: 'col', childRestriction: NO_CHILDREN},
    {name: 'tbody', childRestriction: (e) => e.nodeName === 'tr'},
    {name: 'thead', childRestriction: (e) => e.nodeName === 'tr'},
    {name: 'tfoot', childRestriction: (e) => e.nodeName === 'tr'},
    {name: 'tr', childRestriction: (e) => e.nodeName === 'td' || e.nodeName === 'th'},
    {name: 'th', childRestriction: (e) =>
        !!findInArray(e, CONTENTS.Flow) && !findInArray(e, CONTENTS.Sectioning) && !findInArray(e, CONTENTS.Heading) && !['header', 'footer'].includes(e)},
    {name: 'optgroup', childRestriction: (e) => e.nodeName === 'option'},
    {name: 'option', childRestriction: (e) => {
        const label = e.parent.attribute('label');
        if (!label) {
          return e.nodeName === '#text';
        } else {
          return e.parent.attribute('value') ? false : e === '#text';
        }
      }},
    {name: 'legend', childRestriction: (e) => !!findInArray(e, CONTENTS.Phrasing)},
    {name: 'summary', childRestriction: (e) => !!findInArray(e, CONTENTS.Phrasing)},
  ],
  Transparent: [
    // must be no interactive content descendant, 'a' element descendant, or descendant with the 'tabindex' attribute specified
    {name: 'a', contentRestriction: (e) => {
        return e.nodeName !== 'a' && !e.attribute('tabindex') && !findInArray(e, CONTENTS.Interactive);
      }},
    // If the element has a src attribute: zero or more track elements, then transparent, but with no media element descendants.
    // If the element does not have a src attribute: zero or more source elements, then zero or more track elements,
    // then transparent, but with no media element descendants.
    {name: 'audio', contentRestriction: (e) => {
        return !!e.attribute('src'); // TODO correct condition
      }},
    // Transparent, but with no interactive content descendants except for 'a' elements, 'img' elements with 'usemap' attributes,
    // 'button' elements, 'input' elements whose type attribute are in the Checkbox or Radio Button states,
    // 'input' elements that are buttons, and 'select' elements with a multiple attribute or a display size greater than 1.
    {name: 'canvas', contentRestriction: (e) => {
        return !!e.attribute('src');
      }},
    'del', 'ins', 'map',
    // Zero or more param elements, then, transparent.
    {name: 'object', contentRestriction: (e) => {
        return !!e.findChild(w => w.nodeName === 'param');
      }},
    'slot',
    // If the element has a src attribute: zero or more track elements, then transparent, but with no media element descendants.
    // If the element does not have a src attribute: zero or more source elements, then zero or more track elements, then transparent,
    // but with no media element descendants.
    {name: 'video', contentRestriction: (e) => {
        return !!e.attribute('src'); // TODO correct condition
      }}
  ],
  Foreign: ['math', 'svg'],
  EscapableRawTexElements: ['textarea', 'title'],
  VoidElements: ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']
};
export class HtmlRules {
  static elements = ELEMENTS;
  static defCustomContent = DEF_CUSTOM_CONTENTS;
  static contents = CONTENTS;
  static isVoid(n: string): boolean { return CONTENTS.VoidElements.includes(n.toLowerCase()); }
  static isPhrasing(n: NodeWrapper): boolean { return !!findInArray(n, CONTENTS.Phrasing); }
  static isPalpable(n: NodeWrapper): boolean { return !!findInArray(n, CONTENTS.Palpable); }
  static isHeading(n: NodeWrapper): boolean { return !!findInArray(n, CONTENTS.Heading); }
  static isSectionRoot(n: NodeWrapper): boolean { return !!findInArray(n, CONTENTS.SectioningRoot); }
  static isSectioning(n: NodeWrapper): boolean { return !!findInArray(n, CONTENTS.Sectioning); }
  static validateSource(root: NodeWrapper): Error {
    const rootNode: NodeWrapper = root;
    let err: Error;
    treeWalker(rootNode, (r) => {
      r.validate(false);
      if (r.errors.length > 0) {
        err = new Error(r.errors.join('; '));
        return true;
      }
    });
    return err;
  }
  static contentOfNode(n: NodeWrapper): HtmlElementContent {
    if (n) {
      const e = ELEMENTS[n.nodeName];
      if (e && e.length === 2) {
        const c = e[1];
        if (c.cnt && c.cnt.includes('Transparent')) {
          return HtmlRules.contentOfNode(n.parent);
        }
        return c;
      }
    }
    return null;
  }
  static enableTxt(n: NodeWrapper): boolean {
    const cnt = HtmlRules.contentOfNode(n);
    return cnt && cnt.cnt && (cnt.cnt.includes('Flow') || cnt.cnt.includes('Phrasing'));
  }
  static isContent(cnt: ContentType, n: NodeWrapper): any {
    switch (cnt) {
      case 'Embedded':
        return findInArray(n, CONTENTS.Embedded);
      case 'Flow':
        return findInArray(n, CONTENTS.Flow);
      case 'None':
        return findInArray(n, CONTENTS.None);
      case 'Heading':
        return findInArray(n, CONTENTS.Heading);
      case 'Interactive':
        return findInArray(n, CONTENTS.Interactive);
      case 'Metadata':
        return findInArray(n, CONTENTS.Metadata);
      case 'Palpable':
        return findInArray(n, CONTENTS.Palpable);
      case 'Phrasing':
        return findInArray(n, CONTENTS.Phrasing);
      case 'Script':
        return findInArray(n, CONTENTS.ScripElements);
      case 'Sectioning':
        return findInArray(n, CONTENTS.Sectioning);
      case 'SectioningRoot':
        return findInArray(n, CONTENTS.SectioningRoot);
      case 'Grouping':
        return findInArray(n, CONTENTS.Grouping);
      case 'FormElements':
        return findInArray(n, CONTENTS.FormElements);
      case 'ListedElements':
        return findInArray(n, CONTENTS.ListedElements);
      case 'SubmittableElements':
        return findInArray(n, CONTENTS.SubmittableElements);
      case 'ResettableElements':
        return findInArray(n, CONTENTS.ResettableElements);
      case 'AutocapitalizeInheritingElements':
        return findInArray(n, CONTENTS.AutocapitalizeInheritingElements);
      case 'LabelableElements':
        return findInArray(n, CONTENTS.LabelableElements);
      case 'Transparent':
        return findInArray(n, CONTENTS.Transparent);
      case 'Foreign':
        return findInArray(n, CONTENTS.Foreign);
      case 'EscapableRawTexElements':
        return findInArray(n, CONTENTS.EscapableRawTexElements);
      case 'VoidElements':
        return findInArray(n, CONTENTS.VoidElements);
      case 'PhrasingFormat':
        return findInArray(n, CONTENTS.PhrasingFormat);
      case 'PhrasingWithAttribute':
        return findInArray(n, CONTENTS.PhrasingWithAttribute);
    }
  }
  static isElementContent(cnt: ContentType, n: NodeWrapper): boolean {
    const name = n.nodeName;
    return ELEMENTS[name] && ELEMENTS[name][1] && ELEMENTS[name][1].cnt && ELEMENTS[name][1].cnt.includes(cnt);
  }
  static isElementParentContent(cnt: ContentType, n: NodeWrapper): boolean {
    const name = n.nodeName;
    return ELEMENTS[name] && ELEMENTS[name][0] && ELEMENTS[name][0].cnt && ELEMENTS[name][0].cnt.includes(cnt);
  }
}

