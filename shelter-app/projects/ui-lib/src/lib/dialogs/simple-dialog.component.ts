import {Component, Inject, OnDestroy, ViewChild} from '@angular/core';
import {CdkDialogContainer, DIALOG_DATA, DialogRef} from '@angular/cdk-experimental/dialog';
import {SystemLang} from '../i18n';
import {SwaggerObject, TitleType, ActionType, ExtendedData} from '../shared';
import {SwaggerFormComponent} from '../swagger-form';
import {Subscription} from 'rxjs';

const DEF_TITLE_OK: TitleType[] = [{lang: 'en', title: 'Ok'}, {lang: 'uk', title: 'Tak'}];
const DEF_TITLE_CANCEL: TitleType[] = [{lang: 'en', title: 'Cancel'}, {lang: 'uk', title: 'Відміна'}];
const DEF_TITLE_YES: TitleType[] = [{lang: 'en', title: 'Yes'}, {lang: 'uk', title: 'Tak'}];
const DEF_TITLE_NO: TitleType[] = [{lang: 'en', title: 'No'}, {lang: 'uk', title: 'Ні'}];
const DEF_TITLE_SAVE: TitleType[] = [{lang: 'en', title: 'Save'}, {lang: 'uk', title: 'Зберегти'}];

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
  caption: string;
  btnOk: string;
  btnCancel: string;
  iconClasses: any;
  @ViewChild(SwaggerFormComponent) form: SwaggerFormComponent;
  private subscription: Subscription;
  icon: any;

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
      this.caption = dialogData.caption;
      this.action = dialogData.action;
      this.iconClasses = {};
      if (dialogData.icon) {
        this.iconClasses[dialogData.icon] = true;
        this.icon = dialogData.icon;
      }
      if (dialogData.iconColor) {
        this.iconClasses[dialogData.iconColor] = true;
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
      if (this.form.formGroup.valid) {
        console.log('SimpleDialogComponent.save', this.form.formGroup.value);
        this.dialogRef.close(this.form.formGroup.value);
      }
    }
  }
}
