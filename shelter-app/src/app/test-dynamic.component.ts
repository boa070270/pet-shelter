import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BasicService} from './basic.service';
import {DynamicPageComponent, SwaggerFormService, swaggerNative, SwaggerObject} from 'ui-lib';

@Component({
  selector: 'app-test-dynamic',
  // templateUrl: './test-dynamic.component.html',
  template: `
    <div>
      <h1>Dynamic page</h1>
      <div #insertHere></div>
      <lib-dynamic-page>

      </lib-dynamic-page>
      <textarea [(ngModel)]="textHtml"></textarea>
      <select [(ngModel)]="knownText" (change)="onChange()">
        <option value="a">Text Hello</option>
        <option value="b">Generator form</option>
        <option value="c">Swagger form</option>
      </select>
      <button (click)="onClick()">Render</button>
    </div>
  `,
  styleUrls: ['./test-dynamic.component.sass']
})
export class TestDynamicComponent implements OnInit {
  textHtml: string;
  knownTexts = {
    a: '<span>Hello world!</span>',
    b: '<lib-generator-form-element #form swagger="test"></lib-generator-form-element>',
    // c: '<lib-swagger-form swagger=""></lib-swagger-form>'
  };
  knownText: any;
  swagger: SwaggerObject = {
    orderControls: ['id', 'description', 'child'],
    properties: {
      id: swaggerNative('string'),
      description: swaggerNative('string'),
      child: {
        orderControls: ['childId', 'childDescription', 'sex'],
        properties: {
          childId: swaggerNative('string'),
          childDescription: swaggerNative('string'),
          sex: swaggerNative('string', null, {enums: ['m', 'f']})
        }
      }
    }
  };
  @ViewChild('insertHere', {static: true}) insertHere: ElementRef<HTMLDivElement>;
  innerHtml: any;

  constructor(private swaggerFormService: SwaggerFormService) {
    swaggerFormService.addSchemaIfNotExists('test', this.swagger);
  }

  ngOnInit(): void {
  }

  onClick(): void {
    this.insertHere.nativeElement.innerHTML = this.textHtml;
    this.innerHtml = this.textHtml;
  }

  onChange(): void {
    this.textHtml = this.knownTexts[this.knownText];
  }
}
