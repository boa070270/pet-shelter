import {Component, ComponentFactoryResolver, Input, OnInit, ViewChild} from '@angular/core';
import {SwaggerFormDirective} from './swagger-form.directive';
import {SwaggerFormService} from './swagger-form.service';
import {coerceToSwaggerArray, coerceToSwaggerObject, SwaggerComponent, SwaggerObject, SwaggerSchema} from './swagger-object';
import {SwaggerArrayComponent} from './swagger-array.component';
import {SwaggerFormComponent} from './swagger-form.component';

@Component({
  selector: 'lib-generator-form',
  // templateUrl: './generator-form.component.html',
  template: `
    <div class="ui-dynamic-form">
      <h3>Developing form</h3>
      <ng-template [libSwaggerForm]="swagger"></ng-template>
    </div>`,
  styleUrls: ['./generator-form.component.scss']
})
export class GeneratorFormComponent implements OnInit {
  @Input() swagger: string;
  @ViewChild(SwaggerFormDirective, {static: true}) dynamicEntry;
  private schema: SwaggerSchema;

  constructor(private dynamicFormService: SwaggerFormService,
              private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    this.schema = this.dynamicFormService.getSchema(this.swagger);
    this.loadForm();
  }

  private loadForm(): void {
    if (this.schema) {
      const viewContainerRef = this.dynamicEntry.viewContainerRef;
      viewContainerRef.clear();
      let componentFactory = null;
      if (coerceToSwaggerObject(this.schema)) {
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(SwaggerFormComponent);
      } else if (coerceToSwaggerArray(this.schema)){
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(SwaggerArrayComponent);
      }
      // @ts-ignore
      const componentRef = viewContainerRef.createComponent<SwaggerComponent>(componentFactory);
      componentRef.instance.swagger = this.schema;
    }
  }
}
