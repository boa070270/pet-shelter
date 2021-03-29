import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'lib-advert',
  templateUrl: './advert.component.html',
  styleUrls: ['./advert.component.scss']
})
export class AdvertComponent implements OnInit {
  @Input() mimeType: string;
  @Input() mediaUrl: string;
  @Input() refUrl: string;
  @Input() tooltip: string;

  constructor() { }

  ngOnInit(): void {
    console.log('AdvertComponent', this.mimeType, this.mediaUrl, this.refUrl, this.tooltip);
  }

}
