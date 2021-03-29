import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-slide-container',
  template: `<div class="slide-container">
    <ng-content select="lib-slide"></ng-content>
  </div>`,
  styleUrls: ['./slide-container.component.scss']
})
export class SlideContainerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
