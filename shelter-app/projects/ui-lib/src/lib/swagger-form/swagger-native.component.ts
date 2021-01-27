import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  CommonConstrictions, NumberConstrictions,
  StringConstrictions,
  SwaggerComponent,
  SwaggerCustomUI,
  SwaggerNative,
  SwaggerSchema
} from '../shared/swagger-object';
import {SwaggerNativeDirective} from './swagger-native.directive';
import {FormControl, Validators} from '@angular/forms';
import {SwaggerFormGroupDirective} from './swagger-form-group.directive';

@Component({
  selector: 'lib-swagger-native',
  template: `
    <div class="ui-swagger-native">
      <ng-container [ngSwitch]="swaggerType">
        <lib-boolean-control *ngSwitchCase="'boolean'" [formControl]="formControl"
                             name="{{propertyId}}"></lib-boolean-control>
        <lib-input-control *ngSwitchCase="'input'" [formControl]="formControl" name="{{propertyId}}"
                           [hint]="ui.description" [placeholder]="ui.placeHolder" [tooltip]="ui.toolTips"
                           [caption]="ui.caption" [leadingIcon]="ui.leadingIcon" [trailingIcon]="ui.trailingIcon"
                           [type]="constrictions.format" [disabled]="constrictions.readOnly"
        ></lib-input-control>
        <lib-select-control *ngSwitchCase="'select'" [formControl]="formControl" name="{{propertyId}}"
                            [hint]="ui.description" [tooltips]="ui.toolTips"
                            [caption]="ui.caption" [multiple]="constrictions.enumMulti"
                            [options]="constrictions.enums" [titles]="constrictions.enumDescriptions"
        ></lib-select-control>
        <lib-checkbox-control *ngSwitchCase="'checkbox'" [formControl]="formControl" name="{{propertyId}}"
                              [hint]="ui.description" [tooltips]="ui.toolTips"
                              [caption]="ui.caption"
                              [options]="constrictions.enums" [titles]="constrictions.enumDescriptions"
        ></lib-checkbox-control>
        <lib-radio-control *ngSwitchCase="'radio'" [formControl]="formControl" name="{{propertyId}}"
                           [hint]="ui.description" [tooltips]="ui.toolTips"
                           [caption]="ui.caption"
                           [options]="constrictions.enums" [titles]="constrictions.enumDescriptions"
        ></lib-radio-control>
      </ng-container>
    </div>`,
  styleUrls: ['./swagger-native.component.scss']
})
export class SwaggerNativeComponent implements OnInit, OnChanges, SwaggerComponent, AfterViewInit {

  @Input() swagger: SwaggerSchema;
  @Input() propertyId: string;
  @Input() required: boolean;
  swaggerType: string;
  ui: SwaggerCustomUI;
  constrictions: CommonConstrictions;
  formControl: FormControl;

  @ViewChild(SwaggerNativeDirective, {static: true}) control: SwaggerNativeDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private swaggerFromGroup: SwaggerFormGroupDirective) {
    console.log('SwaggerNativeComponent.constructor', swaggerFromGroup);
  }

  ngOnInit(): void {
    console.log('SwaggerNativeComponent.ngOnInit', this.swagger, this.propertyId);
    this.defineControlType();
    console.log('SwaggerNativeComponent.ngOnInit.after', this.swagger, this.propertyId, this.swaggerType);
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log('SwaggerNativeComponent.ngOnChanges', changes);
  }
  ngAfterViewInit(): void {
    console.log('SwaggerNativeComponent.ngAfterViewInit', this.swagger);
  }
  private defineControlType(): void {
    const swagger = this.swagger as SwaggerNative;
    this.swaggerType = swagger.type;
    this.constrictions = swagger.constrictions || {} as CommonConstrictions;
    this.ui = this.swagger.ui || {} as SwaggerCustomUI;
    if (this.swaggerFromGroup) {
      const validators = this.ui.validators || [];
      if (this.required && !validators.includes(Validators.required)) {
        validators.push(Validators.required);
      }
      this.formControl = new FormControl(this.constrictions.default, validators, this.ui.asyncValidator);
      this.swaggerFromGroup.libSwaggerFromGroup.addControl(this.propertyId, this.formControl);
    }
    if (this.constrictions.enums) {
      this.swaggerType = this.constrictions.enums.length < 4 ? 'radio' : 'select';
    }
    if (this.swaggerType === 'string' || this.swaggerType === 'number' || this.swaggerType === 'integer') {
      this.swaggerType = 'input';
    }
  }
}
