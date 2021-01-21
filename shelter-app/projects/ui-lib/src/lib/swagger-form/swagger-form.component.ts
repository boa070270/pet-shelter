import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  Input, OnChanges,
  OnInit,
  QueryList, SimpleChanges,
  ViewChildren
} from '@angular/core';
import {
  coerceToSwaggerArray,
  coerceToSwaggerNative,
  coerceToSwaggerObject,
  SwaggerComponent,
  SwaggerObject
} from './swagger-object';
import {FormGroup} from '@angular/forms';
import {SwaggerControlDirective} from './swagger-control.directive';
import {SwaggerArrayComponent} from './swagger-array.component';
import {SwaggerNativeComponent} from './swagger-native.component';


@Component({
  selector: 'lib-swagger-form',
  template: `
    <div *ngIf="swagger" ngForm>
    <ng-container *ngFor="let fld of properties">
      <ng-container [ngSwitch]="fld.controlType">
        <lib-swagger-native [propertyId]="fld.propertyId" [swagger]="swagger.properties[fld.propertyId]" *ngSwitchCase="'native'"></lib-swagger-native>
        <lib-swagger-form [propertyId]="fld.propertyId" [swagger]="swagger.properties[fld.propertyId]" *ngSwitchCase="'object'"></lib-swagger-form>
        <lib-swagger-array [propertyId]="fld.propertyId" [swagger]="swagger.properties[fld.propertyId]" *ngSwitchCase="'array'"></lib-swagger-array>
        <!-- ng-template [libSwaggerControl]="swagger.properties[fld]" [propertyId]="fld"> </ng-template -->
      </ng-container>
    </ng-container>
  </div>`,
  styleUrls: ['./swagger-form.component.scss']
})
export class SwaggerFormComponent implements OnInit, OnChanges, SwaggerComponent, AfterViewInit {
  @Input() swagger: SwaggerObject;
  @Input() propertyId: string;
  properties: Array<{propertyId: string, controlType: string}> = [];

  @ViewChildren(SwaggerControlDirective) controls: QueryList<SwaggerControlDirective>;
  form: FormGroup;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('SwaggerFormDirective.ngOnChanges', changes);
  }

  ngOnInit(): void {
    console.log('SwaggerFormComponent.ngOnInit', this.swagger);
    this.processProperties();
    console.log('SwaggerFormComponent.ngOnInit-after', this.swagger, this.propertyId, this.properties);
  }

  ngAfterViewInit(): void {
    // this.loadComponents();
  }
  private processProperties(): void {
    if (this.swagger && this.swagger.orderControls && this.swagger.properties) {
      for (const propertyId of this.swagger.orderControls) {
        const property = this.swagger.properties[propertyId];
        let controlType = null;
        if (coerceToSwaggerNative(property)) {
          controlType = 'native';
        } else if (coerceToSwaggerObject(property)) {
          controlType = 'object';
        } else if (coerceToSwaggerArray(property)) {
          controlType = 'array';
        } else {
          continue;
        }
        this.properties.push({propertyId, controlType});
      }
    }
  }
  private loadComponents(): void {
    console.log('SwaggerFormComponent.loadComponents', this.controls);
    for (const ctrl of this.controls) {
      const viewContainerRef = ctrl.viewContainerRef;
      viewContainerRef.clear();
      let componentFactory = null;
      if (coerceToSwaggerNative(ctrl.libSwaggerControl)) {
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(SwaggerNativeComponent);
      } else if (coerceToSwaggerObject(ctrl.libSwaggerControl)) {
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(SwaggerFormComponent);
      } else if (coerceToSwaggerArray(ctrl.libSwaggerControl)){
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(SwaggerArrayComponent);
      }
      // @ts-ignore
      const componentRef = viewContainerRef.createComponent<SwaggerComponent>(componentFactory);
      componentRef.instance.swagger = ctrl.libSwaggerControl;
    }
  }
}
