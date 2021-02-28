import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwaggerArrayComponent } from './swagger-array.component';

describe('TableControlComponent', () => {
  let component: SwaggerArrayComponent;
  let fixture: ComponentFixture<SwaggerArrayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwaggerArrayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwaggerArrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
