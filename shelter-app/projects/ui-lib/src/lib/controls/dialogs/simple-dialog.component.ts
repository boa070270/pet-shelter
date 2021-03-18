import {Component, Inject, OnDestroy, ViewChild} from '@angular/core';
import {SystemLang} from '../../i18n';
import {ActionType, DictionaryService, ExtendedData, I18NType, SwaggerObject} from '../../shared';
import {SwaggerFormComponent} from '../swagger-form/swagger-form.component';
import {Subscription} from 'rxjs';
import {AbstractComponent} from '../abstract.component';
import {CdkDialogContainer, DIALOG_DATA, DialogRef} from '../../dialog-service';

const I18N: I18NType = {
  DEF_TITLE_OK: [{lang: 'en', title: 'Ok'}, {lang: 'uk', title: 'Tak'}],
  DEF_TITLE_CANCEL: [{lang: 'en', title: 'Cancel'}, {lang: 'uk', title: 'Відміна'}],
  DEF_TITLE_YES: [{lang: 'en', title: 'Yes'}, {lang: 'uk', title: 'Tak'}],
  DEF_TITLE_NO: [{lang: 'en', title: 'No'}, {lang: 'uk', title: 'Ні'}],
  DEF_TITLE_SAVE: [{lang: 'en', title: 'Save'}, {lang: 'uk', title: 'Зберегти'}]
};

@Component({
  selector: 'lib-simple-dialog',
  templateUrl: './simple-dialog.component.html',
  styleUrls: ['./simple-dialog.component.scss']
})
export class SimpleDialogComponent extends AbstractComponent implements OnDestroy {
  needActionBlk: boolean;
  action: ActionType;
  swagger: SwaggerObject;
  data: any;
  caption: string;
  btnOk: string;
  btnCancel: string;
  iconClasses: any;
  dialogBorderClass: string;
  disabled: boolean;
  @ViewChild(SwaggerFormComponent) form: SwaggerFormComponent;
  private subscription: Subscription;

  constructor(protected dialogRef: DialogRef<any>,
              protected dialogContainer: CdkDialogContainer,
              @Inject(DIALOG_DATA) protected dialogData: any,
              public systemLang: SystemLang,
              protected dictionary: DictionaryService) {
    super(systemLang, dictionary.getLibDictionary('SimpleDialogComponent', I18N));
    this.needActionBlk = dialogRef.disableClose;
    if (dialogData instanceof ExtendedData) {
      this.needActionBlk = !!dialogData.action;
      this.swagger = dialogData.swagger;
      this.data = dialogData.data;
      this.caption = dialogData.caption;
      this.action = dialogData.action;
      this.disabled = dialogData.readOnly;
      this.iconClasses = {};
      this.dialogBorderClass = 'border-dialog';
      if (dialogData.icon) {
        this.iconClasses[dialogData.icon] = true;
      }
      if (dialogData.iconColor) {
        this.iconClasses[dialogData.iconColor] = true;
        this.dialogBorderClass = 'border-' + dialogData.iconColor;
      }
    } else {
      this.data = dialogData;
    }
    this.prepareTitle();
    this.subscription = this.systemLang.onChange().subscribe(v => {
      if (typeof v === 'string') {
        this.prepareTitle();
      }
    });
  }

  ngOnDestroy(): void {
      this.subscription.unsubscribe();
  }
  prepareTitle(): void {
    switch (this.action) {
      case 'ok_cancel':
        this.btnCancel = this.i18n.DEF_TITLE_CANCEL;
        this.btnOk = this.i18n.DEF_TITLE_OK;
        break;
      case 'save_cancel':
        this.btnCancel = this.i18n.DEF_TITLE_CANCEL;
        this.btnOk = this.i18n.DEF_TITLE_SAVE;
        break;
      case 'yes_no':
        this.btnCancel = this.i18n.DEF_TITLE_NO;
        this.btnOk = this.i18n.DEF_TITLE_YES;
        break;
      default:
        this.btnOk = this.i18n.DEF_TITLE_OK;
    }
  }
  cancel(): void {
    this.dialogRef.close();
  }
  save(): void {
    if (this.swagger) {
      if (this.form.formGroup.valid || this.form.formGroup.disabled) {
        console.log('SimpleDialogComponent.save', this.form.formGroup.value);
        this.dialogRef.close(this.form.formGroup.getRawValue());
      }
    } else {
      this.dialogRef.close('ok');
    }
  }
}
