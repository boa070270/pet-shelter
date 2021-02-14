import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {SimpleDialogComponent} from './simple-dialog.component';
import {CdkDialogContainer, DIALOG_DATA, DialogRef} from '../dialog-service';
import {SystemLang} from '../i18n';

@Component({
  selector: 'lib-snake-bar',
  templateUrl: './snake-bar.component.html',
  styleUrls: ['./simple-dialog.component.scss']
})
export class SnakeBarComponent extends SimpleDialogComponent implements OnDestroy {

  constructor(protected dialogRef: DialogRef<any>,
              protected dialogContainer: CdkDialogContainer,
              @Inject(DIALOG_DATA) protected dialogData: any,
              protected systemLang: SystemLang) {
    super(dialogRef, dialogContainer, dialogData, systemLang);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

}
