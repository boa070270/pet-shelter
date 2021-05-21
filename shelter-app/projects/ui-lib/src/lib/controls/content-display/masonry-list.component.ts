import {Component, Input, OnInit, TemplateRef} from '@angular/core';
import {ComponentType} from '@angular/cdk/overlay';

@Component({
  selector: 'lib-masonry-list',
  templateUrl: './masonry-list.component.html',
  styleUrls: ['./masonry-list.component.scss']
})
export class MasonryListComponent<T> implements OnInit {
  @Input() portion: number;
  @Input() itemTemplate: ComponentType<T> | TemplateRef<T>;
  @Input() items: T[] = [];
  constructor() { }

  ngOnInit(): void {
  }

}
