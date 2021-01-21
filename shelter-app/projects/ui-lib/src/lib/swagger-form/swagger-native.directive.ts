import {Directive, Input, ViewContainerRef} from '@angular/core';
import {SwaggerNative} from './swagger-object';

@Directive({
  selector: '[libSwaggerNative]'
})
export class SwaggerNativeDirective {
  @Input() libSwaggerNative: string;
  constructor(public viewContainerRef: ViewContainerRef) { }

}
