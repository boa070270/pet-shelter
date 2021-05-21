import { TestBed } from '@angular/core/testing';

import { VisibilityChangeService } from './visibility-change.service';

describe('VisibilityChangeService', () => {
  let service: VisibilityChangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisibilityChangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
