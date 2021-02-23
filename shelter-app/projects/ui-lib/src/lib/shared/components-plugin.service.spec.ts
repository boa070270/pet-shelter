import { TestBed } from '@angular/core/testing';

import { ComponentsPluginService } from './components-plugin.service';

describe('ComponentRepositoryService', () => {
  let service: ComponentsPluginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComponentsPluginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
