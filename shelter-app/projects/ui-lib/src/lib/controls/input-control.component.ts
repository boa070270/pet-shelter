import {Component, ElementRef, forwardRef, Input, OnChanges, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SystemLang} from '../i18n';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {Directionality} from '@angular/cdk/bidi';
import {TextareaControlComponent, TextareaParameters} from './textarea-control.component';
import {RootPageService} from "../shared/root-page.service";

export const INPUT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => InputControlComponent),
  multi: true
};
export interface InputParameters extends TextareaParameters {
  type?: string;
  formTarget?: string;
  formAction?: string;
  formNoValidate?: boolean;
  formMethod?: string;
  formEnctype?: string;
}
@Component({
  selector: 'lib-input-control',
  templateUrl: './input-control.component.html',
  styleUrls: ['./input-control.component.scss'],
  providers: [INPUT_VALUE_ACCESSOR]
})
export class InputControlComponent extends TextareaControlComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  @Input()
  set extraParams(p: InputParameters) {
    this._extraParams = p || {};
  }
  get extraParams(): InputParameters {
    if (!this._extraParams) {
      this._extraParams = {};
    }
    return this._extraParams;
  }
  @Input()
  get type(): string {
    return this.extraParams.type || 'text';
  }
  set type(p: string) {
    this.extraParams.type = p;
  }
  @Input()
  set formTarget(p: string) {
    this.extraParams.formTarget = p;
  }
  get formTarget(): string {
    return this.extraParams.formTarget || null;
  }
  @Input()
  set formAction(p: string) {
    this.extraParams.formAction = p;
  }
  get formAction(): string {
    return this.extraParams.formAction || null;
  }
  @Input()
  set formNoValidate(p: boolean) {
    this.extraParams.formNoValidate = p;
  }
  get formNoValidate(): boolean {
    return this.extraParams.formNoValidate || null;
  }
  @Input()
  set formMethod(p: string) {
    this.extraParams.formMethod = p;
  }
  get formMethod(): string {
    return this.extraParams.formMethod || null;
  }
  @Input()
  set formEnctype(p: string) {
    this.extraParams.formEnctype = p;
  }
  get formEnctype(): string {
    return this.extraParams.formEnctype;
  }
  @ViewChild('input', {static: true}) input: ElementRef<HTMLInputElement>;
  constructor(public systemLang: SystemLang, protected directionality: Directionality, protected rootPage: RootPageService) {
    super(systemLang, directionality, rootPage);
  }

}
