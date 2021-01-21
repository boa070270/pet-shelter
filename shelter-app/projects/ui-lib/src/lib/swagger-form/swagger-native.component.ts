import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver, Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  CommonConstrictions,
  NumberConstrictions,
  StringConstrictions,
  SwaggerComponent, SwaggerCustomUI,
  SwaggerNative
} from './swagger-object';
import {BooleanControlComponent, InputControlComponent} from '../controls';
import {SwaggerNativeDirective} from './swagger-native.directive';

@Component({
  selector: 'lib-swagger-native',
  template: `
    <div class="ui-swagger-native">
      <ng-container [ngSwitch]="swaggerType">
        <lib-boolean-control *ngSwitchCase="'boolean'" [formControlName]="propertyId"></lib-boolean-control>
        <lib-input-control *ngSwitchCase="'input'" [formControlName]="propertyId"></lib-input-control>
        <lib-select-control *ngSwitchCase="'select'" [formControlName]="propertyId"></lib-select-control>
        <lib-checkbox-control *ngSwitchCase="'checkbox'" [formControlName]="propertyId"></lib-checkbox-control>
        <lib-radio-control *ngSwitchCase="'radio'" [formControlName]="propertyId"></lib-radio-control>
      </ng-container>
        <!-- ng-template [libSwaggerNative]></ng-template -->
    </div>`,
  styleUrls: ['./swagger-native.component.scss']
})
export class SwaggerNativeComponent implements OnInit, OnChanges, SwaggerComponent, AfterViewInit {

  @Input() swagger: SwaggerNative;
  @Input() propertyId: string;
  swaggerType: string;

  @ViewChild(SwaggerNativeDirective, {static: true}) control: SwaggerNativeDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

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
    this.swaggerType = this.swagger.type;
    const constraint = this.swagger.constrictions || {} as CommonConstrictions;
    const ui = this.swagger.ui || {} as SwaggerCustomUI;
    if (constraint.enums) {
      this.swaggerType = constraint.enums.length < 4 ? 'checkbox' : 'select';
    }
    if (this.swaggerType === 'string' || this.swaggerType === 'number' || this.swaggerType === 'integer') {
      this.swaggerType = 'input';
    }
  }
}
