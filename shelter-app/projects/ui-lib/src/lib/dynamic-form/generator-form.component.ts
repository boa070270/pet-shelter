import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'lib-generator-form',
  // templateUrl: './generator-form.component.html',
  template: `
    <div class="ui-dynamic-form">
      <h3>Developing form</h3>
      <ng-template [libDynamicForm]="swagger"></ng-template>
    </div>`,
  styleUrls: ['./generator-form.component.scss']
})
export class GeneratorFormComponent implements OnInit {
  @Input() swagger: string;
  constructor() { }

  ngOnInit(): void {
  }

}
