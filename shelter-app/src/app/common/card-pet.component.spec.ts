import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPetComponent } from './card-pet.component';

describe('CardPetComponent', () => {
  let component: CardPetComponent;
  let fixture: ComponentFixture<CardPetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardPetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardPetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
