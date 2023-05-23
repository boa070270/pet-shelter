import {ComponentFactory, ComponentFactoryResolver, Injectable, Injector, Type} from '@angular/core';
import {AbstractIteratorComponent} from './abstract-iterator.component';

/**
 * This is workaround for restriction of ngContentSelector
 * By default, if template of component doesn't have <ng-content>, Angular doesn't process content for custom elements
 */
@Injectable()
export class ExtComponentFactory extends ComponentFactoryResolver {
  private readonly original: ComponentFactoryResolver;
  constructor(private injector: Injector) {
    super();
    this.original = this.injector.get(ComponentFactoryResolver);
  }
  resolveComponentFactory<T>(component: Type<T>): ComponentFactory<T> {
    const cf = this.original.resolveComponentFactory(component);
    if (AbstractIteratorComponent.isAbstractIteratorComponent(component)) {
      (cf as any).ngContentSelectors = ['*'];
    }
    return cf;
  }
}
