import {Component, Inject, OnDestroy} from '@angular/core';
import {SimpleDialogComponent} from './simple-dialog.component';
import {SystemLang} from '../../i18n';
import {DictionaryService, RootPageService} from '../../shared';
import {DialogRef, CdkDialogContainer, DIALOG_DATA} from '../../dialog-service';

@Component({
  selector: 'lib-snake-bar',
  templateUrl: './snake-bar.component.html',
  styleUrls: ['./simple-dialog.component.scss']
})
export class SnakeBarComponent extends SimpleDialogComponent implements OnDestroy {

  constructor(protected dialogRef: DialogRef<any>,
              protected dialogContainer: CdkDialogContainer,
              @Inject(DIALOG_DATA) protected dialogData: any,
              public systemLang: SystemLang, protected rootPage: RootPageService,
              protected dictionary: DictionaryService) {
    super(dialogRef, dialogContainer, dialogData, systemLang, rootPage, dictionary);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

}
