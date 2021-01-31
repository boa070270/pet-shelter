import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestDynamicComponent } from './test-dynamic.component';

describe('TestDynamicComponent', () => {
  let component: TestDynamicComponent;
  let fixture: ComponentFixture<TestDynamicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestDynamicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestDynamicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
