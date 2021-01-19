import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabletPageComponent } from './tablet-page.component';

describe('TabletPageComponent', () => {
  let component: TabletPageComponent;
  let fixture: ComponentFixture<TabletPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabletPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabletPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
