import {Component, ComponentFactoryResolver, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {SwaggerArray, SwaggerComponent} from './swagger-object';

@Component({
  selector: 'lib-swagger-array',
  templateUrl: './swagger-array.component.html',
  styleUrls: ['./swagger-array.component.scss']
})
export class SwaggerArrayComponent implements OnInit, OnDestroy, OnChanges, SwaggerComponent {
  @Input() swagger: SwaggerArray;
  @Input() propertyId: string;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnInit(): void {
    this.loadComponents();
  }
  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy(): void {
  }

  private loadComponents(): void {

  }
}
