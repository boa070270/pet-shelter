import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LangTableComponent } from './lang-table.component';

describe('LangTableComponent', () => {
  let component: LangTableComponent;
  let fixture: ComponentFixture<LangTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LangTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LangTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
