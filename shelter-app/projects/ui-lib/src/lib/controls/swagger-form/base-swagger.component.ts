import {Component, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '../base.component';
import {BaseConstrictions, SwaggerSchema, SwaggerUI} from '../../shared';
import {AbstractControl, ControlValueAccessor, FormGroup} from '@angular/forms';
import {SystemLang} from '../../i18n';
import {Directionality} from '@angular/cdk/bidi';
import {Subscription} from 'rxjs';

@Component({
  selector: 'lib-base-swagger',
  template: ''
})
export class BaseSwaggerComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {

  protected _swagger: SwaggerSchema;
  private statusSubs: Subscription;
  protected formControl: AbstractControl;
  @Input()
  set swagger(sw: SwaggerSchema) {
    this._swagger = sw;
  }
  get swagger(): SwaggerSchema {
    return this._swagger;
  }
  @Input() propertyId: string;
  @Input() pFormGroup: FormGroup;
  get ui(): SwaggerUI {
    return this._swagger.ui;
  }
  get constrictions(): BaseConstrictions {
    return this._swagger.constrictions;
  }
  constructor(public systemLang: SystemLang, protected directionality: Directionality) {
    super(systemLang, directionality);
  }
  ngOnInit(): void {
    super.ngOnInit();
    if (this.pFormGroup && this.pFormGroup.controls) {
      this.formControl = this.pFormGroup.controls[this.propertyId];

      if (this.formControl) {
        this.statusSubs = this.formControl.statusChanges.subscribe(status => {
          this.onStatusChange(status);
        });
      }
    }
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.statusSubs) {
      this.statusSubs.unsubscribe();
      this.statusSubs = null;
    }
  }
  protected onStatusChange(status: any): void {
    console.log('BaseSwaggerComponent.onStatusChange', status, typeof status);
    this.setDisabledState(status === 'DISABLED');
  }

}
