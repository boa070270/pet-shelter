import {Component, forwardRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {DictionaryService, ExtendedData, SwaggerNative, SwaggerObject, swaggerUI, TitleType} from '../shared';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BaseComponent} from './base.component';
import {SystemLang} from '../i18n';
import {Directionality} from '@angular/cdk/bidi';
import {CheckboxParameters} from './checkbox-control.component';
import {ListSelectComponent} from './list-select.component';
import {coerceArray} from '@angular/cdk/coercion';
import {DialogService} from '../dialog-service';
import { RootPageService } from '../shared/root-page.service';

const I18N = {
  DEF_REMOVE_TITLES: [{lang: 'en', title: 'Remove'}, {lang: 'uk', title: 'Видалити'}],
  DEF_ADD_TITLES: [{lang: 'en', title: 'Add'}, {lang: 'uk', title: 'Додати'}],
  DEF_EDIT_TITLES: [{lang: 'en', title: 'Edit'}, {lang: 'uk', title: 'Змінити'}],
  DEF_UP_TITLES: [{lang: 'en', title: 'Up'}, {lang: 'uk', title: 'Вгору'}],
  DEF_DOWN_TITLES: [{lang: 'en', title: 'Down'}, {lang: 'uk', title: 'Вниз'}]
};

export const EDITABLE_LIST_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => EditableListComponent),
  multi: true
};

@Component({
  selector: 'lib-editable-list',
  templateUrl: './editable-list.component.html',
  styleUrls: ['./checkbox-control.component.scss'],
  providers: [EDITABLE_LIST_VALUE_ACCESSOR]
})
export class EditableListComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {

  // tslint:disable-next-line:variable-name
  private _extraParams: CheckboxParameters = {};
  // TODO swaggerObject
  private _swagger: SwaggerNative | SwaggerObject;
  list: any[] = [];
  selected: string;
  titleRemove: string;
  titleAdd: string;
  titleEdit: string;
  titleUp: string;
  titleDown: string;
  @Input()
  set swagger(s: SwaggerNative | SwaggerObject) {
    this._swagger = s;
  }
  get swagger(): SwaggerNative | SwaggerObject {
    if (this._swagger) {
      return this._swagger;
    }
    return SwaggerNative.asString('input', null,
      swaggerUI([{lang: 'en', title: 'Value'}, {lang: 'uk', title: 'Значення елементу'}]));
  }
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
  get listSelect(): string[] {
    if (this.isNative()) {
      return this.list;
    }
    const a: string[] = [];
    this.list.forEach(o => {
      a.push(JSON.stringify(o).replace(/["{}]/g, ''));
    });
    return a;
  }
  get index(): number {
    return this.listSelect.indexOf(this.selected);
  }

  @ViewChild(ListSelectComponent, {static: true}) result: ListSelectComponent;

  constructor(public systemLang: SystemLang, protected directionality: Directionality,
              private dialogService: DialogService, dictionary: DictionaryService, protected rootPage: RootPageService) {
    super(systemLang, directionality, rootPage, dictionary.getLibDictionary('EditableListComponent', I18N));
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.buttonTitles();
    this.list = this.options;
    this.result.setDisabledState(this.disabled);

    this.result.registerOnChange(change => {
      this.selected = change;
      this.emitChange(change);
      return {};
    });
  }
  onChangeLang(): void {
    super.onChangeLang();
    this.buttonTitles();
  }
  buttonTitles(): void {
    this.titleAdd = this.i18n.DEF_ADD_TITLES;
    this.titleEdit = this.i18n.DEF_EDIT_TITLES;
    this.titleRemove = this.i18n.DEF_REMOVE_TITLES;
    this.titleDown = this.i18n.DEF_DOWN_TITLES;
    this.titleUp = this.i18n.DEF_UP_TITLES;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.list) {
      this.list = [];
    }
    super.ngOnChanges(changes);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
  writeValue(v: any): void {
    if (Array.isArray(v)) {
      console.log('EditableListComponent.writeValue', v);
      this.list = v;
    }
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
  }

  hasEmpty(): boolean {
    return !!this.listSelect.includes('');
  }

  isNative(): boolean {
    return this.swagger instanceof SwaggerNative;
  }

  onAdd(): void {
    this.openDialog((v) => {
      if (this.isNative()) {
        this.list.push(v.name);
      } else {
        console.log('EditableListComponent.onAdd', v);
        this.list.push(v);
      }
    });
  }

  onEdit(): void {
    this.openDialog((v) => {
      if (this.isNative()) {
        for (let i = 0; i < this.list.length; i++) {
          this.list[i] = this.list[i] === this.selected ? v.name : this.list[i];
        }
      } else {
        this.list[this.index] = v;
      }
    }, this.selected);
  }

  openDialog(f, data?): void {
    const extData = new ExtendedData();
    extData.action = 'save_cancel';
    if (this.isNative()) {
      extData.swagger = new SwaggerObject(
        ['name'],
        {
          name: this.swagger,
        },
        null,
        ['name']);
      if (data) {
        extData.data = {name: data};
      }
    } else {
      extData.swagger = this.swagger as SwaggerObject;
      if (data) {
        extData.data = this.list[this.index];
      }
    }
    const dialogRef = this.dialogService.warnExtDialog(extData, true);
    dialogRef.afterClosed().subscribe(v => {
      if (v) {
        f(v);
      }
      this.emitChange(this.list);
    });
  }

  onRemove(): void {
    if (this.isNative()) {
      this.list = this.list.filter(v => !this.result.values[v]);
    } else {
      this.list = this.list.filter(v => {
        return !this.result.values[JSON.stringify(v).replace(/["{}]/g, '')];
      });
    }
    this.result.clearAll();
    this.emitChange(this.list);
  }

  onUp(): void {
    this.shift(-1);
    this.emitChange(this.list);
  }

  onDown(): void {
    this.shift(1);
    this.emitChange(this.list);
  }

  shift(pos: number): void {
    if (pos === 0) {
      return;
    }
    let list = this.list.filter(v => this.result.values[v]);
    if (pos > 0) {
      list = list.reverse();
    }
    for (const o of list) {
      const inx = this.list.indexOf(o);
      const newPos = inx + pos;
      if (newPos >= 0 && newPos < this.list.length && !list.includes(this.list[newPos])) {
        const x = this.list[newPos];
        this.list[newPos] = o;
        this.list[inx] = x;
      }
    }
  }
}
