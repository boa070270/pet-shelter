import {Component, OnInit} from '@angular/core';
import {DialogService} from '../../dialog-service';

@Component({
  selector: 'lib-show-media-value',
  templateUrl: './show-media-value.component.html',
  styleUrls: ['./show-media-value.component.scss']
})
export class ShowMediaValueComponent implements OnInit {

  data: any;
  mediaURI: string;
  mediaType: string;

  constructor(private dialog: DialogService) { }

  ngOnInit(): void {
    this.mediaURI = this.data.value;
    this.mediaType = this.data.mediaType;
  }

  play(): void {
    this.dialog.open(ShowMediaValueComponent, {
      width: '100%',
      data: {
        mediaURI: this.mediaURI,
        mediaType: this.mediaType
      }
    });
  }

}
