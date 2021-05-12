import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwaggerNativeComponent } from './swagger-native.component';
import {ObtainSystemLanguageMock} from "../../../../test/system-language-mock";
import {SwaggerNative} from "../../shared";

describe('SwaggerControlComponent', () => {
  let component: SwaggerNativeComponent;
  let fixture: ComponentFixture<SwaggerNativeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwaggerNativeComponent ],
      providers: [
        {provide: 'ObtainSystemLanguage', useClass: ObtainSystemLanguageMock},
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwaggerNativeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.swagger = SwaggerNative.asString();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
