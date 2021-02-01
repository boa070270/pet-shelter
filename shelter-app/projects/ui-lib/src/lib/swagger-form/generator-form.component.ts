import {
  AfterContentChecked,
  AfterContentInit, AfterViewChecked,
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Input,
  OnChanges, OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {SwaggerFormService} from './swagger-form.service';
import {SwaggerComponent, SwaggerGroupComponent, SwaggerSchema} from '../shared/swagger-object';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'lib-generator-form',
  // templateUrl: './generator-form.component.html',
  template: `
    <div class="ui-dynamic-form">
      <h3>Developing form</h3>
      <lib-input-control></lib-input-control>
      <lib-swagger-form [swagger]="schema"></lib-swagger-form>
    </div>`,
  styleUrls: ['./generator-form.component.scss']
})
export class GeneratorFormComponent implements OnInit {
  @Input() swagger: string;
  // @ViewChild(SwaggerFormDirective, {static: true}) dynamicEntry;
  schema: SwaggerSchema;
  private componentRef: ComponentRef<SwaggerGroupComponent>;

  get formGroup(): FormGroup {
    if (this.componentRef) {
      return this.componentRef.instance.formGroup;
    }
  }

  constructor(private swaggerFormService: SwaggerFormService,
              private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnInit(): void {
    console.log('GeneratorFormComponent.ngOnInit', this.swagger);
    this.schema = this.swaggerFormService.getSchema(this.swagger);
    console.log('GeneratorFormComponent.ngOnInit schema', this.schema);
    // this.loadForm();
  }

  // private loadForm(): void {
  //   if (this.schema) {
  //     const viewContainerRef = this.dynamicEntry.viewContainerRef;
  //     viewContainerRef.clear();
  //     let componentFactory = null;
  //     if (coerceToSwaggerObject(this.schema)) {
  //       componentFactory = this.componentFactoryResolver.resolveComponentFactory(SwaggerFormComponent);
  //     } else if (coerceToSwaggerArray(this.schema)){
  //       componentFactory = this.componentFactoryResolver.resolveComponentFactory(SwaggerArrayComponent);
  //     }
  //     // @ts-ignore
  //     this.componentRef = viewContainerRef.createComponent<SwaggerGroupComponent>(componentFactory);
  //     this.componentRef.instance.swagger = this.schema;
  //   }
  // }
}
