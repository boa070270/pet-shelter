import {Component, Input, OnInit} from '@angular/core';
import {TitleType} from "./shared";

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

  actions: Array<{icon: string, tooltip: string | TitleType[], command: string}> = [
    {icon: 'gm-favorite_border', tooltip: 'Like', command: 'like'}, // gm-favorite toggle
    {icon: 'gm-bookmark', tooltip: 'Bookmark', command: 'bookmark'}
  ];

  constructor() { }

  ngOnInit(): void {
    console.log('AdvertComponent', this.mimeType, this.mediaUrl, this.refUrl, this.tooltip);
  }

}
