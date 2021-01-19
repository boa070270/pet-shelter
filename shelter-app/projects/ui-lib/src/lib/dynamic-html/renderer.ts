import {
  Injectable,
  Injector,
  ElementRef,
  ComponentFactoryResolver,
  ComponentFactory,
  ComponentRef, TemplateRef, Inject, Type
} from '@angular/core';
import {DynamicHTMLOptions} from './options';
import {DOCUMENT} from '@angular/common';

export interface DynamicHTMLRef {
  check: () => void;
  destroy: () => void;
}

function isBrowserPlatform(): boolean {
  return window != null && window.document != null;
}

@Injectable()
export class DynamicHTMLRenderer {

  private componentFactories = new Map<string, ComponentFactory<any>>();

  private componentRefs = new Map<any, Array<ComponentRef<any>>>();

  constructor(private options: DynamicHTMLOptions, private cfr: ComponentFactoryResolver,
              private injector: Injector,
              @Inject(DOCUMENT) private document: Document) {
    console.log('constructor DynamicHTMLRenderer');
    this.options.components.forEach(({selector, component}) => {
      let cf: ComponentFactory<any>;
      cf = this.cfr.resolveComponentFactory(component);
      this.componentFactories.set(selector || cf.selector, cf);
    });
  }

  renderInnerHTML(elementRef: ElementRef, html: string): DynamicHTMLRef {
    if (!isBrowserPlatform()) {
      return {
        check: () => {
        },
        destroy: () => {
        },
      };
    }
    elementRef.nativeElement.innerHTML = html;

    const componentRefs: Array<ComponentRef<any>> = [];
    this.componentFactories.forEach((cmpFactory, selector) => {
      const elements = (elementRef.nativeElement as Element).querySelectorAll(selector);
      Array.prototype.forEach.call(elements, (el: Element) => {
        const content = [];
        if (el.hasChildNodes()) {
          const children = [];
          el.childNodes.forEach(v => {
            const ngContent = this.resolveNgContent(v);
            children.push([v]);
          });
          content.push(children);
        }
        const cmpRef = cmpFactory.create(this.injector, content, el);

        el.removeAttribute('ng-version');
        for (const {propName, templateName} of cmpFactory.inputs) {
          const attr = el.getAttribute(templateName);
          if (attr !== undefined) {
            cmpRef.instance[propName] = attr;
          }
        }
        componentRefs.push(cmpRef);
      });
    });
    this.componentRefs.set(elementRef, componentRefs);
    return {
      check: () => componentRefs.forEach(ref => ref.changeDetectorRef.detectChanges()),
      destroy: () => {
        componentRefs.forEach(ref => ref.destroy());
        this.componentRefs.delete(elementRef);
      },
    };
  }
  resolveNgContent(content: any): any[][] {
    if (typeof content === 'string') {
      const element = this.document.createTextNode(content);
      return [[element]];
    }

    if (content instanceof TemplateRef) {
      const viewRef = content.createEmbeddedView(null);
      return [viewRef.rootNodes];
    }

    /** Otherwise it's a component */
    if (content instanceof Type) {
      const factory = this.cfr.resolveComponentFactory(content);
      const componentRef = factory.create(this.injector);
      return [[componentRef.location.nativeElement]];
    }
  }
}
