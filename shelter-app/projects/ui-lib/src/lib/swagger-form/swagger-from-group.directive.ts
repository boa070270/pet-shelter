import {Directive, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Directive({
  selector: '[libSwaggerFromGroup]'
})
export class SwaggerFromGroupDirective {
  @Input() libSwaggerFromGroup: FormGroup;
  constructor() { }

}
