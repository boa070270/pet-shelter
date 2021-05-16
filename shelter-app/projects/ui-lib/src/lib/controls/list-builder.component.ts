import {
  Component,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {SelectControlComponent} from './select-control.component';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {coerceArray} from '@angular/cdk/coercion';
import {ListSelectComponent} from './list-select.component';
import {BaseComponent} from './base.component';
import {I18N_CFG, TitleType} from '../shared';
import {CheckboxParameters} from './checkbox-control.component';

export const LIST_BUILDER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ListBuilderComponent),
  multi: true
};

const I18N = {
  REMOVE_TITLES: [{lang: 'en', title: 'Remove'}, {lang: 'uk', title: 'Видалити'}],
  ADD_TITLES: [{lang: 'en', title: 'Add'}, {lang: 'uk', title: 'Добавити'}],
  UP_TITLES: [{lang: 'en', title: 'Up'}, {lang: 'uk', title: 'Вгору'}],
  DOWN_TITLES: [{lang: 'en', title: 'Down'}, {lang: 'uk', title: 'Вниз'}]
};

@Component({
  selector: 'lib-list-builder',
  templateUrl: './list-builder.component.html',
  styleUrls: ['./checkbox-control.component.scss'],
  providers: [
    LIST_BUILDER_VALUE_ACCESSOR,
    {provide: I18N_CFG, useValue: I18N}
  ]
})
export class ListBuilderComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {

  private _extraParams: CheckboxParameters = {};
  availableList: string[] = [];
  resultList: string[] = [];
  titleRemove: string;
  titleAdd: string;
  titleUp: string;
  titleDown: string;
  @Input()
  set extraParams(p: CheckboxParameters) {
    this._extraParams = p || {};
  }
  get extraParams(): CheckboxParameters {
    if (!this._extraParams) {
      this._extraParams = {};
    }
    return this._extraParams;
  }
  @Input()
  set options(p: string[]) {
    this.extraParams.options = p;
  }
  get options(): string[] {
    if (!this.extraParams.options) {
      this.extraParams.options = [];
    }
    return this.extraParams.options;
  }
  @Input()
  set titles(p: {[key: string]: string} | TitleType[]) {
    this.extraParams.titles = p;
  }
  get titles(): {[key: string]: string} | TitleType[] {
    return this.extraParams.titles || null;
  }
  @Input()
  set tooltips(p: string[] | TitleType[]) {
    this.extraParams.tooltips = p;
  }
  get tooltips(): string[] | TitleType[] {
    return this.extraParams.tooltips || null;
  }

  @ViewChild(SelectControlComponent, {static: true}) available: SelectControlComponent;
  @ViewChild(ListSelectComponent, {static: true}) result: ListSelectComponent;

  constructor(protected _view: ViewContainerRef) {
    super(_view);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.buttonTitles();
    this.availableList = this.options.sort();
    this.result.setDisabledState(this.disabled);
    this.available.setDisabledState(this.disabled);
  }
  onChangeLang(): void {
    super.onChangeLang();
    this.buttonTitles();
  }
  buttonTitles(): void {
    this.titleAdd = this.i18n.ADD_TITLES;
    this.titleRemove = this.i18n.REMOVE_TITLES;
    this.titleDown = this.i18n.DOWN_TITLES;
    this.titleUp = this.i18n.UP_TITLES;
  }
  render(): void {
    this.availableList = this.options.filter( v => !this.resultList.includes(v)).sort();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.resultList) {
      this.resultList = [];
    }
    super.ngOnChanges(changes);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
  writeValue(obj: any): void {
    if (obj !== null && obj !== undefined) {
      this.resultList = coerceArray(obj) || [];
    }
    this.render();
  }
  registerOnChange(fn: (_: any) => {}): void {
    super.registerOnChange(fn);
  }
  registerOnTouched(fn: any): void {
    super.registerOnTouched(fn);
  }
  setDisabledState(isDisabled: boolean): void {
    super.setDisabledState(isDisabled);
    this.result.setDisabledState(isDisabled);
    this.available.setDisabledState(isDisabled);
  }

  onAdd(): void {
    this.resultList = this.resultList.concat(this.availableList.filter(v => this.available.values[v]));
    this.available.clearAll();
    this.render();
    this.emitChange(this.resultList);
  }

  onRemove(): void {
    this.resultList = this.resultList.filter(v => !this.result.values[v]);
    this.result.clearAll();
    this.render();
    this.emitChange(this.resultList);
  }

  onUp(): void {
    this.shift(-1);
    this.emitChange(this.resultList);
  }

  onDown(): void {
    this.shift(1);
    this.emitChange(this.resultList);
  }

  shift(pos: number): void {
    if (pos === 0) {
      return;
    }
    let list = this.resultList.filter(v => this.result.values[v]);
    if (pos > 0) {
      list = list.reverse();
    }
    for (const o of list) {
      const inx = this.resultList.indexOf(o);
      const newPos = inx + pos;
      if (newPos >= 0 && newPos < this.resultList.length && !list.includes(this.resultList[newPos])) {
        const x = this.resultList[newPos];
        this.resultList[newPos] = o;
        this.resultList[inx] = x;
      }
    }
  }
}
