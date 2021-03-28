import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestSyncComponent } from './test-sync.component';

describe('TestSyncComponent', () => {
  let component: TestSyncComponent;
  let fixture: ComponentFixture<TestSyncComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestSyncComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestSyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
