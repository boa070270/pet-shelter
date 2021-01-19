import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BannersTableComponent } from './banners-table.component';

describe('BannersTableComponent', () => {
  let component: BannersTableComponent;
  let fixture: ComponentFixture<BannersTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BannersTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BannersTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
