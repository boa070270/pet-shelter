import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwaggerBuilderComponent } from './swagger-builder.component';

describe('SwaggerBuilderComponent', () => {
  let component: SwaggerBuilderComponent;
  let fixture: ComponentFixture<SwaggerBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwaggerBuilderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwaggerBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
