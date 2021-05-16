import {Component, OnDestroy, ViewChild, ViewContainerRef} from '@angular/core';
import {ActionType, ExtendedData, I18N_CFG, I18NType, SwaggerObject, TitleBarData} from '../../shared';
import {SwaggerFormComponent} from '../swagger-form/';
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
  styleUrls: ['./simple-dialog.component.scss'],
  providers: [
    {provide: I18N_CFG, useValue: I18N}
  ]
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
  titleBar: TitleBarData;
  @ViewChild(SwaggerFormComponent) form: SwaggerFormComponent;
  private subscription: Subscription;
  private offset: {top: number, left: number};
  protected dialogData: any;

  constructor(protected dialogRef: DialogRef<any>,
              protected dialogContainer: CdkDialogContainer,
              protected _view: ViewContainerRef) {
    super(_view);
    this.dialogData = this._view.injector.get(DIALOG_DATA);
    this.needActionBlk = dialogRef.disableClose;
    if (this.dialogData instanceof ExtendedData) {
      this.needActionBlk = !!this.dialogData.action;
      this.swagger = this.dialogData.swagger;
      this.data = this.dialogData.data;
      this.caption = this.dialogData.caption;
      this.action = this.dialogData.action;
      this.disabled = this.dialogData.readOnly;
      this.iconClasses = {};
      this.dialogBorderClass = 'border-dialog';
      if (this.dialogData.icon) {
        this.iconClasses[this.dialogData.icon] = true;
      }
      if (this.dialogData.iconColor) {
        this.iconClasses[this.dialogData.iconColor] = true;
        this.dialogBorderClass = 'border-' + this.dialogData.iconColor;
      }
      this.titleBar = this.dialogData.titleBar;
    } else {
      this.data = this.dialogData;
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
  customAction(cmd: string): void {
    this.titleBar.customActions.emitter.next(cmd);
  }

  startDrag(event: MouseEvent): void {
    if (this.dialogRef) {
      const rect = this.dialogRef._overlayRef.overlayElement.getBoundingClientRect();
      this.offset = {top: event.clientY - rect.top, left: event.clientX - rect.left};
    }
    event.preventDefault();
  }
  dragDialog(event: MouseEvent): void {
    if (this.dialogRef && this.offset) {
      this.dialogRef.updatePosition({top: event.clientY - this.offset.top + 'px', left: event.clientX - this.offset.left + 'px'});
    }
    event.preventDefault();
  }
  endDrag(): void {
    this.offset = null;
  }
}
