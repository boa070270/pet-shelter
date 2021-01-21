import {Directive, Input, ViewContainerRef} from '@angular/core';
import {SwaggerSchema} from '../shared';
import {DynamicFormService} from './dynamic-form.service';

@Directive({
  selector: '[libDynamicForm]'
})
export class DynamicFormDirective {
  @Input() libDynamicForm: string;

  constructor(public viewContainerRef: ViewContainerRef, public dynamicFormService: DynamicFormService) { }

  getSwaggerSchema(): SwaggerSchema {
    return this.dynamicFormService.getSchema(this.libDynamicForm);
  }
}
