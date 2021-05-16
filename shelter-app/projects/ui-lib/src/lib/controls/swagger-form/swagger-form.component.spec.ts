import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwaggerFormComponent } from './swagger-form.component';
import {EXT_SYSTEM_LANG, SwaggerArray, SwaggerNative, SwaggerObject} from "../../shared";
import {ObtainSystemLanguageMock} from "../../../../test/system-language-mock";

describe('SwaggerFormComponent', () => {
  let component: SwaggerFormComponent;
  let fixture: ComponentFixture<SwaggerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwaggerFormComponent ],
      providers: [
        {provide: EXT_SYSTEM_LANG, useClass: ObtainSystemLanguageMock},
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwaggerFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.swagger = new SwaggerObject([], {});
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('should draw', () => {
    it('native', () => {
      component.swagger = new SwaggerObject(['prop1'], {prop1: SwaggerNative.asString()});
      fixture.detectChanges();
      const e = fixture.nativeElement.querySelector('lib-swagger-native');
      expect(e).toBeTruthy();
    });

    it('array', () => {
      component.swagger = new SwaggerObject(['prop1'], {prop1: new SwaggerArray(SwaggerNative.asString())});
      fixture.detectChanges();
      const e = fixture.nativeElement.querySelector('lib-swagger-array');
      expect(e).toBeTruthy();
    });

    it('object', () => {
      component.swagger = new SwaggerObject(['prop1'], {prop1: new SwaggerObject(
          ['prop2'], {prop2: SwaggerNative.asString()})});
      fixture.detectChanges();
      const e = fixture.nativeElement.querySelectorAll('lib-swagger-form');
      expect(e.length).toBe(1);
      const native = fixture.nativeElement.querySelector('lib-swagger-native');
      expect(native).toBeTruthy();
    });
  });

});
