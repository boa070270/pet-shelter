import { TestBed } from '@angular/core/testing';

import { FormsConfigurationService } from './forms-configuration.service';

describe('FormsConfigurationService', () => {
  let service: FormsConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormsConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
