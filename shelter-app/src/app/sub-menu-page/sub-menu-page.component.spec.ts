import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubMenuPageComponent } from './sub-menu-page.component';

describe('SubMenuPageComponent', () => {
  let component: SubMenuPageComponent;
  let fixture: ComponentFixture<SubMenuPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubMenuPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubMenuPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
