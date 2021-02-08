import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCdkComponent } from './table-cdk.component';

describe('TableCdkComponent', () => {
  let component: TableCdkComponent;
  let fixture: ComponentFixture<TableCdkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableCdkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCdkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
