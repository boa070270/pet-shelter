import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextareaControlComponent } from './textarea-control.component';

describe('TextareaControlComponent', () => {
  let component: TextareaControlComponent;
  let fixture: ComponentFixture<TextareaControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TextareaControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextareaControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
