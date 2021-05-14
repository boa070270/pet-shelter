import { TestBed } from '@angular/core/testing';

import { RootPageService } from './root-page.service';

describe('RootPageService', () => {
  let service: RootPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RootPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
