import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'lib-ok-dialog',
  templateUrl: './ok-dialog.component.html',
  styleUrls: ['./ok-dialog.component.css']
})
export class OkDialogComponent {

  constructor(public dialogRef: MatDialogRef<OkDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {icon?: string; msg: string}) { }

  onClick(): void {
    this.dialogRef.close();
  }

}
