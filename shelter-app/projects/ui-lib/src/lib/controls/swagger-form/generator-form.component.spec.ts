import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratorFormComponent } from './generator-form.component';

describe('DynamicFormComponent', () => {
  let component: GeneratorFormComponent;
  let fixture: ComponentFixture<GeneratorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneratorFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneratorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
