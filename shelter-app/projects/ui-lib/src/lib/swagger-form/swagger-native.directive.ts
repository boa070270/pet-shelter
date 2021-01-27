import {Directive, Input, ViewContainerRef} from '@angular/core';
import {SwaggerNative} from '../shared/swagger-object';

@Directive({
  selector: '[libSwaggerNative]'
})
export class SwaggerNativeDirective {
  @Input() libSwaggerNative: string;
  constructor(public viewContainerRef: ViewContainerRef) { }

}
