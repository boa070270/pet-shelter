import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowMediaDialogComponent } from './show-media-dialog.component';

describe('ShowMediaDialogComponent', () => {
  let component: ShowMediaDialogComponent;
  let fixture: ComponentFixture<ShowMediaDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowMediaDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowMediaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
