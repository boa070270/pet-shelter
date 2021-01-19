import {Injectable, OnDestroy} from '@angular/core';
import {SystemLang} from 'ui-lib';
import {
  BannerType,
  FieldAndTitlesType,
  FieldTypeTypeEnum,
  MenuAndTitlesType, MenuTree,
  PageType, PageTypeRestrictionEnum,
  PetType
} from '../common/types';
import {BuilderFieldControlConfiguration, EnumInputType, FormConfiguration, SelectOption, FormFieldConfiguration} from 'ui-lib';
import {Subscription} from 'rxjs';
import {FieldsService} from '../fields.service';
import {SystemMenuService} from '../system-menu.service';

function asNumber(v: any): number {
  if (typeof v === 'number') {
    return v;
  }
  return undefined;
}
function asString(v: any): string {
  if (typeof v === 'string') {
    return v;
  }
  return undefined;
}
function asBoolean(v: any): boolean {
  if (typeof v === 'boolean') {
    return v;
  }
  return undefined;
}
function asObject(v: any): object {
  if (typeof v === 'object') {
    return v;
  }
  return undefined;
}
function asEnum<T>(v: any, e: any): T {
  if (e[v] !== undefined) {
    return e[v];
  }
  return undefined;
}

@Injectable({
  providedIn: 'root'
})
export class FormsConfigurationService implements OnDestroy {
  private subscriptions: Subscription;

