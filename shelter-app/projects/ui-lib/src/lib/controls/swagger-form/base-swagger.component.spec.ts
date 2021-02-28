import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseSwaggerComponent } from './base-swagger.component';

describe('BaseSwaggerComponent', () => {
  let component: BaseSwaggerComponent;
  let fixture: ComponentFixture<BaseSwaggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseSwaggerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseSwaggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
