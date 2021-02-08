import {Component, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {SystemLang} from '../i18n';
import {BaseComponent} from './base.component';
import {ControlValueAccessor} from '@angular/forms';
import {TitleType} from '../shared';

@Component({
  selector: 'lib-title-type-control',
  template: `
      <lib-boolean-control name="ctl" [titles]="ctrlTitles" [dir]="dir" [(ngModel)]="ctrl"></lib-boolean-control>
      <lib-input-control name="str" [(ngModel)]="str" [dir]="dir" *ngIf="!ctrl" [caption]="pCaption"></lib-input-control>
      <div *ngIf="ctrl">
        <lib-input-control *ngFor="let t of titles" name="{{t.lang}}" [dir]="dir" type="text" [placeholder]="t.title" [caption]="pCaption"></lib-input-control>
      </div>
      <span *ngIf="pHint">{{pHint}}</span>
  `,
  styleUrls: ['./title-type-control.component.css']
})
export class TitleTypeControlComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {
  ctrlTitles: TitleType[] = [{id: 'b0', lang: 'uk', title: 'Багатомовність'}, {id: 'b0', lang: 'en', title: 'Multi language'}];
  ctrl: boolean;
  str: string;
  titles: TitleType[] = [];

  constructor(public systemLang: SystemLang) {
    super(systemLang);
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
