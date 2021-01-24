import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableControlComponent } from './table-control.component';

describe('TableControlComponent', () => {
  let component: TableControlComponent<any>;
  let fixture: ComponentFixture<TableControlComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
