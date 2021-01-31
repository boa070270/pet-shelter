import {ComponentFactoryResolver, Injector, Type, ViewContainerRef} from "@angular/core";

export function createComponent(viewContainerRef: ViewContainerRef,
                                component: Type<any>,
                                componentFactoryResolver: ComponentFactoryResolver,
                                index?: number, injector?: Injector,
                                projectableNodes?: any[][],
                                data?: any
                                ) {
  viewContainerRef.clear();
  const componentFactory = componentFactoryResolver.resolveComponentFactory(component);
  const componentRef = viewContainerRef.createComponent<any>(componentFactory, index, injector, projectableNodes);
  if (data) {
    // componentRef.instance.
  }
}
