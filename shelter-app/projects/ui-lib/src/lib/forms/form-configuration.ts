import {
  AbstractControl,
  AbstractControlOptions,
  AsyncValidatorFn,
  FormArray,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {Subject, Subscription} from 'rxjs';

export interface ChangeViewModel {
  hide?: Array<string>;
  show?: Array<string>;
  disable?: Array<string>;
  enable?: Array<string>;
}
export type ViewModelManage = (value: any) => ChangeViewModel;

export interface AnyKeyString {
  [key: string]: string;
}
export enum EnumKindOfField {
  input, textarea, select, radiobutton, checkbox, datepicker, group, boolean
}
export enum EnumInputType {
  color, date, 'datetime-local', email, month, number, password, search, tel, text, time, url, week
}
export interface CommonFieldConfig {
  appearance: string;
  title: string;
  kindOfField: EnumKindOfField;
  controlName: string;
  type?: EnumInputType;
  placeholder?: string;
  iconName?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  required?: boolean;
  options?: Array<SelectOption> | Array<string>;
  multiple?: boolean;
  matFormFieldClass?: string | string[];
  group: Array<CommonFieldConfig>;
  validationMessages?: Array<{type: string, massage: (v: any) => string}>;
}
export interface SelectOption {
  name: string;
  value: string;
}
export interface SwitchOption {
  name: string;
  value: boolean;
}

/*
 * Input
 */
export interface AbstractControlConfiguration {
  kindOf: EnumKindOfField;
  defaultValue?: any;
  immutable?: boolean;
  disabled?: boolean;
  required?: boolean;
  validatorOrOpts?: ValidatorFn | ValidatorFn[];
  asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[];
  updateOn?: 'change' | 'blur' | 'submit';
}
export interface FormFieldConfiguration {
  required?: boolean; // deprecated
  immutable?: boolean; // deprecated
  controlName: string;
  title: string;
  placeholder?: string;
  iconName?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  multiple?: boolean; // only for select, allow multiple
  matFormFieldClass?: string | string[];
  errorMessages?: AnyKeyString;
  // tslint:disable-next-line:max-line-length
  formControl: AbstractControlConfiguration;
  group?: Array<FormFieldConfiguration>; // TODO Is this field need?
  viewModelManage?: ViewModelManage;
}
export interface GroupControlConfiguration extends AbstractControlConfiguration {
  kindOf: EnumKindOfField.group;
}
export interface InputFieldConfiguration extends AbstractControlConfiguration {
  kindOf: EnumKindOfField.input;
  defaultValue?: string | null;
  inputType?: EnumInputType;
}
export interface TextareaFieldConfiguration extends AbstractControlConfiguration {
  kindOf: EnumKindOfField.textarea;
  defaultValue?: string | number | boolean | null;
}
export interface SelectFieldConfiguration extends AbstractControlConfiguration {
  kindOf: EnumKindOfField.select;
  options: Array<SelectOption>;
  defaultValue?: string | null;
  multiple: boolean;
}
export interface RadiobuttonFieldConfiguration extends AbstractControlConfiguration {
  kindOf: EnumKindOfField.radiobutton;
  options: Array<SelectOption>;
  defaultValue?: string | null;
}
export interface CheckboxFieldConfiguration extends AbstractControlConfiguration {
  kindOf: EnumKindOfField.checkbox;
  options: Array<string>;
  defaultValue?: Array<string>;
}
export interface DatepickerFieldConfiguration extends AbstractControlConfiguration {
  kindOf: EnumKindOfField.datepicker;
  defaultValue?: string | null;
}
export interface BooleanFieldConfiguration extends AbstractControlConfiguration {
  kindOf: EnumKindOfField.boolean;
  defaultValue?: boolean | null;
}
export class BuilderFieldControlConfiguration {
  static groupControlConfiguration(  validatorOrOpts?: ValidatorFn | ValidatorFn[],
                                     asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[]): GroupControlConfiguration {
    return { kindOf: EnumKindOfField.group, validatorOrOpts, asyncValidator };
  }
  static inputFieldConfiguration(  inputType: EnumInputType,
                                   defaultValue: string | null = '',
                                   validatorOrOpts?: ValidatorFn | ValidatorFn[],
                                   asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[]): InputFieldConfiguration {
    return { kindOf: EnumKindOfField.input, defaultValue, inputType, validatorOrOpts, asyncValidator };
  }
  static textareaFieldConfiguration(defaultValue: string | null = '',
                                    validatorOrOpts?: ValidatorFn | ValidatorFn[],
                                    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[]): TextareaFieldConfiguration {
    return { kindOf: EnumKindOfField.textarea, defaultValue, validatorOrOpts, asyncValidator };
  }
  static selectFieldConfiguration(options: Array<SelectOption>,
                                  defaultValue: string | null = '',
                                  multiple: boolean = false,
                                  validatorOrOpts?: ValidatorFn | ValidatorFn[],
                                  asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[]): SelectFieldConfiguration {
    return { kindOf: EnumKindOfField.select, defaultValue, options, validatorOrOpts, asyncValidator, multiple };
  }
  static radiobuttonFieldConfiguration(options: Array<SelectOption>,
                                       defaultValue: string | null = '',
                                       validatorOrOpts?: ValidatorFn | ValidatorFn[],
                                       asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[]): RadiobuttonFieldConfiguration {
    return { kindOf: EnumKindOfField.radiobutton, defaultValue, validatorOrOpts, asyncValidator, options };
  }
  static checkboxFieldConfiguration(options: Array<string>,
                                    defaultValue: Array<string>,
                                    validatorOrOpts?: ValidatorFn | ValidatorFn[],
                                    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[]): CheckboxFieldConfiguration {
    return { kindOf: EnumKindOfField.checkbox, defaultValue, validatorOrOpts, asyncValidator, options };
  }
  static booleanFieldConfiguration(defaultValue: boolean,
                                   validatorOrOpts?: ValidatorFn | ValidatorFn[],
                                   asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[]): BooleanFieldConfiguration {
    return { kindOf: EnumKindOfField.boolean, defaultValue, validatorOrOpts, asyncValidator };
  }
}
export type FunctionMap<T, R> = (r: T) => R;
export interface ViewModelManager {
  registerViewModelManage(fn: ViewModelManage): void;
}
export interface FormOptions<T> {
    /**
     *
     */
  converterToForm?: FunctionMap<T, any>;
  converterFromForm?: FunctionMap<any, T>;
  readonly: boolean;
  formClass?: string | string[];
  appearance?: 'legacy' | 'standard' | 'fill' | 'outline';
  viewModelManage?: ViewModelManage;
}
export interface FormConfiguration<T> {
  controls: Array<FormFieldConfiguration>;
  options: FormOptions<T>;
}
export interface FormDialogConfiguration<T> {
  configuration: FormConfiguration<T>;
  data: any;
}

export interface FormGroupOrControl {
  children: FormControlCollections;
  control: AbstractControl;
}
export interface FormControlCollections {
  [key: string]: FormGroupOrControl;
}

interface ResultPrepare {
  formConfiguration: Array<CommonFieldConfig>;
  formControlCollections: FormControlCollections;
  // defaultValue: any;
}
export interface ResultOfConverter {
  formConfiguration: Array<CommonFieldConfig>;
  formGroup: FormGroup;
  // defaultValue: any;
}

export function convertToInternal(configuration: FormConfiguration<any>): ResultOfConverter {
  function prepare(controls: Array<FormFieldConfiguration>): ResultPrepare {
    const appearance = configuration.options.appearance;
    const result: ResultPrepare = {
      formConfiguration: [],
      formControlCollections: {},
    };
    for (const cfg of controls) {
      const controlName = cfg.controlName;
      if (result.formControlCollections[controlName]) {
        throw new Error(`Incorrect configuration, duplicate field: ${controlName}`);
      }
      const kindOfField = cfg.formControl.kindOf;
      const fld: CommonFieldConfig = {
        appearance,
        title: cfg.title,
        controlName,
        kindOfField,
        group: [],
        suffix: cfg.suffix,
        prefix: cfg.prefix,
        placeholder: cfg.placeholder,
        iconName: cfg.iconName,
        hint: cfg.hint,
        type: null,
        options: null,
        required: cfg.formControl.required,
        matFormFieldClass: cfg.matFormFieldClass
      };
      result.formConfiguration.push(fld);
      if (kindOfField !== EnumKindOfField.group) {
        let control: AbstractControl;
        // let defaultValue;
        switch (kindOfField) {
          case EnumKindOfField.input:
            const inputCfg = (cfg.formControl as InputFieldConfiguration);
            control = new UIFormControl(inputCfg);
            fld.type = inputCfg.inputType;
            break;
          case EnumKindOfField.select:
            const selectCfg = (cfg.formControl as SelectFieldConfiguration);
            control = new UIFormControl(selectCfg);
            fld.options = selectCfg.options;
            fld.multiple = selectCfg.multiple;
            break;
          case EnumKindOfField.textarea:
            control = new UIFormControl(cfg.formControl);
            break;
          case EnumKindOfField.datepicker:
            control = new UIFormControl(cfg.formControl);
            break;
          case EnumKindOfField.checkbox:
            const chkCfg = (cfg.formControl as CheckboxFieldConfiguration);
            fld.options = chkCfg.options;
            control = new UIFormControl(chkCfg);
            break;
          case EnumKindOfField.radiobutton:
            control = new UIFormControl(cfg.formControl);
            break;
          case EnumKindOfField.boolean:
            control = new UIFormControl(cfg.formControl);
            break;
        }
        if (cfg.viewModelManage) {
          (control as any).registerViewModelManage(cfg.viewModelManage);
        }
        result.formControlCollections[controlName] = {
          control,
          children: null
        };
      } else {
        const {formConfiguration, formControlCollections, defaultValue} = this.prepare(cfg.group);
        fld.group = formConfiguration;
        result.formControlCollections[controlName] = {
          control: this.buildFormGroup(formControlCollections, cfg),
          children: formControlCollections
        };
      }
    }
    return result;
  }
  function buildFormGroup(formControlCollections: FormControlCollections, cfg?: FormFieldConfiguration): UIFormGroup {
    const controls = {};
    for (const key in formControlCollections) {
      if (formControlCollections.hasOwnProperty(key)) {
        controls[key] = formControlCollections[key].control;
      }
    }
    const control = new UIFormGroup(controls);
    if (cfg && cfg.viewModelManage) {
      control.registerViewModelManage(cfg.viewModelManage);
    }
    return control;
  }

  const resultPrepare = prepare(configuration.controls);
  const formGroup = buildFormGroup(resultPrepare.formControlCollections);
  if(configuration.options.readonly) {
    formGroup.disable();
  }
  if (configuration.options && configuration.options.viewModelManage) {
    formGroup.registerViewModelManage(configuration.options.viewModelManage);
  }
  return {
    formConfiguration: resultPrepare.formConfiguration,
    formGroup
  };
}
function isEmpty(value: any): boolean {
  return value === undefined || value === null || isNaN(value) || value === '';
}
export function manageViewModel(controls: any, changeViewModel: ChangeViewModel): void {
  if (typeof controls === 'object') {
    if (changeViewModel.disable) {
      for (const ctrlName of changeViewModel.disable) {
        if (controls[ctrlName]) {
          (controls[ctrlName] as AbstractControl).disable({onlySelf: true, emitEvent: false});
        }
      }
    }
    if (changeViewModel.enable) {
      for (const ctrlName of changeViewModel.enable) {
        if (controls[ctrlName]) {
          controls[ctrlName].enable({onlySelf: true, emitEvent: false});
        }
      }
    }
  }
}
function prepareFormState(uiConf: AbstractControlConfiguration): any {
  if (uiConf.disabled !== undefined) {
    return {value: uiConf.defaultValue, disabled: uiConf.disabled};
  }
  return uiConf.defaultValue;
}
function prepareAbstractControlOptions(uiConf: AbstractControlConfiguration): AbstractControlOptions {
  const res = {validators: uiConf.validatorOrOpts, asyncValidators: uiConf.asyncValidator, updateOn: uiConf.updateOn};
  if (uiConf.required) {
    if (res.validators) {
      if (Array.isArray(res.validators)) {
        if (!res.validators.includes(Validators.required)){
          res.validators.push(Validators.required);
        }
      } else if (res.validators !== Validators.required) {
        const v = res.validators;
        res.validators = [v, Validators.required];
      }
    } else {
      res.validators = Validators.required;
    }
  }
  return res;
}
export class UIFormControl extends FormControl implements ViewModelManager {
  viewModelManage: ViewModelManage;

  constructor(private uiConf: AbstractControlConfiguration) {
    super(prepareFormState(uiConf), prepareAbstractControlOptions(uiConf));
  }
  registerViewModelManage(fn: ViewModelManage): void {
    this.viewModelManage = fn;
  }
  setValue(value: any,
           options?: {
            onlySelf?: boolean; emitEvent?: boolean; emitModelToViewChange?: boolean; emitViewToModelChange?: boolean
           }): void {
    super.setValue(value, options);
    if (this.pristine && this.value !== this.uiConf.defaultValue && !isEmpty(value)) {
      this.disable({emitEvent: false, onlySelf: true});
    }
    if (this.viewModelManage) {
      const result = this.viewModelManage(value);
      if (result) {
        manageViewModel(this.parent.controls, result);
        (this.parent as UIFormGroup).viewModelManageEmitter.emit(result);
      }
    }
  }
}
function prepareFormStateForArray(uiConf: AbstractControlConfiguration): AbstractControl[] {
  const res: AbstractControl[] = [];
  if (uiConf.kindOf === EnumKindOfField.checkbox) {
    const chkCfg = (uiConf as CheckboxFieldConfiguration);
    if (chkCfg.options && chkCfg.options.length) {
      for (let i = 0; i < chkCfg.options.length; i++) {
        const value = chkCfg.defaultValue ? !!chkCfg.defaultValue[i] : false;
        res.push(new FormControl({value, disabled: chkCfg.disabled}));
      }
    }
  } else {
    throw new Error('Use UIFormArray with checkboxes only');
  }
  return res;
}
export class UIFormArray extends FormArray implements ViewModelManager {
  viewModelManage: ViewModelManage;
  static prepareFormStateForArray(uiConf: AbstractControlConfiguration): AbstractControl[]{
    return [];
  }
  constructor(private uiConf: AbstractControlConfiguration) {
    super(prepareFormStateForArray(uiConf), prepareAbstractControlOptions(uiConf));
  }
  registerViewModelManage(fn: ViewModelManage): void {
    this.viewModelManage = fn;
  }
  setValue(value: any[], options?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void {
    super.setValue(value, options);
    if (this.viewModelManage) {
      const result = this.viewModelManage(value);
      if (result) {
        manageViewModel(this.parent.controls, result);
        (this.parent as UIFormGroup).viewModelManageEmitter.emit(result);
      }
    }
  }
}
export class UIEventEmitter<T> extends Subject<T> {
  value: T;
  emit(value?: T): void {
    const { observers } = this;
    if ( observers.length > 0 ) {
      super.next(value);
    } else {
      this.value = value;
    }
  }
  subscribe(next?: any, error?: any, complete?: any): Subscription {
    const fn = (v: any) => { next(v); };
    const sink = super.subscribe(fn);
    const value = this.value;
    if ( value !== undefined ) {
      this.value = undefined;
      this.emit(value);
    }
    return sink;
  }
}
export class UIFormGroup extends FormGroup implements ViewModelManager {
  viewModelManage: ViewModelManage;
  viewModelManageEmitter: UIEventEmitter<ChangeViewModel> = new UIEventEmitter<ChangeViewModel>();

  registerViewModelManage(fn: ViewModelManage): void {
    this.viewModelManage = fn;
  }
  setValue(value: { [p: string]: any }, options?: { onlySelf?: boolean; emitEvent?: boolean }): void {
    super.setValue(value, options);
    if (this.viewModelManage) {
      const result = this.viewModelManage(value);
      if (result) {
        manageViewModel(this.controls, result);
        this.viewModelManageEmitter.emit(result);
      }
    }
  }
}
