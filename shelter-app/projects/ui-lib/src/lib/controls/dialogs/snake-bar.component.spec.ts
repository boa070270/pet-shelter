import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnakeBarComponent } from './snake-bar.component';

describe('SnakeBarComponent', () => {
  let component: SnakeBarComponent;
  let fixture: ComponentFixture<SnakeBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SnakeBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SnakeBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
