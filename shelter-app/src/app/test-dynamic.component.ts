import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BasicService} from './basic.service';
import {DynamicPageComponent, SwaggerFormService, swaggerNative, SwaggerObject} from 'ui-lib';

@Component({
  selector: 'app-test-dynamic',
  templateUrl: './test-dynamic.component.html',
  styleUrls: ['./test-dynamic.component.sass']
})
export class TestDynamicComponent implements OnInit {
  textHtml: string;
  knownTexts = {
    a: '<span>Hello world!</span>',
    b: '<lib-generator-form #form swagger="test"></lib-generator-form>'
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

  constructor(private dynamicSwagger: SwaggerFormService) {
    dynamicSwagger.addSchemaIfNotExists('test', this.swagger);
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
