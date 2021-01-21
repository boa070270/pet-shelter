import {ComponentFactoryResolver, Directive, Input, OnChanges, SimpleChanges, ViewContainerRef} from '@angular/core';
import {SwaggerSchema} from './swagger-object';

@Directive({
  selector: '[libSwaggerControl]'
})
export class SwaggerControlDirective implements OnChanges {
  @Input() libSwaggerControl: SwaggerSchema;
  @Input() propertyId: string;

  constructor(public viewContainerRef: ViewContainerRef,
              private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('SwaggerControlDirective.ngOnChanges', changes);
    if (changes.libSwaggerControl) {
      this.loadComponents();
    }
  }
  private loadComponents(): void {
    // console.log('SwaggerControlDirective.loadComponents', this.libSwaggerControl, this.propertyId);
    // const viewContainerRef = this.viewContainerRef;
    // viewContainerRef.clear();
    // let componentFactory = null;
    // if (coerceToSwaggerNative(this.libSwaggerControl)) {
    //   componentFactory = this.componentFactoryResolver.resolveComponentFactory(SwaggerNativeComponent);
    // } else if (coerceToSwaggerObject(this.libSwaggerControl)) {
    //   componentFactory = this.componentFactoryResolver.resolveComponentFactory(SwaggerFormComponent);
    // } else if (coerceToSwaggerArray(this.libSwaggerControl)){
    //   componentFactory = this.componentFactoryResolver.resolveComponentFactory(SwaggerArrayComponent);
    // }
    // // @ts-ignore
    // const componentRef = viewContainerRef.createComponent<SwaggerComponent>(componentFactory);
    // componentRef.instance.swagger = this.libSwaggerControl;
    // componentRef.instance.propertyId = this.propertyId;
  }

}
