import {Component, Host, Input, OnChanges, OnDestroy, OnInit, Optional, SimpleChanges, SkipSelf} from '@angular/core';
import {SwaggerGroupComponent} from '../shared/swagger-object';
import {SwaggerFormComponent} from './swagger-form.component';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'lib-swagger-array',
  templateUrl: './swagger-array.component.html',
  styleUrls: ['./swagger-array.component.scss']
})
export class SwaggerArrayComponent extends SwaggerFormComponent implements OnInit, OnDestroy, OnChanges, SwaggerGroupComponent {
  @Input() pFormGroup: FormGroup;

  constructor() {
    super();
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
