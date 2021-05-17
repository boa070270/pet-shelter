import {ComponentFactory, ComponentFactoryResolver, Injectable, Injector, Type} from '@angular/core';
import {AbstractIteratorComponent} from '../controls';

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
