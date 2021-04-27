import {Component, Input, OnInit} from '@angular/core';
import {TitleType} from "./shared";
import {CardActions} from "./controls/card/card-actions.component";

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

  actions: CardActions[] = [
    {icon: 'gm-favorite_border', tooltip: 'Like', command: 'like', toggle: {icon: 'gm-favorite'}},
    {icon: 'gm-bookmark_border', tooltip: 'Bookmark', command: 'bookmark', toggle: {icon: 'gm-bookmark'}}
  ];

  constructor() { }

  ngOnInit(): void {
    console.log('AdvertComponent', this.mimeType, this.mediaUrl, this.refUrl, this.tooltip);
  }

}
