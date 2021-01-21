import {ComponentFactoryResolver, Directive, Input, OnChanges, SimpleChanges, ViewContainerRef} from '@angular/core';
import {coerceToSwaggerArray, coerceToSwaggerObject, SwaggerComponent, SwaggerSchema} from './swagger-object';
import {SwaggerFormService} from './swagger-form.service';
import {SwaggerFormComponent} from './swagger-form.component';
import {SwaggerArrayComponent} from './swagger-array.component';

@Directive({
  selector: '[libSwaggerForm]'
})
export class SwaggerFormDirective implements OnChanges {
  @Input() libSwaggerForm: string;

  constructor(public viewContainerRef: ViewContainerRef,
              public dynamicFormService: SwaggerFormService,
              private componentFactoryResolver: ComponentFactoryResolver) {
  }

  getSwaggerSchema(): SwaggerSchema {
    return this.dynamicFormService.getSchema(this.libSwaggerForm);
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log('SwaggerFormDirective.ngOnChanges', changes);
    // if (changes.libSwaggerForm) {
    //   const schema = this.dynamicFormService.getSchema(this.libSwaggerForm);
    //   this.loadForm(schema);
    // }
  }
  private loadForm(schema): void {
    if (schema) {
      const viewContainerRef = this.viewContainerRef;
      viewContainerRef.clear();
      let componentFactory = null;
      if (coerceToSwaggerObject(schema)) {
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(SwaggerFormComponent);
      } else if (coerceToSwaggerArray(schema)){
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(SwaggerArrayComponent);
      }
      // @ts-ignore
      const componentRef = viewContainerRef.createComponent<SwaggerComponent>(componentFactory);
      componentRef.instance.swagger = schema;
    }
  }

}
