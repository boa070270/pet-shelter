import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DsDataComponent } from './ds-data.component';

describe('DsDataComponent', () => {
  let component: DsDataComponent;
  let fixture: ComponentFixture<DsDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DsDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DsDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
