import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
@Component({
  selector: 'lib-yes-no-dialog',
  templateUrl: './yes-no-dialog.component.html',
  styleUrls: ['./yes-no-dialog.component.scss']
})
export class YesNoDialogComponent {

  constructor(public dialogRef: MatDialogRef<YesNoDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {icon?: string; msg: string}) { }
  onNoClick(): void {
    this.dialogRef.close();
  }

  finish(): void {
    this.dialogRef.close(true);
  }
}
