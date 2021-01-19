import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldsTableComponent } from './fields-table.component';

describe('FieldsTableComponent', () => {
  let component: FieldsTableComponent;
  let fixture: ComponentFixture<FieldsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
