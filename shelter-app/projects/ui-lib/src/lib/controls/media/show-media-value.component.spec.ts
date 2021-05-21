import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowMediaValueComponent } from './show-media-value.component';

describe('ShowMediaValueComponent', () => {
  let component: ShowMediaValueComponent;
  let fixture: ComponentFixture<ShowMediaValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowMediaValueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowMediaValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
