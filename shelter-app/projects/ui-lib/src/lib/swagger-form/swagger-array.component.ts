import {Component, Host, OnChanges, OnDestroy, OnInit, Optional, SimpleChanges, SkipSelf} from '@angular/core';
import {SwaggerGroupComponent} from '../shared/swagger-object';
import {SwaggerFormGroupDirective} from './swagger-form-group.directive';
import {SwaggerFormComponent} from './swagger-form.component';

@Component({
  selector: 'lib-swagger-array',
  templateUrl: './swagger-array.component.html',
  styleUrls: ['./swagger-array.component.scss']
})
export class SwaggerArrayComponent extends SwaggerFormComponent implements OnInit, OnDestroy, OnChanges, SwaggerGroupComponent {

  constructor(@Optional() @Host() @SkipSelf() public swaggerFromGroup: SwaggerFormGroupDirective) {
    super(swaggerFromGroup);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log('SwaggerArrayComponent.ngOnChanges', changes);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

}
