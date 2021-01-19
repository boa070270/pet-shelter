import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'lib-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.scss']
})
export class ImageListComponent implements OnInit {
  @Input() files: {src: string, label: string}[];

  constructor() {
  }

  ngOnInit(): void {
  }

}
