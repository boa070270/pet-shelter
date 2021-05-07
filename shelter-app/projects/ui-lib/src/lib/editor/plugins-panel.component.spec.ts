import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginsPanelComponent } from './plugins-panel.component';

describe('PluginsPanelComponent', () => {
  let component: PluginsPanelComponent;
  let fixture: ComponentFixture<PluginsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PluginsPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PluginsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
