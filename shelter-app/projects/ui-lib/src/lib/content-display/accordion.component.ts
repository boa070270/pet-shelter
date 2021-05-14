import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'lib-accordion',
  template: `<div class="accordion">
    <ng-container *ngFor="let a of accs">
      <input type="checkbox" name="panel" [id]="a.id">
      <label for="a.id">{{a.label}}</label>
      <div class="accordion-content">
        {{a.data}}
        <ng-content></ng-content>
      </div>
    </ng-container>
  </div>`,
  styleUrls: ['./accordion.component.scss']
})
export class AccordionComponent implements OnInit {

  @Input() accs;

  constructor() { }

  ngOnInit(): void {
  }

}
