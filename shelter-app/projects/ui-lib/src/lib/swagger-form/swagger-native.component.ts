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
import {CommonConstrictions, SwaggerComponent, SwaggerCustomUI, SwaggerNative, SwaggerSchema} from './swagger-object';
import {SwaggerNativeDirective} from './swagger-native.directive';
import {FormControl, Validators} from '@angular/forms';
import {SwaggerFromGroupDirective} from './swagger-from-group.directive';

@Component({
  selector: 'lib-swagger-native',
  template: `
    <div class="ui-swagger-native">
      <ng-container [ngSwitch]="swaggerType">
        <lib-boolean-control *ngSwitchCase="'boolean'" [formControl]="formControl" name="{{propertyId}}"></lib-boolean-control> <!-- [formControlName]="propertyId" -->
        <lib-input-control *ngSwitchCase="'input'" [formControl]="formControl" name="{{propertyId}}"></lib-input-control> <!-- [formControlName]="propertyId" -->
        <lib-select-control *ngSwitchCase="'select'" [formControl]="formControl" name="{{propertyId}}"></lib-select-control> <!-- [formControlName]="propertyId" -->
        <lib-checkbox-control *ngSwitchCase="'checkbox'" [formControl]="formControl" name="{{propertyId}}"></lib-checkbox-control> <!-- [formControlName]="propertyId" -->
        <lib-radio-control *ngSwitchCase="'radio'" [formControl]="formControl" name="{{propertyId}}"></lib-radio-control> <!-- [formControlName]="propertyId" -->
      </ng-container>
        <!-- ng-template [libSwaggerNative]></ng-template -->
    </div>`,
  styleUrls: ['./swagger-native.component.scss']
})
export class SwaggerNativeComponent implements OnInit, OnChanges, SwaggerComponent, AfterViewInit {

  @Input() swagger: SwaggerSchema;
  @Input() propertyId: string;
  @Input() required: boolean;
  swaggerType: string;
  formControl: FormControl;

  @ViewChild(SwaggerNativeDirective, {static: true}) control: SwaggerNativeDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private swaggerFromGroup: SwaggerFromGroupDirective) {
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
    const constraint = swagger.constrictions || {} as CommonConstrictions;
    const ui = this.swagger.ui || {} as SwaggerCustomUI;
    if (this.swaggerFromGroup) {
      const validators = ui.validators || [];
      if (this.required && !validators.includes(Validators.required)) {
        validators.push(Validators.required);
      }
      this.formControl = new FormControl(constraint.default, validators, ui.asyncValidator);
      this.swaggerFromGroup.libSwaggerFromGroup.addControl(this.propertyId, this.formControl);
    }
    if (constraint.enums) {
      this.swaggerType = constraint.enums.length < 4 ? 'checkbox' : 'select';
    }
    if (this.swaggerType === 'string' || this.swaggerType === 'number' || this.swaggerType === 'integer') {
      this.swaggerType = 'input';
    }
  }
}
