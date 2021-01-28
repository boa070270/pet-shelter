import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleTypeControlComponent } from './title-type-control.component';

describe('TitleTypeControlComponent', () => {
  let component: TitleTypeControlComponent;
  let fixture: ComponentFixture<TitleTypeControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TitleTypeControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TitleTypeControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
