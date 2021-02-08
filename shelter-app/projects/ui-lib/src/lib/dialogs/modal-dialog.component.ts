import {Component, Inject} from '@angular/core';
import {
  CdkDialogContainer,
  DIALOG_CONTAINER,
  DIALOG_DATA,
  DIALOG_REF,
  DialogRef
} from '@angular/cdk-experimental/dialog';
import {SimpleDialogComponent} from './simple-dialog.component';
import {SystemLang} from "../i18n";

@Component({
  selector: 'lib-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.scss']
})
export class ModalDialogComponent extends SimpleDialogComponent {

  constructor(protected dialogRef: DialogRef<any>,
              protected dialogContainer: CdkDialogContainer,
              @Inject(DIALOG_DATA) protected dialogData: any,
              systemLang: SystemLang) {
    super(dialogRef, dialogContainer, dialogData, systemLang);
    console.log('ModalDialogComponent.constructor');
  }

}
