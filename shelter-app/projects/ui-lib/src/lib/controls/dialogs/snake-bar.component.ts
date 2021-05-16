import {Component, OnDestroy, ViewContainerRef} from '@angular/core';
import {SimpleDialogComponent} from './simple-dialog.component';
import {CdkDialogContainer, DialogRef} from '../../dialog-service';

@Component({
  selector: 'lib-snake-bar',
  templateUrl: './snake-bar.component.html',
  styleUrls: ['./simple-dialog.component.scss']
})
export class SnakeBarComponent extends SimpleDialogComponent implements OnDestroy {

  constructor(protected dialogRef: DialogRef<any>,
              protected dialogContainer: CdkDialogContainer,
              protected _view: ViewContainerRef) {
    super(dialogRef, dialogContainer, _view);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

}
