import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnEditorComponent } from './column-editor.component';

describe('ColumnEditorComponent', () => {
  let component: ColumnEditorComponent;
  let fixture: ComponentFixture<ColumnEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColumnEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
