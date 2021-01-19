import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'lib-show-media-dialog',
  templateUrl: './show-media-dialog.component.html',
  styleUrls: ['./show-media-dialog.component.scss']
})
export class ShowMediaDialogComponent {

  mediaURI: string;
  mediaType: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.mediaURI = data.mediaURI;
    this.mediaType = data.mediaType;
  }

}
