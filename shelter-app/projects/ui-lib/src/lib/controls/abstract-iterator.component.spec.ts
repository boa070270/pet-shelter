import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractIteratorComponent } from './abstract-iterator.component';

describe('AbstractIteratorComponent', () => {
  let component: AbstractIteratorComponent;
  let fixture: ComponentFixture<AbstractIteratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbstractIteratorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbstractIteratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
