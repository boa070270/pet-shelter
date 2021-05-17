import {
  AfterContentInit,
  ChangeDetectorRef,
  Component, ContentChild, ContentChildren,
  EventEmitter, forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges, TemplateRef, Type,
  ViewContainerRef
} from '@angular/core';
import {AbstractComponent} from './abstract.component';
import {CdkDataSource} from '../shared';
import {Subscription} from 'rxjs';
import {ListRange} from '@angular/cdk/collections';

const MARK = 'AbstractIteratorComponent';
@Component({
  selector: 'lib-abstract-iterator',
  template: '',
  styleUrls: ['./abstract-iterator.component.css']
})
export class AbstractIteratorComponent<T, U> extends AbstractComponent implements OnInit, OnChanges, AfterContentInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  protected get __mark__(): string { return MARK; }
  @Input() ds: CdkDataSource<U, T>;
  // @ContentChild(TemplateRef) child: any;
  // @ContentChild(ViewContainerRef) child2: any;
  // @ContentChildren(TemplateRef) children: any;
  // @ContentChildren(ViewContainerRef) children2: any;
  prefix: string;
  data: T[] | ReadonlyArray<T> = null;
  protected readonly collectionViewer;
  private dataSubs: Subscription;
  protected initListRange: ListRange = {start: 0, end: 100};
  static isAbstractIteratorComponent(c: any): boolean {
    return c && (typeof (c as any).isAbstractIteratorComponent === 'function' || (c as any).__mark__ === MARK);
  }

  constructor(protected _view: ViewContainerRef,
              protected changeDetector: ChangeDetectorRef) {
    super(_view);
    this.collectionViewer = {viewChange: new EventEmitter<ListRange>()};
  }

  ngOnInit(): void {
    const data = this.ds.connect(this.collectionViewer);
    this.dataSubs = data.subscribe(d => {
      this.data = d;
      this.changeDetector.detectChanges();
    });
    this.collectionViewer.viewChange.emit(this.initListRange);
    const projectableNodes =
      extractProjectableNodes(this._view.element.nativeElement, ['*']);
    console.log(projectableNodes);
  }
  ngOnChanges(changes: SimpleChanges): void {
    const v = changes.ds;
    if (v && AbstractComponent.isPageData(v.currentValue)) {
      this.prefix = AbstractComponent.pageDataKey(v.currentValue);
    }
    super.ngOnChanges(changes);
  }
  ngAfterContentInit(): void {
    // console.log(this.child, this.child2, this.children, this.children2);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.dataSubs !== null) {
      this.ds.disconnect(this.collectionViewer);
      this.dataSubs.unsubscribe();
    }
    this.collectionViewer.viewChange.complete();
  }
}
function extractProjectableNodes(host: HTMLElement, ngContentSelectors: string[]): Node[][] {
  const nodes = host.childNodes;
  const projectableNodes: Node[][] = ngContentSelectors.map(() => []);
  let wildcardIndex = -1;

  ngContentSelectors.some((selector, i) => {
    if (selector === '*') {
      wildcardIndex = i;
      return true;
    }
    return false;
  });

  for (let i = 0, ii = nodes.length; i < ii; ++i) {
    const node = nodes[i];
    const ngContentIndex = findMatchingIndex(node, ngContentSelectors, wildcardIndex);

    if (ngContentIndex !== -1) {
      projectableNodes[ngContentIndex].push(node);
    }
  }

  return projectableNodes;
}
function findMatchingIndex(node: Node, selectors: string[], defaultIndex: number): number {
  let matchingIndex = defaultIndex;

  if (isElement(node)) {
    selectors.some((selector, i) => {
      if ((selector !== '*') && matchesSelector(node, selector)) {
        matchingIndex = i;
        return true;
      }
      return false;
    });
  }

  return matchingIndex;
}
function isElement(node: Node|null): node is Element {
  return !!node && node.nodeType === Node.ELEMENT_NODE;
}
let _matches: (this: any, selector: string) => boolean;
function matchesSelector(el: any, selector: string): boolean {
  if (!_matches) {
    const elProto = <any>Element.prototype;
    _matches = elProto.matches || elProto.matchesSelector || elProto.mozMatchesSelector ||
      elProto.msMatchesSelector || elProto.oMatchesSelector || elProto.webkitMatchesSelector;
  }
  return el.nodeType === Node.ELEMENT_NODE ? _matches.call(el, selector) : false;
}
