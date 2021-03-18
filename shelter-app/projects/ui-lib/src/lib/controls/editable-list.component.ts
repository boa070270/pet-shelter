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
  list: string[] = [];
  selected: string;
  titleRemove: string;
  titleAdd: string;
  titleEdit: string;
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

  @ViewChild(ListSelectComponent, {static: true}) result: ListSelectComponent;

  constructor(public systemLang: SystemLang, protected directionality: Directionality,
              private dialogService: DialogService, dictionary: DictionaryService) {
    super(systemLang, directionality, dictionary.getLibDictionary('EditableListComponent', I18N));
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
  render(): void { // changed
    // this.list = this.options;
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
  writeValue(obj: any): void {
    if (obj !== null && obj !== undefined) {
      this.list = coerceArray(obj) || [];
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
  }

  hasEmpty(): boolean {
    return !!this.list.includes('');
  }

  onAdd(): void {
    this.openDialog((v) => {
      this.list.push(v.name);
    });
  }

  onEdit(): void {
    this.openDialog((v) => {
      this.list.push(v.name);
    }, this.selected);
  }

  openDialog(f, data?): void {
    const extData = new ExtendedData();
    extData.action = 'save_cancel';
    extData.caption = 'Please provide key name!';
    extData.icon = 'gm-warning';
    extData.swagger = new SwaggerObject(
      ['name'],
      {
        name: SwaggerNative.asString('input', null, swaggerUI([{lang: 'en', title: 'Key name'}, {lang: 'uk', title: 'Назва ключа'}])),
      },
      null,
      ['name']);
    if (data) {
      extData.data = {name: data};
    }
    const dialogRef = this.dialogService.warnExtDialog(extData, true);
    dialogRef.afterClosed().subscribe(v => {
      if (v) {
        f(v);
      }
      this.render();
      this.emitChange(this.list);
    });
  }

  onRemove(): void {
    this.list = this.list.filter(v => !this.result.values[v]);
    this.result.clearAll();
    this.render();
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
