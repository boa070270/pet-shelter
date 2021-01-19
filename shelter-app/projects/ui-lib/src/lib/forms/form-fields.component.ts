import {ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {ChangeViewModel, CommonFieldConfig, EnumInputType, EnumKindOfField, UIFormGroup} from './form-configuration';
import {AbstractControl} from '@angular/forms';
import {Subscription} from 'rxjs';

@Component({
  selector: 'lib-form-fields',
  templateUrl: './form-fields.component.html',
  styleUrls: ['./form-fields.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldsComponent implements OnInit, OnChanges, OnDestroy {
  hide = true;
  enumKindOfField = EnumKindOfField;
  enumInputType = EnumInputType;
  controls: {
    [key: string]: AbstractControl;
  };
  controlsView: any = {};
  @Input() formGroup: UIFormGroup;
  @Input() formConfiguration: Array<CommonFieldConfig>;
  private subscription: Subscription;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.checkRequired();
  }

  ngOnInit(): void {
    this.checkRequired();
    this.controls = this.formGroup.controls;
    console.log('FormFieldsComponent.ngOnInit');
    this.subscription = this.formGroup.viewModelManageEmitter.subscribe((change: ChangeViewModel) => {
      if (change.show || change.hide) {
        const controls = Object.assign({}, this.controlsView);
        if (change.hide) {
          for (const ctrlName of change.hide) {
            controls[ctrlName] = true;
          }
        }
        if (change.show) {
          for (const ctrlName of change.show) {
            delete controls[ctrlName];
          }
        }
        this.controlsView = controls;
      }
    });
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  checkRequired(): void {
    if ( !this.formGroup) {
      throw new TypeError('formConfiguration is required');
    }
    if (!this.formConfiguration) {
      throw new TypeError('formConfiguration is required');
    }
  }
  formControlByName(controlName: string): AbstractControl {
    return this.formGroup.get(controlName);
  }
}
