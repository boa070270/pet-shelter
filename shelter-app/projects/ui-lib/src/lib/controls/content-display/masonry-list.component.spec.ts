import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasonryListComponent } from './masonry-list.component';

describe('MasonryListComponent', () => {
  let component: MasonryListComponent<any>;
  let fixture: ComponentFixture<MasonryListComponent<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasonryListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasonryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
