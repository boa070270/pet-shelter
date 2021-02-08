import {Component, Inject, Injector, OnDestroy, ViewChild} from '@angular/core';
import {CdkDialogContainer, DIALOG_DATA, DialogRef} from '@angular/cdk-experimental/dialog';
import {SystemLang} from '../i18n';
import {SwaggerObject, TitleType} from '../shared';
import {SwaggerFormComponent} from '../swagger-form';
import {Subscription} from 'rxjs';

export type ActionType = 'ok' | 'save_cancel' | 'yes_no';
const DEF_TITLE_OK: TitleType[] = [{lang: 'en', title: 'Ok'}, {lang: 'uk', title: 'Tak'}];
const DEF_TITLE_CANCEL: TitleType[] = [{lang: 'en', title: 'Cancel'}, {lang: 'uk', title: 'Відміна'}];
const DEF_TITLE_YES: TitleType[] = [{lang: 'en', title: 'Yes'}, {lang: 'uk', title: 'Tak'}];
const DEF_TITLE_NO: TitleType[] = [{lang: 'en', title: 'No'}, {lang: 'uk', title: 'Ні'}];
const DEF_TITLE_SAVE: TitleType[] = [{lang: 'en', title: 'Save'}, {lang: 'uk', title: 'Зберегти'}];

export class ExtendedData {
  data: any;
  action?: ActionType;
  swagger?: SwaggerObject;
  readOnly?: boolean;
  icon?: string;
  caption?: string;
}

@Component({
  selector: 'lib-simple-dialog',
  templateUrl: './simple-dialog.component.html',
  styleUrls: ['./simple-dialog.component.scss']
})
export class SimpleDialogComponent implements OnDestroy {
  needActionBlk: boolean;
  action: ActionType;
  swagger: SwaggerObject;
  data: any;
  icon: string;
  caption: string;
  btnOk: string;
  btnCancel: string;
  @ViewChild(SwaggerFormComponent) form: SwaggerFormComponent;
  private subscription: Subscription;

  constructor(protected dialogRef: DialogRef<any>,
              protected dialogContainer: CdkDialogContainer,
              @Inject(DIALOG_DATA) protected dialogData: any,
              private systemLang: SystemLang) {
    console.log('SimpleDialogComponent.constructor', dialogRef, dialogContainer, dialogData);
    this.needActionBlk = dialogRef.disableClose;
    if (dialogData instanceof ExtendedData) {
      this.needActionBlk = !!dialogData.action;
      this.swagger = dialogData.swagger;
      this.data = dialogData.data;
      this.icon = dialogData.icon;
      this.caption = dialogData.caption;
      this.action = dialogData.action;
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
      case 'save_cancel':
        this.btnCancel = this.systemLang.getTitle(DEF_TITLE_CANCEL);
        this.btnOk = this.systemLang.getTitle(DEF_TITLE_SAVE);
        break;
      case 'yes_no':
        this.btnCancel = this.systemLang.getTitle(DEF_TITLE_NO);
        this.btnOk = this.systemLang.getTitle(DEF_TITLE_YES);
        break;
      default:
        this.btnOk = this.systemLang.getTitle(DEF_TITLE_OK);
    }
  }
  cancel(): void {
    this.dialogRef.close();
  }
  save(): void {
    if (this.swagger) {
      console.log(this.form.formGroup.value);
      this.dialogRef.close(this.form.formGroup.value);
    }
  }
}
