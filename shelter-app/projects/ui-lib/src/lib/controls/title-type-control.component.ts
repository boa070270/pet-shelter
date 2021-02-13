import {Component, forwardRef, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {SystemLang} from '../i18n';
import {BaseComponent} from './base.component';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {TitleType} from '../shared';
import {Directionality} from '@angular/cdk/bidi';

const TITLE_CTRL = [{id: 'b0', lang: 'uk', title: 'Багатомовність'}, {id: 'b0', lang: 'en', title: 'Multi language'}];
@Component({
  selector: 'lib-title-type-control',
  template: `
      <lib-boolean-control name="ctl" [titles]="ctrlTitles" [(ngModel)]="ctrl"></lib-boolean-control>
      <lib-input-control name="str" [(ngModel)]="str" *ngIf="!ctrl" [caption]="pCaption"></lib-input-control>
      <div *ngIf="ctrl">
        <lib-input-control *ngFor="let t of titles" name="{{t.lang}}" type="text" [placeholder]="t.title" [caption]="pCaption"></lib-input-control>
      </div>
      <span *ngIf="pHint">{{pHint}}</span>
  `,
  styleUrls: ['./title-type-control.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TitleTypeControlComponent),
    multi: true
  }]
})
export class TitleTypeControlComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {
  ctrlTitles: TitleType[] = TITLE_CTRL;
  ctrl: boolean;
  str: string;
  titles: TitleType[] = [];

  constructor(public systemLang: SystemLang, protected directionality: Directionality) {
    super(systemLang, directionality);
    systemLang.getLanguages().forEach(l => {
      this.titles.push({id: '', title: l.displayName, lang: l.lang});
    });
  }

  ngOnInit(): void {
  }

  onChangeLang(): void {
    super.onChangeLang();
  }

  registerOnChange(fn: any): void {
    this.change = fn;
  }

  registerOnTouched(fn: any): void {
  }
  setDisabledState(isDisabled: boolean): void {
  }

  writeValue(obj: any): void {
    if (typeof obj === 'string') {
      this.ctrl = false;
    }
  }
}
