import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwaggerArrayComponent } from './swagger-array.component';
import {ObtainSystemLanguageMock} from "../../../../test/system-language-mock";
import {EXT_SYSTEM_LANG, SwaggerArray, SwaggerNative, SwaggerNativeString, SwaggerObject} from "../../shared";
import {logger} from "codelyzer/util/logger";

describe('TableControlComponent', () => {
  let component: SwaggerArrayComponent;
  let fixture: ComponentFixture<SwaggerArrayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwaggerArrayComponent ],
      providers: [
        {provide: EXT_SYSTEM_LANG, useClass: ObtainSystemLanguageMock},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwaggerArrayComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.swagger = new SwaggerArray(SwaggerNative.asString());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('should create', () => {
    it('string input', () => {
      component.swagger = new SwaggerArray(SwaggerNative.asString());
      fixture.detectChanges();
      expect(component.controlType).toBe('native');
      expect(component.items.constrictions.control).toBe('lib-input-control');
      expect((component.items as SwaggerNative).type).toBe('string');
    });

    it('boolean', () => {
      component.swagger = new SwaggerArray(SwaggerNative.asBoolean());
      fixture.detectChanges();
      expect(component.controlType).toBe('native');
      expect(component.items.constrictions.control).toBe('boolean');
      expect((component.items as SwaggerNative).type).toBe('boolean');
    });

    it('number', () => {
      component.swagger = new SwaggerArray(SwaggerNative.asNumber());
      fixture.detectChanges();
      expect(component.controlType).toBe('native');
      expect(component.items.constrictions.control).toBe('input');
      expect((component.items as SwaggerNative).type).toBe('number');
    });

    it('object', () => {
      const orderCtrl = ['a', 'b', 'c'];
      const props = {a: SwaggerNative.asString(), b: SwaggerNative.asString(), c: SwaggerNative.asString()};
      component.swagger = new SwaggerArray(new SwaggerObject(orderCtrl, props));
      fixture.detectChanges();
      expect(component.controlType).toBe('object');
      expect((component.items as SwaggerObject).orderControls).toBe(orderCtrl);
      expect((component.items as SwaggerObject).properties).toBe(props);
    });
  });
});
