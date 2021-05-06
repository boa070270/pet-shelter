import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicHTMLComponent } from './dynamic-html.component';

describe('DynamicHTMLComponent', () => {
  let component: DynamicHTMLComponent;
  let fixture: ComponentFixture<DynamicHTMLComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicHTMLComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicHTMLComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
