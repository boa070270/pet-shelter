import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabletPetComponent } from './tablet-pet.component';

describe('TabletPetComponent', () => {
  let component: TabletPetComponent;
  let fixture: ComponentFixture<TabletPetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabletPetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabletPetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
