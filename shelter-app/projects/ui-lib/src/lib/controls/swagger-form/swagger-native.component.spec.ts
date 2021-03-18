import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwaggerNativeComponent } from './swagger-native.component';

describe('SwaggerControlComponent', () => {
  let component: SwaggerNativeComponent;
  let fixture: ComponentFixture<SwaggerNativeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwaggerNativeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwaggerNativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
