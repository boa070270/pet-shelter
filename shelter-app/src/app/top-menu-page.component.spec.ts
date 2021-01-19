import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopMenuPageComponent } from './top-menu-page.component';

describe('TopMenuPageComponent', () => {
  let component: TopMenuPageComponent;
  let fixture: ComponentFixture<TopMenuPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopMenuPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopMenuPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
