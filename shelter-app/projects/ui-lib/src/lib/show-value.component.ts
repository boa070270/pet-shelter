import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {ShowMediaDialogComponent} from './show-media-dialog.component';
import {MatDialog} from '@angular/material/dialog';

export interface ShowMediaType {
  mediaType: string;
  mediaURI: string;
}

@Component({
  selector: 'lib-show-value',
  templateUrl: './show-value.component.html',
  styleUrls: ['./show-value.component.scss']
})
export class ShowValueComponent implements OnInit {

  @Input() row: ShowMediaType;
  @ViewChild('videoElement') videoElement: ElementRef<HTMLVideoElement>;
  type = '';
  mediaURI: string;
  mediaType: string;

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    if (this.row && this.row.mediaType && this.row.mediaType.indexOf('/') > 0){
      this.type = this.row.mediaType.substr(0, this.row.mediaType.indexOf('/'));
      this.mediaURI = this.row.mediaURI;
      this.mediaType = this.row.mediaType;
    }
  }
  play(): void {
    if (this.type === 'video' || this.type === 'image'){
      this.dialog.open(ShowMediaDialogComponent, {
        maxWidth: '70vh',
        maxHeight: '70vh',
        data: {
          mediaURI: this.mediaURI,
          mediaType: this.mediaType
        }
      });
    }
  }

  playVideo(): void {
    if (this.type === 'video') {
      this.videoElement.nativeElement.play().catch(e => {
        console.log(e);
      });
    }
  }

  stopVideo(): void {
    if (this.type === 'video') {
      this.videoElement.nativeElement.pause();
    }
  }

}