  constructor(private systemLang: SystemLang, private fieldsService: FieldsService, private systemMenu: SystemMenuService) {}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  menuNewItem(): MenuAndTitlesType {
    const result: MenuAndTitlesType = {
      menu: {path: null, position: 0, parentId: null, component: null, role: null},
      titles: []
    };
    const languages = this.systemLang.getLanguages();
    for (const {lang} of languages) {
      result.titles.push({id: null, lang, title: null});
    }
    return result;
  }
  menuFormConfiguration(): FormConfiguration<MenuAndTitlesType> {
    const languages = this.systemLang.getLanguages();
    const formConfiguration: FormConfiguration<MenuAndTitlesType> = {
      options: {
        readonly: false,
        appearance: 'standard',
        converterToForm: (r: MenuAndTitlesType) => {
          const result = {
            path: r.menu.path,
            parentId: r.menu.parentId,
            component: r.menu.component,
            role: r.menu.role,
            position: r.menu.position
          };
          for (const {lang} of languages) {
            const title = r.titles.find(t => t.lang === lang);
            result[lang] = title ? title.title : '';
          }
          return result;
        },
        converterFromForm: (f) => {
          const result: MenuAndTitlesType = {
            menu: {
              path: asString(f.path),
              parentId: asString(f.parentId),
              component: asString(f.component),
              role: asString(f.role),
              position: asNumber(f.position)
            },
            titles: []
          };
          for (const {lang} of languages) {
            const title = f[lang];
            if (title) {
              result.titles.push({id: asString(f.path), lang, title});
            }
          }
          return result;
        },
          formClass: 'form-class'
      },
      controls: [
        {controlName: 'path', title: 'Path', required: true, immutable: true, placeholder: 'path', hint: 'path of resource',
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text)},
        {controlName: 'parentId', title: 'Parent', placeholder: 'path', hint: 'path of parent',
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text)},
        {controlName: 'component', title: 'Component', required: true, placeholder: 'SubMenuPage', hint: 'How page is rendered',
          formControl: BuilderFieldControlConfiguration.selectFieldConfiguration(
            [{name: 'EndMenuPage', value: 'EndMenuPage'}, {name: 'SubMenuPage', value: 'SubMenuPage'}])},
        {controlName: 'role', title: 'Role', placeholder: 'public', hint: 'Who can see this page',
          formControl: BuilderFieldControlConfiguration.selectFieldConfiguration(
            [{name: 'Public', value: 'public'}, {name: 'Admins', value: 'admin'}])},
        {controlName: 'position', title: 'Position', hint: 'Order in menu',
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.number)}
      ]
    };
    for (const l of languages) {
      formConfiguration.controls.push(
        {controlName: l.lang, title: l.displayName, placeholder: 'Title', hint: 'Title of menu',
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text)}
      );
    }
    return formConfiguration;
  }
  bannerNewItem(): BannerType {
    return {
      id: 'generated',
      score: 0,
      lang: '',
      ref: {refId: null, targetUrl: null, mimeType: null, tooltip: null}
    };
  }
  bannerFormConfiguration(): FormConfiguration<BannerType> {
    const selectLang = this.systemLang.getLanguages().map(v => ({name: v.displayName, value: v.lang}));
    return {
      options: {
        readonly: false,
        appearance: 'standard',
        formClass: 'form-class',
        converterToForm: (r: BannerType) => {
          return {
            id: r.id,
            score: r.score,
            lang: r.lang,
            refId: r.ref.refId,
            targetUrl: r.ref.targetUrl,
            tooltip: r.ref.tooltip
          };
        },
        converterFromForm: (r: any): BannerType => {
          return {
            id: asString(r.id),
            score: asNumber(r.score),
            lang: asString(r.lang),
            ref: {refId: asString(r.refId), targetUrl: asString(r.targetUrl), tooltip: asString(r.tooltip)}
          };
        }
      },
      controls: [
        {
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
          controlName: 'id',
          hint: 'Please, input id',
          title: 'Id',
          placeholder: 'There is unique id. This id will automatically generated',
          required: true,
          matFormFieldClass: 'field-class',
          immutable: true,
        },
        {
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
          controlName: 'score',
          hint: 'Please, input score',
          title: 'Score',
          placeholder: 'Define score to this banner',
          required: true,
          matFormFieldClass: 'field-class',
          immutable: false,
        },
        {
          formControl: BuilderFieldControlConfiguration.selectFieldConfiguration(selectLang),
          controlName: 'lang',
          hint: 'Select language',
          title: 'Lang',
          placeholder: 'Select language if need this restriction',
          required: false,
          matFormFieldClass: 'field-class',
          immutable: false,
        },
        {
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
          controlName: 'refId',
          hint: 'Please, input ref',
          title: 'RefId',
          placeholder: 'There is unique ref to already saved asset',
          required: true,
          matFormFieldClass: 'field-class',
          immutable: false,
        },
        {
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
          controlName: 'targetUrl',
          hint: 'Please, input target Url',
          title: 'Target Url',
          placeholder: 'There is reference URL',
          required: true,
          matFormFieldClass: 'field-class',
          immutable: false,
        },
        {
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
          controlName: 'tooltip',
          hint: 'Please, input tooltip',
          title: 'Tooltip',
          placeholder: 'There is tooltip',
          required: false,
          matFormFieldClass: 'field-class',
          immutable: false,
        },
      ]
    };
  }
  fieldNewItem(): FieldAndTitlesType {
    const result = {field: {name: '', type: null, subtype: null, enumValues: null, order: 0}, titles: []};
    const languages = this.systemLang.getLanguages();
    for (const {lang} of languages) {
      result.titles.push({id: null, lang, title: null});
    }
    return result;
  }
  fieldFormConfiguration(): FormConfiguration<FieldAndTitlesType> {
    const languages = this.systemLang.getLanguages();
    const formConfiguration: FormConfiguration<FieldAndTitlesType> = {
      options: {
        readonly: false,
        appearance: 'standard',
        formClass: 'form-class',
        converterToForm: (r: FieldAndTitlesType) => {
          const result = {
            name: r.field.name,
            type: r.field.type,
            subtype: r.field.subtype || null,
            enumValues: r.field.enumValues,
            order: r.field.order
          };
          for (const {lang} of languages) {
            const title = r.titles.find(t => t.lang === lang);
            result[lang] = title ? title.title : '';
          }
          return result;
        },
        converterFromForm: (r: any): FieldAndTitlesType => {
          const result = {
            field: {name: asString(r.name), type: asEnum<FieldTypeTypeEnum>(r.type, FieldTypeTypeEnum), subtype: asString(r.subtype),
              enumValues: asString(r.enumValues), order: asNumber(r.order)},
            titles: []
          };
          for (const {lang} of languages) {
            const title = r[lang];
            if (title) {
              result.titles.push({id: asString(r.name), lang, title});
            }
          }
          return result;
        }
      },
      controls: [
        {
          controlName: 'name',
          hint: 'Please, input field name',
          title: 'Field name',
          placeholder: 'There is unique field name',
          required: true,
          matFormFieldClass: 'field-class',
          immutable: true,
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
        },
        {
          controlName: 'order',
          hint: 'Please, input order of this field',
          title: 'Order',
          placeholder: 'The number defines the sequence displayed fields',
          required: true,
          matFormFieldClass: 'field-class',
          immutable: true,
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
        },
        {
          controlName: 'type', hint: 'Please, select field type', title: 'Field type',
          required: true, matFormFieldClass: 'field-class', immutable: true,
          formControl: BuilderFieldControlConfiguration.selectFieldConfiguration([
            {name: 'number', value: 'number'},
            {name: 'string', value: 'string'},
            {name: 'text', value: 'text'},
            {name: 'enum', value: 'enum'},
            {name: 'date', value: 'date'}
          ]),
          viewModelManage: value => {
            if (value === 'enum') {
              return {show: ['enumValues']};
            }
            return {hide: ['enumValues']};
          }
        },
        {
          controlName: 'subtype', hint: 'You can input subtype', title: 'Subtype', placeholder: '',
          required: false, matFormFieldClass: 'field-class', immutable: false,
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
        },
        {
          controlName: 'enumValues', hint: 'Define your enumeration', title: 'Enum value', placeholder: 'Enter words divided by comma',
          required: false, matFormFieldClass: 'field-class', immutable: false,
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
        },
      ]
    };
    for (const l of languages) {
      formConfiguration.controls.push(
        {
          controlName: l.lang, title: l.displayName, placeholder: 'Title', hint: 'Title of menu',
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text)
        });
    }
    return formConfiguration;
  }
  pageNewItem(): PageType {
    return {id: 'generated', lang: '', title: '', summary: '', body: '', score: 0, draft: false, tags: '',
      restriction: '', menuId: '', ref: []};
  }
  pageFormConfiguration(): FormConfiguration<PageType> {
    const selectLang = this.systemLang.getLanguages().map(v => ({name: v.displayName, value: v.lang}));
    const knownRoles = () => {
      const nameRestriction = [];
      for (const s of Object.getOwnPropertyNames(PageTypeRestrictionEnum)) {
        nameRestriction.push(s);
      }
      return nameRestriction;
    };
    return {
      options: {
        readonly: false,
        appearance: 'standard',
        formClass: 'form-class',
        converterToForm: r => {
          return {id: r.id, lang: r.lang, title: r.title, summary: r.summary, body: r.body, score: r.score,
            draft: [r.draft], tags: r.tags, restriction: r.restriction? r.restriction.split(',') : [], menuId: r.menuId};
        },
        converterFromForm: r => {
          const res = {
            id: asString(r.id), lang: asString(r.lang), title: asString(r.title),
            summary: asString(r.summary), body: asString(r.body), score: asNumber(r.score),
            draft: asBoolean(r.draft[0]), tags: asString(r.tags), restriction: r.restriction ? r.restriction.join(',') : '',
            menuId: asString(r.menuId), ref: []};
          // if (r.ref) {
          //   for (const {refId, targetUrl, mimeType, tooltip} of r.ref) {
          //     res.ref.push({refId, targetUrl, mimeType, tooltip});
          //   }
          // }
          return res;
        }
      },
      controls: [
        {
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
          controlName: 'id',
          hint: 'Please, input id',
          title: 'Id',
          placeholder: 'There is unique id',
          required: true,
          matFormFieldClass: 'field-class',
          immutable: true,
        },
        {
          formControl: BuilderFieldControlConfiguration.selectFieldConfiguration(selectLang),
          controlName: 'lang',
          hint: 'Please, input lang',
          title: 'Lang',
          placeholder: 'There is unique lang',
          required: true,
          matFormFieldClass: 'field-class',
          immutable: true,
        },
        {
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
          controlName: 'title',
          hint: 'Please, input title',
          title: 'Title',
          placeholder: 'There is unique title',
          required: true,
          matFormFieldClass: 'field-class',
          immutable: true,
        },
        {
          formControl: BuilderFieldControlConfiguration.textareaFieldConfiguration(),
          controlName: 'summary',
          hint: 'Please, input summary',
          title: 'Summary',
          placeholder: 'There is unique summary',
          required: true,
          matFormFieldClass: 'field-class',
          immutable: true,
        },
        {
          formControl: BuilderFieldControlConfiguration.textareaFieldConfiguration(),
          controlName: 'body',
          hint: 'Please, input body',
          title: 'Body',
          placeholder: 'There is unique body',
          required: true,
          matFormFieldClass: 'field-class',
          immutable: true,
        },
        {
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.number),
          controlName: 'score',
          hint: 'Please, input score',
          title: 'Score',
          placeholder: 'Define score to you page',
          required: true,
          matFormFieldClass: 'field-class',
          immutable: true,
        },
        {
          formControl: BuilderFieldControlConfiguration.booleanFieldConfiguration(false),
          controlName: 'draft',
          hint: 'Please, check draft',
          title: 'Draft',
          placeholder: 'Is this page a draft?',
          required: true,
          matFormFieldClass: 'field-class',
          immutable: true,
        },
        {
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
          controlName: 'tags',
          hint: 'Please, input tags',
          title: 'Tags',
          placeholder: 'Tags allows you link this page to menu',
          required: true,
          matFormFieldClass: 'field-class',
          immutable: true,
        },
        {
          formControl: BuilderFieldControlConfiguration.checkboxFieldConfiguration(knownRoles(), []),
          controlName: 'restriction',
          hint: 'Please, input restriction',
          title: 'Restriction',
          placeholder: 'There is unique restriction',
          required: true,
          matFormFieldClass: 'field-class',
          immutable: true,
        },
        {
          formControl: BuilderFieldControlConfiguration.selectFieldConfiguration(this.menuOptions(this.systemMenu.menuTree())),
          controlName: 'menuId',
          hint: 'Link to menu',
          title: 'Menu Id',
          placeholder: 'There link to menu',
          required: false,
          matFormFieldClass: 'field-class',
          immutable: false,
        },
      ]
    };
  }
  private menuOptions(menu: MenuTree[], parent: string = ''): SelectOption[] {
    const result: SelectOption[] = [];
    for (const m of menu) {
      const name = parent + '/' + m.title;
      result.push({name, value: m.path});
      if (m.menu && m.menu.length > 0) {
        const ch = this.menuOptions(m.menu, name);
        for (const c of ch) {
          result.push(c);
        }
      }
    }
    return result;
  }
  petNewItem(): PetType {
    const res: PetType = {id: 'generated', fields: [], ref: []};
    const fields = this.fieldsService.getFields();
    for (const {field} of fields) {
      res.fields.push({name: field.name, value: null});
    }
    return res;
  }
  petFormConfiguration(): FormConfiguration<PetType> {
    const allFields = this.fieldsService.getFields();
    const formConfiguration: FormConfiguration<PetType> = {
      options: {
      readonly: false,
          appearance: 'standard',
          formClass: 'form-class',
        converterToForm: r => {
          const res = {id: r.id};
          for (const {field} of allFields) {
            const f = r.fields.find( v => v.name === field.name);
            res[field.name] = f ? f.value : null;
          }
          return res;
        },
        converterFromForm: r => {
          const res: PetType = {id: asString(r.id), fields: [], ref: []};
          for (const {field} of allFields) {
            res.fields.push({name: field.name, value: asString(r[field.name])});
          }
          return res;
        }
      },
      controls: [
        {
          formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
          controlName: 'id',
          hint: 'Please, input id',
          title: 'Id',
          placeholder: 'There is unique id',
          required: true,
          matFormFieldClass: 'field-class',
          immutable: true,
        },
      ]
    };
    for (const field of allFields) {
      const title = this.systemLang.getTitle(field.titles);
      const control: FormFieldConfiguration = {
        formControl: undefined,
        controlName: field.field.name,
        hint: 'Please, input ' + title,
        title,
        matFormFieldClass: 'field-class'
      };
      switch (field.field.type) {
        case FieldTypeTypeEnum.date:
          control.formControl = BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.date);
          break;
        case FieldTypeTypeEnum.enum:
          const select = field.field.enumValues ? field.field.enumValues.split(',').map(v => ({name: v.trim(), value: v.trim()})) : [];
          control.formControl = BuilderFieldControlConfiguration.selectFieldConfiguration(select);
          break;
        case FieldTypeTypeEnum.number:
          control.formControl = BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.number);
          break;
        case FieldTypeTypeEnum.string:
          control.formControl = BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text);
          break;
        case FieldTypeTypeEnum.text:
          control.formControl = BuilderFieldControlConfiguration.textareaFieldConfiguration();
          break;
        default:
          throw new Error('Unknown field type: ' + field.field.type);
      }
      formConfiguration.controls.push(control);
    }

    return formConfiguration;
  }
}
