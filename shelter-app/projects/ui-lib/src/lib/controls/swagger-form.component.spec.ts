import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwaggerFormComponent } from './swagger-form.component';

describe('SwaggerFormComponent', () => {
  let component: SwaggerFormComponent;
  let fixture: ComponentFixture<SwaggerFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwaggerFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwaggerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
