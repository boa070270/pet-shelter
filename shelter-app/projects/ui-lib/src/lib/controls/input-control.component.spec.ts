import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {INPUT_VALUE_ACCESSOR, InputControlComponent} from './input-control.component';
import {ObtainSystemLanguageMock} from "../../../test/system-language-mock";
import {FormsModule} from "@angular/forms";

describe('InputControlComponent', () => {
  let component: InputControlComponent;
  let fixture: ComponentFixture<InputControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ InputControlComponent ],
      providers: [
        {provide: 'ObtainSystemLanguage', useClass: ObtainSystemLanguageMock}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  //   const e = fixture.nativeElement.querySelector('input');
  //   expect(e).toBeTruthy();
  // });

  it('should write value', () => {
    component.writeValue('abc');
    // component.type = 'number';
    fixture.detectChanges();
    expect(component.value).toBe('abc');
    const e = fixture.nativeElement.querySelector('input');
    console.log((e as HTMLInputElement).validity);
    expect((e as HTMLInputElement).validity).toBeTruthy();
  });
});
