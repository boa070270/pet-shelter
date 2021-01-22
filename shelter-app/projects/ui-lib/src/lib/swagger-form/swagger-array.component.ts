import {Component, Host, OnChanges, OnDestroy, OnInit, Optional, SimpleChanges, SkipSelf} from '@angular/core';
import {SwaggerGroupComponent} from './swagger-object';
import {SwaggerFromGroupDirective} from './swagger-from-group.directive';
import {SwaggerFormComponent} from './swagger-form.component';

@Component({
  selector: 'lib-swagger-array',
  templateUrl: './swagger-array.component.html',
  styleUrls: ['./swagger-array.component.scss']
})
export class SwaggerArrayComponent extends SwaggerFormComponent implements OnInit, OnDestroy, OnChanges, SwaggerGroupComponent {

  constructor(@Optional() @Host() @SkipSelf() public swaggerFromGroup: SwaggerFromGroupDirective) {
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
