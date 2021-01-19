import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LengthenListComponent } from './lengthen-list.component';

describe('LengthenListComponent', () => {
  let component: LengthenListComponent;
  let fixture: ComponentFixture<LengthenListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LengthenListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LengthenListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
