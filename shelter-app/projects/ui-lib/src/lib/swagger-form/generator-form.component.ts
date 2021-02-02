import {Component, ComponentRef, Input, OnInit, ViewChild} from '@angular/core';
import {SwaggerFormService} from './swagger-form.service';
import {SwaggerGroupComponent, SwaggerSchema} from '../shared';
import {FormGroup} from '@angular/forms';
import {SwaggerFormComponent} from './swagger-form.component';

@Component({
  selector: 'lib-generator-form',
  template: `
    <div class="ui-dynamic-form">
      <lib-swagger-form #form [swagger]="schema"></lib-swagger-form>
    </div>`,
  styleUrls: ['./generator-form.component.scss']
})
export class GeneratorFormComponent implements OnInit {
  @Input() swagger: string;
  schema: SwaggerSchema;
  @ViewChild('form', {static: true}) componentRef: SwaggerFormComponent;

  get formGroup(): FormGroup {
    if (this.componentRef) {
      return this.componentRef.formGroup;
    }
  }

  constructor(private swaggerFormService: SwaggerFormService) {
  }

  ngOnInit(): void {
    console.log('GeneratorFormComponent.ngOnInit', this.swagger);
    this.schema = this.swaggerFormService.getSchema(this.swagger);
  }
}
